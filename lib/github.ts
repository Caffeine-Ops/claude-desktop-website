/*
  ─────────────────────────────────────────────────────────────
  从 GitHub 取「最新版安装包」。纯浏览器端，不需要后端。
  ─────────────────────────────────────────────────────────────
  为什么这样做：发版时官网零改动。GitHub 上一发新 Release，官网下次加载就自动
  显示新版本号和新安装包地址——不用每次发版还记得回来改一遍链接。

  代价是：官网多了一个「依赖别人服务」的地方。GitHub 会超时、会限流、会挂。
  所以下面每一步都带兜底——韧性四件套（超时 / 降级 / 限流缓解 / 容错）：

  1. 超时     —— 5 秒不回就放弃，绝不让页面吊在那儿转圈。
  2. 降级     —— 拿不到就退回静态的 releases/latest 地址，用户照样下得到，
                 只是看不到版本号和文件大小这些细节。
  3. 限流缓解 —— GitHub 匿名接口每 IP 每小时只给 60 次。结果在 localStorage
                 存 1 小时，同一个人反复刷新不会把额度烧光。
  4. 容错     —— 某个平台这次没打出安装包时，那张卡自己退成「去 Releases 页面」，
                 而不是给一个点了 404 的按钮。
*/

import { site } from './content'

const API = 'https://api.github.com/repos/Caffeine-Ops/claude-desktop-releases/releases/latest'
const TIMEOUT_MS = 5_000
// 换过发布仓库（claude-desktop → claude-desktop-releases）后把 key 加了 -v2：
// 老 key 存的是旧仓库 v0.0.16 的数据，先读缓存的逻辑会一直拿它挡住新版本。
// 改名 = 所有旧缓存当场作废，每个访客下次打开都重新抓新仓库的最新版。
const CACHE_KEY = 'cd-latest-release-v2'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 小时

/** GitHub 返回的一个安装包资产。字段名跟着 GitHub 的 JSON 走。 */
type Asset = {
  name: string
  browser_download_url: string
  size: number
}

type ReleaseResponse = {
  tag_name: string
  published_at: string
  assets: Asset[]
}

/** 我们真正关心的那一小撮字段。缓存里存的也是这个精简版。 */
export type Release = {
  version: string
  publishedAt: string
  assets: Asset[]
}

export type PlatformKey = 'mac-arm' | 'mac-intel' | 'win' | 'linux'

export type PlatformCard = {
  key: PlatformKey
  /** 直链地址。匹配不到资产的平台压根不会出现在结果里，所以这里一定是真地址。 */
  href: string
  sizeMB: number | null
}

/*
  资产文件名匹配规则。以 v0.0.37 的真实产物对照过（仓库 claude-desktop-releases）：
    Claude-Desktop-0.0.37-arm64-mac.dmg      ← mac Apple 芯片
    Claude-Desktop-0.0.37-x64-mac.dmg        ← mac Intel 芯片
    Claude-Desktop-0.0.37-x64.exe            ← Windows
  注意排除 .blockmap、*.zip 和 latest*.yml——那是 electron 自动更新用的，不是给人下的。
  Intel Mac / Linux 的规则先写着：哪天真打出这些包，官网自动多出卡片，不用改代码。

  这里只管「怎么认出安装包」，不管「界面上叫什么」——平台的显示名是文案，
  归 content.ts 管（它得中英两份）。数据层里混进中文界面文字，英文版就会漏出中文。
*/
const MATCHERS: { key: PlatformKey; test: (name: string) => boolean }[] = [
  { key: 'mac-arm', test: (n) => /-arm64-mac\.dmg$/i.test(n) },
  { key: 'mac-intel', test: (n) => /-x64-mac\.dmg$/i.test(n) },
  { key: 'win', test: (n) => /\.exe$/i.test(n) && !/\.blockmap$/i.test(n) },
  { key: 'linux', test: (n) => /\.(AppImage|deb)$/i.test(n) },
]

function readCache(): Release | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw) as { at: number; data: Release }
    if (Date.now() - at > CACHE_TTL_MS) return null
    return data
  } catch {
    // localStorage 可能被隐私模式禁掉，或者存的旧格式解析不了。
    // 读缓存失败不是错误，只是「这次得走网络」。别让它把页面搞崩。
    return null
  }
}

function writeCache(data: Release) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    // 存不进去（配额满 / 隐私模式）就算了，只是下次还得走一次网络。
  }
}

/**
 * 取最新 Release。永远不抛异常——拿不到就返回 null，由调用方走降级路径。
 * 调用方拿到 null 时该做的事：把按钮指向 releases/latest，不显示版本号。
 */
export async function fetchLatestRelease(): Promise<Release | null> {
  const cached = readCache()
  if (cached) return cached

  // AbortController 是浏览器内置的「取消遥控器」：把它的 signal 交给 fetch，
  // 之后按一下 abort()，这个请求就当场作废。fetch 自己没有超时选项，得这么配。
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(API, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null // 限流(403)、仓库不可见(404) 等——一律走降级，不区分

    const json = (await res.json()) as ReleaseResponse
    const data: Release = {
      version: json.tag_name,
      publishedAt: json.published_at,
      assets: (json.assets ?? []).map((a) => ({
        name: a.name,
        browser_download_url: a.browser_download_url,
        size: a.size,
      })),
    }
    writeCache(data)
    return data
  } catch {
    // 超时被 abort、断网、CORS——从用户角度都是同一件事：「这次没拿到」。
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 把 Release 的资产列表翻译成页面要摆的平台卡。
 * 只返回真的打出了安装包的平台——不给用户看点不了的按钮。
 */
export function getPlatformCards(release: Release | null): PlatformCard[] {
  if (!release) return []

  const cards: PlatformCard[] = []
  for (const m of MATCHERS) {
    const asset = release.assets.find((a) => m.test(a.name))
    if (!asset) continue // 这次没打这个平台的包，这张卡就不存在
    cards.push({
      key: m.key,
      href: asset.browser_download_url,
      sizeMB: Math.round(asset.size / 1024 / 1024),
    })
  }
  return cards
}

/** 猜访客的系统，用来高亮主推的那张卡。猜不到就返回 null——猜不准不如不猜。 */
export function guessPlatform(): PlatformKey | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/Mac/i.test(ua)) return 'mac-arm'
  if (/Win/i.test(ua)) return 'win'
  if (/Linux|X11/i.test(ua)) return 'linux'
  return null
}

/** 兜底卡：一个 Release 都读不到时摆的东西。用户点了照样能下到最新版。 */
export const FALLBACK_HREF = site.latestReleaseUrl

export function formatDate(iso: string, lang: 'zh' | 'en'): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
  })
}

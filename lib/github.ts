/*
  ─────────────────────────────────────────────────────────────
  「最新版安装包」的数据来源。
  ─────────────────────────────────────────────────────────────
  原来这里是「浏览器端现查 GitHub 接口」——发版零改动、自动显示新版本。
  但那套的前提是「访客能连上 GitHub」。本站部署在国内自有服务器、面向公司内网
  访问,api.github.com 基本连不通:每次都 5 秒超时 → 落到兜底页,而且安装包本身
  也在 GitHub 上,国内点了下不动。

  所以改成「写死 + 自托管」:
  - 版本信息(版本号 / 发布日期 / 各平台安装包)直接写在下面的 STATIC_RELEASE,
    不再走网络,页面永远是 ready 态,不再闪兜底页。
  - 安装包放到本服务器的 /downloads/ 目录(nginx 直接提供),下载链接是站内相对
    路径,国内同事看得到版本、也真能下到包。

  代价:发新版时得手动更新——把新安装包传到服务器,并改一下 STATIC_RELEASE 里的
  版本号 / 文件名 / 大小。这是拿「自动更新」换「国内可用」,对内部使用是划算的。
  (更新流程已固化成一条命令,见部署记录。)
*/

/** GitHub 返回的一个安装包资产。字段名沿用 GitHub 的 JSON 命名,方便对照。 */
type Asset = {
  name: string
  browser_download_url: string
  size: number
}

/** 我们真正关心的那一小撮字段。 */
export type Release = {
  version: string
  publishedAt: string
  assets: Asset[]
}

export type PlatformKey = 'mac-arm' | 'mac-intel' | 'win' | 'linux'

export type PlatformCard = {
  key: PlatformKey
  /** 直链地址。匹配不到资产的平台压根不会出现在结果里,所以这里一定是真地址。 */
  href: string
  sizeMB: number | null
}

/*
  当前对外提供的版本。发新版时改这里(并把新包传到服务器 /var/www/downloads/)。
  - 文件名沿用 GitHub Release 上的原名,方便对照。
  - size 是精确字节数,页面上会换算成 MB。
  - browser_download_url 是站内相对路径:部署在哪个域名/端口都不用改,
    以后加了域名也自动跟着走。
  资产来自发布仓库 claude-desktop-releases 的 v0.0.37:
    Claude-Desktop-0.0.37-arm64-mac.dmg  ← mac Apple 芯片
    Claude-Desktop-0.0.37-x64-mac.dmg    ← mac Intel 芯片
    Claude-Desktop-0.0.37-x64.exe        ← Windows
*/
const STATIC_RELEASE: Release = {
  version: 'v0.0.37',
  publishedAt: '2026-07-19T08:31:18Z',
  assets: [
    {
      name: 'Claude-Desktop-0.0.37-arm64-mac.dmg',
      browser_download_url: '/downloads/Claude-Desktop-0.0.37-arm64-mac.dmg',
      size: 730392824,
    },
    {
      name: 'Claude-Desktop-0.0.37-x64-mac.dmg',
      browser_download_url: '/downloads/Claude-Desktop-0.0.37-x64-mac.dmg',
      size: 746084198,
    },
    {
      name: 'Claude-Desktop-0.0.37-x64.exe',
      browser_download_url: '/downloads/Claude-Desktop-0.0.37-x64.exe',
      size: 758301215,
    },
  ],
}

/*
  资产文件名 → 平台。只管「怎么认出安装包」,不管界面上叫什么(显示名是文案,
  归 content.ts 管,它要中英两份;数据层混进中文,英文版就会漏中文)。
  Intel Mac / Linux 的规则先留着:哪天补了这些包,页面自动多出卡片,不用改代码。
*/
const MATCHERS: { key: PlatformKey; test: (name: string) => boolean }[] = [
  { key: 'mac-arm', test: (n) => /-arm64-mac\.dmg$/i.test(n) },
  { key: 'mac-intel', test: (n) => /-x64-mac\.dmg$/i.test(n) },
  { key: 'win', test: (n) => /\.exe$/i.test(n) && !/\.blockmap$/i.test(n) },
  { key: 'linux', test: (n) => /\.(AppImage|deb)$/i.test(n) },
]

/**
 * 取最新 Release。现在是直接返回写死的数据(不走网络),但保留 async 签名和
 * 「拿不到就返回 null」的约定,调用方(useRelease)一行都不用改。
 */
export async function fetchLatestRelease(): Promise<Release | null> {
  return STATIC_RELEASE
}

/**
 * 把 Release 的资产列表翻译成页面要摆的平台卡。
 * 只返回真的有安装包的平台——不给用户看点不了的按钮。
 */
export function getPlatformCards(release: Release | null): PlatformCard[] {
  if (!release) return []

  const cards: PlatformCard[] = []
  for (const m of MATCHERS) {
    const asset = release.assets.find((a) => m.test(a.name))
    if (!asset) continue // 这次没这个平台的包,这张卡就不存在
    cards.push({
      key: m.key,
      href: asset.browser_download_url,
      sizeMB: Math.round(asset.size / 1024 / 1024),
    })
  }
  return cards
}

/**
 * 兜底下载地址:首屏主按钮在「猜不到系统 / 没匹配到对应安装包」时退到这里。
 * 指向服务器的 /downloads/ 目录(nginx 开了 autoindex,是个可浏览的文件列表),
 * 用户到那儿自己挑一个包下。
 */
export const FALLBACK_HREF = '/downloads/'

/** 猜访客的系统,用来高亮主推的那张卡。猜不到就返回 null——猜不准不如不猜。 */
export function guessPlatform(): PlatformKey | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/Mac/i.test(ua)) return 'mac-arm'
  if (/Win/i.test(ua)) return 'win'
  if (/Linux|X11/i.test(ua)) return 'linux'
  return null
}

export function formatDate(iso: string, lang: 'zh' | 'en'): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
  })
}

'use client'

/*
  第一屏（Linear intake 式铺满版）。
  背景是铺满的 3D 倾斜卡片墙（HeroWall），文案单栏压在左侧、用毛玻璃 +
  两层遮罩托底可读性。真实下载按钮（磁性）。终端演示已移到第二屏独立
  成节（app/page.tsx）——第一屏只讲清「一句话」这件事。
  主按钮的数据链路沿用旧版三态（loading / 直链 / 降级到 Releases）。
*/

import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { hero, site } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useRelease } from '@/lib/useRelease'
import { getPlatformCards, guessPlatform, FALLBACK_HREF } from '@/lib/github'
import { Magnetic } from '../fx/Magnetic'
import { useIntroDelay } from '../fx/Intro'
import { HeroWall } from '../HeroWall'

const EASE = [0.22, 1, 0.36, 1] as const

/*
  把标题切成动画用的「原子」（words/chars）。
  ─────────────────────────────────────────────────────────────
  逐字入场动画要求每个字符独立做 inline-block（这样才能各自单独淡入
  上升）。代价是：浏览器的换行算法把每个 inline-block 都当成一个独立
  的「词」，于是**它原本关于「哪里能断行」的全部知识都失效了**，可以
  在任意两个盒子之间断行。这个根因有两半，两半都得堵：

  1. 英文单词的完整性没了 —— 它不知道 C/l/a/u/d/e 这六个盒子本来是同
     一个单词，于是 "Claude" 被断成 "Cl" / "aude"。
  2. 中日文的「行首禁则」也没了 —— 浏览器本来懂「收尾标点（。、，
     ）」不能出现在行首」，但标点被 inline-block 化之后这条规则同样不
     再生效，于是 320px 或用户把浏览器默认字号调大时，会渲染出
     `PPT、表格、方案` / `。` —— 句号自己孤零零占一行。

  修法（一套正则同时堵住两半）：
  - 连续的拉丁字母/数字合并成一个「词原子」；
  - **尾随的收尾标点并进它前面那个原子**（`案。` `plan.` `PPT、` 都是
    一个原子）——这是第 2 半的解药：标点不再是独立盒子，它和前一个字
    锁死在同一个 nowrap 壳子里，自然永远不可能被抛到行首。**改这个正
    则的人注意：把标点拆回独立原子 = 直接把孤立标点的 bug 放回来。**
  - 多字符原子外面套 inline-block + whitespace-nowrap，内部字符再各自
    套 inline-block 做动画——原子内不许断，原子间随便断。
  - 单个中文字仍是长度 1 的原子、不套壳子，所以中文照样能在字与字之间
    断行（中文本来就该这样断）。

  几个不能省的细节：
  - `\s` 必须排在 `.${TRAIL}` **前面**：否则「空格 + 紧跟标点」会被并
    成 " 。" 这种含空格的多字符原子，那个空格就成了某个 inline-block
    的唯一内容 → 塌成 0 宽（本项目踩过两次的老坑）。让空白永远单独成
    原子就绕开了。
  - `u` flag 必须有：没有它 `.` 按 UTF-16 代码单元匹配，emoji 这类
    非 BMP 字符会被劈成两个孤立代理项、各自渲染成 □。标题文案是会被
    反复改的东西，不能留这种「改一个字就炸」的雷。

  这套逻辑不看当前语言（zh/en）——中文标题里混进的英文词（比如 "AI"）
  一样会被当词原子保护，不用为语言分叉两套渲染路径。
*/
/** 收尾标点：只能跟在别人屁股后面、不能独自出现在行首的那些字符。 */
const TRAIL = "[.,!?;:'’)\\]}、。，．！？；：）】」』〉》]*"
const WORD_ATOM_RE = new RegExp(
  `[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*${TRAIL}|\\s|.${TRAIL}`,
  'gu',
)

function splitIntoAtoms(line: string): string[] {
  return line.match(WORD_ATOM_RE) ?? []
}

export function Hero() {
  const { t, lang } = usePrefs()
  const reduced = useReducedMotion()
  const introDelay = useIntroDelay()
  const state = useRelease()
  const [platform, setPlatform] = useState<ReturnType<typeof guessPlatform>>(null)

  // 猜系统必须等到浏览器里才做：服务器上没有 navigator。
  useEffect(() => setPlatform(guessPlatform()), [])

  /*
    首屏退场动画（scroll-linked）：往下滚时文字栏在身后慢慢淡出 + 微微缩小
    后退，页面照常滚（不加跑道、不钉背景）。
    ─────────────────────────────────────────────────────────────
    为什么吃 window 的像素 scrollY，而不用 useScroll({ target, offset })：
    target 版的 scrollYProgress 在映射区间之外对 **opacity** 的钳制不可靠——
    进度超过范围后 opacity 会「反弹」（实测：y/scale 正确停在钳制值，唯独
    opacity 从 0 弹回，导致淡掉的内容滚出顶部时又鬼影般冒出来）。window 的
    scrollY 是最朴素的像素值、绝对单调，配 useTransform 默认 clamp，「淡尽后
    保持淡尽」稳如老狗。
    淡出行程 = 半屏（vhPx*0.5）：滚过半屏文字就干净了，给下面终端揭示让位。
    vhPx=0（挂载前）兜底成 1，避免 [0,0] 退化区间；那会儿也还没往下滚。
  */
  const [vhPx, setVhPx] = useState(0)
  useEffect(() => {
    const sync = () => setVhPx(window.innerHeight)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])
  const { scrollY } = useScroll()
  const fade = Math.max(1, vhPx * 0.5)
  const exitOpacity = useTransform(scrollY, [0, fade], [1, 0])
  const exitScale = useTransform(scrollY, [0, fade], [1, 0.94])
  const exitY = useTransform(scrollY, [0, fade], [0, -60])

  const lines = hero.headline[lang]

  /* 主按钮三态（同旧版）：loading→占位；有直链→.dmg/.exe；其余→Releases 页。 */
  const cards = getPlatformCards(state.release)
  const match = platform ? cards.find((c) => c.key === platform) : undefined
  const primaryHref = match?.href ?? FALLBACK_HREF
  // 主按钮固定带产品名（下载 Cowork）。平台仍自动探测，只是不再拼进按钮文字，
  // 而是用于 primaryHref 选对安装包；版本/体积由下方信任条呈现。
  const primaryLabel = t({ zh: `下载 ${site.name}`, en: `Download ${site.name}` })

  /* 非标题元素的错峰入场（标题的逐字动画单独编排） */
  const rise = (order: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay: introDelay + 0.35 + order * 0.09, ease: EASE },
        }

  /* 标题逐字：字符在两行间连续编号，跨行错峰不断流 */
  let charIndex = 0

  return (
    <section id="top" className="relative z-[1] min-h-screen overflow-hidden">
      {/* 墙（z0）+ 核心光（z1，在 HeroWall 内部） */}
      <HeroWall />

      {/* glass（z2）：文字栏背后的毛玻璃。
          压暗会杀掉墙的存在感，模糊不会——卡片的轮廓、动感、绿光全留着，
          只把它的字揉糊，就不跟副标题抢眼睛了。这是可读性的主力，不是装饰。
          边缘必须用 mask 化开：一旦让人看出这里有块方玻璃，整个效果就塌了。
          数值出自 spec §4.5（遮罩 48 的固化结果）。 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-[2] max-lg:hidden"
        style={{
          left: '-4%',
          top: '30%',
          width: '62%',
          height: '56%',
          backdropFilter: 'blur(15.3px) saturate(.85)',
          WebkitBackdropFilter: 'blur(15.3px) saturate(.85)',
          maskImage: 'radial-gradient(ellipse 54% 54% at 34% 50%, #000 42%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 54% 54% at 34% 50%, #000 42%, transparent 80%)',
        }}
      />

      {/* veil1（z2）：上下压边，保住导航和滚动提示 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          opacity: 0.766,
          background:
            'linear-gradient(180deg, var(--canvas) 0%, transparent 32%, transparent 56%, rgba(7,11,9,.88) 90%, var(--canvas) 100%)',
        }}
      />

      {/* veil2（z2）：文字栏的保命符。重心压在副标题+按钮那一带（y58%）
          而不是标题——大标题字大字粗，自己扛得住，不需要保护。
          移动端没有 glass，靠它加强到 0.85 顶上（spec §8）。 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.48] max-lg:opacity-[0.85]"
        style={{
          background:
            'radial-gradient(ellipse 46% 42% at 27% 58%, var(--canvas) 30%, rgba(7,11,9,.72) 62%, transparent 84%)',
        }}
      />

      <motion.div
        // 退场变换绑在文字栏这一层：子元素的入场/逐字动画照常在里面各跑各的，
        // 父层的 opacity/scale/y 与它们叠加，进度 0 时是恒等变换、不影响入场。
        style={reduced ? undefined : { opacity: exitOpacity, scale: exitScale, y: exitY }}
        className="relative z-[3] mx-auto grid min-h-screen max-w-[1180px] content-center px-8 pt-[120px] pb-10"
      >
        <div>
          <motion.span
            {...rise(0)}
            className="mb-[30px] inline-flex w-fit items-center gap-2 rounded-full border border-edge-brand bg-brand/5 px-[15px] py-[7px] font-mono text-[12px] text-brand"
          >
            <i className="dot-pulse size-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
            {t(hero.badge)}
          </motion.span>

          <h1 className="display-face text-[clamp(1.9rem,4.4vw,3.9rem)] leading-[1.1] font-extrabold">
            {lines.map((line, li) => {
              const cls =
                li === hero.accentLine
                  ? 'inline-block bg-gradient-to-br from-brand to-teal bg-clip-text text-transparent'
                  : 'inline-block'

              return (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  {splitIntoAtoms(line).map((atom, ai) => {
                    /* 空格原子：原样吐一个文本节点，不套 inline-block。
                       不是转义成 nbsp——一旦套進 inline-block，「普通空格
                       是这个盒子唯一内容」会被当成盒子自己的首尾空白直接塌成
                       0 宽（项目踩过两次的坑）；而如果转成 nbsp，虽然不塌宽
                       但换成了「此处禁止换行」，恰好是这次要修的反模式（词间
                       必须能断行）。这里两难都躲开：让空格当一个普通的行内
                       文本字符，夹在两个 inline-block 词/字之间，浏览器按
                       标准规则处理——不塌宽，也是合法断行点。 */
                    if (atom === ' ') {
                      charIndex++ // 编号继续走，后面字符的错峰节奏不受影响
                      return ' '
                    }

                    const chars = [...atom]
                    const rendered = chars.map((ch, ci) => {
                      const delay = introDelay + charIndex++ * 0.028
                      // key 必须跨 atom 唯一：单用 ci 的话，每个单字符原子的
                      // ci 永远是 0，会跟其它单字符原子一起撞出重复 key
                      // （踩过：React 报 "两个子元素用了同一个 key"）。
                      const key = `${ai}-${ci}`
                      return reduced ? (
                        <span key={key} className={cls}>
                          {ch}
                        </span>
                      ) : (
                        <motion.span
                          key={key}
                          className={`${cls} will-change-transform`}
                          initial={{ opacity: 0, y: '0.7em', filter: 'blur(10px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.7, delay, ease: EASE }}
                        >
                          {ch}
                        </motion.span>
                      )
                    })

                    // 多字符原子（英文词、以及「字/词 + 尾随标点」）：套一层
                    // 不可断行的壳子，原子内绝不允许断行——这既保住英文单词
                    // 不被劈开，也保住标点不会被抛到行首。
                    // 单字符原子（不带标点的中文单字）没有这两种风险，直接吐
                    // 字符本身，让它照常可以在字与字之间断行。
                    return chars.length > 1 ? (
                      <span key={ai} className="inline-block whitespace-nowrap">
                        {rendered}
                      </span>
                    ) : (
                      rendered[0]
                    )
                  })}
                </span>
              )
            })}
          </h1>

          <motion.p {...rise(1)} className="mt-[26px] max-w-[46ch] text-[16.5px] leading-[1.7] text-dim">
            {t(hero.subline)}
          </motion.p>

          <motion.div {...rise(2)} className="mt-[38px] flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href={state.status === 'loading' ? undefined : primaryHref}
                aria-disabled={state.status === 'loading'}
                className={`btn-glow relative inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-br from-brand to-teal px-[30px] py-[15px] text-[15px] font-semibold text-on-brand ${
                  state.status === 'loading' ? 'pointer-events-none opacity-70' : ''
                }`}
              >
                <DownloadIcon />
                {state.status === 'loading' ? t({ zh: '正在获取最新版本…', en: 'Fetching latest…' }) : primaryLabel}
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#outputs"
                className="inline-block rounded-[14px] border border-edge px-[30px] py-[15px] text-[15px] font-semibold text-ink transition-colors hover:border-edge-brand"
              >
                {t(hero.secondaryCta)}
              </a>
            </Magnetic>
          </motion.div>

          {/* 信任条：真实版本号 + 体积（拿不到就只剩定位语，优雅降级） */}
          <motion.p {...rise(3)} className="mt-[22px] font-mono text-[12px] text-dim">
            {state.status === 'ready' && (
              <>
                <b className="font-medium text-brand">{state.release.version}</b>
                {' · '}
                {match?.sizeMB ? `${match.sizeMB} MB · ` : ''}
              </>
            )}
            {t(hero.trust)}
          </motion.p>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={() => {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          window.scrollBy({ top: window.innerHeight, behavior: reduce ? 'auto' : 'smooth' })
        }}
        aria-label={t({ zh: '向下滚动到下一屏', en: 'Scroll to next section' })}
        className="absolute bottom-[26px] left-1/2 z-[3] flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-dim transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-none"
      >
        SCROLL
        <i aria-hidden="true" className="cue-line block h-[34px] w-px" style={{ background: 'linear-gradient(180deg,var(--brand),transparent)' }} />
      </button>
    </section>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

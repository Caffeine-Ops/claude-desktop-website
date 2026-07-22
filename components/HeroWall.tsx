'use client'

/*
  Hero 的卡片墙——照 linear.app/intake 顶部的配方，换成我们自己的内容：
  一面向后倾倒的 3D 平面，五行「产品干活的真实痕迹」以不同速度漂移。

  2026-07-17 从「背景装饰」升格为「第一屏主视觉」（旧版被压到几乎看不见）。
  存在感的大头是 perspective:1000px + rotateX(42deg)——相机更近、卡片正面
  露得更多。这两个数比任何透明度调整都关键，别随手改。

  三层动：
  1. 每行自己的 CSS 无限漂移（wallDrift，不同 duration、奇数行反向）——永动氛围；
  2. 滚动视差：滚出首屏时整面墙比内容慢半拍上移——纵深感；
  3. 鼠标微视差（×0.012，很轻）——全站「跟手」哲学的延续。
  跟手值照例走「挂载后再接线」门闩（hydration 教训，踩过两次）。

  可读性纪律（原型实测撞出来的，别推翻）：
  - 墙是背景不是内容：aria-hidden + pointer-events:none；
  - 文案的可读性靠 Hero 里的毛玻璃层（模糊而非压暗），不靠把墙压暗——
    压暗会杀掉存在感，模糊不会。详见 spec §4.5。
*/

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { heroWall } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { ensurePointerTracking, pointerX, pointerY } from './fx/pointer'

/*
  每行的漂移时长与方向，以及景深（存在感 47 的固化结果）。
  速度差是「墙在呼吸」的来源，别统一。焦点在第 3 行（index 2）：
  它最清晰、最亮，眼睛会先落在那儿。
*/
const ROWS = [
  { duration: 74, reverse: false, opacity: 0.3, blur: 4.1 },
  { duration: 92, reverse: true, opacity: 0.52, blur: 1.6 },
  { duration: 64, reverse: false, opacity: 0.85, blur: 0 },
  { duration: 100, reverse: true, opacity: 0.6, blur: 1.2 },
  { duration: 82, reverse: false, opacity: 0.26, blur: 5.2 },
]

export function HeroWall() {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    setMounted(true)
    if (!reduced) ensurePointerTracking()

    // 移动端减档：行数和速度是 CSS 做不到的，只能在 JS 里判。
    // 必须在 mounted 之后——服务器上没有 matchMedia，首帧对不上会 hydration 报错。
    const mq = window.matchMedia('(max-width: 1023px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [reduced])

  // 滚动视差：首屏滚出过程中墙上移 60px（比内容慢 = 在更远处）
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -60])
  // 鼠标微视差
  const mx = useSpring(useTransform(pointerX, (v) => (v - (typeof window === 'undefined' ? 0 : innerWidth / 2)) * 0.012), { stiffness: 40, damping: 18 })
  const my = useSpring(useTransform(pointerY, (v) => (v - (typeof window === 'undefined' ? 0 : innerHeight / 2)) * 0.012), { stiffness: 40, damping: 18 })

  const still = !mounted || reduced

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/*
        3D 舞台，必须分两层，别合并回一个 style ——
        motion 的 style 里只要出现 x / y / translateY 这类「transform 类」属性
        （哪怕值是 0），motion 就会接管整个 transform 的生成权：它会无视我们
        手写在同一个 style 对象里的 `transform` 字符串，直接用自己从
        x/y/translateY 算出来的一份把它覆盖掉（源码见
        framer-motion/motion-dom 的 useStyle → buildTransform：
        copyRawValuesOnly 先把手写字符串抄进去，随后
        Object.assign(style, useInitialMotionValues(...)) 无条件覆盖）。
        三个视差值都是 0（首帧 SSR、或 still===true）时，算出来的就是
        transform:none —— rotateX/rotateZ 原地消失，这正是这面墙从来没
        倾斜过的根因。
        所以：视差位移（x/y/translateY，交给 motion 的 style）放外层
        motion.div；3D 倾斜（rotateX/rotateZ，纯 CSS 字符串，motion 完全
        碰不到）留在内层普通 div。谁都别把这两组 transform 揉回同一个
        style——揉回去这个 bug 会原地复活。
        另外 perspective 只对直接子元素生效：把它和位移放在同一个
        motion.div 上（perspective 是独立 CSS 属性，不受 motion 的
        transform 接管影响），让做 rotateX 的普通 div 是它的直接子元素，
        这样「倾斜」和「近大远小」才能同时成立。
      */}
      <motion.div
        className="absolute inset-0"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 30%',
          x: still ? 0 : mx,
          y: still ? 0 : my,
          translateY: still ? 0 : parallaxY,
        }}
      >
        <div
          className="absolute top-[-34%] left-[-30%] flex h-[176%] w-[176%] flex-col justify-between gap-[30px]"
          style={{
            transform: 'rotateX(42deg) rotateZ(-8deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 移动端只留中间 3 行（保住焦点行）——小屏上五行挤成一团，
              而且每行都在跑动画，白耗电。 */}
          {(narrow ? heroWall.slice(1, 4) : heroWall).map((row, ri) => {
            const conf = (narrow ? ROWS.slice(1, 4) : ROWS)[ri]
            return (
              <div
                key={ri}
                className="wall-row flex w-max gap-[22px] will-change-transform max-lg:gap-4"
                style={{
                  // 小屏上同样的速度显得更快（视野窄，卡片划过得更频繁）——放慢 30%
                  animationDuration: `${conf.duration * (narrow ? 1.3 : 1)}s`,
                  animationDirection: conf.reverse ? 'reverse' : 'normal',
                  animationPlayState: reduced ? 'paused' : 'running',
                  opacity: conf.opacity,
                  filter: conf.blur ? `blur(${conf.blur}px)` : undefined,
                }}
              >
                {/*
                  内容要重复很多遍——不是为了炫，是右侧空白 bug 的解药。
                  ─────────────────────────────────────────────────────
                  这行匀速左移到 translateX(-50%) 再无缝接回。无缝的前提是
                  「后半段」和「前半段」逐像素相同（都是同一串卡片的整倍复制）。
                  但「不露空白」还有第二个前提常被忽略：**半段本身必须比可见宽
                  度还宽**。半段=5 张卡≈1538px，比屏幕窄；于是滑到 -50% 那一刻，
                  后半段的尾巴已进屏，右边没有更多卡片顶上 → 露出一大片黑（截图
                  里右侧那块）。
                  修法：把「半段」加厚到 UNIT_REPEAT 份卡片，让半段宽度 ≥ 视口。
                  3 份≈4614px，覆盖到 3440 超宽屏都不露；再整体成双（×2）供 -50%
                  的无缝循环用。窄屏本来就没这毛病（半段已比小视口宽），保持 2 份
                  省 DOM/省电。改 UNIT_REPEAT 的人注意：调小会把右侧空白放回来。
                */}
                {Array.from({ length: (narrow ? 1 : 3) * 2 }, () => row)
                  .flat()
                  .map((card, ci) => (
                  <article
                    key={ci}
                    className={`w-[290px] flex-none rounded-[14px] border px-[18px] py-4 max-lg:w-[200px] max-lg:px-3 max-lg:py-3 ${
                      card.ask ? 'border-edge-brand' : 'border-edge bg-panel'
                    }`}
                    style={{
                      boxShadow: 'var(--shadow-card)',
                      // ask 卡（用户说的话）自带一层品牌绿——它是这面墙的叙事锚点
                      background: card.ask
                        ? 'linear-gradient(145deg, rgba(74,222,128,.06), var(--panel))'
                        : undefined,
                    }}
                  >
                    <div className="mb-[9px] flex items-center justify-between font-mono text-[10.5px] text-dim opacity-75 max-lg:text-[9px]">
                      <span className="truncate">{t(card.id)}</span>
                      <span className="tracking-[1px] opacity-60">···</span>
                    </div>
                    <div
                      className={`truncate text-[14.5px] leading-[1.45] max-lg:text-[12px] ${
                        card.ask ? 'font-medium text-ink' : 'text-[#c3d2c9]'
                      }`}
                    >
                      {t(card.title)}
                    </div>
                    <div className="mt-[13px] flex items-center gap-[7px] max-lg:mt-2">
                      <span
                        className={`flex items-center gap-[5px] rounded-md border px-[9px] py-[3px] font-mono text-[10.5px] max-lg:text-[9px] ${
                          card.brand ? 'border-edge-brand text-brand' : 'border-edge text-dim'
                        }`}
                      >
                        <i className={`size-[5px] rounded-full ${card.brand ? 'bg-brand' : 'bg-dim'}`} />
                        {t(card.tag)}
                      </span>
                      <span className="ml-auto size-5 rounded-full bg-gradient-to-br from-brand to-teal opacity-50" />
                    </div>
                  </article>
                ))}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* 核心光晕：Orbit 唯一被继承下来的东西——「所有产出都出自同一个核心」
          这个信息不能白丢。现在它是墙背后透出来的一团光，不是一个转圈的装置。 */}
      <div
        className="pulse-core absolute z-[1] size-[620px] -translate-x-1/2 -translate-y-1/2 max-lg:hidden"
        style={{
          top: '44%',
          left: '56%',
          background: 'radial-gradient(circle, rgba(74,222,128,.13), transparent 65%)',
          animationPlayState: reduced ? 'paused' : 'running',
        }}
      />
    </div>
  )
}

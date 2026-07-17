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
  useEffect(() => {
    setMounted(true)
    if (!reduced) ensurePointerTracking()
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
      {/* 3D 舞台：透视点偏上，平面向后倒 */}
      <div className="absolute inset-0" style={{ perspective: '1000px', perspectiveOrigin: '50% 30%' }}>
        <motion.div
          className="absolute top-[-34%] left-[-30%] flex h-[176%] w-[176%] flex-col justify-between gap-[30px]"
          style={{
            transform: 'rotateX(42deg) rotateZ(-8deg)',
            transformStyle: 'preserve-3d',
            x: still ? 0 : mx,
            y: still ? 0 : my,
            translateY: still ? 0 : parallaxY,
          }}
        >
          {heroWall.map((row, ri) => {
            const conf = ROWS[ri % ROWS.length]
            return (
              <div
                key={ri}
                className="wall-row flex w-max gap-[22px] will-change-transform max-lg:gap-4"
                style={{
                  animationDuration: `${conf.duration}s`,
                  animationDirection: conf.reverse ? 'reverse' : 'normal',
                  animationPlayState: reduced ? 'paused' : 'running',
                  opacity: conf.opacity,
                  filter: conf.blur ? `blur(${conf.blur}px)` : undefined,
                }}
              >
                {/* 内容渲染两遍：位移到 -50% 时首尾无缝衔接 */}
                {[...row, ...row].map((card, ci) => (
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
        </motion.div>
      </div>

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

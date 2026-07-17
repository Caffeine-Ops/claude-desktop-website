'use client'

/*
  Hero 背景「内容墙」——照 linear.app/intake 顶部的配方，换成我们自己的内容：
  一面向后倾倒的 3D 平面，五行「产品干活的真实痕迹」卡片以不同速度漂移，
  整体压得很暗，上下左都有渐变遮罩，保证前景标题永远可读。

  三层动：
  1. 每行自己的 CSS 无限漂移（wallDrift，不同 duration、奇数行反向）——永动氛围；
  2. 滚动视差：滚出首屏时整面墙比内容慢半拍上移（useScroll → y）——纵深感；
  3. 鼠标微视差（×0.012，比轨道装置更轻）——全站「跟手」哲学的延续。
  跟手值照例走「挂载后再接线」门闩（hydration 教训）。

  可读性纪律：墙是背景不是内容（aria-hidden），透明度压在 .5，
  任何时候不许为了「让墙更好看」调亮到和前景抢眼。
*/

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { heroWall } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { ensurePointerTracking, pointerX, pointerY } from './fx/pointer'

/** 每行的漂移时长（秒）与方向——速度差是「墙在呼吸」感觉的来源 */
const ROWS: { duration: number; reverse: boolean }[] = [
  { duration: 74, reverse: false },
  { duration: 92, reverse: true },
  { duration: 64, reverse: false },
  { duration: 100, reverse: true },
  { duration: 82, reverse: false },
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
    <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* 3D 舞台：透视点在上方，平面向后倒 */}
      <div className="absolute inset-0" style={{ perspective: '1100px', perspectiveOrigin: '50% 20%' }}>
        <motion.div
          className="absolute top-[-30%] left-[-25%] flex h-[160%] w-[150%] flex-col justify-between gap-8"
          style={{
            transform: 'rotateX(38deg) rotateZ(-6deg)',
            transformStyle: 'preserve-3d',
            // --wall-opacity 令牌随浅色主题一起下线；这里先写死深色档的原值，
            // Task 4 重写本组件时会改成每行独立的 opacity（届时这行消失）。
            opacity: 0.5,
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
                className="wall-row flex w-max gap-7 will-change-transform"
                style={{
                  animationDuration: `${conf.duration}s`,
                  animationDirection: conf.reverse ? 'reverse' : 'normal',
                }}
              >
                {/* 内容渲染两遍：位移到 -50% 时首尾无缝衔接 */}
                {[...row, ...row].map((card, ci) => (
                  <span
                    key={ci}
                    className="flex items-center gap-3 rounded-2xl border border-edge bg-panel/70 px-7 py-5 font-mono text-[15px] whitespace-nowrap text-dim"
                  >
                    <span className={card.accent ? 'text-brand' : 'opacity-70'}>{card.icon}</span>
                    <span className={card.accent ? 'text-ink' : undefined}>{t(card.text)}</span>
                  </span>
                ))}
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* 遮罩：上下压边 + 左中压暗标题后方。两层渐变，都用画布色，主题自动跟。 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, var(--canvas) 0%, transparent 26%, transparent 60%, var(--canvas) 96%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          // 椭圆盖住整个左侧文字栏（标题+副标题+按钮+信任条），墙只在右半和边缘呼吸
          background: 'radial-gradient(ellipse 76% 72% at 26% 56%, var(--canvas) 14%, transparent 70%)',
        }}
      />
    </div>
  )
}

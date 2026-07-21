'use client'

/*
  产出区（设计稿 D → 2026-07-20 升级）：0→139 滚动计数器 + 六张「3D 跟手」产出卡。
  139 = 产品「设置 → 技能」页的真实总数（2026-07-20 复核过）——改数字前先开产品核对。
  每张卡上半是一扇迷你产品窗，装的是产品真实截图（来源见 content.ts 注释）——不虚构原则不变。

  动效（与首屏 Hero 卡片墙、Terminal 同一套语言）：
  - 指针在卡上移动 → 整卡小幅 rotateX/rotateY（弹簧平滑），移开回弹归零。
    倾斜量按指针相对卡中心的偏移算，用卡自己的 onPointerMove 而不是全局
    指针流：六张卡只有指针底下那张该动，全局流会让整排一起歪。
  - 截图在窗内做反向视差（translate 反号 + 微放大）——「图浮在卡里」的层次感。
    放大是常驻 1.06：视差会把图往边上推，不放大就露出图窗底色。
  - 一层跟随指针的径向柔光扫过卡面。
  - 触屏没有 hover：pointerType !== 'mouse' 直接不响应，卡保持静态截图。
  - 开了「减少动态效果」：不绑事件，光斑常隐，只剩静态图。
*/

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { outputCards, outputsSection } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal, RevealGrid, RevealGridItem } from '../fx/Reveal'
import { SectionHead } from '../SectionHead'
import { OutputDetailModal } from './OutputDetailModal'

function Counter() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [n, setN] = useState(reduced ? 139 : 0)

  useEffect(() => {
    if (!inView || reduced) return
    // animate 的「纯数值」形态：不绑元素，每帧把中间值喂给 onUpdate
    const controls = animate(0, 139, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduced])

  return (
    <span ref={ref} className="display-face bg-gradient-to-br from-brand to-teal bg-clip-text text-[clamp(3.4rem,7vw,5.6rem)] leading-none font-extrabold text-transparent">
      {n}
    </span>
  )
}

const SPRING = { stiffness: 150, damping: 18 }

function OutputCard({ card, onOpen }: { card: (typeof outputCards)[number]; onOpen: () => void }) {
  const { t } = usePrefs()
  const reduced = useReducedMotion()

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const [lit, setLit] = useState(false)
  const [touch, setTouch] = useState(false) // 触屏:无 hover,可点信号常驻

  const rotateX = useSpring(useTransform(py, (v) => (v - 0.5) * -8), SPRING)
  const rotateY = useSpring(useTransform(px, (v) => (v - 0.5) * 8), SPRING)
  const shotX = useSpring(useTransform(px, (v) => (v - 0.5) * -12), SPRING)
  const shotY = useSpring(useTransform(py, (v) => (v - 0.5) * -10), SPRING)
  const glow = useTransform([px, py], ([x, y]: number[]) =>
    `radial-gradient(280px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.10), transparent 65%)`,
  )

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') {
      setTouch(true)
      return
    }
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
    setLit(true)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
    setLit(false)
  }

  // 可点信号常显条件:触屏 或 开了减少动态效果
  const cueAlways = touch || reduced

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={t({ zh: '查看成品:', en: 'View output: ' }) + t(card.title)}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen()
          }
        }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-edge bg-panel outline-none transition-[border-color] duration-300 hover:border-edge-brand focus-visible:border-edge-brand"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
        }}
        whileHover={reduced ? undefined : { y: -4 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        {/* 迷你产品窗 */}
        <div className="border-b border-edge">
          <div className="flex items-center gap-[6px] px-3.5 py-[9px]">
            <i className="size-2 rounded-full bg-white/13" />
            <i className="size-2 rounded-full bg-white/13" />
            <i className="size-2 rounded-full bg-white/13" />
            <span className="ml-2 font-mono text-[10.5px] text-dim">{card.ext.slice(1)}</span>
          </div>
          <div className="relative aspect-video overflow-hidden">
            <motion.img
              src={card.shot}
              alt={t(card.shotAlt)}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ x: reduced ? 0 : shotX, y: reduced ? 0 : shotY, scale: 1.06 }}
            />
          </div>
        </div>

        <div className="p-[22px]">
          <div className="flex items-center gap-2.5">
            <span className="text-[19px]" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="min-w-0 truncate text-[16px] font-bold">{t(card.title)}</h3>
            <span className="ml-auto shrink-0 font-mono text-[11.5px] text-brand">{card.ext}</span>
          </div>
          <p className="mt-[7px] line-clamp-2 min-h-[2lh] text-[13px] leading-[1.65] text-dim">{t(card.body)}</p>
        </div>

        {/* 跟随指针的柔光 */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ background: glow, opacity: lit ? 1 : 0 }}
          />
        )}

        {/* 可点信号:「查看成品 →」标签。hover/聚焦淡入上移;触屏或 reduced 常显 */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute right-3.5 bottom-3.5 inline-flex items-center gap-1 rounded-full border border-edge-brand bg-panel/80 px-2.5 py-1 font-mono text-[11px] text-brand backdrop-blur transition-all duration-300 ${
            cueAlways
              ? 'translate-y-0 opacity-100'
              : 'translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
          }`}
        >
          {t({ zh: '查看成品', en: 'View file' })} →
        </span>
      </motion.div>
    </div>
  )
}

export function Outputs() {
  const { t } = usePrefs()
  const [activeCard, setActiveCard] = useState<(typeof outputCards)[number] | null>(null)
  const lastTrigger = useRef<HTMLElement | null>(null)

  const close = () => {
    setActiveCard(null)
    // 焦点归还触发卡片
    lastTrigger.current?.focus()
    lastTrigger.current = null
  }

  return (
    <section id="outputs" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[90px]">
      <SectionHead eyebrow={t(outputsSection.eyebrow)} title={t(outputsSection.title)} />

      <Reveal delay={0.1} className="mt-[34px] flex items-baseline gap-3.5">
        <Counter />
        <span className="text-[15px] text-dim">{t(outputsSection.counterLabel)}</span>
      </Reveal>

      <RevealGrid className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {outputCards.map((card) => (
          <RevealGridItem key={card.ext + card.title.en}>
            <OutputCard
              card={card}
              onOpen={() => {
                lastTrigger.current = document.activeElement as HTMLElement
                setActiveCard(card)
              }}
            />
          </RevealGridItem>
        ))}
      </RevealGrid>

      <OutputDetailModal card={activeCard} onClose={close} />
    </section>
  )
}

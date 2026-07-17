'use client'

/*
  产出区（设计稿 D）：0→141 滚动计数器 + 六张产出卡（弹簧错峰入场）。
  每张卡对应仓库里真实存在的技能（见 content.ts 注释）——不虚构原则不变。
*/

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { outputCards, outputsSection } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal, RevealGrid, RevealGridItem } from '../fx/Reveal'
import { SectionHead } from '../SectionHead'

function Counter() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [n, setN] = useState(reduced ? 141 : 0)

  useEffect(() => {
    if (!inView || reduced) return
    // animate 的「纯数值」形态：不绑元素，每帧把中间值喂给 onUpdate
    const controls = animate(0, 141, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduced])

  return (
    <span ref={ref} className="display-face bg-gradient-to-br from-brand to-teal bg-clip-text text-[clamp(3.4rem,7vw,5.6rem)] leading-none font-extrabold text-transparent">
      {n}+
    </span>
  )
}

export function Outputs() {
  const { t } = usePrefs()

  return (
    <section id="outputs" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[90px]">
      <SectionHead eyebrow={t(outputsSection.eyebrow)} title={t(outputsSection.title)} />

      <Reveal delay={0.1} className="mt-[34px] flex items-baseline gap-3.5">
        <Counter />
        <span className="text-[15px] text-dim">{t(outputsSection.counterLabel)}</span>
      </Reveal>

      <RevealGrid className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {outputCards.map((card) => (
          <RevealGridItem
            key={card.ext + card.title.en}
            className="rounded-2xl border border-edge bg-panel p-[26px] transition-[border-color,box-shadow] duration-300 hover:border-edge-brand"
          >
            <span className="mb-3.5 block text-[22px]" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="text-[16.5px] font-bold">{t(card.title)}</h3>
            <p className="mt-[7px] text-[13px] leading-[1.65] text-dim">{t(card.body)}</p>
            <div className="mt-3.5 font-mono text-[11.5px] text-brand">{card.ext}</div>
          </RevealGridItem>
        ))}
      </RevealGrid>
    </section>
  )
}

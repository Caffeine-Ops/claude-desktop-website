'use client'

/*
  每一段的抬头（设计稿 D 版）：一条短横线 + mono 小标签 + 大标题。
  标签文字必须和导航项同名——一物一名（见 content.ts 的 nav 注释）。
*/

import { Reveal } from './fx/Reveal'

export function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <Reveal className="mb-4 flex items-center gap-3">
        <span className="h-px w-[34px] bg-brand" aria-hidden="true" />
        <span className="font-mono text-[12px] tracking-[0.16em] text-brand uppercase">{eyebrow}</span>
      </Reveal>
      <Reveal as="h2" delay={0.06} className="display-face text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.15] font-extrabold">
        {title}
      </Reveal>
    </>
  )
}

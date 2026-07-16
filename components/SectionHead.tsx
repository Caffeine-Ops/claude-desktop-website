'use client'

/*
  每一段的抬头：一行 mono 小标签 + 一个大标题 + 可选的一段说明。

  为什么小标签用 mono 而不是把它做成一个圆角胶囊标签：
  胶囊标签是纯装饰，不带信息。这里的 mono 标签配一条短横线，读起来像应用里
  的分区标记——用产品自己的语汇，而不是随便糊个装饰。
*/

import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

export function SectionHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: ReactNode
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-brand" aria-hidden="true" />
        <span className="font-mono text-[11.5px] tracking-widest text-brand uppercase">{eyebrow}</span>
      </div>
      <h2 className="display-face mt-5 max-w-[20ch] text-[clamp(1.9rem,4vw,3rem)] leading-[1.12] font-extrabold">
        {title}
      </h2>
      {body && <p className="mt-5 max-w-[58ch] text-[16px] leading-[1.65] text-graphite">{body}</p>}
    </Reveal>
  )
}

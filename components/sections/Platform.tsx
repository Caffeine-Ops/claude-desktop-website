'use client'

/*
  功能区（设计稿 D）：撑起产出的四样底座，两列编号卡，弹簧错峰入场。
  术语从这一段才允许出现，且第一次出现就地解释（文案在 content.ts）。
*/

import { platform } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { RevealGrid, RevealGridItem } from '../fx/Reveal'
import { SectionHead } from '../SectionHead'

export function Platform() {
  const { t } = usePrefs()

  return (
    <section id="platform" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[50px] pb-[90px]">
      <SectionHead eyebrow={t(platform.eyebrow)} title={t(platform.title)} />

      <RevealGrid className="mt-11 grid gap-4 md:grid-cols-2">
        {platform.blocks.map((b, i) => (
          <RevealGridItem
            key={b.name.en}
            className="rounded-[18px] border border-edge bg-panel p-[30px]"
          >
            <div className="font-mono text-[12px] text-brand">{String(i + 1).padStart(2, '0')}</div>
            <h3 className="mt-2.5 text-[19px] font-bold">{t(b.name)}</h3>
            <p className="mt-2.5 max-w-[44ch] text-[14px] leading-[1.7] text-dim">{t(b.body)}</p>
          </RevealGridItem>
        ))}
      </RevealGrid>
    </section>
  )
}

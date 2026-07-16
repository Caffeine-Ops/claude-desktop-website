'use client'

/*
  平台级能力（设计文档 §5.5）：撑起上面那些产出的四样底座。

  这一段是信息分层的转折点——上面全在讲产出，从这里开始才允许出现 RAG、Agent
  这类词，且每个词第一次出现就在括号里用一句大白话解释（文案在 content.ts 里）。

  设计文档原本写的是「图文交替 + 每块一张示意图」。这里先不放示意图：
  素材还没有（§7），与其塞四个灰色占位框，不如先把文字排好——空占位框比没有更难看。
  素材到位后把 media 插槽填上即可，布局已经留好位置。
*/

import { platform } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal } from '../Reveal'
import { SectionHead } from '../SectionHead'

export function Platform() {
  const { t } = usePrefs()

  return (
    <section id="platform" className="border-t border-rule bg-surface px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={t(platform.eyebrow)} title={t(platform.title)} />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2">
          {/* gap-px + 底色 bg-rule 是画内部分隔线的小把戏：格子之间露出 1px 底色就是线，
              不用给每个格子写 border，也就不会在拼接处出现 2px 粗的双线。 */}
          {platform.blocks.map((b, i) => (
            <Reveal key={b.name.en} delay={(i % 2) * 0.08} className="bg-paper">
              <div className="h-full p-7 sm:p-9">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[12px] text-brand">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="display-face text-[20px] font-bold">{t(b.name)}</h3>
                </div>
                <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.68] text-graphite">{t(b.body)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

/*
  开发者区：信息分层的最下面一层（内容不变，视觉换设计稿 D 的语言）。
  这一段不再解释术语——受众换了，语域就该换。
*/

import { developers, site } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal, RevealGrid, RevealGridItem } from '../fx/Reveal'
import { SectionHead } from '../SectionHead'

export function Developers() {
  const { t } = usePrefs()

  return (
    <section id="developers" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[50px] pb-[90px]">
      <SectionHead eyebrow={t(developers.eyebrow)} title={t(developers.title)} />

      {/* dl/dt/dd 语义保留：一组「名字 + 解释」，读屏软件能播报条目结构 */}
      <RevealGrid className="mt-11">
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {developers.points.map((p) => (
            <RevealGridItem key={p.title.en}>
              <dt className="flex items-center gap-2.5 text-[16px] font-semibold">
                <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                {t(p.title)}
              </dt>
              <dd className="mt-2.5 ml-4 max-w-[42ch] text-[14.5px] leading-[1.65] text-dim">{t(p.body)}</dd>
            </RevealGridItem>
          ))}
        </dl>
      </RevealGrid>

      <Reveal delay={0.1} className="mt-12 flex flex-wrap gap-3">
        <a
          href={site.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-[14px] border border-edge-brand px-6 py-3 text-[14px] font-semibold text-brand transition-colors hover:bg-brand/10"
        >
          {t(developers.cta)}
        </a>
        <a
          href={site.readmeUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-[14px] border border-edge px-6 py-3 text-[14px] text-dim transition-colors hover:border-edge-brand hover:text-ink"
        >
          {t(developers.readme)}
        </a>
      </Reveal>
    </section>
  )
}

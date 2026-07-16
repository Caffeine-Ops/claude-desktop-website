'use client'

/*
  开发者区（设计文档 §5.6）：信息分层的最下面一层。

  普通用户读到这里已经被上面说服了，可以直接跳到下载。所以这一段不再解释术语，
  该说 SDK 就说 SDK——受众换了，语域就该换。这不是前后不一致，是分层。
*/

import { developers, site } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal } from '../Reveal'
import { SectionHead } from '../SectionHead'

export function Developers() {
  const { t } = usePrefs()

  return (
    <section id="developers" className="border-t border-rule px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={t(developers.eyebrow)} title={t(developers.title)} />

        <dl className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {/* dl/dt/dd = 定义列表：一组「名字 + 它的解释」。这段内容正好是这个形状，
              用它比一堆 div 更能让读屏软件说清「这是 4 个条目，每个有标题和说明」。 */}
          {developers.points.map((p, i) => (
            <Reveal key={p.title.en} delay={(i % 2) * 0.06}>
              <dt className="flex items-center gap-2.5 text-[16px] font-semibold">
                <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                {t(p.title)}
              </dt>
              <dd className="mt-2.5 ml-4 max-w-[42ch] text-[14.5px] leading-[1.65] text-graphite">
                {t(p.body)}
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal>
          <div className="mt-12 flex flex-wrap gap-3">
            <a
              href={site.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xl border border-ink px-5 py-3 text-[14px] font-semibold transition-colors hover:bg-ink hover:text-paper"
            >
              {t(developers.cta)}
            </a>
            <a
              href={site.readmeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xl border border-rule px-5 py-3 text-[14px] text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              {t(developers.readme)}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

'use client'

/*
  下载区（设计文档 §5.7 + §8）——官网的核心目标。

  这一段是整页唯一依赖外部服务（GitHub 接口）的地方，所以它有三副面孔，
  三副都得长得体面：
  - loading  ：骨架占位。高度和真卡片一样，数据回来时页面不会跳一下。
  - ready    ：真实平台卡，版本号、大小、直链齐活。
  - fallback ：接口超时/被限流/仓库读不到 → 一句实话 + 一个去 Releases 的按钮。
               不写「加载失败」这种只描述我方状态的话，写用户接下来能干什么。

  平台卡只摆真的打出了安装包的平台（现在是 mac Apple 芯片 + Windows）。
  给用户看一个点了 404 的 Linux 按钮，比不摆这个按钮糟得多。
*/

import { useEffect, useState } from 'react'
import { download, site } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useRelease } from '@/lib/useRelease'
import { formatDate, getPlatformCards, guessPlatform, type PlatformCard, type PlatformKey } from '@/lib/github'
import { Reveal } from '../Reveal'
import { SectionHead } from '../SectionHead'

export function Download() {
  const { t, lang } = usePrefs()
  const state = useRelease()
  const [platform, setPlatform] = useState<PlatformKey | null>(null)

  useEffect(() => setPlatform(guessPlatform()), [])

  const cards = getPlatformCards(state.release)

  return (
    <section id="download" className="border-t border-rule bg-surface px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead eyebrow={t(download.eyebrow)} title={t(download.title)} />

        {/* 版本条 */}
        <Reveal>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12.5px] text-graphite">
            {state.status === 'ready' ? (
              <>
                <span className="rounded-md bg-brand-soft px-2 py-1 text-brand">{state.release.version}</span>
                <span>
                  {t(download.released)} {formatDate(state.release.publishedAt, lang)}
                </span>
              </>
            ) : state.status === 'loading' ? (
              <span>{t(download.loading)}</span>
            ) : null}
            <a
              href={site.releasesUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              {t(download.history)} ↗
            </a>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {state.status === 'loading' && (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}

          {state.status === 'ready' &&
            cards.map((c, i) => (
              <Reveal key={c.key} delay={i * 0.06}>
                <PlatformTile card={c} recommended={c.key === platform} />
              </Reveal>
            ))}

          {/* 降级路径：一个 Release 都读不到，或读到了但一个能匹配的安装包都没有。 */}
          {(state.status === 'fallback' || (state.status === 'ready' && cards.length === 0)) && (
            <Reveal className="sm:col-span-2">
              <div className="rounded-2xl border border-rule bg-paper p-7">
                <p className="max-w-[46ch] text-[15px] leading-[1.65] text-graphite">
                  {t(download.fallbackNote)}
                </p>
                <a
                  href={site.latestReleaseUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-5 inline-block rounded-xl bg-brand px-5 py-3 text-[14px] font-semibold text-brand-on transition-opacity hover:opacity-90"
                >
                  {t(download.fallbackCta)} ↗
                </a>
              </div>
            </Reveal>
          )}
        </div>

        {/* 缺席的平台说实话，别装作不存在——用户在找 Linux 版时该在这儿得到答案。 */}
        {state.status === 'ready' && cards.length > 0 && (
          <Reveal>
            <p className="mt-6 max-w-[56ch] text-[13.5px] leading-[1.6] text-graphite">
              {t(download.missingPlatforms)}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function PlatformTile({ card, recommended }: { card: PlatformCard; recommended: boolean }) {
  const { t } = usePrefs()
  const info = download.platforms[card.key]

  return (
    <a
      href={card.href}
      className={`group flex h-full flex-col rounded-2xl border p-7 transition-colors ${
        recommended ? 'border-brand bg-brand-soft' : 'border-rule bg-paper hover:border-ink'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="display-face text-[19px] font-bold">{t(info.name)}</h3>
        {recommended && (
          <span className="shrink-0 rounded-md bg-brand px-2 py-1 font-mono text-[10px] text-brand-on">
            {t(download.recommended)}
          </span>
        )}
      </div>

      <p className="mt-2 text-[13.5px] text-graphite">{t(info.req)}</p>

      <div className="mt-6 flex items-center gap-3 font-mono text-[12px] text-graphite">
        {card.sizeMB && <span>{card.sizeMB} MB</span>}
        <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-ink transition-transform group-hover:translate-y-0.5">
          <DownloadIcon />
          {t({ zh: '下载', en: 'Download' })}
        </span>
      </div>
    </a>
  )
}

/* 骨架屏：占的位置和真卡片一样高，所以数据回来时页面不会往下一跳
   （这个跳动有个正经名字叫 CLS——累积布局偏移，是搜索引擎会扣分的体验问题）。 */
function CardSkeleton() {
  return (
    <div className="h-[168px] animate-pulse rounded-2xl border border-rule bg-paper" aria-hidden="true" />
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

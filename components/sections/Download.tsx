'use client'

/*
  下载区 = 设计稿 D 的结尾 CTA + 旧版的全部韧性逻辑，合成一段。

  「装上，开聊。」做成逐字弹簧大字（这就是 D 稿的结尾大字，标题正好同文）。
  数据三态一个不少：
  - loading  ：骨架占位，高度与真卡一致（数据回来页面不跳，CLS=0）。
  - ready    ：真实平台卡（版本/大小/直链），只摆真的打出了安装包的平台。
  - fallback ：GitHub 接口挂/限流 → 一句实话 + 照样能用的 Releases 按钮。
*/

import { useEffect, useState } from 'react'
import { download, site } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useRelease } from '@/lib/useRelease'
import { formatDate, getPlatformCards, guessPlatform, type PlatformCard, type PlatformKey } from '@/lib/github'
import { Reveal, RevealGrid, RevealGridItem, SpringChars } from '../fx/Reveal'
import { Magnetic } from '../fx/Magnetic'

export function Download() {
  const { t, lang } = usePrefs()
  const state = useRelease()
  const [platform, setPlatform] = useState<PlatformKey | null>(null)

  useEffect(() => setPlatform(guessPlatform()), [])

  const cards = getPlatformCards(state.release)

  return (
    <section id="download" className="relative z-[1] mx-auto max-w-[1180px] px-8 pt-[110px] pb-[70px]">
      {/* 结尾大字：逐字带旋转弹起（设计稿 D 的收尾动作） */}
      <h2 className="display-face text-center text-[clamp(2.6rem,6vw,5rem)] font-extrabold">
        <SpringChars text={t(download.title)} />
      </h2>

      {/* 版本条 */}
      <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[12.5px] text-dim">
        {state.status === 'ready' ? (
          <>
            <span className="rounded-md border border-edge-brand bg-brand/8 px-2 py-1 text-brand">
              {state.release.version}
            </span>
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
      </Reveal>

      {/* 三态互斥，各自独立成块。
          注意 RevealGrid 必须自己就是 grid 容器——之前把它设成 display:contents
          （className="contents"）时它没有自己的盒子，「进入视口」的观察器
          永远观察不到零尺寸元素，两张平台卡就永远隐身（实测踩到）。 */}
      {state.status === 'loading' && (
        <div className="mx-auto mt-10 grid max-w-[860px] gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {state.status === 'ready' && cards.length > 0 && (
        <RevealGrid className="mx-auto mt-10 grid max-w-[860px] gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <RevealGridItem key={c.key}>
              <PlatformTile card={c} recommended={c.key === platform} />
            </RevealGridItem>
          ))}
        </RevealGrid>
      )}

      {/* 降级路径：一个 Release 都读不到，或读到了但没有能匹配的安装包 */}
      {(state.status === 'fallback' || (state.status === 'ready' && cards.length === 0)) && (
        <Reveal className="mx-auto mt-10 max-w-[860px]">
          <div className="rounded-2xl border border-edge bg-panel p-7 text-center">
            <p className="mx-auto max-w-[46ch] text-[15px] leading-[1.65] text-dim">{t(download.fallbackNote)}</p>
            <Magnetic className="mt-5 inline-block">
              <a
                href={site.latestReleaseUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-glow relative inline-block rounded-[14px] bg-gradient-to-br from-brand to-teal px-6 py-3 text-[14px] font-semibold text-on-brand"
              >
                {t(download.fallbackCta)} ↗
              </a>
            </Magnetic>
          </div>
        </Reveal>
      )}

      {/* 缺席的平台说实话，别装作不存在 */}
      {state.status === 'ready' && cards.length > 0 && (
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-[56ch] text-center text-[13.5px] leading-[1.6] text-dim">
            {t(download.missingPlatforms)}
          </p>
        </Reveal>
      )}
    </section>
  )
}

function PlatformTile({ card, recommended }: { card: PlatformCard; recommended: boolean }) {
  const { t } = usePrefs()
  const info = download.platforms[card.key]

  return (
    <a
      href={card.href}
      className={`group flex h-full flex-col rounded-2xl border p-7 transition-[border-color,box-shadow] duration-300 ${
        recommended ? 'border-edge-brand bg-brand/6' : 'border-edge bg-panel hover:border-edge-brand'
      }`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="display-face text-[19px] font-bold">{t(info.name)}</h3>
        {recommended && (
          <span className="shrink-0 rounded-md bg-gradient-to-br from-brand to-teal px-2 py-1 font-mono text-[10px] text-on-brand">
            {t(download.recommended)}
          </span>
        )}
      </div>

      <p className="mt-2 text-[13.5px] text-dim">{t(info.req)}</p>

      <div className="mt-6 flex items-center gap-3 font-mono text-[12px] text-dim">
        {card.sizeMB && <span>{card.sizeMB} MB</span>}
        <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-brand transition-transform group-hover:translate-y-0.5">
          <DownloadIcon />
          {t({ zh: '下载', en: 'Download' })}
        </span>
      </div>
    </a>
  )
}

/* 骨架屏与真卡等高：数据回来页面不往下跳（CLS——累积布局偏移，搜索引擎会扣分） */
function CardSkeleton() {
  return <div className="h-[168px] animate-pulse rounded-2xl border border-edge bg-panel" aria-hidden="true" />
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

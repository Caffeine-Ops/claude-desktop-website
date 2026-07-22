'use client'

/*
  安全与隐私段（收尾前的信任块）：四张图标卡，2×2 网格，弹簧错峰入场。
  受众是所有人（不再只对开发者说话），所以术语能省则省——BYOK 就地括号解释。
  文案在 content.ts 的 privacy，图标名对应下面的 ICONS 表。
*/

import { privacy } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { RevealGrid, RevealGridItem } from '../fx/Reveal'
import { SectionHead } from '../SectionHead'

/* 内联 SVG 图标（lucide 线条风），brand 色描边，跟着卡片走。 */
const ICONS: Record<string, React.ReactNode> = {
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.8 12.2 21 2" />
      <path d="m16 5 3 3" />
      <path d="m13.5 7.5 3 3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
}

export function Privacy() {
  const { t } = usePrefs()

  return (
    <section id="privacy" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[50px] pb-[90px]">
      {/* 图标描边共用的绿→青双色渐变，定义一次、四张卡共享（藏在 0×0 的 svg 里）。 */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <linearGradient id="privacy-icon-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4ade80" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      <SectionHead eyebrow={t(privacy.eyebrow)} title={t(privacy.title)} />

      <RevealGrid className="mt-11 grid gap-4 md:grid-cols-2">
        {privacy.points.map((p) => (
          <RevealGridItem
            key={p.title.en}
            className="rounded-[18px] border border-edge bg-panel p-[30px]"
          >
            {/* 图标搁在一个淡淡的品牌色底座里，收住视线 */}
            <span className="inline-flex size-11 items-center justify-center rounded-[12px] bg-brand/10 text-brand">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                // 描边走绿→青双色渐变，再叠一层绿色发光晕（赛博感）。
                stroke="url(#privacy-icon-grad)"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ filter: 'drop-shadow(0 0 5px rgba(74, 222, 128, 0.35))' }}
              >
                {ICONS[p.icon]}
              </svg>
            </span>
            <h3 className="mt-4 text-[19px] font-bold">{t(p.title)}</h3>
            <p className="mt-2.5 max-w-[44ch] text-[14px] leading-[1.7] text-dim">{t(p.body)}</p>
          </RevealGridItem>
        ))}
      </RevealGrid>
    </section>
  )
}

'use client'

/*
  第一屏（设计稿 D「发布会」）。
  左：逐字从模糊里升起的标题 + 真实下载按钮（磁性）；右：产出轨道永动装置；
  下：终端演示。主按钮的数据链路沿用旧版三态（loading / 直链 / 降级到 Releases）。
*/

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { download, hero, ui } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useRelease } from '@/lib/useRelease'
import { getPlatformCards, guessPlatform, FALLBACK_HREF } from '@/lib/github'
import { Magnetic } from '../fx/Magnetic'
import { useIntroDelay } from '../fx/Intro'
import { HeroWall } from '../HeroWall'
import { Orbit } from '../Orbit'
import { Terminal } from '../Terminal'

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const { t, lang } = usePrefs()
  const reduced = useReducedMotion()
  const introDelay = useIntroDelay()
  const state = useRelease()
  const [platform, setPlatform] = useState<ReturnType<typeof guessPlatform>>(null)

  // 猜系统必须等到浏览器里才做：服务器上没有 navigator。
  useEffect(() => setPlatform(guessPlatform()), [])

  const lines = hero.headline[lang]

  /* 主按钮三态（同旧版）：loading→占位；有直链→.dmg/.exe；其余→Releases 页。 */
  const cards = getPlatformCards(state.release)
  const match = platform ? cards.find((c) => c.key === platform) : undefined
  const primaryHref = match?.href ?? FALLBACK_HREF
  const primaryLabel = match
    ? `${t(ui.downloadFor)} ${t(download.platforms[match.key].name)}`
    : t({ zh: '下载最新版', en: 'Download the latest' })

  /* 非标题元素的错峰入场（标题的逐字动画单独编排） */
  const rise = (order: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay: introDelay + 0.35 + order * 0.09, ease: EASE },
        }

  /* 标题逐字：字符在两行间连续编号，跨行错峰不断流 */
  let charIndex = 0

  return (
    <section id="top" className="relative z-[1] mx-auto grid min-h-screen max-w-[1180px] content-center px-8 pt-[120px] pb-10">
      {/* 背景内容墙（Linear intake 式的 3D 倾斜卡片墙）。
          原来的四根光束退役了——和墙叠在一起是两种纵深语言打架。 */}
      <div className="pointer-events-none absolute inset-0">
        <HeroWall />
      </div>

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.08fr_1fr]">
        <div>
          <motion.span
            {...rise(0)}
            className="mb-[30px] inline-flex w-fit items-center gap-2 rounded-full border border-edge-brand bg-brand/5 px-[15px] py-[7px] font-mono text-[12px] text-brand"
          >
            <i className="dot-pulse size-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
            {t(hero.badge)}
          </motion.span>

          <h1 className="display-face text-[clamp(2.7rem,5.6vw,4.9rem)] leading-[1.1] font-extrabold">
            {lines.map((line, li) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                {[...line].map((ch, ci) => {
                  const delay = introDelay + charIndex++ * 0.028
                  const cls =
                    li === hero.accentLine
                      ? 'inline-block bg-gradient-to-br from-brand to-teal bg-clip-text text-transparent'
                      : 'inline-block'
                  return reduced ? (
                    <span key={ci} className={cls}>
                      {ch === ' ' ? '\u00A0' : ch}
                    </span>
                  ) : (
                    <motion.span
                      key={ci}
                      className={`${cls} will-change-transform`}
                      initial={{ opacity: 0, y: '0.7em', filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.7, delay, ease: EASE }}
                    >
                      {/* 空格必须是   转义：inline-block 里的普通空格塌成零宽（踩过两次） */}
                      {ch === ' ' ? '\u00A0' : ch}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>

          <motion.p {...rise(1)} className="mt-[26px] max-w-[46ch] text-[16.5px] leading-[1.7] text-dim">
            {t(hero.subline)}
          </motion.p>

          <motion.div {...rise(2)} className="mt-[38px] flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href={state.status === 'loading' ? undefined : primaryHref}
                aria-disabled={state.status === 'loading'}
                className={`btn-glow relative inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-br from-brand to-teal px-[30px] py-[15px] text-[15px] font-semibold text-on-brand ${
                  state.status === 'loading' ? 'pointer-events-none opacity-70' : ''
                }`}
              >
                <DownloadIcon />
                {state.status === 'loading' ? t({ zh: '正在获取最新版本…', en: 'Fetching latest…' }) : primaryLabel}
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#outputs"
                className="inline-block rounded-[14px] border border-edge px-[30px] py-[15px] text-[15px] font-semibold text-ink transition-colors hover:border-edge-brand"
              >
                {t(hero.secondaryCta)}
              </a>
            </Magnetic>
          </motion.div>

          {/* 信任条：真实版本号 + 体积（拿不到就只剩定位语，优雅降级） */}
          <motion.p {...rise(3)} className="mt-[22px] font-mono text-[12px] text-dim">
            {state.status === 'ready' && (
              <>
                <b className="font-medium text-brand">{state.release.version}</b>
                {' · '}
                {match?.sizeMB ? `${match.sizeMB} MB · ` : ''}
              </>
            )}
            {t(hero.trust)}
          </motion.p>
        </div>

        <Orbit />
      </div>

      <motion.div {...rise(4)} className="mt-16">
        <Terminal />
      </motion.div>

      <div aria-hidden="true" className="absolute bottom-[26px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] tracking-[0.3em] text-dim">
        SCROLL
        <i className="cue-line block h-[34px] w-px" style={{ background: 'linear-gradient(180deg,var(--brand),transparent)' }} />
      </div>
    </section>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

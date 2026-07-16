'use client'

/*
  第一屏。

  论点：这个产品把「一句话」变成「一个做完的文件」。所以标题讲产出，
  主视觉是产品自己的样子，按钮直接给你的系统。术语一个都不出现——
  普通用户在这一屏不需要知道 Agent 是什么。

  标题一行一行地起（stagger 错峰入场），是为了让人按顺序读完这三行；
  除此之外首屏没有别的动效——第一屏该被读，不该被表演。
*/

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { download, hero, ui } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useRelease } from '@/lib/useRelease'
import { getPlatformCards, guessPlatform, FALLBACK_HREF } from '@/lib/github'
import { AppFrame } from '../AppFrame'

export function Hero() {
  const { t, lang } = usePrefs()
  const reduced = useReducedMotion()
  const state = useRelease()
  const [platform, setPlatform] = useState<ReturnType<typeof guessPlatform>>(null)

  // 猜系统必须等到浏览器里才做：服务器上没有 navigator，猜了也是错的。
  useEffect(() => setPlatform(guessPlatform()), [])

  const lines = hero.headline[lang]

  /*
    主按钮的三条路径：
    - loading  ：还在等 GitHub。显示「正在获取…」，不给空白也不让按钮跳动。
    - 有直链   ：访客系统正好有安装包 → 按钮直接是那个 .dmg / .exe 的地址。
    - 其余一切 ：接口挂了、被限流了、或访客是 Linux（现在没这个包）→ 退回
                 Releases 页面。用户仍然下得到，只是少看一行版本号。
  */
  const cards = getPlatformCards(state.release)
  const match = platform ? cards.find((c) => c.key === platform) : undefined
  const primaryHref = match?.href ?? FALLBACK_HREF
  const primaryLabel = match
    ? `${t(ui.downloadFor)} ${t(download.platforms[match.key].name)}`
    : t({ zh: '下载最新版', en: 'Download the latest' })

  // 错峰入场：第 i 个元素晚 90ms 起。reduced 时返回空对象 = 直接就位，不动。
  const rise = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section id="top" className="relative overflow-hidden px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28">
      {/* 极淡的品牌绿光晕，只为了让首屏不是一块死白。pointer-events-none：别挡住底下的按钮。 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* clamp(最小, 跟着屏宽变, 最大)：字号自己随屏幕伸缩，不用写一堆断点。
            上限给到 5.4rem 是量着调的——再小标题就撑不满，首屏右半边会空得像没做完。 */}
        <h1 className="display-face max-w-[19ch] text-[clamp(2.3rem,7vw,5.4rem)] leading-[1.06] font-extrabold">
          {lines.map((line, i) => (
            <motion.span key={line} {...rise(i)} className="block">
              {/* 强调色落在「产出」那一行，不落在「AI」上——这页卖的是结果，不是技术。 */}
              <span className={i === hero.accentLine ? 'text-brand' : undefined}>{line}</span>
            </motion.span>
          ))}
        </h1>

        <motion.p
          {...rise(lines.length)}
          className="mt-7 max-w-[52ch] text-[17px] leading-[1.65] text-graphite"
        >
          {t(hero.subline)}
        </motion.p>

        <motion.div
          {...rise(lines.length + 1)}
          className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          <a
            href={state.status === 'loading' ? undefined : primaryHref}
            aria-disabled={state.status === 'loading'}
            className={`inline-flex items-center gap-2.5 rounded-xl bg-brand px-6 py-3.5 text-[15px] font-semibold text-brand-on transition-opacity ${
              state.status === 'loading' ? 'pointer-events-none opacity-60' : 'hover:opacity-90'
            }`}
          >
            <DownloadIcon />
            {state.status === 'loading' ? t({ zh: '正在获取最新版本…', en: 'Fetching latest…' }) : primaryLabel}
          </a>

          <a href="#download" className="text-[14px] text-graphite underline-offset-4 hover:text-ink hover:underline">
            {t(hero.otherPlatforms)} ↓
          </a>
          <a href="#outputs" className="text-[14px] text-graphite underline-offset-4 hover:text-ink hover:underline">
            {t(hero.secondaryCta)}
          </a>
        </motion.div>

        {/* 信任条：版本号用 mono——版本号是机器的话，该长得像机器的话。 */}
        <motion.div
          {...rise(lines.length + 2)}
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-graphite"
        >
          {state.status === 'ready' && (
            <>
              <span className="text-brand">{state.release.version}</span>
              <span aria-hidden="true">·</span>
              {match?.sizeMB ? (
                <>
                  <span>{match.sizeMB} MB</span>
                  <span aria-hidden="true">·</span>
                </>
              ) : null}
            </>
          )}
          <span className="font-sans">{t(hero.trust)}</span>
        </motion.div>

        <motion.div
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, y: 28 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const },
              })}
          className="mt-16"
        >
          <AppFrame caption={t(hero.shotCaption)} prompt={t(hero.shotPrompt)} />
        </motion.div>
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

'use client'

/*
  顶栏：浮岛式玻璃条（设计稿 D）。fixed 悬浮居中，不是通栏 sticky。
  开场幕布掀走后从上方浮入（延迟由 useIntroDelay 提供）。
*/

import { motion, useReducedMotion } from 'motion/react'
import { Logo } from './Logo'
import { Magnetic } from './fx/Magnetic'
import { useIntroDelay } from './fx/Intro'
import { nav, site, ui } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'

export function Nav() {
  const { t, lang, setLang } = usePrefs()
  const reduced = useReducedMotion()
  const introDelay = useIntroDelay()

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: introDelay + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-[14px] z-50 mx-auto flex w-[min(1080px,calc(100%-40px))] items-center gap-6 rounded-2xl border border-edge px-3 py-[11px] pl-5 backdrop-blur-xl"
      style={{ background: 'var(--glass)', boxShadow: 'var(--shadow-nav)' }}
    >
      <a href="#top" className="flex shrink-0 items-center gap-2.5">
        <Logo size={22} id="nav" />
        <span className="display-face text-[14.5px] font-bold">Claude Desktop</span>
      </a>

      <nav className="hidden items-center gap-6 md:flex">
        {nav.map((item) => (
          <a key={item.href} href={item.href} className="text-[13px] text-dim transition-colors hover:text-ink">
            {t(item.label)}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          aria-label={t(ui.langToggle)}
          className="h-9 rounded-lg px-2.5 font-mono text-[12px] text-dim transition-colors hover:bg-panel hover:text-ink"
        >
          {lang === 'zh' ? 'EN' : '中'}
        </button>

        <a
          href={site.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub"
          className="grid size-9 place-items-center rounded-lg text-dim transition-colors hover:bg-panel hover:text-ink"
        >
          <GitHubIcon />
        </a>

        <Magnetic className="ml-2">
          <a
            href="#download"
            className="inline-block rounded-[11px] bg-gradient-to-br from-brand to-teal px-[18px] py-[9px] text-[13px] font-semibold text-on-brand"
          >
            {t({ zh: '下载', en: 'Download' })}
          </a>
        </Magnetic>
      </div>
    </motion.header>
  )
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

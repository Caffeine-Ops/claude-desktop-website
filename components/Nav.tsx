'use client'

/*
  顶栏：浮岛式玻璃条（设计稿 D）。fixed 悬浮居中，不是通栏 sticky。
  开场幕布掀走后从上方浮入（延迟由 useIntroDelay 提供）。
*/

import { motion, useReducedMotion } from 'motion/react'
import { Logo } from './Logo'
import { Magnetic } from './fx/Magnetic'
import { useIntroDelay } from './fx/Intro'
import { nav, ui } from '@/lib/content'
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
        <span className="display-face text-[14.5px] font-bold">Cowork</span>
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

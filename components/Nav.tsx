'use client'

/*
  顶栏。固定在顶上（sticky），滚动时变成半透明毛玻璃。

  多页扩展的口子（设计文档 §5.8）：现在每个链接是页内锚点（#outputs 这种），
  将来拆多页时把 href 换成 /features、/download 就行，结构不用动。
*/

import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import { nav, site, ui } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'

export function Nav() {
  const { t, lang, setLang, theme, toggleTheme } = usePrefs()
  const [scrolled, setScrolled] = useState(false)

  // 只在滚出首屏后才给顶栏加毛玻璃和描边——停在最顶上时它该融进页面里，别一开始就切一道线。
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-rule bg-paper/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="flex shrink-0 items-center gap-2.5">
          <Logo size={26} />
          <span className="display-face text-[15px] font-bold tracking-tight">Claude Desktop</span>
        </a>

        {/* 锚点链接在窄屏藏起来：手机上首要任务是「读懂 + 下载」，导航挤进来只会碍事。 */}
        <nav className="ml-4 hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13.5px] text-graphite transition-colors hover:text-ink"
            >
              {t(item.label)}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggleTheme}
            aria-label={t(ui.themeToggle)}
            className="grid size-9 place-items-center rounded-lg text-graphite transition-colors hover:bg-surface hover:text-ink"
          >
            {/* 图标显示的是「点了会变成什么」，不是当前状态——按钮该说它会做什么。 */}
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            aria-label={t(ui.langToggle)}
            className="h-9 rounded-lg px-2.5 font-mono text-[12px] text-graphite transition-colors hover:bg-surface hover:text-ink"
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>

          <a
            href={site.repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="grid size-9 place-items-center rounded-lg text-graphite transition-colors hover:bg-surface hover:text-ink"
          >
            <GitHubIcon />
          </a>

          <a
            href="#download"
            className="ml-2 rounded-lg bg-ink px-4 py-2 text-[13.5px] font-semibold text-paper transition-opacity hover:opacity-85"
          >
            {t({ zh: '下载', en: 'Download' })}
          </a>
        </div>
      </div>
    </header>
  )
}

/* 图标一律 currentColor + aria-hidden：颜色跟着父元素走，读屏软件跳过（旁边有 aria-label）。 */

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

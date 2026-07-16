'use client'

/*
  页脚（设计文档 §5.8）。语言切换与顶栏联动——它们读的是同一个 PrefsProvider，
  所以在哪儿切都一样，不需要额外同步。
*/

import { footer, site, ui } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useRelease } from '@/lib/useRelease'
import { Logo } from '../Logo'

export function Footer() {
  const { t, lang, setLang } = usePrefs()
  const state = useRelease()

  const links = [
    { href: site.repoUrl, label: footer.links.github },
    { href: site.readmeUrl, label: footer.links.readme },
    { href: site.releasesUrl, label: footer.links.releases },
    { href: site.licenseUrl, label: footer.links.license },
    { href: site.issuesUrl, label: footer.links.issues },
  ]

  return (
    <footer className="border-t border-rule px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <span className="display-face text-[15px] font-bold">Claude Desktop</span>
            </div>
            <p className="mt-3 max-w-[34ch] text-[14px] text-graphite">{t(footer.tagline)}</p>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-2.5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[14px] text-graphite transition-colors hover:text-ink"
              >
                {t(l.label)}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 font-mono text-[11.5px] text-graphite">
          <span>
            {t(footer.credit)}
            {state.status === 'ready' && (
              <>
                {' · '}
                <span className="text-brand">{state.release.version}</span>
              </>
            )}
          </span>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="transition-colors hover:text-ink"
          >
            {t(ui.langToggle)}
          </button>
        </div>
      </div>
    </footer>
  )
}

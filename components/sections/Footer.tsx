'use client'

/*
  页脚：设计稿 D 的极简两行式。语言切换与顶栏联动（同一个 PrefsProvider）。
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
    <footer className="relative z-[1] border-t border-edge">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-8 py-10">
        <div className="flex items-center gap-2.5">
          <Logo size={20} id="footer" />
          <span className="font-mono text-[12px] text-dim">
            Claude Desktop · {t(footer.credit)}
            {state.status === 'ready' && (
              <>
                {' · '}
                <span className="text-brand">{state.release.version}</span>
              </>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-dim transition-colors hover:text-ink"
            >
              {t(l.label)}
            </a>
          ))}
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="text-dim transition-colors hover:text-ink">
            {t(ui.langToggle)}
          </button>
        </div>
      </div>
    </footer>
  )
}

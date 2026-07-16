import { site } from '@/lib/site'

// 页脚占位骨架：GitHub 链接 + 收尾。
export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
      <a href={site.repoUrl} target="_blank" rel="noreferrer" className="hover:text-white">
        GitHub
      </a>
      <p className="mt-3">© {site.name}</p>
    </footer>
  )
}

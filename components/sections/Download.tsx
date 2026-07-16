import { platforms } from '@/lib/site'

// 下载区占位骨架：三平台卡片，均指向 GitHub Releases 最新版。
export function Download() {
  return (
    <section id="download" className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 className="text-3xl font-bold sm:text-4xl">下载 Claude Desktop</h2>
      <p className="mt-3 text-[var(--color-muted)]">支持 macOS / Windows / Linux</p>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {platforms.map((p) => (
          <a
            key={p.key}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 transition hover:border-[var(--color-brand)]/50"
          >
            <div className="text-4xl">{p.icon}</div>
            <div className="mt-4 font-semibold">{p.label}</div>
            <div className="mt-1 text-sm text-[var(--color-muted)]">{p.note}</div>
          </a>
        ))}
      </div>
    </section>
  )
}

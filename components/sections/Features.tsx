import { features } from '@/lib/site'

// 功能区占位骨架：7 大能力模式的网格。方案定稿后加滚动错峰淡入 + 悬停发光。
export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">它能替你干这些活</h2>
      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.key}
            className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              {f.beta && (
                <span className="rounded-full border border-[var(--color-brand)]/40 px-2 py-0.5 text-xs text-[var(--color-brand)]">
                  Beta
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{f.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

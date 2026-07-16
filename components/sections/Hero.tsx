import { site } from '@/lib/site'

// 首屏占位骨架：结构先立好，方案定稿后加 Motion 入场动画（错峰淡入上浮）。
export function Hero() {
  return (
    <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">{site.name}</h1>
      <p className="mt-6 max-w-2xl text-xl text-white/80">{site.tagline}</p>
      <p className="mt-3 max-w-2xl text-base text-[var(--color-muted)]">{site.subline}</p>
      <a
        href="#download"
        className="mt-10 rounded-full bg-[var(--color-brand)] px-8 py-3 font-medium text-black transition hover:opacity-90"
      >
        下载
      </a>
    </section>
  )
}

'use client'

/*
  真实界面区:主窗口 + 场景列表(tabs-preview 模式)。
  左边一扇大窗口播真实操作录屏,右边四个固定的场景标签卡,
  悬停/点击标签 → 主窗口交叉淡化(crossfade)切到那一段。

  为什么放弃上一版的「缩略卡飞进主窗口」共享布局方案:
  凡是「元素会移动/替换到鼠标附近」的交互,都可能出现卡片扫过指针
  再次触发切换的连环弹,以及重挂载瞬间的闪屏——修一个场景漏一个场景。
  标签卡固定不动 + 主窗口只做透明度渐变,把这两类问题从根上消灭:
  指针底下永远是同一个元素,切换时旧画面淡出、新画面同时淡入,无空窗。

  其余行为:
  - 主窗口视频进入视口自动播(无声),离开暂停;切换后自动接着播。
  - 触屏没有 hover:点击标签切换,行为一致。
  - 系统开了「减少动态效果」:瞬切不淡化,主视频不自动播、显示原生控制条。
  - 每个标签卡自带场景说明,主窗口下不再重复一条 caption。
*/

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { screens } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal } from '../fx/Reveal'
import { SectionHead } from '../SectionHead'
import { ScreenDetailModal } from './ScreenDetailModal'

type Item = (typeof screens.items)[number]

function MainVideo({ item, reduced, label }: { item: Item; reduced: boolean; label: string }) {
  const vid = useRef<HTMLVideoElement>(null)
  /* 进入视口 35% 开始播,离开暂停——首屏没滚到时不空转 */
  useEffect(() => {
    if (reduced) return
    const v = vid.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduced])

  return (
    <video
      ref={vid}
      src={item.video}
      poster={item.src}
      muted
      loop
      playsInline
      preload="auto"
      controls={reduced || undefined}
      className="block h-full w-full"
      aria-label={label}
    />
  )
}

export function Screens() {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false) // 放大弹层开关
  const [paused, setPaused] = useState(false) // 鼠标悬停本区域时暂停轮播
  const lastTrigger = useRef<HTMLElement | null>(null)
  const main = screens.items[active]

  /* 自动轮播:每 5 秒切到下一段(绕回第一段)。
     依赖里带上 active——每次切换(不管自动还是手动)都会重挂计时器,
     等于「用户手动选了就重新数 5 秒」,不会刚选完立刻被抢走。
     弹窗打开、鼠标悬停、或系统减少动态时不自动播。 */
  useEffect(() => {
    if (reduced || open || paused) return
    const id = setTimeout(() => {
      setActive((i) => (i + 1) % screens.items.length)
    }, 5000)
    return () => clearTimeout(id)
  }, [active, open, paused, reduced])

  const openModal = () => {
    lastTrigger.current = document.activeElement as HTMLElement
    setOpen(true)
  }
  const closeModal = () => {
    setOpen(false)
    lastTrigger.current?.focus() // 焦点归还触发元素
    lastTrigger.current = null
  }

  return (
    <section id="screens" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[50px] pb-[90px]">
      <SectionHead eyebrow={t(screens.eyebrow)} title={t(screens.title)} />
      <Reveal delay={0.1} className="mt-3 font-mono text-[12px] text-dim">
        {t(screens.note)}
      </Reveal>

      <Reveal
        delay={0.12}
        className="mt-9 flex flex-col gap-5 lg:flex-row"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── 主窗口:固定位置,内容交叉淡化;点整扇窗放大观看 ── */}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openModal}
            aria-label={t({ zh: '放大观看录屏:', en: 'Watch recording full-size: ' }) + t(main.bar)}
            className="group block w-full cursor-pointer overflow-hidden rounded-[18px] border border-edge bg-panel text-left outline-none transition-[border-color] duration-300 hover:border-edge-brand focus-visible:border-edge-brand"
            style={{ boxShadow: 'var(--shadow-term)' }}
          >
            <div className="flex items-center gap-[7px] border-b border-edge px-4 py-[11px]">
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <span className="ml-2.5 font-mono text-[11px] whitespace-nowrap text-dim">{t(main.bar)}</span>
            </div>
            {/* 容器按视频比例定高;新旧两层在同一格子里叠着淡化,不会露底闪白 */}
            <div className="relative aspect-[1920/1050]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={main.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35, ease: 'easeOut' }}
                >
                  <MainVideo item={main} reduced={!!reduced} label={t(main.caption)} />
                </motion.div>
              </AnimatePresence>

              {/* 可点信号:hover/聚焦时压暗 + 中央放大按钮淡入(触屏/减少动态时常显) */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 ${
                  reduced ? 'bg-black/10' : 'group-hover:bg-black/25 group-focus-visible:bg-black/25'
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 rounded-full border border-edge-brand bg-panel/85 px-3.5 py-1.5 font-mono text-[12px] text-brand backdrop-blur transition-all duration-300 ${
                    reduced
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
                  }`}
                >
                  <span className="text-[13px] leading-none">▶</span>
                  {t({ zh: '放大观看', en: 'Watch full-size' })}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* ── 场景列表:固定不动的标签卡,悬停/点击切换 ── */}
        <div className="grid shrink-0 grid-cols-2 content-start gap-3 lg:w-[300px] lg:grid-cols-1" role="tablist">
          {screens.items.map((item, i) => {
            const on = i === active
            return (
              <button
                key={item.src}
                type="button"
                role="tab"
                aria-selected={on}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`cursor-pointer rounded-[14px] border p-4 text-left transition-colors duration-200 ${
                  on ? 'border-brand/60 bg-brand/8' : 'border-edge bg-panel hover:border-brand/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-[12px] ${on ? 'text-brand' : 'text-dim'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[14px] font-bold">{t(item.bar)}</span>
                  {on && <span className="ml-auto size-1.5 rounded-full bg-brand" aria-hidden="true" />}
                </div>
                <p className="mt-1.5 line-clamp-3 text-[12px] leading-[1.6] text-dim">{t(item.caption)}</p>
              </button>
            )
          })}
        </div>
      </Reveal>

      <ScreenDetailModal item={open ? main : null} onClose={closeModal} />
    </section>
  )
}

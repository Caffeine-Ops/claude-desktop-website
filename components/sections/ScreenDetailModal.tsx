'use client'

/*
  真实界面放大弹层:点主窗口打开,把那一段操作录屏放到一扇产品大窗里看。
  - 小窗里录屏是静音循环自动播的预览;弹层里带 controls(可拖进度、可解静音),
    autoPlay + muted 保证「点开直接播」(带声 autoPlay 会被浏览器拦成暂停)。
  - 无障碍:role=dialog + aria-modal;Esc / 点背景 / 关闭按钮均可关;
    打开时锁滚动、焦点移入关闭按钮,关闭后焦点归还触发元素(由 Screens 侧处理)。
  - 减少动态效果:去掉弹出缩放/淡入,直接显隐。
  与产出弹层 OutputDetailModal 同一套壳,这里只装 video、并在底部补一条场景说明。
*/

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { screens } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'

type Item = (typeof screens.items)[number]

export function ScreenDetailModal({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Esc 关闭 + 锁滚动 + 打开时焦点进关闭按钮
  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={t(item.bar)}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* 暗背景。pointer-events-none:让点击穿透到外层容器,否则这层 absolute
              inset-0 会拦掉 mousedown,使「点背景关闭」的 target===currentTarget 永远 false。 */}
          <div className="pointer-events-none absolute inset-0 bg-black/75" aria-hidden="true" />

          {/* 产品大窗 */}
          <motion.div
            className="relative flex max-h-[88vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[18px] border border-edge bg-panel"
            style={{ boxShadow: 'var(--shadow-term)' }}
            initial={reduced ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 三点栏 + 场景名 + 关闭 */}
            <div className="flex items-center gap-[7px] border-b border-edge px-4 py-[11px]">
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <span className="ml-2.5 font-mono text-[11px] text-dim">{t(item.bar)}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t({ zh: '关闭', en: 'Close' })}
                className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-dim transition-colors hover:bg-white/8 hover:text-ink"
              >
                <span aria-hidden="true" className="text-[15px] leading-none">✕</span>
              </button>
            </div>

            {/* 录屏播放器 */}
            <div className="min-h-0 flex-1 overflow-hidden bg-black">
              <video
                key={item.video}
                src={item.video}
                poster={item.src}
                controls
                autoPlay
                muted /* 带声 autoPlay 会被浏览器拦成暂停;muted 保证点开直接播,用户可用 controls 解除静音 */
                loop
                playsInline
                className="max-h-[74vh] w-full bg-black"
                aria-label={t(item.caption)}
              />
            </div>

            {/* 场景说明 */}
            <div className="border-t border-edge px-5 py-3.5">
              <p className="text-[13px] leading-[1.65] text-dim">{t(item.caption)}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

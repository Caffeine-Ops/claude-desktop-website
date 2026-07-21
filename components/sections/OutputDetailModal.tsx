'use client'

/*
  产出成品弹层:点卡片打开,成品浮在桌面壁纸上的一扇产品大窗里。
  - html 成品用 <iframe>(可滚动浏览);video 成品用 <video controls>。
  - 壁纸 = /screens/outputs/desktop-bg.png,作暗背景之上的桌面底。
  - 无障碍:role=dialog + aria-modal;Esc / 点背景 / 关闭按钮均可关;
    打开时锁滚动、焦点移入关闭按钮,关闭后焦点归还触发卡片(由 Outputs 侧处理)。
  - 减少动态效果:去掉弹出缩放/淡入,直接显隐。
*/

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { outputCards } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'

type OutputCardT = (typeof outputCards)[number]

export function OutputDetailModal({ card, onClose }: { card: OutputCardT | null; onClose: () => void }) {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  /* iframe 成品页加载完成前先盖一层深色占位,加载好再淡入——
     否则打开瞬间会露出 iframe 的白底,闪一道白屏。换成品(card.sample 变)就重置。 */
  const [loaded, setLoaded] = useState(false)
  useEffect(() => setLoaded(false), [card?.sample])

  // Esc 关闭 + 锁滚动 + 打开时焦点进关闭按钮
  useEffect(() => {
    if (!card) return
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
  }, [card, onClose])

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={t(card.title)}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* 暗背景 + 桌面壁纸。pointer-events-none:让点击穿透到外层容器,
              否则这两层 absolute inset-0 会拦掉 mousedown,使「点背景关闭」的
              target===currentTarget 判定永远为 false（点背景关不掉）。 */}
          <div className="pointer-events-none absolute inset-0 bg-black/70" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: 'url(/screens/outputs/desktop-bg.png)' }}
            aria-hidden="true"
          />

          {/* 产品大窗 */}
          <motion.div
            className="relative flex max-h-[88vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[18px] border border-edge bg-panel"
            style={{ boxShadow: 'var(--shadow-term)' }}
            initial={reduced ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 三点栏 + 标题 + 关闭 */}
            <div className="flex items-center gap-[7px] border-b border-edge px-4 py-[11px]">
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <span className="ml-2.5 flex items-center gap-2 font-mono text-[11px] text-dim">
                <span aria-hidden="true">{card.icon}</span>
                {t(card.title)}
                <span className="text-brand">{card.ext}</span>
              </span>
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

            {/* 成品内容:html → iframe;video → 播放器 */}
            <div className="relative min-h-0 flex-1 overflow-auto bg-panel">
              {card.sampleKind === 'html' ? (
                <>
                  {/* 加载中占位:深色底 + 提示,盖住 iframe 未就绪时的白底 */}
                  {!loaded && (
                    <div
                      className="absolute inset-0 z-[1] grid place-items-center bg-panel font-mono text-[12px] text-dim"
                      aria-hidden="true"
                    >
                      {t({ zh: '成品加载中…', en: 'Loading…' })}
                    </div>
                  )}
                  <iframe
                    src={card.sample}
                    title={t(card.shotAlt)}
                    onLoad={() => setLoaded(true)}
                    /* 只给 allow-scripts、不给 allow-same-origin:成品页运行时从 CDN 拉第三方 JS
                       (Tailwind Play / Google Fonts),两者同开会让 iframe 拿到「与父站同源」的特权,
                       那段不受控 CDN 脚本就能触到主站 DOM。隔离源下 Tailwind CDN 仍能正常渲染。 */
                    sandbox="allow-scripts"
                    className={`h-[78vh] w-full border-0 bg-white transition-opacity duration-300 ${
                      loaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              ) : (
                <video
                  src={card.sample}
                  controls
                  autoPlay
                  muted /* 无 muted 时带声 autoPlay 会被浏览器拦成暂停;muted 保证「点开直接播」,用户可用 controls 解除静音 */
                  playsInline
                  className="max-h-[78vh] w-full bg-black"
                  aria-label={t(card.shotAlt)}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

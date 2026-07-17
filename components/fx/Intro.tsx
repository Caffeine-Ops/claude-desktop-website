'use client'

/*
  开场序列：品牌光标自己描画出来 → 幕布上掀。

  时间轴全在 CSS 里（globals.css 的 intro-* 动画），带 2.6s 的纯 CSS 兜底：
  就算这段 JS 全挂，幕布也会自己掀走，内容不可能被永远盖住。
  这里的 JS 只做两件事：
  1. 同一会话内第二次进来跳过开场（sessionStorage）——每次刷新都看片头会烦；
  2. 播完把节点整个卸掉，别留一个 fixed 层在页面顶上挡事件。
*/

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const SEEN_KEY = 'cd-intro-seen'

/** Hero 的入场编排要等幕布掀走。已看过开场时返回 0（立即开始）。 */
export function useIntroDelay(): number {
  const [delay, setDelay] = useState(1.75)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) setDelay(0.1)
    } catch {
      /* 隐私模式读不了就当第一次 */
    }
  }, [])
  return delay
}

export function Intro() {
  const reduced = useReducedMotion()
  const [gone, setGone] = useState(false)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) {
        setSkip(true)
        return
      }
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* 读写失败都按「第一次」处理，最多多看一遍片头 */
    }
    // CSS 时间轴：2.6s 开掀 + 0.7s 掀完，3.4s 后节点可以安全卸掉
    const t = setTimeout(() => setGone(true), 3400)
    return () => clearTimeout(t)
  }, [])

  if (reduced || gone || skip) return null
  return (
    <div className="intro-overlay fixed inset-0 z-[100] grid place-items-center bg-canvas" aria-hidden="true">
      <div className="text-center">
        <svg viewBox="0 0 24 24" fill="none" className="mx-auto size-[72px]">
          <defs>
            <linearGradient id="intro-g" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--brand)" />
              <stop offset="1" stopColor="var(--teal)" />
            </linearGradient>
          </defs>
          <path
            className="intro-draw"
            d="M5.2 3.6 L19.8 10.6 L13.1 13.4 L10.3 20.4 Z"
            stroke="url(#intro-g)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <div className="intro-word mt-[18px] font-mono text-[13px] tracking-[0.35em] text-dim">
          CLAUDE DESKTOP
        </div>
      </div>
    </div>
  )
}

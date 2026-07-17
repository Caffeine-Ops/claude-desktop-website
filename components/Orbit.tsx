'use client'

/*
  产出轨道：Hero 右侧的永动装置。一个光标，所有产出绕着它转——
  这个装置就是产品定位画成的图（装饰也要携带信息）。

  轨道旋转是纯 CSS（globals.css 的 orbitOuter/Inner，rotate-translate-rotate
  首尾抵消保持芯片直立；负 delay 摊开角度）。这里只加鼠标视差：
  整个星系跟着视线慢半拍漂移。视差在外层，轨道动画在卫星上——两层 transform 各管各的。
*/

import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { ensurePointerTracking, pointerX, pointerY } from './fx/pointer'
import { Logo } from './Logo'

const OUTER = [
  { icon: '📊', ext: '.pptx', delay: '0s' },
  { icon: '📈', ext: '.xlsx', delay: '-7.3s' },
  { icon: '📄', ext: '.docx', delay: '-14.7s' },
  { icon: '🖼', ext: '.png', delay: '-22s' },
  { icon: '🎬', ext: '.mp4', delay: '-29.3s' },
  { icon: '📉', ext: '.html', delay: '-36.7s' },
]
const INNER = [
  { name: 'ppt-master', delay: '0s' },
  { name: 'imagegen', delay: '-7.5s' },
  { name: 'sora', delay: '-15s' },
  { name: 'spreadsheets', delay: '-22.5s' },
]

export function Orbit() {
  const reduced = useReducedMotion()
  // 视差要等挂载：spring 初值来自指针位置，服务器渲染的 transform 和
  // 客户端首帧对不上会报 hydration 不匹配（实测抓到）。轨道自转是纯 CSS，不受影响。
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    if (!reduced) ensurePointerTracking()
  }, [reduced])

  // 视差：指针离屏幕中心的偏移 × 0.02，弹簧跟随
  const px = useSpring(useTransform(pointerX, (v) => (v - (typeof window === 'undefined' ? 0 : innerWidth / 2)) * 0.02), { stiffness: 50, damping: 20 })
  const py = useSpring(useTransform(pointerY, (v) => (v - (typeof window === 'undefined' ? 0 : innerHeight / 2)) * 0.02), { stiffness: 50, damping: 20 })

  return (
    <div className="relative hidden h-[580px] place-items-center lg:grid" aria-hidden="true">
      <motion.div className="relative size-[560px]" style={!mounted || reduced ? undefined : { x: px, y: py }}>
        {/* 轨道环：一虚一实，整体慢转 */}
        <svg className="orbit-rings absolute inset-0" viewBox="0 0 560 560">
          <circle cx="280" cy="280" r="258" fill="none" stroke="var(--edge-brand)" strokeWidth="1" strokeDasharray="3 11" />
          <circle cx="280" cy="280" r="156" fill="none" stroke="var(--edge-brand)" strokeWidth="1" opacity="0.7" />
        </svg>

        {/* 中心脉冲环 ×2（错开半拍） */}
        <span className="pulse-ring pointer-events-none absolute top-1/2 left-1/2 size-[112px] rounded-full border border-brand/40" />
        <span className="pulse-ring pointer-events-none absolute top-1/2 left-1/2 size-[112px] rounded-full border border-brand/40" style={{ animationDelay: '1.7s' }} />

        {/* 核心：发光的品牌光标盘 */}
        <div
          className="absolute top-1/2 left-1/2 grid size-[112px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-edge-brand"
          style={{
            background: 'radial-gradient(circle at 35% 28%, var(--panel), var(--canvas))',
            boxShadow: '0 0 60px -8px color-mix(in srgb, var(--brand) 35%, transparent)',
          }}
        >
          <Logo size={46} id="orbit" />
        </div>

        {/* 外圈：产出文件（顺时针 44s） */}
        <div className="absolute inset-0 font-mono">
          {OUTER.map((s) => (
            <span key={s.ext} className="sat-outer absolute top-1/2 left-1/2 will-change-transform" style={{ animationDelay: s.delay }}>
              <span className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-[11px] border border-edge bg-panel/90 px-[13px] py-2 text-[12px] whitespace-nowrap text-dim" style={{ boxShadow: 'var(--shadow-card)' }}>
                {s.icon} <b className="font-medium text-brand">{s.ext}</b>
              </span>
            </span>
          ))}
        </div>

        {/* 内圈：技能名（逆时针 30s） */}
        <div className="absolute inset-0 font-mono">
          {INNER.map((s) => (
            <span key={s.name} className="sat-inner absolute top-1/2 left-1/2 will-change-transform" style={{ animationDelay: s.delay }}>
              <span className="flex -translate-x-1/2 -translate-y-1/2 items-center rounded-[9px] border border-edge bg-panel/90 px-[11px] py-1.5 text-[11px] whitespace-nowrap" style={{ boxShadow: 'var(--shadow-card)' }}>
                <b className="font-medium text-brand">{s.name}</b>
              </span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

'use client'

/*
  磁性外壳：包住谁，谁就在鼠标进入 130px 引力圈时被轻轻吸向指针，出圈弹回。
  弹簧驱动（stiffness/damping 手调过），吸附量是偏移的 28%——设计稿 D 的参数原样平移。
  reduced motion 下退化为普通容器。
*/

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { ensurePointerTracking, pointerX, pointerY } from './pointer'

const RADIUS = 130
const PULL = 0.28

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const x = useSpring(tx, { stiffness: 260, damping: 22 })
  const y = useSpring(ty, { stiffness: 260, damping: 22 })

  useEffect(() => {
    if (reduced) return
    ensurePointerTracking()
    // 订阅共享指针：每次移动算一次到按钮中心的距离。getBoundingClientRect
    // 每次都读是刻意的——按钮会随滚动移动，缓存位置会吸错地方。
    const update = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = pointerX.get() - (r.left + r.width / 2)
      const dy = pointerY.get() - (r.top + r.height / 2)
      const inRange = dx * dx + dy * dy < RADIUS * RADIUS
      tx.set(inRange ? dx * PULL : 0)
      ty.set(inRange ? dy * PULL : 0)
    }
    const unsubX = pointerX.on('change', update)
    const unsubY = pointerY.on('change', update)
    return () => {
      unsubX()
      unsubY()
    }
  }, [reduced, tx, ty])

  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div ref={ref} className={className} style={{ x, y }}>
      {children}
    </motion.div>
  )
}

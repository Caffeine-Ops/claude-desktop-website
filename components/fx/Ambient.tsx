'use client'

/*
  氛围层三件套：滚动进度条 + 鼠标光斑 + 数据尘埃。
  都是 fixed 定位的全局装饰，收在一个文件里由 page 挂载一次。
*/

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { usePrefs } from '@/lib/prefs'
import { ensurePointerTracking, pointerX, pointerY } from './pointer'

/*
  「挂载后再渲染」门闩：进度条/光斑读的是浏览器的滚动与指针状态，
  服务器上没有这些，硬渲染出来的 transform 和客户端首帧必然对不上
  （React 会报 hydration 不匹配——实测在 ProgressBar 上抓到）。
  纯装饰层没有 SEO 价值，等到了浏览器里再出现，一帧都不亏。
*/
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

/** 顶部滚动进度条：滚多少走多少（滚动驱动，不是时间驱动）。 */
export function ProgressBar() {
  const mounted = useMounted()
  const { scrollYProgress } = useScroll()
  if (!mounted) return null
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[99] h-[2px] origin-left bg-gradient-to-r from-brand to-teal"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

/** 鼠标光斑：慢半拍跟随的品牌色光晕（浅色主题下是极淡的绿晕，令牌控制）。 */
export function Glow() {
  const mounted = useMounted()
  const reduced = useReducedMotion()
  useEffect(() => ensurePointerTracking(), [])
  /*
    useSpring 给坐标加「惯性」——目标值瞬间变，弹簧值慢慢追。
    「跟不上」的柔感就是这么来的（设计稿里用 lerp 手写，这是同一件事的 Motion 写法）。
  */
  const x = useSpring(pointerX, { stiffness: 60, damping: 20 })
  const y = useSpring(pointerY, { stiffness: 60, damping: 20 })
  const left = useTransform(x, (v) => v - 280)
  const top = useTransform(y, (v) => v - 280)

  if (!mounted || reduced) return null
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-0 size-[560px] rounded-full"
      style={{
        x: left,
        y: top,
        background: 'radial-gradient(circle, var(--glow-tint), transparent 62%)',
      }}
    />
  )
}

/** 数据尘埃：canvas 上缓慢上飘的小点。颜色按主题走（白底上亮绿看不见）。 */
export function Dust() {
  const reduced = useReducedMotion()
  const { theme } = usePrefs()
  const ref = useRef<HTMLCanvasElement>(null)
  // 颜色放 ref：换主题不重启粒子（重启会看到所有粒子闪一下重新洗牌）
  const color = useRef({ fill: '#4ade80', boost: 1 })
  color.current = theme === 'light' ? { fill: '#15803d', boost: 0.55 } : { fill: '#4ade80', boost: 1 }

  useEffect(() => {
    if (reduced) return
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    const size = () => {
      W = cv.width = innerWidth
      H = cv.height = innerHeight
    }
    size()
    addEventListener('resize', size)

    const N = 70
    const ps = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.6 + Math.random() * 1.6,
      v: 0.0002 + Math.random() * 0.0006,
      a: 0.15 + Math.random() * 0.4,
      ph: Math.random() * 6.28,
    }))

    let t = 0
    let raf = 0
    const loop = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = color.current.fill
      for (let i = 0; i < N; i++) {
        const p = ps[i]
        p.y -= p.v
        if (p.y < -0.02) p.y = 1.02
        ctx.globalAlpha = p.a * color.current.boost * (0.55 + 0.45 * Math.sin(t + p.ph))
        ctx.fillRect(p.x * W, p.y * H, p.s, p.s)
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', size)
    }
  }, [reduced])

  if (reduced) return null
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}

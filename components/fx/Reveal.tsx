'use client'

/*
  滚动入场原语（设计稿 D 定稿版）。

  两个教训烧进这里，改之前先读：
  1. **决不用字符串 transform 关键帧**。设计稿阶段 `['translateY(44px) scale(.96)','none']`
     配弹簧插值出了 matrix(0,0,0,0,0,0)——卡片被压成 0×0 隐身。React 版全部用
     独立数值属性（y / scale / rotate），数值插值没有「结构对不上」这回事。
  2. 隐藏初始态由 Motion 的 initial 渲染（SSR 会带 opacity:0），layout.tsx 里的
     noscript 安全网负责 JS 不可用时强制显形——两层各管各的，别删任何一层。
*/

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

/** 单元素入场：淡入 + 上浮。viewport.once 只播一次。 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
  onMouseEnter,
  onMouseLeave,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'h2'
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const reduced = useReducedMotion()
  const Tag = motion[as]
  if (reduced) {
    const Plain = as
    return (
      <Plain className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </Plain>
    )
  }
  return (
    <Tag
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

/*
  卡片网格的弹簧入场：父容器进入视口后，孩子按 0.08s 错峰弹入。
  variants 是 Motion 的「动画预设表」：父级切换状态名，孩子各自查表执行，
  错峰(staggerChildren)由父级统一调度——比给每张卡手算 delay 干净。
*/
const gridParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const gridChild: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
}

export function RevealGrid({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      variants={gridParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  )
}

export function RevealGridItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div className={className} variants={gridChild}>
      {children}
    </motion.div>
  )
}

/** 逐字弹起的大字（结尾 CTA 用）：每个字带一点旋转的弹簧入场。 */
export function SpringChars({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion()
  const chars = [...text]
  if (reduced) return <span className={className}>{text}</span>
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      aria-label={text}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block will-change-transform"
          variants={{
            hidden: { opacity: 0, y: 60, rotate: 6 },
            show: { opacity: 1, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 160, damping: 14 } },
          }}
        >
          {/* 普通空格在 inline-block 里塌成零宽——换不断行空格（老坑，两次踩过） */}
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  )
}

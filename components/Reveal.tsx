'use client'

/*
  滚动入场的通用外壳：包住谁，谁就在滚进视口时轻轻淡入上浮一下。

  动效的分寸（设计文档 §4：克制为主，避免喧宾夺主）：
  位移只有 12px、时长 0.5s、只播一次（once）。目的是让内容「到位」，
  不是让人注意到有动画。满屏乱飞的动效反而是「这页是 AI 随手生成的」的招牌。

  useReducedMotion 会读系统的「减少动态效果」开关；开了就直接不动——
  前庭功能敏感的人会被位移动画弄到头晕，这不是可选的体贴，是可达性的地板。

  关于 as 这个参数（别删）：
  这个外壳默认渲染成 <div>。但套在 <ul> 里的时候，<ul> 的孩子必须是 <li>——
  中间夹一层 <div> 会把列表语义打断，读屏软件就不会播报「共 8 项」了。
  （Lighthouse 当场抓到过这个问题。）所以要包 <li> 时传 as="li"，
  让这个外壳自己变成 <li>，而不是在外面多套一层。
*/

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li'
}) {
  const reduced = useReducedMotion()
  const Tag = as === 'li' ? motion.li : motion.div
  const Plain = as === 'li' ? 'li' : 'div'

  if (reduced) return <Plain className={className}>{children}</Plain>

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      // once: 只播一次，来回滚不反复闪。margin: 提前 80px 触发，等元素完全露出来才动会显得迟钝。
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

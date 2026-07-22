'use client'

/*
  文件传送带：位置由滚动进度驱动（滚多快走多快），急滚时整条带子
  跟着倾斜——「跟手的重量感」。设计稿 D 用手写 rAF 实现，这里换成
  Motion React 的惯用写法：
  - useScroll({target}) → 段落在视口里的进度 0..1
  - useVelocity(scrollY) → 滚动速度 → useTransform 映射成倾斜角 → useSpring 平滑
*/

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { conveyor } from '@/lib/content'
import { FileIcon } from '@/components/FileIcon'
import { usePrefs } from '@/lib/prefs'
import { Reveal } from '../fx/Reveal'

export function Conveyor() {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  // 滚动驱动的值要等挂载再接上：刷新恢复滚动位置时，客户端首帧的进度
  // 不是初值，SSR 的 transform 会对不上（hydration 不匹配的同族问题）。
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const still = !mounted || reduced

  // 段落穿过视口的进度：start end（段顶碰视口底）→ end start（段底离开视口顶）
  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const xA = useTransform(scrollYProgress, [0, 1], ['3%', '-18%'])
  const xB = useTransform(scrollYProgress, [0, 1], ['-18%', '3%'])

  // 滚动速度 → 倾斜角（±7° 封顶），弹簧回正
  const velocity = useVelocity(scrollY)
  const skewRaw = useTransform(velocity, [-2000, 2000], [-7, 7], { clamp: true })
  const skew = useSpring(skewRaw, { stiffness: 300, damping: 40 })
  const skewNeg = useTransform(skew, (v) => -v)

  const chipCls =
    'flex items-center gap-2.5 rounded-xl border border-edge bg-panel px-5 py-[13px] text-[13px] whitespace-nowrap text-dim transition-colors hover:border-edge-brand'

  /* 内容重复铺满：字变短后单份不够宽，位移时右侧会露白，所以整份重复 REPEAT 遍，
     保证滚到任何位置都撑满视口、无空隙。上带 = 功能名称，下带 = 对应后缀，同取自 filesBelt。
     （宽屏若仍偶见缝隙，调大 REPEAT 即可。） */
  const REPEAT = 5
  const filesRow = Array.from({ length: REPEAT }, () => conveyor.filesBelt).flat()
  const extRow = filesRow

  return (
    <section ref={ref} className="relative z-[1] overflow-hidden py-[110px] pb-[30px]">
      <Reveal as="h2" className="display-face text-center text-[clamp(1.7rem,3.2vw,2.5rem)] font-extrabold">
        {t(conveyor.title)}
      </Reveal>
      <Reveal as="p" delay={0.08} className="mt-2.5 mb-11 text-center text-[14px] text-dim">
        {t(conveyor.hint)}
      </Reveal>

      <motion.div style={still ? undefined : { skewX: skew }} className="will-change-transform">
        <motion.div style={still ? undefined : { x: xA }} className="flex w-max gap-3.5 py-2 font-mono will-change-transform">
          {filesRow.map((f, i) => (
            <span key={i} className={chipCls} style={{ boxShadow: 'var(--shadow-card)' }}>
              <FileIcon name={f.icon} />
              <b className="font-medium text-ink">{t(f.name)}</b>
              <span className="text-[11.5px] text-dim">{t(f.desc)}</span>
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div style={still ? undefined : { skewX: skewNeg }} className="mt-3.5 will-change-transform">
        <motion.div style={still ? undefined : { x: xB }} className="flex w-max gap-3.5 py-2 font-mono will-change-transform">
          {extRow.map((f, i) => (
            <span key={i} className={chipCls} style={{ boxShadow: 'var(--shadow-card)' }}>
              <b className="font-medium text-brand">{f.ext}</b>
              <span className="text-dim">{t(f.sample)}</span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

'use client'

/*
  终端演示：指令逐字敲出 → 技能日志滚出 → 文件逐个物化，循环播放。
  这段动画就是产品说明书——看完 8 秒循环就懂产品是干嘛的。

  两条设计纪律：
  - 终端在深浅两个主题下都保持深色（白纸上的黑玻璃反而最抓眼，
    且终端本来就该是黑的）。所以颜色全部写死，不走主题令牌。
  - 3D 倾斜跟随鼠标（±5°，弹簧）——「跟手」层，reduced motion 下关掉。
*/

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { FileIcon } from '@/components/FileIcon'
import { ensurePointerTracking, pointerX, pointerY } from './fx/pointer'
import { terminal } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { useIntroDelay } from './fx/Intro'

/** 演示的播放阶段：打了几个字 / 显示到第几条日志、第几个文件 */
type Stage = { typed: number; logs: number; files: number }
const IDLE: Stage = { typed: 0, logs: 0, files: 0 }

export function Terminal() {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const introDelay = useIntroDelay()
  const ref = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>(IDLE)
  // 倾斜要等挂载再接上（hydration 同族问题，见 Conveyor 注释）
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const prompt = t(terminal.prompt)

  /* ── 播放循环：一根定时器链，卸载时全清 ── */
  useEffect(() => {
    if (reduced) {
      // 不播动画就直接给完整结果——内容永远可读
      setStage({ typed: 999, logs: terminal.logs.length, files: terminal.files.length })
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

    const play = () => {
      setStage(IDLE)
      const chars = [...prompt].length
      // 逐字：90ms 一个
      for (let i = 1; i <= chars; i++) at(i * 90, () => setStage((s) => ({ ...s, typed: i })))
      const doneTyping = chars * 90
      terminal.logs.forEach((_, k) => at(doneTyping + 480 + k * 550, () => setStage((s) => ({ ...s, logs: k + 1 }))))
      terminal.files.forEach((_, k) => at(doneTyping + 1650 + k * 300, () => setStage((s) => ({ ...s, files: k + 1 }))))
      at(doneTyping + 1650 + terminal.files.length * 300 + 4200, play)
    }
    // 等开场幕布掀走再开演
    timers.push(setTimeout(play, (introDelay + 0.8) * 1000))
    return () => timers.forEach(clearTimeout)
  }, [prompt, reduced, introDelay])

  /* ── 3D 倾斜：指针相对终端中心的偏移 → rotateX/Y，弹簧平滑 ── */
  useEffect(() => {
    if (!reduced) ensurePointerTracking()
  }, [reduced])
  const rawRX = useTransform(pointerY, (v) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r || r.bottom < 0 || r.top > innerHeight) return 0
    return ((v - r.top - r.height / 2) / r.height) * -5
  })
  const rawRY = useTransform(pointerX, (v) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return 0
    return ((v - r.left - r.width / 2) / r.width) * 5
  })
  const rotateX = useSpring(rawRX, { stiffness: 80, damping: 20 })
  const rotateY = useSpring(rawRY, { stiffness: 80, damping: 20 })

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        className="overflow-hidden rounded-[18px] border font-mono"
        style={{
          // 终端专属的固定深色（不随主题）——见文件头注释
          background: 'linear-gradient(180deg,#101a14,#0d1410)',
          borderColor: 'rgba(74,222,128,.2)',
          boxShadow: 'var(--shadow-term)',
          transformStyle: 'preserve-3d',
          rotateX: !mounted || reduced ? 0 : rotateX,
          rotateY: !mounted || reduced ? 0 : rotateY,
        }}
      >
        <div className="flex items-center gap-[7px] border-b border-white/8 px-4 py-[13px]">
          <i className="size-2.5 rounded-full bg-white/13" />
          <i className="size-2.5 rounded-full bg-white/13" />
          <i className="size-2.5 rounded-full bg-white/13" />
          <span className="ml-2.5 text-[11px] text-[#7c8d83]">{t(terminal.windowTitle)}</span>
        </div>

        <div className="min-h-[250px] p-6 text-[13.5px] leading-[2.1] text-[#e9f1ec]">
          <div>
            <span className="text-[#4ade80]">›</span> <span>{[...prompt].slice(0, stage.typed).join('')}</span>
            <span className="caret-blink ml-0.5 inline-block h-[17px] w-2 bg-[#4ade80] align-[-3px]" />
          </div>

          {terminal.logs.map((log, i) => (
            <div key={i} className="text-[#7c8d83] transition-opacity duration-300" style={{ opacity: stage.logs > i ? 1 : 0 }}>
              <span className="text-[#4ade80]">✓</span> {t(log)}
            </div>
          ))}

          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {terminal.files.map((f, i) => (
              <motion.span
                key={i}
                className="flex items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[12px]"
                style={{ background: 'rgba(74,222,128,.06)', borderColor: 'rgba(74,222,128,.16)' }}
                initial={false}
                animate={stage.files > i ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <FileIcon name={f.icon} /> {t(f.name)} <span className="text-[#4ade80]">{f.size}</span>
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

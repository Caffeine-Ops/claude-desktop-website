'use client'

/*
  ─────────────────────────────────────────────────────────────
  产出清单——整页的签名段落，最想让人记住的就是这一段。
  ─────────────────────────────────────────────────────────────
  为什么做成「清单」而不是图标卡片墙：
  这个产品的产出就是文件，而文件的语言是后缀名和目录列表。用产品自己的语汇讲它
  自己的事，比一堆圆角图标卡片更贴题，也更难和别家撞脸——圆角卡片墙谁都能做。

  最右一列是真实存在的技能名（对得上仓库 skills/ 目录）。这一列是整页最硬的东西：
  它把「我们能做这些」从一句口号变成一份可以核对的清单。设计文档 §6 立的规矩是
  「只展示真实能力，不虚构」——这一列就是那条规矩的兑现方式。

  排版说明：桌面端是三列表格式；窄屏塌成堆叠卡片。用 CSS Grid 手搭而不是 <table>，
  因为这不是数据表格，是导航式的清单，语义上更接近列表。
*/

import { outputs, outputsSection } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal } from '../Reveal'
import { SectionHead } from '../SectionHead'

export function Outputs() {
  const { t } = usePrefs()

  return (
    <section id="outputs" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t(outputsSection.eyebrow)}
          title={t(outputsSection.title)}
          body={t(outputsSection.body)}
        />

        <div className="mt-12">
          {/* 列头只在桌面端出现：窄屏塌成卡片后，每行自己就说清了，列头反而是噪音 */}
          <div className="hidden grid-cols-[minmax(0,2fr)_76px_minmax(0,7fr)] gap-6 border-b border-rule pb-3 font-mono text-[11px] tracking-wider text-graphite uppercase md:grid">
            <span>{t(outputsSection.colOutput)}</span>
            <span>{t(outputsSection.colFormat)}</span>
            <span>{t(outputsSection.colSkills)}</span>
          </div>

          <ul>
            {/* as="li" 让入场动画的外壳自己就是 <li>。别在这儿套一层 <div> 再放 <li>——
                <ul> 和 <li> 中间夹任何东西都会打断列表语义，读屏软件就不播报「共 8 项」了。 */}
            {outputs.map((row, i) => (
              <Reveal
                key={row.label.en}
                as="li"
                delay={Math.min(i, 5) * 0.05}
                className="group grid grid-cols-1 gap-1.5 border-b border-rule py-5 transition-colors hover:bg-brand-soft md:grid-cols-[minmax(0,2fr)_76px_minmax(0,7fr)] md:items-center md:gap-6"
              >
                <span className="text-[16.5px] font-semibold transition-colors group-hover:text-brand">
                  {t(row.label)}
                </span>

                <span className="font-mono text-[13px] text-brand">{row.ext}</span>

                {/* 技能名横向可滚：宽内容自己滚，别把整个页面撑出横向滚动条 */}
                <span className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5 md:flex-wrap md:overflow-visible">
                  {row.skills.map((s) => (
                    <code
                      key={s}
                      className="shrink-0 rounded-md border border-rule bg-surface px-2 py-1 font-mono text-[11.5px] whitespace-nowrap text-graphite"
                    >
                      {s}
                    </code>
                  ))}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal>
            <p className="pt-6 font-mono text-[12.5px] text-graphite">
              <span className="text-brand">+</span> {t(outputsSection.footnote)}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

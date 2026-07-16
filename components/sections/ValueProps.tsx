'use client'

/*
  核心价值三连（设计文档 §5.3）：一眼说清「为什么用它」。

  三条刻意不配图标。理由：「会创作 / 会查资料 / 动手前先问你」这三件事没有
  天然对应的图标，硬配就会得到闪电、大脑、盾牌那一套——那是任何 AI 产品都能用的
  通用件，等于没说。用大号编号的排版来分栏就够了，让文字自己说话。

  这里的编号是有信息的：它就是产品干活的顺序——先做出来、做之前先查、动手前先问。
  （不是为了好看随便标 01/02/03。）
*/

import { values } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'
import { Reveal } from '../Reveal'

export function ValueProps() {
  const { t } = usePrefs()

  return (
    <section className="border-y border-rule bg-surface px-5 py-20 sm:px-8 sm:py-24">
      {/*
        这段刻意没有可见的大标题——三条卡片自己就说清了，加个抬头反而是废话。
        但标题层级不能因此跳级：页面从 h1 直接蹦到 h3，读屏软件会以为漏了一层，
        用标题导航的人会以为自己跳错了地方。所以给一个只有读屏软件听得到的 h2
        （sr-only = 视觉上不存在，辅助技术照样读到）。视觉设计和语义结构各归各的。
      */}
      <h2 className="sr-only">{t({ zh: '为什么用它', en: 'Why use it' })}</h2>
      <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-12 md:grid-cols-3">
        {values.map((v, i) => (
          <Reveal key={v.title.en} delay={i * 0.08}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[12px] text-brand">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="display-face text-[22px] font-bold">{t(v.title)}</h3>
            </div>
            <p className="mt-4 max-w-[38ch] text-[15px] leading-[1.68] text-graphite">{t(v.body)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

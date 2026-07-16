import { Nav } from '@/components/Nav'
import { SkipLink } from '@/components/SkipLink'
import { Hero } from '@/components/sections/Hero'
import { ValueProps } from '@/components/sections/ValueProps'
import { Outputs } from '@/components/sections/Outputs'
import { Platform } from '@/components/sections/Platform'
import { Developers } from '@/components/sections/Developers'
import { Download } from '@/components/sections/Download'
import { Footer } from '@/components/sections/Footer'

/*
  首页（在 Next.js 里，app/page.tsx 就是网站根路径 "/" 的页面）。

  从上到下的叙事顺序是设计出来的（设计文档 §2）：先用「产出」抓住所有人，
  再用「底座 / 技术」留住技术用户，最后收在下载。
    Hero      一句话讲清它替你做什么
    ValueProps 为什么值得用（三条）
    Outputs   ← 签名段落：产出清单，用真实技能名兑现
    Platform  撑起这些产出的四样东西（术语从这里才允许出现）
    Developers 给技术用户的深度
    Download  核心目标
    Footer

  每一段都是自足模块 + 独立锚点（设计文档 §5.8）：将来要拆成
  /features、/download 这些独立页面时，把组件搬过去就行，不用推倒重来。
*/
export default function Home() {
  return (
    <>
      <SkipLink />
      <Nav />
      <main>
        <Hero />
        <ValueProps />
        <Outputs />
        <Platform />
        <Developers />
        <Download />
      </main>
      <Footer />
    </>
  )
}

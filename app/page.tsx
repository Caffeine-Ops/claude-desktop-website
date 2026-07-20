import { Nav } from '@/components/Nav'
import { SkipLink } from '@/components/SkipLink'
import { Intro } from '@/components/fx/Intro'
import { Dust, Glow, ProgressBar } from '@/components/fx/Ambient'
import { Hero } from '@/components/sections/Hero'
import { Terminal } from '@/components/Terminal'
import { Conveyor } from '@/components/sections/Conveyor'
import { Outputs } from '@/components/sections/Outputs'
import { Platform } from '@/components/sections/Platform'
import { Screens } from '@/components/sections/Screens'
import { Developers } from '@/components/sections/Developers'
import { Download } from '@/components/sections/Download'
import { Footer } from '@/components/sections/Footer'

/*
  首页（在 Next.js 里，app/page.tsx 就是网站根路径 "/" 的页面）。

  铺满版（2026-07-17 定稿）的段落编排：
    Intro     开场序列（每会话首次，幕布掀走后 Hero 才起）
    Hero      3D 倾斜卡片墙铺满第一屏 + 逐字标题 + 真实下载按钮
              （终端演示不在第一屏了——单栏文案得先讲清「一句话」这件事）
    Terminal  终端演示，独立成节，滚下去才看到
    Conveyor  滚动驱动的文件传送带（跟手的重量感）
    Outputs   ← 签名段落：139 计数器 + 六张产出卡
    Platform  撑起产出的四样底座（术语从这里才允许出现）
    Screens   真实产品截图（浅色应用窗口浮在深色页面上）
    Developers 给技术用户的深度
    Download  结尾大字 + 真实下载卡（GitHub 数据三态：加载/直链/降级）
    Footer

  氛围层（进度条/光斑/尘埃）fixed 全局，挂一次。
  每段自足 + 独立锚点：将来拆多页平移即可。
*/
export default function Home() {
  return (
    <>
      <Intro />
      <ProgressBar />
      <Glow />
      <Dust />
      <SkipLink />
      <Nav />
      <main>
        <Hero />
        <section className="relative z-[1] mx-auto max-w-[1180px] px-8 py-24">
          <Terminal />
        </section>
        <Conveyor />
        <Outputs />
        <Platform />
        <Screens />
        <Developers />
        <Download />
      </main>
      <Footer />
    </>
  )
}

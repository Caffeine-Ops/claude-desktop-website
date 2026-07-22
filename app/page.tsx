import { Nav } from '@/components/Nav'
import { SkipLink } from '@/components/SkipLink'
import { Intro } from '@/components/fx/Intro'
import { Dust, Glow, ProgressBar } from '@/components/fx/Ambient'
import { Hero } from '@/components/sections/Hero'
import { Terminal } from '@/components/Terminal'
import { Reveal } from '@/components/fx/Reveal'
import { Conveyor } from '@/components/sections/Conveyor'
import { Outputs } from '@/components/sections/Outputs'
import { Platform } from '@/components/sections/Platform'
import { Screens } from '@/components/sections/Screens'
import { Privacy } from '@/components/sections/Privacy'
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
    Privacy   收尾前的信任块：数据本地 / 逐步授权 / 自带 Key / 可审计
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
        {/* 从第一屏滚下来看到的「下一页」。用全站统一的 Reveal（whileInView：
            进入视口时淡入 + 轻微上滑，只播一次）给它一个入场——这就是首屏
            滚到这里时的过渡动画。终端自带的逐字循环/鼠标倾斜互不干扰。 */}
        <section className="relative z-[1] mx-auto max-w-[1180px] px-8 py-24">
          {/* Hero 底边过渡遮罩：鼠标光斑（Glow，z0，全站最底层）被 Hero 铺满的
              不透明装饰层整个挡住，只在 Hero 下沿以下露出——光斑一撞上 Hero 底边
              就被切成一条硬直线（鼠标悬浮时尤其扎眼）。这条全宽渐变从 Hero 底边处
              的不透明 --canvas 起、向下渐透，把光斑的露出边界从「硬线」化成「渐显」，
              让首屏与下一屏的底色连成一片。放在 Reveal 之前 + z0：只压背景光、
              不挡终端；w-screen 铺满视口宽（本节是居中窄容器，光斑会溢出它）。 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 z-0 h-[280px] w-screen -translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, var(--canvas) 0%, transparent 100%)' }}
          />
          <Reveal>
            <Terminal />
          </Reveal>
        </section>
        <Conveyor />
        <Outputs />
        <Platform />
        <Screens />
        <Privacy />
        <Download />
      </main>
      <Footer />
    </>
  )
}

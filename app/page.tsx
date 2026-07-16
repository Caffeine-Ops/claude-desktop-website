import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Download } from '@/components/sections/Download'
import { Footer } from '@/components/sections/Footer'

// 首页：从上到下四段。真正的排版与 Motion 动画在方案定稿后逐段填充。
// （在 Next.js 里，app/page.tsx 就是网站根路径 "/" 的页面。）
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Download />
      <Footer />
    </main>
  )
}

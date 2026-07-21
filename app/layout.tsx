import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import { PrefsProvider } from '@/lib/prefs'
import './globals.css'

/*
  字体：
  - Archivo 是可变字体，带一根「宽度轴」(wdth)。同一个家族，拉宽加粗当标题，
    回到常规当正文——一个家族演两个角色，比硬凑两款没关系的字体更成体系。
  - IBM Plex Mono 专管文件后缀、版本号、技能名这些「机器的话」。
  - 中文走系统字体（苹方 / 微软雅黑）：中文字库动辄好几兆，硬塞进网页会拖垮
    加载速度，而中文用户本地的苹方本来就好看。这是刻意的取舍，不是偷懒。

  next/font 会把字体文件下载下来跟着站点一起发，不去请求 Google 的服务器——
  少一个外部依赖，也少一个隐私问题。
*/
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

/*
  站点地址。分享到微信 / Twitter 时，预览图必须是完整地址（https://…/app-icon.png），
  只写 /app-icon.png 对方服务器不认——图就挂了。metadataBase 就是给相对地址补上前缀的。

  优先读环境变量，方便将来绑了自定义域名直接改配置，不用动代码；
  没设时落回 Vercel 的默认域名。（域名是设计文档 §12 还没定的问题之一。）
*/
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://claude-desktop-website.vercel.app'

// Metadata：Next.js 会把它渲染成 <title>/<meta>，这是 SEO（搜索引擎优化）的基础。
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Cowork — 一句话，让 AI 帮你做完 PPT、表格、方案',
  description:
    '桌面端的 Claude。智能助手加插件，139 项内置创作技能和你自己的知识库——聊天，然后收文件。支持 macOS 与 Windows。',
  icons: { icon: '/icon-256.png', apple: '/app-icon.png' },
  openGraph: {
    title: 'Cowork',
    description: '桌面端的 Claude。聊天，然后收文件。',
    images: ['/app-icon.png'],
    type: 'website',
  },
}

// 根布局：包裹所有页面的最外层壳（html/body）。全站共用的东西放这里。
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // lang 先给 zh-CN（默认语言）；访客切到英文时 PrefsProvider 会在浏览器里改掉它。
    // suppressHydrationWarning 留着当安全网：浏览器插件常往 <html> 上乱塞属性，
    // 那会让服务器版和浏览器版第一帧对不上，不值得为它报警。
    // （2026-07-17 前这里还有个防闪白脚本会在 React 接管前改 <html>，随浅色主题一起删了。）
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/*
          动画的安全网。

          滚动入场动画的做法是「先把元素设成透明，滚进视口时再让它显形」，
          而这个「透明」是直接写进服务器吐出的 HTML 里的（实测 33 处 opacity:0）。
          代价是：JS 一旦没跑起来，让它显形的机关就永远不触发，首屏以下全是白的——
          正文其实都在 HTML 里，就是看不见。对一个「核心目标是让人下载」的页面，
          这个代价不能接受。

          <noscript> 里的样式只在访客关掉 JS 时才生效：那种情况下动画本来也没有，
          干脆让所有元素直接就位。动效是锦上添花，内容能不能被看见是底线——
          任何时候都不能让装饰性的东西挡住底线。
        */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={`${archivo.variable} ${plexMono.variable}`}>
        <PrefsProvider>{children}</PrefsProvider>
      </body>
    </html>
  )
}

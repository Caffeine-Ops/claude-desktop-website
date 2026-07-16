import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

// Metadata：Next.js 会把它渲染成 <title>/<meta>，这是 SEO（搜索引擎优化）的基础。
export const metadata: Metadata = {
  title: 'Claude Desktop — 桌面版 Claude Agent',
  description:
    'Claude Desktop：把 Claude 的 Agent 能力装进桌面。聊天、设计、幻灯片、写作、表格、视频，一个应用全搞定。支持 macOS / Windows / Linux。',
}

// 根布局：包裹所有页面的最外层壳（html/body）。全站共用的东西放这里。
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body>{children}</body>
    </html>
  )
}

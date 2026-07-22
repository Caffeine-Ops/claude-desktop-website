// 文件类型小图标：双色调内联 SVG——线条轮廓 + 同色半透明色块（矢量、可换色、放大不糊），取代原先的 emoji。
// 画法：每个图标先垫一层 fill 色块（fillOpacity ~0.22），再叠一层实色描边线条。
// 颜色统一走 svg 的 color（见下方 COLORS），描边与填充都用 currentColor，一份颜色同时管线和块。
// 数据在 lib/content.ts 里用这些 key（pptx / xlsx / …）。
import type { ReactNode } from 'react'

// 半透明色块通用属性（垫在最底层）
const block = { fill: 'currentColor', fillOpacity: 0.22, stroke: 'none' } as const

const PATHS: Record<string, ReactNode> = {
  // 演示文稿：投影幕（色块）+ 顶栏 + 幕布轮廓 + 底部上升箭头
  pptx: (
    <>
      <path d="M3 3h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3Z" {...block} />
      <path d="M2 3h20" />
      <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
      <path d="m7 21 5-5 5 5" />
    </>
  ),
  // 表格：网格（色块 + 格线）
  xlsx: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" {...block} />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </>
  ),
  // 文档：纸（色块）+ 折角 + 文字行
  docx: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...block} />
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </>
  ),
  // PDF：单据/收据（色块）+ 锯齿边 + 文字行（对应原来的 🧾）
  pdf: (
    <>
      <path d="M4 2v20l2-1.2 2 1.2 2-1.2 2 1.2 2-1.2 2 1.2 2-1.2 2 1.2V2l-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2Z" {...block} />
      <path d="M4 2v20l2-1.2 2 1.2 2-1.2 2 1.2 2-1.2 2 1.2 2-1.2 2 1.2V2l-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </>
  ),
  // 图片：相框（色块）+ 太阳（实心点缀）+ 山
  png: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" {...block} />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" fill="currentColor" fillOpacity={0.9} stroke="none" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  // 视频：胶片条（色块 + 齿孔 + 竖线）
  mp4: (
    <>
      <rect x="2" y="3" width="20" height="18" rx="2" {...block} />
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M7 3v18" />
      <path d="M17 3v18" />
      <path d="M2 9h5" />
      <path d="M17 9h5" />
      <path d="M2 15h5" />
      <path d="M17 15h5" />
    </>
  ),
  // 网页/看板：色块底 + 尖括号代码符号
  html: (
    <>
      <rect x="2" y="3" width="20" height="18" rx="3" {...block} />
      <path d="m16 17 5-5-5-5" />
      <path d="m8 7-5 5 5 5" />
    </>
  ),
}

// 每种文件类型的专属色——沿用大家熟悉的软件配色（Excel 绿 / PPT 橙 / Word 蓝…），
// 取 -400 色阶：在深色面板底上够亮够清晰，又不刺眼。描边用实色，色块用其 22% 透明度。
const COLORS: Record<string, string> = {
  pptx: '#fb923c', // 橙 · 演示
  xlsx: '#4ade80', // 绿 · 表格
  docx: '#60a5fa', // 蓝 · 文档
  pdf: '#f87171', // 红 · 单据
  png: '#c084fc', // 紫 · 图片
  mp4: '#f472b6', // 粉 · 视频
  html: '#22d3ee', // 青 · 网页
}

export function FileIcon({
  name,
  size = '1em',
  className,
}: {
  name: string
  size?: number | string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      // color 决定描边与色块的底色；未匹配到类型时回落到继承的文字色
      style={{ color: COLORS[name], flexShrink: 0 }}
    >
      {PATHS[name] ?? PATHS.docx}
    </svg>
  )
}

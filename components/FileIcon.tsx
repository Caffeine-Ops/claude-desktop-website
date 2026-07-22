// 文件类型图标：高级科技风 PNG（深色磨砂玻璃砖 + 类型色霓虹发光 3D 符号），
// 取代原来的内联 SVG 线条图标。图源在 public/icons/ft-<type>.png——
// 由 gpt-image-2 出图 → 抠透明 → 切割而来，7 种类型成套统一风格。
//
// 取舍备注：玻璃质感 / 立体高光 / 霓虹辉光是 SVG 线条画不出来的（这就是换 PNG 的理由）；
// 代价是位图不再跟随主题变色（颜色已烤进图里），且需要足够分辨率避免高清屏发糊——
// 这里每张导出 256px，实际显示 12~19px，绰绰有余。
// 数据在 lib/content.ts 里用这些 key（pptx / xlsx / …）。

const KNOWN = new Set(['pptx', 'xlsx', 'docx', 'pdf', 'png', 'mp4', 'html'])

export function FileIcon({
  name,
  size = '1em',
  className,
}: {
  name: string
  size?: number | string
  className?: string
}) {
  // 未匹配到类型时回落到文档图标
  const key = KNOWN.has(name) ? name : 'docx'
  return (
    <img
      src={`/icons/ft-${key}.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={className}
      style={{ width: size, height: size, flexShrink: 0, display: 'inline-block', objectFit: 'contain' }}
    />
  )
}

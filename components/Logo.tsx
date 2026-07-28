/*
  品牌记号：Cowork 应用图标（透明边缘的 C+文档发光图标）。
  图源统一走 lib/brand 的 APP_ICON（public/app-icon.png）——全站唯一一份，换图只改那一处。
  用真实 PNG 而不是内联 SVG——发光/渐变质感是位图渲染的，矢量重画不出来。
  保留 size/id 入参签名，调用方（Nav/Footer）无需改动；id 现在用不上了。
*/
import { APP_ICON } from '@/lib/brand'

export function Logo({ size = 24 }: { size?: number; id?: string }) {
  return (
    <img
      src={APP_ICON}
      width={size}
      height={size}
      alt="Cowork"
      className="block shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

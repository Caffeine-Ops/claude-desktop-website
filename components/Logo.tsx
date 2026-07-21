/*
  品牌记号：Cowork 应用图标（深蓝底 + 玻璃质感的 Q）。
  用真实 PNG（public/logo-mark.png，128px 源，够 retina）而不是内联 SVG——
  这个玻璃/高光质感是位图渲染的，矢量重画不出来。
  保留 size/id 入参签名，调用方（Nav/Footer）无需改动；id 现在用不上了。
*/
export function Logo({ size = 24 }: { size?: number; id?: string }) {
  return (
    <img
      src="/logo-mark.png"
      width={size}
      height={size}
      alt="Cowork"
      className="block shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

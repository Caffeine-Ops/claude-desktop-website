/*
  品牌记号：一个光标箭头（取自应用图标——你指一下、说一句，活就干完了）。
  渐变端点走主题令牌：深色下是亮绿→亮青，浅色下自动换成深绿→深青，
  不用给两个主题各画一份。id 参数防止同页多个实例的渐变 id 互相打架。
*/
export function Logo({ size = 24, id = 'logo' }: { size?: number; id?: string }) {
  const gid = `cd-cursor-${id}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--teal)" />
        </linearGradient>
      </defs>
      <path
        d="M5.2 3.6 L19.8 10.6 L13.1 13.4 L10.3 20.4 Z"
        stroke={`url(#${gid})`}
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

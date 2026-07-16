/*
  品牌记号：一个光标箭头。
  取自应用图标本身（深色圆底 + 绿→青渐变的光标）。选它当官网的记号，是因为
  光标正好是这个产品的隐喻——你指一下、说一句，活就干完了。

  整站唯一用薄荷青渐变的地方就是这里。别处一律只用品牌绿单色：
  强调色到处撒就不叫强调色了。
*/
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true" // 纯装饰：旁边紧跟着「Claude Desktop」文字，读屏软件不该把它再念一遍
    >
      <defs>
        {/* 每个实例的渐变 id 必须唯一，否则同页面多个 logo 会互相抢 id。
            这里全站只有顶栏和页脚两处，且渐变完全一样，共用一个 id 无妨。 */}
        <linearGradient id="cd-cursor" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--mint)" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>
      </defs>
      <path
        d="M5.2 3.6 L19.8 10.6 L13.1 13.4 L10.3 20.4 Z"
        stroke="url(#cd-cursor)"
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

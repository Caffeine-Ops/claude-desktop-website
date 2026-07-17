'use client'

/*
  跳转链接：只用键盘的人按第一下 Tab 就能跳过顶栏直达正文，
  不用一路 Tab 穿过所有导航项。平时用 sr-only 藏起来（sr = screen reader，
  屏幕阅读器仍读得到），聚焦时才现形——这是键盘可达性的标准做法。

  它得是客户端组件，因为要跟着语言变。页面本体是服务端组件，读不到访客偏好。
*/

import { ui } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'

export function SkipLink() {
  const { t } = usePrefs()

  return (
    <a
      href="#top"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
    >
      {t(ui.skipToContent)}
    </a>
  )
}

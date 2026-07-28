/*
  public/ 下的静态资源必须过这个函数拿路径。

  为什么需要它：站点挂在 cowork.cntcn.com/app 这个子路径下（nginx 的
  location /app 把原始 URI 原样转给本进程），next.config 里的 basePath 会自动给
  「路由」和「/_next/ 构建产物」补上前缀，但它管不到写在 <img src>、CSS url()、
  数据常量里的 public 路径——那些是纯字符串，Next 不会去改。

  漏加前缀的后果不是 404 那么直白：请求以根路径发出去（/logo-mark.png），
  nginx 的 location / 把它转给同域的 sub2api 网关，网关的 SPA 对未知路径一律回
  index.html——于是浏览器拿到一个 200 的 HTML 当图片用，图片静默不显示，
  Network 面板里 Type 是 text/html、Size 2.8 kB。查起来比 404 费劲得多。

  默认值跟 next.config.ts 里的保持一致；两处都认 NEXT_PUBLIC_BASE_PATH，
  且 config 用 env 字段把最终值固化下来，保证客户端与构建期算出的是同一个。
*/
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/app'

/** 给 public/ 资源的绝对路径补上部署前缀。传入的 path 必须以 / 开头。 */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`
}

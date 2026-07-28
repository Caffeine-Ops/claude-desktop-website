import type { NextConfig } from 'next'

/*
  站点对外挂在 cowork.cntcn.com/app 子路径下：nginx 的 location /app 把原始 URI
  原样 proxy_pass 给本进程，所以 Next 自己必须知道这个前缀，否则路由和 /_next
  静态资源都会落到根路径上，被 location / 转给同域的 sub2api 网关。

  注意 basePath 只覆盖路由与 /_next 产物，public/ 下的资源得自己补前缀——
  统一走 lib/asset.ts 的 asset()，默认值与这里保持一致。
  env 字段把最终值固化给客户端，保证两处算出来的前缀不会分叉。
*/
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/app'

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
}

export default nextConfig

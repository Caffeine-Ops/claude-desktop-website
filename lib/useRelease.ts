'use client'

/*
  取「最新版」的 hook。Hero 的主按钮和下载区都要用它。

  为什么要在模块层缓存那个 Promise：
  两个组件各自调一次这个 hook，天真写法会打两次 GitHub 接口——而匿名接口每小时
  只有 60 次额度。把「正在进行中的那个请求」存在模块变量里，第二个组件直接复用
  同一个 Promise，一次网络请求喂两处。（这个套路叫请求去重 / in-flight dedupe。）

  注意它和 github.ts 里的 localStorage 缓存是两层不同的东西：
  - 这里的 Promise 缓存管的是「同一次页面加载内别重复请求」
  - localStorage 缓存管的是「同一个人一小时内刷新页面别重复请求」
*/

import { useEffect, useState } from 'react'
import { fetchLatestRelease, type Release } from './github'

let inflight: Promise<Release | null> | null = null

function load(): Promise<Release | null> {
  if (!inflight) inflight = fetchLatestRelease()
  return inflight
}

export type ReleaseState =
  | { status: 'loading'; release: null }
  | { status: 'ready'; release: Release }
  /** 拿不到数据。不是「错误页」——调用方该在这个状态下走静态兜底，让用户照样能下载。 */
  | { status: 'fallback'; release: null }

export function useRelease(): ReleaseState {
  const [state, setState] = useState<ReleaseState>({ status: 'loading', release: null })

  useEffect(() => {
    let alive = true
    load().then((r) => {
      // 组件可能在请求回来之前就被卸载了，这时候再 setState 是往空气里写东西。
      if (!alive) return
      setState(r ? { status: 'ready', release: r } : { status: 'fallback', release: null })
    })
    return () => {
      alive = false
    }
  }, [])

  return state
}

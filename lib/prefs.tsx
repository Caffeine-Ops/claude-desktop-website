'use client'

/*
  ─────────────────────────────────────────────────────────────
  访客偏好：只剩语言（中/EN）。
  ─────────────────────────────────────────────────────────────
  ('use client' = 这个文件里的代码要在访客浏览器里跑，不是在服务器上。
   凡是要读 localStorage、监听点击、用 useState 的地方都得标它。)

  主题在 2026-07-17 下线：产品拍板只做深色。深色值直接写在 globals.css
  的 :root 里，不挂任何类就成立——所以既不需要主题状态，也不需要
  防闪白脚本（那段脚本以前的活儿是「首帧前判断该不该挂浅色」，
  现在没有浅色可挂了）。想找回浅色去翻 git 历史。

  语言默认策略不变：先看存档，再猜浏览器语言，兜底中文（主要受众）。
*/

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Copy, Lang } from './content'

type Prefs = {
  lang: Lang
  setLang: (l: Lang) => void
  /** 取一句双语文案里当前语言那一半。组件里到处用它。 */
  t: (c: Copy) => string
}

const PrefsContext = createContext<Prefs | null>(null)

const LANG_KEY = 'cd-lang'

export function PrefsProvider({ children }: { children: ReactNode }) {
  /*
    初值必须和服务器渲染出来的 HTML 一致，否则 React 报 hydration 不匹配
    （两边第一帧长得不一样）。所以先用默认值 zh，真实偏好等挂载后在
    useEffect 里读——那时已经在浏览器里了。
  */
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null
    if (savedLang === 'zh' || savedLang === 'en') {
      setLangState(savedLang)
    } else {
      const nav = navigator.language ?? ''
      setLangState(nav && !nav.toLowerCase().startsWith('zh') ? 'en' : 'zh')
    }
  }, [])

  // lang 属性跟着改：屏幕阅读器靠它决定用中文还是英文发音。
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      // 隐私模式下存不了。本次会话内照样能切，刷新后不记得——可以接受。
    }
  }

  const t = (c: Copy) => c[lang]

  return <PrefsContext.Provider value={{ lang, setLang, t }}>{children}</PrefsContext.Provider>
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext)
  // 忘了套 Provider 是写代码时的错，不是运行时的意外——直接报清楚。
  if (!ctx) throw new Error('usePrefs 必须在 <PrefsProvider> 内部使用')
  return ctx
}

'use client'

/*
  ─────────────────────────────────────────────────────────────
  访客偏好：语言（中/EN）与主题（浅/深）。
  ─────────────────────────────────────────────────────────────
  ('use client' = 这个文件里的代码要在访客浏览器里跑，不是在服务器上。
   凡是要读 localStorage、监听点击、用 useState 的地方都得标它。)

  这里用 React Context 把偏好放在一处：顶栏改语言，整页的字跟着变，
  中间不用一层层往下传 props。

  两个偏好的默认值策略不一样，是故意的：
  - 主题：跟随系统 (prefers-color-scheme)。访客在系统里已经表过态了，别跟他对着干。
  - 语言：先看浏览器语言，猜不出默认中文（设计文档 §9：主要受众是中文用户）。
*/

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Copy, Lang } from './content'

type Theme = 'light' | 'dark'

type Prefs = {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  toggleTheme: () => void
  /** 取一句双语文案里当前语言那一半。组件里到处用它。 */
  t: (c: Copy) => string
}

const PrefsContext = createContext<Prefs | null>(null)

const LANG_KEY = 'cd-lang'
const THEME_KEY = 'cd-theme'

export function PrefsProvider({ children }: { children: ReactNode }) {
  /*
    初值必须和服务器渲染出来的 HTML 一致，否则 React 会报 hydration 不匹配
    （hydration = 服务器先吐一份静态 HTML，浏览器再把它「激活」成可交互的页面；
     两边第一帧长得不一样就会出警告）。所以这里一律先用默认值，
     真实偏好等挂载后在 useEffect 里读——那时已经在浏览器里了。
  */
  const [lang, setLangState] = useState<Lang>('zh')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null
    if (savedLang === 'zh' || savedLang === 'en') {
      setLangState(savedLang)
    } else {
      // 没存过就猜：浏览器语言以 zh 开头才给中文，其余一律英文。
      // 猜不出（navigator.language 为空）时落回中文——主要受众。
      const nav = navigator.language ?? ''
      setLangState(nav && !nav.toLowerCase().startsWith('zh') ? 'en' : 'zh')
    }

    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
    } else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
  }, [])

  // 主题落到 <html class="dark"> 上——CSS 里的 .dark 那一组变量靠这个类生效。
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // lang 属性要跟着改：屏幕阅读器靠它决定用中文还是英文发音。
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      // 隐私模式下存不了。语言在本次会话内照样能切，只是刷新后不记得——可以接受。
    }
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // 同上：存不了不影响本次使用。
    }
  }

  const t = (c: Copy) => c[lang]

  return (
    <PrefsContext.Provider value={{ lang, setLang, theme, toggleTheme, t }}>
      {children}
    </PrefsContext.Provider>
  )
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext)
  // 忘了套 Provider 是写代码时的错，不是运行时的意外——直接报清楚，别静默返回默认值。
  if (!ctx) throw new Error('usePrefs 必须在 <PrefsProvider> 内部使用')
  return ctx
}

/**
 * 在页面画第一帧之前就把主题类挂上，避免「先闪一下白再变黑」。
 * 这段字符串会被塞进 <script>，在 React 接管之前同步执行。
 * try/catch 兜住隐私模式——这段脚本挂了不能连累整页。
 */
export const themeInitScript = `
(function(){try{
  var s=localStorage.getItem('${THEME_KEY}');
  var d=s==='dark'||(!s&&matchMedia('(prefers-color-scheme: dark)').matches);
  if(d)document.documentElement.classList.add('dark');
}catch(e){}})();
`

'use client'

/*
  ─────────────────────────────────────────────────────────────
  访客偏好：语言（中/EN）与主题（深/浅）。
  ─────────────────────────────────────────────────────────────
  ('use client' = 这个文件里的代码要在访客浏览器里跑，不是在服务器上。
   凡是要读 localStorage、监听点击、用 useState 的地方都得标它。)

  主题机制（2026-07-17 改版）：**默认深色**。CSS 里 :root 就是深色值，
  不挂任何类就是深色；浅色靠往 <html> 挂 .light 类。方向和常见的
  「.dark 类」相反，是刻意的——默认必须在 JS 加载前就成立，把默认
  写进 :root 是唯一不闪帧的做法。

  语言默认策略不变：先看存档，再猜浏览器语言，兜底中文（主要受众）。
*/

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Copy, Lang } from './content'

type Theme = 'dark' | 'light'

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
    初值必须和服务器渲染出来的 HTML 一致，否则 React 报 hydration 不匹配
    （两边第一帧长得不一样）。所以先用默认值（dark / zh），真实偏好等
    挂载后在 useEffect 里读——那时已经在浏览器里了。
  */
  const [lang, setLangState] = useState<Lang>('zh')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) as Lang | null
    if (savedLang === 'zh' || savedLang === 'en') {
      setLangState(savedLang)
    } else {
      const nav = navigator.language ?? ''
      setLangState(nav && !nav.toLowerCase().startsWith('zh') ? 'en' : 'zh')
    }

    // 主题：存过浅色才是浅色，其余一律深色。
    // 刻意不看系统的 prefers-color-scheme——产品拍板「默认黑夜」，
    // 默认就得对所有人一致，系统偏好由用户用切换按钮自己表达。
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
    setTheme(savedTheme === 'light' ? 'light' : 'dark')
  }, [])

  // 主题落到 <html class="light"> 上——深色是无类的默认态。
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

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
  // 忘了套 Provider 是写代码时的错，不是运行时的意外——直接报清楚。
  if (!ctx) throw new Error('usePrefs 必须在 <PrefsProvider> 内部使用')
  return ctx
}

/**
 * 在页面画第一帧之前挂主题类，避免闪帧。
 * 深色是默认（:root 即深色），所以这段只需要处理「用户选过浅色」这一种情况——
 * 比旧版（默认浅色时要探测系统偏好）更简单，也更不容易错。
 * try/catch 兜住隐私模式——这段脚本挂了不能连累整页。
 */
export const themeInitScript = `
(function(){try{
  if(localStorage.getItem('${THEME_KEY}')==='light')document.documentElement.classList.add('light');
}catch(e){}})();
`

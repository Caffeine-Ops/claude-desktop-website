# 产出区可点击详情 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把「产出」区六张卡从静态过程截图,升级成「点开可翻的真成品 + 悬浮可点信号 + 弹层详情」,并把用户提供的绿色壁纸作为桌面背景贯穿卡片与弹层。

**Architecture:** 六张卡各绑定一份 claude-desktop 仓库的真实成品(5 份模板 `example.html` + 1 份视频 `.mp4`),拷入 `public/`;卡片语义化为可点击按钮,新增悬浮上浮 + 「查看成品 →」标签;点击打开一个用 `motion/react` 的 `AnimatePresence` 实现的弹层大窗,HTML 成品用 `<iframe>`、视频用 `<video>`,壁纸作背景。

**Tech Stack:** Next 15(App Router)、React 19、motion 12、Tailwind 4、TypeScript 5.7。图像用 `cwebp`(`/opt/homebrew/bin/cwebp`),缩略图截图用 chrome-devtools MCP。

## Global Constraints

- 本站**无单测框架**;每个任务的「验证」= `bunx tsc --noEmit` 通过 +(末任务)`bun run build` 通过 + chrome-devtools MCP 实看。命令用 `npx`/`bunx` 均可,本文用 `npx`。
- 不新增运行时依赖(`motion` 已在用)。
- 不虚构原则:所有成品均来自 claude-desktop 仓库现有真实产物,不做假图、不改成品内容。
- 沿用现有视觉 token:`border-edge` `bg-panel` `text-brand` `text-dim` `border-brand` `brand/8` `brand/60`,三点栏 `size-2.5 rounded-full bg-white/13`,阴影 `var(--shadow-term)`,缓动 `[0.22,1,0.36,1]`。
- 所有交互必须过 `useReducedMotion()`:开启「减少动态效果」时禁位移/弹出但功能不残缺;触屏(`pointerType !== 'mouse'`)无 hover 时可点信号常驻。
- 六卡等高不破:正文保留 `line-clamp-2 min-h-[2lh]`。
- 源成品目录:`/Users/kika/Desktop/project/Electron/claude-desktop/skills/`;壁纸源:`garden-gpt-image-2/image/desktop-bg-website-tone.png`。

---

## File Structure

- **Create** `public/screens/outputs/desktop-bg.png` — 壁纸(Image#1)。
- **Create** `public/screens/outputs/samples/{ppt,xlsx,docx,poster,report}.html` — 5 份真实成品(原样拷贝)。
- **Create** `public/screens/outputs/samples/video.mp4` — 视频成品(weread showcase)。
- **Overwrite** `public/screens/outputs/{ppt,xlsx,docx,png,html}.webp` + `mp4.webp` — 6 张新缩略图(真成品渲染图)。
- **Modify** `lib/content.ts` — outputCards 加 `sample`/`sampleKind` 字段,更新文案与来源注释。
- **Create** `components/sections/OutputDetailModal.tsx` — 弹层详情组件。
- **Modify** `components/sections/Outputs.tsx` — 卡片可点 + 悬浮信号 + 接弹层。

映射表(卡片 ↔ 源 ↔ public 落地):

| 卡片 ext | 源(skills/…) | sample 路径 | sampleKind | 缩略图 |
|---|---|---|---|---|
| .pptx | `deck-swiss-international/example.html` | `/screens/outputs/samples/ppt.html` | html | `ppt.webp` |
| .xlsx | `data-report/example.html`（含真数字明细表） | `/screens/outputs/samples/xlsx.html` | html | `xlsx.webp` |
| .docx | `article-magazine/example.html` | `/screens/outputs/samples/docx.html` | html | `docx.webp` |
| .png | `poster-hero/example.html` | `/screens/outputs/samples/poster.html` | html | `png.webp` |
| .mp4 | `weread-year-in-review-video-template/assets/default-showcase.mp4` | `/screens/outputs/samples/video.mp4` | video | `mp4.webp` |
| .html | `frame-data-chart-nyt/example.html`（NYT 折线图） | `/screens/outputs/samples/report.html` | html | `html.webp` |

---

## Task 1: 拷贝真实成品与壁纸到 public/

**Files:**
- Create: `public/screens/outputs/desktop-bg.png`
- Create: `public/screens/outputs/samples/{ppt,xlsx,docx,poster,report}.html`
- Create: `public/screens/outputs/samples/video.mp4`

**Interfaces:**
- Produces: 上表中的 6 个 sample 路径 + 壁纸,供 Task 2/3/4 引用。

- [ ] **Step 1: 建目录并拷入 5 份 HTML 成品**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
SRC=/Users/kika/Desktop/project/Electron/claude-desktop/skills
mkdir -p public/screens/outputs/samples
cp "$SRC/deck-swiss-international/example.html"        public/screens/outputs/samples/ppt.html
cp "$SRC/digits-fintech-swiss-template/example.html"  public/screens/outputs/samples/xlsx.html
cp "$SRC/article-magazine/example.html"               public/screens/outputs/samples/docx.html
cp "$SRC/poster-hero/example.html"                    public/screens/outputs/samples/poster.html
cp "$SRC/data-report/example.html"                    public/screens/outputs/samples/report.html
```

- [ ] **Step 2: 拷入视频成品与壁纸**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
cp /Users/kika/Desktop/project/Electron/claude-desktop/skills/weread-year-in-review-video-template/assets/default-showcase.mp4 \
   public/screens/outputs/samples/video.mp4
cp garden-gpt-image-2/image/desktop-bg-website-tone.png public/screens/outputs/desktop-bg.png
```

- [ ] **Step 3: 验证 7 个文件都到位且非空**

Run:
```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
ls -la public/screens/outputs/samples/ public/screens/outputs/desktop-bg.png
```
Expected: `ppt.html xlsx.html docx.html poster.html report.html video.mp4` 各 >1KB,`video.mp4` 约 6MB,`desktop-bg.png` 存在。

- [ ] **Step 4: Commit**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
git add public/screens/outputs/samples public/screens/outputs/desktop-bg.png
git commit -m "assets: 产出区接入 6 份 claude-desktop 真实成品 + 桌面壁纸"
```

---

## Task 2: 生成 6 张「真成品」缩略图(webp)

**Files:**
- Create(临时): `/private/tmp/claude-501/.../scratchpad/thumb-wrap.html`(截图用包装页,不入库)
- Overwrite: `public/screens/outputs/{ppt,xlsx,docx,png,html,mp4}.webp`

**Interfaces:**
- Consumes: Task 1 的 sample HTML / video。
- Produces: 6 张 16:9 webp,替换现有同名缩略图(卡片 `shot` 无需改路径)。

说明:缩略图=真成品渲染画面(纯成品,壁纸由卡片 CSS 单独铺,不烤进图)。用 chrome-devtools MCP 无头渲染 → PNG → cwebp。

- [ ] **Step 1: 逐份 HTML 成品截图为 PNG**

对 `ppt/xlsx/docx/poster/report` 各一份:用 chrome-devtools MCP
`navigate_page(file:///…/public/screens/outputs/samples/<name>.html)` →
`resize_page({width:1280,height:720})` → 等 1s 让 CDN Tailwind/字体加载 →
`take_screenshot({format:'png', filePath:'<scratchpad>/<slot>.png'})`。
其中 `poster→png` 槽、`report→html` 槽的输出名对齐缩略图名。

- [ ] **Step 2: 视频成品取一帧作缩略图**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
SCRATCH=/private/tmp/claude-501/-Users-kika-Desktop-project-Electron-claude-desktop-website/*/scratchpad
# ffmpeg 若可用:取第 1 秒一帧;不可用则用 MCP 打开 video.mp4 于浏览器截首帧
ffmpeg -y -ss 1 -i public/screens/outputs/samples/video.mp4 -frames:v 1 $SCRATCH/mp4.png 2>/dev/null && echo ok || echo "no ffmpeg — 用 MCP 截帧"
```
Expected: 生成 `mp4.png`;若无 ffmpeg,用 chrome-devtools MCP 打开一个内嵌 `<video src=…#t=1>` 的页面截图。

- [ ] **Step 3: PNG → webp(-q 82,与现有素材同规格),覆盖 6 张缩略图**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
SCRATCH=$(ls -d /private/tmp/claude-501/-Users-kika-Desktop-project-Electron-claude-desktop-website/*/scratchpad)
for n in ppt xlsx docx png html mp4; do
  cwebp -q 82 "$SCRATCH/$n.png" -o "public/screens/outputs/$n.webp"
done
ls -la public/screens/outputs/*.webp
```
Expected: 6 张 webp 更新,体积各 10–80KB。

- [ ] **Step 4: 肉眼核对缩略图是成品而非过程**

用 Read 工具打开 `public/screens/outputs/ppt.webp` 等,确认画面是完整成品(幻灯片/文档/海报/看板/视频帧),非界面/过程。若某张空白(CDN 未加载完),回 Step 1 加大等待再截。

- [ ] **Step 5: Commit**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
git add public/screens/outputs/*.webp
git commit -m "assets: 产出区六卡缩略图换成真成品渲染图"
```

---

## Task 3: content.ts 数据模型 —— 加 sample / sampleKind + 文案对齐

**Files:**
- Modify: `lib/content.ts:201-260`(outputCards 注释块 + 数组)

**Interfaces:**
- Produces: `outputCards` 每项新增 `sample: string` 与 `sampleKind: 'html' | 'video'`;`OutputCard` 类型经 `(typeof outputCards)[number]` 供组件用(签名不变,只多两字段)。

- [ ] **Step 1: 替换 outputCards 的类型、注释与数组**

把 `lib/content.ts` 第 201–260 行整段(从 `/*\n  shot = …` 注释到 `outputCards` 数组结束的 `]`)替换为:

```ts
/*
  每张卡绑定一份 claude-desktop 仓库的真实成品(2026-07-21 接入):
  - sample = public 下的成品文件;sampleKind 决定弹层用 iframe(html)还是 video。
  - shot = 该成品渲染出的缩略图(真成品画面,非过程截图);壁纸由卡片 CSS 单独铺。
  源(skills/…):ppt=deck-swiss-international · xlsx=data-report(取其明细数字表) ·
  docx=article-magazine · png=poster-hero · mp4=weread-year-in-review-video-template ·
  html=frame-data-chart-nyt(NYT 折线图)。均为模板自带 example.html / default-showcase.mp4,不虚构。
  (注:表格无纯 Excel 成品,用 data-report 里的真数字明细表顶上;数据报告改用 NYT 折线图避免与表格同源撞图。)
*/
export const outputCards: {
  icon: string
  title: Copy
  body: Copy
  ext: string
  shot: string
  shotAlt: Copy
  sample: string
  sampleKind: 'html' | 'video'
}[] = [
  {
    icon: '📊',
    title: { zh: '做 PPT / 演示', en: 'Slides & decks' },
    body: { zh: '一句话生成整套演示:套模板、配图表、写讲稿。点开翻真成品。', en: 'One prompt, a whole deck — template, charts, notes. Open to browse the real file.' },
    ext: '.pptx',
    shot: '/screens/outputs/ppt.webp',
    shotAlt: { zh: '瑞士国际主义风格的整套幻灯片成品', en: 'A finished Swiss-International slide deck' },
    sample: '/screens/outputs/samples/ppt.html',
    sampleKind: 'html',
  },
  {
    icon: '📈',
    title: { zh: '做表格', en: 'Spreadsheets' },
    body: { zh: '读表、算数、整理数据,交回一张能用的表。点开翻真成品。', en: 'Reads, computes, organizes — a usable sheet. Open to browse the real file.' },
    ext: '.xlsx',
    shot: '/screens/outputs/xlsx.webp',
    shotAlt: { zh: '数据周报里的明细数据表:月份 / MAU / 付费 / 流失率', en: 'A finished data table: month / MAU / paying / churn' },
    sample: '/screens/outputs/samples/xlsx.html',
    sampleKind: 'html',
  },
  {
    icon: '📄',
    title: { zh: '写方案 / 文档', en: 'Proposals & docs' },
    body: { zh: '从素材到排版好的整篇文档,导出就是能交付的 Word。点开翻真成品。', en: 'Material to a fully typeset doc, exported as ready-to-send Word. Open to browse.' },
    ext: '.docx',
    shot: '/screens/outputs/docx.webp',
    shotAlt: { zh: '杂志排版风格的整篇文档成品', en: 'A finished magazine-style document' },
    sample: '/screens/outputs/samples/docx.html',
    sampleKind: 'html',
  },
  {
    icon: '🖼',
    title: { zh: '生成图片 / 海报', en: 'Images & posters' },
    body: { zh: '从提示词到成图,海报、封面、社交卡片一步到位。点开看真成品。', en: 'Prompt to picture — posters, covers, social cards. Open to see the real one.' },
    ext: '.png',
    shot: '/screens/outputs/png.webp',
    shotAlt: { zh: '海报模板的成品', en: 'A finished poster from a poster template' },
    sample: '/screens/outputs/samples/poster.html',
    sampleKind: 'html',
  },
  {
    icon: '🎬',
    title: { zh: '生成视频', en: 'Video' },
    body: { zh: '从想法到成片,模板化的视频创作流程。点开直接播真成品。', en: 'Idea to final cut via a templated pipeline. Open to play the real clip.' },
    ext: '.mp4',
    shot: '/screens/outputs/mp4.webp',
    shotAlt: { zh: '视频模板的成品帧', en: 'A frame from a finished video template' },
    sample: '/screens/outputs/samples/video.mp4',
    sampleKind: 'video',
  },
  {
    icon: '📉',
    title: { zh: '数据报告与图表', en: 'Data reports & charts' },
    body: { zh: '数据进去,可交互的可视化报告出来。点开翻真成品。', en: 'Data in, an interactive visual report out. Open to browse the real file.' },
    ext: '.html',
    shot: '/screens/outputs/html.webp',
    shotAlt: { zh: 'NYT 编辑风格的折线图成品', en: 'A finished NYT-style editorial line chart' },
    sample: '/screens/outputs/samples/report.html',
    sampleKind: 'html',
  },
]
```

- [ ] **Step 2: 验证 typecheck 通过**

Run:
```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website && npx tsc --noEmit
```
Expected: 无错误(可能报 Outputs.tsx 未用新字段的告警?否——新增字段不会致错)。

- [ ] **Step 3: Commit**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
git add lib/content.ts
git commit -m "content: 产出卡加 sample/sampleKind 字段,文案对齐真成品"
```

---

## Task 4: OutputDetailModal 弹层详情组件

**Files:**
- Create: `components/sections/OutputDetailModal.tsx`

**Interfaces:**
- Consumes: `outputCards`(经 `(typeof outputCards)[number]` 取卡类型)、`usePrefs().t`。
- Produces:
  - `export function OutputDetailModal({ card, onClose }: { card: OutputCardT | null; onClose: () => void })`
  - 其中 `type OutputCardT = (typeof outputCards)[number]`(在本文件从 content 导入 outputCards 后 `typeof` 取得)。
  - `card` 为 `null` 时不渲染任何可见内容(AnimatePresence 负责退场);非空即打开。

- [ ] **Step 1: 写组件全文**

Create `components/sections/OutputDetailModal.tsx`:

```tsx
'use client'

/*
  产出成品弹层:点卡片打开,成品浮在桌面壁纸上的一扇产品大窗里。
  - html 成品用 <iframe>(可滚动浏览);video 成品用 <video controls>。
  - 壁纸 = /screens/outputs/desktop-bg.png,作暗背景之上的桌面底。
  - 无障碍:role=dialog + aria-modal;Esc / 点背景 / 关闭按钮均可关;
    打开时锁滚动、焦点移入关闭按钮,关闭后焦点归还触发卡片(由 Outputs 侧处理)。
  - 减少动态效果:去掉弹出缩放/淡入,直接显隐。
*/

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { outputCards } from '@/lib/content'
import { usePrefs } from '@/lib/prefs'

type OutputCardT = (typeof outputCards)[number]

export function OutputDetailModal({ card, onClose }: { card: OutputCardT | null; onClose: () => void }) {
  const { t } = usePrefs()
  const reduced = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Esc 关闭 + 锁滚动 + 打开时焦点进关闭按钮
  useEffect(() => {
    if (!card) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [card, onClose])

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={t(card.title)}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* 暗背景 + 桌面壁纸 */}
          <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: 'url(/screens/outputs/desktop-bg.png)' }}
            aria-hidden="true"
          />

          {/* 产品大窗 */}
          <motion.div
            className="relative flex max-h-[88vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-[18px] border border-edge bg-panel"
            style={{ boxShadow: 'var(--shadow-term)' }}
            initial={reduced ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.96, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 三点栏 + 标题 + 关闭 */}
            <div className="flex items-center gap-[7px] border-b border-edge px-4 py-[11px]">
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <i className="size-2.5 rounded-full bg-white/13" />
              <span className="ml-2.5 flex items-center gap-2 font-mono text-[11px] text-dim">
                <span aria-hidden="true">{card.icon}</span>
                {t(card.title)}
                <span className="text-brand">{card.ext}</span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t({ zh: '关闭', en: 'Close' })}
                className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-dim transition-colors hover:bg-white/8 hover:text-ink"
              >
                <span aria-hidden="true" className="text-[15px] leading-none">✕</span>
              </button>
            </div>

            {/* 成品内容:html → iframe;video → 播放器 */}
            <div className="min-h-0 flex-1 overflow-auto bg-black/20">
              {card.sampleKind === 'html' ? (
                <iframe
                  src={card.sample}
                  title={t(card.shotAlt)}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                  className="h-[78vh] w-full border-0 bg-white"
                />
              ) : (
                <video
                  src={card.sample}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[78vh] w-full bg-black"
                  aria-label={t(card.shotAlt)}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: 验证 typecheck 通过**

Run:
```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website && npx tsc --noEmit
```
Expected: 无错误。若报 `t({zh,en})` 类型不符,确认 `Copy` 为 `{ zh: string; en: string }`(是),则字面量即合法。

- [ ] **Step 3: Commit**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
git add components/sections/OutputDetailModal.tsx
git commit -m "feat: 产出成品弹层组件(iframe/video + 壁纸 + 无障碍)"
```

---

## Task 5: Outputs.tsx —— 卡片可点 + 悬浮信号 + 接弹层

**Files:**
- Modify: `components/sections/Outputs.tsx`(全文)

**Interfaces:**
- Consumes: `OutputDetailModal`(Task 4)、`outputCards`(Task 3 新字段)。
- Produces: 卡片可点击打开弹层;新增 `activeCard` 状态。

- [ ] **Step 1: 在文件顶部引入 modal 与 state,并给 OutputCard 加 onOpen**

改 `components/sections/Outputs.tsx`:

在 imports 增补:
```tsx
import { useEffect, useRef, useState } from 'react'
import { OutputDetailModal } from './OutputDetailModal'
```
(`useState` 已在;确保 import 行含它。)

- [ ] **Step 2: 改 OutputCard 签名与交互(可点 + 悬浮信号)**

把 `function OutputCard({ card }: …)` 整个函数替换为下列版本(在现有 3D 跟手基础上:外层加 `y` 上浮、`onClick`、键盘、可点标签):

```tsx
function OutputCard({ card, onOpen }: { card: (typeof outputCards)[number]; onOpen: () => void }) {
  const { t } = usePrefs()
  const reduced = useReducedMotion()

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const [lit, setLit] = useState(false)
  const [touch, setTouch] = useState(false) // 触屏:无 hover,可点信号常驻

  const rotateX = useSpring(useTransform(py, (v) => (v - 0.5) * -8), SPRING)
  const rotateY = useSpring(useTransform(px, (v) => (v - 0.5) * 8), SPRING)
  const shotX = useSpring(useTransform(px, (v) => (v - 0.5) * -12), SPRING)
  const shotY = useSpring(useTransform(py, (v) => (v - 0.5) * -10), SPRING)
  const glow = useTransform([px, py], ([x, y]: number[]) =>
    `radial-gradient(280px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.10), transparent 65%)`,
  )

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') {
      setTouch(true)
      return
    }
    if (reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
    setLit(true)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
    setLit(false)
  }

  // 可点信号常显条件:触屏 或 开了减少动态效果
  const cueAlways = touch || reduced

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={t({ zh: '查看成品:', en: 'View output: ' }) + t(card.title)}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen()
          }
        }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-edge bg-panel outline-none transition-[border-color] duration-300 hover:border-edge-brand focus-visible:border-edge-brand"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
        }}
        whileHover={reduced ? undefined : { y: -4 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        {/* 迷你产品窗 */}
        <div className="border-b border-edge">
          <div className="flex items-center gap-[6px] px-3.5 py-[9px]">
            <i className="size-2 rounded-full bg-white/13" />
            <i className="size-2 rounded-full bg-white/13" />
            <i className="size-2 rounded-full bg-white/13" />
            <span className="ml-2 font-mono text-[10.5px] text-dim">{card.ext.slice(1)}</span>
          </div>
          <div className="relative aspect-video overflow-hidden">
            <motion.img
              src={card.shot}
              alt={t(card.shotAlt)}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ x: reduced ? 0 : shotX, y: reduced ? 0 : shotY, scale: 1.06 }}
            />
          </div>
        </div>

        <div className="p-[22px]">
          <div className="flex items-center gap-2.5">
            <span className="text-[19px]" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="min-w-0 truncate text-[16px] font-bold">{t(card.title)}</h3>
            <span className="ml-auto shrink-0 font-mono text-[11.5px] text-brand">{card.ext}</span>
          </div>
          <p className="mt-[7px] line-clamp-2 min-h-[2lh] text-[13px] leading-[1.65] text-dim">{t(card.body)}</p>
        </div>

        {/* 跟随指针的柔光 */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ background: glow, opacity: lit ? 1 : 0 }}
          />
        )}

        {/* 可点信号:「查看成品 →」标签。hover/聚焦淡入上移;触屏或 reduced 常显 */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute right-3.5 bottom-3.5 inline-flex items-center gap-1 rounded-full border border-edge-brand bg-panel/80 px-2.5 py-1 font-mono text-[11px] text-brand backdrop-blur transition-all duration-300 ${
            cueAlways
              ? 'translate-y-0 opacity-100'
              : 'translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100'
          }`}
        >
          {t({ zh: '查看成品', en: 'View file' })} →
        </span>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: 在 Outputs() 里挂 state、传 onOpen、渲染弹层**

把 `export function Outputs()` 整个函数替换为:

```tsx
export function Outputs() {
  const { t } = usePrefs()
  const [activeCard, setActiveCard] = useState<(typeof outputCards)[number] | null>(null)
  const lastTrigger = useRef<HTMLElement | null>(null)

  const close = () => {
    setActiveCard(null)
    // 焦点归还触发卡片
    lastTrigger.current?.focus()
    lastTrigger.current = null
  }

  return (
    <section id="outputs" className="relative z-[1] mx-auto max-w-[1180px] px-8 py-[90px]">
      <SectionHead eyebrow={t(outputsSection.eyebrow)} title={t(outputsSection.title)} />

      <Reveal delay={0.1} className="mt-[34px] flex items-baseline gap-3.5">
        <Counter />
        <span className="text-[15px] text-dim">{t(outputsSection.counterLabel)}</span>
      </Reveal>

      <RevealGrid className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {outputCards.map((card) => (
          <RevealGridItem key={card.ext + card.title.en}>
            <OutputCard
              card={card}
              onOpen={() => {
                lastTrigger.current = document.activeElement as HTMLElement
                setActiveCard(card)
              }}
            />
          </RevealGridItem>
        ))}
      </RevealGrid>

      <OutputDetailModal card={activeCard} onClose={close} />
    </section>
  )
}
```

- [ ] **Step 4: typecheck + build 通过**

Run:
```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website && npx tsc --noEmit && npm run build
```
Expected: typecheck 无错;build 成功(`✓ Compiled`)。若 `edge-brand`/`bg-panel/80` 等 class 报错,它们是既有 Tailwind token,应正常。

- [ ] **Step 5: 浏览器实看(chrome-devtools MCP)**

启动 `npm run dev`(后台),用 chrome-devtools MCP 打开 `http://localhost:3000/#outputs`,验证:
1. 六卡缩略图是真成品画面。
2. `hover` 一张卡 → 轻微上浮 + 右下「查看成品 →」淡入。
3. `click` 一张 html 卡 → 弹层打开,iframe 里能滚动看整份成品。
4. `click` 视频卡 → 弹层里视频可播放。
5. 按 `Escape` / 点暗背景 / 点 ✕ → 弹层关闭。
6. `emulate` reduced-motion → 标签常显、无位移,点击仍能开弹层。

- [ ] **Step 6: Commit**

```bash
cd /Users/kika/Desktop/project/Electron/claude-desktop-website
git add components/sections/Outputs.tsx
git commit -m "feat: 产出卡可点击 + 悬浮可点信号,接入成品弹层详情"
```

---

## Self-Review 结果

- **Spec 覆盖**:壁纸(T1+T4 modal 背景)、真成品文件(T1/T2)、成品而非过程(T2 缩略图 + T4 弹层)、悬浮可点信号(T5 Step2)、弹层可浏览成品(T4)、无障碍/降级(T4+T5)、六卡等高(T5 保留 line-clamp/min-h)——均有对应任务。
- **Placeholder 扫描**:无 TODO/TBD;每个代码步给出完整代码。
- **类型一致**:`OutputCardT`/`(typeof outputCards)[number]` 全程一致;`sampleKind: 'html'|'video'` 在 content 与 modal 一致;`OutputDetailModal({card,onClose})` 签名与调用一致;`onOpen` 在 OutputCard 定义与 Outputs 传参一致。
- **已知取舍**:表格槽用财务表格模板(用户已确认);iframe 成品依赖 CDN,首开有短暂加载,属预期。

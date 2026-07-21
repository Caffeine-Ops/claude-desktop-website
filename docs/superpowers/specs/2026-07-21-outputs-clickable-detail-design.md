# 「产出」区块升级:真成品缩略图 + 悬浮可点信号 + 弹层详情

日期:2026-07-21 · 状态:待用户批准

## 背景与目标

「产出」区(`#outputs`,139 计数器 + 六张 3D 跟手卡)现状:每张卡上半嵌一张
产品**过程/界面**静态截图,悬停仅有 3D 跟手,点击无反应,无详情页。

本次升级把六张卡从「看一眼截图」变成「点开翻真成品」:

1. **背景图**:用户提供的绿色壁纸(`garden-gpt-image-2/image/desktop-bg-website-tone.png`,
   下称 Image#1)作为「桌面壁纸」——每份成品像一扇产品小窗浮在这张壁纸上,
   卡片缩略图与弹层详情共用同一张壁纸打底,与官网深绿调统一。
2. **成品文件而非过程**:六卡各绑定一份 claude-desktop 仓库里的**真实成品**
   (模板 `example.html` 完整作品 / 视频模板的真 `.mp4`)。
3. **悬浮可点信号**:鼠标移上卡片 → 整卡轻微上浮 + 底部淡入「查看成品 →」标签 +
   指针变手型,明确提示可点击看详情。
4. **弹层详情**:点卡片,成品在当前页盖一层大窗打开;HTML 成品用内嵌框架
   (iframe)可滚动浏览,视频用带控件的播放器。Esc / 点背景 / 关闭按钮均可关。

不虚构原则不变:所有成品均来自产品仓库现有的真实产物,不做假图、不新造内容。

## 素材映射:6 卡 ↔ claude-desktop 真实成品

源目录:`/Users/kika/Desktop/project/Electron/claude-desktop/skills/`

| 卡片 | ext | 源成品 | 详情页展示 |
|---|---|---|---|
| 📊 做 PPT / 演示 | .pptx | `deck-swiss-international/example.html` | 整套瑞士国际主义幻灯片,可滚动翻页 |
| 📈 做表格 | .xlsx | `digits-fintech-swiss-template/example.html` | 财务表格 / 数字看板 |
| 📄 写方案 / 文档 | .docx | `article-magazine/example.html` | 一整篇排版文档 |
| 🖼 生成图片 / 海报 | .png | `poster-hero/example.html` | 成品海报 |
| 🎬 生成视频 | .mp4 | `weread-year-in-review-video-template/assets/default-showcase.mp4` | `<video controls>` 直接播放 |
| 📉 数据报告与图表 | .html | `data-report/example.html` | 可交互数据看板 |

说明:
- 产品的幻灯片 / 文档 / 看板成品本身就是渲染成 HTML 的,PPT/Word/Excel 只是导出格式,
  所以仓库无 `.pptx/.xlsx/.docx` 二进制,用对应模板的 `example.html` 即真成品。
- 表格槽最弱:产品的 Excel 由 Python 现导出,仓库无现成 `.xlsx`,故用财务表格模板
  (`digits-fintech-swiss-template`,满是表格/数字)顶上——已获用户确认。
- 这些 `example.html` 自包含,但引用 CDN(Tailwind、Google Fonts),iframe 内需联网渲染。

## 素材落地(public/)

- `public/screens/outputs/desktop-bg.png` ← Image#1(壁纸底)。
- `public/screens/outputs/samples/{ppt,xlsx,docx,poster,report}.html` ← 5 份 `example.html` 原样拷入。
- `public/screens/outputs/samples/video.mp4` ← weread 的 `default-showcase.mp4`(约 6 MB)。
- `public/screens/outputs/{ppt,xlsx,docx,png,html}.webp` ← 6 张卡的**新缩略图**,
  由无头 Chrome 把 `example.html` 渲染在 Image#1 壁纸上截图、`cwebp -q 82` 压制(与现有同规格);
  视频卡缩略图 `mp4.webp` 取 mp4 的一帧海报叠壁纸。缩略图仍保持 16:9,沿用现有 `object-cover`。

## 数据结构(lib/content.ts · outputCards)

每张卡新增字段:
- `sample: string` — 成品在 public 下的路径(html 或 mp4)。
- `sampleKind: 'html' | 'video'` — 详情页据此决定用 iframe 还是 `<video>`。
- 保留 `icon / title / body / ext / shot / shotAlt`;更新 `shot`(新缩略图)、
  `body` / `shotAlt` 文案对齐「真成品」,更新顶部来源注释。

## 组件改造(components/sections/Outputs.tsx)

### 卡片可点化(OutputCard)
- 卡片外层从 `div` 语义化为可点击:用 `<button>` 或 `role="button" tabIndex=0` +
  `onClick` / 回车/空格触发,`aria-label` 说明「查看 X 成品」。指针 `cursor-pointer`。
- 保留现有 3D 跟手 / 反向视差 / 光斑,不改这套语言。
- 新增**可点信号**(需求 3):
  - 悬停:整卡 `translateY(-4px)` 轻浮 + 底部淡入一枚「查看成品 →」pill 标签。
  - 触屏(`pointerType !== 'mouse'`):标签常驻显示(无 hover 可依赖)。
  - 开启「减少动态效果」:标签常驻、不做位移;3D 跟手本就已禁用。

### 弹层详情(新组件 OutputDetailModal)
- 用 `motion/react` 的 `AnimatePresence`:半透明暗背景淡入 + 内容窗从 `scale .96→1` 弹出。
- 结构:暗背景 → 居中「产品大窗」(圆角 + 三点栏 + 标题/ext 徽章)浮在 Image#1 壁纸上 →
  窗内容:
  - `sampleKind==='html'` → `<iframe src={sample} sandbox="allow-scripts allow-same-origin" loading="lazy">`,
    容器可滚动;宽度撑满窗、按内容自适应高度(deck 类较高,允许纵向滚动)。
  - `sampleKind==='video'` → `<video src={sample} controls playsInline>`,16:9。
- 交互与无障碍:`role="dialog"` `aria-modal="true"`;打开时锁滚动 + 焦点移入窗内、
  记录并在关闭后归还触发卡片的焦点(焦点陷阱);Esc / 点暗背景 / 关闭按钮均可关。
- 减少动态效果:去掉弹出/淡入位移,直接显隐。

### 状态管理
- `Outputs` 持有 `activeCard: OutputCard | null`;卡片 `onClick` 设值,Modal 依此显隐。
- 一次只开一个弹层;`AnimatePresence` 负责进出场。

## 动效实现要点(不引新依赖,沿用 motion/react)

- 悬浮上浮:`whileHover`/受控 `animate` 给外层 `y: -4`,`SPRING` 同款弹簧。
- 「查看成品 →」标签:`opacity 0→1` + `y 6→0`,`lit` 或触屏/reduced 时常显。
- 弹层:`AnimatePresence` + backdrop `opacity`、窗 `scale`/`opacity`,`ease` 沿用现有 `[0.22,1,0.36,1]`。

## 无障碍与降级

- 键盘:卡片可 Tab 聚焦、回车/空格打开;弹层内焦点陷阱、Esc 关闭、关闭后焦点归还。
- 触屏:无 hover,可点信号常驻;点击直接开弹层。
- `prefers-reduced-motion`:禁跟手/视差/弹出位移,保留全部功能(可点、可看成品)。
- iframe 成品依赖 CDN;首次打开可能有短暂加载,属预期。

## 影响面与红线

- 只改:`components/sections/Outputs.tsx`、`lib/content.ts`、`public/screens/outputs/**`(新增素材)。
- 可能新增:`components/sections/OutputDetailModal.tsx`(或内联同文件)。
- 不动首屏 Hero、其他区块、全局指针流。
- 不新增运行时依赖(motion/react 已在用)。

## 验收标准

1. 六张卡缩略图是**真成品**渲染在绿壁纸上,非过程截图。
2. 悬停有明确「可点」信号(上浮 + 标签 + 手型);触屏/reduced 下信号常驻。
3. 点任一卡 → 弹层打开,能翻/播对应真成品(5 份 HTML 可滚动、视频可播放)。
4. Esc / 点背景 / 关闭按钮均可关;键盘可完整走通;开启减少动态效果功能不残缺。
5. 六卡等高不破;`bun run build` / typecheck 通过。

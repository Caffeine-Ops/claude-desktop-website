# Claude Desktop 官网设计文档

> 状态:设计定稿(结构已确认) · 日期:2026-07-16 · 作者:kika + Claude
> 范围:单页落地页(结构上预留多页扩展),托管 GitHub Pages,中英双语。
> 本文档只描述"设计与内容",不含实现代码。后续落地由独立项目 `claude-desktop-website` 承接。

---

## 1. 目标与非目标

**要达成的目标**
- 让访客一眼看懂:Claude Desktop 是一个"会创作的 AI 桌面助手" —— 一句话就能让 AI 帮你做 PPT、表格、方案、文档、图片、视频等。
- 提供清晰的下载入口:按平台(macOS Apple/Intel、Windows、Linux)直达最新 GitHub Release 安装包,并显示当前版本号。
- 信息分层:顶部对普通用户直白说人话,往下逐渐露出面向开发者的深度(基于 Claude Agent SDK、插件体系等)。

**这一版不做(非目标)**
- 不做多页站点(但结构上留口子,见 §5.8)。
- 不做账户/登录、在线试用、付费墙。
- 不做博客/文档中心(先用外链指向仓库 README)。
- 不做后端服务(纯静态站点 + 浏览器端调用 GitHub API)。

---

## 2. 目标受众

**两类受众,信息分层兼顾:**

| 受众 | 他们最想弄明白 | 官网哪一段服务他们 |
|---|---|---|
| 普通专业用户(非开发者) | 这东西能帮我干什么活?好不好用?怎么下载? | Hero、核心价值三连、"能做什么"产出网格、下载区 |
| 开发者/技术用户 | 底层是什么?能不能扩展?可信吗? | 平台级能力区、面向开发者区、GitHub 外链 |

叙事顺序 = 先"产出"抓住所有人,再"底座/技术"留住技术用户。

---

## 3. 定位与核心信息

**定位角度:会创作的 AI 桌面助手**(主打产出,141+ 技能当钩子)。

**Hero 主标题(文案方向,非最终定稿):**
- 中文:「一句话,让 AI 帮你做完 PPT、表格、方案和更多」
- English: "One prompt away from finished slides, sheets, docs, and more."

**Hero 副标题:**
- 中文:桌面端的 Claude —— 内置 141+ 创作技能、可视化设计画布与知识库,聊天即可产出。
- English: Claude on your desktop — 141+ built-in creation skills, a visual design canvas, and a knowledge base. Just chat, and it ships.

> 文案原则:动词开头、讲产出、少术语;每句都能被一个非技术用户读懂。术语(Agent、SDK、RAG)一律放到下半部分再出现。

---

## 4. 视觉与品牌方向

- **主色**:复用产品已有的品牌绿 `--brand`(不随用户主题走的身份色)。官网强调色统一用它。
- **明暗双主题**:跟随访客系统 `prefers-color-scheme`,并提供手动切换(与产品"双标记"理念一致,但官网是独立站点,自成一套即可)。
- **视觉素材**:以真实产品截图 / 演示 GIF 为主(截图 > 纯色块 > 抽象插画)。首版可用占位图,素材清单见 §7。
- **动效**:用 Motion(前 Framer Motion)做入场与滚动动效 —— 克制为主,滚动进入时的淡入/位移、Hero 的轻微视差即可,避免喧宾夺主。已全局装好 Motion + AI Kit。
- **排版**:标题大而稀疏,正文行长受控;宽内容(截图、代码、表格)各自 `overflow-x:auto`,页面主体不横向滚动。
- **响应式**:移动端优先保证 Hero 主标题 + 下载按钮 + 产出网格可读可点。

---

## 5. 信息架构(单页,从上到下)

单页 7 段。每段都设计成"将来能升级为独立路由页"的自足模块(见 §5.8 多页口子)。

### 5.1 顶部导航条(Nav)
- 左:Logo + 「Claude Desktop」。
- 右:功能锚点(能做什么 / 功能 / 下载)、GitHub 图标、**下载**按钮、**中 / EN** 语言切换。
- 顶栏固定(sticky),滚动时半透明毛玻璃。
- 多页口子:每个锚点 = 将来的路由项(`/features`、`/download` …),现在先锚点滚动。

### 5.2 Hero 第一屏
- 主标题 + 副标题(见 §3)。
- **主 CTA**:下载按钮 —— 自动识别访客系统,高亮主推(如 Mac 用户看到"下载 macOS 版"),旁边小字"其它平台 ↓"锚到下载区。
- **次 CTA**:看功能 / GitHub。
- **主视觉**:产品主界面截图(聊天 + 画布双面),占位待补真实截图。
- **信任条**:跨平台图标(mac/win/linux)+「基于 Claude Agent SDK」一行小字。

### 5.3 核心价值三连(Value Props)
一句话说清"为什么用它",三张卡:
1. **会创作** —— 141+ 技能,聊天即产出成品文件。
2. **会思考** —— Agent 能调用工具、检索你的知识库来回答。
3. **你放心** —— 权限把关,危险操作(删文件、跑命令)先问你再动手。

### 5.4 「能做什么」产出网格(④-A,给普通用户的钩子)
图标网格,直接摆用户想要的**产出**(全部对应真实技能,见 §6 能力清单):

| 产出 | 对应能力(真实存在) |
|---|---|
| 做 PPT / 演示 | `ppt-master` `ppt-keynote` `pptx-generator` + 多风格模板 |
| 做表格 | `spreadsheets` |
| 写方案 | `proposal-writer` |
| 写文档 / 简历 / PDF | `doc` `docx` `resume-modern` `pdf` |
| 数据报告 & 可视化 | `data-report` `d3-visualization` |
| 生成图片 / 海报 | `imagegen` `gpt-image-2` `poster-hero` |
| 生成视频 | `sora` `remotion` + 视频模板 |
| 社交卡片 | 小红书 / Twitter / Reddit / Spotify |
| 文案 / 品牌 | `copywriting` `brand-guidelines` |
| 网页 / 设计系统 | `web-design-engineer` `figma-*` |

网格底部一行:「**141+ 技能,持续增长**」。

### 5.5 平台级能力(④-B,支撑产出的底座)
图文交替,4 块。每块:一句大白话标题 + 一句解释 + 一张示意图。
1. **设计画布 Canvas** —— 可视化创作工作台,聊天产出直接在画布上改、组织、导出。
2. **知识库(RAG)** —— 把你的资料喂进去,AI 检索着回答;不再瞎编。(RAG = 让 AI 先查资料再答)
3. **聊天 + Agent** —— 不只是问答:能连续调用工具完成多步任务,带会话/项目管理,权限安全兜底。
4. **插件 + 连接器** —— 接入外部系统、扩展能力,插件体系可持续加装。

### 5.6 面向开发者区(信息分层的下半部分)
给技术用户的深度,普通用户已在上面被说服可跳过:
- 基于 **Claude Agent SDK**;打包内置 fusion-code CLI,亦可切换到系统 `claude`。
- 多运行时模型、插件/连接器体系、开源可审计。
- CTA:GitHub 仓库、README(中/英)、架构说明。

### 5.7 下载区(Download,官网核心目标之一)
详细技术方案见 §8。设计要点:
- 按平台分卡:**macOS(Apple 芯片 / Intel)**、**Windows**、**Linux**。
- 每卡显示:平台名、当前版本号、文件大小(可选)、系统要求、下载按钮(直链安装包资产)。
- 顶部一行:当前最新版本号 + 发布日期 + 「查看历史版本」(指向 Releases 页)。
- 自动识别访客系统,高亮主推平台卡。

### 5.8 页脚(Footer)
- 链接:GitHub、README(中/英)、License、当前版本、反馈渠道(Issues)。
- 语言切换(与顶栏联动)。
- 版权 + 「基于 Claude Agent SDK」署名。

### 多页扩展口子(为将来铺路,现在不建)
每个 section 都是自足模块 + 独立锚点。将来升级多页时:
- `/`(首页 = Hero + 价值三连 + 产出网格精选 + 下载入口)
- `/features`(产出网格全量 + 平台级能力详解)
- `/download`(现下载区独立成页 + 历史版本表)
- `/developers`(开发者区独立成页)
路由用 Next.js App Router;现在先用单页 + 锚点,组件按 section 拆好即可平滑升级。

---

## 6. 能力清单(官网可展示、代码中真实存在)

以下均来自仓库 `skills/`(共 141 个)与产品界面,官网只展示真实能力,不虚构:

- **演示/PPT**:`ppt-master` `ppt-keynote` `pptx` `pptx-generator` `nanobanana-ppt` `slides` `frontend-slides` `deck-swiss-international` `deck-guizang-editorial` `html-ppt-retro-quarterly-review`
- **表格**:`spreadsheets`
- **方案/文档**:`proposal-writer` `doc` `docx` `minimax-docx` `pdf` `minimax-pdf` `resume-modern` `data-report` `release-notes-one-pager`
- **图片/海报**:`imagegen` `imagen` `gpt-image-2` `poster-hero` `venice-image-generate` `fal-generate` `image-enhancer`
- **视频**:`sora` `remotion` `fal-video-edit` `venice-video` `video-hyperframes` + 多个视频模板
- **社交卡片**:`card-xiaohongshu` `card-twitter` `social-x-post-card` `social-reddit-card` `social-spotify-card`
- **文案/品牌/创意**:`copywriting` `brand-guidelines` `creative-director` `marketing-psychology`
- **网页/前端/设计系统**:`web-design-engineer` `frontend-design` `web-artifacts-builder` `figma-generate-design` `theme-factory` `design-md`
- **可视化/图表**:`d3-visualization` `data-report` `hand-drawn-diagrams`
- **音频/音乐/语音**:`ai-music-album` `venice-audio-music` `venice-audio-speech` `speech`

> 平台级能力(非 skill,来自产品本体):设计画布 Canvas、知识库(RAG/语义检索)、记忆、聊天+Agent(工具调用/权限)、插件、连接器、项目工作区、自动化、自动更新、跨平台(mac/win/linux)。

---

## 7. 待补素材清单(交付前需要真实素材)

首版可用占位,上线前替换:
- [ ] 产品 Logo(SVG,深/浅两版)
- [ ] Hero 主视觉:产品主界面截图(聊天+画布双面),深/浅主题各一
- [ ] 产出网格:每类产出一张成品示意图或 GIF(PPT、表格、方案、图片、视频、卡片…)
- [ ] 平台级能力 4 块:各一张示意图(Canvas、知识库、Agent、插件)
- [ ] 平台图标(macOS / Windows / Linux)
- [ ] favicon
- [ ] 演示 GIF(可选):一段"一句话 → 出成品"的录屏,放 Hero 或价值区

---

## 8. 下载区技术方案(方案 B:GitHub API 动态获取)

**目标**:下载按钮永远指向最新 Release,版本号自动更新,无需每次发版手动改官网。

**数据源**:GitHub REST API
```
GET https://api.github.com/repos/Caffeine-Ops/claude-desktop/releases/latest
```
返回 JSON 含 `tag_name`(版本号,如 `v0.0.32`)、`published_at`(发布日期)、`assets[]`(每个安装包的 `name` / `browser_download_url` / `size`)。

**前端逻辑(浏览器端,纯静态可行)**:
1. 页面加载时 `fetch` 上述 API(匿名请求,无需 token)。
2. 从 `assets[]` 按文件名规则匹配各平台安装包:
   - macOS Apple 芯片:`*-arm64.dmg` / `*-arm64-mac.zip`
   - macOS Intel:`*-x64.dmg` / `*-x64-mac.zip`(或 universal 包)
   - Windows:`*.exe`(NSIS)/ `*-win.zip`
   - Linux:`*.AppImage` / `*.deb`
   > 具体后缀以 electron-builder 实际产物为准,落地时对照一次 Releases 页资产名。
3. 把 `tag_name` 显示为当前版本;`published_at` 显示发布日期。
4. 每卡的下载按钮 `href` = 对应 asset 的 `browser_download_url`;`size` 显示文件大小。

**访客系统识别**:用 `navigator.userAgent` / `navigator.platform` 粗判 mac/win/linux,高亮主推平台卡与 Hero 主 CTA。

**韧性设计(重要,别裸奔)**:
- **超时 + 兜底**:API 请求设超时(如 5s);失败时**降级**为静态兜底 —— 按钮直接指向 Releases 页面 `https://github.com/Caffeine-Ops/claude-desktop/releases/latest`(用户仍能下到,只是不显示细粒度版本号)。
- **限流**:GitHub 匿名 API 有速率限制(每 IP 每小时 60 次)。缓解:结果 `localStorage` 缓存一段时间(如 1 小时),减少重复请求;命中缓存直接用。
- **加载态**:请求未回来时按钮显示"获取最新版本…",不要空白或跳动。
- **资产缺失容错**:某平台在本次 Release 没有对应资产时,该卡降级为"前往 Releases 页"。

> 🎓 [软件工程地基:韧性设计] 这一段就是韧性四件套里的"超时·降级·限流·容错"落到一个真实场景。官网调外部 API(GitHub)属于"依赖别人的服务",别人挂了/限流了你不能跟着白屏 —— 所以永远准备一条静态兜底路径。这是可迁移的手感:任何"调外部服务"的地方都该问一句"它超时/失败/被限流时,我给用户看什么?"想深入我可以展开。

---

## 9. 双语机制(中英)

- **组织方式**:文案抽成 key → { zh, en } 的字典(如一个 `content.ts`/JSON),组件按当前语言取值。
- **切换**:顶栏 + 页脚的「中 / EN」开关,写入 `localStorage`;首访按 `navigator.language` 猜默认语言。
- **默认**:猜不出时默认中文(主要受众)或按浏览器语言,二选一,落地时定。
- **范围**:所有可见文案双语;技能名/版本号/平台名等专有名词保持原样。

---

## 10. 技术栈与项目形态

- **项目形态**:**独立项目** `claude-desktop-website`,与主 monorepo 分家(不作为 monorepo 内的包),自成一个可独立部署的静态站点。
- **技术栈**:Next.js(App Router,`next export` 出静态)+ Tailwind + Motion(动效)。
- **托管**:GitHub Pages(静态托管,免费,与仓库天然打通)。
- **无后端**:下载数据靠浏览器端调 GitHub API(§8),纯静态即可。
- **为多页铺路**:组件按 §5 的 section 拆分,单页先上;将来加路由即升级多页,不推倒重来。

---

## 11. 分期路线

- **第一期(本设计)**:单页落地页上线 —— Hero + 价值三连 + 产出网格 + 平台级能力 + 开发者区 + 下载区(方案 B)+ 页脚,中英双语,GitHub Pages。
- **第二期(留口子,暂不做)**:拆多页(features / download / developers)、加历史版本表、加演示视频、加 FAQ。
- **第三期(更远)**:博客/更新日志、SEO 优化、更多演示素材。

---

## 12. 开放问题 / 待定稿

1. **Hero 文案最终措辞** —— §3 是方向不是定稿,需你拍板中英终版。
2. **默认语言策略** —— 猜不出时默认中文,还是严格跟浏览器语言?(§9)
3. **产出网格展示几个** —— 首页精选(如 8 个)还是全量铺开?(建议首页精选,全量放 /features 二期)
4. **安装包资产命名** —— 落地时需对照一次真实 Releases 页,确认各平台后缀匹配规则(§8 步骤 2)。
5. **域名** —— 用 GitHub Pages 默认域名还是绑自定义域名?
6. **仓库是否公开** —— 下载区靠匿名 GitHub API,要求 `Caffeine-Ops/claude-desktop` 的 Releases 可公开访问;若仓库私有需另想分发方式。

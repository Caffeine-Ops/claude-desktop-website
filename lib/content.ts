/*
  ─────────────────────────────────────────────────────────────
  站点文案：全站每一句可见的话都在这个文件里，中英各一份。
  ─────────────────────────────────────────────────────────────
  为什么这么组织（数据与展示分离）：
  组件只负责「怎么排版」，不负责「说什么」。以后改文案、加语言，只动这里，
  不用去翻 8 个组件文件。每条文案是 { zh, en } 一对，组件按当前语言取值。

  文案原则（来自设计文档 §3）：动词开头、讲产出、少术语。
  Agent / SDK / RAG 这类术语一律押后到页面下半部分再出现，且第一次出现就地解释。

  诚实原则（设计文档 §6）：这里出现的每一个技能名都真实存在于产品 skills/ 目录，
  不许为了好看编能力。产出网格的技能名就是这条原则的兑现。
*/

// import type = 只借类型，不借代码。编译后这行会被整个抹掉，所以虽然 github.ts
// 反过来又引了本文件的 site，运行时也不会绕成死循环。
import type { PlatformKey } from './github'

export type Lang = 'zh' | 'en'

/** 一句双语文案。组件里用 t(copy) 取出当前语言那一半。 */
export type Copy = { zh: string; en: string }

export const site = {
  name: 'Claude Desktop',
  repoUrl: 'https://github.com/Caffeine-Ops/claude-desktop',
  releasesUrl: 'https://github.com/Caffeine-Ops/claude-desktop/releases',
  /** 「永远是最新版」的兜底地址：GitHub API 挂了/被限流时，按钮退到这里，用户照样下得到。 */
  latestReleaseUrl: 'https://github.com/Caffeine-Ops/claude-desktop/releases/latest',
  issuesUrl: 'https://github.com/Caffeine-Ops/claude-desktop/issues',
  readmeUrl: 'https://github.com/Caffeine-Ops/claude-desktop#readme',
  /* 仓库根本没有 LICENSE 文件(点过去是 404),许可情况写在 README 的 License 一节里——指到那儿。 */
  licenseUrl: 'https://github.com/Caffeine-Ops/claude-desktop#license',
  agentSdkUrl: 'https://docs.claude.com/en/api/agent-sdk/overview',
} as const

/*
  导航命名。两条规矩，改词前先读：

  1. 「产出」和「功能」必须一眼分得开——它们指向两段完全不同的内容：
     产出 = 它交给你什么成品（PPT / 表格 / 方案…），功能 = 支撑这些成品的底座
     （画布 / 知识库 / Agent / 插件）。曾经叫「能做什么」和「功能」，两个词听起来
     是同一件事，用户不知道该点哪个——导航项之间语义重叠，等于没有导航。

  2. 一个东西从头到尾只能有一个叫法。这里叫「产出」，落地那段的抬头
     （outputsSection.eyebrow）和 Hero 的次要按钮就都得叫「产出」。
     点了 A 落在 B 上，用户会以为自己点错了。
*/
export const nav: { href: string; label: Copy }[] = [
  { href: '#outputs', label: { zh: '产出', en: 'Output' } },
  { href: '#platform', label: { zh: '功能', en: 'Features' } },
  { href: '#developers', label: { zh: '开发者', en: 'Developers' } },
  { href: '#download', label: { zh: '下载', en: 'Download' } },
]

export const hero = {
  /* 139 不是拍脑袋:产品「设置 → 技能」页显示的就是「全部 (139)」。改这个数字前先开产品核对。 */
  badge: { zh: '139 项创作技能已就绪', en: '139 creation skills, ready' },
  /* 标题拆成行：入场动画一行一行起，顺带锁死断行位置（铺满版定稿的分行）。
     手动定死断行，不靠宽度限制——中文靠宽度断字会断在词中间（原型实测
     踩过「做/完 PPT」「方/案」），很难看。 */
  /* 不罗列品类（PPT/表格/方案…）——列几样都嫌局限，产品早就不止这些。
     定位宣言式：第一行说清「这是什么」，第二行说「它做什么」。
     具体能产出什么，交给标题正后方的卡片墙和「产出」区去展示。 */
  headline: {
    zh: ['桌面上的 AI 工作台，', '想法直达成品。'],
    en: ['The AI workbench on your desktop.', 'Ideas straight to finished work.'],
  },
  /** 标题里要染成品牌渐变的那一行（索引）。强调落在「产出」上，不是落在「AI」上。 */
  accentLine: 1,
  /* 「智能助手」「工作画布」是产品里两个面的真实叫法(左侧栏原文),别改成别的词。 */
  subline: {
    zh: '桌面端的 Claude。智能助手加工作画布，139 项内置创作技能和你自己的知识库——聊天，然后收文件。',
    en: 'Claude on your desktop. An assistant plus a work canvas, 139 built-in creation skills, and a knowledge base of your own. Chat, then collect the files.',
  },
  // 这个按钮也指向「产出」那一段，所以用同一个词（见 nav 的注释第 2 条）。
  secondaryCta: { zh: '看看能产出什么', en: 'See the output' },
  otherPlatforms: { zh: '其它平台', en: 'Other platforms' },
  /* 不写「开源」:仓库虽公开,但没有开源协议(License: None,README 明说私有)。
     「代码公开」是真话,「开源」不是——开源 = 公开 + 授权你用,这里只有前一半。 */
  trust: {
    zh: '基于 Claude Agent SDK · 代码公开在 GitHub',
    en: 'Built on the Claude Agent SDK · Source public on GitHub',
  },
}

/*
  Hero 背景「内容墙」（Linear intake 式的 3D 倾斜卡片墙）。
  墙上铺的是产品干活时的真实痕迹——指令、技能调用、产出文件、权限确认、
  知识库检索——全部对应产品真实功能与仓库里真实存在的技能名，不虚构。
  纯装饰层（aria-hidden），但英文版界面不能漏中文，所以照样双语。
*/
/*
  Hero 卡片墙的内容。文案是「产品干活的真实痕迹」——
  每行必有一张 ask 卡（用户说的话），它是这面墙的叙事锚点：
  先有人说一句话，然后才有那一串产出。别把 ask 卡删光，会散架。
*/
export type WallCard = {
  /** 顶行：会话号 / 产出体积 / 耗时 */
  id: Copy
  /** 主行：指令原话，或产出文件名 */
  title: Copy
  /** 底部标签：技能名 / 扩展名 */
  tag: Copy
  /** 标签用品牌绿 */
  brand?: boolean
  /** 用户指令卡（每行一张，描边和背景都不同） */
  ask?: boolean
}

export const heroWall: WallCard[][] = [
  [
    { id: { zh: 'ENG · 会话 #12', en: 'ENG · Session #12' }, title: { zh: '帮我做一份 Q3 复盘 PPT', en: 'Make me a Q3 review deck' }, tag: { zh: 'ppt-master', en: 'ppt-master' }, brand: true, ask: true },
    { id: { zh: '已完成 · 2 分 14 秒', en: 'Done · 2m 14s' }, title: { zh: 'ppt-master · 生成 24 页', en: 'ppt-master · 24 slides' }, tag: { zh: '技能', en: 'Skill' } },
    { id: { zh: '产出 · 4.2 MB', en: 'Output · 4.2 MB' }, title: { zh: 'Q3-复盘.pptx', en: 'Q3-review.pptx' }, tag: { zh: '.pptx', en: '.pptx' } },
    { id: { zh: '画布 · 3 处修改', en: 'Canvas · 3 edits' }, title: { zh: '画布已更新', en: 'Canvas updated' }, tag: { zh: 'canvas', en: 'canvas' }, brand: true },
    { id: { zh: '已完成', en: 'Done' }, title: { zh: 'd3-visualization · 图表已嵌入', en: 'd3-visualization · charts embedded' }, tag: { zh: '技能', en: 'Skill' } },
  ],
  [
    { id: { zh: '知识库 · 12 条命中', en: 'Knowledge base · 12 hits' }, title: { zh: '检索本地知识库', en: 'Searching local knowledge' }, tag: { zh: 'RAG', en: 'RAG' } },
    { id: { zh: 'ENG · 会话 #12', en: 'ENG · Session #12' }, title: { zh: '把这份表格算个季度汇总', en: 'Summarize this sheet by quarter' }, tag: { zh: 'spreadsheets', en: 'spreadsheets' }, brand: true, ask: true },
    { id: { zh: '已完成', en: 'Done' }, title: { zh: 'spreadsheets · 公式已写入', en: 'spreadsheets · formulas written' }, tag: { zh: '技能', en: 'Skill' } },
    { id: { zh: '产出 · 890 KB', en: 'Output · 890 KB' }, title: { zh: '年度预算表.xlsx', en: 'annual-budget.xlsx' }, tag: { zh: '.xlsx', en: '.xlsx' } },
    { id: { zh: '等待确认', en: 'Awaiting approval' }, title: { zh: '请求运行命令', en: 'Command request' }, tag: { zh: '权限', en: 'Permission' } },
  ],
  [
    { id: { zh: '已完成 · 出图 4 张', en: 'Done · 4 images' }, title: { zh: 'imagegen · 生成完毕', en: 'imagegen · complete' }, tag: { zh: '技能', en: 'Skill' } },
    { id: { zh: '产出 · 1.1 MB', en: 'Output · 1.1 MB' }, title: { zh: '发布海报.png', en: 'launch-poster.png' }, tag: { zh: '.png', en: '.png' } },
    { id: { zh: 'ENG · 会话 #13', en: 'ENG · Session #13' }, title: { zh: '写一版融资方案的框架', en: 'Draft a fundraising proposal outline' }, tag: { zh: 'proposal-writer', en: 'proposal-writer' }, brand: true, ask: true },
    /* 「封面→目录→正文」是产品方案写作模式的真实三步(草稿面板顶栏原文)。 */
    { id: { zh: '方案草稿 · 2/3', en: 'Draft · 2/3' }, title: { zh: '封面 → 目录 → 正文', en: 'Cover → Outline → Body' }, tag: { zh: '方案写作', en: 'Proposal mode' } },
    { id: { zh: '产出 · 36 KB', en: 'Output · 36 KB' }, title: { zh: '投标方案.docx', en: 'proposal.docx' }, tag: { zh: '.docx', en: '.docx' } },
  ],
  [
    { id: { zh: '运行中 · 3 个任务', en: 'Running · 3 tasks' }, title: { zh: '会话 #14', en: 'Session #14' }, tag: { zh: '进行中', en: 'Active' }, brand: true },
    { id: { zh: '渲染完成', en: 'Render complete' }, title: { zh: 'sora · 成片已导出', en: 'sora · export done' }, tag: { zh: '技能', en: 'Skill' } },
    { id: { zh: '产出 · 48 MB', en: 'Output · 48 MB' }, title: { zh: '产品演示.mp4', en: 'product-demo.mp4' }, tag: { zh: '.mp4', en: '.mp4' } },
    { id: { zh: 'ENG · 会话 #14', en: 'ENG · Session #14' }, title: { zh: '把这些数据做成可交互看板', en: 'Turn this data into a live dashboard' }, tag: { zh: 'd3-visualization', en: 'd3-visualization' }, brand: true, ask: true },
    { id: { zh: '产出 · 交互式', en: 'Output · interactive' }, title: { zh: '数据看板.html', en: 'dashboard.html' }, tag: { zh: '.html', en: '.html' } },
  ],
  [
    { id: { zh: '排版完成', en: 'Layout done' }, title: { zh: 'resume-modern · 已生成', en: 'resume-modern · generated' }, tag: { zh: '技能', en: 'Skill' } },
    { id: { zh: '产出 · 220 KB', en: 'Output · 220 KB' }, title: { zh: '简历-2026.pdf', en: 'resume-2026.pdf' }, tag: { zh: '.pdf', en: '.pdf' } },
    { id: { zh: '已接入 2 个系统', en: '2 systems linked' }, title: { zh: '连接器 · MCP', en: 'Connectors · MCP' }, tag: { zh: '连接器', en: 'Connector' } },
    { id: { zh: 'ENG · 会话 #15', en: 'ENG · Session #15' }, title: { zh: '给发布会写三条社交卡片', en: 'Write three social cards for launch' }, tag: { zh: 'card-twitter', en: 'card-twitter' }, brand: true, ask: true },
    { id: { zh: '已完成', en: 'Done' }, title: { zh: 'card-twitter · 卡片已生成', en: 'card-twitter · cards generated' }, tag: { zh: '技能', en: 'Skill' } },
  ],
]

/* 会话演示（Hero 下方的循环动画）。所有可见字都双语。
   窗口标题用产品里聊天面的真实叫法「智能助手」——产品不是终端软件,别把它演成命令行。 */
export const terminal = {
  windowTitle: { zh: 'Claude Desktop — 智能助手', en: 'Claude Desktop — assistant' },
  prompt: { zh: '帮我做一份 Q3 复盘 PPT', en: 'Make me a Q3 review deck' },
  logs: [
    { zh: '已调用技能 ppt-master', en: 'Invoked skill ppt-master' },
    { zh: '生成 24 页 · 套用品牌模板 · 嵌入图表', en: '24 slides · brand template · charts embedded' },
  ],
  files: [
    { icon: '📊', name: { zh: 'Q3-复盘.pptx', en: 'Q3-review.pptx' }, size: '4.2 MB' },
    { icon: '📈', name: { zh: '数据附录.xlsx', en: 'data-appendix.xlsx' }, size: '890 KB' },
    { icon: '🖼', name: { zh: '封面备选.png', en: 'cover-options.png' }, size: '1.1 MB' },
  ],
}

/** 文件传送带（滚动驱动）。A 带是产出文件，B 带是真实技能名（不翻译）。 */
export const conveyor = {
  title: { zh: '说一句，收一堆。', en: 'Say one thing. Collect a pile.' },
  /* 这句要讲产品,不讲网页效果(原来写的是"传送带跟着你的滚动走"——那是在介绍动画,不是产品)。
     现在解释两条带子各是什么:上带 = 交付的文件,下带 = 干活的技能,且都真实存在。 */
  hint: {
    zh: '上面一条是它交回来的文件，下面一条是干活的技能——每个名字都真实装在产品里。',
    en: 'The top belt is the files it hands back; the bottom, the skills doing the work — every name ships in the product.',
  },
  filesBelt: [
    { icon: '📊', ext: '.pptx', name: { zh: 'Q3-复盘.pptx', en: 'Q3-review.pptx' } },
    { icon: '📈', ext: '.xlsx', name: { zh: '年度预算表.xlsx', en: 'annual-budget.xlsx' } },
    { icon: '📄', ext: '.docx', name: { zh: '投标方案.docx', en: 'proposal.docx' } },
    { icon: '🧾', ext: '.pdf', name: { zh: '简历-2026.pdf', en: 'resume-2026.pdf' } },
    { icon: '🖼', ext: '.png', name: { zh: '发布海报.png', en: 'launch-poster.png' } },
    { icon: '🎬', ext: '.mp4', name: { zh: '产品演示.mp4', en: 'product-demo.mp4' } },
    { icon: '📉', ext: '.html', name: { zh: '数据看板.html', en: 'dashboard.html' } },
  ],
  skillsBelt: ['ppt-master', 'spreadsheets', 'proposal-writer', 'imagegen', 'sora', 'd3-visualization', 'resume-modern', 'poster-hero', 'remotion'],
}

/*
  产出区（设计稿 D）：一个 0→139 的滚动计数器 + 六张产出卡。
  诚实原则不变：每张卡的产出类型都对应仓库 skills/ 里真实存在的技能
  （ppt-master / spreadsheets / proposal-writer / imagegen / sora / d3-visualization…），
  不为了好看编能力。
*/
export const outputsSection = {
  // 和导航项同名（见 nav 的注释第 2 条）——用户点「产出」，落地就得看见「产出」。
  eyebrow: { zh: '产出', en: 'Output' },
  title: { zh: '你要的是文件，不是建议。', en: 'You wanted a file, not advice.' },
  counterLabel: { zh: '项内置创作技能，持续增长', en: 'built-in creation skills, and growing' },
}

/*
  shot = 产品真实截图(2026-07-20 CDP 实截,均为产品界面/内置模板,非合成图):
  - ppt: 画布社区「瑞士国际主义 Deck」官方模板详情的幻灯片预览
  - xlsx: 设置→技能页搜 excel 的真实结果(data-report / spreadsheets)
  - docx: 方案写作模式右侧草稿面板(封面→目录→正文;演示文案,隐私已处理)
  - png: 画布「3D Stone Staircase Evolution」官方模板的成品信息图
  - mp4: 画布「故障艺术标题帧」官方视频模板的成品帧
  - html: 画布「Dashboard」官方原型模板的成品报告页
*/
export const outputCards: { icon: string; title: Copy; body: Copy; ext: string; shot: string; shotAlt: Copy }[] = [
  {
    icon: '📊',
    title: { zh: '做 PPT / 演示', en: 'Slides & decks' },
    body: { zh: '一句话生成整套演示：套模板、配图表、写讲稿。', en: 'One prompt, a whole deck: template, charts, speaker notes.' },
    ext: '.pptx',
    shot: '/screens/outputs/ppt.webp',
    shotAlt: { zh: '画布内置幻灯片模板的成品页', en: 'A finished slide from a built-in deck template' },
  },
  {
    icon: '📈',
    title: { zh: '做表格', en: 'Spreadsheets' },
    body: { zh: '读表、算数、整理数据，直接交回一张能用的表。', en: 'Reads, computes, and organizes — hands back a usable sheet.' },
    ext: '.xlsx',
    shot: '/screens/outputs/xlsx.webp',
    shotAlt: { zh: '技能库里真实的表格技能:data-report 与 spreadsheets', en: 'Real spreadsheet skills in the library: data-report and spreadsheets' },
  },
  {
    icon: '📄',
    title: { zh: '写方案 / 文档', en: 'Proposals & docs' },
    /* 对应产品真实的「方案写作模式」:从知识库取材,封面/目录/正文逐步确认,右侧真预览,导出 Word。 */
    body: { zh: '方案写作从你的知识库取材，封面、目录、正文逐步确认，导出就是能交付的 Word。', en: 'Proposals draw on your knowledge base — cover, outline, body confirmed step by step, exported as a ready-to-send Word file.' },
    ext: '.docx',
    shot: '/screens/outputs/docx.webp',
    shotAlt: { zh: '方案写作模式:封面→目录→正文,一键导出 Word', en: 'Proposal mode: cover, outline, body — exported to Word' },
  },
  {
    icon: '🖼',
    title: { zh: '生成图片 / 海报', en: 'Images & posters' },
    body: { zh: '从提示词到成图，海报、封面、社交卡片一步到位。', en: 'Prompt to picture: posters, covers, and social cards in one step.' },
    ext: '.png',
    shot: '/screens/outputs/png.webp',
    shotAlt: { zh: '画布图片模板的成品信息图', en: 'A finished infographic from a built-in image template' },
  },
  {
    icon: '🎬',
    title: { zh: '生成视频', en: 'Video' },
    body: { zh: '从想法到成片，模板化的视频创作流程。', en: 'From idea to final cut with a templated video pipeline.' },
    ext: '.mp4',
    shot: '/screens/outputs/mp4.webp',
    shotAlt: { zh: '画布视频模板「故障艺术标题帧」成品帧', en: 'A frame from the glitch-title video template' },
  },
  {
    icon: '📉',
    title: { zh: '数据报告与图表', en: 'Data reports & charts' },
    body: { zh: '数据进去，可交互的可视化报告出来。', en: 'Data in, an interactive visual report out.' },
    ext: '.html',
    shot: '/screens/outputs/html.webp',
    shotAlt: { zh: '画布原型模板生成的数据看板页', en: 'A data dashboard page from a prototype template' },
  },
]

export const platform = {
  // 和导航项「功能」同名（一物一名，见 nav 注释第 2 条）。
  eyebrow: { zh: '功能', en: 'Features' },
  title: { zh: '撑起这些产出的四样东西。', en: 'The four things holding it all up.' },
  /* 四个块全部对着产品真实界面写:名字用产品里的原文(工作画布 / 知识库…),
     列举的子能力(原型/幻灯片/HyperFrames…、文档识别/图片识别/分类管理)都是界面上真实存在的入口。 */
  blocks: [
    {
      name: { zh: '工作画布', en: 'Work canvas' },
      body: {
        zh: '说出需求，画布直接产出原型、幻灯片、图片、视频、动效和音频，还有几百个社区模板和插件市场可以直接翻用。不用在聊天窗和设计软件之间来回倒腾。',
        en: 'Describe what you want and the canvas produces prototypes, slides, images, video, motion frames, and audio — with hundreds of community templates and a plugin marketplace to draw from. No shuttling between a chat window and a design tool.',
      },
    },
    {
      name: { zh: '知识库', en: 'Knowledge base' },
      body: {
        zh: '把你的资料喂进去——文档、图片都能识别并分类管理。它回答和写方案前先去里面查。（这套做法叫 RAG——让 AI 先查资料再开口，答案就不容易是编的。）',
        en: 'Feed it your material — documents and images get recognized and organized. It searches that before answering or drafting. (The technique is called RAG — look it up first, then speak — which is what keeps answers from being invented.)',
      },
    },
    {
      name: { zh: '聊天与 Agent', en: 'Chat & agents' },
      body: {
        zh: '不止一问一答：它能连着调用工具走完一整套多步骤的活，带会话和项目管理，每一步敏感操作都先问你，也可以切到全自动。（Agent = 能自己动手用工具的 AI，不只是回话。）',
        en: 'More than question-and-answer: it chains tool calls to finish multi-step work, with sessions and projects, asking before each sensitive step — or set it to fully automatic. (An agent is an AI that uses tools itself, not one that only replies.)',
      },
    },
    {
      name: { zh: '插件与连接器', en: 'Plugins & connectors' },
      body: {
        zh: '插件市场装新本事，外部 MCP 接你在用的系统，连接器还能把这里的项目喂给 Claude Code、Cursor 这类编码助手。能力是可以往上加的，不是出厂就封死。',
        en: 'Install new abilities from the plugin marketplace, hook up your systems over MCP, and connectors feed your projects to coding assistants like Claude Code and Cursor. The capability set grows; it is not sealed at the factory.',
      },
    },
  ],
}

/*
  真实界面区:四段录屏全部截自本机运行的产品(本地开发版),不是效果图。
  截图前做过隐私处理——侧栏会话标题临时替换成了演示文字,画面里没有真实业务数据。
  想重截:启动产品后用 CDP 连渲染进程的 9222 调试口摆拍(细节见项目记忆)。
*/
export const screens = {
  eyebrow: { zh: '真实界面', en: 'Real screens' },
  title: { zh: '不是效果图，是真实操作。', en: 'Not mockups — real interaction.' },
  note: {
    zh: '截自本机运行的开发版 · 悬停右侧场景，主窗口实时播放操作录屏',
    en: 'Captured from a local dev build · hover a scene and the main window plays the recording',
  },
  /* 第一张当主图铺全宽,其余三张一排。
     src 是封面截图(2 倍图),video 是同场景的真实操作录屏(CDP 逐帧录制合成)。
     w/h 写死真实像素,浏览器先留好位置,加载进来页面不跳(防布局抖动)。
     截图与录屏都做过隐私处理:侧栏会话标题替换成演示文字,画面里无真实业务数据。 */
  items: [
    {
      src: '/screens/chat.webp', video: '/screens/chat.mp4', w: 1920, h: 1050,
      bar: { zh: '智能助手', en: 'Assistant' },
      caption: {
        zh: '智能助手真实问答：提问后 Opus 4.8 流式作答，模型、知识库、权限模式就在输入框旁边。',
        en: 'A real assistant Q&A: ask, and Opus 4.8 streams the answer — model, knowledge base, and permission mode sit right by the composer.',
      },
    },
    {
      /* 录屏是知识库「全部文件(1000)」页搜索过滤:输入 prototype,计数从 1000 实时筛到 32。
         文案只讲画面里真实发生的事(1000 个文件 + 即时筛选 + 先查再答),不夸识别归类那两页(录屏里没展示)。 */
      src: '/screens/kb.webp', video: '/screens/kb.mp4', w: 1920, h: 1050,
      bar: { zh: '知识库', en: 'Knowledge base' },
      caption: {
        zh: '知识库：把你的资料都喂进来——这里 1000 个文件，输入关键词实时筛选；它回答和写方案前，先来这儿查。',
        en: 'The knowledge base: everything you feed it lives here — 1,000 files, filtered live as you type; it checks here before answering or drafting.',
      },
    },
    {
      src: '/screens/skills.webp', video: '/screens/skills.mp4', w: 1920, h: 1050,
      bar: { zh: '设置 · 技能', en: 'Settings · Skills' },
      caption: {
        zh: '技能库：139 项技能即搜即滤，逐个可开关，也能新建自己的。',
        en: 'The skills library: search-as-you-type across all 139 skills, individually toggleable, plus your own.',
      },
    },
    {
      src: '/screens/byok.webp', video: '/screens/byok.mp4', w: 1920, h: 1050,
      bar: { zh: '设置 · 执行模式', en: 'Settings · Execution' },
      caption: {
        zh: '执行模式：本机 CLI 或自带 API key，多家提供方随便挑。',
        en: 'Execution mode: local CLI or bring your own key, across providers.',
      },
    },
  ],
}

export const developers = {
  eyebrow: { zh: '给开发者', en: 'For developers' },
  title: { zh: '打开看，里面没有黑箱。', en: 'Open it up. No black box inside.' },
  points: [
    {
      title: { zh: '基于 Claude Agent SDK', en: 'Built on the Claude Agent SDK' },
      body: {
        zh: '安装包内置 fusion-code CLI，也可以切换到你系统里已有的 claude。',
        en: 'The installer bundles the fusion-code CLI, and you can switch it to the claude already on your system.',
      },
    },
    {
      title: { zh: '多运行时模型', en: 'Multi-runtime model' },
      body: {
        zh: '每个标签页一个独立引擎，多个会话可以各跑各的子进程，互不串味。',
        en: 'One engine per tab, so multiple sessions each run their own subprocess without leaking into each other.',
      },
    },
    {
      /* BYOK = Bring Your Own Key,自带 API 账号。提供方列表照抄产品「执行模式」页的真实选项卡。 */
      title: { zh: '多提供方 BYOK', en: 'Multi-provider BYOK' },
      body: {
        zh: '不想用本机 CLI，就自带 API key：Anthropic、OpenAI、Azure、Gemini、Ollama Cloud 都接得上。（BYOK = 用你自己的 API 账号。）',
        en: 'Skip the local CLI and bring your own key: Anthropic, OpenAI, Azure, Gemini, and Ollama Cloud all plug in. (BYOK = bring your own API account.)',
      },
    },
    {
      /* 措辞是「代码公开」不是「开源」——仓库公开但没有开源协议(见 hero.trust 的注释)。 */
      title: { zh: '代码公开可审计', en: 'Source public, auditable' },
      body: {
        zh: '完整源码公开在 GitHub 上，权限怎么把关、数据怎么走，你自己翻得到。',
        en: 'The full source is public on GitHub. How permissions gate actions and where data goes, you can read for yourself.',
      },
    },
  ],
  cta: { zh: '去 GitHub 看源码', en: 'Read the source on GitHub' },
  readme: { zh: '看 README', en: 'Read the README' },
}

export const download = {
  eyebrow: { zh: '下载', en: 'Download' },
  title: { zh: '装上，开聊。', en: 'Install it and start.' },
  loading: { zh: '正在获取最新版本…', en: 'Fetching the latest version…' },
  /* 降级文案：GitHub API 超时/限流时用户看到的。不写「出错了」——写他还能干什么。 */
  fallbackNote: {
    zh: '暂时读不到版本信息，去 Releases 页面可以直接下载最新版。',
    en: 'Version info is unavailable right now. The Releases page has the latest build.',
  },
  fallbackCta: { zh: '前往 Releases 页面', en: 'Go to Releases' },
  history: { zh: '查看历史版本', en: 'All releases' },
  released: { zh: '发布于', en: 'Released' },
  recommended: { zh: '你的系统', en: 'Your system' },
  /*
    平台的显示名和系统要求。按 PlatformKey 索引，和 github.ts 里的匹配规则一一对应。
    为什么放这儿而不是跟匹配规则写在一起：这是给人看的字，必须有中英两份。
    数据层里混进界面文字，英文版就会漏出「Apple 芯片」这种半中半英的东西（踩过）。
  */
  platforms: {
    'mac-arm': {
      name: { zh: 'macOS · Apple 芯片', en: 'macOS · Apple silicon' },
      req: { zh: 'macOS 11 或更高 · Apple 芯片', en: 'macOS 11 or later · Apple silicon' },
    },
    'mac-intel': {
      name: { zh: 'macOS · Intel', en: 'macOS · Intel' },
      req: { zh: 'macOS 11 或更高 · Intel 芯片', en: 'macOS 11 or later · Intel chip' },
    },
    win: {
      name: { zh: 'Windows', en: 'Windows' },
      req: { zh: 'Windows 10 或更高 · 64 位', en: 'Windows 10 or later · 64-bit' },
    },
    linux: {
      name: { zh: 'Linux', en: 'Linux' },
      req: { zh: 'x86_64 · AppImage', en: 'x86_64 · AppImage' },
    },
  } satisfies Record<PlatformKey, { name: Copy; req: Copy }>,
  /* 目前 Releases 只产出 mac(arm64) 与 Windows 两种安装包（对照 v0.0.16 的实际资产）。
     不摆 Intel/Linux 的空卡：给用户看点不了的按钮是骗人。
     等 electron-builder 真的产出了对应资产，getPlatformCards() 会自动把卡片多出来。 */
  missingPlatforms: {
    zh: 'Intel 芯片 Mac 与 Linux 的安装包还没有。有进展会先出现在 Releases 页面。',
    en: 'There is no build for Intel Macs or Linux yet. When there is, it shows up on the Releases page first.',
  },
}

export const footer = {
  tagline: { zh: '桌面端的 Claude，聊天即产出。', en: 'Claude on your desktop. Chat, and it ships.' },
  links: {
    github: { zh: 'GitHub 仓库', en: 'GitHub repo' },
    readme: { zh: 'README', en: 'README' },
    license: { zh: '许可说明', en: 'License' },
    issues: { zh: '反馈问题', en: 'Report an issue' },
    releases: { zh: '历史版本', en: 'Releases' },
  },
  credit: { zh: '基于 Claude Agent SDK 构建', en: 'Built on the Claude Agent SDK' },
}

export const ui = {
  downloadFor: { zh: '下载', en: 'Download for' },
  langToggle: { zh: 'Switch to English', en: '切换到中文' },
  skipToContent: { zh: '跳到主要内容', en: 'Skip to content' },
  menu: { zh: '菜单', en: 'Menu' },
}

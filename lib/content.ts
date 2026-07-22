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
  name: 'Cowork',
  /* 安装包自托管在本服务器 /downloads/（nginx 开了 autoindex，是个可浏览的文件列表）。
     不对外暴露源码仓库，所以站内不放任何指向 GitHub 的链接。 */
  releasesUrl: '/downloads/',
  /** 兜底下载地址：主按钮匹配不到对应安装包时退到这个服务器目录，用户自己挑一个下。 */
  latestReleaseUrl: '/downloads/',
} as const

/*
  导航命名。两条规矩，改词前先读：

  1. 「产出」和「功能」必须一眼分得开——它们指向两段完全不同的内容：
     产出 = 它交给你什么成品（PPT / 表格 / 方案…），功能 = 支撑这些成品的底座
     （画布 / 文件管理 / Agent / 插件）。曾经叫「能做什么」和「功能」，两个词听起来
     是同一件事，用户不知道该点哪个——导航项之间语义重叠，等于没有导航。

  2. 一个东西从头到尾只能有一个叫法。这里叫「产出」，落地那段的抬头
     （outputsSection.eyebrow）和 Hero 的次要按钮就都得叫「产出」。
     点了 A 落在 B 上，用户会以为自己点错了。
*/
export const nav: { href: string; label: Copy }[] = [
  { href: '#outputs', label: { zh: '产出', en: 'Output' } },
  { href: '#platform', label: { zh: '功能', en: 'Features' } },
  { href: '#privacy', label: { zh: '安全', en: 'Privacy' } },
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
  /* 「智能助手」「插件」是产品里两个面的真实叫法(左侧栏原文),别改成别的词。 */
  subline: {
    zh: '桌面端的 Claude。智能助手加插件，139 项内置创作技能，还有帮你管好本地文件的文件管理系统——聊天，然后收文件。',
    en: 'Claude on your desktop. An assistant plus plugins, 139 built-in creation skills, and a file manager that keeps your local files in order. Chat, then collect the files.',
  },
  // 这个按钮也指向「产出」那一段，所以用同一个词（见 nav 的注释第 2 条）。
  secondaryCta: { zh: '看看能产出什么', en: 'See the output' },
  otherPlatforms: { zh: '其它平台', en: 'Other platforms' },
}

/*
  Hero 背景「内容墙」（Linear intake 式的 3D 倾斜卡片墙）。
  墙上铺的是产品干活时的真实痕迹——指令、技能调用、产出文件、权限确认、
  文件管理——全部对应产品真实功能与仓库里真实存在的技能名，不虚构。
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
    { id: { zh: '文件管理 · 32 个文件', en: 'Files · 32 items' }, title: { zh: '归类本地文件', en: 'Organizing local files' }, tag: { zh: '文件', en: 'Files' } },
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
  windowTitle: { zh: 'Cowork — 智能助手', en: 'Cowork — assistant' },
  prompt: { zh: '帮我做一份 Q3 复盘 PPT', en: 'Make me a Q3 review deck' },
  logs: [
    { zh: '已调用技能 ppt-master', en: 'Invoked skill ppt-master' },
    { zh: '生成 24 页 · 套用品牌模板 · 嵌入图表', en: '24 slides · brand template · charts embedded' },
  ],
  files: [
    { icon: 'pptx', name: { zh: 'Q3-复盘.pptx', en: 'Q3-review.pptx' }, size: '4.2 MB' },
    { icon: 'xlsx', name: { zh: '数据附录.xlsx', en: 'data-appendix.xlsx' }, size: '890 KB' },
    { icon: 'png', name: { zh: '封面备选.png', en: 'cover-options.png' }, size: '1.1 MB' },
  ],
}

/** 文件传送带（滚动驱动）。上带 A = 功能名称，下带 B = 对应文件后缀（都取自 filesBelt）。 */
export const conveyor = {
  title: { zh: '说一句，收一堆。', en: 'Say one thing. Collect a pile.' },
  /* 这句要讲产品,不讲网页效果。上带 = 它能交出的成品(功能名称),
     下带 = 对应的文件格式(后缀),两条对着看就是「干什么 → 出什么文件」。 */
  hint: {
    zh: '上面一条是它能交出的成品，下面一条是对应的文件格式——聊完就有文件落到你手里。',
    en: 'The top belt is what it can hand back; the bottom, the matching file formats — finish the chat and the files land on your side.',
  },
  /* 每张卡两层信息(避免太空):name = 成品名(上带用)，desc = 一句能力点(上带用)，
     ext = 后缀 + sample = 文件名例子(下带用)。sample 沿用早先那批有画面感的真实文件名。 */
  filesBelt: [
    { icon: 'pptx', ext: '.pptx', name: { zh: '演示文稿', en: 'Slides' }, desc: { zh: '逐页手绘', en: 'page by page' }, sample: { zh: 'Q3-复盘', en: 'Q3-review' } },
    { icon: 'xlsx', ext: '.xlsx', name: { zh: '电子表格', en: 'Spreadsheet' }, desc: { zh: '公式自动', en: 'auto formulas' }, sample: { zh: '年度预算表', en: 'annual-budget' } },
    { icon: 'docx', ext: '.docx', name: { zh: '文档方案', en: 'Document' }, desc: { zh: '分段成稿', en: 'sectioned' }, sample: { zh: '投标方案', en: 'proposal' } },
    { icon: 'pdf', ext: '.pdf', name: { zh: 'PDF 文件', en: 'PDF' }, desc: { zh: '一键导出', en: 'one-click' }, sample: { zh: '简历-2026', en: 'resume-2026' } },
    { icon: 'png', ext: '.png', name: { zh: '图片海报', en: 'Poster' }, desc: { zh: '出图即用', en: 'ready to use' }, sample: { zh: '发布海报', en: 'launch-poster' } },
    { icon: 'mp4', ext: '.mp4', name: { zh: '演示视频', en: 'Video' }, desc: { zh: '脚本成片', en: 'scripted' }, sample: { zh: '产品演示', en: 'product-demo' } },
    { icon: 'html', ext: '.html', name: { zh: '网页看板', en: 'Dashboard' }, desc: { zh: '实时渲染', en: 'live render' }, sample: { zh: '数据看板', en: 'dashboard' } },
  ],
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
  每张卡绑定一份 claude-desktop 仓库的真实成品(2026-07-21 用户逐张评审后选定):
  - sample = public 下的成品文件;sampleKind 决定弹层用 iframe(html)还是 video。
  - shot = 该成品渲染出的缩略图(真成品画面,非过程截图);壁纸由卡片 CSS 单独铺。
  源(skills/…):ppt=ppt-keynote · xlsx=data-report(完整数据周报) · docx=resume-modern ·
  png=card-xiaohongshu(小红书干货卡轮播) · mp4=8-bit-orbit-video-template ·
  html=frame-data-chart-nyt(NYT 折线图,保持不变)。均为模板自带 example.html / default-showcase.mp4,不虚构。
  (注:「表格」位放的是完整数据周报——其内含明细数据表,是库里最接近表格的真成品;数据报告位仍用 NYT 折线图,不撞图。)
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
    icon: 'pptx',
    title: { zh: '做 PPT / 演示', en: 'Slides & decks' },
    body: { zh: '一句话生成整套演示:套模板、配图表、写讲稿。点开翻真成品。', en: 'One prompt, a whole deck — template, charts, notes. Open to browse the real file.' },
    ext: '.pptx',
    shot: '/screens/outputs/ppt.webp',
    shotAlt: { zh: 'HTML Anything 主题的 Keynote 风演示封面', en: 'A Keynote-style deck cover — “HTML Anything”' },
    sample: '/screens/outputs/samples/ppt.html',
    sampleKind: 'html',
  },
  {
    icon: 'xlsx',
    title: { zh: '做表格', en: 'Spreadsheets' },
    body: { zh: '读表、算数、整理数据,交回一张能用的表。点开翻真成品。', en: 'Reads, computes, organizes — a usable sheet. Open to browse the real file.' },
    ext: '.xlsx',
    shot: '/screens/outputs/xlsx.webp',
    shotAlt: { zh: '完整数据周报:KPI 卡 + 增长图表 + 明细数据表', en: 'A full weekly data report — KPI cards, charts, raw table' },
    sample: '/screens/outputs/samples/xlsx.html',
    sampleKind: 'html',
  },
  {
    icon: 'docx',
    title: { zh: '写方案 / 文档', en: 'Proposals & docs' },
    body: { zh: '从素材到排版好的整篇文档,导出就是能交付的 Word。点开翻真成品。', en: 'Material to a fully typeset doc, exported as ready-to-send Word. Open to browse.' },
    ext: '.docx',
    shot: '/screens/outputs/docx.webp',
    shotAlt: { zh: '排版精良的现代简历成品', en: 'A cleanly typeset modern résumé' },
    sample: '/screens/outputs/samples/docx.html',
    sampleKind: 'html',
  },
  {
    icon: 'png',
    title: { zh: '生成图片 / 海报', en: 'Images & posters' },
    body: { zh: '从提示词到成图,海报、封面、社交卡片一步到位。点开看真成品。', en: 'Prompt to picture — posters, covers, social cards. Open to see the real one.' },
    ext: '.png',
    shot: '/screens/outputs/png.webp',
    shotAlt: { zh: '小红书风格的干货卡片轮播封面', en: 'A Xiaohongshu-style tips carousel cover card' },
    sample: '/screens/outputs/samples/poster.html',
    sampleKind: 'html',
  },
  {
    icon: 'mp4',
    title: { zh: '生成视频', en: 'Video' },
    body: { zh: '从想法到成片,模板化的视频创作流程。点开直接播真成品。', en: 'Idea to final cut via a templated pipeline. Open to play the real clip.' },
    ext: '.mp4',
    shot: '/screens/outputs/mp4.webp',
    shotAlt: { zh: '8-bit 复古风演示视频的标题帧', en: 'The title frame of an 8-bit retro deck video' },
    sample: '/screens/outputs/samples/video.mp4',
    sampleKind: 'video',
  },
  {
    icon: 'html',
    title: { zh: '数据报告与图表', en: 'Data reports & charts' },
    body: { zh: '数据进去,可交互的可视化报告出来。点开翻真成品。', en: 'Data in, an interactive visual report out. Open to browse the real file.' },
    ext: '.html',
    shot: '/screens/outputs/html.webp',
    shotAlt: { zh: 'NYT 编辑风格的折线图成品', en: 'A finished NYT-style editorial line chart' },
    sample: '/screens/outputs/samples/report.html',
    sampleKind: 'html',
  },
]

export const platform = {
  // 和导航项「功能」同名（一物一名，见 nav 注释第 2 条）。
  eyebrow: { zh: '功能', en: 'Features' },
  title: { zh: '撑起这些产出的四样东西。', en: 'The four things holding it all up.' },
  /* 四个块全部对着产品真实界面写,列举的子能力(原型/幻灯片/HyperFrames…、
     文档识别/图片识别/分类管理)都是界面上真实存在的入口。
     注意:「文件管理系统」是对外选定的叫法——产品里这块原名叫「知识库」(RAG 检索),
     这里刻意换成更贴近「管本地文件」的说法,改词前先想清楚这层出入。 */
  blocks: [
    {
      name: { zh: '插件', en: 'Plugins' },
      body: {
        zh: '插件市场装新本事，几百个社区插件和模板点一下就用上——出原型、幻灯片、图片、视频这些活，能力都能往上加，不是出厂就封死。',
        en: 'Install new abilities from the plugin marketplace — hundreds of community plugins and templates, one click away, extending what it can make from prototypes and slides to images and video. The capability set grows; it is not sealed at the factory.',
      },
    },
    {
      name: { zh: '文件管理系统', en: 'File manager' },
      body: {
        zh: '把本地文件都收拢到一处管理——文档、图片自动识别并归类，找文件、按主题归拢都比在文件夹里翻省事得多。写东西、答问题时它也会先到这里翻你的资料。',
        en: 'Keep your local files in one place — documents and images are recognized and auto-sorted, so finding and grouping them by topic beats digging through folders. It also draws on your material here before answering or drafting.',
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
      name: { zh: '连接器', en: 'Connectors' },
      body: {
        zh: '外部 MCP 把你在用的系统接进来，连接器还能把这里的项目喂给 Claude Code、Cursor 这类编码助手。让它接上你真实的工作流，而不是孤零零一个窗口。',
        en: 'Hook up your systems over MCP, and connectors feed your projects to coding assistants like Claude Code and Cursor. It plugs into your real workflow instead of standing alone in one window.',
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
    zh: '取自产品真实运行的操作录屏 · 点主窗口放大观看，悬停右侧切换场景',
    en: 'Real operating footage from the product · click the main window to watch full-size, hover a scene to switch',
  },
  /* 第一张当主图铺全宽,其余三张一排。
     src 是封面截图(2 倍图),video 是同场景的真实操作录屏(CDP 定时截图逐帧合成,~15s 循环)。
     w/h 写死真实像素,浏览器先留好位置,加载进来页面不跳(防布局抖动)。
     四段都是「智能助手」真跑:发话术→真执行,画面里的命令行/面板/写文件都是产品真实产出。
     录屏做过隐私处理:侧栏会话标题替换成演示文字,话术均为无隐私的演示题目。
     文案按录到的真实行为写(反幻觉):PPT 是右侧「预览/大纲」面板、图片走本机 draw 技能出 PNG、
     代码在「全自动」下真写文件到本地——不吹产品做不到的事。 */
  items: [
    {
      /* 录屏:日常办公→「制作PPT」预设,助手跑 ppt-master 流水线(定设计规范→逐页手绘 SVG),
         右侧「预览幻灯片」工作区实时渲染出成套幻灯片(录屏驱动它确认设计后真出片)。 */
      src: '/screens/ppt.webp', video: '/screens/ppt.mp4', w: 1920, h: 1050,
      bar: { zh: '做 PPT', en: 'Make PPT' },
      caption: {
        zh: '选「制作 PPT」说清主题，它按流水线逐页手绘幻灯片，右侧「预览幻灯片」实时长出成套页面，做完可导出。',
        en: 'Pick "Make PPT", give the topic, and it draws the deck page by page — real slides render live in the preview, ready to export.',
      },
    },
    {
      /* 录屏:日常办公→「写方案」预设,进入方案写作模式,右侧「方案草稿」面板按 封面→目录→正文 分段生成,
         实时渲染成 Word 预览(与导出逐像素一致)+ 导出。主题命中文件管理系统里的资料时会取真实资料落笔。 */
      src: '/screens/doc.webp', video: '/screens/doc.mp4', w: 1920, h: 1050,
      bar: { zh: '写方案', en: 'Write proposal' },
      caption: {
        zh: '选「写方案」说清题目，进入方案写作模式：按封面 → 目录 → 正文分段生成，右侧实时渲染成 Word 预览，写完一键导出。',
        en: 'Pick "Write proposal", name the topic, and proposal mode drafts it — cover → contents → body, rendered live as a Word preview on the right, one-click export when done.',
      },
    },
    {
      /* 录屏:设计创意→输入话术,助手调本机 draw 技能(node .../draw.js),把需求写成提示词后跑出 PNG 文件卡。 */
      src: '/screens/img.webp', video: '/screens/img.mp4', w: 1920, h: 1050,
      bar: { zh: '生成图片', en: 'Generate image' },
      caption: {
        zh: '描述你要的画面，它调用本机画图技能：把需求写成提示词，直接跑出一张 PNG 存到本地。',
        en: 'Describe the image; it calls the local drawing skill — turning your ask into a prompt and rendering a PNG saved to disk.',
      },
    },
    {
      /* 录屏:代码开发→输入话术,「全自动」权限下助手直接写入 pomodoro.html,代码块实时铺开。 */
      src: '/screens/code.webp', video: '/screens/code.mp4', w: 1920, h: 1050,
      bar: { zh: '代码开发', en: 'Write code' },
      caption: {
        zh: '提个需求，它在「全自动」模式下真的动手写代码：把 HTML 文件直接写到本地，代码实时铺开，双击就能跑。',
        en: 'Give it a task and, in full-auto mode, it actually writes the code — files land on disk, code streaming in live, ready to run.',
      },
    },
  ],
}

/*
  安全与隐私段：收尾前打消「能碰我文件的工具，安全吗」这个顾虑。
  四条都对齐真实产品，措辞谨慎——
  · 文件本地：应用在本机跑，产出落在你机器上；模型推理这一步的请求由第 3 条交代（BYOK 直连提供方）。
  · 每步先问：卡片墙里真实存在的「请求运行命令 / 等待确认 / 权限」逐次授权。
  · 自带 Key：照抄「执行模式」页的真实提供方选项（Anthropic / OpenAI / Azure / Gemini / Ollama Cloud）。
  · 可审计：只讲「每步操作可见、数据流向自查」，不提源码/仓库(源码不对外)。
  icon 字段对应 Privacy.tsx 里的内联 SVG 图标名。
*/
export const privacy = {
  eyebrow: { zh: '安全与隐私', en: 'Safe & private' },
  title: { zh: '你的东西，不上云。', en: 'Your stuff stays yours.' },
  points: [
    {
      icon: 'lock',
      title: { zh: '文件留在本地', en: 'Files stay local' },
      body: {
        zh: '它做出来的文件、读到的资料，都在你自己电脑上，不往我们的服务器传。',
        en: 'The files it makes and the data it reads stay on your own machine — nothing is uploaded to our servers.',
      },
    },
    {
      icon: 'shield',
      title: { zh: '每一步都先问你', en: 'Asks before it acts' },
      body: {
        zh: '要动你的文件、跑一条命令，都会先弹出来等你点头；你不批，它就不执行。',
        en: 'Before touching a file or running a command it pops up and waits — nothing runs until you approve.',
      },
    },
    {
      /* BYOK = Bring Your Own Key,自带 API 账号。提供方列表照抄产品「执行模式」页的真实选项卡。 */
      icon: 'key',
      title: { zh: '自带 Key，直连提供方', en: 'Your key, straight to the provider' },
      body: {
        zh: '用你自己的 API key，请求直连 Anthropic、OpenAI、Azure、Gemini、Ollama Cloud，不经我们中转。（BYOK = 用你自己的 API 账号。）',
        en: 'Use your own API key and requests go straight to Anthropic, OpenAI, Azure, Gemini or Ollama Cloud — never routed through us. (BYOK = bring your own API account.)',
      },
    },
    {
      icon: 'eye',
      title: { zh: '全程可见、可审计', en: 'Visible and auditable' },
      body: {
        zh: '每一步操作都摊在你眼前，调用了什么、数据怎么走，你自己看得到。',
        en: 'Every step is shown as it happens — what gets called and where data goes, you can see it yourself.',
      },
    },
  ],
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
  /* 目前 Releases 产出 mac(arm64)、mac(x64)、Windows 三种安装包（对照 v0.0.37 的实际资产）。
     Linux 还没打包，就不摆它的空卡：给用户看点不了的按钮是骗人。
     等 electron-builder 真的产出了 Linux 资产，getPlatformCards() 会自动把卡片多出来。 */
  missingPlatforms: {
    zh: 'Linux 的安装包还没有。有进展会先出现在 Releases 页面。',
    en: 'There is no build for Linux yet. When there is, it shows up on the Releases page first.',
  },
}

export const footer = {
  tagline: { zh: '桌面端的 Claude，聊天即产出。', en: 'Claude on your desktop. Chat, and it ships.' },
  links: {
    releases: { zh: '历史版本', en: 'Releases' },
  },
}

export const ui = {
  downloadFor: { zh: '下载', en: 'Download for' },
  langToggle: { zh: 'Switch to English', en: '切换到中文' },
  skipToContent: { zh: '跳到主要内容', en: 'Skip to content' },
  menu: { zh: '菜单', en: 'Menu' },
}

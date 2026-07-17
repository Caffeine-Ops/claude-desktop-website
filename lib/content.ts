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
  licenseUrl: 'https://github.com/Caffeine-Ops/claude-desktop/blob/main/LICENSE',
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
  badge: { zh: '141+ 创作技能已就绪', en: '141+ creation skills, ready' },
  /* 标题拆成行：入场动画一行一行起，顺带锁死断行位置（设计稿 D 定稿的分行）。 */
  headline: {
    zh: ['一句话，', '让 AI 帮你做完', 'PPT、表格、方案。'],
    en: ['One prompt away', 'from finished slides,', 'sheets, and proposals.'],
  },
  /** 标题里要染成品牌渐变的那一行（索引）。强调落在「产出」上，不是落在「AI」上。 */
  accentLine: 2,
  subline: {
    zh: '桌面端的 Claude。内置 141+ 创作技能、一块可视化设计画布和你自己的知识库——聊天，然后收文件。',
    en: 'Claude on your desktop. 141+ built-in creation skills, a visual design canvas, and a knowledge base of your own. Chat, then collect the files.',
  },
  // 这个按钮也指向「产出」那一段，所以用同一个词（见 nav 的注释第 2 条）。
  secondaryCta: { zh: '看看能产出什么', en: 'See the output' },
  otherPlatforms: { zh: '其它平台', en: 'Other platforms' },
  trust: {
    zh: '基于 Claude Agent SDK · 开源可审计',
    en: 'Built on the Claude Agent SDK · Open source, auditable',
  },
}

/** 终端演示（Hero 下方的循环动画）。所有可见字都双语。 */
export const terminal = {
  windowTitle: { zh: 'claude-desktop — 会话', en: 'claude-desktop — session' },
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
  hint: {
    zh: '传送带跟着你的滚动走——滚多快，它走多快。',
    en: 'The belts follow your scroll — as fast as you go.',
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
  产出区（设计稿 D）：一个 0→141 的滚动计数器 + 六张产出卡。
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

export const outputCards: { icon: string; title: Copy; body: Copy; ext: string }[] = [
  {
    icon: '📊',
    title: { zh: '做 PPT / 演示', en: 'Slides & decks' },
    body: { zh: '一句话生成整套演示：套模板、配图表、写讲稿。', en: 'One prompt, a whole deck: template, charts, speaker notes.' },
    ext: '.pptx',
  },
  {
    icon: '📈',
    title: { zh: '做表格', en: 'Spreadsheets' },
    body: { zh: '读表、算数、整理数据，直接交回一张能用的表。', en: 'Reads, computes, and organizes — hands back a usable sheet.' },
    ext: '.xlsx',
  },
  {
    icon: '📄',
    title: { zh: '写方案 / 文档', en: 'Proposals & docs' },
    body: { zh: '结构化方案与提案，框架自动搭好，条理先于文笔。', en: 'Structured proposals with the outline built first, prose second.' },
    ext: '.docx',
  },
  {
    icon: '🖼',
    title: { zh: '生成图片 / 海报', en: 'Images & posters' },
    body: { zh: '从提示词到成图，海报、封面、社交卡片一步到位。', en: 'Prompt to picture: posters, covers, and social cards in one step.' },
    ext: '.png',
  },
  {
    icon: '🎬',
    title: { zh: '生成视频', en: 'Video' },
    body: { zh: '从想法到成片，模板化的视频创作流程。', en: 'From idea to final cut with a templated video pipeline.' },
    ext: '.mp4',
  },
  {
    icon: '📉',
    title: { zh: '数据报告与图表', en: 'Data reports & charts' },
    body: { zh: '数据进去，可交互的可视化报告出来。', en: 'Data in, an interactive visual report out.' },
    ext: '.html',
  },
]

export const platform = {
  // 和导航项「功能」同名（一物一名，见 nav 注释第 2 条）。
  eyebrow: { zh: '功能', en: 'Features' },
  title: { zh: '撑起这些产出的四样东西。', en: 'The four things holding it all up.' },
  blocks: [
    {
      name: { zh: '设计画布', en: 'Design canvas' },
      body: {
        zh: '聊出来的东西直接落在一块画布上，你在上面接着改、排、组织，最后导出。不用在聊天窗和设计软件之间来回倒腾。',
        en: 'What the chat produces lands on a canvas, where you keep editing, arranging, and organizing it before exporting. No shuttling between a chat window and a design tool.',
      },
    },
    {
      name: { zh: '知识库', en: 'Knowledge base' },
      body: {
        zh: '把你的资料喂进去，它回答前先去里面查。（这套做法叫 RAG——让 AI 先查资料再开口，答案就不容易是编的。）',
        en: 'Feed it your material and it searches that before answering. (The technique is called RAG — look it up first, then speak — which is what keeps answers from being invented.)',
      },
    },
    {
      name: { zh: '聊天与 Agent', en: 'Chat & agents' },
      body: {
        zh: '不止一问一答：它能连着调用工具走完一整套多步骤的活，还带会话和项目管理。（Agent = 能自己动手用工具的 AI，不只是回话。）',
        en: 'More than question-and-answer: it chains tool calls to finish multi-step work, with sessions and projects to keep it organized. (An agent is an AI that uses tools itself, not one that only replies.)',
      },
    },
    {
      name: { zh: '插件与连接器', en: 'Plugins & connectors' },
      body: {
        zh: '接上你已经在用的外部系统，或者装新插件给它加本事。能力是可以往上加的，不是出厂就封死。',
        en: 'Connect the outside systems you already use, or install plugins to give it new abilities. The capability set grows; it is not sealed at the factory.',
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
      title: { zh: '插件与连接器体系', en: 'Plugin & connector system' },
      body: {
        zh: '技能、插件、连接器都是可加装的，扩展点是设计出来的，不是硬改代码。',
        en: 'Skills, plugins, and connectors are all installable. The extension points are designed in, not patched on.',
      },
    },
    {
      title: { zh: '开源可审计', en: 'Open source, auditable' },
      body: {
        zh: '代码在 GitHub 上，权限怎么把关、数据怎么走，你自己翻得到。',
        en: 'The code is on GitHub. How permissions gate actions and where data goes, you can read for yourself.',
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
    license: { zh: '开源协议', en: 'License' },
    issues: { zh: '反馈问题', en: 'Report an issue' },
    releases: { zh: '历史版本', en: 'Releases' },
  },
  credit: { zh: '基于 Claude Agent SDK 构建', en: 'Built on the Claude Agent SDK' },
}

export const ui = {
  downloadFor: { zh: '下载', en: 'Download for' },
  themeToggle: { zh: '切换深浅色', en: 'Toggle theme' },
  langToggle: { zh: 'Switch to English', en: '切换到中文' },
  skipToContent: { zh: '跳到主要内容', en: 'Skip to content' },
  menu: { zh: '菜单', en: 'Menu' },
}

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

export const nav: { href: string; label: Copy }[] = [
  { href: '#outputs', label: { zh: '能做什么', en: 'What it makes' } },
  { href: '#platform', label: { zh: '功能', en: 'Features' } },
  { href: '#developers', label: { zh: '开发者', en: 'Developers' } },
  { href: '#download', label: { zh: '下载', en: 'Download' } },
]

export const hero = {
  /* 标题拆成行，是为了让入场动画能一行一行地起——顺带也锁死了断行位置，
     不会在某个宽度下断出「PPT、表 / 格」这种难看的行尾。 */
  headline: {
    zh: ['一句话，', '让 AI 帮你', '做完 PPT、表格、方案。'],
    en: ['One prompt away', 'from finished slides,', 'sheets, and proposals.'],
  },
  /** 标题里要染成品牌绿的那一行（索引）。强调落在「产出」上，不是落在「AI」上。 */
  accentLine: 2,
  subline: {
    zh: '桌面端的 Claude。内置 141+ 创作技能、一块可视化设计画布和你自己的知识库——聊天，然后收文件。',
    en: 'Claude on your desktop. 141+ built-in creation skills, a visual design canvas, and a knowledge base of your own. Chat, then collect the files.',
  },
  secondaryCta: { zh: '看看能做什么', en: 'See what it makes' },
  otherPlatforms: { zh: '其它平台', en: 'Other platforms' },
  trust: {
    zh: '基于 Claude Agent SDK 构建 · 开源可审计',
    en: 'Built on the Claude Agent SDK · Open source, auditable',
  },
  /* Hero 截图占位。等 §7 素材到位，把真实截图放进 public/ 再把这里指过去。 */
  shotCaption: {
    zh: '产品主界面：左边聊天，右边设计画布',
    en: 'The app: chat on the left, design canvas on the right',
  },
  /** 示意图里那条聊天气泡。它也是给人看的字，同样得有两份。 */
  shotPrompt: {
    zh: '帮我做一份 Q3 复盘 PPT',
    en: 'Make me a Q3 review deck',
  },
}

export const values: { title: Copy; body: Copy }[] = [
  {
    title: { zh: '会创作', en: 'It makes things' },
    body: {
      zh: '141+ 项创作技能内置在应用里。你说要什么，它交回一个能直接用的文件——不是一段让你自己去做的说明。',
      en: '141+ creation skills ship inside the app. Ask for something and it hands back a file you can use — not instructions for making one yourself.',
    },
  },
  {
    title: { zh: '会查资料', en: 'It looks things up' },
    body: {
      zh: '它能一步步调用工具、翻你自己的知识库来回答，而不是凭印象编。资料是你喂的，答案就有出处。',
      en: 'It calls tools step by step and reads your own knowledge base before answering, instead of going from memory. You supply the material; the answer has a source.',
    },
  },
  {
    title: { zh: '动手前先问你', en: 'It asks before it acts' },
    body: {
      zh: '删文件、跑命令这类会改动你电脑的操作，一律先弹出来问过你才做。你随时能看清它要动什么。',
      en: 'Anything that changes your machine — deleting a file, running a command — stops and asks you first. You always see what it is about to touch.',
    },
  },
]

/*
  产出清单（页面的签名段落）。
  为什么做成「清单」而不是图标卡片墙：这个产品的产出就是文件，文件的语言就是
  后缀名和目录列表。用产品自己的语汇讲它自己的事，比一堆圆角卡片更贴题也更难撞脸。
  skills 里全是仓库 skills/ 目录中真实存在的技能名——这一列就是「不虚构」的证据。
*/
export const outputs: { label: Copy; ext: string; skills: string[] }[] = [
  { label: { zh: '做 PPT / 演示', en: 'Slides & decks' }, ext: '.pptx', skills: ['ppt-master', 'ppt-keynote', 'pptx-generator'] },
  { label: { zh: '做表格', en: 'Spreadsheets' }, ext: '.xlsx', skills: ['spreadsheets'] },
  { label: { zh: '写方案', en: 'Proposals' }, ext: '.docx', skills: ['proposal-writer'] },
  { label: { zh: '写文档 / 简历', en: 'Docs & résumés' }, ext: '.pdf', skills: ['doc', 'docx', 'resume-modern', 'pdf'] },
  { label: { zh: '数据报告与图表', en: 'Data reports & charts' }, ext: '.html', skills: ['data-report', 'd3-visualization'] },
  { label: { zh: '生成图片 / 海报', en: 'Images & posters' }, ext: '.png', skills: ['imagegen', 'gpt-image-2', 'poster-hero'] },
  { label: { zh: '生成视频', en: 'Video' }, ext: '.mp4', skills: ['sora', 'remotion', 'video-hyperframes'] },
  { label: { zh: '社交卡片', en: 'Social cards' }, ext: '.png', skills: ['card-xiaohongshu', 'card-twitter', 'social-spotify-card'] },
]

export const outputsSection = {
  eyebrow: { zh: '能做什么', en: 'What it makes' },
  title: { zh: '你要的是文件，不是建议。', en: 'You wanted a file, not advice.' },
  body: {
    zh: '下面每一行都对应应用里真实装好的技能——括号里的名字你能在仓库里找到。说一句话，它照着做，交回成品。',
    en: 'Every row below maps to skills that really ship in the app — you can find each name in the repo. Say what you need; it does the work and hands back the result.',
  },
  colOutput: { zh: '产出', en: 'Output' },
  colFormat: { zh: '格式', en: 'Format' },
  colSkills: { zh: '背后的技能', en: 'Skills behind it' },
  footnote: { zh: '141+ 项技能，持续增长', en: '141+ skills, and growing' },
}

export const platform = {
  eyebrow: { zh: '底座', en: 'The platform' },
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

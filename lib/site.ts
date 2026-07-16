/*
  站点内容数据源（数据与展示分离）：
  所有文案、功能卡、下载链接都集中在这里。
  以后改文字、换下载地址，只动这个文件，不用碰页面代码。
  —— 注意：下面的文案是"方案定稿前的占位草稿"，等确认后再定。
*/

export const site = {
  name: 'Claude Desktop',
  tagline: '把 Claude 的 Agent 能力，装进你的桌面。',
  subline: '聊天、设计、幻灯片、写作、表格、视频 —— 一个应用，多个角色。',
  repoUrl: 'https://github.com/Caffeine-Ops/claude-desktop',
  // "永远指向最新版"的固定下载地址：发新版后官网零改动自动更新。
  releasesUrl: 'https://github.com/Caffeine-Ops/claude-desktop/releases/latest',
} as const

/** 功能区：围绕产品里的"模式切换菜单"来讲——它能替你干哪些活。 */
export type Feature = {
  key: string
  title: string
  blurb: string
  beta?: boolean
}

export const features: Feature[] = [
  { key: 'general', title: '通用', blurb: '什么都能聊、能查、能帮你办的全能助手。' },
  { key: 'design', title: '设计', blurb: '边聊边出设计稿，内置画布直接改。' },
  { key: 'slides', title: '幻灯片', blurb: '一句话生成整套 PPT。', beta: true },
  { key: 'writing', title: '写作', blurb: '长文、文案、润色，一气呵成。', beta: true },
  { key: 'proposal', title: '写方案', blurb: '结构化方案与提案，自动搭好框架。', beta: true },
  { key: 'sheets', title: '处理表格', blurb: '读表、算数、整理数据。', beta: true },
  { key: 'video', title: '制作视频', blurb: '从想法到成片的视频创作。', beta: true },
]

/** 下载区：三平台，均指向 GitHub Releases 最新版。 */
export type Platform = {
  key: string
  label: string
  icon: string
  // 目前统一指向 releases/latest；将来有直链再替换成具体安装包地址。
  href: string
  note: string
}

export const platforms: Platform[] = [
  { key: 'mac', label: 'macOS', icon: '🍎', href: site.releasesUrl, note: '.dmg' },
  { key: 'win', label: 'Windows', icon: '🪟', href: site.releasesUrl, note: '.exe' },
  { key: 'linux', label: 'Linux', icon: '🐧', href: site.releasesUrl, note: 'AppImage' },
]

'use client'

/*
  Hero 的主视觉容器。

  现在没有真实产品截图（设计文档 §7 素材清单还没交付），所以这里画的是一张
  「示意图」——刻意抽象、不描摹真实像素。为什么不做一张以假乱真的假截图：
  这是真产品的官网，拿假界面冒充真界面是骗人。抽象示意一眼能看出是插画，
  传达的是「左边聊天右边画布」这个结构，不假装是别的。

  换成真截图的做法：把图片放进 public/（深浅主题各一张），然后给这个组件
  传 src / darkSrc。传了就渲染真图，不传就还是示意图——上线前替换零改代码。
*/

import Image from 'next/image'

export function AppFrame({
  caption,
  prompt,
  src,
  darkSrc,
}: {
  caption: string
  /** 示意图里聊天气泡的那句话。由调用方按当前语言传进来。 */
  prompt: string
  src?: string
  darkSrc?: string
}) {
  return (
    <figure className="mx-auto max-w-5xl">
      {/* 窗口外壳：圆角 + 描边 + 一点投影，模仿桌面应用的窗口，让人一眼知道这是个装在电脑上的东西 */}
      <div className="overflow-hidden rounded-2xl border border-rule bg-surface shadow-[0_24px_70px_-24px_rgb(0_0_0/0.28)]">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
          <span className="size-2.5 rounded-full bg-graphite/25" />
          <span className="size-2.5 rounded-full bg-graphite/25" />
          <span className="size-2.5 rounded-full bg-graphite/25" />
          <span className="ml-3 font-mono text-[11px] text-graphite">Claude Desktop</span>
        </div>

        {src ? (
          <>
            {/* 真截图路径：深浅各一张，靠 CSS 显隐切换。
                Image 的 sizes 告诉浏览器这图在页面上大概多宽，好挑合适的分辨率下载。 */}
            <Image src={src} alt={caption} width={1600} height={1000} priority className="block w-full dark:hidden" sizes="(max-width: 1024px) 100vw, 1024px" />
            {darkSrc && (
              <Image src={darkSrc} alt={caption} width={1600} height={1000} className="hidden w-full dark:block" sizes="(max-width: 1024px) 100vw, 1024px" />
            )}
          </>
        ) : (
          <Illustration prompt={prompt} />
        )}
      </div>

      <figcaption className="mt-3 text-center font-mono text-[11px] text-graphite">{caption}</figcaption>
    </figure>
  )
}

/* 示意图：左边聊天，右边画布上落着做好的文件。整个 aria-hidden——
   它表达的信息 figcaption 已经用文字说过了，读屏软件不必再听一遍色块。 */
function Illustration({ prompt }: { prompt: string }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* 聊天面 */}
      <div className="flex flex-col gap-3 bg-paper p-5">
        <Bar w="55%" />
        <Bar w="80%" />
        <Bar w="42%" />
        <div className="mt-2 self-end rounded-xl rounded-br-sm bg-brand px-3.5 py-2.5">
          <span className="text-[11.5px] text-brand-on">{prompt}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          <Bar w="30%" />
        </div>
        <Bar w="70%" />
        <Bar w="58%" />
        <div className="mt-auto rounded-lg border border-rule px-3 py-2.5">
          <Bar w="45%" />
        </div>
      </div>

      {/* 画布面：做好的文件落在这儿 */}
      <div className="flex flex-col gap-3 bg-surface p-5">
        <div className="flex gap-2">
          <Chip>.pptx</Chip>
          <Chip>.xlsx</Chip>
          <Chip>.png</Chip>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3">
          <Slide accent />
          <Slide />
          <Slide />
          <Slide />
        </div>
      </div>
    </div>
  )
}

function Bar({ w }: { w: string }) {
  return <span className="block h-2 rounded-full bg-graphite/15" style={{ width: w }} />
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-rule bg-paper px-2 py-1 font-mono text-[10px] text-graphite">
      {children}
    </span>
  )
}

function Slide({ accent }: { accent?: boolean }) {
  return (
    <div className="flex min-h-[76px] flex-col gap-2 rounded-lg border border-rule bg-paper p-3">
      <span className={`block h-1.5 w-2/3 rounded-full ${accent ? 'bg-brand' : 'bg-graphite/25'}`} />
      <span className="block h-1.5 w-full rounded-full bg-graphite/12" />
      <span className="block h-1.5 w-5/6 rounded-full bg-graphite/12" />
    </div>
  )
}

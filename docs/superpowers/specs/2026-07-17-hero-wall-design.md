# Hero 第一屏改版：轨道装置 → 铺满式 3D 卡片墙

日期：2026-07-17
状态：已定稿（参数经浏览器原型实拉校准）
原型：`scratchpad/hero-proto.html`（一次性产物，不入库）

---

## 1. 为什么改

现在的第一屏是「左文案 + 右 `Orbit` 轨道装置 + 下 `Terminal` 终端演示」，
背景另铺了一面被压得极暗的 `HeroWall`。

两个毛病：

1. **两种纵深语言打架。** `Orbit` 是平面上的圆周运动，`HeroWall` 是 3D 透视平面。
   叠在一起，眼睛不知道该把哪个当「远处」。`HeroWall` 的注释里已经记过一次同类教训
   （四根光束因为和墙打架而退役），Orbit 是同一个问题的下一个受害者。
2. **Orbit 是抽象装饰。** 转圈的 `.pptx` / `.xlsx` 芯片说的是「有很多产出」，
   但没说「产出长什么样、怎么来的」。墙上的卡片能说。

目标：把 `linear.app/intake` 顶部那种「铺满、倾斜、有景深的真实 UI 卡片流」
做成第一屏的主视觉，`Orbit` 退役。

## 2. 定稿方案

**铺满整屏**（原型里的方案 B）。不做左右分栏，墙铺满当底，文案压在左侧。
另一个候选（墙只占右半边、原地替换 Orbit）已否决——那只是把一个装置换成另一个装置，
第一屏的骨架没变，也拿不到 Linear 那种「你正在俯视一整片工作现场」的观感。

**存在感参数由用户在原型里实拉校准：存在感 47 / 遮罩 48。**
下面所有数值都是这两档代入公式后的**固化结果**，实现时直接写死，不要再留滑杆。

## 3. 组件结构

| 文件 | 动作 |
|---|---|
| `components/Orbit.tsx` | **删除**（含 `globals.css` 里的 `orbitOuter` / `orbitInner` / `sat-outer` / `sat-inner` / `pulse-ring` / `orbit-rings`，一并清掉，别留死样式） |
| `components/HeroWall.tsx` | **重写**：从「背景装饰」升格为「第一屏主视觉」。职责不变（渲染墙），但规格全换。 |
| `components/sections/Hero.tsx` | 双栏 grid → 单栏；移出 `Terminal`；标题改手动断行 |
| `app/page.tsx` | `Terminal` 升为独立 section，插在 Hero 之后 |
| `lib/content.ts` | `heroWall` 数据结构升级（见 §5） |

边界维持现状：`HeroWall` 只管画墙，不知道 Hero 里有什么；
Hero 只管排版和文案，不知道墙怎么动。

## 4. 视觉规格（固化值）

### 4.1 舞台与墙

```
stage:  position:absolute; inset:0; perspective:1000px; perspective-origin:50% 30%;
        pointer-events:none
wall:   position:absolute; top:-34%; left:-30%; width:176%; height:176%;
        transform:rotateX(42deg) rotateZ(-8deg);
        transform-style:preserve-3d;
        display:flex; flex-direction:column; justify-content:space-between; gap:30px
```

透视 1000px + 倾角 42° 是存在感的大头（原来是 1100px / 38°，且被当背景压着）。
相机更近、卡片正面露得更多——**这两个数比任何透明度调整都关键，别随手改**。

### 4.2 五行景深（存在感 47 的固化结果）

每行一个无限漂移 + 一组固定的模糊/透明度。焦点在第 3 行（index 2）。

| 行 | duration | 方向 | opacity | blur |
|---|---|---|---|---|
| 0 | 74s | 正 | 0.30 | 4.1px |
| 1 | 92s | 反 | 0.52 | 1.6px |
| 2 | 64s | 正 | **0.85** | **0** |
| 3 | 100s | 反 | 0.60 | 1.2px |
| 4 | 82s | 正 | 0.26 | 5.2px |

- 速度差是「墙在呼吸」的来源，别统一。
- 漂移沿用现有配方：内容渲染两遍 + `translateX(0 → -50%)` 无缝衔接。
- 卡片描边：`--edge` 在 Hero 内提到 `rgba(255,255,255,0.092)`（原 0.08）。
  近处的东西边缘更锐——只提亮不提锐会显得「发白」而不是「变近」。

### 4.3 卡片

从「单行 chip」升级成**有结构的卡片**——Linear 铺的是真实 UI，不是标签。

```
card:  width:290px; padding:16px 18px; border-radius:14px;
       border:1px solid var(--edge); background:var(--panel);
       box-shadow:var(--shadow-card)
 ├ id     10.5px mono, --dim, opacity .75，右侧一个 ··· （行内 flex 两端对齐）
 ├ title  14.5px, #c3d2c9, 单行省略
 └ foot   tag（10.5px mono，圆点 + 文字，可选 brand 配色）+ 右侧 20px 渐变头像
```

`kind='ask'`（用户指令卡）额外：`border-color:--edge-brand`，
背景 `linear-gradient(145deg, rgba(74,222,128,.06), var(--panel))`，title 提到 `--ink` + 500 字重。
每行放一张 ask 卡——它是这面墙的叙事锚点：**先有人说一句话，然后才有那一串产出**。

### 4.4 核心光晕

```
core:  top:44%; left:56%; 620×620; z-index:1;
       radial-gradient(circle, rgba(74,222,128,.13), transparent 65%);
       animation: breathe 6s ease-in-out infinite   // opacity .55→1, scale 1→1.1
```

这是 `Orbit` 唯一被继承下来的东西：「所有产出都出自同一个核心」这个信息不能白丢。
现在它是墙背后透出来的一团光，不是一个转圈的装置。

### 4.5 可读性三层（顺序不能错）

层级自下而上（**必须显式写 z-index，不许靠 DOM 顺序决胜**）：
`stage(wall)` z0 → `core` z1 → `glass` z2 → `veil1`/`veil2` z2（在 glass 之后）→ 文案 z3。
`glass` 必须在两层 veil **之下**：它模糊的是墙，不是遮罩。

```
glass:  left:-4%; top:30%; width:62%; height:56%; z-index:2; pointer-events:none
        backdrop-filter: blur(15.3px) saturate(.85)
        mask-image: radial-gradient(ellipse 54% 54% at 34% 50%, #000 42%, transparent 80%)

veil1:  inset:0; opacity:0.766
        linear-gradient(180deg, var(--canvas) 0%, transparent 32%,
                        transparent 56%, rgba(7,11,9,.88) 90%, var(--canvas) 100%)

veil2:  inset:0; opacity:0.48
        radial-gradient(ellipse 46% 42% at 27% 58%,
                        var(--canvas) 30%, rgba(7,11,9,.72) 62%, transparent 84%)
```

三条纪律，都是原型实测撞出来的，别推翻：

1. **`glass` 是主力，不是装饰。** 遮罩 48 太薄，压暗压不住副标题；
   实测「写一版融资方案的框架 / proposal-writer」那张卡会直接穿过副标题。
   解法是**模糊而不是压暗**——卡片的轮廓、动感、绿光全留着，只把它的字揉糊。
   存在感和可读性因此不再互斥。
2. **`veil2` 的重心在 y58%，不在中间。** 劲儿要使在副标题+按钮那一带；
   大标题字大字粗，自己扛得住，不需要保护。
3. **`glass` 的边缘必须化开。** 一旦让人看出文字背后有块方玻璃，整个效果就塌了。

## 5. 数据结构

`lib/content.ts` 的 `heroWall` 升级（文案沿用现有的，只是重新编排成卡片结构）：

```ts
type WallCard = {
  id: I18n        // 顶行：'ENG · 会话 #12' / '产出 · 4.2 MB' / '已完成 · 2 分 14 秒'
  title: I18n     // 主行：'帮我做一份 Q3 复盘 PPT' / 'Q3-复盘.pptx'
  tag: I18n       // 底部标签：'ppt-master' / '.pptx' / '技能'
  brand?: boolean // 标签用品牌绿
  ask?: boolean   // 用户指令卡（每行一张）
}
export const heroWall: WallCard[][] = [ /* 5 行 × 5 张 */ ]
```

全部可见文字双语——沿用现有 `I18n` 约定，不开新口子。

## 6. 保留的行为（回归清单）

改版不许弄丢这些，实现后逐条验：

- **鼠标视差** ×0.012（比原 Orbit 的 0.02 轻）+ 弹簧跟随
- **滚动视差** 滚出首屏时墙上移 60px
- **hydration 门闩**：`mounted` 之后才接视差值。
  服务器渲染没有 `navigator` / `innerWidth`，首帧对不上会报不匹配（项目里已踩过两次）
- **`aria-hidden="true"` + `pointer-events:none`**：墙是背景不是内容，不进无障碍树、不吃点击
- **`prefers-reduced-motion`**：漂移、呼吸光、鼠标视差全停，墙静止但仍可见
- **标题逐字动画**：完整保留（跨行连续编号错峰）
- **下载按钮三态数据链路**（loading / 直链 / 降级到 Releases）：**一行都不许动**

## 7. 性能与降级

**风险**：`glass` 是一块大面积 `backdrop-filter`，压在一面**一直在动**的墙上。
这是本次改版唯一的性能赌注。

**验收标准**：桌面 1440 宽稳定 60fps。

**降级方案**（必须实现，不是可选项）：

| 情况 | 降级到 |
|---|---|
| 桌面掉帧 | 关掉 `glass`，`veil2` opacity 提到 ~0.85（退回压暗方案。丑一点，但字照读、墙照动） |
| 移动端 | 一律不用 `glass`（见 §8） |
| `prefers-reduced-motion` | 墙静止，`glass` 可保留（不动的墙上做模糊没有开销问题） |

原则：**有备胎的效果才敢上**。判断标准不是「会不会卡」，是「卡的时候页面还能不能用」。

## 8. 移动端（<lg）

墙保留——第一屏不能空——但减档：

- 5 行 → **3 行**（取现在的 1/2/3 行，保住焦点行）
- 卡片 290px → **200px**，字号等比缩
- **不用 `glass`**，改用加强的 `veil2`（opacity ~0.85）
- 漂移保留，`duration` ×1.3（小屏上同样速度显得更快）
- 鼠标视差自然失效（无指针），不用特殊处理

## 9. 已知欠账

**浅色主题本轮不做精细翻译**（用户明确决定）。

但不能崩。兜底：浅色下 `--wall-opacity` 降到安全档（约 0.22）、`glass` 关闭、
`core` 绿光关闭（项目既有纪律：「黑底的 glow 是光、白底的 glow 是渍」）。
结果是白天模式下墙退回成一面很淡的背景——不精致，但不刺眼、字能读、不显脏。

后续单独一轮做浅色的重新翻译（白底卡片 + 深色字 + 真实阴影），参照 `globals.css`
顶部记的浅色三原则。

## 10. 验收清单

- [ ] 深色 1440 宽：大标题、副标题、按钮、信任条**全部**可读，无卡片文字穿过
- [ ] 桌面 60fps；掉帧则降级路径生效
- [ ] `prefers-reduced-motion: reduce` 下墙完全静止
- [ ] 移动端 390 宽：无横向滚动条，墙 3 行正常
- [ ] 键盘 Tab 顺序不受墙影响；读屏软件读不到墙上的卡片
- [ ] 浅色主题：不刺眼、文字可读（不要求精致）
- [ ] 下载按钮三态与改版前完全一致
- [ ] `Terminal` 在第二屏独立成节，功能不变
- [ ] `Orbit.tsx` 及其 CSS 已彻底删除，无死代码

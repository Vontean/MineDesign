# MineDesign 设计契约

## 目标与来源

插件外壳与 BaoCut 编辑器 chrome 采用 Codex 原生外观，目标是看起来像 Codex 自带的功能。编辑器的画布、属性面板、设计系统章节和批注交互沿用 BaoCut。用户创作的画板、品牌颜色和设计系统 tokens 不随插件外观改变。

原生依据：Codex 26.1021.31345 的安装包源码（`mcp-app-host-styles`、组件 CSS）与运行中窗口的深色计算值；浅色值沿用 MCX Dashboard 26.1007 快照。Dialog、遮罩与按钮角色的配方复制自 MineCodex 共享 UI，固化在本仓库，运行时不依赖 MCX。

## Token 分层

| 层 | 文件 | 内容 |
| --- | --- | --- |
| 基础 | `assets/tokens.css` | MCP Apps 标准变量（`--color-*`、`--font-*`、`--border-radius-*`、`--shadow-*`）。Codex 通过 `hostContext.styles` 推送实际值，写在 html 内联样式上优先；文件内是本地快照，供浏览器模式和宿主缺值时使用 |
| 语义 | `assets/tokens.css` | `--mdn-*`：表面、浮层、三级文字、边缘、焦点、ghost 悬停与选中、实心、危险、遮罩、字号字重、控件尺寸、圆角、图标尺寸与线宽、投影、动效。宿主没有推送的 Codex 角色从基础层推导 |
| 组件 | `assets/app.css` | 外壳组件，只引用 `--mdn-*` |
| 编辑器适配 | `assets/editor-theme.css` | 把 CDS 变量映射到 `--mdn-*`，并把 CDS 暖灰阶按亮度换成中性灰 |

宿主的 `--color-text-secondary` 与 tertiary 同值（Codex 的 description 色），原生次级文字为主文字 65%，因此 `--mdn-text-secondary` 由主文字推导。圆角跟随宿主值，会随 Codex 的圆角缩放设置变化；本地快照按实测的 1.25 倍缩放记录（md 10px、lg 12.5px、xl 15px）。

关键快照值：深色页面 #181818、下沉层 #141414、浮层 #2d2d2d（宿主未推送该角色，取快照）、文字 #fff、边缘 8% 与 16%；浅色页面 #fff、下沉层 #f7f7f7、浮层 #fff、文字 #0d0d0d。焦点与强调 #3a83f7。字体为系统字体，UI 常规字重 430，字号 12/13/14/16/20px。

## 界面文案

界面就是最终交付给用户的产品。不在界面里出现开发说明、验证状态、实验版声明、来源或许可说明（例如“浏览器模式：发送需在 Codex 中验证”“本地实验版 · 编辑器基于 BaoCut”）；这类信息写在 README 或 DESIGN.md。界面文案只说明用户能做什么、发生了什么、出错时怎么处理。某个操作在当前环境不可用时，禁用控件并用 tooltip 说明在哪里可用。示例作品同样按真实作品写内容。

## 组件选型

| 组件 | 选择 |
| --- | --- |
| 按钮 | ghost 用于取消和工具，outline 用于次级操作，solid 用于主操作；工具栏 28px，圆角 md；弹窗操作为 36px 胶囊 |
| 作品切换 | 保留原生 select 的键盘和读屏行为，外观为 ghost 下拉触发器，宽度按内容 |
| 顶栏 | 44px，品牌、作品切换居左；侧栏收起居右，设计系统作品另有“评论”切换；不承载连接、加载或错误信息 |
| 设计稿画布工具栏 | 页面切换（pages module）独立留在左上浮动卡片；操作工具（tool modules）放在画布底部居中，缩短鼠标往返。顺序：选择、抓手、Frame、文字、便签、画笔、形状，分隔线后是评论；只有评论默认显示文字。卡片外观与顶部浮动卡片一致，距底 16px；窄画布沿用编辑器的紧凑折叠 |
| 视窗状态 | 连接、首次加载、切换、重试、空作品和错误共用视窗中央状态区。加载使用 Lucide Files，错误使用 FileWarning，配叠放纸张插图。错误提供恢复说明和重新载入按钮，技术详情默认收起；恢复后状态区消失。沿用语义 token，无入场动画；未就绪时禁用批注与发送，保留当前作品反馈 |
| 反馈侧栏 | 300px，与页面同底色，左侧 1px 边缘。批注为 Codex 侧栏行：悬停底色、圆角 lg、编号、可点击的目标、正文、悬停出现的删除。无批注时显示空状态 |
| 输入区 | Codex composer 外形：浮层底色、圆角 2xl、1px 边缘，聚焦时加深；左侧复制，右侧发送 |
| 弹窗 | opaque dialog：浮层底色、圆角 3xl、半像素边缘加投影，右上角使用 Codex 原生关闭图标；遮罩浅色 #e3e3e380、深色 #00000080，加 1px 模糊 |
| 编辑器 | 控件高 24px 改为 28px，内边距随之放宽，字号不变；菜单、Popover、Tooltip 用不透明浮层与下拉投影；选中与强调用 Codex 蓝；设计系统章节标题由衬线体改为系统字体 24px 半粗；图标见下节 |

## 图标

产品插画集中在 [assets/illustrations/](assets/illustrations/README.md) 管理。页面通过 `createIllustration(name)` 按用途引用；构图与主题样式属于插画目录，页面只负责位置、状态与文案。默认尺寸 112px，可由 `--mdn-illustration-size` 等比调整。构建将模块及样式内嵌进插件 HTML，不增加外部资源请求。

外壳与两个编辑器统一使用 Lucide（ISC，构建依赖 `lucide`，版本固定）。Codex 自身界面使用 OpenAI 私有的 SVG 图标，不能复制分发；Lucide 线条风格接近，Codex 也随包携带。例外：弹窗关闭沿用 Codex 原生路径（与 MineCodex 相同）；BaoCut 自绘的少量 SVG（对齐、边框样式等）没有 Lucide 对应，保持原样；带分层动画的字形保留 Anthropicons 字体以维持动画。

| Token | 值 | 说明 |
| --- | --- | --- |
| `--mdn-icon-size` | 16px | 外壳图标尺寸；编辑器沿用 CDS 的尺寸档 |
| `--mdn-icon-stroke` | 1.5 | 线宽，24 网格单位，随尺寸等比缩放。依据：Codex 26.1021 原生图标放大 16 倍实测，20px 图标约 1.33px、16px 约 1.0px，约为尺寸的 1/15，折合 24 网格 1.5；Lucide 默认 2 偏粗 |
| `--mdn-icon-stroke-strong` | 2 | 编辑器 bold 图标 |

编辑器的 Anthropicons 字形名到 Lucide 的对照表在 `packages/design-runtime/src/cds/components/lucide-icons.ts`；新增或调整对照只改这一处，两个编辑器共用。

## 主题与隔离

明暗跟随 Codex 宿主的 theme；浏览器模式跟随系统。界面不提供手动切换。宿主变量由外壳转发给编辑器文档，主题变化时清除上一套变量，缺失的回到快照。不得从父窗口读取计算样式、订阅 Codex 内部模块或依赖 MCX 进程。

`assets/editor-theme.css` 只作用于编辑器文档的 `.cds-root`，不得向画板 iframe 注入 MineDesign 配色，不得修改设计系统的用户 tokens。新增外壳不做入场动画，reduced-motion 时关闭过渡。

## 品牌与图标

MineDesign 缩写 MDN，npm 包 minedesign 的命令为 mdn。生产图标源为 assets/brand/minedesign-icon.svg，生成流程与几何依据见 assets/brand/README.md。保留 MCX 外圈原路径及 translate(6.24 6.24) scale(.48)，使用同一原生 Lucide 资源中的 brush 实心轮廓。默认状态为环 + 实心画笔，选中状态为实心外形 + 透明画笔孔。

内联与 mask 使用 currentColor，独立浅色/深色资源分别采用 MCX 的 #0d0d0d / #fafafa。图标不能通过白色画笔模拟镂空。MCP 标准主题 icons 与插件自定义状态资源分开：提供选中资源不等于宿主已自动使用它。

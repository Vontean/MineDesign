# runtime 目标模块划分与迁移顺序

记录日期：2026-11-15，2026-11-16 更新迁移状态，2026-11-23 更新 Ticket #38 职责拆分结果。依据 `node scripts/runtime-deps.mjs <包名>` 生成的依赖地图（输出在 `output/runtime-deps/`，不入库，可随时重新生成）。决策背景见 [规格](specs/runtime-modularization.md)。本文在各迁移批次完成后更新；注册表移除后并入 [ARCHITECTURE.md](../ARCHITECTURE.md)。

## 迁移状态

| 包 | 状态 | 验证 |
| --- | --- | --- |
| design-runtime | 注册表已移除，迁移时 610 个文件全部改为 import；注册表的类型定义已删除 | 迁移时 17 个基线场景与迁移前零差异。现行基线为 24 个场景（含设计系统），Ticket #38 各轮均零差异 |
| design-system-runtime | 注册表已移除，迁移时 218 个文件全部改为 import；注册表遗留的类型桥 `reviewed-runtime-types.ts` 已删除（其 9,000 余行成员表无人读取，仅 3 个类型引用已改为指向真实实现） | 迁移时 6 个基线场景与迁移前零差异；现行基线见上 |

迁移由 `scripts/runtime-to-imports.mjs` 完成，分两步：先把声明提到模块作用域并把读取改为 import，再删除注册表绑定（`--contract`）。被其他文件写入的名称（设计稿 12 个、设计系统 6 个）改为提供方导出的 `set_名称` 函数；取值随界面语言变化的绑定改为 `get_名称()` 访问函数。每个文件仍保留 `installXxx()`，它返回原来的初始化函数，入口按原顺序调用，所以初始化时机没有变化。

反向依赖（下层 import 上层）的现有数量记录在 `tests/runtime-layers.test.mjs`，只能减少。下文"还原代码的结构"与"设计稿 runtime 的数据"描述的是迁移前的状态，保留作为理解迁移方式的参考。

## 还原代码的结构

两个 runtime 的形态相同，来自打包器的延迟模块初始化：

- 每个文件导出一个安装函数。它把本文件的函数和变量绑定到共享注册表，再返回一个初始化函数。
- 初始化函数通常把真正的模块顶层代码包在一次性初始化回调里。回调开头调用它依赖的其他文件的初始化，这等同于原来的 import 语句。
- 所以改为 import 是有确定规则的逆变换：回调体回到模块顶层，对其他初始化的调用变成 import，注册表读取变成具名导入。

## 设计稿 runtime 的数据

| 项目 | 数值 | 含义 |
| --- | --- | --- |
| 带安装函数的文件 | 610 | 迁移的工作单位 |
| 绑定 | 8033 | 其中 4266 个没有其他文件读取，迁移后不需要导出 |
| 函数与类 | 3554 | 可直接导出 |
| 纯值 | 3479 | 可直接提到模块顶层 |
| 派生值 | 820 | 初始化时读取其他绑定，迁移后依赖 import 顺序 |
| 可变值 | 180 | 运行时被重新赋值，需要改成访问函数或保留为可变导出 |
| 被其他文件直接写入的名称 | 12 | 需要逐个改为显式的写入函数 |
| 初始化阶段的循环 | 1 组，15 个文件 | 全部在基础控件的菜单与弹层部分 |
| 全部读取的循环 | 18 组，最大 17 个文件 | 调用阶段的循环对 import 无害 |
| 不可达文件 | 1 个 | `design-system/install-identifiers.ts` |

## 目标分层

依赖只允许从上层指向下层。括号内是当前违反该方向的文件级边数，迁移时消除。

| 层 | 模块 | 说明 |
| --- | --- | --- |
| 6 | application | 启动与组合根 |
| 5 | canvas | 画布编排；读取下面所有层 |
| 4 | comments、export、find、properties、collaboration、fast-edit | 画布上的各项能力（comments → canvas 6，export → canvas 2，find → canvas 3） |
| 3 | editor/* | 选择、属性、剪贴板、排版、撤销等编辑能力（editor → canvas 22） |
| 2 | platform、design-system、preview、geometry | 文件与宿主访问、设计系统安装、画板预览（platform → canvas 2、→ editor 5） |
| 1 | cds | 基础控件；只依赖第 0 层 |
| 0 | 根目录的 helpers 与第三方依赖 | 迁移后由直接 import 取代 |

现有目录与真实依赖基本一致，不需要大规模移动文件。依赖地图列出 38 个"最强关联不在本目录"的文件，在对应批次里逐个判断是否移动。

领域抽离阶段的目标模块（对应规格中的领域清单）：

| 目标模块 | 现在分散在 |
| --- | --- |
| 选择与元素几何（画布扩展 seam） | editor/selection、editor/geometry、geometry、canvas 中的选择框、测距叠层与命中测试 |
| 评论与批注锚点 | comments、canvas 主函数中的评论接线 |
| 预览与播放 | preview、runtime、canvas 中的预览挂载、聚焦与播放 |
| Tweaks 与组件属性 | canvas 中的 Tweaks、editor/components、properties |
| 撤销历史 | editor/undo、canvas 中的页面与画板历史 |
| 导出 | export |

## 迁移批次

| 批次 | 范围 | 文件数（约） | 注意 |
| --- | --- | --- | --- |
| 试点 | geometry、find | 10 | 没有初始化循环，绑定少，覆盖函数、纯值、派生值三种情况 |
| 一 | cds、platform、design-system、preview、根目录 | 170 | 先解开 cds 的 15 文件初始化循环 |
| 二 | editor/* | 270 | 处理 editor 内的 7 组两文件循环 |
| 三 | canvas、comments、export、properties、application 及其余 | 160 | 最后处理跨层的 6 文件循环（application、canvas、editor） |

## 关于清理

迁移后确认只有一个文件没有任何模块引用（设计系统安装标识的常量），已删除。被功能开关关闭的模块仍然可达：fast-edit 由启动入口读取，collaboration 由画布与评论的 8 个文件读取。它们不是不可达代码，不能直接删除。清理需要先在读取方移除引用，并用行为基线确认无差异。

## 设计系统 runtime 的数据

218 个带安装函数的文件，4746 个绑定（3085 个没有其他文件读取）。初始化循环 1 组（ui 的 foundation、interactions、overlays）。全部读取的循环最大 44 个文件，跨 editor、files、ui。不可达文件 1 个（`ui/collaborator-tints.ts`）。

分层：ui → model、documents、host、platform、media → editor → files（组合根在 files）。files → editor 有 108 条边，editor → ui 有 102 条边，方向一致；需要消除的反向边是 ui → files 4 条。

## 领域抽离的做法

注册表移除后，按领域把还原代码改写成有类型、有测试的模块。每个模块按同一流程进行：

1. 选定一个领域的纯计算部分（解析、几何、编码），它的输入输出可以脱离界面运行。
2. 保留旧文件的副本，写出新实现：导出类型描述 interface，局部变量改为有意义的名称，初始化函数里的常量提到模块顶层。
3. 写一个临时测试，用随机输入（有效值占多数，夹杂无效值）比较新旧实现的输出，要求逐字相同。通过后删除旧副本和临时测试。
4. 留下少量说明行为的永久测试。
5. `npx tsc -p tsconfig.json --noEmit` 在改写的非 JSX 文件上零错误；全项目错误数不增加。
6. 构建后全部基线场景零差异。

已完成：

| 模块 | interface | 说明 |
| --- | --- | --- |
| 画板选择框数据（`canvas/frame-payloads.ts`） | `SelectionChrome`、`ChromeRing`、`ChromeMeasure`、`ChromeGuide`、`ChromePen`、`parseSelectionChromePayload` | 画布扩展 seam。画板内的选择脚本计算元素位置，以画板像素坐标发给画布；选择框、测距、参考线、钢笔路径的叠层只依赖这些类型。新增叠层功能（例如评论卡片）沿用同一通道：选择脚本提供位置，叠层在画板坐标里渲染 |
| 评论的几何与锚点（`comments/area-geometry.ts`、`object-geometry.ts`、`anchor-codec.tsx`、`labels.ts`） | `CommentRect`、`CommentArea`、`DesignCommentAnchor` 及各锚点类型、`CommentLabelAnchor` | 区域与对象的归一化坐标、锚点字符串的编码与解析、给人看的位置描述。评论的界面控制（`canvas-controller.tsx`）保留宿主绑定、悬停与框选、键盘焦点等共享状态；锚点解析、落点计算、元素矩形测量与模式快捷键见下方模块表 |
| 画布评论卡片的排布（`comments/card-layout.ts`） | `CardTarget`、`CardSize`、`CardBounds`、`CardLayoutOptions`、`CardPlacement`、`layoutCommentCards` | 新写的纯函数模块，不是改写：给定目标点屏幕坐标、卡片尺寸与可用区域，算出卡片位置与引线端点，保证互不重叠、不盖住目标点、结果确定。卡片组件 `comment-cards.tsx` 只渲染它的结果 |
| 预览文档的构建材料（`preview/html-scanner.ts`、`css-rewriting.ts`、`asset-rewriting.ts`、`dependency-graph.ts`、`module-cache.ts`、`blob-paths.ts`、`project-root.ts`）与画板聚焦、预览导航（`canvas/focus.ts`、`canvas/preview-navigation.ts`） | 各文件导出的扫描结果、路径与依赖图类型 | HTML 标签扫描、CSS 与资源路径改写、组件依赖图、模块缓存。预览文档的组装与执行（`build-document.ts`、`evaluation.ts`、`dependency-injection.ts`、`runtime-loading.ts`）和画布导航（`canvas/navigation.ts`）尚未改写 |
| 组件属性与 Tweaks 的数据（`editor/components/props.ts`、`prop-validation.ts`、`inferred-metadata.ts`、`imports.ts`、`text-edits.ts`、`detach.ts`） | `PropMetadata`、`PropMetadataMap`、`PropOption`、`ComponentImport`、`ComponentTextOption`、`DetachResult` 等 | data-props 的解析与校验、默认值与编辑结果的规整、组件导入的解析、可编辑文字的收集、实例分离的判断。Tweaks 面板的界面（`canvas/artboard-tweaks.tsx`）与预览传值（`use-dc-props.ts`）尚未改写 |
| 撤销历史（`editor/undo/history.ts`、`editor/undo/elements.ts`、`canvas/manifest-history.ts`） | `UndoEntry`、`UndoHistoryState`、`CanvasManifest`、`CanvasHistoryStep`（25 种步骤） | 元素与属性编辑的撤销栈、画板与页面等清单级操作的撤销与重做。改写时用随机操作序列同时驱动新旧实现，逐步比较返回值与状态 |
| 导出的纯计算（`export/paper-and-scale.ts`、`stored-zip.ts`、`warnings.ts`、`outcomes.ts`，`export/pdf/` 下的 `winansi.ts`、`text-encoding.ts`、`jpeg.ts`、`outline.ts`、`link-annotations.ts`、`figure-operators.ts`） | `PrintableArtboard`、`ExportReport`、`JpegInfo`、`PdfOutline`、`PdfLinkAnnotations` 等 | 纸张与缩放、zip 打包、导出结果与警告、PDF 的文字编码、书签、链接与图形操作符。页面捕获、PDF 文档组装与独立 HTML 的生成尚未改写 |
| 设计系统的 token、文档与合并（`design-system-runtime` 的 `model/tokens.ts`、`model/record-codec.ts`、`editor/markdown-parser.ts`、`editor/markdown-autoformat.ts`、`editor/color-contrast-pairs.ts`、`editor/css-length-input.ts`、`editor/files-merge.ts`、`files/token-merge.ts`、`files/data-uri.ts`） | 沿用 `contracts/` 中已有的类型 | token 的解析、序列化与 CSS 生成、说明文档的 Markdown 解析与自动格式、对比度配对推断、文件与 token 的三方合并。这个包原本已有类型，改写的是机器变量名与初始化方式，并补上测试 |

## 巨型组件的处理

界面组件不能像纯计算那样用随机输入对比，所以用机械变换加基线场景。

- `scripts/hoist-closures.mjs` 把巨型函数里 60 行以上的内部函数提到模块作用域。原位置留下转发函数，传入按需取值的依赖对象；提出去的函数每次用到外层变量时才读取，时机与原闭包相同。
- `scripts/split-functions.mjs` 把提出来的函数按领域移到子目录的独立文件，并补齐两边的 import。
- 函数名、说明与领域由阅读源码后给出，记录在各函数的注释里。

| 组件 | R4 变换前 | R4 变换后 | R4 提出的函数 |
| --- | --- | --- | --- |
| 画布主组件 `DesignCanvas`（`canvas/design-canvas.tsx`） | 一个约 22300 行的函数 | 主组件约 8400 行；`canvas/design-canvas/` 下 17 个领域文件 | 75 个：拖动 9、画板 10、选择 9、画布图形 8、剪贴板 8、导出 7、撤销重做 4 等 |
| 编辑会话 `DesignEditorSession`（`editor/session.tsx`） | 一个约 10300 行的函数 | 文件约 5600 行；`editor/session/` 下新增 9 个领域文件 | 31 个：排列与编组 7、画板内手势 6、插入 5、属性 4、剪贴板 3 等。另有 2 个依赖 50 个以上外层变量的函数没有提出 |
| 画布交互层 `CanvasInteractionLayer`（`canvas/interaction-layer.tsx`） | 一个约 7800 行的函数 | 文件约 4700 行；`canvas/interaction-layer/` 下 9 个领域文件 | 21 个：拖动 4、渲染 4、按下 3、缩放 3 等。1 个依赖 164 个外层变量的函数（主要是界面）没有提出；1 个给文件级变量赋值的函数留在原文件 |

提出去的函数第一个参数列出它依赖的外层变量。R4 时这些变量和函数内部仍是机器名，此后已按 Ticket #38 全部改为业务名。

Ticket #38（2026-11-23）把入口里的完整职责继续收进领域模块，入口只保留状态声明、跨职责编排与界面：

| 入口 | 当前规模 | 子目录模块 |
| --- | --- | --- |
| `canvas/design-canvas.tsx` | 约 4300 行 | `canvas/design-canvas/` 下 56 个，共享值经 `shared.ts`、`messages.ts`，子模块不反向导入入口 |
| `editor/session.tsx` | 约 4600 行 | `editor/session/` 下 26 个，含消息路由、键盘、收尾、选区持有与写入动作 |
| `canvas/interaction-layer.tsx` | 约 3400 行 | `canvas/interaction-layer/` 下 18 个，含拖动、槽位派生与槽位事件 |
| `platform/files-design-document.ts` | 约 2200 行 | 冲突处理在 `platform/board-clash.ts` |
| 设计系统 `files/design-system-document.ts` | 约 1500 行 | 热重载恢复、文件冲突、撤销栈、生成文件所有权、再生成与 README 各自成模块 |
| 设计系统 `files/ui/design-system-app.tsx` | 约 2700 行 | token 对话框与编辑、导入队列、欢迎面板、释放存储各自成模块 |

两个运行时的编号机器名与 `_N` 数字后缀名已清理，只被赋值、无人读取的死绑定已删除（`Math.SQRT1_2` 是标准常量）。设计稿运行时仍大量使用 `Dynamic` 类型，类型化是独立的后续工作。

已知的后续整理点（阅读时发现，尚未处理）：

- 图片放置与视频放置两个函数高度相似，可以合并。
- ~~两个键盘入口职责有重叠~~：画布按键与 iframe 转发按键已统一在 `editor/session/keyboard.tsx`。
- 编辑会话里“改单个属性”与“批量改属性”是两条高度重复的路径；文字编辑提交的函数同时处理普通文字、组件属性与脚本字符串三种写回。
- 交互层的按下处理函数在一个函数里处理批注、画板工具、形状放置、线条与箭头、自由绘制、框选和清空选中，可以按工具拆开。
- 设计系统编辑器的界面组件仍有大文件。

## 画布、画板与 iframe 内编辑器

| 运行位置 | 模块 | 职责 |
| --- | --- | --- |
| 画布编辑器 | `canvas/page-operations.ts` | 分配新页面的 ID 和名称，生成更新后的清单与撤销步骤。 |
| 画布编辑器 | `canvas/design-canvas/page-menu.ts`、`page-navigation.ts` | 管理页面菜单的焦点和 Escape 关闭入口。切页、跨页聚焦、旧选区清除和落点选择由导航模块协调。新页就绪后放置首张画板并按需调整镜头。 |
| 画布编辑器 | `canvas/design-canvas/pages.tsx` | 渲染页面菜单，处理创建、重命名和删除页面，确认删除范围并恢复菜单焦点。 |
| 画布编辑器 | `canvas/empty-notice.tsx` | 根据页面内容和编辑状态显示空画布提示及创建状态播报。 |
| 画布编辑器 | `canvas/design-canvas/viewport.tsx` | 管理镜头初始化、工具栏可用区域和输入中断，计算适应页面与居中缩放，并在首屏内容到达时定位。 |
| 画布编辑器 | `canvas/design-canvas/playback.ts` | 管理画布内播放和全屏播放，回到画布时恢复相机、选择与焦点。 |
| 画布编辑器 | `canvas/design-canvas/preview.tsx` | 处理全屏按键及预览 iframe 的消息，验证消息来源并切换画板。 |
| 画布编辑器 | `canvas/design-canvas/view-toolbar.tsx` | 汇总缩放、撤销状态、播放列表和显示开关，向宿主顶栏发布状态并处理操作。浏览器内工具栏复用同一组控制。 |
| 画布编辑器 | `canvas/interaction-layer/gestures.ts` | 记录画布手势的开始和结束，在拖动期间屏蔽画板 iframe 的输入，并管理窗口指针监听。 |
| 画布交互 | `canvas/interaction-layer/drag.tsx` | 拥有画板与画布对象的拖动更新：阈值判定、吸附、跨画板落点检测、Alt 复制与悬停键序号。 |
| 画布编辑器 | `canvas/design-canvas/drag-ghost.ts` | 按拖动开始时的选区生成跟随指针的预览，组装项目资源并忽略失效的异步结果。 |
| 画布编辑器 | `canvas/design-canvas/drag-hover.ts` | 管理拖动悬停目标、排队发布落点预览并打开目标画板。 |
| 画布编辑器 | `canvas/design-canvas/drag-session.ts`、`pending-pictures.ts` | 拥有画布拖动会话：跟随预览、悬停落点、跨画板投放、等待落点历史与取消清理；宿主手势状态由入口传入。待放置图片按当前页面过滤占位。 |
| 画布编辑器 | `canvas/design-canvas/manifest.ts` | 保持本地画布清单与远端文件同步，在远端变化时合并清单历史，保存前补齐并发写入的元数据。 |
| 画布编辑器 | `canvas/design-canvas/messages.ts`、`shared.ts` | 画布子模块共用的叶子模块：按界面语言安装的文案，以及空集合、截图并发闸门、选区比较与剪贴板读取。子模块与编辑会话只从这里取共享值，不反向导入画布入口（`tests/runtime-layers.test.mjs` 断言）。 |
| 画布编辑器 | `canvas/design-canvas/paste-boards.ts` | 写入粘贴的画板和说明，清理失败写入，安排位置并更新选区和历史。 |
| 画布编辑器 | `canvas/design-canvas/document-activity.ts`、`context-reporting.ts` | 处理编辑占用、文件变化与上传提示，发布当前作品上下文和视口尺寸。 |
| 画布编辑器 | `canvas/design-canvas/outline-keyboard.ts` | 协调图层列表的键盘导航、画布选区和画板 iframe。 |
| 画布交互 | `canvas/interaction-layer/canvas-events.tsx` | 按工具与输入状态分发空白画布指针事件。画板拖绘、形状放置与自由绘制各自管理手势生命周期。 |
| 画布交互 | `canvas/interaction-layer/image-crop.ts` | 管理画布图片裁剪的会话、坐标转换、提交与取消。 |
| 画布交互 | `canvas/element-move-sessions.ts` | 管理元素拖动会话、目标预览、提交、取消和监听清理。 |
| 画布 | `canvas/file-uploads.ts` | 写入上传的图片、视频和设计文件，处理版本冲突与提示去重。 |
| 宿主桥接 | `platform/frame-host-validation.ts` | 维护宿主操作、导出格式、目标与时限校验，供宿主桥和导出注册复用。 |
| 设计稿文档 | `platform/design-stash-offer.ts` | 管理崩溃暂存的恢复提示、远端变化复核、用户答复与丢弃。文档继续负责内容合并和轮询。 |
| 设计稿文档 | `platform/board-clash.ts` | 拥有同名画板冲突：识别本地与远端的同名或删除冲突，暂扣远端文件直至焦点离开，处理采用对方、保留我的与另存副本，以及被覆盖保存的放回提示。 |
| 实时文档 | `platform/live-document-effective.ts`、`live-document-save-state.ts`、`live-document-write-order.ts` | 本地视角文档（待写补丁叠加、缓存与字节数、补丁合并与重基）；保存状态推导、去重通知与延后刷新；写入的到期标记与下一条选择。连接、重连、远端合并与写入确认共用大量标志，留在 `live-document.ts`。 |
| 画布评论 | `comments/anchor-resolution.ts`、`thread-placement.ts`、`element-rects.ts`、`mode-shortcuts.ts` | 把评论锚点解析为画布坐标，计算线程落点、卡片目标、区域描边与定位目标；每秒重测元素与页面矩形；评论模式的进出快捷键与点击外部退出。 |
| 编辑 Worker | `worker/css-declarations.ts`、`preview-form.ts`、`preview-svg.ts` | 画板沙箱 Worker 中的纯计算：内联样式声明的解析、合并与序列化；流式预览语句的形态解析与字符串字面量；未闭合 SVG data URL 的补全。求值、文件 SDK 与消息协议入口留在 `worker/runtime.ts`。 |
| 画布交互 | `canvas/interaction-layer/preview-lifecycle.ts`、`linked-artboards.ts` | 按视口和编辑状态挑选挂载的预览，管理延迟刷新和清理，合并作品及组件更新。 |
| 画布交互 | `canvas/interaction-layer/title-hover.ts`、`title-press.ts` | 跟踪画板标题与预览之间的悬停，按指针、选区和修饰键决定选择、聚焦或拖动。 |
| 画布交互 | `canvas/interaction-layer/hover-curtain.ts` | 处理选中画板的悬停遮罩、坐标刷新、修饰键订阅和清理。 |
| 画布交互 | `canvas/interaction-layer/artboard-slot.ts` | 由画板与画布状态推导单个画板槽位的聚焦、选中、遮罩形态、标题、预览存活与通知内容，纯计算。 |
| 画布交互 | `canvas/interaction-layer/artboard-slot-events.ts` | 处理单个画板槽位的指针事件：悬停进出、标题双击重命名与提交、尺寸手柄拖动与吸附、封面遮罩的选择、拖动、复制与双击。 |
| 画布编辑器 | `canvas/design-canvas/playback-toolbar.tsx` | 渲染播放菜单、全屏标题、画板尺寸和导出控制。 |
| 画布编辑器 | `canvas/design-canvas/frameless-sizing.ts` | 接收无框画板的实测内容尺寸，集中管理空白状态、延迟调整、限频和布局写回。 |
| 画布编辑器 | `canvas/design-canvas/commands.ts`、`keyboard.tsx` | 转发画板内的编辑命令，按组合选区、剪贴板与历史状态路由。画布按键监听在键盘模块注册。 |
| 画布编辑器 | `canvas/design-canvas/artboard-focus.ts` | 等待离开编辑后切换画板，返回先前画板，清除随焦点失效的画布选区并取消跨页的旧焦点请求。 |
| 画布编辑器 | `canvas/design-canvas/frame-selection.ts` | 管理画布与画板 iframe 的选区同步、回执和聚焦后的选区恢复。 |
| 画布编辑器 | `canvas/design-canvas/selection.tsx` | 执行画布选区命令，协调切页和选择变化的播报，作品变化后移除已经不存在的画板及批注。 |
| 画布编辑器 | `canvas/design-canvas/artboard-settings.ts` | 组装单画板属性，协调背景的即时反馈、节流写回和读取回执，维护尺寸、打印、纸张、圆角、参考线与层叠顺序等清单变更和撤销记录。 |
| 画布编辑器 | `canvas/design-canvas/inspector-panel.tsx` | 管理属性面板开关、快捷键和焦点恢复，协调宿主评论与属性面板，以及画板设置和 Tweaks 的入口。 |
| 画布编辑器 | `canvas/design-canvas/selection-inspector.ts` | 汇总选区和作品的字体、颜色与样式，读取预览中的计算值，同步属性面板与当前元素会话。 |
| 编辑会话 | `editor/session/text-edit.tsx`、`link-edit.ts`、`property-edits.ts` | 提交文字、链接及单项或批量属性修改，按写入目标更新模型、历史与界面。 |
| 编辑会话 | `editor/session/selection-inspection.ts` | 读取选区的属性、字体和对比度，丢弃过期的异步结果。 |
| 编辑会话 | `editor/session/arrange.tsx`、`model-events.tsx` | 以具名接口处理编组、解组、实例分离、自动布局和翻转，以及 DOM 同步与模型替换后的选区恢复。 |
| 编辑会话 | `editor/session/move-gesture.ts`、`gestures.tsx`、`insert.tsx` | 元素移动的预览和提交独立维护；其他手势、素材和元素插入经具名接口连接会话状态与历史。 |
| 编辑会话 | `editor/model/load-entry.ts`、`editor/session/text-edit-outside-pointer.ts` | 加载模型、处理并发读取和历史恢复，在文字编辑时管理外部指针监听。 |
| 编辑会话 | `editor/session/selection-image-export.ts`、`inspector-focus.ts` | 管理选区图片导出的预览、请求和并发限制，并在检查器、图层与画布之间维护焦点。 |
| 编辑会话 | `editor/session/picker-messages.ts` | 校验画板 iframe 消息来源与只读状态，分发文字编辑、链接、右键菜单、粘贴、选区与移动缩放旋转等消息。会话以具名分组的惰性 getter 提供状态与动作。 |
| 编辑会话 | `editor/session/settlement.ts` | 结束打开的文字编辑，合并重复的收尾请求并保存，向宿主登记会话收尾与退出保护。 |
| 编辑会话 | `editor/session/keyboard.tsx`、`outline-actions.ts` | 分发画布按键与画板 iframe 转发的按键：工具、层级选择、微调、翻转、删除、Escape 分级与命令组合键，同步拖动修饰键。大纲树的悬停高亮、隐藏、重命名与移动。 |
| 编辑会话 | `editor/session/selection-state.ts`、`selection-retarget.ts` | 持有会话选区的引用、序号与画布外点击/按键的选区同步监听；模型替换后的选区重定向为纯函数。选区 ref 的写入经 `createSelectionWriters` 的具名动作（序号推进、清空、记录清除序号、请求 picker 同步、待定选区）完成；`pendingHighlightSequenceRef` 属画布高亮，仍由入口持有，经 `notePendingHighlight` 写入。 |
| 设计系统编辑器 | `editor/new-token-validation.ts`、`typography-preview.ts` | 校验新增 token 的名称和字段，计算字体长度及预览样式。 |
| 设计系统编辑器 | `files/carry-storage.ts`、`files/ui/google-font-stylesheets.ts` | 管理超出内联限制的编辑暂存、恢复和回收，并同步字体样式表。 |
| 设计系统编辑器 | `files/hot-carry-snapshot.ts` | 收集未保存的文件与索引变化，暂存超长内容并按条件交接保存队列。 |
| 设计系统编辑器 | `files/hot-carry-restore.ts` | 热重载后一次性恢复携带的未保存编辑，处理三方合并、冲突标记和丢失提示，远端落地后补发晚到的删除说明。 |
| 设计系统编辑器 | `files/file-clash.ts` | 拥有同名文件冲突：标记与提示、按 mine/theirs/ask 策略分流、token 文件三方合并、同时发布后找回本地改动，以及用他们的、用我的与另存副本的用户选择。 |
| 设计系统编辑器 | `files/document-undo.ts` | 拥有设计系统的撤销栈：创建、应用与修剪撤销命令，记录外部索引变化与发布中的索引基线，被他人改过的 token 文件撤销时三方合并。 |
| 设计系统编辑器 | `files/generated-ownership.ts`、`regeneration.ts`、`generated-readme.ts` | 生成文件的所有权探测与外来文件提示、重试计时；派生文件的再生成、防抖与限流重试；缺失 README 的生成、Consuming 尾部维护与发布冲突后的重试。文档保存回调通过它们暴露的钩子接入。 |
| 设计系统编辑器 | `files/ui/asset-intake-queue.ts` | 将连续导入的字体与素材合并为一次串行保存，保留已有的手动编辑，导入后跳转到对应章节并释放自动保存暂停。 |
| 设计系统编辑器 | `files/ui/token-dialog.ts`、`storage-reclaim.ts` | 管理新增颜色、尺度、字体样式与阴影 token 的对话框、默认值、命名与提交定位；释放存储时先保存再确认，删除孤立素材并清空撤销历史。 |
| 设计系统编辑器 | `files/ui/welcome-upload.ts` | 管理欢迎面板的上传：面板开合、导入记录与结果播报、移除文件和由导入文件创建设计系统。导入队列经它提供的记录与播报动作回报结果。 |
| 设计系统编辑器 | `files/ui/token-editing.ts` | 把界面上颜色、尺度、阴影、字体样式与组件说明的修改、重命名和删除适配为文档命令，处理整组删除确认与撤销播报。 |
| 画布编辑器 | `canvas/design-canvas/inspector-actions.ts` | 将属性改动和拖动手势转发给选中的画板，提供文字、链接、裁剪与素材替换入口。 |
| 画布编辑器 | `canvas/design-canvas/inspector-media.ts` | 处理属性面板的图片与视频替换，校验文件和目标并上传素材。 |
| 画布编辑器 | `canvas/design-canvas/annotation-commands.ts` | 创建、复制与删除画布注释和形状，处理页面归属、选择与撤销记录。 |
| 画布编辑器 | `canvas/design-canvas/manifest-history-session.ts`、`history.tsx` | 维护作品级撤销栈，核对画板的编辑深度，合并连续操作，并应用页面、画板和批注的清单变更。 |
| 画布编辑器 | `canvas/design-canvas/session-history.ts` | 协调属性面板和画板的撤销与重做，承接画板历史的推入、撤回、应用与挤出事务。保存离开画板时的编辑历史，跨页撤销时载入对应画板，合并过期历史提醒。 |
| 画布编辑器 | `canvas/design-canvas/save.ts` | 登记待保存会话，协调保存与自动重试，处理退出时的写回和下次打开作品的视图。 |
| 画布编辑器 | `canvas/design-canvas/external-paste.ts` 及同名前缀模块 | 外部剪贴板粘贴统一管理并发、退出取消和等待清理。分别处理说明与图片、画板信任确认、资源传输、文件和清单写入、历史及结果提示。 |
| 画布编辑器 | `canvas/design-canvas/place-navigation.ts` | 接收作品位置链接，切换页面、画板或播放视图，并向宿主报告当前位置。 |
| 画布编辑器 | `canvas/design-canvas/context-menus.ts` | 生成画布、画板和批注的右键操作，管理打开条件、菜单状态及图层入口。 |
| 画布编辑器 | `canvas/error-notices.tsx`、`error-reporting.tsx` | 汇总当前页面的画板问题，协调提示、恢复与错误上报。 |
| 画布编辑器 | `canvas/design-canvas/layer-index.ts` | 管理图层树缓存和展开状态，按当前页面、选区及文件变更安排刷新。 |
| 画布编辑器 | `canvas/design-canvas/find.tsx` | 管理搜索结果定位、搜索中的画板挂载，以及查找栏与画板的键盘事件路由。 |
| 画布编辑器 | `canvas/design-canvas/export-commands.ts` | 管理导出选板、等待画板就绪、图片与 PDF 命令，以及宿主交付结果。 |
| 画布编辑器 | `canvas/design-canvas/export-html.ts` | 刷新画板编辑，读取 HTML 与字体，组装导出结果，处理导出失败和交付反馈。 |
| 画板容器 | `canvas/artboard-preview-lifecycle.ts` | 管理 iframe 代次、编译调度和外部文件刷新。根据编辑占用和项目变化选择原地更新或重建预览。 |
| 画板容器 | `canvas/artboard-edit-session.ts` | 接入画板编辑模型与撤销会话，采用外部更新时迁移选区，报告写入冲突和失败。 |
| 画板容器 | `canvas/preview-compilation.ts` | 读取预览文件，按资源来源组装文档、复用编译缓存并返回依赖清单。 |
| 画板容器 | `canvas/preview-connection.ts`、`preview/generation-gate.ts`、`canvas/preview-recovery.ts` | 处理 iframe 加载握手、运行时探测和就绪通知。按预览代次接收结果，忽略已退役预览的探测回执。运行时或发布资源加载失败时，按原策略重建预览或报告错误。 |
| 画板容器 | `canvas/frame-messages.ts`、`frame-gesture-events.ts` | 集中校验 iframe 来源，处理选择序号、文字格式、画板内容尺寸，路由预览、裁切及手势事件。 |
| 画板容器 | `canvas/preview-boot-messages.ts`、`preview-hot-updates.ts` | 每代预览登记启动并同步待应用的编辑。接收实时组件更新，重写资源引用，合并新增依赖和延迟刷新样式。 |
| 画板容器 | `canvas/artboard-picker-move.ts`、`artboard-element-moves.ts` | 驱动预览拖放，校验起拖与落点。文档侧在编辑会话中执行移动、跨画板插入与源元素移除，并保留失败时的恢复和移动后的样式核对。 |
| 画板容器 | `canvas/artboard-history.ts`、`artboard-model-serialization.ts` | 将画布撤销与重做转发给画板编辑会话，写回组件属性、脚本或模板。序列化提交检查编辑来源是否过期，并区分结构变更与同结构变更。 |
| 画板容器 | `canvas/artboard-tweak-session.ts`、`artboard-content-readers.ts` | 同步组件属性、默认值和撤销信息，查询选区描述、字体、颜色与画板内容。 |
| 画板容器 | `canvas/artboard-style-commands.ts` | 排队写入样式，按手势合并撤销，维护字体引用、箭头外观以及裁切的延迟写回。 |
| 画板容器 | `canvas/artboard-selection-commands.ts`、`artboard-selection-clipboard.ts` | 执行选区导航、删除、复制副本、微移、重排与翻转。跨画板复制时按原组件属性与实时预览值生成可移植的 HTML。 |
| 画板容器 | `canvas/artboard-picker-selection.ts` | 管理点选和框选的预览查询、模板与标签核对，并向 iframe 同步选区和文字操作。 |
| 画板容器 | `canvas/artboard-insertion.ts`、`artboard-media-commands.ts` | 解析 HTML 与测量后的插入落点，处理图片和视频替换及旧裁切样式清理。 |
| 画板容器 | `canvas/artboard-crop.ts`、`artboard-pointer-gestures.ts` | 管理裁切目标与临时样式。裁切边框和变形控制点共享指针占用，分别处理拖动预览、提交和取消。 |
| 画板 iframe | `scripts/editor-picker/` | 剪贴板与 SVG 文字各自管理焦点、计时或选区。布局插入、对齐参考线、缩放计算、画布滚动条、SVG 线条和自由绘制按职责组织。 |
| 画板 iframe | `scripts/editor-picker/element-query.ts` | 按组件作用域查询模板实例，解析嵌套组件与 SVG 命中，识别画板根节点和背景。 |
| 画板 iframe | `scripts/editor-picker/comment-anchors.ts` | 创建和找回批注锚点，使用元素路径、模板编号和文字指纹定位页面、元素与框选区域。 |
| 画板 iframe | `scripts/editor-picker/element-bounds.ts` | 计算可见内容、文字和选区边界，作为批注定位和选区命中的几何基础。 |
| 画板 iframe | `scripts/editor-picker/element-inspection.ts`、`text-ground.ts` | 读取计算样式、继承值、字体和盒模型。基于透明图层与遮挡判断生成文字对比度所需的颜色。 |
| 画板 iframe | `scripts/editor-picker/preview-document.ts` | 为实时 DOM 标记模板编号、序列化作品结构，并对照预期模板报告父子关系或顺序差异。 |
| 画板 iframe | `scripts/editor-picker/selection-hit.ts` | 根据指针命中和当前选区确定选择层级，识别文字目标并区分画板背景与外部元素。 |
| 画板 iframe | `scripts/editor-picker/keyboard.ts`、`keyboard-shortcuts.ts`、`text-edit-keys.ts` | 按优先级分派画板按键，处理手势取消、宿主快捷键和文字编辑。 |
| 画板 iframe | `scripts/editor-picker/text-edit-session.ts`、`text-edit-view.ts` | 管理普通文字、SVG 和导入组件的编辑会话，附加或释放 DOM 编辑器，报告状态与提交结果。 |
| 画板 iframe | `scripts/editor-picker/text-formatting.ts` | 执行富文本格式命令，保存链接选区并处理新增、修改、移除和取消。 |
| 画板 iframe | `scripts/editor-picker/edit-double-click.ts`、`text-hit.ts` | 判断双击是否应深入选区、编辑文字或裁剪，处理 SVG 命中和无法编辑时的提示。 |
| 画板 iframe | `scripts/editor-picker/text-edit-targets.ts`、`text-edit-copy.ts` | 解析属性与脚本文字的目标，在重绘或写回时保留原节点和滚动位置。 |
| 画板 iframe | `scripts/editor-picker/text-edit-dom.ts` | 读取文字命中的插入点和可见范围，管理编辑选区与临时无障碍属性。 |
| 画板 iframe | `scripts/editor-picker/directive-selection.ts` | 解析条件和循环指令对应的元素，判断重复项并在渲染状态变化时通知画布。 |
| 画板 iframe | `scripts/editor-picker/pointer-presence.ts` | 报告鼠标进入、离开和坐标，合并连续坐标更新。 |
| 画板 iframe | `scripts/editor-picker/selection-press.ts`、`selection-click.ts` | 根据命中、修饰键和当前选区协调按下与点击，处理框选、拖拽准备、增减选区和进入文本选区。 |
| 画板 iframe | `scripts/editor-picker/context-menu.ts` | 处理右键、键盘菜单和延后打开的菜单，确定菜单打开时的选区。 |
| 画板 iframe | `scripts/editor-picker/text-placement-input.ts` | 放置文字后拦截上一手势残留的鼠标事件，防止切入错误目标。 |
| 画板 iframe | `scripts/editor-picker/preview-clicks.ts` | 路由预览点击，保留原生控件行为，并在编辑与文字映射就绪后接续双击。 |
| 画板 iframe | `scripts/editor-picker/lifecycle.ts` | 协调编辑、预览和平移缩放及仅显示选区的模式切换，管理监听、观察器和清理顺序。 |
| 画板 iframe | `scripts/editor-picker/preview-pan-zoom.ts` | 保存预览视角，计算缩放落点、内容边界和适应宽度，通过滚动条改变视角。 |
| 画板 iframe | `scripts/editor-picker/viewport-wheel.ts`、`wheel-targets.ts` | 判断滚动由作品、画板或宿主处理，保留播放内容自身的滚动、动画和交互。 |
| 画板 iframe | `scripts/editor-picker/viewport-gestures.ts` | 管理触控平移、双指缩放、鼠标平移、原生滚动策略及监听器清理。 |
| 画板 iframe | `scripts/editor-picker/selection-queries.ts`、`selection-candidates.ts` | 为点选、框选和协作选区读取可选元素与边界。框选与画板内交互共用候选规则。 |
| 画板 iframe | `scripts/editor-picker/marquee-selection.ts` | 管理框选启动、命中、候选刷新、提交和取消，画板编辑入口接收选区更新。 |
| 画板 iframe | `scripts/editor-picker/selection-transform-chrome.ts` | 计算单元素与编组选区的变形控制框、旋转限制和可裁剪状态。 |
| 画板 iframe | `scripts/editor-picker/selection-chrome.ts` | 绘制用的选区边界、距离线、悬停和加载状态在这里汇总。只在上报数据变化时通知宿主。 |
| 画板 iframe | `scripts/editor-picker/style-preview.ts`、`editor-backdrop.ts` | 管理临时样式、重绘后的手势预览与作品背景。临时样式随编辑或取消恢复，作品背景随样式表更新。 |
| 画板 iframe | `scripts/editor-picker/element-transform.ts` | 管理单元素和编组的缩放、旋转、样式预览与提交。变形取消时撤销临时样式，选区的旋转历史由同一模块维护。 |
| 画板 iframe | `scripts/editor-picker/authored-layout.ts` | 读取作品的尺寸和定位规则，让缩放及拖拽保留原有布局约束。 |
| 画板 iframe | `scripts/editor-picker/absolute-drag-snapping.ts` | 计算绝对定位元素拖拽时的对齐位移与参考线，兼顾原生滚动视口。 |
| 画板 iframe | `scripts/editor-picker/element-transform-geometry.ts`、`viewport-scale.ts` | 读取布局尺寸、CSS 变换和缩放，计算控制点方向与变形位移。 |
| 画板 iframe | `scripts/editor-picker/freehand-editing.ts` | 识别可编辑的自由笔路径，管理控制点预览、还原与提交。 |
| 画板 iframe | `scripts/editor-picker/frameless-content-hull.ts` | 观察无框作品的内容尺寸，合并测量并报告有效边界或空状态。 |
| 画板 iframe | `scripts/editor-picker/editable-svg-line.ts` | 判断 SVG 直线能否编辑，读取线端、箭头和样式，并计算包含箭头的选区边界。 |
| 画板 iframe | `scripts/editor-picker/stroke-endpoint-gesture.ts`、`svg-line-preview.ts` | 管理线条两端的预览与提交。单条线和编组共用 SVG 快照，按宿主写回或取消的结果释放、恢复预览。 |
| 画板 iframe | `scripts/editor-picker/host-drag-session.ts`、`cross-board-drop.ts` | 协调跨画板拖拽的会话、占位块及有效落点。处理宿主提交、用户点击取消、超时和目标容器写回。 |
| 画板 iframe | `scripts/editor-picker/media-drop.ts` | 管理文件拖入、落点提示和待插入素材。预览切回编辑后，按当前元素映射提交待插入的文件。 |
| 画板 iframe | `scripts/editor-picker/media-drop-target.ts`、`deck-target.ts` | 根据布局解析素材落点。处理幻灯片、缩略图和隐藏幻灯片的坐标转换与重新定位。 |
| 画板 iframe | `scripts/editor-picker/drawing-placement.ts`、`drawing-gestures.ts` | 解析图形落点与父容器，绘制形状和自由笔预览，将有效手势坐标换算后提交。 |
| 画板 iframe | `scripts/editor-picker/inserted-text.ts` | 等新文字元素与模板映射就绪后进入编辑，回放等待期间的按键。 |
| 画板 iframe | `scripts/editor-picker/pending-insert-overlay.ts` | 管理提交后保留的绘制预览，等元素出现或超时后移除。 |
| 画板 iframe | `scripts/editor-picker/flow-drop-preview.ts` | 计算普通流、flex 和 grid 布局中的插入位置，绘制并清除插入提示。 |
| 画板 iframe | `scripts/editor-picker/drop-container.ts`、`drop-nesting.ts` | 根据指针位置、布局和 HTML 嵌套规则选择拖放容器，供画板内拖拽和跨画板落点共用。 |
| 画板 iframe | `scripts/editor-picker/host-drag-commands.ts` | 处理画布发来的跨画板拖拽命令，包括开始、交接、返回、取消与提交。 |
| 画板 iframe | `scripts/editor-picker/source-drag-preview.ts` | 找回重绘后的拖拽元素和编组，恢复样式、更新落点预览并管理元素标记。 |
| 画板 iframe | `scripts/editor-picker/drag-proxy.ts` | 捕获拖拽预览，在捕获成本过高时使用轮廓，并管理单选和多选预览的位置。 |
| 画板 iframe | `scripts/editor-picker/source-drag-start.ts` | 校验拖动对象能否起拖，记录原布局，收集编组成员并建立拖拽预览。 |
| 画板 iframe | `scripts/editor-picker/source-drag-motion.ts`、`source-drag-release.ts` | 根据指针更新源画板的拖拽预览，处理离开、暂挂、返回、结束与取消。 |

`scripts/editor-picker.ts` 继续作为注入入口，构建把其依赖打入同一份脚本。画布和画板继续调用现有的 picker 接口。画布组合页面导航、选择与聚焦，并调度导出格式。画板容器编排编辑会话，并将 iframe 消息和实时预览更新交给各自模块。iframe 注入入口仍管理选区状态和工具切换。元素查询、命中后的选择规则、拖拽各阶段、变形及端点编辑由相应模块负责。

## 可读化（R5）

R0–R4 让依赖可见、拆开了巨型函数，但代码内部仍是机器名与被擦除的类型。R5 的目标是两个 runtime 的全部局部名字都有意义，类型在把握充分的地方补齐。

做法：

- 改名只用 `scripts/rename-bindings.mjs`：按作用域改名，导出名与导入名保持不变，冲突时拒绝。
- 纯改名用 `scripts/check-equivalence.mjs` 检查 α 等价：去掉类型、统一局部名后比较编译结果。结构调整与跨文件接口改名由负责人统一构建，并按涉及的流程对照浏览器基线。
- 待改名的绑定由 `scripts/readability-batches.mjs` 分成批次（output/readability-batches.json），每批约 800 个绑定，交给执行者按 [readability-batch.md](readability-batch.md) 完成。
- 进度用 `node scripts/readability.mjs` 查看。

阶段：

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 机械简化 | 去掉打包器留下的 `(0, f)(…)` 写法，共 11957 处 | 完成 |
| 局部改名 | 32308 个机器名的局部绑定，45 批 | 两个运行时的原脚本编号统计已归零 |
| 跨文件改名 | 导出的机器名（`PlatformFileContentConstant_17` 一类）与依赖对象的属性名（`deps.value153`），需要同时改提供方与全部使用方 | 已同步内部调用，清除确认无消费者的编号别名。本地化参数和内部消息键一起改名，保留渲染文案、作品格式与宿主协议 |
| 误导性名字 | 核对统计脚本未覆盖的变量，例如将实际用于矩阵的 `innerHTML` 变量改为矩阵名称 | 已整理 picker 选区、变换矩阵和指针状态的部分绑定，其他职责继续按源码核对 |
| 初始化方式 | 核对 `installXxx()` 的依赖与副作用，能在模块加载时确定的值可直接声明 | 缩略图属性和拖动参数改为常量，移除对应的初始化及编辑会话空安装函数。命名空间缓存、动态 require、提交队列与窗口监听继续遵循运行时安装顺序 |

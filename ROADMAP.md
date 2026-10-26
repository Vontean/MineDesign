# MineDesign Roadmap

记录日期：2026-10-26。状态：规划草案，尚未排期。

本文记录产品方向，并核对当前工作区里可复用的模块。M1–M5 对应提出需求的顺序，不代表实施优先级。后续讨论可继续修改本文；现有产品用途和架构分别以 [CONTEXT.md](CONTEXT.md)、[ARCHITECTURE.md](ARCHITECTURE.md) 为准。

## 目标与核对口径

让设计师在同一项目中完成参考调研、设计、组件复用、动效调节、设备演示，以及向 Figma 交接可编辑状态稿。

- **已有基础**：当前源码或文件协议中存在相关能力，仍需判断是否满足新目标。
- **待建设**：尚未找到完整的产品入口、持久文件契约或闭环流程。
- **建议**：本文提出的实现边界或先后顺序，不代表已确认的工程决定。

核对基于本地工作区（HEAD：`70d09e6`，包含其他 Thread 的未提交改动），不是发布版本清单。此次只做源码与文档核对，没有运行编辑器或进行 Codex 宿主验收；“已有基础”不等于功能已验证可用。本轮仅新增本文，不修改另一个 Thread 的代码。

## Milestone 总览

| Milestone | 设计师要完成的事 | 当前已有基础 | 主要缺口 |
| --- | --- | --- | --- |
| M1 · Prototype | 按作品类型和目标设备演示设计与交互 | 多画板、尺寸、交互预览、聚焦与前后画板导航、静态及 HTML 导出 | 作品类型与设备契约、设备外观、安全区、完整演示流程 |
| M2 · Motion | 调节 AI 生成动效的曲线、毫秒和目标图层 | Tweaks、组件参数、DCLogic、motion token 解析 | 统一动效契约、图层和状态绑定、独立模块页、播放与保存闭环 |
| M3 · Figma 联动 | 将画板中的不同状态送到 Figma，继续自由调整 | 多画板和可执行状态；从设计工具整理设计系统的方法文档 | 状态清单、可编辑 Frame 转换、来源映射和更新策略 |
| M4 · 组件库管理 | 单独查看、试用、维护并复用项目组件 | 设计系统 Components、预览、参数推断、指南和 bundle | 独立组件库文件与入口、与设计系统的关系、Agent workflow |
| M5 · Reference | 保存 Mobbin 调研与项目参考图片，并交给 Agent 使用 | 本地素材导入、设计系统 Assets 与文档 | 项目参考文件、来源与研究结论、调研接入和生成引用链 |

目前独立编辑器只有 **Design** 与 **Design system**。项目菜单与文件标签已经存在，但 `project.json` 的读取和 MCP 打开接口仍只接受这两类。新增独立文件需要接通文件识别、校验、打开、保存和对应视图；仅往项目索引填入新类型不会让它出现。

## M1 · Prototype：按类型与设备展示

### 产品目标

像 Figma 的演示模式一样，在合适的设备或展示容器中查看作品、操作关键流程。先把“真机展示”落实为**带设备外观、正确视口和可交互内容的演示**；若还需要手机直接打开、投屏或原生 App 运行，应单独定义后续范围。

| 作品类型 | 需要记录的支持目标 | 演示重点 |
| --- | --- | --- |
| Web | 网页；支持可调视口 | 响应式布局、滚动、页面或状态切换 |
| App | 先支持 iOS；iPhone duo、iPhone 18、iPad | 设备外观、内容视口、安全区、横竖屏与触控操作 |
| Desktop App | MacBook、Windows | 分开记录平台与窗口/设备尺寸，展示桌面应用窗口及关键交互 |
| Slide | PPT 类演示文稿 | 页序、前后翻页、适配屏幕与全屏演示 |
| Post | Canva 类海报、电商布局 | 画布尺寸、比例、长图与静态输出 |

“iPhone duo”暂保留用户原名，具体型号或是否指双设备并排展示待确认；iPhone 18、iPad、MacBook 和 Windows 预设也应在实现时核对型号、尺寸及资源来源，不先编造数值。Slide 的演示能力与可编辑 `.pptx` 导出分别验收，不能用 PDF 或翻页预览代替后者。

### 已有基础与缺口

- `canvas.json` 已有画板尺寸、顺序、页面、圆角、`is_interactive` 和 focused 启动视图，可以承载多种比例的内容。
- `canvas/preview-navigation.ts`、`canvas/artboard-focus.tsx` 提供画板导航和预览/编辑模式相关基础；交互仍由作品内容实现。
- `export/` 已有 PNG、PDF、HTML/ZIP 路径。这些能力不等于设备展示、原生 App 运行或 PPTX 导出。
- 架构明确保留的 `slidesHost`、`__deck/*` 是兼容名称，不能据此认定已有 Slide 产品模块。
- 待补：作品类型、设备预设、设备框与内容视口分离、安全区、演示起点与重置规则，以及跨画板流程关系。

### 完成标准

- [ ] 项目能记录作品类型；一个项目有多种目标时，允许作品或画板覆盖默认值。
- [ ] 设备选择改变演示容器和视口，不把设备外框写进作品内容。
- [ ] iOS、Web、Desktop、Slide、Post 各有一个真实示例；iOS 覆盖确认后的设备预设。
- [ ] 可以开始、操作、重置并退出演示；退出后设计稿与编辑位置正确保留。
- [ ] 保存并重新打开后，类型、设备和演示起点保持一致；明确哪些操作只是浏览器模拟。

## M2 · Motion：统一动效契约与独立模块页

### 产品目标

AI 写动效时声明可调参数，设计师像调节 Properties 一样调节动效，无需直接修改代码；独立 Motion 页用于集中查看和试用这些动效。

### 现有 Tweaks 能做到什么

用户提到的 “treak” 对应当前 **Tweaks**。`data-props` 支持数值、范围、枚举、布尔、颜色等编辑器，以及默认值、范围、步长、单位和分组。`use-dc-props.ts` 将参数传给预览，并包含写回作品的流程。

因此，只要作品逻辑实际读取这些参数，Tweaks **可以作为第一版动效参数面板**：例如 `durationMs`、`delayMs`、`easing` 枚举、播放开关。它不会自动发现任意 CSS/JS 动画，也不会自动把所有图层变成可选择目标。曲线预设可用枚举表达；可视化贝塞尔编辑器、时间轴和图层选择器需要额外能力。

另一个已有基础是 motion token：设计系统的 `model/tokens.ts` 和 `design-system-files/src/tokens-check.ts` 已包含时长、曲线值的归一化，并将 `motion` 作为扩展 token family 处理。但当前技能及格式文档仍写着排除 motion，存在文档与实现差异。这里仅记录，留待实现该 milestone 时统一规则。

### 建议的契约边界

将两类内容分开：设计系统中的 motion token 保存通用时长和曲线；作品中的动效定义保存“哪个对象、哪个触发条件、从什么状态变到什么状态”。动效参数只保存一份，Tweaks 和独立 Motion 页读写同一来源。

第一版契约至少包含：稳定动效 ID、目标图层/元素 ID、触发条件、起止状态或属性、时长、延迟、曲线、循环与方向，以及默认值、可调范围、单位和减少动态效果的替代行为。字段名及文件结构在实施时确定。

### 完成标准

- [ ] Agent 按同一契约生成动效；未声明的动画不能被误认为可调。
- [ ] 在面板改变毫秒或曲线后，预览使用新值；支持重播、恢复默认并保存。
- [ ] Motion 独立模块页能定位目标图层、查看关联状态和调节参数。
- [ ] 保存、关闭、重新打开后参数一致，AI 继续修改时保留用户设置。
- [ ] 图层删除、绑定失效或参数越界时有清楚提示，不静默改到其他对象。
- [ ] 统一 motion 的源码、检查器与技能说明；验证减少动态效果的行为。

建议先用 Tweaks 验证“声明 → 调参 → 播放 → 保存 → 再打开”的最小闭环，再增加专用控件；独立 Motion 页仍是本 milestone 的最终目标。

## M3 · Figma 联动：把画板状态拆成可编辑 Frame

### 产品目标

将一个 artboard 的明确状态拆开，在 Figma 中生成多个 Frame，设计师可以继续调整文字、布局、颜色和层级。例如登录画板拆成默认、输入中、校验失败、提交中与成功状态。

### 已有基础与缺口

- 多画板、DCLogic 和组件参数可表达不同内容与状态，但不构成可自动枚举的状态清单。
- `skills/design-system/references/from-design-tool.md` 已描述从设计工具读取来源、提取规范与重建组件的方法，方向是“设计工具 → MineDesign 设计系统”。
- 当前没有查到“MineDesign artboard → 状态枚举 → Figma 可编辑 Frame”的完整模块或工具。外部 Figma 连接器可作为实施时评估的能力，不能算 MineDesign 已内置该功能。

### 建议的首版范围

先做用户选择状态的一次性单向输出。每个状态有稳定 ID、名称、参数或测试数据，以及确定的捕获时点；不能只截取当前偶然显示的画面。保留作品、画板、状态与目标 Figma 节点的映射。

优先转换为可编辑的文字、布局和图层；无法转换的 Canvas、WebGL、复杂效果等，明确列出降级范围。整张截图放进 Frame 只能算视觉备份，不能作为本 milestone 的可编辑交接验收。

### 完成标准

- [ ] 一个画板的至少三个已声明状态能分别生成有名称的 Figma Frame。
- [ ] 常规文字、布局与层级可在 Figma 中继续编辑，效果通过实际截图对照。
- [ ] 输出记录来源映射及不能还原的内容；状态稿不被宣称保留可执行业务逻辑。
- [ ] 重复输出采用明确的新增或更新规则，保留设计师在 Figma 的修改。

持续双向同步、冲突合并与 Figma 修改回写 MineDesign 可作为后续阶段，不与首版单向交接混在一起。

## M4 · 组件库管理：独立文件、可浏览与可复用

### 产品目标

组件库像设计系统一样，是项目里的独立文件入口。设计师能按组件、变体和状态查看示例、调节参数并了解使用方法；Agent 能按同一份契约生成、调用和维护组件。

### 已有基础与缺口

现有 Design system 已有 Components 章节，约定 `components/<Comp>/README.md`、`preview.html`、`bundle.js`、`bundle.css`、`index.d.ts` 和依赖资源。`editor/components.tsx` 与 `model/component-inference.ts` 提供组件浏览、预览和参数推断相关基础；设计稿也有组件属性与导入能力。

因此，这项工作有较多基础，重点是**独立的作品身份和使用流程**。当前 Components 属于设计系统，还没有独立组件库类型与编辑器入口；也不能将源码内部的 CDS 控件库直接当成设计师的项目组件库。

### 建议的职责

设计系统负责视觉规则和 tokens，组件库负责可复用组件及其用法，设计稿负责实例和页面。建议复用现有 Components 展示和预览能力，再补文件引用关系，避免复制一套编辑器。独立组件库文件应能关联设计系统，记录适用平台与依赖版本；是否单独建技能，在流程明确后决定。

### 完成标准

- [ ] 组件库作为项目文件独立打开，可浏览分组、变体、状态、参数和使用说明。
- [ ] 组件预览与设计稿实际引用的是同一实现，并可追溯所用设计系统和版本。
- [ ] Agent 遵循“先查已有组件 → 复用或明确新增 → 检查 → 预览”的流程。
- [ ] 使用稳定 ID 引用组件；明确组件更新如何影响已有设计稿，避免静默覆盖。
- [ ] 至少验证一个组件的新增、参数调整、设计稿引用及更新后重新打开流程。

## M5 · Reference：Mobbin 调研与项目参考文件

### 产品目标

在项目内单独保存参考图片、产品流程和研究结论。设计师能看到参考来自哪里、为什么选它、计划借鉴什么；Agent 开始设计前读取这些内容，修改后仍能追溯依据。

### 已有基础与缺口

- 素材导入和设计系统 Assets 已能保存部分图片、字体及其他资料；Markdown 可以记录研究说明。
- Assets 解决可复用资源管理，尚未形成独立的参考研究文件及来源、结论、使用关系。
- 当前 MineDesign 的接口与模块中没有查到内置 Mobbin 调研接入。会话可用的 Mobbin 连接器与 MineDesign 内置模块是两个层级；接入方式应在实施时确认。

### 建议保存的内容

每条参考至少记录稳定 ID、来源产品和链接、页面/流程、采集日期、图片文件或受权限约束的来源链接、标签、选择理由、借鉴点、避免照搬的内容，以及关联画板或组件。支持 Mobbin，也支持用户本地图片和其他网页来源。

Agent workflow 建议为“确认研究问题 → 搜集 → 筛选 → 记录结论 → 用户或任务选择适用参考 → 生成时引用参考 ID”。仅有图片墙不足以让 Agent 理解设计依据。参考资料与可直接用于交付的品牌素材分开管理；按来源许可和访问能力决定能否保存图片，不保证第三方链接永久有效。

### 完成标准

- [ ] Reference 作为项目文件独立打开，支持参考缩略图、来源、标签和研究说明。
- [ ] 能加入用户图片与 Mobbin 调研条目，并关联至少一个画板或组件。
- [ ] Agent 生成或修改时能读取已选参考，说明采用了哪些依据。
- [ ] 外部链接失效或连接器不可用时，保留已有研究记录并说明缺失内容。
- [ ] 项目重新打开后参考、说明和关联关系保持一致。

## 建议实施顺序与依赖

此顺序只供后续排期讨论，不改变以上 milestone 编号：

1. **M1 的作品类型与预览基础**：先让设计对象和演示目标明确，设备预设可分批交付。
2. **M5 Reference**：较独立，尽早让研究结果进入作品生成流程。
3. **M4 组件库**：复用已有 Components，将独立文件及引用关系做清楚。
4. **M2 Motion**：先复用 Tweaks 验证参数闭环，再完成独立模块页。
5. **M3 Figma 联动**：在画板、组件、图层和状态有稳定身份后，完成可编辑状态交接。

Reference 与组件库不必等待全部设备预设；Figma 也不必等待完整时间轴，但依赖明确的状态清单和转换验证。共享前置工作是新增项目文件类型的接入规则，并保证各模块保存、批注和外部变更处理仍有清楚边界。

## 后续实施前需确定的事项

- “iPhone duo”的确切含义，以及各设备预设的尺寸与外观资源。
- Prototype 是否包含实体设备访问；Slide 是否要求首版导出可编辑 PPTX。
- Motion 的“图层”是否包含叠放层级参数；专用曲线编辑和时间轴的首版范围。
- Figma 首版接受的转换保真度与降级范围；是否认可先单向输出。
- 组件库与设计系统的引用、版本和更新规则。

这些事项不阻碍先记录 Roadmap。开始对应实现时再收敛，不在本轮扩展为完整技术方案。

## 源码与协议索引

| 核对内容 | 当前入口 |
| --- | --- |
| 项目文件与可打开类型 | [projects.mjs](src/backend/projects.mjs)、[MCP 接口](src/interfaces/mcp.mjs)、[运行时契约](ARCHITECTURE.md#运行时契约) |
| 画板、尺寸、交互及启动视图 | [设计稿格式](skills/design/references/format.md)、[设计技能文件协议](skills/design/SKILL.md) |
| 预览与画板导航 | [artboard-focus.tsx](packages/design-runtime/src/canvas/artboard-focus.tsx)、[preview-navigation.ts](packages/design-runtime/src/canvas/preview-navigation.ts) |
| Tweaks 控件与预览参数 | [artboard-tweaks.tsx](packages/design-runtime/src/canvas/artboard-tweaks.tsx)、[use-dc-props.ts](packages/design-runtime/src/editor/components/use-dc-props.ts)、[参数协议](skills/design/references/format.md) |
| motion token 底层支持 | [runtime tokens](packages/design-system-runtime/src/model/tokens.ts)、[tokens-check.ts](packages/design-system-files/src/tokens-check.ts) |
| 组件浏览、预览与参数推断 | [components.tsx](packages/design-system-runtime/src/editor/components.tsx)、[component-inference.ts](packages/design-system-runtime/src/model/component-inference.ts)、[设计系统格式](skills/design-system/references/format.md) |
| 设计工具来源整理方法 | [from-design-tool.md](skills/design-system/references/from-design-tool.md) |
| 素材、检查与持久化操作 | [documents.mjs](src/backend/documents.mjs)、[document-store](packages/document-store)、[设计系统技能](skills/design-system/SKILL.md) |
| 已有验证与宿主边界 | [verification.md](docs/verification.md) |

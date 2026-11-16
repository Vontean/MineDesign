# runtime 目标模块划分与迁移顺序

记录日期：2026-11-15，2026-11-16 更新迁移状态。依据 `node scripts/runtime-deps.mjs <包名>` 生成的依赖地图（输出在 `output/runtime-deps/`，不入库，可随时重新生成）。决策背景见 [规格](specs/runtime-modularization.md)。本文在各迁移批次完成后更新；注册表移除后并入 [ARCHITECTURE.md](../ARCHITECTURE.md)。

## 迁移状态

| 包 | 状态 | 验证 |
| --- | --- | --- |
| design-runtime | 注册表已移除，610 个文件全部改为 import；注册表的类型定义已删除 | 17 个基线场景与迁移前零差异；`npm test`、`npm run test:modules` 通过 |
| design-system-runtime | 注册表已移除，218 个文件全部改为 import；注册表的类型定义文件尚未清理 | 6 个基线场景与迁移前零差异；`npm test`、`npm run test:modules` 通过 |

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
| 评论的几何与锚点（`comments/area-geometry.ts`、`object-geometry.ts`、`anchor-codec.tsx`、`labels.ts`） | `CommentRect`、`CommentArea`、`DesignCommentAnchor` 及各锚点类型、`CommentLabelAnchor` | 区域与对象的归一化坐标、锚点字符串的编码与解析、给人看的位置描述。评论的界面控制（`canvas-controller.tsx`）尚未改写，归入画布主函数收尾 |
| 预览文档的构建材料（`preview/html-scanner.ts`、`css-rewriting.ts`、`asset-rewriting.ts`、`dependency-graph.ts`、`module-cache.ts`、`blob-paths.ts`、`project-root.ts`）与画板聚焦、预览导航（`canvas/focus.ts`、`canvas/preview-navigation.ts`） | 各文件导出的扫描结果、路径与依赖图类型 | HTML 标签扫描、CSS 与资源路径改写、组件依赖图、模块缓存。预览文档的组装与执行（`build-document.ts`、`evaluation.ts`、`dependency-injection.ts`、`runtime-loading.ts`）和画布导航（`canvas/navigation.ts`）尚未改写 |

# BaoCut 7aa049e8 设计 Agent 研究

> 本文保留初轮研究。用户后续已确定优先复用完整编辑器、布局交互与技能，先做本地实验版；下文“独立实现”的初步建议已被替代。当前范围见 CONTEXT.md、PRD.md 与 README.md。

研究对象：[`7aa049e8`](https://github.com/JimLiu/baocut/commit/7aa049e8)，提交标题 `feat(design): add designs and design systems to sessions`，提交时间 2026-10-11。仓库当前 HEAD 为 `29ab6bef`；与该提交相比，设计工具实现没有继续变化，`design/SKILL.md` 只有后续文案微调（`git diff 7aa049e8..HEAD` 仅 4 行）。以下结论来自该提交中的源码与测试，不执行项目代码。

## 它实际新增的能力

这不是单独的提示词插件，而是一条完整的宿主链：Agent 技能负责指导模型写工作目录文件；Runtime 工具负责结构检查、素材导入和安全边界；`recordDesign` / `recordDesignSystem` 把通过检查的目录登记为会话卡片；UI 再用 `design.open` / `designSystem.open` 打开独立编辑器。编辑器、协议、卡片和标注都在同一提交中加入。

核心 Agent 工具只有四个：

| 工具 | 行为 | 风险 |
|---|---|---|
| `design_check` | 调 `@baocut/design` 的 `checkCanvas`，只读结构检查；问题为 0 才登记 `design-created` 卡片 | `read` |
| `design_import_asset` | 图片/字体按内容寻址写入设计稿 `assets/`，返回 `/_blob/<id>`；写入前确认 | `edit` |
| `design_system_check` | 调 `checkDesignSystem`，只读检查；问题为 0 才登记 `design-system-created` | `read` |
| `design_system_import_asset` | 图片、视频、PDF、字体写入 `_blobs/`，返回 src 和 `design-system.json` 索引记录；写入前确认 | `edit` |

源码：[`design-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-tools.ts#L14-L151)、[`design-system-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-system-tools.ts#L24-L212)、注册位置 [`runtime.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/runtime.ts#L909-L915) 和离线目录 [`all-tool-sets.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/all-tool-sets.ts#L35-L65)。工具定义明确 `surfaces: ['agent']`，所以它们不是面向普通 CLI 的通用写文件命令。

## 设计稿 Agent 流程

`skills/baocut/built-in-skills/design/SKILL.md` 要求模型：先找/读取设计系统的 `README.md` 和 `tokens.json`；在一个新目录写 `canvas.json` 与每块画板的 `.dc.html`；图片和字体先通过 `design_import_asset`；写完后反复 `design_check`，直到 `problems = 0`。设计稿格式要求 `canvas.json` v3、每块画板一个文件、固定的 `<x-dc>` markup、唯一 `data-dc-script`、`class Component extends DCLogic`，`$preview` 必须匹配画板尺寸。技能明确不让 Agent 自己渲染、截图或用浏览器验证，视觉是否正确由用户打开编辑器后确认。

源码：[`design/SKILL.md`](https://github.com/JimLiu/baocut/blob/7aa049e8/skills/baocut/built-in-skills/design/SKILL.md#L1-L115)，检查工具的规则说明 [`design-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-tools.ts#L50-L63)。因此可迁移的最小契约是“文件产物 + 结构 lint + 通过后注册卡片”，不是把整套编辑器复制进插件。

## 设计系统 Agent 流程

`design-system/SKILL.md` 要求模型先决定来源（现有系统或自建 token），写 `design-system.json`、`README.md`、`tokens.json`、预览/组件文件；素材走 `design_system_import_asset` 并把返回的 record 写入 `assetGroups` 或 `blobs`；最后反复 `design_system_check`。检查器不渲染组件，只检查 manifest、token 语法/上限、预览安全规则、字体与 blob 引用等。

关键区别：设计系统导入允许 `png/jpg/jpeg/gif/webp/svg/mp4/webm/pdf/woff2/woff/ttf/otf`；SVG 上限 2 MiB，其余按 `designSystemUploadLimit`，通常 20 MiB。设计稿导入只允许图片和字体，统一 20 MiB。实现分别见 [`design-system-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-system-tools.ts#L37-L55) 和 [`design-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-tools.ts#L25-L45)。

## 安全与实际运行契约

工具层对路径和目标做工作区边界检查，来源必须是普通文件；具体绝对路径、目录和符号链接规则按接口分别实现，不能用一条通用规则替代核查。确认后重新读文件并比较字节数，大小改变则返回 `FILE_CHANGED`；这不能检测字节数相同的内容替换。相关代码：[`design-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-tools.ts#L126-L209) 与 [`design-system-tools.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/agent-tools/design-system-tools.ts#L167-L278)。

协议层把设计标注作为消息附件：`conversations.send` / `conversations.steer` 增加 `designAnnotations` 和 `designSystemAnnotations`，并新增 `design.open`、`designSystem.open`。源码：[`methods.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/protocol/src/methods.ts#L367-L400)、[`schemas.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/protocol/src/schemas.ts#L390-L420)。编辑器地址由 Runtime grant 保护，Web 服务只把对应方法加入白名单；不是把本地目录直接暴露给页面。

## 测试证据

`design-tools.test.ts` 覆盖：合格/不合格检查、缺 `canvas.json`、目录越界、符号链接、非支持类型、规划只读模式、确认后才写入、同一 blob 去重和图片/字体返回值（约 187 行）。`design-system-tools.test.ts` 覆盖相同安全边界，并验证素材组索引、SVG/普通文件大小限制和 `design-system.json` 标记（约 200 行）。此外 `runtime.test.ts`、`web-service.test.ts` 覆盖编辑器地址、grant 隔离和页面不可用时的 503 行为。测试只证明结构/协议/安全契约；不证明画板视觉质量或真实浏览器交互。

## MineDesign 的迁移建议

第一阶段只做 MineDesign 插件的 Agent 面：

1. 提供设计结构检查与素材导入工具，针对 MineDesign 自己的产物独立实现。MineCodex 当前源码证明可参考官方插件入口、MCP Apps 资源和服务通信；没有证据证明它已有 BaoCut 式设计卡片、工作区授权或设计文件工具可直接复用，这些能力需另行设计与验证。
2. 把“先读 DESIGN.md/设计系统，再写产物，再 lint 直到通过”的流程写成 skill；提示词只负责流程，安全与登记必须在工具层实现。
3. 给通过检查的产物生成一个可打开的 preview artifact，再考虑完整 canvas 编辑器、标注回传和 `conversations.steer` 接入。
4. 第一版沿用并检查现有设计系统；完整设计系统编辑器作为后续阶段。用户后续已确认“生成 → 预览 → 批注 → 修改同一份稿件”是第一版验收边界，批注回传不能推迟到第一版之外；最新产品范围以 PRD.md 为准。

不要直接复制 BaoCut 的实现或编辑器：提交规模很大，`packages/design-runtime` 的画布单文件超过 22k 行，另有 13k 行 CSS；它还依赖 React 18/19 双运行时、Babel standalone、dom-to-svg、happy-dom、jQuery 等。MineDesign 应先复刻契约与边界，重新实现自己的 preview/runtime。

## 许可风险

仓库 `LICENSE` 是 BaoCut Community License 1.0。它允许研究、实验、个人和组织内部使用，也允许制作内容；第 2 节允许附条件的非商业分享，第 3 节对商业分发、商业托管及并入对外商业软件要求另行书面许可。因此不能把“对外分发”一概等同于禁止，也不能把可查看源码等同于可任意商用。两个运行时 README 还说明其来自原设计类型的 TypeScript 重建，内联 Anthropicons 字体的分发许可待确认。仓库自身许可证和 npm 依赖声明不足以单独消除这些来源的不确定性。建议参考工作流独立实现；如果要复制代码、技能正文、编辑器 bundle 或字体，应先逐项核对权利和分发条件。

原始来源：[`LICENSE`](https://github.com/JimLiu/baocut/blob/7aa049e8/LICENSE)、[`design-runtime/README.md`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/design-runtime/README.md)、[`design-system-runtime/README.md`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/design-system-runtime/README.md)、[`THIRD_PARTY_NOTICES.md`](https://github.com/JimLiu/baocut/blob/7aa049e8/THIRD_PARTY_NOTICES.md)。

## 结论

这个提交证明了可行的产品模式：Agent 负责生成文件，宿主提供最小的结构检查/素材导入工具，检查通过后才出现可操作的设计卡片；用户在编辑器里做视觉验收，标注再回流 Agent。对 MineDesign，最有价值、风险最低的切入点是先实现这条“生成 → lint → artifact preview → 用户标注”的闭环。

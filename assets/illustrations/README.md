# 产品插画

本目录集中管理 MineDesign 产品插画的定义、构图、样式和引用入口。品牌图标仍由相邻的 brand 目录维护；用户作品的图片、字体与素材不属于本目录。

## 目录与职责

- `index.mjs`：插画目录与公开接口 `createIllustration(name)`。每次返回独立的装饰性 DOM 节点，统一标记 `aria-hidden`，不重复朗读旁边的状态文案。
- `document-stack.mjs`：叠放文档的构图模块，复用 Lucide 原始图标，不手写或复制其路径。
- `illustrations.css`：插画自身的几何、图层及主题。沿用项目语义 token，默认 112px；使用方可通过 `--mdn-illustration-size` 等比调整整体尺寸，不改内部图层。

## 插画目录

| 引用名 | 含义 | 当前构图 |
| --- | --- | --- |
| `document-loading` | 正在连接或打开作品 | 文档叠层 + Lucide Files |
| `document-unavailable` | 作品暂时无法打开 | 文档叠层 + Lucide FileWarning |
| `document-empty` | 尚无打开的作品 | 文档叠层 + Lucide Files |

加载与空状态目前复用同一构图，但保留各自的语义引用，后续可分别替换。

## 引用与维护规则

页面通过 `createIllustration('document-unavailable')` 取得节点，放入自己的插画容器。页面决定何时展示哪种插画，以及文案、操作与布局；资源模块不读取 App 状态、不调用 MCP、不处理保存或重试。

新增插画时，在本目录添加资源或构图模块，在 index 中登记用途名称并更新上表。修改已有插画时，保持引用名稳定；调用方不依赖 Lucide 的具体图标、SVG 路径、伪元素或图层数量。未知引用名明确报错，不静默替换为另一幅插画。

构建脚本将此目录的样式和使用到的模块内嵌进插件 HTML，资源不通过本地 HTTP 或外部 CDN 加载，以兼容 Codex 沙箱。npm 打包保留本目录供维护；运行依赖构建后的自包含资源。

Lucide 图标来源于项目已有的固定依赖，使用 ISC 许可；叠放文档构图由 MineDesign 维护。

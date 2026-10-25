# MineDesign / MDN 图标

生产源为 `minedesign-icon.svg`。`npm run build:icons` 生成选中态、浅色/深色资源和 favicon。不要单独编辑生成文件。

## 几何与状态

- 24×24 viewBox；外圈逐字保留 MCX 的 `codex-outline` 路径，沿用六瓣轮廓及其原有厚度。
- 画笔来自本机 Codex 资源中的 Lucide `brush`，不是另一个图标库，也不是凭截图重画。原始两条路径保存于 references/brush-native.svg。
- 与 MCX 一致，内部采用 `translate(6.24 6.24) scale(.48)`；生产版为闭合实心图形，无额外内部描边。画笔笔杆按原轮廓闭合，刷毛路径不变。原始线稿 stroke 为 2；MCX 历史线稿参考宽度 2.65，不将历史线稿误用于当前实心版。
- 未选中：六瓣环形外圈 + 实心画笔。
- 选中：实心六瓣 + 同一画笔形状的透明镂空。镂空使用 luminance mask，透出当前背景，不以白色模拟。
- currentColor 用于内联或 CSS mask；独立明暗 SVG 与 MCX 一样分别使用 #0d0d0d / #fafafa。
- 选中态原生展示尺寸 20px，viewBox 保持 24；默认源 24px。16/20/24/32/48px 都在实际浏览器中检查。

## 接入范围

插件 manifest 的 logo/logoDark/composerIcon 使用对应的版本资源（composerIcon 自适应明暗）；MCP server 与 tools/list 返回带 light/dark 的图标。插件自身打开页面的标题使用选中态。

默认/选中资源额外作为 `minedesign/iconStates` 元数据提供，但这是本插件的状态契约，不是 MCP 标准的自动切换字段。MCP 标准 icons 只声明 theme，不声明 selected；MCX 的原生导航选中切换依赖其注入 Adapter。MineDesign 当前不引入 MCX 注入依赖，因此不能仅凭资源已提供就声称 Codex 原生导航已自动切换，需宿主支持或另行适配并实际验收。

## 来源

- 外圈及生成规则：MineCodex 的生产 SVG 和 build-brand-icons.mjs；MCX 原始依据为 Codex 26.930.21537 的 codex_new-f14177b03534.svg。
- 画笔：本机 `/Applications/ChatGPT.app/Contents/Resources/app.asar` 的 `webview/assets/brush-c35d5851a4d2.svg`；其路径与 MCX 同属 Lucide 资源。
- references 中保留原始 SVG、Lucide ISC 与 MineCodex MIT 许可。OpenAI 品牌外圈不是 Lucide 许可覆盖的内容。

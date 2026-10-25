# MineDesign

面向 Codex 的设计插件本地实验版。先复用 BaoCut 的完整设计画布、设计系统编辑器、文件协议和技能，再迭代自己的交互与视觉。当前版本 `0.0.3`，不作为已完成 Codex 验收的正式发布。

## 当前可用内容

- 完整设计画布：多画板、平移缩放、工具栏、属性面板、编辑、保存及上游导出路径。
- 完整设计系统编辑器：概览、颜色、文字、间距、圆角、阴影、组件、素材与文件能力。
- 元素与区域批注桥、批注草稿持久化、反馈提交前保存及版本检查。
- 两套 design / design-system 技能与四类结构检查、素材导入工具。
- 官方 MCP Apps global/thread 入口及本地安装脚本。
- 参考 MCX Dashboard 的本地明暗 token；不读取 Codex DOM，不依赖 MCX 注入。

上述列表区分“代码已接入”与“实际验收”，见下表。用户作品不随插件 chrome 换肤。编辑器 runtime、React 18 画板 runtime 和 React 19 编辑器各自保留职责。


## 产品、命令与图标

产品名称 **MineDesign**，缩写 **MDN**；沿用 MineCodex → mcx 的命名方式，npm 包名为 `minedesign`，命令为 `mdn`。当前包保持 private，本轮只生成本地安装包，没有发布到 npm registry。

```sh
mdn --version
mdn --help
mdn plugin install
mdn --workspace /path/to/project
```

图标使用与 MCX 相同的 Codex 六瓣外圈和内部缩放，中心换成原生资源里的 Lucide brush。默认是环形外圈 + 实心画笔；选中是实心外轮廓 + 透明画笔镂空。默认/选中、明暗 SVG 与 favicon 从同一源生成，来源见 [图标说明](assets/brand/README.md)。

本轮已验证隔离目录安装本地 `.tgz` 后的 mdn 命令、stdio MCP、两作品及编辑器 HTTP，不依赖本项目的私有 workspace 链接。打包名单排除 .local、测试、截图和 node_modules。MCP tools/list 已返回明暗图标；原生导航自动切换选中资源尚未接通，MCX 的相同效果依赖其注入 Adapter，当前 MDN 不引入该依赖。

## 启动

需要 Node.js 22.18 或以上和 npm。首次安装依赖及构建需要网络；编辑器运行资源本地提供，用户采用在线字体时仍需网络。

```sh
npm ci --ignore-scripts
npm run build
npm start
```

终端输出本次浏览器地址。默认打开本项目中的设计稿和设计系统示例。重新构建后刷新页面；强制重建编辑器可分别运行两个编辑器目录中的 build.mjs 并传 `--force`，再运行 `node scripts/build.mjs`。

## Codex 本地插件

```sh
npm run install:local
```

脚本通过 `codex plugin marketplace add` 和 `codex plugin add` 注册独立的 `minedesign-local` marketplace。Codex 桌面版已并入 ChatGPT.app，CLI 不在 PATH 时脚本依次查找 `CODEX_BIN`、`codex` 与 `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`。MCP 命令指向本项目构建产物；不复制整套 runtime 到插件缓存，不重启 Codex，也不修改 MCX。移动项目或更换 Node 后需要重装以更新绝对路径。

默认工作区仅为本项目，便于实验，不授予任意磁盘访问。其他目录可以通过 CLI 的 `--workspace` 指定；正式多项目接入尚需设计相应的授权 UI。

在 Codex 插件入口寻找 **MineDesign**。聊天内入口声明为 thread，宿主支持时可在面板的新标签工具列表中找到。实际入口发现与 UI 装载仍待本机人工验收；CLI 安装成功不等于 GUI 已通过。若 Codex 当前会话未发现新工具，应由用户检查插件页面的启用/刷新状态，不通过重启日常窗口强制刷新。

## 本轮证据

| 层级 | 结果 |
| --- | --- |
| 源码 | 固定 BaoCut `7aa049e82e1367da013b7aba80f0b79033fa04ad` 的设计相关包；宿主适配独立维护 |
| 构建 | 两套完整编辑器和 MineDesign App/MCP 构建成功 |
| 依赖 | root React 19、独立 preview React 18 依赖树无 npm peer 错误；happy-dom 升到 21.0.4 后 audit 为 0 |
| 协议测试 | 真实 stdio MCP 初始化、工具发现、UI resource、两类结构检查、HTTP 文件读取与 ifMatch 冲突、越界、异源写入、批注版本检查通过 |
| 浏览器画布 | 两画板实际渲染；上游批注模式定位并添加反馈；切换作品后草稿仍在 |
| 浏览器设计系统 | 实际渲染全部章节；间距从 16px 改为 20px，保存到 tokens.json |
| 本机安装 | 官方 CLI 安装 `minedesign@minedesign-local` 0.0.3 成功；已读取注册结果 |
| Codex GUI | 未验收；电脑操作工具禁止控制 Codex 自身界面，不能用其他通道绕过 |
| 完整 Agent 闭环 | 未验收：尚未证明 Codex 实际装载 iframe、批注发回本聊天并由 Agent 修改原稿 |
| 导出与其他编辑操作 | 上游路径已保留，但本轮未逐项点击验收；不宣称全部无回归 |

截图位于 `output/verification/`。`npm test` 执行针对真实外部契约的测试，不用源码匹配替代行为验证。

## 已知边界

- Codex 的 MCP Apps CSP、嵌套 iframe、`sendMessage` 支持需要真实 GUI 验证。浏览器模式明确禁用“发送到当前聊天”。
- 插件当前绑定本项目；不是成熟的跨项目作品库。重启 MCP 后，用户作品需重新打开。
- 继承 BaoCut 已关闭的快速编辑 sample、多人协作等状态，不额外接入独立模型服务。
- 上游界面文案多数保留英文，尚未完整汉化；首版优先保留布局和实际行为。
- 本地 token 参考 MCX 已记录快照，未重新测量当前 Codex 构建；视觉对齐仍需逐组件比较。
- 当前防重复提交仅在 App 会话内；跨窗口与超时不确定结果的严格一次性提交仍待完善。

## 来源与许可

上游原始许可和第三方声明保留于 vendor/baocut；来源及本地补丁见 [vendor/UPSTREAM.md](vendor/UPSTREAM.md)。MCX 颜色和字体快照的来源与已知证据范围见 [DESIGN.md](DESIGN.md)。

当前用于本地实验。BaoCut Community License 对商业分发及商业集成另有要求；原 runtime README 也记录重建代码及内联图标字体的来源限制。本项目不以本地实验许可宣称可任意对外分发。尚未提交、推送或发布。

产品背景与目标分别见 [CONTEXT.md](CONTEXT.md) 和 [PRD.md](PRD.md)。

图标刷新：0.0.3 为 manifest 补齐 logoDark，并为 logo/composerIcon 使用版本资源路径；MCP 配置携带 MINEDESIGN_PLUGIN_VERSION，避免新版本与旧版本的启动配置完全相同。官方 app-server plugin/read 已核对三种图标解析路径；当前浏览器页面已刷新，原生 Codex 导航视觉仍未自动验收。

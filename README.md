# MineDesign

面向 Codex 的设计插件：在聊天中生成设计稿，在侧栏查看、编辑和批注，并复用已有设计系统。当前生产版是 **0.1.1**，通过 [npm](https://www.npmjs.com/package/@vontean/minedesign) 分发。

## 可以做什么

- 用多个画板表达界面、流程、海报、信息图及轻量原型。
- 查看和维护颜色、文字、间距、圆角、阴影、组件与素材。
- 针对元素或区域整理批注，显式提交本轮修改意见。
- 将作品保存为本地文件，执行结构检查，导入真实图片与字体。

需要 Node.js **22.18 或以上**、npm 和已安装的 Codex。首次注册后，在 Codex 插件设置中确认 MineDesign 已启用；已有聊天未识别新插件时，刷新插件连接或新建聊天，无需重启整个 Codex。

## 让 Agent 安装生产版

把下面这段发给本机的 Codex Agent：

```text
请为本机 Codex 安装 MineDesign 的 npm 生产版。
1. 检查 Node.js >= 22.18、npm 和 Codex CLI。
2. 执行 npm install --global @vontean/minedesign@latest。
3. 执行 mdn plugin install。已有作品目录应沿用，不覆盖作品与设置。
4. 用 mdn --version 和 codex plugin list --json 核对版本与插件启用状态；
   确认 MCP 启动文件来自 npm 安装目录，而不是源码仓库。
5. 若存在指向源码的旧 MineDesign 注册，仅移除对应插件注册并保留用户数据。
   不要移除独立的 MineDesign dev，不要重启 Codex。
6. 报告安装版本、作品目录、注册结果，以及是否还需要刷新当前聊天连接。
请安装 npm 发布包，不要用 git clone 的源码替代生产版。
```

## 手动安装生产版

在终端执行：

```sh
node --version
npm --version
npm install --global @vontean/minedesign@latest
mdn plugin install
mdn --version
codex plugin list --json
```

默认作品目录为 `~/MineDesign`，首次安装会放入示例；评论和设置在 `~/.minedesign`。也可以选择已有作品目录，之后更新会沿用：

```sh
mdn plugin install --workspace /path/to/design-workspace
```

在 About 中检查更新，或再次执行安装命令，可更新 npm 生产版。浏览器预览可用 `mdn --workspace /path/to/design-workspace`；发送反馈需要在 Codex 中打开插件。

## 生产版与开发版

| | 生产版 | 开发版 |
| --- | --- | --- |
| Codex 名称 | MineDesign | MineDesign dev |
| 来源 | npm 的 latest 发布包 | 本地源码与构建 |
| Git 分支 | main；版本标签 vX.Y.Z | codex/dev |
| 本机数据 | ~/.minedesign | 源码目录的 .local/dev |
| 作品目录 | ~/MineDesign 或安装时指定 | 开发安装时指定，默认源码工作区 |
| 更新方式 | npm 发布版本 | 当前开发分支的上游 |

两版可以同时安装。日常开发和验证使用 **MineDesign dev**；只有用户明确要求合入生产时，才通过 PR 合入 `main` 并按 [发布流程](docs/releasing.md) 发布。仓库的默认分支保持 `main`。

开发者安装：

```sh
git clone --branch codex/dev https://github.com/Vontean/MineDesign.git
cd MineDesign
npm ci --ignore-scripts
npm run build
npm run install:dev
```

这会单独注册 `minedesign-dev`，不会覆盖 npm 生产版。移动源码或更换 Node 后，重新执行开发安装。后续操作见 [开发与恢复](docs/development.md)。

## 文档导航

| 想了解什么 | 从这里开始 |
| --- | --- |
| 功能用途与当前限制 | [CONTEXT.md](CONTEXT.md) |
| Agent 开发规则与读取路径 | [AGENTS.md](AGENTS.md) |
| 模块职责与运行时契约 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 产品目标与路线图 | [PRD.md](PRD.md)、[ROADMAP.md](ROADMAP.md) |
| 编辑器主题与资源规范 | [DESIGN.md](DESIGN.md) |
| 构建、测试与验收边界 | [开发工作流](docs/development.md) |
| 中英文案维护 | [i18n](docs/i18n.md) |
| npm 与 GitHub Release | [发布](docs/releasing.md)、[版本说明](docs/releases/) |

交流草稿、过程记录和验证产物放在 `Doc/`、`docs/process/` 或 `output/`，保留在本机，不提交。README、AGENTS、架构、设计、产品契约、路线图及发布说明继续版本管理。

## 来源与许可

来源、修改说明、原始许可及第三方声明统一见 [FORK.md](FORK.md)。npm 包按该许可免费、非商业分发，不据此宣称已取得商业分发权利。品牌为 MineDesign，缩写 MDN；图标来源及生成方式见 [品牌说明](assets/brand/README.md)。

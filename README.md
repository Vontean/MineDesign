# MineDesign

面向 Codex 的设计插件：在聊天中生成设计稿，在侧栏查看、编辑和批注，并复用已有设计系统。当前为 `0.0.5` 本地实验版。

## 可以做什么

- 用多个画板表达界面、流程、海报、信息图及轻量原型。
- 查看和维护颜色、文字、间距、圆角、阴影、组件及素材。
- 针对元素或区域整理批注，显式提交本轮修改意见。
- 将作品保存为本地文件，执行结构检查，导入真实图片与字体。

Codex 聊天侧栏已验证可加载设计稿和设计系统。完整反馈提交闭环、独立全页面和导出下载仍有待验收项，详见 [验证记录](docs/verification.md)。

## 本地使用

需要 Node.js 22.18 或以上和 npm。首次安装与构建需要网络；作品使用在线字体等资源时仍需网络。

```sh
npm ci --ignore-scripts
npm run build
npm start
```

终端会输出本次浏览器地址，默认打开 Pine 与 Mine Studio 示例。浏览器模式支持预览，发送反馈需在 Codex 中打开。

安装到 Codex：

```sh
npm run install:local
```

安装脚本注册独立的 `minedesign-local` marketplace，不重启日常 Codex。项目移动或 Node 路径变化后需重新安装。更新了外壳代码时，关闭 MineDesign 标签再打开；MCP 断连时在插件设置刷新连接。详细步骤见 [开发与恢复](docs/development.md)。

命令入口为 `mdn`，在本地包安装后可使用：

```sh
mdn --help
mdn --version
mdn --workspace /path/to/project
mdn plugin install
```

默认工作区仅为本项目；其他工作区通过启动配置指定。

## 文档导航

| 想了解什么 | 从这里开始 |
| --- | --- |
| 各功能的用途、使用场景与限制 | [CONTEXT.md](CONTEXT.md) |
| Agent 的开发规则与按任务读取路径 | [AGENTS.md](AGENTS.md) |
| 模块、文件职责与运行时契约 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 第一版目标与验收规格 | [PRD.md](PRD.md) |
| 编辑器外壳、主题与资源规范 | [DESIGN.md](DESIGN.md) |
| 插画目录及替换方式 | [插画资源](assets/illustrations/README.md) |
| 安装、构建、测试、CodeGraph 与故障恢复 | [开发工作流](docs/development.md) |
| 已有证据与待验收能力 | [验证记录](docs/verification.md) |

## 来源与许可

复用固定版本的 BaoCut 设计编辑器、运行时与文件协议，来源和补丁见 [vendor/UPSTREAM.md](vendor/UPSTREAM.md)。原始许可及第三方声明保留在 vendor 中。当前用于本地实验，不据此宣称已取得任意商业分发权利。

品牌为 MineDesign，缩写 MDN。图标来源与生成方式见 [品牌说明](assets/brand/README.md)。

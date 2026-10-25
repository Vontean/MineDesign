# 开发、运行与验证

理解依赖和文件职责先读 [ARCHITECTURE.md](../ARCHITECTURE.md)。命令和版本以 [package.json](../package.json)、CLI `--help`、插件 manifest 为准。

## 构建与安装

首次 checkout：按 README 安装依赖、完整构建，再启动或安装。两个编辑器先构建，外壳构建随后将 App 脚本、样式及插画内嵌进 HTML。直接修改 dist 会在下次构建丢失。

| 改动 | 生效路径 | 检查完成条件 |
| --- | --- | --- |
| App、桥、frame shim、外壳样式、插画 | `node scripts/build.mjs`，关闭 MineDesign 标签后重开 | 页面展示本次构建；“重新载入”仅重载内部作品，不更新旧外壳 |
| 编辑器源码 | 重建对应编辑器，再运行外壳构建 | 实际打开对应编辑器，关键操作正常 |
| 后端实现 | 构建后调用 `minedesign_reload` | 同一 MCP 连接仍可列工具、读取资源；作品与批注保留 |
| MCP schema、稳定 CLI | 构建、安装后由宿主刷新连接 | 新接口可用；退出 stdio 不会替代宿主重连 |
| manifest、技能 | 同步版本与锁文件、运行本地安装 | 官方注册结果与缓存配置正确 |
| 打包清单或运行依赖 | `npm pack --dry-run --ignore-scripts`；需要时隔离目录安装包 | 必需资源存在，无本地私有链接依赖 |

安装脚本使用当前 Node 的绝对路径，生成独立 `minedesign-local` marketplace；CLI 按 CODEX_BIN、PATH、应用内置路径查找。构建指纹覆盖 dist、两套编辑器产物并进入启动配置，使后端独立打包后的变化也可识别。移动项目或更换 Node 后重新安装；安装成功不代表旧的宿主连接已替换。

默认工作区为项目自身；其他项目使用 CLI 的 `--workspace`。这里没有通用跨项目授权 UI，路径边界测试必须保留。

## 故障与恢复

| 现象 | 核对位置 | 恢复与验证 |
| --- | --- | --- |
| 作品 404 | App 当前记录和服务签发的 grant | 按稳定目录重新打开；重试取得新记录，不能复用缓存 grant |
| 修改后仍显示旧 header 或旧样式 | 外壳是否重建，而非只重载作品 | 构建后关闭标签再打开，核对本次界面 |
| Transport closed | 宿主 MCP 连接 | 安装文件正确后，在插件设置刷新连接；普通 Try again 只重试调用。官方 CLI 重装不会重建当前聊天已关闭的 stdio |
| 画板空白而外壳正常 | frame origin、脚本、素材及真实渲染 | 保留精确 origin/source 检查；结构校验通过仍需实际预览 |
| 保存冲突或批注过期 | 当前文件版本、ifMatch、批注 sourceVersion | 重新读取与定位，保留用户修改，拒绝过期覆盖 |
| 修改了外壳却改变作品品牌 | theme adapter 注入范围 | 样式仅作用于编辑器 chrome，核对用户画板和设计系统 tokens |

连接、加载、空作品、错误和重试状态属于作品视窗；发送或批注操作结果属于反馈区域。避免把长错误路径放回 header。完整状态与资源规格见 DESIGN.md。

## 按风险验证

先按修改选择现有最高层边界；测试验证可观察行为，数量不作为目标。

| 改动范围 | 首选验证 | 交付证据 |
| --- | --- | --- |
| 文档与路由 | 链接、文件覆盖、相互引用与过期表述 | 所有新增路由可达，职责有唯一来源 |
| 资源与外壳 | 构建、App 加载回归、真实页面切换 | 关键状态截图；明暗或窄屏受影响时补相应检查 |
| MCP、服务、保存 | 构建后执行 `npm test` | stdio MCP、工作区边界、冲突、版本及错误恢复 |
| 预览桥 | origin/source 回归与真实 iframe 内容 | Codex 中的内容证据；本地预览不能代替宿主验收 |
| 发布或安装包 | 打包名单、隔离安装、版本一致性 | 源码、包、注册、实际宿主分别报告 |

文件模块与浏览器宿主的原生回归使用 `npm run test:modules`。跨层重构先在隔离目录保存旧 service bundle 与两套编辑器产物，再执行 `npm run verify:equivalence -- <旧 service.mjs>`；同一路径重置夹具，对比实际响应，仅归一化进程 grant/origin。视觉与交互使用同一窗口、作品与状态进行前后截图及操作比较，记录范围。

可写测试使用 `tests/fixtures/` 复制到临时工作区。`examples/` 是可被用户编辑的作品，不作为可覆盖的数据。测试产生的批注或临时目录在 finally 清理。

界面交付的截图规则由 AGENTS.md 统一维护。实际验收记录见 [verification.md](verification.md)，不要把本次未运行的历史记录写成新证据。

## CodeGraph 工作流

- 本机 CLI 已安装时，新 checkout 执行 `codegraph init --yes`；日常改动后执行 `codegraph sync`，状态用 `codegraph status` 核对。
- 从项目目录运行 `codegraph explore "符号或问题"`。已连接的 MCP 可用 `codegraph_explore`，projectPath 指向本项目。
- `codegraph.json` 索引 apps、src 和 packages 中自行维护的源码；降低示例优先级，忽略生成物、安装依赖与示例的压缩 React。
- 更改索引范围后完整执行 `codegraph index`，确认 `codegraph files` 包含目标路径，再用一个真实符号查询验证。图谱静态路径不能证明动态代码已经运行。
- `.codegraph/.gitignore` 是可共享规则；数据库和进程文件留在本机。新机器需要重新索引。

## 提交与远端

提交前检查全部差异与打包名单，排除 `.mcp.json`、运行数据、凭据、索引数据库和生成物。文档、测试及资源随对应逻辑提交；来源和许可统一维护在 FORK.md。

仓库可见性通过 `gh repo view --json nameWithOwner,visibility,url` 实时核对；推送后核对分支 upstream 和远端提交 SHA。创建仓库、推送源码和发布安装包是不同动作，分别记录授权及结果。

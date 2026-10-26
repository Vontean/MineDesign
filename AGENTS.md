# MineDesign · Agent 入口

## 生产与开发

- `main` 是生产分支，npm `latest` 是用户实际安装的生产版。生产插件只使用 npm 发布包，不能指向本仓库的构建。
- 后续代码修改、构建和验收都在 `dev`（或从它创建的工作分支）进行，使用独立的 **MineDesign dev** 插件。开始任务先核对当前分支与插件来源；在 `main` 上收到开发任务时先切到开发分支。
- 除非用户明确要求“合入生产”或“发布生产版”，不得把开发改动推入 `main`、移动生产标签、发布 npm latest，或用源码覆盖生产插件。用户同意后，通过 PR 合入并按发布流程验证。
- 生产与开发的插件 ID、MCP 标识和本机数据目录必须独立；重新安装 Dev 不得移除或改写生产配置。
- `Doc/`、`docs/process/`、`docs/notes/`、`docs/drafts/` 与 `output/` 放交流草稿和过程证据，不提交。正式产品、架构、设计、操作和发布文档继续维护；不要批量忽略 Markdown。

## 开始与完成

1. 先看工作区差异，明确本轮目标与可检查结果；已有作品和未提交修改属于用户数据。
2. 按下表只读取当前任务需要的材料。理解代码先用 CodeGraph；索引缺失时初始化，变更后同步。
3. 在所属层完成最小改动，验证外部可观察行为；接口、职责或约束变化时同步对应文档。
4. 交付说明改动、验证与剩余边界。界面改动必须在最终回复直接嵌入本次构建的真实效果图；错误恢复流程覆盖错误态与重试态，明确本地预览或 Codex 宿主来源。
5. 提交按一个逻辑变更一个 commit，推送后核对远端提交与可见性；发布版本时同步发布信息。普通开发推送不自动创建 Release。

## 工程原则

- **领域边界**：以作品、设计系统、素材、批注和反馈命名能力；作品文件是内容来源，界面状态表达当前操作。
- **分层依赖**：前端经 service-client 使用共享契约；HTTP/MCP 接口适配后端操作；后端经文件模块读写。后端更新使用 minedesign_reload 保留 MCP 连接，接口变更走宿主重连。浏览器与 Node 实现各自维护，依赖图测试防止跨层渗透。
- **最小复杂度**：优先现有契约和简单实现。扩展点服务已经存在的变化，抽象应减少调用方需要知道的细节。
- **单一事实来源**：配置以可执行文件为准，文档记录理由与边界；同一规则只维护在一处，通过链接披露。
- **独立维护与兼容**：源码按领域模块自行维护，来源集中在 FORK.md；重构前后比较交互、视觉与后端响应。保留文件协议与许可；用户作品品牌独立于外壳。访问受授权工作区约束，保存和反馈核对版本。
- **风险相称验证**：优先已有最高层行为测试；结构检查、真实渲染、宿主交互和用户验收分别报告。

## 按任务读取

| 任务触发 | 先读 | 代码或文件入口 |
| --- | --- | --- |
| 理解功能用途、当前限制 | [CONTEXT.md](CONTEXT.md) | 产品语义；首版目标另见 [PRD.md](PRD.md) |
| 定位模块、改变依赖或接口、增加文件 | [ARCHITECTURE.md](ARCHITECTURE.md) | 完整文件地图、领域术语、关键数据流 |
| 修改界面、主题、状态或插画 | [DESIGN.md](DESIGN.md) | `src/frontend/app.*`、`assets/`；插画另读 [资源目录](assets/illustrations/README.md) |
| 修改可见文案、语言或错误提示 | [i18n 维护](docs/i18n.md) | `packages/contracts/src/ui-text/`、`ui-locale.ts`、`ui-error.ts` |
| 修改加载、保存、素材、反馈或 MCP | [架构契约](ARCHITECTURE.md#运行时契约) | `src/backend/`、`src/interfaces/`、`src/frontend/service-client.mjs` |
| 构建、安装、连接恢复、打包 | [docs/development.md](docs/development.md) | `package.json`、`scripts/`、`bin/mdn.mjs`、插件 manifest |
| 发布版本、npm 与 GitHub Release | [docs/releasing.md](docs/releasing.md) | `.github/workflows/publish.yml`、`docs/releases/` |
| 选择测试、判断某项是否验收 | [验证路由](docs/development.md#按风险验证)、[验收边界](docs/development.md#验收边界) | `tests/`；修改测试用独立夹具，不覆盖示例作品 |
| 改设计生成方法或文件格式 | 对应 `skills/design/SKILL.md` 或 `skills/design-system/SKILL.md` | 再按技能指针读取 references；不用整批加载 |
| 修改编辑器、选择性合入外部更新或评估分发 | [ARCHITECTURE.md](ARCHITECTURE.md)、[FORK.md](FORK.md) | 模块自行维护；FORK 统一记录固定来源、接管映射与许可 |

## CodeGraph

- `.codegraph/` 存在时，理解或定位代码先调用 `codegraph_explore`（MCP 参数带本项目路径）或 `codegraph explore "符号或问题"`，再按返回路径查看未覆盖内容。
- 新 checkout 使用 `codegraph init --yes`；改动后执行 `codegraph sync`。索引范围由 [codegraph.json](codegraph.json) 管理，自有模块源码参与检索，生成物和随示例分发的压缩 React 不参与。
- 索引数据库是本机产物；提交范围配置与 `.codegraph/.gitignore`。动态分派和图谱未覆盖的内容按真实源码及运行验证确认。

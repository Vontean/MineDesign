# 发布

生产版本是 npm 上的 `@vontean/minedesign`，对应 `main` 上的 `vX.Y.Z` 标签与同名 GitHub Release。源码检出是开发版，按当前分支上游更新（见 [开发工作流](development.md)）。两种形态的数据位置与更新方式由 `src/paths.mjs` 区分，规则见 [ARCHITECTURE.md](../ARCHITECTURE.md)。

工作流：`.github/workflows/publish.yml`，仅手动触发。账号 `Vontean`（GitHub 用户 ID `65079079`），仓库 ID `1432977566`。

## 每次发布

1. 在 `main` 上单独提交版本升级：`package.json`、`package-lock.json`（`npm install --package-lock-only`）、`.codex-plugin/plugin.json` 的版本与图标路径，`node scripts/build-brand-icons.mjs` 生成的 `assets/brand/<版本>/`，以及发布说明 `docs/releases/vX.Y.Z.md`（用户可见变化、默认行为、重要限制）。
2. 本地 `npm run build && npm test && npm run test:modules` 通过后，推送 `main` 与标签 `vX.Y.Z`。
3. 先只验证，再发布：

```bash
gh workflow run publish.yml --repo Vontean/MineDesign --ref main -f release_tag=vX.Y.Z -F publish=false
gh workflow run publish.yml --repo Vontean/MineDesign --ref main -f release_tag=vX.Y.Z -F publish=true
```

工作流依次：

- **prepare**（macOS）：核对发起人、仓库与 main；标签须在 main 历史中，包名、package／lock／plugin 版本与标签一致，发布说明存在；`npm ci`、完整构建、`npm test`、`npm run test:modules`；打包，检查必需文件存在且本机数据与源码工作区不进包；隔离目录全局安装，核对 `mdn --version` 并启动本地服务取到页面。
- **publish**（`npm-release` environment）：核对压缩包 SHA-256 后用 OIDC 可信发布，不保存 npm Token；版本已在 npm 时跳过，只补后续步骤；再向公共 registry 确认版本与 `latest`。
- **release**：用标签对应的发布说明创建 GitHub Release（`--verify-tag`，设为 Latest），附上同一个压缩包与 `.sha256`；已有同版本 Release 时更新正文与附件。

4. 核对：`npm view @vontean/minedesign version dist-tags`、`gh release view vX.Y.Z --repo Vontean/MineDesign`，报告中给出工作流与 Release 链接。本机安装 `npm install -g @vontean/minedesign@X.Y.Z && mdn plugin install` 后在 Codex 中实际打开，宿主验收单独报告。

## 首次发布（一次性）

npm 的可信发布只能绑在已存在的包上，所以第一个版本由本人在本机发布：

1. 跑一次只验证的工作流，下载它验证过的包：`gh run download <run-id> --repo Vontean/MineDesign -n minedesign-npm-package`。
2. 本人登录 npm 并发布该文件（需要 2FA）：`npm login`，`npm publish ./vontean-minedesign-X.Y.Z.tgz --access public`。
3. 绑定可信发布（npm 11.15.0 或更新，需要一次 2FA）：

```bash
npm trust github @vontean/minedesign --repository Vontean/MineDesign --file publish.yml --environment npm-release --allow-publish --yes
```

4. 再以 `publish=true` 运行工作流：npm 已有该版本时跳过发布，只确认 registry 并创建 GitHub Release。之后的版本全部走工作流。

## 授权边界

- 首次发起人的固定账号 ID、重跑人的账号名、仓库 ID 和 main 分支全部匹配才会继续；其他人发起或重跑在 prepare 即失败，拿不到发布权限。
- `npm-release` environment 仅允许 main 部署；npm 可信发布绑定本仓库、`publish.yml` 与该 environment。
- prepare 只读仓库，无 OIDC 权限；publish 只下载本次验证的产物、核对 SHA-256 后发布，不执行 package lifecycle；release 只有写 Release 的权限。
- 仓库为私有，npm 不生成 provenance；包本身公开。改变仓库可见性后可加 `--provenance`。
- 包按原始许可免费、非商业分发，`FORK.md` 随包携带完整许可，编辑器产物附 `third-party-licenses.txt`。不得收费分发或并入收费产品。

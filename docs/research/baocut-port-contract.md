# BaoCut 完整设计编辑器本地实验移植契约

研究对象：`7aa049e8`（当前上游 clone HEAD `29ab6bef`）。目标是本地实验版复用 BaoCut 的设计稿和设计系统编辑器，不执行上游代码。本文件列出最小闭包，源码均固定到该提交。

## 最小源码闭包

### 设计稿编辑器

必须保留以下四层：

1. `apps/design-editor/`：页面入口、Vite 构建、`artifact-type/dc-runtime.js`、Babel standalone、fast-edit worker、第三方许可文件。入口说明见 [`build.mjs`](https://github.com/JimLiu/baocut/blob/7aa049e8/apps/design-editor/build.mjs#L1-L115)。页面依赖 `@baocut/design`、`@baocut/design-runtime`，另需 `esbuild`、`vite`、React 18/ReactDOM 18 别名。
2. `packages/design-runtime/`：完整画布编辑器和运行时。其 package 依赖 React 19、Base UI、TanStack Virtual、CVA、clsx、dom-to-svg、happy-dom、jQuery、lodash.debounce、scheduler、tailwind-merge、usehooks-ts、Babel standalone。这里有约 22k 行 `design-canvas.tsx` 和 13k 行 CSS，不能只拷入口文件。
3. `packages/design/`：`canvas.json` v3 的布局/检查器、编辑器 dist 路径、宿主 shim；`packages/design/src/editor/index.ts` 将共享的 `connectEditorHost` 装为 `globalThis.designHost`，iframe 内另加 downloads bridge 和 frame `trustParent`。
4. `packages/slides/src/editor/`：共享的 HTTP 文件宿主、素材上传、SSE 外部变更、父窗口 postMessage、评论桥和提示注入桥。设计稿没有自己的文件协议；它复用 Slides 的 `SlidesHost`。

### 设计系统编辑器

1. `apps/design-system-editor/`：Vite 页面、预览 runner `artifact-type/run.html`、React 18 UMD、第三方许可文件。依赖 `@baocut/design-system`、`@baocut/design-system-runtime`，以及 Vite 和 React 18 别名。
2. `packages/design-system-runtime/`：tokens、字体、组件、资产、文件浏览和 preview 的完整运行时；依赖 React 19、Base UI、TanStack Virtual、CVA、clsx、tailwind-merge。
3. `packages/design-system/`：目录布局、识别、校验、editor dist 和 `design-system-host.ts`。`installDesignSystemEditorHost` 基于共享 `connectEditorHost`，再增加 `user.name()`（从 `__deck/session` 取 `userName`），并在 iframe 内安装 comment targets。
4. 同样必须带 `packages/slides/src/editor/`，因为设计系统的 `designSystemHost` 只筛选共享 host 的 artifact/self/user/assets/chat 能力。

证据：[`apps/design-system-editor/build.mjs`](https://github.com/JimLiu/baocut/blob/7aa049e8/apps/design-system-editor/build.mjs#L1-L76)、[`design/editor/index.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/design/src/editor/index.ts#L1-L41)、[`design-system/editor/index.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/design-system/src/editor/index.ts#L1-L66)。

## 宿主能力契约

设计稿运行时读取 `globalThis.designHost`，类型是共享 `SlidesHost` 加可选 `downloads`：

- `artifact.publish` / `self.publish`：批量写文件，带 `ifMatch` 并发校验；
- `user.id/canEdit/can/profiles`：权限和当前用户；
- `assets.upload`：按内容寻址上传，返回 `/_blob/<id>`；
- `comments.customAnchors`：iframe 内把元素锚点交给父窗口；
- `chat.suggestPrompt`：上游向 BaoCut 父窗口请求把修复提示放进输入框，失败时复制到剪贴板；MineDesign 需要适配到 Codex；
- `downloads`：仅 iframe 内存在，导出交给父窗口保存；单独打开时浏览器下载。

设计系统运行时读取 `globalThis.designSystemHost`：共享 artifact/self、user（另有 `name()`）、assets（只传 content type）、chat；不提供 comments/use/room/hot/db/downloads，运行时走单用户、文件模式和重新载入降级路径。完整说明见 [`design-host.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/design/src/editor/design-host.ts#L1-L29) 与 [`design-system-host.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/design-system/src/editor/design-system-host.ts#L1-L53)。

## HTTP、文件和发布协议

编辑器地址按种类发 grant：`/design/<grant>/`、`/design-system/<grant>/`。共享 server 路由如下：

| 路由 | 作用 | 关键约束 |
|---|---|---|
| `_files.json` | 文件清单 `{ver, files[path]={sha256,size,contentType}}` | 运行时按 `project/...` 路径读取 |
| `__deck/publish` | POST 批量写/删文件 | 同源、可编辑；base64 JSON；`ifMatch` 冲突整批拒绝 |
| `__deck/assets` | POST 二进制素材 | 同源、可编辑；内容寻址 blob |
| `__deck/events` | SSE 外部变更 | 编辑器先 flush 自己的改动，再 reload |
| `__deck/session` | GET `{canEdit,userName?}` | 设计系统使用 `userName` |
| `project/<path>` | GET/HEAD 文件 | `DATA_CSP`、`nosniff`、禁止越界 |
| `/_blob/<id>` | GET 内容寻址素材 | 按已打开 grant 的种类隔离 |

协议定义在 [`file-protocol.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/slides/src/file-protocol.ts#L19-L157)；宿主 fetch/发布在 [`editor-host.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/slides/src/editor/editor-host.ts#L1-L145)；路由与 grant、CSP、读写权限在 [`deck-routes.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/slides/src/deck-routes.ts#L256-L466)。

`SlidesServer` 必须以两套布局实例化：`CANVAS_LAYOUT` 给 `design`，`DESIGN_SYSTEM_LAYOUT` 给 `design-system`；同一真实目录按种类复用 grant 和 `DeckStore`，Agent 的素材导入也必须取同一个 store，避免与编辑器发布交错。`SlidesService` 的构造和 opener 见 [`slides.ts`](https://github.com/JimLiu/baocut/blob/7aa049e8/packages/runtime-core/src/slides.ts#L155-L214)。

## 父窗口消息

iframe 场景还需要 `packages/slides/src/editor-messages.ts` 定义的双向消息：`editor:compose` / `editor:threads` / `editor:set-mode` / `editor:reveal` 用于标注；`editor:suggest-prompt` 和 `editor:suggest-prompt-result` 用于 Agent 提示；`editor:flush` / `editor:flushed` 用于保存；`editor:external-change` 通知父窗口外部变更。`windowParentLink` 当前按 `event.source === window.parent` 约束，桌面 `file://` 父页不依赖 origin。

设计稿的 `installDesignEditorHost` 还将 `trustParent: true` 写入 `__FRAME_PREAMBLE`；这不是可省略的装饰，而是设计运行时 frame 协议允许父窗口请求导出能力的条件。设计系统没有 downloads，但仍需 comment targets 才能在 iframe 中显示标注目标。

## 构建与实验版接入顺序

最小可行的本地闭包顺序是：

1. 先复制/保留四个源码包与 `apps/*-editor`，并安装两套运行时的 package 依赖；设计编辑器要同时准备 React 19 页面和 React 18 画板 UMD。
2. 在 MineDesign Runtime 中实现/复用 grant + `SlidesServer` 路由，先让 `_files.json`、`project/*`、`__deck/session`、`__deck/publish`、`__deck/assets` 工作，再接 SSE。
3. 用 `packages/design/src/editor/index.ts` 和 `packages/design-system/src/editor/index.ts` 装 host，全局分别挂 `designHost`、`designSystemHost`，再启动各自 runtime。
4. 最后接 Codex 父窗口的 `postMessage`：至少实现 flush、suggest-prompt、下载和标注四组消息；若实验版先独立打开编辑器，可以先省略父窗口消息，但必须保留单独打开时的浏览器下载和 clipboard fallback。

## 来源与许可

当前计划限定为 MineDesign 本地实验版。BaoCut 的 `LICENSE` 是 BaoCut Community License 1.0：允许研究、实验和内部使用，但把 BaoCut 代码、引擎或修改版放进对外商业插件、SDK、平台、托管服务或付费分发需要另行书面商业许可。`THIRD_PARTY_NOTICES.md` 还要求随构建产物保留 React、Babel、dom-to-svg、happy-dom、jQuery 等第三方许可。实验版应在界面/源码保留 BaoCut 来源声明和第三方许可；后续若对外发布 MineDesign，先做许可证审查，再决定是取得许可、只做动态依赖，还是独立重写。

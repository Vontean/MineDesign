# 后端

`service.mjs` 是组合根；领域操作在 `documents.mjs`，编辑器传输在 `editor-relay.mjs`，工作区授权在 `workspace.mjs`。HTTP/MCP 适配器位于相邻 `interfaces/`。

- 操作返回普通数据或抛出错误；HTTP 状态、MCP 包装由接口层处理。
- 文件读写经 document-store 与两种 files 布局；保留 realpath、grant、origin、ifMatch 和批注版本契约。
- 持久化位置在组合根注入。测试用临时工作区，保留 examples 与用户批注。
- 跨层重构执行行为测试、模块测试和重构前后响应比较；流程见根 ARCHITECTURE.md。

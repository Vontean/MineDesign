# 前端

外壳从 `app.mjs` 进入；真实编辑器在 `apps/` 和 `packages/*-runtime`。修改前读取根 DESIGN.md。

- 页面负责用户状态和宿主交互，经 `service-client.mjs` 使用作品操作；MCP/HTTP 差异在 client 收敛。
- `virtual.mjs` 与 `frame-shim.js` 负责沙箱资源传输，不承担文件授权或持久化。
- 引用共享协议与视觉资源；浏览器依赖图由 architecture 测试约束。
- 回归覆盖打开、切换、失败重试、批注和显式发送；效果图规则见根 AGENTS.md。

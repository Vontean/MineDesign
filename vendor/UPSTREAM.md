# 上游来源

BaoCut: https://github.com/JimLiu/baocut

固定提交：7aa049e82e1367da013b7aba80f0b79033fa04ad

本目录由该提交选择性导入；保留 BaoCut 命名、原始版权和许可。MineDesign 的适配代码位于 vendor 之外。当前为本地实验，不代表已经获得商业分发许可。原运行时自述为设计类型的 TypeScript 重建；字体许可待确认，详见两个 runtime README。

## 本地补丁

- 根 npm overrides 将 happy-dom 更新到 21.0.4，修复安装时发现的 GHSA-834v-8h66-3h79；快速编辑仍关闭。
- Worker 浏览器适配补 domainToASCII，满足修复版 happy-dom 的 URL 接口。
- 保留上游 tsconfig.json，保证 JSX 按 react-jsx 编译。
- 编辑器外观仅在构建产物注入本地 theme adapter，不改用户画板。

- React 18 UMD 改从 MineDesign 独立 preview-react18 workspace 读取，替代 npm alias；编辑器与其依赖统一使用根 React 19。
- 两个编辑器入口（apps/*-editor/src/main.ts）读取 `globalThis.__MDN_FRAME__.base` 作为路由根：Codex 沙箱禁止访问本地 HTTP，编辑器改为 srcdoc 装载，`location.href` 是 `about:srcdoc`，无法推算路由根。未设置时行为与上游相同。
- CDS 图标组件（design-runtime `cds/components/icon.tsx` 与 design-system-runtime `ui/interactions.tsx`）在字形有 Lucide 对照时改画 SVG，对照表为新增的 `cds/components/lucide-icons.ts`；带动画的字形与未对照的字形仍走 Anthropicons 字体。线宽由外壳注入的 `--mdn-icon-stroke` 控制。

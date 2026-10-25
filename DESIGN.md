# MineDesign 设计契约

## 目标与来源

第一版沿用 BaoCut 的完整画布、属性面板、设计系统章节和批注交互，先验证移植效果再定制。插件外壳与编辑器 chrome 接近 Codex。用户创作的画板、品牌颜色和设计系统 tokens 不随插件外观改变。

颜色与系统字体的来源是当前 MCX Dashboard 本地快照（其文档依据为 Codex 26.1007.21159），本次核对了 MCX 源码与设计说明，未重新测量当前 Codex GUI。它们作为 MineDesign 自己的版本化值，不是对当前宿主外观的实时声明。

## Token 权威来源

`assets/tokens.css` 是数值唯一来源。浅色页面 #ffffff、次级表面 #f7f7f7、浮层 #ffffff，文字 #0d0d0d；深色页面 #181818、次级表面 #141414、浮层 #2d2d2d，文字 #ffffff。次级与三级文字、边缘、成功与错误色同步采用该快照。

系统字体为 -apple-system、BlinkMacSystemFont、Segoe UI、sans-serif；正文 14px，紧凑控件 13px，章节标题 16px，字重 400/500/600。字号来源与 MCX 一致；编辑器原有密度不统一放大。

## 本地选型

插件外壳控件高 32px，编辑器图标控件沿用上游几何。外壳小圆角 8px、面板 12px，间距 4/8/12/16/24px。以上尺寸为 MineDesign 提案，不冒充原生测量值。焦点使用 #3a83f7；浮层采用轻投影。按钮禁用时不响应；所有新增表单可用键盘操作。

不新增装饰性渐变、品牌大标题或无任务用途的状态卡。顶栏提供作品切换、批注、明暗和真实状态；批注在侧栏管理，避免覆盖主要画板。窄屏侧栏折叠为抽屉。

## 主题与隔离

所有 `--md-*` 取值随包发布。宿主仅选择 light/dark，缺少宿主时跟随系统，支持用户切换。不得从父窗口读取计算样式、订阅 Codex 内部模块或依赖 MCX 进程。

`assets/editor-theme.css` 仅在编辑器文档映射 CDS chrome 语义。不得向画板 iframe 注入 MineDesign 配色，不得修改设计系统的用户 tokens。上游未覆盖的控件保持原行为，逐项验证后再调整。

动效保留上游操作反馈；新增外壳不做入场动画，reduced-motion 时关闭非必要过渡。首版保留上游图标与来源声明，分发许可待确认的字体不作为本轮外部分发材料。

## 品牌与图标

MineDesign 缩写 MDN，npm 包 minedesign 的命令为 mdn。生产图标源为 assets/brand/minedesign-icon.svg，生成流程与几何依据见 assets/brand/README.md。保留 MCX 外圈原路径及 translate(6.24 6.24) scale(.48)，使用同一原生 Lucide 资源中的 brush 实心轮廓。默认状态为环 + 实心画笔，选中状态为实心外形 + 透明画笔孔。

内联与 mask 使用 currentColor，独立浅色/深色资源分别采用 MCX 的 #0d0d0d / #fafafa。图标不能通过白色画笔模拟镂空。MCP 标准主题 icons 与插件自定义状态资源分开：提供选中资源不等于宿主已自动使用它。

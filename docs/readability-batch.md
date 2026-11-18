# 可读化批次的做法

本文是给执行可读化批次的 Agent 读的工作说明。背景与进度见 [runtime-modules.md](runtime-modules.md) 的"可读化"一节。

## 目标

还原代码里的局部名字是机器生成的（`value153`、`callback7`、`items2`），类型多为 `Dynamic`（即 any）。一个批次负责若干文件，把其中**全部机器名的局部绑定**改成有意义的名字，并在把握充分的地方补上类型。行为必须完全不变。

## 工具

- `node scripts/rename-bindings.mjs list <文件> [--from 行 --to 行]`：列出文件里机器名的绑定。每行是：键（`名字@行:列`）、种类、所在函数、引用数、声明行、前几处用法。
- `node scripts/rename-bindings.mjs apply <改名表.json> --write`：按改名表改名。改名表格式 `{"<文件路径>": {"<键>": "新名字"}}`，键可以只写 `名字@行`（同一行有同名时要带列号）。工具按作用域改名：声明、引用、赋值、对象简写、导入导出都会正确处理；导出名与导入名保持不变（自动写成 `新名 as 旧名`）。新名字与作用域内已有名字冲突时，工具拒绝这一条并说明原因，其余照常应用。
- `node scripts/check-equivalence.mjs <文件...>`：证明改动前后编译结果 α 等价（去掉类型、统一局部名后逐字相同）。必须全部显示 ✓。
- `node scripts/readability.mjs --files`：可读化进度。

## 每个文件的步骤

1. 读文件，理解每个函数在做什么。用 `list` 拿到待改名的绑定；文件很长时按函数分段（`--from/--to`）处理。
2. 写改名表（放在 `output/readability/<批次>/` 下，不入库），一次可以覆盖整个文件或一个函数。
3. `apply --write`，处理工具报告的冲突（换一个名字再应用）。重复 1–3，直到 `list` 不再列出机器名。
4. 在把握充分的地方补类型：把 `Dynamic` 换成准确的类型（优先复用同包 `contracts/`、`types.ts` 里已有的类型，或从初始化值、调用方式看出来的基本类型）。类型不改变运行结果，但不能让 tsc 报错增加。拿不准就保留 `Dynamic`，不要硬写。
5. `check-equivalence` 这个文件，必须 ✓。

## 命名规则

- 英文 camelCase，说明它是什么或做什么：`selectedArtboard`、`pointerStart`、`isDragging`、`handleKeyDown`、`setExportProgress`。布尔值用 `is/has/should/can` 开头；React 的 state 与 setter 成对命名（`[zoom, setZoom]`）；ref 以 `Ref` 结尾；回调以动词开头。
- 同一个函数里的名字要互相一致：同一个概念用同一个词。
- 不要用 `data`、`temp`、`obj`、`val`、`result2` 这类没有信息的名字；循环变量、极短的匿名回调参数可以用 `item`、`index`、`event` 这类惯用名。
- 名字要反映代码实际做的事，不要凭函数名猜测；看不懂的绑定宁可用保守的描述性名字（例如 `framePayload`），并在报告里列出。
- 不改导出名、不改对象属性名、不改字符串、不改逻辑。`deps.value153` 这类依赖对象的属性名属于另一阶段，不在批次范围内。

## 禁止的事

- 不手工改代码逻辑、不调整结构、不删除代码；改名只用 `apply`。补类型、加注释可以手工编辑，但每个文件最后都要通过 `check-equivalence`。
- 不运行 `npm run build`、基线或全量测试（由负责人统一运行），不 commit、不 push、不切换分支。
- 只改分配给你的文件。

## 完成后报告

- 每个文件：改名数、剩余的机器名（应为 0，若不为 0 说明原因）、是否补了类型。
- 你最没把握的命名（文件、原名、新名、原因）。
- 阅读中发现的疑似缺陷（只记录，不修）。
- `check-equivalence` 对全部负责文件的输出，以及 tsc 错误数在改动前后的变化（`npx tsc -p tsconfig.json --noEmit 2>&1 | grep -c "error TS"`，只在开始和结束各跑一次）。

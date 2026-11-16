import { parseDcHtmlDocument } from "../html/dc-document";
import { getDcPropsJson } from "../html/dc-props";

export type UndoDirection = "undo" | "redo";

/** 提交前的活值记录；had 为 false 表示提交前没有这个值。 */
export interface LiveBefore {
  had: boolean;
  value?: string;
}

/** 单个 data-props 默认值的编辑记录。 */
export interface PropUndoEntry {
  kind: "prop";
  prop: string;
  before?: string;
  after: string;
  base: string;
  display: string;
  liveBefore?: LiveBefore;
}

/** 组件脚本的编辑记录。 */
export interface ScriptUndoEntry {
  kind: "script";
  before?: string;
  after: string;
  base: string;
}

/** 撤销栈条目；字符串是整份模板的序列化快照。 */
export type UndoEntry = string | PropUndoEntry | ScriptUndoEntry;

/** 历史算法读写的会话字段。 */
export interface UndoHistoryState {
  src: string;
  undo: UndoEntry[];
  redo: UndoEntry[];
  undoFloor?: number;
  pendingProps?: Record<string, string> | undefined;
  pendingPropsBase?: string | undefined;
  pendingScript?: string | undefined;
  pendingScriptBase?: string | undefined;
}

/** 活值的覆盖表，用来判断预览里的值是否已被别处改过。 */
export interface UndoLiveContext {
  overrides?: Record<string, unknown>;
}

export interface PropUndoResult {
  kind: "prop";
  prop: string;
  liveValue: string | undefined;
  episode: "closed" | "reopened" | null;
}

export interface ScriptUndoResult {
  kind: "script";
  js: string | undefined;
}

export interface AppliedUndoEntry {
  result: PropUndoResult | ScriptUndoResult;
  /** 放进对侧栈的条目 */
  twin: PropUndoEntry | ScriptUndoEntry;
}

/** 连续编辑合并所需的上一次编辑信息。 */
export interface OpenUndoEdit {
  name: unknown;
  key: unknown;
  at: number;
}

export function trimUndoHistory(state: UndoHistoryState, count: number): void {
  const removed = state.undo.splice(0, Math.max(0, count)).length;
  state.undoFloor = (state.undoFloor ?? 0) + removed;
}

export function resetUndoHistory(state: UndoHistoryState): void {
  state.undoFloor = (state.undoFloor ?? 0) + state.undo.length;
  state.undo = [];
  state.redo = [];
}

/** 读取源码里 data-props 声明的某个属性的默认值。 */
export function dcPropValue(src: string, propName: string): string | undefined {
  const json = getDcPropsJson(src);
  if (json == null) return undefined;
  try {
    const props = JSON.parse(json);
    if (props == null || typeof props != "object" || Array.isArray(props)) return undefined;
    const declared = Object.hasOwn(props, propName) ? props[propName] : undefined;
    if (declared == null || typeof declared != "object") return undefined;
    const defaultValue = declared.default;
    return typeof defaultValue == "string" ? defaultValue : undefined;
  } catch {
    return undefined;
  }
}

export function applyPendingUndoEntry(
  state: UndoHistoryState,
  entry: PropUndoEntry | ScriptUndoEntry,
  direction: UndoDirection,
  live?: UndoLiveContext,
): AppliedUndoEntry | null {
  return entry.kind === "prop"
    ? applyPendingPropUndo(state, entry, direction, live)
    : applyPendingScriptUndo(state, entry, direction);
}

function propResult(
  prop: string,
  liveValue: string | undefined,
  episode: PropUndoResult["episode"],
): PropUndoResult {
  return { kind: "prop", prop, liveValue, episode };
}

export function applyPendingPropUndo(
  state: UndoHistoryState,
  entry: PropUndoEntry,
  direction: UndoDirection,
  live?: UndoLiveContext,
): AppliedUndoEntry | null {
  const pendingProps = state.pendingProps;
  const fallbackBefore = entry.before ?? entry.display;
  if (pendingProps !== undefined && Object.hasOwn(pendingProps, entry.prop)) {
    const pendingValue = pendingProps[entry.prop];
    if (direction === "undo") {
      if (pendingValue !== entry.after) return null;
      if (entry.before !== undefined) {
        state.pendingProps = { ...pendingProps, [entry.prop]: entry.before };
        return { result: propResult(entry.prop, entry.before, null), twin: entry };
      }
      if (entry.base !== state.pendingPropsBase) {
        state.pendingProps = { ...pendingProps, [entry.prop]: entry.display };
        return {
          result: propResult(entry.prop, entry.display, null),
          twin: {
            kind: "prop",
            prop: entry.prop,
            before: entry.display,
            after: entry.after,
            base: state.pendingPropsBase ?? entry.base,
            display: entry.display,
          },
        };
      }
      const remaining = { ...pendingProps };
      delete remaining[entry.prop];
      if (Object.keys(remaining).length === 0) {
        state.pendingProps = undefined;
        state.pendingPropsBase = undefined;
      } else {
        state.pendingProps = remaining;
      }
      const liveBefore = entry.liveBefore ?? { had: false };
      return {
        result: propResult(entry.prop, liveBefore.had ? liveBefore.value : undefined, "closed"),
        twin: entry,
      };
    }
    if (entry.before === undefined) {
      if (pendingValue !== entry.display) return null;
      state.pendingProps = { ...pendingProps, [entry.prop]: entry.after };
      return {
        result: propResult(entry.prop, entry.after, null),
        twin: {
          kind: "prop",
          prop: entry.prop,
          before: entry.display,
          after: entry.after,
          base: state.pendingPropsBase ?? entry.base,
          display: entry.display,
        },
      };
    }
    if (pendingValue !== entry.before) return null;
    state.pendingProps = { ...pendingProps, [entry.prop]: entry.after };
    return { result: propResult(entry.prop, entry.after, null), twin: entry };
  }
  if (direction === "redo" && entry.before === undefined) {
    const overrides = live?.overrides;
    if (
      overrides !== undefined &&
      Object.hasOwn(overrides, entry.prop) &&
      overrides[entry.prop] !== entry.display &&
      overrides[entry.prop] !==
        (entry.liveBefore?.had === true ? entry.liveBefore.value : undefined)
    )
      return null;
    if (dcPropValue(state.src, entry.prop) !== entry.after) {
      state.pendingPropsBase ??= getDcPropsJson(state.src) ?? entry.base;
      state.pendingProps = { ...pendingProps, [entry.prop]: entry.after };
      return { result: propResult(entry.prop, entry.after, "reopened"), twin: entry };
    }
  }
  const sourceValue = dcPropValue(state.src, entry.prop);
  const expected = direction === "undo" ? entry.after : fallbackBefore;
  if (sourceValue === undefined || sourceValue !== expected) return null;
  const overrides = live?.overrides;
  if (overrides !== undefined && Object.hasOwn(overrides, entry.prop) && overrides[entry.prop] !== expected)
    return null;
  const target = direction === "undo" ? fallbackBefore : entry.after;
  const base = (state.pendingPropsBase ??= getDcPropsJson(state.src) ?? "");
  state.pendingProps = { ...pendingProps, [entry.prop]: target };
  return {
    result: propResult(entry.prop, target, "reopened"),
    twin: {
      kind: "prop",
      prop: entry.prop,
      before: fallbackBefore,
      after: entry.after,
      base,
      display: fallbackBefore,
    },
  };
}

export function applyPendingScriptUndo(
  state: UndoHistoryState,
  entry: ScriptUndoEntry,
  direction: UndoDirection,
): AppliedUndoEntry | null {
  const fallbackBefore = entry.before ?? entry.base;
  if (state.pendingScript !== undefined) {
    if (direction === "undo") {
      if (state.pendingScript !== entry.after) return null;
      if (entry.before === undefined && entry.base !== state.pendingScriptBase) {
        state.pendingScript = entry.base;
        return {
          result: { kind: "script", js: entry.base },
          twin: {
            kind: "script",
            before: entry.base,
            after: entry.after,
            base: state.pendingScriptBase ?? entry.base,
          },
        };
      }
      state.pendingScript = entry.before;
      if (entry.before === undefined) state.pendingScriptBase = undefined;
      return { result: { kind: "script", js: fallbackBefore }, twin: entry };
    }
    if (entry.before === undefined && state.pendingScript === entry.base) {
      state.pendingScript = entry.after;
      return {
        result: { kind: "script", js: entry.after },
        twin: {
          kind: "script",
          before: entry.base,
          after: entry.after,
          base: state.pendingScriptBase ?? entry.base,
        },
      };
    }
    if (state.pendingScript !== entry.before) return null;
    state.pendingScript = entry.after;
    return { result: { kind: "script", js: entry.after }, twin: entry };
  }
  const sourceScript: string | undefined = parseDcHtmlDocument(state.src)?.js;
  if (direction === "redo" && entry.before === undefined && sourceScript !== entry.after) {
    if (sourceScript !== entry.base) return null;
    state.pendingScriptBase ??= entry.base;
    state.pendingScript = entry.after;
    return { result: { kind: "script", js: entry.after }, twin: entry };
  }
  if (sourceScript === undefined) return null;
  const expected = direction === "undo" ? entry.after : fallbackBefore;
  if (sourceScript !== expected) return null;
  const target = direction === "undo" ? fallbackBefore : entry.after;
  const base = (state.pendingScriptBase ??= sourceScript);
  state.pendingScript = target;
  return {
    result: { kind: "script", js: target },
    twin: {
      kind: "script",
      before: fallbackBefore,
      after: entry.after,
      base,
    },
  };
}

/** 判断一次编辑能否并入上一次连续编辑。 */
export function canContinueUndoEdit(
  open: OpenUndoEdit | null,
  name: unknown,
  key: unknown,
  now: number,
  windowMs: number,
  value: unknown,
): boolean {
  return (
    open !== null &&
    open.name === name &&
    open.key === key &&
    now - open.at < windowMs &&
    typeof value == "string"
  );
}

/** 新条目能并入栈顶就合并，否则入栈、裁剪并清空重做栈。 */
export function combineUndoEntry(
  state: UndoHistoryState,
  entry: PropUndoEntry | ScriptUndoEntry,
  options: { continues: boolean; limit: number },
): "coalesced" | "pushed" {
  const top = state.undo[state.undo.length - 1];
  if (
    options.continues &&
    top !== undefined &&
    typeof top != "string" &&
    top.kind === entry.kind &&
    (entry.kind !== "prop" || (top as PropUndoEntry).prop === entry.prop) &&
    top.after === entry.before
  ) {
    top.after = entry.after;
    return "coalesced";
  }
  state.undo.push(entry);
  trimUndoHistory(state, state.undo.length - options.limit);
  state.redo = [];
  return "pushed";
}

/** 从两个栈里移除指定属性的条目，返回是否有变化。 */
export function removePropUndoEntries(state: UndoHistoryState, props: string[]): boolean {
  const isTargeted = (entry: UndoEntry): boolean =>
    typeof entry != "string" && entry.kind === "prop" && props.includes(entry.prop);
  const undo = state.undo.filter((entry) => !isTargeted(entry));
  const redo = state.redo.filter((entry) => !isTargeted(entry));
  const changed = undo.length !== state.undo.length || redo.length !== state.redo.length;
  if (changed) {
    state.undo = undo;
    state.redo = redo;
  }
  return changed;
}

/** 统计还没有对应撤销条目的待提交修改数。 */
export function countPendingUndoEntries(state: UndoHistoryState): number {
  let count = 0;
  if (
    !state.undo.some((entry) => typeof entry != "string" && entry.kind === "script") &&
    state.pendingScript !== undefined &&
    state.pendingScript !== state.pendingScriptBase
  )
    count += 1;
  for (const prop of Object.keys(state.pendingProps ?? {}))
    if (!state.undo.some((entry) => typeof entry != "string" && entry.kind === "prop" && entry.prop === prop))
      count += 1;
  return count;
}

import { beforeAll, expect, it } from "vitest";
import {
  applyPendingPropUndo,
  applyPendingScriptUndo,
  canContinueUndoEdit,
  combineUndoEntry,
  countPendingUndoEntries,
  removePropUndoEntries,
  resetUndoHistory,
  type PropUndoEntry,
  type UndoHistoryState,
} from "./history";
import { installEditorHtmlDcDocument } from "../html/dc-document";
import { installEditorHtmlDcProps } from "../html/dc-props";
import { installEditorHtmlEscaping } from "../html/escaping";

beforeAll(() => {
  installEditorHtmlEscaping()();
  installEditorHtmlDcDocument()();
  installEditorHtmlDcProps()();
});

const src = `<x-dc></x-dc><script type="text/x-dc" data-dc-script data-props="{&quot;title&quot;:{&quot;default&quot;:&quot;old&quot;}}">js0</script>`;
const state = (extra: Partial<UndoHistoryState> = {}): UndoHistoryState => ({ src, undo: [], redo: [], ...extra });
const propEntry = (patch: Partial<PropUndoEntry> = {}): PropUndoEntry => ({
  kind: "prop", prop: "title", before: "old", after: "new", base: "{}", display: "old", ...patch,
});

it('连续编辑同一属性时并入栈顶；换属性则入栈并清空重做栈', () => {
  const s = state({ redo: ["snapshot"] });
  expect(combineUndoEntry(s, propEntry({ after: "a" }), { continues: false, limit: 10 })).toBe('pushed');
  expect(s.redo).toEqual([]);
  expect(combineUndoEntry(s, propEntry({ before: "a", after: "b" }), { continues: true, limit: 10 })).toBe('coalesced');
  expect((s.undo[0] as PropUndoEntry).after).toBe("b");
  expect(combineUndoEntry(s, propEntry({ prop: "other", before: "b", after: "c" }), { continues: true, limit: 10 })).toBe('pushed');
  expect(s.undo).toHaveLength(2);
});

it('超过上限时丢弃最旧的条目并累计 undoFloor', () => {
  const s = state();
  for (let i = 0; i < 4; i++) combineUndoEntry(s, propEntry({ prop: `p${i}` }), { continues: false, limit: 2 });
  expect(s.undo.map((e) => (e as PropUndoEntry).prop)).toEqual(["p2", "p3"]);
  expect(s.undoFloor).toBe(2);
  resetUndoHistory(s);
  expect(s).toMatchObject({ undo: [], redo: [], undoFloor: 4 });
});

it('源码里的属性默认值等于条目的 after 时，撤销写入待提交的 before', () => {
  const s = state();
  const result = applyPendingPropUndo(s, propEntry({ after: "old", before: "x", display: "x" }), "undo");
  expect(result?.result).toEqual({ kind: "prop", prop: "title", liveValue: "x", episode: "reopened" });
  expect(s.pendingProps).toEqual({ title: "x" });
  // 源码值与条目不符时拒绝应用
  expect(applyPendingPropUndo(state(), propEntry({ after: "zzz" }), "undo")).toBeNull();
});

it('脚本撤销与重做在待提交脚本上往返', () => {
  const s = state({ pendingScript: "js1", pendingScriptBase: "js0" });
  const entry = { kind: "script" as const, before: "js0", after: "js1", base: "js0" };
  expect(applyPendingScriptUndo(s, entry, "undo")?.result).toEqual({ kind: "script", js: "js0" });
  expect(s.pendingScript).toBe("js0");
  expect(applyPendingScriptUndo(s, entry, "redo")?.result).toEqual({ kind: "script", js: "js1" });
});

it('移除属性条目与统计待提交修改', () => {
  const s = state({ undo: [propEntry(), propEntry({ prop: "b" }), "snapshot"], redo: [propEntry()] });
  expect(removePropUndoEntries(s, ["title"])).toBe(true);
  expect(s.undo).toHaveLength(2);
  expect(removePropUndoEntries(s, ["title"])).toBe(false);
  // title 没有撤销条目，算一项待提交修改；脚本待提交修改再算一项
  const t = state({ pendingProps: { title: "x" }, pendingScript: "js1", pendingScriptBase: "js0" });
  expect(countPendingUndoEntries(t)).toBe(2);
});

it('只有同名、同 key、时间窗口内且值为字符串才继续编辑', () => {
  const open = { name: "n", key: "k", at: 100 };
  expect(canContinueUndoEdit(open, "n", "k", 200, 500, "v")).toBe(true);
  expect(canContinueUndoEdit(open, "n", "k", 700, 500, "v")).toBe(false);
  expect(canContinueUndoEdit(open, "n", "k", 200, 500, 1)).toBe(false);
  expect(canContinueUndoEdit(null, "n", "k", 200, 500, "v")).toBe(false);
});

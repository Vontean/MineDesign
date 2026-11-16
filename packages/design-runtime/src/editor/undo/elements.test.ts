import { beforeAll, expect, it } from "vitest";
import {
  applyElementUndo,
  modelHistoryCompatibility,
  UndoElementsTest,
  validatePastedAttributeEdits,
  type ElementUndoState,
  type UndoElementModel,
} from "./elements";
import { installPlatformImageUpload } from "../../platform/image-upload";

// blob 路径的正则由 image-upload 的初始化函数提供
beforeAll(() => installPlatformImageUpload()());

class FakeModel implements UndoElementModel {
  constructor(readonly id: string) {}
  serialize() { return `snap:${this.id}`; }
  rebuild(snapshot: string) { return new FakeModel(snapshot); }
  sameSkeleton(other: UndoElementModel) { return (other as FakeModel).id.length === this.id.length; }
}
const state = (undo: ElementUndoState["undo"], redo: ElementUndoState["redo"] = []): ElementUndoState => ({
  src: "", undo, redo, model: new FakeModel("m1"), liveStampsStale: true, previewBaseline: {},
});

it('撤销整份模板快照：当前模型进入重做栈，预览基线失效', () => {
  const s = state(["older"]);
  expect(applyElementUndo(s, "undo")).toEqual({ kind: "template" });
  expect(s.undo).toEqual([]);
  expect(s.redo).toEqual(["snap:m1"]);
  expect((s.model as FakeModel).id).toBe("older");
  expect(s.liveStampsStale).toBe(false);
  expect(s.previewBaseline).toBeUndefined();
});

it('栈为空时返回 null', () => {
  expect(applyElementUndo(state([]), "undo")).toBeNull();
  expect(applyElementUndo(state([]), "redo")).toBeNull();
});

it('撤销无法应用时丢弃该条并清空重做栈；重做失败不清空', () => {
  const entry = { kind: "script" as const, before: "a", after: "b", base: "a" };
  const s = state([entry], ["x"]);
  expect(applyElementUndo(s, "undo")).toBeNull();
  expect(s.undo).toEqual([]);
  expect(s.redo).toEqual([]);
  const r = state([], [entry]);
  r.undo = ["keep"];
  expect(applyElementUndo(r, "redo")).toBeNull();
  expect(r.undo).toEqual(["keep"]);
});

it('模型历史兼容：同一个、结构相同、结构不同', () => {
  const a = new FakeModel("ab");
  expect(modelHistoryCompatibility(a, a)).toBe("same");
  expect(modelHistoryCompatibility(a, new FakeModel("cd"))).toBe("keep");
  expect(modelHistoryCompatibility(a, new FakeModel("abc"))).toBe("clear");
});

it('粘贴的属性：src 只接受相对资源或上传资源，尺寸只接受 1 到 5 位数字', () => {
  expect(validatePastedAttributeEdits({ src: "./a.png", width: "120", height: null })).toBe(true);
  expect(validatePastedAttributeEdits({ src: "https://x.com/a.png" })).toBe(false);
  expect(validatePastedAttributeEdits({ width: "123456" })).toBe(false);
  expect(validatePastedAttributeEdits({ srcset: "a 2x" })).toBe(false);
  expect(validatePastedAttributeEdits({ style: null })).toBe(false);
});

it('UndoElementsTest 接受相对路径与 _blob 资源', () => {
  expect(UndoElementsTest("./img-1.png")).toBe(true);
  expect(UndoElementsTest("/_blob/" + "a".repeat(32))).toBe(true);
  expect(UndoElementsTest("../x.png")).toBe(false);
});

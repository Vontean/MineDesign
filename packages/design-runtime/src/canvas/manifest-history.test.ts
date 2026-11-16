import { beforeAll, expect, it } from "vitest";
import {
  applyCanvasManifestHistory,
  applyCanvasPageHistory,
  artboardOrderHistoryStep,
  canvasHistoryAnnouncementMode,
  changedObjectKeys,
  compatibleRestoredCanvasLaunch,
  defaultCanvasPage,
  reconcileCanvasManifestHistory,
  repairCanvasLaunchAfterDeletion,
  type CanvasManifest,
} from "./manifest-history";
import { installPlatformDocumentValues } from "../platform/document-values";
import { installPlatformFileContent } from "../platform/file-content";

// 页数上限、批注上限等常量由 file-content 的初始化函数提供
beforeAll(() => {
  installPlatformDocumentValues()();
  installPlatformFileContent()();
});

const board = (file: string, x = 0, y = 0) => ({ file, x, y, w: 100, h: 100 });
const manifest = (): CanvasManifest => ({ artboards: [board("a.dc.html"), board("b.dc.html", 200, 0)] });

it('移动画板：撤销回到 from，重做回到 to', () => {
  const step = { kind: "move" as const, moves: [{ file: "a.dc.html", from: { x: 0, y: 0 }, to: { x: 50, y: 60 } }] };
  const moved = applyCanvasManifestHistory(manifest(), step, "redo") as CanvasManifest;
  expect(moved.artboards[0]).toMatchObject({ x: 50, y: 60 });
  const back = applyCanvasManifestHistory(moved, step, "undo") as CanvasManifest;
  expect(back.artboards[0]).toMatchObject({ x: 0, y: 0 });
});

it('改名为空时清除标题；纸张设置为空时去掉 paper 字段', () => {
  const m = { artboards: [{ ...board("a.dc.html"), title: "旧", paper: "a4" }] };
  const renamed = applyCanvasManifestHistory(m, { kind: "rename", file: "a.dc.html", from: "旧", to: undefined }, "redo") as CanvasManifest;
  expect(renamed.artboards[0].title).toBeUndefined();
  const noPaper = applyCanvasManifestHistory(m, { kind: "paper", file: "a.dc.html", from: "a4", to: undefined }, "redo") as CanvasManifest;
  expect("paper" in noPaper.artboards[0]).toBe(false);
});

it('批注：撤销删除会把它放回原位置；已存在时返回 nothing', () => {
  const spec = { id: "n2", kind: "note", x: 0, y: 0 };
  const m = { ...manifest(), annotations: [{ id: "n1", kind: "note" }, { id: "n3", kind: "note" }] };
  const restored = applyCanvasManifestHistory(m, { kind: "ann-delete", spec, index: 1 }, "undo") as CanvasManifest;
  expect(restored.annotations?.map((a) => a.id)).toEqual(["n1", "n2", "n3"]);
  expect(applyCanvasManifestHistory(restored, { kind: "ann-delete", spec, index: 1 }, "undo")).toBe("nothing");
});

it('新增页面的撤销只在页面上没有画板时才生效', () => {
  const page = { id: "p2", name: "B" };
  const m: CanvasManifest = { artboards: [], pages: [{ ...defaultCanvasPage }, page] };
  expect(applyCanvasPageHistory(m, { kind: "page-add", page }, "undo")).toEqual({ pages: [{ id: "page-1", name: "Page 1" }] });
  const used: CanvasManifest = { ...m, artboards: [{ ...board("a.dc.html"), page: "p2" }] };
  expect(applyCanvasPageHistory(used, { kind: "page-add", page }, "undo")).toBeNull();
});

it('调整画板顺序后，撤销恢复原顺序；顺序未变时返回 nothing', () => {
  const m = { artboards: [board("a"), board("b"), board("c")] };
  const reordered = { artboards: [m.artboards[2], m.artboards[0], m.artboards[1]] };
  const step = artboardOrderHistoryStep(m.artboards, reordered.artboards);
  const undone = applyCanvasManifestHistory(reordered, step, "undo") as CanvasManifest;
  expect(undone.artboards.map((b) => b.file)).toEqual(["a", "b", "c"]);
  expect(applyCanvasManifestHistory(m, step, "undo")).toBe("nothing");
});

it('未知步骤类型会报错', () => {
  expect(() => applyCanvasManifestHistory(manifest(), { kind: "bogus" } as never, "undo")).toThrow(/cannot be undone/);
});

it('三方合并：保留当前清单里别人新增的画板，并带上撤销结果', () => {
  const before = { artboards: [board("a")] };
  const after = { artboards: [board("a"), board("b")] };
  expect(reconcileCanvasManifestHistory(before, before, after).artboards.map((b) => b.file)).toEqual(["a", "b"]);
  const current = { artboards: [board("a"), board("z")] };
  expect(reconcileCanvasManifestHistory(current, before, after).artboards.map((b) => b.file)).toEqual(["a", "z", "b"]);
});

it('启动视图与播报方式的小规则', () => {
  expect(repairCanvasLaunchAfterDeletion({ artboards: [board("a")], launch: { view: "focused", file: "a" } }, new Set(["a"]))).toEqual({ view: "focused", file: "a" });
  expect(compatibleRestoredCanvasLaunch({ view: "canvas", page: "p" }, { view: "canvas" })).toEqual({ view: "canvas", page: "p" });
  expect(compatibleRestoredCanvasLaunch({ view: "canvas" }, { view: "canvas", page: "p" })).toBeUndefined();
  expect(canvasHistoryAnnouncementMode("redo", true, false)).toBe("partner");
  expect(canvasHistoryAnnouncementMode("undo", true, true)).toBe("silent");
  expect(changedObjectKeys({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 })).toEqual(["b", "c"]);
});

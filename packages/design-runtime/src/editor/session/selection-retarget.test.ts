import { describe, expect, it } from "vitest";
import { keyConsumesSelectionSync, retargetedSelection } from "./selection-retarget";

describe("retargetedSelection", () => {
  const previous = { name: "root", tids: ["a"], tag: "div" };
  const tagOf = (tid: string) => (tid === "b" ? "span" : undefined);

  it("非根画板或空列表不重定向", () => {
    expect(retargetedSelection(previous, "other", ["b"], tagOf)).toBeNull();
    expect(retargetedSelection(previous, "root", [], tagOf)).toBeNull();
    expect(retargetedSelection(null, "root", ["b"], tagOf)).toBeNull();
  });
  it("tid 变化时改指向并更新标签", () => {
    const result = retargetedSelection(previous, "root", ["b"], tagOf);
    expect(result?.changed).toBe(true);
    expect(result?.selection).toEqual({ name: "root", tids: ["b"], tag: "span" });
  });
  it("tid 相同返回未变化；查不到标签保留旧标签", () => {
    const result = retargetedSelection(previous, "root", ["a"], tagOf);
    expect(result?.changed).toBe(false);
    expect(result?.selection.tag).toBe("div");
  });
});

describe("keyConsumesSelectionSync", () => {
  const modifiers = new Set(["Shift", "Meta"]);
  it("普通按键消耗，修饰键与长按不消耗", () => {
    expect(keyConsumesSelectionSync({ key: "a" }, modifiers)).toBe(true);
    expect(keyConsumesSelectionSync({ key: "Shift" }, modifiers)).toBe(false);
    expect(keyConsumesSelectionSync({ key: "a", repeat: true }, modifiers)).toBe(false);
  });
});

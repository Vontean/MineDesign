import { describe, expect, it } from "vitest";
import { createSelectionWriters, notePendingHighlightAtSequence } from "./selection-state";

function makeRefs() {
  return {
    selectionRef: { current: { name: "a", tids: [1] } as unknown },
    selectionSequenceRef: { current: 3 },
    pendingSelectionRef: { current: null as unknown },
    clearedSelectionSequenceRef: { current: -1 },
    shouldSyncPickerSelectionRef: { current: false },
  };
}

describe("createSelectionWriters", () => {
  it("advanceSelectionSequence 推进并返回新序号，不动其他 ref", () => {
    const refs = makeRefs();
    const w = createSelectionWriters(refs);
    expect(w.advanceSelectionSequence()).toBe(4);
    expect(refs.selectionSequenceRef.current).toBe(4);
    expect(refs.selectionRef.current).not.toBeNull();
    expect(refs.clearedSelectionSequenceRef.current).toBe(-1);
  });

  it("clearSelectionRef 只清空选区引用", () => {
    const refs = makeRefs();
    createSelectionWriters(refs).clearSelectionRef();
    expect(refs.selectionRef.current).toBeNull();
    expect(refs.selectionSequenceRef.current).toBe(3);
  });

  it("invalidateSelection 推进序号并清空引用，不记录清除序号", () => {
    const refs = makeRefs();
    createSelectionWriters(refs).invalidateSelection();
    expect(refs.selectionSequenceRef.current).toBe(4);
    expect(refs.selectionRef.current).toBeNull();
    expect(refs.clearedSelectionSequenceRef.current).toBe(-1);
  });

  it("markSelectionCleared 记录当前序号", () => {
    const refs = makeRefs();
    const w = createSelectionWriters(refs);
    w.invalidateSelection();
    w.markSelectionCleared();
    expect(refs.clearedSelectionSequenceRef.current).toBe(4);
  });

  it("storeSelection 与 requestPickerSelectionSync 各写一个 ref", () => {
    const refs = makeRefs();
    const w = createSelectionWriters(refs);
    const next = { name: "b", tids: [2] };
    w.storeSelection(next);
    w.requestPickerSelectionSync();
    expect(refs.selectionRef.current).toBe(next);
    expect(refs.shouldSyncPickerSelectionRef.current).toBe(true);
  });

  it("clearPendingSelection 只清除同一个待定选区", () => {
    const refs = makeRefs();
    const w = createSelectionWriters(refs);
    const first = { seq: 1 };
    const second = { seq: 2 };
    w.setPendingSelection(first);
    w.setPendingSelection(second);
    w.clearPendingSelection(first);
    expect(refs.pendingSelectionRef.current).toBe(second);
    w.clearPendingSelection(second);
    expect(refs.pendingSelectionRef.current).toBeNull();
  });
});

describe("notePendingHighlightAtSequence", () => {
  it("把高亮序号对齐当前选区序号", () => {
    const highlight = { current: -1 };
    notePendingHighlightAtSequence(highlight, { current: 7 });
    expect(highlight.current).toBe(7);
  });
});

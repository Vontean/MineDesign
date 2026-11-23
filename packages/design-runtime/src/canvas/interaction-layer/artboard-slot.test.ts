import { describe, expect, it } from "vitest";
import { deriveArtboardSlot } from "./artboard-slot";

const base = {
  spec: { file: "a.dc.html" },
  focusedFile: null,
  selectedArtboards: new Set<string>(),
  enteredFile: null,
  emptyPieces: undefined,
  keyboardInsideFile: null,
  linkedArtboards: new Set<string>(),
  fullscreenFile: null,
  playingFile: null,
  canEditCanvas: true,
  isTouchPointer: false,
  armedTool: null,
  armedEmpty: false,
  hasSetMoveCommit: false,
  hasMultiGroupSelection: false,
  heldCover: null,
  isCanvasInteractive: true,
  shouldDelayArtboardMount: () => false,
  manifestArtboardCount: 1,
  getAboveDistance: () => 24,
  isPhoneCanvas: false,
  phone: false,
  renamingFile: null,
  tweaksOpenFile: null,
  hoveredFile: null,
  livePins: undefined,
  usesCameraPortal: false,
  maxInteractivePreviewCount: 8,
  mountedFiles: new Set<string>(),
  overBudgetPreviewFile: null,
  artboardHeaderThemes: new Map(),
  coverFiles: undefined,
  blockedFiles: new Set<string>(),
  artboardNotice: undefined,
};

describe("deriveArtboardSlot", () => {
  it("未聚焦的画板显示聚焦遮罩，标题回退为去掉后缀的文件名", () => {
    const slot = deriveArtboardSlot(base);
    expect(slot.displayTitle).toBe("a");
    expect(slot.shouldShowFocusOverlay).toBe(true);
    expect(slot.chromeKind).toBe("focus-overlay");
  });

  it("聚焦且选中时使用面遮罩；触摸指针下不使用", () => {
    const focused = { ...base, focusedFile: "a.dc.html", selectedArtboards: new Set(["a.dc.html"]) };
    expect(deriveArtboardSlot(focused).chromeKind).toBe("face-overlay");
    expect(deriveArtboardSlot({ ...focused, isTouchPointer: true }).chromeKind).toBe("focus-overlay");
    expect(deriveArtboardSlot({ ...focused, fullscreenFile: "b.dc.html" }).usesFaceOverlay).toBe(false);
  });

  it("聚焦未选中时，需要集合移动回调与多组选择才使用集合遮罩", () => {
    const focused = { ...base, focusedFile: "a.dc.html", hasSetMoveCommit: true, hasMultiGroupSelection: true };
    expect(deriveArtboardSlot(focused).chromeKind).toBe("set-overlay");
    expect(deriveArtboardSlot({ ...focused, hasSetMoveCommit: false }).chromeKind).toBe("focus-overlay");
  });

  it("挂载被延后且不是编辑中的聚焦画板时，不可聚焦", () => {
    const delayed = { ...base, shouldDelayArtboardMount: () => true };
    expect(deriveArtboardSlot(delayed).canFocusArtboard).toBe(false);
    const focused = { ...delayed, focusedFile: "a.dc.html" };
    expect(deriveArtboardSlot(focused).canFocusArtboard).toBe(true);
  });

  it("播放中的画板不显示聚焦遮罩；无框画板进入后不显示", () => {
    expect(deriveArtboardSlot({ ...base, playingFile: "a.dc.html" }).shouldShowFocusOverlay).toBe(false);
    const frameless = {
      ...base,
      spec: { file: "a.dc.html", frameless: true },
      enteredFile: "a.dc.html",
      focusedFile: "a.dc.html",
    };
    expect(deriveArtboardSlot(frameless).shouldShowFocusOverlay).toBe(false);
  });

  it("预览是否存活：数量未超限、已挂载、聚焦或全屏均为真", () => {
    const many = { ...base, manifestArtboardCount: 9 };
    expect(deriveArtboardSlot(many).isLive).toBe(false);
    expect(deriveArtboardSlot(base).isLive).toBe(true);
    expect(deriveArtboardSlot({ ...many, mountedFiles: new Set(["a.dc.html"]) }).isLive).toBe(true);
    expect(deriveArtboardSlot({ ...many, fullscreenFile: "a.dc.html" }).isLive).toBe(true);
  });

  it("手机画布仅超预算候选文件存活", () => {
    const phoneBase = {
      ...base,
      isPhoneCanvas: true,
      phone: true,
      usesCameraPortal: true,
      focusedFile: "a.dc.html",
    };
    expect(deriveArtboardSlot(phoneBase).isLive).toBe(false);
    expect(deriveArtboardSlot({ ...phoneBase, overBudgetPreviewFile: "a.dc.html" }).isLive).toBe(true);
  });

  it("仅全屏画板读取通知内容", () => {
    const artboardNotice = (file: string) => `notice:${file}`;
    expect(deriveArtboardSlot({ ...base, artboardNotice }).noticeContent).toBeNull();
    expect(
      deriveArtboardSlot({ ...base, artboardNotice, fullscreenFile: "a.dc.html" }).noticeContent,
    ).toBe("notice:a.dc.html");
  });

  it("全屏或无框画板不取标题上方距离", () => {
    expect(deriveArtboardSlot(base).aboveDistance).toBe(24);
    expect(deriveArtboardSlot({ ...base, fullscreenFile: "a.dc.html" }).aboveDistance).toBeUndefined();
    expect(deriveArtboardSlot({ ...base, spec: { file: "a.dc.html", frameless: true } }).aboveDistance).toBeUndefined();
  });
});

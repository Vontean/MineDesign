import { beforeAll, expect, it } from "vitest";
import {
  clippedArtboardsMessage,
  emptyExportTailMessage,
  fontSubstitutionWarnings,
  formatArtboardNames,
  getArtboardCaptureMode,
  getArtboardCaptureOptions,
  normalizeExportWarnings,
  selectionExportFileName,
} from "./warnings";
import { installExportPaperAndScale } from "./paper-and-scale";

// 判断流式导出需要纸张尺寸表
beforeAll(() => installExportPaperAndScale()());

it('截取方式：无边框取盒子，已迁移取整页，流式取全长，其余取画板框', () => {
  const a = { w: 800, h: 600 };
  expect(getArtboardCaptureMode({ ...a, frameless: true })).toBe("box");
  expect(getArtboardCaptureMode(a, { migrated: true })).toBe("page");
  expect(getArtboardCaptureMode({ ...a, print: "flow" })).toBe("full");
  expect(getArtboardCaptureMode(a)).toBe("frame");
  expect(getArtboardCaptureOptions({ ...a, print: "flow" }, { settle: true })).toEqual({
    selectionRoot: "body",
    frame: { w: 800, h: 600 },
    clipToFrame: false,
    fullLength: true,
    settle: true,
  });
});

it('页面上报的计数只接受 1 到 100 万的整数；全为 0 时没有警告', () => {
  expect(normalizeExportWarnings({ ic: 2, sr: 0, cd: 1.5, ur: 1e6 + 1 })).toEqual({
    innerClipped: 2, scrollRegion: 0, collapsed: 0, unrevealed: 0,
  });
  expect(normalizeExportWarnings({ ic: -1 })).toEqual({});
  expect(normalizeExportWarnings(null)).toEqual({});
});

it('画板名超过 3 个时只报数量', () => {
  expect(formatArtboardNames(["A", "B"])).toBe('"A", "B"');
  expect(formatArtboardNames(["A", "B", "C", "D"])).toBe("4 artboards");
});

it('超出画板框的提示：单个与多个措辞不同，可附带改用 Flow 的建议', () => {
  expect(clippedArtboardsMessage(["Home"], true)).toBe('"Home" runs past its frame, so the PNG stops at the frame.');
  expect(clippedArtboardsMessage(["A", "B"])).toContain("run past their frames");
  expect(clippedArtboardsMessage(["Home"])).toContain("set Print mode to Flow");
});

it('文件末尾留白的提示：高度取整到 10 px，可附带裁剪建议', () => {
  const message = emptyExportTailMessage(["Home"], 123, true);
  expect(message).toContain("about 120 px taller than its content");
  expect(message).toContain("choose Fit to content under Height in the artboard’s settings.");
  expect(emptyExportTailMessage(["A", "B"], 400)).toMatch(/blank space in the file\.$/);
});

it('字体替换提示与选区文件名', () => {
  expect(fontSubstitutionWarnings(0)).toEqual([]);
  expect(fontSubstitutionWarnings(2)).toHaveLength(1);
  expect(selectionExportFileName("pages/home.dc.html", "png", "首页")).toBe("首页-selection.png");
});

import { beforeAll, expect, it } from "vitest";
import {
  getArtboardPaperSize,
  imageCaptureScaleOptions,
  inferArtboardPaperSize,
  inferLocalePaperSize,
  installExportPaperAndScale,
  isFlowExport,
  needsPagedExport,
  paperHeightForWidth,
  resolveMeasuredExportHeight,
} from "./paper-and-scale";
import { installExportCaptureRuntime } from "./capture-runtime";
import { installPlatformFileContent } from "../platform/file-content";

// 纸张尺寸、截图上限与高度上限由各自的初始化函数提供
beforeAll(() => {
  installPlatformFileContent()();
  installExportCaptureRuntime()();
  installExportPaperAndScale()();
});

it('按宽度识别纸张：A4 与 Letter 的像素宽度允许 0.5% 误差', () => {
  expect(inferArtboardPaperSize({ w: 794, h: 5000 })).toBe("a4");
  expect(inferArtboardPaperSize({ w: 816, h: 100 })).toBe("letter");
});

it('宽度不符时按宽高比识别；都不符返回 undefined', () => {
  expect(inferArtboardPaperSize({ w: 500, h: 647 })).toBe("letter");
  expect(inferArtboardPaperSize({ w: 500, h: 500 })).toBeUndefined();
  expect(inferArtboardPaperSize({ w: 0, h: 100 })).toBeUndefined();
});

it('语言地区决定默认纸张：美洲地区用 Letter，其他用 A4；单独的 en 用 Letter', () => {
  expect(inferLocalePaperSize(["en-US"])).toBe("letter");
  expect(inferLocalePaperSize(["fr-CA"])).toBe("letter");
  expect(inferLocalePaperSize(["de-DE"])).toBe("a4");
  expect(inferLocalePaperSize(["en"])).toBe("letter");
  expect(inferLocalePaperSize([])).toBe("a4");
  expect(getArtboardPaperSize({ w: 1, h: 1, paper: "a4" })).toBe("a4");
});

it('分页与流式导出的判断', () => {
  expect(needsPagedExport({ w: 500, h: 500 })).toBe(true);
  expect(needsPagedExport({ w: 794, h: 1123 })).toBe(false);
  expect(needsPagedExport({ w: 794, h: 1123, expand: "fill" })).toBe(true);
  expect(needsPagedExport({ w: 500, h: 500, print: "flow" })).toBe(false);
  expect(isFlowExport({ w: 1, h: 1, expand: "fill" }, { fillFlows: true })).toBe(true);
  expect(isFlowExport({ w: 1, h: 1, expand: "fill" }, { fillFlows: true, migrated: true })).toBe(false);
});

it('测得高度：明显更高用测得值，超出上限为 capped，明显偏矮用自然高度，其余 fits', () => {
  expect(resolveMeasuredExportHeight(1000, 1500)).toBe(1500);
  expect(resolveMeasuredExportHeight(1000, 1003)).toBe("fits");
  expect(resolveMeasuredExportHeight(1000, 1000, 800)).toBe(800);
  expect(resolveMeasuredExportHeight(1000, 1000, 950)).toBe("fits");
  expect(resolveMeasuredExportHeight(1000, 1e9)).toBe(8000);
});

it('按宽度换算纸张高度；导出倍率档位标记是否在上限内', () => {
  expect(paperHeightForWidth(612, "letter")).toBe(792);
  const options = imageCaptureScaleOptions(5000, 5000);
  expect(options.map((o) => o.fits)).toEqual([true, true, false]);
  expect(options[1]).toMatchObject({ scale: 2, outW: 10000, outH: 10000 });
});

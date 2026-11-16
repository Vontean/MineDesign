import { expect, it } from "vitest";
import { decodeBase64Bytes, decodeJpegDataUrl, pixelsToPoints, readJpegDimensions } from "./jpeg";

// SOI + SOF0（8 位，高 50，宽 100，3 个分量）
const sof0 = (precision = 8, components = 3, marker = 0xc0) => [
  0xff, 0xd8, 0xff, marker, 0, 17, precision, 0, 50, 0, 100, components, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

it('读取基线 JPEG 的宽、高与颜色分量数', () => {
  expect(readJpegDimensions(Uint8Array.from(sof0()))).toEqual({ width: 100, height: 50, components: 3 });
  expect(readJpegDimensions(Uint8Array.from(sof0(8, 1, 0xc2)))).toEqual({ width: 100, height: 50, components: 1 });
});

it('跳过前面的 APP 段与填充字节', () => {
  const app = [0xff, 0xe0, 0, 4, 1, 2];
  const bytes = [0xff, 0xd8, ...app, 0xff, 0xff, ...sof0().slice(2)];
  expect(readJpegDimensions(Uint8Array.from(bytes)).width).toBe(100);
});

it('不是 JPEG、缺帧头、位深或颜色布局不支持时抛出带原因的错误', () => {
  expect(() => readJpegDimensions(Uint8Array.from([1, 2, 3, 4]))).toThrow("missing SOI marker");
  expect(() => readJpegDimensions(Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]))).toThrow("no frame header found");
  expect(() => readJpegDimensions(Uint8Array.from(sof0(12)))).toThrow("only 8-bit precision");
  expect(() => readJpegDimensions(Uint8Array.from(sof0(8, 4)))).toThrow("4 components");
  expect(() => readJpegDimensions(Uint8Array.from(sof0(8, 3, 0xc3)))).toThrow("not baseline or progressive");
});

it('解码 JPEG data URL；前缀不符或 base64 无效时返回 undefined', () => {
  expect(decodeJpegDataUrl("data:image/jpeg;base64,YWJj")).toEqual(new Uint8Array([97, 98, 99]));
  expect(decodeJpegDataUrl("data:image/png;base64,YWJj")).toBeUndefined();
  expect(decodeJpegDataUrl("data:image/jpeg;base64,!!!")).toBeUndefined();
  expect(decodeBase64Bytes("YQ==")).toEqual(new Uint8Array([97]));
});

it('像素换算为 PDF 点（96 dpi 到 72 dpi）', () => {
  expect(pixelsToPoints(96)).toBe(72);
});

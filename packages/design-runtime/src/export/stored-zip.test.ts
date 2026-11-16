import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createStoredZip, zipCrc32 } from "./stored-zip";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2024, 4, 6, 12, 30, 20));
});
afterEach(() => vi.useRealTimers());

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

it('CRC-32 与标准测试向量一致', () => {
  expect(zipCrc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  expect(zipCrc32(new Uint8Array())).toBe(0);
});

it('空压缩包只有 22 字节的目录结束记录', async () => {
  const blob = createStoredZip([]);
  expect(blob.type).toBe("application/zip");
  const bytes = await bytesOf(blob);
  expect(bytes.length).toBe(22);
  expect(new DataView(bytes.buffer).getUint32(0, true)).toBe(0x06054b50);
});

it('单个条目：本地头、文件名、内容、中央目录依次排列', async () => {
  const bytes = await bytesOf(createStoredZip([{ name: "a.txt", data: "hello" }]));
  const view = new DataView(bytes.buffer);
  expect(view.getUint32(0, true)).toBe(0x04034b50);
  expect(view.getUint32(14, true)).toBe(zipCrc32(new TextEncoder().encode("hello")));
  expect(view.getUint32(18, true)).toBe(5);
  expect(new TextDecoder().decode(bytes.slice(30, 35))).toBe("a.txt");
  expect(new TextDecoder().decode(bytes.slice(35, 40))).toBe("hello");
  expect(view.getUint32(40, true)).toBe(0x02014b50);
  // 总长度：本地 30+5+5，中央 46+5，结束 22
  expect(bytes.length).toBe(40 + 51 + 22);
});

it('文件名按 UTF-8 编码并置位语言编码标志；中央目录记录各条目偏移', async () => {
  const bytes = await bytesOf(createStoredZip([
    { name: "图.png", data: new Uint8Array([1, 2, 3]) },
    { name: "b", data: "x" },
  ]));
  const view = new DataView(bytes.buffer);
  expect(view.getUint16(6, true)).toBe(2048);
  const firstLocalSize = 30 + 7 + 3;
  const central = firstLocalSize + (30 + 1 + 1);
  expect(view.getUint32(central + 46 + 7, true)).toBe(0x02014b50);
  expect(view.getUint32(central + 46 + 7 + 42, true)).toBe(firstLocalSize);
});

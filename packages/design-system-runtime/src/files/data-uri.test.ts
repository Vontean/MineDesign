import { beforeAll, expect, it } from "vitest";
import { installModelFilePolicy } from "../model/file-policy";
import { bytesToFileDataUri, decodeBytesBase64, decodeHeldFileDataUri, encodeBytesBase64 } from "./data-uri";

beforeAll(() => {
  installModelFilePolicy()();
});

it("字节编码为 base64 并带上 MIME", () => {
  const bytes = new Uint8Array([72, 105, 33]);
  expect(encodeBytesBase64(bytes)).toBe("SGkh");
  expect(bytesToFileDataUri(bytes, "text/plain")).toBe("data:text/plain;base64,SGkh");
});

it("超过一个分块的数据也能往返", () => {
  const bytes = Uint8Array.from({ length: 30000 }, (_, i) => i % 256);
  expect(Array.from(decodeBytesBase64(encodeBytesBase64(bytes)))).toEqual(Array.from(bytes));
});

it("解码时忽略字母表外的字符，并接受缺失的填充", () => {
  expect(Array.from(decodeBytesBase64("SG\nkh"))).toEqual([72, 105, 33]);
  expect(Array.from(decodeBytesBase64("SGk"))).toEqual([72, 105]);
});

it("base64 与百分号编码的 data URI 都能解析，MIME 转小写", () => {
  const held = decodeHeldFileDataUri("data:IMAGE/PNG;base64,SGkh");
  expect(held?.type).toBe("image/png");
  expect(Array.from(held!.bytes)).toEqual([72, 105, 33]);
  const text = decodeHeldFileDataUri("data:text/plain,%E4%BD%A0");
  expect(new TextDecoder().decode(text!.bytes)).toBe("你");
});

it("不是 data URI 或百分号编码有误时返回 null", () => {
  expect(decodeHeldFileDataUri("http://example.com")).toBeNull();
  expect(decodeHeldFileDataUri("data:text/plain,%E4%BD")).toBeNull();
});

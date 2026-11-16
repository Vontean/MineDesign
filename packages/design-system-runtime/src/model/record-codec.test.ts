import { expect, it, vi } from "vitest";

vi.mock("../host/claude-session", () => ({ normalizeComments: (comments: unknown[]) => comments }));
import {
  canonicalJsonString,
  composeCommentDocuments,
  createDatabaseAdapter,
  decomposeCommentDocuments,
  documentRecordsEqual,
  estimateEmbeddedJsonBytes,
  jsonValueDepth,
  normalizeDatabaseError,
} from "./record-codec";

it("内嵌 JSON 的字节数计入 HTML 与行分隔符的转义", () => {
  expect(estimateEmbeddedJsonBytes("ab")).toBe(4);
  expect(estimateEmbeddedJsonBytes("<")).toBe(3 + 5);
  expect(estimateEmbeddedJsonBytes(" ")).toBe(5 + 3);
});

it("键序不同的对象视为同一条记录", () => {
  expect(canonicalJsonString({ b: 1, a: { d: 1, c: 2 } })).toBe('{"a":{"c":2,"d":1},"b":1}');
  expect(documentRecordsEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  expect(documentRecordsEqual({ a: 1 }, { a: 2 })).toBe(false);
  expect(documentRecordsEqual(null, {})).toBe(false);
});

it("嵌套深度达到上限后不再下探", () => {
  expect(jsonValueDepth(1)).toBe(0);
  expect(jsonValueDepth({ a: [{ b: 1 }] })).toBe(3);
  expect(jsonValueDepth({ a: [{ b: 1 }] }, 2)).toBe(3);
});

it("评论拆成 comments/<id> 文档，内容未变时沿用上一份对象", () => {
  const earlier = { id: "c1", text: "hi" };
  const documents = new Map<string, Record<string, unknown>>();
  decomposeCommentDocuments(
    [{ id: "c1", text: "hi", extra: undefined }, { id: "c2", text: "yo" }] as never,
    new Map([["comments/c1", earlier]]),
    documents,
  );
  expect(documents.get("comments/c1")).toBe(earlier);
  expect(documents.get("comments/c2")).toEqual({ id: "c2", text: "yo" });
});

it("合成评论时只取 comments 下一层的文档，id 取自路径", () => {
  const comments = composeCommentDocuments(
    new Map([
      ["comments/a", { text: "x" }],
      ["comments/a/reply", { text: "y" }],
      ["other/b", { text: "z" }],
    ]),
  );
  expect(comments).toEqual([{ text: "x", id: "a" }]);
});

it("数据库错误规整为已知错误码；未知错误视为不可用", () => {
  expect(normalizeDatabaseError({ code: "revoked", message: "m" })).toEqual({ code: "revoked", message: "m" });
  expect(normalizeDatabaseError(new TypeError("db bad path"))).toEqual({ code: "invalid_argument", message: "db bad path" });
  expect(normalizeDatabaseError("oops")).toEqual({ code: "unavailable", message: "unavailable" });
});

it("适配器把写入失败转成规整的错误", async () => {
  const adapter = createDatabaseAdapter({
    doc: () => ({ set: async () => { throw { code: "quota_exceeded", message: "满了" }; } }),
  } as never);
  await expect(adapter.set("a/b", {})).rejects.toEqual({ code: "quota_exceeded", message: "满了" });
});

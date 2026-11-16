// @vitest-environment happy-dom
import { beforeAll, expect, it } from "vitest";
import { createDesignSystemRuntime } from "../runtime";
import {
  changedProjectFilePaths,
  createFileMutationBatch,
  isOrderSubsequence,
  mergeDesignSystemFiles,
  mergeFilesIndexKeepingLocal,
  removeDroppedFiles,
  resolveFilesMergeSchema,
} from "./files-merge";

beforeAll(() => {
  createDesignSystemRuntime({ boot: false });
});

const table = (files: Record<string, string>) => files as never;

it("当前文件没被改过时，直接应用 before 到 after 的改动", () => {
  const before = { "README.md": "a", "voice.md": "v" };
  const after = { "README.md": "b", "voice.md": "v", "layout.md": "l" };
  const result = mergeDesignSystemFiles(table(before), "T", table(before), table(after));
  expect(result.files).toEqual(["README.md", "layout.md"]);
  expect(result.next).toMatchObject({ "README.md": "b", "layout.md": "l", "voice.md": "v" });
});

it("当前文件已被本地改过：能合并就合并，不能就跳过", () => {
  const before = { "README.md": "a" };
  const after = { "README.md": "b" };
  const current = { "README.md": "local" };
  const skipped = mergeDesignSystemFiles(table(current), "T", table(before), table(after));
  expect(skipped.skipped).toEqual(["README.md"]);
  expect(skipped.next).toMatchObject({ "README.md": "local" });
  const merged = mergeDesignSystemFiles(table(current), "T", table(before), table(after), {
    merge: (_path, _before, after, current) => current + "+" + after,
  });
  expect(merged.files).toEqual(["README.md"]);
  expect(merged.next).toMatchObject({ "README.md": "local+b" });
});

it("已过期的文件只保留本地处理结果，excluded 的路径不参与", () => {
  const before = { "README.md": "a", "voice.md": "v" };
  const after = { "README.md": "b", "voice.md": "w" };
  const current = { "README.md": "local", "voice.md": "v" };
  const result = mergeDesignSystemFiles(table(current), "T", table(before), table(after), {
    stale: (path) => path === "README.md",
    excluded: new Set(["voice.md"]),
  });
  expect(result.localOnly).toEqual(["README.md"]);
  expect(result.files).toEqual([]);
  expect(result.next).toMatchObject({ "README.md": "b", "voice.md": "v" });
});

it("列出两份文件之间有改动的路径", () => {
  expect(changedProjectFilePaths(table({ "a.md": "1", "b.md": "1" }), table({ "a.md": "2", "b.md": "1", "c.md": "x" }), "T").files).toEqual(["a.md", "c.md"]);
});

it("索引合并：以对方为准，同时保留本地新增", () => {
  const kept: string[] = [];
  const schema = { kind: "map" } as const;
  const merged = mergeFilesIndexKeepingLocal({ a: 1 }, { a: 1, mine: 2 }, { a: 5 }, schema, "", kept);
  expect(merged).toEqual({ a: 5, mine: 2 });
  expect(kept).toEqual([]);
  mergeFilesIndexKeepingLocal({ a: 1 }, { a: 2 }, { a: 3 }, schema, "", kept);
  expect(kept).toEqual(["a"]);
});

it("按值推断没有声明的子结构；检查顺序是否保持", () => {
  expect(resolveFilesMergeSchema(undefined, "k", { a: 1 })).toEqual({ kind: "map" });
  expect(resolveFilesMergeSchema(undefined, "k", ["a"], undefined)).toEqual({ kind: "list" });
  expect(resolveFilesMergeSchema(undefined, "k", 1)).toEqual({ kind: "leaf" });
  expect(isOrderSubsequence(["a", "b", "c"], ["a", "c"])).toBe(true);
  expect(isOrderSubsequence(["a", "b", "c"], ["c", "a"])).toBe(false);
});

it("removeDroppedFiles 删除不再存在的路径并写入新内容", () => {
  expect(removeDroppedFiles(table({ a: "1", b: "2" }), new Map([["a", "1"], ["b", "2"]]), new Map([["a", "9"]]))).toEqual({ a: "9" });
});

it("文件操作栈：执行、撤销、重做，新操作清空重做；超过上限丢弃最早的", () => {
  const log: string[] = [];
  const mutation = (id: string) => ({ label: id, do: () => log.push("do " + id), undo: () => log.push("undo " + id) });
  const batch = createFileMutationBatch(2);
  batch.exec(mutation("a"));
  batch.exec(mutation("b"));
  batch.undo();
  expect(batch.canRedo()).toBe(true);
  batch.redo();
  batch.exec(mutation("c"));
  batch.undo();
  batch.undo();
  batch.undo();
  expect(log).toEqual(["do a", "do b", "undo b", "do b", "do c", "undo c", "undo b"]);
  expect(batch.canUndo()).toBe(false);
  batch.exec(mutation("d"));
  expect(batch.canRedo()).toBe(false);
  expect(batch.prune(() => true)).toBe(1);
});

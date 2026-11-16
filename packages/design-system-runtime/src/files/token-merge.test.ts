import { beforeAll, expect, it } from "vitest";
import { installEditorIndexFileStore } from "../editor/index-file-store";
import { DESIGN_SYSTEM_PATHS, installModelFilePolicy } from "../model/file-policy";
import {
  availableConflictCopyName,
  fileContentsSemanticallyEqual,
  mergeJsonThreeWays,
  mergeSupportedFileThreeWays,
  mergeTokenFileThreeWays,
  remoteTextLostLocalLines,
  summarizeConflictNames,
} from "./token-merge";

beforeAll(() => {
  installModelFilePolicy()();
  installEditorIndexFileStore()();
});

const tokens = (colors: [string, string][]) =>
  JSON.stringify({ version: 1, color: { themes: [{ id: "light", name: "浅色" }], tokens: colors.map(([name, light]) => ({ name, value: { light }, usage: "" })) } });

it("两边改了对象的不同键时都保留，改了同一处时记为冲突", () => {
  const base = { a: 1, b: 1 };
  expect(mergeJsonThreeWays(base, { a: 2, b: 1 }, { a: 1, b: 3 })).toEqual({ value: { a: 2, b: 3 }, conflicts: [] });
  const clash = mergeJsonThreeWays(base, { a: 2, b: 1 }, { a: 3, b: 1 });
  expect(clash.value).toEqual({ a: 2, b: 1 });
  expect(clash.conflicts).toEqual(["a"]);
  expect(mergeJsonThreeWays(base, { a: 2, b: 1 }, { a: 3, b: 1 }, "theirs").value).toEqual({ a: 3, b: 1 });
});

it("有 id 的数组按元素合并，顺序跟随三方列表", () => {
  const base = [{ id: "x", v: 1 }];
  const mine = [{ id: "x", v: 1 }, { id: "m", v: 1 }];
  const theirs = [{ id: "x", v: 2 }, { id: "t", v: 1 }];
  const { value, conflicts } = mergeJsonThreeWays(base, mine, theirs);
  expect(conflicts).toEqual([]);
  expect(value).toEqual([{ id: "x", v: 2 }, { id: "m", v: 1 }, { id: "t", v: 1 }]);
});

it("tokens.json 合并：不同 token 的修改合在一起", () => {
  const result = mergeTokenFileThreeWays(
    tokens([["a", "#111111"], ["b", "#222222"]]),
    tokens([["a", "#333333"], ["b", "#222222"]]),
    tokens([["a", "#111111"], ["b", "#444444"]]),
  );
  expect(result.ok).toBe(true);
  expect(JSON.parse((result as { text: string }).text).color.tokens.map((t: { value: { light: string } }) => t.value.light)).toEqual(["#333333", "#444444"]);
});

it("tokens.json 合并：同一 token 冲突时失败，选对方时返回被覆盖的路径", () => {
  const base = tokens([["a", "#111111"]]);
  const mine = tokens([["a", "#222222"]]);
  const theirs = tokens([["a", "#333333"]]);
  const failed = mergeTokenFileThreeWays(base, mine, theirs);
  expect(failed.ok).toBe(false);
  const kept = mergeTokenFileThreeWays(base, mine, theirs, "theirs");
  expect(kept.ok && kept.kept.length).toBeGreaterThan(0);
  expect(mergeTokenFileThreeWays(base, "not json", theirs)).toMatchObject({ ok: false, why: "unreadable" });
});

it("只支持 tokens.json；格式不同但内容相同的 tokens 视为相等", () => {
  const text = tokens([["a", "#111111"]]);
  expect(mergeSupportedFileThreeWays("layout.md", "", "", "")).toBeNull();
  expect(mergeSupportedFileThreeWays(DESIGN_SYSTEM_PATHS.tokens, text, text, text)).toMatchObject({ ok: true });
  expect(fileContentsSemanticallyEqual(DESIGN_SYSTEM_PATHS.tokens, text, JSON.stringify(JSON.parse(text), null, 2))).toBe(true);
  expect(fileContentsSemanticallyEqual("layout.md", "a", "a ")).toBe(false);
});

it("冲突名称最多列三个，其余合计", () => {
  expect(summarizeConflictNames(["a/x", "b/y", "c/x"])).toBe("x, y");
  expect(summarizeConflictNames(["a", "b", "c", "d", "e"])).toBe("a, b, c and 2 more");
});

it("判断远端文本是否丢了本地新增的行", () => {
  expect(remoteTextLostLocalLines("a", "a\nb", "a")).toBe(true);
  expect(remoteTextLostLocalLines("a", "a\nb", "a\nb\nc")).toBe(false);
  expect(remoteTextLostLocalLines("a", "a", "x")).toBe(false);
});

it("冲突副本名保留扩展名与 .d.ts，重名时递增", () => {
  const taken = new Set(["dir/a-copy.ts"]);
  expect(availableConflictCopyName("dir/a.ts", (p) => !taken.has(p))).toBe("dir/a-copy-2.ts");
  expect(availableConflictCopyName("types.d.ts", () => true)).toBe("types-copy.d.ts");
  expect(availableConflictCopyName("a.ts", () => false)).toBeNull();
});

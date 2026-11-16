// @vitest-environment happy-dom
import { beforeAll, expect, it } from "vitest";
import { createDesignSystemRuntime } from "../runtime";
import {
  detectColorAliasCycle,
  generatedTokensCssForFiles,
  generateTokensCss,
  normalizeCssLength,
  normalizeFontWeight,
  parseTokens,
  resolveColorTokenValue,
  serializeTokens,
  tokensJsonWithManifestName,
} from "./tokens";

beforeAll(() => {
  createDesignSystemRuntime({ boot: false });
});

const sample = {
  color: {
    themes: [{ id: "light", name: "浅色" }, { id: "dark", name: "深色" }],
    tokens: [
      { name: "surface", value: { light: "#FFFFFF", dark: "#111111" }, usage: "页面底色" },
      { name: "panel", value: "{surface}" },
      { name: "ink", value: "#000" },
    ],
  },
  spacing: { tokens: [{ name: "space-1", value: 4 }] },
};

it("值被规整：颜色转小写、数字补 px，只有一个值的颜色归到第一个主题", () => {
  const tokens = parseTokens(sample);
  expect(tokens.color.tokens.map((t) => t.value)).toEqual([{ light: "#ffffff", dark: "#111111" }, { light: "{surface}" }, { light: "#000" }]);
  expect(tokens.spacing.tokens).toEqual([{ name: "space-1", value: "4px", usage: "" }]);
});

it("不合法的项被丢弃并写进报告，不抛错", () => {
  const report = { dropped: [] as string[], warnings: [] as string[] };
  const tokens = parseTokens({ color: { tokens: [{ name: "bad name", value: "#fff" }, { name: "x", value: "oops" }] } }, report);
  expect(tokens.color.tokens).toEqual([]);
  expect(report.dropped).toEqual(['color "bad name": bad or duplicate name', "color x: no valid value"]);
  expect(parseTokens("{ not json", report).color.themes).toEqual([{ id: "light", name: "Light" }]);
});

it("循环或悬空的颜色别名被移除", () => {
  const report = { dropped: [] as string[], warnings: [] as string[] };
  const tokens = parseTokens({ color: { tokens: [{ name: "a", value: "{b}" }, { name: "b", value: "{a}" }, { name: "c", value: "{gone}" }, { name: "d", value: "#fff" }] } }, report);
  expect(tokens.color.tokens.map((t) => t.name)).toEqual(["d"]);
  expect(report.dropped.length).toBeGreaterThan(0);
});

it("沿别名链解出最终颜色，并能预判改动是否成环", () => {
  const tokens = parseTokens(sample);
  const panel = tokens.color.tokens[1];
  expect(resolveColorTokenValue(panel, "dark", tokens)).toBe("#111111");
  expect(detectColorAliasCycle(tokens, "surface", "light", "{panel}")).toEqual({ theme: "light", via: ["panel"] });
  expect(detectColorAliasCycle(tokens, "surface", "light", "#fff")).toBeUndefined();
});

it("serializeTokens 输出两空格缩进并以换行结尾，保留不识别的顶层键", () => {
  const text = serializeTokens(parseTokens({ ...sample, name: "Pine", note: { a: 1 } }));
  expect(text.endsWith("}\n")).toBe(true);
  expect(JSON.parse(text)).toMatchObject({ name: "Pine", note: { a: 1 } });
});

it("tokens.css：基础主题在 :root，其他主题单独成块，别名写成 var()", () => {
  const css = generateTokensCss(parseTokens(sample), { usageComments: true });
  expect(css).toContain(':root, [data-theme="light"] {');
  expect(css).toContain("  --surface: #ffffff; /* 页面底色 */");
  expect(css).toContain("  --panel: var(--surface);");
  expect(css).toContain('[data-theme="dark"] {');
  expect(css).toContain("  --space-1: 4px;");
});

it("文件表：没有 tokens.json 时不生成；系统名称写进文件头", () => {
  expect(generatedTokensCssForFiles({})).toBeNull();
  const files = { "tokens.json": JSON.stringify(sample), "manifest.json": JSON.stringify({ manifestVersion: 3, name: "Pine", namespace: "Pine", files: [] }) } as never;
  expect(generatedTokensCssForFiles(files)).toMatch(/^\/\* Pine — generated from tokens.json \*\//);
  expect(JSON.parse(tokensJsonWithManifestName(files) as string).name).toBe("Pine");
});

it("长度与字重的规整规则", () => {
  expect(normalizeCssLength(8, false)).toBe("8px");
  expect(normalizeCssLength("FULL", true)).toBe("9999px");
  expect(normalizeCssLength("calc(1px)", false)).toBeUndefined();
  expect(normalizeFontWeight("bold")).toBe("700");
  expect(normalizeFontWeight(1001)).toBeUndefined();
});

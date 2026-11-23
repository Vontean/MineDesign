import { describe, expect, it } from "vitest";
import {
  collapseFlexShorthand,
  cssDeclarationMap,
  extractBackgroundUrl,
  freshCssDeclaration,
  kebabCaseCssProperty,
  matchesCssDeclarations,
  parseCssDeclarations,
  replaceCssDeclaration,
  serializeCssDeclarations,
} from "./css-declarations";

describe("css-declarations", () => {
  it("括号与引号内的分号不切分声明", () => {
    const declarations = parseCssDeclarations(
      "Color: red; background: url(data:image/svg+xml;utf8,<svg/>); content: 'a;b'",
    );
    expect(declarations.map((item: { prop: string }) => item.prop)).toEqual([
      "color",
      "background",
      "content",
    ]);
    expect(declarations[1].value).toBe("url(data:image/svg+xml;utf8,<svg/>)");
  });

  it("cssDeclarationMap 后写的同名属性覆盖先写的", () => {
    expect([...cssDeclarationMap("a: 1; b: 2; a: 3")]).toEqual([
      ["a", "3"],
      ["b", "2"],
    ]);
  });

  it("matchesCssDeclarations 要求全部匹配且未被占用", () => {
    const expected = new Map([["a", "1"]]);
    expect(matchesCssDeclarations(new Map([["a", "1"]]), expected, new Set())).toBe(true);
    expect(matchesCssDeclarations(new Map(), expected, new Set())).toBe(false);
    expect(matchesCssDeclarations(new Map([["a", "1"]]), expected, new Set(["a"]))).toBe(false);
  });

  it("折叠 flex 简写并去掉 1 0% 尾巴", () => {
    const collapsed = collapseFlexShorthand([
      freshCssDeclaration("flex-grow", "2"),
      freshCssDeclaration("flex-shrink", "1"),
      freshCssDeclaration("flex-basis", "0%"),
    ]);
    expect(serializeCssDeclarations(collapsed)).toBe("flex: 2");
  });

  it("serialize 保留非新增声明的原文", () => {
    expect(
      serializeCssDeclarations([
        { prop: "a", value: "1", text: "a:1" },
        freshCssDeclaration("b", "2"),
      ]),
    ).toBe("a:1; b: 2");
  });

  it("kebabCaseCssProperty 处理 ms 前缀与大写", () => {
    expect(kebabCaseCssProperty("backgroundColor")).toBe("background-color");
    expect(kebabCaseCssProperty("msTransform")).toBe("-ms-transform");
  });

  it("extractBackgroundUrl 跳过引号里的右括号", () => {
    expect(extractBackgroundUrl("linear-gradient(red,blue), url('a)b.png') no-repeat")).toBe(
      "url('a)b.png')",
    );
    expect(extractBackgroundUrl("red")).toBe("");
  });

  it("replaceCssDeclaration 替换首个同名并去重，缺失时追加", () => {
    expect(replaceCssDeclaration("a: 1; b: 2; a: 3", "a", "9")).toBe("a: 9; b: 2");
    expect(replaceCssDeclaration("b: 2", "a", "9")).toBe("b: 2; a: 9");
  });
});

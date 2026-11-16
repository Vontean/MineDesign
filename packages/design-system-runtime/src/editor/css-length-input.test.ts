import { expect, it } from "vitest";
import { cssLengthInputBounds, cssLengthInputStep, parseEditableCssLength } from "./css-length-input";

it("解析数字与单位，忽略首尾空白", () => {
  expect(parseEditableCssLength(" 12.5rem ")).toEqual({ n: 12.5, unit: "rem" });
  expect(parseEditableCssLength("-4%")).toEqual({ n: -4, unit: "%" });
});

it("无单位的 0 补成 px，其他无单位数字保持空单位", () => {
  expect(parseEditableCssLength("0")).toEqual({ n: 0, unit: "px" });
  expect(parseEditableCssLength("1.5")).toEqual({ n: 1.5, unit: "" });
});

it("不支持的单位与表达式返回 null", () => {
  expect(parseEditableCssLength("10vh")).toBeNull();
  expect(parseEditableCssLength("calc(1px)")).toBeNull();
  expect(parseEditableCssLength("")).toBeNull();
});

it("px 与 % 整数步进，其余单位 0.05", () => {
  expect(cssLengthInputStep("px")).toBe(1);
  expect(cssLengthInputStep("%")).toBe(1);
  expect(cssLengthInputStep("rem")).toBe(0.05);
});

it("上下限按 16px 换算到当前单位", () => {
  expect(cssLengthInputBounds("px", 0, 160)).toEqual([0, 160]);
  expect(cssLengthInputBounds("rem", 16, 160)).toEqual([1, 10]);
  expect(cssLengthInputBounds("%", 16, 32)).toEqual([100, 200]);
});

import { beforeAll, expect, it } from "vitest";
import { installModelComponentInference } from "../model/component-inference";
import { colorTokenRole, contrastBackgroundsInUsage, contrastTokenMatchers, inferColorContrastPairs } from "./color-contrast-pairs";

beforeAll(() => {
  installModelComponentInference()();
});

const infer = (tokens: { name: string; usage?: string }[]) => Object.fromEntries(inferColorContrastPairs(tokens));

it("按名称第一段判断颜色角色", () => {
  expect(colorTokenRole("surface-raised", "")).toBe(0);
  expect(colorTokenRole("ink-muted", "")).toBe(1);
  expect(colorTokenRole("border", "")).toBe(3);
  expect(colorTokenRole("on-accent", "")).toBe(4);
  expect(colorTokenRole("mystery", "")).toBe(-1);
});

it("说明里 \"on 底色\" 的写法决定对比对象，来源是 usage", () => {
  expect(infer([{ name: "surface", usage: "page" }, { name: "ink-muted", usage: "Secondary text on surface." }])["ink-muted"]).toEqual({ against: ["surface"], source: "usage" });
});

it("名称里 on 之后的部分指向底色，来源是 on", () => {
  const pairs = infer([{ name: "accent" }, { name: "on-accent" }]);
  expect(pairs["on-accent"]).toEqual({ against: ["accent"], source: "on" });
});

it("没有任何线索的文字色，与所有通用表面色对比", () => {
  const pairs = infer([{ name: "surface" }, { name: "surface-raised" }, { name: "surface-2" }, { name: "ink" }]);
  expect(pairs.ink).toEqual({ against: ["surface", "surface-raised"], source: "name" });
});

it("否定词与 depends on 一类的说法不算对比关系", () => {
  const matchers = contrastTokenMatchers(["surface", "accent"], "");
  expect(contrastBackgroundsInUsage("Never on surface", "ink", matchers)).toEqual([]);
  expect(contrastBackgroundsInUsage("Depends on accent", "ink", matchers)).toEqual([]);
  expect(contrastBackgroundsInUsage("Text on surface and accent", "ink", matchers)).toEqual(["surface", "accent"]);
});

it("边框、高亮色与 disabled 一类的状态色不参与对比", () => {
  const pairs = infer([{ name: "surface" }, { name: "border" }, { name: "text-disabled" }, { name: "text-highlight" }]);
  expect(pairs).toEqual({});
});

import { describe, expect, it } from "vitest";
import { parsePreviewForm, readStringLiteral } from "./preview-form";

describe("readStringLiteral", () => {
  it("解码转义并报告闭合位置", () => {
    expect(readStringLiteral(`"a\\n\\u0041"`, 0)).toEqual({ value: "a\nA", closed: true, end: 10 });
  });
  it("未闭合时返回已读取内容", () => {
    expect(readStringLiteral(`'abc`, 0)).toEqual({ value: "abc", closed: false });
  });
  it("普通引号遇到换行、模板含插值时放弃", () => {
    expect(readStringLiteral(`"a\nb"`, 0)).toBeNull();
    expect(readStringLiteral("`a${b}`", 0)).toBeNull();
  });
});

describe("parsePreviewForm", () => {
  it("选择器加 html 写入，返回字面量起点与步骤", () => {
    const code = `$(".card").html("<b>`;
    const form = parsePreviewForm(code, false);
    expect(form).toEqual({ method: "html", at: code.indexOf('"<b>'), steps: [["$", ".card"]] });
  });
  it("$(\"<div>\") 创建形态没有选择步骤", () => {
    expect(parsePreviewForm(`$("<div>`, false)).toMatchObject({ method: "create", steps: null });
  });
  it("链式模式下以点开头接上一个结果", () => {
    expect(parsePreviewForm(`.html("x`, true)).toMatchObject({ method: "html", steps: [["prev"]] });
    expect(parsePreviewForm(`.html("x`, false)).toBeUndefined();
  });
  it("尚不能判定的短前缀返回 undefined，无关代码返回 null", () => {
    expect(parsePreviewForm(`$(".a`, false)).toBeUndefined();
    expect(parsePreviewForm(`console.log(1); const longer = "this statement is clearly not a preview form at all, so it is rejected"`, false)).toBeNull();
  });
});

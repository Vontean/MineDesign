import { describe, expect, it } from "vitest";
import { completeSvgDataUrl } from "./preview-svg";

const open = `<div style="background:url(&quot;data:image/svg+xml,<svg width='10'><rect/>`;

describe("completeSvgDataUrl", () => {
  it("补全未闭合的 svg 并追加属性与标签尾部", () => {
    const state: { g?: unknown } = { g: undefined };
    const out = completeSvgDataUrl(open, 0, state);
    expect(out).toBe(`${open}</svg>&quot;)">` + "</div>");
    expect(state.g).toBeTruthy();
  });
  it("遇到 style 等不安全元素时放弃并标记为 null", () => {
    const state: { g?: unknown } = { g: undefined };
    const html = `<div style="background:url('data:image/svg+xml,<svg><script>`;
    expect(completeSvgDataUrl(html, 0, state)).toBeNull();
    expect(state.g).toBeNull();
  });
  it("base64 data URL 不处理", () => {
    const state: { g?: unknown } = { g: undefined };
    expect(
      completeSvgDataUrl(`<div style="background:url('data:image/svg+xml;base64,AAAA`, 0, state),
    ).toBeNull();
    expect(state.g).toBeNull();
  });
});

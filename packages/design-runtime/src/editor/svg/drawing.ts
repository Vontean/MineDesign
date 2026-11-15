/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { createArrowHeadId, defaultArrowHeadDefs, shortenLineEnd, SvgArrowsConstant_3 } from "./arrows";

var SvgDrawingConstant: Dynamic;
var SvgDrawingConstant_2: Dynamic;
function svgStrokeHtml(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
  extra?: Dynamic,
  detail: Dynamic = null,
): Dynamic {
  return (
    `<svg width="${input}" height="${options}" viewBox="0 0 ${input} ${options}" preserveAspectRatio="none" style="${value}width: ${input}px; height: ${options}px; overflow: visible; fill: none; stroke: ${extra}; stroke-width: ${SvgDrawingConstant}; stroke-linecap: round; stroke-linejoin: round">` +
    (detail ? (0, defaultArrowHeadDefs)(detail, extra) : "") +
    `<path d="${context}"${detail ? ` marker-end="url(#${detail})"` : ""}></path></svg>`
  );
}
function lineDrawingInset(input?: Dynamic, options?: Dynamic): Dynamic {
  return {
    dx: (Math.max(input, SvgDrawingConstant_2) - input) / 2,
    dy: (Math.max(options, SvgDrawingConstant_2) - options) / 2,
  };
}
function lineDrawingBox(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
): Dynamic {
  let value2: Dynamic = Math.max(input, SvgDrawingConstant_2),
    value3: Dynamic = Math.max(options, SvgDrawingConstant_2),
    value4: Dynamic = (value2 - input) / 2,
    value5: Dynamic = (value3 - options) / 2,
    value6: Dynamic = value4 + (context === 1 ? 0 : input),
    value7: Dynamic = value5 + (value === 1 ? 0 : options);
  return {
    bw: value2,
    bh: value3,
    sx: value6,
    sy: value7,
    ex: value4 + (context === 1 ? input : 0),
    ey: value5 + (value === 1 ? options : 0),
  };
}
function arrowDrawingHtml(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
  extra?: Dynamic,
  detail?: Dynamic,
): Dynamic {
  let {
      bw: value2,
      bh: value3,
      sx: value4,
      sy: value5,
      ex: value6,
      ey: value7,
    }: Dynamic = lineDrawingBox(input, options, context, value),
    value8: Dynamic = (0, shortenLineEnd)(
      value4,
      value5,
      value6,
      value7,
      SvgArrowsConstant_3 * SvgDrawingConstant,
    );
  return svgStrokeHtml(
    value2,
    value3,
    `M ${value4} ${value5} L ${value8.x} ${value8.y}`,
    extra,
    detail,
    (0, createArrowHeadId)(),
  );
}
function lineDrawingHtml(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
  extra?: Dynamic,
  detail?: Dynamic,
): Dynamic {
  let {
    bw: value2,
    bh: value3,
    sx: value4,
    sy: value5,
    ex: value6,
    ey: value7,
  }: Dynamic = lineDrawingBox(input, options, context, value);
  return svgStrokeHtml(
    value2,
    value3,
    `M ${value4} ${value5} L ${value6} ${value7}`,
    extra,
    detail,
  );
}
function constrainLineAngle(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = options.x - input.x,
    value2: Dynamic = options.y - input.y,
    value3: Dynamic = Math.hypot(value, value2),
    value4: Dynamic =
      ((Math.round(Math.atan2(value2, value) / (Math.PI / 4)) % 8) + 8) % 8,
    SQRT1_2: Dynamic = Math.SQRT1_2,
    value5: Dynamic = [1, SQRT1_2, 0, -SQRT1_2, -1, -SQRT1_2, 0, SQRT1_2][
      value4
    ],
    value6: Dynamic = [0, SQRT1_2, 1, SQRT1_2, 0, -SQRT1_2, -1, -SQRT1_2][
      value4
    ];
  return {
    x: input.x + value3 * value5,
    y: input.y + value3 * value6,
  };
}
export {
  arrowDrawingHtml,
  constrainLineAngle,
  lineDrawingBox,
  lineDrawingHtml,
  lineDrawingInset,
  SvgDrawingConstant,
  SvgDrawingConstant_2,
  svgStrokeHtml,
};
export function installEditorSvgDrawing(): () => void {
  return () => {
    SvgDrawingConstant = 4;
    SvgDrawingConstant_2 = 8;
  };
}

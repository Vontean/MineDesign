import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react_jsx_runtime } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { toModuleNamespace } from "../module-helpers";

var commentPointerTip: Dynamic;
var commentPointerPath: Dynamic;
var commentPointerFill: Dynamic;
var commentPointerStroke: Dynamic;
var commentPointerStrokeWidth: Dynamic;
var commentPointerSvg: Dynamic;
var commentPointerCursorUrl: Dynamic;
var commentPointerCursor: Dynamic;
var jsx_r1e: Dynamic;
var subtractCssPixels: Dynamic;
function CommentPointer({
  at: at,
  className: className,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <svg
      aria-hidden={true}
      data-testid={dataTestid}
      className={joinClassNames(
        "pointer-events-none absolute",
        className,
      )}
      width={28}
      height={28}
      viewBox={`0 0 ${28} ${28}`}
      style={{
        left: subtractCssPixels(at.x, commentPointerTip.x),
        top: subtractCssPixels(at.y, commentPointerTip.y),
      }}
    >
      <path
        d={commentPointerPath}
        fill={commentPointerFill}
        stroke={commentPointerStroke}
        strokeWidth={commentPointerStrokeWidth}
      />
    </svg>
  );
}
export {
  CommentPointer,
  commentPointerCursor,
  commentPointerCursorUrl,
  commentPointerFill,
  commentPointerPath,
  commentPointerStroke,
  commentPointerStrokeWidth,
  commentPointerSvg,
  commentPointerTip,
  jsx_r1e,
  subtractCssPixels,
};
export function installCommentsPointer(): () => void {
  return () => {
    // MineDesign：形状不变，尖角按 Codex 原生评论光标翻到左下（热点就是尖角），填充改用 Codex 的蓝
    commentPointerTip = {
      x: 2,
      y: 26,
    };
    commentPointerPath = "M 2 26 L 2 14 A 12 12 0 1 1 14 26 Z";
    commentPointerFill = "#339cff";
    commentPointerStroke = "#fff";
    commentPointerStrokeWidth = 2;
    commentPointerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='${commentPointerPath}' fill='${commentPointerFill}' stroke='${commentPointerStroke}' stroke-width='${commentPointerStrokeWidth}'/></svg>`;
    commentPointerCursorUrl = commentPointerSvg.replace(
      /[ '<>#]/g,
      (input?: Dynamic): Dynamic =>
        "%" + input.charCodeAt(0).toString(16).toUpperCase(),
    );
    commentPointerCursor = `url("data:image/svg+xml,${commentPointerCursorUrl}") ${commentPointerTip.x} ${commentPointerTip.y}, crosshair`;
    jsx_r1e = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    subtractCssPixels = (input?: Dynamic, options?: Dynamic): Dynamic =>
      typeof input == "number"
        ? input - options
        : `calc(${input} - ${options}px)`;
  };
}

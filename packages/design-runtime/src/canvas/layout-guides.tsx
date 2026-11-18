import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { useViewportStore } from "./viewport-store";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { sanitizeCssColor } from "../platform/css-sanitization";
import { resolveArtboardGuide } from "../platform/file-content";

var react__kt: Dynamic;
var jsx_MN: Dynamic;
var ArtboardLayoutGuides: Dynamic;
function SquareGridGuide({ size: size, color: color }: Dynamic): Dynamic {
  useUiLocale();
  let viewportStore: Dynamic = useViewportStore(),
    safeColor: Dynamic = sanitizeCssColor(color),
    buildLineGradient: Dynamic = (direction?: Dynamic): Dynamic =>
      `linear-gradient(${direction}, ${safeColor} calc(1px / var(--mega-scale, 1)), transparent calc(1px / var(--mega-scale, 1)))`;
  return (
    <div
      ref={viewportStore.stamp}
      className={"absolute inset-0"}
      style={{
        opacity: `clamp(0, (${size} * var(--mega-scale, 1) - 3) / 4, 1)`,
        backgroundImage: buildLineGradient("to right") + ", " + buildLineGradient("to bottom"),
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
function RowColumnLayoutGuide({ r: guide }: Dynamic): Dynamic {
  useUiLocale();
  let isColumns: Dynamic = guide.kind === "columns",
    safeColor: Dynamic = sanitizeCssColor(guide.color),
    gradientDirection: Dynamic = isColumns ? uiMessage("canvas.layoutGuides.toRight") : uiMessage("canvas.layoutGuides.toBottom");
  if (guide.align === "stretch") {
    let cellSize: Dynamic = `calc((100% + ${guide.gutter}px) / ${guide.count})`;
    return (
      <div
        className={"absolute inset-0"}
        style={{
          padding: isColumns ? `0 ${guide.margin}px` : `${guide.margin}px 0`,
          backgroundOrigin: "content-box",
          backgroundClip: "content-box",
          backgroundRepeat: isColumns ? "repeat-x" : "repeat-y",
          backgroundImage: `linear-gradient(${gradientDirection}, ${safeColor} calc(100% - ${guide.gutter}px), transparent calc(100% - ${guide.gutter}px))`,
          backgroundSize: isColumns ? `${cellSize} 100%` : `100% ${cellSize}`,
        }}
      />
    );
  }
  let totalSpan: Dynamic = guide.count * guide.size + (guide.count - 1) * guide.gutter,
    alignedOffset: Dynamic =
      guide.align === "center"
        ? `calc(50% - ${totalSpan / 2}px)`
        : `${guide.offset}px`,
    positionStyle: Dynamic = isColumns
      ? {
          top: 0,
          bottom: 0,
          width: totalSpan,
          ...(guide.align === "end"
            ? {
                right: alignedOffset,
              }
            : {
                left: alignedOffset,
              }),
        }
      : {
          left: 0,
          right: 0,
          height: totalSpan,
          ...(guide.align === "end"
            ? {
                bottom: alignedOffset,
              }
            : {
                top: alignedOffset,
              }),
        };
  return (
    <div
      className={"absolute"}
      style={{
        ...positionStyle,
        backgroundRepeat: isColumns ? "repeat-x" : "repeat-y",
        backgroundImage: `linear-gradient(${gradientDirection}, ${safeColor} ${guide.size}px, transparent ${guide.size}px)`,
        backgroundSize: isColumns
          ? `${guide.size + guide.gutter}px 100%`
          : `100% ${guide.size + guide.gutter}px`,
      }}
    />
  );
}
export {
  ArtboardLayoutGuides,
  jsx_MN,
  react__kt,
  RowColumnLayoutGuide,
  SquareGridGuide,
};
export function installCanvasLayoutGuides(): () => void {
  return () => {
    react__kt = toModuleNamespace(load_react(), 1);
    jsx_MN = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ArtboardLayoutGuides = (0, react__kt.memo)(function ({
      guides: guides,
      w: w,
      h: h,
    }: Dynamic): Dynamic {
      return (
        <div
          aria-hidden={"true"}
          className={
            "pointer-events-none absolute inset-0 z-[12] overflow-hidden"
          }
        >
          {guides.map((guide?: Dynamic, guideIndex?: Dynamic): Dynamic => {
            if (guide.hidden === true) return null;
            let resolvedGuide: Dynamic = resolveArtboardGuide(guide, {
              w: w,
              h: h,
            });
            return resolvedGuide.kind === "grid" ? (
              <SquareGridGuide
                key={guideIndex}
                size={resolvedGuide.size}
                color={resolvedGuide.color}
              />
            ) : (
              <RowColumnLayoutGuide key={guideIndex} r={resolvedGuide} />
            );
          })}
        </div>
      );
    });
  };
}

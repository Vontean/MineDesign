import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { useViewportStore } from "./viewport-store";
import { load_react_jsx_runtime } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { toModuleNamespace } from "../module-helpers";
import { artboardRadiusCss } from "../platform/file-content";

var jsxCanvasPendingArtboards: Dynamic;
var CanvasPendingArtboardsActiveWaitingArrivedConfig: Dynamic;
var CanvasPendingArtboardsElementCache: Dynamic;
function PendingArtboardTitle({
  spec: spec,
  tone: tone,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let viewportStore: Dynamic = useViewportStore();
  return (
    <div
      ref={viewportStore.stamp}
      aria-hidden={"true"}
      data-mega-pending-title={""}
      data-testid={"mega-pending-title-" + spec.file}
      className={joinClassNames(
        "pointer-events-none absolute bottom-full left-0 flex h-6 items-center text-xs select-none",
        CanvasPendingArtboardsActiveWaitingArrivedConfig[tone],
        className,
      )}
      style={{
        width: `calc(${spec.w}px * var(--mega-scale))`,
        transform: "scale(var(--mega-inv-scale))",
        transformOrigin: "left bottom",
        marginBottom: "calc(4px * var(--mega-inv-scale))",
      }}
    >
      <span className={"truncate"}>
        {spec.title ?? (spec.file.replace(/\.dc\.html$/, ""))}
      </span>
    </div>
  );
}
function PendingArtboardFace({
  spec: spec,
  sheen: sheen,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      aria-hidden={"true"}
      data-testid={"mega-pending-face-" + spec.file}
      className={joinClassNames(
        "pointer-events-none absolute inset-0 bg-om-bg-canvas mc-claude-box",
        sheen && "mc-claude-sheen",
        className,
      )}
      style={{
        borderRadius: artboardRadiusCss(spec.radius),
      }}
    />
  );
}
function PendingArtboards({
  boards: boards,
  sheen: sheen,
}: Dynamic): Dynamic {
  useUiLocale();
  return boards.map(
    (pending?: Dynamic): Dynamic =>
      (() => {
        const _Component = "div";
        const _props = {
          "data-mega-pending": pending.spec.file,
          "data-active": pending.active ? "" : undefined,
          className: "pointer-events-none absolute",
          style: {
            left: pending.spec.x,
            top: pending.spec.y,
            width: pending.spec.w,
            height: pending.spec.h,
          },
          children: [
            <PendingArtboardTitle
              spec={pending.spec}
              tone={pending.active ? "active" : "waiting"}
            />,
            <PendingArtboardFace
              spec={pending.spec}
              sheen={sheen && pending.active}
            />,
          ],
        } as const;
        const _key = pending.spec.file;
        return <_Component key={_key} {..._props} />;
      })(),
  );
}
function artboardAboveDistances(artboards?: Dynamic): Dynamic {
  let cachedDistances: Dynamic = CanvasPendingArtboardsElementCache.get(artboards);
  if (cachedDistances) return cachedDistances;
  let distances: Dynamic = new Map();
  for (let artboard of artboards as Dynamic) {
    if (artboard.frameless) continue;
    let minDistance: Dynamic = 1 / 0;
    for (let otherArtboard of artboards as Dynamic) {
      if (
        otherArtboard === artboard ||
        otherArtboard.x >= artboard.x + artboard.w ||
        otherArtboard.x + otherArtboard.w <= artboard.x
      )
        continue;
      let gap: Dynamic = artboard.y - (otherArtboard.y + otherArtboard.h);
      gap >= 0 && gap < minDistance && (minDistance = gap);
    }
    minDistance !== 1 / 0 && distances.set(artboard.file, minDistance);
  }
  CanvasPendingArtboardsElementCache.set(artboards, distances);
  return distances;
}
function artboardTitleHeight(zoomScale?: Dynamic): Dynamic {
  return 28 / zoomScale;
}
function shouldHideArtboardTitle(titleState?: Dynamic): Dynamic {
  return !(
    titleState.phoneCanvas ||
    titleState.selected ||
    titleState.renaming ||
    titleState.playing ||
    titleState.tweaksOpen ||
    titleState.armedByTouch ||
    titleState.hovered
  );
}
function isAboveTitleRect(
  pointerX?: Dynamic,
  pointerY?: Dynamic,
  titleRect?: Dynamic,
): Dynamic {
  return (
    pointerX >= titleRect.left &&
    pointerX <= titleRect.right &&
    pointerY <= titleRect.top &&
    pointerY >= titleRect.top - 4
  );
}
export {
  artboardAboveDistances,
  artboardTitleHeight,
  CanvasPendingArtboardsActiveWaitingArrivedConfig,
  CanvasPendingArtboardsElementCache,
  isAboveTitleRect,
  jsxCanvasPendingArtboards,
  PendingArtboardFace,
  PendingArtboards,
  PendingArtboardTitle,
  shouldHideArtboardTitle,
};
export function installCanvasPendingArtboards(): () => void {
  return () => {
    jsxCanvasPendingArtboards = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    CanvasPendingArtboardsActiveWaitingArrivedConfig = {
      active: "text-primary",
      waiting: "text-muted",
      arrived: "text-secondary",
      component: "text-pro",
    };
    CanvasPendingArtboardsElementCache = new WeakMap();
  };
}

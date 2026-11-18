import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getDropGhosts, markDropPerformance, subscribeDropGhosts, uploadingAnimationDelay } from "./working-state";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactCanvasPictureDropGhost: Dynamic;
var jsxCanvasPictureDropGhost: Dynamic;
function UploadingOverlay({ quiet = false }: Dynamic): Dynamic {
  useUiLocale();
  let [animationDelay]: Dynamic = (0, reactCanvasPictureDropGhost.useState)(
    uploadingAnimationDelay,
  );
  return (
    <span
      data-testid={"mega-uploading"}
      className={
        "om-uploading pointer-events-none absolute inset-0 block bg-fg-muted"
      }
      style={{
        animationDelay: animationDelay,
      }}
    >
      {!quiet && (<span role={"status"} className={"sr-only"}>
          {uiMessage("canvas.pictureDropGhost.uploadingImage")}
        </span>)}
    </span>
  );
}
function PictureDropGhost({
  x: x,
  y: y,
  w: w,
  h: h,
  clip: clip,
}: Dynamic): Dynamic {
  useUiLocale();
  (0, reactCanvasPictureDropGhost.useLayoutEffect)(
    (): Dynamic => markDropPerformance("ghost"),
    [],
  );
  return (
    <div
      data-testid={"mega-drop-ghost"}
      data-mega-chrome={"picture-pending"}
      aria-hidden={"true"}
      className={"pointer-events-none absolute z-30 overflow-hidden"}
      style={{
        left: clip.x,
        top: clip.y,
        width: clip.w,
        height: clip.h,
      }}
    >
      <div
        className={"absolute border border-border-strong bg-fg-muted/40"}
        style={{
          left: x - clip.x,
          top: y - clip.y,
          width: w,
          height: h,
        }}
      >
        <UploadingOverlay quiet={true} />
      </div>
    </div>
  );
}
function PictureDropGhosts({
  page: page,
  artboards: artboards,
}: Dynamic): Dynamic {
  useUiLocale();
  let dropGhosts: Dynamic = (0, reactCanvasPictureDropGhost.useSyncExternalStore)(
    subscribeDropGhosts,
    getDropGhosts,
  );
  return (
    <jsxCanvasPictureDropGhost.Fragment>
      {dropGhosts.map((ghost?: Dynamic): Dynamic => {
        if (ghost.file == null)
          return ghost.page === page
            ? (() => {
                const _Component = PictureDropGhost;
                const _props = {
                  x: ghost.x,
                  y: ghost.y,
                  w: ghost.w,
                  h: ghost.h,
                  clip: ghost,
                } as const;
                const _key = ghost.key;
                return <_Component key={_key} {..._props} />;
              })()
            : null;
        let artboard: Dynamic = artboards.find(
          (candidate?: Dynamic): Dynamic => candidate.file === ghost.file,
        );
        if (!artboard) return null;
        let clipLeft: Dynamic = Math.max(0, ghost.x),
          clipTop: Dynamic = Math.max(0, ghost.y),
          clipRight: Dynamic = Math.min(artboard.w, ghost.x + ghost.w),
          clipBottom: Dynamic = Math.min(artboard.h, ghost.y + ghost.h);
        return clipRight <= clipLeft || clipBottom <= clipTop
          ? null
          : (() => {
              const ClippedGhostElement = PictureDropGhost;
              const clippedGhostProps = {
                x: artboard.x + ghost.x,
                y: artboard.y + ghost.y,
                w: ghost.w,
                h: ghost.h,
                clip: {
                  x: artboard.x + clipLeft,
                  y: artboard.y + clipTop,
                  w: clipRight - clipLeft,
                  h: clipBottom - clipTop,
                },
              } as const;
              const clippedGhostKey = ghost.key;
              return <ClippedGhostElement key={clippedGhostKey} {...clippedGhostProps} />;
            })();
      })}
    </jsxCanvasPictureDropGhost.Fragment>
  );
}
export {
  jsxCanvasPictureDropGhost,
  PictureDropGhost,
  PictureDropGhosts,
  reactCanvasPictureDropGhost,
  UploadingOverlay,
};
export function installCanvasPictureDropGhost(): () => void {
  return () => {
    reactCanvasPictureDropGhost = toModuleNamespace(
      load_react(),
      1,
    );
    jsxCanvasPictureDropGhost = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

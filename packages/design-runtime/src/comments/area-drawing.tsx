import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var react_mi: Dynamic;
var jsx_O_: Dynamic;
var react_jw: Dynamic;
var commentAreaDragThreshold: Dynamic;
function CommentAreaOutline({
  rect: rect,
  origin: origin,
  handle: handle,
  onHandlePointerDown: onHandlePointerDown,
  kind: kind,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <jsx_O_.Fragment>
      <div
        aria-hidden={true}
        data-testid={"comment-area-outline"}
        data-kind={kind}
        className={
          "pointer-events-none absolute border border-dashed border-editor-comment-target"
        }
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
      {origin ? (<div
          aria-hidden={true}
          data-testid={"comment-area-origin"}
          className={
            "pointer-events-none absolute rounded-full ring-6 ring-inset ring-editor-comment-target"
          }
          style={{
            left: origin.x - 10 / 2,
            top: origin.y - 10 / 2,
            width: 10,
            height: 10,
            outline: "2px solid transparent",
            outlineOffset: -2,
          }}
        />) : (null)}
      {origin && handle ? (<div
          data-area-handle={""}
          className={"absolute rounded-full"}
          style={{
            left: origin.x - 18 / 2,
            top: origin.y - 18 / 2,
            width: 18,
            height: 18,
            cursor: "nwse-resize",
          }}
          onPointerDown={onHandlePointerDown}
        />) : (null)}
    </jsx_O_.Fragment>
  );
}
function useCommentAreaMarquee(handlers?: Dynamic): Dynamic {
  let [marquee, setMarquee]: Dynamic = (0, react_jw.useState)(null),
    handlersRef: Dynamic = (0, react_jw.useRef)(handlers);
  handlersRef.current = handlers;
  let activeDrawRef: Dynamic = (0, react_jw.useRef)(null),
    cancelDrawing: Dynamic = (): Dynamic => {
      activeDrawRef.current?.cleanup();
      activeDrawRef.current = null;
      setMarquee(null);
    };
  (0, react_jw.useEffect)(
    (): Dynamic => (): Dynamic => activeDrawRef.current?.cleanup(),
    [],
  );
  return {
    marquee: marquee,
    drawing: (): Dynamic => activeDrawRef.current !== null,
    start: (
      startEvent?: Dynamic,
      captureTarget?: Dynamic,
      resizeAnchor?: Dynamic,
    ): Dynamic => {
      let handlersAtStart: Dynamic = handlersRef.current,
        stageElement: Dynamic = handlersAtStart.stage(),
        anchorPoint: Dynamic =
          resizeAnchor ?? handlersAtStart.toLocal(startEvent.clientX, startEvent.clientY);
      if (!stageElement || anchorPoint == null) return false;
      cancelDrawing();
      let pointerId: Dynamic = startEvent.pointerId;
      try {
        captureTarget.setPointerCapture(pointerId);
      } catch {}
      let abortDrawing: Dynamic = (): Dynamic => {
          cancelDrawing();
          handlersRef.current.onNothing();
        },
        exceedsSlop: Dynamic = (moveEvent?: Dynamic): Dynamic =>
          Math.hypot(
            moveEvent.clientX - startEvent.clientX,
            moveEvent.clientY - startEvent.clientY,
          ) > handlersRef.current.slopPx,
        hasStartedDrag: Dynamic = false,
        handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
          if (moveEvent.pointerId !== pointerId) return;
          if ((moveEvent.buttons & 1) === 0) return abortDrawing();
          if (!hasStartedDrag && !exceedsSlop(moveEvent)) return;
          !hasStartedDrag && !resizeAnchor && handlersRef.current.onLive?.();
          hasStartedDrag = true;
          let bounds: Dynamic = stageElement.getBoundingClientRect();
          setMarquee({
            pin: anchorPoint,
            x1: moveEvent.clientX - bounds.left,
            y1: moveEvent.clientY - bounds.top,
            resizing: resizeAnchor !== undefined,
          });
        },
        handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
          if (upEvent.pointerId !== pointerId) return;
          cancelDrawing();
          let handlersAtRelease: Dynamic = handlersRef.current;
          if (upEvent.button !== 0) return handlersAtRelease.onNothing();
          if (!exceedsSlop(upEvent)) {
            resizeAnchor || handlersAtRelease.onClick(upEvent);
            return handlersAtRelease.onNothing();
          }
          let endLocal: Dynamic = handlersAtRelease.toLocal(
              upEvent.clientX,
              upEvent.clientY,
            ),
            anchorClient: Dynamic = handlersAtRelease.toClient(anchorPoint);
          if (
            endLocal == null ||
            !anchorClient ||
            Math.abs(upEvent.clientX - anchorClient.x) < commentAreaDragThreshold ||
            Math.abs(upEvent.clientY - anchorClient.y) < commentAreaDragThreshold
          )
            return handlersAtRelease.onNothing();
          handlersAtRelease.onArea({
            c0: anchorPoint,
            c1: endLocal,
            at: resizeAnchor
              ? anchorClient
              : {
                  x: upEvent.clientX,
                  y: upEvent.clientY,
                },
            resizing: resizeAnchor !== undefined,
          });
        },
        handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
          event.key !== "Escape" ||
            !activeDrawRef.current ||
            (event.preventDefault(), event.stopPropagation(), abortDrawing());
        },
        handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
          cancelEvent.pointerId === pointerId && abortDrawing();
        };
      (window as Dynamic).addEventListener("pointermove", handlePointerMove, true);
      (window as Dynamic).addEventListener("pointerup", handlePointerUp, true);
      (window as Dynamic).addEventListener("pointercancel", handlePointerCancel, true);
      (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
      (window as Dynamic).addEventListener("blur", abortDrawing);
      activeDrawRef.current = {
        id: pointerId,
        cleanup: (): Dynamic => {
          (window as Dynamic).removeEventListener(
            "pointermove",
            handlePointerMove,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointerup",
            handlePointerUp,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointercancel",
            handlePointerCancel,
            true,
          );
          (window as Dynamic).removeEventListener("keydown", handleKeyDown, true);
          (window as Dynamic).removeEventListener("blur", abortDrawing);
          try {
            captureTarget.hasPointerCapture(pointerId) &&
              captureTarget.releasePointerCapture(pointerId);
          } catch {}
        },
      };
      return true;
    },
    cancel: cancelDrawing,
  };
}
function usePendingCommentArea(isComposing?: Dynamic, scope?: Dynamic): Dynamic {
  let [drawnRect, setDrawnRect]: Dynamic = (0, react_jw.useState)(null),
    heldRef: Dynamic = (0, react_jw.useRef)(null),
    latestRef: Dynamic = (0, react_jw.useRef)({
      composing: isComposing,
      scope: scope,
    });
  latestRef.current = {
    composing: isComposing,
    scope: scope,
  };
  let restoreHeld: Dynamic = (): Dynamic => {
      let current: Dynamic = heldRef.current;
      setDrawnRect(
        latestRef.current.composing && current?.scope === latestRef.current.scope
          ? current.rect
          : null,
      );
    },
    clearHeld: Dynamic = (): Dynamic => {
      heldRef.current = null;
      setDrawnRect(null);
    };
  (0, react_jw.useEffect)((): Dynamic => {
    isComposing || clearHeld();
  }, [isComposing]);
  (0, react_jw.useEffect)(restoreHeld, [scope]);
  return {
    drawn: drawnRect,
    show: setDrawnRect,
    hold: (rect?: Dynamic, heldScope?: Dynamic): Dynamic => {
      heldRef.current = {
        rect: rect,
        scope: heldScope,
      };
    },
    restore: restoreHeld,
    clear: clearHeld,
  };
}
export {
  commentAreaDragThreshold,
  CommentAreaOutline,
  jsx_O_,
  react_jw,
  react_mi,
  useCommentAreaMarquee,
  usePendingCommentArea,
};
export function installCommentsAreaDrawing(): () => void {
  return () => {
    react_mi = toModuleNamespace(load_react(), 1);
    jsx_O_ = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    react_jw = toModuleNamespace(load_react(), 1);
    commentAreaDragThreshold = 12;
  };
}

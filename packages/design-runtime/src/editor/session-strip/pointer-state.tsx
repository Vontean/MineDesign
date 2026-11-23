/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { blockingOverlaySelector } from "../chrome/overlay-state";
import { refreshSessionStripPointers } from "./session-strip";
import { ToolbarPrimitivesMediaQuery } from "../toolbar/primitives";
import { toModuleNamespace } from "../../module-helpers";

var reactSessionStripPointerState: Dynamic;
var jsxSessionStripPointerState: Dynamic;
var lastStripPointer: Dynamic;
var SessionStripPointerStateObservedElements: Dynamic;
var SessionStripPointerStateNow: Dynamic;
var SessionStripPointerStateLimit: Dynamic;
var pointerMoveThresholdPx: Dynamic;
var pointerSettleWindowMs: Dynamic;
var pointerEventMaxAgeMs: Dynamic;
var SessionStripPointerStateConstant: Dynamic;
var stripHoldMaxDurationMs: Dynamic;
var SessionStripPointerStateGetBoundingClientRect: Dynamic;
var SessionStripPointerStateAbs: Dynamic;
var SessionStripPointerStateSubscribers: Dynamic;
var SessionStripPointerStateCurrentState: Dynamic;
var pointerSuppressionDeadline: Dynamic;
var SessionStripPointerStateHandler: Dynamic;
var elementMovementThresholdPx: Dynamic;
var SessionStripPointerStateElementCache: Dynamic;
var SessionStripContext: Dynamic;
function recentStripPointer(
  pointer?: Dynamic,
  allowStray: Dynamic = false,
): Dynamic {
  return pointer === null ||
    pointer.ended === null ||
    (pointer.onStrip && !(allowStray && pointer.stray === true)) ||
    pointer.inPopup ||
    pointer.mouse ||
    !(pointer.ended.at - pointer.began.at >= 0)
    ? null
    : pointer;
}
function observeSessionStripPointers(root?: Dynamic): Dynamic {
  SessionStripPointerStateObservedElements.has(root) ||
    (SessionStripPointerStateObservedElements.add(root),
    root.addEventListener(
      "pointerdown",
      (event?: Dynamic): Dynamic => {
        if (event.isPrimary === false) return;
        let now: Dynamic = SessionStripPointerStateNow();
        for (let element of Array.from(
          root.querySelectorAll("[data-mc-through]"),
        ) as Dynamic) {
          let expiresAt: Dynamic = Number(
            element.getAttribute("data-mc-through") || Number.NaN,
          );
          (now !== null &&
            now < expiresAt &&
            expiresAt - now <= stripHoldMaxDurationMs) ||
            element.removeAttribute("data-mc-through");
        }
        let target: Dynamic = event.target,
          stripElement: Dynamic = target?.closest?.("[data-mc-strip]") ?? null,
          pointerRecord: Dynamic = {
            onStrip: stripElement !== null,
            inPopup:
              target?.closest?.(blockingOverlaySelector) != null,
            mouse: event.pointerType === "mouse",
            began: {
              x: event.clientX,
              y: event.clientY,
              at: event.timeStamp,
              perf: now,
            },
            ended: null,
          },
          eventAgeMs: Dynamic = now === null ? -1 : now - event.timeStamp;
        stripElement !== null &&
          event.pointerType !== "mouse" &&
          eventAgeMs >= 0 &&
          eventAgeMs <= pointerEventMaxAgeMs &&
          (pointerRecord.early = event.timeStamp < sessionStripHoldUntil(stripElement));
        let previousPointer: Dynamic = recentStripPointer(
            lastStripPointer,
            true,
          ),
          sincePreviousEndMs: Dynamic =
            previousPointer === null ? -1 : event.timeStamp - previousPointer.ended.at,
          previousRunAt: Dynamic =
            previousPointer === null ? 0 : (previousPointer.runAt ?? previousPointer.ended.at);
        previousPointer !== null &&
          sincePreviousEndMs >= 0 &&
          sincePreviousEndMs <= SessionStripPointerStateLimit &&
          event.timeStamp - previousRunAt < pointerSettleWindowMs &&
          ((pointerRecord.runAt = previousRunAt),
          (pointerRecord.stray =
            event.pointerType !== "mouse" &&
            stripElement !== null &&
            SessionStripPointerStateGetBoundingClientRect(
              stripElement,
              previousPointer.ended.x,
              previousPointer.ended.y,
            )));
        lastStripPointer = pointerRecord;
      },
      true,
    ),
    root.addEventListener(
      "pointerup",
      (event?: Dynamic): Dynamic => {
        event.isPrimary !== false &&
          lastStripPointer !== null &&
          (lastStripPointer.ended = {
            at: event.timeStamp,
            x: event.clientX,
            y: event.clientY,
            perf: SessionStripPointerStateNow(),
          });
        refreshSessionStripPointers();
      },
      true,
    ));
}
function suppressSessionStripClick(event?: Dynamic): Dynamic {
  let pointer: Dynamic = lastStripPointer;
  return event.detail === 0 || pointer === null
    ? false
    : pointer.stray === true || pointer.early === true
      ? SessionStripPointerStateAbs(
          event,
          pointer.began.at,
          pointer.began.x,
          pointer.began.y,
        ) ||
        (pointer.ended !== null &&
          SessionStripPointerStateAbs(
            event,
            pointer.ended.at,
            pointer.ended.x,
            pointer.ended.y,
          ))
      : !pointer.onStrip &&
        pointer.ended !== null &&
        SessionStripPointerStateAbs(
          event,
          pointer.ended.at,
          pointer.ended.x,
          pointer.ended.y,
        );
}
function sessionStripUsesTouch(): Dynamic {
  try {
    return (
      typeof matchMedia == "function" &&
      matchMedia(ToolbarPrimitivesMediaQuery)?.matches === true
    );
  } catch {
    return false;
  }
}
function recordSessionStripOcclusion(
  strip?: Dynamic,
  shouldTrack?: Dynamic,
): Dynamic {
  let entry: Dynamic = SessionStripPointerStateElementCache.get(strip);
  if (!shouldTrack) {
    entry !== undefined && SessionStripPointerStateElementCache.delete(strip);
    return;
  }
  let now: Dynamic = SessionStripPointerStateNow(),
    bounds: Dynamic = strip.getBoundingClientRect(),
    hasMoved: Dynamic =
      entry === undefined ||
      Math.abs(bounds.left - entry.left) > elementMovementThresholdPx ||
      Math.abs(bounds.top - entry.top) > elementMovementThresholdPx,
    lastPointer: Dynamic = lastStripPointer,
    lastPointerAt: Dynamic =
      lastPointer === null
        ? null
        : lastPointer.ended === null
          ? lastPointer.began.perf
          : lastPointer.ended.perf,
    sinceLastPointerMs: Dynamic = now === null || lastPointerAt === null ? -1 : now - lastPointerAt,
    isStripPointerSettling: Dynamic =
      lastPointer !== null &&
      ((lastPointer.onStrip && lastPointer.stray !== true && lastPointer.early !== true) ||
        lastPointer.inPopup) &&
      sinceLastPointerMs >= 0 &&
      sinceLastPointerMs <=
        (lastPointer.ended === null
          ? pointerSettleWindowMs
          : SessionStripPointerStateLimit);
  isStripPointerSettling &&
    entry !== undefined &&
    ([entry.left, entry.top] = [bounds.left, bounds.top]);
  if (
    !hasMoved ||
    now === null ||
    !(bounds.width > 0 && bounds.height > 0) ||
    !sessionStripUsesTouch()
  )
    return;
  if (isStripPointerSettling) {
    entry === undefined &&
      SessionStripPointerStateElementCache.set(strip, {
        left: bounds.left,
        top: bounds.top,
        end: 0,
        since: now,
        movedAt: 0,
      });
    return;
  }
  let since: Dynamic =
      entry !== undefined &&
      (now < entry.end ||
        now - entry.movedAt <= pointerSettleWindowMs)
        ? entry.since
        : now,
    nextEntry: Dynamic = {
      left: bounds.left,
      top: bounds.top,
      end: Math.min(
        now +
          SessionStripPointerStateConstant +
          SessionStripPointerStateLimit,
        since + stripHoldMaxDurationMs,
      ),
      since: since,
      movedAt: now,
    };
  SessionStripPointerStateElementCache.set(strip, nextEntry);
  SessionStripPointerStateHandler((): Dynamic => {
    let currentTime: Dynamic = SessionStripPointerStateNow();
    currentTime !== null &&
      SessionStripPointerStateElementCache.get(strip) === nextEntry &&
      (nextEntry.end = Math.min(
        nextEntry.end,
        currentTime + SessionStripPointerStateLimit,
      ));
    refreshSessionStripPointers();
  });
}
function sessionStripHoldUntil(strip?: Dynamic): Dynamic {
  let pointer: Dynamic = recentStripPointer(lastStripPointer),
    pointerHoldUntil: Dynamic =
      pointer !== null &&
      pointer.end !== undefined &&
      SessionStripPointerStateGetBoundingClientRect(
        strip,
        pointer.ended.x,
        pointer.ended.y,
      )
        ? pointer.end
        : 0;
  return Math.max(
    SessionStripPointerStateElementCache.get(strip)?.end ?? 0,
    pointerHoldUntil,
  );
}
function sessionStripPointerDeadline(
  strip?: Dynamic,
  now?: Dynamic,
): Dynamic {
  return Math.max(
    SessionStripPointerStateElementCache.get(strip)?.end ?? 0,
    sessionStripReleaseDeadline(strip, now),
  );
}
function sessionStripReleaseDeadline(
  strip?: Dynamic,
  now?: Dynamic,
): Dynamic {
  let pointer: Dynamic = recentStripPointer(lastStripPointer);
  if (pointer === null || pointer.ended.perf === null) return 0;
  if (pointer.end === undefined) {
    let sinceReleaseMs: Dynamic = now - pointer.ended.perf;
    if (
      !(sinceReleaseMs >= 0 && sinceReleaseMs <= pointerEventMaxAgeMs) ||
      !SessionStripPointerStateGetBoundingClientRect(
        strip,
        pointer.ended.x,
        pointer.ended.y,
      )
    )
      return 0;
    let beganBeforeFloor: Dynamic =
      pointerSuppressionDeadline !== null &&
      pointer.began.perf !== null &&
      pointer.began.perf < pointerSuppressionDeadline;
    beganBeforeFloor ||
      (pointerSuppressionDeadline =
        now +
        SessionStripPointerStateConstant +
        pointerSettleWindowMs);
    let floorDeadline: Dynamic = pointerSuppressionDeadline ?? 0;
    pointer.end = Math.min(
      now +
        SessionStripPointerStateConstant +
        SessionStripPointerStateLimit,
      floorDeadline,
    );
    SessionStripPointerStateHandler((): Dynamic => {
      let currentTime: Dynamic = SessionStripPointerStateNow();
      currentTime !== null &&
        !beganBeforeFloor &&
        pointerSuppressionDeadline === floorDeadline &&
        (pointerSuppressionDeadline = Math.min(
          floorDeadline,
          currentTime + pointerSettleWindowMs,
        ));
      currentTime !== null &&
        pointer.end !== undefined &&
        (pointer.end = Math.min(
          pointer.end,
          currentTime + SessionStripPointerStateLimit,
          pointerSuppressionDeadline ?? 0,
        ));
      refreshSessionStripPointers();
    });
  }
  return now < pointer.end &&
    SessionStripPointerStateGetBoundingClientRect(
      strip,
      pointer.ended.x,
      pointer.ended.y,
    )
    ? pointer.end
    : 0;
}
export {
  jsxSessionStripPointerState,
  observeSessionStripPointers,
  reactSessionStripPointerState,
  recentStripPointer,
  recordSessionStripOcclusion,
  SessionStripContext,
  sessionStripHoldUntil,
  sessionStripPointerDeadline,
  SessionStripPointerStateAbs,
  lastStripPointer as SessionStripPointerStateAlias,
  SessionStripPointerStateConstant,
  SessionStripPointerStateCurrentState,
  SessionStripPointerStateElementCache,
  SessionStripPointerStateGetBoundingClientRect,
  SessionStripPointerStateHandler,
  SessionStripPointerStateLimit,
  pointerMoveThresholdPx,
  pointerSettleWindowMs,
  pointerEventMaxAgeMs,
  stripHoldMaxDurationMs,
  elementMovementThresholdPx,
  pointerSuppressionDeadline as SessionStripPointerStateMinValue,
  SessionStripPointerStateNow,
  SessionStripPointerStateObservedElements,
  SessionStripPointerStateSubscribers,
  sessionStripReleaseDeadline,
  sessionStripUsesTouch,
  suppressSessionStripClick,
};
export function set_SessionStripPointerStateCurrentState(nextState: any): any {
  SessionStripPointerStateCurrentState = nextState;
  return nextState;
}
export function installEditorSessionStripPointerState(): () => void {
  return () => {
    reactSessionStripPointerState = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxSessionStripPointerState = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    lastStripPointer = null;
    SessionStripPointerStateObservedElements = new WeakSet();
    SessionStripPointerStateNow = (): Dynamic =>
      typeof performance === "undefined" ? null : performance.now();
    SessionStripPointerStateLimit = 500;
    pointerMoveThresholdPx = 8;
    pointerSettleWindowMs = 1e3;
    pointerEventMaxAgeMs = 5e3;
    SessionStripPointerStateConstant = 3e3;
    stripHoldMaxDurationMs = 8e3;
    SessionStripPointerStateGetBoundingClientRect = (
      element?: Dynamic,
      pointX?: Dynamic,
      pointY?: Dynamic,
    ): Dynamic => {
      let bounds: Dynamic = element.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.height > 0 &&
        pointX >= bounds.left &&
        pointX <= bounds.right &&
        pointY >= bounds.top &&
        pointY <= bounds.bottom
      );
    };
    typeof document !== "undefined" && observeSessionStripPointers(document);
    SessionStripPointerStateAbs = (
      event?: Dynamic,
      startAt?: Dynamic,
      startX?: Dynamic,
      startY?: Dynamic,
    ): Dynamic =>
      Math.abs(event.timeStamp - startAt) <= SessionStripPointerStateLimit &&
      Math.abs(event.clientX - startX) <= pointerMoveThresholdPx &&
      Math.abs(event.clientY - startY) <= pointerMoveThresholdPx;
    SessionStripPointerStateSubscribers = new Set();
    SessionStripPointerStateCurrentState = null;
    pointerSuppressionDeadline = null;
    SessionStripPointerStateHandler = (callback?: Dynamic): Dynamic => {
      typeof requestAnimationFrame == "function" &&
        requestAnimationFrame((): Dynamic => requestAnimationFrame(callback));
    };
    elementMovementThresholdPx = 4;
    SessionStripPointerStateElementCache = new WeakMap();
    SessionStripContext = (0, reactSessionStripPointerState.createContext)(
      true,
    );
  };
}

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
var SessionStripPointerStateAlias: Dynamic;
var SessionStripPointerStateObservedElements: Dynamic;
var SessionStripPointerStateNow: Dynamic;
var SessionStripPointerStateLimit: Dynamic;
var SessionStripPointerStateLimit_2: Dynamic;
var SessionStripPointerStateLimit_3: Dynamic;
var SessionStripPointerStateLimit_4: Dynamic;
var SessionStripPointerStateConstant: Dynamic;
var SessionStripPointerStateLimit_5: Dynamic;
var SessionStripPointerStateGetBoundingClientRect: Dynamic;
var SessionStripPointerStateAbs: Dynamic;
var SessionStripPointerStateSubscribers: Dynamic;
var SessionStripPointerStateCurrentState: Dynamic;
var SessionStripPointerStateMinValue: Dynamic;
var SessionStripPointerStateHandler: Dynamic;
var SessionStripPointerStateLimit_6: Dynamic;
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
            expiresAt - now <= SessionStripPointerStateLimit_5) ||
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
          eventAgeMs <= SessionStripPointerStateLimit_4 &&
          (pointerRecord.early = event.timeStamp < sessionStripHoldUntil(stripElement));
        let previousPointer: Dynamic = recentStripPointer(
            SessionStripPointerStateAlias,
            true,
          ),
          sincePreviousEndMs: Dynamic =
            previousPointer === null ? -1 : event.timeStamp - previousPointer.ended.at,
          previousRunAt: Dynamic =
            previousPointer === null ? 0 : (previousPointer.runAt ?? previousPointer.ended.at);
        previousPointer !== null &&
          sincePreviousEndMs >= 0 &&
          sincePreviousEndMs <= SessionStripPointerStateLimit &&
          event.timeStamp - previousRunAt < SessionStripPointerStateLimit_3 &&
          ((pointerRecord.runAt = previousRunAt),
          (pointerRecord.stray =
            event.pointerType !== "mouse" &&
            stripElement !== null &&
            SessionStripPointerStateGetBoundingClientRect(
              stripElement,
              previousPointer.ended.x,
              previousPointer.ended.y,
            )));
        SessionStripPointerStateAlias = pointerRecord;
      },
      true,
    ),
    root.addEventListener(
      "pointerup",
      (event?: Dynamic): Dynamic => {
        event.isPrimary !== false &&
          SessionStripPointerStateAlias !== null &&
          (SessionStripPointerStateAlias.ended = {
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
  let pointer: Dynamic = SessionStripPointerStateAlias;
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
      Math.abs(bounds.left - entry.left) > SessionStripPointerStateLimit_6 ||
      Math.abs(bounds.top - entry.top) > SessionStripPointerStateLimit_6,
    lastPointer: Dynamic = SessionStripPointerStateAlias,
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
          ? SessionStripPointerStateLimit_3
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
        now - entry.movedAt <= SessionStripPointerStateLimit_3)
        ? entry.since
        : now,
    nextEntry: Dynamic = {
      left: bounds.left,
      top: bounds.top,
      end: Math.min(
        now +
          SessionStripPointerStateConstant +
          SessionStripPointerStateLimit,
        since + SessionStripPointerStateLimit_5,
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
  let pointer: Dynamic = recentStripPointer(SessionStripPointerStateAlias),
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
  let pointer: Dynamic = recentStripPointer(SessionStripPointerStateAlias);
  if (pointer === null || pointer.ended.perf === null) return 0;
  if (pointer.end === undefined) {
    let sinceReleaseMs: Dynamic = now - pointer.ended.perf;
    if (
      !(sinceReleaseMs >= 0 && sinceReleaseMs <= SessionStripPointerStateLimit_4) ||
      !SessionStripPointerStateGetBoundingClientRect(
        strip,
        pointer.ended.x,
        pointer.ended.y,
      )
    )
      return 0;
    let beganBeforeFloor: Dynamic =
      SessionStripPointerStateMinValue !== null &&
      pointer.began.perf !== null &&
      pointer.began.perf < SessionStripPointerStateMinValue;
    beganBeforeFloor ||
      (SessionStripPointerStateMinValue =
        now +
        SessionStripPointerStateConstant +
        SessionStripPointerStateLimit_3);
    let floorDeadline: Dynamic = SessionStripPointerStateMinValue ?? 0;
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
        SessionStripPointerStateMinValue === floorDeadline &&
        (SessionStripPointerStateMinValue = Math.min(
          floorDeadline,
          currentTime + SessionStripPointerStateLimit_3,
        ));
      currentTime !== null &&
        pointer.end !== undefined &&
        (pointer.end = Math.min(
          pointer.end,
          currentTime + SessionStripPointerStateLimit,
          SessionStripPointerStateMinValue ?? 0,
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
  SessionStripPointerStateAlias,
  SessionStripPointerStateConstant,
  SessionStripPointerStateCurrentState,
  SessionStripPointerStateElementCache,
  SessionStripPointerStateGetBoundingClientRect,
  SessionStripPointerStateHandler,
  SessionStripPointerStateLimit,
  SessionStripPointerStateLimit_2,
  SessionStripPointerStateLimit_3,
  SessionStripPointerStateLimit_4,
  SessionStripPointerStateLimit_5,
  SessionStripPointerStateLimit_6,
  SessionStripPointerStateMinValue,
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
    SessionStripPointerStateAlias = null;
    SessionStripPointerStateObservedElements = new WeakSet();
    SessionStripPointerStateNow = (): Dynamic =>
      typeof performance === "undefined" ? null : performance.now();
    SessionStripPointerStateLimit = 500;
    SessionStripPointerStateLimit_2 = 8;
    SessionStripPointerStateLimit_3 = 1e3;
    SessionStripPointerStateLimit_4 = 5e3;
    SessionStripPointerStateConstant = 3e3;
    SessionStripPointerStateLimit_5 = 8e3;
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
      Math.abs(event.clientX - startX) <= SessionStripPointerStateLimit_2 &&
      Math.abs(event.clientY - startY) <= SessionStripPointerStateLimit_2;
    SessionStripPointerStateSubscribers = new Set();
    SessionStripPointerStateCurrentState = null;
    SessionStripPointerStateMinValue = null;
    SessionStripPointerStateHandler = (callback?: Dynamic): Dynamic => {
      typeof requestAnimationFrame == "function" &&
        requestAnimationFrame((): Dynamic => requestAnimationFrame(callback));
    };
    SessionStripPointerStateLimit_6 = 4;
    SessionStripPointerStateElementCache = new WeakMap();
    SessionStripContext = (0, reactSessionStripPointerState.createContext)(
      true,
    );
  };
}

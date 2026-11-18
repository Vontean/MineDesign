/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var CanvasImageDecodeSchedulerSubscribers: Dynamic;
var CanvasImageDecodeSchedulerCache: Dynamic;
var isImageDecodeQueued: Dynamic;
function scheduleImageDecode(requester?: Dynamic, startDecode?: Dynamic): Dynamic {
  CanvasImageDecodeSchedulerSubscribers.has(requester) ||
  CanvasImageDecodeSchedulerSubscribers.size < 4
    ? (CanvasImageDecodeSchedulerSubscribers.add(requester), startDecode())
    : CanvasImageDecodeSchedulerCache.set(requester, startDecode);
  return (): Dynamic => {
    CanvasImageDecodeSchedulerCache.delete(requester);
    if (!CanvasImageDecodeSchedulerSubscribers.delete(requester)) return;
    let nextQueued: Dynamic = CanvasImageDecodeSchedulerCache.entries().next();
    if (nextQueued.done) return;
    let [nextRequester, startNextDecode]: Dynamic = nextQueued.value;
    CanvasImageDecodeSchedulerCache.delete(nextRequester);
    CanvasImageDecodeSchedulerSubscribers.add(nextRequester);
    startNextDecode();
  };
}
function isTouchSelectionStart(pointerType?: Dynamic, hasSelectionFlag?: Dynamic): Dynamic {
  return pointerType === "touch" && !hasSelectionFlag;
}
function watchPointerRelease(
  downEvent?: Dynamic,
  onRelease?: Dynamic,
  eventTarget: Dynamic = window,
): Dynamic {
  if (downEvent.isPrimary === false) return (): Dynamic => {};
  let { pointerId: pointerId, clientX: startX, clientY: startY }: Dynamic = downEvent,
    stopWatching: Dynamic = (): Dynamic => {
      eventTarget.removeEventListener("pointerup", handlePointerUp);
      eventTarget.removeEventListener("pointercancel", handlePointerCancel);
      eventTarget.removeEventListener("pointerdown", handleOtherPointerDown);
    },
    handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
      upEvent.pointerId === pointerId &&
        (stopWatching(),
        !(upEvent.button != null && upEvent.button !== 0) &&
          Math.hypot(upEvent.clientX - startX, upEvent.clientY - startY) <=
            10 &&
          onRelease(upEvent));
    },
    handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
      cancelEvent.pointerId === pointerId && stopWatching();
    },
    handleOtherPointerDown: Dynamic = (otherEvent?: Dynamic): Dynamic => {
      otherEvent !== downEvent &&
        (otherEvent.pointerType === "touch" || otherEvent.pointerId === pointerId) &&
        stopWatching();
    };
  eventTarget.addEventListener("pointerup", handlePointerUp);
  eventTarget.addEventListener("pointercancel", handlePointerCancel);
  eventTarget.addEventListener("pointerdown", handleOtherPointerDown);
  return stopWatching;
}
function preventTouchScroll(scrollTarget?: Dynamic): Dynamic {
  if (!scrollTarget) return (): Dynamic => {};
  let handleTouchStart: Dynamic = (touchEvent?: Dynamic): Dynamic => {
    touchEvent.cancelable && touchEvent.preventDefault();
  };
  scrollTarget.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });
  return (): Dynamic => scrollTarget.removeEventListener("touchstart", handleTouchStart);
}
function prefersDragGesture(pointerEvent?: Dynamic, hasSelectionFlag?: Dynamic): Dynamic {
  return pointerEvent.pointerType !== "mouse" || pointerEvent.shiftKey || !hasSelectionFlag;
}
export {
  CanvasImageDecodeSchedulerCache,
  CanvasImageDecodeSchedulerSubscribers,
  isImageDecodeQueued,
  isTouchSelectionStart,
  prefersDragGesture,
  preventTouchScroll,
  scheduleImageDecode,
  watchPointerRelease,
};
export function installCanvasImageDecodeScheduler(): () => void {
  return () => {
    CanvasImageDecodeSchedulerSubscribers = new Set();
    CanvasImageDecodeSchedulerCache = new Map();
    isImageDecodeQueued = (requester?: Dynamic): Dynamic =>
      CanvasImageDecodeSchedulerCache.has(requester);
  };
}

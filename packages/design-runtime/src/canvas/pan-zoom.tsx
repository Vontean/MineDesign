/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeCdsIndex } from "../cds/index";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { PlatformFileContentMin } from "../platform/file-content";

var CanvasPanZoomLimit: Dynamic;
var wheelAfterGestureMs: Dynamic;
var CanvasPanZoomGesturestartGesturechangeGestureendValues: Dynamic;
var CanvasPanZoomTouchstartTouchendTouchcancelValues: Dynamic;
var CanvasPanZoomCache: Dynamic;
var CanvasPanZoomResolvedValue: Dynamic;
var canvasGestureActive: Dynamic;
var CanvasPanZoomTouches: Dynamic;
var CanvasPanZoomKeys: Dynamic;
var CanvasPanZoomCtrlKey: Dynamic;
var CanvasPanZoomDefaultPrevented: Dynamic;
var CanvasPanZoomSet: Dynamic;
var reactCanvasPanZoom: Dynamic;
var CanvasPanZoomRound: Dynamic;
var CanvasPanZoomScrollTop: Dynamic;
function zoomViewportAtPoint(
  viewport?: Dynamic,
  anchorX?: Dynamic,
  anchorY?: Dynamic,
  factor?: Dynamic,
  limits?: Dynamic,
): Dynamic {
  let scale: Dynamic = Math.min(
    limits?.maxScale ?? 40,
    Math.max(limits?.minScale ?? 0.05, viewport.scale * factor),
  );
  if (scale === viewport.scale) return viewport;
  let worldX: Dynamic = viewport.x + anchorX / viewport.scale,
    worldY: Dynamic = viewport.y + anchorY / viewport.scale;
  return {
    x: worldX - anchorX / scale,
    y: worldY - anchorY / scale,
    scale: scale,
  };
}
function panViewport(
  viewport?: Dynamic,
  deltaX?: Dynamic,
  deltaY?: Dynamic,
): Dynamic {
  return deltaX === 0 && deltaY === 0
    ? viewport
    : {
        x: viewport.x - deltaX / viewport.scale,
        y: viewport.y - deltaY / viewport.scale,
        scale: viewport.scale,
      };
}
function wheelZoomFactor(deltaY?: Dynamic): Dynamic {
  return Math.min(1.25, Math.max(0.8, Math.exp(-deltaY * 0.01)));
}
function createWheelGestureDecider(idleGapMs: Dynamic = 200): Dynamic {
  let currentMode: Dynamic,
    lastEventTime: Dynamic = -1 / 0;
  return {
    decide(
      timeStamp: Dynamic,
      isZoomModifier: Dynamic,
      hasDelta: Dynamic,
      allowNative: Dynamic,
    ): Dynamic {
      if (isZoomModifier) {
        currentMode = undefined;
        lastEventTime = timeStamp;
        return "zoom";
      }
      timeStamp - lastEventTime > idleGapMs && (currentMode = undefined);
      lastEventTime = timeStamp;
      if (currentMode === undefined) {
        if (!hasDelta) return "consume";
        currentMode = allowNative() ? "native" : "pan";
      }
      return currentMode;
    },
  };
}
function installCanvasPanZoom_local(config?: Dynamic): Dynamic {
  let element: Dynamic = config.element,
    touchAction: Dynamic = element.style.touchAction;
  element.style.touchAction = "none";
  let resetScroll: Dynamic = (): Dynamic => {
    element.scrollLeft !== 0 && (element.scrollLeft = 0);
    element.scrollTop !== 0 && (element.scrollTop = 0);
  };
  resetScroll();
  element.addEventListener("scroll", resetScroll, {
    passive: true,
  });
  let touchPanAllowed: Dynamic = new Map(),
    isScrollableTarget: Dynamic = (target?: Dynamic): Dynamic => {
      let node: Dynamic = target ?? null,
        boundary: Dynamic = element;
      for (; node && node !== boundary; ) {
        let tagName: Dynamic = node.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "SELECT" ||
          tagName === "TEXTAREA" ||
          node.isContentEditable === true
        )
          return true;
        if (tagName !== undefined) {
          let computedStyle: Dynamic;
          try {
            computedStyle = (window as Dynamic).getComputedStyle(node);
          } catch {
            computedStyle = undefined;
          }
          if (computedStyle) {
            let canScrollY: Dynamic =
                (computedStyle.overflowY === "auto" ||
                  computedStyle.overflowY === "scroll") &&
                (node.scrollHeight ?? 0) > (node.clientHeight ?? 0),
              canScrollX: Dynamic =
                (computedStyle.overflowX === "auto" ||
                  computedStyle.overflowX === "scroll") &&
                (node.scrollWidth ?? 0) > (node.clientWidth ?? 0);
            if (canScrollY || canScrollX) return true;
          }
        }
        node = node.parentElement ?? null;
      }
      return false;
    },
    handleTouchStart: Dynamic = (event?: Dynamic): Dynamic => {
      let changedTouches: Dynamic = event.changedTouches;
      for (
        let touchIndex: Dynamic = 0;
        touchIndex < (changedTouches?.length ?? 0);
        touchIndex++
      ) {
        let touch: Dynamic = changedTouches[touchIndex];
        touch && touchPanAllowed.set(touch.identifier, !isScrollableTarget(touch.target));
      }
    },
    handleTouchMove: Dynamic = (event?: Dynamic): Dynamic => {
      if (!event.cancelable) return;
      let changedTouches: Dynamic = event.changedTouches,
        touchCount: Dynamic = changedTouches?.length ?? 0;
      if (touchCount !== 0) {
        for (let touchIndex: Dynamic = 0; touchIndex < touchCount; touchIndex++) {
          let touch: Dynamic = changedTouches[touchIndex];
          if (!touch || touchPanAllowed.get(touch.identifier) !== true) return;
        }
        event.preventDefault();
      }
    },
    handleTouchEnd: Dynamic = (event?: Dynamic): Dynamic => {
      let changedTouches: Dynamic = event.changedTouches;
      for (
        let touchIndex: Dynamic = 0;
        touchIndex < (changedTouches?.length ?? 0);
        touchIndex++
      ) {
        let touch: Dynamic = changedTouches[touchIndex];
        touch && touchPanAllowed.delete(touch.identifier);
      }
    },
    wheelDecider: Dynamic = createWheelGestureDecider(),
    activePointers: Dynamic = new Map(),
    pinchStart: Dynamic,
    queuedPointers: Dynamic = new Map(),
    savedUserSelect: Dynamic,
    savedWebkitUserSelect: Dynamic,
    lockTextSelection: Dynamic = (): Dynamic => {
      if (savedUserSelect !== undefined) return;
      let style: Dynamic = element.style;
      style &&
        ((savedUserSelect = style.userSelect ?? ""),
        (savedWebkitUserSelect = style.webkitUserSelect ?? ""),
        (style.webkitUserSelect = "none"),
        (style.userSelect = "none"));
    },
    unlockTextSelection: Dynamic = (): Dynamic => {
      if (savedUserSelect === undefined) return;
      let style: Dynamic = element.style;
      style &&
        ((style.userSelect = savedUserSelect),
        (style.webkitUserSelect = savedWebkitUserSelect ?? ""));
      savedUserSelect = undefined;
      savedWebkitUserSelect = undefined;
    },
    isGestureActive: Dynamic = false,
    lastGestureTime: Dynamic = 0,
    gestureBaseScale: Dynamic = 1,
    rejectedTouches: Dynamic = new Map(),
    pruneRejectedTouches: Dynamic = (now?: Dynamic): Dynamic => {
      for (let [pointerId, rejectedTime] of rejectedTouches as Dynamic)
        now - rejectedTime > CanvasPanZoomLimit && rejectedTouches.delete(pointerId);
    },
    hasTwoTouches: Dynamic = (): Dynamic => {
      let touchCount: Dynamic = 0;
      for (let pointer of activePointers.values() as Dynamic)
        pointer.type === "touch" && (touchCount += 1);
      return touchCount >= 2;
    },
    hasTwoRecentTouches: Dynamic = (now?: Dynamic): Dynamic => {
      let touchCount: Dynamic = 0,
        recentCount: Dynamic = 0;
      for (let pointer of activePointers.values() as Dynamic)
        pointer.type === "touch" &&
          ((touchCount += 1),
          now - pointer.lastSeen <= CanvasPanZoomLimit && (recentCount += 1));
      return touchCount >= 2 && recentCount >= 1;
    },
    primaryPointerId: Dynamic,
    panButtonMask: Dynamic = 1,
    hasPointerGesture: Dynamic = false,
    toElementCoordinates: Dynamic = (clientX?: Dynamic, clientY?: Dynamic): Dynamic => {
      let bounds: Dynamic = element.getBoundingClientRect();
      return {
        sx: clientX - bounds.left,
        sy: clientY - bounds.top,
      };
    },
    handleWheel: Dynamic = (event?: Dynamic): Dynamic => {
      let isZoomKey: Dynamic = event.ctrlKey || event.metaKey;
      if (isGestureActive && event.timeStamp - lastGestureTime <= wheelAfterGestureMs) {
        event.preventDefault();
        return;
      }
      let wheelMode: Dynamic = wheelDecider.decide(
        event.timeStamp,
        isZoomKey,
        event.deltaX !== 0 || event.deltaY !== 0,
        (): Dynamic => config.allowNativeScroll?.(event) ?? false,
      );
      if (
        wheelMode === "native" ||
        (event.preventDefault(), wheelMode === "consume")
      )
        return;
      let deltaScaleY: Dynamic =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? (window as Dynamic).innerHeight
              : 1,
        deltaScaleX: Dynamic =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? (window as Dynamic).innerWidth
              : 1;
      if (wheelMode === "zoom") {
        let { sx: anchorX, sy: anchorY }: Dynamic = toElementCoordinates(
          event.clientX,
          event.clientY,
        );
        config.setView(
          zoomViewportAtPoint(
            config.getView(),
            anchorX,
            anchorY,
            wheelZoomFactor(event.deltaY * deltaScaleY),
            config.limits,
          ),
        );
      } else
        config.setView(
          panViewport(
            config.getView(),
            -event.deltaX * deltaScaleX,
            -event.deltaY * deltaScaleY,
          ),
        );
    },
    endGestureIfIdle: Dynamic = (): Dynamic => {
      hasPointerGesture &&
        activePointers.size === 0 &&
        ((hasPointerGesture = false), unlockTextSelection(), config.onGestureEnd?.());
    },
    canStartPan: Dynamic = (event?: Dynamic): Dynamic => {
      if (config.shouldPan) return config.shouldPan(event);
      let target: Dynamic = event.target;
      for (; target; ) {
        let tagName: Dynamic = target.tagName;
        if (
          tagName === "BUTTON" ||
          tagName === "A" ||
          tagName === "INPUT" ||
          tagName === "SELECT" ||
          tagName === "TEXTAREA" ||
          target.getAttribute?.("role") === "slider" ||
          target.hasAttribute?.("data-no-pan")
        )
          return false;
        target = target.parentElement;
      }
      return true;
    },
    reassignPointers: Dynamic = (now?: Dynamic): Dynamic => {
      pinchStart = undefined;
      if (activePointers.size === 1) {
        let pointerType: Dynamic = activePointers.values().next().value?.type,
          hasRestored: Dynamic = false;
        for (let [queuedId, queuedPointer] of queuedPointers as Dynamic)
          if (
            queuedPointer.type === pointerType &&
            (queuedPointers.delete(queuedId),
            !(now - queuedPointer.lastSeen > CanvasPanZoomLimit))
          ) {
            activePointers.set(queuedId, queuedPointer);
            primaryPointerId = undefined;
            hasRestored = true;
            break;
          }
        hasRestored || (primaryPointerId = [...activePointers.keys()][0]);
      }
      endGestureIfIdle();
    },
    prunePointersOnPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      queuedPointers.delete(event.pointerId);
      rejectedTouches.delete(event.pointerId);
      let wasRemoved: Dynamic = activePointers.delete(event.pointerId);
      wasRemoved && primaryPointerId === event.pointerId && (primaryPointerId = undefined);
      let hasRemovedSameType: Dynamic = false;
      if (event.isPrimary && event.button === 0) {
        for (let [pointerId, pointer] of activePointers as Dynamic)
          pointer.type === event.pointerType &&
            (activePointers.delete(pointerId), (hasRemovedSameType = true));
        for (let [queuedId, queuedPointer] of queuedPointers as Dynamic)
          queuedPointer.type === event.pointerType && queuedPointers.delete(queuedId);
        event.pointerType === "touch" && rejectedTouches.clear();
        primaryPointerId !== undefined && !activePointers.has(primaryPointerId) && (primaryPointerId = undefined);
      }
      (wasRemoved || hasRemovedSameType) && reassignPointers(event.timeStamp);
    },
    isEditableTarget: Dynamic = (target?: Dynamic): Dynamic => {
      for (
        let node: Dynamic = target;
        node && node !== element;
        node = node.parentElement ?? null
      )
        if (
          node.tagName === "INPUT" ||
          node.tagName === "TEXTAREA" ||
          node.tagName === "SELECT" ||
          node.isContentEditable === true
        )
          return true;
      return false;
    },
    handlePointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        !(
          event.button !== 0 &&
          event.button !== 1 &&
          !(event.button === 2 && config.panSecondaryButton)
        ) &&
        !(event.button === 1 && isEditableTarget(event.target))
      ) {
        if (activePointers.size > 0) {
          let values: Dynamic = new Set();
          for (let pointer of activePointers.values() as Dynamic)
            values.add(pointer.type);
          for (let pointerType of values as Dynamic) {
            let isStale: Dynamic = true;
            for (let pointer of activePointers.values() as Dynamic)
              if (
                pointer.type === pointerType &&
                event.timeStamp - pointer.lastSeen <= CanvasPanZoomLimit
              ) {
                isStale = false;
                break;
              }
            if (isStale) {
              for (let queuedPointer of queuedPointers.values() as Dynamic)
                if (
                  queuedPointer.type === pointerType &&
                  event.timeStamp - queuedPointer.lastSeen <= CanvasPanZoomLimit
                ) {
                  isStale = false;
                  break;
                }
            }
            if (isStale && pointerType !== event.pointerType) {
              for (let [pointerId, pointer] of activePointers as Dynamic)
                pointer.type === pointerType &&
                  (activePointers.delete(pointerId),
                  primaryPointerId === pointerId && (primaryPointerId = undefined));
              for (let [queuedId, queuedPointer] of queuedPointers as Dynamic)
                queuedPointer.type === pointerType && queuedPointers.delete(queuedId);
            }
          }
          hasTwoTouches() || (pinchStart = undefined);
          endGestureIfIdle();
          let firstType: Dynamic = activePointers.values().next().value?.type;
          if (firstType !== undefined && firstType !== event.pointerType) return;
        }
        if (activePointers.size === 0) {
          if (!canStartPan(event)) {
            event.pointerType === "touch" &&
              config.shouldPan &&
              rejectedTouches.set(event.pointerId, event.timeStamp);
            return;
          }
          primaryPointerId = event.pointerId;
          panButtonMask = event.button === 1 ? 4 : event.button === 2 ? 2 : 1;
          event.button === 1 && event.preventDefault();
          lockTextSelection();
        } else {
          if (event.pointerType !== "touch") return;
          if (!canStartPan(event)) {
            config.shouldPan && rejectedTouches.set(event.pointerId, event.timeStamp);
            return;
          }
          if (activePointers.size >= 2) {
            queuedPointers.set(event.pointerId, {
              x: event.clientX,
              y: event.clientY,
              type: event.pointerType,
              lastSeen: event.timeStamp,
            });
            return;
          }
          primaryPointerId = undefined;
        }
        activePointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
          type: event.pointerType,
          lastSeen: event.timeStamp,
        });
        hasPointerGesture = true;
        try {
          element.setPointerCapture(event.pointerId);
        } catch {}
      }
    },
    handlePointerMove: Dynamic = (event?: Dynamic): Dynamic => {
      rejectedTouches.has(event.pointerId) &&
        rejectedTouches.set(event.pointerId, event.timeStamp);
      let entry: Dynamic = queuedPointers.get(event.pointerId);
      if (entry) {
        queuedPointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
          type: entry.type,
          lastSeen: event.timeStamp,
        });
        return;
      }
      let activePointer: Dynamic = activePointers.get(event.pointerId);
      if (activePointer) {
        if (
          event.pointerType !== "touch" &&
          (event.buttons & panButtonMask) === 0
        ) {
          handlePointerUp(event);
          return;
        }
        if (activePointers.size === 2) {
          let otherEntry: Dynamic = [...activePointers.entries()].find(
            ([pointerId]: Dynamic): Dynamic => pointerId !== event.pointerId,
          );
          if (otherEntry) {
            let [, otherPointer]: Dynamic = otherEntry,
              newDistance: Dynamic = Math.hypot(
                event.clientX - otherPointer.x,
                event.clientY - otherPointer.y,
              ),
              previousCenter: Dynamic = {
                x: (activePointer.x + otherPointer.x) / 2,
                y: (activePointer.y + otherPointer.y) / 2,
              },
              currentCenter: Dynamic = {
                x: (event.clientX + otherPointer.x) / 2,
                y: (event.clientY + otherPointer.y) / 2,
              };
            (!pinchStart || pinchStart.dist <= 0) &&
              (pinchStart = {
                dist: Math.hypot(activePointer.x - otherPointer.x, activePointer.y - otherPointer.y),
                scale: config.getView().scale,
              });
            let nextView: Dynamic = panViewport(
              config.getView(),
              currentCenter.x - previousCenter.x,
              currentCenter.y - previousCenter.y,
            );
            if (pinchStart.dist > 0 && newDistance > 0) {
              let targetScale: Dynamic = pinchStart.scale * (newDistance / pinchStart.dist);
              if (targetScale !== nextView.scale) {
                let { sx: anchorX, sy: anchorY }: Dynamic = toElementCoordinates(
                  currentCenter.x,
                  currentCenter.y,
                );
                nextView = zoomViewportAtPoint(
                  nextView,
                  anchorX,
                  anchorY,
                  targetScale / nextView.scale,
                  config.limits,
                );
              }
            }
            config.setView(nextView);
          }
        } else
          event.pointerId === primaryPointerId &&
            config.setView(
              panViewport(
                config.getView(),
                event.clientX - activePointer.x,
                event.clientY - activePointer.y,
              ),
            );
        activePointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
          type: activePointer.type,
          lastSeen: event.timeStamp,
        });
      }
    },
    handlePointerUp: Dynamic = (event?: Dynamic): Dynamic => {
      rejectedTouches.delete(event.pointerId);
      queuedPointers.delete(event.pointerId);
      activePointers.has(event.pointerId) &&
        (activePointers.delete(event.pointerId),
        event.pointerId === primaryPointerId && (primaryPointerId = undefined),
        reassignPointers(event.timeStamp));
    },
    handleGestureStart: Dynamic = (event?: Dynamic): Dynamic => {
      event.preventDefault();
      isGestureActive = true;
      lastGestureTime = typeof event.timeStamp == "number" ? event.timeStamp : 0;
      gestureBaseScale = config.getView().scale;
      wheelDecider.decide(
        typeof event.timeStamp == "number" ? event.timeStamp : 0,
        true,
        true,
        (): Dynamic => false,
      );
    },
    handleGestureChange: Dynamic = (event?: Dynamic): Dynamic => {
      event.preventDefault();
      if (!isGestureActive || !event.scale) return;
      lastGestureTime = typeof event.timeStamp == "number" ? event.timeStamp : 0;
      pruneRejectedTouches(lastGestureTime);
      if (hasTwoRecentTouches(lastGestureTime) || rejectedTouches.size > 0) {
        gestureBaseScale = config.getView().scale / event.scale;
        return;
      }
      let currentView: Dynamic = config.getView(),
        targetScale: Dynamic = gestureBaseScale * event.scale;
      if (targetScale === currentView.scale) return;
      let { sx: anchorX, sy: anchorY }: Dynamic = toElementCoordinates(
        event.clientX ?? 0,
        event.clientY ?? 0,
      );
      config.setView(
        zoomViewportAtPoint(
          currentView,
          anchorX,
          anchorY,
          targetScale / currentView.scale,
          config.limits,
        ),
      );
    },
    handleGestureEnd: Dynamic = (event?: Dynamic): Dynamic => {
      event.preventDefault();
      isGestureActive = false;
    },
    handleDragStart: Dynamic = (event?: Dynamic): Dynamic => {
      (primaryPointerId !== undefined || activePointers.size > 0) && event.preventDefault();
    },
    handleMouseDown: Dynamic = (event?: Dynamic): Dynamic => {
      event.button === 1 &&
        primaryPointerId !== undefined &&
        panButtonMask === 4 &&
        event.preventDefault();
    };
  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("mousedown", handleMouseDown);
  element.addEventListener("touchstart", handleTouchStart, {
    passive: true,
  });
  element.addEventListener("touchmove", handleTouchMove, {
    passive: false,
  });
  element.addEventListener("touchend", handleTouchEnd, {
    passive: true,
  });
  element.addEventListener("touchcancel", handleTouchEnd, {
    passive: true,
  });
  element.addEventListener("wheel", handleWheel, {
    passive: false,
  });
  (window as Dynamic).addEventListener("pointerdown", prunePointersOnPointerDown, true);
  element.addEventListener("pointerdown", handlePointerDown);
  element.addEventListener("gesturestart", handleGestureStart, {
    passive: false,
  });
  element.addEventListener("gesturechange", handleGestureChange, {
    passive: false,
  });
  element.addEventListener("gestureend", handleGestureEnd, {
    passive: false,
  });
  (window as Dynamic).addEventListener("pointermove", handlePointerMove);
  (window as Dynamic).addEventListener("pointerup", handlePointerUp);
  (window as Dynamic).addEventListener("pointercancel", handlePointerUp);
  let unregisterGestures: Dynamic = CanvasPanZoomSet(element, {
    gesturestart: handleGestureStart,
    gesturechange: handleGestureChange,
    gestureend: handleGestureEnd,
  });
  return {
    release(pointerId: Dynamic): Dynamic {
      let entry: Dynamic = activePointers.get(pointerId);
      if (entry === undefined || activePointers.size !== 1 || queuedPointers.size > 0)
        return false;
      activePointers.delete(pointerId);
      pointerId === primaryPointerId && (primaryPointerId = undefined);
      try {
        element.releasePointerCapture(pointerId);
      } catch {}
      reassignPointers(entry.lastSeen);
      return true;
    },
    destroy(): Dynamic {
      unregisterGestures();
      element.removeEventListener("scroll", resetScroll);
      element.removeEventListener("dragstart", handleDragStart);
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
      element.removeEventListener("wheel", handleWheel);
      (window as Dynamic).removeEventListener(
        "pointerdown",
        prunePointersOnPointerDown,
        true,
      );
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("gesturestart", handleGestureStart);
      element.removeEventListener("gesturechange", handleGestureChange);
      element.removeEventListener("gestureend", handleGestureEnd);
      (window as Dynamic).removeEventListener("pointermove", handlePointerMove);
      (window as Dynamic).removeEventListener("pointerup", handlePointerUp);
      (window as Dynamic).removeEventListener("pointercancel", handlePointerUp);
      rejectedTouches.clear();
      queuedPointers.clear();
      touchPanAllowed.clear();
      unlockTextSelection();
      element.style.touchAction = touchAction;
    },
  };
}
export {
  canvasGestureActive,
  CanvasPanZoomCache,
  CanvasPanZoomCtrlKey,
  CanvasPanZoomDefaultPrevented,
  CanvasPanZoomGesturestartGesturechangeGestureendValues,
  CanvasPanZoomKeys,
  CanvasPanZoomLimit,
  CanvasPanZoomResolvedValue,
  CanvasPanZoomRound,
  CanvasPanZoomScrollTop,
  CanvasPanZoomSet,
  CanvasPanZoomTouches,
  CanvasPanZoomTouchstartTouchendTouchcancelValues,
  createWheelGestureDecider,
  installCanvasPanZoom_local as installCanvasPanZoom_binding,
  panViewport,
  reactCanvasPanZoom,
  wheelZoomFactor,
  zoomViewportAtPoint,
};
export function installCanvasPanZoom(): () => void {
  return () => {
    CanvasPanZoomLimit = 1e4;
    wheelAfterGestureMs = 1e3;
    CanvasPanZoomGesturestartGesturechangeGestureendValues = [
      "gesturestart",
      "gesturechange",
      "gestureend",
    ];
    CanvasPanZoomTouchstartTouchendTouchcancelValues = [
      "touchstart",
      "touchend",
      "touchcancel",
    ];
    CanvasPanZoomCache = new Map();
    CanvasPanZoomResolvedValue = 0;
    canvasGestureActive = false;
    CanvasPanZoomTouches = (touchEvent?: Dynamic): Dynamic => {
      CanvasPanZoomResolvedValue = touchEvent.touches?.length ?? 0;
    };
    CanvasPanZoomKeys = (clientX?: Dynamic, clientY?: Dynamic): Dynamic => {
      let hitElement: Dynamic;
      if (clientX === undefined || clientY === undefined) return hitElement;
      for (let candidate of CanvasPanZoomCache.keys() as Dynamic) {
        if (candidate.closest("[inert]") || candidate.checkVisibility?.() === false)
          continue;
        let bounds: Dynamic = candidate.getBoundingClientRect();
        clientX >= bounds.left &&
          clientX < bounds.right &&
          clientY >= bounds.top &&
          clientY < bounds.bottom &&
          (hitElement = candidate);
      }
      return hitElement;
    };
    CanvasPanZoomCtrlKey = (event?: Dynamic): Dynamic => {
      if (
        !event.ctrlKey ||
        !event.cancelable ||
        event.defaultPrevented ||
        canvasGestureActive
      )
        return;
      let hitElement: Dynamic = CanvasPanZoomKeys(event.clientX, event.clientY);
      if (!hitElement) return;
      event.preventDefault();
      let forwardedWheelEvent: Dynamic = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      });
      canvasGestureActive = true;
      try {
        hitElement.dispatchEvent(forwardedWheelEvent);
      } finally {
        canvasGestureActive = false;
      }
    };
    CanvasPanZoomDefaultPrevented = (event?: Dynamic): Dynamic => {
      if (event.defaultPrevented || CanvasPanZoomResolvedValue > 0) return;
      let gestureEvent: Dynamic = event,
        hitElement: Dynamic = CanvasPanZoomKeys(gestureEvent.clientX, gestureEvent.clientY);
      hitElement &&
        (event.preventDefault(),
        CanvasPanZoomCache.get(hitElement)?.[event.type](gestureEvent));
    };
    CanvasPanZoomSet = (element?: Dynamic, handlers?: Dynamic): Dynamic => {
      CanvasPanZoomCache.set(element, handlers);
      (window as Dynamic).addEventListener("wheel", CanvasPanZoomCtrlKey, {
        passive: false,
      });
      for (let eventName of CanvasPanZoomGesturestartGesturechangeGestureendValues as Dynamic)
        (window as Dynamic).addEventListener(
          eventName,
          CanvasPanZoomDefaultPrevented,
          {
            passive: false,
          },
        );
      for (let eventName of CanvasPanZoomTouchstartTouchendTouchcancelValues as Dynamic)
        (window as Dynamic).addEventListener(eventName, CanvasPanZoomTouches, {
          capture: true,
          passive: true,
        });
      return (): Dynamic => {
        CanvasPanZoomCache.get(element) === handlers &&
          CanvasPanZoomCache.delete(element);
        if (!(CanvasPanZoomCache.size > 0)) {
          (window as Dynamic).removeEventListener(
            "wheel",
            CanvasPanZoomCtrlKey,
          );
          for (let eventName of CanvasPanZoomGesturestartGesturechangeGestureendValues as Dynamic)
            (window as Dynamic).removeEventListener(
              eventName,
              CanvasPanZoomDefaultPrevented,
            );
          for (let eventName of CanvasPanZoomTouchstartTouchendTouchcancelValues as Dynamic)
            (window as Dynamic).removeEventListener(
              eventName,
              CanvasPanZoomTouches,
              true,
            );
        }
      };
    };
    reactCanvasPanZoom = toModuleNamespace(
      load_react(),
      1,
    );
    CanvasPanZoomRound = (fontSize?: Dynamic): Dynamic =>
      Math.round(fontSize * PlatformFileContentMin(fontSize).lh * 1.25);
    CanvasPanZoomScrollTop = (scroller?: Dynamic): Dynamic => ({
      above: scroller.scrollTop > 1,
      below: scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1,
    });
    initializeCdsIndex();
  };
}

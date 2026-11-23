interface ViewportMode {
  editing: boolean;
  tool: string;
  local: boolean;
  host: boolean;
  playback: boolean;
  nativeScroll: boolean;
  textEditing: boolean;
}

interface ViewportGestureOptions {
  mode(): ViewportMode;
  scale(): number;
  zoomLocally(scale: number, x: number, y: number): void;
  panZoom(zoom: boolean, dx: number, dy: number, zoomDelta: number, x: number, y: number, touch?: boolean): void;
  holdPan(active: boolean): void;
  isOverlay(event: MouseEvent): boolean;
  pickTarget(event: MouseEvent): Element | null;
  openMenu(x: number, y: number, target: Element | null): void;
}

interface PinchEvent extends MouseEvent {
  scale?: number;
}

interface TouchPointer {
  x: number;
  y: number;
  sx: number;
  sy: number;
  ix: number;
  iy: number;
}

interface PanDrag {
  id: number;
  mask: 2 | 4;
  x: number;
  y: number;
  live: boolean;
  cursor: string;
  menu: { x: number; y: number; el: Element | null } | null;
}

export function createViewportGestures(options: ViewportGestureOptions) {
  let gestureScale = 1;
  let isGestureActive = false;
  let previousPinchScale = 1;
  function onGestureStart(event: PinchEvent) {
    const mode = options.mode();
    if (mode.nativeScroll && !mode.playback) {
      event.preventDefault();
      return;
    }
    if (
      !(
        (!mode.editing && !mode.local && !mode.host && !mode.playback) ||
        (mode.editing && mode.tool === "interact")
      )
    ) {
      event.preventDefault();
      isGestureActive = true;
      gestureScale = options.scale();
      previousPinchScale = 1;
    }
  }
  function onGestureChange(event: PinchEvent) {
    if (isGestureActive) {
      event.preventDefault();
      const mode = options.mode();
      if (mode.host || mode.playback) {
        const currentScale = event.scale || 1;
        const scaleRatio = currentScale / (previousPinchScale || 1);
        previousPinchScale = currentScale;
        if (scaleRatio > 0) {
          const zoomDelta = Math.max(
            -0.22314,
            Math.min(0.22314, Math.log(scaleRatio)),
          );
          options.panZoom(true, 0, 0, zoomDelta, event.clientX, event.clientY);
        }
        return;
      }
      options.zoomLocally(
        gestureScale * (event.scale || 1),
        event.clientX,
        event.clientY,
      );
    }
  }
  function onGestureEnd(event: PinchEvent) {
    if (isGestureActive) {
      event.preventDefault();
      isGestureActive = false;
    }
  }
  const listeners: readonly [string, EventListener, boolean?][] = [
    ["gesturestart", onGestureStart as EventListener, false],
    ["gesturechange", onGestureChange as EventListener, false],
    ["gestureend", onGestureEnd as EventListener, false],
    ["pointerdown", onTouchPointerDown as EventListener, true],
    ["pointermove", onTouchPointerMove as EventListener, true],
    ["pointerup", onTouchPointerUp as EventListener, true],
    ["pointercancel", onTouchPointerUp as EventListener, true],
    ["pointerdown", onPanPointerDown as EventListener],
    ["mousedown", onPanMouseDown as EventListener],
    ["pointermove", onPanPointerMove as EventListener, true],
    ["pointerup", onPanPointerEnd as EventListener, true],
    ["pointercancel", onPanPointerEnd as EventListener, true],
    ["touchstart", onTouchStart as EventListener, true],
    ["touchmove", onTouchMove as EventListener, false],
    ["touchend", onTouchEnd as EventListener, true],
    ["touchcancel", onTouchEnd as EventListener, true],
  ];

  function install() {
    for (const [event, listener, passive] of listeners) {
      document.addEventListener(event, listener, { capture: true, passive });
    }
    updateTouchPolicy();
  }

  function remove() {
    isGestureActive = false;
    for (const [event, listener] of listeners) {
      document.removeEventListener(event, listener, true);
    }
    activeTouches = {};
    activeTouchIds = [];
    touchGestureStarted = false;
    guardedTouchIds = {};
    if (activePanGesture) {
      if (activePanGesture.live) {
        document.documentElement.style.cursor =
          activePanGesture.cursor;
        if (activePanGesture.mask === 2) {
          options.holdPan(false);
        }
      }
      activePanGesture = null;
    }
    document.documentElement.style.touchAction = "";
    document.documentElement.style.overscrollBehavior = "";
  }
  function hostTouchPanEnabled() {
    const mode = options.mode();
    return mode.host && !(mode.editing && mode.tool === "interact") && !mode.textEditing;
  }
  function updateTouchPolicy() {
    const interceptTouch = hostTouchPanEnabled();
    const mode = options.mode();
    document.documentElement.style.touchAction = interceptTouch
      ? "none"
      : mode.nativeScroll
        ? "pan-x pan-y"
        : "";
    document.documentElement.style.overscrollBehavior = mode.host || mode.nativeScroll ? "none" : "";
    if (!interceptTouch) {
      activeTouches = {};
      activeTouchIds = [];
      touchGestureStarted = false;
    }
  }
  let activeTouches: Partial<Record<number, TouchPointer>> = {};
  let activeTouchIds: number[] = [];
  let touchGestureStarted = false;
  const touchMoveThreshold = 6;
  function onTouchPointerDown(event: PointerEvent) {
    if (event.pointerType === "touch" && hostTouchPanEnabled()) {
      if (!activeTouchIds.includes(event.pointerId)) {
        activeTouchIds.push(event.pointerId);
      }
      activeTouches[event.pointerId] = {
        x: event.screenX,
        y: event.screenY,
        sx: event.screenX,
        sy: event.screenY,
        ix: event.clientX,
        iy: event.clientY,
      };
      touchGestureStarted = false;
    }
  }
  function onTouchPointerMove(event: PointerEvent) {
    const touchState = activeTouches[event.pointerId];
    if (touchState && hostTouchPanEnabled()) {
      const screenX = event.screenX;
      const screenY = event.screenY;
      touchState.ix = event.clientX;
      touchState.iy = event.clientY;
      const touchIndex = activeTouchIds.indexOf(event.pointerId);
      if (touchIndex > 1) {
        touchState.x = screenX;
        touchState.y = screenY;
        return;
      }
      if (activeTouchIds.length >= 2) {
        const otherPointerId = activeTouchIds[touchIndex === 0 ? 1 : 0];
        const otherTouch = activeTouches[otherPointerId];
        if (!otherTouch) return;
        const centerX = (touchState.x + otherTouch.x) / 2;
        const centerY = (touchState.y + otherTouch.y) / 2;
        const distance = Math.hypot(
          touchState.x - otherTouch.x,
          touchState.y - otherTouch.y,
        );
        touchState.x = screenX;
        touchState.y = screenY;
        const nextCenterX = (touchState.x + otherTouch.x) / 2;
        const nextCenterY = (touchState.y + otherTouch.y) / 2;
        const nextDistance = Math.hypot(
          touchState.x - otherTouch.x,
          touchState.y - otherTouch.y,
        );
        let zoomDelta = 0;
        if (distance > 0 && nextDistance > 0) {
          zoomDelta = Math.max(
            -0.22314,
            Math.min(0.22314, Math.log(nextDistance / distance)),
          );
        }
        options.panZoom(
          true,
          centerX - nextCenterX,
          centerY - nextCenterY,
          zoomDelta,
          (touchState.ix + otherTouch.ix) / 2,
          (touchState.iy + otherTouch.iy) / 2,
          true,
        );
        return;
      }
      if (!touchGestureStarted) {
        if (
          Math.hypot(screenX - touchState.sx, screenY - touchState.sy) < touchMoveThreshold
        ) {
          touchState.x = screenX;
          touchState.y = screenY;
          return;
        }
        touchGestureStarted = true;
      }
      const deltaX = touchState.x - screenX;
      const deltaY = touchState.y - screenY;
      touchState.x = screenX;
      touchState.y = screenY;
      if (deltaX !== 0 || deltaY !== 0) {
        options.panZoom(false, deltaX, deltaY, 0, event.clientX, event.clientY, true);
      }
    }
  }
  function onTouchPointerUp(event: PointerEvent) {
    if (activeTouches[event.pointerId] !== undefined) {
      delete activeTouches[event.pointerId];
      const touchIndex = activeTouchIds.indexOf(event.pointerId);
      if (touchIndex !== -1) {
        activeTouchIds.splice(touchIndex, 1);
      }
      touchGestureStarted = false;
    }
  }
  let activePanGesture: PanDrag | null = null;
  let lastPanEnd = 0;
  function isNativeEditableTarget(target: EventTarget | null) {
    for (
      let currentElement = target as HTMLElement | null;
      currentElement && currentElement.nodeType === 1;
      currentElement = currentElement.parentElement
    )
      if (
        currentElement.tagName === "INPUT" ||
        currentElement.tagName === "TEXTAREA" ||
        currentElement.tagName === "SELECT" ||
        currentElement.isContentEditable === true
      )
        return true;
    return false;
  }
  function canPointerPan(buttonMask: 2 | 4) {
    return hostTouchPanEnabled() || (options.mode().playback && buttonMask === 4);
  }
  function onPanPointerDown(event: PointerEvent) {
    lastPanEnd = 0;
    if (
      !(
        !canPointerPan(event.button === 1 ? 4 : 2) ||
        (activePanGesture && activePanGesture.live)
      )
    ) {
      if (event.button === 1) {
        if (isNativeEditableTarget(event.target)) return;
        event.preventDefault();
      } else if (
        event.button !== 2 ||
        event.buttons !== 2 ||
        !options.mode().editing ||
        options.isOverlay(event)
      )
        return;
      activePanGesture = {
        id: event.pointerId,
        mask: event.button === 1 ? 4 : 2,
        x: event.screenX,
        y: event.screenY,
        live: false,
        cursor: "",
        menu: null,
      };
    }
  }
  function onPanMouseDown(event: MouseEvent) {
    if (event.button === 1 && activePanGesture) {
      event.preventDefault();
    }
  }
  function onPanPointerMove(event: PointerEvent) {
    if (activePanGesture && event.pointerId === activePanGesture.id) {
      if (
        !(event.buttons & activePanGesture.mask) ||
        !canPointerPan(activePanGesture.mask)
      ) {
        onPanPointerEnd(event);
        return;
      }
      if (!activePanGesture.live) {
        if (
          Math.hypot(
            event.screenX - activePanGesture.x,
            event.screenY - activePanGesture.y,
          ) < touchMoveThreshold
        )
          return;
        activePanGesture.live = true;
        activePanGesture.cursor = document.documentElement.style.cursor;
        document.documentElement.style.cursor = "grabbing";
        try {
          document.documentElement.setPointerCapture(
            event.pointerId,
          );
        } catch {}
        if (activePanGesture.mask === 2) {
          options.holdPan(true);
        }
      }
      const deltaX = activePanGesture.x - event.screenX;
      const deltaY = activePanGesture.y - event.screenY;
      activePanGesture.x = event.screenX;
      activePanGesture.y = event.screenY;
      if (deltaX !== 0 || deltaY !== 0) {
        options.panZoom(
          false,
          deltaX,
          deltaY,
          0,
          event.clientX,
          event.clientY,
          false,
        );
      }
    }
  }
  function onPanPointerEnd(event: PointerEvent) {
    if (activePanGesture && event.pointerId === activePanGesture.id) {
      const gesture = activePanGesture;
      activePanGesture = null;
      if (gesture.live) {
        document.documentElement.style.cursor = gesture.cursor;
        try {
          document.documentElement.releasePointerCapture(
            event.pointerId,
          );
        } catch {}
        if (gesture.mask === 2) {
          lastPanEnd = Date.now();
          options.holdPan(false);
        }
      } else if (
        gesture.menu &&
        event.type !== "pointercancel" &&
        hostTouchPanEnabled() &&
        Math.hypot(event.screenX - gesture.x, event.screenY - gesture.y) <
          touchMoveThreshold
      ) {
        options.openMenu(
          gesture.menu.x,
          gesture.menu.y,
          gesture.menu.el && gesture.menu.el.isConnected
            ? gesture.menu.el
            : options.pickTarget(event),
        );
      }
    }
  }
  let guardedTouchIds: Partial<Record<number, boolean>> = {};
  function shouldGuardTouchScroll() {
    return hostTouchPanEnabled() || options.mode().nativeScroll;
  }
  function pageHasScrollableOverflow() {
    const element =
      document.scrollingElement ||
      document.documentElement;
    return (
      element.scrollHeight > element.clientHeight + 1 ||
      element.scrollWidth > element.clientWidth + 1
    );
  }
  function nativeTouchTarget(element: EventTarget | null) {
    if (options.mode().nativeScroll && pageHasScrollableOverflow()) return true;
    for (
      let currentElement = element as HTMLElement | null;
      currentElement && currentElement !== document.documentElement;

    ) {
      if (currentElement.nodeType === 1) {
        const tagName = currentElement.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "SELECT" ||
          tagName === "TEXTAREA" ||
          currentElement.isContentEditable === true
        )
          return true;
        let scrollStyle: CSSStyleDeclaration | null = null;
        try {
          scrollStyle = window.getComputedStyle(currentElement);
        } catch {
          scrollStyle = null;
        }
        if (
          scrollStyle &&
          (((scrollStyle.overflowY === "auto" || scrollStyle.overflowY === "scroll") &&
            currentElement.scrollHeight > currentElement.clientHeight) ||
            ((scrollStyle.overflowX === "auto" || scrollStyle.overflowX === "scroll") &&
              currentElement.scrollWidth > currentElement.clientWidth))
        )
          return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }
  function onTouchStart(event: TouchEvent) {
    if (shouldGuardTouchScroll())
      for (
        let touchIndex = 0;
        touchIndex < event.changedTouches.length;
        touchIndex++
      ) {
        const touch = event.changedTouches[touchIndex];
        guardedTouchIds[touch.identifier] = !nativeTouchTarget(
          touch.target,
        );
      }
  }
  function onTouchMove(event: TouchEvent) {
    if (shouldGuardTouchScroll() && event.cancelable) {
      const touchCount = event.changedTouches.length;
      if (touchCount !== 0) {
        for (let touchIndex = 0; touchIndex < touchCount; touchIndex++)
          if (
            guardedTouchIds[event.changedTouches[touchIndex].identifier] !== true
          )
            return;
        event.preventDefault();
      }
    }
  }
  function onTouchEnd(event: TouchEvent) {
    for (
      let touchIndex = 0;
      touchIndex < event.changedTouches.length;
      touchIndex++
    )
      delete guardedTouchIds[event.changedTouches[touchIndex].identifier];
  }
  return {
    install,
    remove,
    updateTouchPolicy,
    isPinching: () => isGestureActive,
    suppressContextMenu: () => Date.now() - lastPanEnd < 500,
    deferContextMenu(event: MouseEvent) {
      if (activePanGesture?.mask !== 2) return false;
      activePanGesture.menu = {
        x: event.clientX,
        y: event.clientY,
        el: options.pickTarget(event),
      };
      return true;
    },
  };
}

import {
  eventHasScrollableOverlayTarget,
  eventHitsEditorOverlay,
  eventMatchesSelector,
  eventTargetConsumesWheel,
  horizontalOverscroll,
  pageCanConsumeWheel,
} from "./wheel-targets";

interface WheelMode {
  editing: boolean;
  tool: string;
  local: boolean;
  host: boolean;
  playback: boolean;
  nativeScroll: boolean;
}

type PanZoom = (pinch: boolean, dx: number, dy: number, dz: number, x: number, y: number) => void;

interface WheelOptions {
  mode(): WheelMode;
  isPinching(): boolean;
  zoomLocally(delta: number, x: number, y: number): void;
  panLocally(x: number, y: number): void;
  clearGuides(): void;
  sendPanZoom: PanZoom;
}

interface PlaybackWheel {
  event: WheelEvent;
  canScroll: boolean;
  consumed(): boolean;
}

const gestureGapMs = 200;

export function createViewportWheel(options: WheelOptions) {
  let route: "none" | "native" | "canvas" = "none";
  let lastWheelTime = 0;
  let waiting: PlaybackWheel[] | null = null;

  function forward(event: WheelEvent, zoom: boolean) {
    const verticalUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const horizontalUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerWidth : 1;
    const { clientX: x, clientY: y } = event;
    if (zoom) {
      const delta = Math.max(-0.22314, Math.min(0.22314, -event.deltaY * verticalUnit * 0.01));
      options.sendPanZoom(true, 0, 0, delta, x, y);
    } else {
      options.sendPanZoom(false, event.deltaX * horizontalUnit, event.deltaY * verticalUnit, 0, x, y);
    }
  }

  function settlePlayback(entry: PlaybackWheel, layoutChanged: boolean) {
    const { event, canScroll } = entry;
    const consumed = layoutChanged || entry.consumed();
    if (!options.mode().playback) return;

    if (event.timeStamp - lastWheelTime > gestureGapMs) route = "none";
    lastWheelTime = event.timeStamp;
    if (route === "none") {
      if (!event.deltaX && !event.deltaY) return;
      route = consumed || canScroll ? "native" : "canvas";
    }
    if (route === "canvas" && !consumed && !canScroll) forward(event, false);
  }

  function deferPlayback(event: WheelEvent) {
    const preventDefault = event.preventDefault;
    const overscroll = horizontalOverscroll(event);
    let consumed = event.defaultPrevented;
    if (overscroll) preventDefault.call(event);
    // Keep our overscroll prevention separate from the preview author's handler.
    event.preventDefault = function () {
      consumed = true;
      preventDefault.call(event);
    };
    const entry: PlaybackWheel = {
      event,
      canScroll: eventTargetConsumesWheel(event) || pageCanConsumeWheel(event),
      consumed: () => consumed || (!overscroll && event.defaultPrevented),
    };
    if (waiting) {
      waiting.push(entry);
      return;
    }
    const beginsGesture = (route === "none" || event.timeStamp - lastWheelTime > gestureGapMs) &&
      (event.deltaX || event.deltaY);
    if (!beginsGesture) {
      setTimeout(() => settlePlayback(entry, false), 0);
      return;
    }

    const target = (event.target as Element | null)?.nodeType === Node.ELEMENT_NODE
      ? event.target as Element : null;
    const before = target?.getBoundingClientRect();
    const animations = target && document.getAnimations ? document.getAnimations() : null;
    const queued: PlaybackWheel[] = [];
    waiting = queued;
    let settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      const after = target?.isConnected ? target.getBoundingClientRect() : null;
      const layoutChanged = !!before && (!after || after.left !== before.left || after.top !== before.top ||
        after.width !== before.width || after.height !== before.height);
      const animated = !layoutChanged && target && animations && document.getAnimations().some((animation) => {
        const animatedElement = (animation.effect as KeyframeEffect | null)?.target;
        return !animations.includes(animation) && !!animatedElement &&
          (animatedElement === target || animatedElement.contains(target) || target.contains(animatedElement));
      });
      waiting = null;
      settlePlayback(entry, layoutChanged || !!animated);
      for (const item of queued) settlePlayback(item, false);
    }
    requestAnimationFrame(() => { setTimeout(settle, 0); });
    setTimeout(settle, 120);
  }

  function consume(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  return function onWheel(event: WheelEvent) {
    const { editing, tool, local, host, playback, nativeScroll } = options.mode();
    const zoom = event.ctrlKey || event.metaKey;
    if (playback) {
      if (zoom) {
        route = "none";
        consume(event);
        if (!options.isPinching()) forward(event, true);
      } else {
        deferPlayback(event);
      }
      return;
    }
    if (nativeScroll) {
      if (zoom || horizontalOverscroll(event)) event.preventDefault();
      return;
    }
    if (!editing && !local && !host) return;
    if (editing && tool === "interact") {
      if (horizontalOverscroll(event)) event.preventDefault();
      return;
    }
    if (options.isPinching()) {
      consume(event);
      return;
    }
    if (host) {
      consume(event);
      forward(event, zoom);
      return;
    }

    if (zoom) {
      route = "none";
    } else {
      if (event.timeStamp - lastWheelTime > gestureGapMs) route = "none";
      lastWheelTime = event.timeStamp;
      if (route === "none") {
        if (!event.deltaX && !event.deltaY) {
          consume(event);
          return;
        }
        route = eventMatchesSelector(event, "[data-dc-wheel-passthru]") ||
          (eventHitsEditorOverlay(event) && eventHasScrollableOverlayTarget(event)) ||
          (!editing && eventTargetConsumesWheel(event)) ? "native" : "canvas";
      }
      if (route === "native") return;
    }
    consume(event);
    options.clearGuides();
    if (zoom) options.zoomLocally(event.deltaY, event.clientX, event.clientY);
    else options.panLocally(-event.deltaX, -event.deltaY);
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getDevicePreviewCapabilities, reactCanvasPreviewMounting } from "./preview-mounting";

var CanvasViewportStoreConstant: Dynamic;
var CanvasViewportStoreMatches: Dynamic;
var animateViewportZoom: Dynamic;
var createViewportStoreValue: Dynamic;
var ViewportContext: Dynamic;
function previewZoomDuration(distance?: Dynamic): Dynamic {
  return Math.round(Math.min(900, Math.max(300, 18 * Math.sqrt(distance))));
}
function isArtboardInViewport(
  viewport?: Dynamic,
  artboard?: Dynamic,
  screen?: Dynamic,
): Dynamic {
  let { w: viewWidth, top: topInset }: Dynamic = screen,
    viewHeight: Dynamic = screen.h - topInset,
    visibleTop: Dynamic = viewport.y + topInset / viewport.scale,
    artboardCenterX: Dynamic = artboard.x + artboard.w / 2,
    artboardCenterY: Dynamic = artboard.y + artboard.h / 2;
  return (
    artboard.w <= viewWidth / viewport.scale && artboard.h <= viewHeight / viewport.scale
      ? artboard.x >= viewport.x &&
        artboard.x + artboard.w <= viewport.x + viewWidth / viewport.scale &&
        artboard.y >= visibleTop &&
        artboard.y + artboard.h <= visibleTop + viewHeight / viewport.scale
      : artboardCenterX >= viewport.x &&
        artboardCenterX <= viewport.x + viewWidth / viewport.scale &&
        artboardCenterY >= visibleTop &&
        artboardCenterY <= visibleTop + viewHeight / viewport.scale
  )
    ? viewport
    : {
        ...viewport,
        x: artboardCenterX - viewWidth / viewport.scale / 2,
        y: artboardCenterY - topInset / viewport.scale - viewHeight / viewport.scale / 2,
      };
}
// MineDesign：网点纸背景画在视口（世界层的父元素）上，随相机平移；
// 间距以 20 个世界单位为基准按 2 的倍数取舍，使屏幕间距保持在 16–32px，缩小时不会糊成一片
function paintDotGrid(world?: Dynamic, viewport?: Dynamic): Dynamic {
  let host: Dynamic = world?.parentElement;
  if (!host) return;
  let size: Dynamic = 20 * viewport.scale;
  while (size < 16) size *= 2;
  while (size >= 32) size /= 2;
  // 网点落在世界坐标的网格交点上：瓦片中心对齐交点
  let offset: Dynamic = (worldCoord?: Dynamic): Dynamic =>
    String(((-worldCoord * viewport.scale) % size) - size / 2) + "px";
  host.style.setProperty("--mdn-dot-size", String(size) + "px");
  host.style.setProperty("--mdn-dot-x", offset(viewport.x));
  host.style.setProperty("--mdn-dot-y", offset(viewport.y));
}
function viewportTransformCss(viewport?: Dynamic): Dynamic {
  return (
    "translate(" +
    String(-viewport.x * viewport.scale) +
    "px, " +
    String(-viewport.y * viewport.scale) +
    "px) scale(" +
    String(viewport.scale) +
    ")"
  );
}
function sameViewport(left?: Dynamic, right?: Dynamic): Dynamic {
  return (
    left === right ||
    (left.x === right.x && left.y === right.y && left.scale === right.scale)
  );
}
function viewportAnimationEasing(progress?: Dynamic): Dynamic {
  if (progress <= 0 || progress >= 1) return Math.min(1, Math.max(0, progress));
  let low: Dynamic = 0,
    high: Dynamic = 1,
    curveT: Dynamic = progress;
  for (let iteration: Dynamic = 0; iteration < 12; iteration++) {
    curveT = (low + high) / 2;
    3 * curveT * (1 - curveT) * 0.25 + curveT ** 3 < progress
      ? (low = curveT)
      : (high = curveT);
  }
  return 3 * curveT * (1 - curveT) * ((1 - curveT) * 0.1 + curveT) + curveT ** 3;
}
function interpolateViewport(
  from?: Dynamic,
  to?: Dynamic,
  progress?: Dynamic,
): Dynamic {
  let scale: Dynamic = from.scale + (to.scale - from.scale) * progress,
    scaledX: Dynamic =
      from.x * from.scale +
      (to.x * to.scale - from.x * from.scale) * progress,
    scaledY: Dynamic =
      from.y * from.scale +
      (to.y * to.scale - from.y * from.scale) * progress;
  return {
    x: scaledX / scale,
    y: scaledY / scale,
    scale: scale,
  };
}
function createViewportStore(
  initialViewport?: Dynamic,
  onCommit?: Dynamic,
  settleDelay: Dynamic = CanvasViewportStoreConstant,
  shouldHintWillChange: Dynamic = animateViewportZoom,
  getGlideDuration: Dynamic = previewZoomDuration,
): Dynamic {
  let current: Dynamic = initialViewport,
    painted: Dynamic = initialViewport,
    committed: Dynamic = initialViewport,
    worldElement: Dynamic = null,
    settleTimer: Dynamic,
    frameHandle: Dynamic = 0,
    glideFrameHandle: Dynamic = 0,
    glideTarget: Dynamic = null,
    listeners: Dynamic = new Set(),
    scaleElements: Dynamic = new Set(),
    applyScaleVars: Dynamic = (element?: Dynamic): Dynamic => {
      element.style.setProperty("--mega-scale", String(current.scale));
      element.style.setProperty("--mega-inv-scale", String(1 / current.scale));
    },
    paintViewport: Dynamic = (): Dynamic => {
      let previous: Dynamic = painted;
      if (!sameViewport(current, previous)) {
        painted = current;
        worldElement &&
          ((worldElement.style.transform = viewportTransformCss(current)),
          paintDotGrid(worldElement, current));
        if (current.scale !== previous.scale)
          for (let scaleElement of scaleElements as Dynamic) applyScaleVars(scaleElement);
        for (let listener of listeners as Dynamic) listener(current, previous);
      }
    },
    handleFrame: Dynamic = (): Dynamic => {
      frameHandle = 0;
      paintViewport();
    },
    commit: Dynamic = (isFinal?: Dynamic): Dynamic => {
      clearTimeout(settleTimer);
      settleTimer = undefined;
      worldElement && (worldElement.style.willChange = "");
      !sameViewport(committed, current) &&
        ((committed = current), onCommit(current, isFinal));
    },
    applyViewport: Dynamic = (update?: Dynamic, isImmediate?: Dynamic): Dynamic => {
      let previousViewport: Dynamic = current,
        nextViewport: Dynamic =
          typeof update == "function" ? update(previousViewport) : update;
      sameViewport(nextViewport, previousViewport) || (current = nextViewport);
      if (isImmediate) {
        let hasUncommittedChange: Dynamic = !sameViewport(committed, current);
        commit(true);
        hasUncommittedChange || paintViewport();
        return;
      }
      (sameViewport(current, committed) && sameViewport(current, painted)) ||
        (shouldHintWillChange &&
          worldElement &&
          settleTimer === undefined &&
          (worldElement.style.willChange = "transform"),
        frameHandle || (paintViewport(), (frameHandle = requestAnimationFrame(handleFrame))),
        clearTimeout(settleTimer),
        (settleTimer = setTimeout((): Dynamic => {
          paintViewport();
          commit(false);
        }, settleDelay)));
    },
    cancelGlide: Dynamic = (): Dynamic => {
      glideFrameHandle && cancelAnimationFrame(glideFrameHandle);
      glideFrameHandle = 0;
      glideTarget = null;
    };
  return {
    get: (): Dynamic => current,
    rest: (): Dynamic => glideTarget ?? current,
    set(update: Dynamic, isImmediate: Dynamic = false): Dynamic {
      cancelGlide();
      applyViewport(update, isImmediate);
    },
    glide(update: Dynamic): Dynamic {
      cancelGlide();
      let startViewport: Dynamic = current,
        targetViewport: Dynamic =
          typeof update == "function" ? update(startViewport) : update,
        distance: Dynamic = Math.hypot(
          targetViewport.x * targetViewport.scale - startViewport.x * startViewport.scale,
          targetViewport.y * targetViewport.scale - startViewport.y * startViewport.scale,
        ),
        duration: Dynamic = CanvasViewportStoreMatches() ? 0 : getGlideDuration(distance);
      if (duration <= 0 || sameViewport(targetViewport, startViewport)) {
        applyViewport(targetViewport, true);
        return;
      }
      glideTarget = targetViewport;
      let startTime: Dynamic,
        step: Dynamic = (timestamp?: Dynamic): Dynamic => {
          startTime ??= timestamp;
          let progress: Dynamic = Math.min(
            1,
            Math.max(0, (timestamp - startTime) / duration),
          );
          glideFrameHandle = progress < 1 ? requestAnimationFrame(step) : 0;
          progress >= 1 && (glideTarget = null);
          applyViewport(
            progress < 1
              ? interpolateViewport(
                  startViewport,
                  targetViewport,
                  viewportAnimationEasing(progress),
                )
              : targetViewport,
            progress >= 1,
          );
        };
      glideFrameHandle = requestAnimationFrame(step);
    },
    settle(): Dynamic {
      settleTimer !== undefined && (paintViewport(), commit(true));
    },
    halt(): Dynamic {
      let wasGliding: Dynamic = glideFrameHandle !== 0;
      cancelGlide();
      !(!wasGliding && settleTimer === undefined) && (paintViewport(), commit(true));
    },
    subscribe(listener: Dynamic): Dynamic {
      listeners.add(listener);
      return (): Dynamic => {
        listeners.delete(listener);
      };
    },
    attach(element: Dynamic): Dynamic {
      worldElement = element;
      if (worldElement) {
        worldElement.style.transform = viewportTransformCss(current);
        paintDotGrid(worldElement, current);
        painted = current;
        return;
      }
      cancelGlide();
      clearTimeout(settleTimer);
      settleTimer = undefined;
      frameHandle && cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    },
    stamp(element: Dynamic): Dynamic {
      if (element) {
        scaleElements.add(element);
        applyScaleVars(element);
        return (): Dynamic => {
          scaleElements.delete(element);
        };
      }
    },
    paint: paintViewport,
  };
}
function useViewportStore(): Dynamic {
  return (
    (0, reactCanvasPreviewMounting.useContext)(ViewportContext) ??
    createViewportStoreValue
  );
}
function useViewport(isLive: Dynamic = true, storeOverride?: Dynamic): Dynamic {
  let contextStore: Dynamic = useViewportStore(),
    store: Dynamic = storeOverride ?? contextStore,
    snapshotRef: Dynamic = (0, reactCanvasPreviewMounting.useRef)(null),
    getSnapshot: Dynamic = (): Dynamic => (
      (isLive || snapshotRef.current === null) && (snapshotRef.current = store.get()),
      snapshotRef.current
    );
  return (0, reactCanvasPreviewMounting.useSyncExternalStore)(
    store.subscribe,
    getSnapshot,
    getSnapshot,
  );
}
function useViewportScale(isLive: Dynamic = true): Dynamic {
  let store: Dynamic = useViewportStore(),
    scaleRef: Dynamic = (0, reactCanvasPreviewMounting.useRef)(null),
    getSnapshot: Dynamic = (): Dynamic => (
      (isLive || scaleRef.current === null) &&
        (scaleRef.current = store.get().scale),
      scaleRef.current
    );
  return (0, reactCanvasPreviewMounting.useSyncExternalStore)(
    store.subscribe,
    getSnapshot,
    getSnapshot,
  );
}
function useViewportMinScale(minScale?: Dynamic): Dynamic {
  let store: Dynamic = useViewportStore(),
    getSnapshot: Dynamic = (): Dynamic => store.get().scale >= minScale;
  return (0, reactCanvasPreviewMounting.useSyncExternalStore)(
    store.subscribe,
    getSnapshot,
    getSnapshot,
  );
}
function ViewportScale({ children: children }: Dynamic): Dynamic {
  return children(useViewportScale());
}
function ViewportScaleThreshold({
  min: minScale,
  children: children,
}: Dynamic): Dynamic {
  return children(useViewportMinScale(minScale));
}
export {
  animateViewportZoom,
  CanvasViewportStoreConstant,
  CanvasViewportStoreMatches,
  createViewportStore,
  createViewportStoreValue,
  interpolateViewport,
  isArtboardInViewport,
  previewZoomDuration,
  sameViewport,
  useViewport,
  useViewportMinScale,
  useViewportScale,
  useViewportStore,
  viewportAnimationEasing,
  ViewportContext,
  ViewportScale,
  ViewportScaleThreshold,
  viewportTransformCss,
};
export function installCanvasViewportStore(): () => void {
  return () => {
    CanvasViewportStoreConstant = 120;
    CanvasViewportStoreMatches = (): Dynamic =>
      typeof matchMedia == "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    animateViewportZoom = !getDevicePreviewCapabilities()
      .coarsePointer;
    createViewportStoreValue = createViewportStore(
      {
        x: 0,
        y: 0,
        scale: 1,
      },
      (): Dynamic => {},
    );
    ViewportContext = (0, reactCanvasPreviewMounting.createContext)(
      null,
    );
  };
}

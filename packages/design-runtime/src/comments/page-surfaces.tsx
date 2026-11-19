import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { ViewportScale } from "../canvas/viewport-store";
import { PeerCursors } from "../collaboration/peer-cursors";
import { react_YEt, stableAnchorHash } from "./anchor-codec";
import { load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { embedMemoryPrefix } from "../platform/file-content";

var jsx_zMe: Dynamic;
var zeroPageScroll: Dynamic;
var pageCommentSurfaceKey: Dynamic;
function createPageScrollStore(): Dynamic {
  let entries: Dynamic = new Map(),
    values: Dynamic = new Set();
  return {
    get: (file?: Dynamic): Dynamic => entries.get(file) ?? zeroPageScroll,
    set(file: Dynamic, x: Dynamic, y: Dynamic): Dynamic {
      let currentScroll: Dynamic = entries.get(file) ?? zeroPageScroll;
      if (!(currentScroll.x === x && currentScroll.y === y)) {
        entries.set(file, {
          x: x,
          y: y,
        });
        for (let listener of [...values] as Dynamic) listener();
      }
    },
    subscribe(listener: Dynamic): Dynamic {
      values.add(listener);
      return (): Dynamic => values.delete(listener);
    },
  };
}
function observePageScrollAndPointer(
  targetWindow?: Dynamic,
  onPointer?: Dynamic,
  onScroll?: Dynamic,
): Dynamic {
  let toFiniteNumber: Dynamic = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "number" && Number.isFinite(candidate) ? candidate : 0,
    lastPointer: Dynamic = null,
    reportScrollAndPointer: Dynamic = (): Dynamic => {
      try {
        let scrollX: Dynamic = toFiniteNumber(targetWindow.scrollX),
          scrollY: Dynamic = toFiniteNumber(targetWindow.scrollY);
        onScroll(scrollX, scrollY);
        lastPointer && onPointer(lastPointer.x + scrollX, lastPointer.y + scrollY);
      } catch {}
    },
    handlePointerMove: Dynamic = (rawEvent?: Dynamic): Dynamic => {
      let pointerEvent: Dynamic = rawEvent;
      pointerEvent.isTrusted &&
        ((lastPointer = {
          x: pointerEvent.clientX,
          y: pointerEvent.clientY,
        }),
        reportScrollAndPointer());
    },
    handlePointerOut: Dynamic = (rawEvent?: Dynamic): Dynamic => {
      let pointerEvent: Dynamic = rawEvent;
      pointerEvent.isTrusted && pointerEvent.relatedTarget == null && (lastPointer = null);
    },
    state: Dynamic = {
      capture: true,
      passive: true,
    };
  try {
    targetWindow.addEventListener("pointermove", handlePointerMove, state);
    targetWindow.addEventListener("pointerout", handlePointerOut, state);
    targetWindow.addEventListener("scroll", reportScrollAndPointer, {
      passive: true,
    });
  } catch {
    return null;
  }
  reportScrollAndPointer();
  return (): Dynamic => {
    try {
      targetWindow.removeEventListener("pointermove", handlePointerMove, state);
      targetWindow.removeEventListener("pointerout", handlePointerOut, state);
      targetWindow.removeEventListener("scroll", reportScrollAndPointer);
    } catch {}
  };
}
function pagePointerWithinBox(
  clientX?: Dynamic,
  clientY?: Dynamic,
  scroll?: Dynamic,
  box?: Dynamic,
): Dynamic {
  let left: Dynamic = clientX - scroll.x,
    top: Dynamic = clientY - scroll.y;
  return left < 0 || top < 0 || left > box.w || top > box.h
    ? null
    : {
        left: left,
        top: top,
      };
}
function PageCommentSurface({
  file: file,
  box: box,
  store: store,
}: Dynamic): Dynamic {
  useUiLocale();
  let pageScroll: Dynamic = (0, react_YEt.useSyncExternalStore)(
    store.subscribe,
    (): Dynamic => store.get(file),
    (): Dynamic => store.get(file),
  );
  return (
    <ViewportScale>
      {(scale?: Dynamic): Dynamic => (
        <PeerCursors
          surface={pageCommentSurfaceKey(file)}
          toLocal={(clientX?: Dynamic, clientY?: Dynamic): Dynamic =>
            pagePointerWithinBox(clientX, clientY, pageScroll, box)
          }
          glyphScale={1 / scale}
        />
      )}
    </ViewportScale>
  );
}
export {
  createPageScrollStore,
  jsx_zMe,
  observePageScrollAndPointer,
  PageCommentSurface,
  pageCommentSurfaceKey,
  pagePointerWithinBox,
  zeroPageScroll,
};
export function installCommentsPageSurfaces(): () => void {
  return () => {
    jsx_zMe = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    zeroPageScroll = {
      x: 0,
      y: 0,
    };
    pageCommentSurfaceKey = (file?: Dynamic): Dynamic =>
      embedMemoryPrefix() +
      "page:" +
      stableAnchorHash(file);
  };
}

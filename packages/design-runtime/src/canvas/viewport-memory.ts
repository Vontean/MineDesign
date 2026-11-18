/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getDocumentStashKey } from "../platform/document-stash";
import { getEmbedContext } from "../platform/file-content";

var isFiniteNumber: Dynamic;
var viewportScaleLimits: Dynamic;
var createViewportMemoryValue: Dynamic;
var recallCanvasView: Dynamic;
var rememberCanvasView: Dynamic;
function getArtifactMemoryScope(): Dynamic {
  let pathname: Dynamic =
    typeof location === "undefined" ? "/" : location.pathname;
  return getDocumentStashKey(pathname).slice(
    getDocumentStashKey("").length,
  );
}
function createViewportMemory(getStorageKey?: Dynamic, scaleLimits?: Dynamic): Dynamic {
  return {
    recall(expectedPage: Dynamic): Dynamic {
      try {
        let storedText: Dynamic = sessionStorage.getItem(getStorageKey());
        if (storedText === null) return;
        let storedView: Dynamic = JSON.parse(storedText);
        if (
          typeof storedView != "object" ||
          storedView === null ||
          !(
            "page" in storedView &&
            "x" in storedView &&
            "y" in storedView &&
            "scale" in storedView
          )
        )
          return;
        let {
          page: storedPage,
          x: storedX,
          y: storedY,
          scale: storedScale,
        }: Dynamic = storedView;
        return storedPage !== expectedPage ||
          !isFiniteNumber(storedX) ||
          !isFiniteNumber(storedY) ||
          !isFiniteNumber(storedScale) ||
          storedScale < scaleLimits.minScale ||
          storedScale > scaleLimits.maxScale
          ? undefined
          : {
              x: storedX,
              y: storedY,
              scale: storedScale,
            };
      } catch {
        return;
      }
    },
    remember(page: Dynamic, view: Dynamic): Dynamic {
      try {
        sessionStorage.setItem(
          getStorageKey(),
          JSON.stringify({
            page: page,
            x: view.x,
            y: view.y,
            scale: view.scale,
          }),
        );
      } catch {}
    },
  };
}
function getViewportMemoryScope(): Dynamic {
  let embedContext: Dynamic = getEmbedContext();
  return embedContext !== null
    ? "embed/" + embedContext.memoryScope
    : getArtifactMemoryScope();
}
export {
  createViewportMemory,
  createViewportMemoryValue,
  getArtifactMemoryScope,
  getViewportMemoryScope,
  isFiniteNumber,
  recallCanvasView,
  rememberCanvasView,
  viewportScaleLimits,
};
export function installCanvasViewportMemory(): () => void {
  return () => {
    isFiniteNumber = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "number" && Number.isFinite(candidate);
    viewportScaleLimits = {
      minScale: 0.05,
      maxScale: 8,
    };
    createViewportMemoryValue = createViewportMemory(
      (): Dynamic => "design-view/" + getViewportMemoryScope(),
      viewportScaleLimits,
    );
    recallCanvasView = createViewportMemoryValue.recall;
    rememberCanvasView = createViewportMemoryValue.remember;
  };
}

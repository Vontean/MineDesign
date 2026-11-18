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
  let value: Dynamic =
    typeof location === "undefined" ? "/" : location.pathname;
  return getDocumentStashKey(value).slice(
    getDocumentStashKey("").length,
  );
}
function createViewportMemory(input?: Dynamic, options?: Dynamic): Dynamic {
  return {
    recall(input2: Dynamic): Dynamic {
      try {
        let value: Dynamic = sessionStorage.getItem(input());
        if (value === null) return;
        let value2: Dynamic = JSON.parse(value);
        if (
          typeof value2 != "object" ||
          value2 === null ||
          !(
            "page" in value2 &&
            "x" in value2 &&
            "y" in value2 &&
            "scale" in value2
          )
        )
          return;
        let {
          page: value3,
          x: value4,
          y: value5,
          scale: value6,
        }: Dynamic = value2;
        return value3 !== input2 ||
          !isFiniteNumber(value4) ||
          !isFiniteNumber(value5) ||
          !isFiniteNumber(value6) ||
          value6 < options.minScale ||
          value6 > options.maxScale
          ? undefined
          : {
              x: value4,
              y: value5,
              scale: value6,
            };
      } catch {
        return;
      }
    },
    remember(input2: Dynamic, options2: Dynamic): Dynamic {
      try {
        sessionStorage.setItem(
          input(),
          JSON.stringify({
            page: input2,
            x: options2.x,
            y: options2.y,
            scale: options2.scale,
          }),
        );
      } catch {}
    },
  };
}
function getViewportMemoryScope(): Dynamic {
  let value: Dynamic = getEmbedContext();
  return value !== null
    ? "embed/" + value.memoryScope
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
    isFiniteNumber = (input?: Dynamic): Dynamic =>
      typeof input == "number" && Number.isFinite(input);
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

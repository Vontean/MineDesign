import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasMeasurements } from "../../canvas/measurements";
import { load_react_jsx_runtime } from "../../dependencies";
import { reactToolbarPrimitives, ToolbarPrimitivesLabel, ToolbarPrimitivesMediaQuery } from "./primitives";
import { toModuleNamespace } from "../../module-helpers";

var jsxToolbarLayout: Dynamic;
var ToolbarLayoutLimit: Dynamic;
var ToolbarLayoutConstant: Dynamic;
var touchPinWidthThreshold: Dynamic;
var ToolbarLayoutLabel: Dynamic;
var visibleToolbarContentSelector: Dynamic;
var ToolbarLayoutPresentationNoneGroupSet: Dynamic;
var ToolbarLayoutMatches: Dynamic;
var ToolbarLayoutHasAttribute: Dynamic;
var minYieldContentWidth: Dynamic;
function useToolbarMediaQuery(query?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactToolbarPrimitives.useCallback)(
    (listener?: Dynamic): Dynamic => {
      if (typeof matchMedia != "function") return (): Dynamic => {};
      let mediaQuery: Dynamic = matchMedia(query);
      mediaQuery.addEventListener("change", listener);
      return (): Dynamic => mediaQuery.removeEventListener("change", listener);
    },
    [query],
  );
  return (0, reactToolbarPrimitives.useSyncExternalStore)(
    value,
    (): Dynamic =>
      typeof matchMedia == "function" && matchMedia(query).matches,
    (): Dynamic => false,
  );
}
function useTouchToolbar(): Dynamic {
  return useToolbarMediaQuery(ToolbarPrimitivesMediaQuery);
}
function usePhoneCanvas(): Dynamic {
  return useToolbarMediaQuery(ToolbarPrimitivesLabel);
}
function hasVisibleToolbarContent(
  element?: Dynamic,
  visibilityOptions: Dynamic = {},
): Dynamic {
  let attribute: Dynamic = element.getAttribute("role");
  if (
    visibilityOptions.skip?.(element) ||
    (visibilityOptions.pinFixed && element.classList.contains("tb-pin-scroll"))
  )
    return false;
  if (element.hasAttribute("data-tb-shows") && !element.closest("[hidden]"))
    return true;
  if (element.matches(ToolbarLayoutLabel) || attribute === "separator")
    return false;
  if (
    element.matches(visibleToolbarContentSelector) ||
    (attribute !== null &&
      !ToolbarLayoutPresentationNoneGroupSet.has(attribute))
  )
    return true;
  for (let value of element.childNodes as Dynamic)
    if (
      (value.nodeType === 3 && value.textContent?.trim()) ||
      (value.nodeType === 1 && hasVisibleToolbarContent(value, visibilityOptions))
    )
      return true;
  return false;
}
function visibleToolbarSeatCount(
  element?: Dynamic,
  visibilityOptions?: Dynamic,
): Dynamic {
  let index: Dynamic = 0;
  for (let value of element.children as Dynamic)
    index += value.matches("[data-tb-seat], .contents")
      ? visibleToolbarSeatCount(value, visibilityOptions)
      : hasVisibleToolbarContent(value, visibilityOptions)
        ? 1
        : 0;
  return index;
}
function updateToolbarEmptySlots(element?: Dynamic): Dynamic {
  let state: Dynamic = {
    pinFixed: element.hasAttribute("data-pin-fixed"),
  };
  for (let value of element.querySelectorAll(
    ".tb-slot, .tb-tail, .tb-publish",
  ) as Dynamic)
    ToolbarLayoutHasAttribute(
      value,
      "data-tb-empty",
      !hasVisibleToolbarContent(value, state),
    );
  for (let value of element.querySelectorAll(".tb-tail") as Dynamic)
    ToolbarLayoutHasAttribute(
      value,
      "data-tb-only-dot",
      !hasVisibleToolbarContent(value, {
        ...state,
        skip: ToolbarLayoutMatches,
      }),
    );
  for (let value of element.querySelectorAll(".tb-publish") as Dynamic)
    ToolbarLayoutHasAttribute(
      value,
      "data-tb-has-save",
      [...value.querySelectorAll("[data-tb-save]")].some(
        (childElement?: Dynamic): Dynamic => hasVisibleToolbarContent(childElement, state),
      ),
    );
  for (let value of element.querySelectorAll(".tb-card") as Dynamic)
    ToolbarLayoutHasAttribute(
      value,
      "data-tb-empty",
      !hasVisibleToolbarContent(value, state),
    );
  let startCard: Dynamic = element.querySelector(".tb-card-start");
  if (startCard) {
    let index: Dynamic = 0;
    for (let value of startCard.querySelectorAll(
      ".tb-scroll > .tb-slot",
    ) as Dynamic)
      index += visibleToolbarSeatCount(value, state);
    ToolbarLayoutHasAttribute(startCard, "data-tb-floor", index >= 3);
  }
}
function updateToolbarPinnedWords(element?: Dynamic): Dynamic {
  let scrollContainer: Dynamic = element.querySelector(".tb-scroll");
  if (!scrollContainer) return;
  if (!scrollContainer.querySelector(".tb-lock-words"))
    return scrollContainer.removeAttribute("data-tb-lock-words");
  if (scrollContainer.scrollLeft > 1 && !scrollContainer.hasAttribute("data-tb-lock-words"))
    return;
  let yieldContainer: Dynamic = scrollContainer.querySelector(".tb-yields"),
    value: Dynamic = yieldContainer ? "yield" : "";
  scrollContainer.getAttribute("data-tb-lock-words") !== value &&
    scrollContainer.setAttribute("data-tb-lock-words", value);
  let hasOverflow: Dynamic =
    yieldContainer != null &&
    yieldContainer.clientWidth < minYieldContentWidth &&
    yieldContainer.scrollWidth > yieldContainer.clientWidth;
  (scrollContainer.scrollWidth > scrollContainer.clientWidth + 1 || hasOverflow) &&
    scrollContainer.removeAttribute("data-tb-lock-words");
}
function toolbarDensity(density: Dynamic = "compact"): Dynamic {
  return useTouchToolbar() ? "comfortable" : density;
}
function useToolbarOverlaySize(): Dynamic {
  let [value, setOverlayHeight]: Dynamic = (0,
    reactCanvasMeasurements.useState)(0),
    [isOverlayVisible, setOverlayVisible]: Dynamic = (0, reactCanvasMeasurements.useState)(
      0,
    ),
    [toolbarRoot, setToolbarRoot]: Dynamic = (0, reactCanvasMeasurements.useState)(
      null,
    );
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    let overlayRoot: Dynamic = null;
    for (
      let parentElement: Dynamic = toolbarRoot?.parentElement;
      parentElement && !overlayRoot;
      parentElement = parentElement.parentElement
    )
      overlayRoot = parentElement.querySelector(":scope > .tb-root");
    if (!toolbarRoot || !overlayRoot) {
      setOverlayHeight(0);
      setOverlayVisible(0);
      return;
    }
    let overlayElement: Dynamic = overlayRoot,
      callback: Dynamic = (): Dynamic => {
        if (!overlayElement.hasAttribute("data-tb-overlay")) {
          setOverlayHeight(0);
          setOverlayVisible(0);
          return;
        }
        let bounds: Dynamic = overlayElement.getBoundingClientRect();
        setOverlayHeight(
          Math.max(
            0,
            Math.round(bounds.bottom - toolbarRoot.getBoundingClientRect().top),
          ),
        );
        let cards: Dynamic = [...overlayElement.querySelectorAll(".tb-card")]
          .map((card?: Dynamic): Dynamic => card.getBoundingClientRect())
          .filter((card?: Dynamic): Dynamic => card.width > 0)
          .flatMap(
            (rect?: Dynamic): Dynamic => [
              rect.left - bounds.left,
              bounds.right - rect.right,
            ],
          );
        setOverlayVisible(
          cards.length > 0
            ? Math.max(0, Math.round(Math.min(...cards)))
            : 0,
        );
      };
    callback();
    let resizeObserver: Dynamic =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(callback);
    resizeObserver?.observe(overlayElement, {
      attributes: true,
      attributeFilter: ["data-tb-overlay"],
    });
    let mutationObserver: Dynamic =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(callback);
    mutationObserver?.observe(overlayElement);
    mutationObserver?.observe(toolbarRoot);
    return (): Dynamic => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [toolbarRoot]);
  return [value, setToolbarRoot, isOverlayVisible];
}
function toolbarOverlayHeight(element?: Dynamic): Dynamic {
  return (
    parseFloat(getComputedStyle(element).getPropertyValue("--tb-overlay-h")) ||
    0
  );
}
function ToolbarDivider(): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      className={
        "tb-divider mx-0.5 h-[18px] w-px shrink-0 self-center bg-border-line"
      }
    />
  );
}
export {
  hasVisibleToolbarContent,
  jsxToolbarLayout,
  toolbarDensity,
  ToolbarDivider,
  ToolbarLayoutConstant,
  touchPinWidthThreshold,
  ToolbarLayoutHasAttribute,
  ToolbarLayoutLabel,
  visibleToolbarContentSelector,
  ToolbarLayoutLimit,
  minYieldContentWidth,
  ToolbarLayoutMatches,
  ToolbarLayoutPresentationNoneGroupSet,
  toolbarOverlayHeight,
  updateToolbarEmptySlots,
  updateToolbarPinnedWords,
  usePhoneCanvas,
  useToolbarMediaQuery,
  useToolbarOverlaySize,
  useTouchToolbar,
  visibleToolbarSeatCount,
};
export function installEditorToolbarLayout(): () => void {
  return () => {
    jsxToolbarLayout = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ToolbarLayoutLimit = 1e3;
    ToolbarLayoutConstant = 896;
    touchPinWidthThreshold = 1072;
    ToolbarLayoutLabel =
      "[hidden], [aria-hidden='true'], [data-quiet], [data-tb-paddle], [data-tb-fade], .tb-divider";
    visibleToolbarContentSelector =
      "button, input, select, textarea, a[href], img, svg, video, canvas, [data-cds]:not([data-cds='Surface']), [data-tb-status], [data-tb-shows]";
    ToolbarLayoutPresentationNoneGroupSet = new Set([
      "presentation",
      "none",
      "group",
      "toolbar",
      "separator",
      "region",
    ]);
    ToolbarLayoutMatches = (element?: Dynamic): Dynamic =>
      element.matches(".tb-sync-dot, [data-tb-save]");
    ToolbarLayoutHasAttribute = (
      element?: Dynamic,
      attributeName?: Dynamic,
      enabled?: Dynamic,
    ): Dynamic => {
      enabled !== element.hasAttribute(attributeName) &&
        element.toggleAttribute(attributeName, enabled);
    };
    minYieldContentWidth = 48;
  };
}

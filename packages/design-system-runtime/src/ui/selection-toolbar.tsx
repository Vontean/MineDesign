/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  SelectionToolbarOptions,
} from "../contracts/composition";
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactSelectionToolbar: ReactNamespace;
var HIDDEN_SELECTION_TOOLBAR_STYLE: React.CSSProperties;
function useSelectionToolbar(
  containerRef: React.RefObject<HTMLElement | null>,
  options: SelectionToolbarOptions = {},
) {
  let {
      gap = 8,
      holdWhileFocusIn: holdWhileFocusIn,
      enabled = true,
    } = options,
    stripRef = reactSelectionToolbar.useRef<HTMLElement | null>(null),
    rangeRef = reactSelectionToolbar.useRef<Range | null>(null),
    [selectionRect, setSelectionRect] =
      reactSelectionToolbar.useState<DOMRect | null>(null),
    [style, setStyle] = reactSelectionToolbar.useState(
      HIDDEN_SELECTION_TOOLBAR_STYLE,
    ),
    [placed, setPlaced] = reactSelectionToolbar.useState<"above" | "below">(
      "above",
    ),
    [stripWidth, setStripWidth] = reactSelectionToolbar.useState(0),
    refreshSelection = reactSelectionToolbar.useCallback(() => {
      let current = containerRef.current;
      if (!enabled || current === null) {
        return setSelectionRect(null);
      }
      let value = holdWhileFocusIn?.current;
      if (
        value != null &&
        value.contains(current.ownerDocument.activeElement)
      ) {
        let previousRange = rangeRef.current;
        if (previousRange !== null) {
          setSelectionRect(previousRange.getBoundingClientRect());
        }
        return;
      }
      let selection = current.ownerDocument.getSelection();
      if (selection === null || selection.rangeCount === 0 || selection.isCollapsed) {
        return setSelectionRect(null);
      }
      let selectedRange = selection.getRangeAt(0);
      if (
        !current.contains(selectedRange.startContainer) ||
        !current.contains(selectedRange.endContainer)
      ) {
        return setSelectionRect(null);
      }
      let bounds = selectedRange.getBoundingClientRect();
      if (bounds.width === 0 && bounds.height === 0) {
        return setSelectionRect(null);
      }
      rangeRef.current = selectedRange.cloneRange();
      setSelectionRect(bounds);
    }, [containerRef, enabled, holdWhileFocusIn]);
  reactSelectionToolbar.useEffect(() => {
    if (!enabled) {
      return setSelectionRect(null);
    }
    let value = containerRef.current?.ownerDocument ?? document,
      ownerWindow = value.defaultView ?? window;
    value.addEventListener("selectionchange", refreshSelection);
    ownerWindow.addEventListener("scroll", refreshSelection, {
      capture: true,
      passive: true,
    });
    ownerWindow.addEventListener("resize", refreshSelection);
    return () => {
      value.removeEventListener("selectionchange", refreshSelection);
      ownerWindow.removeEventListener("scroll", refreshSelection, {
        capture: true,
      });
      ownerWindow.removeEventListener("resize", refreshSelection);
    };
  }, [containerRef, enabled, refreshSelection]);
  reactSelectionToolbar.useEffect(() => {
    let current = stripRef.current;
    if (current === null || typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(() =>
      setStripWidth(current.offsetWidth),
    );
    observer.observe(current);
    return () => observer.disconnect();
  }, []);
  reactSelectionToolbar.useLayoutEffect(() => {
    if (selectionRect === null) {
      return setStyle(HIDDEN_SELECTION_TOOLBAR_STYLE);
    }
    let current = stripRef.current,
      value = current?.offsetWidth ?? 0,
      toolbarHeight = current?.offsetHeight ?? 0,
      viewportWidth =
        containerRef.current?.ownerDocument.documentElement.clientWidth ??
        window.innerWidth,
      left = selectionRect.left + selectionRect.width / 2 - value / 2;
    left = Math.max(8, Math.min(left, viewportWidth - value - 8));
    let placeBelow = selectionRect.top - gap - toolbarHeight < 8,
      top = placeBelow
        ? selectionRect.bottom + gap
        : selectionRect.top - gap - toolbarHeight;
    setPlaced(placeBelow ? "below" : "above");
    setStyle({
      position: "fixed",
      top: Math.round(top),
      left: Math.round(left),
    });
  }, [selectionRect, gap, containerRef, stripWidth]);
  return {
    open: selectionRect !== null,
    style: style,
    placed: placed,
    stripRef: stripRef,
    range: () => rangeRef.current,
    refresh: refreshSelection,
  };
}
export {
  HIDDEN_SELECTION_TOOLBAR_STYLE,
  reactSelectionToolbar,
  useSelectionToolbar,
};
export function installUiSelectionToolbar(): () => void {
  return () => {
    reactSelectionToolbar = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    HIDDEN_SELECTION_TOOLBAR_STYLE = {
      position: "fixed",
      top: 0,
      left: 0,
      visibility: "hidden",
      pointerEvents: "none",
    };
  };
}

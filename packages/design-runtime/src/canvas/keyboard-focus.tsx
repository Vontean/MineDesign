/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { initializeInspectorContext } from "../editor/inspector/context";
import { isEditingInputTarget } from "../editor/keyboard/find";
import { hasBlockingEditorOverlay } from "../editor/text/typing-target";
import { toModuleNamespace } from "../module-helpers";

var react_LB: Dynamic;
var canvasFocusableSelector: Dynamic;
function isRenderedFocusableTarget(
  element: Dynamic,
  { rendered: rendered, topmostAt: topmostAt }: Dynamic,
  scope?: Dynamic,
): Dynamic {
  if (
    !element.matches(canvasFocusableSelector) ||
    element.closest('[inert], [hidden], [aria-hidden="true"]') != null ||
    !rendered(element)
  )
    return false;
  if (scope == null) return true;
  let bounds: Dynamic = element.getBoundingClientRect(),
    overlapLeft: Dynamic = Math.max(bounds.left, scope.left),
    overlapRight: Dynamic = Math.min(bounds.right, scope.right),
    overlapTop: Dynamic = Math.max(bounds.top, scope.top),
    overlapBottom: Dynamic = Math.min(bounds.bottom, scope.bottom);
  if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) return false;
  let topmostElement: Dynamic = topmostAt(
    (overlapLeft + overlapRight) / 2,
    (overlapTop + overlapBottom) / 2,
  );
  return topmostElement == null || element.contains(topmostElement);
}
function createCanvasKeyboardFocusController(
  getRoot?: Dynamic,
  {
    blocked: isBlocked = hasBlockingEditorOverlay,
    rendered: isRendered = (element?: Dynamic): Dynamic =>
      element.getClientRects().length > 0,
    topmostAt: findTopmostAt = (clientX?: Dynamic, clientY?: Dynamic): Dynamic =>
      (document as Dynamic).elementFromPoint(clientX, clientY),
  }: Dynamic = {},
): Dynamic {
  let state: Dynamic = {
      rendered: isRendered,
      topmostAt: findTopmostAt,
    },
    cache: Dynamic = new WeakMap(),
    getRegionEntries: Dynamic = (): Dynamic =>
      getRoot().flatMap((region?: Dynamic): Dynamic => {
        let regionElement: Dynamic = region.el();
        return regionElement && regionElement.isConnected
          ? [
              {
                region: region,
                el: regionElement,
              },
            ]
          : [];
      }),
    findRegionIndex: Dynamic = (entries?: Dynamic, target?: Dynamic): Dynamic => {
      if (!(target instanceof HTMLElement)) return -1;
      let bestIndex: Dynamic = -1;
      entries.forEach((entry?: Dynamic, entryIndex?: Dynamic): Dynamic => {
        entry.el.contains(target) &&
          (bestIndex === -1 || entries[bestIndex].el.contains(entry.el)) &&
          (bestIndex = entryIndex);
      });
      return bestIndex;
    },
    findActiveRegionIndex: Dynamic = (entries?: Dynamic): Dynamic =>
      findRegionIndex(entries, (document as Dynamic).activeElement),
    focusRegion: Dynamic = (entries?: Dynamic, targetEntry?: Dynamic): Dynamic => {
      let nestedEntries: Dynamic = entries.filter(
          (nestedEntry?: Dynamic): Dynamic =>
            nestedEntry !== targetEntry && targetEntry.el.contains(nestedEntry.el),
        ),
        anchorElement: Dynamic = targetEntry.region.anchor?.() ?? null;
      if (
        anchorElement &&
        anchorElement.isConnected &&
        targetEntry.el.contains(anchorElement) &&
        !nestedEntries.some(
          (nestedEntry?: Dynamic): Dynamic => nestedEntry.el.contains(anchorElement),
        ) &&
        (anchorElement.focus({
          preventScroll: true,
        }),
        (document as Dynamic).activeElement === anchorElement)
      )
        return true;
      let cachedElement: Dynamic = cache.get(targetEntry.el),
        candidates: Dynamic = [
          cachedElement && cachedElement.isConnected && targetEntry.el.contains(cachedElement)
            ? cachedElement
            : null,
          targetEntry.region.fallback?.() ?? null,
          ...targetEntry.el.querySelectorAll(canvasFocusableSelector),
        ],
        clipElement: Dynamic = targetEntry.region.clipTo?.() ?? null,
        clipBounds: Dynamic = clipElement ? clipElement.getBoundingClientRect() : null;
      for (let candidate of candidates as Dynamic)
        if (
          !(
            !candidate ||
            nestedEntries.some(
              (nestedEntry?: Dynamic): Dynamic => nestedEntry.el.contains(candidate),
            ) ||
            !isRenderedFocusableTarget(candidate, state, clipBounds)
          ) &&
          (candidate.focus({
            preventScroll: clipElement !== null,
          }),
          (document as Dynamic).activeElement === candidate)
        )
          return true;
      return false;
    },
    moveFocusRegion: Dynamic = (direction?: Dynamic): Dynamic => {
      if (isBlocked()) return;
      let entries: Dynamic = getRegionEntries(),
        length: Dynamic = entries.length;
      if (length === 0) return;
      let activeIndex: Dynamic = findActiveRegionIndex(entries),
        startIndex: Dynamic =
          activeIndex !== -1
            ? activeIndex
            : entries.findIndex(
                (entry?: Dynamic): Dynamic => entry.region.home,
              );
      for (let count: Dynamic = 1; count <= length; count++) {
        let nextIndex: Dynamic =
          (((startIndex + direction * count) % length) + length) % length;
        if (nextIndex !== activeIndex && focusRegion(entries, entries[nextIndex])) return;
      }
    },
    handleFocusIn: Dynamic = (event?: Dynamic): Dynamic => {
      let entries: Dynamic = getRegionEntries(),
        regionIndex: Dynamic = findRegionIndex(
          entries,
          event.target instanceof Element ? event.target : null,
        );
      regionIndex !== -1 && cache.set(entries[regionIndex].el, event.target);
    },
    isEscapeHeld: Dynamic = false,
    goHome: Dynamic = (
      currentElement: Dynamic = (document as Dynamic).activeElement,
    ): Dynamic => {
      isEscapeHeld = true;
      let entries: Dynamic = getRegionEntries(),
        homeEntry: Dynamic = entries.find(
          (entry?: Dynamic): Dynamic => entry.region.home,
        );
      (!homeEntry || !focusRegion(entries, homeEntry)) &&
        currentElement instanceof HTMLElement &&
        currentElement.blur();
    },
    handleKeyUp: Dynamic = (keyEvent?: Dynamic): Dynamic => {
      keyEvent.key === "Escape" && (isEscapeHeld = false);
    },
    handleEscapeKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.key !== "Escape") return;
      if (event.repeat && isEscapeHeld) {
        event.preventDefault();
        return;
      }
      isEscapeHeld = false;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        isBlocked()
      )
        return;
      let target: Dynamic = event.target;
      if (
        !(target instanceof HTMLElement) ||
        isEditingInputTarget(target) ||
        target.getAttribute("aria-expanded") === "true"
      )
        return;
      let entries: Dynamic = getRegionEntries(),
        activeIndex: Dynamic = findActiveRegionIndex(entries);
      activeIndex === -1 ||
        !entries[activeIndex].region.escapeHome ||
        (event.preventDefault(), goHome(target));
    },
    handleF6KeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      event.key !== "F6" ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        isBlocked() ||
        (event.preventDefault(),
        event.repeat || moveFocusRegion(event.shiftKey ? -1 : 1));
    },
    handleRegionKeyEvent: Dynamic = (regionEvent?: Dynamic): Dynamic =>
      moveFocusRegion(regionEvent.detail.reverse ? -1 : 1);
  (document as Dynamic).addEventListener("focusin", handleFocusIn);
  (window as Dynamic).addEventListener("keydown", handleF6KeyDown, true);
  (window as Dynamic).addEventListener("keydown", handleEscapeKeyDown, true);
  (window as Dynamic).addEventListener("keyup", handleKeyUp, true);
  (window as Dynamic).addEventListener("focus-region-key", handleRegionKeyEvent);
  return {
    move: moveFocusRegion,
    goHome: goHome,
    dispose(): Dynamic {
      (document as Dynamic).removeEventListener("focusin", handleFocusIn);
      (window as Dynamic).removeEventListener("keydown", handleF6KeyDown, true);
      (window as Dynamic).removeEventListener("keydown", handleEscapeKeyDown, true);
      (window as Dynamic).removeEventListener("keyup", handleKeyUp, true);
      (window as Dynamic).removeEventListener("focus-region-key", handleRegionKeyEvent);
    },
  };
}
function useCanvasKeyboardFocus(root?: Dynamic, blocked?: Dynamic): Dynamic {
  let rootRef: Dynamic = (0, react_LB.useRef)(root);
  rootRef.current = root;
  let blockedRef: Dynamic = (0, react_LB.useRef)(blocked);
  blockedRef.current = blocked;
  let controllerRef: Dynamic = (0, react_LB.useRef)({
    goHome: (): Dynamic => {},
  });
  (0, react_LB.useEffect)((): Dynamic => {
    let controller: Dynamic = createCanvasKeyboardFocusController(
      (): Dynamic => rootRef.current,
      {
        blocked: (): Dynamic =>
          hasBlockingEditorOverlay() ||
          (blockedRef.current?.() ?? false),
      },
    );
    controllerRef.current.goHome = (): Dynamic => controller.goHome();
    return controller.dispose;
  }, []);
  return controllerRef.current;
}
export {
  canvasFocusableSelector,
  createCanvasKeyboardFocusController,
  isRenderedFocusableTarget,
  react_LB,
  useCanvasKeyboardFocus,
};
export function installCanvasKeyboardFocus(): () => void {
  return () => {
    initializeInspectorContext();
    react_LB = toModuleNamespace(load_react(), 1);
    canvasFocusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactChromeOverlayState: Dynamic;
var blockingOverlaySelector: Dynamic;
var openCdsOverlaySelector: Dynamic;
var undoStepOverlayAttribute: Dynamic;
var heldUndoStepOverlayAttribute: Dynamic;
var undoStepPointerState: Dynamic;
var undoStepOverlayProps: Dynamic;
function joinClassNames(...classNames: Dynamic[]): Dynamic {
  return classNames.filter(Boolean).join(" ");
}
function hasOpenCdsOverlay(root: Dynamic = document): Dynamic {
  for (let overlay of root.querySelectorAll(openCdsOverlaySelector) as Dynamic)
    if (overlay.hasAttribute("data-open")) return true;
  return false;
}
function hasBlockingOverlay(root: Dynamic = document): Dynamic {
  for (let overlay of root.querySelectorAll(
    blockingOverlaySelector,
  ) as Dynamic)
    if (!isClosedOverlay(overlay)) return true;
  return false;
}
function holdOverlayUndoStep(pointerEvent?: Dynamic): Dynamic {
  if (pointerEvent.button !== 0) return;
  let currentTarget: Dynamic = pointerEvent.currentTarget,
    ownerDocument: Dynamic = currentTarget.ownerDocument,
    pointerId: Dynamic = pointerEvent.pointerId,
    activePointerIds: Dynamic = undoStepPointerState.get(currentTarget) ?? new Set();
  undoStepPointerState.set(currentTarget, activePointerIds);
  activePointerIds.add(pointerId);
  currentTarget.setAttribute(heldUndoStepOverlayAttribute, "");
  let handlePointerEnd: Dynamic = (endEvent?: Dynamic): Dynamic => {
    endEvent.pointerId === pointerId &&
      (activePointerIds.delete(pointerId),
      activePointerIds.size === 0 &&
        currentTarget.removeAttribute(heldUndoStepOverlayAttribute),
      ownerDocument.removeEventListener("pointerup", handlePointerEnd, true),
      ownerDocument.removeEventListener("pointercancel", handlePointerEnd, true));
  };
  ownerDocument.addEventListener("pointerup", handlePointerEnd, true);
  ownerDocument.addEventListener("pointercancel", handlePointerEnd, true);
}
function isUndoBlockedByOverlay(root: Dynamic = document): Dynamic {
  for (let overlay of root.querySelectorAll(
    blockingOverlaySelector,
  ) as Dynamic) {
    if (overlay.hasAttribute(heldUndoStepOverlayAttribute)) return true;
    if (
      !(overlay.hasAttribute("data-mc-scrim") || isClosedOverlay(overlay)) &&
      !overlay.hasAttribute(undoStepOverlayAttribute)
    )
      return true;
  }
  return false;
}
function isClosedOverlay(overlay?: Dynamic): Dynamic {
  return (overlay.closest("[data-open], [data-closed]") ?? overlay).hasAttribute(
    "data-closed",
  );
}
export {
  blockingOverlaySelector,
  hasBlockingOverlay,
  hasOpenCdsOverlay,
  heldUndoStepOverlayAttribute,
  holdOverlayUndoStep,
  isClosedOverlay,
  isUndoBlockedByOverlay,
  joinClassNames,
  openCdsOverlaySelector,
  reactChromeOverlayState,
  undoStepOverlayAttribute,
  undoStepOverlayProps,
  undoStepPointerState,
};
export function installEditorChromeOverlayState(): () => void {
  return () => {
    reactChromeOverlayState = toModuleNamespace(
      load_react(),
      1,
    );
    blockingOverlaySelector = [
      "[data-mc-popover]",
      "[data-mc-menu]",
      "[data-mc-scrim]",
      '[data-cds="Menu"]',
      '[data-cds="Popover"]',
      '[data-cds="Dialog"]',
      '[role="alertdialog"]:not([aria-modal="false"])',
      '[role="dialog"][aria-modal="true"]',
    ].join(", ");
    openCdsOverlaySelector = [
      '[data-cds="Menu"]',
      '[data-cds="ContextMenu"]',
      '[data-cds="DropdownButton"]',
      '[data-cds="SplitDropdownButton"]',
      '[data-cds="ModelSelector"]',
    ].join(", ");
    undoStepOverlayAttribute = "data-mc-undo-steps";
    heldUndoStepOverlayAttribute = "data-mc-undo-steps-held";
    undoStepPointerState = new WeakMap();
    undoStepOverlayProps = {
      [undoStepOverlayAttribute]: "",
      onPointerDownCapture: holdOverlayUndoStep,
    };
  };
}

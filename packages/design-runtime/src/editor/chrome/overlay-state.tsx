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
function joinClassNames(...input: Dynamic[]): Dynamic {
  return input.filter(Boolean).join(" ");
}
function hasOpenCdsOverlay(input: Dynamic = document): Dynamic {
  for (let value of input.querySelectorAll(openCdsOverlaySelector) as Dynamic)
    if (value.hasAttribute("data-open")) return true;
  return false;
}
function hasBlockingOverlay(input: Dynamic = document): Dynamic {
  for (let value of input.querySelectorAll(
    blockingOverlaySelector,
  ) as Dynamic)
    if (!isClosedOverlay(value)) return true;
  return false;
}
function holdOverlayUndoStep(input?: Dynamic): Dynamic {
  if (input.button !== 0) return;
  let currentTarget: Dynamic = input.currentTarget,
    ownerDocument: Dynamic = currentTarget.ownerDocument,
    pointerId: Dynamic = input.pointerId,
    value: Dynamic = undoStepPointerState.get(currentTarget) ?? new Set();
  undoStepPointerState.set(currentTarget, value);
  value.add(pointerId);
  currentTarget.setAttribute(heldUndoStepOverlayAttribute, "");
  let callback: Dynamic = (input2?: Dynamic): Dynamic => {
    input2.pointerId === pointerId &&
      (value.delete(pointerId),
      value.size === 0 &&
        currentTarget.removeAttribute(heldUndoStepOverlayAttribute),
      ownerDocument.removeEventListener("pointerup", callback, true),
      ownerDocument.removeEventListener("pointercancel", callback, true));
  };
  ownerDocument.addEventListener("pointerup", callback, true);
  ownerDocument.addEventListener("pointercancel", callback, true);
}
function isUndoBlockedByOverlay(input: Dynamic = document): Dynamic {
  for (let value of input.querySelectorAll(
    blockingOverlaySelector,
  ) as Dynamic) {
    if (value.hasAttribute(heldUndoStepOverlayAttribute)) return true;
    if (
      !(value.hasAttribute("data-mc-scrim") || isClosedOverlay(value)) &&
      !value.hasAttribute(undoStepOverlayAttribute)
    )
      return true;
  }
  return false;
}
function isClosedOverlay(input?: Dynamic): Dynamic {
  return (input.closest("[data-open], [data-closed]") ?? input).hasAttribute(
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

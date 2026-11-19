/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { blockingOverlaySelector, heldUndoStepOverlayAttribute, isClosedOverlay, isUndoBlockedByOverlay } from "../chrome/overlay-state";

var blockingOverlaySelectorAlias: Dynamic;
var TextTypingTargetRangeCheckboxPattern: Dynamic;
function hasBlockingEditorOverlay(): Dynamic {
  for (let value of (document as Dynamic).querySelectorAll(
    blockingOverlaySelectorAlias,
  ) as Dynamic)
    if (!isClosedOverlay(value)) return true;
  return false;
}
function hasHeldUndoOverlay(element: Dynamic = document): Dynamic {
  return (
    element.querySelector(
      "[" + heldUndoStepOverlayAttribute + "]",
    ) !== null
  );
}
function isCanvasTypingTarget(target?: Dynamic): Dynamic {
  if (target instanceof HTMLElement) {
    if (target.closest("[data-tweak-popup],[data-tweaks-surface]") != null)
      return false;
    if (
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      (target instanceof HTMLInputElement &&
        !TextTypingTargetRangeCheckboxPattern.test(target.type)) ||
      target.closest("[data-note-typing-strip]") != null
    )
      return true;
  }
  if (!isUndoBlockedByOverlay()) return false;
  if (hasHeldUndoOverlay()) return true;
  for (let value of (document as Dynamic).querySelectorAll(
    blockingOverlaySelectorAlias,
  ) as Dynamic)
    if (
      !(
        value.matches("[data-tweak-popup]") ||
        value.querySelector("[data-tweak-popup]") != null
      ) &&
      !isClosedOverlay(value)
    )
      return true;
  return false;
}
export {
  blockingOverlaySelectorAlias,
  hasBlockingEditorOverlay,
  hasHeldUndoOverlay,
  isCanvasTypingTarget,
  TextTypingTargetRangeCheckboxPattern,
};
export function installEditorTextTypingTarget(): () => void {
  return () => {
    blockingOverlaySelectorAlias = blockingOverlaySelector;
    TextTypingTargetRangeCheckboxPattern =
      /^(range|checkbox|radio|button|submit|reset|color|file|image)$/;
  };
}

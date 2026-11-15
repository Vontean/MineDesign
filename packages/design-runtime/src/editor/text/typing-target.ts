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
    if (!(0, isClosedOverlay)(value)) return true;
  return false;
}
function hasHeldUndoOverlay(element: Dynamic = document): Dynamic {
  return (
    element.querySelector(
      "[" + heldUndoStepOverlayAttribute + "]",
    ) !== null
  );
}
function isCanvasTypingTarget(input?: Dynamic): Dynamic {
  if (input instanceof HTMLElement) {
    if (input.closest("[data-tweak-popup],[data-tweaks-surface]") != null)
      return false;
    if (
      input.tagName === "TEXTAREA" ||
      input.isContentEditable ||
      (input instanceof HTMLInputElement &&
        !TextTypingTargetRangeCheckboxPattern.test(input.type)) ||
      input.closest("[data-note-typing-strip]") != null
    )
      return true;
  }
  if (!(0, isUndoBlockedByOverlay)()) return false;
  if (hasHeldUndoOverlay()) return true;
  for (let value of (document as Dynamic).querySelectorAll(
    blockingOverlaySelectorAlias,
  ) as Dynamic)
    if (
      !(
        value.matches("[data-tweak-popup]") ||
        value.querySelector("[data-tweak-popup]") != null
      ) &&
      !(0, isClosedOverlay)(value)
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

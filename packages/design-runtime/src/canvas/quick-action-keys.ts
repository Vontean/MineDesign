/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { revealSessionStripControl } from "../editor/session-strip/reveal";
import { hasBlockingEditorOverlay } from "../editor/text/typing-target";

var quickActionsFocusableSelector: Dynamic;
function handleQuickActionsArrowKeys(event?: Dynamic): Dynamic {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.metaKey ||
    event.ctrlKey ||
    hasBlockingEditorOverlay()
  )
    return;
  let isBackwardKey: Dynamic = event.key === "ArrowLeft" || event.key === "ArrowUp",
    isForwardKey: Dynamic = event.key === "ArrowRight" || event.key === "ArrowDown";
  if (!isBackwardKey && !isForwardKey && event.key !== "Home" && event.key !== "End")
    return;
  let target: Dynamic = event.target;
  if (
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
    target.isContentEditable ||
    !event.currentTarget.contains(target) ||
    target.closest('[role="dialog"], [role="menu"], [role="listbox"]') !==
      null
  )
    return;
  let focusableItems: Dynamic = Array.from(
    event.currentTarget.querySelectorAll(quickActionsFocusableSelector),
  ).filter(
    (candidate?: Dynamic): Dynamic =>
      candidate.closest('[role="dialog"], [role="menu"], [role="listbox"]') ===
        null && candidate.getClientRects().length > 0,
  );
  if (focusableItems.length === 0) return;
  let currentIndex: Dynamic = focusableItems.findIndex(
      (candidate?: Dynamic): Dynamic =>
        candidate === target || candidate.contains(target),
    ),
    nextIndex: Dynamic =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? focusableItems.length - 1
          : currentIndex === -1
            ? 0
            : (currentIndex + (isForwardKey ? 1 : -1) + focusableItems.length) % focusableItems.length;
  event.preventDefault();
  let nextItem: Dynamic = focusableItems[nextIndex];
  nextItem.focus({
    preventScroll: true,
  });
  revealSessionStripControl(event.currentTarget, nextItem);
}
export {
  handleQuickActionsArrowKeys,
  quickActionsFocusableSelector,
};
export function installCanvasQuickActionKeys(): () => void {
  return () => {
    quickActionsFocusableSelector =
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  };
}

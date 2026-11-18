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
  let value: Dynamic = event.key === "ArrowLeft" || event.key === "ArrowUp",
    value2: Dynamic = event.key === "ArrowRight" || event.key === "ArrowDown";
  if (!value && !value2 && event.key !== "Home" && event.key !== "End")
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
  let value3: Dynamic = Array.from(
    event.currentTarget.querySelectorAll(quickActionsFocusableSelector),
  ).filter(
    (input?: Dynamic): Dynamic =>
      input.closest('[role="dialog"], [role="menu"], [role="listbox"]') ===
        null && input.getClientRects().length > 0,
  );
  if (value3.length === 0) return;
  let value4: Dynamic = value3.findIndex(
      (input?: Dynamic): Dynamic =>
        input === target || input.contains(target),
    ),
    value5: Dynamic =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? value3.length - 1
          : value4 === -1
            ? 0
            : (value4 + (value2 ? 1 : -1) + value3.length) % value3.length;
  event.preventDefault();
  let value6: Dynamic = value3[value5];
  value6.focus({
    preventScroll: true,
  });
  revealSessionStripControl(event.currentTarget, value6);
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

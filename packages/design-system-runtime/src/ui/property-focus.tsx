/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  PopoverSide,
  PopoverPlacement,
  UndoPointerProps,
} from "../contracts/composition";
import { MENU_POPOVER_OPEN_SELECTORS, OPEN_OVERLAY_SELECTOR, reactForFrameChrome as reactPropertyFocus } from "../platform/frame-chrome";

var UNDO_STEPS_ATTRIBUTE: "data-mc-undo-steps";
var UNDO_STEPS_HELD_ATTRIBUTE: "data-mc-undo-steps-held";
var heldUndoPointerIds: WeakMap<HTMLElement, Set<number>>;
var pendingPopupFocusReturn: UndoPointerProps;
var TEXT_EDITABLE_SELECTOR: string;
var popupPointerEvent: React.KeyboardEventHandler<HTMLElement>;
var ToolbarTooltipSideContext: React.Context<
  PopoverSide | "left" | "right" | undefined
>;
var popupFocusReturnTimer: number;
function anyMenuOrPopoverOpen(page: ParentNode = document) {
  for (let value of page.querySelectorAll(
    MENU_POPOVER_OPEN_SELECTORS,
  )) {
    if (value.hasAttribute("data-open")) {
      return true;
    }
  }
  return false;
}
function hasOpenOverlay(root: ParentNode = document) {
  for (let value of root.querySelectorAll(OPEN_OVERLAY_SELECTOR)) {
    if (!isOverlayClosed(value)) {
      return true;
    }
  }
  return false;
}
function markHeldUndoPointer(pointerEvent: React.PointerEvent<HTMLElement>) {
  if (pointerEvent.button !== 0) {
    return;
  }
  let currentTarget = pointerEvent.currentTarget,
    ownerDocument = currentTarget.ownerDocument,
    pointerId = pointerEvent.pointerId,
    value = heldUndoPointerIds.get(currentTarget) ?? new Set();
  heldUndoPointerIds.set(currentTarget, value);
  value.add(pointerId);
  currentTarget.setAttribute(UNDO_STEPS_HELD_ATTRIBUTE, "");
  let callback = (releaseEvent: PointerEvent) => {
    if (releaseEvent.pointerId !== pointerId) {
      return;
    }
    value.delete(pointerId);
    if (value.size === 0) {
      currentTarget.removeAttribute(UNDO_STEPS_HELD_ATTRIBUTE);
    }
    ownerDocument.removeEventListener("pointerup", callback, true);
    ownerDocument.removeEventListener("pointercancel", callback, true);
  };
  ownerDocument.addEventListener("pointerup", callback, true);
  ownerDocument.addEventListener("pointercancel", callback, true);
}
function overlaysBlockUndo(root: ParentNode = document) {
  for (let value of root.querySelectorAll(OPEN_OVERLAY_SELECTOR)) {
    if (value.hasAttribute(UNDO_STEPS_HELD_ATTRIBUTE)) {
      return true;
    }
    if (value.hasAttribute("data-mc-scrim") || isOverlayClosed(value)) {
      continue;
    }
    if (!value.hasAttribute(UNDO_STEPS_ATTRIBUTE)) {
      return true;
    }
  }
  return false;
}
function isOverlayClosed(overlay: Element) {
  return (overlay.closest("[data-open], [data-closed]") ?? overlay).hasAttribute(
    "data-closed",
  );
}
function choosePopoverSide(
  anchor: Element | null | undefined,
  expectedHeight: number,
  preferredSide: PopoverSide = "bottom",
  minimumHeight: number = expectedHeight,
) {
  if (!anchor) {
    return {
      side: preferredSide,
      maxHeight: undefined,
    };
  }
  let bounds = anchor.getBoundingClientRect(),
    value =
      (anchor.ownerDocument.defaultView?.innerHeight ?? bounds.bottom) -
      bounds.bottom -
      16,
    spaceAbove = bounds.top - 16,
    [preferredSpace, alternateSpace] =
      preferredSide === "top" ? [spaceAbove, value] : [value, spaceAbove],
    resolvedSide =
      preferredSpace >= Math.min(expectedHeight, minimumHeight) || preferredSpace >= alternateSpace
        ? preferredSide
        : preferredSide === "top"
          ? "bottom"
          : "top",
    availableHeight = resolvedSide === "bottom" ? value : spaceAbove;
  return {
    side: resolvedSide,
    maxHeight: availableHeight < expectedHeight ? Math.max(availableHeight, 120) : undefined,
  };
}
export {
  anyMenuOrPopoverOpen,
  choosePopoverSide,
  hasOpenOverlay,
  heldUndoPointerIds,
  isOverlayClosed,
  markHeldUndoPointer,
  overlaysBlockUndo,
  pendingPopupFocusReturn,
  popupFocusReturnTimer,
  popupPointerEvent,
  TEXT_EDITABLE_SELECTOR,
  ToolbarTooltipSideContext,
  UNDO_STEPS_ATTRIBUTE,
  UNDO_STEPS_HELD_ATTRIBUTE,
};
export function installUiPropertyFocus(): () => void {
  return () => {
    UNDO_STEPS_ATTRIBUTE = "data-mc-undo-steps";
    UNDO_STEPS_HELD_ATTRIBUTE = "data-mc-undo-steps-held";
    heldUndoPointerIds = new WeakMap();
    pendingPopupFocusReturn = {
      [UNDO_STEPS_ATTRIBUTE]: "",
      onPointerDownCapture: markHeldUndoPointer,
    };
    TEXT_EDITABLE_SELECTOR =
      'input, select, textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], [role="textbox"]';
    popupPointerEvent = (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
        event.preventDefault();
      }
    };
    ToolbarTooltipSideContext = (
      reactPropertyFocus as typeof import("react")
    ).createContext<PopoverSide | "left" | "right" | undefined>(undefined);
    popupFocusReturnTimer = 320;
  };
}

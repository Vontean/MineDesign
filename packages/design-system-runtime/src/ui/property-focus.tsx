/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  PopoverSide,
  PopoverPlacement,
  UndoPointerProps,
} from "../contracts/composition";
import { MENU_POPOVER_OPEN_SELECTORS, OPEN_OVERLAY_SELECTOR, reactForPlatformFrameChrome2 } from "../platform/frame-chrome";

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
function hasOpenOverlay(input: ParentNode = document) {
  for (let value of input.querySelectorAll(OPEN_OVERLAY_SELECTOR)) {
    if (!isOverlayClosed(value)) {
      return true;
    }
  }
  return false;
}
function markHeldUndoPointer(input: React.PointerEvent<HTMLElement>) {
  if (input.button !== 0) {
    return;
  }
  let currentTarget = input.currentTarget,
    ownerDocument = currentTarget.ownerDocument,
    pointerId = input.pointerId,
    value = heldUndoPointerIds.get(currentTarget) ?? new Set();
  heldUndoPointerIds.set(currentTarget, value);
  value.add(pointerId);
  currentTarget.setAttribute(UNDO_STEPS_HELD_ATTRIBUTE, "");
  let callback = (input2: PointerEvent) => {
    if (input2.pointerId !== pointerId) {
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
function overlaysBlockUndo(input: ParentNode = document) {
  for (let value of input.querySelectorAll(OPEN_OVERLAY_SELECTOR)) {
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
function isOverlayClosed(input: Element) {
  return (input.closest("[data-open], [data-closed]") ?? input).hasAttribute(
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
    value2 = bounds.top - 16,
    [value3, value4] =
      preferredSide === "top" ? [value2, value] : [value, value2],
    value5 =
      value3 >= Math.min(expectedHeight, minimumHeight) || value3 >= value4
        ? preferredSide
        : preferredSide === "top"
          ? "bottom"
          : "top",
    value6 = value5 === "bottom" ? value : value2;
  return {
    side: value5,
    maxHeight: value6 < expectedHeight ? Math.max(value6, 120) : undefined,
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
      reactForPlatformFrameChrome2 as typeof import("react")
    ).createContext<PopoverSide | "left" | "right" | undefined>(undefined);
    popupFocusReturnTimer = 320;
  };
}

import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { hasBlockingOverlay } from "../chrome/overlay-state";
import { isEditingInputTarget } from "./find";

var KeyboardPasteLabel: Dynamic;
var imagePasteFailureMessage: Dynamic;
var KeyboardPasteReplace: Dynamic;
var KeyboardPasteJoinValue: Dynamic;
var menuAndListboxSelector: Dynamic;
var menuTriggerGroupSelector: Dynamic;
var RoleSwitchValue: Dynamic;
var KeyboardPasteSubscribers: Dynamic;
function imagePasteRefusal(
  target?: Dynamic,
  isImagePaste?: Dynamic,
  typedText: Dynamic = "",
  mediaKind: Dynamic = "image",
): Dynamic {
  let targetElement: Dynamic = target,
    isTextEntry: Dynamic =
      targetElement != null &&
      (targetElement.tagName === "TEXTAREA" || targetElement.isContentEditable === true),
    isTypingSurface: Dynamic =
      isTextEntry ||
      targetElement?.closest?.("[data-note-typing-strip],[data-link-mode]") != null;
  if ((isTextEntry || targetElement?.tagName === "INPUT") && typedText.trim() !== "")
    return {
      to: "chrome",
    };
  let localizeMessage: Dynamic = (message?: Dynamic): Dynamic =>
    mediaKind === "video" ? KeyboardPasteReplace(message) : message;
  return hasBlockingOverlay(targetElement?.ownerDocument ?? document)
    ? isImagePaste
      ? {
          to: "nobody",
          say: localizeMessage(KeyboardPasteLabel),
        }
      : {
          to: "chrome",
        }
    : isImagePaste
      ? isTypingSurface
        ? {
            to: "nobody",
            say: localizeMessage(imagePasteFailureMessage),
          }
        : {
            to: "canvas",
          }
      : {
          to: isEditingInputTarget(target) ? "chrome" : "canvas",
        };
}
function isControlTarget(target?: Dynamic): Dynamic {
  let targetElement: Dynamic = target;
  return (
    targetElement != null &&
    typeof targetElement.matches == "function" &&
    targetElement.matches(KeyboardPasteJoinValue)
  );
}
function shouldKeepLocalKeyboardEvent(event?: Dynamic): Dynamic {
  if (event.defaultPrevented) return true;
  let target: Dynamic = event.target;
  return target == null ||
    typeof target.closest != "function" ||
    event.metaKey ||
    event.ctrlKey
    ? false
    : target.closest(menuAndListboxSelector) != null
      ? true
      : event.shiftKey || event.altKey
        ? false
        : (event.key === "Enter" &&
              target.closest('button, [role="button"]') != null) ||
            ((event.key === "Enter" || event.key === " ") &&
              target.closest(RoleSwitchValue) != null)
          ? true
          : KeyboardPasteSubscribers.has(event.key) &&
            target.closest(menuTriggerGroupSelector) != null;
}
function isCanvasEnterAction(event?: Dynamic): Dynamic {
  return event.key !== "Enter" ||
    event.repeat ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    !(event.target instanceof Element)
    ? false
    : event.target.matches(
        '[data-posture="sheet"] [data-testid="dc-mode-pro"][aria-selected="true"]',
      );
}
export {
  imagePasteRefusal,
  isCanvasEnterAction,
  isControlTarget,
  KeyboardPasteJoinValue,
  KeyboardPasteLabel,
  imagePasteFailureMessage,
  menuAndListboxSelector,
  menuTriggerGroupSelector,
  KeyboardPasteReplace,
  KeyboardPasteSubscribers,
  RoleSwitchValue,
  shouldKeepLocalKeyboardEvent,
};
export function installEditorKeyboardPaste(): () => void {
  return () => {
    KeyboardPasteLabel =
      uiMessage("inspector.paste.theImageWasnTPasted");
    imagePasteFailureMessage =
      uiMessage("inspector.paste.theImageWasnTPasted2");
    KeyboardPasteReplace = (message?: Dynamic): Dynamic =>
      message.replace(uiMessage("inspector.paste.theImage"), uiMessage("inspector.paste.theVideo"));
    KeyboardPasteJoinValue = [
      "button",
      "summary",
      '[role="button"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="switch"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="menuitemcheckbox"]',
      '[role="menuitemradio"]',
      '[role="option"]',
      '[role="combobox"]',
    ]
      .map((selector?: Dynamic): Dynamic => selector + ':not([aria-disabled="true"])')
      .join(", ");
    menuAndListboxSelector =
      '[role="menu"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="listbox"], [role="option"]';
    menuTriggerGroupSelector =
      '[role="tablist"], [role="radiogroup"], [aria-haspopup="menu"], [aria-haspopup="listbox"]';
    RoleSwitchValue = '[role="switch"]';
    KeyboardPasteSubscribers = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
      " ",
    ]);
  };
}

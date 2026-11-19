import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { blockingOverlaySelector } from "../chrome/overlay-state";
import { isApplePlatform } from "./shortcuts";

var DataPropertyRowDataTweaksSurfaceRoleSeparatorValue: Dynamic;
var McFindAttribute: Dynamic;
var KeyboardFindXCVValues: Dynamic;
var KeyboardFindElementCache: Dynamic;
var KeyboardFindObservedElements: Dynamic;
var KeyboardFindRangeCheckboxPattern: Dynamic;
var DcKeyBrowsedAttribute: Dynamic;
function isPropertyEditorTarget(eventTarget?: Dynamic): Dynamic {
  let targetElement: Dynamic = eventTarget;
  return (
    targetElement != null &&
    typeof targetElement.closest == "function" &&
    targetElement.closest(DataPropertyRowDataTweaksSurfaceRoleSeparatorValue) != null
  );
}
function shortcutMatchesLetter(event?: Dynamic, letter?: Dynamic): Dynamic {
  return event.key.toLowerCase() === letter
    ? true
    : event.code === "Key" + letter.toUpperCase() &&
        /^[\p{L}\p{M}]$/u.test(event.key) &&
        !/\p{Script=Latin}/u.test(event.key);
}
function registerFindOwner(element?: Dynamic, handler?: Dynamic): Dynamic {
  KeyboardFindElementCache.set(element, handler);
  return (): Dynamic => {
    KeyboardFindElementCache.delete(element);
  };
}
function handleFindKeyboardEvent(event?: Dynamic): Dynamic {
  let target: Dynamic = event.target,
    findRoot: Dynamic =
      typeof target?.closest == "function"
        ? target.closest("[" + McFindAttribute + "]")
        : null;
  if (findRoot === null || target === null || event.key === "F6") return;
  let handledByOwner: Dynamic = false;
  try {
    handledByOwner =
      event.type === "keydown" &&
      KeyboardFindElementCache.get(findRoot)?.(event) === true;
  } catch {
    handledByOwner = false;
  }
  if (
    handledByOwner === false &&
    (target.tagName === "INPUT" ||
      (shortcutMatchesLetter(event, "s") &&
        isPlatformModifier(event, isApplePlatform())))
  )
    return;
  event.stopImmediatePropagation();
  let isPlainTyping: Dynamic =
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !/^F\d+$/.test(event.key) &&
      event.key !== "Tab" &&
      event.key !== "Enter" &&
      event.key !== " ",
    isEditShortcut: Dynamic =
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      KeyboardFindXCVValues.some(
        (letter?: Dynamic): Dynamic => shortcutMatchesLetter(event, letter),
      );
  !handledByOwner &&
    event.type === "keydown" &&
    (isPlainTyping || isEditShortcut) &&
    event.preventDefault();
}
function handleFindClipboardEvent(event?: Dynamic): Dynamic {
  let target: Dynamic = event.target;
  target === null ||
    typeof target.closest != "function" ||
    target.tagName === "INPUT" ||
    (target.closest("[" + McFindAttribute + "]") !== null &&
      (event.stopImmediatePropagation(), event.preventDefault()));
}
function installFindKeyboardHandlers(target?: Dynamic): Dynamic {
  if (!KeyboardFindObservedElements.has(target)) {
    KeyboardFindObservedElements.add(target);
    for (let eventName of ["keydown", "keyup", "keypress"] as Dynamic)
      target.addEventListener(eventName, handleFindKeyboardEvent, true);
    for (let eventName of ["cut", "copy", "paste"] as Dynamic)
      target.addEventListener(eventName, handleFindClipboardEvent, true);
  }
}
function isPlatformModifier(event?: Dynamic, isApple?: Dynamic): Dynamic {
  return (
    !event.altKey &&
    (isApple
      ? event.metaKey && !event.ctrlKey
      : event.ctrlKey && !event.metaKey)
  );
}
function isFindShortcut(
  event?: Dynamic,
  isApple: Dynamic = isApplePlatform(),
): Dynamic {
  return (
    isPlatformModifier(event, isApple) &&
    !event.shiftKey &&
    shortcutMatchesLetter(event, "f")
  );
}
function addNativeEventListener(
  target?: Dynamic,
  eventName?: Dynamic,
  listener?: Dynamic,
  listenerOptions?: Dynamic,
): Dynamic {
  let boundListener: Dynamic = listener;
  try {
    EventTarget.prototype.addEventListener.call(
      target,
      eventName,
      boundListener,
      listenerOptions,
    );
    return (): Dynamic =>
      EventTarget.prototype.removeEventListener.call(
        target,
        eventName,
        boundListener,
        listenerOptions,
      );
  } catch {
    target.addEventListener(eventName, boundListener, listenerOptions);
    return (): Dynamic => target.removeEventListener(eventName, boundListener, listenerOptions);
  }
}
function guardedNativeEventHandler(
  findController?: Dynamic,
  isEventAllowed: Dynamic = (event?: Dynamic): Dynamic => event.isTrusted,
  isBubbleOwner: Dynamic = (): Dynamic => true,
): Dynamic {
  return (event?: Dynamic): Dynamic => {
    try {
      let isBubbling: Dynamic = !isBubbleOwner();
      if (
        (event.eventPhase === 1) !== isBubbling ||
        !isEventAllowed(event) ||
        event.defaultPrevented
      )
        return;
      if (event.isComposing) {
        (isFindShortcut(event) ||
          findDirectionShortcut(event) !== undefined) &&
          event.preventDefault();
        return;
      }
      let consumeEvent: Dynamic = (): Dynamic => {
        event.preventDefault();
        isBubbling && event.stopImmediatePropagation();
      };
      if (isFindShortcut(event)) {
        findController.findKey() && consumeEvent();
        return;
      }
      let direction: Dynamic = findDirectionShortcut(event);
      if (
        direction === undefined ||
        (event.key !== "F3" && findController.ownsStepChord?.(event) === true)
      )
        return;
      if (!findController.isOpen()) {
        findController.findKey() && consumeEvent();
        return;
      }
      consumeEvent();
      findController.step(direction, event);
    } catch {
      return;
    }
  };
}
function findDirectionShortcut(
  event?: Dynamic,
  isApple: Dynamic = isApplePlatform(),
): Dynamic {
  if (
    event.key === "F3"
      ? !event.altKey && !event.metaKey && !event.ctrlKey
      : isPlatformModifier(event, isApple) &&
        shortcutMatchesLetter(event, "g")
  )
    return event.shiftKey ? -1 : 1;
}
function isTextEditableTarget(element?: Dynamic): Dynamic {
  let tagName: Dynamic = element.tagName;
  return (
    tagName === "TEXTAREA" ||
    element.isContentEditable === true ||
    (tagName === "INPUT" &&
      !KeyboardFindRangeCheckboxPattern.test(element.type))
  );
}
function blurTextOutsideFind(
  root: Dynamic = document,
  exemptSelector?: Dynamic,
  extraBlurSelector?: Dynamic,
): Dynamic {
  let activeElement: Dynamic = root.activeElement;
  activeElement === null ||
    activeElement.closest("[" + McFindAttribute + "]") !== null ||
    (!isTextEditableTarget(activeElement) &&
      (extraBlurSelector === undefined || activeElement.closest(extraBlurSelector) === null)) ||
    ((exemptSelector === undefined || activeElement.closest(exemptSelector) === null) &&
      activeElement.blur());
}
function isEditingInputTarget(target?: Dynamic): Dynamic {
  let targetElement: Dynamic = target;
  return targetElement == null || typeof targetElement.closest != "function"
    ? false
    : /^(INPUT|TEXTAREA|SELECT)$/.test(targetElement.tagName) ||
        targetElement.isContentEditable === true ||
        targetElement.closest(
          DataPropertyRowDataTweaksSurfaceRoleSeparatorValue +
            ',[data-mega-chrome="tweaks"],[data-note-typing-strip],[data-link-mode],[' +
            McFindAttribute +
            "]," +
            blockingOverlaySelector,
        ) != null;
}
function focusedOutlineRow(target?: Dynamic): Dynamic {
  let targetElement: Dynamic = target;
  if (targetElement == null || typeof targetElement.closest != "function") return null;
  let ancestor: Dynamic = targetElement.closest('[role="treeitem"]');
  return ancestor == null ||
    ancestor.getAttribute("aria-selected") === "true" ||
    ancestor.closest("[" + DcKeyBrowsedAttribute + "]") == null
    ? null
    : {
        name: ancestor.getAttribute("aria-label") || uiMessage("inspector.find.thisRow"),
        onRow: ancestor === targetElement,
      };
}
export {
  addNativeEventListener,
  blurTextOutsideFind,
  DataPropertyRowDataTweaksSurfaceRoleSeparatorValue,
  DcKeyBrowsedAttribute,
  findDirectionShortcut,
  focusedOutlineRow,
  guardedNativeEventHandler,
  handleFindClipboardEvent,
  handleFindKeyboardEvent,
  installFindKeyboardHandlers,
  isEditingInputTarget,
  isFindShortcut,
  isPlatformModifier,
  isPropertyEditorTarget,
  isTextEditableTarget,
  KeyboardFindElementCache,
  KeyboardFindObservedElements,
  KeyboardFindRangeCheckboxPattern,
  KeyboardFindXCVValues,
  McFindAttribute,
  registerFindOwner,
  shortcutMatchesLetter,
};
export function installEditorKeyboardFind(): () => void {
  return () => {
    DataPropertyRowDataTweaksSurfaceRoleSeparatorValue =
      '[data-property-row],[data-tweaks-surface],[role="separator"]';
    McFindAttribute = "data-mc-find";
    KeyboardFindXCVValues = ["x", "c", "v", "z", "y", "a", "d"];
    KeyboardFindElementCache = new WeakMap();
    KeyboardFindObservedElements = new WeakSet();
    typeof window !== "undefined" && installFindKeyboardHandlers(window);
    KeyboardFindRangeCheckboxPattern =
      /^(range|checkbox|radio|button|submit|reset|color|file|image)$/;
    DcKeyBrowsedAttribute = "data-dc-key-browsed";
  };
}

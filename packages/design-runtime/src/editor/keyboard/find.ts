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
function isPropertyEditorTarget(input?: Dynamic): Dynamic {
  let value: Dynamic = input;
  return (
    value != null &&
    typeof value.closest == "function" &&
    value.closest(DataPropertyRowDataTweaksSurfaceRoleSeparatorValue) != null
  );
}
function shortcutMatchesLetter(input?: Dynamic, options?: Dynamic): Dynamic {
  return input.key.toLowerCase() === options
    ? true
    : input.code === "Key" + options.toUpperCase() &&
        /^[\p{L}\p{M}]$/u.test(input.key) &&
        !/\p{Script=Latin}/u.test(input.key);
}
function registerFindOwner(input?: Dynamic, options?: Dynamic): Dynamic {
  KeyboardFindElementCache.set(input, options);
  return (): Dynamic => {
    KeyboardFindElementCache.delete(input);
  };
}
function handleFindKeyboardEvent(event?: Dynamic): Dynamic {
  let target: Dynamic = event.target,
    value: Dynamic =
      typeof target?.closest == "function"
        ? target.closest("[" + McFindAttribute + "]")
        : null;
  if (value === null || target === null || event.key === "F6") return;
  let flag: Dynamic = false;
  try {
    flag =
      event.type === "keydown" &&
      KeyboardFindElementCache.get(value)?.(event) === true;
  } catch {
    flag = false;
  }
  if (
    flag === false &&
    (target.tagName === "INPUT" ||
      (shortcutMatchesLetter(event, "s") &&
        isPlatformModifier(event, isApplePlatform())))
  )
    return;
  event.stopImmediatePropagation();
  let value2: Dynamic =
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !/^F\d+$/.test(event.key) &&
      event.key !== "Tab" &&
      event.key !== "Enter" &&
      event.key !== " ",
    value3: Dynamic =
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      KeyboardFindXCVValues.some(
        (input?: Dynamic): Dynamic => shortcutMatchesLetter(event, input),
      );
  !flag &&
    event.type === "keydown" &&
    (value2 || value3) &&
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
function installFindKeyboardHandlers(input?: Dynamic): Dynamic {
  if (!KeyboardFindObservedElements.has(input)) {
    KeyboardFindObservedElements.add(input);
    for (let value of ["keydown", "keyup", "keypress"] as Dynamic)
      input.addEventListener(value, handleFindKeyboardEvent, true);
    for (let value of ["cut", "copy", "paste"] as Dynamic)
      input.addEventListener(value, handleFindClipboardEvent, true);
  }
}
function isPlatformModifier(input?: Dynamic, options?: Dynamic): Dynamic {
  return (
    !input.altKey &&
    (options
      ? input.metaKey && !input.ctrlKey
      : input.ctrlKey && !input.metaKey)
  );
}
function isFindShortcut(
  input?: Dynamic,
  options: Dynamic = isApplePlatform(),
): Dynamic {
  return (
    isPlatformModifier(input, options) &&
    !input.shiftKey &&
    shortcutMatchesLetter(input, "f")
  );
}
function addNativeEventListener(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
): Dynamic {
  let value2: Dynamic = context;
  try {
    EventTarget.prototype.addEventListener.call(
      input,
      options,
      value2,
      value,
    );
    return (): Dynamic =>
      EventTarget.prototype.removeEventListener.call(
        input,
        options,
        value2,
        value,
      );
  } catch {
    input.addEventListener(options, value2, value);
    return (): Dynamic => input.removeEventListener(options, value2, value);
  }
}
function guardedNativeEventHandler(
  input?: Dynamic,
  options: Dynamic = (input2?: Dynamic): Dynamic => input2.isTrusted,
  context: Dynamic = (): Dynamic => true,
): Dynamic {
  return (event?: Dynamic): Dynamic => {
    try {
      let value: Dynamic = !context();
      if (
        (event.eventPhase === 1) !== value ||
        !options(event) ||
        event.defaultPrevented
      )
        return;
      if (event.isComposing) {
        (isFindShortcut(event) ||
          findDirectionShortcut(event) !== undefined) &&
          event.preventDefault();
        return;
      }
      let callback: Dynamic = (): Dynamic => {
        event.preventDefault();
        value && event.stopImmediatePropagation();
      };
      if (isFindShortcut(event)) {
        input.findKey() && callback();
        return;
      }
      let value2: Dynamic = findDirectionShortcut(event);
      if (
        value2 === undefined ||
        (event.key !== "F3" && input.ownsStepChord?.(event) === true)
      )
        return;
      if (!input.isOpen()) {
        input.findKey() && callback();
        return;
      }
      callback();
      input.step(value2, event);
    } catch {
      return;
    }
  };
}
function findDirectionShortcut(
  input?: Dynamic,
  options: Dynamic = isApplePlatform(),
): Dynamic {
  if (
    input.key === "F3"
      ? !input.altKey && !input.metaKey && !input.ctrlKey
      : isPlatformModifier(input, options) &&
        shortcutMatchesLetter(input, "g")
  )
    return input.shiftKey ? -1 : 1;
}
function isTextEditableTarget(input?: Dynamic): Dynamic {
  let tagName: Dynamic = input.tagName;
  return (
    tagName === "TEXTAREA" ||
    input.isContentEditable === true ||
    (tagName === "INPUT" &&
      !KeyboardFindRangeCheckboxPattern.test(input.type))
  );
}
function blurTextOutsideFind(
  input: Dynamic = document,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let activeElement: Dynamic = input.activeElement;
  activeElement === null ||
    activeElement.closest("[" + McFindAttribute + "]") !== null ||
    (!isTextEditableTarget(activeElement) &&
      (context === undefined || activeElement.closest(context) === null)) ||
    ((options === undefined || activeElement.closest(options) === null) &&
      activeElement.blur());
}
function isEditingInputTarget(input?: Dynamic): Dynamic {
  let value: Dynamic = input;
  return value == null || typeof value.closest != "function"
    ? false
    : /^(INPUT|TEXTAREA|SELECT)$/.test(value.tagName) ||
        value.isContentEditable === true ||
        value.closest(
          DataPropertyRowDataTweaksSurfaceRoleSeparatorValue +
            ',[data-mega-chrome="tweaks"],[data-note-typing-strip],[data-link-mode],[' +
            McFindAttribute +
            "]," +
            blockingOverlaySelector,
        ) != null;
}
function focusedOutlineRow(input?: Dynamic): Dynamic {
  let value: Dynamic = input;
  if (value == null || typeof value.closest != "function") return null;
  let ancestor: Dynamic = value.closest('[role="treeitem"]');
  return ancestor == null ||
    ancestor.getAttribute("aria-selected") === "true" ||
    ancestor.closest("[" + DcKeyBrowsedAttribute + "]") == null
    ? null
    : {
        name: ancestor.getAttribute("aria-label") || uiMessage("inspector.find.thisRow"),
        onRow: ancestor === value,
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

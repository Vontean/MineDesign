import type * as React from "react";
import type {
  DialogStyleProperty,
  DialogStyleOverride,
  InlineStyleProperty,
  KeyboardInset,
  BrowserWindow,
} from "../contracts/overlays";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { initializeElementAccess, initializeIsomorphicLayoutEffect, initializeOverlayActions, initializeVisualKeyboard, isEditableElement, useIsomorphicLayoutEffect, useVisualKeyboard } from "./foundation";
import { initializeClassNames, initializeCloseOnActivityHide, initializeLayers, initializeMergedRefs, initializePortalRoot, initializeSurfaces, initializeTranslations } from "./interactions";
import { initializeCdsRoot, initializeOverlayFocus, initializeOverlaySelector } from "./overlays";

var reactForUiTooltips: typeof React;
var DIALOG_KEYBOARD_MARGIN_PX: number;
var DIALOG_KEYBOARD_MARGIN_CSS: string;
var MINIMUM_DIALOG_KEYBOARD_VISIBLE_HEIGHT: number;
var dialogOverrideStyleProperties: DialogStyleProperty[];
var dialogKeyboardExcludedStyleProperties: string[];
var dialogKeyboardPositionProperties: string[];
var reactDialog: typeof React;
var jsxForUiTooltips: typeof import("react/jsx-runtime");
function readInlineStyleProperty(
  style: CSSStyleDeclaration,
  property: string,
): InlineStyleProperty {
  return {
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  };
}
function isOwnedImportantStyle(
  style: CSSStyleDeclaration,
  property: string,
  writtenValue: string | undefined,
): boolean {
  return (
    writtenValue !== undefined &&
    style.getPropertyPriority(property) === "important" &&
    style.getPropertyValue(property) === writtenValue
  );
}
function restoreDialogStyleOverride(override: DialogStyleOverride): void {
  let style = override.node.style;
  for (let value of dialogOverrideStyleProperties) {
    if (isOwnedImportantStyle(style, value, override.written[value])) {
      let { value: originalValue, priority: originalPriority } = override.baseline[value];
      style.setProperty(value, originalValue, originalPriority);
    }
  }
}
function useDialogVisualKeyboard(
  open: boolean | undefined,
): React.Dispatch<React.SetStateAction<HTMLElement | null>> {
  let [value, setDialogElement] = reactForUiTooltips.useState<HTMLElement | null>(null),
    [keyboardInset, setKeyboardInset] = reactForUiTooltips.useState<KeyboardInset | null>(
      null,
    ),
    callback = reactForUiTooltips.useCallback(
      (listener: () => void): (() => void) => {
        if (!open || value === null) {
          return () => {
            return;
          };
        }
        value.addEventListener("focusin", listener);
        value.addEventListener("focusout", listener);
        return () => {
          value.removeEventListener("focusin", listener);
          value.removeEventListener("focusout", listener);
        };
      },
      [open, value],
    ),
    hasFocusedEditor = reactForUiTooltips.useCallback(() => {
      if (!open || value === null) {
        return false;
      }
      let activeElement = value.ownerDocument.activeElement;
      return (
        value.contains(activeElement) &&
        isEditableElement(activeElement)
      );
    }, [open, value]),
    hasEditableFocus = reactForUiTooltips.useSyncExternalStore(
      callback,
      hasFocusedEditor,
      () => false,
    );
  useVisualKeyboard(
    open && (hasEditableFocus || keyboardInset !== null),
    setKeyboardInset,
  );
  let memo = reactForUiTooltips.useMemo(
      () => getKeyboardAdjustedDialogStyle(keyboardInset),
      [keyboardInset],
    ),
    ref = reactForUiTooltips.useRef<DialogStyleOverride | null>(null);
  useIsomorphicLayoutEffect(() => {
    let current = ref.current;
    if (current !== null && (current.node !== value || memo === undefined)) {
      restoreDialogStyleOverride(current);
      ref.current = null;
    }
    if (value === null || memo === undefined) {
      return;
    }
    let style = value.style,
      state = {
        top: memo.top,
        "max-height": memo.maxHeight,
        "min-height": "0px",
      },
      activeOverride = ref.current;
    if (activeOverride === null) {
      if (
        dialogKeyboardPositionProperties.some(
          (property: string): boolean => style.getPropertyValue(property) !== "",
        )
      ) {
        return;
      }
      activeOverride = {
        node: value,
        baseline: {
          top: readInlineStyleProperty(style, "top"),
          "max-height": readInlineStyleProperty(style, "max-height"),
          "min-height": readInlineStyleProperty(style, "min-height"),
        },
        intended: {},
        written: {},
        cap: "",
      };
      ref.current = activeOverride;
    } else {
      let hasConflictingStyle = dialogKeyboardExcludedStyleProperties.some(
        (property: string): boolean => style.getPropertyValue(property) !== "",
      );
      for (let property of dialogOverrideStyleProperties) {
        if (!isOwnedImportantStyle(style, property, activeOverride.written[property])) {
          let currentStyle = readInlineStyleProperty(style, property);
          activeOverride.baseline[property] = currentStyle;
          if (property === "top" && currentStyle.value !== "") {
            hasConflictingStyle = true;
          }
        }
      }
      if (hasConflictingStyle) {
        restoreDialogStyleOverride(activeOverride);
        ref.current = null;
        return;
      }
    }
    for (let property of dialogOverrideStyleProperties) {
      if (
        activeOverride.intended[property] !== state[property] ||
        !isOwnedImportantStyle(style, property, activeOverride.written[property])
      ) {
        style.setProperty(property, state[property], "important");
        activeOverride.intended[property] = state[property];
        activeOverride.written[property] = style.getPropertyValue(property);
      }
    }
    if (activeOverride.cap !== memo.maxHeight) {
      activeOverride.cap = memo.maxHeight;
      let activeElement = value.ownerDocument.activeElement,
        defaultView = value.ownerDocument.defaultView as BrowserWindow | null;
      if (
        defaultView !== null &&
        activeElement instanceof defaultView.HTMLElement &&
        activeElement !== value &&
        value.contains(activeElement)
      ) {
        scrollDialogInputIntoView(value, activeElement);
      }
    }
  });
  useIsomorphicLayoutEffect(
    () => () => {
      if (ref.current !== null) {
        restoreDialogStyleOverride(ref.current);
        ref.current = null;
      }
    },
    [],
  );
  return setDialogElement;
}
function getKeyboardAdjustedDialogStyle(keyboardInset: KeyboardInset | null):
  | {
      top: string;
      maxHeight: string;
    }
  | undefined {
  if (
    keyboardInset === null ||
    keyboardInset.visible < MINIMUM_DIALOG_KEYBOARD_VISIBLE_HEIGHT
  ) {
    return;
  }
  return {
    top: `calc(${keyboardInset.offset + (keyboardInset.visible + DIALOG_KEYBOARD_MARGIN_PX) / 2}px - ${DIALOG_KEYBOARD_MARGIN_CSS} / 2)`,
    maxHeight: `calc(${keyboardInset.visible - DIALOG_KEYBOARD_MARGIN_PX}px - ${DIALOG_KEYBOARD_MARGIN_CSS})`,
  };
}
function scrollDialogInputIntoView(
  element: HTMLElement,
  inputElement: HTMLElement,
): void {
  let defaultView = element.ownerDocument.defaultView;
  if (defaultView === null) {
    return;
  }
  for (
    let parentElement = inputElement.parentElement;
    parentElement !== null;
    parentElement =
      parentElement === element ? null : parentElement.parentElement
  ) {
    if (parentElement.scrollHeight <= parentElement.clientHeight) {
      continue;
    }
    let { overflowY: style } = defaultView.getComputedStyle(parentElement);
    if (style !== "auto" && style !== "scroll") {
      continue;
    }
    let bounds = parentElement.getBoundingClientRect(),
      inputBounds = inputElement.getBoundingClientRect();
    if (inputBounds.bottom > bounds.bottom) {
      parentElement.scrollTop +=
        inputBounds.bottom - bounds.bottom + DIALOG_KEYBOARD_MARGIN_PX;
    } else if (inputBounds.top < bounds.top) {
      parentElement.scrollTop -=
        bounds.top - inputBounds.top + DIALOG_KEYBOARD_MARGIN_PX;
    }
  }
}
export {
  DIALOG_KEYBOARD_MARGIN_CSS,
  DIALOG_KEYBOARD_MARGIN_PX,
  dialogKeyboardExcludedStyleProperties,
  dialogKeyboardPositionProperties,
  dialogOverrideStyleProperties,
  getKeyboardAdjustedDialogStyle,
  isOwnedImportantStyle,
  jsxForUiTooltips,
  MINIMUM_DIALOG_KEYBOARD_VISIBLE_HEIGHT,
  reactForUiTooltips,
  reactDialog as reactForUiTooltips2,
  readInlineStyleProperty,
  restoreDialogStyleOverride,
  scrollDialogInputIntoView,
  useDialogVisualKeyboard,
};
export function installUiTooltips(): () => void {
  return () => {
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    initializeTranslations();
    initializeCdsRoot();
    initializeElementAccess();
    initializeLayers();
    initializeOverlaySelector();
    initializeCloseOnActivityHide();
    initializeMergedRefs();
    initializePortalRoot();
    initializeSurfaces();
    initializeOverlayActions();
    initializeOverlayFocus();
    initializeIsomorphicLayoutEffect();
    initializeVisualKeyboard();
    reactForUiTooltips = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    DIALOG_KEYBOARD_MARGIN_PX = 8;
    DIALOG_KEYBOARD_MARGIN_CSS = `max(${DIALOG_KEYBOARD_MARGIN_PX}px, env(safe-area-inset-bottom, 0px))`;
    MINIMUM_DIALOG_KEYBOARD_VISIBLE_HEIGHT = 240;
    dialogOverrideStyleProperties = ["top", "max-height", "min-height"];
    dialogKeyboardExcludedStyleProperties = [
      "bottom",
      "inset",
      "translate",
      "transform",
    ];
    dialogKeyboardPositionProperties = [
      "top",
      ...dialogKeyboardExcludedStyleProperties,
    ];
    reactDialog = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiTooltips = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}

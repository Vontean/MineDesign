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
var reactForUiTooltips2: typeof React;
var jsxForUiTooltips: typeof import("react/jsx-runtime");
function readInlineStyleProperty(
  input: CSSStyleDeclaration,
  options: string,
): InlineStyleProperty {
  return {
    value: input.getPropertyValue(options),
    priority: input.getPropertyPriority(options),
  };
}
function isOwnedImportantStyle(
  input: CSSStyleDeclaration,
  options: string,
  context: string | undefined,
): boolean {
  return (
    context !== undefined &&
    input.getPropertyPriority(options) === "important" &&
    input.getPropertyValue(options) === context
  );
}
function restoreDialogStyleOverride(input: DialogStyleOverride): void {
  let style = input.node.style;
  for (let value of dialogOverrideStyleProperties) {
    if (isOwnedImportantStyle(style, value, input.written[value])) {
      let { value: value2, priority: value3 } = input.baseline[value];
      style.setProperty(value, value2, value3);
    }
  }
}
function useDialogVisualKeyboard(
  input: boolean | undefined,
): React.Dispatch<React.SetStateAction<HTMLElement | null>> {
  let [value, value2] = reactForUiTooltips.useState<HTMLElement | null>(null),
    [value3, value4] = reactForUiTooltips.useState<KeyboardInset | null>(
      null,
    ),
    callback = reactForUiTooltips.useCallback(
      (input2: () => void): (() => void) => {
        if (!input || value === null) {
          return () => {
            return;
          };
        }
        value.addEventListener("focusin", input2);
        value.addEventListener("focusout", input2);
        return () => {
          value.removeEventListener("focusin", input2);
          value.removeEventListener("focusout", input2);
        };
      },
      [input, value],
    ),
    callback2 = reactForUiTooltips.useCallback(() => {
      if (!input || value === null) {
        return false;
      }
      let activeElement = value.ownerDocument.activeElement;
      return (
        value.contains(activeElement) &&
        (0, isEditableElement)(activeElement)
      );
    }, [input, value]),
    value5 = reactForUiTooltips.useSyncExternalStore(
      callback,
      callback2,
      () => false,
    );
  (0, useVisualKeyboard)(
    input && (value5 || value3 !== null),
    value4,
  );
  let memo = reactForUiTooltips.useMemo(
      () => getKeyboardAdjustedDialogStyle(value3),
      [value3],
    ),
    ref = reactForUiTooltips.useRef<DialogStyleOverride | null>(null);
  (0, useIsomorphicLayoutEffect)(() => {
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
      current2 = ref.current;
    if (current2 === null) {
      if (
        dialogKeyboardPositionProperties.some(
          (input2: string): boolean => style.getPropertyValue(input2) !== "",
        )
      ) {
        return;
      }
      current2 = {
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
      ref.current = current2;
    } else {
      let value6 = dialogKeyboardExcludedStyleProperties.some(
        (input2: string): boolean => style.getPropertyValue(input2) !== "",
      );
      for (let value7 of dialogOverrideStyleProperties) {
        if (!isOwnedImportantStyle(style, value7, current2.written[value7])) {
          let value8 = readInlineStyleProperty(style, value7);
          current2.baseline[value7] = value8;
          if (value7 === "top" && value8.value !== "") {
            value6 = true;
          }
        }
      }
      if (value6) {
        restoreDialogStyleOverride(current2);
        ref.current = null;
        return;
      }
    }
    for (let value6 of dialogOverrideStyleProperties) {
      if (
        current2.intended[value6] !== state[value6] ||
        !isOwnedImportantStyle(style, value6, current2.written[value6])
      ) {
        style.setProperty(value6, state[value6], "important");
        current2.intended[value6] = state[value6];
        current2.written[value6] = style.getPropertyValue(value6);
      }
    }
    if (current2.cap !== memo.maxHeight) {
      current2.cap = memo.maxHeight;
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
  (0, useIsomorphicLayoutEffect)(
    () => () => {
      if (ref.current !== null) {
        restoreDialogStyleOverride(ref.current);
        ref.current = null;
      }
    },
    [],
  );
  return value2;
}
function getKeyboardAdjustedDialogStyle(input: KeyboardInset | null):
  | {
      top: string;
      maxHeight: string;
    }
  | undefined {
  if (
    input === null ||
    input.visible < MINIMUM_DIALOG_KEYBOARD_VISIBLE_HEIGHT
  ) {
    return;
  }
  return {
    top: `calc(${input.offset + (input.visible + DIALOG_KEYBOARD_MARGIN_PX) / 2}px - ${DIALOG_KEYBOARD_MARGIN_CSS} / 2)`,
    maxHeight: `calc(${input.visible - DIALOG_KEYBOARD_MARGIN_PX}px - ${DIALOG_KEYBOARD_MARGIN_CSS})`,
  };
}
function scrollDialogInputIntoView(
  element: HTMLElement,
  options: HTMLElement,
): void {
  let defaultView = element.ownerDocument.defaultView;
  if (defaultView === null) {
    return;
  }
  for (
    let parentElement = options.parentElement;
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
      bounds2 = options.getBoundingClientRect();
    if (bounds2.bottom > bounds.bottom) {
      parentElement.scrollTop +=
        bounds2.bottom - bounds.bottom + DIALOG_KEYBOARD_MARGIN_PX;
    } else if (bounds2.top < bounds.top) {
      parentElement.scrollTop -=
        bounds.top - bounds2.top + DIALOG_KEYBOARD_MARGIN_PX;
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
  reactForUiTooltips2,
  readInlineStyleProperty,
  restoreDialogStyleOverride,
  scrollDialogInputIntoView,
  useDialogVisualKeyboard,
};
export function installUiTooltips(): () => void {
  return () => {
    (0, initializeIsomorphicLayoutEffect)();
    (0, initializeClassNames)();
    (0, initializeTranslations)();
    (0, initializeCdsRoot)();
    (0, initializeElementAccess)();
    (0, initializeLayers)();
    (0, initializeOverlaySelector)();
    (0, initializeCloseOnActivityHide)();
    (0, initializeMergedRefs)();
    (0, initializePortalRoot)();
    (0, initializeSurfaces)();
    (0, initializeOverlayActions)();
    (0, initializeOverlayFocus)();
    (0, initializeIsomorphicLayoutEffect)();
    (0, initializeVisualKeyboard)();
    reactForUiTooltips = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
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
    reactForUiTooltips2 = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxForUiTooltips = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
  };
}

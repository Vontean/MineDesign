/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react, load_react_dom, load_react_jsx_runtime } from "../../dependencies";
import { reactChromeOverlayState } from "./overlay-state";
import { toModuleNamespace } from "../../module-helpers";

var editableElementSelector: Dynamic;
var preventInputEnterSubmit: Dynamic;
var ChromeFocusContext: Dynamic;
var ChromeFocusConstant: Dynamic;
var reactChromeFocus: Dynamic;
var reactDomChromeFocus: Dynamic;
var jsxChromeFocus: Dynamic;
function choosePopoverPlacement(
  element?: Dynamic,
  options?: Dynamic,
  context: Dynamic = "bottom",
  value: Dynamic = options,
): Dynamic {
  if (!element)
    return {
      side: context,
      maxHeight: undefined,
    };
  let bounds: Dynamic = element.getBoundingClientRect(),
    value2: Dynamic =
      (element.ownerDocument.defaultView?.innerHeight ?? bounds.bottom) -
      bounds.bottom -
      16,
    value3: Dynamic = bounds.top - 16,
    [value4, value5]: Dynamic =
      context === "top" ? [value3, value2] : [value2, value3],
    value6: Dynamic =
      value4 >= Math.min(options, value) || value4 >= value5
        ? context
        : context === "top"
          ? "bottom"
          : "top",
    value7: Dynamic = value6 === "bottom" ? value2 : value3;
  return {
    side: value6,
    maxHeight: value7 < options ? Math.max(value7, 120) : undefined,
  };
}
function blurPopoverTextInput(): Dynamic {
  let activeElement: Dynamic = (document as Dynamic).activeElement;
  if (!activeElement?.closest("[data-mc-popover], [data-mc-menu]")) return;
  (activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable) &&
    activeElement.blur();
}
export {
  blurPopoverTextInput,
  choosePopoverPlacement,
  ChromeFocusConstant,
  ChromeFocusContext,
  editableElementSelector,
  jsxChromeFocus,
  preventInputEnterSubmit,
  reactChromeFocus,
  reactDomChromeFocus,
};
export function installEditorChromeFocus(): () => void {
  return () => {
    editableElementSelector =
      'input, select, textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], [role="textbox"]';
    preventInputEnterSubmit = (event?: Dynamic): Dynamic => {
      event.key === "Enter" &&
        event.target instanceof HTMLInputElement &&
        event.preventDefault();
    };
    ChromeFocusContext = (0, reactChromeOverlayState.createContext)(
      undefined,
    );
    ChromeFocusConstant = 320;
    reactChromeFocus = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactDomChromeFocus = (0, toModuleNamespace)(
      (0, load_react_dom)(),
      1,
    );
    jsxChromeFocus = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
  };
}

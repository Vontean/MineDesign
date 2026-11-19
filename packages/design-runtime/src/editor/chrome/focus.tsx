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
  anchorElement?: Dynamic,
  desiredHeight?: Dynamic,
  preferredSide: Dynamic = "bottom",
  minHeight: Dynamic = desiredHeight,
): Dynamic {
  if (!anchorElement)
    return {
      side: preferredSide,
      maxHeight: undefined,
    };
  let bounds: Dynamic = anchorElement.getBoundingClientRect(),
    spaceBelow: Dynamic =
      (anchorElement.ownerDocument.defaultView?.innerHeight ?? bounds.bottom) -
      bounds.bottom -
      16,
    spaceAbove: Dynamic = bounds.top - 16,
    [preferredSpace, otherSpace]: Dynamic =
      preferredSide === "top" ? [spaceAbove, spaceBelow] : [spaceBelow, spaceAbove],
    side: Dynamic =
      preferredSpace >= Math.min(desiredHeight, minHeight) || preferredSpace >= otherSpace
        ? preferredSide
        : preferredSide === "top"
          ? "bottom"
          : "top",
    availableSpace: Dynamic = side === "bottom" ? spaceBelow : spaceAbove;
  return {
    side: side,
    maxHeight: availableSpace < desiredHeight ? Math.max(availableSpace, 120) : undefined,
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
    reactChromeFocus = toModuleNamespace(
      load_react(),
      1,
    );
    reactDomChromeFocus = toModuleNamespace(
      load_react_dom(),
      1,
    );
    jsxChromeFocus = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

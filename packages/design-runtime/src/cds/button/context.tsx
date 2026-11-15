import type { ButtonGroupState } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactButtonContext: typeof React;
var ButtonGroupContext: React.Context<ButtonGroupState>;
var CdsCompactableAttribute: string;
var initializeButtonContext: () => void;
var reactButtonContext_2: typeof React;
var initializeButtonContext_2: () => void;
var ButtonContextClassNames: string;
var ButtonContextClassNames_2: string;
var ButtonContextClassNames_3: string;
var ButtonContextClassNames_4: string;
var CdsBtnSquishValue: string;
var ButtonContextClassNames_5: string;
var ButtonContextClassNames_6: string;
var ButtonContextClassNames_7: string;
var ButtonContextClassNames_8: string;
var initializeButtonContext_3: () => void;
function useButtonGroup(): ButtonGroupState {
  return (0, reactButtonContext.useContext)(ButtonGroupContext);
}
function useButtonAnimation(
  input: React.RefObject<HTMLElement | null>,
  options: "Button" | "SegmentedControl",
): void {
  (0, reactButtonContext_2.useEffect)(() => {}, [input, options]);
}
function buttonBackgroundClassName(input: {
  joined?: boolean;
  solid?: boolean;
}): string {
  return `${ButtonContextClassNames} ${!input.joined && input.solid ? ButtonContextClassNames_8 : "inset-0"} ${input.joined ? "" : CdsBtnSquishValue}`;
}
export {
  buttonBackgroundClassName,
  ButtonContextClassNames,
  ButtonContextClassNames_2,
  ButtonContextClassNames_3,
  ButtonContextClassNames_4,
  ButtonContextClassNames_5,
  ButtonContextClassNames_6,
  ButtonContextClassNames_7,
  ButtonContextClassNames_8,
  ButtonGroupContext,
  CdsBtnSquishValue,
  CdsCompactableAttribute,
  initializeButtonContext,
  initializeButtonContext_2,
  initializeButtonContext_3,
  reactButtonContext,
  reactButtonContext_2,
  useButtonAnimation,
  useButtonGroup,
};
export function installCdsButtonContext(): () => void {
  return () => {
    initializeButtonContext = (0, initializeOnce)(() => {
      "use client";

      reactButtonContext = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      ButtonGroupContext = (0,
      reactButtonContext.createContext)<ButtonGroupState>({
        compact: false,
      });
      CdsCompactableAttribute = "data-cds-compactable";
    });
    initializeButtonContext_2 = (0, initializeOnce)(() => {
      reactButtonContext_2 = (0, toModuleNamespace)(
        (0, load_react)(),
      );
    });
    initializeButtonContext_3 = (0, initializeOnce)(() => {
      ButtonContextClassNames = "absolute -z-[1] rounded-[inherit]";
      ButtonContextClassNames_2 =
        "focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus";
      ButtonContextClassNames_3 =
        "focus-visible:shadow-focus-danger [&[data-initial-focus]:focus]:shadow-focus-danger";
      ButtonContextClassNames_4 =
        "absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out group-focus-visible/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] group-[[data-initial-focus]:focus]/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]";
      CdsBtnSquishValue = "cds-btn-squish";
      ButtonContextClassNames_5 =
        "shadow-field group-aria-pressed/btn:shadow-field-pressed group-focus-visible/btn:group-aria-pressed/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]";
      ButtonContextClassNames_6 =
        "group-aria-pressed/btn:bg-accent group-hover/btn:group-aria-pressed/btn:bg-accent";
      ButtonContextClassNames_7 =
        "bg-fill-secondary group-hover/btn:bg-fill-secondary-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-secondary-hover";
      ButtonContextClassNames_8 = "inset-[0.5px]";
    });
  };
}

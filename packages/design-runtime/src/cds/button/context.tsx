import type { ButtonGroupState } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactButtonContext: typeof React;
var ButtonGroupContext: React.Context<ButtonGroupState>;
var CdsCompactableAttribute: string;
var initializeButtonContext: () => void;
var reactForUseButtonAnimation: typeof React;
var initializeButtonAnimationReact: () => void;
var ButtonContextClassNames: string;
var focusRingClassName: string;
var dangerFocusRingClassName: string;
var focusInsetOverlayClassName: string;
var CdsBtnSquishValue: string;
var pressedFieldShadowClassName: string;
var pressedAccentBackgroundClassName: string;
var secondaryFillClassName: string;
var hairlineInsetClassName: string;
var initializeButtonFocusClassNames: () => void;
function useButtonGroup(): ButtonGroupState {
  return (0, reactButtonContext.useContext)(ButtonGroupContext);
}
function useButtonAnimation(
  ref: React.RefObject<HTMLElement | null>,
  variant: "Button" | "SegmentedControl",
): void {
  (0, reactForUseButtonAnimation.useEffect)(() => {}, [ref, variant]);
}
function buttonBackgroundClassName(state: {
  joined?: boolean;
  solid?: boolean;
}): string {
  return `${ButtonContextClassNames} ${!state.joined && state.solid ? hairlineInsetClassName : "inset-0"} ${state.joined ? "" : CdsBtnSquishValue}`;
}
export {
  buttonBackgroundClassName,
  ButtonContextClassNames,
  focusRingClassName,
  dangerFocusRingClassName,
  focusInsetOverlayClassName,
  pressedFieldShadowClassName,
  pressedAccentBackgroundClassName,
  secondaryFillClassName,
  hairlineInsetClassName,
  ButtonGroupContext,
  CdsBtnSquishValue,
  CdsCompactableAttribute,
  initializeButtonContext,
  initializeButtonAnimationReact,
  initializeButtonFocusClassNames,
  reactButtonContext,
  reactForUseButtonAnimation,
  useButtonAnimation,
  useButtonGroup,
};
export function installCdsButtonContext(): () => void {
  return () => {
    initializeButtonContext = initializeOnce(() => {
      "use client";

      reactButtonContext = toModuleNamespace(
        load_react(),
      );
      ButtonGroupContext = (0,
      reactButtonContext.createContext)<ButtonGroupState>({
        compact: false,
      });
      CdsCompactableAttribute = "data-cds-compactable";
    });
    initializeButtonAnimationReact = initializeOnce(() => {
      reactForUseButtonAnimation = toModuleNamespace(
        load_react(),
      );
    });
    initializeButtonFocusClassNames = initializeOnce(() => {
      ButtonContextClassNames = "absolute -z-[1] rounded-[inherit]";
      focusRingClassName =
        "focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus";
      dangerFocusRingClassName =
        "focus-visible:shadow-focus-danger [&[data-initial-focus]:focus]:shadow-focus-danger";
      focusInsetOverlayClassName =
        "absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out group-focus-visible/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] group-[[data-initial-focus]:focus]/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]";
      CdsBtnSquishValue = "cds-btn-squish";
      pressedFieldShadowClassName =
        "shadow-field group-aria-pressed/btn:shadow-field-pressed group-focus-visible/btn:group-aria-pressed/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)]";
      pressedAccentBackgroundClassName =
        "group-aria-pressed/btn:bg-accent group-hover/btn:group-aria-pressed/btn:bg-accent";
      secondaryFillClassName =
        "bg-fill-secondary group-hover/btn:bg-fill-secondary-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-secondary-hover";
      hairlineInsetClassName = "inset-[0.5px]";
    });
  };
}

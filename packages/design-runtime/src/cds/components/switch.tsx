import type { ForwardComponent, SwitchProps } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeDomSelectionPrevention, withSelectionPrevention } from "../dom/selection-prevention";
import { preventRepeatedEnter } from "../switch/context";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot } from "../theme/root";
import { DisabledReasonTooltip, initializeTooltipTooltip } from "../tooltip/tooltip";
import { initializeNpm__base_ui_react_CZe, load_react, load_react_jsx_runtime, npm_Switch_sU } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsSwitch: typeof React;
var jsxComponentsSwitch: typeof import("react/jsx-runtime");
var switchRootClasses: string;
var ComponentsSwitchClassNames: string;
var ComponentsSwitchLabel: string;
var thumbSizeClasses: string;
var Switch: ForwardComponent<HTMLInputElement, SwitchProps>;
var initializeComponentsSwitch: () => void;
export {
  ComponentsSwitchClassNames,
  ComponentsSwitchLabel,
  initializeComponentsSwitch,
  jsxComponentsSwitch,
  reactComponentsSwitch,
  Switch,
  switchRootClasses,
};
export function installCdsComponentsSwitch(): () => void {
  return () => {
    initializeComponentsSwitch = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeCdsRoot();
      initializeDomSelectionPrevention();
      initializeTooltipTooltip();
      reactComponentsSwitch = toModuleNamespace(
        load_react(),
      );
      jsxComponentsSwitch = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_CZe();
      switchRootClasses =
        "cds-reset relative inline-flex shrink-0 rounded-full border-0 outline-none focus-visible:outline-hidden bg-[var(--cds-switch-track)] hover:bg-[var(--cds-switch-track-hover)] data-[checked]:bg-fill-accent data-[checked]:hover:bg-fill-accent-hover data-[disabled]:opacity-disabled data-[disabled]:hover:bg-[var(--cds-switch-track)] data-[checked]:data-[disabled]:hover:bg-fill-accent focus-visible:shadow-focus";
      ComponentsSwitchClassNames =
        "block rounded-full bg-[var(--cds-switch-knob)] shadow-sm transition-transform duration-snap ease-overshoot motion-reduce:transition-none";
      ComponentsSwitchLabel =
        "h-[var(--cds-switch-h)] w-[calc(var(--cds-switch-h,1.25rem)*1.8)] p-[2px]";
      thumbSizeClasses =
        "size-[calc(var(--cds-switch-h,1.25rem)-4px)] data-[checked]:translate-x-[calc(var(--cds-switch-h,1.25rem)*0.8)]";
      Switch = (0, reactComponentsSwitch.forwardRef)<
        HTMLInputElement,
        SwitchProps
      >(
        (
          {
            className: className,
            size: size,
            disabledReason: disabledReason,
            disabledReasonSide: disabledReasonSide,
            ...props
          }: SwitchProps,
          forwardedRef: React.ForwardedRef<HTMLInputElement>,
        ): React.ReactElement => {
          let switchElement = (
            <npm_Switch_sU.Root
              ref={forwardedRef}
              data-cds={"Switch"}
              {...props}
              {...getSizeAttribute(size)}
              onMouseDown={withSelectionPrevention(undefined)}
              onKeyDown={preventRepeatedEnter}
              className={cn(
                switchRootClasses,
                ComponentsSwitchLabel,
                className,
              )}
            >
              <npm_Switch_sU.Thumb
                className={`${ComponentsSwitchClassNames} ${thumbSizeClasses}`}
              />
            </npm_Switch_sU.Root>
          );
          return disabledReason === undefined ? (
            switchElement
          ) : (
            <DisabledReasonTooltip
              side={disabledReasonSide}
              reason={props.disabled ? disabledReason : undefined}
            >
              {switchElement}
            </DisabledReasonTooltip>
          );
        },
      );
      Switch.displayName = "Switch";
    });
  };
}

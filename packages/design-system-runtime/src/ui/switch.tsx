/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseSwitch, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip, initializeTooltip } from "./avatars";
import { withRepeatedClickSelectionPrevention } from "./disclosure";
import { cn, initializeClassNames } from "./interactions";
import { getControlSizeAttributes, initializeCdsRoot } from "./overlays";

var reactSwitch: typeof React;
var jsxSwitch: typeof import("react/jsx-runtime");
var SWITCH_TRACK_CLASS: string;
var SWITCH_KNOB_CLASS: string;
var SWITCH_TRACK_SIZE_CLASS: string;
var SWITCH_KNOB_SIZE_CLASS: string;
var Switch: C.ForwardComponent<HTMLElement, C.SwitchProps>;
function preventRepeatedSwitchEnter(
  event: import("@base-ui/react/types").BaseUIEvent<
    React.KeyboardEvent<HTMLSpanElement>
  >,
) {
  if (event.repeat && event.key === "Enter") {
    event.preventDefault();
  }
}
export {
  jsxSwitch,
  preventRepeatedSwitchEnter,
  reactSwitch,
  Switch,
  SWITCH_KNOB_CLASS,
  SWITCH_KNOB_SIZE_CLASS,
  SWITCH_TRACK_CLASS,
  SWITCH_TRACK_SIZE_CLASS,
};
export function installUiSwitch(): () => void {
  return () => {
    initializeClassNames();
    initializeCdsRoot();
    initializeTooltip();
    reactSwitch = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxSwitch = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    SWITCH_TRACK_CLASS =
      "cds-reset relative inline-flex shrink-0 rounded-full border-0 outline-none focus-visible:outline-hidden bg-[var(--cds-switch-track)] hover:bg-[var(--cds-switch-track-hover)] data-[checked]:bg-fill-accent data-[checked]:hover:bg-fill-accent-hover data-[disabled]:opacity-disabled data-[disabled]:hover:bg-[var(--cds-switch-track)] data-[checked]:data-[disabled]:hover:bg-fill-accent focus-visible:shadow-focus";
    SWITCH_KNOB_CLASS =
      "block rounded-full bg-[var(--cds-switch-knob)] shadow-sm transition-transform duration-snap ease-overshoot motion-reduce:transition-none";
    SWITCH_TRACK_SIZE_CLASS =
      "h-[var(--cds-switch-h)] w-[calc(var(--cds-switch-h,1.25rem)*1.8)] p-[2px]";
    SWITCH_KNOB_SIZE_CLASS =
      "size-[calc(var(--cds-switch-h,1.25rem)-4px)] data-[checked]:translate-x-[calc(var(--cds-switch-h,1.25rem)*0.8)]";
    Switch = reactSwitch.forwardRef(
      (
        {
          className: className,
          size: size,
          disabledReason: disabledReason,
          disabledReasonSide: disabledReasonSide,
          onKeyDown: onKeyDown,
          onMouseDown: onMouseDown,
          ...props
        }: C.SwitchProps,
        options: React.ForwardedRef<HTMLElement>,
      ) => {
        let value = (
          <baseSwitch.Root
            ref={options}
            data-cds={"Switch"}
            {...props}
            {...getControlSizeAttributes(size)}
            onMouseDown={withRepeatedClickSelectionPrevention(
              onMouseDown,
            )}
            onKeyDown={(
              input: import("@base-ui/react/types").BaseUIEvent<
                React.KeyboardEvent<HTMLSpanElement>
              >,
            ) => {
              preventRepeatedSwitchEnter(input);
              onKeyDown?.(input);
            }}
            className={cn(
              SWITCH_TRACK_CLASS,
              SWITCH_TRACK_SIZE_CLASS,
              className,
            )}
          >
            <baseSwitch.Thumb
              className={`${SWITCH_KNOB_CLASS} ${SWITCH_KNOB_SIZE_CLASS}`}
            />
          </baseSwitch.Root>
        );
        if (disabledReason === undefined) {
          return value;
        }
        return (
          <DisabledReasonTooltip
            side={disabledReasonSide}
            reason={props.disabled ? disabledReason : undefined}
          >
            {value}
          </DisabledReasonTooltip>
        );
      },
    );
    Switch.displayName = "Switch";
  };
}

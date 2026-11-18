import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseCheckbox, clsx, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip, initializeTooltip } from "./avatars";
import { CHECKBOX_LABEL_ALIGNMENT_CLASS, CheckboxGlyph, checkboxVisualClasses, CONTROL_LABEL_CLASS } from "./control-labels";
import { preventRepeatedClickSelection, withRepeatedClickSelectionPrevention } from "./disclosure";
import { FieldWrapper } from "./field";
import { asElement, initializeElementAccess } from "./foundation";
import { cn, initializeClassNames } from "./interactions";
import { getControlSizeAttributes, initializeCdsRoot } from "./overlays";

var reactCheckbox: typeof React;
var jsxCheckbox: typeof import("react/jsx-runtime");
var CHECKBOX_INDICATOR_CLASS: string;
var Checkbox: C.ForwardComponent<HTMLElement, C.CheckboxProps>;
var reactFieldCheckbox: typeof React;
var jsxFieldCheckbox: typeof import("react/jsx-runtime");
var FieldCheckbox: C.ForwardComponent<HTMLElement, C.FieldCheckboxProps>;
function preserveFieldCheckboxFocus(
  event: React.MouseEvent<HTMLLabelElement>,
) {
  if (
    asElement(event.target)
      ?.closest('label, [role="button"]')
      ?.matches('[role="button"]:not(a[href])')
  ) {
    event.preventDefault();
  }
}
export {
  Checkbox,
  CHECKBOX_INDICATOR_CLASS,
  FieldCheckbox,
  jsxCheckbox,
  jsxFieldCheckbox,
  preserveFieldCheckboxFocus,
  reactCheckbox,
  reactFieldCheckbox,
};
export function installUiCheckbox(): () => void {
  return () => {
    initializeClassNames();
    initializeCdsRoot();
    initializeElementAccess();
    initializeClassNames();
    initializeCdsRoot();
    initializeTooltip();
    reactCheckbox = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxCheckbox = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    CHECKBOX_INDICATOR_CLASS = `${checkboxVisualClasses} transition-colors duration-fast ease-out motion-reduce:transition-none group-data-[unchecked]/cb:group-hover/cb:border-stronger group-data-[checked]/cb:bg-fill-accent group-data-[checked]/cb:border-transparent group-data-[indeterminate]/cb:bg-fill-accent group-data-[indeterminate]/cb:border-transparent group-data-[checked]/cb:group-hover/cb:bg-fill-accent-hover group-data-[indeterminate]/cb:group-hover/cb:bg-fill-accent-hover group-data-[disabled]/cb:group-data-[unchecked]/cb:group-hover/cb:border-strong group-focus-visible/cb:shadow-focus`;
    Checkbox = reactCheckbox.forwardRef(
      (
        {
          label: label,
          description: description,
          size: size,
          className: className,
          disabledReason: disabledReason,
          "aria-describedby": ariaDescribedby,
          "aria-labelledby": ariaLabelledby,
          onMouseDown: onMouseDown,
          ...props
        }: C.CheckboxProps,
        options: React.ForwardedRef<HTMLElement>,
      ) => {
        let value = reactCheckbox.useId(),
          value2 = reactCheckbox.useId(),
          value3 =
            label !== null &&
            label !== undefined &&
            typeof label !== "boolean" &&
            label !== "",
          value4 = value3 && !!description,
          [value5, value6] = reactCheckbox.useState(
            props.indeterminate ?? false,
          ),
          value7 =
            props.indeterminate === true || (props.checked === false && value5);
        if (value7 !== value5) {
          value6(value7);
        }
        let value8 = (
          <baseCheckbox.Root
            ref={options}
            data-cds={"Checkbox"}
            aria-labelledby={
              ariaLabelledby ||
              (value4 && !props["aria-label"] ? value : undefined)
            }
            aria-describedby={
              [ariaDescribedby, value4 ? value2 : undefined]
                .filter(Boolean)
                .join(" ") || undefined
            }
            {...props}
            {...(size === "xxs"
              ? {
                  "data-size": "xxs",
                }
              : getControlSizeAttributes(size))}
            onMouseDown={withRepeatedClickSelectionPrevention(
              onMouseDown,
            )}
            className={cn(
              "cds-reset group/cb border-0 outline-none focus-visible:outline-hidden data-[disabled]:opacity-disabled",
              CONTROL_LABEL_CLASS,
              value3 ? "items-start" : "items-center",
              size === "xxs" &&
                "[--cds-checkbox:var(--cds-checkbox-xxs)] [--cds-checkbox-radius:var(--cds-checkbox-xxs-radius)] [--cds-checkbox-glyph:var(--cds-checkbox-xxs-glyph)]",
              className,
            )}
          >
            {[<span
                className={clsx(
                  CHECKBOX_INDICATOR_CLASS,
                  value3 && "mt-[calc((1lh_-_var(--cds-checkbox,1rem))_/_2)]",
                )}
              >
                <span
                  className={
                    "text-on-accent [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-snap ease-out motion-reduce:transition-none group-data-[checked]/cb:[clip-path:inset(0)] group-data-[checked]/cb:duration-base group-data-[indeterminate]/cb:[clip-path:inset(0)] group-data-[indeterminate]/cb:duration-base"
                  }
                >
                  <CheckboxGlyph indeterminate={value7} />
                </span>
              </span>, value3 &&
                (value4 ? (
                  <span className={"flex min-w-0 flex-col"}>
                    {[<span id={value}>{label}</span>, <span
                        id={value2}
                        className={"text-footnote leading-snug text-muted"}
                      >
                        {description}
                      </span>]}
                  </span>
                ) : (
                  <span>{label}</span>
                ))]}
          </baseCheckbox.Root>
        );
        if (disabledReason === undefined) {
          return value8;
        }
        return (
          <DisabledReasonTooltip
            reason={props.disabled ? disabledReason : undefined}
          >
            {value8}
          </DisabledReasonTooltip>
        );
      },
    );
    Checkbox.displayName = "Checkbox";
    reactFieldCheckbox = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxFieldCheckbox = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    FieldCheckbox = reactFieldCheckbox.forwardRef(
      (
        {
          label: label,
          description: description,
          error: error,
          fieldClassName: fieldClassName,
          className: className,
          "aria-labelledby": ariaLabelledby,
          "aria-describedby": ariaDescribedby,
          ...props
        }: C.FieldCheckboxProps,
        options: React.ForwardedRef<HTMLElement>,
      ) => {
        let value = reactFieldCheckbox.useId(),
          value2 = reactFieldCheckbox.useId();
        return (
          <FieldWrapper error={error} fieldClassName={fieldClassName}>
            <label
              {...getControlSizeAttributes(props.size)}
              onMouseDown={preventRepeatedClickSelection}
              onClick={preserveFieldCheckboxFocus}
              className={cn(
                CONTROL_LABEL_CLASS,
                "group/cb items-start self-start",
                props.disabled ? "cursor-default" : "cursor-interactive",
                className,
              )}
            >
              {[<span
                  className={clsx(
                    "flex",
                    CHECKBOX_LABEL_ALIGNMENT_CLASS,
                  )}
                >
                  <Checkbox
                    ref={options}
                    aria-labelledby={ariaLabelledby || value}
                    aria-describedby={
                      [ariaDescribedby, description ? value2 : undefined]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    {...props}
                  />
                </span>, <span
                  className={clsx(
                    "flex min-w-0 flex-col",
                    props.disabled && "text-disabled",
                  )}
                >
                  {[<span id={value}>{label}</span>, !!description && (
                      <span
                        id={value2}
                        className={cn(
                          "text-footnote leading-snug text-muted",
                          props.disabled && "text-disabled",
                        )}
                      >
                        {description}
                      </span>
                    )]}
                </span>]}
            </label>
          </FieldWrapper>
        );
      },
    );
    FieldCheckbox.displayName = "Field.Checkbox";
  };
}

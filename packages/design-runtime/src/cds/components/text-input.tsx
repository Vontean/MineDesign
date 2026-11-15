import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { ForwardComponent, TextInputProps } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Button, ButtonButtonClassNames_3, ButtonButtonClassNames_4, ButtonButtonCss, initializeButtonButton, initializeButtonButton_2 } from "../button/button";
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { initializeFieldContext, useFieldDisabled, useFieldInvalid } from "../field/context";
import { initializeMenuPopup_2, useClickToFocus } from "../menu/popup";
import { initializeSheetsStyles_2, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot } from "../theme/root";
import { initializeNpm__base_ui_react_x7, load_react, load_react_jsx_runtime, npm_Field_qg } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsTextInput: typeof React;
var jsxComponentsTextInput: typeof import("react/jsx-runtime");
var ButtonButtonCssAlias: string;
var ButtonButtonClassNamesAlias: string;
var ComponentsTextInputClassNames: string;
var ComponentsTextInputClassNames_2: string;
var TextInput: ForwardComponent<HTMLInputElement, TextInputProps>;
var initializeComponentsTextInput: () => void;
export {
  ButtonButtonClassNamesAlias,
  ButtonButtonCssAlias,
  ComponentsTextInputClassNames,
  ComponentsTextInputClassNames_2,
  initializeComponentsTextInput,
  jsxComponentsTextInput,
  reactComponentsTextInput,
  TextInput,
};
export function installCdsComponentsTextInput(): () => void {
  return () => {
    initializeComponentsTextInput = (0, initializeOnce)(() => {
      "use client";

      (0, initializeClassNames)();
      (0, initializeSheetsStyles_2)();
      (0, initializeCdsRoot)();
      (0, initializeMenuPopup_2)();
      (0, initializeDomRefComposition)();
      (0, initializeButtonButton)();
      (0, initializeButtonButton_2)();
      (0, initializeFieldContext)();
      reactComponentsTextInput = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      jsxComponentsTextInput = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_x7)();
      ButtonButtonCssAlias = ButtonButtonCss;
      ButtonButtonClassNamesAlias = ButtonButtonClassNames_4;
      ComponentsTextInputClassNames =
        "[&_[data-cds=Button]:not([data-cds-ghost])]:h-[var(--fhn)] [&_[data-cds=Button]:not([data-cds-ghost])]:rounded-[calc(var(--fr)-(var(--fh)-var(--fhn))/2)] [&_[data-cds=Button][data-cds-icon-only]:not([data-cds-ghost])]:w-[var(--fhn)]";
      ComponentsTextInputClassNames_2 =
        "has-[[data-cds-end-slot]_[data-cds=Button]:not([data-cds-ghost])]:pr-[calc((var(--cds-h-control)-var(--cds-h-control-nested))/2)]";
      TextInput = (0, reactComponentsTextInput.forwardRef)<
        HTMLInputElement,
        TextInputProps
      >(
        (
          {
            className: className,
            size: size,
            fullWidth = true,
            slotStart: slotStart,
            slotEnd: slotEnd,
            clearable = false,
            onClear: onClear,
            clearLabel: clearLabel,
            onChange: onChange,
            ...props
          }: TextInputProps,
          options: React.ForwardedRef<HTMLInputElement>,
        ): React.ReactElement => {
          let {
              id: value,
              "aria-describedby": value2,
              "aria-invalid": value3,
              disabled: value4,
              ...value5
            } = props,
            state = {
              id: value,
              "aria-describedby": value2,
              disabled: value4,
            },
            value6 = (0, useLabel)("clear", "Clear"),
            value7 = clearLabel ?? value6,
            value8 = (0, useFieldInvalid)(),
            value9 = value8 || value3,
            value10 = (0, useFieldDisabled)(),
            value11 = value4 || value10,
            value12 = fullWidth ? "w-full" : "",
            value13 = (0,
            reactComponentsTextInput.useRef)<HTMLInputElement | null>(null),
            { clickToFocusProps: value14 } = (0, useClickToFocus)(
              () => value13.current?.focus(),
              {
                disabled: value11,
                readOnly: value5.readOnly,
              },
            ),
            value15 = (0, useMergedRefs)(value13, options),
            value16 = value5.value !== undefined,
            [value17, value18] = (0, reactComponentsTextInput.useState)(
              () =>
                value5.defaultValue !== undefined &&
                String(value5.defaultValue).length > 0,
            ),
            value19 = value16
              ? value5.value !== undefined && String(value5.value).length > 0
              : value17,
            callback = (event: React.ChangeEvent<HTMLInputElement>): void => {
              clearable && !value16 && value18(event.target.value.length > 0);
              onChange?.(event);
            },
            value20 =
              (clearable === "always" || (clearable && value19)) && !value11 ? (
                <Button
                  iconOnly={true}
                  variant={"ghost"}
                  size={size === "sm" || size === "xs" ? "xs" : "sm"}
                  className={
                    "!size-[var(--fhn)] !rounded-[calc(var(--fr)-(var(--fh)-var(--fhn))/2)]"
                  }
                  icon={"X"}
                  aria-label={value7}
                  tooltip={false}
                  onMouseDown={(event: React.MouseEvent<HTMLElement>) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    let current = value13.current;
                    !value16 &&
                      current &&
                      (Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        "value",
                      )?.set?.call(current, ""),
                      current.dispatchEvent(
                        new Event("input", {
                          bubbles: true,
                        }),
                      ),
                      value18(false));
                    onClear?.();
                    current?.focus();
                  }}
                />
              ) : null;
          if (slotStart || slotEnd || clearable) {
            let value21 = value20 && !slotEnd,
              value22 = value21 ? "pr-0" : "pr-md",
              text =
                "[--fh:var(--cds-h-control)] [--fr:var(--cds-radius)] [--fhn:var(--cds-h-control-nested)]",
              value23 = value21
                ? `flex aspect-square h-control shrink-0 items-center justify-center ${text}`
                : `flex shrink-0 items-center gap-[var(--cds-pad-sm,6px)] text-muted ${text} ${ComponentsTextInputClassNames}`;
            return (
              <div
                data-cds={"TextInput"}
                {...(0, getSizeAttribute)(size)}
                data-invalid={value8 || undefined}
                onMouseDown={value14.onMouseDown}
                className={(0, cn)(
                  ButtonButtonCssAlias,
                  value22,
                  ComponentsTextInputClassNames_2,
                  "inline-flex",
                  value12,
                  value11 ? "cursor-default" : "cursor-text",
                  "items-center gap-[var(--cds-pad-sm,6px)] has-[:focus-visible]:shadow-focus",
                  "has-[input:disabled]:opacity-disabled",
                  value11 ? undefined : ButtonButtonClassNames_3,
                  className,
                )}
              >
                {slotStart ? (<span className={"flex shrink-0 items-center text-muted"}>
                    {slotStart}
                  </span>) : (null)}
                <npm_Field_qg.Control
                  {...state}
                  render={
                    <input
                      ref={value15}
                      aria-invalid={value9}
                      {...value5}
                      onChange={callback}
                      className={(0, cn)(
                        ButtonButtonClassNamesAlias,
                        "disabled:opacity-100",
                      )}
                    />
                  }
                />
                {value20 || slotEnd ? (<span data-cds-end-slot={""} className={value23}>
                    {value20}
                    {slotEnd}
                  </span>) : (null)}
              </div>
            );
          }
          return (
            <npm_Field_qg.Control
              ref={options}
              {...state}
              render={
                <input
                  data-cds={"TextInput"}
                  {...(0, getSizeAttribute)(size)}
                  data-invalid={value8 || undefined}
                  aria-invalid={value9}
                  {...value5}
                  onChange={callback}
                  className={(0, cn)(
                    "cds-input cds-reset",
                    ButtonButtonCssAlias,
                    "pr-md",
                    value12,
                    "placeholder:text-muted outline-none focus-visible:outline-hidden enabled:[&:hover:not(:focus):not([data-invalid])]:shadow-field-hover focus-visible:shadow-focus disabled:opacity-disabled",
                    className,
                  )}
                />
              }
            />
          );
        },
      );
      TextInput.displayName = "TextInput";
    });
  };
}

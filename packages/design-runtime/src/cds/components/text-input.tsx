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
    initializeComponentsTextInput = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeSheetsStyles_2();
      initializeCdsRoot();
      initializeMenuPopup_2();
      initializeDomRefComposition();
      initializeButtonButton();
      initializeButtonButton_2();
      initializeFieldContext();
      reactComponentsTextInput = toModuleNamespace(
        load_react(),
      );
      jsxComponentsTextInput = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_x7();
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
          forwardedRef: React.ForwardedRef<HTMLInputElement>,
        ): React.ReactElement => {
          let {
              id: inputId,
              "aria-describedby": ariaDescribedBy,
              "aria-invalid": ariaInvalidProp,
              disabled: disabledProp,
              ...inputProps
            } = props,
            fieldControlProps = {
              id: inputId,
              "aria-describedby": ariaDescribedBy,
              disabled: disabledProp,
            },
            defaultClearLabel = useLabel("clear", "Clear"),
            clearAriaLabel = clearLabel ?? defaultClearLabel,
            isFieldInvalid = useFieldInvalid(),
            isInvalid = isFieldInvalid || ariaInvalidProp,
            isFieldDisabled = useFieldDisabled(),
            isDisabled = disabledProp || isFieldDisabled,
            widthClass = fullWidth ? "w-full" : "",
            inputRef = (0,
            reactComponentsTextInput.useRef)<HTMLInputElement | null>(null),
            { clickToFocusProps: clickToFocusHandlers } = useClickToFocus(
              () => inputRef.current?.focus(),
              {
                disabled: isDisabled,
                readOnly: inputProps.readOnly,
              },
            ),
            mergedInputRef = useMergedRefs(inputRef, forwardedRef),
            isControlled = inputProps.value !== undefined,
            [hasUncontrolledText, setHasUncontrolledText] = (0, reactComponentsTextInput.useState)(
              () =>
                inputProps.defaultValue !== undefined &&
                String(inputProps.defaultValue).length > 0,
            ),
            hasText = isControlled
              ? inputProps.value !== undefined && String(inputProps.value).length > 0
              : hasUncontrolledText,
            handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
              clearable && !isControlled && setHasUncontrolledText(event.target.value.length > 0);
              onChange?.(event);
            },
            clearButton =
              (clearable === "always" || (clearable && hasText)) && !isDisabled ? (
                <Button
                  iconOnly={true}
                  variant={"ghost"}
                  size={size === "sm" || size === "xs" ? "xs" : "sm"}
                  className={
                    "!size-[var(--fhn)] !rounded-[calc(var(--fr)-(var(--fh)-var(--fhn))/2)]"
                  }
                  icon={"X"}
                  aria-label={clearAriaLabel}
                  tooltip={false}
                  onMouseDown={(event: React.MouseEvent<HTMLElement>) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    let current = inputRef.current;
                    !isControlled &&
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
                      setHasUncontrolledText(false));
                    onClear?.();
                    current?.focus();
                  }}
                />
              ) : null;
          if (slotStart || slotEnd || clearable) {
            let isClearOnly = clearButton && !slotEnd,
              paddingRightClass = isClearOnly ? "pr-0" : "pr-md",
              cssVarsClass =
                "[--fh:var(--cds-h-control)] [--fr:var(--cds-radius)] [--fhn:var(--cds-h-control-nested)]",
              endSlotClass = isClearOnly
                ? `flex aspect-square h-control shrink-0 items-center justify-center ${cssVarsClass}`
                : `flex shrink-0 items-center gap-[var(--cds-pad-sm,6px)] text-muted ${cssVarsClass} ${ComponentsTextInputClassNames}`;
            return (
              <div
                data-cds={"TextInput"}
                {...getSizeAttribute(size)}
                data-invalid={isFieldInvalid || undefined}
                onMouseDown={clickToFocusHandlers.onMouseDown}
                className={cn(
                  ButtonButtonCssAlias,
                  paddingRightClass,
                  ComponentsTextInputClassNames_2,
                  "inline-flex",
                  widthClass,
                  isDisabled ? "cursor-default" : "cursor-text",
                  "items-center gap-[var(--cds-pad-sm,6px)] has-[:focus-visible]:shadow-focus",
                  "has-[input:disabled]:opacity-disabled",
                  isDisabled ? undefined : ButtonButtonClassNames_3,
                  className,
                )}
              >
                {slotStart ? (<span className={"flex shrink-0 items-center text-muted"}>
                    {slotStart}
                  </span>) : (null)}
                <npm_Field_qg.Control
                  {...fieldControlProps}
                  render={
                    <input
                      ref={mergedInputRef}
                      aria-invalid={isInvalid}
                      {...inputProps}
                      onChange={handleChange}
                      className={cn(
                        ButtonButtonClassNamesAlias,
                        "disabled:opacity-100",
                      )}
                    />
                  }
                />
                {clearButton || slotEnd ? (<span data-cds-end-slot={""} className={endSlotClass}>
                    {clearButton}
                    {slotEnd}
                  </span>) : (null)}
              </div>
            );
          }
          return (
            <npm_Field_qg.Control
              ref={forwardedRef}
              {...fieldControlProps}
              render={
                <input
                  data-cds={"TextInput"}
                  {...getSizeAttribute(size)}
                  data-invalid={isFieldInvalid || undefined}
                  aria-invalid={isInvalid}
                  {...inputProps}
                  onChange={handleChange}
                  className={cn(
                    "cds-input cds-reset",
                    ButtonButtonCssAlias,
                    "pr-md",
                    widthClass,
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

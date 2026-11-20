import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseField, baseUseLabelableContext, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { initializeDisabledReason, initializeShortcuts, initializeTooltip } from "./avatars";
import { Button } from "./buttons";
import { initializeAdaptiveSheets, initializeAndroidCloseWatcher, initializeElementAccess, initializeEventCallbacks, initializeIsomorphicLayoutEffect, initializeMediaQueryStores, initializeOverlayActions, initializePresentationMode, initializeSheetClassNames } from "./foundation";
import { cn, initializeClassNames, initializeCloseOnActivityHide, initializeCollisionPadding, initializeElementNamespaces, initializeIcons, initializeLayers, initializeMergedRefs, initializePortalRoot, initializeSurfaces, useMergedRefs, useTranslation } from "./interactions";
import { getControlSizeAttributes, initializeCdsLink, initializeCdsRoot, initializeClickToFocus, useClickToFocus } from "./overlays";

var fieldRingClasses: string;
var fieldHoverClasses: string;
var inputContainerClasses: string;
var inputElementClasses: string;
var textAreaBaseClasses: string;
var textAreaContainerClasses: string;
var reactiK: typeof React;
var textFieldStateContext: React.Context<C.FieldState | null>;
var reactoK: typeof React;
var jsxeJ: typeof import("react/jsx-runtime");
var textInputContainerBaseClasses: string;
var textInputElementBaseClasses: string;
var textInputNestedControlClasses: string;
var textInputTrailingControlPaddingClasses: string;
var textInputTrailingPaddingClasses: string;
var TextInput: C.ForwardComponent<HTMLInputElement, C.TextInputProps>;
function useFieldInvalid() {
  return reactiK.useContext(textFieldStateContext)?.invalid ?? false;
}
function useFieldDisabled() {
  return reactiK.useContext(textFieldStateContext)?.disabled ?? false;
}
function useFieldLabelId() {
  let {
    labelId: labelId,
    controlId: controlId,
  }: {
    labelId?: string;
    controlId?: string | null;
  } = baseUseLabelableContext();
  return labelId ?? (controlId ? `${controlId}-label` : undefined);
}
function useHasFieldContext() {
  return reactiK.useContext(textFieldStateContext) !== null;
}
export {
  fieldHoverClasses,
  fieldRingClasses,
  inputContainerClasses,
  inputElementClasses,
  jsxeJ,
  reactiK,
  reactoK,
  textAreaBaseClasses,
  textAreaContainerClasses,
  textFieldStateContext,
  TextInput,
  textInputContainerBaseClasses,
  textInputElementBaseClasses,
  textInputNestedControlClasses,
  textInputTrailingControlPaddingClasses,
  textInputTrailingPaddingClasses,
  useFieldDisabled,
  useFieldInvalid,
  useFieldLabelId,
  useHasFieldContext,
};
export function installUiTextInput(): () => void {
  return () => {
    initializeClickToFocus();
    initializeMergedRefs();
    fieldRingClasses =
      "bg-fill-field shadow-field-ring data-[invalid]:shadow-field-invalid";
    fieldHoverClasses =
      "[&:hover:not(:focus-visible):not(:has(:focus-visible)):not([data-invalid]):not([data-disabled])]:shadow-field-hover";
    inputContainerClasses = `h-control pl-md rounded ${fieldRingClasses} font-sans text-body font-normal text-primary transition duration-fast`;
    inputElementClasses =
      "cds-input cds-reset min-w-0 flex-1 h-full bg-transparent border-0 p-0 outline-none focus-visible:outline-hidden text-body font-normal text-primary focus-visible:shadow-none placeholder:text-muted disabled:opacity-disabled";
    textAreaBaseClasses = `rounded ${fieldRingClasses} px-md py-sm transition duration-fast`;
    textAreaContainerClasses = `${textAreaBaseClasses} [&:hover:not(:focus-within):not([data-invalid]):not([data-disabled])]:shadow-field-hover focus-within:shadow-focus data-[invalid]:focus-within:shadow-focus-danger font-sans text-body text-primary`;
    reactiK = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    textFieldStateContext = reactiK.createContext<C.FieldState | null>(null);
    reactoK = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxeJ = toModuleNamespace(loadJsxNamespace(), 1);
    textInputContainerBaseClasses = inputContainerClasses;
    textInputElementBaseClasses = inputElementClasses;
    textInputNestedControlClasses =
      "[&_[data-cds=Button]:not([data-cds-ghost])]:h-[var(--fhn)] [&_[data-cds=Button]:not([data-cds-ghost])]:rounded-[calc(var(--fr)-(var(--fh)-var(--fhn))/2)] [&_[data-cds=Button][data-cds-icon-only]:not([data-cds-ghost])]:w-[var(--fhn)]";
    textInputTrailingControlPaddingClasses =
      "has-[[data-cds-end-slot]_[data-cds=Button]:not([data-cds-ghost])]:pr-[calc((var(--cds-h-control)-var(--cds-h-control-nested))/2)]";
    textInputTrailingPaddingClasses =
      "pr-[calc((var(--cds-h-control)-var(--cds-h-control-nested))/2)]";
    TextInput = reactoK.forwardRef(
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
          onKeyDown: onKeyDown,
          ...props
        }: C.TextInputProps,
        forwardedRef: React.ForwardedRef<HTMLInputElement>,
      ) => {
        let {
            id: value,
            "aria-describedby": describedBy,
            "aria-invalid": ariaInvalid,
            disabled: disabled,
            ...inputProps
          } = props,
          state = {
            id: value,
            "aria-describedby": describedBy,
            disabled: disabled,
          },
          defaultClearLabel: string = useTranslation("clear", "Clear"),
          resolvedClearLabel = clearLabel ?? defaultClearLabel,
          fieldInvalid = useFieldInvalid(),
          resolvedInvalid = fieldInvalid || ariaInvalid,
          fieldDisabled = useFieldDisabled(),
          isDisabled = disabled || fieldDisabled,
          wrapperWidthClasses = fullWidth ? "w-full" : "",
          inputWidthClasses = fullWidth ? "w-full min-w-0" : "",
          ref = reactoK.useRef<HTMLInputElement>(null),
          {
            clickToFocusProps: clickToFocusProps,
          }: {
            clickToFocusProps: React.HTMLAttributes<HTMLDivElement>;
          } = useClickToFocus(() => ref.current?.focus(), {
            disabled: isDisabled,
            readOnly: inputProps.readOnly,
          }),
          mergedRef: React.Ref<HTMLInputElement> = useMergedRefs(
            ref,
            forwardedRef,
          ),
          isControlled = inputProps.value !== undefined,
          [uncontrolledHasText, setUncontrolledHasText] = reactoK.useState(
            () =>
              inputProps.defaultValue !== undefined &&
              String(inputProps.defaultValue).length > 0,
          ),
          hasText = isControlled
            ? inputProps.value !== undefined && String(inputProps.value).length > 0
            : uncontrolledHasText,
          callback = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (clearable && !isControlled) {
              setUncontrolledHasText(event.target.value.length > 0);
            }
            onChange?.(event);
          },
          clearInput = () => {
            let current = ref.current;
            if (!isControlled && current) {
              Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value",
              )?.set?.call(current, "");
              current.dispatchEvent(
                new Event("input", {
                  bubbles: true,
                }),
              );
              setUncontrolledHasText(false);
            }
            onClear?.();
            current?.focus();
          },
          showClearButton =
            (clearable === "always" || (clearable && hasText)) && !isDisabled,
          canClearText =
            showClearButton &&
            hasText &&
            (!isControlled || onClear !== undefined) &&
            !inputProps.readOnly,
          clearButton = showClearButton ? (
            <Button
              iconOnly={true}
              variant={"ghost"}
              size={size === "sm" || size === "xs" ? "xs" : "sm"}
              className={
                "!size-[var(--fhn)] !rounded-[calc(var(--fr)-(var(--fh)-var(--fhn))/2)]"
              }
              icon={"X"}
              aria-label={resolvedClearLabel}
              tooltip={false}
              tabIndex={canClearText ? -1 : undefined}
              onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) =>
                event.preventDefault()
              }
              onClick={clearInput}
            />
          ) : null,
          handledEscapeRef = reactoK.useRef(false),
          suppressEscape = (event: React.KeyboardEvent<HTMLInputElement>) => {
            event.preventDefault();
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
          },
          handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(event);
            if (event.key === "Escape" && !event.repeat) {
              handledEscapeRef.current = false;
            }
            if (
              !(
                event.key === "Escape" &&
                !(
                  event.metaKey ||
                  event.ctrlKey ||
                  event.altKey ||
                  event.shiftKey
                ) &&
                !event.nativeEvent.isComposing &&
                event.nativeEvent.keyCode !== 229 &&
                !event.defaultPrevented &&
                !event.isPropagationStopped()
              )
            ) {
              return;
            }
            if (event.repeat) {
              if (handledEscapeRef.current) {
                suppressEscape(event);
              }
              return;
            }
            handledEscapeRef.current = canClearText && event.currentTarget.value !== "";
            if (handledEscapeRef.current) {
              suppressEscape(event);
              clearInput();
            }
          };
        if (slotStart || slotEnd || clearable) {
          let trailingPaddingClasses = clearButton ? textInputTrailingPaddingClasses : "pr-md",
            nestedControlClasses = `flex shrink-0 items-center gap-[var(--cds-pad-sm,6px)] text-muted [--fh:var(--cds-h-control)] [--fr:var(--cds-radius)] [--fhn:var(--cds-h-control-nested)] ${textInputNestedControlClasses}`;
          return (
            <div
              data-cds={"TextInput"}
              {...getControlSizeAttributes(size)}
              data-invalid={fieldInvalid || undefined}
              onMouseDown={clickToFocusProps.onMouseDown}
              className={cn(
                textInputContainerBaseClasses,
                trailingPaddingClasses,
                textInputTrailingControlPaddingClasses,
                "inline-flex",
                inputWidthClasses,
                isDisabled ? "cursor-default" : "cursor-text",
                "items-center gap-[var(--cds-pad-sm,6px)] has-[:focus-visible]:shadow-focus",
                "has-[input:disabled]:opacity-disabled",
                isDisabled ? undefined : fieldHoverClasses,
                className,
              )}
            >
              {[slotStart ? (
                  <span className={"flex shrink-0 items-center text-muted"}>
                    {slotStart}
                  </span>
                ) : null, <baseField.Control
                  {...state}
                  render={
                    <input
                      ref={mergedRef}
                      aria-invalid={resolvedInvalid}
                      {...inputProps}
                      onChange={callback}
                      onKeyDown={handleInputKeyDown}
                      className={cn(
                        textInputElementBaseClasses,
                        "disabled:opacity-100",
                      )}
                    />
                  }
                />, clearButton || slotEnd ? (
                  <span data-cds-end-slot={""} className={nestedControlClasses}>
                    {[slotEnd, clearButton]}
                  </span>
                ) : null]}
            </div>
          );
        }
        return (
          <baseField.Control
            ref={forwardedRef}
            {...state}
            render={
              <input
                data-cds={"TextInput"}
                {...getControlSizeAttributes(size)}
                data-invalid={fieldInvalid || undefined}
                aria-invalid={resolvedInvalid}
                {...inputProps}
                onChange={callback}
                onKeyDown={handleInputKeyDown}
                className={cn(
                  "cds-input cds-reset",
                  textInputContainerBaseClasses,
                  "pr-md",
                  wrapperWidthClasses,
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
    initializeMediaQueryStores();
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    initializeCdsLink();
    initializeCdsRoot();
    initializeElementAccess();
    initializeLayers();
    initializeEventCallbacks();
    initializeClickToFocus();
    initializeElementNamespaces();
    initializeCloseOnActivityHide();
    initializeMergedRefs();
    initializePortalRoot();
    initializeIcons();
    initializeCollisionPadding();
    initializeShortcuts();
    initializeDisabledReason();
    initializeTooltip();
    initializeSurfaces();
    initializeOverlayActions();
    initializePresentationMode();
    initializeAdaptiveSheets();
    initializeCdsRoot();
    initializeLayers();
    initializeAndroidCloseWatcher();
    initializePortalRoot();
    initializeAdaptiveSheets();
    initializeSheetClassNames();
  };
}

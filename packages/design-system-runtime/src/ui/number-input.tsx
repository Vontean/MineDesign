import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseNumberField, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { initializeDisabledReason, initializeTooltip } from "./avatars";
import { initializeIconSupport, initializeInertProps, initializeIsomorphicLayoutEffect, initializeSafeObservers } from "./foundation";
import { cn, initializeClassNames, initializeElementNamespaces, initializeMergedRefs, isHtmlElement, useMergedRefs } from "./interactions";
import { getControlSizeAttributes, initializeCdsRoot, useCdsLocale, useClickToFocus } from "./overlays";
import { currencyDisplayParts } from "./segmented-control";
import { applyTabFlexCorrection, parsePixelCssValue } from "./tabs";
import { inputContainerClasses, inputElementClasses, useFieldDisabled, useFieldInvalid } from "./text-input";

var reactNumberInput: typeof React;
var jsxNumberInput: typeof import("react/jsx-runtime");
var numberFieldHydrationNoop: () => void;
var subscribeHydration: (listener: () => void) => () => void;
var NumberInput: C.ForwardComponent<HTMLInputElement, C.NumberInputProps>;
var findBarListenerWindows: WeakSet<Document>;
function useClientHydrated() {
  return reactNumberInput.useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
}
function isUnwrappedHorizontalFlex(element: HTMLElement) {
  let value = getComputedStyle(element);
  return (
    value.display.endsWith("flex") &&
    !value.flexDirection.startsWith("column") &&
    !value.flexWrap.startsWith("wrap")
  );
}
function getInnerElementWidth(element: HTMLElement) {
  let value = getComputedStyle(element);
  return (
    element.getBoundingClientRect().width -
    (Number.parseFloat(value.paddingLeft) || 0) -
    (Number.parseFloat(value.paddingRight) || 0) -
    (Number.parseFloat(value.borderLeftWidth) || 0) -
    (Number.parseFloat(value.borderRightWidth) || 0)
  );
}
function getTabOverflowWidth(
  container: HTMLElement,
  tabList: HTMLElement,
  tabWidth: number,
) {
  return (
    tabWidth +
    measureVisibleSiblingWidth(
      container,
      tabList,
      Number.parseFloat(getComputedStyle(container).columnGap) || 0,
    )
  );
}
function measureVisibleSiblingWidth(
  container: HTMLElement,
  excludedElement: HTMLElement,
  gap: number,
) {
  let index = 0;
  for (let value of Array.from<Element>(container.children)) {
    if (value === excludedElement || !isHtmlElement(value)) {
      continue;
    }
    let childStyle = getComputedStyle(value);
    if (
      childStyle.position === "absolute" ||
      childStyle.position === "fixed" ||
      childStyle.display === "none"
    ) {
      continue;
    }
    if (childStyle.display === "contents") {
      index += measureVisibleSiblingWidth(
        value as HTMLElement,
        excludedElement,
        gap,
      );
      continue;
    }
    if (childStyle.flexShrink === "0" && childStyle.flexGrow === "0") {
      index += value.getBoundingClientRect().width + gap;
      continue;
    }
    let flexBasis: number = parsePixelCssValue(childStyle.flexBasis),
      attribute = value.getAttribute("style"),
      cssText = (value as HTMLElement).style.cssText;
    (value as HTMLElement).style.flex = "0 0 auto";
    (value as HTMLElement).style.width = "min-content";
    let width = value.getBoundingClientRect().width;
    applyTabFlexCorrection(value, attribute, cssText);
    index += Math.max(width, flexBasis) + gap;
  }
  return index;
}
export {
  findBarListenerWindows,
  getInnerElementWidth,
  getTabOverflowWidth,
  isUnwrappedHorizontalFlex,
  jsxNumberInput,
  measureVisibleSiblingWidth,
  numberFieldHydrationNoop,
  NumberInput,
  reactNumberInput as reactForUiTable3,
  subscribeHydration,
  useClientHydrated,
};
export function installUiNumberInput(): () => void {
  return () => {
    reactNumberInput = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxNumberInput = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    numberFieldHydrationNoop = () => {
      return;
    };
    subscribeHydration = () => numberFieldHydrationNoop;
    NumberInput = reactNumberInput.forwardRef(
      (
        {
          className: className,
          size: size,
          fullWidth = true,
          currency: currency,
          slotStart: slotStart,
          slotEnd: slotEnd,
          value: numberValue,
          defaultValue: defaultValue,
          onValueChange: onValueChange,
          onValueCommitted: onValueCommitted,
          format: format,
          locale: locale,
          min: min,
          max: max,
          step: step,
          smallStep: smallStep,
          largeStep: largeStep,
          snapOnStep: snapOnStep,
          allowOutOfRange: allowOutOfRange,
          required: required,
          disabled: disabled,
          readOnly: readOnly,
          name: name,
          form: form,
          ...props
        }: C.NumberInputProps,
        forwardedRef: React.ForwardedRef<HTMLInputElement>,
      ) => {
        let { id: inputId, ...inputProps } = props,
          contextLocale: Intl.LocalesArgument | undefined = useCdsLocale(),
          requestedLocale = locale ?? contextLocale,
          isHydrated = useClientHydrated(),
          resolvedLocale = requestedLocale ?? (isHydrated ? undefined : "en-US"),
          memo = reactNumberInput.useMemo<C.CurrencyDisplayParts | null>(
            () =>
              currency !== undefined &&
              slotStart === undefined &&
              slotEnd === undefined
                ? currencyDisplayParts(currency, resolvedLocale)
                : null,
            [currency, resolvedLocale, slotStart, slotEnd],
          ),
          leadingContent = slotStart ?? (memo?.side === "start" ? memo.symbol : null),
          trailingContent = slotEnd ?? (memo?.side === "end" ? memo.symbol : null),
          hasCurrencyAdornment = memo !== null || undefined,
          fieldInvalid: boolean = useFieldInvalid(),
          fieldDisabled: boolean = useFieldDisabled(),
          widthClasses = fullWidth ? "w-full min-w-0" : "",
          ref = reactNumberInput.useRef<HTMLInputElement>(null),
          {
            clickToFocusProps: clickToFocusProps,
          }: {
            clickToFocusProps: React.HTMLAttributes<HTMLDivElement>;
          } = useClickToFocus(() => ref.current?.focus(), {
            disabled: disabled || fieldDisabled,
            readOnly: readOnly,
          }),
          [, refreshAfterBlur] = reactNumberInput.useReducer(
            (revision: number) => revision + 1,
            0,
          ),
          callback = (focusEvent: React.FocusEvent<HTMLInputElement>) => {
            inputProps.onBlur?.(focusEvent);
            refreshAfterBlur();
          },
          mergedRef: React.RefCallback<HTMLInputElement> = useMergedRefs(ref, forwardedRef);
        return (
          <baseNumberField.Root
            data-cds={"NumberInput"}
            {...getControlSizeAttributes(size)}
            data-invalid={fieldInvalid || undefined}
            id={inputId}
            value={numberValue}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            onValueCommitted={onValueCommitted}
            format={format}
            locale={requestedLocale}
            min={min}
            max={max}
            step={step}
            smallStep={smallStep}
            largeStep={largeStep}
            snapOnStep={snapOnStep}
            allowOutOfRange={allowOutOfRange}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            name={name}
            form={form}
            onMouseDown={clickToFocusProps.onMouseDown}
            className={cn(
              inputContainerClasses,
              "pr-md",
              "inline-flex",
              widthClasses,
              "cursor-text items-center gap-[var(--cds-pad-sm,6px)] has-[:focus-visible]:shadow-focus",
              "data-[disabled]:opacity-disabled",
              !disabled &&
                "[&:hover:not(:focus-visible):not(:has(:focus-visible)):not([data-invalid]):not([data-disabled])]:shadow-field-hover",
              className,
            )}
          >
            {[leadingContent ? (
                <span
                  aria-hidden={hasCurrencyAdornment}
                  className={"flex shrink-0 items-center text-muted"}
                >
                  {leadingContent}
                </span>
              ) : null, <baseNumberField.Input
                ref={mergedRef}
                aria-invalid={inputProps["aria-invalid"] ?? (fieldInvalid || undefined)}
                {...inputProps}
                onBlur={callback}
                className={cn(
                  inputElementClasses,
                  "disabled:opacity-100",
                )}
              />, trailingContent ? (
                <span
                  aria-hidden={hasCurrencyAdornment}
                  className={"flex shrink-0 items-center text-muted"}
                >
                  {trailingContent}
                </span>
              ) : null]}
          </baseNumberField.Root>
        );
      },
    );
    NumberInput.displayName = "NumberInput";
    initializeSafeObservers();
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    initializeCdsRoot();
    initializeIconSupport();
    initializeElementNamespaces();
    initializeMergedRefs();
    initializeDisabledReason();
    initializeTooltip();
    initializeInertProps();
    initializeElementNamespaces();
    findBarListenerWindows = new WeakSet();
  };
}

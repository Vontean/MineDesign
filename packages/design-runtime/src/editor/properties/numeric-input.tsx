import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { NumberInput } from "../../cds/components/selection-ring";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { announce } from "../accessibility/announcer";
import { joinClassNames } from "../chrome/overlay-state";
import { DecreaseValue, IncreaseValue, invalidNumericValueMessage, MixedValue } from "../color/contrast-copy";
import { captureNumericPointer, numericInputDecimalPlaces, numericInputFormatter, PropertiesNumericScrubberClassNames, PropertiesNumericScrubberClassNames_2, PropertiesNumericScrubberResolvedValue, PropertiesNumericScrubberUseGroupingConfig, useNumericScrub } from "./numeric-scrubber";
import { EditorIcon } from "./primitives";
import { reactPropertiesToolOptions } from "./tool-options";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesNumericInput: Dynamic;
var jsxPropertiesNumericInput: Dynamic;
var PropertiesNumericInputLimit: Dynamic;
function NumericInput({
  value: currentValue,
  onValue: onValue,
  onScrub: onScrub,
  onScrubEnd: onScrubEnd,
  prefix: prefix,
  unit: unit,
  unitScrubs = true,
  refuseLetters = false,
  ownUnit = typeof unit == "string" ? unit : undefined,
  min: minValue,
  max: max,
  step: step,
  scrubOrigin: scrubOrigin,
  smallStep: smallStep,
  emptyStepFrom: emptyStepFrom,
  placeholder: placeholder,
  hint: hint,
  clearable: clearable,
  mixed = false,
  steppers = true,
  fullWidth = true,
  disabled: isDisabled,
  title: title,
  "aria-label": ariaLabel,
  inputRef: inputRef,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let inputElementRef: Dynamic = (0, reactPropertiesToolOptions.useRef)(null),
    setInputRef: Dynamic = (0, reactPropertiesToolOptions.useCallback)(
      (element?: Dynamic): Dynamic => {
        inputElementRef.current = element;
        typeof inputRef == "function"
          ? inputRef(element)
          : inputRef && (inputRef.current = element);
      },
      [inputRef],
    ),
    hasUnit: Dynamic = unit != null && unit !== false && unit !== "",
    placeholderNumber: Dynamic =
      currentValue === undefined &&
      !mixed &&
      emptyStepFrom !== null &&
      placeholder !== undefined &&
      /^-?\d+(\.\d+)?$/.test(placeholder)
        ? Number(placeholder)
        : undefined,
    effectiveValue: Dynamic = currentValue ?? placeholderNumber,
    isCancelingRef: Dynamic = (0, reactPropertiesToolOptions.useRef)(false),
    keepSelectionRef: Dynamic = (0, reactPropertiesToolOptions.useRef)(false),
    isProgrammaticBlurRef: Dynamic = (0, reactPropertiesToolOptions.useRef)(false),
    typedLettersRef: Dynamic = (0, reactPropertiesToolOptions.useRef)(""),
    skipNextCommitRef: Dynamic = (0, reactPropertiesToolOptions.useRef)(false),
    consumeInvalidLetters: Dynamic = (): Dynamic => {
      let typedLetters: Dynamic = typedLettersRef.current.toLowerCase();
      typedLettersRef.current = "";
      return !refuseLetters ||
        !typedLetters ||
        typedLetters === (ownUnit ?? "").toLowerCase()
        ? false
        : (isProgrammaticBlurRef.current && (skipNextCommitRef.current = true), true);
    },
    stepSize: Dynamic = step ?? 1,
    fineStep: Dynamic = smallStep ?? Math.min(0.1, stepSize),
    accessibleName: Dynamic =
      ariaLabel ||
      (typeof prefix == "string" && prefix !== "" ? prefix : undefined),
    commitValue: Dynamic = (committedValue?: Dynamic): Dynamic => {
      if (!isCancelingRef.current) {
        if (consumeInvalidLetters()) {
          announce(
            invalidNumericValueMessage(accessibleName, ownUnit),
          );
          return;
        }
        if (committedValue === null) {
          clearable &&
            !mixed &&
            currentValue !== undefined &&
            !(isProgrammaticBlurRef.current && emptyStepFrom !== undefined) &&
            onValue(undefined);
          return;
        }
        currentValue === undefined &&
          minValue !== undefined &&
          (committedValue = Math.max(minValue, committedValue));
        currentValue === undefined &&
          max !== undefined &&
          (committedValue = Math.min(max, committedValue));
        (mixed || committedValue !== currentValue) && onValue(committedValue);
      }
    },
    handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      keepSelectionRef.current = false;
      skipNextCommitRef.current = false;
      !event.metaKey &&
        !event.ctrlKey &&
        (/^[a-zA-Z%]$/.test(event.key)
          ? (typedLettersRef.current += event.key)
          : /^[0-9.\-]$/.test(event.key) && (typedLettersRef.current = ""));
      if (event.key === "Enter") {
        event.preventDefault();
        let inputElement: Dynamic = inputElementRef.current;
        inputElement?.blur();
        inputElement?.focus();
        inputElement?.select();
        keepSelectionRef.current = true;
        queueMicrotask((): Dynamic => {
          !keepSelectionRef.current ||
            !inputElement ||
            ((keepSelectionRef.current = false),
            inputElement.ownerDocument.activeElement === inputElement &&
              inputElement.select());
        });
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        typedLettersRef.current = "";
        isCancelingRef.current = true;
        inputElementRef.current?.blur();
        isCancelingRef.current = false;
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        if (
          emptyStepFrom !== undefined &&
          (inputElementRef.current?.value ?? "").trim() === ""
        ) {
          let preventBaseUIHandler: Dynamic = event.preventBaseUIHandler;
          preventBaseUIHandler && preventBaseUIHandler.call(event);
          event.preventDefault();
          event.stopPropagation();
          stepBy(event.key === "ArrowUp" ? 1 : -1, event);
        }
        let inputElement: Dynamic = inputElementRef.current;
        keepSelectionRef.current = true;
        setTimeout((): Dynamic => {
          !keepSelectionRef.current ||
            !inputElement ||
            ((keepSelectionRef.current = false),
            inputElement.ownerDocument.activeElement === inputElement &&
              inputElement.select());
        }, 0);
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        let preventBaseUIHandler: Dynamic = event.preventBaseUIHandler;
        preventBaseUIHandler
          ? preventBaseUIHandler.call(event)
          : event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.stopPropagation();
    },
    scrubBaseValue: Dynamic =
      currentValue ??
      (typeof emptyStepFrom == "number" && Number.isFinite(emptyStepFrom)
        ? emptyStepFrom
        : onScrub
          ? placeholderNumber
          : undefined),
    canScrub: Dynamic = !isDisabled && !mixed && scrubBaseValue !== undefined,
    [scrubPreview, setScrubPreview]: Dynamic = (0,
    reactPropertiesToolOptions.useState)(null),
    startScrub: Dynamic = useNumericScrub({
      value: scrubBaseValue ?? NaN,
      step: step,
      min: minValue,
      max: max,
      origin: scrubOrigin,
      disabled: !canScrub,
      onScrub: (scrubbedValue?: Dynamic): Dynamic => {
        setScrubPreview(
          (previousPreview?: Dynamic): Dynamic => ({
            from: previousPreview ? previousPreview.from : currentValue,
            v: scrubbedValue,
            hostMoved:
              !!previousPreview &&
              (previousPreview.hostMoved || !Object.is(currentValue, previousPreview.from)),
          }),
        );
        (onScrub ?? onValue)(scrubbedValue);
      },
      onScrubEnd: (): Dynamic => {
        setScrubPreview(null);
        onScrubEnd?.();
      },
    }),
    handleScrubMouseDown: Dynamic = (event?: Dynamic): Dynamic => {
      startScrub(event);
      event.stopPropagation();
    },
    focusInput: Dynamic = (): Dynamic => {
      let inputElement: Dynamic = inputElementRef.current;
      if (inputElement) {
        skipNextCommitRef.current = false;
        if (inputElement.ownerDocument.activeElement === inputElement) {
          isProgrammaticBlurRef.current = true;
          try {
            inputElement.blur();
          } finally {
            isProgrammaticBlurRef.current = false;
          }
        }
        inputElement.focus({
          preventScroll: true,
        });
      }
    },
    stepBy: Dynamic = (direction?: Dynamic, modifiers?: Dynamic): Dynamic => {
      let displayedText: Dynamic =
          effectiveValue === undefined || mixed
            ? ""
            : numericInputFormatter.format(effectiveValue),
        consumeSkipFlag: Dynamic = (): Dynamic =>
          skipNextCommitRef.current
            ? ((skipNextCommitRef.current = false), (typedLettersRef.current = ""), true)
            : false;
      if (consumeSkipFlag()) return;
      let inputElement: Dynamic = inputElementRef.current;
      inputElement &&
        inputElement.ownerDocument.activeElement === inputElement &&
        inputElement.value !== displayedText &&
        focusInput();
      if (consumeSkipFlag()) return;
      typedLettersRef.current = "";
      let typedText: Dynamic = inputElementRef.current?.value ?? "",
        parsedTyped: Dynamic =
          typedText !== displayedText ? Number.parseFloat(typedText) : Number.NaN,
        isTypedEmpty: Dynamic = mixed || typedText.trim() === "";
      if (isTypedEmpty && !Number.isFinite(parsedTyped) && emptyStepFrom === null)
        return;
      let baseValue: Dynamic = Number.isFinite(parsedTyped)
          ? parsedTyped
          : isTypedEmpty
            ? (emptyStepFrom ?? minValue ?? 0)
            : (effectiveValue ?? 0),
        stepAmount: Dynamic = modifiers.altKey
          ? fineStep
          : stepSize * (modifiers.shiftKey ? 10 : 1),
        decimalPlaces: Dynamic = Math.min(
          20,
          Math.max(
            numericInputDecimalPlaces(baseValue),
            numericInputDecimalPlaces(stepSize),
            modifiers.altKey
              ? numericInputDecimalPlaces(fineStep)
              : 0,
          ),
        ),
        steppedValue: Dynamic = Number(
          (baseValue + direction * stepAmount).toFixed(decimalPlaces),
        );
      minValue !== undefined && (steppedValue = Math.max(minValue, steppedValue));
      max !== undefined && (steppedValue = Math.min(max, steppedValue));
      (mixed || steppedValue !== effectiveValue) && onValue(steppedValue);
    },
    inputProps: Dynamic = {
      ref: setInputRef,
      value: mixed
        ? null
        : ((scrubPreview && !scrubPreview.hostMoved && Object.is(scrubPreview.from, currentValue)
            ? scrubPreview.v
            : effectiveValue) ?? null),
      onValueCommitted: commitValue,
      min: minValue,
      max: max,
      step: stepSize,
      largeStep: stepSize * 10,
      smallStep: fineStep,
      format: PropertiesNumericScrubberUseGroupingConfig,
      locale: "en-US",
      inputMode: "decimal",
      "aria-label": accessibleName,
      disabled: isDisabled,
      placeholder: mixed ? MixedValue : (placeholder ?? hint),
      onKeyDown: handleKeyDown,
      onFocus: (event?: Dynamic): Dynamic => {
        event.preventDefault();
        event.currentTarget.select();
        typedLettersRef.current = "";
      },
    },
    showSteppers: Dynamic = steppers;
  return (
    <NumberInput
      {...inputProps}
      title={title}
      fullWidth={fullWidth}
      className={joinClassNames(
        "group/field min-w-12",
        !mixed &&
          placeholderNumber === undefined &&
          placeholder !== undefined &&
          placeholder !== MixedValue &&
          "[&_input]:placeholder:text-primary",
        className,
      )}
      slotStart={
        prefix !== undefined && prefix !== "" ? (
          <span
            data-scrub={""}
            onMouseDown={canScrub ? handleScrubMouseDown : undefined}
            onPointerDown={
              canScrub ? captureNumericPointer : undefined
            }
            className={joinClassNames(
              PropertiesNumericScrubberClassNames,
              "inline-flex items-center text-caption-medium",
              canScrub && "cursor-ew-resize",
            )}
          >
            {prefix}
          </span>
        ) : undefined
      }
      slotEnd={
        hasUnit || showSteppers ? (
          <span className={"flex items-center gap-2"}>
            {hasUnit ? (<span
                data-scrub={""}
                onMouseDown={canScrub && unitScrubs ? handleScrubMouseDown : undefined}
                onPointerDown={
                  canScrub && unitScrubs
                    ? captureNumericPointer
                    : undefined
                }
                className={joinClassNames(
                  PropertiesNumericScrubberResolvedValue,
                  canScrub && unitScrubs && "cursor-ew-resize",
                )}
              >
                {unit}
              </span>) : (null)}
            {showSteppers ? (<span
                className={
                  "hidden flex-col group-focus-within/field:flex pointer-coarse:hidden!"
                }
              >
                <button
                  type={"button"}
                  tabIndex={-1}
                  aria-label={
                    accessibleName ? (((IncreaseValue) + (" ")) + (accessibleName)) : (IncreaseValue)
                  }
                  className={PropertiesNumericScrubberClassNames_2}
                  disabled={isDisabled}
                  onMouseDown={(event?: Dynamic): Dynamic => {
                    event.preventDefault();
                    event.button === 0 && focusInput();
                  }}
                  onMouseLeave={(): Dynamic => (skipNextCommitRef.current = false)}
                  onClick={(event?: Dynamic): Dynamic => stepBy(1, event)}
                >
                  <EditorIcon name={"CaretUp"} size={12} />
                </button>
                <button
                  type={"button"}
                  tabIndex={-1}
                  aria-label={
                    accessibleName ? (((DecreaseValue) + (" ")) + (accessibleName)) : (DecreaseValue)
                  }
                  className={PropertiesNumericScrubberClassNames_2}
                  disabled={isDisabled}
                  onMouseDown={(event?: Dynamic): Dynamic => {
                    event.preventDefault();
                    event.button === 0 && focusInput();
                  }}
                  onMouseLeave={(): Dynamic => (skipNextCommitRef.current = false)}
                  onClick={(event?: Dynamic): Dynamic => stepBy(-1, event)}
                >
                  <EditorIcon name={"CaretDown"} size={12} />
                </button>
              </span>) : (null)}
          </span>
        ) : undefined
      }
    />
  );
}
export {
  jsxPropertiesNumericInput,
  NumericInput,
  PropertiesNumericInputLimit,
  reactPropertiesNumericInput,
};
export function installEditorPropertiesNumericInput(): () => void {
  return () => {
    reactPropertiesNumericInput = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializeCdsIndex();
    jsxPropertiesNumericInput = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesNumericInputLimit = 12;
  };
}

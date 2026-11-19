import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { TextInput } from "../../cds/components/text-input";
import { cn } from "../../cds/theme/class-names";
import { classifyStyleValue, formatCssNumber, getFineUnitStep, parseCssNumber, roundCssNumber } from "../css/values";
import { PropertyCssTextRow } from "./css-value-row";
import { reactPropertiesDropShadowEditor_2 } from "./drop-shadow-editor";
import { inspectorFieldDisplay, Value_6 } from "./inherited-field";
import { useLiveStyleScrub } from "./live-scrub";
import { NumericInput } from "./numeric-input";
import { PropertyRow } from "./row";

function fieldUnitBounds(currentUnit?: Dynamic, spec?: Dynamic): Dynamic {
  let isDefaultUnit: Dynamic = currentUnit === (spec?.unit ?? "");
  return {
    min: isDefaultUnit
      ? spec?.min
      : spec?.min != null && spec.min >= 0
        ? 0
        : undefined,
    max: isDefaultUnit ? spec?.max : spec?.max === 0 ? 0 : undefined,
  };
}
function PropertyTextInput({
  display: display,
  placeholder: placeholder,
  hint: hint,
  title: title,
  disabled: isDisabled,
  fullWidth: fullWidth,
  className: className,
  "aria-label": ariaLabel,
  onCommitText: onCommitText,
  onArrowStep: onArrowStep,
}: Dynamic): Dynamic {
  useUiLocale();
  let [text, setText]: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useState)(display),
    isFocusedRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    ),
    isCancelledRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    ),
    arrowCommittedTextRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      null,
    ),
    isEditedRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    );
  (0, reactPropertiesDropShadowEditor_2.useEffect)((): Dynamic => {
    (!isFocusedRef.current || !isEditedRef.current) && setText(display);
  }, [display]);
  let hasEmptyPlaceholder: Dynamic = placeholder === Value_6 || placeholder === "";
  return (
    <TextInput
      type={"text"}
      value={text}
      placeholder={hasEmptyPlaceholder && hint !== undefined ? (hint) : (placeholder)}
      title={title}
      disabled={isDisabled}
      aria-label={ariaLabel}
      fullWidth={fullWidth}
      className={cn(
        placeholder !== "Mixed" &&
          !hasEmptyPlaceholder &&
          "placeholder:text-primary [&_input]:placeholder:text-primary",
        className,
      )}
      onFocus={(event?: Dynamic): Dynamic => {
        isFocusedRef.current = true;
        isEditedRef.current = false;
        event.target.select();
      }}
      onChange={(event?: Dynamic): Dynamic => {
        arrowCommittedTextRef.current = null;
        isEditedRef.current = true;
        setText(event.target.value);
      }}
      onBlur={(): Dynamic => {
        isFocusedRef.current = false;
        let wasCancelled: Dynamic = isCancelledRef.current;
        isCancelledRef.current = false;
        let wasEdited: Dynamic = isEditedRef.current;
        isEditedRef.current = false;
        let wasArrowCommitted: Dynamic = arrowCommittedTextRef.current === text;
        arrowCommittedTextRef.current = null;
        wasEdited &&
          !wasCancelled &&
          !wasArrowCommitted &&
          text !== display &&
          onCommitText(text);
        setText(display);
      }}
      onKeyDown={(event?: Dynamic): Dynamic => {
        if (event.key === "Enter" || event.key === "Escape") {
          event.key === "Escape" &&
            ((isCancelledRef.current = true), setText(display));
          event.target.blur();
          return;
        }
        if (
          onArrowStep &&
          (event.key === "ArrowUp" || event.key === "ArrowDown")
        ) {
          if (event.metaKey || event.ctrlKey || event.nativeEvent.isComposing)
            return;
          let steppedText: Dynamic = onArrowStep(
            text,
            event.key === "ArrowUp" ? 1 : -1,
            event,
          );
          if (steppedText == null) return;
          event.preventDefault();
          arrowCommittedTextRef.current = steppedText;
          isEditedRef.current = true;
          setText(steppedText);
          onCommitText(steppedText);
          let target: Dynamic = event.target;
          requestAnimationFrame((): Dynamic => target.select());
        }
      }}
    />
  );
}
function useFieldNumericArrowStep(props?: Dynamic): Dynamic {
  let { text: text, isLiteral: isLiteral }: Dynamic = inspectorFieldDisplay(props.state),
    isNumeric: Dynamic =
      !text ||
      (isLiteral && parseCssNumber(text) != null) ||
      (classifyStyleValue(text).kind === "var" &&
        parseCssNumber(props.state.fallback) != null),
    containerRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      null,
    ),
    hasFocusRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    ),
    wasNumericRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      isNumeric,
    );
  (0,
  reactPropertiesDropShadowEditor_2.useLayoutEffect)((): Dynamic => {
    if (
      wasNumericRef.current === isNumeric ||
      ((wasNumericRef.current = isNumeric), !hasFocusRef.current)
    )
      return;
    let inputElement: Dynamic = containerRef.current?.querySelector(
      'input:not([aria-hidden="true"])',
    );
    inputElement?.focus();
    inputElement?.select();
  }, [isNumeric]);
  return (
    <div
      ref={containerRef}
      className={"contents"}
      onFocusCapture={(): Dynamic => (hasFocusRef.current = true)}
      onBlurCapture={(blurEvent?: Dynamic): Dynamic => {
        containerRef.current?.contains(blurEvent.relatedTarget) ||
          (hasFocusRef.current = false);
      }}
    >
      {isNumeric ? (<PropertyCssNumberRow {...props} />) : (<PropertyCssTextRow {...props} />)}
    </div>
  );
}
function PropertyCssNumberRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let { text: text, placeholder: placeholderText }: Dynamic = inspectorFieldDisplay(state),
    spec: Dynamic = state.spec,
    isVar: Dynamic =
      !!text && classifyStyleValue(text).kind === "var",
    parsedValue: Dynamic =
      text && !isVar ? parseCssNumber(text) : null,
    displayNumber: Dynamic = parseCssNumber(
      isVar ? (state.fallback ?? "") : placeholderText,
    );
  if (!displayNumber && placeholderText && !state.mixed) {
    let scrubStart: Dynamic =
      spec?.scrubFrom ??
      parseCssNumber(spec?.defaultValue)?.value;
    scrubStart != null &&
      (displayNumber = {
        value: scrubStart,
        unit: spec?.unit ?? "",
      });
  }
  let isPointerDownRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    ),
    unit: Dynamic =
      parsedValue != null
        ? parsedValue.unit || spec?.unit || ""
        : spec?.unit === ""
          ? ""
          : displayNumber?.unit || spec?.unit || "",
    isFallbackUnit: Dynamic = displayNumber != null && displayNumber.unit === unit,
    isDefaultUnit: Dynamic = unit === (spec?.unit ?? ""),
    hasFineUnitStep: Dynamic =
      getFineUnitStep(unit, undefined) != null,
    step: Dynamic = isDefaultUnit ? (spec?.step ?? 1) : hasFineUnitStep ? 0.1 : 1,
    smallStep: Dynamic =
      unit === "" && Number.isInteger(step) && step >= 1
        ? step
        : hasFineUnitStep
          ? 0.01
          : undefined,
    bounds: Dynamic = fieldUnitBounds(unit, spec),
    currentNumber: Dynamic =
      state.mixed || parsedValue == null
        ? undefined
        : state.varSource
          ? roundCssNumber(parsedValue.value, unit)
          : parsedValue.value,
    commitScrubbed: Dynamic = (scrubbedNumber?: Dynamic): Dynamic =>
      onCommit(state.prop, formatCssNumber(scrubbedNumber, unit)),
    commitNumber: Dynamic = (nextNumber?: Dynamic): Dynamic => {
      let formattedValue: Dynamic = formatCssNumber(nextNumber, unit);
      formattedValue !== (state.varSource ?? state.value ?? "") &&
        onCommit(state.prop, formattedValue);
    },
    fallbackNumber: Dynamic = isFallbackUnit
      ? roundCssNumber(displayNumber.value, displayNumber.unit)
      : (spec?.scrubFrom ?? 0),
    { start: startScrub, live: liveValue }: Dynamic = useLiveStyleScrub({
      value: currentNumber ?? fallbackNumber ?? 0,
      step: isDefaultUnit
        ? getFineUnitStep(unit, spec?.scrub)
        : hasFineUnitStep
          ? 0.01
          : 1,
      min: bounds.min,
      max: bounds.max,
      disabled: state.disabled || state.mixed,
      onScrub: commitScrubbed,
    }),
    scrubLabelProps: Dynamic =
      state.disabled || state.mixed
        ? undefined
        : {
            onPointerDown: (pointerEvent?: Dynamic): Dynamic => {
              isPointerDownRef.current = true;
              try {
                startScrub(pointerEvent);
              } finally {
                isPointerDownRef.current = false;
              }
            },
            className: "cursor-ew-resize touch-none",
          };
  return (
    <PropertyRow {...shell} labelProps={scrubLabelProps}>
      <NumericInput
        value={liveValue ?? currentNumber}
        mixed={state.mixed && liveValue == null}
        placeholder={
          displayNumber ? (String(roundCssNumber(displayNumber.value, displayNumber.unit)) + isFallbackUnit ? "" : displayNumber.unit) : (placeholderText === Value_6 ? (undefined) : (placeholderText))
        }
        hint={Value_6}
        unit={
          unit && !state.mixed && (parsedValue != null || displayNumber != null)
            ? unit
            : undefined
        }
        unitScrubs={false}
        refuseLetters={true}
        ownUnit={unit}
        step={step}
        smallStep={smallStep}
        min={bounds.min}
        max={bounds.max}
        emptyStepFrom={state.mixed ? null : (currentNumber ?? fallbackNumber)}
        clearable={true}
        title={spec?.hint}
        aria-label={state.label}
        disabled={state.disabled}
        onValue={(nextNumber?: Dynamic): Dynamic => {
          if (nextNumber === undefined) {
            if (isPointerDownRef.current) return;
            onCommit(state.prop, null);
          } else commitNumber(nextNumber);
        }}
      />
    </PropertyRow>
  );
}
export {
  fieldUnitBounds,
  PropertyCssNumberRow,
  PropertyTextInput,
  useFieldNumericArrowStep,
};
export function installEditorPropertiesCssNumberRow(): () => void {
  return () => {};
}

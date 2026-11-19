import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseCssTransform, serializeCssTransform } from "../css/transforms";
import { getFineUnitStep, roundCssNumber } from "../css/values";
import { PropertyCssTextRow } from "./css-value-row";
import { useStyleCommitScrub } from "./live-scrub";
import { NumericInput } from "./numeric-input";
import { PropertyRow } from "./row";

var PropertiesTransformRowRowColumnRowReverseConfig: Dynamic;
function TransformAxisRow({
  label: label,
  name: name,
  value: currentValue,
  unit: unit,
  step: step,
  mixed: mixed,
  disabled: isDisabled,
  onChange: onChange,
}: Dynamic): Dynamic {
  useUiLocale();
  let displayStep: Dynamic =
      getFineUnitStep(unit, undefined) != null ? 0.1 : step,
    commitScrub: Dynamic = useStyleCommitScrub(
      (newValue?: Dynamic): Dynamic =>
        onChange({
          value: newValue,
          unit: unit,
        }),
    );
  return (
    <div className={"min-w-[4.25rem] flex-1 basis-[4.25rem]"}>
      <NumericInput
        value={mixed ? undefined : roundCssNumber(currentValue, unit)}
        mixed={mixed}
        prefix={label}
        unit={unit && unit !== "px" && unit !== "deg" ? unit : undefined}
        refuseLetters={true}
        ownUnit={unit}
        step={displayStep}
        smallStep={displayStep === 0.1 ? 0.01 : undefined}
        emptyStepFrom={mixed ? null : undefined}
        steppers={false}
        aria-label={name}
        disabled={isDisabled}
        onValue={(enteredValue?: Dynamic): Dynamic => {
          enteredValue === undefined ||
            (!mixed && enteredValue === currentValue) ||
            onChange({
              value: enteredValue,
              unit: unit,
            });
        }}
        onScrub={mixed ? undefined : commitScrub.onScrub}
        onScrubEnd={commitScrub.onScrubEnd}
      />
    </div>
  );
}
function PropertyTransformRow({
  state: propertyState,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let transformText: Dynamic = propertyState.mixed ? "" : (propertyState.value ?? ""),
    parsedTransform: Dynamic = parseCssTransform(transformText);
  if (!parsedTransform)
    return (
      <PropertyCssTextRow
        state={propertyState}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let commitTransform: Dynamic = (nextTransform?: Dynamic): Dynamic => {
    let serializedTransform: Dynamic = serializeCssTransform(nextTransform);
    (!propertyState.mixed && serializedTransform === transformText) ||
      onCommit(propertyState.prop, serializedTransform || (propertyState.inheritedFrom ? "none" : null));
  };
  return (
    <PropertyRow {...shell} className={"items-start"}>
      <div className={"flex min-w-0 flex-1 flex-wrap gap-2"}>
        <TransformAxisRow
          label={"X"}
          name={"Move X"}
          value={parsedTransform.x.value}
          unit={parsedTransform.x.unit || "px"}
          step={1}
          mixed={propertyState.mixed}
          disabled={propertyState.disabled}
          onChange={(nextX?: Dynamic): Dynamic =>
            commitTransform({
              ...parsedTransform,
              x: nextX,
            })
          }
        />
        <TransformAxisRow
          label={"Y"}
          name={"Move Y"}
          value={parsedTransform.y.value}
          unit={parsedTransform.y.unit || "px"}
          step={1}
          mixed={propertyState.mixed}
          disabled={propertyState.disabled}
          onChange={(nextY?: Dynamic): Dynamic =>
            commitTransform({
              ...parsedTransform,
              y: nextY,
            })
          }
        />
        <TransformAxisRow
          label={"\u2220"}
          name={"Rotate"}
          value={parsedTransform.rotate.value}
          unit={parsedTransform.rotate.unit || "deg"}
          step={1}
          mixed={propertyState.mixed}
          disabled={propertyState.disabled}
          onChange={(nextRotate?: Dynamic): Dynamic =>
            commitTransform({
              ...parsedTransform,
              rotate: nextRotate,
            })
          }
        />
        <TransformAxisRow
          label={"\u2922x"}
          name={"Scale X"}
          value={parsedTransform.scaleX}
          unit={""}
          step={0.01}
          mixed={propertyState.mixed}
          disabled={propertyState.disabled}
          onChange={(nextScaleX?: Dynamic): Dynamic =>
            commitTransform({
              ...parsedTransform,
              scaleX: nextScaleX.value,
            })
          }
        />
        <TransformAxisRow
          label={"\u2922y"}
          name={"Scale Y"}
          value={parsedTransform.scaleY}
          unit={""}
          step={0.01}
          mixed={propertyState.mixed}
          disabled={propertyState.disabled}
          onChange={(nextScaleY?: Dynamic): Dynamic =>
            commitTransform({
              ...parsedTransform,
              scaleY: nextScaleY.value,
            })
          }
        />
      </div>
    </PropertyRow>
  );
}
export {
  PropertiesTransformRowRowColumnRowReverseConfig,
  PropertyTransformRow,
  TransformAxisRow,
};
export function installEditorPropertiesTransformRow(): () => void {
  return () => {
    PropertiesTransformRowRowColumnRowReverseConfig = {
      row: "ArrowRight",
      column: "ArrowDown",
      "row-reverse": "ArrowLeft",
      "column-reverse": "ArrowUp",
    };
  };
}

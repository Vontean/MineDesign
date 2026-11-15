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
  value: value,
  unit: unit,
  step: step,
  mixed: mixed,
  disabled: disabled2,
  onChange: onChange,
}: Dynamic): Dynamic {
  useUiLocale();
  let value2: Dynamic =
      (0, getFineUnitStep)(unit, undefined) != null ? 0.1 : step,
    value3: Dynamic = (0, useStyleCommitScrub)(
      (input?: Dynamic): Dynamic =>
        onChange({
          value: input,
          unit: unit,
        }),
    );
  return (
    <div className={"min-w-[4.25rem] flex-1 basis-[4.25rem]"}>
      <NumericInput
        value={mixed ? undefined : (0, roundCssNumber)(value, unit)}
        mixed={mixed}
        prefix={label}
        unit={unit && unit !== "px" && unit !== "deg" ? unit : undefined}
        refuseLetters={true}
        ownUnit={unit}
        step={value2}
        smallStep={value2 === 0.1 ? 0.01 : undefined}
        emptyStepFrom={mixed ? null : undefined}
        steppers={false}
        aria-label={name}
        disabled={disabled2}
        onValue={(input?: Dynamic): Dynamic => {
          input === undefined ||
            (!mixed && input === value) ||
            onChange({
              value: input,
              unit: unit,
            });
        }}
        onScrub={mixed ? undefined : value3.onScrub}
        onScrubEnd={value3.onScrubEnd}
      />
    </div>
  );
}
function PropertyTransformRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = state.mixed ? "" : (state.value ?? ""),
    value2: Dynamic = (0, parseCssTransform)(value);
  if (!value2)
    return (
      <PropertyCssTextRow
        state={state}
        onCommit={onCommit}
        shell={shell}
      />
    );
  let callback: Dynamic = (input?: Dynamic): Dynamic => {
    let value3: Dynamic = (0, serializeCssTransform)(input);
    (!state.mixed && value3 === value) ||
      onCommit(state.prop, value3 || (state.inheritedFrom ? "none" : null));
  };
  return (
    <PropertyRow {...shell} className={"items-start"}>
      <div className={"flex min-w-0 flex-1 flex-wrap gap-2"}>
        <TransformAxisRow
          label={"X"}
          name={"Move X"}
          value={value2.x.value}
          unit={value2.x.unit || "px"}
          step={1}
          mixed={state.mixed}
          disabled={state.disabled}
          onChange={(input?: Dynamic): Dynamic =>
            callback({
              ...value2,
              x: input,
            })
          }
        />
        <TransformAxisRow
          label={"Y"}
          name={"Move Y"}
          value={value2.y.value}
          unit={value2.y.unit || "px"}
          step={1}
          mixed={state.mixed}
          disabled={state.disabled}
          onChange={(input?: Dynamic): Dynamic =>
            callback({
              ...value2,
              y: input,
            })
          }
        />
        <TransformAxisRow
          label={"\u2220"}
          name={"Rotate"}
          value={value2.rotate.value}
          unit={value2.rotate.unit || "deg"}
          step={1}
          mixed={state.mixed}
          disabled={state.disabled}
          onChange={(input?: Dynamic): Dynamic =>
            callback({
              ...value2,
              rotate: input,
            })
          }
        />
        <TransformAxisRow
          label={"\u2922x"}
          name={"Scale X"}
          value={value2.scaleX}
          unit={""}
          step={0.01}
          mixed={state.mixed}
          disabled={state.disabled}
          onChange={(input?: Dynamic): Dynamic =>
            callback({
              ...value2,
              scaleX: input.value,
            })
          }
        />
        <TransformAxisRow
          label={"\u2922y"}
          name={"Scale Y"}
          value={value2.scaleY}
          unit={""}
          step={0.01}
          mixed={state.mixed}
          disabled={state.disabled}
          onChange={(input?: Dynamic): Dynamic =>
            callback({
              ...value2,
              scaleY: input.value,
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

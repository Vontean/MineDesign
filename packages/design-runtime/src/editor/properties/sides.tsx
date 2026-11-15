import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { initializeCdsIndex } from "../../cds/index";
import { DisabledReasonTooltip } from "../../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { ColorContrastCopyItems, ColorContrastCopyLabel_6, ColorContrastCopyLabel_7, ColorContrastCopyLabel_8, ColorContrastCopyTopRightBottomValues, EditValue, HideValue } from "../color/contrast-copy";
import { NumericInput } from "./numeric-input";
import { EditorIcon } from "./primitives";
import { PropertyRow } from "./row";
import { jsxPropertiesSegments, PropertiesSegmentsItems, PropertiesSegmentsSideCornerConfig, reactPropertiesSegments } from "./segments";
import { PropertyOptionIcon } from "./tool-options";
import { PropertiesTooltipNameViewBoxPathsConfig_2, PropertiesTooltipNameViewBoxPathsConfig_4 } from "./tooltip";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesSidesSideTopSideRightSideBottomValues: Dynamic;
var PropertiesSidesCornerTopLeftCornerTopRightCornerBottomRightValues: Dynamic;
var reactPropertiesSides: Dynamic;
var jsxPropertiesSides: Dynamic;
var PropertiesSidesNwNeSeValues: Dynamic;
var PropertiesSidesNESValues: Dynamic;
var PropertiesSidesNESConfig: Dynamic;
var PropertiesSidesNwNeSeConfig: Dynamic;
var PropertiesSidesNSEConfig: Dynamic;
var PropertiesSidesConstant: Dynamic;
var RESIZE_HANDLE_HIT_SIZE_PX: Dynamic;
var RESIZE_HANDLE_LENGTH_PX: Dynamic;
var RESIZE_HANDLE_THICKNESS_PX: Dynamic;
var RESIZE_EDGE_MIN_LENGTH_PX: Dynamic;
var PropertiesSidesConstant_2: Dynamic;
var PropertiesSidesConstant_3: Dynamic;
var PropertiesSidesArrowLeftArrowRightArrowUpConfig: Dynamic;
function PropertySidesRow({
  label: label,
  kind = "side",
  values: values,
  placeholders: placeholders,
  unit = "px",
  min: min2,
  max: max,
  step: step,
  smallStep: smallStep,
  mixed: mixed,
  disabled: disabled2,
  toggleDisabledReason: toggleDisabledReason,
  onSides: onSides,
  onScrubSides: onScrubSides,
  onScrubEnd: onScrubEnd,
  onReset: onReset,
  title: title,
  description: description,
  icon: icon,
  expandLabel: expandLabel,
  partLabels: partLabels,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic =
      expandLabel ??
      (kind === "corner"
        ? ColorContrastCopyLabel_7
        : ColorContrastCopyLabel_6),
    value2: Dynamic =
      partLabels ??
      (kind === "corner"
        ? ColorContrastCopyItems
        : ColorContrastCopyTopRightBottomValues),
    value3: Dynamic =
      icon ??
      (kind === "corner"
        ? PropertiesTooltipNameViewBoxPathsConfig_4
        : PropertiesTooltipNameViewBoxPathsConfig_2),
    value4: Dynamic = values.map(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        input !== undefined ? String(input) : (placeholders?.[options] ?? ""),
    ),
    value5: Dynamic =
      values.some((input?: Dynamic): Dynamic => input !== undefined) &&
      values.every(
        (input?: Dynamic): Dynamic =>
          input !== undefined && input === values[0],
      ),
    value6: Dynamic = value4.every(
      (input?: Dynamic): Dynamic => input === value4[0],
    ),
    value7: Dynamic = !mixed && !value6 && !value5,
    [value8, value9]: Dynamic = (0, reactPropertiesSegments.useState)(
      value7,
    );
  value7 && !value8 && value9(true);
  let value10: Dynamic = mixed || !value5 ? undefined : values[0],
    value11: Dynamic = mixed || value7 ? undefined : value4[0],
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      if (mixed) return null;
      let value16: Dynamic =
        input === undefined || input.trim() === "" ? NaN : Number(input);
      return Number.isFinite(value16) ? value16 : undefined;
    },
    value12: Dynamic = label.toLowerCase(),
    value13: Dynamic = (0, reactPropertiesSegments.useRef)([]),
    value14: Dynamic =
      onScrubSides &&
      ((input?: Dynamic): Dynamic => {
        value13.current = input;
        onScrubSides(input);
      }),
    callback2: Dynamic = (): Dynamic => {
      let current: Dynamic = value13.current;
      value13.current = [];
      onScrubEnd?.(current);
    },
    value15: Dynamic = (
      <DisabledReasonTooltip
        reason={
          toggleDisabledReason ??
          (!disabled2 && value7 && value8
            ? ColorContrastCopyLabel_8
            : undefined)
        }
        wrapperClassName={"shrink-0"}
      >
        <Button
          variant={"ghost"}
          iconOnly={true}
          icon={<PropertyOptionIcon icon={value3} />}
          aria-label={
            (value8 ? HideValue : EditValue) + " " + value12 + " " + value.toLowerCase()
          }
          pressed={value8}
          disabled={
            disabled2 ||
            (value7 && value8) ||
            toggleDisabledReason !== undefined
          }
          data-testid={dataTestid ? dataTestid + "-toggle" : undefined}
          onClick={(): Dynamic =>
            value9((input?: Dynamic): Dynamic => !input)
          }
          className={"shrink-0"}
        />
      </DisabledReasonTooltip>
    );
  return (
    <jsxPropertiesSegments.Fragment>
      <PropertyRow
        label={label}
        title={title}
        description={description}
        onReset={onReset}
        disabled={disabled2}
        data-testid={dataTestid}
        onPress={(element?: Dynamic): Dynamic =>
          element.querySelector("input")?.focus()
        }
        trailing={value15}
      >
        <NumericInput
          aria-label={label}
          value={value10}
          placeholder={value11}
          hint={value7 ? value : undefined}
          unit={unit}
          min={min2}
          max={max}
          step={step}
          smallStep={smallStep}
          mixed={mixed}
          clearable={true}
          refuseLetters={true}
          disabled={disabled2}
          emptyStepFrom={value7 ? null : callback(value4[0])}
          onValue={(input?: Dynamic): Dynamic =>
            onSides(
              PropertiesSegmentsItems.map(
                (input2?: Dynamic): Dynamic => ({
                  side: input2,
                  value: input,
                }),
              ),
            )
          }
          onScrub={
            value14 &&
            ((input?: Dynamic): Dynamic =>
              value14(
                PropertiesSegmentsItems.map(
                  (input2?: Dynamic): Dynamic => ({
                    side: input2,
                    value: input,
                  }),
                ),
              ))
          }
          onScrubEnd={callback2}
        />
      </PropertyRow>
      {value8 ? (<PropertyRow
          label={""}
          title={title}
          disabled={disabled2}
          data-testid={dataTestid ? dataTestid + "-parts" : undefined}
        >
          <div className={"grid min-w-0 flex-1 grid-cols-2 gap-2"}>
            {PropertiesSegmentsSideCornerConfig[kind].map(
              (input?: Dynamic): Dynamic => (
                <NumericInput
                  key={input}
                  aria-label={((label) + (" ")) + (value2[input].toLowerCase())}
                  title={value2[input]}
                  prefix={<PropertySideGlyph kind={kind} index={input} />}
                  value={mixed ? undefined : values[input]}
                  placeholder={
                    mixed ? (undefined) : (placeholders?.[input] ?? (""))
                  }
                  emptyStepFrom={callback(placeholders?.[input])}
                  mixed={mixed}
                  min={min2}
                  max={max}
                  step={step}
                  smallStep={smallStep}
                  clearable={true}
                  refuseLetters={true}
                  ownUnit={unit}
                  steppers={false}
                  disabled={disabled2}
                  onValue={(input2?: Dynamic): Dynamic =>
                    onSides([
                      {
                        side: input,
                        value: input2,
                      },
                    ])
                  }
                  onScrub={
                    value14 &&
                    ((input2?: Dynamic): Dynamic =>
                      value14([
                        {
                          side: input,
                          value: input2,
                        },
                      ]))
                  }
                  onScrubEnd={callback2}
                />
              ),
            )}
          </div>
        </PropertyRow>) : (null)}
    </jsxPropertiesSegments.Fragment>
  );
}
function PropertyCornersRow(input?: Dynamic): Dynamic {
  useUiLocale();
  return <PropertySidesRow {...input} kind={"corner"} />;
}
function PropertySideGlyph({ kind: kind, index: index }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <EditorIcon
      name={
        (kind === "corner"
          ? PropertiesSidesCornerTopLeftCornerTopRightCornerBottomRightValues
          : PropertiesSidesSideTopSideRightSideBottomValues)[index]
      }
      size={16}
    />
  );
}
export {
  jsxPropertiesSides,
  PropertiesSidesArrowLeftArrowRightArrowUpConfig,
  PropertiesSidesConstant,
  PropertiesSidesConstant_2,
  PropertiesSidesConstant_3,
  PropertiesSidesCornerTopLeftCornerTopRightCornerBottomRightValues,
  PropertiesSidesNESConfig,
  PropertiesSidesNESValues,
  PropertiesSidesNSEConfig,
  PropertiesSidesNwNeSeConfig,
  PropertiesSidesNwNeSeValues,
  PropertiesSidesSideTopSideRightSideBottomValues,
  PropertyCornersRow,
  PropertySideGlyph,
  PropertySidesRow,
  reactPropertiesSides,
  RESIZE_EDGE_MIN_LENGTH_PX,
  RESIZE_HANDLE_HIT_SIZE_PX,
  RESIZE_HANDLE_LENGTH_PX,
  RESIZE_HANDLE_THICKNESS_PX,
};
export function installEditorPropertiesSides(): () => void {
  return () => {
    PropertiesSidesSideTopSideRightSideBottomValues = [
      "SideTop",
      "SideRight",
      "SideBottom",
      "SideLeft",
    ];
    PropertiesSidesCornerTopLeftCornerTopRightCornerBottomRightValues = [
      "CornerTopLeft",
      "CornerTopRight",
      "CornerBottomRight",
      "CornerBottomLeft",
    ];
    reactPropertiesSides = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    jsxPropertiesSides = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    PropertiesSidesNwNeSeValues = ["nw", "ne", "se", "sw"];
    PropertiesSidesNESValues = ["n", "e", "s", "w", "nw", "ne", "se", "sw"];
    PropertiesSidesNESConfig = {
      n: "top edge",
      e: "right edge",
      s: "bottom edge",
      w: "left edge",
      nw: "top left",
      ne: "top right",
      se: "bottom right",
      sw: "bottom left",
    };
    PropertiesSidesNwNeSeConfig = {
      nw: "top left",
      ne: "top right",
      se: "bottom right",
      sw: "bottom left",
    };
    PropertiesSidesNSEConfig = {
      n: "ns-resize",
      s: "ns-resize",
      e: "ew-resize",
      w: "ew-resize",
      nw: "nwse-resize",
      se: "nwse-resize",
      ne: "nesw-resize",
      sw: "nesw-resize",
    };
    PropertiesSidesConstant = 0.005;
    [
      RESIZE_HANDLE_HIT_SIZE_PX,
      RESIZE_HANDLE_LENGTH_PX,
      RESIZE_HANDLE_THICKNESS_PX,
      RESIZE_EDGE_MIN_LENGTH_PX,
    ] = [16, 12, 3, 44];
    PropertiesSidesConstant_2 = 0.35;
    PropertiesSidesConstant_3 = 1.1;
    PropertiesSidesArrowLeftArrowRightArrowUpConfig = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
  };
}

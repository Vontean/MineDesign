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
import { ColorContrastCopyItems, ColorContrastCopyPerSideLabel as perSideLabel, ColorContrastCopyPerCornerLabel as perCornerLabel, ColorContrastCopyValuesDifferLabel as valuesDifferLabel, ColorContrastCopyTopRightBottomValues, EditValue, HideValue } from "../color/contrast-copy";
import { NumericInput } from "./numeric-input";
import { EditorIcon } from "./primitives";
import { PropertyRow } from "./row";
import { jsxPropertiesSegments, PropertiesSegmentsItems, PropertiesSegmentsSideCornerConfig, reactPropertiesSegments } from "./segments";
import { PropertyOptionIcon } from "./tool-options";
import { borderSidesIcon, cornerEachIcon } from "./tooltip";
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
var dimmedMediaOpacity: Dynamic;
var keyboardZoomFactor: Dynamic;
var PropertiesSidesArrowLeftArrowRightArrowUpConfig: Dynamic;
function PropertySidesRow({
  label: label,
  kind = "side",
  values: values,
  placeholders: placeholders,
  unit = "px",
  min: minValue,
  max: max,
  step: step,
  smallStep: smallStep,
  mixed: mixed,
  disabled: isDisabled,
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
  let kindLabel: Dynamic =
      expandLabel ??
      (kind === "corner"
        ? perCornerLabel
        : perSideLabel),
    partNames: Dynamic =
      partLabels ??
      (kind === "corner"
        ? ColorContrastCopyItems
        : ColorContrastCopyTopRightBottomValues),
    toggleIcon: Dynamic =
      icon ??
      (kind === "corner"
        ? cornerEachIcon
        : borderSidesIcon),
    sideTexts: Dynamic = values.map(
      (sideValue?: Dynamic, sideIndex?: Dynamic): Dynamic =>
        sideValue !== undefined ? String(sideValue) : (placeholders?.[sideIndex] ?? ""),
    ),
    allSidesEqual: Dynamic =
      values.some((sideValue?: Dynamic): Dynamic => sideValue !== undefined) &&
      values.every(
        (sideValue?: Dynamic): Dynamic =>
          sideValue !== undefined && sideValue === values[0],
      ),
    allTextsEqual: Dynamic = sideTexts.every(
      (text?: Dynamic): Dynamic => text === sideTexts[0],
    ),
    hasDifferentSides: Dynamic = !mixed && !allTextsEqual && !allSidesEqual,
    [isExpanded, setIsExpanded]: Dynamic = (0, reactPropertiesSegments.useState)(
      hasDifferentSides,
    );
  hasDifferentSides && !isExpanded && setIsExpanded(true);
  let sharedValue: Dynamic = mixed || !allSidesEqual ? undefined : values[0],
    sharedPlaceholder: Dynamic = mixed || hasDifferentSides ? undefined : sideTexts[0],
    parsePlaceholder: Dynamic = (text?: Dynamic): Dynamic => {
      if (mixed) return null;
      let parsed: Dynamic =
        text === undefined || text.trim() === "" ? NaN : Number(text);
      return Number.isFinite(parsed) ? parsed : undefined;
    },
    lowerLabel: Dynamic = label.toLowerCase(),
    scrubbedSidesRef: Dynamic = (0, reactPropertiesSegments.useRef)([]),
    handleScrubSides: Dynamic =
      onScrubSides &&
      ((sides?: Dynamic): Dynamic => {
        scrubbedSidesRef.current = sides;
        onScrubSides(sides);
      }),
    handleScrubEnd: Dynamic = (): Dynamic => {
      let scrubbedSides: Dynamic = scrubbedSidesRef.current;
      scrubbedSidesRef.current = [];
      onScrubEnd?.(scrubbedSides);
    },
    toggleButton: Dynamic = (
      <DisabledReasonTooltip
        reason={
          toggleDisabledReason ??
          (!isDisabled && hasDifferentSides && isExpanded
            ? valuesDifferLabel
            : undefined)
        }
        wrapperClassName={"shrink-0"}
      >
        <Button
          variant={"ghost"}
          iconOnly={true}
          icon={<PropertyOptionIcon icon={toggleIcon} />}
          aria-label={
            (isExpanded ? HideValue : EditValue) + " " + lowerLabel + " " + kindLabel.toLowerCase()
          }
          pressed={isExpanded}
          disabled={
            isDisabled ||
            (hasDifferentSides && isExpanded) ||
            toggleDisabledReason !== undefined
          }
          data-testid={dataTestid ? dataTestid + "-toggle" : undefined}
          onClick={(): Dynamic =>
            setIsExpanded((wasExpanded?: Dynamic): Dynamic => !wasExpanded)
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
        disabled={isDisabled}
        data-testid={dataTestid}
        onPress={(element?: Dynamic): Dynamic =>
          element.querySelector("input")?.focus()
        }
        trailing={toggleButton}
      >
        <NumericInput
          aria-label={label}
          value={sharedValue}
          placeholder={sharedPlaceholder}
          hint={hasDifferentSides ? kindLabel : undefined}
          unit={unit}
          min={minValue}
          max={max}
          step={step}
          smallStep={smallStep}
          mixed={mixed}
          clearable={true}
          refuseLetters={true}
          disabled={isDisabled}
          emptyStepFrom={hasDifferentSides ? null : parsePlaceholder(sideTexts[0])}
          onValue={(enteredValue?: Dynamic): Dynamic =>
            onSides(
              PropertiesSegmentsItems.map(
                (side?: Dynamic): Dynamic => ({
                  side: side,
                  value: enteredValue,
                }),
              ),
            )
          }
          onScrub={
            handleScrubSides &&
            ((scrubbedValue?: Dynamic): Dynamic =>
              handleScrubSides(
                PropertiesSegmentsItems.map(
                  (side?: Dynamic): Dynamic => ({
                    side: side,
                    value: scrubbedValue,
                  }),
                ),
              ))
          }
          onScrubEnd={handleScrubEnd}
        />
      </PropertyRow>
      {isExpanded ? (<PropertyRow
          label={""}
          title={title}
          disabled={isDisabled}
          data-testid={dataTestid ? dataTestid + "-parts" : undefined}
        >
          <div className={"grid min-w-0 flex-1 grid-cols-2 gap-2"}>
            {PropertiesSegmentsSideCornerConfig[kind].map(
              (part?: Dynamic): Dynamic => (
                <NumericInput
                  key={part}
                  aria-label={((label) + (" ")) + (partNames[part].toLowerCase())}
                  title={partNames[part]}
                  prefix={<PropertySideGlyph kind={kind} index={part} />}
                  value={mixed ? undefined : values[part]}
                  placeholder={
                    mixed ? (undefined) : (placeholders?.[part] ?? (""))
                  }
                  emptyStepFrom={parsePlaceholder(placeholders?.[part])}
                  mixed={mixed}
                  min={minValue}
                  max={max}
                  step={step}
                  smallStep={smallStep}
                  clearable={true}
                  refuseLetters={true}
                  ownUnit={unit}
                  steppers={false}
                  disabled={isDisabled}
                  onValue={(partValue?: Dynamic): Dynamic =>
                    onSides([
                      {
                        side: part,
                        value: partValue,
                      },
                    ])
                  }
                  onScrub={
                    handleScrubSides &&
                    ((scrubbedPartValue?: Dynamic): Dynamic =>
                      handleScrubSides([
                        {
                          side: part,
                          value: scrubbedPartValue,
                        },
                      ]))
                  }
                  onScrubEnd={handleScrubEnd}
                />
              ),
            )}
          </div>
        </PropertyRow>) : (null)}
    </jsxPropertiesSegments.Fragment>
  );
}
function PropertyCornersRow(rowProps?: Dynamic): Dynamic {
  useUiLocale();
  return <PropertySidesRow {...rowProps} kind={"corner"} />;
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
  dimmedMediaOpacity,
  keyboardZoomFactor,
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
    reactPropertiesSides = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxPropertiesSides = toModuleNamespace(
      load_react_jsx_runtime(),
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
    dimmedMediaOpacity = 0.35;
    keyboardZoomFactor = 1.1;
    PropertiesSidesArrowLeftArrowRightArrowUpConfig = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
  };
}

import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { TextInput } from "../../cds/components/text-input";
import { initializeCdsIndex } from "../../cds/index";
import { cn } from "../../cds/theme/class-names";
import { load_react_jsx_runtime } from "../../dependencies";
import { formatCssNumber, getFineUnitStep, parseCssNumber, roundCssNumber, stepCssNumber } from "../css/values";
import { normalizePropertyNumber } from "../inspector/property-schema";
import { reactPropertiesAssetPicker_3 } from "./asset-picker";
import { useLiveStyleScrub } from "./live-scrub";
import { PropertyRow } from "./row";
import { PropertySelect } from "./select";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesSizingRowHandler: Dynamic;
var PropertiesSizingRowHandler_2: Dynamic;
var JustifyStartValue: Dynamic;
var JustifyCenterValue: Dynamic;
var JustifyEndValue: Dynamic;
var AlignStartValue: Dynamic;
var AlignCenterValue: Dynamic;
var AlignEndValue: Dynamic;
var JustifySpaceBetweenValue: Dynamic;
var PropertiesSizingRowFlexStartStartCenterConfig: Dynamic;
var alignItemsIcons: Dynamic;
var PropertiesSizingRowTlTrBlConfig: Dynamic;
var PropertiesSizingRowHandlerValue: Dynamic;
var layeredLayoutIcon: Dynamic;
var PropertiesSizingRowLeftHcenterRightConfig: Dynamic;
var jsxPropertiesSizingRow: Dynamic;
function PropertySizingRow({
  shell: shell,
  label: label,
  prop: prop,
  value: sizeValue,
  fallback: fallback,
  disabled: isDisabled,
  mixed: mixed,
  noHug: noHug,
  fixedOnlyReason: fixedOnlyReason,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let [draftText, setDraftText]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(sizeValue ?? ""),
    isFocusedRef: Dynamic = (0, reactPropertiesAssetPicker_3.useRef)(false),
    hasEditedRef: Dynamic = (0, reactPropertiesAssetPicker_3.useRef)(false),
    isCancelingRef: Dynamic = (0, reactPropertiesAssetPicker_3.useRef)(false),
    commitSize: Dynamic = (newSize?: Dynamic): Dynamic =>
      onCommitMany([
        {
          prop: prop,
          value: newSize,
        },
      ]),
    { start: startScrub, live: liveSize }: Dynamic = useLiveStyleScrub(
      {
        value:
          parseCssNumber(sizeValue || fallback || "")?.value ?? 0,
        min: 0,
        disabled: isDisabled,
        onScrub: (scrubbedPx?: Dynamic): Dynamic =>
          commitSize(`${Math.round(scrubbedPx)}px`),
      },
    ),
    fallbackNumber: Dynamic = parseCssNumber(fallback || ""),
    fallbackText: Dynamic = fallbackNumber
      ? formatCssNumber(
          roundCssNumber(fallbackNumber.value, fallbackNumber.unit),
          fallbackNumber.unit,
        )
      : fallback || "auto",
    isShowingFallback: Dynamic = !mixed && !sizeValue && !!fallbackNumber,
    committedText: Dynamic = isShowingFallback ? fallbackText : (sizeValue ?? ""),
    displayText: Dynamic = liveSize != null ? `${Math.round(liveSize)}px` : committedText;
  (!isFocusedRef.current || !hasEditedRef.current) &&
    displayText !== draftText &&
    setDraftText(displayText);
  let isAuto: Dynamic = sizeValue == null || sizeValue === "" || sizeValue === "auto",
    isHug: Dynamic = !mixed && isAuto && !noHug,
    isFill: Dynamic = !mixed && sizeValue === "100%",
    currentPixelSize: Dynamic = (): Dynamic => {
      let currentNumber: Dynamic = parseCssNumber(sizeValue || ""),
        pixelNumber: Dynamic =
          currentNumber && (currentNumber.unit === "px" || currentNumber.unit === "")
            ? currentNumber
            : parseCssNumber(fallback || "");
      return pixelNumber ? `${Math.round(pixelNumber.value)}px` : null;
    },
    sizeMode: Dynamic = mixed
      ? null
      : isFill
        ? "fill"
        : isHug
          ? "hug"
          : "fixed";
  return (
    <PropertyRow
      label={label}
      {...shell}
      labelProps={
        isDisabled
          ? undefined
          : {
              onPointerDown: startScrub,
              className: "cursor-ew-resize touch-none",
            }
      }
    >
      <TextInput
        value={draftText}
        placeholder={mixed ? (uiMessage("inspector.sizingRow.mixed")) : (fallbackText)}
        aria-label={label}
        title={
          !mixed && fallback && fallbackText !== fallback ? (uiMessage("inspector.sizingRow.renderedSizeValue1", { value1: String(fallback) })) : (undefined)
        }
        disabled={isDisabled}
        className={cn(
          !mixed && !isShowingFallback && "placeholder:text-primary",
        )}
        onFocus={(event?: Dynamic): Dynamic => {
          isFocusedRef.current = true;
          hasEditedRef.current = false;
          event.currentTarget.select();
        }}
        onChange={(event?: Dynamic): Dynamic => {
          hasEditedRef.current = true;
          setDraftText(event.target.value);
        }}
        onBlur={(): Dynamic => {
          isFocusedRef.current = false;
          let hadEdit: Dynamic = hasEditedRef.current;
          hasEditedRef.current = false;
          if (isCancelingRef.current) {
            isCancelingRef.current = false;
            setDraftText(committedText);
            return;
          }
          let trimmedText: Dynamic = draftText.trim();
          hadEdit &&
          trimmedText !== (sizeValue ?? "") &&
          !(isShowingFallback && trimmedText === committedText)
            ? commitSize(
                trimmedText
                  ? normalizePropertyNumber(prop, trimmedText)
                  : null,
              )
            : setDraftText(committedText);
        }}
        onKeyDown={(event?: Dynamic): Dynamic => {
          if (event.key === "Enter" || event.key === "Escape") {
            event.key === "Escape" &&
              ((isCancelingRef.current = true), setDraftText(committedText));
            event.target.blur();
            return;
          }
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.nativeEvent.isComposing ||
              mixed
            )
              return;
            let typedText: Dynamic =
                isShowingFallback && !hasEditedRef.current ? "" : draftText.trim(),
              typedNumber: Dynamic = parseCssNumber(typedText);
            if (typedText && !typedNumber) return;
            let baseNumber: Dynamic = parseCssNumber(
                sizeValue || fallback || "",
              ),
              startNumber: Dynamic =
                typedNumber?.value ?? (baseNumber ? Math.round(baseNumber.value) : 0),
              unit: Dynamic = typedNumber?.unit || baseNumber?.unit || "px";
            event.preventDefault();
            let fineStep: Dynamic =
                getFineUnitStep(unit, undefined) != null
                  ? 0.1
                  : 1,
              nextNumber: Dynamic = stepCssNumber(
                startNumber,
                event.key === "ArrowUp" ? 1 : -1,
                event,
                {
                  step: fineStep,
                  unit: unit,
                  min: 0,
                },
              ),
              nextText: Dynamic = formatCssNumber(
                nextNumber,
                unit,
              );
            setDraftText(nextText);
            nextText !== (sizeValue ?? "") &&
              commitSize(normalizePropertyNumber(prop, nextText));
            let target: Dynamic = event.target;
            requestAnimationFrame((): Dynamic => target.select());
          }
        }}
      />
      <PropertySelect
        compact={true}
        aria-label={uiMessage("inspector.sizingRow.mode", { value1: String(label) })}
        data-testid={`dc-size-mode-${prop}`}
        items={
          fixedOnlyReason !== undefined
            ? [
                {
                  value: "fixed",
                  get label() { return uiMessage("inspector.sizingRow.fixed"); },
                },
              ]
            : [
                ...(noHug
                  ? []
                  : [
                      {
                        value: "hug",
                        get label() { return uiMessage("inspector.sizingRow.hug"); },
                      },
                    ]),
                {
                  value: "fixed",
                  get label() { return uiMessage("inspector.sizingRow.fixed"); },
                },
                {
                  value: "fill",
                  get label() { return uiMessage("inspector.sizingRow.fill"); },
                },
              ]
        }
        value={fixedOnlyReason !== undefined ? "fixed" : sizeMode}
        placeholder={uiMessage("inspector.sizingRow.mixed")}
        disabled={isDisabled || fixedOnlyReason !== undefined}
        title={fixedOnlyReason}
        onChange={(mode?: Dynamic): Dynamic => {
          if (mode === "hug") commitSize(null);
          else if (mode === "fill") commitSize("100%");
          else {
            let pixelSize: Dynamic = currentPixelSize();
            pixelSize != null && commitSize(pixelSize);
          }
        }}
      />
    </PropertyRow>
  );
}
export {
  AlignCenterValue,
  AlignEndValue,
  AlignStartValue,
  jsxPropertiesSizingRow,
  JustifyCenterValue,
  JustifyEndValue,
  JustifySpaceBetweenValue,
  JustifyStartValue,
  PropertiesSizingRowFlexStartStartCenterConfig,
  alignItemsIcons as PropertiesSizingRowFlexStartStartCenterConfig_2,
  PropertiesSizingRowHandler,
  PropertiesSizingRowHandler_2,
  PropertiesSizingRowHandlerValue,
  layeredLayoutIcon as PropertiesSizingRowHandlerValue_2,
  PropertiesSizingRowLeftHcenterRightConfig,
  PropertiesSizingRowTlTrBlConfig,
  PropertySizingRow,
};
export function installEditorPropertiesSizingRow(): () => void {
  return () => {
    initializeCdsIndex();
    PropertiesSizingRowHandler = (
      pathData?: Dynamic,
      strokeWidth: Dynamic = 1,
    ): Dynamic => ({
      d: pathData,
      strokeWidth: strokeWidth,
    });
    PropertiesSizingRowHandler_2 = (
      iconName?: Dynamic,
      pathData?: Dynamic,
    ): Dynamic => ({
      name: iconName,
      viewBox: 16,
      paths: [PropertiesSizingRowHandler(pathData)],
    });
    JustifyStartValue = "JustifyStart";
    JustifyCenterValue = "JustifyCenter";
    JustifyEndValue = "JustifyEnd";
    AlignStartValue = "AlignStart";
    AlignCenterValue = "AlignCenter";
    AlignEndValue = "AlignEnd";
    JustifySpaceBetweenValue = "JustifySpaceBetween";
    PropertiesSizingRowFlexStartStartCenterConfig = {
      "flex-start": JustifyStartValue,
      start: JustifyStartValue,
      center: JustifyCenterValue,
      "flex-end": JustifyEndValue,
      end: JustifyEndValue,
      "space-between": JustifySpaceBetweenValue,
      "space-around": PropertiesSizingRowHandler_2(
        "JustifyAround",
        "M2.5 2.5V13.5M13.5 2.5V13.5M6 5V11M10 5V11",
      ),
      "space-evenly": PropertiesSizingRowHandler_2(
        "JustifyEvenly",
        "M2.5 2.5V13.5M13.5 2.5V13.5M6.25 5V11M9.75 5V11M8 7V9",
      ),
      stretch: PropertiesSizingRowHandler_2(
        "JustifyStretch",
        "M2.5 2.5V13.5M13.5 2.5V13.5M4.5 6H11.5M4.5 10H11.5",
      ),
    };
    alignItemsIcons = {
      "flex-start": AlignStartValue,
      start: AlignStartValue,
      center: AlignCenterValue,
      "flex-end": AlignEndValue,
      end: AlignEndValue,
      stretch: "AlignStretch",
      baseline: PropertiesSizingRowHandler_2(
        "AlignItemsBaseline",
        "M2.5 10.5H13.5M5 10.5V5L6.5 5M9.5 10.5V7H11.5V10.5",
      ),
      auto: PropertiesSizingRowHandler_2(
        "AlignAuto",
        "M4 4H6M10 4H12M4 12H6M10 12H12M4 4V6M12 4V6M4 10V12M12 10V12",
      ),
    };
    PropertiesSizingRowTlTrBlConfig = {
      tl: PropertiesSizingRowHandler_2(
        "ConnectorDownRight",
        "M4 4L12 12M12 6.5V12H6.5",
      ),
      tr: PropertiesSizingRowHandler_2(
        "ConnectorDownLeft",
        "M12 4L4 12M4 6.5V12H9.5",
      ),
      bl: PropertiesSizingRowHandler_2(
        "ConnectorUpRight",
        "M4 12L12 4M6.5 4H12V9.5",
      ),
      br: PropertiesSizingRowHandler_2(
        "ConnectorUpLeft",
        "M12 12L4 4M9.5 4H4V9.5",
      ),
    };
    PropertiesSizingRowHandlerValue = PropertiesSizingRowHandler_2(
      "LayoutStack",
      "M2.5 3.5H13.5V12.5H2.5Z M5 6V10M8 6V10M11 6V10",
    );
    layeredLayoutIcon = PropertiesSizingRowHandler_2(
      "LayoutLayered",
      "M3 5H11V11H3Z M5 3H13V9",
    );
    PropertiesSizingRowLeftHcenterRightConfig = {
      left: PropertiesSizingRowHandler_2(
        "ActionAlignLeft",
        "M3.93 3.4V12.58M6.59 10.99H12.17M6.59 7.99H9.48M6.59 4.99H12.17",
      ),
      hcenter: PropertiesSizingRowHandler_2(
        "ActionAlignHCenter",
        "M5.21 10.99H10.79M6.56 7.99H9.44M5.21 4.99H10.79",
      ),
      right: PropertiesSizingRowHandler_2(
        "ActionAlignRight",
        "M12.07 3.4V12.58M3.83 10.99H9.41M6.52 7.99H9.41M3.83 4.99H9.41",
      ),
      top: PropertiesSizingRowHandler_2(
        "ActionAlignTop",
        "M5 6.58V12.16M11 6.58V12.16M8 6.58V9.47M3.41 3.93H12.59",
      ),
      vcenter: PropertiesSizingRowHandler_2(
        "ActionAlignVCenter",
        "M10.99 5.21V10.79M7.99 6.56V9.44M4.99 5.21V10.79",
      ),
      bottom: PropertiesSizingRowHandler_2(
        "ActionAlignBottom",
        "M3.42 12.07H12.6M5.01 3.83V9.41M8.01 6.52V9.41M11.01 3.83V9.41",
      ),
    };
    jsxPropertiesSizingRow = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { SegmentedControl } from "../../cds/components/selection-points";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { ChromePanelCloseClassNames, ChromePanelCloseClassNames_2 } from "../chrome/panel-close";
import { InheritedValue } from "../color/contrast-copy";
import { PropertyRow } from "./row";
import { PropertyOptionIcon } from "./tool-options";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesSegments: Dynamic;
var jsxPropertiesSegments: Dynamic;
var PropertiesSegmentsSideCornerConfig: Dynamic;
var PropertiesSegmentsItems: Dynamic;
function PropertySegments({
  label: label,
  options: segmentOptions,
  value: selectedValue,
  inherited: inherited,
  inheritedHint = InheritedValue,
  onChange: onChange,
  disabled: isDisabled,
  mixed: mixed,
  vertical: vertical,
  compact: compact,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let isShowingInherited: Dynamic =
      selectedValue === undefined && !mixed && inherited !== undefined,
    allHaveVisuals: Dynamic = segmentOptions.every(
      (option?: Dynamic): Dynamic =>
        option.glyph !== undefined || option.icon !== undefined,
    ),
    displayValue: Dynamic = mixed ? "" : (selectedValue ?? inherited ?? ""),
    optionTooltip: Dynamic = (option?: Dynamic): Dynamic =>
      (option.tooltip ?? option.label) +
      (isShowingInherited && option.value === inherited ? " (" + inheritedHint + ")" : "");
  return (
    <span
      className={joinClassNames(
        "block min-w-0 flex-1",
        compact
          ? ChromePanelCloseClassNames_2
          : allHaveVisuals && ChromePanelCloseClassNames,
      )}
      data-testid={dataTestid}
      data-inherited={isShowingInherited ? "" : undefined}
      onClickCapture={
        isShowingInherited && !isDisabled
          ? (event?: Dynamic): Dynamic => {
              let ancestor: Dynamic = event.target.closest('[role="radio"]');
              ancestor !== null &&
                ancestor.hasAttribute("data-checked") &&
                !ancestor.hasAttribute("data-disabled") &&
                onChange(inherited);
            }
          : undefined
      }
    >
      <SegmentedControl
        aria-label={label}
        fullWidth={true}
        segments={segmentOptions.map(
          (option?: Dynamic): Dynamic =>
            option.icon !== undefined
              ? {
                  value: option.value,
                  icon: option.icon,
                  tooltip: optionTooltip(option),
                  disabled: isDisabled || option.whyDisabled !== undefined,
                  disabledReason: option.whyDisabled,
                }
              : {
                  value: option.value,
                  label:
                    option.glyph !== undefined ? (
                      <span
                        role={"img"}
                        aria-label={option.label}
                        className={joinClassNames(
                          "inline-flex",
                          vertical && "rotate-90",
                        )}
                      >
                        <PropertyOptionIcon icon={option.glyph} />
                      </span>
                    ) : (
                      option.label
                    ),
                  tooltip: optionTooltip(option),
                  disabled: isDisabled || option.whyDisabled !== undefined,
                  disabledReason: option.whyDisabled,
                },
        )}
        value={displayValue}
        onChange={(nextValue?: Dynamic): Dynamic => {
          isDisabled ||
            segmentOptions.find(
              (option?: Dynamic): Dynamic => option.value === nextValue,
            )?.whyDisabled !== undefined ||
            ((mixed || nextValue !== selectedValue) && onChange(nextValue));
        }}
      />
    </span>
  );
}
function PropertySegmentsRow(rowProps?: Dynamic): Dynamic {
  useUiLocale();
  let {
      label: label,
      onReset: onReset,
      title: title,
      description: description,
      trailing: trailing,
      options: segmentOptions,
      disabled: isDisabled,
      "data-testid": testId,
      ...segmentProps
    }: Dynamic = rowProps,
    segmentsControl: Dynamic = (
      <PropertySegments
        {...segmentProps}
        label={label}
        options={segmentOptions}
        disabled={isDisabled}
        data-testid={testId ? testId + "-segments" : undefined}
      />
    );
  return segmentOptions.length > 4 ? (
    <div className={"contents"} data-testid={testId}>
      <PropertyRow
        label={label}
        title={title}
        onReset={onReset}
        disabled={isDisabled}
        className={"min-h-0 pt-1"}
      />
      <PropertyRow
        title={title}
        description={description}
        trailing={trailing}
        disabled={isDisabled}
      >
        {segmentsControl}
      </PropertyRow>
    </div>
  ) : (
    <PropertyRow
      label={label}
      title={title}
      description={description}
      onReset={onReset}
      trailing={trailing}
      disabled={isDisabled}
      data-testid={testId}
    >
      {segmentsControl}
    </PropertyRow>
  );
}
export {
  jsxPropertiesSegments,
  PropertiesSegmentsItems,
  PropertiesSegmentsSideCornerConfig,
  PropertySegments,
  PropertySegmentsRow,
  reactPropertiesSegments,
};
export function installEditorPropertiesSegments(): () => void {
  return () => {
    reactPropertiesSegments = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxPropertiesSegments = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesSegmentsSideCornerConfig = {
      side: [0, 1, 2, 3],
      corner: [0, 1, 3, 2],
    };
    PropertiesSegmentsItems = [0, 1, 2, 3];
  };
}

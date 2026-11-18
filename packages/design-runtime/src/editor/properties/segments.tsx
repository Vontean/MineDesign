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
  options: options,
  value: value,
  inherited: inherited,
  inheritedHint = InheritedValue,
  onChange: onChange,
  disabled: disabled2,
  mixed: mixed,
  vertical: vertical,
  compact: compact,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let value2: Dynamic =
      value === undefined && !mixed && inherited !== undefined,
    value3: Dynamic = options.every(
      (input?: Dynamic): Dynamic =>
        input.glyph !== undefined || input.icon !== undefined,
    ),
    value4: Dynamic = mixed ? "" : (value ?? inherited ?? ""),
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      (input.tooltip ?? input.label) +
      (value2 && input.value === inherited ? " (" + inheritedHint + ")" : "");
  return (
    <span
      className={joinClassNames(
        "block min-w-0 flex-1",
        compact
          ? ChromePanelCloseClassNames_2
          : value3 && ChromePanelCloseClassNames,
      )}
      data-testid={dataTestid}
      data-inherited={value2 ? "" : undefined}
      onClickCapture={
        value2 && !disabled2
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
        segments={options.map(
          (input?: Dynamic): Dynamic =>
            input.icon !== undefined
              ? {
                  value: input.value,
                  icon: input.icon,
                  tooltip: callback(input),
                  disabled: disabled2 || input.whyDisabled !== undefined,
                  disabledReason: input.whyDisabled,
                }
              : {
                  value: input.value,
                  label:
                    input.glyph !== undefined ? (
                      <span
                        role={"img"}
                        aria-label={input.label}
                        className={joinClassNames(
                          "inline-flex",
                          vertical && "rotate-90",
                        )}
                      >
                        <PropertyOptionIcon icon={input.glyph} />
                      </span>
                    ) : (
                      input.label
                    ),
                  tooltip: callback(input),
                  disabled: disabled2 || input.whyDisabled !== undefined,
                  disabledReason: input.whyDisabled,
                },
        )}
        value={value4}
        onChange={(input?: Dynamic): Dynamic => {
          disabled2 ||
            options.find(
              (input2?: Dynamic): Dynamic => input2.value === input,
            )?.whyDisabled !== undefined ||
            ((mixed || input !== value) && onChange(input));
        }}
      />
    </span>
  );
}
function PropertySegmentsRow(input?: Dynamic): Dynamic {
  useUiLocale();
  let {
      label: value,
      onReset: value2,
      title: value3,
      description: value4,
      trailing: value5,
      options: value6,
      disabled: value7,
      "data-testid": value8,
      ...value9
    }: Dynamic = input,
    value10: Dynamic = (
      <PropertySegments
        {...value9}
        label={value}
        options={value6}
        disabled={value7}
        data-testid={value8 ? value8 + "-segments" : undefined}
      />
    );
  return value6.length > 4 ? (
    <div className={"contents"} data-testid={value8}>
      <PropertyRow
        label={value}
        title={value3}
        onReset={value2}
        disabled={value7}
        className={"min-h-0 pt-1"}
      />
      <PropertyRow
        title={value3}
        description={value4}
        trailing={value5}
        disabled={value7}
      >
        {value10}
      </PropertyRow>
    </div>
  ) : (
    <PropertyRow
      label={value}
      title={value3}
      description={value4}
      onReset={value2}
      trailing={value5}
      disabled={value7}
      data-testid={value8}
    >
      {value10}
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

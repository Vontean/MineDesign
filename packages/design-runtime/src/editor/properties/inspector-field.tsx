import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cn } from "../../cds/theme/class-names";
import { load_react_jsx_runtime } from "../../dependencies";
import { EditorMenu } from "../chrome/context-menu";
import { ContrastLockup, summarizeContrastResults } from "../color/contrast-ui";
import { evaluateColorContrast } from "../color/contrast";
import { parseEqualGridColumns } from "../css/grid";
import { parseCssNumber } from "../css/values";
import { useInspectorContext } from "../inspector/context-part-2";
import { InspectorPropertySchemaBackdropFilterConfig, InspectorPropertySchemaBackgroundFontWeightFontStyleConfig } from "../inspector/property-schema";
import { PropertyAlignmentRow, PropertyCssSegmentsRow } from "./alignment-row";
import { PropertyImageRow } from "./asset-picker";
import { PropertyBackgroundRow } from "./background-editor";
import { PropertiesColorRowSizeFillShadowSet, PropertyCssColorRow } from "./color-row";
import { useFieldNumericArrowStep as R_useFieldNumericArrowStep } from "./css-number-row";
import { PropertyCssEnumRow, PropertyCssTextRow, propertyOptionLabel } from "./css-value-row";
import { reactPropertiesDropShadowEditor_2 } from "./drop-shadow-editor";
import { PropertyFontFamilyRow } from "./font-family-row";
import { PropertyFontWeightRow } from "./font-weight-row";
import { parseGridSpan, PropertyGridColumnsRow, PropertyGridSpanRow } from "./grid-row";
import { inheritedFieldDescription, inheritedFieldForEdit, inheritedFieldTooltip, inspectorFieldDisplay, isInheritedInspectorField, PropertyToggleRow } from "./inherited-field";
import { PropertyRow } from "./row";
import { PropertyShadowRow } from "./shadow-row";
import { jsxPropertiesSizingRow, PropertySizingRow } from "./sizing-row";
import { PropertyTransformRow } from "./transform-row";
import { toModuleNamespace } from "../../module-helpers";

var jsxPropertiesInspectorField: Dynamic;
var PropertiesInspectorFieldPattern: Dynamic;
var PropertiesInspectorFieldPattern_2: Dynamic;
var PropertiesInspectorFieldPattern_3: Dynamic;
var PropertiesInspectorFieldReplace: Dynamic;
var PropertiesInspectorFieldTest: Dynamic;
var PropertiesInspectorFieldNameComponentFromSet: Dynamic;
function PropertyInspectorField(input?: Dynamic): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useState)(null),
    { textContrast: value3 = null }: Dynamic = (0,
    useInspectorContext)(),
    [value4, value5]: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useState)(false),
    value6: Dynamic = (0, isInheritedInspectorField)(input.state),
    value7: Dynamic =
      value6 &&
      !input.state.stale &&
      (value4 ||
        !PropertiesColorRowSizeFillShadowSet.has(
          input.state.spec?.editor ?? "string",
        ))
        ? {
            ...input,
            state: (0, inheritedFieldForEdit)(input.state),
          }
        : input,
    { state: value8 }: Dynamic = value7,
    value9: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    );
  (0, reactPropertiesDropShadowEditor_2.useEffect)((): Dynamic => {
    if (!value4 && !value9.current) return;
    let current: Dynamic = value9.current;
    value9.current = false;
    let callback2: Dynamic = (): Dynamic => {
      let element: Dynamic = (document as Dynamic).querySelector(
          `[data-testid="dc-prop-${value8.prop.replace(/["\\]/g, "\\$&")}"]`,
        ),
        activeElement: Dynamic = (document as Dynamic).activeElement;
      if (
        current &&
        activeElement &&
        activeElement !== (document as Dynamic).body &&
        !element?.contains(activeElement)
      )
        return;
      let value27: Dynamic = element?.querySelector(
        'input:not([aria-hidden="true"])',
      );
      value27?.focus();
      value27?.select();
    };
    if (!current) return callback2();
    let value26: Dynamic = setTimeout(callback2, 0);
    return (): Dynamic => clearTimeout(value26);
  }, [value4, value8.prop]);
  let { alsoCommit: value10, alsoCommitOnClear: value11 }: Dynamic = value8,
    { onCommit: value12, onCommitMany: value13 }: Dynamic = value7,
    value14: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useCallback)(
      (input2?: Dynamic, options?: Dynamic): Dynamic => {
        let value26: Dynamic =
            input2 === value8.prop &&
            Object.hasOwn(
              InspectorPropertySchemaBackdropFilterConfig,
              input2,
            )
              ? InspectorPropertySchemaBackdropFilterConfig[input2]
              : undefined,
          items: Dynamic = [
            ...(value26
              ? [
                  {
                    prop: value26,
                    value: options,
                  },
                ]
              : []),
            ...((options != null ? value10 : value11) ?? []),
          ];
        if (items.length > 0) {
          if (value13)
            value13([
              {
                prop: input2,
                value: options,
              },
              ...items,
            ]);
          else
            for (let value27 of [
              {
                prop: input2,
                value: options,
              },
              ...items,
            ] as Dynamic)
              value12(value27.prop, value27.value);
        } else value12(input2, options);
      },
      [value10, value11, value12, value13, value8.prop],
    ),
    value15: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useCallback)((): Dynamic => {
      let value26: Dynamic = value8.mixed
        ? ""
        : (value8.varSource ?? value8.value ?? value8.fallback ?? "");
      navigator.clipboard
        ?.writeText(`${value8.prop}: ${value26};`)
        .catch((): Dynamic => {});
    }, [value8]),
    value16: Dynamic = Object.hasOwn(
      InspectorPropertySchemaBackgroundFontWeightFontStyleConfig,
      value8.prop,
    )
      ? InspectorPropertySchemaBackgroundFontWeightFontStyleConfig[
          value8.prop
        ]
      : null,
    callback: Dynamic = (): Dynamic => {
      value5(false);
      value16
        ? value20([
            {
              prop: value8.prop,
              value: null,
            },
            {
              prop: value16,
              value: null,
            },
          ])
        : value14(value8.prop, null);
    },
    value17: Dynamic =
      (((value8.value != null && value8.value !== "") ||
        (value16 != null &&
          value8.companionValue != null &&
          value8.companionValue !== "")) &&
        !value6) ||
      (!!value8.mixed && !value8.inheritedFrom) ||
      !!value8.companionMixed,
    value18: Dynamic =
      value8.prop === "__headStart" || value8.prop === "__headEnd",
    value19: Dynamic = value18
      ? []
      : [
          {
            get label() { return uiMessage("inspector.inspectorField.unsetProperty"); },
            onSelect: callback,
            disabled: !value17 || !!value8.disabled,
          },
          {
            get label() { return uiMessage("inspector.inspectorField.editAsText"); },
            onSelect: (): Dynamic => value5(true),
            disabled: !!value8.disabled,
          },
          {
            get label() { return uiMessage("inspector.inspectorField.copyDeclaration"); },
            onSelect: value15,
          },
          ...((value7.onRemoveRow && !value6 && !value8.disabled) ||
          value7.extraMenuItems?.length
            ? ["separator"]
            : []),
          ...(value7.onRemoveRow && !value6 && !value8.disabled
            ? [
                {
                  get label() { return uiMessage("inspector.inspectorField.removeRow"); },
                  variant: "danger",
                  onSelect: (): Dynamic => {
                    value17 && callback();
                    value7.onRemoveRow?.();
                  },
                },
              ]
            : []),
          ...(value7.extraMenuItems ?? []),
        ],
    value20: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useCallback)(
      (input2?: Dynamic): Dynamic => {
        let value26: Dynamic = (
            input2.some((input3?: Dynamic): Dynamic => input3.value != null)
              ? (value10 ?? [])
              : []
          ).filter(
            (input3?: Dynamic): Dynamic =>
              !input2.some(
                (input4?: Dynamic): Dynamic => input4.prop === input3.prop,
              ),
          ),
          items: Dynamic = [...input2, ...value26];
        if (value13) value13(items);
        else
          for (let value27 of items as Dynamic)
            value12(value27.prop, value27.value);
      },
      [value10, value13, value12],
    ),
    value21: Dynamic =
      (value17 && !value8.disabled && value8.prop !== "__text" && !value18) ||
      (value7.onRemoveRow && !value8.disabled && !value6)
        ? (): Dynamic => {
            value17 && callback();
            value7.onRemoveRow?.();
          }
        : undefined,
    state: Dynamic = {
      label: value8.label || undefined,
      "data-testid": `dc-prop-${value8.prop}`,
      title:
        value8.whyDisabled ??
        (0, inheritedFieldTooltip)(input.state) ??
        (value8.varSource
          ? uiMessage("inspector.inspectorField.authoredAsValue1EditingWrites", { value1: String(value8.varSource) })
          : undefined),
      description: (0, inheritedFieldDescription)(input.state),
      onReset: value21,
      trailing: value7.trailing,
      resetLabel: value7.onRemoveRow
        ? value17
          ? uiMessage("inspector.inspectorField.unsetValue1AndRemoveRow", { value1: String(value8.label) })
          : uiMessage("inspector.inspectorField.removeValue1Row", { value1: String(value8.label) })
        : uiMessage("inspector.inspectorField.unsetValue1UseInherited", { value1: String(value8.label) }),
      onContextMenu: value18
        ? undefined
        : (event?: Dynamic): Dynamic => {
            event.preventDefault();
            value2({
              x: event.clientX,
              y: event.clientY,
            });
          },
    },
    state2: Dynamic = {
      ...value7,
      onCommit:
        value4 && value8.spec?.editor === "number"
          ? (input2?: Dynamic, options?: Dynamic): Dynamic => {
              value14(input2, options);
              input2 === value8.prop &&
                (options == null ||
                  (0, parseCssNumber)(options) != null) &&
                setTimeout((): Dynamic => {
                  value9.current = true;
                  value5(false);
                }, 0);
            }
          : value14,
      onCommitMany: value20,
      shell: state,
    },
    { isLiteral: value22 }: Dynamic = (0, inspectorFieldDisplay)(
      input.state,
    ),
    value23: Dynamic = input.state.value,
    value24: Dynamic = value4 ? "string" : (value8.spec?.editor ?? "string"),
    value25: Dynamic;
  if (value8.stale && !value4) {
    let value26: Dynamic =
        value8.varSource ?? (value8.value || value8.companionValue || ""),
      value27: Dynamic =
        !!value8.spec?.options?.includes(value26) ||
        (value8.spec?.optionLabels != null &&
          Object.hasOwn(value8.spec.optionLabels, value26)),
      value28: Dynamic = value8.mixed
        ? "Mixed"
        : value27
          ? (0, propertyOptionLabel)(value8.spec, value26)
          : value26;
    return (
      <jsxPropertiesSizingRow.Fragment>
        <PropertyRow
          {...state}
          title={
            value6 ? (uiMessage("inspector.inspectorField.fromValue1ItHasNo", { value1: String(value8.inheritedFrom) })) : (state.title ?? (uiMessage("inspector.inspectorField.setOnThisElementIt")))
          }
        >
          <span
            data-testid={`dc-stale-${value8.prop}`}
            className={(0, cn)(
              "min-w-0 truncate px-1 text-footnote",
              value8.mixed && "text-muted",
            )}
          >
            {value28}
          </span>
        </PropertyRow>
        <EditorMenu
          at={value}
          onClose={(): Dynamic => value2(null)}
          items={value19}
          minWidth={170}
          label={uiMessage("inspector.inspectorField.actions", { value1: String(value8.label || (value8.prop)) })}
        />
      </jsxPropertiesSizingRow.Fragment>
    );
  }
  switch (value24) {
    case "bool": {
      let value26: Dynamic = value8.mixed ? "" : (value8.value ?? "").trim(),
        value27: Dynamic = value8.spec?.boolOnValue;
      if (value27) {
        let value28: Dynamic =
          value26 || (value8.mixed ? "" : (value8.fallback ?? "").trim());
        value25 = (
          <PropertyToggleRow
            shell={state}
            label={value8.label}
            on={value28.toLowerCase() === value27.toLowerCase()}
            disabled={value8.disabled}
            onToggle={(input2?: Dynamic): Dynamic =>
              value14(value8.prop, input2 ? value27 : null)
            }
          />
        );
      } else {
        let value28: Dynamic = value8.spec?.options?.[0] ?? "none";
        value25 = (
          <PropertyToggleRow
            shell={state}
            label={value8.label}
            on={value26 !== value28}
            disabled={value8.disabled}
            onToggle={(input2?: Dynamic): Dynamic =>
              value14(value8.prop, input2 ? null : value28)
            }
          />
        );
      }
      break;
    }
    case "number":
      value25 =
        value6 &&
        value23 &&
        value22 &&
        (0, parseCssNumber)(value23) == null ? (
          <PropertyCssTextRow {...state2} />
        ) : (
          <R_useFieldNumericArrowStep {...state2} />
        );
      break;
    case "color": {
      if (value8.textFill === undefined) {
        value25 = <PropertyCssColorRow {...state2} />;
        break;
      }
      let value26: Dynamic =
          value3 &&
          !value8.mixed &&
          !value8.disabled &&
          !value8.textFill.clipped &&
          value8.textFill.transparentInk === undefined
            ? {
                against: value3.against,
                role: value3.role,
              }
            : undefined,
        value27: Dynamic =
          value3 && value26 !== undefined
            ? (0, evaluateColorContrast)(value3.ink, value26)
            : undefined,
        value28: Dynamic =
          value27 === undefined
            ? undefined
            : (0, summarizeContrastResults)(value27).sentence,
        value29: Dynamic = (
          <PropertyRow
            {...state}
            description={
              value28 === undefined ? (state.description) : (state.description ? (state.description.replace(/\.?\s*$/, ". ") + value28) : (value28))
            }
          >
            <PropertyBackgroundRow
              label={value8.label}
              value={value8.value}
              varSource={value8.varSource}
              varPartial={value8.varPartial}
              fallback={value8.fallback}
              disabled={value8.disabled}
              mixed={value8.mixed}
              inherited={!!value8.inheritedFrom}
              textFill={value8.textFill}
              contrast={value26}
              testId={`dc-color-${value8.prop}`}
              onCommitMany={value20}
            />
          </PropertyRow>
        );
      value25 = (
        <div data-dc={"contrast-row"}>
          {value29}
          {value27 !== undefined && value3 ? (<PropertyRow
              label={""}
              className={"-mt-0.5 pb-1 [--prop-row-h:0px]"}
            >
              <ContrastLockup fg={value3.ink} results={value27} />
            </PropertyRow>) : (null)}
        </div>
      );
      break;
    }
    case "select":
      value25 = <PropertyCssEnumRow {...state2} />;
      break;
    case "flexSeg":
      value25 = <PropertyCssSegmentsRow {...state2} />;
      break;
    case "typeStyle":
      value25 = <PropertyAlignmentRow {...state2} />;
      break;
    case "fontFace":
      value25 = <PropertyFontWeightRow {...state2} />;
      break;
    case "gridTracks":
      value25 =
        value23 &&
        (!value22 || (0, parseEqualGridColumns)(value23) == null) ? (
          <PropertyCssTextRow {...state2} />
        ) : (
          <PropertyGridColumnsRow {...state2} />
        );
      break;
    case "gridSpan":
      value25 =
        value23 &&
        (!value22 || (0, parseGridSpan)(value23) == null) ? (
          <PropertyCssTextRow {...state2} />
        ) : (
          <PropertyGridSpanRow {...state2} />
        );
      break;
    case "transform":
      value25 = <PropertyTransformRow {...state2} />;
      break;
    case "font":
      value25 = <PropertyFontFamilyRow {...state2} />;
      break;
    case "fill":
      value25 =
        !value22 && value23 ? (
          <PropertyCssTextRow {...state2} />
        ) : (
          <PropertyRow {...state}>
            <PropertyBackgroundRow
              label={value8.label}
              value={value8.value}
              companionValue={value8.companionValue}
              companionAuthored={value8.companionVarSource}
              valueAuthored={value8.varSource}
              varPartial={value8.varPartial}
              companionVarPartial={value8.companionVarPartial}
              fallback={value8.fallback}
              disabled={value8.disabled}
              mixed={value8.mixed || value8.companionMixed}
              inherited={!!value8.inheritedFrom}
              noImageReason={value8.fillNoImageReason}
              onCommitMany={value20}
            />
          </PropertyRow>
        );
      break;
    case "shadow":
      value25 =
        !value22 && value23 ? (
          <PropertyCssTextRow {...state2} />
        ) : (
          <PropertyRow {...state}>
            <PropertyShadowRow
              label={value8.label}
              prop={value8.prop}
              value={value8.value}
              fallback={value8.fallback}
              disabled={value8.disabled}
              mixed={value8.mixed}
              inherited={!!value8.inheritedFrom}
              onCommitMany={value20}
            />
          </PropertyRow>
        );
      break;
    case "image":
      value25 = (
        <PropertyRow {...state}>
          <PropertyImageRow
            label={value8.label}
            value={value8.mixed ? null : value8.value}
            mixed={value8.mixed}
            disabled={value8.disabled}
            onCommit={(input2?: Dynamic): Dynamic =>
              value14(value8.prop, input2)
            }
            onPickFile={value7.onPickImageFile}
            uploadOnlyReason={value8.imageUploadOnlyReason}
          />
        </PropertyRow>
      );
      break;
    case "size":
      value25 = (
        <PropertySizingRow
          shell={state}
          label={value8.label}
          prop={value8.prop}
          value={value8.value}
          fallback={value8.fallback}
          disabled={value8.disabled}
          mixed={value8.mixed}
          noHug={value8.noHug}
          fixedOnlyReason={value8.fixedSizeReason}
          onCommitMany={
            value8.inheritedFrom
              ? (input2?: Dynamic): Dynamic =>
                  value20(
                    input2.map(
                      (input3?: Dynamic): Dynamic =>
                        input3.prop === value8.prop && input3.value == null
                          ? {
                              ...input3,
                              value: "auto",
                            }
                          : input3,
                    ),
                  )
              : value20
          }
        />
      );
      break;
    default:
      value25 = <PropertyCssTextRow {...state2} />;
      break;
  }
  return (
    <jsxPropertiesSizingRow.Fragment>
      {value25}
      <EditorMenu
        at={value}
        onClose={(): Dynamic => value2(null)}
        items={value19}
        minWidth={170}
        label={uiMessage("inspector.inspectorField.actions", { value1: String(value8.label || (value8.prop)) })}
      />
    </jsxPropertiesSizingRow.Fragment>
  );
}
export {
  jsxPropertiesInspectorField,
  PropertiesInspectorFieldNameComponentFromSet,
  PropertiesInspectorFieldPattern,
  PropertiesInspectorFieldPattern_2,
  PropertiesInspectorFieldPattern_3,
  PropertiesInspectorFieldReplace,
  PropertiesInspectorFieldTest,
  PropertyInspectorField,
};
export function installEditorPropertiesInspectorField(): () => void {
  return () => {
    jsxPropertiesInspectorField = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    PropertiesInspectorFieldPattern = /^\s*\{\{([\s\S]+?)\}\}\s*$/;
    PropertiesInspectorFieldPattern_2 = /^-?\d+(\.\d+)?$/;
    PropertiesInspectorFieldPattern_3 = /^on(-|[A-Z])/;
    PropertiesInspectorFieldReplace = (input?: Dynamic): Dynamic =>
      input.replace(
        /-([a-z])/g,
        (input2?: Dynamic, options?: Dynamic): Dynamic => options.toUpperCase(),
      );
    PropertiesInspectorFieldTest = (input?: Dynamic): Dynamic =>
      /^(aria|data)-/.test(input)
        ? input
        : PropertiesInspectorFieldReplace(input);
    PropertiesInspectorFieldNameComponentFromSet = new Set([
      "name",
      "component",
      "from",
    ]);
  };
}

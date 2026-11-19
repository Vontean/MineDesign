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
function PropertyInspectorField(props?: Dynamic): Dynamic {
  useUiLocale();
  let [menuPosition, setMenuPosition]: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useState)(null),
    { textContrast: textContrast = null }: Dynamic = useInspectorContext(),
    [isEditingAsText, setIsEditingAsText]: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useState)(false),
    isInherited: Dynamic = isInheritedInspectorField(props.state),
    effectiveProps: Dynamic =
      isInherited &&
      !props.state.stale &&
      (isEditingAsText ||
        !PropertiesColorRowSizeFillShadowSet.has(
          props.state.spec?.editor ?? "string",
        ))
        ? {
            ...props,
            state: inheritedFieldForEdit(props.state),
          }
        : props,
    { state: fieldState }: Dynamic = effectiveProps,
    shouldRefocusRef: Dynamic = (0, reactPropertiesDropShadowEditor_2.useRef)(
      false,
    );
  (0, reactPropertiesDropShadowEditor_2.useEffect)((): Dynamic => {
    if (!isEditingAsText && !shouldRefocusRef.current) return;
    let shouldRefocus: Dynamic = shouldRefocusRef.current;
    shouldRefocusRef.current = false;
    let focusInput: Dynamic = (): Dynamic => {
      let fieldElement: Dynamic = (document as Dynamic).querySelector(
          `[data-testid="dc-prop-${fieldState.prop.replace(/["\\]/g, "\\$&")}"]`,
        ),
        activeElement: Dynamic = (document as Dynamic).activeElement;
      if (
        shouldRefocus &&
        activeElement &&
        activeElement !== (document as Dynamic).body &&
        !fieldElement?.contains(activeElement)
      )
        return;
      let inputElement: Dynamic = fieldElement?.querySelector(
        'input:not([aria-hidden="true"])',
      );
      inputElement?.focus();
      inputElement?.select();
    };
    if (!shouldRefocus) return focusInput();
    let focusTimer: Dynamic = setTimeout(focusInput, 0);
    return (): Dynamic => clearTimeout(focusTimer);
  }, [isEditingAsText, fieldState.prop]);
  let { alsoCommit: alsoCommit, alsoCommitOnClear: alsoCommitOnClear }: Dynamic = fieldState,
    { onCommit: onCommit, onCommitMany: onCommitMany }: Dynamic = effectiveProps,
    commitProp: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useCallback)(
      (prop?: Dynamic, nextValue?: Dynamic): Dynamic => {
        let prefixedProp: Dynamic =
            prop === fieldState.prop &&
            Object.hasOwn(
              InspectorPropertySchemaBackdropFilterConfig,
              prop,
            )
              ? InspectorPropertySchemaBackdropFilterConfig[prop]
              : undefined,
          extraCommits: Dynamic = [
            ...(prefixedProp
              ? [
                  {
                    prop: prefixedProp,
                    value: nextValue,
                  },
                ]
              : []),
            ...((nextValue != null ? alsoCommit : alsoCommitOnClear) ?? []),
          ];
        if (extraCommits.length > 0) {
          if (onCommitMany)
            onCommitMany([
              {
                prop: prop,
                value: nextValue,
              },
              ...extraCommits,
            ]);
          else
            for (let commit of [
              {
                prop: prop,
                value: nextValue,
              },
              ...extraCommits,
            ] as Dynamic)
              onCommit(commit.prop, commit.value);
        } else onCommit(prop, nextValue);
      },
      [alsoCommit, alsoCommitOnClear, onCommit, onCommitMany, fieldState.prop],
    ),
    copyDeclaration: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useCallback)((): Dynamic => {
      let declarationValue: Dynamic = fieldState.mixed
        ? ""
        : (fieldState.varSource ?? fieldState.value ?? fieldState.fallback ?? "");
      navigator.clipboard
        ?.writeText(`${fieldState.prop}: ${declarationValue};`)
        .catch((): Dynamic => {});
    }, [fieldState]),
    companionProp: Dynamic = Object.hasOwn(
      InspectorPropertySchemaBackgroundFontWeightFontStyleConfig,
      fieldState.prop,
    )
      ? InspectorPropertySchemaBackgroundFontWeightFontStyleConfig[
          fieldState.prop
        ]
      : null,
    unsetProperty: Dynamic = (): Dynamic => {
      setIsEditingAsText(false);
      companionProp
        ? commitMany([
            {
              prop: fieldState.prop,
              value: null,
            },
            {
              prop: companionProp,
              value: null,
            },
          ])
        : commitProp(fieldState.prop, null);
    },
    hasValue: Dynamic =
      (((fieldState.value != null && fieldState.value !== "") ||
        (companionProp != null &&
          fieldState.companionValue != null &&
          fieldState.companionValue !== "")) &&
        !isInherited) ||
      (!!fieldState.mixed && !fieldState.inheritedFrom) ||
      !!fieldState.companionMixed,
    isHeadProp: Dynamic =
      fieldState.prop === "__headStart" || fieldState.prop === "__headEnd",
    menuItems: Dynamic = isHeadProp
      ? []
      : [
          {
            get label() { return uiMessage("inspector.inspectorField.unsetProperty"); },
            onSelect: unsetProperty,
            disabled: !hasValue || !!fieldState.disabled,
          },
          {
            get label() { return uiMessage("inspector.inspectorField.editAsText"); },
            onSelect: (): Dynamic => setIsEditingAsText(true),
            disabled: !!fieldState.disabled,
          },
          {
            get label() { return uiMessage("inspector.inspectorField.copyDeclaration"); },
            onSelect: copyDeclaration,
          },
          ...((effectiveProps.onRemoveRow && !isInherited && !fieldState.disabled) ||
          effectiveProps.extraMenuItems?.length
            ? ["separator"]
            : []),
          ...(effectiveProps.onRemoveRow && !isInherited && !fieldState.disabled
            ? [
                {
                  get label() { return uiMessage("inspector.inspectorField.removeRow"); },
                  variant: "danger",
                  onSelect: (): Dynamic => {
                    hasValue && unsetProperty();
                    effectiveProps.onRemoveRow?.();
                  },
                },
              ]
            : []),
          ...(effectiveProps.extraMenuItems ?? []),
        ],
    commitMany: Dynamic = (0,
    reactPropertiesDropShadowEditor_2.useCallback)(
      (commits?: Dynamic): Dynamic => {
        let leftoverCommits: Dynamic = (
            commits.some((commit?: Dynamic): Dynamic => commit.value != null)
              ? (alsoCommit ?? [])
              : []
          ).filter(
            (leftover?: Dynamic): Dynamic =>
              !commits.some(
                (commit?: Dynamic): Dynamic => commit.prop === leftover.prop,
              ),
          ),
          allCommits: Dynamic = [...commits, ...leftoverCommits];
        if (onCommitMany) onCommitMany(allCommits);
        else
          for (let commit of allCommits as Dynamic)
            onCommit(commit.prop, commit.value);
      },
      [alsoCommit, onCommitMany, onCommit],
    ),
    resetHandler: Dynamic =
      (hasValue && !fieldState.disabled && fieldState.prop !== "__text" && !isHeadProp) ||
      (effectiveProps.onRemoveRow && !fieldState.disabled && !isInherited)
        ? (): Dynamic => {
            hasValue && unsetProperty();
            effectiveProps.onRemoveRow?.();
          }
        : undefined,
    rowShell: Dynamic = {
      label: fieldState.label || undefined,
      "data-testid": `dc-prop-${fieldState.prop}`,
      title:
        fieldState.whyDisabled ??
        inheritedFieldTooltip(props.state) ??
        (fieldState.varSource
          ? uiMessage("inspector.inspectorField.authoredAsValue1EditingWrites", { value1: String(fieldState.varSource) })
          : undefined),
      description: inheritedFieldDescription(props.state),
      onReset: resetHandler,
      trailing: effectiveProps.trailing,
      resetLabel: effectiveProps.onRemoveRow
        ? hasValue
          ? uiMessage("inspector.inspectorField.unsetValue1AndRemoveRow", { value1: String(fieldState.label) })
          : uiMessage("inspector.inspectorField.removeValue1Row", { value1: String(fieldState.label) })
        : uiMessage("inspector.inspectorField.unsetValue1UseInherited", { value1: String(fieldState.label) }),
      onContextMenu: isHeadProp
        ? undefined
        : (event?: Dynamic): Dynamic => {
            event.preventDefault();
            setMenuPosition({
              x: event.clientX,
              y: event.clientY,
            });
          },
    },
    rowProps: Dynamic = {
      ...effectiveProps,
      onCommit:
        isEditingAsText && fieldState.spec?.editor === "number"
          ? (prop?: Dynamic, nextValue?: Dynamic): Dynamic => {
              commitProp(prop, nextValue);
              prop === fieldState.prop &&
                (nextValue == null ||
                  parseCssNumber(nextValue) != null) &&
                setTimeout((): Dynamic => {
                  shouldRefocusRef.current = true;
                  setIsEditingAsText(false);
                }, 0);
            }
          : commitProp,
      onCommitMany: commitMany,
      shell: rowShell,
    },
    { isLiteral: isLiteral }: Dynamic = inspectorFieldDisplay(
      props.state,
    ),
    currentValue: Dynamic = props.state.value,
    editorKind: Dynamic = isEditingAsText ? "string" : (fieldState.spec?.editor ?? "string"),
    row: Dynamic;
  if (fieldState.stale && !isEditingAsText) {
    let displayValue: Dynamic =
        fieldState.varSource ?? (fieldState.value || fieldState.companionValue || ""),
      isKnownOption: Dynamic =
        !!fieldState.spec?.options?.includes(displayValue) ||
        (fieldState.spec?.optionLabels != null &&
          Object.hasOwn(fieldState.spec.optionLabels, displayValue)),
      staleLabel: Dynamic = fieldState.mixed
        ? "Mixed"
        : isKnownOption
          ? propertyOptionLabel(fieldState.spec, displayValue)
          : displayValue;
    return (
      <jsxPropertiesSizingRow.Fragment>
        <PropertyRow
          {...rowShell}
          title={
            isInherited ? (uiMessage("inspector.inspectorField.fromValue1ItHasNo", { value1: String(fieldState.inheritedFrom) })) : (rowShell.title ?? (uiMessage("inspector.inspectorField.setOnThisElementIt")))
          }
        >
          <span
            data-testid={`dc-stale-${fieldState.prop}`}
            className={cn(
              "min-w-0 truncate px-1 text-footnote",
              fieldState.mixed && "text-muted",
            )}
          >
            {staleLabel}
          </span>
        </PropertyRow>
        <EditorMenu
          at={menuPosition}
          onClose={(): Dynamic => setMenuPosition(null)}
          items={menuItems}
          minWidth={170}
          label={uiMessage("inspector.inspectorField.actions", { value1: String(fieldState.label || (fieldState.prop)) })}
        />
      </jsxPropertiesSizingRow.Fragment>
    );
  }
  switch (editorKind) {
    case "bool": {
      let boolText: Dynamic = fieldState.mixed ? "" : (fieldState.value ?? "").trim(),
        boolOnValue: Dynamic = fieldState.spec?.boolOnValue;
      if (boolOnValue) {
        let effectiveText: Dynamic =
          boolText || (fieldState.mixed ? "" : (fieldState.fallback ?? "").trim());
        row = (
          <PropertyToggleRow
            shell={rowShell}
            label={fieldState.label}
            on={effectiveText.toLowerCase() === boolOnValue.toLowerCase()}
            disabled={fieldState.disabled}
            onToggle={(isOn?: Dynamic): Dynamic =>
              commitProp(fieldState.prop, isOn ? boolOnValue : null)
            }
          />
        );
      } else {
        let offValue: Dynamic = fieldState.spec?.options?.[0] ?? "none";
        row = (
          <PropertyToggleRow
            shell={rowShell}
            label={fieldState.label}
            on={boolText !== offValue}
            disabled={fieldState.disabled}
            onToggle={(isOn?: Dynamic): Dynamic =>
              commitProp(fieldState.prop, isOn ? null : offValue)
            }
          />
        );
      }
      break;
    }
    case "number":
      row =
        isInherited &&
        currentValue &&
        isLiteral &&
        parseCssNumber(currentValue) == null ? (
          <PropertyCssTextRow {...rowProps} />
        ) : (
          <R_useFieldNumericArrowStep {...rowProps} />
        );
      break;
    case "color": {
      if (fieldState.textFill === undefined) {
        row = <PropertyCssColorRow {...rowProps} />;
        break;
      }
      let contrastSpec: Dynamic =
          textContrast &&
          !fieldState.mixed &&
          !fieldState.disabled &&
          !fieldState.textFill.clipped &&
          fieldState.textFill.transparentInk === undefined
            ? {
                against: textContrast.against,
                role: textContrast.role,
              }
            : undefined,
        contrastResults: Dynamic =
          textContrast && contrastSpec !== undefined
            ? evaluateColorContrast(textContrast.ink, contrastSpec)
            : undefined,
        contrastSentence: Dynamic =
          contrastResults === undefined
            ? undefined
            : summarizeContrastResults(contrastResults).sentence,
        colorRow: Dynamic = (
          <PropertyRow
            {...rowShell}
            description={
              contrastSentence === undefined ? (rowShell.description) : (rowShell.description ? (rowShell.description.replace(/\.?\s*$/, ". ") + contrastSentence) : (contrastSentence))
            }
          >
            <PropertyBackgroundRow
              label={fieldState.label}
              value={fieldState.value}
              varSource={fieldState.varSource}
              varPartial={fieldState.varPartial}
              fallback={fieldState.fallback}
              disabled={fieldState.disabled}
              mixed={fieldState.mixed}
              inherited={!!fieldState.inheritedFrom}
              textFill={fieldState.textFill}
              contrast={contrastSpec}
              testId={`dc-color-${fieldState.prop}`}
              onCommitMany={commitMany}
            />
          </PropertyRow>
        );
      row = (
        <div data-dc={"contrast-row"}>
          {colorRow}
          {contrastResults !== undefined && textContrast ? (<PropertyRow
              label={""}
              className={"-mt-0.5 pb-1 [--prop-row-h:0px]"}
            >
              <ContrastLockup fg={textContrast.ink} results={contrastResults} />
            </PropertyRow>) : (null)}
        </div>
      );
      break;
    }
    case "select":
      row = <PropertyCssEnumRow {...rowProps} />;
      break;
    case "flexSeg":
      row = <PropertyCssSegmentsRow {...rowProps} />;
      break;
    case "typeStyle":
      row = <PropertyAlignmentRow {...rowProps} />;
      break;
    case "fontFace":
      row = <PropertyFontWeightRow {...rowProps} />;
      break;
    case "gridTracks":
      row =
        currentValue &&
        (!isLiteral || parseEqualGridColumns(currentValue) == null) ? (
          <PropertyCssTextRow {...rowProps} />
        ) : (
          <PropertyGridColumnsRow {...rowProps} />
        );
      break;
    case "gridSpan":
      row =
        currentValue &&
        (!isLiteral || parseGridSpan(currentValue) == null) ? (
          <PropertyCssTextRow {...rowProps} />
        ) : (
          <PropertyGridSpanRow {...rowProps} />
        );
      break;
    case "transform":
      row = <PropertyTransformRow {...rowProps} />;
      break;
    case "font":
      row = <PropertyFontFamilyRow {...rowProps} />;
      break;
    case "fill":
      row =
        !isLiteral && currentValue ? (
          <PropertyCssTextRow {...rowProps} />
        ) : (
          <PropertyRow {...rowShell}>
            <PropertyBackgroundRow
              label={fieldState.label}
              value={fieldState.value}
              companionValue={fieldState.companionValue}
              companionAuthored={fieldState.companionVarSource}
              valueAuthored={fieldState.varSource}
              varPartial={fieldState.varPartial}
              companionVarPartial={fieldState.companionVarPartial}
              fallback={fieldState.fallback}
              disabled={fieldState.disabled}
              mixed={fieldState.mixed || fieldState.companionMixed}
              inherited={!!fieldState.inheritedFrom}
              noImageReason={fieldState.fillNoImageReason}
              onCommitMany={commitMany}
            />
          </PropertyRow>
        );
      break;
    case "shadow":
      row =
        !isLiteral && currentValue ? (
          <PropertyCssTextRow {...rowProps} />
        ) : (
          <PropertyRow {...rowShell}>
            <PropertyShadowRow
              label={fieldState.label}
              prop={fieldState.prop}
              value={fieldState.value}
              fallback={fieldState.fallback}
              disabled={fieldState.disabled}
              mixed={fieldState.mixed}
              inherited={!!fieldState.inheritedFrom}
              onCommitMany={commitMany}
            />
          </PropertyRow>
        );
      break;
    case "image":
      row = (
        <PropertyRow {...rowShell}>
          <PropertyImageRow
            label={fieldState.label}
            value={fieldState.mixed ? null : fieldState.value}
            mixed={fieldState.mixed}
            disabled={fieldState.disabled}
            onCommit={(nextValue?: Dynamic): Dynamic =>
              commitProp(fieldState.prop, nextValue)
            }
            onPickFile={effectiveProps.onPickImageFile}
            uploadOnlyReason={fieldState.imageUploadOnlyReason}
          />
        </PropertyRow>
      );
      break;
    case "size":
      row = (
        <PropertySizingRow
          shell={rowShell}
          label={fieldState.label}
          prop={fieldState.prop}
          value={fieldState.value}
          fallback={fieldState.fallback}
          disabled={fieldState.disabled}
          mixed={fieldState.mixed}
          noHug={fieldState.noHug}
          fixedOnlyReason={fieldState.fixedSizeReason}
          onCommitMany={
            fieldState.inheritedFrom
              ? (commits?: Dynamic): Dynamic =>
                  commitMany(
                    commits.map(
                      (commit?: Dynamic): Dynamic =>
                        commit.prop === fieldState.prop && commit.value == null
                          ? {
                              ...commit,
                              value: "auto",
                            }
                          : commit,
                    ),
                  )
              : commitMany
          }
        />
      );
      break;
    default:
      row = <PropertyCssTextRow {...rowProps} />;
      break;
  }
  return (
    <jsxPropertiesSizingRow.Fragment>
      {row}
      <EditorMenu
        at={menuPosition}
        onClose={(): Dynamic => setMenuPosition(null)}
        items={menuItems}
        minWidth={170}
        label={uiMessage("inspector.inspectorField.actions", { value1: String(fieldState.label || (fieldState.prop)) })}
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
    jsxPropertiesInspectorField = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesInspectorFieldPattern = /^\s*\{\{([\s\S]+?)\}\}\s*$/;
    PropertiesInspectorFieldPattern_2 = /^-?\d+(\.\d+)?$/;
    PropertiesInspectorFieldPattern_3 = /^on(-|[A-Z])/;
    PropertiesInspectorFieldReplace = (cssName?: Dynamic): Dynamic =>
      cssName.replace(
        /-([a-z])/g,
        (match?: Dynamic, letter?: Dynamic): Dynamic => letter.toUpperCase(),
      );
    PropertiesInspectorFieldTest = (name?: Dynamic): Dynamic =>
      /^(aria|data)-/.test(name)
        ? name
        : PropertiesInspectorFieldReplace(name);
    PropertiesInspectorFieldNameComponentFromSet = new Set([
      "name",
      "component",
      "from",
    ]);
  };
}

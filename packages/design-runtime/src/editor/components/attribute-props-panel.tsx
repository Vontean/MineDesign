import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { reservedImportAttributePattern } from "./imports";
import { ComponentPropInput } from "./prop-editors";
import { isEditablePropMetadata } from "./prop-validation";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { PropertyTextInput } from "../properties/css-number-row";
import { reactPropertiesDropShadowEditor } from "../properties/drop-shadow-editor";
import { PropertiesInspectorFieldNameComponentFromSet, PropertiesInspectorFieldPattern, PropertiesInspectorFieldPattern_2 as numberLiteralPattern, PropertiesInspectorFieldPattern_3 as eventAttributePattern, PropertiesInspectorFieldReplace, PropertiesInspectorFieldTest } from "../properties/inspector-field";
import { PropertyPickerButton } from "../properties/primitives";
import { PropertyTextRow } from "../properties/rows";
import { PropertySection } from "../properties/section";

function inferComponentAttributeMetadata(attrs?: Dynamic): Dynamic {
  let state: Dynamic = {};
  for (let [attrName, attrValue] of Object.entries(attrs) as Dynamic) {
    if (reservedImportAttributePattern.test(attrName))
      continue;
    let bindingExpression: Dynamic = attrValue
        .match(PropertiesInspectorFieldPattern)?.[1]
        ?.trim(),
      editorKind: Dynamic =
        bindingExpression === "true" || bindingExpression === "false" || bindingExpression === "yes"
          ? "boolean"
          : bindingExpression != null &&
              numberLiteralPattern.test(bindingExpression)
            ? "float"
            : "text";
    state[attrName] = {
      editor: editorKind,
    };
  }
  return state;
}
function mergeComponentAttributeValues(attrLayers?: Dynamic): Dynamic {
  let merged: Dynamic = Object.assign({}, ...[...attrLayers].reverse());
  for (let layer of attrLayers as Dynamic)
    for (let [attrName, attrValue] of Object.entries(layer) as Dynamic)
      parseComponentAttributeValue(
        attrValue,
        {
          editor: "text",
        },
        true,
      ).bound && (merged[attrName] = attrValue);
  return merged;
}
function mixedComponentAttributeKeys(attrLayers?: Dynamic): Dynamic {
  let mixedKeys: Dynamic = new Set();
  for (let key of new Set(
    attrLayers.flatMap((layer?: Dynamic): Dynamic => Object.keys(layer)),
  ) as Dynamic)
    attrLayers.some(
      (layer?: Dynamic): Dynamic => layer[key] !== attrLayers[0][key],
    ) && mixedKeys.add(key);
  return mixedKeys;
}
function useInferredComponentMetadata(
  selectionKey?: Dynamic,
  attrs?: Dynamic,
): Dynamic {
  let metaRef: Dynamic = (0, reactPropertiesDropShadowEditor.useRef)({
    selKey: "",
    meta: {},
  });
  metaRef.current.selKey !== selectionKey &&
    (metaRef.current = {
      selKey: selectionKey,
      meta: {},
    });
  metaRef.current.meta = {
    ...metaRef.current.meta,
    ...inferComponentAttributeMetadata(attrs),
  };
  return metaRef.current.meta;
}
function resolveComponentAttributeName(
  name?: Dynamic,
  attrs?: Dynamic,
): Dynamic {
  return Object.hasOwn(attrs, name)
    ? name
    : name.replace(
        /[A-Z]/g,
        (upperChar?: Dynamic): Dynamic => "-" + upperChar.toLowerCase(),
      );
}
function parseComponentAttributeValue(
  attrText?: Dynamic,
  propMeta?: Dynamic,
  allowYesLiteral: Dynamic = false,
): Dynamic {
  if (attrText == null)
    return {
      value: undefined,
      bound: false,
    };
  let bindingMatch: Dynamic = attrText.match(PropertiesInspectorFieldPattern);
  if (bindingMatch && !bindingMatch[1].includes("{{")) {
    let expression: Dynamic = bindingMatch[1].trim();
    if (expression === "true")
      return {
        value: true,
        bound: false,
      };
    if (expression === "false")
      return {
        value: false,
        bound: false,
      };
    if (allowYesLiteral && expression === "yes")
      return {
        value: true,
        bound: false,
      };
    if (numberLiteralPattern.test(expression))
      return {
        value: Number(expression),
        bound: false,
      };
    let quotedMatch: Dynamic = expression.match(/^(['"])([\s\S]*)\1$/);
    return quotedMatch
      ? {
          value: quotedMatch[2],
          bound: false,
        }
      : {
          value: undefined,
          bound: true,
        };
  }
  if (attrText.includes("{{"))
    return {
      value: undefined,
      bound: true,
    };
  if (propMeta.editor === "boolean")
    return {
      value: attrText !== "false" && attrText !== "",
      bound: false,
    };
  if (
    propMeta.editor === "int" ||
    propMeta.editor === "float" ||
    propMeta.editor === "range"
  ) {
    let numberValue: Dynamic = Number(attrText);
    return {
      value: Number.isFinite(numberValue) ? numberValue : undefined,
      bound: false,
    };
  }
  return {
    value: attrText,
    bound: false,
  };
}
function serializeComponentAttributeValue(attrValue?: Dynamic): Dynamic {
  return attrValue == null || Array.isArray(attrValue)
    ? null
    : typeof attrValue == "boolean" || typeof attrValue == "number"
      ? `{{ ${attrValue} }}`
      : String(attrValue);
}
function normalizeComponentColorOptions(propMeta?: Dynamic): Dynamic {
  if (propMeta.editor !== "color" || !Array.isArray(propMeta.options)) return propMeta;
  let nonPaletteOptions: Dynamic = propMeta.options.filter(
    (option?: Dynamic): Dynamic => !Array.isArray(option),
  );
  return nonPaletteOptions.length === propMeta.options.length
    ? propMeta
    : {
        ...propMeta,
        options: nonPaletteOptions,
      };
}
function ComponentImportPropsPanel({
  importName: importName,
  propsMeta: propsMeta,
  attrs: attrs,
  disabled: isDisabled,
  onCommit: onCommit,
  onEditComponent: onEditComponent,
  refKeys = PropertiesInspectorFieldNameComponentFromSet,
  emptyNote: emptyNote,
  schemaless = false,
  declared: declared,
  onEditInCode: onEditInCode,
  mixed: mixed,
}: Dynamic): Dynamic {
  useUiLocale();
  let declaredEntries: Dynamic = Object.entries(declared ?? {}).filter(
      ([attrName, propMeta]: Dynamic): Dynamic =>
        isEditablePropMetadata(propMeta) &&
        !reservedImportAttributePattern.test(
          attrName,
        ) &&
        !reservedImportAttributePattern.test(
          resolveComponentAttributeName(attrName, attrs),
        ),
    ),
    isBoundHandlerAttribute: Dynamic = (attrName?: Dynamic): Dynamic =>
      eventAttributePattern.test(attrName) &&
      parseComponentAttributeValue(
        attrs[resolveComponentAttributeName(attrName, attrs)],
        {},
        true,
      ).bound,
    items: Dynamic = [
      ...declaredEntries,
      ...Object.entries(propsMeta).filter(
        ([attrName, propMeta]: Dynamic): Dynamic =>
          isEditablePropMetadata(propMeta) &&
          !refKeys.has(attrName) &&
          !(
            declared &&
            (Object.hasOwn(declared, attrName) ||
              Object.hasOwn(
                declared,
                PropertiesInspectorFieldReplace(attrName),
              ))
          ) &&
          !isBoundHandlerAttribute(attrName),
      ),
    ];
  return !onEditComponent && items.length === 0 && !emptyNote ? null : (
    <PropertySection title={uiMessage("inspector.attributePropsPanel.props", { value1: String(importName) })}>
      {items.length === 0 && emptyNote && (<div
          className={"px-3.5 pt-3 pb-1 text-caption text-muted"}
          data-testid={"dc-import-props-empty"}
        >
          {emptyNote}
        </div>)}
      {onEditComponent && (<div className={"flex flex-col items-stretch gap-1 pt-3 px-3.5 pb-1"}>
          <Button
            variant={"secondary"}
            onClick={onEditComponent}
            data-testid={"dc-edit-imported-component"}
          >
            {isDisabled ? (uiMessage("inspector.attributePropsPanel.open")) : (uiMessage("inspector.attributePropsPanel.edit"))} {importName}
            {" \u2192"}
          </Button>
          <span className={"text-caption text-muted"}>
            {uiMessage("inspector.attributePropsPanel.opensThe")}
            {importName}
            {uiMessage("inspector.attributePropsPanel.artboard")}
          </span>
        </div>)}
      {items.length > 0 && (<div
          data-testid={"dc-import-props"}
          className={isDisabled ? "opacity-60" : "contents"}
          title={
            isDisabled ? (ViewOnlyYouCanInspectThisMessage) : (undefined)
          }
          aria-disabled={isDisabled || undefined}
        >
          <div className={"contents"} inert={isDisabled}>
            {items.map(
              ([attrName, propMeta]: Dynamic, index?: Dynamic): Dynamic => {
                let isDeclaredEntry: Dynamic = index < declaredEntries.length,
                  attrKey: Dynamic =
                    schemaless && !isDeclaredEntry
                      ? attrName
                      : resolveComponentAttributeName(attrName, attrs),
                  { value: attrValue, bound: isBound }: Dynamic =
                    parseComponentAttributeValue(
                      attrs[attrKey],
                      propMeta,
                      schemaless,
                    ),
                  isSchemalessHandler: Dynamic =
                    schemaless &&
                    (isDeclaredEntry
                      ? eventAttributePattern
                      : /^on/i
                    ).test(attrKey),
                  typeHint: Dynamic =
                    propMeta.default != null
                      ? String(propMeta.default)
                      : (propMeta.tsType ?? ""),
                  label: Dynamic =
                    schemaless && !isDeclaredEntry
                      ? PropertiesInspectorFieldTest(attrName)
                      : attrName;
                if (isBound || isSchemalessHandler) {
                  let rawValue: Dynamic = attrs[attrKey] ?? "",
                    bindingExpression: Dynamic = rawValue.match(
                      PropertiesInspectorFieldPattern,
                    )?.[1],
                    displayValue: Dynamic =
                      bindingExpression !== undefined && !bindingExpression.includes("{{")
                        ? bindingExpression.trim()
                        : rawValue,
                    isEventAttr: Dynamic = /^on/i.test(attrKey),
                    isLockedHandler: Dynamic = isEventAttr && !isBound,
                    isMixed: Dynamic = mixed?.has(attrKey) === true,
                    canEditInCode: Dynamic =
                      !isEventAttr &&
                      !isMixed &&
                      !isDisabled &&
                      onEditInCode !== undefined,
                    tooltip: Dynamic = isLockedHandler
                      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                      ? uiMessage("inspector.attributePropsPanel.thisAttributeCanTBe")
                      : isMixed &&
                          !isEventAttr &&
                          !isDisabled &&
                          onEditInCode !== undefined
                        ? uiMessage("inspector.attributePropsPanel.theSelectedInstancesSetThis")
                        : uiMessage("inspector.attributePropsPanel.setByThePageS") +
                          (canEditInCode
                            ? " Click to open it in Code."
                            : isEventAttr
                              ? " Ask the agent in chat to change it."
                              : "");
                  return (
                    <PropertyTextRow
                      key={attrName}
                      label={label}
                      title={tooltip}
                      disabled={isEventAttr || isMixed}
                    >
                      <PropertyPickerButton
                        className={"w-full"}
                        data-testid={"dc-import-prop-bound"}
                        title={tooltip}
                        aria-label={uiMessage("inspector.attributePropsPanel.undefined", { value1: String(label), value2: String((displayValue) || (uiMessage("inspector.attributePropsPanel.notSet"))) })}
                        muted={displayValue === ""}
                        disabled={!canEditInCode}
                        onClick={
                          canEditInCode
                            ? (): Dynamic => onEditInCode(attrKey)
                            : undefined
                        }
                        chip={
                          isLockedHandler ? undefined : (
                            <Icon
                              name={"CodeBrackets"}
                              size={"sm"}
                              className={"ml-1 shrink-0 text-muted"}
                            />
                          )
                        }
                      >
                        {displayValue || ("\u2014")}
                      </PropertyPickerButton>
                    </PropertyTextRow>
                  );
                }
                let resetHandler: Dynamic =
                  (!schemaless || isDeclaredEntry) &&
                  !isDisabled &&
                  attrs[attrKey] !== undefined
                    ? (): Dynamic => onCommit(attrKey, null)
                    : undefined;
                return schemaless && (propMeta.editor ?? "text") === "text" ? (
                  <PropertyTextRow
                    key={attrName}
                    label={label}
                    onReset={resetHandler}
                    onPress={(element?: Dynamic): Dynamic =>
                      element.querySelector("input")?.focus()
                    }
                  >
                    <PropertyTextInput
                      display={attrs[attrKey] ?? ""}
                      placeholder={""}
                      hint={typeHint}
                      aria-label={label}
                      disabled={isDisabled}
                      onCommitText={(text?: Dynamic): Dynamic =>
                        onCommit(attrKey, text === "" ? null : text)
                      }
                    />
                  </PropertyTextRow>
                ) : (
                  <ComponentPropInput
                    key={attrName}
                    name={label}
                    meta={normalizeComponentColorOptions(propMeta)}
                    value={attrValue}
                    unsetHint={isDeclaredEntry ? typeHint || "\u2014" : undefined}
                    onChange={(newValue?: Dynamic): Dynamic => {
                      isDisabled ||
                        onCommit(
                          attrKey,
                          serializeComponentAttributeValue(newValue),
                        );
                    }}
                    onReset={resetHandler}
                  />
                );
              },
            )}
          </div>
        </div>)}
    </PropertySection>
  );
}
export {
  ComponentImportPropsPanel,
  inferComponentAttributeMetadata,
  mergeComponentAttributeValues,
  mixedComponentAttributeKeys,
  normalizeComponentColorOptions,
  parseComponentAttributeValue,
  resolveComponentAttributeName,
  serializeComponentAttributeValue,
  useInferredComponentMetadata,
};
export function installEditorComponentsAttributePropsPanel(): () => void {
  return () => {};
}

import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { PropertyActions } from "./primitives";
import { PropertySection } from "./section";
import { BlurEffectRow, setOptionalEffectField, ShadowEffectRow } from "./shadow-effects";
import { asStyleRecord, createStyleBagEditor, defaultShadowValue, InnerShadowNeedsAFillOrMessage, NotOnDiamondOrArrowShapesMessage, ownStyleBagValue, PropertiesStyleBagConstant, PropertiesStyleBagFilterBackdropFilterConfig, propertyEffectLabel, reactPropertiesStyleBag, shadowEffectLabel, styleRecordList } from "./style-bag";
import { propertyAppliesToNode } from "../style-schema/validation";
import { StyleSchemaValuesLimit } from "../style-schema/values";

var PropertiesEffectsSectionBoxShadowFilterBackdropFilterValues: Dynamic;
function propertyEffectAddItems(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value: Dynamic = "box",
  extra?: Dynamic,
  detail: Dynamic = false,
  argument: Dynamic = NotOnDiamondOrArrowShapesMessage,
): Dynamic {
  let items: Dynamic = [],
    value2: Dynamic = getShadowProperty(input, value);
  if ((0, propertyAppliesToNode)(value2, input)) {
    let value3: Dynamic = (0, styleRecordList)(
        (0, ownStyleBagValue)(options, value2),
      ),
      value4: Dynamic =
        value3.length >= StyleSchemaValuesLimit
          ? {
              disabledReason: uiMessage("inspector.effectsSection.atMostValue1PerElement", { value1: String(StyleSchemaValuesLimit) }),
            }
          : {},
      callback: Dynamic =
        (input2?: Dynamic): Dynamic =>
        (): Dynamic =>
          context(value2, [
            ...value3,
            (0, defaultShadowValue)(value2, input2),
          ]),
      value5: Dynamic =
        extra ??
        (value3.length >= StyleSchemaValuesLimit
          ? uiMessage("inspector.effectsSection.atMostValue1PerElement", { value1: String(StyleSchemaValuesLimit) })
          : undefined);
    items.push(
      value5 !== undefined
        ? {
            get label() { return uiMessage("inspector.effectsSection.dropShadow"); },
            onSelect: (): Dynamic => {},
            disabledReason: value5,
          }
        : {
            get label() { return uiMessage("inspector.effectsSection.dropShadow"); },
            onSelect: callback(false),
          },
    );
    items.push(
      value2 === "textShadow"
        ? {
            get label() { return uiMessage("inspector.effectsSection.innerShadow"); },
            onSelect: (): Dynamic => {},
            disabledReason: detail
              ? argument
              : InnerShadowNeedsAFillOrMessage,
          }
        : {
            get label() { return uiMessage("inspector.effectsSection.innerShadow"); },
            onSelect: callback(true),
            ...value4,
            ...(detail
              ? {
                  disabledReason: argument,
                }
              : {}),
          },
    );
  }
  for (let value3 of ["filter", "backdropFilter"] as Dynamic) {
    let value4: Dynamic = (0, asStyleRecord)(
      (0, ownStyleBagValue)(options, value3),
    );
    !(0, propertyAppliesToNode)(value3, input) ||
      value4?.blur !== undefined ||
      items.push({
        label:
          PropertiesStyleBagFilterBackdropFilterConfig[value3] ??
          (0, propertyEffectLabel)(value3),
        onSelect: (): Dynamic =>
          context(
            value3,
            (0, setOptionalEffectField)(
              value4,
              "blur",
              PropertiesStyleBagConstant,
            ),
          ),
        ...(detail && value3 === "backdropFilter"
          ? {
              disabledReason: argument,
            }
          : {}),
      });
  }
  return items;
}
function getShadowProperty(input?: Dynamic, options?: Dynamic): Dynamic {
  return options === "text" &&
    (0, propertyAppliesToNode)("textShadow", input)
    ? "textShadow"
    : "boxShadow";
}
function EffectsSection(input?: Dynamic): Dynamic {
  useUiLocale();
  let {
      kind: value,
      bag: value2,
      subsection: value3,
      blurRows: value6 = true,
      children: value4,
      shadowTarget: value7 = "box",
      dropShadowDisabledReason: value5,
    }: Dynamic = input,
    value8: Dynamic = (0, reactPropertiesStyleBag.useState)(
      undefined,
    ),
    [value9, value10]: Dynamic =
      input.setOpenEditor !== undefined
        ? [input.openEditor, input.setOpenEditor]
        : value8,
    state: Dynamic = {
      ...(0, createStyleBagEditor)(input),
      openEditor: value9,
      setOpenEditor: value10,
    },
    items: Dynamic = [
      ...propertyEffectAddItems(
        value,
        value2,
        (input2?: Dynamic, items2?: Dynamic): Dynamic => {
          Array.isArray(items2) &&
            value10({
              key: input2,
              index: items2.length - 1,
            });
          state.commit(input2, items2);
        },
        value7,
        value5,
        input.silhouette,
        input.silhouetteReason,
      ),
      ...(input.addItems ?? []),
    ];
  if (
    items.length === 0 &&
    value2 === undefined &&
    value4 === undefined &&
    !PropertiesEffectsSectionBoxShadowFilterBackdropFilterValues.some(
      (input2?: Dynamic): Dynamic =>
        (0, propertyAppliesToNode)(input2, value),
    )
  )
    return null;
  let value11: Dynamic =
      getShadowProperty(value, value7) === "textShadow"
        ? ["boxShadow", "textShadow"]
        : ["boxShadow"],
    callback: Dynamic = (input2?: Dynamic, options?: Dynamic): Dynamic =>
      value7 !== "text"
        ? (0, shadowEffectLabel)(input2, options)
        : input2 === "textShadow"
          ? uiMessage("inspector.effectsSection.dropShadow")
          : input2 === "boxShadow"
            ? (0, asStyleRecord)(options)?.inset === true
              ? uiMessage("inspector.effectsSection.innerShadow")
              : uiMessage("inspector.effectsSection.boxShadow")
            : (0, shadowEffectLabel)(input2, options);
  return (
    <PropertySection
      title={uiMessage("inspector.effectsSection.effects")}
      subsection={value3}
      iconColumn={true}
      actions={
        <PropertyActions
          section={"Effects"}
          items={items}
          disabled={state.disabled}
        />
      }
    >
      {value11.flatMap((input2?: Dynamic): Dynamic => {
        let value12: Dynamic = (0, styleRecordList)(
          (0, ownStyleBagValue)(value2, input2),
        );
        return value12.map(
          (input3?: Dynamic, options?: Dynamic): Dynamic =>
            (() => {
              const _Component = ShadowEffectRow;
              const _props = {
                propKey: input2,
                list: value12,
                index: options,
                rec: input3,
                ed: state,
                label: callback(input2, input3),
              } as const;
              const _key = input2 + String(options);
              return <_Component key={_key} {..._props} />;
            })(),
        );
      })}
      {value6 && (["filter", "backdropFilter"].map((input2?: Dynamic): Dynamic => {
          let value12: Dynamic = (0, asStyleRecord)(
            (0, ownStyleBagValue)(value2, input2),
          );
          return value12?.blur !== undefined &&
            (0, propertyAppliesToNode)(input2, value) ? (
            <BlurEffectRow
              key={input2}
              label={
                PropertiesStyleBagFilterBackdropFilterConfig[
                  input2
                ] ?? ((0, propertyEffectLabel)(input2))
              }
              propKey={input2}
              rec={value12}
              ed={state}
            />
          ) : null;
        }))}
      {value4}
    </PropertySection>
  );
}
export {
  EffectsSection,
  getShadowProperty,
  PropertiesEffectsSectionBoxShadowFilterBackdropFilterValues,
  propertyEffectAddItems,
};
export function installEditorPropertiesEffectsSection(): () => void {
  return () => {
    PropertiesEffectsSectionBoxShadowFilterBackdropFilterValues = [
      "boxShadow",
      "filter",
      "backdropFilter",
    ];
  };
}

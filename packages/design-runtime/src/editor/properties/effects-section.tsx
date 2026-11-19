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
  nodeKind?: Dynamic,
  styleBag?: Dynamic,
  commitProperty?: Dynamic,
  shadowTarget: Dynamic = "box",
  dropShadowDisabledReason?: Dynamic,
  hasSilhouette: Dynamic = false,
  silhouetteReason: Dynamic = NotOnDiamondOrArrowShapesMessage,
): Dynamic {
  let items: Dynamic = [],
    shadowProperty: Dynamic = getShadowProperty(nodeKind, shadowTarget);
  if (propertyAppliesToNode(shadowProperty, nodeKind)) {
    let shadowList: Dynamic = styleRecordList(
        ownStyleBagValue(styleBag, shadowProperty),
      ),
      limitDisabled: Dynamic =
        shadowList.length >= StyleSchemaValuesLimit
          ? {
              disabledReason: uiMessage("inspector.effectsSection.atMostValue1PerElement", { value1: String(StyleSchemaValuesLimit) }),
            }
          : {},
      createAddShadow: Dynamic =
        (isInset?: Dynamic): Dynamic =>
        (): Dynamic =>
          commitProperty(shadowProperty, [
            ...shadowList,
            defaultShadowValue(shadowProperty, isInset),
          ]),
      dropShadowReason: Dynamic =
        dropShadowDisabledReason ??
        (shadowList.length >= StyleSchemaValuesLimit
          ? uiMessage("inspector.effectsSection.atMostValue1PerElement", { value1: String(StyleSchemaValuesLimit) })
          : undefined);
    items.push(
      dropShadowReason !== undefined
        ? {
            get label() { return uiMessage("inspector.effectsSection.dropShadow"); },
            onSelect: (): Dynamic => {},
            disabledReason: dropShadowReason,
          }
        : {
            get label() { return uiMessage("inspector.effectsSection.dropShadow"); },
            onSelect: createAddShadow(false),
          },
    );
    items.push(
      shadowProperty === "textShadow"
        ? {
            get label() { return uiMessage("inspector.effectsSection.innerShadow"); },
            onSelect: (): Dynamic => {},
            disabledReason: hasSilhouette
              ? silhouetteReason
              : InnerShadowNeedsAFillOrMessage,
          }
        : {
            get label() { return uiMessage("inspector.effectsSection.innerShadow"); },
            onSelect: createAddShadow(true),
            ...limitDisabled,
            ...(hasSilhouette
              ? {
                  disabledReason: silhouetteReason,
                }
              : {}),
          },
    );
  }
  for (let filterKey of ["filter", "backdropFilter"] as Dynamic) {
    let filterRecord: Dynamic = asStyleRecord(
      ownStyleBagValue(styleBag, filterKey),
    );
    !propertyAppliesToNode(filterKey, nodeKind) ||
      filterRecord?.blur !== undefined ||
      items.push({
        label:
          PropertiesStyleBagFilterBackdropFilterConfig[filterKey] ??
          propertyEffectLabel(filterKey),
        onSelect: (): Dynamic =>
          commitProperty(
            filterKey,
            setOptionalEffectField(
              filterRecord,
              "blur",
              PropertiesStyleBagConstant,
            ),
          ),
        ...(hasSilhouette && filterKey === "backdropFilter"
          ? {
              disabledReason: silhouetteReason,
            }
          : {}),
      });
  }
  return items;
}
function getShadowProperty(nodeKind?: Dynamic, shadowTarget?: Dynamic): Dynamic {
  return shadowTarget === "text" &&
    propertyAppliesToNode("textShadow", nodeKind)
    ? "textShadow"
    : "boxShadow";
}
function EffectsSection(props?: Dynamic): Dynamic {
  useUiLocale();
  let {
      kind: nodeKind,
      bag: styleBag,
      subsection: subsection,
      blurRows: showBlurRows = true,
      children: extraChildren,
      shadowTarget: shadowTarget = "box",
      dropShadowDisabledReason: dropShadowDisabledReason,
    }: Dynamic = props,
    localOpenEditor: Dynamic = (0, reactPropertiesStyleBag.useState)(
      undefined,
    ),
    [openEditor, setOpenEditor]: Dynamic =
      props.setOpenEditor !== undefined
        ? [props.openEditor, props.setOpenEditor]
        : localOpenEditor,
    state: Dynamic = {
      ...createStyleBagEditor(props),
      openEditor: openEditor,
      setOpenEditor: setOpenEditor,
    },
    items: Dynamic = [
      ...propertyEffectAddItems(
        nodeKind,
        styleBag,
        (propKey?: Dynamic, records?: Dynamic): Dynamic => {
          Array.isArray(records) &&
            setOpenEditor({
              key: propKey,
              index: records.length - 1,
            });
          state.commit(propKey, records);
        },
        shadowTarget,
        dropShadowDisabledReason,
        props.silhouette,
        props.silhouetteReason,
      ),
      ...(props.addItems ?? []),
    ];
  if (
    items.length === 0 &&
    styleBag === undefined &&
    extraChildren === undefined &&
    !PropertiesEffectsSectionBoxShadowFilterBackdropFilterValues.some(
      (propKey?: Dynamic): Dynamic =>
        propertyAppliesToNode(propKey, nodeKind),
    )
  )
    return null;
  let shadowPropKeys: Dynamic =
      getShadowProperty(nodeKind, shadowTarget) === "textShadow"
        ? ["boxShadow", "textShadow"]
        : ["boxShadow"],
    shadowLabel: Dynamic = (propKey?: Dynamic, record?: Dynamic): Dynamic =>
      shadowTarget !== "text"
        ? shadowEffectLabel(propKey, record)
        : propKey === "textShadow"
          ? uiMessage("inspector.effectsSection.dropShadow")
          : propKey === "boxShadow"
            ? asStyleRecord(record)?.inset === true
              ? uiMessage("inspector.effectsSection.innerShadow")
              : uiMessage("inspector.effectsSection.boxShadow")
            : shadowEffectLabel(propKey, record);
  return (
    <PropertySection
      title={uiMessage("inspector.effectsSection.effects")}
      subsection={subsection}
      iconColumn={true}
      actions={
        <PropertyActions
          section={"Effects"}
          items={items}
          disabled={state.disabled}
        />
      }
    >
      {shadowPropKeys.flatMap((propKey?: Dynamic): Dynamic => {
        let records: Dynamic = styleRecordList(
          ownStyleBagValue(styleBag, propKey),
        );
        return records.map(
          (record?: Dynamic, index?: Dynamic): Dynamic =>
            (() => {
              const _Component = ShadowEffectRow;
              const _props = {
                propKey: propKey,
                list: records,
                index: index,
                rec: record,
                ed: state,
                label: shadowLabel(propKey, record),
              } as const;
              const _key = propKey + String(index);
              return <_Component key={_key} {..._props} />;
            })(),
        );
      })}
      {showBlurRows && (["filter", "backdropFilter"].map((propKey?: Dynamic): Dynamic => {
          let record: Dynamic = asStyleRecord(
            ownStyleBagValue(styleBag, propKey),
          );
          return record?.blur !== undefined &&
            propertyAppliesToNode(propKey, nodeKind) ? (
            <BlurEffectRow
              key={propKey}
              label={
                PropertiesStyleBagFilterBackdropFilterConfig[
                  propKey
                ] ?? (propertyEffectLabel(propKey))
              }
              propKey={propKey}
              rec={record}
              ed={state}
            />
          ) : null;
        }))}
      {extraChildren}
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

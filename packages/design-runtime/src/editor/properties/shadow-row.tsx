import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { CssGradientsXYBlurConfig, parseCssBoxShadow, serializeCssBoxShadow } from "../css/gradients";
import { classifyStyleValue } from "../css/values";
import { useInspectorContext } from "../inspector/context-part-2";
import { jsxPropertiesAssetPicker_3, PropertyAssetPopup, PropertyPopupField, reactPropertiesAssetPicker_3 } from "./asset-picker";
import { AuthoredColorPicker, CssColorWell, CssNumericPopupInput, CssNumericPopupRow, PropertySelectTrigger } from "./background-editor";
import { PropertyRow } from "./row";

function PropertyShadowRow({
  label: label,
  prop = "box-shadow",
  value: value,
  disabled: disabled2,
  mixed: mixed,
  inherited: inherited,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let value2: Dynamic = prop === "text-shadow",
    [value3, value4]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(false),
    { setOverlayHidden: value5 }: Dynamic = useInspectorContext();
  (0, reactPropertiesAssetPicker_3.useEffect)((): Dynamic => {
    if (value3) {
      value5(true);
      return (): Dynamic => value5(false);
    }
  }, [value3, value5]);
  let value6: Dynamic = parseCssBoxShadow(value),
    value7: Dynamic = mixed
      ? "Mixed"
      : value6
        ? `${value6.x} ${value6.y} ${value6.blur}`
        : value && classifyStyleValue(value).kind !== "literal"
          ? value
          : "None",
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      onCommitMany([
        {
          prop: prop,
          value: input
            ? value2
              ? `${input.x}px ${input.y}px ${input.blur}px ${input.color}`
              : serializeCssBoxShadow(input)
            : null,
        },
      ]),
    value8: Dynamic = value6 ?? CssGradientsXYBlurConfig;
  return (
    <PropertyAssetPopup
      open={value3}
      onOpenChange={(input?: Dynamic): Dynamic => {
        input &&
          !value &&
          !mixed &&
          callback(CssGradientsXYBlurConfig);
        value4(input);
      }}
      title={label}
      removeLabel={"Remove shadow"}
      removeDisabled={disabled2 || (!value && !mixed) || !!inherited}
      onRemove={(): Dynamic => callback(null)}
      data-testid={"dc-shadow-popover"}
      trigger={
        <PropertySelectTrigger
          aria-label={uiMessage("inspector.shadowRow.undefined", { value1: String(label), value2: String(value7) })}
          disabled={disabled2}
          chip={
            <CssColorWell
              css={
                value6
                  ? `radial-gradient(circle at 35% 35%, ${value6.color}, transparent)`
                  : undefined
              }
            />
          }
          muted={mixed}
        >
          {value7}
        </PropertySelectTrigger>
      }
    >
      {!value6 && (value || mixed) && (<PropertyRow>
          <Button
            variant={"secondary"}
            size={"sm"}
            disabled={disabled2}
            onClick={(): Dynamic =>
              callback(CssGradientsXYBlurConfig)
            }
          >
            {uiMessage("inspector.shadowRow.addShadow")}
          </Button>
        </PropertyRow>)}
      {value6 && (<jsxPropertiesAssetPicker_3.Fragment>
          <PropertyRow label={uiMessage("inspector.shadowRow.offset")}>
            <div className={"flex min-w-0 flex-1 items-center gap-2"}>
              <CssNumericPopupInput
                name={"Horizontal offset"}
                prefix={"X"}
                unit={""}
                value={value8.x}
                steppers={false}
                disabled={disabled2}
                onChange={(input?: Dynamic): Dynamic =>
                  callback({
                    ...value8,
                    x: input,
                  })
                }
              />
              <CssNumericPopupInput
                name={"Vertical offset"}
                prefix={"Y"}
                unit={""}
                value={value8.y}
                steppers={false}
                disabled={disabled2}
                onChange={(input?: Dynamic): Dynamic =>
                  callback({
                    ...value8,
                    y: input,
                  })
                }
              />
            </div>
          </PropertyRow>
          <CssNumericPopupRow
            label={uiMessage("inspector.shadowRow.blur")}
            value={value8.blur}
            disabled={disabled2}
            min={0}
            onChange={(input?: Dynamic): Dynamic =>
              callback({
                ...value8,
                blur: input,
              })
            }
          />
          {!value2 && (<CssNumericPopupRow
              label={uiMessage("inspector.shadowRow.spread")}
              value={value8.spread}
              disabled={disabled2}
              onChange={(input?: Dynamic): Dynamic =>
                callback({
                  ...value8,
                  spread: input,
                })
              }
            />)}
          <PropertyPopupField label={uiMessage("inspector.shadowRow.color")}>
            <AuthoredColorPicker
              value={value8.color}
              disabled={disabled2}
              plain={true}
              onChange={(input?: Dynamic): Dynamic =>
                callback({
                  ...value8,
                  color: input,
                })
              }
            />
          </PropertyPopupField>
        </jsxPropertiesAssetPicker_3.Fragment>)}
    </PropertyAssetPopup>
  );
}
export {
  PropertyShadowRow,
};
export function installEditorPropertiesShadowRow(): () => void {
  return () => {};
}

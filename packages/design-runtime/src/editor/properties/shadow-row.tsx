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
  value: shadowValue,
  disabled: isDisabled,
  mixed: mixed,
  inherited: inherited,
  onCommitMany: onCommitMany,
}: Dynamic): Dynamic {
  useUiLocale();
  let isTextShadow: Dynamic = prop === "text-shadow",
    [isOpen, setIsOpen]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(false),
    { setOverlayHidden: setOverlayHidden }: Dynamic = useInspectorContext();
  (0, reactPropertiesAssetPicker_3.useEffect)((): Dynamic => {
    if (isOpen) {
      setOverlayHidden(true);
      return (): Dynamic => setOverlayHidden(false);
    }
  }, [isOpen, setOverlayHidden]);
  let parsedShadow: Dynamic = parseCssBoxShadow(shadowValue),
    summaryText: Dynamic = mixed
      ? "Mixed"
      : parsedShadow
        ? `${parsedShadow.x} ${parsedShadow.y} ${parsedShadow.blur}`
        : shadowValue && classifyStyleValue(shadowValue).kind !== "literal"
          ? shadowValue
          : "None",
    commitShadow: Dynamic = (shadow?: Dynamic): Dynamic =>
      onCommitMany([
        {
          prop: prop,
          value: shadow
            ? isTextShadow
              ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`
              : serializeCssBoxShadow(shadow)
            : null,
        },
      ]),
    editableShadow: Dynamic = parsedShadow ?? CssGradientsXYBlurConfig;
  return (
    <PropertyAssetPopup
      open={isOpen}
      onOpenChange={(nextOpen?: Dynamic): Dynamic => {
        nextOpen &&
          !shadowValue &&
          !mixed &&
          commitShadow(CssGradientsXYBlurConfig);
        setIsOpen(nextOpen);
      }}
      title={label}
      removeLabel={"Remove shadow"}
      removeDisabled={isDisabled || (!shadowValue && !mixed) || !!inherited}
      onRemove={(): Dynamic => commitShadow(null)}
      data-testid={"dc-shadow-popover"}
      trigger={
        <PropertySelectTrigger
          aria-label={uiMessage("inspector.shadowRow.undefined", { value1: String(label), value2: String(summaryText) })}
          disabled={isDisabled}
          chip={
            <CssColorWell
              css={
                parsedShadow
                  ? `radial-gradient(circle at 35% 35%, ${parsedShadow.color}, transparent)`
                  : undefined
              }
            />
          }
          muted={mixed}
        >
          {summaryText}
        </PropertySelectTrigger>
      }
    >
      {!parsedShadow && (shadowValue || mixed) && (<PropertyRow>
          <Button
            variant={"secondary"}
            size={"sm"}
            disabled={isDisabled}
            onClick={(): Dynamic =>
              commitShadow(CssGradientsXYBlurConfig)
            }
          >
            {uiMessage("inspector.shadowRow.addShadow")}
          </Button>
        </PropertyRow>)}
      {parsedShadow && (<jsxPropertiesAssetPicker_3.Fragment>
          <PropertyRow label={uiMessage("inspector.shadowRow.offset")}>
            <div className={"flex min-w-0 flex-1 items-center gap-2"}>
              <CssNumericPopupInput
                name={"Horizontal offset"}
                prefix={"X"}
                unit={""}
                value={editableShadow.x}
                steppers={false}
                disabled={isDisabled}
                onChange={(nextX?: Dynamic): Dynamic =>
                  commitShadow({
                    ...editableShadow,
                    x: nextX,
                  })
                }
              />
              <CssNumericPopupInput
                name={"Vertical offset"}
                prefix={"Y"}
                unit={""}
                value={editableShadow.y}
                steppers={false}
                disabled={isDisabled}
                onChange={(nextY?: Dynamic): Dynamic =>
                  commitShadow({
                    ...editableShadow,
                    y: nextY,
                  })
                }
              />
            </div>
          </PropertyRow>
          <CssNumericPopupRow
            label={uiMessage("inspector.shadowRow.blur")}
            value={editableShadow.blur}
            disabled={isDisabled}
            min={0}
            onChange={(nextBlur?: Dynamic): Dynamic =>
              commitShadow({
                ...editableShadow,
                blur: nextBlur,
              })
            }
          />
          {!isTextShadow && (<CssNumericPopupRow
              label={uiMessage("inspector.shadowRow.spread")}
              value={editableShadow.spread}
              disabled={isDisabled}
              onChange={(nextSpread?: Dynamic): Dynamic =>
                commitShadow({
                  ...editableShadow,
                  spread: nextSpread,
                })
              }
            />)}
          <PropertyPopupField label={uiMessage("inspector.shadowRow.color")}>
            <AuthoredColorPicker
              value={editableShadow.color}
              disabled={isDisabled}
              plain={true}
              onChange={(nextColor?: Dynamic): Dynamic =>
                commitShadow({
                  ...editableShadow,
                  color: nextColor,
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

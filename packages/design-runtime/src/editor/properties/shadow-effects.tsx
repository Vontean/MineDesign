import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { ColorEffectButton, PropertyEditorPopover, RemovePropertyButton, ShadowEditor } from "./effect-popup";
import { PropertyNumberRow, PropertyTextRow } from "./rows";
import { asFiniteStyleNumber, asStyleString, clampStyleRangeField, PropertiesStyleBagItems, PropertiesStyleBagItems_2 as effectRangeFields, propertyDefaultEditorValue, propertyValidatorForNode, reactPropertiesStyleBag, shadowEffectLabel, styleRangeField, styleRangeFieldValue } from "./style-bag";
import { validateStyleColor } from "../style-schema/color-and-font";
import { shadowFieldBounds } from "../style-schema/shadow";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesShadowEffectsFromEntriesValue: Dynamic;
var reactPropertiesShadowEffects: Dynamic;
function canonicalStyleColor(colorText?: Dynamic): Dynamic {
  let validation: Dynamic = validateStyleColor(colorText);
  return typeof validation == "string"
    ? validation
    : validation === true
      ? colorText.trim().toLowerCase()
      : undefined;
}
function setOptionalEffectField(
  effect?: Dynamic,
  fieldName?: Dynamic,
  fieldValue?: Dynamic,
): Dynamic {
  if (fieldValue !== undefined)
    return {
      ...effect,
      [fieldName]: fieldValue,
    };
  let { [fieldName]: removedValue, ...remainingFields }: Dynamic = effect ?? {};
  return Object.keys(remainingFields).length === 0 ? undefined : remainingFields;
}
function useEffectPopover(
  propKey?: Dynamic,
  editor?: Dynamic,
  index: Dynamic = 0,
): Dynamic {
  let [localOpenEditor, setLocalOpenEditor]: Dynamic = (0,
    reactPropertiesStyleBag.useState)(undefined),
    openEditor: Dynamic =
      editor.setOpenEditor !== undefined ? editor.openEditor : localOpenEditor,
    setOpenEditor: Dynamic = editor.setOpenEditor ?? setLocalOpenEditor,
    isOpen: Dynamic = openEditor?.key === propKey && openEditor.index === index,
    [openedByKeyboard, setOpenedByKeyboard]: Dynamic = (0, reactPropertiesStyleBag.useState)(
      false,
    ),
    setOpen: Dynamic = (shouldOpen?: Dynamic): Dynamic =>
      setOpenEditor(
        (currentEditor?: Dynamic): Dynamic =>
          shouldOpen
            ? {
                key: propKey,
                index: index,
              }
            : currentEditor?.key === propKey && currentEditor.index === index
              ? undefined
              : currentEditor,
      ),
    closeAfterRemove: Dynamic = (): Dynamic =>
      setOpenEditor(
        (currentEditor?: Dynamic): Dynamic =>
          currentEditor?.key !== propKey
            ? currentEditor
            : currentEditor.index === index
              ? undefined
              : currentEditor.index > index
                ? {
                    key: propKey,
                    index: currentEditor.index - 1,
                  }
                : currentEditor,
      ),
    wrapRef: Dynamic = (0, reactPropertiesStyleBag.useRef)(null);
  return {
    open: isOpen,
    setOpen: setOpen,
    removed: closeAfterRemove,
    byKeyboard: openedByKeyboard,
    setByKeyboard: setOpenedByKeyboard,
    wrapRef: wrapRef,
    anchor: (): Dynamic =>
      wrapRef.current?.closest("[data-property-row]") ?? null,
  };
}
function shadowEditorValue(shadow?: Dynamic, hasSpread?: Dynamic): Dynamic {
  return {
    x: asFiniteStyleNumber(shadow.x) ?? 0,
    y: asFiniteStyleNumber(shadow.y) ?? 0,
    blur: asFiniteStyleNumber(shadow.blur) ?? 0,
    ...(hasSpread
      ? {
          spread: asFiniteStyleNumber(shadow.spread) ?? 0,
        }
      : {}),
    color: asStyleString(shadow.color) ?? "#000000",
  };
}
function normalizeShadowEditorValue(
  shadow?: Dynamic,
  previous?: Dynamic,
  hasSpread?: Dynamic,
  blurBounds?: Dynamic,
): Dynamic {
  let [xBounds, yBounds, defaultBlurBounds]: Dynamic = PropertiesStyleBagItems,
    normalized: Dynamic = {
      x: clampStyleRangeField(xBounds, shadow.x),
      y: clampStyleRangeField(yBounds, shadow.y),
      blur: clampStyleRangeField(blurBounds ?? defaultBlurBounds, shadow.blur),
      color: canonicalStyleColor(shadow.color) ?? previous?.color ?? "#000000",
    };
  hasSpread &&
    (normalized.spread = clampStyleRangeField(
      styleRangeFieldValue,
      shadow.spread ?? 0,
    ));
  previous?.inset === true && (normalized.inset = true);
  return normalized;
}
function ShadowEffectRow({
  propKey: propKey,
  list: list,
  index: index,
  rec: rec,
  ed: editor,
  label: label,
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      open: isOpen,
      setOpen: setOpen,
      removed: removeEffect,
      byKeyboard: openedByKeyboard,
      setByKeyboard: setOpenedByKeyboard,
      wrapRef: wrapRef,
      anchor: getAnchor,
    }: Dynamic = useEffectPopover(propKey, editor, index),
    isBoxShadow: Dynamic = propKey === "boxShadow",
    effectLabel: Dynamic = label ?? shadowEffectLabel(propKey, rec),
    shadowState: Dynamic =
      rec !== undefined ? shadowEditorValue(rec, isBoxShadow) : undefined,
    blurBounds: Dynamic = styleRangeField(
      shadowFieldBounds(
        propertyValidatorForNode(propKey, editor.kind),
      ),
      "blur",
      "Blur",
      "len",
      1,
      "px",
    ),
    editorBounds: Dynamic =
      blurBounds.max === PropertiesShadowEffectsFromEntriesValue.blur?.max
        ? PropertiesShadowEffectsFromEntriesValue
        : {
            ...PropertiesShadowEffectsFromEntriesValue,
            blur: {
              min: blurBounds.min,
              max: blurBounds.max,
              step: blurBounds.step,
            },
          },
    commitList: Dynamic = (updatedEffect?: Dynamic): Dynamic => {
      let nextList: Dynamic =
        updatedEffect === undefined
          ? list.filter(
              (item?: Dynamic, itemIndex?: Dynamic): Dynamic =>
                itemIndex !== index,
            )
          : list.map(
              (item?: Dynamic, itemIndex?: Dynamic): Dynamic =>
                itemIndex === index ? updatedEffect : item,
            );
      return nextList.length === 0 ? undefined : nextList;
    },
    live: Dynamic = editor.live;
  return (
    <PropertyTextRow
      label={effectLabel}
      disabled={editor.disabled}
      title={editor.whyDisabled}
      trailing={
        <RemovePropertyButton
          label={effectLabel}
          disabled={editor.disabled || rec === undefined}
          onClick={(): Dynamic => {
            removeEffect();
            editor.commit(propKey, commitList(undefined));
          }}
        />
      }
    >
      <span ref={wrapRef} className={"relative flex min-w-0 flex-1"}>
        <PropertyEditorPopover
          open={isOpen && rec !== undefined}
          onOpenChange={setOpen}
          trigger={
            <ColorEffectButton
              label={effectLabel}
              color={shadowState?.color ?? null}
              text={
                shadowState !== undefined
                  ? `${shadowState.x}, ${shadowState.y} \xB7 ${shadowState.blur}px`
                  : "None"
              }
              disabled={editor.disabled}
              onClick={(event?: Dynamic): Dynamic => {
                rec === undefined &&
                  editor.commit(
                    propKey,
                    propertyDefaultEditorValue(
                      propKey,
                      editor.kind,
                    ),
                  );
                setOpenedByKeyboard(event.detail === 0);
              }}
            />
          }
          anchor={getAnchor}
          focusOnOpen={openedByKeyboard}
        >
          <ShadowEditor
            title={effectLabel}
            value={shadowState ?? shadowEditorValue({}, isBoxShadow)}
            spread={isBoxShadow}
            bounds={editorBounds}
            disabled={editor.disabled}
            swatches={editor.swatches}
            unifiedPopover={editor.unifiedColorPopover}
            onChange={(nextShadow?: Dynamic): Dynamic =>
              editor.commit(
                propKey,
                commitList(
                  normalizeShadowEditorValue(nextShadow, rec, isBoxShadow, blurBounds),
                ),
              )
            }
            {...(live && editor.liveEnd
              ? {
                  onLive: (liveShadow?: Dynamic): Dynamic =>
                    live(
                      propKey,
                      commitList(
                        normalizeShadowEditorValue(
                          liveShadow,
                          rec,
                          isBoxShadow,
                          blurBounds,
                        ),
                      ),
                    ),
                  onLiveEnd: editor.liveEnd,
                }
              : {})}
            onClose={(): Dynamic => setOpen(false)}
          />
        </PropertyEditorPopover>
      </span>
    </PropertyTextRow>
  );
}
function BlurEffectRow({
  label: label,
  propKey: propKey,
  rec: rec,
  ed: editor,
}: Dynamic): Dynamic {
  useUiLocale();
  let blurField: Dynamic = effectRangeFields.find(
      (field?: Dynamic): Dynamic => field.field === "blur",
    ),
    commitBlur: Dynamic = (blurValue?: Dynamic): Dynamic =>
      setOptionalEffectField(rec, blurField.field, blurValue),
    live: Dynamic = editor.live;
  return (
    <PropertyNumberRow
      label={label}
      value={asFiniteStyleNumber(rec[blurField.field])}
      placeholder={"0"}
      min={blurField.min}
      max={blurField.max}
      step={blurField.step}
      unit={blurField.unit}
      disabled={editor.disabled}
      onValue={(enteredValue?: Dynamic): Dynamic =>
        enteredValue !== undefined &&
        editor.commit(
          propKey,
          commitBlur(clampStyleRangeField(blurField, enteredValue)),
        )
      }
      {...(live && editor.liveEnd
        ? {
            onScrub: (scrubValue?: Dynamic): Dynamic =>
              live(
                propKey,
                commitBlur(clampStyleRangeField(blurField, scrubValue)),
              ),
            onScrubEnd: editor.liveEnd,
          }
        : {})}
      trailing={
        <RemovePropertyButton
          label={label}
          disabled={editor.disabled}
          onClick={(): Dynamic => editor.commit(propKey, commitBlur(undefined))}
        />
      }
    />
  );
}
export {
  BlurEffectRow,
  canonicalStyleColor,
  normalizeShadowEditorValue,
  PropertiesShadowEffectsFromEntriesValue,
  reactPropertiesShadowEffects,
  setOptionalEffectField,
  shadowEditorValue,
  ShadowEffectRow,
  useEffectPopover,
};
export function installEditorPropertiesShadowEffects(): () => void {
  return () => {
    PropertiesShadowEffectsFromEntriesValue = Object.fromEntries(
      [...PropertiesStyleBagItems, styleRangeFieldValue].map(
        (field?: Dynamic): Dynamic => [
          field.field,
          {
            min: field.min,
            max: field.max,
            step: field.step,
          },
        ],
      ),
    );
    reactPropertiesShadowEffects = toModuleNamespace(
      load_react(),
      1,
    );
  };
}

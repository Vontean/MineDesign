import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { TextArea } from "../cds/components/text-area";
import { initializeCdsIndex } from "../cds/index";
import { PopoverPopoverRootTriggerPopupConfig } from "../cds/popover/popover";
import { cn } from "../cds/theme/class-names";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { useDesignSystems } from "../design-system/store";
import { choosePopoverPlacement } from "../editor/chrome/focus";
import { ColorPickerConstant, ColorPickerLabel } from "../editor/color/picker";
import { ComponentPropInput, designSystemPropColorOptions, primitivePropText, propColorEditorKind, propColorOptionKeys, propOptionItems, PropPaletteCards, restorePropColorOption } from "../editor/components/prop-editors";
import { isEditablePropMetadata } from "../editor/components/prop-validation";
import { groupComponentProps } from "../editor/components/props-panel";
import { ViewOnlyYouCanInspectThisMessage } from "../editor/outline/annotations";
import { ColorPickerWithSwatches } from "../editor/properties/color-picker";
import { EditorIcon } from "../editor/properties/primitives";
import { PropertyPanelRoot } from "../editor/properties/rows";
import { toModuleNamespace } from "../module-helpers";
import { sanitizeCssColor } from "../platform/css-sanitization";

var react_Uu: Dynamic;
var jsx_wc: Dynamic;
var artboardTweaksRowHeight: Dynamic;
var artboardTweaksChipHeight: Dynamic;
var artboardTweaksChipFontSize: Dynamic;
var tweaksSecondaryTextClass: Dynamic;
var tweaksValueTextClass: Dynamic;
function ArtboardTweaksRow({
  file: file,
  dcProps: dcProps,
  width: width,
  interactive = true,
  keyboardInert = false,
  readonly = false,
  onOpenTweaks: onOpenTweaks,
}: Dynamic): Dynamic {
  useUiLocale();
  let tweakEntries: Dynamic = (0, react_Uu.useMemo)(
      (): Dynamic =>
        groupComponentProps(
          Object.entries(dcProps.propsMeta).filter(
            ([, meta]: Dynamic): Dynamic =>
              isEditablePropMetadata(meta),
          ),
        ).flatMap((group?: Dynamic): Dynamic => group.rows),
      [dcProps.propsMeta],
    ),
    measureRef: Dynamic = (0, react_Uu.useRef)(null),
    openPopoverCountRef: Dynamic = (0, react_Uu.useRef)(0),
    [visibleCount, setVisibleCount]: Dynamic = (0, react_Uu.useState)(tweakEntries.length),
    [measureTick, setMeasureTick]: Dynamic = (0, react_Uu.useState)(0),
    availableWidth: Dynamic = width - 2 * artboardTweaksChipFontSize;
  (0, react_Uu.useEffect)((): Dynamic => {
    let current: Dynamic = measureRef.current;
    if (!current || typeof ResizeObserver === "undefined") return;
    let observer: Dynamic = new ResizeObserver(
      (): Dynamic => setMeasureTick((tick?: Dynamic): Dynamic => tick + 1),
    );
    observer.observe(current);
    return (): Dynamic => observer.disconnect();
  }, []);
  let handlePopoverOpenChange: Dynamic = (isOpen?: Dynamic): Dynamic => {
    openPopoverCountRef.current += isOpen ? 1 : -1;
    openPopoverCountRef.current <= 0 &&
      ((openPopoverCountRef.current = 0),
      setMeasureTick((tick?: Dynamic): Dynamic => tick + 1));
  };
  (0, react_Uu.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = measureRef.current;
    if (!current || openPopoverCountRef.current > 0) return;
    let chipWidths: Dynamic = [...current.children].map(
        (chip?: Dynamic): Dynamic => chip.offsetWidth,
      ),
      moreChipWidth: Dynamic = chipWidths[chipWidths.length - 1] ?? 0,
      tweakChipWidths: Dynamic = chipWidths.slice(0, -1);
    if (
      tweakChipWidths.reduce(
        (total?: Dynamic, chipWidth?: Dynamic): Dynamic => total + chipWidth,
        0,
      ) +
        artboardTweaksChipHeight * (tweakChipWidths.length - 1) <=
      availableWidth
    ) {
      setVisibleCount(tweakChipWidths.length);
      return;
    }
    let usedWidth: Dynamic = 0,
      fitCount: Dynamic = 0;
    for (; fitCount < tweakChipWidths.length; fitCount++) {
      let widthWithChip: Dynamic =
        usedWidth + (fitCount > 0 ? artboardTweaksChipHeight : 0) + tweakChipWidths[fitCount];
      if (widthWithChip + artboardTweaksChipHeight + moreChipWidth > availableWidth) break;
      usedWidth = widthWithChip;
    }
    setVisibleCount(fitCount);
  }, [tweakEntries, dcProps.values, availableWidth, measureTick]);
  let hiddenCount: Dynamic = tweakEntries.length - visibleCount,
    renderChips: Dynamic = (isMeasuring?: Dynamic): Dynamic =>
      tweakEntries
        .slice(0, isMeasuring ? tweakEntries.length : visibleCount)
        .map(
          ([tweakName, tweakMeta]: Dynamic): Dynamic => (
            <TweakValuePopover
              key={tweakName}
              name={tweakName}
              meta={tweakMeta}
              value={dcProps.values[tweakName]}
              onChange={(newValue?: Dynamic): Dynamic =>
                dcProps.setProp(tweakName, newValue)
              }
              onOpenChange={handlePopoverOpenChange}
              inert={isMeasuring}
            />
          ),
        ),
    renderMoreChip: Dynamic = (chipCount?: Dynamic, isMeasuring?: Dynamic): Dynamic => (
      <button
        type={"button"}
        data-testid={
          isMeasuring ? undefined : "mega-artboard-tweaks-more-" + file
        }
        disabled={readonly}
        title={
          readonly ? (ViewOnlyYouCanInspectThisMessage) : (uiMessage("canvas.artboardTweaks.showAllTweaks"))
        }
        aria-label={
          chipCount === tweakEntries.length ? (undefined) : (uiMessage("canvas.artboardTweaks.showRemainingTweaks", { remaining: String(String(chipCount)), total: String(String(tweakEntries.length)) }))
        }
        className={
          "pointer-events-auto inline-flex h-6 shrink-0 items-center whitespace-nowrap text-secondary hover:text-primary disabled:opacity-50"
        }
        onPointerDown={(event?: Dynamic): Dynamic =>
          event.stopPropagation()
        }
        onClick={(event?: Dynamic): Dynamic => {
          event.stopPropagation();
          isMeasuring || onOpenTweaks?.(file);
        }}
      >
        {chipCount === tweakEntries.length ? (String(chipCount) + chipCount === 1 ? (uiMessage("canvas.artboardTweaks.tweak")) : (uiMessage("canvas.artboardTweaks.tweaks"))) : (("+") + (String(chipCount)))}
      </button>
    );
  return (
    <div
      data-mega-chrome={"tweaks"}
      data-testid={"mega-artboard-tweaks-" + file}
      inert={keyboardInert ? true : undefined}
      className={cn(
        "pointer-events-none relative z-[25] w-full shrink-0 overflow-hidden border-b bg-page text-xs",
        !interactive && "[&_*]:!pointer-events-none",
      )}
      style={{
        height: artboardTweaksRowHeight,
      }}
      onPointerDown={(event?: Dynamic): Dynamic => event.stopPropagation()}
      onDoubleClick={(event?: Dynamic): Dynamic => event.stopPropagation()}
      onKeyDown={(event?: Dynamic): Dynamic => {
        event.key !== "Escape" && event.stopPropagation();
      }}
    >
      <div
        className={"flex h-full w-full items-center"}
        style={{
          gap: artboardTweaksChipHeight,
          paddingLeft: artboardTweaksChipFontSize,
          paddingRight: artboardTweaksChipFontSize,
        }}
      >
        {renderChips(false)}
        {hiddenCount > 0 && (renderMoreChip(hiddenCount, false))}
      </div>
      <div
        ref={measureRef}
        aria-hidden={"true"}
        className={
          "invisible absolute top-0 left-0 inline-flex h-full items-center"
        }
        style={{
          gap: artboardTweaksChipHeight,
          paddingLeft: artboardTweaksChipFontSize,
          paddingRight: artboardTweaksChipFontSize,
        }}
      >
        {renderChips(true)}
        {renderMoreChip(tweakEntries.length, true)}
      </div>
    </div>
  );
}
function describeTweakValue(meta?: Dynamic, currentValue?: Dynamic): Dynamic {
  switch (meta.editor) {
    case "color":
      return {
        color:
          typeof currentValue == "string" && currentValue.trim() !== ""
            ? currentValue.trim()
            : Array.isArray(currentValue) && typeof currentValue[0] == "string"
              ? currentValue[0]
              : null,
      };
    case "boolean":
      return {
        text: currentValue ? "On" : "Off",
      };
    case "enum": {
      let optionItems: Dynamic = propOptionItems(meta.options),
        selectedValue: Dynamic = currentValue ?? optionItems[0]?.value;
      return {
        text:
          (typeof selectedValue == "object" && selectedValue !== null
            ? undefined
            : optionItems.find(
                (item?: Dynamic): Dynamic =>
                  String(item.value) === String(selectedValue),
              )
          )?.label ?? primitivePropText(selectedValue),
      };
    }
    case "int":
    case "float":
    case "range": {
      let parsedNumber: Dynamic =
          typeof currentValue == "number"
            ? currentValue
            : parseFloat(primitivePropText(currentValue)),
        unit: Dynamic = typeof meta.unit == "string" ? meta.unit : "";
      return {
        text:
          (Number.isFinite(parsedNumber) ? String(parsedNumber) : "\u2014") +
          (unit ? " " + unit : ""),
      };
    }
    default:
      return {};
  }
}
function TweakValuePopover({
  name: name,
  meta: meta,
  value: currentValue,
  onChange: onChange,
  onOpenChange: onOpenChange,
  inert: inert,
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0, react_Uu.useState)(false),
    anchorRef: Dynamic = (0, react_Uu.useRef)(null),
    [placement, setPlacement]: Dynamic = (0, react_Uu.useState)({
      side: "bottom",
      maxHeight: undefined,
    });
  (0, react_Uu.useLayoutEffect)((): Dynamic => {
    isOpen &&
      setPlacement(
        meta.editor === "color"
          ? choosePopoverPlacement(
              anchorRef.current?.firstElementChild,
              ColorPickerConstant,
            )
          : {
              side: "bottom",
              maxHeight: undefined,
            },
      );
  }, [isOpen]);
  let onOpenChangeRef: Dynamic = (0, react_Uu.useRef)(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  (0, react_Uu.useEffect)((): Dynamic => {
    if (isOpen) {
      onOpenChangeRef.current?.(true);
      return (): Dynamic => onOpenChangeRef.current?.(false);
    }
  }, [isOpen]);
  let displayValue: Dynamic = currentValue === undefined ? meta.default : currentValue,
    description: Dynamic = describeTweakValue(meta, displayValue),
    chip: Dynamic = (
      <button
        type={"button"}
        data-testid={inert ? undefined : "mega-tweak-chip-" + name}
        tabIndex={inert ? -1 : undefined}
        title={name}
        className={
          "pointer-events-auto relative inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-1 hover:bg-black/5"
        }
        onPointerDown={(event?: Dynamic): Dynamic => event.stopPropagation()}
        onClick={(event?: Dynamic): Dynamic => event.stopPropagation()}
      >
        <span
          aria-hidden={"true"}
          className={
            "absolute top-1/2 left-1/2 hidden h-10 w-full min-w-10 -translate-x-1/2 -translate-y-1/2 pointer-coarse:block"
          }
        />
        {"color" in description ? (<span
            className={
              "block h-2.5 w-2.5 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]"
            }
            style={{
              background:
                description.color == null
                  ? "#000000"
                  : sanitizeCssColor(description.color),
            }}
          />) : (null)}
        <span className={tweaksSecondaryTextClass}>{name}</span>
        {description.text != null && (<span className={tweaksValueTextClass}>{description.text}</span>)}
        <EditorIcon name={"CaretDown"} size={11} />
      </button>
    );
  return inert ? (
    chip
  ) : (
    <PopoverPopoverRootTriggerPopupConfig.Root
      open={isOpen}
      modal={true}
      onOpenChange={(nextOpen?: Dynamic, details?: Dynamic): Dynamic => {
        !nextOpen &&
          details.reason === "escape-key" &&
          details.event.preventDefault();
        setIsOpen(nextOpen);
      }}
    >
      <span ref={anchorRef} className={"contents"}>
        <PopoverPopoverRootTriggerPopupConfig.Trigger
          render={chip}
        />
      </span>
      <PopoverPopoverRootTriggerPopupConfig.Popup
        data-tweak-popup={""}
        side={placement.side}
        style={
          placement.maxHeight !== undefined
            ? {
                maxHeight: placement.maxHeight,
              }
            : undefined
        }
        align={"start"}
        padding={
          hasTweakValueEditor(meta) || meta.editor === "color" ? "none" : "md"
        }
        aria-label={name}
        className={
          hasTweakValueEditor(meta)
            ? "w-72"
            : meta.editor === "color"
              ? undefined
              : "w-80"
        }
        onPointerDown={(event?: Dynamic): Dynamic => event.stopPropagation()}
      >
        <TweakOptionsEditor
          name={name}
          meta={meta}
          cur={displayValue}
          onChange={onChange}
        />
      </PopoverPopoverRootTriggerPopupConfig.Popup>
    </PopoverPopoverRootTriggerPopupConfig.Root>
  );
}
function hasTweakValueEditor(meta?: Dynamic): Dynamic {
  return (
    meta.editor !== "color" && meta.editor !== "text" && !!meta.editor
  );
}
function TweakOptionsEditor({
  name: name,
  meta: meta,
  cur: cur,
  onChange: onChange,
}: Dynamic): Dynamic {
  useUiLocale();
  let optionList: Dynamic = (0, react_Uu.useMemo)(
      (): Dynamic =>
        (Array.isArray(meta.options) ? meta.options : []).slice(0, 64),
      [meta.options],
    ),
    isPaletteCards: Dynamic =
      propColorEditorKind(optionList) === "palette-cards",
    stringOptions: Dynamic = (0, react_Uu.useMemo)(
      (): Dynamic =>
        isPaletteCards
          ? []
          : optionList.filter(
              (option?: Dynamic): Dynamic => typeof option == "string",
            ),
      [optionList.join("\0"), optionList.length, isPaletteCards],
    ),
    colorKeys: Dynamic = (0, react_Uu.useMemo)(
      (): Dynamic => propColorOptionKeys(stringOptions),
      [stringOptions],
    ),
    designSystems: Dynamic = useDesignSystems(),
    swatches: Dynamic = (0, react_Uu.useMemo)(
      (): Dynamic =>
        designSystemPropColorOptions(stringOptions, colorKeys, designSystems),
      [stringOptions, colorKeys, designSystems],
    );
  if (meta.editor === "text" || !meta.editor) {
    let text: Dynamic = primitivePropText(cur);
    return (
      <label className={"flex flex-col gap-1.5"}>
        <span className={"text-caption font-medium text-secondary"}>
          {name}
        </span>
        <TextArea
          autoFocus={true}
          rows={Math.min(4, Math.max(2, Math.ceil(text.length / 40)))}
          value={text}
          aria-label={name}
          onChange={(event?: Dynamic): Dynamic =>
            onChange(event.target.value)
          }
        />
      </label>
    );
  }
  if (hasTweakValueEditor(meta))
    return (
      <PropertyPanelRoot className={"py-1.5 [--pp-label-w:52px]"}>
        <ComponentPropInput
          name={name}
          meta={meta}
          value={cur}
          onChange={onChange}
          tweak={true}
        />
      </PropertyPanelRoot>
    );
  if (isPaletteCards)
    return (
      <div className={"w-64 p-md"}>
        <PropPaletteCards
          aria-label={name}
          options={optionList}
          value={cur}
          onChange={onChange}
        />
      </div>
    );
  let colorValue: Dynamic =
    typeof cur == "string" && cur.trim() !== "" ? cur.trim() : null;
  return (
    <ColorPickerWithSwatches
      title={name}
      value={colorValue ?? "#000000"}
      unset={colorValue === null}
      swatches={swatches}
      onChange={(color?: Dynamic): Dynamic =>
        onChange(restorePropColorOption(stringOptions, colorKeys, color))
      }
      className={ColorPickerLabel}
    />
  );
}
export {
  artboardTweaksChipFontSize,
  artboardTweaksChipHeight,
  ArtboardTweaksRow,
  artboardTweaksRowHeight,
  describeTweakValue,
  hasTweakValueEditor,
  jsx_wc,
  react_Uu,
  TweakOptionsEditor,
  tweaksSecondaryTextClass,
  tweaksValueTextClass,
  TweakValuePopover,
};
export function installCanvasArtboardTweaks(): () => void {
  return () => {
    react_Uu = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    jsx_wc = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    artboardTweaksRowHeight = 36;
    artboardTweaksChipHeight = 20;
    artboardTweaksChipFontSize = 14;
    tweaksSecondaryTextClass = "text-secondary";
    tweaksValueTextClass = "text-primary tabular-nums";
  };
}

import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { SegmentedControl } from "../cds/components/selection-points";
import { initializeCdsIndex } from "../cds/index";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { editableElementSelector } from "../editor/chrome/focus";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { NumericInput } from "../editor/properties/numeric-input";
import { PropertyOptionIcon } from "../editor/properties/tool-options";
import { PropertiesTooltipNameViewBoxPathsConfig as borderWeightIcon, borderSidesIcon as borderSidesIcon, cornerEachIcon as cornerEachIcon, strokeSolidIcon as strokeSolidIcon, strokeDashedIcon as strokeDashedIcon, strokeDottedIcon as strokeDottedIcon } from "../editor/properties/tooltip";
import { SessionStripButton } from "../editor/session-strip/session-strip";
import { toModuleNamespace } from "../module-helpers";

var react_mB: Dynamic;
var jsx_os: Dynamic;
var borderSideMenuOrder: Dynamic;
var borderSides: Dynamic;
var borderSideLabels: Dynamic;
var borderSideInitials: Dynamic;
var borderStyleOptions: Dynamic;
var borderStyleLabels: Dynamic;
var borderStyleGlyphs: Dynamic;
var quickPanelBodyClass: Dynamic;
var quickPanelPopoverOptions: Dynamic;
var quickPanelHintClass: Dynamic;
var radiusCorners: Dynamic;
var radiusCornerLabels: Dynamic;
function preserveQuickPanelInputFocus(event?: Dynamic): Dynamic {
  event.target.closest(editableElementSelector) ||
    event.preventDefault();
}
function QuickPanelIconButton({
  icon: icon,
  label: label,
  pressed: pressed,
  disabledReason: disabledReason,
  hint: hint,
  onClick: onClick,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <SessionStripButton
      icon={<PropertyOptionIcon icon={icon} />}
      aria-label={label}
      aria-pressed={pressed}
      title={disabledReason ?? (hint)}
      disabled={disabledReason !== undefined}
      onClick={onClick}
    />
  );
}
function BorderQuickPanel({
  style: style,
  width: width,
  sides: sides,
  color: color,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  supports: supports,
  widths: widths,
}: Dynamic): Dynamic {
  useUiLocale();
  let nonzeroWidths: Dynamic =
      widths !== undefined
        ? borderSides
            .map((side?: Dynamic): Dynamic => widths.value[side] ?? 0)
            .filter((sideWidth?: Dynamic): Dynamic => sideWidth > 0)
        : [],
    hasMixedWidths: Dynamic = new Set(nonzeroWidths).size > 1,
    [isIndividualOpen, setIsIndividualOpen]: Dynamic = (0, react_mB.useState)(
      sides !== undefined || hasMixedWidths,
    ),
    isStyleNone: Dynamic = (style ?? "none") === "none",
    drawnSides: Dynamic = sides ?? borderSides,
    showsIndividualSides: Dynamic =
      supports.sides === true && (isIndividualOpen || sides !== undefined || hasMixedWidths),
    toggleSide: Dynamic = (toggledSide?: Dynamic): Dynamic => {
      let nextSides: Dynamic = borderSides.filter(
        (side?: Dynamic): Dynamic =>
          side === toggledSide
            ? !drawnSides.includes(toggledSide)
            : drawnSides.includes(side),
      );
      onChange({
        sides: nextSides.length === borderSides.length ? undefined : nextSides,
      });
    },
    renderIndividualToggle: Dynamic = (): Dynamic => (
      <QuickPanelIconButton
        icon={borderSidesIcon}
        label={uiMessage("inspector.quickPanels.individualBorders")}
        pressed={showsIndividualSides}
        hint={
          widths !== undefined
            ? "Set each side\u2019s width"
            : "Choose which sides draw"
        }
        disabledReason={
          supports.sides === true ? (isStyleNone ? (uiMessage("inspector.quickPanels.pickABorderStyleFirst")) : (undefined)) : (supports.sides)
        }
        onClick={(): Dynamic => {
          showsIndividualSides
            ? (setIsIndividualOpen(false),
              (sides !== undefined || hasMixedWidths) &&
                onChange({
                  sides: undefined,
                }))
            : setIsIndividualOpen(true);
        }}
      />
    );
  return (
    <div
      className={quickPanelBodyClass}
      onMouseDown={preserveQuickPanelInputFocus}
      data-quick-panel={"border"}
    >
      <SegmentedControl
        aria-label={uiMessage("inspector.quickPanels.borderStyle")}
        fullWidth={true}
        value={style ?? "none"}
        onChange={(nextStyle?: Dynamic): Dynamic =>
          onChange({
            style: nextStyle,
          })
        }
        segments={borderStyleOptions.map(
          (styleOption?: Dynamic): Dynamic => ({
            value: styleOption,
            ...(styleOption === "none"
              ? {
                  icon: "Prohibit",
                }
              : {
                  label: (
                    <jsx_os.Fragment>
                      <PropertyOptionIcon
                        icon={borderStyleGlyphs[styleOption]}
                      />
                      <span className={"sr-only"}>
                        {borderStyleLabels[styleOption]}
                      </span>
                    </jsx_os.Fragment>
                  ),
                }),
            tooltip: borderStyleLabels[styleOption],
            disabled: !supports.styles.includes(styleOption),
            disabledReason: supports.styleReason,
          }),
        )}
      />
      <fieldset
        disabled={isStyleNone}
        className={joinClassNames(
          "m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0",
          isStyleNone && "opacity-60",
        )}
      >
        <div className={"min-w-0"}>{color}</div>
        <div
          className={"grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"}
          role={"group"}
          aria-label={
            showsIndividualSides && widths !== undefined ? (uiMessage("inspector.quickPanels.sideWidths")) : (undefined)
          }
        >
          {showsIndividualSides && widths !== undefined ? (borderSideMenuOrder.map(
              (side?: Dynamic, slotIndex?: Dynamic): Dynamic =>
                side === null ? (
                  slotIndex === 2 ? (
                    <react_mB.Fragment key={"toggle"}>
                      {renderIndividualToggle()}
                    </react_mB.Fragment>
                  ) : (
                    <span key={"gap"} />
                  )
                ) : (
                  <NumericInput
                    key={side}
                    prefix={borderSideInitials[side]}
                    aria-label={uiMessage("inspector.quickPanels.borderWidth", { side: String(borderSideLabels[side]) })}
                    title={
                      uiMessage("inspector.quickPanels.borderWidthPx0None", { side: String(borderSideLabels[side]) })
                    }
                    value={widths.value[side]}
                    min={0}
                    max={supports.widthMax}
                    step={1}
                    disabled={isStyleNone}
                    onValue={(sideWidth?: Dynamic): Dynamic =>
                      widths.onChange({
                        [side]: sideWidth ?? 0,
                      })
                    }
                    onScrub={
                      widths.onLive
                        ? (sideWidth?: Dynamic): Dynamic =>
                            widths.onLive({
                              [side]: sideWidth,
                            })
                        : undefined
                    }
                    onScrubEnd={widths.onLiveEnd}
                  />
                ),
            )) : (<jsx_os.Fragment>
              <div className={"col-span-2 min-w-0"}>
                <NumericInput
                  prefix={
                    <PropertyOptionIcon
                      icon={borderWeightIcon}
                    />
                  }
                  aria-label={uiMessage("inspector.quickPanels.borderWeight")}
                  unit={"px"}
                  title={uiMessage("inspector.quickPanels.borderWeight")}
                  value={hasMixedWidths ? undefined : width}
                  min={1}
                  max={supports.widthMax}
                  step={1}
                  clearable={!hasMixedWidths}
                  placeholder={hasMixedWidths ? (uiMessage("inspector.quickPanels.mixed")) : ("0")}
                  disabled={isStyleNone}
                  onValue={(nextWidth?: Dynamic): Dynamic => {
                    (nextWidth !== undefined || !hasMixedWidths) &&
                      onChange({
                        width: nextWidth,
                      });
                  }}
                  onScrub={
                    onLive
                      ? (nextWidth?: Dynamic): Dynamic =>
                          onLive({
                            width: nextWidth,
                          })
                      : undefined
                  }
                  onScrubEnd={onLiveEnd}
                />
              </div>
              {renderIndividualToggle()}
            </jsx_os.Fragment>)}
        </div>
        {showsIndividualSides && widths === undefined && (<div
            className={
              "grid grid-cols-4 gap-0.5 rounded-md bg-fill-field p-0.5"
            }
            role={"group"}
            aria-label={uiMessage("inspector.quickPanels.sides")}
          >
            {borderSides.map((side?: Dynamic): Dynamic => {
              let isDrawn: Dynamic = drawnSides.includes(side),
                isLastDrawnSide: Dynamic = isDrawn && drawnSides.length === 1;
              return (
                <SessionStripButton
                  key={side}
                  aria-label={uiMessage("inspector.quickPanels.border", { side: String(borderSideLabels[side]) })}
                  aria-pressed={isDrawn}
                  className={"justify-center"}
                  disabled={isStyleNone || isLastDrawnSide}
                  title={
                    isLastDrawnSide ? (uiMessage("inspector.quickPanels.setTheStyleToNone")) : (uiMessage("inspector.quickPanels.border", { side: String(borderSideLabels[side]) }))
                  }
                  onClick={(): Dynamic => toggleSide(side)}
                >
                  {borderSideInitials[side]}
                </SessionStripButton>
              );
            })}
          </div>)}
      </fieldset>
    </div>
  );
}
function RadiusCornerInput(
  cornersBinding?: Dynamic,
  corner?: Dynamic,
  maxRadius?: Dynamic,
  fallbackRadius?: Dynamic,
): Dynamic {
  useUiLocale();
  return (
    <NumericInput
      prefix={corner.toUpperCase()}
      aria-label={uiMessage("inspector.quickPanels.radius", { corner: String(radiusCornerLabels[corner]) })}
      title={uiMessage("inspector.quickPanels.radius", { corner: String(radiusCornerLabels[corner]) })}
      value={cornersBinding.value[corner]}
      min={0}
      max={maxRadius}
      step={1}
      clearable={true}
      placeholder={String(fallbackRadius ?? 0)}
      onValue={(cornerRadius?: Dynamic): Dynamic =>
        cornersBinding.onChange({
          [corner]: cornerRadius,
        })
      }
      onScrub={
        cornersBinding.onLive
          ? (cornerRadius?: Dynamic): Dynamic =>
              cornersBinding.onLive?.({
                [corner]: cornerRadius,
              })
          : undefined
      }
      onScrubEnd={cornersBinding.onLiveEnd}
    />
  );
}
function RadiusQuickPanel({
  radius: radius,
  max: max,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  individualReason: individualReason,
  corners: corners,
}: Dynamic): Dynamic {
  useUiLocale();
  let hasMixedCorners: Dynamic =
      corners !== undefined &&
      new Set(
        radiusCorners.map((corner?: Dynamic): Dynamic => corners.value[corner]),
      ).size > 1,
    [isIndividualOpen, setIsIndividualOpen]: Dynamic = (0, react_mB.useState)(hasMixedCorners),
    showsIndividualCorners: Dynamic = corners !== undefined && isIndividualOpen,
    individualToggle: Dynamic = (
      <QuickPanelIconButton
        icon={cornerEachIcon}
        label={uiMessage("inspector.quickPanels.individualCorners")}
        pressed={showsIndividualCorners}
        hint={"Set each corner"}
        disabledReason={
          corners === undefined ? (individualReason ?? (uiMessage("inspector.quickPanels.oneRadiusForEveryCorner"))) : (undefined)
        }
        onClick={(): Dynamic => {
          showsIndividualCorners &&
            hasMixedCorners &&
            corners !== undefined &&
            onChange(
              Math.max(
                ...radiusCorners.map(
                  (corner?: Dynamic): Dynamic => corners.value[corner] ?? 0,
                ),
              ),
            );
          setIsIndividualOpen(!showsIndividualCorners);
        }}
      />
    );
  return (
    <div
      className={quickPanelBodyClass}
      onMouseDown={preserveQuickPanelInputFocus}
      data-quick-panel={"corner"}
    >
      {showsIndividualCorners && corners !== undefined ? (<div className={"grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"}>
          {RadiusCornerInput(corners, "tl", max, radius)}
          {RadiusCornerInput(corners, "tr", max, radius)}
          {individualToggle}
          {RadiusCornerInput(corners, "bl", max, radius)}
          {RadiusCornerInput(corners, "br", max, radius)}
          <span />
        </div>) : (<div className={"flex items-center gap-1.5"}>
          <div className={"min-w-0 flex-1"}>
            <NumericInput
              aria-label={uiMessage("inspector.quickPanels.cornerRadius")}
              unit={"px"}
              title={uiMessage("inspector.quickPanels.cornerRadius")}
              value={hasMixedCorners ? undefined : radius}
              min={0}
              max={max}
              step={1}
              clearable={!hasMixedCorners}
              placeholder={hasMixedCorners ? (uiMessage("inspector.quickPanels.mixed")) : ("0")}
              onValue={onChange}
              onScrub={onLive}
              onScrubEnd={onLiveEnd}
            />
          </div>
          {individualToggle}
        </div>)}
    </div>
  );
}
function SpacingQuickPanel({
  padding: padding,
  max: max,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  margin: margin,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      className={quickPanelBodyClass}
      onMouseDown={preserveQuickPanelInputFocus}
      data-quick-panel={"spacing"}
    >
      <SpacingSidesEditor
        title={uiMessage("inspector.quickPanels.padding")}
        max={max}
        binding={{
          value: padding,
          onChange: onChange,
          onLive: onLive,
          onLiveEnd: onLiveEnd,
        }}
      />
      {margin !== undefined && (<SpacingSidesEditor
          title={uiMessage("inspector.quickPanels.margin")}
          max={margin.max ?? max}
          binding={margin}
        />)}
    </div>
  );
}
function SpacingSidesEditor({
  title: title,
  max: max,
  binding: binding,
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      value: sideValues,
      onChange: onSidesChange,
      onLive: onSidesLive,
      onLiveEnd: onSidesLiveEnd,
    }: Dynamic = binding,
    [isIndividualOpen, setIsIndividualOpen]: Dynamic = (0, react_mB.useState)(
      sideValues.left !== sideValues.right || sideValues.top !== sideValues.bottom,
    ),
    renderSideInput: Dynamic = (
      prefixLetter?: Dynamic,
      sideLabel?: Dynamic,
      sideKeys?: Dynamic,
    ): Dynamic => {
      let currentValues: Dynamic = sideKeys.map(
          (side?: Dynamic): Dynamic => sideValues[side],
        ),
        isUniform: Dynamic = currentValues.every(
          (sideValue?: Dynamic): Dynamic => sideValue === currentValues[0],
        ),
        spreadToSides: Dynamic = (nextValue?: Dynamic): Dynamic =>
          Object.fromEntries(
            sideKeys.map((side?: Dynamic): Dynamic => [side, nextValue]),
          );
      return (
        <NumericInput
          key={prefixLetter}
          prefix={prefixLetter}
          aria-label={((title) + (" ")) + (sideLabel)}
          title={((title) + (" ")) + (sideLabel)}
          value={isUniform ? currentValues[0] : undefined}
          placeholder={isUniform ? ("0") : (uiMessage("inspector.quickPanels.mixed"))}
          min={0}
          max={max}
          step={1}
          clearable={isUniform}
          onValue={(nextValue?: Dynamic): Dynamic => {
            (nextValue !== undefined || isUniform) && onSidesChange(spreadToSides(nextValue));
          }}
          onScrub={
            onSidesLive
              ? (nextValue?: Dynamic): Dynamic => onSidesLive(spreadToSides(nextValue))
              : undefined
          }
          onScrubEnd={onSidesLiveEnd}
        />
      );
    },
    individualToggle: Dynamic = (
      <QuickPanelIconButton
        icon={borderSidesIcon}
        label={uiMessage("inspector.quickPanels.individual", { property: String(title.toLowerCase()) })}
        pressed={isIndividualOpen}
        hint={"Set each side"}
        onClick={(): Dynamic => setIsIndividualOpen(!isIndividualOpen)}
      />
    );
  return (
    <div
      className={"flex flex-col gap-1.5"}
      role={"group"}
      aria-label={title}
    >
      <div className={quickPanelHintClass}>{title}</div>
      <div className={"grid grid-cols-[1fr_1fr_auto] items-center gap-1.5"}>
        {isIndividualOpen ? (<jsx_os.Fragment>
            {renderSideInput("T", "top", ["top"])}
            {renderSideInput("R", "right", ["right"])}
            {individualToggle}
            {renderSideInput("B", "bottom", ["bottom"])}
            {renderSideInput("L", "left", ["left"])}
            <span />
          </jsx_os.Fragment>) : (<jsx_os.Fragment>
            {renderSideInput("H", uiMessage("inspector.quickPanels.leftAndRight"), ["left", "right"])}
            {renderSideInput("V", uiMessage("inspector.quickPanels.topAndBottom"), ["top", "bottom"])}
            {individualToggle}
          </jsx_os.Fragment>)}
      </div>
    </div>
  );
}
export {
  BorderQuickPanel,
  borderSideInitials,
  borderSideLabels,
  borderSideMenuOrder,
  borderSides,
  borderStyleGlyphs,
  borderStyleLabels,
  borderStyleOptions,
  jsx_os,
  preserveQuickPanelInputFocus,
  quickPanelBodyClass,
  quickPanelHintClass,
  QuickPanelIconButton,
  quickPanelPopoverOptions,
  RadiusCornerInput,
  radiusCornerLabels,
  radiusCorners,
  RadiusQuickPanel,
  react_mB,
  SpacingQuickPanel,
  SpacingSidesEditor,
};
export function installPropertiesQuickPanels(): () => void {
  return () => {
    react_mB = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    jsx_os = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    borderSideMenuOrder = ["top", "right", null, "bottom", "left", null];
    borderSides = ["top", "right", "bottom", "left"];
    borderSideLabels = {
      top: "Top",
      right: "Right",
      bottom: "Bottom",
      left: "Left",
    };
    borderSideInitials = {
      top: "T",
      right: "R",
      bottom: "B",
      left: "L",
    };
    borderStyleOptions = ["none", "solid", "dashed", "dotted"];
    borderStyleLabels = {
      get none() { return uiMessage("inspector.quickPanels.none"); },
      solid: "Solid",
      get dashed() { return uiMessage("inspector.quickPanels.dashed"); },
      get dotted() { return uiMessage("inspector.quickPanels.dotted"); },
    };
    borderStyleGlyphs = {
      solid: strokeSolidIcon,
      dashed: strokeDashedIcon,
      dotted: strokeDottedIcon,
    };
    quickPanelBodyClass = "flex w-[184px] flex-col gap-1.5";
    quickPanelPopoverOptions = {
      side: "right",
      anchor: (element?: Dynamic): Dynamic => element.closest("[data-quick-panel]"),
    };
    quickPanelHintClass = "px-0.5 pt-0.5 text-footnote text-muted select-none";
    radiusCorners = ["tl", "tr", "bl", "br"];
    radiusCornerLabels = {
      get tl() { return uiMessage("inspector.quickPanels.topLeft"); },
      get tr() { return uiMessage("inspector.quickPanels.topRight"); },
      get bl() { return uiMessage("inspector.quickPanels.bottomLeft"); },
      get br() { return uiMessage("inspector.quickPanels.bottomRight"); },
    };
  };
}

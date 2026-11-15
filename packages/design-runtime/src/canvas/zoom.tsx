import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeCdsIndex } from "../cds/index";
import { MenuMenuAssignValue } from "../cds/menu/menu";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { ZoomToolIcon } from "../editor/properties/primitives";
import { SessionStripPopover } from "../editor/session-strip/popover";
import { toModuleNamespace } from "../module-helpers";

var react_F_: Dynamic;
var jsx_Wl: Dynamic;
var zoomScalePresets: Dynamic;
var zoomLimitMessages: Dynamic;
var zoomControlGlyph: Dynamic;
var zoomScalePercent: Dynamic;
function CanvasZoomControl({
  getScale: getScale,
  onPickScale: onPickScale,
  onFit: onFit,
  getLimits: getLimits,
  fitLabel = "Fit",
  tip = "Zoom",
  disabled: disabled2 = false,
  disabledTip: disabledTip,
  tipSide: tipSide,
  "data-testid": dataTestid = "mc-zoom",
  readout = false,
  subscribeScale: subscribeScale,
  onStepZoom: onStepZoom,
  undo: undo,
  zoomRowsDisabled = false,
  zoomRowsDisabledTip: zoomRowsDisabledTip,
  viewToggles = [],
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0, react_F_.useState)(1),
    [value3, value4]: Dynamic = (0, react_F_.useState)(
      (): Dynamic => (readout ? getScale() : 1),
    ),
    value5: Dynamic = (0, react_F_.useRef)(false);
  (0, react_F_.useLayoutEffect)((): Dynamic => {
    if (!(!readout || subscribeScale === undefined))
      return subscribeScale((input?: Dynamic): Dynamic => {
        value4(input);
        value5.current && (value2(input), value7(getLimits?.() ?? {}));
      });
  }, [readout, subscribeScale]);
  let [value6, value7]: Dynamic = (0, react_F_.useState)({}),
    value8: Dynamic = zoomScalePercent(value),
    value9: Dynamic =
      value6.minScale == null ? -1 / 0 : Math.round(value6.minScale * 100),
    value10: Dynamic =
      value6.maxScale == null ? 1 / 0 : Math.round(value6.maxScale * 100),
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      value5.current = input;
      input && (value2(getScale()), value7(getLimits?.() ?? {}));
    },
    value11: Dynamic =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad/.test(navigator.platform),
    callback2: Dynamic = (input?: Dynamic): Dynamic => (
      <span
        aria-hidden={"true"}
        className={"pointer-coarse:hidden text-footnote text-muted"}
      >
        {input}
      </span>
    ),
    value12: Dynamic =
      zoomRowsDisabledTip === undefined
        ? undefined
        : zoomRowsDisabled
          ? zoomRowsDisabledTip
          : null,
    value13: Dynamic = (
      <jsx_Wl.Fragment>
        {onStepZoom !== undefined ? (<jsx_Wl.Fragment>
            <MenuMenuAssignValue.Item
              disabled={zoomRowsDisabled || value8 >= value10}
              disabledReason={value12}
              trailing={callback2(value11 ? "\u2318+" : "Ctrl +")}
              aria-keyshortcuts={value11 ? "Meta+=" : "Control+="}
              onClick={(): Dynamic => onStepZoom(1)}
            >
              {uiMessage("canvas.zoom.zoomIn")}
            </MenuMenuAssignValue.Item>
            <MenuMenuAssignValue.Item
              disabled={zoomRowsDisabled || value8 <= value9}
              disabledReason={value12}
              trailing={callback2(value11 ? "\u2318\u2212" : "Ctrl \u2212")}
              aria-keyshortcuts={value11 ? "Meta+-" : "Control+-"}
              onClick={(): Dynamic => onStepZoom(-1)}
            >
              {uiMessage("canvas.zoom.zoomOut")}
            </MenuMenuAssignValue.Item>
          </jsx_Wl.Fragment>) : (null)}
        <MenuMenuAssignValue.Item
          disabled={zoomRowsDisabled}
          disabledReason={value12}
          onClick={onFit}
        >
          {fitLabel}
        </MenuMenuAssignValue.Item>
        <MenuMenuAssignValue.Separator />
        <MenuMenuAssignValue.Group>
          {zoomScalePresets.every(
            (input?: Dynamic): Dynamic => Math.round(input * 100) !== value8,
          ) ? (<MenuMenuAssignValue.GroupLabel>
              <span className={"tabular-nums"}>
                {uiMessage("canvas.zoom.now")}
                {value8}
                {"%"}
              </span>
            </MenuMenuAssignValue.GroupLabel>) : (null)}
          {zoomScalePresets.map((input?: Dynamic): Dynamic => {
            let value14: Dynamic = Math.round(input * 100),
              value15: Dynamic =
                value14 < value9
                  ? "below"
                  : value14 > value10
                    ? "above"
                    : null,
              value16: Dynamic = zoomRowsDisabled
                ? (value12 ?? null)
                : value15 === null
                  ? null
                  : value15 === "below"
                    ? (value6.minTip ?? zoomLimitMessages.below)
                    : (value6.maxTip ?? zoomLimitMessages.above);
            return (
              <MenuMenuAssignValue.Item
                key={input}
                checkedRole={"radio"}
                checked={value14 === value8}
                disabled={zoomRowsDisabled || value15 !== null}
                disabledReason={value16}
                onClick={(): Dynamic => onPickScale(input)}
              >
                {value14}
                {"%"}
              </MenuMenuAssignValue.Item>
            );
          })}
        </MenuMenuAssignValue.Group>
        {viewToggles.length > 0 ? (<jsx_Wl.Fragment>
            <MenuMenuAssignValue.Separator />
            {viewToggles.map(
              (input?: Dynamic): Dynamic =>
                (() => {
                  const _Component = MenuMenuAssignValue.Item;
                  const _props = {
                    checkedRole: "checkbox",
                    checked: input.checked,
                    shortcut: input.shortcut,
                    "aria-describedby": input.describedBy,
                    onClick: input.onToggle,
                    children: input.label,
                  } as const;
                  const _key = input.label;
                  return <_Component key={_key} {..._props} />;
                })(),
            )}
          </jsx_Wl.Fragment>) : (null)}
        {undo !== undefined ? (<jsx_Wl.Fragment>
            <MenuMenuAssignValue.Separator />
            <MenuMenuAssignValue.Item
              disabled={!undo.canUndo()}
              disabledReason={uiMessage("canvas.zoom.nothingToUndoYet")}
              shortcut={"cmd+z"}
              onClick={(): Dynamic => undo.undo()}
            >
              {uiMessage("canvas.zoom.undo")}
            </MenuMenuAssignValue.Item>
            <MenuMenuAssignValue.Item
              disabled={!undo.canRedo()}
              disabledReason={uiMessage("canvas.zoom.nothingToRedo")}
              shortcut={"shift+cmd+z"}
              onClick={(): Dynamic => undo.redo()}
            >
              {uiMessage("canvas.zoom.redo")}
            </MenuMenuAssignValue.Item>
          </jsx_Wl.Fragment>) : (null)}
      </jsx_Wl.Fragment>
    );
  return readout ? (
    <SessionStripPopover
      readout={String(zoomScalePercent(value3)) + "%"}
      readoutSizer={"100%"}
      label={uiMessage("canvas.zoom.zoom")}
      tip={tip}
      disabled={disabled2}
      disabledTip={disabledTip}
      side={tipSide}
      data-testid={dataTestid}
      onOpenChange={callback}
    >
      {value13}
    </SessionStripPopover>
  ) : (
    <SessionStripPopover
      glyph={zoomControlGlyph}
      iconOnly={true}
      label={uiMessage("canvas.zoom.zoom")}
      tip={tip}
      disabled={disabled2}
      disabledTip={disabledTip}
      side={tipSide}
      data-testid={dataTestid}
      onOpenChange={callback}
    >
      {value13}
    </SessionStripPopover>
  );
}
export {
  CanvasZoomControl,
  jsx_Wl,
  react_F_,
  zoomControlGlyph,
  zoomLimitMessages,
  zoomScalePercent,
  zoomScalePresets,
};
export function installCanvasZoom(): () => void {
  return () => {
    react_F_ = (0, toModuleNamespace)((0, load_react)(), 1);
    (0, initializeCdsIndex)();
    jsx_Wl = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    zoomScalePresets = [0.25, 0.5, 0.75, 1, 1.5, 2];
    zoomLimitMessages = {
      below: "Below the zoom limit \u2014 that's as far out as it goes",
      above: "Past the zoom limit \u2014 that's as far in as it goes",
    };
    zoomControlGlyph = <ZoomToolIcon />;
    zoomScalePercent = (input?: Dynamic): Dynamic =>
      Number.isFinite(input) && input > 0
        ? Math.max(1, Math.round(input * 100))
        : 100;
  };
}

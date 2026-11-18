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
  disabled: isDisabled = false,
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
  let [zoomScale, setZoomScale]: Dynamic = (0, react_F_.useState)(1),
    [readoutScale, setReadoutScale]: Dynamic = (0, react_F_.useState)(
      (): Dynamic => (readout ? getScale() : 1),
    ),
    isOpenRef: Dynamic = (0, react_F_.useRef)(false);
  (0, react_F_.useLayoutEffect)((): Dynamic => {
    if (!(!readout || subscribeScale === undefined))
      return subscribeScale((newScale?: Dynamic): Dynamic => {
        setReadoutScale(newScale);
        isOpenRef.current && (setZoomScale(newScale), setZoomLimits(getLimits?.() ?? {}));
      });
  }, [readout, subscribeScale]);
  let [zoomLimits, setZoomLimits]: Dynamic = (0, react_F_.useState)({}),
    currentPercent: Dynamic = zoomScalePercent(zoomScale),
    minPercent: Dynamic =
      zoomLimits.minScale == null ? -1 / 0 : Math.round(zoomLimits.minScale * 100),
    maxPercent: Dynamic =
      zoomLimits.maxScale == null ? 1 / 0 : Math.round(zoomLimits.maxScale * 100),
    handleOpenChange: Dynamic = (isOpen?: Dynamic): Dynamic => {
      isOpenRef.current = isOpen;
      isOpen && (setZoomScale(getScale()), setZoomLimits(getLimits?.() ?? {}));
    },
    isMac: Dynamic =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad/.test(navigator.platform),
    renderShortcutHint: Dynamic = (hintText?: Dynamic): Dynamic => (
      <span
        aria-hidden={"true"}
        className={"pointer-coarse:hidden text-footnote text-muted"}
      >
        {hintText}
      </span>
    ),
    presetsDisabledReason: Dynamic =
      zoomRowsDisabledTip === undefined
        ? undefined
        : zoomRowsDisabled
          ? zoomRowsDisabledTip
          : null,
    menuContent: Dynamic = (
      <jsx_Wl.Fragment>
        {onStepZoom !== undefined ? (<jsx_Wl.Fragment>
            <MenuMenuAssignValue.Item
              disabled={zoomRowsDisabled || currentPercent >= maxPercent}
              disabledReason={presetsDisabledReason}
              trailing={renderShortcutHint(isMac ? "\u2318+" : "Ctrl +")}
              aria-keyshortcuts={isMac ? "Meta+=" : "Control+="}
              onClick={(): Dynamic => onStepZoom(1)}
            >
              {uiMessage("canvas.zoom.zoomIn")}
            </MenuMenuAssignValue.Item>
            <MenuMenuAssignValue.Item
              disabled={zoomRowsDisabled || currentPercent <= minPercent}
              disabledReason={presetsDisabledReason}
              trailing={renderShortcutHint(isMac ? "\u2318\u2212" : "Ctrl \u2212")}
              aria-keyshortcuts={isMac ? "Meta+-" : "Control+-"}
              onClick={(): Dynamic => onStepZoom(-1)}
            >
              {uiMessage("canvas.zoom.zoomOut")}
            </MenuMenuAssignValue.Item>
          </jsx_Wl.Fragment>) : (null)}
        <MenuMenuAssignValue.Item
          disabled={zoomRowsDisabled}
          disabledReason={presetsDisabledReason}
          onClick={onFit}
        >
          {fitLabel}
        </MenuMenuAssignValue.Item>
        <MenuMenuAssignValue.Separator />
        <MenuMenuAssignValue.Group>
          {zoomScalePresets.every(
            (presetScale?: Dynamic): Dynamic => Math.round(presetScale * 100) !== currentPercent,
          ) ? (<MenuMenuAssignValue.GroupLabel>
              <span className={"tabular-nums"}>
                {uiMessage("canvas.zoom.now")}
                {currentPercent}
                {"%"}
              </span>
            </MenuMenuAssignValue.GroupLabel>) : (null)}
          {zoomScalePresets.map((presetScale?: Dynamic): Dynamic => {
            let presetPercent: Dynamic = Math.round(presetScale * 100),
              limitSide: Dynamic =
                presetPercent < minPercent
                  ? "below"
                  : presetPercent > maxPercent
                    ? "above"
                    : null,
              presetDisabledReason: Dynamic = zoomRowsDisabled
                ? (presetsDisabledReason ?? null)
                : limitSide === null
                  ? null
                  : limitSide === "below"
                    ? (zoomLimits.minTip ?? zoomLimitMessages.below)
                    : (zoomLimits.maxTip ?? zoomLimitMessages.above);
            return (
              <MenuMenuAssignValue.Item
                key={presetScale}
                checkedRole={"radio"}
                checked={presetPercent === currentPercent}
                disabled={zoomRowsDisabled || limitSide !== null}
                disabledReason={presetDisabledReason}
                onClick={(): Dynamic => onPickScale(presetScale)}
              >
                {presetPercent}
                {"%"}
              </MenuMenuAssignValue.Item>
            );
          })}
        </MenuMenuAssignValue.Group>
        {viewToggles.length > 0 ? (<jsx_Wl.Fragment>
            <MenuMenuAssignValue.Separator />
            {viewToggles.map(
              (viewToggle?: Dynamic): Dynamic =>
                (() => {
                  const _Component = MenuMenuAssignValue.Item;
                  const _props = {
                    checkedRole: "checkbox",
                    checked: viewToggle.checked,
                    shortcut: viewToggle.shortcut,
                    "aria-describedby": viewToggle.describedBy,
                    onClick: viewToggle.onToggle,
                    children: viewToggle.label,
                  } as const;
                  const _key = viewToggle.label;
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
      readout={String(zoomScalePercent(readoutScale)) + "%"}
      readoutSizer={"100%"}
      label={uiMessage("canvas.zoom.zoom")}
      tip={tip}
      disabled={isDisabled}
      disabledTip={disabledTip}
      side={tipSide}
      data-testid={dataTestid}
      onOpenChange={handleOpenChange}
    >
      {menuContent}
    </SessionStripPopover>
  ) : (
    <SessionStripPopover
      glyph={zoomControlGlyph}
      iconOnly={true}
      label={uiMessage("canvas.zoom.zoom")}
      tip={tip}
      disabled={isDisabled}
      disabledTip={disabledTip}
      side={tipSide}
      data-testid={dataTestid}
      onOpenChange={handleOpenChange}
    >
      {menuContent}
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
    react_F_ = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    jsx_Wl = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    zoomScalePresets = [0.25, 0.5, 0.75, 1, 1.5, 2];
    zoomLimitMessages = {
      below: "Below the zoom limit \u2014 that's as far out as it goes",
      above: "Past the zoom limit \u2014 that's as far in as it goes",
    };
    zoomControlGlyph = <ZoomToolIcon />;
    zoomScalePercent = (scale?: Dynamic): Dynamic =>
      Number.isFinite(scale) && scale > 0
        ? Math.max(1, Math.round(scale * 100))
        : 100;
  };
}

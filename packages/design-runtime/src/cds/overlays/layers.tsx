import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type { LayerProps, LayerValue, OverlayKind } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactOverlaysLayers: typeof React;
var jsxOverlaysLayers: typeof import("react/jsx-runtime");
var LAYER_BAND_SIZE: number;
var GLOBAL_LAYER_BASE: number;
var LayerBaseContext: React.Context<number>;
var overlayLayerOffsets: Record<OverlayKind, number>;
var portalLayerClassName: string;
var initializeOverlaysLayers: () => void;
function CdsLayer({
  children: children,
  base: base,
  render: render,
}: LayerProps): React.ReactElement {
  useUiLocale();
  let parentBase = (0, reactOverlaysLayers.useContext)(LayerBaseContext),
    layerBase = base ?? parentBase + LAYER_BAND_SIZE;
  base === undefined && undefined;
  let rendered =
    render === undefined
      ? null
      : (0, reactOverlaysLayers.cloneElement)(
          render,
          {
            "data-cds": render.props["data-cds"] ?? "CdsLayer",
            style: {
              ...render.props.style,
              zIndex: layerBase,
              "--cds-layer-base": layerBase,
            },
          },
          children,
        );
  return (
    <LayerBaseContext.Provider value={layerBase}>
      {rendered ?? (children)}
    </LayerBaseContext.Provider>
  );
}
function validateLayerOffset(label: string, offset: number): void {
  if (Number.isInteger(offset) && offset >= 0 && offset < LAYER_BAND_SIZE)
    return;
  let message = `cds: ${label} \u2014 value must be an integer in [0, ${LAYER_BAND_SIZE}). A non-integer is silently invalid as a z-index (the declaration is dropped and the element falls to z-auto); anything outside the range escapes its band and stacks unpredictably against other overlays.`;
  console.warn(message);
}
function useDefaultLayer(input: OverlayKind): LayerValue {
  return useLayer(input);
}
function useLayer(kind: OverlayKind, offset?: number): LayerValue {
  let parentBase = (0, reactOverlaysLayers.useContext)(LayerBaseContext);
  if (offset === undefined) {
    let value = parentBase + LAYER_BAND_SIZE;
    let value2 = value + overlayLayerOffsets[kind];
    return {
      base: value,
      style: {
        zIndex: value2,
        "--cds-layer-base": value,
      },
      portalProps: {
        className: portalLayerClassName,
        style: {
          "--cds-portal-z": value2,
          "--cds-layer-base": value,
        },
      },
    };
  }
  validateLayerOffset(`layerOffset=${offset}`, offset);
  let zIndex = parentBase + offset;
  return {
    base: parentBase,
    style: {
      zIndex: zIndex,
      "--cds-layer-base": parentBase,
    },
    portalProps: {
      className: portalLayerClassName,
      style: {
        "--cds-portal-z": zIndex,
        "--cds-layer-base": parentBase,
      },
    },
  };
}
function CdsLayerVarBridge({
  children: children,
  className: className,
}: React.PropsWithChildren<{
  className?: string;
}>): React.ReactElement {
  useUiLocale();
  let value = (0, reactOverlaysLayers.useContext)(LayerBaseContext);
  return (
    <div
      className={cn("contents", className)}
      data-cds={"CdsLayerVarBridge"}
      data-cds-layer-var-bridge={""}
      style={
        {
          "--cds-layer-base": value,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
export {
  CdsLayer,
  CdsLayerVarBridge,
  GLOBAL_LAYER_BASE,
  initializeOverlaysLayers,
  jsxOverlaysLayers,
  LAYER_BAND_SIZE,
  LayerBaseContext,
  overlayLayerOffsets,
  portalLayerClassName,
  reactOverlaysLayers,
  useDefaultLayer,
  useLayer,
  validateLayerOffset,
};
export function installCdsOverlaysLayers(): () => void {
  return () => {
    initializeOverlaysLayers = initializeOnce(() => {
      "use client";

      initializeClassNames();
      reactOverlaysLayers = toModuleNamespace(
        load_react(),
      );
      jsxOverlaysLayers = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      LAYER_BAND_SIZE = 100;
      GLOBAL_LAYER_BASE = 9e3;
      LayerBaseContext = (0, reactOverlaysLayers.createContext)(0);
      (CdsLayer as React.FC<LayerProps>).displayName = "CdsLayer";
      overlayLayerOffsets = {
        modal: 40,
        tooltip: 30,
        contextmenu: 30,
        popover: 20,
        menu: 20,
        combobox: 20,
        coachmark: 10,
      };
      portalLayerClassName = "[&>*]:z-[var(--cds-portal-z)]";
      (
        CdsLayerVarBridge as React.FC<
          React.PropsWithChildren<{
            className?: string;
          }>
        >
      ).displayName = "CdsLayerVarBridge";
    });
  };
}

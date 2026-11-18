import { useUiLocale } from '../../ui-locale.ts';
import type { OverlayKind } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOverlaysAndroidCloseWatcher, useAndroidCloseWatcher } from "./android-close-watcher";
import { initializeOverlaysLayers, useDefaultLayer } from "./layers";
import { initializePlatformReducedMotion_2, PlatformReducedMotionCss_4 } from "../platform/reduced-motion";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsPopupStack, SheetPopupContext } from "../sheets/popup-stack";
import { initializeCdsRoot, useCdsWindow, useOverlayRoot } from "../theme/root";
import { initializeNpm_clsx_xh, load_react, load_react_dom, load_react_jsx_runtime, npm_clsx_Ea } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactOverlaysBackdrop: typeof React;
var jsxOverlaysBackdrop: typeof import("react/jsx-runtime");
var reactDomOverlaysBackdrop: typeof import("react-dom");
var CdsSheetPendingAttribute: string;
var OverlaysBackdropVisibilityOpacityConfig: React.CSSProperties;
var OverlaysBackdropPreventDefault: (
  event: Pick<React.SyntheticEvent, "preventDefault">,
) => void;
var initializeOverlaysBackdrop: typeof import("react-dom");
function useRestoreFocusOnClose(
  input: boolean,
): React.RefCallback<HTMLElement> {
  let value = (0, reactOverlaysBackdrop.useRef)<HTMLElement | null>(null),
    value2 = (0, reactOverlaysBackdrop.useRef)(input);
  (0, reactOverlaysBackdrop.useEffect)(() => {
    value2.current &&
      !input &&
      value.current?.focus({
        preventScroll: true,
      });
    value2.current = input;
  }, [input]);
  return (0, reactOverlaysBackdrop.useCallback)(
    (input2: HTMLElement | null) => {
      value.current = input2;
    },
    [],
  );
}
function OverlayBackdrop({
  kind: kind,
}: {
  kind: OverlayKind;
}): React.ReactPortal | null {
  useUiLocale();
  let value = (0, reactOverlaysBackdrop.useContext)(
      SheetPopupContext,
    ),
    value2 = useOverlayRoot(),
    value3 = useDefaultLayer(kind);
  useAndroidCloseWatcher(value?.open ?? false, value?.dismiss);
  let [value4, value5] = (0, reactOverlaysBackdrop.useState)(false),
    value6 = (0, reactOverlaysBackdrop.useRef)(false),
    value7 = useCdsWindow();
  (0, reactOverlaysBackdrop.useEffect)(() => {
    if (value7 === undefined) return;
    let value9 = value7.requestAnimationFrame(() => {
      value5(true);
    });
    return () => {
      value7.cancelAnimationFrame(value9);
    };
  }, [value7]);
  let value8 =
    value2 ?? (typeof document === "undefined" ? null : document.body);
  return value8 === null || value === null || !value.open
    ? null
    : (0, reactDomOverlaysBackdrop.createPortal)(
        <PopupSurface {...value3.portalProps}>
          <div
            role={"presentation"}
            {...{
              [CdsSheetPendingAttribute]: "",
            }}
            className={npm_clsx_Ea(
              PlatformReducedMotionCss_4,
              !value4 && "opacity-0",
            )}
            style={value3.style}
            onPointerDown={(input: React.PointerEvent<HTMLElement>) => {
              value6.current = true;
              OverlaysBackdropPreventDefault(input);
            }}
            onPointerCancel={() => {
              value6.current = false;
            }}
            onMouseDown={OverlaysBackdropPreventDefault}
            onClick={() => {
              value6.current && ((value6.current = false), value.dismiss());
            }}
          />
        </PopupSurface>,
        value8,
      );
}
export {
  CdsSheetPendingAttribute,
  initializeOverlaysBackdrop,
  jsxOverlaysBackdrop,
  OverlayBackdrop,
  OverlaysBackdropPreventDefault,
  OverlaysBackdropVisibilityOpacityConfig,
  reactDomOverlaysBackdrop,
  reactOverlaysBackdrop,
  useRestoreFocusOnClose,
};
export function installCdsOverlaysBackdrop(): () => void {
  return () => {
    initializeOverlaysBackdrop = initializeOnce(() => {
      "use client";

      initializeCdsRoot();
      initializeOverlaysLayers();
      initializeOverlaysAndroidCloseWatcher();
      initializePlatformRootFontSize_2();
      initializeSheetsPopupStack();
      initializePlatformReducedMotion_2();
      reactOverlaysBackdrop = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxOverlaysBackdrop = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      reactDomOverlaysBackdrop = toModuleNamespace(
        load_react_dom(),
      );
      CdsSheetPendingAttribute = "data-cds-sheet-pending";
      OverlaysBackdropVisibilityOpacityConfig = {
        visibility: "hidden",
        opacity: 0,
      };
      OverlaysBackdropPreventDefault = (
        event: Pick<React.SyntheticEvent, "preventDefault">,
      ): void => {
        event.preventDefault();
      };
    });
  };
}

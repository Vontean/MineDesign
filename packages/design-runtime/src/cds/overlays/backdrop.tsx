import { useUiLocale } from '../../ui-locale.ts';
import type { OverlayKind } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOverlaysAndroidCloseWatcher, useAndroidCloseWatcher } from "./android-close-watcher";
import { initializeOverlaysLayers, useDefaultLayer } from "./layers";
import { initializeSheetMotionClassNames, sheetBackdropClassName } from "../platform/reduced-motion";
import { initializeRootFontSizeHooks, PopupSurface } from "../platform/root-font-size";
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
  isOpen: boolean,
): React.RefCallback<HTMLElement> {
  let triggerElementRef = (0, reactOverlaysBackdrop.useRef)<HTMLElement | null>(null),
    wasOpenRef = (0, reactOverlaysBackdrop.useRef)(isOpen);
  (0, reactOverlaysBackdrop.useEffect)(() => {
    wasOpenRef.current &&
      !isOpen &&
      triggerElementRef.current?.focus({
        preventScroll: true,
      });
    wasOpenRef.current = isOpen;
  }, [isOpen]);
  return (0, reactOverlaysBackdrop.useCallback)(
    (element: HTMLElement | null) => {
      triggerElementRef.current = element;
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
    overlayRoot = useOverlayRoot(),
    layer = useDefaultLayer(kind);
  useAndroidCloseWatcher(value?.open ?? false, value?.dismiss);
  let [isVisible, setIsVisible] = (0, reactOverlaysBackdrop.useState)(false),
    isPointerDownRef = (0, reactOverlaysBackdrop.useRef)(false),
    cdsWindow = useCdsWindow();
  (0, reactOverlaysBackdrop.useEffect)(() => {
    if (cdsWindow === undefined) return;
    let animationFrameId = cdsWindow.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => {
      cdsWindow.cancelAnimationFrame(animationFrameId);
    };
  }, [cdsWindow]);
  let portalContainer =
    overlayRoot ?? (typeof document === "undefined" ? null : document.body);
  return portalContainer === null || value === null || !value.open
    ? null
    : (0, reactDomOverlaysBackdrop.createPortal)(
        <PopupSurface {...layer.portalProps}>
          <div
            role={"presentation"}
            {...{
              [CdsSheetPendingAttribute]: "",
            }}
            className={npm_clsx_Ea(
              sheetBackdropClassName,
              !isVisible && "opacity-0",
            )}
            style={layer.style}
            onPointerDown={(event: React.PointerEvent<HTMLElement>) => {
              isPointerDownRef.current = true;
              OverlaysBackdropPreventDefault(event);
            }}
            onPointerCancel={() => {
              isPointerDownRef.current = false;
            }}
            onMouseDown={OverlaysBackdropPreventDefault}
            onClick={() => {
              isPointerDownRef.current && ((isPointerDownRef.current = false), value.dismiss());
            }}
          />
        </PopupSurface>,
        portalContainer,
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
      initializeRootFontSizeHooks();
      initializeSheetsPopupStack();
      initializeSheetMotionClassNames();
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

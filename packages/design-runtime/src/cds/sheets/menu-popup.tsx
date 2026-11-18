import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { CollisionPaddingProvider, ComponentsIconContext, Icon, IconRenderer, initializeComponentsIcon_2, initializeComponentsIcon_3 } from "../components/icon";
import { sheetFrameHeight } from "../dom/inert";
import { initializeDomRefComposition, useEventRef } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeHooksStableCallback_2, useOptionalStableCallback } from "../hooks/stable-callback";
import { initializeMenuConfiguration, MenuConfigurationContext, MenuItemContext, MenuRootContext, MenuSheetLabelsContext, PopupScrollArea, warnNestedMenuInitialFocus, warnNestedMenuLayerOffset } from "../menu/configuration";
import { initializeMenuItemStyles, initializeMenuItemStyles_2, initializeMenuItemStyles_3, menuItemVariants, MenuPopupElement, useMenuPopupFocus, usePopupEntryAnimation } from "../menu/item-styles";
import { initializeMenuPassiveOpenGate } from "../menu/passive-open-gate";
import { initializeMenuPopup, MenuPopupCss, PassiveOpenGate, usePassiveOpenCell } from "../menu/popup";
import { initializeOverlaysAndroidCloseWatcher, useAndroidCloseWatcher } from "../overlays/android-close-watcher";
import { initializeOverlaysLayers, LayerBaseContext, useLayer } from "../overlays/layers";
import { ClipPathInset00200vh0Value, initializePlatformReducedMotion, initializePlatformReducedMotion_2, PlatformReducedMotionClassNames_2, PlatformReducedMotionClassNames_3, PlatformReducedMotionCss_2, PlatformReducedMotionCss_3, PlatformReducedMotionCss_4, PlatformReducedMotionLabel_2 } from "../platform/reduced-motion";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsChrome, initializeSheetsChrome_2, SheetHandle, SheetHeading, sheetMutationIsScrollOnly, sheetNaturalHeight, useCoveredSheetState, useSheetDismissal, useSheetTextFocus } from "./chrome";
import { ComfortableValue, getSheetFixedPosition, getSheetFrameStyle, initializeSheetsLayout, SheetsLayoutConstant, SheetsLayoutConstant_2, SheetsLayoutCss_3, SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig } from "./layout";
import { getInertPropsValue, initializeSheetsPopupStack, prefersReducedMotion, SheetPopupBridgeContext, SheetPopupContext, SheetStackContext, useIsSheet, useSheetState } from "./popup-stack";
import { CdsSheetPeelingAttribute, CdsSheetTreeClosingAttribute, coveredSheetAttribute, drilledSheetAttribute, initializeSheetsPresentation, sheetContainsTextInput, sheetNeedsScrolling, sheetScrollAttribute } from "./presentation";
import { initializeSheetsScrollArea } from "./scroll-area";
import { clearSheetTransition, initializeSheetsStyles, initializeSheetsStyles_2, useLabel } from "./styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot, useCdsWindow, useOverlayRoot } from "../theme/root";
import { initializeThemeSurfaces, surfaceBackgroundTokens, virtualTriggerAnchor } from "../theme/surfaces";
import { initializeNpm__base_ui_react_jj, initializeNpm__base_ui_react_pge, initializeNpm__base_ui_react_wY, load_react, load_react_jsx_runtime, npm_Combobox_Yi, npm_Menu_La, npm_Popover_$f } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactSheetsMenuPopup: Dynamic;
var PointerEventsNoneValue: Dynamic;
var SheetsMenuPopupLimit: Dynamic;
var initializeSheetsMenuPopup: Dynamic;
var SheetsMenuPopupLabel: Dynamic;
var SheetsMenuPopupLabel_2: Dynamic;
var SheetsMenuPopupMediaQuery: Dynamic;
var SheetsMenuPopupLabel_3: Dynamic;
var initializeSheetsMenuPopup_2: Dynamic;
var reactSheetsMenuPopup_2: Dynamic;
var SheetsMenuPopupSCRIPTSTYLELINKSet: Dynamic;
var SheetsMenuPopupLabel_4: Dynamic;
var SheetsMenuPopupElementCache: Dynamic;
var initializeSheetsMenuPopup_3: Dynamic;
var reactSheetsMenuPopup_3: Dynamic;
var jsxSheetsMenuPopup: Dynamic;
var SheetsMenuPopupElementCache_2: Dynamic;
var MenuSheetPopup: Dynamic;
var initializeSheetsMenuPopup_4: Dynamic;
var jsxSheetsMenuPopup_2: Dynamic;
var initializeSheetsMenuPopup_5: Dynamic;
var jsxSheetsMenuPopup_3: Dynamic;
var initializeSheetsMenuPopup_6: Dynamic;
function browserWindow(input?: Dynamic): Dynamic {
  return input ?? (typeof window === "undefined" ? undefined : window);
}
function windowMatchesMedia(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = browserWindow(options);
  return (
    typeof value?.matchMedia == "function" && value.matchMedia(input).matches
  );
}
function usesCoarsePointer(input?: Dynamic): Dynamic {
  return windowMatchesMedia(SheetsMenuPopupLabel, input);
}
function shouldSkipSheetAnimation(input?: Dynamic): Dynamic {
  let value: Dynamic = browserWindow(input);
  return value?.navigator?.userAgent?.includes(SheetsMenuPopupLabel_3)
    ? true
    : !(
        windowMatchesMedia(SheetsMenuPopupMediaQuery, value) &&
        (value?.navigator?.maxTouchPoints ?? 0) > 0
      );
}
function subscribeSheetMedia(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = browserWindow(options);
  if (typeof value?.matchMedia != "function") return (): Dynamic => {};
  let value2: Dynamic = [
    SheetsMenuPopupLabel,
    SheetsMenuPopupLabel_2,
    SheetsMenuPopupMediaQuery,
  ].map((input2?: Dynamic): Dynamic => value.matchMedia(input2));
  for (let value3 of value2 as Dynamic)
    value3.addEventListener("change", input);
  return (): Dynamic => {
    for (let value3 of value2 as Dynamic)
      value3.removeEventListener("change", input);
  };
}
function makeSheetSiblingsInert(element?: Dynamic): Dynamic {
  let items: Dynamic = [],
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      let value2: Dynamic = SheetsMenuPopupElementCache.get(input) ?? 0;
      if (value2 === 0) {
        if (input.hasAttribute("inert")) return;
        input.setAttribute("inert", "");
        input.setAttribute("data-cds-sheet-inert", "");
      }
      SheetsMenuPopupElementCache.set(input, value2 + 1);
      items.push(input);
    },
    callback2: Dynamic = (element2?: Dynamic): Dynamic => {
      if (
        !(
          SheetsMenuPopupSCRIPTSTYLELINKSet.has(element2.tagName) ||
          element2.matches(SheetsMenuPopupLabel_4)
        )
      ) {
        if (element2.querySelector(SheetsMenuPopupLabel_4) === null) {
          callback(element2);
          return;
        }
        for (let value2 of Array.from(element2.children) as Dynamic)
          callback2(value2);
      }
    },
    value: Dynamic = element,
    body: Dynamic = element.ownerDocument.body;
  for (; value !== null && value !== body && value.parentElement !== null; ) {
    let parentElement: Dynamic = value.parentElement,
      value2: Dynamic = value;
    for (let value3 of Array.from(parentElement.children) as Dynamic)
      value3 !== value2 && callback2(value3);
    value = parentElement;
  }
  return (): Dynamic => {
    for (let value2 of items as Dynamic) {
      let value3: Dynamic =
        (SheetsMenuPopupElementCache.get(value2) ?? 1) - 1;
      value3 <= 0
        ? (SheetsMenuPopupElementCache.delete(value2),
          value2.hasAttribute("data-cds-sheet-inert") &&
            (value2.removeAttribute("inert"),
            value2.removeAttribute("data-cds-sheet-inert")))
        : SheetsMenuPopupElementCache.set(value2, value3);
    }
  };
}
function useSheetSiblingsInert({
  node: node,
  open: open,
  liftOnClose: liftOnClose,
}: Dynamic): Dynamic {
  let value: Dynamic = useCdsWindow(),
    value2: Dynamic = useOptionalStableCallback(liftOnClose),
    value3: Dynamic = (0, reactSheetsMenuPopup_2.useRef)(null),
    value4: Dynamic = (0, reactSheetsMenuPopup_2.useRef)(null);
  useIsomorphicLayoutEffect((): Dynamic => {
    if (!open || node === null || value === undefined) return;
    let value5: Dynamic = value.requestAnimationFrame((): Dynamic => {
      if (value3.current === null) {
        let value6: Dynamic = sheetPortalAncestor(node);
        value6 !== null && (value3.current = makeSheetSiblingsInert(value6));
      }
    });
    return (): Dynamic => {
      value.cancelAnimationFrame(value5);
      let current: Dynamic = value3.current;
      value3.current = null;
      if (current === null) return;
      if ((value2?.() ?? "now") === "now" || !canAnimateSheetUnmount(value)) {
        current();
        return;
      }
      let value6: Dynamic = deferSheetInertRemoval(
        value,
        current,
        (): Dynamic => {
          value4.current === value6 && (value4.current = null);
        },
      );
      value4.current = value6;
    };
  }, [node, open, value, value2]);
  return (0, reactSheetsMenuPopup_2.useCallback)(
    (): Dynamic => value4.current?.(),
    [],
  );
}
function canAnimateSheetUnmount(input?: Dynamic): Dynamic {
  return (
    !shouldSkipSheetAnimation(input) &&
    !prefersReducedMotion() &&
    input.document.visibilityState !== "hidden"
  );
}
function deferSheetInertRemoval(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let document2: Dynamic = input.document,
    flag: Dynamic = false,
    callback: Dynamic = (): Dynamic => {
      flag ||
        ((flag = true),
        input.cancelAnimationFrame(value),
        input.removeEventListener("pointerdown", callback, true),
        input.removeEventListener("keydown", callback, true),
        input.removeEventListener("pagehide", callback),
        document2.removeEventListener("visibilitychange", callback2),
        options(),
        context());
    },
    callback2: Dynamic = (): Dynamic => {
      document2.visibilityState === "hidden" && callback();
    },
    value: Dynamic = input.requestAnimationFrame((): Dynamic => {
      value = input.requestAnimationFrame(callback);
    });
  input.addEventListener("pointerdown", callback, true);
  input.addEventListener("keydown", callback, true);
  input.addEventListener("pagehide", callback);
  document2.addEventListener("visibilitychange", callback2);
  return callback;
}
function sheetPortalAncestor(element?: Dynamic): Dynamic {
  let body: Dynamic = element.ownerDocument.body,
    value: Dynamic = element,
    value2: Dynamic = null;
  for (; value !== null && value !== body; ) {
    if (
      value.hasAttribute("data-base-ui-portal") ||
      value.hasAttribute("data-cds-portal")
    )
      return value;
    value2 = value;
    value = value.parentElement;
  }
  return value2;
}
function preventSheetTab(event?: Dynamic): Dynamic {
  event.key === "Tab" && (event.preventDefault(), event.stopPropagation());
}
function hideCoveredSheet(input?: Dynamic, options?: Dynamic): Dynamic {
  let entry: Dynamic = SheetsMenuPopupElementCache_2.get(input);
  entry === undefined &&
    ((entry = new Set()), SheetsMenuPopupElementCache_2.set(input, entry));
  entry.add(options);
  input.setAttribute("aria-hidden", "true");
  input.setAttribute(drilledSheetAttribute, "");
}
function restoreCoveredSheet(input?: Dynamic, options?: Dynamic): Dynamic {
  let entry: Dynamic = SheetsMenuPopupElementCache_2.get(input);
  entry?.delete(options);
  (entry === undefined || entry.size === 0) &&
    (input.removeAttribute("aria-hidden"),
    input.removeAttribute(drilledSheetAttribute));
}
function sheetCloseInertDelay(input?: Dynamic): Dynamic {
  if (input?.reason === "outside-press") return "after-paint";
  let value: Dynamic = input?.event;
  if (
    input?.reason !== "item-press" ||
    value === undefined ||
    !("detail" in value) ||
    value.detail === 0
  )
    return "now";
  let target: Dynamic = value.target;
  return (target !== null && "closest" in target
    ? target.closest('[role^="menuitem"]')
    : null
  )?.hasAttribute("data-cds-focuses-nothing") === true
    ? "after-paint"
    : "now";
}
function SheetBackButton({ nested: nested }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
      MenuRootContext,
    ),
    { label: value2 }: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
      MenuItemContext,
    ),
    value3: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
      MenuSheetLabelsContext,
    ),
    value4: Dynamic = useLabel("back", "Back"),
    value5: Dynamic = value3.backLabel ?? value4;
  return (
    <SheetHeading
      title={nested ? (value2) : (value3.sheetTitle)}
      leading={
        nested ? (
          <npm_Menu_La.Item
            closeOnClick={false}
            onClick={(): Dynamic => value?.close()}
            aria-label={value5}
            label={value5}
            className={cn(
              menuItemVariants({
                variant: "default",
              }),
              "min-h-control w-auto",
            )}
          >
            <Icon
              name={"ArrowLeft"}
              size={"md"}
              className={"shrink-0 rtl:-scale-x-100"}
            />
          </npm_Menu_La.Item>
        ) : undefined
      }
    />
  );
}
function SheetCloseButton(): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
      SheetPopupContext,
    ),
    value2: Dynamic = useLabel("close", "Close"),
    value3: Dynamic =
      (0, reactSheetsMenuPopup_3.useContext)(MenuSheetLabelsContext)
        .closeLabel ?? value2;
  return (
    <npm_Menu_La.Item
      closeOnClick={false}
      onClick={(): Dynamic => value?.dismiss()}
      aria-label={value3}
      label={value3}
      data-cds-sheet-control={""}
      className={
        "group/sheet-close cds-reset block w-full rounded outline-none select-none focus-visible:outline-hidden [&:not(:focus-visible):not([data-highlighted]):not([data-cds-sheet-control-held])]:sr-only"
      }
    >
      <span
        className={cn(
          menuItemVariants({
            variant: "default",
          }),
          "group-data-[highlighted]/sheet-close:bg-fill-ghost-hover",
        )}
      >
        <IconRenderer icon={"X"} />
        <span className={"min-w-0 flex-1 truncate"}>{value3}</span>
      </span>
    </npm_Menu_La.Item>
  );
}
function MobileSheetsPopoverSheetBackdrop({
  sheetPopup: sheetPopup,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <npm_Popover_$f.Backdrop
      data-presentation={"sheet"}
      data-sheet-scrim={sheetPopup.frame?.treeId}
      className={
        sheetPopup.state.depth > 0
          ? PlatformReducedMotionClassNames_2
          : PlatformReducedMotionCss_4
      }
    />
  );
}
function MobileSheetsPopoverSheetContent({
  sheetPopup: sheetPopup,
  className: className,
  bodyRef: bodyRef,
  bodyClassName: bodyClassName,
  closeLabel: closeLabel,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let { chrome: value }: Dynamic = sheetPopup;
  return (
    <SheetStackContext.Provider value={sheetPopup.stack}>
      <value.Handle />
      <value.Body
        className={cn(
          className,
          "h-auto max-h-none min-h-0 w-full min-w-0 max-w-none flex-auto",
        )}
      >
        <div
          ref={bodyRef}
          tabIndex={-1}
          data-cds-popover-body={""}
          {...{
            [sheetScrollAttribute]: "",
          }}
          className={bodyClassName}
        >
          {children}
        </div>
        <value.DismissButton
          as={npm_Popover_$f.Close}
          label={closeLabel}
        />
      </value.Body>
    </SheetStackContext.Provider>
  );
}
function MobileSheetsComboboxSheetBackdrop({
  sheetPopup: sheetPopup,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <npm_Combobox_Yi.Backdrop
      data-presentation={"sheet"}
      data-sheet-scrim={sheetPopup.frame?.treeId}
      className={
        sheetPopup.state.depth > 0
          ? PlatformReducedMotionClassNames_2
          : PlatformReducedMotionCss_4
      }
    />
  );
}
export {
  browserWindow,
  canAnimateSheetUnmount,
  deferSheetInertRemoval,
  hideCoveredSheet,
  initializeSheetsMenuPopup,
  initializeSheetsMenuPopup_2,
  initializeSheetsMenuPopup_3,
  initializeSheetsMenuPopup_4,
  initializeSheetsMenuPopup_5,
  initializeSheetsMenuPopup_6,
  jsxSheetsMenuPopup,
  jsxSheetsMenuPopup_2,
  jsxSheetsMenuPopup_3,
  makeSheetSiblingsInert,
  MenuSheetPopup,
  MobileSheetsComboboxSheetBackdrop,
  MobileSheetsPopoverSheetBackdrop,
  MobileSheetsPopoverSheetContent,
  PointerEventsNoneValue,
  preventSheetTab,
  reactSheetsMenuPopup,
  reactSheetsMenuPopup_2,
  reactSheetsMenuPopup_3,
  restoreCoveredSheet,
  SheetBackButton,
  SheetCloseButton,
  sheetCloseInertDelay,
  sheetPortalAncestor,
  SheetsMenuPopupElementCache,
  SheetsMenuPopupElementCache_2,
  SheetsMenuPopupLabel,
  SheetsMenuPopupLabel_2,
  SheetsMenuPopupLabel_3,
  SheetsMenuPopupLabel_4,
  SheetsMenuPopupLimit,
  SheetsMenuPopupMediaQuery,
  SheetsMenuPopupSCRIPTSTYLELINKSet,
  shouldSkipSheetAnimation,
  subscribeSheetMedia,
  usesCoarsePointer,
  useSheetSiblingsInert,
  windowMatchesMedia,
};
export function installCdsSheetsMenuPopup(): () => void {
  return () => {
    initializeSheetsMenuPopup = initializeOnce((): Dynamic => {
      "use client";

      reactSheetsMenuPopup = toModuleNamespace(
        load_react(),
      );
      PointerEventsNoneValue = "pointer-events-none";
      SheetsMenuPopupLimit = 2;
    });
    initializeSheetsMenuPopup_2 = initializeOnce((): Dynamic => {
      SheetsMenuPopupLabel = "(pointer: coarse), (hover: none)";
      SheetsMenuPopupLabel_2 = "(width < 40rem)";
      SheetsMenuPopupMediaQuery = "(pointer: coarse)";
      SheetsMenuPopupLabel_3 = " Electron/";
    });
    initializeSheetsMenuPopup_3 = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeCdsRoot();
      initializeSheetsMenuPopup_2();
      initializeHooksStableCallback_2();
      initializePlatformReducedMotion();
      reactSheetsMenuPopup_2 = toModuleNamespace(
        load_react(),
      );
      SheetsMenuPopupSCRIPTSTYLELINKSet = new Set([
        "SCRIPT",
        "STYLE",
        "LINK",
        "TEMPLATE",
        "NOSCRIPT",
      ]);
      SheetsMenuPopupLabel_4 =
        '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"], [data-cds="Toast"]';
      SheetsMenuPopupElementCache = new WeakMap();
    });
    initializeSheetsMenuPopup_4 = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeSheetsStyles_2();
      initializeCdsRoot();
      initializeOverlaysLayers();
      initializeOverlaysAndroidCloseWatcher();
      initializeDomRefComposition();
      initializePlatformRootFontSize_2();
      initializeComponentsIcon_2();
      initializeComponentsIcon_3();
      initializeThemeSurfaces();
      initializeSheetsLayout();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializePlatformReducedMotion_2();
      initializeMenuConfiguration();
      initializeSheetsScrollArea();
      initializeMenuPopup();
      initializeMenuPassiveOpenGate();
      initializeMenuItemStyles();
      initializeMenuItemStyles_2();
      initializeMenuItemStyles_3();
      initializeSheetsMenuPopup();
      initializeSheetsStyles();
      initializeSheetsChrome();
      initializeSheetsChrome_2();
      initializeSheetsMenuPopup_3();
      reactSheetsMenuPopup_3 = toModuleNamespace(
        load_react(),
      );
      jsxSheetsMenuPopup = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_jj();
      SheetsMenuPopupElementCache_2 = new WeakMap();
      MenuSheetPopup = (0, reactSheetsMenuPopup_3.forwardRef)(
        (
          {
            side: side,
            align = "start",
            sideOffset: sideOffset,
            collisionPadding: collisionPadding,
            collisionAvoidance: collisionAvoidance,
            anchor: anchor,
            container: container,
            className: className,
            children: children,
            header: header,
            footer: footer,
            maxVisibleItems: maxVisibleItems,
            layerOffset: layerOffset,
            stableWhileOpen = false,
            "data-cds": dataCds = "Menu",
            style: style,
            initialFocus: initialFocus,
            ...props
          }: Dynamic,
          options?: Dynamic,
        ): Dynamic => {
          "use no memo";

          let value: Dynamic = useOverlayRoot(),
            value2: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
              MenuRootContext,
            ),
            value3: Dynamic =
              (0, reactSheetsMenuPopup_3.useContext)(
                MenuConfigurationContext,
              ) && value2 === null,
            value4: Dynamic = useIsSheet(),
            value5: Dynamic = value4 && value2 !== null,
            value6: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
              ComponentsIconContext,
            ),
            value7: Dynamic = collisionPadding ?? value6?.collisionPadding,
            value8: Dynamic = (0, reactSheetsMenuPopup_3.useMemo)(
              (): Dynamic =>
                anchor !== undefined || !value2
                  ? anchor
                  : virtualTriggerAnchor(value2),
              [anchor, value2],
            ),
            value9: Dynamic =
              sideOffset ??
              (value3 ? undefined : value2 && anchor === undefined ? 2 : 6),
            value10: Dynamic = usePopupEntryAnimation({
              enabled: stableWhileOpen && !value4 && !value3,
              side: side,
              align: align,
            }),
            value11: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
              SheetPopupContext,
            ),
            value12: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
              MenuItemContext,
            ),
            value13: Dynamic = (0, reactSheetsMenuPopup_3.useRef)(null),
            value14: Dynamic = (0, reactSheetsMenuPopup_3.useRef)(null),
            value15: Dynamic = (0,
            reactSheetsMenuPopup_3.useCallback)((): Dynamic => {
              let current: Dynamic = value14.current;
              current !== null &&
                (restoreCoveredSheet(current, value14),
                (value14.current = null));
            }, []),
            value16: Dynamic = (0, reactSheetsMenuPopup_3.useCallback)(
              (element?: Dynamic): Dynamic => {
                if (value2 === null) return;
                let value55: Dynamic =
                  value11 !== null
                    ? (value2.triggerRef.current?.closest(
                        `[data-sheet-tree="${CSS.escape(value11.treeId)}"][data-presentation="sheet"]`,
                      ) ?? null)
                    : null;
                value55 !== null &&
                  value14.current !== value55 &&
                  (value15(),
                  hideCoveredSheet(value55, value14),
                  (value14.current = value55));
                element.contains(element.ownerDocument.activeElement) ||
                  element.focus({
                    preventScroll: true,
                  });
              },
              [value2, value15, value11],
            ),
            [value17, value18]: Dynamic = (0, reactSheetsMenuPopup_3.useState)(
              false,
            ),
            value19: Dynamic = (0, reactSheetsMenuPopup_3.useRef)(false),
            value20: Dynamic = (0, reactSheetsMenuPopup_3.useCallback)(
              (input?: Dynamic): Dynamic => {
                value19.current = input;
                value18(input);
              },
              [],
            ),
            [value21, value22]: Dynamic = (0, reactSheetsMenuPopup_3.useState)(
              null,
            ),
            value23: Dynamic = value11?.takeCloseRequest,
            value24: Dynamic = (0, reactSheetsMenuPopup_3.useCallback)(
              (): Dynamic => sheetCloseInertDelay(value23?.() ?? null),
              [value23],
            ),
            value25: Dynamic = useSheetSiblingsInert({
              node: value21,
              open: value4 && !value5 && (value11?.open ?? false),
              liftOnClose: value24,
            }),
            value26: Dynamic = useSheetState(),
            value27: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
              SheetStackContext,
            ),
            value28: Dynamic = (0, reactSheetsMenuPopup_3.useContext)(
              SheetPopupBridgeContext,
            ),
            [value29, value30]: Dynamic = (0, reactSheetsMenuPopup_3.useState)(
              null,
            ),
            value31: Dynamic = (0, reactSheetsMenuPopup_3.useCallback)(
              (element?: Dynamic): Dynamic => {
                value13.current = value4 ? element : null;
                value30(value4 ? element : null);
                value22(value4 && !value5 ? element : null);
                if (element === null) {
                  value25();
                  value15();
                  value20(false);
                  return;
                }
                if (!value4) {
                  value20(false);
                  return;
                }
                if (!value5) {
                  let value55: Dynamic = sheetContainsTextInput(
                    element,
                  );
                  value55 &&
                    ((element.style.minHeight = SheetsLayoutCss_3),
                    (element.style.maxHeight = SheetsLayoutCss_3));
                  value20(value55);
                  value11?.pinHeight(
                    element.getBoundingClientRect().height,
                    sheetNeedsScrolling(element),
                  );
                  return;
                }
                value16(element);
                element.style.transition = "none";
                element.style.translate =
                  element.ownerDocument.defaultView?.getComputedStyle(element)
                    .direction === "rtl"
                    ? "-100% 0"
                    : "100% 0";
                element.getBoundingClientRect();
                element.style.transition = "";
                element.style.translate = "";
              },
              [value4, value5, value11, value15, value16, value20, value25],
            );
          useSheetTextFocus(value29, value11);
          useCoveredSheetState(value29);
          useSheetDismissal(value29, value11, value26.covered);
          let value32: Dynamic = value4 && value26.covered,
            value33: Dynamic = value4 && value26.inert;
          useAndroidCloseWatcher(
            value4 && (value5 ? value12.open : (value11?.open ?? false)),
            value5 ? value2?.close : value11?.dismiss,
          );
          let value34: Dynamic = (0, reactSheetsMenuPopup_3.useRef)(false),
            value35: Dynamic = value11?.open ?? false;
          useIsomorphicLayoutEffect((): Dynamic => {
            let current: Dynamic = value13.current,
              value55: Dynamic = value5 && value12.open && current !== null,
              current2: Dynamic = value34.current;
            value34.current = value55;
            value55 && !current2
              ? value16(current)
              : !value55 && value35 && value15();
          }, [value5, value12.open, value35, value16, value15]);
          let value36: Dynamic = (0, reactSheetsMenuPopup_3.useRef)(false),
            [value37, value38]: Dynamic = (0, reactSheetsMenuPopup_3.useState)(
              false,
            );
          useIsomorphicLayoutEffect((): Dynamic => {
            let value55: Dynamic = value5 && value12.open,
              current: Dynamic = value36.current;
            value36.current = value55;
            value55 !== current && value38(!value55 && value35);
          }, [value5, value12.open, value35]);
          useIsomorphicLayoutEffect((): Dynamic => {
            let current: Dynamic = value13.current;
            value5 &&
              value12.open &&
              current !== null &&
              clearSheetTransition(current);
          }, [value5, value12.open]);
          let value39: Dynamic = value11?.pushLevelHeight,
            value40: Dynamic = value11?.drag;
          (0, reactSheetsMenuPopup_3.useEffect)((): Dynamic => {
            if (
              !value5 ||
              !value12.open ||
              value29 === null ||
              value39 === undefined
            )
              return;
            let defaultView: Dynamic = value29.ownerDocument.defaultView,
              value55: Dynamic,
              flag: Dynamic = false,
              callback: Dynamic = (): Dynamic => {
                let value58: Dynamic = defaultView?.innerHeight ?? 1 / 0,
                  value59: Dynamic = value58 * SheetsLayoutConstant,
                  value60: Dynamic = sheetContainsTextInput(
                    value29,
                  ),
                  value61: Dynamic = sheetNaturalHeight(value29);
                flag = value61 > value59;
                let value62: Dynamic = value60
                    ? value58 * SheetsLayoutConstant_2
                    : Math.min(value61, value59),
                  value63: Dynamic = value60 || flag;
                value55 === undefined
                  ? (value55 = value39(value62, value63))
                  : value55.set(value62, value63);
              },
              callback2: Dynamic = (): Dynamic => {
                value56 = undefined;
                if (value40 !== undefined && value40.get() !== null) {
                  value56 = defaultView?.requestAnimationFrame(callback2);
                  return;
                }
                callback();
              },
              value56: Dynamic = defaultView?.requestAnimationFrame(callback2),
              value57: Dynamic =
                defaultView !== null &&
                typeof defaultView.MutationObserver !== "undefined"
                  ? new defaultView.MutationObserver(
                      (input?: Dynamic): Dynamic => {
                        if (
                          value56 !== undefined ||
                          value55 === undefined ||
                          sheetMutationIsScrollOnly(input, flag)
                        )
                          return;
                        let callback3: Dynamic = (): Dynamic => {
                          value56 = undefined;
                          if (value40 !== undefined && value40.get() !== null) {
                            value56 =
                              defaultView.requestAnimationFrame(callback3);
                            return;
                          }
                          callback();
                        };
                        value56 = defaultView.requestAnimationFrame(callback3);
                      },
                    )
                  : null;
            value57?.observe(value29, {
              childList: true,
              subtree: true,
            });
            return (): Dynamic => {
              value57?.disconnect();
              value56 !== undefined &&
                defaultView?.cancelAnimationFrame(value56);
              value55?.release();
            };
          }, [value5, value12.open, value29, value39, value40]);
          let value41: Dynamic = value11?.repinHeight,
            value42: Dynamic = value11?.open ?? false;
          (0, reactSheetsMenuPopup_3.useEffect)((): Dynamic => {
            if (
              !value4 ||
              value5 ||
              !value42 ||
              value29 === null ||
              value41 === undefined
            )
              return;
            let defaultView: Dynamic = value29.ownerDocument.defaultView;
            if (
              defaultView === null ||
              typeof defaultView.MutationObserver === "undefined"
            )
              return;
            let index: Dynamic = 0,
              flag: Dynamic = false,
              value55: Dynamic = new defaultView.MutationObserver(
                (input?: Dynamic): Dynamic => {
                  if (
                    index !== 0 ||
                    sheetMutationIsScrollOnly(input, flag)
                  )
                    return;
                  let callback: Dynamic = (): Dynamic => {
                    index = 0;
                    if (value40 !== undefined && value40.get() !== null) {
                      index = defaultView.requestAnimationFrame(callback);
                      return;
                    }
                    if (sheetContainsTextInput(value29)) {
                      value19.current ||
                        (value20(true),
                        value41(
                          defaultView.innerHeight *
                            SheetsLayoutConstant_2,
                          true,
                        ));
                      return;
                    }
                    let value56: Dynamic =
                        defaultView.innerHeight * SheetsLayoutConstant,
                      value57: Dynamic = sheetNaturalHeight(
                        value29,
                      );
                    flag = value57 > value56;
                    value41(Math.min(value57, value56), flag);
                  };
                  index = defaultView.requestAnimationFrame(callback);
                },
              );
            value55.observe(value29, {
              childList: true,
              subtree: true,
            });
            return (): Dynamic => {
              value55.disconnect();
              index !== 0 && defaultView.cancelAnimationFrame(index);
            };
          }, [value4, value5, value42, value29, value41, value40, value20]);
          let value43: Dynamic = value11?.height,
            value44: Dynamic = value11?.pinHeight;
          useIsomorphicLayoutEffect((): Dynamic => {
            let current: Dynamic = value13.current;
            !value4 ||
              value5 ||
              value43 !== undefined ||
              current === null ||
              (clearSheetTransition(current),
              value44?.(
                current.getBoundingClientRect().height,
                sheetNeedsScrolling(current),
              ));
          }, [value4, value5, value43, value44]);
          let value45: Dynamic = useMenuPopupFocus(
              value2?.triggerRef,
              props.finalFocus,
            ),
            value46: Dynamic = value3
              ? props.finalFocus === undefined || props.finalFocus === null
              : anchor != null &&
                value2 === null &&
                props.finalFocus === undefined,
            value47: Dynamic = usePassiveOpenCell(value2 === null);
          value47.root?.declareFocusProps(initialFocus, props.finalFocus);
          value2 !== null &&
            initialFocus !== undefined &&
            warnNestedMenuInitialFocus();
          let state: Dynamic = {
              ...props,
              onKeyDown: (input?: Dynamic): Dynamic => {
                props.onKeyDown?.(input);
                preventSheetTab(input);
              },
            },
            value48: Dynamic = useEventRef(
              (input?: Dynamic): Dynamic => {
                value10.popupRef(input);
                value31(input);
                value45(input);
                value47.root?.registerPopup(input);
              },
              options,
            ),
            value49: Dynamic = value4
              ? getSheetFrameStyle(value11, {
                  floor: value17 ? "half" : "content",
                  parentFrameHeight: value5 ? undefined : value27?.frameHeight,
                })
              : value10.held !== null
                ? {
                    pointerEvents: "auto",
                  }
                : undefined,
            value50: Dynamic =
              value49 === undefined
                ? style
                : typeof style == "function"
                  ? (input?: Dynamic): Dynamic => ({
                      ...style(input),
                      ...value49,
                    })
                  : {
                      ...style,
                      ...value49,
                    };
          value2 !== null &&
            layerOffset !== undefined &&
            warnNestedMenuLayerOffset();
          let value51: Dynamic = useLayer(
              value3 ? "contextmenu" : "menu",
              value2 === null ? layerOffset : undefined,
            ),
            value52: Dynamic = useCdsWindow(),
            value53: Dynamic = sheetFrameHeight(value11, value52),
            value54: Dynamic = (0, reactSheetsMenuPopup_3.useMemo)(
              (): Dynamic =>
                value4 && value28 !== null
                  ? {
                      depth: value26.depth,
                      frameHeight: value53,
                      cover: value28,
                    }
                  : null,
              [value4, value28, value26.depth, value53],
            );
          return (
            <npm_Menu_La.Portal container={container ?? value}>
              <PopupSurface
                {...value51.portalProps}
                surface={surfaceBackgroundTokens.popover}
                density={value4 ? ComfortableValue : undefined}
                companionModalCatcher={!value4}
                closeOnActivityHide={true}
              >
                {value4 && !value5 && (<npm_Menu_La.Backdrop
                    data-presentation={"sheet"}
                    data-sheet-scrim={value11?.treeId}
                    className={
                      value26.depth > 0
                        ? "draggable-none fixed inset-0 bg-transparent"
                        : PlatformReducedMotionCss_4
                    }
                  />)}
                <CollisionPaddingProvider
                  override={value7}
                  container={container ?? value}
                  provideInherit={true}
                >
                  {(input?: Dynamic): Dynamic => (
                    <LayerBaseContext.Provider value={value51.base}>
                      <npm_Menu_La.Positioner
                        ref={value10.positionerRef}
                        data-sheet-tree={value4 ? value11?.treeId : undefined}
                        style={
                          value4
                            ? {
                                ...value51.style,
                                ...getSheetFixedPosition(value11),
                              }
                            : value10.held !== null
                              ? {
                                  ...value51.style,
                                  ...value10.held.positionerStyle,
                                }
                              : value51.style
                        }
                        side={value10.side}
                        align={value10.align}
                        sideOffset={value9}
                        collisionPadding={input}
                        collisionAvoidance={collisionAvoidance}
                        anchor={value8}
                        {...(value4
                          ? SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig
                          : {})}
                        className={
                          value4
                            ? value5
                              ? ClipPathInset00200vh0Value
                              : value26.depth === 0
                                ? PlatformReducedMotionClassNames_3
                                : undefined
                            : value10.held?.positionerClassName
                        }
                      >
                        <PassiveOpenGate
                          cell={value4 ? null : value47.cell}
                          nested={value2 !== null}
                        >
                          {(input2?: Dynamic): Dynamic => (
                            <MenuPopupElement
                              anchoredWithoutFinalFocus={value46}
                              cursorAnchored={value3}
                              data-cds={dataCds}
                              data-presentation={value4 ? "sheet" : undefined}
                              data-sheet-tree={
                                value4 ? value11?.treeId : undefined
                              }
                              data-cds-sheet-depth={
                                value4 ? String(value26.depth) : undefined
                              }
                              {...(value32
                                ? {
                                    [coveredSheetAttribute]: "",
                                  }
                                : {})}
                              {...(value33 ? getInertPropsValue : {})}
                              {...(value5 && value11 !== null && !value11.open
                                ? {
                                    [CdsSheetTreeClosingAttribute]: "",
                                  }
                                : {})}
                              {...(value5 && value37 && !value12.open
                                ? {
                                    [CdsSheetPeelingAttribute]: "",
                                  }
                                : {})}
                              {...(value4
                                ? getSizeAttribute("lg")
                                : {})}
                              ref={value48}
                              {...input2(value4 ? state : props)}
                              style={value50}
                              className={cn(
                                MenuPopupCss,
                                value4 && PlatformReducedMotionCss_2,
                                value4 &&
                                  (value5
                                    ? "bg-transparent shadow-none [&[data-ending-style]:not([data-cds-sheet-tree-closing])]:translate-x-full rtl:[&[data-ending-style]:not([data-cds-sheet-tree-closing])]:-translate-x-full [&[data-ending-style][data-cds-sheet-peeling]]:translate-x-full rtl:[&[data-ending-style][data-cds-sheet-peeling]]:-translate-x-full [&[data-ending-style][data-cds-sheet-tree-closing]]:translate-y-[calc(100%+1.5rem)]"
                                    : "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]"),
                                value4 &&
                                  "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                                className,
                              )}
                            >
                              {value4 ? (<SheetStackContext.Provider
                                  value={value54}
                                >
                                  <SheetHandle drawPill={!value5} />
                                  <div
                                    className={
                                      PlatformReducedMotionCss_3
                                    }
                                  >
                                    <PopupScrollArea
                                      header={header}
                                      headerClassName={
                                        PlatformReducedMotionLabel_2
                                      }
                                      footer={footer}
                                      fill={true}
                                    >
                                      {children}
                                      {!value5 && (<SheetCloseButton />)}
                                    </PopupScrollArea>
                                    <SheetBackButton nested={value5} />
                                  </div>
                                </SheetStackContext.Provider>) : (<PopupScrollArea
                                  header={header}
                                  footer={footer}
                                  maxVisibleItems={maxVisibleItems}
                                >
                                  {children}
                                </PopupScrollArea>)}
                            </MenuPopupElement>
                          )}
                        </PassiveOpenGate>
                      </npm_Menu_La.Positioner>
                    </LayerBaseContext.Provider>
                  )}
                </CollisionPaddingProvider>
              </PopupSurface>
            </npm_Menu_La.Portal>
          );
        },
      );
      MenuSheetPopup.displayName = "MenuSheetPopup";
    });
    initializeSheetsMenuPopup_5 = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializePlatformReducedMotion_2();
      jsxSheetsMenuPopup_2 = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_pge();
    });
    initializeSheetsMenuPopup_6 = initializeOnce((): Dynamic => {
      "use client";

      initializePlatformReducedMotion_2();
      jsxSheetsMenuPopup_3 = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_wY();
    });
  };
}

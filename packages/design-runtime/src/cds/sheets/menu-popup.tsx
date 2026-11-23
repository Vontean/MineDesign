import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { CollisionPaddingProvider, ComponentsIconContext, Icon, IconRenderer, initializeIconSizeMetrics, initializeIconContext } from "../components/icon";
import { sheetFrameHeight } from "../dom/inert";
import { initializeDomRefComposition, useEventRef } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeStableCallbackReact, useOptionalStableCallback } from "../hooks/stable-callback";
import { initializeMenuConfiguration, MenuConfigurationContext, MenuItemContext, MenuRootContext, MenuSheetLabelsContext, PopupScrollArea, warnNestedMenuInitialFocus, warnNestedMenuLayerOffset } from "../menu/configuration";
import { initializeMenuItemStyles, initializeParentMenuContext, initializeMenuPopupElementComponent, menuItemVariants, MenuPopupElement, useMenuPopupFocus, usePopupEntryAnimation } from "../menu/item-styles";
import { initializeMenuPassiveOpenGate } from "../menu/passive-open-gate";
import { initializeMenuPopup, MenuPopupCss, PassiveOpenGate, usePassiveOpenCell } from "../menu/popup";
import { initializeOverlaysAndroidCloseWatcher, useAndroidCloseWatcher } from "../overlays/android-close-watcher";
import { initializeOverlaysLayers, LayerBaseContext, useLayer } from "../overlays/layers";
import { ClipPathInset00200vh0Value, initializePlatformReducedMotion, initializeSheetMotionClassNames, transparentBackdropClassName, sheetOverscrollFillClassName, bottomSheetPanelClassName, sheetDrillContentClassName, sheetBackdropClassName, sheetHeaderClassName } from "../platform/reduced-motion";
import { initializeRootFontSizeHooks, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsChrome, initializeSheetDismissalReact, SheetHandle, SheetHeading, sheetMutationIsScrollOnly, sheetNaturalHeight, useCoveredSheetState, useSheetDismissal, useSheetTextFocus } from "./chrome";
import { ComfortableValue, getSheetFixedPosition, getSheetFrameStyle, initializeSheetsLayout, SheetsLayoutConstant, halfHeightFraction, halfHeightViewportCss, SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig } from "./layout";
import { getInertPropsValue, initializeSheetsPopupStack, prefersReducedMotion, SheetPopupBridgeContext, SheetPopupContext, SheetStackContext, useIsSheet, useSheetState } from "./popup-stack";
import { CdsSheetPeelingAttribute, CdsSheetTreeClosingAttribute, coveredSheetAttribute, drilledSheetAttribute, initializeSheetsPresentation, sheetContainsTextInput, sheetNeedsScrolling, sheetScrollAttribute } from "./presentation";
import { initializeSheetsScrollArea } from "./scroll-area";
import { clearSheetTransition, initializeSheetsStyles, initializeLabelsProviderContext, useLabel } from "./styles";
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
var narrowViewportQuery: Dynamic;
var SheetsMenuPopupMediaQuery: Dynamic;
var electronUserAgentToken: Dynamic;
var initializeSheetMediaQueries: Dynamic;
var reactForUseSheetSiblingsInert: Dynamic;
var SheetsMenuPopupSCRIPTSTYLELINKSet: Dynamic;
var liveRegionSelector: Dynamic;
var SheetsMenuPopupElementCache: Dynamic;
var initializeSheetSiblingsInert: Dynamic;
var reactForMenuSheetPopup: Dynamic;
var jsxSheetsMenuPopup: Dynamic;
var inertSiblingsBySheet: Dynamic;
var MenuSheetPopup: Dynamic;
var initializeMenuSheetPopupComponent: Dynamic;
var jsxForSheetPopupPresentation: Dynamic;
var initializeSheetPopupPresentationJsx: Dynamic;
var jsxForSheetPopupMotion: Dynamic;
var initializeSheetPopupMotionJsx: Dynamic;
function browserWindow(windowOverride?: Dynamic): Dynamic {
  return windowOverride ?? (typeof window === "undefined" ? undefined : window);
}
function windowMatchesMedia(mediaQuery?: Dynamic, windowOverride?: Dynamic): Dynamic {
  let targetWindow: Dynamic = browserWindow(windowOverride);
  return (
    typeof targetWindow?.matchMedia == "function" && targetWindow.matchMedia(mediaQuery).matches
  );
}
function usesCoarsePointer(windowOverride?: Dynamic): Dynamic {
  return windowMatchesMedia(SheetsMenuPopupLabel, windowOverride);
}
function shouldSkipSheetAnimation(windowOverride?: Dynamic): Dynamic {
  let targetWindow: Dynamic = browserWindow(windowOverride);
  return targetWindow?.navigator?.userAgent?.includes(electronUserAgentToken)
    ? true
    : !(
        windowMatchesMedia(SheetsMenuPopupMediaQuery, targetWindow) &&
        (targetWindow?.navigator?.maxTouchPoints ?? 0) > 0
      );
}
function subscribeSheetMedia(onChange?: Dynamic, windowOverride?: Dynamic): Dynamic {
  let targetWindow: Dynamic = browserWindow(windowOverride);
  if (typeof targetWindow?.matchMedia != "function") return (): Dynamic => {};
  let mediaQueryLists: Dynamic = [
    SheetsMenuPopupLabel,
    narrowViewportQuery,
    SheetsMenuPopupMediaQuery,
  ].map((query?: Dynamic): Dynamic => targetWindow.matchMedia(query));
  for (let mediaQueryList of mediaQueryLists as Dynamic)
    mediaQueryList.addEventListener("change", onChange);
  return (): Dynamic => {
    for (let mediaQueryList of mediaQueryLists as Dynamic)
      mediaQueryList.removeEventListener("change", onChange);
  };
}
function makeSheetSiblingsInert(element?: Dynamic): Dynamic {
  let items: Dynamic = [],
    markInert: Dynamic = (target?: Dynamic): Dynamic => {
      let refCount: Dynamic = SheetsMenuPopupElementCache.get(target) ?? 0;
      if (refCount === 0) {
        if (target.hasAttribute("inert")) return;
        target.setAttribute("inert", "");
        target.setAttribute("data-cds-sheet-inert", "");
      }
      SheetsMenuPopupElementCache.set(target, refCount + 1);
      items.push(target);
    },
    markSiblingInert: Dynamic = (sibling?: Dynamic): Dynamic => {
      if (
        !(
          SheetsMenuPopupSCRIPTSTYLELINKSet.has(sibling.tagName) ||
          sibling.matches(liveRegionSelector)
        )
      ) {
        if (sibling.querySelector(liveRegionSelector) === null) {
          markInert(sibling);
          return;
        }
        for (let child of Array.from(sibling.children) as Dynamic)
          markSiblingInert(child);
      }
    },
    currentElement: Dynamic = element,
    body: Dynamic = element.ownerDocument.body;
  for (; currentElement !== null && currentElement !== body && currentElement.parentElement !== null; ) {
    let parentElement: Dynamic = currentElement.parentElement,
      currentChild: Dynamic = currentElement;
    for (let sibling of Array.from(parentElement.children) as Dynamic)
      sibling !== currentChild && markSiblingInert(sibling);
    currentElement = parentElement;
  }
  return (): Dynamic => {
    for (let inertElement of items as Dynamic) {
      let remainingCount: Dynamic =
        (SheetsMenuPopupElementCache.get(inertElement) ?? 1) - 1;
      remainingCount <= 0
        ? (SheetsMenuPopupElementCache.delete(inertElement),
          inertElement.hasAttribute("data-cds-sheet-inert") &&
            (inertElement.removeAttribute("inert"),
            inertElement.removeAttribute("data-cds-sheet-inert")))
        : SheetsMenuPopupElementCache.set(inertElement, remainingCount);
    }
  };
}
function useSheetSiblingsInert({
  node: node,
  open: open,
  liftOnClose: liftOnClose,
}: Dynamic): Dynamic {
  let cdsWindow: Dynamic = useCdsWindow(),
    getLiftDelay: Dynamic = useOptionalStableCallback(liftOnClose),
    restoreInertRef: Dynamic = (0, reactForUseSheetSiblingsInert.useRef)(null),
    deferredRemovalRef: Dynamic = (0, reactForUseSheetSiblingsInert.useRef)(null);
  useIsomorphicLayoutEffect((): Dynamic => {
    if (!open || node === null || cdsWindow === undefined) return;
    let animationFrameId: Dynamic = cdsWindow.requestAnimationFrame((): Dynamic => {
      if (restoreInertRef.current === null) {
        let portalAncestor: Dynamic = sheetPortalAncestor(node);
        portalAncestor !== null && (restoreInertRef.current = makeSheetSiblingsInert(portalAncestor));
      }
    });
    return (): Dynamic => {
      cdsWindow.cancelAnimationFrame(animationFrameId);
      let current: Dynamic = restoreInertRef.current;
      restoreInertRef.current = null;
      if (current === null) return;
      if ((getLiftDelay?.() ?? "now") === "now" || !canAnimateSheetUnmount(cdsWindow)) {
        current();
        return;
      }
      let deferredRemoval: Dynamic = deferSheetInertRemoval(
        cdsWindow,
        current,
        (): Dynamic => {
          deferredRemovalRef.current === deferredRemoval && (deferredRemovalRef.current = null);
        },
      );
      deferredRemovalRef.current = deferredRemoval;
    };
  }, [node, open, cdsWindow, getLiftDelay]);
  return (0, reactForUseSheetSiblingsInert.useCallback)(
    (): Dynamic => deferredRemovalRef.current?.(),
    [],
  );
}
function canAnimateSheetUnmount(targetWindow?: Dynamic): Dynamic {
  return (
    !shouldSkipSheetAnimation(targetWindow) &&
    !prefersReducedMotion() &&
    targetWindow.document.visibilityState !== "hidden"
  );
}
function deferSheetInertRemoval(
  targetWindow?: Dynamic,
  restoreInert?: Dynamic,
  onDone?: Dynamic,
): Dynamic {
  let ownerDocument: Dynamic = targetWindow.document,
    isFinished: Dynamic = false,
    finishRemoval: Dynamic = (): Dynamic => {
      isFinished ||
        ((isFinished = true),
        targetWindow.cancelAnimationFrame(animationFrameId),
        targetWindow.removeEventListener("pointerdown", finishRemoval, true),
        targetWindow.removeEventListener("keydown", finishRemoval, true),
        targetWindow.removeEventListener("pagehide", finishRemoval),
        ownerDocument.removeEventListener("visibilitychange", handleVisibilityChange),
        restoreInert(),
        onDone());
    },
    handleVisibilityChange: Dynamic = (): Dynamic => {
      ownerDocument.visibilityState === "hidden" && finishRemoval();
    },
    animationFrameId: Dynamic = targetWindow.requestAnimationFrame((): Dynamic => {
      animationFrameId = targetWindow.requestAnimationFrame(finishRemoval);
    });
  targetWindow.addEventListener("pointerdown", finishRemoval, true);
  targetWindow.addEventListener("keydown", finishRemoval, true);
  targetWindow.addEventListener("pagehide", finishRemoval);
  ownerDocument.addEventListener("visibilitychange", handleVisibilityChange);
  return finishRemoval;
}
function sheetPortalAncestor(element?: Dynamic): Dynamic {
  let body: Dynamic = element.ownerDocument.body,
    currentElement: Dynamic = element,
    lastElement: Dynamic = null;
  for (; currentElement !== null && currentElement !== body; ) {
    if (
      currentElement.hasAttribute("data-base-ui-portal") ||
      currentElement.hasAttribute("data-cds-portal")
    )
      return currentElement;
    lastElement = currentElement;
    currentElement = currentElement.parentElement;
  }
  return lastElement;
}
function preventSheetTab(event?: Dynamic): Dynamic {
  event.key === "Tab" && (event.preventDefault(), event.stopPropagation());
}
function hideCoveredSheet(sheetElement?: Dynamic, owner?: Dynamic): Dynamic {
  let entry: Dynamic = inertSiblingsBySheet.get(sheetElement);
  entry === undefined &&
    ((entry = new Set()), inertSiblingsBySheet.set(sheetElement, entry));
  entry.add(owner);
  sheetElement.setAttribute("aria-hidden", "true");
  sheetElement.setAttribute(drilledSheetAttribute, "");
}
function restoreCoveredSheet(sheetElement?: Dynamic, owner?: Dynamic): Dynamic {
  let entry: Dynamic = inertSiblingsBySheet.get(sheetElement);
  entry?.delete(owner);
  (entry === undefined || entry.size === 0) &&
    (sheetElement.removeAttribute("aria-hidden"),
    sheetElement.removeAttribute(drilledSheetAttribute));
}
function sheetCloseInertDelay(closeRequest?: Dynamic): Dynamic {
  if (closeRequest?.reason === "outside-press") return "after-paint";
  let closeEvent: Dynamic = closeRequest?.event;
  if (
    closeRequest?.reason !== "item-press" ||
    closeEvent === undefined ||
    !("detail" in closeEvent) ||
    closeEvent.detail === 0
  )
    return "now";
  let target: Dynamic = closeEvent.target;
  return (target !== null && "closest" in target
    ? target.closest('[role^="menuitem"]')
    : null
  )?.hasAttribute("data-cds-focuses-nothing") === true
    ? "after-paint"
    : "now";
}
function SheetBackButton({ nested: nested }: Dynamic): Dynamic {
  useUiLocale();
  let menuRoot: Dynamic = (0, reactForMenuSheetPopup.useContext)(
      MenuRootContext,
    ),
    { label: itemLabel }: Dynamic = (0, reactForMenuSheetPopup.useContext)(
      MenuItemContext,
    ),
    sheetLabels: Dynamic = (0, reactForMenuSheetPopup.useContext)(
      MenuSheetLabelsContext,
    ),
    defaultBackLabel: Dynamic = useLabel("back", "Back"),
    backLabel: Dynamic = sheetLabels.backLabel ?? defaultBackLabel;
  return (
    <SheetHeading
      title={nested ? (itemLabel) : (sheetLabels.sheetTitle)}
      leading={
        nested ? (
          <npm_Menu_La.Item
            closeOnClick={false}
            onClick={(): Dynamic => menuRoot?.close()}
            aria-label={backLabel}
            label={backLabel}
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
  let sheetContext: Dynamic = (0, reactForMenuSheetPopup.useContext)(
      SheetPopupContext,
    ),
    defaultCloseLabel: Dynamic = useLabel("close", "Close"),
    closeLabel: Dynamic =
      (0, reactForMenuSheetPopup.useContext)(MenuSheetLabelsContext)
        .closeLabel ?? defaultCloseLabel;
  return (
    <npm_Menu_La.Item
      closeOnClick={false}
      onClick={(): Dynamic => sheetContext?.dismiss()}
      aria-label={closeLabel}
      label={closeLabel}
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
        <span className={"min-w-0 flex-1 truncate"}>{closeLabel}</span>
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
          ? transparentBackdropClassName
          : sheetBackdropClassName
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
          ? transparentBackdropClassName
          : sheetBackdropClassName
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
  initializeSheetMediaQueries,
  initializeSheetSiblingsInert,
  initializeMenuSheetPopupComponent,
  initializeSheetPopupPresentationJsx,
  initializeSheetPopupMotionJsx,
  jsxSheetsMenuPopup,
  jsxForSheetPopupPresentation,
  jsxForSheetPopupMotion,
  makeSheetSiblingsInert,
  MenuSheetPopup,
  MobileSheetsComboboxSheetBackdrop,
  MobileSheetsPopoverSheetBackdrop,
  MobileSheetsPopoverSheetContent,
  PointerEventsNoneValue,
  preventSheetTab,
  reactSheetsMenuPopup,
  reactForUseSheetSiblingsInert,
  reactForMenuSheetPopup,
  restoreCoveredSheet,
  SheetBackButton,
  SheetCloseButton,
  sheetCloseInertDelay,
  sheetPortalAncestor,
  SheetsMenuPopupElementCache,
  inertSiblingsBySheet,
  SheetsMenuPopupLabel,
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
    initializeSheetMediaQueries = initializeOnce((): Dynamic => {
      SheetsMenuPopupLabel = "(pointer: coarse), (hover: none)";
      narrowViewportQuery = "(width < 40rem)";
      SheetsMenuPopupMediaQuery = "(pointer: coarse)";
      electronUserAgentToken = " Electron/";
    });
    initializeSheetSiblingsInert = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeCdsRoot();
      initializeSheetMediaQueries();
      initializeStableCallbackReact();
      initializePlatformReducedMotion();
      reactForUseSheetSiblingsInert = toModuleNamespace(
        load_react(),
      );
      SheetsMenuPopupSCRIPTSTYLELINKSet = new Set([
        "SCRIPT",
        "STYLE",
        "LINK",
        "TEMPLATE",
        "NOSCRIPT",
      ]);
      liveRegionSelector =
        '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"], [data-cds="Toast"]';
      SheetsMenuPopupElementCache = new WeakMap();
    });
    initializeMenuSheetPopupComponent = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeLabelsProviderContext();
      initializeCdsRoot();
      initializeOverlaysLayers();
      initializeOverlaysAndroidCloseWatcher();
      initializeDomRefComposition();
      initializeRootFontSizeHooks();
      initializeIconSizeMetrics();
      initializeIconContext();
      initializeThemeSurfaces();
      initializeSheetsLayout();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializeSheetMotionClassNames();
      initializeMenuConfiguration();
      initializeSheetsScrollArea();
      initializeMenuPopup();
      initializeMenuPassiveOpenGate();
      initializeMenuItemStyles();
      initializeParentMenuContext();
      initializeMenuPopupElementComponent();
      initializeSheetsMenuPopup();
      initializeSheetsStyles();
      initializeSheetsChrome();
      initializeSheetDismissalReact();
      initializeSheetSiblingsInert();
      reactForMenuSheetPopup = toModuleNamespace(
        load_react(),
      );
      jsxSheetsMenuPopup = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_jj();
      inertSiblingsBySheet = new WeakMap();
      MenuSheetPopup = (0, reactForMenuSheetPopup.forwardRef)(
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
          forwardedRef?: Dynamic,
        ): Dynamic => {
          "use no memo";

          let overlayRoot: Dynamic = useOverlayRoot(),
            menuRoot: Dynamic = (0, reactForMenuSheetPopup.useContext)(
              MenuRootContext,
            ),
            isContextMenu: Dynamic =
              (0, reactForMenuSheetPopup.useContext)(
                MenuConfigurationContext,
              ) && menuRoot === null,
            isSheet: Dynamic = useIsSheet(),
            isNestedSheet: Dynamic = isSheet && menuRoot !== null,
            iconContext: Dynamic = (0, reactForMenuSheetPopup.useContext)(
              ComponentsIconContext,
            ),
            effectiveCollisionPadding: Dynamic = collisionPadding ?? iconContext?.collisionPadding,
            effectiveAnchor: Dynamic = (0, reactForMenuSheetPopup.useMemo)(
              (): Dynamic =>
                anchor !== undefined || !menuRoot
                  ? anchor
                  : virtualTriggerAnchor(menuRoot),
              [anchor, menuRoot],
            ),
            effectiveSideOffset: Dynamic =
              sideOffset ??
              (isContextMenu ? undefined : menuRoot && anchor === undefined ? 2 : 6),
            entryAnimation: Dynamic = usePopupEntryAnimation({
              enabled: stableWhileOpen && !isSheet && !isContextMenu,
              side: side,
              align: align,
            }),
            sheetFrame: Dynamic = (0, reactForMenuSheetPopup.useContext)(
              SheetPopupContext,
            ),
            menuItem: Dynamic = (0, reactForMenuSheetPopup.useContext)(
              MenuItemContext,
            ),
            sheetElementRef: Dynamic = (0, reactForMenuSheetPopup.useRef)(null),
            coveredSheetRef: Dynamic = (0, reactForMenuSheetPopup.useRef)(null),
            restoreCoveredParent: Dynamic = (0,
            reactForMenuSheetPopup.useCallback)((): Dynamic => {
              let coveredSheet: Dynamic = coveredSheetRef.current;
              coveredSheet !== null &&
                (restoreCoveredSheet(coveredSheet, coveredSheetRef),
                (coveredSheetRef.current = null));
            }, []),
            hideParentSheet: Dynamic = (0, reactForMenuSheetPopup.useCallback)(
              (element?: Dynamic): Dynamic => {
                if (menuRoot === null) return;
                let parentSheet: Dynamic =
                  sheetFrame !== null
                    ? (menuRoot.triggerRef.current?.closest(
                        `[data-sheet-tree="${CSS.escape(sheetFrame.treeId)}"][data-presentation="sheet"]`,
                      ) ?? null)
                    : null;
                parentSheet !== null &&
                  coveredSheetRef.current !== parentSheet &&
                  (restoreCoveredParent(),
                  hideCoveredSheet(parentSheet, coveredSheetRef),
                  (coveredSheetRef.current = parentSheet));
                element.contains(element.ownerDocument.activeElement) ||
                  element.focus({
                    preventScroll: true,
                  });
              },
              [menuRoot, restoreCoveredParent, sheetFrame],
            ),
            [hasTextInput, setHasTextInput]: Dynamic = (0, reactForMenuSheetPopup.useState)(
              false,
            ),
            hasTextInputRef: Dynamic = (0, reactForMenuSheetPopup.useRef)(false),
            updateHasTextInput: Dynamic = (0, reactForMenuSheetPopup.useCallback)(
              (hasInput?: Dynamic): Dynamic => {
                hasTextInputRef.current = hasInput;
                setHasTextInput(hasInput);
              },
              [],
            ),
            [inertSheetNode, setInertSheetNode]: Dynamic = (0, reactForMenuSheetPopup.useState)(
              null,
            ),
            takeCloseRequest: Dynamic = sheetFrame?.takeCloseRequest,
            getCloseInertDelay: Dynamic = (0, reactForMenuSheetPopup.useCallback)(
              (): Dynamic => sheetCloseInertDelay(takeCloseRequest?.() ?? null),
              [takeCloseRequest],
            ),
            restoreSiblingsInert: Dynamic = useSheetSiblingsInert({
              node: inertSheetNode,
              open: isSheet && !isNestedSheet && (sheetFrame?.open ?? false),
              liftOnClose: getCloseInertDelay,
            }),
            sheetState: Dynamic = useSheetState(),
            parentStack: Dynamic = (0, reactForMenuSheetPopup.useContext)(
              SheetStackContext,
            ),
            bridgeCover: Dynamic = (0, reactForMenuSheetPopup.useContext)(
              SheetPopupBridgeContext,
            ),
            [sheetElement, setSheetElement]: Dynamic = (0, reactForMenuSheetPopup.useState)(
              null,
            ),
            setPopupElement: Dynamic = (0, reactForMenuSheetPopup.useCallback)(
              (element?: Dynamic): Dynamic => {
                sheetElementRef.current = isSheet ? element : null;
                setSheetElement(isSheet ? element : null);
                setInertSheetNode(isSheet && !isNestedSheet ? element : null);
                if (element === null) {
                  restoreSiblingsInert();
                  restoreCoveredParent();
                  updateHasTextInput(false);
                  return;
                }
                if (!isSheet) {
                  updateHasTextInput(false);
                  return;
                }
                if (!isNestedSheet) {
                  let containsTextInput: Dynamic = sheetContainsTextInput(
                    element,
                  );
                  containsTextInput &&
                    ((element.style.minHeight = halfHeightViewportCss),
                    (element.style.maxHeight = halfHeightViewportCss));
                  updateHasTextInput(containsTextInput);
                  sheetFrame?.pinHeight(
                    element.getBoundingClientRect().height,
                    sheetNeedsScrolling(element),
                  );
                  return;
                }
                hideParentSheet(element);
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
              [isSheet, isNestedSheet, sheetFrame, restoreCoveredParent, hideParentSheet, updateHasTextInput, restoreSiblingsInert],
            );
          useSheetTextFocus(sheetElement, sheetFrame);
          useCoveredSheetState(sheetElement);
          useSheetDismissal(sheetElement, sheetFrame, sheetState.covered);
          let isCovered: Dynamic = isSheet && sheetState.covered,
            isInert: Dynamic = isSheet && sheetState.inert;
          useAndroidCloseWatcher(
            isSheet && (isNestedSheet ? menuItem.open : (sheetFrame?.open ?? false)),
            isNestedSheet ? menuRoot?.close : sheetFrame?.dismiss,
          );
          let wasNestedOpenRef: Dynamic = (0, reactForMenuSheetPopup.useRef)(false),
            isSheetOpen: Dynamic = sheetFrame?.open ?? false;
          useIsomorphicLayoutEffect((): Dynamic => {
            let current: Dynamic = sheetElementRef.current,
              isNestedOpen: Dynamic = isNestedSheet && menuItem.open && current !== null,
              wasNestedOpen: Dynamic = wasNestedOpenRef.current;
            wasNestedOpenRef.current = isNestedOpen;
            isNestedOpen && !wasNestedOpen
              ? hideParentSheet(current)
              : !isNestedOpen && isSheetOpen && restoreCoveredParent();
          }, [isNestedSheet, menuItem.open, isSheetOpen, hideParentSheet, restoreCoveredParent]);
          let prevNestedOpenRef: Dynamic = (0, reactForMenuSheetPopup.useRef)(false),
            [isPeeling, setIsPeeling]: Dynamic = (0, reactForMenuSheetPopup.useState)(
              false,
            );
          useIsomorphicLayoutEffect((): Dynamic => {
            let isNestedOpen: Dynamic = isNestedSheet && menuItem.open,
              current: Dynamic = prevNestedOpenRef.current;
            prevNestedOpenRef.current = isNestedOpen;
            isNestedOpen !== current && setIsPeeling(!isNestedOpen && isSheetOpen);
          }, [isNestedSheet, menuItem.open, isSheetOpen]);
          useIsomorphicLayoutEffect((): Dynamic => {
            let current: Dynamic = sheetElementRef.current;
            isNestedSheet &&
              menuItem.open &&
              current !== null &&
              clearSheetTransition(current);
          }, [isNestedSheet, menuItem.open]);
          let pushLevelHeight: Dynamic = sheetFrame?.pushLevelHeight,
            drag: Dynamic = sheetFrame?.drag;
          (0, reactForMenuSheetPopup.useEffect)((): Dynamic => {
            if (
              !isNestedSheet ||
              !menuItem.open ||
              sheetElement === null ||
              pushLevelHeight === undefined
            )
              return;
            let defaultView: Dynamic = sheetElement.ownerDocument.defaultView,
              levelHeightHandle: Dynamic,
              isGrowing: Dynamic = false,
              measureLevel: Dynamic = (): Dynamic => {
                let viewportHeight: Dynamic = defaultView?.innerHeight ?? 1 / 0,
                  maxHeight: Dynamic = viewportHeight * SheetsLayoutConstant,
                  containsTextInput: Dynamic = sheetContainsTextInput(
                    sheetElement,
                  ),
                  naturalHeight: Dynamic = sheetNaturalHeight(sheetElement);
                isGrowing = naturalHeight > maxHeight;
                let levelHeight: Dynamic = containsTextInput
                    ? viewportHeight * halfHeightFraction
                    : Math.min(naturalHeight, maxHeight),
                  grows: Dynamic = containsTextInput || isGrowing;
                levelHeightHandle === undefined
                  ? (levelHeightHandle = pushLevelHeight(levelHeight, grows))
                  : levelHeightHandle.set(levelHeight, grows);
              },
              measureWhenIdle: Dynamic = (): Dynamic => {
                animationFrameId = undefined;
                if (drag !== undefined && drag.get() !== null) {
                  animationFrameId = defaultView?.requestAnimationFrame(measureWhenIdle);
                  return;
                }
                measureLevel();
              },
              animationFrameId: Dynamic = defaultView?.requestAnimationFrame(measureWhenIdle),
              mutationObserver: Dynamic =
                defaultView !== null &&
                typeof defaultView.MutationObserver !== "undefined"
                  ? new defaultView.MutationObserver(
                      (mutations?: Dynamic): Dynamic => {
                        if (
                          animationFrameId !== undefined ||
                          levelHeightHandle === undefined ||
                          sheetMutationIsScrollOnly(mutations, isGrowing)
                        )
                          return;
                        let retryMeasure: Dynamic = (): Dynamic => {
                          animationFrameId = undefined;
                          if (drag !== undefined && drag.get() !== null) {
                            animationFrameId =
                              defaultView.requestAnimationFrame(retryMeasure);
                            return;
                          }
                          measureLevel();
                        };
                        animationFrameId = defaultView.requestAnimationFrame(retryMeasure);
                      },
                    )
                  : null;
            mutationObserver?.observe(sheetElement, {
              childList: true,
              subtree: true,
            });
            return (): Dynamic => {
              mutationObserver?.disconnect();
              animationFrameId !== undefined &&
                defaultView?.cancelAnimationFrame(animationFrameId);
              levelHeightHandle?.release();
            };
          }, [isNestedSheet, menuItem.open, sheetElement, pushLevelHeight, drag]);
          let repinHeight: Dynamic = sheetFrame?.repinHeight,
            isFrameOpen: Dynamic = sheetFrame?.open ?? false;
          (0, reactForMenuSheetPopup.useEffect)((): Dynamic => {
            if (
              !isSheet ||
              isNestedSheet ||
              !isFrameOpen ||
              sheetElement === null ||
              repinHeight === undefined
            )
              return;
            let defaultView: Dynamic = sheetElement.ownerDocument.defaultView;
            if (
              defaultView === null ||
              typeof defaultView.MutationObserver === "undefined"
            )
              return;
            let animationFrameId: Dynamic = 0,
              isGrowing: Dynamic = false,
              mutationObserver: Dynamic = new defaultView.MutationObserver(
                (mutations?: Dynamic): Dynamic => {
                  if (
                    animationFrameId !== 0 ||
                    sheetMutationIsScrollOnly(mutations, isGrowing)
                  )
                    return;
                  let repinMeasure: Dynamic = (): Dynamic => {
                    animationFrameId = 0;
                    if (drag !== undefined && drag.get() !== null) {
                      animationFrameId = defaultView.requestAnimationFrame(repinMeasure);
                      return;
                    }
                    if (sheetContainsTextInput(sheetElement)) {
                      hasTextInputRef.current ||
                        (updateHasTextInput(true),
                        repinHeight(
                          defaultView.innerHeight *
                            halfHeightFraction,
                          true,
                        ));
                      return;
                    }
                    let maxHeight: Dynamic =
                        defaultView.innerHeight * SheetsLayoutConstant,
                      naturalHeight: Dynamic = sheetNaturalHeight(
                        sheetElement,
                      );
                    isGrowing = naturalHeight > maxHeight;
                    repinHeight(Math.min(naturalHeight, maxHeight), isGrowing);
                  };
                  animationFrameId = defaultView.requestAnimationFrame(repinMeasure);
                },
              );
            mutationObserver.observe(sheetElement, {
              childList: true,
              subtree: true,
            });
            return (): Dynamic => {
              mutationObserver.disconnect();
              animationFrameId !== 0 && defaultView.cancelAnimationFrame(animationFrameId);
            };
          }, [isSheet, isNestedSheet, isFrameOpen, sheetElement, repinHeight, drag, updateHasTextInput]);
          let frameHeight: Dynamic = sheetFrame?.height,
            pinHeight: Dynamic = sheetFrame?.pinHeight;
          useIsomorphicLayoutEffect((): Dynamic => {
            let current: Dynamic = sheetElementRef.current;
            !isSheet ||
              isNestedSheet ||
              frameHeight !== undefined ||
              current === null ||
              (clearSheetTransition(current),
              pinHeight?.(
                current.getBoundingClientRect().height,
                sheetNeedsScrolling(current),
              ));
          }, [isSheet, isNestedSheet, frameHeight, pinHeight]);
          let popupFocusRef: Dynamic = useMenuPopupFocus(
              menuRoot?.triggerRef,
              props.finalFocus,
            ),
            isAnchoredWithoutFinalFocus: Dynamic = isContextMenu
              ? props.finalFocus === undefined || props.finalFocus === null
              : anchor != null &&
                menuRoot === null &&
                props.finalFocus === undefined,
            passiveOpenCells: Dynamic = usePassiveOpenCell(menuRoot === null);
          passiveOpenCells.root?.declareFocusProps(initialFocus, props.finalFocus);
          menuRoot !== null &&
            initialFocus !== undefined &&
            warnNestedMenuInitialFocus();
          let state: Dynamic = {
              ...props,
              onKeyDown: (event?: Dynamic): Dynamic => {
                props.onKeyDown?.(event);
                preventSheetTab(event);
              },
            },
            popupRef: Dynamic = useEventRef(
              (popupElement?: Dynamic): Dynamic => {
                entryAnimation.popupRef(popupElement);
                setPopupElement(popupElement);
                popupFocusRef(popupElement);
                passiveOpenCells.root?.registerPopup(popupElement);
              },
              forwardedRef,
            ),
            sheetStyle: Dynamic = isSheet
              ? getSheetFrameStyle(sheetFrame, {
                  floor: hasTextInput ? "half" : "content",
                  parentFrameHeight: isNestedSheet ? undefined : parentStack?.frameHeight,
                })
              : entryAnimation.held !== null
                ? {
                    pointerEvents: "auto",
                  }
                : undefined,
            mergedStyle: Dynamic =
              sheetStyle === undefined
                ? style
                : typeof style == "function"
                  ? (popupState?: Dynamic): Dynamic => ({
                      ...style(popupState),
                      ...sheetStyle,
                    })
                  : {
                      ...style,
                      ...sheetStyle,
                    };
          menuRoot !== null &&
            layerOffset !== undefined &&
            warnNestedMenuLayerOffset();
          let layer: Dynamic = useLayer(
              isContextMenu ? "contextmenu" : "menu",
              menuRoot === null ? layerOffset : undefined,
            ),
            cdsWindow: Dynamic = useCdsWindow(),
            frameHeightPx: Dynamic = sheetFrameHeight(sheetFrame, cdsWindow),
            stack: Dynamic = (0, reactForMenuSheetPopup.useMemo)(
              (): Dynamic =>
                isSheet && bridgeCover !== null
                  ? {
                      depth: sheetState.depth,
                      frameHeight: frameHeightPx,
                      cover: bridgeCover,
                    }
                  : null,
              [isSheet, bridgeCover, sheetState.depth, frameHeightPx],
            );
          return (
            <npm_Menu_La.Portal container={container ?? overlayRoot}>
              <PopupSurface
                {...layer.portalProps}
                surface={surfaceBackgroundTokens.popover}
                density={isSheet ? ComfortableValue : undefined}
                companionModalCatcher={!isSheet}
                closeOnActivityHide={true}
              >
                {isSheet && !isNestedSheet && (<npm_Menu_La.Backdrop
                    data-presentation={"sheet"}
                    data-sheet-scrim={sheetFrame?.treeId}
                    className={
                      sheetState.depth > 0
                        ? "draggable-none fixed inset-0 bg-transparent"
                        : sheetBackdropClassName
                    }
                  />)}
                <CollisionPaddingProvider
                  override={effectiveCollisionPadding}
                  container={container ?? overlayRoot}
                  provideInherit={true}
                >
                  {(resolvedCollisionPadding?: Dynamic): Dynamic => (
                    <LayerBaseContext.Provider value={layer.base}>
                      <npm_Menu_La.Positioner
                        ref={entryAnimation.positionerRef}
                        data-sheet-tree={isSheet ? sheetFrame?.treeId : undefined}
                        style={
                          isSheet
                            ? {
                                ...layer.style,
                                ...getSheetFixedPosition(sheetFrame),
                              }
                            : entryAnimation.held !== null
                              ? {
                                  ...layer.style,
                                  ...entryAnimation.held.positionerStyle,
                                }
                              : layer.style
                        }
                        side={entryAnimation.side}
                        align={entryAnimation.align}
                        sideOffset={effectiveSideOffset}
                        collisionPadding={resolvedCollisionPadding}
                        collisionAvoidance={collisionAvoidance}
                        anchor={effectiveAnchor}
                        {...(isSheet
                          ? SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig
                          : {})}
                        className={
                          isSheet
                            ? isNestedSheet
                              ? ClipPathInset00200vh0Value
                              : sheetState.depth === 0
                                ? sheetOverscrollFillClassName
                                : undefined
                            : entryAnimation.held?.positionerClassName
                        }
                      >
                        <PassiveOpenGate
                          cell={isSheet ? null : passiveOpenCells.cell}
                          nested={menuRoot !== null}
                        >
                          {(applyPassiveProps?: Dynamic): Dynamic => (
                            <MenuPopupElement
                              anchoredWithoutFinalFocus={isAnchoredWithoutFinalFocus}
                              cursorAnchored={isContextMenu}
                              data-cds={dataCds}
                              data-presentation={isSheet ? "sheet" : undefined}
                              data-sheet-tree={
                                isSheet ? sheetFrame?.treeId : undefined
                              }
                              data-cds-sheet-depth={
                                isSheet ? String(sheetState.depth) : undefined
                              }
                              {...(isCovered
                                ? {
                                    [coveredSheetAttribute]: "",
                                  }
                                : {})}
                              {...(isInert ? getInertPropsValue : {})}
                              {...(isNestedSheet && sheetFrame !== null && !sheetFrame.open
                                ? {
                                    [CdsSheetTreeClosingAttribute]: "",
                                  }
                                : {})}
                              {...(isNestedSheet && isPeeling && !menuItem.open
                                ? {
                                    [CdsSheetPeelingAttribute]: "",
                                  }
                                : {})}
                              {...(isSheet
                                ? getSizeAttribute("lg")
                                : {})}
                              ref={popupRef}
                              {...applyPassiveProps(isSheet ? state : props)}
                              style={mergedStyle}
                              className={cn(
                                MenuPopupCss,
                                isSheet && bottomSheetPanelClassName,
                                isSheet &&
                                  (isNestedSheet
                                    ? "bg-transparent shadow-none [&[data-ending-style]:not([data-cds-sheet-tree-closing])]:translate-x-full rtl:[&[data-ending-style]:not([data-cds-sheet-tree-closing])]:-translate-x-full [&[data-ending-style][data-cds-sheet-peeling]]:translate-x-full rtl:[&[data-ending-style][data-cds-sheet-peeling]]:-translate-x-full [&[data-ending-style][data-cds-sheet-tree-closing]]:translate-y-[calc(100%+1.5rem)]"
                                    : "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]"),
                                isSheet &&
                                  "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                                className,
                              )}
                            >
                              {isSheet ? (<SheetStackContext.Provider
                                  value={stack}
                                >
                                  <SheetHandle drawPill={!isNestedSheet} />
                                  <div
                                    className={
                                      sheetDrillContentClassName
                                    }
                                  >
                                    <PopupScrollArea
                                      header={header}
                                      headerClassName={
                                        sheetHeaderClassName
                                      }
                                      footer={footer}
                                      fill={true}
                                    >
                                      {children}
                                      {!isNestedSheet && (<SheetCloseButton />)}
                                    </PopupScrollArea>
                                    <SheetBackButton nested={isNestedSheet} />
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
    initializeSheetPopupPresentationJsx = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializeSheetMotionClassNames();
      jsxForSheetPopupPresentation = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_pge();
    });
    initializeSheetPopupMotionJsx = initializeOnce((): Dynamic => {
      "use client";

      initializeSheetMotionClassNames();
      jsxForSheetPopupMotion = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_wY();
    });
  };
}

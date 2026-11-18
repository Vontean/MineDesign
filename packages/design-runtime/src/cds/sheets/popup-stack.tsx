import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { createSheetMutableCell, getInertProps, initializeDomInert, sheetFrameHeight, sheetStackMaxHeight } from "../dom/inert";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeHooksStableCallback_2, useOptionalStableCallback } from "../hooks/stable-callback";
import { initializeOverlaysAndroidCloseWatcher, useAndroidCloseWatcher } from "../overlays/android-close-watcher";
import { initializeOverlaysImperativeHandle, useOverlayImperativeHandle } from "../overlays/imperative-handle";
import { reducedMotionAttribute, reducedMotionMediaQuery } from "../platform/reduced-motion";
import { initializeSheetsKeyboardViewport, useKeyboardViewport } from "./keyboard-viewport";
import { initializeSheetsLayout } from "./layout";
import { areMobileSheetsLoaded, initializeMobileSheetLoader, preloadMobileSheets, useMobileSheetComponents, useMobileSheetsLoaded, useMobileSheetsUnavailable } from "./lazy-loader";
import { initializeSheetsPresentation, shouldUseSheet, useFrozenSheetMode, useMobileSheets, useOverlayPresentation, useSheetPendingUnmount, useTouchOverlay } from "./presentation";
import { initializeCdsRoot, useCdsWindow } from "../theme/root";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactSheetsPopupStack: Dynamic;
var jsxSheetsPopupStack: Dynamic;
var SheetPopupContext: Dynamic;
var SheetsPopupStackAt: Dynamic;
var SheetStackContext: Dynamic;
var SheetStateContext: Dynamic;
var getInertPropsValue: Dynamic;
var SheetsPopupStackDelayMs: Dynamic;
var sheetActivityListenersInstalled: Dynamic;
var SheetsPopupStackSubscribers: Dynamic;
var SheetsPopupStackOutsidePressFocusOutEscapeKeySet: Dynamic;
var SheetsPopupStackLimit: Dynamic;
var SheetsPopupStackLabel: Dynamic;
var SheetsPopupStackSheetPendingCoveredConfig: Dynamic;
var SheetsPopupStackHandler: Dynamic;
var SheetsPopupStackSheetConcealedChromeConfig: Dynamic;
var SheetsPopupStackConcealedConfig: Dynamic;
var SheetPopupBridgeContext: Dynamic;
var initializeSheetsPopupStack: Dynamic;
function useSheetStack(
  isOpen?: Dynamic,
  actionsHandle?: Dynamic,
  onOpenChangeComplete?: Dynamic,
  close?: Dynamic,
): Dynamic {
  let actionsRef: Dynamic = (0, reactSheetsPopupStack.useRef)(null);
  useOverlayImperativeHandle(actionsRef, actionsHandle);
  let treeId: Dynamic = (0, reactSheetsPopupStack.useId)(),
    [height, setHeight]: Dynamic = (0, reactSheetsPopupStack.useState)(),
    [canGrow, setCanGrow]: Dynamic = (0, reactSheetsPopupStack.useState)(true),
    heightStackRef: Dynamic = (0, reactSheetsPopupStack.useRef)([]),
    [detent, setDetent]: Dynamic = (0, reactSheetsPopupStack.useState)(
      "default",
    ),
    textEntryHoldersRef: Dynamic = (0, reactSheetsPopupStack.useRef)(new Set()),
    [hasTextEntryFocus, setHasTextEntryFocus]: Dynamic = (0, reactSheetsPopupStack.useState)(false),
    [keyboard, setKeyboard]: Dynamic = (0, reactSheetsPopupStack.useState)(null),
    [previousOpen, setPreviousOpen]: Dynamic = (0, reactSheetsPopupStack.useState)(isOpen);
  isOpen !== previousOpen &&
    (setPreviousOpen(isOpen),
    isOpen &&
      (setHeight(undefined), setCanGrow(true), setDetent("default"), setHasTextEntryFocus(false)));
  useIsomorphicLayoutEffect((): Dynamic => {
    isOpen || ((heightStackRef.current = []), (textEntryHoldersRef.current = new Set()));
  }, [isOpen]);
  useKeyboardViewport(isOpen && hasTextEntryFocus, setKeyboard, {
    unpan: true,
  });
  let { showing: showing, onOpenChangeComplete: completePendingUnmount }: Dynamic = useSheetPendingUnmount(isOpen),
    onOpenChangeCompleteStable: Dynamic = useOptionalStableCallback(onOpenChangeComplete),
    lastCompletedOpenRef: Dynamic = (0, reactSheetsPopupStack.useRef)(null);
  (0, reactSheetsPopupStack.useEffect)((): Dynamic => {
    lastCompletedOpenRef.current = null;
  }, [isOpen]);
  let handleOpenChangeComplete: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (nextOpen?: Dynamic): Dynamic => {
        completePendingUnmount(nextOpen);
        lastCompletedOpenRef.current !== nextOpen &&
          ((lastCompletedOpenRef.current = nextOpen), onOpenChangeCompleteStable?.(nextOpen));
      },
      [completePendingUnmount, onOpenChangeCompleteStable],
    ),
    pinHeight: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (measuredHeight?: Dynamic, grows: Dynamic = true): Dynamic => {
        heightStackRef.current.length > 0 ||
          !(measuredHeight > 0) ||
          ((heightStackRef.current = [
            {
              height: Math.round(measuredHeight),
              grows: grows,
            },
          ]),
          setHeight(Math.round(measuredHeight)),
          setCanGrow(grows));
      },
      [],
    ),
    repinHeight: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (measuredHeight?: Dynamic, grows?: Dynamic): Dynamic => {
        let current: Dynamic = heightStackRef.current,
          firstEntry: Dynamic = current[0];
        firstEntry === undefined ||
          !(measuredHeight > 0) ||
          ((firstEntry.height = Math.round(measuredHeight)),
          grows !== undefined && (firstEntry.grows = grows),
          setHeight(sheetStackMaxHeight(current)),
          setCanGrow(SheetsPopupStackAt(current)));
      },
      [],
    ),
    pushLevelHeight: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (measuredHeight?: Dynamic, grows: Dynamic = true): Dynamic => {
        let state: Dynamic = {
            height: Math.round(measuredHeight),
            grows: grows,
          },
          current: Dynamic = heightStackRef.current;
        current.push(state);
        setHeight(sheetStackMaxHeight(current));
        setCanGrow(SheetsPopupStackAt(current));
        let flag: Dynamic = false,
          callback: Dynamic = (): Dynamic =>
            !flag && current === heightStackRef.current;
        return {
          set: (nextHeight?: Dynamic, nextGrows?: Dynamic): Dynamic => {
            callback() &&
              ((state.height = Math.round(nextHeight)),
              nextGrows !== undefined && (state.grows = nextGrows),
              setHeight(sheetStackMaxHeight(current)),
              setCanGrow(SheetsPopupStackAt(current)));
          },
          release: (): Dynamic => {
            if (flag) return;
            let entryIndex: Dynamic = current.indexOf(state);
            flag = true;
            entryIndex >= 0 && current.splice(entryIndex, 1);
            current === heightStackRef.current &&
              (setHeight(sheetStackMaxHeight(current)),
              setCanGrow(SheetsPopupStackAt(current)));
          },
        };
      },
      [],
    ),
    holdTextEntryFocus: Dynamic = (0, reactSheetsPopupStack.useCallback)((): Dynamic => {
      let state: Dynamic = {},
        current: Dynamic = textEntryHoldersRef.current;
      current.add(state);
      setHasTextEntryFocus(true);
      return (): Dynamic => {
        current.delete(state);
        current === textEntryHoldersRef.current && setHasTextEntryFocus(current.size > 0);
      };
    }, []),
    closeStable: Dynamic = useOptionalStableCallback(close),
    dismiss: Dynamic = (0, reactSheetsPopupStack.useCallback)((): Dynamic => {
      closeStable !== undefined ? closeStable() : actionsRef.current?.close?.();
    }, [closeStable]),
    [dragCell]: Dynamic = (0, reactSheetsPopupStack.useState)(
      createSheetMutableCell,
    );
  return {
    showing: showing,
    frame: (0, reactSheetsPopupStack.useMemo)(
      (): Dynamic => ({
        treeId: treeId,
        open: isOpen,
        showing: showing,
        height: height,
        pinHeight: pinHeight,
        repinHeight: repinHeight,
        pushLevelHeight: pushLevelHeight,
        canGrow: canGrow,
        detent: detent,
        setDetent: setDetent,
        holdTextEntryFocus: holdTextEntryFocus,
        keyboard: keyboard,
        dismiss: dismiss,
        drag: dragCell,
      }),
      [
        treeId,
        isOpen,
        showing,
        height,
        canGrow,
        pinHeight,
        repinHeight,
        pushLevelHeight,
        detent,
        holdTextEntryFocus,
        keyboard,
        dismiss,
        dragCell,
      ],
    ),
    actionsRef: actionsRef,
    onOpenChangeComplete: handleOpenChangeComplete,
  };
}
function useIsSheet(): Dynamic {
  return (0, reactSheetsPopupStack.useContext)(SheetStateContext).sheet;
}
function useSheetState(): Dynamic {
  return (0, reactSheetsPopupStack.useContext)(SheetStateContext);
}
function isSheetAnnouncementTarget(event?: Dynamic): Dynamic {
  let value: Dynamic = event?.target;
  return (
    value instanceof Element && value.closest(SheetsPopupStackLabel) !== null
  );
}
function useSheetPopup(popupOptions?: Dynamic): Dynamic {
  let {
      open: value,
      actionsRef: actionsRef,
      close: close,
      onOpenChange: onOpenChange,
      onOpenChangeComplete: onOpenChangeComplete,
      structurallyAnchored: structurallyAnchored = false,
      closable: closable = true,
      refuseClose: refuseClose,
    }: Dynamic = popupOptions,
    parentStack: Dynamic = (0, reactSheetsPopupStack.useContext)(
      SheetStackContext,
    ),
    overlayPresentation: Dynamic = useOverlayPresentation(),
    mobileSheetsEnabled: Dynamic = useMobileSheets(),
    sheetStack: Dynamic = useSheetStack(value, actionsRef, onOpenChangeComplete, close),
    mobileSheetsLoaded: Dynamic = useMobileSheetsLoaded(),
    mobileSheetsUnavailable: Dynamic = useMobileSheetsUnavailable(),
    isTouchOverlay: Dynamic = useTouchOverlay();
  (0, reactSheetsPopupStack.useEffect)((): Dynamic => {
    isTouchOverlay && !mobileSheetsLoaded && !mobileSheetsUnavailable && preloadMobileSheets();
  }, [isTouchOverlay, mobileSheetsLoaded, mobileSheetsUnavailable, value]);
  let usesSheetMode: Dynamic = useFrozenSheetMode(
      shouldUseSheet(overlayPresentation, false, mobileSheetsEnabled) &&
        (closable || overlayPresentation === "sheet"),
      value,
      sheetStack.showing,
    ),
    [loadRequested, setLoadRequested]: Dynamic = (0, reactSheetsPopupStack.useState)(
      (): Dynamic => (sheetActivityListenersInstalled || mobileSheetsUnavailable) && !mobileSheetsLoaded,
    ),
    [previousOpen, setPreviousOpen]: Dynamic = (0, reactSheetsPopupStack.useState)(value);
  if (value !== previousOpen) {
    setPreviousOpen(value);
    let loadRequestedNow: Dynamic =
      (sheetActivityListenersInstalled || mobileSheetsUnavailable) && !mobileSheetsLoaded;
    value && loadRequested !== loadRequestedNow && setLoadRequested(loadRequestedNow);
  }
  value && mobileSheetsUnavailable && !mobileSheetsLoaded && !loadRequested && setLoadRequested(true);
  let shouldDeferLoad: Dynamic = usesSheetMode && !structurallyAnchored && !mobileSheetsLoaded && !loadRequested;
  (0, reactSheetsPopupStack.useEffect)((): Dynamic => {
    if (!shouldDeferLoad || !value) return;
    let callback: Dynamic = (): Dynamic => {
      areMobileSheetsLoaded() ||
        ((sheetActivityListenersInstalled = true), setLoadRequested(true));
    };
    SheetsPopupStackSubscribers.add(callback);
    let loadTimerId: Dynamic = setTimeout(callback, SheetsPopupStackDelayMs);
    return (): Dynamic => {
      SheetsPopupStackSubscribers.delete(callback);
      clearTimeout(loadTimerId);
    };
  }, [shouldDeferLoad, value]);
  let isSheet: Dynamic = usesSheetMode && !structurallyAnchored && !loadRequested;
  useAndroidCloseWatcher(
    value && usesSheetMode && !structurallyAnchored && loadRequested,
    sheetStack.frame.dismiss,
  );
  let isPending: Dynamic = isSheet && sheetStack.showing && (!mobileSheetsLoaded || !value),
    depth: Dynamic = isSheet && parentStack !== null ? parentStack.depth + 1 : 0,
    coverHoldersRef: Dynamic = (0, reactSheetsPopupStack.useRef)(new Set()),
    lastCoverReleaseRef: Dynamic = (0, reactSheetsPopupStack.useRef)(0),
    [isCovered, setIsCovered]: Dynamic = (0, reactSheetsPopupStack.useState)(false),
    registerCover: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (coverKey?: Dynamic): Dynamic => (
        coverHoldersRef.current.add(coverKey),
        setIsCovered(true),
        (): Dynamic => {
          coverHoldersRef.current.delete(coverKey);
          lastCoverReleaseRef.current = Date.now();
          setIsCovered(coverHoldersRef.current.size > 0);
        }
      ),
      [],
    ),
    [coverToken]: Dynamic = (0, reactSheetsPopupStack.useState)(
      (): Dynamic => ({}),
    );
  useIsomorphicLayoutEffect((): Dynamic => {
    if (!(!isSheet || !value || parentStack === null))
      return parentStack.cover(coverToken);
  }, [isSheet, value, parentStack, coverToken]);
  let cdsWindow: Dynamic = useCdsWindow(),
    treeId: Dynamic = sheetStack.frame.treeId,
    [coverSettled, setCoverSettled]: Dynamic = (0, reactSheetsPopupStack.useState)(false);
  useIsomorphicLayoutEffect((): Dynamic => {
    if (!isCovered || cdsWindow === undefined) return;
    let index: Dynamic = 0,
      callback: Dynamic = (): Dynamic => {
        let activeElement: Dynamic = cdsWindow.document.activeElement;
        if (
          activeElement !== null &&
          activeElement.closest(
            `[data-sheet-tree="${CSS.escape(treeId)}"]`,
          ) !== null
        ) {
          index = cdsWindow.requestAnimationFrame(callback);
          return;
        }
        setCoverSettled(true);
      };
    index = cdsWindow.requestAnimationFrame(callback);
    return (): Dynamic => {
      cdsWindow.cancelAnimationFrame(index);
      setCoverSettled(false);
    };
  }, [isCovered, treeId, cdsWindow]);
  let isInert: Dynamic = isCovered && coverSettled,
    onOpenChangeStable: Dynamic = useOptionalStableCallback(onOpenChange),
    refuseCloseStable: Dynamic = useOptionalStableCallback(refuseClose),
    isSheetRef: Dynamic = (0, reactSheetsPopupStack.useRef)(isSheet);
  useIsomorphicLayoutEffect((): Dynamic => {
    isSheetRef.current = isSheet;
  }, [isSheet]);
  let refusesAmbientClose: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (closeDetails?: Dynamic): Dynamic =>
        closeDetails.reason === undefined
          ? false
          : (coverHoldersRef.current.size > 0 ||
                Date.now() - lastCoverReleaseRef.current < SheetsPopupStackLimit) &&
              SheetsPopupStackOutsidePressFocusOutEscapeKeySet.has(
                closeDetails.reason,
              )
            ? true
            : isSheetRef.current &&
              closeDetails.reason === "outside-press" &&
              isSheetAnnouncementTarget(closeDetails.event),
      [],
    ),
    pendingCloseRequestRef: Dynamic = (0, reactSheetsPopupStack.useRef)(null),
    takeCloseRequest: Dynamic = (0, reactSheetsPopupStack.useCallback)((): Dynamic => {
      let current: Dynamic = pendingCloseRequestRef.current;
      pendingCloseRequestRef.current = null;
      return current?.isCanceled === true ? null : current;
    }, []),
    handleOpenChange: Dynamic = (0, reactSheetsPopupStack.useCallback)(
      (nextOpen?: Dynamic, eventDetails?: Dynamic): Dynamic => {
        let closeRequest: Dynamic = eventDetails;
        if (!nextOpen && refusesAmbientClose(closeRequest)) {
          closeRequest.cancel?.();
          return;
        }
        if (
          !nextOpen &&
          isSheetRef.current &&
          refuseCloseStable?.(eventDetails, treeId) === true
        ) {
          closeRequest.cancel?.();
          return;
        }
        pendingCloseRequestRef.current = nextOpen ? null : closeRequest;
        nextOpen ||
          cdsWindow?.requestAnimationFrame((): Dynamic => {
            pendingCloseRequestRef.current === closeRequest && (pendingCloseRequestRef.current = null);
          });
        nextOpen && isTouchOverlay && preloadMobileSheets();
        onOpenChangeStable?.(nextOpen, eventDetails);
      },
      [onOpenChangeStable, refuseCloseStable, refusesAmbientClose, treeId, isTouchOverlay, cdsWindow],
    ),
    sheetState: Dynamic = (0, reactSheetsPopupStack.useMemo)(
      (): Dynamic => ({
        sheet: isSheet,
        pending: isPending,
        covered: isCovered,
        inert: isInert,
        depth: depth,
      }),
      [isSheet, isPending, isCovered, isInert, depth],
    ),
    parentFrameHeight: Dynamic = parentStack?.frameHeight,
    mergedFrame: Dynamic = (0, reactSheetsPopupStack.useMemo)((): Dynamic => {
      let mergedHeight: Dynamic =
        sheetStack.frame.height !== undefined && parentFrameHeight !== undefined
          ? Math.max(sheetStack.frame.height, parentFrameHeight)
          : sheetStack.frame.height;
      return mergedHeight !== sheetStack.frame.height
        ? {
            ...sheetStack.frame,
            height: mergedHeight,
          }
        : sheetStack.frame;
    }, [sheetStack.frame, parentFrameHeight]),
    frameWithClose: Dynamic = (0, reactSheetsPopupStack.useMemo)(
      (): Dynamic => ({
        ...mergedFrame,
        refusesAmbientClose: refusesAmbientClose,
        takeCloseRequest: takeCloseRequest,
      }),
      [mergedFrame, refusesAmbientClose, takeCloseRequest],
    ),
    ownFrameHeight: Dynamic = sheetFrameHeight(mergedFrame, cdsWindow),
    stackValue: Dynamic = (0, reactSheetsPopupStack.useMemo)(
      (): Dynamic => ({
        depth: depth,
        frameHeight: ownFrameHeight,
        cover: registerCover,
      }),
      [depth, ownFrameHeight, registerCover],
    );
  return {
    sheet: isSheet,
    showing: sheetStack.showing,
    frame: frameWithClose,
    actionsRef: sheetStack.actionsRef,
    onOpenChange: handleOpenChange,
    onOpenChangeComplete: sheetStack.onOpenChangeComplete,
    modal: isSheet ? true : undefined,
    state: sheetState,
    stack: stackValue,
  };
}
function ResetSheetContext({ children: children }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <SheetStateContext.Provider
      value={SheetsPopupStackSheetPendingCoveredConfig}
    >
      <SheetStackContext.Provider value={null}>
        <SheetPopupBridgeContext.Provider value={null}>
          <SheetPopupContext.Provider value={null}>
            {children}
          </SheetPopupContext.Provider>
        </SheetPopupBridgeContext.Provider>
      </SheetStackContext.Provider>
    </SheetStateContext.Provider>
  );
}
function SheetPopupRender(props?: Dynamic): Dynamic {
  useUiLocale();
  let { children: value, ...popupOptions }: Dynamic = props,
    popup: Dynamic = useSheetPopup(popupOptions);
  return (
    <SheetPopupProvider value={popup}>{value(popup)}</SheetPopupProvider>
  );
}
function SheetPopupProvider({
  value: popup,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <SheetStateContext.Provider value={popup.state}>
      <SheetPopupBridgeContext.Provider value={popup.stack.cover}>
        <SheetPopupContext.Provider value={popup.frame}>
          {children}
        </SheetPopupContext.Provider>
      </SheetPopupBridgeContext.Provider>
    </SheetStateContext.Provider>
  );
}
function useOverlayOpenState(props?: Dynamic): Dynamic {
  let [value, setUncontrolledOpen]: Dynamic = (0, reactSheetsPopupStack.useState)(
      props.defaultOpen ?? false,
    ),
    isOpen: Dynamic = props.open ?? value,
    onOpenChangeStable: Dynamic = useOptionalStableCallback(
      props.onOpenChange,
    );
  return {
    open: isOpen,
    onOpenChange: (0, reactSheetsPopupStack.useCallback)(
      (nextOpen?: Dynamic, eventDetails?: Dynamic): Dynamic => {
        onOpenChangeStable?.(nextOpen, eventDetails);
        eventDetails.isCanceled || setUncontrolledOpen(nextOpen);
      },
      [onOpenChangeStable],
    ),
  };
}
function isInsideSheetPopup(): Dynamic {
  return (0, reactSheetsPopupStack.useContext)(SheetPopupContext) !== null;
}
function useSheetInteractionMode(): Dynamic {
  let value: Dynamic = useTouchOverlay(),
    isInsideSheet: Dynamic =
      (0, reactSheetsPopupStack.useContext)(SheetPopupContext) !== null;
  return value || isInsideSheet;
}
function useAvailableSheetParts(): Dynamic {
  let value: Dynamic = useMobileSheetComponents(),
    sheetPopup: Dynamic = (0, reactSheetsPopupStack.useContext)(
      SheetPopupContext,
    ),
    isShowing: Dynamic = sheetPopup?.showing ?? false,
    isOpen: Dynamic = sheetPopup?.open ?? false,
    { sheet: isSheet }: Dynamic = useSheetState(),
    canUseParts: Dynamic = !isShowing || (isSheet && isOpen),
    [availableParts, setAvailableParts]: Dynamic = (0, reactSheetsPopupStack.useState)(
      (): Dynamic => (value !== null && canUseParts ? value : null),
    );
  return availableParts === null && value !== null && canUseParts
    ? (setAvailableParts(value), value)
    : availableParts;
}
function prefersReducedMotion(): Dynamic {
  return typeof window === "undefined" || typeof document === "undefined"
    ? false
    : (typeof (window as Dynamic).matchMedia == "function" &&
        (window as Dynamic).matchMedia(reducedMotionMediaQuery)
          .matches) ||
        (document as Dynamic).documentElement.getAttribute(
          reducedMotionAttribute,
        ) === "true";
}
export {
  getInertPropsValue,
  initializeSheetsPopupStack,
  isInsideSheetPopup,
  isSheetAnnouncementTarget,
  jsxSheetsPopupStack,
  prefersReducedMotion,
  reactSheetsPopupStack,
  ResetSheetContext,
  sheetActivityListenersInstalled,
  SheetPopupBridgeContext,
  SheetPopupContext,
  SheetPopupProvider,
  SheetPopupRender,
  SheetsPopupStackAt,
  SheetsPopupStackConcealedConfig,
  SheetsPopupStackDelayMs,
  SheetsPopupStackHandler,
  SheetsPopupStackLabel,
  SheetsPopupStackLimit,
  SheetsPopupStackOutsidePressFocusOutEscapeKeySet,
  SheetsPopupStackSheetConcealedChromeConfig,
  SheetsPopupStackSheetPendingCoveredConfig,
  SheetsPopupStackSubscribers,
  SheetStackContext,
  SheetStateContext,
  useAvailableSheetParts,
  useIsSheet,
  useOverlayOpenState,
  useSheetInteractionMode,
  useSheetPopup,
  useSheetStack,
  useSheetState,
};
export function installCdsSheetsPopupStack(): () => void {
  return () => {
    initializeSheetsPopupStack = initializeOnce((): Dynamic => {
      "use client";

      initializeMobileSheetLoader();
      initializeHooksLayoutEffect();
      initializeCdsRoot();
      initializeOverlaysAndroidCloseWatcher();
      initializeHooksStableCallback_2();
      initializeOverlaysImperativeHandle();
      initializeDomInert();
      initializeSheetsKeyboardViewport();
      initializeSheetsLayout();
      initializeSheetsPresentation();
      reactSheetsPopupStack = toModuleNamespace(
        load_react(),
      );
      jsxSheetsPopupStack = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      SheetPopupContext = (0, reactSheetsPopupStack.createContext)(null);
      SheetsPopupStackAt = (heightStack?: Dynamic): Dynamic =>
        heightStack.at(-1)?.grows ?? true;
      SheetStackContext = (0, reactSheetsPopupStack.createContext)(null);
      SheetStateContext = (0, reactSheetsPopupStack.createContext)({
        sheet: false,
        pending: false,
        covered: false,
        inert: false,
        depth: 0,
      });
      getInertPropsValue = getInertProps(true);
      SheetsPopupStackDelayMs = 600;
      sheetActivityListenersInstalled = false;
      SheetsPopupStackSubscribers = new Set();
      SheetsPopupStackOutsidePressFocusOutEscapeKeySet = new Set([
        "outside-press",
        "focus-out",
        "escape-key",
      ]);
      SheetsPopupStackLimit = 120;
      SheetsPopupStackLabel =
        '[data-cds="Toast"], [aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]';
      SheetsPopupStackSheetPendingCoveredConfig = {
        sheet: false,
        pending: false,
        covered: false,
        inert: false,
        depth: 0,
      };
      SheetsPopupStackHandler = (): Dynamic => {};
      SheetsPopupStackSheetConcealedChromeConfig = {
        sheet: false,
        concealed: false,
        chrome: null,
        ref: SheetsPopupStackHandler,
        style: undefined,
        positionerStyle: undefined,
        attrs: {},
        frame: null,
        state: SheetsPopupStackSheetPendingCoveredConfig,
        stack: null,
      };
      SheetsPopupStackConcealedConfig = {
        ...SheetsPopupStackSheetConcealedChromeConfig,
        concealed: true,
      };
      SheetPopupBridgeContext = (0, reactSheetsPopupStack.createContext)(null);
    });
  };
}

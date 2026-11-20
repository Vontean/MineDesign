import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as Layers from "../contracts/layers";
import type * as Dom from "../contracts/dom";
import type * as Overlays from "../contracts/overlays";
import type {
  CollisionPadding,
  FocusableElement,
  ForwardComponent,
  InitialPopupFocus,
  MenuChange,
  MenuPopupProps,
  PassiveGateProps,
  PassiveOpenCell,
  PassiveOpenGateState,
  PassiveOpenLevel,
  PassivePopupProps,
  PopupFocus,
  PopupInputKind,
  PassivePopupTransform,
  MenuPopupElementProps,
  PopupAnimationInput,
  PopupAnimationState,
  PopupPlacement,
  ColorMode,
  ControlSize,
  Density,
  DesignStyle,
} from "../contracts/layers";
import type * as React from "react";
import type {
  SheetFrame,
  InnerOverlay,
  OverlayStack,
  OverlayCloseDetails,
  OverlayEvent,
  OverlayFocusOptions,
  OverlayFocusReturn,
  ClickToFocusOptions,
  HrefOrigin,
} from "../contracts/dom";
/** Restored application module; prepare first, initialize in original order. */
import { baseCombobox, baseContextMenu, baseMenu, basePopover, baseUseRender, cva, initializeNpmDependency, loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { accentColorNames, defineLiveExports, initializeOnce, toModuleNamespace } from "../module-helpers";
import { asElement, COARSE_POINTER_QUERY_rG, createSafeMutationObserver, featureFlagContext, getCoarsePointerSnapshot, getSheetAvailableHeight, getSheetFrameHeight, getSheetMinimumHeight, getSheetPopupStyle, getSheetPositionerStyle, hasEditableSheetContent, inertElementProps, initializeAccentColors, initializeAdaptiveSheets, initializeAndroidCloseWatcher, initializeCoarsePointerStores, initializeDocumentFont, initializeElementAccess, initializeEventCallbacks, initializeFeatureFlags, initializeInputDismissalTracking, initializeIsomorphicLayoutEffect, initializeMediaQueryStores, initializePresentationMode, initializeReducedMotion, initializeSafeObservers, initializeSheetClassNames, initializeSheetDrag, initializeSheetStyles, initializeTransitionRunner, initializeVisualKeyboard, isEditableElement, isReducedMotion, MAX_SHEET_HEIGHT_FRACTION, mergeFeatureFlagNames, MIN_SHEET_HEIGHT_CSS, MIN_SHEET_HEIGHT_FRACTION, registerInputDismissalTracking, ResetSheetContexts, resetSheetDragStyle, runWithTransition, SHEET_COVERED_ATTRIBUTE, SHEET_DENSITY, SHEET_DRILLED_ATTRIBUTE, SHEET_PEELING_ATTRIBUTE, SHEET_SCROLL_ATTRIBUTE, SHEET_TREE_CLOSING_ATTRIBUTE, sheetBackdropClasses, sheetClipClasses, sheetContentCanGrow, sheetCoverContext, sheetDrillBodyClasses, sheetFrameContext, sheetOverflowBackgroundClasses, sheetParentContext, sheetPopupClasses, sheetPositioningOverrides, sheetSeparatorClasses, subscribeCoarsePointer, transparentSheetBackdropClasses, useAndroidCloseWatcher, useDocumentFont, useEventCallback, useIsomorphicLayoutEffect, useIsSheet, useMediaQuery__U, useOptionalEventCallback, useSheetState } from "./foundation";
import { blurWithSafeRelatedTarget, cn, collisionPaddingContext, CollisionPaddingProvider, contextMenuContext, createMenuVirtualAnchor, createSheetUncoverGate, elevationSurfaceNames, getOverlayOwnerAncestors, getSurfaceClasses, Icon, IconSlot, initializeClassNames, initializeCollisionPadding, initializeExperimentalTheme, initializeIcons, initializeKeyboardContextMenuFocus, initializeLayers, initializeMenuContexts, initializeMenuScrollContent, initializeMergedRefs, initializePortalRoot, initializeSafeBlur, initializeSheetChrome, initializeSheetMeasurement, initializeSheetPopupHost, initializeSurfaces, initializeTextEntrySelector, initializeTranslations, isScrollContentReplacement, layerBaseContext, measureNaturalSheetHeight, menuRootIdentityContext, MenuScrollContent, menuSheetLabelsContext, menuTriggerContext, PortalRoot, registerOverlayOwner, SheetHandle, SheetPopupHost, SheetTitleBar, submenuStateContext, TEXT_ENTRY_SELECTOR, themeStoreContext, translationContext, useDefaultOverlayLayer, useDismissSheetOnForeignFocus, useExperimentalThemeStore, useKeyboardContextMenuInitialFocus, useMergedRefs, useOverlayLayer, useSheetPressedState, useSheetTextEntryFocus, useStableMergedRef, useTranslation, warnNestedMenuInitialFocus, warnNestedMenuLayerOffset } from "./interactions";

var overlayOwnerResolvers: WeakMap<Element, () => FocusableElement | null>;
var MAX_OVERLAY_OWNER_DEPTH: number;
var initializeOverlayOwners: () => void;
var reactOverlayFocus: typeof React;
var initializeOverlayFocus: () => void;
var OVERLAY_ATTRIBUTE: "data-cds-overlay";
var OPEN_OVERLAY_SELECTOR_VQ5: string;
var initializeOverlaySelector: () => void;
var reactOverlayStack: typeof React;
var overlayStackContext: React.Context<OverlayStack | null>;
var DOCUMENT_NODE_TYPE: number;
var initializeOverlayStack: () => void;
var reactMenuOverlayRegistration: typeof React;
var menuOverlayAttributes: {
  "data-cds-overlay": string;
};
var initializeMenuOverlayRegistration: () => void;
var reactContextMenuPopup: typeof React;
var jsxContextMenuPopup: typeof import("react/jsx-runtime");
var contextMenuPopupClasses: string;
var ContextMenuPopupFrame: ForwardComponent<
  HTMLDivElement,
  MenuPopupElementProps
>;
var initializeContextMenuPopup: () => void;
var reactClickToFocus: typeof React;
var INTERACTIVE_CLICK_TARGET_SELECTOR: string;
var initializeClickToFocus: () => void;
var FORM_POINTER_FOCUS_SELECTOR: string;
var SELECT_ELEMENT_SELECTOR: string;
var DRAGGABLE_ELEMENT_SELECTOR: string;
var initializePopupPointerFocus: () => void;
var reactPassiveOpen: typeof React;
var jsxPassiveOpen: typeof import("react/jsx-runtime");
var reactDomPassiveOpen: typeof import("react-dom");
var PASSIVE_HOVER_OPEN_REASON: string;
var PASSIVE_FOCUS_OUT_REASON: string;
var passiveOpenStateContext: React.Context<PassiveOpenCell | null>;
var passiveFocusDeclinedContext: React.Context<boolean>;
var passiveDeclinedFocusProps: Pick<PassivePopupProps, "tabIndex">;
var passiveDefaultFocusProps: Pick<PassivePopupProps, "tabIndex">;
var passiveOpenEngagementKeys: Set<string>;
var passiveOpenModifierKeys: Set<string>;
var subscribePassiveOpenNoop: (listener: () => void) => () => void;
var getPassiveOffSnapshot: () => "off";
var unchangedPopupProps: PassivePopupTransform;
var initializePassiveOpen: () => void;
var menuItemVariants: (props?: { variant?: "default" | "danger" }) => string;
var menuItemDescriptionPaddingClass: string;
var initializeMenuItemVariants: () => void;
var reactMenuOpener: typeof React;
var menuOpenerRefContext: React.Context<
  React.RefObject<HTMLElement | null> | undefined
>;
var MenuOpenerProvider: React.Provider<
  React.RefObject<HTMLElement | null> | undefined
>;
var initializeMenuOpener: () => void;
var reactMenuPopupElement: typeof React;
var jsxMenuPopupElement: typeof import("react/jsx-runtime");
var MenuPopupElement: ForwardComponent<HTMLDivElement, MenuPopupElementProps>;
var initializeMenuPopupElement: () => void;
var reactStablePopupPlacement: typeof React;
var heldPositionerClasses: string;
var heldPopupClasses: string;
var POPUP_PLACEMENT_SETTLE_FRAMES: number;
var initializeStablePopupPlacement: () => void;
var TOUCH_DEVICE_QUERY: string;
var ELECTRON_USER_AGENT_TOKEN: string;
var initializeModalReleasePlatform: () => void;
var reactModalPortalInert: typeof React;
var inertExcludedTags: Set<string>;
var MODAL_INERT_LIVE_REGION_SELECTOR: string;
var modalInertRefCounts: Layers.InertRefCounts;
var initializeModalPortalInert: () => void;
var reactMenuSheetPopup: typeof React;
var jsxMenuSheetPopup: typeof import("react/jsx-runtime");
var coveredMenuSheetOwners: Layers.CoveredMenuSheetOwners;
var MenuSheetPopup: ForwardComponent<HTMLDivElement, MenuPopupProps>;
var initializeMenuSheetPopup: () => void;
var jsxPopoverSheetBody: typeof import("react/jsx-runtime");
var initializePopoverSheetContent: () => void;
var jsxComboboxSheetBackdrop: typeof import("react/jsx-runtime");
var initializeComboboxSheetBackdrop: () => void;
var mobileSheetExports: Overlays.MobileSheetParts;
var initializeMobileSheetExports: () => void;
var reactSheetImplementation: typeof React;
var loadedSheetImplementation: Overlays.MobileSheetParts | null;
var sheetImplementationFailed: boolean;
var sheetImplementationRequests: number;
var sheetImplementationGeneration: number;
var sheetImplementationPromise: Promise<Overlays.MobileSheetParts | null> | null;
var sheetImplementationSubscribers: Set<() => void>;
var getSheetImplementationSnapshot: () => Overlays.MobileSheetParts | null;
var getSheetImplementationLoadedSnapshot: () => boolean;
var getSheetImplementationFailedSnapshot: () => boolean;
var getNullSheetImplementationSnapshot: () => null;
var getFalseSheetImplementationSnapshot: () => false;
var initializeSheetImplementation: () => void;
var reactPreloadSheets: typeof React;
var initializePreloadSheets: () => void;
var desktopPlatformUserAgentPattern: RegExp;
var initializeCdsPlatform: () => void;
var MAX_LINK_DEBUG_WARNINGS: number;
var MAX_LINK_DEBUG_LENGTH: number;
var reportedLinkWarnings: Set<string>;
var linkWarningLimitReached: boolean;
var initializeLinkWarnings: () => void;
var linkWhitespacePattern: RegExp;
var initializeHrefWhitespace: () => void;
var existingBrowsingContextNames: Set<string>;
var unsafeLinkRelTokenPattern: RegExp;
var initializeLinkTargets: () => void;
var reactCdsLink: typeof React;
var cdsRouterContext: React.Context<Overlays.LinkRouter | undefined>;
var forbiddenHrefControlCharacterPattern: RegExp;
var leadingHrefWhitespacePattern: RegExp;
var networkPathHrefPattern: RegExp;
var rootRelativeHrefPattern: RegExp;
var unrootedHrefPattern: RegExp;
var relativePathDotSegmentPattern: RegExp;
var dotSegmentPattern: RegExp;
var encodedOrBackslashPathPattern: RegExp;
var allowedHrefSchemePattern: RegExp;
var androidIntentHrefPattern: RegExp;
var editorHrefSchemePattern: RegExp;
var allowedEditorHrefPattern: RegExp;
var allowedIntentPropertyNames: Set<string>;
var absoluteHrefPattern: RegExp;
var trustedAnthropicDomains: string[];
var trustedAndroidIntentPackages: Set<string>;
var HTTPS_RELATIVE_HREF_BASE: string;
var HTTP_RELATIVE_HREF_BASE: string;
var linkEventPropNames: Layers.LinkEventName[];
var linkPrefetchEventKinds: Record<Layers.LinkIntentEventName, boolean>;
var linkPrefetchEventNames: Layers.LinkIntentEventName[];
var initializeCdsLink: () => void;
var initializeElementWindow: () => void;
var reactCdsRoot: typeof React;
var jsxCdsRoot: typeof import("react/jsx-runtime");
var subscribePlatformNoop: (listener: () => void) => () => void;
var getWebPlatformSnapshot: () => "web";
var getCoarsePointerServerSnapshot: () => boolean;
var subscribeRootCoarsePointer: (listener: () => void) => () => void;
var hasMigratedHtmlFontSizing: boolean;
var densitySizeIndices: Record<Density, number>;
var controlSizeOffsets: Partial<Record<ControlSize, number>>;
var densityContext: React.Context<Density>;
var portalDensityContext: React.Context<Density>;
var colorModeStoreContext: React.Context<Layers.ColorModeStore | undefined>;
var defaultColorModeStore: Layers.ColorModeStore;
var DARK_COLOR_SCHEME_QUERY: string;
var normalizeColorMode: (
  mode: string | null | undefined,
) => Layers.ConfiguredColorMode | undefined;
var platformContext: React.Context<Layers.CdsPlatform | undefined>;
var fontContext: React.Context<Layers.CdsFont | undefined>;
var monospaceFontContext: React.Context<string | null | undefined>;
var pageBackgroundContext: React.Context<string | undefined>;
var naturalImageTilesContext: React.Context<boolean | undefined>;
var densityOverrideContext: React.Context<Density | undefined>;
var surfaceBackgroundContext: React.Context<string | undefined>;
var localeContext: React.Context<string | undefined>;
var rootElementContext: React.Context<HTMLElement | undefined>;
var rootPortalContainerContext: React.Context<Layers.PortalContainer>;
var isPortalRootContext: React.Context<boolean>;
var opaqueTintOverrides: DesignStyle;
var surfaceTokenNames: Set<string>;
var initializeCdsRoot: () => void;
function useCaptureOverlayOpener(
  open: boolean | undefined,
  openerRef: React.RefObject<HTMLElement | null>,
  rootRef: React.RefObject<HTMLElement | null>,
  onCaptured?: () => void,
  ownerAncestorsRef?: React.RefObject<FocusableElement[]>,
): void {
  let rootElement: HTMLElement | undefined = useRootElement(),
    capturedRef = reactOverlayFocus.useRef(false);
  reactOverlayFocus.useInsertionEffect(() => {
    if (!open) {
      capturedRef.current = false;
      return;
    }
    if (capturedRef.current) {
      return;
    }
    capturedRef.current = true;
    openerRef.current = null;
    rootRef.current = rootElement ?? null;
    let value = rootElement?.ownerDocument ?? document,
      activeElement = value.activeElement,
      opener =
        activeElement && activeElement !== value.body
          ? (activeElement as HTMLElement)
          : null;
    openerRef.current = opener;
    if (ownerAncestorsRef) {
      ownerAncestorsRef.current = getOverlayOwnerAncestors(
        opener,
      );
    }
    onCaptured?.();
  }, [open, rootElement, openerRef, rootRef, onCaptured, ownerAncestorsRef]);
}
function useOverlayFocusReturn(
  options?: OverlayFocusOptions,
): OverlayFocusReturn {
  let skipRestoreOnOutsideFocus = options?.skipRestoreOnOutsideFocus ?? false,
    registerOpenerReturn = options?.registerOpenerReturn ?? true,
    triggerRef = options?.triggerRef,
    openerRef = reactOverlayFocus.useRef<HTMLElement | null>(null),
    popupRef = reactOverlayFocus.useRef<HTMLElement | null>(null),
    rootRef = reactOverlayFocus.useRef<HTMLElement | null>(null);
  useCaptureOverlayOpener(options?.open ?? true, openerRef, rootRef);
  let shouldRegisterRef = reactOverlayFocus.useRef(registerOpenerReturn);
  reactOverlayFocus.useLayoutEffect(() => {
    shouldRegisterRef.current = registerOpenerReturn;
  }, [registerOpenerReturn]);
  reactOverlayFocus.useLayoutEffect(() => {
    if (popupRef.current) {
      registerOverlayOwner(popupRef.current, () => {
        if (!shouldRegisterRef.current) {
          return null;
        }
        return resolveConnectedRefElement(triggerRef) ?? openerRef.current;
      });
    }
  }, [triggerRef]);
  let finalFocus = reactOverlayFocus.useCallback(() => {
    if (skipRestoreOnOutsideFocus) {
      let current = popupRef.current,
        value = rootRef.current?.ownerDocument ?? document,
        activeElement = value.activeElement;
      if (
        activeElement &&
        activeElement !== value.body &&
        !current?.contains(activeElement)
      ) {
        return false;
      }
    }
    if (resolveConnectedRefElement(triggerRef) !== null) {
      return null;
    }
    return resolveFinalFocusTarget(openerRef.current, popupRef.current);
  }, [skipRestoreOnOutsideFocus, triggerRef]);
  return reactOverlayFocus.useMemo(
    () => ({
      finalFocus: finalFocus,
      popupRef: popupRef,
    }),
    [finalFocus],
  );
}
function resolveConnectedRefElement(
  elementRef: React.RefObject<HTMLElement | null> | null | undefined,
): HTMLElement | null {
  let value = elementRef?.current ?? null;
  if (value?.isConnected) {
    return value;
  } else {
    return null;
  }
}
function useOverlayFinalFocus(
  open: boolean | undefined,
  takeFocus: boolean = true,
  fallbackTriggerRef?: React.RefObject<HTMLElement | null> | null,
): OverlayFocusReturn {
  let rootElement: HTMLElement | undefined = useRootElement(),
    fallbackOpenerRef = reactOverlayFocus.useRef<HTMLElement | null>(null),
    needsFocusCheckRef = reactOverlayFocus.useRef(false),
    onCaptured = reactOverlayFocus.useCallback(() => {
      fallbackOpenerRef.current = null;
      needsFocusCheckRef.current = true;
    }, []),
    openerRef = reactOverlayFocus.useRef<HTMLElement | null>(null),
    ownerAncestorsRef = reactOverlayFocus.useRef<FocusableElement[]>([]),
    popupRef = reactOverlayFocus.useRef<HTMLElement | null>(null),
    rootRef = reactOverlayFocus.useRef<HTMLElement | null>(null);
  useCaptureOverlayOpener(
    open,
    openerRef,
    rootRef,
    onCaptured,
    ownerAncestorsRef,
  );
  reactOverlayFocus.useLayoutEffect(() => {
    if (!needsFocusCheckRef.current) {
      return;
    }
    needsFocusCheckRef.current = false;
    if (!takeFocus && !fallbackTriggerRef) {
      return;
    }
    let value = rootElement?.ownerDocument ?? document;
    if (!openerRef.current) {
      let fallbackTrigger = fallbackTriggerRef?.current ?? null;
      fallbackOpenerRef.current =
        fallbackTrigger !== null &&
        fallbackTrigger.isConnected &&
        !popupRef.current?.contains(fallbackTrigger)
          ? fallbackTrigger
          : null;
    }
    if (!takeFocus) {
      return;
    }
    let activeNode = asElement(value.activeElement),
      activeTarget = activeNode && activeNode !== value.body ? activeNode : null;
    if (!activeTarget || popupRef.current?.contains(activeTarget)) {
      return;
    }
    blurWithSafeRelatedTarget(activeTarget as FocusableElement);
  }, [open, takeFocus, fallbackTriggerRef, rootElement]);
  let skipRestoreOnOutsideFocus = !takeFocus,
    finalFocus = reactOverlayFocus.useCallback(() => {
      if (skipRestoreOnOutsideFocus) {
        let current = popupRef.current,
          value = rootRef.current?.ownerDocument ?? document,
          activeElement = value.activeElement;
        if (
          activeElement &&
          activeElement !== value.body &&
          !current?.contains(activeElement)
        ) {
          return false;
        }
      }
      if (openerRef.current) {
        if (!openerRef.current.isConnected) {
          let value = ownerAncestorsRef.current.find(
            (ancestor) => ancestor.isConnected,
          );
          if (value) {
            return resolveFinalFocusTarget(value, popupRef.current);
          }
        }
        return resolveFinalFocusTarget(openerRef.current, popupRef.current);
      }
      if (fallbackOpenerRef.current) {
        let current = popupRef.current,
          activeElement = (rootRef.current?.ownerDocument ?? document)
            .activeElement;
        if (
          activeElement &&
          isTextEntryTarget(activeElement) &&
          !current?.contains(activeElement)
        ) {
          return false;
        }
        if (!fallbackOpenerRef.current.isConnected) {
          return false;
        }
        return null;
      }
      return false;
    }, [skipRestoreOnOutsideFocus]);
  return reactOverlayFocus.useMemo(
    () => ({
      finalFocus: finalFocus,
      popupRef: popupRef,
    }),
    [finalFocus, popupRef],
  );
}
function resolveFinalFocusTarget(
  opener: FocusableElement | null | undefined,
  popup: HTMLElement | null | undefined,
): FocusableElement | false {
  if (!opener?.isConnected) {
    return false;
  }
  let activeElement = opener.ownerDocument.activeElement;
  if (
    activeElement &&
    isTextEntryTarget(activeElement) &&
    !popup?.contains(activeElement)
  ) {
    return false;
  }
  let focusTarget = opener;
  if (focusTarget.tabIndex < 0) {
    focusTarget.focus({
      preventScroll: true,
    });
    return false;
  }
  return focusTarget;
}
function isTextEntryTarget(element: Element): boolean {
  return element.matches(TEXT_ENTRY_SELECTOR);
}
function createOverlayStack(): OverlayStack {
  let overlays: InnerOverlay[] = [];
  return {
    register: (overlay: InnerOverlay) => {
      overlays.push(overlay);
      return () => {
        let value = overlays.lastIndexOf(overlay);
        if (value !== -1) {
          overlays.splice(value, 1);
        }
      };
    },
    topmostOpen: () => {
      for (let value = overlays.length - 1; value >= 0; value -= 1) {
        let overlay = overlays[value];
        if (overlay?.isOpen()) {
          return overlay;
        }
      }
    },
  };
}
function useRegisterInnerOverlay(overlay: InnerOverlay): void {
  let stack = reactOverlayStack.useContext(overlayStackContext),
    overlayRef = reactOverlayStack.useRef(overlay);
  reactOverlayStack.useEffect(() => {
    overlayRef.current = overlay;
  }, [overlay]);
  reactOverlayStack.useEffect(() => {
    if (stack === null) {
      return;
    }
    return stack.register({
      isOpen: () => overlayRef.current.isOpen(),
      close: () => overlayRef.current.close(),
    });
  }, [stack]);
}
function isDocumentCurrentTarget(event: OverlayEvent | undefined): boolean {
  return (
    (event?.currentTarget as Node | null | undefined)?.nodeType ===
    DOCUMENT_NODE_TYPE
  );
}
function interceptEscapeForInnerOverlay(
  stack: OverlayStack,
  open: boolean,
  details: OverlayCloseDetails,
): boolean {
  let closeDetails = details;
  if (open || closeDetails.reason !== "escape-key") {
    return false;
  }
  let topmostOverlay = stack.topmostOpen();
  if (topmostOverlay === undefined) {
    return false;
  }
  closeDetails.cancel?.();
  let event = closeDetails.event;
  if (isDocumentCurrentTarget(event)) {
    (
      (event?.currentTarget as Document | null | undefined)?.defaultView ??
      globalThis
    ).setTimeout(() => {
      if (topmostOverlay.isOpen()) {
        topmostOverlay.close();
      }
    }, 0);
  } else {
    event?.preventDefault();
    topmostOverlay.close();
  }
  return true;
}
function useMenuOverlayRegistration(): {
  elementRef: React.RefObject<HTMLElement | null>;
  overlayAttrs: {
    "data-cds-overlay": string;
  };
} {
  let ref = reactMenuOverlayRegistration.useRef<HTMLElement | null>(null),
    value =
      reactMenuOverlayRegistration.useContext<React.RefObject<Dom.OverlayActions | null> | null>(
        menuRootIdentityContext,
      );
  useRegisterInnerOverlay({
    isOpen: () =>
      value !== null && ref.current?.hasAttribute("data-open") === true,
    close: () => value?.current?.close?.(),
  });
  return {
    elementRef: ref,
    overlayAttrs: menuOverlayAttributes,
  };
}
function calculateScrollbarThickness(
  offsetSize: number,
  clientSize: number,
  borderSize: number,
): number {
  return offsetSize - clientSize - (borderSize || 0);
}
function isScrollbarPointerPosition(
  offsetX: number,
  offsetY: number,
  targetElement: HTMLElement,
): boolean {
  let style = getComputedStyle(targetElement);
  if (style.display === "inline") {
    return false;
  }
  let verticalScrollbarWidth = calculateScrollbarThickness(
      targetElement.offsetWidth,
      targetElement.clientWidth,
      parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth),
    ),
    horizontalScrollbarHeight = calculateScrollbarThickness(
      targetElement.offsetHeight,
      targetElement.clientHeight,
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth),
    ),
    overVerticalScrollbar =
      verticalScrollbarWidth >= 1 &&
      (style.direction === "rtl"
        ? offsetX < verticalScrollbarWidth
        : offsetX >= targetElement.clientWidth),
    overHorizontalScrollbar =
      horizontalScrollbarHeight >= 1 && offsetY >= targetElement.clientHeight;
  return overVerticalScrollbar || overHorizontalScrollbar;
}
function useClickToFocus(
  focus: (() => void) | undefined,
  options: ClickToFocusOptions = {},
): {
  clickToFocusProps: {
    onMouseDown: React.MouseEventHandler<HTMLElement>;
  };
} {
  let {
      disabled = false,
      readOnly = false,
      shouldIgnoreTarget: shouldIgnoreTarget,
    } = options,
    focusCallback = useOptionalEventCallback(focus),
    ignoreTargetCallback = useOptionalEventCallback(
      shouldIgnoreTarget,
    );
  return {
    clickToFocusProps: {
      onMouseDown: reactClickToFocus.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
          if (event.button !== 0 || readOnly || disabled) {
            return;
          }
          let { target: value, currentTarget: focusRegion } =
            event as React.MouseEvent<HTMLElement> & {
              target: HTMLElement;
            };
          if (!focusRegion.contains(value)) {
            return;
          }
          if (value !== focusRegion) {
            if (ignoreTargetCallback?.(value)) {
              return;
            }
            let ancestor = value.closest(INTERACTIVE_CLICK_TARGET_SELECTOR);
            if (
              ancestor &&
              ancestor !== focusRegion &&
              focusRegion.contains(ancestor)
            ) {
              return;
            }
          }
          let { offsetX: nativeEvent, offsetY: offsetY } =
            event.nativeEvent;
          if (isScrollbarPointerPosition(nativeEvent, offsetY, value)) {
            return;
          }
          event.preventDefault();
          focusCallback?.();
        },
        [disabled, readOnly, focusCallback, ignoreTargetCallback],
      ),
    },
  };
}
function shouldAllowPopupPointerFocus(
  event: React.MouseEvent<HTMLElement>,
  {
    draggable = false,
  }: {
    draggable?: boolean;
  } = {},
): boolean {
  let targetElement = asElement(event.target);
  if (targetElement === null) {
    return false;
  }
  return (
    isEditableElement(targetElement) ||
    targetElement.matches(FORM_POINTER_FOCUS_SELECTOR) ||
    closestWithinElement(
      targetElement,
      SELECT_ELEMENT_SELECTOR,
      event.currentTarget,
    ) ||
    (draggable &&
      closestWithinElement(
        targetElement,
        DRAGGABLE_ELEMENT_SELECTOR,
        event.currentTarget,
      )) ||
    isScrollbarPointerPosition(
      event.nativeEvent.offsetX,
      event.nativeEvent.offsetY,
      targetElement as HTMLElement,
    )
  );
}
function closestWithinElement(
  targetElement: Element,
  selector: string,
  matchingAncestor: Element,
): boolean {
  let ancestor = targetElement.closest(selector);
  return ancestor !== null && matchingAncestor.contains(ancestor);
}
function usePassiveOpenState(
  onOpenChange: MenuChange | undefined,
  open: boolean | undefined,
  allowHover: boolean = true,
): PassiveOpenGateState {
  let [state] = reactPassiveOpen.useState(createPassiveOpenState);
  state.renderedWith(open, onOpenChange, allowHover);
  return state;
}
function createPassiveOpenState(): PassiveOpenGateState {
  let value: MenuChange | undefined,
    flag = true,
    text: PassiveOpenLevel = "off",
    popup: HTMLElement | null = null,
    pendingFocusReturn: FocusableElement | null = null,
    captureOpenerOnMount = false,
    finalFocus: PopupFocus | null | undefined = undefined,
    initialFocus: InitialPopupFocus | undefined = undefined,
    shouldRestoreOpener = false,
    opener: HTMLElement | null = null,
    trigger: HTMLElement | null = null,
    openInput: Layers.PassiveOpenInput | null = null,
    previousControlledOpen: boolean | undefined = undefined,
    openedThroughChangeEvent = false,
    isOpen = false,
    values = new Set<() => void>(),
    callback = (nextLevel: PassiveOpenLevel, notify: boolean) => {
      if (nextLevel === text) {
        return;
      }
      text = nextLevel;
      if (notify) {
        values.forEach((listener: () => void) => {
          listener();
        });
      }
    },
    resetOpenerState = () => {
      shouldRestoreOpener = false;
      opener = null;
      trigger = null;
      openInput = null;
      captureOpenerOnMount = false;
    };
  return {
    cell: {
      getLevel: () => text,
      subscribe(listener: () => void): () => void {
        values.add(listener);
        return () => {
          values.delete(listener);
        };
      },
      engage(): void {
        if (text === "declared") {
          shouldRestoreOpener = false;
        }
        callback("off", true);
      },
      registerPopup(element: HTMLElement | null): void {
        popup = element;
        if (element !== null) {
          if (captureOpenerOnMount) {
            captureOpenerOnMount = false;
            opener = getFocusedElement(element.ownerDocument);
          }
        } else if (!isOpen) {
          callback("off", false);
          if (pendingFocusReturn !== null) {
            let focusTarget = pendingFocusReturn;
            pendingFocusReturn = null;
            restorePassiveOverlayFocus(
              focusTarget.ownerDocument,
              null,
              focusTarget,
              false,
            );
          }
        }
      },
      declareFocusProps(
        nextInitialFocus: InitialPopupFocus | undefined,
        nextFinalFocus: PopupFocus | null | undefined,
      ): void {
        finalFocus = nextFinalFocus;
        let initialFocusChanged = nextInitialFocus !== initialFocus;
        initialFocus = nextInitialFocus;
        if (!initialFocusChanged || !isOpen || popup !== null || openInput === null) {
          return;
        }
        let declinesFocus = declinesInitialFocus(nextInitialFocus, openInput.type);
        if (declinesFocus === (text === "declared")) {
          return;
        }
        let nextLevel: PassiveOpenLevel = declinesFocus
          ? "declared"
          : openInput.byHover
            ? "hover"
            : "off";
        shouldRestoreOpener = nextLevel !== "off";
        callback(nextLevel, false);
      },
      getPopup: () => popup,
      getTrigger: () => trigger,
    },
    renderedWith(
      controlledOpen: boolean | undefined,
      notifyOpenChange: MenuChange | undefined,
      allowPassiveHover: boolean,
    ): void {
      value = notifyOpenChange;
      flag = allowPassiveHover;
      if (previousControlledOpen !== true && controlledOpen === true && !openedThroughChangeEvent) {
        isOpen = true;
        pendingFocusReturn = null;
        if (popup !== null) {
          opener = getFocusedElement(popup.ownerDocument);
        } else {
          opener = null;
          captureOpenerOnMount = true;
        }
        trigger = null;
        openInput = {
          type: "",
          byHover: false,
        };
        shouldRestoreOpener = declinesInitialFocus(initialFocus, "");
        callback(shouldRestoreOpener ? "declared" : "off", false);
      } else if (previousControlledOpen === true && controlledOpen === false) {
        isOpen = false;
        openedThroughChangeEvent = false;
        pendingFocusReturn =
          text === "declared" && shouldRestoreOpener
            ? resolvePassiveFinalFocus(finalFocus, opener)
            : null;
        resetOpenerState();
        if (text === "hover") {
          callback("off", false);
        }
      }
      previousControlledOpen = controlledOpen;
    },
    onOpenChange(
      nextOpen: boolean,
      changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
    ): void {
      value?.(nextOpen, changeDetails);
      if (changeDetails.isCanceled === true) {
        return;
      }
      captureOpenerOnMount = false;
      let byHover = flag && changeDetails.reason === PASSIVE_HOVER_OPEN_REASON,
        ownerDocument =
          changeDetails.trigger?.ownerDocument ??
          popup?.ownerDocument ??
          getDocumentIfAvailable();
      if (!nextOpen) {
        isOpen = false;
        openedThroughChangeEvent = false;
        if (shouldRestoreOpener && ownerDocument !== undefined) {
          let focusTarget = resolvePassiveFinalFocus(
            finalFocus,
            changeDetails.reason === PASSIVE_FOCUS_OUT_REASON && trigger !== null
              ? trigger
              : opener,
          );
          if (focusTarget !== null) {
            restorePassiveOverlayFocus(ownerDocument, popup, focusTarget, !byHover);
          }
        }
        resetOpenerState();
        if (text === "hover") {
          callback("off", true);
        }
        return;
      }
      isOpen = true;
      openedThroughChangeEvent = true;
      pendingFocusReturn = null;
      let focusInsidePopup =
          ownerDocument !== undefined &&
          elementIsWithin(ownerDocument.activeElement, popup),
        inputType = classifyOpenInputType(changeDetails.event),
        nextLevel: PassiveOpenLevel = focusInsidePopup
          ? "off"
          : declinesInitialFocus(initialFocus, inputType)
            ? "declared"
            : byHover
              ? "hover"
              : "off";
      if (!(byHover && focusInsidePopup)) {
        opener = getFocusedElement(ownerDocument);
        trigger = asElement(
          changeDetails.trigger ?? null,
        ) as HTMLElement | null;
        openInput = focusInsidePopup
          ? null
          : {
              type: inputType,
              byHover: byHover,
            };
        shouldRestoreOpener = nextLevel !== "off";
      }
      callback(nextLevel, true);
    },
  };
}
function classifyOpenInputType(event?: Event): PopupInputKind {
  if (event === undefined) {
    return "";
  }
  if ("key" in event) {
    return "keyboard";
  }
  let { type: value } = event;
  if (value === "click" && (event as MouseEvent).detail === 0) {
    return "keyboard";
  }
  if (
    value === "click" ||
    value === "contextmenu" ||
    value.startsWith("mouse") ||
    value.startsWith("pointer") ||
    value.startsWith("touch")
  ) {
    return "mouse";
  }
  return "";
}
function declinesInitialFocus(
  initialFocus: InitialPopupFocus | undefined,
  interactionType: PopupInputKind,
): boolean {
  if (initialFocus === undefined || initialFocus === true) {
    return false;
  }
  if (initialFocus === false) {
    return true;
  }
  let resolvedFocus = initialFocus(interactionType);
  return resolvedFocus === false || resolvedFocus === undefined;
}
function getDocumentIfAvailable(): Document | undefined {
  if (typeof document === "undefined") {
    return undefined;
  } else {
    return document;
  }
}
function resolvePassiveFinalFocus(
  finalFocus: PopupFocus | null | undefined,
  fallbackElement: FocusableElement | null,
): FocusableElement | null {
  if (finalFocus === false) {
    return null;
  }
  if (
    finalFocus === undefined ||
    finalFocus === true ||
    finalFocus === null ||
    typeof finalFocus === "function"
  ) {
    return fallbackElement;
  }
  return finalFocus.current ?? fallbackElement;
}
function getFocusedElement(ownerDocument: Document | undefined): HTMLElement | null {
  let value = asElement(
    ownerDocument?.activeElement ?? null,
  ) as HTMLElement | null;
  if (value === null || value === ownerDocument?.body) {
    return null;
  } else {
    return value;
  }
}
function elementIsWithin(node: Node | null, container: Node | null): boolean {
  return node !== null && container !== null && container.contains(node);
}
function restorePassiveOverlayFocus(
  documentObject: Document,
  popup: HTMLElement | null,
  opener: FocusableElement,
  blurBeforeRestore: boolean,
): void {
  queueMicrotask(() => {
    let activeElement = documentObject.activeElement,
      value = elementIsWithin(activeElement, popup);
    if (
      (activeElement === null ||
        activeElement === documentObject.body ||
        value) &&
      opener.isConnected &&
      opener !== activeElement
    ) {
      let elementToBlur =
        blurBeforeRestore && value
          ? asElement(activeElement)
          : null;
      if (elementToBlur !== null) {
        blurWithSafeRelatedTarget(elementToBlur as FocusableElement);
      }
      opener.focus({
        preventScroll: true,
      });
    }
  });
}
function usePassiveOpenContext(isRoot: boolean): {
  cell: PassiveOpenCell | null;
  root: PassiveOpenCell | null;
} {
  let value = reactPassiveOpen.useContext(passiveOpenStateContext);
  if (isRoot) {
    return {
      cell: value,
      root: value,
    };
  } else {
    return {
      cell: value,
      root: null,
    };
  }
}
function useMenuPassiveFocusProps(): Pick<PassivePopupProps, "tabIndex"> {
  if (reactPassiveOpen.useContext(passiveFocusDeclinedContext)) {
    return passiveDeclinedFocusProps;
  } else {
    return passiveDefaultFocusProps;
  }
}
function PassiveOpenGate({
  cell: cell,
  nested: nested,
  children: children,
}: PassiveGateProps): React.ReactElement {
  useUiLocale();
  let value = reactPassiveOpen.useSyncExternalStore(
      cell === null ? subscribePassiveOpenNoop : cell.subscribe,
      cell === null ? getPassiveOffSnapshot : cell.getLevel,
      getPassiveOffSnapshot,
    ),
    effectiveLevel =
      cell === null ? "off" : nested && value === "hover" ? "off" : value;
  return (
    <passiveFocusDeclinedContext.Provider value={effectiveLevel === "declared"}>
      {[effectiveLevel === "declared" && !nested && cell !== null ? (
          <PassiveOpenKeyboardBridge cell={cell} />
        ) : null, children(
          cell === null || effectiveLevel === "off"
            ? unchangedPopupProps
            : effectiveLevel === "hover"
              ? (popupProps: PassivePopupProps) => ({
                  ...popupProps,
                  tabIndex: undefined,
                  onFocus(
                    focusEvent: Parameters<
                      NonNullable<PassivePopupProps["onFocus"]>
                    >[0],
                  ): void {
                    popupProps.onFocus?.(focusEvent);
                    cell.engage();
                  },
                })
              : (popupProps: PassivePopupProps) => ({
                  ...popupProps,
                  tabIndex: undefined,
                  finalFocus: false,
                  onMouseDown(
                    event: Parameters<
                      NonNullable<PassivePopupProps["onMouseDown"]>
                    >[0],
                  ): void {
                    popupProps.onMouseDown?.(event);
                    if (!shouldAllowPopupPointerFocus(event)) {
                      event.preventDefault();
                    }
                  },
                  onKeyDown(
                    event: Parameters<
                      NonNullable<PassivePopupProps["onKeyDown"]>
                    >[0],
                  ): void {
                    popupProps.onKeyDown?.(event);
                    if (
                      !event.nativeEvent.isComposing &&
                      passiveOpenEngagementKeys.has(event.key)
                    ) {
                      cell.engage();
                    }
                  },
                }),
        )]}
    </passiveFocusDeclinedContext.Provider>
  );
}
function PassiveOpenKeyboardBridge({
  cell: cell,
}: {
  cell: PassiveOpenCell;
}): null {
  reactPassiveOpen.useEffect(() => {
    let value = cell.getTrigger();
    if (value === null) {
      return;
    }
    let callback = (event: KeyboardEvent): void => {
      if (
        event.isComposing ||
        event.key === "Tab" ||
        passiveOpenModifierKeys.has(event.key)
      ) {
        return;
      }
      reactDomPassiveOpen.flushSync(() => {
        cell.engage();
      });
      if (
        (event.key !== "ArrowDown" && event.key !== "ArrowUp") ||
        value.ownerDocument.activeElement !== value
      ) {
        return;
      }
      let popup = cell.getPopup(),
        enabledItems =
          popup === null
            ? []
            : Array.from(
                popup.querySelectorAll(
                  '[role^="menuitem"]:not([data-disabled])',
                ),
              ),
        selectedItem =
          event.key === "ArrowDown" ? enabledItems[0] : enabledItems[enabledItems.length - 1],
        focusTarget = asElement(selectedItem ?? null) as HTMLElement | null;
      if (focusTarget !== null && focusTarget.hasAttribute("data-highlighted")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        focusTarget.focus({
          preventScroll: true,
        });
      }
    };
    value.addEventListener("keydown", callback);
    return () => {
      value.removeEventListener("keydown", callback);
    };
  }, [cell]);
  return null;
}
function isCanceledOpenWithinTrigger(
  changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
): boolean {
  if (changeDetails.reason !== "cancel-open") {
    return false;
  }
  let value = changeDetails.trigger ?? null,
    eventTarget = changeDetails.event?.target ?? null;
  if (value === null || eventTarget === null || !("nodeType" in eventTarget)) {
    return false;
  }
  let targetNode = eventTarget as Node;
  if (value.contains(targetNode)) {
    return true;
  }
  let attribute = value.getAttribute("aria-controls");
  return (
    (attribute
      ? value.ownerDocument.getElementById(attribute)
      : null
    )?.contains(targetNode) ?? false
  );
}
function useTrackedMenuTrigger(
  onOpenChange: MenuChange | undefined,
  refuseCanceledTriggerOpen: boolean = false,
): {
  triggerRef: React.RefObject<HTMLElement | null>;
  onOpenChange: MenuChange;
} {
  let triggerRef = reactMenuOpener.useRef<HTMLElement | null>(null);
  return {
    triggerRef: triggerRef,
    onOpenChange: useEventCallback(
      (
        nextOpen: boolean,
        changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
      ) => {
        if (
          !nextOpen &&
          refuseCanceledTriggerOpen &&
          isCanceledOpenWithinTrigger(changeDetails)
        ) {
          changeDetails.cancel?.();
          return;
        }
        triggerRef.current =
          (changeDetails.trigger as HTMLElement | undefined) ?? null;
        onOpenChange?.(nextOpen, changeDetails);
      },
    ),
  };
}
function useMenuOpenerRef(): React.RefObject<HTMLElement | null> | undefined {
  return reactMenuOpener.useContext(menuOpenerRefContext);
}
function useMenuOwnerRef(
  triggerRef: React.RefObject<HTMLElement | null> | undefined,
  finalFocus: PopupFocus | null | undefined,
): React.RefCallback<HTMLElement> {
  let value = reactMenuOpener.useContext(menuOpenerRefContext),
    ref = reactMenuOpener.useRef(finalFocus);
  useIsomorphicLayoutEffect(() => {
    ref.current = finalFocus;
  }, [finalFocus]);
  let callback = reactMenuOpener.useCallback(() => {
    let fallbackOwner =
        triggerRef !== undefined ? triggerRef.current : (value?.current ?? null),
      current = ref.current;
    if (current === false || typeof current === "function") {
      return null;
    }
    if (current === undefined || current === true || current === null) {
      return fallbackOwner;
    }
    return current.current ?? fallbackOwner;
  }, [triggerRef, value]);
  return reactMenuOpener.useCallback(
    (popup: HTMLElement | null) => {
      if (popup !== null) {
        registerOverlayOwner(popup, callback);
      }
    },
    [callback],
  );
}
function readPopupPlacement(element: Element): PopupPlacement {
  return {
    side: (element.getAttribute("data-side") || undefined) as PopupPlacement["side"],
    align: (element.getAttribute("data-align") || undefined) as PopupPlacement["align"],
  };
}
function arePopupPlacementsEqual(
  previousPlacement: PopupPlacement | null,
  nextPlacement: PopupPlacement,
): boolean {
  return (
    previousPlacement !== null &&
    previousPlacement.side === nextPlacement.side &&
    previousPlacement.align === nextPlacement.align
  );
}
function placementNeedsBottomHold(placement: PopupPlacement | null): boolean {
  return (
    placement?.side === "top" ||
    (placement?.side !== undefined &&
      placement.side !== "bottom" &&
      placement.align === "end")
  );
}
function useStablePopupPlacement({
  enabled: enabled,
  side: side,
  align: align,
}: PopupAnimationInput): Layers.StablePopupPlacement {
  let [value, setSettledPlacement] =
      reactStablePopupPlacement.useState<PopupPlacement | null>(null),
    [observedPlacement, setObservedPlacement] =
      reactStablePopupPlacement.useState<PopupPlacement | null>(null),
    [heldHeight, setHeldHeight] = reactStablePopupPlacement.useState<
      number | undefined
    >(),
    ref = reactStablePopupPlacement.useRef<HTMLElement | null>(null),
    holdBottomRef = reactStablePopupPlacement.useRef(false),
    stopPositionerObservationRef = reactStablePopupPlacement.useRef<(() => void) | null>(null),
    callback = reactStablePopupPlacement.useCallback(
      (element: HTMLElement | null): void => {
        stopPositionerObservationRef.current?.();
        stopPositionerObservationRef.current = null;
        if (!element) {
          setSettledPlacement(null);
          setObservedPlacement(null);
          holdBottomRef.current = false;
          return;
        }
        let ownerWindow = element.ownerDocument.defaultView ?? window,
          canScheduleFrame = typeof ownerWindow.requestAnimationFrame === "function",
          index = 0,
          elapsedFrames = 0,
          settlePlacement = () => {
            elapsedFrames += 1;
            if (elapsedFrames < POPUP_PLACEMENT_SETTLE_FRAMES) {
              index = ownerWindow.requestAnimationFrame(settlePlacement);
              return;
            }
            index = 0;
            let measuredPlacement = readPopupPlacement(element);
            setSettledPlacement((previousPlacement: PopupPlacement | null) =>
              arePopupPlacementsEqual(previousPlacement, measuredPlacement) ? previousPlacement : measuredPlacement,
            );
          },
          observePlacement = () => {
            let measuredPlacement = readPopupPlacement(element);
            setObservedPlacement((previousPlacement: PopupPlacement | null) =>
              arePopupPlacementsEqual(previousPlacement, measuredPlacement) ? previousPlacement : measuredPlacement,
            );
            holdBottomRef.current = placementNeedsBottomHold(measuredPlacement);
            if (!holdBottomRef.current) {
              let popupHeight = ref.current?.getBoundingClientRect().height;
              setHeldHeight(
                popupHeight !== undefined && popupHeight > 0 ? popupHeight : undefined,
              );
            }
            elapsedFrames = 0;
            if (canScheduleFrame && index === 0) {
              index = ownerWindow.requestAnimationFrame(settlePlacement);
            }
          };
        observePlacement();
        let observer = new MutationObserver(observePlacement);
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["data-side", "data-align"],
        });
        stopPositionerObservationRef.current = () => {
          observer.disconnect();
          if (index !== 0) {
            ownerWindow.cancelAnimationFrame(index);
          }
        };
      },
      [],
    ),
    resizeObserverRef = reactStablePopupPlacement.useRef<ResizeObserver | null>(null),
    attachPopup = reactStablePopupPlacement.useCallback(
      (popup: HTMLElement | null): void => {
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;
        ref.current = popup;
        if (!popup) {
          setHeldHeight(undefined);
          return;
        }
        if (!enabled) {
          return;
        }
        let measurePopupHeight = () => {
          let height = popup.getBoundingClientRect().height;
          if (height > 0) {
            setHeldHeight((previousHeight: number | undefined) =>
              holdBottomRef.current && previousHeight !== undefined && height <= previousHeight
                ? previousHeight
                : height,
            );
          }
        };
        measurePopupHeight();
        if (typeof ResizeObserver !== "undefined") {
          let observer = new ResizeObserver(measurePopupHeight);
          observer.observe(popup);
          resizeObserverRef.current = observer;
        }
      },
      [enabled],
    ),
    heldPlacement: Layers.PopupHeldPlacement | null =
      enabled && placementNeedsBottomHold(observedPlacement) && heldHeight !== undefined
        ? {
            positionerStyle: {
              minHeight: `min(${Math.floor(heldHeight)}px, var(--available-height))`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            },
            positionerClassName: heldPositionerClasses,
            popupClassName: heldPopupClasses,
          }
        : null;
  return {
    positionerRef: enabled ? callback : undefined,
    popupRef: attachPopup,
    side: enabled ? (value?.side ?? side) : side,
    align: enabled ? (value?.align ?? align) : align,
    held: heldPlacement,
  };
}
function resolvePlatformWindow(ownerWindow?: Window): Window | undefined {
  return ownerWindow ?? (typeof window === "undefined" ? undefined : window);
}
function matchesWindowMediaQuery(mediaQuery: string, ownerWindow?: Window): boolean {
  let value = resolvePlatformWindow(ownerWindow);
  return (
    typeof value?.matchMedia === "function" && value.matchMedia(mediaQuery).matches
  );
}
function usesImmediateModalRelease(ownerWindow?: Window): boolean {
  let value = resolvePlatformWindow(ownerWindow);
  if (value?.navigator?.userAgent?.includes(ELECTRON_USER_AGENT_TOKEN)) {
    return true;
  }
  return !(
    matchesWindowMediaQuery(TOUCH_DEVICE_QUERY, value) &&
    (value?.navigator?.maxTouchPoints ?? 0) > 0
  );
}
function makeOutsidePortalInert(element: HTMLElement): () => void {
  let items: Element[] = [],
    callback = (target: Element) => {
      let referenceCount = modalInertRefCounts.get(target) ?? 0;
      if (referenceCount === 0) {
        if (target.hasAttribute("inert")) {
          return;
        }
        target.setAttribute("inert", "");
        target.setAttribute("data-cds-sheet-inert", "");
      }
      modalInertRefCounts.set(target, referenceCount + 1);
      items.push(target);
    },
    makeTreeInert = (subtree: Element) => {
      if (
        inertExcludedTags.has(subtree.tagName) ||
        subtree.matches(MODAL_INERT_LIVE_REGION_SELECTOR)
      ) {
        return;
      }
      if (subtree.querySelector(MODAL_INERT_LIVE_REGION_SELECTOR) === null) {
        callback(subtree);
        return;
      }
      for (let child of Array.from(subtree.children)) {
        makeTreeInert(child);
      }
    },
    value = element,
    body = element.ownerDocument.body;
  while (value !== null && value !== body && value.parentElement !== null) {
    let parentElement = value.parentElement,
      portalAncestor = value;
    for (let sibling of Array.from(parentElement.children)) {
      if (sibling !== portalAncestor) {
        makeTreeInert(sibling);
      }
    }
    value = parentElement;
  }
  return () => {
    for (let target of items) {
      let remainingReferences = (modalInertRefCounts.get(target) ?? 1) - 1;
      if (remainingReferences <= 0) {
        modalInertRefCounts.delete(target);
        if (target.hasAttribute("data-cds-sheet-inert")) {
          target.removeAttribute("inert");
          target.removeAttribute("data-cds-sheet-inert");
        }
      } else {
        modalInertRefCounts.set(target, remainingReferences);
      }
    }
  };
}
function useModalPortalInert({
  node: node,
  open: open,
  liftOnClose: liftOnClose,
}: Layers.ModalPortalInertOptions): () => void {
  let value = useRootWindow(),
    getReleaseTiming = useOptionalEventCallback(liftOnClose),
    ref = reactModalPortalInert.useRef<(() => void) | null>(null),
    finishDeferredReleaseRef = reactModalPortalInert.useRef<(() => void) | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!open || node === null || value === undefined) {
      return;
    }
    let inertFrame = value.requestAnimationFrame(() => {
      if (ref.current === null) {
        let portalContainer = findOverlayPortalContainer(node);
        if (portalContainer !== null) {
          ref.current = makeOutsidePortalInert(portalContainer);
        }
      }
    });
    return () => {
      value.cancelAnimationFrame(inertFrame);
      let current = ref.current;
      ref.current = null;
      if (current === null) {
        return;
      }
      if (
        (getReleaseTiming?.() ?? "now") === "now" ||
        !canDelayModalInertRelease(value)
      ) {
        current();
        return;
      }
      let finishDeferredRelease = releaseInertAfterPaint(value, current, () => {
        if (finishDeferredReleaseRef.current === finishDeferredRelease) {
          finishDeferredReleaseRef.current = null;
        }
      });
      finishDeferredReleaseRef.current = finishDeferredRelease;
    };
  }, [node, open, value, getReleaseTiming]);
  return reactModalPortalInert.useCallback(() => finishDeferredReleaseRef.current?.(), []);
}
function canDelayModalInertRelease(ownerWindow: Window): boolean {
  return (
    !usesImmediateModalRelease(ownerWindow) &&
    !isReducedMotion() &&
    ownerWindow.document.visibilityState !== "hidden"
  );
}
function releaseInertAfterPaint(
  ownerWindow: Window,
  release: () => void,
  onReleased: () => void,
): () => void {
  let ownerDocument = ownerWindow.document,
    flag = false,
    callback = () => {
      if (flag) {
        return;
      }
      flag = true;
      ownerWindow.cancelAnimationFrame(value);
      ownerWindow.removeEventListener("pointerdown", callback, true);
      ownerWindow.removeEventListener("keydown", callback, true);
      ownerWindow.removeEventListener("pagehide", callback);
      ownerDocument.removeEventListener("visibilitychange", handleVisibilityChange);
      release();
      onReleased();
    },
    handleVisibilityChange = () => {
      if (ownerDocument.visibilityState === "hidden") {
        callback();
      }
    },
    value = ownerWindow.requestAnimationFrame(() => {
      value = ownerWindow.requestAnimationFrame(callback);
    });
  ownerWindow.addEventListener("pointerdown", callback, true);
  ownerWindow.addEventListener("keydown", callback, true);
  ownerWindow.addEventListener("pagehide", callback);
  ownerDocument.addEventListener("visibilitychange", handleVisibilityChange);
  return callback;
}
function findOverlayPortalContainer(
  element: HTMLElement,
): HTMLElement | null {
  let body = element.ownerDocument.body,
    value: HTMLElement | null = element,
    topmostAncestor: HTMLElement | null = null;
  while (value !== null && value !== body) {
    if (
      value.hasAttribute("data-base-ui-portal") ||
      value.hasAttribute("data-cds-portal")
    ) {
      return value;
    }
    topmostAncestor = value;
    value = value.parentElement;
  }
  return topmostAncestor;
}
function preventModalTabNavigation(
  event: React.KeyboardEvent<HTMLElement>,
): void {
  if (event.key === "Tab") {
    event.preventDefault();
    event.stopPropagation();
  }
}
function coverParentMenuSheet(menuElement: Element, coverToken: object): void {
  let entry = coveredMenuSheetOwners.get(menuElement);
  if (entry === undefined) {
    entry = new Set();
    coveredMenuSheetOwners.set(menuElement, entry);
  }
  entry.add(coverToken);
  menuElement.setAttribute("aria-hidden", "true");
  menuElement.setAttribute(SHEET_DRILLED_ATTRIBUTE, "");
}
function uncoverParentMenuSheet(menuElement: Element, coverToken: object): void {
  let entry = coveredMenuSheetOwners.get(menuElement);
  entry?.delete(coverToken);
  if (entry === undefined || entry.size === 0) {
    menuElement.removeAttribute("aria-hidden");
    menuElement.removeAttribute(SHEET_DRILLED_ATTRIBUTE);
  }
}
function getSheetInertReleaseTiming(
  changeDetails?: Overlays.OverlayEventDetails | null,
): "now" | "after-paint" {
  if (changeDetails?.reason === "outside-press") {
    return "after-paint";
  }
  let value = changeDetails?.event;
  if (
    changeDetails?.reason !== "item-press" ||
    value === undefined ||
    !("detail" in value) ||
    value.detail === 0
  ) {
    return "now";
  }
  let target = value.target;
  if (
    (target !== null && "closest" in target
      ? (target as Element).closest('[role^="menuitem"]')
      : null
    )?.hasAttribute("data-cds-focuses-nothing") === true
  ) {
    return "after-paint";
  } else {
    return "now";
  }
}
function MenuSheetTitleBar({
  nested: nested,
}: {
  nested: boolean;
}): React.ReactElement {
  useUiLocale();
  let value = reactMenuSheetPopup.useContext<Overlays.MenuRootState | null>(
      menuTriggerContext,
    ),
    { label: submenuLabel } =
      reactMenuSheetPopup.useContext<Overlays.MenuItemState>(
        submenuStateContext,
      ),
    sheetLabels = reactMenuSheetPopup.useContext<Overlays.MenuLabels>(
      menuSheetLabelsContext,
    ),
    defaultBackLabel = useTranslation("back", "Back"),
    backLabel = sheetLabels.backLabel ?? defaultBackLabel;
  return (
    <SheetTitleBar
      title={nested ? (submenuLabel) : (sheetLabels.sheetTitle)}
      leading={
        nested ? (
          <baseMenu.Item
            closeOnClick={false}
            onClick={() => value?.close()}
            aria-label={backLabel}
            label={backLabel}
            className={cn(
              menuItemVariants({
                variant: "default",
              }),
              "min-h-control w-auto py-0",
            )}
          >
            <IconSlot
              icon={
                <Icon
                  name={"ArrowLeft"}
                  size={"md"}
                  className={"rtl:-scale-x-100"}
                />
              }
            />
          </baseMenu.Item>
        ) : undefined
      }
    />
  );
}
function MenuSheetCloseButton(): React.ReactElement {
  useUiLocale();
  let value =
      reactMenuSheetPopup.useContext<Overlays.SheetFrameContext | null>(
        sheetFrameContext,
      ),
    defaultCloseLabel = useTranslation("close", "Close"),
    closeLabel =
      reactMenuSheetPopup.useContext(
        menuSheetLabelsContext as React.Context<{
          closeLabel?: string;
        }>,
      ).closeLabel ?? defaultCloseLabel;
  return (
    <baseMenu.Item
      closeOnClick={false}
      onClick={() => value?.dismiss()}
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
        {[<IconSlot icon={"X"} />, <span className={"min-w-0 flex-1 truncate"}>{closeLabel}</span>]}
      </span>
    </baseMenu.Item>
  );
}
function PopoverSheetBackdrop({
  sheetPopup: sheetPopup,
}: {
  sheetPopup: Overlays.SheetRenderState;
}): React.ReactElement {
  useUiLocale();
  return (
    <basePopover.Backdrop
      data-presentation={"sheet"}
      data-sheet-scrim={sheetPopup.frame?.treeId}
      className={
        sheetPopup.state.depth > 0
          ? transparentSheetBackdropClasses
          : sheetBackdropClasses
      }
    />
  );
}
function PopoverSheetBody({
  sheetPopup: sheetPopup,
  className: className,
  bodyRef: bodyRef,
  bodyClassName: bodyClassName,
  closeLabel: closeLabel,
  children: children,
}: Layers.PopoverSheetBodyProps): React.ReactElement {
  useUiLocale();
  let { chrome: value } = sheetPopup;
  return (
    <sheetParentContext.Provider value={sheetPopup.stack}>
      {[<value.Handle />, <value.Body
          className={cn(
            className,
            "h-auto max-h-none min-h-0 w-full min-w-0 max-w-none flex-auto",
          )}
        >
          {[<div
              ref={bodyRef}
              tabIndex={-1}
              data-cds-popover-body={""}
              {...{
                [SHEET_SCROLL_ATTRIBUTE]: "",
              }}
              className={bodyClassName}
            >
              {children}
            </div>, <value.DismissButton
              as={basePopover.Close}
              label={closeLabel}
            />]}
        </value.Body>]}
    </sheetParentContext.Provider>
  );
}
function ContextMenuSheetBackdrop({
  sheetPopup: sheetPopup,
}: {
  sheetPopup: Overlays.SheetRenderState;
}): React.ReactElement {
  useUiLocale();
  return (
    <baseCombobox.Backdrop
      data-presentation={"sheet"}
      data-sheet-scrim={sheetPopup.frame?.treeId}
      className={
        sheetPopup.state.depth > 0
          ? transparentSheetBackdropClasses
          : sheetBackdropClasses
      }
    />
  );
}
function subscribeSheetImplementation(subscriber: () => void): () => void {
  sheetImplementationSubscribers.add(subscriber);
  return () => {
    sheetImplementationSubscribers.delete(subscriber);
  };
}
function loadSheetImplementation(): Promise<Overlays.MobileSheetParts | null> {
  let value = sheetImplementationGeneration;
  sheetImplementationPromise ??= runWithTransition(
    "cds_mobile_sheets",
    () =>
      Promise.resolve().then(() => {
        initializeMobileSheetExports();
        return mobileSheetExports;
      }),
  )
    .then(
      (sheetParts: Overlays.MobileSheetParts | null) =>
        typeof sheetParts === "object" &&
        sheetParts !== null &&
        "SheetPopupHost" in sheetParts
          ? sheetParts
          : null,
      () => null,
    )
    .then((sheetParts: Overlays.MobileSheetParts | null) => {
      if (value !== sheetImplementationGeneration) {
        return sheetParts;
      }
      if (sheetParts === null) {
        sheetImplementationFailed = true;
      } else {
        loadedSheetImplementation = sheetParts;
      }
      for (let subscriber of sheetImplementationSubscribers) {
        subscriber();
      }
      return sheetParts;
    });
  return sheetImplementationPromise!;
}
function preloadSheetImplementation(): void {
  if (loadedSheetImplementation !== null || sheetImplementationFailed) {
    return;
  }
  sheetImplementationRequests += 1;
  loadSheetImplementation();
}
function isSheetImplementationLoaded(): boolean {
  return loadedSheetImplementation !== null;
}
function useSheetImplementationLoaded(): boolean {
  return reactSheetImplementation.useSyncExternalStore(
    subscribeSheetImplementation,
    getSheetImplementationLoadedSnapshot,
    getFalseSheetImplementationSnapshot,
  );
}
function useSheetImplementationFailed(): boolean {
  return reactSheetImplementation.useSyncExternalStore(
    subscribeSheetImplementation,
    getSheetImplementationFailedSnapshot,
    getFalseSheetImplementationSnapshot,
  );
}
function useLoadedSheetImplementation(): Overlays.MobileSheetParts | null {
  return reactSheetImplementation.useSyncExternalStore(
    subscribeSheetImplementation,
    getSheetImplementationSnapshot,
    getNullSheetImplementationSnapshot,
  );
}
function usePreloadSheetsForCoarsePointer(
  enabled: boolean,
  ownerWindow: Window | undefined,
): void {
  let value = useMediaQuery__U(
    enabled ? ownerWindow : undefined,
    COARSE_POINTER_QUERY_rG,
  );
  reactPreloadSheets.useEffect(() => {
    if (enabled && value) {
      preloadSheetImplementation();
    }
  }, [enabled, value]);
}
function detectCdsPlatform(): Layers.CdsPlatform {
  if (typeof navigator === "undefined") {
    return "web";
  }
  if (desktopPlatformUserAgentPattern.test(navigator.userAgent)) {
    return "desktop";
  } else {
    return "web";
  }
}
function reportLinkSanitizationDebug(
  originalHref: string,
  sanitizedHref: string,
  reason: string,
): void {
  return;
}
function truncateLinkDebugValue(items: string): string {
  if (items.length <= MAX_LINK_DEBUG_LENGTH) {
    return items;
  }
  let value = items.charCodeAt(119),
    cutoff = value >= 55296 && value <= 56319 ? 119 : MAX_LINK_DEBUG_LENGTH;
  return `${items.slice(0, cutoff)}…`;
}
function normalizeHrefWhitespace(href: string): string {
  let value = href.replace(linkWhitespacePattern, ""),
    index = 0,
    length = value.length;
  while (index < length && value.charCodeAt(index) <= 32) {
    index++;
  }
  while (length > index && value.charCodeAt(length - 1) <= 32) {
    length--;
  }
  if (index === 0 && length === value.length) {
    return value;
  } else {
    return value.slice(index, length);
  }
}
function isSanitizedHrefFallback(
  originalHref: string | undefined,
  sanitizedHref: string | undefined,
): boolean {
  return (
    sanitizedHref === "#" &&
    originalHref !== undefined &&
    normalizeHrefWhitespace(originalHref) !== "#"
  );
}
function opensInSeparateBrowsingContext(
  target: string | null | undefined,
): boolean {
  return !!target && !existingBrowsingContextNames.has(target.toLowerCase());
}
function normalizeLinkRel(
  target: string | null | undefined,
  rel: string | null | undefined,
  getDefaultRel: () => string,
): string | undefined {
  if (!opensInSeparateBrowsingContext(target)) {
    return rel ?? undefined;
  }
  if (rel === undefined || rel === null) {
    return getDefaultRel();
  }
  let value = rel
    .split(/\s+/)
    .filter(
      (token: string) => token !== "" && token.toLowerCase() !== "opener",
    );
  if (
    !value.some((token: string) => unsafeLinkRelTokenPattern.test(token))
  ) {
    value.push("noopener");
  }
  return value.join(" ");
}
function useCdsRouter(): Overlays.LinkRouter | undefined {
  return reactCdsLink.useContext(cdsRouterContext);
}
function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) {
    return href;
  }
  let value = normalizeHrefWhitespace(href);
  if (forbiddenHrefControlCharacterPattern.test(value)) {
    return rejectUnsafeHref(value, uiMessage("design-system.overlays.itContainsAControlCharacter"));
  }
  if (leadingHrefWhitespacePattern.test(value)) {
    return rejectUnsafeHref(
      value,
      uiMessage("design-system.overlays.itStartsWithWhitespaceThe"),
    );
  }
  if (absoluteHrefPattern.test(value)) {
    if (value.startsWith("//")) {
      return value;
    }
    if (androidIntentHrefPattern.test(value)) {
      if (isAllowedAndroidIntentHref(value)) {
        return value;
      } else {
        return rejectUnsafeHref(
          value,
          uiMessage("design-system.overlays.onlyAnAnthropicAndroidApp"),
        );
      }
    }
    if (editorHrefSchemePattern.test(value)) {
      if (isAllowedEditorHref(value)) {
        return value;
      } else {
        return rejectUnsafeHref(
          value,
          uiMessage("design-system.overlays.onlyAnAnthropicExtensionS"),
        );
      }
    }
    if (!allowedHrefSchemePattern.test(value)) {
      return rejectUnsafeHref(
        value,
        uiMessage("design-system.overlays.itsSchemeIsNotOne"),
      );
    }
    return value;
  }
  return validateRelativeHref(value);
}
function rejectUnsafeHref(href: string, reason: string): string {
  reportLinkSanitizationDebug(href, "#", reason);
  return "#";
}
function validateRelativeHref(href: string): string {
  let value = networkPathHrefPattern.test(href);
  try {
    let parsedUrl = new URL(href, HTTPS_RELATIVE_HREF_BASE),
      resolvedPath =
        parsedUrl.pathname.replace(/^\/{2,}/, "/") + parsedUrl.search + parsedUrl.hash;
    if (
      value ||
      parsedUrl.origin !== HTTPS_RELATIVE_HREF_BASE ||
      parsedUrl.pathname.startsWith("//")
    ) {
      reportLinkSanitizationDebug(
        href,
        resolvedPath,
        value || parsedUrl.origin !== HTTPS_RELATIVE_HREF_BASE
          ? "it reads as a path but names a host"
          : "its dot segments resolve to a path that would re-read as protocol-relative",
      );
      return resolvedPath;
    }
    if (hasUnsafeRelativePath(href)) {
      reportLinkSanitizationDebug(
        href,
        resolvedPath,
        "its path has a backslash or dot segment, which the browser resolves before navigating",
      );
      return resolvedPath;
    }
    let originalPath = getHrefPathBeforeQuery(href);
    if (
      unrootedHrefPattern.test(href) &&
      encodedOrBackslashPathPattern.test(originalPath) &&
      !parsedUrl.pathname.startsWith("//")
    ) {
      let normalizedPath = originalPath
        .replaceAll("\\", "/")
        .split("/")
        .map((segment: string) =>
          dotSegmentPattern.test(segment)
            ? segment.replace(/%2e/gi, ".")
            : segment,
        )
        .join("/");
      if (normalizedPath !== originalPath) {
        let normalizedHref = normalizedPath + href.slice(originalPath.length);
        reportLinkSanitizationDebug(
          href,
          normalizedHref,
          "its path has a backslash or a %2e-spelled dot segment, which the browser reads as a plain slash or dot",
        );
        return normalizedHref;
      }
    }
  } catch {
    if (value) {
      return rejectUnsafeHref(
        href,
        uiMessage("design-system.overlays.itNamesAHostThis"),
      );
    }
  }
  return href;
}
function hasUnsafeRelativePath(path: string): boolean {
  if (!rootRelativeHrefPattern.test(path)) {
    return false;
  }
  let value = getHrefPathBeforeQuery(path);
  return value.includes("\\") || relativePathDotSegmentPattern.test(value);
}
function getHrefPathBeforeQuery(href: string): string {
  let value = href.search(/[?#]/);
  if (value < 0) {
    return href;
  } else {
    return href.slice(0, value);
  }
}
function isAllowedEditorHref(href: string): boolean {
  return allowedEditorHrefPattern.test(
    href.replace(editorHrefSchemePattern, (scheme: string) =>
      scheme.toLowerCase(),
    ),
  );
}
function isAllowedAndroidIntentHref(href: string): boolean {
  if (!androidIntentHrefPattern.test(href)) {
    return false;
  }
  let value = href.indexOf("#");
  if (value < 0 || href.indexOf("#", value + 1) >= 0) {
    return false;
  }
  let intentFragment = href.slice(value + 1);
  if (!intentFragment.startsWith("Intent;") || !intentFragment.endsWith(";end")) {
    return false;
  }
  let properties = intentFragment.slice(7, -4),
    entries = new Map<string, string>();
  for (let property of properties.split(";")) {
    let separatorIndex = property.indexOf("=");
    if (separatorIndex <= 0) {
      return false;
    }
    let propertyName = property.slice(0, separatorIndex);
    if (entries.has(propertyName) || !allowedIntentPropertyNames.has(propertyName)) {
      return false;
    }
    entries.set(propertyName, property.slice(separatorIndex + 1));
  }
  let entry = entries.get("package");
  if (
    entry === undefined ||
    !trustedAndroidIntentPackages.has(entry) ||
    entries.get("scheme") !== "https"
  ) {
    return false;
  }
  let fallbackUrl = entries.get("S.browser_fallback_url");
  if (fallbackUrl === undefined) {
    return true;
  }
  try {
    return new URL(decodeURIComponent(fallbackUrl)).protocol === "https:";
  } catch {
    return false;
  }
}
function classifyHrefOrigin(href: string, baseOrigin: string): HrefOrigin {
  let value: URL;
  try {
    value = new URL(href, baseOrigin);
  } catch {
    return "other";
  }
  if (value.origin === baseOrigin) {
    return "relative";
  }
  if (value.protocol !== "https:" && value.protocol !== "http:") {
    return "other";
  }
  let hostname = value.hostname;
  if (
    trustedAnthropicDomains.some(
      (trustedDomain: string) =>
        hostname === trustedDomain || hostname.endsWith("." + trustedDomain),
    )
  ) {
    return "first-party";
  } else {
    return "other";
  }
}
function isOriginStableHref(href: string | undefined): boolean {
  if (!href) {
    return false;
  }
  let value = classifyHrefOrigin(href, HTTPS_RELATIVE_HREF_BASE);
  return (
    value !== "other" &&
    value === classifyHrefOrigin(href, HTTP_RELATIVE_HREF_BASE)
  );
}
function getSeparateContextRel(href: string | undefined): string {
  if (isOriginStableHref(href)) {
    return "noopener";
  } else {
    return "noopener noreferrer";
  }
}
function getAutomaticLinkRel(
  href: string | undefined,
  target: string | null | undefined,
): string | undefined {
  let value = sanitizeHref(href);
  if (opensInSeparateBrowsingContext(target)) {
    return getSeparateContextRel(value);
  }
  if (isOriginStableHref(value)) {
    return undefined;
  } else {
    return "noreferrer";
  }
}
function isSameOriginHref(href: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    let value = new URL(href, window.location.href);
    return (
      value.origin !== "null" &&
      value.protocol === window.location.protocol &&
      value.origin === window.location.origin
    );
  } catch {
    return false;
  }
}
function shouldHandleLinkWithRouter(event: Layers.LinkCandidate): boolean {
  if (!event.router || !event.href || event.href.startsWith("#")) {
    return false;
  }
  if (event.target && event.target.toLowerCase() !== "_self") {
    return false;
  }
  if (
    event.download !== null &&
    event.download !== undefined &&
    event.download !== false
  ) {
    return false;
  }
  return isSameOriginHref(event.href);
}
function normalizeRouterHref(href: string): string {
  if (!absoluteHrefPattern.test(href)) {
    return href;
  }
  let value = new URL(href, window.location.href);
  return value.pathname.replace(/^\/{2,}/, "/") + value.search + value.hash;
}
function isModifiedLinkClick(clickEvent: Layers.LinkClickEvent): boolean {
  return (
    clickEvent.defaultPrevented ||
    clickEvent.button !== 0 ||
    clickEvent.metaKey ||
    clickEvent.ctrlKey ||
    clickEvent.shiftKey ||
    clickEvent.altKey
  );
}
function pickLinkEventProps(
  linkProps: Overlays.RouterEvents,
): Overlays.RouterEvents {
  let value = linkProps,
    state: Layers.LinkEvents = {};
  for (let eventName of linkEventPropNames) {
    if (value[eventName] !== undefined) {
      state[eventName] = value[eventName];
    }
  }
  return state;
}
function omitLinkEventProps<Props extends Overlays.RouterEvents>(
  props: Props,
): Omit<Props, Layers.LinkEventName> {
  let state = {
    ...props,
  };
  for (let value of linkEventPropNames) {
    delete state[value];
  }
  return state;
}
function composeLinkEventHandlers<
  Event extends React.SyntheticEvent<HTMLElement>,
>(
  userHandler: React.EventHandler<Event> | undefined,
  routerHandler: React.EventHandler<Event> | undefined,
  respectDefaultPrevented?: boolean,
): ((event: Event) => void) | undefined {
  if (!routerHandler) {
    return userHandler;
  }
  return (event: Event) => {
    userHandler?.(event);
    if (!respectDefaultPrevented || !event.defaultPrevented) {
      routerHandler(event);
    }
  };
}
function useCdsLink({
  href: href,
  routerOptions: routerOptions,
  target: target,
  rel: rel,
  download: download,
  onClick: onClick,
  onPointerEnter: onPointerEnter,
  onPointerLeave: onPointerLeave,
  onPointerDown: onPointerDown,
  onFocus: onFocus,
  onBlur: onBlur,
}: Overlays.LinkInput): Overlays.LinkAttributes {
  let router = useCdsRouter(),
    safeHref = sanitizeHref(href),
    hrefRejected = isSanitizedHrefFallback(href, safeHref),
    safeTarget = hrefRejected ? undefined : target,
    safeDownload = hrefRejected ? undefined : download,
    resolvedHref =
      router?.resolveHref &&
      safeHref &&
      !safeHref.startsWith("#") &&
      !absoluteHrefPattern.test(safeHref)
        ? router.resolveHref(safeHref)
        : safeHref,
    hasRouter = router !== undefined,
    routerHref = reactCdsLink.useMemo(() => {
      let state = {
        href: safeHref,
        target: safeTarget,
        download: safeDownload,
        router: hasRouter,
      };
      if (shouldHandleLinkWithRouter(state)) {
        return normalizeRouterHref(state.href!);
      } else {
        return undefined;
      }
    }, [safeHref, safeTarget, safeDownload, hasRouter]),
    handleClick = reactCdsLink.useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (
          isModifiedLinkClick(event) ||
          routerHref === undefined ||
          !router
        ) {
          return;
        }
        event.preventDefault();
        router.navigate(routerHref, routerOptions);
      },
      [onClick, routerHref, router, routerOptions],
    ),
    intentHandlers = router?.intentHandlers,
    routerIntentHandlers = reactCdsLink.useMemo(
      () =>
        intentHandlers && routerHref !== undefined
          ? intentHandlers(routerHref)
          : undefined,
      [intentHandlers, routerHref],
    ),
    combinedIntentHandlers = reactCdsLink.useMemo(() => {
      let state = {
          onPointerEnter: onPointerEnter,
          onPointerLeave: onPointerLeave,
          onPointerDown: onPointerDown,
          onFocus: onFocus,
          onBlur: onBlur,
        },
        prefetchHandlers: Layers.LinkEvents = {};
      for (let value of linkPrefetchEventNames) {
        let composedHandler = composeLinkEventHandlers<
          React.SyntheticEvent<HTMLElement>
        >(
          state[value],
          routerIntentHandlers?.[value],
          linkPrefetchEventKinds[value],
        );
        if (composedHandler) {
          prefetchHandlers[value] = composedHandler;
        }
      }
      return prefetchHandlers;
    }, [
      routerIntentHandlers,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onFocus,
      onBlur,
    ]);
  return {
    href: resolvedHref,
    target: safeTarget,
    rel: normalizeLinkRel(safeTarget, rel, () =>
      getSeparateContextRel(resolvedHref),
    ),
    download: safeDownload,
    onClick: handleClick,
    ...combinedIntentHandlers,
  };
}
function getElementWindow(
  element: Element | null | undefined,
): Window | undefined {
  return element?.ownerDocument.defaultView ?? globalThis.window;
}
function elementHasUnavailableWindow(element: Element | undefined): boolean {
  return (
    element !== undefined &&
    (!element.isConnected || element.ownerDocument.defaultView === null)
  );
}
function getConnectedElementWindow(
  element: Element | undefined,
): Window | undefined {
  if (elementHasUnavailableWindow(element)) {
    return;
  }
  return getElementWindow(element);
}
function hasCdsHtmlFontSizing(element: HTMLElement): boolean {
  return (
    element === element.ownerDocument.documentElement &&
    element.style.fontSize.includes("--cds-font-size-body")
  );
}
function migrateCdsHtmlFontSizing(): void {
  if (hasMigratedHtmlFontSizing || typeof document === "undefined") {
    return;
  }
  hasMigratedHtmlFontSizing = true;
  try {
    let items: string[] = [],
      values = new Set<string>(),
      callback = (layerName: string | null | undefined) => {
        if (!layerName) {
          return;
        }
        let rootLayerName = layerName.split(".")[0] ?? layerName;
        if (!values.has(rootLayerName)) {
          values.add(rootLayerName);
          items.push(rootLayerName);
        }
      },
      collectSheetLayers = (stylesheet: CSSStyleSheet) => {
        let rules: CSSRuleList;
        try {
          rules = stylesheet.cssRules;
        } catch {
          return;
        }
        for (let rule of rules) {
          let name = rule.constructor.name;
          if (name === "CSSLayerStatementRule") {
            for (let layerName of (rule as CSSLayerStatementRule).nameList) {
              callback(layerName);
            }
          } else if (name === "CSSLayerBlockRule") {
            callback((rule as CSSLayerBlockRule).name);
          } else if (name === "CSSImportRule") {
            let importRule = rule as CSSImportRule;
            callback(importRule.layerName);
            if (importRule.styleSheet) {
              collectSheetLayers(importRule.styleSheet);
            }
          }
        }
      };
    for (let stylesheet of document.styleSheets) {
      collectSheetLayers(stylesheet);
    }
    let value = items.indexOf("utilities");
    if (value === -1) {
      return;
    }
    let cardLayerIndex = items.indexOf("cds-card");
    if (cardLayerIndex === -1 || cardLayerIndex > value) {
      console.error(
        "cds: the `cds-card` cascade layer is " +
          (cardLayerIndex === -1 ? "not declared" : "declared after `utilities`") +
          " in this document, so Card's stretched-link lift rules outrank consumer positioning utilities — `absolute`/`z-*` on interactive children inside <Card> will silently lose, and a `backgroundClassName` surface override stops applying, since the fill layer's resting color and hover step sit in the same layer and must rank below consumer utilities to be overridable. Fix: add `@layer cds-card;` before the `@import \"tailwindcss\"` line in this app's Tailwind entry CSS (see packages/cds/src/component-base.css § cds-card).",
      );
    }
  } catch {}
}
function getControlSizeAttributes(size?: ControlSize): {
  "data-size"?: Exclude<ControlSize, "base">;
} {
  if (size && size !== "base") {
    return {
      "data-size": size,
    };
  } else {
    return {};
  }
}
function getDensitySizeIndex(density: Density, size?: ControlSize): number {
  let value =
    densitySizeIndices[density] + controlSizeOffsets[size ?? "base"]!;
  if (value < 1) {
    return 1;
  } else {
    if (value > 5) {
      return 5;
    } else {
      return value;
    }
  }
}
function createColorModeStore(
  configuredMode: Layers.ConfiguredColorMode | undefined,
): Layers.ColorModeStore {
  let element: HTMLElement | null = null,
    inheritedModeAttribute =
      configuredMode === undefined && typeof document !== "undefined"
        ? document.documentElement.getAttribute("data-mode")
        : null,
    getSetting = () =>
      configuredMode ?? normalizeColorMode(inheritedModeAttribute),
    modeFromDarkPreference = (prefersDark: boolean): ColorMode =>
      prefersDark ? "dark" : "light",
    colorSchemeMedia: MediaQueryList | undefined,
    systemColorMode: ColorMode | undefined,
    initialized = false,
    initialize = () => {
      if (initialized) {
        return;
      }
      initialized = true;
      colorSchemeMedia =
        configuredMode !== "light" &&
        configuredMode !== "dark" &&
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function"
          ? window.matchMedia(DARK_COLOR_SCHEME_QUERY)
          : undefined;
      systemColorMode = colorSchemeMedia
        ? modeFromDarkPreference(colorSchemeMedia.matches)
        : undefined;
    },
    readInheritedMode = () => {
      if (element) {
        inheritedModeAttribute =
          element.closest("[data-mode]")?.getAttribute("data-mode") ??
          (element.isConnected
            ? null
            : document.documentElement.getAttribute("data-mode"));
      }
    },
    explicitColorMode = (
      mode: Layers.ConfiguredColorMode | undefined,
    ): ColorMode | undefined =>
      mode === "light" || mode === "dark" ? mode : undefined,
    listeners = new Set<() => void>(),
    notify = () => listeners.forEach((listener: () => void) => listener()),
    changedBeforeSubscription = false,
    startObserving = () => {
      let items: (() => void)[] = [];
      initialize();
      let value = colorSchemeMedia;
      if (value) {
        let callback = () => {
          systemColorMode = modeFromDarkPreference(value.matches);
          notify();
        };
        value.addEventListener("change", callback);
        items.push(() => value.removeEventListener("change", callback));
        let currentSystemMode = modeFromDarkPreference(value.matches);
        if (currentSystemMode !== systemColorMode) {
          systemColorMode = currentSystemMode;
          changedBeforeSubscription = true;
        }
      }
      if (
        configuredMode === undefined &&
        typeof MutationObserver !== "undefined"
      ) {
        let initialInheritedMode = inheritedModeAttribute;
        readInheritedMode();
        if (inheritedModeAttribute !== initialInheritedMode) {
          changedBeforeSubscription = true;
        }
        let modeObserver = createSafeMutationObserver(
          MutationObserver,
          () => {
            let previousInheritedMode = inheritedModeAttribute;
            readInheritedMode();
            if (inheritedModeAttribute !== previousInheritedMode) {
              notify();
            }
          },
        );
        modeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-mode"],
          subtree: true,
        });
        items.push(() => modeObserver.disconnect());
      }
      if (changedBeforeSubscription) {
        changedBeforeSubscription = false;
        queueMicrotask(notify);
      }
      return () => items.forEach((unsubscribe: () => void) => unsubscribe());
    },
    stopObserving: (() => void) | undefined;
  return {
    setElement: (nextElement: HTMLElement | null) => {
      element = nextElement;
      if (configuredMode === undefined && nextElement !== null) {
        let value = inheritedModeAttribute;
        readInheritedMode();
        if (inheritedModeAttribute !== value && listeners.size === 0) {
          changedBeforeSubscription = true;
        }
        notify();
      }
    },
    subscribe: (listener: () => void) => {
      if (listeners.size === 0) {
        stopObserving = startObserving();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stopObserving?.();
          stopObserving = undefined;
        }
      };
    },
    getSnapshot: () => {
      initialize();
      return explicitColorMode(getSetting()) ?? systemColorMode;
    },
    getServerSnapshot: () => explicitColorMode(configuredMode),
    getAttrSnapshot: () => {
      initialize();
      if (configuredMode !== undefined) {
        return (
          explicitColorMode(configuredMode) ??
          systemColorMode ??
          configuredMode
        );
      } else {
        return undefined;
      }
    },
    getServerAttrSnapshot: () => configuredMode,
    getSettingSnapshot: () => getSetting(),
    getServerSettingSnapshot: () => configuredMode,
  };
}
function usePageBackground(): string | undefined {
  return reactCdsRoot.useContext(pageBackgroundContext);
}
function useDensity(): Density {
  return reactCdsRoot.useContext(densityContext);
}
function useResolvedColorMode(): ColorMode {
  return useColorMode() ?? "light";
}
function useColorMode(): ColorMode | undefined {
  let value =
    reactCdsRoot.useContext(colorModeStoreContext) ?? defaultColorModeStore;
  return reactCdsRoot.useSyncExternalStore(
    value.subscribe,
    value.getSnapshot,
    value.getServerSnapshot,
  );
}
function usePlatform(): Layers.CdsPlatform | undefined {
  return reactCdsRoot.useContext(platformContext) ?? "web";
}
function useFont(): Layers.CdsFont | undefined {
  return reactCdsRoot.useContext(fontContext);
}
function useMonospaceFont(): string | null | undefined {
  return reactCdsRoot.useContext(monospaceFontContext);
}
function getMonospaceOverrideStyle(font?: string | null): DesignStyle {
  if (font === null) {
    return {
      "--cds-font-mono-override": "initial",
    };
  }
  let value = font?.trim();
  if (!value) {
    return {};
  }
  return {
    "--cds-font-mono-override": `"${value
        .replaceAll(/[\u0000-\u001f\u007f]/g, "")
        .replaceAll("\\", "\\\\")
        .replaceAll('"', '\\"')}",`,
  };
}
function useSurfaceBackground(): string | undefined {
  return reactCdsRoot.useContext(surfaceBackgroundContext);
}
function getSurfaceBackgroundStyle(background?: string): DesignStyle {
  if (!background) {
    return {};
  }
  return {
    "--cds-page-bg": isSurfaceToken(background)
      ? `var(--cds-${background})`
      : sanitizeCssBackground(background),
    ...(isTintedFillSurface(background) ? opaqueTintOverrides : {}),
  };
}
function isTintedFillSurface(background: string): boolean {
  return isSurfaceToken(background) && background.startsWith("fill-");
}
function sanitizeCssBackground(background: string): string {
  return background.replaceAll(/[\u0000-\u001f\u007f;{}*]/g, "");
}
function isSurfaceToken(background: string): boolean {
  return surfaceTokenNames.has(background);
}
function useCdsLocale(): string | undefined {
  return reactCdsRoot.useContext(localeContext);
}
function useRootElement(): HTMLElement | undefined {
  return reactCdsRoot.useContext(rootElementContext);
}
function usePortalContainer(): Layers.PortalContainer {
  let value = reactCdsRoot.useContext(rootElementContext),
    rootPortalContainer = reactCdsRoot.useContext(rootPortalContainerContext),
    insidePortalRoot = reactCdsRoot.useContext(isPortalRootContext);
  return value ?? (insidePortalRoot ? undefined : rootPortalContainer);
}
function useRootWindow(): Window | undefined {
  return getElementWindow(reactCdsRoot.useContext(rootElementContext));
}
function CdsRoot({
  density: density,
  mode: mode,
  platform: platform,
  font: font,
  fontMono: fontMono,
  pageBackground: pageBackground,
  locale: locale,
  router: router,
  labels: labels,
  experimental: experimental,
  render: render,
  className: className,
  children: children,
}: Layers.CdsRootProps): React.ReactElement {
  useUiLocale();
  let parentDensity = reactCdsRoot.useContext(densityContext),
    parentPlatform = reactCdsRoot.useContext(platformContext),
    parentFont = reactCdsRoot.useContext(fontContext),
    parentPageBackground = reactCdsRoot.useContext(pageBackgroundContext),
    parentRouter = useCdsRouter(),
    parentLabels = reactCdsRoot.useContext(translationContext),
    parentDensityOverride = reactCdsRoot.useContext(densityOverrideContext),
    densityOverride = experimental?.densityOverride ?? parentDensityOverride,
    coarsePointer = reactCdsRoot.useSyncExternalStore(
      subscribeRootCoarsePointer,
      getCoarsePointerSnapshot,
      getCoarsePointerServerSnapshot,
    ),
    resolvedDensity =
      densityOverride ??
      (coarsePointer ? "comfortable" : (density ?? parentDensity)),
    resolvedRouter = router ?? parentRouter,
    resolvedLabels = reactCdsRoot.useMemo(
      () =>
        labels && parentLabels
          ? (
              messageKey: string,
              fallback: string,
              values?: Overlays.LabelValues,
            ) =>
              labels(messageKey, fallback, values) ||
              parentLabels(messageKey, fallback, values)
          : (labels ?? parentLabels),
      [labels, parentLabels],
    ),
    parentNaturalImageTiles = reactCdsRoot.useContext(
      naturalImageTilesContext,
    ),
    naturalImageTiles =
      experimental?.naturalImageTiles ?? parentNaturalImageTiles,
    featureFlagNames = mergeFeatureFlagNames(
      reactCdsRoot.useContext(featureFlagContext),
      experimental?.fizzyLake?.parts,
    );
  usePreloadSheetsForCoarsePointer(parentFont === undefined, useRootWindow());
  let parentFontMono = reactCdsRoot.useContext(monospaceFontContext),
    resolvedFontMono =
      fontMono === null
        ? null
        : ((fontMono?.trim() ? fontMono.trim() : undefined) ??
          parentFontMono),
    resolvedPageBackground = pageBackground ?? parentPageBackground,
    parentSurfaceBackground = reactCdsRoot.useContext(
      surfaceBackgroundContext,
    ),
    resolvedSurfaceBackground = pageBackground ?? parentSurfaceBackground,
    parentLocale = reactCdsRoot.useContext(localeContext),
    normalizedLocale = locale?.trim() ? locale.trim() : undefined,
    resolvedLocale = normalizedLocale ?? parentLocale,
    detectedPlatform = reactCdsRoot.useSyncExternalStore(
      subscribePlatformNoop,
      detectCdsPlatform,
      getWebPlatformSnapshot,
    ),
    resolvedPlatform = platform ?? parentPlatform ?? detectedPlatform,
    elementRef = reactCdsRoot.useRef<HTMLElement | null>(null),
    parentColorModeStore = reactCdsRoot.useContext(colorModeStoreContext),
    ownsColorModeStore =
      mode !== undefined || parentColorModeStore === undefined,
    [colorModeState, setColorModeState] = reactCdsRoot.useState(() =>
      ownsColorModeStore
        ? {
            mode: mode,
            scope: createColorModeStore(mode),
          }
        : null,
    ),
    inheritedColorModeStore = ownsColorModeStore
      ? undefined
      : parentColorModeStore,
    colorModeStore: Layers.ColorModeStore;
  if (inheritedColorModeStore !== undefined) {
    colorModeStore = inheritedColorModeStore;
  } else if (colorModeState !== null && colorModeState.mode === mode) {
    colorModeStore = colorModeState.scope;
  } else {
    colorModeStore = createColorModeStore(mode);
    setColorModeState({
      mode: mode,
      scope: colorModeStore,
    });
  }
  useIsomorphicLayoutEffect(() => {
    registerInputDismissalTracking(
      elementRef.current?.ownerDocument,
    );
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (!ownsColorModeStore) {
      return;
    }
    colorModeStore.setElement(elementRef.current);
    return () => colorModeStore.setElement(null);
  }, [ownsColorModeStore, colorModeStore]);
  let themeStore = useExperimentalThemeStore(
      experimental?.theme,
      elementRef,
    ),
    colorModeAttribute = reactCdsRoot.useSyncExternalStore(
      colorModeStore.subscribe,
      ownsColorModeStore
        ? colorModeStore.getAttrSnapshot
        : colorModeStore.getSnapshot,
      ownsColorModeStore
        ? colorModeStore.getServerAttrSnapshot
        : colorModeStore.getServerSnapshot,
    );
  reactCdsRoot.useEffect(() => {
    return;
  }, [normalizedLocale]);
  let debugWarningsEnabled = false;
  reactCdsRoot.useEffect(() => {
    return;
  }, [debugWarningsEnabled]);
  reactCdsRoot.useEffect(() => {
    return;
  }, []);
  let renderElement = render;
  if (
    typeof renderElement === "object" &&
    renderElement !== null &&
    (
      renderElement as {
        $$typeof?: symbol;
      }
    ).$$typeof === Symbol.for("react.lazy")
  ) {
    renderElement = reactCdsRoot.Children.toArray(
      renderElement,
    )[0] as React.ReactElement<Layers.RootRenderProps>;
  }
  let isHtmlRoot =
      reactCdsRoot.isValidElement(renderElement) &&
      renderElement.type === "html",
    documentFont = useDocumentFont(
      font === undefined && parentFont === undefined && !isHtmlRoot,
    ),
    resolvedFont = font ?? parentFont ?? documentFont ?? "anthropic",
    rootElement = baseUseRender({
      render: renderElement,
      defaultTagName: "div",
      ref: elementRef,
      props: {
        className: cn("cds-root text-primary", className),
        "data-density": resolvedDensity,
        "data-mode": colorModeAttribute,
        "data-platform": resolvedPlatform,
        "data-font": resolvedFont,
        "data-cds-fizzy-lake": featureFlagNames,
        "data-page-bg": resolvedPageBackground,
        style: {
          ...(!isHtmlRoot && {
            fontSize: "var(--cds-font-size-body)",
          }),
          ...getSurfaceBackgroundStyle(resolvedSurfaceBackground),
          ...getMonospaceOverrideStyle(resolvedFontMono),
        },
        children: children,
      },
    });
  return (
    <densityContext.Provider value={resolvedDensity}>
      <colorModeStoreContext.Provider value={colorModeStore}>
        <platformContext.Provider value={resolvedPlatform}>
          <fontContext.Provider value={resolvedFont}>
            <monospaceFontContext.Provider value={resolvedFontMono}>
              <pageBackgroundContext.Provider value={resolvedPageBackground}>
                <surfaceBackgroundContext.Provider
                  value={resolvedSurfaceBackground}
                >
                  <localeContext.Provider value={resolvedLocale}>
                    <cdsRouterContext.Provider value={resolvedRouter}>
                      <translationContext.Provider
                        value={resolvedLabels}
                      >
                        <naturalImageTilesContext.Provider
                          value={naturalImageTiles}
                        >
                          <densityOverrideContext.Provider
                            value={densityOverride}
                          >
                            <themeStoreContext.Provider
                              value={themeStore}
                            >
                              <featureFlagContext.Provider
                                value={featureFlagNames}
                              >
                                {rootElement}
                              </featureFlagContext.Provider>
                            </themeStoreContext.Provider>
                          </densityOverrideContext.Provider>
                        </naturalImageTilesContext.Provider>
                      </translationContext.Provider>
                    </cdsRouterContext.Provider>
                  </localeContext.Provider>
                </surfaceBackgroundContext.Provider>
              </pageBackgroundContext.Provider>
            </monospaceFontContext.Provider>
          </fontContext.Provider>
        </platformContext.Provider>
      </colorModeStoreContext.Provider>
    </densityContext.Provider>
  );
}
export {
  absoluteHrefPattern,
  allowedEditorHrefPattern,
  allowedHrefSchemePattern,
  allowedIntentPropertyNames,
  androidIntentHrefPattern,
  arePopupPlacementsEqual,
  calculateScrollbarThickness,
  canDelayModalInertRelease,
  CdsRoot,
  cdsRouterContext,
  classifyHrefOrigin,
  classifyOpenInputType,
  closestWithinElement,
  colorModeStoreContext,
  composeLinkEventHandlers,
  contextMenuPopupClasses,
  ContextMenuPopupFrame,
  ContextMenuSheetBackdrop,
  controlSizeOffsets,
  coveredMenuSheetOwners,
  coverParentMenuSheet,
  createColorModeStore,
  createOverlayStack,
  createPassiveOpenState,
  DARK_COLOR_SCHEME_QUERY,
  declinesInitialFocus,
  defaultColorModeStore,
  densityContext,
  densityOverrideContext,
  densitySizeIndices,
  desktopPlatformUserAgentPattern,
  detectCdsPlatform,
  DOCUMENT_NODE_TYPE,
  dotSegmentPattern,
  DRAGGABLE_ELEMENT_SELECTOR,
  editorHrefSchemePattern,
  ELECTRON_USER_AGENT_TOKEN,
  elementHasUnavailableWindow,
  elementIsWithin,
  encodedOrBackslashPathPattern,
  existingBrowsingContextNames,
  findOverlayPortalContainer,
  fontContext,
  forbiddenHrefControlCharacterPattern,
  FORM_POINTER_FOCUS_SELECTOR,
  getAutomaticLinkRel,
  getCoarsePointerServerSnapshot,
  getConnectedElementWindow,
  getControlSizeAttributes,
  getDensitySizeIndex,
  getDocumentIfAvailable,
  getElementWindow,
  getFalseSheetImplementationSnapshot,
  getFocusedElement,
  getHrefPathBeforeQuery,
  getMonospaceOverrideStyle,
  getNullSheetImplementationSnapshot,
  getPassiveOffSnapshot,
  getSeparateContextRel,
  getSheetImplementationFailedSnapshot,
  getSheetImplementationLoadedSnapshot,
  getSheetImplementationSnapshot,
  getSheetInertReleaseTiming,
  getSurfaceBackgroundStyle,
  getWebPlatformSnapshot,
  hasCdsHtmlFontSizing,
  hasMigratedHtmlFontSizing,
  hasUnsafeRelativePath,
  heldPopupClasses,
  heldPositionerClasses,
  HTTP_RELATIVE_HREF_BASE,
  HTTPS_RELATIVE_HREF_BASE,
  inertExcludedTags,
  initializeCdsLink,
  initializeCdsPlatform,
  initializeCdsRoot,
  initializeClickToFocus,
  initializeComboboxSheetBackdrop,
  initializeContextMenuPopup,
  initializeElementWindow,
  initializeHrefWhitespace,
  initializeLinkTargets,
  initializeLinkWarnings,
  initializeMenuItemVariants,
  initializeMenuOpener,
  initializeMenuOverlayRegistration,
  initializeMenuPopupElement,
  initializeMenuSheetPopup,
  initializeMobileSheetExports,
  initializeModalPortalInert,
  initializeModalReleasePlatform,
  initializeOverlayFocus,
  initializeOverlayOwners,
  initializeOverlaySelector,
  initializeOverlayStack,
  initializePassiveOpen,
  initializePopoverSheetContent,
  initializePopupPointerFocus,
  initializePreloadSheets,
  initializeSheetImplementation,
  initializeStablePopupPlacement,
  INTERACTIVE_CLICK_TARGET_SELECTOR,
  interceptEscapeForInnerOverlay,
  isAllowedAndroidIntentHref,
  isAllowedEditorHref,
  isCanceledOpenWithinTrigger,
  isDocumentCurrentTarget,
  isModifiedLinkClick,
  isOriginStableHref,
  isPortalRootContext,
  isSameOriginHref,
  isSanitizedHrefFallback,
  isScrollbarPointerPosition,
  isSheetImplementationLoaded,
  isSurfaceToken,
  isTextEntryTarget,
  isTintedFillSurface,
  jsxCdsRoot,
  jsxComboboxSheetBackdrop,
  jsxContextMenuPopup,
  jsxMenuPopupElement,
  jsxMenuSheetPopup,
  jsxPassiveOpen,
  jsxPopoverSheetBody,
  leadingHrefWhitespacePattern,
  linkEventPropNames,
  linkPrefetchEventKinds,
  linkPrefetchEventNames,
  linkWarningLimitReached,
  linkWhitespacePattern,
  loadedSheetImplementation,
  loadSheetImplementation,
  localeContext,
  makeOutsidePortalInert,
  matchesWindowMediaQuery,
  MAX_LINK_DEBUG_LENGTH,
  MAX_LINK_DEBUG_WARNINGS,
  MAX_OVERLAY_OWNER_DEPTH,
  menuItemDescriptionPaddingClass,
  menuItemVariants,
  MenuOpenerProvider,
  menuOpenerRefContext,
  menuOverlayAttributes,
  MenuPopupElement,
  MenuSheetCloseButton,
  MenuSheetPopup,
  MenuSheetTitleBar,
  migrateCdsHtmlFontSizing,
  mobileSheetExports,
  MODAL_INERT_LIVE_REGION_SELECTOR,
  modalInertRefCounts,
  monospaceFontContext,
  naturalImageTilesContext,
  networkPathHrefPattern,
  normalizeColorMode,
  normalizeHrefWhitespace,
  normalizeLinkRel,
  normalizeRouterHref,
  omitLinkEventProps,
  opaqueTintOverrides,
  OPEN_OVERLAY_SELECTOR_VQ5,
  opensInSeparateBrowsingContext,
  OVERLAY_ATTRIBUTE,
  overlayOwnerResolvers,
  overlayStackContext,
  pageBackgroundContext,
  PASSIVE_FOCUS_OUT_REASON,
  PASSIVE_HOVER_OPEN_REASON,
  passiveDeclinedFocusProps,
  passiveDefaultFocusProps,
  passiveFocusDeclinedContext,
  passiveOpenEngagementKeys,
  PassiveOpenGate,
  PassiveOpenKeyboardBridge,
  passiveOpenModifierKeys,
  passiveOpenStateContext,
  pickLinkEventProps,
  placementNeedsBottomHold,
  platformContext,
  PopoverSheetBackdrop,
  PopoverSheetBody,
  POPUP_PLACEMENT_SETTLE_FRAMES,
  portalDensityContext,
  preloadSheetImplementation,
  preventModalTabNavigation,
  reactCdsLink,
  reactCdsRoot,
  reactClickToFocus,
  reactContextMenuPopup,
  reactDomPassiveOpen,
  reactMenuOpener,
  reactMenuOverlayRegistration,
  reactMenuPopupElement,
  reactMenuSheetPopup,
  reactModalPortalInert,
  reactOverlayFocus,
  reactOverlayStack,
  reactPassiveOpen,
  reactPreloadSheets,
  reactSheetImplementation,
  reactStablePopupPlacement,
  readPopupPlacement,
  rejectUnsafeHref,
  relativePathDotSegmentPattern,
  releaseInertAfterPaint,
  reportedLinkWarnings,
  reportLinkSanitizationDebug,
  resolveConnectedRefElement,
  resolveFinalFocusTarget,
  resolvePassiveFinalFocus,
  resolvePlatformWindow,
  restorePassiveOverlayFocus,
  rootElementContext,
  rootPortalContainerContext,
  rootRelativeHrefPattern,
  sanitizeCssBackground,
  sanitizeHref,
  SELECT_ELEMENT_SELECTOR,
  sheetImplementationFailed,
  sheetImplementationGeneration,
  sheetImplementationPromise,
  sheetImplementationRequests,
  sheetImplementationSubscribers,
  shouldAllowPopupPointerFocus,
  shouldHandleLinkWithRouter,
  subscribePassiveOpenNoop,
  subscribePlatformNoop,
  subscribeRootCoarsePointer,
  subscribeSheetImplementation,
  surfaceBackgroundContext,
  surfaceTokenNames,
  TOUCH_DEVICE_QUERY,
  truncateLinkDebugValue,
  trustedAndroidIntentPackages,
  trustedAnthropicDomains,
  unchangedPopupProps,
  uncoverParentMenuSheet,
  unrootedHrefPattern,
  unsafeLinkRelTokenPattern,
  useCaptureOverlayOpener,
  useCdsLink,
  useCdsLocale,
  useCdsRouter,
  useClickToFocus,
  useColorMode,
  useDensity,
  useFont,
  useLoadedSheetImplementation,
  useMenuOpenerRef,
  useMenuOverlayRegistration,
  useMenuOwnerRef,
  useMenuPassiveFocusProps,
  useModalPortalInert,
  useMonospaceFont,
  useOverlayFinalFocus,
  useOverlayFocusReturn,
  usePageBackground,
  usePassiveOpenContext,
  usePassiveOpenState,
  usePlatform,
  usePortalContainer,
  usePreloadSheetsForCoarsePointer,
  useRegisterInnerOverlay,
  useResolvedColorMode,
  useRootElement,
  useRootWindow,
  useSheetImplementationFailed,
  useSheetImplementationLoaded,
  usesImmediateModalRelease,
  useStablePopupPlacement,
  useSurfaceBackground,
  useTrackedMenuTrigger,
  validateRelativeHref,
};
export function installUiOverlays(): () => void {
  return () => {
    MAX_OVERLAY_OWNER_DEPTH = 8;
    initializeOverlayOwners = initializeOnce(() => {
      overlayOwnerResolvers = new WeakMap();
    });
    initializeOverlayFocus = initializeOnce(() => {
      initializeCdsRoot();
      initializeElementAccess();
      initializeTextEntrySelector();
      initializeSafeBlur();
      initializeOverlayOwners();
      reactOverlayFocus = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    OVERLAY_ATTRIBUTE = "data-cds-overlay";
    initializeOverlaySelector = initializeOnce(() => {
      OPEN_OVERLAY_SELECTOR_VQ5 = `[${OVERLAY_ATTRIBUTE}][data-open]`;
    });
    DOCUMENT_NODE_TYPE = 9;
    initializeOverlayStack = initializeOnce(() => {
      reactOverlayStack = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      overlayStackContext =
        reactOverlayStack.createContext<OverlayStack | null>(null);
    });
    initializeMenuOverlayRegistration = initializeOnce(() => {
      initializeOverlaySelector();
      initializeMenuContexts();
      initializeOverlayStack();
      reactMenuOverlayRegistration = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      menuOverlayAttributes = {
        [OVERLAY_ATTRIBUTE]: "",
      };
    });
    initializeContextMenuPopup = initializeOnce(() => {
      initializeClassNames();
      initializeLayers();
      initializeMergedRefs();
      initializePortalRoot();
      initializeCollisionPadding();
      initializeSurfaces();
      initializeAdaptiveSheets();
      initializeKeyboardContextMenuFocus();
      initializeOverlayFocus();
      initializeMenuOverlayRegistration();
      initializeMenuScrollContent();
      initializeNpmDependency();
      reactContextMenuPopup = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxContextMenuPopup = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      contextMenuPopupClasses = `cds-reset draggable-none group/menu-popup relative flex flex-col min-w-[128px] max-w-[320px] max-h-[var(--available-height)] ${getSurfaceClasses("popover")} text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
      ContextMenuPopupFrame = reactContextMenuPopup.forwardRef(
        (
          {
            anchor: anchor,
            side: side,
            align: align,
            sideOffset: sideOffset,
            collisionPadding: collisionPadding,
            finalFocus: finalFocus,
            className: className,
            children: children,
            "data-cds": dataCds,
            ...props
          }: MenuPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let { finalFocus: value, popupRef: focusPopupRef } = useOverlayFocusReturn({
            registerOpenerReturn:
              finalFocus === undefined || finalFocus === null,
          });
          useKeyboardContextMenuInitialFocus(focusPopupRef);
          let overlayLayer = useDefaultOverlayLayer("contextmenu"),
            { elementRef: overlayElementRef, overlayAttrs: overlayAttributes } =
              useMenuOverlayRegistration(),
            mergedRef = useMergedRefs(forwardedRef, focusPopupRef, overlayElementRef);
          return (
            <ResetSheetContexts>
              <PortalRoot
                {...overlayLayer.portalProps}
                surface={elevationSurfaceNames.popover}
                companionModalCatcher={true}
                closeOnActivityHide={true}
              >
                <CollisionPaddingProvider
                  override={collisionPadding}
                  provideInherit={true}
                >
                  {(resolvedCollisionPadding: CollisionPadding) => (
                    <layerBaseContext.Provider value={overlayLayer.base}>
                      <baseContextMenu.Positioner
                        style={overlayLayer.style}
                        anchor={anchor}
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        collisionPadding={resolvedCollisionPadding}
                      >
                        <baseContextMenu.Popup
                          data-cds={dataCds}
                          {...overlayAttributes}
                          ref={mergedRef}
                          finalFocus={(finalFocus ?? value) as import("../contracts/overlays").BaseUIPopupFocus}
                          {...props}
                          className={cn(
                            contextMenuPopupClasses,
                            className,
                          )}
                        >
                          <MenuScrollContent>
                            {children}
                          </MenuScrollContent>
                        </baseContextMenu.Popup>
                      </baseContextMenu.Positioner>
                    </layerBaseContext.Provider>
                  )}
                </CollisionPaddingProvider>
              </PortalRoot>
            </ResetSheetContexts>
          );
        },
      );
      ContextMenuPopupFrame.displayName = "ContextMenuPopupFrame";
    });
    initializeClickToFocus = initializeOnce(() => {
      initializeTextEntrySelector();
      initializeEventCallbacks();
      reactClickToFocus = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      INTERACTIVE_CLICK_TARGET_SELECTOR = `button,a[href],label,[role="button"],select,[tabindex]:not([tabindex="-1"]),${TEXT_ENTRY_SELECTOR}`;
    });
    FORM_POINTER_FOCUS_SELECTOR =
      'input[type="range"], select, input[readonly], textarea[readonly]';
    SELECT_ELEMENT_SELECTOR = "select";
    DRAGGABLE_ELEMENT_SELECTOR = '[draggable="true"]';
    initializePopupPointerFocus = initializeOnce(() => {
      initializeElementAccess();
      initializeClickToFocus();
      initializeVisualKeyboard();
    });
    PASSIVE_HOVER_OPEN_REASON = "trigger-hover";
    PASSIVE_FOCUS_OUT_REASON = "focus-out";
    subscribePassiveOpenNoop = () => () => {
      return;
    };
    getPassiveOffSnapshot = () => "off";
    unchangedPopupProps = (popupProps: PassivePopupProps) => popupProps;
    initializePassiveOpen = initializeOnce(() => {
      initializeElementAccess();
      initializeSafeBlur();
      initializePopupPointerFocus();
      reactPassiveOpen = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxPassiveOpen = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      reactDomPassiveOpen = toModuleNamespace(
        loadReactDomNamespace(),
        1,
      );
      passiveOpenStateContext =
        reactPassiveOpen.createContext<PassiveOpenCell | null>(null);
      passiveFocusDeclinedContext =
        reactPassiveOpen.createContext<boolean>(false);
      passiveDeclinedFocusProps = {
        tabIndex: undefined,
      };
      passiveDefaultFocusProps = {};
      passiveOpenEngagementKeys = new Set([
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
      ]);
      (PassiveOpenGate as React.FC<PassiveGateProps>).displayName =
        "PassiveOpenGate";
      passiveOpenModifierKeys = new Set([
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "AltGraph",
        "CapsLock",
        "NumLock",
        "ScrollLock",
        "Fn",
        "FnLock",
        "Hyper",
        "Super",
        "Symbol",
        "SymbolLock",
      ]);
    });
    menuItemDescriptionPaddingClass =
      "pb-[calc((var(--cds-h-control)-var(--cds-font-size-body)-var(--cds-leading-footnote)+var(--cds-font-size-footnote))/2)]";
    initializeMenuItemVariants = initializeOnce(() => {
      initializeNpmDependency();
      menuItemVariants = cva(
        "cds-reset flex w-full items-center gap-xs compact:px-2 comfortable:px-2.5 py-[calc((var(--cds-h-control)-var(--cds-leading-body))/2)] rounded text-body font-normal [--cds-shortcut-cap-ink:var(--cds-text-muted)] select-none outline-none focus-visible:outline-hidden data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none",
        {
          variants: {
            variant: {
              default: "text-primary data-[highlighted]:bg-fill-ghost-hover",
              danger:
                "group/menu-danger text-danger data-[highlighted]:bg-fill-danger data-[highlighted]:text-on-danger data-[highlighted]:[--cds-shortcut-cap-ink:currentColor]",
            },
          },
          defaultVariants: {
            variant: "default",
          },
        },
      );
    });
    initializeMenuOpener = initializeOnce(() => {
      initializeIsomorphicLayoutEffect();
      initializeEventCallbacks();
      initializeOverlayOwners();
      reactMenuOpener = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      menuOpenerRefContext = reactMenuOpener.createContext<
        React.RefObject<HTMLElement | null> | undefined
      >(undefined);
      MenuOpenerProvider = menuOpenerRefContext.Provider;
    });
    initializeMenuPopupElement = initializeOnce(() => {
      initializeMergedRefs();
      initializeAdaptiveSheets();
      initializeOverlayFocus();
      initializeMenuOverlayRegistration();
      initializeMenuOpener();
      initializeNpmDependency();
      reactMenuPopupElement = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxMenuPopupElement = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      MenuPopupElement = reactMenuPopupElement.forwardRef(
        (
          {
            anchoredWithoutFinalFocus: anchoredWithoutFinalFocus,
            cursorAnchored = false,
            finalFocus: finalFocus,
            ...props
          }: MenuPopupElementProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value =
              reactMenuPopupElement.useContext(
                sheetFrameContext as React.Context<
                  | (SheetFrame & {
                      open: boolean;
                    })
                  | null
                >,
              )?.open ?? true,
            { elementRef: overlayElementRef, overlayAttrs: overlayAttributes } =
              useMenuOverlayRegistration(),
            focusReturn = useOverlayFocusReturn({
              open: value,
              skipRestoreOnOutsideFocus: !cursorAnchored,
              registerOpenerReturn: anchoredWithoutFinalFocus,
              triggerRef: useMenuOpenerRef(),
            }),
            mergedRef = useMergedRefs(
              forwardedRef,
              overlayElementRef,
              anchoredWithoutFinalFocus ? focusReturn.popupRef : undefined,
            );
          return (
            <baseMenu.Popup
              {...overlayAttributes}
              ref={mergedRef}
              finalFocus={
                ((finalFocus === undefined ||
                  (cursorAnchored && finalFocus === null)) &&
                anchoredWithoutFinalFocus
                  ? focusReturn.finalFocus
                  : finalFocus) as import("../contracts/overlays").BaseUIPopupFocus
              }
              {...props}
            />
          );
        },
      );
      MenuPopupElement.displayName = "MenuPopupElement";
    });
    heldPositionerClasses = "pointer-events-none";
    heldPopupClasses = "pointer-events-auto";
    POPUP_PLACEMENT_SETTLE_FRAMES = 2;
    initializeStablePopupPlacement = initializeOnce(() => {
      reactStablePopupPlacement = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    TOUCH_DEVICE_QUERY = "(pointer: coarse)";
    ELECTRON_USER_AGENT_TOKEN = " Electron/";
    initializeModalReleasePlatform = () => {};
    MODAL_INERT_LIVE_REGION_SELECTOR =
      '[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"], [data-cds="Toast"]';
    initializeModalPortalInert = initializeOnce(() => {
      initializeIsomorphicLayoutEffect();
      initializeCdsRoot();
      initializeModalReleasePlatform();
      initializeEventCallbacks();
      initializeReducedMotion();
      reactModalPortalInert = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      inertExcludedTags = new Set([
        "SCRIPT",
        "STYLE",
        "LINK",
        "TEMPLATE",
        "NOSCRIPT",
      ]);
      modalInertRefCounts = new WeakMap();
    });
    initializeMenuSheetPopup = initializeOnce(() => {
      initializeIsomorphicLayoutEffect();
      initializeClassNames();
      initializeTranslations();
      initializeCdsRoot();
      initializeLayers();
      initializeAndroidCloseWatcher();
      initializeMergedRefs();
      initializePortalRoot();
      initializeIcons();
      initializeCollisionPadding();
      initializeSurfaces();
      initializeSheetStyles();
      initializePresentationMode();
      initializeAdaptiveSheets();
      initializeSheetClassNames();
      initializeMenuContexts();
      initializeMenuScrollContent();
      initializeContextMenuPopup();
      initializePassiveOpen();
      initializeMenuItemVariants();
      initializeMenuOpener();
      initializeMenuPopupElement();
      initializeStablePopupPlacement();
      initializeSheetDrag();
      initializeSheetChrome();
      initializeSheetMeasurement();
      initializeModalPortalInert();
      initializeNpmDependency();
      reactMenuSheetPopup = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxMenuSheetPopup = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      coveredMenuSheetOwners = new WeakMap();
      MenuSheetPopup = reactMenuSheetPopup.forwardRef(
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
          }: MenuPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ) => {
          let value = usePortalContainer(),
            triggerState =
              reactMenuSheetPopup.useContext<Overlays.MenuRootState | null>(
                menuTriggerContext,
              ),
            isCursorAnchored =
              reactMenuSheetPopup.useContext<boolean>(
                contextMenuContext,
              ) && triggerState === null,
            isSheet = useIsSheet(),
            isNestedSheet = isSheet && triggerState !== null,
            inheritedCollision = reactMenuSheetPopup.useContext<{
              collisionPadding?: CollisionPadding;
            } | null>(collisionPaddingContext),
            requestedCollisionPadding = collisionPadding ?? inheritedCollision?.collisionPadding,
            memo = reactMenuSheetPopup.useMemo(
              () =>
                anchor !== undefined || !triggerState
                  ? anchor
                  : createMenuVirtualAnchor(triggerState),
              [anchor, triggerState],
            ),
            resolvedSideOffset =
              sideOffset ??
              (isCursorAnchored ? undefined : triggerState && anchor === undefined ? 2 : 6),
            stablePlacement = useStablePopupPlacement({
              enabled: stableWhileOpen && !isSheet && !isCursorAnchored,
              side: side,
              align: align,
            }),
            sheetFrame =
              reactMenuSheetPopup.useContext<Overlays.SheetFrameContext | null>(
                sheetFrameContext,
              ),
            submenuState = reactMenuSheetPopup.useContext<Overlays.MenuItemState>(
              submenuStateContext,
            ),
            ref = reactMenuSheetPopup.useRef<HTMLElement | null>(null),
            coveredParentRef = reactMenuSheetPopup.useRef<Element | null>(null),
            callback = reactMenuSheetPopup.useCallback(() => {
              let current = coveredParentRef.current;
              if (current !== null) {
                uncoverParentMenuSheet(current, coveredParentRef);
                coveredParentRef.current = null;
              }
            }, []),
            coverParentAndFocus = reactMenuSheetPopup.useCallback(
              (element: HTMLElement) => {
                if (triggerState === null) {
                  return;
                }
                let parentSheetElement =
                  sheetFrame !== null
                    ? (triggerState.triggerRef.current?.closest(
                        `[data-sheet-tree="${CSS.escape(sheetFrame.treeId)}"][data-presentation="sheet"]`,
                      ) ?? null)
                    : null;
                if (parentSheetElement !== null && coveredParentRef.current !== parentSheetElement) {
                  callback();
                  coverParentMenuSheet(parentSheetElement, coveredParentRef);
                  coveredParentRef.current = parentSheetElement;
                }
                if (!element.contains(element.ownerDocument.activeElement)) {
                  element.focus({
                    preventScroll: true,
                  });
                }
              },
              [triggerState, callback, sheetFrame],
            ),
            [useHalfHeightFloor, setHalfHeightFloor] = reactMenuSheetPopup.useState(false),
            halfHeightFloorRef = reactMenuSheetPopup.useRef(false),
            updateHalfHeightFloor = reactMenuSheetPopup.useCallback((shouldUseHalfHeightFloor: boolean) => {
              halfHeightFloorRef.current = shouldUseHalfHeightFloor;
              setHalfHeightFloor(shouldUseHalfHeightFloor);
            }, []),
            [modalPopup, setModalPopup] =
              reactMenuSheetPopup.useState<HTMLElement | null>(null),
            takeCloseRequest = sheetFrame?.takeCloseRequest,
            getInertReleaseTiming = reactMenuSheetPopup.useCallback(
              () => getSheetInertReleaseTiming(takeCloseRequest?.() ?? null),
              [takeCloseRequest],
            ),
            finishDeferredInertRelease = useModalPortalInert({
              node: modalPopup,
              open: isSheet && !isNestedSheet && (sheetFrame?.open ?? false),
              liftOnClose: getInertReleaseTiming,
            }),
            sheetState: Dom.SheetState = useSheetState(),
            parentSheet =
              reactMenuSheetPopup.useContext<Dom.SheetParentState | null>(
                sheetParentContext,
              ),
            coverSheet = reactMenuSheetPopup.useContext<
              ((token: object) => () => void) | null
            >(sheetCoverContext),
            [sheetElement, setSheetElement] =
              reactMenuSheetPopup.useState<HTMLElement | null>(null),
            attachPopup = reactMenuSheetPopup.useCallback(
              (element: HTMLElement | null) => {
                ref.current = isSheet ? element : null;
                setSheetElement(isSheet ? element : null);
                setModalPopup(isSheet && !isNestedSheet ? element : null);
                if (element === null) {
                  finishDeferredInertRelease();
                  callback();
                  updateHalfHeightFloor(false);
                  return;
                }
                if (!isSheet) {
                  updateHalfHeightFloor(false);
                  return;
                }
                if (!isNestedSheet) {
                  let hasTextEntry = hasEditableSheetContent(element);
                  if (hasTextEntry) {
                    element.style.minHeight = MIN_SHEET_HEIGHT_CSS;
                    element.style.maxHeight = MIN_SHEET_HEIGHT_CSS;
                  }
                  updateHalfHeightFloor(hasTextEntry);
                  sheetFrame?.pinHeight(
                    element.getBoundingClientRect().height,
                    sheetContentCanGrow(element),
                  );
                  return;
                }
                coverParentAndFocus(element);
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
              [
                isSheet,
                isNestedSheet,
                sheetFrame,
                callback,
                coverParentAndFocus,
                updateHalfHeightFloor,
                finishDeferredInertRelease,
              ],
            );
          useSheetTextEntryFocus(sheetElement, sheetFrame);
          useSheetPressedState(sheetElement);
          useDismissSheetOnForeignFocus(
            sheetElement,
            sheetFrame,
            sheetState.covered,
          );
          let isCovered = isSheet && sheetState.covered,
            isInert = isSheet && sheetState.inert;
          useAndroidCloseWatcher(
            isSheet && (isNestedSheet ? submenuState.open : (sheetFrame?.open ?? false)),
            isNestedSheet ? triggerState?.close : sheetFrame?.dismiss,
          );
          let wasNestedSheetMountedRef = reactMenuSheetPopup.useRef(false),
            isFrameOpen = sheetFrame?.open ?? false;
          useIsomorphicLayoutEffect(() => {
            let current = ref.current,
              isNestedSheetMounted = isNestedSheet && submenuState.open && current !== null,
              wasNestedSheetMounted = wasNestedSheetMountedRef.current;
            wasNestedSheetMountedRef.current = isNestedSheetMounted;
            if (isNestedSheetMounted && !wasNestedSheetMounted) {
              coverParentAndFocus(current!);
            } else if (!isNestedSheetMounted && isFrameOpen) {
              callback();
            }
          }, [isNestedSheet, submenuState.open, isFrameOpen, coverParentAndFocus, callback]);
          let wasNestedSheetOpenRef = reactMenuSheetPopup.useRef(false),
            [isReturningToParent, setIsReturningToParent] = reactMenuSheetPopup.useState(false);
          useIsomorphicLayoutEffect(() => {
            let isNestedSheetOpen = isNestedSheet && submenuState.open,
              current = wasNestedSheetOpenRef.current;
            wasNestedSheetOpenRef.current = isNestedSheetOpen;
            if (isNestedSheetOpen !== current) {
              setIsReturningToParent(!isNestedSheetOpen && isFrameOpen);
            }
          }, [isNestedSheet, submenuState.open, isFrameOpen]);
          useIsomorphicLayoutEffect(() => {
            let current = ref.current;
            if (isNestedSheet && submenuState.open && current !== null) {
              resetSheetDragStyle(current);
            }
          }, [isNestedSheet, submenuState.open]);
          let pushLevelHeight = sheetFrame?.pushLevelHeight,
            dragState = sheetFrame?.drag;
          reactMenuSheetPopup.useEffect(() => {
            if (
              !isNestedSheet ||
              !submenuState.open ||
              sheetElement === null ||
              pushLevelHeight === undefined
            ) {
              return;
            }
            let defaultView = sheetElement.ownerDocument.defaultView,
              heightHandle: Dom.SheetLevelHandle | undefined,
              flag = false,
              measureNestedSheet = () => {
                let viewportHeight = defaultView?.innerHeight ?? 1 / 0,
                  maximumHeight =
                    (defaultView
                      ? getSheetAvailableHeight(
                          defaultView,
                          sheetElement,
                        )
                      : 1 / 0) * MAX_SHEET_HEIGHT_FRACTION,
                  hasTextEntry = hasEditableSheetContent(sheetElement),
                  naturalHeight = measureNaturalSheetHeight(sheetElement);
                flag = naturalHeight > maximumHeight;
                let nextHeight = hasTextEntry
                    ? viewportHeight * MIN_SHEET_HEIGHT_FRACTION
                    : Math.min(naturalHeight, maximumHeight),
                  canGrow = hasTextEntry || flag;
                if (heightHandle === undefined) {
                  heightHandle = pushLevelHeight(nextHeight, canGrow);
                } else {
                  heightHandle.set(nextHeight, canGrow);
                }
              },
              measureWhenUncovered = () => {
                measurementFrame = undefined;
                if (dragState !== undefined && dragState.get() !== null) {
                  measurementFrame = defaultView?.requestAnimationFrame(measureWhenUncovered);
                  return;
                }
                if (!uncoverGate.ready()) {
                  return;
                }
                measureNestedSheet();
              },
              uncoverGate = createSheetUncoverGate(sheetElement, () => {
                if (measurementFrame === undefined) {
                  measurementFrame = defaultView?.requestAnimationFrame(measureWhenUncovered);
                }
              }),
              measurementFrame = defaultView?.requestAnimationFrame(measureWhenUncovered),
              contentObserver =
                defaultView !== null &&
                typeof defaultView.MutationObserver !== "undefined"
                  ? new defaultView.MutationObserver(
                      (mutations: MutationRecord[]) => {
                        if (
                          measurementFrame !== undefined ||
                          heightHandle === undefined ||
                          isScrollContentReplacement(mutations, flag)
                        ) {
                          return;
                        }
                        measurementFrame = defaultView.requestAnimationFrame(measureWhenUncovered);
                      },
                    )
                  : null;
            contentObserver?.observe(sheetElement, {
              childList: true,
              subtree: true,
            });
            return () => {
              contentObserver?.disconnect();
              uncoverGate.dispose();
              if (measurementFrame !== undefined) {
                defaultView?.cancelAnimationFrame(measurementFrame);
              }
              heightHandle?.release();
            };
          }, [isNestedSheet, submenuState.open, sheetElement, pushLevelHeight, dragState]);
          let repinHeight = sheetFrame?.repinHeight,
            shouldMeasureOpenSheet = sheetFrame?.open ?? false;
          reactMenuSheetPopup.useEffect(() => {
            if (
              !isSheet ||
              isNestedSheet ||
              !shouldMeasureOpenSheet ||
              sheetElement === null ||
              repinHeight === undefined
            ) {
              return;
            }
            let defaultView = sheetElement.ownerDocument.defaultView;
            if (
              defaultView === null ||
              typeof defaultView.MutationObserver === "undefined"
            ) {
              return;
            }
            let index = 0,
              flag = false,
              remeasureRootSheet = () => {
                index = 0;
                if (dragState !== undefined && dragState.get() !== null) {
                  index = defaultView.requestAnimationFrame(remeasureRootSheet);
                  return;
                }
                if (!uncoverGate.ready()) {
                  return;
                }
                if (hasEditableSheetContent(sheetElement)) {
                  if (!halfHeightFloorRef.current) {
                    updateHalfHeightFloor(true);
                    repinHeight(
                      defaultView.innerHeight *
                        MIN_SHEET_HEIGHT_FRACTION,
                      true,
                    );
                  }
                  return;
                }
                let maximumHeight =
                    getSheetAvailableHeight(defaultView, sheetElement) *
                    MAX_SHEET_HEIGHT_FRACTION,
                  naturalHeight = measureNaturalSheetHeight(sheetElement);
                flag = naturalHeight > maximumHeight;
                let minimumHeight = getSheetMinimumHeight(
                  defaultView.innerHeight,
                  halfHeightFloorRef.current,
                );
                repinHeight(Math.max(Math.min(naturalHeight, maximumHeight), minimumHeight), flag);
              },
              uncoverGate = createSheetUncoverGate(sheetElement, () => {
                if (index === 0) {
                  index = defaultView.requestAnimationFrame(remeasureRootSheet);
                }
              }),
              contentObserver = new defaultView.MutationObserver(
                (mutations: MutationRecord[]) => {
                  if (
                    index !== 0 ||
                    isScrollContentReplacement(mutations, flag)
                  ) {
                    return;
                  }
                  index = defaultView.requestAnimationFrame(remeasureRootSheet);
                },
              );
            contentObserver.observe(sheetElement, {
              childList: true,
              subtree: true,
            });
            return () => {
              contentObserver.disconnect();
              uncoverGate.dispose();
              if (index !== 0) {
                defaultView.cancelAnimationFrame(index);
              }
            };
          }, [isSheet, isNestedSheet, shouldMeasureOpenSheet, sheetElement, repinHeight, dragState, updateHalfHeightFloor]);
          let pinnedHeight = sheetFrame?.height,
            pinHeight = sheetFrame?.pinHeight;
          useIsomorphicLayoutEffect(() => {
            let current = ref.current;
            if (
              !isSheet ||
              isNestedSheet ||
              pinnedHeight !== undefined ||
              current === null
            ) {
              return;
            }
            resetSheetDragStyle(current);
            pinHeight?.(
              current.getBoundingClientRect().height,
              sheetContentCanGrow(current),
            );
          }, [isSheet, isNestedSheet, pinnedHeight, pinHeight]);
          let ownerRef = useMenuOwnerRef(triggerState?.triggerRef, props.finalFocus),
            anchoredWithoutFinalFocus = isCursorAnchored
              ? props.finalFocus === undefined || props.finalFocus === null
              : anchor !== undefined &&
                anchor !== null &&
                triggerState === null &&
                props.finalFocus === undefined,
            passiveOpen = usePassiveOpenContext(triggerState === null);
          passiveOpen.root?.declareFocusProps(initialFocus, props.finalFocus);
          if (triggerState !== null && initialFocus !== undefined) {
            warnNestedMenuInitialFocus();
          }
          let state = {
              ...props,
              onKeyDown: (
                keyEvent: Parameters<NonNullable<MenuPopupProps["onKeyDown"]>>[0],
              ) => {
                props.onKeyDown?.(keyEvent);
                preventModalTabNavigation(keyEvent);
              },
            },
            mergedPopupRef = useStableMergedRef(
              (popup: HTMLElement | null) => {
                stablePlacement.popupRef(popup);
                attachPopup(popup);
                ownerRef(popup);
                passiveOpen.root?.registerPopup(popup);
              },
              forwardedRef,
            ),
            sheetStyle = isSheet
              ? getSheetPopupStyle(sheetFrame, {
                  floor: useHalfHeightFloor ? "half" : "content",
                  parentFrameHeight: isNestedSheet ? undefined : parentSheet?.frameHeight,
                })
              : undefined,
            popupStyle =
              sheetStyle === undefined
                ? style
                : typeof style === "function"
                  ? (
                      popupState: import("@base-ui/react/menu").Menu.Popup.State,
                    ) => ({
                      ...(
                        style as (
                          state: import("@base-ui/react/menu").Menu.Popup.State,
                        ) => React.CSSProperties
                      )(popupState),
                      ...sheetStyle,
                    })
                  : {
                      ...style,
                      ...sheetStyle,
                    };
          if (triggerState !== null && layerOffset !== undefined) {
            warnNestedMenuLayerOffset();
          }
          let overlayLayer = useOverlayLayer(
              isCursorAnchored ? "contextmenu" : "menu",
              triggerState === null ? layerOffset : undefined,
            ),
            rootWindow = useRootWindow(),
            frameHeight = getSheetFrameHeight(
              sheetFrame,
              rootWindow,
              sheetElement,
            ),
            sheetParentContextValue = reactMenuSheetPopup.useMemo(
              () =>
                isSheet && coverSheet !== null
                  ? {
                      depth: sheetState.depth,
                      frameHeight: frameHeight,
                      cover: coverSheet,
                    }
                  : null,
              [isSheet, coverSheet, sheetState.depth, frameHeight],
            );
          return (
            <baseMenu.Portal container={(container ?? value) as import("../contracts/overlays").BaseUIPortalContainer}>
              <PortalRoot
                {...overlayLayer.portalProps}
                surface={elevationSurfaceNames.popover}
                density={isSheet ? SHEET_DENSITY : undefined}
                companionModalCatcher={!isSheet}
                closeOnActivityHide={true}
              >
                {[isSheet && !isNestedSheet && (
                    <baseMenu.Backdrop
                      data-presentation={"sheet"}
                      data-sheet-scrim={sheetFrame?.treeId}
                      className={
                        sheetState.depth > 0
                          ? "draggable-none fixed inset-0 bg-transparent"
                          : sheetBackdropClasses
                      }
                    />
                  ), <CollisionPaddingProvider
                    override={requestedCollisionPadding}
                    container={container ?? value}
                    provideInherit={true}
                  >
                    {(resolvedCollisionPadding: CollisionPadding | undefined) => (
                      <layerBaseContext.Provider value={overlayLayer.base}>
                        <baseMenu.Positioner
                          ref={stablePlacement.positionerRef}
                          data-sheet-tree={isSheet ? sheetFrame?.treeId : undefined}
                          style={
                            isSheet
                              ? {
                                  ...overlayLayer.style,
                                  ...getSheetPositionerStyle(
                                    sheetFrame,
                                  ),
                                }
                              : stablePlacement.held !== null
                                ? {
                                    ...overlayLayer.style,
                                    ...stablePlacement.held.positionerStyle,
                                  }
                                : overlayLayer.style
                          }
                          side={stablePlacement.side}
                          align={stablePlacement.align}
                          sideOffset={resolvedSideOffset}
                          collisionPadding={resolvedCollisionPadding}
                          collisionAvoidance={collisionAvoidance}
                          anchor={memo}
                          {...(isSheet ? (sheetPositioningOverrides as Partial<typeof sheetPositioningOverrides>) : {})}
                          className={
                            isSheet
                              ? isNestedSheet
                                ? sheetClipClasses
                                : sheetState.depth === 0
                                  ? sheetOverflowBackgroundClasses
                                  : undefined
                              : stablePlacement.held?.positionerClassName
                          }
                        >
                          <PassiveOpenGate
                            cell={isSheet ? null : passiveOpen.cell}
                            nested={triggerState !== null}
                          >
                            {(applyPassivePopupProps: PassivePopupTransform) => (
                              <MenuPopupElement
                                anchoredWithoutFinalFocus={anchoredWithoutFinalFocus}
                                cursorAnchored={isCursorAnchored}
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
                                      [SHEET_COVERED_ATTRIBUTE]: "",
                                    }
                                  : {})}
                                {...(isInert ? (inertElementProps as React.HTMLAttributes<HTMLDivElement>) : {})}
                                {...(isNestedSheet && sheetFrame !== null && !sheetFrame.open
                                  ? {
                                      [SHEET_TREE_CLOSING_ATTRIBUTE]:
                                        "",
                                    }
                                  : {})}
                                {...(isNestedSheet && isReturningToParent && !submenuState.open
                                  ? {
                                      [SHEET_PEELING_ATTRIBUTE]: "",
                                    }
                                  : {})}
                                {...(isSheet
                                  ? getControlSizeAttributes("lg")
                                  : {})}
                                ref={mergedPopupRef}
                                {...applyPassivePopupProps(isSheet ? state : props)}
                                style={popupStyle}
                                className={cn(
                                  contextMenuPopupClasses,
                                  stablePlacement.held?.popupClassName,
                                  isSheet && sheetPopupClasses,
                                  isSheet &&
                                    (isNestedSheet
                                      ? "bg-transparent shadow-none [&[data-ending-style]:not([data-cds-sheet-tree-closing])]:translate-x-full rtl:[&[data-ending-style]:not([data-cds-sheet-tree-closing])]:-translate-x-full [&[data-ending-style][data-cds-sheet-peeling]]:translate-x-full rtl:[&[data-ending-style][data-cds-sheet-peeling]]:-translate-x-full [&[data-ending-style][data-cds-sheet-tree-closing]]:translate-y-[calc(100%+1.5rem)]"
                                      : "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]"),
                                  isSheet &&
                                    "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                                  className,
                                )}
                              >
                                {isSheet ? (<sheetParentContext.Provider
                                    value={sheetParentContextValue}
                                  >
                                    {[<SheetHandle
                                        drawPill={!isNestedSheet}
                                      />, <div
                                        className={
                                          sheetDrillBodyClasses
                                        }
                                      >
                                        {[<MenuScrollContent
                                            header={header}
                                            headerClassName={
                                              sheetSeparatorClasses
                                            }
                                            footer={footer}
                                            fill={true}
                                          >
                                            {[children, !isNestedSheet && (
                                                <MenuSheetCloseButton />
                                              )]}
                                          </MenuScrollContent>, <MenuSheetTitleBar nested={isNestedSheet} />]}
                                      </div>]}
                                  </sheetParentContext.Provider>) : (<MenuScrollContent
                                    header={header}
                                    footer={footer}
                                    maxVisibleItems={maxVisibleItems}
                                  >
                                    {children}
                                  </MenuScrollContent>)}
                              </MenuPopupElement>
                            )}
                          </PassiveOpenGate>
                        </baseMenu.Positioner>
                      </layerBaseContext.Provider>
                    )}
                  </CollisionPaddingProvider>]}
              </PortalRoot>
            </baseMenu.Portal>
          );
        },
      );
      MenuSheetPopup.displayName = "MenuSheetPopup";
    });
    initializePopoverSheetContent = initializeOnce(() => {
      initializeClassNames();
      initializePresentationMode();
      initializeAdaptiveSheets();
      initializeSheetClassNames();
      initializeNpmDependency();
      jsxPopoverSheetBody = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
    });
    initializeComboboxSheetBackdrop = initializeOnce(() => {
      initializeSheetClassNames();
      initializeNpmDependency();
      jsxComboboxSheetBackdrop = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
    });
    mobileSheetExports = {} as Overlays.MobileSheetParts;
    defineLiveExports(mobileSheetExports, {
      SheetPopupHost: () => SheetPopupHost,
      PopoverSheetContent: () => PopoverSheetBody,
      PopoverSheetBackdrop: () => PopoverSheetBackdrop,
      MenuSheetPopup: () => MenuSheetPopup,
      ComboboxSheetBackdrop: () => ContextMenuSheetBackdrop,
    });
    initializeMobileSheetExports = initializeOnce(() => {
      initializeSheetPopupHost();
      initializeMenuSheetPopup();
      initializePopoverSheetContent();
      initializeComboboxSheetBackdrop();
    });
    loadedSheetImplementation = null;
    sheetImplementationFailed = false;
    sheetImplementationRequests = 0;
    sheetImplementationGeneration = 0;
    sheetImplementationPromise = null;
    getSheetImplementationSnapshot = () => loadedSheetImplementation;
    getSheetImplementationLoadedSnapshot = () =>
      loadedSheetImplementation !== null;
    getSheetImplementationFailedSnapshot = () => sheetImplementationFailed;
    getNullSheetImplementationSnapshot = () => null;
    getFalseSheetImplementationSnapshot = () => false;
    initializeSheetImplementation = initializeOnce(() => {
      initializeTransitionRunner();
      reactSheetImplementation = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      sheetImplementationSubscribers = new Set();
    });
    initializePreloadSheets = initializeOnce(() => {
      initializeMediaQueryStores();
      initializeSheetImplementation();
      reactPreloadSheets = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    initializeCdsPlatform = initializeOnce(() => {
      // MineDesign: the desktop app is told apart by Electron alone.
      desktopPlatformUserAgentPattern = /\bElectron\//i;
    });
    MAX_LINK_DEBUG_WARNINGS = 50;
    MAX_LINK_DEBUG_LENGTH = 120;
    linkWarningLimitReached = false;
    initializeLinkWarnings = initializeOnce(() => {
      reportedLinkWarnings = new Set();
    });
    initializeHrefWhitespace = initializeOnce(() => {
      linkWhitespacePattern = /[\t\n\r]/g;
    });
    initializeLinkTargets = initializeOnce(() => {
      existingBrowsingContextNames = new Set(["_self", "_parent", "_top"]);
      unsafeLinkRelTokenPattern = /^no(?:opener|referrer)$/i;
    });
    HTTPS_RELATIVE_HREF_BASE = "https://cds-relative-href.invalid";
    HTTP_RELATIVE_HREF_BASE = "http://cds-relative-href.invalid";
    initializeCdsLink = initializeOnce(() => {
      initializeLinkWarnings();
      initializeHrefWhitespace();
      initializeLinkTargets();
      reactCdsLink = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      cdsRouterContext = reactCdsLink.createContext<
        Overlays.LinkRouter | undefined
      >(undefined);
      forbiddenHrefControlCharacterPattern = /[\x00-\x1f\x7f-\x9f]/;
      leadingHrefWhitespacePattern = /^\s/;
      networkPathHrefPattern = /^[/\\]{2}/;
      rootRelativeHrefPattern = /^[/\\](?![/\\])/;
      unrootedHrefPattern = /^[^/\\]/;
      relativePathDotSegmentPattern = /\/(?:\.|%2e){1,2}(?:\/|$)/i;
      dotSegmentPattern = /^(?:\.|%2e){1,2}$/i;
      encodedOrBackslashPathPattern = /\\|%2e/i;
      // MineDesign: the Claude app schemes (claude, claude-cli, claude-nest) are not link targets here.
      allowedHrefSchemePattern = /^(?:https?|mailto|tel|slack|blob):/i;
      androidIntentHrefPattern = /^intent:/i;
      editorHrefSchemePattern = /^(?:vscode|cursor):/i;
      // MineDesign: no first-party editor extensions; only VS Code settings links are followed.
      allowedEditorHrefPattern =
        /^vscode:\/\/settings\/[A-Za-z0-9][A-Za-z0-9_.-]*$/;
      allowedIntentPropertyNames = new Set([
        "scheme",
        "package",
        "S.browser_fallback_url",
      ]);
      absoluteHrefPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
      // MineDesign: no first-party web domains or Android apps; every external link is treated as "other".
      trustedAnthropicDomains = [];
      trustedAndroidIntentPackages = new Set();
      linkEventPropNames = [
        "onClick",
        "onPointerEnter",
        "onPointerLeave",
        "onPointerDown",
        "onFocus",
        "onBlur",
      ];
      linkPrefetchEventKinds = {
        onPointerEnter: true,
        onPointerLeave: false,
        onPointerDown: true,
        onFocus: true,
        onBlur: false,
      };
      linkPrefetchEventNames = Object.keys(
        linkPrefetchEventKinds,
      ) as Layers.LinkIntentEventName[];
    });
    initializeElementWindow = () => {};
    subscribePlatformNoop = () => () => {};
    getWebPlatformSnapshot = () => "web";
    getCoarsePointerServerSnapshot = () => false;
    subscribeRootCoarsePointer = (listener: () => void) => {
      let value = subscribeCoarsePointer(listener);
      queueMicrotask(listener);
      return value;
    };
    hasMigratedHtmlFontSizing = false;
    DARK_COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";
    normalizeColorMode = (mode: string | null | undefined) =>
      mode === "dark" || mode === "light"
        ? mode
        : mode === "auto" || mode === "system"
          ? "system"
          : undefined;
    initializeCdsRoot = initializeOnce(() => {
      initializeAccentColors();
      initializeCoarsePointerStores();
      initializeSafeObservers();
      initializeDocumentFont();
      initializeFeatureFlags();
      initializeInputDismissalTracking();
      initializePreloadSheets();
      initializeIsomorphicLayoutEffect();
      initializeExperimentalTheme();
      initializeClassNames();
      initializeTranslations();
      initializeCdsPlatform();
      initializeCdsLink();
      initializeElementWindow();
      initializeNpmDependency();
      reactCdsRoot = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxCdsRoot = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      densitySizeIndices = {
        compact: 2,
        comfortable: 4,
      };
      controlSizeOffsets = {
        xs: -2,
        sm: -1,
        base: 0,
        lg: 1,
      };
      densityContext = reactCdsRoot.createContext<Density>("comfortable");
      portalDensityContext = densityContext;
      colorModeStoreContext = reactCdsRoot.createContext<
        Layers.ColorModeStore | undefined
      >(undefined);
      defaultColorModeStore = {
        setElement: () => {
          return;
        },
        subscribe: () => () => {
          return;
        },
        getSnapshot: (): undefined => {
          return;
        },
        getServerSnapshot: (): undefined => {
          return;
        },
        getAttrSnapshot: (): undefined => {
          return;
        },
        getServerAttrSnapshot: (): undefined => {
          return;
        },
        getSettingSnapshot: (): undefined => {
          return;
        },
        getServerSettingSnapshot: (): undefined => {
          return;
        },
      };
      platformContext = reactCdsRoot.createContext<
        Layers.CdsPlatform | undefined
      >(undefined);
      fontContext = reactCdsRoot.createContext<Layers.CdsFont | undefined>(
        undefined,
      );
      monospaceFontContext = reactCdsRoot.createContext<
        string | null | undefined
      >(undefined);
      pageBackgroundContext = reactCdsRoot.createContext<string | undefined>(
        undefined,
      );
      naturalImageTilesContext = reactCdsRoot.createContext<
        boolean | undefined
      >(undefined);
      densityOverrideContext = reactCdsRoot.createContext<Density | undefined>(
        undefined,
      );
      surfaceBackgroundContext = reactCdsRoot.createContext<string | undefined>(
        undefined,
      );
      localeContext = reactCdsRoot.createContext<string | undefined>(undefined);
      rootElementContext = reactCdsRoot.createContext<HTMLElement | undefined>(
        undefined,
      );
      rootPortalContainerContext =
        reactCdsRoot.createContext<Layers.PortalContainer>(undefined);
      isPortalRootContext = reactCdsRoot.createContext<boolean>(false);
      opaqueTintOverrides = Object.fromEntries(
        accentColorNames.map((accentColor: string) => [
          `--cds-bg-tint-${accentColor}`,
          `var(--cds-bg-tint-${accentColor}-opaque)`,
        ]),
      );
      surfaceTokenNames = new Set([
        "surface-0",
        "surface-1",
        "surface-2",
        "surface-3",
        "fill-accent",
      ]);
    });
  };
}

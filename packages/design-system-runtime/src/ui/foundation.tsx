import { useUiLocale } from '../ui-locale.ts';
import type * as Overlays from "../contracts/overlays";
import type * as React from "react";
import type {
  MediaQueryWindow,
  ExternalStore,
  CoarsePointerStore,
  SafeObserver,
  SafeResizeObserver,
  SafeMutationObserver,
  DocumentInputState,
  InputFocusEvent,
  DocumentFont,
  CustomStyle,
  KeyboardInset,
  SheetFrame,
  SheetBounds,
  SheetDragGeometry,
  SheetDragRelease,
  SheetRelease,
  SheetDragSettings,
  BrowserWindow,
  CloseWatcherHandle,
  SheetState,
  OverlayPresentation,
  MutableCell,
  SheetLevel,
  SheetLevelHandle,
  SheetGestureSession,
  OverlayActions,
  PublicOverlayActions,
  SheetRuntimeFrame,
  SheetFrameResult,
  SheetDetent,
  SheetParentState,
  ThemeClassGroup,
  ThemeTokenManifest,
  TransitionRunner,
} from "../contracts/dom";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { initializeOnce, toModuleNamespace } from "../module-helpers";
import { initializeCdsRoot, initializeSheetImplementation, isSheetImplementationLoaded, preloadSheetImplementation, useLoadedSheetImplementation, useRootWindow, useSheetImplementationFailed, useSheetImplementationLoaded } from "./overlays";

import { set_accentColorNames } from "../module-helpers";
var initializeAccentColors: () => void;
var reactMediaQuery: typeof React;
var MOBILE_COARSE_POINTER_QUERY: string;
var mediaQueryStores: WeakMap<
  MediaQueryWindow,
  Map<string, ExternalStore<boolean>>
>;
var subscribeNoop: ExternalStore<boolean>["subscribe"];
var getFalseSnapshot: () => boolean;
var COARSE_POINTER_QUERY_rG: string;
var initializeMediaQueryStores: () => void;
var coarsePointerStores: WeakMap<MediaQueryWindow, CoarsePointerStore>;
var initializeCoarsePointerStores: () => void;
var initializeErrorReporting: () => void;
var initializeSafeObservers: () => void;
var reactDocumentFont: typeof React;
var supportedFonts: Record<DocumentFont, boolean>;
var isSupportedFont: (input: string) => input is DocumentFont;
var readDocumentFont: () => DocumentFont | undefined;
var subscribeFontNoop: ExternalStore<DocumentFont | undefined>["subscribe"];
var getUndefinedFontSnapshot: () => undefined;
var initializeDocumentFont: () => void;
var reactFeatureFlags: typeof React;
var featureFlagContext: React.Context<string | undefined>;
var initializeFeatureFlags: () => void;
var inputDismissalStates: WeakMap<Document, DocumentInputState>;
var dismissalKeys: Set<string>;
var initializeInputDismissalTracking: () => void;
var transitionRunner: TransitionRunner | undefined;
var initializeTransitionRunner: () => void;
var reactIsomorphicLayoutEffect: typeof React;
var useIsomorphicLayoutEffect: typeof React.useLayoutEffect;
var initializeIsomorphicLayoutEffect: () => void;
var initializeIconSupport: () => void;
var reactAndroidCloseWatcher: typeof React;
var initializeAndroidCloseWatcher: () => void;
var sheetDragSettings: SheetDragSettings;
var initializeSheetDragSettings: () => void;
var SAFE_AREA_TOP_CSS: string;
var VIEWPORT_HEIGHT_EXCLUDING_SAFE_AREA_CSS: string;
var baseSheetPositionerStyle: CustomStyle;
var sheetPositioningOverrides: {
  disableAnchorTracking: boolean;
  collisionAvoidance: {
    side: "none";
    align: "none";
  };
};
var MAX_SHEET_HEIGHT_FRACTION: number;
var MAX_SHEET_HEIGHT_CSS: string;
var MAX_SHEET_OVERSHOOT_HEIGHT_CSS: string;
var SHEET_DENSITY: Overlays.Density;
var MIN_SHEET_HEIGHT_FRACTION: number;
var MIN_SHEET_HEIGHT_CSS: string;
var initializeSheetStyles: () => void;
var initializeElementAccess: () => void;
var reactEventCallbacks: typeof React;
var initializeEventCallbacks: () => void;
var reactVisualKeyboard: typeof React;
var EDITABLE_ELEMENT_SELECTOR: string;
var KEYBOARD_MINIMUM_HEIGHT: number;
var VIEWPORT_SCALE_TOLERANCE: number;
var initializeVisualKeyboard: () => void;
var reactPresentationMode: typeof React;
var presentationModeContext: React.Context<OverlayPresentation>;
var SHEET_DRILLED_ATTRIBUTE: string;
var SHEET_COVERED_ATTRIBUTE: string;
var SHEET_PEELING_ATTRIBUTE: string;
var SHEET_TREE_CLOSING_ATTRIBUTE: string;
var SHEET_SCROLL_ATTRIBUTE: string;
var SHEET_PRESSED_ATTRIBUTE: string;
var SHEET_CONTROL_HELD_ATTRIBUTE: string;
var OVERLAY_CLOSE_FALLBACK_MS: number;
var initializePresentationMode: () => void;
var reactInertProps: typeof React;
var reactMajorVersion: number;
var supportsBooleanInert: boolean;
var initializeInertProps: () => void;
var reactOverlayActions: typeof React;
var initializeOverlayActions: () => void;
var reactAdaptiveSheets: typeof React;
var jsxAdaptiveSheets: typeof import("react/jsx-runtime");
var sheetFrameContext: React.Context<Overlays.SheetFrameContext | null>;
var getStackedSheetCanGrow: (levels: readonly SheetLevel[]) => boolean;
var sheetParentContext: React.Context<SheetParentState | null>;
var sheetStateContext: React.Context<SheetState>;
var inertElementProps: {
  inert?: boolean | "";
};
var SHEET_IMPLEMENTATION_WAIT_MS: number;
var sheetImplementationUnavailable: boolean;
var sheetImplementationWaiters: Set<() => void>;
var ambientCloseReasons: Set<string>;
var SHEET_UNCOVER_CLOSE_GRACE_MS: number;
var LIVE_REGION_SELECTOR: string;
var defaultSheetState: SheetState;
var emptySheetRef: React.RefCallback<HTMLDivElement>;
var defaultSheetHost: Overlays.SheetRenderState;
var concealedSheetHost: Overlays.SheetRenderState;
var sheetCoverContext: React.Context<((token: object) => () => void) | null>;
var initializeAdaptiveSheets: () => void;
var reactReducedMotion: typeof React;
var REDUCED_MOTION_QUERY: string;
var REDUCED_MOTION_ATTRIBUTE: string;
var initializeReducedMotion: () => void;
var SHEET_DURATION_CLASS: string;
var sheetTransitionClasses: string;
var sheetRadiusClasses: string;
var sheetPopupClasses: string;
var SHEET_DISMISS_TRANSLATE_CSS: string;
var sheetDrillBodyClasses: string;
var sheetBackdropClasses: string;
var transparentSheetBackdropClasses: string;
var sheetOverflowBackgroundClasses: string;
var sheetClipClasses: string;
var sheetSeparatorClasses: string;
var initializeSheetClassNames: () => void;
var reactSheetDrag: typeof React;
var initializeSheetDrag: () => void;
var THEME_TOKEN_SCHEMA_DESCRIPTION: string;
var typographyScaleNames: string[];
var typographyWeightNames: string[];
var themeTokenKeys: Record<ThemeClassGroup, string[]>;
var themeTokenManifest: ThemeTokenManifest;
var initializeThemeTokenManifest: () => void;
function getMediaQueryStore(
  windowObject: MediaQueryWindow,
  query: string,
): ExternalStore<boolean> | null {
  if (typeof windowObject.matchMedia !== "function") {
    return null;
  }
  let windowStores = mediaQueryStores.get(windowObject);
  if (windowStores === undefined) {
    windowStores = new Map();
    mediaQueryStores.set(windowObject, windowStores);
  }
  let store = windowStores.get(query);
  if (store === undefined) {
    let value = windowObject.matchMedia(query);
    store = {
      subscribe: (listener: () => void) => {
        value.addEventListener("change", listener);
        return () => value.removeEventListener("change", listener);
      },
      getSnapshot: () => value.matches,
    };
    windowStores.set(query, store);
  }
  return store;
}
function useMediaQuery__U(
  windowObject: MediaQueryWindow | null | undefined,
  query: string,
): boolean {
  let store =
    windowObject === null || windowObject === undefined
      ? null
      : getMediaQueryStore(windowObject, query);
  return reactMediaQuery.useSyncExternalStore(
    store === null ? subscribeNoop : store.subscribe,
    store === null ? getFalseSnapshot : store.getSnapshot,
    getFalseSnapshot,
  );
}
function resolveWindow(
  windowOverride?: MediaQueryWindow,
): MediaQueryWindow | undefined {
  return (
    windowOverride ?? (typeof window === "undefined" ? undefined : window)
  );
}
function addMediaQueryListener(
  mediaQuery: MediaQueryList,
  listener: () => void,
): void {
  mediaQuery.addEventListener?.("change", listener);
}
function removeMediaQueryListener(
  mediaQuery: MediaQueryList,
  listener: () => void,
): void {
  mediaQuery.removeEventListener?.("change", listener);
}
function notifySubscribers(subscribers: Set<() => void>): void {
  let errors: unknown[] = [];
  for (let value of Array.from(subscribers)) {
    try {
      if (subscribers.has(value)) {
        value();
      }
    } catch (error: unknown) {
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    throw errors[0];
  }
}
function createCoarsePointerStore(
  windowObject: MediaQueryWindow,
  previousStore: CoarsePointerStore | undefined,
): CoarsePointerStore {
  let subscribers = previousStore?.subscribers ?? new Set(),
    mediaQuery = windowObject.matchMedia(COARSE_POINTER_QUERY_rG),
    store: CoarsePointerStore = {
      source: windowObject.matchMedia,
      list: mediaQuery,
      coarse: mediaQuery.matches,
      subscribers: subscribers,
      onListChange: () => {
        store.coarse = mediaQuery.matches;
        notifySubscribers(subscribers);
      },
    };
  if (subscribers.size > 0) {
    if (previousStore !== undefined) {
      removeMediaQueryListener(
        previousStore.list,
        previousStore.onListChange,
      );
    }
    addMediaQueryListener(mediaQuery, store.onListChange);
    if (
      previousStore !== undefined &&
      previousStore.coarse !== store.coarse
    ) {
      queueMicrotask(() => notifySubscribers(subscribers));
    }
  } else {
    queueMicrotask(() => {
      if (
        subscribers.size === 0 &&
        coarsePointerStores.get(windowObject) === store
      ) {
        coarsePointerStores.delete(windowObject);
      }
    });
  }
  coarsePointerStores.set(windowObject, store);
  return store;
}
function getCoarsePointerSnapshot(
  windowOverride?: MediaQueryWindow,
): boolean {
  let windowObject = resolveWindow(windowOverride);
  if (typeof windowObject?.matchMedia !== "function") {
    return false;
  }
  let store = coarsePointerStores.get(windowObject);
  if (store === undefined || store.source !== windowObject.matchMedia) {
    return createCoarsePointerStore(windowObject, store).coarse;
  }
  if (store.subscribers.size === 0) {
    store.coarse = store.list.matches;
  }
  return store.coarse;
}
function subscribeCoarsePointer(
  listener: () => void,
  windowOverride?: MediaQueryWindow,
): () => void {
  let windowObject = resolveWindow(windowOverride);
  if (typeof windowObject?.matchMedia !== "function") {
    return () => {
      return;
    };
  }
  let previousStore = coarsePointerStores.get(windowObject),
    store =
      previousStore !== undefined &&
      previousStore.source === windowObject.matchMedia
        ? previousStore
        : createCoarsePointerStore(windowObject, previousStore),
    { subscribers: subscribers } = store;
  if (subscribers.size === 0) {
    addMediaQueryListener(store.list, store.onListChange);
    store.coarse = store.list.matches;
  }
  let notify = () => listener();
  subscribers.add(notify);
  return () => {
    if (!subscribers.delete(notify) || subscribers.size > 0) {
      return;
    }
    let entry = coarsePointerStores.get(windowObject);
    if (entry?.subscribers === subscribers) {
      removeMediaQueryListener(entry.list, entry.onListChange);
      coarsePointerStores.delete(windowObject);
    }
  };
}
function reportAsyncError(error: unknown): void {
  if (typeof reportError === "function") {
    reportError(error);
  } else {
    queueMicrotask(() => {
      throw error;
    });
  }
}
function invokeAndReportError(operation: () => void): void {
  try {
    operation();
  } catch (value: unknown) {
    reportAsyncError(value);
  }
}
function createSafeObserver<Observer>(
  constructObserver: () => Observer,
): SafeObserver<Observer> {
  let reported: boolean = false,
    reportOnce = (error: unknown): void => {
      if (!reported) {
        reported = true;
        reportAsyncError(error);
      }
    },
    observer: Observer | null = null;
  try {
    observer = constructObserver();
  } catch (value: unknown) {
    reportOnce(value);
  }
  return {
    observer: observer,
    attempt(observeTarget: (observer: Observer) => void): boolean {
      if (observer === null) {
        return false;
      }
      try {
        observeTarget(observer);
        return true;
      } catch (value: unknown) {
        reportOnce(value);
        return false;
      }
    },
  };
}
function createSafeResizeObserver(
  ObserverConstructor: typeof ResizeObserver,
  onResize: ResizeObserverCallback,
): SafeResizeObserver {
  let safeObserver = createSafeObserver(
    () => new ObserverConstructor(onResize),
  );
  return {
    observe: (element: Element, resizeOptions?: ResizeObserverOptions) =>
      safeObserver.attempt((observer) =>
        resizeOptions === undefined
          ? observer.observe(element)
          : observer.observe(element, resizeOptions),
      ),
    unobserve: (element: Element) => safeObserver.observer?.unobserve(element),
    disconnect: () => safeObserver.observer?.disconnect(),
  };
}
function createSafeMutationObserver(
  ObserverConstructor: typeof MutationObserver,
  onMutation: MutationCallback,
): SafeMutationObserver {
  let safeObserver = createSafeObserver(
    () => new ObserverConstructor(onMutation),
  );
  return {
    observe: (node: Node, mutationOptions?: MutationObserverInit) =>
      safeObserver.attempt((observer) => observer.observe(node, mutationOptions)),
    disconnect: () => safeObserver.observer?.disconnect(),
    takeRecords: () => safeObserver.observer?.takeRecords() ?? [],
  };
}
function createFontAttributeStore(): ExternalStore<DocumentFont | undefined> {
  let value: DocumentFont | undefined,
    flag = false,
    callback = () => {
      let previousFont = value;
      value = readDocumentFont();
      flag = true;
      return value !== previousFont;
    };
  return {
    subscribe: (listener: () => void) => {
      if (typeof MutationObserver === "undefined") {
        return () => {
          return;
        };
      }
      let fontObserver = createSafeMutationObserver(MutationObserver, () => {
        if (callback()) {
          listener();
        }
      });
      fontObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-font"],
      });
      if (callback()) {
        queueMicrotask(listener);
      }
      return () => {
        fontObserver.disconnect();
        flag = false;
      };
    },
    getSnapshot: () => {
      if (!flag) {
        callback();
      }
      return value;
    },
  };
}
function useDocumentFont(enabled?: boolean): DocumentFont | undefined {
  let [store] = reactDocumentFont.useState(createFontAttributeStore);
  return reactDocumentFont.useSyncExternalStore(
    enabled ? store.subscribe : subscribeFontNoop,
    enabled ? store.getSnapshot : getUndefinedFontSnapshot,
    getUndefinedFontSnapshot,
  );
}
function useFeatureFlagAttribute(): string | undefined {
  return reactFeatureFlags.useContext(featureFlagContext);
}
function mergeFeatureFlagNames(
  existingNames: string | undefined,
  additionalNames: readonly string[] | undefined,
): string | undefined {
  if (!additionalNames?.length) {
    return existingNames;
  }
  let names = new Set(existingNames?.split(" "));
  for (let value of additionalNames) {
    names.add(value);
  }
  return [...names].sort().join(" ");
}
function registerInputDismissalTracking(documentObject?: Document): void {
  if (
    documentObject === undefined ||
    inputDismissalStates.has(documentObject)
  ) {
    return;
  }
  let inputState = {
    observedInput: false,
    lastInputDismissing: false,
  };
  inputDismissalStates.set(documentObject, inputState);
  let eventTarget: Pick<Document, "addEventListener"> =
    documentObject.defaultView ?? documentObject;
  eventTarget.addEventListener(
    "keydown",
    (keyEvent) => {
      if (!keyEvent.isTrusted) {
        return;
      }
      inputState.observedInput = true;
      inputState.lastInputDismissing =
        !keyEvent.isComposing && dismissalKeys.has(keyEvent.key);
    },
    true,
  );
  eventTarget.addEventListener(
    "pointerdown",
    (pointerEvent) => {
      if (!pointerEvent.isTrusted) {
        return;
      }
      inputState.observedInput = true;
      inputState.lastInputDismissing = true;
    },
    true,
  );
  documentObject.defaultView?.addEventListener("blur", () => {
    inputState.observedInput = false;
    inputState.lastInputDismissing = false;
  });
}
function trackInputForElement(element?: Element | null): void {
  registerInputDismissalTracking(element?.ownerDocument);
}
function isInputTriggeredBlur(event: InputFocusEvent): boolean {
  if (event.relatedTarget !== null && event.relatedTarget !== undefined) {
    return false;
  }
  let ownerDocument = event.target?.ownerDocument ?? undefined,
    inputState =
      ownerDocument === undefined || ownerDocument === null
        ? undefined
        : inputDismissalStates.get(ownerDocument);
  if (inputState === undefined || !inputState.observedInput) {
    return false;
  }
  return inputState.lastInputDismissing;
}
function runWithTransition<Value>(
  transitionName: string,
  operation: () => Promise<Value>,
): Promise<Value> {
  try {
    if (transitionRunner) {
      return Promise.resolve(transitionRunner(transitionName, operation));
    } else {
      return operation();
    }
  } catch (value: unknown) {
    return Promise.reject(
      value instanceof Error ? value : Error(String(value)),
    );
  }
}
function getResizeObserverConstructor(
  element?: Element | null,
): typeof ResizeObserver | undefined {
  return (
    element?.ownerDocument.defaultView as BrowserWindow | null | undefined
  )?.ResizeObserver;
}
function isAndroidWindow(windowObject: BrowserWindow): boolean {
  let windowNavigator = windowObject.navigator,
    platform = windowNavigator.userAgentData?.platform ?? "";
  return (
    /android/i.test(platform) || /android/i.test(windowNavigator.userAgent ?? "")
  );
}
function useAndroidCloseWatcher(
  enabled: boolean | undefined,
  onClose: (() => void) | undefined,
): void {
  let windowObject = useRootWindow() as
    | BrowserWindow
    | undefined;
  reactAndroidCloseWatcher.useEffect(() => {
    if (!enabled || windowObject === undefined || onClose === undefined) {
      return;
    }
    let CloseWatcher = windowObject.CloseWatcher;
    if (CloseWatcher === undefined || !isAndroidWindow(windowObject)) {
      return;
    }
    let value: CloseWatcherHandle | null = null,
      flag = false,
      callback = () => {
        try {
          value = new CloseWatcher();
        } catch {
          value = null;
          return;
        }
        value.onclose = () => {
          onClose();
          windowObject.addEventListener("pointerup", rearmCloseWatcher, {
            capture: true,
            once: true,
          });
          windowObject.addEventListener("keydown", rearmCloseWatcher, {
            capture: true,
            once: true,
          });
        };
      },
      rearmCloseWatcher = () => {
        windowObject.removeEventListener("pointerup", rearmCloseWatcher, {
          capture: true,
        });
        windowObject.removeEventListener("keydown", rearmCloseWatcher, {
          capture: true,
        });
        if (!flag) {
          value?.destroy();
          callback();
        }
      };
    callback();
    return () => {
      flag = true;
      windowObject.removeEventListener("pointerup", rearmCloseWatcher, {
        capture: true,
      });
      windowObject.removeEventListener("keydown", rearmCloseWatcher, {
        capture: true,
      });
      value?.destroy();
    };
  }, [enabled, windowObject, onClose]);
}
function rubberBandDistance(distance: number, overshootRoom: number): number {
  if (distance <= 0 || overshootRoom <= 0) {
    return 0;
  }
  return (
    (1 -
      1 / ((distance * sheetDragSettings.rubberBand) / overshootRoom + 1)) *
    overshootRoom
  );
}
function inverseRubberBandDistance(
  distance: number,
  overshootRoom: number,
): number {
  if (distance <= 0 || overshootRoom <= 0) {
    return 0;
  }
  return (
    ((1 / (1 - Math.min(distance, overshootRoom * 0.9) / overshootRoom) - 1) *
      overshootRoom) /
    sheetDragSettings.rubberBand
  );
}
function calculateSheetBounds(
  restHeight: number,
  availableHeight: number,
  maximumHeightFraction: number,
  canGrow: boolean = true,
): SheetBounds {
  let maximumHeight = Math.max(
      availableHeight * maximumHeightFraction,
      restHeight,
    ),
    tallHeight =
      !canGrow ||
      maximumHeight - restHeight < sheetDragSettings.detentThreshold
        ? restHeight
        : maximumHeight;
  return {
    rest: restHeight,
    tall: tallHeight,
    room: Math.max(
      0,
      (availableHeight - tallHeight) * sheetDragSettings.overshootRoom,
    ),
  };
}
function hasTallSheetDetent(bounds: SheetBounds): boolean {
  return bounds.tall > bounds.rest;
}
function calculateSheetDragGeometry(
  bounds: SheetBounds,
  rawHeight: number,
): SheetDragGeometry {
  if (rawHeight > bounds.tall) {
    return {
      height:
        bounds.tall +
        rubberBandDistance(rawHeight - bounds.tall, bounds.room),
      slide: 0,
      shown: 1,
    };
  }
  if (rawHeight >= bounds.rest) {
    return {
      height: rawHeight,
      slide: 0,
      shown: 1,
    };
  }
  let slide = bounds.rest - rawHeight;
  return {
    height: bounds.rest,
    slide: slide,
    shown: 1 - Math.min(1, slide / Math.max(1, bounds.rest)),
  };
}
function recoverRawSheetHeight(
  bounds: SheetBounds,
  height: number,
  slide: number,
): number {
  if (height > bounds.tall) {
    return (
      bounds.tall +
      inverseRubberBandDistance(height - bounds.tall, bounds.room)
    );
  }
  return Math.min(height, bounds.tall) - Math.max(0, slide);
}
function determineSheetRelease(
  bounds: SheetBounds,
  release: SheetDragRelease,
): SheetRelease {
  let { slide: slide } = calculateSheetDragGeometry(
      bounds,
      release.rawAtRelease,
    ),
    dismiss =
      release.commit &&
      slide > 0 &&
      (slide - release.caughtSlide >
        bounds.rest * sheetDragSettings.dismissFraction ||
        (release.detent === "default" &&
          release.velocity > sheetDragSettings.flingVelocity));
  if (!release.commit || dismiss) {
    return {
      dismiss: dismiss,
      detent: release.detent,
    };
  }
  if (release.rawAtGrab > bounds.rest && release.rawAtGrab < bounds.tall) {
    let value = release.rawAtRelease - release.rawAtGrab;
    if (
      value > sheetDragSettings.detentThreshold &&
      hasTallSheetDetent(bounds)
    ) {
      return {
        dismiss: false,
        detent: "tall",
      };
    }
    if (value < -sheetDragSettings.detentThreshold) {
      return {
        dismiss: false,
        detent: "default",
      };
    }
    return {
      dismiss: false,
      detent: release.detent,
    };
  }
  if (
    release.detent === "default" &&
    hasTallSheetDetent(bounds) &&
    release.rawAtRelease > bounds.rest + sheetDragSettings.detentThreshold
  ) {
    return {
      dismiss: false,
      detent: "tall",
    };
  }
  if (
    release.detent === "tall" &&
    release.rawAtRelease < bounds.tall - sheetDragSettings.detentThreshold
  ) {
    return {
      dismiss: false,
      detent: "default",
    };
  }
  return {
    dismiss: false,
    detent: release.detent,
  };
}
function getSheetPositionerStyle(
  frame?: SheetFrame | null | undefined,
): CustomStyle {
  let keyboardInset = frame?.keyboard?.inset ?? 0;
  if (keyboardInset > 0) {
    return {
      ...baseSheetPositionerStyle,
      bottom: keyboardInset,
    };
  } else {
    return baseSheetPositionerStyle;
  }
}
function getSheetAvailableHeight(
  windowObject: Pick<Window, "innerHeight" | "getComputedStyle">,
  sheetElement: Element | null | undefined,
): number {
  let positioner = sheetElement?.parentElement;
  if (positioner === null || positioner === undefined) {
    return windowObject.innerHeight;
  }
  let topMargin = Number.parseFloat(
    windowObject.getComputedStyle(positioner)?.scrollMarginTop ?? "",
  );
  if (topMargin > 0) {
    return Math.max(0, windowObject.innerHeight - topMargin);
  } else {
    return windowObject.innerHeight;
  }
}
function getSheetMinimumHeight(
  viewportHeight: number,
  hasHalfHeightFloor: boolean,
): number {
  if (hasHalfHeightFloor) {
    return viewportHeight * MIN_SHEET_HEIGHT_FRACTION;
  } else {
    return 0;
  }
}
function getSheetPopupStyle(
  frame: SheetFrame | null,
  {
    floor: floor,
    parentFrameHeight: parentFrameHeight,
  }: {
    floor?: "half" | "content";
    parentFrameHeight?: number;
  },
): CustomStyle {
  let keyboard = frame?.keyboard ?? null,
    minimumHeightCss =
      floor === "half"
        ? `min(${MIN_SHEET_HEIGHT_CSS}, ${MAX_SHEET_HEIGHT_CSS})`
        : "0px";
  return {
    ["--available-height"]: MAX_SHEET_HEIGHT_CSS,
    width: "100%",
    maxWidth: "none",
    minWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: keyboard !== null ? "0.5rem" : undefined,
    minHeight:
      keyboard !== null
        ? undefined
        : parentFrameHeight !== undefined
          ? `max(${minimumHeightCss}, ${parentFrameHeight}px)`
          : floor === "half"
            ? minimumHeightCss
            : undefined,
    maxHeight:
      keyboard !== null
        ? `calc(${keyboard.visible}px - ${SAFE_AREA_TOP_CSS} - 8px)`
        : frame?.height !== undefined
          ? MAX_SHEET_OVERSHOOT_HEIGHT_CSS
          : floor === "half"
            ? minimumHeightCss
            : MAX_SHEET_HEIGHT_CSS,
    height:
      frame?.detent === "tall"
        ? MAX_SHEET_HEIGHT_CSS
        : frame?.height !== undefined
          ? `${frame.height}px`
          : undefined,
  };
}
function asElement(node: EventTarget | null | undefined): Element | null {
  if ((node as Node | null | undefined)?.nodeType === 1) {
    return node as Element;
  } else {
    return null;
  }
}
function createRequiredRefCallback<Args extends unknown[], Result>(
  callbackRef: React.RefObject<(...args: Args) => Result>,
): (...args: Args) => Result {
  return (...args: Args): Result => callbackRef.current(...args);
}
function createOptionalRefCallback<Args extends unknown[], Result>(
  callbackRef: React.RefObject<((...args: Args) => Result) | undefined>,
): (...args: Args) => Result | undefined {
  return (...args: Args): Result | undefined => callbackRef.current?.(...args);
}
function useOptionalEventCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
): (...args: Args) => Result | undefined;
function useOptionalEventCallback<Args extends unknown[], Result>(
  callback: ((...args: Args) => Result) | undefined,
): ((...args: Args) => Result | undefined) | undefined;
function useOptionalEventCallback<Args extends unknown[], Result>(
  callback: ((...args: Args) => Result) | undefined,
): ((...args: Args) => Result | undefined) | undefined {
  let callbackRef = reactEventCallbacks.useRef(callback);
  reactEventCallbacks.useInsertionEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  let [stableCallback] = reactEventCallbacks.useState(() =>
    createOptionalRefCallback(callbackRef),
  );
  if (callback === undefined) {
    return undefined;
  } else {
    return stableCallback;
  }
}
function useEventCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result,
): (...args: Args) => Result {
  let callbackRef = reactEventCallbacks.useRef(callback);
  reactEventCallbacks.useInsertionEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  let [stableCallback] = reactEventCallbacks.useState(() =>
    createRequiredRefCallback(callbackRef),
  );
  return stableCallback;
}
function isEditableElement(element: Element | null | undefined): boolean {
  if (element === null || element === undefined) {
    return false;
  }
  if (
    element.matches(
      'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
    )
  ) {
    return true;
  }
  return (
    (asElement(element) as HTMLElement | null)?.isContentEditable === true
  );
}
function measureVisualKeyboard(
  windowObject: Pick<Window, "visualViewport" | "document">,
): KeyboardInset | null {
  let viewport = windowObject.visualViewport;
  if (viewport === undefined || viewport === null) {
    return null;
  }
  if (Math.abs((viewport.scale ?? 1) - 1) > VIEWPORT_SCALE_TOLERANCE) {
    return null;
  }
  let documentHeight = windowObject.document.documentElement.clientHeight;
  return {
    inset: Math.max(
      0,
      Math.round(documentHeight - (viewport.offsetTop + viewport.height)),
    ),
    visible: Math.round(viewport.height),
    offset: Math.max(0, Math.round(viewport.offsetTop)),
  };
}
function useVisualKeyboard(
  enabled: boolean | undefined,
  onKeyboardChange: (keyboard: KeyboardInset | null) => void,
  {
    unpan = false,
  }: {
    unpan?: boolean;
  } = {},
): void {
  let windowObject: Window | undefined = useRootWindow(),
    notifyKeyboardChange = useEventCallback(onKeyboardChange);
  reactVisualKeyboard.useEffect(() => {
    if (!enabled || windowObject === undefined) {
      return;
    }
    let visualViewport = windowObject.visualViewport;
    if (visualViewport === undefined || visualViewport === null) {
      return;
    }
    let value: KeyboardInset | null = null,
      flag = false,
      index = 0,
      callback = () => {
        index = 0;
        let measuredKeyboard = measureVisualKeyboard(windowObject),
          clientHeight = windowObject.document.documentElement.clientHeight,
          isKeyboardVisible =
            measuredKeyboard !== null &&
            measuredKeyboard.visible < clientHeight - KEYBOARD_MINIMUM_HEIGHT,
          visibleKeyboard = isKeyboardVisible ? measuredKeyboard : null;
        if (
          visibleKeyboard?.inset !== value?.inset ||
          visibleKeyboard?.visible !== value?.visible ||
          visibleKeyboard?.offset !== value?.offset
        ) {
          value = visibleKeyboard;
          notifyKeyboardChange(visibleKeyboard);
        }
        if (unpan && isKeyboardVisible && !flag && visualViewport.offsetTop > 0) {
          flag = true;
          windowObject.document.documentElement.scrollIntoView({
            block: "start",
            inline: "start",
            behavior: "instant",
          });
          windowObject.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
          });
        }
        if (!isKeyboardVisible) {
          flag = false;
        }
      },
      scheduleKeyboardMeasurement = () => {
        if (index === 0) {
          index = windowObject.requestAnimationFrame(callback);
        }
      };
    callback();
    visualViewport.addEventListener("resize", scheduleKeyboardMeasurement);
    visualViewport.addEventListener("scroll", scheduleKeyboardMeasurement);
    return () => {
      visualViewport.removeEventListener("resize", scheduleKeyboardMeasurement);
      visualViewport.removeEventListener("scroll", scheduleKeyboardMeasurement);
      if (index !== 0) {
        windowObject.cancelAnimationFrame(index);
      }
      notifyKeyboardChange(null);
    };
  }, [enabled, windowObject, notifyKeyboardChange, unpan]);
}
function useMobileSheetMediaQuery(): boolean {
  return useMediaQuery__U(
    useRootWindow(),
    MOBILE_COARSE_POINTER_QUERY,
  );
}
function usePresentationMode(): OverlayPresentation {
  return reactPresentationMode.useContext(presentationModeContext);
}
function useCoarsePresentation(): boolean {
  let fullscreenPresentationEnabled = usePresentationMode(),
    windowObject = useRootWindow(),
    coarsePointer = reactPresentationMode.useSyncExternalStore(
      subscribeNoop,
      () =>
        windowObject !== undefined &&
        (getMediaQueryStore(
          windowObject,
          "(pointer: coarse)",
        )?.getSnapshot() ??
          false),
      getFalseSnapshot,
    );
  return fullscreenPresentationEnabled === "sheet" || coarsePointer;
}
function sheetContentCanGrow(element: Element): boolean {
  if (hasEditableSheetContent(element)) {
    return true;
  }
  for (let value of Array.from(
    element.querySelectorAll(`[${SHEET_SCROLL_ATTRIBUTE}]`),
  )) {
    if (value.scrollHeight > value.clientHeight + 1) {
      return true;
    }
  }
  return false;
}
function hasEditableSheetContent(element: Element): boolean {
  return element.querySelector(EDITABLE_ELEMENT_SELECTOR) !== null;
}
function shouldUseSheetPresentation(
  mode: OverlayPresentation,
  anchored: boolean,
  mobileCoarsePointer: boolean,
): boolean {
  if (anchored) {
    return false;
  }
  if (mode !== "auto") {
    return mode === "sheet";
  }
  return mobileCoarsePointer;
}
function usePresentationWhileShowing(
  presentation: boolean,
  open: boolean,
  showing: boolean,
): boolean {
  let [capturedPresentation, setCapturedPresentation] =
      reactPresentationMode.useState(presentation),
    [previousOpen, setPreviousOpen] = reactPresentationMode.useState(open);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) {
      setCapturedPresentation(presentation);
      return presentation;
    }
  }
  if (showing) {
    return capturedPresentation;
  } else {
    return presentation;
  }
}
function useOverlayShowing(open: boolean): {
  showing: boolean;
  onOpenChangeComplete(open: boolean): void;
} {
  let [wasShowing, setWasShowing] = reactPresentationMode.useState(open);
  if (open && !wasShowing) {
    setWasShowing(true);
  }
  let onOpenChangeComplete = reactPresentationMode.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setWasShowing(false);
      }
    },
    [],
  );
  reactPresentationMode.useEffect(() => {
    if (open || !wasShowing) {
      return;
    }
    let value = setTimeout(() => {
      setWasShowing(false);
    }, OVERLAY_CLOSE_FALLBACK_MS);
    return () => {
      clearTimeout(value);
    };
  }, [open, wasShowing]);
  return {
    showing: open || wasShowing,
    onOpenChangeComplete: onOpenChangeComplete,
  };
}
function useValueCapturedOnOpen<Value>(
  open: boolean,
  readValue: () => Value,
  defaultValue: Value,
): Value {
  let [capturedState, setCapturedState] = reactPresentationMode.useState(
      () => ({
        wasOpen: open,
        value: open ? readValue() : defaultValue,
      }),
    ),
    readValueRef = reactPresentationMode.useRef(readValue);
  useIsomorphicLayoutEffect(() => {
    readValueRef.current = readValue;
  });
  useIsomorphicLayoutEffect(() => {
    if (!open) {
      return;
    }
    let value = readValueRef.current();
    setCapturedState((previousCapture) =>
      previousCapture.wasOpen && Object.is(previousCapture.value, value)
        ? previousCapture
        : {
            wasOpen: true,
            value: value,
          },
    );
  }, [open]);
  if (open !== capturedState.wasOpen) {
    let value = open ? readValue() : capturedState.value;
    setCapturedState({
      wasOpen: open,
      value: value,
    });
    return value;
  }
  return capturedState.value;
}
function getInertProps(inert: boolean): {
  inert?: boolean | "";
} {
  if (!inert) {
    return {};
  }
  return {
    inert: supportsBooleanInert ? true : "",
  };
}
function useForwardedOverlayActions(
  internalActionsRef: React.RefObject<OverlayActions | null>,
  forwardedActionsRef: React.Ref<PublicOverlayActions> | undefined,
): void {
  reactOverlayActions.useImperativeHandle(
    forwardedActionsRef,
    () => ({
      close: () => internalActionsRef.current?.close?.(),
      unmount: () => internalActionsRef.current?.unmount(),
    }),
    [internalActionsRef],
  );
}
function createMutableValue<Value>(): MutableCell<Value> {
  let value: Value | null = null;
  return {
    get: () => value,
    set: (nextValue: Value | null) => {
      value = nextValue;
    },
  };
}
function getSheetFrameHeight(
  frame: SheetFrame | null,
  windowObject: Pick<Window, "innerHeight" | "getComputedStyle"> | undefined,
  element: Element | null | undefined,
): number | undefined {
  if (frame === null) {
    return;
  }
  if (frame.detent === "tall" && windowObject !== undefined) {
    return Math.round(
      getSheetAvailableHeight(windowObject, element) *
        MAX_SHEET_HEIGHT_FRACTION,
    );
  } else {
    return frame.height;
  }
}
function getStackedSheetHeight(
  levels: readonly SheetLevel[],
): number | undefined {
  let firstLevel = levels[0],
    lastLevel = levels.at(-1);
  if (firstLevel === undefined || lastLevel === undefined) {
    return undefined;
  } else {
    return Math.max(lastLevel.height, firstLevel.height);
  }
}
function useSheetFrame(
  open: boolean,
  forwardedActionsRef: React.Ref<PublicOverlayActions> | undefined,
  onOpenChangeComplete: ((open: boolean) => void) | undefined,
  close: (() => void) | undefined,
): SheetFrameResult {
  let actionsRef = reactAdaptiveSheets.useRef<OverlayActions | null>(null);
  useForwardedOverlayActions(actionsRef, forwardedActionsRef);
  let treeId = reactAdaptiveSheets.useId(),
    [height, setHeight] = reactAdaptiveSheets.useState<number>(),
    [canGrow, setCanGrow] = reactAdaptiveSheets.useState(true),
    levelsRef = reactAdaptiveSheets.useRef<SheetLevel[]>([]),
    [detent, setDetent] =
      reactAdaptiveSheets.useState<SheetDetent>("default"),
    focusHoldsRef = reactAdaptiveSheets.useRef(new Set<object>()),
    [hasFocusHold, setHasFocusHold] = reactAdaptiveSheets.useState(false),
    [keyboard, setKeyboard] =
      reactAdaptiveSheets.useState<KeyboardInset | null>(null),
    [previousOpen, setPreviousOpen] = reactAdaptiveSheets.useState(open);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) {
      setHeight(undefined);
      setCanGrow(true);
      setDetent("default");
      setHasFocusHold(false);
    }
  }
  useIsomorphicLayoutEffect(() => {
    if (!open) {
      levelsRef.current = [];
      focusHoldsRef.current = new Set();
    }
  }, [open]);
  useVisualKeyboard(open && hasFocusHold, setKeyboard, {
    unpan: true,
  });
  let { showing: showing, onOpenChangeComplete: completeShowingTransition } =
      useOverlayShowing(open),
    notifyOpenChangeComplete = useOptionalEventCallback(onOpenChangeComplete),
    lastCompletedOpenRef = reactAdaptiveSheets.useRef<boolean | null>(null);
  reactAdaptiveSheets.useEffect(() => {
    lastCompletedOpenRef.current = null;
  }, [open]);
  let handleOpenChangeComplete = reactAdaptiveSheets.useCallback(
      (nextOpen: boolean) => {
        completeShowingTransition(nextOpen);
        if (lastCompletedOpenRef.current === nextOpen) {
          return;
        }
        lastCompletedOpenRef.current = nextOpen;
        notifyOpenChangeComplete?.(nextOpen);
      },
      [completeShowingTransition, notifyOpenChangeComplete],
    ),
    pinHeight = reactAdaptiveSheets.useCallback(
      (measuredHeight: number, grows: boolean = true) => {
        if (levelsRef.current.length > 0 || !(measuredHeight > 0)) {
          return;
        }
        levelsRef.current = [
          {
            height: Math.round(measuredHeight),
            grows: grows,
          },
        ];
        setHeight(Math.round(measuredHeight));
        setCanGrow(grows);
      },
      [],
    ),
    repinHeight = reactAdaptiveSheets.useCallback(
      (measuredHeight: number, grows?: boolean) => {
        let current = levelsRef.current,
          value = current[0];
        if (value === undefined || !(measuredHeight > 0)) {
          return;
        }
        value.height = Math.round(measuredHeight);
        if (grows !== undefined) {
          value.grows = grows;
        }
        setHeight(getStackedSheetHeight(current));
        setCanGrow(getStackedSheetCanGrow(current));
      },
      [],
    ),
    pushLevelHeight = reactAdaptiveSheets.useCallback(
      (measuredHeight: number, grows: boolean = true) => {
        let state = {
            height: Math.round(measuredHeight),
            grows: grows,
          },
          current = levelsRef.current;
        current.push(state);
        setHeight(getStackedSheetHeight(current));
        setCanGrow(getStackedSheetCanGrow(current));
        let flag = false,
          callback = () => !flag && current === levelsRef.current;
        return {
          set: (nextHeight: number, nextGrows?: boolean) => {
            if (!callback()) {
              return;
            }
            state.height = Math.round(nextHeight);
            if (nextGrows !== undefined) {
              state.grows = nextGrows;
            }
            setHeight(getStackedSheetHeight(current));
            setCanGrow(getStackedSheetCanGrow(current));
          },
          release: () => {
            if (flag) {
              return;
            }
            let value = current.indexOf(state);
            flag = true;
            if (value >= 0) {
              current.splice(value, 1);
            }
            if (current === levelsRef.current) {
              setHeight(getStackedSheetHeight(current));
              setCanGrow(getStackedSheetCanGrow(current));
            }
          },
        };
      },
      [],
    ),
    holdTextEntryFocus = reactAdaptiveSheets.useCallback(() => {
      let state = {},
        current = focusHoldsRef.current;
      current.add(state);
      setHasFocusHold(true);
      return () => {
        current.delete(state);
        if (current === focusHoldsRef.current) {
          setHasFocusHold(current.size > 0);
        }
      };
    }, []),
    closeCallback = useOptionalEventCallback(close),
    dismiss = reactAdaptiveSheets.useCallback(() => {
      if (closeCallback !== undefined) {
        closeCallback();
      } else {
        actionsRef.current?.close?.();
      }
    }, [closeCallback]),
    [dragState] = reactAdaptiveSheets.useState(
      createMutableValue<SheetGestureSession>,
    );
  return {
    showing: showing,
    frame: reactAdaptiveSheets.useMemo(
      () => ({
        treeId: treeId,
        open: open,
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
        drag: dragState,
      }),
      [
        treeId,
        open,
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
        dragState,
      ],
    ),
    actionsRef: actionsRef,
    onOpenChangeComplete: handleOpenChangeComplete,
  };
}
function useIsSheet(): boolean {
  return reactAdaptiveSheets.useContext(sheetStateContext).sheet;
}
function useSheetState(): SheetState {
  return reactAdaptiveSheets.useContext(sheetStateContext);
}
function isLiveRegionEvent(event: Event | undefined): boolean {
  let target = event?.target;
  return (
    target instanceof Element && target.closest(LIVE_REGION_SELECTOR) !== null
  );
}
function useAdaptiveSheet<Details extends Overlays.OverlayEventDetails>(
  props: Overlays.SheetPopupOptions<Details>,
): Overlays.SheetPopupResult<Details> {
  let {
      open: open,
      actionsRef: forwardedActionsRef,
      close: close,
      onOpenChange: onOpenChange,
      onOpenChangeComplete: onOpenChangeComplete,
      structurallyAnchored = false,
      closable = true,
      refuseClose: refuseClose,
    } = props,
    parentSheet = reactAdaptiveSheets.useContext(sheetParentContext),
    fullscreenPresentationEnabled = usePresentationMode(),
    mobileCoarsePointer = useMobileSheetMediaQuery(),
    sheetFrame = useSheetFrame(
      open,
      forwardedActionsRef,
      onOpenChangeComplete,
      close,
    ),
    sheetImplementationAvailable = useSheetImplementationLoaded(),
    sheetImplementationRejected = useSheetImplementationFailed(),
    coarsePresentation = useCoarsePresentation();
  reactAdaptiveSheets.useEffect(() => {
    if (
      coarsePresentation &&
      !sheetImplementationAvailable &&
      !sheetImplementationRejected
    ) {
      preloadSheetImplementation();
    }
  }, [
    coarsePresentation,
    sheetImplementationAvailable,
    sheetImplementationRejected,
    open,
  ]);
  let prefersSheet = usePresentationWhileShowing(
      shouldUseSheetPresentation(
        fullscreenPresentationEnabled,
        false,
        mobileCoarsePointer,
      ) &&
        (closable || fullscreenPresentationEnabled === "sheet"),
      open,
      sheetFrame.showing,
    ),
    [usesFallback, setUsesFallback] = reactAdaptiveSheets.useState(
      () =>
        (sheetImplementationUnavailable || sheetImplementationRejected) &&
        !sheetImplementationAvailable,
    ),
    [previousOpen, setPreviousOpen] = reactAdaptiveSheets.useState(open);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    let value =
      (sheetImplementationUnavailable || sheetImplementationRejected) &&
      !sheetImplementationAvailable;
    if (open && usesFallback !== value) {
      setUsesFallback(value);
    }
  }
  if (
    open &&
    sheetImplementationRejected &&
    !sheetImplementationAvailable &&
    !usesFallback
  ) {
    setUsesFallback(true);
  }
  let waitingForImplementation =
    prefersSheet &&
    !structurallyAnchored &&
    !sheetImplementationAvailable &&
    !usesFallback;
  reactAdaptiveSheets.useEffect(() => {
    if (!waitingForImplementation || !open) {
      return;
    }
    let callback = () => {
      if (!isSheetImplementationLoaded()) {
        sheetImplementationUnavailable = true;
        setUsesFallback(true);
      }
    };
    sheetImplementationWaiters.add(callback);
    let value = setTimeout(callback, SHEET_IMPLEMENTATION_WAIT_MS);
    return () => {
      sheetImplementationWaiters.delete(callback);
      clearTimeout(value);
    };
  }, [waitingForImplementation, open]);
  let sheet = prefersSheet && !structurallyAnchored && !usesFallback;
  useAndroidCloseWatcher(
    open && prefersSheet && !structurallyAnchored && usesFallback,
    sheetFrame.frame.dismiss,
  );
  let pending =
      sheet && sheetFrame.showing && (!sheetImplementationAvailable || !open),
    depth = sheet && parentSheet !== null ? parentSheet.depth + 1 : 0,
    coveringChildrenRef = reactAdaptiveSheets.useRef(new Set<object>()),
    lastUncoveredAtRef = reactAdaptiveSheets.useRef(0),
    [covered, setCovered] = reactAdaptiveSheets.useState(false),
    cover = reactAdaptiveSheets.useCallback((childSheet: object) => {
      coveringChildrenRef.current.add(childSheet);
      setCovered(true);
      return () => {
        coveringChildrenRef.current.delete(childSheet);
        lastUncoveredAtRef.current = Date.now();
        setCovered(coveringChildrenRef.current.size > 0);
      };
    }, []),
    [coverToken] = reactAdaptiveSheets.useState(() => ({}));
  useIsomorphicLayoutEffect(() => {
    if (!sheet || !open || parentSheet === null) {
      return;
    }
    return parentSheet.cover(coverToken);
  }, [sheet, open, parentSheet, coverToken]);
  let windowObject: Window | undefined = useRootWindow(),
    treeId = sheetFrame.frame.treeId,
    [focusOutsideCoveredSheet, setFocusOutsideCoveredSheet] =
      reactAdaptiveSheets.useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!covered || windowObject === undefined) {
      return;
    }
    let index = 0,
      callback = () => {
        let activeElement = windowObject.document.activeElement;
        if (
          activeElement !== null &&
          activeElement.closest(
            `[data-sheet-tree="${CSS.escape(treeId)}"]`,
          ) !== null
        ) {
          index = windowObject.requestAnimationFrame(callback);
          return;
        }
        setFocusOutsideCoveredSheet(true);
      };
    index = windowObject.requestAnimationFrame(callback);
    return () => {
      windowObject.cancelAnimationFrame(index);
      setFocusOutsideCoveredSheet(false);
    };
  }, [covered, treeId, windowObject]);
  let inert = covered && focusOutsideCoveredSheet,
    notifyOpenChange = useOptionalEventCallback(onOpenChange),
    refuseCloseCallback = useOptionalEventCallback(refuseClose),
    sheetRef = reactAdaptiveSheets.useRef(sheet);
  useIsomorphicLayoutEffect(() => {
    sheetRef.current = sheet;
  }, [sheet]);
  let refusesAmbientClose = reactAdaptiveSheets.useCallback(
      (details: Overlays.OverlayEventDetails) => {
        if (details.reason === undefined) {
          return false;
        }
        if (
          (coveringChildrenRef.current.size > 0 ||
            Date.now() - lastUncoveredAtRef.current <
              SHEET_UNCOVER_CLOSE_GRACE_MS) &&
          ambientCloseReasons.has(details.reason)
        ) {
          return true;
        }
        return (
          sheetRef.current &&
          details.reason === "outside-press" &&
          isLiveRegionEvent(details.event)
        );
      },
      [],
    ),
    closeRequestRef = reactAdaptiveSheets.useRef<Details | null>(null),
    takeCloseRequest = reactAdaptiveSheets.useCallback(() => {
      let current = closeRequestRef.current;
      closeRequestRef.current = null;
      if (current?.isCanceled === true) {
        return null;
      } else {
        return current;
      }
    }, []),
    handleOpenChange = reactAdaptiveSheets.useCallback(
      (nextOpen: boolean, details: Details) => {
        let value = details;
        if (!nextOpen && refusesAmbientClose(value)) {
          value.cancel?.();
          return;
        }
        if (
          !nextOpen &&
          sheetRef.current &&
          refuseCloseCallback?.(details, treeId) === true
        ) {
          value.cancel?.();
          return;
        }
        closeRequestRef.current = nextOpen ? null : value;
        if (!nextOpen) {
          windowObject?.requestAnimationFrame(() => {
            if (closeRequestRef.current === value) {
              closeRequestRef.current = null;
            }
          });
        }
        if (nextOpen && coarsePresentation) {
          preloadSheetImplementation();
        }
        notifyOpenChange?.(nextOpen, details);
      },
      [
        notifyOpenChange,
        refuseCloseCallback,
        refusesAmbientClose,
        treeId,
        coarsePresentation,
        windowObject,
      ],
    ),
    state = reactAdaptiveSheets.useMemo(
      () => ({
        sheet: sheet,
        pending: pending,
        covered: covered,
        inert: inert,
        depth: depth,
      }),
      [sheet, pending, covered, inert, depth],
    ),
    parentFrameHeight = parentSheet?.frameHeight,
    effectiveFrame = reactAdaptiveSheets.useMemo(() => {
      let value =
        sheetFrame.frame.height !== undefined &&
        parentFrameHeight !== undefined
          ? Math.max(sheetFrame.frame.height, parentFrameHeight)
          : sheetFrame.frame.height;
      if (value !== sheetFrame.frame.height) {
        return {
          ...sheetFrame.frame,
          height: value,
        };
      } else {
        return sheetFrame.frame;
      }
    }, [sheetFrame.frame, parentFrameHeight]),
    frame = reactAdaptiveSheets.useMemo(
      () => ({
        ...effectiveFrame,
        refusesAmbientClose: refusesAmbientClose,
        takeCloseRequest: takeCloseRequest,
      }),
      [effectiveFrame, refusesAmbientClose, takeCloseRequest],
    ),
    stack = reactAdaptiveSheets.useMemo(
      () => ({
        cover: cover,
      }),
      [cover],
    );
  return {
    sheet: sheet,
    showing: sheetFrame.showing,
    frame: frame,
    actionsRef: sheetFrame.actionsRef,
    onOpenChange: handleOpenChange,
    onOpenChangeComplete: sheetFrame.onOpenChangeComplete,
    modal: sheet ? true : undefined,
    state: state,
    stack: stack,
  };
}
function ResetSheetContexts({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  return (
    <sheetStateContext.Provider value={defaultSheetState}>
      <sheetParentContext.Provider value={null}>
        <sheetCoverContext.Provider value={null}>
          <sheetFrameContext.Provider value={null}>
            {children}
          </sheetFrameContext.Provider>
        </sheetCoverContext.Provider>
      </sheetParentContext.Provider>
    </sheetStateContext.Provider>
  );
}
function FloatingPositionRenderProp<
  Details extends Overlays.OverlayEventDetails,
>(
  props: Overlays.SheetPopupOptions<Details> & {
    children(value: Overlays.SheetPopupResult<Details>): React.ReactNode;
  },
): React.ReactElement {
  useUiLocale();
  let { children: children, ...remainingProps } = props,
    value = useAdaptiveSheet(remainingProps);
  return (
    <SheetContextProvider value={value}>
      {children(value)}
    </SheetContextProvider>
  );
}
function SheetContextProvider({
  value: sheetResult,
  children: children,
}: {
  value: Overlays.SheetPopupResult<Overlays.OverlayEventDetails>;
  children?: React.ReactNode;
}): React.ReactElement {
  useUiLocale();
  return (
    <sheetStateContext.Provider value={sheetResult.state}>
      <sheetCoverContext.Provider value={sheetResult.stack.cover}>
        <sheetFrameContext.Provider value={sheetResult.frame}>
          {children}
        </sheetFrameContext.Provider>
      </sheetCoverContext.Provider>
    </sheetStateContext.Provider>
  );
}
function useControllableOpen<Details extends Overlays.OverlayEventDetails>(
  props: Overlays.OverlayOpenProps<Details>,
): {
  open: boolean;
  onOpenChange(open: boolean, details: Details): void;
} {
  let [uncontrolledOpen, setUncontrolledOpen] = reactAdaptiveSheets.useState(
      props.defaultOpen ?? false,
    ),
    open = props.open ?? uncontrolledOpen,
    onOpenChange = useOptionalEventCallback(props.onOpenChange);
  return {
    open: open,
    onOpenChange: reactAdaptiveSheets.useCallback(
      (nextOpen: boolean, details: Details) => {
        onOpenChange?.(nextOpen, details);
        if (!details.isCanceled) {
          setUncontrolledOpen(nextOpen);
        }
      },
      [onOpenChange],
    ),
  };
}
function useHasSheetFrame(): boolean {
  return reactAdaptiveSheets.useContext(sheetFrameContext) !== null;
}
function useSheetCapablePresentation(): boolean {
  let value = useCoarsePresentation(),
    hasSheetFrame = reactAdaptiveSheets.useContext(sheetFrameContext) !== null;
  return value || hasSheetFrame;
}
function useSheetImplementation(): Overlays.MobileSheetParts | null {
  let implementation = useLoadedSheetImplementation(),
    frame = reactAdaptiveSheets.useContext(sheetFrameContext),
    showing = frame?.showing ?? false,
    open = frame?.open ?? false,
    { sheet: sheet } = useSheetState(),
    canCaptureImplementation = !showing || (sheet && open),
    [capturedImplementation, setCapturedImplementation] =
      reactAdaptiveSheets.useState(() =>
        implementation !== null && canCaptureImplementation
          ? implementation
          : null,
      );
  if (
    capturedImplementation === null &&
    implementation !== null &&
    canCaptureImplementation
  ) {
    setCapturedImplementation(implementation);
    return implementation;
  }
  return capturedImplementation;
}
function isReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  return (
    (typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches) ||
    document.documentElement.getAttribute(REDUCED_MOTION_ATTRIBUTE) === "true"
  );
}
function resetSheetDragStyle(sheetElement: HTMLElement): void {
  sheetElement.style.transition = "";
  sheetElement.style.translate = "";
}
function useSheetDrag(): Pick<
  React.DOMAttributes<HTMLElement>,
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
> {
  let frame = reactSheetDrag.useContext(sheetFrameContext),
    [dragOwner] = reactSheetDrag.useState(() => ({})),
    [fallbackDragState] = reactSheetDrag.useState(
      createMutableValue<SheetGestureSession>,
    ),
    dragState = frame?.drag ?? fallbackDragState,
    findTreeSheets = (element: HTMLElement) =>
      frame === null
        ? []
        : Array.from(
            element.ownerDocument.querySelectorAll<HTMLElement>(
              `[data-presentation="sheet"][data-sheet-tree="${CSS.escape(frame.treeId)}"]:not([data-ending-style])`,
            ),
          ),
    applyDragGeometry = (session: SheetGestureSession, deltaY: number) => {
      let {
        height: value,
        slide: slideOffset,
        shown: visibleFraction,
      } = calculateSheetDragGeometry(session, session.raw - deltaY);
      for (let { el: sheetElement } of session.sheets) {
        sheetElement.style.height = `${value}px`;
        sheetElement.style.translate = slideOffset > 0 ? `0 ${slideOffset}px` : "";
      }
      let scrimOpacity = visibleFraction < 1 ? visibleFraction.toFixed(3) : "";
      for (let scrim of session.scrims) {
        if (scrim.style.opacity !== scrimOpacity) {
          scrim.style.opacity = scrimOpacity;
        }
      }
    },
    onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
      if (
        frame === null ||
        !frame.open ||
        event.button !== 0 ||
        dragState.get() !== null ||
        frame.keyboard !== null
      ) {
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest(
          'button, a, input, textarea, [role="menuitem"], [role="option"], [data-cds-sheet-control]',
        ) !== null
      ) {
        return;
      }
      if (event.currentTarget.closest("[data-cds-sheet-covered]") !== null) {
        return;
      }
      let ancestor = event.currentTarget.closest<HTMLElement>(
        '[data-presentation="sheet"]',
      );
      if (ancestor === null) {
        return;
      }
      let bounds = ancestor.getBoundingClientRect(),
        height = bounds.height,
        value = ancestor.parentElement?.getBoundingClientRect().bottom,
        caughtSlide = Math.max(0, bounds.bottom - (value ?? bounds.bottom)),
        defaultView = ancestor.ownerDocument.defaultView,
        availableHeight =
          defaultView === null
            ? height
            : getSheetAvailableHeight(defaultView, ancestor);
      event.currentTarget.setPointerCapture(event.pointerId);
      let sheets = findTreeSheets(ancestor).map((sheetElement: HTMLElement) => {
          let initialInlineHeight = sheetElement.style.height;
          sheetElement.style.transition = "none";
          sheetElement.style.height = `${height}px`;
          return {
            el: sheetElement,
            height: initialInlineHeight,
          };
        }),
        canGrow = frame.canGrow || frame.detent === "tall",
        sheetBounds = calculateSheetBounds(
          Math.min(frame.height ?? height, height),
          availableHeight,
          MAX_SHEET_HEIGHT_FRACTION,
          canGrow,
        ),
        dragBounds =
          isReducedMotion() || !canGrow
            ? {
                ...sheetBounds,
                room: 0,
              }
            : sheetBounds,
        scrims = Array.from(
          ancestor.ownerDocument.querySelectorAll<HTMLElement>(
            `[data-presentation="sheet"][data-sheet-scrim="${CSS.escape(frame.treeId)}"]`,
          ),
        );
      for (let scrim of scrims) {
        scrim.style.transition = "none";
      }
      let state = {
        owner: dragOwner,
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastT: event.timeStamp,
        velocity: 0,
        detent: frame.detent,
        raw: recoverRawSheetHeight(dragBounds, height, caughtSlide),
        caughtSlide: caughtSlide,
        ...dragBounds,
        sheets: sheets,
        doc: ancestor.ownerDocument,
        scrims: scrims,
      };
      dragState.set(state);
      applyDragGeometry(state, 0);
    },
    onPointerMove = (pointerEvent: React.PointerEvent<HTMLElement>) => {
      let entry = dragState.get();
      if (
        entry === null ||
        entry.owner !== dragOwner ||
        pointerEvent.pointerId !== entry.pointerId
      ) {
        return;
      }
      let value = pointerEvent.timeStamp - entry.lastT;
      if (value > 0) {
        entry.velocity = (pointerEvent.clientY - entry.lastY) / value;
      }
      entry.lastY = pointerEvent.clientY;
      entry.lastT = pointerEvent.timeStamp;
      applyDragGeometry(entry, pointerEvent.clientY - entry.startY);
    },
    restoreDragStyles = (session: SheetGestureSession, dismiss: boolean) => {
      for (let { el: value, height: initialInlineHeight } of session.sheets) {
        if (((value.style.transition = ""), dismiss)) {
          value.style.translate = `0 ${SHEET_DISMISS_TRANSLATE_CSS}`;
        } else {
          value.style.height = initialInlineHeight;
          value.style.translate = "";
        }
      }
      for (let value of session.scrims) {
        value.style.transition = "";
        value.style.opacity = "";
      }
    },
    open = frame?.open ?? false;
  useIsomorphicLayoutEffect(() => {
    let entry = dragState.get();
    if (!open && entry !== null && entry.owner === dragOwner) {
      dragState.set(null);
      restoreDragStyles(entry, false);
    }
  }, [open, dragState, dragOwner]);
  let latestFrameRef = reactSheetDrag.useRef<{
    open: boolean;
    height: number | undefined;
    detent: SheetDetent;
  }>({
    open: false,
    height: undefined,
    detent: "default",
  });
  useIsomorphicLayoutEffect(() => {
    latestFrameRef.current = {
      open: frame?.open ?? false,
      height: frame?.height,
      detent: frame?.detent ?? "default",
    };
  }, [frame]);
  reactSheetDrag.useEffect(
    () => () => {
      let entry = dragState.get();
      if (entry !== null && entry.owner === dragOwner) {
        dragState.set(null);
        restoreDragStyles(entry, false);
      }
    },
    [dragState, dragOwner],
  );
  let finishDrag = (
    pointerEvent: React.PointerEvent<HTMLElement>,
    commit: boolean,
  ) => {
    let entry = dragState.get();
    if (
      entry === null ||
      entry.owner !== dragOwner ||
      frame === null ||
      pointerEvent.pointerId !== entry.pointerId
    ) {
      return;
    }
    dragState.set(null);
    if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
    }
    let value = entry.lastY - entry.startY,
      releaseVelocity = pointerEvent.timeStamp - entry.lastT > 100 ? 0 : entry.velocity,
      { dismiss: shouldDismiss, detent: nextDetent } = determineSheetRelease(entry, {
        detent: entry.detent,
        rawAtGrab: entry.raw,
        rawAtRelease: entry.raw - value,
        caughtSlide: entry.caughtSlide,
        velocity: releaseVelocity,
        commit: commit,
      });
    restoreDragStyles(entry, shouldDismiss);
    if (shouldDismiss) {
      frame.dismiss();
      let { doc: ownerDocument } = entry;
      ownerDocument.defaultView?.requestAnimationFrame(() => {
        let current = latestFrameRef.current;
        if (!current.open) {
          return;
        }
        let restoredHeight =
          current.detent === "tall"
            ? MAX_SHEET_HEIGHT_CSS
            : current.height !== undefined
              ? `${current.height}px`
              : "";
        for (let sheetElement of ownerDocument.querySelectorAll<HTMLElement>(
          `[data-sheet-tree="${CSS.escape(frame.treeId)}"][data-presentation="sheet"]`,
        )) {
          resetSheetDragStyle(sheetElement);
          sheetElement.style.height = restoredHeight;
        }
      });
    } else if (nextDetent !== entry.detent) {
      frame.setDetent(nextDetent);
    }
  };
  return {
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: (pointerEvent: React.PointerEvent<HTMLElement>) =>
      finishDrag(pointerEvent, true),
    onPointerCancel: (pointerEvent: React.PointerEvent<HTMLElement>) =>
      finishDrag(pointerEvent, false),
    onLostPointerCapture: (pointerEvent: React.PointerEvent<HTMLElement>) =>
      finishDrag(pointerEvent, false),
  };
}
export {
  addMediaQueryListener,
  ambientCloseReasons,
  asElement,
  baseSheetPositionerStyle,
  calculateSheetBounds,
  calculateSheetDragGeometry,
  COARSE_POINTER_QUERY_rG,
  coarsePointerStores,
  concealedSheetHost,
  createCoarsePointerStore,
  createFontAttributeStore,
  createMutableValue,
  createOptionalRefCallback,
  createRequiredRefCallback,
  createSafeMutationObserver,
  createSafeObserver,
  createSafeResizeObserver,
  defaultSheetHost,
  defaultSheetState,
  determineSheetRelease,
  dismissalKeys,
  EDITABLE_ELEMENT_SELECTOR,
  emptySheetRef,
  featureFlagContext,
  FloatingPositionRenderProp,
  getCoarsePointerSnapshot,
  getFalseSnapshot,
  getInertProps,
  getMediaQueryStore,
  getResizeObserverConstructor,
  getSheetAvailableHeight,
  getSheetFrameHeight,
  getSheetMinimumHeight,
  getSheetPopupStyle,
  getSheetPositionerStyle,
  getStackedSheetCanGrow,
  getStackedSheetHeight,
  getUndefinedFontSnapshot,
  hasEditableSheetContent,
  hasTallSheetDetent,
  inertElementProps,
  initializeAccentColors,
  initializeAdaptiveSheets,
  initializeAndroidCloseWatcher,
  initializeCoarsePointerStores,
  initializeDocumentFont,
  initializeElementAccess,
  initializeErrorReporting,
  initializeEventCallbacks,
  initializeFeatureFlags,
  initializeIconSupport,
  initializeInertProps,
  initializeInputDismissalTracking,
  initializeIsomorphicLayoutEffect,
  initializeMediaQueryStores,
  initializeOverlayActions,
  initializePresentationMode,
  initializeReducedMotion,
  initializeSafeObservers,
  initializeSheetClassNames,
  initializeSheetDrag,
  initializeSheetDragSettings,
  initializeSheetStyles,
  initializeThemeTokenManifest,
  initializeTransitionRunner,
  initializeVisualKeyboard,
  inputDismissalStates,
  inverseRubberBandDistance,
  invokeAndReportError,
  isAndroidWindow,
  isEditableElement,
  isInputTriggeredBlur,
  isLiveRegionEvent,
  isReducedMotion,
  isSupportedFont,
  jsxAdaptiveSheets,
  KEYBOARD_MINIMUM_HEIGHT,
  LIVE_REGION_SELECTOR,
  MAX_SHEET_HEIGHT_CSS,
  MAX_SHEET_HEIGHT_FRACTION,
  MAX_SHEET_OVERSHOOT_HEIGHT_CSS,
  measureVisualKeyboard,
  mediaQueryStores,
  mergeFeatureFlagNames,
  MIN_SHEET_HEIGHT_CSS,
  MIN_SHEET_HEIGHT_FRACTION,
  MOBILE_COARSE_POINTER_QUERY,
  notifySubscribers,
  OVERLAY_CLOSE_FALLBACK_MS,
  reactFeatureFlags,
  presentationModeContext,
  reactAdaptiveSheets,
  reactAndroidCloseWatcher,
  reactDocumentFont,
  reactEventCallbacks,
  reactInertProps,
  reactIsomorphicLayoutEffect,
  reactMajorVersion,
  reactMediaQuery,
  reactOverlayActions,
  reactPresentationMode,
  reactReducedMotion,
  reactSheetDrag,
  reactVisualKeyboard,
  readDocumentFont,
  recoverRawSheetHeight,
  REDUCED_MOTION_ATTRIBUTE,
  REDUCED_MOTION_QUERY,
  registerInputDismissalTracking,
  removeMediaQueryListener,
  reportAsyncError,
  ResetSheetContexts,
  resetSheetDragStyle,
  resolveWindow,
  rubberBandDistance,
  runWithTransition,
  SAFE_AREA_TOP_CSS,
  SHEET_CONTROL_HELD_ATTRIBUTE,
  SHEET_COVERED_ATTRIBUTE,
  SHEET_DENSITY,
  SHEET_DISMISS_TRANSLATE_CSS,
  SHEET_DRILLED_ATTRIBUTE,
  SHEET_DURATION_CLASS,
  SHEET_IMPLEMENTATION_WAIT_MS,
  SHEET_PEELING_ATTRIBUTE,
  SHEET_PRESSED_ATTRIBUTE,
  SHEET_SCROLL_ATTRIBUTE,
  SHEET_TREE_CLOSING_ATTRIBUTE,
  SHEET_UNCOVER_CLOSE_GRACE_MS,
  sheetBackdropClasses,
  sheetClipClasses,
  sheetContentCanGrow,
  SheetContextProvider,
  sheetCoverContext,
  sheetDragSettings,
  sheetDrillBodyClasses,
  sheetFrameContext,
  sheetImplementationUnavailable,
  sheetImplementationWaiters,
  sheetOverflowBackgroundClasses,
  sheetParentContext,
  sheetPopupClasses,
  sheetPositioningOverrides,
  sheetRadiusClasses,
  sheetSeparatorClasses,
  sheetStateContext,
  sheetTransitionClasses,
  shouldUseSheetPresentation,
  subscribeCoarsePointer,
  subscribeFontNoop,
  subscribeNoop,
  supportedFonts,
  supportsBooleanInert,
  THEME_TOKEN_SCHEMA_DESCRIPTION,
  themeTokenKeys,
  themeTokenManifest,
  trackInputForElement,
  transitionRunner,
  transparentSheetBackdropClasses,
  typographyScaleNames,
  typographyWeightNames,
  useAdaptiveSheet,
  useAndroidCloseWatcher,
  useCoarsePresentation,
  useControllableOpen,
  useDocumentFont,
  useEventCallback,
  useFeatureFlagAttribute,
  useForwardedOverlayActions,
  useHasSheetFrame,
  useIsomorphicLayoutEffect,
  useIsSheet,
  useMediaQuery__U,
  useMobileSheetMediaQuery,
  useOptionalEventCallback,
  useOverlayShowing,
  usePresentationMode,
  usePresentationWhileShowing,
  useSheetCapablePresentation,
  useSheetDrag,
  useSheetFrame,
  useSheetImplementation,
  useSheetState,
  useValueCapturedOnOpen,
  useVisualKeyboard,
  VIEWPORT_HEIGHT_EXCLUDING_SAFE_AREA_CSS,
  VIEWPORT_SCALE_TOLERANCE,
};
export function installUiFoundation(): () => void {
  return () => {
    initializeAccentColors = initializeOnce(() => {
      set_accentColorNames([
        "red",
        "orange",
        "yellow",
        "green",
        "aqua",
        "blue",
        "violet",
        "magenta",
      ]);
    });
    MOBILE_COARSE_POINTER_QUERY = "(pointer: coarse) and (max-width: 639.98px)";
    subscribeNoop = () => () => {
      return;
    };
    getFalseSnapshot = () => false;
    COARSE_POINTER_QUERY_rG = "(pointer: coarse)";
    initializeMediaQueryStores = initializeOnce(() => {
      reactMediaQuery = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      mediaQueryStores = new WeakMap();
    });
    initializeCoarsePointerStores = initializeOnce(() => {
      initializeMediaQueryStores();
      coarsePointerStores = new WeakMap();
    });
    initializeErrorReporting = () => {};
    initializeSafeObservers = initializeOnce(() => {
      initializeErrorReporting();
    });
    isSupportedFont = (font: string): font is DocumentFont =>
      Object.hasOwn(supportedFonts, font);
    readDocumentFont = (): DocumentFont | undefined => {
      if (typeof document === "undefined") {
        return;
      }
      let attribute = document.documentElement.getAttribute("data-font");
      if (attribute !== null && isSupportedFont(attribute)) {
        return attribute;
      } else {
        return undefined;
      }
    };
    subscribeFontNoop = () => () => {
      return;
    };
    getUndefinedFontSnapshot = () => {
      return;
    };
    initializeDocumentFont = initializeOnce(() => {
      initializeSafeObservers();
      reactDocumentFont = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      supportedFonts = {
        anthropic: true,
        system: true,
      };
    });
    initializeFeatureFlags = initializeOnce(() => {
      reactFeatureFlags = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      featureFlagContext = reactFeatureFlags.createContext<
        string | undefined
      >(undefined);
    });
    initializeInputDismissalTracking = initializeOnce(() => {
      inputDismissalStates = new WeakMap();
      dismissalKeys = new Set(["Escape", "Enter", " "]);
    });
    initializeTransitionRunner = () => {};
    initializeIsomorphicLayoutEffect = initializeOnce(() => {
      reactIsomorphicLayoutEffect = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      useIsomorphicLayoutEffect =
        typeof window !== "undefined"
          ? reactIsomorphicLayoutEffect.useLayoutEffect
          : reactIsomorphicLayoutEffect.useEffect;
    });
    initializeIconSupport = () => {};
    initializeAndroidCloseWatcher = initializeOnce(() => {
      initializeCdsRoot();
      reactAndroidCloseWatcher = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    initializeSheetDragSettings = initializeOnce(() => {
      sheetDragSettings = {
        detentThreshold: 40,
        dismissFraction: 0.25,
        flingVelocity: 0.8,
        rubberBand: 0.55,
        overshootRoom: 0.5,
      };
    });
    SAFE_AREA_TOP_CSS = "env(safe-area-inset-top, 0px)";
    MAX_SHEET_HEIGHT_FRACTION = 0.9;
    SHEET_DENSITY = "comfortable";
    MIN_SHEET_HEIGHT_FRACTION = 0.5;
    initializeSheetStyles = initializeOnce(() => {
      initializeSheetDragSettings();
      VIEWPORT_HEIGHT_EXCLUDING_SAFE_AREA_CSS = `(100dvh - ${SAFE_AREA_TOP_CSS})`;
      baseSheetPositionerStyle = {
        position: "fixed",
        top: "auto",
        right: 0,
        bottom: 0,
        left: 0,
        width: "auto",
        minWidth: 0,
        maxWidth: "none",
        transform: "none",
        scrollMarginTop: SAFE_AREA_TOP_CSS,
      };
      sheetPositioningOverrides = {
        disableAnchorTracking: true,
        collisionAvoidance: {
          side: "none",
          align: "none",
        },
      };
      MAX_SHEET_HEIGHT_CSS = `calc(${VIEWPORT_HEIGHT_EXCLUDING_SAFE_AREA_CSS} * ${MAX_SHEET_HEIGHT_FRACTION})`;
      MAX_SHEET_OVERSHOOT_HEIGHT_CSS = `calc(${VIEWPORT_HEIGHT_EXCLUDING_SAFE_AREA_CSS} * ${MAX_SHEET_HEIGHT_FRACTION + 0.09999999999999998 * sheetDragSettings.overshootRoom})`;
      MIN_SHEET_HEIGHT_CSS = `${MIN_SHEET_HEIGHT_FRACTION * 100}dvh`;
    });
    initializeElementAccess = () => {};
    initializeEventCallbacks = initializeOnce(() => {
      reactEventCallbacks = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    EDITABLE_ELEMENT_SELECTOR =
      'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';
    KEYBOARD_MINIMUM_HEIGHT = 120;
    VIEWPORT_SCALE_TOLERANCE = 0.01;
    initializeVisualKeyboard = initializeOnce(() => {
      initializeCdsRoot();
      initializeElementAccess();
      initializeEventCallbacks();
      reactVisualKeyboard = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    SHEET_DRILLED_ATTRIBUTE = "data-cds-sheet-drilled";
    SHEET_COVERED_ATTRIBUTE = "data-cds-sheet-covered";
    SHEET_PEELING_ATTRIBUTE = "data-cds-sheet-peeling";
    SHEET_TREE_CLOSING_ATTRIBUTE = "data-cds-sheet-tree-closing";
    SHEET_SCROLL_ATTRIBUTE = "data-cds-sheet-scroll";
    SHEET_PRESSED_ATTRIBUTE = "data-cds-sheet-pressed";
    SHEET_CONTROL_HELD_ATTRIBUTE = "data-cds-sheet-control-held";
    OVERLAY_CLOSE_FALLBACK_MS = 1000;
    initializePresentationMode = initializeOnce(() => {
      initializeMediaQueryStores();
      initializeIsomorphicLayoutEffect();
      initializeCdsRoot();
      initializeVisualKeyboard();
      reactPresentationMode = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      presentationModeContext =
        reactPresentationMode.createContext<OverlayPresentation>("auto");
    });
    initializeInertProps = initializeOnce(() => {
      reactInertProps = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      reactMajorVersion = Number.parseInt(reactInertProps.version, 10);
      supportsBooleanInert =
        !Number.isFinite(reactMajorVersion) ||
        reactMajorVersion === 0 ||
        reactMajorVersion >= 19;
    });
    initializeOverlayActions = initializeOnce(() => {
      reactOverlayActions = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    getStackedSheetCanGrow = (levels: readonly SheetLevel[]): boolean =>
      levels.at(-1)?.grows ?? true;
    SHEET_IMPLEMENTATION_WAIT_MS = 600;
    sheetImplementationUnavailable = false;
    SHEET_UNCOVER_CLOSE_GRACE_MS = 120;
    LIVE_REGION_SELECTOR =
      '[data-cds="Toast"], [aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]';
    emptySheetRef = () => {
      return;
    };
    initializeAdaptiveSheets = initializeOnce(() => {
      initializeSheetImplementation();
      initializeIsomorphicLayoutEffect();
      initializeCdsRoot();
      initializeAndroidCloseWatcher();
      initializeEventCallbacks();
      initializeInertProps();
      initializeOverlayActions();
      initializeVisualKeyboard();
      initializeSheetStyles();
      initializePresentationMode();
      reactAdaptiveSheets = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
      jsxAdaptiveSheets = toModuleNamespace(
        loadJsxNamespace(),
        1,
      );
      sheetFrameContext =
        reactAdaptiveSheets.createContext<Overlays.SheetFrameContext | null>(
          null,
        );
      sheetParentContext =
        reactAdaptiveSheets.createContext<SheetParentState | null>(null);
      sheetStateContext = reactAdaptiveSheets.createContext<SheetState>({
        sheet: false,
        pending: false,
        covered: false,
        inert: false,
        depth: 0,
      });
      inertElementProps = getInertProps(true);
      sheetImplementationWaiters = new Set();
      ambientCloseReasons = new Set([
        "outside-press",
        "focus-out",
        "escape-key",
      ]);
      defaultSheetState = {
        sheet: false,
        pending: false,
        covered: false,
        inert: false,
        depth: 0,
      };
      defaultSheetHost = {
        sheet: false,
        concealed: false,
        chrome: null,
        ref: emptySheetRef,
        style: undefined,
        positionerStyle: undefined,
        attrs: {},
        frame: null,
        state: defaultSheetState,
        stack: null,
      };
      concealedSheetHost = {
        ...defaultSheetHost,
        concealed: true,
      };
      sheetCoverContext = reactAdaptiveSheets.createContext<
        ((token: object) => () => void) | null
      >(null);
    });
    REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
    REDUCED_MOTION_ATTRIBUTE = "data-reduce-motion";
    initializeReducedMotion = initializeOnce(() => {
      reactReducedMotion = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    SHEET_DURATION_CLASS = "duration-sheet";
    sheetRadiusClasses = "rounded-t-card rounded-b-none";
    SHEET_DISMISS_TRANSLATE_CSS = "calc(100% + 1.5rem)";
    transparentSheetBackdropClasses =
      "draggable-none fixed inset-0 bg-transparent";
    sheetOverflowBackgroundClasses =
      "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-surface-3";
    sheetClipClasses = "[clip-path:inset(0_0_-200vh_0)]";
    sheetSeparatorClasses =
      "[&_[role=separator]]:-mx-1 [&_[role=separator]]:mt-0";
    initializeSheetClassNames = initializeOnce(() => {
      sheetTransitionClasses = `${SHEET_DURATION_CLASS} ease-out motion-reduce:transition-none`;
      sheetPopupClasses = `group/sheet relative w-full min-w-0 max-w-none overflow-hidden ${sheetRadiusClasses} pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-[translate,height,scale] ${sheetTransitionClasses} [&_[data-cds-sheet-scroll]]:overscroll-contain [&[data-cds-sheet-pressed]_[data-cds-sheet-scroll]]:[scroll-padding-block:0px]`;
      sheetDrillBodyClasses = `flex min-h-0 flex-1 flex-col transition-[translate] ${sheetTransitionClasses} group-data-[cds-sheet-drilled]/sheet:-translate-x-full rtl:group-data-[cds-sheet-drilled]/sheet:translate-x-full`;
      sheetBackdropClasses = `draggable-none fixed inset-0 bg-backdrop transition-opacity ${sheetTransitionClasses} data-[starting-style]:opacity-0 data-[ending-style]:opacity-0`;
    });
    initializeSheetDrag = initializeOnce(() => {
      initializeIsomorphicLayoutEffect();
      initializeReducedMotion();
      initializeSheetDragSettings();
      initializeSheetStyles();
      initializeAdaptiveSheets();
      initializeSheetClassNames();
      reactSheetDrag = toModuleNamespace(
        loadReactNamespace(),
        1,
      );
    });
    THEME_TOKEN_SCHEMA_DESCRIPTION =
      "GENERATED by `yarn gen:tokens` from tokens/theme.ts (key names of theme-extend.json sections, for src/utils/cn.ts)";
    initializeThemeTokenManifest = initializeOnce(() => {
      typographyScaleNames = [
        "caption",
        "footnote",
        "code",
        "body",
        "prose",
        "heading",
        "title",
      ];
      typographyWeightNames = ["regular", "medium", "semibold", "bold"];
      themeTokenKeys = {
        borderRadius: ["composer", "card", "chip"],
        boxShadow: [
          "sm",
          "md",
          "lg",
          "popover",
          "drop-ring",
          "drop-ring-danger",
          "drop-glow",
          "drop-glow-danger",
          "focus",
          "focus-danger",
          "field",
          "field-pressed",
          "field-drop",
          "field-ring",
          "field-hover",
          "field-invalid",
          "panel",
          "panel-sm",
          "panel-md",
          "panel-lg",
          "card-ring",
          "composer",
          "composer-hover",
          "composer-focus",
          "ring-accent",
          "ring-pro",
          "ring-warning",
          "ring-danger",
          "ring-success",
        ],
        cursor: ["interactive"],
        fontFamily: ["mono", "mono-ui", "sans", "sans-display", "voice"],
        fontWeight: ["medium", "semibold", "bold", "normal"],
        gap: ["xs", "sm", "md", "lg", "xl"],
        height: ["control", "control-nested", "icon"],
        margin: [
          "pad-xs",
          "pad-sm",
          "pad-md",
          "pad-lg",
          "pad-xl",
          "xs",
          "sm",
          "md",
          "lg",
          "xl",
        ],
        minHeight: ["control"],
        opacity: ["disabled", "icon-secondary"],
        padding: ["xs", "sm", "md", "lg", "xl"],
        size: ["control", "control-nested", "icon"],
        transitionDuration: ["fast", "snap", "base", "sheet", "slow"],
        transitionTimingFunction: ["out", "snap", "overshoot"],
        width: ["control", "control-nested", "icon"],
        zIndex: ["modal", "coachmark", "popover", "tooltip", "toast"],
      };
      themeTokenManifest = {
        $schema: THEME_TOKEN_SCHEMA_DESCRIPTION,
        TYPE_SCALE: typographyScaleNames,
        TYPE_WEIGHT_NAMES: typographyWeightNames,
        themeKeys: themeTokenKeys,
      };
    });
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { coarsePointerMediaQuery, initializeHooksMediaQuery, useWindowMediaQuery } from "../hooks/media-query";
import { initializePlatformFeatureLoader, loadApplicationFeature } from "../platform/feature-loader";
import { initializeSheetPopupHostHook, MobileSheetsSheetPopupHost } from "./chrome";
import { initializeMenuSheetPopupComponent, initializeSheetPopupPresentationJsx, initializeSheetPopupMotionJsx, MenuSheetPopup, MobileSheetsComboboxSheetBackdrop, MobileSheetsPopoverSheetBackdrop, MobileSheetsPopoverSheetContent } from "./menu-popup";
import { load_react } from "../../dependencies";
import { defineLiveExports, initializeOnce, toModuleNamespace } from "../../module-helpers";

var MobileSheetsExports: Dynamic;
var initializeSheetsLazyLoader: Dynamic;
var reactSheetsLazyLoader: Dynamic;
var SheetsLazyLoaderCurrentState: Dynamic;
var mobileSheetsFailed: Dynamic;
var SheetsLazyLoaderConstant: Dynamic;
var loadGeneration: Dynamic;
var mobileSheetsLoadPromise: Dynamic;
var SheetsLazyLoaderSubscribers: Dynamic;
var SheetsLazyLoaderHandler: Dynamic;
var getMobileSheetsLoadedSnapshot: Dynamic;
var getMobileSheetsFailedSnapshot: Dynamic;
var getMobileSheetComponentsServerSnapshot: Dynamic;
var getMobileSheetsFlagServerSnapshot: Dynamic;
var initializeMobileSheetLoader: Dynamic;
var reactForUseMobileSheetPreload: Dynamic;
var initializeMobileSheetPreload: Dynamic;
function subscribeMobileSheets(listener?: Dynamic): Dynamic {
  SheetsLazyLoaderSubscribers.add(listener);
  return (): Dynamic => {
    SheetsLazyLoaderSubscribers.delete(listener);
  };
}
function loadMobileSheets(): Dynamic {
  let startedGeneration: Dynamic = loadGeneration;
  mobileSheetsLoadPromise ??= loadApplicationFeature(
    "cds_mobile_sheets",
    (): Dynamic =>
      Promise.resolve().then(
        (): Dynamic => (initializeSheetsLazyLoader(), MobileSheetsExports),
      ),
  )
    .then(
      (loadedModule?: Dynamic): Dynamic =>
        typeof loadedModule == "object" &&
        loadedModule !== null &&
        "SheetPopupHost" in loadedModule
          ? loadedModule
          : null,
      (): Dynamic => null,
    )
    .then((resolvedModule?: Dynamic): Dynamic => {
      if (startedGeneration !== loadGeneration) return resolvedModule;
      resolvedModule === null
        ? (mobileSheetsFailed = true)
        : (SheetsLazyLoaderCurrentState = resolvedModule);
      for (let notifySubscriber of SheetsLazyLoaderSubscribers as Dynamic) notifySubscriber();
      return resolvedModule;
    });
  return mobileSheetsLoadPromise;
}
function preloadMobileSheets(): Dynamic {
  SheetsLazyLoaderCurrentState !== null ||
    mobileSheetsFailed ||
    ((SheetsLazyLoaderConstant += 1), loadMobileSheets());
}
function areMobileSheetsLoaded(): Dynamic {
  return SheetsLazyLoaderCurrentState !== null;
}
function useMobileSheetsLoaded(): Dynamic {
  return (0, reactSheetsLazyLoader.useSyncExternalStore)(
    subscribeMobileSheets,
    getMobileSheetsLoadedSnapshot,
    getMobileSheetsFlagServerSnapshot,
  );
}
function useMobileSheetsUnavailable(): Dynamic {
  return (0, reactSheetsLazyLoader.useSyncExternalStore)(
    subscribeMobileSheets,
    getMobileSheetsFailedSnapshot,
    getMobileSheetsFlagServerSnapshot,
  );
}
function useMobileSheetComponents(): Dynamic {
  return (0, reactSheetsLazyLoader.useSyncExternalStore)(
    subscribeMobileSheets,
    SheetsLazyLoaderHandler,
    getMobileSheetComponentsServerSnapshot,
  );
}
function useMobileSheetPreload(shouldPreload?: Dynamic, preloadWindow?: Dynamic): Dynamic {
  let isCoarsePointer: Dynamic = useWindowMediaQuery(
    shouldPreload ? preloadWindow : undefined,
    coarsePointerMediaQuery,
  );
  (0, reactForUseMobileSheetPreload.useEffect)((): Dynamic => {
    shouldPreload && isCoarsePointer && preloadMobileSheets();
  }, [shouldPreload, isCoarsePointer]);
}
export {
  areMobileSheetsLoaded,
  initializeMobileSheetLoader,
  initializeSheetsLazyLoader,
  initializeMobileSheetPreload,
  loadMobileSheets,
  MobileSheetsExports,
  mobileSheetsFailed,
  preloadMobileSheets,
  reactSheetsLazyLoader,
  reactForUseMobileSheetPreload,
  SheetsLazyLoaderConstant,
  SheetsLazyLoaderCurrentState,
  SheetsLazyLoaderHandler,
  getMobileSheetsLoadedSnapshot,
  getMobileSheetsFailedSnapshot,
  getMobileSheetComponentsServerSnapshot,
  getMobileSheetsFlagServerSnapshot,
  SheetsLazyLoaderSubscribers,
  subscribeMobileSheets,
  useMobileSheetComponents,
  useMobileSheetPreload,
  useMobileSheetsLoaded,
  useMobileSheetsUnavailable,
};
export function installCdsSheetsLazyLoader(): () => void {
  return () => {
    MobileSheetsExports = {};
    defineLiveExports(MobileSheetsExports, {
      ComboboxSheetBackdrop: (): Dynamic =>
        MobileSheetsComboboxSheetBackdrop,
      MenuSheetPopup: (): Dynamic => MenuSheetPopup,
      PopoverSheetBackdrop: (): Dynamic =>
        MobileSheetsPopoverSheetBackdrop,
      PopoverSheetContent: (): Dynamic =>
        MobileSheetsPopoverSheetContent,
      SheetPopupHost: (): Dynamic => MobileSheetsSheetPopupHost,
    });
    initializeSheetsLazyLoader = initializeOnce((): Dynamic => {
      "use client";

      initializeSheetPopupHostHook();
      initializeMenuSheetPopupComponent();
      initializeSheetPopupPresentationJsx();
      initializeSheetPopupMotionJsx();
    });
    initializeMobileSheetLoader = initializeOnce((): Dynamic => {
      "use client";

      initializePlatformFeatureLoader();
      reactSheetsLazyLoader = toModuleNamespace(
        load_react(),
      );
      SheetsLazyLoaderCurrentState = null;
      mobileSheetsFailed = false;
      SheetsLazyLoaderConstant = 0;
      loadGeneration = 0;
      mobileSheetsLoadPromise = null;
      SheetsLazyLoaderSubscribers = new Set();
      SheetsLazyLoaderHandler = (): Dynamic => SheetsLazyLoaderCurrentState;
      getMobileSheetsLoadedSnapshot = (): Dynamic =>
        SheetsLazyLoaderCurrentState !== null;
      getMobileSheetsFailedSnapshot = (): Dynamic => mobileSheetsFailed;
      getMobileSheetComponentsServerSnapshot = (): Dynamic => null;
      getMobileSheetsFlagServerSnapshot = (): Dynamic => false;
    });
    initializeMobileSheetPreload = initializeOnce((): Dynamic => {
      "use client";

      initializeMobileSheetLoader();
      initializeHooksMediaQuery();
      reactForUseMobileSheetPreload = toModuleNamespace(
        load_react(),
      );
    });
  };
}

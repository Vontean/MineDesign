/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { coarsePointerMediaQuery, initializeHooksMediaQuery, useWindowMediaQuery } from "../hooks/media-query";
import { initializePlatformFeatureLoader, loadApplicationFeature } from "../platform/feature-loader";
import { initializeSheetsChrome_3, MobileSheetsSheetPopupHost } from "./chrome";
import { initializeSheetsMenuPopup_4, initializeSheetsMenuPopup_5, initializeSheetsMenuPopup_6, MenuSheetPopup, MobileSheetsComboboxSheetBackdrop, MobileSheetsPopoverSheetBackdrop, MobileSheetsPopoverSheetContent } from "./menu-popup";
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
var SheetsLazyLoaderHandler_2: Dynamic;
var SheetsLazyLoaderHandler_3: Dynamic;
var SheetsLazyLoaderHandler_4: Dynamic;
var SheetsLazyLoaderHandler_5: Dynamic;
var initializeMobileSheetLoader: Dynamic;
var reactSheetsLazyLoader_2: Dynamic;
var initializeSheetsLazyLoader_2: Dynamic;
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
    SheetsLazyLoaderHandler_2,
    SheetsLazyLoaderHandler_5,
  );
}
function useMobileSheetsUnavailable(): Dynamic {
  return (0, reactSheetsLazyLoader.useSyncExternalStore)(
    subscribeMobileSheets,
    SheetsLazyLoaderHandler_3,
    SheetsLazyLoaderHandler_5,
  );
}
function useMobileSheetComponents(): Dynamic {
  return (0, reactSheetsLazyLoader.useSyncExternalStore)(
    subscribeMobileSheets,
    SheetsLazyLoaderHandler,
    SheetsLazyLoaderHandler_4,
  );
}
function useMobileSheetPreload(shouldPreload?: Dynamic, preloadWindow?: Dynamic): Dynamic {
  let isCoarsePointer: Dynamic = useWindowMediaQuery(
    shouldPreload ? preloadWindow : undefined,
    coarsePointerMediaQuery,
  );
  (0, reactSheetsLazyLoader_2.useEffect)((): Dynamic => {
    shouldPreload && isCoarsePointer && preloadMobileSheets();
  }, [shouldPreload, isCoarsePointer]);
}
export {
  areMobileSheetsLoaded,
  initializeMobileSheetLoader,
  initializeSheetsLazyLoader,
  initializeSheetsLazyLoader_2,
  loadMobileSheets,
  MobileSheetsExports,
  mobileSheetsFailed,
  preloadMobileSheets,
  reactSheetsLazyLoader,
  reactSheetsLazyLoader_2,
  SheetsLazyLoaderConstant,
  loadGeneration as SheetsLazyLoaderConstant_2,
  SheetsLazyLoaderCurrentState,
  mobileSheetsLoadPromise as SheetsLazyLoaderCurrentState_2,
  SheetsLazyLoaderHandler,
  SheetsLazyLoaderHandler_2,
  SheetsLazyLoaderHandler_3,
  SheetsLazyLoaderHandler_4,
  SheetsLazyLoaderHandler_5,
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

      initializeSheetsChrome_3();
      initializeSheetsMenuPopup_4();
      initializeSheetsMenuPopup_5();
      initializeSheetsMenuPopup_6();
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
      SheetsLazyLoaderHandler_2 = (): Dynamic =>
        SheetsLazyLoaderCurrentState !== null;
      SheetsLazyLoaderHandler_3 = (): Dynamic => mobileSheetsFailed;
      SheetsLazyLoaderHandler_4 = (): Dynamic => null;
      SheetsLazyLoaderHandler_5 = (): Dynamic => false;
    });
    initializeSheetsLazyLoader_2 = initializeOnce((): Dynamic => {
      "use client";

      initializeMobileSheetLoader();
      initializeHooksMediaQuery();
      reactSheetsLazyLoader_2 = toModuleNamespace(
        load_react(),
      );
    });
  };
}

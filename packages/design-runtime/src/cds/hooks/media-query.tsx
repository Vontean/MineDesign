import type { MediaQueryStore } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactHooksMediaQuery: typeof React;
var mobileSheetMediaQuery: string;
var mediaQueryStores: WeakMap<Window, Map<string, MediaQueryStore>>;
var HooksMediaQueryHandler: MediaQueryStore["subscribe"];
var getMediaQueryFallbackSnapshot: () => boolean;
var coarsePointerMediaQuery: string;
var initializeHooksMediaQuery: () => void;
function getMediaQueryStore(
  view: Window,
  query: string,
): MediaQueryStore | null {
  if (typeof view.matchMedia != "function") return null;
  let storesByQuery = mediaQueryStores.get(view);
  storesByQuery === undefined &&
    ((storesByQuery = new Map()), mediaQueryStores.set(view, storesByQuery));
  let store = storesByQuery.get(query);
  if (store === undefined) {
    let mediaQueryList = view.matchMedia(query);
    store = {
      subscribe: (listener) => (
        mediaQueryList.addEventListener("change", listener),
        () => mediaQueryList.removeEventListener("change", listener)
      ),
      getSnapshot: () => mediaQueryList.matches,
    };
    storesByQuery.set(query, store);
  }
  return store;
}
function useWindowMediaQuery(
  view: Window | null | undefined,
  query: string,
): boolean {
  let store = view == null ? null : getMediaQueryStore(view, query);
  return (0, reactHooksMediaQuery.useSyncExternalStore)(
    store === null ? HooksMediaQueryHandler : store.subscribe,
    store === null ? getMediaQueryFallbackSnapshot : store.getSnapshot,
    getMediaQueryFallbackSnapshot,
  );
}
export {
  coarsePointerMediaQuery,
  getMediaQueryStore,
  HooksMediaQueryHandler,
  getMediaQueryFallbackSnapshot,
  initializeHooksMediaQuery,
  mediaQueryStores,
  mobileSheetMediaQuery,
  reactHooksMediaQuery,
  useWindowMediaQuery,
};
export function installCdsHooksMediaQuery(): () => void {
  return () => {
    initializeHooksMediaQuery = initializeOnce(() => {
      reactHooksMediaQuery = toModuleNamespace(
        load_react(),
      );
      mobileSheetMediaQuery = "(pointer: coarse) and (max-width: 639.98px)";
      mediaQueryStores = new WeakMap();
      HooksMediaQueryHandler = () => () => {};
      getMediaQueryFallbackSnapshot = () => false;
      coarsePointerMediaQuery = "(pointer: coarse)";
    });
  };
}

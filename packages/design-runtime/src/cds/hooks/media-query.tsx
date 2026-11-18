import type { MediaQueryStore } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactHooksMediaQuery: typeof React;
var mobileSheetMediaQuery: string;
var mediaQueryStores: WeakMap<Window, Map<string, MediaQueryStore>>;
var HooksMediaQueryHandler: MediaQueryStore["subscribe"];
var HooksMediaQueryHandler_2: () => boolean;
var coarsePointerMediaQuery: string;
var initializeHooksMediaQuery: () => void;
function getMediaQueryStore(
  input: Window,
  options: string,
): MediaQueryStore | null {
  if (typeof input.matchMedia != "function") return null;
  let entry = mediaQueryStores.get(input);
  entry === undefined &&
    ((entry = new Map()), mediaQueryStores.set(input, entry));
  let entry2 = entry.get(options);
  if (entry2 === undefined) {
    let value = input.matchMedia(options);
    entry2 = {
      subscribe: (input2) => (
        value.addEventListener("change", input2),
        () => value.removeEventListener("change", input2)
      ),
      getSnapshot: () => value.matches,
    };
    entry.set(options, entry2);
  }
  return entry2;
}
function useWindowMediaQuery(
  input: Window | null | undefined,
  options: string,
): boolean {
  let value = input == null ? null : getMediaQueryStore(input, options);
  return (0, reactHooksMediaQuery.useSyncExternalStore)(
    value === null ? HooksMediaQueryHandler : value.subscribe,
    value === null ? HooksMediaQueryHandler_2 : value.getSnapshot,
    HooksMediaQueryHandler_2,
  );
}
export {
  coarsePointerMediaQuery,
  getMediaQueryStore,
  HooksMediaQueryHandler,
  HooksMediaQueryHandler_2,
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
      HooksMediaQueryHandler_2 = () => false;
      coarsePointerMediaQuery = "(pointer: coarse)";
    });
  };
}

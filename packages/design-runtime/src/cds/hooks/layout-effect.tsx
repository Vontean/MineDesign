import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactHooksLayoutEffect: typeof React;
var useIsomorphicLayoutEffect: typeof React.useLayoutEffect;
var initializeHooksLayoutEffect: () => void;
export {
  initializeHooksLayoutEffect,
  reactHooksLayoutEffect,
  useIsomorphicLayoutEffect,
};
export function installCdsHooksLayoutEffect(): () => void {
  return () => {
    initializeHooksLayoutEffect = initializeOnce(() => {
      reactHooksLayoutEffect = toModuleNamespace(
        load_react(),
      );
      useIsomorphicLayoutEffect =
        typeof window !== "undefined"
          ? reactHooksLayoutEffect.useLayoutEffect
          : reactHooksLayoutEffect.useEffect;
    });
  };
}

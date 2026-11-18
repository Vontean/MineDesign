import type { OverlayActions, PublicOverlayActions } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactOverlaysImperativeHandle: typeof React;
var initializeOverlaysImperativeHandle: () => void;
function useOverlayImperativeHandle(
  input: React.RefObject<OverlayActions | null>,
  options?: React.Ref<PublicOverlayActions>,
): void {
  (0, reactOverlaysImperativeHandle.useImperativeHandle)(
    options,
    () => ({
      close: () => input.current?.close?.(),
      unmount: () => input.current?.unmount(),
    }),
    [input],
  );
}
export {
  initializeOverlaysImperativeHandle,
  reactOverlaysImperativeHandle,
  useOverlayImperativeHandle,
};
export function installCdsOverlaysImperativeHandle(): () => void {
  return () => {
    initializeOverlaysImperativeHandle = initializeOnce(() => {
      "use client";

      reactOverlaysImperativeHandle = toModuleNamespace(
        load_react(),
      );
    });
  };
}

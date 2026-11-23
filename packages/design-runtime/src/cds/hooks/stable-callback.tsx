import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var initializeHooksStableCallback: () => void;
var reactHooksStableCallback: typeof React;
var initializeStableCallbackReact: () => void;
function asElement(target: EventTarget | null | undefined): Element | null {
  return (
    (target as Node | null | undefined)?.nodeType === 1 ? target : null
  ) as Element | null;
}
function createStableCallback<Args extends unknown[], Result>(
  callbackRef: React.RefObject<(...args: Args) => Result>,
): (...args: Args) => Result {
  return (...args) => callbackRef.current(...args);
}
function createOptionalStableCallback<Args extends unknown[], Result>(
  callbackRef: React.RefObject<((...args: Args) => Result) | undefined>,
): (...args: Args) => Result | undefined {
  return (...args) => callbackRef.current?.(...args);
}
function useOptionalStableCallback<Args extends unknown[], Result>(
  latestCallback: (...args: Args) => Result,
): (...args: Args) => Result | undefined;
function useOptionalStableCallback<Args extends unknown[], Result>(
  latestCallback: ((...args: Args) => Result) | undefined,
): ((...args: Args) => Result | undefined) | undefined;
function useOptionalStableCallback<Args extends unknown[], Result>(
  latestCallback: ((...args: Args) => Result) | undefined,
): ((...args: Args) => Result | undefined) | undefined {
  let callbackRef = (0, reactHooksStableCallback.useRef)(latestCallback);
  (0, reactHooksStableCallback.useInsertionEffect)(() => {
    callbackRef.current = latestCallback;
  }, [latestCallback]);
  let [stableCallback] = (0, reactHooksStableCallback.useState)(() =>
    createOptionalStableCallback(callbackRef),
  );
  return latestCallback === undefined ? undefined : stableCallback;
}
function useStableCallback<Args extends unknown[], Result>(
  latestCallback: (...args: Args) => Result,
): (...args: Args) => Result {
  let callbackRef = (0, reactHooksStableCallback.useRef)(latestCallback);
  (0, reactHooksStableCallback.useInsertionEffect)(() => {
    callbackRef.current = latestCallback;
  }, [latestCallback]);
  let [stableCallback] = (0, reactHooksStableCallback.useState)(() =>
    createStableCallback(callbackRef),
  );
  return stableCallback;
}
export {
  asElement,
  createOptionalStableCallback,
  createStableCallback,
  initializeHooksStableCallback,
  initializeStableCallbackReact,
  reactHooksStableCallback,
  useOptionalStableCallback,
  useStableCallback,
};
export function installCdsHooksStableCallback(): () => void {
  return () => {
    initializeHooksStableCallback = initializeOnce(() => {});
    initializeStableCallbackReact = initializeOnce(() => {
      reactHooksStableCallback = toModuleNamespace(
        load_react(),
      );
    });
  };
}

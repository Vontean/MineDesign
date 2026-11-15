import type { BrowserWindow, CloseWatcherHandle } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeCdsRoot, useCdsWindow } from "../theme/root";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactOverlaysAndroidCloseWatcher: typeof React;
var initializeOverlaysAndroidCloseWatcher: () => void;
function isAndroidWindow(input: BrowserWindow): boolean {
  let navigator2 = input.navigator,
    value = navigator2.userAgentData?.platform ?? "";
  return (
    /android/i.test(value) || /android/i.test(navigator2.userAgent ?? "")
  );
}
function useAndroidCloseWatcher(input: boolean, options?: () => void): void {
  let value = (0, useCdsWindow)();
  (0, reactOverlaysAndroidCloseWatcher.useEffect)(() => {
    if (!input || value === undefined || options === undefined) return;
    let CloseWatcher = value.CloseWatcher;
    if (CloseWatcher === undefined || !isAndroidWindow(value)) return;
    let value2: CloseWatcherHandle | null = null,
      flag = false,
      callback = () => {
        try {
          value2 = new CloseWatcher();
        } catch {
          value2 = null;
          return;
        }
        value2.onclose = () => {
          options();
          value.addEventListener("pointerup", callback2, {
            capture: true,
            once: true,
          });
          value.addEventListener("keydown", callback2, {
            capture: true,
            once: true,
          });
        };
      },
      callback2 = () => {
        value.removeEventListener("pointerup", callback2, {
          capture: true,
        });
        value.removeEventListener("keydown", callback2, {
          capture: true,
        });
        flag || (value2?.destroy(), callback());
      };
    callback();
    return () => {
      flag = true;
      value.removeEventListener("pointerup", callback2, {
        capture: true,
      });
      value.removeEventListener("keydown", callback2, {
        capture: true,
      });
      value2?.destroy();
    };
  }, [input, value, options]);
}
export {
  initializeOverlaysAndroidCloseWatcher,
  isAndroidWindow,
  reactOverlaysAndroidCloseWatcher,
  useAndroidCloseWatcher,
};
export function installCdsOverlaysAndroidCloseWatcher(): () => void {
  return () => {
    initializeOverlaysAndroidCloseWatcher = (0, initializeOnce)(() => {
      "use client";

      (0, initializeCdsRoot)();
      reactOverlaysAndroidCloseWatcher = (0, toModuleNamespace)(
        (0, load_react)(),
      );
    });
  };
}

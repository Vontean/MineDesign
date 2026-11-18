import type { BrowserWindow, CloseWatcherHandle } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeCdsRoot, useCdsWindow } from "../theme/root";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactOverlaysAndroidCloseWatcher: typeof React;
var initializeOverlaysAndroidCloseWatcher: () => void;
function isAndroidWindow(browserWindow: BrowserWindow): boolean {
  let windowNavigator = browserWindow.navigator,
    platformName = windowNavigator.userAgentData?.platform ?? "";
  return (
    /android/i.test(platformName) || /android/i.test(windowNavigator.userAgent ?? "")
  );
}
function useAndroidCloseWatcher(isEnabled: boolean, onClose?: () => void): void {
  let cdsWindow = useCdsWindow();
  (0, reactOverlaysAndroidCloseWatcher.useEffect)(() => {
    if (!isEnabled || cdsWindow === undefined || onClose === undefined) return;
    let CloseWatcher = cdsWindow.CloseWatcher;
    if (CloseWatcher === undefined || !isAndroidWindow(cdsWindow)) return;
    let closeWatcher: CloseWatcherHandle | null = null,
      isDisposed = false,
      createCloseWatcher = () => {
        try {
          closeWatcher = new CloseWatcher();
        } catch {
          closeWatcher = null;
          return;
        }
        closeWatcher.onclose = () => {
          onClose();
          cdsWindow.addEventListener("pointerup", rearmCloseWatcher, {
            capture: true,
            once: true,
          });
          cdsWindow.addEventListener("keydown", rearmCloseWatcher, {
            capture: true,
            once: true,
          });
        };
      },
      rearmCloseWatcher = () => {
        cdsWindow.removeEventListener("pointerup", rearmCloseWatcher, {
          capture: true,
        });
        cdsWindow.removeEventListener("keydown", rearmCloseWatcher, {
          capture: true,
        });
        isDisposed || (closeWatcher?.destroy(), createCloseWatcher());
      };
    createCloseWatcher();
    return () => {
      isDisposed = true;
      cdsWindow.removeEventListener("pointerup", rearmCloseWatcher, {
        capture: true,
      });
      cdsWindow.removeEventListener("keydown", rearmCloseWatcher, {
        capture: true,
      });
      closeWatcher?.destroy();
    };
  }, [isEnabled, cdsWindow, onClose]);
}
export {
  initializeOverlaysAndroidCloseWatcher,
  isAndroidWindow,
  reactOverlaysAndroidCloseWatcher,
  useAndroidCloseWatcher,
};
export function installCdsOverlaysAndroidCloseWatcher(): () => void {
  return () => {
    initializeOverlaysAndroidCloseWatcher = initializeOnce(() => {
      "use client";

      initializeCdsRoot();
      reactOverlaysAndroidCloseWatcher = toModuleNamespace(
        load_react(),
      );
    });
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { initializeOnce, toModuleNamespace } from "../module-helpers";

var reactPlatformTheme: Dynamic;
var darkColorSchemeMediaQuery: Dynamic;
var documentThemePinned: Dynamic;
var PlatformThemeCurrentState: Dynamic;
var documentThemeSubscribers: Dynamic;
var documentThemeSnapshot: Dynamic;
var initializePlatformTheme: Dynamic;
function readDocumentTheme(): Dynamic {
  let value: Dynamic =
    typeof document !== "undefined"
      ? (document as Dynamic).documentElement.getAttribute("data-theme")
      : null;
  return value === "dark" || value === "light" ? value : null;
}
function readSystemTheme(): Dynamic {
  return typeof matchMedia !== "undefined" &&
    matchMedia(darkColorSchemeMediaQuery).matches
    ? "dark"
    : "light";
}
function writeDocumentTheme(theme?: Dynamic): Dynamic {
  PlatformThemeCurrentState = theme;
  (document as Dynamic).documentElement.setAttribute("data-theme", theme);
}
function refreshThemeSnapshot(): Dynamic {
  let value: Dynamic = documentThemePinned
    ? (readDocumentTheme() ?? readSystemTheme())
    : readSystemTheme();
  !documentThemePinned &&
    readDocumentTheme() !== value &&
    writeDocumentTheme(value);
  if (value !== documentThemeSnapshot) {
    documentThemeSnapshot = value;
    for (let listener of documentThemeSubscribers as Dynamic) listener();
  }
}
function subscribeDocumentTheme(listener?: Dynamic): Dynamic {
  documentThemeSubscribers.add(listener);
  return (): Dynamic => documentThemeSubscribers.delete(listener);
}
function useDocumentTheme(): Dynamic {
  return {
    resolved: (0, reactPlatformTheme.useSyncExternalStore)(
      subscribeDocumentTheme,
      (): Dynamic => documentThemeSnapshot,
      (): Dynamic => "light",
    ),
  };
}
export {
  darkColorSchemeMediaQuery,
  documentThemePinned,
  documentThemeSnapshot,
  documentThemeSubscribers,
  initializePlatformTheme,
  PlatformThemeCurrentState,
  reactPlatformTheme,
  readDocumentTheme,
  readSystemTheme,
  refreshThemeSnapshot,
  subscribeDocumentTheme,
  useDocumentTheme,
  writeDocumentTheme,
};
export function installPlatformTheme(): () => void {
  return () => {
    initializePlatformTheme = initializeOnce((): Dynamic => {
      "use strict";

      reactPlatformTheme = toModuleNamespace(
        load_react(),
        1,
      );
      darkColorSchemeMediaQuery = "(prefers-color-scheme: dark)";
      documentThemePinned = false;
      PlatformThemeCurrentState = null;
      documentThemeSubscribers = new Set();
      documentThemeSnapshot = "light";
      if (
        typeof document !== "undefined" &&
        typeof matchMedia !== "undefined"
      ) {
        let value: Dynamic = readDocumentTheme();
        value !== null &&
          value !== readSystemTheme() &&
          (documentThemePinned = true);
        documentThemeSnapshot = value ?? readSystemTheme();
        documentThemePinned || writeDocumentTheme(documentThemeSnapshot);
        matchMedia(darkColorSchemeMediaQuery).addEventListener(
          "change",
          refreshThemeSnapshot,
        );
        new MutationObserver((): Dynamic => {
          let theme: Dynamic = readDocumentTheme();
          theme !== null &&
            theme !== PlatformThemeCurrentState &&
            (documentThemePinned = true);
          refreshThemeSnapshot();
        }).observe((document as Dynamic).documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      }
    });
  };
}

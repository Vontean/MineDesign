/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactThemeExperimentalTheme: Dynamic;
var resolveThemeSnapshot: Dynamic;
var ExperimentalThemeContext: Dynamic;
var defaultThemeStore: Dynamic;
var reportedCdsWarnings: Dynamic;
var initializeExperimentalTheme: Dynamic;
function resolveExperimentalTheme(settings?: Dynamic): Dynamic {
  try {
    return settings.resolve?.(settings.theme);
  } catch (value: Dynamic) {
    warnCdsOnce(
      '<CdsRoot experimental.theme> could not resolve the theme "' +
        String(settings.theme.id) +
        '", so useTokenValue returns unthemed values. ' +
        (value instanceof Error ? value.message : String(value)),
    );
    return;
  }
}
function createThemeStore(settings?: Dynamic): Dynamic {
  let listeners: Dynamic = new Set(),
    snapshot: Dynamic = resolveThemeSnapshot(settings),
    serverSnapshot: Dynamic = snapshot,
    notify: Dynamic = (): Dynamic => {
      for (let value of listeners as Dynamic) value();
    };
  return {
    subscribe: (listener?: Dynamic): Dynamic => (
      listeners.add(listener),
      (): Dynamic => listeners.delete(listener)
    ),
    getSnapshot: (): Dynamic => snapshot,
    getServerSnapshot: (): Dynamic => serverSnapshot,
    getId: (): Dynamic => snapshot?.theme.id,
    set: (nextSettings?: Dynamic): Dynamic => {
      let value: Dynamic = resolveThemeSnapshot(nextSettings, snapshot);
      value !== snapshot && ((snapshot = value), notify());
    },
  };
}
function useThemeId(): Dynamic {
  let value: Dynamic =
    (0, reactThemeExperimentalTheme.useContext)(ExperimentalThemeContext) ??
    defaultThemeStore;
  return (0, reactThemeExperimentalTheme.useSyncExternalStore)(
    value.subscribe,
    value.getId,
    (): Dynamic => value.getServerSnapshot()?.theme.id,
  );
}
function warnCdsOnce(message?: Dynamic): Dynamic {
  reportedCdsWarnings.has(message) ||
    (reportedCdsWarnings.add(message), console.error("cds: " + message));
}
function warnThemeApplyFailure(themeId?: Dynamic, error?: Dynamic): Dynamic {
  warnCdsOnce(
    '<CdsRoot experimental.theme> could not put the theme "' +
      themeId +
      '" on the page, so the page keeps what it had (no theme, or the previous one) while useTokenValue and useCdsTheme answer for "' +
      themeId +
      '". ' +
      (error instanceof Error ? error.message : String(error)),
  );
}
function cleanupAppliedTheme(cleanupRef?: Dynamic): Dynamic {
  let cleanup: Dynamic = cleanupRef.current;
  cleanupRef.current = undefined;
  try {
    cleanup?.();
  } catch {}
}
function useExperimentalTheme(settings?: Dynamic, rootRef?: Dynamic): Dynamic {
  let value: Dynamic = (0, reactThemeExperimentalTheme.useContext)(
      ExperimentalThemeContext,
    ),
    [themeStore]: Dynamic = (0, reactThemeExperimentalTheme.useState)(
      (): Dynamic =>
        value === undefined ? createThemeStore(settings) : defaultThemeStore,
    ),
    ownsStore: Dynamic = value === undefined,
    theme: Dynamic = settings?.theme ?? undefined,
    resolve: Dynamic = settings?.resolve,
    apply: Dynamic = settings?.apply,
    applyRef: Dynamic = (0, reactThemeExperimentalTheme.useRef)(apply);
  useIsomorphicLayoutEffect((): Dynamic => {
    applyRef.current = apply;
  }, [apply]);
  let hasApply: Dynamic = apply !== undefined,
    cleanupRef: Dynamic = (0, reactThemeExperimentalTheme.useRef)(undefined);
  useIsomorphicLayoutEffect((): Dynamic => {
    ownsStore &&
      themeStore.set(
        theme === undefined
          ? undefined
          : {
              theme: theme,
              resolve: resolve,
            },
      );
  }, [ownsStore, themeStore, theme, resolve]);
  useIsomorphicLayoutEffect((): Dynamic => {
    let current: Dynamic = rootRef.current,
      applyTheme: Dynamic = applyRef.current;
    if (
      ownsStore &&
      theme !== undefined &&
      applyTheme !== undefined &&
      current !== null
    )
      try {
        cleanupRef.current = applyTheme(theme, {
          target: current,
        });
      } catch (error: Dynamic) {
        warnThemeApplyFailure(theme.id, error);
      }
    else cleanupAppliedTheme(cleanupRef);
  }, [ownsStore, theme, hasApply, rootRef]);
  useIsomorphicLayoutEffect(
    (): Dynamic => (): Dynamic => cleanupAppliedTheme(cleanupRef),
    [],
  );
  (0, reactThemeExperimentalTheme.useEffect)((): Dynamic => {}, [
    settings === null,
    theme,
    hasApply,
    value,
    rootRef,
  ]);
  return value ?? themeStore;
}
export {
  cleanupAppliedTheme,
  createThemeStore,
  defaultThemeStore,
  ExperimentalThemeContext,
  initializeExperimentalTheme,
  reactThemeExperimentalTheme,
  reportedCdsWarnings,
  resolveExperimentalTheme,
  resolveThemeSnapshot,
  useExperimentalTheme,
  useThemeId,
  warnCdsOnce,
  warnThemeApplyFailure,
};
export function installCdsThemeExperimentalTheme(): () => void {
  return () => {
    initializeExperimentalTheme = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      reactThemeExperimentalTheme = toModuleNamespace(
        load_react(),
      );
      resolveThemeSnapshot = (settings?: Dynamic, previousSnapshot?: Dynamic): Dynamic => {
        if (settings == null || settings.theme === undefined || settings.theme === null)
          return;
        let value: Dynamic = resolveExperimentalTheme(settings);
        return previousSnapshot !== undefined &&
          previousSnapshot.theme === settings.theme &&
          previousSnapshot.resolved === value
          ? previousSnapshot
          : {
              theme: settings.theme,
              resolved: value,
            };
      };
      ExperimentalThemeContext = (0, reactThemeExperimentalTheme.createContext)(
        undefined,
      );
      defaultThemeStore = createThemeStore(undefined);
      reportedCdsWarnings = new Set();
    });
  };
}

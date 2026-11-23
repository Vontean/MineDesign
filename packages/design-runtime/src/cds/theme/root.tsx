import { useUiLocale } from '../../ui-locale.ts';
import type {
  ColorMode,
  ControlSize,
  Density,
  DesignStyle,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeDomInputObservation, observeDocumentInput } from "../dom/input-observation";
import { accentColorNames, getOwnerWindow, initializeDomOwnerWindow, initializeAccentColorNames } from "../dom/owner-window";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeLinkRouter, LinkRouterContext, useLinkRouter } from "../links";
import { detectRuntimePlatform, initializePlatformRuntime } from "../platform/runtime";
import { initializeMobileSheetPreload, useMobileSheetPreload } from "../sheets/lazy-loader";
import { initializeLabelsProviderContext, LabelsProviderContext } from "../sheets/styles";
import { cn, initializeClassNames } from "./class-names";
import { ExperimentalThemeContext, initializeExperimentalTheme, useExperimentalTheme } from "./experimental-theme";
import { initializeNpm__base_ui_react_SY, load_react, load_react_jsx_runtime, npm_useRender_LL } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactThemeRoot: Dynamic;
var jsxThemeRoot: Dynamic;
var ThemeRootHandler: Dynamic;
var ThemeRootDefaultText: Dynamic;
var stylesheetsInspected: Dynamic;
var ThemeRootCompactComfortableConfig: Dynamic;
var ThemeRootXsSmBaseConfig: Dynamic;
var DensityContext: Dynamic;
var DensityContextAlias: Dynamic;
var ColorModeContext: Dynamic;
var defaultColorModeStore: Dynamic;
var ThemeRootMediaQuery: Dynamic;
var normalizeThemeModeSetting: Dynamic;
var PlatformContext: Dynamic;
var LocaleContext: Dynamic;
var FontContext: Dynamic;
var LabelsContext: Dynamic;
var ThemeRootContext: Dynamic;
var themeDensityOverrideContext: Dynamic;
var PageBackgroundContext: Dynamic;
var ExperimentalSettingsContext: Dynamic;
var RootElementContext: Dynamic;
var OverlayRootContext: Dynamic;
var RootPresenceContext: Dynamic;
var ThemeRootFromEntriesValue: Dynamic;
var ThemeRootSurface0Surface1Surface2Set: Dynamic;
var initializeCdsRoot: Dynamic;
function rootUsesCdsFont(element?: Dynamic): Dynamic {
  return (
    element === element.ownerDocument.documentElement &&
    element.style.fontSize.includes("--cds-font-size-body")
  );
}
function inspectCdsStylesheets(): Dynamic {
  if (!(stylesheetsInspected || typeof document === "undefined")) {
    stylesheetsInspected = true;
    try {
      let items: Dynamic = [],
        values: Dynamic = new Set(),
        callback: Dynamic = (layerName?: Dynamic): Dynamic => {
          if (!layerName) return;
          let rootLayerName: Dynamic = layerName.split(".")[0] ?? layerName;
          values.has(rootLayerName) || (values.add(rootLayerName), items.push(rootLayerName));
        },
        collectLayers: Dynamic = (styleSheet?: Dynamic): Dynamic => {
          let cssRules: Dynamic;
          try {
            cssRules = styleSheet.cssRules;
          } catch {
            return;
          }
          for (let rule of cssRules as Dynamic) {
            let name: Dynamic = rule.constructor.name;
            if (name === "CSSLayerStatementRule")
              for (let nestedLayerName of rule.nameList as Dynamic) callback(nestedLayerName);
            else if (name === "CSSLayerBlockRule") callback(rule.name);
            else if (name === "CSSImportRule") {
              let importRule: Dynamic = rule;
              callback(importRule.layerName);
              importRule.styleSheet && collectLayers(importRule.styleSheet);
            }
          }
        };
      for (let styleSheet of (document as Dynamic).styleSheets as Dynamic)
        collectLayers(styleSheet);
      let value: Dynamic = items.indexOf("utilities");
      if (value === -1) return;
      let cardIndex: Dynamic = items.indexOf("cds-card");
      (cardIndex === -1 || cardIndex > value) &&
        console.error(
          "cds: the `cds-card` cascade layer is " +
            (cardIndex === -1 ? "not declared" : "declared after `utilities`") +
            " in this document, so Card's stretched-link lift rules outrank consumer positioning utilities \u2014 `absolute`/`z-*` on interactive children inside <Card> will silently lose, and a `backgroundClassName` surface override stops applying, since the fill layer's resting color and hover step sit in the same layer and must rank below consumer utilities to be overridable. Fix: add `@layer cds-card;` before the `@import \"tailwindcss\"` line in this app's Tailwind entry CSS (see packages/cds/src/component-base.css \xA7 cds-card).",
        );
    } catch {}
  }
}
function getSizeAttribute(size?: ControlSize): {
  "data-size"?: Exclude<ControlSize, "base">;
} {
  return size && size !== "base"
    ? {
        "data-size": size,
      }
    : {};
}
function getControlSizeRank(density: Density, size?: ControlSize): number {
  let value =
    ThemeRootCompactComfortableConfig[density] +
    ThemeRootXsSmBaseConfig[size ?? "base"];
  return value < 1 ? 1 : value > 5 ? 5 : value;
}
function createColorModeStore(modeSetting?: Dynamic): Dynamic {
  let value: Dynamic = null,
    inheritedMode: Dynamic =
      modeSetting === undefined && typeof document !== "undefined"
        ? (document as Dynamic).documentElement.getAttribute("data-mode")
        : null,
    callback: Dynamic = (): Dynamic => modeSetting ?? normalizeThemeModeSetting(inheritedMode),
    toMode: Dynamic = (isDark?: Dynamic): Dynamic =>
      isDark ? "dark" : "light",
    mediaQuery: Dynamic,
    systemMode: Dynamic,
    flag: Dynamic = false,
    initMediaQuery: Dynamic = (): Dynamic => {
      flag ||
        ((flag = true),
        (mediaQuery =
          modeSetting !== "light" &&
          modeSetting !== "dark" &&
          typeof window !== "undefined" &&
          typeof (window as Dynamic).matchMedia == "function"
            ? (window as Dynamic).matchMedia(ThemeRootMediaQuery)
            : undefined),
        (systemMode = mediaQuery ? toMode(mediaQuery.matches) : undefined));
    },
    readInheritedMode: Dynamic = (): Dynamic => {
      value &&
        (inheritedMode =
          value.closest("[data-mode]")?.getAttribute("data-mode") ??
          (value.isConnected
            ? null
            : (document as Dynamic).documentElement.getAttribute(
                "data-mode",
              )));
    },
    toExplicitMode: Dynamic = (mode?: Dynamic): Dynamic =>
      mode === "light" || mode === "dark" ? mode : undefined,
    values: Dynamic = new Set(),
    notifyListeners: Dynamic = (): Dynamic =>
      values.forEach((listener?: Dynamic): Dynamic => listener()),
    hasPendingNotify: Dynamic = false,
    startListening: Dynamic = (): Dynamic => {
      let items: Dynamic = [];
      initMediaQuery();
      let mediaQueryList: Dynamic = mediaQuery;
      if (mediaQueryList) {
        let handleMediaChange: Dynamic = (): Dynamic => {
          systemMode = toMode(mediaQueryList.matches);
          notifyListeners();
        };
        mediaQueryList.addEventListener("change", handleMediaChange);
        items.push(
          (): Dynamic => mediaQueryList.removeEventListener("change", handleMediaChange),
        );
        let nextSystemMode: Dynamic = toMode(mediaQueryList.matches);
        nextSystemMode !== systemMode && ((systemMode = nextSystemMode), (hasPendingNotify = true));
      }
      if (modeSetting === undefined && typeof MutationObserver !== "undefined") {
        let previousInherited: Dynamic = inheritedMode;
        readInheritedMode();
        inheritedMode !== previousInherited && (hasPendingNotify = true);
        let observer: Dynamic = new MutationObserver((): Dynamic => {
          let observedPrevious: Dynamic = inheritedMode;
          readInheritedMode();
          inheritedMode !== observedPrevious && notifyListeners();
        });
        observer.observe((document as Dynamic).documentElement, {
          attributes: true,
          attributeFilter: ["data-mode"],
          subtree: true,
        });
        items.push((): Dynamic => observer.disconnect());
      }
      hasPendingNotify && ((hasPendingNotify = false), queueMicrotask(notifyListeners));
      return (): Dynamic =>
        items.forEach((cleanup?: Dynamic): Dynamic => cleanup());
    },
    stopListening: Dynamic;
  return {
    setElement: (element?: Dynamic): Dynamic => {
      value = element;
      if (modeSetting === undefined && element !== null) {
        let previousInherited: Dynamic = inheritedMode;
        readInheritedMode();
        inheritedMode !== previousInherited && values.size === 0 && (hasPendingNotify = true);
        notifyListeners();
      }
    },
    subscribe: (listener?: Dynamic): Dynamic => (
      values.size === 0 && (stopListening = startListening()),
      values.add(listener),
      (): Dynamic => {
        values.delete(listener);
        values.size === 0 && (stopListening?.(), (stopListening = undefined));
      }
    ),
    getSnapshot: (): Dynamic => (
      initMediaQuery(),
      toExplicitMode(callback()) ?? systemMode
    ),
    getServerSnapshot: (): Dynamic => toExplicitMode(modeSetting),
    getAttrSnapshot: (): Dynamic => (
      initMediaQuery(),
      modeSetting !== undefined ? (toExplicitMode(modeSetting) ?? systemMode ?? modeSetting) : undefined
    ),
    getServerAttrSnapshot: (): Dynamic => modeSetting,
    getSettingSnapshot: (): Dynamic => callback(),
    getServerSettingSnapshot: (): Dynamic => modeSetting,
  };
}
function useCdsLabels(): Dynamic {
  return (0, reactThemeRoot.useContext)(LabelsContext);
}
function useDensity(): Density {
  return (0, reactThemeRoot.useContext)(DensityContext);
}
function useResolvedColorMode(): ColorMode {
  return useColorMode() ?? "light";
}
function useColorMode(): Dynamic {
  let value: Dynamic =
    (0, reactThemeRoot.useContext)(ColorModeContext) ?? defaultColorModeStore;
  return (0, reactThemeRoot.useSyncExternalStore)(
    value.subscribe,
    value.getSnapshot,
    value.getServerSnapshot,
  );
}
function usePlatform(): Dynamic {
  return (0, reactThemeRoot.useContext)(PlatformContext) ?? "web";
}
function useLocale(): Dynamic {
  return (0, reactThemeRoot.useContext)(LocaleContext);
}
function useCdsFont(): Dynamic {
  return (0, reactThemeRoot.useContext)(FontContext);
}
function monoFontOverrideStyle(fontMono?: string | null): DesignStyle {
  if (fontMono === null)
    return {
      "--cds-font-mono-override": "initial",
    };
  let value = fontMono?.trim();
  return value
    ? {
        "--cds-font-mono-override": `"${value
            .replaceAll(/[\u0000-\u001f\u007f]/g, "")
            .replaceAll("\\", "\\\\")
            .replaceAll('"', '\\"')}",`,
      }
    : {};
}
function usePageBackground(): Dynamic {
  return (0, reactThemeRoot.useContext)(PageBackgroundContext);
}
function pageBackgroundStyle(pageBackground?: string): DesignStyle {
  return pageBackground
    ? {
        "--cds-page-bg": isBackgroundToken(pageBackground)
          ? `var(--cds-${pageBackground})`
          : sanitizeBackgroundValue(pageBackground),
        ...(isFillBackgroundToken(pageBackground) ? ThemeRootFromEntriesValue : {}),
      }
    : {};
}
function isFillBackgroundToken(token: string): boolean {
  return isBackgroundToken(token) && token.startsWith("fill-");
}
function sanitizeBackgroundValue(cssValue: string): string {
  return cssValue.replaceAll(/[\u0000-\u001f\u007f;{}*]/g, "");
}
function isBackgroundToken(token: string): boolean {
  return ThemeRootSurface0Surface1Surface2Set.has(token);
}
function useExperimentalSettings(): Dynamic {
  return (0, reactThemeRoot.useContext)(ExperimentalSettingsContext);
}
function useCdsRootElement(): Dynamic {
  return (0, reactThemeRoot.useContext)(RootElementContext);
}
function useOverlayRoot(): Dynamic {
  let value: Dynamic = (0, reactThemeRoot.useContext)(RootElementContext),
    overlayRoot: Dynamic = (0, reactThemeRoot.useContext)(OverlayRootContext),
    hasRootPresence: Dynamic = (0, reactThemeRoot.useContext)(RootPresenceContext);
  return value ?? (hasRootPresence ? undefined : overlayRoot);
}
function useCdsWindow(): Dynamic {
  return getOwnerWindow(
    (0, reactThemeRoot.useContext)(RootElementContext),
  );
}
function CdsRoot({
  density: density,
  mode: mode,
  platform: platform,
  font: font,
  fontMono: fontMono,
  pageBackground: pageBackground,
  locale: locale,
  router: router,
  labels: labels,
  experimental: experimental,
  render: render,
  className: className,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, reactThemeRoot.useContext)(DensityContext),
    inheritedPlatform: Dynamic = (0, reactThemeRoot.useContext)(PlatformContext),
    inheritedLocale: Dynamic = (0, reactThemeRoot.useContext)(LocaleContext),
    inheritedPageBackground: Dynamic = (0, reactThemeRoot.useContext)(LabelsContext),
    inheritedRouter: Dynamic = useLinkRouter(),
    inheritedLabelResolver: Dynamic = (0, reactThemeRoot.useContext)(
      LabelsProviderContext,
    ),
    inheritedDensityOverride: Dynamic = (0, reactThemeRoot.useContext)(themeDensityOverrideContext),
    densityOverride: Dynamic = experimental?.densityOverride ?? inheritedDensityOverride,
    resolvedDensity: Dynamic = densityOverride ?? density ?? value,
    resolvedRouter: Dynamic = router ?? inheritedRouter,
    mergedLabels: Dynamic = (0, reactThemeRoot.useMemo)(
      (): Dynamic =>
        labels && inheritedLabelResolver
          ? (
              key?: Dynamic,
              fallback?: Dynamic,
              values?: Dynamic,
            ): Dynamic =>
              labels(key, fallback, values) ||
              inheritedLabelResolver(key, fallback, values)
          : (labels ?? inheritedLabelResolver),
      [labels, inheritedLabelResolver],
    ),
    inheritedNaturalImageTiles: Dynamic = (0, reactThemeRoot.useContext)(ThemeRootContext),
    naturalImageTiles: Dynamic = experimental?.naturalImageTiles ?? inheritedNaturalImageTiles;
  useMobileSheetPreload(inheritedLocale === undefined, useCdsWindow());
  let resolvedFont: Dynamic = font ?? inheritedLocale ?? "anthropic",
    inheritedFontMono: Dynamic = (0, reactThemeRoot.useContext)(FontContext),
    resolvedFontMono: Dynamic =
      fontMono === null
        ? null
        : ((fontMono?.trim() ? fontMono.trim() : undefined) ?? inheritedFontMono),
    pageBackgroundAttribute: Dynamic = pageBackground ?? inheritedPageBackground,
    inheritedPageBackgroundContext: Dynamic = (0, reactThemeRoot.useContext)(PageBackgroundContext),
    styledPageBackground: Dynamic = pageBackground ?? inheritedPageBackgroundContext,
    inheritedExperimentalSettings: Dynamic = (0, reactThemeRoot.useContext)(
      ExperimentalSettingsContext,
    ),
    trimmedLocale: Dynamic = locale?.trim() ? locale.trim() : undefined,
    resolvedExperimentalSettings: Dynamic = trimmedLocale ?? inheritedExperimentalSettings,
    detectedPlatform: Dynamic = (0, reactThemeRoot.useSyncExternalStore)(
      ThemeRootHandler,
      detectRuntimePlatform,
      ThemeRootDefaultText,
    ),
    resolvedPlatform: Dynamic = platform ?? inheritedPlatform ?? detectedPlatform,
    rootRef: Dynamic = (0, reactThemeRoot.useRef)(null),
    inheritedColorModeStore: Dynamic = (0, reactThemeRoot.useContext)(ColorModeContext),
    ownsColorMode: Dynamic = mode !== undefined || inheritedColorModeStore === undefined,
    [colorModeState, setColorModeState]: Dynamic = (0, reactThemeRoot.useState)(
      (): Dynamic =>
        ownsColorMode
          ? {
              mode: mode,
              scope: createColorModeStore(mode),
            }
          : null,
    ),
    reusedColorModeStore: Dynamic = ownsColorMode ? undefined : inheritedColorModeStore,
    colorModeStore: Dynamic;
  reusedColorModeStore !== undefined
    ? (colorModeStore = reusedColorModeStore)
    : colorModeState !== null && colorModeState.mode === mode
      ? (colorModeStore = colorModeState.scope)
      : ((colorModeStore = createColorModeStore(mode)),
        setColorModeState({
          mode: mode,
          scope: colorModeStore,
        }));
  useIsomorphicLayoutEffect((): Dynamic => {
    observeDocumentInput(rootRef.current?.ownerDocument);
  }, []);
  useIsomorphicLayoutEffect((): Dynamic => {
    if (ownsColorMode) {
      colorModeStore.setElement(rootRef.current);
      return (): Dynamic => colorModeStore.setElement(null);
    }
  }, [ownsColorMode, colorModeStore]);
  let experimentalTheme: Dynamic = useExperimentalTheme(
      experimental?.theme,
      rootRef,
    ),
    colorModeAttribute: Dynamic = (0, reactThemeRoot.useSyncExternalStore)(
      colorModeStore.subscribe,
      ownsColorMode ? colorModeStore.getAttrSnapshot : colorModeStore.getSnapshot,
      ownsColorMode ? colorModeStore.getServerAttrSnapshot : colorModeStore.getServerSnapshot,
    );
  (0, reactThemeRoot.useEffect)((): Dynamic => {}, [trimmedLocale]);
  let flag: Dynamic = false;
  (0, reactThemeRoot.useEffect)((): Dynamic => {}, [flag]);
  (0, reactThemeRoot.useEffect)((): Dynamic => {}, []);
  let renderProp: Dynamic = render;
  typeof renderProp == "object" &&
    renderProp !== null &&
    renderProp.$$typeof === Symbol.for("react.lazy") &&
    (renderProp = reactThemeRoot.Children.toArray(renderProp)[0]);
  let isHtmlRender: Dynamic =
      (0, reactThemeRoot.isValidElement)(renderProp) && renderProp.type === "html",
    renderedRoot: Dynamic = npm_useRender_LL({
      render: renderProp,
      defaultTagName: "div",
      ref: rootRef,
      props: {
        className: cn("cds-root text-primary", className),
        "data-density": resolvedDensity,
        "data-mode": colorModeAttribute,
        "data-platform": resolvedPlatform,
        "data-font": resolvedFont,
        "data-page-bg": pageBackgroundAttribute,
        style: {
          ...(!isHtmlRender && {
            fontSize: "var(--cds-font-size-body)",
          }),
          ...pageBackgroundStyle(styledPageBackground),
          ...monoFontOverrideStyle(resolvedFontMono),
        },
        children: children,
      },
    });
  return (
    <DensityContext.Provider value={resolvedDensity}>
      <ColorModeContext.Provider value={colorModeStore}>
        <PlatformContext.Provider value={resolvedPlatform}>
          <LocaleContext.Provider value={resolvedFont}>
            <FontContext.Provider value={resolvedFontMono}>
              <LabelsContext.Provider value={pageBackgroundAttribute}>
                <PageBackgroundContext.Provider value={styledPageBackground}>
                  <ExperimentalSettingsContext.Provider value={resolvedExperimentalSettings}>
                    <LinkRouterContext.Provider value={resolvedRouter}>
                      <LabelsProviderContext.Provider value={mergedLabels}>
                        <ThemeRootContext.Provider value={naturalImageTiles}>
                          <themeDensityOverrideContext.Provider value={densityOverride}>
                            <ExperimentalThemeContext.Provider
                              value={experimentalTheme}
                            >
                              {renderedRoot}
                            </ExperimentalThemeContext.Provider>
                          </themeDensityOverrideContext.Provider>
                        </ThemeRootContext.Provider>
                      </LabelsProviderContext.Provider>
                    </LinkRouterContext.Provider>
                  </ExperimentalSettingsContext.Provider>
                </PageBackgroundContext.Provider>
              </LabelsContext.Provider>
            </FontContext.Provider>
          </LocaleContext.Provider>
        </PlatformContext.Provider>
      </ColorModeContext.Provider>
    </DensityContext.Provider>
  );
}
export {
  CdsRoot,
  ColorModeContext,
  createColorModeStore,
  defaultColorModeStore,
  DensityContext,
  DensityContextAlias,
  ExperimentalSettingsContext,
  FontContext,
  getControlSizeRank,
  getSizeAttribute,
  initializeCdsRoot,
  inspectCdsStylesheets,
  isBackgroundToken,
  isFillBackgroundToken,
  jsxThemeRoot,
  LabelsContext,
  LocaleContext,
  monoFontOverrideStyle,
  OverlayRootContext,
  PageBackgroundContext,
  pageBackgroundStyle,
  PlatformContext,
  reactThemeRoot,
  RootElementContext,
  RootPresenceContext,
  rootUsesCdsFont,
  sanitizeBackgroundValue,
  stylesheetsInspected,
  ThemeRootCompactComfortableConfig,
  ThemeRootContext,
  themeDensityOverrideContext,
  ThemeRootDefaultText,
  ThemeRootFromEntriesValue,
  ThemeRootHandler,
  normalizeThemeModeSetting,
  ThemeRootMediaQuery,
  ThemeRootSurface0Surface1Surface2Set,
  ThemeRootXsSmBaseConfig,
  useCdsFont,
  useCdsLabels,
  useCdsRootElement,
  useCdsWindow,
  useColorMode,
  useDensity,
  useExperimentalSettings,
  useLocale,
  useOverlayRoot,
  usePageBackground,
  usePlatform,
  useResolvedColorMode,
};
export function installCdsThemeRoot(): () => void {
  return () => {
    initializeCdsRoot = initializeOnce((): Dynamic => {
      "use client";

      initializeAccentColorNames();
      initializeDomInputObservation();
      initializeMobileSheetPreload();
      initializeHooksLayoutEffect();
      initializeExperimentalTheme();
      initializeClassNames();
      initializeLabelsProviderContext();
      initializePlatformRuntime();
      initializeLinkRouter();
      initializeDomOwnerWindow();
      initializeNpm__base_ui_react_SY();
      reactThemeRoot = toModuleNamespace(
        load_react(),
      );
      jsxThemeRoot = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ThemeRootHandler = (): Dynamic => (): Dynamic => {};
      ThemeRootDefaultText = (): Dynamic => "web";
      stylesheetsInspected = false;
      ThemeRootCompactComfortableConfig = {
        compact: 2,
        comfortable: 4,
      };
      ThemeRootXsSmBaseConfig = {
        xs: -2,
        sm: -1,
        base: 0,
        lg: 1,
      };
      DensityContext = (0, reactThemeRoot.createContext)("comfortable");
      DensityContextAlias = DensityContext;
      ColorModeContext = (0, reactThemeRoot.createContext)(undefined);
      defaultColorModeStore = {
        setElement: (): Dynamic => {},
        subscribe: (): Dynamic => (): Dynamic => {},
        getSnapshot: (): Dynamic => {},
        getServerSnapshot: (): Dynamic => {},
        getAttrSnapshot: (): Dynamic => {},
        getServerAttrSnapshot: (): Dynamic => {},
        getSettingSnapshot: (): Dynamic => {},
        getServerSettingSnapshot: (): Dynamic => {},
      };
      ThemeRootMediaQuery = "(prefers-color-scheme: dark)";
      normalizeThemeModeSetting = (setting?: Dynamic): Dynamic =>
        setting === "dark" || setting === "light"
          ? setting
          : setting === "auto" || setting === "system"
            ? "system"
            : undefined;
      PlatformContext = (0, reactThemeRoot.createContext)(undefined);
      LocaleContext = (0, reactThemeRoot.createContext)(undefined);
      FontContext = (0, reactThemeRoot.createContext)(undefined);
      LabelsContext = (0, reactThemeRoot.createContext)(undefined);
      ThemeRootContext = (0, reactThemeRoot.createContext)(undefined);
      themeDensityOverrideContext = (0, reactThemeRoot.createContext)(undefined);
      PageBackgroundContext = (0, reactThemeRoot.createContext)(undefined);
      ExperimentalSettingsContext = (0, reactThemeRoot.createContext)(
        undefined,
      );
      RootElementContext = (0, reactThemeRoot.createContext)(undefined);
      OverlayRootContext = (0, reactThemeRoot.createContext)(undefined);
      RootPresenceContext = (0, reactThemeRoot.createContext)(false);
      ThemeRootFromEntriesValue = Object.fromEntries(
        accentColorNames.map(
          (colorName?: Dynamic): Dynamic => [
            `--cds-bg-tint-${colorName}`,
            `var(--cds-bg-tint-${colorName}-opaque)`,
          ],
        ),
      );
      ThemeRootSurface0Surface1Surface2Set = new Set([
        "surface-0",
        "surface-1",
        "surface-2",
        "surface-3",
        "fill-accent",
      ]);
    });
  };
}

import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type { Elevation } from "../../contracts/ui";
import type * as React from "react";
import { lucideIcons, lucideRotations } from "./lucide-icons";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { iconFontMetadata, initializeRootFontScaleProbe, initializeIconFontMetadata, scaleCssPixels } from "../platform/root-font-size";
import { initializeCdsRoot, useCdsRootElement, useDensity } from "../theme/root";
import { surfaceBackgroundTokens, ThemeSurfacesPanelPopoverConfig, ThemeSurfacesSurface2Surface3Config } from "../theme/surfaces";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var initializeComponentsIcon: Dynamic;
var jsxComponentsIcon: Dynamic;
var iconSizeMetrics: Dynamic;
var iconSizes: Dynamic;
var MdValue: Dynamic;
var ComponentsIconIconsValue: Dynamic;
var ComponentsIconResolvedValue: Dynamic;
var ComponentsIconSubscribers: Dynamic;
var ComponentsIconLoopSubscribers: Dynamic;
var ComponentsIconAnimationDurations: Dynamic;
var ComponentsIconAnimationDurationsOut: Dynamic;
var ComponentsIconAnimationEasings: Dynamic;
var ComponentsIconWghtValue: Dynamic;
var minIconFontWeight: Dynamic;
var maxIconFontWeight: Dynamic;
var ComponentsIconFlexShrinkConfig: Dynamic;
var ComponentsIconFreezeValue: Dynamic;
var initializeIconSizeMetrics: Dynamic;
var reactComponentsIcon: Dynamic;
var jsxForIconContext: Dynamic;
var ComponentsIconConstant: Dynamic;
var ComponentsIconElementCache: Dynamic;
var ComponentsIconHandler: Dynamic;
var subscribeNoopIconInset: Dynamic;
var ComponentsIconContext: Dynamic;
var initializeIconContext: Dynamic;
function resolveIconSize(size?: Dynamic, defaultSize?: Dynamic): Dynamic {
  return size === "auto"
    ? defaultSize
    : size === "auto-sm" || size === "auto-lg"
      ? (iconSizes[
          iconSizes.indexOf(defaultSize) + (size === "auto-lg" ? 1 : -1)
        ] ?? defaultSize)
      : size;
}
function useDefaultIconSize(): Dynamic {
  return useDensity() === "comfortable" ? "md" : "sm";
}
function useIconSize(size: Dynamic = MdValue): Dynamic {
  return resolveIconSize(size, useDefaultIconSize());
}
function nearestIconSize(targetPx?: Dynamic): Dynamic {
  let nearestSize: Dynamic = iconSizes[0],
    smallestDistance: Dynamic = 1 / 0;
  for (let size of iconSizes as Dynamic) {
    let distance: Dynamic = Math.abs(iconSizeMetrics[size].px - targetPx);
    distance <= smallestDistance && ((smallestDistance = distance), (nearestSize = size));
  }
  return nearestSize;
}
function calculateIconWeight(
  strokeWidth?: Dynamic,
  opticalSize?: Dynamic,
  pixelSize?: Dynamic,
): Dynamic {
  let scaledStroke: Dynamic = (strokeWidth * opticalSize) / pixelSize,
    { lo: weightLow, hi: weightHigh }: Dynamic =
      ComponentsIconWghtValue[`${opticalSize}`],
    ratio: Dynamic = (scaledStroke - weightLow) / (weightHigh - weightLow),
    weight: Dynamic =
      minIconFontWeight + (maxIconFontWeight - minIconFontWeight) * ratio;
  return (
    Math.round(
      Math.max(minIconFontWeight, Math.min(maxIconFontWeight, weight)) * 10,
    ) / 10
  );
}
function iconFontStyle(pixelSize?: Dynamic, strokeWidth?: Dynamic): Dynamic {
  let opticalSize: Dynamic = pixelSize <= 18 ? 16 : 20;
  return {
    fontSize: scaleCssPixels(pixelSize),
    fontWeight: calculateIconWeight(strokeWidth, opticalSize, pixelSize),
  };
}
function createIconSizeStyles(size?: Dynamic): Dynamic {
  let { px: pixelSize, stroke: strokeWidths }: Dynamic =
    iconSizeMetrics[size];
  return Object.freeze({
    regular: Object.freeze(iconFontStyle(pixelSize, strokeWidths.regular)),
    ...("strong" in strokeWidths && {
      strong: Object.freeze(iconFontStyle(pixelSize, strokeWidths.strong)),
    }),
  });
}
function Icon(props?: Dynamic): Dynamic {
  useUiLocale();
  let defaultSize: Dynamic = useDefaultIconSize();
  if (props.customIcon) {
    let {
      customIcon: customIconData,
      size: customIconSize = MdValue,
      alt: customAlt,
      className: customClassName,
      style: customStyle,
      name: unusedName,
      icon: unusedIcon,
      animated: unusedAnimated,
      ...svgProps
    }: Dynamic = props;
    let px2: Dynamic =
        iconSizeMetrics[resolveIconSize(customIconSize, defaultSize)].px,
      customFontSize: Dynamic = scaleCssPixels(px2);
    return (
      <svg
        data-cds={"Icon"}
        width={"1em"}
        height={"1em"}
        viewBox={`0 0 ${customIconData.viewBox} ${customIconData.viewBox}`}
        fill={"currentColor"}
        fillRule={"evenodd"}
        stroke={"none"}
        strokeLinecap={"round"}
        strokeLinejoin={"round"}
        xmlns={"http://www.w3.org/2000/svg"}
        style={{
          ...ComponentsIconFlexShrinkConfig,
          fontSize: customFontSize,
          ...customStyle,
        }}
        className={customClassName}
        {...svgProps}
        role={svgProps.role ?? (customAlt ? "img" : undefined)}
        aria-hidden={svgProps["aria-hidden"] ?? (customAlt ? undefined : true)}
        aria-label={svgProps["aria-label"] ?? (customAlt || (undefined))}
      >
        {customIconData.paths.map(
          (path?: Dynamic, pathIndex?: Dynamic): Dynamic =>
            typeof path == "string" ? (
              <path key={pathIndex} d={path} />
            ) : (
              <path
                key={pathIndex}
                d={path.d}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={path.strokeWidth}
                vectorEffect={"non-scaling-stroke"}
              />
            ),
        )}
      </svg>
    );
  }
  let {
    bold: isBold = false,
    animated: isAnimated = false,
    alt: altText,
    className: className,
    style: style,
    name: nameProp,
    icon: iconProp,
    size: sizeProp,
    customSize: customSizePx,
    customIcon: unusedCustomIcon,
    ...restProps
  }: Dynamic = props;
  let iconName: Dynamic = props.name ?? props.icon.name,
    pixelSize: Dynamic,
    sizeToken: Dynamic;
  customSizePx !== undefined
    ? ((pixelSize = customSizePx), (sizeToken = nearestIconSize(pixelSize)))
    : ((sizeToken = resolveIconSize(sizeProp ?? MdValue, defaultSize)),
      (pixelSize = iconSizeMetrics[sizeToken].px));
  let stroke: Dynamic = iconSizeMetrics[sizeToken].stroke,
    isAutoSize: Dynamic =
      sizeProp === "auto" || sizeProp === "auto-sm" || sizeProp === "auto-lg",
    needsSyntheticBold: Dynamic = isBold && !("strong" in stroke) && !isAutoSize,
    glyphCodePoint: Dynamic = ComponentsIconIconsValue[iconName],
    secondaryCodePoint: Dynamic =
      glyphCodePoint === undefined
        ? undefined
        : ComponentsIconResolvedValue[iconName],
    sizeStyles: Dynamic = ComponentsIconFreezeValue[sizeToken],
    fontStyle: Dynamic =
      customSizePx === undefined
        ? isBold && sizeStyles.strong !== undefined
          ? sizeStyles.strong
          : sizeStyles.regular
        : iconFontStyle(
            pixelSize,
            isBold && "strong" in stroke ? stroke.strong : stroke.regular,
          ),
    isAnimating: Dynamic = isAnimated && ComponentsIconSubscribers.has(iconName),
    animationDuration: Dynamic = isAnimating
      ? ComponentsIconAnimationDurations[iconName]
      : undefined,
    animationDurationOut: Dynamic = isAnimating
      ? ComponentsIconAnimationDurationsOut[iconName]
      : undefined,
    animationEasing: Dynamic = isAnimating
      ? ComponentsIconAnimationEasings[iconName]
      : undefined,
    iconStyle: Dynamic = isAnimating
      ? {
          ...fontStyle,
          "--cds-opsz": pixelSize,
          "--cds-wght": fontStyle.fontWeight,
          ...(animationDuration !== undefined && {
            "--cds-anim-dur": `${animationDuration}ms`,
          }),
          ...(animationDurationOut !== undefined && {
            "--cds-anim-dur-out": `${animationDurationOut}ms`,
          }),
          ...(animationEasing !== undefined && {
            "--cds-anim-ease": animationEasing,
          }),
        }
      : fontStyle;
  // MineDesign：有 Lucide 对照的字形改画 SVG；动画图标保留字体的分层动画
  let lucideNode: Dynamic = isAnimating ? undefined : lucideIcons[iconName];
  if (lucideNode) {
    let rotation: Dynamic = lucideRotations[iconName];
    return (
      <svg
        data-cds={"Icon"}
        data-mdn-icon={""}
        data-mdn-bold={isBold ? "" : undefined}
        width={"1em"}
        height={"1em"}
        viewBox={"0 0 24 24"}
        fill={"none"}
        stroke={"currentColor"}
        strokeLinecap={"round"}
        strokeLinejoin={"round"}
        xmlns={"http://www.w3.org/2000/svg"}
        style={{
          ...ComponentsIconFlexShrinkConfig,
          fontSize: fontStyle.fontSize,
          ...(rotation ? { transform: `rotate(${rotation}deg)` } : null),
          ...style,
        }}
        className={className}
        {...restProps}
        role={restProps.role ?? (altText ? "img" : undefined)}
        aria-hidden={restProps["aria-hidden"] ?? (altText ? undefined : true)}
        aria-label={restProps["aria-label"] ?? (altText || (undefined))}
      >
        {lucideNode.map(([Tag, attrs]: Dynamic, index: number): Dynamic => (
          <Tag key={index} {...attrs} />
        ))}
      </svg>
    );
  }
  return (
    <span
      data-cds={"Icon"}
      data-cds-anim={isAnimating ? "" : undefined}
      data-cds-anim-loop={
        isAnimating && ComponentsIconLoopSubscribers.has(iconName) ? "" : undefined
      }
      style={
        style
          ? {
              ...iconStyle,
              ...style,
            }
          : iconStyle
      }
      className={className}
      {...restProps}
      role={restProps.role ?? (altText ? "img" : undefined)}
      aria-hidden={restProps["aria-hidden"] ?? (altText ? undefined : true)}
      aria-label={restProps["aria-label"] ?? (altText || (undefined))}
    >
      {secondaryCodePoint !== undefined && (<span data-cds-icon-layer={"secondary"} aria-hidden={"true"}>
          {String.fromCodePoint(secondaryCodePoint)}
        </span>)}
      {glyphCodePoint !== undefined ? (String.fromCodePoint(glyphCodePoint)) : (null)}
    </span>
  );
}
function isIconName(icon?: Dynamic): Dynamic {
  return typeof icon == "string";
}
function IconRenderer({ icon: icon }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span className={"flex size-icon shrink-0 items-center justify-center"}>
      {isIconName(icon) ? (<Icon name={icon} size={"auto"} />) : (icon)}
    </span>
  );
}
function readDesktopTitlebarInset(doc?: Dynamic): Dynamic {
  let documentElement: Dynamic = doc.documentElement,
    rawInset: Dynamic =
      doc.defaultView
        ?.getComputedStyle(documentElement)
        .getPropertyValue("--desktop-titlebar-inset") ||
      documentElement.style.getPropertyValue("--desktop-titlebar-inset"),
    inset: Dynamic = Number.parseFloat(rawInset);
  return Number.isFinite(inset) && inset > 0 ? inset : 0;
}
function desktopInsetStore(doc?: Dynamic): Dynamic {
  let entry: Dynamic = ComponentsIconElementCache.get(doc);
  if (entry === undefined) {
    let listeners: Dynamic = new Set(),
      observer: Dynamic = null,
      cachedInset: Dynamic,
      isStale: Dynamic = false,
      refreshInset: Dynamic = (): Dynamic => (
        (isStale = false),
        (cachedInset = readDesktopTitlebarInset(doc)),
        cachedInset
      );
    entry = {
      subscribe(listener: Dynamic): Dynamic {
        listeners.add(listener);
        observer === null &&
          (refreshInset(),
          (observer = new MutationObserver((): Dynamic => {
            if (listeners.size === 0) {
              isStale = true;
              return;
            }
            let previousInset: Dynamic = cachedInset;
            if (refreshInset() !== previousInset)
              for (let notify of listeners as Dynamic) notify();
          })),
          observer.observe(doc.documentElement, {
            attributes: true,
            attributeFilter: ["style"],
          }));
        return (): Dynamic => {
          listeners.delete(listener);
        };
      },
      getSnapshot: (): Dynamic => {
        if (observer === null) return readDesktopTitlebarInset(doc);
        let hasPendingMutations: Dynamic =
          listeners.size === 0 && observer.takeRecords().length > 0;
        (isStale || hasPendingMutations) && refreshInset();
        return cachedInset;
      },
    };
    ComponentsIconElementCache.set(doc, entry);
  }
  return entry;
}
function resolvePortalContainer(container?: Dynamic): Dynamic {
  let isDomNodeLike: Dynamic = (candidate?: Dynamic): Dynamic =>
    typeof candidate == "object" &&
    candidate !== null &&
    (candidate.nodeType === 1 || candidate.nodeType === 11) &&
    "ownerDocument" in candidate;
  if (isDomNodeLike(container)) return container;
  if (typeof container == "object" && container !== null && "current" in container) {
    let current: Dynamic = container.current;
    return isDomNodeLike(current) ? current : null;
  }
  return null;
}
function useDesktopTitlebarInset(portalContainer?: Dynamic): Dynamic {
  let rootElement: Dynamic = useCdsRootElement(),
    resolveDocument: Dynamic = (0, reactComponentsIcon.useCallback)(
      (): Dynamic =>
        (resolvePortalContainer(portalContainer) ?? rootElement)?.ownerDocument ??
        (typeof document === "undefined" ? null : document),
      [portalContainer, rootElement],
    ),
    [ownerDocument, setOwnerDocument]: Dynamic = (0, reactComponentsIcon.useState)(resolveDocument);
  useIsomorphicLayoutEffect((): Dynamic => {
    setOwnerDocument(resolveDocument());
  });
  let insetStore: Dynamic = (0, reactComponentsIcon.useMemo)(
    (): Dynamic => (ownerDocument === null ? null : desktopInsetStore(ownerDocument)),
    [ownerDocument],
  );
  return (0, reactComponentsIcon.useSyncExternalStore)(
    insetStore === null ? subscribeNoopIconInset : insetStore.subscribe,
    insetStore === null ? ComponentsIconHandler : insetStore.getSnapshot,
    ComponentsIconHandler,
  );
}
function useCollisionPadding(override?: Dynamic, container?: Dynamic): Dynamic {
  let titlebarInset: Dynamic = useDesktopTitlebarInset(container);
  return (0, reactComponentsIcon.useMemo)((): Dynamic => {
    if (override !== undefined) return override;
    if (!(titlebarInset <= 0))
      return {
        top: ComponentsIconConstant + titlebarInset,
        right: ComponentsIconConstant,
        bottom: ComponentsIconConstant,
        left: ComponentsIconConstant,
      };
  }, [override, titlebarInset]);
}
function CollisionPaddingProvider({
  override: override,
  container: container,
  provideInherit = false,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let collisionPadding: Dynamic = useCollisionPadding(override, container),
    contextValue: Dynamic = (0, reactComponentsIcon.useMemo)(
      (): Dynamic => ({
        collisionPadding: collisionPadding,
      }),
      [collisionPadding],
    ),
    content: Dynamic = children(collisionPadding);
  return provideInherit ? (
    <ComponentsIconContext.Provider value={contextValue}>
      {content}
    </ComponentsIconContext.Provider>
  ) : (
    content
  );
}
function popupSurfaceClassName(elevation: Elevation): string {
  return `rounded-card ${ThemeSurfacesSurface2Surface3Config[surfaceBackgroundTokens[elevation]]} ${ThemeSurfacesPanelPopoverConfig[elevation]}`;
}
export {
  calculateIconWeight,
  CollisionPaddingProvider,
  ComponentsIconConstant,
  ComponentsIconContext,
  ComponentsIconElementCache,
  ComponentsIconFlexShrinkConfig,
  ComponentsIconFreezeValue,
  ComponentsIconHandler,
  subscribeNoopIconInset,
  ComponentsIconIconsValue,
  ComponentsIconResolvedValue,
  ComponentsIconSubscribers,
  ComponentsIconWghtValue,
  createIconSizeStyles,
  desktopInsetStore,
  Icon,
  iconFontStyle,
  IconRenderer,
  iconSizeMetrics,
  iconSizes,
  initializeComponentsIcon,
  initializeIconSizeMetrics,
  initializeIconContext,
  isIconName,
  jsxComponentsIcon,
  jsxForIconContext,
  maxIconFontWeight,
  MdValue,
  minIconFontWeight,
  nearestIconSize,
  popupSurfaceClassName,
  reactComponentsIcon,
  readDesktopTitlebarInset,
  resolveIconSize,
  resolvePortalContainer,
  useCollisionPadding,
  useDefaultIconSize,
  useDesktopTitlebarInset,
  useIconSize,
};
export function installCdsComponentsIcon(): () => void {
  return () => {
    initializeComponentsIcon = initializeOnce((): Dynamic => {});
    initializeIconSizeMetrics = initializeOnce((): Dynamic => {
      "use client";

      initializeCdsRoot();
      initializeRootFontScaleProbe();
      jsxComponentsIcon = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeIconFontMetadata();
      initializeComponentsIcon();
      iconSizeMetrics = {
        xs: {
          px: 12,
          master: "small",
          stroke: {
            regular: 0.8,
          },
        },
        sm: {
          px: 16,
          master: "small",
          stroke: {
            regular: 1,
            strong: 1.25,
          },
        },
        md: {
          px: 20,
          master: "base",
          stroke: {
            regular: 1.2,
            strong: 1.5,
          },
        },
        lg: {
          px: 24,
          master: "base",
          stroke: {
            regular: 1.4,
          },
        },
        xl: {
          px: 28,
          master: "base",
          stroke: {
            regular: 1.6,
          },
        },
        xxl: {
          px: 32,
          master: "base",
          stroke: {
            regular: 1.8,
          },
        },
      };
      iconSizes = ["xs", "sm", "md", "lg", "xl", "xxl"];
      MdValue = "md";
      ComponentsIconIconsValue = iconFontMetadata.icons;
      ComponentsIconResolvedValue = iconFontMetadata.secondary ?? {};
      ComponentsIconSubscribers = new Set(iconFontMetadata.anim ?? []);
      ComponentsIconLoopSubscribers = new Set(
        iconFontMetadata.animLoop ?? [],
      );
      ComponentsIconAnimationDurations = iconFontMetadata.animDur ?? {};
      ComponentsIconAnimationDurationsOut = iconFontMetadata.animDurOut ?? {};
      ComponentsIconAnimationEasings = iconFontMetadata.animEase ?? {};
      ComponentsIconWghtValue = iconFontMetadata.wght;
      [minIconFontWeight, maxIconFontWeight] = [400, 700];
      ComponentsIconFlexShrinkConfig = {
        flexShrink: 0,
      };
      ComponentsIconFreezeValue = Object.freeze({
        xs: createIconSizeStyles("xs"),
        sm: createIconSizeStyles("sm"),
        md: createIconSizeStyles("md"),
        lg: createIconSizeStyles("lg"),
        xl: createIconSizeStyles("xl"),
        xxl: createIconSizeStyles("xxl"),
      });
    });
    initializeIconContext = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeCdsRoot();
      reactComponentsIcon = toModuleNamespace(
        load_react(),
      );
      jsxForIconContext = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsIconConstant = 5;
      ComponentsIconElementCache = new WeakMap();
      ComponentsIconHandler = (): Dynamic => 0;
      subscribeNoopIconInset = (): Dynamic => (): Dynamic => {};
      ComponentsIconContext = (0, reactComponentsIcon.createContext)(null);
    });
  };
}

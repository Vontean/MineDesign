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
import { iconFontMetadata, initializePlatformRootFontSize_3, initializePlatformRootFontSize_4, scaleCssPixels } from "../platform/root-font-size";
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
var ComponentsIconSubscribers_2: Dynamic;
var ComponentsIconResolvedValue_2: Dynamic;
var ComponentsIconResolvedValue_3: Dynamic;
var ComponentsIconResolvedValue_4: Dynamic;
var ComponentsIconWghtValue: Dynamic;
var minIconFontWeight: Dynamic;
var maxIconFontWeight: Dynamic;
var ComponentsIconFlexShrinkConfig: Dynamic;
var ComponentsIconFreezeValue: Dynamic;
var initializeComponentsIcon_2: Dynamic;
var reactComponentsIcon: Dynamic;
var jsxComponentsIcon_2: Dynamic;
var ComponentsIconConstant: Dynamic;
var ComponentsIconElementCache: Dynamic;
var ComponentsIconHandler: Dynamic;
var ComponentsIconHandler_2: Dynamic;
var ComponentsIconContext: Dynamic;
var initializeComponentsIcon_3: Dynamic;
function resolveIconSize(input?: Dynamic, options?: Dynamic): Dynamic {
  return input === "auto"
    ? options
    : input === "auto-sm" || input === "auto-lg"
      ? (iconSizes[
          iconSizes.indexOf(options) + (input === "auto-lg" ? 1 : -1)
        ] ?? options)
      : input;
}
function useDefaultIconSize(): Dynamic {
  return useDensity() === "comfortable" ? "md" : "sm";
}
function useIconSize(input: Dynamic = MdValue): Dynamic {
  return resolveIconSize(input, useDefaultIconSize());
}
function nearestIconSize(input?: Dynamic): Dynamic {
  let value: Dynamic = iconSizes[0],
    value2: Dynamic = 1 / 0;
  for (let value3 of iconSizes as Dynamic) {
    let value4: Dynamic = Math.abs(iconSizeMetrics[value3].px - input);
    value4 <= value2 && ((value2 = value4), (value = value3));
  }
  return value;
}
function calculateIconWeight(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = (input * options) / context,
    { lo: value2, hi: value3 }: Dynamic =
      ComponentsIconWghtValue[`${options}`],
    value4: Dynamic = (value - value2) / (value3 - value2),
    value5: Dynamic =
      minIconFontWeight + (maxIconFontWeight - minIconFontWeight) * value4;
  return (
    Math.round(
      Math.max(minIconFontWeight, Math.min(maxIconFontWeight, value5)) * 10,
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
      customIcon: value26,
      size: value34 = MdValue,
      alt: value27,
      className: value28,
      style: value29,
      name: value30,
      icon: value31,
      animated: value32,
      ...value33
    }: Dynamic = props;
    let px2: Dynamic =
        iconSizeMetrics[resolveIconSize(value34, defaultSize)].px,
      value35: Dynamic = scaleCssPixels(px2);
    return (
      <svg
        data-cds={"Icon"}
        width={"1em"}
        height={"1em"}
        viewBox={`0 0 ${value26.viewBox} ${value26.viewBox}`}
        fill={"currentColor"}
        fillRule={"evenodd"}
        stroke={"none"}
        strokeLinecap={"round"}
        strokeLinejoin={"round"}
        xmlns={"http://www.w3.org/2000/svg"}
        style={{
          ...ComponentsIconFlexShrinkConfig,
          fontSize: value35,
          ...value29,
        }}
        className={value28}
        {...value33}
        role={value33.role ?? (value27 ? "img" : undefined)}
        aria-hidden={value33["aria-hidden"] ?? (value27 ? undefined : true)}
        aria-label={value33["aria-label"] ?? (value27 || (undefined))}
      >
        {value26.paths.map(
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            typeof input == "string" ? (
              <path key={options} d={input} />
            ) : (
              <path
                key={options}
                d={input.d}
                fill={"none"}
                stroke={"currentColor"}
                strokeWidth={input.strokeWidth}
                vectorEffect={"non-scaling-stroke"}
              />
            ),
        )}
      </svg>
    );
  }
  let {
    bold: value10 = false,
    animated: value11 = false,
    alt: value,
    className: value2,
    style: value3,
    name: value4,
    icon: value5,
    size: value6,
    customSize: value7,
    customIcon: value8,
    ...value9
  }: Dynamic = props;
  let value12: Dynamic = props.name ?? props.icon.name,
    value13: Dynamic,
    value14: Dynamic;
  value7 !== undefined
    ? ((value13 = value7), (value14 = nearestIconSize(value13)))
    : ((value14 = resolveIconSize(value6 ?? MdValue, defaultSize)),
      (value13 = iconSizeMetrics[value14].px));
  let stroke: Dynamic = iconSizeMetrics[value14].stroke,
    value15: Dynamic =
      value6 === "auto" || value6 === "auto-sm" || value6 === "auto-lg",
    value16: Dynamic = value10 && !("strong" in stroke) && !value15,
    value17: Dynamic = ComponentsIconIconsValue[value12],
    value18: Dynamic =
      value17 === undefined
        ? undefined
        : ComponentsIconResolvedValue[value12],
    value19: Dynamic = ComponentsIconFreezeValue[value14],
    value20: Dynamic =
      value7 === undefined
        ? value10 && value19.strong !== undefined
          ? value19.strong
          : value19.regular
        : iconFontStyle(
            value13,
            value10 && "strong" in stroke ? stroke.strong : stroke.regular,
          ),
    value21: Dynamic = value11 && ComponentsIconSubscribers.has(value12),
    value22: Dynamic = value21
      ? ComponentsIconResolvedValue_2[value12]
      : undefined,
    value23: Dynamic = value21
      ? ComponentsIconResolvedValue_3[value12]
      : undefined,
    value24: Dynamic = value21
      ? ComponentsIconResolvedValue_4[value12]
      : undefined,
    value25: Dynamic = value21
      ? {
          ...value20,
          "--cds-opsz": value13,
          "--cds-wght": value20.fontWeight,
          ...(value22 !== undefined && {
            "--cds-anim-dur": `${value22}ms`,
          }),
          ...(value23 !== undefined && {
            "--cds-anim-dur-out": `${value23}ms`,
          }),
          ...(value24 !== undefined && {
            "--cds-anim-ease": value24,
          }),
        }
      : value20;
  // MineDesign：有 Lucide 对照的字形改画 SVG；动画图标保留字体的分层动画
  let lucideNode: Dynamic = value21 ? undefined : lucideIcons[value12];
  if (lucideNode) {
    let rotation: Dynamic = lucideRotations[value12];
    return (
      <svg
        data-cds={"Icon"}
        data-mdn-icon={""}
        data-mdn-bold={value10 ? "" : undefined}
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
          fontSize: value20.fontSize,
          ...(rotation ? { transform: `rotate(${rotation}deg)` } : null),
          ...value3,
        }}
        className={value2}
        {...value9}
        role={value9.role ?? (value ? "img" : undefined)}
        aria-hidden={value9["aria-hidden"] ?? (value ? undefined : true)}
        aria-label={value9["aria-label"] ?? (value || (undefined))}
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
      data-cds-anim={value21 ? "" : undefined}
      data-cds-anim-loop={
        value21 && ComponentsIconSubscribers_2.has(value12) ? "" : undefined
      }
      style={
        value3
          ? {
              ...value25,
              ...value3,
            }
          : value25
      }
      className={value2}
      {...value9}
      role={value9.role ?? (value ? "img" : undefined)}
      aria-hidden={value9["aria-hidden"] ?? (value ? undefined : true)}
      aria-label={value9["aria-label"] ?? (value || (undefined))}
    >
      {value18 !== undefined && (<span data-cds-icon-layer={"secondary"} aria-hidden={"true"}>
          {String.fromCodePoint(value18)}
        </span>)}
      {value17 !== undefined ? (String.fromCodePoint(value17)) : (null)}
    </span>
  );
}
function isIconName(input?: Dynamic): Dynamic {
  return typeof input == "string";
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
    value: Dynamic =
      doc.defaultView
        ?.getComputedStyle(documentElement)
        .getPropertyValue("--desktop-titlebar-inset") ||
      documentElement.style.getPropertyValue("--desktop-titlebar-inset"),
    value2: Dynamic = Number.parseFloat(value);
  return Number.isFinite(value2) && value2 > 0 ? value2 : 0;
}
function desktopInsetStore(doc?: Dynamic): Dynamic {
  let entry: Dynamic = ComponentsIconElementCache.get(doc);
  if (entry === undefined) {
    let values: Dynamic = new Set(),
      value: Dynamic = null,
      value2: Dynamic,
      flag: Dynamic = false,
      callback: Dynamic = (): Dynamic => (
        (flag = false),
        (value2 = readDesktopTitlebarInset(doc)),
        value2
      );
    entry = {
      subscribe(input: Dynamic): Dynamic {
        values.add(input);
        value === null &&
          (callback(),
          (value = new MutationObserver((): Dynamic => {
            if (values.size === 0) {
              flag = true;
              return;
            }
            let value3: Dynamic = value2;
            if (callback() !== value3)
              for (let value4 of values as Dynamic) value4();
          })),
          value.observe(doc.documentElement, {
            attributes: true,
            attributeFilter: ["style"],
          }));
        return (): Dynamic => {
          values.delete(input);
        };
      },
      getSnapshot: (): Dynamic => {
        if (value === null) return readDesktopTitlebarInset(doc);
        let value3: Dynamic =
          values.size === 0 && value.takeRecords().length > 0;
        (flag || value3) && callback();
        return value2;
      },
    };
    ComponentsIconElementCache.set(doc, entry);
  }
  return entry;
}
function resolvePortalContainer(input?: Dynamic): Dynamic {
  let callback: Dynamic = (input2?: Dynamic): Dynamic =>
    typeof input2 == "object" &&
    input2 !== null &&
    (input2.nodeType === 1 || input2.nodeType === 11) &&
    "ownerDocument" in input2;
  if (callback(input)) return input;
  if (typeof input == "object" && input !== null && "current" in input) {
    let current: Dynamic = input.current;
    return callback(current) ? current : null;
  }
  return null;
}
function useDesktopTitlebarInset(input?: Dynamic): Dynamic {
  let value: Dynamic = useCdsRootElement(),
    value2: Dynamic = (0, reactComponentsIcon.useCallback)(
      (): Dynamic =>
        (resolvePortalContainer(input) ?? value)?.ownerDocument ??
        (typeof document === "undefined" ? null : document),
      [input, value],
    ),
    [value3, value4]: Dynamic = (0, reactComponentsIcon.useState)(value2);
  useIsomorphicLayoutEffect((): Dynamic => {
    value4(value2());
  });
  let value5: Dynamic = (0, reactComponentsIcon.useMemo)(
    (): Dynamic => (value3 === null ? null : desktopInsetStore(value3)),
    [value3],
  );
  return (0, reactComponentsIcon.useSyncExternalStore)(
    value5 === null ? ComponentsIconHandler_2 : value5.subscribe,
    value5 === null ? ComponentsIconHandler : value5.getSnapshot,
    ComponentsIconHandler,
  );
}
function useCollisionPadding(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = useDesktopTitlebarInset(options);
  return (0, reactComponentsIcon.useMemo)((): Dynamic => {
    if (input !== undefined) return input;
    if (!(value <= 0))
      return {
        top: ComponentsIconConstant + value,
        right: ComponentsIconConstant,
        bottom: ComponentsIconConstant,
        left: ComponentsIconConstant,
      };
  }, [input, value]);
}
function CollisionPaddingProvider({
  override: override,
  container: container,
  provideInherit = false,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = useCollisionPadding(override, container),
    value2: Dynamic = (0, reactComponentsIcon.useMemo)(
      (): Dynamic => ({
        collisionPadding: value,
      }),
      [value],
    ),
    value3: Dynamic = children(value);
  return provideInherit ? (
    <ComponentsIconContext.Provider value={value2}>
      {value3}
    </ComponentsIconContext.Provider>
  ) : (
    value3
  );
}
function popupSurfaceClassName(input: Elevation): string {
  return `rounded-card ${ThemeSurfacesSurface2Surface3Config[surfaceBackgroundTokens[input]]} ${ThemeSurfacesPanelPopoverConfig[input]}`;
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
  ComponentsIconHandler_2,
  ComponentsIconIconsValue,
  ComponentsIconResolvedValue,
  ComponentsIconResolvedValue_2,
  ComponentsIconResolvedValue_3,
  ComponentsIconResolvedValue_4,
  ComponentsIconSubscribers,
  ComponentsIconSubscribers_2,
  ComponentsIconWghtValue,
  createIconSizeStyles,
  desktopInsetStore,
  Icon,
  iconFontStyle,
  IconRenderer,
  iconSizeMetrics,
  iconSizes,
  initializeComponentsIcon,
  initializeComponentsIcon_2,
  initializeComponentsIcon_3,
  isIconName,
  jsxComponentsIcon,
  jsxComponentsIcon_2,
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
    initializeComponentsIcon_2 = initializeOnce((): Dynamic => {
      "use client";

      initializeCdsRoot();
      initializePlatformRootFontSize_3();
      jsxComponentsIcon = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializePlatformRootFontSize_4();
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
      ComponentsIconSubscribers_2 = new Set(
        iconFontMetadata.animLoop ?? [],
      );
      ComponentsIconResolvedValue_2 = iconFontMetadata.animDur ?? {};
      ComponentsIconResolvedValue_3 = iconFontMetadata.animDurOut ?? {};
      ComponentsIconResolvedValue_4 = iconFontMetadata.animEase ?? {};
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
    initializeComponentsIcon_3 = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeCdsRoot();
      reactComponentsIcon = toModuleNamespace(
        load_react(),
      );
      jsxComponentsIcon_2 = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsIconConstant = 5;
      ComponentsIconElementCache = new WeakMap();
      ComponentsIconHandler = (): Dynamic => 0;
      ComponentsIconHandler_2 = (): Dynamic => (): Dynamic => {};
      ComponentsIconContext = (0, reactComponentsIcon.createContext)(null);
    });
  };
}

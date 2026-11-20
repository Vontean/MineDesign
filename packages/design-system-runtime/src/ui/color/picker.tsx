import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Color from "../../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";
import { announceLiveMessage, reactForUiColorPicker } from "../announcements";
import { ContrastColorDetails, contrastDisplayInfo } from "./contrast-controls";
import { colorContrastResults, contrastColorFix } from "./contrast";
import { Icon } from "../interactions";
import { Tabs } from "../tabs";

var jsxForUiColorPicker: typeof import("react/jsx-runtime");
var COLOR_ALPHA_CHECKERBOARD: string;
var COLOR_SWATCH_BUTTON_CLASS: string;
var COLOR_PICKER_POPOVER_HEIGHT: number;
var COLOR_PICKER_POPOVER_CLASS: string;
function joinPickerClasses(...classNames: (string | false | null | undefined)[]) {
  return classNames.filter(Boolean).join(" ");
}
function normalizedRgbToHsva(
  red: number,
  green: number,
  blue: number,
  alpha: number,
): Color.HsvaColor {
  let maxChannel = Math.max(red, green, blue),
    minChannel = Math.min(red, green, blue),
    chroma = maxChannel - minChannel,
    index = 0;
  if (chroma !== 0) {
    if (maxChannel === red) {
      index = ((green - blue) / chroma) % 6;
    } else if (maxChannel === green) {
      index = (blue - red) / chroma + 2;
    } else {
      index = (red - green) / chroma + 4;
    }
    index *= 60;
    if (index < 0) {
      index += 360;
    }
  }
  let saturation = maxChannel === 0 ? 0 : chroma / maxChannel;
  return {
    h: index,
    s: saturation,
    v: maxChannel,
    a: alpha,
  };
}
function parseCssColorToHsva(cssColor: string): Color.HsvaColor {
  let value = cssColor.match(/^#([0-9a-f]{3,8})$/i)?.[1];
  if (value && value.length !== 5 && value.length !== 7) {
    let expandedHex =
        value.length <= 4
          ? value.replace(/[0-9a-f]/gi, (digit: string) => digit + digit)
          : value.padEnd(8, "f"),
      callback = (channelIndex: number) =>
        parseInt(expandedHex.slice(channelIndex * 2, channelIndex * 2 + 2), 16) / 255;
    return normalizedRgbToHsva(
      callback(0),
      callback(1),
      callback(2),
      value.length === 4 || value.length === 8 ? callback(3) : 1,
    );
  }
  let rgbMatch = cssColor.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    let callback = (channel: number) => Math.min(1, Math.max(0, channel));
    return normalizedRgbToHsva(
      callback(+(rgbMatch[1] ?? 0) / 255),
      callback(+(rgbMatch[2] ?? 0) / 255),
      callback(+(rgbMatch[3] ?? 0) / 255),
      rgbMatch[4] != null ? callback(+rgbMatch[4]) : 1,
    );
  }
  if (
    typeof document === "undefined" ||
    typeof getComputedStyle === "undefined"
  ) {
    return {
      h: 0,
      s: 0,
      v: 0,
      a: 1,
    };
  }
  let colorProbe = document.createElement("div");
  colorProbe.style.color = cssColor;
  document.body.appendChild(colorProbe);
  let color = getComputedStyle(colorProbe).color;
  document.body.removeChild(colorProbe);
  let computedRgbMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (!computedRgbMatch) {
    return {
      h: 0,
      s: 0,
      v: 0,
      a: 1,
    };
  }
  return normalizedRgbToHsva(
    +(computedRgbMatch[1] ?? 0) / 255,
    +(computedRgbMatch[2] ?? 0) / 255,
    +(computedRgbMatch[3] ?? 0) / 255,
    computedRgbMatch[4] != null ? +computedRgbMatch[4] : 1,
  );
}
function hsvaToCssColor(hsva: Color.HsvaColor): string {
  let { h: value, s: saturation, v: brightness, a: alpha } = hsva,
    chroma = brightness * saturation,
    intermediateChannel = chroma * (1 - Math.abs(((value / 60) % 2) - 1)),
    channelOffset = brightness - chroma,
    index = 0,
    greenComponent = 0,
    blueComponent = 0;
  if (value < 60) {
    index = chroma;
    greenComponent = intermediateChannel;
  } else if (value < 120) {
    index = intermediateChannel;
    greenComponent = chroma;
  } else if (value < 180) {
    greenComponent = chroma;
    blueComponent = intermediateChannel;
  } else if (value < 240) {
    greenComponent = intermediateChannel;
    blueComponent = chroma;
  } else if (value < 300) {
    index = intermediateChannel;
    blueComponent = chroma;
  } else {
    index = chroma;
    blueComponent = intermediateChannel;
  }
  let redByte = Math.round((index + channelOffset) * 255),
    greenByte = Math.round((greenComponent + channelOffset) * 255),
    blueByte = Math.round((blueComponent + channelOffset) * 255);
  if (alpha < 1) {
    return `rgba(${redByte}, ${greenByte}, ${blueByte}, ${+alpha.toFixed(3)})`;
  } else {
    return `rgb(${redByte}, ${greenByte}, ${blueByte})`;
  }
}
function hsvaToHexColor(hsva: Color.HsvaColor): string {
  let value = hsvaToCssColor({
    ...hsva,
    a: 1,
  }).match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!value) {
    return "#000000";
  }
  return (
    "#" +
    [+(value[1] ?? 0), +(value[2] ?? 0), +(value[3] ?? 0)]
      .map((channel: number) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
function rgbaHexColor(color: Color.HsvaColor): string {
  let value = hsvaToHexColor(color);
  if (color.a >= 1) {
    return value;
  }
  return (
    value +
    Math.round(color.a * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase()
  );
}
function isEyeDropperAvailable(): boolean {
  return typeof EyeDropper !== "undefined";
}
async function pickScreenColor(): Promise<string | null> {
  if (typeof EyeDropper === "undefined") {
    return null;
  }
  try {
    return (await new EyeDropper().open()).sRGBHex;
  } catch {
    return null;
  }
}
function beginColorPickerPointerGesture(
  event: React.PointerEvent<HTMLElement>,
  onMove: Color.PointerMove,
  onEnd?: () => void,
): () => void {
  event.preventDefault();
  let currentTarget = event.currentTarget,
    bounds = currentTarget.getBoundingClientRect(),
    pointerId = event.pointerId;
  try {
    currentTarget.setPointerCapture(pointerId);
  } catch {}
  onMove(event.clientX, event.clientY, bounds);
  let callback = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) {
        return;
      }
      onMove(pointerEvent.clientX, pointerEvent.clientY, bounds);
    },
    removeGestureListeners = () => {
      window.removeEventListener("pointermove", callback);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    },
    handlePointerEnd = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) {
        return;
      }
      removeGestureListeners();
      onEnd?.();
    };
  window.addEventListener("pointermove", callback);
  window.addEventListener("pointerup", handlePointerEnd);
  window.addEventListener("pointercancel", handlePointerEnd);
  return removeGestureListeners;
}
function colorTrackFraction(
  clientX: number,
  rectangle: Pick<DOMRect, "left" | "width">,
): number {
  return Math.max(
    0,
    Math.min(1, (clientX - rectangle.left - 7) / (rectangle.width - 14)),
  );
}
function ColorPickerLabel({
  text: text,
  title = false,
}: Color.ColorPickerLabelProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={joinPickerClasses(
        "w-full truncate text-footnote",
        title ? "font-medium text-primary" : "text-muted",
      )}
      title={text}
    >
      {text}
    </div>
  );
}
function ColorPickerGroup({
  label: label,
  className: className,
  role = "group",
  scroll = true,
  children: children,
}: Color.ColorPickerGroupProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      role={role}
      aria-label={label}
      className={joinPickerClasses(
        "flex flex-col",
        scroll &&
          "kit-scrollbar max-h-[min(18rem,max(6rem,calc(var(--available-height,100vh)_-_7.5rem)))] overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
function ColorPickerHeader({
  text: text,
  title: title,
}: Color.ColorPickerLabelProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      role={"presentation"}
      className={"flex h-8 shrink-0 items-center px-2"}
    >
      <ColorPickerLabel text={text} title={title} />
    </div>
  );
}
function SwatchDot({
  paint: paint,
  current = false,
}: Color.SwatchDotProps): React.ReactElement {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      data-swatch-dot={""}
      className={joinPickerClasses(
        "inline-block h-4 w-4 shrink-0 rounded-[4px] border border-border-strong",
        paint === undefined && "border-dashed",
        current && "outline outline-2 outline-offset-1 outline-border-strong",
      )}
      style={paint}
    />
  );
}
function SwatchButton({
  label: label,
  paint: paint,
  current = false,
  onClick: onClick,
  readOnly = false,
  disabled = false,
  title: title,
  ...remainingProps
}: Color.SwatchButtonProps): React.ReactElement {
  useUiLocale();
  let value = (
    <jsxForUiColorPicker.Fragment>
      {[<SwatchDot paint={paint} current={current} />, <span
          className={"min-w-0 flex-1 truncate text-footnote text-primary"}
        >
          {label}
        </span>, current ? (
          <span
            data-swatch-check={""}
            aria-hidden={"true"}
            className={
              "-mr-1 flex size-icon shrink-0 items-center justify-center"
            }
            style={{
              color: "var(--cds-fill-accent)",
            }}
          >
            <Icon name={"Check"} size={"auto"} bold={true} />
          </span>
        ) : null]}
    </jsxForUiColorPicker.Fragment>
  );
  if (readOnly) {
    return (
      <div
        role={"listitem"}
        title={title ?? (label)}
        aria-label={label}
        className={joinPickerClasses(
          COLOR_SWATCH_BUTTON_CLASS,
          "cursor-default",
        )}
        {...remainingProps}
      >
        {value}
      </div>
    );
  }
  return (
    <button
      type={"button"}
      title={disabled ? (undefined) : (title ?? (label))}
      aria-label={label}
      aria-pressed={current}
      disabled={disabled}
      onClick={onClick}
      className={joinPickerClasses(
        COLOR_SWATCH_BUTTON_CLASS,
        disabled
          ? "pointer-events-none opacity-50"
          : "cursor-default hover:bg-fill-ghost-hover focus-visible:outline-hidden focus-visible:shadow-focus forced-colors:focus-visible:-outline-offset-2",
        current && "bg-fill-ghost-hover",
      )}
      {...remainingProps}
    >
      {value}
    </button>
  );
}
function ColorHexInput({
  value: selectedFormat,
  onChange: onChange,
  className = "mb-2",
}: Color.ColorHexInputProps): React.ReactElement {
  useUiLocale();
  let ref = (
      reactForUiColorPicker as typeof React
    ).useRef<HTMLDivElement | null>(null),
    callback = (nextFormat: string) => {
      let activeElement = document.activeElement,
        popup =
          ref.current?.closest('[data-mc-popover], [role="dialog"]') ??
          ref.current?.parentElement;
      if (
        activeElement instanceof HTMLElement &&
        popup &&
        popup.contains(activeElement) &&
        !ref.current!.contains(activeElement)
      ) {
        activeElement.blur();
      }
      onChange(nextFormat);
    };
  return (
    <Tabs.Root
      ref={ref}
      value={selectedFormat}
      onValueChange={(nextFormat: unknown) => callback(nextFormat as string)}
    >
      <Tabs.List
        aria-label={uiMessage("design-system.picker.source")}
        className={className}
        onMouseDown={(event: React.MouseEvent<HTMLElement>) =>
          event.preventDefault()
        }
      >
        {[<Tabs.Tab value={"system"}>{uiMessage("design-system.picker.theme")}</Tabs.Tab>, <Tabs.Tab value={"custom"}>{uiMessage("design-system.picker.custom")}</Tabs.Tab>]}
      </Tabs.List>
    </Tabs.Root>
  );
}
function ColorPicker({
  value: cssColor,
  unset: unset,
  opaque: opaque,
  onChange: onChange,
  onPickEnd: onPickEnd,
  contrast: contrast,
}: Color.ColorPickerProps): React.ReactElement {
  useUiLocale();
  let callback = (hsva: Color.HsvaColor) =>
      opaque
        ? {
            ...hsva,
            a: 1,
          }
        : hsva,
    [color, setColor] = (
      reactForUiColorPicker as typeof React
    ).useState(() => callback(parseCssColorToHsva(cssColor))),
    ref = (reactForUiColorPicker as typeof React).useRef(color);
  ref.current = color;
  let suppressCommitRef = (reactForUiColorPicker as typeof React).useRef(false),
    [hexDraft, setHexDraft] = (
      reactForUiColorPicker as typeof React
    ).useState(() => hsvaToHexColor(color)),
    [alphaDraft, setAlphaDraft] = (
      reactForUiColorPicker as typeof React
    ).useState(() => Math.round(color.a * 100).toString()),
    hexInputRef = (
      reactForUiColorPicker as typeof React
    ).useRef<HTMLInputElement | null>(null),
    alphaInputRef = (
      reactForUiColorPicker as typeof React
    ).useRef<HTMLInputElement | null>(null),
    unsetRef = (reactForUiColorPicker as typeof React).useRef(
      unset ?? false,
    );
  unsetRef.current = unset ?? false;
  let opaqueRef = (reactForUiColorPicker as typeof React).useRef(
    opaque ?? false,
  );
  opaqueRef.current = opaque ?? false;
  let onPickEndRef = (reactForUiColorPicker as typeof React).useRef(
    onPickEnd,
  );
  onPickEndRef.current = onPickEnd;
  let ref8 = (reactForUiColorPicker as typeof React).useRef(contrast);
  ref8.current = contrast;
  let completePick = (reactForUiColorPicker as typeof React).useCallback(
      (pickedColor: string, announceContrast?: boolean) => {
        onPickEndRef.current?.(pickedColor);
        let current = ref8.current;
        if (!announceContrast || current === undefined) {
          return;
        }
        announceLiveMessage(() => {
          let results = colorContrastResults(pickedColor, current);
          if (results === undefined) {
            return null;
          } else {
            return contrastDisplayInfo(results).spoken;
          }
        });
      },
      [],
    ),
    hasEditedHexRef = (reactForUiColorPicker as typeof React).useRef(false),
    lastCssColorRef = (reactForUiColorPicker as typeof React).useRef(cssColor),
    syncFromCssColor = (reactForUiColorPicker as typeof React).useCallback(
      (nextCssColor: string) => {
        lastCssColorRef.current = nextCssColor;
        let nextColor = callback(parseCssColorToHsva(nextCssColor));
        if (rgbaHexColor(nextColor) === rgbaHexColor(ref.current)) {
          return;
        }
        setColor(nextColor);
        ref.current = nextColor;
        setHexDraft(hsvaToHexColor(nextColor));
        setAlphaDraft(Math.round(nextColor.a * 100).toString());
      },
      [],
    );
  (reactForUiColorPicker as typeof React).useEffect(() => {
    if (cssColor === lastCssColorRef.current) {
      return;
    }
    let activeElement = document.activeElement;
    if (activeElement === hexInputRef.current || activeElement === alphaInputRef.current) {
      return;
    }
    syncFromCssColor(cssColor);
  }, [cssColor, syncFromCssColor]);
  let syncOnInputBlur = (
      focusEvent: React.FocusEvent<HTMLInputElement>,
      didCommit: boolean,
    ) => {
      if (didCommit) {
        return;
      }
      let relatedTarget = focusEvent.relatedTarget;
      if (
        relatedTarget !== null &&
        (relatedTarget === hexInputRef.current || relatedTarget === alphaInputRef.current)
      ) {
        return;
      }
      if (cssColor !== lastCssColorRef.current) {
        syncFromCssColor(cssColor);
      }
    },
    previewColor = (reactForUiColorPicker as typeof React).useCallback(
      (candidate: Color.HsvaColor) => {
        let nextColor = opaqueRef.current
            ? {
                ...candidate,
                a: 1,
              }
            : candidate,
          nextHex = rgbaHexColor(nextColor),
          colorChanged = nextHex !== rgbaHexColor(ref.current);
        setColor(nextColor);
        ref.current = nextColor;
        setHexDraft(hsvaToHexColor(nextColor));
        setAlphaDraft(Math.round(nextColor.a * 100).toString());
        if (!colorChanged && !unsetRef.current) {
          return false;
        }
        lastCssColorRef.current = nextHex;
        onChange(nextHex);
        return true;
      },
      [onChange],
    ),
    commitColor = (reactForUiColorPicker as typeof React).useCallback(
      (candidate: Color.HsvaColor) => {
        let nextColor = opaqueRef.current
          ? {
              ...candidate,
              a: 1,
            }
          : candidate;
        if (
          !unsetRef.current &&
          rgbaHexColor(nextColor) === rgbaHexColor(ref.current)
        ) {
          setHexDraft(hsvaToHexColor(ref.current));
          setAlphaDraft(Math.round(ref.current.a * 100).toString());
          return false;
        }
        previewColor(nextColor);
        completePick(rgbaHexColor(nextColor), true);
        return true;
      },
      [previewColor, completePick],
    ),
    createGestureCompletion = (
      reactForUiColorPicker as typeof React
    ).useCallback(() => {
      return (announceContrast?: boolean) => {
        completePick(rgbaHexColor(ref.current), announceContrast);
      };
    }, [completePick]),
    pendingGestureCleanupsRef = (reactForUiColorPicker as typeof React).useRef(
      new Set<() => void>(),
    ),
    [gestureState, setGestureState] = (
      reactForUiColorPicker as typeof React
    ).useState<Color.ColorGestureState | undefined>(undefined),
    isGestureActive = gestureState !== undefined,
    contrastFixRef = (
      reactForUiColorPicker as typeof React
    ).useRef<HTMLSpanElement | null>(null),
    restoreFocusAfterFixRef = (reactForUiColorPicker as typeof React).useRef(false),
    focusHexInput = (fromTouch: boolean) => {
      if (!fromTouch) {
        hexInputRef.current?.focus();
      }
    };
  (reactForUiColorPicker as typeof React).useEffect(
    () => () => {
      for (let cleanup of pendingGestureCleanupsRef.current) {
        cleanup();
      }
      pendingGestureCleanupsRef.current.clear();
    },
    [],
  );
  let startColorGesture = (
      pointerEvent: React.PointerEvent<HTMLElement>,
      moveColor: Color.ColorGestureMove,
    ) => {
      if (pointerEvent.button !== 0) {
        return;
      }
      if (contrastFixRef.current?.contains(document.activeElement)) {
        focusHexInput(pointerEvent.pointerType === "touch");
      }
      setGestureState(
        (previousGesture) =>
          previousGesture ?? {
            shade: suggestedFix,
          },
      );
      let completeGesture = createGestureCompletion(),
        flag = false,
        removeGestureListeners = () => {},
        finishGesture = (announceContrast: boolean) => {
          pendingGestureCleanupsRef.current.delete(cancelGesture);
          if (pendingGestureCleanupsRef.current.size === 0) {
            setGestureState(undefined);
          }
          removeGestureListeners();
          if (flag) {
            flag = false;
            completeGesture(announceContrast);
          }
        },
        cancelGesture = () => finishGesture(false);
      removeGestureListeners = beginColorPickerPointerGesture(
        pointerEvent,
        (clientX: number, clientY: number, bounds: DOMRect) => {
          if (moveColor(clientX, clientY, bounds)) {
            flag = true;
          }
        },
        () => finishGesture(true),
      );
      pendingGestureCleanupsRef.current.add(cancelGesture);
    },
    handleSaturationPointerDown = (pointerEvent: React.PointerEvent<HTMLElement>) =>
      startColorGesture(pointerEvent, (clientX: number, clientY: number, bounds: DOMRect) =>
        previewColor({
          ...ref.current,
          s: colorTrackFraction(clientX, bounds),
          v:
            1 -
            Math.max(
              0,
              Math.min(
                1,
                (clientY - bounds.top - 7) / (bounds.height - 14),
              ),
            ),
        }),
      ),
    handleHuePointerDown = (pointerEvent: React.PointerEvent<HTMLElement>) =>
      startColorGesture(pointerEvent, (clientX: number, unusedClientY: number, bounds: DOMRect) =>
        previewColor({
          ...ref.current,
          h: colorTrackFraction(clientX, bounds) * 360,
        }),
      ),
    handleAlphaPointerDown = (pointerEvent: React.PointerEvent<HTMLElement>) =>
      startColorGesture(pointerEvent, (clientX: number, unusedClientY: number, bounds: DOMRect) =>
        previewColor({
          ...ref.current,
          a: colorTrackFraction(clientX, bounds),
        }),
      ),
    pickEyedropperColor = async (): Promise<void> => {
      let pickedCss = await pickScreenColor();
      if (!pickedCss) {
        return;
      }
      commitColor({
        ...parseCssColorToHsva(pickedCss),
        a: ref.current.a,
      });
    },
    commitHexDraft = () => {
      if (suppressCommitRef.current) {
        suppressCommitRef.current = false;
        return false;
      }
      if (unsetRef.current && !hasEditedHexRef.current) {
        return false;
      }
      let hexText = hexDraft.trim();
      if (
        /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
          hexText,
        )
      ) {
        let parsedColor = parseCssColorToHsva(
            hexText.startsWith("#") ? hexText : "#" + hexText,
          ),
          length = hexText.replace(/^#/, "").length;
        return commitColor(
          length === 4 || length === 8
            ? parsedColor
            : {
                ...parsedColor,
                a: color.a,
              },
        );
      }
      setHexDraft(hsvaToHexColor(color));
      return false;
    },
    commitAlphaDraft = () => {
      if (suppressCommitRef.current) {
        suppressCommitRef.current = false;
        return false;
      }
      let alphaPercent = parseFloat(alphaDraft);
      if (isNaN(alphaPercent)) {
        setAlphaDraft(Math.round(color.a * 100).toString());
        return false;
      }
      if (Math.round(alphaPercent) === Math.round(color.a * 100)) {
        setAlphaDraft(Math.round(color.a * 100).toString());
        return false;
      }
      return commitColor({
        ...color,
        a: Math.max(0, Math.min(1, alphaPercent / 100)),
      });
    },
    opaqueCss = hsvaToCssColor({
      ...color,
      a: 1,
    }),
    rgbaHex = rgbaHexColor(color),
    contrastKey = contrast === undefined ? undefined : JSON.stringify(contrast),
    memo = (reactForUiColorPicker as typeof React).useMemo(
      () => contrast,
      [contrastKey],
    ),
    contrastResults = (reactForUiColorPicker as typeof React).useMemo(
      () =>
        memo === undefined
          ? undefined
          : colorContrastResults(rgbaHex, memo),
      [memo, rgbaHex],
    ),
    suggestedFix = (reactForUiColorPicker as typeof React).useMemo(
      () =>
        memo === undefined || isGestureActive
          ? undefined
          : contrastColorFix(rgbaHex, memo),
      [memo, rgbaHex, isGestureActive],
    ),
    visibleFix = gestureState !== undefined ? gestureState.shade : suggestedFix,
    showContrastFix = contrastResults !== undefined && visibleFix !== undefined;
  (reactForUiColorPicker as typeof React).useLayoutEffect(() => {
    if (!restoreFocusAfterFixRef.current) {
      return;
    }
    restoreFocusAfterFixRef.current = false;
    if (!showContrastFix) {
      hexInputRef.current?.focus();
    }
  }, [showContrastFix]);
  let applyContrastFix = (fromTouch: boolean) => {
      if (suggestedFix === undefined) {
        return;
      }
      commitColor(parseCssColorToHsva(suggestedFix.css));
      focusHexInput(fromTouch);
    },
    requestFocusAfterFix = () => {
      restoreFocusAfterFixRef.current = true;
    },
    contrastId = (reactForUiColorPicker as typeof React).useId(),
    contrastDescriptionId = contrastResults === undefined ? undefined : contrastId;
  return (
    <div className={"flex w-full min-w-56 flex-col"}>
      {[<div
          className={"relative aspect-[3/2] w-full touch-none rounded-md"}
          style={{
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${color.h}, 100%, 50%))`,
          }}
          onPointerDown={handleSaturationPointerDown}
        >
          <div
            className={
              "pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
            }
            style={{
              left: `calc(${color.s} * (100% - 14px) + 7px)`,
              top: `calc(${1 - color.v} * (100% - 14px) + 7px)`,
              background: opaqueCss,
            }}
          />
        </div>, <div
          className={"relative touch-none pt-2 pb-1 pointer-coarse:py-3.5"}
          onPointerDown={handleHuePointerDown}
        >
          <div
            className={
              "relative h-3 w-full rounded-md bg-[linear-gradient(to_right,#f00_0%,#ff0_17%,#0f0_33%,#0ff_50%,#00f_67%,#f0f_83%,#f00_100%)]"
            }
          >
            <div
              className={
                "pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
              }
              style={{
                left: `calc(${color.h / 360} * (100% - 14px) + 7px)`,
                background: `hsl(${color.h}, 100%, 50%)`,
              }}
            />
          </div>
        </div>, !opaque && (
          <div
            className={"relative touch-none py-1 pointer-coarse:py-3.5"}
            onPointerDown={handleAlphaPointerDown}
          >
            <div
              className={"relative h-3 w-full rounded-md"}
              style={{
                background: `linear-gradient(to right, transparent, ${opaqueCss}), ${COLOR_ALPHA_CHECKERBOARD}`,
              }}
            >
              <div
                className={
                  "pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
                }
                style={{
                  left: `calc(${color.a} * (100% - 14px) + 7px)`,
                  background: hsvaToCssColor(color),
                }}
              />
            </div>
          </div>
        ), <div className={"mt-1 flex items-center gap-2"}>
          {[isEyeDropperAvailable() && (
              <button
                type={"button"}
                title={uiMessage("design-system.picker.pickColorFromScreen")}
                aria-label={uiMessage("design-system.picker.pickColorFromScreen")}
                onClick={pickEyedropperColor}
                className={
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted outline-none hover:bg-alpha-1 hover:text-primary focus-visible:outline-hidden focus-visible:shadow-focus pointer-coarse:h-10 pointer-coarse:w-10"
                }
              >
                <Icon name={"EyeDropper"} size={"sm"} />
              </button>
            ), <div
              className={
                "flex h-6 min-w-0 flex-1 items-center rounded bg-fill-field shadow-field-ring transition duration-fast hover:not-focus-within:shadow-field-hover has-[:focus-visible]:shadow-focus pointer-coarse:h-10"
              }
            >
              {[<input
                  ref={hexInputRef}
                  className={
                    "h-full min-w-0 flex-1 bg-transparent px-1.5 font-mono text-[11px] text-primary outline-none focus-visible:outline-hidden"
                  }
                  value={hexDraft}
                  aria-label={uiMessage("design-system.picker.hexColor")}
                  aria-describedby={contrastDescriptionId}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    hasEditedHexRef.current = true;
                    setHexDraft(event.target.value);
                  }}
                  onFocus={() => {
                    hasEditedHexRef.current = false;
                  }}
                  onBlur={(focusEvent: React.FocusEvent<HTMLInputElement>) =>
                    syncOnInputBlur(focusEvent, commitHexDraft())
                  }
                  onKeyDown={(
                    event: React.KeyboardEvent<HTMLInputElement> & {
                      target: HTMLInputElement;
                    },
                  ) => {
                    if (event.key === "Enter") {
                      event.target.blur();
                    } else if (event.key === "Escape") {
                      suppressCommitRef.current = true;
                      setHexDraft(hsvaToHexColor(color));
                      event.target.blur();
                    }
                    event.stopPropagation();
                  }}
                />, !opaque && (
                  <jsxForUiColorPicker.Fragment>
                    {[<div
                        className={
                          "my-1 w-px shrink-0 self-stretch bg-alpha-2"
                        }
                      />, <input
                        ref={alphaInputRef}
                        className={
                          "h-full w-[34px] bg-transparent pl-1.5 pr-1 text-right font-mono text-[11px] text-primary outline-none focus-visible:outline-hidden"
                        }
                        value={alphaDraft}
                        aria-label={uiMessage("design-system.picker.alphaPercent")}
                        aria-describedby={contrastDescriptionId}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setAlphaDraft(event.target.value)}
                        onBlur={(focusEvent: React.FocusEvent<HTMLInputElement>) =>
                          syncOnInputBlur(focusEvent, commitAlphaDraft())
                        }
                        onKeyDown={(
                          event: React.KeyboardEvent<HTMLInputElement> & {
                            target: HTMLInputElement;
                          },
                        ) => {
                          if (event.key === "Enter") {
                            event.target.blur();
                          } else if (event.key === "Escape") {
                            suppressCommitRef.current = true;
                            setAlphaDraft(Math.round(color.a * 100).toString());
                            event.target.blur();
                          }
                          event.stopPropagation();
                        }}
                      />, <span className={"pr-1.5 text-[10px] text-muted"}>
                        {"%"}
                      </span>]}
                  </jsxForUiColorPicker.Fragment>
                )]}
            </div>]}
        </div>, contrastResults !== undefined ? (
          <ContrastColorDetails
            fg={rgbaHex}
            results={contrastResults}
            sentenceId={contrastId}
            {...(showContrastFix
              ? {
                  fix: {
                    css: visibleFix!.css,
                    ratio: visibleFix!.ratio,
                    ground: visibleFix!.ground.label,
                    onUse: applyContrastFix,
                  },
                  fixHeld: isGestureActive,
                  fixRef: contrastFixRef,
                  onFixGoneFocused: requestFocusAfterFix,
                }
              : {})}
          />
        ) : null]}
    </div>
  );
}
export {
  beginColorPickerPointerGesture,
  COLOR_ALPHA_CHECKERBOARD,
  COLOR_PICKER_POPOVER_CLASS,
  COLOR_PICKER_POPOVER_HEIGHT,
  COLOR_SWATCH_BUTTON_CLASS,
  ColorHexInput,
  ColorPicker,
  ColorPickerGroup,
  ColorPickerHeader,
  ColorPickerLabel,
  colorTrackFraction,
  hsvaToCssColor,
  hsvaToHexColor,
  isEyeDropperAvailable,
  joinPickerClasses,
  jsxForUiColorPicker,
  normalizedRgbToHsva,
  parseCssColorToHsva,
  pickScreenColor,
  rgbaHexColor,
  SwatchButton,
  SwatchDot,
};
export function installUiColorPicker(): () => void {
  return () => {
    jsxForUiColorPicker = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COLOR_ALPHA_CHECKERBOARD =
      "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 / 8px 8px";
    COLOR_SWATCH_BUTTON_CLASS =
      "flex h-8 w-full min-w-0 shrink-0 items-center gap-2 rounded-md px-2 text-left outline-none pointer-coarse:h-10";
    COLOR_PICKER_POPOVER_HEIGHT = 440;
    COLOR_PICKER_POPOVER_CLASS = "w-64 p-4";
  };
}

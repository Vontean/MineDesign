import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var jsxColorPickerPrimitives: Dynamic;
var alphaCheckerboardBackground: Dynamic;
var ColorPickerPrimitivesClassNames: Dynamic;
function joinPickerClasses(...classNames: Dynamic[]): Dynamic {
  return classNames.filter(Boolean).join(" ");
}
function rgbToHsva(
  red?: Dynamic,
  green?: Dynamic,
  blue?: Dynamic,
  alpha?: Dynamic,
): Dynamic {
  let max: Dynamic = Math.max(red, green, blue),
    min: Dynamic = Math.min(red, green, blue),
    delta: Dynamic = max - min,
    hue: Dynamic = 0;
  delta !== 0 &&
    (max === red
      ? (hue = ((green - blue) / delta) % 6)
      : max === green
        ? (hue = (blue - red) / delta + 2)
        : (hue = (red - green) / delta + 4),
    (hue *= 60),
    hue < 0 && (hue += 360));
  let saturation: Dynamic = max === 0 ? 0 : delta / max;
  return {
    h: hue,
    s: saturation,
    v: max,
    a: alpha,
  };
}
function parseHsvaColor(cssColor?: Dynamic): Dynamic {
  let hex: Dynamic = cssColor.match(/^#([0-9a-f]{3,8})$/i)?.[1];
  if (hex && hex.length !== 5 && hex.length !== 7) {
    let expandedHex: Dynamic =
        hex.length <= 4
          ? hex.replace(
              /[0-9a-f]/gi,
              (char?: Dynamic): Dynamic => char + char,
            )
          : hex.padEnd(8, "f"),
      channelAt: Dynamic = (index?: Dynamic): Dynamic =>
        parseInt(expandedHex.slice(index * 2, index * 2 + 2), 16) / 255;
    return rgbToHsva(
      channelAt(0),
      channelAt(1),
      channelAt(2),
      hex.length === 4 || hex.length === 8 ? channelAt(3) : 1,
    );
  }
  let rgbMatch: Dynamic = cssColor.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    let clampUnitInterval: Dynamic = (channel?: Dynamic): Dynamic =>
      Math.min(1, Math.max(0, channel));
    return rgbToHsva(
      clampUnitInterval(+(rgbMatch[1] ?? 0) / 255),
      clampUnitInterval(+(rgbMatch[2] ?? 0) / 255),
      clampUnitInterval(+(rgbMatch[3] ?? 0) / 255),
      rgbMatch[4] != null ? clampUnitInterval(+rgbMatch[4]) : 1,
    );
  }
  if (
    typeof document === "undefined" ||
    typeof getComputedStyle === "undefined"
  )
    return {
      h: 0,
      s: 0,
      v: 0,
      a: 1,
    };
  let probeElement: Dynamic = (document as Dynamic).createElement("div");
  probeElement.style.color = cssColor;
  (document as Dynamic).body.appendChild(probeElement);
  let color: Dynamic = getComputedStyle(probeElement).color;
  (document as Dynamic).body.removeChild(probeElement);
  let computedMatch: Dynamic = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  return computedMatch
    ? rgbToHsva(
        +(computedMatch[1] ?? 0) / 255,
        +(computedMatch[2] ?? 0) / 255,
        +(computedMatch[3] ?? 0) / 255,
        computedMatch[4] != null ? +computedMatch[4] : 1,
      )
    : {
        h: 0,
        s: 0,
        v: 0,
        a: 1,
      };
}
function hsvaToRgbaCss(color?: Dynamic): Dynamic {
  let { h: hue, s: saturation, v: brightness, a: alpha }: Dynamic = color,
    chroma: Dynamic = brightness * saturation,
    secondary: Dynamic = chroma * (1 - Math.abs(((hue / 60) % 2) - 1)),
    matchOffset: Dynamic = brightness - chroma,
    redBase: Dynamic = 0,
    greenBase: Dynamic = 0,
    blueBase: Dynamic = 0;
  hue < 60
    ? ((redBase = chroma), (greenBase = secondary))
    : hue < 120
      ? ((redBase = secondary), (greenBase = chroma))
      : hue < 180
        ? ((greenBase = chroma), (blueBase = secondary))
        : hue < 240
          ? ((greenBase = secondary), (blueBase = chroma))
          : hue < 300
            ? ((redBase = secondary), (blueBase = chroma))
            : ((redBase = chroma), (blueBase = secondary));
  let red: Dynamic = Math.round((redBase + matchOffset) * 255),
    green: Dynamic = Math.round((greenBase + matchOffset) * 255),
    blue: Dynamic = Math.round((blueBase + matchOffset) * 255);
  return alpha < 1
    ? `rgba(${red}, ${green}, ${blue}, ${+alpha.toFixed(3)})`
    : `rgb(${red}, ${green}, ${blue})`;
}
function hsvaToRgbHex(color?: Dynamic): Dynamic {
  let rgbMatch: Dynamic = hsvaToRgbaCss({
    ...color,
    a: 1,
  }).match(/(\d+),\s*(\d+),\s*(\d+)/);
  return rgbMatch
    ? "#" +
        [+(rgbMatch[1] ?? 0), +(rgbMatch[2] ?? 0), +(rgbMatch[3] ?? 0)]
          .map(
            (channel?: Dynamic): Dynamic => channel.toString(16).padStart(2, "0"),
          )
          .join("")
          .toUpperCase()
    : "#000000";
}
function hsvaToRgbaHex(color?: Dynamic): Dynamic {
  let rgbHex: Dynamic = hsvaToRgbHex(color);
  return color.a >= 1
    ? rgbHex
    : rgbHex +
        Math.round(color.a * 255)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase();
}
function supportsEyeDropper(): Dynamic {
  return typeof EyeDropper !== "undefined";
}
async function pickEyeDropperColor(): Promise<Dynamic> {
  if (typeof EyeDropper === "undefined") return null;
  try {
    return (await new EyeDropper().open()).sRGBHex;
  } catch {
    return null;
  }
}
function trackColorPickerDrag(
  event?: Dynamic,
  onMove?: Dynamic,
  onEnd?: Dynamic,
): Dynamic {
  event.preventDefault();
  let currentTarget: Dynamic = event.currentTarget,
    bounds: Dynamic = currentTarget.getBoundingClientRect(),
    pointerId: Dynamic = event.pointerId;
  try {
    currentTarget.setPointerCapture(pointerId);
  } catch {}
  onMove(event.clientX, event.clientY, bounds);
  let handleMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
      moveEvent.pointerId === pointerId &&
        onMove(moveEvent.clientX, moveEvent.clientY, bounds);
    },
    stopTracking: Dynamic = (): Dynamic => {
      (window as Dynamic).removeEventListener("pointermove", handleMove);
      (window as Dynamic).removeEventListener("pointerup", handleUp);
      (window as Dynamic).removeEventListener("pointercancel", handleUp);
    },
    handleUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
      upEvent.pointerId === pointerId && (stopTracking(), onEnd?.());
    };
  (window as Dynamic).addEventListener("pointermove", handleMove);
  (window as Dynamic).addEventListener("pointerup", handleUp);
  (window as Dynamic).addEventListener("pointercancel", handleUp);
  return stopTracking;
}
function colorSliderPosition(clientX?: Dynamic, bounds?: Dynamic): Dynamic {
  return Math.max(
    0,
    Math.min(1, (clientX - bounds.left - 7) / (bounds.width - 14)),
  );
}
function PickerRowText({ text: text, title = false }: Dynamic): Dynamic {
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
function PickerListGroup({
  label: label,
  className: className,
  role = "group",
  scroll = true,
  children: children,
}: Dynamic): Dynamic {
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
function PickerListHeader({ text: text, title: title }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      role={"presentation"}
      className={"flex h-8 shrink-0 items-center px-2"}
    >
      <PickerRowText text={text} title={title} />
    </div>
  );
}
function ColorSwatchDot({ paint: paint, current = false }: Dynamic): Dynamic {
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
function ColorSwatchRow({
  label: label,
  paint: paint,
  current = false,
  onClick: onClick,
  readOnly = false,
  disabled: isDisabled = false,
  title: title,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let rowContent: Dynamic = (
    <jsxColorPickerPrimitives.Fragment>
      <ColorSwatchDot paint={paint} current={current} />
      <span className={"min-w-0 flex-1 truncate text-footnote text-primary"}>
        {label}
      </span>
      {current ? (<span
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
        </span>) : (null)}
    </jsxColorPickerPrimitives.Fragment>
  );
  return readOnly ? (
    <div
      role={"listitem"}
      title={title ?? (label)}
      aria-label={label}
      className={joinPickerClasses(
        ColorPickerPrimitivesClassNames,
        "cursor-default",
      )}
      {...props}
    >
      {rowContent}
    </div>
  ) : (
    <button
      type={"button"}
      title={isDisabled ? (undefined) : (title ?? (label))}
      aria-label={label}
      aria-pressed={current}
      disabled={isDisabled}
      onClick={onClick}
      className={joinPickerClasses(
        ColorPickerPrimitivesClassNames,
        isDisabled
          ? "pointer-events-none opacity-50"
          : "cursor-default hover:bg-fill-ghost-hover focus-visible:outline-hidden focus-visible:shadow-focus forced-colors:focus-visible:-outline-offset-2",
        current && "bg-fill-ghost-hover",
      )}
      {...props}
    >
      {rowContent}
    </button>
  );
}
export {
  alphaCheckerboardBackground,
  ColorPickerPrimitivesClassNames,
  colorSliderPosition,
  ColorSwatchDot,
  ColorSwatchRow,
  hsvaToRgbaCss,
  hsvaToRgbaHex,
  hsvaToRgbHex,
  joinPickerClasses,
  jsxColorPickerPrimitives,
  parseHsvaColor,
  PickerListGroup,
  PickerListHeader,
  PickerRowText,
  pickEyeDropperColor,
  rgbToHsva,
  supportsEyeDropper,
  trackColorPickerDrag,
};
export function installEditorColorPickerPrimitives(): () => void {
  return () => {
    jsxColorPickerPrimitives = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    alphaCheckerboardBackground =
      "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 / 8px 8px";
    ColorPickerPrimitivesClassNames =
      "flex h-8 w-full min-w-0 shrink-0 items-center gap-2 rounded-md px-2 text-left outline-none pointer-coarse:h-10";
  };
}

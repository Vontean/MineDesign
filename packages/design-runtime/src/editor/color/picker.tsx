import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { TabsTabsRootListTabConfig } from "../../cds/tabs/tabs";
import { announce, reactAccessibilityAnnouncer } from "../accessibility/announcer";
import { ContrastAdvice, summarizeContrastResults } from "./contrast-ui";
import { evaluateColorContrast } from "./contrast";
import { findReadableShade } from "./oklch";
import { alphaCheckerboardBackground, colorSliderPosition, hsvaToRgbaCss, hsvaToRgbaHex, hsvaToRgbHex, jsxColorPickerPrimitives, parseHsvaColor, pickEyeDropperColor, supportsEyeDropper, trackColorPickerDrag } from "./picker-primitives";

var ColorPickerConstant: Dynamic;
var ColorPickerLabel: Dynamic;
function ColorHexInput({
  value: source,
  onChange: onChange,
  className = "mb-2",
}: Dynamic): Dynamic {
  useUiLocale();
  let containerRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(null),
    handleValueChange: Dynamic = (nextValue?: Dynamic): Dynamic => {
      let activeElement: Dynamic = (document as Dynamic).activeElement,
        popoverElement: Dynamic =
          containerRef.current?.closest('[data-mc-popover], [role="dialog"]') ??
          containerRef.current?.parentElement;
      activeElement instanceof HTMLElement &&
        popoverElement &&
        popoverElement.contains(activeElement) &&
        !containerRef.current.contains(activeElement) &&
        activeElement.blur();
      onChange(nextValue);
    };
  return (
    <TabsTabsRootListTabConfig.Root
      ref={containerRef}
      value={source}
      onValueChange={(nextValue?: Dynamic): Dynamic => handleValueChange(nextValue)}
    >
      <TabsTabsRootListTabConfig.List
        aria-label={uiMessage("inspector.picker.source")}
        className={className}
        onMouseDown={(event?: Dynamic): Dynamic => event.preventDefault()}
      >
        <TabsTabsRootListTabConfig.Tab value={"system"}>
          {uiMessage("inspector.picker.theme")}
        </TabsTabsRootListTabConfig.Tab>
        <TabsTabsRootListTabConfig.Tab value={"custom"}>
          {uiMessage("inspector.picker.custom")}
        </TabsTabsRootListTabConfig.Tab>
      </TabsTabsRootListTabConfig.List>
    </TabsTabsRootListTabConfig.Root>
  );
}
function ColorPicker({
  value: colorValue,
  unset: unset,
  opaque: opaque,
  onChange: onChange,
  onPickEnd: onPickEnd,
  contrast: contrast,
}: Dynamic): Dynamic {
  useUiLocale();
  let applyOpaque: Dynamic = (color?: Dynamic): Dynamic =>
      opaque
        ? {
            ...color,
            a: 1,
          }
        : color,
    [hsva, setHsva]: Dynamic = (0,
    reactAccessibilityAnnouncer.useState)(
      (): Dynamic => applyOpaque(parseHsvaColor(colorValue)),
    ),
    hsvaRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(hsva);
  hsvaRef.current = hsva;
  let isCancelingRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(
      false,
    ),
    [hexText, setHexText]: Dynamic = (0,
    reactAccessibilityAnnouncer.useState)(
      (): Dynamic => hsvaToRgbHex(hsva),
    ),
    [alphaText, setAlphaText]: Dynamic = (0,
    reactAccessibilityAnnouncer.useState)(
      (): Dynamic => Math.round(hsva.a * 100).toString(),
    ),
    hexInputRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(null),
    alphaInputRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(null),
    isUnsetRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(
      unset ?? false,
    );
  isUnsetRef.current = unset ?? false;
  let isOpaqueRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(
    opaque ?? false,
  );
  isOpaqueRef.current = opaque ?? false;
  let onPickEndRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(
    onPickEnd,
  );
  onPickEndRef.current = onPickEnd;
  let contrastRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(
    contrast,
  );
  contrastRef.current = contrast;
  let commitPick: Dynamic = (0, reactAccessibilityAnnouncer.useCallback)(
      (hexColor?: Dynamic, shouldAnnounce?: Dynamic): Dynamic => {
        onPickEndRef.current?.(hexColor);
        let current: Dynamic = contrastRef.current;
        !shouldAnnounce ||
          current === undefined ||
          announce((): Dynamic => {
            let results: Dynamic = evaluateColorContrast(
              hexColor,
              current,
            );
            return results === undefined
              ? null
              : summarizeContrastResults(results).spoken;
          });
      },
      [],
    ),
    isHexEditedRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(false),
    lastEmittedRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(colorValue),
    syncFromValue: Dynamic = (0, reactAccessibilityAnnouncer.useCallback)(
      (cssColor?: Dynamic): Dynamic => {
        lastEmittedRef.current = cssColor;
        let parsed: Dynamic = applyOpaque(parseHsvaColor(cssColor));
        hsvaToRgbaHex(parsed) !==
          hsvaToRgbaHex(hsvaRef.current) &&
          (setHsva(parsed),
          (hsvaRef.current = parsed),
          setHexText(hsvaToRgbHex(parsed)),
          setAlphaText(Math.round(parsed.a * 100).toString()));
      },
      [],
    );
  (0, reactAccessibilityAnnouncer.useEffect)((): Dynamic => {
    if (colorValue === lastEmittedRef.current) return;
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    activeElement === hexInputRef.current ||
      activeElement === alphaInputRef.current ||
      syncFromValue(colorValue);
  }, [colorValue, syncFromValue]);
  let handleBlur: Dynamic = (event?: Dynamic, didCommit?: Dynamic): Dynamic => {
      if (didCommit) return;
      let relatedTarget: Dynamic = event.relatedTarget;
      (relatedTarget !== null &&
        (relatedTarget === hexInputRef.current ||
          relatedTarget === alphaInputRef.current)) ||
        (colorValue !== lastEmittedRef.current && syncFromValue(colorValue));
    },
    applyColor: Dynamic = (0, reactAccessibilityAnnouncer.useCallback)(
      (color?: Dynamic): Dynamic => {
        let nextColor: Dynamic = isOpaqueRef.current
            ? {
                ...color,
                a: 1,
              }
            : color,
          nextHex: Dynamic = hsvaToRgbaHex(nextColor),
          hasChanged: Dynamic =
            nextHex !== hsvaToRgbaHex(hsvaRef.current);
        setHsva(nextColor);
        hsvaRef.current = nextColor;
        setHexText(hsvaToRgbHex(nextColor));
        setAlphaText(Math.round(nextColor.a * 100).toString());
        return !hasChanged && !isUnsetRef.current
          ? false
          : ((lastEmittedRef.current = nextHex), onChange(nextHex), true);
      },
      [onChange],
    ),
    commitColor: Dynamic = (0, reactAccessibilityAnnouncer.useCallback)(
      (color?: Dynamic): Dynamic => {
        let nextColor: Dynamic = isOpaqueRef.current
          ? {
              ...color,
              a: 1,
            }
          : color;
        return !isUnsetRef.current &&
          hsvaToRgbaHex(nextColor) ===
            hsvaToRgbaHex(hsvaRef.current)
          ? (setHexText(hsvaToRgbHex(hsvaRef.current)),
            setAlphaText(Math.round(hsvaRef.current.a * 100).toString()),
            false)
          : (applyColor(nextColor),
            commitPick(hsvaToRgbaHex(nextColor), true),
            true);
      },
      [applyColor, commitPick],
    ),
    createFinishPick: Dynamic = (0, reactAccessibilityAnnouncer.useCallback)(
      (): Dynamic =>
        (shouldAnnounce?: Dynamic): Dynamic => {
          commitPick(hsvaToRgbaHex(hsvaRef.current), shouldAnnounce);
        },
      [commitPick],
    ),
    cleanupsRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(
      new Set(),
    ),
    [dragState, setDragState]: Dynamic = (0,
    reactAccessibilityAnnouncer.useState)(undefined),
    isDragging: Dynamic = dragState !== undefined,
    fixButtonRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(null),
    fixAppliedRef: Dynamic = (0, reactAccessibilityAnnouncer.useRef)(false),
    restoreFocus: Dynamic = (shouldRestore?: Dynamic): Dynamic => {
      shouldRestore || hexInputRef.current?.focus();
    };
  (0, reactAccessibilityAnnouncer.useEffect)(
    (): Dynamic => (): Dynamic => {
      for (let cleanup of cleanupsRef.current as Dynamic) cleanup();
      cleanupsRef.current.clear();
    },
    [],
  );
  let startDrag: Dynamic = (event?: Dynamic, onMove?: Dynamic): Dynamic => {
      if (event.button !== 0) return;
      fixButtonRef.current?.contains((document as Dynamic).activeElement) &&
        restoreFocus(event.pointerType === "touch");
      setDragState(
        (previousState?: Dynamic): Dynamic =>
          previousState ?? {
            shade: readableShade,
          },
      );
      let finishPick: Dynamic = createFinishPick(),
        flag: Dynamic = false,
        stopTracking: Dynamic = (): Dynamic => {},
        finishDrag: Dynamic = (shouldCommit?: Dynamic): Dynamic => {
          cleanupsRef.current.delete(cancelDrag);
          cleanupsRef.current.size === 0 && setDragState(undefined);
          stopTracking();
          flag && ((flag = false), finishPick(shouldCommit));
        },
        cancelDrag: Dynamic = (): Dynamic => finishDrag(false);
      stopTracking = trackColorPickerDrag(
        event,
        (
          clientX?: Dynamic,
          clientY?: Dynamic,
          bounds?: Dynamic,
        ): Dynamic => {
          onMove(clientX, clientY, bounds) && (flag = true);
        },
        (): Dynamic => finishDrag(true),
      );
      cleanupsRef.current.add(cancelDrag);
    },
    handleAreaPointerDown: Dynamic = (event?: Dynamic): Dynamic =>
      startDrag(
        event,
        (clientX?: Dynamic, clientY?: Dynamic, bounds?: Dynamic): Dynamic =>
          applyColor({
            ...hsvaRef.current,
            s: colorSliderPosition(clientX, bounds),
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
    handleHuePointerDown: Dynamic = (event?: Dynamic): Dynamic =>
      startDrag(
        event,
        (clientX?: Dynamic, clientY?: Dynamic, bounds?: Dynamic): Dynamic =>
          applyColor({
            ...hsvaRef.current,
            h: colorSliderPosition(clientX, bounds) * 360,
          }),
      ),
    handleAlphaPointerDown: Dynamic = (event?: Dynamic): Dynamic =>
      startDrag(
        event,
        (clientX?: Dynamic, clientY?: Dynamic, bounds?: Dynamic): Dynamic =>
          applyColor({
            ...hsvaRef.current,
            a: colorSliderPosition(clientX, bounds),
          }),
      ),
    handleEyeDropper: Dynamic = async (): Promise<Dynamic> => {
      let pickedColor: Dynamic = await pickEyeDropperColor();
      pickedColor &&
        commitColor({
          ...parseHsvaColor(pickedColor),
          a: hsvaRef.current.a,
        });
    },
    commitHexText: Dynamic = (): Dynamic => {
      if (isCancelingRef.current) {
        isCancelingRef.current = false;
        return false;
      }
      if (isUnsetRef.current && !isHexEditedRef.current) return false;
      let trimmedHex: Dynamic = hexText.trim();
      if (
        /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
          trimmedHex,
        )
      ) {
        let parsedHex: Dynamic = parseHsvaColor(
            trimmedHex.startsWith("#") ? trimmedHex : "#" + trimmedHex,
          ),
          length: Dynamic = trimmedHex.replace(/^#/, "").length;
        return commitColor(
          length === 4 || length === 8
            ? parsedHex
            : {
                ...parsedHex,
                a: hsva.a,
              },
        );
      }
      setHexText(hsvaToRgbHex(hsva));
      return false;
    },
    commitAlphaText: Dynamic = (): Dynamic => {
      if (isCancelingRef.current) {
        isCancelingRef.current = false;
        return false;
      }
      let alphaPercent: Dynamic = parseFloat(alphaText);
      return isNaN(alphaPercent) ||
        Math.round(alphaPercent) === Math.round(hsva.a * 100)
        ? (setAlphaText(Math.round(hsva.a * 100).toString()), false)
        : commitColor({
            ...hsva,
            a: Math.max(0, Math.min(1, alphaPercent / 100)),
          });
    },
    opaqueCss: Dynamic = hsvaToRgbaCss({
      ...hsva,
      a: 1,
    }),
    hexWithAlpha: Dynamic = hsvaToRgbaHex(hsva),
    contrastKey: Dynamic =
      contrast === undefined ? undefined : JSON.stringify(contrast),
    stableContrast: Dynamic = (0, reactAccessibilityAnnouncer.useMemo)(
      (): Dynamic => contrast,
      [contrastKey],
    ),
    contrastResults: Dynamic = (0, reactAccessibilityAnnouncer.useMemo)(
      (): Dynamic =>
        stableContrast === undefined
          ? undefined
          : evaluateColorContrast(hexWithAlpha, stableContrast),
      [stableContrast, hexWithAlpha],
    ),
    readableShade: Dynamic = (0, reactAccessibilityAnnouncer.useMemo)(
      (): Dynamic =>
        stableContrast === undefined || isDragging
          ? undefined
          : findReadableShade(hexWithAlpha, stableContrast),
      [stableContrast, hexWithAlpha, isDragging],
    ),
    shownShade: Dynamic = dragState !== undefined ? dragState.shade : readableShade,
    hasAdvice: Dynamic = contrastResults !== undefined && shownShade !== undefined;
  (0, reactAccessibilityAnnouncer.useLayoutEffect)((): Dynamic => {
    fixAppliedRef.current &&
      ((fixAppliedRef.current = false), hasAdvice || hexInputRef.current?.focus());
  }, [hasAdvice]);
  let useReadableShade: Dynamic = (shouldRestore?: Dynamic): Dynamic => {
      readableShade !== undefined &&
        (commitColor(parseHsvaColor(readableShade.css)), restoreFocus(shouldRestore));
    },
    markFixGone: Dynamic = (): Dynamic => {
      fixAppliedRef.current = true;
    },
    sentenceId: Dynamic = (0, reactAccessibilityAnnouncer.useId)(),
    describedBy: Dynamic = contrastResults === undefined ? undefined : sentenceId;
  return (
    <div className={"flex w-full min-w-56 flex-col"}>
      <div
        className={"relative aspect-[3/2] w-full touch-none rounded-md"}
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsva.h}, 100%, 50%))`,
        }}
        onPointerDown={handleAreaPointerDown}
      >
        <div
          className={
            "pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
          }
          style={{
            left: `calc(${hsva.s} * (100% - 14px) + 7px)`,
            top: `calc(${1 - hsva.v} * (100% - 14px) + 7px)`,
            background: opaqueCss,
          }}
        />
      </div>
      <div
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
              left: `calc(${hsva.h / 360} * (100% - 14px) + 7px)`,
              background: `hsl(${hsva.h}, 100%, 50%)`,
            }}
          />
        </div>
      </div>
      {!opaque && (<div
          className={"relative touch-none py-1 pointer-coarse:py-3.5"}
          onPointerDown={handleAlphaPointerDown}
        >
          <div
            className={"relative h-3 w-full rounded-md"}
            style={{
              background: `linear-gradient(to right, transparent, ${opaqueCss}), ${alphaCheckerboardBackground}`,
            }}
          >
            <div
              className={
                "pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
              }
              style={{
                left: `calc(${hsva.a} * (100% - 14px) + 7px)`,
                background: hsvaToRgbaCss(hsva),
              }}
            />
          </div>
        </div>)}
      <div className={"mt-1 flex items-center gap-2"}>
        {supportsEyeDropper() && (<button
            type={"button"}
            title={uiMessage("inspector.picker.pickColorFromScreen")}
            aria-label={uiMessage("inspector.picker.pickColorFromScreen")}
            onClick={handleEyeDropper}
            className={
              "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted outline-none hover:bg-alpha-1 hover:text-primary focus-visible:outline-hidden focus-visible:shadow-focus pointer-coarse:h-10 pointer-coarse:w-10"
            }
          >
            <Icon name={"EyeDropper"} size={"sm"} />
          </button>)}
        <div
          className={
            "flex h-6 min-w-0 flex-1 items-center rounded bg-fill-field shadow-field-ring transition duration-fast hover:not-focus-within:shadow-field-hover has-[:focus-visible]:shadow-focus pointer-coarse:h-10"
          }
        >
          <input
            ref={hexInputRef}
            className={
              "h-full min-w-0 flex-1 bg-transparent px-1.5 font-mono text-[11px] text-primary outline-none focus-visible:outline-hidden"
            }
            value={hexText}
            aria-label={uiMessage("inspector.picker.hexColor")}
            aria-describedby={describedBy}
            onChange={(event?: Dynamic): Dynamic => {
              isHexEditedRef.current = true;
              setHexText(event.target.value);
            }}
            onFocus={(): Dynamic => {
              isHexEditedRef.current = false;
            }}
            onBlur={(event?: Dynamic): Dynamic =>
              handleBlur(event, commitHexText())
            }
            onKeyDown={(event?: Dynamic): Dynamic => {
              event.key === "Enter"
                ? event.target.blur()
                : event.key === "Escape" &&
                  ((isCancelingRef.current = true),
                  setHexText(hsvaToRgbHex(hsva)),
                  event.target.blur());
              event.stopPropagation();
            }}
          />
          {!opaque && (<jsxColorPickerPrimitives.Fragment>
              <div className={"my-1 w-px shrink-0 self-stretch bg-alpha-2"} />
              <input
                ref={alphaInputRef}
                className={
                  "h-full w-[34px] bg-transparent pl-1.5 pr-1 text-right font-mono text-[11px] text-primary outline-none focus-visible:outline-hidden"
                }
                value={alphaText}
                aria-label={uiMessage("inspector.picker.alphaPercent")}
                aria-describedby={describedBy}
                onChange={(event?: Dynamic): Dynamic =>
                  setAlphaText(event.target.value)
                }
                onBlur={(event?: Dynamic): Dynamic =>
                  handleBlur(event, commitAlphaText())
                }
                onKeyDown={(event?: Dynamic): Dynamic => {
                  event.key === "Enter"
                    ? event.target.blur()
                    : event.key === "Escape" &&
                      ((isCancelingRef.current = true),
                      setAlphaText(Math.round(hsva.a * 100).toString()),
                      event.target.blur());
                  event.stopPropagation();
                }}
              />
              <span className={"pr-1.5 text-[10px] text-muted"}>{"%"}</span>
            </jsxColorPickerPrimitives.Fragment>)}
        </div>
      </div>
      {contrastResults !== undefined ? (<ContrastAdvice
          fg={hexWithAlpha}
          results={contrastResults}
          sentenceId={sentenceId}
          {...(hasAdvice
            ? {
                fix: {
                  css: shownShade.css,
                  ratio: shownShade.ratio,
                  ground: shownShade.ground.label,
                  onUse: useReadableShade,
                },
                fixHeld: isDragging,
                fixRef: fixButtonRef,
                onFixGoneFocused: markFixGone,
              }
            : {})}
        />) : (null)}
    </div>
  );
}
export {
  ColorHexInput,
  ColorPicker,
  ColorPickerConstant,
  ColorPickerLabel,
};
export function installEditorColorPicker(): () => void {
  return () => {
    ColorPickerConstant = 440;
    ColorPickerLabel = "w-64 p-4";
  };
}

import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cn } from "../../cds/theme/class-names";
import { resolveColorTokenValue } from "../accessibility/announcements";
import { ColorValue } from "../color/contrast-copy";
import { parseHsvaColor } from "../color/picker-primitives";
import { ColorHexInput, ColorPickerConstant } from "../color/picker";
import { contrastingGradientSeed, CssGradientsItems, parseCssGradient, parseCssGradientStop, serializeCssGradient, serializeCssGradientStop } from "../css/gradients";
import { classifyStyleValue, describeColorValue, splitColorAlpha } from "../css/values";
import { useInspectorContext } from "../inspector/context-part-2";
import { InspectorPropertySchemaItems } from "../inspector/property-schema";
import { AssetColorWell, escapeCssUrl, ImageAssetPicker, jsxPropertiesAssetPicker_3, PropertiesAssetPickerPattern, PropertyAssetPopup, reactPropertiesAssetPicker_3 } from "./asset-picker";
import { GradientEditor, normalizedGradientStops } from "./gradient-editor";
import { useLiveStyleScrub, useStyleCommitScrub } from "./live-scrub";
import { NumericInput } from "./numeric-input";
import { PropertyColorWell, PropertyPickerButton } from "./primitives";
import { PropertyRow } from "./row";
import { PropertySelect } from "./select";
import { artboardColorSwatchGroup, matchArtboardColorToken, TokenColorPicker } from "./token-color-picker";
import { sanitizeCssBackground } from "../../platform/css-sanitization";

var PropertiesBackgroundEditorItems: Dynamic;
function PropertySelectTrigger({
  className: className,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyPickerButton
      className={cn("w-full", className)}
      {...props}
    />
  );
}
function CssColorWell({ css: css }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <PropertyColorWell
      background={css ? sanitizeCssBackground(css) : undefined}
    />
  );
}
function AuthoredColorPicker({
  value: value,
  authoredValue: authoredValue,
  seed: seed,
  onChange: onChange,
  disabled: disabled,
  plain = false,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let {
      dsColorTokens: dsColorTokens,
      artboardColors: artboardColors,
      iframeDefinedVars: iframeDefinedVars,
    }: Dynamic = useInspectorContext(),
    [swatchGroup]: Dynamic = (0, reactPropertiesAssetPicker_3.useState)(
      (): Dynamic =>
        plain ? undefined : artboardColorSwatchGroup(artboardColors),
    );
  return disabled ? null : (
    <TokenColorPicker
      {...props}
      value={value || seed || "#ffffff"}
      authoredValue={authoredValue}
      unset={!value}
      onChange={onChange}
      tokens={plain ? PropertiesBackgroundEditorItems : dsColorTokens}
      context={swatchGroup}
      iframeDefinedVars={plain ? undefined : iframeDefinedVars}
      title={ColorValue}
    />
  );
}
function CssNumericPopupInput({
  name: name,
  prefix: prefix,
  unit = "px",
  ownUnit = "px",
  value: value,
  shown: shown,
  min: min,
  max: max,
  steppers = true,
  disabled: disabled,
  onChange: onChange,
}: Dynamic): Dynamic {
  useUiLocale();
  let [draftValue, setDraftValue]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(null),
    scrub: Dynamic = useStyleCommitScrub(
      (nextValue?: Dynamic): Dynamic => {
        setDraftValue(nextValue);
        onChange(nextValue);
      },
    ),
    currentValue: Dynamic = Number.isFinite(value) ? value : 0;
  return (
    <NumericInput
      value={draftValue ?? shown ?? currentValue}
      prefix={prefix}
      unit={unit}
      refuseLetters={true}
      ownUnit={ownUnit}
      min={min}
      max={max}
      steppers={steppers}
      disabled={disabled}
      aria-label={name}
      onValue={(nextValue?: Dynamic): Dynamic => {
        nextValue === undefined || nextValue === currentValue || onChange(nextValue);
      }}
      onScrub={scrub.onScrub}
      onScrubEnd={(): Dynamic => {
        scrub.onScrubEnd();
        setDraftValue(null);
      }}
    />
  );
}
function CssNumericPopupRow({
  label: label,
  value: value,
  unit: unit,
  ownUnit: ownUnit,
  min: min,
  max: max,
  steppers: steppers,
  disabled: disabled,
  onChange: onChange,
}: Dynamic): Dynamic {
  useUiLocale();
  let { start: startScrub, live: liveValue }: Dynamic = useLiveStyleScrub({
    value: Number.isFinite(value) ? value : 0,
    min: min,
    max: max,
    disabled: disabled,
    onScrub: (rawValue?: Dynamic): Dynamic => onChange(Math.round(rawValue)),
  });
  return (
    <PropertyRow
      label={label}
      labelProps={
        disabled
          ? undefined
          : {
              onPointerDown: startScrub,
              className: "cursor-ew-resize touch-none",
            }
      }
    >
      <CssNumericPopupInput
        name={label}
        unit={unit}
        ownUnit={ownUnit}
        value={value}
        shown={liveValue != null ? Math.round(liveValue) : null}
        min={min}
        max={max}
        steppers={steppers}
        disabled={disabled}
        onChange={onChange}
      />
    </PropertyRow>
  );
}
function useBackgroundEditor({
  value: value,
  companionValue: companionValue,
  companionAuthored: companionAuthored,
  valueAuthored: valueAuthored,
  varPartial: varPartial,
  companionVarPartial: companionVarPartial,
  fallback: fallback,
  disabled: disabled,
  mixed: mixed,
  inherited: inherited,
  noImageReason: noImageReason,
  textFill: textFill,
  varSource: varSource,
  writer: writer,
  open: open,
  tokens: tokens,
  definedVars: definedVars,
}: Dynamic): Dynamic {
  let commit: Dynamic = writer.commit,
    [selectedStopIndex, setSelectedStopIndex]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(0),
    [pendingMode, setPendingMode]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(null),
    isTextFill: Dynamic = textFill !== undefined,
    layerCss: Dynamic = isTextFill
      ? textFill.clipped
        ? (textFill.layer ?? textFill.computedLayer ?? "")
        : ""
      : (value ?? ""),
    solidColorValue: Dynamic = isTextFill ? (value ?? "") : (companionValue ?? ""),
    gradient: Dynamic = parseCssGradient(layerCss),
    imageUrl: Dynamic =
      /url\("((?:[^"\\]|\\.)*)"\)/
        .exec(layerCss)?.[1]
        ?.replace(/\\(.)/g, "$1") ??
      /url\((['"]?)([^'")]+)\1\)/.exec(layerCss)?.[2] ??
      null,
    strippedLayerCss: Dynamic = layerCss;
  for (
    let index: Dynamic = 0;
    index < 8 && /\([^()]*\)/.test(strippedLayerCss);
    index++
  )
    strippedLayerCss = strippedLayerCss.replace(/[\w-]*\([^()]*\)/g, "");
  let layerSize: Dynamic =
      /\/\s*([^;,]+?)(?:\s+(?:no-repeat|repeat|repeat-[xy]|space|round)\b)?\s*(?:,|$)/i
        .exec(strippedLayerCss)?.[1]
        ?.trim(),
    imageSize: Dynamic =
      (isTextFill ? textFill.size?.trim().toLowerCase() : undefined) ??
      layerSize?.toLowerCase() ??
      (isTextFill ? "cover" : "auto"),
    presetImageSize: Dynamic = /^(cover|contain|auto)$/i.test(imageSize)
      ? imageSize
      : null,
    detectedMode: Dynamic = imageUrl
      ? "image"
      : gradient
        ? "gradient"
        : layerCss || solidColorValue
          ? "color"
          : "none",
    [previousDetectedMode, setPreviousDetectedMode]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(detectedMode);
  previousDetectedMode !== detectedMode &&
    (setPreviousDetectedMode(detectedMode), pendingMode !== null && pendingMode !== "image" && setPendingMode(null));
  let mode: Dynamic = pendingMode ?? detectedMode,
    solid: Dynamic = isTextFill
      ? solidColorValue
      : solidColorValue || (gradient ? "" : layerCss) || "",
    lastGradientRef: Dynamic = (0, reactPropertiesAssetPicker_3.useRef)(null);
  open && gradient && (lastGradientRef.current = gradient);
  let radialMemoryRef: Dynamic = (0, reactPropertiesAssetPicker_3.useRef)({}),
    angleScrub: Dynamic = useStyleCommitScrub(
      (angle?: Dynamic): Dynamic => {
        gradient &&
          commitGradient({
            ...gradient,
            angle: angle,
          });
      },
    ),
    fallbackColor: Dynamic =
      fallback &&
      fallback !== "rgba(0, 0, 0, 0)" &&
      fallback !== "transparent" &&
      classifyStyleValue(fallback).kind === "literal"
        ? fallback
        : undefined,
    kind: Dynamic = classifyStyleValue(solid).kind,
    solidCss: Dynamic =
      kind === "literal"
        ? solid
        : resolveColorTokenValue(solid, tokens),
    previewCss: Dynamic = mixed
      ? undefined
      : gradient
        ? serializeCssGradient(gradient)
        : imageUrl
          ? undefined
          : (solidCss ??
            (mode === "none" || (mode === "color" && kind !== "literal")
              ? fallbackColor
              : undefined)),
    summaryLabel: Dynamic = mixed
      ? "Mixed"
      : mode === "none"
        ? fallbackColor
          ? describeColorValue(fallbackColor)
          : "None"
        : mode === "gradient"
          ? gradient?.radial
            ? "Radial"
            : "Linear"
          : mode === "image"
            ? "Image"
            : describeColorValue(solid),
    solidAuthoredSource: Dynamic = isTextFill
      ? (varSource ?? valueAuthored)
      : solidColorValue
        ? companionAuthored
        : valueAuthored,
    tokenSourceValue: Dynamic = mixed
      ? undefined
      : mode === "color"
        ? (((isTextFill || !solidColorValue ? varPartial : companionVarPartial) === true
            ? undefined
            : solidAuthoredSource) ?? solid)
        : mode === "none"
          ? ((varPartial === true ? undefined : varSource) ?? fallbackColor)
          : undefined,
    matchedToken: Dynamic = (0, reactPropertiesAssetPicker_3.useMemo)(
      (): Dynamic =>
        matchArtboardColorToken(tokenSourceValue, tokens, definedVars),
      [tokenSourceValue, tokens, definedVars],
    ),
    { main: summaryMain, alphaPct: summaryAlpha }: Dynamic = splitColorAlpha(matchedToken ?? summaryLabel),
    inkResetEdits: Dynamic =
      isTextFill && textFill.transparentInk !== undefined
        ? [
            {
              prop: "color",
              value: textFill.transparentInk === "inline" ? null : "inherit",
            },
          ]
        : [],
    clearTextFillEdits: Dynamic =
      !isTextFill || !textFill.clipped
        ? []
        : [
            {
              prop: "background",
              value:
                textFill.inlineClip && textFill.layer !== null
                  ? null
                  : "none",
            },
            ...InspectorPropertySchemaItems.map(
              (propName?: Dynamic): Dynamic => ({
                prop: propName,
                value:
                  propName === "-webkit-text-fill-color" && !textFill.inlineClip
                    ? "currentcolor"
                    : null,
              }),
            ),
            ...inkResetEdits,
          ],
    buildSolidEdits: Dynamic = (color?: Dynamic): Dynamic =>
      isTextFill
        ? [
            ...clearTextFillEdits.filter(
              (edit?: Dynamic): Dynamic => edit.prop !== "color",
            ),
            {
              prop: "color",
              value: color || null,
            },
          ]
        : [
            {
              prop: "background-color",
              value: color || null,
            },
            {
              prop: "background",
              value: null,
            },
          ],
    commitSolid: Dynamic = (color?: Dynamic): Dynamic =>
      commit(buildSolidEdits(color)),
    buildGradientEdits: Dynamic = (nextGradient?: Dynamic): Dynamic =>
      isTextFill
        ? [
            {
              prop: "background-image",
              value: serializeCssGradient(nextGradient),
            },
            {
              prop: "background-size",
              value: null,
            },
            {
              prop: "background-position",
              value: null,
            },
            {
              prop: "background-repeat",
              value: null,
            },
            ...CssGradientsItems,
          ]
        : [
            {
              prop: "background",
              value: serializeCssGradient(nextGradient),
            },
            {
              prop: "background-color",
              value: null,
            },
          ],
    commitGradient: Dynamic = (nextGradient?: Dynamic): Dynamic =>
      commit(buildGradientEdits(nextGradient)),
    toCssUrl: Dynamic = (url?: Dynamic): Dynamic =>
      /^https?:/i.test(url)
        ? `url("${escapeCssUrl(url)}")`
        : `url("${url.replace(/["\\]/g, "\\$&")}")`,
    commitImage: Dynamic = (url?: Dynamic, size?: Dynamic): Dynamic =>
      commit(
        isTextFill
          ? url
            ? [
                {
                  prop: "background-image",
                  value: toCssUrl(url),
                },
                {
                  prop: "background-size",
                  value: size,
                },
                {
                  prop: "background-position",
                  value: "center",
                },
                {
                  prop: "background-repeat",
                  value: "no-repeat",
                },
                ...CssGradientsItems,
              ]
            : clearTextFillEdits
          : [
              {
                prop: "background",
                value: url
                  ? `${toCssUrl(url)} center / ${size} no-repeat`
                  : null,
              },
              {
                prop: "background-color",
                value: null,
              },
            ],
      ),
    switchMode: Dynamic = (nextMode?: Dynamic): Dynamic => {
      if (nextMode === mode) return;
      setPendingMode(nextMode);
      let isUsableLiteralColor: Dynamic = (color?: Dynamic): Dynamic =>
        !!color &&
        classifyStyleValue(color).kind === "literal" &&
        !/url\(/i.test(color);
      if (nextMode === "color" && isTextFill) {
        textFill.clipped && commit(clearTextFillEdits);
        return;
      }
      if (nextMode === "color") {
        if (solidColorValue || (layerCss && !gradient && !imageUrl)) {
          (gradient || imageUrl) &&
            commit([
              {
                prop: "background",
                value: null,
              },
            ]);
          return;
        }
        let firstStopColor: Dynamic = gradient?.stops[0]
            ?.replace(/(\s+-?[\d.]+[a-z%]*)+$/i, "")
            .trim(),
          seedColor: Dynamic =
            firstStopColor &&
            (!/\s/.test(firstStopColor) || /^[a-z-]+\([^)]*\)$/i.test(firstStopColor))
              ? firstStopColor
              : undefined;
        commitSolid(isUsableLiteralColor(seedColor) ? seedColor : "#cccccc");
      } else if (nextMode === "image") setSelectedStopIndex(0);
      else {
        let current: Dynamic = lastGradientRef.current,
          isVisibleColor: Dynamic = (color?: Dynamic): Dynamic =>
            isUsableLiteralColor(color) && parseHsvaColor(color).a > 0,
          gradientStartColor: Dynamic = isVisibleColor(solidCss)
            ? solidCss
            : isTextFill && isVisibleColor(fallbackColor)
              ? describeColorValue(fallbackColor).toLowerCase()
              : "#c1672a",
          gradientEndColor: Dynamic = isTextFill
            ? contrastingGradientSeed(gradientStartColor)
            : "#28211a",
          initialGradient: Dynamic = current ?? {
            angle: 180,
            stops: [gradientStartColor, gradientEndColor],
          };
        setSelectedStopIndex(0);
        if (
          (isTextFill || !solidColorValue) &&
          gradient &&
          serializeCssGradient(gradient) ===
            serializeCssGradient(initialGradient)
        )
          return;
        commitGradient(initialGradient);
      }
    },
    selectedStop: Dynamic = gradient ? Math.min(selectedStopIndex, gradient.stops.length - 1) : 0,
    activeTab: Dynamic = mode === "none" ? "color" : mode,
    endSession: Dynamic = (): Dynamic => {
      setPendingMode(null);
      lastGradientRef.current = null;
      radialMemoryRef.current = {};
    },
    face: Dynamic =
      activeTab === "image" ? (
        <jsxPropertiesAssetPicker_3.Fragment>
          <ImageAssetPicker
            value={imageUrl}
            disabled={disabled}
            previewSize={presetImageSize ?? "cover"}
            onChange={(nextImageUrl?: Dynamic): Dynamic =>
              commitImage(nextImageUrl, imageUrl ? imageSize : "cover")
            }
          />
          <PropertyRow
            label={uiMessage("inspector.backgroundEditor.size")}
            title={imageUrl ? (undefined) : (uiMessage("inspector.backgroundEditor.pickAnImageFirst"))}
          >
            <PropertySelect
              aria-label={uiMessage("inspector.backgroundEditor.imageSize")}
              data-testid={"dc-fill-image-size"}
              items={[
                {
                  value: "cover",
                  get label() { return uiMessage("inspector.backgroundEditor.cover2"); },
                },
                {
                  value: "contain",
                  get label() { return uiMessage("inspector.backgroundEditor.contain"); },
                },
                {
                  value: "auto",
                  get label() { return uiMessage("inspector.backgroundEditor.original"); },
                },
              ]}
              value={imageUrl ? presetImageSize : null}
              placeholder={imageUrl ? (imageSize) : (uiMessage("inspector.backgroundEditor.cover"))}
              disabled={disabled || !imageUrl}
              onChange={(nextSize?: Dynamic): Dynamic => {
                !imageUrl || nextSize === presetImageSize || commitImage(imageUrl, nextSize);
              }}
            />
          </PropertyRow>
        </jsxPropertiesAssetPicker_3.Fragment>
      ) : activeTab === "gradient" && gradient ? (
        ((): Dynamic => {
          let resolveStopColor: Dynamic = (color?: Dynamic): Dynamic =>
              color && /^var\(/i.test(color)
                ? resolveColorTokenValue(color, tokens)
                : color,
            stops: Dynamic = gradient.stops
              .map(parseCssGradientStop)
              .map((stop?: Dynamic): Dynamic => {
                let resolvedSwatch: Dynamic = resolveStopColor(stop.swatch ?? stop.color),
                  displayStop: Dynamic =
                    resolvedSwatch !== undefined && resolvedSwatch !== stop.color
                      ? {
                          ...stop,
                          swatch: resolvedSwatch,
                        }
                      : stop;
                return stop.opaque
                  ? {
                      ...displayStop,
                      locked: true,
                      ...(PropertiesAssetPickerPattern.test(
                        stop.raw ?? "",
                      )
                        ? {
                            hint: true,
                          }
                        : {}),
                    }
                  : displayStop;
              }),
            buildGradientFromStops: Dynamic = (stopList?: Dynamic): Dynamic => ({
              ...gradient,
              stops: stopList.map(serializeCssGradientStop),
            }),
            commitStops: Dynamic = (stopList?: Dynamic): Dynamic =>
              commitGradient(buildGradientFromStops(stopList)),
            live: Dynamic = writer.live,
            replaceStopColor: Dynamic = (
              stopIndex?: Dynamic,
              color?: Dynamic,
            ): Dynamic =>
              stops.map(
                (stop?: Dynamic, index?: Dynamic): Dynamic =>
                  index !== stopIndex
                    ? stop
                    : stop.opaque
                      ? {
                          color: color,
                          pos:
                            stop.pos ??
                            normalizedGradientStops(stops)[
                              stopIndex
                            ],
                        }
                      : {
                          ...stop,
                          color: color,
                          swatch: undefined,
                        },
              );
          return (
            <GradientEditor
              testid={"dc-fill-gradient"}
              radial={gradient.radial === true}
              onRadial={(isRadial?: Dynamic): Dynamic => {
                let current: Dynamic = radialMemoryRef.current;
                if (isRadial) {
                  current.angle = gradient.angle;
                  commitGradient({
                    ...gradient,
                    radial: true,
                    ...(current.shape !== undefined
                      ? {
                          shape: current.shape,
                        }
                      : {}),
                  });
                } else {
                  gradient.shape !== undefined &&
                    (current.shape = gradient.shape);
                  let { shape: unusedShape, ...gradientWithoutShape }: Dynamic = gradient;
                  commitGradient({
                    ...gradientWithoutShape,
                    radial: false,
                    angle: current.angle ?? gradient.angle,
                  });
                }
              }}
              angle={gradient.angle}
              onAngle={(nextAngle?: Dynamic): Dynamic =>
                commitGradient({
                  ...gradient,
                  angle: nextAngle ?? 180,
                })
              }
              onAngleScrub={
                live
                  ? (nextAngle?: Dynamic): Dynamic =>
                      live(
                        buildGradientEdits({
                          ...gradient,
                          angle: nextAngle,
                        }),
                      )
                  : angleScrub.onScrub
              }
              onAngleScrubEnd={
                live ? (): Dynamic => writer.settle?.() : angleScrub.onScrubEnd
              }
              stops={stops}
              selected={selectedStop}
              onSelect={setSelectedStopIndex}
              onStops={(stopList?: Dynamic): Dynamic => commitStops(stopList)}
              {...(live
                ? {
                    onStopsLive: (stopList?: Dynamic): Dynamic =>
                      live(buildGradientEdits(buildGradientFromStops(stopList))),
                    onLiveEnd: (): Dynamic => writer.settle?.(),
                  }
                : {})}
              maxStops={8}
              disabled={disabled}
              renderStopPicker={(stopIndex?: Dynamic): Dynamic => (
                <AuthoredColorPicker
                  value={
                    stops[stopIndex]?.swatch ?? stops[stopIndex]?.color ?? ""
                  }
                  disabled={disabled}
                  plain={true}
                  onChange={(color?: Dynamic): Dynamic =>
                    live
                      ? live(buildGradientEdits(buildGradientFromStops(replaceStopColor(stopIndex, color))))
                      : commitStops(replaceStopColor(stopIndex, color))
                  }
                  {...(live
                    ? {
                        onPickEnd: (color?: Dynamic): Dynamic => {
                          writer.settle?.();
                          commitStops(replaceStopColor(stopIndex, color));
                        },
                      }
                    : {})}
                />
              )}
            />
          );
        })()
      ) : null;
  return {
    mode: mode,
    tab: activeTab,
    kind: {
      value: activeTab,
      options: [
        {
          value: "color",
          get label() { return uiMessage("inspector.backgroundEditor.color"); },
        },
        {
          value: "gradient",
          get label() { return uiMessage("inspector.backgroundEditor.gradient"); },
        },
        {
          value: "image",
          get label() { return uiMessage("inspector.backgroundEditor.image"); },
          ...(noImageReason !== undefined
            ? {
                disabledReason: noImageReason,
              }
            : {}),
        },
      ],
      onChange: (nextMode?: Dynamic): Dynamic => switchMode(nextMode),
      disabled: disabled,
    },
    face: face,
    solid: solid,
    solidCss: solidCss,
    solidAuthored:
      solidAuthoredSource ?? (mode === "none" || kind === "var" ? tokenSourceValue : undefined),
    fallbackColor: fallbackColor,
    setSolid: (color?: Dynamic, shouldClearPendingMode: Dynamic = false): Dynamic => {
      shouldClearPendingMode && setPendingMode(null);
      commitSolid(color);
    },
    solidEdits: buildSolidEdits,
    imageUrl: imageUrl,
    previewCss: previewCss,
    summary: matchedToken ?? summaryLabel,
    summaryMain: summaryMain,
    summaryAlpha: summaryAlpha,
    endSession: endSession,
  };
}
function PropertyBackgroundRow({
  label: label,
  onCommitMany: onCommitMany,
  testId: testId,
  contrast: contrast,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)(false),
    {
      dsColorTokens: dsColorTokens,
      iframeDefinedVars: iframeDefinedVars,
      editsAreUndoSteps: editsAreUndoSteps,
    }: Dynamic = useInspectorContext(),
    editor: Dynamic = useBackgroundEditor({
      ...props,
      writer: {
        commit: onCommitMany,
      },
      open: isOpen,
      tokens: dsColorTokens,
      definedVars: iframeDefinedVars,
    }),
    { disabled: disabled, mixed: mixed }: Dynamic = props,
    hasDsTokens: Dynamic = dsColorTokens.length > 0,
    [activeTab, setActiveTab]: Dynamic = (0,
    reactPropertiesAssetPicker_3.useState)("system"),
    isSystemTab: Dynamic = hasDsTokens && activeTab === "system";
  return (
    <PropertyAssetPopup
      open={isOpen}
      onOpenChange={(nextOpen?: Dynamic): Dynamic => {
        setIsOpen(nextOpen);
        nextOpen
          ? setActiveTab(
              hasDsTokens && (editor.mode === "color" || editor.mode === "none")
                ? "system"
                : "custom",
            )
          : editor.endSession();
      }}
      title={label}
      header={
        hasDsTokens ? (
          <ColorHexInput
            value={activeTab}
            onChange={setActiveTab}
            className={""}
          />
        ) : undefined
      }
      planHeight={ColorPickerConstant}
      editsAreUndoSteps={editsAreUndoSteps}
      data-testid={"dc-fill-popover"}
      trigger={
        <PropertySelectTrigger
          aria-label={uiMessage("inspector.backgroundEditor.undefined", { value1: String(label), value2: String(mixed ? (uiMessage("inspector.backgroundEditor.mixed")) : (editor.summary)) })}
          disabled={disabled}
          data-testid={testId}
          chip={
            editor.imageUrl && !mixed ? (
              <AssetColorWell src={editor.imageUrl} />
            ) : (
              <CssColorWell css={editor.previewCss} />
            )
          }
          muted={mixed}
          caption={editor.summaryAlpha}
        >
          {editor.summaryMain}
        </PropertySelectTrigger>
      }
    >
      <div
        className={cn(
          hasDsTokens ? "px-4" : "px-lg",
          "[--pp-edge:0px]",
        )}
      >
        <AuthoredColorPicker
          value={
            isSystemTab && editor.mode !== "color" ? "" : (editor.solidCss ?? "")
          }
          authoredValue={
            editor.mode === "gradient" || editor.mode === "image"
              ? undefined
              : editor.solidAuthored
          }
          seed={editor.fallbackColor}
          onChange={(color?: Dynamic): Dynamic =>
            editor.setSolid(color, isSystemTab)
          }
          disabled={disabled}
          tab={hasDsTokens ? activeTab : undefined}
          headless={true}
          kind={editor.kind}
          face={editor.face}
          contrast={
            editor.mode === "color" || editor.mode === "none"
              ? contrast
              : undefined
          }
        />
      </div>
    </PropertyAssetPopup>
  );
}
export {
  AuthoredColorPicker,
  CssColorWell,
  CssNumericPopupInput,
  CssNumericPopupRow,
  PropertiesBackgroundEditorItems,
  PropertyBackgroundRow,
  PropertySelectTrigger,
  useBackgroundEditor,
};
export function installEditorPropertiesBackgroundEditor(): () => void {
  return () => {
    PropertiesBackgroundEditorItems = [];
  };
}

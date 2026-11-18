import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { cssVariableName } from "../canvas/working-state";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { showEditorToast } from "../editor/chrome/pending-toasts";
import { normalizeStyleEdits } from "../editor/css/edit-validation";
import { useBackgroundEditor } from "../editor/properties/background-editor";
import { samePaint } from "../editor/properties/color-swatches";
import { PropertyColorRow } from "../editor/properties/rows";
import { PropertyOptionIcon } from "../editor/properties/tool-options";
import { CropValue, PropertiesTooltipNameViewBoxPathsConfig as borderWeightIcon, PropertiesTooltipNameViewBoxPathsConfig_3 as cornerRadiusIcon, PropertiesTooltipNameViewBoxPathsConfig_5 as spacingIcon } from "../editor/properties/tooltip";
import { SessionActionsPopover, SessionImageReplaceButton, SessionPopup } from "../editor/session-strip/popups";
import { SessionStripButton, SessionStripDivider, SessionStripGroup } from "../editor/session-strip/session-strip";
import { normalizeHexColor } from "../editor/typography/census";
import { toModuleNamespace } from "../module-helpers";
import { BorderQuickPanel, quickPanelPopoverOptions, RadiusQuickPanel, SpacingQuickPanel } from "./quick-panels";

var react_mEt: Dynamic;
var jsx_il: Dynamic;
var cssBoxSides: Dynamic;
var parseQuickPanelColor: Dynamic;
var inlineImageUrl: Dynamic;
var radiusCssProperties: Dynamic;
var parseOptionalPixelValue: Dynamic;
var serializeOptionalPixelValue: Dynamic;
var designSwatchCssVariable: Dynamic;
var editListToStylePairs: Dynamic;
var unsupportedQuickPanelValueMessage: Dynamic;
var areStyleEditsSupported: Dynamic;
var quickPanelStyleIo: Dynamic;
var emptyQuickPanelStyleEdits: Dynamic;
function readBorderSideWidths(styleIo?: Dynamic): Dynamic {
  let uniformWidth: Dynamic = parseOptionalPixelValue(styleIo.get("border-width")),
    readSideWidth: Dynamic = (side?: Dynamic): Dynamic =>
      parseOptionalPixelValue(styleIo.get("border-" + side + "-width")) ??
      uniformWidth;
  return {
    top: readSideWidth("top"),
    right: readSideWidth("right"),
    bottom: readSideWidth("bottom"),
    left: readSideWidth("left"),
  };
}
function uniformNonzeroBorderWidth(widths?: Dynamic): Dynamic {
  let nonzeroWidths: Dynamic = cssBoxSides
    .map((side?: Dynamic): Dynamic => widths[side])
    .filter((sideWidth?: Dynamic): Dynamic => sideWidth !== undefined && sideWidth > 0);
  if (nonzeroWidths.length !== 0)
    return nonzeroWidths.every((sideWidth?: Dynamic): Dynamic => sideWidth === nonzeroWidths[0])
      ? nonzeroWidths[0]
      : undefined;
}
function activeBorderSides(widths?: Dynamic): Dynamic {
  let activeSides: Dynamic = cssBoxSides.filter(
    (side?: Dynamic): Dynamic => (widths[side] ?? 0) > 0,
  );
  return activeSides.length === 0 || activeSides.length === 4 ? undefined : activeSides;
}
function sideStyleChanges(prefix?: Dynamic, sides?: Dynamic): Dynamic {
  return cssBoxSides
    .filter((side?: Dynamic): Dynamic => side in sides)
    .map(
      (side?: Dynamic): Dynamic => [
        prefix + "-" + side,
        serializeOptionalPixelValue(sides[side]),
      ],
    );
}
function matchingDesignSwatchName(
  swatches?: Dynamic,
  cssValue?: Dynamic,
  definedVariables?: Dynamic,
): Dynamic {
  if (cssValue === undefined) return null;
  let variableName: Dynamic = cssVariableName(cssValue.trim());
  if (variableName !== null)
    return (
      swatches.find(
        (swatch?: Dynamic): Dynamic =>
          designSwatchCssVariable(swatch.name) === variableName,
      )?.name ?? null
    );
  let matchingSwatch: Dynamic = swatches.find(
    (swatch?: Dynamic): Dynamic =>
      !swatch.empty &&
      !(
        definedVariables?.has(
          designSwatchCssVariable(swatch.picks ?? swatch.name) ?? "",
        ) ?? false
      ) &&
      samePaint(swatch.color, cssValue),
  );
  return matchingSwatch === undefined ? null : (matchingSwatch.picks ?? matchingSwatch.name);
}
function valueForDesignSwatch(
  swatches?: Dynamic,
  swatchName?: Dynamic,
  definedVariables?: Dynamic,
): Dynamic {
  let swatch: Dynamic = swatches.find(
    (candidate?: Dynamic): Dynamic => candidate.name === swatchName,
  );
  if (swatch === undefined) return;
  let variableName: Dynamic = designSwatchCssVariable(swatch.name);
  return variableName === undefined ||
    definedVariables?.has(variableName) !== true ||
    swatches.some(
      (other?: Dynamic): Dynamic =>
        other !== swatch &&
        designSwatchCssVariable(other.name) === variableName &&
        !samePaint(other.color, swatch.color),
    )
    ? swatch.color
    : "var(" + variableName + ")";
}
function BackgroundQuickPanel({
  io: io,
  swatches: swatches,
  defined: defined,
  faces = true,
  testid = "mega-qp-bg",
  editsAreUndoSteps: editsAreUndoSteps,
}: Dynamic): Dynamic {
  useUiLocale();
  let backgroundColor: Dynamic = io.get("background-color"),
    [isOpen, setIsOpen]: Dynamic = (0, react_mEt.useState)(false),
    backgroundEditor: Dynamic = useBackgroundEditor({
      value: io.get("background") ?? null,
      companionValue: backgroundColor ?? null,
      fallback: io.rendered?.background ?? undefined,
      writer: quickPanelStyleIo(io),
      open: isOpen,
      tokens: emptyQuickPanelStyleEdits,
    }),
    previewPaint: Dynamic =
      backgroundEditor.mode === "gradient"
        ? backgroundEditor.previewCss
        : (parseQuickPanelColor(backgroundColor) ??
          parseQuickPanelColor(io.rendered?.background));
  return (
    <SessionActionsPopover
      testid={testid}
      editsAreUndoSteps={editsAreUndoSteps}
      title={uiMessage("inspector.quickPanelBindings.backgroundColor")}
      paint={previewPaint}
      swatches={[
        {
          name: "none",
          get label() { return uiMessage("inspector.quickPanelBindings.noFill"); },
          color: "transparent",
          empty: true,
        },
        ...swatches,
      ]}
      value={
        (backgroundEditor.mode !== "color" && backgroundEditor.mode !== "none") ||
        backgroundColor === undefined
          ? null
          : backgroundColor === "transparent"
            ? "none"
            : matchingDesignSwatchName(swatches, backgroundColor, defined)
      }
      onSwatch={(swatchName?: Dynamic): Dynamic => {
        let swatchValue: Dynamic =
          swatchName === "none"
            ? "transparent"
            : valueForDesignSwatch(swatches, swatchName, defined);
        swatchValue !== undefined &&
          io.set(editListToStylePairs(backgroundEditor.solidEdits(swatchValue)));
      }}
      custom={{
        seed:
          parseQuickPanelColor(backgroundEditor.solid) ??
          parseQuickPanelColor(backgroundColor) ??
          parseQuickPanelColor(io.rendered?.background) ??
          "#FFFFFF",
        unset: !backgroundEditor.solid,
        onChange: (pickedColor?: Dynamic): Dynamic =>
          io.set(editListToStylePairs(backgroundEditor.solidEdits(pickedColor)), true),
        onPickEnd: (): Dynamic => io.settle(),
      }}
      {...(faces
        ? {
            kind: backgroundEditor.kind,
            face: backgroundEditor.face,
          }
        : {})}
      onOpenChange={(isOpenNext?: Dynamic): Dynamic => {
        setIsOpen(isOpenNext);
        isOpenNext || backgroundEditor.endSession();
      }}
    />
  );
}
function CornerRadiusQuickPanel({ io: io }: Dynamic): Dynamic {
  useUiLocale();
  let cornerRadii: Dynamic = {
      tl: parseOptionalPixelValue(io.get(radiusCssProperties.tl)),
      tr: parseOptionalPixelValue(io.get(radiusCssProperties.tr)),
      br: parseOptionalPixelValue(io.get(radiusCssProperties.br)),
      bl: parseOptionalPixelValue(io.get(radiusCssProperties.bl)),
    },
    setCorners: Dynamic = (changedCorners?: Dynamic, isLive?: Dynamic): Dynamic =>
      io.set(
        Object.keys(changedCorners).map(
          (corner?: Dynamic): Dynamic => [
            radiusCssProperties[corner],
            serializeOptionalPixelValue(changedCorners[corner]),
          ],
        ),
        isLive,
      );
  return (
    <SessionPopup
      testid={"mega-qp-corner"}
      title={uiMessage("inspector.quickPanelBindings.cornerRadius")}
      icon={cornerRadiusIcon}
    >
      <RadiusQuickPanel
        radius={parseOptionalPixelValue(io.get("border-radius"))}
        max={400}
        onChange={(radius?: Dynamic): Dynamic =>
          io.set([
            ["border-radius", serializeOptionalPixelValue(radius)],
            ...Object.values(radiusCssProperties).map(
              (cornerProperty?: Dynamic): Dynamic => [cornerProperty, undefined],
            ),
          ])
        }
        onLive={(radius?: Dynamic): Dynamic =>
          io.set(
            [
              ["border-radius", serializeOptionalPixelValue(radius)],
              ...Object.values(radiusCssProperties).map(
                (cornerProperty?: Dynamic): Dynamic => [cornerProperty, undefined],
              ),
            ],
            true,
          )
        }
        onLiveEnd={io.settle}
        corners={{
          value: cornerRadii,
          onChange: (changedCorners?: Dynamic): Dynamic => setCorners(changedCorners),
          onLive: (changedCorners?: Dynamic): Dynamic => setCorners(changedCorners, true),
          onLiveEnd: io.settle,
        }}
      />
    </SessionPopup>
  );
}
function CssBorderQuickPanel({
  io: io,
  swatches: swatches,
  defined: defined,
  compact: compact,
  faces: faces,
  editsAreUndoSteps: editsAreUndoSteps,
}: Dynamic): Dynamic {
  useUiLocale();
  let borderStyleValue: Dynamic = io.get("border-style"),
    borderStyle: Dynamic =
      borderStyleValue === "double"
        ? "solid"
        : /^(none|solid|dashed|dotted)$/.test(borderStyleValue ?? "")
          ? borderStyleValue
          : undefined,
    hasBorderStyle: Dynamic = borderStyle !== undefined && borderStyle !== "none",
    sideWidths: Dynamic = readBorderSideWidths(io),
    hasSideWidth: Dynamic = (side?: Dynamic): Dynamic =>
      (sideWidths[side] ?? 0) > 0,
    hasPartialSides: Dynamic = activeBorderSides(sideWidths) !== undefined,
    defaultBorderColor: Dynamic = "#141413",
    borderColor: Dynamic = parseQuickPanelColor(io.get("border-color")),
    borderSwatchName: Dynamic = matchingDesignSwatchName(
      swatches,
      io.get("border-color"),
      defined,
    ),
    borderPaint: Dynamic =
      borderColor ??
      (borderSwatchName !== null
        ? parseQuickPanelColor(
            swatches.find((swatch?: Dynamic): Dynamic => swatch.name === borderSwatchName)
              ?.color,
          )
        : undefined),
    keepBorderColor: Dynamic = (shouldKeep?: Dynamic): Dynamic =>
      shouldKeep && borderColor !== undefined ? [["border-color", borderColor]] : [],
    sideWidthChanges: Dynamic = (changedWidths?: Dynamic): Dynamic => [
      ...cssBoxSides.map(
        (side?: Dynamic): Dynamic => [
          "border-" + side + "-width",
          serializeOptionalPixelValue(
            side in changedWidths ? (changedWidths[side] ?? 0) : (sideWidths[side] ?? 0),
          ),
        ],
      ),
      ...(hasBorderStyle ? [["border-style", borderStyle]] : []),
      ...keepBorderColor(
        cssBoxSides.some(
          (side?: Dynamic): Dynamic =>
            (changedWidths[side] ?? 0) > 0 && !hasSideWidth(side),
        ),
      ),
    ],
    paddingSides: Dynamic = {
      top: parseOptionalPixelValue(io.get("padding-top")),
      right: parseOptionalPixelValue(io.get("padding-right")),
      bottom: parseOptionalPixelValue(io.get("padding-bottom")),
      left: parseOptionalPixelValue(io.get("padding-left")),
    },
    marginSides: Dynamic = {
      top: parseOptionalPixelValue(io.get("margin-top")),
      right: parseOptionalPixelValue(io.get("margin-right")),
      bottom: parseOptionalPixelValue(io.get("margin-bottom")),
      left: parseOptionalPixelValue(io.get("margin-left")),
    };
  return (
    <jsx_il.Fragment>
      <SessionStripGroup wrap={true}>
        <BackgroundQuickPanel
          io={io}
          swatches={swatches}
          defined={defined}
          faces={faces}
          editsAreUndoSteps={editsAreUndoSteps}
        />
        <SessionPopup
          testid={"mega-qp-border"}
          title={uiMessage("inspector.quickPanelBindings.border")}
          icon={borderWeightIcon}
          editsAreUndoSteps={editsAreUndoSteps}
        >
          <BorderQuickPanel
            style={borderStyle}
            width={uniformNonzeroBorderWidth(sideWidths)}
            sides={activeBorderSides(sideWidths)}
            color={
              <PropertyColorRow
                testid={"mega-qp-border-color"}
                editsAreUndoSteps={editsAreUndoSteps}
                label={uiMessage("inspector.quickPanelBindings.borderColor")}
                title={uiMessage("inspector.quickPanelBindings.borderColor")}
                value={borderPaint}
                swatches={swatches}
                fold={true}
                current={borderSwatchName}
                onSwatch={(swatchName?: Dynamic): Dynamic => {
                  let swatchValue: Dynamic = valueForDesignSwatch(
                    swatches,
                    swatchName,
                    defined,
                  );
                  swatchValue !== undefined && io.set([["border-color", swatchValue]]);
                }}
                disabled={!hasBorderStyle}
                disabledReason={uiMessage("inspector.quickPanelBindings.pickABorderStyleFirst")}
                onChange={(pickedColor?: Dynamic): Dynamic => {
                  pickedColor !== undefined && io.set([["border-color", pickedColor]]);
                }}
                onLive={(pickedColor?: Dynamic): Dynamic =>
                  io.set([["border-color", pickedColor]], true)
                }
                onLiveEnd={io.settle}
                keepFocus={true}
                popover={quickPanelPopoverOptions}
              />
            }
            onChange={(borderChange?: Dynamic): Dynamic => {
              if ("style" in borderChange) {
                borderChange.style === undefined || borderChange.style === "none"
                  ? io.set([["border-style", "none"]])
                  : io.set([
                      ["border-style", borderChange.style],
                      ...(cssBoxSides.every(
                        (side?: Dynamic): Dynamic => !hasSideWidth(side),
                      )
                        ? [["border-width", "1px"]]
                        : hasPartialSides
                          ? cssBoxSides
                              .filter(
                                (side?: Dynamic): Dynamic =>
                                  !hasSideWidth(side),
                              )
                              .map(
                                (side?: Dynamic): Dynamic => [
                                  "border-" + side + "-width",
                                  "0px",
                                ],
                              )
                          : []),
                      ...(io.get("border-color") === undefined
                        ? [["border-color", defaultBorderColor]]
                        : []),
                    ]);
                return;
              }
              "width" in borderChange &&
                io.set([
                  [
                    "border-width",
                    serializeOptionalPixelValue(borderChange.width ?? 0),
                  ],
                  ...cssBoxSides.map(
                    (side?: Dynamic): Dynamic => [
                      "border-" + side + "-width",
                      undefined,
                    ],
                  ),
                  ...keepBorderColor(hasPartialSides && (borderChange.width ?? 0) > 0),
                ]);
              "sides" in borderChange &&
                borderChange.sides === undefined &&
                io.set([
                  [
                    "border-width",
                    serializeOptionalPixelValue(
                      Math.max(
                        1,
                        ...cssBoxSides.map(
                          (side?: Dynamic): Dynamic => sideWidths[side] ?? 0,
                        ),
                      ),
                    ),
                  ],
                  ...(hasBorderStyle ? [["border-style", borderStyle]] : []),
                  ...cssBoxSides.map(
                    (side?: Dynamic): Dynamic => [
                      "border-" + side + "-width",
                      undefined,
                    ],
                  ),
                  ...keepBorderColor(hasPartialSides),
                ]);
            }}
            onLive={(borderChange?: Dynamic): Dynamic =>
              borderChange.width !== undefined &&
              io.set(
                [
                  ["border-width", serializeOptionalPixelValue(borderChange.width)],
                  ...cssBoxSides.map(
                    (side?: Dynamic): Dynamic => [
                      "border-" + side + "-width",
                      undefined,
                    ],
                  ),
                  ...keepBorderColor(hasPartialSides && borderChange.width > 0),
                ],
                true,
              )
            }
            onLiveEnd={io.settle}
            widths={{
              value: sideWidths,
              onChange: (changedWidths?: Dynamic): Dynamic =>
                io.set(sideWidthChanges(changedWidths)),
              onLive: (changedWidths?: Dynamic): Dynamic =>
                io.set(sideWidthChanges(changedWidths), true),
              onLiveEnd: io.settle,
            }}
            supports={{
              styles: ["none", "solid", "dashed", "dotted"],
              sides: true,
              widthMax: 32,
            }}
          />
        </SessionPopup>
      </SessionStripGroup>
      {compact ? (null) : (<SessionStripDivider />)}
      <SessionStripGroup wrap={true}>
        <CornerRadiusQuickPanel io={io} />
        <SessionPopup
          testid={"mega-qp-spacing"}
          title={uiMessage("inspector.quickPanelBindings.spacing")}
          icon={spacingIcon}
        >
          <SpacingQuickPanel
            padding={paddingSides}
            max={400}
            onChange={(changedSides?: Dynamic): Dynamic =>
              io.set(sideStyleChanges("padding", changedSides))
            }
            onLive={(changedSides?: Dynamic): Dynamic =>
              io.set(sideStyleChanges("padding", changedSides), true)
            }
            onLiveEnd={io.settle}
            margin={{
              value: marginSides,
              max: 400,
              onChange: (changedSides?: Dynamic): Dynamic =>
                io.set(sideStyleChanges("margin", changedSides)),
              onLive: (changedSides?: Dynamic): Dynamic =>
                io.set(sideStyleChanges("margin", changedSides), true),
              onLiveEnd: io.settle,
            }}
          />
        </SessionPopup>
      </SessionStripGroup>
      {compact ? (null) : (<SessionStripDivider />)}
    </jsx_il.Fragment>
  );
}
function SvgPaintQuickPanel({
  io: io,
  swatches: swatches,
  defined: defined,
}: Dynamic): Dynamic {
  useUiLocale();
  let fillValue: Dynamic = io.get("fill") ?? io.get("background-color"),
    strokeValue: Dynamic = io.get("stroke"),
    dashArray: Dynamic = io.get("stroke-dasharray"),
    strokeWidth: Dynamic = parseOptionalPixelValue(io.get("stroke-width")),
    strokeStyle: Dynamic =
      strokeValue === undefined || strokeValue === "none"
        ? undefined
        : dashArray === undefined || dashArray === "none"
          ? "solid"
          : /^[0-2](px)?[ ,]/.test(dashArray)
            ? "dotted"
            : "dashed";
  return (
    <SessionStripGroup wrap={true}>
      <SessionActionsPopover
        testid={"mega-qp-fill"}
        title={uiMessage("inspector.quickPanelBindings.fillColor")}
        paint={
          parseQuickPanelColor(fillValue) ??
          parseQuickPanelColor(io.rendered?.background)
        }
        swatches={[
          {
            name: "none",
            get label() { return uiMessage("inspector.quickPanelBindings.noFill"); },
            color: "transparent",
            empty: true,
          },
          ...swatches,
        ]}
        value={
          fillValue === undefined
            ? null
            : fillValue === "none"
              ? "none"
              : matchingDesignSwatchName(swatches, fillValue, defined)
        }
        onSwatch={(swatchName?: Dynamic): Dynamic => {
          let fillSwatchValue: Dynamic =
            swatchName === "none"
              ? "none"
              : valueForDesignSwatch(swatches, swatchName, defined);
          fillSwatchValue !== undefined && io.set([["fill", fillSwatchValue]]);
        }}
        custom={{
          seed:
            parseQuickPanelColor(fillValue) ??
            parseQuickPanelColor(io.rendered?.background) ??
            "#d97757",
          unset: fillValue === undefined,
          onChange: (pickedColor?: Dynamic): Dynamic =>
            io.set([["fill", pickedColor]], true),
          onPickEnd: (): Dynamic => io.settle(),
        }}
      />
      <SessionPopup
        testid={"mega-qp-stroke"}
        title={uiMessage("inspector.quickPanelBindings.stroke")}
        icon={borderWeightIcon}
      >
        <BorderQuickPanel
          style={strokeStyle}
          width={strokeWidth}
          sides={undefined}
          color={
            <PropertyColorRow
              testid={"mega-qp-stroke-color"}
              label={uiMessage("inspector.quickPanelBindings.strokeColor")}
              title={uiMessage("inspector.quickPanelBindings.strokeColor")}
              value={
                strokeValue === "none"
                  ? undefined
                  : (parseQuickPanelColor(strokeValue) ??
                    parseQuickPanelColor(
                      swatches.find(
                        (swatch?: Dynamic): Dynamic =>
                          swatch.name ===
                          matchingDesignSwatchName(swatches, strokeValue, defined),
                      )?.color,
                    ) ??
                    parseQuickPanelColor(io.rendered?.stroke))
              }
              swatches={swatches}
              fold={true}
              current={
                strokeValue === "none"
                  ? null
                  : matchingDesignSwatchName(
                      swatches,
                      strokeValue ?? io.rendered?.stroke ?? undefined,
                      defined,
                    )
              }
              onSwatch={(swatchName?: Dynamic): Dynamic => {
                let swatchValue: Dynamic = valueForDesignSwatch(
                  swatches,
                  swatchName,
                  defined,
                );
                swatchValue !== undefined && io.set([["stroke", swatchValue]]);
              }}
              disabled={strokeStyle === undefined}
              disabledReason={uiMessage("inspector.quickPanelBindings.pickAStrokeStyleFirst")}
              onChange={(pickedColor?: Dynamic): Dynamic => {
                pickedColor !== undefined && io.set([["stroke", pickedColor]]);
              }}
              onLive={(pickedColor?: Dynamic): Dynamic =>
                io.set([["stroke", pickedColor]], true)
              }
              onLiveEnd={io.settle}
              keepFocus={true}
              popover={quickPanelPopoverOptions}
            />
          }
          onChange={(strokeChange?: Dynamic): Dynamic => {
            "style" in strokeChange &&
              (strokeChange.style === undefined || strokeChange.style === "none"
                ? io.set([["stroke", "none"]])
                : io.set([
                    [
                      "stroke",
                      strokeValue === undefined || strokeValue === "none"
                        ? "#141413"
                        : strokeValue,
                    ],
                    [
                      "stroke-dasharray",
                      strokeChange.style === "solid"
                        ? undefined
                        : strokeChange.style === "dashed"
                          ? "6 4"
                          : "1 3",
                    ],
                    ...(strokeWidth === undefined
                      ? [["stroke-width", "2px"]]
                      : []),
                  ]));
            "width" in strokeChange &&
              io.set([
                ["stroke-width", serializeOptionalPixelValue(strokeChange.width)],
              ]);
          }}
          onLive={(strokeChange?: Dynamic): Dynamic =>
            strokeChange.width !== undefined &&
            io.set(
              [["stroke-width", serializeOptionalPixelValue(strokeChange.width)]],
              true,
            )
          }
          onLiveEnd={io.settle}
          supports={{
            styles: ["none", "solid", "dashed", "dotted"],
            sides: "An SVG stroke outlines the whole shape",
            widthMax: 32,
          }}
        />
      </SessionPopup>
    </SessionStripGroup>
  );
}
function ImageQuickPanel({
  io: io,
  src: src,
  onReplace: onReplace,
  replaceReason: replaceReason,
  replaceTitle = uiMessage("inspector.quickPanelBindings.replaceImage"),
  ownAsset = false,
  onCrop: onCrop,
  cropping: cropping,
  cropReason: cropReason,
  noun = "image",
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <SessionStripGroup wrap={true}>
      <SessionImageReplaceButton
        src={ownAsset ? src : inlineImageUrl(src)}
        title={replaceReason ?? (replaceTitle)}
        onClick={onReplace}
        disabled={replaceReason !== undefined}
      />
      {onCrop && (<SessionStripButton
          data-testid={"mega-qp-crop"}
          data-media-crop-keep={""}
          icon={<PropertyOptionIcon icon={CropValue} />}
          title={
            cropReason ?? (cropping ? (uiMessage("inspector.quickPanelBindings.doneCroppingOrPressEnter")) : (uiMessage("inspector.quickPanelBindings.cropOrDoubleClickThe", { value1: String(noun) })))
          }
          aria-label={uiMessage("inspector.quickPanelBindings.crop")}
          aria-pressed={cropping === true}
          onClick={onCrop}
          disabled={cropReason !== undefined}
        />)}
      <CornerRadiusQuickPanel io={io} />
    </SessionStripGroup>
  );
}
function LineStrokeQuickPanel({
  io: io,
  swatches: swatches,
  defined: defined,
}: Dynamic): Dynamic {
  useUiLocale();
  let strokeValue: Dynamic = io.get("stroke") ?? io.get("border-color");
  return (
    <SessionStripGroup>
      <SessionActionsPopover
        testid={"mega-qp-stroke-line"}
        title={uiMessage("inspector.quickPanelBindings.strokeColor")}
        paint={
          parseQuickPanelColor(strokeValue) ??
          parseQuickPanelColor(io.rendered?.stroke) ??
          "#141413"
        }
        swatches={swatches}
        value={matchingDesignSwatchName(swatches, strokeValue, defined)}
        onSwatch={(swatchName?: Dynamic): Dynamic => {
          let swatchValue: Dynamic = valueForDesignSwatch(
            swatches,
            swatchName,
            defined,
          );
          swatchValue !== undefined &&
            io.set([
              ["stroke", swatchValue],
              ["border-color", swatchValue],
            ]);
        }}
        custom={{
          seed:
            parseQuickPanelColor(strokeValue) ??
            parseQuickPanelColor(io.rendered?.stroke) ??
            "#141413",
          onChange: (pickedColor?: Dynamic): Dynamic =>
            io.set(
              [
                ["stroke", pickedColor],
                ["border-color", pickedColor],
              ],
              true,
            ),
          onPickEnd: (): Dynamic => io.settle(),
        }}
      />
    </SessionStripGroup>
  );
}
export {
  activeBorderSides,
  areStyleEditsSupported,
  BackgroundQuickPanel,
  CornerRadiusQuickPanel,
  CssBorderQuickPanel,
  cssBoxSides,
  designSwatchCssVariable,
  editListToStylePairs,
  emptyQuickPanelStyleEdits,
  ImageQuickPanel,
  inlineImageUrl,
  jsx_il,
  LineStrokeQuickPanel,
  matchingDesignSwatchName,
  parseOptionalPixelValue,
  parseQuickPanelColor,
  quickPanelStyleIo,
  radiusCssProperties,
  react_mEt,
  readBorderSideWidths,
  serializeOptionalPixelValue,
  sideStyleChanges,
  SvgPaintQuickPanel,
  uniformNonzeroBorderWidth,
  unsupportedQuickPanelValueMessage,
  valueForDesignSwatch,
};
export function installPropertiesQuickPanelBindings(): () => void {
  return () => {
    react_mEt = toModuleNamespace(load_react(), 1);
    jsx_il = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    cssBoxSides = ["top", "right", "bottom", "left"];
    parseQuickPanelColor = (cssValue?: Dynamic): Dynamic =>
      cssValue == null
        ? undefined
        : (normalizeHexColor(cssValue) ?? undefined);
    inlineImageUrl = (src?: Dynamic): Dynamic =>
      src !== undefined && /^(data:image\/|blob:)/i.test(src)
        ? src
        : undefined;
    radiusCssProperties = {
      tl: "border-top-left-radius",
      tr: "border-top-right-radius",
      br: "border-bottom-right-radius",
      bl: "border-bottom-left-radius",
    };
    parseOptionalPixelValue = (cssValue?: Dynamic): Dynamic => {
      if (cssValue === undefined) return;
      let pixelMatch: Dynamic = /^\s*(-?\d+(?:\.\d+)?)(?:px)?\s*$/.exec(cssValue);
      return pixelMatch ? parseFloat(pixelMatch[1]) : undefined;
    };
    serializeOptionalPixelValue = (pixels?: Dynamic): Dynamic =>
      pixels === undefined
        ? undefined
        : String(Math.round(pixels * 10) / 10) + "px";
    designSwatchCssVariable = (swatchName?: Dynamic): Dynamic => {
      let variableSuffix: Dynamic = /^ds:\d+:(.+)$/.exec(swatchName)?.[1];
      return variableSuffix === undefined ? undefined : "--" + variableSuffix;
    };
    editListToStylePairs = (edits?: Dynamic): Dynamic =>
      edits.map(
        (edit?: Dynamic): Dynamic => [edit.prop, edit.value ?? undefined],
      );
    unsupportedQuickPanelValueMessage =
      uiMessage("inspector.quickPanelBindings.thatValueCanTBe");
    areStyleEditsSupported = (edits?: Dynamic): Dynamic =>
      normalizeStyleEdits(
        edits.map((edit?: Dynamic): Dynamic => [edit.prop, edit.value]),
      ).length === edits.length;
    quickPanelStyleIo = (io?: Dynamic): Dynamic => ({
      commit: (edits?: Dynamic): Dynamic => {
        areStyleEditsSupported(edits)
          ? io.set(editListToStylePairs(edits))
          : showEditorToast(unsupportedQuickPanelValueMessage);
      },
      live: (edits?: Dynamic): Dynamic => {
        areStyleEditsSupported(edits) &&
          io.set(editListToStylePairs(edits), true);
      },
      settle: (): Dynamic => io.settle(),
    });
    emptyQuickPanelStyleEdits = [];
  };
}

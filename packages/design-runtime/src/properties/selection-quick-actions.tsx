import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { designSystemTypographyOptions, hasDesignSystems, useDesignSystems } from "../design-system/store";
import { colorTokenGroupLabels } from "../design-system/type-declarations";
import { textContrastContext } from "../editor/accessibility/announcements";
import { initializeEditorAttributeValidation, sanitizeEditableLink } from "../editor/attribute-validation";
import { ColorContrastCopyInTheseArtboardsLabel as inTheseArtboardsLabel, InThisArtboardMessage } from "../editor/color/contrast-copy";
import { parseHsvaColor } from "../editor/color/picker-primitives";
import { InspectorComputedDataPattern } from "../editor/inspector/computed-data";
import { hasTextBackgroundClip, InspectorPropertySchemaItems } from "../editor/inspector/property-schema";
import { isTransparentColor } from "../editor/inspector/style-metadata";
import { keyboardShortcutLabel } from "../editor/keyboard/shortcuts";
import { VideoPlayControl } from "../editor/media/playback-controls";
import { useBackgroundEditor } from "../editor/properties/background-editor";
import { mergeDesignSystemSwatches } from "../editor/properties/color-swatches";
import { fontFamilyPickerOptions, normalizedFontFamilyOption } from "../editor/properties/font-family-row";
import { SessionActionsPopover, SessionTypographyPopup } from "../editor/session-strip/popups";
import { SessionStripButton, SessionStripDivider, SessionStripGroup } from "../editor/session-strip/session-strip";
import { TextSessionStrip } from "../editor/session-strip/text";
import { listKindToTag } from "../editor/text/list-state";
import { normalizeHexColor } from "../editor/typography/census";
import { ensureWebFonts, TypographyFontCatalogMapValue } from "../editor/typography/font-catalog";
import { displayFontFamily } from "../editor/typography/font-family";
import { getAvailableFontVariants, resolveFontVariants } from "../editor/typography/font-variants";
import { resolvedTypographyMetrics } from "../editor/typography/metrics";
import { typographyCensusOptions, typographySessionModel } from "../editor/typography/session-model";
import { toModuleNamespace } from "../module-helpers";
import { sanitizeCssBackground } from "../platform/css-sanitization";
import { CssBorderQuickPanel, ImageQuickPanel, LineStrokeQuickPanel, matchingDesignSwatchName, quickPanelStyleIo, SvgPaintQuickPanel, valueForDesignSwatch } from "./quick-panel-bindings";

var react_Gw: Dynamic;
var jsx_Ki: Dynamic;
var emptySelectionPropertyItems: Dynamic;
var defaultQuickActionInk: Dynamic;
var literalQuickActionColorPattern: Dynamic;
var textAlignmentValues: Dynamic;
var parseQuickActionNumber: Dynamic;
function propertySidebarActionState(
  sidebarVisible?: Dynamic,
  crossFile?: Dynamic,
): "hidden" | "disabled-with-reason" | "enabled" {
  return sidebarVisible
    ? "hidden"
    : crossFile
      ? "disabled-with-reason"
      : "enabled";
}
function hasSelectionQuickActions(selection?: Dynamic): Dynamic {
  return selection.textEdit?.formats ||
    selection.crossFile ||
    selection.text > 0 ||
    selection.shape > 0 ||
    selection.line > 0 ||
    (selection.box ?? 0) > 0 ||
    (selection.image ?? 0) > 0 ||
    (selection.other ?? 0) > 0 ||
    selection.editDoor ||
    selection.commentDoor
    ? true
    : propertySidebarActionState(
        selection.sidebarVisible,
        selection.crossFile,
      ) !== "hidden";
}
function quickActionPaintAndSeed(
  explicitColor?: Dynamic,
  inheritedColor?: Dynamic,
  seed?: Dynamic,
): Dynamic {
  let trimmedColor: Dynamic = explicitColor?.trim() ?? null,
    literalColor: Dynamic =
      trimmedColor != null && literalQuickActionColorPattern.test(trimmedColor)
        ? trimmedColor
        : null,
    effectiveColor: Dynamic = literalColor ?? inheritedColor;
  return effectiveColor == null
    ? {
        paint: undefined,
        seed: seed,
      }
    : parseHsvaColor(effectiveColor).a === 0
      ? {
          paint: undefined,
          seed: literalColor ?? seed,
        }
      : {
          paint: effectiveColor,
          seed: effectiveColor,
        };
}
function buildQuickActionSwatches(
  colors?: Dynamic,
  artboardColors?: Dynamic,
  isCrossFile?: Dynamic,
  themes?: Dynamic,
): Dynamic {
  if (!hasDesignSystems(themes))
    return (colors ?? []).map(
      (colorValue?: Dynamic): Dynamic => ({
        name: colorValue,
        color: colorValue,
        label: colorValue.startsWith("#") ? colorValue.toUpperCase() : colorValue,
      }),
    );
  let designSystemSwatches: Dynamic = themes.flatMap(
      (designSystem?: Dynamic, systemIndex?: Dynamic): Dynamic =>
        designSystem.colors.map(
          (colorToken?: Dynamic): Dynamic => ({
            name: "ds:" + String(systemIndex) + ":" + colorToken.name,
            color: colorToken.value,
            label: colorToken.name,
            ...colorTokenGroupLabels(designSystem, colorToken),
          }),
        ),
    ),
    artboardSwatches: Dynamic = artboardColors ?? [];
  return mergeDesignSystemSwatches(
    artboardSwatches.length > 0
      ? {
          label: isCrossFile
            ? inTheseArtboardsLabel
            : InThisArtboardMessage,
          colors: artboardSwatches,
        }
      : undefined,
    designSystemSwatches,
  );
}
function selectionHasVisiblePaint(style?: Dynamic): Dynamic {
  let hasBackground: Dynamic =
      style.textClip !== true &&
      style.bg !== undefined &&
      normalizeHexColor(style.bg) !== null,
    isBorderWidthZero: Dynamic =
      style.borderWidth !== undefined &&
      style.borderWidth
        .trim()
        .split(/\s+/)
        .every(
          (widthPart?: Dynamic): Dynamic => /^0+(?:\.0+)?[a-z%]*$/i.test(widthPart),
        ),
    hasBorder: Dynamic =
      style.borderStyle !== undefined &&
      style.borderStyle !== "none" &&
      !isBorderWidthZero,
    hasRenderedBackground: Dynamic =
      style.textClip !== true &&
      style.renderedBg != null &&
      normalizeHexColor(style.renderedBg) !== null;
  return hasBackground || hasBorder || hasRenderedBackground;
}
function toggleUnderlineDecoration(decoration: string): string {
  let otherLines: Dynamic = decoration
      .split(/\s+/)
      .filter(
        (decorationLine?: Dynamic): Dynamic =>
          decorationLine === "line-through" || decorationLine === "overline",
      ),
    nextLines: Dynamic = decoration.includes("underline")
      ? otherLines
      : ["underline", ...otherLines];
  return nextLines.length > 0 ? nextLines.join(" ") : "none";
}
function SelectionQuickActions({
  text: text,
  shape: shape,
  box = 0,
  image = 0,
  other = 0,
  line: line,
  primaryTag = "",
  part: part,
  seed: seed,
  crossFile: crossFile,
  sidebarVisible: sidebarVisible,
  onOpenProps: onOpenProps,
  onEditText: onEditText,
  onApply: onApply,
  contrastRef: contrastRef,
  onGesture: onGesture,
  textEdit: textEdit,
  onFormat: onFormat,
  onComment: onComment,
  onReplaceImage: onReplaceImage,
  onCrop: onCrop,
  cropping: cropping,
  cropReason: cropReason,
  onReplaceVideo: onReplaceVideo,
  findVideo: findVideo,
  onElementLink: onElementLink,
  coarse = false,
  compact = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let [pendingStyles, setPendingStyles]: Dynamic = (0, react_Gw.useState)({}),
    [seedEpoch, setSeedEpoch]: Dynamic = (0, react_Gw.useState)(seed?.epoch);
  seedEpoch !== seed?.epoch &&
    (setSeedEpoch(seed?.epoch), Object.keys(pendingStyles).length > 0 && setPendingStyles({}));
  let isGestureActiveRef: Dynamic = (0, react_Gw.useRef)(false),
    hasVisiblePaintRef: Dynamic = (0, react_Gw.useRef)(false),
    [pendingFormat, setPendingFormat]: Dynamic = (0, react_Gw.useState)(null),
    isEditingText: Dynamic = textEdit?.formats != null;
  (0, react_Gw.useEffect)((): Dynamic => {
    if (pendingFormat === null) return;
    if (isEditingText) {
      onFormat(pendingFormat.verb);
      setPendingFormat(null);
      return;
    }
    let remainingMs: Dynamic = 1500 - (Date.now() - pendingFormat.at);
    if (remainingMs <= 0) return setPendingFormat(null);
    let timeoutId: Dynamic = (window as Dynamic).setTimeout(
      (): Dynamic => setPendingFormat(null),
      remainingMs,
    );
    return (): Dynamic => (window as Dynamic).clearTimeout(timeoutId);
  }, [pendingFormat, isEditingText, onFormat]);
  let requestTextFormat: Dynamic = (formatVerb?: Dynamic): Dynamic => {
      onEditText &&
        (setPendingFormat({
          verb: formatVerb,
          at: Date.now(),
        }),
        onEditText());
    },
    styleIo: Dynamic = {
      get: (prop?: Dynamic): Dynamic =>
        prop in pendingStyles
          ? pendingStyles[prop]
          : (seed?.more?.[prop] ??
            (prop === "background-color"
              ? seed?.background
              : prop === "stroke"
                ? seed?.stroke
                : prop === "color"
                  ? seed?.color
                  : undefined) ??
            (prop === "fill" ? undefined : seed?.rendered?.box?.[prop]) ??
            undefined),
      set: (styleEntries?: Dynamic, isLive?: Dynamic): Dynamic => {
        setPendingStyles(
          (previous?: Dynamic): Dynamic => ({
            ...previous,
            ...Object.fromEntries(styleEntries),
          }),
        );
        isLive &&
          !isGestureActiveRef.current &&
          ((isGestureActiveRef.current = true), onGesture("start"));
        let edits: Dynamic = styleEntries.map(
          ([prop, cssValue]: Dynamic): Dynamic => [prop, cssValue ?? null],
        );
        edits.length > 0 &&
          onApply(edits, {
            live: isLive,
          }).then((isApplied?: Dynamic): Dynamic => {
            !isApplied &&
              !isLive &&
              setPendingStyles((previous?: Dynamic): Dynamic => {
                let remaining: Dynamic = {
                  ...previous,
                };
                for (let [editedProp] of edits as Dynamic)
                  delete remaining[editedProp];
                return remaining;
              });
          });
      },
      settle: (): Dynamic => {
        isGestureActiveRef.current && ((isGestureActiveRef.current = false), onGesture("end"));
      },
      rendered: {
        background: seed?.rendered?.background ?? null,
        stroke: seed?.rendered?.stroke ?? null,
      },
    },
    designSystems: Dynamic = useDesignSystems();
  contrastRef && (contrastRef.current = undefined);
  let colorSwatches: Dynamic = (0, react_Gw.useMemo)(
      (): Dynamic =>
        buildQuickActionSwatches(
          seed?.colors,
          seed?.artboardColors,
          crossFile !== null,
          designSystems,
        ),
      [seed?.colors, seed?.artboardColors, crossFile !== null, designSystems],
    ),
    definedVariables: Dynamic = crossFile ? undefined : seed?.definedVars,
    hasInlineTextClip: Dynamic = hasTextBackgroundClip(
      (prop?: Dynamic): Dynamic => styleIo.get(prop),
    ),
    isTextClipped: Dynamic = hasInlineTextClip || seed?.rendered?.textClip === true,
    renderedColor: Dynamic = seed?.rendered?.color ?? null,
    [isTextFillOpen, setIsTextFillOpen]: Dynamic = (0, react_Gw.useState)(false),
    textFillEditor: Dynamic = useBackgroundEditor({
      value: styleIo.get("color") ?? null,
      fallback: renderedColor ?? undefined,
      textFill: {
        clipped: isTextClipped,
        inlineClip: hasInlineTextClip,
        layer:
          styleIo.get("background-image") ?? styleIo.get("background") ?? null,
        size: styleIo.get("background-size") ?? null,
        ...(isTransparentColor(
          (styleIo.get("color") ?? "").trim().toLowerCase(),
        )
          ? {
              transparentInk: "inline",
            }
          : renderedColor !== null && parseHsvaColor(renderedColor).a === 0
            ? {
                transparentInk: "computed",
              }
            : {}),
      },
      writer: quickPanelStyleIo(styleIo),
      open: isTextFillOpen,
      tokens: emptySelectionPropertyItems,
    }),
    isInheritedTextClip: Dynamic =
      isTextClipped &&
      !hasInlineTextClip &&
      styleIo.get("background-image") === undefined &&
      styleIo.get("background") === undefined,
    inheritedClipReason: Dynamic =
      uiMessage("inspector.selectionQuickActions.thisTextSFillComes"),
    textFillPopoverProps: Dynamic = {
      kind: isInheritedTextClip
        ? {
            ...textFillEditor.kind,
            options: textFillEditor.kind.options.map(
              (kindOption?: Dynamic): Dynamic =>
                kindOption.value === "color"
                  ? kindOption
                  : {
                      ...kindOption,
                      disabledReason: inheritedClipReason,
                    },
            ),
          }
        : textFillEditor.kind,
      face: textFillEditor.face,
      onOpenChange: (isOpenNext?: Dynamic): Dynamic => {
        setIsTextFillOpen(isOpenNext);
        isOpenNext || textFillEditor.endSession();
      },
    },
    sidebarActionState: Dynamic = propertySidebarActionState(
      sidebarVisible,
      !!crossFile,
    ),
    openComment: Dynamic = onComment
      ? (anchor?: Dynamic): Dynamic => onComment(anchor)
      : null,
    trailingGroup: Dynamic =
      openComment === null && sidebarActionState === "hidden" ? null : (
        <SessionStripGroup>
          {openComment !== null && (<SessionStripButton
              icon={"ChatAdd"}
              data-testid={"mega-sel-comment"}
              title={uiMessage("inspector.selectionQuickActions.commentOnThisElement")}
              aria-label={uiMessage("inspector.selectionQuickActions.comment")}
              onClick={(event?: Dynamic): Dynamic =>
                openComment(event.currentTarget)
              }
            />)}
          {sidebarActionState !== "hidden" && (<SessionStripButton
              icon={"DotsVertical"}
              data-testid={"mega-sel-props"}
              title={
                sidebarActionState === "disabled-with-reason" ? (uiMessage("inspector.selectionQuickActions.propertiesEditsOneArtboardAt")) : (uiMessage("inspector.selectionQuickActions.openThePropertiesPanel"))
              }
              aria-label={uiMessage("inspector.selectionQuickActions.properties")}
              disabled={sidebarActionState === "disabled-with-reason"}
              onClick={(): Dynamic => {
                crossFile || onOpenProps();
              }}
            />)}
        </SessionStripGroup>
      ),
    kindCount: Dynamic = [
      text > 0,
      box > 0,
      shape > 0,
      image > 0,
      line > 0,
      other > 0,
    ].filter(Boolean).length,
    isMultiple: Dynamic = text + box + shape + image + line + other > 1,
    textFormats: Dynamic = textEdit?.formats ?? null,
    editsAreUndoable: Dynamic = textEdit == null,
    crossFileSummary: Dynamic = crossFile
      ? crossFile.elements +
        (crossFile.elements === 1 ? " element" : " elements") +
        (crossFile.artboards === 1
          ? ""
          : " on " + crossFile.artboards + " artboards") +
        (crossFile.objects > 0
          ? " and " +
            crossFile.objects +
            (crossFile.objects === 1 ? " canvas object" : " canvas objects")
          : "")
      : "",
    crossFileActions: Dynamic = crossFile ? (
      <SessionStripGroup>
        <SessionStripButton
          data-testid={"mega-sel-duplicate"}
          icon={"Copy"}
          title={
            uiMessage("inspector.selectionQuickActions.duplicateWithShortcut", { selection: String(crossFileSummary), shortcut: String(keyboardShortcutLabel("D")) })
          }
          aria-label={uiMessage("inspector.selectionQuickActions.duplicate")}
          onClick={crossFile.onDuplicate}
        />
        <SessionStripButton
          data-testid={"mega-sel-delete"}
          icon={"Trash"}
          title={uiMessage("inspector.selectionQuickActions.deleteSelection", { selection: String(crossFileSummary) })}
          aria-label={uiMessage("inspector.selectionQuickActions.delete")}
          onClick={crossFile.onDelete}
        />
      </SessionStripGroup>
    ) : null,
    crossFileDivider: Dynamic =
      crossFileActions !== null && trailingGroup !== null && !compact ? (
        <SessionStripDivider />
      ) : null;
  if (other > 0 && !isMultiple && primaryTag === "video")
    return (
      <jsx_Ki.Fragment>
        {findVideo && (<SessionStripGroup>
            <VideoPlayControl find={findVideo} />
          </SessionStripGroup>)}
        <ImageQuickPanel
          io={styleIo}
          src={undefined}
          onReplace={(): Dynamic => onReplaceVideo?.()}
          replaceTitle={"Replace video"}
          replaceReason={
            onReplaceVideo
              ? undefined
              : "This video can't be replaced from here."
          }
          onCrop={onCrop}
          cropping={cropping}
          cropReason={cropping ? undefined : cropReason}
          noun={"video"}
        />
        {compact || (crossFileActions === null && trailingGroup === null) ? (null) : (<SessionStripDivider />)}
        {crossFileActions}
        {crossFileDivider}
        {trailingGroup}
      </jsx_Ki.Fragment>
    );
  if (!textFormats && (kindCount > 1 || (kindCount === 1 && other > 0))) {
    let textPaint: Dynamic = quickActionPaintAndSeed(
      styleIo.get("color") ?? null,
      seed?.rendered?.color ?? null,
      defaultQuickActionInk,
    );
    return (
      <jsx_Ki.Fragment>
        {text + box + shape + line > 0 && (((): Dynamic => {
            let colorProps: Dynamic = [
                ...(text > 0 ? ["color"] : []),
                ...(box > 0 || shape > 0 ? ["background-color", "fill"] : []),
                ...(line > 0 ? ["stroke", "border-color"] : []),
              ],
              groupPaint: Dynamic =
                text > 0
                  ? textPaint
                  : quickActionPaintAndSeed(
                      styleIo.get("background-color") ??
                        styleIo.get("fill") ??
                        null,
                      seed?.rendered?.background ??
                        seed?.rendered?.stroke ??
                        null,
                      defaultQuickActionInk,
                    );
            return (
              <SessionStripGroup>
                <SessionActionsPopover
                  testid={"mega-qp-color"}
                  title={uiMessage("inspector.selectionQuickActions.color")}
                  paint={groupPaint.paint}
                  swatches={colorSwatches}
                  value={null}
                  onSwatch={(swatchName?: Dynamic): Dynamic => {
                    let swatchValue: Dynamic = valueForDesignSwatch(
                      colorSwatches,
                      swatchName,
                      definedVariables,
                    );
                    swatchValue !== undefined &&
                      styleIo.set(
                        colorProps.map(
                          (prop?: Dynamic): Dynamic => [prop, swatchValue],
                        ),
                      );
                  }}
                  custom={{
                    seed: groupPaint.seed,
                    onChange: (pickedColor?: Dynamic): Dynamic =>
                      styleIo.set(
                        colorProps.map(
                          (prop?: Dynamic): Dynamic => [prop, pickedColor],
                        ),
                        true,
                      ),
                    onPickEnd: (): Dynamic => styleIo.settle(),
                  }}
                />
              </SessionStripGroup>
            );
          })())}
        {crossFileActions !== null && !compact && text + box + shape + line > 0 ? (<SessionStripDivider />) : (null)}
        {crossFileActions}
        {crossFileDivider}
        {trailingGroup}
      </jsx_Ki.Fragment>
    );
  }
  if (textFormats || text > 0) {
    let isRichTextEditing: Dynamic = textFormats !== null,
      parsePixels: Dynamic = (cssValue?: Dynamic): Dynamic => {
        let pixelMatch: Dynamic =
          cssValue == null ? null : /^\s*(-?\d+(?:\.\d+)?)px\s*$/.exec(cssValue);
        return pixelMatch ? parseFloat(pixelMatch[1]) : undefined;
      },
      parseUnitless: Dynamic = (cssValue?: Dynamic): Dynamic => {
        let numberMatch: Dynamic =
          cssValue == null ? null : /^\s*(\d+(?:\.\d+)?)\s*$/.exec(cssValue);
        return numberMatch ? parseFloat(numberMatch[1]) : undefined;
      },
      currentFontSizePx: Dynamic =
        parsePixels(styleIo.get("font-size")) ??
        parsePixels(seed?.fontSize) ??
        parsePixels(seed?.rendered?.fontSizePx),
      fontWeightValue: Dynamic =
        styleIo.get("font-weight") ?? seed?.rendered?.fontWeight ?? undefined,
      parsedFontWeight: Dynamic =
        fontWeightValue === "bold"
          ? 700
          : fontWeightValue === "normal"
            ? 400
            : parseQuickActionNumber(fontWeightValue),
      currentFontWeight: Dynamic = parsedFontWeight ?? 400,
      currentFontStyle: Dynamic =
        styleIo.get("font-style") ?? seed?.rendered?.fontStyle ?? "normal",
      currentDecoration: Dynamic =
        styleIo.get("text-decoration-line") ??
        seed?.rendered?.textDecoration ??
        "",
      currentTextAlign: Dynamic =
        styleIo.get("text-align") ?? seed?.rendered?.textAlign ?? "start",
      {
        sizes: censusSizes,
        sizeNames: censusSizeNames,
        sizeFamilies: censusSizeFamilies,
      }: Dynamic = typographyCensusOptions({
        sizes: seed?.sizes ?? [],
        sizeRoles: seed?.sizeRoles,
        sizeFamilies: seed?.sizeFamilies,
      }),
      fontFamilyValue: Dynamic =
        styleIo.get("font-family") ??
        seed?.fontFamily ??
        seed?.rendered?.fontFamily ??
        "",
      pickableFamily: Dynamic = InspectorComputedDataPattern.test(fontFamilyValue)
        ? fontFamilyValue
        : "",
      faceFamily: Dynamic = pickableFamily || (seed?.rendered?.fontFamily ?? ""),
      isItalic: Dynamic = /^(italic|oblique)/.test(currentFontStyle),
      familyOptions: Dynamic = fontFamilyPickerOptions(
        (seed?.fonts ?? []).filter(
          (font?: Dynamic): Dynamic =>
            InspectorComputedDataPattern.test(font),
        ),
      ),
      matchedFamilyOption: Dynamic = familyOptions.find(
        (option?: Dynamic): Dynamic =>
          option.value.toLowerCase() ===
          displayFontFamily(pickableFamily).toLowerCase(),
      ),
      familyPickerOptions: Dynamic =
        matchedFamilyOption || !pickableFamily
          ? familyOptions
          : [
              {
                value: pickableFamily,
                label: displayFontFamily(pickableFamily),
                labelStyle: {
                  fontFamily: pickableFamily,
                },
              },
              ...familyOptions,
            ],
      textPaintAndSeed: Dynamic = quickActionPaintAndSeed(
        styleIo.get("color") ?? null,
        seed?.rendered?.color ?? null,
        defaultQuickActionInk,
      ),
      textGround: Dynamic = seed?.rendered?.ground,
      contrastCheck: Dynamic =
        textGround != null && !isMultiple && !isTextClipped
          ? textContrastContext(
              textGround.behind,
              parsePixels(seed?.rendered?.fontSizePx) ?? currentFontSizePx ?? null,
              parseQuickActionNumber(seed?.rendered?.fontWeight) ??
                parsedFontWeight ??
                null,
            )
          : undefined;
    contrastRef &&
      contrastCheck &&
      (contrastRef.current = {
        check: contrastCheck,
        resolve: (cssColor?: Dynamic): Dynamic =>
          colorSwatches.find(
            (swatch?: Dynamic): Dynamic =>
              swatch.name ===
              matchingDesignSwatchName(colorSwatches, cssColor, definedVariables),
          )?.color ?? cssColor,
      });
    let isBoundText: Dynamic = textEdit != null && textFormats === null,
      listKind: Dynamic = seed?.list ?? "none",
      textEditRefusal: Dynamic = isBoundText
        ? uiMessage("inspector.selectionQuickActions.thisTextIsBoundTo")
        : isMultiple && !isRichTextEditing
          ? uiMessage("inspector.selectionQuickActions.oneTextAtATime")
          : !isRichTextEditing && !onEditText
            ? uiMessage("inspector.selectionQuickActions.thisTextIsNotEditable")
            : null,
      isSizeMixed: Dynamic =
        !isRichTextEditing &&
        (seed?.fontSizes?.length ?? 0) > 1 &&
        new Set(seed.fontSizes).size > 1;
    selectionHasVisiblePaint({
      bg: styleIo.get("background-color"),
      borderStyle: styleIo.get("border-style"),
      borderWidth: styleIo.get("border-width") ?? styleIo.get("border-top-width"),
      renderedBg: seed?.rendered?.background ?? null,
      textClip: isTextClipped,
    }) && (hasVisiblePaintRef.current = true);
    let showsBoxPanel: Dynamic = hasVisiblePaintRef.current,
      textClipBackground: Dynamic = isTextClipped
        ? sanitizeCssBackground(
            styleIo.get("background-image") ?? styleIo.get("background") ?? "",
          )
        : "transparent",
      gradientPaint: Dynamic = /gradient\(/.test(textClipBackground) ? textClipBackground : undefined,
      clearTextClipEdits: Dynamic = isTextClipped
        ? [
            [
              "background",
              hasInlineTextClip &&
              (styleIo.get("background-image") !== undefined ||
                styleIo.get("background") !== undefined)
                ? undefined
                : "none",
            ],
            ...InspectorPropertySchemaItems.map(
              (prop?: Dynamic): Dynamic => [
                prop,
                prop === "-webkit-text-fill-color" && !hasInlineTextClip
                  ? "currentcolor"
                  : undefined,
              ],
            ),
          ]
        : [],
      roundTenth: Dynamic = (amount?: Dynamic): Dynamic =>
        Math.round(amount * 10) / 10,
      ownFontFamily: Dynamic =
        styleIo.get("font-family") ?? seed?.fontFamily ?? undefined,
      typographySystemRows: Dynamic = designSystemTypographyOptions(designSystems),
      typographyModel: Dynamic = typographySessionModel({
        metrics: resolvedTypographyMetrics(styleIo, seed),
        sizeMixed: isSizeMixed,
        ownFamily: ownFontFamily,
        family: pickableFamily,
        sizes: censusSizes,
        sizeNames: censusSizeNames,
        sizeFamilies: censusSizeFamilies,
        systemRows: typographySystemRows,
        hasSystem: hasDesignSystems(designSystems),
        single: (seed?.fontSizes?.length ?? 1) <= 1,
      }),
      typographyPopupProps: Dynamic = {
        value: typographyModel.value,
        chipText: typographyModel.chipText,
        options: typographyModel.options.map(
          (option?: Dynamic): Dynamic => ({
            value: option.value,
            text: option.text,
            label: (
              <span className={"min-w-0 truncate"} style={option.labelStyle}>
                {option.text}
              </span>
            ),
            hint: option.hint,
            title: option.title,
            group: option.group,
            subgroup: option.subgroup,
          }),
        ),
        onChange: (optionValue?: Dynamic): Dynamic =>
          styleIo.set(typographyModel.editsFor(optionValue)),
        custom: {
          family: {
            value: matchedFamilyOption?.value ?? pickableFamily,
            options: familyPickerOptions,
            searchable: true,
            onOpenChange: (isOpenNext?: Dynamic): Dynamic =>
              isOpenNext &&
              ensureWebFonts([
                ...TypographyFontCatalogMapValue,
                ...(seed?.webfonts ?? []),
              ]),
            onChange: (pickedFamily?: Dynamic): Dynamic =>
              styleIo.set([
                [
                  "font-family",
                  pickedFamily === pickableFamily
                    ? pickedFamily
                    : normalizedFontFamilyOption(pickedFamily),
                ],
              ]),
          },
          face: {
            weight: currentFontWeight,
            italic: isItalic,
            faces: resolveFontVariants(
              faceFamily,
              getAvailableFontVariants(
                seed?.faces ?? [],
                faceFamily,
              ),
            ),
            onOpenChange: (isOpenNext?: Dynamic): Dynamic =>
              isOpenNext && seed?.onFacesOpen?.(),
            onChange: (pickedWeight?: Dynamic, pickedItalic?: Dynamic): Dynamic =>
              styleIo.set(
                pickedItalic === isItalic
                  ? [["font-weight", String(pickedWeight)]]
                  : [
                      ["font-weight", String(pickedWeight)],
                      ["font-style", pickedItalic ? "italic" : "normal"],
                    ],
              ),
          },
          size: {
            value: isSizeMixed ? undefined : currentFontSizePx,
            mixed: isSizeMixed,
            min: 1,
            max: 999,
            onValue: (sizeValue?: Dynamic): Dynamic =>
              styleIo.set([
                [
                  "font-size",
                  sizeValue === undefined
                    ? undefined
                    : String(roundTenth(sizeValue)) + "px",
                ],
              ]),
            onScrub: (sizeValue?: Dynamic): Dynamic =>
              styleIo.set(
                [["font-size", String(Math.round(sizeValue)) + "px"]],
                true,
              ),
            onScrubEnd: styleIo.settle,
          },
          lineHeight: {
            value: parseUnitless(styleIo.get("line-height")),
            get placeholder() { return seed?.rendered?.lineHeight ?? (uiMessage("inspector.selectionQuickActions.auto")); },
            clearable: true,
            min: 0.5,
            max: 4,
            step: 0.05,
            onValue: (lineHeightValue?: Dynamic): Dynamic =>
              styleIo.set([
                [
                  "line-height",
                  lineHeightValue === undefined
                    ? undefined
                    : String(Math.round(lineHeightValue * 100) / 100),
                ],
              ]),
            onScrub: (lineHeightValue?: Dynamic): Dynamic =>
              styleIo.set(
                [["line-height", String(Math.round(lineHeightValue * 100) / 100)]],
                true,
              ),
            onScrubEnd: styleIo.settle,
          },
          letterSpacing: {
            value: parsePixels(styleIo.get("letter-spacing")),
            placeholder: "0",
            clearable: true,
            min: -10,
            max: 40,
            step: 0.5,
            onValue: (spacingValue?: Dynamic): Dynamic =>
              styleIo.set([
                [
                  "letter-spacing",
                  spacingValue === undefined
                    ? undefined
                    : String(roundTenth(spacingValue)) + "px",
                ],
              ]),
            onScrub: (spacingValue?: Dynamic): Dynamic =>
              styleIo.set(
                [["letter-spacing", String(roundTenth(spacingValue)) + "px"]],
                true,
              ),
            onScrubEnd: styleIo.settle,
          },
        },
      },
      textColorPopupProps: Dynamic = {
        get title() { return uiMessage("inspector.selectionQuickActions.textColor"); },
        editsAreUndoSteps: editsAreUndoable,
        paint: gradientPaint ?? textPaintAndSeed.paint,
        swatches: colorSwatches,
        value: isTextClipped
          ? null
          : matchingDesignSwatchName(
              colorSwatches,
              styleIo.get("color"),
              definedVariables,
            ),
        onSwatch: (swatchName?: Dynamic): Dynamic => {
          let swatchValue: Dynamic = valueForDesignSwatch(
            colorSwatches,
            swatchName,
            definedVariables,
          );
          swatchValue !== undefined &&
            styleIo.set([["color", swatchValue], ...clearTextClipEdits]);
        },
        custom: {
          seed: textPaintAndSeed.seed,
          unset: textPaintAndSeed.paint === undefined,
          onChange: (pickedColor?: Dynamic): Dynamic =>
            styleIo.set([["color", pickedColor], ...clearTextClipEdits], true),
          onPickEnd: (): Dynamic => styleIo.settle(),
          contrast: contrastCheck,
          quietSwatch: true,
        },
        ...(isMultiple ? {} : textFillPopoverProps),
      };
    if (showsBoxPanel && !isMultiple && !isRichTextEditing && part !== "text")
      return (
        <jsx_Ki.Fragment>
          <SessionStripGroup wrap={true}>
            <SessionTypographyPopup
              testid={"mega-text-style"}
              {...typographyPopupProps}
            />
            <SessionActionsPopover
              testid={"mega-text-color"}
              {...textColorPopupProps}
            />
          </SessionStripGroup>
          {compact ? (null) : (<SessionStripDivider />)}
          <CssBorderQuickPanel
            io={styleIo}
            swatches={colorSwatches}
            defined={definedVariables}
            compact={compact}
            editsAreUndoSteps={editsAreUndoable}
          />
          {crossFileActions}
          {crossFileDivider}
          {coarse && onEditText ? (<SessionStripButton
              data-testid={"mega-text-edit"}
              icon={"Edit"}
              title={uiMessage("inspector.selectionQuickActions.editTheText")}
              aria-label={uiMessage("inspector.selectionQuickActions.editText")}
              onClick={onEditText}
            />) : (null)}
          {trailingGroup}
        </jsx_Ki.Fragment>
      );
    let linkProps: Dynamic = isRichTextEditing
      ? {
          pressed: textFormats.link,
          onClick: (): Dynamic => onFormat("link"),
        }
      : primaryTag === "a" && onElementLink !== undefined && !isMultiple
        ? {
            href: seed?.href ?? undefined,
            editable: true,
            normalize: sanitizeEditableLink,
            invalidHint:
              "Enter a link: https://\u2026, a #section, a page path, mailto: or tel:",
            onChange: (nextHref?: Dynamic): Dynamic =>
              onElementLink(nextHref ?? null),
          }
        : {
            pressed: false,
            onClick: (): Dynamic => requestTextFormat("link"),
            disabledReason: textEditRefusal,
          };
    return (
      <jsx_Ki.Fragment>
        <TextSessionStrip
          selKey={"sel"}
          compact={compact}
          testidPrefix={"mega-text"}
          shortcuts={isRichTextEditing}
          tailTestids={{
            comment: "mega-sel-comment",
            more: "mega-sel-props",
          }}
          style={typographyPopupProps}
          color={textColorPopupProps}
          bold={{
            pressed: isRichTextEditing ? textFormats.bold : currentFontWeight >= 600,
            onClick: (): Dynamic =>
              isRichTextEditing
                ? onFormat("bold")
                : styleIo.set([
                    ["font-weight", currentFontWeight >= 600 ? "400" : "700"],
                  ]),
            disabledReason: isBoundText ? textEditRefusal : null,
          }}
          italic={{
            pressed: isRichTextEditing ? textFormats.italic : currentFontStyle === "italic",
            onClick: (): Dynamic =>
              isRichTextEditing
                ? onFormat("italic")
                : styleIo.set([
                    [
                      "font-style",
                      currentFontStyle === "italic" ? "normal" : "italic",
                    ],
                  ]),
            disabledReason: isBoundText ? textEditRefusal : null,
          }}
          underline={{
            pressed: isRichTextEditing
              ? textFormats.underline
              : currentDecoration.includes("underline"),
            onClick: (): Dynamic =>
              isRichTextEditing
                ? onFormat("underline")
                : styleIo.set([
                    [
                      "text-decoration-line",
                      isMultiple
                        ? currentDecoration.includes("underline")
                          ? "none"
                          : "underline"
                        : toggleUnderlineDecoration(currentDecoration),
                    ],
                  ]),
            disabledReason: isBoundText ? textEditRefusal : null,
          }}
          link={linkProps}
          list={{
            value: isRichTextEditing
              ? textFormats.ol
                ? "number"
                : textFormats.ul
                  ? "bullet"
                  : "none"
              : isMultiple
                ? null
                : listKind,
            get disabledReason() { return textEditRefusal !== null ? (isMultiple && !isRichTextEditing ? (uiMessage("inspector.selectionQuickActions.makeListsOneTextAt")) : (textEditRefusal)) : (null); },
            onChange: (nextListKind?: Dynamic): Dynamic => {
              let listTag: Dynamic = listKindToTag(
                nextListKind,
                isRichTextEditing
                  ? textFormats.ol
                    ? "number"
                    : textFormats.ul
                      ? "bullet"
                      : "none"
                  : listKind,
              );
              listTag !== null &&
                (isRichTextEditing ? onFormat(listTag) : requestTextFormat(listTag));
            },
          }}
          align={{
            value: isMultiple ? null : (textAlignmentValues[currentTextAlign] ?? "start"),
            onChange: (nextAlign?: Dynamic): Dynamic =>
              styleIo.set([["text-align", nextAlign]]),
          }}
          onEdit={coarse && !isRichTextEditing && onEditText ? onEditText : undefined}
          trailing={crossFileActions}
          onComment={crossFile ? null : openComment}
          onOpenInspector={
            sidebarActionState === "enabled" ? (): Dynamic => onOpenProps() : undefined
          }
          inspectorDisabledReason={
            sidebarActionState === "disabled-with-reason"
              ? "Properties edits one artboard at a time \u2014 narrow the selection"
              : undefined
          }
        />
      </jsx_Ki.Fragment>
    );
  }
  if (box > 0)
    return (
      <jsx_Ki.Fragment>
        <CssBorderQuickPanel
          io={styleIo}
          swatches={colorSwatches}
          defined={definedVariables}
          compact={compact}
          faces={!isMultiple}
          editsAreUndoSteps={editsAreUndoable}
        />
        {crossFileActions}
        {crossFileDivider}
        {trailingGroup}
      </jsx_Ki.Fragment>
    );
  let trailingDivider: Dynamic =
    compact || (crossFileActions === null && trailingGroup === null) ? null : (
      <SessionStripDivider />
    );
  return shape > 0 ? (
    <jsx_Ki.Fragment>
      <SvgPaintQuickPanel
        io={styleIo}
        swatches={colorSwatches}
        defined={definedVariables}
      />
      {trailingDivider}
      {crossFileActions}
      {crossFileDivider}
      {trailingGroup}
    </jsx_Ki.Fragment>
  ) : image > 0 ? (
    <jsx_Ki.Fragment>
      <ImageQuickPanel
        io={styleIo}
        src={seed?.imageSrc ?? undefined}
        onReplace={(): Dynamic => onReplaceImage?.()}
        replaceReason={
          isMultiple
            ? "Replace one image at a time"
            : onReplaceImage
              ? undefined
              : "This view can't replace images"
        }
        onCrop={(): Dynamic => onCrop?.()}
        cropping={cropping}
        cropReason={
          isMultiple
            ? "Crop one image at a time"
            : onCrop
              ? cropping
                ? undefined
                : cropReason
              : "This view can't crop images"
        }
      />
      {trailingDivider}
      {crossFileActions}
      {crossFileDivider}
      {trailingGroup}
    </jsx_Ki.Fragment>
  ) : line > 0 ? (
    <jsx_Ki.Fragment>
      <LineStrokeQuickPanel
        io={styleIo}
        swatches={colorSwatches}
        defined={definedVariables}
      />
      {trailingDivider}
      {crossFileActions}
      {crossFileDivider}
      {trailingGroup}
    </jsx_Ki.Fragment>
  ) : (
    <jsx_Ki.Fragment>
      {crossFileActions}
      {crossFileDivider}
      {trailingGroup}
    </jsx_Ki.Fragment>
  );
}
export {
  buildQuickActionSwatches,
  defaultQuickActionInk,
  emptySelectionPropertyItems,
  hasSelectionQuickActions,
  jsx_Ki,
  literalQuickActionColorPattern,
  parseQuickActionNumber,
  propertySidebarActionState,
  quickActionPaintAndSeed,
  react_Gw,
  selectionHasVisiblePaint,
  SelectionQuickActions,
  textAlignmentValues,
  toggleUnderlineDecoration,
};
export function installPropertiesSelectionQuickActions(): () => void {
  return () => {
    react_Gw = toModuleNamespace(load_react(), 1);
    initializeEditorAttributeValidation();
    jsx_Ki = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    emptySelectionPropertyItems = [];
    defaultQuickActionInk = "#141413";
    literalQuickActionColorPattern =
      /^(?:#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:[\s,/]+[\d.]+)?\s*\))$/;
    textAlignmentValues = {
      left: "start",
      start: "start",
      center: "center",
      right: "end",
      end: "end",
      justify: "justify",
    };
    parseQuickActionNumber = (rawValue?: Dynamic): Dynamic => {
      if (rawValue == null) return;
      let parsedNumber: Dynamic = parseFloat(rawValue);
      return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
    };
  };
}

import { useDesignSystems } from "../../design-system/store";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { InspectorComputedDataItems, normalizeInspectorComputedData } from "../../editor/inspector/computed-data";
import { InspectorPropertySchemaItems } from "../../editor/inspector/property-schema";
import { inspectPickerSelection } from "../../editor/picker/bridge";
import { getPickerFontFaces } from "../../editor/picker/inspection";
import { updateElementSessionState, useElementSessionState } from "../../editor/session/element-state";
import { updateTypographyCensus } from "../../editor/typography/census-store";
import { createPreviewHandle } from "../../preview/evaluation";
import type { Dynamic } from "../../runtime-types";

export const selectionColorLimit = 48;

/** 选择变化时计算（useMemo）：汇总选中元素的标签、文字、样式、字体与颜色普查，生成属性面板使用的 probe 与 seed。 */
function deriveSelectionInspectorProbe(
  selection: Dynamic,
  artboardEntries: Map<string, Dynamic>,
  selectionSource: (file: string) => string,
  selectionEpoch: number,
  artboardColorsRef: { current: string[] },
): Dynamic {
  if (selection.elements.size === 0) return null;
  let textCount: Dynamic = 0,
    shapeCount: Dynamic = 0,
    boxCount: Dynamic = 0,
    imageCount: Dynamic = 0,
    otherCount: Dynamic = 0,
    lineCount: Dynamic = 0,
    moreStyles: Dynamic = {},
    primaryTag: Dynamic = "",
    imageSrc: Dynamic = null,
    linkHref: Dynamic = null,
    fontSizes: Dynamic = [],
    listKind: Dynamic = "none",
    styleProperties: Dynamic = [
      "font-weight",
      "font-style",
      "text-decoration-line",
      "text-align",
      "line-height",
      "letter-spacing",
      "border-style",
      "border-width",
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
      "border-color",
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "stroke-width",
      "stroke-dasharray",
      "fill",
      "background-color",
      "background",
      ...InspectorPropertySchemaItems,
    ],
    primaryTextRef: Dynamic = null,
    isPrimaryEditable: Dynamic = false,
    primaryElement: Dynamic = null,
    textColor: Dynamic = null,
    fontSize: Dynamic = null,
    fontFamily: Dynamic = null,
    background: Dynamic = null,
    stroke: Dynamic = null,
    pageFonts: Dynamic = [];
  for (let [file, selectedEntry] of selection.elements as Dynamic) {
    let entry: Dynamic = artboardEntries.get(file),
      describedNodes: Dynamic = entry?.describeTids(selectedEntry.tids) ?? [],
      isPrimaryFile: Dynamic = file === selection.primary,
      fileSource: Dynamic = selectionSource(file);
    for (let node of describedNodes as Dynamic) {
      if (
        isPrimaryFile &&
        primaryElement == null &&
        ((primaryElement = {
          file: file,
          tid: node.tid,
          kind: node.kind,
        }),
        (primaryTag = node.tag),
        entry)
      ) {
        for (let styleProperty of styleProperties as Dynamic) {
          let styleValue: Dynamic = entry.readInlineStyle(
            fileSource,
            node.tid,
            styleProperty,
          );
          styleValue && (moreStyles[styleProperty] = styleValue);
        }
        node.kind === "image" &&
          (imageSrc =
            entry.readAttrs(fileSource, node.tid)?.src ?? null);
        node.tag === "a" &&
          (linkHref =
            entry.readAttrs(fileSource, node.tid)?.href ?? null);
        listKind = entry.listKindOf(node.tid);
      }
      node.kind === "box"
        ? boxCount++
        : node.kind === "image"
          ? imageCount++
          : node.kind === "other" && otherCount++;
      node.kind === "text" &&
        (textCount++,
        entry &&
          fontSizes.length < 64 &&
          fontSizes.push(
            entry.readInlineStyle(fileSource, node.tid, "font-size") ||
              null,
          ),
        isPrimaryFile &&
          primaryTextRef == null &&
          ((primaryTextRef = {
            file: file,
            tid: node.tid,
          }),
          (isPrimaryEditable = node.editable)),
        isPrimaryFile &&
          entry &&
          textColor == null &&
          fontSize == null &&
          ((textColor =
            entry.readInlineStyle(fileSource, node.tid, "color") ||
            null),
          (fontSize =
            entry.readInlineStyle(fileSource, node.tid, "font-size") ||
            null),
          (fontFamily =
            entry.readInlineStyle(
              fileSource,
              node.tid,
              "font-family",
            ) || null)),
        isPrimaryFile &&
          entry &&
          background == null &&
          (background =
            entry.readInlineStyle(
              fileSource,
              node.tid,
              "background-color",
            ) || null));
      if (node.kind === "shape" || node.kind === "box") {
        node.kind === "shape" && shapeCount++;
        let nonNoneOrNull: Dynamic = (paintValue?: Dynamic): Dynamic =>
            paintValue && paintValue !== "none" ? paintValue : null,
          nodeAttrs: Dynamic =
            isPrimaryFile && entry
              ? entry.readAttrs(fileSource, node.tid)
              : null;
        isPrimaryFile &&
          entry &&
          background == null &&
          (background =
            nonNoneOrNull(
              entry.readInlineStyle(
                fileSource,
                node.tid,
                "background-color",
              ),
            ) ||
            nonNoneOrNull(
              entry.readInlineStyle(fileSource, node.tid, "fill"),
            ) ||
            nonNoneOrNull(nodeAttrs?.fill) ||
            null);
        isPrimaryFile &&
          entry &&
          stroke == null &&
          (stroke =
            nonNoneOrNull(
              entry.readInlineStyle(fileSource, node.tid, "stroke"),
            ) ||
            nonNoneOrNull(
              entry.readInlineStyle(
                fileSource,
                node.tid,
                "border-color",
              ),
            ) ||
            nonNoneOrNull(nodeAttrs?.stroke) ||
            null);
      } else
        node.kind === "line" &&
          (lineCount++,
          isPrimaryFile &&
            entry &&
            stroke == null &&
            (stroke =
              entry.readInlineStyle(fileSource, node.tid, "stroke") ||
              entry.readInlineStyle(
                fileSource,
                node.tid,
                "border-color",
              ) ||
              null));
    }
    isPrimaryFile && entry && (pageFonts = entry.pageFonts());
  }
  const census = collectInspectorCensus(artboardEntries, selection.elements, pageFonts);
  if (census.selectedColors.join("\n") !== artboardColorsRef.current.join("\n")) {
    artboardColorsRef.current = census.selectedColors;
  }
  return {
    text: textCount,
    shape: shapeCount,
    box: boxCount,
    image: imageCount,
    other: otherCount,
    line: lineCount,
    primaryTag: primaryTag,
    primaryText: primaryTextRef,
    primaryEditable: isPrimaryEditable,
    probeEl: primaryTextRef
      ? {
          ...primaryTextRef,
          kind: "text",
        }
      : primaryElement,
    seed: {
      epoch: selectionEpoch,
      color: textColor,
      fontSize: fontSize,
      fontFamily: fontFamily,
      background: background,
      stroke: stroke,
      more: moreStyles,
      imageSrc: imageSrc,
      href: linkHref,
      list: listKind,
      fontSizes: fontSizes,
      fonts: census.fonts,
      webfonts: census.webfonts,
      sizes: census.sizes,
      sizeRoles: census.sizeRoles,
      sizeFamilies: census.sizeFamilies,
      colors: census.colors,
      artboardColors: artboardColorsRef.current,
    },
  };
}

function collectInspectorCensus(
  entries: Map<string, Dynamic>,
  selectedFiles: ReadonlyMap<string, unknown>,
  primaryFonts: string[],
) {
  const fontsByLowercase = new Map<string, string>();
  const addFont = (font: string) => {
    const key = font.toLowerCase();
    if (!fontsByLowercase.has(key)) fontsByLowercase.set(key, font);
  };
  primaryFonts.forEach(addFont);

  const sizes = new Set<string>();
  const webfonts = new Set<string>();
  const allColors = new Map<string, number>();
  const selectedColors = new Map<string, number>();
  const sizeRoles: Record<string, Record<string, number>> = {};
  const sizeFamilies: Record<string, Dynamic> = {};
  for (const [file, entry] of entries) {
    const census = entry.pageCensus();
    for (const font of census.fonts) addFont(font);
    for (const font of census.webfonts) webfonts.add(font);
    for (const size of census.sizes) sizes.add(size);
    for (const [color, count] of census.colors) {
      allColors.set(color, (allColors.get(color) ?? 0) + count);
    }
    if (selectedFiles.has(file)) {
      for (const [color, count] of census.colors) {
        selectedColors.set(color, (selectedColors.get(color) ?? 0) + count);
      }
    }
    for (const [role, roleSizes] of census.roles) {
      const roleUsage = sizeRoles[role] ??= {};
      for (const [size, count] of roleSizes) roleUsage[size] = (roleUsage[size] ?? 0) + count;
    }
    for (const [family, value] of census.families) sizeFamilies[family] ??= value;
  }
  const topColors = (counts: Map<string, number>, limit: number) => [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([color]) => color);
  return {
    fonts: [...fontsByLowercase.values()],
    webfonts: [...webfonts],
    sizes: [...sizes],
    sizeRoles,
    sizeFamilies,
    colors: topColors(allColors, 12),
    selectedColors: topColors(selectedColors, selectionColorLimit),
  };
}

interface SelectionInspectorOptions {
  selection: Dynamic;
  artboardEntriesRef: { current: Map<string, Dynamic> };
  selectionSource: (file: string) => string;
  selectionEpoch: number;
}

export function useCanvasSelectionInspector({
  selection,
  artboardEntriesRef,
  selectionSource,
  selectionEpoch,
}: SelectionInspectorOptions) {
  const { useCallback, useEffect, useMemo, useRef, useState } = React;
  const designSystems = useDesignSystems();
  const artboardColorsRef = useRef([]);
  const elementSessionState = useElementSessionState(selection.primary ?? null);
  const selectionProbe = useMemo(
    () => deriveSelectionInspectorProbe(
      selection,
      artboardEntriesRef.current,
      selectionSource,
      selectionEpoch,
      artboardColorsRef,
    ),
    [selection, selectionEpoch, designSystems],
  );
  useEffect(() => {
    const seed = selectionProbe?.seed;
    if (seed) {
      updateTypographyCensus({
        sizes: seed.sizes,
        sizeRoles: seed.sizeRoles ?? {},
        sizeFamilies: seed.sizeFamilies ?? {},
      });
    }
  }, [selectionProbe]);

  const contrastRef = useRef(undefined);
  const [computedStyle, setComputedStyle] = useState(null);
  const lastInspectedKey = useRef(null);
  const probeElement = selectionProbe?.probeEl;
  const probeFile = probeElement?.file ?? null;
  const selectedTid = selectionProbe &&
    [...selection.elements.values()].reduce(
      (count: number, entry: Dynamic) => count + entry.count,
      0,
    ) === 1 ? (probeElement?.tid ?? null) : null;
  useEffect(() => {
    if (probeFile !== null) {
      updateElementSessionState(probeFile, { selected: selectedTid });
      return () => updateElementSessionState(probeFile, { selected: null });
    }
  }, [probeFile, selectedTid]);

  const [fontFaces, setFontFaces] = useState(null);
  const [fontFaceRequest, refreshFontFaces] = useState(0);
  useEffect(() => {
    if (!probeElement) return;
    const { file, tid, kind } = probeElement;
    const entry = artboardEntriesRef.current.get(file);
    const preview = entry ? createPreviewHandle(entry.previewFrameRef.current) : null;
    if (!preview) return;

    const key = file + ":" + String(tid);
    const afterPaint = lastInspectedKey.current === key;
    lastInspectedKey.current = key;
    let active = true;
    const ground = kind === "text";
    inspectPickerSelection(
      preview, tid, selectionSource(file), InspectorComputedDataItems,
      { afterPaint, srgb: true, ground },
    ).then((result: Dynamic) => {
      if (active) {
        setComputedStyle({
          key,
          ...normalizeInspectorComputedData(kind, result, { ground }),
        });
      }
    });
    return () => { active = false; };
  }, [selectionProbe]);

  useEffect(() => {
    if (probeElement?.kind !== "text") return;
    const { file, tid } = probeElement;
    const entry = artboardEntriesRef.current.get(file);
    const preview = entry ? createPreviewHandle(entry.previewFrameRef.current) : null;
    if (!preview) return;

    const key = file + ":" + String(tid);
    let active = true;
    getPickerFontFaces(preview).then((faces: Dynamic) => {
      if (!active || !faces) return;
      const signature = key + "\n" + faces.map(
        (face: Dynamic) => face.family + "|" + face.weight + "|" + face.style,
      ).join("\n");
      setFontFaces((previous: Dynamic) =>
        previous?.signature === signature ? previous : { key, signature, faces },
      );
    });
    return () => { active = false; };
  }, [selectionProbe, fontFaceRequest]);

  const variableNames = useMemo(
    () => [...new Set(designSystems.flatMap(
      (system: Dynamic) => system.colors.map((color: Dynamic) => "--" + color.name),
    ))],
    [designSystems],
  );
  const [variablesByFile, setVariablesByFile] = useState(() => new Map());
  const updateDefinedVariables = useCallback((file: string, variables: Dynamic) => {
    setVariablesByFile((previous: Map<string, Dynamic>) => {
      if (previous.get(file) === variables) return previous;
      const next = new Map(previous);
      if (variables === undefined) next.delete(file);
      else next.set(file, variables);
      return next;
    });
  }, []);

  const probeKey = probeElement && probeElement.file + ":" + String(probeElement.tid);
  const style = probeElement && computedStyle?.key === probeKey ? computedStyle : null;
  const seed = selectionProbe && {
    ...selectionProbe.seed,
    fontSize: selectionProbe.seed.fontSize ?? style?.fontSize ?? null,
    faces: fontFaces?.key === probeKey ? fontFaces?.faces : undefined,
    definedVars: probeElement ? variablesByFile.get(probeElement.file) : undefined,
    onFacesOpen: () => refreshFontFaces((count: number) => count + 1),
    rendered: style ? {
      color: style.color,
      background: style.background,
      stroke: style.stroke,
      fontWeight: style.fontWeight ?? null,
      fontFamily: style.fontFamily ?? null,
      fontStyle: style.fontStyle ?? null,
      textAlign: style.textAlign ?? null,
      textDecoration: style.textDecoration ?? null,
      fontSizePx: style.fontSize ?? null,
      lineHeight: style.lineHeight ?? null,
      letterSpacing: style.letterSpacing ?? null,
      box: style.box,
      ground: style.ground ?? null,
    } : undefined,
  };
  return { selectionProbe, seed, elementSessionState, contrastRef, variableNames, updateDefinedVariables };
}

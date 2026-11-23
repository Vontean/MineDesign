import { getPreviewGenerationGate } from "../preview/generation-gate";
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { createDocumentStore } from "./document-store";
import { requestHostCapability } from "./host-capabilities";
import { isProjectMetadataFile } from "./project-paths";
import { PlatformSha256Encode, sha256 } from "./sha256";

var PlatformFileContentLimit: Dynamic;
var maxFilePathBytes: Dynamic;
var PlatformFileContentResolvedValue: Dynamic;
var PlatformFileContentFilesBytesConfig: Dynamic;
var maxPublishBatchBytes: Dynamic;
var PlatformFileContentCache: Dynamic;
var PlatformFileContentSubscribers: Dynamic;
var explicitContentTypes: Dynamic;
var textContentTypes: Dynamic;
var replacementCharacter: Dynamic;
var PlatformFileContentUDBFFUDFFFPattern: Dynamic;
var PlatformFileContentIncludes: Dynamic;
var isHtmlPath: Dynamic;
var frameRuntimeStartMarker: Dynamic;
var frameRuntimeEndMarker: Dynamic;
var getFileContent: Dynamic;
var encodePathSegments: Dynamic;
var canvasMetadataFile: Dynamic;
var PlatformFileContentLabel: Dynamic;
var PlatformFileContentGridSizeCountSizeConfig: Dynamic;
var PlatformFileContentConstant: Dynamic;
var PlatformFileContentPattern: Dynamic;
var PlatformFileContentExpandPrintPaperValues: Dynamic;
var defaultDesignPageLimit: Dynamic;
var PlatformFileContentLimitAlias: Dynamic;
var PlatformFileContentBackgroundBackgroundColorOpacityValues: Dynamic;
var safeAnnotationCssSyntax: Dynamic;
var PlatformFileContentAZPattern: Dynamic;
var PlatformFileContentRgbaHslaPattern: Dynamic;
var PlatformFileContentBorderStyleObjectFitOpacityConfig: Dynamic;
var PlatformFileContentTrim: Dynamic;
var annotationArrowHeads: Dynamic;
var normalizeAnnotationCss: Dynamic;
var isShapeAnnotation: Dynamic;
var annotationRotation: Dynamic;
var PlatformFileContentSMLConfig: Dynamic;
var defaultNoteFontSize: Dynamic;
var minAnnotationFontSize: Dynamic;
var maxAnnotationFontSize: Dynamic;
var PlatformFileContentGrayRedOrangeValues: Dynamic;
var PlatformFileContentGrayRedOrangeValuesAlias: Dynamic;
var PlatformFileContentNoteTitle1Config: Dynamic;
var annotationTextStyle: Dynamic;
var PlatformFileContentHas: Dynamic;
var PlatformFileContentMax: Dynamic;
var PlatformFileContentKind: Dynamic;
var PlatformFileContentMaxW: Dynamic;
var PlatformFileContentHandler: Dynamic;
var annotationStyleOverrides: Dynamic;
var validCoverArtboard: Dynamic;
var artboardNameWithoutExtension: Dynamic;
var defaultArtboardWidth: Dynamic;
var defaultArtboardHeight: Dynamic;
var newArtboardGap: Dynamic;
var defaultTextAnnotationWidth: Dynamic;
var minTextAnnotationWidth: Dynamic;
var maxTextAnnotationWidth: Dynamic;
var defaultTextAnnotationMaxWidth: Dynamic;
var minAnnotationDimensionLimit: Dynamic;
var maxAnnotationDimensionLimit: Dynamic;
var maxFittedAnnotationFontSize: Dynamic;
var PlatformFileContentMin: Dynamic;
var PlatformFileContentLh: Dynamic;
var defaultAnnotationMaxHeight: Dynamic;
var PlatformFileContentMatch: Dynamic;
var PlatformFileContentL: Dynamic;
var PlatformFileContentTest: Dynamic;
var maxAnnotationTextChars: Dynamic;
var maxAnnotations: Dynamic;
var minArtboardDimension: Dynamic;
var minEmbeddedArtboardDimension: Dynamic;
var minFramelessArtboardDimension: Dynamic;
var maxCanvasItemDimension: Dynamic;
var maxArtboardRadius: Dynamic;
var maxCanvasCoordinate: Dynamic;
var PlatformFileContentRectOvalLineConfig: Dynamic;
var minShapeDimension: Dynamic;
var minImageDimension: Dynamic;
var parseAnnotationImageUrl: Dynamic;
var parseAnnotationVideoUrl: Dynamic;
var maxPenPathChars: Dynamic;
var sanitizePenPath: Dynamic;
var clampNumber: Dynamic;
var maxCanvasLabelChars: Dynamic;
var PlatformFileContentSlice: Dynamic;
var normalizeAnnotationText: Dynamic;
var parseCanvasItemId: Dynamic;
var normalizeAnnotationFontSize: Dynamic;
var normalizeAnnotationColorName: Dynamic;
var normalizeAnnotationFillName: Dynamic;
var normalizeAnnotationKind: Dynamic;
var normalizeDesignLaunch: Dynamic;
var PlatformFileContentScriptDataPropsPattern: Dynamic;
var artboardDisplayName: Dynamic;
var annotationKindCategory: Dynamic;
var DesignValue: Dynamic;
var MetaValue: Dynamic;
var designMetadataPath: Dynamic;
var SourceValue: Dynamic;
var designSourceDocumentPath: Dynamic;
var BoardsValue: Dynamic;
var FilesValue: Dynamic;
var NotesValue: Dynamic;
var maxSyncedArtboardBytes: Dynamic;
var maxSyncedFileBytes: Dynamic;
var maxCollectionBytes: Dynamic;
var maxInlineArtboardBytes: Dynamic;
var PlatformFileContentWebpAvifPattern: Dynamic;
var PlatformFileContentNodeModulesPattern: Dynamic;
var PlatformFileContentJsonPattern: Dynamic;
var maxProjectPathChars: Dynamic;
var PlatformFileContentAZaZAZaZPattern: Dynamic;
var reservedProjectSegmentPattern: Dynamic;
var ProjectValue: Dynamic;
var declarationPathPattern: Dynamic;
var maxDeclarationFileBytes: Dynamic;
var PlatformFileContentAZaZPattern: Dynamic;
var PlatformFileContentTextEncoder: Dynamic;
var PlatformFileContentXYWValues: Dynamic;
var ClaudeDesignValue: Dynamic;
var maxSourceUrlChars: Dynamic;
var sourceProjectIdPattern: Dynamic;
var DesignPValue: Dynamic;
var zonedDateTimePattern: Dynamic;
var PlatformFileContentFilesValue: Dynamic;
var defaultDocumentFileBytes: Dynamic;
var maxEmbeddedFilePathChars: Dynamic;
var designContentEncoder: Dynamic;
var documentKvEncoder: Dynamic;
var FileValue: Dynamic;
var PlatformFileContentOverPerFilePattern: Dynamic;
var projectFileKey: Dynamic;
var PlatformFileContentAlias: Dynamic;
var AppifactValue: Dynamic;
var PlatformFileContentBeforeWriteVersionOfState: Dynamic;
var PlatformFileContentController: Dynamic;
var assetUrlByFilePath: Dynamic;
var imageFilePathPattern: Dynamic;
var projectFilesystem: Dynamic;
var roomCapabilityHost: Dynamic;
var requestRoomCapabilityValue: Dynamic;
var PlatformFileContentFreezeValue: Dynamic;
var PlatformFileContentFreezeValueAlias: Dynamic;
var roomPeerListeners: Dynamic;
var roomPeerSubscriptionStarted: Dynamic;
var PlatformFileContentCurrentState: Dynamic;
var roomPeersStore: Dynamic;
var embedStorePrefixPattern: Dynamic;
var embedMemoryScopePattern: Dynamic;
var cachedEmbedContext: Dynamic;
var pendingEmbeddedWrites: Dynamic;
var embeddedWritesTracked: Dynamic;
var embeddedEditorFrozen: Dynamic;
var embeddedFreezeRequested: Dynamic;
var embeddedWriteFailed: Dynamic;
var embeddedEditorSettler: Dynamic;
var embeddedPresenceListener: Dynamic;
var embeddedEditorSilencer: Dynamic;
var PlatformFileContentDelayMs: Dynamic;
var embeddedSettleTimeoutMs: Dynamic;
var embeddedFlushBufferMs: Dynamic;
function isNarrowedFileContext(listing?: Dynamic, publication?: Dynamic): Dynamic {
  return listing.narrowed ?? publication.narrowed === true;
}
function validateFileName(filePath?: Dynamic): Dynamic {
  if (
    filePath === "" ||
    PlatformSha256Encode(filePath).length >
      maxFilePathBytes
  )
    return "its name is empty or too long. Rename it";
  if (/[\u0000-\u001f\u007f%;:\\]/.test(filePath))
    return "its name has a character that cannot be saved (% ; : \\ or a control character). Rename it";
  if (filePath.endsWith(".cmekshadow"))
    return "its name ends in .cmekshadow, which is reserved. Rename it";
  let pathSegments: Dynamic = filePath.split("/");
  if (
    filePath.startsWith("/") ||
    pathSegments.some(
      (segment?: Dynamic): Dynamic =>
        segment === "" || segment === "." || segment === "..",
    )
  )
    return "its path has an empty part, or a part that is only dots. Rename it";
  if (pathSegments[0].startsWith("_"))
    return "its top-level name starts with an underscore, which is reserved. Rename it";
}
function isTextFileContent(filePath?: Dynamic, fileEntry?: Dynamic): Dynamic {
  if (fileEntry === null) return false;
  let normalizedEntry: Dynamic = normalizeFileEntry(filePath, fileEntry);
  return (
    normalizedEntry !== null &&
    typeof normalizedEntry != "string" &&
    typeof normalizedEntry.content == "string" &&
    textContentTypes.has(normalizedEntry.contentType) &&
    PlatformFileContentIncludes(normalizedEntry.content)
  );
}
function describeInvalidFile(filePath?: Dynamic, fileEntry?: Dynamic): Dynamic {
  let invalidNameReason: Dynamic = validateFileName(filePath);
  if (invalidNameReason !== undefined)
    return {
      why: invalidNameReason,
      cause: "name",
    };
  if (fileEntry === null) return;
  let normalizedEntry: Dynamic = normalizeFileEntry(filePath, fileEntry);
  return typeof normalizedEntry == "string"
    ? normalizedEntry.includes("files of this kind")
      ? {
          why: normalizedEntry.slice(normalizedEntry.indexOf(": ") + 2),
          cause: "kind",
        }
      : normalizedEntry.includes("cannot infer a content type")
        ? {
            why: "files of this kind cannot be saved here (nothing is known for a name like this). Use another format",
            cause: "kind",
          }
        : {
            why: "it is in a form that cannot be saved here",
            cause: "unreadable",
          }
    : isTextFileContent(filePath, fileEntry)
      ? {
          get why() { return (("it holds a character that did not decode (it shows as ") + (replacementCharacter)) + ("). Find it and type it again"); },
          cause: "damaged_text",
        }
      : undefined;
}
function getMimeTypeForPath(filePath?: Dynamic): Dynamic {
  let slashIndex: Dynamic = filePath.lastIndexOf("/"),
    extensionIndex: Dynamic = filePath.lastIndexOf(".");
  if (!(extensionIndex <= slashIndex + 1))
    return PlatformFileContentCache.get(
      filePath.slice(extensionIndex + 1).toLowerCase(),
    );
}
function stripFrameRuntime(html?: Dynamic): Dynamic {
  let runtimeStart: Dynamic = html.indexOf(frameRuntimeStartMarker);
  if (runtimeStart < 0) return html;
  let runtimeEnd: Dynamic = html.indexOf(
    frameRuntimeEndMarker,
    runtimeStart + frameRuntimeStartMarker.length,
  );
  return runtimeEnd < 0
    ? html
    : html.slice(0, runtimeStart) +
        html.slice(runtimeEnd + frameRuntimeEndMarker.length);
}
function normalizeFileEntry(filePath?: Dynamic, fileEntry?: Dynamic): Dynamic {
  if (fileEntry === null) return null;
  let content: Dynamic = fileEntry,
    explicitContentType: Dynamic;
  typeof fileEntry == "object" &&
    !(typeof Blob !== "undefined" && fileEntry instanceof Blob) &&
    ((content = fileEntry.content), (explicitContentType = fileEntry.contentType));
  let isBlob: Dynamic = typeof Blob !== "undefined" && content instanceof Blob;
  if (typeof content != "string" && !isBlob)
    return filePath + ": content must be a string or a Blob";
  let blobContentType: Dynamic = isBlob ? content.type.split(";")[0].trim() : "",
    resolvedContentType: Dynamic =
      explicitContentType ??
      (PlatformFileContentSubscribers.has(blobContentType) ? blobContentType : undefined) ??
      getMimeTypeForPath(filePath) ??
      (blobContentType !== "" ? blobContentType : undefined);
  return resolvedContentType === undefined
    ? filePath +
        ": cannot infer a content type from the name; pass {content, contentType}"
    : resolvedContentType === "" || resolvedContentType.includes(";")
      ? filePath + ": contentType must be a bare media type"
      : !PlatformFileContentSubscribers.has(resolvedContentType) &&
          !(
            explicitContentType !== undefined &&
            explicitContentTypes.has(resolvedContentType)
          )
        ? filePath +
          ": files of this kind (" +
          resolvedContentType +
          ") cannot be saved here. Use another format"
        : {
            content: content,
            contentType: resolvedContentType,
          };
}
function getEncodedFileBytes(fileEntry?: Dynamic): Dynamic {
  if (fileEntry === null) return 0;
  let value: Dynamic = getFileContent(fileEntry);
  return typeof value == "string"
    ? PlatformSha256Encode(value).length
    : Math.ceil(value.size / 3) * 4;
}
function getRawFileBytes(fileEntry?: Dynamic): Dynamic {
  if (fileEntry === null) return 0;
  let value: Dynamic = getFileContent(fileEntry);
  return typeof value == "string"
    ? PlatformSha256Encode(value).length
    : value.size;
}
function describeOversizedFile(fileEntry?: Dynamic): Dynamic {
  if (
    fileEntry === null ||
    getEncodedFileBytes(fileEntry) <= PlatformFileContentResolvedValue
  )
    return;
  let isText: Dynamic = typeof getFileContent(fileEntry) == "string",
    maxMegabytes: Dynamic =
      (isText
        ? PlatformFileContentResolvedValue
        : (PlatformFileContentResolvedValue / 4) * 3) /
      (1024 * 1024);
  return (
    "it is over the " +
    String(maxMegabytes) +
    " MB limit for one file. Make it smaller" +
    (isText ? " (an image or a font pasted into it is the usual cause)" : "")
  );
}
async function fileContentToBytes(content?: Dynamic): Promise<Dynamic> {
  return typeof content == "string"
    ? PlatformSha256Encode(content)
    : new Uint8Array(await content.arrayBuffer());
}
async function hashFileMap(files?: Dynamic): Promise<Dynamic> {
  let state: Dynamic = {};
  for (let [filePath, fileEntry] of Object.entries(files) as Dynamic) {
    let normalizedEntry: Dynamic = normalizeFileEntry(filePath, fileEntry);
    normalizedEntry === null ||
      typeof normalizedEntry == "string" ||
      (state[filePath] = await sha256(
        await fileContentToBytes(normalizedEntry.content),
      ));
  }
  return state;
}
function validatePublishFileMap(files?: Dynamic): Dynamic {
  let filePaths: Dynamic = Object.keys(files);
  if (filePaths.length === 0 || filePaths.length > PlatformFileContentLimit)
    return {
      ok: false,
      code: "invalid_content",
    };
  let index: Dynamic = 0;
  for (let filePath of filePaths as Dynamic) {
    if (validateFileName(filePath) !== undefined)
      return {
        ok: false,
        code: "invalid_content",
      };
    if (typeof normalizeFileEntry(filePath, files[filePath]) == "string")
      return {
        ok: false,
        code: "invalid_content",
      };
    index += getEncodedFileBytes(files[filePath]);
  }
  return index > PlatformFileContentResolvedValue
    ? {
        ok: false,
        code: "too_large",
      }
    : undefined;
}
function splitPublishBatches(
  files?: Dynamic,
  isMetadataFile: Dynamic = isProjectMetadataFile,
  maxBatchBytes: Dynamic = maxPublishBatchBytes,
  maxBatchFiles: Dynamic = PlatformFileContentLimit,
): Dynamic {
  let fileEntries: Dynamic = Object.entries(files),
    contentEntries: Dynamic = fileEntries.filter(
      ([filePath]: Dynamic): Dynamic => !isMetadataFile(filePath),
    ),
    metadataEntries: Dynamic = fileEntries.filter(
      ([filePath]: Dynamic): Dynamic => isMetadataFile(filePath),
    ),
    batches: Dynamic = [],
    batch: Dynamic = {},
    batchBytes: Dynamic = 0,
    batchFileCount: Dynamic = 0,
    appendFile: Dynamic = (filePath?: Dynamic, fileEntry?: Dynamic): Dynamic => {
      let encodedBytes: Dynamic = getEncodedFileBytes(fileEntry);
      batchFileCount > 0 &&
        (batchBytes + encodedBytes > maxBatchBytes || batchFileCount + 1 > maxBatchFiles) &&
        (batches.push(batch), (batch = {}), (batchBytes = 0), (batchFileCount = 0));
      batch[filePath] = fileEntry;
      batchBytes += encodedBytes;
      batchFileCount += 1;
    };
  for (let [filePath, fileEntry] of contentEntries as Dynamic) appendFile(filePath, fileEntry);
  for (let [filePath, fileEntry] of metadataEntries as Dynamic) appendFile(filePath, fileEntry);
  batchFileCount > 0 && batches.push(batch);
  return batches;
}
function hasInjectedRuntime(fileEntry?: Dynamic): Dynamic {
  if (fileEntry === null) return false;
  let content: Dynamic =
    typeof fileEntry == "object" &&
    !(typeof Blob !== "undefined" && fileEntry instanceof Blob)
      ? fileEntry.content
      : fileEntry;
  return (
    typeof content == "string" &&
    (content.includes("/_cas/") ||
      content.includes(frameRuntimeStartMarker) ||
      content.includes("__frame_comments__"))
  );
}
function artboardAppearanceProperties(artboard?: Dynamic): Dynamic {
  let appearance: Dynamic = {};
  if (artboard)
    for (let property of PlatformFileContentExpandPrintPaperValues as Dynamic)
      artboard[property] !== undefined && (appearance[property] = artboard[property]);
  return appearance;
}
function resolveArtboardGuide(source?: Dynamic, dimensions?: Dynamic): Dynamic {
  let color: Dynamic = source.color ?? PlatformFileContentLabel;
  if (source.kind === "grid")
    return {
      kind: "grid",
      size: source.size ?? 8,
      color: color,
    };
  let isColumnGuide: Dynamic = source.kind === "columns",
    alignment: Dynamic = source.align ?? (isColumnGuide ? "stretch" : "start"),
    guideSize: Dynamic = source.size ?? (isColumnGuide ? 64 : 8),
    gutter: Dynamic = source.gutter ?? (isColumnGuide ? 24 : 8),
    offset: Dynamic = source.offset ?? 0,
    requestedCount: Dynamic = source.count ?? (isColumnGuide ? 12 : "auto"),
    availableLength: Dynamic =
      (isColumnGuide ? dimensions.w : dimensions.h) - (alignment === "center" ? 0 : offset),
    guideCount: Dynamic =
      requestedCount !== "auto"
        ? requestedCount
        : alignment === "stretch"
          ? isColumnGuide
            ? 12
            : 4
          : clampNumber(
              Math.floor((availableLength + gutter) / (guideSize + gutter)),
              1,
              PlatformFileContentConstant,
            );
  return {
    kind: source.kind,
    count: guideCount,
    align: alignment,
    size: guideSize,
    gutter: gutter,
    margin: source.margin ?? 0,
    offset: offset,
    color: color,
    auto: requestedCount === "auto",
  };
}
function normalizeArtboardRadius(radius?: Dynamic): Dynamic {
  let normalizeRadiusValue: Dynamic = (radiusValue?: Dynamic): Dynamic =>
    typeof radiusValue == "number" && Number.isFinite(radiusValue)
      ? clampNumber(
          Math.round(radiusValue * 100) / 100,
          0,
          maxArtboardRadius,
        )
      : null;
  if (Array.isArray(radius) && radius.length !== 4) return;
  let radii: Dynamic = Array.isArray(radius)
    ? Array.from(radius, normalizeRadiusValue)
    : Array(4).fill(normalizeRadiusValue(radius));
  if (radii.some((radiusValue?: Dynamic): Dynamic => radiusValue === null)) return;
  let [topLeft, topRight, bottomRight, bottomLeft]: Dynamic = radii;
  return topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft
    ? topLeft > 0
      ? topLeft
      : undefined
    : [topLeft, topRight, bottomRight, bottomLeft];
}
function artboardRadiusCorners(radius?: Dynamic): Dynamic {
  return typeof radius == "number"
    ? [radius, radius, radius, radius]
    : radius
      ? [...radius]
      : [0, 0, 0, 0];
}
function artboardRadiusCss(radius?: Dynamic): Dynamic {
  let normalizedRadius: Dynamic = normalizeArtboardRadius(radius);
  return normalizedRadius === undefined
    ? undefined
    : (typeof normalizedRadius == "number" ? [normalizedRadius] : normalizedRadius)
        .map((corner?: Dynamic): Dynamic => String(corner) + "px")
        .join(" ");
}
function updateArtboardRadius(
  manifest?: Dynamic,
  artboardPath?: Dynamic,
  radius?: Dynamic,
): Dynamic {
  return {
    ...manifest,
    artboards: manifest.artboards.map((artboard?: Dynamic): Dynamic => {
      if (artboard.file !== artboardPath) return artboard;
      let { radius: value, ...artboardWithoutRadius }: Dynamic = artboard;
      return radius !== undefined
        ? {
            ...artboardWithoutRadius,
            radius: radius,
          }
        : artboardWithoutRadius;
    }),
  };
}
function parseArtboardGuides(rawGuides?: Dynamic): Dynamic {
  if (!Array.isArray(rawGuides)) return;
  let normalizeGuideNumber: Dynamic = (candidate?: Dynamic, range?: Dynamic): Dynamic =>
      typeof candidate == "number" && Number.isFinite(candidate)
        ? clampNumber(
            Math.round(candidate * 100) / 100,
            range.min,
            range.max,
          )
        : undefined,
    guides: Dynamic = [];
  for (let candidate of rawGuides as Dynamic) {
    if (guides.length >= 6) break;
    if (typeof candidate != "object" || candidate === null) continue;
    let guide: Dynamic = candidate,
      color: Dynamic =
        typeof guide.color == "string" &&
        PlatformFileContentPattern.test(guide.color.trim())
          ? guide.color.trim()
          : undefined,
      appearance: Dynamic = {
        ...(color !== undefined
          ? {
              color: color,
            }
          : {}),
        ...(guide.hidden === true
          ? {
              hidden: true,
            }
          : {}),
      };
    if (guide.kind === "grid") {
      let gridSize: Dynamic = normalizeGuideNumber(
        guide.size,
        PlatformFileContentGridSizeCountSizeConfig.gridSize,
      );
      guides.push({
        kind: "grid",
        ...(gridSize !== undefined
          ? {
              size: gridSize,
            }
          : {}),
        ...appearance,
      });
    } else if (guide.kind === "columns" || guide.kind === "rows") {
      let alignment: Dynamic =
          guide.align === "stretch" ||
          guide.align === "start" ||
          guide.align === "center" ||
          guide.align === "end"
            ? guide.align
            : undefined,
        count: Dynamic =
          guide.count === "auto"
            ? "auto"
            : typeof guide.count == "number" && Number.isFinite(guide.count)
              ? clampNumber(
                  Math.round(guide.count),
                  PlatformFileContentGridSizeCountSizeConfig.count.min,
                  PlatformFileContentGridSizeCountSizeConfig.count.max,
                )
              : undefined,
        size: Dynamic = normalizeGuideNumber(
          guide.size,
          PlatformFileContentGridSizeCountSizeConfig.size,
        ),
        gutter: Dynamic = normalizeGuideNumber(
          guide.gutter,
          PlatformFileContentGridSizeCountSizeConfig.gutter,
        ),
        margin: Dynamic = normalizeGuideNumber(
          guide.margin,
          PlatformFileContentGridSizeCountSizeConfig.margin,
        ),
        offset: Dynamic = normalizeGuideNumber(
          guide.offset,
          PlatformFileContentGridSizeCountSizeConfig.offset,
        );
      guides.push({
        kind: guide.kind,
        ...(count !== undefined
          ? {
              count: count,
            }
          : {}),
        ...(alignment !== undefined
          ? {
              align: alignment,
            }
          : {}),
        ...(size !== undefined
          ? {
              size: size,
            }
          : {}),
        ...(gutter !== undefined
          ? {
              gutter: gutter,
            }
          : {}),
        ...(margin !== undefined
          ? {
              margin: margin,
            }
          : {}),
        ...(offset !== undefined
          ? {
              offset: offset,
            }
          : {}),
        ...appearance,
      });
    }
  }
  return guides.length > 0 ? guides : undefined;
}
function maxDesignPages(): Dynamic {
  return PlatformFileContentLimitAlias;
}
function parseAnnotationCrop(rawCrop?: Dynamic): Dynamic {
  if (rawCrop === null || typeof rawCrop != "object") return;
  let crop: Dynamic = rawCrop,
    normalizeCropProperty: Dynamic = (
      property?: Dynamic,
      min?: Dynamic,
      max?: Dynamic,
      precision?: Dynamic,
    ): Dynamic =>
      typeof crop[property] == "number" && Number.isFinite(crop[property])
        ? Math.round(
            Math.min(max, Math.max(min, crop[property])) *
              10 ** precision,
          ) /
          10 ** precision
        : null,
    [zoom, x, y]: Dynamic = [
      normalizeCropProperty("zoom", 1, 50, 4),
      normalizeCropProperty("x", 0, 1, 5),
      normalizeCropProperty("y", 0, 1, 5),
    ];
  return zoom === null ||
    x === null ||
    y === null ||
    (zoom === 1 && x === 0.5 && y === 0.5)
    ? undefined
    : {
        zoom: zoom,
        x: x,
        y: y,
      };
}
function updateAnnotationCrop(annotation?: Dynamic, crop?: Dynamic): Dynamic {
  let { crop: value, ...annotationWithoutCrop }: Dynamic = annotation;
  return crop === undefined
    ? annotationWithoutCrop
    : {
        ...annotationWithoutCrop,
        crop: crop,
      };
}
function updateAnnotationAlt(annotation?: Dynamic, alt?: Dynamic): Dynamic {
  let { alt: value, ...annotationWithoutAlt }: Dynamic = annotation;
  return alt === undefined
    ? annotationWithoutAlt
    : {
        ...annotationWithoutAlt,
        alt: alt,
      };
}
function updateAnnotationVideo(annotation?: Dynamic, video?: Dynamic): Dynamic {
  let { video: value, ...annotationWithoutVideo }: Dynamic = annotation;
  return video === undefined
    ? annotationWithoutVideo
    : {
        ...annotationWithoutVideo,
        video: video,
      };
}
function updateAnnotationArrowHeads(
  annotation?: Dynamic,
  arrowHeads?: Dynamic,
): Dynamic {
  let { headStart: value, headEnd: _previousEndHead, ...annotationWithoutHeads }: Dynamic = annotation;
  return {
    ...annotationWithoutHeads,
    kind: arrowHeads.end === "none" ? "line" : "arrow",
    ...(arrowHeads.start !== "none"
      ? {
          headStart: arrowHeads.start,
        }
      : {}),
    ...(arrowHeads.end === "open"
      ? {
          headEnd: "open",
        }
      : {}),
  };
}
function updateAnnotationCss(annotation?: Dynamic, css?: Dynamic): Dynamic {
  let { css: value, ...annotationWithoutCss }: Dynamic = annotation;
  return css === undefined
    ? annotationWithoutCss
    : {
        ...annotationWithoutCss,
        css: css,
      };
}
function annotationBounds(source?: Dynamic): Dynamic {
  switch (source.kind) {
    case "rect":
    case "oval":
    case "pen":
    case "image":
      return {
        x: source.x,
        y: source.y,
        w: source.w,
        h: source.h,
      };
    case "line":
    case "arrow":
      return {
        x: Math.min(source.x, source.x2),
        y: Math.min(source.y, source.y2),
        w: Math.abs(source.x2 - source.x),
        h: Math.abs(source.y2 - source.y),
      };
  }
}
function annotationVisibleBounds(annotation?: Dynamic): Dynamic {
  if (isShapeAnnotation(annotation)) return annotationBounds(annotation);
  let size: Dynamic = annotationTextStyle(annotation).size;
  return {
    x: annotation.x,
    y: annotation.y,
    w: annotation.w,
    h: Math.min(Math.round(size * 1.45) + 20, PlatformFileContentKind(annotation)),
  };
}
function updateShapeColor(annotation?: Dynamic, color?: Dynamic): Dynamic {
  let { color: value, ...annotationWithoutColor }: Dynamic = annotation,
    {
      background: _previousBackground,
      "background-color": _previousBackgroundColor,
      stroke: _previousStroke,
      ...nonColorCss
    }: Dynamic = annotationWithoutColor.css ?? {},
    annotationWithoutColorStyles: Dynamic = updateAnnotationCss(
      annotationWithoutColor,
      annotationWithoutColor.css === undefined
        ? undefined
        : Object.keys(nonColorCss).length > 0
          ? nonColorCss
          : undefined,
    );
  return color === "default"
    ? annotationWithoutColorStyles
    : {
        ...annotationWithoutColorStyles,
        color: color,
      };
}
function updateAnnotationColor(annotation?: Dynamic, color?: Dynamic): Dynamic {
  let { color: value, ...annotationWithoutColor }: Dynamic = annotation;
  return color === "default"
    ? annotationWithoutColor
    : {
        ...annotationWithoutColor,
        color: color,
      };
}
function moveAnnotation(
  source?: Dynamic,
  x?: Dynamic,
  y?: Dynamic,
): Dynamic {
  return source.kind === "line" || source.kind === "arrow"
    ? {
        ...source,
        x: x,
        y: y,
        x2: source.x2 + x - source.x,
        y2: source.y2 + y - source.y,
      }
    : {
        ...source,
        x: x,
        y: y,
      };
}
function annotationGeometry(source?: Dynamic): Dynamic {
  switch (source.kind) {
    case "rect":
    case "oval":
    case "pen":
    case "image":
      return {
        x: source.x,
        y: source.y,
        w: source.w,
        h: source.h,
        rotate: source.rotate ?? 0,
      };
    case "line":
    case "arrow":
      return {
        x: source.x,
        y: source.y,
        x2: source.x2,
        y2: source.y2,
      };
  }
}
function normalizeRotationDegrees(degrees?: Dynamic): Dynamic {
  if (typeof degrees != "number" || !Number.isFinite(degrees)) return 0;
  let normalized: Dynamic = ((Math.round(degrees) % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
}
function rotatedAnnotationBounds(
  annotation?: Dynamic,
  rect?: Dynamic,
): Dynamic {
  let degrees: Dynamic = annotationRotation(annotation);
  if (!degrees) return rect;
  let value: Dynamic = (degrees * Math.PI) / 180,
    [absCos, absSin]: Dynamic = [
      Math.abs(Math.cos(value)),
      Math.abs(Math.sin(value)),
    ],
    [rotatedWidth, rotatedHeight]: Dynamic = [
      rect.w * absCos + rect.h * absSin,
      rect.w * absSin + rect.h * absCos,
    ];
  return {
    x: rect.x + (rect.w - rotatedWidth) / 2,
    y: rect.y + (rect.h - rotatedHeight) / 2,
    w: rotatedWidth,
    h: rotatedHeight,
  };
}
function updateAnnotationTextStyle(
  annotation?: Dynamic,
  source?: Dynamic,
): Dynamic {
  let value: Dynamic = annotationTextStyle(annotation),
    defaultStyle: Dynamic =
      source.kind !== undefined && source.kind !== value.kind
        ? PlatformFileContentNoteTitle1Config[source.kind]
        : value,
    state: Dynamic = {
      size: normalizeAnnotationFontSize(
        Number.isFinite(source.size) ? source.size : defaultStyle.size,
        defaultStyle.size,
      ),
      kind: source.kind ?? value.kind,
      bold: source.bold ?? defaultStyle.bold,
      italic: source.italic ?? defaultStyle.italic,
      color: source.color ?? defaultStyle.color,
      fill: source.fill ?? defaultStyle.fill,
    },
    {
      id: id,
      x: x,
      y: y,
      w: width,
      text: text,
      page: page,
      rotate: rotation,
    }: Dynamic = annotation;
  return {
    id: id,
    x: x,
    y: y,
    w: width,
    ...(state.kind === value.kind
      ? PlatformFileContentHandler(state.kind, annotation.maxW, annotation.maxH)
      : {}),
    text: text,
    ...annotationStyleOverrides(state),
    ...(page !== undefined
      ? {
          page: page,
        }
      : {}),
    ...(rotation
      ? {
          rotate: rotation,
        }
      : {}),
  };
}
function designPageId(item?: Dynamic, pages?: Dynamic): Dynamic {
  let defaultPage: Dynamic = pages?.[0]?.id ?? "";
  return item.page === undefined
    ? defaultPage
    : pages?.some((page?: Dynamic): Dynamic => page.id === item.page)
      ? item.page
      : defaultPage;
}
function findArtboardByName(
  artboards?: Dynamic,
  requestedPath?: Dynamic,
  filterAmbiguousMatch?: Dynamic,
): Dynamic {
  let value: Dynamic = artboards.find(
    (artboard?: Dynamic): Dynamic => artboard.file === requestedPath,
  );
  if (value) return value;
  let requestedName: Dynamic = artboardNameWithoutExtension(requestedPath),
    matchingArtboards: Dynamic = artboards.filter(
      (artboard?: Dynamic): Dynamic =>
        artboardNameWithoutExtension(artboard.file) === requestedName,
    ),
    narrowedMatches: Dynamic =
      matchingArtboards.length > 1 && filterAmbiguousMatch ? matchingArtboards.filter(filterAmbiguousMatch) : matchingArtboards;
  return narrowedMatches.length === 1
    ? narrowedMatches[0]
    : matchingArtboards.length > 0
      ? "ambiguous"
      : null;
}
function createPageId(pages?: Dynamic, randomize: Dynamic = false): Dynamic {
  let values: Dynamic = new Set(
    pages.map((page?: Dynamic): Dynamic => page.id),
  );
  if (randomize)
    for (;;) {
      let value: Dynamic = "page-" + Math.random().toString(36).slice(2, 8);
      if (!values.has(value)) return value;
    }
  let count: Dynamic = 1;
  for (; values.has("page-" + String(count)); ) count += 1;
  return "page-" + String(count);
}
function annotationTextFit(
  textSize?: Dynamic,
  fontSize?: Dynamic,
  maxWidth?: Dynamic,
  maxHeight?: Dynamic,
): Dynamic {
  if (textSize.w <= 0 || textSize.h <= 0)
    return {
      k: 1,
      wrap: false,
    };
  let fitScale: Dynamic = Math.min(1, maxWidth / textSize.w, maxHeight / textSize.h),
    minimumScale: Dynamic =
      Math.min(maxFittedAnnotationFontSize, fontSize) / fontSize;
  return fitScale >= minimumScale
    ? {
        k: fitScale,
        wrap: false,
      }
    : {
        k: minimumScale,
        wrap: true,
      };
}
function annotationLineEndpoints(
  shapeKind?: Dynamic,
  bounds?: Dynamic,
  direction?: Dynamic,
): Dynamic {
  let hasExplicitSize: Dynamic = bounds.w > 0 || bounds.h > 0,
    [width, height]: Dynamic = hasExplicitSize
      ? [bounds.w, bounds.h]
      : PlatformFileContentRectOvalLineConfig[shapeKind],
    [xDirection, yDirection]: Dynamic = hasExplicitSize ? [direction.x, direction.y] : [1, 1],
    [startX, endX]: Dynamic =
      xDirection === 1
        ? [bounds.x, bounds.x + width]
        : [bounds.x + width, bounds.x],
    [startY, endY]: Dynamic =
      yDirection === 1
        ? [bounds.y, bounds.y + height]
        : [bounds.y + height, bounds.y];
  return {
    x: startX,
    y: startY,
    x2: endX,
    y2: endY,
  };
}
function isArtboardFile(path?: Dynamic): Dynamic {
  return path.endsWith(".dc.html");
}
function isDesignSystemFile(path?: Dynamic): Dynamic {
  return path.startsWith("ds/");
}
function parseShapeAnnotation(
  rawAnnotation?: Dynamic,
  annotationId?: Dynamic,
  kind?: Dynamic,
): Dynamic {
  let finiteOrFallback: Dynamic = (candidate?: Dynamic, fallback?: Dynamic): Dynamic =>
      typeof candidate == "number" && Number.isFinite(candidate)
        ? candidate
        : fallback,
    x: Dynamic = clampNumber(
      finiteOrFallback(rawAnnotation.x, 0),
      -maxCanvasCoordinate,
      maxCanvasCoordinate,
    ),
    y: Dynamic = clampNumber(
      finiteOrFallback(rawAnnotation.y, 0),
      -maxCanvasCoordinate,
      maxCanvasCoordinate,
    ),
    color: Dynamic = normalizeAnnotationColorName(rawAnnotation.color),
    css: Dynamic = normalizeAnnotationCss(rawAnnotation.css),
    rotation: Dynamic = normalizeRotationDegrees(rawAnnotation.rotate),
    supportsFlip: Dynamic =
      kind === "rect" || kind === "oval" || kind === "image",
    transforms: Dynamic = {
      ...(rotation !== 0 && kind !== "line" && kind !== "arrow"
        ? {
            rotate: rotation,
          }
        : {}),
      ...(rawAnnotation.flipX === true && supportsFlip
        ? {
            flipX: true,
          }
        : {}),
      ...(rawAnnotation.flipY === true && supportsFlip
        ? {
            flipY: true,
          }
        : {}),
    },
    appearance: Dynamic = {
      ...(color !== "default"
        ? {
            color: color,
          }
        : {}),
      ...(css !== undefined
        ? {
            css: css,
          }
        : {}),
      ...(parseCanvasItemId(rawAnnotation.page) !== null
        ? {
            page: parseCanvasItemId(rawAnnotation.page),
          }
        : {}),
      ...transforms,
    },
    [defaultWidth, defaultHeight]: Dynamic =
      PlatformFileContentRectOvalLineConfig[kind];
  if (kind === "pen") {
    let svgPath: Dynamic = sanitizePenPath(rawAnnotation.d);
    return svgPath === null
      ? null
      : {
          id: annotationId,
          kind: kind,
          x: x,
          y: y,
          w: clampNumber(
            finiteOrFallback(rawAnnotation.w, defaultWidth),
            minShapeDimension,
            maxCanvasItemDimension,
          ),
          h: clampNumber(
            finiteOrFallback(rawAnnotation.h, defaultHeight),
            minShapeDimension,
            maxCanvasItemDimension,
          ),
          d: svgPath,
          ...appearance,
        };
  }
  if (kind === "image") {
    let sourceUrl: Dynamic = parseAnnotationImageUrl(rawAnnotation.src);
    if (sourceUrl === null) return null;
    let alt: Dynamic = PlatformFileContentSlice(rawAnnotation.alt),
      page: Dynamic = parseCanvasItemId(rawAnnotation.page),
      objectFit: Dynamic = css?.["object-fit"],
      crop: Dynamic =
        objectFit === undefined || objectFit === "cover"
          ? parseAnnotationCrop(rawAnnotation.crop)
          : undefined,
      videoUrl: Dynamic = parseAnnotationVideoUrl(rawAnnotation.video);
    return {
      id: annotationId,
      kind: kind,
      x: x,
      y: y,
      w: clampNumber(
        finiteOrFallback(rawAnnotation.w, defaultWidth),
        minImageDimension,
        maxCanvasItemDimension,
      ),
      h: clampNumber(
        finiteOrFallback(rawAnnotation.h, defaultHeight),
        minImageDimension,
        maxCanvasItemDimension,
      ),
      src: sourceUrl,
      ...(videoUrl !== null
        ? {
            video: videoUrl,
          }
        : {}),
      ...(alt !== undefined
        ? {
            alt: alt,
          }
        : {}),
      ...(css !== undefined
        ? {
            css: css,
          }
        : {}),
      ...(crop !== undefined
        ? {
            crop: crop,
          }
        : {}),
      ...(page !== null
        ? {
            page: page,
          }
        : {}),
      ...transforms,
    };
  }
  if (kind === "line" || kind === "arrow") {
    let parseArrowHead: Dynamic = (candidate?: Dynamic): Dynamic =>
        candidate === "none" || candidate === "open" || candidate === "filled"
          ? candidate
          : null,
      lineAnnotation: Dynamic = {
        id: annotationId,
        kind: kind,
        x: x,
        y: y,
        x2: clampNumber(
          finiteOrFallback(rawAnnotation.x2, x + defaultWidth),
          -maxCanvasCoordinate,
          maxCanvasCoordinate,
        ),
        y2: clampNumber(
          finiteOrFallback(rawAnnotation.y2, y + defaultHeight),
          -maxCanvasCoordinate,
          maxCanvasCoordinate,
        ),
        ...appearance,
      };
    return updateAnnotationArrowHeads(lineAnnotation, {
      start: parseArrowHead(rawAnnotation.headStart) ?? "none",
      end:
        parseArrowHead(rawAnnotation.headEnd) ?? (kind === "arrow" ? "filled" : "none"),
    });
  }
  return {
    id: annotationId,
    kind: kind,
    x: x,
    y: y,
    w: clampNumber(
      finiteOrFallback(rawAnnotation.w, defaultWidth),
      minShapeDimension,
      maxCanvasItemDimension,
    ),
    h: clampNumber(
      finiteOrFallback(rawAnnotation.h, defaultHeight),
      minShapeDimension,
      maxCanvasItemDimension,
    ),
    ...appearance,
  };
}
function parseAnnotation(rawAnnotation?: Dynamic): Dynamic {
  if (rawAnnotation === null || typeof rawAnnotation != "object") return null;
  let annotation: Dynamic = rawAnnotation,
    id: Dynamic = parseCanvasItemId(annotation.id);
  if (id === null) return null;
  let kind: Dynamic =
    typeof annotation.text == "string" && annotation.text !== ""
      ? null
      : normalizeAnnotationKind(annotation.kind);
  if (kind !== null) return parseShapeAnnotation(annotation, id, kind);
  let finiteOrFallback: Dynamic = (candidate?: Dynamic, fallback?: Dynamic): Dynamic =>
      typeof candidate == "number" && Number.isFinite(candidate) ? candidate : fallback,
    isLargeLegacyText: Dynamic =
      annotation.kind === "text" &&
      normalizeAnnotationFontSize(
        annotation.size,
        defaultNoteFontSize,
      ) >= PlatformFileContentSMLConfig.l,
    textDefaults: Dynamic =
      PlatformFileContentNoteTitle1Config[
        PlatformFileContentTest(annotation.kind) || isLargeLegacyText ? "title1" : "note"
      ],
    text: Dynamic = normalizeAnnotationText(annotation.text),
    fontSize: Dynamic = normalizeAnnotationFontSize(
      annotation.size,
      textDefaults.size,
    ),
    rotation: Dynamic = normalizeRotationDegrees(annotation.rotate);
  return {
    id: id,
    x: clampNumber(
      finiteOrFallback(annotation.x, 0),
      -maxCanvasCoordinate,
      maxCanvasCoordinate,
    ),
    y: clampNumber(
      finiteOrFallback(annotation.y, 0),
      -maxCanvasCoordinate,
      maxCanvasCoordinate,
    ),
    w: clampNumber(
      typeof annotation.w == "number" && Number.isFinite(annotation.w)
        ? annotation.w
        : textDefaults.kind === "note"
          ? PlatformFileContentL(text, fontSize)
          : defaultTextAnnotationWidth,
      minTextAnnotationWidth,
      maxTextAnnotationWidth,
    ),
    ...PlatformFileContentHandler(
      textDefaults.kind,
      annotation.maxW,
      annotation.maxH,
    ),
    text: text,
    ...annotationStyleOverrides(
      isLargeLegacyText
        ? textDefaults
        : {
            size: fontSize,
            kind: textDefaults.kind,
            bold:
              typeof annotation.bold == "boolean"
                ? annotation.bold
                : textDefaults.bold,
            italic:
              typeof annotation.italic == "boolean"
                ? annotation.italic
                : textDefaults.italic,
            color: normalizeAnnotationColorName(annotation.color),
            fill: normalizeAnnotationFillName(annotation.fill),
          },
    ),
    ...(parseCanvasItemId(annotation.page) !== null
      ? {
          page: parseCanvasItemId(annotation.page),
        }
      : {}),
    ...(rotation !== 0
      ? {
          rotate: rotation,
        }
      : {}),
  };
}
function parseDesignPages(rawPages?: Dynamic): Dynamic {
  if (!Array.isArray(rawPages)) return [];
  let pages: Dynamic = [],
    seenPageIds: Dynamic = new Set();
  for (let candidate of rawPages as Dynamic) {
    if (pages.length >= maxDesignPages()) break;
    if (candidate === null || typeof candidate != "object") continue;
    let sourcePage: Dynamic = candidate,
      pageId: Dynamic = parseCanvasItemId(sourcePage.id);
    pageId === null ||
      seenPageIds.has(pageId) ||
      (seenPageIds.add(pageId),
      pages.push({
        id: pageId,
        name:
          PlatformFileContentSlice(sourcePage.name) ??
          "Page " + String(pages.length + 1),
      }));
  }
  return pages;
}
function parseArtboardSpec(spec?: Dynamic): Dynamic {
  let finiteOrFallback: Dynamic = (candidate?: Dynamic, fallback?: Dynamic): Dynamic =>
      typeof candidate == "number" && Number.isFinite(candidate) ? candidate : fallback,
    title: Dynamic = PlatformFileContentSlice(spec.title),
    expand: Dynamic = spec.expand,
    print: Dynamic = spec.print,
    paper: Dynamic = spec.paper,
    pageId: Dynamic = parseCanvasItemId(spec.page),
    isInteractive: Dynamic = spec.is_interactive === true,
    isFrameless: Dynamic = spec.frameless === true,
    guides: Dynamic = parseArtboardGuides(spec.guides),
    radius: Dynamic = normalizeArtboardRadius(spec.radius);
  return {
    file: spec.file,
    x: clampNumber(
      finiteOrFallback(spec.x, 0),
      -maxCanvasCoordinate,
      maxCanvasCoordinate,
    ),
    y: clampNumber(
      finiteOrFallback(spec.y, 0),
      -maxCanvasCoordinate,
      maxCanvasCoordinate,
    ),
    w: clampNumber(
      finiteOrFallback(spec.w, defaultArtboardWidth),
      isFrameless
        ? minFramelessArtboardDimension
        : minArtboardDimension,
      maxCanvasItemDimension,
    ),
    h: clampNumber(
      finiteOrFallback(spec.h, defaultArtboardHeight),
      isFrameless
        ? minFramelessArtboardDimension
        : minArtboardDimension,
      maxCanvasItemDimension,
    ),
    ...(title !== undefined
      ? {
          title: title,
        }
      : {}),
    ...(expand === "fill"
      ? {
          expand: "fill",
        }
      : {}),
    ...(print === "flow"
      ? {
          print: "flow",
        }
      : {}),
    ...(paper === "letter" || paper === "a4"
      ? {
          paper: paper,
        }
      : {}),
    ...(pageId !== null
      ? {
          page: pageId,
        }
      : {}),
    ...(isInteractive
      ? {
          is_interactive: true,
        }
      : {}),
    ...(isFrameless
      ? {
          frameless: true,
        }
      : {}),
    ...(guides !== undefined
      ? {
          guides: guides,
        }
      : {}),
    ...(radius !== undefined
      ? {
          radius: radius,
        }
      : {}),
  };
}
function artboardSpecFromProps(props?: Dynamic): Dynamic {
  let spec: Dynamic = parseArtboardSpec({
    ...(typeof props == "object" && props !== null ? props : {}),
    file: "",
  });
  return {
    w: spec.w,
    h: spec.h,
    ...(spec.title !== undefined
      ? {
          title: spec.title,
        }
      : {}),
    ...artboardAppearanceProperties(spec),
  };
}
function readEmbeddedArtboardProps(html?: Dynamic): Dynamic {
  try {
    let propsMatch: Dynamic =
      typeof html == "string"
        ? PlatformFileContentScriptDataPropsPattern.exec(html)
        : null;
    if (!propsMatch) return null;
    let propsJson: Dynamic = (propsMatch[1] ?? propsMatch[2] ?? "")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&"),
      preview: Dynamic = JSON.parse(propsJson)?.$preview,
      isPositiveDimension: Dynamic = (candidate?: Dynamic): Dynamic =>
        typeof candidate == "number" && Number.isFinite(candidate) && candidate > 0,
      width: Dynamic = preview?.width,
      height: Dynamic = preview?.height;
    return isPositiveDimension(width) && isPositiveDimension(height)
      ? {
          w: width,
          h: height,
        }
      : null;
  } catch {
    return null;
  }
}
function nextArtboardPosition(items?: Dynamic): Dynamic {
  if (items.length === 0)
    return {
      x: 0,
      y: 0,
    };
  let rightmostEdge: Dynamic = Math.max(
      ...items.map((artboard?: Dynamic): Dynamic => artboard.x + artboard.w),
    ),
    topmostEdge: Dynamic = Math.min(
      ...items.map((artboard?: Dynamic): Dynamic => artboard.y),
    );
  return {
    x: rightmostEdge + newArtboardGap,
    y: topmostEdge,
  };
}
function parseCanvasMetadata(
  metadataJson?: Dynamic,
  files?: Dynamic,
): Dynamic {
  let availableArtboardPaths: Dynamic = new Set(Object.keys(files).filter(isArtboardFile)),
    artboards: Dynamic = [],
    includedArtboardPaths: Dynamic = new Set(),
    metadata: Dynamic = null;
  if (metadataJson) {
    try {
      metadata = JSON.parse(metadataJson);
    } catch {
      metadata = null;
    }
    let rawArtboards: Dynamic = metadata?.artboards;
    if (Array.isArray(rawArtboards))
      for (let rawArtboard of rawArtboards as Dynamic) {
        if (!rawArtboard || typeof rawArtboard != "object") continue;
        let file: Dynamic = rawArtboard.file;
        typeof file == "string" &&
          (!availableArtboardPaths.has(file) ||
            includedArtboardPaths.has(file) ||
            (includedArtboardPaths.add(file), artboards.push(parseArtboardSpec(rawArtboard))));
      }
  }
  let normalizeEmbeddedDimension: Dynamic = (dimension?: Dynamic): Dynamic =>
    Math.round(
      clampNumber(
        dimension,
        minEmbeddedArtboardDimension,
        maxCanvasItemDimension,
      ),
    );
  for (let filePath of availableArtboardPaths as Dynamic) {
    if (includedArtboardPaths.has(filePath) || isDesignSystemFile(filePath)) continue;
    let embeddedProps: Dynamic = readEmbeddedArtboardProps(files[filePath]);
    artboards.push(
      parseArtboardSpec({
        file: filePath,
        ...nextArtboardPosition(artboards),
        ...(embeddedProps
          ? {
              w: normalizeEmbeddedDimension(embeddedProps.w),
              h: normalizeEmbeddedDimension(embeddedProps.h),
            }
          : {}),
      }),
    );
  }
  let annotations: Dynamic = [],
    annotationIds: Dynamic = new Set(),
    rawAnnotations: Dynamic = metadata?.annotations;
  if (Array.isArray(rawAnnotations))
    for (let rawAnnotation of rawAnnotations as Dynamic) {
      if (annotations.length >= maxAnnotations) break;
      let annotation: Dynamic = parseAnnotation(rawAnnotation);
      annotation === null ||
        annotationIds.has(annotation.id) ||
        (annotationIds.add(annotation.id), annotations.push(annotation));
    }
  let pages: Dynamic = parseDesignPages(metadata?.pages),
    launch: Dynamic = normalizeDesignLaunch(metadata?.launch, artboards, pages),
    pageIds: Dynamic = new Set(
      pages.map((page?: Dynamic): Dynamic => page.id),
    ),
    removeUnknownPage: Dynamic = (item?: Dynamic): Dynamic => {
      if (item.page !== undefined && !pageIds.has(item.page)) {
        let { page: _unknownPage, ...itemWithoutPage }: Dynamic = item;
        return itemWithoutPage;
      }
      return item;
    },
    isMigrated: Dynamic = metadata?.migrated === true,
    cover: Dynamic = validCoverArtboard(metadata?.cover, artboards);
  return {
    artboards: artboards.map(removeUnknownPage),
    ...(annotations.length > 0
      ? {
          annotations: annotations.map(removeUnknownPage),
        }
      : {}),
    ...(launch !== undefined
      ? {
          launch: launch,
        }
      : {}),
    ...(pages.length > 0
      ? {
          pages: pages,
        }
      : {}),
    ...(cover !== undefined
      ? {
          cover: cover,
        }
      : {}),
    ...(isMigrated
      ? {
          migrated: isMigrated,
        }
      : {}),
  };
}
function serializeCanvasMetadata(metadata?: Dynamic): Dynamic {
  let pages: Dynamic = parseDesignPages(metadata.pages),
    launch: Dynamic = normalizeDesignLaunch(
      metadata.launch,
      metadata.artboards,
      pages,
    ),
    cover: Dynamic = validCoverArtboard(metadata.cover, metadata.artboards),
    annotations: Dynamic = (metadata.annotations ?? [])
      .map((rawAnnotation?: Dynamic): Dynamic => parseAnnotation(rawAnnotation))
      .filter((annotation?: Dynamic): Dynamic => annotation !== null)
      .slice(0, maxAnnotations);
  return JSON.stringify(
    {
      artboards: metadata.artboards.map(
        (rawArtboard?: Dynamic): Dynamic => parseArtboardSpec(rawArtboard),
      ),
      ...(annotations.length > 0
        ? {
            annotations: annotations,
          }
        : {}),
      ...(launch !== undefined
        ? {
            launch: launch,
          }
        : {}),
      ...(pages.length > 0
        ? {
            pages: pages,
          }
        : {}),
      ...(cover !== undefined
        ? {
            cover: cover,
          }
        : {}),
      ...(metadata.migrated === true
        ? {
            migrated: true,
          }
        : {}),
    },
    null,
    2,
  );
}
function artboardStackOrder(orderedPaths?: Dynamic, artboards?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(
      artboards.map(
        (artboard?: Dynamic, artboardIndex?: Dynamic): Dynamic => [
          artboard.file,
          artboardIndex,
        ],
      ),
    ),
    value: Dynamic = orderedPaths.filter(
      (filePath?: Dynamic): Dynamic => entries.has(filePath),
    ),
    values: Dynamic = new Set(value),
    unlistedPaths: Dynamic = artboards
      .map((artboard?: Dynamic): Dynamic => artboard.file)
      .filter((filePath?: Dynamic): Dynamic => !values.has(filePath));
  return [...value, ...unlistedPaths].map(
    (filePath?: Dynamic): Dynamic => ({
      spec: artboards[entries.get(filePath)],
      z: entries.get(filePath),
    }),
  );
}
function reorderArtboardsOnPages(
  artboards?: Dynamic,
  selectedPaths?: Dynamic,
  direction?: Dynamic,
  pages?: Dynamic,
): Dynamic {
  let items: Dynamic = [...artboards],
    values: Dynamic = new Set(
      artboards
        .filter((artboard?: Dynamic): Dynamic => selectedPaths.has(artboard.file))
        .map((artboard?: Dynamic): Dynamic => designPageId(artboard, pages)),
    );
  for (let pageId of values as Dynamic) {
    let pageIndices: Dynamic = artboards.flatMap(
        (artboard?: Dynamic, artboardIndex?: Dynamic): Dynamic =>
          designPageId(artboard, pages) === pageId ? [artboardIndex] : [],
      ),
      selectedIndices: Dynamic = pageIndices.filter(
        (artboardIndex?: Dynamic): Dynamic => selectedPaths.has(artboards[artboardIndex].file),
      ),
      otherIndices: Dynamic = pageIndices.filter(
        (artboardIndex?: Dynamic): Dynamic => !selectedPaths.has(artboards[artboardIndex].file),
      ),
      reorderedIndices: Dynamic =
        direction === "front" ? [...otherIndices, ...selectedIndices] : [...selectedIndices, ...otherIndices];
    pageIndices.forEach(
      (artboardIndex?: Dynamic, orderIndex?: Dynamic): Dynamic =>
        (items[artboardIndex] = artboards[reorderedIndices[orderIndex]]),
    );
  }
  return items.every(
    (artboard?: Dynamic, artboardIndex?: Dynamic): Dynamic =>
      artboard === artboards[artboardIndex],
  )
    ? null
    : items;
}
function uniqueArtboardFile(
  files?: Dynamic,
  prefix: Dynamic = "Artboard",
  randomize: Dynamic = false,
): Dynamic {
  let values: Dynamic = new Set(
    Object.keys(files)
      .filter(isArtboardFile)
      .map((filePath?: Dynamic): Dynamic => filePath.replace(/\.dc\.html$/, "")),
  );
  if (randomize)
    for (;;) {
      let value: Dynamic =
        prefix + "-" + Math.random().toString(36).slice(2, 6);
      if (!values.has(value)) return value + ".dc.html";
    }
  if (!values.has(prefix)) return prefix + ".dc.html";
  let count: Dynamic = 2;
  for (; values.has(prefix + String(count)); ) count += 1;
  return prefix + String(count) + ".dc.html";
}
function nextArtboardTitle(artboards?: Dynamic): Dynamic {
  let index: Dynamic = 0;
  for (let value of artboards as Dynamic) {
    let defaultTitleMatch: Dynamic = /^Artboard(?: ?(\d{1,9}))?$/.exec(
      artboardDisplayName(value),
    );
    defaultTitleMatch && (index = Math.max(index, defaultTitleMatch[1] ? Number(defaultTitleMatch[1]) : 1));
  }
  return "Artboard " + String(index + 1);
}
function uniqueElementArtboardTitle(
  requestedTitle?: Dynamic,
  artboards?: Dynamic,
): Dynamic {
  let value: Dynamic = (
      requestedTitle.trim() === ""
        ? "Element"
        : requestedTitle
            .trim()
            .replace(
              /^./,
              (letter?: Dynamic): Dynamic => letter.toUpperCase(),
            )
    ).slice(0, maxCanvasLabelChars - 10),
    values: Dynamic = new Set(artboards.map(artboardDisplayName));
  if (!values.has(value)) return value;
  let count: Dynamic = 2;
  for (; values.has(value + " (" + String(count) + ")"); ) count += 1;
  return value + " (" + String(count) + ")";
}
function duplicateArtboardTitle(
  title?: Dynamic,
  artboards?: Dynamic,
): Dynamic {
  let baseTitle: Dynamic = title
      .replace(/ copy(?: \d{1,9})?$/, "")
      .slice(0, maxCanvasLabelChars - 10),
    titles: Dynamic = new Set(artboards.map(artboardDisplayName));
  if (!titles.has(baseTitle + " copy")) return baseTitle + " copy";
  let suffix: Dynamic = 2;
  for (; titles.has(baseTitle + " copy " + String(suffix)); ) suffix += 1;
  return baseTitle + " copy " + String(suffix);
}
function createAnnotationId(
  annotations?: Dynamic,
  randomize: Dynamic = false,
  prefix: Dynamic = "note",
): Dynamic {
  let values: Dynamic = new Set(
    annotations.map((annotation?: Dynamic): Dynamic => annotation.id),
  );
  if (randomize)
    for (;;) {
      let value: Dynamic =
        prefix + "-" + Math.random().toString(36).slice(2, 8);
      if (!values.has(value)) return value;
    }
  let count: Dynamic = 1;
  for (; values.has(prefix + "-" + String(count)); ) count += 1;
  return prefix + "-" + String(count);
}
function blankDcDocument(): Dynamic {
  return [
    "<!doctype html>",
    "<html>",
    '<head><meta charset="utf-8"><script src="./support.js"><\/script></head>',
    "<body>",
    "<x-dc>",
    "  <helmet>",
    "    <style>",
    "      html, body { margin: 0; height: 100%; }",
    "      body { background: #ffffff; }",
    "    </style>",
    "  </helmet>",
    '  <section class="stage" style="width:100%;height:100vh"></section>',
    "</x-dc>",
    "</body>",
    "</html>",
    "",
  ].join(`
`);
}
function replaceDesignArtboards(
  metadata?: Dynamic,
  artboards?: Dynamic,
): Dynamic {
  return {
    ...metadata,
    artboards: artboards,
  };
}
function designArtboardsMatchFiles(
  metadata?: Dynamic,
  files?: Dynamic,
): Dynamic {
  let value: Dynamic = metadata.artboards
      .map((artboard?: Dynamic): Dynamic => artboard.file)
      .sort(),
    actualPaths: Dynamic = Object.keys(files)
      .filter(
        (filePath?: Dynamic): Dynamic =>
          isArtboardFile(filePath) &&
          (!isDesignSystemFile(filePath) || value.includes(filePath)),
      )
      .sort();
  return (
    actualPaths.length === value.length &&
    actualPaths.every(
      (filePath?: Dynamic, fileIndex?: Dynamic): Dynamic =>
        filePath === value[fileIndex],
    )
  );
}
function designPageContents(metadata?: Dynamic, pageId?: Dynamic): Dynamic {
  let callback: Dynamic = (item?: Dynamic): Dynamic =>
      designPageId(item, metadata.pages) === pageId,
    value: Dynamic = (metadata.annotations ?? []).filter(callback);
  return {
    ...metadata,
    artboards: metadata.artboards.filter(callback),
    ...(metadata.annotations !== undefined
      ? {
          annotations: value,
        }
      : {}),
  };
}
function replaceDesignPageContents(
  manifest?: Dynamic,
  pageId?: Dynamic,
  replacement?: Dynamic,
): Dynamic {
  let isOnPage: Dynamic = (item?: Dynamic): Dynamic =>
      designPageId(item, manifest.pages) === pageId,
    assignPage: Dynamic = (item?: Dynamic): Dynamic =>
      item.page === undefined && pageId !== (manifest.pages?.[0]?.id ?? "")
        ? {
            ...item,
            page: pageId,
          }
        : item,
    artboards: Dynamic = [
      ...manifest.artboards.filter(
        (artboard?: Dynamic): Dynamic => !isOnPage(artboard),
      ),
      ...replacement.artboards.map(assignPage),
    ],
    nextManifest: Dynamic = {
      ...manifest,
      artboards: artboards,
    };
  if ("annotations" in replacement) {
    let annotations: Dynamic = [
      ...(manifest.annotations ?? []).filter(
        (annotation?: Dynamic): Dynamic => !isOnPage(annotation),
      ),
      ...(replacement.annotations ?? []).map(assignPage),
    ];
    annotations.length > 0
      ? (nextManifest.annotations = annotations)
      : delete nextManifest.annotations;
  }
  "launch" in replacement &&
    (replacement.launch !== undefined
      ? (nextManifest.launch = replacement.launch)
      : delete nextManifest.launch);
  return nextManifest;
}
function isSupportedProjectAsset(filePath?: Dynamic): Dynamic {
  return (
    PlatformFileContentWebpAvifPattern.test(filePath) ||
    (PlatformFileContentJsonPattern.test(filePath) &&
      !PlatformFileContentNodeModulesPattern.test(filePath))
  );
}
function isSafeProjectPath(path?: Dynamic): Dynamic {
  return (
    typeof path == "string" &&
    path.length > 0 &&
    path.length <= maxProjectPathChars &&
    !path.includes("..") &&
    path
      .split("/")
      .every(
        (segment?: Dynamic): Dynamic =>
          PlatformFileContentAZaZAZaZPattern.test(segment) &&
          !reservedProjectSegmentPattern.test(segment),
      )
  );
}
function isProjectTextFilePath(path?: Dynamic): Dynamic {
  return (
    isSafeProjectPath(path) &&
    PlatformFileContentJsonPattern.test(path) &&
    !PlatformFileContentNodeModulesPattern.test(path)
  );
}
function isTypeDeclarationPath(path?: Dynamic): Dynamic {
  return isSafeProjectPath(path) && declarationPathPattern.test(path);
}
function isFullProjectPath(path?: Dynamic): Dynamic {
  return isSafeProjectPath(path) && path.startsWith(ProjectValue);
}
function hashProjectFileKey(filePath?: Dynamic): Dynamic {
  let hash: Dynamic = 0x6c62272e07bb014262b821756295c58dn,
    fnvPrime: Dynamic = 0x0000000001000000000000000000013bn,
    hashMask: Dynamic = (1n << 128n) - 1n;
  for (let byte of PlatformFileContentTextEncoder.encode(filePath) as Dynamic)
    hash = ((hash ^ BigInt(byte)) * fnvPrime) & hashMask;
  return hash.toString(16).padStart(32, "0");
}
function encodeStorePathSegment(segment?: Dynamic): Dynamic {
  let text: Dynamic = "";
  for (let value of PlatformFileContentTextEncoder.encode(segment) as Dynamic) {
    let character: Dynamic = String.fromCharCode(value);
    text +=
      value < 128 && PlatformFileContentAZaZPattern.test(character)
        ? character
        : "~" + value.toString(16).padStart(2, "0");
  }
  (text === "." || text === "..") && (text = text.replaceAll(".", "~2e"));
  return text.length > 150 ? "h~" + hashProjectFileKey(segment) : text;
}
function artboardDocument(spec?: Dynamic, html?: Dynamic): Dynamic {
  let boardDocument: Dynamic = {
    path: spec.file,
  };
  for (let value of PlatformFileContentXYWValues as Dynamic)
    spec[value] !== undefined && (boardDocument[value] = spec[value]);
  boardDocument.html = html;
  return boardDocument;
}
function annotationDocument(annotation?: Dynamic): Dynamic {
  let noteDocument: Dynamic = {};
  for (let [value, fieldValue] of Object.entries(annotation) as Dynamic)
    value !== "id" && fieldValue !== undefined && (noteDocument[value] = fieldValue);
  return noteDocument;
}
function projectFileDocument(path?: Dynamic, data?: Dynamic): Dynamic {
  return {
    path: path,
    kind: PlatformFileContentWebpAvifPattern.test(path) ? "image" : "text",
    data: data,
  };
}
function canvasMetaDocument(
  title?: Dynamic,
  manifest?: Dynamic,
  boardOrder?: Dynamic,
): Dynamic {
  let state: Dynamic = {
    v: 2,
    title: title,
    boardOrder:
      boardOrder ??
      manifest.artboards.map((artboard?: Dynamic): Dynamic => artboard.file),
  };
  manifest.pages !== undefined && (state.pages = manifest.pages);
  manifest.launch !== undefined && (state.launch = manifest.launch);
  manifest.cover !== undefined && (state.cover = manifest.cover);
  manifest.migrated === true && (state.migrated = true);
  return state;
}
function designSourceDocument(
  url?: Dynamic,
  projectId?: Dynamic,
  exportedAt?: Dynamic,
): Dynamic {
  return {
    v: 1,
    app: ClaudeDesignValue,
    url: url,
    projectId: projectId,
    exportedAt: exportedAt,
  };
}
function designSourceRefusal(candidate?: Dynamic): Dynamic {
  if (typeof candidate != "object" || candidate === null || Array.isArray(candidate))
    return "not an object";
  let value: Dynamic = candidate;
  if (value.v !== 1) return "v is not 1";
  if (value.app !== ClaudeDesignValue)
    return "app is not " + ClaudeDesignValue;
  if (typeof value.url != "string") return "url is not a string";
  if (value.url.length > maxSourceUrlChars)
    return (
      "url is over " + String(maxSourceUrlChars) + " characters"
    );
  let parsedUrl: Dynamic;
  try {
    parsedUrl = new URL(value.url);
  } catch {
    return "url is not an absolute URL";
  }
  if (parsedUrl.protocol !== "https:") return "url is not https";
  if (parsedUrl.username !== "" || parsedUrl.password !== "")
    return "url carries credentials";
  if (parsedUrl.href !== parsedUrl.origin + parsedUrl.pathname)
    return "url carries a query or fragment";
  if (parsedUrl.href !== value.url)
    return "url is not in canonical form (" + parsedUrl.href + ")";
  if (
    typeof value.projectId != "string" ||
    !sourceProjectIdPattern.test(value.projectId)
  )
    return "projectId is not 1\u201364 of A-Z a-z 0-9 _ -";
  if (parsedUrl.pathname !== DesignPValue + value.projectId)
    return "url is not <origin>" + DesignPValue + "<projectId>";
  if (
    typeof value.exportedAt != "string" ||
    !zonedDateTimePattern.test(value.exportedAt) ||
    !Number.isFinite(Date.parse(value.exportedAt))
  )
    return "exportedAt is not an ISO-8601 date-time with a zone";
}
function parseDesignSource(candidate?: Dynamic): Dynamic {
  if (designSourceRefusal(candidate) !== undefined) return;
  let value: Dynamic = candidate;
  return designSourceDocument(value.url, value.projectId, value.exportedAt);
}
function parseDesignContent(
  rawContent?: Dynamic,
  maxFileBytes: Dynamic = defaultDocumentFileBytes,
  allowLongPaths: Dynamic = false,
): Dynamic {
  let value: Dynamic =
      typeof rawContent == "object" && rawContent !== null ? rawContent : {},
    rawFiles: Dynamic =
      typeof value.files == "object" && value.files !== null
        ? value.files
        : {},
    items: Dynamic = [];
  for (let filePath in rawFiles) {
    if (items.length >= PlatformFileContentFilesValue) break;
    if (
      !Object.hasOwn(rawFiles, filePath) ||
      filePath.length === 0 ||
      filePath.startsWith("/") ||
      filePath.includes("\\") ||
      (!allowLongPaths &&
        (filePath.length > maxEmbeddedFilePathChars ||
          filePath.includes("..")))
    )
      continue;
    let fileContent: Dynamic = rawFiles[filePath];
    typeof fileContent == "string" &&
      (designContentEncoder.encode(fileContent).length > maxFileBytes ||
        items.push([filePath, fileContent]));
  }
  return {
    files: Object.fromEntries(items),
  };
}
function getDocumentFileCap(document?: Dynamic): Dynamic {
  return "maxFileBytes" in document && typeof document.maxFileBytes == "number"
    ? document.maxFileBytes
    : "loadState" in document
      ? maxSyncedFileBytes
      : defaultDocumentFileBytes;
}
function createDesignDocumentStore(storeOptions: Dynamic = {}): Dynamic {
  return createDocumentStore({
    parseContent: parseDesignContent,
    initialContent: {
      files: {},
    },
    defaultTitle: "Design",
    ...storeOptions,
  });
}
function primaryDesignFile(content?: Dynamic): Dynamic {
  let value: Dynamic = Object.keys(content.files).sort();
  return value.includes("Main.dc.html")
    ? "Main.dc.html"
    : (value.find(
        (filePath?: Dynamic): Dynamic => filePath.endsWith(".dc.html"),
      ) ??
        value[0] ??
        null);
}
function fileCapFailureMessage(error?: Dynamic): Dynamic {
  let value: Dynamic = PlatformFileContentOverPerFilePattern.exec(
    error instanceof Error
      ? error.message
      : typeof error == "string"
        ? error
        : "",
  );
  return value
    ? "Not kept: that change would make it larger than " +
        value[1] +
        " MiB (" +
        value[2] +
        ")."
    : undefined;
}
function createDocumentKvAdapter(
  document?: Dynamic,
  maxFileBytes: Dynamic = defaultDocumentFileBytes,
  oversizedFileExplanation: Dynamic = "it would be dropped at the next load",
): Dynamic {
  let filePathForKey: Dynamic = (key?: Dynamic): Dynamic =>
    key.startsWith(FileValue) ? key.slice(FileValue.length) : null;
  return {
    get(key: Dynamic): Dynamic {
      let value: Dynamic = filePathForKey(key);
      if (value === null) return Promise.resolve(null);
      let fileContent: Dynamic = document.content().files[value];
      return Promise.resolve(fileContent === undefined ? null : fileContent);
    },
    set(key: Dynamic, fileContent: Dynamic, updateOptions: Dynamic): Dynamic {
      let value: Dynamic = filePathForKey(key);
      if (value === null)
        return Promise.reject(
          new Error("only file/ keys exist in the document seam: " + key),
        );
      if (documentKvEncoder.encode(fileContent).length > maxFileBytes)
        return Promise.reject(
          new Error(
            "file is over the " +
              String(maxFileBytes / (1024 * 1024)) +
              " MiB per-file cap \u2014 " +
              oversizedFileExplanation,
          ),
        );
      let files: Dynamic = document.content().files;
      return !Object.hasOwn(files, value) &&
        Object.keys(files).length >= PlatformFileContentFilesValue
        ? Promise.reject(
            new Error(
              "file limit reached (" +
                String(PlatformFileContentFilesValue) +
                ") \u2014 delete something first",
            ),
          )
        : (document.updateContent(
            (content?: Dynamic): Dynamic => ({
              files: {
                ...content.files,
                [value]: fileContent,
              },
            }),
            updateOptions,
          ),
          Promise.resolve());
    },
    list(prefix: Dynamic): Dynamic {
      let value: Dynamic = Object.keys(document.content().files).sort();
      return Promise.resolve(
        value
          .map((filePath?: Dynamic): Dynamic => FileValue + filePath)
          .filter((key?: Dynamic): Dynamic => key.startsWith(prefix)),
      );
    },
    delete(key: Dynamic): Dynamic {
      let value: Dynamic = filePathForKey(key);
      if (value === null) return Promise.resolve(false);
      let hadFile: Dynamic = Object.hasOwn(document.content().files, value);
      hadFile &&
        document.updateContent((content?: Dynamic): Dynamic => {
          let state: Dynamic = {
            ...content.files,
          };
          delete state[value];
          return {
            files: state,
          };
        });
      return Promise.resolve(hadFile);
    },
  };
}
function setKvClient(client?: Dynamic): Dynamic {
  PlatformFileContentAlias = client;
}
function getKvClient(): Dynamic {
  if (!PlatformFileContentAlias)
    throw new Error(
      "kv client not initialized \u2014 call setKvClient() before mounting",
    );
  return PlatformFileContentAlias;
}
function stripAppifactPathPrefix(path?: Dynamic): Dynamic {
  return path.startsWith(AppifactValue)
    ? path.slice(AppifactValue.length)
    : path;
}
function registerAssetUrl(filePath?: Dynamic, assetUrl?: Dynamic): Dynamic {
  assetUrlByFilePath.set(filePath, assetUrl);
}
function registerImageFileUrls(files?: Dynamic): Dynamic {
  for (let [value, base64Content] of Object.entries(files) as Dynamic)
    imageFilePathPattern.test(value) &&
      assetUrlByFilePath.set(
        value,
        "data:" + imageFileMimeType(value) + ";base64," + base64Content,
      );
}
function imageFileMimeType(filePath?: Dynamic): Dynamic {
  let value: Dynamic = filePath.slice(filePath.lastIndexOf(".") + 1).toLowerCase();
  return (
    (
      {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp",
        avif: "image/avif",
        bmp: "image/bmp",
        svg: "image/svg+xml",
      } as Dynamic
    )[value] ?? "application/octet-stream"
  );
}
function previewMessageOrigin(): Dynamic {
  return {
    origin: currentHttpOrigin(),
  };
}
function currentHttpOrigin(): Dynamic {
  if (typeof location === "undefined") return "null";
  let value: Dynamic = (globalThis as Dynamic).origin ?? location.origin;
  // Codex 的同源 srcdoc 消息保留宿主 scheme，不能将它折成 opaque origin。
  return /^(?:https?|codex-sandbox):\/\//i.test(value) ? value : "null";
}
function resolveProjectAssetUrl(
  project?: Dynamic,
  path?: Dynamic,
  _assetOptions: Dynamic = {},
): Dynamic {
  return (
    assetUrlByFilePath.get(stripAppifactPathPrefix(path)) ??
    `./${stripAppifactPathPrefix(path)}`
  );
}
function probePreviewRuntime(port?: Dynamic, probeOptions?: Dynamic): Dynamic {
  let attempts: Dynamic = probeOptions?.attempts ?? 1,
    timeoutMs: Dynamic = probeOptions?.timeoutMs ?? 400;
  return new Promise((resolve?: Dynamic): Dynamic => {
    let pendingPingIds: Dynamic = new Set(),
      attemptCount: Dynamic = 0,
      probeTimer: Dynamic,
      receivePong: Dynamic = (message?: Dynamic): Dynamic => {
        let data: Dynamic = message.data;
        data == null ||
          typeof data != "object" ||
          (typeof data.__om_pong == "string" &&
            pendingPingIds.has(data.__om_pong) &&
            finishProbe("alive"));
      },
      finishProbe: Dynamic = (outcome?: Dynamic): Dynamic => {
        clearTimeout(probeTimer);
        port.removeEventListener("message", receivePong);
        resolve(outcome);
      },
      sendPing: Dynamic = (): Dynamic => {
        attemptCount += 1;
        let pingId: Dynamic = crypto.randomUUID();
        pendingPingIds.add(pingId);
        try {
          port.postMessage({
            __om_ping: pingId,
          });
        } catch {
          finishProbe("dead");
          return;
        }
        probeTimer = setTimeout((): Dynamic => {
          attemptCount < attempts ? sendPing() : finishProbe("dead");
        }, timeoutMs);
      };
    port.addEventListener("message", receivePong);
    port.start();
    sendPing();
  });
}
function hasRoomCapability(): Dynamic {
  // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
  let claude: Dynamic = (globalThis as Dynamic).designHost;
  return (
    typeof claude?.use == "function" ||
    typeof claude?.room?.presence == "function"
  );
}
async function requestRoomCapability(): Promise<Dynamic> {
  // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
  let claude: Dynamic = (globalThis as Dynamic).designHost;
  try {
    if (typeof claude?.use == "function") {
      let value: Dynamic = await requestHostCapability("room");
      return typeof value == "object" && value !== null ? value : null;
    }
  } catch {
    return null;
  }
  return typeof claude?.room?.presence == "function" ? claude.room : null;
}
function roomErrorCode(error?: Dynamic): Dynamic {
  let value: Dynamic =
    typeof error == "object" && error !== null ? error.code : "";
  return typeof value == "string" ? value : "";
}
async function publishRoomPresence(presence?: Dynamic): Promise<Dynamic> {
  let value: Dynamic = await requestRoomCapability();
  if (typeof value?.presence != "function") return "off";
  try {
    await value.presence.call(value, presence);
    return "ok";
  } catch (presenceError: Dynamic) {
    let errorCode: Dynamic = roomErrorCode(presenceError);
    return errorCode === "upstream_error"
      ? "retry"
      : (errorCode === "invalid_argument" &&
          console.warn("appifact room: rejected presence patch", presenceError),
        "off");
  }
}
function cachedRoomCapability(): Dynamic {
  // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
  let claude: Dynamic = (globalThis as Dynamic).designHost;
  (requestRoomCapabilityValue === undefined ||
    roomCapabilityHost !== claude) &&
    ((roomCapabilityHost = claude),
    (requestRoomCapabilityValue = requestRoomCapability()));
  return requestRoomCapabilityValue;
}
function normalizeRoomPeers(peers?: Dynamic): Dynamic {
  if (!Array.isArray(peers)) return PlatformFileContentFreezeValue;
  let items: Dynamic = [];
  for (let value of peers as Dynamic) {
    if (typeof value != "object" || value === null) continue;
    let peerRecord: Dynamic = value;
    typeof peerRecord.peer == "string" &&
      items.push({
        peer: peerRecord.peer,
        by:
          typeof peerRecord.by == "string" && peerRecord.by !== "" ? peerRecord.by : null,
        isMe: peerRecord.isMe === true,
        sameTab: peerRecord.sameTab === true,
        presence:
          typeof peerRecord.presence == "object" && peerRecord.presence !== null
            ? peerRecord.presence
            : {},
        updatedAt: typeof peerRecord.updatedAt == "number" ? peerRecord.updatedAt : 0,
      });
  }
  return items;
}
function subscribeRoomPeers(): Dynamic {
  roomPeerSubscriptionStarted ||
    ((roomPeerSubscriptionStarted = true),
    cachedRoomCapability().then((room?: Dynamic): Dynamic => {
      if (
        !(typeof room?.onPeers != "function" || !roomPeerSubscriptionStarted)
      )
        try {
          let value: Dynamic = room.onPeers.call(
            room,
            (update?: Dynamic): Dynamic => {
              PlatformFileContentFreezeValueAlias = normalizeRoomPeers(
                update.peers,
              );
              for (let listener of [
                ...roomPeerListeners,
              ] as Dynamic)
                listener();
            },
            (): Dynamic => {
              PlatformFileContentFreezeValueAlias =
                PlatformFileContentFreezeValue;
              for (let listener of [
                ...roomPeerListeners,
              ] as Dynamic)
                listener();
            },
          );
          typeof value == "function" &&
            (PlatformFileContentCurrentState = value);
        } catch {}
    }));
}
function resetRoomPeers(): Dynamic {
  PlatformFileContentCurrentState?.();
  PlatformFileContentCurrentState = null;
  roomPeerSubscriptionStarted = false;
  PlatformFileContentFreezeValueAlias = PlatformFileContentFreezeValue;
  roomPeerListeners.clear();
}
function hasInvalidEmbedContext(): Dynamic {
  return (
    typeof window !== "undefined" &&
    (window as Dynamic).__appifactEmbed !== undefined &&
    getEmbedContext() === null
  );
}
function getEmbedContext(): Dynamic {
  if (cachedEmbedContext !== undefined)
    return cachedEmbedContext;
  let value: Dynamic =
      typeof window === "undefined"
        ? undefined
        : (window as Dynamic).__appifactEmbed,
    embedRecord: Dynamic =
      typeof value == "object" && value !== null ? value : null,
    storePrefix: Dynamic =
      embedRecord !== null &&
      typeof embedRecord.storePrefix == "string" &&
      embedStorePrefixPattern.test(embedRecord.storePrefix)
        ? embedRecord.storePrefix
        : null,
    memoryScope: Dynamic =
      embedRecord !== null &&
      typeof embedRecord.memoryScope == "string" &&
      embedMemoryScopePattern.test(embedRecord.memoryScope)
        ? embedRecord.memoryScope
        : null;
  cachedEmbedContext =
    storePrefix !== null && memoryScope !== null
      ? {
          storePrefix: storePrefix,
          memoryScope: memoryScope,
        }
      : null;
  return cachedEmbedContext;
}
function trackEmbeddedWrite(writePromise?: Dynamic): Dynamic {
  !embeddedWritesTracked ||
    embeddedEditorFrozen ||
    (pendingEmbeddedWrites.add(writePromise),
    writePromise.then(
      (writeSucceeded?: Dynamic): Dynamic => {
        pendingEmbeddedWrites.delete(writePromise);
        embeddedFreezeRequested &&
          writeSucceeded === false &&
          (embeddedWriteFailed = true);
      },
      (): Dynamic => {
        pendingEmbeddedWrites.delete(writePromise);
        embeddedFreezeRequested && (embeddedWriteFailed = true);
      },
    ));
  return writePromise;
}
function isEmbedFrozen(): Dynamic {
  return embeddedEditorFrozen;
}
async function awaitEmbeddedWrites(deadline?: Dynamic): Promise<Dynamic> {
  for (; pendingEmbeddedWrites.size > 0; ) {
    let value: Dynamic = deadline - Date.now();
    if (value <= 0) return false;
    let timeout: Dynamic;
    await Promise.race([
      Promise.allSettled([...pendingEmbeddedWrites]),
      new Promise(
        (resolve?: Dynamic): Dynamic => (timeout = setTimeout(resolve, value)),
      ),
    ]);
    clearTimeout(timeout);
  }
  return true;
}
function setEmbedSettler(settle?: Dynamic): Dynamic {
  embeddedEditorSettler = settle;
}
function setEmbedPresenceListener(notify?: Dynamic): Dynamic {
  embeddedPresenceListener = notify;
}
function setEmbedSilencer(silence?: Dynamic): Dynamic {
  embeddedEditorSilencer = silence;
}
function silenceEmbeddedEditor(): Dynamic {
  let value: Dynamic = embeddedEditorSilencer;
  embeddedEditorSilencer = null;
  try {
    value?.();
  } catch (silenceError: Dynamic) {
    console.error("design: silencing the editor failed", silenceError);
  }
}
function dispatchDesignReady(): Dynamic {
  try {
    (window as Dynamic).frameElement?.dispatchEvent(new Event("designready"));
  } catch {}
}
function installEmbeddedLifecycle(document?: Dynamic): Dynamic {
  let __appifactEmbed: Dynamic = (window as Dynamic).__appifactEmbed,
    flag: Dynamic = false;
  embeddedWritesTracked = true;
  embeddedEditorFrozen =
    embeddedFreezeRequested =
    embeddedWriteFailed =
      false;
  __appifactEmbed.setPresence = (presence?: Dynamic): Dynamic => {
    __appifactEmbed.presence = presence;
    embeddedPresenceListener?.();
  };
  let value: Dynamic = null,
    callback: Dynamic = (): Dynamic => {
      if (
        value === null ||
        flag ||
        document.readOnly() ||
        document.loadState?.() !== "live"
      )
        return;
      let requestedTitle: Dynamic = value;
      value = null;
      document.title() !== requestedTitle && document.setTitle(requestedTitle);
    },
    unsubscribeLoad: Dynamic = document.subscribeLoad?.(callback);
  __appifactEmbed.setTitle = (title?: Dynamic): Dynamic => {
    typeof title == "string" && ((value = title), callback());
  };
  __appifactEmbed.dispose = (): Dynamic => {
    flag ||
      ((flag = true),
      (embeddedEditorFrozen = true),
      unsubscribeLoad?.(),
      silenceEmbeddedEditor(),
      document.dispose?.(),
      resetRoomPeers());
  };
  let settleEditor: Dynamic = async (): Promise<Dynamic> => {
    try {
      await embeddedEditorSettler?.();
    } catch {}
  };
  __appifactEmbed.settle = async (): Promise<Dynamic> => {
    let deadline: Dynamic = Date.now() + embeddedSettleTimeoutMs;
    embeddedFreezeRequested = true;
    let hadPendingWrites: Dynamic = pendingEmbeddedWrites.size > 0;
    silenceEmbeddedEditor();
    await settleEditor();
    let didSettleWrites: Dynamic = true;
    (hadPendingWrites || pendingEmbeddedWrites.size > 0) &&
      ((didSettleWrites = await awaitEmbeddedWrites(
        deadline - embeddedFlushBufferMs,
      )),
      await settleEditor());
    let didSettle: Dynamic = (): Dynamic => didSettleWrites && !embeddedWriteFailed;
    return new Promise((resolve?: Dynamic): Dynamic => {
      let isSyncIdle: Dynamic = (): Dynamic => {
        let syncDetail: Dynamic = document.syncDetail?.();
        return (
          syncDetail === undefined ||
          (syncDetail.pending === 0 && syncDetail.inflight === null)
        );
      };
      document.flushNow?.();
      setTimeout((): Dynamic => {
        document.flushNow?.();
        if (isSyncIdle()) return resolve(didSettle());
        if (document.saveState().status === "readonly") return resolve(false);
        let settleTimer: Dynamic = setTimeout(
            (): Dynamic => finish(isSyncIdle() && didSettle()),
            Math.max(0, deadline - Date.now()),
          ),
          unsubscribeSave: Dynamic = document.subscribeSave((): Dynamic => {
            isSyncIdle()
              ? finish(didSettle())
              : document.saveState().status === "readonly" && finish(false);
          });
        function finish(success?: Dynamic): Dynamic {
          clearTimeout(settleTimer);
          unsubscribeSave();
          resolve(success);
        }
      }, PlatformFileContentDelayMs);
    });
  };
}
function getEmbeddedPresence(): Dynamic {
  if (getEmbedContext() === null) return {};
  let presence: Dynamic = (window as Dynamic).__appifactEmbed.presence;
  if (typeof presence != "object" || presence === null) return {};
  let state: Dynamic = {};
  for (let [value, presenceValue] of Object.entries(presence).slice(
    0,
    24,
  ) as Dynamic)
    presenceValue === null ||
    typeof presenceValue == "string" ||
    typeof presenceValue == "number" ||
    typeof presenceValue == "boolean"
      ? (state[value] = presenceValue)
      : typeof presenceValue == "object" &&
        typeof presenceValue.text == "string" &&
        (state[value] = {
          text: presenceValue.text,
        });
  return state;
}
function embedMemoryPrefix(): Dynamic {
  let value: Dynamic = getEmbedContext();
  return value === null ? "" : value.memoryScope + "/";
}
function prefixDocumentStore(store?: Dynamic, pathPrefix?: Dynamic): Dynamic {
  return {
    subscribe: (
      path?: Dynamic,
      onRecords?: Dynamic,
      onError?: Dynamic,
    ): Dynamic =>
      store.subscribe(
        pathPrefix + path,
        (records?: Dynamic, snapshotOptions?: Dynamic): Dynamic =>
          onRecords(
            records
              .filter(
                (record?: Dynamic): Dynamic => record.path.startsWith(pathPrefix),
              )
              .map(
                (record?: Dynamic): Dynamic => ({
                  ...record,
                  path: record.path.slice(pathPrefix.length),
                }),
              ),
            snapshotOptions,
          ),
        onError,
      ),
    set: (path?: Dynamic, record?: Dynamic): Dynamic =>
      store.set(pathPrefix + path, record),
    update: (path?: Dynamic, patch?: Dynamic): Dynamic =>
      store.update(pathPrefix + path, patch),
    del: (path?: Dynamic): Dynamic => store.del(pathPrefix + path),
  };
}
function isPreviewMessage(
  dataset?: Dynamic,
  frame?: Dynamic,
  expectedOrigin?: Dynamic,
): Dynamic {
  if (
    (expectedOrigin == null && getPreviewGenerationGate(frame).blocked != null) ||
    !frame ||
    !("contentWindow" in frame) ||
    !frame.contentWindow ||
    dataset.source !== frame.contentWindow
  )
    return false;
  let value: Dynamic = expectedOrigin ?? previewMessageOrigin()?.origin;
  return value ? dataset.origin === value : false;
}
export {
  annotationArrowHeads,
  annotationBounds,
  annotationDocument,
  annotationGeometry,
  annotationKindCategory,
  annotationLineEndpoints,
  annotationRotation,
  annotationTextFit,
  annotationTextStyle,
  annotationVisibleBounds,
  AppifactValue,
  artboardAppearanceProperties,
  artboardDisplayName,
  artboardDocument,
  artboardNameWithoutExtension,
  artboardRadiusCorners,
  artboardRadiusCss,
  artboardSpecFromProps,
  artboardStackOrder,
  awaitEmbeddedWrites,
  blankDcDocument,
  BoardsValue,
  cachedRoomCapability,
  canvasMetadataFile,
  canvasMetaDocument,
  ClaudeDesignValue,
  createAnnotationId,
  createDesignDocumentStore,
  createDocumentKvAdapter,
  createPageId,
  currentHttpOrigin,
  describeInvalidFile,
  describeOversizedFile,
  designArtboardsMatchFiles,
  designPageContents,
  designPageId,
  DesignPValue,
  designSourceDocument,
  designSourceRefusal,
  DesignValue,
  dispatchDesignReady,
  duplicateArtboardTitle,
  embeddedEditorFrozen,
  embeddedFreezeRequested,
  embeddedWriteFailed,
  embeddedWritesTracked,
  embedMemoryPrefix,
  encodePathSegments,
  encodeStorePathSegment,
  fileCapFailureMessage,
  fileContentToBytes,
  FilesValue,
  FileValue,
  findArtboardByName,
  frameRuntimeEndMarker,
  frameRuntimeStartMarker,
  getDocumentFileCap,
  getEmbedContext,
  getEmbeddedPresence,
  getEncodedFileBytes,
  getFileContent,
  getKvClient,
  getMimeTypeForPath,
  getRawFileBytes,
  hashFileMap,
  hashProjectFileKey,
  hasInjectedRuntime,
  hasInvalidEmbedContext,
  hasRoomCapability,
  imageFileMimeType,
  installEmbeddedLifecycle,
  isArtboardFile,
  isDesignSystemFile,
  isEmbedFrozen,
  isFullProjectPath,
  isHtmlPath,
  isNarrowedFileContext,
  isPreviewMessage,
  isProjectTextFilePath,
  isSafeProjectPath,
  isShapeAnnotation,
  isSupportedProjectAsset,
  isTextFileContent,
  isTypeDeclarationPath,
  maxDesignPages,
  MetaValue,
  moveAnnotation,
  nextArtboardPosition,
  nextArtboardTitle,
  normalizeAnnotationCss,
  normalizeArtboardRadius,
  normalizeDesignLaunch,
  normalizeFileEntry,
  normalizeRoomPeers,
  normalizeRotationDegrees,
  NotesValue,
  parseAnnotation,
  parseAnnotationCrop,
  parseArtboardGuides,
  parseArtboardSpec,
  parseCanvasMetadata,
  parseDesignContent,
  parseDesignPages,
  parseDesignSource,
  parseShapeAnnotation,
  PlatformFileContentAlias,
  PlatformFileContentAZaZAZaZPattern,
  PlatformFileContentAZaZPattern,
  PlatformFileContentAZPattern,
  PlatformFileContentBackgroundBackgroundColorOpacityValues,
  PlatformFileContentBeforeWriteVersionOfState,
  PlatformFileContentBorderStyleObjectFitOpacityConfig,
  PlatformFileContentCache,
  assetUrlByFilePath,
  PlatformFileContentConstant,
  minAnnotationDimensionLimit,
  PlatformFileContentController,
  PlatformFileContentCurrentState,
  PlatformFileContentDelayMs,
  PlatformFileContentExpandPrintPaperValues,
  PlatformFileContentFilesBytesConfig,
  PlatformFileContentFilesValue,
  PlatformFileContentFreezeValue,
  PlatformFileContentFreezeValueAlias,
  PlatformFileContentGrayRedOrangeValues,
  PlatformFileContentGrayRedOrangeValuesAlias,
  PlatformFileContentGridSizeCountSizeConfig,
  PlatformFileContentHandler,
  projectFileKey,
  PlatformFileContentHas,
  PlatformFileContentIncludes,
  normalizeAnnotationColorName,
  normalizeAnnotationFillName,
  PlatformFileContentJsonPattern,
  PlatformFileContentKind,
  annotationStyleOverrides,
  PlatformFileContentL,
  PlatformFileContentLabel,
  PlatformFileContentLh,
  PlatformFileContentLimit,
  PlatformFileContentLimitAlias,
  PlatformFileContentMatch,
  PlatformFileContentMax,
  defaultAnnotationMaxHeight,
  PlatformFileContentMaxW,
  PlatformFileContentMin,
  clampNumber,
  PlatformFileContentNodeModulesPattern,
  PlatformFileContentNoteTitle1Config,
  PlatformFileContentOverPerFilePattern,
  PlatformFileContentPattern,
  PlatformFileContentRectOvalLineConfig,
  PlatformFileContentResolvedValue,
  PlatformFileContentRgbaHslaPattern,
  PlatformFileContentScriptDataPropsPattern,
  PlatformFileContentSlice,
  PlatformFileContentSMLConfig,
  PlatformFileContentSubscribers,
  PlatformFileContentTest,
  PlatformFileContentTextEncoder,
  designContentEncoder,
  documentKvEncoder,
  PlatformFileContentTrim,
  sanitizePenPath,
  PlatformFileContentUDBFFUDFFFPattern,
  PlatformFileContentWebpAvifPattern,
  PlatformFileContentXYWValues,
  prefixDocumentStore,
  previewMessageOrigin,
  primaryDesignFile,
  probePreviewRuntime,
  projectFileDocument,
  projectFilesystem,
  ProjectValue,
  publishRoomPresence,
  readEmbeddedArtboardProps,
  registerAssetUrl,
  registerImageFileUrls,
  reorderArtboardsOnPages,
  replaceDesignArtboards,
  replaceDesignPageContents,
  requestRoomCapability,
  requestRoomCapabilityValue,
  resetRoomPeers,
  resolveArtboardGuide,
  resolveProjectAssetUrl,
  roomErrorCode,
  roomPeersStore,
  roomPeerSubscriptionStarted,
  rotatedAnnotationBounds,
  serializeCanvasMetadata,
  setEmbedPresenceListener,
  setEmbedSettler,
  setEmbedSilencer,
  setKvClient,
  silenceEmbeddedEditor,
  SourceValue,
  splitPublishBatches,
  stripAppifactPathPrefix,
  stripFrameRuntime,
  subscribeRoomPeers,
  trackEmbeddedWrite,
  uniqueArtboardFile,
  uniqueElementArtboardTitle,
  updateAnnotationAlt,
  updateAnnotationArrowHeads,
  updateAnnotationColor,
  updateAnnotationCrop,
  updateAnnotationCss,
  updateAnnotationTextStyle,
  updateAnnotationVideo,
  updateArtboardRadius,
  updateShapeColor,
  validateFileName,
  validatePublishFileMap,
  validCoverArtboard,
  replacementCharacter,
  defaultArtboardHeight,
  defaultArtboardWidth,
  defaultDesignPageLimit,
  defaultDocumentFileBytes,
  defaultTextAnnotationWidth,
  designMetadataPath,
  designSourceDocumentPath,
  maxAnnotationDimensionLimit,
  maxAnnotationFontSize,
  maxAnnotationTextChars,
  maxAnnotations,
  maxArtboardRadius,
  maxCanvasCoordinate,
  maxCanvasItemDimension,
  maxCollectionBytes,
  maxDeclarationFileBytes,
  maxInlineArtboardBytes,
  maxPenPathChars,
  maxProjectPathChars,
  maxSyncedArtboardBytes,
  maxSyncedFileBytes,
  maxTextAnnotationWidth,
  minAnnotationFontSize,
  minEmbeddedArtboardDimension,
  minFramelessArtboardDimension,
  minImageDimension,
  minShapeDimension,
  minTextAnnotationWidth,
  normalizeAnnotationText,
  parseAnnotationImageUrl,
  parseAnnotationVideoUrl,
};
export function installPlatformFileContent(): () => void {
  return () => {
    PlatformFileContentLimit = 256;
    maxFilePathBytes = 512;
    PlatformFileContentResolvedValue = 16 * 1024 * 1024;
    PlatformFileContentFilesBytesConfig = {
      files: 512,
      bytes: 256 * 1024 * 1024,
    };
    maxPublishBatchBytes = 15 * 1024 * 1024;
    PlatformFileContentCache = new Map([
      ["html", "text/html"],
      ["htm", "text/html"],
      ["css", "text/css"],
      ["js", "text/javascript"],
      ["mjs", "text/javascript"],
      ["json", "application/json"],
      ["webmanifest", "application/manifest+json"],
      ["txt", "text/plain"],
      ["md", "text/markdown"],
      ["xml", "application/xml"],
      ["svg", "image/svg+xml"],
      ["png", "image/png"],
      ["jpg", "image/jpeg"],
      ["jpeg", "image/jpeg"],
      ["gif", "image/gif"],
      ["webp", "image/webp"],
      ["avif", "image/avif"],
      ["ico", "image/x-icon"],
      ["woff", "font/woff"],
      ["woff2", "font/woff2"],
      ["ttf", "font/ttf"],
      ["otf", "font/otf"],
      ["mp3", "audio/mpeg"],
      ["wav", "audio/wav"],
      ["mp4", "video/mp4"],
      ["webm", "video/webm"],
      ["pdf", "application/pdf"],
      ["wasm", "application/wasm"],
    ]);
    PlatformFileContentSubscribers = new Set([
      "text/html",
      "text/css",
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/manifest+json",
      "application/xml",
      "text/xml",
      "application/wasm",
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/avif",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "font/woff",
      "font/woff2",
      "font/ttf",
      "font/otf",
      "application/font-woff",
      "application/font-woff2",
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "application/pdf",
      "application/zip+dotlottie",
    ]);
    explicitContentTypes = new Set([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
      "application/x-figma",
    ]);
    textContentTypes = new Set([
      "text/html",
      "text/ldx",
      "text/css",
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/manifest+json",
      "application/xml",
      "text/xml",
      "image/svg+xml",
    ]);
    replacementCharacter = "\uFFFD";
    PlatformFileContentUDBFFUDFFFPattern =
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
    PlatformFileContentIncludes = (text?: Dynamic): Dynamic =>
      text.includes(replacementCharacter) ||
      PlatformFileContentUDBFFUDFFFPattern.test(text);
    isHtmlPath = (filePath?: Dynamic): Dynamic => /\.html?$/i.test(filePath);
    frameRuntimeStartMarker = "<\!-- frame-runtime -->";
    frameRuntimeEndMarker = "<\!-- /frame-runtime -->";
    getFileContent = (fileEntry?: Dynamic): Dynamic =>
      typeof fileEntry == "object" &&
      !(typeof Blob !== "undefined" && fileEntry instanceof Blob)
        ? fileEntry.content
        : fileEntry;
    encodePathSegments = (filePath?: Dynamic): Dynamic =>
      filePath.split("/").map(encodeURIComponent).join("/");
    canvasMetadataFile = "canvas.json";
    PlatformFileContentLabel = "rgba(255, 0, 0, 0.1)";
    PlatformFileContentGridSizeCountSizeConfig = {
      gridSize: {
        min: 1,
        max: 2e3,
      },
      count: {
        min: 1,
        max: 64,
      },
      size: {
        min: 1,
        max: 4e3,
      },
      gutter: {
        min: 0,
        max: 4e3,
      },
      margin: {
        min: 0,
        max: 4e3,
      },
      offset: {
        min: 0,
        max: 8e3,
      },
    };
    PlatformFileContentConstant = 1e3;
    PlatformFileContentPattern =
      /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgb|hsl)a?\([0-9.,%\s/]{1,40}\))$/i;
    PlatformFileContentExpandPrintPaperValues = [
      "expand",
      "print",
      "paper",
      "is_interactive",
      "frameless",
      "guides",
      "radius",
    ];
    defaultDesignPageLimit = 40;
    PlatformFileContentLimitAlias = defaultDesignPageLimit;
    PlatformFileContentBackgroundBackgroundColorOpacityValues = [
      "background",
      "background-color",
      "opacity",
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
      "border-style",
      "border-color",
      "border-width",
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
      "box-shadow",
      "filter",
      "backdrop-filter",
      "object-fit",
      "object-position",
      "stroke",
      "stroke-width",
    ];
    safeAnnotationCssSyntax = /^[a-z0-9#%(),.\/ +-]{1,1200}$/i;
    PlatformFileContentAZPattern = /([a-z-]+)\(/gi;
    PlatformFileContentRgbaHslaPattern =
      /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|(repeating-)?(linear|radial|conic)-gradient|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|opacity|saturate|sepia)$/i;
    PlatformFileContentBorderStyleObjectFitOpacityConfig = {
      "border-style": /^(none|solid|dashed|dotted|double)$/,
      "object-fit": /^(fill|contain|cover|none|scale-down)$/,
      opacity: /^(\d{1,3}(\.\d{1,6})?|\.\d{1,6}|\d{1,3}(\.\d{1,3})?%)$/,
      "stroke-width": /^\d{1,3}(\.\d{1,2})?(px)?$/,
    };
    PlatformFileContentTrim = (property?: Dynamic, candidate?: Dynamic): Dynamic => {
      if (typeof candidate != "string") return null;
      let value: Dynamic = candidate.trim();
      if (!safeAnnotationCssSyntax.test(value)) return null;
      let propertyPattern: Dynamic =
        PlatformFileContentBorderStyleObjectFitOpacityConfig[property];
      if (propertyPattern !== undefined)
        return propertyPattern.test(value)
          ? property === "opacity" && !value.endsWith("%") && parseFloat(value) > 1
            ? "1"
            : value
          : null;
      if (
        (value.match(/\(/g) ?? []).length !==
        [...value.matchAll(PlatformFileContentAZPattern)].length
      )
        return null;
      for (let colorMatch of value.matchAll(
        PlatformFileContentAZPattern,
      ) as Dynamic)
        if (!PlatformFileContentRgbaHslaPattern.test(colorMatch[1])) return null;
      return property === "stroke" && /gradient|^none$/i.test(value)
        ? null
        : value;
    };
    annotationArrowHeads = (source?: Dynamic): Dynamic => ({
      start: source.headStart ?? "none",
      end: source.kind === "arrow" ? (source.headEnd ?? "filled") : "none",
    });
    normalizeAnnotationCss = (rawCss?: Dynamic): Dynamic => {
      if (rawCss === null || typeof rawCss != "object" || Array.isArray(rawCss))
        return;
      let value: Dynamic = rawCss,
        state: Dynamic = {};
      for (let property of PlatformFileContentBackgroundBackgroundColorOpacityValues as Dynamic) {
        let cssValue: Dynamic = PlatformFileContentTrim(property, value[property]);
        cssValue !== null && (state[property] = cssValue);
      }
      return Object.keys(state).length > 0 ? state : undefined;
    };
    isShapeAnnotation = (source?: Dynamic): Dynamic =>
      source.kind === "rect" ||
      source.kind === "oval" ||
      source.kind === "line" ||
      source.kind === "arrow" ||
      source.kind === "pen" ||
      source.kind === "image";
    annotationRotation = (source?: Dynamic): Dynamic =>
      source.kind === "line" || source.kind === "arrow"
        ? 0
        : (source.rotate ?? 0);
    PlatformFileContentSMLConfig = {
      s: 14,
      m: 24,
      l: 40,
      xl: 72,
      xxl: 120,
    };
    defaultNoteFontSize = 14;
    minAnnotationFontSize = 8;
    maxAnnotationFontSize = 400;
    PlatformFileContentGrayRedOrangeValues = [
      "gray",
      "red",
      "orange",
      "green",
      "teal",
      "blue",
      "purple",
      "pink",
    ];
    PlatformFileContentGrayRedOrangeValuesAlias =
      PlatformFileContentGrayRedOrangeValues;
    PlatformFileContentNoteTitle1Config = {
      note: {
        size: defaultNoteFontSize,
        kind: "note",
        bold: false,
        italic: false,
        color: "default",
        fill: "default",
      },
      title1: {
        size: PlatformFileContentSMLConfig.xl,
        kind: "title1",
        bold: true,
        italic: false,
        color: "default",
        fill: "default",
      },
    };
    annotationTextStyle = (source?: Dynamic): Dynamic => {
      let value: Dynamic =
        PlatformFileContentNoteTitle1Config[source.kind ?? "note"];
      return {
        size: source.size ?? value.size,
        kind: value.kind,
        bold: source.bold ?? value.bold,
        italic: source.italic ?? value.italic,
        color: source.color ?? "default",
        fill: value.kind === "note" ? (source.fill ?? "default") : "default",
      };
    };
    PlatformFileContentHas = (
      beforeAnnotations?: Dynamic,
      afterAnnotations?: Dynamic,
      selectedIds?: Dynamic,
    ): Dynamic => {
      for (let value of afterAnnotations as Dynamic) {
        let previousAnnotation: Dynamic = selectedIds.has(value.id)
          ? beforeAnnotations.find((annotation?: Dynamic): Dynamic => annotation.id === value.id)
          : undefined;
        if (
          previousAnnotation &&
          !isShapeAnnotation(previousAnnotation) &&
          !isShapeAnnotation(value) &&
          previousAnnotation.kind === value.kind &&
          (previousAnnotation.maxW !== value.maxW || previousAnnotation.maxH !== value.maxH)
        )
          return [previousAnnotation, value];
      }
      return null;
    };
    PlatformFileContentMax = (
      isTitle?: Dynamic,
      maxHeight?: Dynamic,
      width?: Dynamic,
      fontSize?: Dynamic,
    ): Dynamic =>
      isTitle
        ? maxHeight === undefined
          ? 1 / 0
          : Math.max(
              maxHeight,
              Math.ceil(
                (PlatformFileContentLh(1, fontSize) *
                  Math.min(maxFittedAnnotationFontSize, fontSize)) /
                  fontSize,
              ),
            )
        : Math.max(
            maxHeight ?? defaultAnnotationMaxHeight(width, fontSize),
            PlatformFileContentLh(1, fontSize),
          );
    PlatformFileContentKind = (source?: Dynamic): Dynamic =>
      PlatformFileContentMax(
        source.kind === "title1",
        source.maxH,
        source.w,
        annotationTextStyle(source).size,
      );
    PlatformFileContentMaxW = (annotation?: Dynamic): Dynamic =>
      annotation.maxW ?? defaultTextAnnotationMaxWidth;
    PlatformFileContentHandler = (
      kind?: Dynamic,
      requestedMaxWidth?: Dynamic,
      requestedMaxHeight?: Dynamic,
    ): Dynamic => {
      let callback: Dynamic = (candidate?: Dynamic): Dynamic =>
          typeof candidate == "number" && Number.isFinite(candidate)
            ? Math.round(
                clampNumber(
                  candidate,
                  minAnnotationDimensionLimit,
                  maxAnnotationDimensionLimit,
                ),
              )
            : undefined,
        [maxWidth, maxHeight]: Dynamic = [
          kind === "title1" ? callback(requestedMaxWidth) : undefined,
          callback(requestedMaxHeight),
        ];
      return {
        ...(maxWidth !== undefined
          ? {
              maxW: maxWidth,
            }
          : {}),
        ...(maxHeight !== undefined
          ? {
              maxH: maxHeight,
            }
          : {}),
      };
    };
    annotationStyleOverrides = (source?: Dynamic): Dynamic => {
      let value: Dynamic = PlatformFileContentNoteTitle1Config[source.kind];
      return {
        ...(source.kind === "title1"
          ? {
              kind: "title1",
            }
          : {}),
        ...(source.size !== value.size
          ? {
              size: source.size,
            }
          : {}),
        ...(source.bold !== value.bold
          ? {
              bold: source.bold,
            }
          : {}),
        ...(source.italic !== value.italic
          ? {
              italic: source.italic,
            }
          : {}),
        ...(source.color !== "default"
          ? {
              color: source.color,
            }
          : {}),
        ...(source.kind === "note" && source.fill !== "default"
          ? {
              fill: source.fill,
            }
          : {}),
      };
    };
    validCoverArtboard = (coverPath?: Dynamic, artboards?: Dynamic): Dynamic =>
      typeof coverPath == "string" &&
      artboards.some((artboard?: Dynamic): Dynamic => artboard.file === coverPath)
        ? coverPath
        : undefined;
    artboardNameWithoutExtension = (filePath?: Dynamic): Dynamic =>
      (filePath.split("/").pop() ?? filePath).replace(/\.dc\.html$/, "");
    defaultArtboardWidth = 800;
    defaultArtboardHeight = 600;
    newArtboardGap = 80;
    defaultTextAnnotationWidth = 240;
    minTextAnnotationWidth = 120;
    maxTextAnnotationWidth = 2e3;
    defaultTextAnnotationMaxWidth = 2e3;
    minAnnotationDimensionLimit = 24;
    maxAnnotationDimensionLimit = 8e3;
    maxFittedAnnotationFontSize = 24;
    PlatformFileContentMin = (fontSize?: Dynamic): Dynamic => ({
      lh: Math.min(1.45, Math.max(1.1, 1.45 - (fontSize - 14) * 0.006)),
      px: Math.round(12 + (fontSize - 14) * 0.2),
      py: Math.round(10 + (fontSize - 14) * 0.11),
      ls: fontSize >= 64 ? "-0.02em" : fontSize >= 36 ? "-0.01em" : undefined,
    });
    PlatformFileContentLh = (lineCount?: Dynamic, fontSize?: Dynamic): Dynamic => {
      let value: Dynamic = PlatformFileContentMin(fontSize);
      return Math.round(lineCount * fontSize * value.lh) + 2 * value.py;
    };
    defaultAnnotationMaxHeight = (width?: Dynamic, fontSize?: Dynamic): Dynamic =>
      Math.max(Math.round((width * 4) / 3), PlatformFileContentLh(6, fontSize));
    PlatformFileContentMatch = (
      text?: Dynamic,
      fontSize?: Dynamic,
    ): Dynamic => {
      let wideCharacterCount: Dynamic = (
          text.match(
            /[\u1100-\u11FF\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/g,
          ) ?? []
        ).length,
        uppercaseCount: Dynamic = (text.match(/[A-Z]/g) ?? []).length;
      return Math.ceil(
        (wideCharacterCount +
          uppercaseCount * 0.75 +
          ([...text].length - wideCharacterCount - uppercaseCount) * 0.55) *
          fontSize,
      );
    };
    PlatformFileContentL = (text?: Dynamic, fontSize?: Dynamic): Dynamic =>
      fontSize < PlatformFileContentSMLConfig.l
        ? defaultTextAnnotationWidth
        : Math.min(
            maxTextAnnotationWidth,
            Math.max(
              defaultTextAnnotationWidth,
              text
                .split(
                  `
`,
                )
                .reduce(
                  (maxWidth?: Dynamic, line?: Dynamic): Dynamic =>
                    Math.max(
                      maxWidth,
                      PlatformFileContentMatch(line, fontSize),
                    ),
                  0,
                ) + fontSize,
            ),
          );
    PlatformFileContentTest = (kind?: Dynamic): Dynamic =>
      typeof kind == "string" &&
      /^((title|heading|header)\d*|h[1-6])$/i.test(kind);
    maxAnnotationTextChars = 5e3;
    maxAnnotations = 200;
    minArtboardDimension = 40;
    minEmbeddedArtboardDimension = 120;
    minFramelessArtboardDimension = 8;
    maxCanvasItemDimension = 8e3;
    maxArtboardRadius = maxCanvasItemDimension / 2;
    maxCanvasCoordinate = 1e6;
    PlatformFileContentRectOvalLineConfig = {
      rect: [120, 120],
      oval: [96, 96],
      line: [160, 0],
      arrow: [160, 0],
      pen: [2, 2],
      image: [320, 240],
    };
    minShapeDimension = 2;
    minImageDimension = 16;
    parseAnnotationImageUrl = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "string" &&
      (/^\/?_blob\/[0-9a-f]{32}$/.test(candidate) ||
        /^\.\/[^\/\\:%?#"'\u0000-\u001f]{1,200}\.(png|jpe?g|gif|webp|svg|avif)$/i.test(
          candidate,
        ) ||
        /^blob:https?:\/\/[A-Za-z0-9.:-]{1,80}\/[0-9a-f-]{36}$/.test(candidate))
        ? candidate
        : null;
    parseAnnotationVideoUrl = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "string" &&
      (/^\/?_blob\/[0-9a-f]{32}$/.test(candidate) ||
        /^blob:https?:\/\/[A-Za-z0-9.:-]{1,80}\/[0-9a-f-]{36}$/.test(candidate))
        ? candidate
        : null;
    maxPenPathChars = 24e3;
    sanitizePenPath = (items?: Dynamic): Dynamic => {
      if (typeof items != "string" || items.length > maxPenPathChars)
        return null;
      let value: Dynamic = items.trim();
      return /^M ?\d+(\.\d+)?[ ,]\d+(\.\d+)?( ?([ML] ?\d+(\.\d+)?[ ,]\d+(\.\d+)?|C ?\d+(\.\d+)?([ ,]\d+(\.\d+)?){5}))+$/.test(
        value,
      ) &&
        (value.match(/\d+(\.\d+)?/g) ?? []).every(
          (coordinate?: Dynamic): Dynamic =>
            Number(coordinate) <= maxCanvasItemDimension,
        )
        ? value
        : null;
    };
    clampNumber = (
      valueToClamp?: Dynamic,
      min?: Dynamic,
      max?: Dynamic,
    ): Dynamic => Math.min(max, Math.max(min, valueToClamp));
    maxCanvasLabelChars = 120;
    PlatformFileContentSlice = (candidate?: Dynamic): Dynamic => {
      if (typeof candidate != "string") return;
      let value: Dynamic = candidate
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim()
        .slice(0, maxCanvasLabelChars);
      return value.length > 0 ? value : undefined;
    };
    normalizeAnnotationText = (candidate?: Dynamic): Dynamic =>
      typeof candidate != "string"
        ? ""
        : candidate
            .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
            .slice(0, maxAnnotationTextChars);
    parseCanvasItemId = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "string" && /^[A-Za-z0-9_-]{1,40}$/.test(candidate)
        ? candidate
        : null;
    normalizeAnnotationFontSize = (
      requestedSize?: Dynamic,
      fallbackSize?: Dynamic,
    ): Dynamic =>
      typeof requestedSize == "string" &&
      Object.hasOwn(PlatformFileContentSMLConfig, requestedSize)
        ? PlatformFileContentSMLConfig[requestedSize]
        : typeof requestedSize != "number" || !Number.isFinite(requestedSize)
          ? fallbackSize
          : Math.round(
              clampNumber(
                requestedSize,
                minAnnotationFontSize,
                maxAnnotationFontSize,
              ),
            );
    normalizeAnnotationColorName = (color?: Dynamic): Dynamic =>
      typeof color == "string" &&
      PlatformFileContentGrayRedOrangeValues.includes(color)
        ? color
        : "default";
    normalizeAnnotationFillName = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "string" &&
      PlatformFileContentGrayRedOrangeValuesAlias.includes(candidate)
        ? candidate
        : "default";
    normalizeAnnotationKind = (kind?: Dynamic): Dynamic =>
      kind === "rect" ||
      kind === "oval" ||
      kind === "line" ||
      kind === "arrow" ||
      kind === "pen" ||
      kind === "image"
        ? kind
        : null;
    normalizeDesignLaunch = (
      rawLaunch?: Dynamic,
      artboards?: Dynamic,
      items?: Dynamic,
    ): Dynamic => {
      if (rawLaunch === null || typeof rawLaunch != "object") return;
      let view: Dynamic = rawLaunch.view;
      if (view === "canvas") {
        let page: Dynamic = rawLaunch.page;
        return typeof page == "string" &&
          items !== undefined &&
          items.length > 1 &&
          items.some((entry?: Dynamic): Dynamic => entry.id === page)
          ? {
              view: "canvas",
              page: page,
            }
          : {
              view: "canvas",
            };
      }
      if (view === "focused") {
        let file: Dynamic = rawLaunch.file;
        if (
          typeof file == "string" &&
          artboards.some((artboard?: Dynamic): Dynamic => artboard.file === file)
        )
          return {
            view: "focused",
            file: file,
          };
      }
    };
    PlatformFileContentScriptDataPropsPattern =
      /<script\b(?:\s+(?!data-props\b)[^\s"'=<>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>]+))?)*\s+data-props\s*=\s*(?:"([^"]*)"|'([^']*)')/i;
    artboardDisplayName = (artboard?: Dynamic): Dynamic =>
      artboard.title ?? artboard.file.replace(/\.dc\.html$/, "");
    annotationKindCategory = (source?: Dynamic): Dynamic =>
      source.kind === undefined || source.kind === "title1"
        ? "note"
        : source.kind === "image"
          ? "image"
          : "shape";
    DesignValue = "design";
    MetaValue = "meta";
    designMetadataPath = DesignValue + "/" + MetaValue;
    SourceValue = "source";
    designSourceDocumentPath = DesignValue + "/" + SourceValue;
    BoardsValue = "boards";
    FilesValue = "files";
    NotesValue = "notes";
    maxSyncedArtboardBytes = 240 * 1024;
    maxSyncedFileBytes = 180 * 1024;
    maxCollectionBytes = 2 * 1024 * 1024;
    maxInlineArtboardBytes =
      maxSyncedArtboardBytes - 2048;
    PlatformFileContentWebpAvifPattern =
      /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;
    PlatformFileContentNodeModulesPattern =
      /(^|\/)(node_modules\/.*|(package(-lock)?|npm-shrinkwrap|composer|bower|cypress|jasmine|cdk|railway|claudia|cloudbuild|renovate|biome|app|nodemon|turbo|vercel|now|firebase|nx|project|workspace|angular|lerna|rush)\.json|wrangler\.jsonc?|(ts|js)config(\.[^/]*)?\.json|deno\.jsonc?|[^/]*\.(config|conf|workspace|mix)(\.[^/]*)?\.([cm]?[jt]sx?|json)|(gulp|grunt|jake|danger|plop|broc)file(\.[^/]*)?\.[cm]?[jt]sx?|(gatsby-(config|node|ssr|browser)|ember-cli-build|(brunch|truffle|bs|workbox|sw-precache|medusa|migrate-mongo)-config|truffle|knexfile|testem|cucumber|wallaby|serverless|ormconfig|electron-builder|nightwatch|newrelic|lighthouserc|codegen|setup(Tests|Proxy))(\.[^/]*)?\.([cm]?[jt]sx?|json)|((test|tests|spec|cypress|__tests__|__mocks__)\/.*|([^/]*[._-])?(test|spec)+|(test|spec)[._-][^/]*|[^/]*\.(cy|stories))\.[cm]?[jt]sx?)$/i;
    PlatformFileContentJsonPattern = /\.(css|m?js|jsx|tsx|json)$/i;
    maxProjectPathChars = 300;
    PlatformFileContentAZaZAZaZPattern =
      /^[A-Za-z0-9_](?:[A-Za-z0-9 ._-]*[A-Za-z0-9_-])?$/;
    reservedProjectSegmentPattern =
      /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    ProjectValue = "project/";
    declarationPathPattern = /\.d\.ts$/i;
    maxDeclarationFileBytes = 2 * 1024 * 1024;
    PlatformFileContentAZaZPattern = /[A-Za-z0-9_.-]/;
    PlatformFileContentTextEncoder = new TextEncoder();
    PlatformFileContentXYWValues = [
      "x",
      "y",
      "w",
      "h",
      "title",
      "expand",
      "print",
      "paper",
      "page",
      "is_interactive",
      "frameless",
      "guides",
      "radius",
    ];
    ClaudeDesignValue = "claude-design";
    maxSourceUrlChars = 2048;
    sourceProjectIdPattern = /^[A-Za-z0-9_-]{1,64}$/;
    DesignPValue = "/design/p/";
    zonedDateTimePattern =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/;
    PlatformFileContentFilesValue = PlatformFileContentFilesBytesConfig.files;
    defaultDocumentFileBytes = 2 * 1024 * 1024;
    maxEmbeddedFilePathChars = 300;
    designContentEncoder = new TextEncoder();
    documentKvEncoder = new TextEncoder();
    FileValue = "file/";
    PlatformFileContentOverPerFilePattern =
      /over the (\d+(?:\.\d+)?) MiB per-file cap — (.*)$/;
    projectFileKey = (path?: Dynamic): Dynamic => `file/${path}`;
    PlatformFileContentAlias = null;
    AppifactValue = "appifact/";
    PlatformFileContentBeforeWriteVersionOfState = null;
    PlatformFileContentController = class extends Error {
      constructor(filePath: Dynamic) {
        super(`file not found: ${filePath}`);
      }
    };
    assetUrlByFilePath = new Map();
    imageFilePathPattern =
      /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;
    projectFilesystem = {
      async readdir(directoryPath: Dynamic): Promise<Dynamic> {
        let value: Dynamic = stripAppifactPathPrefix(directoryPath),
          directoryKeyPrefix: Dynamic = projectFileKey(
            value ? `${value}/` : "",
          );
        return (await getKvClient().list(directoryKeyPrefix)).map(
          (key?: Dynamic): Dynamic => ({
            name: key.slice(directoryKeyPrefix.length),
            isFile: true,
          }),
        );
      },
      async readFile(filePath: Dynamic): Promise<Dynamic> {
        let value: Dynamic = await getKvClient().get(
          projectFileKey(stripAppifactPathPrefix(filePath)),
        );
        if (value == null) throw new PlatformFileContentController(filePath);
        return value;
      },
      async readFileWithVersion(filePath: Dynamic): Promise<Dynamic> {
        let value: Dynamic = await getKvClient().get(
          projectFileKey(stripAppifactPathPrefix(filePath)),
        );
        if (value == null) throw new PlatformFileContentController(filePath);
        return {
          content: value,
          version: PlatformFileContentBeforeWriteVersionOfState?.versionOf(
            stripAppifactPathPrefix(filePath),
          ),
          isBase64: false,
        };
      },
      async writeFile(
        filePath: Dynamic,
        content: Dynamic,
        encoding: Dynamic,
      ): Promise<Dynamic> {
        let value: Dynamic = stripAppifactPathPrefix(filePath);
        if (encoding === "base64") {
          await getKvClient().set(projectFileKey(value), content);
          let contentType: Dynamic = imageFileMimeType(value);
          registerAssetUrl(value, `data:${contentType};base64,${content}`);
          return;
        }
        let writeDecision: Dynamic =
          PlatformFileContentBeforeWriteVersionOfState === null
            ? "write"
            : PlatformFileContentBeforeWriteVersionOfState.beforeWrite(
                value,
                content,
                undefined,
              );
        if (writeDecision === "skip") return;
        let contentToWrite: Dynamic =
          typeof writeDecision == "object" ? writeDecision.content : content;
        await getKvClient().set(projectFileKey(value), contentToWrite);
        await PlatformFileContentBeforeWriteVersionOfState?.afterWrite(
          value,
          contentToWrite,
          false,
        );
      },
      async writeFileVersioned(
        filePath: Dynamic,
        content: Dynamic,
        writeOptions: Dynamic,
      ): Promise<Dynamic> {
        if (
          PlatformFileContentBeforeWriteVersionOfState === null ||
          writeOptions.encoding === "base64"
        ) {
          await projectFilesystem.writeFile(filePath, content, writeOptions.encoding);
          return {
            version: undefined,
          };
        }
        let value: Dynamic = stripAppifactPathPrefix(filePath),
          writeDecision: Dynamic =
            PlatformFileContentBeforeWriteVersionOfState.beforeWrite(
              value,
              content,
              writeOptions.baseline,
            );
        if (writeDecision === "skip")
          return {
            version:
              PlatformFileContentBeforeWriteVersionOfState.versionOf(value),
          };
        let contentToWrite: Dynamic =
          typeof writeDecision == "object" ? writeDecision.content : content;
        await getKvClient().set(projectFileKey(value), contentToWrite);
        return {
          version:
            await PlatformFileContentBeforeWriteVersionOfState.afterWrite(
              value,
              contentToWrite,
              true,
            ),
        };
      },
    };
    PlatformFileContentFreezeValue = Object.freeze([]);
    PlatformFileContentFreezeValueAlias = PlatformFileContentFreezeValue;
    roomPeerListeners = new Set();
    roomPeerSubscriptionStarted = false;
    PlatformFileContentCurrentState = null;
    roomPeersStore = {
      getSnapshot: (): Dynamic => PlatformFileContentFreezeValueAlias,
      subscribe(listener: Dynamic): Dynamic {
        roomPeerListeners.add(listener);
        subscribeRoomPeers();
        return (): Dynamic => roomPeerListeners.delete(listener);
      },
    };
    embedStorePrefixPattern = /^(?:[A-Za-z0-9_-]{1,80}\/){1,4}$/;
    embedMemoryScopePattern = /^[A-Za-z0-9_-]{1,80}$/;
    pendingEmbeddedWrites = new Set();
    embeddedWritesTracked = false;
    embeddedEditorFrozen = false;
    embeddedFreezeRequested = false;
    embeddedWriteFailed = false;
    embeddedEditorSettler = null;
    embeddedPresenceListener = null;
    embeddedEditorSilencer = null;
    PlatformFileContentDelayMs = 60;
    embeddedSettleTimeoutMs = 6e4;
    embeddedFlushBufferMs = 500;
  };
}

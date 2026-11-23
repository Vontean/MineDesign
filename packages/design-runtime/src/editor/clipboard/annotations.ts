/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardArtboardsBlobBlobPattern, ClipboardArtboardsDataImagePattern, ClipboardArtboardsLimit, ClipboardArtboardsResolvedValue, maxAssetBytes } from "./artboards";
import { sanitizePastedHtml } from "./html-sanitization";
import { ClipboardPastePlanningKind } from "./paste-planning";
import { parseDcHtmlDocument } from "../html/dc-document";
import { escapeHtml } from "../html/escaping";
import { annotationVisibleBounds, blankDcDocument, PlatformFileContentBackgroundBackgroundColorOpacityValues, parseAnnotationImageUrl as normalizePictureSource } from "../../platform/file-content";

var ClipboardAnnotationsWebpAvifPattern: Dynamic;
var ClipboardAnnotationsDataImagePattern: Dynamic;
var ClipboardAnnotationsHelmetScHelmetPattern: Dynamic;
var ClipboardAnnotationsTest: Dynamic;
var ClipboardAnnotationsResolvedValue: Dynamic;
var maxAnnotationJsonBytes: Dynamic;
var maxAnnotationClipboardBytes: Dynamic;
var ClipboardAnnotationsLimit: Dynamic;
var ClipboardAnnotationsRectOvalLineValues: Dynamic;
var ClipboardAnnotationsIncludes: Dynamic;
var ClipboardAnnotationsGetLength: Dynamic;
var isNoteOrTitleAnnotation: Dynamic;
var normalizeBlobReference: Dynamic;
var strictDataImagePattern: Dynamic;
var isSupportedDataImage: Dynamic;
var ClipboardAnnotationsIdKindXValues: Dynamic;
var ClipboardAnnotationsSrcAltValues: Dynamic;
var maxCssValueLength: Dynamic;
var ClipboardAnnotationsCharCodeAt: Dynamic;
function blankArtboardBody(clipboardPayload?: Dynamic): Dynamic {
  let blankDocument: Dynamic = blankDcDocument(),
    stageStart: Dynamic = blankDocument.indexOf('<section class="stage"'),
    stageEnd: Dynamic = blankDocument.indexOf("</section>", stageStart) + 10;
  if (stageStart < 0 || stageEnd < stageStart)
    throw new Error("blank artboard source has no empty stage");
  let insertStageContent: Dynamic = (stageHtml?: Dynamic): Dynamic =>
      blankDocument.slice(0, stageStart) + stageHtml + blankDocument.slice(stageEnd),
    artboards: Dynamic = clipboardPayload.artboards.map(
      (artboard?: Dynamic): Dynamic => ({
        ...artboard,
        src: insertStageContent(
          ClipboardAnnotationsTest(
            parseDcHtmlDocument(artboard.src)?.template ??
              artboard.src,
          ),
        ),
      }),
    ),
    imageFiles: Dynamic = Object.fromEntries(
      Object.entries(clipboardPayload.files).filter(
        ([filePath]: Dynamic): Dynamic =>
          ClipboardAnnotationsWebpAvifPattern.test(filePath),
      ),
    ),
    imageAssets: Dynamic = Object.fromEntries(
      Object.entries(clipboardPayload.assets).filter(
        ([, assetData]: Dynamic): Dynamic =>
          ClipboardAnnotationsDataImagePattern.test(assetData),
      ),
    );
  return {
    v: 1,
    artboards: artboards,
    files: imageFiles,
    assets: imageAssets,
  };
}
function annotationImageReferences(annotations?: Dynamic): Dynamic {
  return annotations
    .flatMap(
      (source?: Dynamic): Dynamic =>
        source.kind === "image" &&
        source.video === undefined &&
        normalizeBlobReference(source.src) !== null
          ? [source.src]
          : [],
    )
    .slice(0, ClipboardAnnotationsLimit);
}
function annotationClipboardEntries(
  items?: Dynamic,
  pasteOrigin?: Dynamic,
  maxBytes: Dynamic = ClipboardArtboardsResolvedValue,
  enforceLimits: Dynamic = false,
  assetSource?: Dynamic,
): Dynamic {
  let skipCounts: Dynamic = {
      notRead: 0,
      cannot: 0,
      noRoom: 0,
      overCap: 0,
    },
    isVideoImage: Dynamic = (source?: Dynamic): Dynamic =>
      source.kind === "image" && source.video !== undefined,
    copyableAnnotations: Dynamic = items
      .filter(
        (source?: Dynamic): Dynamic =>
          ClipboardAnnotationsIncludes(source.kind) !== null &&
          !isVideoImage(source),
      )
      .map(({ page: page, ...props }: Dynamic): Dynamic => props),
    totalBytes: Dynamic = copyableAnnotations.reduce(
      (runningTotal?: Dynamic, annotation?: Dynamic): Dynamic =>
        runningTotal + ClipboardAnnotationsGetLength(annotation),
      0,
    ),
    tooLargeReason: Dynamic =
      totalBytes > maxAnnotationJsonBytes || totalBytes > maxBytes
        ? "budget"
        : enforceLimits &&
            ClipboardPastePlanningKind(
              copyableAnnotations.filter(isNoteOrTitleAnnotation),
            )
          ? "bounds"
          : false;
  if (tooLargeReason)
    return {
      fields: {
        stayed: copyableAnnotations.length,
      },
      tooLarge: tooLargeReason,
      assets: {},
      left: skipCounts,
    };
  let collectedAssets: Dynamic = {},
    remainingBytes: Dynamic = maxBytes - totalBytes,
    assetCount: Dynamic = Object.keys(assetSource?.assets ?? {}).length,
    imageCount: Dynamic = 0,
    readAttempts: Dynamic = 0,
    isOutOfRoom: Dynamic = false,
    keptAnnotations: Dynamic = copyableAnnotations.flatMap((source?: Dynamic): Dynamic => {
      if (source.kind !== "image") return [source];
      let blobRef: Dynamic = normalizeBlobReference(source.src);
      if (blobRef === null) skipCounts.cannot++;
      else if (enforceLimits && ++imageCount > ClipboardAnnotationsLimit) skipCounts.overCap++;
      else {
        let existingAsset: Dynamic = assetSource?.assets[blobRef] ?? collectedAssets[blobRef],
          assetContent: Dynamic =
            existingAsset ??
            (!isOutOfRoom &&
            readAttempts < ClipboardAnnotationsLimit &&
            assetCount + readAttempts < ClipboardArtboardsLimit
              ? assetSource?.read(source.src)
              : "");
        if (assetContent === undefined) {
          skipCounts.notRead++;
          readAttempts++;
        } else if (assetContent === "") skipCounts.noRoom++;
        else if (
          assetContent.length > maxAssetBytes ||
          !isSupportedDataImage(assetContent)
        )
          skipCounts.cannot++;
        else if (existingAsset === undefined && assetContent.length > remainingBytes) {
          skipCounts.noRoom++;
          isOutOfRoom = true;
        } else {
          existingAsset === undefined &&
            ((collectedAssets[blobRef] = assetContent),
            (remainingBytes -= assetContent.length),
            assetCount++);
          return [
            {
              ...source,
              src: blobRef,
            },
          ];
        }
      }
      return [];
    }),
    leftOutCount: Dynamic = items.length - keptAnnotations.length,
    videoCount: Dynamic = items.filter(isVideoImage).length,
    visibleBounds: Dynamic = keptAnnotations.map(annotationVisibleBounds),
    origin: Dynamic = pasteOrigin ?? {
      x: Math.min(...visibleBounds.map((bounds?: Dynamic): Dynamic => bounds.x)),
      y: Math.min(...visibleBounds.map((bounds?: Dynamic): Dynamic => bounds.y)),
    },
    placements: Dynamic = keptAnnotations.map(
      (spec?: Dynamic, index?: Dynamic): Dynamic => ({
        spec: spec,
        dx: visibleBounds[index].x - origin.x,
        dy: visibleBounds[index].y - origin.y,
      }),
    );
  return {
    fields: {
      ...(placements.length > 0
        ? {
            annotations: placements,
          }
        : {}),
      ...(leftOutCount > 0
        ? {
            leftOut: leftOutCount,
          }
        : {}),
      ...(videoCount > 0
        ? {
            videos: videoCount,
          }
        : {}),
    },
    tooLarge: false,
    assets: collectedAssets,
    left: skipCounts,
  };
}
function normalizeClipboardAnnotation(
  annotation?: Dynamic,
  includeImageFields: Dynamic = false,
): Dynamic {
  let isAllowedScalar: Dynamic = (fieldValue?: Dynamic): Dynamic =>
      typeof fieldValue == "boolean" ||
      (typeof fieldValue == "number" && Number.isFinite(fieldValue)) ||
      (typeof fieldValue == "string" &&
        fieldValue.length <= ClipboardAnnotationsResolvedValue),
    normalized: Dynamic = {},
    totalStringLength: Dynamic = 0;
  for (let field of (includeImageFields
    ? [
        ...ClipboardAnnotationsIdKindXValues,
        ...ClipboardAnnotationsSrcAltValues,
      ]
    : ClipboardAnnotationsIdKindXValues) as Dynamic)
    if (Object.hasOwn(annotation, field)) {
      if (!isAllowedScalar(annotation[field])) return null;
      normalized[field] = annotation[field];
      typeof annotation[field] == "string" && (totalStringLength += annotation[field].length);
    }
  if (totalStringLength > ClipboardAnnotationsResolvedValue) return null;
  if (includeImageFields && Object.hasOwn(annotation, "crop")) {
    let crop: Dynamic = annotation.crop;
    if (typeof crop != "object" || crop === null || Array.isArray(crop))
      return null;
    let [zoom, x, y]: Dynamic = ["zoom", "x", "y"].map(
      (property?: Dynamic): Dynamic =>
        Object.hasOwn(crop, property) ? crop[property] : undefined,
    );
    if (
      ![zoom, x, y].every(
        (coordinate?: Dynamic): Dynamic =>
          typeof coordinate == "number" && Number.isFinite(coordinate),
      )
    )
      return null;
    normalized.crop = {
      zoom: zoom,
      x: x,
      y: y,
    };
  }
  if (!Object.hasOwn(annotation, "css")) return normalized;
  let css: Dynamic = annotation.css;
  if (typeof css != "object" || css === null || Array.isArray(css))
    return null;
  let normalizedCss: Dynamic = {};
  for (let cssProperty of PlatformFileContentBackgroundBackgroundColorOpacityValues as Dynamic) {
    if (!Object.hasOwn(css, cssProperty)) continue;
    let cssValue: Dynamic = css[cssProperty];
    if (
      typeof cssValue != "string" ||
      cssValue.length > maxCssValueLength ||
      ClipboardAnnotationsCharCodeAt(cssValue)
    )
      return null;
    normalizedCss[cssProperty] = cssValue;
  }
  return {
    ...normalized,
    css: normalizedCss,
  };
}
function replaceClipboardPictureSource(
  placement?: Dynamic,
  source?: Dynamic,
): Dynamic {
  let blobRef: Dynamic = normalizePictureSource(source);
  return blobRef === null
    ? null
    : {
        spec: {
          ...placement.spec,
          src: blobRef,
        },
        dx: placement.dx,
        dy: placement.dy,
        w: placement.w,
        h: placement.h,
        order: placement.order,
      };
}
export {
  annotationClipboardEntries,
  annotationImageReferences,
  blankArtboardBody,
  ClipboardAnnotationsCharCodeAt,
  ClipboardAnnotationsDataImagePattern,
  strictDataImagePattern,
  ClipboardAnnotationsGetLength,
  ClipboardAnnotationsHelmetScHelmetPattern,
  ClipboardAnnotationsIdKindXValues,
  ClipboardAnnotationsIncludes,
  isNoteOrTitleAnnotation,
  ClipboardAnnotationsLimit,
  maxCssValueLength,
  ClipboardAnnotationsRectOvalLineValues,
  ClipboardAnnotationsResolvedValue,
  maxAnnotationJsonBytes,
  maxAnnotationClipboardBytes,
  ClipboardAnnotationsSrcAltValues,
  ClipboardAnnotationsTest,
  normalizeBlobReference,
  isSupportedDataImage,
  ClipboardAnnotationsWebpAvifPattern,
  normalizeClipboardAnnotation,
  replaceClipboardPictureSource,
};
export function installEditorClipboardAnnotations(): () => void {
  return () => {
    ClipboardAnnotationsWebpAvifPattern = /\.(png|jpe?g|gif|webp|avif|bmp)$/i;
    ClipboardAnnotationsDataImagePattern =
      /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp);/i;
    ClipboardAnnotationsHelmetScHelmetPattern =
      /<\/?(?:helmet|sc-helmet|x-import|dc-import|script)\b/i;
    ClipboardAnnotationsTest = (html?: Dynamic): Dynamic => {
      let sanitizedHtml: Dynamic = sanitizePastedHtml(html);
      return ClipboardAnnotationsHelmetScHelmetPattern.test(sanitizedHtml)
        ? escapeHtml(html)
        : sanitizedHtml;
    };
    ClipboardAnnotationsResolvedValue = 64 * 1024;
    maxAnnotationJsonBytes = 1024 * 1024;
    maxAnnotationClipboardBytes =
      2 * maxAnnotationJsonBytes;
    ClipboardAnnotationsLimit = 20;
    ClipboardAnnotationsRectOvalLineValues = [
      "rect",
      "oval",
      "line",
      "arrow",
      "pen",
    ];
    ClipboardAnnotationsIncludes = (kind?: Dynamic): Dynamic =>
      kind === undefined || kind === "note"
        ? "note"
        : kind === "title1" ||
            kind === "image" ||
            ClipboardAnnotationsRectOvalLineValues.includes(kind)
          ? kind
          : null;
    ClipboardAnnotationsGetLength = (entry?: Dynamic): Dynamic =>
      JSON.stringify(entry).length;
    isNoteOrTitleAnnotation = (source?: Dynamic): Dynamic =>
      ["note", "title1"].includes(
        ClipboardAnnotationsIncludes(source.kind) ?? "",
      );
    normalizeBlobReference = (src?: Dynamic): Dynamic =>
      /^\/?_blob\/[0-9a-f]{32}$/.test(src)
        ? src.replace(/^\//, "")
        : ClipboardArtboardsBlobBlobPattern.test(src)
          ? src
          : null;
    strictDataImagePattern =
      /^data:image\/(?:png|jpeg|gif|webp|avif|bmp);/;
    isSupportedDataImage = (src?: Dynamic): Dynamic =>
      ClipboardArtboardsDataImagePattern.test(src) &&
      strictDataImagePattern.test(src);
    ClipboardAnnotationsIdKindXValues = [
      "id",
      "kind",
      "x",
      "y",
      "w",
      "h",
      "x2",
      "y2",
      "headStart",
      "headEnd",
      "d",
      "text",
      "size",
      "bold",
      "italic",
      "color",
      "fill",
      "rotate",
      "flipX",
      "flipY",
      "maxW",
      "maxH",
    ];
    ClipboardAnnotationsSrcAltValues = ["src", "alt"];
    maxCssValueLength = 1200;
    ClipboardAnnotationsCharCodeAt = (text?: Dynamic): Dynamic => {
      let letterRun: Dynamic = 0;
      for (let position: Dynamic = 0; position < text.length; position++) {
        let charCode: Dynamic = text.charCodeAt(position);
        letterRun =
          (charCode >= 97 && charCode <= 122) ||
          (charCode >= 65 && charCode <= 90) ||
          charCode === 45
            ? letterRun + 1
            : 0;
        if (letterRun > 32) return true;
      }
      return false;
    };
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardAnnotationsGetLength, ClipboardAnnotationsIncludes, isNoteOrTitleAnnotation, ClipboardAnnotationsResolvedValue, maxAnnotationJsonBytes as totalContentLengthLimit, maxAnnotationClipboardBytes as totalSerializedLengthLimit, normalizeBlobReference as normalizeImageSource, normalizeClipboardAnnotation } from "./annotations";
import { maxOffset as maxOffsetLimit, ClipboardArtboardsMax } from "./artboards";
import { ClipboardStateHandler } from "./state";
import { validateStyleColor } from "../style-schema/color-and-font";
import { StyleSchemaShadowXYBlurConfig } from "../style-schema/shadow";
import { StyleSchemaValuesLimit } from "../style-schema/values";
import { annotationVisibleBounds, parseCanvasMetadata, maxAnnotations as maxAnnotationCount } from "../../platform/file-content";

var ClipboardPicturesObjectFitObjectPositionOpacityValues: Dynamic;
var ClipboardPicturesPattern: Dynamic;
var ClipboardPicturesJoin: Dynamic;
function isSafePictureShadow(shadow?: Dynamic): Dynamic {
  let isWithinRange: Dynamic = (partValue?: Dynamic, partName?: Dynamic): Dynamic =>
      Number(partValue) >= StyleSchemaShadowXYBlurConfig[partName].min &&
      Number(partValue) <= StyleSchemaShadowXYBlurConfig[partName].max,
    match: Dynamic = ClipboardPicturesPattern.exec(shadow);
  return (
    match !== null &&
    isWithinRange(match[1], "x") &&
    isWithinRange(match[2], "y") &&
    isWithinRange(match[3], "blur") &&
    isWithinRange(match[4], "spread") &&
    validateStyleColor(match[5]) !== undefined
  );
}
function normalizeClipboardPictureCss(
  picture?: Dynamic,
  keepCss?: Dynamic,
): Dynamic {
  let { css: css, ...specWithoutCss }: Dynamic = picture.spec;
  if (keepCss || css === undefined)
    return {
      picture: picture,
      plain: false,
    };
  let state: Dynamic = {};
  for (let propertyName of ClipboardPicturesObjectFitObjectPositionOpacityValues as Dynamic)
    css[propertyName] !== undefined && (state[propertyName] = css[propertyName]);
  for (let propertyName of ["background", "background-color"] as Dynamic)
    css[propertyName] !== undefined &&
      validateStyleColor(css[propertyName]) !== undefined &&
      (state[propertyName] = css[propertyName]);
  let boxShadow: Dynamic = ClipboardPicturesJoin(css["box-shadow"] ?? "");
  boxShadow !== "" && (state["box-shadow"] = boxShadow);
  let wasStripped: Dynamic =
    Object.keys(state).length < Object.keys(css).length ||
    state["box-shadow"] !== css["box-shadow"];
  return {
    picture: {
      ...picture,
      spec:
        Object.keys(state).length > 0
          ? {
              ...specWithoutCss,
              css: state,
            }
          : specWithoutCss,
    },
    plain: wasStripped,
  };
}
function parseAnnotationClipboard(rawClipboard?: Dynamic): Dynamic {
  if (typeof rawClipboard != "object" || rawClipboard === null) return null;
  let clipboard: Dynamic = rawClipboard,
    leftOutCount: Dynamic = ClipboardStateHandler(clipboard.leftOut),
    videoCount: Dynamic = Math.min(
      ClipboardStateHandler(clipboard.videos),
      leftOutCount,
    ),
    rawAnnotations: Dynamic = Array.isArray(clipboard.annotations)
      ? clipboard.annotations
      : [];
  if (rawAnnotations.length > maxAnnotationCount) return null;
  let totalLength: Dynamic = 0,
    contentLength: Dynamic = 0,
    imageCount: Dynamic = 0,
    seenIds: Dynamic = new Set(),
    acceptedIds: Dynamic = new Set(),
    entries: Dynamic = [],
    pictures: Dynamic = [];
  for (let [order, rawEntry] of rawAnnotations.entries() as Dynamic)
    try {
      if (typeof rawEntry != "object" || rawEntry === null) continue;
      let { spec: rawSpec, dx: dx, dy: dy }: Dynamic = rawEntry;
      if (
        typeof rawSpec != "object" ||
        rawSpec === null ||
        Array.isArray(rawSpec)
      )
        continue;
      let specRecord: Dynamic = rawSpec,
        kind: Dynamic = ClipboardAnnotationsIncludes(
          Object.hasOwn(specRecord, "kind") ? specRecord.kind : undefined,
        );
      if (
        kind === "image" &&
        (imageCount++,
        Object.hasOwn(specRecord, "video") ||
          typeof specRecord.src != "string" ||
          normalizeImageSource(specRecord.src) !==
            specRecord.src)
      )
        continue;
      let normalizedSpec: Dynamic =
        kind === null || seenIds.has(specRecord.id)
          ? null
          : normalizeClipboardAnnotation(
              specRecord,
              kind === "image",
            );
      if (normalizedSpec === null) continue;
      seenIds.add(specRecord.id);
      let serialized: Dynamic = JSON.stringify({
        annotations: [normalizedSpec],
      });
      if (
        (totalLength += serialized.length) >
        totalSerializedLengthLimit
      )
        return null;
      if (serialized.length > ClipboardAnnotationsResolvedValue)
        continue;
      let parsedSpec: Dynamic = parseCanvasMetadata(serialized, {})
        .annotations?.[0];
      if (
        parsedSpec === undefined ||
        (parsedSpec.kind ?? "note") !== kind ||
        acceptedIds.has(parsedSpec.id)
      )
        continue;
      if (
        (contentLength += ClipboardAnnotationsGetLength(parsedSpec)) >
        totalContentLengthLimit
      )
        return null;
      acceptedIds.add(parsedSpec.id);
      let bounds: Dynamic = annotationVisibleBounds(parsedSpec),
        state: Dynamic = {
          dx: ClipboardArtboardsMax(
            dx,
            -maxOffsetLimit,
          ),
          dy: ClipboardArtboardsMax(
            dy,
            -maxOffsetLimit,
          ),
          w: bounds.w,
          h: bounds.h,
          order: order,
        };
      if (parsedSpec.kind === "image") {
        let {
          src: assetSrc,
          video: video,
          page: page,
          ...imageSpec
        }: Dynamic = parsedSpec;
        pictures.push({
          spec: imageSpec,
          asset: assetSrc,
          ...state,
        });
      } else
        entries.push({
          spec: parsedSpec,
          ...state,
        });
    } catch {
      continue;
    }
  let unreadPictures: Dynamic = imageCount - pictures.length,
    unreadCount: Dynamic = rawAnnotations.length - entries.length - pictures.length - unreadPictures;
  return entries.length > 0 || pictures.length > 0 || unreadPictures > 0 || leftOutCount > 0
    ? {
        entries: entries,
        pictures: pictures,
        leftOut: leftOutCount,
        videos: videoCount,
        unread: unreadCount,
        unreadPictures: unreadPictures,
      }
    : null;
}
function clipboardPictureEntries(items?: Dynamic): Dynamic {
  let specEntries: Dynamic = items.filter(
    (entry?: Dynamic): Dynamic =>
      isNoteOrTitleAnnotation(entry.spec),
  );
  return {
    entries: specEntries,
    shapes: items.length - specEntries.length,
  };
}
export {
  clipboardPictureEntries,
  ClipboardPicturesJoin,
  ClipboardPicturesObjectFitObjectPositionOpacityValues,
  ClipboardPicturesPattern,
  isSafePictureShadow,
  normalizeClipboardPictureCss,
  parseAnnotationClipboard,
};
export function installEditorClipboardPictures(): () => void {
  return () => {
    ClipboardPicturesObjectFitObjectPositionOpacityValues = [
      "object-fit",
      "object-position",
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
    ];
    ClipboardPicturesPattern =
      /^(-?[\d.]{1,8})px (-?[\d.]{1,8})px ([\d.]{1,8})px (-?[\d.]{1,8})px (.{1,64})$/;
    ClipboardPicturesJoin = (shadows?: Dynamic): Dynamic =>
      shadows
        .split(/,\s*(?![^(]*\))/)
        .filter(isSafePictureShadow)
        .slice(0, StyleSchemaValuesLimit)
        .join(", ");
  };
}

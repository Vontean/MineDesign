/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardAnnotationsGetLength, ClipboardAnnotationsIncludes_2, ClipboardAnnotationsLimit } from "./annotations";
import { ClipboardArtboardsEncode, ClipboardArtboardsTextEncoder } from "./artboards";
import { parseClipboardAssets } from "./assets";
import { ClipboardFileTransferRegistry } from "./file-transfer";
import { clipboardPictureEntries, normalizeClipboardPictureCss, parseAnnotationClipboard } from "./pictures";
import { ClipboardStateHandler } from "./state";
import { noteRichTextCost } from "../notes/blocks";
import { PlatformFileContentResolvedValue_11 as fileSizeLimit, serializeCanvasMetadata } from "../../platform/file-content";

var ClipboardPastePlanningResolvedValue: Dynamic;
var ClipboardPastePlanningLimit: Dynamic;
var ClipboardPastePlanningConstant: Dynamic;
var ClipboardPastePlanningKind: Dynamic;
var ClipboardPastePlanningHandler: Dynamic;
var ClipboardPastePlanningIsArray: Dynamic;
var ClipboardPastePlanningAnnotations: Dynamic;
function buildAnnotationPaste(
  items?: Dynamic,
  pictureMode?: Dynamic,
  pictures: Dynamic = [],
): Dynamic {
  let normalizedPictures: Dynamic = pictures.map(
      (picture?: Dynamic): Dynamic =>
        normalizeClipboardPictureCss(picture, pictureMode),
    ),
    carriedPictures: Dynamic = normalizedPictures.map(
      (normalized?: Dynamic): Dynamic => normalized.picture,
    ),
    plainPictureIds: Dynamic = new Set(
      normalizedPictures
        .filter((normalized?: Dynamic): Dynamic => normalized.plain)
        .map((normalized?: Dynamic): Dynamic => normalized.picture.spec.id),
    );
  if (pictureMode)
    return {
      land: [...items],
      plain: 0,
      notesOut: 0,
      pictures: carriedPictures,
      plainPictures: plainPictureIds,
    };
  let noteItems: Dynamic = items.filter(
      (item?: Dynamic): Dynamic =>
        ClipboardAnnotationsIncludes_2(item.spec),
    ),
    exceedsNoteLimit: Dynamic = ClipboardPastePlanningKind(
      noteItems.map((item?: Dynamic): Dynamic => item.spec),
    ),
    plainCount: Dynamic = 0;
  return {
    land: items
      .filter(
        (item?: Dynamic): Dynamic =>
          !(
            exceedsNoteLimit && ClipboardAnnotationsIncludes_2(item.spec)
          ),
      )
      .map((item?: Dynamic): Dynamic => {
        if (!("css" in item.spec) || item.spec.css === undefined)
          return item;
        plainCount++;
        let { css: droppedCss, ...specWithoutCss }: Dynamic = item.spec;
        return {
          ...item,
          spec: specWithoutCss,
        };
      }),
    plain: plainCount,
    notesOut: exceedsNoteLimit ? noteItems.length : 0,
    pictures: carriedPictures,
    plainPictures: plainPictureIds,
  };
}
function parseAnnotationPaste(
  clipboardPayload?: Dynamic,
  fitsLimit: Dynamic = (): Dynamic => true,
): Dynamic {
  let parsed: Dynamic = parseAnnotationClipboard(clipboardPayload);
  if (parsed === null)
    return {
      land: null,
      say: ClipboardPastePlanningHandler(clipboardPayload)
        ? ClipboardFileTransferRegistry.tooMuchStayed
        : ClipboardFileTransferRegistry.unreadable,
    };
  let pictureEntries: Dynamic = clipboardPictureEntries(parsed.entries),
    entrySpecs: Dynamic = pictureEntries.entries.map(
      (entry?: Dynamic): Dynamic => entry.spec,
    ),
    normalizedPictures: Dynamic = parsed.pictures
      .slice(0, ClipboardAnnotationsLimit)
      .map(
        (picture?: Dynamic): Dynamic =>
          normalizeClipboardPictureCss(picture, false),
      ),
    carriedPictures: Dynamic = normalizedPictures.map(
      (normalized?: Dynamic): Dynamic => normalized.picture,
    ),
    unreadNote: Dynamic =
      parsed.unread > 0
        ? ClipboardFileTransferRegistry.alsoUnread(parsed.unread)
        : "";
  if (
    entrySpecs.length === 0 &&
    carriedPictures.length === 0 &&
    parsed.unreadPictures === 0
  )
    return {
      land: null,
      say:
        (pictureEntries.shapes > 0
          ? ClipboardFileTransferRegistry.onlyShapes +
            ClipboardFileTransferRegistry.alsoLeftOut(
              parsed.leftOut,
              parsed.videos,
            )
          : ClipboardFileTransferRegistry.onlyLeftOut(
              parsed.leftOut,
              parsed.videos,
            )) + unreadNote,
    };
  if (ClipboardPastePlanningKind(entrySpecs))
    return {
      land: null,
      say: ClipboardFileTransferRegistry.tooMuchUnasked,
    };
  if (!fitsLimit(entrySpecs))
    return {
      land: null,
      say: ClipboardFileTransferRegistry.wontFit,
      error: true,
    };
  let plainPictureIds: Dynamic = new Set(
      normalizedPictures
        .filter((normalized?: Dynamic): Dynamic => normalized.plain)
        .map((normalized?: Dynamic): Dynamic => normalized.picture.spec.id),
    ),
    buildSay: Dynamic = (
      specs?: Dynamic,
      landedEntries?: Dynamic,
      failedCount?: Dynamic,
    ): Dynamic =>
      ClipboardFileTransferRegistry.pasted(
        specs,
        parsed.leftOut,
        parsed.unread,
        pictureEntries.shapes,
        {
          videos: parsed.videos,
          failed: failedCount + parsed.unreadPictures,
          overCap: parsed.pictures.length - carriedPictures.length,
          plain: landedEntries.filter(
            (entry?: Dynamic): Dynamic => plainPictureIds.has(entry.spec.id),
          ).length,
        },
      );
  return carriedPictures.length === 0 && entrySpecs.length === 0
    ? {
        land: null,
        say: buildSay([], [], 0),
      }
    : carriedPictures.length === 0
      ? {
          land: pictureEntries.entries,
          say: buildSay(entrySpecs, [], 0),
        }
      : {
          land: pictureEntries.entries,
          say: "",
          pictures: {
            carried: carriedPictures,
            assets: parseClipboardAssets(clipboardPayload, carriedPictures),
            said: buildSay,
          },
        };
}
function normalizeAnnotationPasteOrigin(items?: Dynamic): Dynamic {
  let origin: Dynamic =
    items.length === 0
      ? {
          x: 0,
          y: 0,
        }
      : {
          x:
            0 -
            Math.min(...items.map((item?: Dynamic): Dynamic => item.dx)),
          y:
            0 -
            Math.min(...items.map((item?: Dynamic): Dynamic => item.dy)),
        };
  return {
    group: items.map(
      (item?: Dynamic): Dynamic => ({
        ...item,
        dx: item.dx + origin.x,
        dy: item.dy + origin.y,
      }),
    ),
    shift: origin,
  };
}
export {
  buildAnnotationPaste,
  ClipboardPastePlanningAnnotations,
  ClipboardPastePlanningConstant,
  ClipboardPastePlanningHandler,
  ClipboardPastePlanningIsArray,
  ClipboardPastePlanningKind,
  ClipboardPastePlanningLimit,
  ClipboardPastePlanningResolvedValue,
  normalizeAnnotationPasteOrigin,
  parseAnnotationPaste,
};
export function installEditorClipboardPastePlanning(): () => void {
  return () => {
    ClipboardPastePlanningResolvedValue = 128 * 1024;
    ClipboardPastePlanningLimit = 1e4;
    ClipboardPastePlanningConstant = 3;
    ClipboardPastePlanningKind = (specs?: Dynamic): Dynamic => {
      let textLength: Dynamic = 0,
        richTextCost: Dynamic = 0;
      for (let spec of specs as Dynamic)
        if (
          ((textLength +=
            ClipboardAnnotationsGetLength(spec) *
            (spec.kind === "title1" ? ClipboardPastePlanningConstant : 1)),
          "text" in spec &&
            (richTextCost += noteRichTextCost(spec.text)),
          textLength > ClipboardPastePlanningResolvedValue ||
            richTextCost > ClipboardPastePlanningLimit)
        )
          return true;
      return false;
    };
    ClipboardPastePlanningHandler = (payload?: Dynamic): Dynamic =>
      ClipboardStateHandler(payload?.stayed) > 0;
    ClipboardPastePlanningIsArray = (payload?: Dynamic): Dynamic =>
      typeof payload == "object" &&
      payload !== null &&
      Array.isArray(payload.annotations) &&
      payload.annotations.length > 0;
    ClipboardPastePlanningAnnotations = (
      metadata?: Dynamic,
      extraAnnotations?: Dynamic,
      reservedBytes: Dynamic = 0,
    ): Dynamic => {
      let serialized: Dynamic = serializeCanvasMetadata({
        ...metadata,
        annotations: [...(metadata.annotations ?? []), ...extraAnnotations],
      });
      return (
        ClipboardArtboardsEncode(serialized) &&
        ClipboardArtboardsTextEncoder.encode(serialized).length + reservedBytes <=
          fileSizeLimit
      );
    };
  };
}

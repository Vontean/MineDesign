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
import { PlatformFileContentResolvedValue_11, serializeCanvasMetadata } from "../../platform/file-content";

var ClipboardPastePlanningResolvedValue: Dynamic;
var ClipboardPastePlanningLimit: Dynamic;
var ClipboardPastePlanningConstant: Dynamic;
var ClipboardPastePlanningKind: Dynamic;
var ClipboardPastePlanningHandler: Dynamic;
var ClipboardPastePlanningIsArray: Dynamic;
var ClipboardPastePlanningAnnotations: Dynamic;
function buildAnnotationPaste(
  input?: Dynamic,
  options?: Dynamic,
  context: Dynamic = [],
): Dynamic {
  let value: Dynamic = context.map(
      (input2?: Dynamic): Dynamic =>
        normalizeClipboardPictureCss(input2, options),
    ),
    value2: Dynamic = value.map(
      (input2?: Dynamic): Dynamic => input2.picture,
    ),
    values: Dynamic = new Set(
      value
        .filter((input2?: Dynamic): Dynamic => input2.plain)
        .map((input2?: Dynamic): Dynamic => input2.picture.spec.id),
    );
  if (options)
    return {
      land: [...input],
      plain: 0,
      notesOut: 0,
      pictures: value2,
      plainPictures: values,
    };
  let value3: Dynamic = input.filter(
      (input2?: Dynamic): Dynamic =>
        ClipboardAnnotationsIncludes_2(input2.spec),
    ),
    value4: Dynamic = ClipboardPastePlanningKind(
      value3.map((input2?: Dynamic): Dynamic => input2.spec),
    ),
    index: Dynamic = 0;
  return {
    land: input
      .filter(
        (input2?: Dynamic): Dynamic =>
          !(
            value4 && ClipboardAnnotationsIncludes_2(input2.spec)
          ),
      )
      .map((input2?: Dynamic): Dynamic => {
        if (!("css" in input2.spec) || input2.spec.css === undefined)
          return input2;
        index++;
        let { css: spec, ...spec2 }: Dynamic = input2.spec;
        return {
          ...input2,
          spec: spec2,
        };
      }),
    plain: index,
    notesOut: value4 ? value3.length : 0,
    pictures: value2,
    plainPictures: values,
  };
}
function parseAnnotationPaste(
  input?: Dynamic,
  options: Dynamic = (): Dynamic => true,
): Dynamic {
  let value: Dynamic = parseAnnotationClipboard(input);
  if (value === null)
    return {
      land: null,
      say: ClipboardPastePlanningHandler(input)
        ? ClipboardFileTransferRegistry.tooMuchStayed
        : ClipboardFileTransferRegistry.unreadable,
    };
  let value2: Dynamic = clipboardPictureEntries(value.entries),
    value3: Dynamic = value2.entries.map(
      (input2?: Dynamic): Dynamic => input2.spec,
    ),
    value4: Dynamic = value.pictures
      .slice(0, ClipboardAnnotationsLimit)
      .map(
        (input2?: Dynamic): Dynamic =>
          normalizeClipboardPictureCss(input2, false),
      ),
    value5: Dynamic = value4.map(
      (input2?: Dynamic): Dynamic => input2.picture,
    ),
    value6: Dynamic =
      value.unread > 0
        ? ClipboardFileTransferRegistry.alsoUnread(value.unread)
        : "";
  if (
    value3.length === 0 &&
    value5.length === 0 &&
    value.unreadPictures === 0
  )
    return {
      land: null,
      say:
        (value2.shapes > 0
          ? ClipboardFileTransferRegistry.onlyShapes +
            ClipboardFileTransferRegistry.alsoLeftOut(
              value.leftOut,
              value.videos,
            )
          : ClipboardFileTransferRegistry.onlyLeftOut(
              value.leftOut,
              value.videos,
            )) + value6,
    };
  if (ClipboardPastePlanningKind(value3))
    return {
      land: null,
      say: ClipboardFileTransferRegistry.tooMuchUnasked,
    };
  if (!options(value3))
    return {
      land: null,
      say: ClipboardFileTransferRegistry.wontFit,
      error: true,
    };
  let values: Dynamic = new Set(
      value4
        .filter((input2?: Dynamic): Dynamic => input2.plain)
        .map((input2?: Dynamic): Dynamic => input2.picture.spec.id),
    ),
    callback: Dynamic = (
      input2?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
    ): Dynamic =>
      ClipboardFileTransferRegistry.pasted(
        input2,
        value.leftOut,
        value.unread,
        value2.shapes,
        {
          videos: value.videos,
          failed: context + value.unreadPictures,
          overCap: value.pictures.length - value5.length,
          plain: options2.filter(
            (input3?: Dynamic): Dynamic => values.has(input3.spec.id),
          ).length,
        },
      );
  return value5.length === 0 && value3.length === 0
    ? {
        land: null,
        say: callback([], [], 0),
      }
    : value5.length === 0
      ? {
          land: value2.entries,
          say: callback(value3, [], 0),
        }
      : {
          land: value2.entries,
          say: "",
          pictures: {
            carried: value5,
            assets: parseClipboardAssets(input, value5),
            said: callback,
          },
        };
}
function normalizeAnnotationPasteOrigin(items?: Dynamic): Dynamic {
  let value: Dynamic =
    items.length === 0
      ? {
          x: 0,
          y: 0,
        }
      : {
          x:
            0 -
            Math.min(...items.map((input?: Dynamic): Dynamic => input.dx)),
          y:
            0 -
            Math.min(...items.map((input?: Dynamic): Dynamic => input.dy)),
        };
  return {
    group: items.map(
      (input?: Dynamic): Dynamic => ({
        ...input,
        dx: input.dx + value.x,
        dy: input.dy + value.y,
      }),
    ),
    shift: value,
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
    ClipboardPastePlanningKind = (input?: Dynamic): Dynamic => {
      let index: Dynamic = 0,
        index2: Dynamic = 0;
      for (let value of input as Dynamic)
        if (
          ((index +=
            ClipboardAnnotationsGetLength(value) *
            (value.kind === "title1" ? ClipboardPastePlanningConstant : 1)),
          "text" in value &&
            (index2 += noteRichTextCost(value.text)),
          index > ClipboardPastePlanningResolvedValue ||
            index2 > ClipboardPastePlanningLimit)
        )
          return true;
      return false;
    };
    ClipboardPastePlanningHandler = (input?: Dynamic): Dynamic =>
      ClipboardStateHandler(input?.stayed) > 0;
    ClipboardPastePlanningIsArray = (input?: Dynamic): Dynamic =>
      typeof input == "object" &&
      input !== null &&
      Array.isArray(input.annotations) &&
      input.annotations.length > 0;
    ClipboardPastePlanningAnnotations = (
      input?: Dynamic,
      options?: Dynamic,
      context: Dynamic = 0,
    ): Dynamic => {
      let value: Dynamic = serializeCanvasMetadata({
        ...input,
        annotations: [...(input.annotations ?? []), ...options],
      });
      return (
        ClipboardArtboardsEncode(value) &&
        ClipboardArtboardsTextEncoder.encode(value).length + context <=
          PlatformFileContentResolvedValue_11
      );
    };
  };
}

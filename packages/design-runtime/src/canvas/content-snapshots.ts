/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DcTplAttribute } from "../editor/html/authoring";
import { PlatformFileContentTest_3 as asBlobAssetUrl } from "../platform/file-content";

var textExtractionExcludedTags: Dynamic;
var artboardTextSnapshotLimit: Dynamic;
var videoElementsWithSource: Dynamic;
function extractVisibleElementText(
  element?: Dynamic,
  { enough: maxTextLength = 600, visits: maxVisits = 1 / 0 }: Dynamic = {},
): Dynamic {
  let text: Dynamic = "",
    index: Dynamic = 0,
    callback: Dynamic = (node?: Dynamic): Dynamic => {
      if (!(text.length >= maxTextLength || index >= maxVisits)) {
        index += 1;
        if (node.nodeType === 3) text += node.data;
        else if (
          node.nodeType === 1 &&
          !textExtractionExcludedTags.has(
            node.tagName.toLowerCase().replace(/^sc-raw-/, ""),
          )
        )
          for (let childNode of node.childNodes as Dynamic) callback(childNode);
      }
    };
  callback(element);
  return text;
}
function createVideoElementIdentity(
  model?: Dynamic,
  templateId?: Dynamic,
): Dynamic {
  let videoElement: Dynamic = model.element(templateId),
    videoSrc: Dynamic =
      videoElement?.tagName.toLowerCase() === "video"
        ? videoElement.getAttribute("src")
        : null;
  if (!videoElement || !videoSrc) return null;
  let sameSrcVideos: Dynamic = videoElementsWithSource(model, videoSrc),
    videoIndex: Dynamic = sameSrcVideos.indexOf(videoElement);
  return videoIndex < 0
    ? null
    : {
        src: videoSrc,
        nth: videoIndex,
        of: sameSrcVideos.length,
      };
}
function resolveVideoElementIdentity(
  model?: Dynamic,
  identity?: Dynamic,
): Dynamic {
  let sameSrcVideos: Dynamic = videoElementsWithSource(model, identity.src);
  if (sameSrcVideos.length === 0) return "gone";
  if (sameSrcVideos.length !== identity.of) return "unsure";
  let templateId: Dynamic = Number.parseInt(
    sameSrcVideos[identity.nth]?.getAttribute(DcTplAttribute) ?? "",
    10,
  );
  return Number.isInteger(templateId) ? templateId : "gone";
}
function isValidVideoDimensions(video?: Dynamic): Dynamic {
  let callback: Dynamic = (dimension?: Dynamic): Dynamic =>
    Number.isInteger(dimension) && dimension > 0 && dimension <= 16384;
  return (
    asBlobAssetUrl(video.src) !== null &&
    callback(video.width) &&
    callback(video.height)
  );
}
export {
  artboardTextSnapshotLimit,
  createVideoElementIdentity,
  extractVisibleElementText,
  isValidVideoDimensions,
  resolveVideoElementIdentity,
  textExtractionExcludedTags,
  videoElementsWithSource,
};
export function installCanvasContentSnapshots(): () => void {
  return () => {
    textExtractionExcludedTags = new Set([
      "style",
      "script",
      "link",
      "meta",
      "template",
      "sc-helmet",
      "helmet",
    ]);
    artboardTextSnapshotLimit = 1e3;
    videoElementsWithSource = (model?: Dynamic, videoSrc?: Dynamic): Dynamic =>
      model
        .elementsByAttr("src", videoSrc)
        .filter(
          (element?: Dynamic): Dynamic =>
            element.tagName.toLowerCase() === "video",
        );
  };
}

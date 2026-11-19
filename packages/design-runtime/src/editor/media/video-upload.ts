import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getAssetsCapability, isBlobAssetUrl, normalizeUploadedAsset } from "../../platform/image-upload";

var allowedVideoMimeTypes: Dynamic;
var maxVideoBytes: Dynamic;
var quicktimeMimeType: Dynamic;
var acceptedVideoTypes: Dynamic;
var darkFrameLuminanceThreshold: Dynamic;
var videoReactProps: Dynamic;
var videoHtmlAttributes: Dynamic;
var escapeHtmlAttribute: Dynamic;
function videoMimeType(file?: Dynamic): Dynamic {
  let declaredType: Dynamic = (file.type.split(";")[0] ?? "").trim().toLowerCase();
  return declaredType === "" && /\.mov$/i.test(file.name ?? "")
    ? quicktimeMimeType
    : declaredType;
}
function isVideoFile(file?: Dynamic): Dynamic {
  return videoMimeType(file).startsWith("video/");
}
function videoUploadRefusal(file?: Dynamic): Dynamic {
  let mimeType: Dynamic = videoMimeType(file);
  return mimeType !== quicktimeMimeType &&
    !allowedVideoMimeTypes.includes(mimeType)
    ? "unsupported_type"
    : file.size > maxVideoBytes
      ? "too_large"
      : null;
}
async function sniffQuicktimeFormat(file?: Dynamic): Promise<Dynamic> {
  let mimeType: Dynamic = videoMimeType(file);
  if (mimeType !== quicktimeMimeType) return mimeType;
  let header: Dynamic = new Uint8Array(
    await file.slice(0, 12).arrayBuffer(),
  );
  return header.length === 12 &&
    String.fromCharCode(...header.subarray(4, 8)) === "ftyp"
    ? "video/mp4"
    : null;
}
async function normalizeQuicktimeUpload(
  file?: Dynamic,
  timeoutMs: Dynamic = 8e3,
): Promise<Dynamic> {
  if (videoMimeType(file) !== quicktimeMimeType)
    return {
      type: videoMimeType(file),
    };
  let clearProbeTimer: Dynamic = (): Dynamic => {},
    timeoutPromise: Dynamic = new Promise((resolveTimeout?: Dynamic): Dynamic => {
      let timerId: Dynamic = setTimeout(resolveTimeout, timeoutMs);
      clearProbeTimer = (): Dynamic => clearTimeout(timerId);
    });
  try {
    let format: Dynamic = await Promise.race([
      sniffQuicktimeFormat(file),
      timeoutPromise,
    ]);
    return format === undefined
      ? "probe_timeout"
      : format === null
        ? "old_quicktime"
        : {
            type: format,
          };
  } catch {
    return "probe_timeout";
  } finally {
    clearProbeTimer();
  }
}
function withVideoProbe(
  file?: Dynamic,
  timeoutMs?: Dynamic,
  inspect?: Dynamic,
  seekTime?: Dynamic,
): Dynamic {
  return videoMimeType(file) !== quicktimeMimeType
    ? probeVideoElement(file, timeoutMs, inspect, seekTime)
    : normalizeQuicktimeUpload(file, timeoutMs).then(
        (normalized?: Dynamic): Dynamic =>
          typeof normalized == "string"
            ? normalized
            : probeVideoElement(file, timeoutMs, inspect, seekTime),
      );
}
function probeVideoElement(
  file?: Dynamic,
  timeoutMs?: Dynamic,
  inspect?: Dynamic,
  seekTime?: Dynamic,
): Dynamic {
  return new Promise((resolve?: Dynamic): Dynamic => {
    let objectUrl: Dynamic = URL.createObjectURL(file),
      video: Dynamic = (document as Dynamic).createElement("video"),
      isSettled: Dynamic = false,
      settle: Dynamic = (outcome?: Dynamic): Dynamic => {
        isSettled ||
          ((isSettled = true),
          clearTimeout(timeoutId),
          video.removeAttribute("src"),
          video.load(),
          URL.revokeObjectURL(objectUrl),
          resolve(outcome));
      },
      timeoutId: Dynamic = setTimeout(
        (): Dynamic => settle("probe_timeout"),
        timeoutMs,
      ),
      isInspecting: Dynamic = false,
      inspectVideo: Dynamic = (): Dynamic => {
        isInspecting ||
          isSettled ||
          ((isInspecting = true),
          Promise.resolve()
            .then((): Dynamic => inspect(video))
            .then(settle, (): Dynamic => settle("probe_timeout")));
      };
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = (): Dynamic => settle("unplayable");
    seekTime
      ? ((video.onloadeddata = (): Dynamic => {
          let seekTarget: Dynamic = seekTime(video);
          Number.isFinite(seekTarget) && seekTarget > 0
            ? (video.currentTime = seekTarget)
            : inspectVideo();
        }),
        (video.onseeked = inspectVideo))
      : (video.onloadedmetadata = inspectVideo);
    video.src = objectUrl;
  });
}
function videoMetadata(video?: Dynamic): Dynamic {
  return video.videoWidth > 0 && video.videoHeight > 0
    ? {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      }
    : "unplayable";
}
function probeVideoFile(file?: Dynamic, timeoutMs: Dynamic = 6e3): Dynamic {
  return withVideoProbe(file, timeoutMs, videoMetadata);
}
function videoFrameLuminance(video?: Dynamic): Dynamic {
  try {
    let canvas: Dynamic = (document as Dynamic).createElement("canvas");
    canvas.width = 32;
    canvas.height = 18;
    let context2d: Dynamic = canvas.getContext("2d");
    if (context2d === null) return 255;
    context2d.drawImage(video, 0, 0, 32, 18);
    let data: Dynamic = context2d.getImageData(0, 0, 32, 18).data,
      luminanceSum: Dynamic = 0;
    for (let offset: Dynamic = 0; offset < data.length; offset += 4)
      luminanceSum +=
        0.2126 * (data[offset] ?? 0) +
        0.7152 * (data[offset + 1] ?? 0) +
        0.0722 * (data[offset + 2] ?? 0);
    return luminanceSum / (data.length / 4);
  } catch {
    return 255;
  }
}
function captureVideoPoster(file?: Dynamic, posterOptions: Dynamic = {}): Dynamic {
  let getSeekTime: Dynamic = (video?: Dynamic): Dynamic =>
    posterOptions.at ??
    (Number.isFinite(video.duration) && video.duration > 0
      ? Math.min(0.1, video.duration / 2)
      : 0);
  return withVideoProbe(
    file,
    posterOptions.timeoutMs ?? 8e3,
    async (video?: Dynamic): Promise<Dynamic> => {
      let metadata: Dynamic = videoMetadata(video);
      if (typeof metadata == "string") return metadata;
      let targetTime: Dynamic = Math.min(1, metadata.duration / 2);
      posterOptions.at === undefined &&
        targetTime > video.currentTime &&
        videoFrameLuminance(video) < darkFrameLuminanceThreshold &&
        (await new Promise((resolve?: Dynamic): Dynamic => {
          video.onseeked = (): Dynamic => resolve();
          video.currentTime = targetTime;
        }));
      let scale: Dynamic = Math.min(
          1,
          (posterOptions.maxEdge ?? 1920) / Math.max(metadata.width, metadata.height),
        ),
        canvas: Dynamic = (document as Dynamic).createElement("canvas");
      canvas.width = Math.max(1, Math.round(metadata.width * scale));
      canvas.height = Math.max(1, Math.round(metadata.height * scale));
      let context2d: Dynamic = canvas.getContext("2d");
      if (context2d === null) return "probe_timeout";
      context2d.drawImage(video, 0, 0, canvas.width, canvas.height);
      let blob: Dynamic = await new Promise(
        (resolve?: Dynamic): Dynamic =>
          canvas.toBlob(resolve, "image/jpeg", 0.85),
      );
      return blob === null
        ? "probe_timeout"
        : {
            blob: blob,
            ...metadata,
          };
    },
    getSeekTime,
  );
}
async function uploadVideo(
  file?: Dynamic,
  uploadOptions: Dynamic = {},
): Promise<Dynamic> {
  let refused: Dynamic = (reason?: Dynamic): Dynamic => ({
      kind: "refused",
      reason: reason,
    }),
    refusal: Dynamic = videoUploadRefusal(file);
  if (refusal !== null) return refused(refusal);
  let normalized: Dynamic = await normalizeQuicktimeUpload(file);
  if (typeof normalized == "string") return refused(normalized);
  let probed: Dynamic =
    uploadOptions.probed ??
    (await (uploadOptions.probe ?? probeVideoFile)(file).catch(
      (): Dynamic => "probe_timeout",
    ));
  if (typeof probed == "string") return refused(probed);
  let dimensions: Dynamic = {
      width: probed.width,
      height: probed.height,
      duration: probed.duration,
    },
    assets: Dynamic = await getAssetsCapability();
  if (assets === null || typeof assets.upload != "function")
    return refused("unavailable");
  try {
    let uploaded: Dynamic = normalizeUploadedAsset(
      await assets.upload.call(assets, file, {
        type: normalized.type,
      }),
    );
    return uploaded === undefined
      ? refused("bad_result")
      : {
          kind: "blob",
          ...uploaded,
          ...dimensions,
        };
  } catch (uploadError: Dynamic) {
    let errorCode: Dynamic =
      typeof uploadError == "object" && uploadError !== null
        ? String(uploadError.code ?? "")
        : "";
    return refused(errorCode || "upload_failed");
  }
}
function videoUploadFailureMessage(reason?: Dynamic): Dynamic {
  switch (reason) {
    case "unsupported_type":
      return uiMessage("inspector.videoUpload.onlyMp4MovAndWebm");
    case "old_quicktime":
      return uiMessage("inspector.videoUpload.thisMovIsInAn");
    case "too_large":
      return uiMessage("inspector.videoUpload.videosOver20MBCan");
    case "unplayable":
      return uiMessage("inspector.videoUpload.thisBrowserCanTPlay");
    case "probe_timeout":
      return uiMessage("inspector.videoUpload.couldnTReadThatVideo");
    case "quota_or_state":
      return uiMessage("inspector.videoUpload.noMoreUploadsCanBe");
    case "unavailable":
    case "not_granted":
    case "capability_disabled":
    case "capability_removed":
      return uiMessage("inspector.videoUpload.uploadsArenTAvailableIn");
    default:
      return uiMessage("inspector.videoUpload.theVideoCouldnTBe");
  }
}
function uploadedVideoHtml(src?: Dynamic, videoProps?: Dynamic): Dynamic {
  if (!isBlobAssetUrl(src)) return "";
  let mediaAttributes: Dynamic = Object.entries(videoHtmlAttributes)
      .map(([name, attributeValue]: Dynamic): Dynamic => `${name}="${attributeValue}"`)
      .join(" "),
    styleAttribute: Dynamic = videoProps.style
      ? ` style="${escapeHtmlAttribute(videoProps.style)}"`
      : "",
    labelAttribute: Dynamic = videoProps.label
      ? ` aria-label="${escapeHtmlAttribute(videoProps.label)}"`
      : "";
  return `<video src="${escapeHtmlAttribute(src)}"${labelAttribute} ${mediaAttributes} width="${String(Math.round(videoProps.width))}" height="${String(Math.round(videoProps.height))}"${styleAttribute}></video>`;
}
export {
  captureVideoPoster,
  isVideoFile,
  videoHtmlAttributes as MediaVideoUploadAutoplayLoopMutedConfig,
  videoReactProps as MediaVideoUploadAutoPlayLoopMutedConfig,
  allowedVideoMimeTypes as MediaVideoUploadItems,
  darkFrameLuminanceThreshold as MediaVideoUploadLimit,
  escapeHtmlAttribute as MediaVideoUploadReplace,
  maxVideoBytes as MediaVideoUploadResolvedValue,
  normalizeQuicktimeUpload,
  probeVideoElement,
  probeVideoFile,
  sniffQuicktimeFormat,
  uploadedVideoHtml,
  uploadVideo,
  videoFrameLuminance,
  videoMetadata,
  videoMimeType,
  acceptedVideoTypes as VideoMp4VideoWebmVideoQuicktimeMovValue,
  quicktimeMimeType as VideoQuicktimeValue,
  videoUploadFailureMessage,
  videoUploadRefusal,
  withVideoProbe,
};
export function installEditorMediaVideoUpload(): () => void {
  return () => {
    allowedVideoMimeTypes = ["video/mp4", "video/webm"];
    maxVideoBytes = 20 * 1024 * 1024;
    quicktimeMimeType = "video/quicktime";
    acceptedVideoTypes =
      "video/mp4,video/webm,video/quicktime,.mov";
    darkFrameLuminanceThreshold = 8;
    videoReactProps = {
      autoPlay: true,
      loop: true,
      muted: true,
      playsInline: true,
    };
    videoHtmlAttributes = {
      autoplay: "autoplay",
      loop: "loop",
      muted: "muted",
      playsinline: "playsinline",
    };
    escapeHtmlAttribute = (text?: Dynamic): Dynamic =>
      text
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
  };
}

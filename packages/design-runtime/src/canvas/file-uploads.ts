import type { Dynamic } from "../runtime-types";
import { projectFilesystem } from "../platform/file-content";
import { markLocalFileChange } from "../editor/model/file-echoes";
import { uploadVideo, videoUploadFailureMessage } from "../editor/media/video-upload";
import { healthReporter } from "../platform/health-and-analytics";
import { blobAssetPathPattern, classifyUploadResult, isBlobAssetUrl, uploadImageWithFallback } from "../platform/image-upload";

let fallbackNoticeHandler: Dynamic = null;
let fallbackNoticeShown = false;
const dataImagePattern = /^data:image\/([a-z0-9.+-]+);base64,/i;
const retryableVideoRefusals = new Set([
  "quota_or_state", "rate_limited", "store_unavailable", "unavailable",
  "not_granted", "capability_disabled", "capability_removed",
]);

async function writeVersionedProjectFile(
  path?: Dynamic,
  content?: Dynamic,
  writeOptions?: Dynamic,
): Promise<Dynamic> {
  if (!projectFilesystem.writeFileVersioned) {
    await projectFilesystem.writeFile(
      path,
      content,
      writeOptions?.encoding,
    );
    return "unversioned";
  }
  try {
    await projectFilesystem.writeFileVersioned(path, content, {
      encoding: writeOptions?.encoding,
      baseline: {
        occToken: 0n,
      },
      conflictPolicy: "fail",
    });
    return "created";
  } catch (error: Dynamic) {
    if (error?.code === 10) {
      console.warn("[occ] create-assert collision:", path);
      return "exists";
    }
    throw error;
  }
}
function setFilePublishHandler(handler?: Dynamic): Dynamic {
  fallbackNoticeHandler = handler;
}
async function uploadDesignFile(
  designDir?: Dynamic,
  subfolder?: Dynamic,
  file?: Dynamic,
): Promise<Dynamic> {
  let baseName: Dynamic =
      (file.name.replace(/\.[^.]*$/, "") || "image")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+/, "")
        .slice(0, 40) || "image",
    uploadResult: Dynamic = await uploadImageWithFallback(file, {}),
    uploadHealth: Dynamic = classifyUploadResult(uploadResult);
  uploadHealth && healthReporter.report(...uploadHealth);
  if (uploadResult.kind === "blob")
    return {
      relName: uploadResult.src,
      relPath: uploadResult.src,
      base: baseName,
      src: uploadResult.src,
    };
  fallbackNoticeShown ||
    ((fallbackNoticeShown = true),
    fallbackNoticeHandler?.(uploadResult.reason));
  let dataUrlMatch: Dynamic = dataImagePattern.exec(uploadResult.src);
  if (dataUrlMatch === null) throw new Error("could not encode the image");
  let mimeSubtype: Dynamic = dataUrlMatch[1].toLowerCase(),
    extension: Dynamic =
      mimeSubtype === "jpeg"
        ? "jpg"
        : mimeSubtype === "svg+xml"
          ? "svg"
          : mimeSubtype.replace(/[^a-z0-9]/g, "") || "png",
    base64Data: Dynamic = uploadResult.src.slice(dataUrlMatch[0].length),
    makeFileName: Dynamic = (suffix?: Dynamic): Dynamic =>
      `${baseName}-${Date.now().toString(36)}${suffix}.${extension}`,
    fileName: Dynamic = makeFileName(`-${Math.random().toString(36).slice(2, 6)}`),
    relPath: Dynamic = subfolder ? `${subfolder}/${fileName}` : fileName;
  if (
    (await writeVersionedProjectFile(`${designDir}/${relPath}`, base64Data, {
      encoding: "base64",
    })) === "exists" &&
    ((fileName = makeFileName(`-${Math.random().toString(36).slice(2, 6)}`)),
    (relPath = subfolder ? `${subfolder}/${fileName}` : fileName),
    (await writeVersionedProjectFile(`${designDir}/${relPath}`, base64Data, {
      encoding: "base64",
    })) === "exists")
  )
    throw new Error(`upload target already exists: ${relPath}`);
  markLocalFileChange(designDir, relPath);
  return {
    relName: fileName,
    relPath: relPath,
    base: baseName,
    src: "./" + fileName,
  };
}
async function uploadDesignVideo(
  file?: Dynamic,
  probedMeta?: Dynamic,
): Promise<Dynamic> {
  let uploadResult: Dynamic = await uploadVideo(file, {
      probed: probedMeta,
    }),
    uploadHealth: Dynamic = classifyUploadResult(uploadResult);
  uploadHealth && healthReporter.report(...uploadHealth);
  return uploadResult.kind === "refused"
    ? {
        refused: videoUploadFailureMessage(uploadResult.reason),
        repeats:
          retryableVideoRefusals.has(
            uploadResult.reason,
          ),
      }
    : isBlobAssetUrl(uploadResult.src)
      ? {
          src:
            blobAssetPathPattern.test(uploadResult.src) &&
            !uploadResult.src.startsWith("/")
              ? "/" + uploadResult.src
              : uploadResult.src,
        }
      : {
          refused: videoUploadFailureMessage("bad_result"),
          repeats: false,
        };
}
export { setFilePublishHandler, uploadDesignFile, uploadDesignVideo, writeVersionedProjectFile };

export function resetCanvasFileUploads(): void {
  fallbackNoticeHandler = null;
  fallbackNoticeShown = false;
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { capabilityMetaName } from "../platform/document-compilation";
import { capabilityTimeoutMs, getCachedHostCapability, hasCapabilityLoader, hasCapabilityMethod, requestHostCapability, resolveHostCapability } from "../platform/host-capabilities";

var reactExportDownloads: Dynamic;
var DownloadsArenTAvailableToYouForMessage: Dynamic;
var ExportDownloadsResolvedValue: Dynamic;
var ExportDownloadsGifPngJpgSet: Dynamic;
var ExportDownloadsDocxPptxEpubSet: Dynamic;
var ExportDownloadsDefaultIgnorablePattern: Dynamic;
var hasCapabilityMethodValue: Dynamic;
var ExportDownloadsAlias: Dynamic;
function normalizeDownloadName(fileName?: Dynamic): Dynamic {
  let value: Dynamic = fileName
      .replace(ExportDownloadsDefaultIgnorablePattern, "")
      .replace(/(^|[\s.])\p{M}+/gu, "$1")
      .replace(/[\s.]+$/, ""),
    extensionIndex: Dynamic = value.lastIndexOf("."),
    extension: Dynamic =
      extensionIndex === -1 ? "" : value.slice(extensionIndex + 1).toLowerCase();
  return (
    ExportDownloadsGifPngJpgSet.has(extension) ||
    ExportDownloadsDocxPptxEpubSet.has(extension)
  );
}
function hasDownloadCapability(): Dynamic {
  return (
    hasCapabilityMethodValue(
      getCachedHostCapability("downloads"),
    ) || hasCapabilityLoader()
  );
}
function downloadsCapabilityDeclared(): Dynamic {
  if (typeof document === "undefined") return false;
  let value: Dynamic = (document as Dynamic)
    .querySelector('meta[name="' + capabilityMetaName + '"]')
    ?.getAttribute("content");
  if (value == null) return false;
  try {
    let capabilities: Dynamic = JSON.parse(value);
    return (
      typeof capabilities == "object" &&
      capabilities !== null &&
      Object.hasOwn(capabilities, "downloads")
    );
  } catch {
    return false;
  }
}
async function downloadsWithheld(
  timeoutMs: Dynamic = capabilityTimeoutMs,
): Promise<Dynamic> {
  let value: Dynamic;
  try {
    if (!hasCapabilityLoader() || !downloadsCapabilityDeclared())
      return false;
    let promise: Dynamic = new Promise(
      (resolveTimeout?: Dynamic): Dynamic =>
        (value = setTimeout(resolveTimeout, timeoutMs, undefined)),
    );
    return (
      (await Promise.race([
        requestHostCapability("downloads"),
        promise,
      ])) === null
    );
  } catch {
    return false;
  } finally {
    clearTimeout(value);
  }
}
function useDownloadsWithheld(): Dynamic {
  let [value, setWithheld]: Dynamic = (0, reactExportDownloads.useState)(
    ExportDownloadsAlias,
  );
  (0, reactExportDownloads.useEffect)((): Dynamic => {
    let flag: Dynamic = true;
    downloadsWithheld().then((isWithheld?: Dynamic): Dynamic => {
      ExportDownloadsAlias = isWithheld;
      flag && setWithheld(isWithheld);
    });
    return (): Dynamic => {
      flag = false;
    };
  }, []);
  return value;
}
function downloadErrorCode(error?: Dynamic): Dynamic {
  if (typeof error == "object" && error !== null && "code" in error) {
    let code: Dynamic = error.code;
    if (typeof code == "string") return code;
  }
  return "";
}
async function saveThroughHost(
  data?: Dynamic,
  filename?: Dynamic,
  requestOptions: Dynamic = {},
): Promise<Dynamic> {
  if (await downloadsWithheld())
    return {
      outcome: "withheld",
      code: "withheld",
    };
  let value: Dynamic = await resolveHostCapability(
    "downloads",
    hasCapabilityMethodValue,
  );
  if (value === null)
    return {
      outcome: "unsupported",
      code: "no_shell_save",
    };
  try {
    let buffer: Dynamic =
      data instanceof Blob ? data : new Uint8Array(data).buffer;
    await value.save(
      requestOptions.request === undefined
        ? {
            filename: filename,
            data: buffer,
          }
        : {
            filename: filename,
            data: buffer,
            request: requestOptions.request,
          },
    );
    return {
      outcome: "saved",
      code: "",
    };
  } catch (error: Dynamic) {
    let errorCode: Dynamic = downloadErrorCode(error);
    return {
      outcome: errorCode === "declined" ? "declined" : "unsupported",
      code: errorCode,
    };
  }
}
export {
  downloadErrorCode,
  DownloadsArenTAvailableToYouForMessage,
  downloadsCapabilityDeclared,
  downloadsWithheld,
  ExportDownloadsAlias,
  ExportDownloadsDefaultIgnorablePattern,
  ExportDownloadsDocxPptxEpubSet,
  ExportDownloadsGifPngJpgSet,
  ExportDownloadsResolvedValue,
  hasCapabilityMethodValue,
  hasDownloadCapability,
  normalizeDownloadName,
  reactExportDownloads,
  saveThroughHost,
  useDownloadsWithheld,
};
export function installExportDownloads(): () => void {
  return () => {
    reactExportDownloads = toModuleNamespace(
      load_react(),
      1,
    );
    DownloadsArenTAvailableToYouForMessage =
      "Downloads aren't available to you for this artifact.";
    // MineDesign: the original hands the host at most 16 MB. MineDesign saves to disk instead of sending, so a file may be as large as a
    // design's own files (256 MB, docs/design/canvas §2); the save bridge allows 512 MB (SAVE_FILE_MAX_BYTES).
    ExportDownloadsResolvedValue = 256 * 1024 * 1024;
    ExportDownloadsGifPngJpgSet = new Set([
      "gif",
      "png",
      "jpg",
      "jpeg",
      "webp",
      "mp4",
      "webm",
      "txt",
      "json",
      "md",
    ]);
    ExportDownloadsDocxPptxEpubSet = new Set([
      "docx",
      "pptx",
      "epub",
      "csv",
      "ttf",
      "html",
      "svg",
      "pdf",
      "xlsx",
      "zip",
    ]);
    ExportDownloadsDefaultIgnorablePattern =
      /[\p{Cf}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}\u2800\uFFFC\u{13441}\u{13442}\u{1D159}\u0000-\u001F\u007F-\u009F]/gu;
    hasCapabilityMethodValue = hasCapabilityMethod("save");
  };
}

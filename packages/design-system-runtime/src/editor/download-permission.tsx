import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { capabilityHasMethod, capabilityLoadTimeoutMs, getClaudeCapability, getOrLoadClaudeCapability, hasClaudeCapabilityLoader, loadClaudeCapability } from "../host/claude-capabilities";
import { toModuleNamespace } from "../module-helpers";
import { compiledPageCapabilitiesMetaName } from "../platform/compiled-page";

var ReactDownloadsPermission: typeof React;
var DOWNLOADS_UNAVAILABLE_MESSAGE: string;
var SHELL_DIRECT_DOWNLOAD_EXTENSIONS: Set<string>;
var SHELL_BINARY_DOWNLOAD_EXTENSIONS: Set<string>;
var DOWNLOAD_NAME_IGNORABLE_PATTERN: RegExp;
var supportsShellSave: (
  capability: unknown,
) => capability is Editor.DownloadCapability;
var cachedDownloadsWithheld: boolean | undefined;
function normalizeDownloadName(name: string): boolean {
  let value = name
      .replace(DOWNLOAD_NAME_IGNORABLE_PATTERN, "")
      .replace(/(^|[\s.])\p{M}+/gu, "$1")
      .replace(/[\s.]+$/, ""),
    extensionIndex = value.lastIndexOf("."),
    extension = extensionIndex === -1 ? "" : value.slice(extensionIndex + 1).toLowerCase();
  return (
    SHELL_DIRECT_DOWNLOAD_EXTENSIONS.has(extension) ||
    SHELL_BINARY_DOWNLOAD_EXTENSIONS.has(extension)
  );
}
function hasDownloadCapability(): boolean {
  return (
    supportsShellSave(getClaudeCapability("downloads")) ||
    hasClaudeCapabilityLoader()
  );
}
function pageDeclaresDownloads(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  let value = document
    .querySelector(
      'meta[name="' + compiledPageCapabilitiesMetaName + '"]',
    )
    ?.getAttribute("content");
  if (value == null) {
    return false;
  }
  try {
    let parsedMetadata: unknown = JSON.parse(value);
    return (
      typeof parsedMetadata === "object" &&
      parsedMetadata !== null &&
      Object.hasOwn(parsedMetadata, "downloads")
    );
  } catch {
    return false;
  }
}
async function downloadsWithheld(
  timeoutMs: number = capabilityLoadTimeoutMs,
): Promise<boolean | undefined> {
  let value: ReturnType<typeof setTimeout> | undefined;
  try {
    if (
      !hasClaudeCapabilityLoader() ||
      !pageDeclaresDownloads()
    ) {
      return false;
    }
    let promise = new Promise<undefined>(
      (onTimeout) => (value = setTimeout(onTimeout, timeoutMs, undefined)),
    );
    return (
      (await Promise.race([
        loadClaudeCapability("downloads"),
        promise,
      ])) === null
    );
  } catch {
    return false;
  } finally {
    clearTimeout(value);
  }
}
function useDownloadsWithheld(): boolean | undefined {
  let [value, setWithheld] = ReactDownloadsPermission.useState(
    cachedDownloadsWithheld,
  );
  ReactDownloadsPermission.useEffect(() => {
    let flag: boolean = true;
    downloadsWithheld().then((isWithheld): void => {
      cachedDownloadsWithheld = isWithheld;
      if (flag) {
        setWithheld(isWithheld);
      }
    });
    return (): void => {
      flag = false;
    };
  }, []);
  return value;
}
function shellSaveErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    let code = error.code;
    if (typeof code === "string") {
      return code;
    }
  }
  return "";
}
async function saveThroughShell(
  name: Editor.ShellSaveData,
  bytes: string,
  saveOptions: {
    request?: unknown;
  } = {},
): Promise<Application.ShellSaveResult> {
  if (await downloadsWithheld()) {
    return {
      outcome: "withheld",
      code: "withheld",
    };
  }
  let value: Editor.DownloadCapability | null = await getOrLoadClaudeCapability("downloads", supportsShellSave);
  if (value === null) {
    return {
      outcome: "unsupported",
      code: "no_shell_save",
    };
  }
  try {
    let fileData =
      name instanceof Blob
        ? name
        : new Uint8Array(name as ArrayBuffer).buffer;
    await value.save(
      saveOptions.request === undefined
        ? {
            filename: bytes,
            data: fileData,
          }
        : {
            filename: bytes,
            data: fileData,
            request: saveOptions.request,
          },
    );
    return {
      outcome: "saved",
      code: "",
    };
  } catch (saveError) {
    let errorCode = shellSaveErrorCode(saveError);
    return {
      outcome: errorCode === "declined" ? "declined" : "unsupported",
      code: errorCode,
    };
  }
}
function get_DOWNLOADS_UNAVAILABLE_MESSAGE() {
  return uiMessage("design-system.downloadPermission.downloadsArenTAvailableTo");
}
export {
  cachedDownloadsWithheld,
  DOWNLOAD_NAME_IGNORABLE_PATTERN,
  get_DOWNLOADS_UNAVAILABLE_MESSAGE,
  downloadsWithheld,
  hasDownloadCapability,
  normalizeDownloadName,
  pageDeclaresDownloads,
  ReactDownloadsPermission,
  saveThroughShell,
  SHELL_BINARY_DOWNLOAD_EXTENSIONS,
  SHELL_DIRECT_DOWNLOAD_EXTENSIONS,
  shellSaveErrorCode,
  supportsShellSave,
  useDownloadsWithheld,
};
export function installEditorDownloadPermission(): () => void {
  return () => {
    ReactDownloadsPermission = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    DOWNLOADS_UNAVAILABLE_MESSAGE =
      "Downloads aren't available to you for this artifact.";
    SHELL_DIRECT_DOWNLOAD_EXTENSIONS = new Set([
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
    SHELL_BINARY_DOWNLOAD_EXTENSIONS = new Set([
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
    DOWNLOAD_NAME_IGNORABLE_PATTERN =
      /[\p{Cf}\p{Cs}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}\u2800\uFFFC\u{13441}\u{13442}\u{1D159}\u0000-\u001F\u007F-\u009F]/gu;
    supportsShellSave = capabilityHasMethod("save") as (
      capability: unknown,
    ) => capability is Editor.DownloadCapability;
  };
}

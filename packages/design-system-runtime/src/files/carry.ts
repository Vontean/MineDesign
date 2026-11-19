/** Restored application module; prepare first, initialize in original order. */
import type {
  DesignFilesCodec,
  LazyReadState,
  FilesPeerSource,
  CarriedFileEdit,
  CarriedView,
  CarriedIndexEdit,
  CarryViewInput,
  VersionedIndex,
  FileData,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { buildFilesIndex, createEmptyFilesIndex, FILES_INDEX_MERGE_SCHEMA, FILES_INDEX_PROJECT_PATH, isProjectContentPath, projectFilesForSave, restoreFilesFromIndex } from "../editor/files-index";
import { serializeIndexDocument } from "../editor/index-file-store";
import { CRASH_STASH_MAX_AGE_MS, CRASH_STASH_MAX_ARTIFACT_CHARS, CRASH_STASH_MAX_ENTRIES } from "./crash-stash";
import { lazyFileReadMode } from "./lazy-reads";
import { blobRelativeUrlModelFilePolicy } from "../model/file-policy";
import { isSystemEditingDisabled } from "../model/system-sync";

var designSystemFilesCodec: (
  indexPath: string,
  lazy?: LazyReadState,
) => DesignFilesCodec;
var DEFAULT_DESIGN_SYSTEM_FILES_CODEC: DesignFilesCodec;
var HOT_CARRY_MAX_INLINE_CHARS: number;
var HOT_CARRY_MAX_AGE_MS: number;
var HOT_CARRY_MAX_FILES: number;
var HOT_CARRY_MAX_TOTAL_CHARS: number;
var HOT_CARRY_STORAGE_PREFIX: string;
var EMPTY_FILES_PEER_SOURCE: FilesPeerSource;
var isCarriedFileIndex: (
  value: unknown,
) => value is import("../contracts/files-core").CarriedFilesIndex;
var RECENT_PUBLISH_HEAL_WINDOW_MS: number;
var RECENT_PUBLISH_CLASH_NOTICE_MS: number;
var safeSessionStorage: () => Storage | null;
var fileBaseName: (path: string) => string;
var summarizeFileNames: (paths: readonly string[]) => string;
var FILE_CONFLICT_CHOICE_SUFFIX: string;
function currentDesignSystemArtifactPath(
  pageLocation: Pick<Location, "pathname"> | undefined = globalThis.location,
) {
  return (pageLocation?.pathname ?? "").replace(/(^|\/)_f\/[^/]+\//, "$1");
}
function designSystemCarryKey(
  viewerId: string | null | undefined,
  artifactPath: string = currentDesignSystemArtifactPath(),
): string {
  return (viewerId ?? "") + "\x00" + artifactPath;
}
function purgeOtherViewerCarryEntries(
  storage: Storage,
  viewerId: string | null | undefined,
  artifactPath: string = currentDesignSystemArtifactPath(),
): void {
  let currentKey: string =
      HOT_CARRY_STORAGE_PREFIX + designSystemCarryKey(viewerId, artifactPath),
    staleKeys: string[] = [];
  for (let index: number = 0; index < storage.length; index++) {
    let value = storage.key(index);
    if (
      value !== null &&
      value !== currentKey &&
      value.startsWith(HOT_CARRY_STORAGE_PREFIX) &&
      (value === HOT_CARRY_STORAGE_PREFIX + artifactPath ||
        value.endsWith("\x00" + artifactPath))
    ) {
      staleKeys.push(value);
    }
  }
  for (let value of staleKeys) {
    storage.removeItem(value);
  }
}
function snapshotDesignSystemView(
  flagged: Iterable<string>,
  host:
    | Pick<Window, "location" | "history" | "dispatchEvent">
    | undefined = typeof window !== "undefined" ? window : undefined,
): CarriedView {
  let section = host?.location?.hash?.slice(1) ?? "",
    paths: string[] = [...flagged];
  return {
    v: 1,
    ...(section !== ""
      ? {
          section: section,
        }
      : {}),
    ...(paths.length > 0
      ? {
          flagged: paths,
        }
      : {}),
  };
}
function restoreDesignSystemView(
  snapshot: unknown,
  host:
    | Pick<Window, "location" | "history" | "dispatchEvent">
    | undefined = typeof window !== "undefined" ? window : undefined,
) {
  let view =
    typeof snapshot === "object" && snapshot !== null
      ? (snapshot as CarryViewInput)
      : {};
  if (
    typeof view.section === "string" &&
    /^[A-Za-z0-9_.:~-]{1,120}$/.test(view.section) &&
    host !== undefined &&
    host.location.hash !== "#" + view.section
  ) {
    try {
      if (host.history !== undefined && host.location.protocol !== "about:") {
        host.history.replaceState(null, "", "#" + view.section);
      } else {
        host.location.hash = "#" + view.section;
      }
      host.dispatchEvent(new Event("hashchange"));
    } catch {}
  }
  if (Array.isArray(view.flagged)) {
    return view.flagged
      .filter((fileInput: unknown): boolean => typeof fileInput === "string")
      .slice(0, 200);
  } else {
    return [];
  }
}
function parseCarriedFileEdit(fileValue: unknown) {
  if (
    typeof fileValue !== "object" ||
    fileValue === null ||
    typeof (fileValue as { text?: unknown }).text !== "string"
  ) {
    return;
  }
  let edit: { text: string; base?: unknown; baseText?: unknown } = fileValue as {
    text: string;
    base?: unknown;
    baseText?: unknown;
  };
  return {
    text: edit.text,
    ...(typeof edit.base === "string" || edit.base === null
      ? {
          base: edit.base,
        }
      : {}),
    ...(typeof edit.baseText === "string"
      ? {
          baseText: edit.baseText,
        }
      : {}),
  };
}
function readCarriedFileEdits(snapshot: unknown, field: string = "mine") {
  let edits = new Map<string, CarriedFileEdit>(),
    raw =
      typeof snapshot === "object" && snapshot !== null
        ? (snapshot as Record<string, unknown>)[field]
        : undefined;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return edits;
  }
  for (let [value, fileValueA] of Object.entries<unknown>(
    raw as Record<string, unknown>,
  )) {
    let fileResult = parseCarriedFileEdit(fileValueA);
    if (fileResult !== undefined) {
      edits.set(value, fileResult);
    }
  }
  return edits;
}
function readCarriedIndexEdit(fileValueB: unknown) {
  if (typeof fileValueB !== "object" || fileValueB === null) {
    return;
  }
  let edit = fileValueB as { base?: unknown; mine?: unknown };
  if (isCarriedFileIndex(edit.base) && isCarriedFileIndex(edit.mine)) {
    return {
      base: edit.base,
      mine: edit.mine,
    };
  } else {
    return undefined;
  }
}
function activeElementIsEditing(
  pageDocument: Document | undefined = typeof document !== "undefined"
    ? document
    : undefined,
) {
  let active = pageDocument?.activeElement;
  if (active === null || active === undefined) {
    return false;
  }
  let tag = active.tagName?.toLowerCase();
  return (
    tag === "textarea" ||
    tag === "input" ||
    (active as HTMLElement).isContentEditable === true
  );
}
function stripEditingOffFromStashedIndex(
  stash: Files.FilesCrashStash,
  indexPath: string,
) {
  let cleanIndex = (fileInputA: string) => {
    try {
      let {
        editing: value,
        ...fileValueC
      }: import("../contracts/files-core").JsonRecord = JSON.parse(fileInputA);
      if (
        isSystemEditingDisabled({
          editing: value,
        })
      ) {
        return serializeIndexDocument(fileValueC);
      } else {
        return fileInputA;
      }
    } catch {
      return fileInputA;
    }
  };
  return {
    ...stash,
    read: async (): Promise<
      Awaited<ReturnType<Files.FilesCrashStash["read"]>>
    > => {
      let value = await stash.read();
      if (value === undefined) {
        return value;
      } else {
        return {
          ...value,
          edits: value.edits.map((fileInputB: Files.StashedFileEdit) =>
            fileInputB.path === indexPath && fileInputB.text !== null
              ? {
                  ...fileInputB,
                  text: cleanIndex(fileInputB.text),
                }
              : fileInputB,
          ),
        };
      }
    },
  };
}
function prioritizeStashedTextEdits(stash: Files.FilesCrashStash) {
  return {
    ...stash,
    put: (fileInputC: Files.StashedFileEdit[], fileOptions: string) => {
      let value = fileInputC.filter(
          (fileInputD: Files.StashedFileEdit): boolean => fileInputD.text !== null,
        ),
        fileValueD: boolean =
          value.reduce(
            (fileInputE: number, fileOptionsA: Files.StashedFileEdit) =>
              fileInputE + fileOptionsA.path.length + (fileOptionsA.text?.length ?? 0),
            0,
          ) <= CRASH_STASH_MAX_ARTIFACT_CHARS;
      return stash.put(
        fileValueD
          ? [
              ...value,
              ...fileInputC.filter(
                (fileInputF: Files.StashedFileEdit): boolean =>
                  fileInputF.text === null,
              ),
            ]
          : value,
        fileOptions,
      );
    },
  };
}
async function readOwedArtifactBlob(
  blobId: string,
): Promise<FileData | null> {
  try {
    let value = await fetch(
      blobRelativeUrlModelFilePolicy(blobId),
      {
        credentials: "same-origin",
      },
    );
    if (!value.ok) {
      return null;
    }
    return {
      bytes: new Uint8Array(await value.arrayBuffer()),
      type: (value.headers.get("content-type") ?? "").split(";")[0].trim(),
    };
  } catch {
    return null;
  }
}
export {
  activeElementIsEditing,
  currentDesignSystemArtifactPath,
  DEFAULT_DESIGN_SYSTEM_FILES_CODEC,
  designSystemCarryKey,
  designSystemFilesCodec,
  EMPTY_FILES_PEER_SOURCE,
  FILE_CONFLICT_CHOICE_SUFFIX,
  fileBaseName,
  HOT_CARRY_MAX_AGE_MS,
  HOT_CARRY_MAX_FILES,
  HOT_CARRY_MAX_INLINE_CHARS,
  HOT_CARRY_MAX_TOTAL_CHARS,
  HOT_CARRY_STORAGE_PREFIX,
  isCarriedFileIndex,
  parseCarriedFileEdit,
  prioritizeStashedTextEdits,
  purgeOtherViewerCarryEntries,
  readCarriedFileEdits,
  readCarriedIndexEdit,
  readOwedArtifactBlob,
  RECENT_PUBLISH_CLASH_NOTICE_MS,
  RECENT_PUBLISH_HEAL_WINDOW_MS,
  restoreDesignSystemView,
  safeSessionStorage,
  snapshotDesignSystemView,
  stripEditingOffFromStashedIndex,
  summarizeFileNames,
};
export function installFilesCarry(): () => void {
  return () => {
    designSystemFilesCodec = (fileInputG: string, fileOptionsB?: LazyReadState) => ({
      indexPath: fileInputG,
      type: "design_system",
      schema: FILES_INDEX_MERGE_SCHEMA,
      emptyIndex: createEmptyFilesIndex,
      wants: (fileInputH: Files.FileListingRow) =>
        isProjectContentPath(fileInputH.path) &&
        !(
          fileOptionsB !== undefined &&
          lazyFileReadMode(fileOptionsB, fileInputH.path) === "skipped"
        ),
      indexOf: (
        fileInputI: import("../contracts/files-core").FileDocumentState<{
          files: Files.FileTable;
        }>,
        fileOptionsC?: Files.FilesIndex,
      ) =>
        buildFilesIndex(
          fileInputI.title,
          fileInputI.content.files,
          fileOptionsC,
        ),
      filesOf: (
        fileInputJ: import("../contracts/files-core").FileDocumentState<{
          files: Files.FileTable;
        }>,
      ) => projectFilesForSave(fileInputJ.content.files),
      compose: (fileInputK: Files.FilesIndex, fileOptionsD: Map<string, string>) =>
        restoreFilesFromIndex(fileInputK, fileOptionsD),
    });
    DEFAULT_DESIGN_SYSTEM_FILES_CODEC = designSystemFilesCodec(
      FILES_INDEX_PROJECT_PATH,
    );
    HOT_CARRY_MAX_INLINE_CHARS = 131072;
    HOT_CARRY_MAX_AGE_MS = CRASH_STASH_MAX_AGE_MS;
    HOT_CARRY_MAX_FILES = CRASH_STASH_MAX_ENTRIES;
    HOT_CARRY_MAX_TOTAL_CHARS = CRASH_STASH_MAX_ARTIFACT_CHARS;
    HOT_CARRY_STORAGE_PREFIX = "ds-carry:";
    EMPTY_FILES_PEER_SOURCE = {
      getSnapshot: () => [],
      subscribe: () => (): void => {
        return;
      },
    };
    isCarriedFileIndex = (fileInputL: unknown): fileInputL is Files.FilesIndex =>
      typeof fileInputL === "object" &&
      fileInputL !== null &&
      !Array.isArray(fileInputL) &&
      typeof (fileInputL as { v?: unknown }).v === "number";
    RECENT_PUBLISH_HEAL_WINDOW_MS = 3000;
    RECENT_PUBLISH_CLASH_NOTICE_MS = 1000;
    safeSessionStorage = () => {
      try {
        if (typeof sessionStorage !== "undefined") {
          return sessionStorage;
        } else {
          return null;
        }
      } catch {
        return null;
      }
    };
    fileBaseName = (fileInputM: string) => fileInputM.slice(fileInputM.lastIndexOf("/") + 1);
    summarizeFileNames = (items: readonly string[]) =>
      items.length <= 2
        ? items.map(fileBaseName).join(" and ")
        : fileBaseName(items[0]) + " and " + String(items.length - 1) + " more";
    FILE_CONFLICT_CHOICE_SUFFIX =
      " Choose theirs, yours, or yours as a copy in the banner at the top.";
  };
}

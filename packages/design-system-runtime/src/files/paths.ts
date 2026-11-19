import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type {
  NormalizedFilePublishInput,
  FilePublishRejection,
  FileVersionCaps,
  FileRetryError,
  FileArtifactType,
  PathCheckException,
  PathCheckErrorConstructor,
  JsonFileState,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { encodeFileUtf8, sha256 } from "../editor/index-file-store";
import { isPublishableFilePath } from "./migration-engine";

var PROJECT_INDEX_PATHS: Record<"design" | "slides" | "designSystem", string>;
var LEGACY_PROJECT_INDEX_PATHS: { designSystem: string };
var PROJECT_FILE_PREFIX: string;
var MIGRATION_MANIFEST_PATH: string;
var RESERVED_PROJECT_FILES_BY_TYPE: Record<FileArtifactType, string[]>;
var PUBLIC_PROJECT_FILES_BY_TYPE: Partial<Record<FileArtifactType, string[]>>;
var isReservedProjectFile: (type: FileArtifactType, path: string) => boolean;
var isPrivateProjectFile: (type: FileArtifactType, path: string) => boolean;
var isRuntimeInternalFilePath: (path: string) => boolean;
var isProjectIndexFilePath: (path: string) => boolean;
var MAX_FILE_BATCH_ENTRIES: number;
var MAX_FILE_PATH_UTF8_BYTES: number;
var MAX_FILE_PUBLISH_ENCODED_BYTES: number;
var DEFAULT_FILE_VERSION_CAPS: FileVersionCaps;
var MAX_FILE_BATCH_ENCODED_BYTES: number;
var FILE_MIME_TYPES_BY_EXTENSION: Map<string, string>;
var FILE_ALLOWED_MIME_TYPES: Set<string>;
var FILE_BINARY_MIME_TYPES: Set<string>;
var TEXT_FILE_MIME_TYPES: Set<string>;
var UNICODE_REPLACEMENT_CHARACTER: string;
var FILE_UNPAIRED_SURROGATE_PATTERN: RegExp;
var textContainsInvalidUnicode: (text: string) => boolean;
var filePublishRejectionReason: (
  path: string,
  input: Files.FilePublishInput,
) => string | undefined;
var isHtmlFilePath: (path: string) => boolean;
var FRAME_RUNTIME_BLOCK_START: string;
var FRAME_RUNTIME_BLOCK_END: string;
var filePublishContent: (
  input: Exclude<Files.FilePublishInput, null>,
) => Files.FileContents;
var encodeFileUrlPath: (path: string) => string;
var PathCheckError: PathCheckErrorConstructor;
var PATH_CONTROL_CHARACTER_PATTERN: RegExp;
var PATH_RESERVED_CHARACTER_PATTERN: RegExp;
var FILE_FETCH_RETRY_DELAYS_MS: number[];
function fileListingIsNarrowed(
  listing: Files.FileListing,
  port: Files.BrowserFilesPort,
) {
  return listing.narrowed ?? port.narrowed === true;
}
function filesPortExtensions<Port extends Files.BrowserFilesPort>(
  port: Port,
): Port {
  return port;
}
function validateFilePath(path: string): string | undefined {
  if (
    path === "" ||
    encodeFileUtf8(path).length > MAX_FILE_PATH_UTF8_BYTES
  ) {
    return uiMessage("design-system.paths.itsNameIsEmptyOr");
  }
  if (/[\u0000-\u001f\u007f%;:\\]/.test(path)) {
    return uiMessage("design-system.paths.itsNameHasACharacter");
  }
  if (path.endsWith(".cmekshadow")) {
    return uiMessage("design-system.paths.itsNameEndsInCmekshadow");
  }
  let parts = path.split("/");
  if (
    path.startsWith("/") ||
    parts.some(
      (pathSegment: string) => pathSegment === "" || pathSegment === "." || pathSegment === "..",
    )
  ) {
    return uiMessage("design-system.paths.itsPathHasAnEmpty");
  }
  if (parts[0].startsWith("_")) {
    return uiMessage("design-system.paths.itsTopLevelNameStarts");
  }
  return;
}
function isTextFileWithInvalidUnicode(
  path: string,
  fileContent: Files.FilePublishInput,
) {
  if (fileContent === null) {
    return false;
  }
  let normalized = normalizeFilePublishInput(path, fileContent);
  return (
    normalized !== null &&
    typeof normalized !== "string" &&
    typeof normalized.content === "string" &&
    TEXT_FILE_MIME_TYPES.has(normalized.contentType) &&
    textContainsInvalidUnicode(normalized.content)
  );
}
function restrictedFileNameReason(path: string) {
  if (
    /[\u0000-\u001f\u007f%;:\\]/.test(path) ||
    path.endsWith(".cmekshadow")
  ) {
    return validateFilePath(path);
  } else {
    return undefined;
  }
}
function filePublishRejection(
  path: string,
  fileContent: Files.FilePublishInput,
): FilePublishRejection | undefined {
  let nameProblem = validateFilePath(path);
  if (nameProblem !== undefined) {
    return {
      why: nameProblem,
      cause: "name",
    };
  }
  if (fileContent === null) {
    return;
  }
  let normalized = normalizeFilePublishInput(path, fileContent);
  if (typeof normalized === "string") {
    if (normalized.includes("files of this kind")) {
      return {
        why: normalized.slice(normalized.indexOf(": ") + 2),
        cause: "kind",
      };
    }
    if (normalized.includes("cannot infer a content type")) {
      return {
        why: "files of this kind cannot be saved here (nothing is known for a name like this). Use another format",
        cause: "kind",
      };
    }
    return {
      why: "it is in a form that cannot be saved here",
      cause: "unreadable",
    };
  }
  if (isTextFileWithInvalidUnicode(path, fileContent)) {
    return {
      get why() { return ((uiMessage("design-system.paths.itHoldsACharacterThat")) + (UNICODE_REPLACEMENT_CHARACTER)) + ("). Find it and type it again"); },
      cause: "damaged_text",
    };
  } else {
    return undefined;
  }
}
function fileMimeTypeFromPath(path: string) {
  let lastSlash = path.lastIndexOf("/"),
    lastDot = path.lastIndexOf(".");
  if (lastDot <= lastSlash + 1) {
    return;
  }
  return FILE_MIME_TYPES_BY_EXTENSION.get(
    path.slice(lastDot + 1).toLowerCase(),
  );
}
function stripFrameRuntimeBlock(html: string) {
  let start = html.indexOf(FRAME_RUNTIME_BLOCK_START);
  if (start < 0) {
    return html;
  }
  let end = html.indexOf(
    FRAME_RUNTIME_BLOCK_END,
    start + FRAME_RUNTIME_BLOCK_START.length,
  );
  if (end < 0) {
    return html;
  } else {
    return (
      html.slice(0, start) + html.slice(end + FRAME_RUNTIME_BLOCK_END.length)
    );
  }
}
function normalizeFilePublishInput(
  path: string,
  fileContent: Files.FilePublishInput,
): NormalizedFilePublishInput | string | null {
  if (fileContent === null) {
    return null;
  }
  let content: Files.FileContents | Exclude<Files.FilePublishInput, null> =
      fileContent,
    contentType: string | undefined;
  if (
    typeof fileContent === "object" &&
    !(typeof Blob !== "undefined" && fileContent instanceof Blob)
  ) {
    content = (fileContent as NormalizedFilePublishInput).content;
    contentType = (fileContent as NormalizedFilePublishInput).contentType;
  }
  let isBlob = typeof Blob !== "undefined" && content instanceof Blob;
  if (typeof content !== "string" && !isBlob) {
    return path + ": content must be a string or a Blob";
  }
  let blobMime = isBlob ? (content as Blob).type.split(";")[0].trim() : "",
    resolvedMime =
      contentType ??
      (FILE_ALLOWED_MIME_TYPES.has(blobMime) ? blobMime : undefined) ??
      fileMimeTypeFromPath(path) ??
      (blobMime !== "" ? blobMime : undefined);
  if (resolvedMime === undefined) {
    return (
      path +
      ": cannot infer a content type from the name; pass {content, contentType}"
    );
  }
  if (resolvedMime === "" || resolvedMime.includes(";")) {
    return path + ": contentType must be a bare media type";
  }
  if (
    !FILE_ALLOWED_MIME_TYPES.has(resolvedMime) &&
    !(contentType !== undefined && FILE_BINARY_MIME_TYPES.has(resolvedMime))
  ) {
    return (
      path +
      ": files of this kind (" +
      resolvedMime +
      ") cannot be saved here. Use another format"
    );
  }
  return {
    content: content as Files.FileContents,
    contentType: resolvedMime,
  };
}
function filePublishEncodedBytes(fileContent: Files.FilePublishInput) {
  if (fileContent === null) {
    return 0;
  }
  let content = filePublishContent(fileContent);
  if (typeof content === "string") {
    return encodeFileUtf8(content).length;
  } else {
    return Math.ceil(content.size / 3) * 4;
  }
}
function filePublishRawBytes(fileContent: Files.FilePublishInput) {
  if (fileContent === null) {
    return 0;
  }
  let content = filePublishContent(fileContent);
  if (typeof content === "string") {
    return encodeFileUtf8(content).length;
  } else {
    return content.size;
  }
}
function filePublishSizeRejection(
  fileContent: Files.FilePublishInput,
): undefined | string {
  if (
    fileContent === null ||
    filePublishEncodedBytes(fileContent) <= MAX_FILE_PUBLISH_ENCODED_BYTES
  ) {
    return;
  }
  let isText: boolean = typeof filePublishContent(fileContent) === "string",
    limitMb: number =
      (isText
        ? MAX_FILE_PUBLISH_ENCODED_BYTES
        : (MAX_FILE_PUBLISH_ENCODED_BYTES / 4) * 3) / 1048576;
  return (
    uiMessage("design-system.paths.itIsOverThe") +
    String(limitMb) +
    " MB limit for one file. Make it smaller" +
    (isText ? " (an image or a font pasted into it is the usual cause)" : "")
  );
}
async function fileContentBytes(
  content: Files.FileContents,
): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof content === "string") {
    return encodeFileUtf8(content);
  } else {
    return new Uint8Array(await content.arrayBuffer());
  }
}
async function hashFilePublishEntries(
  entries: Files.FilePublishEntries,
): Promise<Record<string, string>> {
  let hashes: Record<string, string> = {};
  for (let [value, fileContent] of Object.entries(entries)) {
    let normalizedFile = normalizeFilePublishInput(value, fileContent);
    if (normalizedFile === null || typeof normalizedFile === "string") {
      continue;
    }
    hashes[value] = await sha256(
      await fileContentBytes(normalizedFile.content),
    );
  }
  return hashes;
}
function validateFilePublishBatch(
  entries: Files.FilePublishEntries,
): Files.FilePublishFailure | undefined {
  let paths = Object.keys(entries);
  if (paths.length === 0 || paths.length > MAX_FILE_BATCH_ENTRIES) {
    return {
      ok: false,
      code: "invalid_content",
    };
  }
  let encodedBytes = 0;
  for (let value of paths) {
    if (validateFilePath(value) !== undefined) {
      return {
        ok: false,
        code: "invalid_content",
      };
    }
    if (
      typeof normalizeFilePublishInput(value, entries[value]) === "string"
    ) {
      return {
        ok: false,
        code: "invalid_content",
      };
    }
    encodedBytes += filePublishEncodedBytes(entries[value]);
  }
  if (encodedBytes > MAX_FILE_PUBLISH_ENCODED_BYTES) {
    return {
      ok: false,
      code: "too_large",
    };
  } else {
    return undefined;
  }
}
function splitFilePublishBatches(
  entries: Files.FilePublishEntries,
  isIndexPath: (path: string) => boolean = isProjectIndexFilePath,
  maxBytes: number = MAX_FILE_BATCH_ENCODED_BYTES,
  maxEntries: number = MAX_FILE_BATCH_ENTRIES,
) {
  let allEntries = Object.entries(entries),
    contentEntries = allEntries.filter(
      ([path]: [string, Files.FilePublishInput]): boolean =>
        !isIndexPath(path),
    ),
    indexEntries = allEntries.filter(
      ([path]: [string, Files.FilePublishInput]) => isIndexPath(path),
    ),
    batches: Files.FilePublishEntries[] = [],
    batch: Files.FilePublishEntries = {},
    bytes = 0,
    count = 0,
    append = (path: string, fileContent: Files.FilePublishInput): void => {
      let value = filePublishEncodedBytes(fileContent);
      if (count > 0 && (bytes + value > maxBytes || count + 1 > maxEntries)) {
        batches.push(batch);
        batch = {};
        bytes = 0;
        count = 0;
      }
      batch[path] = fileContent;
      bytes += value;
      count += 1;
    };
  for (let [value, fileContent] of contentEntries) {
    append(value, fileContent);
  }
  for (let [value, fileContent] of indexEntries) {
    append(value, fileContent);
  }
  if (count > 0) {
    batches.push(batch);
  }
  return batches;
}
function fileContentContainsRuntimeMarkers(fileContent: Files.FilePublishInput) {
  if (fileContent === null) {
    return false;
  }
  let content =
    typeof fileContent === "object" &&
    !(typeof Blob !== "undefined" && fileContent instanceof Blob)
      ? (fileContent as NormalizedFilePublishInput).content
      : fileContent;
  return (
    typeof content === "string" &&
    (content.includes("/_cas/") ||
      content.includes(FRAME_RUNTIME_BLOCK_START) ||
      content.includes("__frame_comments__"))
  );
}
function normalizeDecodedFilePath(path: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    throw new PathCheckError("bad_path", path);
  }
  if (PATH_CONTROL_CHARACTER_PATTERN.test(decoded)) {
    throw new PathCheckError("bad_path", path);
  }
  let parts: string[] = [];
  for (let value of decoded.replace(/\\/g, "/").split("/")) {
    if (value === "" || value === ".") {
      continue;
    }
    if (value === "..") {
      if (parts.length === 0) {
        return null;
      }
      parts.pop();
      continue;
    }
    parts.push(value);
  }
  return parts.join("/");
}
function validateProjectFilePrefix(prefix: string) {
  if (
    typeof prefix !== "string" ||
    !prefix.endsWith("/") ||
    prefix.startsWith("/")
  ) {
    throw new PathCheckError("bad_prefix", String(prefix));
  }
  if (normalizeDecodedFilePath(prefix) + "/" !== prefix) {
    throw new PathCheckError("bad_prefix", prefix);
  }
  return prefix;
}
function requireFileWithinPrefix(
  prefix: string,
  normalized: string | null,
  original: string,
) {
  if (
    normalized === null ||
    !normalized.startsWith(prefix) ||
    normalized.length === prefix.length
  ) {
    throw new PathCheckError("escapes_prefix", original);
  }
  if (
    PATH_RESERVED_CHARACTER_PATTERN.test(normalized) ||
    normalized.endsWith(".cmekshadow") ||
    new TextEncoder().encode(normalized).length > 512
  ) {
    throw new PathCheckError("bad_path", original);
  }
  return normalized;
}
function canonicalFilePathWithinPrefix(prefix: string, path: string) {
  validateProjectFilePrefix(prefix);
  if (typeof path !== "string" || path === "") {
    throw new PathCheckError("bad_path", String(path));
  }
  return requireFileWithinPrefix(
    prefix,
    normalizeDecodedFilePath(path),
    path,
  );
}
function isRetryableFileReadAccessError(error: unknown) {
  let status: unknown = (error as FileRetryError | null)?.status;
  return status === 401 || status === 403 || status === 404;
}
async function listWritableFiles(
  port: Files.BrowserFilesPort,
): Promise<Files.FileListing> {
  if (
    port.mayWrite === true &&
    typeof port.listUnlessNarrowed === "function"
  ) {
    return await port.listUnlessNarrowed();
  }
  let listing = await port.list();
  if (port.mayWrite === true && fileListingIsNarrowed(listing, port)) {
    throw {
      code: "http",
      status: 403,
      narrowed: true,
      get message() { return uiMessage("design-system.paths.filesJsonMarkedAsNarrowed"); },
    };
  }
  return listing;
}
async function retryFileRead<Result>(
  read: () => Result | Promise<Result>,
  timers?: Pick<Files.FilesTimers, "setTimeout">,
  onRetry?: (attempt: number, error: unknown) => void,
  delays: readonly number[] = FILE_FETCH_RETRY_DELAYS_MS,
): Promise<Result> {
  let clock = timers ?? {
    setTimeout: (timerCallback: () => void, delayMs: number) =>
      setTimeout(timerCallback, delayMs),
  };
  for (let index: number = 0; ; index++) {
    try {
      return await read();
    } catch (value: unknown) {
      if (index >= delays.length || !isRetryableFileReadAccessError(value)) {
        throw value;
      }
      onRetry?.(index + 1, value);
      await new Promise<void>(
        (scheduledCallback: () => void) => void clock.setTimeout(scheduledCallback, delays[index]),
      );
    }
  }
}
async function readJsonFileState(
  files: Files.BrowserFilesPort,
  path: string,
  timers?: Pick<Files.FilesTimers, "setTimeout">,
): Promise<JsonFileState> {
  let listed: boolean;
  try {
    listed = (
      await retryFileRead(() => listWritableFiles(files), timers)
    ).some((fileEntry: Files.FileListingRow): boolean => fileEntry.path === path);
  } catch (value: unknown) {
    return {
      state: "unreadable",
      ...((value as { narrowed?: unknown } | null)?.narrowed === true
        ? {
            narrowed: true,
          }
        : {}),
    };
  }
  if (!listed) {
    return {
      state: "absent",
    };
  }
  try {
    let value = await retryFileRead(() => files.readText(path), timers),
      parsedValue: unknown = null;
    try {
      parsedValue = JSON.parse(value.text);
    } catch {
      parsedValue = null;
    }
    return {
      state: "read",
      value: parsedValue,
      text: value.text,
      sha256: value.sha256,
    };
  } catch {
    return {
      state: "unreadable",
    };
  }
}
function damagedTextFiles(tree: {
  files: Map<string, Files.FilePublishInput>;
}) {
  return [...tree.files]
    .filter(([path, fileContent]: [string, Files.FilePublishInput]) =>
      isTextFileWithInvalidUnicode(path, fileContent),
    )
    .map(([path, fileContent]: [string, Files.FilePublishInput]) => ({
      path: path,
      why:
        filePublishRejectionReason(path, fileContent) ??
        uiMessage("design-system.paths.itsTextCannotBeSaved"),
    }));
}
function removeUnpublishableMigrationFiles(
  files: Map<string, Files.FilePublishInput>,
  type?: FileArtifactType,
) {
  let leftOut = [];
  for (let [value, fileContent] of [...files]) {
    let rejectionReason =
      restrictedFileNameReason(value) ??
      (type !== undefined && isPrivateProjectFile(type, value)
        ? uiMessage("design-system.paths.thisNameIsUsedBy")
        : undefined) ??
      (isPublishableFilePath(value)
        ? filePublishRejectionReason(value, fileContent)
        : undefined);
    if (rejectionReason === undefined) {
      continue;
    }
    files.delete(value);
    leftOut.push({
      path: value,
      why: rejectionReason,
    });
  }
  return leftOut;
}
export {
  canonicalFilePathWithinPrefix,
  damagedTextFiles,
  DEFAULT_FILE_VERSION_CAPS,
  encodeFileUrlPath,
  FILE_ALLOWED_MIME_TYPES,
  FILE_BINARY_MIME_TYPES,
  FILE_FETCH_RETRY_DELAYS_MS,
  FILE_MIME_TYPES_BY_EXTENSION,
  FILE_UNPAIRED_SURROGATE_PATTERN,
  fileContentBytes,
  fileContentContainsRuntimeMarkers,
  fileListingIsNarrowed,
  fileMimeTypeFromPath,
  filePublishContent,
  filePublishEncodedBytes,
  filePublishRawBytes,
  filePublishRejection,
  filePublishRejectionReason,
  filePublishSizeRejection,
  filesPortExtensions,
  FRAME_RUNTIME_BLOCK_END,
  FRAME_RUNTIME_BLOCK_START,
  hashFilePublishEntries,
  isHtmlFilePath,
  isPrivateProjectFile,
  isProjectIndexFilePath,
  isReservedProjectFile,
  isRetryableFileReadAccessError,
  isRuntimeInternalFilePath,
  isTextFileWithInvalidUnicode,
  LEGACY_PROJECT_INDEX_PATHS,
  listWritableFiles,
  MAX_FILE_BATCH_ENCODED_BYTES,
  MAX_FILE_BATCH_ENTRIES,
  MAX_FILE_PATH_UTF8_BYTES,
  MAX_FILE_PUBLISH_ENCODED_BYTES,
  MIGRATION_MANIFEST_PATH,
  normalizeDecodedFilePath,
  normalizeFilePublishInput,
  PATH_CONTROL_CHARACTER_PATTERN,
  PATH_RESERVED_CHARACTER_PATTERN,
  PathCheckError,
  PROJECT_FILE_PREFIX,
  PROJECT_INDEX_PATHS,
  PUBLIC_PROJECT_FILES_BY_TYPE,
  readJsonFileState,
  removeUnpublishableMigrationFiles,
  requireFileWithinPrefix,
  RESERVED_PROJECT_FILES_BY_TYPE,
  restrictedFileNameReason,
  retryFileRead,
  splitFilePublishBatches,
  stripFrameRuntimeBlock,
  TEXT_FILE_MIME_TYPES,
  textContainsInvalidUnicode,
  UNICODE_REPLACEMENT_CHARACTER,
  validateFilePath,
  validateFilePublishBatch,
  validateProjectFilePrefix,
};
export function installFilesPaths(): () => void {
  return () => {
    PROJECT_INDEX_PATHS = {
      design: "project/canvas.json",
      slides: "project/deck.json",
      designSystem: "project/design-system.json",
    };
    LEGACY_PROJECT_INDEX_PATHS = {
      designSystem: "design-system.json",
    };
    PROJECT_FILE_PREFIX = "project/";
    MIGRATION_MANIFEST_PATH = "project/migration.json";
    RESERVED_PROJECT_FILES_BY_TYPE = {
      design: ["canvas.json", "migration.json"],
      slides: ["deck.json", "migration.json", "store-meta.json"],
      design_system: [
        "design-system.json",
        "migration.json",
        "design-system.before-files.json",
        "publish-progress.json",
        "migration-map.json",
      ],
      migrated_design: ["compat.json", "publish-progress.json"],
    };
    PUBLIC_PROJECT_FILES_BY_TYPE = {
      slides: ["store-meta.json"],
    };
    isReservedProjectFile = (fileType: FileArtifactType, filePath: string) =>
      filePath.startsWith("project/") &&
      RESERVED_PROJECT_FILES_BY_TYPE[fileType].includes(filePath.slice(8));
    isPrivateProjectFile = (fileType: FileArtifactType, filePath: string) =>
      isReservedProjectFile(fileType, filePath) &&
      !(PUBLIC_PROJECT_FILES_BY_TYPE[fileType] ?? []).includes(filePath.slice(8));
    isRuntimeInternalFilePath = (filePath: string) =>
      filePath === "index.html" ||
      filePath === "SKILL.md" ||
      filePath.startsWith("artifact-type/");
    isProjectIndexFilePath = (filePath: string) =>
      filePath === PROJECT_INDEX_PATHS.design ||
      filePath === PROJECT_INDEX_PATHS.slides ||
      filePath === PROJECT_INDEX_PATHS.designSystem ||
      filePath === LEGACY_PROJECT_INDEX_PATHS.designSystem;
    MAX_FILE_BATCH_ENTRIES = 256;
    MAX_FILE_PATH_UTF8_BYTES = 512;
    MAX_FILE_PUBLISH_ENCODED_BYTES = 16777216;
    DEFAULT_FILE_VERSION_CAPS = {
      files: 512,
      bytes: 268435456,
    };
    MAX_FILE_BATCH_ENCODED_BYTES = 15728640;
    FILE_MIME_TYPES_BY_EXTENSION = new Map([
      ["html", "text/html"],
      ["htm", "text/html"],
      ["css", "text/css"],
      ["js", "text/javascript"],
      ["mjs", "text/javascript"],
      ["json", "application/json"],
      ["webmanifest", "application/manifest+json"],
      ["txt", "text/plain"],
      ["md", "text/markdown"],
      ["xml", "application/xml"],
      ["svg", "image/svg+xml"],
      ["png", "image/png"],
      ["jpg", "image/jpeg"],
      ["jpeg", "image/jpeg"],
      ["gif", "image/gif"],
      ["webp", "image/webp"],
      ["avif", "image/avif"],
      ["ico", "image/x-icon"],
      ["woff", "font/woff"],
      ["woff2", "font/woff2"],
      ["ttf", "font/ttf"],
      ["otf", "font/otf"],
      ["mp3", "audio/mpeg"],
      ["wav", "audio/wav"],
      ["mp4", "video/mp4"],
      ["webm", "video/webm"],
      ["pdf", "application/pdf"],
      ["wasm", "application/wasm"],
    ]);
    FILE_ALLOWED_MIME_TYPES = new Set([
      "text/html",
      "text/css",
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/manifest+json",
      "application/xml",
      "text/xml",
      "application/wasm",
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/avif",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "font/woff",
      "font/woff2",
      "font/ttf",
      "font/otf",
      "application/font-woff",
      "application/font-woff2",
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "application/pdf",
      "application/zip+dotlottie",
    ]);
    FILE_BINARY_MIME_TYPES = new Set([
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
      "application/x-figma",
    ]);
    TEXT_FILE_MIME_TYPES = new Set([
      "text/html",
      "text/ldx",
      "text/css",
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/manifest+json",
      "application/xml",
      "text/xml",
      "image/svg+xml",
    ]);
    UNICODE_REPLACEMENT_CHARACTER = String.fromCharCode(65533);
    FILE_UNPAIRED_SURROGATE_PATTERN =
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
    textContainsInvalidUnicode = (text: string) =>
      text.includes(UNICODE_REPLACEMENT_CHARACTER) ||
      FILE_UNPAIRED_SURROGATE_PATTERN.test(text);
    filePublishRejectionReason = (
      filePath: string,
      fileContent: Files.FilePublishInput,
    ) => filePublishRejection(filePath, fileContent)?.why;
    isHtmlFilePath = (filePath: string) => /\.html?$/i.test(filePath);
    FRAME_RUNTIME_BLOCK_START = "<\!-- frame-runtime -->";
    FRAME_RUNTIME_BLOCK_END = "<\!-- /frame-runtime -->";
    filePublishContent = (fileContent: Exclude<Files.FilePublishInput, null>) =>
      typeof fileContent === "object" &&
      !(typeof Blob !== "undefined" && fileContent instanceof Blob)
        ? (fileContent as NormalizedFilePublishInput).content
        : fileContent;
    encodeFileUrlPath = (filePath: string) =>
      filePath.split("/").map(encodeURIComponent).join("/");
    PathCheckError = class PathCheckError extends Error {
      declare name: string;
      code: PathCheckException["code"];
      subject: string;
      constructor(errorCode: PathCheckException["code"], subject: string) {
        super(errorCode + ": " + JSON.stringify(subject));
        this.code = errorCode;
        this.subject = subject;
        this.name = "PathCheckError";
      }
    };
    PATH_CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
    PATH_RESERVED_CHARACTER_PATTERN = /[%;:]/;
    FILE_FETCH_RETRY_DELAYS_MS = [50, 100, 200, 400, 800];
  };
}

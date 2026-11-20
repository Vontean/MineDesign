/** Restored application module; prepare first, initialize in original order. */
import type * as Core from "../contracts/model-core";
import type * as Model from "../contracts";
import type {
  FileBudgetUsage,
  FileKind,
  FileTable,
  ParseReport,
} from "../contracts";
import { canUseStoragePointer, carriedDocumentPath, COMPONENT_FILENAMES, COMPONENT_NAME_PATTERN, DESIGN_SYSTEM_PATHS, explainGeneratedOrRetiredPath, explainReservedSystemPath, explainToolConfigurationPath, fileExtension, hasGeneratedSystemHeader, isGeneratedSystemPath, isImageSlotStatePath, isTextFilePath, isValidDesignSystemPath, MAX_DESIGN_SYSTEM_FILES, parseDataUriHeader, parseStoragePointer, storageKindForFile, storagePointerForFile } from "./file-policy";

var fileBudgetEncoder: TextEncoder;
var ARTIFACT_FILE_LIMITS: {
  files: number;
  total: number;
  file: number;
  call: number;
  callBytes: number;
};
var ARTIFACT_FILE_CAPACITY: { files: number; bytes: number };
var MIRROR_MIME_TYPES: Record<string, string>;
var HELD_BINARY_MIME_TYPES: Record<string, string>;
var embeddedStringSizeCache: Map<string, number>;
var embeddedStringCacheCharacters: number;
var MAX_EMBEDDED_STRING_CACHE_CHARACTERS: number;
var MIN_CACHED_STRING_LENGTH: number;
var JSON_STRING_ESCAPE_PATTERN: RegExp;
var KIBIBYTE: number;
var MEBIBYTE: number;
var MAX_PRETTY_MANIFEST_BYTES: number;
var DESIGN_SYSTEM_INLINE_LIMITS: Core.InlineLimits;
var MAX_DISPLAYED_DOCUMENTS: number;
var DESIGN_SYSTEM_MANIFEST_VERSION: number;
var isFileTableObject: (input: unknown) => input is Record<string, unknown>;
var unboundedFileParsing: boolean;
function mirrorMimeTypeForPath(path: string) {
  let extension = fileExtension(path);
  if (Object.hasOwn(MIRROR_MIME_TYPES, extension)) {
    return MIRROR_MIME_TYPES[extension];
  } else {
    return null;
  }
}
function isPublishableFilePathModelFileTable(path: string): boolean {
  if (
    !isValidDesignSystemPath(path) ||
    fileBudgetEncoder.encode(path).length > 512
  ) {
    return false;
  }
  if (
    /[%;:?#\\\u0000-\u001f\u007f]/.test(path) ||
    path.startsWith("_") ||
    path.endsWith(".cmekshadow")
  ) {
    return false;
  }
  return true;
}
function isMirrorEligiblePath(path: string) {
  if (
    path.toLowerCase() === "index.html" ||
    path.startsWith("components/src/")
  ) {
    return false;
  }
  if (
    path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir) &&
    path.endsWith("/" + COMPONENT_FILENAMES.preview)
  ) {
    return false;
  }
  if (
    !isTextFilePath(path) &&
    !path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)
  ) {
    return false;
  }
  if (
    path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir) &&
    canUseStoragePointer(path)
  ) {
    return false;
  }
  return (
    isPublishableFilePathModelFileTable(path) &&
    mirrorMimeTypeForPath(path) !== null
  );
}
function isMirrorEligibleFile(path: string, content: string): boolean {
  if (
    !isMirrorEligiblePath(path) ||
    storagePointerForFile(path, content) !== null
  ) {
    return false;
  }
  if (isTextFilePath(path)) {
    return !content.includes(String.fromCharCode(65533));
  } else {
    return parseDataUriHeader(content)?.base64 === true;
  }
}
function estimateEmbeddedStringBytes(text: string) {
  if (text.length >= MIN_CACHED_STRING_LENGTH) {
    let entry = embeddedStringSizeCache.get(text);
    if (entry !== undefined) {
      embeddedStringSizeCache.delete(text);
      embeddedStringSizeCache.set(text, entry);
      return entry;
    }
  }
  let bytes: number;
  if (typeof text === "string" && !JSON_STRING_ESCAPE_PATTERN.test(text)) {
    bytes = text.length + 2;
  } else {
    let index: number = 0;
    for (let characterIndex: number = 0; characterIndex < text.length; characterIndex++) {
      if (text.charCodeAt(characterIndex) === 60) {
        index++;
      }
    }
    bytes =
      fileBudgetEncoder.encode(JSON.stringify(text)).length + 5 * index;
  }
  if (text.length >= MIN_CACHED_STRING_LENGTH) {
    embeddedStringSizeCache.set(text, bytes);
    embeddedStringCacheCharacters += text.length;
    for (let [cachedText] of embeddedStringSizeCache) {
      if (
        embeddedStringCacheCharacters <= MAX_EMBEDDED_STRING_CACHE_CHARACTERS
      ) {
        break;
      }
      embeddedStringSizeCache.delete(cachedText);
      embeddedStringCacheCharacters -= cachedText.length;
    }
  }
  return bytes;
}
function isAdditionalMarkdownPath(path: string) {
  return (
    path !== DESIGN_SYSTEM_PATHS.readme &&
    !path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir) &&
    !path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir) &&
    !path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) &&
    !path.startsWith(DESIGN_SYSTEM_PATHS.archivedDir) &&
    /\.(?:mdx?|markdown)$/i.test(path)
  );
}
function classifyDesignSystemFile(path: string): FileKind {
  if (path === DESIGN_SYSTEM_PATHS.readme) {
    return "readme";
  }
  if (path === DESIGN_SYSTEM_PATHS.tokens) {
    return "tokens";
  }
  if (isAdditionalMarkdownPath(path)) {
    return "doc";
  }
  if (path === DESIGN_SYSTEM_PATHS.manifest) {
    return "manifest";
  }
  if (path === DESIGN_SYSTEM_PATHS.bundleJs) {
    return "bundleJs";
  }
  if (path === DESIGN_SYSTEM_PATHS.bundleCss) {
    return "bundleCss";
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir)) {
    if (path.startsWith(DESIGN_SYSTEM_PATHS.libDir)) {
      return "componentLib";
    }
    if (fileExtension(path) === "d.ts") {
      return "dts";
    }
    let value = path
      .slice(DESIGN_SYSTEM_PATHS.componentsDir.length)
      .split("/");
    if (
      value.length === 2 &&
      value[1] === COMPONENT_FILENAMES.preview
    ) {
      return "preview";
    }
    if (
      value.length === 2 &&
      value[1] === COMPONENT_FILENAMES.readme
    ) {
      return "componentReadme";
    }
    if (value[0] === "src" && value.length >= 2) {
      return "componentSource";
    }
    return "componentOther";
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)) {
    return "font";
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
    return "asset";
  }
  if (fileExtension(path) === "d.ts") {
    return "dts";
  }
  return "other";
}
function inlineLimitForFileKind(fileKind: FileKind) {
  switch (fileKind) {
    case "readme":
      return DESIGN_SYSTEM_INLINE_LIMITS.readme;
    case "doc":
      return DESIGN_SYSTEM_INLINE_LIMITS.other;
    case "tokens":
      return DESIGN_SYSTEM_INLINE_LIMITS.tokens;
    case "manifest":
      return DESIGN_SYSTEM_INLINE_LIMITS.manifest;
    case "bundleJs":
      return DESIGN_SYSTEM_INLINE_LIMITS.bundleJs;
    case "bundleCss":
      return DESIGN_SYSTEM_INLINE_LIMITS.bundleCss;
    case "dts":
      return DESIGN_SYSTEM_INLINE_LIMITS.dtsTotal;
    case "preview":
      return DESIGN_SYSTEM_INLINE_LIMITS.preview;
    case "componentReadme":
      return DESIGN_SYSTEM_INLINE_LIMITS.componentReadme;
    case "componentSource":
      return DESIGN_SYSTEM_INLINE_LIMITS.other;
    case "componentLib":
      return DESIGN_SYSTEM_INLINE_LIMITS.componentLib;
    case "componentOther":
      return DESIGN_SYSTEM_INLINE_LIMITS.other;
    case "font":
      return DESIGN_SYSTEM_INLINE_LIMITS.font;
    case "asset":
      return DESIGN_SYSTEM_INLINE_LIMITS.asset;
    case "other":
      return DESIGN_SYSTEM_INLINE_LIMITS.other;
  }
}
function inlineLimitForPath(
  path: string,
  fileKind: FileKind = classifyDesignSystemFile(path),
) {
  if (isImageSlotStatePath(path)) {
    return DESIGN_SYSTEM_INLINE_LIMITS.imageSlotState;
  } else {
    return inlineLimitForFileKind(fileKind);
  }
}
function inlineLimitLabelForPath(
  path: string,
  fileKind: FileKind = classifyDesignSystemFile(path),
) {
  if (isImageSlotStatePath(path)) {
    return "image-slot state";
  } else {
    return fileKind;
  }
}
function parseLegacyComponentPath(path: string) {
  if (!path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir)) {
    return null;
  }
  let segments = path
    .slice(DESIGN_SYSTEM_PATHS.componentsDir.length)
    .split("/");
  if (segments.length !== 3) {
    return null;
  }
  let [group, name, filename] = segments;
  if (group === "src" || !COMPONENT_NAME_PATTERN.test(name)) {
    return null;
  }
  let lowerFilename = filename.toLowerCase(),
    lowerName = name.toLowerCase();
  for (let value of ["html", "prompt.md", "d.ts", "jsx"]) {
    if (lowerFilename === lowerName + "." + value) {
      return {
        group: group,
        name: name,
        ext: value,
      };
    }
  }
  return null;
}
function normalizeDesignSystemPath(path: string) {
  let lowerPath = path.toLowerCase();
  if (lowerPath === "readme.md" || lowerPath === "readme.markdown") {
    return DESIGN_SYSTEM_PATHS.readme;
  }
  if (lowerPath === "tokens.json") {
    return DESIGN_SYSTEM_PATHS.tokens;
  }
  if (lowerPath === "manifest.json" || lowerPath === "_ds_manifest.json") {
    return DESIGN_SYSTEM_PATHS.manifest;
  }
  if (
    lowerPath === "_ds_bundle.js" ||
    lowerPath === "bundle.js" ||
    lowerPath === "components/_ds_bundle.js" ||
    lowerPath === "components/bundle.js"
  ) {
    return DESIGN_SYSTEM_PATHS.bundleJs;
  }
  if (
    lowerPath === "_ds_bundle.css" ||
    lowerPath === "bundle.css" ||
    lowerPath === "styles.css" ||
    lowerPath === "components/_ds_bundle.css" ||
    lowerPath === "components/bundle.css" ||
    lowerPath === "components/styles.css"
  ) {
    return DESIGN_SYSTEM_PATHS.bundleCss;
  }
  if (
    lowerPath === "index.d.ts" ||
    lowerPath === "components.d.ts" ||
    lowerPath === "components/components.d.ts"
  ) {
    return DESIGN_SYSTEM_PATHS.indexDts;
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir)) {
    let value = path
      .slice(DESIGN_SYSTEM_PATHS.componentsDir.length)
      .split("/");
    if (value.length === 1) {
      let basename = value[0],
        htmlMatch = /^([A-Za-z_$][A-Za-z0-9_$]*)\.html?$/.exec(basename);
      if (htmlMatch !== null) {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          htmlMatch[1] +
          "/" +
          COMPONENT_FILENAMES.preview
        );
      }
      htmlMatch = /^([A-Za-z_$][A-Za-z0-9_$]*)\.(?:prompt\.)?md$/.exec(basename);
      if (htmlMatch !== null && basename.toLowerCase() !== "readme.md") {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          htmlMatch[1] +
          "/" +
          COMPONENT_FILENAMES.readme
        );
      }
    } else if (value.length === 2) {
      let [componentName, extension] = value,
        lowercasePath = extension.toLowerCase();
      if (
        lowercasePath === "readme.md" ||
        lowercasePath === componentName.toLowerCase() + ".prompt.md" ||
        lowercasePath === "prompt.md" ||
        lowercasePath === "usage.md"
      ) {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          componentName +
          "/" +
          COMPONENT_FILENAMES.readme
        );
      }
      if (
        lowercasePath === "preview.html" ||
        lowercasePath === "index.html" ||
        lowercasePath === componentName.toLowerCase() + ".html"
      ) {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          componentName +
          "/" +
          COMPONENT_FILENAMES.preview
        );
      }
    } else {
      let legacyPath = parseLegacyComponentPath(path);
      if (legacyPath !== null && legacyPath.ext === "html") {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          legacyPath.name +
          "/" +
          COMPONENT_FILENAMES.preview
        );
      }
      if (legacyPath !== null && legacyPath.ext === "prompt.md") {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          legacyPath.name +
          "/" +
          COMPONENT_FILENAMES.readme
        );
      }
      if (legacyPath !== null && legacyPath.ext === "d.ts") {
        return (
          DESIGN_SYSTEM_PATHS.componentsDir +
          legacyPath.name +
          "/" +
          legacyPath.name +
          ".d.ts"
        );
      }
    }
  }
  return path;
}
function parseManifest(
  inputManifest: unknown,
  report: ParseReport = { dropped: [], warnings: [] },
) {
  let parsed: unknown = inputManifest;
  if (typeof parsed === "string") {
    if (parsed.trim() === "") {
      return {};
    }
    try {
      parsed = JSON.parse(parsed);
    } catch (value) {
      let manifestVersion: string =
        "manifest.json: " + String((value as Error).message).slice(0, 120);
      if (!report.dropped.includes(manifestVersion)) {
        report.dropped.push(manifestVersion);
      }
      return {};
    }
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    if (
      !report.warnings.some((warning) =>
        warning.startsWith("manifest.json: not a JSON object"),
      )
    ) {
      report.warnings.push(
        "manifest.json: not a JSON object — ignored and regenerated",
      );
    }
    return {};
  }
  let manifest = parsed as Core.ManifestObject;
  if (manifest.manifestVersion !== DESIGN_SYSTEM_MANIFEST_VERSION) {
    if (
      Object.keys(manifest).length > 0 &&
      !report.warnings.some((warning) =>
        warning.startsWith("manifest.json: not manifestVersion"),
      )
    ) {
      report.warnings.push(
        "manifest.json: not manifestVersion " +
          String(DESIGN_SYSTEM_MANIFEST_VERSION) +
          " — ignored and regenerated (its asset notes and lastChange are not carried)",
      );
    }
    return {};
  }
  return manifest;
}
function createParseReport() {
  return {
    dropped: [],
    warnings: [],
  };
}
function setUnboundedFileParsing(enabled: boolean): void {
  unboundedFileParsing = enabled;
}
function isUnboundedFileParsing() {
  return unboundedFileParsing;
}
function parseFileTable(
  inputFiles: unknown,
  report: ParseReport = createParseReport(),
  parseOptions: {
    unbounded?: boolean;
  } = {},
): FileTable {
  let sourceFiles: Record<string, unknown> = isFileTableObject(inputFiles)
      ? inputFiles
      : {},
    acceptedFiles = new Map<string, { from: string; value: string }>(),
    bounded: boolean = !(parseOptions.unbounded ?? unboundedFileParsing),
    totalBytes = 0,
    declarationBytes = 0,
    fileCount: number = 0;
  for (let value in sourceFiles) {
    if (!Object.hasOwn(sourceFiles, value)) {
      continue;
    }
    let parseError =
      typeof value === "string"
        ? explainToolConfigurationPath(value)
        : null;
    if (parseError !== null) {
      report.dropped.push(
        "file " + JSON.stringify(value.slice(0, 80)) + ": " + parseError,
      );
      continue;
    }
    if (!isValidDesignSystemPath(value)) {
      report.dropped.push(
        "file " +
          JSON.stringify(String(value).slice(0, 80)) +
          ": invalid path",
      );
      continue;
    }
    let fileValue = sourceFiles[value];
    if (typeof fileValue !== "string") {
      report.dropped.push("file " + value + ": not a string");
      continue;
    }
    let normalizedPath = normalizeDesignSystemPath(value);
    if (
      isGeneratedSystemPath(normalizedPath) &&
      !hasGeneratedSystemHeader(normalizedPath, fileValue)
    ) {
      let extensionIndex = carriedDocumentPath(normalizedPath),
        callback = (isAcceptedPath: string) =>
          acceptedFiles.has(isAcceptedPath) || Object.hasOwn(sourceFiles, isAcceptedPath),
        extensionLength =
          extensionIndex.lastIndexOf(".") > extensionIndex.lastIndexOf("/")
            ? extensionIndex.lastIndexOf(".")
            : extensionIndex.length,
        candidatePath = extensionIndex;
      for (let count: number = 2; count < 10 && callback(candidatePath); count++) {
        candidatePath =
          extensionIndex.slice(0, extensionLength) +
          "-" +
          String(count) +
          extensionIndex.slice(extensionLength);
      }
      if (callback(candidatePath)) {
        report.dropped.push(
          "file " +
            normalizedPath +
            ": " +
            extensionIndex +
            " and its numbered names are taken — rename the file",
        );
        continue;
      }
      report.warnings.push(
        "file " +
          normalizedPath +
          ": carried as " +
          candidatePath +
          " — that name is generated beside the page on every save",
      );
      normalizedPath = candidatePath;
    }
    if (normalizedPath !== value && !isValidDesignSystemPath(normalizedPath)) {
      report.dropped.push("file " + value + ": invalid after normalization");
      continue;
    }
    let inlineError =
      explainGeneratedOrRetiredPath(normalizedPath) ??
      explainReservedSystemPath(normalizedPath);
    if (inlineError !== null) {
      report.dropped.push("file " + normalizedPath + ": " + inlineError);
      continue;
    }
    let entry = acceptedFiles.get(normalizedPath);
    if (entry !== undefined) {
      if (entry.from === normalizedPath || value !== normalizedPath) {
        report.warnings.push(
          "file " +
            value +
            ": duplicate of " +
            entry.from +
            " after normalization — ignored",
        );
        continue;
      }
    } else if (bounded && fileCount >= MAX_DESIGN_SYSTEM_FILES) {
      report.dropped.push(
        "file " +
          value +
          ": over the " +
          String(MAX_DESIGN_SYSTEM_FILES) +
          "-file cap",
      );
      continue;
    }
    let fileKind = classifyDesignSystemFile(normalizedPath);
    if (
      !isTextFilePath(normalizedPath) &&
      parseDataUriHeader(fileValue) === null &&
      parseStoragePointer(fileValue) === null
    ) {
      report.dropped.push(
        "file " +
          normalizedPath +
          ": binary file must be a data: URI or a blob:/file: pointer",
      );
      continue;
    }
    let previousInlineBytes =
        entry !== undefined ? estimateEmbeddedStringBytes(entry.value) : 0,
      previousDeclarationBytes = entry !== undefined && fileKind === "dts" ? previousInlineBytes : 0,
      inlineBytes = estimateEmbeddedStringBytes(fileValue);
    if (bounded) {
      if (fileKind === "dts") {
        if (
          declarationBytes - previousDeclarationBytes + inlineBytes >
          DESIGN_SYSTEM_INLINE_LIMITS.dtsTotal
        ) {
          report.dropped.push(
            "file " +
              normalizedPath +
              ": .d.ts total would exceed " +
              formatInlineBudgetBytes(DESIGN_SYSTEM_INLINE_LIMITS.dtsTotal),
          );
          continue;
        }
      } else if (inlineBytes > inlineLimitForPath(normalizedPath, fileKind)) {
        report.dropped.push(
          "file " +
            normalizedPath +
            ": " +
            formatInlineBudgetBytes(inlineBytes) +
            " exceeds the " +
            inlineLimitLabelForPath(normalizedPath, fileKind) +
            " cap of " +
            formatInlineBudgetBytes(inlineLimitForPath(normalizedPath, fileKind)),
        );
        continue;
      }
      if (totalBytes - previousInlineBytes + inlineBytes > DESIGN_SYSTEM_INLINE_LIMITS.total) {
        report.dropped.push(
          "file " +
            normalizedPath +
            ": document total would exceed " +
            formatInlineBudgetBytes(DESIGN_SYSTEM_INLINE_LIMITS.total),
        );
        continue;
      }
    }
    if (entry !== undefined) {
      report.warnings.push(
        "file " + entry.from + ": superseded by canonically-named " + value,
      );
      totalBytes -= previousInlineBytes;
      declarationBytes -= previousDeclarationBytes;
      fileCount--;
    }
    if (fileKind === "dts") {
      declarationBytes += inlineBytes;
    }
    totalBytes += inlineBytes;
    fileCount++;
    acceptedFiles.set(normalizedPath, {
      from: value,
      value: fileValue,
    });
  }
  let sortedEntries = [...acceptedFiles.entries()]
    .sort((leftEntry, rightEntry): number =>
      leftEntry[0] < rightEntry[0] ? -1 : leftEntry[0] > rightEntry[0] ? 1 : 0,
    )
    .map(([path, entry]) => [path, entry.value]);
  return Object.freeze(Object.fromEntries(sortedEntries));
}
function formatInlineBudgetBytes(bytes: number): string {
  if (bytes >= MEBIBYTE) {
    return (bytes / MEBIBYTE).toFixed(bytes >= 10 * MEBIBYTE ? 0 : 1) + " MB";
  }
  if (bytes >= KIBIBYTE) {
    return Math.round(bytes / KIBIBYTE).toString() + " KB";
  }
  return String(bytes) + " B";
}
function computeFileBudgetUsage(
  files: FileTable,
  storedBytesForPath: (path: string) => number = (): number => 0,
  inlineBytesForPath?: (path: string) => number | undefined,
): FileBudgetUsage {
  let usage = {} as FileBudgetUsage,
    usageKinds: (keyof FileBudgetUsage)[] = [
      "readme",
      "doc",
      "tokens",
      "manifest",
      "bundleJs",
      "bundleCss",
      "dts",
      "preview",
      "componentReadme",
      "componentSource",
      "componentLib",
      "componentOther",
      "font",
      "asset",
      "other",
      "total",
      "blob",
      "beside",
    ];
  for (let value of usageKinds) {
    usage[value] = {
      files: 0,
      bytes: 0,
    };
  }
  for (let value in files) {
    let fileValue = files[value],
      fileBytes =
        inlineBytesForPath?.(value) ?? estimateEmbeddedStringBytes(fileValue),
      fileKind = classifyDesignSystemFile(value);
    usage[fileKind].files++;
    usage[fileKind].bytes += fileBytes;
    usage.total.files++;
    usage.total.bytes += fileBytes;
    let storageKind = storageKindForFile(value, fileValue);
    if (storageKind === "blob") {
      usage.blob.files++;
      usage.blob.bytes += storedBytesForPath(value);
    } else if (storageKind === "file") {
      usage.beside.files++;
      usage.beside.bytes += storedBytesForPath(value);
    }
  }
  return usage;
}
export {
  ARTIFACT_FILE_CAPACITY,
  ARTIFACT_FILE_LIMITS,
  classifyDesignSystemFile,
  computeFileBudgetUsage,
  createParseReport,
  DESIGN_SYSTEM_INLINE_LIMITS,
  DESIGN_SYSTEM_MANIFEST_VERSION,
  embeddedStringCacheCharacters,
  embeddedStringSizeCache,
  estimateEmbeddedStringBytes,
  fileBudgetEncoder,
  formatInlineBudgetBytes,
  HELD_BINARY_MIME_TYPES,
  inlineLimitForFileKind,
  inlineLimitForPath,
  inlineLimitLabelForPath,
  isAdditionalMarkdownPath,
  isFileTableObject,
  isMirrorEligibleFile,
  isMirrorEligiblePath,
  isPublishableFilePathModelFileTable,
  isUnboundedFileParsing,
  JSON_STRING_ESCAPE_PATTERN,
  KIBIBYTE,
  MAX_DISPLAYED_DOCUMENTS,
  MAX_EMBEDDED_STRING_CACHE_CHARACTERS,
  MAX_PRETTY_MANIFEST_BYTES,
  MEBIBYTE,
  MIN_CACHED_STRING_LENGTH,
  MIRROR_MIME_TYPES,
  mirrorMimeTypeForPath,
  normalizeDesignSystemPath,
  parseFileTable,
  parseLegacyComponentPath,
  parseManifest,
  setUnboundedFileParsing,
  unboundedFileParsing,
};
export function installModelFileTable(): () => void {
  return () => {
    fileBudgetEncoder = new TextEncoder();
    ARTIFACT_FILE_LIMITS = {
      files: 1024,
      total: 268435456,
      file: 15728640,
      call: 256,
      callBytes: 67108864,
    };
    ARTIFACT_FILE_CAPACITY = {
      files: ARTIFACT_FILE_LIMITS.files,
      bytes: ARTIFACT_FILE_LIMITS.total,
    };
    MIRROR_MIME_TYPES = {
      md: "text/markdown",
      mdx: "text/markdown",
      markdown: "text/markdown",
      json: "application/json",
      lottie: "application/json",
      css: "text/css",
      svg: "text/plain",
      html: "text/plain",
      htm: "text/plain",
      xml: "text/plain",
      js: "text/plain",
      mjs: "text/plain",
      cjs: "text/plain",
      txt: "text/plain",
      jsx: "text/plain",
      ts: "text/plain",
      tsx: "text/plain",
      "d.ts": "text/plain",
      csv: "text/plain",
      yml: "text/plain",
      yaml: "text/plain",
      toml: "text/plain",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      avif: "image/avif",
      ico: "image/x-icon",
      mp4: "video/mp4",
      webm: "video/webm",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      woff2: "font/woff2",
      woff: "font/woff",
      ttf: "font/ttf",
      otf: "font/otf",
      pdf: "application/pdf",
    };
    HELD_BINARY_MIME_TYPES = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      zip: "application/zip",
      fig: "application/x-figma",
    };
    embeddedStringSizeCache = new Map();
    embeddedStringCacheCharacters = 0;
    MAX_EMBEDDED_STRING_CACHE_CHARACTERS = 50331648;
    MIN_CACHED_STRING_LENGTH = 2048;
    JSON_STRING_ESCAPE_PATTERN = /[^\x20\x21\x23-\x3b\x3d-\x5b\x5d-\x7e]/;
    KIBIBYTE = 1024;
    MEBIBYTE = 1048576;
    MAX_PRETTY_MANIFEST_BYTES = 512 * KIBIBYTE;
    DESIGN_SYSTEM_INLINE_LIMITS = {
      readme: 200 * KIBIBYTE,
      tokens: 512 * KIBIBYTE,
      manifest: 6 * MEBIBYTE,
      bundleJs: 6 * MEBIBYTE,
      bundleCss: 2 * MEBIBYTE,
      dtsTotal: 1.5 * MEBIBYTE,
      preview: 256 * KIBIBYTE,
      componentReadme: 64 * KIBIBYTE,
      componentLib: 2 * MEBIBYTE,
      font: 1 * MEBIBYTE,
      asset: 12 * MEBIBYTE,
      other: 512 * KIBIBYTE,
      imageSlotState: 12 * MEBIBYTE,
      total: 14 * MEBIBYTE,
    };
    MAX_DISPLAYED_DOCUMENTS = 24;
    DESIGN_SYSTEM_MANIFEST_VERSION = 3;
    isFileTableObject = (candidate: unknown): candidate is Record<string, unknown> =>
      typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
    unboundedFileParsing = false;
  };
}

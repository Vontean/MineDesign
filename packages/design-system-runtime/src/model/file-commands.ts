/** Restored application module; prepare first, initialize in original order. */
import type * as Model from "../contracts";
import type * as Core from "../contracts/model-core";
import { canUseStoragePointer, DESIGN_SYSTEM_PATHS, explainGeneratedOrRetiredPath, explainReservedSystemPath, fileExtension, isTextFilePath, isValidDesignSystemPath, MAX_DESIGN_SYSTEM_FILES, parseDataUriHeader, parseStoragePointer, storagePointerForFile } from "./file-policy";
import { classifyDesignSystemFile, DESIGN_SYSTEM_INLINE_LIMITS, estimateEmbeddedStringBytes, inlineLimitForPath, isUnboundedFileParsing, normalizeDesignSystemPath } from "./file-table";

var fileTableBytesCache: WeakMap<Model.FileTable, number>;
var protectedFilePathPredicate: (path: string) => boolean;
function freezeSortedFileTable(files: Model.FileTable) {
  let sorted: Record<string, string> = {};
  for (let value of Object.keys(files).sort()) {
    sorted[value] = files[value];
  }
  return Object.freeze(sorted);
}
function contentWithFiles(
  previousContent: Model.DesignSystemContent,
  files: Model.FileTable,
): Model.DesignSystemContent {
  return {
    v: 2,
    files: freezeSortedFileTable(files),
  };
}
function fileTableInlineBytes(files: Model.FileTable) {
  let cached = fileTableBytesCache.get(files);
  if (cached !== undefined) {
    return cached;
  }
  let bytes = 0;
  for (let value in files) {
    bytes += estimateEmbeddedStringBytes(files[value]);
  }
  fileTableBytesCache.set(files, bytes);
  return bytes;
}
function fileFitsInlineBudgets(
  content: Model.DesignSystemContent,
  path: string,
  fileContents: string,
): boolean {
  if (isUnboundedFileParsing()) {
    return true;
  }
  let kind = classifyDesignSystemFile(path),
    bytes = estimateEmbeddedStringBytes(fileContents);
  if (kind === "dts") {
    let contentBytes = bytes;
    for (let filePath in content.files) {
      if (
        filePath !== path &&
        classifyDesignSystemFile(filePath) === "dts"
      ) {
        contentBytes += estimateEmbeddedStringBytes(
          content.files[filePath],
        );
      }
    }
    if (contentBytes > DESIGN_SYSTEM_INLINE_LIMITS.dtsTotal) {
      return false;
    }
  } else if (bytes > inlineLimitForPath(path, kind)) {
    return false;
  }
  let previousValue = content.files[path];
  if (
    previousValue === undefined &&
    Object.keys(content.files).length >= MAX_DESIGN_SYSTEM_FILES
  ) {
    return false;
  }
  return (
    fileTableInlineBytes(content.files) -
      (previousValue !== undefined
        ? estimateEmbeddedStringBytes(previousValue)
        : 0) +
      bytes <=
    DESIGN_SYSTEM_INLINE_LIMITS.total
  );
}
function setDesignSystemFile(
  content: Model.DesignSystemContent,
  path: string,
  fileContents: string,
) {
  if (!isValidDesignSystemPath(path)) {
    return content;
  }
  let canonicalPath = normalizeDesignSystemPath(path);
  if (
    !isValidDesignSystemPath(canonicalPath) ||
    explainGeneratedOrRetiredPath(canonicalPath) !== null ||
    explainReservedSystemPath(canonicalPath) !== null
  ) {
    return content;
  }
  if (
    !isTextFilePath(canonicalPath) &&
    parseDataUriHeader(fileContents) === null &&
    parseStoragePointer(fileContents) === null
  ) {
    return content;
  }
  if (content.files[canonicalPath] === fileContents) {
    return content;
  }
  if (!fileFitsInlineBudgets(content, canonicalPath, fileContents)) {
    return content;
  }
  return contentWithFiles(content, {
    ...content.files,
    [canonicalPath]: fileContents,
  });
}
function setProtectedFilePathPredicate(
  predicate: ((path: string) => boolean) | undefined,
): void {
  protectedFilePathPredicate = predicate ?? ((): boolean => false);
}
function deleteDesignSystemFiles(
  content: Model.DesignSystemContent,
  paths: string[],
) {
  let removable = paths.filter(
    (path) =>
      Object.hasOwn(content.files, path) &&
      !protectedFilePathPredicate(path),
  );
  if (removable.length === 0) {
    return content;
  }
  let files = {
    ...content.files,
  };
  for (let value of removable) {
    delete files[value];
  }
  return contentWithFiles(content, files);
}
function renameDesignSystemFile(
  content: Model.DesignSystemContent,
  oldPath: string,
  newPath: string,
) {
  if (
    !Object.hasOwn(content.files, oldPath) ||
    oldPath === newPath ||
    protectedFilePathPredicate(oldPath)
  ) {
    return content;
  }
  if (
    !isValidDesignSystemPath(newPath) ||
    normalizeDesignSystemPath(newPath) !== newPath ||
    explainGeneratedOrRetiredPath(newPath) !== null ||
    explainReservedSystemPath(newPath) !== null
  ) {
    return content;
  }
  if (Object.hasOwn(content.files, newPath)) {
    return content;
  }
  if (
    isTextFilePath(oldPath) !==
    isTextFilePath(newPath)
  ) {
    return content;
  }
  if (
    storagePointerForFile(oldPath, content.files[oldPath]) !==
      null &&
    !canUseStoragePointer(newPath)
  ) {
    return content;
  }
  let files = {
    ...content.files,
  };
  files[newPath] = files[oldPath];
  delete files[oldPath];
  return contentWithFiles(content, files);
}
function unusedFileName(
  files: Model.FileTable,
  directory: string,
  filename: string,
) {
  let prefix: string = directory === "" ? "" : directory + "/";
  if (!Object.hasOwn(files, prefix + filename)) {
    return filename;
  }
  let dotOffset = filename.lastIndexOf("."),
    stem = dotOffset > 0 ? filename.slice(0, dotOffset) : filename,
    extension = dotOffset > 0 ? filename.slice(dotOffset) : "";
  for (let count: number = 2; count < 1000; count++) {
    let value: string = stem + " (" + String(count) + ")" + extension;
    if (!Object.hasOwn(files, prefix + value)) {
      return value;
    }
  }
  return stem + " (" + Date.now().toString(36) + ")" + extension;
}
function sanitizeUploadFileName(filename: string) {
  filename = filename.replace(
    /[\u0080-\u009f\u200b\u200e\u200f\u202a-\u202e\u2060-\u206f\u2028\u2029\u2215\u2044\ufeff\uff0f$`":*?[]/g,
    "-",
  );
  let safeName = filename.replace(/[/\\\u0000-\u001f\u007f]+/g, "-").trim();
  safeName = safeName.replace(/^[.\s~-]+/, "");
  let extension = fileExtension(filename);
  if (safeName === "" || safeName.toLowerCase() === extension) {
    safeName = "file" + (extension !== "" ? "." + extension : "");
  }
  return safeName.slice(0, 120);
}
function setDesignSystemReadme(
  content: Model.DesignSystemContent,
  markdown: string,
) {
  if (
    (content.files[DESIGN_SYSTEM_PATHS.readme] ?? "") === markdown
  ) {
    return content;
  }
  if (markdown === "") {
    return deleteDesignSystemFiles(content, [
      DESIGN_SYSTEM_PATHS.readme,
    ]);
  }
  return setDesignSystemFile(
    content,
    DESIGN_SYSTEM_PATHS.readme,
    markdown,
  );
}
function setAdditionalDocument(
  content: Model.DesignSystemContent,
  path: string,
  markdown: string,
) {
  if (classifyDesignSystemFile(path) !== "doc") {
    return content;
  }
  if (
    Object.hasOwn(content.files, path) &&
    content.files[path] === markdown
  ) {
    return content;
  }
  return setDesignSystemFile(content, path, markdown);
}
export {
  contentWithFiles,
  deleteDesignSystemFiles,
  fileFitsInlineBudgets,
  fileTableBytesCache,
  fileTableInlineBytes,
  freezeSortedFileTable,
  protectedFilePathPredicate,
  renameDesignSystemFile,
  sanitizeUploadFileName,
  setAdditionalDocument,
  setDesignSystemFile,
  setDesignSystemReadme,
  setProtectedFilePathPredicate,
  unusedFileName,
};
export function installModelFileCommands(): () => void {
  return () => {
    fileTableBytesCache = new WeakMap();
    protectedFilePathPredicate = (): boolean => false;
  };
}

import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type { FileArtifactType } from "../../contracts/files-core";
import type {
  BrowserFileType,
  BrowserEntryType,
  BrowserSection,
  BrowserListingEntry,
  BrowserFolder,
  BrowserFile,
  BrowserEntry,
  BrowserRow,
  BrowserFileMetadata,
  VirtualFileStack,
  BrowserPreviewOptions,
} from "../../contracts/file-browser";
import { loadReactDomNamespace, loadReactNamespace } from "../../dependencies";
import { DOWNLOAD_NAME_IGNORABLE_PATTERN } from "../../editor/download-permission";
import { isReservedProjectFile, PROJECT_FILE_PREFIX } from "../paths";
import { toModuleNamespace } from "../../module-helpers";

var reactDesignSystemFiles: typeof import("react");
var reactDomDesignSystemFiles: typeof import("react-dom");
var reactFilesBrowser: typeof import("react");
var reactDomFilesBrowser: typeof import("react-dom");
var FILE_BROWSER_SECTION_ORDER: BrowserSection[];
var FILE_BROWSER_SECTION_BY_TYPE: Record<BrowserEntryType, BrowserSection>;
var FILE_BROWSER_KIND_LABELS: Record<BrowserEntryType, string>;
var fileBrowserSize: (value: unknown) => number | undefined;
var fileBrowserContentType: (value: unknown) => string | undefined;
var visibleFileName: (value: string) => string;
var sanitizedFileName: (value: string) => string;
var fileNameCollator: Intl.Collator;
var compareFileNames: (first: string, second: string) => number;
var MAX_FILE_BROWSER_TEXT_BYTES: number;
var folderFileCountCache: WeakMap<BrowserFolder, number>;
var DOWNLOAD_MIME_TYPES_BY_EXTENSION: Record<string, string>;
function fileBrowserTypeFromName(name: string): BrowserFileType {
  let extension = name.includes(".")
    ? name.slice(name.lastIndexOf(".") + 1).toLowerCase()
    : "";
  if (extension === "html" || extension === "htm") {
    return "html";
  }
  if (extension === "jsx" || extension === "tsx") {
    return "jsx";
  }
  if (extension === "css" || extension === "scss" || extension === "less") {
    return "css";
  }
  if (extension === "js" || extension === "mjs" || extension === "ts") {
    return "js";
  }
  if (/^(png|jpe?g|gif|svg|webp|ico|bmp|avif)$/.test(extension)) {
    return "image";
  }
  if (extension === "md" || extension === "txt") {
    return "md";
  }
  if (
    extension === "json" ||
    extension === "yaml" ||
    extension === "yml" ||
    extension === "toml"
  ) {
    return "json";
  }
  return "other";
}
function fileBrowserFolderLabel(folder: string) {
  if (folder === "_ds") {
    return uiMessage("design-system.fileTree.designSystemFiles");
  } else {
    if (folder === "_fig") {
      return uiMessage("design-system.fileTree.figmaFiles");
    } else {
      return folder;
    }
  }
}
function isHiddenBrowserPath(path: string) {
  let parts = path.split("/");
  return (
    parts.some((pathPart: string) => pathPart.startsWith(".") || pathPart === "") ||
    parts[parts.length - 1] === "project-data.json"
  );
}
function projectListingFiles(
  files: Record<string, unknown>,
  type: FileArtifactType,
) {
  let rows: BrowserListingEntry[] = [];
  for (let [value, fileValue] of Object.entries(files)) {
    if (
      !value.startsWith(PROJECT_FILE_PREFIX) ||
      isReservedProjectFile(type, value)
    ) {
      continue;
    }
    let relativePath = value.slice(PROJECT_FILE_PREFIX.length);
    if (
      relativePath === "" ||
      relativePath.endsWith("/") ||
      isHiddenBrowserPath(relativePath)
    ) {
      continue;
    }
    let fileSize =
        fileValue !== null && typeof fileValue === "object"
          ? (fileValue as BrowserFileMetadata)
          : {},
      displaySize = fileBrowserSize(fileSize.size),
      contentType = fileBrowserContentType(fileSize.contentType);
    rows.push({
      path: relativePath,
      ...(displaySize !== undefined
        ? {
            size: displaySize,
          }
        : {}),
      ...(contentType !== undefined
        ? {
            contentType: contentType,
          }
        : {}),
    });
  }
  return rows.sort(
    (leftEntry: BrowserListingEntry, rightEntry: BrowserListingEntry) =>
      compareFileNames(leftEntry.path, rightEntry.path),
  );
}
function buildFileBrowserTree(
  listing: readonly BrowserListingEntry[],
): BrowserFolder {
  let root: BrowserFolder = {
      kind: "folder",
      name: "",
      path: "",
      folders: [],
      files: [],
    },
    folders = new Map([["", root]]),
    seen = new Set<string>();
  for (let value of listing) {
    if (isHiddenBrowserPath(value.path)) {
      continue;
    }
    let pathParts = value.path.split("/"),
      folder = root;
    for (let index = 0; index < pathParts.length - 1; index += 1) {
      let folderName = pathParts[index],
        folderPath = folder.path === "" ? folderName : folder.path + "/" + folderName,
        entry = folders.get(folderPath);
      if (!entry) {
        entry = {
          kind: "folder",
          name: folderName,
          path: folderPath,
          folders: [],
          files: [],
        };
        folders.set(folderPath, entry);
        folder.folders.push(entry);
      }
      folder = entry;
    }
    let fileName = pathParts[pathParts.length - 1];
    if (seen.has(value.path)) {
      continue;
    }
    seen.add(value.path);
    folder.files.push({
      kind: "file",
      name: fileName,
      path: value.path,
      type:
        value.attachment !== undefined || value.notCarried === true
          ? "other"
          : fileBrowserTypeFromName(fileName),
      ...(value.size !== undefined
        ? {
            size: value.size,
          }
        : {}),
      ...(value.contentType !== undefined
        ? {
            contentType: value.contentType,
          }
        : {}),
      ...(value.attachment !== undefined
        ? {
            attachment: value.attachment,
          }
        : value.notCarried === true
          ? {
              notCarried: true,
            }
          : {}),
    });
  }
  let sortFolder = (folder: BrowserFolder) => {
    folder.folders.sort(
      (
        leftFolder: {
          name: string;
        },
        rightFolder: {
          name: string;
        },
      ) => compareFileNames(leftFolder.name, rightFolder.name),
    );
    folder.files.sort(
      (
        leftFile: {
          name: string;
        },
        rightFile: {
          name: string;
        },
      ) => compareFileNames(leftFile.name, rightFile.name),
    );
    folder.folders.forEach(sortFolder);
  };
  sortFolder(root);
  return root;
}
function fileBrowserFolder(
  tree: BrowserFolder,
  path: string,
): BrowserFolder | null {
  if (path === "") {
    return tree;
  }
  let folder: BrowserFolder | undefined = tree;
  for (let value of path.split("/")) {
    if (
      ((folder = folder!.folders.find(
        (folderCandidate: BrowserFolder) => folderCandidate.name === value,
      )),
      !folder)
    ) {
      return null;
    }
  }
  return folder;
}
function fileBrowserFolderSections(folder: BrowserFolder) {
  let sections = new Map<BrowserSection, BrowserEntry[]>(),
    append = (section: BrowserSection, browserEntry: BrowserEntry) => {
      let entry = sections.get(section);
      if (entry) {
        entry.push(browserEntry);
      } else {
        sections.set(section, [browserEntry]);
      }
    };
  for (let value of folder.folders) {
    append("Folders", value);
  }
  for (let value of folder.files) {
    append(FILE_BROWSER_SECTION_BY_TYPE[value.type], value);
  }
  return FILE_BROWSER_SECTION_ORDER.filter((section: BrowserSection) =>
    sections.has(section),
  ).map((section: BrowserSection) => ({
    label: section,
    entries: sections.get(section)!,
  }));
}
function formatFileBrowserBytes(bytes: number | undefined) {
  if (bytes === undefined) {
    return "";
  }
  let megabyte = 1048576;
  if (bytes >= megabyte) {
    return (bytes / megabyte).toFixed(1) + " MB";
  }
  if (bytes >= 1024) {
    return String(Math.round(bytes / 1024)) + " KB";
  }
  return String(bytes) + " B";
}
function fileBrowserMetadataText(entry: BrowserEntry) {
  if (entry.kind === "folder") {
    return "";
  }
  let name = visibleFileName(entry.name),
    extension = name.includes(".")
      ? name.slice(name.lastIndexOf(".") + 1).toUpperCase()
      : "";
  return [formatFileBrowserBytes(entry.size), extension]
    .filter((path: string) => path !== "")
    .join(" · ");
}
function flattenFileBrowserTree(
  folder: BrowserFolder,
  expanded: ReadonlySet<string>,
) {
  let rows: BrowserRow[] = [],
    visit = (sourceFolder: BrowserFolder, depth: number) => {
      let value = sourceFolder.folders.length + sourceFolder.files.length,
        index = 0;
      fileBrowserFolderSections(sourceFolder).forEach(
        (
          section: {
            label: BrowserSection;
            entries: BrowserEntry[];
          },
          firstIndex: number,
        ) => {
          section.entries.forEach((source: BrowserEntry, entryIndex: number) => {
            index += 1;
            rows.push({
              entry: source,
              depth: depth,
              pos: index,
              of: value,
              ...(depth === 0 && entryIndex === 0
                ? {
                    section: section.label,
                    first: firstIndex === 0,
                  }
                : {}),
            });
            if (source.kind === "folder" && expanded.has(source.path)) {
              visit(source, depth + 1);
            }
          });
        },
      );
    };
  visit(folder, 0);
  return rows;
}
function fileBrowserPreviewKind(
  entry: BrowserFile,
  previewOptions: BrowserPreviewOptions = {},
) {
  if (entry.attachment !== undefined || entry.notCarried === true) {
    return "none";
  }
  let mime = entry.contentType?.split(";")[0]?.trim().toLowerCase();
  if (
    mime === undefined ? entry.type === "image" : mime.startsWith("image/")
  ) {
    return "image";
  }
  if (
    (entry.type === "html"
      ? previewOptions.htmlAsText === true
      : entry.type === "jsx" ||
        entry.type === "css" ||
        entry.type === "js" ||
        entry.type === "md" ||
        entry.type === "json" ||
        mime?.startsWith("text/") === true) &&
    entry.size !== undefined &&
    entry.size <= MAX_FILE_BROWSER_TEXT_BYTES
  ) {
    return "text";
  } else {
    return "none";
  }
}
function fileBrowserNoPreviewReason(
  entry: BrowserFile,
  previewOptions: BrowserPreviewOptions = {},
) {
  let probe = {
    ...entry,
    size: 0,
  };
  if (fileBrowserPreviewKind(probe, previewOptions) !== "text") {
    return uiMessage("design-system.fileTree.previewIsnTAvailableFor");
  }
  if (entry.size === undefined) {
    return uiMessage("design-system.fileTree.thisFileSSizeIsn");
  } else {
    return uiMessage("design-system.fileTree.thisFileIsTooLarge");
  }
}
function folderFileCount(folder: BrowserFolder): number {
  let count = folderFileCountCache.get(folder);
  if (count === undefined) {
    count =
      folder.files.length +
      folder.folders.reduce(
        (fileCount: number, childFolder: BrowserFolder) =>
          fileCount + folderFileCount(childFolder),
        0,
      );
    folderFileCountCache.set(folder, count);
  }
  return count;
}
function downloadMimeTypeFromName(name: string) {
  let cleanName = sanitizedFileName(name),
    dot = cleanName.lastIndexOf("."),
    extension = dot < 0 ? "" : cleanName.slice(dot + 1).toLowerCase();
  if (Object.hasOwn(DOWNLOAD_MIME_TYPES_BY_EXTENSION, extension)) {
    return DOWNLOAD_MIME_TYPES_BY_EXTENSION[extension];
  } else {
    return undefined;
  }
}
function stackVirtualFileRows(heights: readonly number[]) {
  let tops: number[] = [],
    total = 0;
  for (let value of heights) {
    tops.push(total);
    total += value;
  }
  return {
    tops: tops,
    total: total,
  };
}
function virtualFileRowAtOffset(tops: readonly number[], offset: number) {
  let low = 0,
    high = tops.length - 1;
  while (low < high) {
    let value = (low + high + 1) >> 1;
    if (tops[value] <= offset) {
      low = value;
    } else {
      high = value - 1;
    }
  }
  return low;
}
function visibleVirtualFileRows(
  stack: VirtualFileStack,
  scrollTop: number,
  viewportHeight: number,
  overscan: number,
): [number, number] {
  if (stack.tops.length === 0) {
    return [0, 0];
  }
  return [
    virtualFileRowAtOffset(stack.tops, scrollTop - overscan),
    virtualFileRowAtOffset(
      stack.tops,
      scrollTop + viewportHeight + overscan,
    ) + 1,
  ];
}
function virtualFileRowScrollTop(
  stack: VirtualFileStack,
  heights: readonly number[],
  row: number,
  scrollTop: number,
  viewportHeight: number,
  stickyHeight: number,
) {
  let value = stack.tops[row];
  if (value === undefined) {
    return scrollTop;
  }
  if (value - stickyHeight < scrollTop) {
    return Math.max(0, value - stickyHeight);
  }
  let rowBottom = value + heights[row];
  if (rowBottom > scrollTop + viewportHeight) {
    return rowBottom - viewportHeight;
  } else {
    return scrollTop;
  }
}
export {
  buildFileBrowserTree,
  compareFileNames,
  DOWNLOAD_MIME_TYPES_BY_EXTENSION,
  downloadMimeTypeFromName,
  FILE_BROWSER_KIND_LABELS,
  FILE_BROWSER_SECTION_BY_TYPE,
  FILE_BROWSER_SECTION_ORDER,
  fileBrowserContentType,
  fileBrowserFolder,
  fileBrowserFolderLabel,
  fileBrowserFolderSections,
  fileBrowserMetadataText,
  fileBrowserNoPreviewReason,
  fileBrowserPreviewKind,
  fileBrowserSize,
  fileBrowserTypeFromName,
  fileNameCollator,
  flattenFileBrowserTree,
  folderFileCount,
  folderFileCountCache,
  formatFileBrowserBytes,
  isHiddenBrowserPath,
  MAX_FILE_BROWSER_TEXT_BYTES,
  projectListingFiles,
  reactDesignSystemFiles,
  reactDomDesignSystemFiles,
  reactDomFilesBrowser,
  reactFilesBrowser,
  sanitizedFileName,
  stackVirtualFileRows,
  virtualFileRowAtOffset,
  virtualFileRowScrollTop,
  visibleFileName,
  visibleVirtualFileRows,
};
export function installFilesUiFileTree(): () => void {
  return () => {
    reactDesignSystemFiles = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomDesignSystemFiles = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    reactFilesBrowser = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomFilesBrowser = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    FILE_BROWSER_SECTION_ORDER = [
      "Folders",
      "Pages",
      "Components",
      "Stylesheets",
      "Scripts",
      "Images",
      "Documents",
      "Data",
      "Other",
    ];
    FILE_BROWSER_SECTION_BY_TYPE = {
      folder: "Folders",
      html: "Pages",
      deck: "Pages",
      jsx: "Components",
      css: "Stylesheets",
      js: "Scripts",
      image: "Images",
      md: "Documents",
      json: "Data",
      other: "Other",
    };
    FILE_BROWSER_KIND_LABELS = {
      folder: "Folder",
      html: "HTML page",
      deck: "Slide deck",
      jsx: "Component",
      css: "Stylesheet",
      js: "Script",
      image: "Image",
      md: "Document",
      json: "Data file",
      other: "File",
    };
    fileBrowserSize = (size: unknown) =>
      typeof size === "number" && Number.isFinite(size) && size >= 0
        ? size
        : undefined;
    fileBrowserContentType = (items: unknown) =>
      typeof items === "string" && items.length > 0 ? items : undefined;
    visibleFileName = (fileName: string) =>
      fileName.replace(
        DOWNLOAD_NAME_IGNORABLE_PATTERN,
        (character: string) => (character === "‌" || character === "‍" ? character : ""),
      );
    sanitizedFileName = (fileName: string) =>
      fileName
        .replace(DOWNLOAD_NAME_IGNORABLE_PATTERN, "")
        .replace(/(^|[\s.])\p{M}+/gu, "$1")
        .replace(/[\s.]+$/, "");
    fileNameCollator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    });
    compareFileNames = (leftName: string, rightName: string) =>
      fileNameCollator.compare(leftName, rightName) ||
      (leftName < rightName ? -1 : leftName > rightName ? 1 : 0);
    MAX_FILE_BROWSER_TEXT_BYTES = 524288;
    folderFileCountCache = new WeakMap();
    DOWNLOAD_MIME_TYPES_BY_EXTENSION = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      zip: "application/zip",
      fig: "application/x-figma",
    };
  };
}

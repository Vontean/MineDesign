/** Restored application module; prepare first, initialize in original order. */
import type { LazyReadState } from "../contracts/files-core";
import type * as Files from "../contracts";
import { isProjectContentPath, relativeProjectFilePath } from "../editor/files-index";
import { assetKindForPath, canUseStoragePointer, DESIGN_SYSTEM_PATHS, isTextFilePath } from "../model/file-policy";
import { classifyDesignSystemFile, DESIGN_SYSTEM_INLINE_LIMITS, isPublishableFilePathModelFileTable, MAX_DISPLAYED_DOCUMENTS } from "../model/file-table";

var LAZY_READ_SKIPPED_CONTENT_KINDS: Set<Files.FileKind>;
var listingRowIsSvg: (row: Files.FileListingRow | undefined) => boolean;
function lazyReadLastDocumentPath(listing: Files.FileListingRow[]) {
  let documents = listing
      .flatMap((entry: Files.FileListingRow) => {
        let value = relativeProjectFilePath(entry.path);
        if (
          value !== undefined &&
          isProjectContentPath(entry.path) &&
          classifyDesignSystemFile(value) === "doc"
        ) {
          return [
            {
              p: value,
              size: entry.size,
            },
          ];
        } else {
          return [];
        }
      })
      .sort(
        (
          left: { p: string; size: number },
          right: { p: string; size: number },
        ): number => (left.p < right.p ? -1 : 1),
      ),
    count: number = 0;
  for (let value of documents) {
    if (
      value.size * 6 + 2 <= DESIGN_SYSTEM_INLINE_LIMITS.readme &&
      ++count >= MAX_DISPLAYED_DOCUMENTS
    ) {
      return value.p;
    }
  }
  return;
}
function updateLazyReadListing(
  lazy: LazyReadState,
  listing: Files.FileListingRow[],
): void {
  lazy.rows = new Map(
    listing.map((entry: Files.FileListingRow) => [entry.path, entry]),
  );
  let lastDoc = lazyReadLastDocumentPath(listing);
  if (lastDoc === undefined) {
    delete lazy.lastDoc;
  } else {
    lazy.lastDoc = lastDoc;
  }
}
function lazyFileReadMode(
  lazy: LazyReadState,
  path: string,
): "read" | "held" | "skipped" {
  let relative = relativeProjectFilePath(path);
  if (relative === undefined || !isProjectContentPath(path)) {
    return "read";
  }
  let row = lazy.rows.get(path);
  if (isTextFilePath(relative)) {
    let value = classifyDesignSystemFile(relative);
    if (
      value === "doc"
        ? (lazy.lastDoc !== undefined && relative > lazy.lastDoc) ||
          (row?.size ?? 0) > DESIGN_SYSTEM_INLINE_LIMITS.readme
        : LAZY_READ_SKIPPED_CONTENT_KINDS.has(value) ||
          relative.startsWith(DESIGN_SYSTEM_PATHS.archivedDir)
    ) {
      return "skipped";
    }
    if (!listingRowIsSvg(row)) {
      return "read";
    }
  }
  if (
    assetKindForPath(relative) === "video" ||
    !canUseStoragePointer(relative) ||
    !isPublishableFilePathModelFileTable(relative)
  ) {
    return "read";
  } else {
    return "held";
  }
}
export {
  LAZY_READ_SKIPPED_CONTENT_KINDS,
  lazyFileReadMode,
  lazyReadLastDocumentPath,
  listingRowIsSvg,
  updateLazyReadListing,
};
export function installFilesLazyReads(): () => void {
  return () => {
    LAZY_READ_SKIPPED_CONTENT_KINDS = new Set([
      "other",
      "componentOther",
      "componentSource",
    ]);
    listingRowIsSvg = (entry: Files.FileListingRow | undefined): boolean =>
      (entry?.contentType.split(";")[0] ?? "").trim().toLowerCase() ===
      "image/svg+xml";
  };
}

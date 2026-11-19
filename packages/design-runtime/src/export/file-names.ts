import type {
  ExportNameOptions,
  ExportNameAllocator,
} from "../contracts/export";
/** Restored application module; prepare first, initialize in original order. */
import { ExportDownloadsDefaultIgnorablePattern } from "./downloads";

function exportBaseFileName(
  path: string,
  nameOptions?: ExportNameOptions,
): string {
  let value =
    (path.split("/").pop() ?? path)
      .replace(/(\.dc)?\.html?$/i, "")
      .replace(/\.napkin$/i, "") || "design";
  return nameOptions?.slide == null
    ? value
    : `${value}-slide-${nameOptions.slide + 1}`;
}
function sanitizeExportFileName(
  name: string,
  maxCharacters: number = 120,
): string {
  return [
    ...name
      .replace(ExportDownloadsDefaultIgnorablePattern, "")
      .replace(/[/\\:*?"<>|%]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^[\s.]+|[\s.]+$/g, ""),
  ]
    .slice(0, maxCharacters)
    .join("")
    .replace(/[\s.]+$/, "");
}
function exportFileName(path: string, title?: string): string {
  return (
    (title === undefined ? "" : sanitizeExportFileName(title, 100)) ||
    exportBaseFileName(path)
  );
}
function uniqueExportFileNames(): ExportNameAllocator {
  let values: Set<string> = new Set();
  return (path, nameOptions) => {
    let value: string = exportFileName(path, nameOptions),
      uniqueName: string = value;
    for (let count = 2; values.has(uniqueName.toLowerCase()); count++)
      uniqueName = `${value} (${count})`;
    values.add(uniqueName.toLowerCase());
    return uniqueName;
  };
}
export {
  exportBaseFileName,
  exportFileName,
  sanitizeExportFileName,
  uniqueExportFileNames,
};
export function installExportFileNames(): () => void {
  return () => {};
}

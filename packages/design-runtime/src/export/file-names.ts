import type {
  ExportNameOptions,
  ExportNameAllocator,
} from "../contracts/export";
/** Restored application module; prepare first, initialize in original order. */
import { ExportDownloadsDefaultIgnorablePattern } from "./downloads";

function exportBaseFileName(
  path: string,
  options?: ExportNameOptions,
): string {
  let value =
    (path.split("/").pop() ?? path)
      .replace(/(\.dc)?\.html?$/i, "")
      .replace(/\.napkin$/i, "") || "design";
  return options?.slide == null
    ? value
    : `${value}-slide-${options.slide + 1}`;
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
  return (input, options) => {
    let value: string = exportFileName(input, options),
      value2: string = value;
    for (let count = 2; values.has(value2.toLowerCase()); count++)
      value2 = `${value} (${count})`;
    values.add(value2.toLowerCase());
    return value2;
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

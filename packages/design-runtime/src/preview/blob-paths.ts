/** 项目文件里的素材引用：把 `_blob/<32 位十六进制>` 路径统一成 `<前缀>/_blob/<id>`。 */
import { isProjectSourcePath } from "./component-imports";

/** 找不到素材时显示的占位图（SVG data URI）。 */
export const blobPlaceholderImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#e8e6e1"/><path d="M56 78l16-20 12 14 8-9 12 15H56z" fill="#c9c6bf"/><circle cx="98" cy="48" r="6" fill="#c9c6bf"/></svg>',
  );

/** 第 1 组是 `_blob` 前面的一个分隔字符（或行首），第 2 组是素材 id。 */
const blobPathPattern = /(^|[^\w/.:-])(?:\.?\/)?_blob\/([0-9a-f]{32})(?![0-9a-f])/g;

/** 文件文本里的 `_blob/<id>` 引用，统一写成 `<前缀>/_blob/<id>`。 */
export function normalizeBlobAssetPaths(source: string): string {
  return source.includes("_blob/")
    ? source.replace(
        blobPathPattern,
        (_match: string, prefix: string, blobId: string): string =>
          prefix + "/_blob/" + blobId,
      )
    : source;
}

/** 只处理项目源文件；没有任何改动时返回原对象，有改动时返回浅拷贝。 */
export function normalizeProjectBlobPaths(
  files: Record<string, string>,
): Record<string, string> {
  let normalized: Record<string, string> | null = null;
  for (const [path, content] of Object.entries(files)) {
    if (!isProjectSourcePath(path)) continue;
    const next = normalizeBlobAssetPaths(content);
    next !== content &&
      ((normalized ??= {
        ...files,
      })[path] = next);
  }
  return normalized ?? files;
}

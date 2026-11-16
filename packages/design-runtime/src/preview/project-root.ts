/** 预览 iframe 记录自己所在的项目根路径，用来把绝对路径还原成项目内的相对路径。 */

/** 预览元素 → 项目根路径（可带前导斜杠）。 */
const projectRootByPreview = new WeakMap<object, string>();

/** 记录预览元素的项目根；root 为 undefined 时清除记录。 */
export function setPreviewProjectRoot(
  preview: object | null | undefined,
  root: string | undefined,
): void {
  preview != null &&
    (root === undefined
      ? projectRootByPreview.delete(preview)
      : projectRootByPreview.set(preview, root));
}

/** 路径以预览的项目根开头时去掉这一段；没有记录时原样返回。 */
export function stripPreviewProjectRoot(
  path: string,
  preview: object | null | undefined,
): string {
  const root = preview == null ? undefined : projectRootByPreview.get(preview);
  if (root === undefined) return path;
  const rootWithoutSlash = root.replace(/^\//, "");
  return path.startsWith(rootWithoutSlash) ? path.slice(rootWithoutSlash.length) : path;
}

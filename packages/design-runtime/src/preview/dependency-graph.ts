/** 项目文件之间的依赖：设计稿互相导入、样式与素材引用，以及画板的运行时更新脚本。 */
import {
  imagePathPattern,
  projectDirectoryOf,
  relativeProjectPath,
  type ProjectFiles,
} from "./asset-rewriting";
import { PreviewBuildDocumentResolvedValue } from "./build-document";
import {
  getProjectFileDependencies,
  PreviewComponentImportsReplace,
} from "./component-imports";
import { scanHtmlTags, type TextRange } from "./html-scanner";

/** 画板运行时要更新的组件来源。 */
export interface ComponentSource {
  kind: string;
  /** 项目内的文件路径；没有时按 name 找。 */
  path?: string;
  name?: string;
  streaming?: boolean;
  viewportKey?: string;
}

/** `<a>` / `<area>` 的 href 属性（连同前面的空白）。 */
const hrefAttributePattern = /(\shref\s*=\s*)(?:"[^"]*"|'[^']*'|[^\s>]+)/i;

/** 遮罩结果缓存的字符预算（每个字符按 2 字节算）。 */
const maskCacheLimitBytes = 8 * 1024 * 1024;
/** 依赖结果缓存最多保留的文本数。 */
const dependencyCacheLimit = 32;
/** 每段文本最多保留的不同文件清单数。 */
const dependencyCacheEntriesPerText = 8;

/** 导航链接遮罩的 LRU 缓存：html 文本 → 遮罩后的文本。 */
const maskCache = new Map<string, string>();
let maskCacheBytes = 0;
/** 依赖结果缓存：文本 → （文件清单 → 依赖）。只缓存长文本。 */
const dependencyCache = new Map<string, Map<string, string[]>>();

/**
 * 把 `<a>`、`<area>` 的 href 清空，并把注释换成空格，
 * 这样导航链接不会被当成对其他设计稿的依赖。结果会缓存。
 */
export function maskNavigationLinks(html: string): string {
  let masked = maskCache.get(html);
  if (masked !== undefined) {
    maskCache.delete(html);
    maskCache.set(html, masked);
    return masked;
  }
  // 注释的区间没有替换文本，会被换成空格；链接标签的区间带有替换文本
  const ranges: [number, number, string?][] = [];
  for (const tag of scanHtmlTags(html, undefined, ranges as TextRange[]))
    (tag.name === "a" || tag.name === "area") &&
      ranges.push([
        tag.start,
        tag.end,
        html.slice(tag.start, tag.end).replace(hrefAttributePattern, '$1""'),
      ]);
  ranges.sort((a, b) => a[0] - b[0]);
  masked = "";
  let pos = 0;
  for (const [start, end, replacement] of ranges)
    start < pos ||
      ((masked +=
        html.slice(pos, start) + (replacement ?? " ".repeat(end - start))),
      (pos = end));
  masked += html.slice(pos);
  if (2 * html.length > maskCacheLimitBytes) return masked;
  for (const [cachedHtml] of maskCache) {
    if (maskCacheBytes + 2 * html.length <= maskCacheLimitBytes) break;
    maskCache.delete(cachedHtml);
    maskCacheBytes -= 2 * cachedHtml.length;
  }
  maskCache.set(html, masked);
  maskCacheBytes += 2 * html.length;
  return masked;
}

/** 被其他设计稿导入的设计稿（不含自己导入自己）。 */
export function getLinkedArtboards(files: ProjectFiles): Set<string> {
  const artboards = Object.keys(files).filter((path) => path.endsWith(".dc.html"));
  const linked = new Set<string>();
  for (const artboard of artboards) {
    const html = maskNavigationLinks(files[artboard]);
    for (const dependency of getProjectFileDependencies(
      html,
      artboards,
      true,
      projectDirectoryOf(artboard),
    ) as string[])
      dependency !== artboard && linked.add(dependency);
  }
  return linked;
}

/** 在 getProjectFileDependencies 外加缓存；短文本直接计算。 */
export function cachedProjectDependencies(
  text: string,
  paths: string[],
): string[] {
  if (text.length < PreviewBuildDocumentResolvedValue)
    return getProjectFileDependencies(text, paths) as string[];
  const pathsKey = paths.join("\n");
  let perText = dependencyCache.get(text);
  perText === undefined
    ? ((perText = new Map()),
      dependencyCache.set(text, perText),
      dependencyCache.size > dependencyCacheLimit &&
        dependencyCache.delete(dependencyCache.keys().next().value!))
    : (dependencyCache.delete(text), dependencyCache.set(text, perText));
  let dependencies = perText.get(pathsKey);
  dependencies === undefined &&
    ((dependencies = getProjectFileDependencies(text, paths) as string[]),
    perText.size >= dependencyCacheEntriesPerText &&
      perText.delete(perText.keys().next().value!),
    perText.set(pathsKey, dependencies));
  return dependencies;
}

/** 从入口文件出发，收集它依赖的全部项目文件（含入口，素材不再往下找）。 */
export function collectProjectDependencyFiles(
  files: ProjectFiles,
  entry: string,
): ProjectFiles {
  const paths = Object.keys(files);
  const seen = new Set<string>();
  const collected: ProjectFiles = {};
  const queue = [entry];
  while (queue.length > 0) {
    const path = queue.shift()!;
    if (
      seen.has(path) ||
      files[path] == null ||
      (seen.add(path), (collected[path] = files[path]), imagePathPattern.test(path))
    )
      continue;
    const text = path.endsWith(".html")
      ? maskNavigationLinks(files[path])
      : files[path];
    for (const dependency of cachedProjectDependencies(text, paths))
      seen.has(dependency) || queue.push(dependency);
  }
  return collected;
}

/** 找到 source 对应的设计稿文件路径；找不到、或 source 不是 html 时为 undefined。 */
export function resolveComponentFile(
  files: ProjectFiles,
  source: ComponentSource,
): string | undefined {
  if (source.kind === "html")
    return source.path != null
      ? files[source.path] != null
        ? source.path
        : undefined
      : Object.keys(files).find(
          (path) =>
            path.endsWith(".dc.html") &&
            PreviewComponentImportsReplace(path) === source.name,
        );
}

/** 生成通知画板运行时更新某个组件的脚本。currentFile 是当前画板的文件路径。 */
export function updateComponentRuntimeScript(
  currentFile: string,
  source: ComponentSource,
  context: unknown,
): string {
  const path = source.path;
  const componentName =
    path === undefined || !path.endsWith(".dc.html")
      ? source.name
      : path === currentFile
        ? PreviewComponentImportsReplace(currentFile)
        : relativeProjectPath(projectDirectoryOf(currentFile), path).slice(0, -8);
  return `window.__dcUpdate&&window.__dcUpdate(${JSON.stringify(componentName)},${JSON.stringify(source.kind)},${JSON.stringify(context)},${source.streaming ? "true" : "false"},${JSON.stringify(source.viewportKey ?? "")});`;
}

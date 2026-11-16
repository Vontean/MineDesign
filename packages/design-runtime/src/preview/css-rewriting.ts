/** 预览用的样式表改写：去注释、内联 @import、判断样式表能否独立使用。 */
import {
  imagePathPattern,
  projectDirectoryOf,
  resolveProjectAssetPath,
  rewriteProjectAssets,
  type ProjectFiles,
} from "./asset-rewriting";
import { cssImportPattern } from "./html-scanner";

/** 样式表开头允许的 @import、@charset、@layer 语句（粘性匹配，从 lastIndex 起）。 */
const leadingAtRulePattern =
  /(?:@import\s*(?:url\(\s*(?:"[^"]*"|'[^']*'|[^\s)]*)\s*\)|"[^"]*"|'[^']*')[^;{]*|@charset\s*"[^"]*"|@layer\b[^;{]*)(?:;|$)/iy;

/** 样式表是否引用了站点根路径（`url(/x)` 或 `@import "/x"`，不含 `//`）。 */
export const hasRootRelativeCssReference = (css: string): boolean =>
  /(?:url\(\s*|@import\s*)["']?\/(?!\/)/i.test(stripStylesheetComments(css));

/** 把 `<noscript` 前的 `<` 转义，避免样式表被内联进 HTML 后提前闭合。 */
export const escapeNoscriptInCss = (css: string): string =>
  css.replace(/<(?=\s*(?:\/\s*)?noscript)/gi, "\\3c ");

/** 去掉注释（换成一个空格）；字符串和不带引号的 url() 里的内容原样保留。 */
export function stripStylesheetComments(css: string): string {
  let out = "";
  let quote = "";
  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    if (quote) {
      if (char === "\\") {
        out += char + (css[i + 1] ?? "");
        i++;
        continue;
      }
      char === quote && (quote = "");
      out += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      out += char;
    } else if (char === "/" && css[i + 1] === "*") {
      const commentEnd = css.indexOf("*/", i + 2);
      i = commentEnd === -1 ? css.length : commentEnd + 1;
      out += " ";
    } else {
      const urlEnd = findCssUrlEnd(css, i);
      urlEnd === -1
        ? (out += char)
        : ((out += css.slice(i, urlEnd)), (i = urlEnd - 1));
    }
  }
  return out;
}

/** pos 处是不带引号的 `url(...)` 时返回它的结尾下标（右括号之后），否则 -1。 */
export function findCssUrlEnd(css: string, pos: number): number {
  if (
    (css[pos] !== "u" && css[pos] !== "U") ||
    css.slice(pos, pos + 4).toLowerCase() !== "url(" ||
    /[a-z0-9_-]/i.test(css[pos - 1] ?? "")
  )
    return -1;
  let i = pos + 4;
  while (i < css.length && /\s/.test(css[i])) i++;
  if (css[i] === '"' || css[i] === "'") return -1;
  while (i < css.length && css[i] !== ")") {
    css[i] === "\\" && i++;
    i++;
  }
  return i < css.length ? i + 1 : css.length;
}

/**
 * 读取项目里的样式表，把它开头的本地 @import 递归内联。
 * visited 记录已内联的文件，重复引用时返回空串。
 */
export function inlineStylesheetImports(
  path: string,
  files: ProjectFiles,
  visited: Set<string>,
): string {
  if (visited.has(path)) return "";
  visited.add(path);
  const directory = projectDirectoryOf(path);
  const css = rewriteProjectAssets(
    stripStylesheetComments(files[path] ?? ""),
    files,
    directory,
  );
  const leadingEnd = leadingStylesheetAtRuleEnd(css);
  return css.replace(
    cssImportPattern,
    (
      match: string,
      urlDouble: string | undefined,
      urlSingle: string | undefined,
      urlBare: string | undefined,
      stringDouble: string | undefined,
      stringSingle: string | undefined,
      mediaQuery: string | undefined,
      offset: number,
    ): string => {
      // 出现在开头 at-rule 之后的 @import 本身无效，直接丢掉
      if (offset >= leadingEnd) return "";
      // 带媒体条件的无法内联
      if (mediaQuery) return match;
      const target = resolveProjectAssetPath(
        directory,
        String(
          urlDouble ?? urlSingle ?? urlBare ?? stringDouble ?? stringSingle ?? "",
        ),
      );
      return target !== null &&
        /\.css$/i.test(target) &&
        files[target] != null
        ? inlineStylesheetImports(target, files, visited) + "\n"
        : match;
    },
  );
}

/**
 * 样式表是否不依赖其他文件：没有 @import、_blob 引用，素材改写后不变，
 * 且引用的项目文件与 baseFiles 里的相同。
 */
export function isStandaloneStylesheet(
  path: string,
  files: ProjectFiles,
  baseFiles: ProjectFiles,
): boolean {
  const css = stripStylesheetComments(files[path] ?? "");
  if (/@import\b/i.test(css) || /_blob\//.test(css)) return false;
  const directory = projectDirectoryOf(path);
  if (rewriteProjectAssets(css, files, directory) !== css) return false;
  for (const match of css.matchAll(
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s"'()]+))\s*\)/gi,
  )) {
    const url = match[1] ?? match[2] ?? match[3] ?? "";
    if (url === "" || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) continue;
    const target = resolveProjectAssetPath(directory, url.split(/[?#]/)[0]);
    if (
      target !== null &&
      files[target] != null &&
      files[target] !== baseFiles[target]
    )
      return false;
  }
  return true;
}

/** 样式表开头连续的 @import / @charset / @layer 语句之后的下标。 */
export function leadingStylesheetAtRuleEnd(css: string): number {
  let pos = 0;
  for (;;) {
    while (pos < css.length && /\s/.test(css[pos])) pos++;
    leadingAtRulePattern.lastIndex = pos;
    const match = leadingAtRulePattern.exec(css);
    if (match === null) return pos;
    pos += match[0].length;
  }
}

/** 把所有 @import 语句挪到样式表最前面（CSS 要求 @import 在最前）。 */
export function moveCssImportsFirst(css: string): string {
  const imports: string[] = [];
  const rest = css.replace(cssImportPattern, (match: string): string => (
    imports.push(match), ""
  ));
  return imports.length === 0 ? css : imports.join("\n") + "\n" + rest;
}

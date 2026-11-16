/** 容错的 HTML 扫描：按浏览器的规则找标签、注释和原始文本区，不构建 DOM。 */
import { decodeHtmlAttributeEntities } from "./component-imports";

/** 半开区间 [start, end)，单位是字符下标。 */
export type TextRange = [start: number, end: number];

/** 扫描到的标签。结束标签、`<!` 与 `<?` 的 name 为空串。 */
export interface HtmlTag {
  name: string;
  start: number;
  end: number;
}

export interface MaskOptions {
  /** "keep" 时保留 script/style 等原始文本区的内容，只遮住注释。 */
  bodies?: string;
}

/** CSS 的 @import 规则；全局正则，使用前要自行重置 lastIndex。 */
export const cssImportPattern =
  /@import\s*(?:url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)|"([^"]*)"|'([^']*)')\s*((?:[^\s;{][^;{]*)?)(?:;|$)/gi;

/** 属性：1 名称，2/3/4 分别是双引号、单引号、无引号的值。 */
const attributePattern =
  /([^\s"'=<>\/\x60]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

/** 注释结束：`-->` 或 `--!>`。 */
const commentEndPattern = /--!?>/g;

/** 内容按原始文本处理的标签，直到出现对应的结束标签。 */
const rawTextTags = [
  "script",
  "style",
  "textarea",
  "title",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "noscript",
];

/** 在 svg/math 内遇到这些标签时，浏览器会跳回 HTML 内容。 */
const htmlBreakoutTags = new Set(
  "b big blockquote body br center code dd div dl dt em embed h1 h2 h3 h4 h5 h6 head hr i img li listing menu meta nobr ol p pre ruby s small span strong strike sub sup table tt u ul var font".split(
    " ",
  ),
);

const attributeValue = (match: RegExpExecArray): string =>
  decodeHtmlAttributeEntities(match[2] ?? match[3] ?? match[4] ?? "");

/** 标签文本里的全部属性（名称小写）。firstWins 为真时重复属性保留第一个。 */
export function parseHtmlAttributes(
  tagText: string,
  skipNames: readonly string[],
  firstWins: boolean = false,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  const nameEnd = tagText.search(/[\s/>]/);
  if (nameEnd < 0) return attributes;
  attributePattern.lastIndex = nameEnd;
  for (
    let match = attributePattern.exec(tagText);
    match !== null;
    match = attributePattern.exec(tagText)
  ) {
    const name = match[1].toLowerCase();
    name !== "/" &&
      !skipNames.includes(name) &&
      !(firstWins && name in attributes) &&
      (attributes[name] = attributeValue(match));
  }
  return attributes;
}

/** 取标签文本里指定属性（小写名称）的值；没有该属性时为 null。 */
export function getHtmlAttribute(tagText: string, name: string): string | null {
  const nameEnd = tagText.search(/[\s/>]/);
  if (nameEnd < 0) return null;
  attributePattern.lastIndex = nameEnd;
  for (
    let match = attributePattern.exec(tagText);
    match !== null;
    match = attributePattern.exec(tagText)
  )
    if (match[1].toLowerCase() === name) return attributeValue(match);
  return null;
}

/** 从 from 起找标签结尾的 `>`（跳过带引号的属性值），同时判断是否以 `/>` 结尾。 */
function findTagEnd(
  html: string,
  from: number,
): { end: number; selfClosing: boolean } {
  let pos = from;
  const length = html.length;
  let selfClosing = false;
  while (pos < length) {
    let code = html.charCodeAt(pos);
    if (code === 62) return { end: pos, selfClosing };
    selfClosing = code === 47;
    if (code === 61) {
      selfClosing = false;
      pos++;
      while (pos < length && html.charCodeAt(pos) <= 32) pos++;
      code = html.charCodeAt(pos);
      if (code === 34 || code === 39) {
        const closeQuote = html.indexOf(String.fromCharCode(code), pos + 1);
        if (closeQuote < 0) return { end: -1, selfClosing };
        pos = closeQuote + 1;
      } else
        while (
          pos < length &&
          html.charCodeAt(pos) > 32 &&
          html.charCodeAt(pos) !== 62
        )
          pos++;
      continue;
    }
    pos++;
  }
  return { end: -1, selfClosing };
}

/** 从 from 起找标签结尾的 `>` 的下标；没有时为 -1。 */
export function scanHtmlTagEnd(html: string, from: number): number {
  return findTagEnd(html, from).end;
}

/**
 * 顺序扫描全部标签。rawTextRanges 收集原始文本区（script 等的正文），
 * commentRanges 收集注释；不传则不收集。扫到无法闭合的标签就停止。
 */
export function scanHtmlTags(
  html: string,
  rawTextRanges?: TextRange[],
  commentRanges?: TextRange[],
): HtmlTag[] {
  const tags: HtmlTag[] = [];
  // 只转换 A-Z，保证下标与原文一一对应
  const lower = html.replace(/[A-Z]+/g, (letters: string): string =>
    letters.toLowerCase(),
  );
  let pos = 0;
  let svgDepth = 0;
  let mathDepth = 0;
  for (;;) {
    const tagStart = html.indexOf("<", pos);
    if (tagStart < 0) break;
    if (html.startsWith("<!--", tagStart)) {
      let commentEnd: number;
      if (html.startsWith(">", tagStart + 4)) commentEnd = tagStart + 5;
      else if (html.startsWith("->", tagStart + 4)) commentEnd = tagStart + 6;
      else {
        commentEndPattern.lastIndex = tagStart + 4;
        const endMatch = commentEndPattern.exec(html);
        commentEnd =
          endMatch === null ? html.length : endMatch.index + endMatch[0].length;
      }
      commentRanges?.push([tagStart, commentEnd]);
      pos = commentEnd;
      continue;
    }
    const nextCode = lower.charCodeAt(tagStart + 1);
    const isOpening = nextCode >= 97 && nextCode <= 122;
    if (nextCode === 33 || nextCode === 63) {
      const declarationEnd = html.indexOf(">", tagStart + 2);
      if (declarationEnd < 0) break;
      tags.push({
        name: "",
        start: tagStart,
        end: declarationEnd + 1,
      });
      pos = declarationEnd + 1;
      continue;
    }
    const isClosing =
      nextCode === 47 &&
      lower.charCodeAt(tagStart + 2) >= 97 &&
      lower.charCodeAt(tagStart + 2) <= 122;
    if (!isOpening && !isClosing) {
      pos = tagStart + 1;
      continue;
    }
    const nameStart = tagStart + (isClosing ? 2 : 1);
    let nameEnd = nameStart;
    for (
      let code = lower.charCodeAt(nameEnd);
      (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 45;
      code = lower.charCodeAt(++nameEnd)
    );
    const name = lower.slice(nameStart, nameEnd);
    const { end: tagEnd, selfClosing } = findTagEnd(html, nameEnd);
    if (tagEnd < 0) break;
    tags.push({
      name: isClosing ? "" : name,
      start: tagStart,
      end: tagEnd + 1,
    });
    pos = tagEnd + 1;
    // 跟踪 svg / math 嵌套；其中的 HTML 标签会让浏览器跳回 HTML 内容
    name === "svg" && !(!isClosing && selfClosing)
      ? (svgDepth = Math.max(0, svgDepth + (isClosing ? -1 : 1)))
      : name === "math" && !(!isClosing && selfClosing)
        ? (mathDepth = Math.max(0, mathDepth + (isClosing ? -1 : 1)))
        : !isClosing &&
          svgDepth + mathDepth > 0 &&
          htmlBreakoutTags.has(name) &&
          (svgDepth = mathDepth = 0);
    if (
      !isClosing &&
      rawTextTags.includes(name) &&
      svgDepth + mathDepth === 0
    ) {
      let bodyEnd = pos;
      for (;;) {
        bodyEnd = lower.indexOf("</" + name, bodyEnd);
        if (bodyEnd < 0) {
          bodyEnd = html.length;
          break;
        }
        const afterName = lower.charCodeAt(bodyEnd + 2 + name.length);
        if (
          afterName === 62 ||
          afterName === 47 ||
          afterName === 32 ||
          (afterName >= 9 && afterName <= 13) ||
          Number.isNaN(afterName)
        )
          break;
        bodyEnd += 2;
      }
      rawTextRanges?.push([pos, bodyEnd]);
      pos = bodyEnd;
    }
  }
  return tags;
}

/** 指定名称（小写）的开始标签的 [start, end) 范围。 */
export function findHtmlTags(html: string, name: string): TextRange[] {
  return scanHtmlTags(html)
    .filter((tag) => tag.name === name)
    .map((tag): TextRange => [tag.start, tag.end]);
}

/** 把注释和原始文本区的内容换成空格，长度与下标保持不变。 */
export function maskHtmlRawContent(
  html: string,
  options: MaskOptions = {},
): string {
  const rawTextRanges: TextRange[] = [];
  const commentRanges: TextRange[] = [];
  scanHtmlTags(html, rawTextRanges, commentRanges);
  const ranges = (
    options.bodies === "keep"
      ? commentRanges
      : commentRanges.concat(rawTextRanges)
  ).sort((a, b) => a[0] - b[0]);
  let masked = "";
  let pos = 0;
  for (const [start, end] of ranges)
    start < pos ||
      ((masked += html.slice(pos, start) + " ".repeat(end - start)),
      (pos = end));
  return masked + html.slice(pos);
}

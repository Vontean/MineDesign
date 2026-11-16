import { formatPdfNumber, pdfStringOperand } from "./document";

/** 不使用词间空格的文字（泰文、日文假名、汉字、全角字符）。 */
export const noWordSpaceScriptPattern = /[\u0e00-\u0e7f\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]/u;
/** 链接地址的最大长度。 */
export const maxPdfLinkLength = 2048;
/** 单页最多输出的链接数。 */
export const maxLinksPerPage = 4e3;
/** 整个文件最多输出的可点击链接数。 */
export const maxLinksPerDocument = 1e4;
/** 链接区域的最小边长（pt）；更小的不输出。 */
export const minLinkSizePt = 0.5;

/** 页面上一个待输出的链接。 */
export interface PdfLinkSpec {
  uri?: unknown;
  xPt?: unknown;
  yPt?: unknown;
  widthPt?: unknown;
  heightPt?: unknown;
  /** 链接所在的结构块序号 */
  anchor?: unknown;
}

export interface PdfLinkAnnotations {
  /** 每个链接的注释字典文本 */
  dicts: string[];
  /** 与 dicts 一一对应的结构块序号 */
  anchors: (number | undefined)[];
}

/** 两段相邻文字之间是否需要补词间空格。explicit 为 false（按位置推断）时，前一段以连字符结尾则不补。 */
export function needsInterwordSpace(before: string, after: string, explicit: boolean): boolean {
  return before === "" ||
    after === "" ||
    /\s$/u.test(before) ||
    /^\s/u.test(after) ||
    (!explicit && /[\-\u00ad\u2010-\u2014]$/u.test(before))
    ? false
    : !(noWordSpaceScriptPattern.test(before.slice(-1)) || noWordSpaceScriptPattern.test(after[0]!));
}

/** 只接受 http、https、mailto，不带用户名密码、可打印 ASCII 且不超长；其余返回 undefined。 */
export function normalizePdfLink(uri: unknown): string | undefined {
  if (typeof uri != "string" || uri.length > maxPdfLinkLength) return undefined;
  const trimmed = uri.trim();
  if (!/^(?:https?:\/\/|mailto:)/i.test(trimmed)) return undefined;
  let href: string;
  try {
    const url = new URL(trimmed);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "mailto:") ||
      url.username !== "" ||
      url.password !== "" ||
      (url.protocol === "mailto:" && url.pathname === "")
    )
      return undefined;
    href = url.href;
  } catch {
    return undefined;
  }
  if (!(href.length > maxPdfLinkLength || !/^[\x21-\x7e]+$/.test(href))) return href;
}

/**
 * 生成一页的链接注释。remaining 是整个文件还能输出的链接数，用尽时调用 onLimitReached；
 * structParentStart 不为 undefined 时写入结构父项与 /Contents，说明文字由 contentFor(锚点) 提供。
 */
export function buildPdfLinkAnnotations(
  links: unknown,
  pageWidthPt: number,
  pageHeightPt: number,
  remaining: number,
  onLimitReached: () => void,
  structParentStart?: number,
  contentFor?: (anchor: number) => string | undefined,
): PdfLinkAnnotations {
  const dicts: string[] = [];
  const anchors: (number | undefined)[] = [];
  if (!Array.isArray(links)) return { dicts, anchors };
  for (const link of links as (PdfLinkSpec | null | undefined)[]) {
    if (dicts.length >= remaining) onLimitReached();
    if (dicts.length >= Math.min(maxLinksPerPage, remaining)) break;
    if (typeof link != "object" || link === null) continue;
    const uri = normalizePdfLink(link.uri);
    if (
      uri === undefined ||
      !Number.isFinite(link.xPt) ||
      !Number.isFinite(link.yPt) ||
      !Number.isFinite(link.widthPt) ||
      !Number.isFinite(link.heightPt)
    )
      continue;
    const xPt = link.xPt as number;
    const yPt = link.yPt as number;
    const x0 = Math.max(0, xPt);
    const y0 = Math.max(0, yPt);
    const x1 = Math.min(pageWidthPt, xPt + (link.widthPt as number));
    const y1 = Math.min(pageHeightPt, yPt + (link.heightPt as number));
    if (x1 - x0 < minLinkSizePt || y1 - y0 < minLinkSizePt) continue;
    const escapedUri = uri.replace(/[\\()]/g, "\\$&");
    const anchor =
      typeof link.anchor == "number" && Number.isInteger(link.anchor) && link.anchor >= 0
        ? link.anchor
        : undefined;
    const content = anchor !== undefined && contentFor !== undefined ? contentFor(anchor) : undefined;
    anchors.push(anchor);
    dicts.push(
      "<< /Type /Annot /Subtype /Link /Rect [" +
        [x0, y0, x1, y1].map(formatPdfNumber).join(" ") +
        "] /Border [0 0 0] /H /N /F 4 /A << /Type /Action /S /URI /URI (" +
        escapedUri +
        ") >>" +
        (structParentStart === undefined
          ? ""
          : " /StructParent " +
            String(structParentStart + dicts.length) +
            " /Contents " +
            (content !== undefined ? pdfStringOperand(content) : "(" + escapedUri + ")")) +
        " >>",
    );
  }
  return { dicts, anchors };
}

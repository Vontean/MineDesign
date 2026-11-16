import { formatPdfNumber } from "./document";

/** 图片替代文字（Alt）的最大长度。 */
export const maxFigureAltLength = 1e3;

/** 页内一个块；box 是它在页面上的位置（pt）。 */
export interface PdfFigureBlock {
  role?: string;
  link?: unknown;
  box: { xPt: number; yPt: number; widthPt: number; heightPt: number };
}

/** 裁到页面内后的矩形。 */
export interface PdfBlockRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** 一个标记内容序号（MCID）对应的块。 */
export interface PdfFigureMark {
  mcid: number;
  block: number;
  item: undefined;
  link: undefined;
}

/** 把块的位置裁到页面内；裁后任一边小于 0.5pt 返回 undefined。 */
export function clipPdfBlockBox(
  block: { box: PdfFigureBlock["box"] },
  pageWidthPt: number,
  pageHeightPt: number,
): PdfBlockRect | undefined {
  const box = block.box;
  const [x0, y0, x1, y1] = [
    Math.max(0, box.xPt),
    Math.max(0, box.yPt),
    Math.min(pageWidthPt, box.xPt + box.widthPt),
    Math.min(pageHeightPt, box.yPt + box.heightPt),
  ];
  return x1 - x0 < 0.5 || y1 - y0 < 0.5 ? undefined : { x0, y0, x1, y1 };
}

/** 为每个图片块写一段带 MCID 的空裁剪内容，供标签 PDF 引用；tagged 为 false 时不输出。 */
export function buildPdfFigureOperators(
  blocks: readonly PdfFigureBlock[] | null | undefined,
  pageWidthPt: number,
  pageHeightPt: number,
  firstMcid: number,
  tagged: boolean,
): { ops: string; marks: PdfFigureMark[] } {
  const marks: PdfFigureMark[] = [];
  let ops = "";
  if (tagged)
    (blocks ?? []).forEach((block, index) => {
      if (block.role !== "Figure") return;
      const rect = clipPdfBlockBox(block, pageWidthPt, pageHeightPt);
      if (rect === undefined) return;
      const mcid = firstMcid + marks.length;
      marks.push({ mcid, block: index, item: undefined, link: undefined });
      ops +=
        "/Figure << /MCID " +
        String(mcid) +
        ` >> BDC
` +
        [rect.x0, rect.y0, rect.x1 - rect.x0, rect.y1 - rect.y0].map(formatPdfNumber).join(" ") +
        ` re n
EMC
`;
    });
  return { ops, marks };
}

/** 找出还没有文字标记、可以挂链接的图片块：链接 -> 块序号。 */
export function mapPdfFigureLinks(
  blocks: readonly PdfFigureBlock[] | null | undefined,
  marks: readonly { link?: unknown }[],
  pageWidthPt: number,
  pageHeightPt: number,
): Map<unknown, number> {
  const markedLinks = new Set(marks.map((mark) => mark.link).filter((link) => link !== undefined));
  const byLink = new Map<unknown, number>();
  (blocks ?? []).forEach((block, index) => {
    if (
      block.role === "Figure" &&
      block.link !== undefined &&
      !markedLinks.has(block.link) &&
      !byLink.has(block.link) &&
      clipPdfBlockBox(block, pageWidthPt, pageHeightPt) !== undefined
    )
      byLink.set(block.link, index);
  });
  return byLink;
}

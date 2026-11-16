import { normalizePdfTitle, pdfStringOperand } from "./document";
import { textRunsNeedSpace } from "./text-operators";

/** 书签标题的最大长度。 */
export const maxOutlineTitleLength = 200;

/** 页内一段已排版的文字，block 是它所属块的序号。 */
export interface OutlineTextItem {
  block: number;
  run: { text: string };
}

/** 书签对象：根对象号、下一个可用对象号，以及各对象的正文。 */
export interface PdfOutline {
  rootObj: number;
  nextObj: number;
  bodies: string[];
}

/**
 * 每页取第一个非空的 H1–H6 块作为书签；没有任何书签时返回 undefined。
 * rootObj 是书签根对象号，后面依次是各书签项；pageObjectOf 把页序号换成页对象号。
 */
export function buildPdfOutline(
  rootObj: number,
  pageItems: readonly (readonly OutlineTextItem[])[],
  blockTagsByPage: readonly (readonly string[])[],
  pageObjectOf: (page: number) => number,
): PdfOutline | undefined {
  const entries: { page: number; title: string }[] = [];
  pageItems.forEach((items, page) => {
    blockTagsByPage[page]!.some((tag, block) => {
      if (!/^H[1-6]$/.test(tag)) return false;
      let text = "";
      let previousRun: OutlineTextItem["run"] | undefined;
      for (const item of items)
        if (item.block === block) {
          text += (previousRun !== undefined && textRunsNeedSpace(previousRun, item.run) ? " " : "") + item.run.text;
          previousRun = item.run;
        }
      text = normalizePdfTitle(text, maxOutlineTitleLength);
      if (text === "") return false;
      entries.push({ page, title: text });
      return true;
    });
  });
  if (entries.length === 0) return undefined;
  const ref = (obj: number): string => String(obj) + " 0 R";
  const bodies = [
    "<< /Type /Outlines /First " +
      ref(rootObj + 1) +
      " /Last " +
      ref(rootObj + entries.length) +
      " /Count " +
      String(entries.length) +
      " >>",
  ];
  entries.forEach((entry, index) => {
    const obj = rootObj + 1 + index;
    bodies.push(
      "<< /Title " +
        pdfStringOperand(entry.title) +
        " /Parent " +
        ref(rootObj) +
        (index > 0 ? " /Prev " + ref(obj - 1) : "") +
        (index < entries.length - 1 ? " /Next " + ref(obj + 1) : "") +
        " /Dest [" +
        ref(pageObjectOf(entry.page)) +
        " /XYZ null null null] >>",
    );
  });
  return {
    rootObj,
    nextObj: rootObj + bodies.length,
    bodies,
  };
}

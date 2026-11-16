import type {
  MarkdownBlock,
  MarkdownBlockSource,
  MarkdownParseResult,
} from "../contracts";
import { normalizeMarkdownBlock } from "./markdown-blocks";

/** 单篇文档最多解析的块数，超出的内容不再解析 */
export const MAX_PARSED_MARKDOWN_BLOCKS = 1000;
export const MARKDOWN_IMAGE_LINE_PATTERN = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
export const MARKDOWN_ORDERED_LIST_PATTERN = /^\d{1,4}[.)]\s+/;

/**
 * 把 Markdown 切成块，并记录每块的原文（text）与它之前被跳过的内容（lead，如空行），
 * 供编辑后按块回写。
 */
export function parseMarkdownBlocks(markdown: string): MarkdownParseResult {
  const blocks: MarkdownBlock[] = [];
  const sources: MarkdownBlockSource[] = [];
  const lines = markdown.split("\n");
  let sourceCursor = 0;
  // 加入一个块，原文取 [startLine, endLine) 行，再接上 tail
  const appendBlock = (
    block: MarkdownBlock,
    startLine: number,
    endLine: number,
    tail = "",
  ): boolean => {
    if (blocks.length >= MAX_PARSED_MARKDOWN_BLOCKS) {
      return false;
    }
    blocks.push(normalizeMarkdownBlock(block));
    sources.push({
      text: lines.slice(startLine, endLine).join("\n") + tail,
      lead: lines
        .slice(sourceCursor, startLine)
        .map((line: string): string => line + "\n")
        .join(""),
    });
    sourceCursor = endLine;
    return true;
  };
  let lineIndex = 0;
  let paragraphLines: string[] = [];
  let paragraphStart = 0;
  const flushParagraph = (): void => {
    if (paragraphLines.length > 0) {
      appendBlock(
        {
          type: "p",
          text: paragraphLines.join(" "),
        },
        paragraphStart,
        lineIndex,
      );
      paragraphLines = [];
    }
  };
  while (
    lineIndex < lines.length &&
    blocks.length < MAX_PARSED_MARKDOWN_BLOCKS
  ) {
    const line = (lines[lineIndex] ?? "").trim();
    if (line === "") {
      flushParagraph();
      lineIndex += 1;
      continue;
    }
    // 围栏代码块：开头的反引号后不能再出现反引号；结束行以同样数量的反引号开头
    if (
      line.startsWith("```") &&
      !line.replace(/^\u0060+/, "").includes("`")
    ) {
      flushParagraph();
      const fenceStart = lineIndex;
      const fenceLength = (/^\u0060+/.exec(line)?.[0] ?? "```").length;
      const fence = "`".repeat(fenceLength);
      const codeLines: string[] = [];
      let closed = false;
      lineIndex += 1;
      while (lineIndex < lines.length) {
        const codeLine = lines[lineIndex] ?? "";
        if (codeLine.trim().startsWith(fence)) {
          closed = true;
          lineIndex += 1;
          break;
        }
        codeLines.push(codeLine);
        lineIndex += 1;
      }
      // 没有结束行时，原文不包含末尾的空行，回写时补上结束围栏
      let fenceEnd = lineIndex;
      if (!closed) {
        while (
          fenceEnd > fenceStart + 1 &&
          (lines[fenceEnd - 1] ?? "").trim() === ""
        ) {
          fenceEnd -= 1;
        }
      }
      appendBlock(
        {
          type: "code",
          text: codeLines.join("\n"),
        },
        fenceStart,
        fenceEnd,
        closed ? "" : "\n" + fence,
      );
      continue;
    }
    if (line.startsWith("#")) {
      flushParagraph();
      const heading = /^(#{1,6})\s+([\s\S]*)$/.exec(line);
      if (heading && heading[1] !== undefined && heading[2] !== undefined) {
        const level = heading[1].length;
        appendBlock(
          {
            type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
            text: heading[2],
          },
          lineIndex,
          lineIndex + 1,
        );
      } else {
        appendBlock(
          {
            type: "p",
            text: line,
          },
          lineIndex,
          lineIndex + 1,
        );
      }
      lineIndex += 1;
      continue;
    }
    if (/^(---+|\*\*\*+|___+)$/.test(line)) {
      flushParagraph();
      appendBlock(
        {
          type: "divider",
        },
        lineIndex,
        lineIndex + 1,
      );
      lineIndex += 1;
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph();
      const quoteStart = lineIndex;
      const quoteLines = [];
      while (lineIndex < lines.length) {
        const quoteLine = (lines[lineIndex] ?? "").trim();
        if (!quoteLine.startsWith(">")) {
          break;
        }
        quoteLines.push(quoteLine.replace(/^>\s?/, ""));
        lineIndex += 1;
      }
      appendBlock(
        {
          type: "quote",
          text: quoteLines.join(" "),
        },
        quoteStart,
        lineIndex,
      );
      continue;
    }
    if (
      /^[-*+]\s+/.test(line) ||
      MARKDOWN_ORDERED_LIST_PATTERN.test(line)
    ) {
      flushParagraph();
      const ordered = MARKDOWN_ORDERED_LIST_PATTERN.test(line);
      const listStart = lineIndex;
      const items = [];
      while (lineIndex < lines.length) {
        const itemLine = (lines[lineIndex] ?? "").trim();
        if (
          !(ordered
            ? MARKDOWN_ORDERED_LIST_PATTERN.test(itemLine)
            : /^[-*+]\s+/.test(itemLine))
        ) {
          break;
        }
        items.push(
          itemLine.replace(
            ordered ? MARKDOWN_ORDERED_LIST_PATTERN : /^[-*+]\s+/,
            "",
          ),
        );
        lineIndex += 1;
      }
      appendBlock(
        {
          type: ordered ? "ol" : "ul",
          items,
        },
        listStart,
        lineIndex,
      );
      continue;
    }
    const image = MARKDOWN_IMAGE_LINE_PATTERN.exec(line);
    if (image && image[2] !== undefined) {
      flushParagraph();
      appendBlock(
        {
          type: "img",
          src: image[2],
          alt: image[1] ?? "",
          size: "m",
        },
        lineIndex,
        lineIndex + 1,
      );
      lineIndex += 1;
      continue;
    }
    if (line.startsWith("|") && line.endsWith("|") && line.length > 1) {
      flushParagraph();
      const tableStart = lineIndex;
      const rows: string[][] = [];
      let header = false;
      let rowIndex = 0;
      while (lineIndex < lines.length) {
        const rowLine = (lines[lineIndex] ?? "").trim();
        if (
          !(
            rowLine.startsWith("|") &&
            rowLine.endsWith("|") &&
            rowLine.length > 1
          )
        ) {
          break;
        }
        // 以未转义的 | 分列
        const cells = rowLine
          .slice(1, -1)
          .split(/(?<!\\)\|/)
          .map((cell: string) => cell.trim());
        // 第二行全是 --- 时是表头分隔行，不作为数据行
        if (
          rowIndex === 1 &&
          cells.every((cell: string) => /^:?-{2,}:?$/.test(cell))
        ) {
          header = true;
        } else {
          rows.push(
            cells.map((cell: string) =>
              cell.replace(/\\\|/g, "|").replace(/^\\(?=:?-{2,}:?$)/, ""),
            ),
          );
        }
        rowIndex += 1;
        lineIndex += 1;
      }
      appendBlock(
        {
          type: "table",
          header,
          rows,
        },
        tableStart,
        lineIndex,
      );
      continue;
    }
    if (paragraphLines.length === 0) {
      paragraphStart = lineIndex;
    }
    paragraphLines.push(line);
    lineIndex += 1;
  }
  flushParagraph();
  return {
    blocks,
    sources,
  };
}

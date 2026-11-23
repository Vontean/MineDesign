/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { formatPdfNumber, maxPdfDimensionPt, PdfDocumentResolvedValue as maxTextExtentPt } from "./document";
import { needsInterwordSpace } from "./link-annotations";

var PdfTextOperatorsLimit: Dynamic;
var PdfTextOperatorsFreezeValue: Dynamic;
var allowedStructureRoles: Dynamic;
var allowedListStyles: Dynamic;
var PdfTextOperatorsSubscribers: Dynamic;
var allowedListStyleSet: Dynamic;
var maxListItemIndex: Dynamic;
var getTableCellStructureRole: Dynamic;
function buildPdfTextRuns(
  textRuns?: Dynamic,
  pageIndex?: Dynamic,
  pageWidth?: Dynamic,
  pageHeight?: Dynamic,
  encodeText?: Dynamic,
  blocks?: Dynamic,
  hasStructure?: Dynamic,
): Dynamic {
  let index: Dynamic = 0,
    items: Dynamic = [],
    flag: Dynamic = false;
  textRuns.forEach((textRun?: Dynamic, runIndex?: Dynamic): Dynamic => {
    let normalizedRun: Dynamic =
        flag && textRun.spaceBefore !== undefined
          ? {
              ...textRun,
              spaceBefore: undefined,
            }
          : textRun,
      runLabel: Dynamic =
        "page " + String(pageIndex + 1) + " text run " + String(runIndex + 1);
    if (
      typeof normalizedRun.text != "string" ||
      !Number.isFinite(normalizedRun.xPt) ||
      !Number.isFinite(normalizedRun.yPt) ||
      !Number.isFinite(normalizedRun.sizePt) ||
      !Number.isFinite(normalizedRun.widthPt) ||
      normalizedRun.sizePt <= 0 ||
      normalizedRun.widthPt < 0 ||
      normalizedRun.sizePt > maxPdfDimensionPt ||
      normalizedRun.widthPt > maxTextExtentPt ||
      Math.abs(normalizedRun.xPt) > maxTextExtentPt ||
      Math.abs(normalizedRun.yPt) > maxTextExtentPt
    )
      throw new Error(runLabel + " is not a valid text run");
    if (
      hasStructure &&
      normalizedRun.block !== undefined &&
      !(
        Number.isInteger(normalizedRun.block) &&
        normalizedRun.block >= 0 &&
        normalizedRun.block < (blocks?.length ?? 0) &&
        blocks?.[normalizedRun.block] != null
      )
    )
      throw new Error(runLabel + " names a block the page does not have");
    if (
      hasStructure &&
      normalizedRun.block !== undefined &&
      blocks?.[normalizedRun.block]?.role === "Figure"
    )
      throw new Error(
        runLabel +
          " points at block " +
          String(normalizedRun.block + 1) +
          ", a figure, which can hold no text",
      );
    if (
      hasStructure &&
      normalizedRun.spaceBefore !== undefined &&
      typeof normalizedRun.spaceBefore != "boolean"
    )
      throw new Error(
        runLabel +
          " has a spaceBefore other than true or false (leave it out when unknown)",
      );
    if (
      hasStructure &&
      normalizedRun.link !== undefined &&
      !(Number.isInteger(normalizedRun.link) && normalizedRun.link >= 0)
    )
      throw new Error(
        runLabel +
          " has link " +
          (typeof normalizedRun.link == "string"
            ? JSON.stringify(normalizedRun.link)
            : String(normalizedRun.link)
          ).slice(0, 20) +
          "; it must be a whole number, 0 or more",
      );
    if (
      hasStructure &&
      normalizedRun.item !== undefined &&
      !(
        Number.isInteger(normalizedRun.item) &&
        normalizedRun.item >= 0 &&
        normalizedRun.item < maxListItemIndex
      )
    )
      throw new Error(
        runLabel + " names a list item that is not a whole number from 0",
      );
    let tableBlock: Dynamic =
      hasStructure &&
      normalizedRun.block !== undefined &&
      blocks?.[normalizedRun.block]?.role === "Table"
        ? blocks[normalizedRun.block]
        : undefined;
    if (
      tableBlock !== undefined &&
      normalizedRun.cell !== undefined &&
      !(
        Number.isInteger(normalizedRun.cell) &&
        normalizedRun.cell >= 0 &&
        normalizedRun.cell < tableBlock.rows * tableBlock.cols
      )
    )
      throw new Error(
        runLabel +
          " names table cell " +
          String(normalizedRun.cell).slice(0, 20) +
          ", but block " +
          String(normalizedRun.block + 1) +
          " is a " +
          String(tableBlock.rows) +
          " \xD7 " +
          String(tableBlock.cols) +
          " table whose cells are numbered 0 to " +
          String(tableBlock.rows * tableBlock.cols - 1),
      );
    index += normalizedRun.text.length;
    if (index > PdfTextOperatorsLimit)
      throw new Error(
        "page " +
          String(pageIndex + 1) +
          " has an implausibly large text layer",
      );
    if (
      normalizedRun.xPt > pageWidth ||
      normalizedRun.yPt < 0 ||
      normalizedRun.yPt > pageHeight ||
      normalizedRun.xPt + normalizedRun.widthPt < 0
    ) {
      flag = true;
      return;
    }
    let encodedText: Dynamic =
      normalizedRun.sizePt < 0.005 ? undefined : encodeText(normalizedRun.text);
    if (encodedText === undefined) {
      flag = true;
      return;
    }
    flag = false;
    let blockRole: Dynamic = blocks?.[normalizedRun.block ?? -1]?.role;
    items.push({
      run: normalizedRun,
      encoded: encodedText,
      block: normalizedRun.block,
      item:
        blockRole === "L"
          ? (normalizedRun.item ?? 0)
          : blockRole === "Table"
            ? (normalizedRun.cell ?? 0)
            : undefined,
      link: hasStructure && blockRole !== "Artifact" ? normalizedRun.link : undefined,
    });
  });
  return items;
}
function textRunsNeedSpace(previousRun?: Dynamic, nextRun?: Dynamic): Dynamic {
  return nextRun.spaceBefore !== undefined
    ? nextRun.spaceBefore &&
        needsInterwordSpace(previousRun.text, nextRun.text, true)
    : Math.abs(nextRun.yPt - previousRun.yPt) >=
        0.5 * Math.max(previousRun.sizePt, nextRun.sizePt) &&
        needsInterwordSpace(previousRun.text, nextRun.text, false);
}
function buildPdfTextOperators(
  items?: Dynamic,
  structureParents?: Dynamic,
  includeMarks?: Dynamic,
  blockRoles?: Dynamic,
  tableBlocks?: Dynamic,
  knownLinks?: Dynamic,
): Dynamic {
  if (items.length === 0)
    return {
      ops: "",
      marks: [],
    };
  items = items.map(
    (textRun?: Dynamic): Dynamic =>
      textRun.link === undefined || knownLinks.has(textRun.link)
        ? textRun
        : {
            ...textRun,
            link: undefined,
          },
  );
  let markedContent: Dynamic = [],
    operators: Dynamic = `BT
3 Tr
`,
    callback: Dynamic = (leftRun?: Dynamic, rightRun?: Dynamic): Dynamic =>
      rightRun !== undefined &&
      leftRun.block !== undefined &&
      rightRun.block === leftRun.block &&
      rightRun.item === leftRun.item,
    areAdjacentRuns: Dynamic = (leftRun?: Dynamic, rightRun?: Dynamic): Dynamic =>
      callback(leftRun, rightRun) && rightRun.link === leftRun.link;
  items.forEach((item?: Dynamic, index?: Dynamic): Dynamic => {
    let {
        run: run,
        encoded: encoded,
        block: blockIndex,
        item: itemIndex,
        link: linkIndex,
      }: Dynamic = item,
      nextItem: Dynamic = items[index + 1];
    if (includeMarks && !(index > 0 && areAdjacentRuns(items[index - 1], item))) {
      index > 0 &&
        (operators += `EMC
`);
      let structureRole: Dynamic = blockIndex === undefined ? "P" : blockRoles[blockIndex],
        markedRole: Dynamic =
          structureRole === "L"
            ? "LBody"
            : structureRole === "Table"
              ? getTableCellStructureRole(tableBlocks[blockIndex], itemIndex ?? 0)
              : structureRole;
      markedRole === "Artifact"
        ? (operators += `/Artifact BMC
`)
        : ((operators +=
            "/" +
            (linkIndex !== undefined ? "Link" : markedRole) +
            " << /MCID " +
            String(markedContent.length) +
            ` >> BDC
`),
          markedContent.push({
            mcid: markedContent.length,
            block: blockIndex,
            item: itemIndex,
            link: linkIndex,
          }));
    }
    let spacingRun: Dynamic =
        includeMarks &&
        callback(item, nextItem) &&
        encoded.reordered !== true &&
        textRunsNeedSpace(run, nextItem.run)
          ? structureParents
          : undefined,
      textWidth: Dynamic = encoded.em * run.sizePt,
      horizontalScale: Dynamic = textWidth > 0 ? (100 * run.widthPt) / textWidth : 100;
    horizontalScale = Math.max(10, Math.min(1e3, horizontalScale));
    operators +=
      "/F0 " +
      formatPdfNumber(run.sizePt) +
      ` Tf
` +
      formatPdfNumber(horizontalScale) +
      ` Tz
1 0 0 1 ` +
      formatPdfNumber(run.xPt) +
      " " +
      formatPdfNumber(run.yPt) +
      ` Tm
`;
    operators +=
      spacingRun === undefined
        ? encoded.operand +
          ` Tj
`
        : "[" +
          encoded.operand +
          " " +
          formatPdfNumber(spacingRun.em * 1e3) +
          " " +
          spacingRun.operand +
          `] TJ
`;
  });
  return {
    ops:
      operators +
      (includeMarks
        ? `EMC
`
        : "") +
      `ET
`,
    marks: markedContent,
  };
}
export {
  buildPdfTextOperators,
  buildPdfTextRuns,
  getTableCellStructureRole,
  PdfTextOperatorsFreezeValue,
  allowedListStyles,
  PdfTextOperatorsLimit,
  maxListItemIndex,
  PdfTextOperatorsSubscribers,
  allowedListStyleSet,
  textRunsNeedSpace,
};
export function installExportPdfTextOperators(): () => void {
  return () => {
    PdfTextOperatorsLimit = 2e5;
    PdfTextOperatorsFreezeValue = Object.freeze([
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "L",
      "Table",
      "Figure",
      "Artifact",
    ]);
    allowedStructureRoles = Object.freeze([
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "L",
      "Artifact",
    ]);
    allowedListStyles = Object.freeze([
      "None",
      "Disc",
      "Circle",
      "Square",
      "Decimal",
      "UpperRoman",
      "LowerRoman",
      "UpperAlpha",
      "LowerAlpha",
    ]);
    PdfTextOperatorsSubscribers = new Set(PdfTextOperatorsFreezeValue);
    allowedListStyleSet = new Set(allowedListStyles);
    maxListItemIndex = 1e4;
    getTableCellStructureRole = (
      cell?: Dynamic,
      rowIndex?: Dynamic,
    ): Dynamic =>
      rowIndex < (cell.headerRows ?? 0) * cell.cols ? "TH" : "TD";
  };
}

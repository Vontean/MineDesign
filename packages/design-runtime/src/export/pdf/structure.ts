/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { formatPdfNumber, pdfStringOperand, truncatePdfText } from "./document";
import { clipPdfBlockBox, maxFigureAltLength } from "./figure-operators";

function collectPdfStructureRoles(
  pages?: Dynamic,
  pageIndices?: Dynamic,
): Dynamic {
  let items: Dynamic = [];
  return pageIndices.map((pageMarks?: Dynamic, pageIndex?: Dynamic): Dynamic => {
    let value: Dynamic = (pages[pageIndex].blocks ?? []).map(
        (mark?: Dynamic): Dynamic => mark.role,
      ),
      values: Dynamic = new Set(
        pageMarks.map((mark?: Dynamic): Dynamic => mark.block),
      );
    value.forEach((role?: Dynamic, blockIndex?: Dynamic): Dynamic => {
      let headingMatch: Dynamic = values.has(blockIndex)
        ? /^H([1-6])$/.exec(role)
        : null;
      if (headingMatch === null) return;
      let headingLevel: Dynamic = Number(headingMatch[1]);
      for (; items.length > 0 && items[items.length - 1] >= headingLevel; )
        items.pop();
      items.push(headingLevel);
      value[blockIndex] = "H" + String(items.length);
    });
    return value;
  });
}
function buildPdfStructureTree(
  firstObjectNumber?: Dynamic,
  items?: Dynamic,
  textPages?: Dynamic,
  structurePages?: Dynamic,
  blockRoles?: Dynamic,
  annotationsByPage?: Dynamic,
  linkTargets?: Dynamic,
  markLinks?: Dynamic,
  pageObjectFor?: Dynamic,
): Dynamic {
  let nextObjectNumber: Dynamic = firstObjectNumber,
    callback: Dynamic = (): Dynamic => nextObjectNumber++,
    rootObject: Dynamic = callback(),
    parentTreeObject: Dynamic = callback(),
    catalogObject: Dynamic = callback(),
    formatObjectReference: Dynamic = (objectNumber?: Dynamic): Dynamic =>
      String(objectNumber) + " 0 R",
    formatStructureElement: Dynamic = (
      structureType?: Dynamic,
      parentObject?: Dynamic,
      pageContext?: Dynamic,
      parentTree?: Dynamic,
      extraAttributes: Dynamic = "",
    ): Dynamic =>
      "<< /Type /StructElem /S /" +
      structureType +
      " /P " +
      formatObjectReference(parentObject) +
      " /Pg " +
      formatObjectReference(pageObjectFor(pageContext)) +
      extraAttributes +
      " /K " +
      parentTree +
      " >>",
    formatChildren: Dynamic = (children?: Dynamic): Dynamic =>
      children.length === 1 ? String(children[0]) : "[" + children.join(" ") + "]",
    entries: Dynamic = new Map(),
    pageParents: Dynamic = [],
    numberTreeEntries: Dynamic = [],
    objectReferences: Dynamic = [];
  items.forEach((page?: Dynamic, pageIndex?: Dynamic): Dynamic => {
    let pageParentObject: Dynamic = callback();
    pageParents.push(pageParentObject);
    let pageChildren: Dynamic = [],
      mcidObjects: Dynamic = [],
      blockEntries: Dynamic = new Map(),
      linkNodes: Dynamic = [],
      linkEntries: Dynamic = new Map(),
      values: Dynamic = new Set(
        [...textPages[pageIndex].marks, ...structurePages[pageIndex].marks].map(
          (mark?: Dynamic): Dynamic => mark.block,
        ),
      ),
      definedMcids: Dynamic = new Set(
        linkTargets[pageIndex].filter(
          (definedValue?: Dynamic): Dynamic => definedValue !== undefined,
        ),
      ),
      linkMcidMap: Dynamic = new Map();
    for (let [mcid, linkIndex] of markLinks[pageIndex] as Dynamic)
      definedMcids.has(mcid) && linkMcidMap.set(linkIndex, mcid);
    let blockParentObjects: Dynamic = new Map(),
      index: Dynamic = 0,
      visitBlocksThrough: Dynamic = (lastBlockIndex?: Dynamic): Dynamic => {
        for (; index <= lastBlockIndex; index++) {
          if (!values.has(index)) continue;
          let blockObject: Dynamic = callback(),
            block: Dynamic = page.blocks[index],
            tableData: Dynamic =
              block.role === "Table"
                ? {
                    rows: Array.from(
                      {
                        length: block.rows,
                      },
                      callback,
                    ),
                    cells: Array.from(
                      {
                        length: block.rows * block.cols,
                      },
                      callback,
                    ),
                    mcids: Array.from(
                      {
                        length: block.rows * block.cols,
                      },
                      (): Dynamic => [],
                    ),
                  }
                : undefined;
          blockEntries.set(index, {
            obj: blockObject,
            mcids: [],
            items: new Map(),
            table: tableData,
          });
          let entry: Dynamic = linkMcidMap.get(index);
          if (entry === undefined) {
            pageChildren.push(blockObject);
            continue;
          }
          let state: Dynamic = {
            obj: callback(),
            kids: [formatObjectReference(blockObject)],
            parent: pageParentObject,
          };
          linkNodes.push(state);
          linkEntries.set(entry, state);
          blockParentObjects.set(index, state.obj);
          pageChildren.push(state.obj);
        }
      },
      appendMark: Dynamic = (
        mark?: Dynamic,
        parentObject?: Dynamic,
        mcids?: Dynamic,
      ): Dynamic => {
        if (mark.link === undefined) {
          mcids.push(mark.mcid);
          mcidObjects[mark.mcid] = parentObject;
          return;
        }
        let state: Dynamic = {
          obj: callback(),
          kids: [mark.mcid],
          parent: parentObject,
        };
        linkNodes.push(state);
        linkEntries.has(mark.link) || linkEntries.set(mark.link, state);
        mcids.push(formatObjectReference(state.obj));
        mcidObjects[mark.mcid] = state.obj;
      };
    for (let mark of textPages[pageIndex].marks as Dynamic) {
      if (mark.block === undefined) {
        let paragraphObject: Dynamic = callback();
        pageChildren.push(paragraphObject);
        let paragraphMcids: Dynamic = [];
        appendMark(mark, paragraphObject, paragraphMcids);
        entries.set(
          paragraphObject,
          formatStructureElement("P", pageParentObject, pageIndex, formatChildren(paragraphMcids)),
        );
        continue;
      }
      visitBlocksThrough(mark.block);
      let entry: Dynamic = blockEntries.get(mark.block);
      if (entry.table !== undefined)
        appendMark(
          mark,
          entry.table.cells[mark.item],
          entry.table.mcids[mark.item],
        );
      else if (mark.item === undefined)
        appendMark(mark, entry.obj, entry.mcids);
      else {
        let listItem: Dynamic = entry.items.get(mark.item);
        listItem === undefined &&
          ((listItem = {
            li: callback(),
            body: callback(),
            mcids: [],
          }),
          entry.items.set(mark.item, listItem));
        appendMark(mark, listItem.body, listItem.mcids);
      }
    }
    visitBlocksThrough((page.blocks?.length ?? 0) - 1);
    for (let mark of structurePages[pageIndex].marks as Dynamic) {
      blockEntries.get(mark.block).mcids.push(mark.mcid);
      mcidObjects[mark.mcid] = blockEntries.get(mark.block).obj;
    }
    for (let [blockIndex, blockEntry] of blockEntries as Dynamic) {
      let blockRole: Dynamic = blockRoles[pageIndex][blockIndex];
      if (blockRole === "Figure") {
        let block: Dynamic = page.blocks[blockIndex],
          blockBox: Dynamic = clipPdfBlockBox(
            block,
            page.widthPt,
            page.heightPt,
          ),
          altText: Dynamic =
            typeof block.alt == "string"
              ? truncatePdfText(
                  block.alt,
                  maxFigureAltLength,
                ).trim()
              : "",
          altAttribute: Dynamic =
            altText !== ""
              ? " /Alt " + pdfStringOperand(altText)
              : "";
        entries.set(
          blockEntry.obj,
          formatStructureElement(
            "Figure",
            blockParentObjects.get(blockIndex) ?? pageParentObject,
            pageIndex,
            formatChildren(blockEntry.mcids),
            altAttribute +
              " /A << /O /Layout /BBox [" +
              [blockBox.x0, blockBox.y0, blockBox.x1, blockBox.y1]
                .map(formatPdfNumber)
                .join(" ") +
              "] /Placement /Block >>",
          ),
        );
        continue;
      }
      if (blockRole === "Table") {
        let { cols: columnCount }: Dynamic = page.blocks[blockIndex],
          headerRowCount: Dynamic = page.blocks[blockIndex].headerRows ?? 0,
          table: Dynamic = blockEntry.table;
        entries.set(
          blockEntry.obj,
          formatStructureElement(
            "Table",
            pageParentObject,
            pageIndex,
            "[" + table.rows.map(formatObjectReference).join(" ") + "]",
          ),
        );
        table.rows.forEach(
          (row?: Dynamic, rowIndex?: Dynamic): Dynamic => {
            entries.set(
              row,
              formatStructureElement(
                "TR",
                blockEntry.obj,
                pageIndex,
                "[" +
                  table.cells
                    .slice(rowIndex * columnCount, (rowIndex + 1) * columnCount)
                    .map(formatObjectReference)
                    .join(" ") +
                  "]",
              ),
            );
            for (let columnIndex: Dynamic = 0; columnIndex < columnCount; columnIndex++) {
              let cellIndex: Dynamic = rowIndex * columnCount + columnIndex,
                cellAttribute: Dynamic =
                  rowIndex < headerRowCount
                    ? " /A << /O /Table /Scope /Column >>"
                    : "",
                cellMcids: Dynamic = table.mcids[cellIndex];
              entries.set(
                table.cells[cellIndex],
                cellMcids.length === 0
                  ? "<< /Type /StructElem /S /" +
                      (rowIndex < headerRowCount ? "TH" : "TD") +
                      " /P " +
                      formatObjectReference(row) +
                      " /Pg " +
                      formatObjectReference(pageObjectFor(pageIndex)) +
                      cellAttribute +
                      " >>"
                  : formatStructureElement(
                      rowIndex < headerRowCount ? "TH" : "TD",
                      row,
                      pageIndex,
                      formatChildren(cellMcids),
                      cellAttribute,
                    ),
              );
            }
          },
        );
        continue;
      }
      if (blockRole !== "L") {
        entries.set(
          blockEntry.obj,
          formatStructureElement(blockRole, pageParentObject, pageIndex, formatChildren(blockEntry.mcids)),
        );
        continue;
      }
      let numbering: Dynamic = page.blocks[blockIndex].numbering,
        listNumberingAttribute: Dynamic =
          numbering == null
            ? ""
            : " /A << /O /List /ListNumbering /" + numbering + " >>";
      entries.set(
        blockEntry.obj,
        formatStructureElement(
          "L",
          pageParentObject,
          pageIndex,
          "[" +
            [...blockEntry.items.values()]
              .map((listItem?: Dynamic): Dynamic => formatObjectReference(listItem.li))
              .join(" ") +
            "]",
          listNumberingAttribute,
        ),
      );
      for (let listItemEntry of blockEntry.items.values() as Dynamic) {
        entries.set(
          listItemEntry.li,
          formatStructureElement(
            "LI",
            blockEntry.obj,
            pageIndex,
            "[" + formatObjectReference(listItemEntry.body) + "]",
          ),
        );
        entries.set(
          listItemEntry.body,
          formatStructureElement("LBody", listItemEntry.li, pageIndex, formatChildren(listItemEntry.mcids)),
        );
      }
    }
    let annotationObjects: Dynamic = new Map();
    annotationsByPage[pageIndex].forEach(
      (annotation?: Dynamic, annotationIndex?: Dynamic): Dynamic => {
        let annotationObject: Dynamic =
            "<< /Type /OBJR /Obj " +
            formatObjectReference(annotation) +
            " /Pg " +
            formatObjectReference(pageObjectFor(pageIndex)) +
            " >>",
          linkTarget: Dynamic = linkTargets[pageIndex][annotationIndex],
          linkObject: Dynamic =
            linkTarget === undefined ? undefined : linkEntries.get(linkTarget)?.obj;
        linkObject !== undefined
          ? annotationObjects.set(linkObject, [...(annotationObjects.get(linkObject) ?? []), annotationObject])
          : ((linkObject = callback()),
            pageChildren.push(linkObject),
            entries.set(linkObject, formatStructureElement("Link", pageParentObject, pageIndex, annotationObject)));
        objectReferences.push(
          String(items.length + objectReferences.length) + " " + formatObjectReference(linkObject),
        );
      },
    );
    for (let linkNode of linkNodes as Dynamic)
      entries.set(
        linkNode.obj,
        formatStructureElement(
          "Link",
          linkNode.parent,
          pageIndex,
          formatChildren([...linkNode.kids, ...(annotationObjects.get(linkNode.obj) ?? [])]),
        ),
      );
    entries.set(
      pageParentObject,
      pageChildren.length === 0
        ? "<< /Type /StructElem /S /Sect /P " +
            formatObjectReference(catalogObject) +
            " /Pg " +
            formatObjectReference(pageObjectFor(pageIndex)) +
            " >>"
        : formatStructureElement(
            "Sect",
            catalogObject,
            pageIndex,
            "[" + pageChildren.map(formatObjectReference).join(" ") + "]",
          ),
    );
    numberTreeEntries.push(
      String(pageIndex) + " [" + mcidObjects.map(formatObjectReference).join(" ") + "]",
    );
  });
  let objectArray: Dynamic = [];
  objectArray[rootObject - firstObjectNumber] =
    "<< /Type /StructTreeRoot /K " +
    formatObjectReference(catalogObject) +
    " /ParentTree " +
    formatObjectReference(parentTreeObject) +
    " /ParentTreeNextKey " +
    String(items.length + objectReferences.length) +
    " >>";
  objectArray[parentTreeObject - firstObjectNumber] =
    "<< /Nums [" + [...numberTreeEntries, ...objectReferences].join(" ") + "] >>";
  objectArray[catalogObject - firstObjectNumber] =
    "<< /Type /StructElem /S /Document /P " +
    formatObjectReference(rootObject) +
    " /K [" +
    pageParents.map(formatObjectReference).join(" ") +
    "] >>";
  for (let [objectNumber, objectValue] of entries as Dynamic)
    objectArray[objectNumber - firstObjectNumber] = objectValue;
  return {
    rootObj: rootObject,
    nextObj: nextObjectNumber,
    bodies: objectArray,
  };
}
export {
  buildPdfStructureTree,
  collectPdfStructureRoles,
};
export function installExportPdfStructure(): () => void {
  return () => {};
}

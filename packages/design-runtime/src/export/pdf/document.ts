/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { buildPdfFigureOperators, mapPdfFigureLinks } from "./figure-operators";
import { readJpegDimensions } from "./jpeg";
import { isLanguageTag } from "./language";
import { buildPdfLinkAnnotations, maxLinksPerDocument } from "./link-annotations";
import { validateLosslessPicture } from "./lossless";
import { buildPdfOutline, maxOutlineTitleLength } from "./outline";
import { buildPdfStructureTree, collectPdfStructureRoles } from "./structure";
import { createPdfUnicodeEncoder, encodeWinAnsiOperand, spaceOperands } from "./text-encoding";
import { buildPdfTextOperators, buildPdfTextRuns, PdfTextOperatorsFreezeValue, PdfTextOperatorsFreezeValue_3 as pdfFreezeValues, PdfTextOperatorsLimit_2 as pdfTextOperatorsLimit, PdfTextOperatorsSubscribers, PdfTextOperatorsSubscribers_2 as pdfTextOperatorSubscribers, textRunsNeedSpace } from "./text-operators";
import { buildPdfFontObjects, pdfHexCodeUnit, PdfUnicodeFontConstant } from "./unicode-font";

var PdfDocumentLimit: Dynamic;
var maxPdfDimensionPt: Dynamic;
var PdfDocumentResolvedValue: Dynamic;
function encodeAsciiBytes(text?: Dynamic): Dynamic {
  let bytes: Dynamic = new Uint8Array(text.length);
  for (let index: Dynamic = 0; index < text.length; index++) {
    let value: Dynamic = text.charCodeAt(index);
    if (value > 127) throw new Error("internal: non-ASCII in PDF structure");
    bytes[index] = value;
  }
  return bytes;
}
function formatPdfNumber(numberValue?: Dynamic): Dynamic {
  return String(Math.round(numberValue * 100) / 100);
}
function sanitizePdfText(textInput?: Dynamic, encoding?: Dynamic): Dynamic {
  return encoding === "winansi"
    ? Array.from(
        textInput.slice(0, 256),
        (character?: Dynamic): Dynamic =>
          /^[\x20-\x7e]$/.test(character) ? character : " ",
      ).join("")
    : truncatePdfText(textInput, 256);
}
function truncatePdfText(textInput?: Dynamic, maxLength?: Dynamic): Dynamic {
  return Array.from(textInput.slice(0, 2 * maxLength))
    .slice(0, maxLength)
    .map((character?: Dynamic): Dynamic => {
      let value: Dynamic = character.codePointAt(0);
      return value < 32 || (value >= 127 && value <= 159)
        ? " "
        : value >= 55296 && value <= 57343
          ? String.fromCharCode(PdfUnicodeFontConstant)
          : character;
    })
    .join("");
}
function normalizePdfTitle(titleInput?: Dynamic, maxLength?: Dynamic): Dynamic {
  return truncatePdfText(
    titleInput.replace(/[\s\p{Cc}]+/gu, " ").trim(),
    maxLength,
  ).trimEnd();
}
function pdfStringOperand(items?: Dynamic): Dynamic {
  if (/^[\x20-\x7e]*$/.test(items))
    return "(" + items.replace(/[\\()]/g, "\\$&") + ")";
  let text: Dynamic = "feff";
  for (let index: Dynamic = 0; index < items.length; index++)
    text += pdfHexCodeUnit(items.charCodeAt(index));
  return "<" + text + ">";
}
function pdfTextOperand(textInput?: Dynamic, encoding?: Dynamic): Dynamic {
  if (textInput === "") return "";
  let value: Dynamic = sanitizePdfText(textInput, encoding);
  if (
    encoding === "winansi" ||
    Array.from(textInput)
      .slice(0, 256)
      .every((character?: Dynamic): Dynamic => /^[\x20-\x7e]$/.test(character))
  )
    return "(" + value.replace(/[\\()]/g, "\\$&") + ")";
  let text: Dynamic = "feff";
  for (let index: Dynamic = 0; index < value.length; index++)
    text += pdfHexCodeUnit(value.charCodeAt(index));
  return "<" + text + ">";
}
function buildPdfXmpMetadata(metadataInput?: Dynamic): Dynamic {
  let value: Dynamic =
      `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
` +
      [
        "<dc:format>application/pdf</dc:format>",
        ...(metadataInput === ""
          ? []
          : [
              '<dc:title><rdf:Alt><rdf:li xml:lang="x-default">' +
                ((character?: Dynamic): Dynamic =>
                  character
                    .replace(
                      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,
                      "\uFFFD",
                    )
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;"))(metadataInput) +
                "</rdf:li></rdf:Alt></dc:title>",
            ]),
      ].join(`
`) +
      `
</rdf:Description>
</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`,
    metadataBytes: Dynamic = new TextEncoder().encode(value);
  return [
    encodeAsciiBytes(
      "<< /Type /Metadata /Subtype /XML /Length " +
        String(metadataBytes.length) +
        ` >>
stream
`,
    ),
    metadataBytes,
    encodeAsciiBytes(`
endstream`),
  ];
}
function buildPdfDocument(items?: Dynamic, documentOptions?: Dynamic): Dynamic {
  if (items.length === 0)
    throw new Error("nothing to export \u2014 no pages were produced");
  let value: Dynamic = items.map(
      (page?: Dynamic, pageIndex?: Dynamic): Dynamic => {
        if (
          !Number.isFinite(page.widthPt) ||
          !Number.isFinite(page.heightPt) ||
          page.widthPt < PdfDocumentLimit ||
          page.heightPt < PdfDocumentLimit ||
          page.widthPt > maxPdfDimensionPt ||
          page.heightPt > maxPdfDimensionPt
        )
          throw new Error(
            "page " + String(pageIndex + 1) + " has an out-of-range page size",
          );
        try {
          let jpegDimensions: Dynamic = readJpegDimensions(page.jpeg);
          page.lossless != null &&
            validateLosslessPicture(page.lossless, jpegDimensions);
          if (documentOptions?.tagged === true && page.blocks != null) {
            if (!Array.isArray(page.blocks))
              throw new Error("its blocks are not a list");
            if (page.blocks.length > pdfTextOperatorsLimit)
              throw new Error(
                "it has more than " +
                  String(pdfTextOperatorsLimit) +
                  " blocks",
              );
            let invalidBlockIndex: Dynamic = page.blocks.findIndex(
              (block?: Dynamic): Dynamic =>
                typeof block != "object" ||
                block === null ||
                !PdfTextOperatorsSubscribers.has(block.role),
            );
            if (invalidBlockIndex >= 0)
              throw new Error(
                "block " +
                  String(invalidBlockIndex + 1) +
                  " has a role other than " +
                  PdfTextOperatorsFreezeValue.join(", "),
              );
            let invalidFigureIndex: Dynamic = page.blocks.findIndex(
                (block?: Dynamic): Dynamic =>
                  block.role === "Figure" &&
                  !(
                    typeof block.box == "object" &&
                    block.box !== null &&
                    [
                      block.box.xPt,
                      block.box.yPt,
                      block.box.widthPt,
                      block.box.heightPt,
                    ].every(
                      (coordinate?: Dynamic): Dynamic =>
                        Number.isFinite(coordinate) &&
                        Math.abs(coordinate) <= PdfDocumentResolvedValue,
                    ) &&
                    (block.alt === undefined ||
                      typeof block.alt == "string")
                  ),
              ),
              invalidTableIndex: Dynamic = page.blocks.findIndex(
                (block?: Dynamic): Dynamic =>
                  block.role === "Table" &&
                  !(
                    Number.isInteger(block.cols) &&
                    Number.isInteger(block.rows) &&
                    block.cols >= 1 &&
                    block.rows >= 1 &&
                    block.cols * block.rows <=
                      pdfTextOperatorsLimit &&
                    (block.headerRows == null ||
                      (Number.isInteger(block.headerRows) &&
                        block.headerRows >= 0 &&
                        block.headerRows <= block.rows))
                  ),
              );
            if (invalidTableIndex >= 0) {
              let tableBlock: Dynamic = page.blocks[invalidTableIndex],
                formatTableValue: Dynamic = (tableValue?: Dynamic): Dynamic =>
                  String(tableValue).slice(0, 20);
              throw new Error(
                "block " +
                  String(invalidTableIndex + 1) +
                  " is a table with rows " +
                  formatTableValue(tableBlock.rows) +
                  ", cols " +
                  formatTableValue(tableBlock.cols) +
                  ", headerRows " +
                  formatTableValue(tableBlock.headerRows) +
                  ": rows and cols must be whole numbers from 1 with rows \xD7 cols at most " +
                  String(pdfTextOperatorsLimit) +
                  ", and headerRows, when given, a whole number from 0 to rows",
              );
            }
            if (
              page.blocks.reduce(
                (blockIndex?: Dynamic, block?: Dynamic): Dynamic =>
                  blockIndex +
                  (block.role === "Table"
                    ? block.rows * block.cols
                    : 0),
                0,
              ) > pdfTextOperatorsLimit
            )
              throw new Error(
                "its tables hold more than " +
                  String(pdfTextOperatorsLimit) +
                  " cells in all",
              );
            if (invalidFigureIndex >= 0)
              throw new Error(
                "block " +
                  String(invalidFigureIndex + 1) +
                  " is a figure with a bad box (xPt, yPt, widthPt and heightPt must each be a finite number of at most " +
                  String(PdfDocumentResolvedValue) +
                  ") or an alt that is not a string",
              );
            let invalidLinkIndex: Dynamic = page.blocks.findIndex(
              (block?: Dynamic): Dynamic =>
                block.role === "Figure" &&
                block.link !== undefined &&
                !(Number.isInteger(block.link) && block.link >= 0),
            );
            if (invalidLinkIndex >= 0) {
              let link: Dynamic = page.blocks[invalidLinkIndex].link;
              throw new Error(
                "block " +
                  String(invalidLinkIndex + 1) +
                  " is a figure with link " +
                  (typeof link == "string"
                    ? JSON.stringify(link)
                    : String(link)
                  ).slice(0, 20) +
                  "; it must be a whole number, 0 or more",
              );
            }
            let invalidNumberingIndex: Dynamic = page.blocks.findIndex(
              (block?: Dynamic): Dynamic =>
                block.numbering != null &&
                !(
                  typeof block.numbering == "string" &&
                  pdfTextOperatorSubscribers.has(block.numbering)
                ),
            );
            if (invalidNumberingIndex >= 0)
              throw new Error(
                "block " +
                  String(invalidNumberingIndex + 1) +
                  " has list numbering " +
                  JSON.stringify(
                    String(page.blocks[invalidNumberingIndex].numbering).slice(0, 40),
                  ) +
                  "; allowed: " +
                  pdfFreezeValues.join(", "),
              );
          }
          return jpegDimensions;
        } catch (documentError: Dynamic) {
          throw new Error(
            "page " +
              String(pageIndex + 1) +
              ": " +
              (documentError instanceof Error ? documentError.message : String(documentError)),
          );
        }
      },
    ),
    callback: Dynamic = (pageNumber?: Dynamic): Dynamic => 4 + 3 * pageNumber,
    pageResourceObjectNumber: Dynamic = (pageNumber?: Dynamic): Dynamic => 5 + 3 * pageNumber,
    pageContentObjectNumber: Dynamic = (pageNumber?: Dynamic): Dynamic => 6 + 3 * pageNumber,
    hasTextContent: Dynamic = items.some(
      (page?: Dynamic): Dynamic => (page.textRuns?.length ?? 0) > 0,
    ),
    textEncoding: Dynamic =
      documentOptions?.textEncoding === "unicode" ? "unicode" : "winansi",
    state: Dynamic = {
      astral: new Map(),
      highBytes: new Set(),
    },
    fontObjectNumber: Dynamic =
      textEncoding === "unicode"
        ? createPdfUnicodeEncoder(state)
        : encodeWinAnsiOperand,
    baseObjectNumber: Dynamic = 4 + 3 * items.length,
    fontObjectOffset: Dynamic = hasTextContent ? (textEncoding === "unicode" ? 6 : 1) : 0,
    isTagged: Dynamic = documentOptions?.tagged === true,
    documentLanguage: Dynamic = documentOptions?.lang;
  if (isTagged && documentLanguage !== undefined && !isLanguageTag(documentLanguage))
    throw new Error(
      "the document language " +
        JSON.stringify(String(documentLanguage).slice(0, 40)) +
        ' is not a language tag such as "en" or "ja-JP"',
    );
  let normalizedPages: Dynamic = items.map(
      (page?: Dynamic, pageIndex?: Dynamic): Dynamic =>
        (page.textRuns?.length ?? 0) > 0
          ? buildPdfTextRuns(
              page.textRuns,
              pageIndex,
              page.widthPt,
              page.heightPt,
              fontObjectNumber,
              page.blocks,
              isTagged,
            )
          : [],
    ),
    textOperators: Dynamic = normalizedPages.map(
      (page?: Dynamic, pageIndex?: Dynamic): Dynamic =>
        isTagged
          ? mapPdfFigureLinks(
              items[pageIndex].blocks,
              page,
              items[pageIndex].widthPt,
              items[pageIndex].heightPt,
            )
          : new Map(),
    ),
    pageOutlines: Dynamic = normalizedPages.map(
      (pageLinks?: Dynamic, pageIndex?: Dynamic): Dynamic => {
        let entries: Dynamic = new Map();
        for (let linkIndex of pageLinks as Dynamic) {
          if (linkIndex.link === undefined) continue;
          let entry: Dynamic = entries.get(linkIndex.link);
          entry === undefined
            ? entries.set(linkIndex.link, {
                text: linkIndex.run.text,
                last: linkIndex.run,
              })
            : entries.set(linkIndex.link, {
                text:
                  entry.text +
                  (textRunsNeedSpace(entry.last, linkIndex.run)
                    ? " "
                    : "") +
                  linkIndex.run.text,
                last: linkIndex.run,
              });
        }
        let outlineTitles: Dynamic = new Map();
        for (let [linkIndex, linkTarget] of entries as Dynamic) {
          let normalizedTitle: Dynamic = normalizePdfTitle(
            linkTarget.text,
            maxOutlineTitleLength,
          );
          normalizedTitle !== "" && outlineTitles.set(linkIndex, normalizedTitle);
        }
        for (let [linkIndex, blockIndex] of textOperators[pageIndex] as Dynamic) {
          let altText: Dynamic = items[pageIndex].blocks[blockIndex].alt,
            normalizedAltText: Dynamic =
              typeof altText == "string"
                ? normalizePdfTitle(altText, maxOutlineTitleLength)
                : "";
          normalizedAltText !== "" && outlineTitles.set(linkIndex, normalizedAltText);
        }
        return (linkIndex?: Dynamic): Dynamic => outlineTitles.get(linkIndex);
      },
    ),
    remainingLinkSlots: Dynamic = maxLinksPerDocument,
    flag: Dynamic = false,
    index: Dynamic = 0,
    pageLinkAnnotations: Dynamic = items.map(
      (page?: Dynamic, pageIndex?: Dynamic): Dynamic => {
        let linkAnnotations: Dynamic = buildPdfLinkAnnotations(
          page.links,
          page.widthPt,
          page.heightPt,
          remainingLinkSlots,
          (): Dynamic => (flag = true),
          isTagged ? items.length + index : undefined,
          isTagged ? pageOutlines[pageIndex] : undefined,
        );
        remainingLinkSlots -= linkAnnotations.dicts.length;
        index += linkAnnotations.dicts.length;
        return linkAnnotations;
      },
    );
  flag &&
    console.warn(
      "[pdf] the file holds " +
        String(maxLinksPerDocument) +
        " links; any further ones are not clickable",
    );
  let nextObjectNumber: Dynamic = baseObjectNumber + fontObjectOffset,
    pageAnnotationRefs: Dynamic = pageLinkAnnotations.map(
      (annotationGroup?: Dynamic): Dynamic => annotationGroup.dicts.map((): Dynamic => nextObjectNumber++),
    ),
    pageAnnotationObjects: Dynamic = pageAnnotationRefs.map(
      (annotationRef?: Dynamic): Dynamic =>
        annotationRef
          .map((objectNumber?: Dynamic): Dynamic => String(objectNumber) + " 0 R")
          .join(" "),
    ),
    taggedPageRefs: Dynamic = isTagged
      ? collectPdfStructureRoles(items, normalizedPages)
      : items.map((): Dynamic => []),
    pageTextObjects: Dynamic = normalizedPages.map(
      (page?: Dynamic, pageIndex?: Dynamic): Dynamic =>
        buildPdfTextOperators(
          page,
          spaceOperands[textEncoding],
          isTagged,
          taggedPageRefs[pageIndex],
          items[pageIndex].blocks,
          new Set(
            pageLinkAnnotations[pageIndex].anchors.filter(
              (anchorIndex?: Dynamic): Dynamic => anchorIndex !== undefined,
            ),
          ),
        ),
    ),
    pageContentObjects: Dynamic = items.map(
      (page?: Dynamic, pageIndex?: Dynamic): Dynamic =>
        buildPdfFigureOperators(
          page.blocks,
          page.widthPt,
          page.heightPt,
          pageTextObjects[pageIndex].marks.length,
          isTagged,
        ),
    );
  isTagged && textEncoding === "unicode" && state.highBytes.add(0);
  let outlineObjects: Dynamic = isTagged
      ? buildPdfStructureTree(
          nextObjectNumber,
          items,
          pageTextObjects,
          pageContentObjects,
          taggedPageRefs,
          pageAnnotationRefs,
          pageLinkAnnotations.map((page?: Dynamic): Dynamic => page.anchors),
          textOperators,
          callback,
        )
      : undefined,
    outlineCatalog: Dynamic =
      outlineObjects !== undefined && documentOptions?.outline === true
        ? buildPdfOutline(
            outlineObjects.nextObj,
            normalizedPages,
            taggedPageRefs,
            callback,
          )
        : undefined,
    pagesObjectNumber: Dynamic =
      outlineObjects !== undefined
        ? (outlineCatalog?.nextObj ?? outlineObjects.nextObj)
        : undefined,
    lastObjectNumber: Dynamic = pagesObjectNumber ?? nextObjectNumber - 1,
    documentItems: Dynamic = items
      .map(
        (item?: Dynamic, itemIndex?: Dynamic): Dynamic =>
          String(callback(itemIndex)) + " 0 R",
      )
      .join(" "),
    titleOperand: Dynamic = pdfTextOperand(documentOptions?.title ?? "", textEncoding),
    pdfObjects: Dynamic = [];
  pdfObjects.push([
    encodeAsciiBytes(
      outlineObjects === undefined
        ? "<< /Type /Catalog /Pages 2 0 R >>"
        : "<< /Type /Catalog /Pages 2 0 R /MarkInfo << /Marked true >> /ViewerPreferences << /DisplayDocTitle true >> /Lang (" +
            (documentLanguage ?? "und") +
            ") /StructTreeRoot " +
            String(outlineObjects.rootObj) +
            " 0 R" +
            (outlineCatalog !== undefined
              ? " /Outlines " + String(outlineCatalog.rootObj) + " 0 R"
              : "") +
            " /Metadata " +
            String(pagesObjectNumber) +
            " 0 R >>",
    ),
  ]);
  pdfObjects.push([
    encodeAsciiBytes(
      "<< /Type /Pages /Kids [" +
        documentItems +
        "] /Count " +
        String(items.length) +
        " >>",
    ),
  ]);
  pdfObjects.push([
    encodeAsciiBytes(
      "<<" + (titleOperand === "" ? "" : " /Title " + titleOperand) + " >>",
    ),
  ]);
  items.forEach((item?: Dynamic, itemIndex?: Dynamic): Dynamic => {
    let jpegDimensions: Dynamic = value[itemIndex],
      losslessData: Dynamic =
        item.lossless != null &&
        item.lossless.zlib.length + 2 < item.jpeg.length
          ? item.lossless
          : undefined,
      widthOperand: Dynamic = formatPdfNumber(item.widthPt),
      heightOperand: Dynamic = formatPdfNumber(item.heightPt),
      hasTextRuns: Dynamic = (item.textRuns?.length ?? 0) > 0;
    pdfObjects.push([
      encodeAsciiBytes(
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
          widthOperand +
          " " +
          heightOperand +
          "] /Resources << /XObject << /Im0 " +
          String(pageContentObjectNumber(itemIndex)) +
          " 0 R >> " +
          (hasTextRuns ? "/Font << /F0 " + String(baseObjectNumber) + " 0 R >> " : "") +
          "/ProcSet [/PDF /ImageC" +
          (hasTextRuns ? " /Text" : "") +
          "] >> /Contents " +
          String(pageResourceObjectNumber(itemIndex)) +
          " 0 R" +
          (pageAnnotationObjects[itemIndex] === ""
            ? ""
            : " /Annots [" + pageAnnotationObjects[itemIndex] + "]") +
          (outlineObjects === undefined
            ? ""
            : " /StructParents " + String(itemIndex) + " /Tabs /S") +
          " >>",
      ),
    ]);
    let contentStream: Dynamic =
        `q
` +
        widthOperand +
        " 0 0 " +
        heightOperand +
        ` 0 0 cm
/Im0 Do
Q
`,
      compressedContent: Dynamic =
        (outlineObjects === undefined
          ? contentStream
          : `/Artifact BMC
` +
            contentStream +
            `EMC
`) +
        pageTextObjects[itemIndex].ops +
        pageContentObjects[itemIndex].ops;
    pdfObjects.push([
      encodeAsciiBytes(
        "<< /Length " +
          String(compressedContent.length) +
          ` >>
stream
` +
          compressedContent +
          "endstream",
      ),
    ]);
    let imageBytes: Dynamic = losslessData !== undefined ? losslessData.zlib : item.jpeg;
    pdfObjects.push([
      encodeAsciiBytes(
        "<< /Type /XObject /Subtype /Image /Width " +
          String(jpegDimensions.width) +
          " /Height " +
          String(jpegDimensions.height) +
          " /ColorSpace " +
          (losslessData !== undefined || jpegDimensions.components === 3
            ? "/DeviceRGB"
            : "/DeviceGray") +
          " /BitsPerComponent 8 /Filter " +
          (losslessData !== undefined ? "/FlateDecode" : "/DCTDecode") +
          " /Length " +
          String(imageBytes.length) +
          ` >>
stream
`,
      ),
      imageBytes,
      encodeAsciiBytes(`
endstream`),
    ]);
  });
  hasTextContent && textEncoding === "unicode"
    ? pdfObjects.push(...buildPdfFontObjects(baseObjectNumber, state))
    : hasTextContent &&
      pdfObjects.push([
        encodeAsciiBytes(
          "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        ),
      ]);
  for (let annotationGroup of pageLinkAnnotations as Dynamic)
    for (let annotationDictionary of annotationGroup.dicts as Dynamic)
      pdfObjects.push([encodeAsciiBytes(annotationDictionary)]);
  if (outlineObjects !== undefined) {
    for (let outlineBody of outlineObjects.bodies as Dynamic)
      pdfObjects.push([encodeAsciiBytes(outlineBody)]);
    for (let catalogBody of (outlineCatalog?.bodies ?? []) as Dynamic)
      pdfObjects.push([encodeAsciiBytes(catalogBody)]);
    pdfObjects.push(
      buildPdfXmpMetadata(sanitizePdfText(documentOptions?.title ?? "", textEncoding)),
    );
  }
  let contentStreams: Dynamic = [],
    xrefPosition: Dynamic = 0,
    appendContentStream: Dynamic = (contentChunk?: Dynamic): Dynamic => {
      contentStreams.push(contentChunk);
      xrefPosition += contentChunk.length;
    };
  appendContentStream(
    encodeAsciiBytes(
      outlineObjects === undefined
        ? `%PDF-1.4
`
        : `%PDF-1.7
`,
    ),
  );
  appendContentStream(Uint8Array.from([37, 226, 227, 207, 211, 10]));
  let objectOffsets: Dynamic = [];
  pdfObjects.forEach((objectParts?: Dynamic, objectIndex?: Dynamic): Dynamic => {
    objectOffsets.push(xrefPosition);
    appendContentStream(
      encodeAsciiBytes(
        String(objectIndex + 1) +
          ` 0 obj
`,
      ),
    );
    for (let objectPart of objectParts as Dynamic) appendContentStream(objectPart);
    appendContentStream(
      encodeAsciiBytes(`
endobj
`),
    );
  });
  let xrefOffset: Dynamic = xrefPosition,
    formatXrefOffset: Dynamic = (objectOffset?: Dynamic): Dynamic =>
      String(objectOffset).padStart(10, "0");
  appendContentStream(
    encodeAsciiBytes(
      `xref
0 ` +
        String(lastObjectNumber + 1) +
        `
0000000000 65535 f 
` +
        objectOffsets
          .map(
            (objectOffset?: Dynamic): Dynamic =>
              formatXrefOffset(objectOffset) +
              ` 00000 n 
`,
          )
          .join("") +
        `trailer
<< /Size ` +
        String(lastObjectNumber + 1) +
        ` /Root 1 0 R /Info 3 0 R >>
startxref
` +
        String(xrefOffset) +
        `
%%EOF
`,
    ),
  );
  let bodyLength: Dynamic = contentStreams.reduce(
      (currentLength?: Dynamic, contentChunk?: Dynamic): Dynamic => currentLength + contentChunk.length,
      0,
    ),
    pdfBytes: Dynamic = new Uint8Array(bodyLength),
    contentOffset: Dynamic = 0;
  for (let contentChunk of contentStreams as Dynamic) {
    pdfBytes.set(contentChunk, contentOffset);
    contentOffset += contentChunk.length;
  }
  return pdfBytes;
}
export {
  buildPdfDocument,
  buildPdfXmpMetadata,
  encodeAsciiBytes,
  formatPdfNumber,
  normalizePdfTitle,
  PdfDocumentLimit,
  maxPdfDimensionPt as PdfDocumentLimit_2,
  PdfDocumentResolvedValue,
  pdfStringOperand,
  pdfTextOperand,
  sanitizePdfText,
  truncatePdfText,
};
export function installExportPdfDocument(): () => void {
  return () => {
    PdfDocumentLimit = 3;
    maxPdfDimensionPt = 14400;
    PdfDocumentResolvedValue = 4 * maxPdfDimensionPt;
  };
}

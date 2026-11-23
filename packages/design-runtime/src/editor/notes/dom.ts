/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { NotesBlocksHandler, escapedMarkerPattern, NotesBlocksReplace, parseNoteBlocks } from "./blocks";
import { escapeMarkdownInline } from "./inline-markdown";

var NotesDomRepeat: Dynamic;
var NotesDomHandler: Dynamic;
var NotesDomBSTRONGIConfig: Dynamic;
var NotesDomBLOCKQUOTESECTIONPattern: Dynamic;
var NotesDomHttpsPattern: Dynamic;
var NotesDomJoin: Dynamic;
var NotesDomReplace: Dynamic;
var unescapeNoteText: Dynamic;
function createNoteInlineDom(
  doc?: Dynamic,
  markdown?: Dynamic,
  parseOptions?: Dynamic,
): Dynamic {
  let tokens: Dynamic = NotesBlocksHandler(markdown, parseOptions);
  return tokens.every((token?: Dynamic): Dynamic => token.text === "")
    ? [doc.createElement("br")]
    : tokens.map((source?: Dynamic): Dynamic => {
        if (source.kind === "text") return doc.createTextNode(source.text);
        let element: Dynamic = doc.createElement(
          (
            {
              bold: "strong",
              italic: "em",
              code: "code",
              link: "a",
            } as Dynamic
          )[source.kind],
        );
        element.textContent = source.text;
        (source.kind === "code" || source.kind === "link") &&
          (element.contentEditable = "false");
        source.kind === "link" &&
          ((element.dataset.href = source.href), (element.title = source.href));
        return element;
      });
}
function applyNoteMarkdownDom(
  element?: Dynamic,
  markdown?: Dynamic,
  parseOptions?: Dynamic,
): Dynamic {
  let ownerDocument: Dynamic = element.ownerDocument;
  element.replaceChildren();
  for (let block of parseNoteBlocks(
    markdown,
    parseOptions,
  ) as Dynamic) {
    if (block.kind === "p") {
      let paragraph: Dynamic = ownerDocument.createElement("div");
      paragraph.append(
        ...createNoteInlineDom(ownerDocument, block.text, parseOptions?.linksTo),
      );
      element.append(paragraph);
      continue;
    }
    let listElement: Dynamic = ownerDocument.createElement(block.kind);
    block.kind === "ol" &&
      block.start !== 1 &&
      listElement.setAttribute("start", String(block.start));
    for (let itemText of block.items as Dynamic) {
      let listItem: Dynamic = ownerDocument.createElement("li");
      listItem.append(
        ...createNoteInlineDom(ownerDocument, itemText, parseOptions?.linksTo),
      );
      listElement.append(listItem);
    }
    element.append(listElement);
  }
}
function serializeNoteDom(root?: Dynamic, serializeOptions?: Dynamic): Dynamic {
  let listsEnabled: Dynamic = serializeOptions?.lists !== false,
    lines: Dynamic = [],
    linePrefix: Dynamic = "",
    lineSegments: Dynamic = [],
    pendingRun: Dynamic = null,
    activeFormat: Dynamic = null,
    hasLineContent: Dynamic = false,
    formatMarkers: Dynamic = {
      bold: "**",
      italic: "*",
      code: "`",
    },
    flushPendingRun: Dynamic = (): Dynamic => {
      if (!pendingRun) return;
      let [, leadingSpace = "", innerText = "", trailingSpace = ""]: Dynamic =
        (pendingRun.k === "code" ? /^()(.*)()$/s : /^(\s*)(.*?)(\s*)$/s).exec(
          pendingRun.text,
        ) ?? [];
      innerText === "" || (pendingRun.k === "code" && !NotesDomHandler(innerText))
        ? lineSegments.push({
            k: "text",
            text: pendingRun.text,
          })
        : lineSegments.push(
            {
              k: "text",
              text: leadingSpace,
            },
            {
              k: pendingRun.k,
              text: innerText,
            },
            {
              k: "text",
              text: trailingSpace,
            },
          );
      pendingRun = null;
    },
    fingerprintSegments: Dynamic = (segments?: Dynamic): Dynamic => {
      let mergedSegments: Dynamic = [];
      for (let segment of segments as Dynamic) {
        let lastSegment: Dynamic = mergedSegments[mergedSegments.length - 1];
        segment.k === "text" && lastSegment?.k === "text"
          ? (lastSegment.text += segment.text)
          : (segment.text !== "" || segment.k !== "text") &&
            mergedSegments.push({
              ...segment,
            });
      }
      return mergedSegments
        .map(
          (mergedSegment?: Dynamic): Dynamic =>
            mergedSegment.k + "" + mergedSegment.text + "" + (mergedSegment.href ?? ""),
        )
        .join("");
    },
    escapeLinkText: Dynamic = (text?: Dynamic): Dynamic =>
      text.replace(/[\\[\]]/g, "\\$&"),
    separateAdjacentCode: Dynamic = (segments?: Dynamic): Dynamic => {
      let spacedSegments: Dynamic = [];
      for (let segment of segments as Dynamic) {
        segment.k === "code" &&
          spacedSegments[spacedSegments.length - 1]?.k === "code" &&
          spacedSegments.push({
            k: "text",
            text: " ",
          });
        spacedSegments.push(segment);
      }
      return spacedSegments;
    },
    renderSegments: Dynamic = (segments?: Dynamic): Dynamic =>
      segments
        .map(
          (segment?: Dynamic): Dynamic =>
            segment.k === "text"
              ? escapeMarkdownInline(segment.text)
              : segment.k === "link"
                ? "[" +
                  escapeLinkText(segment.text) +
                  "](" +
                  (segment.href ?? "").replace(/[\\[]/g, "\\$&") +
                  ")"
                : segment.k === "code"
                  ? (NotesDomRepeat(segment.text) ??
                    escapeMarkdownInline(segment.text))
                  : formatMarkers[segment.k] +
                    escapeMarkdownInline(segment.text) +
                    formatMarkers[segment.k],
        )
        .join(""),
    flushLine: Dynamic = (): Dynamic => {
      flushPendingRun();
      if (hasLineContent) {
        lineSegments = separateAdjacentCode(lineSegments);
        let lineText: Dynamic = renderSegments(lineSegments);
        linePrefix === "" &&
          listsEnabled &&
          (lineText = NotesBlocksReplace(lineText));
        fingerprintSegments(reparseSegments(lineText)) !== fingerprintSegments(lineSegments) &&
          (lineText = renderSegments(
            lineSegments.map(
              (segment?: Dynamic): Dynamic =>
                segment.k === "bold" || segment.k === "italic"
                  ? {
                      k: "text",
                      text: segment.text,
                    }
                  : segment,
            ),
          ));
        lines.push(linePrefix + lineText);
      }
      lineSegments = [];
      hasLineContent = false;
    },
    reparseSegments: Dynamic = (markdownText?: Dynamic): Dynamic =>
      NotesBlocksHandler(
        listsEnabled ? markdownText.replace(escapedMarkerPattern, "$1$2") : markdownText,
      ).map(
        (source?: Dynamic): Dynamic => ({
          k: source.kind,
          text: source.text,
          href: source.kind === "link" ? source.href : undefined,
        }),
      ),
    appendText: Dynamic = (rawText?: Dynamic): Dynamic => {
      rawText
        .replace(/\u00a0/g, " ")
        .split(
          `
`,
        )
        .forEach((lineText?: Dynamic, lineIndex?: Dynamic): Dynamic => {
          lineIndex > 0 && ((hasLineContent = true), flushLine());
          lineText !== "" &&
            (activeFormat
              ? ((pendingRun ??= {
                  k: activeFormat.k,
                  text: "",
                }).text += lineText)
              : lineSegments.push({
                  k: "text",
                  text: lineText,
                }),
            (hasLineContent = true));
        });
    },
    listItemMarker: Dynamic = (listItem?: Dynamic): Dynamic => {
      let parentElement: Dynamic = listItem.parentElement;
      if (!parentElement) return "";
      if (parentElement.tagName !== "OL") return "- ";
      let startAttribute: Dynamic = Number.parseInt(
          parentElement.getAttribute("start") ?? "1",
          10,
        ),
        itemNumber: Dynamic = Number.isFinite(startAttribute) && startAttribute >= 0 ? startAttribute : 1;
      for (
        let previousElementSibling: Dynamic = listItem.previousElementSibling;
        previousElementSibling;
        previousElementSibling = previousElementSibling.previousElementSibling
      )
        previousElementSibling.tagName === "LI" && (itemNumber += 1);
      return String(Math.min(itemNumber, 999)) + ". ";
    },
    walkNode: Dynamic = (node?: Dynamic): Dynamic => {
      if (node.nodeType === 3) {
        appendText(node.nodeValue ?? "");
        return;
      }
      if (node.nodeType !== 1) return;
      let element: Dynamic = node,
        tagName: Dynamic = element.tagName;
      if (tagName === "BR") {
        let parentElement: Dynamic = element.parentElement,
          isBlockBoundary: Dynamic =
            parentElement !== null &&
            (parentElement === root ||
              NotesDomBLOCKQUOTESECTIONPattern.test(parentElement.tagName));
        if (
          isBlockBoundary &&
          element.previousSibling === null &&
          element.nextSibling?.contentEditable === "false"
        )
          return;
        isBlockBoundary && element.nextSibling === null
          ? (hasLineContent = true)
          : ((hasLineContent = true), flushLine());
        return;
      }
      if (NotesDomBLOCKQUOTESECTIONPattern.test(tagName)) {
        flushLine();
        let savedPrefix: Dynamic = linePrefix;
        tagName === "LI" && listsEnabled && (linePrefix = listItemMarker(element));
        let length: Dynamic = lines.length;
        element.childNodes.forEach(walkNode);
        tagName === "LI" && lines.length === length && (hasLineContent = true);
        flushLine();
        linePrefix = savedPrefix;
        return;
      }
      let elementText: Dynamic = (element.textContent ?? "").replace(
          /[\n\u00a0]/g,
          " ",
        ),
        specialSegment: Dynamic =
          tagName === "A" &&
          NotesDomHttpsPattern.test(element.dataset.href ?? "") &&
          elementText !== ""
            ? {
                k: "link",
                text: elementText,
                href: element.dataset.href ?? "",
              }
            : tagName === "CODE" && elementText !== "" && NotesDomHandler(elementText)
              ? {
                  k: "code",
                  text: elementText,
                }
              : null;
      if (specialSegment !== null) {
        flushPendingRun();
        lineSegments.push(specialSegment);
        hasLineContent = true;
        return;
      }
      if (tagName === "A") {
        element.childNodes.forEach(walkNode);
        return;
      }
      let formatKind: Dynamic = NotesDomBSTRONGIConfig[tagName];
      if (formatKind !== undefined && activeFormat === null) {
        activeFormat = {
          k: formatKind,
        };
        element.childNodes.forEach(walkNode);
        flushPendingRun();
        activeFormat = null;
        return;
      }
      element.childNodes.forEach(walkNode);
    };
  root.childNodes.forEach(walkNode);
  flushLine();
  return lines.join(`
`);
}
function normalizeNoteLineBreaks(editor?: Dynamic): Dynamic {
  for (let lineBreak of [...editor.querySelectorAll("br")] as Dynamic) {
    let nextIsUneditable: Dynamic = lineBreak.nextSibling?.contentEditable === "false";
    nextIsUneditable && lineBreak.previousSibling === null && lineBreak.parentElement !== editor
      ? (lineBreak.dataset.notePh = "")
      : lineBreak.dataset.notePh !== undefined &&
        (lineBreak.previousSibling !== null || !nextIsUneditable) &&
        lineBreak.remove();
  }
}
export {
  applyNoteMarkdownDom,
  createNoteInlineDom,
  normalizeNoteLineBreaks,
  NotesDomBLOCKQUOTESECTIONPattern,
  NotesDomBSTRONGIConfig,
  NotesDomHandler,
  unescapeNoteText,
  NotesDomHttpsPattern,
  NotesDomJoin,
  NotesDomRepeat,
  NotesDomReplace,
  serializeNoteDom,
};
export function installEditorNotesDom(): () => void {
  return () => {
    NotesDomRepeat = (codeText?: Dynamic): Dynamic => {
      let fence: Dynamic = "`".repeat(
        (codeText.match(/\u0060+/g) ?? []).reduce(
          (maxRun?: Dynamic, run?: Dynamic): Dynamic =>
            Math.max(maxRun, run.length),
          0,
        ) + 1,
      );
      for (let padding of ["", " "] as Dynamic) {
        let candidate: Dynamic = fence + padding + codeText + padding + fence,
          parsedTokens: Dynamic = NotesBlocksHandler(candidate);
        if (
          parsedTokens.length === 1 &&
          parsedTokens[0]?.kind === "code" &&
          parsedTokens[0].text === codeText
        )
          return candidate;
      }
      return null;
    };
    NotesDomHandler = (text?: Dynamic): Dynamic =>
      NotesDomRepeat(text) !== null;
    NotesDomBSTRONGIConfig = {
      B: "bold",
      STRONG: "bold",
      I: "italic",
      EM: "italic",
      CODE: "code",
    };
    NotesDomBLOCKQUOTESECTIONPattern =
      /^(DIV|P|LI|UL|OL|H[1-6]|BLOCKQUOTE|PRE|SECTION|ARTICLE|TABLE|TR)$/;
    NotesDomHttpsPattern = /^https?:\/\/[^)\s]*$/;
    NotesDomJoin = (text?: Dynamic): Dynamic =>
      text
        .split(
          `
`,
        )
        .map(
          (line?: Dynamic): Dynamic =>
            NotesBlocksReplace(
              escapeMarkdownInline(line),
            ),
        ).join(`
`);
    NotesDomReplace = (text?: Dynamic): Dynamic =>
      text
        .split(
          `
`,
        )
        .map(
          (line?: Dynamic): Dynamic =>
            line.replace(escapedMarkerPattern, "$1$2"),
        )
        .join(
          `
`,
        )
        .replace(/\\([*\u0060[\]\\])/g, "$1");
    unescapeNoteText = (text?: Dynamic): Dynamic => {
      let unescapedText: Dynamic = NotesDomReplace(text);
      return NotesDomJoin(unescapedText) === text ? unescapedText : text;
    };
  };
}

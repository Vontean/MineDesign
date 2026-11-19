/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { LinksNavigationHttpsPattern } from "../links/navigation";
import { toModuleNamespace } from "../../module-helpers";

var jsxNotesInlineMarkdown: Dynamic;
var NotesInlineMarkdownPattern: Dynamic;
var Value_4: Dynamic;
var NotesInlineMarkdownUFDDUFDDPattern: Dynamic;
var encodeEscapes: Dynamic;
var decodeEscapes: Dynamic;
function trimCodeSpanPadding(text?: Dynamic, span?: Dynamic): Dynamic {
  if (
    span.to - span.from > 2 &&
    text.charCodeAt(span.from) === 32 &&
    text.charCodeAt(span.to - 1) === 32
  ) {
    let from: Dynamic = span.from;
    for (; from < span.to && text.charCodeAt(from) === 32; ) from++;
    let innerEnd: Dynamic = span.to - 1;
    for (; innerEnd > from && text.charCodeAt(innerEnd) === 32; ) innerEnd--;
    if (
      from < span.to &&
      (text.charCodeAt(from) === 96 || text.charCodeAt(innerEnd) === 96)
    )
      return text.slice(span.from + 1, span.to - 1);
  }
  return text.slice(span.from, span.to);
}
function scanMarkdownCodeSpans(text?: Dynamic): Dynamic {
  let runStarts: Dynamic = [],
    runLengths: Dynamic = [];
  for (let scanIndex: Dynamic = 0; scanIndex < text.length; ) {
    if (text.charCodeAt(scanIndex) !== 96) {
      scanIndex++;
      continue;
    }
    let runEnd: Dynamic = scanIndex;
    for (; runEnd < text.length && text.charCodeAt(runEnd) === 96; )
      runEnd++;
    runStarts.push(scanIndex);
    runLengths.push(runEnd - scanIndex);
    scanIndex = runEnd;
  }
  let closingRunIndex: Dynamic = new Array(runStarts.length).fill(-1),
    nextRunByLength: Dynamic = new Map();
  for (let runIndex: Dynamic = runStarts.length - 1; runIndex >= 0; runIndex--) {
    closingRunIndex[runIndex] = nextRunByLength.get(runLengths[runIndex]) ?? -1;
    nextRunByLength.set(runLengths[runIndex], runIndex);
  }
  let index: Dynamic = 0;
  return (fromIndex?: Dynamic): Dynamic => {
    for (; index < runStarts.length; index++) {
      let openStart: Dynamic = runStarts[index];
      if (openStart < fromIndex) continue;
      let closeRun: Dynamic = closingRunIndex[index];
      if (closeRun < 0) continue;
      let runLength: Dynamic = runLengths[index];
      return {
        start: openStart,
        end: runStarts[closeRun] + runLength,
        from: openStart + runLength,
        to: runStarts[closeRun],
      };
    }
  };
}
function escapeMarkdownInline(text?: Dynamic): Dynamic {
  return text.replace(/[*\u0060[\]\\]/g, "\\$&");
}
function parseNoteInlineMarkdown(
  markdown?: Dynamic,
  parseOptions?: Dynamic,
): Dynamic {
  let tokens: Dynamic = [],
    workingText: Dynamic =
      parseOptions?.escapes === true ? encodeEscapes(markdown) : markdown,
    findNextCodeSpan: Dynamic = scanMarkdownCodeSpans(workingText),
    pendingMatch: Dynamic,
    index: Dynamic = 0;
  for (; index < workingText.length; ) {
    let codeSpan: Dynamic = findNextCodeSpan(index);
    (pendingMatch === undefined || (pendingMatch !== null && pendingMatch.index < index)) &&
      ((NotesInlineMarkdownPattern.lastIndex = index),
      (pendingMatch = NotesInlineMarkdownPattern.exec(workingText)));
    if (pendingMatch === null && codeSpan === undefined) {
      tokens.push({
        kind: "text",
        text: workingText.slice(index),
      });
      break;
    }
    if (
      codeSpan !== undefined &&
      (pendingMatch === null || codeSpan.start < pendingMatch.index)
    ) {
      codeSpan.start > index &&
        tokens.push({
          kind: "text",
          text: workingText.slice(index, codeSpan.start),
        });
      tokens.push({
        kind: "code",
        text: trimCodeSpanPadding(workingText, codeSpan),
      });
      index = codeSpan.end;
      continue;
    }
    let match: Dynamic = pendingMatch;
    match.index > index &&
      tokens.push({
        kind: "text",
        text: workingText.slice(index, match.index),
      });
    match[2] !== undefined
      ? tokens.push({
          kind: "bold",
          text: match[2],
        })
      : match[4] !== undefined
        ? tokens.push({
            kind: "italic",
            text: match[4],
          })
        : match[6] !== undefined &&
          match[7] !== undefined &&
          (LinksNavigationHttpsPattern.test(match[7]) &&
          (parseOptions?.linksTo === undefined ||
            parseOptions.linksTo.has(
              workingText === markdown
                ? match[7]
                : decodeEscapes(match[7]),
            ))
            ? tokens.push({
                kind: "link",
                text: match[6],
                href: match[7],
              })
            : tokens.push({
                kind: "text",
                text:
                  parseOptions?.literalUnsafeLinks === true
                    ? match[0]
                    : match[6],
              }));
    index = match.index + match[0].length;
  }
  let mergedTokens: Dynamic = [];
  for (let token of tokens as Dynamic) {
    let lastToken: Dynamic = mergedTokens[mergedTokens.length - 1];
    token.kind === "text" && lastToken?.kind === "text"
      ? (lastToken.text += token.text)
      : mergedTokens.push(token);
  }
  if (workingText !== markdown)
    for (let mergedToken of mergedTokens as Dynamic) {
      mergedToken.text = decodeEscapes(
        mergedToken.text,
        mergedToken.kind === "code",
      );
      mergedToken.kind === "link" &&
        (mergedToken.href = decodeEscapes(mergedToken.href));
    }
  return mergedTokens;
}
export {
  escapeMarkdownInline,
  jsxNotesInlineMarkdown,
  NotesInlineMarkdownPattern,
  encodeEscapes as NotesInlineMarkdownReplace,
  decodeEscapes as NotesInlineMarkdownReplace_2,
  NotesInlineMarkdownUFDDUFDDPattern,
  parseNoteInlineMarkdown,
  scanMarkdownCodeSpans,
  trimCodeSpanPadding,
  Value_4,
};
export function installEditorNotesInlineMarkdown(): () => void {
  return () => {
    jsxNotesInlineMarkdown = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    NotesInlineMarkdownPattern =
      /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]\[]+)\]\(([^)\s\[]+)\))/g;
    Value_4 = "*`[]\\";
    NotesInlineMarkdownUFDDUFDDPattern = /[\uFDD0-\uFDD4]/g;
    encodeEscapes = (text?: Dynamic): Dynamic =>
      text
        .replace(NotesInlineMarkdownUFDDUFDDPattern, "")
        .replace(
          /\\([*\u0060[\]\\])/g,
          (matchedText?: Dynamic, escapedChar?: Dynamic): Dynamic =>
            String.fromCharCode(64976 + Value_4.indexOf(escapedChar)),
        );
    decodeEscapes = (
      text?: Dynamic,
      shouldEscape: Dynamic = false,
    ): Dynamic =>
      text.replace(
        NotesInlineMarkdownUFDDUFDDPattern,
        (placeholder?: Dynamic): Dynamic =>
          (shouldEscape ? "\\" : "") + (Value_4[placeholder.charCodeAt(0) - 64976] ?? ""),
      );
  };
}

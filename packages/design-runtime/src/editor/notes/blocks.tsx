import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { parseNoteInlineMarkdown } from "./inline-markdown";
import { toModuleNamespace } from "../../module-helpers";

var jsxNotesBlocks: Dynamic;
var bulletListPattern: Dynamic;
var orderedListPattern: Dynamic;
var escapedMarkerPattern: Dynamic;
var NotesBlocksReplace: Dynamic;
var normalizeBlocksText: Dynamic;
var NotesBlocksEscapesLiteralUnsafeLinksConfig: Dynamic;
var NotesBlocksHandler: Dynamic;
var NotesBlocksMap: Dynamic;
function parseNoteBlocks(text?: Dynamic, parseOptions?: Dynamic): Dynamic {
  let blocks: Dynamic = [],
    listsEnabled: Dynamic = parseOptions?.lists !== false;
  for (let line of text
    .replace(/\u00a0/g, " ")
    .replace(/[\uFDD0-\uFDD4]/g, "")
    .replace(/\n$/, "").split(`
`) as Dynamic) {
    let lastBlock: Dynamic = blocks[blocks.length - 1],
      bulletMatch: Dynamic = listsEnabled ? bulletListPattern.exec(line) : null,
      orderedMatch: Dynamic =
        bulletMatch || !listsEnabled ? null : orderedListPattern.exec(line);
    bulletMatch
      ? lastBlock?.kind === "ul"
        ? lastBlock.items.push(bulletMatch[1] ?? "")
        : blocks.push({
            kind: "ul",
            items: [bulletMatch[1] ?? ""],
          })
      : orderedMatch
        ? lastBlock?.kind === "ol"
          ? lastBlock.items.push(orderedMatch[2] ?? "")
          : blocks.push({
              kind: "ol",
              start: Number(orderedMatch[1]),
              items: [orderedMatch[2] ?? ""],
            })
        : blocks.push({
            kind: "p",
            text: listsEnabled
              ? line.replace(escapedMarkerPattern, "$1$2")
              : line,
          });
  }
  return blocks;
}
function serializeNoteBlocks(blocks?: Dynamic): Dynamic {
  let lines: Dynamic = [];
  for (let block of blocks as Dynamic)
    if (block.kind === "p") lines.push(NotesBlocksReplace(block.text));
    else if (block.kind === "ul")
      for (let item of block.items as Dynamic) lines.push("- " + item);
    else
      block.items.forEach(
        (item?: Dynamic, itemIndex?: Dynamic): Dynamic =>
          lines.push(
            String(Math.min(block.start + itemIndex, 999)) + ". " + item,
          ),
      );
  return lines.join(`
`);
}
function renderNoteInlineMarkdown(text?: Dynamic): Dynamic {
  return NotesBlocksHandler(text).map(
    (source?: Dynamic, index?: Dynamic): Dynamic =>
      source.kind === "bold" ? (
        <strong key={index}>{source.text}</strong>
      ) : source.kind === "italic" ? (
        <em key={index}>{source.text}</em>
      ) : source.kind === "code" ? (
        <code key={index}>{source.text}</code>
      ) : source.kind === "link" ? (
        <a key={index} data-href={source.href} title={source.href}>
          {source.text}
        </a>
      ) : (
        source.text
      ),
  );
}
function noteRichTextCost(text?: Dynamic): Dynamic {
  let cost: Dynamic = 0;
  for (let block of parseNoteBlocks(text) as Dynamic)
    for (let item of (block.kind === "p"
      ? [block.text]
      : block.items) as Dynamic)
      cost +=
        1 +
        NotesBlocksHandler(item).filter(
          (source?: Dynamic): Dynamic => source.kind !== "text",
        ).length;
  return cost;
}
function renderNoteMarkdown(text?: Dynamic): Dynamic {
  return parseNoteBlocks(text).map(
    (source?: Dynamic, index?: Dynamic): Dynamic =>
      source.kind === "p" ? (
        <div key={index}>
          {source.text === "" ? (<br />) : (renderNoteInlineMarkdown(source.text))}
        </div>
      ) : source.kind === "ul" ? (
        <ul key={index}>{NotesBlocksMap(source.items)}</ul>
      ) : (
        <ol key={index} start={source.start}>
          {NotesBlocksMap(source.items)}
        </ol>
      ),
  );
}
export {
  jsxNotesBlocks,
  noteRichTextCost,
  NotesBlocksEscapesLiteralUnsafeLinksConfig,
  NotesBlocksHandler,
  NotesBlocksMap,
  bulletListPattern as NotesBlocksPattern,
  orderedListPattern as NotesBlocksPattern_2,
  escapedMarkerPattern as NotesBlocksPattern_3,
  NotesBlocksReplace,
  normalizeBlocksText as NotesBlocksReplace_2,
  parseNoteBlocks,
  renderNoteInlineMarkdown,
  renderNoteMarkdown,
  serializeNoteBlocks,
};
export function installEditorNotesBlocks(): () => void {
  return () => {
    jsxNotesBlocks = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    bulletListPattern = /^ *[-•*] (.*)$/;
    orderedListPattern = /^ *(\d{1,3})\. (.*)$/;
    escapedMarkerPattern = /^( *(?:\d{1,3})?)\\([-•.](?= ))/;
    NotesBlocksReplace = (text?: Dynamic): Dynamic =>
      text
        .replace(/^( *)([-•])(?= )/, "$1\\$2")
        .replace(/^( *\d{1,3})\.(?= )/, "$1\\.");
    normalizeBlocksText = (text?: Dynamic): Dynamic =>
      serializeNoteBlocks(parseNoteBlocks(text))
        .replace(/(?:\n(?:- |\d{1,3}\. )?)+$/, "")
        .replace(/^(?:- |\d{1,3}\. )$/, "");
    NotesBlocksEscapesLiteralUnsafeLinksConfig = {
      escapes: true,
      literalUnsafeLinks: true,
    };
    NotesBlocksHandler = (text?: Dynamic, linksTo?: Dynamic): Dynamic =>
      parseNoteInlineMarkdown(
        text,
        linksTo
          ? {
              ...NotesBlocksEscapesLiteralUnsafeLinksConfig,
              linksTo: linksTo,
            }
          : NotesBlocksEscapesLiteralUnsafeLinksConfig,
      );
    NotesBlocksMap = (items?: Dynamic): Dynamic =>
      items.map(
        (item?: Dynamic, index?: Dynamic): Dynamic => (
          <li key={index}>
            {item === "" ? (<br />) : (renderNoteInlineMarkdown(item))}
          </li>
        ),
      );
  };
}

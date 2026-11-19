import type * as React from "react";
import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
import type * as Files from "../contracts/file-browser";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { classifyExternalLink, EXTERNAL_LINK_PATTERN, externalLinkProps } from "./external-links";
import { toModuleNamespace } from "../module-helpers";

var jsxInlineMarkdown: typeof import("react/jsx-runtime");
var INLINE_MARKDOWN_PATTERN: RegExp;
var MARKDOWN_ESCAPABLE_CHARACTERS: string;
var MARKDOWN_ESCAPE_SENTINEL_PATTERN: RegExp;
var encodeMarkdownEscapes: (markdown: string) => string;
var decodeMarkdownEscapes: (
  markdown: string,
  preserveBackslashes?: boolean,
) => string;
var renderInlineCode: (key: number, text: string) => React.ReactElement;
function codeSpanText(markdown: string, span: Core.MarkdownCodeSpan): string {
  if (
    span.to - span.from > 2 &&
    markdown.charCodeAt(span.from) === 32 &&
    markdown.charCodeAt(span.to - 1) === 32
  ) {
    let from = span.from;
    while (from < span.to && markdown.charCodeAt(from) === 32) {
      from++;
    }
    let value: number = span.to - 1;
    while (value > from && markdown.charCodeAt(value) === 32) {
      value--;
    }
    if (
      from < span.to &&
      (markdown.charCodeAt(from) === 96 || markdown.charCodeAt(value) === 96)
    ) {
      return markdown.slice(span.from + 1, span.to - 1);
    }
  }
  return markdown.slice(span.from, span.to);
}
function createCodeSpanScanner(
  markdown: string,
): (offset: number) => Core.MarkdownCodeSpan | undefined {
  let delimiterOffsets: number[] = [],
    delimiterLengths: number[] = [];
  for (let index = 0; index < markdown.length; ) {
    if (markdown.charCodeAt(index) !== 96) {
      index++;
      continue;
    }
    let value = index;
    while (value < markdown.length && markdown.charCodeAt(value) === 96) {
      value++;
    }
    delimiterOffsets.push(index);
    delimiterLengths.push(value - index);
    index = value;
  }
  let matchingDelimiterIndices: number[] = Array(
      delimiterOffsets.length,
    ).fill(-1),
    lastDelimiterByLength = new Map<number, number>();
  for (let value: number = delimiterOffsets.length - 1; value >= 0; value--) {
    matchingDelimiterIndices[value] =
      lastDelimiterByLength.get(delimiterLengths[value]) ?? -1;
    lastDelimiterByLength.set(delimiterLengths[value], value);
  }
  let cursor: number = 0;
  return (cursorIndex: number) => {
    for (; cursor < delimiterOffsets.length; cursor++) {
      let value = delimiterOffsets[cursor];
      if (value < cursorIndex) {
        continue;
      }
      let delimiterIndex = matchingDelimiterIndices[cursor];
      if (delimiterIndex < 0) {
        continue;
      }
      let delimiterLength = delimiterLengths[cursor];
      return {
        start: value,
        end: delimiterOffsets[delimiterIndex] + delimiterLength,
        from: value + delimiterLength,
        to: delimiterOffsets[delimiterIndex],
      };
    }
    return;
  };
}
function tokenizeInlineMarkdown(
  markdown: string,
  tokenizeOptions?: Core.InlineMarkdownOptions,
) {
  let tokens: Core.InlineMarkdownToken[] = [],
    escapedMarkdown =
      tokenizeOptions?.escapes === true ? encodeMarkdownEscapes(markdown) : markdown,
    nextCodeSpan = createCodeSpanScanner(escapedMarkdown),
    inlineMatch: RegExpExecArray | null | undefined,
    offset = 0;
  while (offset < escapedMarkdown.length) {
    let value = nextCodeSpan(offset);
    if (
      inlineMatch === undefined ||
      (inlineMatch !== null && inlineMatch.index < offset)
    ) {
      INLINE_MARKDOWN_PATTERN.lastIndex = offset;
      inlineMatch = INLINE_MARKDOWN_PATTERN.exec(escapedMarkdown);
    }
    if (inlineMatch === null && value === undefined) {
      tokens.push({
        kind: "text",
        text: escapedMarkdown.slice(offset),
      });
      break;
    }
    if (
      value !== undefined &&
      (inlineMatch === null || value.start < inlineMatch.index)
    ) {
      if (value.start > offset) {
        tokens.push({
          kind: "text",
          text: escapedMarkdown.slice(offset, value.start),
        });
      }
      tokens.push({
        kind: "code",
        text: codeSpanText(escapedMarkdown, value),
      });
      offset = value.end;
      continue;
    }
    let match = inlineMatch as RegExpExecArray;
    if (match.index > offset) {
      tokens.push({
        kind: "text",
        text: escapedMarkdown.slice(offset, match.index),
      });
    }
    if (match[2] !== undefined) {
      tokens.push({
        kind: "bold",
        text: match[2],
      });
    } else if (match[4] !== undefined) {
      tokens.push({
        kind: "italic",
        text: match[4],
      });
    } else if (match[6] !== undefined && match[7] !== undefined) {
      if (
        EXTERNAL_LINK_PATTERN.test(match[7]) &&
        (tokenizeOptions?.linksTo === undefined ||
          tokenizeOptions.linksTo.has(
            escapedMarkdown === markdown
              ? match[7]
              : decodeMarkdownEscapes(match[7]),
          ))
      ) {
        tokens.push({
          kind: "link",
          text: match[6],
          href: match[7],
        });
      } else {
        tokens.push({
          kind: "text",
          text: tokenizeOptions?.literalUnsafeLinks === true ? match[0] : match[6],
        });
      }
    }
    offset = match.index + match[0].length;
  }
  let mergedTokens: Core.InlineMarkdownToken[] = [];
  for (let value of tokens) {
    let lastToken = mergedTokens[mergedTokens.length - 1];
    if (value.kind === "text" && lastToken?.kind === "text") {
      lastToken.text += value.text;
    } else {
      mergedTokens.push(value);
    }
  }
  if (escapedMarkdown !== markdown) {
    for (let value of mergedTokens) {
      if (
        ((value.text = decodeMarkdownEscapes(
          value.text,
          value.kind === "code",
        )),
        value.kind === "link")
      ) {
        value.href = decodeMarkdownEscapes(value.href);
      }
    }
  }
  return mergedTokens;
}
function tokenizeCodeSpans(markdown: string): Core.InlineMarkdownToken[] {
  let tokens: Core.InlineMarkdownToken[] = [],
    nextCodeSpan = createCodeSpanScanner(markdown),
    offset = 0;
  for (
    let value = nextCodeSpan(offset);
    value !== undefined;
    value = nextCodeSpan(offset)
  ) {
    if (value.start > offset) {
      tokens.push({
        kind: "text",
        text: markdown.slice(offset, value.start),
      });
    }
    tokens.push({
      kind: "code",
      text: codeSpanText(markdown, value),
    });
    offset = value.end;
  }
  if (offset < markdown.length) {
    tokens.push({
      kind: "text",
      text: markdown.slice(offset),
    });
  }
  return tokens;
}
function renderCodeSpans(markdown: string): React.ReactNode {
  if (!markdown.includes("`")) {
    return markdown;
  }
  return tokenizeCodeSpans(markdown).map(
    (source: Core.InlineMarkdownToken, tokenIndex: number) =>
      source.kind === "code"
        ? renderInlineCode(tokenIndex, source.text)
        : source.text,
  );
}
function renderInlineMarkdown(
  markdown: string,
  renderOptions?: Core.InlineMarkdownOptions,
) {
  let value: boolean = renderOptions?.escapes === true,
    tokens = tokenizeInlineMarkdown(markdown, {
      escapes: value,
      literalUnsafeLinks: renderOptions?.literalUnsafeLinks === true,
      linksTo: renderOptions?.linksTo,
    });
  if (tokens.length === 1 && tokens[0]?.kind === "text") {
    return tokens[0].text;
  }
  return tokens.map((source: Core.InlineMarkdownToken, tokenIndex: number) => {
    switch (source.kind) {
      case "bold":
        return (() => {
          const _Element = "strong";
          const _elementProps = {
            children: value ? source.text : renderCodeSpans(source.text),
          };
          const _elementKey = tokenIndex;
          return <_Element key={_elementKey} {..._elementProps} />;
        })();
      case "italic":
        return (() => {
          const EmphasisTag = "em";
          const emphasisProps = {
            children: value ? source.text : renderCodeSpans(source.text),
          };
          const emphasisKey = tokenIndex;
          return <EmphasisTag key={emphasisKey} {...emphasisProps} />;
        })();
      case "code":
        return renderInlineCode(tokenIndex, source.text);
      case "link": {
        let linkMode = renderOptions?.links ?? "live";
        if (
          linkMode === "live" &&
          classifyExternalLink(source.href) === null
        ) {
          return source.text;
        }
        let linkTabIndex = renderOptions?.linkTabIndex;
        return (() => {
          const LinkTag = "a";
          const linkProps = {
            ...externalLinkProps(source.href, linkMode),
            ...(linkTabIndex === undefined
              ? {}
              : {
                  tabIndex: linkTabIndex,
                }),
            children: source.text,
          };
          const linkKey = tokenIndex;
          return <LinkTag key={linkKey} {...linkProps} />;
        })();
      }
      default:
        return source.text;
    }
  });
}
export {
  codeSpanText,
  createCodeSpanScanner,
  decodeMarkdownEscapes,
  encodeMarkdownEscapes,
  INLINE_MARKDOWN_PATTERN,
  jsxInlineMarkdown,
  MARKDOWN_ESCAPABLE_CHARACTERS,
  MARKDOWN_ESCAPE_SENTINEL_PATTERN,
  renderCodeSpans,
  renderInlineCode,
  renderInlineMarkdown,
  tokenizeCodeSpans,
  tokenizeInlineMarkdown,
};
export function installEditorInlineMarkdown(): () => void {
  return () => {
    jsxInlineMarkdown = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    INLINE_MARKDOWN_PATTERN =
      /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]\[]+)\]\(([^)\s\[]+)\))/g;
    MARKDOWN_ESCAPABLE_CHARACTERS = "*`[]\\";
    MARKDOWN_ESCAPE_SENTINEL_PATTERN = /[\uFDD0-\uFDD4]/g;
    encodeMarkdownEscapes = (markdown: string) =>
      markdown
        .replace(MARKDOWN_ESCAPE_SENTINEL_PATTERN, "")
        .replace(/\\([*\u0060[\]\\])/g, (escapedChar: string, character: string) =>
          String.fromCharCode(
            64976 + MARKDOWN_ESCAPABLE_CHARACTERS.indexOf(character),
          ),
        );
    decodeMarkdownEscapes = (markdown: string, preserveBackslashes = false) =>
      markdown.replace(
        MARKDOWN_ESCAPE_SENTINEL_PATTERN,
        (character: string): string =>
          (preserveBackslashes ? "\\" : "") +
          (MARKDOWN_ESCAPABLE_CHARACTERS[character.charCodeAt(0) - 64976] ?? ""),
      );
    renderInlineCode = (key: number, text: string) =>
      (() => {
        const CodeTag = "code";
        const codeProps = {
          className: "rounded bg-bg-warm px-1 font-mono text-[0.9em]",
          children: text,
        };
        const codeKey = key;
        return <CodeTag key={codeKey} {...codeProps} />;
      })();
  };
}

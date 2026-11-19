import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  MarkdownInlineOutput,
  MarkdownSource,
  MarkdownSerializedItem,
  MarkdownEditorProps,
} from "../contracts/file-browser";
import { loadJsxNamespace } from "../dependencies";
import { RENAME_BUTTON_SELECTOR } from "./editable-name";
import { linkUrlFromElement, openExternalLink, prepareEditableLinks } from "./external-links";
import { autoformatMarkdownBlock } from "./markdown-autoformat";
import { renderMarkdownBlock } from "./markdown-blocks";
import { createMarkdownCommitQueue } from "./markdown-commit";
import { MarkdownFormattingToolbar, MarkdownLinkPopover, README_TOOLBAR_MENU_ATTRIBUTE, TOOLBAR_FOCUSABLE_SELECTOR } from "./markdown-formatting";
import { parseMarkdownBlocks } from "./markdown-parser";
import { DesignSystemReactRuntime } from "../model/react-runtime";
import { toModuleNamespace } from "../module-helpers";
import { anyMenuOrPopoverOpen } from "../ui/property-focus";

var jsxEditableMarkdown: typeof import("react/jsx-runtime");
var MARKDOWN_COMMIT_DELAY_MS: number;
var MARKDOWN_COMMIT_MAX_DELAY_MS: number;
var EDITABLE_MARKDOWN_IMAGE_DATA_URL_PATTERN: RegExp;
var TEXT_NODE_TYPE: number;
var ELEMENT_NODE_TYPE: number;
var trailingBacktickCount: (text: string) => number;
var serializeMarkdownInlineNodes: (nodes: readonly Node[]) => string;
function appendSerializedMarkdownInline(
  output: MarkdownInlineOutput,
  text: string,
): void {
  if (text === "") {
    return;
  }
  let value: string =
      output.ticks > 0 && text.charCodeAt(0) === 96 ? " " : "",
    backtickCount = trailingBacktickCount(text);
  output.ticks =
    backtickCount === text.length && value === "" ? output.ticks + backtickCount : backtickCount;
  output.s += value + text;
}
function serializeMarkdownInlineNode(
  node: Node,
  previousTicks: number = 0,
): string {
  if (node.nodeType === TEXT_NODE_TYPE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== ELEMENT_NODE_TYPE) {
    return "";
  }
  let element: Element = node as Element,
    tagName = () =>
      serializeMarkdownInlineNodes(Array.from(element.childNodes)),
    callback = (text: string) => text.replace(/\s*\n\s*/g, " ");
  switch (element.tagName) {
    case "STRONG":
    case "B": {
      let value = callback(tagName());
      if (value.trim() === "") {
        return value;
      } else {
        return "**" + value + "**";
      }
    }
    case "EM":
    case "I": {
      let value = callback(tagName());
      if (value.trim() === "") {
        return value;
      } else {
        return "*" + value + "*";
      }
    }
    case "CODE": {
      let value = callback(element.textContent ?? "");
      if (value.trim() === "") {
        return value;
      }
      let backtickCount =
        (value.match(/`+/g) ?? []).reduce(
          (left: number, items: string): number =>
            Math.max(left, items.length),
          0,
        ) + 1;
      if (backtickCount === previousTicks) {
        backtickCount += 1;
      }
      let index: number = 0;
      while (index < value.length && value.charCodeAt(index) === 32) {
        index++;
      }
      let contentEnd: number = value.length - 1;
      while (contentEnd > index && value.charCodeAt(contentEnd) === 32) {
        contentEnd--;
      }
      let contentText: string =
          index < value.length &&
          (value.charCodeAt(index) === 96 || value.charCodeAt(contentEnd) === 96)
            ? " "
            : "",
        fence = "`".repeat(backtickCount);
      return fence + contentText + value + contentText + fence;
    }
    case "A": {
      let value = linkUrlFromElement(element),
        linkText = callback(tagName()).replace(/[\][]/g, " ");
      if (value !== "") {
        return "[" + linkText + "](" + value + ")";
      } else {
        return linkText;
      }
    }
    case "BR":
      return `
`;
    default:
      return tagName();
  }
}
function escapeMarkdownTableCell(text: string) {
  let value = text.replace(/\|/g, "\\|").replace(/\n/g, " ").trim();
  if (/^:?-{2,}:?$/.test(value)) {
    return "\\" + value;
  } else {
    return value;
  }
}
function serializeMarkdownEditor(
  root: HTMLElement,
  blockModels?: (node: Element) => MarkdownSource | undefined,
): string {
  let items: MarkdownSerializedItem[] = [],
    callback = (lineText: string): void => {
      let trimmedText = lineText.trim();
      if (trimmedText !== "") {
        items.push({
          text: trimmedText,
          typed: false,
        });
      }
    },
    appendText = (textValue: string): void => {
      let trimmedText = textValue.trim();
      if (trimmedText !== "") {
        items.push({
          text: trimmedText,
          typed: true,
        });
      }
    },
    text = "",
    index = 0,
    appendInline = (inlineText: string): void => {
      let state = {
        s: text,
        ticks: index,
      };
      appendSerializedMarkdownInline(state, inlineText);
      text = state.s;
      index = state.ticks;
    },
    finishBlock = (): void => {
      appendText(text);
      text = "";
      index = 0;
    },
    appendHeading = (prefix: string, element: Element): void => {
      finishBlock();
      let inlineText = serializeMarkdownInlineNode(element)
        .replace(/\s*\n\s*/g, " ")
        .trim();
      if (inlineText !== "") {
        appendText(prefix + " " + inlineText);
      }
    },
    serializeElement = (element: Element): void => {
      switch (element.tagName) {
        case "H1":
          appendHeading("#", element);
          return;
        case "H2":
          appendHeading("##", element);
          return;
        case "H3":
        case "H4":
        case "H5":
        case "H6":
          appendHeading("###", element);
          return;
        case "PRE": {
          finishBlock();
          let textContent = (element.textContent ?? "").replace(/\n$/, ""),
            maxFenceLength = [...textContent.matchAll(/`+/g)].reduce(
              (left: number, match: RegExpMatchArray): number =>
                Math.max(left, match[0].length),
              0,
            ),
            fence = "`".repeat(Math.max(3, maxFenceLength + 1));
          callback(
            fence +
              `
` +
              textContent +
              `
` +
              fence,
          );
          return;
        }
        case "BLOCKQUOTE": {
          finishBlock();
          let inlineText = serializeMarkdownInlineNode(element)
            .trim()
            .replace(/\n/g, " ");
          if (inlineText !== "") {
            callback("> " + inlineText);
          }
          return;
        }
        case "UL":
        case "OL": {
          finishBlock();
          let isOrderedList: boolean = element.tagName === "OL",
            listItems = Array.from(element.children)
              .filter((listElement: Element): boolean => listElement.tagName === "LI")
              .map((listElement: Element) =>
                serializeMarkdownInlineNode(listElement).trim().replace(/\n/g, " "),
              )
              .filter((listText: string): boolean => listText !== "")
              .map(
                (listText: string, listIndex: number): string =>
                  (isOrderedList ? String(listIndex + 1) + ". " : "- ") + listText,
              );
          if (listItems.length > 0) {
            callback(
              listItems.join(`
`),
            );
          }
          return;
        }
        case "HR":
          finishBlock();
          callback("---");
          return;
        case "IMG": {
          finishBlock();
          let imageSource = element.getAttribute("src") ?? "";
          if (EDITABLE_MARKDOWN_IMAGE_DATA_URL_PATTERN.test(imageSource)) {
            let imageAlt = (element.getAttribute("alt") ?? "")
              .replace(/[\][()]/g, " ")
              .replace(/\s*\n\s*/g, " ");
            appendText("![" + imageAlt + "](" + imageSource + ")");
          }
          return;
        }
        case "TABLE": {
          finishBlock();
          let tableRows: string[][] = [],
            flag: boolean = false,
            tableHead = element.querySelector("thead");
          if (tableHead) {
            let headerCells = Array.from(tableHead.querySelectorAll("th, td")).map(
              (cell: Element) =>
                escapeMarkdownTableCell(serializeMarkdownInlineNode(cell)),
            );
            if (headerCells.length > 0) {
              tableRows.push(headerCells);
              flag = true;
            }
          }
          for (let tableRow of Array.from(
            element.querySelectorAll("tbody tr"),
          )) {
            tableRows.push(
              Array.from(tableRow.children).map((cell: Element) =>
                escapeMarkdownTableCell(serializeMarkdownInlineNode(cell)),
              ),
            );
          }
          if (tableRows.length === 0) {
            return;
          }
          let tableLines = tableRows.map(
            (row: string[]): string => "| " + row.join(" | ") + " |",
          );
          if (flag && tableRows[0] !== undefined) {
            tableLines.splice(
              1,
              0,
              "| " + tableRows[0].map((): string => "---").join(" | ") + " |",
            );
          }
          callback(
            tableLines.join(`
`),
          );
          return;
        }
        case "P":
        case "DIV": {
          if (
            Array.from(element.children).some((child: Element) =>
              /^(H[1-6]|PRE|BLOCKQUOTE|UL|OL|HR|IMG|TABLE|P|DIV)$/.test(
                child.tagName,
              ),
            )
          ) {
            finishBlock();
            serializeNode(element);
            return;
          }
          finishBlock();
          appendText(serializeMarkdownInlineNode(element).replace(/\n/g, " "));
          return;
        }
        default: {
          if (
            Array.from(element.children).some((child: Element) =>
              /^(H[1-6]|PRE|BLOCKQUOTE|UL|OL|HR|IMG|TABLE|P|DIV)$/.test(
                child.tagName,
              ),
            )
          ) {
            finishBlock();
            serializeNode(element);
            return;
          }
          finishBlock();
          appendText((element.textContent ?? "").replace(/\s+/g, " "));
        }
      }
    },
    serializeNode = (node: Element): void => {
      for (let childNode of Array.from(node.childNodes)) {
        if (childNode.nodeType === TEXT_NODE_TYPE) {
          appendInline(childNode.textContent ?? "");
          continue;
        }
        if (childNode.nodeType !== ELEMENT_NODE_TYPE) {
          continue;
        }
        let element: Element = childNode as Element;
        if (element.tagName === "BR") {
          finishBlock();
          continue;
        }
        if (
          /^(STRONG|B|EM|I|CODE|A|SPAN|U|S|SMALL|SUB|SUP|MARK|FONT)$/.test(
            element.tagName,
          )
        ) {
          appendInline(serializeMarkdownInlineNode(element, index));
          continue;
        }
        let blockModel = node === root ? blockModels?.(element) : undefined;
        if (blockModel !== undefined) {
          finishBlock();
          items.push({
            text: blockModel.text,
            typed: false,
            source: blockModel,
          });
          continue;
        }
        serializeElement(element);
      }
    };
  serializeNode(root);
  finishBlock();
  let value: RegExp = /^\|.*\|$/,
    unorderedListPattern: RegExp = /^[-*+] /,
    orderedListPattern: RegExp = /^\d{1,4}[.)] /,
    quotePattern: RegExp = /^>/,
    firstBlockText = items[0]?.text ?? "";
  for (let count: number = 1; count < items.length; count++) {
    let previousBlock = items[count - 1],
      currentBlock = items[count];
    if (
      previousBlock.source !== undefined &&
      currentBlock.source !== undefined &&
      currentBlock.source.at === previousBlock.source.at + 1
    ) {
      firstBlockText +=
        `
` +
        currentBlock.source.lead +
        currentBlock.text;
      continue;
    }
    let isCompatible =
      previousBlock.typed &&
      currentBlock.typed &&
      ((value.test(previousBlock.text) && value.test(currentBlock.text)) ||
        (unorderedListPattern.test(previousBlock.text) && unorderedListPattern.test(currentBlock.text)) ||
        (orderedListPattern.test(previousBlock.text) && orderedListPattern.test(currentBlock.text)) ||
        (quotePattern.test(previousBlock.text) && quotePattern.test(currentBlock.text)));
    firstBlockText +=
      (isCompatible
        ? `
`
        : `

`) + currentBlock.text;
  }
  return firstBlockText;
}
function removeMarkdownModelNodes(
  root: HTMLElement,
  blockModels: Map<Node, MarkdownSource>,
  removedNodes: MutationRecord[],
): void {
  let callback = (node: Node): void => {
    blockModels.delete(node);
    for (let value of blockModels.keys()) {
      if (node.contains(value)) {
        blockModels.delete(value);
      }
    }
  };
  for (let value of removedNodes) {
    for (
      let target: Node | null = value.target;
      target !== null && target !== root;
      target = target.parentNode
    ) {
      blockModels.delete(target);
    }
    value.addedNodes.forEach(callback);
    value.removedNodes.forEach(callback);
  }
}
function MarkdownEditor({
  markdown: markdown,
  onMarkdown: onMarkdown,
  onDone: onDone,
  placeholder: placeholder,
  readOnly: readOnly,
  label: label,
  testId: testId,
  stripClassName: stripClassName,
}: MarkdownEditorProps) {
  useUiLocale();
  let ref = DesignSystemReactRuntime.useRef<HTMLDivElement | null>(
      null,
    ),
    isComposingRef = DesignSystemReactRuntime.useRef(false),
    [value, isFocused] = DesignSystemReactRuntime.useState(false),
    editorRef = DesignSystemReactRuntime.useRef<HTMLDivElement | null>(
      null,
    ),
    lastSerializedRef = DesignSystemReactRuntime.useRef<string | null>(null),
    [serializationVersion, setSerializationVersion] = DesignSystemReactRuntime.useState(0),
    markdownRef = DesignSystemReactRuntime.useRef(markdown),
    sourceMarkdownRef = DesignSystemReactRuntime.useRef(markdown);
  sourceMarkdownRef.current = markdown;
  let animationFrameRef = DesignSystemReactRuntime.useRef<number | null>(null);
  DesignSystemReactRuntime.useEffect(
    () => (): void => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [],
  );
  DesignSystemReactRuntime.useEffect((): void => {
    if (isComposingRef.current) {
      return;
    }
    if (markdown !== markdownRef.current) {
      markdownRef.current = markdown;
      lastSerializedRef.current = null;
      setSerializationVersion((version: number) => version + 1);
    }
  }, [markdown]);
  let memo = DesignSystemReactRuntime.useMemo(
      () => parseMarkdownBlocks(markdownRef.current),
      [serializationVersion],
    ),
    isReadOnly = readOnly
      ? undefined
      : {
          links: "edit",
          literalUnsafeLinks: true,
        },
    ref8 = DesignSystemReactRuntime.useRef(
      new Map<Node, MarkdownSource>(),
    ),
    contentRef = DesignSystemReactRuntime.useRef<HTMLDivElement | null>(
      null,
    ),
    mutationObserverRef = DesignSystemReactRuntime.useRef<MutationObserver | null>(
      null,
    );
  DesignSystemReactRuntime.useLayoutEffect(() => {
    let current = ref.current;
    if (current === null || typeof MutationObserver !== "function") {
      ref8.current = new Map();
      return;
    }
    if (contentRef.current !== current) {
      contentRef.current = current;
      ref8.current = new Map();
      let children = Array.from(current.children);
      if (children.length === memo.sources.length) {
        children.forEach((child: Element, index: number): void => {
          let source = memo.sources[index];
          if (source !== undefined) {
            ref8.current.set(child, {
              at: index,
              ...source,
            });
          }
        });
      }
    }
    if (readOnly) {
      return;
    }
    let previousNodes = ref8.current,
      observer = new MutationObserver((mutations: MutationRecord[]) =>
        removeMarkdownModelNodes(current, previousNodes, mutations),
      );
    observer.observe(current, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    mutationObserverRef.current = observer;
    return (): void => {
      observer.disconnect();
      mutationObserverRef.current = null;
    };
  }, [memo, readOnly]);
  let callback = (): void => {
      isFocused(false);
      commitQueueRef.current?.flush();
      onDone?.();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame((): void => {
        animationFrameRef.current = null;
        let current = ref.current;
        if (
          current !== null &&
          current.ownerDocument.hasFocus() &&
          current.contains(current.ownerDocument.activeElement)
        ) {
          return;
        }
        isComposingRef.current = false;
        markdownRef.current = sourceMarkdownRef.current;
        lastSerializedRef.current = null;
        setSerializationVersion((version: number) => version + 1);
      });
    },
    commitQueueRef = DesignSystemReactRuntime.useRef<
      import("../contracts").MarkdownCommitQueue<string> | null
    >(null);
  if (commitQueueRef.current === null) {
    commitQueueRef.current = createMarkdownCommitQueue(
      MARKDOWN_COMMIT_DELAY_MS,
      MARKDOWN_COMMIT_MAX_DELAY_MS,
    );
  }
  DesignSystemReactRuntime.useLayoutEffect(
    () => () => commitQueueRef.current?.dispose(),
    [],
  );
  let readOnlyRef = DesignSystemReactRuntime.useRef(readOnly);
  DesignSystemReactRuntime.useLayoutEffect((): void => {
    if (readOnlyRef.current === readOnly) {
      return;
    }
    readOnlyRef.current = readOnly;
    commitQueueRef.current?.flush();
    if (isComposingRef.current) {
      isComposingRef.current = false;
      isFocused(false);
      onDone?.();
    }
    setSerializationVersion((version: number) => version + 1);
  }, [readOnly]);
  let commitMarkdown = (): void => {
      if (readOnly || ref.current === null) {
        return;
      }
      if (mutationObserverRef.current !== null) {
        removeMarkdownModelNodes(
          ref.current,
          ref8.current,
          mutationObserverRef.current.takeRecords(),
        );
      }
      let serializedMarkdown = serializeMarkdownEditor(ref.current, (element: Element) =>
        ref8.current.get(element),
      );
      lastSerializedRef.current = serializedMarkdown;
      markdownRef.current = serializedMarkdown;
      if (onMarkdown !== undefined) {
        commitQueueRef.current?.push(serializedMarkdown, onMarkdown);
      }
    },
    isEmpty: boolean = markdownRef.current.trim() === "";
  return (
    <jsxEditableMarkdown.Fragment>
      {[(() => {
          const _Element = "div";
          const _elementProps = {
            ref: ref,
            className:
              "ds-readme" +
              (readOnly ? "" : " ds-readme-editable") +
              (value ? " ds-readme-editing" : ""),
            "data-testid": testId ?? "ds-readme-rendered",
            contentEditable: !readOnly,
            suppressContentEditableWarning: true,
            role: readOnly ? undefined : "textbox",
            "aria-multiline": readOnly ? undefined : true,
            "aria-label": label ?? "README",
            "data-placeholder": isEmpty ? placeholder : undefined,
            onFocus: (): void => {
              isComposingRef.current = true;
              isFocused(true);
            },
            onPaste: (event: React.ClipboardEvent<HTMLDivElement>): void => {
              if (readOnly) {
                return;
              }
              event.preventDefault();
              let pastedText = event.clipboardData.getData("text/plain");
              if (pastedText !== "") {
                document.execCommand("insertText", false, pastedText);
              }
            },
            onDrop: (event: React.DragEvent<HTMLDivElement>): void => {
              event.preventDefault();
            },
            onClick: (event: React.MouseEvent<HTMLDivElement>): void => {
              if (readOnly || !(event.metaKey || event.ctrlKey)) {
                return;
              }
              let ancestor = (event.target as Element).closest(
                "a[data-href]",
              );
              if (
                ancestor === null ||
                !event.currentTarget.contains(ancestor)
              ) {
                return;
              }
              event.preventDefault();
              openExternalLink(
                linkUrlFromElement(ancestor),
              );
            },
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>): void => {
              if (event.defaultPrevented) {
                return;
              }
              if (
                event.key === "Escape" &&
                anyMenuOrPopoverOpen(
                  event.currentTarget.ownerDocument,
                )
              ) {
                return;
              }
              let selection = ref.current?.ownerDocument.getSelection();
              if (
                event.key === "Enter" &&
                (event.metaKey || event.ctrlKey) &&
                !event.nativeEvent.isComposing &&
                selection != null &&
                selection.rangeCount > 0
              ) {
                let startContainer = selection.getRangeAt(0).startContainer,
                  linkElement =
                    (startContainer.nodeType === ELEMENT_NODE_TYPE
                      ? (startContainer as Element)
                      : startContainer.parentElement
                    )?.closest("a[data-href]") ?? null;
                if (
                  linkElement !== null &&
                  event.currentTarget.contains(linkElement)
                ) {
                  event.preventDefault();
                  openExternalLink(
                    linkUrlFromElement(linkElement),
                  );
                  return;
                }
              }
              if (
                event.key === "Escape" &&
                (selection == null || selection.isCollapsed)
              ) {
                event.preventDefault();
                event.stopPropagation();
                let focusElement =
                  ref.current
                    ?.closest(".ds-tokrow, tr")
                    ?.querySelector<HTMLElement>(
                      RENAME_BUTTON_SELECTOR,
                    ) ??
                  ref.current
                    ?.closest(".ds-postit")
                    ?.querySelector<HTMLElement>("[data-note-close]") ??
                  null;
                if (focusElement !== null) {
                  focusElement.focus();
                } else {
                  (
                    ref.current?.ownerDocument
                      .activeElement as HTMLElement | null
                  )?.blur();
                }
                return;
              }
              if (selection == null || selection.isCollapsed) {
                return;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                selection.collapseToEnd();
                return;
              }
              let inputElement =
                  (event.key === "Tab" && !event.shiftKey) ||
                  (event.key === "F10" && event.altKey),
                selectionTarget =
                  editorRef.current?.querySelector<HTMLElement>(
                    "button:not(:disabled), input",
                  ) ??
                  editorRef.current?.querySelector<HTMLElement>(
                    TOOLBAR_FOCUSABLE_SELECTOR,
                  );
              if (!inputElement || selectionTarget === null || selectionTarget === undefined) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              selectionTarget.focus();
            },
            onInput: (event: React.InputEvent<HTMLDivElement>): void => {
              if (readOnly || ref.current === null) {
                return;
              }
              if (/^history/.test(event.nativeEvent.inputType ?? "")) {
                prepareEditableLinks(ref.current);
              }
              autoformatMarkdownBlock(
                ref.current,
                event.nativeEvent,
                serializeMarkdownEditor,
              );
              commitMarkdown();
            },
            onBlur: (event: React.FocusEvent<HTMLDivElement>): void => {
              let relatedTarget = event.relatedTarget ?? null;
              if (
                relatedTarget !== null &&
                (ref.current?.contains(relatedTarget) ||
                  editorRef.current?.contains(relatedTarget) ||
                  (relatedTarget instanceof Element &&
                    relatedTarget.closest(
                      "[" + README_TOOLBAR_MENU_ATTRIBUTE + "]",
                    ) !== null))
              ) {
                return;
              }
              callback();
            },
            children: memo.blocks.map(
              (
                block: import("../contracts").MarkdownBlock,
                index: number,
              ) => renderMarkdownBlock(block, index, isReadOnly),
            ),
          };
          const _elementKey = serializationVersion;
          return <_Element key={_elementKey} {..._elementProps} />;
        })(), readOnly ? null : (
          <p
            className={
              "ds-readme-hint not-prose mt-sm min-h-4 text-caption text-muted transition-opacity duration-base " +
              (value ? "opacity-100" : "opacity-0")
            }
            aria-hidden={!value}
          >
            {uiMessage("design-system.markdownEditor.markdownShortcutsSelectTextToFormat")}
          </p>
        ), readOnly || !value ? null : (
          <jsxEditableMarkdown.Fragment>
            {[<MarkdownFormattingToolbar
                root={ref}
                hold={editorRef}
                onApplied={commitMarkdown}
                onLeave={callback}
                className={stripClassName}
              />, <MarkdownLinkPopover
                root={ref}
                className={stripClassName}
              />]}
          </jsxEditableMarkdown.Fragment>
        )]}
    </jsxEditableMarkdown.Fragment>
  );
}
export {
  appendSerializedMarkdownInline,
  EDITABLE_MARKDOWN_IMAGE_DATA_URL_PATTERN,
  ELEMENT_NODE_TYPE,
  escapeMarkdownTableCell,
  jsxEditableMarkdown,
  MARKDOWN_COMMIT_DELAY_MS,
  MARKDOWN_COMMIT_MAX_DELAY_MS,
  MarkdownEditor,
  removeMarkdownModelNodes,
  serializeMarkdownEditor,
  serializeMarkdownInlineNode,
  serializeMarkdownInlineNodes,
  TEXT_NODE_TYPE,
  trailingBacktickCount,
};
export function installEditorMarkdownEditor(): () => void {
  return () => {
    jsxEditableMarkdown = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    MARKDOWN_COMMIT_DELAY_MS = 150;
    MARKDOWN_COMMIT_MAX_DELAY_MS = 1000;
    EDITABLE_MARKDOWN_IMAGE_DATA_URL_PATTERN =
      /^data:image\/(png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+/=]+$/;
    TEXT_NODE_TYPE = 3;
    ELEMENT_NODE_TYPE = 1;
    trailingBacktickCount = (text: string): number => {
      let index: number = 0;
      while (
        index < text.length &&
        text.charCodeAt(text.length - 1 - index) === 96
      ) {
        index++;
      }
      return index;
    };
    serializeMarkdownInlineNodes = (nodes: readonly Node[]) => {
      let state = {
        s: "",
        ticks: 0,
      };
      for (let value of nodes) {
        appendSerializedMarkdownInline(
          state,
          serializeMarkdownInlineNode(value, state.ticks),
        );
      }
      return state.s;
    };
  };
}

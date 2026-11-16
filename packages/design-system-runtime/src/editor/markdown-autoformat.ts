import type {
  MarkdownAutoformatState,
  MarkdownShortcutBlock,
} from "../contracts/documentation";

/** 行首输入这些前缀加空格后，转成对应的块 */
export const MARKDOWN_BLOCK_SHORTCUTS: [string, MarkdownShortcutBlock][] = [
  ["# ", "h1"],
  ["## ", "h2"],
  ["### ", "h3"],
  ["- ", "ul"],
  ["* ", "ul"],
  ["1. ", "ol"],
  ["> ", "quote"],
];
/** 记录每个编辑区刚发生的自动转换，用于撤销与重做时还原中间态 */
export const markdownAutoformatCache = new WeakMap<
  HTMLElement,
  MarkdownAutoformatState
>();
/** 正在回放撤销或重做时为 true，避免递归触发自动转换 */
export let markdownAutoformatExecuting = false;

/** 行首文字是否构成块快捷键；trimIndent 时额外接受缩进、"• " 与 "1. " 到 "999. " */
export function noteAutoformatShortcut(
  text: string,
  trimIndent = false,
): MarkdownShortcutBlock | null {
  let prefix = text.replace(/\u00a0/g, " ");
  if (trimIndent) {
    prefix = prefix.replace(/^ +/, "");
    if (prefix === "• ") {
      return "ul";
    }
    if (/^\d{1,3}\. $/.test(prefix)) {
      return "ol";
    }
  }
  for (const [shortcut, block] of MARKDOWN_BLOCK_SHORTCUTS) {
    if (prefix === shortcut) {
      return block;
    }
  }
  return null;
}

export function executeMarkdownBlockFormat(
  document: Document,
  blockType: MarkdownShortcutBlock,
): void {
  document.execCommand("styleWithCSS", false, "false");
  if (blockType === "ul") {
    document.execCommand("insertUnorderedList");
  } else if (blockType === "ol") {
    document.execCommand("insertOrderedList");
  } else if (blockType === "quote") {
    document.execCommand("formatBlock", false, "BLOCKQUOTE");
  } else {
    document.execCommand("formatBlock", false, blockType.toUpperCase());
  }
}

/**
 * 输入空格（含不换行空格）后，把行首快捷键转成块；转换成功返回 true。
 * 撤销与重做紧跟在转换之后时，先回放一次撤销或重做，让用户依次看到快捷键原文。
 */
export function autoformatMarkdownBlock(
  root: HTMLElement,
  event: Pick<InputEvent, "inputType" | "data">,
  serializeRoot: (root: HTMLElement) => string,
  allowedBlocks?: readonly MarkdownShortcutBlock[],
  extendedShortcuts = false,
): boolean {
  if (markdownAutoformatExecuting) {
    return false;
  }
  const document = root.ownerDocument;
  const cachedState = markdownAutoformatCache.get(root);
  markdownAutoformatCache.delete(root);
  if (
    event.inputType === "historyUndo" ||
    event.inputType === "historyRedo"
  ) {
    if (cachedState === undefined) {
      return false;
    }
    const isUndo = event.inputType === "historyUndo";
    if (!(isUndo ? cachedState.undoArmed : cachedState.redoArmed)) {
      return false;
    }
    if (serializeRoot(root) !== cachedState.intermediate) {
      return false;
    }
    markdownAutoformatExecuting = true;
    try {
      document.execCommand(isUndo ? "undo" : "redo");
    } finally {
      markdownAutoformatExecuting = false;
    }
    markdownAutoformatCache.set(root, {
      ...cachedState,
      undoArmed: !isUndo,
      redoArmed: isUndo,
    });
    return false;
  }
  if (
    event.inputType !== "insertText" ||
    (event.data !== " " && event.data !== "\u00a0")
  ) {
    return false;
  }
  const selection = document.getSelection();
  if (
    selection === null ||
    selection.rangeCount === 0 ||
    !selection.isCollapsed
  ) {
    return false;
  }
  const selectionRange = selection.getRangeAt(0);
  if (!root.contains(selectionRange.startContainer)) {
    return false;
  }
  // 向上找所在段落；位于列表、标题、引用、代码、表格或链接内时不转换
  let paragraph: Element = root;
  let ancestor: Element | null =
    selectionRange.startContainer.nodeType === 3
      ? selectionRange.startContainer.parentElement
      : (selectionRange.startContainer as Element);
  for (
    ;
    ancestor !== null && ancestor !== root;
    ancestor = ancestor.parentElement
  ) {
    if (
      /^(LI|UL|OL|H[1-6]|BLOCKQUOTE|PRE|TABLE|CODE|A)$/.test(ancestor.tagName)
    ) {
      return false;
    }
    if (
      paragraph === root &&
      (ancestor.tagName === "DIV" || ancestor.tagName === "P")
    ) {
      paragraph = ancestor;
    }
  }
  const prefixRange = document.createRange();
  prefixRange.selectNodeContents(paragraph);
  prefixRange.setEnd(
    selectionRange.startContainer,
    selectionRange.startOffset,
  );
  if (
    prefixRange.cloneContents().querySelector('[contenteditable="false"]')
  ) {
    return false;
  }
  const shortcutBlock = noteAutoformatShortcut(
    prefixRange.toString(),
    extendedShortcuts,
  );
  if (
    shortcutBlock === null ||
    (allowedBlocks !== undefined && !allowedBlocks.includes(shortcutBlock))
  ) {
    return false;
  }
  const orderedListStart =
    extendedShortcuts && shortcutBlock === "ol"
      ? Number.parseInt(prefixRange.toString().trim(), 10)
      : 1;
  selection.removeAllRanges();
  selection.addRange(prefixRange);
  document.execCommand("delete");
  const intermediate = serializeRoot(root);
  executeMarkdownBlockFormat(document, shortcutBlock);
  if (orderedListStart > 1) {
    const anchor = document.getSelection()?.anchorNode ?? null;
    const list = (
      anchor?.nodeType === 1 ? (anchor as Element) : anchor?.parentElement
    )?.closest("li")?.parentElement;
    if (list?.tagName === "OL" && list.childElementCount === 1) {
      list.setAttribute("start", String(orderedListStart));
    }
  }
  markdownAutoformatCache.set(root, {
    intermediate,
    undoArmed: true,
    redoArmed: false,
  });
  return true;
}

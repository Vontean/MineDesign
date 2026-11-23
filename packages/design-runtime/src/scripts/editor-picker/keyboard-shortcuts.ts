type ShortcutMessage =
  | { type: "clipboardKey"; key: string; shift?: boolean; typing?: boolean }
  | { type: "deleteSelection" };

interface ShortcutOptions {
  editingText: boolean;
  gestureInProgress: boolean;
  penOverlayOpen: boolean;
  penPathPreview: boolean;
  readOnly: boolean;
  commentsEnabled: boolean;
  hasSelection: boolean;
  hasRenderedSelection(): boolean;
  openSelectionMenu(): void;
  prepareCopyOrCut(): void;
  schedulePasteFallback(): void;
  emit(message: ShortcutMessage): void;
}

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return !!element && (
    element.tagName === "INPUT" || element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" || element.isContentEditable
  );
}

export function consumeKey(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function handlePickerHostShortcut(event: KeyboardEvent, options: ShortcutOptions) {
  const { key, target, metaKey, ctrlKey, altKey, shiftKey, repeat } = event;
  const letter = (key || "").toLowerCase();
  const command = metaKey || ctrlKey;
  const typing = isTypingTarget(target);
  const canActOnSelection = !options.editingText && !options.gestureInProgress && !options.penOverlayOpen;
  const sendKey = (key: string, details?: { shift?: boolean; typing?: boolean }) =>
    options.emit({ type: "clipboardKey", key, ...details });

  if (command && !altKey && !shiftKey && (key === "\\" || event.code === "Backslash")) {
    consumeKey(event);
    const source = event.composedPath?.()[0] || target;
    if (!repeat) sendKey("\\", { typing: options.editingText || isTypingTarget(source) });
    return true;
  }
  if (key === "F6" && !altKey) {
    consumeKey(event);
    if (!repeat) sendKey("F6", { shift: shiftKey });
    return true;
  }
  if (command && !altKey && !options.editingText && ["0", "=", "+", "-"].includes(key)) {
    if (!typing) {
      consumeKey(event);
      sendKey(key === "0" || key === "-" ? key : "+");
    }
    return true;
  }
  if (letter === "c" && options.commentsEnabled && !command && !altKey && !shiftKey &&
      !event.isComposing && !event.defaultPrevented && canActOnSelection) {
    if (!typing) {
      consumeKey(event);
      if (!repeat) sendKey("comment");
    }
    return true;
  }
  if ((key === "ContextMenu" || (key === "F10" && shiftKey)) &&
      !command && !altKey && canActOnSelection && !options.penPathPreview) {
    if (!typing && options.hasSelection) {
      consumeKey(event);
      if (!repeat) options.openSelectionMenu();
    }
    return true;
  }
  if (options.readOnly) {
    if (command && !altKey && !shiftKey && letter === "c" && options.hasSelection && !typing) {
      event.stopPropagation();
      if (!repeat) {
        options.prepareCopyOrCut();
        sendKey("c");
      }
    }
    return true;
  }
  if (letter === "a" && shiftKey && !altKey && canActOnSelection) {
    if (!typing && options.hasSelection) {
      consumeKey(event);
      sendKey("a", { shift: true });
    }
    return true;
  }
  if ((letter === "h" || letter === "v") && shiftKey && !command && !altKey &&
      canActOnSelection && !options.penPathPreview) {
    if (!typing && options.hasSelection) {
      consumeKey(event);
      if (!repeat) sendKey(letter === "h" ? "flip-horizontal" : "flip-vertical");
    }
    return true;
  }
  if (letter === "g" && shiftKey && !command && !altKey && !options.editingText) {
    if (!typing) {
      consumeKey(event);
      if (!repeat) sendKey("guides");
    }
    return true;
  }
  if ((key === "Delete" || key === "Backspace") && !command &&
      canActOnSelection && options.hasSelection) {
    if (!typing && options.hasRenderedSelection()) {
      consumeKey(event);
      options.emit({ type: "deleteSelection" });
    }
    return true;
  }

  if (!command || altKey || options.editingText || options.gestureInProgress ||
      (options.penOverlayOpen && letter !== "z")) return false;
  if (letter === "z" || letter === "g") {
    if (!typing && (letter === "z" || options.hasSelection)) {
      consumeKey(event);
      if (letter === "z" || !repeat) sendKey(letter, { shift: !!shiftKey });
    }
    return true;
  }
  if (shiftKey) {
    if (letter === "v" && !typing) event.preventDefault();
    return true;
  }
  if (letter === "a") {
    if (!typing && options.hasSelection) {
      consumeKey(event);
      sendKey("a");
    }
    return true;
  }
  if (!["c", "x", "v", "d"].includes(letter)) return false;
  if (typing) return true;
  if (letter !== "v" && !options.hasSelection) {
    if (letter === "d") event.preventDefault();
    return true;
  }
  event.stopPropagation();
  if (letter === "v") {
    options.schedulePasteFallback();
    return true;
  }
  if (letter === "d") {
    event.preventDefault();
  } else {
    if (repeat) return true;
    options.prepareCopyOrCut();
  }
  sendKey(letter);
  return true;
}

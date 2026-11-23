const verticalPadding = [
  "marginTop", "marginBottom", "paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth",
] as const;

export function createEditorBackdrop(editorStylesheet: HTMLStyleElement, isEnabled: () => boolean) {
  let authoredStyles: string | null = null;
  let refreshQueued = false;
  let observer: MutationObserver | null = null;

  function authoredStylesheetText() {
    let text = "";
    for (const style of document.head?.querySelectorAll("style") ?? []) {
      if (style !== editorStylesheet) text += style.textContent + " ";
    }
    return text;
  }

  function readBackground() {
    const { body, documentElement } = document;
    const shouldCapture = isEnabled() && !body.hasAttribute("data-dc-capturing");
    if (shouldCapture) body.setAttribute("data-dc-capturing", "");
    try {
      for (const element of [body, documentElement]) {
        const { background, backgroundColor, backgroundImage } = getComputedStyle(element);
        if ((backgroundColor && backgroundColor !== "transparent" && backgroundColor !== "rgba(0, 0, 0, 0)") ||
            (backgroundImage && backgroundImage !== "none")) {
          const paint = background || (backgroundImage !== "none" ? backgroundImage + " " : "") + (backgroundColor || "");
          if (paint) return paint;
        }
      }
      return "";
    } finally {
      if (shouldCapture) body.removeAttribute("data-dc-capturing");
    }
  }

  function refresh() {
    try {
      authoredStyles = authoredStylesheetText();
      const background = readBackground();
      const variables = document.documentElement.style;
      if (background) variables.setProperty("--dc-editor-host-bg", background);
      else variables.removeProperty("--dc-editor-host-bg");
      const bodyStyle = getComputedStyle(document.body);
      let padding = 0;
      for (const property of verticalPadding) padding += parseFloat(bodyStyle[property]) || 0;
      variables.setProperty("--dc-editor-host-vpad", padding + "px");
    } catch {}
  }

  function connect() {
    observer = new MutationObserver(() => {
      if (refreshQueued) return;
      refreshQueued = true;
      requestAnimationFrame(() => {
        refreshQueued = false;
        if (isEnabled() && authoredStylesheetText() !== authoredStyles) refresh();
      });
    });
    if (document.head) observer.observe(document.head, { subtree: true, childList: true, characterData: true });
  }

  function disconnect() {
    observer?.disconnect();
    observer = null;
  }

  return { refresh, connect, disconnect };
}

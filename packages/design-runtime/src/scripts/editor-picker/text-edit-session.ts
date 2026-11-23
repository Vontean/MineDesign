import { componentScopeName, nearestComponentName } from "./element-query";
import { cloneEditableNodes, createTextEditCopy, originalTextMarkup, restoreTextNodes } from "./text-edit-copy";
import { caretNodeAtPointer, isVisibleTextNode, restoreDescendantAccessibility, selectTextRange } from "./text-edit-dom";
import { plainTextFromDom, rebaseScriptTarget, resolveTextSeed } from "./text-edit-targets";
import { createTextEditView, editedTemplateId } from "./text-edit-view";
import { matchTemplateTextNode, normalizeTextMarkup } from "./text-markup";
import { createSvgTextEditorController } from "./svg-text-editor";
import type { Dynamic } from "../../runtime-types";

interface TextEditOptions {
  readOnly(): boolean;
  canEditText(id: number, name: string | null): boolean;
  textSeed(id: number, name: string | null): Dynamic;
  scriptTargets(id: number, name: string | null): Dynamic;
  scriptValues(): Dynamic;
  tokenValues(): Record<string, unknown>;
  findTemplateInstances(id: Dynamic, name: string | null): Element[];
  elementViewportScale(element: Element): number;
  overlayRoot(): HTMLElement;
  chromePixels(size: number): number;
  chromeStroke: string;
  emit(event: Dynamic): void;
  updateTouchPolicy(): void;
  clearHover(): void;
  resetLinkEdit(): void;
  onDetachedImportedEdit(): void;
}

export function createTextEditSession(options: TextEditOptions) {
  let current: Dynamic = null;
  const svg = createSvgTextEditorController({
    readSession: () => current,
    finishDetachedEdit: finishDetachedSvgEdit,
    overlayRoot: options.overlayRoot,
    chromePixels: options.chromePixels,
    chromeStroke: options.chromeStroke,
  });
  const view = createTextEditView({
    readSession: () => current,
    svg,
    finishDetachedSvgEdit,
    emit: options.emit,
    updateTouchPolicy: options.updateTouchPolicy,
  });
  const copy = createTextEditCopy({
    readSession: () => current,
    findTemplateInstances: options.findTemplateInstances,
  });

  function beginTemplate(element: Element, caret?: "end" | "all") {
    if (options.readOnly()) return;
    const earlierCopy = copy.current;
    const id = parseInt(element.getAttribute("data-dc-tpl")!, 10);
    const name = nearestComponentName(element);
    const editable = options.canEditText(id, name);
    const previous = current ? finish(undefined, editable) : null;
    if (!editable) return;

    const seed = options.textSeed(id, name);
    const { text, scriptTarget, propTarget, reopen, useSeedMarkup } = resolveTextSeed(
      element, seed, options.scriptValues(), options.tokenValues(), previous,
    );
    options.clearHover();
    const visible = Array.from(element.childNodes);
    const copyWasReplaced = copy.current !== earlierCopy;
    const original = copy.takeOriginalNodes(element, visible);
    current = { el: element, tid: id, name, scriptTarget, propTarget, reopen, origNodes: original };
    if (scriptTarget || propTarget) {
      element.textContent = text;
    } else if (useSeedMarkup) {
      element.innerHTML = seed;
    } else {
      cloneEditableNodes(element, visible);
    }
    current.startHtml = scriptTarget || propTarget || useSeedMarkup || copyWasReplaced
      ? element.innerHTML : originalTextMarkup(element, original, visible);
    const editor = element instanceof SVGElement ? svg.attach(element) : element as HTMLElement;
    view.attach(editor);
    selectTextRange(editor, caret);
    view.emitState(true);
    if (current.svg) svg.positionSvgTextEditor();
  }

  function finishDetachedImportedEdit(session: Dynamic) {
    if (current !== session || session.el.isConnected) return;
    session.lost = true;
    options.onDetachedImportedEdit();
    finish();
  }

  function beginImported(element: Element, id: number, pointer: MouseEvent) {
    if (current) finish();
    const name = nearestComponentName(element);
    const targets = options.scriptTargets(id, name);
    if (!targets || options.findTemplateInstances(id, componentScopeName(element)).length !== 1) return false;
    const caret = caretNodeAtPointer(document, pointer);
    const match = matchTemplateTextNode(element, targets, caret);
    if (!match || !isVisibleTextNode(match.node, element, match.node === caret, options.elementViewportScale)) return false;

    options.clearHover();
    const field = document.createElement("dc-edit-field");
    field.textContent = (match.node.nodeValue || "").replace(/[ \t\n\r\f]+/g, " ");
    field.style.cssText = "user-select:text!important;-webkit-user-select:text!important;";
    const session: Dynamic = {
      el: field, tid: id, name, mount: element, importNode: match.node,
      importText: match.node.nodeValue, importTarget: { key: match.key, words: match.words },
      startText: field.textContent,
    };
    current = session;
    match.node.parentNode.insertBefore(field, match.node.nextSibling);
    match.node.nodeValue = "";
    session.watch = new MutationObserver(() => {
      if (current !== session) session.watch.disconnect();
      else if (!field.isConnected) finishDetachedImportedEdit(session);
    });
    session.watch.observe(document.documentElement, { childList: true, subtree: true });
    view.attach(field, true);
    selectTextRange(field);
    view.emitState(true);
    return true;
  }

  function detach(keepOptimisticPreview?: boolean) {
    if (!current) return null;
    options.resetLinkEdit();
    const session = current;
    current = null;
    view.emitState(false);
    view.release(session);

    const importedText = (session.importTarget && session.el.textContent) || "";
    const importedIsConnected = !!session.importTarget && session.mount.isConnected && session.el.isConnected;
    session.el.blur();
    if (session.importTarget) {
      view.releaseImported();
      session.watch.disconnect();
      if (session.el.parentNode) session.el.parentNode.removeChild(session.el);
      if (session.importNode.nodeValue === "") session.importNode.nodeValue = session.importText;
      if (!importedIsConnected || !importedText.trim() || importedText === session.startText) return null;
      return {
        tid: editedTemplateId(session), name: session.name, html: "", text: importedText,
        importTarget: session.importTarget,
      };
    }

    if (session.svg) svg.detach(session);
    restoreDescendantAccessibility(session.el);
    let html = session.el.innerHTML;
    const text = session.scriptTarget || session.propTarget ? plainTextFromDom(session.el)
      : session.svg ? session.el.textContent : session.el.innerText;
    if (session.svg && (text === session.startText || !text.trim() || !session.svg.isConnected)) {
      html = session.startHtml;
    }
    if (session.foreign) {
      return html === session.startHtml ? null
        : { foreign: true, tag: session.tag, before: session.startText, after: text };
    }
    if (session.reopen) {
      session.scriptTarget = rebaseScriptTarget(session.scriptTarget, session.reopen, options.scriptValues());
    }

    const keepPreview = keepOptimisticPreview !== false && !session.scriptTarget && !session.propTarget &&
      !!(window as Dynamic).__dcContentKeyed &&
      normalizeTextMarkup(html) !== normalizeTextMarkup(session.startHtml);
    if (!keepPreview) restoreTextNodes(session.el, session.origNodes);
    if (html === session.startHtml) return null;

    const stamped = parseInt(session.el.getAttribute("data-dc-tpl"), 10);
    const tid = Number.isNaN(stamped) ? session.tid : stamped;
    if (keepPreview) copy.hold(session.el, session.origNodes, session.name, tid);
    return {
      tid, name: session.name, html, text,
      scriptTarget: session.scriptTarget || undefined,
      propTarget: session.propTarget || undefined,
    };
  }

  function finish(keepOptimisticPreview?: boolean, restarted?: boolean): Dynamic {
    if (!current) return;
    const lost = current.lost === true;
    const result: Dynamic = detach(keepOptimisticPreview);
    if (result?.foreign) {
      options.emit({ type: "foreignTextEdit", tag: result.tag, before: result.before, after: result.after });
    } else if (result) {
      options.emit({
        type: "textEdit", tid: result.tid, name: result.name, html: result.html, text: result.text,
        scriptTarget: result.scriptTarget || undefined,
        propTarget: result.propTarget || undefined,
        importTarget: result.importTarget || undefined,
        restarted: restarted || undefined,
      });
    } else {
      options.emit({ type: "textEditEnd", lost: lost || undefined, restarted: restarted || undefined });
    }
    return result;
  }

  function finishDetachedSvgEdit() {
    if (!current?.svg || current.svg.isConnected) return false;
    finish(false);
    return true;
  }

  function discardInside(element: Element) {
    if (!current || (current.el !== element && !element.contains(current.el))) return;
    options.resetLinkEdit();
    view.release(current);
    current.el.innerHTML = current.startHtml;
    current = null;
    view.emitState(false);
  }

  return {
    beginTemplate, beginImported, finishDetachedImportedEdit, finishDetachedSvgEdit,
    detach, finish, discardInside, focus: view.focus, emitState: view.emitState,
    afterPush: copy.afterPush, dropLeftCopy: copy.drop, restoreScroll: copy.restoreScroll,
    svg,
    get current() { return current; },
    get templateId() { return editedTemplateId(current); },
  };
}

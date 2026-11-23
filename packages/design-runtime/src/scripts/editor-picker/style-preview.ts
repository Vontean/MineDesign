import type { Dynamic } from "../../runtime-types";

interface StylePreviewOptions {
  overlayRoot(): HTMLElement;
  findTemplateInstances(id: string, component: string): Element[];
  isRootComponent(component: string): boolean;
  refreshChrome(): void;
  reapplyActiveGestures(): void;
  emit(event: Dynamic): void;
}

type StyleValues = Record<string, unknown>;

interface HeldStyle {
  component: string;
  ids: number[];
  declarations: StyleValues;
  token: unknown;
}

const patchAttribute = "data-dc-editor-patch";
const cropProperties = ["object-fit", "object-position", "object-view-box"] as const;

export function createStylePreview(options: StylePreviewOptions) {
  let sheet: CSSStyleSheet | null = null;
  let nextRuleId = 0;
  const patches = new Map<string, { id: string; style: CSSStyleDeclaration }>();
  let awaitingReapply = false;
  let scrubbing = false;
  let held: HeldStyle | null = null;
  let eventQueued = false;
  let pending = new Map<string, Dynamic>();

  function patch(key: string, elements: Element[], declarations: StyleValues) {
    if (!elements.length) return;
    let rule = patches.get(key);
    if (!rule) {
      if (!sheet) {
        const style = document.createElement("style");
        style.setAttribute("data-dc-editor-overlay", "");
        options.overlayRoot().appendChild(style);
        sheet = style.sheet;
      }
      const id = "p" + ++nextRuleId;
      const index = sheet!.insertRule(`[${patchAttribute}="${id}"]{}`, sheet!.cssRules.length);
      rule = { id, style: (sheet!.cssRules[index] as CSSStyleRule).style };
      patches.set(key, rule);
    }
    for (const element of elements) {
      if (element.getAttribute(patchAttribute) !== rule.id) element.setAttribute(patchAttribute, rule.id);
    }
    for (const property in declarations) {
      const value = declarations[property];
      rule.style.setProperty(property, value == null ? "" : String(value), "important");
    }
  }

  function clearPatches() {
    awaitingReapply = false;
    if (!nextRuleId) return;
    nextRuleId = 0;
    patches.clear();
    if (sheet) while (sheet.cssRules.length) sheet.deleteRule(0);
    for (const element of document.querySelectorAll(`[${patchAttribute}]`)) element.removeAttribute(patchAttribute);
  }

  function applyHeld() {
    if (!held) return;
    const { component, ids, declarations } = held;
    for (const id of ids) patch(`${component}|${id}`, options.findTemplateInstances(String(id), component), declarations);
  }

  function reapply() {
    clearPatches();
    options.reapplyActiveGestures();
    if (scrubbing) applyHeld();
  }

  function afterPush() {
    if (!nextRuleId) return;
    awaitingReapply = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (awaitingReapply) reapply();
      });
    });
  }

  function onContentMutation(records?: readonly { type?: string; attributeName?: string | null }[]) {
    if (awaitingReapply && records?.some((item) => item.type && item.attributeName !== patchAttribute)) reapply();
  }

  function queue(event: Dynamic) {
    pending.set(String(event.name) + "|" + event.tid, event);
    if (eventQueued) return;
    eventQueued = true;
    requestAnimationFrame(() => {
      eventQueued = false;
      const events = pending;
      pending = new Map();
      for (const value of events.values()) options.emit(value);
    });
  }

  function patchStyle(component: string, ids: number[], declarations?: StyleValues, token?: unknown) {
    if (!declarations || typeof declarations !== "object" || !Array.isArray(ids) || !options.isRootComponent(component)) return;
    const previous = held && held.component === component && held.ids.join(",") === ids.join(",") ? held.declarations : {};
    held = { component, ids, declarations: Object.assign(previous, declarations), token: token || null };
    applyHeld();
    options.refreshChrome();
  }

  function holdStyle(component: string, ids: number[], declarations?: StyleValues, token?: unknown) {
    if (!declarations || typeof declarations !== "object" || !Array.isArray(ids) || !options.isRootComponent(component)) return;
    const crop: StyleValues = {};
    for (const property of cropProperties) {
      const value = declarations[property];
      if (typeof value === "string" && value.length < 120) crop[property] = value;
    }
    held = { component, ids, declarations: crop, token: token || null };
    for (const id of ids) {
      const current = patches.get(`${component}|${id}`);
      for (const element of options.findTemplateInstances(String(id), component)) {
        const active = element.getAttribute(patchAttribute);
        if (active && current?.id !== active && [...patches.values()].some((rule) => rule.id === active)) return;
      }
    }
    applyHeld();
    options.refreshChrome();
  }

  function unpatchStyle(component: string, ids: number[], token?: unknown) {
    if (!Array.isArray(ids) || (held && held.token !== token)) return;
    for (const id of ids) {
      const rule = patches.get(`${component}|${id}`);
      if (rule) rule.style.cssText = "";
    }
    held = null;
    options.refreshChrome();
  }

  function setScrubbing(value: unknown) {
    scrubbing = !!value;
    if (!scrubbing) held = null;
  }

  return {
    patch, clearPatches, queue, clearPending: () => { pending = new Map(); }, afterPush, onContentMutation,
    patchStyle, holdStyle, unpatchStyle, setScrubbing,
  };
}

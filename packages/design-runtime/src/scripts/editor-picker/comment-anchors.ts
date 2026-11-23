import { componentScopeName, normalizeSvgHit, type createElementQuery } from "./element-query";
import { visibleContentBounds, viewportBox } from "./element-bounds";
import { authoredAccessibilityAttribute } from "./text-edit-dom";

const editorChrome = "[data-dc-editor-overlay],[data-dc-editor-overlay-root],[data-omelette-chrome],[data-omelette-injected]";
const selectorId = /^[A-Za-z_][A-Za-z0-9_-]{0,31}$/;
const selectorTag = /^[a-z][a-z0-9-]{0,23}$/;
const skippedTextElements = /^(style|script|template)$/i;

function querySelector(selector: unknown) {
  try {
    return document.querySelector(String(selector));
  } catch {
    return null;
  }
}

function selectorForElement(element: Element) {
  let segments: string[] = [];
  let elements: Element[] = [];
  for (let current: Element | null = element;
    current?.nodeType === Node.ELEMENT_NODE && current !== document.body && current !== document.documentElement;
    current = current.parentElement) {
    const selector = "#" + current.id;
    if (selectorId.test(current.id) && querySelector(selector) === current) {
      segments.push(selector);
      elements.push(current);
      break;
    }
    const tag = current.tagName.toLowerCase();
    let position = 1;
    for (let sibling = current.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
      if (sibling.tagName === current.tagName) position++;
    }
    if (!selectorTag.test(tag) || position > 9999) {
      segments = [];
      elements = [];
    } else {
      segments.push(tag + ":nth-of-type(" + position + ")");
      elements.push(current);
    }
  }
  if (!segments.length) return null;
  const start = Math.max(0, segments.length - 8);
  return { path: segments.slice(start).reverse().join(" > "), element: elements[start] };
}

function accessibleLabel(element: Element) {
  const tag = (element.tagName || "").toLowerCase();
  let label = "";
  function appendText(node: Node) {
    if (label.length >= 160) return;
    if (node.nodeType === Node.TEXT_NODE) {
      label = (label + (node as Text).data).replace(/\s+/g, " ").trimStart();
    } else if (node.nodeType === Node.ELEMENT_NODE && !skippedTextElements.test((node as Element).tagName)) {
      for (const child of node.childNodes) appendText(child);
    }
  }
  try {
    if (tag === "img") {
      label = element.getAttribute("alt") || "";
    } else if (tag === "input" || tag === "textarea") {
      label = element.getAttribute("placeholder") || element.getAttribute("aria-label") || "";
    } else {
      label = authoredAccessibilityAttribute(element, "aria-label") || "";
    }
    if (!label) appendText(element);
  } catch {
    label = "";
  }
  return { tag, text: label.slice(0, 400).replace(/\s+/g, " ").trim().slice(0, 120) };
}

function textFingerprint(element: Element) {
  let text = "";
  function appendText(node: Node) {
    for (let child = node.firstChild; child && text.length < 4096; child = child.nextSibling) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += (child as Text).data;
      } else if (child.nodeType === Node.ELEMENT_NODE && !skippedTextElements.test((child as Element).tagName)) {
        appendText(child);
      }
    }
  }
  try {
    appendText(element);
  } catch {
    return "";
  }
  const normalized = text.slice(0, 4096)
    .replace(/[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g, " ")
    .replace(/^ | $/g, "");
  if (!normalized) return "";
  const input = (element.tagName || "").toLowerCase() + ":" + normalized;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return "x" + ("000000" + (hash >>> 0).toString(36)).slice(-7);
}

function pageBox() {
  return {
    x: -(window.scrollX || 0),
    y: -(window.scrollY || 0),
    w: Math.max(document.documentElement?.scrollWidth ?? 0, window.innerWidth || 0),
    h: Math.max(document.documentElement?.scrollHeight ?? 0, window.innerHeight || 0),
  };
}

function fraction(coordinate: number | null, start: number, size: number) {
  return coordinate == null || !(size > 0) ? 0.5 : Math.min(1, Math.max(0, (coordinate - start) / size));
}

function templateId(element: Element) {
  const id = parseInt(element.getAttribute("data-dc-tpl") || "-1", 10);
  return Number.isFinite(id) && id >= 0 ? id : null;
}

interface CommentReference {
  page?: boolean;
  path?: string;
  tid?: number | string | null;
  fp?: string;
}

type CommentElementQuery = Pick<ReturnType<typeof createElementQuery>, "findOuterComponentHost" | "findTemplateInstances">;

export function createCommentAnchors({ findOuterComponentHost, findTemplateInstances }: CommentElementQuery) {
  function forElement(target: Node | null, x: number | null, y: number | null) {
    let element = target?.nodeType === Node.ELEMENT_NODE ? target as Element : target?.parentElement ?? null;
    if (element?.closest(editorChrome)) element = null;
    if (element) element = normalizeSvgHit(element.closest("[data-dc-tpl]") || element);
    const selector = element ? selectorForElement(element) : null;
    if (!element || !selector) {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      return {
        path: null,
        rect: { x: 0, y: 0, w, h },
        page: pageBox(),
        fx: fraction(x, 0, w),
        fy: fraction(y, 0, h),
      };
    }

    const root = findOuterComponentHost()?.getAttribute("data-sc-name");
    const tid = root && componentScopeName(element) === root ? templateId(element) : null;
    const instances = tid !== null ? findTemplateInstances(String(tid), root) : [];
    const visibleElement = instances.length === 1 && !instances.includes(selector.element)
      ? instances[0] : selector.element;
    const stable = instances.length === 1 && instances[0] === element && querySelector(selector.path) === element;
    const rect = viewportBox(visibleContentBounds(visibleElement));
    return {
      path: selector.path,
      tid,
      fp: stable ? textFingerprint(element) : "",
      page: pageBox(),
      rect,
      fx: fraction(x, rect.x, rect.w),
      fy: fraction(y, rect.y, rect.h),
      ...accessibleLabel(visibleElement),
    };
  }

  function commentAt(requestedX?: unknown, requestedY?: unknown) {
    const x = Number(requestedX), y = Number(requestedY);
    return Number.isFinite(x) && Number.isFinite(y) ? forElement(document.elementFromPoint(x, y), x, y) : null;
  }

  function commentFor(requestedTemplateId?: unknown, componentName?: string | null) {
    const [element] = findTemplateInstances(String(requestedTemplateId), componentName || null);
    return element ? forElement(element, null, null) : null;
  }

  function commentIn(requestedLeft?: unknown, requestedTop?: unknown, requestedRight?: unknown, requestedBottom?: unknown) {
    const left = Number(requestedLeft), top = Number(requestedTop);
    const right = Number(requestedRight), bottom = Number(requestedBottom);
    if (![left, top, right, bottom].every(Number.isFinite) || right <= left || bottom <= top) return null;

    const root = findOuterComponentHost()?.getAttribute("data-sc-name");
    const area = (right - left) * (bottom - top);
    const covering: { element: Element; area: number }[] = [];
    const covered: Element[] = [];
    for (const element of root ? document.querySelectorAll("[data-dc-tpl]") : []) {
      if (componentScopeName(element) !== root || element.closest(editorChrome)) continue;
      const rect = element.getBoundingClientRect();
      const size = rect.width * rect.height;
      if (!(size > 0)) continue;
      const width = Math.min(right, rect.right) - Math.max(left, rect.left);
      const height = Math.min(bottom, rect.bottom) - Math.max(top, rect.top);
      const intersection = width > 0 && height > 0 ? width * height : 0;
      if (intersection >= 0.85 * area) covering.push({ element, area: size });
      if (intersection >= 0.7 * size) covered.push(element);
    }
    covering.sort((a, b) => a.area - b.area);
    const enclosing = covering.find(({ element }) =>
      covered.every((candidate) => element.contains(candidate) || candidate.contains(element)),
    )?.element ?? null;
    const candidates = enclosing ? covered.filter((element) => element !== enclosing && enclosing.contains(element)) : covered;
    if (!candidates.length && enclosing && covered.includes(enclosing)) candidates.push(enclosing);
    const outermost = candidates.filter((element) => {
      for (let parent = element.parentElement; parent && parent !== enclosing; parent = parent.parentElement) {
        if (candidates.includes(parent)) return false;
      }
      return true;
    });
    const items = [];
    for (const element of outermost) {
      if (items.length === 16) break;
      const rect = viewportBox(element.getBoundingClientRect());
      const tid = templateId(element);
      if (tid !== null) items.push({ tid, tag: element.tagName.toLowerCase(), rect });
    }
    return {
      enclosing: enclosing ? forElement(enclosing, (left + right) / 2, (top + bottom) / 2) : null,
      covered: items,
      total: outermost.length,
    };
  }

  function commentRects(anchors: unknown) {
    if (!Array.isArray(anchors)) return [];
    const root = findOuterComponentHost()?.getAttribute("data-sc-name");
    return Array.from(anchors.slice(0, 256), (value: CommentReference | null | undefined) => {
      const anchor = value || {};
      if (anchor.page === true) return pageBox();
      let element = querySelector(anchor.path);
      if (anchor.tid != null && root) {
        const instances = findTemplateInstances(String(anchor.tid), root);
        if (instances.length === 1 && !(element && instances.includes(element))) {
          const pathStillMatches = element && anchor.fp &&
            textFingerprint(element) === anchor.fp && textFingerprint(instances[0]) !== anchor.fp;
          if (!pathStillMatches) element = instances[0];
        }
      }
      return element ? viewportBox(visibleContentBounds(element)) : null;
    });
  }

  return { commentAt, commentFor, commentIn, commentRects };
}

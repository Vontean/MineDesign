import { componentScopeName, nearestComponentName } from "./element-query";
import { panZoomRoot } from "./preview-pan-zoom";
import { authoredAccessibilityAttribute } from "./text-edit-dom";

const omittedContent = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
const editorChrome = "[data-dc-editor-overlay-root],[data-dc-editor-overlay],[data-dc-editor-style]";
const accessiblyNamed = new Set(["role", "aria-label", "aria-multiline"]);

export function stampLive(componentName: string) {
  let nextId = 0;
  function stamp(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.hasAttribute("data-dc-editor-overlay")) return;
      element.setAttribute("data-dc-tpl", String(nextId++));
    }
    for (const child of node.childNodes) stamp(child);
  }
  const { body } = document;
  for (const child of body.childNodes) stamp(child);
  body.setAttribute("data-sc-name", componentName);
  const clone = body.cloneNode(true) as HTMLElement;
  for (const overlay of clone.querySelectorAll("[data-dc-editor-overlay]")) overlay.remove();
  return clone.innerHTML;
}

export function bodySnapshot() {
  const parts: string[] = [];
  const root = panZoomRoot();
  function snapshot(element: Element, depth: number) {
    if (element.matches(editorChrome)) return;
    const indent = "  ".repeat(depth);
    const tag = element.tagName.toLowerCase();
    let openTag = indent + "<" + tag;
    for (const { name, value } of element.attributes) {
      if (name.startsWith("data-dc-editor-") || name === "contenteditable" ||
          name === "data-dc-tpl" || name === "data-sc-name" || (name === "style" && element === root) ||
          (accessiblyNamed.has(name) && authoredAccessibilityAttribute(element, name) == null)) continue;
      openTag += " " + name + '="' + value.replace(/"/g, "&quot;").replace(/\n/g, " ") + '"';
    }
    parts.push(openTag + ">");
    if (omittedContent.has(element.tagName)) {
      parts.push(indent + "  …");
    } else {
      for (const child of element.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) snapshot(child as Element, depth + 1);
        else if (child.nodeType === Node.TEXT_NODE) {
          const text = (child.textContent || "").replace(/\s+/g, " ").trim();
          if (text) parts.push(indent + "  " + text);
        }
      }
    }
    parts.push(indent + "</" + tag + ">");
  }
  snapshot(document.body, 0);
  return parts.join("\n");
}

function stampedId(element: Element) {
  return parseInt(element.getAttribute("data-dc-tpl")!, 10);
}

function stampedParent(element: Element, component: string) {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent.hasAttribute("data-sc-name")) return null;
    if (parent.hasAttribute("data-dc-tpl") && nearestComponentName(parent) === component) return stampedId(parent);
  }
  return null;
}

export function verifyPreviewStructure(
  component: string,
  parents: Record<number, number | null>,
  order: Record<number, number[]>,
) {
  const report = {
    parentMismatches: [] as { tid: number; tag: string; expectedParent: number | null; actualParent: number | null }[],
    unknownTids: [] as number[],
    missingTids: [] as number[],
    orderMismatches: [] as { parent: number; expected: number[]; actual: number[] }[],
  };
  const seen = new Set<string>();
  const stamps = Array.from(document.querySelectorAll("[data-dc-tpl]")).filter((element) =>
    !element.closest("[data-dc-editor-overlay]"),
  );
  for (const element of stamps) {
    if (componentScopeName(element) !== component) continue;
    const tid = stampedId(element);
    seen.add(String(tid));
    if (!(tid in parents)) {
      if (report.unknownTids.indexOf(tid) === -1) report.unknownTids.push(tid);
      continue;
    }
    const actualParent = stampedParent(element, component);
    const expectedParent = parents[tid];
    if (actualParent !== expectedParent) {
      report.parentMismatches.push({ tid, tag: element.tagName.toLowerCase(), expectedParent, actualParent });
    }
  }
  for (const key in parents) {
    const tid = parseInt(key, 10);
    if (!seen.has(key)) report.missingTids.push(tid);
  }
  for (const element of stamps) {
    if (nearestComponentName(element) !== component) continue;
    const parent = stampedId(element);
    const expectedOrder = order[parent];
    if (!expectedOrder) continue;
    const actual = Array.from(element.children)
      .filter((child) => child.hasAttribute("data-dc-tpl") && !child.closest("[data-dc-editor-overlay]"))
      .map(stampedId);
    if (actual.length !== new Set(actual).size) continue;
    const expected = expectedOrder.filter((tid) => actual.includes(tid));
    if (expected.join(",") !== actual.join(",")) {
      report.orderMismatches.push({ parent, expected, actual });
      if (report.orderMismatches.length > 5) break;
    }
  }
  return report;
}

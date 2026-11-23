import type { Dynamic } from "../../runtime-types";

export const normalizeTextMarkup: Dynamic = function (
  this: Dynamic,
  html?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const container: Dynamic = (document as Dynamic).createElement("div");
  container.innerHTML = html;
  const elements: Dynamic = container.querySelectorAll("*");
  for (let index: Dynamic = 0; index < elements.length; index++) {
    const element: Dynamic = elements[index];
    for (; element.attributes.length; )
      element.removeAttribute(element.attributes[0].name);
  }
  return container.innerHTML.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
};
export const extractTemplateTextMarkup: Dynamic = function (
  this: Dynamic,
  html?: Dynamic,
  requestedTemplateId?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  if (typeof html != "string") return null;
  const templateElement: Dynamic = new DOMParser()
    .parseFromString(html, "text/html")
    .querySelector('[data-dc-tpl="' + requestedTemplateId + '"]');
  if (!templateElement) return null;
  const descendants: Dynamic = templateElement.querySelectorAll("*");
  for (let index: Dynamic = 0; index < descendants.length; index++) {
    const element: Dynamic = descendants[index];
    for (; element.attributes.length; )
      element.removeAttribute(element.attributes[0].name);
  }
  return templateElement.innerHTML;
};
export const unwrapLinkPreservingEdges: Dynamic = function (
  this: Dynamic,
  link?: Dynamic,
  firstSelectedNode?: Dynamic,
  lastSelectedNode?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const createLinkFragment: Dynamic = (
    fragment?: Dynamic,
    ..._unusedFragmentArgs: Dynamic[]
  ): Dynamic => {
    if (fragment.textContent === "" && !fragment.querySelector("*")) return null;
    const linkFragment: Dynamic = link.cloneNode(false);
    linkFragment.removeAttribute("data-dc-tpl");
    linkFragment.removeAttribute("data-dc-link-new");
    linkFragment.appendChild(fragment);
    const nestedTemplates: Dynamic = linkFragment.querySelectorAll("[data-dc-tpl]");
    for (let index: Dynamic = 0; index < nestedTemplates.length; index++)
      nestedTemplates[index].removeAttribute("data-dc-tpl");
    return linkFragment;
  };
  const parent: Dynamic = link.parentNode;
  if (firstSelectedNode && link.contains(firstSelectedNode)) {
    const prefixRange: Dynamic = (document as Dynamic).createRange();
    prefixRange.setStart(link, 0);
    prefixRange.setEndBefore(firstSelectedNode);
    if (!prefixRange.collapsed) {
      const prefixLink: Dynamic = createLinkFragment(prefixRange.extractContents());
      if (prefixLink) {
        parent.insertBefore(prefixLink, link);
      }
    }
  }
  if (lastSelectedNode && link.contains(lastSelectedNode)) {
    const suffixRange: Dynamic = (document as Dynamic).createRange();
    suffixRange.setStartAfter(lastSelectedNode);
    suffixRange.setEnd(link, link.childNodes.length);
    if (!suffixRange.collapsed) {
      const suffixLink: Dynamic = createLinkFragment(suffixRange.extractContents());
      if (suffixLink) {
        parent.insertBefore(suffixLink, link.nextSibling);
      }
    }
  }
  for (; link.firstChild; )
    parent.insertBefore(link.firstChild, link);
  parent.removeChild(link);
};

export const matchTemplateTextNode: Dynamic = function (
  this: Dynamic,
  templateElement?: Dynamic,
  mappedText?: Dynamic,
  preferredNode?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const normalizeTextNode: Dynamic = function (
    this: Dynamic,
    node?: Dynamic,
    ..._unusedNormalizeArgs: Dynamic[]
  ): Dynamic {
    return (node.nodeValue || "")
      .replace(/[ \t\n\r\f]+/g, " ")
      .replace(/^ | $/g, "");
  };
  const isEditableTemplateTextNode: Dynamic = function (
    this: Dynamic,
    node?: Dynamic,
    ..._unusedPredicateArgs: Dynamic[]
  ): Dynamic {
    const parentElement: Dynamic = node.parentElement;
    return (
      node.nodeType === 3 &&
      !!parentElement &&
      templateElement.contains(node) &&
      parentElement.closest("[data-dc-tpl]") === templateElement &&
      !parentElement.closest(".sc-interp") &&
      parentElement.namespaceURI === "http://www.w3.org/1999/xhtml" &&
      !parentElement.closest("textarea,select,option,title,script,style,noscript")
    );
  };
  let matchedNode: Dynamic = null;
  const walker: Dynamic = templateElement.ownerDocument.createTreeWalker(templateElement, 4);
  if (preferredNode) {
    if (!isEditableTemplateTextNode(preferredNode)) return null;
    for (
      let node: Dynamic = walker.nextNode();
      node;
      node = walker.nextNode()
    )
      if (node !== preferredNode && isEditableTemplateTextNode(node) && normalizeTextNode(node) === normalizeTextNode(preferredNode))
        return null;
    matchedNode = preferredNode;
  } else
    for (
      let node: Dynamic = walker.nextNode();
      node;
      node = walker.nextNode()
    )
      if (!(!isEditableTemplateTextNode(node) || !/[\p{L}\p{N}]/u.test(node.nodeValue || ""))) {
        if (matchedNode) return null;
        matchedNode = node;
      }
  if (!matchedNode) return null;
  const normalizedWords: Dynamic = normalizeTextNode(matchedNode);
  for (let index: Dynamic = 0; index < mappedText.length; index++)
    if (mappedText[index].words === normalizedWords)
      return {
        node: matchedNode,
        key: mappedText[index].key,
        words: normalizedWords,
      };
  return null;
};
const TEXT_RELEVANT_STYLE_PROPERTIES = [
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "color",
  "text-align",
  "text-transform",
  "white-space",
  "list-style-type",
];
export const collectTextStyles: Dynamic = function (
  this: Dynamic,
  element?: Dynamic,
  style?: Dynamic,
  propertyNames: readonly string[] = TEXT_RELEVANT_STYLE_PROPERTIES,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const isListItem: Dynamic =
    style.display === "list-item" || element.tagName === "LI";
  if (!isListItem && (element.textContent || "").trim() === "") return null;
  const properties: Dynamic = {};
  for (let index: Dynamic = 0; index < propertyNames.length; index++) {
    const propertyName: Dynamic = propertyNames[index];
    if (
      (propertyName === "list-style-type" && !isListItem) ||
      (propertyName === "text-align" && style.display === "inline")
    )
      continue;
    const propertyValue: Dynamic = style.getPropertyValue(propertyName);
    if (propertyValue) {
      properties[propertyName] = propertyValue;
    }
  }
  return properties;
};

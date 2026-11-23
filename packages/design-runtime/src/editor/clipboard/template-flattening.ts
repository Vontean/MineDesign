/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardHtmlSanitizationAnimateSetAnimatemotionSet, ClipboardHtmlSanitizationScriptDataDcScriptPattern, urlAttributeNames, createNativeDomAccessors, isPastedStylePreserved, isSafePastedSrcset, isSafePastedUrl } from "./html-sanitization";
import { ClipboardLayoutSnapshotsScriptStyleXmpSet } from "./layout-snapshots";
import { DcTplAttribute, fromParserHtml } from "../html/authoring";
import { ScCamelValue, toParserHtml } from "../html/tag-normalization";
import { promoteSvgShapeToRoot, selectedRootElementIds } from "../selection/element-order";

var ClipboardTemplateFlatteningAZaZPattern: Dynamic;
var unsafeTemplateCodePattern: Dynamic;
var ClipboardTemplateFlatteningMatch: Dynamic;
var ClipboardTemplateFlatteningSoleVariablePattern: Dynamic;
var ClipboardTemplateFlatteningScriptStyleIframeSet: Dynamic;
var ClipboardTemplateFlatteningSubscribers: Dynamic;
var ClipboardTemplateFlatteningLimit: Dynamic;
var ClipboardTemplateFlatteningTrueFalseNullSet: Dynamic;
var ClipboardTemplateFlatteningHelmetScriptPattern: Dynamic;
function substituteTemplateValues(
  template?: Dynamic,
  resolveValue?: Dynamic,
  keepNumericPlaceholders: Dynamic = false,
): Dynamic {
  return template.replace(
    ClipboardTemplateFlatteningAZaZPattern,
    (placeholder?: Dynamic, variableName?: Dynamic): Dynamic => {
      let resolved: Dynamic = resolveValue(variableName);
      return typeof resolved == "boolean" || resolved === null
        ? "{{" + String(resolved) + "}}"
        : typeof resolved == "number"
          ? Number.isFinite(resolved)
            ? keepNumericPlaceholders && /^-?\d+(\.\d+)?$/.test(String(resolved))
              ? "{{" + String(resolved) + "}}"
              : String(resolved)
            : placeholder
          : typeof resolved != "string" ||
              /[{}]/.test(resolved) ||
              ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(
                resolved,
              )
            ? placeholder
            : resolved;
    },
  );
}
function flattenTemplateValues(
  html?: Dynamic,
  resolveValue?: Dynamic,
  doc: Dynamic = document,
): Dynamic {
  if (!html.includes("{{")) return html;
  try {
    let dom: Dynamic = createNativeDomAccessors(doc.body),
      templateElement: Dynamic = doc.createElement("template");
    templateElement.innerHTML = toParserHtml(html);
    let changeCount: Dynamic = 0,
      addedLength: Dynamic = 0,
      trackBudget: Dynamic = (oldText?: Dynamic, newText?: Dynamic): Dynamic => {
        addedLength += newText.length - oldText.length;
        if (addedLength > ClipboardTemplateFlatteningLimit)
          throw new RangeError("bake budget");
      },
      flattenNode: Dynamic = (
        node?: Dynamic,
        parentTag?: Dynamic,
      ): Dynamic => {
        let nodeType: Dynamic = dom.nodeType(node);
        if (nodeType === 3) {
          if (
            ClipboardLayoutSnapshotsScriptStyleXmpSet.has(parentTag) ||
            parentTag === "textarea" ||
            parentTag === "title"
          )
            return;
          let oldText: Dynamic = node.nodeValue ?? "",
            newText: Dynamic = substituteTemplateValues(oldText, resolveValue);
          newText !== oldText &&
            (trackBudget(oldText, newText), (node.nodeValue = newText), changeCount++);
          return;
        }
        if (nodeType !== 1) return;
        let element: Dynamic = node,
          tagName: Dynamic = dom.tagName(element).toLowerCase(),
          baseTag: Dynamic = tagName.startsWith("sc-raw-")
            ? tagName.slice(7)
            : tagName;
        if (
          !(
            baseTag.includes(":") ||
            ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(
              "<" + baseTag,
            )
          )
        ) {
          if (!ClipboardTemplateFlatteningScriptStyleIframeSet.has(baseTag))
            for (let attribute of Array.from(
              dom.attributes(element),
            ) as Dynamic) {
              let attributeName: Dynamic = attribute.name.startsWith(
                  ScCamelValue,
                )
                  ? attribute.name.slice(ScCamelValue.length)
                  : attribute.name,
                normalizedName: Dynamic = attributeName
                  .toLowerCase()
                  .replace(/[^a-z]/g, "");
              if (
                !attribute.value.includes("{{") ||
                normalizedName.startsWith("on") ||
                attributeName.startsWith("sc-") ||
                ["srcdoc", "formaction", "ping", "contenteditable"].includes(
                  normalizedName,
                ) ||
                ((baseTag === "x-import" || baseTag === "dc-import") &&
                  ["from", "import", "src"].includes(normalizedName))
              )
                continue;
              let isStyleAttribute: Dynamic = normalizedName.startsWith("style"),
                newValue: Dynamic = substituteTemplateValues(
                  attribute.value,
                  resolveValue,
                  !isStyleAttribute &&
                    ClipboardTemplateFlatteningSoleVariablePattern.test(
                      attribute.value,
                    ),
                );
              if (newValue !== attribute.value) {
                if (isStyleAttribute) {
                  if (!isPastedStylePreserved(newValue)) continue;
                } else if (
                  normalizedName === "srcset" ||
                  normalizedName === "imagesrcset"
                ) {
                  if (!isSafePastedSrcset(newValue)) continue;
                } else if (
                  ClipboardTemplateFlatteningSubscribers.has(normalizedName) &&
                  !isSafePastedUrl(
                    newValue,
                    normalizedName === "src" ||
                      normalizedName === "poster" ||
                      baseTag === "image" ||
                      baseTag === "feimage",
                  )
                )
                  continue;
                trackBudget(attribute.value, newValue);
                dom.setAttribute(element, attribute.name, newValue);
                changeCount++;
              }
            }
          if (baseTag !== "template")
            for (let childNode of Array.from(
              dom.childNodes(element),
            ) as Dynamic)
              flattenNode(childNode, baseTag);
        }
      };
    for (let rootNode of Array.from(templateElement.content.childNodes) as Dynamic)
      flattenNode(rootNode, "");
    if (changeCount === 0) return html;
    let flattened: Dynamic = fromParserHtml(templateElement.innerHTML);
    return ClipboardTemplateFlatteningMatch(flattened) >
      ClipboardTemplateFlatteningMatch(html)
      ? html
      : flattened;
  } catch {
    return html;
  }
}
function getLoopTemplateVariables(html?: Dynamic): Dynamic {
  let variables: Dynamic = new Set();
  if (!/<sc-for\b/i.test(html)) return variables;
  let templateElement: Dynamic = (document as Dynamic).createElement("template");
  templateElement.innerHTML = html;
  for (let loopElement of Array.from(
    templateElement.content.querySelectorAll("sc-for"),
  ) as Dynamic)
    variables.add((loopElement.getAttribute("as") ?? "").trim() || "item");
  return variables;
}
function flattenSelectionTemplates(
  editorApi?: Dynamic,
  selectedIds?: Dynamic,
  html?: Dynamic,
): Dynamic {
  let selectedElements: Dynamic = selectedRootElementIds(editorApi, [
      ...new Set(
        selectedIds.map(
          (id?: Dynamic): Dynamic =>
            promoteSvgShapeToRoot(editorApi, id),
        ),
      ),
    ]).map((id?: Dynamic): Dynamic => editorApi.element(id)),
    wrappedHtml: Dynamic = html;
  for (
    let ancestor: Dynamic = selectedElements[0]?.parentElement ?? null;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    if (
      ancestor.tagName.toLowerCase() !== "x-import" ||
      ancestor.hasAttribute("data-uneditable") ||
      !selectedElements.every(
        (element?: Dynamic): Dynamic =>
          element != null && element !== ancestor && ancestor.contains(element),
      )
    )
      continue;
    let hasNoSiblings: Dynamic = true;
    for (
      let chainElement: Dynamic = ancestor;
      chainElement && hasNoSiblings;
      chainElement = chainElement.parentElement
    )
      hasNoSiblings = [...(chainElement.parentNode?.children ?? [])].every(
        (sibling?: Dynamic): Dynamic =>
          sibling === chainElement ||
          ClipboardTemplateFlatteningHelmetScriptPattern.test(sibling.tagName),
      );
    if (!hasNoSiblings) continue;
    let wrapperClone: Dynamic = ancestor.cloneNode(false);
    wrapperClone.removeAttribute(DcTplAttribute);
    wrapperClone.removeAttribute("style");
    let templateElement: Dynamic = (document as Dynamic).createElement("template");
    templateElement.content.appendChild(wrapperClone);
    let wrapperHtml: Dynamic = fromParserHtml(templateElement.innerHTML),
      text: Dynamic = "</x-import>";
    wrappedHtml =
      wrapperHtml.slice(0, wrapperHtml.length - text.length) +
      `
` +
      wrappedHtml +
      `
` +
      text;
  }
  return wrappedHtml;
}
export {
  ClipboardTemplateFlatteningAZaZPattern,
  ClipboardTemplateFlatteningSoleVariablePattern,
  ClipboardTemplateFlatteningHelmetScriptPattern,
  ClipboardTemplateFlatteningLimit,
  ClipboardTemplateFlatteningMatch,
  ClipboardTemplateFlatteningScriptStyleIframeSet,
  ClipboardTemplateFlatteningSubscribers,
  ClipboardTemplateFlatteningTrueFalseNullSet,
  flattenSelectionTemplates,
  flattenTemplateValues,
  getLoopTemplateVariables,
  substituteTemplateValues,
  unsafeTemplateCodePattern,
};
export function installEditorClipboardTemplateFlattening(): () => void {
  return () => {
    ClipboardTemplateFlatteningAZaZPattern =
      /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;
    unsafeTemplateCodePattern = new RegExp(
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.source,
      "gi",
    );
    ClipboardTemplateFlatteningMatch = (html?: Dynamic): Dynamic =>
      html.match(unsafeTemplateCodePattern)?.length ?? 0;
    ClipboardTemplateFlatteningSoleVariablePattern =
      /^\s*\{\{\s*[A-Za-z_$][\w$]*\s*\}\}\s*$/;
    ClipboardTemplateFlatteningScriptStyleIframeSet = new Set([
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "meta",
      "base",
      "link",
      ...ClipboardHtmlSanitizationAnimateSetAnimatemotionSet,
    ]);
    ClipboardTemplateFlatteningSubscribers = new Set(
      [...urlAttributeNames].map(
        (attributeName?: Dynamic): Dynamic => attributeName.replace(/[^a-z]/g, ""),
      ),
    );
    ClipboardTemplateFlatteningLimit = 2e5;
    ClipboardTemplateFlatteningTrueFalseNullSet = new Set([
      "true",
      "false",
      "null",
      "undefined",
    ]);
    ClipboardTemplateFlatteningHelmetScriptPattern =
      /^((sc-)?helmet|script|style|template|link|meta|title)$/i;
  };
}

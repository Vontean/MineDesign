/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseComponentImport } from "../components/imports";
import { componentTextOptions } from "../components/text-edits";
import { getStyleProperty, normalizeCssProperty, parseStyleDeclarations, serializeStyleDeclarations } from "../css/declarations";
import { getCssPropertySources, mergeAuthoredStyle, resolveCssVariable } from "../css/inheritance";
import { getCssRuleProperty, getUnconditionalCssDeclarations, parseUtilityClasses, stripCssNestedContent, updateCssRuleProperties } from "../css/rules";
import { expandCssDeclarations, expandShorthandForProperty } from "../css/shorthand";
import { setStyleProperty } from "../css/values";
import { canContainHtmlChildren, canContainHtmlTag, DcTplAttribute, fromParserHtml, HtmlAuthoringCss, HtmlAuthoringSubscribers, HtmlAuthoringTextTspanTextpathSet, isIconOnlyElement, isInlineTextContainer, parseUtilityClassesValue, stripLeadingCssAtRules } from "../html/authoring";
import { HtmlTagNormalizationSubscribers, kebabToCamelCase, safeJsonStringify, ScCamelValue, toParserHtml } from "../html/tag-normalization";
import { containsTemplateText, directiveParent, directiveSiblingsAdjacent, editorAssert, elementTextPreview, hasOnlyDirectText, ModelDomTextButtonInputPattern, ModelDomTextH1H2H3Config, ModelDomTextSplitValue, ModelDomTextSplitValue_2, ModelDomTextSubscribers, siblingsSeparatedOnlyByWhitespace } from "./dom-text";
import { detectContainerLayout, isImportedIcon, labelToElementKind, readableTagName, slideElementLabel, tagIcon } from "./labels";
import { regenerateArrowHeadIds } from "../svg/arrows";
import { buildGoogleFontsUrl } from "../typography/font-catalog";

var ModelDcEditorModelStyleScriptPattern: Dynamic;
var ModelDcEditorModelAbbrCitePattern: Dynamic;
var DcEditorModel: Dynamic;
export {
  DcEditorModel,
  ModelDcEditorModelAbbrCitePattern,
  ModelDcEditorModelStyleScriptPattern,
};
export function installEditorModelDcEditorModel(): () => void {
  return () => {
    ModelDcEditorModelStyleScriptPattern =
      /^(style|script|template|title|noscript|textarea|helmet|sc-helmet|sc-raw-script|sc-raw-style)$/i;
    ModelDcEditorModelAbbrCitePattern =
      /^(a|abbr|b|bdi|bdo|cite|code|em|font|i|kbd|label|mark|q|s|samp|small|span|strong|sub|sup|time|u|var)$/i;
    DcEditorModel = class ModelClass {
      tpl: Dynamic;
      byTid: Dynamic = new Map();
      classRuleCache: Dynamic = null;
      pageTextCache: Dynamic;
      serialized: Dynamic = null;
      edits: Dynamic = null;
      raw: Dynamic;
      constructor(template: Dynamic, modelOptions: Dynamic) {
        this.raw = modelOptions?.raw ?? false;
        this.tpl = (document as Dynamic).createElement("template");
        this.tpl.innerHTML = this.raw
          ? template
          : toParserHtml(template);
        typeof MutationObserver !== "undefined" &&
          ((this.edits = new MutationObserver((): Dynamic => {
            this.serialized = null;
          })),
          this.edits.observe(this.tpl.content, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
          }));
        this.restamp();
        for (let element of this.byTid.values() as Dynamic)
          isImportedIcon(element) &&
            !element.hasAttribute("data-uneditable") &&
            element.setAttribute("data-uneditable", "");
      }
      rebuild(template: Dynamic): Dynamic {
        return new ModelClass(template, {
          raw: this.raw,
        });
      }
      rootText(): Dynamic {
        return [...this.tpl.content.childNodes]
          .map(
            (node?: Dynamic): Dynamic =>
              node.nodeType === 3 ? (node.nodeValue ?? "") : "",
          )
          .join("");
      }
      textRuns(): Dynamic {
        let runs: Dynamic = [],
          text: Dynamic = "",
          flushText: Dynamic = (): Dynamic => {
            text.trim() !== "" && runs.push(text);
            text = "";
          },
          collectText: Dynamic = (parent?: Dynamic): Dynamic => {
            for (let child of parent.childNodes as Dynamic) {
              child.nodeType === Node.TEXT_NODE &&
                (text += child.nodeValue ?? "");
              if (child.nodeType !== Node.ELEMENT_NODE) continue;
              let childElement: Dynamic = child;
              ModelDcEditorModelStyleScriptPattern.test(childElement.tagName) ||
                childElement.hasAttribute("hidden") ||
                (ModelDcEditorModelAbbrCitePattern.test(childElement.tagName)
                  ? collectText(childElement)
                  : (flushText(), collectText(childElement), flushText()));
            }
          };
        collectText(this.tpl.content);
        flushText();
        return runs;
      }
      element(tid: Dynamic): Dynamic {
        return this.byTid.get(tid) ?? null;
      }
      elementsByAttr(attributeName: Dynamic, attributeValue: Dynamic): Dynamic {
        let matches: Dynamic = [];
        for (let candidate of this.byTid.values() as Dynamic)
          candidate.getAttribute(attributeName) === attributeValue && matches.push(candidate);
        return matches;
      }
      isUneditable(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return element
          ? element.hasAttribute("data-uneditable") ||
              element.tagName.toLowerCase() === "deck-stage"
          : false;
      }
      targetParentLocked(tid: Dynamic, position: Dynamic): Dynamic {
        if (tid == null) return false;
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        let targetParent: Dynamic =
          position === "into" ? element : element.parentElement;
        return targetParent
          ? targetParent.tagName.toLowerCase() === "deck-stage" ||
              targetParent.hasAttribute("data-uneditable")
          : false;
      }
      isLoopDriven(tid: Dynamic): Dynamic {
        let current: Dynamic = this.element(tid);
        for (; current; ) {
          if (current.tagName.toLowerCase() === "sc-for") return true;
          current = current.parentElement;
        }
        return false;
      }
      elementCount(): Dynamic {
        return this.byTid.size;
      }
      sameSkeleton(other: Dynamic): Dynamic {
        if (this.byTid.size !== other.elementCount()) return false;
        for (let [tid, element] of this.byTid as Dynamic)
          if (other.element(tid)?.tagName !== element.tagName) return false;
        return true;
      }
      survivesReparse(): Dynamic {
        let html: Dynamic = this.serialize();
        return this.rebuild(html).serialize() === html;
      }
      serialize(): Dynamic {
        if (
          this.edits !== null &&
          this.edits.takeRecords().length === 0 &&
          this.serialized !== null
        )
          return this.serialized;
        let templateClone: Dynamic = this.tpl.cloneNode(true);
        for (let templateNode of templateClone.content.querySelectorAll(
          `[${DcTplAttribute}]`,
        ) as Dynamic)
          templateNode.removeAttribute(DcTplAttribute);
        let html: Dynamic = fromParserHtml(templateClone.innerHTML);
        this.edits !== null && (this.serialized = html);
        return html;
      }
      snapshot(): Dynamic {
        let skippedTags: Dynamic = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]),
          lines: Dynamic = [],
          appendElement: Dynamic = (element?: Dynamic, depth?: Dynamic): Dynamic => {
            let indent: Dynamic = "  ".repeat(depth),
              tagName: Dynamic = this.raw
                ? element.tagName.toLowerCase()
                : readableTagName(element.tagName.toLowerCase()),
              openTag: Dynamic = `${indent}<${tagName}`;
            for (let attribute of element.attributes as Dynamic)
              attribute.name !== DcTplAttribute &&
                (openTag += ` ${attribute.name}="${attribute.value.replace(/"/g, "&quot;").replace(/\n/g, " ")}"`);
            lines.push(`${openTag}>`);
            if (skippedTags.has(element.tagName)) lines.push(`${indent}  \u2026`);
            else {
              let isPreformatted: Dynamic = element.closest("pre, textarea") != null;
              for (let childNode of element.childNodes as Dynamic)
                if (childNode.nodeType === Node.ELEMENT_NODE)
                  appendElement(childNode, depth + 1);
                else if (childNode.nodeType === Node.TEXT_NODE) {
                  let text: Dynamic = childNode.nodeValue ?? "";
                  if (isPreformatted)
                    for (let line of text.split(`
`) as Dynamic)
                      lines.push(`${indent}  ${line}`);
                  else {
                    let collapsedText: Dynamic = text.replace(/\s+/g, " ").trim();
                    collapsedText && lines.push(`${indent}  ${collapsedText}`);
                  }
                }
            }
            lines.push(`${indent}</${tagName}>`);
          };
        for (let rootChild of this.tpl.content.children as Dynamic)
          appendElement(rootChild, 0);
        return lines.join(`
`);
      }
      setStyleProperty(
        tid: Dynamic,
        property: Dynamic,
        propertyValue: Dynamic,
      ): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        let nextStyle: Dynamic = setStyleProperty(
          expandShorthandForProperty(
            element.getAttribute("style"),
            property,
            propertyValue === null,
          ),
          property,
          propertyValue,
        );
        nextStyle === ""
          ? element.removeAttribute("style")
          : element.setAttribute("style", nextStyle);
        return true;
      }
      setInlineStyleAttr(tid: Dynamic, style: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return element
          ? (style === ""
              ? element.removeAttribute("style")
              : element.setAttribute("style", style),
            true)
          : false;
      }
      setText(tid: Dynamic, text: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return !element ||
          (element.tagName !== "TEXTAREA" &&
            !hasOnlyDirectText(element))
          ? false
          : ((element.textContent = text),
            element.tagName === "STYLE" && (this.classRuleCache = null),
            true);
      }
      setAttribute(
        tid: Dynamic,
        name: Dynamic,
        attributeValue: Dynamic,
      ): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        let attributeName: Dynamic = /[A-Z]/.test(name)
          ? ScCamelValue +
            name.replace(
              /[A-Z]/g,
              (char?: Dynamic): Dynamic => "-" + char.toLowerCase(),
            )
          : name;
        attributeValue == null || attributeValue === ""
          ? element.removeAttribute(attributeName)
          : element.setAttribute(attributeName, attributeValue);
        return true;
      }
      pageFillStageTid(): Dynamic {
        let firstTid: Dynamic = this.childTids(null).find(
            (tid?: Dynamic): Dynamic =>
              !/^(helmet|sc-helmet|script|style|template)$/i.test(
                this.tagName(tid) ?? "",
              ),
          ),
          stage: Dynamic = firstTid == null ? null : this.element(firstTid);
        if (
          !stage ||
          stage.tagName.toLowerCase() !== "section" ||
          !(stage.getAttribute("class") ?? "").split(/\s+/).includes("stage")
        )
          return null;
        let readStageStyle: Dynamic = (property?: Dynamic): Dynamic =>
          getStyleProperty(
            stage.getAttribute("style"),
            property,
          ).replace(/\s/g, "");
        return readStageStyle("width") === "100%" &&
          readStageStyle("height") === "100vh" &&
          (readStageStyle("background") || readStageStyle("background-color"))
          ? firstTid
          : null;
      }
      pageSheets(): Dynamic {
        let styles: Dynamic = [
          ...this.tpl.content.querySelectorAll("sc-helmet style"),
        ];
        return {
          styles: styles,
          css: styles
            .map((style?: Dynamic): Dynamic => style.textContent ?? "")
            .join(HtmlAuthoringCss),
        };
      }
      pageFill(): Dynamic {
        let stageTid: Dynamic = this.pageFillStageTid(),
          { css: css }: Dynamic = this.pageSheets(),
          readBackground: Dynamic = (selector?: Dynamic, property?: Dynamic): Dynamic =>
            stageTid != null
              ? this.inlineStyleValue(stageTid, property)
              : getCssRuleProperty(css, selector, property),
          fill: Dynamic = {
            background: readBackground("body", "background"),
            backgroundColor: readBackground("body", "background-color"),
            vars: {},
          };
        !fill.background &&
          !fill.backgroundColor &&
          (fill = {
            ...fill,
            background: readBackground("html", "background"),
            backgroundColor: readBackground("html", "background-color"),
          });
        for (let colorValue of [
          fill.background,
          fill.backgroundColor,
        ] as Dynamic) {
          let resolvedColor: Dynamic =
            colorValue && resolveCssVariable(css, "body", colorValue);
          resolvedColor && (fill.vars[colorValue] = resolvedColor);
        }
        return fill;
      }
      setPageFill(declarations: Dynamic): Dynamic {
        let stageTid: Dynamic = this.pageFillStageTid();
        if (stageTid != null) {
          let hasChanged: Dynamic = false;
          for (let declaration of declarations as Dynamic)
            this.inlineStyleValue(stageTid, declaration.prop) !==
              (declaration.value ?? "") &&
              this.setStyleProperty(stageTid, declaration.prop, declaration.value) &&
              (hasChanged = true);
          return hasChanged;
        }
        let backgroundProps: Dynamic = ["background", "background-color"],
          { styles: styleElements, css: css }: Dynamic = this.pageSheets();
        if (
          styleElements.some(
            (style?: Dynamic): Dynamic =>
              stripCssNestedContent(style.textContent ?? ""),
          )
        )
          return false;
        let updatedCss: Dynamic =
          backgroundProps.every(
            (property?: Dynamic): Dynamic =>
              !getCssRuleProperty(css, "body", property),
          ) &&
          backgroundProps.some(
            (property?: Dynamic): Dynamic =>
              getCssRuleProperty(css, "html", property),
          )
            ? updateCssRuleProperties(
                css,
                "html",
                backgroundProps.map(
                  (property?: Dynamic): Dynamic => ({
                    prop: property,
                    value: null,
                  }),
                ),
                backgroundProps,
                false,
              )
            : css;
        updatedCss = updateCssRuleProperties(
          updatedCss,
          "body",
          declarations,
          backgroundProps,
        );
        let cssParts: Dynamic = updatedCss.split(HtmlAuthoringCss);
        if (updatedCss === css || cssParts.length !== Math.max(1, styleElements.length))
          return false;
        if (styleElements.length === 0) {
          let helmet: Dynamic = (document as Dynamic).createElement(
              "sc-helmet",
            ),
            styleElement: Dynamic = (document as Dynamic).createElement("style");
          styleElement.textContent = cssParts[0];
          helmet.appendChild(styleElement);
          this.tpl.content.appendChild(helmet);
        } else
          cssParts.forEach((partCss?: Dynamic, index?: Dynamic): Dynamic => {
            styleElements[index].textContent !== partCss &&
              (styleElements[index].textContent = partCss);
          });
        this.classRuleCache = null;
        return true;
      }
      trailingHelmet(): Dynamic {
        let lastElementChild: Dynamic = this.tpl.content.lastElementChild;
        return lastElementChild &&
          lastElementChild.tagName.toLowerCase() === "sc-helmet" &&
          lastElementChild !== this.tpl.content.firstElementChild
          ? lastElementChild
          : null;
      }
      ensureWebfontLink(fontFamily: Dynamic): Dynamic {
        let fontUrl: Dynamic = buildGoogleFontsUrl(fontFamily),
          familyParam: Dynamic = fontFamily.trim().replace(/\s+/g, "+"),
          familyPattern: Dynamic = new RegExp(
            "[?&]family=" + familyParam.replace(/\+/g, "\\+") + "(?:[:&]|$)",
            "i",
          );
        for (let linkElement of this.tpl.content.querySelectorAll(
          'link[rel="stylesheet"]',
        ) as Dynamic)
          if (
            familyPattern.test(
              (linkElement.getAttribute("href") ?? "").replace(/%20/gi, "+"),
            )
          )
            return false;
        this.appendHelmetLink(fontUrl);
        return true;
      }
      appendHelmetLink(href: Dynamic): Dynamic {
        let helmet: Dynamic = this.trailingHelmet();
        helmet ||
          ((helmet = (document as Dynamic).createElement("sc-helmet")),
          this.tpl.content.appendChild(helmet));
        let linkElement: Dynamic = (document as Dynamic).createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("href", href);
        helmet.appendChild(linkElement);
      }
      helmetAssets(): Dynamic {
        let content: Dynamic = this.tpl.content,
          helmets: Dynamic = [...content.children].filter(
            (element?: Dynamic): Dynamic =>
              element.tagName.toLowerCase() === "sc-helmet",
          ),
          assets: Dynamic = [],
          hasOtherContent: Dynamic =
            content.querySelectorAll("sc-helmet").length !== helmets.length,
          allowedLinkAttributes: Dynamic = new Set([
            "rel",
            "href",
            "crossorigin",
            "referrerpolicy",
            DcTplAttribute,
          ]);
        for (let helmetChild of helmets.flatMap(
          (helmet?: Dynamic): Dynamic => [...helmet.children],
        ) as Dynamic) {
          let tagName: Dynamic = helmetChild.tagName.toLowerCase(),
            relValues: Dynamic = (helmetChild.getAttribute("rel") ?? "")
              .toLowerCase()
              .split(/\s+/);
          if (tagName === "style") {
            let cssText: Dynamic = helmetChild.textContent ?? "";
            [...helmetChild.attributes].some(
              (attribute?: Dynamic): Dynamic =>
                attribute.name !== DcTplAttribute,
            ) || !stripLeadingCssAtRules(cssText)
              ? (hasOtherContent = true)
              : cssText.trim() !== "" &&
                assets.push({
                  css: cssText,
                });
          } else if (tagName === "link" && relValues.includes("stylesheet")) {
            let href: Dynamic = helmetChild.getAttribute("href") ?? "";
            href === "" ||
            relValues.length !== 1 ||
            [...helmetChild.attributes].some(
              (attribute?: Dynamic): Dynamic => !allowedLinkAttributes.has(attribute.name),
            )
              ? (hasOtherContent = true)
              : assets.push({
                  link: href,
                });
          } else
            (tagName === "link"
              ? !relValues.every(
                  (relValue?: Dynamic): Dynamic =>
                    /^(preconnect|dns-prefetch|icon|)$/.test(relValue),
                )
              : tagName !== "title" && tagName !== "meta") && (hasOtherContent = true);
        }
        for (let strayElement of content.querySelectorAll(
          'style, script, link[rel~="stylesheet" i]',
        ) as Dynamic)
          strayElement.closest("sc-helmet") || (hasOtherContent = true);
        return {
          assets: assets,
          atomics: helmets.some(
            (helmet?: Dynamic): Dynamic => helmet.hasAttribute("data-dc-atomics"),
          ),
          other: hasOtherContent,
        };
      }
      carryHelmet(assets: Dynamic): Dynamic {
        let hasOnlyTemplateAttribute: Dynamic = (element?: Dynamic): Dynamic =>
            [...element.attributes].every(
              (attribute?: Dynamic): Dynamic =>
                attribute.name === DcTplAttribute,
            ),
          existingCss: Dynamic = new Set(
            this.pageSheets()
              .styles.filter(hasOnlyTemplateAttribute)
              .map(
                (style?: Dynamic): Dynamic =>
                  (style.textContent ?? "").trim(),
              ),
          ),
          existingLinks: Dynamic = new Set(
            [
              ...this.tpl.content.querySelectorAll('link[rel~="stylesheet" i]'),
            ].map((element?: Dynamic): Dynamic => element.getAttribute("href")),
          ),
          newAssets: Dynamic = [];
        for (let asset of assets as Dynamic) {
          let assetKey: Dynamic =
              "css" in asset ? asset.css.trim() : asset.link,
            knownKeys: Dynamic = "css" in asset ? existingCss : existingLinks;
          assetKey === "" ||
            knownKeys.has(assetKey) ||
            (knownKeys.add(assetKey), newAssets.push(asset));
        }
        if (!newAssets.some((asset?: Dynamic): Dynamic => "css" in asset)) {
          for (let asset of newAssets as Dynamic)
            "link" in asset && this.appendHelmetLink(asset.link);
          return true;
        }
        let helmets: Dynamic = [...this.tpl.content.children].filter(
            (helmet?: Dynamic): Dynamic =>
              helmet.tagName.toLowerCase() === "sc-helmet",
          ),
          contentIndexes: Dynamic = (helmet?: Dynamic): Dynamic =>
            [...helmet.children].flatMap(
              (child?: Dynamic, index?: Dynamic): Dynamic =>
                /^(link|meta|script)$/i.test(child.tagName) ? [] : [index],
            ),
          allHelmets: Dynamic = [...this.tpl.content.querySelectorAll("sc-helmet")],
          canHostCss: Dynamic = (candidateHelmet?: Dynamic, childCount?: Dynamic): Dynamic =>
            newAssets.every(
              (asset?: Dynamic, offset?: Dynamic): Dynamic =>
                "link" in asset ||
                !allHelmets.some(
                  (otherHelmet?: Dynamic): Dynamic =>
                    otherHelmet !== candidateHelmet &&
                    contentIndexes(otherHelmet).includes(childCount + offset),
                ),
            ),
          trailing: Dynamic = this.trailingHelmet(),
          targetHelmet: Dynamic =
            helmets.find(
              (helmet?: Dynamic): Dynamic =>
                (helmet !== trailing || contentIndexes(helmet).length > 0) &&
                canHostCss(helmet, helmet.children.length),
            ) ?? null;
        if (!targetHelmet) {
          if (!canHostCss(null, 0)) return false;
          targetHelmet = (document as Dynamic).createElement("sc-helmet");
          this.tpl.content.insertBefore(targetHelmet, this.tpl.content.firstChild);
        }
        for (let asset of newAssets as Dynamic) {
          let node: Dynamic = (document as Dynamic).createElement(
            "css" in asset ? "style" : "link",
          );
          "css" in asset
            ? (node.textContent = asset.css.trim())
            : (node.setAttribute("rel", "stylesheet"),
              node.setAttribute("href", asset.link));
          targetHelmet.appendChild(node);
        }
        this.classRuleCache = null;
        return true;
      }
      ensureHelmetAtomics(): Dynamic {
        if (this.tpl.content.querySelector("sc-helmet[data-dc-atomics]"))
          return false;
        let helmet: Dynamic =
          [...this.tpl.content.children].find(
            (element?: Dynamic): Dynamic =>
              element.tagName.toLowerCase() === "sc-helmet",
          ) ?? null;
        helmet ||
          ((helmet = (document as Dynamic).createElement("sc-helmet")),
          this.tpl.content.insertBefore(helmet, this.tpl.content.firstChild));
        helmet.setAttribute("data-dc-atomics", "");
        return true;
      }
      findDeckStage(targetTid: Dynamic): Dynamic {
        let isDeckStage: Dynamic = (element?: Dynamic): Dynamic => {
            let tagName: Dynamic = element.tagName.toLowerCase();
            return (
              (tagName === "x-import" &&
                element.getAttribute("component-from-global-scope") ===
                  "deck-stage") ||
              tagName === "deck-stage"
            );
          },
          isSlideTag: Dynamic = (tagName?: Dynamic): Dynamic =>
            tagName !== "template" &&
            tagName !== "script" &&
            tagName !== "style" &&
            tagName !== "sc-helmet",
          describeDeckStage: Dynamic = (
            mountTid?: Dynamic,
            mountElement?: Dynamic,
          ): Dynamic => ({
            mountTid: mountTid,
            slideEls: [...mountElement.children].filter(
              (child?: Dynamic): Dynamic =>
                isSlideTag(child.tagName.toLowerCase()),
            ),
            slideTids: this.childTids(mountTid).filter(
              (slideTid?: Dynamic): Dynamic =>
                isSlideTag(this.element(slideTid)?.tagName.toLowerCase() ?? ""),
            ),
          });
        if (targetTid !== undefined) {
          let element: Dynamic = this.element(targetTid);
          return element && isDeckStage(element) ? describeDeckStage(targetTid, element) : null;
        }
        for (let [tid, element] of this.byTid as Dynamic)
          if (isDeckStage(element)) return describeDeckStage(tid, element);
        return null;
      }
      speakerNotesJson(): Dynamic {
        let element: Dynamic = this.tpl.content.querySelector(
          "script#speaker-notes",
        );
        if (!element) return null;
        try {
          let notes: Dynamic = JSON.parse(element.textContent ?? "[]");
          return Array.isArray(notes)
            ? notes.map(
                (note?: Dynamic): Dynamic =>
                  typeof note == "string" ? note : "",
              )
            : null;
        } catch {
          return null;
        }
      }
      speakerNotes(tid: Dynamic): Dynamic {
        let deckStage: Dynamic = this.findDeckStage(tid),
          jsonNotes: Dynamic = this.speakerNotesJson();
        if (deckStage) {
          let attributeNotes: Dynamic = deckStage.slideEls.map(
            (element?: Dynamic): Dynamic =>
              element.getAttribute("data-speaker-notes"),
          );
          if (attributeNotes.some((note?: Dynamic): Dynamic => note !== null))
            return attributeNotes.map(
              (note?: Dynamic, index?: Dynamic): Dynamic =>
                note ?? jsonNotes?.[index] ?? "",
            );
        }
        return jsonNotes;
      }
      syncSpeakerNotesJson(tid: Dynamic): Dynamic {
        let element: Dynamic = this.tpl.content.querySelector(
          "script#speaker-notes",
        );
        if (!element) return;
        let notes: Dynamic = this.speakerNotes(tid);
        notes !== null &&
          (element.textContent =
            `
` +
            safeJsonStringify(notes, {
              space: 2,
            }) +
            `
`);
      }
      setSpeakerNote(element: Dynamic, note: Dynamic): Dynamic {
        return element.getAttribute("data-speaker-notes") === note
          ? false
          : (element.setAttribute("data-speaker-notes", note), true);
      }
      attributes(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return {};
        let result: Dynamic = {};
        for (let { name: attributeName, value: attributeValue } of [
          ...element.attributes,
        ] as Dynamic) {
          if (attributeName === DcTplAttribute || attributeName === "style") continue;
          let exposedName: Dynamic = attributeName.startsWith(ScCamelValue)
            ? kebabToCamelCase(
                attributeName.slice(ScCamelValue.length),
              )
            : attributeName;
          result[exposedName] = attributeValue;
        }
        return result;
      }
      removeElement(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return element
          ? (element.remove(),
            editorAssert(
              !element.isConnected || !this.tpl.content.contains(element),
              `removeElement(${tid}) left the element in the template`,
            ),
            true)
          : false;
      }
      restamp(): Dynamic {
        this.byTid.clear();
        this.classRuleCache = null;
        let index: Dynamic = 0,
          stampNode: Dynamic = (node?: Dynamic): Dynamic => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              let element: Dynamic = node;
              element.setAttribute(DcTplAttribute, String(index));
              this.byTid.set(index, element);
              index++;
              if (this.raw && element.tagName === "NOSCRIPT") return;
            }
            for (let child of node.childNodes as Dynamic) stampNode(child);
          };
        stampNode(this.tpl.content);
      }
      parentTid(tid: Dynamic): Dynamic {
        let parentElement: Dynamic = this.element(tid)?.parentElement;
        if (!parentElement) return null;
        let attribute: Dynamic = parentElement.getAttribute(DcTplAttribute);
        return attribute == null ? null : parseInt(attribute, 10);
      }
      childTids(tid: Dynamic): Dynamic {
        let container: Dynamic =
          tid == null ? this.tpl.content : this.element(tid);
        if (!container) return [];
        let tids: Dynamic = [];
        for (let child of container.children as Dynamic) {
          let attribute: Dynamic = child.getAttribute(DcTplAttribute);
          attribute != null && tids.push(parseInt(attribute, 10));
        }
        return tids;
      }
      wrapElements(tids: Dynamic, wrapperHtml: Dynamic): Dynamic {
        let elements: Dynamic = tids
            .map((tid?: Dynamic): Dynamic => this.element(tid))
            .filter((element?: Dynamic): Dynamic => element != null),
          topLevelElements: Dynamic = elements
            .filter(
              (element?: Dynamic): Dynamic =>
                !elements.some(
                  (other?: Dynamic): Dynamic =>
                    other !== element && other.contains(element),
                ),
            )
            .sort(
              (first?: Dynamic, second?: Dynamic): Dynamic =>
                first.compareDocumentPosition(second) &
                Node.DOCUMENT_POSITION_FOLLOWING
                  ? -1
                  : 1,
            );
        if (topLevelElements.length === 0) return null;
        let parentNode: Dynamic = topLevelElements[0].parentNode;
        for (
          ;
          parentNode &&
          !topLevelElements.every(
            (element?: Dynamic): Dynamic => parentNode.contains(element),
          );

        )
          parentNode = parentNode.parentNode;
        if (!parentNode) return null;
        for (let element of topLevelElements as Dynamic)
          for (
            let parentElement: Dynamic = element.parentElement;
            parentElement && parentElement !== parentNode;
            parentElement = parentElement.parentElement
          ) {
            let ancestorTag: Dynamic = parentElement.tagName.toLowerCase();
            if (
              /^(sc-for|sc-if|svg|deck-stage|x-import|dc-import)$/.test(
                ancestorTag,
              ) ||
              parentElement.hasAttribute("data-uneditable")
            )
              return null;
          }
        if (
          parentNode instanceof Element &&
          (parentNode.tagName.toLowerCase() === "deck-stage" ||
            parentNode.hasAttribute("data-uneditable")) &&
          !topLevelElements.every(
            (element?: Dynamic): Dynamic => element.parentNode === parentNode,
          )
        )
          return null;
        let anchor: Dynamic = topLevelElements[0];
        for (; anchor.parentNode && anchor.parentNode !== parentNode; )
          anchor = anchor.parentNode;
        let wrapperTemplate: Dynamic = (document as Dynamic).createElement("template");
        wrapperTemplate.innerHTML = this.raw
          ? wrapperHtml
          : toParserHtml(wrapperHtml);
        let firstElementChild: Dynamic = wrapperTemplate.content.firstElementChild;
        if (!firstElementChild) return null;
        let container: Dynamic = parentNode;
        for (
          ;
          container instanceof Element &&
          /^(sc-if|sc-for)$/.test(container.tagName.toLowerCase());

        )
          container = container.parentNode;
        if (container instanceof Element) {
          if (container.namespaceURI !== "http://www.w3.org/1999/xhtml")
            return null;
          let parentTag: Dynamic = readableTagName(
            container.tagName.toLowerCase(),
          );
          if (
            !canContainHtmlTag(parentTag, firstElementChild.tagName)
          ) {
            if (!canContainHtmlTag(parentTag, "span")) return null;
            let spanElement: Dynamic =
              firstElementChild.ownerDocument.createElement("span");
            for (let attribute of [...firstElementChild.attributes] as Dynamic)
              spanElement.setAttribute(attribute.name, attribute.value);
            firstElementChild = spanElement;
          }
        }
        parentNode.insertBefore(firstElementChild, anchor);
        for (let element of topLevelElements as Dynamic)
          firstElementChild.appendChild(element);
        return firstElementChild;
      }
      wrapTextRuns(tid: Dynamic, includeInlineElements: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid),
          tagName: Dynamic = this.tagName(tid) ?? "";
        if (
          !element ||
          element.namespaceURI !== "http://www.w3.org/1999/xhtml" ||
          !canContainHtmlChildren(tagName) ||
          tagName === "helmet" ||
          tagName === "x-import" ||
          tagName === "dc-import"
        )
          return [];
        let hasText: Dynamic = (node?: Dynamic): Dynamic =>
            node.nodeType === 3 && (node.nodeValue ?? "").trim() !== "",
          isDroppableEdge: Dynamic = (node?: Dynamic): Dynamic =>
            (node.nodeType === 3 && !hasText(node)) ||
            node.nodeType === 8,
          isInlineElement: Dynamic = (node?: Dynamic): Dynamic =>
            includeInlineElements &&
            node.nodeType === 1 &&
            HtmlTagNormalizationSubscribers.has(
              node.tagName.toLowerCase(),
            ) &&
            [...node.querySelectorAll("*")].every(
              (descendant?: Dynamic): Dynamic =>
                HtmlTagNormalizationSubscribers.has(
                  descendant.tagName.toLowerCase(),
                ),
            ),
          runs: Dynamic = [],
          currentRun: Dynamic = [],
          flushRun: Dynamic = (): Dynamic => {
            for (; currentRun.length > 0 && isDroppableEdge(currentRun[currentRun.length - 1]); )
              currentRun.pop();
            currentRun.some(hasText) && runs.push(currentRun);
            currentRun = [];
          };
        for (let childNode of [...element.childNodes] as Dynamic)
          hasText(childNode) ||
          isInlineElement(childNode) ||
          (isDroppableEdge(childNode) && currentRun.length > 0)
            ? currentRun.push(childNode)
            : flushRun();
        flushRun();
        let wrappers: Dynamic = [];
        for (let run of runs as Dynamic) {
          let firstNode: Dynamic = run[0];
          if (firstNode.nodeType === 3) {
            let leadingWhitespace: Dynamic = /^\s*/.exec(firstNode.nodeValue ?? "")![0]
              .length;
            leadingWhitespace > 0 && (run[0] = firstNode.splitText(leadingWhitespace));
          }
          let lastNode: Dynamic = run[run.length - 1];
          if (lastNode.nodeType === 3) {
            let lastText: Dynamic = lastNode.nodeValue ?? "",
              trailingWhitespace: Dynamic =
                lastText.length - lastText.replace(/\s+$/, "").length;
            trailingWhitespace > 0 && lastNode.splitText(lastText.length - trailingWhitespace);
          }
          let span: Dynamic = element.ownerDocument.createElement("span");
          element.insertBefore(span, run[0]);
          for (let node of run as Dynamic) span.appendChild(node);
          wrappers.push(span);
        }
        for (let childElement of [...element.children] as Dynamic) {
          if (!/^(sc-if|sc-for)$/.test(childElement.tagName.toLowerCase())) continue;
          let childTid: Dynamic = parseInt(
            childElement.getAttribute("data-dc-tpl") ?? "-1",
            10,
          );
          childTid >= 0 && wrappers.push(...this.wrapTextRuns(childTid, includeInlineElements));
        }
        return wrappers;
      }
      unwrapElement(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid),
          parent: Dynamic = element?.parentNode;
        if (!element || !parent) return null;
        let children: Dynamic = [...element.children];
        for (; element.firstChild; )
          parent.insertBefore(element.firstChild, element);
        element.remove();
        return children;
      }
      isWithin(ancestorTid: Dynamic, descendantTid: Dynamic): Dynamic {
        let ancestor: Dynamic = this.element(ancestorTid),
          current: Dynamic = this.element(descendantTid);
        for (; current; ) {
          if (current === ancestor) return true;
          current = current.parentElement;
        }
        return false;
      }
      duplicateElement(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element || !element.parentNode) return null;
        let copy: Dynamic = element.cloneNode(true);
        element.parentNode.insertBefore(copy, element.nextSibling);
        regenerateArrowHeadIds(this.tpl.content, [copy]);
        return copy;
      }
      subtreeHtml(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return null;
        let copy: Dynamic = element.cloneNode(true);
        copy.removeAttribute(DcTplAttribute);
        for (let node of copy.querySelectorAll(
          `[${DcTplAttribute}]`,
        ) as Dynamic)
          node.removeAttribute(DcTplAttribute);
        let template: Dynamic = (document as Dynamic).createElement("template");
        template.content.appendChild(copy);
        return fromParserHtml(template.innerHTML);
      }
      deckSlides(deckIndex: Dynamic): Dynamic {
        let deck: Dynamic = [
          ...this.tpl.content.querySelectorAll(
            'x-import[component-from-global-scope="deck-stage"], deck-stage',
          ),
        ][deckIndex];
        return deck
          ? [...deck.children].filter(
              (child?: Dynamic): Dynamic =>
                !/^(template|script|style)$/i.test(child.tagName),
            )
          : null;
      }
      resolveSlideAnchor(anchor: Dynamic): Dynamic {
        let slides: Dynamic = this.deckSlides(anchor.deck);
        if (!slides) return null;
        if (anchor.label != null) {
          let labelMatches: Dynamic = slides.filter(
            (element?: Dynamic): Dynamic =>
              element.getAttribute("data-label") === anchor.label,
          );
          if (labelMatches.length === 1) return labelMatches[0];
        }
        return slides.length !== anchor.count
          ? null
          : (slides[anchor.index] ?? null);
      }
      topLevelTags(html: Dynamic): Dynamic {
        let template: Dynamic = (document as Dynamic).createElement("template");
        template.innerHTML = this.raw ? html : toParserHtml(html);
        return [...template.content.children].map(
          (child?: Dynamic): Dynamic =>
            readableTagName(child.tagName.toLowerCase()),
        );
      }
      insertHtml(html: Dynamic, targetTid: Dynamic, position: Dynamic): Dynamic {
        let template: Dynamic = (document as Dynamic).createElement("template");
        template.innerHTML = this.raw ? html : toParserHtml(html);
        let inserted: Dynamic = [...template.content.children];
        if (inserted.length === 0) return null;
        let content: Dynamic = template.content;
        if (position === "root-end" || targetTid == null) {
          this.tpl.content.insertBefore(content, this.trailingHelmet());
          regenerateArrowHeadIds(this.tpl.content, inserted);
          return inserted;
        }
        let target: Dynamic = this.element(targetTid);
        if (!target) return null;
        if (position === "into") {
          if (!canContainHtmlChildren(target.tagName)) return null;
          target.appendChild(content);
        } else if (target.parentNode)
          position === "before"
            ? target.parentNode.insertBefore(content, target)
            : target.parentNode.insertBefore(content, target.nextSibling);
        else return null;
        editorAssert(
          inserted.every(
            (node?: Dynamic): Dynamic => this.tpl.content.contains(node),
          ),
          `insertHtml(${targetTid}, ${position}) did not land in the template`,
        );
        regenerateArrowHeadIds(this.tpl.content, inserted);
        return inserted;
      }
      isRenderedInPlace(
        tid: Dynamic,
        referenceTid: Dynamic,
        position: Dynamic,
      ): Dynamic {
        let element: Dynamic = this.element(tid),
          reference: Dynamic = referenceTid == null ? null : this.element(referenceTid);
        return !element || !reference || element === reference
          ? false
          : position === "before"
            ? directiveSiblingsAdjacent(element, reference)
            : position === "after"
              ? directiveSiblingsAdjacent(reference, element)
              : position === "into"
                ? directiveParent(element) === reference &&
                  directiveSiblingsAdjacent(element, null)
                : false;
      }
      isInPlace(tid: Dynamic, referenceTid: Dynamic, position: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid),
          reference: Dynamic = referenceTid == null ? null : this.element(referenceTid);
        return !element || !reference || element === reference
          ? false
          : position === "before"
            ? siblingsSeparatedOnlyByWhitespace(element, reference)
            : position === "after"
              ? siblingsSeparatedOnlyByWhitespace(reference, element)
              : position === "into"
                ? element.parentNode === reference &&
                  siblingsSeparatedOnlyByWhitespace(element, null)
                : false;
      }
      blockEls(tids: Dynamic): Dynamic {
        let elements: Dynamic = tids.map(
          (tid?: Dynamic): Dynamic => this.element(tid),
        );
        if (
          elements.length === 0 ||
          elements.some((element?: Dynamic): Dynamic => !element) ||
          new Set(elements).size !== elements.length
        )
          return null;
        let sorted: Dynamic = elements.sort(
          (first?: Dynamic, second?: Dynamic): Dynamic =>
            first.compareDocumentPosition(second) &
            Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1,
        );
        for (let count: Dynamic = 1; count < sorted.length; count++)
          if (sorted[count - 1].contains(sorted[count])) return null;
        return sorted;
      }
      blockInPlace(
        blocks: Dynamic,
        reference: Dynamic,
        position: Dynamic,
      ): Dynamic {
        if (blocks.includes(reference)) return false;
        for (let count: Dynamic = 1; count < blocks.length; count++)
          if (
            !directiveSiblingsAdjacent(
              blocks[count - 1],
              blocks[count],
            )
          )
            return false;
        let firstBlock: Dynamic = blocks[0],
          lastBlock: Dynamic = blocks[blocks.length - 1];
        return position === "before"
          ? directiveSiblingsAdjacent(lastBlock, reference)
          : position === "after"
            ? directiveSiblingsAdjacent(reference, firstBlock)
            : position === "into"
              ? directiveParent(firstBlock) === reference &&
                directiveSiblingsAdjacent(lastBlock, null)
              : false;
      }
      isBlockInPlace(
        tids: Dynamic,
        referenceTid: Dynamic,
        position: Dynamic,
      ): Dynamic {
        let blocks: Dynamic = this.blockEls(tids),
          reference: Dynamic = referenceTid == null ? null : this.element(referenceTid);
        return (
          !!blocks && !!reference && this.blockInPlace(blocks, reference, position)
        );
      }
      moveBlockRelative(
        tids: Dynamic,
        referenceTid: Dynamic,
        position: Dynamic,
      ): Dynamic {
        if (!this.canMoveBlockRelative(tids, referenceTid, position)) return false;
        let blocks: Dynamic = this.blockEls(tids),
          reference: Dynamic = this.element(referenceTid),
          newParent: Dynamic,
          beforeNode: Dynamic;
        if (position === "into") {
          newParent = reference;
          beforeNode = null;
        } else
          for (
            newParent = reference.parentNode,
              beforeNode = position === "before" ? reference : reference.nextSibling;
            beforeNode && blocks.includes(beforeNode);

          )
            beforeNode = beforeNode.nextSibling;
        for (let block of blocks as Dynamic)
          newParent.insertBefore(block, beforeNode);
        editorAssert(
          blocks.every(
            (block?: Dynamic): Dynamic => block.parentNode === newParent,
          ),
          `moveBlockRelative(${tids.join(",")} ${position} ${referenceTid}) did not land together`,
        );
        return true;
      }
      canMoveBlockRelative(
        tids: Dynamic,
        referenceTid: Dynamic,
        position: Dynamic,
      ): Dynamic {
        let blocks: Dynamic = this.blockEls(tids);
        if (!blocks || position === "root-end" || referenceTid == null) return false;
        let reference: Dynamic = this.element(referenceTid);
        if (
          !reference ||
          blocks.some((block?: Dynamic): Dynamic => block.contains(reference)) ||
          this.blockInPlace(blocks, reference, position)
        )
          return false;
        if (position === "into")
          return blocks.every(
            (block?: Dynamic): Dynamic =>
              canContainHtmlTag(reference.tagName, block.tagName),
          );
        if (!reference.parentNode) return false;
        let parentTagName: Dynamic =
          reference.parentNode instanceof Element
            ? reference.parentNode.tagName
            : null;
        return (
          parentTagName == null ||
          blocks.every(
            (block?: Dynamic): Dynamic =>
              canContainHtmlTag(parentTagName, block.tagName),
          )
        );
      }
      canMoveRelative(
        tid: Dynamic,
        referenceTid: Dynamic,
        position: Dynamic,
      ): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        if (position === "root-end" || referenceTid == null) return true;
        let reference: Dynamic = this.element(referenceTid);
        return !reference ||
          reference === element ||
          this.isWithin(tid, referenceTid) ||
          this.isInPlace(tid, referenceTid, position)
          ? false
          : position === "into"
            ? canContainHtmlTag(reference.tagName, element.tagName)
            : reference.parentNode != null;
      }
      moveRelative(
        tid: Dynamic,
        referenceTid: Dynamic,
        position: Dynamic,
      ): Dynamic {
        if (!this.canMoveRelative(tid, referenceTid, position)) return false;
        let element: Dynamic = this.element(tid);
        if (position === "root-end" || referenceTid == null) {
          this.tpl.content.insertBefore(element, this.trailingHelmet());
          return true;
        }
        let reference: Dynamic = this.element(referenceTid);
        position === "into"
          ? (reference.appendChild(element),
            editorAssert(
              element.parentElement === reference,
              `moveRelative(${tid} into ${referenceTid}) did not land in the target`,
            ))
          : position === "before"
            ? reference.parentNode.insertBefore(element, reference)
            : reference.parentNode.insertBefore(element, reference.nextSibling);
        (position === "before" || position === "after") &&
          editorAssert(
            element.parentNode === reference.parentNode,
            `moveRelative(${tid} ${position} ${referenceTid}) did not land beside the target`,
          );
        return true;
      }
      helmetClassRules(): Dynamic {
        if (this.classRuleCache) return this.classRuleCache;
        let text: Dynamic = "";
        for (let style of this.tpl.content.querySelectorAll(
          "sc-helmet style",
        ) as Dynamic)
          text +=
            (style.textContent ?? "") +
            `
`;
        let rules: Dynamic = parseUtilityClasses(text),
          hasAtomics: Dynamic = !!this.tpl.content.querySelector(
            "sc-helmet[data-dc-atomics]",
          );
        this.classRuleCache = hasAtomics
          ? [...parseUtilityClassesValue, ...rules]
          : rules;
        return this.classRuleCache;
      }
      ancestorClassesOf(element: Dynamic): Dynamic {
        let classNames: Dynamic = new Set(),
          parentElement: Dynamic = element.parentElement;
        for (; parentElement; ) {
          let attribute: Dynamic = parentElement.getAttribute("class");
          if (attribute)
            for (let className of attribute.split(/\s+/) as Dynamic)
              className && classNames.add(className);
          parentElement = parentElement.parentElement;
        }
        return classNames;
      }
      effectiveStyleFor(element: Dynamic): Dynamic {
        let inlineStyle: Dynamic = element.getAttribute("style") ?? "",
          classes: Dynamic = (element.getAttribute("class") ?? "").trim();
        return classes === ""
          ? inlineStyle
          : serializeStyleDeclarations(
              this.effectiveDeclsFor(element, classes, inlineStyle),
            );
      }
      effectiveDeclsFor(
        element: Dynamic,
        classes: Dynamic,
        inlineStyle: Dynamic,
      ): Dynamic {
        return mergeAuthoredStyle(
          this.helmetClassRules(),
          classes.split(/\s+/),
          inlineStyle,
          this.ancestorClassesOf(element),
        );
      }
      inlineStyleValue(tid: Dynamic, property: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return element
          ? getStyleProperty(element.getAttribute("style"), property)
          : "";
      }
      inlineStyleAttr(tid: Dynamic): Dynamic {
        return this.element(tid)?.getAttribute("style") ?? "";
      }
      anyHasInlineDecl(tids: Dynamic, property: Dynamic): Dynamic {
        let normalizedProperty: Dynamic = normalizeCssProperty(property);
        return tids.some((tid?: Dynamic): Dynamic => {
          let declarations: Dynamic = parseStyleDeclarations(
            this.inlineStyleAttr(tid),
          );
          return (
            declarations.some(
              (declaration?: Dynamic): Dynamic => declaration.prop === normalizedProperty,
            ) ||
            expandCssDeclarations(declarations).some(
              (declaration?: Dynamic): Dynamic => declaration.prop === normalizedProperty,
            )
          );
        });
      }
      hasAuthoredStyle(tid: Dynamic, property: Dynamic): Dynamic {
        let normalizedProperty: Dynamic = normalizeCssProperty(property);
        return expandCssDeclarations(
          parseStyleDeclarations(this.effectiveStyleAttr(tid)),
        ).some((declaration?: Dynamic): Dynamic => declaration.prop === normalizedProperty);
      }
      effectiveStyleAttr(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return element ? this.effectiveStyleFor(element) : "";
      }
      effectiveStyleValue(tid: Dynamic, property: Dynamic): Dynamic {
        return getStyleProperty(
          this.effectiveStyleAttr(tid),
          property,
        );
      }
      classSources(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return {};
        let classes: Dynamic = (element.getAttribute("class") ?? "").trim();
        return classes === ""
          ? {}
          : getCssPropertySources(
              this.effectiveDeclsFor(
                element,
                classes,
                element.getAttribute("style") ?? "",
              ),
            );
      }
      classOnlyStyleAttr(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return "";
        let classes: Dynamic = (element.getAttribute("class") ?? "").trim();
        return classes === ""
          ? ""
          : serializeStyleDeclarations(
              this.effectiveDeclsFor(element, classes, ""),
            );
      }
      inferDisplayValue(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return null;
        let inlineProps: Dynamic = new Set(
            parseStyleDeclarations(
              element.getAttribute("style"),
            ).map((declaration?: Dynamic): Dynamic => declaration.prop),
          ),
          hasAny: Dynamic = (...props: Dynamic[]): Dynamic =>
            props.some((prop?: Dynamic): Dynamic => inlineProps.has(prop));
        return hasAny(
          "grid",
          "grid-template",
          "grid-template-columns",
          "grid-template-rows",
          "grid-template-areas",
          "grid-auto-columns",
          "grid-auto-rows",
          "grid-auto-flow",
          "justify-items",
        )
          ? "grid"
          : hasAny(
                "flex-direction",
                "flex-wrap",
                "flex-flow",
                "justify-content",
                "align-items",
                "align-content",
                "gap",
                "row-gap",
                "column-gap",
              )
            ? "flex"
            : HtmlTagNormalizationSubscribers.has(
                  this.tagName(tid) ?? "",
                )
              ? "inline"
              : null;
      }
      attribute(tid: Dynamic, name: Dynamic): Dynamic {
        return this.element(tid)?.getAttribute(name) ?? null;
      }
      takeMarkerAttr(attributeName: Dynamic, scopeTid: Dynamic): Dynamic {
        let scope: Dynamic = scopeTid != null ? this.element(scopeTid) : null,
          firstTid: Dynamic = null;
        for (let [tid, element] of this.byTid as Dynamic)
          (scope && !scope.contains(element)) ||
            (element.hasAttribute(attributeName) &&
              (firstTid == null && (firstTid = tid),
              element.removeAttribute(attributeName)));
        return firstTid;
      }
      tagName(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return null;
        let rawTag: Dynamic = element.tagName.toLowerCase();
        return rawTag === "sc-helmet"
          ? "helmet"
          : readableTagName(rawTag);
      }
      text(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        return element &&
          (element.tagName === "TEXTAREA" ||
            hasOnlyDirectText(element))
          ? (element.textContent ?? "")
          : null;
      }
      setInnerHtml(tid: Dynamic, html: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        this.classRuleCache = null;
        element.innerHTML = html;
        for (let descendant of element.querySelectorAll("*") as Dynamic) {
          descendant.removeAttribute(DcTplAttribute);
          for (let attribute of [...descendant.attributes] as Dynamic)
            attribute.name.startsWith("data-dc-editor-") &&
              descendant.removeAttribute(attribute.name);
        }
        return true;
      }
      setTagName(tid: Dynamic, tagName: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element || element.tagName.toLowerCase() === tagName) return false;
        let replacement: Dynamic = (document as Dynamic).createElement(tagName);
        for (let attribute of element.attributes as Dynamic)
          replacement.setAttribute(attribute.name, attribute.value);
        for (; element.firstChild; ) replacement.appendChild(element.firstChild);
        element.replaceWith(replacement);
        this.byTid.set(tid, replacement);
        return true;
      }
      innerTemplateHtml(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return "";
        let copy: Dynamic = element.cloneNode(true);
        for (let node of copy.querySelectorAll(
          `[${DcTplAttribute}]`,
        ) as Dynamic)
          node.removeAttribute(DcTplAttribute);
        return fromParserHtml(copy.innerHTML);
      }
      isTextEditable(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        let tagName: Dynamic = this.tagName(tid) ?? "";
        return !canContainHtmlChildren(tagName) ||
          tagName === "helmet" ||
          tagName === "x-import" ||
          tagName === "dc-import" ||
          (HtmlAuthoringTextTspanTextpathSet.has(tagName) &&
            element.children.length > 0)
          ? false
          : isInlineTextContainer(element) &&
              !isIconOnlyElement(element);
      }
      textEditables(): Dynamic {
        let entries: Dynamic = [];
        for (let [tid, element] of this.byTid as Dynamic)
          this.isTextEditable(tid) &&
            entries.push(
              containsTemplateText(element)
                ? {
                    tid: tid,
                    seed: this.innerTemplateHtml(tid),
                  }
                : {
                    tid: tid,
                  },
            );
        return entries;
      }
      isOutlineRow(tid: Dynamic): Dynamic {
        let tagName: Dynamic = this.tagName(tid);
        return tagName != null && this.outlineListsTag(tagName);
      }
      outlineListsTag(tagName: Dynamic): Dynamic {
        return tagName === "helmet"
          ? false
          : !(
              this.raw &&
              (tagName === "script" ||
                tagName === "style" ||
                tagName === "link" ||
                tagName === "noscript" ||
                tagName === "template")
            );
      }
      importTextTargets(tid: Dynamic, importOptions: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element || this.isLoopDriven(tid)) return [];
        let ownTexts: Dynamic = [],
          deepTexts: Dynamic = [],
          collectTexts: Dynamic = (
            parent?: Dynamic,
            isDeep?: Dynamic,
          ): Dynamic => {
            for (let child of parent.childNodes as Dynamic)
              child.nodeType === Node.TEXT_NODE
                ? (isDeep ? deepTexts : ownTexts).push(child.nodeValue ?? "")
                : child.nodeType === Node.ELEMENT_NODE &&
                  collectTexts(child, true);
          };
        collectTexts(element, false);
        ownTexts.filter((text?: Dynamic): Dynamic => text.trim() !== "")
          .length > 1 && deepTexts.push(...ownTexts);
        return componentTextOptions(
          {
            tag: this.tagName(tid),
            text: this.text(tid),
            ownText: ownTexts.join(""),
            deepText: deepTexts,
            attrs: this.attributes(tid),
          },
          importOptions,
        );
      }
      importTexts(importOptions: Dynamic): Dynamic {
        let entries: Dynamic = [];
        for (let [tid, element] of this.byTid as Dynamic) {
          if (element.tagName.toLowerCase() !== "x-import") continue;
          let targets: Dynamic = this.importTextTargets(tid, importOptions);
          targets.length > 0 &&
            entries.push({
              tid: tid,
              targets: targets,
            });
        }
        return entries;
      }
      outline(): Dynamic {
        let shortenText: Dynamic = (text?: Dynamic): Dynamic => {
            let collapsed: Dynamic = text.trim().replace(/\s+/g, " ");
            return collapsed.length > 26 ? `${collapsed.slice(0, 26)}\u2026` : collapsed;
          },
          buildOutlineNode: Dynamic = (element?: Dynamic): Dynamic => {
            let attribute: Dynamic = element.getAttribute(
              DcTplAttribute,
            );
            if (attribute == null) return null;
            let tid: Dynamic = parseInt(attribute, 10),
              tag: Dynamic =
                this.tagName(tid) ?? element.tagName.toLowerCase();
            if (!this.outlineListsTag(tag)) return null;
            let userLabel: Dynamic = element.getAttribute("data-om-label"),
              isImport: Dynamic = tag === "x-import" || tag === "dc-import",
              style: Dynamic = this.effectiveStyleFor(element),
              icon: Dynamic = tagIcon(tag),
              layout: Dynamic = detectContainerLayout(
                element,
                style,
              ),
              isEditableText: Dynamic =
                !layout &&
                tag !== "sc-if" &&
                tag !== "sc-for" &&
                this.isTextEditable(tid),
              kind: Dynamic = "group";
            isImport
              ? (kind = "Component")
              : tag === "sc-if"
                ? (kind = "Conditional group")
                : tag === "sc-for"
                  ? (kind = "Repeating group")
                  : icon
                    ? (kind = icon)
                    : layout === "column"
                      ? (kind = "Column")
                      : layout === "row"
                        ? (kind = "Row")
                        : layout === "grid"
                          ? (kind = "Grid")
                          : (ModelDomTextSubscribers.has(tag) ||
                              (element.children.length === 0 &&
                                (element.textContent ?? "").trim() !== "") ||
                              isEditableText) &&
                            (kind = "Text");
            let component: Dynamic = isImport
                ? parseComponentImport(
                    tag,
                    this.attributes(tid),
                  )
                : null,
              label: Dynamic = userLabel || component?.name || kind,
              glyph: Dynamic = labelToElementKind(kind, layout),
              authoredLabel: Dynamic =
                element.getAttribute("data-label") ||
                element.getAttribute("data-screen-label") ||
                element.getAttribute("aria-label") ||
                element.getAttribute("label") ||
                "",
              slideLabel: Dynamic = slideElementLabel(element),
              detail: Dynamic;
            if (component) detail = userLabel ? component.ref : component.scope;
            else if (isImport)
              detail =
                element.getAttribute("component-from-global-scope") ||
                element.getAttribute("component") ||
                element.getAttribute("name") ||
                (element.getAttribute("from") || "")
                  .split("/")
                  .pop()
                  ?.replace(/(\.dc)?\.[a-z]+(\?.*)?$/i, "") ||
                undefined;
            else if (slideLabel) {
              let titleElement: Dynamic = element.querySelector(
                  "h1, h2, h3, [data-title]",
                ),
                sourceText: Dynamic =
                  authoredLabel ||
                  (titleElement?.textContent ?? "") ||
                  (hasOnlyDirectText(element)
                    ? (element.textContent ?? "")
                    : "");
              detail = sourceText.trim()
                ? `${slideLabel} \xB7 ${shortenText(sourceText)}`
                : slideLabel;
            } else if (authoredLabel) detail = shortenText(authoredLabel);
            else if (hasOnlyDirectText(element) || isEditableText) {
              let ownText: Dynamic = (element.textContent ?? "").trim();
              ownText && (detail = `\u201C${shortenText(ownText)}\u201D`);
            } else if (
              element.children.length > 0 &&
              tag !== "sc-if" &&
              tag !== "sc-for"
            ) {
              let handle: Dynamic = this.handleOf(element),
                previewText: Dynamic = handle.startsWith("<")
                  ? elementTextPreview(element)
                  : "";
              handle.startsWith("<")
                ? previewText && (detail = `\u201C${shortenText(previewText)}\u201D`)
                : (detail = handle);
            }
            let isHidden: Dynamic =
                getStyleProperty(
                  element.getAttribute("style"),
                  "display",
                ).trim() === "none",
              isLocked: Dynamic =
                element.parentElement?.tagName.toLowerCase() === "deck-stage" ||
                element.parentElement?.hasAttribute("data-uneditable") ===
                  true ||
                element.hasAttribute("data-uneditable") ||
                tag === "deck-stage",
              childNodes: Dynamic = [];
            for (let childElement of element.children as Dynamic) {
              let childNode: Dynamic = buildOutlineNode(childElement);
              childNode && childNodes.push(childNode);
            }
            return {
              tid: tid,
              tag: tag,
              kind: kind,
              label: label,
              hidden: isHidden,
              children: childNodes,
              ...(glyph
                ? {
                    glyph: glyph,
                  }
                : {}),
              ...(userLabel
                ? {
                    userLabel: userLabel,
                  }
                : {}),
              ...(detail
                ? {
                    detail: detail,
                  }
                : {}),
              ...(isImport && !component
                ? {
                    grayed: true,
                  }
                : {}),
              ...(component
                ? {
                    component: component,
                  }
                : {}),
              ...(isLocked
                ? {
                    noHide: true,
                  }
                : {}),
            };
          },
          nodes: Dynamic = [];
        for (let rootElement of this.tpl.content.children as Dynamic) {
          let node: Dynamic = buildOutlineNode(rootElement);
          node && nodes.push(node);
        }
        return nodes;
      }
      isTextual(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return false;
        if (ModelDomTextSubscribers.has(this.tagName(tid) ?? ""))
          return true;
        for (let child of element.childNodes as Dynamic)
          if (
            child.nodeType === Node.TEXT_NODE &&
            (child.nodeValue ?? "").trim() !== ""
          )
            return true;
        return false;
      }
      handleOf(element: Dynamic): Dynamic {
        let id: Dynamic = (element.getAttribute("id") ?? "").trim(),
          className: Dynamic = (element.getAttribute("class") ?? "")
            .replace(/\{\{[\s\S]*?\}\}/g, " ")
            .split(/\s+/)
            .find(
              (name?: Dynamic): Dynamic =>
                /^[\w-]+$/.test(name) &&
                !HtmlAuthoringSubscribers.has(name),
            ),
          handle: Dynamic = /^[\w-]+$/.test(id)
            ? "#" + id
            : className
              ? "." + className
              : `<${readableTagName(element.tagName.toLowerCase())}>`;
        return handle.length > 28 ? handle.slice(0, 27) + "\u2026" : handle;
      }
      typeTextRules(css: Dynamic, tagName: Dynamic): Dynamic {
        this.pageTextCache?.css !== css &&
          (this.pageTextCache = {
            css: css,
            byTag: new Map(),
          });
        let entry: Dynamic = this.pageTextCache.byTag.get(tagName);
        entry ||
          ((entry = getUnconditionalCssDeclarations(
            css,
            tagName,
            ModelDomTextSplitValue,
          )),
          this.pageTextCache.byTag.set(tagName, entry));
        return entry;
      }
      inheritedTextStyle(tid: Dynamic): Dynamic {
        let element: Dynamic = this.element(tid);
        if (!element) return [];
        let { css: css }: Dynamic = this.pageSheets(),
          coveredProps: Dynamic = new Set(),
          inherited: Dynamic = [],
          isNeutral: Dynamic = (cssValue?: Dynamic): Dynamic =>
            /^(|inherit|unset)$/i.test(cssValue),
          collectFrom: Dynamic = (
            declarations?: Dynamic,
            source?: Dynamic,
            sourceTid: Dynamic = null,
          ): Dynamic => {
            let entries: Dynamic = new Map(
                declarations.map(
                  (declaration?: Dynamic, index?: Dynamic): Dynamic => [
                    declaration.prop,
                    {
                      v: declaration.value.trim(),
                      i: index,
                    },
                  ],
                ),
              ),
              fontEntry: Dynamic = entries.get("font"),
              fontIndex: Dynamic = fontEntry && !isNeutral(fontEntry.v) ? fontEntry.i : -1;
            for (let prop of ModelDomTextSplitValue as Dynamic) {
              let propEntry: Dynamic = entries.get(prop);
              if (
                coveredProps.has(prop) ||
                !propEntry ||
                isNeutral(propEntry.v) ||
                (propEntry.i < fontIndex &&
                  ModelDomTextSplitValue_2.includes(prop))
              )
                continue;
              let longhandsOverrideFont: Dynamic =
                prop === "font" &&
                ModelDomTextSplitValue_2.some(
                  (longhand?: Dynamic): Dynamic =>
                    coveredProps.has(longhand) ||
                    ((entries.get(longhand)?.i ?? -1) > fontIndex &&
                      !isNeutral(entries.get(longhand).v)),
                );
              coveredProps.add(prop);
              !longhandsOverrideFont &&
                source != null &&
                !/^(initial|revert|revert-layer)$/i.test(propEntry.v) &&
                inherited.push({
                  prop: prop,
                  value: propEntry.v,
                  from: source,
                  fromTid: sourceTid,
                });
            }
            if (fontIndex >= 0)
              for (let prop of ModelDomTextSplitValue_2 as Dynamic)
                coveredProps.add(prop);
          };
        for (
          let ancestor: Dynamic = element;
          ancestor;
          ancestor = ancestor.parentElement
        ) {
          let tagName: Dynamic = readableTagName(
            ancestor.tagName.toLowerCase(),
          );
          if (
            ancestor === element &&
            ModelDomTextButtonInputPattern.test(tagName)
          )
            return [];
          let ancestorTid: Dynamic = parseInt(
            ancestor.getAttribute(DcTplAttribute) ?? "",
            10,
          );
          collectFrom(
            [
              ...this.typeTextRules(css, tagName),
              ...parseStyleDeclarations(
                this.effectiveStyleFor(ancestor),
              ),
            ],
            ancestor === element ? null : this.handleOf(ancestor),
            Number.isNaN(ancestorTid) ? null : ancestorTid,
          );
          if (ModelDomTextButtonInputPattern.test(tagName)) return inherited;
          for (let inheritedProp of (Object.hasOwn(
            ModelDomTextH1H2H3Config,
            tagName,
          )
            ? ModelDomTextH1H2H3Config[tagName]
            : ""
          ).split(" ") as Dynamic)
            coveredProps.add(inheritedProp);
          tagName === "a" && ancestor.hasAttribute("href") && coveredProps.add("color");
        }
        for (let selector of ["body", "html"] as Dynamic)
          collectFrom(this.typeTextRules(css, selector), selector);
        return inherited;
      }
    };
  };
}

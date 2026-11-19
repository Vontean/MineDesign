/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "../css/declarations";
import { DcTplAttribute } from "../html/authoring";
import { parseDcHtmlDocument, replaceDcTemplate } from "../html/dc-document";
import { getDcPropsJson, setDcPropsJson, setDcScript } from "../html/dc-props";
import { DcEditorModel } from "./dc-editor-model";
import { ModelPublishingHandler } from "./publishing";

var ModelThreeWayMergeSCRIPTSTYLETEXTAREASet: Dynamic;
var classifyThreeWayChange: Dynamic;
function describeMergeField(source?: Dynamic): Dynamic {
  return source.kind === "text"
    ? "the text of " + ModelPublishingHandler(source.tag)
    : source.kind === "props-key"
      ? "the \u201C" + source.name + "\u201D setting"
      : "the " +
        source.name.replace(/^style:/, "") +
        " of " +
        ModelPublishingHandler(source.tag);
}
function sameModelStructure(baseModel?: Dynamic, otherModel?: Dynamic): Dynamic {
  if (!baseModel.sameSkeleton(otherModel)) return false;
  let value: Dynamic = baseModel.elementCount();
  for (let index: Dynamic = 0; index < value; index++)
    if (baseModel.parentTid(index) !== otherModel.parentTid(index)) return false;
  return true;
}
function elementAttributeMap(element?: Dynamic): Dynamic {
  let entries: Dynamic = new Map();
  for (let attribute of [...element.attributes] as Dynamic)
    attribute.name !== DcTplAttribute &&
      attribute.name !== "style" &&
      entries.set(attribute.name, attribute.value);
  return entries;
}
function elementStyleMap(element?: Dynamic): Dynamic {
  let entries: Dynamic = new Map();
  for (let declaration of parseStyleDeclarations(
    element.getAttribute("style"),
  ) as Dynamic)
    entries.set(declaration.prop, declaration.value);
  return entries;
}
function elementTextSlots(element?: Dynamic): Dynamic {
  let slots: Dynamic = [""];
  for (let childNode of [...element.childNodes] as Dynamic)
    childNode.nodeType === 1
      ? slots.push("")
      : childNode.nodeType === 3 &&
        (slots[slots.length - 1] += childNode.nodeValue ?? "");
  return slots;
}
function replaceElementTextSlot(
  element?: Dynamic,
  slotIndex?: Dynamic,
  slotText?: Dynamic,
): Dynamic {
  let index: Dynamic = 0,
    hasInserted: Dynamic = false;
  for (let childNode of [...element.childNodes] as Dynamic) {
    if (childNode.nodeType === 1) {
      index === slotIndex &&
        !hasInserted &&
        slotText !== "" &&
        (element.insertBefore(
          element.ownerDocument.createTextNode(slotText),
          childNode,
        ),
        (hasInserted = true));
      index += 1;
      continue;
    }
    childNode.nodeType !== 3 ||
      index !== slotIndex ||
      (!hasInserted && slotText !== ""
        ? ((childNode.nodeValue = slotText), (hasInserted = true))
        : childNode.remove());
  }
  !hasInserted &&
    slotText !== "" &&
    index === slotIndex &&
    element.appendChild(element.ownerDocument.createTextNode(slotText));
}
function mergeDcTemplates(
  baseHtml?: Dynamic,
  mineHtml?: Dynamic,
  theirsHtml?: Dynamic,
  modelOptions?: Dynamic,
): Dynamic {
  let appliedChanges: Dynamic = [],
    overlaps: Dynamic = [],
    guard: Dynamic = {
      baseTheirs: false,
      baseMine: false,
    },
    fail: Dynamic = (reason?: Dynamic): Dynamic => ({
      ok: false,
      why: reason,
      applied: [],
      overlaps: [],
      guard: guard,
    });
  try {
    if (mineHtml === baseHtml)
      return {
        ok: true,
        merged: theirsHtml,
        applied: appliedChanges,
        overlaps: overlaps,
        guard: {
          baseTheirs: true,
          baseMine: true,
        },
      };
    if (theirsHtml === baseHtml || theirsHtml === mineHtml)
      return {
        ok: true,
        merged: mineHtml,
        applied: appliedChanges,
        overlaps: overlaps,
        guard: {
          baseTheirs: true,
          baseMine: true,
        },
      };
    let baseModel: Dynamic = new DcEditorModel(baseHtml, modelOptions),
      mineModel: Dynamic = new DcEditorModel(mineHtml, modelOptions),
      theirsModel: Dynamic = new DcEditorModel(theirsHtml, modelOptions);
    guard.baseTheirs = sameModelStructure(baseModel, theirsModel);
    guard.baseMine = sameModelStructure(baseModel, mineModel);
    if (!guard.baseTheirs)
      return fail(
        "their version added, removed, moved or retagged elements",
      );
    if (!guard.baseMine)
      return fail("my edit added, removed, moved or retagged elements");
    if (
      baseModel.rootText() !== mineModel.rootText() &&
      baseModel.rootText() !== theirsModel.rootText() &&
      mineModel.rootText() !== theirsModel.rootText()
    )
      return fail("both sides changed text at the template root");
    let elementTotal: Dynamic = baseModel.elementCount();
    for (let index: Dynamic = 0; index < elementTotal; index++) {
      let baseElement: Dynamic = baseModel.element(index),
        mineElement: Dynamic = mineModel.element(index),
        theirsElement: Dynamic = theirsModel.element(index),
        tagName: Dynamic = baseElement.tagName.toLowerCase(),
        baseAttributes: Dynamic = elementAttributeMap(baseElement),
        mineAttributes: Dynamic = elementAttributeMap(mineElement),
        theirsAttributes: Dynamic = elementAttributeMap(theirsElement);
      for (let attributeName of new Set([
        ...baseAttributes.keys(),
        ...mineAttributes.keys(),
      ]) as Dynamic) {
        let baseAttribute: Dynamic = baseAttributes.get(attributeName) ?? null,
          mineAttribute: Dynamic = mineAttributes.get(attributeName) ?? null,
          theirsAttribute: Dynamic = theirsAttributes.get(attributeName) ?? null;
        if (baseAttribute === mineAttribute || mineAttribute === theirsAttribute) continue;
        let attributeChange: Dynamic = {
          tid: index,
          tag: tagName,
          kind: "attr",
          name: attributeName,
          from: baseAttribute,
          to: mineAttribute,
        };
        theirsAttribute !== baseAttribute &&
          overlaps.push({
            ...attributeChange,
            theirs: theirsAttribute,
          });
        mineAttribute === null
          ? theirsElement.removeAttribute(attributeName)
          : theirsElement.setAttribute(attributeName, mineAttribute);
        appliedChanges.push(attributeChange);
      }
      let baseStyles: Dynamic = elementStyleMap(baseElement),
        mineStyles: Dynamic = elementStyleMap(mineElement),
        theirsStyles: Dynamic = elementStyleMap(theirsElement);
      for (let styleName of new Set([
        ...baseStyles.keys(),
        ...mineStyles.keys(),
      ]) as Dynamic) {
        let baseStyle: Dynamic = baseStyles.get(styleName) ?? null,
          mineStyle: Dynamic = mineStyles.get(styleName) ?? null,
          theirsStyle: Dynamic = theirsStyles.get(styleName) ?? null;
        if (baseStyle === mineStyle || mineStyle === theirsStyle) continue;
        let styleChange: Dynamic = {
          tid: index,
          tag: tagName,
          kind: "style",
          name: styleName,
          from: baseStyle,
          to: mineStyle,
        };
        theirsStyle !== baseStyle &&
          overlaps.push({
            ...styleChange,
            theirs: theirsStyle,
          });
        theirsModel.setStyleProperty(index, styleName, mineStyle);
        appliedChanges.push(styleChange);
      }
      let baseSlots: Dynamic = elementTextSlots(baseElement),
        mineSlots: Dynamic = elementTextSlots(mineElement),
        theirsSlots: Dynamic = elementTextSlots(theirsElement);
      if (
        baseSlots.length !== mineSlots.length ||
        baseSlots.length !== theirsSlots.length
      )
        return fail(
          "text and elements are interleaved differently in <" +
            tagName +
            ">",
        );
      for (let slotIndex: Dynamic = 0; slotIndex < baseSlots.length; slotIndex++) {
        if (
          baseSlots[slotIndex] === mineSlots[slotIndex] ||
          mineSlots[slotIndex] === theirsSlots[slotIndex]
        )
          continue;
        if (
          ModelThreeWayMergeSCRIPTSTYLETEXTAREASet.has(baseElement.tagName) &&
          theirsSlots[slotIndex] !== baseSlots[slotIndex]
        )
          return fail("both sides rewrote the <" + tagName + "> body");
        let textChange: Dynamic = {
          tid: index,
          tag: tagName,
          kind: "text",
          name: String(slotIndex),
          from: baseSlots[slotIndex],
          to: mineSlots[slotIndex],
        };
        theirsSlots[slotIndex] !== baseSlots[slotIndex] &&
          overlaps.push({
            ...textChange,
            theirs: theirsSlots[slotIndex],
          });
        replaceElementTextSlot(theirsElement, slotIndex, mineSlots[slotIndex]);
        appliedChanges.push(textChange);
      }
    }
    let mergedHtml: Dynamic = theirsModel.serialize();
    mineModel.rootText() !== baseModel.rootText() &&
      theirsModel.rootText() === baseModel.rootText() &&
      appliedChanges.length === 0 &&
      (mergedHtml = mineHtml);
    return {
      ok: true,
      merged: mergedHtml,
      applied: appliedChanges,
      overlaps: overlaps,
      guard: guard,
    };
  } catch (error: Dynamic) {
    return fail(
      "the merge threw: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
function splitDcDocumentRegions(html?: Dynamic): Dynamic {
  let parsedDocument: Dynamic = parseDcHtmlDocument(html);
  if (!parsedDocument) return null;
  let propsJson: Dynamic = getDcPropsJson(html),
    outerHtml: Dynamic = replaceDcTemplate(html, parsedDocument, ""),
    outerDocument: Dynamic = parseDcHtmlDocument(outerHtml);
  outerDocument?.jsMatch && (outerHtml = setDcScript(outerHtml, outerDocument, ""));
  propsJson !== null &&
    (outerHtml = setDcPropsJson(outerHtml, "{}") ?? outerHtml);
  return {
    template: parsedDocument.template,
    js: parsedDocument.js,
    props: propsJson,
    outer: outerHtml,
  };
}
function mergeDcProps(
  baseProps?: Dynamic,
  mineProps?: Dynamic,
  theirsProps?: Dynamic,
  appliedChanges?: Dynamic,
  overlaps?: Dynamic,
): Dynamic {
  let parsePropsObject: Dynamic = (propsText?: Dynamic): Dynamic => {
      if (propsText === null) return {};
      try {
        let parsed: Dynamic = JSON.parse(propsText);
        return parsed !== null &&
          typeof parsed == "object" &&
          !Array.isArray(parsed)
          ? parsed
          : null;
      } catch {
        return null;
      }
    },
    baseObject: Dynamic = parsePropsObject(baseProps),
    mineObject: Dynamic = parsePropsObject(mineProps),
    theirsObject: Dynamic = parsePropsObject(theirsProps);
  if (baseObject === null || mineObject === null || theirsObject === null) return;
  let serializeProp: Dynamic = (propValue?: Dynamic): Dynamic =>
      propValue === undefined ? null : JSON.stringify(propValue),
    mergedObject: Dynamic = {
      ...theirsObject,
    };
  for (let propKey of new Set([
    ...Object.keys(baseObject),
    ...Object.keys(mineObject),
  ]) as Dynamic) {
    let baseValue: Dynamic = serializeProp(baseObject[propKey]),
      mineValue: Dynamic = serializeProp(mineObject[propKey]),
      theirsValue: Dynamic = serializeProp(theirsObject[propKey]);
    if (baseValue === mineValue || mineValue === theirsValue) continue;
    let propChange: Dynamic = {
      tid: -1,
      tag: "script",
      kind: "props-key",
      name: propKey,
      from: baseValue,
      to: mineValue,
    };
    theirsValue !== baseValue &&
      overlaps.push({
        ...propChange,
        theirs: theirsValue,
      });
    mineValue === null ? delete mergedObject[propKey] : (mergedObject[propKey] = mineObject[propKey]);
    appliedChanges.push(propChange);
  }
  return JSON.stringify(mergedObject);
}
function mergeDcDocuments(
  baseHtml?: Dynamic,
  mineHtml?: Dynamic,
  theirsHtml?: Dynamic,
): Dynamic {
  let regions: Dynamic = {
      template: "same",
      script: "same",
      outer: "same",
    },
    fail: Dynamic = (reason?: Dynamic, extraFields?: Dynamic): Dynamic => ({
      ok: false,
      why: reason,
      applied: [],
      overlaps: [],
      guard: {
        baseTheirs: false,
        baseMine: false,
      },
      ...extraFields,
      regions: regions,
    });
  try {
    if (mineHtml === baseHtml || mineHtml === theirsHtml)
      return {
        ok: true,
        merged: theirsHtml,
        applied: [],
        overlaps: [],
        guard: {
          baseTheirs: true,
          baseMine: true,
        },
        regions: {
          template: "theirs",
          script: "theirs",
          outer: "theirs",
        },
      };
    if (theirsHtml === baseHtml)
      return {
        ok: true,
        merged: mineHtml,
        applied: [],
        overlaps: [],
        guard: {
          baseTheirs: true,
          baseMine: true,
        },
        regions: {
          template: "mine",
          script: "mine",
          outer: "mine",
        },
      };
    let baseRegions: Dynamic = splitDcDocumentRegions(baseHtml),
      mineRegions: Dynamic = splitDcDocumentRegions(mineHtml),
      theirsRegions: Dynamic = splitDcDocumentRegions(theirsHtml);
    if (!baseRegions || !mineRegions || !theirsRegions)
      return fail("not a parseable .dc.html on every side");
    let appliedChanges: Dynamic = [],
      overlaps: Dynamic = [],
      guard: Dynamic = {
        baseTheirs: true,
        baseMine: true,
      },
      scriptChange: Dynamic = classifyThreeWayChange(
        baseRegions.js,
        mineRegions.js,
        theirsRegions.js,
      );
    if (scriptChange === "both")
      return fail("both sides rewrote the logic script");
    regions.script = scriptChange;
    let outerChange: Dynamic = classifyThreeWayChange(
      baseRegions.outer,
      mineRegions.outer,
      theirsRegions.outer,
    );
    if (outerChange === "both")
      return fail(
        "both sides changed the document outside the template (head or script tag)",
      );
    let propsChange: Dynamic = classifyThreeWayChange(
        baseRegions.props,
        mineRegions.props,
        theirsRegions.props,
      ),
      mergedProps: Dynamic = propsChange === "mine" ? mineRegions.props : theirsRegions.props;
    if (
      propsChange === "both" &&
      ((mergedProps = mergeDcProps(
        baseRegions.props,
        mineRegions.props,
        theirsRegions.props,
        appliedChanges,
        overlaps,
      )),
      mergedProps === undefined)
    )
      return fail(
        "both sides changed data-props and one of them is not a JSON object",
      );
    regions.outer =
      propsChange === "both"
        ? "merged"
        : outerChange === "same"
          ? propsChange === "same"
            ? "same"
            : propsChange
          : outerChange === propsChange || propsChange === "same"
            ? outerChange
            : "merged";
    let template: Dynamic = theirsRegions.template,
      templateChange: Dynamic = classifyThreeWayChange(
        baseRegions.template,
        mineRegions.template,
        theirsRegions.template,
      );
    regions.template = templateChange === "both" ? "merged" : templateChange;
    if (templateChange === "mine") template = mineRegions.template;
    else if (templateChange === "both") {
      let templateMerge: Dynamic = mergeDcTemplates(
        baseRegions.template,
        mineRegions.template,
        theirsRegions.template,
      );
      guard = templateMerge.guard;
      if (!templateMerge.ok || templateMerge.merged === undefined)
        return fail(templateMerge.why ?? "the template could not be merged", {
          guard: guard,
        });
      template = templateMerge.merged;
      appliedChanges.push(...templateMerge.applied);
      overlaps.push(...templateMerge.overlaps);
    }
    let composedHtml: Dynamic = outerChange === "mine" ? mineHtml : theirsHtml,
      keptDocument: Dynamic = parseDcHtmlDocument(composedHtml);
    if (!keptDocument) return fail("the kept document did not parse");
    composedHtml = replaceDcTemplate(composedHtml, keptDocument, template);
    let keptScript: Dynamic = scriptChange === "mine" ? mineRegions.js : theirsRegions.js,
      composedDocument: Dynamic = parseDcHtmlDocument(composedHtml);
    if (!composedDocument) return fail("the composed document did not parse");
    composedDocument.js !== keptScript &&
      (composedHtml = setDcScript(composedHtml, composedDocument, keptScript));
    getDcPropsJson(composedHtml) !== (mergedProps ?? null) &&
      mergedProps !== null &&
      mergedProps !== undefined &&
      (composedHtml = setDcPropsJson(composedHtml, mergedProps) ?? composedHtml);
    let roundTrip: Dynamic = splitDcDocumentRegions(composedHtml);
    return !roundTrip || roundTrip.template !== template || roundTrip.js !== keptScript
      ? fail("the composed document did not round-trip")
      : {
          ok: true,
          merged: composedHtml,
          applied: appliedChanges,
          overlaps: overlaps,
          guard: guard,
          regions: regions,
        };
  } catch (error: Dynamic) {
    return fail(
      "the merge threw: " +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
export {
  classifyThreeWayChange,
  describeMergeField,
  elementAttributeMap,
  elementStyleMap,
  elementTextSlots,
  mergeDcDocuments,
  mergeDcProps,
  mergeDcTemplates,
  ModelThreeWayMergeSCRIPTSTYLETEXTAREASet,
  replaceElementTextSlot,
  sameModelStructure,
  splitDcDocumentRegions,
};
export function installEditorModelThreeWayMerge(): () => void {
  return () => {
    ModelThreeWayMergeSCRIPTSTYLETEXTAREASet = new Set([
      "SCRIPT",
      "STYLE",
      "TEXTAREA",
      "TITLE",
    ]);
    classifyThreeWayChange = (
      base?: Dynamic,
      mine?: Dynamic,
      theirs?: Dynamic,
    ): Dynamic =>
      mine === theirs
        ? mine === base
          ? "same"
          : "theirs"
        : mine === base
          ? "theirs"
          : theirs === base
            ? "mine"
            : "both";
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { DcTplAttribute } from "../html/authoring";

var ModelSelectionRelocationLimit: Dynamic;
var ModelSelectionRelocationLimit_2: Dynamic;
var ModelSelectionRelocationImul: Dynamic;
var ModelSelectionRelocationReplace: Dynamic;
var ModelSelectionRelocationElementCache: Dynamic;
var ModelSelectionRelocationConstant: Dynamic;
var ModelSelectionRelocationMap: Dynamic;
var ModelSelectionRelocationIncludes: Dynamic;
function indexModelForRelocation(model?: Dynamic): Dynamic {
  let elementCount: Dynamic = model.elementCount(),
    parentIds: Dynamic = [],
    depths: Dynamic = [],
    tagNames: Dynamic = [],
    ownSignatures: Dynamic = [],
    exactSignatures: Dynamic = [],
    isPreformatted: Dynamic = [],
    keys: Dynamic = [],
    subtreeEnds: Dynamic = new Array(elementCount).fill(0);
  for (let index: Dynamic = 0; index < elementCount; index++) {
    let parentId: Dynamic = model.parentTid(index),
      element: Dynamic = model.element(index);
    parentIds.push(parentId);
    depths.push(parentId == null ? 0 : depths[parentId] + 1);
    tagNames.push(element?.tagName ?? "");
    if (parentId != null && !(parentId < index))
      throw new Error(
        "element " +
          index +
          " has parent " +
          parentId +
          ": not numbered in document order",
      );
    let ownSignature: Dynamic = ModelSelectionRelocationReplace(tagNames[index]);
    for (let attribute of (element ? [...element.attributes] : []) as Dynamic)
      attribute.name !== DcTplAttribute &&
        (ownSignature +=
          "" +
          ModelSelectionRelocationReplace(attribute.name) +
          "=" +
          ModelSelectionRelocationReplace(attribute.value));
    let exactSignature: Dynamic = ownSignature;
    isPreformatted.push(
      /^(pre|textarea)$/i.test(tagNames[index]) ||
        (parentId != null && isPreformatted[parentId]),
    );
    if (element && !/^(style|script)$/i.test(tagNames[index])) {
      let text: Dynamic = "",
        childElementCount: Dynamic = 0,
        flushText: Dynamic = (): Dynamic => {
          let normalizedText: Dynamic = isPreformatted[index]
            ? text
            : text.replace(/[ \t\n\f\r]+/g, " ").replace(/^ | $/g, "");
          normalizedText !== "" &&
            ((ownSignature += "" + ModelSelectionRelocationReplace(normalizedText)),
            (exactSignature +=
              "" + ModelSelectionRelocationReplace(normalizedText) + "" + childElementCount));
          text = "";
        };
      for (let childNode of [...element.childNodes] as Dynamic)
        childNode.nodeType === 3
          ? (text += childNode.nodeValue ?? "")
          : childNode.nodeType === 1 && (flushText(), childElementCount++);
      flushText();
    }
    ownSignatures.push(ownSignature);
    exactSignatures.push(exactSignature);
    keys.push(depths[index] + "" + exactSignature);
  }
  for (let id: Dynamic = elementCount - 1; id >= 0; id--) {
    subtreeEnds[id] = Math.max(subtreeEnds[id], id + 1);
    parentIds[id] != null &&
      (subtreeEnds[parentIds[id]] = Math.max(
        subtreeEnds[parentIds[id]],
        subtreeEnds[id],
      ));
  }
  let signatureCache: Dynamic = new Map(),
    getSubtreeSignature: Dynamic = (id?: Dynamic): Dynamic => {
      let signature: Dynamic = signatureCache.get(id);
      if (signature == null) {
        signature = "";
        for (let descendantId: Dynamic = id; descendantId < subtreeEnds[id]; descendantId++)
          signature +=
            depths[descendantId] - depths[id] + "" + exactSignatures[descendantId] + "\0";
        signatureCache.set(id, signature);
      }
      return signature;
    },
    isBareSubtree: Dynamic = (id?: Dynamic): Dynamic => {
      for (let descendantId: Dynamic = id; descendantId < subtreeEnds[id]; descendantId++)
        if (
          ownSignatures[descendantId] !== ModelSelectionRelocationReplace(tagNames[descendantId])
        )
          return false;
      return true;
    },
    withSourceCache: Dynamic = new Map();
  return {
    n: elementCount,
    parent: parentIds,
    depth: depths,
    end: subtreeEnds,
    own: ownSignatures,
    exact: exactSignatures,
    key: keys,
    sig: getSubtreeSignature,
    bare: isBareSubtree,
    withSource: (
      signature?: Dynamic,
      tagName?: Dynamic,
      subtreeSize?: Dynamic,
    ): Dynamic => {
      let cacheKey: Dynamic = tagName + " " + subtreeSize,
        bucketsBySignature: Dynamic = withSourceCache.get(cacheKey);
      if (!bucketsBySignature) {
        bucketsBySignature = new Map();
        for (let index: Dynamic = 0; index < elementCount; index++) {
          if (subtreeEnds[index] - index !== subtreeSize || tagNames[index] !== tagName)
            continue;
          let bucket: Dynamic = bucketsBySignature.get(getSubtreeSignature(index));
          bucket ? bucket.push(index) : bucketsBySignature.set(getSubtreeSignature(index), [index]);
        }
        withSourceCache.set(cacheKey, bucketsBySignature);
      }
      return bucketsBySignature.get(signature) ?? [];
    },
    tag: (id?: Dynamic): Dynamic => tagNames[id] ?? "",
    kids: (id?: Dynamic): Dynamic => model.childTids(id),
  };
}
function buildModelSignatureLookup(
  previousIndex?: Dynamic,
  currentIndex?: Dynamic,
): Dynamic {
  let lookupCache: Dynamic = new Map();
  return (id?: Dynamic): Dynamic => {
    if (!lookupCache.has(id)) {
      let signature: Dynamic = previousIndex.sig(id),
        candidates: Dynamic =
          (previousIndex.bare(id)
            ? []
            : previousIndex.withSource(
                signature,
                previousIndex.tag(id),
                previousIndex.end[id] - id,
              )
          ).length === 1
            ? currentIndex.withSource(
                signature,
                previousIndex.tag(id),
                previousIndex.end[id] - id,
              )
            : [];
      lookupCache.set(id, candidates.length === 1 ? candidates[0] : null);
    }
    return lookupCache.get(id);
  };
}
function getModelRelocationPair(previousModel?: Dynamic, currentModel?: Dynamic): Dynamic {
  let cachedEntry: Dynamic = ModelSelectionRelocationElementCache.get(previousModel);
  if (cachedEntry?.nowModel === currentModel) return cachedEntry.pair;
  let previousIndex: Dynamic = indexModelForRelocation(previousModel),
    currentIndex: Dynamic = indexModelForRelocation(currentModel),
    headLength: Dynamic = 0;
  for (
    ;
    headLength < previousIndex.n &&
    headLength < currentIndex.n &&
    previousIndex.key[headLength] === currentIndex.key[headLength];

  )
    headLength++;
  let tailLength: Dynamic = 0;
  for (
    ;
    tailLength < previousIndex.n &&
    tailLength < currentIndex.n &&
    previousIndex.key[previousIndex.n - 1 - tailLength] === currentIndex.key[currentIndex.n - 1 - tailLength];

  )
    tailLength++;
  let pair: Dynamic = {
    prev: previousIndex,
    now: currentIndex,
    to: buildModelSignatureLookup(previousIndex, currentIndex),
    head: headLength,
    tail: tailLength,
  };
  ModelSelectionRelocationElementCache.set(previousModel, {
    nowModel: currentModel,
    pair: pair,
  });
  return pair;
}
function relocateModelElementIds(
  previousModel?: Dynamic,
  currentModel?: Dynamic,
  elementIds?: Dynamic,
): Dynamic {
  if (previousModel === currentModel) return [...elementIds];
  try {
    let uniqueIds: Dynamic = [...new Set(elementIds)],
      relocatedIds: Dynamic = ModelSelectionRelocationMap(
        matchModelElementIds(previousModel, currentModel, uniqueIds),
      );
    return elementIds.map(
      (id?: Dynamic): Dynamic => relocatedIds[uniqueIds.indexOf(id)],
    );
  } catch (error: Dynamic) {
    ModelSelectionRelocationConstant++;
    console.warn(
      "[dc-editor] the selection could not be followed, so it is dropped:",
      error,
    );
    return elementIds.map((): Dynamic => null);
  }
}
function matchModelElementIds(
  previousModel?: Dynamic,
  currentModel?: Dynamic,
  elementIds?: Dynamic,
): Dynamic {
  if (
    previousModel.elementCount() > ModelSelectionRelocationLimit ||
    currentModel.elementCount() > ModelSelectionRelocationLimit
  )
    return elementIds.map((): Dynamic => null);
  let {
      prev: previousIndex,
      now: currentIndex,
      to: lookupBySignature,
      head: headLength,
      tail: tailLength,
    }: Dynamic = getModelRelocationPair(previousModel, currentModel),
    sizeDelta: Dynamic = currentIndex.n - previousIndex.n,
    findMatchingSubtrees: Dynamic = (
      sourceIndex?: Dynamic,
      sourceId?: Dynamic,
      targetIndex?: Dynamic,
      targetParentId?: Dynamic,
    ): Dynamic => {
      let subtreeSize: Dynamic = sourceIndex.end[sourceId] - sourceId,
        matches: Dynamic = [];
      for (
        let candidateId: Dynamic = targetParentId + 1;
        candidateId + subtreeSize <= targetIndex.end[targetParentId];
        candidateId++
      ) {
        if (targetIndex.end[candidateId] - candidateId !== subtreeSize) continue;
        let isMatch: Dynamic = true;
        for (let index: Dynamic = 0; isMatch && index < subtreeSize; index++)
          isMatch =
            targetIndex.exact[candidateId + index] ===
              sourceIndex.exact[sourceId + index] &&
            targetIndex.depth[candidateId + index] - targetIndex.depth[candidateId] ===
              sourceIndex.depth[sourceId + index] - sourceIndex.depth[sourceId];
        isMatch && matches.push(candidateId);
      }
      return matches;
    },
    alignedIdCache: Dynamic = new Map(),
    getAlignedId: Dynamic = (id?: Dynamic): Dynamic => (
      alignedIdCache.has(id) || alignedIdCache.set(id, computeAlignedId(id)),
      alignedIdCache.get(id)
    ),
    computeAlignedId: Dynamic = (id?: Dynamic): Dynamic => {
      if (
        !(
          id <= headLength &&
          previousIndex.n - previousIndex.end[id] <= tailLength &&
          id < currentIndex.n &&
          currentIndex.depth[id] === previousIndex.depth[id] &&
          currentIndex.end[id] === currentIndex.n - (previousIndex.n - previousIndex.end[id])
        )
      )
        return null;
      let isOwnUnchanged: Dynamic = currentIndex.own[id] === previousIndex.own[id],
        movedMatches: Dynamic = findMatchingSubtrees(previousIndex, id, currentIndex, id);
      if (movedMatches.length > 0)
        return movedMatches.length === 1 && !isOwnUnchanged && !previousIndex.bare(id)
          ? movedMatches[0]
          : null;
      if (
        currentIndex.tag(id) !== previousIndex.tag(id) ||
        findMatchingSubtrees(currentIndex, id, previousIndex, id).length > 0
      )
        return null;
      for (
        let descendantId: Dynamic = id + 1;
        descendantId < currentIndex.end[id];
        descendantId++
      )
        if (
          currentIndex.own[descendantId] === previousIndex.own[id] &&
          !(descendantId < headLength || descendantId >= currentIndex.n - tailLength)
        )
          return null;
      if (!isOwnUnchanged) {
        for (
          let descendantId: Dynamic = id + 1;
          descendantId < previousIndex.end[id];
          descendantId++
        )
          if (
            previousIndex.own[descendantId] === currentIndex.own[id] &&
            !(descendantId >= previousIndex.n - tailLength)
          )
            return null;
      }
      return id;
    },
    relocateByPosition: Dynamic = (id?: Dynamic): Dynamic => {
      if (
        previousIndex.end[id] <= headLength &&
        currentIndex.end[id] === previousIndex.end[id]
      )
        return id;
      if (previousIndex.n - id > tailLength) return null;
      for (
        let ancestorId: Dynamic = previousIndex.parent[id];
        ancestorId != null;
        ancestorId = previousIndex.parent[ancestorId]
      )
        if (!(ancestorId >= previousIndex.n - tailLength || getAlignedId(ancestorId) === ancestorId))
          return null;
      return id + sizeDelta;
    },
    relocateByAncestor: Dynamic = (id?: Dynamic): Dynamic => {
      for (
        let ancestorId: Dynamic = id;
        ancestorId != null;
        ancestorId = previousIndex.parent[ancestorId]
      )
        if (previousIndex.kids(ancestorId).length >= 2 && lookupBySignature(ancestorId) != null)
          return lookupBySignature(ancestorId) + (id - ancestorId);
      return null;
    };
  return elementIds.map((id?: Dynamic): Dynamic => {
    if (!(id >= 0 && id < previousIndex.n)) return null;
    let relocatedId: Dynamic =
      relocateByPosition(id) ?? relocateByAncestor(id) ?? getAlignedId(id);
    return relocatedId != null &&
      /^(style|script)$/i.test(previousIndex.tag(id)) &&
      previousModel.element(id)?.textContent !==
        currentModel.element(relocatedId)?.textContent
      ? null
      : relocatedId;
  });
}
function unchangedAncestorRelocation(
  { prev: prev, now: now }: Dynamic,
  elementId?: Dynamic,
): Dynamic {
  let isUniqueSubtree: Dynamic = (id?: Dynamic): Dynamic =>
      prev.withSource(
        prev.sig(id),
        prev.tag(id),
        prev.end[id] - id,
      ).length === 1,
    ancestorId: Dynamic = prev.parent[elementId] ?? null;
  for (
    ;
    ancestorId !== null && (prev.kids(ancestorId).length < 2 || !isUniqueSubtree(ancestorId));

  )
    ancestorId = prev.parent[ancestorId] ?? null;
  let anchorId: Dynamic = ancestorId ?? elementId;
  return (
    isUniqueSubtree(anchorId) &&
    anchorId < now.n &&
    prev.depth[anchorId] === now.depth[anchorId] &&
    prev.sig(anchorId) === now.sig(anchorId)
  );
}
function hasSameModelPrefix(
  { prev: prev, now: now }: Dynamic,
  elementId?: Dynamic,
): Dynamic {
  if (elementId >= now.n) return false;
  let previousOwnSignatures: Dynamic = new Set(
    prev.own.map(ModelSelectionRelocationIncludes),
  );
  for (let index: Dynamic = 0; index <= elementId; index++) {
    if (
      prev.depth[index] !== now.depth[index] ||
      prev.tag(index) !== now.tag(index)
    )
      return false;
    let ownSignature: Dynamic = ModelSelectionRelocationIncludes(now.own[index]);
    if (
      ownSignature !== "" &&
      ownSignature !== ModelSelectionRelocationIncludes(prev.own[index]) &&
      previousOwnSignatures.has(ownSignature)
    )
      return false;
  }
  return true;
}
function relocateTextElementId(
  previousModel?: Dynamic,
  currentModel?: Dynamic,
  elementId?: Dynamic,
): Dynamic {
  try {
    if (
      Math.max(previousModel.elementCount(), currentModel.elementCount()) >
      ModelSelectionRelocationLimit
    )
      return null;
    ModelSelectionRelocationElementCache.delete(previousModel);
    let pair: Dynamic = getModelRelocationPair(previousModel, currentModel);
    return Number.isInteger(elementId) && elementId >= 0 && elementId < pair.prev.n
      ? unchangedAncestorRelocation(pair, elementId)
        ? elementId
        : (relocateModelElementIds(previousModel, currentModel, [elementId])[0] ??
          pair.to(elementId) ??
          (hasSameModelPrefix(pair, elementId) ? elementId : null))
      : null;
  } catch (error: Dynamic) {
    ModelSelectionRelocationConstant++;
    console.warn(
      "[dc-editor] could not work out where the typed text belongs, so it is treated as having no certain place:",
      error,
    );
    return null;
  }
}
function relocateTextEditTarget(
  previousModel?: Dynamic,
  currentModel?: Dynamic,
  elementId?: Dynamic,
  canEditText: Dynamic = (model?: Dynamic, id?: Dynamic): Dynamic =>
    model.isTextEditable(id),
): Dynamic {
  let relocatedId: Dynamic = previousModel
    ? relocateTextElementId(previousModel, currentModel, elementId)
    : elementId;
  return previousModel && (relocatedId === null || !canEditText(currentModel, relocatedId))
    ? {
        into: previousModel,
        tid: elementId,
      }
    : {
        into: currentModel,
        tid: relocatedId ?? elementId,
      };
}
function relocateSingleElementId(
  previousModel?: Dynamic,
  currentModel?: Dynamic,
  elementId?: Dynamic,
): Dynamic {
  return previousModel
    ? (ModelSelectionRelocationElementCache.delete(previousModel),
      relocateModelElementIds(previousModel, currentModel, [elementId])[0] ?? null)
    : elementId;
}
function relocateSelectedTextElement(
  previousModel?: Dynamic,
  currentModel?: Dynamic,
  selectedId?: Dynamic,
  textEditId?: Dynamic,
): Dynamic {
  let textEditTarget: Dynamic =
    textEditId === null ? null : relocateTextEditTarget(previousModel, currentModel, textEditId);
  if (textEditTarget && textEditId === selectedId)
    return textEditTarget.into === currentModel ? textEditTarget.tid : null;
  let relocatedSelectedId: Dynamic = relocateSingleElementId(previousModel, currentModel, selectedId);
  return relocatedSelectedId !== null &&
    textEditTarget?.into === currentModel &&
    !currentModel.element(relocatedSelectedId)?.contains(currentModel.element(textEditTarget.tid) ?? null)
    ? null
    : relocatedSelectedId;
}
function relocateSelectionRef(
  selectionRef?: Dynamic,
  ownerName?: Dynamic,
  previousModel?: Dynamic,
  currentModel?: Dynamic,
): Dynamic {
  let current: Dynamic = selectionRef.current;
  if (current?.name !== ownerName || previousModel === currentModel) return;
  let relocatedIds: Dynamic = previousModel
    ? relocateModelElementIds(previousModel, currentModel, current.tids).filter(
        (id?: Dynamic): Dynamic => id != null,
      )
    : [];
  selectionRef.current =
    relocatedIds.length > 0
      ? {
          ...current,
          tids: relocatedIds,
        }
      : null;
  return selectionRef.current;
}
function latestSelectionSequence(
  currentSelection?: Dynamic,
  candidateSelection?: Dynamic,
  expectedSeq?: Dynamic,
): Dynamic {
  return candidateSelection?.seq === expectedSeq ? candidateSelection : currentSelection;
}
function isOtherSelection(
  selection?: Dynamic,
  ownerName?: Dynamic,
  elementId?: Dynamic,
): Dynamic {
  return (
    selection === null ||
    (selection.name === ownerName &&
      !(selection.tids.length === 1 && selection.tids[0] === elementId))
  );
}
function deferSelectionClear(
  selectionRef?: Dynamic,
  token?: Dynamic,
  onClear?: Dynamic,
  delayMs?: Dynamic,
): Dynamic {
  let clearIfCurrent: Dynamic = (clearToken?: Dynamic): Dynamic => {
    clearToken !== token ||
      selectionRef.current !== clearIfCurrent ||
      ((selectionRef.current = null), onClear());
  };
  selectionRef.current = clearIfCurrent;
  delayMs != null && setTimeout((): Dynamic => clearIfCurrent(token), delayMs);
}
function modelSelectionIdentityGuard(
  model?: Dynamic,
  elementIds?: Dynamic,
): Dynamic {
  let elements: Dynamic = elementIds.map(
    (id?: Dynamic): Dynamic => model.element(id),
  );
  return (currentModel?: Dynamic): Dynamic =>
    currentModel === model &&
    elementIds.every(
      (id?: Dynamic, index?: Dynamic): Dynamic =>
        model.element(id) === elements[index],
    );
}
export {
  buildModelSignatureLookup,
  deferSelectionClear,
  getModelRelocationPair,
  hasSameModelPrefix,
  indexModelForRelocation,
  isOtherSelection,
  latestSelectionSequence,
  matchModelElementIds,
  modelSelectionIdentityGuard,
  ModelSelectionRelocationConstant,
  ModelSelectionRelocationElementCache,
  ModelSelectionRelocationImul,
  ModelSelectionRelocationIncludes,
  ModelSelectionRelocationLimit,
  ModelSelectionRelocationLimit_2,
  ModelSelectionRelocationMap,
  ModelSelectionRelocationReplace,
  relocateModelElementIds,
  relocateSelectedTextElement,
  relocateSelectionRef,
  relocateSingleElementId,
  relocateTextEditTarget,
  relocateTextElementId,
  unchangedAncestorRelocation,
};
export function installEditorModelSelectionRelocation(): () => void {
  return () => {
    ModelSelectionRelocationLimit = 2e4;
    ModelSelectionRelocationLimit_2 = 1024;
    ModelSelectionRelocationImul = (text?: Dynamic): Dynamic => {
      let hash: Dynamic = 2166136261;
      for (let index: Dynamic = 0; index < text.length; index++)
        hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
      return "\\#" + text.length + "#" + (hash >>> 0).toString(36);
    };
    ModelSelectionRelocationReplace = (text?: Dynamic): Dynamic =>
      text.length > ModelSelectionRelocationLimit_2
        ? ModelSelectionRelocationImul(text)
        : text.replace(
            /[\u0000-\u0004\\]/g,
            (char?: Dynamic): Dynamic => "\\" + char.charCodeAt(0),
          );
    ModelSelectionRelocationElementCache = new WeakMap();
    ModelSelectionRelocationConstant = 0;
    ModelSelectionRelocationMap = (ids?: Dynamic): Dynamic =>
      ids.map(
        (id?: Dynamic): Dynamic =>
          id != null && ids.indexOf(id) !== ids.lastIndexOf(id)
            ? null
            : id,
      );
    ModelSelectionRelocationIncludes = (text?: Dynamic): Dynamic =>
      text.includes("") ? text.slice(text.indexOf("")) : "";
  };
}

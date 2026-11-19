import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cssVariableName } from "../../canvas/working-state";
import { normalizeCssColor } from "../../design-system/type-declarations";
import { summarizeContrastResults } from "../color/contrast-ui";
import { evaluateColorContrast, parseRgbaColor } from "../color/contrast";
import { getPropertySpecification } from "../inspector/property-schema";
import { isApplePlatform } from "../keyboard/shortcuts";
import { isEmptyCanvasSelection } from "../selection/canvas-selection";
import { isShapeAnnotation } from "../../platform/file-content";

var AccessibilityAnnouncementsLabel: Dynamic;
var AccessibilityAnnouncementsUndoRedoConfig: Dynamic;
var NothingChangedThatStepNoLongerMessage: Dynamic;
var undoRedoPastTense: Dynamic;
var NothingSelectedMessage: Dynamic;
var copiedAsPngMessage: Dynamic;
var copiedAsSvgMessage: Dynamic;
var conversionFailedMessage: Dynamic;
var exportStillRunningMessage: Dynamic;
var ItsPictureCouldnTBeMadeTryMessage: Dynamic;
var notSelectedAnywhereMessage: Dynamic;
var noWidthOrHeightMessage: Dynamic;
var ItsPageHasNothingToDrawMessage: Dynamic;
var previewStoppedReloadMessage: Dynamic;
var notVisibleMessage: Dynamic;
var pasteHereMessage: Dynamic;
var noteSelectedMessage: Dynamic;
var shapeSelectedMessage: Dynamic;
var pictureSelectedMessage: Dynamic;
var videoSelectedMessage: Dynamic;
var AccessibilityAnnouncementsLimit: Dynamic;
var PressReturnToGoIntoThisMessage: Dynamic;
var ThisIsTheFirstArtboardMessage: Dynamic;
var ThisIsTheLastArtboardMessage: Dynamic;
var ThisIsTheOnlyArtboardMessage: Dynamic;
var AccessibilityAnnouncementsResolvedValue: Dynamic;
var layerNavigationHintMessage: Dynamic;
var AccessibilityAnnouncementsConstant: Dynamic;
var NoLayersInsideThisOneMessage: Dynamic;
var editingTextHintMessage: Dynamic;
var textUpdatedMessage: Dynamic;
var DeletedValue: Dynamic;
var CutValue: Dynamic;
var noteDeletedMessage: Dynamic;
var shapeDeletedMessage: Dynamic;
var pictureDeletedMessage: Dynamic;
var videoDeletedMessage: Dynamic;
var linkRemovedMessage: Dynamic;
var emptyTextBoxRemovedMessage: Dynamic;
var AccessibilityAnnouncementsHrefSrcAltConfig: Dynamic;
var AccessibilityAnnouncementsPattern: Dynamic;
var AccessibilityAnnouncementsPaddingMarginConfig: Dynamic;
var AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig: Dynamic;
var commentModePausedMessage: Dynamic;
var AccessibilityAnnouncementsHandler: Dynamic;
var AccessibilityAnnouncementsReadyUpdatedChangedConfig: Dynamic;
function resolveColorTokenValue(colorReference?: Dynamic, tokens?: Dynamic): Dynamic {
  let tokenName: Dynamic = cssVariableName(colorReference);
  if (!tokenName) return;
  let visitedNames: Dynamic = new Set();
  for (; !visitedNames.has(tokenName); ) {
    visitedNames.add(tokenName);
    let token: Dynamic = tokens.find(
      (candidate?: Dynamic): Dynamic => candidate.name === tokenName,
    );
    if (!token) return;
    let nextName: Dynamic = cssVariableName(token.value);
    if (!nextName) return token.value;
    tokenName = nextName;
  }
}
function contrastTextRole(fontSizePx?: Dynamic, fontWeight?: Dynamic): Dynamic {
  return fontSizePx === null
    ? "text"
    : fontSizePx >= 24 || (fontSizePx >= 18.66 && (fontWeight ?? 400) >= 700)
      ? "largeText"
      : "text";
}
function textContrastContext(
  cssColor?: Dynamic,
  fontSize?: Dynamic,
  fontWeight?: Dynamic,
): Dynamic {
  return {
    against: {
      css: cssColor,
      label: AccessibilityAnnouncementsLabel,
    },
    role: contrastTextRole(fontSize, fontWeight),
  };
}
function resolvedContrastColor(colorValue?: Dynamic, tokens?: Dynamic): Dynamic {
  let resolvedColor: Dynamic = resolveColorTokenValue(colorValue, tokens) ?? colorValue;
  return parseRgbaColor(resolvedColor) !== undefined
    ? resolvedColor
    : normalizeCssColor(resolvedColor);
}
function findOutlineLocation(outline?: Dynamic, targetTid?: Dynamic): Dynamic {
  let searchLevel: Dynamic = (
    nodes?: Dynamic,
    level?: Dynamic,
    parent?: Dynamic,
  ): Dynamic => {
    for (let index: Dynamic = 0; index < nodes.length; index++) {
      let node: Dynamic = nodes[index];
      if (node.tid === targetTid)
        return {
          node: node,
          level: level,
          index: index,
          siblings: nodes,
          parent: parent,
        };
      let found: Dynamic = searchLevel(node.children, level + 1, node);
      if (found) return found;
    }
    return null;
  };
  return searchLevel(outline, 1, null);
}
function adjacentOutlineNode(
  outline?: Dynamic,
  currentTid?: Dynamic,
  direction?: Dynamic,
): Dynamic {
  let currentLocation: Dynamic =
      currentTid == null ? null : findOutlineLocation(outline, currentTid),
    siblings: Dynamic = currentLocation ? currentLocation.siblings : outline;
  if (siblings.length === 0) return null;
  if (direction === "first") return siblings[0];
  if (direction === "last") return siblings[siblings.length - 1];
  if (!currentLocation)
    return direction === "next" ? siblings[0] : siblings[siblings.length - 1];
  let length: Dynamic = siblings.length;
  return siblings[
    (currentLocation.index + (direction === "next" ? 1 : length - 1)) % length
  ];
}
function deepestSingleOutlineNode(nodes?: Dynamic): Dynamic {
  let currentNodes: Dynamic = nodes,
    deepestNode: Dynamic = null;
  for (; currentNodes.length > 0 && ((deepestNode = currentNodes[0]), !(currentNodes.length > 1)); )
    currentNodes = deepestNode.children;
  return deepestNode;
}
function firstNestedOutlineNode(node?: Dynamic): Dynamic {
  return node.children.length === 0
    ? null
    : deepestSingleOutlineNode(node.children);
}
function outlineSiblingPosition(location?: Dynamic): Dynamic {
  return String(location.index + 1) + " of " + String(location.siblings.length);
}
function pageUndoFailureMessage(direction?: Dynamic, isPageRestored?: Dynamic): Dynamic {
  return direction === "redo"
    ? uiMessage("inspector.announcements.couldnTDeleteThePage")
    : isPageRestored
      ? uiMessage("inspector.announcements.thePageIsBackBut")
      : uiMessage("inspector.announcements.couldnTBringThePage");
}
function clipboardActionFailureMessage(
  direction?: Dynamic,
  canvasLimit?: Dynamic,
  sourceElement?: Dynamic,
  customMessage?: Dynamic,
  isPartial: Dynamic = false,
): Dynamic {
  let elementKind: Dynamic =
    sourceElement === undefined
      ? undefined
      : sourceElement.kind === "image"
        ? sourceElement.video !== undefined
          ? "video"
          : "picture"
        : isShapeAnnotation(sourceElement)
          ? "shape"
          : "note";
  return (
    (customMessage ??
      (elementKind === undefined
        ? direction === "undo"
          ? uiMessage("inspector.announcements.couldnTBringBack") +
            (isPartial ? uiMessage("inspector.announcements.theRestOf") : "") +
            uiMessage("inspector.announcements.whatYouDeleted")
          : uiMessage("inspector.announcements.couldnTAdd") +
            (isPartial ? uiMessage("inspector.announcements.theRestOf") : "") +
            uiMessage("inspector.announcements.theCopiesAgain")
        : direction === "undo"
          ? uiMessage("inspector.announcements.couldnTBringThe") + elementKind + " back: "
          : uiMessage("inspector.announcements.couldnTAddThe") + elementKind + " again: ")) +
    uiMessage("inspector.announcements.thisCanvasIsAtIts") +
    String(canvasLimit) +
    ")."
  );
}
function undoTargetAnnouncement(direction?: Dynamic, changeLabel?: Dynamic): Dynamic {
  return direction === "undo"
    ? uiMessage("inspector.announcements.theChangeToUndoIs") + changeLabel + ". Undo again to take it back."
    : uiMessage("inspector.announcements.theChangeToRedoIs") + changeLabel + ". Redo again to apply it.";
}
function pendingUndoAnnouncement(
  direction?: Dynamic,
  changeLabel?: Dynamic,
): Dynamic {
  return (
    uiMessage("inspector.announcements.stillLoading") +
    changeLabel +
    ". " +
    (direction === "undo" ? "Undo" : "Redo") +
    " again in a moment."
  );
}
function changedArtboardsMessage(
  artboardNames?: Dynamic,
  isOnOtherPage?: Dynamic,
): Dynamic {
  let isSingle: Dynamic = artboardNames.length === 1,
    text: Dynamic = " can\u2019t be undone or redone.";
  return isOnOtherPage
    ? (isSingle ? String(artboardNames[0]) : String(artboardNames.length) + " artboards") +
        " changed while you were on another page, so your earlier changes to " +
        (isSingle ? "it" : "them") +
        text
    : (isSingle
        ? String(artboardNames[0]) + "\u2019s undo history was cleared"
        : uiMessage("inspector.announcements.undoHistoryWasClearedFor") +
          String(artboardNames.length) +
          " artboards") +
        ", so earlier changes to " +
        (isSingle ? "it" : "them") +
        text;
}
function summarizeChangedArtboards(
  changedOnOtherPage?: Dynamic,
  clearedHistory?: Dynamic,
): Dynamic {
  let [message = "", description]: Dynamic = [
    changedOnOtherPage.length > 0 ? changedArtboardsMessage(changedOnOtherPage, true) : null,
    clearedHistory.length > 0 ? changedArtboardsMessage(clearedHistory, false) : null,
  ].filter((entry?: Dynamic): Dynamic => entry !== null);
  return description === undefined
    ? {
        message: message,
      }
    : {
        message: message,
        description: description,
      };
}
function pngCopyFailureMessage(elementName?: Dynamic, reason?: Dynamic): Dynamic {
  return pictureCopyFailureMessage(uiMessage("inspector.announcements.aPNG"), elementName, reason);
}
function svgCopyFailureMessage(elementName?: Dynamic, reason?: Dynamic): Dynamic {
  return (
    uiMessage("inspector.announcements.couldnTCopyThis") +
    elementName +
    " as an SVG: " +
    (reason ?? uiMessage("inspector.announcements.theBrowserDidnTAllow")) +
    "."
  );
}
function pictureCopyFailureMessage(
  formatLabel?: Dynamic,
  elementName?: Dynamic,
  reason?: Dynamic,
): Dynamic {
  return (
    uiMessage("inspector.announcements.couldnTCopyThis") +
    elementName +
    " as " +
    formatLabel +
    ": " +
    (reason ??
      uiMessage("inspector.announcements.theBrowserDidnTAllow2")) +
    "."
  );
}
function clippedSvgCopyMessage(elementName?: Dynamic, isFlowPrintMode?: Dynamic): Dynamic {
  return (
    elementName +
    " runs past its frame, so the SVG stops at the frame" +
    (isFlowPrintMode
      ? "."
      : " \u2014 set Print mode to Flow to copy its full length.")
  );
}
function missingSvgImagesMessage(count?: Dynamic): Dynamic {
  return count === 1
    ? uiMessage("inspector.announcements.onePictureCouldnTBe")
    : String(count) +
        " pictures couldn\u2019t be copied into the SVG and are left empty.";
}
function missingCopiedImagesMessage(count?: Dynamic): Dynamic {
  return count === 1
    ? uiMessage("inspector.announcements.oneImageCouldnTBe")
    : String(count) +
        " images couldn\u2019t be drawn and are blank in the copied picture.";
}
function emptyClipboardMessage(pasteShortcut?: Dynamic): Dynamic {
  return (
    uiMessage("inspector.announcements.nothingCopiedInThisDesign") +
    pasteShortcut +
    " to paste a picture or something copied elsewhere."
  );
}
function fitContentResultMessage(
  fitResults?: Dynamic,
  artboardNames?: Dynamic,
): Dynamic {
  let isFitted: Dynamic = (result?: Dynamic): Dynamic =>
      result === "grown" || result === "shrunk",
    fittedCount: Dynamic = fitResults.filter(isFitted).length;
  if (fittedCount > 0 && fitResults.length === 1) return null;
  if (fittedCount === fitResults.length)
    return uiMessage("inspector.announcements.fitted") + String(fittedCount) + " artboards to their content.";
  if (fittedCount > 0) {
    let remainingMessage: Dynamic = fitContentResultMessage(
      fitResults.filter((result?: Dynamic): Dynamic => !isFitted(result)),
      artboardNames.filter(
        (artboardName?: Dynamic, index?: Dynamic): Dynamic =>
          !isFitted(fitResults[index]),
      ),
    );
    return (
      uiMessage("inspector.announcements.fitted") +
      String(fittedCount) +
      " of " +
      String(fitResults.length) +
      " artboards to their content" +
      (remainingMessage === null
        ? "."
        : "; " + remainingMessage.charAt(0).toLowerCase() + remainingMessage.slice(1))
    );
  }
  let indexOfResult: Dynamic = (result?: Dynamic): Dynamic => fitResults.indexOf(result),
    artboardLabel: Dynamic = (index?: Dynamic): Dynamic =>
      artboardNames[index] !== undefined
        ? '"' + artboardNames[index] + '"'
        : uiMessage("inspector.announcements.thatArtboard"),
    hasMultiple: Dynamic = fitResults.length > 1,
    foundIndex: Dynamic;
  return (foundIndex = indexOfResult("unsettled")) >= 0
    ? artboardLabel(foundIndex) +
        " stretches to fill whatever height its frame has, so no frame height will hold all of it."
    : (foundIndex = indexOfResult("unsized")) >= 0
      ? artboardLabel(foundIndex) +
        "\u2019s page has no height of its own to fit to (it sizes itself to its frame), so its frame stays as it is."
      : (foundIndex = indexOfResult("changed")) >= 0
        ? artboardLabel(foundIndex) +
          " was changed while it was being measured, so its frame stays as you set it."
        : (foundIndex = indexOfResult("empty")) >= 0
          ? artboardLabel(foundIndex) +
            " has nothing on its page yet, so its frame stays as it is."
          : (foundIndex = indexOfResult("capped")) >= 0
            ? artboardLabel(foundIndex) +
              " is already as tall as an artboard can be (8000 px)."
            : (foundIndex = indexOfResult("hidden")) >= 0
              ? artboardLabel(foundIndex) +
                " is hidden while another artboard is open full window. Close that view, then try again."
              : (foundIndex = indexOfResult("stopped")) >= 0
                ? artboardLabel(foundIndex) +
                  "\u2019s preview is stopped. Reload it, then try again."
                : (foundIndex = indexOfResult("unmeasured")) >= 0
                  ? uiMessage("inspector.announcements.couldnTMeasure") +
                    artboardLabel(foundIndex) +
                    " yet. Try again once it has finished loading."
                  : (foundIndex = indexOfResult("keeps")) >= 0
                    ? artboardLabel(foundIndex) +
                      " is set to Flow or is page-shaped now, so its frame stays as it is."
                    : fitResults.every(
                          (result?: Dynamic): Dynamic => result === "gone",
                        )
                      ? hasMultiple
                        ? uiMessage("inspector.announcements.thoseArtboardsArenTOn")
                        : uiMessage("inspector.announcements.thatArtboardIsnTOn")
                      : fitResults.every(
                            (result?: Dynamic): Dynamic =>
                              result === "matches" || result === "gone",
                          )
                        ? hasMultiple
                          ? uiMessage("inspector.announcements.nothingToFitThoseFrames")
                          : uiMessage("inspector.announcements.nothingToFit") +
                            artboardLabel(indexOfResult("matches")) +
                            "\u2019s frame is already about as tall as its page."
                        : hasMultiple
                          ? uiMessage("inspector.announcements.nothingToFitThosePages")
                          : uiMessage("inspector.announcements.nothingToFit") +
                            artboardLabel(indexOfResult("fits")) +
                            "\u2019s page is no taller than its frame.";
}
function zoomAnnouncement(zoomRatio?: Dynamic): Dynamic {
  return uiMessage("inspector.announcements.zoom") + String(Math.round(zoomRatio * 100)) + "%";
}
function pageAnnouncement(pageName?: Dynamic): Dynamic {
  return "Page: " + pageName;
}
function canvasSelectionKey(selection?: Dynamic): Dynamic {
  return isEmptyCanvasSelection(selection)
    ? "none"
    : "ab:" +
        [...selection.artboards].sort().join(`
`) +
        "|" +
        [...selection.notes].sort().join(`
`) +
        "|el:" +
        [...selection.elements]
          .map(
            ([artboardId, elementSelection]: Dynamic): Dynamic =>
              artboardId +
              "#" +
              [...elementSelection.tids]
                .sort(
                  (firstTid?: Dynamic, secondTid?: Dynamic): Dynamic =>
                    firstTid - secondTid,
                )
                .join(".") +
              (elementSelection.part ? ":" + elementSelection.part : ""),
          )
          .sort().join(`
`);
}
function findOutlineNode(nodes?: Dynamic, tid?: Dynamic): Dynamic {
  if (!nodes) return null;
  for (let node of nodes as Dynamic) {
    if (node.tid === tid) return node;
    let found: Dynamic = findOutlineNode(node.children, tid);
    if (found) return found;
  }
  return null;
}
function outlineNodeDescription(node?: Dynamic): Dynamic {
  if (!node) return "Layer";
  let label: Dynamic =
    node.label.length > AccessibilityAnnouncementsLimit
      ? truncateAccessibleLabel(node.label, AccessibilityAnnouncementsLimit)
      : node.label;
  return node.detail ? label + ", " + node.detail : label;
}
function truncateAccessibleLabel(
  label?: Dynamic,
  maxLength?: Dynamic,
): Dynamic {
  return (
    label.slice(0, maxLength - 1).replace(/[\uD800-\uDBFF]$/, "") + "\u2026"
  );
}
function selectionAnnouncement(
  selection?: Dynamic,
  outlinesByArtboard?: Dynamic,
  getArtboardName?: Dynamic,
  getNoteKind: Dynamic = (): Dynamic => "note",
): Dynamic {
  if (isEmptyCanvasSelection(selection))
    return NothingSelectedMessage;
  let layerCount: Dynamic = 0;
  for (let elementSelection of selection.elements.values() as Dynamic)
    layerCount += elementSelection.tids.length;
  if (selection.artboards.size === 0 && selection.notes.size === 0) {
    if (layerCount !== 1) return String(layerCount) + " layers selected";
    let [artboardId, elementSelection]: Dynamic = [...selection.elements][0];
    return (
      outlineNodeDescription(
        findOutlineNode(outlinesByArtboard[artboardId], elementSelection.tids[0]),
      ) + (elementSelection.part === "text" ? " text selected" : " selected")
    );
  }
  if (selection.notes.size === 0 && layerCount === 0) {
    if (selection.artboards.size === 1) {
      let [artboards]: Dynamic = selection.artboards;
      return uiMessage("inspector.announcements.artboard") + getArtboardName(artboards) + "\u201D selected";
    }
    return String(selection.artboards.size) + " artboards selected";
  }
  let noteKinds: Dynamic = [...selection.notes].map(getNoteKind),
    shapeCount: Dynamic = noteKinds.filter(
      (noteKind?: Dynamic): Dynamic => noteKind === "shape",
    ).length,
    pictureCount: Dynamic = noteKinds.filter(
      (noteKind?: Dynamic): Dynamic => noteKind === "picture",
    ).length,
    videoCount: Dynamic = noteKinds.filter(
      (noteKind?: Dynamic): Dynamic => noteKind === "video",
    ).length,
    noteCount: Dynamic = selection.notes.size - shapeCount - pictureCount - videoCount;
  if (selection.artboards.size === 0 && layerCount === 0 && selection.notes.size === 1)
    return videoCount
      ? videoSelectedMessage
      : pictureCount
        ? pictureSelectedMessage
        : shapeCount
          ? shapeSelectedMessage
          : noteSelectedMessage;
  let countPhrase: Dynamic = (count?: Dynamic, noun?: Dynamic): Dynamic =>
      count === 0
        ? []
        : [String(count) + " " + noun + (count === 1 ? "" : "s")],
    phrases: Dynamic = [
      ...countPhrase(selection.artboards.size, "artboard"),
      ...countPhrase(noteCount, "note"),
      ...countPhrase(shapeCount, "shape"),
      ...countPhrase(pictureCount, "picture"),
      ...countPhrase(videoCount, "video"),
      ...countPhrase(layerCount, "layer"),
    ];
  return (
    (phrases.length > 1 ? phrases.slice(0, -1).join(", ") + " and " : "") +
    phrases[phrases.length - 1] +
    " selected"
  );
}
function artboardPositionAnnouncement(
  index?: Dynamic,
  total?: Dynamic,
  artboardName?: Dynamic,
): Dynamic {
  return (
    uiMessage("inspector.announcements.artboard2") +
    String(index + 1) +
    " of " +
    String(total) +
    ": " +
    artboardName
  );
}
function outlineLayerAnnouncement(
  location?: Dynamic,
  maxLength: Dynamic = AccessibilityAnnouncementsConstant,
): Dynamic {
  let isOnlyLayer: Dynamic = location.siblings.length <= 1,
    suffix: Dynamic =
      " selected, " +
      (isOnlyLayer
        ? uiMessage("inspector.announcements.theOnlyLayerAtThis")
        : outlineSiblingPosition(location)) +
      (location.node.hidden ? ", hidden" : "") +
      (isOnlyLayer && location.node.children.length > 0 ? ". Return goes deeper" : ""),
    description: Dynamic = outlineNodeDescription(location.node),
    availableLength: Dynamic = maxLength - suffix.length;
  return (
    (description.length > availableLength
      ? truncateAccessibleLabel(description, availableLength)
      : description) + suffix
  );
}
function outlineLayerNavigationAnnouncement(location?: Dynamic): Dynamic {
  return (
    outlineLayerAnnouncement(
      location,
      AccessibilityAnnouncementsConstant -
        2 -
        layerNavigationHintMessage.length,
    ) +
    ". " +
    layerNavigationHintMessage
  );
}
function exitOutlineAnnouncement(artboardName?: Dynamic): Dynamic {
  return uiMessage("inspector.announcements.outOfTheLayersArtboard") + artboardName + "\u201D selected";
}
function artboardNotSelectedAnnouncement(artboardName?: Dynamic): Dynamic {
  return (
    uiMessage("inspector.announcements.artboard") + artboardName + "\u201D is not selected. Nothing deleted"
  );
}
function elementSelectionAnnouncement(
  nodes?: Dynamic,
  tids?: Dynamic,
): Dynamic {
  return tids.length === 0
    ? NothingSelectedMessage
    : tids.length === 1
      ? outlineNodeDescription(findOutlineNode(nodes, tids[0])) + " selected"
      : String(tids.length) + " layers selected";
}
function selectionActionRefusalAnnouncement(
  layerLabel?: Dynamic,
  actionDone?: Dynamic,
  hasSelectableRow?: Dynamic,
  selectionMessage: Dynamic = NothingSelectedMessage,
): Dynamic {
  let currentSelectionText: Dynamic =
    selectionMessage !== NothingSelectedMessage && selectionMessage.endsWith(" selected")
      ? selectionMessage
      : "";
  /^(Note|Shape|Picture|Video) selected$/.test(currentSelectionText)
    ? (currentSelectionText = uiMessage("inspector.announcements.a") + currentSelectionText.toLowerCase())
    : currentSelectionText === layerLabel + " selected" && (currentSelectionText = uiMessage("inspector.announcements.another") + currentSelectionText);
  let refusalText: Dynamic = " is not selected. Nothing " + actionDone + ". ",
    selectionHint: Dynamic =
      currentSelectionText !== ""
        ? currentSelectionText.length > 56
          ? truncateAccessibleLabel(currentSelectionText.slice(0, -9), 47) + " selected"
          : currentSelectionText
        : hasSelectableRow
          ? uiMessage("inspector.announcements.returnSelectsIt")
          : uiMessage("inspector.announcements.returnOnTheRowItself"),
    availableLength: Dynamic =
      AccessibilityAnnouncementsConstant - refusalText.length - selectionHint.length;
  return (
    (layerLabel.length > availableLength ? truncateAccessibleLabel(layerLabel, availableLength) : layerLabel) +
    refusalText +
    selectionHint
  );
}
function emptyArtboardSelectionAnnouncement(artboardName?: Dynamic): Dynamic {
  return uiMessage("inspector.announcements.artboard") + artboardName + "\u201D selected. It has no layers";
}
function artboardLoadingAnnouncement(artboardName?: Dynamic): Dynamic {
  return uiMessage("inspector.announcements.loadingArtboard") + artboardName + "\u201D\u2026";
}
function artboardLoadFailureAnnouncement(artboardName?: Dynamic): Dynamic {
  return uiMessage("inspector.announcements.couldnTLoadArtboard") + artboardName + "\u201D";
}
function selectingAnnouncement(message?: Dynamic): Dynamic {
  return uiMessage("inspector.announcements.stillSelecting") + message;
}
function selectionReadyAnnouncement(message?: Dynamic): Dynamic {
  return message + ". " + editingTextHintMessage;
}
function artboardsDeletedAnnouncement(artboardNames?: Dynamic): Dynamic {
  return artboardNames.length === 1
    ? uiMessage("inspector.announcements.artboard") + artboardNames[0] + "\u201D deleted"
    : String(artboardNames.length) + " artboards deleted";
}
function pageDeletedAnnouncement(
  pageName?: Dynamic,
  artboardCount?: Dynamic,
  objectCount?: Dynamic,
): Dynamic {
  let contents: Dynamic = [
      artboardCount > 0
        ? String(artboardCount) + (artboardCount === 1 ? " artboard" : " artboards")
        : "",
      objectCount > 0
        ? String(objectCount) + (objectCount === 1 ? " object" : " objects")
        : "",
    ].filter((part?: Dynamic): Dynamic => part !== ""),
    suffix: Dynamic =
      "\u201D deleted" +
      (contents.length > 0 ? " with its " + contents.join(" and ") : ""),
    availableLength: Dynamic = AccessibilityAnnouncementsConstant - 6 - suffix.length;
  return (
    uiMessage("inspector.announcements.page") +
    (pageName.length > availableLength ? truncateAccessibleLabel(pageName, availableLength) : pageName) +
    suffix
  );
}
function objectsDeletedAnnouncement(count?: Dynamic): Dynamic {
  return String(count) + " objects deleted";
}
function moveDirectionAnnouncement(
  dx?: Dynamic,
  dy?: Dynamic,
): Dynamic {
  return dx !== 0 && dy === 0
    ? dx < 0
      ? uiMessage("inspector.announcements.movedLeft")
      : uiMessage("inspector.announcements.movedRight")
    : dy !== 0 && dx === 0
      ? dy < 0
        ? uiMessage("inspector.announcements.movedUp")
        : uiMessage("inspector.announcements.movedDown")
      : "Moved";
}
function flipDirectionAnnouncement(axis?: Dynamic): Dynamic {
  return axis === "horizontal"
    ? uiMessage("inspector.announcements.flippedHorizontally")
    : uiMessage("inspector.announcements.flippedVertically");
}
function reorderAnnouncement(delta?: Dynamic, isToEnd?: Dynamic): Dynamic {
  return isToEnd
    ? delta < 0
      ? uiMessage("inspector.announcements.movedToFirst")
      : uiMessage("inspector.announcements.movedToLast")
    : delta < 0
      ? uiMessage("inspector.announcements.movedUp")
      : uiMessage("inspector.announcements.movedDown");
}
function stackingAnnouncement(side?: Dynamic, didMove?: Dynamic): Dynamic {
  return didMove
    ? side === "front"
      ? uiMessage("inspector.announcements.broughtToTheFront")
      : uiMessage("inspector.announcements.sentToTheBack")
    : side === "front"
      ? uiMessage("inspector.announcements.alreadyAtTheFront")
      : uiMessage("inspector.announcements.alreadyAtTheBack");
}
function propertyAnnouncementLabel(property?: Dynamic): Dynamic {
  if (property === "__text") return "Content";
  if (property.startsWith("@")) {
    let attributeName: Dynamic = property.slice(1);
    return (
      AccessibilityAnnouncementsHrefSrcAltConfig[attributeName] ??
      humanizePropertyName(attributeName)
    );
  }
  let specification: Dynamic = getPropertySpecification(property);
  if (!specification || specification.label === "") return humanizePropertyName(property);
  let sectionLabel: Dynamic =
    AccessibilityAnnouncementsPaddingMarginConfig[specification.section];
  return sectionLabel ? sectionLabel + " " + specification.label.toLowerCase() : specification.label;
}
function humanizePropertyName(name?: Dynamic): Dynamic {
  let words: Dynamic = name.replace(/^-+/, "").replace(/[-_]+/g, " ").trim();
  return words === ""
    ? "Property"
    : words.charAt(0).toUpperCase() + words.slice(1);
}
function propertyEditAnnouncement(edits?: Dynamic): Dynamic {
  if (edits.length === 0) return "Updated";
  let label: Dynamic = propertyAnnouncementLabel(edits[0].prop);
  if (edits.length > 1)
    return edits.every((edit?: Dynamic): Dynamic => edit.value == null)
      ? label + " reset"
      : label + " updated";
  let { value: newValue }: Dynamic = edits[0];
  if (newValue == null) return label + " reset";
  let trimmedValue: Dynamic = newValue.trim();
  return AccessibilityAnnouncementsPattern.test(trimmedValue)
    ? label + " " + trimmedValue
    : label + " updated";
}
function addContrastToAnnouncement(
  message?: Dynamic,
  edits?: Dynamic,
  background?: Dynamic,
  resolveValue: Dynamic = (colorValue?: Dynamic): Dynamic => colorValue,
): Dynamic {
  if (background === undefined) return message;
  let textColor: Dynamic = edits.find(
      (edit?: Dynamic): Dynamic => edit.prop === "color",
    )?.value,
    resolvedValue: Dynamic = textColor == null ? undefined : resolveValue(textColor),
    cssColor: Dynamic =
      resolvedValue === undefined ? undefined : resolvedContrastColor(resolvedValue, []),
    contrastResults: Dynamic =
      cssColor === undefined
        ? undefined
        : evaluateColorContrast(cssColor, background);
  return contrastResults === undefined
    ? message
    : message + ". " + summarizeContrastResults(contrastResults).spoken;
}
function sourceLineErrorAnnouncement(
  line?: Dynamic,
  errorText?: Dynamic,
): Dynamic {
  return (
    uiMessage("inspector.announcements.line") +
    String(line) +
    ": " +
    (AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig[
      errorText
    ] ?? errorText.replace(/\s+/g, " "))
  );
}
function pausedChangesAnnouncement(message?: Dynamic): Dynamic {
  return (
    (message.length > 80 ? truncateAccessibleLabel(message, 80) : message) +
    ". Changes are paused until it is fixed"
  );
}
function discardedCodeChangesAnnouncement(count?: Dynamic): Dynamic {
  return (
    uiMessage("inspector.announcements.unappliedChangesInTheCode") +
    String(count) +
    " could not be read"
  );
}
function artboardResizeAnnouncement(
  before?: Dynamic,
  after?: Dynamic,
): Dynamic {
  let changes: Dynamic = [];
  Math.round(before.w) !== Math.round(after.w) &&
    changes.push(uiMessage("inspector.announcements.width") + String(Math.round(after.w)) + "px");
  Math.round(before.h) !== Math.round(after.h) &&
    changes.push(
      (changes.length > 0 ? uiMessage("inspector.announcements.height2") : uiMessage("inspector.announcements.height")) +
        String(Math.round(after.h)) +
        "px",
    );
  return changes.length > 0 ? changes.join(", ") : null;
}
function backgroundEditAnnouncement(edits?: Dynamic): Dynamic {
  return edits.length > 0 &&
    edits.every((edit?: Dynamic): Dynamic => edit.value == null)
    ? uiMessage("inspector.announcements.backgroundReset")
    : uiMessage("inspector.announcements.backgroundUpdated");
}
export {
  AccessibilityAnnouncementsConstant,
  AccessibilityAnnouncementsHandler,
  AccessibilityAnnouncementsHrefSrcAltConfig,
  AccessibilityAnnouncementsLabel,
  pasteHereMessage as AccessibilityAnnouncementsLabel_10,
  noteSelectedMessage as AccessibilityAnnouncementsLabel_11,
  shapeSelectedMessage as AccessibilityAnnouncementsLabel_12,
  pictureSelectedMessage as AccessibilityAnnouncementsLabel_13,
  videoSelectedMessage as AccessibilityAnnouncementsLabel_14,
  layerNavigationHintMessage as AccessibilityAnnouncementsLabel_15,
  editingTextHintMessage as AccessibilityAnnouncementsLabel_16,
  textUpdatedMessage as AccessibilityAnnouncementsLabel_17,
  noteDeletedMessage as AccessibilityAnnouncementsLabel_18,
  shapeDeletedMessage as AccessibilityAnnouncementsLabel_19,
  copiedAsPngMessage as AccessibilityAnnouncementsLabel_2,
  pictureDeletedMessage as AccessibilityAnnouncementsLabel_20,
  videoDeletedMessage as AccessibilityAnnouncementsLabel_21,
  linkRemovedMessage as AccessibilityAnnouncementsLabel_22,
  emptyTextBoxRemovedMessage as AccessibilityAnnouncementsLabel_23,
  commentModePausedMessage as AccessibilityAnnouncementsLabel_24,
  copiedAsSvgMessage as AccessibilityAnnouncementsLabel_3,
  conversionFailedMessage as AccessibilityAnnouncementsLabel_4,
  exportStillRunningMessage as AccessibilityAnnouncementsLabel_5,
  notSelectedAnywhereMessage as AccessibilityAnnouncementsLabel_6,
  noWidthOrHeightMessage as AccessibilityAnnouncementsLabel_7,
  previewStoppedReloadMessage as AccessibilityAnnouncementsLabel_8,
  notVisibleMessage as AccessibilityAnnouncementsLabel_9,
  AccessibilityAnnouncementsLimit,
  AccessibilityAnnouncementsPaddingMarginConfig,
  AccessibilityAnnouncementsPattern,
  AccessibilityAnnouncementsReadyUpdatedChangedConfig,
  AccessibilityAnnouncementsResolvedValue,
  AccessibilityAnnouncementsUndoRedoConfig,
  undoRedoPastTense as AccessibilityAnnouncementsUndoRedoConfig_2,
  AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig,
  addContrastToAnnouncement,
  adjacentOutlineNode,
  artboardLoadFailureAnnouncement,
  artboardLoadingAnnouncement,
  artboardNotSelectedAnnouncement,
  artboardPositionAnnouncement,
  artboardResizeAnnouncement,
  artboardsDeletedAnnouncement,
  backgroundEditAnnouncement,
  canvasSelectionKey,
  changedArtboardsMessage,
  clipboardActionFailureMessage,
  clippedSvgCopyMessage,
  contrastTextRole,
  CutValue,
  deepestSingleOutlineNode,
  DeletedValue,
  discardedCodeChangesAnnouncement,
  elementSelectionAnnouncement,
  emptyArtboardSelectionAnnouncement,
  emptyClipboardMessage,
  exitOutlineAnnouncement,
  findOutlineLocation,
  findOutlineNode,
  firstNestedOutlineNode,
  fitContentResultMessage,
  flipDirectionAnnouncement,
  humanizePropertyName,
  ItsPageHasNothingToDrawMessage,
  ItsPictureCouldnTBeMadeTryMessage,
  missingCopiedImagesMessage,
  missingSvgImagesMessage,
  moveDirectionAnnouncement,
  NoLayersInsideThisOneMessage,
  NothingChangedThatStepNoLongerMessage,
  NothingSelectedMessage,
  objectsDeletedAnnouncement,
  outlineLayerAnnouncement,
  outlineLayerNavigationAnnouncement,
  outlineNodeDescription,
  outlineSiblingPosition,
  pageAnnouncement,
  pageDeletedAnnouncement,
  pageUndoFailureMessage,
  pausedChangesAnnouncement,
  pendingUndoAnnouncement,
  pictureCopyFailureMessage,
  pngCopyFailureMessage,
  PressReturnToGoIntoThisMessage,
  propertyAnnouncementLabel,
  propertyEditAnnouncement,
  reorderAnnouncement,
  resolveColorTokenValue,
  resolvedContrastColor,
  selectingAnnouncement,
  selectionActionRefusalAnnouncement,
  selectionAnnouncement,
  selectionReadyAnnouncement,
  sourceLineErrorAnnouncement,
  stackingAnnouncement,
  summarizeChangedArtboards,
  svgCopyFailureMessage,
  textContrastContext,
  ThisIsTheFirstArtboardMessage,
  ThisIsTheLastArtboardMessage,
  ThisIsTheOnlyArtboardMessage,
  truncateAccessibleLabel,
  undoTargetAnnouncement,
  zoomAnnouncement,
};
export function installEditorAccessibilityAnnouncements(): () => void {
  return () => {
    AccessibilityAnnouncementsLabel = uiMessage("inspector.announcements.backgroundColor");
    AccessibilityAnnouncementsUndoRedoConfig = {
      get undo() { return uiMessage("inspector.announcements.nothingToUndo"); },
      get redo() { return uiMessage("inspector.announcements.nothingToRedo"); },
    };
    NothingChangedThatStepNoLongerMessage =
      uiMessage("inspector.announcements.nothingChangedThatStepNo");
    undoRedoPastTense = {
      undo: "Undone",
      redo: "Redone",
    };
    NothingSelectedMessage = uiMessage("inspector.announcements.nothingSelected");
    copiedAsPngMessage = uiMessage("inspector.announcements.copiedAsAPNG");
    copiedAsSvgMessage = uiMessage("inspector.announcements.copiedAsAnSVG");
    conversionFailedMessage = uiMessage("inspector.announcements.theConversionFailedTryAgain");
    exportStillRunningMessage =
      uiMessage("inspector.announcements.anotherExportIsStillRunning");
    ItsPictureCouldnTBeMadeTryMessage =
      uiMessage("inspector.announcements.itsPictureCouldnTBe");
    notSelectedAnywhereMessage =
      uiMessage("inspector.announcements.itIsnTSelectedAny");
    noWidthOrHeightMessage = uiMessage("inspector.announcements.itHasNoWidthOr");
    ItsPageHasNothingToDrawMessage = uiMessage("inspector.announcements.itsPageHasNothingTo");
    previewStoppedReloadMessage =
      uiMessage("inspector.announcements.itsPreviewIsStoppedReload");
    notVisibleMessage =
      uiMessage("inspector.announcements.itIsnTVisibleTo");
    pasteHereMessage =
      uiMessage("inspector.announcements.pasteHerePlacesOneCopied");
    noteSelectedMessage = uiMessage("inspector.announcements.noteSelected");
    shapeSelectedMessage = uiMessage("inspector.announcements.shapeSelected");
    pictureSelectedMessage = uiMessage("inspector.announcements.pictureSelected");
    videoSelectedMessage = uiMessage("inspector.announcements.videoSelected");
    AccessibilityAnnouncementsLimit = 40;
    PressReturnToGoIntoThisMessage =
      uiMessage("inspector.announcements.pressReturnToGoInto");
    ThisIsTheFirstArtboardMessage = uiMessage("inspector.announcements.thisIsTheFirstArtboard");
    ThisIsTheLastArtboardMessage = uiMessage("inspector.announcements.thisIsTheLastArtboard");
    ThisIsTheOnlyArtboardMessage = uiMessage("inspector.announcements.thisIsTheOnlyArtboard");
    AccessibilityAnnouncementsResolvedValue =
      "Tab: next layer \xB7 " +
      (isApplePlatform()
        ? "Return: deeper \xB7 \u21E7Return: up"
        : "Enter: deeper \xB7 Shift+Enter: up") +
      " \xB7 Esc: leave";
    layerNavigationHintMessage =
      uiMessage("inspector.announcements.tabNextReturnDeeperEscape");
    AccessibilityAnnouncementsConstant = 120;
    NoLayersInsideThisOneMessage = uiMessage("inspector.announcements.noLayersInsideThisOne");
    editingTextHintMessage =
      uiMessage("inspector.announcements.editingTextEscapeOrTab");
    textUpdatedMessage = uiMessage("inspector.announcements.textUpdated");
    DeletedValue = "Deleted";
    CutValue = "Cut";
    noteDeletedMessage = uiMessage("inspector.announcements.noteDeleted");
    shapeDeletedMessage = uiMessage("inspector.announcements.shapeDeleted");
    pictureDeletedMessage = uiMessage("inspector.announcements.pictureDeleted");
    videoDeletedMessage = uiMessage("inspector.announcements.videoDeleted");
    linkRemovedMessage = uiMessage("inspector.announcements.linkRemoved");
    emptyTextBoxRemovedMessage = uiMessage("inspector.announcements.emptyTextBoxRemoved");
    AccessibilityAnnouncementsHrefSrcAltConfig = {
      href: "Destination",
      get src() { return uiMessage("inspector.announcements.source"); },
      alt: "Alt text",
      target: "Target",
      get placeholder() { return uiMessage("inspector.announcements.placeholder"); },
    };
    AccessibilityAnnouncementsPattern =
      /^-?\d+(\.\d+)?\s?(px|%|em|rem|pt|vw|vh|ch|deg|ms|s|fr)?$/;
    AccessibilityAnnouncementsPaddingMarginConfig = {
      get padding() { return uiMessage("inspector.announcements.padding"); },
      get margin() { return uiMessage("inspector.announcements.margin"); },
    };
    AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig = {
      "unexpected {": "unexpected opening brace",
      "unexpected }": "unexpected closing brace",
      "unexpected ;": "unexpected semicolon",
      "unbalanced )": "unbalanced closing parenthesis",
      "unbalanced ( or quote": "unbalanced parenthesis or quote",
    };
    commentModePausedMessage = uiMessage("inspector.announcements.commentModePaused");
    AccessibilityAnnouncementsHandler = (count?: Dynamic): Dynamic =>
      String(count) + (count === 1 ? " artboard" : " artboards");
    AccessibilityAnnouncementsReadyUpdatedChangedConfig = {
      ready: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.announcements.designReady") + AccessibilityAnnouncementsHandler(count),
      updated: (count?: Dynamic): Dynamic =>
        AccessibilityAnnouncementsHandler(count) + " updated",
      changed: (count?: Dynamic): Dynamic =>
        uiMessage("inspector.announcements.designUpdated") +
        (count === 0
          ? uiMessage("inspector.announcements.noArtboardsLeft")
          : AccessibilityAnnouncementsHandler(count) + " in all"),
    };
  };
}

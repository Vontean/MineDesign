import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";

export function installEditorAccessibilityAnnouncements(
  runtime: RuntimeBindings,
): () => void {
  var AccessibilityAnnouncementsLabel: Dynamic;
  var AccessibilityAnnouncementsUndoRedoConfig: Dynamic;
  var NothingChangedThatStepNoLongerMessage: Dynamic;
  var AccessibilityAnnouncementsUndoRedoConfig_2: Dynamic;
  var NothingSelectedMessage: Dynamic;
  var AccessibilityAnnouncementsLabel_2: Dynamic;
  var AccessibilityAnnouncementsLabel_3: Dynamic;
  var AccessibilityAnnouncementsLabel_4: Dynamic;
  var AccessibilityAnnouncementsLabel_5: Dynamic;
  var ItsPictureCouldnTBeMadeTryMessage: Dynamic;
  var AccessibilityAnnouncementsLabel_6: Dynamic;
  var AccessibilityAnnouncementsLabel_7: Dynamic;
  var ItsPageHasNothingToDrawMessage: Dynamic;
  var AccessibilityAnnouncementsLabel_8: Dynamic;
  var AccessibilityAnnouncementsLabel_9: Dynamic;
  var AccessibilityAnnouncementsLabel_10: Dynamic;
  var AccessibilityAnnouncementsLabel_11: Dynamic;
  var AccessibilityAnnouncementsLabel_12: Dynamic;
  var AccessibilityAnnouncementsLabel_13: Dynamic;
  var AccessibilityAnnouncementsLabel_14: Dynamic;
  var AccessibilityAnnouncementsLimit: Dynamic;
  var PressReturnToGoIntoThisMessage: Dynamic;
  var ThisIsTheFirstArtboardMessage: Dynamic;
  var ThisIsTheLastArtboardMessage: Dynamic;
  var ThisIsTheOnlyArtboardMessage: Dynamic;
  var AccessibilityAnnouncementsResolvedValue: Dynamic;
  var AccessibilityAnnouncementsLabel_15: Dynamic;
  var AccessibilityAnnouncementsConstant: Dynamic;
  var NoLayersInsideThisOneMessage: Dynamic;
  var AccessibilityAnnouncementsLabel_16: Dynamic;
  var AccessibilityAnnouncementsLabel_17: Dynamic;
  var DeletedValue: Dynamic;
  var CutValue: Dynamic;
  var AccessibilityAnnouncementsLabel_18: Dynamic;
  var AccessibilityAnnouncementsLabel_19: Dynamic;
  var AccessibilityAnnouncementsLabel_20: Dynamic;
  var AccessibilityAnnouncementsLabel_21: Dynamic;
  var AccessibilityAnnouncementsLabel_22: Dynamic;
  var AccessibilityAnnouncementsLabel_23: Dynamic;
  var AccessibilityAnnouncementsHrefSrcAltConfig: Dynamic;
  var AccessibilityAnnouncementsPattern: Dynamic;
  var AccessibilityAnnouncementsPaddingMarginConfig: Dynamic;
  var AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig: Dynamic;
  var AccessibilityAnnouncementsLabel_24: Dynamic;
  var AccessibilityAnnouncementsHandler: Dynamic;
  var AccessibilityAnnouncementsReadyUpdatedChangedConfig: Dynamic;
  function resolveColorTokenValue(input?: Dynamic, options?: Dynamic): Dynamic {
    let value: Dynamic = (0, runtime.cssVariableName)(input);
    if (!value) return;
    let values: Dynamic = new Set();
    for (; !values.has(value); ) {
      values.add(value);
      let value2: Dynamic = options.find(
        (input2?: Dynamic): Dynamic => input2.name === value,
      );
      if (!value2) return;
      let value3: Dynamic = (0, runtime.cssVariableName)(value2.value);
      if (!value3) return value2.value;
      value = value3;
    }
  }
  function contrastTextRole(input?: Dynamic, options?: Dynamic): Dynamic {
    return input === null
      ? "text"
      : input >= 24 || (input >= 18.66 && (options ?? 400) >= 700)
        ? "largeText"
        : "text";
  }
  function textContrastContext(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
  ): Dynamic {
    return {
      against: {
        css: input,
        label: AccessibilityAnnouncementsLabel,
      },
      role: contrastTextRole(options, context),
    };
  }
  function resolvedContrastColor(input?: Dynamic, options?: Dynamic): Dynamic {
    let value: Dynamic = resolveColorTokenValue(input, options) ?? input;
    return (0, runtime.parseRgbaColor)(value) !== undefined
      ? value
      : (0, runtime.normalizeCssColor)(value);
  }
  function findOutlineLocation(input?: Dynamic, options?: Dynamic): Dynamic {
    let callback: Dynamic = (
      items?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      for (let index: Dynamic = 0; index < items.length; index++) {
        let value: Dynamic = items[index];
        if (value.tid === options)
          return {
            node: value,
            level: options2,
            index: index,
            siblings: items,
            parent: context,
          };
        let value2: Dynamic = callback(value.children, options2 + 1, value);
        if (value2) return value2;
      }
      return null;
    };
    return callback(input, 1, null);
  }
  function adjacentOutlineNode(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
  ): Dynamic {
    let value: Dynamic =
        options == null ? null : findOutlineLocation(input, options),
      value2: Dynamic = value ? value.siblings : input;
    if (value2.length === 0) return null;
    if (context === "first") return value2[0];
    if (context === "last") return value2[value2.length - 1];
    if (!value)
      return context === "next" ? value2[0] : value2[value2.length - 1];
    let length: Dynamic = value2.length;
    return value2[
      (value.index + (context === "next" ? 1 : length - 1)) % length
    ];
  }
  function deepestSingleOutlineNode(input?: Dynamic): Dynamic {
    let value: Dynamic = input,
      value2: Dynamic = null;
    for (; value.length > 0 && ((value2 = value[0]), !(value.length > 1)); )
      value = value2.children;
    return value2;
  }
  function firstNestedOutlineNode(input?: Dynamic): Dynamic {
    return input.children.length === 0
      ? null
      : deepestSingleOutlineNode(input.children);
  }
  function outlineSiblingPosition(input?: Dynamic): Dynamic {
    return String(input.index + 1) + " of " + String(input.siblings.length);
  }
  function pageUndoFailureMessage(input?: Dynamic, options?: Dynamic): Dynamic {
    return input === "redo"
      ? uiMessage("inspector.announcements.couldnTDeleteThePage")
      : options
        ? uiMessage("inspector.announcements.thePageIsBackBut")
        : uiMessage("inspector.announcements.couldnTBringThePage");
  }
  function clipboardActionFailureMessage(
    input?: Dynamic,
    options?: Dynamic,
    source?: Dynamic,
    value?: Dynamic,
    extra: Dynamic = false,
  ): Dynamic {
    let value2: Dynamic =
      source === undefined
        ? undefined
        : source.kind === "image"
          ? source.video !== undefined
            ? "video"
            : "picture"
          : (0, runtime.isShapeAnnotation)(source)
            ? "shape"
            : "note";
    return (
      (value ??
        (value2 === undefined
          ? input === "undo"
            ? uiMessage("inspector.announcements.couldnTBringBack") +
              (extra ? uiMessage("inspector.announcements.theRestOf") : "") +
              uiMessage("inspector.announcements.whatYouDeleted")
            : uiMessage("inspector.announcements.couldnTAdd") +
              (extra ? uiMessage("inspector.announcements.theRestOf") : "") +
              uiMessage("inspector.announcements.theCopiesAgain")
          : input === "undo"
            ? uiMessage("inspector.announcements.couldnTBringThe") + value2 + " back: "
            : uiMessage("inspector.announcements.couldnTAddThe") + value2 + " again: ")) +
      uiMessage("inspector.announcements.thisCanvasIsAtIts") +
      String(options) +
      ")."
    );
  }
  function undoTargetAnnouncement(input?: Dynamic, options?: Dynamic): Dynamic {
    return input === "undo"
      ? uiMessage("inspector.announcements.theChangeToUndoIs") + options + ". Undo again to take it back."
      : uiMessage("inspector.announcements.theChangeToRedoIs") + options + ". Redo again to apply it.";
  }
  function pendingUndoAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    return (
      uiMessage("inspector.announcements.stillLoading") +
      options +
      ". " +
      (input === "undo" ? "Undo" : "Redo") +
      " again in a moment."
    );
  }
  function changedArtboardsMessage(
    items?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    let value: Dynamic = items.length === 1,
      text: Dynamic = " can\u2019t be undone or redone.";
    return options
      ? (value ? String(items[0]) : String(items.length) + " artboards") +
          " changed while you were on another page, so your earlier changes to " +
          (value ? "it" : "them") +
          text
      : (value
          ? String(items[0]) + "\u2019s undo history was cleared"
          : uiMessage("inspector.announcements.undoHistoryWasClearedFor") +
            String(items.length) +
            " artboards") +
          ", so earlier changes to " +
          (value ? "it" : "them") +
          text;
  }
  function summarizeChangedArtboards(
    items?: Dynamic,
    items2?: Dynamic,
  ): Dynamic {
    let [value2 = "", value]: Dynamic = [
      items.length > 0 ? changedArtboardsMessage(items, true) : null,
      items2.length > 0 ? changedArtboardsMessage(items2, false) : null,
    ].filter((input?: Dynamic): Dynamic => input !== null);
    return value === undefined
      ? {
          message: value2,
        }
      : {
          message: value2,
          description: value,
        };
  }
  function pngCopyFailureMessage(input?: Dynamic, options?: Dynamic): Dynamic {
    return pictureCopyFailureMessage(uiMessage("inspector.announcements.aPNG"), input, options);
  }
  function svgCopyFailureMessage(input?: Dynamic, options?: Dynamic): Dynamic {
    return (
      uiMessage("inspector.announcements.couldnTCopyThis") +
      input +
      " as an SVG: " +
      (options ?? uiMessage("inspector.announcements.theBrowserDidnTAllow")) +
      "."
    );
  }
  function pictureCopyFailureMessage(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
  ): Dynamic {
    return (
      uiMessage("inspector.announcements.couldnTCopyThis") +
      options +
      " as " +
      input +
      ": " +
      (context ??
        uiMessage("inspector.announcements.theBrowserDidnTAllow2")) +
      "."
    );
  }
  function clippedSvgCopyMessage(input?: Dynamic, options?: Dynamic): Dynamic {
    return (
      input +
      " runs past its frame, so the SVG stops at the frame" +
      (options
        ? "."
        : " \u2014 set Print mode to Flow to copy its full length.")
    );
  }
  function missingSvgImagesMessage(input?: Dynamic): Dynamic {
    return input === 1
      ? uiMessage("inspector.announcements.onePictureCouldnTBe")
      : String(input) +
          " pictures couldn\u2019t be copied into the SVG and are left empty.";
  }
  function missingCopiedImagesMessage(input?: Dynamic): Dynamic {
    return input === 1
      ? uiMessage("inspector.announcements.oneImageCouldnTBe")
      : String(input) +
          " images couldn\u2019t be drawn and are blank in the copied picture.";
  }
  function emptyClipboardMessage(input?: Dynamic): Dynamic {
    return (
      uiMessage("inspector.announcements.nothingCopiedInThisDesign") +
      input +
      " to paste a picture or something copied elsewhere."
    );
  }
  function fitContentResultMessage(
    items?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    let callback: Dynamic = (input?: Dynamic): Dynamic =>
        input === "grown" || input === "shrunk",
      length: Dynamic = items.filter(callback).length;
    if (length > 0 && items.length === 1) return null;
    if (length === items.length)
      return uiMessage("inspector.announcements.fitted") + String(length) + " artboards to their content.";
    if (length > 0) {
      let value3: Dynamic = fitContentResultMessage(
        items.filter((input?: Dynamic): Dynamic => !callback(input)),
        options.filter(
          (input?: Dynamic, options2?: Dynamic): Dynamic =>
            !callback(items[options2]),
        ),
      );
      return (
        uiMessage("inspector.announcements.fitted") +
        String(length) +
        " of " +
        String(items.length) +
        " artboards to their content" +
        (value3 === null
          ? "."
          : "; " + value3.charAt(0).toLowerCase() + value3.slice(1))
      );
    }
    let callback2: Dynamic = (input?: Dynamic): Dynamic => items.indexOf(input),
      callback3: Dynamic = (input?: Dynamic): Dynamic =>
        options[input] !== undefined
          ? '"' + options[input] + '"'
          : uiMessage("inspector.announcements.thatArtboard"),
      value: Dynamic = items.length > 1,
      value2: Dynamic;
    return (value2 = callback2("unsettled")) >= 0
      ? callback3(value2) +
          " stretches to fill whatever height its frame has, so no frame height will hold all of it."
      : (value2 = callback2("unsized")) >= 0
        ? callback3(value2) +
          "\u2019s page has no height of its own to fit to (it sizes itself to its frame), so its frame stays as it is."
        : (value2 = callback2("changed")) >= 0
          ? callback3(value2) +
            " was changed while it was being measured, so its frame stays as you set it."
          : (value2 = callback2("empty")) >= 0
            ? callback3(value2) +
              " has nothing on its page yet, so its frame stays as it is."
            : (value2 = callback2("capped")) >= 0
              ? callback3(value2) +
                " is already as tall as an artboard can be (8000 px)."
              : (value2 = callback2("hidden")) >= 0
                ? callback3(value2) +
                  " is hidden while another artboard is open full window. Close that view, then try again."
                : (value2 = callback2("stopped")) >= 0
                  ? callback3(value2) +
                    "\u2019s preview is stopped. Reload it, then try again."
                  : (value2 = callback2("unmeasured")) >= 0
                    ? uiMessage("inspector.announcements.couldnTMeasure") +
                      callback3(value2) +
                      " yet. Try again once it has finished loading."
                    : (value2 = callback2("keeps")) >= 0
                      ? callback3(value2) +
                        " is set to Flow or is page-shaped now, so its frame stays as it is."
                      : items.every(
                            (input?: Dynamic): Dynamic => input === "gone",
                          )
                        ? value
                          ? uiMessage("inspector.announcements.thoseArtboardsArenTOn")
                          : uiMessage("inspector.announcements.thatArtboardIsnTOn")
                        : items.every(
                              (input?: Dynamic): Dynamic =>
                                input === "matches" || input === "gone",
                            )
                          ? value
                            ? uiMessage("inspector.announcements.nothingToFitThoseFrames")
                            : uiMessage("inspector.announcements.nothingToFit") +
                              callback3(callback2("matches")) +
                              "\u2019s frame is already about as tall as its page."
                          : value
                            ? uiMessage("inspector.announcements.nothingToFitThosePages")
                            : uiMessage("inspector.announcements.nothingToFit") +
                              callback3(callback2("fits")) +
                              "\u2019s page is no taller than its frame.";
  }
  function zoomAnnouncement(input?: Dynamic): Dynamic {
    return uiMessage("inspector.announcements.zoom") + String(Math.round(input * 100)) + "%";
  }
  function pageAnnouncement(input?: Dynamic): Dynamic {
    return "Page: " + input;
  }
  function canvasSelectionKey(input?: Dynamic): Dynamic {
    return (0, runtime.isEmptyCanvasSelection)(input)
      ? "none"
      : "ab:" +
          [...input.artboards].sort().join(`
`) +
          "|" +
          [...input.notes].sort().join(`
`) +
          "|el:" +
          [...input.elements]
            .map(
              ([input2, input3]: Dynamic): Dynamic =>
                input2 +
                "#" +
                [...input3.tids]
                  .sort(
                    (input4?: Dynamic, options?: Dynamic): Dynamic =>
                      input4 - options,
                  )
                  .join(".") +
                (input3.part ? ":" + input3.part : ""),
            )
            .sort().join(`
`);
  }
  function findOutlineNode(input?: Dynamic, options?: Dynamic): Dynamic {
    if (!input) return null;
    for (let value of input as Dynamic) {
      if (value.tid === options) return value;
      let value2: Dynamic = findOutlineNode(value.children, options);
      if (value2) return value2;
    }
    return null;
  }
  function outlineNodeDescription(input?: Dynamic): Dynamic {
    if (!input) return "Layer";
    let value: Dynamic =
      input.label.length > AccessibilityAnnouncementsLimit
        ? truncateAccessibleLabel(input.label, AccessibilityAnnouncementsLimit)
        : input.label;
    return input.detail ? value + ", " + input.detail : value;
  }
  function truncateAccessibleLabel(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    return (
      input.slice(0, options - 1).replace(/[\uD800-\uDBFF]$/, "") + "\u2026"
    );
  }
  function selectionAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
    value: Dynamic = (): Dynamic => "note",
  ): Dynamic {
    if ((0, runtime.isEmptyCanvasSelection)(input))
      return NothingSelectedMessage;
    let index: Dynamic = 0;
    for (let value4 of input.elements.values() as Dynamic)
      index += value4.tids.length;
    if (input.artboards.size === 0 && input.notes.size === 0) {
      if (index !== 1) return String(index) + " layers selected";
      let [value4, value5]: Dynamic = [...input.elements][0];
      return (
        outlineNodeDescription(
          findOutlineNode(options[value4], value5.tids[0]),
        ) + (value5.part === "text" ? " text selected" : " selected")
      );
    }
    if (input.notes.size === 0 && index === 0) {
      if (input.artboards.size === 1) {
        let [artboards]: Dynamic = input.artboards;
        return uiMessage("inspector.announcements.artboard") + context(artboards) + "\u201D selected";
      }
      return String(input.artboards.size) + " artboards selected";
    }
    let value2: Dynamic = [...input.notes].map(value),
      length: Dynamic = value2.filter(
        (input2?: Dynamic): Dynamic => input2 === "shape",
      ).length,
      length2: Dynamic = value2.filter(
        (input2?: Dynamic): Dynamic => input2 === "picture",
      ).length,
      length3: Dynamic = value2.filter(
        (input2?: Dynamic): Dynamic => input2 === "video",
      ).length,
      value3: Dynamic = input.notes.size - length - length2 - length3;
    if (input.artboards.size === 0 && index === 0 && input.notes.size === 1)
      return length3
        ? AccessibilityAnnouncementsLabel_14
        : length2
          ? AccessibilityAnnouncementsLabel_13
          : length
            ? AccessibilityAnnouncementsLabel_12
            : AccessibilityAnnouncementsLabel_11;
    let callback: Dynamic = (input2?: Dynamic, options2?: Dynamic): Dynamic =>
        input2 === 0
          ? []
          : [String(input2) + " " + options2 + (input2 === 1 ? "" : "s")],
      items: Dynamic = [
        ...callback(input.artboards.size, "artboard"),
        ...callback(value3, "note"),
        ...callback(length, "shape"),
        ...callback(length2, "picture"),
        ...callback(length3, "video"),
        ...callback(index, "layer"),
      ];
    return (
      (items.length > 1 ? items.slice(0, -1).join(", ") + " and " : "") +
      items[items.length - 1] +
      " selected"
    );
  }
  function artboardPositionAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
  ): Dynamic {
    return (
      uiMessage("inspector.announcements.artboard2") +
      String(input + 1) +
      " of " +
      String(options) +
      ": " +
      context
    );
  }
  function outlineLayerAnnouncement(
    input?: Dynamic,
    options: Dynamic = AccessibilityAnnouncementsConstant,
  ): Dynamic {
    let value: Dynamic = input.siblings.length <= 1,
      value2: Dynamic =
        " selected, " +
        (value
          ? uiMessage("inspector.announcements.theOnlyLayerAtThis")
          : outlineSiblingPosition(input)) +
        (input.node.hidden ? ", hidden" : "") +
        (value && input.node.children.length > 0 ? ". Return goes deeper" : ""),
      value3: Dynamic = outlineNodeDescription(input.node),
      value4: Dynamic = options - value2.length;
    return (
      (value3.length > value4
        ? truncateAccessibleLabel(value3, value4)
        : value3) + value2
    );
  }
  function outlineLayerNavigationAnnouncement(input?: Dynamic): Dynamic {
    return (
      outlineLayerAnnouncement(
        input,
        AccessibilityAnnouncementsConstant -
          2 -
          AccessibilityAnnouncementsLabel_15.length,
      ) +
      ". " +
      AccessibilityAnnouncementsLabel_15
    );
  }
  function exitOutlineAnnouncement(input?: Dynamic): Dynamic {
    return uiMessage("inspector.announcements.outOfTheLayersArtboard") + input + "\u201D selected";
  }
  function artboardNotSelectedAnnouncement(input?: Dynamic): Dynamic {
    return (
      uiMessage("inspector.announcements.artboard") + input + "\u201D is not selected. Nothing deleted"
    );
  }
  function elementSelectionAnnouncement(
    input?: Dynamic,
    items?: Dynamic,
  ): Dynamic {
    return items.length === 0
      ? NothingSelectedMessage
      : items.length === 1
        ? outlineNodeDescription(findOutlineNode(input, items[0])) + " selected"
        : String(items.length) + " layers selected";
  }
  function selectionActionRefusalAnnouncement(
    items?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
    value: Dynamic = NothingSelectedMessage,
  ): Dynamic {
    let value2: Dynamic =
      value !== NothingSelectedMessage && value.endsWith(" selected")
        ? value
        : "";
    /^(Note|Shape|Picture|Video) selected$/.test(value2)
      ? (value2 = uiMessage("inspector.announcements.a") + value2.toLowerCase())
      : value2 === items + " selected" && (value2 = uiMessage("inspector.announcements.another") + value2);
    let value3: Dynamic = " is not selected. Nothing " + options + ". ",
      value4: Dynamic =
        value2 !== ""
          ? value2.length > 56
            ? truncateAccessibleLabel(value2.slice(0, -9), 47) + " selected"
            : value2
          : context
            ? uiMessage("inspector.announcements.returnSelectsIt")
            : uiMessage("inspector.announcements.returnOnTheRowItself"),
      value5: Dynamic =
        AccessibilityAnnouncementsConstant - value3.length - value4.length;
    return (
      (items.length > value5 ? truncateAccessibleLabel(items, value5) : items) +
      value3 +
      value4
    );
  }
  function emptyArtboardSelectionAnnouncement(input?: Dynamic): Dynamic {
    return uiMessage("inspector.announcements.artboard") + input + "\u201D selected. It has no layers";
  }
  function artboardLoadingAnnouncement(input?: Dynamic): Dynamic {
    return uiMessage("inspector.announcements.loadingArtboard") + input + "\u201D\u2026";
  }
  function artboardLoadFailureAnnouncement(input?: Dynamic): Dynamic {
    return uiMessage("inspector.announcements.couldnTLoadArtboard") + input + "\u201D";
  }
  function selectingAnnouncement(input?: Dynamic): Dynamic {
    return uiMessage("inspector.announcements.stillSelecting") + input;
  }
  function selectionReadyAnnouncement(input?: Dynamic): Dynamic {
    return input + ". " + AccessibilityAnnouncementsLabel_16;
  }
  function artboardsDeletedAnnouncement(items?: Dynamic): Dynamic {
    return items.length === 1
      ? uiMessage("inspector.announcements.artboard") + items[0] + "\u201D deleted"
      : String(items.length) + " artboards deleted";
  }
  function pageDeletedAnnouncement(
    items?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
  ): Dynamic {
    let value: Dynamic = [
        options > 0
          ? String(options) + (options === 1 ? " artboard" : " artboards")
          : "",
        context > 0
          ? String(context) + (context === 1 ? " object" : " objects")
          : "",
      ].filter((input?: Dynamic): Dynamic => input !== ""),
      value2: Dynamic =
        "\u201D deleted" +
        (value.length > 0 ? " with its " + value.join(" and ") : ""),
      value3: Dynamic = AccessibilityAnnouncementsConstant - 6 - value2.length;
    return (
      uiMessage("inspector.announcements.page") +
      (items.length > value3 ? truncateAccessibleLabel(items, value3) : items) +
      value2
    );
  }
  function objectsDeletedAnnouncement(input?: Dynamic): Dynamic {
    return String(input) + " objects deleted";
  }
  function moveDirectionAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    return input !== 0 && options === 0
      ? input < 0
        ? uiMessage("inspector.announcements.movedLeft")
        : uiMessage("inspector.announcements.movedRight")
      : options !== 0 && input === 0
        ? options < 0
          ? uiMessage("inspector.announcements.movedUp")
          : uiMessage("inspector.announcements.movedDown")
        : "Moved";
  }
  function flipDirectionAnnouncement(input?: Dynamic): Dynamic {
    return input === "horizontal"
      ? uiMessage("inspector.announcements.flippedHorizontally")
      : uiMessage("inspector.announcements.flippedVertically");
  }
  function reorderAnnouncement(input?: Dynamic, options?: Dynamic): Dynamic {
    return options
      ? input < 0
        ? uiMessage("inspector.announcements.movedToFirst")
        : uiMessage("inspector.announcements.movedToLast")
      : input < 0
        ? uiMessage("inspector.announcements.movedUp")
        : uiMessage("inspector.announcements.movedDown");
  }
  function stackingAnnouncement(input?: Dynamic, options?: Dynamic): Dynamic {
    return options
      ? input === "front"
        ? uiMessage("inspector.announcements.broughtToTheFront")
        : uiMessage("inspector.announcements.sentToTheBack")
      : input === "front"
        ? uiMessage("inspector.announcements.alreadyAtTheFront")
        : uiMessage("inspector.announcements.alreadyAtTheBack");
  }
  function propertyAnnouncementLabel(input?: Dynamic): Dynamic {
    if (input === "__text") return "Content";
    if (input.startsWith("@")) {
      let value3: Dynamic = input.slice(1);
      return (
        AccessibilityAnnouncementsHrefSrcAltConfig[value3] ??
        humanizePropertyName(value3)
      );
    }
    let value: Dynamic = (0, runtime.getPropertySpecification)(input);
    if (!value || value.label === "") return humanizePropertyName(input);
    let value2: Dynamic =
      AccessibilityAnnouncementsPaddingMarginConfig[value.section];
    return value2 ? value2 + " " + value.label.toLowerCase() : value.label;
  }
  function humanizePropertyName(input?: Dynamic): Dynamic {
    let value: Dynamic = input.replace(/^-+/, "").replace(/[-_]+/g, " ").trim();
    return value === ""
      ? "Property"
      : value.charAt(0).toUpperCase() + value.slice(1);
  }
  function propertyEditAnnouncement(items?: Dynamic): Dynamic {
    if (items.length === 0) return "Updated";
    let value: Dynamic = propertyAnnouncementLabel(items[0].prop);
    if (items.length > 1)
      return items.every((input?: Dynamic): Dynamic => input.value == null)
        ? value + " reset"
        : value + " updated";
    let { value: value2 }: Dynamic = items[0];
    if (value2 == null) return value + " reset";
    let value3: Dynamic = value2.trim();
    return AccessibilityAnnouncementsPattern.test(value3)
      ? value + " " + value3
      : value + " updated";
  }
  function addContrastToAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
    context?: Dynamic,
    value: Dynamic = (input2?: Dynamic): Dynamic => input2,
  ): Dynamic {
    if (context === undefined) return input;
    let value2: Dynamic = options.find(
        (input2?: Dynamic): Dynamic => input2.prop === "color",
      )?.value,
      value3: Dynamic = value2 == null ? undefined : value(value2),
      value4: Dynamic =
        value3 === undefined ? undefined : resolvedContrastColor(value3, []),
      value5: Dynamic =
        value4 === undefined
          ? undefined
          : (0, runtime.evaluateColorContrast)(value4, context);
    return value5 === undefined
      ? input
      : input + ". " + (0, runtime.summarizeContrastResults)(value5).spoken;
  }
  function sourceLineErrorAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    return (
      uiMessage("inspector.announcements.line") +
      String(input) +
      ": " +
      (AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig[
        options
      ] ?? options.replace(/\s+/g, " "))
    );
  }
  function pausedChangesAnnouncement(items?: Dynamic): Dynamic {
    return (
      (items.length > 80 ? truncateAccessibleLabel(items, 80) : items) +
      ". Changes are paused until it is fixed"
    );
  }
  function discardedCodeChangesAnnouncement(input?: Dynamic): Dynamic {
    return (
      uiMessage("inspector.announcements.unappliedChangesInTheCode") +
      String(input) +
      " could not be read"
    );
  }
  function artboardResizeAnnouncement(
    input?: Dynamic,
    options?: Dynamic,
  ): Dynamic {
    let items: Dynamic = [];
    Math.round(input.w) !== Math.round(options.w) &&
      items.push(uiMessage("inspector.announcements.width") + String(Math.round(options.w)) + "px");
    Math.round(input.h) !== Math.round(options.h) &&
      items.push(
        (items.length > 0 ? uiMessage("inspector.announcements.height2") : uiMessage("inspector.announcements.height")) +
          String(Math.round(options.h)) +
          "px",
      );
    return items.length > 0 ? items.join(", ") : null;
  }
  function backgroundEditAnnouncement(items?: Dynamic): Dynamic {
    return items.length > 0 &&
      items.every((input?: Dynamic): Dynamic => input.value == null)
      ? uiMessage("inspector.announcements.backgroundReset")
      : uiMessage("inspector.announcements.backgroundUpdated");
  }
  bindRuntimeValue(
    runtime,
    "resolveColorTokenValue",
    () => resolveColorTokenValue,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel",
    () => AccessibilityAnnouncementsLabel,
    (value) => {
      AccessibilityAnnouncementsLabel = value;
    },
  );
  bindRuntimeValue(runtime, "contrastTextRole", () => contrastTextRole);
  bindRuntimeValue(runtime, "textContrastContext", () => textContrastContext);
  bindRuntimeValue(
    runtime,
    "resolvedContrastColor",
    () => resolvedContrastColor,
  );
  bindRuntimeValue(runtime, "findOutlineLocation", () => findOutlineLocation);
  bindRuntimeValue(runtime, "adjacentOutlineNode", () => adjacentOutlineNode);
  bindRuntimeValue(
    runtime,
    "deepestSingleOutlineNode",
    () => deepestSingleOutlineNode,
  );
  bindRuntimeValue(
    runtime,
    "firstNestedOutlineNode",
    () => firstNestedOutlineNode,
  );
  bindRuntimeValue(
    runtime,
    "outlineSiblingPosition",
    () => outlineSiblingPosition,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsUndoRedoConfig",
    () => AccessibilityAnnouncementsUndoRedoConfig,
    (value) => {
      AccessibilityAnnouncementsUndoRedoConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "NothingChangedThatStepNoLongerMessage",
    () => NothingChangedThatStepNoLongerMessage,
    (value) => {
      NothingChangedThatStepNoLongerMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "pageUndoFailureMessage",
    () => pageUndoFailureMessage,
  );
  bindRuntimeValue(
    runtime,
    "clipboardActionFailureMessage",
    () => clipboardActionFailureMessage,
  );
  bindRuntimeValue(
    runtime,
    "undoTargetAnnouncement",
    () => undoTargetAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "pendingUndoAnnouncement",
    () => pendingUndoAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "changedArtboardsMessage",
    () => changedArtboardsMessage,
  );
  bindRuntimeValue(
    runtime,
    "summarizeChangedArtboards",
    () => summarizeChangedArtboards,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsUndoRedoConfig_2",
    () => AccessibilityAnnouncementsUndoRedoConfig_2,
    (value) => {
      AccessibilityAnnouncementsUndoRedoConfig_2 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "NothingSelectedMessage",
    () => NothingSelectedMessage,
    (value) => {
      NothingSelectedMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_2",
    () => AccessibilityAnnouncementsLabel_2,
    (value) => {
      AccessibilityAnnouncementsLabel_2 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "pngCopyFailureMessage",
    () => pngCopyFailureMessage,
  );
  bindRuntimeValue(
    runtime,
    "svgCopyFailureMessage",
    () => svgCopyFailureMessage,
  );
  bindRuntimeValue(
    runtime,
    "pictureCopyFailureMessage",
    () => pictureCopyFailureMessage,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_3",
    () => AccessibilityAnnouncementsLabel_3,
    (value) => {
      AccessibilityAnnouncementsLabel_3 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_4",
    () => AccessibilityAnnouncementsLabel_4,
    (value) => {
      AccessibilityAnnouncementsLabel_4 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "clippedSvgCopyMessage",
    () => clippedSvgCopyMessage,
  );
  bindRuntimeValue(
    runtime,
    "missingSvgImagesMessage",
    () => missingSvgImagesMessage,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_5",
    () => AccessibilityAnnouncementsLabel_5,
    (value) => {
      AccessibilityAnnouncementsLabel_5 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ItsPictureCouldnTBeMadeTryMessage",
    () => ItsPictureCouldnTBeMadeTryMessage,
    (value) => {
      ItsPictureCouldnTBeMadeTryMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_6",
    () => AccessibilityAnnouncementsLabel_6,
    (value) => {
      AccessibilityAnnouncementsLabel_6 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_7",
    () => AccessibilityAnnouncementsLabel_7,
    (value) => {
      AccessibilityAnnouncementsLabel_7 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ItsPageHasNothingToDrawMessage",
    () => ItsPageHasNothingToDrawMessage,
    (value) => {
      ItsPageHasNothingToDrawMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_8",
    () => AccessibilityAnnouncementsLabel_8,
    (value) => {
      AccessibilityAnnouncementsLabel_8 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_9",
    () => AccessibilityAnnouncementsLabel_9,
    (value) => {
      AccessibilityAnnouncementsLabel_9 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "missingCopiedImagesMessage",
    () => missingCopiedImagesMessage,
  );
  bindRuntimeValue(
    runtime,
    "emptyClipboardMessage",
    () => emptyClipboardMessage,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_10",
    () => AccessibilityAnnouncementsLabel_10,
    (value) => {
      AccessibilityAnnouncementsLabel_10 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_11",
    () => AccessibilityAnnouncementsLabel_11,
    (value) => {
      AccessibilityAnnouncementsLabel_11 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_12",
    () => AccessibilityAnnouncementsLabel_12,
    (value) => {
      AccessibilityAnnouncementsLabel_12 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_13",
    () => AccessibilityAnnouncementsLabel_13,
    (value) => {
      AccessibilityAnnouncementsLabel_13 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_14",
    () => AccessibilityAnnouncementsLabel_14,
    (value) => {
      AccessibilityAnnouncementsLabel_14 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "fitContentResultMessage",
    () => fitContentResultMessage,
  );
  bindRuntimeValue(runtime, "zoomAnnouncement", () => zoomAnnouncement);
  bindRuntimeValue(runtime, "pageAnnouncement", () => pageAnnouncement);
  bindRuntimeValue(runtime, "canvasSelectionKey", () => canvasSelectionKey);
  bindRuntimeValue(runtime, "findOutlineNode", () => findOutlineNode);
  bindRuntimeValue(
    runtime,
    "outlineNodeDescription",
    () => outlineNodeDescription,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLimit",
    () => AccessibilityAnnouncementsLimit,
    (value) => {
      AccessibilityAnnouncementsLimit = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "truncateAccessibleLabel",
    () => truncateAccessibleLabel,
  );
  bindRuntimeValue(
    runtime,
    "selectionAnnouncement",
    () => selectionAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "artboardPositionAnnouncement",
    () => artboardPositionAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "PressReturnToGoIntoThisMessage",
    () => PressReturnToGoIntoThisMessage,
    (value) => {
      PressReturnToGoIntoThisMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ThisIsTheFirstArtboardMessage",
    () => ThisIsTheFirstArtboardMessage,
    (value) => {
      ThisIsTheFirstArtboardMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ThisIsTheLastArtboardMessage",
    () => ThisIsTheLastArtboardMessage,
    (value) => {
      ThisIsTheLastArtboardMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "ThisIsTheOnlyArtboardMessage",
    () => ThisIsTheOnlyArtboardMessage,
    (value) => {
      ThisIsTheOnlyArtboardMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsResolvedValue",
    () => AccessibilityAnnouncementsResolvedValue,
    (value) => {
      AccessibilityAnnouncementsResolvedValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_15",
    () => AccessibilityAnnouncementsLabel_15,
    (value) => {
      AccessibilityAnnouncementsLabel_15 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsConstant",
    () => AccessibilityAnnouncementsConstant,
    (value) => {
      AccessibilityAnnouncementsConstant = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "outlineLayerAnnouncement",
    () => outlineLayerAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "outlineLayerNavigationAnnouncement",
    () => outlineLayerNavigationAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "exitOutlineAnnouncement",
    () => exitOutlineAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "NoLayersInsideThisOneMessage",
    () => NoLayersInsideThisOneMessage,
    (value) => {
      NoLayersInsideThisOneMessage = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "artboardNotSelectedAnnouncement",
    () => artboardNotSelectedAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "elementSelectionAnnouncement",
    () => elementSelectionAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "selectionActionRefusalAnnouncement",
    () => selectionActionRefusalAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "emptyArtboardSelectionAnnouncement",
    () => emptyArtboardSelectionAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "artboardLoadingAnnouncement",
    () => artboardLoadingAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "artboardLoadFailureAnnouncement",
    () => artboardLoadFailureAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "selectingAnnouncement",
    () => selectingAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_16",
    () => AccessibilityAnnouncementsLabel_16,
    (value) => {
      AccessibilityAnnouncementsLabel_16 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_17",
    () => AccessibilityAnnouncementsLabel_17,
    (value) => {
      AccessibilityAnnouncementsLabel_17 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "selectionReadyAnnouncement",
    () => selectionReadyAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "DeletedValue",
    () => DeletedValue,
    (value) => {
      DeletedValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "CutValue",
    () => CutValue,
    (value) => {
      CutValue = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_18",
    () => AccessibilityAnnouncementsLabel_18,
    (value) => {
      AccessibilityAnnouncementsLabel_18 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_19",
    () => AccessibilityAnnouncementsLabel_19,
    (value) => {
      AccessibilityAnnouncementsLabel_19 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_20",
    () => AccessibilityAnnouncementsLabel_20,
    (value) => {
      AccessibilityAnnouncementsLabel_20 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_21",
    () => AccessibilityAnnouncementsLabel_21,
    (value) => {
      AccessibilityAnnouncementsLabel_21 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_22",
    () => AccessibilityAnnouncementsLabel_22,
    (value) => {
      AccessibilityAnnouncementsLabel_22 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_23",
    () => AccessibilityAnnouncementsLabel_23,
    (value) => {
      AccessibilityAnnouncementsLabel_23 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "artboardsDeletedAnnouncement",
    () => artboardsDeletedAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "pageDeletedAnnouncement",
    () => pageDeletedAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "objectsDeletedAnnouncement",
    () => objectsDeletedAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "moveDirectionAnnouncement",
    () => moveDirectionAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "flipDirectionAnnouncement",
    () => flipDirectionAnnouncement,
  );
  bindRuntimeValue(runtime, "reorderAnnouncement", () => reorderAnnouncement);
  bindRuntimeValue(runtime, "stackingAnnouncement", () => stackingAnnouncement);
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsHrefSrcAltConfig",
    () => AccessibilityAnnouncementsHrefSrcAltConfig,
    (value) => {
      AccessibilityAnnouncementsHrefSrcAltConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsPattern",
    () => AccessibilityAnnouncementsPattern,
    (value) => {
      AccessibilityAnnouncementsPattern = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsPaddingMarginConfig",
    () => AccessibilityAnnouncementsPaddingMarginConfig,
    (value) => {
      AccessibilityAnnouncementsPaddingMarginConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "propertyAnnouncementLabel",
    () => propertyAnnouncementLabel,
  );
  bindRuntimeValue(runtime, "humanizePropertyName", () => humanizePropertyName);
  bindRuntimeValue(
    runtime,
    "propertyEditAnnouncement",
    () => propertyEditAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "addContrastToAnnouncement",
    () => addContrastToAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig",
    () => AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig,
    (value) => {
      AccessibilityAnnouncementsUnexpectedUnexpectedUnexpectedConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "sourceLineErrorAnnouncement",
    () => sourceLineErrorAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "pausedChangesAnnouncement",
    () => pausedChangesAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "discardedCodeChangesAnnouncement",
    () => discardedCodeChangesAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "artboardResizeAnnouncement",
    () => artboardResizeAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "backgroundEditAnnouncement",
    () => backgroundEditAnnouncement,
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsLabel_24",
    () => AccessibilityAnnouncementsLabel_24,
    (value) => {
      AccessibilityAnnouncementsLabel_24 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsHandler",
    () => AccessibilityAnnouncementsHandler,
    (value) => {
      AccessibilityAnnouncementsHandler = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "AccessibilityAnnouncementsReadyUpdatedChangedConfig",
    () => AccessibilityAnnouncementsReadyUpdatedChangedConfig,
    (value) => {
      AccessibilityAnnouncementsReadyUpdatedChangedConfig = value;
    },
  );
  return () => {
    AccessibilityAnnouncementsLabel = uiMessage("inspector.announcements.backgroundColor");
    AccessibilityAnnouncementsUndoRedoConfig = {
      get undo() { return uiMessage("inspector.announcements.nothingToUndo"); },
      get redo() { return uiMessage("inspector.announcements.nothingToRedo"); },
    };
    NothingChangedThatStepNoLongerMessage =
      uiMessage("inspector.announcements.nothingChangedThatStepNo");
    AccessibilityAnnouncementsUndoRedoConfig_2 = {
      undo: "Undone",
      redo: "Redone",
    };
    NothingSelectedMessage = uiMessage("inspector.announcements.nothingSelected");
    AccessibilityAnnouncementsLabel_2 = uiMessage("inspector.announcements.copiedAsAPNG");
    AccessibilityAnnouncementsLabel_3 = uiMessage("inspector.announcements.copiedAsAnSVG");
    AccessibilityAnnouncementsLabel_4 = uiMessage("inspector.announcements.theConversionFailedTryAgain");
    AccessibilityAnnouncementsLabel_5 =
      uiMessage("inspector.announcements.anotherExportIsStillRunning");
    ItsPictureCouldnTBeMadeTryMessage =
      uiMessage("inspector.announcements.itsPictureCouldnTBe");
    AccessibilityAnnouncementsLabel_6 =
      uiMessage("inspector.announcements.itIsnTSelectedAny");
    AccessibilityAnnouncementsLabel_7 = uiMessage("inspector.announcements.itHasNoWidthOr");
    ItsPageHasNothingToDrawMessage = uiMessage("inspector.announcements.itsPageHasNothingTo");
    AccessibilityAnnouncementsLabel_8 =
      uiMessage("inspector.announcements.itsPreviewIsStoppedReload");
    AccessibilityAnnouncementsLabel_9 =
      uiMessage("inspector.announcements.itIsnTVisibleTo");
    AccessibilityAnnouncementsLabel_10 =
      uiMessage("inspector.announcements.pasteHerePlacesOneCopied");
    AccessibilityAnnouncementsLabel_11 = uiMessage("inspector.announcements.noteSelected");
    AccessibilityAnnouncementsLabel_12 = uiMessage("inspector.announcements.shapeSelected");
    AccessibilityAnnouncementsLabel_13 = uiMessage("inspector.announcements.pictureSelected");
    AccessibilityAnnouncementsLabel_14 = uiMessage("inspector.announcements.videoSelected");
    AccessibilityAnnouncementsLimit = 40;
    PressReturnToGoIntoThisMessage =
      uiMessage("inspector.announcements.pressReturnToGoInto");
    ThisIsTheFirstArtboardMessage = uiMessage("inspector.announcements.thisIsTheFirstArtboard");
    ThisIsTheLastArtboardMessage = uiMessage("inspector.announcements.thisIsTheLastArtboard");
    ThisIsTheOnlyArtboardMessage = uiMessage("inspector.announcements.thisIsTheOnlyArtboard");
    AccessibilityAnnouncementsResolvedValue =
      "Tab: next layer \xB7 " +
      ((0, runtime.isApplePlatform)()
        ? "Return: deeper \xB7 \u21E7Return: up"
        : "Enter: deeper \xB7 Shift+Enter: up") +
      " \xB7 Esc: leave";
    AccessibilityAnnouncementsLabel_15 =
      uiMessage("inspector.announcements.tabNextReturnDeeperEscape");
    AccessibilityAnnouncementsConstant = 120;
    NoLayersInsideThisOneMessage = uiMessage("inspector.announcements.noLayersInsideThisOne");
    AccessibilityAnnouncementsLabel_16 =
      uiMessage("inspector.announcements.editingTextEscapeOrTab");
    AccessibilityAnnouncementsLabel_17 = uiMessage("inspector.announcements.textUpdated");
    DeletedValue = "Deleted";
    CutValue = "Cut";
    AccessibilityAnnouncementsLabel_18 = uiMessage("inspector.announcements.noteDeleted");
    AccessibilityAnnouncementsLabel_19 = uiMessage("inspector.announcements.shapeDeleted");
    AccessibilityAnnouncementsLabel_20 = uiMessage("inspector.announcements.pictureDeleted");
    AccessibilityAnnouncementsLabel_21 = uiMessage("inspector.announcements.videoDeleted");
    AccessibilityAnnouncementsLabel_22 = uiMessage("inspector.announcements.linkRemoved");
    AccessibilityAnnouncementsLabel_23 = uiMessage("inspector.announcements.emptyTextBoxRemoved");
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
    AccessibilityAnnouncementsLabel_24 = uiMessage("inspector.announcements.commentModePaused");
    AccessibilityAnnouncementsHandler = (input?: Dynamic): Dynamic =>
      String(input) + (input === 1 ? " artboard" : " artboards");
    AccessibilityAnnouncementsReadyUpdatedChangedConfig = {
      ready: (input?: Dynamic): Dynamic =>
        uiMessage("inspector.announcements.designReady") + AccessibilityAnnouncementsHandler(input),
      updated: (input?: Dynamic): Dynamic =>
        AccessibilityAnnouncementsHandler(input) + " updated",
      changed: (input?: Dynamic): Dynamic =>
        uiMessage("inspector.announcements.designUpdated") +
        (input === 0
          ? uiMessage("inspector.announcements.noArtboardsLeft")
          : AccessibilityAnnouncementsHandler(input) + " in all"),
    };
  };
}

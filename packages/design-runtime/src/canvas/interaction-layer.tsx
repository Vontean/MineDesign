import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { resolveImagePreviewUrl } from "../assets/image-previews";
import { ArtboardFrame } from "./artboard-frame";
import { artboardTweaksRowHeight } from "./artboard-tweaks";
import { artboardBootScheduler } from "./boot-scheduler";
import { ArtboardHeaderActions, ArtboardNoticeAnchor, ArtboardNoticePlane, ArtboardOverlayPlane, CanvasAnchoredPopover, CanvasGapGuides, canvasHandleLabelSize, CanvasRectVisibility, CanvasSnapGuides, commentPointWithinVisibleContent, ConditionalPortal, focusedArtboardContentRect, maxCanvasOverlayZIndex, PositionedSelectionQuickActions, RunWhenSeen, shouldShowArtboardFaceOverlay } from "./chrome";
import { createDeferredPointerClick } from "./deferred-click";
import { ArtboardFocusOverlay } from "./focus-overlay";
import { focusCanvasDocument } from "./focus";
import { selectionChromeCoordinateOverscan } from "./frame-payloads";
import { artboardHeaderTheme, quickActionImagePreviewMaxBytes } from "./header-theme";
import { applyElementRectStyle, artboardOverlayIdPrefixes, canvasContextMenuTargetFromElement, canvasFacePointerAction, inclusiveRectIntersects, isCanvasContextMenuPointer, objectsWithinCanvasMarquee, selectionPointerDownDecision, shouldBeginCanvasMarquee, shouldPassFileDropThroughOverlay } from "./hit-testing";
import { isTouchSelectionStart, prefersDragGesture, preventTouchScroll, watchPointerRelease } from "./image-decode-scheduler";
import { bothTransformAxes, canvasDragActivationDelayMs, canvasDragThresholdPixels, canvasLongPressDelayMs, canvasTouchDragActivationDelayMs, canvasTouchDragThresholdPixels, freehandDrawingAnnotation, freehandSimplifyTolerance, isPrimaryModifierEvent, jsx_Nn, maximumArtboardSize, minimumArtboardSize, placementGhostAnnotation } from "./interaction-geometry";
import { buttonKeyboardActivation } from "./keyboard-activation";
import { ArtboardLayoutGuides } from "./layout-guides";
import { CanvasNote } from "./note";
import { installCanvasPanZoom_binding } from "./pan-zoom";
import { clampPointToRect, insertionPointerMatchesContent, pointerCoordinates, resolveInsertionPointer, visibleArtboardCenter } from "./paste-placement";
import { artboardAboveDistances, artboardTitleHeight, isAboveTitleRect, PendingArtboardFace, PendingArtboards, PendingArtboardTitle, shouldHideArtboardTitle } from "./pending-artboards";
import { PictureDropGhosts, UploadingOverlay } from "./picture-drop-ghost";
import { PlacementGhostFrame } from "./placement-ghost";
import { chooseMountedPreviews, distanceBetweenRects, isPreviewHighlighted, limitMountedPreviewPixels, maxInteractivePreviews, maxMountedPreviews, nextPreviewExpiry, previewMountPriority, previewScaleChanged, recordVisiblePreviewTimes, samePreviewFiles, shouldDelayPreviewMount } from "./preview-mounting";
import { handleQuickActionsArrowKeys } from "./quick-action-keys";
import { CanvasShape, CanvasShape as CanvasShape_r } from "./shape";
import { useSpacePanKeyboard } from "./space-pan";
import { viewportScaleLimits } from "./viewport-memory";
import { ViewportContext, ViewportScale, ViewportScaleThreshold, viewportTransformCss } from "./viewport-store";
import { createElementMoveSessions, hasMultipleEditingGroups } from "./working-state";
import { SelectionRing } from "../cds/components/selection-ring";
import { renderMenuItems } from "../cds/menu/menu";
import { serializeDesignCommentAnchor } from "../comments/anchor-codec";
import { useCanvasComments as R_useCanvasComments } from "../comments/canvas-controller";
import { commentAnchorShortLabel, commentArtboardElementDetail, describeCommentElement } from "../comments/labels";
import { npm_useEventListener_bc } from "../dependencies";
import { AccessibilityAnnouncementsResolvedValue, artboardPositionAnnouncement, PressReturnToGoIntoThisMessage } from "../editor/accessibility/announcements";
import { announce } from "../editor/accessibility/announcer";
import { useInspectorPosture } from "../editor/chrome/inspector-sheet";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { CropDoesNotWorkWhileThisMessage, imageFlipCss } from "../editor/geometry/flip-annotations";
import { resizeRect, resizeRectKeepingAspect, unionRects } from "../editor/geometry/resize";
import { angleBetweenPoints, resizeRotatedRect, snapRotation } from "../editor/geometry/rotation";
import { activeResizeGuides, rectangleSnapGuides, snapResize } from "../editor/geometry/snapping";
import { useLatestCallback } from "../editor/hooks/latest-callback";
import { InspectorColorPickResolvedValue_2 } from "../editor/inspector/color-pick";
import { blurBeforeCrop, MediaCropEditor } from "../editor/media/crop-editor";
import { mediaNaturalDimensions, normalizeCenteredImageCrop, rotatedCropFrame, sameImageCrop } from "../editor/media/crop-geometry";
import { cropFromObjectStyles, parseObjectPosition } from "../editor/media/object-crop";
import { Fef3a2Value, NotesLinkEditingKind, NotesLinkEditingLh } from "../editor/notes/link-editing";
import { OutlineDcOutlineHandler } from "../editor/outline/dc-outline";
import { suppressNativeContextMenu } from "../editor/outline/native-menu";
import { pickerCommentFor, pickerHoverAt } from "../editor/picker/bridge";
import { pickerCursorCss, PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { schedulePrimaryModifierHeld, setPrimaryModifierHeld, subscribePrimaryModifierHeld } from "../editor/primary-modifier";
import { SelectionActionsReplace } from "../editor/selection/actions";
import { boardSelectionItems, emptyBoardSelection, hasBoardSelection } from "../editor/selection/canvas-selection";
import { getSessionStripScrollRow } from "../editor/session-strip/reveal";
import { SessionStrip } from "../editor/session-strip/session-strip";
import { useActiveCropElement } from "../editor/session/element-state";
import { shortenLineEnd, SvgArrowsConstant, SvgArrowsConstant_2, SvgArrowsConstant_3, SvgArrowsCss } from "../editor/svg/arrows";
import { constrainLineAngle, SvgDrawingConstant } from "../editor/svg/drawing";
import { toolbarOverlayHeight, useTouchToolbar } from "../editor/toolbar/layout";
import { supportsClickPlacement } from "../editor/tools";
import { reactDomVectorToolState, reactVectorToolState_2 } from "../editor/vector/tool-state";
import { artboardExportMenuItems } from "../export/artboard-menu";
import { canvasSnapReferenceLines, canvasSnapReferenceObjects, preserveUnroundedDragPosition, snapCanvasDrag } from "../geometry/canvas-snapping";
import { annotationTransformSnapshot, artboardTransformSnapshot, rotateAnnotationAboutPoint, selectionScaleLimits, selectionTransformMembers, selectionUniformScaleTransform, transformAnnotationBounds, transformArtboardBounds, transformTouchedProperties, translatedSelectionTransform } from "../geometry/selection-transform";
import { annotationBounds, annotationRotation, annotationVisibleBounds, artboardRadiusCss, artboardStackOrder, isShapeAnnotation, moveAnnotation, PlatformFileContentConstant_20, PlatformFileContentConstant_8, replaceDesignArtboards, rotatedAnnotationBounds, updateAnnotationCrop, updateAnnotationCss, updateAnnotationTextStyle, updateShapeColor } from "../platform/file-content";
import { getLinkedArtboards, resolveComponentFile } from "../preview/dependency-graph";
import { createPreviewHandle } from "../preview/evaluation";
import { CanvasObjectQuickActions, EditingNoteQuickActions, NoteQuickActions } from "../properties/annotation-quick-actions";
import { hasSelectionQuickActions } from "../properties/selection-quick-actions";
import { openCanvasContextMenu, pressCanvasBackground } from "./interaction-layer/canvas-events";
import { composeSelectedElementComment } from "./interaction-layer/comments";
import { beginBoardDrag, beginHandedOffBoardDrag, subscribeHostDragPointer } from "./interaction-layer/drag";
import { beginCanvasMarquee } from "./interaction-layer/marquee";
import { placePastedImagesOnCanvas, resolvePointerInsertionPoint } from "./interaction-layer/paste";
import { buildObjectPressHandlers, pressArtboardCover, waitPointerReleaseTravel } from "./interaction-layer/press";
import { pickMountedArtboardPreviews } from "./interaction-layer/preview";
import { renderAnnotationQuickActions, renderCanvasObjects, renderImageCropEditor, renderSelectionQuickActions } from "./interaction-layer/render";
import { beginSelectionGroupResize, runSelectionTransformGesture, trackHandleDragGesture } from "./interaction-layer/resize";

var canvasDragSequence: Dynamic;
function toggleArtboardDragCurtain(
  artboard?: Dynamic,
  enabled?: Dynamic,
  templateIds: Dynamic = [],
  passthrough: Dynamic = false,
): Dynamic {
  let value: Dynamic = artboard
    ? createPreviewHandle(artboard.webviewRef.current)
    : null;
  value &&
    pickerHoverAt(
      value,
      enabled,
      templateIds,
      passthrough,
      (enabled && artboard?.textTids()) ?? [],
    );
}
function CanvasInteractionLayer(options?: Dynamic): Dynamic {
  useUiLocale();
  let {
      manifest: manifest,
      onManifestChange: onManifestChange,
      camera: camera,
      canvasScaleRef: canvasScaleRef,
      assets: assets,
      doc: doc,
      editing: editing,
      editable: editable,
      inspect = false,
      frameArmed: frameArmed,
      focusedFile: focusedFile,
      onFocus: onFocus,
      enteredFile = null,
      onEnterPiece: onEnterPiece,
      onFaceDoubleClick: onFaceDoubleClick,
      emptyPieces: emptyPieces,
      onContentHull: onContentHull,
      selectedArtboards: selectedArtboards,
      selectedNotes: selectedNotes,
      onSelectObjects: onSelectObjects,
      onClearSelection: onClearSelection,
      onAddAnnotation: onAddAnnotation,
      onDeleteAnnotation: onDeleteAnnotation,
      onAnnotationCss: onAnnotationCss,
      onReplaceAnnotationMedia: onReplaceAnnotationMedia,
      onOpenPropsPanel: onOpenPropsPanel,
      onMarqueeBegin: onMarqueeBegin,
      onElementPress: onElementPress,
      onCoverPress: onCoverPress,
      onCoverPick: onCoverPick,
      onArmArtboard: onArmArtboard,
      onSetMoveCommit: onSetMoveCommit,
      armedEmpty: armedEmpty,
      onSetMoveSay: onSetMoveSay,
      onPressIntent: onPressIntent,
      pressIntentIs: pressIntentIs,
      routeForwardedKey: routeForwardedKey,
      onDragEvent: onDragEvent,
      onBoxEvent: onBoxEvent,
      dragGhost: dragGhost,
      onHostDrag: onHostDrag,
      onHostGesturing: onHostGesturing,
      dragToast: dragToast,
      quickProps: quickProps,
      onTextFormat: onTextFormat,
      crossFile: crossFile,
      onArtboardReady: onArtboardReady,
      dsVarNames: dsVarNames,
      onDefinedVars: onDefinedVars,
      onArtboardProblems: onArtboardProblems,
      artboardProblems: artboardProblems,
      onShowProblems: onShowProblems,
      artboardNotice: artboardNotice,
      onHandle: onHandle,
      onPreviewDropNotice: onPreviewDropNotice,
      onDuplicateObjects: onDuplicateObjects,
      onDropObjectInto: onDropObjectInto,
      onObjectHover: onObjectHover,
      setMovePieces: setMovePieces,
      onPlayArtboard: onPlayArtboard,
      playingFile = null,
      onExpandArtboard: onExpandArtboard,
      onExportArtboard: onExportArtboard,
      onExportArtboardPdf: onExportArtboardPdf,
      onExportAllArtboardsPdf: onExportAllArtboardsPdf,
      onExportSelectedArtboardsPdf: onExportSelectedArtboardsPdf,
      onExportArtboardHtmlZip: onExportArtboardHtmlZip,
      exportDisabledReason: exportDisabledReason,
      exportRules: exportRules,
      onArtboardSettings: onArtboardSettings,
      onOpenTweaks: onOpenTweaks,
      onToggleTweaks: onToggleTweaks,
      tweaksOpenFile: tweaksOpenFile,
      tweakRows: tweakRows,
      onTweaksRow: onTweaksRow,
      onTweaksDirty: onTweaksDirty,
      artboardSettings: artboardSettings,
      canvasObject: canvasObject,
      outlineArtboards: outlineArtboards,
      presentPropsTick: presentPropsTick,
      onPresentPropsHandled: onPresentPropsHandled,
      fullscreenFile: fullscreenFile,
      phone = false,
      fullscreenBox: fullscreenBox,
      livePins: livePins,
      inUseFiles: inUseFiles,
      onRenameArtboard: onRenameArtboard,
      onCanvasMenu: onCanvasMenu,
      renameRef: renameRef,
      onPanZoom: onPanZoom,
      streamDragFile: streamDragFile,
      onRepeatRefused: onRepeatRefused,
      onHistoryPush: onHistoryPush,
      onModelReparsed: onModelReparsed,
      onHistoryApply: onHistoryApply,
      onHistoryRevoke: onHistoryRevoke,
      onHistoryDrop: onHistoryDrop,
      onTweakEdit: onTweakEdit,
      sessionEpoch: sessionEpoch,
      actionsRef: actionsRef,
      elementMenuHidden = false,
      elementSelection: elementSelection,
      selectedTidsByFile: selectedTidsByFile,
      selectedRectsByFile: selectedRectsByFile,
      onSelectionEvent: onSelectionEvent,
      onSelectionSeq: onSelectionSeq,
      exitGuardRef: exitGuardRef,
      textEditOpenRef: textEditOpenRef,
      settleSessionRef: settleSessionRef,
      commitOpenTextEditRef: commitOpenTextEditRef,
      onSessionDirtyChange: onSessionDirtyChange,
      onEditInput: onEditInput,
      onLocalEdit: onLocalEdit,
      onUndoStack: onUndoStack,
      onToolChange: onToolChange,
      toolResetTick: toolResetTick,
      armedTool: armedTool,
      keyboard: keyboard2,
      onDrawArtboard: onDrawArtboard,
      onImageDrop: onImageDrop,
      onPlaceTool: onPlaceTool,
      onAddShape: onAddShape,
      onAddPen: onAddPen,
      onPlaceBlocked: onPlaceBlocked,
      placeRequest: placeRequest,
      onPlaceHandled: onPlaceHandled,
      onOpenFile: onOpenFile,
      onRevealComment: onRevealComment,
      onCommentsController: onCommentsController,
      onCommenting: onCommenting,
      pageKey = "",
      artboardPicking = false,
    }: Dynamic = options,
    value: Dynamic = !artboardPicking,
    entry: Dynamic = camera.get(),
    value2: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    value3: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic, context?: Dynamic): Dynamic => {
        options2
          ? value2.current.set(input, options2)
          : value2.current.delete(input);
        onHandle(input, options2, context);
      },
    ),
    [value4, value5]: Dynamic = (0, reactVectorToolState_2.useState)(
      null,
    ),
    value6: Dynamic = (0, reactVectorToolState_2.useRef)(value4);
  value6.current = value4;
  let value7: Dynamic =
      value4 && !crossFile && elementSelection?.tids?.length
        ? (...args: Dynamic[]): Dynamic => (composeSelectedElementComment as Dynamic)({ get callback16() { return callback16; }, get camera() { return camera; }, get elementSelection() { return elementSelection; }, get manifest() { return manifest; }, get value2() { return value2; }, get value20() { return value20; }, get value4() { return value4; }, get value9() { return value9; } }, ...args)
        : null,
    value8: Dynamic = value4
      ? (input?: Dynamic, options2?: Dynamic): Dynamic => {
          options2.focus({
            preventScroll: true,
          });
          let value250: Dynamic = serializeDesignCommentAnchor({
              kind: "note",
              id: input,
            }),
            value251: Dynamic = (manifest.annotations ?? []).find(
              (input2?: Dynamic): Dynamic => input2.id === input,
            ),
            bounds: Dynamic = options2.getBoundingClientRect();
          value250 &&
            value4
              .compose(
                value250,
                {
                  x: bounds.left + (window as Dynamic).scrollX,
                  y: bounds.bottom + 48 + (window as Dynamic).scrollY,
                },
                {
                  label: commentAnchorShortLabel({
                    kind: "note",
                    note: value251 ?? {
                      text: "",
                    },
                  }),
                },
              )
              .catch((): Dynamic => {});
        }
      : null,
    value9: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    [value10, value11]: Dynamic = (0,
    reactVectorToolState_2.useState)({}),
    value12: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (source?: Dynamic): Dynamic =>
        isShapeAnnotation(source)
          ? annotationBounds(source).w
          : source.kind === "title1"
            ? (value10[source.id]?.w ??
              NotesLinkEditingKind(source))
            : source.w,
      [value10],
    ),
    value13: Dynamic = (0, reactVectorToolState_2.useRef)([]),
    value14: Dynamic = artboardStackOrder(
      value13.current,
      manifest.artboards,
    );
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    value13.current = value14.map(
      (input?: Dynamic): Dynamic => input.spec.file,
    );
  });
  let entries: Dynamic = new Map(
      value14
        .filter((input?: Dynamic): Dynamic => input.spec.frameless !== true)
        .map(
          (input?: Dynamic, options2?: Dynamic): Dynamic => [
            input.spec.file,
            options2,
          ],
        ),
    ),
    value15: Dynamic = useInspectorPosture(),
    value16: Dynamic = useTouchToolbar(),
    value17: Dynamic = value15 === "sheet" && !value16,
    flag: Dynamic = false,
    value18: Dynamic = editing && (fullscreenFile == null || flag),
    value19: Dynamic = (0, reactVectorToolState_2.useRef)(value18);
  value19.current = value18;
  let value20: Dynamic = focusedArtboardContentRect(
      manifest.artboards,
      fullscreenFile,
      fullscreenBox,
      flag,
      tweakRows,
    ),
    value21: Dynamic = phone && fullscreenFile == null,
    value22: Dynamic =
      value18 || (!value21 && inspect && (fullscreenFile == null || flag)),
    value23: Dynamic = (0, reactVectorToolState_2.useRef)(value22);
  value23.current = value22;
  let callback: Dynamic = (input?: Dynamic): Dynamic =>
      value21 &&
      !flag &&
      shouldDelayPreviewMount(input, {
        editing: value18,
        runsNothing: options.phoneCanvasRunsNothing === true,
      }),
    callback2: Dynamic = (input?: Dynamic): Dynamic => {
      let value250: Dynamic =
        input == null
          ? undefined
          : manifest.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === input,
            );
      return value250 != null && callback(value250);
    },
    value24: Dynamic =
      value21 && !flag
        ? (limitMountedPreviewPixels(
            [...(livePins ?? [])],
            [value18 ? focusedFile : null, playingFile],
            manifest.artboards,
            options.phoneCanvasRunsNothing === true ? 0 : 15e5,
          ).find(
            (input?: Dynamic): Dynamic => livePins?.has(input) !== true,
          ) ?? null)
        : null,
    value25: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value26: Dynamic = (0, reactVectorToolState_2.useRef)(
      selectedTidsByFile,
    );
  value26.current = selectedTidsByFile;
  let [value27, value28]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    value29: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    [value30, value31]: Dynamic = (0,
    reactVectorToolState_2.useState)(false);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    value31(false);
  }, [selectedArtboards, selectedNotes, selectedTidsByFile]);
  let value32: Dynamic = (0,
    reactVectorToolState_2.useCallback)((): Dynamic => {
      let current: Dynamic = value25.current;
      current &&
        (current.raf && cancelAnimationFrame(current.raf),
        (value25.current = null),
        toggleArtboardDragCurtain(value2.current.get(current.file), null));
    }, []),
    callback3: Dynamic = (input?: Dynamic, event?: Dynamic): Dynamic => {
      if (
        !value18 ||
        event.pointerType === "touch" ||
        event.buttons !== 0 ||
        (armedTool != null &&
          armedTool !== "select" &&
          armedTool !== "vector")
      ) {
        value32();
        return;
      }
      value25.current && value25.current.file !== input && value32();
      let value250: Dynamic = (value25.current ??= {
        file: input,
        x: 0,
        y: 0,
        deep: false,
        raf: 0,
      });
      value250.x = event.nativeEvent.offsetX;
      value250.y = event.nativeEvent.offsetY;
      value250.deep = isPrimaryModifierEvent(event);
      setPrimaryModifierHeld(value250.deep);
      !value250.raf &&
        (value250.raf = requestAnimationFrame((): Dynamic => {
          value250.raf = 0;
          value25.current === value250 &&
            toggleArtboardDragCurtain(
              value2.current.get(input),
              {
                x: value250.x,
                y: value250.y,
              },
              value26.current?.[input],
              value250.deep,
            );
        }));
    };
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => value32,
    [focusedFile, armedTool, value18, fullscreenFile, playingFile, value32],
  );
  let value33: Dynamic =
    value18 &&
    !value27 &&
    (armedTool == null || armedTool === "select") &&
    fullscreenFile == null &&
    focusedFile != null &&
    selectedArtboards.has(focusedFile)
      ? focusedFile
      : null;
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = value25.current;
    value33 == null &&
      current?.file === focusedFile &&
      (current.raf && cancelAnimationFrame(current.raf),
      (value25.current = null));
  }, [value33, focusedFile]);
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic =>
      subscribePrimaryModifierHeld(
        (input?: Dynamic): Dynamic => {
          let current: Dynamic = value25.current;
          current &&
            ((current.deep = input),
            !current.raf &&
              toggleArtboardDragCurtain(
                value2.current.get(current.file),
                {
                  x: current.x,
                  y: current.y,
                },
                value26.current?.[current.file],
                input,
              ));
        },
      ),
    [],
  );
  let value34: Dynamic = (0, reactVectorToolState_2.useRef)(camera);
  value34.current = camera;
  (0, reactVectorToolState_2.useLayoutEffect)(
    (): Dynamic => camera.paint(),
  );
  let value35: Dynamic = phone && !flag,
    [value36, value37]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value38: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    callback4: Dynamic = (input?: Dynamic): Dynamic => {
      let entry2: Dynamic = camera.get();
      input.el.style.transform =
        "translate(" +
        String((input.x - entry2.x) * entry2.scale) +
        "px, " +
        String((input.y - entry2.y) * entry2.scale) +
        "px) scale(" +
        String(entry2.scale) +
        ")";
    },
    [value39, value40]: Dynamic = (0,
    reactVectorToolState_2.useState)((): Dynamic => new Map()),
    value41: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    value42: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => {
        let entry2: Dynamic = value2.current.get(input),
          value250: Dynamic = doc.content().files[input];
        !entry2 ||
          value41.current.has(input) ||
          (typeof value250 == "string" &&
            value250.length > quickActionImagePreviewMaxBytes) ||
          (value41.current.add(input),
          entry2.pageFill().then(
            (input2?: Dynamic): Dynamic => {
              let value251: Dynamic = artboardHeaderTheme(
                input2,
              );
              value40(
                (input3?: Dynamic): Dynamic =>
                  input3.has(input) && input3.get(input)?.bg === value251?.bg
                    ? input3
                    : new Map(input3).set(input, value251),
              );
            },
            (): Dynamic => {},
          ));
      },
    ),
    [value43, value44]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value45: Dynamic = (0, reactVectorToolState_2.useRef)(false);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    if (value43 == null) return void (value45.current = false);
    let callback61: Dynamic = (): Dynamic =>
        value44(
          (input?: Dynamic): Dynamic => (input === value43 ? null : input),
        ),
      value250: Dynamic = fullscreenFile === value43;
    if (!value250 && value45.current) return callback61();
    value250 && (value45.current = true);
    let value251: Dynamic = (window as Dynamic).setTimeout(
        callback61,
        value250 ? 400 : 2e3,
      ),
      value252: Dynamic = value250
        ? requestAnimationFrame((): Dynamic => {
            (window as Dynamic).clearTimeout(value251);
            value251 = (window as Dynamic).setTimeout(callback61, 400);
          })
        : 0;
    return (): Dynamic => {
      (window as Dynamic).clearTimeout(value251);
      value252 && cancelAnimationFrame(value252);
    };
  }, [value43, fullscreenFile]);
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic =>
      value43 == null
        ? undefined
        : preventTouchScroll(value9.current),
    [value43],
  );
  let [value46, value47]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value48: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    callback5: Dynamic = (input?: Dynamic): Dynamic => {
      if (input) {
        value48.current.add(input);
        input.style.transform = viewportTransformCss(
          camera.get(),
        );
        return (): Dynamic => {
          value48.current.delete(input);
        };
      }
    },
    value49: Dynamic = useLatestCallback((): Dynamic => {
      value38.current.forEach(callback4);
      let value250: Dynamic = viewportTransformCss(camera.get());
      value48.current.forEach((input?: Dynamic): Dynamic => {
        input.style.transform = value250;
      });
    }),
    [value50, value51]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value52: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    callback6: Dynamic = (source?: Dynamic): Dynamic => {
      if (!value35 || !isShapeAnnotation(source)) return false;
      let value250: Dynamic =
          value130.current.size > 0
            ? value52.current.get(source.id)
            : undefined,
        value251: Dynamic =
          (source.kind === "image" && source.video !== undefined) ||
          ("css" in source &&
            (source.css?.filter !== undefined ||
              source.css?.["backdrop-filter"] !== undefined)),
        value252: Dynamic = annotationBounds(source),
        value253: Dynamic =
          value250 ??
          (!value251 &&
            !selectedNotes.has(source.id) &&
            value252.w * value252.h > 5e5);
      value52.current.set(source.id, value253);
      return value253;
    },
    [value53, value54]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    callback7: Dynamic = (input?: Dynamic, options2?: Dynamic): Dynamic =>
      value35 ? (
        <ConditionalPortal key={input} on={true} to={value53}>
          <div
            ref={callback5}
            className={"absolute left-0 top-0 h-0 w-0"}
            style={{
              transformOrigin: "0 0",
            }}
          >
            {options2}
          </div>
        </ConditionalPortal>
      ) : (
        options2
      ),
    callback8: Dynamic =
      (input?: Dynamic, options2?: Dynamic, context?: Dynamic): Dynamic =>
      (input2?: Dynamic): Dynamic => {
        if (!input2) return;
        let state: Dynamic = {
          el: input2,
          x: options2,
          y: context,
        };
        value38.current.set(input, state);
        callback4(state);
        return (): Dynamic => {
          value38.current.delete(input);
        };
      };
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    value35 && value49();
  });
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => (value35 ? camera.subscribe(value49) : undefined),
    [camera, value35, value49],
  );
  let value55: Dynamic = (0, reactVectorToolState_2.useRef)(
    fullscreenFile,
  );
  value55.current = fullscreenFile;
  let value56: Dynamic = (0, reactVectorToolState_2.useRef)(
    playingFile,
  );
  value56.current = playingFile;
  let value57: Dynamic = (0, reactVectorToolState_2.useRef)({
    files: selectedArtboards,
    notes: selectedNotes,
  });
  value57.current = {
    files: selectedArtboards,
    notes: selectedNotes,
  };
  let value58: Dynamic = (0, reactVectorToolState_2.useRef)(
      new Set(),
    ),
    value59: Dynamic =
      selectedNotes.size === 1 && selectedArtboards.size === 0
        ? [...selectedNotes][0]
        : null,
    value60: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic =>
        onSelectObjects(
          boardSelectionItems({
            file: input,
          }),
          options2 ? "toggle" : "replace",
        ),
    ),
    value61: Dynamic = (0, reactVectorToolState_2.useRef)(
      onSelectObjects,
    );
  value61.current = onSelectObjects;
  let callback9: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.pointerType !== "touch" || !(event.target instanceof Element))
        return false;
      let ancestor: Dynamic = event.target.closest("[data-mega-chrome]");
      switch (ancestor?.getAttribute("data-mega-chrome")) {
        case "set-box-pad":
          return true;
        case "focus-overlay":
        case "face-overlay":
        case "set-overlay":
        case "title": {
          if (
            ancestor.getAttribute("data-mega-chrome") !== "title" &&
            !ancestor.hasAttribute("data-mega-piece")
          )
            return true;
          let value250: Dynamic = ancestor
            .closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          return isTouchSelectionStart(
            event.pointerType,
            value250 != null && value57.current.files.has(value250),
          );
        }
        case "annotation":
          return isTouchSelectionStart(
            event.pointerType,
            value57.current.notes.has(
              ancestor.getAttribute("data-mega-annotation") ?? "",
            ),
          );
        default:
          return false;
      }
    },
    callback10: Dynamic = (event?: Dynamic): Dynamic => {
      if (!(event.target instanceof Element)) return true;
      let ancestor: Dynamic = event.target.closest("[data-mega-chrome]");
      return ancestor == null
        ? true
        : ancestor.getAttribute("data-mega-chrome") === "comments"
          ? prefersDragGesture(event, !!value6.current?.areas)
          : !value19.current &&
              ancestor.getAttribute("data-mega-chrome") === "annotation"
            ? true
            : callback9(event);
    },
    callback11: Dynamic = (): Dynamic =>
      value85.current === "hand" && !value128.current,
    callback12: Dynamic = (event?: Dynamic): Dynamic =>
      isCanvasContextMenuPointer({
        pointerType: event.pointerType,
        button: event.button,
        chrome:
          event.target instanceof Element
            ? event.target
                .closest("[data-mega-chrome]")
                ?.getAttribute("data-mega-chrome")
            : null,
      }),
    callback13: Dynamic = (event?: Dynamic): Dynamic =>
      event.button === 1 ||
      callback12(event) ||
      (event.button === 0 &&
        callback11() &&
        event.target instanceof Element &&
        event.target.hasAttribute("data-mega-pan-blanket")),
    callback14: Dynamic = (event?: Dynamic): Dynamic =>
      shouldBeginCanvasMarquee({
        pointerType: event.pointerType,
        button: event.button,
        tool: value85.current,
        bare:
          event.target === value9.current ||
          (event.target instanceof Element &&
            event.target.getAttribute("data-mega-chrome") === "set-box-pad"),
      }),
    callback15: Dynamic = (event?: Dynamic): Dynamic =>
      ((value85.current === "frame" ||
        value85.current === "note" ||
        supportsClickPlacement(value85.current)) &&
        (!(event.target instanceof Element) ||
          event.target.closest("[data-mega-chrome]") == null)) ||
      (value85.current === "draw" &&
        value84.current != null &&
        event.target instanceof Element &&
        event.target.closest("[data-mega-chrome], [data-mega-artboard]") ==
          null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = value9.current;
    if (!current) return;
    let value250: Dynamic = installCanvasPanZoom_binding({
      element: current,
      getView: (): Dynamic => value34.current.get(),
      setView: (input?: Dynamic): Dynamic => {
        value55.current || value34.current.set(input);
      },
      limits: viewportScaleLimits,
      panSecondaryButton: true,
      shouldPan: (input?: Dynamic): Dynamic =>
        value55.current == null &&
        !value130.current.has("marquee") &&
        (input.button !== 2 || callback12(input)) &&
        (value97() ||
          callback13(input) ||
          (!callback15(input) && !callback14(input) && callback10(input))),
      allowNativeScroll: (event?: Dynamic): Dynamic => {
        let value251: Dynamic =
          event.target instanceof Element
            ? event.target.closest("[data-note-scroll]")
            : null;
        return !value251 ||
          Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
          getComputedStyle(value251).overflowY !== "auto"
          ? false
          : event.deltaY < 0
            ? value251.scrollTop > 0
            : value251.scrollTop + value251.clientHeight <
              value251.scrollHeight - 1;
      },
    });
    return (): Dynamic => value250.destroy();
  }, []);
  let value62: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    value63: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value64: Dynamic = (0, reactVectorToolState_2.useRef)(
      (): Dynamic => {},
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = value9.current;
    if (!current) return;
    let value250: Dynamic = null,
      callback61: Dynamic = (): Dynamic => {
        value62.current || (value63.current = performance.now());
        value62.current = true;
        value250 != null && clearTimeout(value250);
        value250 = setTimeout((): Dynamic => {
          value250 = null;
          value62.current = false;
          value63.current = null;
        }, 280);
      };
    value64.current = callback61;
    current.addEventListener("wheel", callback61, {
      capture: true,
      passive: true,
    });
    return (): Dynamic => {
      value250 != null && clearTimeout(value250);
      current.removeEventListener("wheel", callback61, true);
    };
  }, []);
  let value65: Dynamic = (0, reactVectorToolState_2.useRef)(
    onPanZoom,
  );
  value65.current = onPanZoom;
  let value66: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        let value250: Dynamic = value65.current?.(input, options2) === true;
        value250 &&
          (options2.dx !== 0 ||
            options2.dy !== 0 ||
            (options2.pinch && options2.dz !== 0)) &&
          value64.current();
        return value250;
      },
      [],
    ),
    value67: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value68: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    [value69, value70]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [value71, value72]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [value73, value74]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [value75, value76]: Dynamic = (0,
    reactVectorToolState_2.useState)(null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    armedTool !== "note" && value76(null);
  }, [armedTool]);
  let [value77, value78]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value79: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    [value80, value81]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [value82, value83]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value84: Dynamic = (0, reactVectorToolState_2.useRef)(onAddPen);
  value84.current = onAddPen;
  let value85: Dynamic = (0, reactVectorToolState_2.useRef)(
    armedTool,
  );
  value85.current = armedTool;
  let [value86, value87]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    value88: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value89: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value90: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (input?: Dynamic): Dynamic => {
        value89.current = input;
        applyElementRectStyle(input, value88.current);
      },
      [],
    ),
    value91: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    callback16: Dynamic = (
      input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let entry2: Dynamic = camera.get();
      return {
        x: entry2.x + (input - context.left) / entry2.scale,
        y: entry2.y + (options2 - context.top) / entry2.scale,
      };
    },
    callback17: Dynamic = (...args: Dynamic[]): Dynamic => (waitPointerReleaseTravel as Dynamic)({ get value9() { return value9; } }, ...args),
    callback18: Dynamic = (...args: Dynamic[]): Dynamic => (pressArtboardCover as Dynamic)({ get callback17() { return callback17; }, get callback19() { return callback19; }, get callback46() { return callback46; }, get callback53() { return callback53; }, get onArmArtboard() { return onArmArtboard; }, get onCoverPick() { return onCoverPick; }, get onCoverPress() { return onCoverPress; }, get onElementPress() { return onElementPress; }, get onFocus() { return onFocus; }, get onPressIntent() { return onPressIntent; }, get onSelectObjects() { return onSelectObjects; }, get onSetMoveCommit() { return onSetMoveCommit; }, get pressIntentIs() { return pressIntentIs; }, get value2() { return value2; }, get value222() { return value222; }, get value26() { return value26; }, get value29() { return value29; }, get value57() { return value57; }, get value60() { return value60; }, get value92() { return value92; } }, ...args),
    value92: Dynamic = (0, reactVectorToolState_2.useRef)(
      onMarqueeBegin,
    );
  value92.current = onMarqueeBegin;
  let callback19: Dynamic = (...args: Dynamic[]): Dynamic => (beginCanvasMarquee as Dynamic)({ get callback16() { return callback16; }, get value134() { return value134; }, get value146() { return value146; }, get value19() { return value19; }, get value2() { return value2; }, get value216() { return value216; }, get value34() { return value34; }, get value57() { return value57; }, get value61() { return value61; }, get value87() { return value87; }, get value88() { return value88; }, get value89() { return value89; }, get value9() { return value9; }, get value91() { return value91; }, get value92() { return value92; } }, ...args),
    value93: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        if (options2.type === "drop") {
          let value250: Dynamic = value146.current.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === input,
            ),
            value251: Dynamic = value9.current?.getBoundingClientRect();
          if (value250 && value251) {
            let entry2: Dynamic = camera.get(),
              value252: Dynamic =
                (value250.x + options2.x - entry2.x) * entry2.scale +
                value251.left,
              value253: Dynamic =
                (value250.y + options2.y - entry2.y) * entry2.scale +
                value251.top;
            if (
              value252 < value251.left ||
              value252 > value251.right ||
              value253 < value251.top ||
              value253 > value251.bottom
            ) {
              onDragEvent?.(input, {
                type: "cancel",
                key: options2.key,
              });
              return;
            }
          }
        }
        onDragEvent?.(input, options2);
      },
      [onDragEvent, camera],
    ),
    value94: Dynamic = (0, reactVectorToolState_2.useRef)(onHostDrag);
  value94.current = onHostDrag;
  (0, reactVectorToolState_2.useEffect)((...args: Dynamic[]): Dynamic => (subscribeHostDragPointer as Dynamic)({ get callback16() { return callback16; }, get streamDragFile() { return streamDragFile; }, get value9() { return value9; }, get value94() { return value94; } }, ...args), [streamDragFile]);
  let callback20: Dynamic = (event?: Dynamic): Dynamic =>
      event.target instanceof Node &&
      event.currentTarget.contains(event.target),
    {
      held: value95,
      heldRef: value96,
      claimPan: value97,
    }: Dynamic = useSpacePanKeyboard(),
    [value98, value99]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value100: Dynamic = (0, reactVectorToolState_2.useRef)(null);
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => (): Dynamic => value100.current?.release(),
    [],
  );
  let callback21: Dynamic = (
      input?: Dynamic,
      options2?: Dynamic,
    ): Dynamic => {
      value100.current?.release();
      let callback61: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener(
            "pointermove",
            callback62,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointerout",
            callback62,
            true,
          );
          value100.current = null;
        },
        callback62: Dynamic = (event?: Dynamic): Dynamic => {
          let value250: Dynamic =
            event.type !== "pointerout"
              ? event.target
              : event.relatedTarget instanceof HTMLIFrameElement
                ? event.relatedTarget
                : null;
          (event.type === "pointerout"
            ? event.relatedTarget != null && value250 == null
            : isAboveTitleRect(
                event.clientX,
                event.clientY,
                input.getBoundingClientRect(),
              )) ||
            (callback61(),
            value99(
              value250 instanceof Element
                ? (value250
                    .closest("[data-mega-artboard]")
                    ?.getAttribute("data-mega-artboard") ?? null)
                : null,
            ));
        };
      (window as Dynamic).addEventListener("pointermove", callback62, true);
      (window as Dynamic).addEventListener("pointerout", callback62, true);
      value100.current = {
        el: input,
        file: options2,
        release: callback61,
      };
    },
    callback22: Dynamic = (input?: Dynamic, options2?: Dynamic): Dynamic => {
      let current: Dynamic = value100.current;
      return (
        current != null &&
        current.file !== options2 &&
        isAboveTitleRect(
          input.clientX,
          input.clientY,
          current.el.getBoundingClientRect(),
        )
      );
    },
    [value101, value102]: Dynamic = (0,
    reactVectorToolState_2.useState)(new Map()),
    value103: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    callback23: Dynamic = (input?: Dynamic): Dynamic => {
      let entry2: Dynamic = value103.current.get(input);
      entry2 ||
        ((entry2 = (input2?: Dynamic): Dynamic =>
          value102((input3?: Dynamic): Dynamic => {
            if ((input3.get(input) ?? null) === input2) return input3;
            let entries2: Dynamic = new Map(input3);
            input2 ? entries2.set(input, input2) : entries2.delete(input);
            return entries2;
          })),
        value103.current.set(input, entry2));
      return entry2;
    },
    [value104, value105]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value106: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    callback24: Dynamic = (input?: Dynamic): Dynamic => {
      value106.current = false;
      value105(input);
    };
  renameRef && (renameRef.current = callback24);
  let value107: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        options2.keyboard !== true &&
          (value148.current = {
            x: options2.x,
            y: options2.y,
            inFrame: false,
          });
        onCanvasMenu?.(input, options2);
      },
    ),
    [value108]: Dynamic = (0, reactVectorToolState_2.useState)(
      (): Dynamic =>
        createDeferredPointerClick(
          (input?: Dynamic, options2?: Dynamic): Dynamic =>
            value107(options2, input),
        ),
    ),
    value109: Dynamic = (0, reactVectorToolState_2.useRef)(null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let callback61: Dynamic = (event?: Dynamic): Dynamic => {
      value109.current =
        event.button === 2 &&
        event.target instanceof Element &&
        event.target.hasAttribute("data-mc-scrim")
          ? {
              x: event.clientX,
              y: event.clientY,
            }
          : null;
    };
    (window as Dynamic).addEventListener("pointerdown", callback61, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener(
        "pointerdown",
        callback61,
        true,
      );
  }, []);
  let [value110, value111]: Dynamic = (0,
  reactVectorToolState_2.useState)(null);
  value110 &&
    !manifest.artboards.some(
      (input?: Dynamic): Dynamic => input.file === value110.file,
    ) &&
    value111(null);
  let [value112, value113]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [value114, value115]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value116: Dynamic = (0, reactVectorToolState_2.useRef)(value114);
  value116.current = value114;
  let value117: Dynamic = useActiveCropElement(),
    [, value118]: Dynamic = (0, reactVectorToolState_2.useState)(0),
    value119: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (): Dynamic => value118((input?: Dynamic): Dynamic => input + 1),
      [],
    ),
    callback25: Dynamic = (input?: Dynamic): Dynamic => {
      let value250: Dynamic = value9.current?.querySelector(
          '[data-testid="mega-shape-body-' + input + '"]',
        ),
        value251: Dynamic = value250?.matches("img, video")
          ? value250
          : value250?.querySelector("img, video");
      return value250 &&
        value251 &&
        value251.dataset.megaPicture === "" &&
        mediaNaturalDimensions(value251)
        ? {
            img: value251,
            body: value250,
          }
        : null;
    },
    callback26: Dynamic = (input?: Dynamic): Dynamic =>
      input.local.x !== 0 ||
      input.local.y !== 0 ||
      input.local.w !== input.pad0.w ||
      input.local.h !== input.pad0.h,
    callback27: Dynamic = (input?: Dynamic): Dynamic => {
      if (!callback26(input)) return null;
      let value250: Dynamic = rotatedCropFrame(
        input.pad0,
        (input.rot * Math.PI) / 180,
        input.local,
      );
      return {
        x: value250.x - input.edge.l,
        y: value250.y - input.edge.t,
        w: value250.w + input.edge.l + input.edge.r,
        h: value250.h + input.edge.t + input.edge.b,
      };
    },
    callback28: Dynamic = (input?: Dynamic): Dynamic => {
      if (!callback25(input)) return;
      let value250: Dynamic = (value146.current.annotations ?? []).find(
        (input2?: Dynamic): Dynamic => input2.id === input,
      );
      if (value250 && imageFlipCss(value250))
        return void onSetMoveSay?.(CropDoesNotWorkWhileThisMessage);
      (0, reactDomVectorToolState.flushSync)(blurBeforeCrop);
      let value251: Dynamic = (value146.current.annotations ?? []).find(
          (input2?: Dynamic): Dynamic => input2.id === input,
        ),
        value252: Dynamic = callback25(input);
      if (value251?.kind !== "image" || !value252) return;
      let value253: Dynamic = mediaNaturalDimensions(
          value252.img,
        ),
        state: Dynamic = {
          l: value252.body.clientLeft,
          t: value252.body.clientTop,
          r:
            value251.w - value252.body.clientLeft - value252.body.clientWidth,
          b:
            value251.h - value252.body.clientTop - value252.body.clientHeight,
        },
        state2: Dynamic = {
          x: 0,
          y: 0,
          w: value252.body.clientWidth,
          h: value252.body.clientHeight,
        },
        value254: Dynamic = getComputedStyle(value252.img),
        value255: Dynamic =
          value251.crop ??
          cropFromObjectStyles(state2, value253, {
            fit: value254.objectFit,
            pos: parseObjectPosition(value254.objectPosition),
            box: null,
          });
      value115({
        id: input,
        src: value251.src,
        natural: value253,
        rot: annotationRotation(value251),
        pad0: {
          x: value251.x + state.l,
          y: value251.y + state.t,
          w: state2.w,
          h: state2.h,
        },
        edge: state,
        local: state2,
        live: value255,
        before: value255,
      });
    },
    value120: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => {
        let current: Dynamic = value116.current;
        if (!current) return;
        value116.current = null;
        value115(null);
        let value250: Dynamic = (value146.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === current.id,
          ),
          value251: Dynamic = normalizeCenteredImageCrop(
            current.local,
            current.natural,
            current.live,
          ),
          value252: Dynamic = callback26(current);
        if (
          !input ||
          value250?.kind !== "image" ||
          value250.src !== current.src ||
          (!value252 &&
            sameImageCrop(
              value251,
              normalizeCenteredImageCrop(
                current.pad0,
                current.natural,
                current.before,
              ),
            ))
        )
          return;
        let { "object-position": value253, ...value254 }: Dynamic =
            value250.css ?? {},
          value255: Dynamic = callback27(current);
        callback34(
          current.id,
          (source?: Dynamic): Dynamic =>
            source.kind === "image"
              ? updateAnnotationCrop(
                  {
                    ...updateAnnotationCss(source, {
                      ...value254,
                      "object-fit": "cover",
                    }),
                    ...value255,
                  },
                  value251,
                )
              : source,
          true,
        );
        announce(
          value251 || value252 ? "Cropped." : uiMessage("canvas.interactionLayer.cropRemoved"),
        );
      },
    ),
    value121: Dynamic = value114
      ? (manifest.annotations ?? []).find(
          (input?: Dynamic): Dynamic => input.id === value114.id,
        )
      : undefined,
    value122: Dynamic =
      value114 !== null &&
      (!value18 ||
        value121?.kind !== "image" ||
        value121.src !== value114.src),
    value123: Dynamic =
      value114 !== null &&
      (value59 !== value114.id ||
        supportsClickPlacement(armedTool) ||
        armedTool === "draw" ||
        fullscreenFile != null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    value122 ? value120(false) : value123 && value120(true);
  }, [value122, value123, value120]);
  let [value124, value125]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    [value126, value127]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    value128: Dynamic = (0, reactVectorToolState_2.useRef)(value126);
  value128.current = value126;
  let value129: Dynamic = value95 || (armedTool === "hand" && !value126),
    value130: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    value131: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    value132: Dynamic = (0, reactVectorToolState_2.useRef)(
      onHostGesturing,
    );
  value132.current = onHostGesturing;
  let callback29: Dynamic = (): Dynamic => {
      let value250: Dynamic = value130.current.size > 0 || value131.current;
      value9.current?.toggleAttribute("data-mega-frames-inert", value250);
      value132.current?.(value250);
    },
    value133: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value134: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        let current: Dynamic = value130.current;
        options2 &&
          current.size === 0 &&
          (value133.current = performance.now());
        options2 ? current.add(input) : current.delete(input);
        current.size === 0 && (value133.current = null);
        value125(current.size > 0);
        callback29();
      },
    ),
    value135: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (
        input?: Dynamic,
        options2?: Dynamic,
        context?: Dynamic,
        value250?: Dynamic,
      ): Dynamic => {
        value130.current.size > 0 ||
          (value250 && !context && (document as Dynamic).hasFocus()) ||
          schedulePrimaryModifierHeld(context);
      },
      [],
    ),
    callback30: Dynamic = (
      input?: Dynamic,
      options2: Dynamic = 0,
    ): Dynamic => {
      let callback61: Dynamic = (input2?: Dynamic): Dynamic => {
        options2 === 2 && value108.move(input2);
        input2.pointerType !== "touch" &&
          (input2.buttons & options2) === 0 &&
          callback62(input2);
      };
      options2 === 2 && suppressNativeContextMenu(true);
      let callback62: Dynamic = (input2?: Dynamic): Dynamic => {
        (window as Dynamic).removeEventListener("pointerup", callback62);
        (window as Dynamic).removeEventListener("pointercancel", callback62);
        options2 &&
          (window as Dynamic).removeEventListener("pointermove", callback61);
        options2 === 2 && suppressNativeContextMenu(false);
        options2 === 2 && value108.end(input2.type !== "pointercancel");
        value134(input, false);
        input === "pan" &&
          value9.current?.removeAttribute("data-mega-grabbing");
        input === "frame-drag" && value218.current(input2.pointerId);
      };
      (window as Dynamic).addEventListener("pointerup", callback62);
      (window as Dynamic).addEventListener("pointercancel", callback62);
      options2 &&
        (window as Dynamic).addEventListener("pointermove", callback61);
    };
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let callback61: Dynamic = (input?: Dynamic): Dynamic => {
        value131.current = input;
        callback29();
      },
      callback62: Dynamic = (): Dynamic => callback61(false),
      callback63: Dynamic = (input?: Dynamic): Dynamic => {
        input.pointerType === "mouse" &&
          input.button === 0 &&
          callback61(true);
      },
      callback64: Dynamic = (): Dynamic => {
        (document as Dynamic).hasFocus() || callback62();
      };
    (window as Dynamic).addEventListener("pointerdown", callback63, true);
    (window as Dynamic).addEventListener("pointerup", callback62, true);
    (window as Dynamic).addEventListener("pointercancel", callback62, true);
    (window as Dynamic).addEventListener("contextmenu", callback62, true);
    (window as Dynamic).addEventListener("blur", callback64);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener(
        "pointerdown",
        callback63,
        true,
      );
      (window as Dynamic).removeEventListener("pointerup", callback62, true);
      (window as Dynamic).removeEventListener(
        "pointercancel",
        callback62,
        true,
      );
      (window as Dynamic).removeEventListener(
        "contextmenu",
        callback62,
        true,
      );
      (window as Dynamic).removeEventListener("blur", callback64);
    };
  }, []);
  let [value136, value137]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    value138: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value139: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        input === focusedFile &&
          (value138.current != null && clearTimeout(value138.current),
          (value138.current = options2
            ? setTimeout((): Dynamic => value137(false), 1e4)
            : null),
          value137(options2));
      },
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    value137(false);
    value138.current != null &&
      (clearTimeout(value138.current), (value138.current = null));
  }, [focusedFile]);
  let [value140, value141]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value142: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        input === focusedFile && value141(options2);
      },
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    value141(null);
  }, [focusedFile]);
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    for (let value250 of (value9.current?.querySelectorAll(
      "[data-mega-selection-strip]",
    ) ?? []) as Dynamic)
      getSessionStripScrollRow(value250).scrollLeft = 0;
  }, [elementSelection?.identity, value59, value140 != null, value112]);
  let value143: Dynamic = (0, reactVectorToolState_2.useId)(),
    value144: Dynamic = keyboard2?.inside ?? null,
    value145: Dynamic = useLatestCallback(
      (): Dynamic =>
        (armedTool != null && armedTool !== "select") || value136,
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let callback61: Dynamic = (event?: Dynamic): Dynamic => {
      event.key !== "Escape" ||
        !event.repeat ||
        (event.target instanceof Element &&
          event.target.hasAttribute("data-mega-title-text") &&
          event.preventDefault());
    };
    (window as Dynamic).addEventListener("keydown", callback61, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", callback61, true);
  }, []);
  let value146: Dynamic = (0, reactVectorToolState_2.useRef)(
    manifest,
  );
  value146.current = manifest;
  let value147: Dynamic = (0, reactVectorToolState_2.useRef)(
      new Map(),
    ),
    callback31: Dynamic = (input?: Dynamic): Dynamic => {
      let entry2: Dynamic = value147.current.get(input.file);
      if (entry2 && entry2.w === input.w && entry2.h === input.h)
        return entry2;
      let state: Dynamic = {
        w: input.w,
        h: input.h,
      };
      value147.current.set(input.file, state);
      return state;
    },
    value148: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value149: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    callback32: Dynamic = (event?: Dynamic): Dynamic => {
      let value250: Dynamic =
          event.target instanceof Element &&
          event.target.tagName === "IFRAME",
        value251: Dynamic = value250
          ? (event.target.closest("[data-mega-artboard]")?.dataset
              .megaArtboard ?? null)
          : null;
      value149.current = null;
      value148.current =
        event.pointerType !== "touch" && callback20(event)
          ? {
              x: event.clientX,
              y: event.clientY,
              inFrame: value250,
              frameFile: value251,
            }
          : null;
    },
    callback33: Dynamic = (): Dynamic => {
      let current: Dynamic = value148.current;
      current &&
        !current.inFrame &&
        (value148.current = {
          ...current,
          inFrame: true,
          stale: true,
        });
      value32();
    },
    value150: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => onOpenTweaks?.(input),
    ),
    value151: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => onToggleTweaks?.(input),
    ),
    value152: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => onOpenFile?.(input),
    ),
    value153: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic =>
        onPreviewDropNotice(input, options2),
    ),
    value154: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => onExpandArtboard?.(input),
    ),
    value155: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => onShowProblems?.(input),
    ),
    value156: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => {
        value21 &&
          ((document as Dynamic).activeElement instanceof HTMLElement &&
            (document as Dynamic).activeElement.blur(),
          value44(input));
        value154(input);
      },
    ),
    value157: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => {
        value56.current !== input
          ? onPlayArtboard?.(input)
          : value22
            ? onFocus(input)
            : onPlayArtboard?.(null);
      },
    ),
    value158: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        value60(input, options2);
        value22 &&
          !callback2(input) &&
          !options2 &&
          !artboardPicking &&
          value56.current !== input &&
          onFocus(input);
      },
    ),
    value159: Dynamic = quickProps?.seed ?? null,
    value160: Dynamic = JSON.stringify(
      value159,
      (input?: Dynamic, options2?: Dynamic): Dynamic =>
        typeof options2 == "function"
          ? undefined
          : options2 instanceof Set
            ? [...options2].sort()
            : options2 instanceof Map
              ? [...options2.entries()]
              : options2,
    ),
    value161: Dynamic = (0, reactVectorToolState_2.useRef)({
      key: value160,
      seed: value159,
    });
  value161.current.key !== value160 &&
    (value161.current = {
      key: value160,
      seed: value159,
    });
  let seed: Dynamic = value161.current.seed,
    value162: Dynamic = useLatestCallback(
      (): Dynamic => actionsRef.current?.openProps(),
    ),
    value163: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic =>
        quickProps?.onApply(input, options2) ?? Promise.resolve(false),
    ),
    value164: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => quickProps?.onGesture(input),
    ),
    value165: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => onTextFormat?.(input),
    ),
    value166: Dynamic = useLatestCallback(
      (...input: Dynamic[]): Dynamic => quickProps?.onEditText?.(...input),
    ),
    value167: Dynamic = useLatestCallback(
      (...input: Dynamic[]): Dynamic =>
        quickProps?.onReplaceImage?.(...input),
    ),
    value168: Dynamic = useLatestCallback(
      (): Dynamic => quickProps?.onCrop?.(),
    ),
    value169: Dynamic = useLatestCallback(
      (): Dynamic => quickProps?.onReplaceVideo?.(),
    ),
    value170: Dynamic = useLatestCallback(
      (): Dynamic => quickProps?.findVideo?.() ?? null,
    ),
    value171: Dynamic = useLatestCallback(
      (...input: Dynamic[]): Dynamic => quickProps?.onElementLink?.(...input),
    ),
    value172: Dynamic = useLatestCallback(
      (...input: Dynamic[]): Dynamic => value7?.(...input),
    ),
    value173: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic =>
        value111(
          options2
            ? {
                file: input,
                open: true,
              }
            : (input2?: Dynamic): Dynamic =>
                input2 && {
                  ...input2,
                  open: false,
                },
        ),
    ),
    value174: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        options2 && value182.current === input && callback33();
      },
    ),
    value175: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        value182.current === input &&
          (value149.current = {
            file: input,
            ...options2,
          });
      },
    ),
    value176: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (...args: Dynamic[]): Dynamic => (resolvePointerInsertionPoint as Dynamic)({ get callback11() { return callback11; }, get callback16() { return callback16; }, get value146() { return value146; }, get value148() { return value148; }, get value182() { return value182; }, get value183() { return value183; }, get value55() { return value55; }, get value56() { return value56; }, get value9() { return value9; }, get value96() { return value96; } }, ...args),
      [],
    ),
    value177: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (): Dynamic => value176("content"),
      [value176],
    ),
    value178: Dynamic = (0,
    reactVectorToolState_2.useCallback)((): Dynamic => {
      let current: Dynamic = value148.current,
        current2: Dynamic = value9.current,
        current3: Dynamic = value182.current;
      if (
        !current ||
        !current2 ||
        !value23.current ||
        value55.current != null ||
        value96.current ||
        callback11()
      )
        return pointerCoordinates(value176("artboards"));
      let value250: Dynamic = current.inFrame
          ? null
          : (document as Dynamic).elementFromPoint(current.x, current.y),
        value251: Dynamic = resolveInsertionPointer(
          current,
          value149.current,
          current3,
          value250?.tagName === "IFRAME" &&
            value250.closest("[data-mega-artboard]")?.dataset.megaArtboard ===
              current3,
        ),
        value252: Dynamic =
          value251 &&
          value146.current.artboards.find(
            (input?: Dynamic): Dynamic => input.file === current3,
          );
      if (!value251 || !value252)
        return pointerCoordinates(value176("artboards"));
      let bounds: Dynamic = current2.getBoundingClientRect(),
        entry2: Dynamic = camera.get(),
        callback61: Dynamic = (input?: Dynamic): Dynamic => {
          let value253: Dynamic = clampPointToRect(
              callback16(input.x, input.y, bounds),
              value252,
            ),
            [items, items2]: Dynamic = [
              bounds.left + (value253.x - entry2.x) * entry2.scale,
              bounds.top + (value253.y - entry2.y) * entry2.scale,
            ];
          return items < bounds.left ||
            items > bounds.right ||
            items2 < bounds.top ||
            items2 > bounds.bottom
            ? null
            : value253;
        };
      return (
        callback61(value251) ??
        (value251 === current ? null : callback61(current))
      );
    }, [value176]);
  options.pastePointRef && (options.pastePointRef.current = value177);
  options.artboardLandingRef &&
    (options.artboardLandingRef.current = value178);
  let value179: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (...args: Dynamic[]): Dynamic => (placePastedImagesOnCanvas as Dynamic)({ get camera() { return camera; }, get onImageDrop() { return onImageDrop; }, get value146() { return value146; }, get value177() { return value177; }, get value55() { return value55; }, get value57() { return value57; }, get value9() { return value9; } }, ...args),
      [onImageDrop, value177, camera],
    ),
    value180: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (input?: Dynamic, options2?: Dynamic, context?: Dynamic): Dynamic => {
        let value250: Dynamic = value146.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (!onImageDrop || !value250) return;
        let value251: Dynamic = value9.current?.getBoundingClientRect(),
          value252: Dynamic = context.at
            ? {
                x: value250.x + context.at.x,
                y: value250.y + context.at.y,
              }
            : visibleArtboardCenter(
                value250,
                value55.current == null && value251
                  ? {
                      ...camera.get(),
                      width: value251.width,
                      height: value251.height,
                    }
                  : null,
              );
        onImageDrop(
          options2,
          value252.x,
          value252.y,
          context.verb,
          value250.file,
          context.at ?? undefined,
          context.after,
        );
      },
      [onImageDrop, camera],
    ),
    value181: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (input?: Dynamic): Dynamic =>
        resolveImagePreviewUrl(input, doc.content().files),
      [doc],
    ),
    callback34: Dynamic = (
      input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let current: Dynamic = value146.current;
      onManifestChange(
        {
          ...current,
          annotations: (current.annotations ?? []).map(
            (input2?: Dynamic): Dynamic =>
              input2.id === input ? options2(input2) : input2,
          ),
        },
        context,
      );
    },
    value182: Dynamic = (0, reactVectorToolState_2.useRef)(
      focusedFile,
    );
  value182.current = focusedFile;
  let value183: Dynamic = (0, reactVectorToolState_2.useRef)(
    enteredFile,
  );
  value183.current = enteredFile;
  let value184: Dynamic = (0, reactVectorToolState_2.useRef)(
    livePins,
  );
  value184.current = livePins;
  let value185: Dynamic = (0, reactVectorToolState_2.useRef)(
    inUseFiles,
  );
  value185.current = inUseFiles;
  let value186: Dynamic = (0, reactVectorToolState_2.useRef)([]),
    [value187]: Dynamic = (0, reactVectorToolState_2.useState)(
      maxInteractivePreviews,
    ),
    [value188]: Dynamic = (0, reactVectorToolState_2.useState)(
      maxMountedPreviews,
    ),
    [value189, value190]: Dynamic = (0,
    reactVectorToolState_2.useState)(
      (): Dynamic => getLinkedArtboards(doc.content().files),
    ),
    value191: Dynamic = (0, reactVectorToolState_2.useRef)({}),
    value192: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    callback35: Dynamic = (): Dynamic => {
      clearTimeout(value192.current);
      value192.current = setTimeout((): Dynamic => {
        value192.current = undefined;
        let value250: Dynamic = getLinkedArtboards({
          ...doc.content().files,
          ...value191.current,
        });
        value190(
          (input?: Dynamic): Dynamic =>
            samePreviewFiles(input, value250) ? input : value250,
        );
      }, 150);
    };
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    value191.current = {};
    callback35();
    let value250: Dynamic = doc.subscribe((): Dynamic => {
      value191.current = {};
      value41.current.clear();
      callback35();
    });
    return (): Dynamic => {
      value250();
      clearTimeout(value192.current);
      value192.current = undefined;
    };
  }, [doc]);
  npm_useEventListener_bc(
    "dc-update",
    (input?: Dynamic): Dynamic => {
      let value250: Dynamic = resolveComponentFile(
        doc.content().files,
        input.detail,
      );
      value250 != null &&
        ((value191.current[value250] = input.detail.content), callback35());
    },
  );
  let value193: Dynamic = (0, reactVectorToolState_2.useMemo)(
      (): Dynamic =>
        outlineArtboards
          ? {
              ...outlineArtboards,
              components: value189,
            }
          : null,
      [outlineArtboards, value189],
    ),
    callback36: Dynamic = (input?: Dynamic): Dynamic => {
      let value250: Dynamic = value186.current.filter(
        (input2?: Dynamic): Dynamic => input2 !== input,
      );
      value250.unshift(input);
      value186.current = value250.slice(0, value188);
    },
    value194: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    value195: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    value196: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    value197: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    value198: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    callback37: Dynamic = (): Dynamic => {
      let entry2: Dynamic = value34.current.get(),
        current: Dynamic = value9.current,
        value250: Dynamic = current?.clientWidth || 1200,
        value251: Dynamic = current?.clientHeight || 800,
        value252: Dynamic = current
          ? toolbarOverlayHeight(current)
          : 0;
      return {
        x: entry2.x,
        y: entry2.y + value252 / entry2.scale,
        w: value250 / entry2.scale,
        h: (value251 - value252) / entry2.scale,
      };
    };
  (0, reactVectorToolState_2.useLayoutEffect)(
    (): Dynamic => (
      artboardBootScheduler.configure({
        busySince: (): Dynamic => {
          let current: Dynamic = value63.current,
            current2: Dynamic = value133.current;
          return current == null
            ? current2
            : current2 == null
              ? current
              : Math.min(current, current2);
        },
        rank: (input?: Dynamic): Dynamic => {
          if (
            (phone && !flag && value55.current == null
              ? value19.current && input === value182.current
              : input === value182.current ||
                input === value186.current[0]) ||
            input === value55.current ||
            input === value56.current ||
            value184.current?.has(input)
          )
            return -1;
          let value250: Dynamic = value146.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
          return value250
            ? previewMountPriority(value250, callback37())
            : 1 / 0;
        },
      }),
      (): Dynamic => artboardBootScheduler.configure(null)
    ),
    [],
  );
  let value199: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value200: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    callback38: Dynamic = (...args: Dynamic[]): Dynamic => (pickMountedArtboardPreviews as Dynamic)({ get callback37() { return callback37; }, get options() { return options; }, get phone() { return phone; }, get value130() { return value130; }, get value146() { return value146; }, get value182() { return value182; }, get value184() { return value184; }, get value185() { return value185; }, get value186() { return value186; }, get value187() { return value187; }, get value188() { return value188; }, get value19() { return value19; }, get value194() { return value194; }, get value195() { return value195; }, get value196() { return value196; }, get value197() { return value197; }, get value199() { return value199; }, get value200() { return value200; }, get value34() { return value34; }, get value35() { return value35; }, get value55() { return value55; }, get value56() { return value56; }, get value57() { return value57; }, get value58() { return value58; }, get value62() { return value62; }, get value9() { return value9; } }, ...args),
    value201: Dynamic = (0, reactVectorToolState_2.useRef)(
      value35 && options.viewSettled === false,
    ),
    [value202, value203]: Dynamic = (0,
    reactVectorToolState_2.useState)(
      (): Dynamic => (value201.current ? new Set() : callback38()),
    );
  value194.current = value202;
  let callback39: Dynamic = (): Dynamic => {
      if (value201.current) return;
      let current: Dynamic = value55.current;
      current != null && (value200.current = true);
      if (
        current != null &&
        value194.current.has(current) &&
        [...(value184.current ?? [])].every(
          (input?: Dynamic): Dynamic => value194.current.has(input),
        )
      )
        return;
      let value250: Dynamic = performance.now(),
        value251: Dynamic = callback38(value250);
      samePreviewFiles(value251, value194.current) ||
        value203(value251);
      value198.current != null && clearTimeout(value198.current);
      let value252: Dynamic =
        value188 > value187 && value55.current == null
          ? nextPreviewExpiry(
              value251,
              value146.current.artboards,
              value196.current ?? callback37(),
              value195.current,
              value250,
            )
          : null;
      value198.current =
        value252 == null
          ? null
          : setTimeout(callback41, value252 - value250 + 50);
    },
    value204: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    value205: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    value206: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value207: Dynamic = (0, reactVectorToolState_2.useRef)(undefined);
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    value207.current !== fullscreenFile &&
      (value35 && fullscreenFile != null && callback36(fullscreenFile),
      (value207.current = fullscreenFile));
    value205.current !== focusedFile &&
      ((!value35 || value18) &&
        value205.current != null &&
        callback36(value205.current),
      (!value35 || value18) && focusedFile != null && callback36(focusedFile),
      (value205.current = focusedFile));
    value206.current !== playingFile &&
      (value206.current != null && callback36(value206.current),
      playingFile != null && callback36(playingFile),
      (value206.current = playingFile));
    let value250: Dynamic = value130.current.has("marquee");
    if (!value250) {
      for (let value251 of selectedArtboards as Dynamic)
        (!value35 || value18) &&
          !value58.current.has(value251) &&
          callback36(value251);
      value58.current = selectedArtboards;
    }
    for (let value251 of (livePins ?? []) as Dynamic)
      value204.current?.has(value251) || callback36(value251);
    value204.current = livePins;
    options.viewSettled !== false && (value201.current = false);
    value250 ? callback41() : callback39();
    for (let value251 of (value21
      ? [value18 ? focusedFile : null, playingFile, ...(livePins ?? [])]
      : [
          focusedFile,
          fullscreenFile,
          playingFile,
          value186.current[0],
          ...(livePins ?? []),
        ]) as Dynamic)
      artboardBootScheduler.expedite(value251);
  }, [
    selectedArtboards,
    manifest.artboards,
    focusedFile,
    fullscreenFile,
    playingFile,
    livePins,
    inUseFiles,
    value86,
    value35 ? options.viewSettled : undefined,
    value35 ? value18 : undefined,
  ]);
  let value208: Dynamic = manifest.artboards.length > 0,
    value209: Dynamic = useLatestCallback((): Dynamic => {
      value201.current && ((value201.current = false), callback39());
    });
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    if (!value201.current || !value208) return;
    let value250: Dynamic = setTimeout(value209, 1e3);
    return (): Dynamic => clearTimeout(value250);
  }, [value208, value209]);
  let value210: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value211: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value212: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    callback40: Dynamic = (): Dynamic => {
      value210.current = null;
      if (
        (value62.current || value130.current.size > 0) &&
        ((value212.current ??= Date.now()),
        Date.now() - value212.current < canvasLongPressDelayMs)
      ) {
        value211.current = null;
        value210.current = setTimeout(callback40, 120);
        return;
      }
      value212.current = null;
      value211.current = null;
      callback39();
    },
    callback41: Dynamic = (): Dynamic => {
      let value250: Dynamic = Date.now();
      value210.current != null && clearTimeout(value210.current);
      value211.current ??= value250;
      let value251: Dynamic = value250 - value211.current;
      value210.current = setTimeout(
        callback40,
        Math.max(
          0,
          Math.min(
            canvasDragActivationDelayMs,
            canvasTouchDragActivationDelayMs - value251,
          ),
        ),
      );
    };
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => (
      callback41(),
      camera.subscribe((): Dynamic => {
        callback41();
        value91.current?.();
      })
    ),
    [camera],
  );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = value9.current,
      value250: Dynamic =
        current && typeof ResizeObserver !== "undefined"
          ? new ResizeObserver((): Dynamic => callback41())
          : null;
    current && value250?.observe(current);
    return (): Dynamic => {
      value250?.disconnect();
      value210.current != null && clearTimeout(value210.current);
      value198.current != null && clearTimeout(value198.current);
    };
  }, []);
  let [value213, value214]: Dynamic = (0,
    reactVectorToolState_2.useState)((): Dynamic => new Set()),
    value215: Dynamic = useLatestCallback(
      (input?: Dynamic, options2?: Dynamic): Dynamic => {
        value214((input2?: Dynamic): Dynamic => {
          if (input2.has(input) === options2) return input2;
          let values: Dynamic = new Set(input2);
          options2 ? values.add(input) : values.delete(input);
          return values;
        });
      },
    ),
    callback42: Dynamic = (input?: Dynamic, options2?: Dynamic): Dynamic => {
      if (callback2(input)) return value156(input);
      callback36(input);
      callback39();
      artboardBootScheduler.expedite(input);
      value18 || value60(input, options2);
    },
    callback43: Dynamic = (input?: Dynamic, options2?: Dynamic): Dynamic => ({
      ...replaceDesignArtboards(
        manifest,
        manifest.artboards.map((input2?: Dynamic): Dynamic => {
          let entry2: Dynamic = input.get(input2.file);
          return entry2
            ? {
                ...input2,
                x: entry2.x,
                y: entry2.y,
              }
            : input2;
        }),
      ),
      ...(options2.size > 0
        ? {
            annotations: (manifest.annotations ?? []).map(
              (input2?: Dynamic): Dynamic => {
                let entry2: Dynamic = options2.get(input2.id);
                return entry2
                  ? moveAnnotation(input2, entry2.x, entry2.y)
                  : input2;
              },
            ),
          }
        : {}),
    }),
    callback44: Dynamic = (input?: Dynamic): Dynamic =>
      isShapeAnnotation(input)
        ? annotationBounds(input)
        : {
            x: input.x,
            y: input.y,
            w: value12(input),
            h:
              value10[input.id]?.h ??
              annotationVisibleBounds(input).h,
          },
    value216: Dynamic = (0, reactVectorToolState_2.useRef)(
      callback44,
    );
  value216.current = callback44;
  let callback45: Dynamic = (input?: Dynamic): Dynamic =>
      canvasSnapReferenceLines(
        manifest.artboards,
        (manifest.annotations ?? []).map(
          (input2?: Dynamic): Dynamic => ({
            id: input2.id,
            ...rotatedAnnotationBounds(
              input2,
              value216.current(input2),
            ),
          }),
        ),
        {
          files: new Set(input.files ?? []),
          notes: new Set(input.notes ?? []),
        },
        false,
      ),
    callback46: Dynamic = (...args: Dynamic[]): Dynamic => (beginBoardDrag as Dynamic)({ get callback30() { return callback30; }, get callback47() { return callback47; }, get manifest() { return manifest; }, get onDuplicateObjects() { return onDuplicateObjects; }, get value134() { return value134; }, get value216() { return value216; }, get value218() { return value218; }, get value219() { return value219; }, get value67() { return value67; } }, ...args),
    callback47: Dynamic = (input?: Dynamic): Dynamic => {
      let current: Dynamic = value67.current;
      !current ||
        input !== current.pointerId ||
        ((value67.current = null),
        current.unlisten(),
        (value68.current = null),
        value134("frame-drag", false),
        value70(null),
        value72(null),
        current.alt
          ? value74(null)
          : current.live && callback48(current.set, current.notes),
        current.hoverKey &&
          value217.current?.({
            key: current.hoverKey,
            target: null,
            point: {
              x: 0,
              y: 0,
            },
            object: current.set[0]
              ? {
                  file: current.set[0].file,
                }
              : {
                  note: current.notes[0].id,
                },
            at: {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
            },
            ctrl: false,
          }));
    },
    value217: Dynamic = (0, reactVectorToolState_2.useRef)(
      onObjectHover,
    );
  value217.current = onObjectHover;
  let callback48: Dynamic = (
      input?: Dynamic,
      options2?: Dynamic,
    ): Dynamic => {
      let entries2: Dynamic = new Map(
          input.map((input2?: Dynamic): Dynamic => [input2.file, input2]),
        ),
        entries3: Dynamic = new Map(
          options2.map((input2?: Dynamic): Dynamic => [input2.id, input2]),
        );
      onManifestChange(callback43(entries2, entries3), false);
    },
    value218: Dynamic = (0, reactVectorToolState_2.useRef)(
      callback47,
    );
  value218.current = callback47;
  let callback49: Dynamic = (input?: Dynamic): Dynamic =>
    callback47(input.pointerId);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    !value18 &&
      value67.current &&
      value218.current(value67.current.pointerId);
  }, [value18]);
  let callback50: Dynamic = (...args: Dynamic[]): Dynamic => (updateBoardDrag as Dynamic)({ get callback16() { return callback16; }, get callback43() { return callback43; }, get callback44() { return callback44; }, get callback48() { return callback48; }, get camera() { return camera; }, get manifest() { return manifest; }, get onDropObjectInto() { return onDropObjectInto; }, get onDuplicateObjects() { return onDuplicateObjects; }, get onFocus() { return onFocus; }, get onManifestChange() { return onManifestChange; }, get onObjectHover() { return onObjectHover; }, get onSelectObjects() { return onSelectObjects; }, get value134() { return value134; }, get value18() { return value18; }, get value67() { return value67; }, get value70() { return value70; }, get value72() { return value72; }, get value74() { return value74; }, get value9() { return value9; } }, ...args),
    value219: Dynamic = (0, reactVectorToolState_2.useRef)(
      callback50,
    );
  value219.current = callback50;
  let callback51: Dynamic = (...args: Dynamic[]): Dynamic => (beginHandedOffBoardDrag as Dynamic)({ get value146() { return value146; }, get value218() { return value218; }, get value67() { return value67; } }, ...args),
    callback52: Dynamic = (
      input?: Dynamic,
      options2?: Dynamic,
      context?: Dynamic,
      value250?: Dynamic,
      extra?: Dynamic,
      detail?: Dynamic,
      argument?: Dynamic,
      argument2: Dynamic = false,
    ): Dynamic => {
      let current: Dynamic = value67.current;
      return !current ||
        current.pointerId !== options2 ||
        current.setMove !== input
        ? false
        : (argument !== undefined && (current.bound = argument),
          value219.current(
            {
              pointerId: options2,
              clientX: context,
              clientY: value250,
              altKey: argument2,
              metaKey: extra,
              ctrlKey: false,
              pointerType: "mouse",
              fromSetMove: true,
            },
            detail,
          ),
          true);
    },
    value220: Dynamic = (0, reactVectorToolState_2.useRef)(
      onSetMoveCommit,
    );
  value220.current = onSetMoveCommit;
  let [value221, value222]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value223: Dynamic = (0, reactVectorToolState_2.useRef)(
      onSetMoveSay,
    );
  value223.current = onSetMoveSay;
  let [value224, value225]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    value226: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value227: Dynamic = (0, reactVectorToolState_2.useRef)(
      setMovePieces,
    );
  value227.current = setMovePieces;
  value226.current ??= createElementMoveSessions({
    handle: (input?: Dynamic): Dynamic => value2.current.get(input),
    targetAt: (input?: Dynamic, options2?: Dynamic): Dynamic => {
      let value250: Dynamic = value9.current?.getBoundingClientRect();
      if (!value250 || value55.current != null) return null;
      let value251: Dynamic = callback16(input, options2, value250),
        files: Dynamic = value57.current.files,
        artboards: Dynamic = value146.current.artboards;
      for (
        let value252: Dynamic = artboards.length - 1;
        value252 >= 0;
        value252--
      ) {
        let value253: Dynamic = artboards[value252];
        if (
          value251.x < value253.x ||
          value251.y < value253.y ||
          value251.x > value253.x + value253.w ||
          value251.y > value253.y + value253.h
        )
          continue;
        if (files.has(value253.file)) return null;
        if (value253.frameless && value183.current !== value253.file)
          continue;
        let state: Dynamic = {
          x: value251.x - value253.x,
          y: value251.y - value253.y,
        };
        return value253.file === value56.current
          ? {
              file: value253.file,
              local: state,
              blocked: "playing",
            }
          : {
              file: value253.file,
              local: state,
            };
      }
      return null;
    },
    showGhost: (input?: Dynamic): Dynamic =>
      value225(
        (input2?: Dynamic): Dynamic =>
          input2 === null && input === null ? input2 : input,
      ),
    say: (input?: Dynamic): Dynamic => value223.current?.(input),
    origin: (input?: Dynamic): Dynamic => {
      let value250: Dynamic = value146.current.artboards.find(
        (input2?: Dynamic): Dynamic => input2.file === input,
      );
      return value250
        ? {
            x: value250.x,
            y: value250.y,
          }
        : undefined;
    },
    canvasPoint: (input?: Dynamic, options2?: Dynamic): Dynamic => {
      let value250: Dynamic = value9.current?.getBoundingClientRect();
      return value250
        ? callback16(input, options2, value250)
        : {
            x: input,
            y: options2,
          };
    },
    slopPx: canvasDragThresholdPixels,
    canvas: {
      start: callback51,
      update: callback52,
      cancel: (input?: Dynamic, options2?: Dynamic): Dynamic => {
        value67.current?.setMove === input && value218.current(options2);
      },
    },
    setGestureSource: (input?: Dynamic, options2?: Dynamic): Dynamic =>
      value134(input, options2),
    claimKeyboard: focusCanvasDocument,
    setHeldCover: value222,
    commit: (input?: Dynamic): Dynamic =>
      value220.current?.(input) ?? Promise.resolve(),
    readOnly: (): Dynamic => !value19.current,
    piecesAllowed: (): Dynamic => value227.current === true,
    bounds: (input?: Dynamic): Dynamic => {
      let value250: Dynamic = value146.current.artboards.find(
        (input2?: Dynamic): Dynamic => input2.file === input,
      );
      return value250
        ? {
            x: value250.x,
            y: value250.y,
            w: value250.w,
            h: value250.h,
          }
        : undefined;
    },
  });
  let value228: Dynamic =
      onSetMoveCommit != null &&
      hasMultipleEditingGroups(
        selectedTidsByFile,
        selectedArtboards.size + selectedNotes.size,
      ),
    value229: Dynamic = (0, reactVectorToolState_2.useRef)(value228);
  value229.current = value228;
  let callback53: Dynamic = (input?: Dynamic): Dynamic => {
      let value250: Dynamic =
          input.files ??
          new Map(
            Object.entries(value26.current ?? {}).filter(
              ([, items]: Dynamic): Dynamic => items.length > 0,
            ),
          ),
        value251: Dynamic = input.canvas ?? {
          files: value57.current.files,
          notes: value57.current.notes,
        };
      return (
        value226.current?.begin({
          ...input,
          files: value250,
          canvas: value251,
        }) ?? false
      );
    },
    callback54: Dynamic = (): Dynamic =>
      Object.values(value26.current ?? {}).some(
        (items?: Dynamic): Dynamic => items.length > 0,
      ),
    callback55: Dynamic = (...args: Dynamic[]): Dynamic => (buildObjectPressHandlers as Dynamic)({ get callback46() { return callback46; }, get callback49() { return callback49; }, get callback50() { return callback50; }, get callback53() { return callback53; }, get callback54() { return callback54; }, get onSelectObjects() { return onSelectObjects; }, get onSetMoveCommit() { return onSetMoveCommit; }, get value57() { return value57; } }, ...args),
    callback56: Dynamic = (input?: Dynamic): Dynamic => {
      let current: Dynamic = value57.current;
      (current.notes.size === 1 &&
        current.notes.has(input) &&
        current.files.size === 0) ||
        onSelectObjects(
          boardSelectionItems({
            note: input,
          }),
          "replace",
        );
      actionsRef.current?.setTool("vector");
    },
    callback57: Dynamic = (...args: Dynamic[]): Dynamic => (trackHandleDragGesture as Dynamic)({ get callback30() { return callback30; }, get value130() { return value130; }, get value134() { return value134; }, get value18() { return value18; }, get value19() { return value19; } }, ...args),
    value230: Dynamic = manifest.artboards.filter(
      (input?: Dynamic): Dynamic => selectedArtboards.has(input.file),
    ),
    value231: Dynamic = (manifest.annotations ?? [])
      .filter((input?: Dynamic): Dynamic => selectedNotes.has(input.id))
      .map((input?: Dynamic): Dynamic => {
        let value250: Dynamic = callback44(input);
        return {
          spec: input,
          box: value250,
          bounds: rotatedAnnotationBounds(input, value250),
        };
      }),
    value232: Dynamic = value230.length + value231.length > 1,
    [value233, value234]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [value235, value236]: Dynamic = (0,
    reactVectorToolState_2.useState)([]),
    value237: Dynamic = ((): Dynamic => {
      if (!value232 || value235.length === 0) return null;
      let value250: Dynamic = selectionTransformMembers(
        value230,
        value231.map((input?: Dynamic): Dynamic => input.spec),
      );
      for (let value251 of value235 as Dynamic) {
        let value252: Dynamic = translatedSelectionTransform(
          value251,
          value250,
        );
        if (value252) return value252;
      }
      return null;
    })(),
    value238: Dynamic =
      [...selectedArtboards].join(`
`) +
      "	" +
      [...selectedNotes].join(`
`),
    value239: Dynamic = (0, reactVectorToolState_2.useRef)(value238);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    value239.current !== value238 &&
      ((value239.current = value238),
      value236(
        (items?: Dynamic): Dynamic => (items.length > 0 ? [] : items),
      ));
  }, [value238]);
  let value240: Dynamic = value228
      ? unionRects([
          ...value230,
          ...value231.map((input?: Dynamic): Dynamic => input.bounds),
          ...manifest.artboards.flatMap((input?: Dynamic): Dynamic => {
            let value250: Dynamic = selectedRectsByFile?.[input.file];
            if (
              !value250 ||
              (selectedTidsByFile?.[input.file]?.length ?? 0) === 0
            )
              return [];
            let callback61: Dynamic = (input2?: Dynamic): Dynamic =>
                Math.max(
                  -selectionChromeCoordinateOverscan,
                  Math.min(
                    input.w + selectionChromeCoordinateOverscan,
                    input2,
                  ),
                ),
              callback62: Dynamic = (input2?: Dynamic): Dynamic =>
                Math.max(
                  -selectionChromeCoordinateOverscan,
                  Math.min(
                    input.h + selectionChromeCoordinateOverscan,
                    input2,
                  ),
                ),
              [items, items2, items3, items4]: Dynamic = [
                callback61(value250.x),
                callback62(value250.y),
                callback61(value250.x + value250.w),
                callback62(value250.y + value250.h),
              ];
            return items3 > items && items4 > items2
              ? [
                  {
                    x: input.x + items,
                    y: input.y + items2,
                    w: items3 - items,
                    h: items4 - items2,
                  },
                ]
              : [];
          }),
        ])
      : null,
    value241: Dynamic =
      value240 ??
      (value232
        ? (value233?.box ??
          value237?.box ??
          unionRects([
            ...value230,
            ...value231.map((input?: Dynamic): Dynamic => input.bounds),
          ]))
        : null),
    value242: Dynamic = value233 ? value233.deg : (value237?.deg ?? 0),
    value243: Dynamic =
      value232 &&
      (!!value233?.deg ||
        value237 !== null ||
        value231.some(
          (input?: Dynamic): Dynamic =>
            input.spec.kind === "image" ||
            (isShapeAnnotation(input.spec) &&
              annotationRotation(input.spec) !== 0),
        )),
    value244: Dynamic = value232 && value230.length === 0,
    value245: Dynamic =
      value232 && value231.length > 0 && value230.length > 0
        ? uiMessage("canvas.interactionLayer.thisSelectionCanTBe")
        : undefined,
    value246: Dynamic =
      !value18 ||
      supportsClickPlacement(armedTool) ||
      armedTool === "draw" ||
      value240 != null,
    callback58: Dynamic = (...args: Dynamic[]): Dynamic => (runSelectionTransformGesture as Dynamic)({ get callback57() { return callback57; }, get onManifestChange() { return onManifestChange; }, get value146() { return value146; }, get value230() { return value230; }, get value231() { return value231; }, get value234() { return value234; }, get value236() { return value236; }, get value241() { return value241; }, get value242() { return value242; }, get value70() { return value70; } }, ...args),
    callback59: Dynamic = (...args: Dynamic[]): Dynamic => (beginSelectionGroupResize as Dynamic)({ get callback45() { return callback45; }, get callback58() { return callback58; }, get camera() { return camera; }, get selectedArtboards() { return selectedArtboards; }, get selectedNotes() { return selectedNotes; }, get value230() { return value230; }, get value231() { return value231; }, get value241() { return value241; }, get value242() { return value242; }, get value243() { return value243; }, get value70() { return value70; } }, ...args),
    callback60: Dynamic = (input?: Dynamic, options2?: Dynamic): Dynamic => {
      if (!value241) return;
      let value250: Dynamic = value241,
        state: Dynamic = {
          x: value250.x + value250.w / 2,
          y: value250.y + value250.h / 2,
        },
        bounds: Dynamic = (
          options2.currentTarget.closest(
            '[data-mega-chrome="group-resize"]',
          ) ?? options2.currentTarget
        ).getBoundingClientRect(),
        [items, items2]: Dynamic = [
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2,
        ],
        value251: Dynamic = angleBetweenPoints(
          items,
          items2,
          options2.clientX,
          options2.clientY,
        ),
        value252: Dynamic = value242,
        value253: Dynamic = transformTouchedProperties("rotate");
      callback58(
        options2,
        "Rotate",
        value253,
        (input2?: Dynamic): Dynamic => {
          let value254: Dynamic = snapRotation(
            value252 +
              angleBetweenPoints(
                items,
                items2,
                input2.clientX,
                input2.clientY,
              ) -
              value251,
            input2.shiftKey,
          );
          return value254 === value252
            ? null
            : {
                box: value250,
                deg: value254,
                keys: value253,
                board: (): Dynamic => ({}),
                ann: (input3?: Dynamic): Dynamic =>
                  rotateAnnotationAboutPoint(
                    input3.spec,
                    input3.box,
                    state,
                    value254 - value252,
                  ),
              };
        },
      );
    },
    value247: Dynamic = value80?.tool === "arrow" || value80?.tool === "line",
    value248: Dynamic = ((): Dynamic => {
      if (!value80 || !value247) return null;
      let value250: Dynamic = value80.dirX === 1 ? 0 : value80.w,
        value251: Dynamic = value80.dirY === 1 ? 0 : value80.h,
        value252: Dynamic = value80.dirX === 1 ? value80.w : 0,
        value253: Dynamic = value80.dirY === 1 ? value80.h : 0,
        value254: Dynamic =
          value80.tool === "arrow"
            ? shortenLineEnd(
                value250,
                value251,
                value252,
                value253,
                (SvgArrowsConstant_3 * SvgDrawingConstant) /
                  entry.scale,
              )
            : {
                x: value252,
                y: value253,
              };
      return {
        x1: value250,
        y1: value251,
        x2: value254.x,
        y2: value254.y,
      };
    })(),
    value249: Dynamic = ((): Dynamic => {
      let value250: Dynamic = dragGhost?.box;
      if (!dragGhost || !value250) return null;
      let value251: Dynamic =
          (value9.current?.clientWidth || 1200) / entry.scale,
        value252: Dynamic =
          (value9.current?.clientHeight || 800) / entry.scale,
        value253: Dynamic = Math.min(
          1,
          (0.4 * value251) / value250.w,
          (0.4 * value252) / value250.h,
        ),
        value254: Dynamic = entry.scale * value253;
      return {
        box: value250,
        s: value254,
        left: (dragGhost.x - entry.x) * entry.scale - value250.gx * value254,
        top: (dragGhost.y - entry.y) * entry.scale - value250.gy * value254,
        width: value250.w * value254,
        height: value250.h * value254,
      };
    })();
  return (
    <ViewportContext.Provider value={camera}>
      <div
        ref={value9}
        data-testid={"mega-canvas"}
        data-hover-file={value98 ?? undefined}
        onPointerDownCapture={(event?: Dynamic): Dynamic => {
          value28(event.pointerType === "touch");
          !(
            onCanvasMenu == null ||
            !InspectorColorPickResolvedValue_2 ||
            event.button !== 0 ||
            !event.ctrlKey ||
            !callback20(event) ||
            value55.current != null ||
            value128.current ||
            OutlineDcOutlineHandler(event.target) ||
            canvasContextMenuTargetFromElement(event.target) ===
              null
          ) &&
            (event.stopPropagation(),
            (value109.current = {
              x: event.clientX,
              y: event.clientY,
            }));
        }}
        onPointerMoveCapture={(): Dynamic => {
          value30 && value31(false);
        }}
        className={joinClassNames(
          "relative h-full w-full select-none overflow-clip bg-om-bg-canvas mdn-dot-grid",
          armedTool === "frame" && "cursor-crosshair [&_*]:!cursor-crosshair",
          armedTool === "note" &&
            !value129 &&
            "cursor-default [&_*]:!cursor-default",
          value18 &&
            fullscreenFile == null &&
            supportsClickPlacement(armedTool) &&
            (onAddShape
              ? armedTool === "text"
                ? "cursor-text"
                : "cursor-crosshair"
              : "cursor-not-allowed"),
        )}
        style={
          value18 &&
          fullscreenFile == null &&
          armedTool === "draw" &&
          onAddPen != null
            ? {
                cursor: pickerCursorCss,
              }
            : undefined
        }
        onPointerOver={callback32}
        onPointerMove={(event?: Dynamic): Dynamic => {
          callback32(event);
          if (options.onWorldPointer && value55.current == null) {
            let bounds2: Dynamic =
                event.currentTarget.getBoundingClientRect(),
              entry2: Dynamic = camera.get();
            options.onWorldPointer(
              entry2.x + (event.clientX - bounds2.left) / entry2.scale,
              entry2.y + (event.clientY - bounds2.top) / entry2.scale,
            );
          }
          if (
            !callback20(event) ||
            value85.current !== "note" ||
            value55.current != null
          ) {
            value75 && value76(null);
            return;
          }
          if (
            event.target instanceof Element &&
            event.target.closest("[data-mega-chrome]") != null &&
            event.target.closest('[data-mega-chrome="focus-overlay"]') == null
          ) {
            value75 && value76(null);
            return;
          }
          let bounds: Dynamic = event.currentTarget.getBoundingClientRect();
          value76({
            x:
              camera.get().x +
              (event.clientX - bounds.left) / camera.get().scale,
            y:
              camera.get().y +
              (event.clientY - bounds.top) / camera.get().scale,
          });
        }}
        onPointerLeave={(): Dynamic => {
          value148.current = null;
          value149.current = null;
          value75 && value76(null);
        }}
        onDragEnter={(input?: Dynamic): Dynamic => {
          onImageDrop &&
            input.dataTransfer?.types.includes("Files") &&
            (value30 || value31(true));
        }}
        onDragOver={(event?: Dynamic): Dynamic => {
          onImageDrop &&
            event.dataTransfer?.types.includes("Files") &&
            (value30 || value31(true),
            event.preventDefault(),
            (event.dataTransfer.dropEffect = callback20(event)
              ? "copy"
              : "none"));
        }}
        onDrop={(event?: Dynamic): Dynamic => {
          value31(false);
          if (!onImageDrop) return;
          let items: Dynamic = [...(event.dataTransfer?.files ?? [])];
          if (
            items.length === 0 ||
            (event.preventDefault(),
            event.stopPropagation(),
            !callback20(event))
          )
            return;
          let bounds: Dynamic = event.currentTarget.getBoundingClientRect();
          onImageDrop(
            items,
            camera.get().x +
              (event.clientX - bounds.left) / camera.get().scale,
            camera.get().y +
              (event.clientY - bounds.top) / camera.get().scale,
          );
        }}
        onContextMenu={(...args: Dynamic[]): Dynamic => (openCanvasContextMenu as Dynamic)({ get callback12() { return callback12; }, get callback20() { return callback20; }, get onCanvasMenu() { return onCanvasMenu; }, get value107() { return value107; }, get value108() { return value108; }, get value109() { return value109; }, get value128() { return value128; }, get value130() { return value130; }, get value55() { return value55; } }, ...args)}
        onPointerDown={(...args: Dynamic[]): Dynamic => (pressCanvasBackground as Dynamic)({ get callback10() { return callback10; }, get callback13() { return callback13; }, get callback14() { return callback14; }, get callback16() { return callback16; }, get callback19() { return callback19; }, get callback20() { return callback20; }, get callback30() { return callback30; }, get camera() { return camera; }, get manifest() { return manifest; }, get onAddAnnotation() { return onAddAnnotation; }, get onAddPen() { return onAddPen; }, get onAddShape() { return onAddShape; }, get onClearSelection() { return onClearSelection; }, get onDrawArtboard() { return onDrawArtboard; }, get onPlaceBlocked() { return onPlaceBlocked; }, get onPlaceTool() { return onPlaceTool; }, get value108() { return value108; }, get value128() { return value128; }, get value130() { return value130; }, get value134() { return value134; }, get value183() { return value183; }, get value19() { return value19; }, get value213() { return value213; }, get value55() { return value55; }, get value78() { return value78; }, get value79() { return value79; }, get value81() { return value81; }, get value83() { return value83; }, get value85() { return value85; }, get value96() { return value96; } }, ...args)}
      >
        <span id={value143} hidden={true}>
          {PressReturnToGoIntoThisMessage}
        </span>
        <div
          ref={camera.attach}
          data-mega-world={""}
          aria-busy={options.turnBusy ? true : undefined}
          className={"absolute left-0 top-0"}
          style={{
            transformOrigin: "0 0",
          }}
        >
          {value240 &&
            value18 &&
            fullscreenFile == null &&
            (armedTool == null || armedTool === "select") && (<div
                data-mega-chrome={"set-box-pad"}
                data-testid={"mega-set-box-pad"}
                className={"absolute cursor-grab"}
                style={{
                  left: value240.x,
                  top: value240.y,
                  width: value240.w,
                  height: value240.h,
                }}
                onPointerDown={(input?: Dynamic): Dynamic => {
                  input.button !== 0 ||
                    input.pointerType === "touch" ||
                    input.shiftKey ||
                    input.metaKey ||
                    input.ctrlKey ||
                    input.altKey ||
                    (input.stopPropagation(),
                    callback53({
                      pointerId: input.pointerId,
                      captureEl: input.currentTarget,
                      clientX: input.clientX,
                      clientY: input.clientY,
                      leader: {
                        box: true,
                      },
                      stillAction: (): Dynamic =>
                        onSelectObjects(
                          emptyBoardSelection,
                          "replace",
                        ),
                      armWait: null,
                      heldCover: null,
                    }));
                }}
              />)}
          {value224 &&
            fullscreenFile == null && (callback7(
              "set-ghost",
              <div
                data-testid={"mega-set-ghost"}
                aria-hidden={"true"}
                className={"pointer-events-none absolute left-0 top-0"}
                style={{
                  ...PickerRuntimeScriptTAppAccentConfig,
                  zIndex: 40,
                }}
              >
                {value224.map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic => (
                    <div
                      key={options2}
                      className={"absolute rounded-[2px]"}
                      style={{
                        left: input.x,
                        top: input.y,
                        width: input.w,
                        height: input.h,
                        border: "1px dashed var(--t-app-accent)",
                        background:
                          "color-mix(in srgb, var(--t-app-accent) 12%, transparent)",
                      }}
                    />
                  ),
                )}
              </div>,
            ))}
          {options.pendingBoards != null &&
            options.pendingBoards.length > 0 &&
            fullscreenFile == null && (<ConditionalPortal on={value35} to={value50}>
                <div
                  ref={value35 ? callback5 : undefined}
                  className={
                    "pointer-events-none absolute left-0 top-0 h-0 w-0"
                  }
                  style={{
                    transformOrigin: "0 0",
                    isolation: "isolate",
                  }}
                >
                  <PendingArtboards
                    boards={options.pendingBoards}
                    sheen={!value35}
                  />
                </div>
              </ConditionalPortal>)}
          <ConditionalPortal on={value35} to={value36}>
            <div
              style={{
                isolation: "isolate",
              }}
            >
              {value14.map(({ spec: spec, z: z }: Dynamic): Dynamic => {
                let value250: Dynamic = spec.file === focusedFile,
                  value251: Dynamic = selectedArtboards.has(spec.file),
                  value252: Dynamic = spec.frameless === true,
                  value253: Dynamic = value252 && enteredFile === spec.file,
                  value254: Dynamic =
                    value252 && (emptyPieces?.has(spec.file) ?? false),
                  value255: Dynamic = value144 === spec.file,
                  value256: Dynamic = value189.has(spec.file),
                  value257: Dynamic =
                    spec.title ?? spec.file.replace(/\.dc\.html$/, ""),
                  value258: Dynamic =
                    spec.file === fullscreenFile &&
                    flag &&
                    tweakRows?.[spec.file]
                      ? artboardTweaksRowHeight
                      : 0,
                  value259: Dynamic = spec.file === playingFile,
                  value260: Dynamic =
                    !value252 &&
                    value250 &&
                    value251 &&
                    value18 &&
                    !value27 &&
                    (armedTool == null || armedTool === "select") &&
                    fullscreenFile == null,
                  value261: Dynamic =
                    !value252 &&
                    value250 &&
                    !value251 &&
                    value18 &&
                    !value27 &&
                    (armedTool == null || armedTool === "select") &&
                    fullscreenFile == null &&
                    onSetMoveCommit != null &&
                    (value228 || armedEmpty === true),
                  value262: Dynamic = value260
                    ? "face-overlay"
                    : value261
                      ? "set-overlay"
                      : "focus-overlay",
                  value263: Dynamic = value221 === spec.file,
                  value264: Dynamic =
                    callback(spec) && !(value250 && value18),
                  value265: Dynamic = value22 && !value264,
                  value266: Dynamic =
                    value265 &&
                    !value259 &&
                    (value252
                      ? !(value253 && value250)
                      : !value250 || value260 || value261 || value263),
                  value267: Dynamic =
                    value252 || fullscreenFile != null
                      ? undefined
                      : artboardAboveDistances(
                          manifest.artboards,
                        ).get(spec.file),
                  value268: Dynamic = shouldHideArtboardTitle({
                    phoneCanvas: value21,
                    selected: value251,
                    renaming: value104 === spec.file,
                    playing: value259,
                    tweaksOpen: tweaksOpenFile === spec.file,
                    armedByTouch: value250 && value27,
                    hovered: value98 === spec.file,
                  }),
                  value269: Dynamic =
                    phone && !flag && fullscreenFile != null
                      ? isPreviewHighlighted(
                          spec.file,
                          fullscreenFile,
                          livePins,
                        )
                      : (!value35 && manifest.artboards.length <= value187) ||
                        value202.has(spec.file) ||
                        (value21
                          ? spec.file === value24
                          : value250 || value259) ||
                        spec.file === fullscreenFile,
                  value270: Dynamic =
                    value21 && !value269 && !value252
                      ? (value39.get(spec.file) ?? null)
                      : null,
                  value271: Dynamic =
                    options.coverFiles?.has(spec.file) === true &&
                    shouldShowArtboardFaceOverlay({
                      live: value269,
                      blocked: value213.has(spec.file),
                      frameless: value252,
                      focused: value250,
                      selected: value251,
                      playing: value259,
                      fullWindow: fullscreenFile != null,
                    }),
                  value272: Dynamic =
                    fullscreenFile === spec.file
                      ? (artboardNotice?.(spec.file) ?? null)
                      : null;
                return (() => {
                  const _Component = "div";
                  const _props = {
                    ref: value35
                      ? callback8(spec.file, spec.x, spec.y)
                      : undefined,
                    "data-mega-artboard": spec.file,
                    "data-mega-selected": value251 ? "" : undefined,
                    className: joinClassNames(
                      "absolute",
                      value18 &&
                        !value250 &&
                        !value259 &&
                        fullscreenFile == null &&
                        supportsClickPlacement(armedTool) &&
                        (value213.has(spec.file)
                          ? "cursor-not-allowed [&_*]:!cursor-not-allowed"
                          : armedTool === "text"
                            ? "cursor-text [&_*]:!cursor-text"
                            : "cursor-crosshair [&_*]:!cursor-crosshair"),
                    ),
                    style: {
                      ...(value35
                        ? {
                            left: 0,
                            top: 0,
                            transformOrigin: "0 0",
                          }
                        : {
                            left: spec.x,
                            top: spec.y,
                          }),
                      width: spec.w,
                      height: spec.h,
                      zIndex:
                        value117 === spec.file
                          ? 1e6
                          : value35 && value269
                            ? z + maxCanvasOverlayZIndex
                            : z,
                      ...(fullscreenFile && fullscreenFile !== spec.file
                        ? {
                            display: "none",
                          }
                        : {}),
                      ...(fullscreenFile === spec.file && fullscreenBox
                        ? {
                            width: fullscreenBox.w,
                            height: fullscreenBox.h,
                          }
                        : {}),
                      ...(value258 && !fullscreenBox
                        ? {
                            top: spec.y - value258,
                            height: spec.h + value258,
                          }
                        : {}),
                    },
                    onPointerEnter: (event?: Dynamic): Dynamic => {
                      (!(event.target instanceof HTMLIFrameElement) &&
                        callback22(event, spec.file)) ||
                        (value100.current?.release(), value99(spec.file));
                    },
                    onPointerLeave: (input?: Dynamic): Dynamic => {
                      callback22(input, spec.file) ||
                        (value267 !== undefined &&
                        isAboveTitleRect(
                          input.clientX,
                          input.clientY,
                          input.currentTarget.getBoundingClientRect(),
                        )
                          ? callback21(input.currentTarget, spec.file)
                          : value99(null));
                    },
                    children: [
                      value267 !== undefined && value268 && (
                        <ViewportScaleThreshold
                          min={artboardTitleHeight(value267)}
                        >
                          {(input?: Dynamic): Dynamic =>
                            input ? null : (
                              <span hidden={true} data-mega-title-room={""} />
                            )
                          }
                        </ViewportScaleThreshold>
                      ),
                      fullscreenFile == null && !value252 && (
                        <div
                          data-mega-chrome={"title"}
                          data-proto={
                            onPlayArtboard != null &&
                            !value264 &&
                            (spec.is_interactive === true || value259)
                              ? ""
                              : undefined
                          }
                          data-sel={value251 ? "" : undefined}
                          data-covered={value271 ? "" : undefined}
                          data-testid={"mega-artboard-title-" + spec.file}
                          className={joinClassNames(
                            "group/hdr @container/hdr absolute bottom-full left-0 z-30 flex h-6 items-center gap-1.5 [clip-path:inset(-100vmax_0_-100vmax_-8px)] text-xs select-none",
                            value18 ? "cursor-grab" : "cursor-pointer",
                            value256
                              ? "text-pro"
                              : value251
                                ? "text-accent"
                                : "text-secondary",
                          )}
                          ref={camera.stamp}
                          style={{
                            width: `calc(${spec.w}px * var(--mega-scale))`,
                            transform: "scale(var(--mega-inv-scale))",
                            transformOrigin: "left bottom",
                            marginBottom: "calc(4px * var(--mega-inv-scale))",
                          }}
                          onPointerDown={(event?: Dynamic): Dynamic => {
                            if (
                              event.button !== 0 ||
                              value104 === spec.file ||
                              !callback20(event)
                            )
                              return;
                            if (
                              isTouchSelectionStart(
                                event.pointerType,
                                value251,
                              )
                            ) {
                              let shiftKey2: Dynamic = event.shiftKey,
                                value274: Dynamic =
                                  !shiftKey2 && !event.altKey;
                              watchPointerRelease(
                                event.nativeEvent,
                                (): Dynamic => {
                                  value60(spec.file, shiftKey2);
                                  value265 &&
                                    value274 &&
                                    !value259 &&
                                    !artboardPicking &&
                                    onFocus(spec.file);
                                },
                              );
                              return;
                            }
                            let shiftKey: Dynamic = event.shiftKey;
                            if (
                              onSetMoveCommit &&
                              event.pointerType !== "touch" &&
                              !shiftKey &&
                              !event.altKey &&
                              hasBoardSelection(
                                value57.current,
                                {
                                  file: spec.file,
                                },
                              ) &&
                              callback54()
                            ) {
                              let value274: Dynamic =
                                value265 && !value259 && !artboardPicking;
                              callback53({
                                pointerId: event.pointerId,
                                captureEl: event.currentTarget,
                                clientX: event.clientX,
                                clientY: event.clientY,
                                leader: {
                                  canvas: {
                                    file: spec.file,
                                  },
                                },
                                stillAction: (): Dynamic => {
                                  onSelectObjects(
                                    boardSelectionItems({
                                      file: spec.file,
                                    }),
                                    "replace",
                                  );
                                  value274 && onFocus(spec.file);
                                },
                                armWait: null,
                                heldCover: null,
                              });
                              return;
                            }
                            let value273: Dynamic = selectionPointerDownDecision(
                              value57.current,
                              {
                                file: spec.file,
                              },
                              shiftKey,
                            );
                            value273.selectNow &&
                              value60(spec.file, shiftKey);
                            callback46(
                              event,
                              {
                                file: spec.file,
                              },
                              spec,
                              value273.carry,
                              value273.click,
                              value265 &&
                                !shiftKey &&
                                !value259 &&
                                !artboardPicking,
                            );
                          }}
                          onPointerMove={(input?: Dynamic): Dynamic =>
                            callback50(input, false)
                          }
                          onPointerUp={(input?: Dynamic): Dynamic =>
                            callback50(input, true)
                          }
                          onPointerCancel={(input?: Dynamic): Dynamic =>
                            callback49(input)
                          }
                          onDoubleClick={(input?: Dynamic): Dynamic => {
                            callback20(input) &&
                              onRenameArtboard &&
                              value18 &&
                              ((value106.current = false),
                              value255 && keyboard2?.onAbandon(),
                              value105(spec.file));
                          }}
                        >
                          {value104 === spec.file ? (<input
                              data-mega-chrome={"rename"}
                              data-testid={
                                "mega-artboard-rename-" + spec.file
                              }
                              aria-label={uiMessage("canvas.interactionLayer.artboardName")}
                              defaultValue={value257}
                              autoFocus={true}
                              onFocus={(input?: Dynamic): Dynamic =>
                                input.currentTarget.select()
                              }
                              className={
                                "min-w-0 flex-1 rounded-sm bg-page px-1 text-primary ring-1 ring-fill-accent outline-none focus-visible:outline-hidden"
                              }
                              style={{
                                font: "inherit",
                              }}
                              onPointerDown={(input?: Dynamic): Dynamic =>
                                input.stopPropagation()
                              }
                              onKeyDown={(input?: Dynamic): Dynamic => {
                                input.stopPropagation();
                                input.key === "Enter"
                                  ? input.currentTarget.blur()
                                  : input.key === "Escape" &&
                                    ((value106.current = true),
                                    value105(null));
                              }}
                              onBlur={(input?: Dynamic): Dynamic => {
                                if (value106.current) {
                                  value106.current = false;
                                  return;
                                }
                                value105(null);
                                onRenameArtboard?.(
                                  spec.file,
                                  input.currentTarget.value,
                                );
                              }}
                            />) : (<ArtboardFocusOverlay
                              file={spec.file}
                              title={value257}
                              name={artboardPositionAnnouncement(
                                entries.get(spec.file) ?? -1,
                                entries.size,
                                value257,
                              )}
                              hintId={
                                value265 && keyboard2 && !artboardPicking
                                  ? value143
                                  : undefined
                              }
                              selected={value251}
                              inside={value255}
                              testId={"mega-artboard-handle-" + spec.file}
                              inert={value126}
                              onActivate={value158}
                              keys={
                                value265 && !artboardPicking
                                  ? keyboard2?.keys
                                  : undefined
                              }
                              yieldsEscape={value145}
                            />)}
                          {value255 && value104 !== spec.file && (<span
                              aria-hidden={"true"}
                              data-mega-chrome={"inside-caption"}
                              data-testid={
                                "mega-artboard-inside-caption-" + spec.file
                              }
                              className={
                                "hidden shrink-0 whitespace-nowrap rounded-sm bg-page px-1 text-[11px] text-secondary ring-1 ring-(--cds-border) peer-focus:block"
                              }
                            >
                              {
                                AccessibilityAnnouncementsResolvedValue
                              }
                            </span>)}
                          {!value271 && (<ArtboardHeaderActions
                              file={spec.file}
                              title={value257}
                              inert={value126}
                              editable={editable}
                              tweaks={
                                value &&
                                onToggleTweaks != null &&
                                !value264 &&
                                tweakRows?.[spec.file] === true &&
                                value104 !== spec.file
                              }
                              tweaksOpen={tweaksOpenFile === spec.file}
                              play={
                                value &&
                                onPlayArtboard != null &&
                                (value259 ||
                                  (!value264 &&
                                    spec.is_interactive === true)) &&
                                value104 !== spec.file
                                  ? value259
                                    ? value18
                                      ? "edit"
                                      : "stop"
                                    : "play"
                                  : null
                              }
                              expand={
                                value &&
                                onExpandArtboard != null &&
                                value104 !== spec.file
                              }
                              download={
                                value &&
                                onExportArtboard != null &&
                                !value21 &&
                                value104 !== spec.file
                              }
                              exportDisabledReason={exportDisabledReason}
                              problem={
                                value && !value264 && value104 !== spec.file
                                  ? artboardProblems?.get(spec.file)?.[0]
                                  : undefined
                              }
                              onShowProblems={value155}
                              exportOpen={
                                value110?.open === true &&
                                value110.file === spec.file
                              }
                              exportItems={
                                value110?.file === spec.file
                                  ? renderMenuItems(
                                      artboardExportMenuItems(
                                        spec.file,
                                        manifest.artboards,
                                        {
                                          onExportArtboard: onExportArtboard,
                                          onExportArtboardPdf:
                                            onExportArtboardPdf,
                                          onExportArtboardHtmlZip:
                                            onExportArtboardHtmlZip,
                                          onExportAllArtboardsPdf:
                                            onExportAllArtboardsPdf,
                                          onExportSelectedArtboardsPdf:
                                            onExportSelectedArtboardsPdf,
                                        },
                                        selectedArtboards,
                                        exportRules,
                                      ),
                                    )
                                  : null
                              }
                              onToggleTweaks={value151}
                              onPlay={value157}
                              onExpand={value156}
                              onExportOpenChange={value173}
                            />)}
                        </div>
                      ),
                      value272 != null && (
                        <ArtboardNoticePlane
                          w={fullscreenBox?.w ?? spec.w}
                          full={true}
                          inert={value126}
                          stamp={camera.stamp}
                        >
                          {value272}
                        </ArtboardNoticePlane>
                      ),
                      value251 && fullscreenFile == null && (
                        <div
                          data-mega-chrome={"resize"}
                          data-testid={"mega-artboard-resize-" + spec.file}
                          className={
                            "pointer-events-none absolute inset-0 z-[29]"
                          }
                        >
                          <ViewportScale>
                            {(input?: Dynamic): Dynamic => (
                              <SelectionRing
                                frame={{
                                  x: 0,
                                  y: 0,
                                  w: spec.w,
                                  h: spec.h,
                                }}
                                scale={input}
                                state={value232 ? "member" : "selected"}
                                variant={value256 ? "component" : "object"}
                                grips={
                                  value18 &&
                                  !value252 &&
                                  !value232 &&
                                  !(value228 && fullscreenFile == null)
                                    ? "corners"
                                    : "none"
                                }
                                onResizeStart={(
                                  input2?: Dynamic,
                                  options2?: Dynamic,
                                ): Dynamic => {
                                  let state: Dynamic = {
                                      x: spec.x,
                                      y: spec.y,
                                      w: spec.w,
                                      h: spec.h,
                                    },
                                    [items, items2]: Dynamic = [
                                      options2.clientX,
                                      options2.clientY,
                                    ],
                                    items3: Dynamic = [
                                      ...(input2.x
                                        ? input2.x === "left"
                                          ? ["x", "w"]
                                          : ["w"]
                                        : []),
                                      ...(input2.y
                                        ? input2.y === "top"
                                          ? ["y", "h"]
                                          : ["h"]
                                        : []),
                                    ],
                                    value273: Dynamic =
                                      input2.x !== null && input2.y !== null,
                                    value274: Dynamic = callback45({
                                      files: [spec.file],
                                    }),
                                    callback61: Dynamic = (
                                      input3?: Dynamic,
                                    ): Dynamic => {
                                      let scale: Dynamic = camera.get().scale,
                                        state2: Dynamic = {
                                          dx:
                                            (input3.clientX - items) / scale,
                                          dy:
                                            (input3.clientY - items2) / scale,
                                        },
                                        value276: Dynamic =
                                          input3.metaKey || input3.ctrlKey
                                            ? {
                                                ...state2,
                                                guides: [],
                                              }
                                            : snapResize(
                                                state,
                                                input2,
                                                state2.dx,
                                                state2.dy,
                                                value274,
                                                canvasTouchDragThresholdPixels /
                                                  scale,
                                              ),
                                        [items4, items5]: Dynamic = [
                                          Math.round(value276.dx),
                                          Math.round(value276.dy),
                                        ],
                                        value277: Dynamic =
                                          value273 && input3.shiftKey
                                            ? resizeRectKeepingAspect(
                                                state,
                                                input2,
                                                items4,
                                                items5,
                                                minimumArtboardSize,
                                                maximumArtboardSize,
                                              )
                                            : resizeRect(
                                                state,
                                                input2,
                                                items4,
                                                items5,
                                                minimumArtboardSize,
                                                maximumArtboardSize,
                                              ),
                                        value278: Dynamic =
                                          value273 && input3.shiftKey
                                            ? {
                                                x: Math.round(value277.x),
                                                y: Math.round(value277.y),
                                                w: Math.round(value277.w),
                                                h: Math.round(value277.h),
                                              }
                                            : value277;
                                      return {
                                        box: value278,
                                        guides: activeResizeGuides(
                                          value278,
                                          input2,
                                          value276.guides,
                                        ),
                                      };
                                    },
                                    callback62: Dynamic = (
                                      input3?: Dynamic,
                                    ): Dynamic =>
                                      Object.fromEntries(
                                        items3.map(
                                          (input4?: Dynamic): Dynamic => [
                                            input4,
                                            input3[input4],
                                          ],
                                        ),
                                      ),
                                    callback63: Dynamic = (
                                      input3?: Dynamic,
                                      options3?: Dynamic,
                                    ): Dynamic => {
                                      let value276: Dynamic =
                                        value146.current.artboards.find(
                                          (input4?: Dynamic): Dynamic =>
                                            input4.file === spec.file,
                                        );
                                      onManifestChange(
                                        replaceDesignArtboards(
                                          value146.current,
                                          value146.current.artboards.map(
                                            (input4?: Dynamic): Dynamic =>
                                              input4.file === spec.file
                                                ? {
                                                    ...input4,
                                                    ...callback62(input3),
                                                  }
                                                : input4,
                                          ),
                                        ),
                                        options3,
                                        options3 && value276
                                          ? {
                                              resizedFrom: {
                                                file: spec.file,
                                                x: value276.x,
                                                y: value276.y,
                                                w: value276.w,
                                                h: value276.h,
                                                ...callback62(state),
                                              },
                                            }
                                          : undefined,
                                      );
                                    },
                                    value275: Dynamic = state;
                                  callback57(options2, "resize", {
                                    live: (input3?: Dynamic): Dynamic => {
                                      let value276: Dynamic =
                                        callback61(input3);
                                      value275 = value276.box;
                                      callback63(value275, false);
                                      value70(
                                        value276.guides.length > 0
                                          ? value276.guides
                                          : null,
                                      );
                                    },
                                    commit: (): Dynamic =>
                                      callback63(value275, true),
                                    revert: (): Dynamic =>
                                      callback63(state, false),
                                    end: (): Dynamic => value70(null),
                                  });
                                }}
                              />
                            )}
                          </ViewportScale>
                        </div>
                      ),
                      options.artboardOverlay && (
                        <ArtboardOverlayPlane
                          a={spec}
                          fullscreenFile={fullscreenFile ?? null}
                          fullscreenBox={fullscreenBox ?? null}
                          rowH={value258}
                          overlay={options.artboardOverlay}
                        />
                      ),
                      (fullscreenFile == null ||
                        (value22 && fullscreenFile === spec.file)) && (
                        <div
                          ref={callback23(spec.file)}
                          data-mega-chrome={"element"}
                          className={joinClassNames(
                            "pointer-events-none absolute left-0",
                            value117 === spec.file ? "z-[31]" : "z-[29]",
                          )}
                          style={
                            fullscreenFile === spec.file && fullscreenBox
                              ? {
                                  top: value258,
                                  width: fullscreenBox.w,
                                  height: fullscreenBox.h - value258,
                                  ...PickerRuntimeScriptTAppAccentConfig,
                                }
                              : {
                                  top: value258,
                                  width: spec.w,
                                  height: spec.h,
                                  ...PickerRuntimeScriptTAppAccentConfig,
                                }
                          }
                        />
                      ),
                      value271 && (
                        <PendingArtboardTitle
                          spec={spec}
                          tone={value256 ? "component" : "arrived"}
                          className={"z-30"}
                        />
                      ),
                      <div
                        data-testid={"mega-artboard-frame-" + spec.file}
                        data-empty-piece={value254 || undefined}
                        className={joinClassNames(
                          "relative flex h-full w-full flex-col overflow-clip",
                          value252
                            ? value254
                              ? "rounded border-[1.5px] border-dashed border-(--cds-text-secondary)"
                              : value253
                                ? "ring-1 ring-app-accent/50"
                                : value269
                                  ? value265 &&
                                    !value251 &&
                                    "hover:ring-1 hover:ring-(--cds-border)/60"
                                  : "ring-1 ring-(--cds-border)"
                            : "bg-white",
                          !value252 &&
                            !fullscreenBox &&
                            !value271 &&
                            "shadow-md",
                          !value252 &&
                            !fullscreenBox &&
                            !value271 &&
                            (fullscreenFile != null || !value251) &&
                            (value250 && value265
                              ? "ring-1 ring-app-accent/50"
                              : value256
                                ? "ring-1 ring-(--cds-fill-pro)"
                                : "ring-1 ring-(--cds-border)"),
                        )}
                        style={{
                          ...PickerRuntimeScriptTAppAccentConfig,
                          borderRadius:
                            value252 || fullscreenBox
                              ? undefined
                              : artboardRadiusCss(spec.radius),
                        }}
                      >
                        <ArtboardFrame
                          file={spec.file}
                          displayTitle={value257}
                          title={spec.title}
                          live={value269}
                          expanded={spec.file === fullscreenFile}
                          onPagePointer={options.onPagePointer}
                          onPageScroll={options.onPageScroll}
                          migrated={flag}
                          frameless={value252}
                          onContentHull={onContentHull}
                          box={
                            fullscreenFile === spec.file && fullscreenBox
                              ? fullscreenBox
                              : callback31(spec)
                          }
                          boxRowH={
                            fullscreenFile === spec.file && fullscreenBox
                              ? value258
                              : 0
                          }
                          component={value256}
                          chromeSlot={value101.get(spec.file) ?? null}
                          onHostGesture={value134}
                          onTweaksRow={onTweaksRow}
                          onTweaksDirty={onTweaksDirty}
                          onOpenTweaks={onOpenTweaks && value150}
                          canvasScaleRef={canvasScaleRef}
                          assets={assets}
                          doc={doc}
                          focused={value250}
                          editing={value18 && !value259}
                          gripless={
                            value228 &&
                            value250 &&
                            onSetMoveCommit != null &&
                            fullscreenFile == null
                          }
                          panelMounted={value265 && value250 && !value259}
                          vectorEdit={armedTool === "vector"}
                          playing={value259}
                          readOnly={!value18 || value259}
                          frameArmed={frameArmed}
                          editable={editable}
                          onHandle={value3}
                          onPreviewDropNotice={value153}
                          onHistoryPush={onHistoryPush}
                          onModelReparsed={onModelReparsed}
                          onHistoryApply={onHistoryApply}
                          onHistoryRevoke={onHistoryRevoke}
                          onHistoryDrop={onHistoryDrop}
                          onTweakEdit={onTweakEdit}
                          sessionEpoch={sessionEpoch}
                          actionsRef={actionsRef}
                          onSelection={onSelectionEvent}
                          onSelectionSeq={onSelectionSeq}
                          onGestureStream={value139}
                          onTextEditState={value142}
                          onTextEditEnded={keyboard2?.onTextEditEnded}
                          keyboardSkipsContent={value265 && !value253}
                          onReadyGen={onArtboardReady}
                          dsVarNames={dsVarNames}
                          onDefinedVars={onDefinedVars}
                          onBlockedChange={value215}
                          onProblemsChange={onArtboardProblems}
                          routeForwardedKey={routeForwardedKey}
                          onDragEvent={value93}
                          onBoxEvent={onBoxEvent}
                          onModifierKey={value135}
                          onPanZoom={value66}
                          onRepeatRefused={onRepeatRefused}
                          onPreviewClick={
                            value265 || value259 ? undefined : value60
                          }
                          keyboardInert={value126}
                          inertFrame={value264}
                          pointerInert={
                            value126 ||
                            value43 === spec.file ||
                            (streamDragFile != null &&
                              streamDragFile !== spec.file) ||
                            (value18 &&
                              !value259 &&
                              armedTool === "note" &&
                              fullscreenFile == null) ||
                            (value18 &&
                              !(value250 && (!value252 || value253)) &&
                              !value259 &&
                              supportsClickPlacement(
                                armedTool,
                              ) &&
                              fullscreenFile == null)
                          }
                          exitGuardRef={exitGuardRef}
                          textEditOpenRef={textEditOpenRef}
                          settleSessionRef={settleSessionRef}
                          commitOpenTextEditRef={commitOpenTextEditRef}
                          onSessionDirtyChange={onSessionDirtyChange}
                          onEditInput={onEditInput}
                          onLocalEdit={onLocalEdit}
                          onUndoStack={onUndoStack}
                          onToolChange={onToolChange}
                          toolResetTick={toolResetTick}
                          onOpenFile={onOpenFile && value152}
                          onPasteImages={value179}
                          onDropVideos={value180}
                          onPointerPresence={value174}
                          onPointerAt={value175}
                          artboardSettings={
                            value250 ? artboardSettings : undefined
                          }
                          canvasObject={value250 ? canvasObject : null}
                          outlineArtboards={value250 ? value193 : null}
                          presentPropsTick={presentPropsTick}
                          onPresentPropsHandled={onPresentPropsHandled}
                          placeRequest={
                            placeRequest?.file === spec.file
                              ? placeRequest
                              : null
                          }
                          onPlaceHandled={onPlaceHandled}
                        />
                        {options.guidesVisible &&
                          spec.guides !== undefined &&
                          fullscreenFile == null &&
                          !value259 && (value269 ? (<ArtboardLayoutGuides
                              guides={spec.guides}
                              w={spec.w}
                              h={spec.h}
                            />) : (<CanvasRectVisibility
                              rect={spec}
                              surfaceRef={value9}
                            >
                              {(input?: Dynamic): Dynamic =>
                                input && spec.guides ? (
                                  <ArtboardLayoutGuides
                                    guides={spec.guides}
                                    w={spec.w}
                                    h={spec.h}
                                  />
                                ) : null
                              }
                            </CanvasRectVisibility>))}
                        {(!value269 || value264) &&
                          !value213.has(spec.file) && (<CanvasRectVisibility
                              rect={spec}
                              surfaceRef={value9}
                            >
                              {(input?: Dynamic): Dynamic => (
                                <div
                                  data-testid={
                                    (value269
                                      ? "mega-artboard-open-"
                                      : "mega-artboard-offloaded-") +
                                    spec.file
                                  }
                                  ref={
                                    value264
                                      ? preventTouchScroll
                                      : undefined
                                  }
                                  role={"button"}
                                  tabIndex={value265 ? -1 : 0}
                                  inert={
                                    (!input && !value264) || value126
                                      ? true
                                      : undefined
                                  }
                                  aria-label={
                                    (value264 ? uiMessage("canvas.interactionLayer.openArtboard") : uiMessage("canvas.interactionLayer.loadArtboard2")) + value257
                                  }
                                  className={
                                    "absolute inset-0 z-10 flex cursor-pointer items-center justify-center overflow-hidden select-none"
                                  }
                                  style={
                                    value269
                                      ? undefined
                                      : value21
                                        ? value270
                                          ? {
                                              backgroundColor: value270.bg,
                                            }
                                          : undefined
                                        : {
                                            backgroundImage:
                                              "repeating-linear-gradient(135deg, transparent 0 10px, var(--om-bg-canvas) 10px 20px)",
                                          }
                                  }
                                  onPointerDown={(
                                    event?: Dynamic,
                                  ): Dynamic => {
                                    if (
                                      event.button !== 0 ||
                                      value85.current === "note" ||
                                      value85.current === "frame" ||
                                      supportsClickPlacement(
                                        value85.current,
                                      )
                                    )
                                      return;
                                    let shiftKey: Dynamic = event.shiftKey;
                                    watchPointerRelease(
                                      event.nativeEvent,
                                      (): Dynamic =>
                                        callback42(spec.file, shiftKey),
                                    );
                                  }}
                                  {...buttonKeyboardActivation(
                                    (input2?: Dynamic): Dynamic =>
                                      callback42(
                                        spec.file,
                                        input2.shiftKey || input2.metaKey,
                                      ),
                                  )}
                                  onClick={(input2?: Dynamic): Dynamic => {
                                    input2.detail === 0 &&
                                      callback42(
                                        spec.file,
                                        input2.shiftKey || input2.metaKey,
                                      );
                                  }}
                                >
                                  {value21 && !value269 && !value252 && (<RunWhenSeen
                                      seen={input}
                                      then={(): Dynamic => value42(spec.file)}
                                    />)}
                                  {!value269 && (<ViewportScaleThreshold
                                      min={
                                        value21
                                          ? Math.max(
                                              canvasHandleLabelSize
                                                .w / spec.w,
                                              canvasHandleLabelSize
                                                .h / spec.h,
                                            )
                                          : 0
                                      }
                                    >
                                      {(input2?: Dynamic): Dynamic =>
                                        input2 && (
                                          <span
                                            ref={camera.stamp}
                                            className={joinClassNames(
                                              "shrink-0 whitespace-nowrap px-2.5 py-1 text-xs",
                                              !value270 && "text-secondary",
                                              value21
                                                ? "opacity-50"
                                                : "opacity-[0.15]",
                                            )}
                                            style={{
                                              transform:
                                                "scale(var(--mega-inv-scale))",
                                              ...(value270
                                                ? {
                                                    color: value270.lightInk
                                                      ? "#fff"
                                                      : "#141413",
                                                  }
                                                : {}),
                                            }}
                                          >
                                            <span
                                              className={
                                                "pointer-coarse:hidden"
                                              }
                                            >
                                              {uiMessage("canvas.interactionLayer.clickToLoad")}
                                            </span>
                                            <span
                                              className={
                                                "hidden pointer-coarse:inline"
                                              }
                                            >
                                              {value264 ? (uiMessage("canvas.interactionLayer.tapToOpen")) : (uiMessage("canvas.interactionLayer.tapToLoad"))}
                                            </span>
                                          </span>
                                        )
                                      }
                                    </ViewportScaleThreshold>)}
                                </div>
                              )}
                            </CanvasRectVisibility>)}
                        {value266 && (<div
                            data-mega-chrome={value262}
                            data-testid={
                              artboardOverlayIdPrefixes[value262] +
                              spec.file
                            }
                            className={joinClassNames(
                              "absolute inset-0 z-20",
                              (value252 || value251 || value261) && value18
                                ? "cursor-grab"
                                : "cursor-pointer",
                              (armedTool === "note" ||
                                supportsClickPlacement(
                                  armedTool,
                                )) &&
                                fullscreenFile == null &&
                                "pointer-events-none",
                              shouldPassFileDropThroughOverlay({
                                chrome: value262,
                                filesDrag: value30,
                              }) && "pointer-events-none",
                            )}
                            {...(value252
                              ? {
                                  "data-mega-piece": "",
                                  role: "button",
                                  tabIndex: 0,
                                  inert: value126 ? true : undefined,
                                  "aria-label": value257,
                                  "aria-pressed": value251,
                                  ...buttonKeyboardActivation(
                                    (input?: Dynamic): Dynamic => {
                                      input.key === "Enter" &&
                                      value22 &&
                                      value18 &&
                                      !input.shiftKey &&
                                      !input.metaKey
                                        ? onEnterPiece?.(
                                            spec.file,
                                            spec.w / 2,
                                            spec.h / 2,
                                          )
                                        : value60(
                                            spec.file,
                                            input.shiftKey || input.metaKey,
                                          );
                                    },
                                  ),
                                  onClick: (input?: Dynamic): Dynamic => {
                                    input.detail === 0 &&
                                      (value22 &&
                                      value18 &&
                                      !input.shiftKey &&
                                      !input.metaKey
                                        ? onEnterPiece?.(
                                            spec.file,
                                            spec.w / 2,
                                            spec.h / 2,
                                          )
                                        : value60(
                                            spec.file,
                                            input.shiftKey || input.metaKey,
                                          ));
                                  },
                                  onDoubleClick: (
                                    event?: Dynamic,
                                  ): Dynamic => {
                                    value18 &&
                                      onEnterPiece?.(
                                        spec.file,
                                        event.nativeEvent.offsetX,
                                        event.nativeEvent.offsetY,
                                      );
                                  },
                                }
                              : {
                                  onDoubleClick: (
                                    event?: Dynamic,
                                  ): Dynamic => {
                                    if (
                                      event.shiftKey ||
                                      event.metaKey ||
                                      event.ctrlKey ||
                                      event.altKey ||
                                      !onFaceDoubleClick ||
                                      !value18 ||
                                      value27 ||
                                      (armedTool != null &&
                                        armedTool !== "select") ||
                                      fullscreenFile != null
                                    )
                                      return;
                                    let state: Dynamic = {
                                      x: event.nativeEvent.offsetX,
                                      y: event.nativeEvent.offsetY,
                                    };
                                    (
                                      value29.current ?? Promise.resolve()
                                    ).then(
                                      (): Dynamic =>
                                        onFaceDoubleClick(spec.file, state),
                                    );
                                  },
                                })}
                            onPointerDown={(event?: Dynamic): Dynamic => {
                              value32();
                              if (event.button !== 0) return;
                              let shiftKey: Dynamic = event.shiftKey;
                              if (value252) {
                                if (
                                  isTouchSelectionStart(
                                    event.pointerType,
                                    value251,
                                  )
                                ) {
                                  watchPointerRelease(
                                    event.nativeEvent,
                                    (): Dynamic =>
                                      value60(spec.file, shiftKey),
                                  );
                                  return;
                                }
                                if (
                                  onSetMoveCommit &&
                                  event.pointerType !== "touch" &&
                                  !shiftKey &&
                                  !event.altKey &&
                                  hasBoardSelection(
                                    value57.current,
                                    {
                                      file: spec.file,
                                    },
                                  ) &&
                                  callback54()
                                ) {
                                  callback53({
                                    pointerId: event.pointerId,
                                    captureEl: event.currentTarget,
                                    clientX: event.clientX,
                                    clientY: event.clientY,
                                    leader: {
                                      canvas: {
                                        file: spec.file,
                                      },
                                    },
                                    stillAction: (): Dynamic =>
                                      value60(spec.file, false),
                                    armWait: null,
                                    heldCover: null,
                                  });
                                  return;
                                }
                                let value275: Dynamic = selectionPointerDownDecision(
                                  value57.current,
                                  {
                                    file: spec.file,
                                  },
                                  shiftKey,
                                );
                                value275.selectNow &&
                                  value60(spec.file, shiftKey);
                                callback46(
                                  event,
                                  {
                                    file: spec.file,
                                  },
                                  spec,
                                  value275.carry,
                                  value275.click,
                                );
                                return;
                              }
                              let value273: Dynamic = canvasFacePointerAction({
                                  editing: value18,
                                  pointerType: event.pointerType,
                                  tool: armedTool,
                                  fullscreen: fullscreenFile != null,
                                  faceOverlay: value260,
                                }),
                                value274: Dynamic = isPrimaryModifierEvent(event),
                                state: Dynamic = {
                                  x: event.nativeEvent.offsetX,
                                  y: event.nativeEvent.offsetY,
                                },
                                callback61: Dynamic = (
                                  input?: Dynamic,
                                ): Dynamic => {
                                  value273 === "pick" &&
                                  !(value261 && event.pointerType === "touch")
                                    ? callback18(event, spec, {
                                        toggle: shiftKey,
                                        deepKey: value274,
                                        still: input,
                                        face: value260,
                                        kind: value260
                                          ? "face"
                                          : value261
                                            ? "set"
                                            : "focus",
                                        at: state,
                                      })
                                    : value273 === "leave"
                                      ? value60(spec.file, true)
                                      : (value60(spec.file, shiftKey),
                                        shiftKey || onFocus(spec.file));
                                };
                              if (event.pointerType === "touch") {
                                watchPointerRelease(
                                  event.nativeEvent,
                                  (): Dynamic => callback61(true),
                                );
                                return;
                              }
                              if (
                                value18 &&
                                value251 &&
                                !shiftKey &&
                                !event.altKey &&
                                !value274 &&
                                fullscreenFile == null
                              ) {
                                if (onSetMoveCommit && callback54()) {
                                  callback53({
                                    pointerId: event.pointerId,
                                    captureEl: event.currentTarget,
                                    clientX: event.clientX,
                                    clientY: event.clientY,
                                    leader: {
                                      canvas: {
                                        file: spec.file,
                                      },
                                    },
                                    stillAction: (): Dynamic =>
                                      callback61(true),
                                    armWait: null,
                                    heldCover: null,
                                  });
                                  return;
                                }
                                value68.current = (): Dynamic =>
                                  callback61(true);
                                callback46(
                                  event,
                                  {
                                    file: spec.file,
                                  },
                                  spec,
                                  value57.current,
                                  null,
                                );
                                return;
                              }
                              if (
                                event.altKey &&
                                !shiftKey &&
                                !value261 &&
                                onDuplicateObjects &&
                                fullscreenFile == null
                              ) {
                                let value275: Dynamic = selectionPointerDownDecision(
                                  value57.current,
                                  {
                                    file: spec.file,
                                  },
                                  false,
                                );
                                value275.selectNow &&
                                  value60(spec.file, false);
                                callback46(
                                  event,
                                  {
                                    file: spec.file,
                                  },
                                  spec,
                                  value275.carry,
                                  value275.click,
                                );
                                return;
                              }
                              callback61(false);
                            }}
                            onPointerMove={(input?: Dynamic): Dynamic => {
                              callback50(input, false);
                              value252 || callback3(spec.file, input);
                            }}
                            onPointerUp={(input?: Dynamic): Dynamic => {
                              let [items, items2]: Dynamic = [
                                value67.current,
                                value68.current,
                              ];
                              value68.current = null;
                              callback50(input, true);
                              items2 &&
                                items &&
                                items.pointerId === input.pointerId &&
                                !items.live &&
                                items2();
                            }}
                            onPointerCancel={(input?: Dynamic): Dynamic => {
                              value68.current = null;
                              callback49(input);
                            }}
                            onPointerLeave={value32}
                          />)}
                        {value271 && (<PendingArtboardFace
                            spec={spec}
                            sheen={false}
                            className={"z-[16]"}
                          />)}
                      </div>,
                    ],
                  } as const;
                  const _key = spec.file;
                  return <_Component key={_key} {..._props} />;
                })();
              })}
            </div>
          </ConditionalPortal>
          {fullscreenFile == null && (((...args: Dynamic[]): Dynamic => (renderCanvasObjects as Dynamic)({ get armedTool() { return armedTool; }, get callback27() { return callback27; }, get callback28() { return callback28; }, get callback30() { return callback30; }, get callback34() { return callback34; }, get callback45() { return callback45; }, get callback5() { return callback5; }, get callback55() { return callback55; }, get callback56() { return callback56; }, get callback6() { return callback6; }, get camera() { return camera; }, get entry() { return entry; }, get manifest() { return manifest; }, get selectedNotes() { return selectedNotes; }, get value11() { return value11; }, get value113() { return value113; }, get value114() { return value114; }, get value119() { return value119; }, get value126() { return value126; }, get value134() { return value134; }, get value18() { return value18; }, get value181() { return value181; }, get value232() { return value232; }, get value35() { return value35; }, get value46() { return value46; }, get value50() { return value50; }, get value59() { return value59; }, get value70() { return value70; } }, ...args))())}
          {artboardNotice &&
            fullscreenFile == null && (manifest.artboards.map((input?: Dynamic): Dynamic => {
              let value250: Dynamic = artboardNotice(input.file);
              return (
                value250 != null &&
                callback7(
                  uiMessage("canvas.interactionLayer.notice") + input.file,
                  (() => {
                    const _Component5 = ArtboardNoticeAnchor;
                    const _props5 = {
                      x: input.x,
                      y: input.y + input.h,
                      w: input.w,
                      inert: value126,
                      stamp: camera.stamp,
                      children: value250,
                    } as const;
                    const _key5 = input.file;
                    return <_Component5 key={_key5} {..._props5} />;
                  })(),
                )
              );
            }))}
          {value241 &&
            fullscreenFile == null && (callback7(
              "group-box",
              <div
                data-mega-chrome={"group-resize"}
                data-testid={value240 ? "mega-set-box" : "mega-group-box"}
                className={"pointer-events-none absolute"}
                style={{
                  left: value241.x,
                  top: value241.y,
                  width: value241.w,
                  height: value241.h,
                }}
              >
                <ViewportScale>
                  {(input?: Dynamic): Dynamic => (
                    <SelectionRing
                      frame={{
                        x: 0,
                        y: 0,
                        w: value241.w,
                        h: value241.h,
                      }}
                      scale={input}
                      rotation={
                        value242 ? (value242 * Math.PI) / 180 : undefined
                      }
                      angleLabel={
                        value233?.turning
                          ? String(value233.deg) + "\xB0"
                          : undefined
                      }
                      grips={value246 ? "none" : "corners"}
                      edgeStrips={!value243}
                      onResizeStart={callback59}
                      onRotateStart={
                        !value246 && value244 ? callback60 : undefined
                      }
                      rotateDisabledReason={value246 ? undefined : value245}
                    />
                  )}
                </ViewportScale>
              </div>,
            ))}
          {value114 &&
            value121?.kind === "image" && (((...args: Dynamic[]): Dynamic => (renderImageCropEditor as Dynamic)({ get callback27() { return callback27; }, get callback30() { return callback30; }, get callback7() { return callback7; }, get value114() { return value114; }, get value115() { return value115; }, get value120() { return value120; }, get value121() { return value121; }, get value134() { return value134; }, get value181() { return value181; } }, ...args))())}
          {value75 && armedTool === "note" && (<div
              data-testid={"mega-note-ghost"}
              aria-hidden={"true"}
              className={
                "pointer-events-none absolute z-30 rounded-[12px] border border-dashed border-black/25 opacity-70"
              }
              style={{
                left: value75.x,
                top: value75.y,
                width: PlatformFileContentConstant_8,
                height: NotesLinkEditingLh({
                  id: "",
                  x: 0,
                  y: 0,
                  w: 0,
                  text: "",
                }),
                background: Fef3a2Value,
              }}
            />)}
          {value82 && (<div
              data-testid={"mega-pen-ghost"}
              className={"pointer-events-none contents"}
            >
              <CanvasShape_r
                spec={{
                  id: "pen-ghost",
                  kind: "pen",
                  ...value82,
                }}
                scale={entry.scale}
                editing={false}
                selected={false}
                objectPress={{}}
                onChange={(): Dynamic => {}}
                onGesture={(): Dynamic => {}}
                armWindowGestureEnd={(): Dynamic => {}}
              />
            </div>)}
          {value80 && value80.onCanvas && value80.tool !== "text" && (<div
              data-testid={"mega-place-ghost"}
              className={"pointer-events-none contents"}
            >
              <CanvasShape_r
                spec={placementGhostAnnotation(value80)}
                scale={entry.scale}
                editing={false}
                selected={false}
                objectPress={{}}
                onChange={(): Dynamic => {}}
                onGesture={(): Dynamic => {}}
                armWindowGestureEnd={(): Dynamic => {}}
              />
            </div>)}
          {value80 && !(value80.onCanvas && value80.tool !== "text") && (<div
              data-testid={"mega-place-ghost"}
              className={joinClassNames(
                "pointer-events-none absolute z-30",
                !value247 &&
                  "border-solid border-app-accent/80 bg-app-accent/10",
                value80.tool === "oval" && "rounded-full",
              )}
              style={{
                ...PickerRuntimeScriptTAppAccentConfig,
                borderWidth: value247 ? 0 : 1.5 / entry.scale,
                left: value80.x,
                top: value80.y,
                width: Math.max(value80.w, value247 ? 8 : 0),
                height: Math.max(value80.h, value247 ? 8 : 0),
              }}
            >
              {value247 && (<svg
                  width={"100%"}
                  height={"100%"}
                  viewBox={
                    "0 0 " +
                    Math.max(value80.w, 8) +
                    " " +
                    Math.max(value80.h, 8)
                  }
                  style={{
                    display: "block",
                    overflow: "visible",
                  }}
                >
                  <defs>
                    <marker
                      id={"mega-place-arrow-head"}
                      orient={"auto"}
                      markerWidth={"5"}
                      markerHeight={"5"}
                      refX={
                        SvgArrowsConstant -
                        SvgArrowsConstant_3
                      }
                      refY={SvgArrowsConstant_2}
                      overflow={"visible"}
                    >
                      <path
                        d={SvgArrowsCss}
                        stroke={"none"}
                        style={{
                          fill: "var(--t-app-accent)",
                        }}
                      />
                    </marker>
                  </defs>
                  <line
                    x1={value248?.x1}
                    y1={value248?.y1}
                    x2={value248?.x2}
                    y2={value248?.y2}
                    stroke={"var(--t-app-accent)"}
                    strokeWidth={4 / entry.scale}
                    strokeLinecap={"round"}
                    markerEnd={
                      value80.tool === "arrow"
                        ? "url(#mega-place-arrow-head)"
                        : undefined
                    }
                  />
                </svg>)}
            </div>)}
          {value77 && (<div
              data-testid={"mega-draw-ghost"}
              className={
                "pointer-events-none absolute z-30 rounded-sm border-2 border-dashed border-app-accent/70 bg-app-accent/5"
              }
              style={{
                ...PickerRuntimeScriptTAppAccentConfig,
                left: value77.x,
                top: value77.y,
                width: value77.w,
                height: value77.h,
              }}
            />)}
          <PictureDropGhosts
            page={options.ghostPage ?? ""}
            artboards={
              value20
                ? manifest.artboards.map(
                    (input?: Dynamic): Dynamic =>
                      input.file === value20.file ? value20 : input,
                  )
                : manifest.artboards
            }
          />
          {options.pendingPictures != null &&
            options.pendingPictures.length > 0 && (callback7(
              "pending",
              options.pendingPictures.map(
                (input?: Dynamic): Dynamic =>
                  (() => {
                    const _Component6 = "div";
                    const _props6 = {
                      "data-testid": "mega-picture-pending",
                      "data-mega-chrome": "picture-pending",
                      className: "pointer-events-none absolute z-30",
                      style: {
                        left: input.x,
                        top: input.y,
                        width: input.w,
                        height: input.h,
                      },
                      children: [
                        <img
                          aria-hidden={"true"}
                          src={input.url}
                          alt={""}
                          draggable={false}
                          className={"absolute inset-0 h-full w-full"}
                          style={{
                            objectFit: "fill",
                          }}
                        />,
                        <UploadingOverlay />,
                      ],
                    } as const;
                    const _key6 = input.key;
                    return <_Component6 key={_key6} {..._props6} />;
                  })(),
              ),
            ))}
          {value73 != null &&
            value73.length > 0 && (callback7(
              "dup-ghosts",
              value73.map(
                (input?: Dynamic, options2?: Dynamic): Dynamic => (
                  <div
                    key={options2}
                    data-testid={"mega-dup-ghost"}
                    className={
                      "pointer-events-none absolute z-30 rounded-sm border-2 border-dashed border-app-accent/70 bg-app-accent/5"
                    }
                    style={{
                      ...PickerRuntimeScriptTAppAccentConfig,
                      left: input.x,
                      top: input.y,
                      width: input.w,
                      height: input.h,
                    }}
                  />
                ),
              ),
            ))}
          {options.worldOverlay}
        </div>
        {value35 && (<div
            ref={value51}
            data-mega-lifted={"under"}
            aria-busy={options.turnBusy ? true : undefined}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {value35 && (<div
            ref={value37}
            data-mega-lifted={"tiles"}
            aria-busy={options.turnBusy ? true : undefined}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {value35 && (<div
            ref={value47}
            data-mega-lifted={"notes"}
            aria-busy={options.turnBusy ? true : undefined}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {value35 && (<div
            ref={value54}
            data-mega-lifted={"chrome"}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {value86 && (<div
            ref={value90}
            data-testid={"mega-marquee"}
            aria-hidden={"true"}
            className={
              "pointer-events-none absolute z-30 bg-accent-muted outline-1 -outline-offset-1 outline-fill-accent"
            }
          />)}
        {value69 && fullscreenFile == null && (<CanvasSnapGuides guides={value69} />)}
        {value71 && fullscreenFile == null && (<CanvasGapGuides gaps={value71} />)}
        {dragToast && (<div
            data-mega-chrome={"drag-toast"}
            data-testid={"mega-drag-toast"}
            className={
              "pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-md border bg-page px-3 py-1.5 text-xs shadow-lg"
            }
          >
            {dragToast}
          </div>)}
        {dragGhost && value249 && (<div
            data-mega-chrome={"drag-ghost"}
            data-testid={"mega-drag-ghost"}
            data-ghost={dragGhost.alt ? "copy" : "move"}
            aria-label={(dragGhost.alt ? uiMessage("canvas.interactionLayer.copy") : uiMessage("canvas.interactionLayer.move")) + dragGhost.label}
            className={"pointer-events-none absolute z-40"}
            style={{
              ...PickerRuntimeScriptTAppAccentConfig,
              left: value249.left,
              top: value249.top,
              width: value249.width,
              height: value249.height,
            }}
          >
            <div
              className={
                "absolute inset-0 overflow-hidden rounded-sm border border-dashed border-app-accent/70"
              }
            >
              {dragGhost.ghost != null && ((() => {
                  const _Component7 = PlacementGhostFrame;
                  const _props7 = {
                    ghost: dragGhost.ghost,
                    style: {
                      width: value249.box.w,
                      height: value249.box.h,
                      transform: `scale(${value249.s})`,
                      transformOrigin: "0 0",
                    },
                  } as const;
                  const _key7 = dragGhost.key;
                  return <_Component7 key={_key7} {..._props7} />;
                })())}
            </div>
            {dragGhost.alt && (<span
                data-testid={"mega-drag-ghost-copy"}
                className={
                  "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-app-accent text-[11px] font-semibold leading-none text-white shadow-md"
                }
              >
                {"+"}
              </span>)}
          </div>)}
        {dragGhost && !value249 && (<div
            data-mega-chrome={"drag-ghost"}
            data-testid={"mega-drag-ghost"}
            className={
              "pointer-events-none absolute z-40 rounded-md border border-app-accent bg-page/90 px-2 py-1 text-xs shadow-md"
            }
            style={{
              ...PickerRuntimeScriptTAppAccentConfig,
              left: (dragGhost.x - entry.x) * entry.scale + 8,
              top: (dragGhost.y - entry.y) * entry.scale + 8,
            }}
          >
            {dragGhost.alt ? (uiMessage("canvas.interactionLayer.copy")) : (uiMessage("canvas.interactionLayer.move"))}
            {dragGhost.label}
          </div>)}
        {value129 && fullscreenFile == null ? (<div
            data-mega-pan-blanket={""}
            data-testid={"mega-pan-overlay"}
            className={
              "absolute inset-0 z-[35] cursor-grab active:cursor-grabbing"
            }
          />) : (null)}
        {value18 &&
          !value124 &&
          fullscreenFile == null &&
          value59 != null &&
          !supportsClickPlacement(armedTool) &&
          armedTool !== "draw" && (((...args: Dynamic[]): Dynamic => (renderAnnotationQuickActions as Dynamic)({ get callback25() { return callback25; }, get callback28() { return callback28; }, get callback34() { return callback34; }, get callback44() { return callback44; }, get manifest() { return manifest; }, get onAnnotationCss() { return onAnnotationCss; }, get onDeleteAnnotation() { return onDeleteAnnotation; }, get onOpenPropsPanel() { return onOpenPropsPanel; }, get onReplaceAnnotationMedia() { return onReplaceAnnotationMedia; }, get value112() { return value112; }, get value114() { return value114; }, get value120() { return value120; }, get value15() { return value15; }, get value162() { return value162; }, get value17() { return value17; }, get value18() { return value18; }, get value181() { return value181; }, get value21() { return value21; }, get value59() { return value59; }, get value8() { return value8; } }, ...args))())}
        <R_useCanvasComments
          manifest={manifest}
          annBox={callback44}
          annUnder={callback6}
          pageKey={pageKey}
          camera={camera}
          surfaceRef={value9}
          handlesRef={value2}
          fullscreenFile={fullscreenFile ?? null}
          fullscreenFrame={value20}
          mdnHideCommentCards={playingFile != null}
          onReveal={onRevealComment}
          onController={(input?: Dynamic): Dynamic => {
            value5(input);
            onCommentsController?.(input);
          }}
          onModeChange={(input?: Dynamic): Dynamic => {
            value127(input);
            onCommenting?.(input);
            input && onClearSelection();
          }}
          armedTool={armedTool}
          spaceHeld={value95}
          keyHeld={
            value124 || value136 || streamDragFile != null || value140 != null
          }
        />
        {value18 &&
          (!elementMenuHidden || crossFile != null) &&
          !value124 &&
          !value136 &&
          streamDragFile == null &&
          elementSelection &&
          elementSelection.count > 0 &&
          elementSelection.rect &&
          hasSelectionQuickActions({
            text: quickProps?.text ?? 0,
            shape: quickProps?.shape ?? 0,
            box: quickProps?.box ?? 0,
            image: quickProps?.image ?? 0,
            other: quickProps?.other ?? 0,
            line: quickProps?.line ?? 0,
            crossFile: crossFile != null,
            sidebarVisible: false,
            textEdit: value140,
            editDoor: quickProps?.onEditText != null,
            commentDoor: value7 != null,
          }) && (((...args: Dynamic[]): Dynamic => (renderSelectionQuickActions as Dynamic)({ get crossFile() { return crossFile; }, get elementSelection() { return elementSelection; }, get flag() { return flag; }, get fullscreenBox() { return fullscreenBox; }, get fullscreenFile() { return fullscreenFile; }, get manifest() { return manifest; }, get quickProps() { return quickProps; }, get seed() { return seed; }, get tweakRows() { return tweakRows; }, get value140() { return value140; }, get value15() { return value15; }, get value16() { return value16; }, get value162() { return value162; }, get value163() { return value163; }, get value164() { return value164; }, get value165() { return value165; }, get value166() { return value166; }, get value167() { return value167; }, get value168() { return value168; }, get value169() { return value169; }, get value17() { return value17; }, get value170() { return value170; }, get value171() { return value171; }, get value172() { return value172; }, get value7() { return value7; } }, ...args))())}
      </div>
    </ViewportContext.Provider>
  );
}

/** 拖动画板或便签时随指针移动与松开运行：超过阈值后计算吸附与参考线、更新位置并检测放入目标，松开时提交到画布清单（或复制、放入画板），未移动则按单击处理选中与聚焦。 */
function updateBoardDrag(deps: { readonly callback16: Dynamic; readonly callback43: Dynamic; readonly callback44: Dynamic; readonly callback48: Dynamic; readonly camera: Dynamic; readonly manifest: Dynamic; readonly onDropObjectInto: Dynamic; readonly onDuplicateObjects: Dynamic; readonly onFocus: Dynamic; readonly onManifestChange: Dynamic; readonly onObjectHover: Dynamic; readonly onSelectObjects: Dynamic; readonly value134: Dynamic; readonly value18: Dynamic; readonly value67: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value74: Dynamic; readonly value9: Dynamic }, input?: Dynamic,
      options2?: Dynamic): Dynamic {
      let current: Dynamic = deps.value67.current;
      if (
        !current ||
        input.pointerId !== current.pointerId ||
        (current.setMove && input.fromSetMove !== true)
      )
        return;
      options2 &&
        ((deps.value67.current = null),
        current.unlisten(),
        deps.value134("frame-drag", false));
      if (!current.live) {
        if (
          Math.hypot(
            input.clientX - current.startX,
            input.clientY - current.startY,
          ) <
          (input.pointerType === "touch"
            ? 10
            : canvasDragThresholdPixels)
        ) {
          options2 &&
            (current.click &&
              deps.onSelectObjects(
                boardSelectionItems(current.ref),
                current.click === "toggle" ? "toggle" : "replace",
              ),
            current.focus &&
              "file" in current.ref &&
              deps.onFocus(current.ref.file));
          return;
        }
        if (!deps.value18) return;
        current.live = true;
      }
      current.last = {
        clientX: input.clientX,
        clientY: input.clientY,
        metaKey: input.metaKey,
        ctrlKey: input.ctrlKey,
        pointerType: input.pointerType,
      };
      let value250: Dynamic = input.altKey && deps.onDuplicateObjects != null;
      value250 !== current.alt &&
        (value250 ? deps.callback48(current.set, current.notes) : deps.value74(null),
        (current.alt = value250));
      let { scale: entry2 }: Dynamic = deps.camera.get(),
        {
          dx: value251,
          dy: value252,
          guides: value253,
          gaps: value254,
        }: Dynamic = snapCanvasDrag(
          (input.clientX - current.startX) / entry2,
          (input.clientY - current.startY) / entry2,
          current.snap
            ? {
                box: current.snap.box,
                lines: value250
                  ? current.snap.copyLines
                  : current.snap.moveLines,
                boxes: value250
                  ? current.snap.copyStill
                  : current.snap.moveStill,
              }
            : null,
          canvasTouchDragThresholdPixels / entry2,
          input.metaKey || input.ctrlKey,
        );
      deps.value70(options2 || value253.length === 0 ? null : value253);
      deps.value72(options2 || value254.length === 0 ? null : value254);
      let callback61: Dynamic = (input2?: Dynamic): Dynamic => ({
          x: Math.round(input2.x + value251),
          y: Math.round(input2.y + value252),
        }),
        value255: Dynamic = callback61({
          x: current.origX,
          y: current.origY,
        }),
        value256: Dynamic = !(
          value255.x === Math.round(current.origX) &&
          value255.y === Math.round(current.origY)
        );
      if (current.alt) {
        current.hoverKey &&
          deps.onObjectHover?.({
            key: current.hoverKey,
            target: null,
            point: {
              x: 0,
              y: 0,
            },
            object: current.set[0]
              ? {
                  file: current.set[0].file,
                }
              : {
                  note: current.notes[0].id,
                },
            at: {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
            },
            ctrl: false,
          });
        if (!options2) {
          deps.value74([
            ...current.set.map(
              (input2?: Dynamic): Dynamic => ({
                ...callback61(input2),
                w: input2.w,
                h: input2.h,
              }),
            ),
            ...current.notes.map((input2?: Dynamic): Dynamic => {
              let value257: Dynamic = rotatedAnnotationBounds(
                input2,
                deps.callback44(input2),
              );
              return {
                ...value257,
                ...callback61(value257),
              };
            }),
          ]);
          return;
        }
        deps.value74(null);
        value256
          ? deps.onDuplicateObjects?.(
              current.set.map(
                (input2?: Dynamic): Dynamic => ({
                  file: input2.file,
                  ...callback61(input2),
                }),
              ),
              current.notes.map(
                (input2?: Dynamic): Dynamic => ({
                  id: input2.id,
                  ...callback61(input2),
                }),
              ),
              current.bound,
              current.setMove != null,
            )
          : current.setMove != null &&
            current.bound !== undefined &&
            deps.onDuplicateObjects?.([], [], current.bound, true);
        return;
      }
      if (options2 && !value256) {
        deps.callback48(current.set, current.notes);
        current.hoverKey &&
          deps.onObjectHover?.({
            key: current.hoverKey,
            target: null,
            point: {
              x: 0,
              y: 0,
            },
            object: current.set[0]
              ? {
                  file: current.set[0].file,
                }
              : {
                  note: current.notes[0].id,
                },
            at: {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
            },
            ctrl: false,
          });
        return;
      }
      if (
        !current.alt &&
        !current.setMove &&
        (deps.onDropObjectInto || deps.onObjectHover) &&
        current.set.length + current.notes.length === 1
      ) {
        let value257: Dynamic = current.set[0]
            ? {
                file: current.set[0].file,
              }
            : {
                note: current.notes[0].id,
              },
          value258: Dynamic =
            "note" in value257 ||
            deps.manifest.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === value257.file,
            )?.frameless === true,
          value259: Dynamic = deps.value9.current?.getBoundingClientRect(),
          value260: Dynamic =
            value258 && value259
              ? deps.callback16(input.clientX, input.clientY, value259)
              : null;
        if (value260) {
          let callback62: Dynamic = (
            input2?: Dynamic,
            options3?: Dynamic,
          ): Dynamic =>
            options3.x >= input2.x &&
            options3.x <= input2.x + input2.w &&
            options3.y >= input2.y &&
            options3.y <= input2.y + input2.h;
          current.left ??= new Set();
          for (let value264 of deps.manifest.artboards as Dynamic)
            !value264.frameless &&
              !callback62(value264, value260) &&
              current.left.add(value264.file);
          let value261: Dynamic =
              [...deps.manifest.artboards]
                .reverse()
                .find(
                  (input2?: Dynamic): Dynamic =>
                    !input2.frameless &&
                    input2.file !==
                      ("file" in value257 ? value257.file : "") &&
                    callback62(input2, value260),
                ) ?? null,
            value262: Dynamic =
              value261 && current.left.has(value261.file) ? value261 : null,
            value263: Dynamic = current.set[0]
              ? {
                  ...callback61(current.set[0]),
                  w: current.set[0].w,
                  h: current.set[0].h,
                }
              : ((): Dynamic => {
                  let value264: Dynamic = current.notes[0],
                    value265: Dynamic = deps.callback44(value264);
                  return {
                    ...callback61(value265),
                    w: value265.w,
                    h: value265.h,
                  };
                })();
          current.hoverKey ??= "obj-" + String(++canvasDragSequence);
          if (!options2)
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: value262?.file ?? null,
              point: value260,
              object: value257,
              at: value263,
              ctrl: input.ctrlKey,
            });
          else if (value262 && deps.onDropObjectInto) {
            deps.callback48(current.set, current.notes);
            if (
              deps.onDropObjectInto({
                key: current.hoverKey,
                target: value262.file,
                point: value260,
                object: value257,
                at: value263,
                ctrl: input.ctrlKey,
              })
            )
              return;
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: null,
              point: value260,
              object: value257,
              at: value263,
              ctrl: input.ctrlKey,
            });
          } else
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: null,
              point: value260,
              object: value257,
              at: value263,
              ctrl: input.ctrlKey,
            });
        }
      }
      let entries2: Dynamic = new Map(
          current.set.map(
            (input2?: Dynamic): Dynamic => [
              input2.file,
              preserveUnroundedDragPosition(
                input2,
                callback61(input2),
              ),
            ],
          ),
        ),
        entries3: Dynamic = new Map(
          current.notes.map(
            (input2?: Dynamic): Dynamic => [
              input2.id,
              preserveUnroundedDragPosition(
                input2,
                callback61(input2),
              ),
            ],
          ),
        );
      deps.onManifestChange(
        deps.callback43(entries2, entries3),
        options2,
        options2
          ? {
              moved: new Map(
                current.set.map(
                  (input2?: Dynamic): Dynamic => [
                    input2.file,
                    {
                      x: input2.x,
                      y: input2.y,
                    },
                  ],
                ),
              ),
              movedNotes: new Map(
                current.notes.map(
                  (input2?: Dynamic): Dynamic => [input2.id, input2],
                ),
              ),
              ...(current.bound !== undefined
                ? {
                    bound: current.bound,
                  }
                : {}),
            }
          : undefined,
      );
    }

export {
  canvasDragSequence,
  CanvasInteractionLayer,
  toggleArtboardDragCurtain,
};
export function installCanvasInteractionLayer(): () => void {
  return () => {
    canvasDragSequence = 0;
  };
}

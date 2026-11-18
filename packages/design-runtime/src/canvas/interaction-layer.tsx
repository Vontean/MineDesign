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
import { InspectorColorPickResolvedValue_2 as isDesktopMac } from "../editor/inspector/color-pick";
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
import { shortenLineEnd, SvgArrowsConstant, SvgArrowsConstant_2 as arrowHeadHalfHeight, SvgArrowsConstant_3 as arrowHeadTipInset, SvgArrowsCss } from "../editor/svg/arrows";
import { constrainLineAngle, SvgDrawingConstant } from "../editor/svg/drawing";
import { toolbarOverlayHeight, useTouchToolbar } from "../editor/toolbar/layout";
import { supportsClickPlacement } from "../editor/tools";
import { reactDomVectorToolState, reactVectorToolState_2 } from "../editor/vector/tool-state";
import { artboardExportMenuItems } from "../export/artboard-menu";
import { canvasSnapReferenceLines, canvasSnapReferenceObjects, preserveUnroundedDragPosition, snapCanvasDrag } from "../geometry/canvas-snapping";
import { annotationTransformSnapshot, artboardTransformSnapshot, rotateAnnotationAboutPoint, selectionScaleLimits, selectionTransformMembers, selectionUniformScaleTransform, transformAnnotationBounds, transformArtboardBounds, transformTouchedProperties, translatedSelectionTransform } from "../geometry/selection-transform";
import { annotationBounds, annotationRotation, annotationVisibleBounds, artboardRadiusCss, artboardStackOrder, isShapeAnnotation, moveAnnotation, PlatformFileContentConstant_20 as unusedNoteConstant, PlatformFileContentConstant_8 as defaultNoteWidth, replaceDesignArtboards, rotatedAnnotationBounds, updateAnnotationCrop, updateAnnotationCss, updateAnnotationTextStyle, updateShapeColor } from "../platform/file-content";
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
  let previewHandle: Dynamic = artboard
    ? createPreviewHandle(artboard.webviewRef.current)
    : null;
  previewHandle &&
    pickerHoverAt(
      previewHandle,
      enabled,
      templateIds,
      passthrough,
      (enabled && artboard?.textTids()) ?? [],
    );
}
function CanvasInteractionLayer(props?: Dynamic): Dynamic {
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
      keyboard: keyboardController,
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
    }: Dynamic = props,
    isNotArtboardPicking: Dynamic = !artboardPicking,
    entry: Dynamic = camera.get(),
    artboardHandlesRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    registerArtboardHandle: Dynamic = useLatestCallback(
      (file?: Dynamic, handle?: Dynamic, handleMeta?: Dynamic): Dynamic => {
        handle
          ? artboardHandlesRef.current.set(file, handle)
          : artboardHandlesRef.current.delete(file);
        onHandle(file, handle, handleMeta);
      },
    ),
    [commentsController, setCommentsController]: Dynamic = (0, reactVectorToolState_2.useState)(
      null,
    ),
    commentsControllerRef: Dynamic = (0, reactVectorToolState_2.useRef)(commentsController);
  commentsControllerRef.current = commentsController;
  let composeElementComment: Dynamic =
      commentsController && !crossFile && elementSelection?.tids?.length
        ? (...args: Dynamic[]): Dynamic => (composeSelectedElementComment as Dynamic)({ get callback16() { return clientToCanvasPoint; }, get camera() { return camera; }, get elementSelection() { return elementSelection; }, get manifest() { return manifest; }, get value2() { return artboardHandlesRef; }, get value20() { return focusedContentRect; }, get value4() { return commentsController; }, get value9() { return canvasRootRef; } }, ...args)
        : null,
    composeNoteComment: Dynamic = commentsController
      ? (noteId?: Dynamic, noteElement?: Dynamic): Dynamic => {
          noteElement.focus({
            preventScroll: true,
          });
          let noteAnchor: Dynamic = serializeDesignCommentAnchor({
              kind: "note",
              id: noteId,
            }),
            note: Dynamic = (manifest.annotations ?? []).find(
              (annotation?: Dynamic): Dynamic => annotation.id === noteId,
            ),
            bounds: Dynamic = noteElement.getBoundingClientRect();
          noteAnchor &&
            commentsController
              .compose(
                noteAnchor,
                {
                  x: bounds.left + (window as Dynamic).scrollX,
                  y: bounds.bottom + 48 + (window as Dynamic).scrollY,
                },
                {
                  label: commentAnchorShortLabel({
                    kind: "note",
                    note: note ?? {
                      text: "",
                    },
                  }),
                },
              )
              .catch((): Dynamic => {});
        }
      : null,
    canvasRootRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    [measuredNoteSizes, setMeasuredNoteSizes]: Dynamic = (0,
    reactVectorToolState_2.useState)({}),
    getAnnotationWidth: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (source?: Dynamic): Dynamic =>
        isShapeAnnotation(source)
          ? annotationBounds(source).w
          : source.kind === "title1"
            ? (measuredNoteSizes[source.id]?.w ??
              NotesLinkEditingKind(source))
            : source.w,
      [measuredNoteSizes],
    ),
    artboardOrderRef: Dynamic = (0, reactVectorToolState_2.useRef)([]),
    stackedArtboards: Dynamic = artboardStackOrder(
      artboardOrderRef.current,
      manifest.artboards,
    );
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    artboardOrderRef.current = stackedArtboards.map(
      (item?: Dynamic): Dynamic => item.spec.file,
    );
  });
  let entries: Dynamic = new Map(
      stackedArtboards
        .filter((item?: Dynamic): Dynamic => item.spec.frameless !== true)
        .map(
          (item?: Dynamic, index?: Dynamic): Dynamic => [
            item.spec.file,
            index,
          ],
        ),
    ),
    inspectorPosture: Dynamic = useInspectorPosture(),
    hasTouchToolbar: Dynamic = useTouchToolbar(),
    isInspectorSheet: Dynamic = inspectorPosture === "sheet" && !hasTouchToolbar,
    flag: Dynamic = false,
    canEditCanvas: Dynamic = editing && (fullscreenFile == null || flag),
    canEditCanvasRef: Dynamic = (0, reactVectorToolState_2.useRef)(canEditCanvas);
  canEditCanvasRef.current = canEditCanvas;
  let focusedContentRect: Dynamic = focusedArtboardContentRect(
      manifest.artboards,
      fullscreenFile,
      fullscreenBox,
      flag,
      tweakRows,
    ),
    isPhoneCanvas: Dynamic = phone && fullscreenFile == null,
    isCanvasInteractive: Dynamic =
      canEditCanvas || (!isPhoneCanvas && inspect && (fullscreenFile == null || flag)),
    isCanvasInteractiveRef: Dynamic = (0, reactVectorToolState_2.useRef)(isCanvasInteractive);
  isCanvasInteractiveRef.current = isCanvasInteractive;
  let shouldDelayArtboardMount: Dynamic = (artboard?: Dynamic): Dynamic =>
      isPhoneCanvas &&
      !flag &&
      shouldDelayPreviewMount(artboard, {
        editing: canEditCanvas,
        runsNothing: props.phoneCanvasRunsNothing === true,
      }),
    shouldDelayMountForFile: Dynamic = (file?: Dynamic): Dynamic => {
      let artboard: Dynamic =
        file == null
          ? undefined
          : manifest.artboards.find(
              (item?: Dynamic): Dynamic => item.file === file,
            );
      return artboard != null && shouldDelayArtboardMount(artboard);
    },
    overBudgetPreviewFile: Dynamic =
      isPhoneCanvas && !flag
        ? (limitMountedPreviewPixels(
            [...(livePins ?? [])],
            [canEditCanvas ? focusedFile : null, playingFile],
            manifest.artboards,
            props.phoneCanvasRunsNothing === true ? 0 : 15e5,
          ).find(
            (file?: Dynamic): Dynamic => livePins?.has(file) !== true,
          ) ?? null)
        : null,
    hoverCurtainRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    selectedTidsByFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      selectedTidsByFile,
    );
  selectedTidsByFileRef.current = selectedTidsByFile;
  let [isTouchPointer, setIsTouchPointer]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    coverPressRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    [hasPressedSinceSelection, setHasPressedSinceSelection]: Dynamic = (0,
    reactVectorToolState_2.useState)(false);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    setHasPressedSinceSelection(false);
  }, [selectedArtboards, selectedNotes, selectedTidsByFile]);
  let cancelHoverCurtain: Dynamic = (0,
    reactVectorToolState_2.useCallback)((): Dynamic => {
      let current: Dynamic = hoverCurtainRef.current;
      current &&
        (current.raf && cancelAnimationFrame(current.raf),
        (hoverCurtainRef.current = null),
        toggleArtboardDragCurtain(artboardHandlesRef.current.get(current.file), null));
    }, []),
    scheduleHoverCurtain: Dynamic = (file?: Dynamic, event?: Dynamic): Dynamic => {
      if (
        !canEditCanvas ||
        event.pointerType === "touch" ||
        event.buttons !== 0 ||
        (armedTool != null &&
          armedTool !== "select" &&
          armedTool !== "vector")
      ) {
        cancelHoverCurtain();
        return;
      }
      hoverCurtainRef.current && hoverCurtainRef.current.file !== file && cancelHoverCurtain();
      let hoverState: Dynamic = (hoverCurtainRef.current ??= {
        file: file,
        x: 0,
        y: 0,
        deep: false,
        raf: 0,
      });
      hoverState.x = event.nativeEvent.offsetX;
      hoverState.y = event.nativeEvent.offsetY;
      hoverState.deep = isPrimaryModifierEvent(event);
      setPrimaryModifierHeld(hoverState.deep);
      !hoverState.raf &&
        (hoverState.raf = requestAnimationFrame((): Dynamic => {
          hoverState.raf = 0;
          hoverCurtainRef.current === hoverState &&
            toggleArtboardDragCurtain(
              artboardHandlesRef.current.get(file),
              {
                x: hoverState.x,
                y: hoverState.y,
              },
              selectedTidsByFileRef.current?.[file],
              hoverState.deep,
            );
        }));
    };
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => cancelHoverCurtain,
    [focusedFile, armedTool, canEditCanvas, fullscreenFile, playingFile, cancelHoverCurtain],
  );
  let hoverFocusedFile: Dynamic =
    canEditCanvas &&
    !isTouchPointer &&
    (armedTool == null || armedTool === "select") &&
    fullscreenFile == null &&
    focusedFile != null &&
    selectedArtboards.has(focusedFile)
      ? focusedFile
      : null;
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = hoverCurtainRef.current;
    hoverFocusedFile == null &&
      current?.file === focusedFile &&
      (current.raf && cancelAnimationFrame(current.raf),
      (hoverCurtainRef.current = null));
  }, [hoverFocusedFile, focusedFile]);
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic =>
      subscribePrimaryModifierHeld(
        (isDeep?: Dynamic): Dynamic => {
          let current: Dynamic = hoverCurtainRef.current;
          current &&
            ((current.deep = isDeep),
            !current.raf &&
              toggleArtboardDragCurtain(
                artboardHandlesRef.current.get(current.file),
                {
                  x: current.x,
                  y: current.y,
                },
                selectedTidsByFileRef.current?.[current.file],
                isDeep,
              ));
        },
      ),
    [],
  );
  let cameraRef: Dynamic = (0, reactVectorToolState_2.useRef)(camera);
  cameraRef.current = camera;
  (0, reactVectorToolState_2.useLayoutEffect)(
    (): Dynamic => camera.paint(),
  );
  let usesCameraPortal: Dynamic = phone && !flag,
    [artboardsPortalHost, setArtboardsPortalHost]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    portalPlacementsRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    applyPortalTransform: Dynamic = (placement?: Dynamic): Dynamic => {
      let cameraState: Dynamic = camera.get();
      placement.el.style.transform =
        "translate(" +
        String((placement.x - cameraState.x) * cameraState.scale) +
        "px, " +
        String((placement.y - cameraState.y) * cameraState.scale) +
        "px) scale(" +
        String(cameraState.scale) +
        ")";
    },
    [artboardHeaderThemes, setArtboardHeaderThemes]: Dynamic = (0,
    reactVectorToolState_2.useState)((): Dynamic => new Map()),
    headerThemeRequestedRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    loadHeaderTheme: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => {
        let handle: Dynamic = artboardHandlesRef.current.get(file),
          fileContent: Dynamic = doc.content().files[file];
        !handle ||
          headerThemeRequestedRef.current.has(file) ||
          (typeof fileContent == "string" &&
            fileContent.length > quickActionImagePreviewMaxBytes) ||
          (headerThemeRequestedRef.current.add(file),
          handle.pageFill().then(
            (pageFillColor?: Dynamic): Dynamic => {
              let headerTheme: Dynamic = artboardHeaderTheme(
                pageFillColor,
              );
              setArtboardHeaderThemes(
                (themes?: Dynamic): Dynamic =>
                  themes.has(file) && themes.get(file)?.bg === headerTheme?.bg
                    ? themes
                    : new Map(themes).set(file, headerTheme),
              );
            },
            (): Dynamic => {},
          ));
      },
    ),
    [expandingFile, setExpandingFile]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    expandingSeenFullscreenRef: Dynamic = (0, reactVectorToolState_2.useRef)(false);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    if (expandingFile == null) return void (expandingSeenFullscreenRef.current = false);
    let clearExpandingFile: Dynamic = (): Dynamic =>
        setExpandingFile(
          (file?: Dynamic): Dynamic => (file === expandingFile ? null : file),
        ),
      isFullscreenTarget: Dynamic = fullscreenFile === expandingFile;
    if (!isFullscreenTarget && expandingSeenFullscreenRef.current) return clearExpandingFile();
    isFullscreenTarget && (expandingSeenFullscreenRef.current = true);
    let clearTimer: Dynamic = (window as Dynamic).setTimeout(
        clearExpandingFile,
        isFullscreenTarget ? 400 : 2e3,
      ),
      clearFrame: Dynamic = isFullscreenTarget
        ? requestAnimationFrame((): Dynamic => {
            (window as Dynamic).clearTimeout(clearTimer);
            clearTimer = (window as Dynamic).setTimeout(clearExpandingFile, 400);
          })
        : 0;
    return (): Dynamic => {
      (window as Dynamic).clearTimeout(clearTimer);
      clearFrame && cancelAnimationFrame(clearFrame);
    };
  }, [expandingFile, fullscreenFile]);
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic =>
      expandingFile == null
        ? undefined
        : preventTouchScroll(canvasRootRef.current),
    [expandingFile],
  );
  let [chromePortalHost, setChromePortalHost]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    transformTargetsRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    registerTransformTarget: Dynamic = (element?: Dynamic): Dynamic => {
      if (element) {
        transformTargetsRef.current.add(element);
        element.style.transform = viewportTransformCss(
          camera.get(),
        );
        return (): Dynamic => {
          transformTargetsRef.current.delete(element);
        };
      }
    },
    syncTransforms: Dynamic = useLatestCallback((): Dynamic => {
      portalPlacementsRef.current.forEach(applyPortalTransform);
      let transformCss: Dynamic = viewportTransformCss(camera.get());
      transformTargetsRef.current.forEach((element?: Dynamic): Dynamic => {
        element.style.transform = transformCss;
      });
    }),
    [objectsPortalHost, setObjectsPortalHost]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    annotationUnderCacheRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    isAnnotationUnder: Dynamic = (source?: Dynamic): Dynamic => {
      if (!usesCameraPortal || !isShapeAnnotation(source)) return false;
      let cachedUnder: Dynamic =
          activeGesturesRef.current.size > 0
            ? annotationUnderCacheRef.current.get(source.id)
            : undefined,
        hasFilter: Dynamic =
          (source.kind === "image" && source.video !== undefined) ||
          ("css" in source &&
            (source.css?.filter !== undefined ||
              source.css?.["backdrop-filter"] !== undefined)),
        annotationRect: Dynamic = annotationBounds(source),
        isUnder: Dynamic =
          cachedUnder ??
          (!hasFilter &&
            !selectedNotes.has(source.id) &&
            annotationRect.w * annotationRect.h > 5e5);
      annotationUnderCacheRef.current.set(source.id, isUnder);
      return isUnder;
    },
    [notesPortalHost, setNotesPortalHost]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    wrapInCameraPortal: Dynamic = (portalKey?: Dynamic, children?: Dynamic): Dynamic =>
      usesCameraPortal ? (
        <ConditionalPortal key={portalKey} on={true} to={notesPortalHost}>
          <div
            ref={registerTransformTarget}
            className={"absolute left-0 top-0 h-0 w-0"}
            style={{
              transformOrigin: "0 0",
            }}
          >
            {children}
          </div>
        </ConditionalPortal>
      ) : (
        children
      ),
    registerPortalPlacement: Dynamic =
      (file?: Dynamic, x?: Dynamic, y?: Dynamic): Dynamic =>
      (element?: Dynamic): Dynamic => {
        if (!element) return;
        let state: Dynamic = {
          el: element,
          x: x,
          y: y,
        };
        portalPlacementsRef.current.set(file, state);
        applyPortalTransform(state);
        return (): Dynamic => {
          portalPlacementsRef.current.delete(file);
        };
      };
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    usesCameraPortal && syncTransforms();
  });
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => (usesCameraPortal ? camera.subscribe(syncTransforms) : undefined),
    [camera, usesCameraPortal, syncTransforms],
  );
  let fullscreenFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    fullscreenFile,
  );
  fullscreenFileRef.current = fullscreenFile;
  let playingFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    playingFile,
  );
  playingFileRef.current = playingFile;
  let selectionRef: Dynamic = (0, reactVectorToolState_2.useRef)({
    files: selectedArtboards,
    notes: selectedNotes,
  });
  selectionRef.current = {
    files: selectedArtboards,
    notes: selectedNotes,
  };
  let mountedPreviewsRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      new Set(),
    ),
    singleSelectedNoteId: Dynamic =
      selectedNotes.size === 1 && selectedArtboards.size === 0
        ? [...selectedNotes][0]
        : null,
    selectArtboard: Dynamic = useLatestCallback(
      (file?: Dynamic, isToggle?: Dynamic): Dynamic =>
        onSelectObjects(
          boardSelectionItems({
            file: file,
          }),
          isToggle ? "toggle" : "replace",
        ),
    ),
    onSelectObjectsRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      onSelectObjects,
    );
  onSelectObjectsRef.current = onSelectObjects;
  let isTouchSelectionTarget: Dynamic = (event?: Dynamic): Dynamic => {
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
          let artboardFile: Dynamic = ancestor
            .closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          return isTouchSelectionStart(
            event.pointerType,
            artboardFile != null && selectionRef.current.files.has(artboardFile),
          );
        }
        case "annotation":
          return isTouchSelectionStart(
            event.pointerType,
            selectionRef.current.notes.has(
              ancestor.getAttribute("data-mega-annotation") ?? "",
            ),
          );
        default:
          return false;
      }
    },
    shouldPanFromTarget: Dynamic = (event?: Dynamic): Dynamic => {
      if (!(event.target instanceof Element)) return true;
      let ancestor: Dynamic = event.target.closest("[data-mega-chrome]");
      return ancestor == null
        ? true
        : ancestor.getAttribute("data-mega-chrome") === "comments"
          ? prefersDragGesture(event, !!commentsControllerRef.current?.areas)
          : !canEditCanvasRef.current &&
              ancestor.getAttribute("data-mega-chrome") === "annotation"
            ? true
            : isTouchSelectionTarget(event);
    },
    isHandToolActive: Dynamic = (): Dynamic =>
      armedToolRef.current === "hand" && !isCanvasInertRef.current,
    isContextMenuPointerEvent: Dynamic = (event?: Dynamic): Dynamic =>
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
    isPanPointerEvent: Dynamic = (event?: Dynamic): Dynamic =>
      event.button === 1 ||
      isContextMenuPointerEvent(event) ||
      (event.button === 0 &&
        isHandToolActive() &&
        event.target instanceof Element &&
        event.target.hasAttribute("data-mega-pan-blanket")),
    shouldStartMarquee: Dynamic = (event?: Dynamic): Dynamic =>
      shouldBeginCanvasMarquee({
        pointerType: event.pointerType,
        button: event.button,
        tool: armedToolRef.current,
        bare:
          event.target === canvasRootRef.current ||
          (event.target instanceof Element &&
            event.target.getAttribute("data-mega-chrome") === "set-box-pad"),
      }),
    isPlacementPointerEvent: Dynamic = (event?: Dynamic): Dynamic =>
      ((armedToolRef.current === "frame" ||
        armedToolRef.current === "note" ||
        supportsClickPlacement(armedToolRef.current)) &&
        (!(event.target instanceof Element) ||
          event.target.closest("[data-mega-chrome]") == null)) ||
      (armedToolRef.current === "draw" &&
        onAddPenRef.current != null &&
        event.target instanceof Element &&
        event.target.closest("[data-mega-chrome], [data-mega-artboard]") ==
          null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = canvasRootRef.current;
    if (!current) return;
    let panZoomBinding: Dynamic = installCanvasPanZoom_binding({
      element: current,
      getView: (): Dynamic => cameraRef.current.get(),
      setView: (view?: Dynamic): Dynamic => {
        fullscreenFileRef.current || cameraRef.current.set(view);
      },
      limits: viewportScaleLimits,
      panSecondaryButton: true,
      shouldPan: (event?: Dynamic): Dynamic =>
        fullscreenFileRef.current == null &&
        !activeGesturesRef.current.has("marquee") &&
        (event.button !== 2 || isContextMenuPointerEvent(event)) &&
        (claimSpacePan() ||
          isPanPointerEvent(event) ||
          (!isPlacementPointerEvent(event) && !shouldStartMarquee(event) && shouldPanFromTarget(event))),
      allowNativeScroll: (event?: Dynamic): Dynamic => {
        let scrollElement: Dynamic =
          event.target instanceof Element
            ? event.target.closest("[data-note-scroll]")
            : null;
        return !scrollElement ||
          Math.abs(event.deltaY) < Math.abs(event.deltaX) ||
          getComputedStyle(scrollElement).overflowY !== "auto"
          ? false
          : event.deltaY < 0
            ? scrollElement.scrollTop > 0
            : scrollElement.scrollTop + scrollElement.clientHeight <
              scrollElement.scrollHeight - 1;
      },
    });
    return (): Dynamic => panZoomBinding.destroy();
  }, []);
  let isWheelingRef: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    wheelStartRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    markWheelingRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      (): Dynamic => {},
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = canvasRootRef.current;
    if (!current) return;
    let wheelTimer: Dynamic = null,
      markWheeling: Dynamic = (): Dynamic => {
        isWheelingRef.current || (wheelStartRef.current = performance.now());
        isWheelingRef.current = true;
        wheelTimer != null && clearTimeout(wheelTimer);
        wheelTimer = setTimeout((): Dynamic => {
          wheelTimer = null;
          isWheelingRef.current = false;
          wheelStartRef.current = null;
        }, 280);
      };
    markWheelingRef.current = markWheeling;
    current.addEventListener("wheel", markWheeling, {
      capture: true,
      passive: true,
    });
    return (): Dynamic => {
      wheelTimer != null && clearTimeout(wheelTimer);
      current.removeEventListener("wheel", markWheeling, true);
    };
  }, []);
  let onPanZoomRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    onPanZoom,
  );
  onPanZoomRef.current = onPanZoom;
  let handlePanZoom: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (view?: Dynamic, change?: Dynamic): Dynamic => {
        let isHandled: Dynamic = onPanZoomRef.current?.(view, change) === true;
        isHandled &&
          (change.dx !== 0 ||
            change.dy !== 0 ||
            (change.pinch && change.dz !== 0)) &&
          markWheelingRef.current();
        return isHandled;
      },
      [],
    ),
    dragSessionRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    dragReleaseRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    [snapGuides, setSnapGuides]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [gapGuides, setGapGuides]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [dragPreviewItems, setDragPreviewItems]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [notePlacement, setNotePlacement]: Dynamic = (0,
    reactVectorToolState_2.useState)(null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    armedTool !== "note" && setNotePlacement(null);
  }, [armedTool]);
  let [pointerGhost, setPointerGhost]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    backgroundPressRef: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    [shapeDraft, setShapeDraft]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [frameDraft, setFrameDraft]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    onAddPenRef: Dynamic = (0, reactVectorToolState_2.useRef)(onAddPen);
  onAddPenRef.current = onAddPen;
  let armedToolRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    armedTool,
  );
  armedToolRef.current = armedTool;
  let [isMarqueeActive, setIsMarqueeActive]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    marqueeRectRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    marqueeElementRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    setMarqueeElement: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (element?: Dynamic): Dynamic => {
        marqueeElementRef.current = element;
        applyElementRectStyle(element, marqueeRectRef.current);
      },
      [],
    ),
    marqueeStateRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    clientToCanvasPoint: Dynamic = (
      clientX?: Dynamic,
      clientY?: Dynamic,
      rect?: Dynamic,
    ): Dynamic => {
      let cameraState: Dynamic = camera.get();
      return {
        x: cameraState.x + (clientX - rect.left) / cameraState.scale,
        y: cameraState.y + (clientY - rect.top) / cameraState.scale,
      };
    },
    waitPointerRelease: Dynamic = (...args: Dynamic[]): Dynamic => (waitPointerReleaseTravel as Dynamic)({ get value9() { return canvasRootRef; } }, ...args),
    pressArtboardCoverBound: Dynamic = (...args: Dynamic[]): Dynamic => (pressArtboardCover as Dynamic)({ get callback17() { return waitPointerRelease; }, get callback19() { return beginMarquee; }, get callback46() { return beginBoardDragBound; }, get callback53() { return beginElementMove; }, get onArmArtboard() { return onArmArtboard; }, get onCoverPick() { return onCoverPick; }, get onCoverPress() { return onCoverPress; }, get onElementPress() { return onElementPress; }, get onFocus() { return onFocus; }, get onPressIntent() { return onPressIntent; }, get onSelectObjects() { return onSelectObjects; }, get onSetMoveCommit() { return onSetMoveCommit; }, get pressIntentIs() { return pressIntentIs; }, get value2() { return artboardHandlesRef; }, get value222() { return setHeldCover; }, get value26() { return selectedTidsByFileRef; }, get value29() { return coverPressRef; }, get value57() { return selectionRef; }, get value60() { return selectArtboard; }, get value92() { return onMarqueeBeginRef; } }, ...args),
    onMarqueeBeginRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      onMarqueeBegin,
    );
  onMarqueeBeginRef.current = onMarqueeBegin;
  let beginMarquee: Dynamic = (...args: Dynamic[]): Dynamic => (beginCanvasMarquee as Dynamic)({ get callback16() { return clientToCanvasPoint; }, get value134() { return trackGesture; }, get value146() { return manifestRef; }, get value19() { return canEditCanvasRef; }, get value2() { return artboardHandlesRef; }, get value216() { return annotationBoxRef; }, get value34() { return cameraRef; }, get value57() { return selectionRef; }, get value61() { return onSelectObjectsRef; }, get value87() { return setIsMarqueeActive; }, get value88() { return marqueeRectRef; }, get value89() { return marqueeElementRef; }, get value9() { return canvasRootRef; }, get value91() { return marqueeStateRef; }, get value92() { return onMarqueeBeginRef; } }, ...args),
    handleDragEvent: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (file?: Dynamic, dragEvent?: Dynamic): Dynamic => {
        if (dragEvent.type === "drop") {
          let artboard: Dynamic = manifestRef.current.artboards.find(
              (item?: Dynamic): Dynamic => item.file === file,
            ),
            surfaceRect: Dynamic = canvasRootRef.current?.getBoundingClientRect();
          if (artboard && surfaceRect) {
            let cameraState: Dynamic = camera.get(),
              screenX: Dynamic =
                (artboard.x + dragEvent.x - cameraState.x) * cameraState.scale +
                surfaceRect.left,
              screenY: Dynamic =
                (artboard.y + dragEvent.y - cameraState.y) * cameraState.scale +
                surfaceRect.top;
            if (
              screenX < surfaceRect.left ||
              screenX > surfaceRect.right ||
              screenY < surfaceRect.top ||
              screenY > surfaceRect.bottom
            ) {
              onDragEvent?.(file, {
                type: "cancel",
                key: dragEvent.key,
              });
              return;
            }
          }
        }
        onDragEvent?.(file, dragEvent);
      },
      [onDragEvent, camera],
    ),
    onHostDragRef: Dynamic = (0, reactVectorToolState_2.useRef)(onHostDrag);
  onHostDragRef.current = onHostDrag;
  (0, reactVectorToolState_2.useEffect)((...args: Dynamic[]): Dynamic => (subscribeHostDragPointer as Dynamic)({ get callback16() { return clientToCanvasPoint; }, get streamDragFile() { return streamDragFile; }, get value9() { return canvasRootRef; }, get value94() { return onHostDragRef; } }, ...args), [streamDragFile]);
  let isEventInsideTarget: Dynamic = (event?: Dynamic): Dynamic =>
      event.target instanceof Node &&
      event.currentTarget.contains(event.target),
    {
      held: spaceHeld,
      heldRef: spaceHeldRef,
      claimPan: claimSpacePan,
    }: Dynamic = useSpacePanKeyboard(),
    [hoveredFile, setHoveredFile]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    titleHoverRef: Dynamic = (0, reactVectorToolState_2.useRef)(null);
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => (): Dynamic => titleHoverRef.current?.release(),
    [],
  );
  let trackTitleHover: Dynamic = (
      element?: Dynamic,
      file?: Dynamic,
    ): Dynamic => {
      titleHoverRef.current?.release();
      let stopTitleHover: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener(
            "pointermove",
            handleTitleHoverMove,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointerout",
            handleTitleHoverMove,
            true,
          );
          titleHoverRef.current = null;
        },
        handleTitleHoverMove: Dynamic = (event?: Dynamic): Dynamic => {
          let hoverTarget: Dynamic =
            event.type !== "pointerout"
              ? event.target
              : event.relatedTarget instanceof HTMLIFrameElement
                ? event.relatedTarget
                : null;
          (event.type === "pointerout"
            ? event.relatedTarget != null && hoverTarget == null
            : isAboveTitleRect(
                event.clientX,
                event.clientY,
                element.getBoundingClientRect(),
              )) ||
            (stopTitleHover(),
            setHoveredFile(
              hoverTarget instanceof Element
                ? (hoverTarget
                    .closest("[data-mega-artboard]")
                    ?.getAttribute("data-mega-artboard") ?? null)
                : null,
            ));
        };
      (window as Dynamic).addEventListener("pointermove", handleTitleHoverMove, true);
      (window as Dynamic).addEventListener("pointerout", handleTitleHoverMove, true);
      titleHoverRef.current = {
        el: element,
        file: file,
        release: stopTitleHover,
      };
    },
    isPointerAboveOtherTitle: Dynamic = (event?: Dynamic, file?: Dynamic): Dynamic => {
      let current: Dynamic = titleHoverRef.current;
      return (
        current != null &&
        current.file !== file &&
        isAboveTitleRect(
          event.clientX,
          event.clientY,
          current.el.getBoundingClientRect(),
        )
      );
    },
    [chromeSlots, setChromeSlots]: Dynamic = (0,
    reactVectorToolState_2.useState)(new Map()),
    chromeSlotRefs: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    getChromeSlotRef: Dynamic = (file?: Dynamic): Dynamic => {
      let slotRef: Dynamic = chromeSlotRefs.current.get(file);
      slotRef ||
        ((slotRef = (slot?: Dynamic): Dynamic =>
          setChromeSlots((slots?: Dynamic): Dynamic => {
            if ((slots.get(file) ?? null) === slot) return slots;
            let nextSlots: Dynamic = new Map(slots);
            slot ? nextSlots.set(file, slot) : nextSlots.delete(file);
            return nextSlots;
          })),
        chromeSlotRefs.current.set(file, slotRef));
      return slotRef;
    },
    [renamingFile, setRenamingFile]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    renameCancelledRef: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    startRename: Dynamic = (file?: Dynamic): Dynamic => {
      renameCancelledRef.current = false;
      setRenamingFile(file);
    };
  renameRef && (renameRef.current = startRename);
  let handleCanvasMenu: Dynamic = useLatestCallback(
      (menuTarget?: Dynamic, menuPoint?: Dynamic): Dynamic => {
        menuPoint.keyboard !== true &&
          (lastPointerRef.current = {
            x: menuPoint.x,
            y: menuPoint.y,
            inFrame: false,
          });
        onCanvasMenu?.(menuTarget, menuPoint);
      },
    ),
    [deferredContextClick]: Dynamic = (0, reactVectorToolState_2.useState)(
      (): Dynamic =>
        createDeferredPointerClick(
          (menuPoint?: Dynamic, menuTarget?: Dynamic): Dynamic =>
            handleCanvasMenu(menuTarget, menuPoint),
        ),
    ),
    scrimRightClickRef: Dynamic = (0, reactVectorToolState_2.useRef)(null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let recordScrimPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
      scrimRightClickRef.current =
        event.button === 2 &&
        event.target instanceof Element &&
        event.target.hasAttribute("data-mc-scrim")
          ? {
              x: event.clientX,
              y: event.clientY,
            }
          : null;
    };
    (window as Dynamic).addEventListener("pointerdown", recordScrimPointerDown, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener(
        "pointerdown",
        recordScrimPointerDown,
        true,
      );
  }, []);
  let [artboardPanel, setArtboardPanel]: Dynamic = (0,
  reactVectorToolState_2.useState)(null);
  artboardPanel &&
    !manifest.artboards.some(
      (artboard?: Dynamic): Dynamic => artboard.file === artboardPanel.file,
    ) &&
    setArtboardPanel(null);
  let [quickActionsState, setQuickActionsState]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [cropSession, setCropSession]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    cropSessionRef: Dynamic = (0, reactVectorToolState_2.useRef)(cropSession);
  cropSessionRef.current = cropSession;
  let activeCropElement: Dynamic = useActiveCropElement(),
    [, setRenderTick]: Dynamic = (0, reactVectorToolState_2.useState)(0),
    forceRender: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (): Dynamic => setRenderTick((count?: Dynamic): Dynamic => count + 1),
      [],
    ),
    findPictureElements: Dynamic = (noteId?: Dynamic): Dynamic => {
      let pictureBody: Dynamic = canvasRootRef.current?.querySelector(
          '[data-testid="mega-shape-body-' + noteId + '"]',
        ),
        pictureImage: Dynamic = pictureBody?.matches("img, video")
          ? pictureBody
          : pictureBody?.querySelector("img, video");
      return pictureBody &&
        pictureImage &&
        pictureImage.dataset.megaPicture === "" &&
        mediaNaturalDimensions(pictureImage)
        ? {
            img: pictureImage,
            body: pictureBody,
          }
        : null;
    },
    isCropFrameChanged: Dynamic = (session?: Dynamic): Dynamic =>
      session.local.x !== 0 ||
      session.local.y !== 0 ||
      session.local.w !== session.pad0.w ||
      session.local.h !== session.pad0.h,
    cropAnnotationFrame: Dynamic = (session?: Dynamic): Dynamic => {
      if (!isCropFrameChanged(session)) return null;
      let cropFrame: Dynamic = rotatedCropFrame(
        session.pad0,
        (session.rot * Math.PI) / 180,
        session.local,
      );
      return {
        x: cropFrame.x - session.edge.l,
        y: cropFrame.y - session.edge.t,
        w: cropFrame.w + session.edge.l + session.edge.r,
        h: cropFrame.h + session.edge.t + session.edge.b,
      };
    },
    beginImageCrop: Dynamic = (annotationId?: Dynamic): Dynamic => {
      if (!findPictureElements(annotationId)) return;
      let flipCheckAnnotation: Dynamic = (manifestRef.current.annotations ?? []).find(
        (item?: Dynamic): Dynamic => item.id === annotationId,
      );
      if (flipCheckAnnotation && imageFlipCss(flipCheckAnnotation))
        return void onSetMoveSay?.(CropDoesNotWorkWhileThisMessage);
      (0, reactDomVectorToolState.flushSync)(blurBeforeCrop);
      let imageAnnotation: Dynamic = (manifestRef.current.annotations ?? []).find(
          (item?: Dynamic): Dynamic => item.id === annotationId,
        ),
        picture: Dynamic = findPictureElements(annotationId);
      if (imageAnnotation?.kind !== "image" || !picture) return;
      let naturalSize: Dynamic = mediaNaturalDimensions(
          picture.img,
        ),
        edge: Dynamic = {
          l: picture.body.clientLeft,
          t: picture.body.clientTop,
          r:
            imageAnnotation.w - picture.body.clientLeft - picture.body.clientWidth,
          b:
            imageAnnotation.h - picture.body.clientTop - picture.body.clientHeight,
        },
        localFrame: Dynamic = {
          x: 0,
          y: 0,
          w: picture.body.clientWidth,
          h: picture.body.clientHeight,
        },
        imageStyle: Dynamic = getComputedStyle(picture.img),
        initialCrop: Dynamic =
          imageAnnotation.crop ??
          cropFromObjectStyles(localFrame, naturalSize, {
            fit: imageStyle.objectFit,
            pos: parseObjectPosition(imageStyle.objectPosition),
            box: null,
          });
      setCropSession({
        id: annotationId,
        src: imageAnnotation.src,
        natural: naturalSize,
        rot: annotationRotation(imageAnnotation),
        pad0: {
          x: imageAnnotation.x + edge.l,
          y: imageAnnotation.y + edge.t,
          w: localFrame.w,
          h: localFrame.h,
        },
        edge: edge,
        local: localFrame,
        live: initialCrop,
        before: initialCrop,
      });
    },
    finishImageCrop: Dynamic = useLatestCallback(
      (shouldCommit?: Dynamic): Dynamic => {
        let current: Dynamic = cropSessionRef.current;
        if (!current) return;
        cropSessionRef.current = null;
        setCropSession(null);
        let cropTarget: Dynamic = (manifestRef.current.annotations ?? []).find(
            (item?: Dynamic): Dynamic => item.id === current.id,
          ),
          normalizedCrop: Dynamic = normalizeCenteredImageCrop(
            current.local,
            current.natural,
            current.live,
          ),
          isFrameChanged: Dynamic = isCropFrameChanged(current);
        if (
          !shouldCommit ||
          cropTarget?.kind !== "image" ||
          cropTarget.src !== current.src ||
          (!isFrameChanged &&
            sameImageCrop(
              normalizedCrop,
              normalizeCenteredImageCrop(
                current.pad0,
                current.natural,
                current.before,
              ),
            ))
        )
          return;
        let { "object-position": objectPositionUnused, ...cssRest }: Dynamic =
            cropTarget.css ?? {},
          frameUpdate: Dynamic = cropAnnotationFrame(current);
        updateAnnotation(
          current.id,
          (source?: Dynamic): Dynamic =>
            source.kind === "image"
              ? updateAnnotationCrop(
                  {
                    ...updateAnnotationCss(source, {
                      ...cssRest,
                      "object-fit": "cover",
                    }),
                    ...frameUpdate,
                  },
                  normalizedCrop,
                )
              : source,
          true,
        );
        announce(
          normalizedCrop || isFrameChanged ? "Cropped." : uiMessage("canvas.interactionLayer.cropRemoved"),
        );
      },
    ),
    cropAnnotation: Dynamic = cropSession
      ? (manifest.annotations ?? []).find(
          (item?: Dynamic): Dynamic => item.id === cropSession.id,
        )
      : undefined,
    shouldCancelCrop: Dynamic =
      cropSession !== null &&
      (!canEditCanvas ||
        cropAnnotation?.kind !== "image" ||
        cropAnnotation.src !== cropSession.src),
    shouldCommitCrop: Dynamic =
      cropSession !== null &&
      (singleSelectedNoteId !== cropSession.id ||
        supportsClickPlacement(armedTool) ||
        armedTool === "draw" ||
        fullscreenFile != null);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    shouldCancelCrop ? finishImageCrop(false) : shouldCommitCrop && finishImageCrop(true);
  }, [shouldCancelCrop, shouldCommitCrop, finishImageCrop]);
  let [isGestureActive, setIsGestureActive]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    [isCanvasInert, setIsCanvasInert]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    isCanvasInertRef: Dynamic = (0, reactVectorToolState_2.useRef)(isCanvasInert);
  isCanvasInertRef.current = isCanvasInert;
  let isPanBlanketActive: Dynamic = spaceHeld || (armedTool === "hand" && !isCanvasInert),
    activeGesturesRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    isMouseDownRef: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    onHostGesturingRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      onHostGesturing,
    );
  onHostGesturingRef.current = onHostGesturing;
  let syncFramesInert: Dynamic = (): Dynamic => {
      let isGesturing: Dynamic = activeGesturesRef.current.size > 0 || isMouseDownRef.current;
      canvasRootRef.current?.toggleAttribute("data-mega-frames-inert", isGesturing);
      onHostGesturingRef.current?.(isGesturing);
    },
    gestureStartRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    trackGesture: Dynamic = useLatestCallback(
      (gestureKind?: Dynamic, isActive?: Dynamic): Dynamic => {
        let current: Dynamic = activeGesturesRef.current;
        isActive &&
          current.size === 0 &&
          (gestureStartRef.current = performance.now());
        isActive ? current.add(gestureKind) : current.delete(gestureKind);
        current.size === 0 && (gestureStartRef.current = null);
        setIsGestureActive(current.size > 0);
        syncFramesInert();
      },
    ),
    handleModifierKey: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (
        modifierEvent?: Dynamic,
        modifierKey?: Dynamic,
        isModifierHeld?: Dynamic,
        isFromFrame?: Dynamic,
      ): Dynamic => {
        activeGesturesRef.current.size > 0 ||
          (isFromFrame && !isModifierHeld && (document as Dynamic).hasFocus()) ||
          schedulePrimaryModifierHeld(isModifierHeld);
      },
      [],
    ),
    trackPointerGesture: Dynamic = (
      gestureKind?: Dynamic,
      buttonMask: Dynamic = 0,
    ): Dynamic => {
      let handleGestureMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
        buttonMask === 2 && deferredContextClick.move(moveEvent);
        moveEvent.pointerType !== "touch" &&
          (moveEvent.buttons & buttonMask) === 0 &&
          endGesture(moveEvent);
      };
      buttonMask === 2 && suppressNativeContextMenu(true);
      let endGesture: Dynamic = (endEvent?: Dynamic): Dynamic => {
        (window as Dynamic).removeEventListener("pointerup", endGesture);
        (window as Dynamic).removeEventListener("pointercancel", endGesture);
        buttonMask &&
          (window as Dynamic).removeEventListener("pointermove", handleGestureMove);
        buttonMask === 2 && suppressNativeContextMenu(false);
        buttonMask === 2 && deferredContextClick.end(endEvent.type !== "pointercancel");
        trackGesture(gestureKind, false);
        gestureKind === "pan" &&
          canvasRootRef.current?.removeAttribute("data-mega-grabbing");
        gestureKind === "frame-drag" && endBoardDragRef.current(endEvent.pointerId);
      };
      (window as Dynamic).addEventListener("pointerup", endGesture);
      (window as Dynamic).addEventListener("pointercancel", endGesture);
      buttonMask &&
        (window as Dynamic).addEventListener("pointermove", handleGestureMove);
    };
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let setMouseDown: Dynamic = (isDown?: Dynamic): Dynamic => {
        isMouseDownRef.current = isDown;
        syncFramesInert();
      },
      releaseMouse: Dynamic = (): Dynamic => setMouseDown(false),
      handleWindowPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
        event.pointerType === "mouse" &&
          event.button === 0 &&
          setMouseDown(true);
      },
      handleWindowBlur: Dynamic = (): Dynamic => {
        (document as Dynamic).hasFocus() || releaseMouse();
      };
    (window as Dynamic).addEventListener("pointerdown", handleWindowPointerDown, true);
    (window as Dynamic).addEventListener("pointerup", releaseMouse, true);
    (window as Dynamic).addEventListener("pointercancel", releaseMouse, true);
    (window as Dynamic).addEventListener("contextmenu", releaseMouse, true);
    (window as Dynamic).addEventListener("blur", handleWindowBlur);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener(
        "pointerdown",
        handleWindowPointerDown,
        true,
      );
      (window as Dynamic).removeEventListener("pointerup", releaseMouse, true);
      (window as Dynamic).removeEventListener(
        "pointercancel",
        releaseMouse,
        true,
      );
      (window as Dynamic).removeEventListener(
        "contextmenu",
        releaseMouse,
        true,
      );
      (window as Dynamic).removeEventListener("blur", handleWindowBlur);
    };
  }, []);
  let [isGestureStreaming, setIsGestureStreaming]: Dynamic = (0,
    reactVectorToolState_2.useState)(false),
    streamTimerRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    handleGestureStream: Dynamic = useLatestCallback(
      (file?: Dynamic, isStreaming?: Dynamic): Dynamic => {
        file === focusedFile &&
          (streamTimerRef.current != null && clearTimeout(streamTimerRef.current),
          (streamTimerRef.current = isStreaming
            ? setTimeout((): Dynamic => setIsGestureStreaming(false), 1e4)
            : null),
          setIsGestureStreaming(isStreaming));
      },
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    setIsGestureStreaming(false);
    streamTimerRef.current != null &&
      (clearTimeout(streamTimerRef.current), (streamTimerRef.current = null));
  }, [focusedFile]);
  let [textEditState, setTextEditState]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    handleTextEditState: Dynamic = useLatestCallback(
      (file?: Dynamic, editState?: Dynamic): Dynamic => {
        file === focusedFile && setTextEditState(editState);
      },
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    setTextEditState(null);
  }, [focusedFile]);
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    for (let stripElement of (canvasRootRef.current?.querySelectorAll(
      "[data-mega-selection-strip]",
    ) ?? []) as Dynamic)
      getSessionStripScrollRow(stripElement).scrollLeft = 0;
  }, [elementSelection?.identity, singleSelectedNoteId, textEditState != null, quickActionsState]);
  let hintId: Dynamic = (0, reactVectorToolState_2.useId)(),
    keyboardInsideFile: Dynamic = keyboardController?.inside ?? null,
    shouldYieldEscape: Dynamic = useLatestCallback(
      (): Dynamic =>
        (armedTool != null && armedTool !== "select") || isGestureStreaming,
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let suppressEscapeRepeat: Dynamic = (event?: Dynamic): Dynamic => {
      event.key !== "Escape" ||
        !event.repeat ||
        (event.target instanceof Element &&
          event.target.hasAttribute("data-mega-title-text") &&
          event.preventDefault());
    };
    (window as Dynamic).addEventListener("keydown", suppressEscapeRepeat, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", suppressEscapeRepeat, true);
  }, []);
  let manifestRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    manifest,
  );
  manifestRef.current = manifest;
  let frameSizesRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      new Map(),
    ),
    stableFrameSize: Dynamic = (spec?: Dynamic): Dynamic => {
      let cachedSize: Dynamic = frameSizesRef.current.get(spec.file);
      if (cachedSize && cachedSize.w === spec.w && cachedSize.h === spec.h)
        return cachedSize;
      let state: Dynamic = {
        w: spec.w,
        h: spec.h,
      };
      frameSizesRef.current.set(spec.file, state);
      return state;
    },
    lastPointerRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    pendingInsertRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    trackPointerOver: Dynamic = (event?: Dynamic): Dynamic => {
      let isFrameTarget: Dynamic =
          event.target instanceof Element &&
          event.target.tagName === "IFRAME",
        frameFile: Dynamic = isFrameTarget
          ? (event.target.closest("[data-mega-artboard]")?.dataset
              .megaArtboard ?? null)
          : null;
      pendingInsertRef.current = null;
      lastPointerRef.current =
        event.pointerType !== "touch" && isEventInsideTarget(event)
          ? {
              x: event.clientX,
              y: event.clientY,
              inFrame: isFrameTarget,
              frameFile: frameFile,
            }
          : null;
    },
    markPointerInFrame: Dynamic = (): Dynamic => {
      let current: Dynamic = lastPointerRef.current;
      current &&
        !current.inFrame &&
        (lastPointerRef.current = {
          ...current,
          inFrame: true,
          stale: true,
        });
      cancelHoverCurtain();
    },
    openTweaks: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => onOpenTweaks?.(file),
    ),
    toggleTweaks: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => onToggleTweaks?.(file),
    ),
    openFile: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => onOpenFile?.(file),
    ),
    notifyPreviewDropNotice: Dynamic = useLatestCallback(
      (file?: Dynamic, notice?: Dynamic): Dynamic =>
        onPreviewDropNotice(file, notice),
    ),
    expandArtboard: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => onExpandArtboard?.(file),
    ),
    showProblems: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => onShowProblems?.(file),
    ),
    expandArtboardBlurred: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => {
        isPhoneCanvas &&
          ((document as Dynamic).activeElement instanceof HTMLElement &&
            (document as Dynamic).activeElement.blur(),
          setExpandingFile(file));
        expandArtboard(file);
      },
    ),
    togglePlayArtboard: Dynamic = useLatestCallback(
      (file?: Dynamic): Dynamic => {
        playingFileRef.current !== file
          ? onPlayArtboard?.(file)
          : isCanvasInteractive
            ? onFocus(file)
            : onPlayArtboard?.(null);
      },
    ),
    handleArtboardActivate: Dynamic = useLatestCallback(
      (file?: Dynamic, isToggle?: Dynamic): Dynamic => {
        selectArtboard(file, isToggle);
        isCanvasInteractive &&
          !shouldDelayMountForFile(file) &&
          !isToggle &&
          !artboardPicking &&
          playingFileRef.current !== file &&
          onFocus(file);
      },
    ),
    quickPropsSeed: Dynamic = quickProps?.seed ?? null,
    quickPropsSeedKey: Dynamic = JSON.stringify(
      quickPropsSeed,
      (key?: Dynamic, replacerValue?: Dynamic): Dynamic =>
        typeof replacerValue == "function"
          ? undefined
          : replacerValue instanceof Set
            ? [...replacerValue].sort()
            : replacerValue instanceof Map
              ? [...replacerValue.entries()]
              : replacerValue,
    ),
    stableSeedRef: Dynamic = (0, reactVectorToolState_2.useRef)({
      key: quickPropsSeedKey,
      seed: quickPropsSeed,
    });
  stableSeedRef.current.key !== quickPropsSeedKey &&
    (stableSeedRef.current = {
      key: quickPropsSeedKey,
      seed: quickPropsSeed,
    });
  let seed: Dynamic = stableSeedRef.current.seed,
    openPropsPanel: Dynamic = useLatestCallback(
      (): Dynamic => actionsRef.current?.openProps(),
    ),
    applyQuickProps: Dynamic = useLatestCallback(
      (changes?: Dynamic, applyOptions?: Dynamic): Dynamic =>
        quickProps?.onApply(changes, applyOptions) ?? Promise.resolve(false),
    ),
    handleQuickGesture: Dynamic = useLatestCallback(
      (gesture?: Dynamic): Dynamic => quickProps?.onGesture(gesture),
    ),
    handleTextFormat: Dynamic = useLatestCallback(
      (format?: Dynamic): Dynamic => onTextFormat?.(format),
    ),
    editQuickText: Dynamic = useLatestCallback(
      (...args: Dynamic[]): Dynamic => quickProps?.onEditText?.(...args),
    ),
    replaceQuickImage: Dynamic = useLatestCallback(
      (...args: Dynamic[]): Dynamic =>
        quickProps?.onReplaceImage?.(...args),
    ),
    cropQuickImage: Dynamic = useLatestCallback(
      (): Dynamic => quickProps?.onCrop?.(),
    ),
    replaceQuickVideo: Dynamic = useLatestCallback(
      (): Dynamic => quickProps?.onReplaceVideo?.(),
    ),
    findQuickVideo: Dynamic = useLatestCallback(
      (): Dynamic => quickProps?.findVideo?.() ?? null,
    ),
    linkQuickElement: Dynamic = useLatestCallback(
      (...args: Dynamic[]): Dynamic => quickProps?.onElementLink?.(...args),
    ),
    composeElementCommentLatest: Dynamic = useLatestCallback(
      (...args: Dynamic[]): Dynamic => composeElementComment?.(...args),
    ),
    handleExportOpenChange: Dynamic = useLatestCallback(
      (file?: Dynamic, isOpen?: Dynamic): Dynamic =>
        setArtboardPanel(
          isOpen
            ? {
                file: file,
                open: true,
              }
            : (panel?: Dynamic): Dynamic =>
                panel && {
                  ...panel,
                  open: false,
                },
        ),
    ),
    handlePointerPresence: Dynamic = useLatestCallback(
      (file?: Dynamic, isPresent?: Dynamic): Dynamic => {
        isPresent && focusedFileRef.current === file && markPointerInFrame();
      },
    ),
    handlePointerAt: Dynamic = useLatestCallback(
      (file?: Dynamic, point?: Dynamic): Dynamic => {
        focusedFileRef.current === file &&
          (pendingInsertRef.current = {
            file: file,
            ...point,
          });
      },
    ),
    resolveInsertionPoint: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (...args: Dynamic[]): Dynamic => (resolvePointerInsertionPoint as Dynamic)({ get callback11() { return isHandToolActive; }, get callback16() { return clientToCanvasPoint; }, get value146() { return manifestRef; }, get value148() { return lastPointerRef; }, get value182() { return focusedFileRef; }, get value183() { return enteredFileRef; }, get value55() { return fullscreenFileRef; }, get value56() { return playingFileRef; }, get value9() { return canvasRootRef; }, get value96() { return spaceHeldRef; } }, ...args),
      [],
    ),
    getPastePoint: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (): Dynamic => resolveInsertionPoint("content"),
      [resolveInsertionPoint],
    ),
    getArtboardLandingPoint: Dynamic = (0,
    reactVectorToolState_2.useCallback)((): Dynamic => {
      let current: Dynamic = lastPointerRef.current,
        canvasRoot: Dynamic = canvasRootRef.current,
        focusedArtboardFile: Dynamic = focusedFileRef.current;
      if (
        !current ||
        !canvasRoot ||
        !isCanvasInteractiveRef.current ||
        fullscreenFileRef.current != null ||
        spaceHeldRef.current ||
        isHandToolActive()
      )
        return pointerCoordinates(resolveInsertionPoint("artboards"));
      let hitElement: Dynamic = current.inFrame
          ? null
          : (document as Dynamic).elementFromPoint(current.x, current.y),
        insertionPointer: Dynamic = resolveInsertionPointer(
          current,
          pendingInsertRef.current,
          focusedArtboardFile,
          hitElement?.tagName === "IFRAME" &&
            hitElement.closest("[data-mega-artboard]")?.dataset.megaArtboard ===
              focusedArtboardFile,
        ),
        targetArtboard: Dynamic =
          insertionPointer &&
          manifestRef.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === focusedArtboardFile,
          );
      if (!insertionPointer || !targetArtboard)
        return pointerCoordinates(resolveInsertionPoint("artboards"));
      let bounds: Dynamic = canvasRoot.getBoundingClientRect(),
        cameraState: Dynamic = camera.get(),
        clampToViewport: Dynamic = (pointer?: Dynamic): Dynamic => {
          let clampedPoint: Dynamic = clampPointToRect(
              clientToCanvasPoint(pointer.x, pointer.y, bounds),
              targetArtboard,
            ),
            [items, screenY]: Dynamic = [
              bounds.left + (clampedPoint.x - cameraState.x) * cameraState.scale,
              bounds.top + (clampedPoint.y - cameraState.y) * cameraState.scale,
            ];
          return items < bounds.left ||
            items > bounds.right ||
            screenY < bounds.top ||
            screenY > bounds.bottom
            ? null
            : clampedPoint;
        };
      return (
        clampToViewport(insertionPointer) ??
        (insertionPointer === current ? null : clampToViewport(current))
      );
    }, [resolveInsertionPoint]);
  props.pastePointRef && (props.pastePointRef.current = getPastePoint);
  props.artboardLandingRef &&
    (props.artboardLandingRef.current = getArtboardLandingPoint);
  let pasteImages: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (...args: Dynamic[]): Dynamic => (placePastedImagesOnCanvas as Dynamic)({ get camera() { return camera; }, get onImageDrop() { return onImageDrop; }, get value146() { return manifestRef; }, get value177() { return getPastePoint; }, get value55() { return fullscreenFileRef; }, get value57() { return selectionRef; }, get value9() { return canvasRootRef; } }, ...args),
      [onImageDrop, getPastePoint, camera],
    ),
    dropVideos: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (file?: Dynamic, videos?: Dynamic, dropContext?: Dynamic): Dynamic => {
        let artboard: Dynamic = manifestRef.current.artboards.find(
          (item?: Dynamic): Dynamic => item.file === file,
        );
        if (!onImageDrop || !artboard) return;
        let surfaceRect: Dynamic = canvasRootRef.current?.getBoundingClientRect(),
          dropPoint: Dynamic = dropContext.at
            ? {
                x: artboard.x + dropContext.at.x,
                y: artboard.y + dropContext.at.y,
              }
            : visibleArtboardCenter(
                artboard,
                fullscreenFileRef.current == null && surfaceRect
                  ? {
                      ...camera.get(),
                      width: surfaceRect.width,
                      height: surfaceRect.height,
                    }
                  : null,
              );
        onImageDrop(
          videos,
          dropPoint.x,
          dropPoint.y,
          dropContext.verb,
          artboard.file,
          dropContext.at ?? undefined,
          dropContext.after,
        );
      },
      [onImageDrop, camera],
    ),
    resolvePreviewUrl: Dynamic = (0, reactVectorToolState_2.useCallback)(
      (source?: Dynamic): Dynamic =>
        resolveImagePreviewUrl(source, doc.content().files),
      [doc],
    ),
    updateAnnotation: Dynamic = (
      annotationId?: Dynamic,
      updater?: Dynamic,
      updateMeta?: Dynamic,
    ): Dynamic => {
      let current: Dynamic = manifestRef.current;
      onManifestChange(
        {
          ...current,
          annotations: (current.annotations ?? []).map(
            (annotation?: Dynamic): Dynamic =>
              annotation.id === annotationId ? updater(annotation) : annotation,
          ),
        },
        updateMeta,
      );
    },
    focusedFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      focusedFile,
    );
  focusedFileRef.current = focusedFile;
  let enteredFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    enteredFile,
  );
  enteredFileRef.current = enteredFile;
  let livePinsRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    livePins,
  );
  livePinsRef.current = livePins;
  let inUseFilesRef: Dynamic = (0, reactVectorToolState_2.useRef)(
    inUseFiles,
  );
  inUseFilesRef.current = inUseFiles;
  let recentPreviewsRef: Dynamic = (0, reactVectorToolState_2.useRef)([]),
    [maxInteractivePreviewCount]: Dynamic = (0, reactVectorToolState_2.useState)(
      maxInteractivePreviews,
    ),
    [maxMountedPreviewCount]: Dynamic = (0, reactVectorToolState_2.useState)(
      maxMountedPreviews,
    ),
    [linkedArtboards, setLinkedArtboards]: Dynamic = (0,
    reactVectorToolState_2.useState)(
      (): Dynamic => getLinkedArtboards(doc.content().files),
    ),
    pendingContentRef: Dynamic = (0, reactVectorToolState_2.useRef)({}),
    linkedRefreshTimerRef: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    scheduleLinkedRefresh: Dynamic = (): Dynamic => {
      clearTimeout(linkedRefreshTimerRef.current);
      linkedRefreshTimerRef.current = setTimeout((): Dynamic => {
        linkedRefreshTimerRef.current = undefined;
        let nextLinked: Dynamic = getLinkedArtboards({
          ...doc.content().files,
          ...pendingContentRef.current,
        });
        setLinkedArtboards(
          (current?: Dynamic): Dynamic =>
            samePreviewFiles(current, nextLinked) ? current : nextLinked,
        );
      }, 150);
    };
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    pendingContentRef.current = {};
    scheduleLinkedRefresh();
    let unsubscribeDoc: Dynamic = doc.subscribe((): Dynamic => {
      pendingContentRef.current = {};
      headerThemeRequestedRef.current.clear();
      scheduleLinkedRefresh();
    });
    return (): Dynamic => {
      unsubscribeDoc();
      clearTimeout(linkedRefreshTimerRef.current);
      linkedRefreshTimerRef.current = undefined;
    };
  }, [doc]);
  npm_useEventListener_bc(
    "dc-update",
    (event?: Dynamic): Dynamic => {
      let componentFile: Dynamic = resolveComponentFile(
        doc.content().files,
        event.detail,
      );
      componentFile != null &&
        ((pendingContentRef.current[componentFile] = event.detail.content), scheduleLinkedRefresh());
    },
  );
  let outlineWithComponents: Dynamic = (0, reactVectorToolState_2.useMemo)(
      (): Dynamic =>
        outlineArtboards
          ? {
              ...outlineArtboards,
              components: linkedArtboards,
            }
          : null,
      [outlineArtboards, linkedArtboards],
    ),
    touchRecentPreview: Dynamic = (file?: Dynamic): Dynamic => {
      let others: Dynamic = recentPreviewsRef.current.filter(
        (item?: Dynamic): Dynamic => item !== file,
      );
      others.unshift(file);
      recentPreviewsRef.current = others.slice(0, maxMountedPreviewCount);
    },
    mountedFilesRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Set()),
    previewVisibleTimesRef: Dynamic = (0, reactVectorToolState_2.useRef)(new Map()),
    cachedViewRectRef: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    previewScaleRef: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    expiryTimerRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    getViewRect: Dynamic = (): Dynamic => {
      let cameraState: Dynamic = cameraRef.current.get(),
        current: Dynamic = canvasRootRef.current,
        viewWidth: Dynamic = current?.clientWidth || 1200,
        viewHeight: Dynamic = current?.clientHeight || 800,
        toolbarHeight: Dynamic = current
          ? toolbarOverlayHeight(current)
          : 0;
      return {
        x: cameraState.x,
        y: cameraState.y + toolbarHeight / cameraState.scale,
        w: viewWidth / cameraState.scale,
        h: (viewHeight - toolbarHeight) / cameraState.scale,
      };
    };
  (0, reactVectorToolState_2.useLayoutEffect)(
    (): Dynamic => (
      artboardBootScheduler.configure({
        busySince: (): Dynamic => {
          let current: Dynamic = wheelStartRef.current,
            gestureStart: Dynamic = gestureStartRef.current;
          return current == null
            ? gestureStart
            : gestureStart == null
              ? current
              : Math.min(current, gestureStart);
        },
        rank: (file?: Dynamic): Dynamic => {
          if (
            (phone && !flag && fullscreenFileRef.current == null
              ? canEditCanvasRef.current && file === focusedFileRef.current
              : file === focusedFileRef.current ||
                file === recentPreviewsRef.current[0]) ||
            file === fullscreenFileRef.current ||
            file === playingFileRef.current ||
            livePinsRef.current?.has(file)
          )
            return -1;
          let artboard: Dynamic = manifestRef.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          );
          return artboard
            ? previewMountPriority(artboard, getViewRect())
            : 1 / 0;
        },
      }),
      (): Dynamic => artboardBootScheduler.configure(null)
    ),
    [],
  );
  let previewPickStateRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    hasFullscreenedRef: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    pickMountedPreviews: Dynamic = (...args: Dynamic[]): Dynamic => (pickMountedArtboardPreviews as Dynamic)({ get callback37() { return getViewRect; }, get options() { return props; }, get phone() { return phone; }, get value130() { return activeGesturesRef; }, get value146() { return manifestRef; }, get value182() { return focusedFileRef; }, get value184() { return livePinsRef; }, get value185() { return inUseFilesRef; }, get value186() { return recentPreviewsRef; }, get value187() { return maxInteractivePreviewCount; }, get value188() { return maxMountedPreviewCount; }, get value19() { return canEditCanvasRef; }, get value194() { return mountedFilesRef; }, get value195() { return previewVisibleTimesRef; }, get value196() { return cachedViewRectRef; }, get value197() { return previewScaleRef; }, get value199() { return previewPickStateRef; }, get value200() { return hasFullscreenedRef; }, get value34() { return cameraRef; }, get value35() { return usesCameraPortal; }, get value55() { return fullscreenFileRef; }, get value56() { return playingFileRef; }, get value57() { return selectionRef; }, get value58() { return mountedPreviewsRef; }, get value62() { return isWheelingRef; }, get value9() { return canvasRootRef; } }, ...args),
    isViewUnsettledRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      usesCameraPortal && props.viewSettled === false,
    ),
    [mountedFiles, setMountedFiles]: Dynamic = (0,
    reactVectorToolState_2.useState)(
      (): Dynamic => (isViewUnsettledRef.current ? new Set() : pickMountedPreviews()),
    );
  mountedFilesRef.current = mountedFiles;
  let refreshMountedPreviews: Dynamic = (): Dynamic => {
      if (isViewUnsettledRef.current) return;
      let current: Dynamic = fullscreenFileRef.current;
      current != null && (hasFullscreenedRef.current = true);
      if (
        current != null &&
        mountedFilesRef.current.has(current) &&
        [...(livePinsRef.current ?? [])].every(
          (file?: Dynamic): Dynamic => mountedFilesRef.current.has(file),
        )
      )
        return;
      let now: Dynamic = performance.now(),
        nextMounted: Dynamic = pickMountedPreviews(now);
      samePreviewFiles(nextMounted, mountedFilesRef.current) ||
        setMountedFiles(nextMounted);
      expiryTimerRef.current != null && clearTimeout(expiryTimerRef.current);
      let expiryTime: Dynamic =
        maxMountedPreviewCount > maxInteractivePreviewCount && fullscreenFileRef.current == null
          ? nextPreviewExpiry(
              nextMounted,
              manifestRef.current.artboards,
              cachedViewRectRef.current ?? getViewRect(),
              previewVisibleTimesRef.current,
              now,
            )
          : null;
      expiryTimerRef.current =
        expiryTime == null
          ? null
          : setTimeout(scheduleRefresh, expiryTime - now + 50);
    },
    prevLivePinsRef: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    prevFocusedFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(undefined),
    prevPlayingFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    prevFullscreenFileRef: Dynamic = (0, reactVectorToolState_2.useRef)(undefined);
  (0, reactVectorToolState_2.useLayoutEffect)((): Dynamic => {
    prevFullscreenFileRef.current !== fullscreenFile &&
      (usesCameraPortal && fullscreenFile != null && touchRecentPreview(fullscreenFile),
      (prevFullscreenFileRef.current = fullscreenFile));
    prevFocusedFileRef.current !== focusedFile &&
      ((!usesCameraPortal || canEditCanvas) &&
        prevFocusedFileRef.current != null &&
        touchRecentPreview(prevFocusedFileRef.current),
      (!usesCameraPortal || canEditCanvas) && focusedFile != null && touchRecentPreview(focusedFile),
      (prevFocusedFileRef.current = focusedFile));
    prevPlayingFileRef.current !== playingFile &&
      (prevPlayingFileRef.current != null && touchRecentPreview(prevPlayingFileRef.current),
      playingFile != null && touchRecentPreview(playingFile),
      (prevPlayingFileRef.current = playingFile));
    let isMarqueeGesture: Dynamic = activeGesturesRef.current.has("marquee");
    if (!isMarqueeGesture) {
      for (let file of selectedArtboards as Dynamic)
        (!usesCameraPortal || canEditCanvas) &&
          !mountedPreviewsRef.current.has(file) &&
          touchRecentPreview(file);
      mountedPreviewsRef.current = selectedArtboards;
    }
    for (let file of (livePins ?? []) as Dynamic)
      prevLivePinsRef.current?.has(file) || touchRecentPreview(file);
    prevLivePinsRef.current = livePins;
    props.viewSettled !== false && (isViewUnsettledRef.current = false);
    isMarqueeGesture ? scheduleRefresh() : refreshMountedPreviews();
    for (let file of (isPhoneCanvas
      ? [canEditCanvas ? focusedFile : null, playingFile, ...(livePins ?? [])]
      : [
          focusedFile,
          fullscreenFile,
          playingFile,
          recentPreviewsRef.current[0],
          ...(livePins ?? []),
        ]) as Dynamic)
      artboardBootScheduler.expedite(file);
  }, [
    selectedArtboards,
    manifest.artboards,
    focusedFile,
    fullscreenFile,
    playingFile,
    livePins,
    inUseFiles,
    isMarqueeActive,
    usesCameraPortal ? props.viewSettled : undefined,
    usesCameraPortal ? canEditCanvas : undefined,
  ]);
  let hasArtboards: Dynamic = manifest.artboards.length > 0,
    flushUnsettledMount: Dynamic = useLatestCallback((): Dynamic => {
      isViewUnsettledRef.current && ((isViewUnsettledRef.current = false), refreshMountedPreviews());
    });
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    if (!isViewUnsettledRef.current || !hasArtboards) return;
    let flushTimer: Dynamic = setTimeout(flushUnsettledMount, 1e3);
    return (): Dynamic => clearTimeout(flushTimer);
  }, [hasArtboards, flushUnsettledMount]);
  let refreshTimerRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    refreshStartRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    busyStartRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    runScheduledRefresh: Dynamic = (): Dynamic => {
      refreshTimerRef.current = null;
      if (
        (isWheelingRef.current || activeGesturesRef.current.size > 0) &&
        ((busyStartRef.current ??= Date.now()),
        Date.now() - busyStartRef.current < canvasLongPressDelayMs)
      ) {
        refreshStartRef.current = null;
        refreshTimerRef.current = setTimeout(runScheduledRefresh, 120);
        return;
      }
      busyStartRef.current = null;
      refreshStartRef.current = null;
      refreshMountedPreviews();
    },
    scheduleRefresh: Dynamic = (): Dynamic => {
      let now: Dynamic = Date.now();
      refreshTimerRef.current != null && clearTimeout(refreshTimerRef.current);
      refreshStartRef.current ??= now;
      let waited: Dynamic = now - refreshStartRef.current;
      refreshTimerRef.current = setTimeout(
        runScheduledRefresh,
        Math.max(
          0,
          Math.min(
            canvasDragActivationDelayMs,
            canvasTouchDragActivationDelayMs - waited,
          ),
        ),
      );
    };
  (0, reactVectorToolState_2.useEffect)(
    (): Dynamic => (
      scheduleRefresh(),
      camera.subscribe((): Dynamic => {
        scheduleRefresh();
        marqueeStateRef.current?.();
      })
    ),
    [camera],
  );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let current: Dynamic = canvasRootRef.current,
      resizeObserver: Dynamic =
        current && typeof ResizeObserver !== "undefined"
          ? new ResizeObserver((): Dynamic => scheduleRefresh())
          : null;
    current && resizeObserver?.observe(current);
    return (): Dynamic => {
      resizeObserver?.disconnect();
      refreshTimerRef.current != null && clearTimeout(refreshTimerRef.current);
      expiryTimerRef.current != null && clearTimeout(expiryTimerRef.current);
    };
  }, []);
  let [blockedFiles, setBlockedFiles]: Dynamic = (0,
    reactVectorToolState_2.useState)((): Dynamic => new Set()),
    handleBlockedChange: Dynamic = useLatestCallback(
      (file?: Dynamic, isBlocked?: Dynamic): Dynamic => {
        setBlockedFiles((files?: Dynamic): Dynamic => {
          if (files.has(file) === isBlocked) return files;
          let values: Dynamic = new Set(files);
          isBlocked ? values.add(file) : values.delete(file);
          return values;
        });
      },
    ),
    activateArtboardPreview: Dynamic = (file?: Dynamic, isToggle?: Dynamic): Dynamic => {
      if (shouldDelayMountForFile(file)) return expandArtboardBlurred(file);
      touchRecentPreview(file);
      refreshMountedPreviews();
      artboardBootScheduler.expedite(file);
      canEditCanvas || selectArtboard(file, isToggle);
    },
    manifestWithDragPositions: Dynamic = (artboardPositions?: Dynamic, notePositions?: Dynamic): Dynamic => ({
      ...replaceDesignArtboards(
        manifest,
        manifest.artboards.map((artboard?: Dynamic): Dynamic => {
          let position: Dynamic = artboardPositions.get(artboard.file);
          return position
            ? {
                ...artboard,
                x: position.x,
                y: position.y,
              }
            : artboard;
        }),
      ),
      ...(notePositions.size > 0
        ? {
            annotations: (manifest.annotations ?? []).map(
              (annotation?: Dynamic): Dynamic => {
                let position: Dynamic = notePositions.get(annotation.id);
                return position
                  ? moveAnnotation(annotation, position.x, position.y)
                  : annotation;
              },
            ),
          }
        : {}),
    }),
    getAnnotationBox: Dynamic = (annotation?: Dynamic): Dynamic =>
      isShapeAnnotation(annotation)
        ? annotationBounds(annotation)
        : {
            x: annotation.x,
            y: annotation.y,
            w: getAnnotationWidth(annotation),
            h:
              measuredNoteSizes[annotation.id]?.h ??
              annotationVisibleBounds(annotation).h,
          },
    annotationBoxRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      getAnnotationBox,
    );
  annotationBoxRef.current = getAnnotationBox;
  let buildSnapReferenceLines: Dynamic = (selection?: Dynamic): Dynamic =>
      canvasSnapReferenceLines(
        manifest.artboards,
        (manifest.annotations ?? []).map(
          (annotation?: Dynamic): Dynamic => ({
            id: annotation.id,
            ...rotatedAnnotationBounds(
              annotation,
              annotationBoxRef.current(annotation),
            ),
          }),
        ),
        {
          files: new Set(selection.files ?? []),
          notes: new Set(selection.notes ?? []),
        },
        false,
      ),
    beginBoardDragBound: Dynamic = (...args: Dynamic[]): Dynamic => (beginBoardDrag as Dynamic)({ get callback30() { return trackPointerGesture; }, get callback47() { return endBoardDrag; }, get manifest() { return manifest; }, get onDuplicateObjects() { return onDuplicateObjects; }, get value134() { return trackGesture; }, get value216() { return annotationBoxRef; }, get value218() { return endBoardDragRef; }, get value219() { return updateBoardDragRef; }, get value67() { return dragSessionRef; } }, ...args),
    endBoardDrag: Dynamic = (pointerId?: Dynamic): Dynamic => {
      let current: Dynamic = dragSessionRef.current;
      !current ||
        pointerId !== current.pointerId ||
        ((dragSessionRef.current = null),
        current.unlisten(),
        (dragReleaseRef.current = null),
        trackGesture("frame-drag", false),
        setSnapGuides(null),
        setGapGuides(null),
        current.alt
          ? setDragPreviewItems(null)
          : current.live && applyDragPositions(current.set, current.notes),
        current.hoverKey &&
          onObjectHoverRef.current?.({
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
    onObjectHoverRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      onObjectHover,
    );
  onObjectHoverRef.current = onObjectHover;
  let applyDragPositions: Dynamic = (
      filePositions?: Dynamic,
      notePositionList?: Dynamic,
    ): Dynamic => {
      let artboardPositions: Dynamic = new Map(
          filePositions.map((item?: Dynamic): Dynamic => [item.file, item]),
        ),
        notePositions: Dynamic = new Map(
          notePositionList.map((item?: Dynamic): Dynamic => [item.id, item]),
        );
      onManifestChange(manifestWithDragPositions(artboardPositions, notePositions), false);
    },
    endBoardDragRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      endBoardDrag,
    );
  endBoardDragRef.current = endBoardDrag;
  let endBoardDragForEvent: Dynamic = (event?: Dynamic): Dynamic =>
    endBoardDrag(event.pointerId);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    !canEditCanvas &&
      dragSessionRef.current &&
      endBoardDragRef.current(dragSessionRef.current.pointerId);
  }, [canEditCanvas]);
  let updateBoardDragBound: Dynamic = (...args: Dynamic[]): Dynamic => (updateBoardDrag as Dynamic)({ get callback16() { return clientToCanvasPoint; }, get callback43() { return manifestWithDragPositions; }, get callback44() { return getAnnotationBox; }, get callback48() { return applyDragPositions; }, get camera() { return camera; }, get manifest() { return manifest; }, get onDropObjectInto() { return onDropObjectInto; }, get onDuplicateObjects() { return onDuplicateObjects; }, get onFocus() { return onFocus; }, get onManifestChange() { return onManifestChange; }, get onObjectHover() { return onObjectHover; }, get onSelectObjects() { return onSelectObjects; }, get value134() { return trackGesture; }, get value18() { return canEditCanvas; }, get value67() { return dragSessionRef; }, get value70() { return setSnapGuides; }, get value72() { return setGapGuides; }, get value74() { return setDragPreviewItems; }, get value9() { return canvasRootRef; } }, ...args),
    updateBoardDragRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      updateBoardDragBound,
    );
  updateBoardDragRef.current = updateBoardDragBound;
  let beginHandedOffBoardDragBound: Dynamic = (...args: Dynamic[]): Dynamic => (beginHandedOffBoardDrag as Dynamic)({ get value146() { return manifestRef; }, get value218() { return endBoardDragRef; }, get value67() { return dragSessionRef; } }, ...args),
    updateSetMoveDrag: Dynamic = (
      setMove?: Dynamic,
      pointerId?: Dynamic,
      clientX?: Dynamic,
      clientY?: Dynamic,
      metaKey?: Dynamic,
      moveDetail?: Dynamic,
      bound?: Dynamic,
      altKey: Dynamic = false,
    ): Dynamic => {
      let current: Dynamic = dragSessionRef.current;
      return !current ||
        current.pointerId !== pointerId ||
        current.setMove !== setMove
        ? false
        : (bound !== undefined && (current.bound = bound),
          updateBoardDragRef.current(
            {
              pointerId: pointerId,
              clientX: clientX,
              clientY: clientY,
              altKey: altKey,
              metaKey: metaKey,
              ctrlKey: false,
              pointerType: "mouse",
              fromSetMove: true,
            },
            moveDetail,
          ),
          true);
    },
    onSetMoveCommitRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      onSetMoveCommit,
    );
  onSetMoveCommitRef.current = onSetMoveCommit;
  let [heldCover, setHeldCover]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    onSetMoveSayRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      onSetMoveSay,
    );
  onSetMoveSayRef.current = onSetMoveSay;
  let [setMoveGhost, setSetMoveGhost]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    elementMoveSessionsRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    setMovePiecesRef: Dynamic = (0, reactVectorToolState_2.useRef)(
      setMovePieces,
    );
  setMovePiecesRef.current = setMovePieces;
  elementMoveSessionsRef.current ??= createElementMoveSessions({
    handle: (file?: Dynamic): Dynamic => artboardHandlesRef.current.get(file),
    targetAt: (clientX?: Dynamic, clientY?: Dynamic): Dynamic => {
      let rootRect: Dynamic = canvasRootRef.current?.getBoundingClientRect();
      if (!rootRect || fullscreenFileRef.current != null) return null;
      let canvasPoint: Dynamic = clientToCanvasPoint(clientX, clientY, rootRect),
        files: Dynamic = selectionRef.current.files,
        artboards: Dynamic = manifestRef.current.artboards;
      for (
        let index: Dynamic = artboards.length - 1;
        index >= 0;
        index--
      ) {
        let artboard: Dynamic = artboards[index];
        if (
          canvasPoint.x < artboard.x ||
          canvasPoint.y < artboard.y ||
          canvasPoint.x > artboard.x + artboard.w ||
          canvasPoint.y > artboard.y + artboard.h
        )
          continue;
        if (files.has(artboard.file)) return null;
        if (artboard.frameless && enteredFileRef.current !== artboard.file)
          continue;
        let state: Dynamic = {
          x: canvasPoint.x - artboard.x,
          y: canvasPoint.y - artboard.y,
        };
        return artboard.file === playingFileRef.current
          ? {
              file: artboard.file,
              local: state,
              blocked: "playing",
            }
          : {
              file: artboard.file,
              local: state,
            };
      }
      return null;
    },
    showGhost: (ghost?: Dynamic): Dynamic =>
      setSetMoveGhost(
        (previousGhost?: Dynamic): Dynamic =>
          previousGhost === null && ghost === null ? previousGhost : ghost,
      ),
    say: (message?: Dynamic): Dynamic => onSetMoveSayRef.current?.(message),
    origin: (file?: Dynamic): Dynamic => {
      let artboard: Dynamic = manifestRef.current.artboards.find(
        (item?: Dynamic): Dynamic => item.file === file,
      );
      return artboard
        ? {
            x: artboard.x,
            y: artboard.y,
          }
        : undefined;
    },
    canvasPoint: (clientX?: Dynamic, clientY?: Dynamic): Dynamic => {
      let rootRect: Dynamic = canvasRootRef.current?.getBoundingClientRect();
      return rootRect
        ? clientToCanvasPoint(clientX, clientY, rootRect)
        : {
            x: clientX,
            y: clientY,
          };
    },
    slopPx: canvasDragThresholdPixels,
    canvas: {
      start: beginHandedOffBoardDragBound,
      update: updateSetMoveDrag,
      cancel: (setMoveKey?: Dynamic, pointerId?: Dynamic): Dynamic => {
        dragSessionRef.current?.setMove === setMoveKey && endBoardDragRef.current(pointerId);
      },
    },
    setGestureSource: (gestureKind?: Dynamic, isActive?: Dynamic): Dynamic =>
      trackGesture(gestureKind, isActive),
    claimKeyboard: focusCanvasDocument,
    setHeldCover: setHeldCover,
    commit: (moveRequest?: Dynamic): Dynamic =>
      onSetMoveCommitRef.current?.(moveRequest) ?? Promise.resolve(),
    readOnly: (): Dynamic => !canEditCanvasRef.current,
    piecesAllowed: (): Dynamic => setMovePiecesRef.current === true,
    bounds: (file?: Dynamic): Dynamic => {
      let artboard: Dynamic = manifestRef.current.artboards.find(
        (item?: Dynamic): Dynamic => item.file === file,
      );
      return artboard
        ? {
            x: artboard.x,
            y: artboard.y,
            w: artboard.w,
            h: artboard.h,
          }
        : undefined;
    },
  });
  let hasMultiGroupSelection: Dynamic =
      onSetMoveCommit != null &&
      hasMultipleEditingGroups(
        selectedTidsByFile,
        selectedArtboards.size + selectedNotes.size,
      ),
    hasMultiGroupSelectionRef: Dynamic = (0, reactVectorToolState_2.useRef)(hasMultiGroupSelection);
  hasMultiGroupSelectionRef.current = hasMultiGroupSelection;
  let beginElementMove: Dynamic = (moveRequest?: Dynamic): Dynamic => {
      let tidsByFile: Dynamic =
          moveRequest.files ??
          new Map(
            Object.entries(selectedTidsByFileRef.current ?? {}).filter(
              ([, items]: Dynamic): Dynamic => items.length > 0,
            ),
          ),
        canvasSelection: Dynamic = moveRequest.canvas ?? {
          files: selectionRef.current.files,
          notes: selectionRef.current.notes,
        };
      return (
        elementMoveSessionsRef.current?.begin({
          ...moveRequest,
          files: tidsByFile,
          canvas: canvasSelection,
        }) ?? false
      );
    },
    hasSelectedElements: Dynamic = (): Dynamic =>
      Object.values(selectedTidsByFileRef.current ?? {}).some(
        (items?: Dynamic): Dynamic => items.length > 0,
      ),
    buildObjectPressHandlersBound: Dynamic = (...args: Dynamic[]): Dynamic => (buildObjectPressHandlers as Dynamic)({ get callback46() { return beginBoardDragBound; }, get callback49() { return endBoardDragForEvent; }, get callback50() { return updateBoardDragBound; }, get callback53() { return beginElementMove; }, get callback54() { return hasSelectedElements; }, get onSelectObjects() { return onSelectObjects; }, get onSetMoveCommit() { return onSetMoveCommit; }, get value57() { return selectionRef; } }, ...args),
    enterVectorEdit: Dynamic = (noteId?: Dynamic): Dynamic => {
      let current: Dynamic = selectionRef.current;
      (current.notes.size === 1 &&
        current.notes.has(noteId) &&
        current.files.size === 0) ||
        onSelectObjects(
          boardSelectionItems({
            note: noteId,
          }),
          "replace",
        );
      actionsRef.current?.setTool("vector");
    },
    trackHandleDragGestureBound: Dynamic = (...args: Dynamic[]): Dynamic => (trackHandleDragGesture as Dynamic)({ get callback30() { return trackPointerGesture; }, get value130() { return activeGesturesRef; }, get value134() { return trackGesture; }, get value18() { return canEditCanvas; }, get value19() { return canEditCanvasRef; } }, ...args),
    selectedArtboardSpecs: Dynamic = manifest.artboards.filter(
      (artboard?: Dynamic): Dynamic => selectedArtboards.has(artboard.file),
    ),
    selectedNoteEntries: Dynamic = (manifest.annotations ?? [])
      .filter((annotation?: Dynamic): Dynamic => selectedNotes.has(annotation.id))
      .map((annotation?: Dynamic): Dynamic => {
        let noteBox: Dynamic = getAnnotationBox(annotation);
        return {
          spec: annotation,
          box: noteBox,
          bounds: rotatedAnnotationBounds(annotation, noteBox),
        };
      }),
    isMultiSelection: Dynamic = selectedArtboardSpecs.length + selectedNoteEntries.length > 1,
    [groupTransformPreview, setGroupTransformPreview]: Dynamic = (0,
    reactVectorToolState_2.useState)(null),
    [groupSnapTransforms, setGroupSnapTransforms]: Dynamic = (0,
    reactVectorToolState_2.useState)([]),
    translatedTransform: Dynamic = ((): Dynamic => {
      if (!isMultiSelection || groupSnapTransforms.length === 0) return null;
      let transformMembers: Dynamic = selectionTransformMembers(
        selectedArtboardSpecs,
        selectedNoteEntries.map((noteEntry?: Dynamic): Dynamic => noteEntry.spec),
      );
      for (let snapTransform of groupSnapTransforms as Dynamic) {
        let translated: Dynamic = translatedSelectionTransform(
          snapTransform,
          transformMembers,
        );
        if (translated) return translated;
      }
      return null;
    })(),
    selectionKey: Dynamic =
      [...selectedArtboards].join(`
`) +
      "	" +
      [...selectedNotes].join(`
`),
    selectionKeyRef: Dynamic = (0, reactVectorToolState_2.useRef)(selectionKey);
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    selectionKeyRef.current !== selectionKey &&
      ((selectionKeyRef.current = selectionKey),
      setGroupSnapTransforms(
        (items?: Dynamic): Dynamic => (items.length > 0 ? [] : items),
      ));
  }, [selectionKey]);
  let elementGroupBox: Dynamic = hasMultiGroupSelection
      ? unionRects([
          ...selectedArtboardSpecs,
          ...selectedNoteEntries.map((noteEntry?: Dynamic): Dynamic => noteEntry.bounds),
          ...manifest.artboards.flatMap((artboard?: Dynamic): Dynamic => {
            let elementRect: Dynamic = selectedRectsByFile?.[artboard.file];
            if (
              !elementRect ||
              (selectedTidsByFile?.[artboard.file]?.length ?? 0) === 0
            )
              return [];
            let clampX: Dynamic = (coordinate?: Dynamic): Dynamic =>
                Math.max(
                  -selectionChromeCoordinateOverscan,
                  Math.min(
                    artboard.w + selectionChromeCoordinateOverscan,
                    coordinate,
                  ),
                ),
              clampY: Dynamic = (coordinate?: Dynamic): Dynamic =>
                Math.max(
                  -selectionChromeCoordinateOverscan,
                  Math.min(
                    artboard.h + selectionChromeCoordinateOverscan,
                    coordinate,
                  ),
                ),
              [items, clippedTop, clippedRight, clippedBottom]: Dynamic = [
                clampX(elementRect.x),
                clampY(elementRect.y),
                clampX(elementRect.x + elementRect.w),
                clampY(elementRect.y + elementRect.h),
              ];
            return clippedRight > items && clippedBottom > clippedTop
              ? [
                  {
                    x: artboard.x + items,
                    y: artboard.y + clippedTop,
                    w: clippedRight - items,
                    h: clippedBottom - clippedTop,
                  },
                ]
              : [];
          }),
        ])
      : null,
    selectionBox: Dynamic =
      elementGroupBox ??
      (isMultiSelection
        ? (groupTransformPreview?.box ??
          translatedTransform?.box ??
          unionRects([
            ...selectedArtboardSpecs,
            ...selectedNoteEntries.map((noteEntry?: Dynamic): Dynamic => noteEntry.bounds),
          ]))
        : null),
    selectionRotation: Dynamic = groupTransformPreview ? groupTransformPreview.deg : (translatedTransform?.deg ?? 0),
    isRotatedSelection: Dynamic =
      isMultiSelection &&
      (!!groupTransformPreview?.deg ||
        translatedTransform !== null ||
        selectedNoteEntries.some(
          (noteEntry?: Dynamic): Dynamic =>
            noteEntry.spec.kind === "image" ||
            (isShapeAnnotation(noteEntry.spec) &&
              annotationRotation(noteEntry.spec) !== 0),
        )),
    isNotesOnlySelection: Dynamic = isMultiSelection && selectedArtboardSpecs.length === 0,
    resizeDisabledReason: Dynamic =
      isMultiSelection && selectedNoteEntries.length > 0 && selectedArtboardSpecs.length > 0
        ? uiMessage("canvas.interactionLayer.thisSelectionCanTBe")
        : undefined,
    isResizeDisabled: Dynamic =
      !canEditCanvas ||
      supportsClickPlacement(armedTool) ||
      armedTool === "draw" ||
      elementGroupBox != null,
    runSelectionTransform: Dynamic = (...args: Dynamic[]): Dynamic => (runSelectionTransformGesture as Dynamic)({ get callback57() { return trackHandleDragGestureBound; }, get onManifestChange() { return onManifestChange; }, get value146() { return manifestRef; }, get value230() { return selectedArtboardSpecs; }, get value231() { return selectedNoteEntries; }, get value234() { return setGroupTransformPreview; }, get value236() { return setGroupSnapTransforms; }, get value241() { return selectionBox; }, get value242() { return selectionRotation; }, get value70() { return setSnapGuides; } }, ...args),
    beginGroupResize: Dynamic = (...args: Dynamic[]): Dynamic => (beginSelectionGroupResize as Dynamic)({ get callback45() { return buildSnapReferenceLines; }, get callback58() { return runSelectionTransform; }, get camera() { return camera; }, get selectedArtboards() { return selectedArtboards; }, get selectedNotes() { return selectedNotes; }, get value230() { return selectedArtboardSpecs; }, get value231() { return selectedNoteEntries; }, get value241() { return selectionBox; }, get value242() { return selectionRotation; }, get value243() { return isRotatedSelection; }, get value70() { return setSnapGuides; } }, ...args),
    beginGroupRotate: Dynamic = (handleEvent?: Dynamic, pointerEvent?: Dynamic): Dynamic => {
      if (!selectionBox) return;
      let box: Dynamic = selectionBox,
        center: Dynamic = {
          x: box.x + box.w / 2,
          y: box.y + box.h / 2,
        },
        bounds: Dynamic = (
          pointerEvent.currentTarget.closest(
            '[data-mega-chrome="group-resize"]',
          ) ?? pointerEvent.currentTarget
        ).getBoundingClientRect(),
        [items, centerY]: Dynamic = [
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2,
        ],
        startAngle: Dynamic = angleBetweenPoints(
          items,
          centerY,
          pointerEvent.clientX,
          pointerEvent.clientY,
        ),
        startDegrees: Dynamic = selectionRotation,
        touchedProperties: Dynamic = transformTouchedProperties("rotate");
      runSelectionTransform(
        pointerEvent,
        "Rotate",
        touchedProperties,
        (moveEvent?: Dynamic): Dynamic => {
          let nextDegrees: Dynamic = snapRotation(
            startDegrees +
              angleBetweenPoints(
                items,
                centerY,
                moveEvent.clientX,
                moveEvent.clientY,
              ) -
              startAngle,
            moveEvent.shiftKey,
          );
          return nextDegrees === startDegrees
            ? null
            : {
                box: box,
                deg: nextDegrees,
                keys: touchedProperties,
                board: (): Dynamic => ({}),
                ann: (item?: Dynamic): Dynamic =>
                  rotateAnnotationAboutPoint(
                    item.spec,
                    item.box,
                    center,
                    nextDegrees - startDegrees,
                  ),
              };
        },
      );
    },
    isLineDraft: Dynamic = shapeDraft?.tool === "arrow" || shapeDraft?.tool === "line",
    lineDraftEndpoints: Dynamic = ((): Dynamic => {
      if (!shapeDraft || !isLineDraft) return null;
      let startX: Dynamic = shapeDraft.dirX === 1 ? 0 : shapeDraft.w,
        startY: Dynamic = shapeDraft.dirY === 1 ? 0 : shapeDraft.h,
        endX: Dynamic = shapeDraft.dirX === 1 ? shapeDraft.w : 0,
        endY: Dynamic = shapeDraft.dirY === 1 ? shapeDraft.h : 0,
        shortenedEnd: Dynamic =
          shapeDraft.tool === "arrow"
            ? shortenLineEnd(
                startX,
                startY,
                endX,
                endY,
                (arrowHeadTipInset * SvgDrawingConstant) /
                  entry.scale,
              )
            : {
                x: endX,
                y: endY,
              };
      return {
        x1: startX,
        y1: startY,
        x2: shortenedEnd.x,
        y2: shortenedEnd.y,
      };
    })(),
    dragGhostLayout: Dynamic = ((): Dynamic => {
      let ghostBox: Dynamic = dragGhost?.box;
      if (!dragGhost || !ghostBox) return null;
      let viewWidth: Dynamic =
          (canvasRootRef.current?.clientWidth || 1200) / entry.scale,
        viewHeight: Dynamic =
          (canvasRootRef.current?.clientHeight || 800) / entry.scale,
        fitScale: Dynamic = Math.min(
          1,
          (0.4 * viewWidth) / ghostBox.w,
          (0.4 * viewHeight) / ghostBox.h,
        ),
        ghostScale: Dynamic = entry.scale * fitScale;
      return {
        box: ghostBox,
        s: ghostScale,
        left: (dragGhost.x - entry.x) * entry.scale - ghostBox.gx * ghostScale,
        top: (dragGhost.y - entry.y) * entry.scale - ghostBox.gy * ghostScale,
        width: ghostBox.w * ghostScale,
        height: ghostBox.h * ghostScale,
      };
    })();
  return (
    <ViewportContext.Provider value={camera}>
      <div
        ref={canvasRootRef}
        data-testid={"mega-canvas"}
        data-hover-file={hoveredFile ?? undefined}
        onPointerDownCapture={(event?: Dynamic): Dynamic => {
          setIsTouchPointer(event.pointerType === "touch");
          !(
            onCanvasMenu == null ||
            !isDesktopMac ||
            event.button !== 0 ||
            !event.ctrlKey ||
            !isEventInsideTarget(event) ||
            fullscreenFileRef.current != null ||
            isCanvasInertRef.current ||
            OutlineDcOutlineHandler(event.target) ||
            canvasContextMenuTargetFromElement(event.target) ===
              null
          ) &&
            (event.stopPropagation(),
            (scrimRightClickRef.current = {
              x: event.clientX,
              y: event.clientY,
            }));
        }}
        onPointerMoveCapture={(): Dynamic => {
          hasPressedSinceSelection && setHasPressedSinceSelection(false);
        }}
        className={joinClassNames(
          "relative h-full w-full select-none overflow-clip bg-om-bg-canvas mdn-dot-grid",
          armedTool === "frame" && "cursor-crosshair [&_*]:!cursor-crosshair",
          armedTool === "note" &&
            !isPanBlanketActive &&
            "cursor-default [&_*]:!cursor-default",
          canEditCanvas &&
            fullscreenFile == null &&
            supportsClickPlacement(armedTool) &&
            (onAddShape
              ? armedTool === "text"
                ? "cursor-text"
                : "cursor-crosshair"
              : "cursor-not-allowed"),
        )}
        style={
          canEditCanvas &&
          fullscreenFile == null &&
          armedTool === "draw" &&
          onAddPen != null
            ? {
                cursor: pickerCursorCss,
              }
            : undefined
        }
        onPointerOver={trackPointerOver}
        onPointerMove={(event?: Dynamic): Dynamic => {
          trackPointerOver(event);
          if (props.onWorldPointer && fullscreenFileRef.current == null) {
            let surfaceBounds: Dynamic =
                event.currentTarget.getBoundingClientRect(),
              cameraState: Dynamic = camera.get();
            props.onWorldPointer(
              cameraState.x + (event.clientX - surfaceBounds.left) / cameraState.scale,
              cameraState.y + (event.clientY - surfaceBounds.top) / cameraState.scale,
            );
          }
          if (
            !isEventInsideTarget(event) ||
            armedToolRef.current !== "note" ||
            fullscreenFileRef.current != null
          ) {
            notePlacement && setNotePlacement(null);
            return;
          }
          if (
            event.target instanceof Element &&
            event.target.closest("[data-mega-chrome]") != null &&
            event.target.closest('[data-mega-chrome="focus-overlay"]') == null
          ) {
            notePlacement && setNotePlacement(null);
            return;
          }
          let bounds: Dynamic = event.currentTarget.getBoundingClientRect();
          setNotePlacement({
            x:
              camera.get().x +
              (event.clientX - bounds.left) / camera.get().scale,
            y:
              camera.get().y +
              (event.clientY - bounds.top) / camera.get().scale,
          });
        }}
        onPointerLeave={(): Dynamic => {
          lastPointerRef.current = null;
          pendingInsertRef.current = null;
          notePlacement && setNotePlacement(null);
        }}
        onDragEnter={(event?: Dynamic): Dynamic => {
          onImageDrop &&
            event.dataTransfer?.types.includes("Files") &&
            (hasPressedSinceSelection || setHasPressedSinceSelection(true));
        }}
        onDragOver={(event?: Dynamic): Dynamic => {
          onImageDrop &&
            event.dataTransfer?.types.includes("Files") &&
            (hasPressedSinceSelection || setHasPressedSinceSelection(true),
            event.preventDefault(),
            (event.dataTransfer.dropEffect = isEventInsideTarget(event)
              ? "copy"
              : "none"));
        }}
        onDrop={(event?: Dynamic): Dynamic => {
          setHasPressedSinceSelection(false);
          if (!onImageDrop) return;
          let items: Dynamic = [...(event.dataTransfer?.files ?? [])];
          if (
            items.length === 0 ||
            (event.preventDefault(),
            event.stopPropagation(),
            !isEventInsideTarget(event))
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
        onContextMenu={(...args: Dynamic[]): Dynamic => (openCanvasContextMenu as Dynamic)({ get callback12() { return isContextMenuPointerEvent; }, get callback20() { return isEventInsideTarget; }, get onCanvasMenu() { return onCanvasMenu; }, get value107() { return handleCanvasMenu; }, get value108() { return deferredContextClick; }, get value109() { return scrimRightClickRef; }, get value128() { return isCanvasInertRef; }, get value130() { return activeGesturesRef; }, get value55() { return fullscreenFileRef; } }, ...args)}
        onPointerDown={(...args: Dynamic[]): Dynamic => (pressCanvasBackground as Dynamic)({ get callback10() { return shouldPanFromTarget; }, get callback13() { return isPanPointerEvent; }, get callback14() { return shouldStartMarquee; }, get callback16() { return clientToCanvasPoint; }, get callback19() { return beginMarquee; }, get callback20() { return isEventInsideTarget; }, get callback30() { return trackPointerGesture; }, get camera() { return camera; }, get manifest() { return manifest; }, get onAddAnnotation() { return onAddAnnotation; }, get onAddPen() { return onAddPen; }, get onAddShape() { return onAddShape; }, get onClearSelection() { return onClearSelection; }, get onDrawArtboard() { return onDrawArtboard; }, get onPlaceBlocked() { return onPlaceBlocked; }, get onPlaceTool() { return onPlaceTool; }, get value108() { return deferredContextClick; }, get value128() { return isCanvasInertRef; }, get value130() { return activeGesturesRef; }, get value134() { return trackGesture; }, get value183() { return enteredFileRef; }, get value19() { return canEditCanvasRef; }, get value213() { return blockedFiles; }, get value55() { return fullscreenFileRef; }, get value78() { return setPointerGhost; }, get value79() { return backgroundPressRef; }, get value81() { return setShapeDraft; }, get value83() { return setFrameDraft; }, get value85() { return armedToolRef; }, get value96() { return spaceHeldRef; } }, ...args)}
      >
        <span id={hintId} hidden={true}>
          {PressReturnToGoIntoThisMessage}
        </span>
        <div
          ref={camera.attach}
          data-mega-world={""}
          aria-busy={props.turnBusy ? true : undefined}
          className={"absolute left-0 top-0"}
          style={{
            transformOrigin: "0 0",
          }}
        >
          {elementGroupBox &&
            canEditCanvas &&
            fullscreenFile == null &&
            (armedTool == null || armedTool === "select") && (<div
                data-mega-chrome={"set-box-pad"}
                data-testid={"mega-set-box-pad"}
                className={"absolute cursor-grab"}
                style={{
                  left: elementGroupBox.x,
                  top: elementGroupBox.y,
                  width: elementGroupBox.w,
                  height: elementGroupBox.h,
                }}
                onPointerDown={(event?: Dynamic): Dynamic => {
                  event.button !== 0 ||
                    event.pointerType === "touch" ||
                    event.shiftKey ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.altKey ||
                    (event.stopPropagation(),
                    beginElementMove({
                      pointerId: event.pointerId,
                      captureEl: event.currentTarget,
                      clientX: event.clientX,
                      clientY: event.clientY,
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
          {setMoveGhost &&
            fullscreenFile == null && (wrapInCameraPortal(
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
                {setMoveGhost.map(
                  (ghostRect?: Dynamic, index?: Dynamic): Dynamic => (
                    <div
                      key={index}
                      className={"absolute rounded-[2px]"}
                      style={{
                        left: ghostRect.x,
                        top: ghostRect.y,
                        width: ghostRect.w,
                        height: ghostRect.h,
                        border: "1px dashed var(--t-app-accent)",
                        background:
                          "color-mix(in srgb, var(--t-app-accent) 12%, transparent)",
                      }}
                    />
                  ),
                )}
              </div>,
            ))}
          {props.pendingBoards != null &&
            props.pendingBoards.length > 0 &&
            fullscreenFile == null && (<ConditionalPortal on={usesCameraPortal} to={objectsPortalHost}>
                <div
                  ref={usesCameraPortal ? registerTransformTarget : undefined}
                  className={
                    "pointer-events-none absolute left-0 top-0 h-0 w-0"
                  }
                  style={{
                    transformOrigin: "0 0",
                    isolation: "isolate",
                  }}
                >
                  <PendingArtboards
                    boards={props.pendingBoards}
                    sheen={!usesCameraPortal}
                  />
                </div>
              </ConditionalPortal>)}
          <ConditionalPortal on={usesCameraPortal} to={artboardsPortalHost}>
            <div
              style={{
                isolation: "isolate",
              }}
            >
              {stackedArtboards.map(({ spec: spec, z: z }: Dynamic): Dynamic => {
                let isFocused: Dynamic = spec.file === focusedFile,
                  isSelected: Dynamic = selectedArtboards.has(spec.file),
                  isFrameless: Dynamic = spec.frameless === true,
                  isEntered: Dynamic = isFrameless && enteredFile === spec.file,
                  isEmptyPieces: Dynamic =
                    isFrameless && (emptyPieces?.has(spec.file) ?? false),
                  isKeyboardInside: Dynamic = keyboardInsideFile === spec.file,
                  isComponent: Dynamic = linkedArtboards.has(spec.file),
                  displayTitle: Dynamic =
                    spec.title ?? spec.file.replace(/\.dc\.html$/, ""),
                  tweaksRowHeight: Dynamic =
                    spec.file === fullscreenFile &&
                    flag &&
                    tweakRows?.[spec.file]
                      ? artboardTweaksRowHeight
                      : 0,
                  isPlaying: Dynamic = spec.file === playingFile,
                  usesFaceOverlay: Dynamic =
                    !isFrameless &&
                    isFocused &&
                    isSelected &&
                    canEditCanvas &&
                    !isTouchPointer &&
                    (armedTool == null || armedTool === "select") &&
                    fullscreenFile == null,
                  usesSetOverlay: Dynamic =
                    !isFrameless &&
                    isFocused &&
                    !isSelected &&
                    canEditCanvas &&
                    !isTouchPointer &&
                    (armedTool == null || armedTool === "select") &&
                    fullscreenFile == null &&
                    onSetMoveCommit != null &&
                    (hasMultiGroupSelection || armedEmpty === true),
                  chromeKind: Dynamic = usesFaceOverlay
                    ? "face-overlay"
                    : usesSetOverlay
                      ? "set-overlay"
                      : "focus-overlay",
                  isHeldCover: Dynamic = heldCover === spec.file,
                  isMountDelayed: Dynamic =
                    shouldDelayArtboardMount(spec) && !(isFocused && canEditCanvas),
                  canFocusArtboard: Dynamic = isCanvasInteractive && !isMountDelayed,
                  shouldShowFocusOverlay: Dynamic =
                    canFocusArtboard &&
                    !isPlaying &&
                    (isFrameless
                      ? !(isEntered && isFocused)
                      : !isFocused || usesFaceOverlay || usesSetOverlay || isHeldCover),
                  aboveDistance: Dynamic =
                    isFrameless || fullscreenFile != null
                      ? undefined
                      : artboardAboveDistances(
                          manifest.artboards,
                        ).get(spec.file),
                  shouldHideTitle: Dynamic = shouldHideArtboardTitle({
                    phoneCanvas: isPhoneCanvas,
                    selected: isSelected,
                    renaming: renamingFile === spec.file,
                    playing: isPlaying,
                    tweaksOpen: tweaksOpenFile === spec.file,
                    armedByTouch: isFocused && isTouchPointer,
                    hovered: hoveredFile === spec.file,
                  }),
                  isLive: Dynamic =
                    phone && !flag && fullscreenFile != null
                      ? isPreviewHighlighted(
                          spec.file,
                          fullscreenFile,
                          livePins,
                        )
                      : (!usesCameraPortal && manifest.artboards.length <= maxInteractivePreviewCount) ||
                        mountedFiles.has(spec.file) ||
                        (isPhoneCanvas
                          ? spec.file === overBudgetPreviewFile
                          : isFocused || isPlaying) ||
                        spec.file === fullscreenFile,
                  phoneHeaderTheme: Dynamic =
                    isPhoneCanvas && !isLive && !isFrameless
                      ? (artboardHeaderThemes.get(spec.file) ?? null)
                      : null,
                  hasCoverOverlay: Dynamic =
                    props.coverFiles?.has(spec.file) === true &&
                    shouldShowArtboardFaceOverlay({
                      live: isLive,
                      blocked: blockedFiles.has(spec.file),
                      frameless: isFrameless,
                      focused: isFocused,
                      selected: isSelected,
                      playing: isPlaying,
                      fullWindow: fullscreenFile != null,
                    }),
                  noticeContent: Dynamic =
                    fullscreenFile === spec.file
                      ? (artboardNotice?.(spec.file) ?? null)
                      : null;
                return (() => {
                  const _Component = "div";
                  const _props = {
                    ref: usesCameraPortal
                      ? registerPortalPlacement(spec.file, spec.x, spec.y)
                      : undefined,
                    "data-mega-artboard": spec.file,
                    "data-mega-selected": isSelected ? "" : undefined,
                    className: joinClassNames(
                      "absolute",
                      canEditCanvas &&
                        !isFocused &&
                        !isPlaying &&
                        fullscreenFile == null &&
                        supportsClickPlacement(armedTool) &&
                        (blockedFiles.has(spec.file)
                          ? "cursor-not-allowed [&_*]:!cursor-not-allowed"
                          : armedTool === "text"
                            ? "cursor-text [&_*]:!cursor-text"
                            : "cursor-crosshair [&_*]:!cursor-crosshair"),
                    ),
                    style: {
                      ...(usesCameraPortal
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
                        activeCropElement === spec.file
                          ? 1e6
                          : usesCameraPortal && isLive
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
                      ...(tweaksRowHeight && !fullscreenBox
                        ? {
                            top: spec.y - tweaksRowHeight,
                            height: spec.h + tweaksRowHeight,
                          }
                        : {}),
                    },
                    onPointerEnter: (event?: Dynamic): Dynamic => {
                      (!(event.target instanceof HTMLIFrameElement) &&
                        isPointerAboveOtherTitle(event, spec.file)) ||
                        (titleHoverRef.current?.release(), setHoveredFile(spec.file));
                    },
                    onPointerLeave: (event?: Dynamic): Dynamic => {
                      isPointerAboveOtherTitle(event, spec.file) ||
                        (aboveDistance !== undefined &&
                        isAboveTitleRect(
                          event.clientX,
                          event.clientY,
                          event.currentTarget.getBoundingClientRect(),
                        )
                          ? trackTitleHover(event.currentTarget, spec.file)
                          : setHoveredFile(null));
                    },
                    children: [
                      aboveDistance !== undefined && shouldHideTitle && (
                        <ViewportScaleThreshold
                          min={artboardTitleHeight(aboveDistance)}
                        >
                          {(isAboveThreshold?: Dynamic): Dynamic =>
                            isAboveThreshold ? null : (
                              <span hidden={true} data-mega-title-room={""} />
                            )
                          }
                        </ViewportScaleThreshold>
                      ),
                      fullscreenFile == null && !isFrameless && (
                        <div
                          data-mega-chrome={"title"}
                          data-proto={
                            onPlayArtboard != null &&
                            !isMountDelayed &&
                            (spec.is_interactive === true || isPlaying)
                              ? ""
                              : undefined
                          }
                          data-sel={isSelected ? "" : undefined}
                          data-covered={hasCoverOverlay ? "" : undefined}
                          data-testid={"mega-artboard-title-" + spec.file}
                          className={joinClassNames(
                            "group/hdr @container/hdr absolute bottom-full left-0 z-30 flex h-6 items-center gap-1.5 [clip-path:inset(-100vmax_0_-100vmax_-8px)] text-xs select-none",
                            canEditCanvas ? "cursor-grab" : "cursor-pointer",
                            isComponent
                              ? "text-pro"
                              : isSelected
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
                              renamingFile === spec.file ||
                              !isEventInsideTarget(event)
                            )
                              return;
                            if (
                              isTouchSelectionStart(
                                event.pointerType,
                                isSelected,
                              )
                            ) {
                              let touchShiftKey: Dynamic = event.shiftKey,
                                shouldFocusAfterSelect: Dynamic =
                                  !touchShiftKey && !event.altKey;
                              watchPointerRelease(
                                event.nativeEvent,
                                (): Dynamic => {
                                  selectArtboard(spec.file, touchShiftKey);
                                  canFocusArtboard &&
                                    shouldFocusAfterSelect &&
                                    !isPlaying &&
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
                                selectionRef.current,
                                {
                                  file: spec.file,
                                },
                              ) &&
                              hasSelectedElements()
                            ) {
                              let shouldFocusOnStill: Dynamic =
                                canFocusArtboard && !isPlaying && !artboardPicking;
                              beginElementMove({
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
                                  shouldFocusOnStill && onFocus(spec.file);
                                },
                                armWait: null,
                                heldCover: null,
                              });
                              return;
                            }
                            let pressDecision: Dynamic = selectionPointerDownDecision(
                              selectionRef.current,
                              {
                                file: spec.file,
                              },
                              shiftKey,
                            );
                            pressDecision.selectNow &&
                              selectArtboard(spec.file, shiftKey);
                            beginBoardDragBound(
                              event,
                              {
                                file: spec.file,
                              },
                              spec,
                              pressDecision.carry,
                              pressDecision.click,
                              canFocusArtboard &&
                                !shiftKey &&
                                !isPlaying &&
                                !artboardPicking,
                            );
                          }}
                          onPointerMove={(event?: Dynamic): Dynamic =>
                            updateBoardDragBound(event, false)
                          }
                          onPointerUp={(event?: Dynamic): Dynamic =>
                            updateBoardDragBound(event, true)
                          }
                          onPointerCancel={(event?: Dynamic): Dynamic =>
                            endBoardDragForEvent(event)
                          }
                          onDoubleClick={(event?: Dynamic): Dynamic => {
                            isEventInsideTarget(event) &&
                              onRenameArtboard &&
                              canEditCanvas &&
                              ((renameCancelledRef.current = false),
                              isKeyboardInside && keyboardController?.onAbandon(),
                              setRenamingFile(spec.file));
                          }}
                        >
                          {renamingFile === spec.file ? (<input
                              data-mega-chrome={"rename"}
                              data-testid={
                                "mega-artboard-rename-" + spec.file
                              }
                              aria-label={uiMessage("canvas.interactionLayer.artboardName")}
                              defaultValue={displayTitle}
                              autoFocus={true}
                              onFocus={(event?: Dynamic): Dynamic =>
                                event.currentTarget.select()
                              }
                              className={
                                "min-w-0 flex-1 rounded-sm bg-page px-1 text-primary ring-1 ring-fill-accent outline-none focus-visible:outline-hidden"
                              }
                              style={{
                                font: "inherit",
                              }}
                              onPointerDown={(event?: Dynamic): Dynamic =>
                                event.stopPropagation()
                              }
                              onKeyDown={(event?: Dynamic): Dynamic => {
                                event.stopPropagation();
                                event.key === "Enter"
                                  ? event.currentTarget.blur()
                                  : event.key === "Escape" &&
                                    ((renameCancelledRef.current = true),
                                    setRenamingFile(null));
                              }}
                              onBlur={(event?: Dynamic): Dynamic => {
                                if (renameCancelledRef.current) {
                                  renameCancelledRef.current = false;
                                  return;
                                }
                                setRenamingFile(null);
                                onRenameArtboard?.(
                                  spec.file,
                                  event.currentTarget.value,
                                );
                              }}
                            />) : (<ArtboardFocusOverlay
                              file={spec.file}
                              title={displayTitle}
                              name={artboardPositionAnnouncement(
                                entries.get(spec.file) ?? -1,
                                entries.size,
                                displayTitle,
                              )}
                              hintId={
                                canFocusArtboard && keyboardController && !artboardPicking
                                  ? hintId
                                  : undefined
                              }
                              selected={isSelected}
                              inside={isKeyboardInside}
                              testId={"mega-artboard-handle-" + spec.file}
                              inert={isCanvasInert}
                              onActivate={handleArtboardActivate}
                              keys={
                                canFocusArtboard && !artboardPicking
                                  ? keyboardController?.keys
                                  : undefined
                              }
                              yieldsEscape={shouldYieldEscape}
                            />)}
                          {isKeyboardInside && renamingFile !== spec.file && (<span
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
                          {!hasCoverOverlay && (<ArtboardHeaderActions
                              file={spec.file}
                              title={displayTitle}
                              inert={isCanvasInert}
                              editable={editable}
                              tweaks={
                                isNotArtboardPicking &&
                                onToggleTweaks != null &&
                                !isMountDelayed &&
                                tweakRows?.[spec.file] === true &&
                                renamingFile !== spec.file
                              }
                              tweaksOpen={tweaksOpenFile === spec.file}
                              play={
                                isNotArtboardPicking &&
                                onPlayArtboard != null &&
                                (isPlaying ||
                                  (!isMountDelayed &&
                                    spec.is_interactive === true)) &&
                                renamingFile !== spec.file
                                  ? isPlaying
                                    ? canEditCanvas
                                      ? "edit"
                                      : "stop"
                                    : "play"
                                  : null
                              }
                              expand={
                                isNotArtboardPicking &&
                                onExpandArtboard != null &&
                                renamingFile !== spec.file
                              }
                              download={
                                isNotArtboardPicking &&
                                onExportArtboard != null &&
                                !isPhoneCanvas &&
                                renamingFile !== spec.file
                              }
                              exportDisabledReason={exportDisabledReason}
                              problem={
                                isNotArtboardPicking && !isMountDelayed && renamingFile !== spec.file
                                  ? artboardProblems?.get(spec.file)?.[0]
                                  : undefined
                              }
                              onShowProblems={showProblems}
                              exportOpen={
                                artboardPanel?.open === true &&
                                artboardPanel.file === spec.file
                              }
                              exportItems={
                                artboardPanel?.file === spec.file
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
                              onToggleTweaks={toggleTweaks}
                              onPlay={togglePlayArtboard}
                              onExpand={expandArtboardBlurred}
                              onExportOpenChange={handleExportOpenChange}
                            />)}
                        </div>
                      ),
                      noticeContent != null && (
                        <ArtboardNoticePlane
                          w={fullscreenBox?.w ?? spec.w}
                          full={true}
                          inert={isCanvasInert}
                          stamp={camera.stamp}
                        >
                          {noticeContent}
                        </ArtboardNoticePlane>
                      ),
                      isSelected && fullscreenFile == null && (
                        <div
                          data-mega-chrome={"resize"}
                          data-testid={"mega-artboard-resize-" + spec.file}
                          className={
                            "pointer-events-none absolute inset-0 z-[29]"
                          }
                        >
                          <ViewportScale>
                            {(viewportScale?: Dynamic): Dynamic => (
                              <SelectionRing
                                frame={{
                                  x: 0,
                                  y: 0,
                                  w: spec.w,
                                  h: spec.h,
                                }}
                                scale={viewportScale}
                                state={isMultiSelection ? "member" : "selected"}
                                variant={isComponent ? "component" : "object"}
                                grips={
                                  canEditCanvas &&
                                  !isFrameless &&
                                  !isMultiSelection &&
                                  !(hasMultiGroupSelection && fullscreenFile == null)
                                    ? "corners"
                                    : "none"
                                }
                                onResizeStart={(
                                  resizeHandle?: Dynamic,
                                  pointerEvent?: Dynamic,
                                ): Dynamic => {
                                  let state: Dynamic = {
                                      x: spec.x,
                                      y: spec.y,
                                      w: spec.w,
                                      h: spec.h,
                                    },
                                    [items, startClientY]: Dynamic = [
                                      pointerEvent.clientX,
                                      pointerEvent.clientY,
                                    ],
                                    resizeKeys: Dynamic = [
                                      ...(resizeHandle.x
                                        ? resizeHandle.x === "left"
                                          ? ["x", "w"]
                                          : ["w"]
                                        : []),
                                      ...(resizeHandle.y
                                        ? resizeHandle.y === "top"
                                          ? ["y", "h"]
                                          : ["h"]
                                        : []),
                                    ],
                                    isCornerResize: Dynamic =
                                      resizeHandle.x !== null && resizeHandle.y !== null,
                                    snapReferenceLines: Dynamic = buildSnapReferenceLines({
                                      files: [spec.file],
                                    }),
                                    computeResize: Dynamic = (
                                      moveEvent?: Dynamic,
                                    ): Dynamic => {
                                      let scale: Dynamic = camera.get().scale,
                                        pointerDelta: Dynamic = {
                                          dx:
                                            (moveEvent.clientX - items) / scale,
                                          dy:
                                            (moveEvent.clientY - startClientY) / scale,
                                        },
                                        snapped: Dynamic =
                                          moveEvent.metaKey || moveEvent.ctrlKey
                                            ? {
                                                ...pointerDelta,
                                                guides: [],
                                              }
                                            : snapResize(
                                                state,
                                                resizeHandle,
                                                pointerDelta.dx,
                                                pointerDelta.dy,
                                                snapReferenceLines,
                                                canvasTouchDragThresholdPixels /
                                                  scale,
                                              ),
                                        [deltaX, deltaY]: Dynamic = [
                                          Math.round(snapped.dx),
                                          Math.round(snapped.dy),
                                        ],
                                        rawBox: Dynamic =
                                          isCornerResize && moveEvent.shiftKey
                                            ? resizeRectKeepingAspect(
                                                state,
                                                resizeHandle,
                                                deltaX,
                                                deltaY,
                                                minimumArtboardSize,
                                                maximumArtboardSize,
                                              )
                                            : resizeRect(
                                                state,
                                                resizeHandle,
                                                deltaX,
                                                deltaY,
                                                minimumArtboardSize,
                                                maximumArtboardSize,
                                              ),
                                        roundedBox: Dynamic =
                                          isCornerResize && moveEvent.shiftKey
                                            ? {
                                                x: Math.round(rawBox.x),
                                                y: Math.round(rawBox.y),
                                                w: Math.round(rawBox.w),
                                                h: Math.round(rawBox.h),
                                              }
                                            : rawBox;
                                      return {
                                        box: roundedBox,
                                        guides: activeResizeGuides(
                                          roundedBox,
                                          resizeHandle,
                                          snapped.guides,
                                        ),
                                      };
                                    },
                                    pickResizeKeys: Dynamic = (
                                      box?: Dynamic,
                                    ): Dynamic =>
                                      Object.fromEntries(
                                        resizeKeys.map(
                                          (key?: Dynamic): Dynamic => [
                                            key,
                                            box[key],
                                          ],
                                        ),
                                      ),
                                    applyArtboardBox: Dynamic = (
                                      boxChange?: Dynamic,
                                      changeMeta?: Dynamic,
                                    ): Dynamic => {
                                      let currentArtboard: Dynamic =
                                        manifestRef.current.artboards.find(
                                          (item?: Dynamic): Dynamic =>
                                            item.file === spec.file,
                                        );
                                      onManifestChange(
                                        replaceDesignArtboards(
                                          manifestRef.current,
                                          manifestRef.current.artboards.map(
                                            (item?: Dynamic): Dynamic =>
                                              item.file === spec.file
                                                ? {
                                                    ...item,
                                                    ...pickResizeKeys(boxChange),
                                                  }
                                                : item,
                                          ),
                                        ),
                                        changeMeta,
                                        changeMeta && currentArtboard
                                          ? {
                                              resizedFrom: {
                                                file: spec.file,
                                                x: currentArtboard.x,
                                                y: currentArtboard.y,
                                                w: currentArtboard.w,
                                                h: currentArtboard.h,
                                                ...pickResizeKeys(state),
                                              },
                                            }
                                          : undefined,
                                      );
                                    },
                                    currentBox: Dynamic = state;
                                  trackHandleDragGestureBound(pointerEvent, "resize", {
                                    live: (moveEvent?: Dynamic): Dynamic => {
                                      let resizeResult: Dynamic =
                                        computeResize(moveEvent);
                                      currentBox = resizeResult.box;
                                      applyArtboardBox(currentBox, false);
                                      setSnapGuides(
                                        resizeResult.guides.length > 0
                                          ? resizeResult.guides
                                          : null,
                                      );
                                    },
                                    commit: (): Dynamic =>
                                      applyArtboardBox(currentBox, true),
                                    revert: (): Dynamic =>
                                      applyArtboardBox(state, false),
                                    end: (): Dynamic => setSnapGuides(null),
                                  });
                                }}
                              />
                            )}
                          </ViewportScale>
                        </div>
                      ),
                      props.artboardOverlay && (
                        <ArtboardOverlayPlane
                          a={spec}
                          fullscreenFile={fullscreenFile ?? null}
                          fullscreenBox={fullscreenBox ?? null}
                          rowH={tweaksRowHeight}
                          overlay={props.artboardOverlay}
                        />
                      ),
                      (fullscreenFile == null ||
                        (isCanvasInteractive && fullscreenFile === spec.file)) && (
                        <div
                          ref={getChromeSlotRef(spec.file)}
                          data-mega-chrome={"element"}
                          className={joinClassNames(
                            "pointer-events-none absolute left-0",
                            activeCropElement === spec.file ? "z-[31]" : "z-[29]",
                          )}
                          style={
                            fullscreenFile === spec.file && fullscreenBox
                              ? {
                                  top: tweaksRowHeight,
                                  width: fullscreenBox.w,
                                  height: fullscreenBox.h - tweaksRowHeight,
                                  ...PickerRuntimeScriptTAppAccentConfig,
                                }
                              : {
                                  top: tweaksRowHeight,
                                  width: spec.w,
                                  height: spec.h,
                                  ...PickerRuntimeScriptTAppAccentConfig,
                                }
                          }
                        />
                      ),
                      hasCoverOverlay && (
                        <PendingArtboardTitle
                          spec={spec}
                          tone={isComponent ? "component" : "arrived"}
                          className={"z-30"}
                        />
                      ),
                      <div
                        data-testid={"mega-artboard-frame-" + spec.file}
                        data-empty-piece={isEmptyPieces || undefined}
                        className={joinClassNames(
                          "relative flex h-full w-full flex-col overflow-clip",
                          isFrameless
                            ? isEmptyPieces
                              ? "rounded border-[1.5px] border-dashed border-(--cds-text-secondary)"
                              : isEntered
                                ? "ring-1 ring-app-accent/50"
                                : isLive
                                  ? canFocusArtboard &&
                                    !isSelected &&
                                    "hover:ring-1 hover:ring-(--cds-border)/60"
                                  : "ring-1 ring-(--cds-border)"
                            : "bg-white",
                          !isFrameless &&
                            !fullscreenBox &&
                            !hasCoverOverlay &&
                            "shadow-md",
                          !isFrameless &&
                            !fullscreenBox &&
                            !hasCoverOverlay &&
                            (fullscreenFile != null || !isSelected) &&
                            (isFocused && canFocusArtboard
                              ? "ring-1 ring-app-accent/50"
                              : isComponent
                                ? "ring-1 ring-(--cds-fill-pro)"
                                : "ring-1 ring-(--cds-border)"),
                        )}
                        style={{
                          ...PickerRuntimeScriptTAppAccentConfig,
                          borderRadius:
                            isFrameless || fullscreenBox
                              ? undefined
                              : artboardRadiusCss(spec.radius),
                        }}
                      >
                        <ArtboardFrame
                          file={spec.file}
                          displayTitle={displayTitle}
                          title={spec.title}
                          live={isLive}
                          expanded={spec.file === fullscreenFile}
                          onPagePointer={props.onPagePointer}
                          onPageScroll={props.onPageScroll}
                          migrated={flag}
                          frameless={isFrameless}
                          onContentHull={onContentHull}
                          box={
                            fullscreenFile === spec.file && fullscreenBox
                              ? fullscreenBox
                              : stableFrameSize(spec)
                          }
                          boxRowH={
                            fullscreenFile === spec.file && fullscreenBox
                              ? tweaksRowHeight
                              : 0
                          }
                          component={isComponent}
                          chromeSlot={chromeSlots.get(spec.file) ?? null}
                          onHostGesture={trackGesture}
                          onTweaksRow={onTweaksRow}
                          onTweaksDirty={onTweaksDirty}
                          onOpenTweaks={onOpenTweaks && openTweaks}
                          canvasScaleRef={canvasScaleRef}
                          assets={assets}
                          doc={doc}
                          focused={isFocused}
                          editing={canEditCanvas && !isPlaying}
                          gripless={
                            hasMultiGroupSelection &&
                            isFocused &&
                            onSetMoveCommit != null &&
                            fullscreenFile == null
                          }
                          panelMounted={canFocusArtboard && isFocused && !isPlaying}
                          vectorEdit={armedTool === "vector"}
                          playing={isPlaying}
                          readOnly={!canEditCanvas || isPlaying}
                          frameArmed={frameArmed}
                          editable={editable}
                          onHandle={registerArtboardHandle}
                          onPreviewDropNotice={notifyPreviewDropNotice}
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
                          onGestureStream={handleGestureStream}
                          onTextEditState={handleTextEditState}
                          onTextEditEnded={keyboardController?.onTextEditEnded}
                          keyboardSkipsContent={canFocusArtboard && !isEntered}
                          onReadyGen={onArtboardReady}
                          dsVarNames={dsVarNames}
                          onDefinedVars={onDefinedVars}
                          onBlockedChange={handleBlockedChange}
                          onProblemsChange={onArtboardProblems}
                          routeForwardedKey={routeForwardedKey}
                          onDragEvent={handleDragEvent}
                          onBoxEvent={onBoxEvent}
                          onModifierKey={handleModifierKey}
                          onPanZoom={handlePanZoom}
                          onRepeatRefused={onRepeatRefused}
                          onPreviewClick={
                            canFocusArtboard || isPlaying ? undefined : selectArtboard
                          }
                          keyboardInert={isCanvasInert}
                          inertFrame={isMountDelayed}
                          pointerInert={
                            isCanvasInert ||
                            expandingFile === spec.file ||
                            (streamDragFile != null &&
                              streamDragFile !== spec.file) ||
                            (canEditCanvas &&
                              !isPlaying &&
                              armedTool === "note" &&
                              fullscreenFile == null) ||
                            (canEditCanvas &&
                              !(isFocused && (!isFrameless || isEntered)) &&
                              !isPlaying &&
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
                          onOpenFile={onOpenFile && openFile}
                          onPasteImages={pasteImages}
                          onDropVideos={dropVideos}
                          onPointerPresence={handlePointerPresence}
                          onPointerAt={handlePointerAt}
                          artboardSettings={
                            isFocused ? artboardSettings : undefined
                          }
                          canvasObject={isFocused ? canvasObject : null}
                          outlineArtboards={isFocused ? outlineWithComponents : null}
                          presentPropsTick={presentPropsTick}
                          onPresentPropsHandled={onPresentPropsHandled}
                          placeRequest={
                            placeRequest?.file === spec.file
                              ? placeRequest
                              : null
                          }
                          onPlaceHandled={onPlaceHandled}
                        />
                        {props.guidesVisible &&
                          spec.guides !== undefined &&
                          fullscreenFile == null &&
                          !isPlaying && (isLive ? (<ArtboardLayoutGuides
                              guides={spec.guides}
                              w={spec.w}
                              h={spec.h}
                            />) : (<CanvasRectVisibility
                              rect={spec}
                              surfaceRef={canvasRootRef}
                            >
                              {(isVisible?: Dynamic): Dynamic =>
                                isVisible && spec.guides ? (
                                  <ArtboardLayoutGuides
                                    guides={spec.guides}
                                    w={spec.w}
                                    h={spec.h}
                                  />
                                ) : null
                              }
                            </CanvasRectVisibility>))}
                        {(!isLive || isMountDelayed) &&
                          !blockedFiles.has(spec.file) && (<CanvasRectVisibility
                              rect={spec}
                              surfaceRef={canvasRootRef}
                            >
                              {(isVisible?: Dynamic): Dynamic => (
                                <div
                                  data-testid={
                                    (isLive
                                      ? "mega-artboard-open-"
                                      : "mega-artboard-offloaded-") +
                                    spec.file
                                  }
                                  ref={
                                    isMountDelayed
                                      ? preventTouchScroll
                                      : undefined
                                  }
                                  role={"button"}
                                  tabIndex={canFocusArtboard ? -1 : 0}
                                  inert={
                                    (!isVisible && !isMountDelayed) || isCanvasInert
                                      ? true
                                      : undefined
                                  }
                                  aria-label={
                                    (isMountDelayed ? uiMessage("canvas.interactionLayer.openArtboard") : uiMessage("canvas.interactionLayer.loadArtboard2")) + displayTitle
                                  }
                                  className={
                                    "absolute inset-0 z-10 flex cursor-pointer items-center justify-center overflow-hidden select-none"
                                  }
                                  style={
                                    isLive
                                      ? undefined
                                      : isPhoneCanvas
                                        ? phoneHeaderTheme
                                          ? {
                                              backgroundColor: phoneHeaderTheme.bg,
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
                                      armedToolRef.current === "note" ||
                                      armedToolRef.current === "frame" ||
                                      supportsClickPlacement(
                                        armedToolRef.current,
                                      )
                                    )
                                      return;
                                    let shiftKey: Dynamic = event.shiftKey;
                                    watchPointerRelease(
                                      event.nativeEvent,
                                      (): Dynamic =>
                                        activateArtboardPreview(spec.file, shiftKey),
                                    );
                                  }}
                                  {...buttonKeyboardActivation(
                                    (event?: Dynamic): Dynamic =>
                                      activateArtboardPreview(
                                        spec.file,
                                        event.shiftKey || event.metaKey,
                                      ),
                                  )}
                                  onClick={(event?: Dynamic): Dynamic => {
                                    event.detail === 0 &&
                                      activateArtboardPreview(
                                        spec.file,
                                        event.shiftKey || event.metaKey,
                                      );
                                  }}
                                >
                                  {isPhoneCanvas && !isLive && !isFrameless && (<RunWhenSeen
                                      seen={isVisible}
                                      then={(): Dynamic => loadHeaderTheme(spec.file)}
                                    />)}
                                  {!isLive && (<ViewportScaleThreshold
                                      min={
                                        isPhoneCanvas
                                          ? Math.max(
                                              canvasHandleLabelSize
                                                .w / spec.w,
                                              canvasHandleLabelSize
                                                .h / spec.h,
                                            )
                                          : 0
                                      }
                                    >
                                      {(isScaledUp?: Dynamic): Dynamic =>
                                        isScaledUp && (
                                          <span
                                            ref={camera.stamp}
                                            className={joinClassNames(
                                              "shrink-0 whitespace-nowrap px-2.5 py-1 text-xs",
                                              !phoneHeaderTheme && "text-secondary",
                                              isPhoneCanvas
                                                ? "opacity-50"
                                                : "opacity-[0.15]",
                                            )}
                                            style={{
                                              transform:
                                                "scale(var(--mega-inv-scale))",
                                              ...(phoneHeaderTheme
                                                ? {
                                                    color: phoneHeaderTheme.lightInk
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
                                              {isMountDelayed ? (uiMessage("canvas.interactionLayer.tapToOpen")) : (uiMessage("canvas.interactionLayer.tapToLoad"))}
                                            </span>
                                          </span>
                                        )
                                      }
                                    </ViewportScaleThreshold>)}
                                </div>
                              )}
                            </CanvasRectVisibility>)}
                        {shouldShowFocusOverlay && (<div
                            data-mega-chrome={chromeKind}
                            data-testid={
                              artboardOverlayIdPrefixes[chromeKind] +
                              spec.file
                            }
                            className={joinClassNames(
                              "absolute inset-0 z-20",
                              (isFrameless || isSelected || usesSetOverlay) && canEditCanvas
                                ? "cursor-grab"
                                : "cursor-pointer",
                              (armedTool === "note" ||
                                supportsClickPlacement(
                                  armedTool,
                                )) &&
                                fullscreenFile == null &&
                                "pointer-events-none",
                              shouldPassFileDropThroughOverlay({
                                chrome: chromeKind,
                                filesDrag: hasPressedSinceSelection,
                              }) && "pointer-events-none",
                            )}
                            {...(isFrameless
                              ? {
                                  "data-mega-piece": "",
                                  role: "button",
                                  tabIndex: 0,
                                  inert: isCanvasInert ? true : undefined,
                                  "aria-label": displayTitle,
                                  "aria-pressed": isSelected,
                                  ...buttonKeyboardActivation(
                                    (event?: Dynamic): Dynamic => {
                                      event.key === "Enter" &&
                                      isCanvasInteractive &&
                                      canEditCanvas &&
                                      !event.shiftKey &&
                                      !event.metaKey
                                        ? onEnterPiece?.(
                                            spec.file,
                                            spec.w / 2,
                                            spec.h / 2,
                                          )
                                        : selectArtboard(
                                            spec.file,
                                            event.shiftKey || event.metaKey,
                                          );
                                    },
                                  ),
                                  onClick: (event?: Dynamic): Dynamic => {
                                    event.detail === 0 &&
                                      (isCanvasInteractive &&
                                      canEditCanvas &&
                                      !event.shiftKey &&
                                      !event.metaKey
                                        ? onEnterPiece?.(
                                            spec.file,
                                            spec.w / 2,
                                            spec.h / 2,
                                          )
                                        : selectArtboard(
                                            spec.file,
                                            event.shiftKey || event.metaKey,
                                          ));
                                  },
                                  onDoubleClick: (
                                    event?: Dynamic,
                                  ): Dynamic => {
                                    canEditCanvas &&
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
                                      !canEditCanvas ||
                                      isTouchPointer ||
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
                                      coverPressRef.current ?? Promise.resolve()
                                    ).then(
                                      (): Dynamic =>
                                        onFaceDoubleClick(spec.file, state),
                                    );
                                  },
                                })}
                            onPointerDown={(event?: Dynamic): Dynamic => {
                              cancelHoverCurtain();
                              if (event.button !== 0) return;
                              let shiftKey: Dynamic = event.shiftKey;
                              if (isFrameless) {
                                if (
                                  isTouchSelectionStart(
                                    event.pointerType,
                                    isSelected,
                                  )
                                ) {
                                  watchPointerRelease(
                                    event.nativeEvent,
                                    (): Dynamic =>
                                      selectArtboard(spec.file, shiftKey),
                                  );
                                  return;
                                }
                                if (
                                  onSetMoveCommit &&
                                  event.pointerType !== "touch" &&
                                  !shiftKey &&
                                  !event.altKey &&
                                  hasBoardSelection(
                                    selectionRef.current,
                                    {
                                      file: spec.file,
                                    },
                                  ) &&
                                  hasSelectedElements()
                                ) {
                                  beginElementMove({
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
                                      selectArtboard(spec.file, false),
                                    armWait: null,
                                    heldCover: null,
                                  });
                                  return;
                                }
                                let pressDecision: Dynamic = selectionPointerDownDecision(
                                  selectionRef.current,
                                  {
                                    file: spec.file,
                                  },
                                  shiftKey,
                                );
                                pressDecision.selectNow &&
                                  selectArtboard(spec.file, shiftKey);
                                beginBoardDragBound(
                                  event,
                                  {
                                    file: spec.file,
                                  },
                                  spec,
                                  pressDecision.carry,
                                  pressDecision.click,
                                );
                                return;
                              }
                              let facePointerAction: Dynamic = canvasFacePointerAction({
                                  editing: canEditCanvas,
                                  pointerType: event.pointerType,
                                  tool: armedTool,
                                  fullscreen: fullscreenFile != null,
                                  faceOverlay: usesFaceOverlay,
                                }),
                                isDeepKey: Dynamic = isPrimaryModifierEvent(event),
                                state: Dynamic = {
                                  x: event.nativeEvent.offsetX,
                                  y: event.nativeEvent.offsetY,
                                },
                                pressFace: Dynamic = (
                                  isStill?: Dynamic,
                                ): Dynamic => {
                                  facePointerAction === "pick" &&
                                  !(usesSetOverlay && event.pointerType === "touch")
                                    ? pressArtboardCoverBound(event, spec, {
                                        toggle: shiftKey,
                                        deepKey: isDeepKey,
                                        still: isStill,
                                        face: usesFaceOverlay,
                                        kind: usesFaceOverlay
                                          ? "face"
                                          : usesSetOverlay
                                            ? "set"
                                            : "focus",
                                        at: state,
                                      })
                                    : facePointerAction === "leave"
                                      ? selectArtboard(spec.file, true)
                                      : (selectArtboard(spec.file, shiftKey),
                                        shiftKey || onFocus(spec.file));
                                };
                              if (event.pointerType === "touch") {
                                watchPointerRelease(
                                  event.nativeEvent,
                                  (): Dynamic => pressFace(true),
                                );
                                return;
                              }
                              if (
                                canEditCanvas &&
                                isSelected &&
                                !shiftKey &&
                                !event.altKey &&
                                !isDeepKey &&
                                fullscreenFile == null
                              ) {
                                if (onSetMoveCommit && hasSelectedElements()) {
                                  beginElementMove({
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
                                      pressFace(true),
                                    armWait: null,
                                    heldCover: null,
                                  });
                                  return;
                                }
                                dragReleaseRef.current = (): Dynamic =>
                                  pressFace(true);
                                beginBoardDragBound(
                                  event,
                                  {
                                    file: spec.file,
                                  },
                                  spec,
                                  selectionRef.current,
                                  null,
                                );
                                return;
                              }
                              if (
                                event.altKey &&
                                !shiftKey &&
                                !usesSetOverlay &&
                                onDuplicateObjects &&
                                fullscreenFile == null
                              ) {
                                let altPressDecision: Dynamic = selectionPointerDownDecision(
                                  selectionRef.current,
                                  {
                                    file: spec.file,
                                  },
                                  false,
                                );
                                altPressDecision.selectNow &&
                                  selectArtboard(spec.file, false);
                                beginBoardDragBound(
                                  event,
                                  {
                                    file: spec.file,
                                  },
                                  spec,
                                  altPressDecision.carry,
                                  altPressDecision.click,
                                );
                                return;
                              }
                              pressFace(false);
                            }}
                            onPointerMove={(event?: Dynamic): Dynamic => {
                              updateBoardDragBound(event, false);
                              isFrameless || scheduleHoverCurtain(spec.file, event);
                            }}
                            onPointerUp={(event?: Dynamic): Dynamic => {
                              let [dragSession, releaseHandler]: Dynamic = [
                                dragSessionRef.current,
                                dragReleaseRef.current,
                              ];
                              dragReleaseRef.current = null;
                              updateBoardDragBound(event, true);
                              releaseHandler &&
                                dragSession &&
                                dragSession.pointerId === event.pointerId &&
                                !dragSession.live &&
                                releaseHandler();
                            }}
                            onPointerCancel={(event?: Dynamic): Dynamic => {
                              dragReleaseRef.current = null;
                              endBoardDragForEvent(event);
                            }}
                            onPointerLeave={cancelHoverCurtain}
                          />)}
                        {hasCoverOverlay && (<PendingArtboardFace
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
          {fullscreenFile == null && (((...args: Dynamic[]): Dynamic => (renderCanvasObjects as Dynamic)({ get armedTool() { return armedTool; }, get callback27() { return cropAnnotationFrame; }, get callback28() { return beginImageCrop; }, get callback30() { return trackPointerGesture; }, get callback34() { return updateAnnotation; }, get callback45() { return buildSnapReferenceLines; }, get callback5() { return registerTransformTarget; }, get callback55() { return buildObjectPressHandlersBound; }, get callback56() { return enterVectorEdit; }, get callback6() { return isAnnotationUnder; }, get camera() { return camera; }, get entry() { return entry; }, get manifest() { return manifest; }, get selectedNotes() { return selectedNotes; }, get value11() { return setMeasuredNoteSizes; }, get value113() { return setQuickActionsState; }, get value114() { return cropSession; }, get value119() { return forceRender; }, get value126() { return isCanvasInert; }, get value134() { return trackGesture; }, get value18() { return canEditCanvas; }, get value181() { return resolvePreviewUrl; }, get value232() { return isMultiSelection; }, get value35() { return usesCameraPortal; }, get value46() { return chromePortalHost; }, get value50() { return objectsPortalHost; }, get value59() { return singleSelectedNoteId; }, get value70() { return setSnapGuides; } }, ...args))())}
          {artboardNotice &&
            fullscreenFile == null && (manifest.artboards.map((artboard?: Dynamic): Dynamic => {
              let notice: Dynamic = artboardNotice(artboard.file);
              return (
                notice != null &&
                wrapInCameraPortal(
                  uiMessage("canvas.interactionLayer.notice") + artboard.file,
                  (() => {
                    const NoticeAnchorComponent = ArtboardNoticeAnchor;
                    const noticeAnchorProps = {
                      x: artboard.x,
                      y: artboard.y + artboard.h,
                      w: artboard.w,
                      inert: isCanvasInert,
                      stamp: camera.stamp,
                      children: notice,
                    } as const;
                    const noticeKey = artboard.file;
                    return <NoticeAnchorComponent key={noticeKey} {...noticeAnchorProps} />;
                  })(),
                )
              );
            }))}
          {selectionBox &&
            fullscreenFile == null && (wrapInCameraPortal(
              "group-box",
              <div
                data-mega-chrome={"group-resize"}
                data-testid={elementGroupBox ? "mega-set-box" : "mega-group-box"}
                className={"pointer-events-none absolute"}
                style={{
                  left: selectionBox.x,
                  top: selectionBox.y,
                  width: selectionBox.w,
                  height: selectionBox.h,
                }}
              >
                <ViewportScale>
                  {(viewportScale?: Dynamic): Dynamic => (
                    <SelectionRing
                      frame={{
                        x: 0,
                        y: 0,
                        w: selectionBox.w,
                        h: selectionBox.h,
                      }}
                      scale={viewportScale}
                      rotation={
                        selectionRotation ? (selectionRotation * Math.PI) / 180 : undefined
                      }
                      angleLabel={
                        groupTransformPreview?.turning
                          ? String(groupTransformPreview.deg) + "\xB0"
                          : undefined
                      }
                      grips={isResizeDisabled ? "none" : "corners"}
                      edgeStrips={!isRotatedSelection}
                      onResizeStart={beginGroupResize}
                      onRotateStart={
                        !isResizeDisabled && isNotesOnlySelection ? beginGroupRotate : undefined
                      }
                      rotateDisabledReason={isResizeDisabled ? undefined : resizeDisabledReason}
                    />
                  )}
                </ViewportScale>
              </div>,
            ))}
          {cropSession &&
            cropAnnotation?.kind === "image" && (((...args: Dynamic[]): Dynamic => (renderImageCropEditor as Dynamic)({ get callback27() { return cropAnnotationFrame; }, get callback30() { return trackPointerGesture; }, get callback7() { return wrapInCameraPortal; }, get value114() { return cropSession; }, get value115() { return setCropSession; }, get value120() { return finishImageCrop; }, get value121() { return cropAnnotation; }, get value134() { return trackGesture; }, get value181() { return resolvePreviewUrl; } }, ...args))())}
          {notePlacement && armedTool === "note" && (<div
              data-testid={"mega-note-ghost"}
              aria-hidden={"true"}
              className={
                "pointer-events-none absolute z-30 rounded-[12px] border border-dashed border-black/25 opacity-70"
              }
              style={{
                left: notePlacement.x,
                top: notePlacement.y,
                width: defaultNoteWidth,
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
          {frameDraft && (<div
              data-testid={"mega-pen-ghost"}
              className={"pointer-events-none contents"}
            >
              <CanvasShape_r
                spec={{
                  id: "pen-ghost",
                  kind: "pen",
                  ...frameDraft,
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
          {shapeDraft && shapeDraft.onCanvas && shapeDraft.tool !== "text" && (<div
              data-testid={"mega-place-ghost"}
              className={"pointer-events-none contents"}
            >
              <CanvasShape_r
                spec={placementGhostAnnotation(shapeDraft)}
                scale={entry.scale}
                editing={false}
                selected={false}
                objectPress={{}}
                onChange={(): Dynamic => {}}
                onGesture={(): Dynamic => {}}
                armWindowGestureEnd={(): Dynamic => {}}
              />
            </div>)}
          {shapeDraft && !(shapeDraft.onCanvas && shapeDraft.tool !== "text") && (<div
              data-testid={"mega-place-ghost"}
              className={joinClassNames(
                "pointer-events-none absolute z-30",
                !isLineDraft &&
                  "border-solid border-app-accent/80 bg-app-accent/10",
                shapeDraft.tool === "oval" && "rounded-full",
              )}
              style={{
                ...PickerRuntimeScriptTAppAccentConfig,
                borderWidth: isLineDraft ? 0 : 1.5 / entry.scale,
                left: shapeDraft.x,
                top: shapeDraft.y,
                width: Math.max(shapeDraft.w, isLineDraft ? 8 : 0),
                height: Math.max(shapeDraft.h, isLineDraft ? 8 : 0),
              }}
            >
              {isLineDraft && (<svg
                  width={"100%"}
                  height={"100%"}
                  viewBox={
                    "0 0 " +
                    Math.max(shapeDraft.w, 8) +
                    " " +
                    Math.max(shapeDraft.h, 8)
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
                        arrowHeadTipInset
                      }
                      refY={arrowHeadHalfHeight}
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
                    x1={lineDraftEndpoints?.x1}
                    y1={lineDraftEndpoints?.y1}
                    x2={lineDraftEndpoints?.x2}
                    y2={lineDraftEndpoints?.y2}
                    stroke={"var(--t-app-accent)"}
                    strokeWidth={4 / entry.scale}
                    strokeLinecap={"round"}
                    markerEnd={
                      shapeDraft.tool === "arrow"
                        ? "url(#mega-place-arrow-head)"
                        : undefined
                    }
                  />
                </svg>)}
            </div>)}
          {pointerGhost && (<div
              data-testid={"mega-draw-ghost"}
              className={
                "pointer-events-none absolute z-30 rounded-sm border-2 border-dashed border-app-accent/70 bg-app-accent/5"
              }
              style={{
                ...PickerRuntimeScriptTAppAccentConfig,
                left: pointerGhost.x,
                top: pointerGhost.y,
                width: pointerGhost.w,
                height: pointerGhost.h,
              }}
            />)}
          <PictureDropGhosts
            page={props.ghostPage ?? ""}
            artboards={
              focusedContentRect
                ? manifest.artboards.map(
                    (artboard?: Dynamic): Dynamic =>
                      artboard.file === focusedContentRect.file ? focusedContentRect : artboard,
                  )
                : manifest.artboards
            }
          />
          {props.pendingPictures != null &&
            props.pendingPictures.length > 0 && (wrapInCameraPortal(
              "pending",
              props.pendingPictures.map(
                (picture?: Dynamic): Dynamic =>
                  (() => {
                    const PendingPictureComponent = "div";
                    const pendingPictureProps = {
                      "data-testid": "mega-picture-pending",
                      "data-mega-chrome": "picture-pending",
                      className: "pointer-events-none absolute z-30",
                      style: {
                        left: picture.x,
                        top: picture.y,
                        width: picture.w,
                        height: picture.h,
                      },
                      children: [
                        <img
                          aria-hidden={"true"}
                          src={picture.url}
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
                    const pendingPictureKey = picture.key;
                    return <PendingPictureComponent key={pendingPictureKey} {...pendingPictureProps} />;
                  })(),
              ),
            ))}
          {dragPreviewItems != null &&
            dragPreviewItems.length > 0 && (wrapInCameraPortal(
              "dup-ghosts",
              dragPreviewItems.map(
                (previewItem?: Dynamic, index?: Dynamic): Dynamic => (
                  <div
                    key={index}
                    data-testid={"mega-dup-ghost"}
                    className={
                      "pointer-events-none absolute z-30 rounded-sm border-2 border-dashed border-app-accent/70 bg-app-accent/5"
                    }
                    style={{
                      ...PickerRuntimeScriptTAppAccentConfig,
                      left: previewItem.x,
                      top: previewItem.y,
                      width: previewItem.w,
                      height: previewItem.h,
                    }}
                  />
                ),
              ),
            ))}
          {props.worldOverlay}
        </div>
        {usesCameraPortal && (<div
            ref={setObjectsPortalHost}
            data-mega-lifted={"under"}
            aria-busy={props.turnBusy ? true : undefined}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {usesCameraPortal && (<div
            ref={setArtboardsPortalHost}
            data-mega-lifted={"tiles"}
            aria-busy={props.turnBusy ? true : undefined}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {usesCameraPortal && (<div
            ref={setChromePortalHost}
            data-mega-lifted={"notes"}
            aria-busy={props.turnBusy ? true : undefined}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {usesCameraPortal && (<div
            ref={setNotesPortalHost}
            data-mega-lifted={"chrome"}
            className={"absolute left-0 top-0 h-0 w-0"}
          />)}
        {isMarqueeActive && (<div
            ref={setMarqueeElement}
            data-testid={"mega-marquee"}
            aria-hidden={"true"}
            className={
              "pointer-events-none absolute z-30 bg-accent-muted outline-1 -outline-offset-1 outline-fill-accent"
            }
          />)}
        {snapGuides && fullscreenFile == null && (<CanvasSnapGuides guides={snapGuides} />)}
        {gapGuides && fullscreenFile == null && (<CanvasGapGuides gaps={gapGuides} />)}
        {dragToast && (<div
            data-mega-chrome={"drag-toast"}
            data-testid={"mega-drag-toast"}
            className={
              "pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-md border bg-page px-3 py-1.5 text-xs shadow-lg"
            }
          >
            {dragToast}
          </div>)}
        {dragGhost && dragGhostLayout && (<div
            data-mega-chrome={"drag-ghost"}
            data-testid={"mega-drag-ghost"}
            data-ghost={dragGhost.alt ? "copy" : "move"}
            aria-label={(dragGhost.alt ? uiMessage("canvas.interactionLayer.copy") : uiMessage("canvas.interactionLayer.move")) + dragGhost.label}
            className={"pointer-events-none absolute z-40"}
            style={{
              ...PickerRuntimeScriptTAppAccentConfig,
              left: dragGhostLayout.left,
              top: dragGhostLayout.top,
              width: dragGhostLayout.width,
              height: dragGhostLayout.height,
            }}
          >
            <div
              className={
                "absolute inset-0 overflow-hidden rounded-sm border border-dashed border-app-accent/70"
              }
            >
              {dragGhost.ghost != null && ((() => {
                  const GhostFrameComponent = PlacementGhostFrame;
                  const ghostFrameProps = {
                    ghost: dragGhost.ghost,
                    style: {
                      width: dragGhostLayout.box.w,
                      height: dragGhostLayout.box.h,
                      transform: `scale(${dragGhostLayout.s})`,
                      transformOrigin: "0 0",
                    },
                  } as const;
                  const ghostFrameKey = dragGhost.key;
                  return <GhostFrameComponent key={ghostFrameKey} {...ghostFrameProps} />;
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
        {dragGhost && !dragGhostLayout && (<div
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
        {isPanBlanketActive && fullscreenFile == null ? (<div
            data-mega-pan-blanket={""}
            data-testid={"mega-pan-overlay"}
            className={
              "absolute inset-0 z-[35] cursor-grab active:cursor-grabbing"
            }
          />) : (null)}
        {canEditCanvas &&
          !isGestureActive &&
          fullscreenFile == null &&
          singleSelectedNoteId != null &&
          !supportsClickPlacement(armedTool) &&
          armedTool !== "draw" && (((...args: Dynamic[]): Dynamic => (renderAnnotationQuickActions as Dynamic)({ get callback25() { return findPictureElements; }, get callback28() { return beginImageCrop; }, get callback34() { return updateAnnotation; }, get callback44() { return getAnnotationBox; }, get manifest() { return manifest; }, get onAnnotationCss() { return onAnnotationCss; }, get onDeleteAnnotation() { return onDeleteAnnotation; }, get onOpenPropsPanel() { return onOpenPropsPanel; }, get onReplaceAnnotationMedia() { return onReplaceAnnotationMedia; }, get value112() { return quickActionsState; }, get value114() { return cropSession; }, get value120() { return finishImageCrop; }, get value15() { return inspectorPosture; }, get value162() { return openPropsPanel; }, get value17() { return isInspectorSheet; }, get value18() { return canEditCanvas; }, get value181() { return resolvePreviewUrl; }, get value21() { return isPhoneCanvas; }, get value59() { return singleSelectedNoteId; }, get value8() { return composeNoteComment; } }, ...args))())}
        <R_useCanvasComments
          manifest={manifest}
          annBox={getAnnotationBox}
          annUnder={isAnnotationUnder}
          pageKey={pageKey}
          camera={camera}
          surfaceRef={canvasRootRef}
          handlesRef={artboardHandlesRef}
          fullscreenFile={fullscreenFile ?? null}
          fullscreenFrame={focusedContentRect}
          mdnHideCommentCards={playingFile != null}
          onReveal={onRevealComment}
          onController={(controller?: Dynamic): Dynamic => {
            setCommentsController(controller);
            onCommentsController?.(controller);
          }}
          onModeChange={(isCommenting?: Dynamic): Dynamic => {
            setIsCanvasInert(isCommenting);
            onCommenting?.(isCommenting);
            isCommenting && onClearSelection();
          }}
          armedTool={armedTool}
          spaceHeld={spaceHeld}
          keyHeld={
            isGestureActive || isGestureStreaming || streamDragFile != null || textEditState != null
          }
        />
        {canEditCanvas &&
          (!elementMenuHidden || crossFile != null) &&
          !isGestureActive &&
          !isGestureStreaming &&
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
            textEdit: textEditState,
            editDoor: quickProps?.onEditText != null,
            commentDoor: composeElementComment != null,
          }) && (((...args: Dynamic[]): Dynamic => (renderSelectionQuickActions as Dynamic)({ get crossFile() { return crossFile; }, get elementSelection() { return elementSelection; }, get flag() { return flag; }, get fullscreenBox() { return fullscreenBox; }, get fullscreenFile() { return fullscreenFile; }, get manifest() { return manifest; }, get quickProps() { return quickProps; }, get seed() { return seed; }, get tweakRows() { return tweakRows; }, get value140() { return textEditState; }, get value15() { return inspectorPosture; }, get value16() { return hasTouchToolbar; }, get value162() { return openPropsPanel; }, get value163() { return applyQuickProps; }, get value164() { return handleQuickGesture; }, get value165() { return handleTextFormat; }, get value166() { return editQuickText; }, get value167() { return replaceQuickImage; }, get value168() { return cropQuickImage; }, get value169() { return replaceQuickVideo; }, get value17() { return isInspectorSheet; }, get value170() { return findQuickVideo; }, get value171() { return linkQuickElement; }, get value172() { return composeElementCommentLatest; }, get value7() { return composeElementComment; } }, ...args))())}
      </div>
    </ViewportContext.Provider>
  );
}

/** 拖动画板或便签时随指针移动与松开运行：超过阈值后计算吸附与参考线、更新位置并检测放入目标，松开时提交到画布清单（或复制、放入画板），未移动则按单击处理选中与聚焦。 */
function updateBoardDrag(deps: { readonly callback16: Dynamic; readonly callback43: Dynamic; readonly callback44: Dynamic; readonly callback48: Dynamic; readonly camera: Dynamic; readonly manifest: Dynamic; readonly onDropObjectInto: Dynamic; readonly onDuplicateObjects: Dynamic; readonly onFocus: Dynamic; readonly onManifestChange: Dynamic; readonly onObjectHover: Dynamic; readonly onSelectObjects: Dynamic; readonly value134: Dynamic; readonly value18: Dynamic; readonly value67: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value74: Dynamic; readonly value9: Dynamic }, dragEvent?: Dynamic,
      isRelease?: Dynamic): Dynamic {
      let current: Dynamic = deps.value67.current;
      if (
        !current ||
        dragEvent.pointerId !== current.pointerId ||
        (current.setMove && dragEvent.fromSetMove !== true)
      )
        return;
      isRelease &&
        ((deps.value67.current = null),
        current.unlisten(),
        deps.value134("frame-drag", false));
      if (!current.live) {
        if (
          Math.hypot(
            dragEvent.clientX - current.startX,
            dragEvent.clientY - current.startY,
          ) <
          (dragEvent.pointerType === "touch"
            ? 10
            : canvasDragThresholdPixels)
        ) {
          isRelease &&
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
        clientX: dragEvent.clientX,
        clientY: dragEvent.clientY,
        metaKey: dragEvent.metaKey,
        ctrlKey: dragEvent.ctrlKey,
        pointerType: dragEvent.pointerType,
      };
      let isCopying: Dynamic = dragEvent.altKey && deps.onDuplicateObjects != null;
      isCopying !== current.alt &&
        (isCopying ? deps.callback48(current.set, current.notes) : deps.value74(null),
        (current.alt = isCopying));
      let { scale: zoomScale }: Dynamic = deps.camera.get(),
        {
          dx: deltaX,
          dy: deltaY,
          guides: snapGuideLines,
          gaps: snapGaps,
        }: Dynamic = snapCanvasDrag(
          (dragEvent.clientX - current.startX) / zoomScale,
          (dragEvent.clientY - current.startY) / zoomScale,
          current.snap
            ? {
                box: current.snap.box,
                lines: isCopying
                  ? current.snap.copyLines
                  : current.snap.moveLines,
                boxes: isCopying
                  ? current.snap.copyStill
                  : current.snap.moveStill,
              }
            : null,
          canvasTouchDragThresholdPixels / zoomScale,
          dragEvent.metaKey || dragEvent.ctrlKey,
        );
      deps.value70(isRelease || snapGuideLines.length === 0 ? null : snapGuideLines);
      deps.value72(isRelease || snapGaps.length === 0 ? null : snapGaps);
      let movedPosition: Dynamic = (item?: Dynamic): Dynamic => ({
          x: Math.round(item.x + deltaX),
          y: Math.round(item.y + deltaY),
        }),
        movedOrigin: Dynamic = movedPosition({
          x: current.origX,
          y: current.origY,
        }),
        hasMoved: Dynamic = !(
          movedOrigin.x === Math.round(current.origX) &&
          movedOrigin.y === Math.round(current.origY)
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
        if (!isRelease) {
          deps.value74([
            ...current.set.map(
              (item?: Dynamic): Dynamic => ({
                ...movedPosition(item),
                w: item.w,
                h: item.h,
              }),
            ),
            ...current.notes.map((item?: Dynamic): Dynamic => {
              let noteBounds: Dynamic = rotatedAnnotationBounds(
                item,
                deps.callback44(item),
              );
              return {
                ...noteBounds,
                ...movedPosition(noteBounds),
              };
            }),
          ]);
          return;
        }
        deps.value74(null);
        hasMoved
          ? deps.onDuplicateObjects?.(
              current.set.map(
                (item?: Dynamic): Dynamic => ({
                  file: item.file,
                  ...movedPosition(item),
                }),
              ),
              current.notes.map(
                (item?: Dynamic): Dynamic => ({
                  id: item.id,
                  ...movedPosition(item),
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
      if (isRelease && !hasMoved) {
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
        let dragObject: Dynamic = current.set[0]
            ? {
                file: current.set[0].file,
              }
            : {
                note: current.notes[0].id,
              },
          isFramelessOrNote: Dynamic =
            "note" in dragObject ||
            deps.manifest.artboards.find(
              (item?: Dynamic): Dynamic => item.file === dragObject.file,
            )?.frameless === true,
          surfaceRect: Dynamic = deps.value9.current?.getBoundingClientRect(),
          pointerPoint: Dynamic =
            isFramelessOrNote && surfaceRect
              ? deps.callback16(dragEvent.clientX, dragEvent.clientY, surfaceRect)
              : null;
        if (pointerPoint) {
          let containsPoint: Dynamic = (
            rect?: Dynamic,
            point?: Dynamic,
          ): Dynamic =>
            point.x >= rect.x &&
            point.x <= rect.x + rect.w &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.h;
          current.left ??= new Set();
          for (let artboardItem of deps.manifest.artboards as Dynamic)
            !artboardItem.frameless &&
              !containsPoint(artboardItem, pointerPoint) &&
              current.left.add(artboardItem.file);
          let dropCandidate: Dynamic =
              [...deps.manifest.artboards]
                .reverse()
                .find(
                  (item?: Dynamic): Dynamic =>
                    !item.frameless &&
                    item.file !==
                      ("file" in dragObject ? dragObject.file : "") &&
                    containsPoint(item, pointerPoint),
                ) ?? null,
            dropTarget: Dynamic =
              dropCandidate && current.left.has(dropCandidate.file) ? dropCandidate : null,
            objectBox: Dynamic = current.set[0]
              ? {
                  ...movedPosition(current.set[0]),
                  w: current.set[0].w,
                  h: current.set[0].h,
                }
              : ((): Dynamic => {
                  let draggedNote: Dynamic = current.notes[0],
                    draggedNoteBox: Dynamic = deps.callback44(draggedNote);
                  return {
                    ...movedPosition(draggedNoteBox),
                    w: draggedNoteBox.w,
                    h: draggedNoteBox.h,
                  };
                })();
          current.hoverKey ??= "obj-" + String(++canvasDragSequence);
          if (!isRelease)
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: dropTarget?.file ?? null,
              point: pointerPoint,
              object: dragObject,
              at: objectBox,
              ctrl: dragEvent.ctrlKey,
            });
          else if (dropTarget && deps.onDropObjectInto) {
            deps.callback48(current.set, current.notes);
            if (
              deps.onDropObjectInto({
                key: current.hoverKey,
                target: dropTarget.file,
                point: pointerPoint,
                object: dragObject,
                at: objectBox,
                ctrl: dragEvent.ctrlKey,
              })
            )
              return;
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: null,
              point: pointerPoint,
              object: dragObject,
              at: objectBox,
              ctrl: dragEvent.ctrlKey,
            });
          } else
            deps.onObjectHover?.({
              key: current.hoverKey,
              target: null,
              point: pointerPoint,
              object: dragObject,
              at: objectBox,
              ctrl: dragEvent.ctrlKey,
            });
        }
      }
      let artboardPositions: Dynamic = new Map(
          current.set.map(
            (item?: Dynamic): Dynamic => [
              item.file,
              preserveUnroundedDragPosition(
                item,
                movedPosition(item),
              ),
            ],
          ),
        ),
        notePositions: Dynamic = new Map(
          current.notes.map(
            (item?: Dynamic): Dynamic => [
              item.id,
              preserveUnroundedDragPosition(
                item,
                movedPosition(item),
              ),
            ],
          ),
        );
      deps.onManifestChange(
        deps.callback43(artboardPositions, notePositions),
        isRelease,
        isRelease
          ? {
              moved: new Map(
                current.set.map(
                  (item?: Dynamic): Dynamic => [
                    item.file,
                    {
                      x: item.x,
                      y: item.y,
                    },
                  ],
                ),
              ),
              movedNotes: new Map(
                current.notes.map(
                  (item?: Dynamic): Dynamic => [item.id, item],
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

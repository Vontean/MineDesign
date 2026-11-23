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
import { applyElementRectStyle, artboardOverlayIdPrefixes, canvasContextMenuTargetFromElement, inclusiveRectIntersects, isCanvasContextMenuPointer, objectsWithinCanvasMarquee, shouldBeginCanvasMarquee, shouldPassFileDropThroughOverlay } from "./hit-testing";
import { isTouchSelectionStart, prefersDragGesture, preventTouchScroll } from "./image-decode-scheduler";
import { bothTransformAxes, canvasDragThresholdPixels, freehandDrawingAnnotation, freehandSimplifyTolerance, jsx_Nn, placementGhostAnnotation } from "./interaction-geometry";
import { buttonKeyboardActivation } from "./keyboard-activation";
import { ArtboardLayoutGuides } from "./layout-guides";
import { CanvasNote } from "./note";
import { installCanvasPanZoom_binding } from "./pan-zoom";
import { clampPointToRect, insertionPointerMatchesContent, pointerCoordinates, resolveInsertionPointer, visibleArtboardCenter } from "./paste-placement";
import { artboardAboveDistances, artboardTitleHeight, PendingArtboardFace, PendingArtboards, PendingArtboardTitle, shouldHideArtboardTitle } from "./pending-artboards";
import { PictureDropGhosts, UploadingOverlay } from "./picture-drop-ghost";
import { PlacementGhostFrame } from "./placement-ghost";
import { isPreviewHighlighted, limitMountedPreviewPixels, maxInteractivePreviews, maxMountedPreviews, shouldDelayPreviewMount } from "./preview-mounting";
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
import { AccessibilityAnnouncementsResolvedValue, artboardPositionAnnouncement, PressReturnToGoIntoThisMessage } from "../editor/accessibility/announcements";
import { useInspectorPosture } from "../editor/chrome/inspector-sheet";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { unionRects } from "../editor/geometry/resize";
import { angleBetweenPoints, resizeRotatedRect, snapRotation } from "../editor/geometry/rotation";
import { rectangleSnapGuides } from "../editor/geometry/snapping";
import { useLatestCallback } from "../editor/hooks/latest-callback";
import { isDesktopMac } from "../editor/inspector/color-pick";
import { Fef3a2Value, NotesLinkEditingKind, NotesLinkEditingLh } from "../editor/notes/link-editing";
import { OutlineDcOutlineHandler } from "../editor/outline/dc-outline";
import { pickerCommentFor } from "../editor/picker/bridge";
import { pickerCursorCss, PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { SelectionActionsReplace } from "../editor/selection/actions";
import { boardSelectionItems, emptyBoardSelection } from "../editor/selection/canvas-selection";
import { getSessionStripScrollRow } from "../editor/session-strip/reveal";
import { SessionStrip } from "../editor/session-strip/session-strip";
import { useActiveCropElement } from "../editor/session/element-state";
import { shortenLineEnd, SvgArrowsConstant, arrowHeadCenterY as arrowHeadHalfHeight, arrowHeadTipInset, SvgArrowsCss } from "../editor/svg/arrows";
import { constrainLineAngle, SvgDrawingConstant } from "../editor/svg/drawing";
import { useTouchToolbar } from "../editor/toolbar/layout";
import { supportsClickPlacement } from "../editor/tools";
import { vectorToolStateReact as React } from "../editor/vector/tool-state";
import { artboardExportMenuItems } from "../export/artboard-menu";
import { canvasSnapReferenceLines, canvasSnapReferenceObjects } from "../geometry/canvas-snapping";
import { annotationTransformSnapshot, artboardTransformSnapshot, rotateAnnotationAboutPoint, selectionScaleLimits, selectionTransformMembers, selectionUniformScaleTransform, transformAnnotationBounds, transformArtboardBounds, transformTouchedProperties, translatedSelectionTransform } from "../geometry/selection-transform";
import { annotationBounds, annotationRotation, annotationVisibleBounds, artboardRadiusCss, artboardStackOrder, isShapeAnnotation, moveAnnotation, minImageDimension as unusedNoteConstant, defaultTextAnnotationWidth as defaultNoteWidth, replaceDesignArtboards, rotatedAnnotationBounds, updateAnnotationTextStyle, updateShapeColor } from "../platform/file-content";
import { CanvasObjectQuickActions, EditingNoteQuickActions, NoteQuickActions } from "../properties/annotation-quick-actions";
import { hasSelectionQuickActions } from "../properties/selection-quick-actions";
import { openCanvasContextMenu, pressCanvasBackground } from "./interaction-layer/canvas-events";
import { deriveArtboardSlot } from "./interaction-layer/artboard-slot";
import { composeSelectedElementComment } from "./interaction-layer/comments";
import { beginBoardDrag, beginHandedOffBoardDrag, canvasDragSequence, resetCanvasDragSequence, subscribeHostDragPointer, updateBoardDrag } from "./interaction-layer/drag";
import { useImageCropLifecycle, useImageCropState } from "./interaction-layer/image-crop";
import { useCanvasGestures } from "./interaction-layer/gestures";
import { beginCanvasMarquee } from "./interaction-layer/marquee";
import { placePastedImagesOnCanvas, resolvePointerInsertionPoint } from "./interaction-layer/paste";
import { buildObjectPressHandlers, pressArtboardCover, waitPointerReleaseTravel } from "./interaction-layer/press";
import { toggleArtboardDragCurtain, useArtboardHoverCurtain } from "./interaction-layer/hover-curtain";
import { useArtboardTitleHover } from "./interaction-layer/title-hover";
import { beginArtboardResize, commitArtboardRename, doubleClickArtboardFace, doubleClickFramelessFace, enterArtboardSlot, leaveArtboardSlot, pressArtboardFace, pressOffloadedPreview, pressRenameKey, releaseArtboardFace, startArtboardRename } from "./interaction-layer/artboard-slot-events";
import { pressArtboardTitle } from "./interaction-layer/title-press";
import { useLinkedArtboards } from "./interaction-layer/linked-artboards";
import { usePreviewMountLifecycle } from "./interaction-layer/preview-lifecycle";
import { renderAnnotationQuickActions, renderCanvasObjects, renderImageCropEditor, renderSelectionQuickActions } from "./interaction-layer/render";
import { beginSelectionGroupResize, runSelectionTransformGesture, trackHandleDragGesture } from "./interaction-layer/resize";

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
    artboardHandlesRef: Dynamic = (0, React.useRef)(new Map()),
    registerArtboardHandle: Dynamic = useLatestCallback(
      (file?: Dynamic, handle?: Dynamic, handleMeta?: Dynamic): Dynamic => {
        handle
          ? artboardHandlesRef.current.set(file, handle)
          : artboardHandlesRef.current.delete(file);
        onHandle(file, handle, handleMeta);
      },
    ),
    [commentsController, setCommentsController]: Dynamic = (0, React.useState)(
      null,
    ),
    commentsControllerRef: Dynamic = (0, React.useRef)(commentsController);
  commentsControllerRef.current = commentsController;
  let composeElementComment: Dynamic =
      commentsController && !crossFile && elementSelection?.tids?.length
        ? (...args: Dynamic[]): Dynamic => (composeSelectedElementComment as Dynamic)({ get clientToCanvasPoint() { return clientToCanvasPoint; }, get camera() { return camera; }, get elementSelection() { return elementSelection; }, get manifest() { return manifest; }, get artboardHandlesRef() { return artboardHandlesRef; }, get focusedContentRect() { return focusedContentRect; }, get commentsController() { return commentsController; }, get canvasRootRef() { return canvasRootRef; } }, ...args)
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
    canvasRootRef: Dynamic = (0, React.useRef)(null),
    [measuredNoteSizes, setMeasuredNoteSizes]: Dynamic = (0,
    React.useState)({}),
    getAnnotationWidth: Dynamic = (0, React.useCallback)(
      (source?: Dynamic): Dynamic =>
        isShapeAnnotation(source)
          ? annotationBounds(source).w
          : source.kind === "title1"
            ? (measuredNoteSizes[source.id]?.w ??
              NotesLinkEditingKind(source))
            : source.w,
      [measuredNoteSizes],
    ),
    artboardOrderRef: Dynamic = (0, React.useRef)([]),
    stackedArtboards: Dynamic = artboardStackOrder(
      artboardOrderRef.current,
      manifest.artboards,
    );
  (0, React.useLayoutEffect)((): Dynamic => {
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
    canEditCanvas: Dynamic = editing && fullscreenFile == null,
    canEditCanvasRef: Dynamic = (0, React.useRef)(canEditCanvas);
  canEditCanvasRef.current = canEditCanvas;
  let focusedContentRect: Dynamic = focusedArtboardContentRect(
      manifest.artboards,
      fullscreenFile,
      fullscreenBox,
    ),
    isPhoneCanvas: Dynamic = phone && fullscreenFile == null,
    isCanvasInteractive: Dynamic =
      canEditCanvas || (!isPhoneCanvas && inspect && fullscreenFile == null),
    isCanvasInteractiveRef: Dynamic = (0, React.useRef)(isCanvasInteractive);
  isCanvasInteractiveRef.current = isCanvasInteractive;
  let shouldDelayArtboardMount: Dynamic = (artboard?: Dynamic): Dynamic =>
      isPhoneCanvas &&
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
      isPhoneCanvas
        ? (limitMountedPreviewPixels(
            [...(livePins ?? [])],
            [canEditCanvas ? focusedFile : null, playingFile],
            manifest.artboards,
            props.phoneCanvasRunsNothing === true ? 0 : 15e5,
          ).find(
            (file?: Dynamic): Dynamic => livePins?.has(file) !== true,
          ) ?? null)
        : null,
    selectedTidsByFileRef: Dynamic = (0, React.useRef)(
      selectedTidsByFile,
    );
  selectedTidsByFileRef.current = selectedTidsByFile;
  let [isTouchPointer, setIsTouchPointer]: Dynamic = (0,
    React.useState)(false),
    coverPressRef: Dynamic = (0, React.useRef)(null),
    [hasPressedSinceSelection, setHasPressedSinceSelection]: Dynamic = (0,
    React.useState)(false);
  (0, React.useEffect)((): Dynamic => {
    setHasPressedSinceSelection(false);
  }, [selectedArtboards, selectedNotes, selectedTidsByFile]);
  const { cancelHoverCurtain, scheduleHoverCurtain } = useArtboardHoverCurtain({
    artboardHandlesRef, selectedTidsByFileRef, canEditCanvas, armedTool,
    focusedFile, fullscreenFile, playingFile, isTouchPointer, selectedArtboards,
  });
  let cameraRef: Dynamic = (0, React.useRef)(camera);
  cameraRef.current = camera;
  (0, React.useLayoutEffect)(
    (): Dynamic => camera.paint(),
  );
  let usesCameraPortal: Dynamic = phone,
    [artboardsPortalHost, setArtboardsPortalHost]: Dynamic = (0,
    React.useState)(null),
    portalPlacementsRef: Dynamic = (0, React.useRef)(new Map()),
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
    React.useState)((): Dynamic => new Map()),
    headerThemeRequestedRef: Dynamic = (0, React.useRef)(new Set()),
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
    React.useState)(null),
    expandingSeenFullscreenRef: Dynamic = (0, React.useRef)(false);
  (0, React.useEffect)((): Dynamic => {
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
  (0, React.useEffect)(
    (): Dynamic =>
      expandingFile == null
        ? undefined
        : preventTouchScroll(canvasRootRef.current),
    [expandingFile],
  );
  let [chromePortalHost, setChromePortalHost]: Dynamic = (0,
    React.useState)(null),
    transformTargetsRef: Dynamic = (0, React.useRef)(new Set()),
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
    React.useState)(null),
    annotationUnderCacheRef: Dynamic = (0, React.useRef)(new Map()),
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
    React.useState)(null),
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
  (0, React.useLayoutEffect)((): Dynamic => {
    usesCameraPortal && syncTransforms();
  });
  (0, React.useEffect)(
    (): Dynamic => (usesCameraPortal ? camera.subscribe(syncTransforms) : undefined),
    [camera, usesCameraPortal, syncTransforms],
  );
  let fullscreenFileRef: Dynamic = (0, React.useRef)(
    fullscreenFile,
  );
  fullscreenFileRef.current = fullscreenFile;
  let playingFileRef: Dynamic = (0, React.useRef)(
    playingFile,
  );
  playingFileRef.current = playingFile;
  let selectionRef: Dynamic = (0, React.useRef)({
    files: selectedArtboards,
    notes: selectedNotes,
  });
  selectionRef.current = {
    files: selectedArtboards,
    notes: selectedNotes,
  };
  let mountedPreviewsRef: Dynamic = (0, React.useRef)(
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
    onSelectObjectsRef: Dynamic = (0, React.useRef)(
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
  (0, React.useEffect)((): Dynamic => {
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
  let isWheelingRef: Dynamic = (0, React.useRef)(false),
    wheelStartRef: Dynamic = (0, React.useRef)(null),
    markWheelingRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    );
  (0, React.useEffect)((): Dynamic => {
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
  let onPanZoomRef: Dynamic = (0, React.useRef)(
    onPanZoom,
  );
  onPanZoomRef.current = onPanZoom;
  let handlePanZoom: Dynamic = (0, React.useCallback)(
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
    dragSessionRef: Dynamic = (0, React.useRef)(null),
    dragReleaseRef: Dynamic = (0, React.useRef)(null),
    [snapGuides, setSnapGuides]: Dynamic = (0,
    React.useState)(null),
    [gapGuides, setGapGuides]: Dynamic = (0,
    React.useState)(null),
    [dragPreviewItems, setDragPreviewItems]: Dynamic = (0,
    React.useState)(null),
    [notePlacement, setNotePlacement]: Dynamic = (0,
    React.useState)(null);
  (0, React.useEffect)((): Dynamic => {
    armedTool !== "note" && setNotePlacement(null);
  }, [armedTool]);
  let [pointerGhost, setPointerGhost]: Dynamic = (0,
    React.useState)(null),
    backgroundPressRef: Dynamic = (0, React.useRef)(false),
    [shapeDraft, setShapeDraft]: Dynamic = (0,
    React.useState)(null),
    [frameDraft, setFrameDraft]: Dynamic = (0,
    React.useState)(null),
    onAddPenRef: Dynamic = (0, React.useRef)(onAddPen);
  onAddPenRef.current = onAddPen;
  let armedToolRef: Dynamic = (0, React.useRef)(
    armedTool,
  );
  armedToolRef.current = armedTool;
  let [isMarqueeActive, setIsMarqueeActive]: Dynamic = (0,
    React.useState)(false),
    marqueeRectRef: Dynamic = (0, React.useRef)(null),
    marqueeElementRef: Dynamic = (0, React.useRef)(null),
    setMarqueeElement: Dynamic = (0, React.useCallback)(
      (element?: Dynamic): Dynamic => {
        marqueeElementRef.current = element;
        applyElementRectStyle(element, marqueeRectRef.current);
      },
      [],
    ),
    marqueeStateRef: Dynamic = (0, React.useRef)(null),
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
    waitPointerRelease: Dynamic = (...args: Dynamic[]): Dynamic => (waitPointerReleaseTravel as Dynamic)({ get canvasRootRef() { return canvasRootRef; } }, ...args),
    pressArtboardCoverBound: Dynamic = (...args: Dynamic[]): Dynamic => (pressArtboardCover as Dynamic)({ get waitPointerRelease() { return waitPointerRelease; }, get beginMarquee() { return beginMarquee; }, get beginBoardDragBound() { return beginBoardDragBound; }, get beginElementMove() { return beginElementMove; }, get onArmArtboard() { return onArmArtboard; }, get onCoverPick() { return onCoverPick; }, get onCoverPress() { return onCoverPress; }, get onElementPress() { return onElementPress; }, get onFocus() { return onFocus; }, get onPressIntent() { return onPressIntent; }, get onSelectObjects() { return onSelectObjects; }, get onSetMoveCommit() { return onSetMoveCommit; }, get pressIntentIs() { return pressIntentIs; }, get artboardHandlesRef() { return artboardHandlesRef; }, get setHeldCover() { return setHeldCover; }, get selectedTidsByFileRef() { return selectedTidsByFileRef; }, get coverPressRef() { return coverPressRef; }, get selectionRef() { return selectionRef; }, get selectArtboard() { return selectArtboard; }, get onMarqueeBeginRef() { return onMarqueeBeginRef; } }, ...args),
    onMarqueeBeginRef: Dynamic = (0, React.useRef)(
      onMarqueeBegin,
    );
  onMarqueeBeginRef.current = onMarqueeBegin;
  let beginMarquee: Dynamic = (...args: Dynamic[]): Dynamic => (beginCanvasMarquee as Dynamic)({ get clientToCanvasPoint() { return clientToCanvasPoint; }, get trackGesture() { return trackGesture; }, get manifestRef() { return manifestRef; }, get canEditCanvasRef() { return canEditCanvasRef; }, get artboardHandlesRef() { return artboardHandlesRef; }, get annotationBoxRef() { return annotationBoxRef; }, get cameraRef() { return cameraRef; }, get selectionRef() { return selectionRef; }, get onSelectObjectsRef() { return onSelectObjectsRef; }, get setIsMarqueeActive() { return setIsMarqueeActive; }, get marqueeRectRef() { return marqueeRectRef; }, get marqueeElementRef() { return marqueeElementRef; }, get canvasRootRef() { return canvasRootRef; }, get marqueeStateRef() { return marqueeStateRef; }, get onMarqueeBeginRef() { return onMarqueeBeginRef; } }, ...args),
    handleDragEvent: Dynamic = (0, React.useCallback)(
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
    onHostDragRef: Dynamic = (0, React.useRef)(onHostDrag);
  onHostDragRef.current = onHostDrag;
  (0, React.useEffect)((...args: Dynamic[]): Dynamic => (subscribeHostDragPointer as Dynamic)({ get clientToCanvasPoint() { return clientToCanvasPoint; }, get streamDragFile() { return streamDragFile; }, get canvasRootRef() { return canvasRootRef; }, get onHostDragRef() { return onHostDragRef; } }, ...args), [streamDragFile]);
  let isEventInsideTarget: Dynamic = (event?: Dynamic): Dynamic =>
      event.target instanceof Node &&
      event.currentTarget.contains(event.target),
    {
      held: spaceHeld,
      heldRef: spaceHeldRef,
      claimPan: claimSpacePan,
    }: Dynamic = useSpacePanKeyboard(),
    titleHover = useArtboardTitleHover(),
    { hoveredFile, setHoveredFile, titleHoverRef, trackTitleHover, isPointerAboveOtherTitle } = titleHover,
    [chromeSlots, setChromeSlots]: Dynamic = (0,
    React.useState)(new Map()),
    chromeSlotRefs: Dynamic = (0, React.useRef)(new Map()),
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
    React.useState)(null),
    renameCancelledRef: Dynamic = (0, React.useRef)(false),
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
    [deferredContextClick]: Dynamic = (0, React.useState)(
      (): Dynamic =>
        createDeferredPointerClick(
          (menuPoint?: Dynamic, menuTarget?: Dynamic): Dynamic =>
            handleCanvasMenu(menuTarget, menuPoint),
        ),
    ),
    scrimRightClickRef: Dynamic = (0, React.useRef)(null);
  (0, React.useEffect)((): Dynamic => {
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
  React.useState)(null);
  artboardPanel &&
    !manifest.artboards.some(
      (artboard?: Dynamic): Dynamic => artboard.file === artboardPanel.file,
    ) &&
    setArtboardPanel(null);
  let [quickActionsState, setQuickActionsState]: Dynamic = (0,
    React.useState)(null);
  let cropState = useImageCropState(),
    { cropSession, setCropSession } = cropState;
  let activeCropElement: Dynamic = useActiveCropElement(),
    [, setRenderTick]: Dynamic = (0, React.useState)(0),
    forceRender: Dynamic = (0, React.useCallback)(
      (): Dynamic => setRenderTick((count?: Dynamic): Dynamic => count + 1),
      [],
    );
  let { findPictureElements, cropAnnotationFrame, beginImageCrop, finishImageCrop, cropAnnotation } =
    useImageCropLifecycle({
      cropState, canvasRootRef, manifest,
      getCurrentManifest: (): Dynamic => manifestRef.current,
      updateAnnotation: (...args: Dynamic[]): Dynamic => updateAnnotation(...args),
      onSetMoveSay, canEditCanvas, singleSelectedNoteId, armedTool, fullscreenFile,
    });
  let {
    isGestureActive, isCanvasInert, setIsCanvasInert, isCanvasInertRef,
    activeGesturesRef, gestureStartRef, trackGesture, handleModifierKey,
    trackPointerGesture,
  }: Dynamic = useCanvasGestures({
    canvasRootRef, onHostGesturing, deferredContextClick,
    endBoardDrag: (pointerId?: Dynamic): Dynamic => endBoardDragRef.current(pointerId),
  });
  let isPanBlanketActive: Dynamic = spaceHeld || (armedTool === "hand" && !isCanvasInert);
  let [isGestureStreaming, setIsGestureStreaming]: Dynamic = (0,
    React.useState)(false),
    streamTimerRef: Dynamic = (0, React.useRef)(null),
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
  (0, React.useEffect)((): Dynamic => {
    setIsGestureStreaming(false);
    streamTimerRef.current != null &&
      (clearTimeout(streamTimerRef.current), (streamTimerRef.current = null));
  }, [focusedFile]);
  let [textEditState, setTextEditState]: Dynamic = (0,
    React.useState)(null),
    handleTextEditState: Dynamic = useLatestCallback(
      (file?: Dynamic, editState?: Dynamic): Dynamic => {
        file === focusedFile && setTextEditState(editState);
      },
    );
  (0, React.useEffect)((): Dynamic => {
    setTextEditState(null);
  }, [focusedFile]);
  (0, React.useLayoutEffect)((): Dynamic => {
    for (let stripElement of (canvasRootRef.current?.querySelectorAll(
      "[data-mega-selection-strip]",
    ) ?? []) as Dynamic)
      getSessionStripScrollRow(stripElement).scrollLeft = 0;
  }, [elementSelection?.identity, singleSelectedNoteId, textEditState != null, quickActionsState]);
  let hintId: Dynamic = (0, React.useId)(),
    keyboardInsideFile: Dynamic = keyboardController?.inside ?? null,
    shouldYieldEscape: Dynamic = useLatestCallback(
      (): Dynamic =>
        (armedTool != null && armedTool !== "select") || isGestureStreaming,
    );
  (0, React.useEffect)((): Dynamic => {
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
  let manifestRef: Dynamic = (0, React.useRef)(
    manifest,
  );
  manifestRef.current = manifest;
  let frameSizesRef: Dynamic = (0, React.useRef)(
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
    lastPointerRef: Dynamic = (0, React.useRef)(null),
    pendingInsertRef: Dynamic = (0, React.useRef)(null),
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
    stableSeedRef: Dynamic = (0, React.useRef)({
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
    resolveInsertionPoint: Dynamic = (0, React.useCallback)(
      (...args: Dynamic[]): Dynamic => (resolvePointerInsertionPoint as Dynamic)({ get isHandToolActive() { return isHandToolActive; }, get clientToCanvasPoint() { return clientToCanvasPoint; }, get manifestRef() { return manifestRef; }, get lastPointerRef() { return lastPointerRef; }, get focusedFileRef() { return focusedFileRef; }, get enteredFileRef() { return enteredFileRef; }, get fullscreenFileRef() { return fullscreenFileRef; }, get playingFileRef() { return playingFileRef; }, get canvasRootRef() { return canvasRootRef; }, get spaceHeldRef() { return spaceHeldRef; } }, ...args),
      [],
    ),
    getPastePoint: Dynamic = (0, React.useCallback)(
      (): Dynamic => resolveInsertionPoint("content"),
      [resolveInsertionPoint],
    ),
    getArtboardLandingPoint: Dynamic = (0,
    React.useCallback)((): Dynamic => {
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
  let pasteImages: Dynamic = (0, React.useCallback)(
      (...args: Dynamic[]): Dynamic => (placePastedImagesOnCanvas as Dynamic)({ get camera() { return camera; }, get onImageDrop() { return onImageDrop; }, get manifestRef() { return manifestRef; }, get getPastePoint() { return getPastePoint; }, get fullscreenFileRef() { return fullscreenFileRef; }, get selectionRef() { return selectionRef; }, get canvasRootRef() { return canvasRootRef; } }, ...args),
      [onImageDrop, getPastePoint, camera],
    ),
    dropVideos: Dynamic = (0, React.useCallback)(
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
    resolvePreviewUrl: Dynamic = (0, React.useCallback)(
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
    focusedFileRef: Dynamic = (0, React.useRef)(
      focusedFile,
    );
  focusedFileRef.current = focusedFile;
  let enteredFileRef: Dynamic = (0, React.useRef)(
    enteredFile,
  );
  enteredFileRef.current = enteredFile;
  let livePinsRef: Dynamic = (0, React.useRef)(
    livePins,
  );
  livePinsRef.current = livePins;
  let inUseFilesRef: Dynamic = (0, React.useRef)(
    inUseFiles,
  );
  inUseFilesRef.current = inUseFiles;
  let recentPreviewsRef: Dynamic = (0, React.useRef)([]),
    [maxInteractivePreviewCount]: Dynamic = (0, React.useState)(
      maxInteractivePreviews,
    ),
    [maxMountedPreviewCount]: Dynamic = (0, React.useState)(
      maxMountedPreviews,
    );
  let linkedArtboards = useLinkedArtboards(doc, headerThemeRequestedRef);
  let outlineWithComponents: Dynamic = (0, React.useMemo)(
      (): Dynamic =>
        outlineArtboards
          ? {
              ...outlineArtboards,
              components: linkedArtboards,
            }
          : null,
      [outlineArtboards, linkedArtboards],
    );
  let { mountedFiles, refreshMountedPreviews, touchRecentPreview } = usePreviewMountLifecycle({
    view: { camera, canvasRootRef, cameraRef, usesCameraPortal, isPhoneCanvas, phone, options: props },
    selection: { selectedArtboards, selectionRef, mountedPreviewsRef, isMarqueeActive, marqueeStateRef },
    files: { manifest, manifestRef, focusedFile, focusedFileRef, fullscreenFile, fullscreenFileRef, playingFile, playingFileRef, livePins, livePinsRef, inUseFiles, inUseFilesRef, recentPreviewsRef },
    interaction: { canEditCanvas, canEditCanvasRef, activeGesturesRef, isWheelingRef, wheelStartRef, gestureStartRef },
    limits: { maxInteractivePreviewCount, maxMountedPreviewCount },
  });
  let [blockedFiles, setBlockedFiles]: Dynamic = (0,
    React.useState)((): Dynamic => new Set()),
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
    annotationBoxRef: Dynamic = (0, React.useRef)(
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
    beginBoardDragBound: Dynamic = (...args: Dynamic[]): Dynamic => (beginBoardDrag as Dynamic)({ get trackPointerGesture() { return trackPointerGesture; }, get endBoardDrag() { return endBoardDrag; }, get manifest() { return manifest; }, get onDuplicateObjects() { return onDuplicateObjects; }, get trackGesture() { return trackGesture; }, get annotationBoxRef() { return annotationBoxRef; }, get endBoardDragRef() { return endBoardDragRef; }, get updateBoardDragRef() { return updateBoardDragRef; }, get dragSessionRef() { return dragSessionRef; } }, ...args),
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
    onObjectHoverRef: Dynamic = (0, React.useRef)(
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
    endBoardDragRef: Dynamic = (0, React.useRef)(
      endBoardDrag,
    );
  endBoardDragRef.current = endBoardDrag;
  let endBoardDragForEvent: Dynamic = (event?: Dynamic): Dynamic =>
    endBoardDrag(event.pointerId);
  (0, React.useEffect)((): Dynamic => {
    !canEditCanvas &&
      dragSessionRef.current &&
      endBoardDragRef.current(dragSessionRef.current.pointerId);
  }, [canEditCanvas]);
  let updateBoardDragBound: Dynamic = (...args: Dynamic[]): Dynamic => (updateBoardDrag as Dynamic)({ get clientToCanvasPoint() { return clientToCanvasPoint; }, get manifestWithDragPositions() { return manifestWithDragPositions; }, get getAnnotationBox() { return getAnnotationBox; }, get applyDragPositions() { return applyDragPositions; }, get camera() { return camera; }, get manifest() { return manifest; }, get onDropObjectInto() { return onDropObjectInto; }, get onDuplicateObjects() { return onDuplicateObjects; }, get onFocus() { return onFocus; }, get onManifestChange() { return onManifestChange; }, get onObjectHover() { return onObjectHover; }, get onSelectObjects() { return onSelectObjects; }, get trackGesture() { return trackGesture; }, get canEditCanvas() { return canEditCanvas; }, get dragSessionRef() { return dragSessionRef; }, get setSnapGuides() { return setSnapGuides; }, get setGapGuides() { return setGapGuides; }, get setDragPreviewItems() { return setDragPreviewItems; }, get canvasRootRef() { return canvasRootRef; } }, ...args),
    updateBoardDragRef: Dynamic = (0, React.useRef)(
      updateBoardDragBound,
    );
  updateBoardDragRef.current = updateBoardDragBound;
  let beginHandedOffBoardDragBound: Dynamic = (...args: Dynamic[]): Dynamic => (beginHandedOffBoardDrag as Dynamic)({ get manifestRef() { return manifestRef; }, get endBoardDragRef() { return endBoardDragRef; }, get dragSessionRef() { return dragSessionRef; } }, ...args),
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
    onSetMoveCommitRef: Dynamic = (0, React.useRef)(
      onSetMoveCommit,
    );
  onSetMoveCommitRef.current = onSetMoveCommit;
  let [heldCover, setHeldCover]: Dynamic = (0,
    React.useState)(null),
    onSetMoveSayRef: Dynamic = (0, React.useRef)(
      onSetMoveSay,
    );
  onSetMoveSayRef.current = onSetMoveSay;
  let [setMoveGhost, setSetMoveGhost]: Dynamic = (0,
    React.useState)(null),
    elementMoveSessionsRef: Dynamic = (0, React.useRef)(null),
    setMovePiecesRef: Dynamic = (0, React.useRef)(
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
    hasMultiGroupSelectionRef: Dynamic = (0, React.useRef)(hasMultiGroupSelection);
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
    buildObjectPressHandlersBound: Dynamic = (...args: Dynamic[]): Dynamic => (buildObjectPressHandlers as Dynamic)({ get beginBoardDragBound() { return beginBoardDragBound; }, get endBoardDragForEvent() { return endBoardDragForEvent; }, get updateBoardDragBound() { return updateBoardDragBound; }, get beginElementMove() { return beginElementMove; }, get hasSelectedElements() { return hasSelectedElements; }, get onSelectObjects() { return onSelectObjects; }, get onSetMoveCommit() { return onSetMoveCommit; }, get selectionRef() { return selectionRef; } }, ...args),
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
    trackHandleDragGestureBound: Dynamic = (...args: Dynamic[]): Dynamic => (trackHandleDragGesture as Dynamic)({ get trackPointerGesture() { return trackPointerGesture; }, get activeGesturesRef() { return activeGesturesRef; }, get trackGesture() { return trackGesture; }, get canEditCanvas() { return canEditCanvas; }, get canEditCanvasRef() { return canEditCanvasRef; } }, ...args),
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
    React.useState)(null),
    [groupSnapTransforms, setGroupSnapTransforms]: Dynamic = (0,
    React.useState)([]),
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
    selectionKeyRef: Dynamic = (0, React.useRef)(selectionKey);
  (0, React.useEffect)((): Dynamic => {
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
    runSelectionTransform: Dynamic = (...args: Dynamic[]): Dynamic => (runSelectionTransformGesture as Dynamic)({ get trackHandleDragGestureBound() { return trackHandleDragGestureBound; }, get onManifestChange() { return onManifestChange; }, get manifestRef() { return manifestRef; }, get selectedArtboardSpecs() { return selectedArtboardSpecs; }, get selectedNoteEntries() { return selectedNoteEntries; }, get setGroupTransformPreview() { return setGroupTransformPreview; }, get setGroupSnapTransforms() { return setGroupSnapTransforms; }, get selectionBox() { return selectionBox; }, get selectionRotation() { return selectionRotation; }, get setSnapGuides() { return setSnapGuides; } }, ...args),
    beginGroupResize: Dynamic = (...args: Dynamic[]): Dynamic => (beginSelectionGroupResize as Dynamic)({ get buildSnapReferenceLines() { return buildSnapReferenceLines; }, get runSelectionTransform() { return runSelectionTransform; }, get camera() { return camera; }, get selectedArtboards() { return selectedArtboards; }, get selectedNotes() { return selectedNotes; }, get selectedArtboardSpecs() { return selectedArtboardSpecs; }, get selectedNoteEntries() { return selectedNoteEntries; }, get selectionBox() { return selectionBox; }, get selectionRotation() { return selectionRotation; }, get isRotatedSelection() { return isRotatedSelection; }, get setSnapGuides() { return setSnapGuides; } }, ...args),
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
        onContextMenu={(...args: Dynamic[]): Dynamic => (openCanvasContextMenu as Dynamic)({ get isContextMenuPointerEvent() { return isContextMenuPointerEvent; }, get isEventInsideTarget() { return isEventInsideTarget; }, get onCanvasMenu() { return onCanvasMenu; }, get handleCanvasMenu() { return handleCanvasMenu; }, get deferredContextClick() { return deferredContextClick; }, get scrimRightClickRef() { return scrimRightClickRef; }, get isCanvasInertRef() { return isCanvasInertRef; }, get activeGesturesRef() { return activeGesturesRef; }, get fullscreenFileRef() { return fullscreenFileRef; } }, ...args)}
        onPointerDown={(...args: Dynamic[]): Dynamic => (pressCanvasBackground as Dynamic)({ get shouldPanFromTarget() { return shouldPanFromTarget; }, get isPanPointerEvent() { return isPanPointerEvent; }, get shouldStartMarquee() { return shouldStartMarquee; }, get clientToCanvasPoint() { return clientToCanvasPoint; }, get beginMarquee() { return beginMarquee; }, get isEventInsideTarget() { return isEventInsideTarget; }, get trackPointerGesture() { return trackPointerGesture; }, get camera() { return camera; }, get manifest() { return manifest; }, get onAddAnnotation() { return onAddAnnotation; }, get onAddPen() { return onAddPen; }, get onAddShape() { return onAddShape; }, get onClearSelection() { return onClearSelection; }, get onDrawArtboard() { return onDrawArtboard; }, get onPlaceBlocked() { return onPlaceBlocked; }, get onPlaceTool() { return onPlaceTool; }, get deferredContextClick() { return deferredContextClick; }, get isCanvasInertRef() { return isCanvasInertRef; }, get activeGesturesRef() { return activeGesturesRef; }, get trackGesture() { return trackGesture; }, get enteredFileRef() { return enteredFileRef; }, get canEditCanvasRef() { return canEditCanvasRef; }, get blockedFiles() { return blockedFiles; }, get fullscreenFileRef() { return fullscreenFileRef; }, get setPointerGhost() { return setPointerGhost; }, get backgroundPressRef() { return backgroundPressRef; }, get setShapeDraft() { return setShapeDraft; }, get setFrameDraft() { return setFrameDraft; }, get armedToolRef() { return armedToolRef; }, get spaceHeldRef() { return spaceHeldRef; } }, ...args)}
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
                const {
                  isFocused, isSelected, isFrameless, isEntered, isEmptyPieces, isKeyboardInside,
                  isComponent, displayTitle, isPlaying, usesFaceOverlay,
                  usesSetOverlay, chromeKind, isHeldCover, isMountDelayed, canFocusArtboard,
                  shouldShowFocusOverlay, aboveDistance, shouldHideTitle, isLive, phoneHeaderTheme,
                  hasCoverOverlay, noticeContent,
                }: Dynamic = deriveArtboardSlot({
                  spec, focusedFile, selectedArtboards, enteredFile, emptyPieces, keyboardInsideFile,
                  linkedArtboards, fullscreenFile,
                  playingFile, canEditCanvas, isTouchPointer, armedTool, armedEmpty,
                  hasSetMoveCommit: onSetMoveCommit != null, hasMultiGroupSelection, heldCover,
                  isCanvasInteractive, shouldDelayArtboardMount,
                  manifestArtboardCount: manifest.artboards.length,
                  getAboveDistance: (file: string): Dynamic =>
                    artboardAboveDistances(manifest.artboards).get(file),
                  isPhoneCanvas, phone, renamingFile,
                  tweaksOpenFile, hoveredFile, livePins, usesCameraPortal,
                  maxInteractivePreviewCount, mountedFiles, overBudgetPreviewFile,
                  artboardHeaderThemes, coverFiles: props.coverFiles, blockedFiles, artboardNotice,
                });
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
                    },
                    onPointerEnter: (event?: Dynamic): Dynamic => {
                      enterArtboardSlot(event, { spec, titleHoverRef, setHoveredFile, isPointerAboveOtherTitle });
                    },
                    onPointerLeave: (event?: Dynamic): Dynamic => {
                      leaveArtboardSlot(event, { spec, aboveDistance, isPointerAboveOtherTitle, trackTitleHover, setHoveredFile });
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
                            pressArtboardTitle(event, {
                              spec, renamingFile, isSelected, canFocusArtboard, isPlaying, artboardPicking,
                              selectionRef, onSetMoveCommit, onFocus, onSelectObjects, isEventInsideTarget,
                              selectArtboard, hasSelectedElements, beginElementMove, beginBoardDragBound,
                            });
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
                            startArtboardRename(event, {
                              spec, isEventInsideTarget, onRenameArtboard, canEditCanvas, renameCancelledRef,
                              isKeyboardInside, keyboardController, setRenamingFile,
                            });
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
                                pressRenameKey(event, { renameCancelledRef, setRenamingFile });
                              }}
                              onBlur={(event?: Dynamic): Dynamic => {
                                commitArtboardRename(event, { spec, renameCancelledRef, setRenamingFile, onRenameArtboard });
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
                                  beginArtboardResize(resizeHandle, pointerEvent, {
                                    spec, camera, manifestRef, onManifestChange, buildSnapReferenceLines,
                                    trackHandleDragGestureBound, setSnapGuides,
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
                          rowH={0}
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
                                  top: 0,
                                  width: fullscreenBox.w,
                                  height: fullscreenBox.h,
                                  ...PickerRuntimeScriptTAppAccentConfig,
                                }
                              : {
                                  top: 0,
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
                          migrated={false}
                          frameless={isFrameless}
                          onContentHull={onContentHull}
                          box={
                            fullscreenFile === spec.file && fullscreenBox
                              ? fullscreenBox
                              : stableFrameSize(spec)
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
                                  onPointerDown={(event?: Dynamic): Dynamic => {
                                    pressOffloadedPreview(event, {
                                      spec, armedToolRef, supportsClickPlacement, activateArtboardPreview,
                                    });
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
                                  onDoubleClick: (event?: Dynamic): Dynamic => {
                                    doubleClickFramelessFace(event, { spec, canEditCanvas, onEnterPiece });
                                  },
                                }
                              : {
                                  onDoubleClick: (event?: Dynamic): Dynamic => {
                                    doubleClickArtboardFace(event, {
                                      spec, onFaceDoubleClick, canEditCanvas, isTouchPointer, armedTool,
                                      fullscreenFile, coverPressRef,
                                    });
                                  },
                                })}
                            onPointerDown={(event?: Dynamic): Dynamic => {
                              pressArtboardFace(event, {
                                spec, isFrameless, isSelected, usesFaceOverlay, usesSetOverlay, canEditCanvas,
                                armedTool, fullscreenFile, onSetMoveCommit, onDuplicateObjects, onFocus,
                                selectionRef, dragReleaseRef, cancelHoverCurtain, hasSelectedElements,
                                beginElementMove, beginBoardDragBound, selectArtboard, pressArtboardCoverBound,
                              });
                            }}
                            onPointerMove={(event?: Dynamic): Dynamic => {
                              updateBoardDragBound(event, false);
                              isFrameless || scheduleHoverCurtain(spec.file, event);
                            }}
                            onPointerUp={(event?: Dynamic): Dynamic => {
                              releaseArtboardFace(event, { dragSessionRef, dragReleaseRef, updateBoardDragBound });
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
          {fullscreenFile == null && (((...args: Dynamic[]): Dynamic => (renderCanvasObjects as Dynamic)({ get armedTool() { return armedTool; }, get cropAnnotationFrame() { return cropAnnotationFrame; }, get beginImageCrop() { return beginImageCrop; }, get trackPointerGesture() { return trackPointerGesture; }, get updateAnnotation() { return updateAnnotation; }, get buildSnapReferenceLines() { return buildSnapReferenceLines; }, get registerTransformTarget() { return registerTransformTarget; }, get buildObjectPressHandlersBound() { return buildObjectPressHandlersBound; }, get enterVectorEdit() { return enterVectorEdit; }, get isAnnotationUnder() { return isAnnotationUnder; }, get camera() { return camera; }, get entry() { return entry; }, get manifest() { return manifest; }, get selectedNotes() { return selectedNotes; }, get setMeasuredNoteSizes() { return setMeasuredNoteSizes; }, get setQuickActionsState() { return setQuickActionsState; }, get cropSession() { return cropSession; }, get forceRender() { return forceRender; }, get isCanvasInert() { return isCanvasInert; }, get trackGesture() { return trackGesture; }, get canEditCanvas() { return canEditCanvas; }, get resolvePreviewUrl() { return resolvePreviewUrl; }, get isMultiSelection() { return isMultiSelection; }, get usesCameraPortal() { return usesCameraPortal; }, get chromePortalHost() { return chromePortalHost; }, get objectsPortalHost() { return objectsPortalHost; }, get singleSelectedNoteId() { return singleSelectedNoteId; }, get setSnapGuides() { return setSnapGuides; } }, ...args))())}
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
            cropAnnotation?.kind === "image" && (((...args: Dynamic[]): Dynamic => (renderImageCropEditor as Dynamic)({ get cropAnnotationFrame() { return cropAnnotationFrame; }, get trackPointerGesture() { return trackPointerGesture; }, get wrapInCameraPortal() { return wrapInCameraPortal; }, get cropSession() { return cropSession; }, get setCropSession() { return setCropSession; }, get finishImageCrop() { return finishImageCrop; }, get cropAnnotation() { return cropAnnotation; }, get trackGesture() { return trackGesture; }, get resolvePreviewUrl() { return resolvePreviewUrl; } }, ...args))())}
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
          armedTool !== "draw" && (((...args: Dynamic[]): Dynamic => (renderAnnotationQuickActions as Dynamic)({ get findPictureElements() { return findPictureElements; }, get beginImageCrop() { return beginImageCrop; }, get updateAnnotation() { return updateAnnotation; }, get getAnnotationBox() { return getAnnotationBox; }, get manifest() { return manifest; }, get onAnnotationCss() { return onAnnotationCss; }, get onDeleteAnnotation() { return onDeleteAnnotation; }, get onOpenPropsPanel() { return onOpenPropsPanel; }, get onReplaceAnnotationMedia() { return onReplaceAnnotationMedia; }, get quickActionsState() { return quickActionsState; }, get cropSession() { return cropSession; }, get finishImageCrop() { return finishImageCrop; }, get inspectorPosture() { return inspectorPosture; }, get openPropsPanel() { return openPropsPanel; }, get isInspectorSheet() { return isInspectorSheet; }, get canEditCanvas() { return canEditCanvas; }, get resolvePreviewUrl() { return resolvePreviewUrl; }, get isPhoneCanvas() { return isPhoneCanvas; }, get singleSelectedNoteId() { return singleSelectedNoteId; }, get composeNoteComment() { return composeNoteComment; } }, ...args))())}
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
          }) && (((...args: Dynamic[]): Dynamic => (renderSelectionQuickActions as Dynamic)({ get crossFile() { return crossFile; }, get elementSelection() { return elementSelection; }, get manifest() { return manifest; }, get quickProps() { return quickProps; }, get seed() { return seed; }, get textEditState() { return textEditState; }, get inspectorPosture() { return inspectorPosture; }, get hasTouchToolbar() { return hasTouchToolbar; }, get openPropsPanel() { return openPropsPanel; }, get applyQuickProps() { return applyQuickProps; }, get handleQuickGesture() { return handleQuickGesture; }, get handleTextFormat() { return handleTextFormat; }, get editQuickText() { return editQuickText; }, get replaceQuickImage() { return replaceQuickImage; }, get cropQuickImage() { return cropQuickImage; }, get replaceQuickVideo() { return replaceQuickVideo; }, get isInspectorSheet() { return isInspectorSheet; }, get findQuickVideo() { return findQuickVideo; }, get linkQuickElement() { return linkQuickElement; }, get composeElementCommentLatest() { return composeElementCommentLatest; }, get composeElementComment() { return composeElementComment; } }, ...args))())}
      </div>
    </ViewportContext.Provider>
  );
}

export {
  canvasDragSequence,
  CanvasInteractionLayer,
  toggleArtboardDragCurtain,
};
export function installCanvasInteractionLayer(): () => void {
  return () => {
    resetCanvasDragSequence();
  };
}

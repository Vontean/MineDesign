import { uiOperation } from '@minedesign/contracts/ui-value';
import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeDesignKeyboardBindings } from "../application/document-root";
import { CanvasImagePlacementError, imagePlacementRejectionReason, jsx_Gn, validateCanvasPlacedImage } from "../assets/image-placement";
import { annotationColor, CanvasAnnotationShapeStyleLineArrowPenConfig } from "./annotation-shape-style";
import { artboardTextSnapshotLimit } from "./content-snapshots";
import { createDesignContextPublisher } from "./context-publisher";
import { creationSequenceEnabled, DesignCreationCursor, useDesignCreationProgress } from "./creation-progress";
import { CanvasEmptyState } from "./empty-notice";
import { refreshDesktopRendering } from "./desktop-refresh";
import { useCanvasExportCommands } from "./design-canvas/export-commands";
import {
  InspectorPanelMount, InspectorPanelToggle, inspectorFocusRegion, useCanvasInspectorPanel,
  useHostedInspectorPanel, useInspectorEntryPoints, useInspectorPanelShortcut,
} from "./design-canvas/inspector-panel";
import { useArtboardManifestEdits, useCanvasArtboardSettings } from "./design-canvas/artboard-settings";
import { useCanvasArtboardFocus } from "./design-canvas/artboard-focus";
import { useCanvasCommandHolds, useCanvasCommandRouting } from "./design-canvas/commands";
import { useDesignContextReporting } from "./design-canvas/context-reporting";
import { useCanvasOutlineKeyboard } from "./design-canvas/outline-keyboard";
import { useCanvasManifest } from "./design-canvas/manifest";
import { useCanvasDocumentActivity } from "./design-canvas/document-activity";
import { useCanvasHistoryTransactions, useCanvasSessionHistory } from "./design-canvas/session-history";
import { CanvasInlineViewToolbar, useCanvasScaleSubscription, useCanvasViewToolbar } from "./design-canvas/view-toolbar";
import { useFrameSelection } from "./design-canvas/frame-selection";
import { useFramelessArtboardSizing } from "./design-canvas/frameless-sizing";
import { useCanvasPageNavigation } from "./design-canvas/page-navigation";
import { useCanvasPageMenu } from "./design-canvas/page-menu";
import { useCanvasAnnotationCommands } from "./design-canvas/annotation-commands";
import { saveCanvasLaunchView, useCanvasSave, useCanvasSaveOnExit } from "./design-canvas/save";
import { promptCanvasValue } from "./dialogs";
import { useCanvasArtboardProblems } from "./error-notices";
import { CanvasInteractionLayer } from "./interaction-layer";
import { useCanvasKeyboardFocus } from "./keyboard-focus";
import { keyboardNavigationMode } from "./keyboard-navigation";
import { applyCanvasManifestHistory, canvasHistoryAnnouncementMode, compatibleRestoredCanvasLaunch, filterSettingHistoryStep, repairCanvasLaunchAfterDeletion } from "./manifest-history";
import { groupNavigableArtboards, initialFocusedArtboard, prototypeFileFromPlaceFragment } from "./navigation";
import { assignImplicitFirstCanvasPage, isCanvasPageMatch, neighboringCanvasPageId, remainingCanvasPageObjects, restoreCanvasPageSpec, retargetCanvasPageHistory } from "./page-operations";
import { avoidPastedObjectCollisions, defaultPlacedImageSize, droppedImageLabel, droppedImageMarkup, droppedImagePlacement, insertBlankArtboardMarkup, pasteCascadeStep, pastedObjectsBounds, pastedObjectsOrigin, pointerCoordinates, safeDroppedImageAltText, visibleArtboardCenter } from "./paste-placement";
import { getPhoneCanvasStorage, phoneCanvasStorageKey, usePhoneCanvasVisibility, wasPhoneCanvasKilled } from "./phone-visibility";
import { classifyPlaceLink } from "./place-link";
import { distanceBetweenRects, isSmallTouchDevice, shouldDelayPreviewMount } from "./preview-mounting";
import { isInteractivePreviewTarget, withClosedPreview } from "./preview-navigation";
import { isArtboardInViewport, sameViewport, ViewportContext, ViewportScale } from "./viewport-store";
import { afterNextPaint, boardSelectionKey, canApplyTextEditHistory, canNavigateSelection, travelCommitTimeoutMs, CanvasWorkingStateContext, CanvasWorkingStateHandler, isTextEditHistoryKind, CanvasWorkingStateJoin, releaseGuardMs, CanvasWorkingStatePrint, CanvasWorkingStateReplace, CanvasWorkingStateWidth, createDropGhost, handleInlineUndoKey, imageHeaderDimensions, isSessionCancelMessage, isSvgFile, keyboardNudgeDelta, markDropPerformance, nudgeCanvasObjects, pngPhysicalDimensions, positionedVideoHtml, previewImageFile, rasterImageDimensions, reduceSessionCancellation, sameSelectedObjectFiles, sameSelectionStructure, selectionAfterElementEdits, selectionNavigationScope, sessionAllowsMutation, stepInlineHistory, updateTextEditHistoryCounts, uploadDesignFile, uploadDesignVideo, useCanvasWorkingState as R_useCanvasWorkingState, videoFileTitle } from "./working-state";
import { CanvasZoomControl } from "./zoom";
import { Button } from "../cds/button/button";
import { Icon } from "../cds/components/icon";
import { Surface } from "../cds/components/surface";
import { MenuMenuAssignValue } from "../cds/menu/menu";
import { createPresenceReporter, PeerCursors } from "../collaboration/peer-cursors";
import { usePresenceComposer as R_usePresenceComposer } from "../collaboration/presence-composer";
import { ArtboardPeerSelectionRings, CanvasPeerSelectionRings, createPeerSelectionStore, encodeArtboardSelectionPath, encodedElementPathPattern, normalizeSelectedArtboardPaths, useCanvasPeerSelections as R_useCanvasPeerSelections } from "../collaboration/selection-paths";
import { useUiText } from "../comments/feedback-panel";
import { createPageScrollStore, PageCommentSurface, pageCommentSurfaceKey } from "../comments/page-surfaces";
import { npm_useLocalStorage_QP } from "../dependencies";
import { mergeDesignSystemFileOverlay } from "../design-system/file-overlay";
import { getDesignSystemFiles } from "../design-system/published-files";
import { hasPendingFileOverlay } from "../design-system/type-declarations";
import { copiedAsPngMessage, copiedAsSvgMessage, conversionFailedMessage, exportStillRunningMessage, noWidthOrHeightMessage, previewStoppedReloadMessage, notVisibleMessage, AccessibilityAnnouncementsReadyUpdatedChangedConfig, AccessibilityAnnouncementsUndoRedoConfig, undoRedoPastTense, artboardNotSelectedAnnouncement, artboardResizeAnnouncement, artboardsDeletedAnnouncement, canvasSelectionKey, clipboardActionFailureMessage, clippedSvgCopyMessage, CutValue, DeletedValue, fitContentResultMessage, flipDirectionAnnouncement, ItsPageHasNothingToDrawMessage, ItsPictureCouldnTBeMadeTryMessage, missingCopiedImagesMessage, missingSvgImagesMessage, moveDirectionAnnouncement, NothingChangedThatStepNoLongerMessage, NothingSelectedMessage, objectsDeletedAnnouncement, pageDeletedAnnouncement, pageUndoFailureMessage, pendingUndoAnnouncement, pngCopyFailureMessage, reorderAnnouncement, selectionActionRefusalAnnouncement, summarizeChangedArtboards, svgCopyFailureMessage, undoTargetAnnouncement, zoomAnnouncement } from "../editor/accessibility/announcements";
import { announce } from "../editor/accessibility/announcer";
import { EditorMenu } from "../editor/chrome/context-menu";
import { useInspectorPosture } from "../editor/chrome/inspector-sheet";
import { blockingOverlaySelector } from "../editor/chrome/overlay-state";
import { DocumentSaveStatus } from "../editor/chrome/save-status";
import { reactChromeTheme as React } from "../editor/chrome/theme";
import { useToast } from "../editor/chrome/toast";
import { annotationClipboardEntries, annotationImageReferences, blankArtboardBody, ClipboardAnnotationsLimit } from "../editor/clipboard/annotations";
import { buildArtboardClipboard, ClipboardArtboardsLimit, ClipboardArtboardsResolvedValue, ClipboardArtboardsTest, isFontDataUrl, clipboardBlobAssets, parseArtboardClipboard } from "../editor/clipboard/artboards";
import { ClipboardAssetsHandler, clipboardPayloadUsage, parseClipboardAssets, resolveClipboardPictures } from "../editor/clipboard/assets";
import { ClipboardFileTransferPasted, ClipboardFileTransferRegistry, dataUrlToBlob, dataUrlToFontFile, fileDataUrl, preparePastedArtboardFiles, remapPastedAssetFiles } from "../editor/clipboard/file-transfer";
import { buildDcDocument, positionPastedHtml } from "../editor/clipboard/html-placement";
import { sanitizePastedHtml } from "../editor/clipboard/html-sanitization";
import { canDecodeRasterImage, isPlayableImage } from "../editor/clipboard/image-validation";
import { clipboardContainsFileNames, copyClipboardObject, writeClipboardObject } from "../editor/clipboard/native";
import { buildAnnotationPaste, ClipboardPastePlanningAnnotations, ClipboardPastePlanningHandler, ClipboardPastePlanningIsArray, normalizeAnnotationPasteOrigin, parseAnnotationPaste } from "../editor/clipboard/paste-planning";
import { parseAnnotationClipboard } from "../editor/clipboard/pictures";
import { allowsClipboardImages, pngDataUrlToBlob, supportsClipboardImages, writeClipboardPng } from "../editor/clipboard/png-copy";
import { afterClipboardSettled, clearClipboardBuffers, clipboardGeneration, clipboardObjectStamp, ClipboardStateIsArray, DesignArtboardsKey, getActiveClipboardSource, getAnnotationClipboard, getArtboardClipboard, getElementClipboard, isClipboardSettling, markConsumedClipboardStamp, mirrorArtboardClipboardStamp, readArtboardClipboard, readBoundedClipboardObject, rememberClipboardStamp, setArtboardClipboard, setElementClipboard, startClipboardMark } from "../editor/clipboard/state";
import { captureClipboardSvg, svgCopyErrorMessage, writeClipboardSvg } from "../editor/clipboard/svg-copy";
import { askTrustForCodePaste, ClipboardTrustDialogTitleMessageKeepCodeConfig } from "../editor/clipboard/trust-dialog";
import { createCurrentWorkingGeneration, createWorkingFileMap, useClipboardFeatureFlag } from "../editor/clipboard/working-files";
import { flipAnnotations, artboardFlipRefusalMessage, flipStillInProgressMessage, GeometryFlipAnnotationsWytKytYtConfig, imageFlipCss, PartOfTheSelectionCouldnTBeMessage } from "../editor/geometry/flip-annotations";
import { CouldnTFlipRightNowTryAgainMessage, FinishEditingThisDrawingSPointsToMessage, FlippingThisWayWouldnTChangeItMessage, finishCroppingToFlipMessage as finishCroppingBeforeFlipMessage, partialFlipMessage } from "../editor/geometry/flip-elements";
import { createElementEditId } from "../editor/geometry/snapping";
import { useLiveDismissalGuard } from "../editor/hooks/element-and-dismissal";
import { useLatestCallback } from "../editor/hooks/latest-callback";
import { normalizeAuthoredHtml } from "../editor/html/authoring";
import { fileDropPosition, pastedRootElementCount, wrapInlinePastedHtml } from "../editor/insert/drop-targets";
import { textToParagraphHtml } from "../editor/insert/targets";
import { DcEditorGuidesVisibleKey, editorToolbarId, InspectorOpenContext } from "../editor/inspector/context";
import { InspectorPropertySchemaItems } from "../editor/inspector/property-schema";
import { isContextMenuShortcut, KeyboardEditActionsCutCopyPasteConfig } from "../editor/keyboard/edit-actions";
import { focusedOutlineRow, isEditingInputTarget, isPropertyEditorTarget, McFindAttribute } from "../editor/keyboard/find";
import { imagePasteRefusal, isCanvasEnterAction } from "../editor/keyboard/paste";
import { isDuplicateShortcut, keyboardShortcutLabel } from "../editor/keyboard/shortcuts";
import { imageCropCss } from "../editor/media/crop-geometry";
import { isEditableComponentName } from "../editor/media/object-crop";
import { captureVideoPoster, isVideoFile, probeVideoFile, VideoMp4VideoWebmVideoQuicktimeMovValue, videoUploadFailureMessage, videoUploadRefusal } from "../editor/media/video-upload";
import { NotesBlocksHandler, parseNoteBlocks } from "../editor/notes/blocks";
import { ViewOnlyYouCanInspectThisMessage } from "../editor/outline/annotations";
import { CanTReadThisArtboardSFileAskMessage, OutlineGlyphsLabel, OutlineGlyphsTest } from "../editor/outline/glyphs";
import { suppressNativeContextMenu } from "../editor/outline/native-menu";
import { setPickerHostScale } from "../editor/picker/bridge";
import { registerHiddenPickerTag } from "../editor/picker/hidden-tags";
import { AnchoredDesignProperties } from "../editor/properties-panel";
import { selectionActionFailureMessage, SelectionActionsHelmetScHelmetPattern, SelectionActionsReplace } from "../editor/selection/actions";
import { boardSelectionCount, boardSelectionItems, canvasBoardSelection, canvasElementSelectionCount, emptyBoardSelection, emptyCanvasSelection, filterSelectedElements, isEmptyCanvasSelection, mergeCanvasSelection, reconcileSelectedElementIds, replaceSelectedElements, selectionFromArtboards, selectionFromBoards, selectionFromElements, setCanvasElementSelection, toggleCanvasElementIds, toggleCanvasSelection } from "../editor/selection/canvas-selection";
import { HostedEditor, selectedElementLocations } from "../editor/selection/host";
import { activeCropElement } from "../editor/session/element-state";
import { beginDeferredTextInput, finishDeferredTextInput } from "../editor/text/deferred-input";
import { hasBlockingEditorOverlay, hasHeldUndoOverlay, isCanvasTypingTarget } from "../editor/text/typing-target";
import { toolbarDensity, ToolbarDivider } from "../editor/toolbar/layout";
import { ToolbarPrimitivesComponent } from "../editor/toolbar/primitives";
import { ToolbarPublishControls } from "../editor/toolbar/publish-controls";
import { EditorToolbar } from "../editor/toolbar/toolbar";
import { DesignToolToolbar } from "../editor/tools";
import { useVectorToolReset } from "../editor/vector/tool-state";
import { reportExportBuilt } from "../export/analytics";
import { ExportCaptureViewportLimit, measureEmptyExportTail, measureExpandedContentHeight, measureFlowExportHeight, withCaptureViewport } from "../export/capture-viewport";
import { dataUrlToBytes } from "../export/capture-warnings";
import { captureExportArtboards, describeExportCaptureWarnings, drainArtboardExportCaptures, selectExportCaptureArtboard } from "../export/capture";
import { exportDeliveryEventName } from "../export/delivery";
import { DownloadsArenTAvailableToYouForMessage, saveThroughHost } from "../export/downloads";
import { exportFileName } from "../export/file-names";
import { ExportCancelled } from "../export/host-registry";
import { captureArtboardImage, exportArtboardImage } from "../export/image";
import { classifyExportFailure, classifyExportSaveOutcome } from "../export/outcomes";
import { exportHeightTolerance, minEmptyExportTail, imageCaptureScaleOptions, isFillPagedExport, resolveMeasuredExportHeight } from "../export/paper-and-scale";
import { collectPdfExportPages, pdfExportMessage, pdfExportWarnings } from "../export/pdf/orchestration";
import { artboardNeedsScaledDownExport, ExportPickerToolbar, initialExportPickedFiles, initialExportScale, interactiveExportDeadline } from "../export/picker";
import { designExportReadme, missingExportAssetSuffix } from "../export/readme";
import { createStoredZip } from "../export/stored-zip";
import { collectExportUploadedAssets, fetchExportAsset } from "../export/uploaded-assets";
import { clippedArtboardsMessage, emptyExportTailMessage, fontSubstitutionWarnings, formatArtboardNames, getArtboardCaptureMode, getArtboardCaptureOptions } from "../export/warnings";
import { FindBar } from "../find/bar";
import { annotationTransformSnapshot, artboardTransformSnapshot } from "../geometry/selection-transform";
import { fetchBlobAsset, getCachedBlobObjectUrl } from "../platform/blob-cache";
import { CdsIsland } from "../platform/cds-island";
import { isLoadingArtboardHtml, shouldStoreArtboardByReference } from "../platform/design-document-adapter";
import { useDesignSource } from "../platform/design-source";
import { isEmulator } from "../platform/emulator";
import { getAllFileReferencePaths, getExternalFileReferences, saveExternalFileReference } from "../platform/external-files";
import { awaitFeatureFlag } from "../platform/feature-flags";
import { annotationArrowHeads, annotationGeometry, annotationKindCategory, annotationRotation, annotationTextStyle, annotationVisibleBounds, artboardAppearanceProperties, blankDcDocument, canvasMetadataFile, createAnnotationId, designPageContents, designPageId, duplicateArtboardTitle, embedMemoryPrefix, fileCapFailureMessage, findArtboardByName, getDocumentFileCap, getEmbeddedPresence, isEmbedFrozen, isPreviewMessage, isShapeAnnotation, moveAnnotation, nextArtboardTitle, PlatformFileContentBackgroundBackgroundColorOpacityValues, maxTextAnnotationWidth, minAnnotationDimensionLimit, maxAnnotationDimensionLimit, minEmbeddedArtboardDimension, minFramelessArtboardDimension, maxCanvasCoordinate, minImageDimension, defaultArtboardWidth, defaultArtboardHeight, defaultTextAnnotationWidth, minTextAnnotationWidth, PlatformFileContentFilesValue, PlatformFileContentHas, PlatformFileContentKind, PlatformFileContentMaxW, defaultDocumentFileBytes, PlatformFileContentSlice, parseAnnotationImageUrl, parseAnnotationVideoUrl, PlatformFileContentTrim, PlatformFileContentWebpAvifPattern, ProjectValue, replaceDesignArtboards, replaceDesignPageContents, setEmbedSilencer, trackEmbeddedWrite, uniqueArtboardFile, uniqueElementArtboardTitle, updateAnnotationAlt, updateAnnotationArrowHeads, updateAnnotationCrop, updateAnnotationCss, updateAnnotationTextStyle, updateAnnotationVideo, validCoverArtboard } from "../platform/file-content";
import { PanelValue, useFrameSaveState } from "../platform/frame-host-bridge";
import { ChatColumnOverlayActionsSlotValue, frameAnalyticsReporter } from "../platform/health-and-analytics";
import { getCachedHostCapability } from "../platform/host-capabilities";
import { isImageFile } from "../platform/image-processing";
import { getAssetsCapability, isBlobAssetUrl } from "../platform/image-upload";
import { getCurrentUserProfile } from "../platform/user-capabilities";
import { normalizeProjectBlobPaths } from "../preview/blob-paths";
import { buildPreviewDocument, prepareExportDcDocument, evaluationOnlyDocumentHtml } from "../preview/build-document";
import { getLinkedProjectFiles, isProjectSourcePath } from "../preview/component-imports";
import { collectProjectDependencyFiles } from "../preview/dependency-graph";
import { createPreviewHandle } from "../preview/evaluation";
import { createLinkedFileScript, runtimeModuleBlobs, runtimeModuleUrls } from "../preview/module-cache";
import { stripPreviewProjectRoot } from "../preview/project-root";
import { deriveAnnotationSettings, flipAnnotationsWithHistory, replaceAnnotationMedia, replaceAnnotationPicture, setAnnotationBox, setAnnotationCss, setAnnotationTextStyle } from "./design-canvas/annotations";
import { addBlankArtboard, commitInteractionLayerChange, deleteBoardsAndNotes, duplicateArtboardFiles, duplicateBoardsAndNotes, duplicateSelectedBoards, nudgeBoardsWithHistory } from "./design-canvas/artboards";
import { createExternalPasteController } from "./design-canvas/external-paste";
import type { PastePoint } from "./design-canvas/external-paste-shared";
import { buildSystemClipboardPayload, copyBoardsToClipboard, pasteHtmlIntoArtboard, subscribeClipboardEvents } from "./design-canvas/clipboard";
import { revealCommentTarget } from "./design-canvas/comments";
import { useCanvasDragSession } from "./design-canvas/drag-session";
import { usePendingPictures } from "./design-canvas/pending-pictures";
import { commitElementMoveAcrossArtboards, commitPieceDragOntoCanvas } from "./design-canvas/drag";
import { pasteBoardsFromClipboard } from "./design-canvas/paste-boards";
import { placeDroppedImages, placeDroppedVideos } from "./design-canvas/drop";
import { useCanvasFind } from "./design-canvas/find";
import { useCanvasManifestHistory } from "./design-canvas/manifest-history-session";
import { buildHostedEditorCanvasApi } from "./design-canvas/host";
import { useCanvasKeyboardShortcuts, subscribeZoomShortcuts } from "./design-canvas/keyboard";
import { useCanvasPageActions, useCanvasPageControl } from "./design-canvas/pages";
import { subscribePlayModeKeys, subscribePreviewOpenMessages } from "./design-canvas/preview";
import {
  artboardFullscreenCamera,
  artboardIsNotExpandedFill,
  defaultCanvasCamera,
  useFullscreenPlaybackState,
  useFullscreenViewport,
  useInlinePlaybackControls,
  useInlinePlaybackEscape,
  useInlinePlaybackState,
} from "./design-canvas/playback";
import { CanvasPlayMenu, FullscreenPlaybackControls, FullscreenPlaybackHeading } from "./design-canvas/playback-toolbar";
import { createCanvasQuickProperties, useCanvasInspectorEdits } from "./design-canvas/inspector-actions";
import { useCanvasSelectionInspector } from "./design-canvas/selection-inspector";
import { useCanvasContextMenus } from "./design-canvas/context-menus";
import { buildOutlineArtboardRows, deleteSelectedElements, duplicateSelectedElements, flipSelectedObjects, navigateSelectionByKind, selectElementInArtboard, useReconcileCanvasSelection, useCanvasSelectionAnnouncements, useCanvasSelectionState } from "./design-canvas/selection";
import { useCanvasViewport, useCanvasViewportControls, useFrameViewportGestures } from "./design-canvas/viewport";
import { useCanvasLayerIndex } from "./design-canvas/layer-index";
import { useCanvasPlaceNavigation } from "./design-canvas/place-navigation";
import { installCanvasMessages, canvasNeedsPageMessage, fitArtboardsLabel, pageHasNoArtboardsMessage } from "./design-canvas/messages";
import { canvasSelectionsEqual, emptyCanvasFileSet, emptyCanvasSelectionFiles, installCanvasShared, noopCanvasSubscription, zeroCanvasRevision } from "./design-canvas/shared";

var MemoizedCanvasZoomControl: Dynamic;
var MemoizedCanvasSaveIndicator: Dynamic;
var CanvasSaveStatus: Dynamic;
var CanvasSaveKeyboardShortcut: Dynamic;
var artboardFrameReadyTimeoutMs: Dynamic;
var previewDropNoticeDurationMs: Dynamic;
var canvasExportSettleTimeoutMs: Dynamic;
var canvasExitExportWaitTimeoutMs: Dynamic;
var emptyCanvasOptions: Dynamic;
var emptyCanvasNoteSet: Dynamic;
var canvasPastePositionStep: Dynamic;
function useCanvasSaveState(
  document?: Dynamic,
  synced?: Dynamic,
  localDirty?: Dynamic,
): Dynamic {
  let [value, subscribeSave]: Dynamic = (0, React.useState)(
    document.saveState(),
  );
  (0, React.useEffect)(
    (): Dynamic => document.subscribeSave(subscribeSave),
    [document],
  );
  return (0, React.useMemo)(
    (): Dynamic =>
      localDirty && value.status === "ready"
        ? {
            status: "dirty",
            ...(synced
              ? {
                  get message() { return uiMessage("canvas.designCanvas.changesWaitingToSync"); },
                }
              : {}),
          }
        : value,
    [localDirty, synced, value],
  );
}
function runWhenConditionReady(
  condition?: Dynamic,
  onReady?: Dynamic,
  attempts: Dynamic = 100,
): Dynamic {
  if (condition()) {
    onReady();
    return;
  }
  attempts > 0 &&
    setTimeout(
      (): Dynamic => runWhenConditionReady(condition, onReady, attempts - 1),
      30,
    );
}
function DesignCanvas({
  filePath: filePath,
  assets: assets,
  doc: doc,
}: Dynamic): Dynamic {
  useUiLocale();
  let { showToast: showToast, hideToast: hideToast }: Dynamic = useToast(),
    phoneViewRef: Dynamic = (0, React.useRef)(null),
    textEditOpenRef: Dynamic = (0, React.useRef)(null),
    settleSessionRef: Dynamic = (0, React.useRef)(null),
    commitOpenTextEditRef: Dynamic = (0, React.useRef)(null),
    sessionFlushPendingRef: Dynamic = (0, React.useRef)(false);
  const {
    editable,
    supportsLoadState,
    saveState,
    localDirty,
    markLocalWrite,
    sessionsDirty,
    registerDirtySession,
    flushDirtySessions,
    installBeforeSave,
    saveCanvas,
  } = useCanvasSave({ doc, showToast, settleSessionRef });
  let editableRef = (0, React.useRef)(editable);
  editableRef.current = editable;
  let [mode, setMode]: Dynamic = (0, React.useState)(
    (): Dynamic => (editable ? "edit" : "preview"),
  );
  (0, React.useEffect)((): Dynamic => {
    editable && setMode("edit");
  }, [editable]);
  const {
    open: inspectorOpen,
    setOpen: setInspectorOpen,
    toggle: toggleInspector,
  } = useCanvasInspectorPanel();
  const [guidesVisible, setGuidesVisible]: Dynamic = npm_useLocalStorage_QP(DcEditorGuidesVisibleKey, true);
  let lastToolResetAtRef: Dynamic = (0, React.useRef)(0),
    editing: Dynamic = editable && mode === "edit",
    readOnly: Dynamic = !editable,
    [toolResetTick, setToolResetTick]: Dynamic = (0,
    React.useState)(0),
    previousEditingRef: Dynamic = (0, React.useRef)(false);
  (0, React.useEffect)((): Dynamic => {
    editing &&
      !previousEditingRef.current &&
      setToolResetTick((input?: Dynamic): Dynamic => input + 1);
    previousEditingRef.current = editing;
  }, [editing]);
  let [canvasReady, setCanvasReady]: Dynamic = (0, React.useState)(
      false,
    ),
    canvasActionsRef: Dynamic = (0, React.useRef)(null),
    componentNameForFile: Dynamic = SelectionActionsReplace;

  const {
    selection,
    setSelection,
    selectionRef,
    selectionCountsRef,
    selectionGestureActiveRef,
    selectionGestureRef,
    frameSelectionRef,
    selectionEpochRef,
    selectionAnchorRef,
    selectionFocusRef,
    selectionGestureEpochRef,
    abandonSelectionGesture,
    isSelectionEpochCurrent,
  } = useCanvasSelectionState();
  const focusedFileRef: Dynamic = (0, React.useRef)(null);
  const selectionOverlayRef: Dynamic = (0, React.useRef)(null);
  const nothingSelectedMessageRef: Dynamic = (0, React.useRef)(
    (): Dynamic => NothingSelectedMessage,
  );
  const selectFrameBoardRef: { current: (file: string, additive: boolean) => void } =
    React.useRef(() => {});
  const frameSelection = useFrameSelection({
    get frames() { return artboardEntriesRef; },
    focusedFile: focusedFileRef,
    selection: selectionRef,
    selectionEpoch: selectionEpochRef,
    selectionGesture: selectionGestureRef,
    sessionCancelTarget: selectionFocusRef,
    ignoreClearFromFile: frameSelectionRef,
    componentName: componentNameForFile,
    abandonSelectionGesture,
    setSelection,
    focus(file) { return focusCanvasArtboardRef.current(file); },
    selectBoard(file, additive) { selectFrameBoardRef.current(file, additive); },
  });
  const {
    receive: handleFrameSelection,
    apply: applyCanvasSelection,
    focusAndReplay: focusArtboardAndReplay,
    recordSequence: recordFrameSelectionSequence,
    setShown: setShownFrameSelection,
    clearShown: clearShownSelection,
  } = frameSelection;
  const applySelectionRef: Dynamic = (0, React.useRef)(applyCanvasSelection);
  applySelectionRef.current = applyCanvasSelection;
  const pendingFrameSelectionStateRef: Dynamic = (0, React.useRef)(null);
  let framePointerRef: Dynamic = (0, React.useRef)(null),
    startFrameTransition: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic, transitionPromise?: Dynamic, source?: Dynamic): Dynamic => {
        let transitionComplete: Dynamic = Promise.all([
            transitionPromise.catch((): Dynamic => {}),
            source.ended,
          ]).then(([, travelState]: Dynamic): Dynamic => {
            state.travelled = travelState.travelled;
          }),
          state: Dynamic = {
            file: fileKey,
            over: transitionComplete,
            gen: source.gen,
            kind: source.kind,
            travelled: false,
            after: null,
            answered: false,
            expired: false,
          };
        pendingFrameSelectionStateRef.current = state;
        let clearTransition: Dynamic = (): Dynamic => {
            (window as Dynamic).clearTimeout(expirationTimer);
            pendingFrameSelectionStateRef.current === state && (pendingFrameSelectionStateRef.current = null);
          },
          expirationTimer: Dynamic = (window as Dynamic).setTimeout((): Dynamic => {
            state.expired = true;
            clearTransition();
          }, 6000);
        transitionComplete.then(clearTransition);
      },
      [],
    ),
    recordCoverPress: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic, point?: Dynamic): Dynamic => {
        framePointerRef.current = {
          file: fileKey,
          x: point.x,
          y: point.y,
          at: Date.now(),
        };
      },
      [],
    ),
    handleElementPress: Dynamic = (0, React.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        selectionMode?: Dynamic,
        extra?: Dynamic,
      ): Dynamic => {
        let componentName: Dynamic = componentNameForFile(input);
        abandonSelectionGesture();
        let pendingSelection: Dynamic =
          pendingFrameSelectionStateRef.current?.file === input ? pendingFrameSelectionStateRef.current : null;
        pendingSelection && (pendingSelection.answered = true);
        if (extra && (selectionMode === "replace" || selectionMode === "narrow")) {
          let recentCoverPress: Dynamic = framePointerRef.current;
          recentCoverPress &&
            recentCoverPress.file === input &&
            Date.now() - recentCoverPress.at < 2e3 &&
            artboardEntriesRef.current.get(input)?.armedByClick(recentCoverPress.x, recentCoverPress.y);
        }
        if (selectionMode === "toggle" || selectionMode === "remove")
          applyCanvasSelection(
            toggleCanvasElementIds(
              selectionRef.current,
              input,
              [options],
              {
                name: componentName,
                rect: context,
              },
            ),
          );
        else {
          let previousSelection: Dynamic = selectionRef.current,
            alreadySelected: Dynamic =
              previousSelection.elements.size === 1 &&
              previousSelection.artboards.size === 0 &&
              previousSelection.notes.size === 0 &&
              previousSelection.elements.get(input)?.tids.length === 1 &&
              previousSelection.elements.get(input)?.tids[0] === options;
          leaveArtboardRef.current();
          alreadySelected ||
            applyCanvasSelection(
              selectionFromElements(input, {
                name: componentName,
                tids: [options],
                rect: context,
                count: 1,
              }),
            );
        }
        pendingSelection && (pendingSelection.after = selectionRef.current);
        let replayResult: Dynamic = extra ? focusArtboardAndReplay(input) : undefined;
        pendingSelection && (pendingSelection.gen = selectionEpochRef.current);
        return replayResult;
      },
      [focusArtboardAndReplay, applyCanvasSelection, abandonSelectionGesture],
    ),
    unreadableToastRef: Dynamic = (0, React.useRef)(null),
    showUnreadableArtboard: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        OutlineGlyphsTest(doc.content().files[input] ?? "") &&
          (unreadableToastRef.current != null && hideToast(unreadableToastRef.current),
          (unreadableToastRef.current = showToast(
            CanTReadThisArtboardSFileAskMessage,
          )));
      },
      [doc, hideToast, showToast],
    ),
    selectAllArtboardElements: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        let entry: Dynamic = artboardEntriesRef.current.get(input);
        if (!entry) return;
        let selectionEpoch: Dynamic = abandonSelectionGesture();
        entry.ensureOutline().then((items?: Dynamic): Dynamic => {
          if (selectionEpochRef.current !== selectionEpoch) return;
          if (items === null) return showUnreadableArtboard(input);
          if (items.length === 0) return;
          let selectableTids: Dynamic = items
            .filter(
              (element?: Dynamic): Dynamic =>
                !SelectionActionsHelmetScHelmetPattern.test(
                  element.tag,
                ),
            )
            .map((element?: Dynamic): Dynamic => element.tid);
          selectableTids.length !== 0 &&
            (applyCanvasSelection(
              selectionFromElements(input, {
                name: componentNameForFile(input),
                tids: selectableTids,
                rect: null,
                count: selectableTids.length,
              }),
            ),
            focusArtboardAndReplay(input));
        });
      },
      [focusArtboardAndReplay, applyCanvasSelection, showUnreadableArtboard, abandonSelectionGesture],
    ),
    selectAllArtboardElementsRef: Dynamic = (0, React.useRef)(selectAllArtboardElements);
  selectAllArtboardElementsRef.current = selectAllArtboardElements;
  let handleArtboardDoubleClick: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let currentSelection: Dynamic = selectionRef.current;
        if (currentSelection.artboards.has(input) && !currentSelection.elements.has(input)) {
          selectAllArtboardElements(input);
          return;
        }
        let entry: Dynamic = currentSelection.elements.get(input),
          frameEntry: Dynamic = artboardEntriesRef.current.get(input);
        if (!entry || entry.tids.length !== 1 || !frameEntry || !frameEntry.isReady())
          return;
        let [tids]: Dynamic = entry.tids;
        if (tids == null) return;
        if (frameEntry.describeTids([tids])[0]?.editable) {
          frameEntry.startTextEdit(componentNameForFile(input), tids);
          return;
        }
        let gestureEpoch: Dynamic = selectionGestureEpochRef.current;
        frameEntry
          .pickAt(options.x, options.y, "deeper", [tids])
          .then((pickedElement?: Dynamic): Dynamic => {
            let currentElementSelection: Dynamic = selectionRef.current.elements.get(input);
            selectionGestureEpochRef.current !== gestureEpoch ||
              (currentElementSelection != null &&
                !(currentElementSelection.tids.length === 1 && currentElementSelection.tids[0] === tids)) ||
              pickedElement == null ||
              "empty" in pickedElement ||
              pickedElement.tid === tids ||
              handleElementPress(input, pickedElement.tid, pickedElement.rect, "replace", true);
          });
      },
      [handleElementPress, selectAllArtboardElements],
    ),
    nudgeBoardsWithHistoryRef: Dynamic = (0, React.useRef)(
      (): Dynamic => false,
    ),
    flipAnnotationsWithHistoryRef: Dynamic = (0, React.useRef)(
      (): Dynamic => ({
        flipped: false,
      }),
    ),
    flipSelectedAnnotationsRef: Dynamic = (0, React.useRef)(
      (): Dynamic => false,
    ),
    selectionCompletionQueueRef: Dynamic = (0, React.useRef)(
      Promise.resolve(),
    ),
    pendingSelectionOperationsRef: Dynamic = (0, React.useRef)(0),
    enqueueSelectionCompletion: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, completionOptions?: Dynamic): Dynamic => {
        let completionPromise: Dynamic = selectionCompletionQueueRef.current
          .then(input, input)
          .finally((): Dynamic => completionOptions?.());
        selectionCompletionQueueRef.current = completionPromise.catch((): Dynamic => {});
      },
      [],
    ),
    selectionEpochAtLastNavigationRef: Dynamic = (0, React.useRef)(0),
    afterSelectionEdits: Dynamic = (0, React.useCallback)(
      (cleanup?: Dynamic, cleanupOptions?: Dynamic): Dynamic => {
        if (pendingSelectionOperationsRef.current === 0) {
          cleanup();
          return;
        }
        let currentSelection: Dynamic = selectionRef.current,
          selectionSnapshot: Dynamic = (): Dynamic =>
            selectionEpochRef.current - selectionEpochAtLastNavigationRef.current,
          selectionEpoch: Dynamic = selectionSnapshot();
        enqueueSelectionCompletion((): Dynamic => {
          sameSelectedObjectFiles(
            currentSelection,
            selectionRef.current,
          ) && selectionSnapshot() === selectionEpoch
            ? cleanup()
            : cleanupOptions?.();
        });
      },
      [enqueueSelectionCompletion],
    ),
    abandonSelectionGestureRef: Dynamic = (0, React.useRef)(afterSelectionEdits);
  abandonSelectionGestureRef.current = afterSelectionEdits;
  let selectionAnchorStateRef: Dynamic = (0, React.useRef)({
      at: 0,
      seq: new Map(),
      dead: new Set(),
    }),
    selectionHistoryLimit: Dynamic = 400,
    selectionSnapshotFromState: Dynamic = (selectionState?: Dynamic): Dynamic =>
      [...selectionState.elements]
        .filter(
          ([elementId, element]: Dynamic): Dynamic =>
            element.name === componentNameForFile(elementId),
        )
        .map(
          ([elementId, element]: Dynamic): Dynamic => [elementId, [...element.tids]],
        ),
    navigateSelection: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof navigateSelectionByKind> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => navigateSelectionByKind({
        selection: { get abandonGesture() { return abandonSelectionGesture; }, get apply() { return applyCanvasSelection; }, get snapshotFromState() { return selectionSnapshotFromState; }, get focusedFile() { return focusedFileRef; }, get epoch() { return selectionEpochRef; }, get current() { return selectionRef; }, get epochAtLastNavigation() { return selectionEpochAtLastNavigationRef; }, get anchorState() { return selectionAnchorStateRef; }, get clearShown() { return clearShownSelection; } },
        session: { get pendingCommands() { return selectionCommandEpochRef; }, get hostGesturing() { return hostGesturingRef; }, get pendingOperations() { return pendingSelectionOperationsRef; }, get enqueueCompletion() { return enqueueSelectionCompletion; } },
        artboards: { get entries() { return artboardEntriesRef; }, get componentName() { return componentNameForFile; }, get focusAndReplay() { return focusArtboardAndReplay; }, get markFrameCommandPending() { return frameSelection.markCommandPending; }, get nudgeWithHistory() { return nudgeBoardsWithHistoryRef; } },
        history: { get inlineHistory() { return inlineHistoryRef; }, get localDepth() { return manifestHistory.localDepth; }, get limit() { return selectionHistoryLimit; } },
        document: { get manifest() { return documentStateRef; }, get pageContents() { return activePageContentsRef; } },
      }, ...args),
      [
        focusArtboardAndReplay,
        clearShownSelection,
        applyCanvasSelection,
        enqueueSelectionCompletion,
        abandonSelectionGesture,
      ],
    ),
    navigateSelectionRef: Dynamic = (0, React.useRef)(navigateSelection);
  navigateSelectionRef.current = navigateSelection;
  let mergeSelection: Dynamic = (0, React.useCallback)(
      (selectionToMerge?: Dynamic): Dynamic => {
        let currentSelection: Dynamic = selectionRef.current,
          selectionEpoch: Dynamic = null;
        return {
          sweep: (sweepSelection?: Dynamic): Dynamic => {
            if (selectionEpoch == null) {
              selectionEpoch = abandonSelectionGesture();
              leaveArtboardRef.current();
            } else if (selectionEpochRef.current !== selectionEpoch) return;
            applyCanvasSelection(
              mergeCanvasSelection(currentSelection, sweepSelection, selectionToMerge),
            );
          },
          cancel: (): Dynamic => {
            (selectionEpoch == null || selectionEpochRef.current === selectionEpoch) &&
              (applyCanvasSelection(currentSelection), abandonSelectionGesture());
          },
        };
      },
      [applyCanvasSelection, abandonSelectionGesture],
    ),
    cancelSelectionSession: Dynamic = (0, React.useCallback)(
      (selectionToCancel?: Dynamic): Dynamic => {
        let selectionAnchor: Dynamic = selectionAnchorRef.current,
          activeElement: Dynamic = (document as Dynamic).activeElement,
          cancellationResult: Dynamic = reduceSessionCancellation(
            selectionAnchor,
            selectionToCancel,
            {
              now: Date.now(),
              focusedFile: focusedFileRef.current,
              busy: hostGesturingRef.current || frameDragRef.current != null,
              frameFocused:
                activeElement instanceof HTMLIFrameElement &&
                activeElement
                  .closest("[data-mega-artboard]")
                  ?.getAttribute("data-mega-artboard") ===
                  focusedFileRef.current,
              selection: selectionRef.current,
            },
          );
        selectionAnchorRef.current = cancellationResult.rec;
        return cancellationResult.cancelKey != null && selectionAnchor
          ? (artboardEntriesRef.current
              .get(selectionAnchor.file)
              ?.cancelBox(cancellationResult.cancelKey),
            true)
          : cancellationResult.restore != null && selectionAnchor
            ? (abandonSelectionGesture(),
              (selectionFocusRef.current = selectionAnchor.key),
              (selectionRef.current = cancellationResult.restore),
              setSelection(cancellationResult.restore),
              true)
            : false;
      },
      [applyCanvasSelection, abandonSelectionGesture],
    ),
    handleBoxEvent: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic, boxOptions?: Dynamic): Dynamic => {
        cancelSelectionSession({
          type: boxOptions.type,
          file: fileKey,
          key: boxOptions.key,
        });
      },
      [cancelSelectionSession],
    ),
    routeFrameEvent: Dynamic = (0, React.useCallback)(
      (): Dynamic =>
        cancelSelectionSession({
          type: "escape",
        }),
      [cancelSelectionSession],
    ),
    routeFrameEventRef: Dynamic = (0, React.useRef)(routeFrameEvent);
  routeFrameEventRef.current = routeFrameEvent;
  let handleFramePick: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      let focusedFile: Dynamic = focusedFileRef.current;
      if (focusedFile == null || !selectionRef.current.elements.has(focusedFile))
        return;
      let entry: Dynamic = artboardEntriesRef.current.get(focusedFile);
      entry &&
        ((frameSelectionRef.current = focusedFile),
        entry.setShownSelection(null, null) || (frameSelectionRef.current = null));
    }, []),
    framePickState: Dynamic = (0, React.useMemo)(
      (): Dynamic =>
        selection.primary != null
          ? ((): Dynamic => {
              let entry: Dynamic = selection.elements.get(selection.primary);
              return entry
                ? {
                    file: selection.primary,
                    rect: entry.rect,
                    count: entry.count,
                    name: entry.name,
                    tids: entry.tids,
                    part: entry.part,
                    identity:
                      selection.primary +
                      ":" +
                      (entry.name ?? "") +
                      ":" +
                      entry.tids.join(".") +
                      (entry.part ? ":" + entry.part : ""),
                  }
                : null;
            })()
          : null,
      [selection],
    ),
    framePickStateRef: Dynamic = (0, React.useRef)(framePickState);
  framePickStateRef.current = framePickState;
  (0, React.useEffect)((): Dynamic => {
    let handleTextKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      let frameSelection: Dynamic = framePickStateRef.current,
        target: Dynamic = event.target,
        shouldClearLabel: Dynamic =
          !!target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);
      event.key !== "Escape" ||
        event.repeat ||
        event.defaultPrevented ||
        frameSelection?.part !== "text" ||
        !frameSelection.tids ||
        shouldClearLabel ||
        hasBlockingEditorOverlay() ||
        target?.closest("[data-mega-selection-strip]") ||
        (event.preventDefault(),
        event.stopPropagation(),
        artboardEntriesRef.current.get(frameSelection.file)?.clearLabelPart());
    };
    (window as Dynamic).addEventListener("keydown", handleTextKeyDown, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", handleTextKeyDown, true);
  }, []);
  let supportsCanvasLoadState: Dynamic = supportsLoadState
      ? sessionsDirty
      : canvasReady || localDirty || sessionsDirty,
    initialSaveState: Dynamic = (0, React.useMemo)(
      (): Dynamic =>
        supportsCanvasLoadState && saveState.status === "ready"
          ? {
              status: "dirty",
              ...(supportsLoadState
                ? {
                    get message() { return uiMessage("canvas.designCanvas.changesWaitingToSync"); },
                  }
                : {}),
            }
          : saveState,
      [supportsCanvasLoadState, supportsLoadState, saveState],
    );
  const {
    canvasDocumentState, setCanvasDocumentState, documentStateRef, previousDocumentStateRef,
    serializeDocumentState, persistCanvasState, getArtboardTitle,
  } = useCanvasManifest({ doc, markLocalWrite, showToast });
  let [focusedFilePath]: Dynamic = (0, React.useState)(
      (): Dynamic => {
        let placeLink: Dynamic =
          embedMemoryPrefix() !== ""
            ? null
            : classifyPlaceLink();
        return placeLink === null || placeLink.why === "known"
          ? null
          : prototypeFileFromPlaceFragment(
              placeLink.place,
              canvasDocumentState,
            );
      },
    ),
    [focusedArtboardId, setFocusedArtboardId]: Dynamic = (0, React.useState)(
      (): Dynamic => {
        let linkedArtboard: Dynamic = canvasDocumentState.artboards.find(
          (input?: Dynamic): Dynamic => input.file === focusedFilePath,
        );
        if (linkedArtboard)
          return designPageId(linkedArtboard, canvasDocumentState.pages);
        let hasSavedMetadata: Dynamic =
          doc.content().files[canvasMetadataFile] != null;
        if (
          hasSavedMetadata &&
          canvasDocumentState.launch?.view === "canvas" &&
          canvasDocumentState.launch.page !== undefined
        )
          return canvasDocumentState.launch.page;
        let initialFile: Dynamic =
            hasSavedMetadata && canvasDocumentState.launch?.view === "focused"
              ? canvasDocumentState.launch.file
              : filePath,
          initialArtboard: Dynamic =
            canvasDocumentState.artboards.find(
              (input?: Dynamic): Dynamic => input.file === initialFile,
            ) ??
            canvasDocumentState.artboards.find(
              (input?: Dynamic): Dynamic => input.file === filePath,
            );
        return initialArtboard
          ? designPageId(initialArtboard, canvasDocumentState.pages)
          : (canvasDocumentState.pages?.[0]?.id ?? "");
      },
    ),
    pages: Dynamic = canvasDocumentState.pages ?? [],
    firstPageId: Dynamic = pages[0]?.id ?? "",
    activePageId: Dynamic = pages.some(
      (input?: Dynamic): Dynamic => input.id === focusedArtboardId,
    )
      ? focusedArtboardId
      : firstPageId,
    activePageIdRef: Dynamic = (0, React.useRef)(activePageId);
  activePageIdRef.current = activePageId;
  let activePageTitle: Dynamic =
      pages.find((input?: Dynamic): Dynamic => input.id === activePageId)
        ?.name ?? uiMessage("canvas.designCanvas.page1"),
    canvasRevision: Dynamic = (0, React.useSyncExternalStore)(
      noopCanvasSubscription,
      zeroCanvasRevision,
    ),
    canvasPages: Dynamic = (0, React.useMemo)(
      (): Dynamic => pages,
      [pages, canvasDocumentState, canvasRevision],
    ),
    canvasPagesRef: Dynamic = (0, React.useRef)(canvasPages);
  canvasPagesRef.current = canvasPages;
  let compactPageControl: Dynamic = useInspectorPosture() === "sheet",
    activePageContents: Dynamic = (0, React.useMemo)(
      (): Dynamic => designPageContents(canvasDocumentState, activePageId),
      [canvasDocumentState, activePageId],
    ),
    activePageContentsRef: Dynamic = (0, React.useRef)(activePageContents);
  activePageContentsRef.current = activePageContents;
  let [creationSequenceEnabledAtMount]: Dynamic = (0, React.useState)(
      creationSequenceEnabled,
    ),
    creationProgress: Dynamic = useDesignCreationProgress({
      doc: doc,
      creationSequenceEnabled: creationSequenceEnabledAtMount,
      artboards: canvasDocumentState.artboards,
      pages: canvasDocumentState.pages,
      artboardsHere: activePageContents.artboards,
      pageId: activePageId,
      editing: editing,
      pageEmpty:
        activePageContents.artboards.length === 0 &&
        (activePageContents.annotations ?? []).length === 0,
    }),
    placementObstaclesRef: Dynamic = (0, React.useRef)([]);
  placementObstaclesRef.current =
    creationProgress.boxesHere.length === 0
      ? activePageContents.artboards
      : [...activePageContents.artboards, ...creationProgress.boxesHere];
  let creationBoxesRef: Dynamic = (0, React.useRef)(
    creationProgress.boxesHere,
  );
  creationBoxesRef.current = creationProgress.boxesHere;
  let clipboardFeatureEnabled: Dynamic = useClipboardFeatureFlag(),
    exportRules: Dynamic = (0, React.useMemo)(
      (): Dynamic => ({
        migrated: false,
        fillFlows: clipboardFeatureEnabled,
        settle: clipboardFeatureEnabled,
      }),
      [clipboardFeatureEnabled],
    );
  let savePageSelection: Dynamic = (pageId: Dynamic = activePageIdRef.current): Dynamic =>
      pageId === "" || pageId === (documentStateRef.current.pages?.[0]?.id ?? "")
        ? {}
        : {
            page: pageId,
          },
    [phoneCanvas]: Dynamic = (0, React.useState)(
      isSmallTouchDevice,
    ),
    [phoneCanvasKilledEarlier]: Dynamic = (0, React.useState)(
      (): Dynamic =>
        phoneCanvas &&
        wasPhoneCanvasKilled(
          getPhoneCanvasStorage(),
          phoneCanvasStorageKey(),
        ),
    ),
    [focusedArtboardState]: Dynamic = (0, React.useState)(
      (): Dynamic =>
        focusedFilePath ??
        initialFocusedArtboard({
          manifest: canvasDocumentState,
          pageId: activePageId,
          entryFile: filePath,
          embedded: embedMemoryPrefix() !== "",
          laidOut: doc.content().files[canvasMetadataFile] != null,
          phoneCanvas,
          killedBefore: phoneCanvasKilledEarlier,
          migrated: false,
          budget: 15e5,
        }),
    );
  const {
    camera: canvasScale,
    controller: cameraController,
    container: canvasContainerRef,
    setContainer: setCanvasContainer,
    measure: canvasViewport,
    viewRestoredRef,
    toolbarInset,
    toolbarInsetReadyRef,
  } = useCanvasViewport(canvasDocumentState, activePageId, focusedArtboardState);
  let toolbarRootRef: Dynamic = (0, React.useRef)(null),
    pastePointRef: Dynamic = (0, React.useRef)(null),
    clipboardAdapterRef: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      let pasteTarget: Dynamic = pastePointRef.current?.() ?? null;
      pasteTarget != null && pasteTarget.file == null;
      return pasteTarget;
    }, []),
    artboardLandingRef: Dynamic = (0, React.useRef)(null),
    copySelection: Dynamic = (0, React.useCallback)(
      (): Dynamic => artboardLandingRef.current?.() ?? null,
      [],
    ),
    pasteSelection: Dynamic = (0, React.useCallback)(
      (
        items?: Dynamic,
        clipboardItems?: Dynamic,
        pasteContext?: Dynamic,
        fallbackContext?: Dynamic,
      ): Dynamic =>
        items.length > 0
          ? copySelection()
          : pointerCoordinates(
              clipboardItems.length > 0 ? pasteContext : fallbackContext,
            ),
      [copySelection],
    ),
    clipboardSubscription: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      let currentSelection: Dynamic = selectionRef.current;
      if (
        currentSelection.notes.size > 0 ||
        currentSelection.elements.size > 0 ||
        currentSelection.artboards.size !== 1
      )
        return null;
      let [artboards]: Dynamic = currentSelection.artboards;
      return (
        activePageContentsRef.current.artboards.find(
          (artboard?: Dynamic): Dynamic =>
            artboard.file === artboards && !artboard.frameless,
        ) ?? null
      );
    }, []);
  let [selectedFile, setSelectedFile]: Dynamic = (0, React.useState)(
      (): Dynamic => {
        if (focusedArtboardState != null) return focusedArtboardState;
        if (phoneCanvas && editable) return null;
        let isCurrentPageArtboard: Dynamic = (artboard?: Dynamic): Dynamic =>
            designPageId(artboard, canvasDocumentState.pages) === activePageId,
          focusedArtboard: Dynamic = canvasDocumentState.artboards.find(
            (file?: Dynamic): Dynamic => file.file === filePath,
          );
        return focusedArtboard && isCurrentPageArtboard(focusedArtboard)
          ? filePath
          : (canvasDocumentState.artboards.find(
              (artboard?: Dynamic): Dynamic =>
                isCurrentPageArtboard(artboard) && !artboard.frameless,
            )?.file ?? null);
      },
    ),
    [activeArtboard, setActiveArtboard]: Dynamic = (0, React.useState)(
      null,
    ),
    activeArtboardRef: Dynamic = (0, React.useRef)(null);
  activeArtboardRef.current = activeArtboard;
  const { recordArtboardActivity: recordArtboardActivity, refreshArtboardActivity: refreshArtboardActivity } = useCanvasDocumentActivity({
    doc, supportsLoadState, editing, selectedFile, documentStateRef, focusedFileRef,
    markArtboardDropped: (file: string) => markArtboardDropped(file), showToast,
  });
  let hasCombinedSelection: Dynamic =
      selection.elements.size > 1 ||
      (selection.elements.size > 0 &&
        selection.artboards.size + selection.notes.size > 0),
    snapshotSelectedElements: Dynamic = (0, React.useCallback)(
      (): Dynamic =>
        [...selectionRef.current.elements].map(
          ([input, elementSelection]: Dynamic): Dynamic => [
            input,
            {
              tids: [...elementSelection.tids],
            },
          ],
        ),
      [],
    ),
    copySelectedElements: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        let items: Dynamic = [];
        try {
          for (let [file, selectedElements] of snapshotSelectedElements() as Dynamic) {
            let markup: Dynamic = artboardEntriesRef.current
              .get(file)
              ?.serializeSelection(selectedElements.tids);
            markup && items.push(markup);
          }
        } catch (error: Dynamic) {
          throw (input?.drop(), error);
        }
        return items.length === 0
          ? (input?.drop(), false)
          : (input
              ? input.write(
                  items.join(`
`),
                )
              : setElementClipboard(
                  items.join(`
`),
                  {
                    inTabOnly: true,
                  },
                ),
            true);
      },
      [snapshotSelectedElements],
    ),
    finishBoundOperationRef: Dynamic = (0, React.useRef)(new Map()),
    boundRecordMergersRef: Dynamic = (0, React.useRef)(new Map()),
    boundSelectionsRef: Dynamic = (0, React.useRef)(new Map()),
    boundMoveRecordsRef: Dynamic = (0, React.useRef)(new Map()),
    waitForBoundOperation: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic =>
        new Promise((resolve?: Dynamic): Dynamic => {
          let finish: Dynamic = (): Dynamic => {
              clearTimeout(timeout);
              finishBoundOperationRef.current.delete(input);
              resolve();
            },
            timeout: Dynamic = setTimeout(finish, 3e3);
          finishBoundOperationRef.current.set(input, finish);
        }),
      [],
    ),
    deleteSelectedElementsAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof deleteSelectedElements> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => deleteSelectedElements({
        selection: { get abandonGesture() { return abandonSelectionGesture; }, get apply() { return applyCanvasSelection; }, get current() { return selectionRef; }, get counts() { return selectionCountsRef; } },
        session: { get waitForBoundOperation() { return waitForBoundOperation; }, get pendingCommands() { return selectionCommandEpochRef; }, get hostGesturing() { return hostGesturingRef; } },
        artboards: { get entries() { return artboardEntriesRef; }, get deleteObjects() { return deleteCanvasObjectsRef; } },
        history: { get inlineHistory() { return inlineHistoryRef; } },
        feedback: { get showToast() { return showDragToastRef; } },
      }, ...args),
      [abandonSelectionGesture, applyCanvasSelection, waitForBoundOperation],
    ),
    deleteSelectedElementsWithAnnouncement: Dynamic = (0, React.useCallback)(
      (): Dynamic => deleteSelectedElementsAction(DeletedValue),
      [deleteSelectedElementsAction],
    ),
    deleteSelectedElementsRef: Dynamic = (0, React.useRef)(deleteSelectedElementsAction);
  deleteSelectedElementsRef.current = deleteSelectedElementsAction;
  let duplicateSelectedElementsAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof duplicateSelectedElements> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => duplicateSelectedElements({
        selection: { get abandonGesture() { return abandonSelectionGesture; }, get current() { return selectionRef; }, get snapshotElements() { return snapshotSelectedElements; }, get counts() { return selectionCountsRef; }, get clearFrameCommand() { return frameSelection.clearCommand; } },
        session: { get waitForBoundOperation() { return waitForBoundOperation; }, get pendingCommands() { return selectionCommandEpochRef; }, get hostGesturing() { return hostGesturingRef; }, get pendingOperations() { return pendingSelectionOperationsRef; } },
        artboards: { get entries() { return artboardEntriesRef; }, get duplicateBoards() { return duplicateSelectedBoardsRef; } },
        history: { get inlineHistory() { return inlineHistoryRef; } },
        feedback: { get showToast() { return showDragToastRef; } },
      }, ...args),
      [snapshotSelectedElements, abandonSelectionGesture, waitForBoundOperation],
    ),
    flipInProgressRef: Dynamic = (0, React.useRef)(false),
    runFlipSelectedObjects: Dynamic = (0, React.useCallback)(
      (): Dynamic =>
        canvasToolRef.current === "vector"
          ? FinishEditingThisDrawingSPointsToMessage
          : activeCropElement() !== null ||
              (document as Dynamic).querySelector("[data-media-crop]") !==
                null
            ? finishCroppingBeforeFlipMessage
            : undefined,
      [],
    ),
    commitSelectionTransform: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof flipSelectedObjects> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => flipSelectedObjects({
        selection: { get apply() { return applyCanvasSelection; }, get current() { return selectionRef; } },
        session: { get waitForBoundOperation() { return waitForBoundOperation; }, get flipInProgress() { return flipInProgressRef; }, get runFlip() { return runFlipSelectedObjects; }, get pendingCommands() { return selectionCommandEpochRef; }, get hostGesturing() { return hostGesturingRef; }, get editing() { return editingRef; } },
        artboards: { get entries() { return artboardEntriesRef; }, get componentName() { return componentNameForFile; } },
        history: { get flipAnnotationsWithHistory() { return flipAnnotationsWithHistoryRef; }, get flipSelectedAnnotations() { return flipSelectedAnnotationsRef; }, get inlineHistory() { return inlineHistoryRef; } },
        feedback: { get showToast() { return showDragToastRef; } },
      }, ...args),
      [waitForBoundOperation, applyCanvasSelection, runFlipSelectedObjects],
    ),
    commitSelectionTransformRef: Dynamic = (0, React.useRef)(commitSelectionTransform);
  commitSelectionTransformRef.current = commitSelectionTransform;
  let dragSessionMapRef: Dynamic = (0, React.useRef)(new Map()),
    commitPieceDrag: Dynamic = (...args: Dynamic[]): Dynamic => (commitPieceDragOntoCanvas as Dynamic)({
        target: { get getArtboardTitle() { return getArtboardTitle; }, get artboardEntries() { return artboardEntriesRef; }, get componentName() { return componentNameForFile; } },
        session: { get dragSessions() { return dragSessionMapRef; }, get editing() { return editingRef; }, get waitForBoundOperation() { return waitForBoundOperation; } },
        history: { get boundRecordMergers() { return boundRecordMergersRef; }, get boundSelections() { return boundSelectionsRef; }, get boundMoveRecords() { return boundMoveRecordsRef; }, get recordManifestHistory() { return recordManifestHistoryRef; }, get inlineHistory() { return inlineHistoryRef; } },
        document: { get savePageSelection() { return savePageSelection; }, get doc() { return doc; }, get supportsLoadState() { return supportsLoadState; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; }, get markArtboardDropped() { return markArtboardDropped; } },
        selection: { get abandonGesture() { return abandonSelectionGesture; }, get focusedFile() { return focusedFileRef; }, get current() { return selectionRef; }, get setSelection() { return setSelection; }, get setShownFrameSelection() { return setShownFrameSelection; }, get clearFramePick() { return handleFramePick; } },
        feedback: { get clearToast() { return clearDragToast; }, get showToast() { return showDragToastRef; } },
      }, ...args),
    moveAcrossArtboards: Dynamic = (...args: Dynamic[]): Dynamic => (commitElementMoveAcrossArtboards as Dynamic)({
        target: { get getArtboardTitle() { return getArtboardTitle; }, get artboardEntries() { return artboardEntriesRef; }, get componentName() { return componentNameForFile; } },
        session: { get commitPieceDrag() { return commitPieceDrag; }, get dragSessions() { return dragSessionMapRef; }, get waitForBoundOperation() { return waitForBoundOperation; } },
        history: { get boundSelections() { return boundSelectionsRef; }, get inlineHistory() { return inlineHistoryRef; } },
        selection: { get apply() { return applyCanvasSelection; }, get focusedFile() { return focusedFileRef; }, get current() { return selectionRef; }, get setShownFrameSelection() { return setShownFrameSelection; }, get ignoreClearFromFile() { return frameSelectionRef; } },
        feedback: { get showToast() { return showDragToastRef; } },
      }, ...args),
    moveAcrossArtboardsRef: Dynamic = (0, React.useRef)(moveAcrossArtboards);
  moveAcrossArtboardsRef.current = moveAcrossArtboards;
  const { pending: selectionCommandEpochRef, hold: runSelectionCommand } = useCanvasCommandHolds();
  let dropCanvasObject: Dynamic = (0, React.useCallback)(
      async (travelState?: Dynamic): Promise<Dynamic> => {
        let commandResult: Dynamic = runSelectionCommand(
          travelState.travel
            ? travelCommitTimeoutMs
            : Math.max(
                0,
                releaseGuardMs -
                  (Date.now() - (travelState.releasedAt ?? Date.now())),
              ),
        );
        try {
          return await moveAcrossArtboardsRef.current(travelState);
        } finally {
          commandResult();
        }
      },
      [runSelectionCommand],
    ),
    selectionApplyRef: Dynamic = (0, React.useRef)(duplicateSelectedElementsAction);
  selectionApplyRef.current = duplicateSelectedElementsAction;
  let copySelectionRef: Dynamic = (0, React.useRef)(hasCombinedSelection);
  copySelectionRef.current = hasCombinedSelection;
  let pasteSelectionRef: Dynamic = (0, React.useRef)(copySelectedElements);
  pasteSelectionRef.current = copySelectedElements;
  const routeCanvasFrameKey = useCanvasCommandRouting({
    focusedFile: focusedFileRef,
    selection: selectionRef,
    manifest: documentStateRef,
    get editing() { return editingRef; },
    get gesturing() { return hostGesturingRef; },
    moveCommits: selectionCommandEpochRef,
    pendingSelectionEdits: pendingSelectionOperationsRef,
    container: canvasContainerRef,
    combinedSelection: hasCombinedSelection,
    selectBoard: (file) => selectFrameBoardRef.current(file, false),
    escape: () => routeFrameEventRef.current(),
    navigate: (command) => navigateSelectionRef.current(command),
    abandonSelectionGesture,
    applySelection: applyCanvasSelection,
    afterSelectionEdits: afterSelectionEdits,
    hasRecentFrameCommand: frameSelection.hasRecentCommand,
    history: {
      get manifest() { return manifestHistoryRef; },
      inline: () => inlineHistoryRef.current,
      prepare: (direction) => prepareHistoryRef.current(direction),
    },
    clipboard: {
      copyElements: copySelectedElements,
      pointer: clipboardAdapterRef,
      pasteBoards: (boards, annotations, point) => pasteCanvasBoardsRef.current(boards, annotations, point),
      pasteAtPointer: (pointer) => pasteHtmlAtPointRef.current(pointer, ""),
    },
    deleteElements: deleteSelectedElementsAction,
    deleteSelection: deleteSelectedElementsWithAnnouncement,
    duplicate: duplicateSelectedElementsAction,
    flip: commitSelectionTransform,
    report: (message) => showDragToast(message),
    say: (message) => showDragToastRef.current?.(message),
  });
  let artboardLifecycleRef: Dynamic = (0, React.useRef)(null),
    handleArtboardReady: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic): Dynamic => {
        artboardLifecycleRef.current?.booted(fileKey);
        frameSelectionRef.current === fileKey && (frameSelectionRef.current = null);
        frameSelection.resetSequence(fileKey);
        selectionAnchorRef.current?.file === fileKey && (selectionAnchorRef.current = null);
        selectionGestureRef.current?.frameRebooted(fileKey) === "redriven" &&
          selectionRef.current.elements.has(fileKey) &&
          (selectionGestureActiveRef.current = true);
        setSelection(
          (nextArtboard?: Dynamic): Dynamic =>
            filterSelectedElements(
              nextArtboard,
              (candidateFile?: Dynamic): Dynamic => candidateFile !== fileKey,
            ),
        );
        creationProgress.onArtboardReady(fileKey);
      },
      [creationProgress.onArtboardReady],
    ),
    shownFilesRef: Dynamic = (0, React.useRef)(new Set());
  (0, React.useEffect)((): Dynamic => {
    let values: Dynamic = new Set();
    for (let [fileKey, selectionInfo] of selection.elements as Dynamic)
      fileKey !== selectedFile &&
        (artboardEntriesRef.current
          .get(fileKey)
          ?.setShownSelection(selectionInfo.tids, componentNameForFile(fileKey)),
        values.add(fileKey));
    for (let fileKey of shownFilesRef.current as Dynamic)
      !values.has(fileKey) &&
        fileKey !== selectedFile &&
        artboardEntriesRef.current.get(fileKey)?.setShownSelection(null, null);
    shownFilesRef.current = values;
  }, [selection, selectedFile]);
  let selectedFileIds: Dynamic = (0, React.useMemo)(
      (): Dynamic =>
        selection.artboards.size > 0
          ? selection.artboards
          : emptyCanvasFileSet,
      [selection],
    ),
    selectedNoteIds: Dynamic = (0, React.useMemo)(
      (): Dynamic =>
        selection.notes.size > 0
          ? selection.notes
          : emptyCanvasSelectionFiles,
      [selection],
    ),
    selectedTidsByFile: Dynamic = (0, React.useMemo)((): Dynamic => {
      if (selection.elements.size === 0) return emptyCanvasOptions;
      let state: Dynamic = {};
      for (let [file, elements] of selection.elements as Dynamic)
        state[file] = elements.tids;
      return state;
    }, [selection]),
    selectedRectsByFile: Dynamic = (0, React.useMemo)((): Dynamic => {
      if (selection.elements.size === 0) return;
      let state: Dynamic = {};
      for (let [file, elements] of selection.elements as Dynamic)
        state[file] = elements.rect;
      return state;
    }, [selection]),
    inUseFiles: Dynamic = (0, React.useMemo)(
      (): Dynamic =>
        selection.elements.size > 0
          ? new Set(selection.elements.keys())
          : emptyCanvasNoteSet,
      [selection],
    ),
    [presentPropsTick, setPresentPropsTick]: Dynamic = (0, React.useState)(0),
    markPresentPropsHandled: Dynamic = (0, React.useCallback)(
      (): Dynamic => setPresentPropsTick(0),
      [],
    ),
    artboardEntriesRef: Dynamic = (0, React.useRef)(new Map()),
    designContextStore: Dynamic = (0, React.useMemo)(
      createPeerSelectionStore,
      [],
    ),
    pageScrollStore: Dynamic = (0, React.useMemo)(
      createPageScrollStore,
      [],
    ),
    canvasScaleRef: Dynamic = (0, React.useRef)(canvasScale.scale);
  (0, React.useEffect)((): Dynamic => {
    let previousScale: Dynamic = 1,
      lastReportedScale: Dynamic = 1,
      scaleTimer: Dynamic,
      updateCanvasScale: Dynamic = (scale?: Dynamic, sourceScale?: Dynamic): Dynamic => {
        previousScale = scale;
        sourceScale === undefined && (lastReportedScale = scale);
        for (let [fileKey, entry] of artboardEntriesRef.current as Dynamic) {
          if (sourceScale !== undefined && fileKey !== sourceScale) continue;
          let previewHandle: Dynamic = createPreviewHandle(
            entry.previewFrameRef.current,
          );
          previewHandle && setPickerHostScale(previewHandle, scale);
        }
      },
      shouldRefreshSelection: Dynamic = (): Dynamic => {
        let focusedFile: Dynamic = focusedFileRef.current;
        return (
          focusedFile != null && selectionRef.current.elements.has(focusedFile)
        );
      },
      recordScale: Dynamic = (nextScale?: Dynamic): Dynamic => {
        canvasScaleRef.current = nextScale;
        Math.abs(nextScale - previousScale) / previousScale > 0.02 &&
          (artboardEntriesRef.current.size <= 1 || shouldRefreshSelection()) &&
          updateCanvasScale(
            nextScale,
            artboardEntriesRef.current.size > 1 ? focusedFileRef.current : undefined,
          );
        clearTimeout(scaleTimer);
        scaleTimer = setTimeout((): Dynamic => {
          let scale: Dynamic = cameraController.get().scale;
          (scale !== lastReportedScale || scale !== previousScale) && updateCanvasScale(scale);
        }, 150);
      };
    recordScale(cameraController.get().scale);
    let unsubscribeScale: Dynamic = cameraController.subscribe(
      (cameraState?: Dynamic, previousCameraState?: Dynamic): Dynamic => {
        cameraState.scale !== previousCameraState.scale && recordScale(cameraState.scale);
      },
    );
    return (): Dynamic => {
      unsubscribeScale();
      clearTimeout(scaleTimer);
    };
  }, [cameraController]);
  let [historyDirty, setHistoryDirty]: Dynamic = (0, React.useState)(
      0,
    ),
    handleArtboardLifecycle: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic, entry?: Dynamic, context?: Dynamic): Dynamic => {
        let historySession: Dynamic = sessionHistoryRef.current;
        entry == null
          ? (artboardEntriesRef.current.delete(fileKey),
            artboardLifecycleRef.current?.gone(fileKey),
            context &&
              !historySession?.keeper.holds(fileKey) &&
              inlineHistoryRef.current?.forget(fileKey))
          : (artboardEntriesRef.current.set(fileKey, entry),
            artboardLifecycleRef.current?.seen(fileKey),
            setHistoryDirty((revision?: Dynamic): Dynamic => revision + 1),
            historySession?.keeper.holds(fileKey) && historySession.host.startLoad(fileKey));
      },
      [],
    ),
    [dragToast, setDragToast]: Dynamic = (0, React.useState)(
      null,
    ),
    dragToastTimerRef: Dynamic = (0, React.useRef)(null),
    showDragToast: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        setDragToast(input);
        announce(input);
        dragToastTimerRef.current && clearTimeout(dragToastTimerRef.current);
        dragToastTimerRef.current = setTimeout((): Dynamic => setDragToast(null), 6e3);
      },
      [],
    ),
    clearDragToast: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        setDragToast(null);
        dragToastTimerRef.current && clearTimeout(dragToastTimerRef.current);
        announce(input);
      },
      [],
    ),
    reachableManifestStepRef: Dynamic = (0, React.useRef)(
      (): Dynamic => null,
    ),
    discardBoundHistoryRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    ),
    prepareHistoryRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    ),
    readLiveUndoDepth: Dynamic = (): Dynamic => {
      let focusedFile: Dynamic = focusedFileRef.current;
      return focusedFile === null
        ? null
        : (artboardEntriesRef.current.get(focusedFile)?.undoDepth() ?? null);
    };
  (0, React.useEffect)((): Dynamic => {
    let handleInlineHistoryKey: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        typeof event.key != "string" ||
        event.key.toLowerCase() !== "z"
      )
        return;
      let openTextEdit: Dynamic = commitOpenTextEditRef.current,
        historyAction: Dynamic = handleInlineUndoKey(event, {
          editing: editingRef.current,
          filesOpen: filesOpenRef.current,
          textEditOpen: openTextEdit !== null,
          pending: sessionFlushPendingRef.current,
          targetOwnsKey: (): Dynamic =>
            isCanvasTypingTarget(event.target),
          stepMadeDuringEdit: (input?: Dynamic): Dynamic =>
            openTextEdit !== null &&
            canApplyTextEditHistory(
              openTextEdit,
              input,
              readLiveUndoDepth(),
              manifestHistoryRef.current.reachable(input),
            ),
          canvasStepOnTop: (input?: Dynamic): Dynamic =>
            manifestHistoryRef.current.reachable(input) !== null,
        });
      historyAction !== "ignore" &&
        (event.preventDefault(),
        event.stopImmediatePropagation(),
        historyAction === "undo"
          ? canvasUndoRef.current?.undo()
          : historyAction === "redo" && canvasUndoRef.current?.redo());
    };
    (document as Dynamic).addEventListener("keydown", handleInlineHistoryKey, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", handleInlineHistoryKey, true);
  }, []);
  // 拖动会话：全部取值惰性（getter），hostGesturingRef 属于宿主手势状态，留在入口
  const {
    frameDragRef,
    dragPreview,
    streamDragFile,
    setStreamDragFile,
    dropInProgressRef,
    draggedArtboardRef,
    clearFrameDrag,
    handleCanvasDrag,
    handleHostDrag,
    handleCanvasObjectHover,
    dropCanvasObjectInto,
  } = useCanvasDragSession({
    project: { get assets() { return assets; }, get doc() { return doc; } },
    target: {
      get artboardEntries() { return artboardEntriesRef; },
      get pageContents() { return activePageContentsRef; },
      get activeArtboard() { return activeArtboardRef; },
      get playingFile() { return playingFileRef; },
      get fullscreenActive() { return fullscreenActiveRef; },
      get focusedFile() { return focusedFileRef; },
      get getArtboardTitle() { return getArtboardTitle; },
      get componentName() { return componentNameForFile; },
      get recordDropTarget() { return recordDropTarget; },
    },
    session: {
      get pendingSelectionCommands() { return selectionCommandEpochRef; },
      get waitForBoundOperation() { return waitForBoundOperation; },
      get runSelectionCommand() { return runSelectionCommand; },
      get hostGesturing() { return hostGesturingRef; },
    },
    history: {
      get inlineHistory() { return inlineHistoryRef; },
      get recordManifestHistory() { return recordManifestHistoryRef; },
      get runWhenConditionReady() { return runWhenConditionReady; },
    },
    document: {
      get manifest() { return documentStateRef; },
      get manifestState() { return canvasDocumentState; },
      get dropCanvasObject() { return dropCanvasObject; },
      get deleteCanvasObjects() { return deleteCanvasObjectsRef; },
      get savePageSelection() { return savePageSelection; },
      get supportsLoadState() { return supportsLoadState; },
      get persistManifest() { return persistCanvasState; },
      get markArtboardDropped() { return markArtboardDropped; },
    },
    selection: {
      get current() { return selectionRef; },
      get setSelection() { return setSelection; },
      get setShownFrameSelection() { return setShownFrameSelection; },
      get abandonGesture() { return abandonSelectionGesture; },
      get clearFramePick() { return handleFramePick; },
    },
    feedback: {
      get showToast() { return showToast; },
      get showDragToast() { return showDragToast; },
      get clearDragToast() { return clearDragToast; },
      get showDragToastRef() { return showDragToastRef; },
    },
  });
  selectionOverlayRef.current = clearFrameDrag;
  let hostGesturingRef: Dynamic = (0, React.useRef)(false),
    setHostGesturing: Dynamic = (0, React.useCallback)(
      (gesturing?: Dynamic): Dynamic => {
        hostGesturingRef.current = gesturing;
      },
      [],
    ),
    [commenting, setCommenting]: Dynamic = (0, React.useState)(
      false,
    ),
    editingRef: Dynamic = (0, React.useRef)(editing);
  editingRef.current = editing;
  let readOnlyRef: Dynamic = (0, React.useRef)(readOnly);
  readOnlyRef.current = readOnly;
  const handlePanZoom = useFrameViewportGestures({
    manifest: canvasDocumentState,
    controller: cameraController,
    container: canvasContainerRef,
    editing: editingRef,
    focusedFile: focusedFileRef,
    get playingFile() { return playingFileRef; },
    get fullscreen() { return fullscreenActiveRef; },
  });
  let formatText: Dynamic = (0, React.useCallback)(
      (formatCommand?: Dynamic): Dynamic => {
        let focusedFile: Dynamic = focusedFileRef.current;
        focusedFile && artboardEntriesRef.current.get(focusedFile)?.formatCommand(formatCommand);
      },
      [],
    ),
    [selectionChangeTick, setSelectionChangeTick]: Dynamic = (0, React.useState)(0),
    pendingSelectionFilesRef: Dynamic = (0, React.useRef)(new Set()),
    [modelChangeTick, setModelChangeTick]: Dynamic = (0, React.useState)(0),
    [armedEmpty, setArmedEmpty]: Dynamic = (0, React.useState)(
      false,
    );
  (0, React.useEffect)((): Dynamic => {
    let activeSelectedFile: Dynamic = selectedFile,
      selectedEntry: Dynamic =
        activeSelectedFile == null ? undefined : artboardEntriesRef.current.get(activeSelectedFile);
    if (!selectedEntry) {
      setArmedEmpty(false);
      return;
    }
    let resolvedEmpty: Dynamic = false;
    selectedEntry.stageIsEmpty().then((isEmpty?: Dynamic): Dynamic => {
      resolvedEmpty || setArmedEmpty(isEmpty);
    });
    return (): Dynamic => {
      resolvedEmpty = true;
    };
  }, [selectedFile, selectionChangeTick, modelChangeTick, historyDirty]);
  let markSelectionFile: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic): Dynamic => {
        pendingSelectionFilesRef.current.add(fileKey);
        setModelChangeTick((tick?: Dynamic): Dynamic => tick + 1);
      },
      [],
    ),
    handleModelReparsed: Dynamic = (0, React.useCallback)(
      (selectionInput?: Dynamic, selectionOptions?: Dynamic, selectionContext?: Dynamic): Dynamic => {
        markSelectionFile(selectionInput);
        selectionCountsRef.current.set(selectionInput, (selectionCountsRef.current.get(selectionInput) ?? 0) + 1);
        let currentSelection: Dynamic = selectionRef.current,
          { next: nextSelection, tell: announcement }: Dynamic = reconcileSelectedElementIds(
            currentSelection,
            selectionInput,
            selectionOptions,
            focusedFileRef.current,
          );
        selectionRef.current = nextSelection;
        nextSelection !== currentSelection &&
          (setSelection(nextSelection),
          selectionInput === focusedFileRef.current &&
            !nextSelection.elements.has(selectionInput) &&
            selectionGestureRef.current?.noteSelection(selectionInput, null));
        announcement != null &&
          selectionContext?.(
            announcement,
            (announceMessage?: Dynamic): Dynamic =>
              (window as Dynamic).setTimeout((): Dynamic => {
                selectionRef.current.elements.get(selectionInput)?.tids === announcement &&
                  announceMessage() &&
                  applyCanvasSelection(selectionRef.current, {
                    repush: [selectionInput],
                  });
              }, 60),
          );
      },
      [markSelectionFile, applyCanvasSelection],
    );
  const {
    selectionProbe,
    seed: inspectorSeed,
    elementSessionState,
    contrastRef,
    variableNames: designSystemVariableNames,
    updateDefinedVariables,
  } = useCanvasSelectionInspector({
    selection,
    artboardEntriesRef,
    selectionSource: componentNameForFile,
    selectionEpoch: selectionChangeTick,
  });
  const { applyPropertyEdit, handleStyleGesture } = useCanvasInspectorEdits(
    snapshotSelectedElements,
    artboardEntriesRef,
    contrastRef,
  );
  const artboardProblems = useCanvasArtboardProblems({
    artboards: activePageContents.artboards,
    editable,
    phoneCanvas,
  });
  const { playingFile, playingFileRef, setPlayingFile } = useInlinePlaybackState();
  const {
    focus: focusCanvasArtboard,
    focusRef: focusCanvasArtboardRef,
    afterPreview: afterLeavingEdit,
    invalidatePendingFocus,
    recordDropTarget,
    leaveRef: leaveArtboardRef,
    clearSelection: clearCanvasSelection,
  } = useCanvasArtboardFocus({
    selectedFile,
    activeFile: activeArtboard,
    focusedFile: focusedFileRef,
    activeFileRef: activeArtboardRef,
    manifest: documentStateRef,
    visiblePage: activePageContents,
    visiblePageRef: activePageContentsRef,
    playingFile: playingFileRef,
    stopPlaying: () => setPlayingFile(null),
    stopPlaybackOnFocus: () => phoneCanvas && !fullscreenActiveRef.current,
    enterPreview: () => phoneViewRef.current?.("preview"),
    setSelectedFile,
    setActiveFile: setActiveArtboard,
    dragTimes: dragSessionMapRef,
    afterFocusChange(file) {
      frameSelectionRef.current = null;
      selectionAnchorRef.current = null;
      selectionFocusRef.current = null;
      const frameDrag = draggedArtboardRef.current;
      if (frameDrag && frameDrag.file !== file) {
        artboardEntriesRef.current.get(frameDrag.file)?.hostDrag("cancel", frameDrag.key);
        draggedArtboardRef.current = null;
        if (!frameDragRef.current) setStreamDragFile(null);
      }
      if (frameDragRef.current && frameDragRef.current.file !== file) selectionOverlayRef.current?.();
    },
    abandonSelectionGesture,
    clearFramePick: handleFramePick,
    setSelection,
  });
  const pageMenu = useCanvasPageMenu();
  const {
    filesOpen: filesOpen,
    setFilesOpen: setFilesOpen,
    filesOpenRef: filesOpenRef,
    triggerRef: pageMenuTriggerRef,
  } = pageMenu;
  let resetCanvasViewRef: Dynamic = (0, React.useRef)(
      (): Dynamic => false,
    ),
    renameInCanvasRef: Dynamic = (0, React.useRef)(null),
    exportPickingRef: Dynamic = (0, React.useRef)(false),
    canvasMenuRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    ),
    exportChromeHeightRef: Dynamic = (0, React.useRef)(0),
    restoreCameraRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    ),
    pageTabPlaceholder: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      abandonSelectionGesture();
      handleFramePick();
      setSelection(emptyCanvasSelection);
      setActiveArtboard(null);
      afterLeavingEdit((): Dynamic => setFilesOpen(true));
    }, [afterLeavingEdit, handleFramePick, abandonSelectionGesture]);
  const {
    switchPage: resolvePageArtboard,
    focusArtboard: navigateToFile,
    needsFit: needsPageFitRef,
    scheduleFirstArtboard,
    registerFirstArtboardCreator,
  } = useCanvasPageNavigation({
    activePageId,
    activePageRef: activePageIdRef,
    manifestRef: documentStateRef,
    phoneCanvas,
    editableRef,
    get fullscreenActiveRef() { return fullscreenActiveRef; },
    get layerSidebarScroll() { return layerSidebarScroll; },
    invalidatePendingFocus,
    fitPage: resetCanvasViewRef,
    restoreCamera: restoreCameraRef,
    camera: cameraController,
    abandonSelectionGesture,
    clearFramePick: handleFramePick,
    setActiveArtboard,
    setSelectedFile,
    setSelection,
    setPage: setFocusedArtboardId,
    setPlayingFile,
    setFullscreenView(view) { setFullscreenView(view); },
  });
  const pageActions = useCanvasPageActions({
    manifest: documentStateRef,
    editing: editingRef,
    trigger: pageMenuTriggerRef,
    supportsLoadState,
    record: (step, excludedFiles) => recordManifestHistoryRef.current(step, excludedFiles),
    persist: persistCanvasState,
    switchPage: resolvePageArtboard,
    scheduleFirstArtboard,
    showToast,
    deleteBoards: (files, notes, page) => deleteCanvasBoardsRef.current(files, notes, undefined, page),
  });
  useReconcileCanvasSelection({
    manifest: canvasDocumentState,
    selectedFile,
    setSelectedFile,
    setSelection,
    fallbackFile: () => phoneCanvas && editableRef.current && !fullscreenActiveRef.current
      ? null
      : activePageContentsRef.current.artboards.find((artboard: { frameless?: boolean }) => !artboard.frameless)?.file ?? null,
  });
  const {
    emptyFiles: emptyPieces,
    setEmptyFiles: setEmptyPieces,
    markDropped: markArtboardDropped,
    reportHull: reportFramelessContentHull,
  } = useFramelessArtboardSizing({
    manifest: canvasDocumentState,
    manifestRef: documentStateRef,
    editing,
    selectedFile,
    activeFile: activeArtboard,
    focusedFileRef,
    activeFileRef: activeArtboardRef,
    canResize: () => editingRef.current,
    isGesturing: () => hostGesturingRef.current || dropInProgressRef.current || manifestHistory.isApplying(),
    applyLayout(manifest) {
      const updated = serializeDocumentState(manifest);
      previousDocumentStateRef.current = updated;
      documentStateRef.current = updated;
      setCanvasDocumentState(updated);
      return updated;
    },
  });
  let [placeRequest, setPlaceRequest]: Dynamic = (0, React.useState)(
      null,
    ),
    handlePlaceHandled: Dynamic = (0, React.useCallback)(
      (): Dynamic => setPlaceRequest(null),
      [],
    ),
    placeActiveRef: Dynamic = (0, React.useRef)(false),
    [viewSettled, setViewSettled]: Dynamic = (0, React.useState)(
      false,
    ),
    settleView: Dynamic = (): Dynamic => {
      phoneCanvas && setViewSettled(true);
    },
    pasteHtmlContent: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof addBlankArtboard> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => addBlankArtboard({ get savePageSelection() { return savePageSelection; }, get doc() { return doc; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get clearDragToast() { return clearDragToast; }, get focusArtboard() { return focusCanvasArtboard; }, get placeActive() { return placeActiveRef; }, get setTool() { return setCanvasTool; }, get resetTool() { return setCanvasToolResetTick; }, get recordHistory() { return recordManifestHistoryRef; }, get manifest() { return documentStateRef; }, get placementObstacles() { return placementObstaclesRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [doc, persistCanvasState, focusCanvasArtboard, showToast, clearDragToast],
    );
  registerFirstArtboardCreator(pasteHtmlContent);
  let setBoardSelection: Dynamic = (0, React.useCallback)(
      (boardIds?: Dynamic, selectionMode?: Dynamic): Dynamic => {
        abandonSelectionGesture();
        leaveArtboardRef.current();
        let nextSelection: Dynamic =
            selectionMode === "toggle"
              ? toggleCanvasSelection(
                  selectionRef.current,
                  boardIds,
                )
              : selectionFromBoards(boardIds),
          focusedFile: Dynamic = focusedFileRef.current;
        focusedFile != null &&
          selectionRef.current.elements.has(focusedFile) &&
          !nextSelection.elements.has(focusedFile) &&
          handleFramePick();
        selectionRef.current = nextSelection;
        setSelection(nextSelection);
      },
      [handleFramePick, abandonSelectionGesture],
    );
  const {
    addAnnotationAtPoint,
    addAnnotationRef,
    addPenAnnotation,
    addShape,
    deleteAnnotation,
    duplicateAnnotation,
  } = useCanvasAnnotationCommands({
    documentStateRef,
    persistCanvasState,
    supportsLoadState,
    savePageSelection,
    recordHistory: (entry: Dynamic, boundId: Dynamic) =>
      recordManifestHistoryRef.current(entry, new Set(), undefined, boundId),
    finishBoundOperationRef: finishBoundOperationRef,
    boundSelectionsRef: boundSelectionsRef,
    selectDefaultTool: () => {
      setCanvasTool("select");
      setCanvasToolResetTick((tick: number) => tick + 1);
    },
    reportRejection: showDragToast,
    abandonSelectionGesture,
    clearFrameSelection: handleFramePick,
    setSelection,
    announce,
  });
  useCanvasKeyboardShortcuts({
    abandonSelectionGesture,
    focusedFileRef,
    isReplayingFile: frameSelection.isReplayingFile,
    selectionEpochRef,
    selectionRef,
    canvasRoot: canvasContainerRef,
    activeArtboard: activeArtboardRef,
    deleteElements: deleteSelectedElementsRef,
    flipSelection: commitSelectionTransformRef,
    pendingMoveCommits: selectionCommandEpochRef,
    combinedSelection: copySelectionRef,
    nothingSelectedMessage: nothingSelectedMessageRef,
    gesturing: hostGesturingRef,
    editing: editingRef,
    leaveArtboard: leaveArtboardRef,
    openContextMenu: canvasMenuRef,
    pendingFramePick: pendingFrameSelectionStateRef,
    applySelection: applySelectionRef,
    get activeTool() { return canvasToolRef; },
    get fullscreen() { return fullscreenActiveRef; },
    get stackArtboards() { return reorderArtboardsRef; },
    selectArtboardElements: selectAllArtboardElementsRef,
    get deleteBoardsAndNotes() { return deleteCanvasObjectsRef; },
    pendingSelectionEdits: pendingSelectionOperationsRef,
    afterSelectionEdits: abandonSelectionGestureRef,
    get layerCursor() { return layerKeyboardCursor; },
    navigateSelection: navigateSelectionRef,
    cancelFrameGesture: routeFrameEventRef,
    manifest: documentStateRef,
  });
  (0, React.useEffect)((): Dynamic => {
    let handleDuplicateShortcut: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        !(event.metaKey || event.ctrlKey) ||
        event.shiftKey ||
        event.altKey ||
        event.key.toLowerCase() !== "d" ||
        !editingRef.current ||
        fullscreenActiveRef.current
      )
        return;
      let selectionAtShortcut: Dynamic = selectionRef.current,
        editingTargetBlocked: Dynamic =
          isEditingInputTarget(event.target) ||
          hasBlockingEditorOverlay();
      if (
        !(
          focusedFileRef.current != null &&
          selectionAtShortcut.elements.has(focusedFileRef.current) &&
          !editingTargetBlocked
        )
      ) {
        if (editingTargetBlocked) {
          isDuplicateShortcut(event) && event.preventDefault();
          return;
        }
        event.preventDefault();
        !(
          isEmptyCanvasSelection(selectionAtShortcut) ||
          event.repeat ||
          hostGesturingRef.current
        ) &&
          (event.stopPropagation(),
          selectionAtShortcut.elements.size > 0
            ? selectionApplyRef.current()
            : abandonSelectionGestureRef.current((): Dynamic => {
                let currentSelection: Dynamic = selectionRef.current;
                !editingRef.current ||
                  hostGesturingRef.current ||
                  hasBlockingEditorOverlay() ||
                  isEmptyCanvasSelection(currentSelection) ||
                  (currentSelection.elements.size > 0
                    ? selectionApplyRef.current()
                    : duplicateSelectedBoardsRef.current(
                        canvasBoardSelection(currentSelection),
                      ));
              }));
      }
    };
    (document as Dynamic).addEventListener("keydown", handleDuplicateShortcut, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", handleDuplicateShortcut, true);
  }, []);
  let duplicateSelectedBoardsAction: Dynamic = (0, React.useCallback)(
      (...args: Dynamic[]): Dynamic => (duplicateSelectedBoards as Dynamic)({ get duplicateObjects() { return duplicateCanvasObjectsRef; }, get revealBounds() { return duplicateArtboards; }, get pageContents() { return activePageContentsRef; }, get placementObstacles() { return placementObstaclesRef; } }, ...args),
      [],
    ),
    duplicateSelectedBoardsRef: Dynamic = (0, React.useRef)(duplicateSelectedBoardsAction);
  duplicateSelectedBoardsRef.current = duplicateSelectedBoardsAction;
  let placeDroppedImagesRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    ),
    placeDroppedVideosRef: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    ),
    handleImageDrop: Dynamic = (0, React.useCallback)(
      (
        items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        operation: Dynamic = "dropped",
        extra?: Dynamic,
        detail?: Dynamic,
        argument: Dynamic = 0,
      ): Dynamic => {
        let images: Dynamic = items.filter(
            (input?: Dynamic): Dynamic =>
              input instanceof File && input.type.startsWith("image/"),
          ),
          acceptedImages: Dynamic = images.slice(0, 6),
          videos: Dynamic = items.filter(
            (input?: Dynamic): Dynamic =>
              input instanceof File && isVideoFile(input),
          ),
          mediaKind: Dynamic = acceptedImages.length > 0 ? "images" : "videos";
        if (acceptedImages.length === 0 && videos.length === 0) {
          items.length > 0 &&
            showDragToast(
              uiMessage("canvas.designCanvas.onlyImagesAndMp4Mov", { operation: uiOperation(operation) }),
            );
          return;
        }
        if (!editable) {
          showDragToast(
            uiMessage("canvas.designCanvas.thisDesignIsViewOnly", { mediaKind: uiOperation(mediaKind) }),
          );
          return;
        }
        if (!editingRef.current) return;
        let placementOptions: Dynamic = extra;
        images.length > acceptedImages.length &&
          showDragToast(
            uiMessage("canvas.designCanvas.placingFirstImages", { count: String(6) }),
          );
        acceptedImages.length > 0 &&
          placeDroppedImagesRef.current(acceptedImages, options, context, operation, placementOptions);
        videos.length > 0 &&
          placeDroppedVideosRef.current(
            videos,
            options,
            context,
            operation,
            placementOptions,
            acceptedImages.length + argument,
            placementOptions === extra ? detail : undefined,
          );
      },
      [showDragToast, editable],
    ),
    { pendingPictures, setPendingPictures, pendingPicturesRef, pendingPictureSequenceRef, pagePendingPictures } =
      usePendingPictures(activePageId),
    findDropArtboardAtPoint: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let artboards: Dynamic = activePageContentsRef.current.artboards;
        return context != null
          ? artboards.find(
              (artboard?: Dynamic): Dynamic => artboard.file === context,
            )
          : [...artboards]
              .reverse()
              .find(
                (artboard?: Dynamic): Dynamic =>
                  !(artboard.frameless && artboard.file !== activeArtboardRef.current) &&
                  input >= artboard.x &&
                  input <= artboard.x + artboard.w &&
                  options >= artboard.y &&
                  options <= artboard.y + artboard.h,
              );
      },
      [],
    ),
    placeDroppedImagesAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof placeDroppedImages> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => placeDroppedImages({ get focusedFile() { return focusedFileRef; }, get selection() { return selectionRef; }, get setSelection() { return setSelection; }, get artboardEntries() { return artboardEntriesRef; }, get showDragToast() { return showDragToast; }, get playingFile() { return playingFileRef; }, get addAnnotation() { return addAnnotationRef; }, get setPendingPictures() { return setPendingPictures; }, get pendingPictures() { return pendingPicturesRef; }, get pictureSequence() { return pendingPictureSequenceRef; }, get findDropArtboard() { return findDropArtboardAtPoint; }, get canvasTool() { return canvasToolRef; }, get clearFramePick() { return handleFramePick; }, get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; } }, ...args),
      [showDragToast, handleFramePick, findDropArtboardAtPoint],
    );
  placeDroppedImagesRef.current = placeDroppedImagesAction;
  let placeDroppedVideosAction: Dynamic = (0, React.useCallback)(
    (...args: Parameters<typeof placeDroppedVideos> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => placeDroppedVideos({ get focusedFile() { return focusedFileRef; }, get selection() { return selectionRef; }, get setSelection() { return setSelection; }, get artboardEntries() { return artboardEntriesRef; }, get showDragToast() { return showDragToast; }, get playingFile() { return playingFileRef; }, get addAnnotation() { return addAnnotationRef; }, get pendingPictures() { return pendingPicturesRef; }, get findDropArtboard() { return findDropArtboardAtPoint; }, get canvasTool() { return canvasToolRef; }, get clearFramePick() { return handleFramePick; }, get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; } }, ...args),
    [showDragToast, findDropArtboardAtPoint],
  );
  placeDroppedVideosRef.current = placeDroppedVideosAction;
  let placeTool: Dynamic = (0, React.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        direction?: Dynamic,
      ): Dynamic => {
        let holdToken: Dynamic;
        if (input === "text") {
          let newHoldToken: Dynamic = beginDeferredTextInput();
          if (newHoldToken === null) return;
          holdToken = newHoldToken;
          artboardEntriesRef.current.get(options)?.textPlacing();
        }
        focusCanvasArtboard(options).then((focused?: Dynamic): Dynamic => {
          focused && editingRef.current
            ? setPlaceRequest({
                file: options,
                tool: input,
                ...context,
                dir: direction,
                holdToken: holdToken,
              })
            : holdToken !== undefined &&
              finishDeferredTextInput("edit", holdToken);
        });
      },
      [focusCanvasArtboard],
    ),
    handlePlaceBlocked: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let toolDescription: Dynamic = (
          {
            text: "text",
            rect: "a rectangle",
            oval: "an oval",
            arrow: "an arrow",
            line: "a line",
          } as Dynamic
        )[input];
        showDragToast(
          options === "blocked"
            ? uiMessage("canvas.designCanvas.thatArtboardDidnTLoad") +
                toolDescription +
                "."
            : uiMessage("canvas.designCanvas.clickInsideAnArtboardTo") + toolDescription + ".",
        );
      },
      [showDragToast],
    ),
    [canvasTool, setCanvasTool]: Dynamic = (0, React.useState)(
      "select",
    ),
    canvasToolRef: Dynamic = (0, React.useRef)(canvasTool);
  canvasToolRef.current = canvasTool;
  let [canvasToolResetTick, setCanvasToolResetTick]: Dynamic = (0, React.useState)(
    0,
  );
  (0, React.useEffect)((): Dynamic => {
    editing || (setCanvasTool("select"), setPlaceRequest(null));
  }, [editing]);
  (0, React.useEffect)((): Dynamic => {
    setCanvasTool("select");
    setPlaceRequest(
      (input?: Dynamic): Dynamic =>
        input && input.file !== selectedFile ? null : input,
    );
  }, [selectedFile]);
  let createPastedNotes: Dynamic = (input?: Dynamic): Dynamic => {
      let existingAnnotations: Dynamic = documentStateRef.current.annotations ?? [],
        items: Dynamic = [];
      for (let note of input as Dynamic) {
        let annotationId: Dynamic = createAnnotationId(
          [...existingAnnotations, ...items],
          supportsLoadState,
          annotationKindCategory(note.src),
        );
        items.push(
          moveAnnotation(
            {
              ...note.src,
              id: annotationId,
            },
            Math.round(note.x),
            Math.round(note.y),
          ),
        );
      }
      return items;
    },
    duplicateArtboardFilesAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof duplicateArtboardFiles> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => duplicateArtboardFiles({ get createNotes() { return createPastedNotes; }, get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get finishBoundOperation() { return finishBoundOperationRef; }, get boundSelections() { return boundSelectionsRef; }, get artboardEntries() { return artboardEntriesRef; }, get recordHistory() { return recordManifestHistory; }, get manifest() { return documentStateRef; }, get pageContents() { return activePageContentsRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [doc, canvasDocumentState, persistCanvasState, showToast],
    ),
    duplicateCanvasObjects: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof duplicateBoardsAndNotes> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => duplicateBoardsAndNotes({ get createNotes() { return createPastedNotes; }, get setSelection() { return setSelection; }, get finishBoundOperation() { return finishBoundOperationRef; }, get boundSelections() { return boundSelectionsRef; }, get showDragToast() { return showDragToast; }, get duplicateAnnotation() { return duplicateAnnotation; }, get duplicateArtboardFiles() { return duplicateArtboardFilesAction; }, get recordHistory() { return recordManifestHistoryRef; }, get clearFramePick() { return handleFramePick; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [duplicateArtboardFilesAction, duplicateAnnotation, persistCanvasState, handleFramePick, showDragToast],
    ),
    duplicateCanvasObjectsRef: Dynamic = (0, React.useRef)(duplicateCanvasObjects);
  duplicateCanvasObjectsRef.current = duplicateCanvasObjects;
  const {
    fullscreenActiveRef,
    fullscreenFileRef,
    fullscreenView,
    fullscreenViewRef,
    isDockedCanvas,
    landingFileRef,
    navigateAdjacentArtboard,
    openArtboardRef,
    pendingFrameFocus,
    restoreCamera,
    setFullscreenView,
  } = useFullscreenPlaybackState({
    initialFile: focusedArtboardState,
    canvasDocument: canvasDocumentState,
    activePageId,
    canvasScale,
    cameraController,
    toolbarInset,
    toolbarInsetReadyRef,
    resetCanvasViewRef: resetCanvasViewRef,
    closeInlinePlayback: setPlayingFile,
    visiblePageRef: activePageContentsRef,
    artboardEntriesRef,
  });
  restoreCameraRef.current = restoreCamera;
  let phoneCanvasWithoutFullscreen: Dynamic = phoneCanvas && fullscreenView == null;
  usePhoneCanvasVisibility(phoneCanvasWithoutFullscreen && !phoneCanvasKilledEarlier);
  let phoneSelectedArtboard: Dynamic =
      phoneCanvasWithoutFullscreen && editing && selectedFile != null
        ? (previousDocumentStateRef.current ?? canvasDocumentState).artboards.find(
            (input?: Dynamic): Dynamic => input.file === selectedFile,
          )
        : undefined,
    canvasFocusedFile: Dynamic =
      phoneSelectedArtboard &&
      shouldDelayPreviewMount(phoneSelectedArtboard, {
        editing: editing,
        runsNothing: phoneCanvasKilledEarlier,
      })
        ? null
        : selectedFile,
    showCanvasTools: Dynamic =
      editing &&
      fullscreenView == null &&
      canvasFocusedFile == null &&
      playingFile == null &&
      true;
  (0, React.useEffect)((): Dynamic => {
    showCanvasTools || setCanvasTool("select");
  }, [showCanvasTools]);
  let editingSelectionVisibleRef: Dynamic = (0, React.useRef)(editing);
  editingSelectionVisibleRef.current = editing;
  let inspectSelectionVisible: Dynamic = readOnly,
    [tweakValues, setTweakValues]: Dynamic = (0, React.useState)(
      {},
    ),
    updateTweakValue: Dynamic = (0, React.useCallback)(
      (key?: Dynamic, enabled?: Dynamic): Dynamic => {
        setTweakValues(
          (currentValues?: Dynamic): Dynamic =>
            !!currentValues[key] === enabled
              ? currentValues
              : {
                  ...currentValues,
                  [key]: enabled,
                },
        );
      },
      [],
    ),
    designContextPublisherRef: Dynamic = (0, React.useRef)(null),
    presenceReporterRef: Dynamic = (0, React.useRef)(null),
    [presenceColor, setPresenceColor]: Dynamic = (0, React.useState)(
      "",
    );
  const [externalPaste]: [ReturnType<typeof createExternalPasteController>] =
    (0, React.useState)(createExternalPasteController);
  (0, React.useEffect)((): Dynamic => {
    let publisher: Dynamic = createDesignContextPublisher();
    designContextPublisherRef.current = publisher;
    let presenceReporter: Dynamic = createPresenceReporter({
      minDelta: 2,
    });
    presenceReporterRef.current = presenceReporter;
    getCurrentUserProfile().then((profile?: Dynamic): Dynamic => {
      presenceReporter.setWho(profile?.name ?? "", profile?.color ?? "");
      setPresenceColor(profile?.color ?? "");
    });
    let disposed: Dynamic = false,
      disposePresence: Dynamic = (): Dynamic => {
        externalPaste.cancel();
        !disposed &&
          ((disposed = true),
          publisher.dispose(),
          presenceReporter.dispose(),
          (designContextPublisherRef.current = null),
          (presenceReporterRef.current = null));
      };
    setEmbedSilencer(disposePresence);
    return (): Dynamic => {
      setEmbedSilencer(null);
      disposePresence();
    };
  }, []);
  let worldPointerHandlers: Dynamic =
      embedMemoryPrefix() + "canvas:" + activePageId,
    worldPointerActiveRef: Dynamic = (0, React.useRef)(false),
    handleWorldPointer: Dynamic = (x?: Dynamic, y?: Dynamic): Dynamic => {
      worldPointerActiveRef.current = true;
      presenceReporterRef.current?.move(
        worldPointerHandlers,
        Math.round(x),
        Math.round(y),
      );
    },
    handlePagePointer: Dynamic = (0, React.useCallback)(
      (x?: Dynamic, y?: Dynamic, pageKey?: Dynamic): Dynamic => {
        filesOpenRef.current ||
          ((worldPointerActiveRef.current = false),
          presenceReporterRef.current?.move(
            pageCommentSurfaceKey(x),
            Math.round(y),
            Math.round(pageKey),
          ));
      },
      [],
    ),
    fullscreenViewFile: Dynamic = fullscreenView?.file ?? null;
  (0, React.useEffect)(
    (): Dynamic => (): Dynamic => {
      worldPointerActiveRef.current = false;
      presenceReporterRef.current?.say("");
      presenceReporterRef.current?.clear();
    },
    [fullscreenViewFile, fullscreenView?.fit, filesOpen, activePageId],
  );
  let canOpenCanvas: Dynamic = (0, React.useCallback)(
      (event?: Dynamic): Dynamic =>
        !isEditingInputTarget(event.target) &&
        !hasBlockingEditorOverlay() &&
        !fullscreenActiveRef.current &&
        worldPointerActiveRef.current,
      [],
    ),
    designContextSnapshot: Dynamic =
      canvasReady ||
      (!supportsLoadState && localDirty) ||
      sessionsDirty ||
      doc.dirty();
  useLiveDismissalGuard((): Dynamic => false);
  useDesignContextReporting({
    canvasScale, canvasViewport, page: activePageContents, activePageId, activePageTitle,
    selectionChangeTick, modelChangeTick, fullscreenView, editing,
    selectedFileIds, inUseFiles, selection, dirty: designContextSnapshot,
    problems: artboardProblems.problems, getProblems: () => artboardProblems.problems, artboardEntriesRef, designContextPublisherRef,
    canvasContainerRef,
  });
  let expandArtboard: Dynamic = (0, React.useCallback)(
      (fileKey?: Dynamic, cameraState?: Dynamic): Dynamic => {
        let artboard: Dynamic = canvasDocumentState.artboards.find(
          (candidate?: Dynamic): Dynamic => candidate.file === fileKey,
        );
        artboard &&
          afterLeavingEdit(
            (): Dynamic =>
              setFullscreenView({
                file: fileKey,
                prev: cameraState ?? cameraController.get(),
                fit: artboardIsNotExpandedFill(artboard),
              }),
          );
      },
      [canvasDocumentState, afterLeavingEdit, cameraController],
    ),
    expandArtboardRef: Dynamic = (0, React.useRef)(expandArtboard);
  expandArtboardRef.current = expandArtboard;
  let openCanvasFile: Dynamic = useLatestCallback(
      (fileKey?: Dynamic): Dynamic => afterLeavingEdit((): Dynamic => navigateToFile(fileKey)),
    ),
    duplicateArtboards: Dynamic = (0, React.useRef)(
      (): Dynamic => {},
    );
  const handlePreviewOpen = useInlinePlaybackControls({
    playingFile,
    setPlayingFile,
    selectedFile,
    setSelectedFile,
    documentStateRef,
    activePageIdRef,
    visiblePageRef: activePageContentsRef,
    resolvePageArtboard,
    navigateAfterEdits: afterLeavingEdit,
    phoneCanvas,
    fullscreenActiveRef,
    setFullscreenView,
    restoredPageRef: needsPageFitRef,
    editingRef,
    editableRef,
    controlsDisabled: phoneCanvasKilledEarlier,
    cameraController,
    selectionEpochRef,
    focusedFileRef,
    clearFramePick: handleFramePick,
    setSelection,
  });
  useInspectorPanelShortcut({
    toggle: toggleInspector,
    phoneCanvas,
    editing: editingRef,
    readOnly: readOnlyRef,
    fullscreen: fullscreenActiveRef,
    filesOpen: filesOpenRef,
  });
  let findHomeFocusElement: Dynamic = (input?: Dynamic): Dynamic =>
      input == null
        ? null
        : (canvasContainerRef.current?.querySelector(
            `[data-mega-artboard="${CSS.escape(input)}"] [data-mega-title-text]`,
          ) ?? null),
    canvasKeyboardFocus: Dynamic = useCanvasKeyboardFocus(
      [
        {
          el: (): Dynamic =>
            toolbarRootRef.current?.querySelector("header.tb-root") ?? null,
        },
        {
          el: (): Dynamic => canvasContainerRef.current,
          home: true,
          clipTo: (): Dynamic => canvasContainerRef.current,
          anchor: (): Dynamic =>
            findHomeFocusElement(selectionGestureRef.current?.insideRef.current ?? null),
          fallback: (): Dynamic => findHomeFocusElement(focusedFileRef.current),
        },
        {
          el: (): Dynamic =>
            canvasContainerRef.current?.querySelector("[data-mega-selection-strip]") ??
            null,
          clipTo: (): Dynamic => canvasContainerRef.current,
          escapeHome: true,
        },
        inspectorFocusRegion,
      ],
      (): Dynamic => filesOpenRef.current,
    );
  installBeforeSave(() => saveCanvasLaunchView({
    manifest: documentStateRef,
    activePage: activePageIdRef,
    fullscreenFile: fullscreenFileRef,
    entryFile: filePath,
    doc,
    editable,
    supportsLoadState,
    commitManifest(manifest) {
      previousDocumentStateRef.current = manifest;
      documentStateRef.current = manifest;
      setCanvasDocumentState(manifest);
    },
  }));
  useCanvasSaveOnExit({
    doc,
    editable,
    supportsLoadState,
    settleSessionRef,
    flushDirtySessions,
    cancelPaste: () => externalPaste.cancel(),
    pasteTimeoutMs: canvasExitExportWaitTimeoutMs,
  });
  (0, React.useEffect)(() => subscribePlayModeKeys({
    artboardEntriesRef,
    commenting,
    fullscreenView,
    restoreCamera,
    navigateAdjacentArtboard,
    pendingFrameFocus,
    visiblePageRef: activePageContentsRef,
  }), [fullscreenView, commenting, restoreCamera, navigateAdjacentArtboard]);
  useInlinePlaybackEscape({
    playingFile,
    pageArtboards: activePageContents.artboards,
    fullscreenView,
    commenting,
    setPlayingFile,
    artboardEntriesRef,
    editingRef,
    selectionRef,
    toolRef: canvasToolRef,
  });
  (0, React.useEffect)(() => subscribePreviewOpenMessages({
    cameraController,
    artboardEntriesRef,
    editingRef,
    readOnlyRef,
    playingFileRef,
    pageNavigationGuardRef: filesOpenRef,
    restoredPageRef: needsPageFitRef,
    resolvePageArtboard,
    fullscreenActiveRef,
    fullscreenFileRef,
    setFullscreenView,
    openArtboardRef,
    openInlinePlayback: handlePreviewOpen,
    pendingFrameFocus,
    documentStateRef,
    activePageIdRef,
  }), [resolvePageArtboard, handlePreviewOpen, handleFramePick, cameraController]);
  const fullscreenBox = useFullscreenViewport({
    fullscreenView,
    canvasDocument: canvasDocumentState,
    restoreCamera,
    phoneCanvas,
    setSelection,
    toolbarInset,
    cameraController,
    canvasViewport,
    canvasContainerRef,
    dockedPadding: canvasPastePositionStep,
  });
  const recordManifestHistoryRef: Dynamic = React.useRef(() => {});
  const {
    rename: renameArtboard,
    setPrint: setArtboardPrintMode,
    setPaper: setArtboardPaper,
    resize: resizeArtboard,
    setGuides: setArtboardGuides,
    setRadius: setArtboardRadius,
    reorder: reorderArtboards,
    reorderRef: reorderArtboardsRef,
  } = useArtboardManifestEdits({
    manifest: canvasDocumentState,
    current: documentStateRef,
    saved: previousDocumentStateRef,
    record: recordManifestHistoryRef,
    setPreview: setCanvasDocumentState,
    persist: persistCanvasState,
  });
  const manifestHistory = useCanvasManifestHistory({
    doc,
    manifest: canvasDocumentState,
    latestManifest: documentStateRef,
    savedManifest: previousDocumentStateRef,
    page: activePageIdRef,
    frames: artboardEntriesRef,
    hostGesturing: hostGesturingRef,
    textEdit: commitOpenTextEditRef,
    pendingRecords: finishBoundOperationRef,
    boundRecordMergers: boundRecordMergersRef,
    switchPage: resolvePageArtboard,
    persist: persistCanvasState,
    showToast,
    say: showDragToast,
    clearInlineRedo: () => inlineHistoryRef.current?.clearRedo(),
    clearKeptRedo: () => sessionHistoryRef.current?.keeper.clearRedo(),
    inlineHistory: () => inlineHistoryRef.current,
    whenReady: runWhenConditionReady,
  });
  const {
    record: recordManifestHistory,
    recordTweak: recordTweakHistory,
    reachable: reachableManifestStep,
    apply: applyManifestStep,
    revision: manifestHistoryRevision,
  } = manifestHistory;
  recordManifestHistoryRef.current = recordManifestHistory;
  let nudgeBoardsAction: Dynamic = (0, React.useCallback)(
      (...args: Dynamic[]): Dynamic => (nudgeBoardsWithHistory as Dynamic)({ history: manifestHistory, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [reachableManifestStep, recordManifestHistory, manifestHistory.invalidateRedo, persistCanvasState],
    );
  nudgeBoardsWithHistoryRef.current = nudgeBoardsAction;
  let flipAnnotationsAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof flipAnnotationsWithHistory> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => flipAnnotationsWithHistory({ get finishBoundOperation() { return finishBoundOperationRef; }, get editing() { return editingRef; }, get recordHistory() { return recordManifestHistory; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [recordManifestHistory, persistCanvasState],
    ),
    flipSelectedAnnotations: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let refusalMessage: Dynamic = flipInProgressRef.current
          ? flipStillInProgressMessage
          : runFlipSelectedObjects();
        if (refusalMessage !== undefined) {
          showDragToastRef.current?.(refusalMessage + ".");
          return false;
        }
        if (
          !sessionAllowsMutation({
            gesturing: hostGesturingRef.current,
            setMoveCommits: selectionCommandEpochRef.current,
          })
        )
          return false;
        let { flipped: flipped, refused: refused }: Dynamic = flipAnnotationsAction(
          input,
          options,
        );
        refused !== undefined &&
          showDragToastRef.current?.(
            partialFlipMessage(
              refused,
              flipped,
              GeometryFlipAnnotationsWytKytYtConfig,
            ),
          );
        flipped &&
          announce(
            flipDirectionAnnouncement(options),
          );
        return flipped;
      },
      [flipAnnotationsAction, runFlipSelectedObjects],
    );
  flipSelectedAnnotationsRef.current = flipSelectedAnnotations;
  flipAnnotationsWithHistoryRef.current = flipAnnotationsAction;
  let updateAnnotationBoxAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof setAnnotationBox> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => setAnnotationBox({ get recordHistory() { return recordManifestHistoryRef; }, get setManifestState() { return setCanvasDocumentState; }, get previousManifest() { return previousDocumentStateRef; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [persistCanvasState],
    ),
    updateAnnotationCssAction: Dynamic = (0, React.useCallback)(
      (...args: Dynamic[]): Dynamic => (setAnnotationCss as Dynamic)({ get showDragToast() { return showDragToast; }, get recordHistory() { return recordManifestHistoryRef; }, history: manifestHistory, get setManifestState() { return setCanvasDocumentState; }, get previousManifest() { return previousDocumentStateRef; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [persistCanvasState, showDragToast, reachableManifestStep, manifestHistory.invalidateRedo],
    ),
    setAnnotationArrowHeadsAction: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let annotations: Dynamic = documentStateRef.current.annotations ?? [],
          annotation: Dynamic = annotations.find(
            (candidate?: Dynamic): Dynamic => candidate.id === input,
          );
        if (
          !annotation ||
          (annotation.kind !== "line" && annotation.kind !== "arrow")
        )
          return;
        let previousArrowHeads: Dynamic = annotationArrowHeads(annotation);
        if (previousArrowHeads[options] === context) return;
        let state: Dynamic = {
          ...previousArrowHeads,
          [options]: context,
        };
        recordManifestHistoryRef.current(
          {
            kind: "ann-heads",
            id: input,
            from: previousArrowHeads,
            to: state,
          },
          new Set(),
        );
        persistCanvasState({
          ...documentStateRef.current,
          annotations: annotations.map(
            (candidate?: Dynamic): Dynamic =>
              candidate.id === input
                ? updateAnnotationArrowHeads(annotation, state)
                : candidate,
          ),
        });
      },
      [persistCanvasState],
    ),
    updateAnnotationTextStyleAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof setAnnotationTextStyle> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => setAnnotationTextStyle({ get recordHistory() { return recordManifestHistoryRef; }, get setManifestState() { return setCanvasDocumentState; }, get previousManifest() { return previousDocumentStateRef; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [persistCanvasState],
    ),
    replaceAnnotationPictureAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof replaceAnnotationPicture> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => replaceAnnotationPicture({ get showDragToast() { return showDragToast; }, get recordHistory() { return recordManifestHistoryRef; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [persistCanvasState, showDragToast],
    ),
    annotationMediaOperationsRef: Dynamic = (0, React.useRef)(new Map()),
    replaceAnnotationMediaAction: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof replaceAnnotationMedia> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => replaceAnnotationMedia({ get showDragToast() { return showDragToast; }, get recordHistory() { return recordManifestHistoryRef; }, get mediaOperations() { return annotationMediaOperationsRef; }, get manifest() { return documentStateRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [persistCanvasState, showDragToast],
    );
  discardBoundHistoryRef.current = manifestHistory.discardBound;
  prepareHistoryRef.current = (input?: Dynamic): Dynamic => {
    let history: Dynamic = inlineHistoryRef.current;
    if (!history) return;
    history.settle();
    let staleBound: Dynamic = history.staleBound(input);
    staleBound != null && discardBoundHistoryRef.current(staleBound);
  };
  const manifestHistoryRef: Dynamic = React.useRef({
    reachable: reachableManifestStep,
    apply: applyManifestStep,
  });
  manifestHistoryRef.current = {
    reachable: reachableManifestStep,
    apply: applyManifestStep,
  };
  reachableManifestStepRef.current = reachableManifestStep;
  (0, React.useEffect)((): Dynamic => {
    let handleManifestHistoryKey: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        !(
          event.key.toLowerCase() === "z" &&
          (event.metaKey || event.ctrlKey)
        ) ||
        event.repeat ||
        !editingRef.current ||
        filesOpenRef.current ||
        isCanvasTypingTarget(event.target) ||
        selectionCommandEpochRef.current > 0
      )
        return;
      if (inlineHistoryRef.current?.busy()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      let direction: Dynamic = event.shiftKey ? "redo" : "undo";
      reachableManifestStep(direction) &&
        (event.preventDefault(), event.stopPropagation(), applyManifestStep(direction));
    };
    (document as Dynamic).addEventListener("keydown", handleManifestHistoryKey, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", handleManifestHistoryKey, true);
  }, [reachableManifestStep, applyManifestStep]);
  const {
    sessionHistory: sessionHistoryRef,
    keeper: keptEditHistory,
    bridge: inlineHistoryRef,
    setPanelUndoTarget,
  } = useCanvasSessionHistory({
    doc,
    editing,
    resetTick: toolResetTick,
    frames: artboardEntriesRef,
    savedManifest: previousDocumentStateRef,
    activePage: activePageIdRef,
    mayShowPage: () => !hostGesturingRef.current && !manifestHistory.isApplying() && !filesOpenRef.current,
    afterExitGuard: afterLeavingEdit,
    switchPage: resolvePageArtboard,
    artboardTitle: getArtboardTitle,
    componentName: componentNameForFile,
    showToast,
    say: (message) => showDragToastRef.current?.(message),
    refreshHistory: (file) => discardBoundHistoryRef.current(file),
    applyBoundStep(historyKey, direction) {
      runWhenConditionReady(
        () => !manifestHistory.isApplying(),
        () => {
          if (reachableManifestStepRef.current?.(direction)?.bound === historyKey) manifestHistoryRef.current.apply(direction, true);
        },
      );
    },
  });
  const { handleHistoryPush, handleHistoryRevoke, handleHistoryApply, handleHistoryDrop } = useCanvasHistoryTransactions({
    manifestHistory,
    inlineHistory: inlineHistoryRef,
    textEdit: commitOpenTextEditRef,
    focusedFile: focusedFileRef,
    flushPending: sessionFlushPendingRef,
    recordArtboardActivity,
    markSelectionFile,
    setSelectionChangeTick,
  });
  (0, React.useEffect)((): Dynamic => {
    let handleCanvasHistoryKey: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        !(
          event.key.toLowerCase() === "z" &&
          (event.metaKey || event.ctrlKey)
        ) ||
        !editingRef.current ||
        filesOpenRef.current ||
        isCanvasTypingTarget(event.target)
      )
        return;
      let history: Dynamic = inlineHistoryRef.current;
      if (!history) return;
      if (history.busy() || selectionCommandEpochRef.current > 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      let direction: Dynamic = event.shiftKey ? "redo" : "undo";
      prepareHistoryRef.current(direction);
      if (manifestHistoryRef.current.reachable(direction)) return;
      if (direction === "undo" ? !history.canUndo() : !history.canRedo()) {
        announce(
          AccessibilityAnnouncementsUndoRedoConfig[direction],
        );
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      (direction === "undo" ? history.undo() : history.redo()) ===
        "skipped-all" &&
        showDragToast(
          uiMessage("canvas.designCanvas.nothingLeftTo") +
            direction +
            " \u2014 that artboard's history changed.",
        );
    };
    (document as Dynamic).addEventListener("keydown", handleCanvasHistoryKey, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", handleCanvasHistoryKey, true);
  }, [showDragToast]);
  let canvasUndoRef: Dynamic = (0, React.useRef)(null),
    runCanvasHistoryAction: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      stepInlineHistory({
        blocked: (): Dynamic =>
          (inlineHistoryRef.current?.busy() ?? false) || selectionCommandEpochRef.current > 0,
        stillOk: (): Dynamic => editingRef.current && !filesOpenRef.current,
        liveUndoDepth: readLiveUndoDepth,
        canvasStep: (direction?: Dynamic): Dynamic =>
          manifestHistoryRef.current.reachable(direction),
        textEdit: commitOpenTextEditRef.current,
        pending: sessionFlushPendingRef,
        dir: input,
        step: options,
      });
    };
  canvasUndoRef.current ??= {
    exec(): Dynamic {
      throw new Error(
        "mega-editor history is snapshot-based \u2014 record via the edit paths, not UndoStack.exec",
      );
    },
    seed(): Dynamic {
      throw new Error(
        "mega-editor history is snapshot-based \u2014 record via the edit paths, not UndoStack.seed",
      );
    },
    undo: (): Dynamic =>
      runCanvasHistoryAction("undo", (): Dynamic => {
        prepareHistoryRef.current("undo");
        if (manifestHistoryRef.current.reachable("undo")) {
          manifestHistoryRef.current.apply("undo");
          return;
        }
        let result: Dynamic = inlineHistoryRef.current?.undo();
        result === "skipped-all"
          ? showDragToastRef.current?.(
              uiMessage("canvas.designCanvas.nothingLeftToUndoThat"),
            )
          : result === "empty" &&
            announce(
              AccessibilityAnnouncementsUndoRedoConfig.undo,
            );
      }),
    redo: (): Dynamic =>
      runCanvasHistoryAction("redo", (): Dynamic => {
        prepareHistoryRef.current("redo");
        if (manifestHistoryRef.current.reachable("redo")) {
          manifestHistoryRef.current.apply("redo");
          return;
        }
        let result: Dynamic = inlineHistoryRef.current?.redo();
        result === "skipped-all"
          ? showDragToastRef.current?.(
              uiMessage("canvas.designCanvas.nothingLeftToRedoThat"),
            )
          : result === "empty" &&
            announce(
              AccessibilityAnnouncementsUndoRedoConfig.redo,
            );
      }),
    canUndo: (): Dynamic =>
      manifestHistoryRef.current.reachable("undo") != null ||
      (inlineHistoryRef.current?.canUndo() ?? false),
    canRedo: (): Dynamic =>
      manifestHistoryRef.current.reachable("redo") != null ||
      (inlineHistoryRef.current?.canRedo() ?? false),
    redoDepth: (): Dynamic =>
      manifestHistoryRef.current.reachable("redo") != null ||
      (inlineHistoryRef.current?.canRedo() ?? false)
        ? 1
        : 0,
    clear(): Dynamic {},
    subscribe: (input?: Dynamic): Dynamic =>
      inlineHistoryRef.current?.subscribe(input) ?? ((): Dynamic => {}),
  };
  let showDragToastRef: Dynamic = (0, React.useRef)(showDragToast);
  showDragToastRef.current = showDragToast;
  let deleteCanvasBoards: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof deleteBoardsAndNotes> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => deleteBoardsAndNotes({ get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get finishBoundOperation() { return finishBoundOperationRef; }, get artboardEntries() { return artboardEntriesRef; }, get resolvePageArtboard() { return resolvePageArtboard; }, get recordHistory() { return recordManifestHistory; }, get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; }, get persistManifest() { return persistCanvasState; } }, ...args),
      [canvasDocumentState, persistCanvasState, recordManifestHistory, doc, showToast, showDragToast, resolvePageArtboard],
    ),
    deleteCanvasBoardsRef: Dynamic = (0, React.useRef)(deleteCanvasBoards);
  deleteCanvasBoardsRef.current = deleteCanvasBoards;
  let duplicateArtboardFilesRef: Dynamic = (0, React.useRef)(duplicateArtboardFilesAction);
  duplicateArtboardFilesRef.current = duplicateArtboardFilesAction;
  let savePageSelectionRef: Dynamic = (0, React.useRef)(savePageSelection);
  savePageSelectionRef.current = savePageSelection;
  let hostedCanvasApi: Dynamic = (0, React.useMemo)((): Dynamic => buildHostedEditorCanvasApi({
        document: { get doc() { return doc; }, get supportsLoadState() { return supportsLoadState; }, get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; }, get persistManifest() { return persistCanvasState; }, get savePageSelection() { return savePageSelectionRef; } },
        session: { get pendingCommands() { return selectionCommandEpochRef; }, get holdCommand() { return runSelectionCommand; }, get dropInProgress() { return dropInProgressRef; } },
        artboards: { get focus() { return focusCanvasArtboardRef; }, get revealBounds() { return duplicateArtboards; }, get deleteBoards() { return deleteCanvasBoardsRef; }, get duplicateFiles() { return duplicateArtboardFilesRef; } },
        history: { get recordManifest() { return recordManifestHistoryRef; }, get inlineHistory() { return inlineHistoryRef; }, get canvasUndo() { return canvasUndoRef; }, get mark() { return manifestHistory.mark; }, get depth() { return manifestHistory.depth; } },
      }), [doc, persistCanvasState, supportsLoadState, runSelectionCommand]);
  let lastRepeatRefusedAtRef: Dynamic = (0, React.useRef)(0),
    handleRepeatRefused: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        if (input !== focusedFileRef.current) return;
        let now: Dynamic = Date.now();
        now - lastRepeatRefusedAtRef.current < 1500 ||
          ((lastRepeatRefusedAtRef.current = now),
          showDragToast(
            context === "self"
              ? options < 2
                ? uiMessage("canvas.designCanvas.thatElementIsARepeating")
                : uiMessage("canvas.designCanvas.thatElementRepeats") +
                  String(options) +
                  " \u2014 its copies are one shared design, so it can\u2019t be dragged out on its own."
              : uiMessage("canvas.designCanvas.thatLayoutHasRepeatingRows"),
          ));
      },
      [showDragToast],
    ),
    deleteCanvasObjects: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        abandonSelectionGesture();
        if (
          input.files.size > 0 &&
          deleteCanvasBoards(input.files, input.notes, options)
        )
          return true;
        if (input.notes.size === 0) return false;
        if (input.notes.size === 1)
          return deleteAnnotation([...input.notes][0], options);
        let annotations: Dynamic = documentStateRef.current.annotations ?? [],
          removedAnnotations: Dynamic = annotations.flatMap(
            (annotation?: Dynamic, index?: Dynamic): Dynamic =>
              input.notes.has(annotation.id)
                ? [
                    {
                      spec: annotation,
                      index: index,
                    },
                  ]
                : [],
          );
        return removedAnnotations.length === 0
          ? false
          : (recordManifestHistory(
              {
                kind: "delete",
                entries: [],
                anns: removedAnnotations,
              },
              new Set(),
              undefined,
              options,
            ),
            persistCanvasState({
              ...documentStateRef.current,
              annotations: annotations.filter(
                (annotation?: Dynamic): Dynamic => !input.notes.has(annotation.id),
              ),
            }),
            announce(
              objectsDeletedAnnouncement(removedAnnotations.length),
            ),
            true);
      },
      [deleteCanvasBoards, deleteAnnotation, persistCanvasState, recordManifestHistory, abandonSelectionGesture],
    ),
    deleteCanvasObjectsRef: Dynamic = (0, React.useRef)(deleteCanvasObjects);
  deleteCanvasObjectsRef.current = deleteCanvasObjects;
  let copyCanvasBoards: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof copyBoardsToClipboard> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => copyBoardsToClipboard({ get doc() { return doc; }, get artboardEntries() { return artboardEntriesRef; }, get manifest() { return canvasDocumentState; } }, ...args),
      [canvasDocumentState, doc],
    ),
    pendingPastedFilesRef: Dynamic = (0, React.useRef)(new Set()),
    pasteCanvasBoards: Dynamic = (0, React.useCallback)(
      (...args: Dynamic[]): Dynamic => (pasteBoardsFromClipboard as Dynamic)({
        document: {
          get doc() { return doc; }, get supportsLoadState() { return supportsLoadState; },
          get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; },
          get pendingFiles() { return pendingPastedFilesRef; }, get persistManifest() { return persistCanvasState; },
          get pageSelection() { return savePageSelection; }, get createNotes() { return createPastedNotes; },
          get recordHistory() { return recordManifestHistory; },
        },
        placement: {
          get camera() { return cameraController; }, get hostGesturing() { return hostGesturingRef; },
          get placeActive() { return placeActiveRef; }, get fullscreenActive() { return fullscreenActiveRef; },
          get fitPastedBounds() { return duplicateArtboards; }, get creationBoxes() { return creationBoxesRef; },
        },
        selection: { get setSelection() { return setSelection; }, get clearFramePick() { return handleFramePick; } },
        get showToast() { return showToast; },
      }, ...args),
      [doc, persistCanvasState, recordManifestHistory, showToast, handleFramePick, cameraController],
    ),
    copyCanvasBoardsRef: Dynamic = (0, React.useRef)(copyCanvasBoards);
  copyCanvasBoardsRef.current = copyCanvasBoards;
  let pasteCanvasBoardsRef: Dynamic = (0, React.useRef)(pasteCanvasBoards);
  pasteCanvasBoardsRef.current = pasteCanvasBoards;
  let buildClipboardPayload: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof buildSystemClipboardPayload> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => buildSystemClipboardPayload({ get doc() { return doc; }, get artboardEntries() { return artboardEntriesRef; }, get showDragToast() { return showDragToast; }, get manifest() { return documentStateRef; } }, ...args),
      [doc, showDragToast],
    ),
    buildClipboardPayloadRef: Dynamic = (0, React.useRef)(buildClipboardPayload);
  buildClipboardPayloadRef.current = buildClipboardPayload;
  (0, React.useEffect)((): Dynamic => {
    if (!canvasElementSelectionCount(selection)) return;
    let artboards: Dynamic = selection.artboards,
      notes: Dynamic = selection.notes,
      preloadClipboardAssets: Dynamic = (): Dynamic => {
        let manifestArtboards: Dynamic = documentStateRef.current.artboards,
          annotationImages: Dynamic = annotationImageReferences(
            (documentStateRef.current.annotations ?? []).filter(
              (input?: Dynamic): Dynamic => notes.has(input.id),
            ),
          );
        for (let assetUrl of [
          ...(artboards.size > 0
            ? clipboardBlobAssets(
                manifestArtboards.filter(
                  (input?: Dynamic): Dynamic => artboards.has(input.file),
                ),
                manifestArtboards,
                doc.content().files,
                getExternalFileReferences(),
              )
            : []),
          ...annotationImages,
        ] as Dynamic)
          getCachedBlobObjectUrl(assetUrl) === undefined &&
            fetchBlobAsset(assetUrl).catch((): Dynamic => {});
      };
    if (artboards.size === 0 && notes.size === 1) return preloadClipboardAssets();
    let timer: Dynamic = setTimeout(preloadClipboardAssets, 150);
    return (): Dynamic => clearTimeout(timer);
  }, [selection, doc]);
  const pasteExternalClipboard = (0, React.useCallback)(
    (payload: unknown, anchor?: PastePoint | null) => externalPaste.paste({
      document: {
        store: doc,
        supportsLoadState,
        readManifest: () => documentStateRef.current,
        pageMetadata: savePageSelection,
        createNotes: createPastedNotes,
        pasteNotes: (boards, notes, point) => pasteCanvasBoardsRef.current(boards, notes, point),
        persist: persistCanvasState,
        recordHistory: recordManifestHistory,
      },
      view: {
        pageId: () => activePageIdRef.current,
        isEditing: () => editingRef.current,
        getClipboardAnchor: clipboardAdapterRef,
        camera: cameraController,
        isFullscreen: () => fullscreenActiveRef.current,
        isHostGesturing: () => hostGesturingRef.current,
        setSelection,
        clearFramePick: handleFramePick,
        reveal: (bounds) => duplicateArtboards.current(bounds),
        notePlacement() { placeActiveRef.current = true; },
      },
      feedback: { toast: showToast, announce: showDragToast, announceSuccess: clearDragToast },
    }, payload, anchor),
    [
      externalPaste,
      doc,
      supportsLoadState,
      persistCanvasState,
      recordManifestHistory,
      showToast,
      showDragToast,
      clearDragToast,
      handleFramePick,
      cameraController,
    ],
  );
  const pasteExternalClipboardRef = (0, React.useRef)(pasteExternalClipboard);
  pasteExternalClipboardRef.current = pasteExternalClipboard;
  let pasteHtmlAtPoint: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof pasteHtmlIntoArtboard> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => pasteHtmlIntoArtboard({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get setSelection() { return setSelection; }, get artboardEntries() { return artboardEntriesRef; }, get showDragToast() { return showDragToast; }, get clearDragToast() { return clearDragToast; }, get componentName() { return componentNameForFile; }, get editing() { return editingRef; }, get pasteHtmlContent() { return pasteHtmlContent; }, get clearFramePick() { return handleFramePick; }, get pageContents() { return activePageContentsRef; } }, ...args),
      [pasteHtmlContent, showDragToast, clearDragToast, handleFramePick, abandonSelectionGesture],
    ),
    pasteHtmlAtPointRef: Dynamic = (0, React.useRef)(pasteHtmlAtPoint);
  pasteHtmlAtPointRef.current = pasteHtmlAtPoint;
  let handleImageDropRef: Dynamic = (0, React.useRef)(handleImageDrop);
  handleImageDropRef.current = handleImageDrop;
  let pendingClipboardCopyRef: Dynamic = (0, React.useRef)(null),
    buildClipboardText: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let artboardLabels: Dynamic = activePageContentsRef.current.artboards
            .filter((artboard?: Dynamic): Dynamic => input.has(artboard.file))
            .map(
              (artboard?: Dynamic): Dynamic =>
                artboard.title || artboard.file.replace(/\.dc\.html$/, ""),
            ),
          annotationLabels: Dynamic = (activePageContentsRef.current.annotations ?? [])
            .filter((annotation?: Dynamic): Dynamic => options.has(annotation.id))
            .map(
              (annotation?: Dynamic): Dynamic =>
                isShapeAnnotation(annotation)
                  ? ""
                  : annotation.text.trim(),
            );
        return {
          stamp:
            Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
          rendition:
            [...artboardLabels, ...annotationLabels].filter(
              (label?: Dynamic): Dynamic => label !== "",
            ).join(`
`) || (input.size > 0 ? "artboard" : ""),
        };
      },
      [],
    ),
    clipboardPasteTimerRef: Dynamic = (0, React.useRef)(undefined),
    lastPasteKeyTimeRef: Dynamic = (0, React.useRef)(-1 / 0);
  (0, React.useEffect)((): Dynamic => subscribeClipboardEvents({ get doc() { return doc; }, get focusedFile() { return focusedFileRef; }, get selection() { return selectionRef; }, get camera() { return cameraController; }, get clipboardAdapter() { return clipboardAdapterRef; }, get copySelection() { return copySelection; }, get pasteSelection() { return pasteSelection; }, get clipboardSubscription() { return clipboardSubscription; }, get measureViewport() { return canvasViewport; }, get copySelectionRef() { return copySelectionRef; }, get pasteSelectionRef() { return pasteSelectionRef; }, get editing() { return editingRef; }, get showDragToast() { return showDragToastRef; }, get copyBoards() { return copyCanvasBoardsRef; }, get pasteBoards() { return pasteCanvasBoardsRef; }, get buildClipboardPayload() { return buildClipboardPayloadRef; }, get pasteExternal() { return pasteExternalClipboardRef; }, get pasteHtml() { return pasteHtmlAtPointRef; }, get handleImageDrop() { return handleImageDropRef; }, get pendingCopy() { return pendingClipboardCopyRef; }, get buildClipboardText() { return buildClipboardText; }, get pasteTimer() { return clipboardPasteTimerRef; }, get lastPasteKeyTime() { return lastPasteKeyTimeRef; }, get pendingSelectionOperations() { return pendingSelectionOperationsRef; }, get abandonSelectionGesture() { return abandonSelectionGestureRef; } }), [
    clipboardAdapterRef,
    copySelection,
    pasteSelection,
    doc,
    buildClipboardText,
    clipboardSubscription,
    canvasViewport,
    cameraController,
  ]);
  const {
    downloadsWithheld,
    mountedExportFiles,
    printableArtboards,
    picker,
    picking,
    selectExportTargets,
    fitArtboardsToContent,
    canFitArtboard,
    exportArtboardPng,
    copyArtboardPng,
    copyArtboardSvg,
    exportArtboardHtmlZip,
    exportArtboardPdf,
    exportPagePdf,
    renderExportTarget,
  } = useCanvasExportCommands({
    assets,
    doc,
    filePath,
    canvasDocumentState,
    artboardEntriesRef,
    documentStateRef,
    activePageIdRef,
    activePageId,
    pagesRef: canvasPagesRef,
    activePageContents: activePageContents,
    activePageContentsRef: activePageContentsRef,
    fullExportEnabled: clipboardFeatureEnabled,
    captureRules: exportRules,
    phoneCanvas,
    embedded: false,
    editable,
    editableRef,
    commenting,
    fullscreenActiveRef,
    fullscreenFileRef,
    fullscreenView,
    fullscreenViewRef,
    setFullscreenView,
    playingFile,
    playingFileRef,
    setPlayingFile,
    setPhoneViewRef: phoneViewRef,
    navigateAfterEdits: afterLeavingEdit,
    resetCanvasViewRef: resetCanvasViewRef,
    exportPickingRef: exportPickingRef,
    exportChromeHeightRef: exportChromeHeightRef,
    restoreCameraRef: restoreCameraRef,
    setCanvasTool: setCanvasTool,
    canvasToolRef: canvasToolRef,
    bumpToolReset: setCanvasToolResetTick,
    updateArtboardSettings: resizeArtboard,
    findHomeFocusElement: findHomeFocusElement,
    focusedFileRef,
    canvasContainerRef,
    selectionRef,
    landingFileRef,
    cameraController,
    handleFramePick,
    setSelectedFile,
    setBoardSelection,
    getArtboardTitle,
    showToast,
    hideToast,
    artboardFrameReadyTimeoutMs,
    canvasExportSettleTimeoutMs,
    emptyCanvasNoteSet,
  });
  const { showTweaks, toggleTweaks, tweaksOpenFile, showArtboardSettings } = useInspectorEntryPoints({
    editing,
    open: inspectorOpen,
    selectedFile,
    setOpen: setInspectorOpen,
    abandonSelectionGesture,
    leaveFullscreen: () => { if (fullscreenActiveRef.current) restoreCameraRef.current(); },
    beginEditing: () => setMode("edit"),
    clearFramePick: handleFramePick,
    setSelection,
    focusArtboard: focusCanvasArtboard,
    requestProperties: () => setPresentPropsTick((tick: number) => tick + 1),
  });
  const artboardSettings = useCanvasArtboardSettings({
    selection: { artboards: selectedFileIds, annotations: selectedNoteIds },
    manifest: canvasDocumentState,
    currentManifest: documentStateRef,
    frames: artboardEntriesRef,
    activeEditorFile: focusedFileRef,
    exportRules: exportRules,
    selectionRevision: selectionChangeTick,
    modelRevision: modelChangeTick,
    historyRevision: historyDirty,
    setPrint: setArtboardPrintMode,
    setPaper: setArtboardPaper,
    setSize: resizeArtboard,
    setGuides: setArtboardGuides,
    setRadius: setArtboardRadius,
    canFit: canFitArtboard,
    fitHeight: fitArtboardsToContent,
  });
  let annotationSettings: Dynamic = (0, React.useMemo)((...args: Dynamic[]): Dynamic => (deriveAnnotationSettings as Dynamic)({ get selectedFiles() { return selectedFileIds; }, get selectedNotes() { return selectedNoteIds; }, get setBox() { return updateAnnotationBoxAction; }, get setCss() { return updateAnnotationCssAction; }, get setArrowHeads() { return setAnnotationArrowHeadsAction; }, get setTextStyle() { return updateAnnotationTextStyleAction; }, get replacePicture() { return replaceAnnotationPictureAction; }, get manifestState() { return canvasDocumentState; } }, ...args), [
      selectedNoteIds,
      selectedFileIds,
      canvasDocumentState,
      updateAnnotationBoxAction,
      updateAnnotationCssAction,
      setAnnotationArrowHeadsAction,
      updateAnnotationTextStyleAction,
      replaceAnnotationPictureAction,
    ]);
  const {
    openFiles: openLayerFiles,
    setOpenFiles: setOpenLayerFiles,
    expandedLayers,
    setExpandedLayers,
    trees: layerTrees,
    treesRef: layerTreesRef,
    sidebarScroll: layerSidebarScroll,
    cursor: layerKeyboardCursor,
  } = useCanvasLayerIndex({
    files: canvasDocumentState.artboards,
    pageFiles: activePageContents.artboards,
    selectedFile,
    doc,
    frames: artboardEntriesRef,
    manifest: documentStateRef,
    pendingSelectionFiles: pendingSelectionFilesRef,
    sessionHistory: sessionHistoryRef,
    setEmptyPieces,
    historyDirty,
    modelRevision: modelChangeTick,
  });
  let fitArtboardsInViewport: Dynamic = (0, React.useCallback)(
    (input?: Dynamic): Dynamic =>
      cameraController.glide(
        (artboard?: Dynamic): Dynamic =>
          isArtboardInViewport(artboard, input, canvasViewport()),
      ),
    [cameraController, canvasViewport],
  );
  duplicateArtboards.current = fitArtboardsInViewport;
  let showArtboardInViewport: Dynamic = (0, React.useCallback)(
    (input?: Dynamic): Dynamic => {
      let artboard: Dynamic = activePageContentsRef.current.artboards.find(
        (candidate?: Dynamic): Dynamic => candidate.file === input,
      );
      if (artboard) {
        if (fullscreenActiveRef.current) {
          artboard.file !== fullscreenFileRef.current &&
            setFullscreenView(
              (previousView?: Dynamic): Dynamic =>
                previousView && {
                  file: artboard.file,
                  prev: previousView.prev,
                  fit: artboardIsNotExpandedFill(artboard),
                },
            );
          return;
        }
        fitArtboardsInViewport(artboard);
      }
    },
    [fitArtboardsInViewport],
  );
  openArtboardRef.current = showArtboardInViewport;
  useCanvasPlaceNavigation({
    selection,
    fullscreenViewFile: fullscreenView?.file ?? null,
    activePage: activePageId,
    allowPlaybackFragment: true,
    manifest: documentStateRef,
    activePageRef: activePageIdRef,
    fullscreenFile: fullscreenFileRef,
    editing: editingRef,
    readOnly: readOnlyRef,
    isTextEditing: textEditOpenRef,
    restoringPage: needsPageFitRef,
    placeActive: placeActiveRef,
    camera: cameraController,
    settle: afterLeavingEdit,
    resetSelectionGesture: abandonSelectionGesture,
    prepareFramePick: handleFramePick,
    setPendingFocus: setFilesOpen,
    setSelection,
    openPage: resolvePageArtboard,
    showArtboard: showArtboardInViewport,
    focusArtboard: focusCanvasArtboard,
    playArtboard: navigateToFile,
  });
  const { findBar, livePins } = useCanvasFind({
    doc,
    camera: cameraController,
    canvasRoot: canvasContainerRef,
    viewport: canvasViewport,
    frames: artboardEntriesRef,
    manifest: documentStateRef,
    activePage: activePageId,
    page: activePageIdRef,
    restoringPage: needsPageFitRef,
    openPage: resolvePageArtboard,
    playingFile: playingFileRef,
    inlinePlayback: playingFile,
    fullscreenActive: fullscreenActiveRef,
    fullscreenFile: fullscreenFileRef,
    fullscreenViewFile: fullscreenView?.file ?? null,
    expandArtboard: expandArtboardRef,
    showArtboard: openArtboardRef,
    phoneCanvas,
    isTextEditing: textEditOpenRef,
    settle: afterLeavingEdit,
    enabled: !filesOpen && !picking,
    focusedFile: focusedFileRef,
    isSteppingEnabled: editingSelectionVisibleRef,
    selection: selectionRef,
    phoneView: phoneViewRef,
    hostGesture: hostGesturingRef,
    activeDrag: frameDragRef,
    selectionGesture: selectionGestureRef,
    stopOf: findHomeFocusElement,
    lifecycle: artboardLifecycleRef,
    mountedExportFiles,
    canvasRevision: canvasRevision,
    selectionRevision: selectionChangeTick,
    modelRevision: modelChangeTick,
    handleFramePick,
  });
  let openArtboardByName: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        let manifest: Dynamic = documentStateRef.current,
          matchingArtboard: Dynamic = findArtboardByName(
            manifest.artboards,
            input,
            (artboard?: Dynamic): Dynamic =>
              designPageId(artboard, manifest.pages) ===
              activePageIdRef.current,
          );
        if (matchingArtboard === null || matchingArtboard === "ambiguous") {
          let componentLabel: Dynamic = isEditableComponentName(
              componentNameForFile(input),
            )
              ? componentNameForFile(input)
              : uiMessage("canvas.designCanvas.thatComponent"),
            matchingPageNames: Dynamic = [
              ...new Set(
                manifest.artboards
                  .filter(
                    (artboard?: Dynamic): Dynamic =>
                      componentNameForFile(artboard.file) === componentNameForFile(input),
                  )
                  .map(
                    (artboard?: Dynamic): Dynamic =>
                      designPageId(artboard, manifest.pages),
                  ),
              ),
            ].map(
              (pageId?: Dynamic): Dynamic =>
                manifest.pages?.find(
                  (page?: Dynamic): Dynamic => page.id === pageId,
                )?.name ?? uiMessage("canvas.designCanvas.thisPage2"),
            );
          showToast(
            matchingArtboard
              ? uiMessage("canvas.designCanvas.thereSMoreThanOne", { component: String(componentLabel), pages: String(matchingPageNames.join(", ")) })
              : uiMessage("canvas.designCanvas.noArtboardForComponent", { component: String(componentLabel) }),
          );
          return;
        }
        fullscreenActiveRef.current && restoreCameraRef.current();
        abandonSelectionGesture();
        handleFramePick();
        let targetPageId: Dynamic = designPageId(
          matchingArtboard,
          manifest.pages,
        );
        targetPageId !== activePageIdRef.current
          ? resolvePageArtboard(targetPageId, matchingArtboard.file)
          : (focusCanvasArtboard(matchingArtboard.file), showArtboardInViewport(matchingArtboard.file));
        setSelection(
          selectionFromArtboards(new Set([matchingArtboard.file])),
        );
      },
      [
        resolvePageArtboard,
        focusCanvasArtboard,
        showArtboardInViewport,
        handleFramePick,
        showToast,
        abandonSelectionGesture,
      ],
    ),
    selectFrameBoard: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        setBoardSelection(
          boardSelectionItems({
            file: input,
          }),
          options ? "toggle" : "replace",
        ),
      [setBoardSelection],
    );
  selectFrameBoardRef.current = selectFrameBoard;
  const selectionKey = canvasSelectionKey(selection);
  useVectorToolReset(canvasTool, selectionKey, setCanvasToolResetTick);
  nothingSelectedMessageRef.current = useCanvasSelectionAnnouncements({
    selectionKey,
    selection: selectionRef,
    layerTrees: layerTreesRef,
    manifest: documentStateRef,
    activePage: activePageId,
    firstPage: firstPageId,
    pageTitle: activePageTitle,
    pageMenuOpenedByKeyboard: pageMenu.openedByKeyboard,
    pageMenuTrigger: pageMenuTriggerRef,
    gestureAnnounced: selectionGestureActiveRef,
    selectionGesture: selectionGestureRef,
  });
  let selectArtboardElement: Dynamic = (0, React.useCallback)(
      (...args: Parameters<typeof selectElementInArtboard> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => selectElementInArtboard({
        selection: { get abandonGesture() { return abandonSelectionGesture; }, get epoch() { return selectionEpochRef; }, get current() { return selectionRef; }, get setSelection() { return setSelection; }, get gestureActive() { return selectionGestureActiveRef; }, get ignoreFrameClear() { return frameSelectionRef; }, get clearFramePick() { return handleFramePick; } },
        artboards: { get focusedFile() { return focusedFileRef; }, get setActiveFile() { return setActiveArtboard; }, get entries() { return artboardEntriesRef; }, get componentName() { return componentNameForFile; }, get focus() { return focusCanvasArtboard; } },
        document: { get manifest() { return documentStateRef; } },
      }, ...args),
      [handleFramePick, focusCanvasArtboard, abandonSelectionGesture],
    ),
    enterCanvasPiece: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let entry: Dynamic = artboardEntriesRef.current.get(input);
        if (!entry) return;
        let selectionEpoch: Dynamic = abandonSelectionGesture();
        handleFramePick();
        setSelection(emptyCanvasSelection);
        let selectWholeArtboard: Dynamic = (): Dynamic => {
          selectionEpochRef.current === selectionEpoch &&
            focusCanvasArtboard(input).then((): Dynamic => {
              selectionEpochRef.current === selectionEpoch && setActiveArtboard(input);
            });
        };
        if (!entry.isReady()) {
          selectWholeArtboard();
          return;
        }
        entry.pickAt(options, context).then((pickedElement?: Dynamic): Dynamic => {
          selectionEpochRef.current === selectionEpoch &&
            (pickedElement && "tid" in pickedElement
              ? selectArtboardElement(input, pickedElement.tid)
              : selectWholeArtboard());
        }, selectWholeArtboard);
      },
      [handleFramePick, focusCanvasArtboard, selectArtboardElement, abandonSelectionGesture],
    );
  let [outlineRenameRequest, setOutlineRenameRequest]: Dynamic = (0, React.useState)(
      null,
    ),
    copyBoardsAndNotes: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let files: Dynamic = doc.content().files;
        if (
          !(input.size === 0
            ? options.size > 0
            : [...input].some((file?: Dynamic): Dynamic => {
                let content: Dynamic = files[file];
                return (
                  typeof content == "string" &&
                  !isLoadingArtboardHtml(content)
                );
              }))
        )
          return;
        let clipboardText: Dynamic = buildClipboardText(input, options),
          copiedToSystem: Dynamic = copyClipboardObject(
            DesignArtboardsKey,
            {
              data: {
                stamp: clipboardText.stamp,
                ...buildClipboardPayloadRef.current(input, options),
              },
              text: clipboardText.rendition,
            },
          );
        copyCanvasBoardsRef.current(
          input,
          options,
          (): Dynamic => (copiedToSystem ? clipboardText : undefined),
        );
      },
      [doc, buildClipboardText],
    ),
    setCoverArtboard: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        let manifest: Dynamic = documentStateRef.current,
          artboard: Dynamic = manifest.artboards.find(
            (candidate?: Dynamic): Dynamic => candidate.file === input,
          );
        !artboard ||
          manifest.cover === input ||
          (recordManifestHistoryRef.current(
            {
              kind: "cover",
              from: validCoverArtboard(
                manifest.cover,
                manifest.artboards,
              ),
              to: input,
            },
            new Set(),
          ),
          persistCanvasState({
            ...manifest,
            cover: input,
          }),
          announce(
            "\u201C" +
              (artboard.title ?? input.replace(/\.dc\.html$/, "")) +
              "\u201D is now the thumbnail.",
          ));
      },
      [persistCanvasState],
    ),
    createPasteMenuItem: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      let copiedArtboards: Dynamic = getArtboardClipboard(),
        copiedNotes: Dynamic = getAnnotationClipboard(),
        clipboardAnchor: Dynamic = clipboardAdapterRef(),
        pasteAnchor: Dynamic = copiedArtboards
          ? pasteSelection(
              copiedArtboards,
              copiedNotes,
              clipboardAnchor,
              clipboardAnchor?.overAnnotation ? null : clipboardAnchor,
            )
          : null;
      return {
        label: KeyboardEditActionsCutCopyPasteConfig.paste.label,
        hotkey: KeyboardEditActionsCutCopyPasteConfig.paste.shortcut,
        get disabledReason() { return editingRef.current ? (copiedArtboards ? (undefined) : (uiMessage("canvas.designCanvas.noArtboardOrObjectCopied") + keyboardShortcutLabel("V") + " to paste anything else.")) : (ViewOnlyYouCanInspectThisMessage); },
        onClick: (): Dynamic => {
          editingRef.current &&
            copiedArtboards &&
            pasteCanvasBoardsRef.current(copiedArtboards, copiedNotes, pasteAnchor);
        },
      };
    }, [clipboardAdapterRef, pasteSelection]);
  const {
    artboardMenu, annotationMenu, annotationRows, menu: canvasMenu,
    open: openCanvasMenu, close: closeCanvasMenu,
  } = useCanvasContextMenus({
    doc,
    selection: selectionRef,
    camera: cameraController,
    editing: editingRef,
    readOnly: readOnlyRef,
    playingFile: playingFileRef,
    focusArtboard: focusCanvasArtboardRef,
    renameInCanvas: renameInCanvasRef,
    duplicateObjects: duplicateSelectedBoardsRef,
    expandArtboard: expandArtboardRef,
    revealArtboard: duplicateArtboards,
    openInlinePlayback: handlePreviewOpen,
    reorderArtboards: reorderArtboards,
    deleteArtboards: deleteCanvasBoards,
    downloadsWithheld,
    copyPng: copyArtboardPng,
    copySvg: copyArtboardSvg,
    selectArtboard: selectFrameBoard,
    promptRename: setOutlineRenameRequest,
    copyBoardsAndNotes: copyBoardsAndNotes,
    setCover: setCoverArtboard,
    pasteMenuItem: createPasteMenuItem,
    manifest: documentStateRef,
    imageClipboardEnabled: clipboardFeatureEnabled,
    flipRefusal: runFlipSelectedObjects,
    flipSelection: commitSelectionTransformRef,
    selectBoardsAndNotes: setBoardSelection,
    deleteBoardsAndNotes: deleteCanvasObjectsRef,
    flipNotes: flipSelectedAnnotationsRef,
    annotations: activePageContents.annotations,
    exportPicking: exportPickingRef,
    isTextEditing: textEditOpenRef,
    focusCanvas: clearCanvasSelection,
    fitArtboards: () => resetCanvasViewRef.current(),
    fitArtboardsLabel,
  });
  canvasMenuRef.current = openCanvasMenu;
  let [outlineRowFocus]: Dynamic = (0, React.useState)(
    (): Dynamic => ({
      path: "",
      row: "",
    }),
  );
  (0, React.useEffect)((): Dynamic => {
    selection.elements.size === 0 && (outlineRowFocus.path = outlineRowFocus.row = "");
  }, [selection, outlineRowFocus]);
  let coverArtboard: Dynamic = validCoverArtboard(
      canvasDocumentState.cover,
      canvasDocumentState.artboards,
    );
  const outlineKeyboard = useCanvasOutlineKeyboard({
    focusedFileRef, selectionRef, artboardEntriesRef, editingRef, documentStateRef,
    selectionEpochRef, selectionGestureActiveRef, selectionGestureRef, focusCanvasArtboardRef,
    rootNameOf: componentNameForFile, selectElementIn: selectArtboardElement, handleFramePick, setSelection, setBoardSelection,
    bringArtboardIntoView: showArtboardInViewport, stopOf: findHomeFocusElement, sayUnreadable: showUnreadableArtboard, layerTrees,
    selectedFile, selection, canEditSelection: editing, canInspectSelection: inspectSelectionVisible, fullscreenView,
  });
  let outlineArtboardRows: Dynamic = (0, React.useMemo)(
      (): Dynamic => buildOutlineArtboardRows({
        selection: { get abandonGesture() { return abandonSelectionGesture; }, get setSelection() { return setSelection; }, get files() { return selectedFileIds; }, get notes() { return selectedNoteIds; }, get tidsByFile() { return selectedTidsByFile; }, get setBoards() { return setBoardSelection; }, get selectFrameBoard() { return selectFrameBoard; }, get selectElement() { return selectArtboardElement; }, get clearFramePick() { return handleFramePick; } },
        artboards: { get editing() { return editingRef; }, get focus() { return focusCanvasArtboard; }, get rename() { return renameArtboard; }, get showUnreadable() { return showUnreadableArtboard; }, get reveal() { return showArtboardInViewport; }, get cover() { return coverArtboard; }, get pageContents() { return activePageContents; } },
        layers: { get openFiles() { return openLayerFiles; }, get setOpenFiles() { return setOpenLayerFiles; }, get expanded() { return expandedLayers; }, get setExpanded() { return setExpandedLayers; }, get trees() { return layerTrees; }, get treesRef() { return layerTreesRef; }, get sidebarScroll() { return layerSidebarScroll; }, get keyboardCursor() { return layerKeyboardCursor; }, get rowFocus() { return outlineRowFocus; } },
        rename: { get request() { return outlineRenameRequest; }, get setRequest() { return setOutlineRenameRequest; } },
        menus: { get artboard() { return artboardMenu; }, get annotation() { return annotationMenu; }, get annotationRows() { return annotationRows; } },
      }),
      [
        selectFrameBoard,
        artboardMenu,
        annotationMenu,
        annotationRows,
        outlineRowFocus,
        selectedNoteIds,
        setBoardSelection,
        outlineRenameRequest,
        renameArtboard,
        activePageContents.artboards,
        coverArtboard,
        selectedFileIds,
        selectedTidsByFile,
        openLayerFiles,
        layerTrees,
        expandedLayers,
        layerKeyboardCursor,
        handleFramePick,
        focusCanvasArtboard,
        showArtboardInViewport,
        selectArtboardElement,
        showUnreadableArtboard,
      ],
    ),
    [frameArmed, setFrameArmed]: Dynamic = (0, React.useState)(
      false,
    );
  (0, React.useEffect)((): Dynamic => {
    let armTimer: Dynamic = (window as Dynamic).setTimeout(
      (): Dynamic => setFrameArmed(true),
      900,
    );
    return (): Dynamic => (window as Dynamic).clearTimeout(armTimer);
  }, []);
  (0, React.useEffect)((): Dynamic => {
    let refreshTimers: Dynamic = [60, 450].map(
      (input?: Dynamic): Dynamic =>
        (window as Dynamic).setTimeout(
          (): Dynamic =>
            refreshDesktopRendering(
              (document as Dynamic).querySelector("header"),
            ),
          input,
        ),
    );
    return (): Dynamic =>
      refreshTimers.forEach(
        (input?: Dynamic): Dynamic => (window as Dynamic).clearTimeout(input),
      );
  }, [editing]);
  let showPreviewDropNotice: Dynamic = (0, React.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let now: Dynamic = Date.now();
        if (now - lastToolResetAtRef.current <= 5e3) return;
        let mediaKind: Dynamic = options ? "Video" : "Image";
        lastToolResetAtRef.current = now;
        let openProperties: Dynamic = false,
          droppedOnPlayingFile: Dynamic = input === playingFileRef.current,
          toastId: Dynamic = showToast(
            <span data-testid={"dc-preview-drop-toast"}>
              {openProperties ? (uiMessage("canvas.designCanvas.droppedOpenThePropertiesPanel", { mediaKind: String(mediaKind) })) : (droppedOnPlayingFile ? (uiMessage("canvas.designCanvas.droppedPressEditOnThat", { mediaKind: String(mediaKind) })) : (uiMessage("canvas.designCanvas.droppedSwitchToEditTo", { mediaKind: String(mediaKind) })))}
            </span>,
            "info",
            {
              pinned: true,
              action: (
                <Button
                  size={"sm"}
                  data-testid={"dc-preview-drop-edit"}
                  onClick={(): Dynamic => {
                    hideToast(toastId);
                    focusCanvasArtboard(openProperties ? (fullscreenFileRef.current ?? input) : input);
                    setMode("edit");
                    openProperties && setInspectorOpen(true);
                  }}
                >
                  {openProperties ? (uiMessage("canvas.designCanvas.openProperties")) : (uiMessage("canvas.designCanvas.edit"))}
                </Button>
              ),
            },
          );
        (window as Dynamic).setTimeout(
          (): Dynamic => hideToast(toastId),
          previewDropNoticeDurationMs,
        );
      },
      [focusCanvasArtboard, hideToast, showToast, setInspectorOpen],
    ),
    [panelUndoTarget, setPanelUndoTargetState]: Dynamic = (0, React.useState)(
      null,
    );
  setPanelUndoTarget(selectedFile, panelUndoTarget);
  const subscribeScale = useCanvasScaleSubscription(cameraController);
  let [commentsController, setCommentsController]: Dynamic = (0, React.useState)(null);
  const emptyCanvas = canvasDocumentState.artboards.length === 0 && (canvasDocumentState.annotations ?? []).length === 0;
  const showEmptyCanvasPrompt = (emptyCanvas && pendingPictures.length === 0) || phoneCanvasWithoutFullscreen;
  const showCreationTips = showEmptyCanvasPrompt && !phoneCanvasWithoutFullscreen && canvasTool === "select" && creationProgress.cursor.at === "tips";
  const { zoomTo: zoomCanvasTo, fit: fitCanvasPage } = useCanvasViewportControls({
    manifest: canvasDocumentState,
    page: activePageContents,
    creationBoxes: creationProgress.boxesHere,
    creating: creationProgress.creating,
    animateWhenContentArrives: showCreationTips,
    measure: canvasViewport,
    controller: cameraController,
    viewRestored: viewRestoredRef,
    placeActive: placeActiveRef,
    fullscreenActive: fullscreenActiveRef,
    exportInset: exportChromeHeightRef,
    fitPage: resetCanvasViewRef,
    settleView,
  });
  (0, React.useEffect)(() => subscribeZoomShortcuts({
    camera: cameraController,
    setGuidesVisible,
    filesOpen: filesOpenRef,
    fullscreen: fullscreenActiveRef,
    zoomTo: zoomCanvasTo,
    fitPage: fitCanvasPage,
  }), [fitCanvasPage, zoomCanvasTo, setGuidesVisible, cameraController]);
  const pageControl = useCanvasPageControl({
    menu: pageMenu,
    manifest: canvasDocumentState,
    pages: canvasPages,
    activePage: activePageId,
    pageTitle: activePageTitle,
    compact: compactPageControl,
    editing,
    afterLeavingEdit,
    showPage: resolvePageArtboard,
    createPage: pageActions.create,
    renamePage: pageActions.rename,
    removePage: pageActions.remove,
  });
  useDesignSource();
  const pageHasNoAnnotations = (activePageContents.annotations ?? []).length === 0;
  let [turnBusy, setTurnBusy]: Dynamic = (0, React.useState)(
      false,
    );
  const inspectorToggle = editing || (readOnly && !phoneCanvasWithoutFullscreen)
    ? <InspectorPanelToggle open={inspectorOpen} toggle={toggleInspector} />
    : null;
  let playableGroups: Dynamic = (0, React.useMemo)(
      (): Dynamic => groupNavigableArtboards(activePageContents.artboards),
      [activePageContents.artboards],
    ),
    saveCanvasNow: Dynamic = useLatestCallback((): Dynamic => {
      saveCanvas();
    }),
    canvasSaveStatus: Dynamic = (
      <CanvasSaveStatus
        doc={doc}
        synced={supportsLoadState}
        localDirty={supportsCanvasLoadState}
        onSave={saveCanvasNow}
      />
    );
  const mdnFeedback = getCachedHostCapability("feedback") ?? null;
  const mdnPanelOpen = useHostedInspectorPanel(mdnFeedback, commenting, inspectorOpen, setInspectorOpen);
  const viewToolbar = useCanvasViewToolbar({
    camera: cameraController, subscribeScale, zoomTo: zoomCanvasTo, fit: fitCanvasPage,
    history: canvasUndoRef.current, editing, commentsController: commentsController,
    manifestHistoryRevision, selectionChangeTick, guidesVisible, setGuidesVisible,
    feedback: mdnFeedback, playable: fullscreenView ? null : playableGroups,
    openFile: openCanvasFile, getArtboardTitle,
  });
  const mdnZoom = <CanvasInlineViewToolbar control={MemoizedCanvasZoomControl} toolbar={viewToolbar} fitLabel={fitArtboardsLabel} />;
  // toolbarDensity 内部调用 hook，必须在顶层无条件调用，不能放进按展开状态渲染的分支
  let mdnDockDensity: Dynamic = toolbarDensity(),
    mdnText: Dynamic = useUiText();
  return (
    <ViewportContext.Provider value={cameraController}>
      <CanvasWorkingStateContext.Provider value={keptEditHistory}>
        <InspectorOpenContext.Provider value={null}>
          <div
            ref={toolbarRootRef}
            className={
              "relative flex h-screen w-screen bg-page text-primary max-[599px]:flex-col"
            }
          >
            <CanvasSaveKeyboardShortcut
              doc={doc}
              synced={supportsLoadState}
              localDirty={supportsCanvasLoadState}
              onSave={saveCanvasNow}
            />
            <div className={"relative flex min-h-0 min-w-0 flex-1 flex-col"}>
              <EditorToolbar
                title={(document as Dynamic).title || (filePath)}
                saveState={initialSaveState}
                saveMode={doc.saveMode()}
                syncDot={supportsLoadState}
                onSave={(): Dynamic => {
                  saveCanvas();
                }}
                undo={canvasUndoRef.current ?? undefined}
                publishControls={false}
                undoButtons={false}
                touchTargets={"square"}
                variant={isDockedCanvas ? "docked" : "floating"}
                trailing={
                  picking ? null : fullscreenView ? (
                    canvasSaveStatus
                  ) : (
                    <span
                      data-testid={"dc-save"}
                      className={"flex shrink-0 items-center gap-1"}
                    >
                      {mdnFeedback ? (null) : (inspectorToggle)}
                      {!mdnFeedback && inspectorToggle ? (<ToolbarDivider />) : (null)}
                      {mdnFeedback ? (null) : (mdnZoom)}
                      {canvasSaveStatus}
                    </span>
                  )
                }
                leading={fullscreenView || picking ? null : pageControl}
                extrasEnd={
                  picking ? null : (
                    <jsx_Gn.Fragment>
                      {artboardProblems.popover}
                      {fullscreenView && !filesOpen ? (
                        <FullscreenPlaybackControls
                          file={fullscreenView.file}
                          fit={fullscreenView.fit}
                          artboards={activePageContents.artboards}
                          exportRules={exportRules}
                          downloadsWithheld={downloadsWithheld}
                          exportActions={{
                            onExportArtboard: (file: Dynamic, options: Dynamic) => { exportArtboardPng(file, options); },
                            onExportArtboardPdf: (file: Dynamic) => { exportArtboardPdf(file); },
                            onExportArtboardHtmlZip: (file: Dynamic) => { exportArtboardHtmlZip(file); },
                            onExportAllArtboardsPdf: () => { exportPagePdf(); },
                          }}
                          onFitChange={(fit: boolean) => setFullscreenView(
                            (previous: Dynamic) => previous && { ...previous, fit },
                          )}
                        />
                      ) : null}
                      {editing && (<div
                          id={ChatColumnOverlayActionsSlotValue}
                          data-tb-seat={""}
                          className={
                            "flex shrink-0 items-center gap-2 empty:hidden"
                          }
                        />)}
                      {!mdnFeedback && !fullscreenView && (
                        <CanvasPlayMenu
                          groups={playableGroups}
                          getTitle={getArtboardTitle}
                          onOpen={openCanvasFile}
                          disabledTip={pageHasNoArtboardsMessage}
                        />
                      )}
                    </jsx_Gn.Fragment>
                  )
                }
              >
                {fullscreenView && (
                  <FullscreenPlaybackHeading
                    file={fullscreenView.file}
                    artboards={activePageContents.artboards}
                    toolbarCollapsed={filesOpen}
                    commenting={commenting}
                    onExit={restoreCamera}
                  />
                )}
              </EditorToolbar>
              <DocumentSaveStatus
                doc={doc}
                onSave={saveCanvas}
                docked={isDockedCanvas}
                belowPickerBar={picking}
              />
              <div className={"relative flex min-h-0 flex-1"}>
                {/* MineDesign：工具栏移到画布底部居中，缩短鼠标往返；评论放在最右侧并默认显示文字 */}
                {fullscreenView ? (null) : (<CdsIsland
                    density={mdnDockDensity}
                    className={"mdn-tool-dock"}
                    hidden={picking}
                  >
                    <Surface
                      elevation={PanelValue}
                      className={"mdn-tool-dock-card"}
                    >
                      <div
                        id={editorToolbarId}
                        data-testid={"dc-tool-row"}
                        className={
                          "flex shrink-0 items-center gap-1 empty:hidden pointer-coarse:gap-1.5"
                        }
                      >
                        {showCanvasTools && (<DesignToolToolbar
                            tool={canvasTool}
                            onTool={setCanvasTool}
                          />)}
                      </div>
                      <ToolbarDivider />
                      <span data-mega-chrome={"comments"} className={"contents"}>
                        <ToolbarPrimitivesComponent
                          icon={"Chat"}
                          label={mdnText.comment}
                          tipSide={"top"}
                          shortcut={"c"}
                          pressed={commenting}
                          data-testid={"dc-tool-comment"}
                          onClick={(): Dynamic =>
                            window.dispatchEvent(new Event("canvas-comment-key"))
                          }
                        />
                      </span>
                    </Surface>
                  </CdsIsland>)}
                <FindBar {...findBar} />
                {null}
                <main
                  aria-label={uiMessage("canvas.designCanvas.canvas")}
                  inert={filesOpen}
                  className={
                    "relative min-h-0 min-w-0 flex-1 bg-om-bg-canvas"
                  }
                  ref={setCanvasContainer}
                >
                  {hostedCanvasApi !== null && (<HostedEditor
                      host={(): Dynamic => ({
                        selected:
                          selectedNoteIds.size === 0
                            ? activePageContents.artboards
                                .map((input?: Dynamic): Dynamic => input.file)
                                .filter(
                                  (input?: Dynamic): Dynamic =>
                                    selectedFileIds.has(input),
                                )
                            : [],
                        selectedElements:
                          selectedNoteIds.size === 0
                            ? selectedElementLocations(
                                activePageContents.artboards.map(
                                  (input?: Dynamic): Dynamic => input.file,
                                ),
                                selection.elements,
                                componentNameForFile,
                              )
                            : [],
                        handlesRef: artboardEntriesRef,
                        canvasTitle:
                          typeof document === "undefined"
                            ? ""
                            : (document as Dynamic).title,
                        fileText: (input?: Dynamic): Dynamic =>
                          doc.content().files[input],
                        readOnly: !editable,
                        hidden:
                          filesOpen ||
                          fullscreenViewFile !== null ||
                          picking ||
                          playingFile != null ||
                          phoneCanvasWithoutFullscreen,
                        tell: showDragToast,
                        say: (input?: Dynamic, options?: Dynamic): Dynamic =>
                          announce(input, options),
                        focusCanvas: (): Dynamic => canvasKeyboardFocus.goHome(),
                        saveNow: (): Dynamic => doc.flushNow?.(),
                        canvas: hostedCanvasApi,
                      })}
                    />)}
                  <CanvasInteractionLayer
                    manifest={activePageContents}
                    viewSettled={phoneCanvas ? viewSettled : undefined}
                    phoneCanvasRunsNothing={phoneCanvasKilledEarlier}
                    guidesVisible={guidesVisible}
                    turnBusy={turnBusy}
                    onWorldPointer={handleWorldPointer}
                    onPagePointer={handlePagePointer}
                    onPageScroll={pageScrollStore.set}
                    artboardPicking={picking}
                    artboardOverlay={(
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic =>
                      options ? (
                        <jsx_Gn.Fragment>
                          <ArtboardPeerSelectionRings
                            store={designContextStore}
                            file={input}
                            box={options}
                            scroll={pageScrollStore}
                          />
                          <PageCommentSurface
                            file={input}
                            box={options}
                            store={pageScrollStore}
                          />
                        </jsx_Gn.Fragment>
                      ) : (
                        <jsx_Gn.Fragment>
                          <CanvasPeerSelectionRings
                            store={designContextStore}
                            file={input}
                          />
                          {picking && (renderExportTarget(input))}
                        </jsx_Gn.Fragment>
                      )
                    }
                    worldOverlay={
                      phoneCanvasWithoutFullscreen ? null : (
                        <jsx_Gn.Fragment>
                          <R_useCanvasPeerSelections
                            pageId={activePageId}
                            artboards={activePageContents.artboards}
                            handlesRef={artboardEntriesRef}
                            store={designContextStore}
                            fullFile={fullscreenViewFile}
                          />
                          {!fullscreenView && (<ViewportScale>
                              {(input?: Dynamic): Dynamic => (
                                <jsx_Gn.Fragment>
                                  <PeerCursors
                                    surface={worldPointerHandlers}
                                    toLocal={(
                                      left?: Dynamic,
                                      options?: Dynamic,
                                    ): Dynamic => ({
                                      left: left,
                                      top: options,
                                    })}
                                    glyphScale={1 / input}
                                  />
                                  <DesignCreationCursor
                                    cursor={creationProgress.cursor}
                                    boards={creationProgress.boxesHere}
                                    artboards={activePageContents.artboards}
                                    scale={input}
                                  />
                                </jsx_Gn.Fragment>
                              )}
                            </ViewportScale>)}
                        </jsx_Gn.Fragment>
                      )
                    }
                    canvasScaleRef={canvasScaleRef}
                    pastePointRef={pastePointRef}
                    artboardLandingRef={artboardLandingRef}
                    pendingBoards={creationProgress.pendingBoards}
                    coverFiles={creationProgress.coverFiles}
                    onManifestChange={(...args: Parameters<typeof commitInteractionLayerChange> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => commitInteractionLayerChange({ get boundMoveRecords() { return boundMoveRecordsRef; }, get selectedNoteIds() { return selectedNoteIds; }, get recordHistory() { return recordManifestHistory; }, get manifestState() { return canvasDocumentState; }, get setManifestState() { return setCanvasDocumentState; }, get previousManifest() { return previousDocumentStateRef; }, get serializeManifest() { return serializeDocumentState; }, get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; }, get persistManifest() { return persistCanvasState; } }, ...args)}
                    camera={cameraController}
                    assets={assets}
                    doc={doc}
                    editing={editing}
                    inspect={inspectSelectionVisible}
                    editable={editable}
                    frameArmed={frameArmed}
                    focusedFile={canvasFocusedFile}
                    onFocus={focusCanvasArtboard}
                    enteredFile={activeArtboard}
                    emptyPieces={emptyPieces}
                    onEnterPiece={enterCanvasPiece}
                    onFaceDoubleClick={handleArtboardDoubleClick}
                    onContentHull={reportFramelessContentHull}
                    onOpenFile={openArtboardByName}
                    onAddAnnotation={addAnnotationAtPoint}
                    onDeleteAnnotation={deleteAnnotation}
                    onAnnotationCss={updateAnnotationCssAction}
                    onReplaceAnnotationMedia={replaceAnnotationMediaAction}
                    onOpenPropsPanel={(): Dynamic => setInspectorOpen(true)}
                    selectedArtboards={selectedFileIds}
                    selectedNotes={selectedNoteIds}
                    onSelectObjects={picking ? selectExportTargets : setBoardSelection}
                    onClearSelection={clearCanvasSelection}
                    routeForwardedKey={routeCanvasFrameKey}
                    onDragEvent={handleCanvasDrag}
                    onBoxEvent={handleBoxEvent}
                    dragGhost={dragPreview}
                    onHostDrag={handleHostDrag}
                    onDropObjectInto={dropCanvasObjectInto}
                    onObjectHover={handleCanvasObjectHover}
                    setMovePieces={true}
                    onHostGesturing={setHostGesturing}
                    onCommenting={setCommenting}
                    quickProps={createCanvasQuickProperties({
                      selectionProbe,
                      seed: inspectorSeed,
                      elementSessionState,
                      contrastRef,
                      acrossFiles: hasCombinedSelection,
                      artboardEntriesRef,
                      selectionSource: componentNameForFile,
                      canvasActionsRef,
                      onApply: applyPropertyEdit,
                      onGesture: handleStyleGesture,
                      showRejection: showDragToast,
                      framePickState,
                      framePickStateRef,
                      dropTargetRef: playingFileRef,
                    })}
                    crossFile={
                      hasCombinedSelection
                        ? {
                            elements: [...selection.elements.values()].reduce(
                              (input?: Dynamic, options?: Dynamic): Dynamic =>
                                input + options.count,
                              0,
                            ),
                            artboards: selection.elements.size,
                            objects:
                              selection.artboards.size + selection.notes.size,
                            onDuplicate: duplicateSelectedElementsAction,
                            onDelete: (): Dynamic => afterSelectionEdits(deleteSelectedElementsWithAnnouncement),
                          }
                        : null
                    }
                    onSelectionSeq={recordFrameSelectionSequence}
                    onMarqueeBegin={picking ? undefined : mergeSelection}
                    onElementPress={handleElementPress}
                    onCoverPress={recordCoverPress}
                    onCoverPick={startFrameTransition}
                    onArmArtboard={(input?: Dynamic): Dynamic => {
                      focusArtboardAndReplay(input);
                    }}
                    onSetMoveCommit={dropCanvasObject}
                    armedEmpty={armedEmpty}
                    onSetMoveSay={(input?: Dynamic): Dynamic =>
                      showDragToastRef.current?.(input)
                    }
                    onPressIntent={abandonSelectionGesture}
                    pressIntentIs={isSelectionEpochCurrent}
                    dragToast={dragToast}
                    onArtboardReady={handleArtboardReady}
                    onHandle={handleArtboardLifecycle}
                    onPreviewDropNotice={showPreviewDropNotice}
                    dsVarNames={designSystemVariableNames}
                    onDefinedVars={updateDefinedVariables}
                    onArtboardProblems={artboardProblems.update}
                    artboardProblems={artboardProblems.chips}
                    onShowProblems={artboardProblems.restore}
                    artboardNotice={artboardProblems.notice}
                    onDuplicateObjects={duplicateCanvasObjects}
                    onPlayArtboard={handlePreviewOpen}
                    playingFile={playingFile}
                    onExpandArtboard={expandArtboard}
                    onRenameArtboard={renameArtboard}
                    onCanvasMenu={openCanvasMenu}
                    renameRef={renameInCanvasRef}
                    onExportArtboard={(
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic => {
                      exportArtboardPng(input, options);
                    }}
                    exportDisabledReason={
                      downloadsWithheld
                        ? DownloadsArenTAvailableToYouForMessage
                        : undefined
                    }
                    onExportArtboardPdf={(input?: Dynamic): Dynamic => {
                      exportArtboardPdf(input);
                    }}
                    exportRules={exportRules}
                    onExportAllArtboardsPdf={(): Dynamic => {
                      exportPagePdf();
                    }}
                    onExportSelectedArtboardsPdf={(): Dynamic => {
                      exportPagePdf(selectionRef.current.artboards);
                    }}
                    onExportArtboardHtmlZip={(input?: Dynamic): Dynamic => {
                      exportArtboardHtmlZip(input);
                    }}
                    onArtboardSettings={showArtboardSettings}
                    onOpenTweaks={showTweaks}
                    onToggleTweaks={toggleTweaks}
                    tweaksOpenFile={tweaksOpenFile}
                    tweakRows={tweakValues}
                    onTweaksRow={updateTweakValue}
                    onTweaksDirty={registerDirtySession}
                    artboardSettings={artboardSettings}
                    canvasObject={annotationSettings}
                    outlineArtboards={outlineArtboardRows}
                    presentPropsTick={presentPropsTick}
                    onPresentPropsHandled={markPresentPropsHandled}
                    onPanZoom={handlePanZoom}
                    streamDragFile={streamDragFile}
                    onRepeatRefused={handleRepeatRefused}
                    fullscreenFile={fullscreenView?.file ?? null}
                    phone={phoneCanvas}
                    fullscreenBox={fullscreenView?.fit === false ? fullscreenBox : null}
                    livePins={livePins}
                    inUseFiles={inUseFiles}
                    onToolChange={setCanvasTool}
                    toolResetTick={canvasToolResetTick}
                    armedTool={canvasTool}
                    keyboard={outlineKeyboard}
                    onDrawArtboard={pasteHtmlContent}
                    onImageDrop={handleImageDrop}
                    pendingPictures={pagePendingPictures}
                    ghostPage={activePageId}
                    onPlaceTool={placeTool}
                    onAddShape={addShape}
                    onAddPen={addPenAnnotation}
                    onPlaceBlocked={handlePlaceBlocked}
                    placeRequest={placeRequest}
                    onPlaceHandled={handlePlaceHandled}
                    onTextFormat={formatText}
                    onHistoryPush={handleHistoryPush}
                    onModelReparsed={handleModelReparsed}
                    onHistoryApply={handleHistoryApply}
                    onHistoryRevoke={handleHistoryRevoke}
                    onHistoryDrop={handleHistoryDrop}
                    onTweakEdit={recordTweakHistory}
                    sessionEpoch={toolResetTick}
                    actionsRef={canvasActionsRef}
                    elementMenuHidden={inspectorOpen}
                    elementSelection={
                      framePickState && (hasCombinedSelection || framePickState.file === selectedFile)
                        ? framePickState
                        : null
                    }
                    selectedTidsByFile={selectedTidsByFile}
                    selectedRectsByFile={selectedRectsByFile}
                    onSelectionEvent={handleFrameSelection}
                    pageKey={activePageId === firstPageId ? "" : activePageId}
                    onCommentsController={setCommentsController}
                    onRevealComment={(...args: Parameters<typeof revealCommentTarget> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => revealCommentTarget({
        view: { get editing() { return editing; }, get readOnly() { return readOnly; }, get camera() { return cameraController; }, get needsPageFit() { return needsPageFitRef; }, get restoreCamera() { return restoreCameraRef; }, get fullscreenActive() { return fullscreenActiveRef; }, get fullscreenFile() { return fullscreenFileRef; }, get setFullscreenView() { return setFullscreenView; }, get phoneCanvas() { return phoneCanvas; } },
        navigation: { get focusArtboard() { return focusCanvasArtboard; }, get resolvePageArtboard() { return resolvePageArtboard; } },
        document: { get manifest() { return documentStateRef; }, get activePage() { return activePageIdRef; } },
      }, ...args)}
                    exitGuardRef={phoneViewRef}
                    textEditOpenRef={textEditOpenRef}
                    settleSessionRef={settleSessionRef}
                    commitOpenTextEditRef={commitOpenTextEditRef}
                    onSessionDirtyChange={setCanvasReady}
                    onEditInput={refreshArtboardActivity}
                    onLocalEdit={recordArtboardActivity}
                    onUndoStack={setPanelUndoTargetState}
                  />
                  <CdsIsland
                    density={"compact"}
                    className={"contents"}
                  >
                    <EditorMenu
                      at={canvasMenu}
                      onClose={closeCanvasMenu}
                      items={canvasMenu?.items ?? []}
                      minWidth={180}
                      label={canvasMenu?.label}
                      focusFirstItem={canvasMenu?.keyboard}
                    />
                  </CdsIsland>
                  <R_usePresenceComposer
                    reporter={(): Dynamic =>
                      worldPointerActiveRef.current ? presenceReporterRef.current : null
                    }
                    color={presenceColor}
                    canOpen={canOpenCanvas}
                  />
                  <ExportPickerToolbar
                    picker={picker}
                    artboards={printableArtboards}
                    rules={exportRules}
                  />
                  <CanvasEmptyState
                    editing={editing}
                    editable={editable}
                    hasArtboards={activePageContents.artboards.length > 0}
                    hasIncomingArtboards={creationProgress.boxesHere.length > 0}
                    hasAnnotations={!pageHasNoAnnotations}
                    wholeCanvasEmpty={emptyCanvas}
                    wholeCanvasWithoutArtboards={canvasDocumentState.artboards.length === 0}
                    showEditingPrompt={showEmptyCanvasPrompt}
                    reserveToolbarSpace={showCreationTips}
                    workingLabel={Boolean(creationProgress.workingLabel)}
                    readOnlyReason={saveState.message}
                    addArtboard={() => pasteHtmlContent()}
                  />
                </main>
                {editable ? (<R_useCanvasWorkingState
                    doc={doc}
                    empty={
                      editing && activePageContents.artboards.length === 0 && pageHasNoAnnotations
                    }
                    items={(): Dynamic =>
                      createWorkingFileMap(doc.content().files)
                    }
                    words={
                      AccessibilityAnnouncementsReadyUpdatedChangedConfig
                    }
                    onBusy={setTurnBusy}
                  />) : (null)}
                {canvasFocusedFile == null && editing && annotationSettings != null && (<AnchoredDesignProperties
                    settings={annotationSettings}
                    readOnly={!editable}
                  />)}
              </div>
            </div>
            <InspectorPanelMount hosted={Boolean(mdnFeedback)} open={mdnPanelOpen} filesOpen={filesOpen} />
          </div>
        </InspectorOpenContext.Provider>
      </CanvasWorkingStateContext.Provider>
    </ViewportContext.Provider>
  );
}

export { selectionColorLimit as canvasSelectionChromeInsetPixels } from "./design-canvas/selection-inspector";

export {
  artboardFrameReadyTimeoutMs,
  artboardFullscreenCamera,
  artboardIsNotExpandedFill,
  canvasExitExportWaitTimeoutMs,
  canvasExportSettleTimeoutMs,
  canvasPastePositionStep,
  CanvasSaveKeyboardShortcut,
  CanvasSaveStatus,
  defaultCanvasCamera,
  DesignCanvas,
  emptyCanvasNoteSet,
  emptyCanvasOptions,
  MemoizedCanvasSaveIndicator,
  MemoizedCanvasZoomControl,
  previewDropNoticeDurationMs,
  runWhenConditionReady,
  useCanvasSaveState,
};
export function installCanvasDesignCanvas(): () => void {
  return () => {
    installCanvasShared();
    installCanvasMessages();
    MemoizedCanvasZoomControl = (0, React.memo)(
      CanvasZoomControl,
    );
    MemoizedCanvasSaveIndicator = (0, React.memo)(
      ToolbarPublishControls,
    );
    CanvasSaveStatus = (0, React.memo)(function ({
      doc: doc,
      synced: synced,
      localDirty: localDirty,
      onSave: onSave,
    }: Dynamic): Dynamic {
      let value: Dynamic = useCanvasSaveState(doc, synced, localDirty);
      return (
        <MemoizedCanvasSaveIndicator
          saveState={value}
          saveMode={doc.saveMode()}
          syncDot={synced}
          onSave={onSave}
        />
      );
    });
    CanvasSaveKeyboardShortcut = (0, React.memo)(function ({
      doc: doc,
      synced: synced,
      localDirty: localDirty,
      onSave: onSave,
    }: Dynamic): Dynamic {
      let value: Dynamic = useCanvasSaveState(doc, synced, localDirty);
      useFrameSaveState(
        synced || value.status === "readonly" ? value.status : null,
        onSave,
      );
      return null;
    });
    artboardFrameReadyTimeoutMs = 12e3;
    previewDropNoticeDurationMs = 8e3;
    canvasExportSettleTimeoutMs = 2e4;
    canvasExitExportWaitTimeoutMs = 1e4;
    emptyCanvasOptions = {};
    emptyCanvasNoteSet = new Set();
    canvasPastePositionStep = 24;
  };
}

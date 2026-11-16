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
import { serializeArtboardErrorContext, updateArtboardErrorMap } from "./artboard-errors";
import { artboardTweaksRowHeight } from "./artboard-tweaks";
import { artboardTextSnapshotLimit } from "./content-snapshots";
import { createDesignContextPublisher } from "./context-publisher";
import { creationFocusedCamera, creationSequenceEnabled, DesignCreationCursor, fitArtboardHeaderHeight, fitBoundsCamera, useDesignCreationProgress } from "./creation-progress";
import { BusyCanvasPrompt, CreationWorkingAnnouncement, DesignCreationPrompt, EmptyCanvasPrompt } from "./creation-prompt";
import { beforeExport, refreshDesktopRendering } from "./desktop-refresh";
import { confirmCanvasAction, promptCanvasValue } from "./dialogs";
import { EmptyCanvasReadOnlyNotice } from "./empty-notice";
import { ArtboardErrorsPopover, useArtboardErrorNotices } from "./error-notices";
import { useArtboardErrorReporting } from "./error-reporting";
import { remoteFilesEventName } from "./frame-environment";
import { CanvasInteractionLayer } from "./interaction-layer";
import { useArtboardKeyRouting } from "./key-routing";
import { useCanvasKeyboardFocus } from "./keyboard-focus";
import { keyboardNavigationMode, useCanvasKeyboardNavigation } from "./keyboard-navigation";
import { applyCanvasManifestHistory, artboardOrderHistoryStep, canvasHistoryAnnouncementMode, compatibleRestoredCanvasLaunch, defaultCanvasPage, filterSettingHistoryStep, mergeMissingCanvasManifestMetadata, reconcileCanvasManifestHistory, repairCanvasLaunchAfterDeletion, updateArtboardGuides } from "./manifest-history";
import { artboardNavigationGroupLabels, currentCanvasPlaceFragment, defaultPageArtboard, groupNavigableArtboards, initialFocusedArtboard, prototypeFileFromPlaceFragment, resolveCanvasPlaceAction } from "./navigation";
import { assignImplicitFirstCanvasPage, canvasPageDeleteConfirmation, canvasPageDeleteSnapshot, isCanvasPageMatch, neighboringCanvasPageId, nextCanvasPageName, remainingCanvasPageObjects, restoreCanvasPageSpec, retargetCanvasPageHistory } from "./page-operations";
import { panViewport, zoomViewportAtPoint } from "./pan-zoom";
import { avoidPastedObjectCollisions, defaultPlacedImageSize, droppedImageLabel, droppedImageMarkup, droppedImagePlacement, insertBlankArtboardMarkup, pasteCascadeStep, pastedObjectsBounds, pastedObjectsOrigin, pointerCoordinates, safeDroppedImageAltText, visibleArtboardCenter } from "./paste-placement";
import { getPhoneCanvasStorage, phoneCanvasStorageKey, usePhoneCanvasVisibility, wasPhoneCanvasKilled } from "./phone-visibility";
import { classifyPlaceLink, createPlaceLinkReporter, observeGotoAnchorMessages, rememberPlaceLink } from "./place-link";
import { distanceBetweenRects, isSmallTouchDevice, shouldDelayPreviewMount } from "./preview-mounting";
import { adjacentPrintableArtboard, isInteractivePreviewTarget, printableArtboardIndex, printableArtboards, withClosedPreview } from "./preview-navigation";
import { recallCanvasView, rememberCanvasView, viewportScaleLimits } from "./viewport-memory";
import { createViewportStore, isArtboardInViewport, sameViewport, ViewportContext, ViewportScale } from "./viewport-store";
import { afterNextPaint, boardSelectionKey, canApplyTextEditHistory, canNavigateSelection, CanvasWorkingStateConstant_5, CanvasWorkingStateConstant_8, CanvasWorkingStateContext, CanvasWorkingStateHandler, CanvasWorkingStateHandler_3, CanvasWorkingStateHas, CanvasWorkingStateJoin, CanvasWorkingStateLimit_5, CanvasWorkingStatePrint, CanvasWorkingStateReplace, CanvasWorkingStateWidth, createDropGhost, createEditSessionManager, createInlineHistoryBridge, createSessionHistory, handleInlineUndoKey, imageHeaderDimensions, isSessionCancelMessage, isSvgFile, keyboardNudgeDelta, markDropPerformance, nudgeCanvasObjects, pngPhysicalDimensions, positionedVideoHtml, previewImageFile, randomSessionToken, rasterImageDimensions, readHeldSessionState, recordSessionLoadStart, reduceSessionCancellation, sameSelectedObjectFiles, sameSelectionStructure, selectionAfterElementEdits, selectionNavigationScope, sessionAllowsMutation, setFilePublishHandler, stepInlineHistory, textEditHistoryEpoch, updateTextEditHistoryCounts, uploadDesignFile, uploadDesignVideo, useCanvasWorkingState as R_useCanvasWorkingState, videoFileTitle } from "./working-state";
import { CanvasZoomControl, zoomScalePresets } from "./zoom";
import { Button } from "../cds/button/button";
import { Counter } from "../cds/components/counter";
import { Icon } from "../cds/components/icon";
import { SegmentedControl } from "../cds/components/selection-points";
import { Surface } from "../cds/components/surface";
import { MenuMenuAssignValue, MenuMenuAssignValue as MenuMenuAssignValue_r, renderMenuItems } from "../cds/menu/menu";
import { Tooltip } from "../cds/tooltip/tooltip";
import { createPresenceReporter, PeerCursors } from "../collaboration/peer-cursors";
import { usePresenceComposer as R_usePresenceComposer } from "../collaboration/presence-composer";
import { ArtboardPeerSelectionRings, CanvasPeerSelectionRings, createPeerSelectionStore, encodeArtboardSelectionPath, encodedElementPathPattern, normalizeSelectedArtboardPaths, useCanvasPeerSelections as R_useCanvasPeerSelections } from "../collaboration/selection-paths";
import { mdnCommentMode, mdnToggleCommentMode, useUiText } from "../comments/feedback-panel";
import { createPageScrollStore, PageCommentSurface, pageCommentSurfaceKey } from "../comments/page-surfaces";
import { npm_useLocalStorage_QP } from "../dependencies";
import { mergeDesignSystemFileOverlay } from "../design-system/file-overlay";
import { getDesignSystemFiles } from "../design-system/published-files";
import { useDesignSystems } from "../design-system/store";
import { hasPendingFileOverlay, subscribeHtmlReferences } from "../design-system/type-declarations";
import { AccessibilityAnnouncementsLabel_18, AccessibilityAnnouncementsLabel_19, AccessibilityAnnouncementsLabel_2, AccessibilityAnnouncementsLabel_20, AccessibilityAnnouncementsLabel_21, AccessibilityAnnouncementsLabel_3, AccessibilityAnnouncementsLabel_4, AccessibilityAnnouncementsLabel_5, AccessibilityAnnouncementsLabel_7, AccessibilityAnnouncementsLabel_8, AccessibilityAnnouncementsLabel_9, AccessibilityAnnouncementsReadyUpdatedChangedConfig, AccessibilityAnnouncementsUndoRedoConfig, AccessibilityAnnouncementsUndoRedoConfig_2, addContrastToAnnouncement, artboardNotSelectedAnnouncement, artboardPositionAnnouncement, artboardResizeAnnouncement, artboardsDeletedAnnouncement, backgroundEditAnnouncement, canvasSelectionKey, clipboardActionFailureMessage, clippedSvgCopyMessage, CutValue, DeletedValue, fitContentResultMessage, flipDirectionAnnouncement, ItsPageHasNothingToDrawMessage, ItsPictureCouldnTBeMadeTryMessage, missingCopiedImagesMessage, missingSvgImagesMessage, moveDirectionAnnouncement, NothingChangedThatStepNoLongerMessage, NothingSelectedMessage, objectsDeletedAnnouncement, pageAnnouncement, pageDeletedAnnouncement, pageUndoFailureMessage, pendingUndoAnnouncement, pngCopyFailureMessage, propertyEditAnnouncement, reorderAnnouncement, selectionActionRefusalAnnouncement, selectionAnnouncement, stackingAnnouncement, summarizeChangedArtboards, svgCopyFailureMessage, ThisIsTheFirstArtboardMessage, ThisIsTheLastArtboardMessage, ThisIsTheOnlyArtboardMessage, undoTargetAnnouncement, zoomAnnouncement } from "../editor/accessibility/announcements";
import { announce } from "../editor/accessibility/announcer";
import { EditorMenu } from "../editor/chrome/context-menu";
import { useInspectorPosture } from "../editor/chrome/inspector-sheet";
import { EditorMenuItem } from "../editor/chrome/menu-item";
import { blockingOverlaySelector } from "../editor/chrome/overlay-state";
import { clearEscapeReleaseSuppression, EditorPopover } from "../editor/chrome/popover";
import { DocumentSaveStatus } from "../editor/chrome/save-status";
import { reactChromeTheme } from "../editor/chrome/theme";
import { useToast } from "../editor/chrome/toast";
import { annotationClipboardEntries, annotationImageReferences, blankArtboardBody, ClipboardAnnotationsLimit } from "../editor/clipboard/annotations";
import { buildArtboardClipboard, ClipboardArtboardsLimit, ClipboardArtboardsResolvedValue, ClipboardArtboardsTest, ClipboardArtboardsTest_2, clipboardBlobAssets, parseArtboardClipboard } from "../editor/clipboard/artboards";
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
import { equalPropValues } from "../editor/components/prop-validation";
import { routeStyleEditsByElementKind } from "../editor/css/edit-validation";
import { emitEditorEvent } from "../editor/events/runtime";
import { flipAnnotations, GeometryFlipAnnotationsLabel_2, GeometryFlipAnnotationsLabel_3, GeometryFlipAnnotationsWytKytYtConfig, imageFlipCss, PartOfTheSelectionCouldnTBeMessage } from "../editor/geometry/flip-annotations";
import { CouldnTFlipRightNowTryAgainMessage, FinishEditingThisDrawingSPointsToMessage, FlippingThisWayWouldnTChangeItMessage, GeometryFlipElementsLabel_6, partialFlipMessage } from "../editor/geometry/flip-elements";
import { createElementEditId } from "../editor/geometry/snapping";
import { useLiveDismissalGuard } from "../editor/hooks/element-and-dismissal";
import { useLatestCallback } from "../editor/hooks/latest-callback";
import { normalizeAuthoredHtml } from "../editor/html/authoring";
import { canFreezeSinglePaste, fileDropPosition, pastedElementGeometry, pastedRootElementCount, wrapInlinePastedHtml } from "../editor/insert/drop-targets";
import { textToParagraphHtml } from "../editor/insert/targets";
import { InspectorComputedDataItems, normalizeInspectorComputedData } from "../editor/inspector/computed-data";
import { DcEditorGuidesVisibleKey, DcEditorModeKey, defaultInspectorOpen, editorToolbarId, getTweakSelection, InspectorOpenContext, inspectorOpenStorageKey, inspectorPanelId, inspectorToggleId } from "../editor/inspector/context";
import { InspectorPropertySchemaItems } from "../editor/inspector/property-schema";
import { isContextMenuShortcut, KeyboardEditActionsCutCopyPasteConfig } from "../editor/keyboard/edit-actions";
import { focusedOutlineRow, isEditingInputTarget, isPropertyEditorTarget, McFindAttribute } from "../editor/keyboard/find";
import { imagePasteRefusal, isCanvasEnterAction } from "../editor/keyboard/paste";
import { isApplePlatform, isDuplicateShortcut, keyboardShortcutLabel } from "../editor/keyboard/shortcuts";
import { imageCropCss } from "../editor/media/crop-geometry";
import { isEditableComponentName } from "../editor/media/object-crop";
import { captureVideoPoster, isVideoFile, probeVideoFile, VideoMp4VideoWebmVideoQuicktimeMovValue, videoUploadFailureMessage, videoUploadRefusal } from "../editor/media/video-upload";
import { ModelModelStateLimit } from "../editor/model/model-state";
import { NotesBlocksHandler, parseNoteBlocks } from "../editor/notes/blocks";
import { NotesLinkEditingKind, NotesLinkEditingLh } from "../editor/notes/link-editing";
import { reconcileAnnotationOutline, ViewOnlyYouCanInspectThisMessage } from "../editor/outline/annotations";
import { CanTReadThisArtboardSFileAskMessage, OutlineGlyphsLabel, OutlineGlyphsTest } from "../editor/outline/glyphs";
import { suppressNativeContextMenu } from "../editor/outline/native-menu";
import { inspectPickerSelection, PickerBridgeConstant_2, setPickerHostScale } from "../editor/picker/bridge";
import { registerHiddenPickerTag } from "../editor/picker/hidden-tags";
import { getPickerFontFaces } from "../editor/picker/inspection";
import { AnchoredDesignProperties } from "../editor/properties-panel";
import { selectionActionFailureMessage, SelectionActionsHelmetScHelmetPattern, SelectionActionsReplace } from "../editor/selection/actions";
import { applyHostSelectionResponse, boardSelectionCount, boardSelectionItems, canvasBoardSelection, canvasElementSelectionCount, clearSelectedBoards, emptyBoardSelection, emptyCanvasSelection, filterSelectedAnnotations, filterSelectedArtboards, filterSelectedElements, HostValue, isEmptyCanvasSelection, mergeCanvasSelection, reconcileSelectedElementIds, replaceSelectedElements, selectionFromArtboards, selectionFromBoards, selectionFromElements, setCanvasElementSelection, toggleCanvasElementIds, toggleCanvasSelection } from "../editor/selection/canvas-selection";
import { HostedEditor, selectedElementLocations } from "../editor/selection/host";
import { SessionStripPopover } from "../editor/session-strip/popover";
import { artboardStorePath, currentEditingArtboardPath, SessionArtboardStateConstant, setArtboardWritableCheck, setCurrentEditingArtboard } from "../editor/session/artboard-state";
import { activeCropElement, CropIsNotAvailableHereForMessage, SessionElementStateUnloadedTurnedAutoConfig, updateElementSessionState, useElementSessionState } from "../editor/session/element-state";
import { SessionBusyError, UnsettledEditsError } from "../editor/session/errors";
import { beginDeferredTextInput, finishDeferredTextInput } from "../editor/text/deferred-input";
import { hasBlockingEditorOverlay, hasHeldUndoOverlay, isCanvasTypingTarget } from "../editor/text/typing-target";
import { toolbarDensity, ToolbarDivider, useToolbarOverlaySize } from "../editor/toolbar/layout";
import { ToolbarCaret, ToolbarPrimitivesComponent, useToolbarItemAccessibility } from "../editor/toolbar/primitives";
import { ToolbarPublishControls } from "../editor/toolbar/publish-controls";
import { EditorToolbar } from "../editor/toolbar/toolbar";
import { DesignToolToolbar } from "../editor/tools";
import { updateTypographyCensus } from "../editor/typography/census-store";
import { useVectorToolReset } from "../editor/vector/tool-state";
import { describeExportScope, reportExportBuilt, reportExportDeliveryEvent, reportExportEvent } from "../export/analytics";
import { artboardExportMenuItems, exportSelectionHint, noExportableArtboardsMessage, selectedExportableArtboards } from "../export/artboard-menu";
import { ExportCaptureViewportLimit, measureEmptyExportTail, measureExpandedContentHeight, measureFlowExportHeight, withCaptureViewport } from "../export/capture-viewport";
import { dataUrlToBytes } from "../export/capture-warnings";
import { captureExportArtboards, describeExportCaptureWarnings, drainArtboardExportCaptures, selectExportCaptureArtboard } from "../export/capture";
import { exportDeliveryEventName } from "../export/delivery";
import { DownloadsArenTAvailableToYouForMessage, downloadsWithheld, ExportDownloadsResolvedValue, saveThroughHost, useDownloadsWithheld } from "../export/downloads";
import { exportBaseFileName, exportFileName, sanitizeExportFileName } from "../export/file-names";
import { collectArtboardFontDescriptors } from "../export/font-usage";
import { ExportCancelled, useExportFormats } from "../export/host-registry";
import { ExportHtmlError, produceStandaloneHtmlExport, selectHtmlExportArtboards } from "../export/html-producer";
import { captureArtboardImage, exportArtboardImage } from "../export/image";
import { classifyExportAbort, classifyExportFailure, classifyExportSaveOutcome, classifyHtmlDelivery, classifyImageDelivery, classifyPdfDelivery } from "../export/outcomes";
import { exportHeightTolerance, minEmptyExportTail, getArtboardPaperSize, imageCaptureScaleOptions, isFillPagedExport, isFlowExport, needsPagedExport, resolveMeasuredExportHeight } from "../export/paper-and-scale";
import { collectPdfExportPages, exportPdfWithFeedback, pdfExportMessage, pdfExportWarnings } from "../export/pdf/orchestration";
import { artboardNeedsScaledDownExport, ExportArtboardPickTarget, exportPickerChromeHeight, ExportPickerToolbar, initialExportPickedFiles, initialExportScale, interactiveExportDeadline, useExportPicker } from "../export/picker";
import { designExportReadme, missingExportAssetSuffix } from "../export/readme";
import { createStoredZip } from "../export/stored-zip";
import { collectExportUploadedAssets, fetchExportAsset } from "../export/uploaded-assets";
import { clippedArtboardsMessage, emptyExportTailMessage, fontSubstitutionWarnings, formatArtboardNames, getArtboardCaptureMode, getArtboardCaptureOptions } from "../export/warnings";
import { FindBar } from "../find/bar";
import { canRevealFindMatch, designFileTextRuns, findRestoreCamera, runFindRevealAfterSettle } from "../find/canvas-adapter";
import { createFindNavigationOriginTracker } from "../find/navigation-origin";
import { annotationTransformSnapshot, artboardTransformSnapshot } from "../geometry/selection-transform";
import { fetchBlobAsset, getCachedBlobObjectUrl } from "../platform/blob-cache";
import { CdsIsland } from "../platform/cds-island";
import { isLoadingArtboardHtml, shouldStoreArtboardByReference } from "../platform/design-document-adapter";
import { useDesignSource } from "../platform/design-source";
import { structurallyEqual } from "../platform/document-values";
import { isEmulator } from "../platform/emulator";
import { getAllFileReferencePaths, getExternalFileReferences, saveExternalFileReference } from "../platform/external-files";
import { awaitFeatureFlag } from "../platform/feature-flags";
import { annotationArrowHeads, annotationBounds, annotationGeometry, annotationKindCategory, annotationLineEndpoints, annotationRotation, annotationTextStyle, annotationVisibleBounds, artboardAppearanceProperties, artboardRadiusCss, blankDcDocument, canvasMetadataFile, createAnnotationId, createPageId, designArtboardsMatchFiles, designPageContents, designPageId, duplicateArtboardTitle, embedMemoryPrefix, fileCapFailureMessage, findArtboardByName, getDocumentFileCap, getEmbeddedPresence, getKvClient, isEmbedFrozen, isPreviewMessage, isShapeAnnotation, moveAnnotation, nextArtboardTitle, normalizeArtboardRadius, parseCanvasMetadata, PlatformFileContentBackgroundBackgroundColorOpacityValues, PlatformFileContentConstant_10, PlatformFileContentConstant_12, PlatformFileContentConstant_13, PlatformFileContentConstant_16, PlatformFileContentConstant_17, PlatformFileContentConstant_18, PlatformFileContentConstant_19, PlatformFileContentConstant_20, PlatformFileContentConstant_5, PlatformFileContentConstant_6, PlatformFileContentConstant_8, PlatformFileContentConstant_9, PlatformFileContentFilesValue, PlatformFileContentHandler_4, PlatformFileContentHas, PlatformFileContentKind, PlatformFileContentLimit_3, PlatformFileContentLimit_5, PlatformFileContentLimit_6, PlatformFileContentMaxW, PlatformFileContentRectOvalLineConfig, PlatformFileContentResolvedValue_11, PlatformFileContentSlice, PlatformFileContentSMLConfig, PlatformFileContentTest_2, PlatformFileContentTest_3, PlatformFileContentTrim, PlatformFileContentWebpAvifPattern, ProjectValue, reorderArtboardsOnPages, replaceDesignArtboards, replaceDesignPageContents, rotatedAnnotationBounds, serializeCanvasMetadata, setEmbedPresenceListener, setEmbedSettler, setEmbedSilencer, trackEmbeddedWrite, uniqueArtboardFile, uniqueElementArtboardTitle, updateAnnotationAlt, updateAnnotationArrowHeads, updateAnnotationCrop, updateAnnotationCss, updateAnnotationTextStyle, updateAnnotationVideo, updateArtboardRadius, validCoverArtboard } from "../platform/file-content";
import { PanelValue, useFrameSaveState } from "../platform/frame-host-bridge";
import { ChatColumnOverlayActionsSlotValue, designAnalyticsEvents, frameAnalyticsReporter, healthReporter, reportExportOutcome } from "../platform/health-and-analytics";
import { getCachedHostCapability } from "../platform/host-capabilities";
import { idleTaskScheduler } from "../platform/idle-scheduler";
import { isImageFile } from "../platform/image-processing";
import { getAssetsCapability, isBlobAssetUrl } from "../platform/image-upload";
import { errorMessage, TokenBucket } from "../platform/rate-limiter";
import { getCurrentUserProfile } from "../platform/user-capabilities";
import { normalizeProjectBlobPaths } from "../preview/blob-paths";
import { buildPreviewDocument, prepareExportDcDocument, PreviewBuildDocumentResolvedValue_3 } from "../preview/build-document";
import { getLinkedProjectFiles, isProjectSourcePath } from "../preview/component-imports";
import { collectProjectDependencyFiles } from "../preview/dependency-graph";
import { createPreviewHandle } from "../preview/evaluation";
import { createLinkedFileScript, runtimeModuleBlobs, runtimeModuleUrls } from "../preview/module-cache";
import { stripPreviewProjectRoot } from "../preview/project-root";

var noopCanvasSubscription: Dynamic;
var zeroCanvasRevision: Dynamic;
var canvasNeedsPageMessage: Dynamic;
var fitArtboardsLabel: Dynamic;
var loosePieceRenameHint: Dynamic;
var staleDeleteFailureMessage: Dynamic;
var singleArtboardPngCopyMessage: Dynamic;
var singleArtboardSvgCopyMessage: Dynamic;
var staticArtboardPlaybackMessage: Dynamic;
var loosePiecePlaybackMessage: Dynamic;
var pageHasNoArtboardsMessage: Dynamic;
var existingThumbnailMessage: Dynamic;
var oversizedThumbnailMessage: Dynamic;
var MemoizedCanvasZoomControl: Dynamic;
var MemoizedCanvasSaveIndicator: Dynamic;
var isCanvasReadonlySaveState: Dynamic;
var CanvasSaveStatus: Dynamic;
var CanvasSaveKeyboardShortcut: Dynamic;
var artboardRevealSettleTimeoutMs: Dynamic;
var artboardFrameReadyTimeoutMs: Dynamic;
var dragGhostFilename: Dynamic;
var previewDropNoticeDurationMs: Dynamic;
var canvasExportSettleTimeoutMs: Dynamic;
var exportAlreadyRunningMessage: Dynamic;
var maxSessionDirtyFlushRetries: Dynamic;
var canvasExitExportWaitTimeoutMs: Dynamic;
var crossCanvasPasteConfirmFeatureFlag: Dynamic;
var emptyCanvasFileSet: Dynamic;
var emptyCanvasSelectionFiles: Dynamic;
var emptyCanvasOptions: Dynamic;
var layerEntriesEqual: Dynamic;
var emptyCanvasNoteSet: Dynamic;
var singleCanvasCaptureSemaphore: Dynamic;
var parallelCanvasCaptureSemaphore: Dynamic;
var artboardIsNotExpandedFill: Dynamic;
var canvasPastePositionStep: Dynamic;
var defaultCanvasCamera: Dynamic;
var canvasPanUsageWindowMs: Dynamic;
var canvasZoomUsageWindow: Dynamic;
var minimumCanvasZoomUsage: Dynamic;
var hasActiveUserGesture: Dynamic;
var canvasSelectionChromeInsetPixels: Dynamic;
function useCanvasSaveState(
  document2?: Dynamic,
  synced?: Dynamic,
  localDirty?: Dynamic,
): Dynamic {
  let [value, value2]: Dynamic = (0, reactChromeTheme.useState)(
    document2.saveState(),
  );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => document2.subscribeSave(value2),
    [document2],
  );
  return (0, reactChromeTheme.useMemo)(
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
function artboardFullscreenCamera(
  artboard?: Dynamic,
  fit2?: Dynamic,
  viewportWidth?: Dynamic,
  viewportHeight?: Dynamic,
  topInset: Dynamic = 0,
  padding: Dynamic = 0,
): Dynamic {
  if (!fit2)
    return {
      x: artboard.x,
      y: artboard.y - topInset,
      scale: 1,
    };
  let value: Dynamic = Math.max(1, viewportHeight - topInset - padding * 2),
    value2: Dynamic = Math.max(
      0.01,
      Math.min(
        1,
        Math.max(1, viewportWidth - padding * 2) / artboard.w,
        value / artboard.h,
      ),
    );
  return {
    x: artboard.x - (viewportWidth / value2 - artboard.w) / 2,
    y:
      artboard.y -
      (topInset + padding) / value2 -
      (value / value2 - artboard.h) / 2,
    scale: value2,
  };
}
function nextArtboardPlacementPoint(artboards?: Dynamic): Dynamic {
  return artboards.length
    ? {
        x:
          Math.max(
            ...artboards.map((input?: Dynamic): Dynamic => input.x + input.w),
          ) + 80,
        y: Math.min(...artboards.map((input?: Dynamic): Dynamic => input.y)),
      }
    : {
        x: 0,
        y: 0,
      };
}
function runWhenConditionReady(
  condition?: Dynamic,
  callback?: Dynamic,
  attempts: Dynamic = 100,
): Dynamic {
  if (condition()) {
    callback();
    return;
  }
  attempts > 0 &&
    setTimeout(
      (): Dynamic => runWhenConditionReady(condition, callback, attempts - 1),
      30,
    );
}
async function readCanvasClipboardText(): Promise<Dynamic> {
  try {
    return (await navigator.clipboard?.readText()) ?? "";
  } catch {
    return "";
  }
}
function canvasSelectionsEqual(first?: Dynamic, second?: Dynamic): Dynamic {
  return first === second
    ? true
    : first.artboards.size !== second.artboards.size ||
        first.notes.size !== second.notes.size ||
        first.elements.size !== second.elements.size
      ? false
      : [...first.artboards].every(
          (input?: Dynamic): Dynamic => second.artboards.has(input),
        ) &&
        [...first.notes].every(
          (input?: Dynamic): Dynamic => second.notes.has(input),
        ) &&
        [...first.elements].every(
          ([input, input2]: Dynamic): Dynamic =>
            second.elements.get(input)?.tids.join() === input2.tids.join(),
        );
}
function DesignCanvas({
  filePath: filePath,
  assets: assets,
  doc: doc,
}: Dynamic): Dynamic {
  useUiLocale();
  let { showToast: showToast, hideToast: hideToast }: Dynamic = (0,
    useToast)(),
    value: Dynamic = (0, reactChromeTheme.useRef)(null),
    value2: Dynamic = (0, reactChromeTheme.useRef)(null),
    value3: Dynamic = (0, reactChromeTheme.useRef)(null),
    value4: Dynamic = (0, reactChromeTheme.useRef)(null),
    value5: Dynamic = (0, reactChromeTheme.useRef)(false),
    value6: Dynamic = (0, reactChromeTheme.useRef)(
      async (): Promise<Dynamic> => {},
    ),
    dirtySessionFlushersRef: Dynamic = (0, reactChromeTheme.useRef)(
      new Map(),
    ),
    [sessionsDirty, setSessionsDirty]: Dynamic = (0,
    reactChromeTheme.useState)(false),
    [sessionFlushEpoch, incrementSessionFlushEpoch]: Dynamic = (0,
    reactChromeTheme.useState)(0),
    sessionFlushRetryCountRef: Dynamic = (0, reactChromeTheme.useRef)(
      0,
    ),
    registerDirtySession: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let current4: Dynamic = dirtySessionFlushersRef.current;
        if (options) {
          current4.set(input, options);
          let value653: Dynamic =
            sessionFlushRetryCountRef.current > maxSessionDirtyFlushRetries;
          sessionFlushRetryCountRef.current = 0;
          value653 &&
            incrementSessionFlushEpoch(
              (input2?: Dynamic): Dynamic => input2 + 1,
            );
        } else current4.delete(input);
        setSessionsDirty(current4.size > 0);
      },
      [],
    ),
    saveCanvas: Dynamic = (0,
    reactChromeTheme.useMemo)((): Dynamic => {
      let value653: Dynamic = (0, beforeExport)(
        value3,
        async (): Promise<Dynamic> => {
          for (let value654 of [
            ...dirtySessionFlushersRef.current.values(),
          ] as Dynamic)
            await value654();
          await value6.current();
          await doc.save();
        },
      );
      return async (): Promise<Dynamic> => {
        let current4: Dynamic = localDirtyEpochRef.current;
        try {
          await value653();
          localDirtyEpochRef.current === current4 && setLocalDirty(false);
        } catch (value654: Dynamic) {
          let value655: Dynamic = "loadState" in doc ? "sync" : "Save";
          showToast(
            value654 instanceof SessionBusyError
              ? uiMessage("canvas.designCanvas.closeTheOpenDialogFirst") + value655 + "."
              : value654 instanceof UnsettledEditsError
                ? uiMessage("canvas.designCanvas.someEditsCouldNotBe") +
                  value655 +
                  "."
                : (value655 === "Save" ? uiMessage("canvas.designCanvas.saveFailed") : uiMessage("canvas.designCanvas.syncFailed")) +
                  (value654 instanceof Error
                    ? value654.message
                    : String(value654)),
            "error",
          );
        }
      };
    }, [doc, showToast]),
    supportsLoadState: Dynamic = "loadState" in doc,
    [saveState, setSaveState]: Dynamic = (0,
    reactChromeTheme.useState)(doc.saveState());
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      doc.subscribeSave(
        (input?: Dynamic): Dynamic =>
          setSaveState(
            (input2?: Dynamic): Dynamic =>
              supportsLoadState &&
              isCanvasReadonlySaveState(input2) ===
                isCanvasReadonlySaveState(input) &&
              (isCanvasReadonlySaveState(input) === "live" ||
                input2.message === input.message)
                ? input2
                : input,
          ),
      ),
    [doc, supportsLoadState],
  );
  let editable: Dynamic = saveState.status !== "readonly",
    editableRef: Dynamic = (0, reactChromeTheme.useRef)(editable);
  editableRef.current = editable;
  let [mode, setMode]: Dynamic = (0, reactChromeTheme.useState)(
    (): Dynamic => (editable ? "edit" : "preview"),
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    editable && setMode("edit");
  }, [editable]);
  let [value7, value8]: Dynamic = (0, npm_useLocalStorage_QP)(
      inspectorOpenStorageKey,
      defaultInspectorOpen,
    ),
    [value9, value10]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value11: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => [value9, value10],
      [value9],
    ),
    [value12, value13]: Dynamic = (0, npm_useLocalStorage_QP)(
      DcEditorGuidesVisibleKey,
      true,
    ),
    value14: Dynamic = (0, reactChromeTheme.useRef)(false),
    propertiesHaveFocusRef: Dynamic = (0, reactChromeTheme.useRef)(
      false,
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (input?: Dynamic): Dynamic =>
        input instanceof Node &&
        ((document as Dynamic)
          .getElementById(inspectorPanelId)
          ?.contains(input) ??
          false),
      callback16: Dynamic = (event?: Dynamic): Dynamic => {
        propertiesHaveFocusRef.current = callback15(event.target);
      },
      callback17: Dynamic = (event?: Dynamic): Dynamic => {
        let target: Dynamic = event.target;
        !(target instanceof Node) ||
          !callback15(target) ||
          callback15(event.relatedTarget) ||
          queueMicrotask((): Dynamic => {
            target.isConnected &&
              !callback15((document as Dynamic).activeElement) &&
              (propertiesHaveFocusRef.current = false);
          });
      };
    (document as Dynamic).addEventListener("focusin", callback16);
    (document as Dynamic).addEventListener("focusout", callback17);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("focusin", callback16);
      (document as Dynamic).removeEventListener("focusout", callback17);
    };
  }, []);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (): Dynamic => {
      value14.current = !(0, hasBlockingEditorOverlay)();
    };
    (window as Dynamic).addEventListener("panel-toggle-key", callback15);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("panel-toggle-key", callback15);
  }, []);
  let value15: Dynamic = (0, reactChromeTheme.useRef)(0),
    editing: Dynamic = editable && mode === "edit",
    readOnly: Dynamic = !editable,
    [toolResetTick, setToolResetTick]: Dynamic = (0,
    reactChromeTheme.useState)(0),
    previousEditingRef: Dynamic = (0, reactChromeTheme.useRef)(false);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    editing &&
      !previousEditingRef.current &&
      setToolResetTick((input?: Dynamic): Dynamic => input + 1);
    previousEditingRef.current = editing;
  }, [editing]);
  let [value16, value17]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    [localDirty, setLocalDirty]: Dynamic = (0,
    reactChromeTheme.useState)(false),
    localDirtyEpochRef: Dynamic = (0, reactChromeTheme.useRef)(0),
    value18: Dynamic = (0, reactChromeTheme.useRef)(null),
    value19: Dynamic = SelectionActionsReplace,
    [selection, setSelection]: Dynamic = (0,
    reactChromeTheme.useState)(emptyCanvasSelection),
    focusedFileRef: Dynamic = (0, reactChromeTheme.useRef)(null),
    value20: Dynamic = (0, reactChromeTheme.useRef)(null),
    selectionRef: Dynamic = (0, reactChromeTheme.useRef)(
      emptyCanvasSelection,
    ),
    value21: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => NothingSelectedMessage,
    ),
    value22: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value23: Dynamic = (0, reactChromeTheme.useRef)(false),
    value24: Dynamic = (0, reactChromeTheme.useRef)(null),
    value25: Dynamic = (0, reactChromeTheme.useRef)(null),
    selectionEpochRef: Dynamic = (0, reactChromeTheme.useRef)(0),
    value26: Dynamic = (0, reactChromeTheme.useRef)(null),
    value27: Dynamic = (0, reactChromeTheme.useRef)(null),
    value28: Dynamic = (0, reactChromeTheme.useRef)(0),
    abandonSelectionGesture: Dynamic = (0,
    reactChromeTheme.useCallback)(
      (): Dynamic => (
        value24.current?.abandon(),
        (value26.current = null),
        (value27.current = null),
        value28.current++,
        ++selectionEpochRef.current
      ),
      [],
    ),
    isSelectionEpochCurrent: Dynamic = (0,
    reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => selectionEpochRef.current === input,
      [],
    ),
    recordFrameSelectionSequence: Dynamic = (0,
    reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        frameSelectionSequencesRef.current.set(input, options);
      },
      [],
    ),
    handleFrameSelection: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (routeFrameSelectionEvent as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get frameSelectionTokensRef() { return frameSelectionTokensRef; }, get pendingFrameSelectionRef() { return pendingFrameSelectionRef; }, get selectionEpochRef() { return selectionEpochRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get setShownFrameSelectionRef() { return setShownFrameSelectionRef; }, get value24() { return value24; }, get value25() { return value25; }, get value27() { return value27; }, get value29() { return value29; }, get value30() { return value30; }, get value31() { return value31; } }, ...args),
      [],
    ),
    frameSelectionSequencesRef: Dynamic = (0,
    reactChromeTheme.useRef)(new Map()),
    value29: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value30: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value31: Dynamic = (0, reactChromeTheme.useRef)(null),
    count: Dynamic = 2e3,
    count2: Dynamic = 6e3,
    pendingFrameSelectionRef: Dynamic = (0, reactChromeTheme.useRef)(
      null,
    ),
    value32: Dynamic = (0, reactChromeTheme.useRef)(null),
    frameSelectionTokenSequenceRef: Dynamic = (0,
    reactChromeTheme.useRef)(0),
    frameSelectionTokensRef: Dynamic = (0, reactChromeTheme.useRef)(
      new Map(),
    ),
    setShownFrameSelection: Dynamic = (0,
    reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let entry: Dynamic = value177.current.get(input);
        if (!entry) return null;
        let value653: Dynamic =
          context ??
          HostValue +
            String(++frameSelectionTokenSequenceRef.current);
        frameSelectionTokensRef.current.set(input, value653);
        return entry.setShownSelection(
          options,
          options ? value19(input) : null,
          value653,
          frameSelectionSequencesRef.current.get(input) ?? 0,
        )
          ? value653
          : null;
      },
      [],
    ),
    setShownFrameSelectionRef: Dynamic = (0, reactChromeTheme.useRef)(
      setShownFrameSelection,
    );
  setShownFrameSelectionRef.current = setShownFrameSelection;
  let value33: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    applyCanvasSelection: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (commitCanvasSelection as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get frameSelectionTokensRef() { return frameSelectionTokensRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get setShownFrameSelection() { return setShownFrameSelection; }, get value177() { return value177; }, get value19() { return value19; } }, ...args),
      [setShownFrameSelection],
    );
  value33.current = applyCanvasSelection;
  let value34: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (focusArtboardAndReplaySelection as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get focusedFileRef() { return focusedFileRef; }, get frameSelectionSequencesRef() { return frameSelectionSequencesRef; }, get pendingFrameSelectionRef() { return pendingFrameSelectionRef; }, get selectionEpochRef() { return selectionEpochRef; }, get selectionRef() { return selectionRef; }, get setShownFrameSelection() { return setShownFrameSelection; }, get value177() { return value177; }, get value274() { return value274; }, get value30() { return value30; } }, ...args),
      [setShownFrameSelection, abandonSelectionGesture],
    ),
    value35: Dynamic = (0, reactChromeTheme.useRef)(null),
    value36: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, source?: Dynamic): Dynamic => {
        let value653: Dynamic = Promise.all([
            options.catch((): Dynamic => {}),
            source.ended,
          ]).then(([, input2]: Dynamic): Dynamic => {
            state.travelled = input2.travelled;
          }),
          state: Dynamic = {
            file: input,
            over: value653,
            gen: source.gen,
            kind: source.kind,
            travelled: false,
            after: null,
            answered: false,
            expired: false,
          };
        value32.current = state;
        let callback15: Dynamic = (): Dynamic => {
            (window as Dynamic).clearTimeout(value654);
            value32.current === state && (value32.current = null);
          },
          value654: Dynamic = (window as Dynamic).setTimeout((): Dynamic => {
            state.expired = true;
            callback15();
          }, count2);
        value653.then(callback15);
      },
      [],
    ),
    value37: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value35.current = {
          file: input,
          x: options.x,
          y: options.y,
          at: Date.now(),
        };
      },
      [],
    ),
    value38: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic,
      ): Dynamic => {
        let value654: Dynamic = value19(input);
        abandonSelectionGesture();
        let value655: Dynamic =
          value32.current?.file === input ? value32.current : null;
        value655 && (value655.answered = true);
        if (extra && (value653 === "replace" || value653 === "narrow")) {
          let current4: Dynamic = value35.current;
          current4 &&
            current4.file === input &&
            Date.now() - current4.at < 2e3 &&
            value177.current.get(input)?.armedByClick(current4.x, current4.y);
        }
        if (value653 === "toggle" || value653 === "remove")
          applyCanvasSelection(
            (0, toggleCanvasElementIds)(
              selectionRef.current,
              input,
              [options],
              {
                name: value654,
                rect: context,
              },
            ),
          );
        else {
          let current4: Dynamic = selectionRef.current,
            value657: Dynamic =
              current4.elements.size === 1 &&
              current4.artboards.size === 0 &&
              current4.notes.size === 0 &&
              current4.elements.get(input)?.tids.length === 1 &&
              current4.elements.get(input)?.tids[0] === options;
          value279.current();
          value657 ||
            applyCanvasSelection(
              (0, selectionFromElements)(input, {
                name: value654,
                tids: [options],
                rect: context,
                count: 1,
              }),
            );
        }
        value655 && (value655.after = selectionRef.current);
        let value656: Dynamic = extra ? value34(input) : undefined;
        value655 && (value655.gen = selectionEpochRef.current);
        return value656;
      },
      [value34, applyCanvasSelection, abandonSelectionGesture],
    ),
    value39: Dynamic = (0, reactChromeTheme.useRef)(null),
    value40: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        (0, OutlineGlyphsTest)(doc.content().files[input] ?? "") &&
          (value39.current != null && hideToast(value39.current),
          (value39.current = showToast(
            CanTReadThisArtboardSFileAskMessage,
          )));
      },
      [doc, hideToast, showToast],
    ),
    value41: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let entry: Dynamic = value177.current.get(input);
        if (!entry) return;
        let value653: Dynamic = abandonSelectionGesture();
        entry.ensureOutline().then((items?: Dynamic): Dynamic => {
          if (selectionEpochRef.current !== value653) return;
          if (items === null) return value40(input);
          if (items.length === 0) return;
          let value654: Dynamic = items
            .filter(
              (input2?: Dynamic): Dynamic =>
                !SelectionActionsHelmetScHelmetPattern.test(
                  input2.tag,
                ),
            )
            .map((input2?: Dynamic): Dynamic => input2.tid);
          value654.length !== 0 &&
            (applyCanvasSelection(
              (0, selectionFromElements)(input, {
                name: value19(input),
                tids: value654,
                rect: null,
                count: value654.length,
              }),
            ),
            value34(input));
        });
      },
      [value34, applyCanvasSelection, value40, abandonSelectionGesture],
    ),
    value42: Dynamic = (0, reactChromeTheme.useRef)(value41);
  value42.current = value41;
  let value43: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let current4: Dynamic = selectionRef.current;
        if (current4.artboards.has(input) && !current4.elements.has(input)) {
          value41(input);
          return;
        }
        let entry: Dynamic = current4.elements.get(input),
          entry2: Dynamic = value177.current.get(input);
        if (!entry || entry.tids.length !== 1 || !entry2 || !entry2.isReady())
          return;
        let [tids]: Dynamic = entry.tids;
        if (tids == null) return;
        if (entry2.describeTids([tids])[0]?.editable) {
          entry2.startTextEdit(value19(input), tids);
          return;
        }
        let current5: Dynamic = value28.current;
        entry2
          .pickAt(options.x, options.y, "deeper", [tids])
          .then((input2?: Dynamic): Dynamic => {
            let entry3: Dynamic = selectionRef.current.elements.get(input);
            value28.current !== current5 ||
              (entry3 != null &&
                !(entry3.tids.length === 1 && entry3.tids[0] === tids)) ||
              input2 == null ||
              "empty" in input2 ||
              input2.tid === tids ||
              value38(input, input2.tid, input2.rect, "replace", true);
          });
      },
      [value38, value41],
    ),
    value44: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => false,
    ),
    value45: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => ({
        flipped: false,
      }),
    ),
    value46: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => false,
    ),
    value47: Dynamic = (0, reactChromeTheme.useRef)(
      Promise.resolve(),
    ),
    value48: Dynamic = (0, reactChromeTheme.useRef)(0),
    value49: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value47.current
          .then(input, input)
          .finally((): Dynamic => options?.());
        value47.current = value653.catch((): Dynamic => {});
      },
      [],
    ),
    value50: Dynamic = (0, reactChromeTheme.useRef)(0),
    value51: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        if (value48.current === 0) {
          input();
          return;
        }
        let current4: Dynamic = selectionRef.current,
          callback15: Dynamic = (): Dynamic =>
            selectionEpochRef.current - value50.current,
          value653: Dynamic = callback15();
        value49((): Dynamic => {
          (0, sameSelectedObjectFiles)(
            current4,
            selectionRef.current,
          ) && callback15() === value653
            ? input()
            : options?.();
        });
      },
      [value49],
    ),
    value52: Dynamic = (0, reactChromeTheme.useRef)(value51);
  value52.current = value51;
  let value53: Dynamic = (0, reactChromeTheme.useRef)({
      at: 0,
      seq: new Map(),
      dead: new Set(),
    }),
    count3: Dynamic = 400,
    value54: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let entry: Dynamic = value177.current.get(input);
        if (!entry) return;
        let value653: Dynamic =
          HostValue +
          String(++frameSelectionTokenSequenceRef.current);
        frameSelectionTokensRef.current.set(input, value653);
        entry.setShownSelection(null, null, value653);
      },
      [],
    ),
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      [...input.elements]
        .filter(
          ([input2, input3]: Dynamic): Dynamic =>
            input3.name === value19(input2),
        )
        .map(
          ([input2, input3]: Dynamic): Dynamic => [input2, [...input3.tids]],
        ),
    value55: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (navigateSelectionByKind as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get applyCanvasSelection() { return applyCanvasSelection; }, get callback() { return callback; }, get count3() { return count3; }, get focusedFileRef() { return focusedFileRef; }, get frameSelectionTokensRef() { return frameSelectionTokensRef; }, get selectionEpochRef() { return selectionEpochRef; }, get selectionRef() { return selectionRef; }, get value155() { return value155; }, get value177() { return value177; }, get value19() { return value19; }, get value218() { return value218; }, get value31() { return value31; }, get value34() { return value34; }, get value432() { return value432; }, get value44() { return value44; }, get value440() { return value440; }, get value48() { return value48; }, get value49() { return value49; }, get value50() { return value50; }, get value53() { return value53; }, get value54() { return value54; }, get value73() { return value73; }, get value87() { return value87; } }, ...args),
      [
        value34,
        value54,
        applyCanvasSelection,
        value49,
        abandonSelectionGesture,
      ],
    ),
    value56: Dynamic = (0, reactChromeTheme.useRef)(value55);
  value56.current = value55;
  let value57: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = selectionRef.current,
          value653: Dynamic = null;
        return {
          sweep: (input2?: Dynamic): Dynamic => {
            if (value653 == null) {
              value653 = abandonSelectionGesture();
              value279.current();
            } else if (selectionEpochRef.current !== value653) return;
            applyCanvasSelection(
              (0, mergeCanvasSelection)(current4, input2, input),
            );
          },
          cancel: (): Dynamic => {
            (value653 == null || selectionEpochRef.current === value653) &&
              (applyCanvasSelection(current4), abandonSelectionGesture());
          },
        };
      },
      [applyCanvasSelection, abandonSelectionGesture],
    ),
    value58: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value26.current,
          activeElement: Dynamic = (document as Dynamic).activeElement,
          value653: Dynamic = (0, reduceSessionCancellation)(
            current4,
            input,
            {
              now: Date.now(),
              focusedFile: focusedFileRef.current,
              busy: value218.current || value193.current != null,
              frameFocused:
                activeElement instanceof HTMLIFrameElement &&
                activeElement
                  .closest("[data-mega-artboard]")
                  ?.getAttribute("data-mega-artboard") ===
                  focusedFileRef.current,
              selection: selectionRef.current,
            },
          );
        value26.current = value653.rec;
        return value653.cancelKey != null && current4
          ? (value177.current
              .get(current4.file)
              ?.cancelBox(value653.cancelKey),
            true)
          : value653.restore != null && current4
            ? (abandonSelectionGesture(),
              (value27.current = current4.key),
              (selectionRef.current = value653.restore),
              setSelection(value653.restore),
              true)
            : false;
      },
      [applyCanvasSelection, abandonSelectionGesture],
    ),
    value59: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value58({
          type: options.type,
          file: input,
          key: options.key,
        });
      },
      [value58],
    ),
    value60: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic =>
        value58({
          type: "escape",
        }),
      [value58],
    ),
    value61: Dynamic = (0, reactChromeTheme.useRef)(value60);
  value61.current = value60;
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    selectionRef.current = selection;
  }, [selection]);
  let value62: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let current4: Dynamic = focusedFileRef.current;
      if (current4 == null || !selectionRef.current.elements.has(current4))
        return;
      let entry: Dynamic = value177.current.get(current4);
      entry &&
        ((value25.current = current4),
        entry.setShownSelection(null, null) || (value25.current = null));
    }, []),
    value63: Dynamic = (0, reactChromeTheme.useMemo)(
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
    value64: Dynamic = (0, reactChromeTheme.useRef)(value63);
  value64.current = value63;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      let current4: Dynamic = value64.current,
        target: Dynamic = event.target,
        value653: Dynamic =
          !!target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);
      event.key !== "Escape" ||
        event.repeat ||
        event.defaultPrevented ||
        current4?.part !== "text" ||
        !current4.tids ||
        value653 ||
        (0, hasBlockingEditorOverlay)() ||
        target?.closest("[data-mega-selection-strip]") ||
        (event.preventDefault(),
        event.stopPropagation(),
        value177.current.get(current4.file)?.clearLabelPart());
    };
    (window as Dynamic).addEventListener("keydown", callback15, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", callback15, true);
  }, []);
  let value65: Dynamic = supportsLoadState
      ? sessionsDirty
      : value16 || localDirty || sessionsDirty,
    value66: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        value65 && saveState.status === "ready"
          ? {
              status: "dirty",
              ...(supportsLoadState
                ? {
                    get message() { return uiMessage("canvas.designCanvas.changesWaitingToSync"); },
                  }
                : {}),
            }
          : saveState,
      [value65, supportsLoadState, saveState],
    ),
    [value67, value68]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic =>
        (0, parseCanvasMetadata)(
          doc.content().files[canvasMetadataFile],
          doc.content().files,
        ),
    ),
    value69: Dynamic = (0, reactChromeTheme.useRef)(
      doc.content().files[canvasMetadataFile],
    ),
    value70: Dynamic = (0, reactChromeTheme.useRef)(null);
  value70.current === null && (value70.current = value67);
  let value71: Dynamic = (0, reactChromeTheme.useRef)(null),
    value72: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic =>
        value71.current
          ? (0, reconcileCanvasManifestHistory)(
              input,
              value71.current,
              value70.current,
            )
          : input,
      [],
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      doc.subscribe((input?: Dynamic): Dynamic => {
        let files: Dynamic = doc.content().files,
          value653: Dynamic = files[canvasMetadataFile],
          value654: Dynamic =
            input?.remote === true && value653 !== value69.current;
        value69.current = value653;
        let value655: Dynamic,
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            (0, designArtboardsMatchFiles)(input2, files) && !value654
              ? input2
              : value653 === undefined
                ? (0, parseCanvasMetadata)(
                    (0, serializeCanvasMetadata)(input2),
                    files,
                  )
                : (value655 ??= (0, parseCanvasMetadata)(
                    value653,
                    files,
                  )),
          current4: Dynamic = value70.current;
        value70.current = callback15(current4);
        input?.remote === true &&
          value70.current !== current4 &&
          (value71.current ??= current4);
        value68(callback15);
      }),
    [doc],
  );
  let value73: Dynamic = (0, reactChromeTheme.useRef)(value67),
    callback2: Dynamic = (input?: Dynamic): Dynamic =>
      value73.current.artboards.find(
        (input2?: Dynamic): Dynamic => input2.file === input,
      )?.title ?? input.replace(/\.dc\.html$/, "");
  value73.current = value67;
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    doc.editorSaw?.(value67);
  }, [doc, value67]);
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    let current4: Dynamic = value71.current;
    value71.current = null;
    if (!current4) return;
    let value653: Dynamic = (0, reconcileCanvasManifestHistory)(
      value67,
      current4,
      value70.current,
    );
    (0, structurallyEqual)(value653, value67) || value68(value653);
  }, [value67]);
  let [value74]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => {
        let value653: Dynamic =
          (0, embedMemoryPrefix)() !== ""
            ? null
            : (0, classifyPlaceLink)();
        return value653 === null || value653.why === "known"
          ? null
          : (0, prototypeFileFromPlaceFragment)(
              value653.place,
              value67,
            );
      },
    ),
    [value75, value76]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => {
        let value653: Dynamic = value67.artboards.find(
          (input?: Dynamic): Dynamic => input.file === value74,
        );
        if (value653)
          return (0, designPageId)(value653, value67.pages);
        let value654: Dynamic =
          doc.content().files[canvasMetadataFile] != null;
        if (
          value654 &&
          value67.launch?.view === "canvas" &&
          value67.launch.page !== undefined
        )
          return value67.launch.page;
        let value655: Dynamic =
            value654 && value67.launch?.view === "focused"
              ? value67.launch.file
              : filePath,
          value656: Dynamic =
            value67.artboards.find(
              (input?: Dynamic): Dynamic => input.file === value655,
            ) ??
            value67.artboards.find(
              (input?: Dynamic): Dynamic => input.file === filePath,
            );
        return value656
          ? (0, designPageId)(value656, value67.pages)
          : (value67.pages?.[0]?.id ?? "");
      },
    ),
    value77: Dynamic = value67.pages ?? [],
    value78: Dynamic = value77[0]?.id ?? "",
    value79: Dynamic = value77.some(
      (input?: Dynamic): Dynamic => input.id === value75,
    )
      ? value75
      : value78,
    value80: Dynamic = (0, reactChromeTheme.useRef)(value79);
  value80.current = value79;
  let value81: Dynamic =
      value77.find((input?: Dynamic): Dynamic => input.id === value79)
        ?.name ?? uiMessage("canvas.designCanvas.page1"),
    value82: Dynamic = (0, reactChromeTheme.useSyncExternalStore)(
      noopCanvasSubscription,
      zeroCanvasRevision,
    ),
    value83: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => value77,
      [value77, value67, value82],
    ),
    value84: Dynamic = (0, reactChromeTheme.useRef)(value83);
  value84.current = value83;
  let value85: Dynamic = (0, useInspectorPosture)() === "sheet",
    value86: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => (0, designPageContents)(value67, value79),
      [value67, value79],
    ),
    value87: Dynamic = (0, reactChromeTheme.useRef)(value86);
  value87.current = value86;
  let [value88]: Dynamic = (0, reactChromeTheme.useState)(
      creationSequenceEnabled,
    ),
    value89: Dynamic = (0, useDesignCreationProgress)({
      doc: doc,
      flag: value88,
      artboards: value67.artboards,
      pages: value67.pages,
      artboardsHere: value86.artboards,
      pageId: value79,
      editing: editing,
      pageEmpty:
        value86.artboards.length === 0 &&
        (value86.annotations ?? []).length === 0,
    }),
    value90: Dynamic = (0, reactChromeTheme.useRef)([]);
  value90.current =
    value89.boxesHere.length === 0
      ? value86.artboards
      : [...value86.artboards, ...value89.boxesHere];
  let value91: Dynamic = (0, reactChromeTheme.useRef)(
    value89.boxesHere,
  );
  value91.current = value89.boxesHere;
  let flag: Dynamic = false,
    value92: Dynamic = (0, useClipboardFeatureFlag)(),
    value93: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => ({
        migrated: flag,
        fillFlows: value92,
        settle: value92,
      }),
      [flag, value92],
    ),
    value94: Dynamic = flag ? value11 : null,
    [value95, value96]: Dynamic = value94 ?? [value7, value8],
    value97: Dynamic = (0, reactChromeTheme.useRef)(value95);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let current4: Dynamic = value97.current;
    value97.current = value95;
    if (value95 === current4) return;
    let current5: Dynamic = value14.current;
    value14.current = false;
    let value653: Dynamic = requestAnimationFrame((): Dynamic => {
      let value654: Dynamic =
        (document as Dynamic).activeElement === (document as Dynamic).body ||
        (document as Dynamic).activeElement === null;
      if (
        value95
          ? !current5 && !value654
          : !(value654 && (current5 || propertiesHaveFocusRef.current))
      )
        return;
      let value655: Dynamic = (document as Dynamic).getElementById(
        inspectorPanelId,
      );
      (value95
        ? (value655?.querySelector('[role="tab"][aria-selected="true"]') ??
          value655?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ))
        : (document as Dynamic).getElementById(inspectorToggleId)
      )?.focus({
        preventScroll: true,
      });
    });
    return (): Dynamic => cancelAnimationFrame(value653);
  }, [value95]);
  let callback3: Dynamic = (input: Dynamic = value80.current): Dynamic =>
      input === "" || input === (value73.current.pages?.[0]?.id ?? "")
        ? {}
        : {
            page: input,
          },
    value98: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = (0,
          mergeMissingCanvasManifestMetadata)(
            input,
            options ?? value73.current,
          ),
          value654: Dynamic =
            options === undefined ? value72(value653) : value653;
        value70.current = value654;
        value73.current = value654;
        value68(value654);
        localDirtyEpochRef.current++;
        setLocalDirty(true);
        (0, getKvClient)()
          .set(
            (0, PlatformFileContentHandler_4)(
              canvasMetadataFile,
            ),
            (0, serializeCanvasMetadata)(value654),
          )
          .catch(
            (input2?: Dynamic): Dynamic =>
              showToast(
                uiMessage("canvas.designCanvas.couldnTSaveTheLayout") + String(input2),
                "error",
              ),
          );
      },
      [showToast, value72],
    ),
    [value99]: Dynamic = (0, reactChromeTheme.useState)(
      isSmallTouchDevice,
    ),
    [value100]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic =>
        value99 &&
        !flag &&
        (0, wasPhoneCanvasKilled)(
          (0, getPhoneCanvasStorage)(),
          (0, phoneCanvasStorageKey)(),
        ),
    ),
    [value101]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic =>
        value74 ??
        (0, initialFocusedArtboard)({
          manifest: value67,
          pageId: value79,
          entryFile: filePath,
          embedded: (0, embedMemoryPrefix)() !== "",
          laidOut: doc.content().files[canvasMetadataFile] != null,
          phoneCanvas: value99 && !flag,
          killedBefore: value100,
          migrated: flag,
          budget: 15e5,
        }),
    ),
    value102: Dynamic = (0, reactChromeTheme.useRef)(false),
    [value103, value104]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => {
        if (value101 != null) {
          let value654: Dynamic = value67.artboards.find(
            (input?: Dynamic): Dynamic => input.file === value101,
          );
          if (value654)
            return artboardFullscreenCamera(
              value654,
              artboardIsNotExpandedFill(value654),
              1200,
              800,
            );
        }
        let value653: Dynamic = (0, recallCanvasView)(value79);
        return value653
          ? ((value102.current = true), value653)
          : defaultCanvasCamera;
      },
    ),
    [value105]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic =>
        (0, createViewportStore)(
          value103,
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            options
              ? value104(input)
              : (0, reactChromeTheme.startTransition)(
                  (): Dynamic => value104(input),
                ),
        ),
    ),
    value106: Dynamic = (0, reactChromeTheme.useRef)(null);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic =>
        value106.current?.contains(event.target)
          ? value105.halt()
          : value105.settle(),
      callback16: Dynamic = (): Dynamic => value105.settle();
    (window as Dynamic).addEventListener("pointerdown", callback15, true);
    (window as Dynamic).addEventListener("keydown", callback16, true);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener(
        "pointerdown",
        callback15,
        true,
      );
      (window as Dynamic).removeEventListener("keydown", callback16, true);
    };
  }, [value105]);
  let value107: Dynamic = (0, reactChromeTheme.useRef)(null),
    value108: Dynamic = (0, reactChromeTheme.useRef)(null),
    value109: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic = value108.current?.() ?? null;
      value653 != null && value653.file == null;
      return value653;
    }, []),
    value110: Dynamic = (0, reactChromeTheme.useRef)(null),
    value111: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value110.current?.() ?? null,
      [],
    ),
    value112: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        items?: Dynamic,
        items2?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
      ): Dynamic =>
        items.length > 0
          ? value111()
          : (0, pointerCoordinates)(
              items2.length > 0 ? context : value653,
            ),
      [value111],
    ),
    value113: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let current4: Dynamic = selectionRef.current;
      if (
        current4.notes.size > 0 ||
        current4.elements.size > 0 ||
        current4.artboards.size !== 1
      )
        return null;
      let [artboards]: Dynamic = current4.artboards;
      return (
        value87.current.artboards.find(
          (input?: Dynamic): Dynamic =>
            input.file === artboards && !input.frameless,
        ) ?? null
      );
    }, []),
    [value114, value115]: Dynamic = (0, useToolbarOverlaySize)(),
    value116: Dynamic = (0, reactChromeTheme.useRef)(value114);
  value116.current = value114;
  let value117: Dynamic = (0, reactChromeTheme.useRef)(false),
    value118: Dynamic = (0, reactChromeTheme.useRef)(0);
  value114 > 0 && (value118.current = value114);
  let value119: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value106.current = input;
        value115(input);
      },
      [value115],
    ),
    value120: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => ({
        w: value106.current?.clientWidth ?? 1200,
        h: value106.current?.clientHeight ?? 800,
        top: value117.current ? 0 : value116.current || value118.current,
      }),
      [],
    ),
    [value121, value122]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => {
        if (value101 != null) return value101;
        if (value99 && !flag && editable) return null;
        let callback15: Dynamic = (input?: Dynamic): Dynamic =>
            (0, designPageId)(input, value67.pages) === value79,
          value653: Dynamic = value67.artboards.find(
            (input?: Dynamic): Dynamic => input.file === filePath,
          );
        return value653 && callback15(value653)
          ? filePath
          : (value67.artboards.find(
              (input?: Dynamic): Dynamic =>
                callback15(input) && !input.frameless,
            )?.file ?? null);
      },
    ),
    [value123, value124]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value125: Dynamic = (0, reactChromeTheme.useRef)(null);
  value125.current = value123;
  let value126: Dynamic = (0, reactChromeTheme.useRef)(null),
    value127: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    [value128, value129]: Dynamic = (0, reactChromeTheme.useState)(
      new Set(),
    ),
    [value130, value131]: Dynamic = (0, reactChromeTheme.useState)(0),
    value132: Dynamic = (0, reactChromeTheme.useRef)(null),
    value133: Dynamic = (0, reactChromeTheme.useRef)(false);
  value133.current = supportsLoadState && editing;
  let value134: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value73.current.artboards.some(
          (input2?: Dynamic): Dynamic =>
            input2.file === input && input2.frameless,
        ) && value127.current.set(input, Date.now());
        input === focusedFileRef.current &&
          ((value132.current = {
            file: input,
            at: Date.now(),
          }),
          value133.current &&
            (0, currentEditingArtboardPath)() !==
              (0, artboardStorePath)(input) &&
            value131((input2?: Dynamic): Dynamic => input2 + 1));
      },
      [],
    ),
    value135: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        input !== focusedFileRef.current ||
          (0, currentEditingArtboardPath)() !==
            (0, artboardStorePath)(input) ||
          (value132.current = {
            file: input,
            at: Date.now(),
          });
      },
      [],
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic,
      callback15: Dynamic = (): Dynamic => {
        let current4: Dynamic = value132.current,
          value654: Dynamic =
            current4 !== null && current4.file === value121
              ? SessionArtboardStateConstant -
                (Date.now() - current4.at)
              : 0,
          value655: Dynamic =
            supportsLoadState && editing && value121 !== null && value654 > 0;
        value655 || (value132.current = null);
        let value656: Dynamic = (0, setCurrentEditingArtboard)(
          value655 ? value121 : null,
        );
        value656 !== null && doc.releaseHold?.(value656);
        value655 &&
          (value653 = (window as Dynamic).setTimeout(callback15, value654));
      };
    callback15();
    return (): Dynamic => (window as Dynamic).clearTimeout(value653);
  }, [supportsLoadState, editing, value121, value130, doc]);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (): Dynamic => {
      let value653: Dynamic = (0, setCurrentEditingArtboard)(null);
      value653 !== null && doc.releaseHold?.(value653);
    },
    [doc],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = doc;
    (0, setArtboardWritableCheck)(
      value653.theirsOnItsWay
        ? (input?: Dynamic): Dynamic => value653.theirsOnItsWay(input)
        : value653.releaseHold
          ? uiMessage("canvas.designCanvas.cannotTell")
          : null,
    );
    return (): Dynamic => (0, setArtboardWritableCheck)(null);
  }, [doc]);
  let value136: Dynamic = (0, reactChromeTheme.useRef)(
    doc.content().files,
  );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      doc.subscribe((input?: Dynamic): Dynamic => {
        let files: Dynamic = doc.content().files,
          current4: Dynamic = value136.current;
        value136.current = files;
        if (current4 === files) return;
        let value653: Dynamic = Object.keys(files).filter(
          (input2?: Dynamic): Dynamic =>
            input2 !== canvasMetadataFile &&
            files[input2] !== current4[input2],
        );
        for (let value654 of Object.keys(current4) as Dynamic)
          value654 !== canvasMetadataFile &&
            !(value654 in files) &&
            value653.push(value654);
        if (value653.length !== 0) {
          if (input?.remote !== true) {
            let current5: Dynamic = focusedFileRef.current;
            current5 !== null &&
              value653.includes(current5) &&
              value134(current5);
            return;
          }
          (0, emitEditorEvent)("files-changed", {
            projectPath: "appifact",
            paths: value653,
          });
          (window as Dynamic).dispatchEvent(
            new CustomEvent(remoteFilesEventName, {
              detail: {
                paths: value653,
              },
            }),
          );
        }
      }),
    [doc, value134],
  );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (
      (0, setFilePublishHandler)((input?: Dynamic): Dynamic => {
        showToast(
          uiMessage("canvas.designCanvas.storedACompressedCopyOf") +
            (input === "unavailable"
              ? uiMessage("canvas.designCanvas.uploadsAreUnavailableHere")
              : input === "unsupported_type" || input === "too_large"
                ? uiMessage("canvas.designCanvas.thisFileTypeOrSize")
                : uiMessage("canvas.designCanvas.theUploadDidNotGo")) +
            ").",
        );
      }),
      (): Dynamic => (0, setFilePublishHandler)(null)
    ),
    [showToast],
  );
  let value137: Dynamic =
      selection.elements.size > 1 ||
      (selection.elements.size > 0 &&
        selection.artboards.size + selection.notes.size > 0),
    value138: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic =>
        [...selectionRef.current.elements].map(
          ([input, input2]: Dynamic): Dynamic => [
            input,
            {
              tids: [...input2.tids],
            },
          ],
        ),
      [],
    ),
    value139: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let items: Dynamic = [];
        try {
          for (let [value653, value654] of value138() as Dynamic) {
            let value655: Dynamic = value177.current
              .get(value653)
              ?.serializeSelection(value654.tids);
            value655 && items.push(value655);
          }
        } catch (value653: Dynamic) {
          throw (input?.drop(), value653);
        }
        return items.length === 0
          ? (input?.drop(), false)
          : (input
              ? input.write(
                  items.join(`
`),
                )
              : (0, setElementClipboard)(
                  items.join(`
`),
                  {
                    inTabOnly: true,
                  },
                ),
            true);
      },
      [value138],
    ),
    value140: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value141: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value142: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value143: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value144: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic =>
        new Promise((input2?: Dynamic): Dynamic => {
          let callback15: Dynamic = (): Dynamic => {
              clearTimeout(value653);
              value140.current.delete(input);
              input2();
            },
            value653: Dynamic = setTimeout(callback15, 3e3);
          value140.current.set(input, callback15);
        }),
      [],
    ),
    value145: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (deleteSelectedElements as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get applyCanvasSelection() { return applyCanvasSelection; }, get selectionRef() { return selectionRef; }, get value144() { return value144; }, get value155() { return value155; }, get value177() { return value177; }, get value218() { return value218; }, get value22() { return value22; }, get value432() { return value432; }, get value448() { return value448; }, get value459() { return value459; } }, ...args),
      [abandonSelectionGesture, applyCanvasSelection, value144],
    ),
    value146: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value145(DeletedValue),
      [value145],
    ),
    value147: Dynamic = (0, reactChromeTheme.useRef)(value145);
  value147.current = value145;
  let value148: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (duplicateSelectedElements as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get selectionRef() { return selectionRef; }, get value138() { return value138; }, get value144() { return value144; }, get value155() { return value155; }, get value177() { return value177; }, get value218() { return value218; }, get value22() { return value22; }, get value31() { return value31; }, get value323() { return value323; }, get value432() { return value432; }, get value448() { return value448; }, get value48() { return value48; } }, ...args),
      [value138, abandonSelectionGesture, value144],
    ),
    value149: Dynamic = (0, reactChromeTheme.useRef)(false),
    value150: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic =>
        value339.current === "vector"
          ? FinishEditingThisDrawingSPointsToMessage
          : (0, activeCropElement)() !== null ||
              (document as Dynamic).querySelector("[data-media-crop]") !==
                null
            ? GeometryFlipElementsLabel_6
            : undefined,
      [],
    ),
    value151: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (flipSelectedObjects as Dynamic)({ get applyCanvasSelection() { return applyCanvasSelection; }, get selectionRef() { return selectionRef; }, get value144() { return value144; }, get value149() { return value149; }, get value150() { return value150; }, get value155() { return value155; }, get value177() { return value177; }, get value19() { return value19; }, get value218() { return value218; }, get value224() { return value224; }, get value432() { return value432; }, get value448() { return value448; }, get value45() { return value45; }, get value46() { return value46; } }, ...args),
      [value144, applyCanvasSelection, value150],
    ),
    value152: Dynamic = (0, reactChromeTheme.useRef)(value151);
  value152.current = value151;
  let value153: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    callback4: Dynamic = (...args: Dynamic[]): Dynamic => (commitPieceDragOntoCanvas as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get callback2() { return callback2; }, get callback3() { return callback3; }, get doc() { return doc; }, get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get setShownFrameSelection() { return setShownFrameSelection; }, get supportsLoadState() { return supportsLoadState; }, get value127() { return value127; }, get value141() { return value141; }, get value142() { return value142; }, get value143() { return value143; }, get value144() { return value144; }, get value153() { return value153; }, get value177() { return value177; }, get value189() { return value189; }, get value19() { return value19; }, get value224() { return value224; }, get value396() { return value396; }, get value432() { return value432; }, get value448() { return value448; }, get value62() { return value62; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
    callback5: Dynamic = (...args: Dynamic[]): Dynamic => (commitElementMoveAcrossArtboards as Dynamic)({ get applyCanvasSelection() { return applyCanvasSelection; }, get callback2() { return callback2; }, get callback4() { return callback4; }, get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get setShownFrameSelection() { return setShownFrameSelection; }, get value142() { return value142; }, get value144() { return value144; }, get value153() { return value153; }, get value177() { return value177; }, get value19() { return value19; }, get value25() { return value25; }, get value432() { return value432; }, get value448() { return value448; } }, ...args),
    value154: Dynamic = (0, reactChromeTheme.useRef)(callback5);
  value154.current = callback5;
  let value155: Dynamic = (0, reactChromeTheme.useRef)(0),
    value156: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let flag2: Dynamic = true;
        value155.current++;
        let value653: Dynamic = (window as Dynamic).setTimeout(
            (): Dynamic => callback15(),
            input,
          ),
          callback15: Dynamic = (): Dynamic => {
            flag2 &&
              ((flag2 = false),
              (window as Dynamic).clearTimeout(value653),
              value155.current--);
          };
        return callback15;
      },
      [],
    ),
    value157: Dynamic = (0, reactChromeTheme.useCallback)(
      async (input?: Dynamic): Promise<Dynamic> => {
        let value653: Dynamic = value156(
          input.travel
            ? CanvasWorkingStateConstant_8
            : Math.max(
                0,
                CanvasWorkingStateLimit_5 -
                  (Date.now() - (input.releasedAt ?? Date.now())),
              ),
        );
        try {
          return await value154.current(input);
        } finally {
          value653();
        }
      },
      [value156],
    ),
    value158: Dynamic = (0, reactChromeTheme.useRef)(value148);
  value158.current = value148;
  let value159: Dynamic = (0, reactChromeTheme.useRef)(value137);
  value159.current = value137;
  let value160: Dynamic = (0, reactChromeTheme.useRef)(value139);
  value160.current = value139;
  let value161: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let activeElement: Dynamic = (document as Dynamic).activeElement;
        activeElement instanceof HTMLElement &&
          activeElement.tagName === "IFRAME" &&
          activeElement.blur();
        (window as Dynamic).focus();
        (0, announce)(input);
        value448.current?.(input);
      },
      [],
    ),
    value162: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (dispatchCanvasCommand as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get applyCanvasSelection() { return applyCanvasSelection; }, get count() { return count; }, get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get value106() { return value106; }, get value109() { return value109; }, get value137() { return value137; }, get value139() { return value139; }, get value145() { return value145; }, get value146() { return value146; }, get value148() { return value148; }, get value151() { return value151; }, get value155() { return value155; }, get value161() { return value161; }, get value188() { return value188; }, get value192() { return value192; }, get value218() { return value218; }, get value224() { return value224; }, get value29() { return value29; }, get value31() { return value31; }, get value430() { return value430; }, get value432() { return value432; }, get value448() { return value448; }, get value464() { return value464; }, get value470() { return value470; }, get value48() { return value48; }, get value51() { return value51; }, get value56() { return value56; }, get value61() { return value61; }, get value73() { return value73; } }, ...args),
      [
        value51,
        value137,
        value139,
        value146,
        value145,
        value148,
        value151,
        abandonSelectionGesture,
        value109,
        applyCanvasSelection,
        value161,
      ],
    ),
    value163: Dynamic = (0, reactChromeTheme.useRef)(value162);
  value163.current = value162;
  let value164: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
      ): Dynamic => value163.current(input, options, context, value653),
      [],
    ),
    value165: Dynamic = (0, reactChromeTheme.useRef)(null),
    value166: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value165.current?.booted(input);
        value25.current === input && (value25.current = null);
        frameSelectionSequencesRef.current.delete(input);
        value26.current?.file === input && (value26.current = null);
        value24.current?.frameRebooted(input) === "redriven" &&
          selectionRef.current.elements.has(input) &&
          (value23.current = true);
        setSelection(
          (input2?: Dynamic): Dynamic =>
            (0, filterSelectedElements)(
              input2,
              (input3?: Dynamic): Dynamic => input3 !== input,
            ),
        );
        value89.onArtboardReady(input);
      },
      [value89.onArtboardReady],
    ),
    value167: Dynamic = (0, reactChromeTheme.useRef)(new Set());
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let values: Dynamic = new Set();
    for (let [value653, value654] of selection.elements as Dynamic)
      value653 !== value121 &&
        (value177.current
          .get(value653)
          ?.setShownSelection(value654.tids, value19(value653)),
        values.add(value653));
    for (let value653 of value167.current as Dynamic)
      !values.has(value653) &&
        value653 !== value121 &&
        value177.current.get(value653)?.setShownSelection(null, null);
    value167.current = values;
  }, [selection, value121]);
  let value168: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        selection.artboards.size > 0
          ? selection.artboards
          : emptyCanvasFileSet,
      [selection],
    ),
    value169: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        selection.notes.size > 0
          ? selection.notes
          : emptyCanvasSelectionFiles,
      [selection],
    ),
    value170: Dynamic = (0, reactChromeTheme.useMemo)((): Dynamic => {
      if (selection.elements.size === 0) return emptyCanvasOptions;
      let state: Dynamic = {};
      for (let [value653, value654] of selection.elements as Dynamic)
        state[value653] = value654.tids;
      return state;
    }, [selection]),
    value171: Dynamic = (0, reactChromeTheme.useMemo)((): Dynamic => {
      if (selection.elements.size === 0) return;
      let state: Dynamic = {};
      for (let [value653, value654] of selection.elements as Dynamic)
        state[value653] = value654.rect;
      return state;
    }, [selection]),
    value172: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        selection.elements.size > 0
          ? new Set(selection.elements.keys())
          : emptyCanvasNoteSet,
      [selection],
    ),
    value173: Dynamic = (0, reactChromeTheme.useMemo)((): Dynamic => {
      if (value168.size !== 1 || value169.size > 0) return null;
      let value653: Dynamic = [...value168][0],
        value654: Dynamic = value67.artboards.find(
          (input?: Dynamic): Dynamic => input.file === value653,
        );
      return value654
        ? {
            file: value653,
            w: value654.w,
            h: value654.h,
            print: value654.print === "flow" ? "flow" : "fixed",
            ...((0, isFlowExport)(
              {
                expand: value654.expand,
              },
              value93,
            )
              ? {
                  fillPaginates: true,
                }
              : {}),
            paper: (0, getArtboardPaperSize)(value654),
            paperSet: value654.paper,
            guides: value654.guides ?? [],
            radius: value654.radius,
            ...(value654.frameless
              ? {
                  frameless: true,
                  label: value654.title,
                }
              : {}),
          }
        : null;
    }, [value168, value169, value67, value93]),
    [value174, value175]: Dynamic = (0, reactChromeTheme.useState)(0),
    value176: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value175(0),
      [],
    ),
    value177: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value178: Dynamic = (0, reactChromeTheme.useRef)(null),
    value179: Dynamic = (0, reactChromeTheme.useMemo)(
      createPeerSelectionStore,
      [],
    ),
    value180: Dynamic = (0, reactChromeTheme.useMemo)(
      createPageScrollStore,
      [],
    ),
    value181: Dynamic = (0, reactChromeTheme.useRef)(value103.scale);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let count4: Dynamic = 1,
      count5: Dynamic = 1,
      value653: Dynamic,
      callback15: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
        count4 = input;
        options === undefined && (count5 = input);
        for (let [value655, value656] of value177.current as Dynamic) {
          if (options !== undefined && value655 !== options) continue;
          let value657: Dynamic = (0, createPreviewHandle)(
            value656.webviewRef.current,
          );
          value657 && (0, setPickerHostScale)(value657, input);
        }
      },
      callback16: Dynamic = (): Dynamic => {
        let current4: Dynamic = focusedFileRef.current;
        return (
          current4 != null && selectionRef.current.elements.has(current4)
        );
      },
      callback17: Dynamic = (input?: Dynamic): Dynamic => {
        value181.current = input;
        Math.abs(input - count4) / count4 > 0.02 &&
          (value177.current.size <= 1 || callback16()) &&
          callback15(
            input,
            value177.current.size > 1 ? focusedFileRef.current : undefined,
          );
        clearTimeout(value653);
        value653 = setTimeout((): Dynamic => {
          let scale: Dynamic = value105.get().scale;
          (scale !== count5 || scale !== count4) && callback15(scale);
        }, 150);
      };
    callback17(value105.get().scale);
    let value654: Dynamic = value105.subscribe(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        input.scale !== options.scale && callback17(input.scale);
      },
    );
    return (): Dynamic => {
      value654();
      clearTimeout(value653);
    };
  }, [value105]);
  let [value182, value183]: Dynamic = (0, reactChromeTheme.useState)(
      0,
    ),
    value184: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let current4: Dynamic = value178.current;
        options == null
          ? (value177.current.delete(input),
            value165.current?.gone(input),
            context &&
              !current4?.keeper.holds(input) &&
              value432.current?.forget(input))
          : (value177.current.set(input, options),
            value165.current?.seen(input),
            value183((input2?: Dynamic): Dynamic => input2 + 1),
            current4?.keeper.holds(input) && current4.host.startLoad(input));
      },
      [],
    ),
    [value185, value186]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value187: Dynamic = (0, reactChromeTheme.useRef)(null),
    value188: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value186(input);
        (0, announce)(input);
        value187.current && clearTimeout(value187.current);
        value187.current = setTimeout((): Dynamic => value186(null), 6e3);
      },
      [],
    ),
    value189: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value186(null);
        value187.current && clearTimeout(value187.current);
        (0, announce)(input);
      },
      [],
    ),
    value190: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => null,
    ),
    value191: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value192: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    callback6: Dynamic = (): Dynamic => {
      let current4: Dynamic = focusedFileRef.current;
      return current4 === null
        ? null
        : (value177.current.get(current4)?.undoDepth() ?? null);
    };
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        typeof event.key != "string" ||
        event.key.toLowerCase() !== "z"
      )
        return;
      let current4: Dynamic = value4.current,
        value653: Dynamic = (0, handleInlineUndoKey)(event, {
          editing: value224.current,
          filesOpen: value285.current,
          textEditOpen: current4 !== null,
          pending: value5.current,
          targetOwnsKey: (): Dynamic =>
            (0, isCanvasTypingTarget)(event.target),
          stepMadeDuringEdit: (input?: Dynamic): Dynamic =>
            current4 !== null &&
            (0, canApplyTextEditHistory)(
              current4,
              input,
              callback6(),
              value430.current.reachable(input),
            ),
          canvasStepOnTop: (input?: Dynamic): Dynamic =>
            value430.current.reachable(input) !== null,
        });
      value653 !== "ignore" &&
        (event.preventDefault(),
        event.stopImmediatePropagation(),
        value653 === "undo"
          ? value447.current?.undo()
          : value653 === "redo" && value447.current?.redo());
    };
    (document as Dynamic).addEventListener("keydown", callback15, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", callback15, true);
  }, []);
  let value193: Dynamic = (0, reactChromeTheme.useRef)(null),
    [value194, value195]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value196: Dynamic = (0, reactChromeTheme.useRef)(null),
    value197: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
      ): Dynamic => ({
        key: input.key,
        x: options,
        y: context,
        label: input.label,
        alt: value653,
        box: input.box,
        ghost:
          value196.current?.key === input.key ? value196.current.ghost : null,
      }),
      [],
    ),
    value198: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (buildDragGhostPreview as Dynamic)({ get assets() { return assets; }, get doc() { return doc; }, get value177() { return value177; }, get value195() { return value195; }, get value196() { return value196; } }, ...args),
      [doc, assets],
    ),
    [value199, value200]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value201: Dynamic = (0, reactChromeTheme.useRef)(null),
    value202: Dynamic = (0, reactChromeTheme.useRef)(false),
    value203: Dynamic = (0, reactChromeTheme.useRef)(null),
    value204: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value203.current;
        if (!current4) return;
        let target: Dynamic = current4.target;
        if (target && target.file !== input) {
          let entry: Dynamic = value177.current.get(target.file);
          entry?.dropPlanClear(current4.token);
          current4.closing.set(
            target.file,
            target.opened
              .then((): Dynamic => entry?.moveHost(current4.token, "close"))
              .catch((): Dynamic => false),
          );
          current4.target = null;
        }
        current4.pending = null;
      },
      [],
    ),
    value205: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        if (value203.current?.gestureKey === input.key) return;
        value204();
        let state: Dynamic = {
          gestureKey: input.key,
          token: (0, randomSessionToken)(),
          html: null,
          member: null,
          laidOut: new Map(),
          closing: new Map(),
          target: null,
          inFlight: null,
          pending: null,
        };
        value203.current = state;
        let entry: Dynamic = value177.current.get(input.file);
        if (!entry || !input.box || input.tids.length !== 1) return;
        let box: Dynamic = input.box;
        entry
          .renderDefaults()
          .then((input2?: Dynamic): Dynamic => {
            if (value203.current !== state) return;
            let value653: Dynamic = entry.serializeSelection(input.tids, {
              bakeProps: true,
              vals: input2,
            });
            state.html = value653 || null;
            state.member =
              value653 &&
              (0, canFreezeSinglePaste)(
                false,
                input.tids,
                value653,
                false,
              )
                ? (0, pastedElementGeometry)(value653, box)
                : null;
          })
          .catch((): Dynamic => {});
      },
      [value204],
    ),
    value206: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (requestDropPlanPreview as Dynamic)({ get value177() { return value177; }, get value203() { return value203; }, get value206() { return value206; }, get value87() { return value87; } }, ...args),
      [],
    ),
    value207: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
      ): Dynamic => {
        let current4: Dynamic = value203.current;
        if (!current4 || current4.gestureKey !== input.key) return;
        let value654: Dynamic =
            value653 || input.tids.length !== 1 || value345.current
              ? null
              : [...value87.current.artboards]
                  .reverse()
                  .find(
                    (input2?: Dynamic): Dynamic =>
                      !(
                        input2.frameless && input2.file !== value125.current
                      ) &&
                      options >= input2.x &&
                      options <= input2.x + input2.w &&
                      context >= input2.y &&
                      context <= input2.y + input2.h,
                  ),
          value655: Dynamic =
            value654 &&
            value654.file !== input.file &&
            value654.file !== value271.current
              ? value654.file
              : null;
        current4.target && current4.target.file !== value655 && value204();
        if (!!value655) {
          if (!current4.target) {
            let entry: Dynamic = value177.current.get(value655);
            current4.target = {
              file: value655,
              opened: (current4.closing.get(value655) ?? Promise.resolve())
                .then(
                  (): Dynamic =>
                    entry?.moveHost(current4.token, "open") ?? false,
                )
                .catch((): Dynamic => false),
            };
          }
          value206(
            current4,
            current4.target,
            options,
            context,
            input.ctrl ? "keep" : "flow",
          );
        }
      },
      [value204, value206],
    ),
    value208: Dynamic = (0, reactChromeTheme.useCallback)(
      (input: Dynamic = false): Dynamic => {
        value193.current = null;
        value201.current && clearTimeout(value201.current);
        value195(null);
        value200(value216.current?.file ?? null);
        input || (value204(), (value203.current = null));
      },
      [value204],
    ),
    value209: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      value216.current = null;
      value193.current ||
        (value201.current && clearTimeout(value201.current),
        value200(null),
        (value196.current = null),
        (value203.current = null));
    }, []),
    value210: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic = value193.current ?? value216.current;
      value653 &&
        value177.current.get(value653.file)?.hostDrag("cancel", value653.key);
      value216.current = null;
      value208();
    }, [value208]);
  value20.current = value208;
  let callback7: Dynamic = (...args: Dynamic[]): Dynamic => (annotationToElementHtml as Dynamic)({  }, ...args),
    value211: Dynamic = (0, reactChromeTheme.useCallback)(
      async (input?: Dynamic): Promise<Dynamic> => {
        if ("note" in input) {
          let value653: Dynamic = (value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input.note,
          );
          return value653 ? callback7(value653) : null;
        }
        let entry: Dynamic = value177.current.get(input.file);
        return entry &&
          value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input.file,
          )?.frameless
          ? entry.pieceContent()
          : null;
      },
      [],
    ),
    value212: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (trackObjectHoverOverArtboard as Dynamic)({ get value177() { return value177; }, get value202() { return value202; }, get value203() { return value203; }, get value204() { return value204; }, get value206() { return value206; }, get value211() { return value211; }, get value271() { return value271; }, get value345() { return value345; } }, ...args),
      [value204, value206, value211],
    ),
    value213: Dynamic = (0, reactChromeTheme.useCallback)(
      async (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
      ): Promise<Dynamic> => {
        let current4: Dynamic = value432.current;
        (await new Promise((input2?: Dynamic): Dynamic => {
          let flag2: Dynamic = false,
            callback15: Dynamic = (input3?: Dynamic): Dynamic => {
              flag2 || ((flag2 = true), input2(input3));
            };
          if (!current4 || current4.headBound("undo") !== options)
            return callback15(false);
          runWhenConditionReady(
            (): Dynamic => flag2 || !current4.busy(),
            (): Dynamic => {
              if (flag2 || current4.headBound("undo") !== options)
                return callback15(false);
              let value653: Dynamic = current4.undo();
              value653 === "applied" && current4.clearRedo();
              callback15(value653 === "applied");
            },
          );
          setTimeout((): Dynamic => callback15(false), 3500);
        })) ||
          value448.current(
            uiMessage("canvas.designCanvas.couldnTUndoTheMove") +
              callback2(input) +
              ". The " +
              context +
              " may now be in both places.",
          );
      },
      [],
    ),
    value214: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (dropCanvasObjectIntoArtboard as Dynamic)({ get callback2() { return callback2; }, get callback7() { return callback7; }, get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get setShownFrameSelection() { return setShownFrameSelection; }, get showToast() { return showToast; }, get value144() { return value144; }, get value155() { return value155; }, get value157() { return value157; }, get value177() { return value177; }, get value188() { return value188; }, get value189() { return value189; }, get value19() { return value19; }, get value202() { return value202; }, get value203() { return value203; }, get value204() { return value204; }, get value213() { return value213; }, get value271() { return value271; }, get value276() { return value276; }, get value345() { return value345; }, get value432() { return value432; }, get value459() { return value459; }, get value73() { return value73; }, get value87() { return value87; } }, ...args),
      [
        value188,
        showToast,
        value189,
        value157,
        value213,
        value204,
        setShownFrameSelection,
      ],
    ),
    value215: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (dropElementDragAtCanvasPoint as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get callback2() { return callback2; }, get callback3() { return callback3; }, get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get value125() { return value125; }, get value127() { return value127; }, get value155() { return value155; }, get value156() { return value156; }, get value157() { return value157; }, get value177() { return value177; }, get value188() { return value188; }, get value189() { return value189; }, get value19() { return value19; }, get value202() { return value202; }, get value203() { return value203; }, get value271() { return value271; }, get value276() { return value276; }, get value345() { return value345; }, get value396() { return value396; }, get value432() { return value432; }, get value62() { return value62; }, get value73() { return value73; }, get value87() { return value87; }, get value98() { return value98; } }, ...args),
      [
        value67,
        doc,
        value98,
        value62,
        showToast,
        value189,
        abandonSelectionGesture,
        value157,
        value156,
      ],
    ),
    value216: Dynamic = (0, reactChromeTheme.useRef)(null),
    value217: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let entry: Dynamic = selectionRef.current.elements.get(input);
        if (!entry) return null;
        let values: Dynamic = new Set(entry.tids),
          value653: Dynamic = options.filter(
            (input2?: Dynamic): Dynamic => values.has(input2),
          );
        if (value653.length === 0) return null;
        let value654: Dynamic =
            value177.current.get(input)?.describeTids(value653) ?? [],
          value655: Dynamic =
            value654.length === 1
              ? value654[0].kind === "other"
                ? "element"
                : value654[0].kind
              : value654.length + " elements";
        return {
          tids: value653,
          label: value655,
        };
      },
      [],
    ),
    value218: Dynamic = (0, reactChromeTheme.useRef)(false),
    value219: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value218.current = input;
      },
      [],
    ),
    [value220, value221]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value222: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (handleFrameElementDragEvent as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get value177() { return value177; }, get value188() { return value188; }, get value193() { return value193; }, get value195() { return value195; }, get value197() { return value197; }, get value198() { return value198; }, get value200() { return value200; }, get value201() { return value201; }, get value205() { return value205; }, get value207() { return value207; }, get value208() { return value208; }, get value209() { return value209; }, get value210() { return value210; }, get value215() { return value215; }, get value216() { return value216; }, get value217() { return value217; }, get value218() { return value218; }, get value67() { return value67; } }, ...args),
      [
        value67,
        value208,
        value209,
        value210,
        value215,
        value217,
        value198,
        value205,
        value207,
        value197,
        value188,
      ],
    ),
    value223: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (handleHostElementDragEvent as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get value177() { return value177; }, get value188() { return value188; }, get value193() { return value193; }, get value195() { return value195; }, get value197() { return value197; }, get value201() { return value201; }, get value207() { return value207; }, get value208() { return value208; }, get value209() { return value209; }, get value210() { return value210; }, get value215() { return value215; }, get value216() { return value216; } }, ...args),
      [value208, value209, value210, value215, value197, value207, value188],
    ),
    value224: Dynamic = (0, reactChromeTheme.useRef)(editing);
  value224.current = editing;
  let value225: Dynamic = (0, reactChromeTheme.useRef)(readOnly);
  value225.current = readOnly;
  let value226: Dynamic = (0, reactChromeTheme.useRef)({
    dx: 0,
    dy: 0,
    dz: 0,
    px: 0,
    py: 0,
    pinch: false,
    zoomMsgs: 0,
    raf: 0,
    winStart: 0,
    winPan: 0,
    winZoom: 0,
  });
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (): Dynamic => {
      value226.current.raf && cancelAnimationFrame(value226.current.raf);
    },
    [],
  );
  let value227: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (applyPanZoomGesture as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get value105() { return value105; }, get value106() { return value106; }, get value224() { return value224; }, get value226() { return value226; }, get value271() { return value271; }, get value345() { return value345; }, get value67() { return value67; } }, ...args),
      [value67, value105],
    ),
    value228: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = !options?.live,
          items: Dynamic = [...value138()],
          values: Dynamic = new Set(),
          value654: Dynamic = items.map(
            ([input2, input3]: Dynamic): Dynamic => {
              let entry: Dynamic = value177.current.get(input2),
                value657: Dynamic = entry
                  ? entry.describeTids(input3.tids)
                  : [];
              for (let value658 of value657 as Dynamic)
                values.add(value658.kind);
              return {
                h: entry,
                desc: value657,
              };
            },
          ),
          value655: Dynamic = values.size > 1,
          current4: Dynamic = value245.current,
          value656: Dynamic = value654.map(
            ({ h: h, desc: desc }: Dynamic): Dynamic =>
              h
                ? h.setStylePropsPerTid(
                    (0, routeStyleEditsByElementKind)(
                      input,
                      desc,
                      value655,
                    ),
                    {
                      undo: value653,
                    },
                  )
                : Promise.resolve(false),
          );
        return Promise.all(value656).then((input2?: Dynamic): Dynamic => {
          let value657: Dynamic = input2.some(Boolean);
          if (value657 && value653) {
            let value658: Dynamic = input.map(
              ([input3, input4]: Dynamic): Dynamic => ({
                prop: input3,
                value: input4 ?? null,
              }),
            );
            (0, announce)(
              (0, addContrastToAnnouncement)(
                (0, propertyEditAnnouncement)(value658),
                value658,
                current4?.check,
                current4?.resolve,
              ),
            );
          }
          return value657;
        });
      },
      [value138],
    ),
    value229: Dynamic = (0, reactChromeTheme.useRef)(null),
    value230: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        if (input === "start") {
          let value653: Dynamic = value138().map(
            ([input2]: Dynamic): Dynamic => input2,
          );
          value229.current = value653;
          for (let value654 of value653 as Dynamic)
            value177.current.get(value654)?.beginStyleGesture();
        } else {
          let value653: Dynamic = value229.current ?? [];
          value229.current = null;
          for (let value654 of value653 as Dynamic)
            value177.current.get(value654)?.endStyleGesture();
        }
      },
      [value138],
    ),
    value231: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = focusedFileRef.current;
        current4 && value177.current.get(current4)?.formatCommand(input);
      },
      [],
    ),
    [value232, value233]: Dynamic = (0, reactChromeTheme.useState)(0),
    value234: Dynamic = (0, reactChromeTheme.useRef)(new Set()),
    [value235, value236]: Dynamic = (0, reactChromeTheme.useState)(0),
    [value237, value238]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value121,
      value654: Dynamic =
        value653 == null ? undefined : value177.current.get(value653);
    if (!value654) {
      value238(false);
      return;
    }
    let flag2: Dynamic = false;
    value654.stageIsEmpty().then((input?: Dynamic): Dynamic => {
      flag2 || value238(input);
    });
    return (): Dynamic => {
      flag2 = true;
    };
  }, [value121, value232, value235, value182]);
  let value239: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value234.current.add(input);
        value236((input2?: Dynamic): Dynamic => input2 + 1);
      },
      [],
    ),
    value240: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        value239(input);
        value22.current.set(input, (value22.current.get(input) ?? 0) + 1);
        let current4: Dynamic = selectionRef.current,
          { next: value653, tell: value654 }: Dynamic = (0,
          reconcileSelectedElementIds)(
            current4,
            input,
            options,
            focusedFileRef.current,
          );
        selectionRef.current = value653;
        value653 !== current4 &&
          (setSelection(value653),
          input === focusedFileRef.current &&
            !value653.elements.has(input) &&
            value24.current?.noteSelection(input, null));
        value654 != null &&
          context?.(
            value654,
            (input2?: Dynamic): Dynamic =>
              (window as Dynamic).setTimeout((): Dynamic => {
                selectionRef.current.elements.get(input)?.tids === value654 &&
                  input2() &&
                  applyCanvasSelection(selectionRef.current, {
                    repush: [input],
                  });
              }, 60),
          );
      },
      [value239, applyCanvasSelection],
    ),
    value241: Dynamic = (0, useDesignSystems)(),
    value242: Dynamic = (0, reactChromeTheme.useRef)([]),
    value243: Dynamic = (0, useElementSessionState)(
      selection.primary ?? null,
    ),
    value244: Dynamic = (0, reactChromeTheme.useMemo)((...args: Dynamic[]): Dynamic => (deriveSelectionInspectorProbe as Dynamic)({ get selection() { return selection; }, get value177() { return value177; }, get value19() { return value19; }, get value232() { return value232; }, get value242() { return value242; } }, ...args), [selection, value232, value241]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value244?.seed;
    value653 &&
      (0, updateTypographyCensus)({
        sizes: value653.sizes,
        sizeRoles: value653.sizeRoles ?? {},
        sizeFamilies: value653.sizeFamilies ?? {},
      });
  }, [value244]);
  let value245: Dynamic = (0, reactChromeTheme.useRef)(undefined),
    [value246, value247]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value248: Dynamic = (0, reactChromeTheme.useRef)(null),
    value249: Dynamic = value244?.probeEl?.file ?? null,
    value250: Dynamic =
      value244 &&
      [...selection.elements.values()].reduce(
        (input?: Dynamic, options?: Dynamic): Dynamic =>
          input + options.count,
        0,
      ) === 1
        ? (value244.probeEl?.tid ?? null)
        : null;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (value249 !== null) {
      (0, updateElementSessionState)(value249, {
        selected: value250,
      });
      return (): Dynamic =>
        (0, updateElementSessionState)(value249, {
          selected: null,
        });
    }
  }, [value249, value250]);
  let [value251, value252]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    [value253, value254]: Dynamic = (0, reactChromeTheme.useState)(0);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value244?.probeEl;
    if (!value653) return;
    let { file: value654, tid: value655, kind: value656 }: Dynamic = value653,
      entry: Dynamic = value177.current.get(value654),
      value657: Dynamic = entry
        ? (0, createPreviewHandle)(entry.webviewRef.current)
        : null;
    if (!value657) return;
    let value658: Dynamic = value654 + ":" + String(value655),
      value659: Dynamic = value248.current === value658;
    value248.current = value658;
    let flag2: Dynamic = true,
      value660: Dynamic = value656 === "text";
    (0, inspectPickerSelection)(
      value657,
      value655,
      value19(value654),
      InspectorComputedDataItems,
      {
        afterPaint: value659,
        srgb: true,
        ground: value660,
      },
    ).then((input?: Dynamic): Dynamic => {
      flag2 &&
        value247({
          key: value658,
          ...(0, normalizeInspectorComputedData)(value656, input, {
            ground: value660,
          }),
        });
    });
    return (): Dynamic => {
      flag2 = false;
    };
  }, [value244]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value244?.probeEl;
    if (!value653 || value653.kind !== "text") return;
    let entry: Dynamic = value177.current.get(value653.file),
      value654: Dynamic = entry
        ? (0, createPreviewHandle)(entry.webviewRef.current)
        : null;
    if (!value654) return;
    let value655: Dynamic = value653.file + ":" + String(value653.tid),
      flag2: Dynamic = true;
    (0, getPickerFontFaces)(value654).then(
      (input?: Dynamic): Dynamic => {
        if (!flag2 || !input) return;
        let value656: Dynamic =
          value655 +
          `
` +
          input.map(
            (input2?: Dynamic): Dynamic =>
              input2.family + "|" + input2.weight + "|" + input2.style,
          ).join(`
`);
        value252(
          (input2?: Dynamic): Dynamic =>
            input2 !== null && input2.sig === value656
              ? input2
              : {
                  key: value655,
                  sig: value656,
                  faces: input,
                },
        );
      },
    );
    return (): Dynamic => {
      flag2 = false;
    };
  }, [value244, value253]);
  let value255: Dynamic =
      value244?.probeEl &&
      value246?.key ===
        value244.probeEl.file + ":" + String(value244.probeEl.tid)
        ? value246
        : null,
    value256: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => [
        ...new Set(
          value241.flatMap(
            (input?: Dynamic): Dynamic =>
              input.colors.map(
                (input2?: Dynamic): Dynamic => "--" + input2.name,
              ),
          ),
        ),
      ],
      [value241],
    ),
    [value257, value258]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => new Map(),
    ),
    value259: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value258((input2?: Dynamic): Dynamic => {
          if (input2.get(input) === options) return input2;
          let entries: Dynamic = new Map(input2);
          options === undefined
            ? entries.delete(input)
            : entries.set(input, options);
          return entries;
        });
      },
      [],
    ),
    [value260, value261]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => new Map(),
    ),
    value262: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        value261(
          (input2?: Dynamic): Dynamic =>
            (0, updateArtboardErrorMap)(input2, input, options),
        ),
      [],
    ),
    [value263, value264]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value265: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value264(true),
      [],
    ),
    value266: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        value86.artboards.flatMap((input?: Dynamic): Dynamic => {
          let entry: Dynamic = value260.get(input.file);
          return entry
            ? [
                {
                  file: input.file,
                  path: input.file,
                  title: input.title ?? input.file.replace(/\.dc\.html$/, ""),
                  messages: entry,
                },
              ]
            : [];
        }),
      [value86, value260],
    ),
    value267: Dynamic = value266.length > 0;
  (0, useArtboardErrorReporting)(value267);
  let value268: Dynamic = (0, useArtboardErrorNotices)(
    value260,
    value266,
    {
      canvasTitle: (document as Dynamic).title,
      canAsk: editable && (0, embedMemoryPrefix)() === "",
      large: value99,
      onShowAll: value265,
    },
  );
  !value267 && value263 && value264(false);
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    focusedFileRef.current = value121;
    value25.current = null;
    value26.current = null;
    value27.current = null;
    let current4: Dynamic = value216.current;
    current4 &&
      current4.file !== value121 &&
      (value177.current.get(current4.file)?.hostDrag("cancel", current4.key),
      (value216.current = null),
      value193.current || value200(null));
    value193.current &&
      value193.current.file !== value121 &&
      value20.current?.();
  }, [value121]);
  let [value269, value270]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value271: Dynamic = (0, reactChromeTheme.useRef)(null);
  value271.current = value269;
  let value272: Dynamic = (0, reactChromeTheme.useRef)(0),
    value273: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        (input === value271.current ||
          (value99 && !flag && !value345.current)) &&
          value270(null);
        value124(
          (input2?: Dynamic): Dynamic => (input2 === input ? input2 : null),
        );
        if (input === value121) return Promise.resolve(true);
        let current4: Dynamic = value272.current;
        return (async (): Promise<Dynamic> => (
          await value.current?.("preview"),
          current4 !== value272.current ? false : (value122(input), true)
        ))();
      },
      [value121],
    ),
    value274: Dynamic = (0, reactChromeTheme.useRef)(value273);
  value274.current = value273;
  let value275: Dynamic = (0, reactChromeTheme.useCallback)(
    (input?: Dynamic): Dynamic => {
      (async (): Promise<Dynamic> => {
        try {
          await value.current?.("preview");
        } catch {}
        input();
      })();
    },
    [],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value121 != null &&
      value73.current.artboards.some(
        (input?: Dynamic): Dynamic =>
          input.file === value121 && !input.frameless,
      ) &&
      (value126.current = value121);
  }, [value121]);
  let value276: Dynamic = (0, reactChromeTheme.useRef)(null),
    value277: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let current4: Dynamic = value125.current;
      if (current4 == null) return;
      value124(null);
      let current5: Dynamic = value126.current,
        current6: Dynamic = value276.current;
      if (
        current5 == null ||
        current5 === current4 ||
        !value87.current.artboards.some(
          (input?: Dynamic): Dynamic => input.file === current5,
        )
      )
        return;
      let entry: Dynamic = value153.current.get(current5);
      (current6 &&
        current6.file === current5 &&
        Date.now() - current6.at < 5e3) ||
      (entry != null && Date.now() - entry < 5e3) ||
      current5 === value271.current
        ? value122(null)
        : value274.current(current5);
    }, []),
    value278: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      abandonSelectionGesture();
      value277();
      value62();
      setSelection(emptyCanvasSelection);
    }, [abandonSelectionGesture, value277, value62]),
    value279: Dynamic = (0, reactChromeTheme.useRef)(value277);
  value279.current = value277;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value123 != null &&
      !value86.artboards.some(
        (input?: Dynamic): Dynamic => input.file === value123,
      ) &&
      value124(null);
  }, [value123, value86]);
  let [value280, value281]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value282: Dynamic = null,
    [value283, value284]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value285: Dynamic = (0, reactChromeTheme.useRef)(false);
  value285.current = value283;
  (0, reactChromeTheme.useLayoutEffect)(
    (): Dynamic => (): Dynamic => {},
    [value283],
  );
  let value286: Dynamic = (0, reactChromeTheme.useRef)(null),
    value287: Dynamic = (0, reactChromeTheme.useRef)(undefined),
    value288: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value286.current = input;
        let current4: Dynamic = value287.current;
        typeof current4 == "function"
          ? current4(input)
          : current4 && (current4.current = input);
      },
      [],
    ),
    [value289, value290]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value291: Dynamic = (0, reactChromeTheme.useRef)(false),
    value292: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => false,
    ),
    value293: Dynamic = (0, reactChromeTheme.useRef)(null),
    value294: Dynamic = (0, reactChromeTheme.useRef)(false),
    value295: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value296: Dynamic = (0, reactChromeTheme.useRef)(0),
    value297: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value298: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        if (input === value80.current) return;
        abandonSelectionGesture();
        value124(null);
        value551.current = 0;
        value272.current++;
        let current4: Dynamic = value73.current,
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            (0, designPageId)(input2, current4.pages) === input,
          value653: Dynamic = current4.artboards.find(
            (input2?: Dynamic): Dynamic =>
              callback15(input2) && !input2.frameless,
          ),
          value654: Dynamic = value345.current
            ? ((options === undefined
                ? undefined
                : current4.artboards.find(
                    (input2?: Dynamic): Dynamic =>
                      input2.file === options && callback15(input2),
                  )) ?? (0, defaultPageArtboard)(current4, input))
            : undefined;
        value345.current &&
          (value654
            ? value348({
                file: value654.file,
                prev:
                  (0, recallCanvasView)(input) ?? defaultCanvasCamera,
                fit: artboardIsNotExpandedFill(value654),
              })
            : value297.current());
        value62();
        setSelection(emptyCanvasSelection);
        value270(null);
        value76(input);
        value122(
          options ??
            (value99 && editableRef.current && !value345.current
              ? null
              : ((value654 ?? value653)?.file ?? null)),
        );
        value291.current = !(value345.current && value654);
      },
      [value62, abandonSelectionGesture],
    ),
    value299: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {}, [
      value62,
      abandonSelectionGesture,
    ]),
    value300: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      abandonSelectionGesture();
      value62();
      setSelection(emptyCanvasSelection);
      value124(null);
      value275((): Dynamic => value284(true));
    }, [value275, value62, abandonSelectionGesture]),
    value301: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      value284(false);
      requestAnimationFrame((): Dynamic => {
        ((document as Dynamic).activeElement === (document as Dynamic).body ||
          (document as Dynamic).activeElement === null) &&
          value286.current?.focus({
            preventScroll: true,
          });
      });
    }, []),
    value302: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value301();
        let current4: Dynamic = value73.current,
          value653: Dynamic = current4.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        if (!value653) return;
        let value654: Dynamic = (0, designPageId)(
          value653,
          current4.pages,
        );
        value654 !== value80.current
          ? value275((): Dynamic => value298(value654, value653.file))
          : value299();
      },
      [value275, value298, value299, value301],
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!value283) return;
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      event.key !== "Escape" ||
        event.defaultPrevented ||
        (0, hasBlockingEditorOverlay)() ||
        (event.preventDefault(), value301());
    };
    (window as Dynamic).addEventListener("keydown", callback15);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", callback15);
  }, [value283, value301]);
  let value303: Dynamic = (0, reactChromeTheme.useRef)(false),
    value304: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => "",
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value303.current &&
      ((value303.current = false),
      value304.current(undefined, undefined, {
        auto: true,
      }));
    if (!value291.current) return;
    value291.current = false;
    let value653: Dynamic = (window as Dynamic).setTimeout(
      (): Dynamic => value292.current(),
      120,
    );
    return (): Dynamic => (window as Dynamic).clearTimeout(value653);
  }, [value79]);
  let value305: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let current4: Dynamic = value73.current,
        value653: Dynamic =
          current4.pages !== undefined && current4.pages.length > 0,
        value654: Dynamic = value653
          ? [...current4.pages]
          : [defaultCanvasPage];
      if (value654.length >= PlatformFileContentLimit_3) {
        showToast(
          uiMessage("canvas.designCanvas.thisCanvasIsAtIts") +
            String(PlatformFileContentLimit_3) +
            ").",
        );
        return;
      }
      let state: Dynamic = {
        id: (0, createPageId)(value654, supportsLoadState),
        name: (0, nextCanvasPageName)(value654),
      };
      value396.current(
        {
          kind: "page-add",
          page: state,
          ...(value653
            ? {}
            : {
                first: value654[0],
              }),
        },
        new Set(),
      );
      value98({
        ...current4,
        pages: [...value654, state],
      });
      value303.current = true;
      value298(state.id);
    }, [value98, value298, showToast]),
    value306: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (promptRenamePage as Dynamic)({ get value286() { return value286; }, get value396() { return value396; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98],
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value121 != null &&
      !value67.artboards.some(
        (input?: Dynamic): Dynamic => input.file === value121,
      ) &&
      value122(
        value99 && !flag && editableRef.current && !value345.current
          ? null
          : (value87.current.artboards.find(
              (input?: Dynamic): Dynamic => !input.frameless,
            )?.file ?? null),
      );
    for (let value653 of [value127, value584, value585] as Dynamic)
      for (let value654 of [...value653.current.keys()] as Dynamic)
        value67.artboards.some(
          (input?: Dynamic): Dynamic => input.file === value654,
        ) || value653.current.delete(value654);
    value129(
      (input?: Dynamic): Dynamic =>
        [...input].every(
          (input2?: Dynamic): Dynamic =>
            value67.artboards.some(
              (input3?: Dynamic): Dynamic => input3.file === input2,
            ),
        )
          ? input
          : new Set(
              [...input].filter(
                (input2?: Dynamic): Dynamic =>
                  value67.artboards.some(
                    (input3?: Dynamic): Dynamic => input3.file === input2,
                  ),
              ),
            ),
    );
    setSelection(
      (input?: Dynamic): Dynamic =>
        (0, filterSelectedAnnotations)(
          (0, filterSelectedArtboards)(
            input,
            (input2?: Dynamic): Dynamic =>
              value67.artboards.some(
                (input3?: Dynamic): Dynamic => input3.file === input2,
              ),
          ),
          (input2?: Dynamic): Dynamic =>
            (value67.annotations ?? []).some(
              (input3?: Dynamic): Dynamic => input3.id === input2,
            ),
        ),
    );
  }, [value67, value121]);
  let [value307, value308]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value309: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value308(null),
      [],
    ),
    value310: Dynamic = (0, reactChromeTheme.useRef)(false),
    [value311, value312]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    callback8: Dynamic = (): Dynamic => {
      value99 && !flag && value312(true);
    },
    value313: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (addBlankArtboard as Dynamic)({ get callback3() { return callback3; }, get doc() { return doc; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get value189() { return value189; }, get value273() { return value273; }, get value310() { return value310; }, get value338() { return value338; }, get value341() { return value341; }, get value396() { return value396; }, get value73() { return value73; }, get value90() { return value90; }, get value98() { return value98; } }, ...args),
      [doc, value98, value273, showToast, value189],
    );
  value304.current = value313;
  let value314: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        abandonSelectionGesture();
        value279.current();
        let value653: Dynamic =
            options === "toggle"
              ? (0, toggleCanvasSelection)(
                  selectionRef.current,
                  input,
                )
              : (0, selectionFromBoards)(input),
          current4: Dynamic = focusedFileRef.current;
        current4 != null &&
          selectionRef.current.elements.has(current4) &&
          !value653.elements.has(current4) &&
          value62();
        selectionRef.current = value653;
        setSelection(value653);
      },
      [value62, abandonSelectionGesture],
    ),
    value315: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options: Dynamic = {}): Dynamic => {
        let value653: Dynamic = value73.current.annotations ?? [];
        if (value653.length >= PlatformFileContentLimit_5) {
          value188(
            uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
              String(PlatformFileContentLimit_5) +
              ").",
          );
          options.quiet ||
            (value338("select"),
            value341((input2?: Dynamic): Dynamic => input2 + 1));
          options.bound !== undefined &&
            value140.current.get(options.bound)?.();
          return null;
        }
        let state: Dynamic = {
          ...input,
          id: (0, createAnnotationId)(
            value653,
            supportsLoadState,
            (0, annotationKindCategory)(input),
          ),
        };
        value396.current(
          {
            kind: "ann-add",
            spec: state,
          },
          new Set(),
          undefined,
          options.bound,
        );
        value98({
          ...value73.current,
          annotations: [...value653, state],
        });
        options.quiet ||
          (abandonSelectionGesture(),
          value62(),
          setSelection(
            options.keepTool
              ? emptyCanvasSelection
              : (0, selectionFromBoards)(
                  (0, boardSelectionItems)({
                    note: state.id,
                  }),
                ),
          ),
          options.keepTool ||
            (value338("select"),
            value341((input2?: Dynamic): Dynamic => input2 + 1)));
        return state.id;
      },
      [value98, value62, value188, abandonSelectionGesture],
    ),
    value316: Dynamic = (0, reactChromeTheme.useRef)(value315);
  value316.current = value315;
  let value317: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value315({
          x: Math.round(input),
          y: Math.round(options),
          w: PlatformFileContentConstant_8,
          text: "",
          ...callback3(),
        });
      },
      [value315],
    ),
    value318: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra: Dynamic = false,
      ): Dynamic => {
        let value654: Dynamic =
            extra && value653 !== undefined ? value653 : undefined,
          value655: Dynamic = (value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (!value655) {
          value654 !== undefined &&
            value142.current.set(value654, {
              files: new Set(),
              notes: new Set(),
            });
          value653 !== undefined && value140.current.get(value653)?.();
          return false;
        }
        let { id: value656, ...value657 }: Dynamic = value655,
          [items, items2]: Dynamic = [
            Math.round(options),
            Math.round(context),
          ],
          value658: Dynamic =
            value657.kind === "line" || value657.kind === "arrow"
              ? value315(
                  {
                    ...value657,
                    x: items,
                    y: items2,
                    x2: value657.x2 + items - value657.x,
                    y2: value657.y2 + items2 - value657.y,
                  },
                  {
                    bound: value653,
                    quiet: value654 !== undefined,
                  },
                )
              : value315(
                  {
                    ...value657,
                    x: items,
                    y: items2,
                  },
                  {
                    bound: value653,
                    quiet: value654 !== undefined,
                  },
                );
        value654 !== undefined &&
          value142.current.set(value654, {
            files: new Set(),
            notes: new Set(value658 !== null ? [value658] : []),
          });
        return value658 !== null;
      },
      [value315],
    ),
    value319: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        value338("select");
        value341((input2?: Dynamic): Dynamic => input2 + 1);
        let value653: Dynamic = callback3();
        if (input === "text") {
          value315({
            kind: "title1",
            size: PlatformFileContentSMLConfig.m,
            bold: false,
            x: options.x,
            y: options.y,
            w: PlatformFileContentConstant_8,
            text: "",
            ...value653,
          });
          return;
        }
        if (input === "rect" || input === "oval") {
          let value654: Dynamic = options.w > 0 || options.h > 0,
            [value655, value656]: Dynamic = value654
              ? [options.w, options.h]
              : PlatformFileContentRectOvalLineConfig[input],
            callback15: Dynamic = (input2?: Dynamic): Dynamic =>
              Math.min(
                PlatformFileContentLimit_6,
                Math.max(PlatformFileContentConstant_19, input2),
              );
          value315({
            kind: input,
            x: options.x,
            y: options.y,
            w: callback15(value655),
            h: callback15(value656),
            ...value653,
          });
          return;
        }
        value315({
          kind: input,
          ...(0, annotationLineEndpoints)(input, options, context),
          ...value653,
        });
      },
      [value315],
    ),
    value320: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value315(
          {
            kind: "pen",
            ...input,
            ...callback3(),
          },
          {
            keepTool: true,
          },
        );
      },
      [value315],
    ),
    value321: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value73.current.annotations ?? [],
          value654: Dynamic = value653.findIndex(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (value654 < 0) return false;
        value396.current(
          {
            kind: "ann-delete",
            spec: value653[value654],
            index: value654,
          },
          new Set(),
          undefined,
          options,
        );
        value98({
          ...value73.current,
          annotations: value653.filter(
            (input2?: Dynamic): Dynamic => input2.id !== input,
          ),
        });
        let value655: Dynamic = value653[value654];
        (0, announce)(
          value655.kind === "image"
            ? value655.video !== undefined
              ? AccessibilityAnnouncementsLabel_21
              : AccessibilityAnnouncementsLabel_20
            : (0, isShapeAnnotation)(value655)
              ? AccessibilityAnnouncementsLabel_19
              : AccessibilityAnnouncementsLabel_18,
        );
        return true;
      },
      [value98],
    );
  (0, reactChromeTheme.useEffect)((...args: Dynamic[]): Dynamic => (subscribeCanvasKeyDown as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get focusedFileRef() { return focusedFileRef; }, get pendingFrameSelectionRef() { return pendingFrameSelectionRef; }, get selectionEpochRef() { return selectionEpochRef; }, get selectionRef() { return selectionRef; }, get value106() { return value106; }, get value125() { return value125; }, get value147() { return value147; }, get value152() { return value152; }, get value155() { return value155; }, get value159() { return value159; }, get value21() { return value21; }, get value218() { return value218; }, get value224() { return value224; }, get value279() { return value279; }, get value295() { return value295; }, get value32() { return value32; }, get value33() { return value33; }, get value339() { return value339; }, get value345() { return value345; }, get value404() { return value404; }, get value42() { return value42; }, get value459() { return value459; }, get value48() { return value48; }, get value52() { return value52; }, get value552() { return value552; }, get value56() { return value56; }, get value61() { return value61; }, get value73() { return value73; } }, ...args), []);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        !(event.metaKey || event.ctrlKey) ||
        event.shiftKey ||
        event.altKey ||
        event.key.toLowerCase() !== "d" ||
        !value224.current ||
        value345.current
      )
        return;
      let current4: Dynamic = selectionRef.current,
        value653: Dynamic =
          (0, isEditingInputTarget)(event.target) ||
          (0, hasBlockingEditorOverlay)();
      if (
        !(
          focusedFileRef.current != null &&
          current4.elements.has(focusedFileRef.current) &&
          !value653
        )
      ) {
        if (value653) {
          (0, isDuplicateShortcut)(event) && event.preventDefault();
          return;
        }
        event.preventDefault();
        !(
          (0, isEmptyCanvasSelection)(current4) ||
          event.repeat ||
          value218.current
        ) &&
          (event.stopPropagation(),
          current4.elements.size > 0
            ? value158.current()
            : value52.current((): Dynamic => {
                let current5: Dynamic = selectionRef.current;
                !value224.current ||
                  value218.current ||
                  (0, hasBlockingEditorOverlay)() ||
                  (0, isEmptyCanvasSelection)(current5) ||
                  (current5.elements.size > 0
                    ? value158.current()
                    : value323.current(
                        (0, canvasBoardSelection)(current5),
                      ));
              }));
      }
    };
    (document as Dynamic).addEventListener("keydown", callback15, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", callback15, true);
  }, []);
  let value322: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (duplicateSelectedBoards as Dynamic)({ get value344() { return value344; }, get value383() { return value383; }, get value87() { return value87; }, get value90() { return value90; } }, ...args),
      [],
    ),
    value323: Dynamic = (0, reactChromeTheme.useRef)(value322);
  value323.current = value322;
  let value324: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value325: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value326: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653: Dynamic = "dropped",
        extra?: Dynamic,
        detail?: Dynamic,
        argument: Dynamic = 0,
      ): Dynamic => {
        let value654: Dynamic = items.filter(
            (input?: Dynamic): Dynamic =>
              input instanceof File && input.type.startsWith("image/"),
          ),
          value655: Dynamic = value654.slice(0, 6),
          value656: Dynamic = items.filter(
            (input?: Dynamic): Dynamic =>
              input instanceof File && (0, isVideoFile)(input),
          ),
          value657: Dynamic = value655.length > 0 ? "images" : "videos";
        if (value655.length === 0 && value656.length === 0) {
          items.length > 0 &&
            value188(
              uiMessage("canvas.designCanvas.onlyImagesAndMp4Mov", { value1: uiOperation(value653) }),
            );
          return;
        }
        if (!editable) {
          value188(
            uiMessage("canvas.designCanvas.thisDesignIsViewOnly", { value1: uiOperation(value657) }),
          );
          return;
        }
        if (!value224.current) return;
        let value658: Dynamic = extra;
        value654.length > value655.length &&
          value188(
            uiMessage("canvas.designCanvas.placingTheFirstValue1Images", { value1: String(6) }),
          );
        value655.length > 0 &&
          value324.current(value655, options, context, value653, value658);
        value656.length > 0 &&
          value325.current(
            value656,
            options,
            context,
            value653,
            value658,
            value655.length + argument,
            value658 === extra ? detail : undefined,
          );
      },
      [value188, editable],
    ),
    [value327, value328]: Dynamic = (0, reactChromeTheme.useState)(
      [],
    ),
    value329: Dynamic = (0, reactChromeTheme.useRef)(value327);
  value329.current = value327;
  let value330: Dynamic = (0, reactChromeTheme.useRef)(0),
    value331: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        value327.filter((input?: Dynamic): Dynamic => input.page === value79),
      [value327, value79],
    ),
    value332: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let artboards: Dynamic = value87.current.artboards;
        return context != null
          ? artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === context,
            )
          : [...artboards]
              .reverse()
              .find(
                (input2?: Dynamic): Dynamic =>
                  !(input2.frameless && input2.file !== value125.current) &&
                  input >= input2.x &&
                  input <= input2.x + input2.w &&
                  options >= input2.y &&
                  options <= input2.y + input2.h,
              );
      },
      [],
    ),
    value333: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (placeDroppedImages as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get value177() { return value177; }, get value188() { return value188; }, get value271() { return value271; }, get value316() { return value316; }, get value328() { return value328; }, get value329() { return value329; }, get value330() { return value330; }, get value332() { return value332; }, get value339() { return value339; }, get value62() { return value62; }, get value73() { return value73; }, get value80() { return value80; } }, ...args),
      [value188, value62, value332],
    );
  value324.current = value333;
  let value334: Dynamic = (0, reactChromeTheme.useCallback)(
    (...args: Dynamic[]): Dynamic => (placeDroppedVideos as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get value177() { return value177; }, get value188() { return value188; }, get value271() { return value271; }, get value316() { return value316; }, get value329() { return value329; }, get value332() { return value332; }, get value339() { return value339; }, get value62() { return value62; }, get value73() { return value73; }, get value80() { return value80; } }, ...args),
    [value188, value332],
  );
  value325.current = value334;
  let value335: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
      ): Dynamic => {
        let value654: Dynamic;
        if (input === "text") {
          let value655: Dynamic = (0, beginDeferredTextInput)();
          if (value655 === null) return;
          value654 = value655;
          value177.current.get(options)?.textPlacing();
        }
        value273(options).then((input2?: Dynamic): Dynamic => {
          input2 && value224.current
            ? value308({
                file: options,
                tool: input,
                ...context,
                dir: value653,
                holdToken: value654,
              })
            : value654 !== undefined &&
              (0, finishDeferredTextInput)("edit", value654);
        });
      },
      [value273],
    ),
    value336: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = (
          {
            text: "text",
            rect: "a rectangle",
            oval: "an oval",
            arrow: "an arrow",
            line: "a line",
          } as Dynamic
        )[input];
        value188(
          options === "blocked"
            ? uiMessage("canvas.designCanvas.thatArtboardDidnTLoad") +
                value653 +
                "."
            : uiMessage("canvas.designCanvas.clickInsideAnArtboardTo") + value653 + ".",
        );
      },
      [value188],
    ),
    [value337, value338]: Dynamic = (0, reactChromeTheme.useState)(
      "select",
    ),
    value339: Dynamic = (0, reactChromeTheme.useRef)(value337);
  value339.current = value337;
  let [value340, value341]: Dynamic = (0, reactChromeTheme.useState)(
    0,
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    editing || (value338("select"), value308(null));
  }, [editing]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value338("select");
    value308(
      (input?: Dynamic): Dynamic =>
        input && input.file !== value121 ? null : input,
    );
  }, [value121]);
  let callback9: Dynamic = (input?: Dynamic): Dynamic => {
      let value653: Dynamic = value73.current.annotations ?? [],
        items: Dynamic = [];
      for (let value654 of input as Dynamic) {
        let value655: Dynamic = (0, createAnnotationId)(
          [...value653, ...items],
          supportsLoadState,
          (0, annotationKindCategory)(value654.src),
        );
        items.push(
          (0, moveAnnotation)(
            {
              ...value654.src,
              id: value655,
            },
            Math.round(value654.x),
            Math.round(value654.y),
          ),
        );
      }
      return items;
    },
    value342: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (duplicateArtboardFiles as Dynamic)({ get callback9() { return callback9; }, get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get value140() { return value140; }, get value142() { return value142; }, get value177() { return value177; }, get value413() { return value413; }, get value73() { return value73; }, get value87() { return value87; }, get value98() { return value98; } }, ...args),
      [doc, value67, value98, showToast],
    ),
    value343: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (duplicateBoardsAndNotes as Dynamic)({ get callback9() { return callback9; }, get setSelection() { return setSelection; }, get value140() { return value140; }, get value142() { return value142; }, get value188() { return value188; }, get value318() { return value318; }, get value342() { return value342; }, get value396() { return value396; }, get value62() { return value62; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value342, value318, value98, value62, value188],
    ),
    value344: Dynamic = (0, reactChromeTheme.useRef)(value343);
  value344.current = value343;
  let value345: Dynamic = (0, reactChromeTheme.useRef)(false),
    value346: Dynamic = (0, reactChromeTheme.useRef)(null),
    [value347, value348]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => {
        if (value101 == null) return null;
        let value653: Dynamic = value67.artboards.find(
          (input?: Dynamic): Dynamic => input.file === value101,
        );
        return {
          file: value101,
          prev: (0, recallCanvasView)(value79) ?? defaultCanvasCamera,
          fit: artboardIsNotExpandedFill(value653),
        };
      },
    ),
    value349: Dynamic = value99 && value347 == null;
  (0, usePhoneCanvasVisibility)(value349 && !flag && !value100);
  let value350: Dynamic =
      value349 && !flag && editing && value121 != null
        ? (value70.current ?? value67).artboards.find(
            (input?: Dynamic): Dynamic => input.file === value121,
          )
        : undefined,
    value351: Dynamic =
      value350 &&
      (0, shouldDelayPreviewMount)(value350, {
        editing: editing,
        runsNothing: value100,
      })
        ? null
        : value121,
    value352: Dynamic =
      editing &&
      value347 == null &&
      value351 == null &&
      value269 == null &&
      true;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value352 || value338("select");
  }, [value352]);
  let value353: Dynamic = !(value347 != null && flag) || value95,
    [value354, value355]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => !value353,
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (value353) {
      value355(false);
      return;
    }
    let flag2: Dynamic = true;
    (async (): Promise<Dynamic> => {
      try {
        await value.current?.("preview");
      } finally {
        flag2 && value355(true);
      }
    })();
    return (): Dynamic => {
      flag2 = false;
    };
  }, [value353]);
  let value356: Dynamic = editing && (value353 || !value354),
    value357: Dynamic = (0, reactChromeTheme.useRef)(value356);
  value357.current = value356;
  let value358: Dynamic = readOnly && value353,
    [value359, value360]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    [value361, value362]: Dynamic = (0, reactChromeTheme.useState)(
      {},
    ),
    value363: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value362(
          (input2?: Dynamic): Dynamic =>
            !!input2[input] === options
              ? input2
              : {
                  ...input2,
                  [input]: options,
                },
        );
      },
      [],
    ),
    value364: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let { w: value653, h: value654, top: value655 }: Dynamic = value120();
        if (!value653 || value654 - value655 <= 0) return;
        value105.set(
          artboardFullscreenCamera(
            input,
            options,
            value653,
            value654,
            value655,
            context,
          ),
          true,
        );
        let value656: Dynamic = value654 - value655;
        value360(
          (input2?: Dynamic): Dynamic =>
            options
              ? null
              : input2 && input2.w === value653 && input2.h === value656
                ? input2
                : {
                    w: value653,
                    h: value656,
                  },
        );
      },
      [value105, value120],
    ),
    value365: Dynamic = (0, reactChromeTheme.useRef)(null),
    value366: Dynamic = (0, reactChromeTheme.useRef)(null),
    [value367, value368]: Dynamic = (0, reactChromeTheme.useState)(
      "",
    ),
    value369: Dynamic = (0, reactChromeTheme.useRef)(null);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = (0, createDesignContextPublisher)();
    value365.current = value653;
    let value654: Dynamic = (0, createPresenceReporter)({
      minDelta: 2,
    });
    value366.current = value654;
    (0, getCurrentUserProfile)().then((input?: Dynamic): Dynamic => {
      value654.setWho(input?.name ?? "", input?.color ?? "");
      value368(input?.color ?? "");
    });
    let flag2: Dynamic = false,
      callback15: Dynamic = (): Dynamic => {
        value369.current?.ctrl.abort();
        !flag2 &&
          ((flag2 = true),
          value653.dispose(),
          value654.dispose(),
          (value365.current = null),
          (value366.current = null));
      };
    (0, setEmbedSilencer)(callback15);
    return (): Dynamic => {
      (0, setEmbedSilencer)(null);
      callback15();
    };
  }, []);
  let value370: Dynamic =
      (0, embedMemoryPrefix)() + "canvas:" + value79,
    value371: Dynamic = (0, reactChromeTheme.useRef)(false),
    callback10: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      value371.current = true;
      value366.current?.move(
        value370,
        Math.round(input),
        Math.round(options),
      );
    },
    value372: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        value285.current ||
          ((value371.current = false),
          value366.current?.move(
            (0, pageCommentSurfaceKey)(input),
            Math.round(options),
            Math.round(context),
          ));
      },
      [],
    ),
    value373: Dynamic = value347?.file ?? null;
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (): Dynamic => {
      value371.current = false;
      value366.current?.say("");
      value366.current?.clear();
    },
    [value373, value347?.fit, value283, value79],
  );
  let value374: Dynamic = (0, reactChromeTheme.useCallback)(
      (event?: Dynamic): Dynamic =>
        !(0, isEditingInputTarget)(event.target) &&
        !(0, hasBlockingEditorOverlay)() &&
        !value345.current &&
        value371.current,
      [],
    ),
    value375: Dynamic =
      value16 ||
      (!supportsLoadState && localDirty) ||
      sessionsDirty ||
      doc.dirty();
  (0, useLiveDismissalGuard)((): Dynamic => false);
  let value376: Dynamic = (0,
  reactChromeTheme.useCallback)((...args: Dynamic[]): Dynamic => (reportDesignContextSnapshot as Dynamic)({ get flag() { return flag; }, get selection() { return selection; }, get value103() { return value103; }, get value120() { return value120; }, get value168() { return value168; }, get value172() { return value172; }, get value177() { return value177; }, get value266() { return value266; }, get value347() { return value347; }, get value356() { return value356; }, get value365() { return value365; }, get value375() { return value375; }, get value79() { return value79; }, get value81() { return value81; }, get value86() { return value86; } }, ...args), [
    value103,
    value120,
    value86,
    value79,
    value81,
    value232,
    value235,
    value347,
    value356,
    value168,
    value172,
    selection,
    value375,
    value266,
  ]);
  (0, reactChromeTheme.useEffect)(value376, [value376]);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (
      (0, setEmbedPresenceListener)(value376),
      (): Dynamic => (0, setEmbedPresenceListener)(null)
    ),
    [value376],
  );
  let value377: Dynamic = (0, reactChromeTheme.useRef)(value376);
  value377.current = value376;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let current4: Dynamic = value106.current;
    if (!current4 || typeof ResizeObserver === "undefined") return;
    let observer: Dynamic = new ResizeObserver(
      (): Dynamic => value377.current(),
    );
    observer.observe(current4);
    return (): Dynamic => observer.disconnect();
  }, []);
  let value378: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value67.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        value653 &&
          value275(
            (): Dynamic =>
              value348({
                file: input,
                prev: options ?? value105.get(),
                fit: artboardIsNotExpandedFill(value653),
              }),
          );
      },
      [value67, value275, value105],
    ),
    value379: Dynamic = (0, reactChromeTheme.useRef)(value378);
  value379.current = value378;
  let value380: Dynamic = (0, useLatestCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          value653: Dynamic = current4.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        if (!value653 || value653.frameless === true) return;
        let value654: Dynamic = (0, designPageId)(
            value653,
            current4.pages,
          ),
          value655: Dynamic = value654 !== value80.current;
        value655 && (value298(value654, input), (value291.current = false));
        value348(
          (input2?: Dynamic): Dynamic => ({
            file: input,
            prev:
              input2?.prev ??
              (value655
                ? ((0, recallCanvasView)(value654) ??
                  defaultCanvasCamera)
                : value105.get()),
            fit: artboardIsNotExpandedFill(value653),
          }),
        );
      },
    ),
    value381: Dynamic = (0, useLatestCallback)(
      (input?: Dynamic): Dynamic => value275((): Dynamic => value380(input)),
    ),
    value382: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value383: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value384: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        if (input == null) {
          value270(null);
          return;
        }
        let value653: Dynamic = value73.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        value653?.frameless ||
          value275((): Dynamic => {
            let value654: Dynamic = value99 && !flag && !value345.current,
              value655: Dynamic =
                options !== undefined && options !== value80.current;
            options !== undefined && value298(options);
            if (
              value654 &&
              value653 &&
              (0, shouldDelayPreviewMount)(value653, {
                editing: value224.current,
                runsNothing: value100,
              })
            ) {
              value655 && (value291.current = false);
              value270(null);
              value348({
                file: input,
                prev:
                  value655 && options !== undefined
                    ? ((0, recallCanvasView)(options) ??
                      defaultCanvasCamera)
                    : value105.get(),
                fit: artboardIsNotExpandedFill(value653),
              });
              return;
            }
            selectionEpochRef.current++;
            (focusedFileRef.current === input || value654) && value62();
            value654 && value122(null);
            setSelection(
              (input2?: Dynamic): Dynamic =>
                (0, filterSelectedArtboards)(
                  input2,
                  (input3?: Dynamic): Dynamic => input3 !== input,
                ),
            );
            value270(input);
          });
      },
      [value275, value298, value62, value99, flag, value100, value105],
    ),
    value385: Dynamic = (0, reactChromeTheme.useRef)(null);
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    let current4: Dynamic = value385.current;
    value385.current = value269;
    if (value269 == null) {
      let artboards: Dynamic = value87.current.artboards;
      current4 != null &&
        focusedFileRef.current == null &&
        value122(
          artboards.some(
            (input?: Dynamic): Dynamic => input.file === current4,
          )
            ? current4
            : value99 && !flag && editableRef.current && !value345.current
              ? null
              : (artboards.find(
                  (input?: Dynamic): Dynamic => !input.frameless,
                )?.file ?? null),
        );
      return;
    }
    value121 === value269 && value122(null);
  }, [value269, value121, value99, flag]);
  let value386: Dynamic = (0, reactChromeTheme.useRef)(null),
    value387: Dynamic = (0, reactChromeTheme.useRef)(null),
    value388: Dynamic = (0, reactChromeTheme.useRef)(null);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let current4: Dynamic = value388.current;
    current4 === null ||
      (value347 == null && value114 === 0) ||
      ((value388.current = null),
      value347 == null && value105.get() === current4 && value292.current());
  }, [value347, value114, value105]);
  let value389: Dynamic = (0,
  reactChromeTheme.useCallback)((): Dynamic => {
    value270(null);
    value345.current = false;
    value346.current = null;
    value387.current = null;
    value117.current = false;
    let current4: Dynamic = value386.current;
    current4 === defaultCanvasCamera && value292.current()
      ? (value388.current = value105.get())
      : current4 && value105.set(current4, true);
    value348(null);
  }, [value105]);
  value297.current = value389;
  value345.current = value347 != null;
  value346.current = value347?.file ?? null;
  value386.current = value347?.prev ?? null;
  value387.current = value347;
  let value390: Dynamic = value347 != null && !flag;
  value117.current = value390;
  let value391: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value346.current,
          artboards: Dynamic = value87.current.artboards;
        if (
          current4 == null ||
          !artboards.some(
            (input2?: Dynamic): Dynamic => input2.file === current4,
          )
        )
          return false;
        let value653: Dynamic = (0, adjacentPrintableArtboard)(
          artboards,
          current4,
          input,
        );
        if (value653 == null) {
          let value654: Dynamic =
            (0, printableArtboards)(artboards).length <= 1;
          (0, announce)(
            value654
              ? ThisIsTheOnlyArtboardMessage
              : input > 0
                ? ThisIsTheLastArtboardMessage
                : ThisIsTheFirstArtboardMessage,
          );
          return false;
        }
        value382.current(value653.artboard.file);
        return true;
      },
      [],
    ),
    value392: Dynamic = (0, reactChromeTheme.useRef)(
      value347?.file ?? null,
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value347?.file ?? null;
    if (
      value653 === value392.current ||
      ((value392.current = value653), value653 == null)
    )
      return;
    let artboards: Dynamic = value87.current.artboards,
      value654: Dynamic = artboards.find(
        (input?: Dynamic): Dynamic => input.file === value653,
      ),
      value655: Dynamic = (0, printableArtboardIndex)(
        artboards,
        value653,
      );
    value654 &&
      value655 &&
      (0, announce)(
        (0, artboardPositionAnnouncement)(
          value655.index,
          value655.count,
          value654.title ?? value654.file.replace(/\.dc\.html$/, ""),
        ),
      );
  }, [value347?.file]);
  let value393: Dynamic = (0, reactChromeTheme.useRef)(0);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let current4: Dynamic = value393.current;
    value393.current = 0;
    if (current4 === 0 || value347 == null) return;
    let value653: Dynamic = value177.current.get(value347.file)?.webviewRef
      .current;
    value653
      ? value653.focus({
          preventScroll: true,
        })
      : (document as Dynamic).activeElement instanceof HTMLIFrameElement &&
        (document as Dynamic).activeElement.blur();
  }, [value347]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value347?.prev ?? value103;
    if (value653 === defaultCanvasCamera) return;
    let value654: Dynamic = (window as Dynamic).setTimeout(
      (): Dynamic => (0, rememberCanvasView)(value79, value653),
      150,
    );
    return (): Dynamic => (window as Dynamic).clearTimeout(value654);
  }, [value79, value103, value347]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.shiftKey ||
        !(event.metaKey || event.ctrlKey) ||
        (event.key !== "\\" && event.code !== "Backslash") ||
        !(value224.current || value225.current) ||
        value345.current ||
        (value99 && !value345.current && !value224.current) ||
        value285.current ||
        (event.preventDefault(), event.repeat)
      )
        return;
      let activeElement: Dynamic = (document as Dynamic).activeElement,
        value653: Dynamic =
          activeElement instanceof HTMLElement &&
          (/^(INPUT|TEXTAREA|SELECT)$/.test(activeElement.tagName) ||
            activeElement.isContentEditable);
      value14.current = !(0, hasBlockingEditorOverlay)() && !value653;
      value96((input?: Dynamic): Dynamic => !input);
    };
    (window as Dynamic).addEventListener("keydown", callback15, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", callback15, true);
  }, [value96, value99]);
  let callback11: Dynamic = (input?: Dynamic): Dynamic =>
      input == null
        ? null
        : (value106.current?.querySelector(
            `[data-mega-artboard="${CSS.escape(input)}"] [data-mega-title-text]`,
          ) ?? null),
    value394: Dynamic = (0, useCanvasKeyboardFocus)(
      [
        {
          el: (): Dynamic =>
            value107.current?.querySelector("header.tb-root") ?? null,
        },
        {
          el: (): Dynamic => value106.current,
          home: true,
          clipTo: (): Dynamic => value106.current,
          anchor: (): Dynamic =>
            callback11(value24.current?.insideRef.current ?? null),
          fallback: (): Dynamic => callback11(focusedFileRef.current),
        },
        {
          el: (): Dynamic =>
            value106.current?.querySelector("[data-mega-selection-strip]") ??
            null,
          clipTo: (): Dynamic => value106.current,
          escapeHome: true,
        },
        {
          el: (): Dynamic =>
            (document as Dynamic).getElementById(inspectorPanelId),
          fallback: (): Dynamic =>
            (document as Dynamic)
              .getElementById(inspectorPanelId)
              ?.querySelector('[role="tab"][aria-selected="true"]') ?? null,
        },
      ],
      (): Dynamic => value285.current,
    );
  value6.current = async (): Promise<Dynamic> => {
    let current4: Dynamic = value73.current;
    if (!editable || supportsLoadState || !doc.dirty()) return;
    let current5: Dynamic = value346.current,
      value653: Dynamic =
        (current4.pages?.length ?? 0) > 1 ? value80.current : undefined,
      value654: Dynamic =
        current5 !== null
          ? {
              view: "focused",
              file: current5,
            }
          : value653 !== undefined
            ? {
                view: "canvas",
                page: value653,
              }
            : {
                view: "canvas",
              },
      value655: Dynamic = current4.artboards.some(
        (input?: Dynamic): Dynamic => input.file === filePath,
      )
        ? filePath
        : (current4.artboards[0]?.file ?? null),
      value656: Dynamic =
        current4.launch ??
        (doc.content().files[canvasMetadataFile] != null
          ? {
              view: "canvas",
            }
          : value655 !== null
            ? {
                view: "focused",
                file: value655,
              }
            : undefined);
    if (
      value654.view === "focused"
        ? value656?.view === "focused" && value656.file === value654.file
        : value656?.view === "canvas" && value656.page === value654.page
    )
      return;
    let state: Dynamic = {
      ...current4,
      launch: value654,
    };
    value70.current = state;
    value73.current = state;
    value68(state);
    await (0, getKvClient)().set(
      (0, PlatformFileContentHandler_4)(canvasMetadataFile),
      (0, serializeCanvasMetadata)(state),
      {
        auto: true,
      },
    );
  };
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!supportsLoadState || !editable) return;
    let callback15: Dynamic = async (): Promise<Dynamic> => {
        await value3.current?.();
        for (let value653 of [
          ...dirtySessionFlushersRef.current.values(),
        ] as Dynamic)
          await value653();
      },
      callback16: Dynamic = (): Dynamic => {
        (document as Dynamic).visibilityState === "hidden" &&
          (async (): Promise<Dynamic> => {
            try {
              await callback15();
            } catch {}
            doc.flushNow?.();
          })();
      };
    (document as Dynamic).addEventListener("visibilitychange", callback16);
    (0, setEmbedSettler)(async (): Promise<Dynamic> => {
      let current4: Dynamic = value369.current;
      current4?.ctrl.abort();
      current4 &&
        (await Promise.race([
          current4.done,
          new Promise(
            (input?: Dynamic): Dynamic =>
              (window as Dynamic).setTimeout(
                input,
                canvasExitExportWaitTimeoutMs,
              ),
          ),
        ]));
      await callback15();
    });
    return (): Dynamic => {
      (document as Dynamic).removeEventListener(
        "visibilitychange",
        callback16,
      );
      (0, setEmbedSettler)(null);
    };
  }, [supportsLoadState, editable, doc]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!supportsLoadState || !editable || !sessionsDirty) {
      sessionFlushRetryCountRef.current = 0;
      return;
    }
    let callback15: Dynamic = (): Dynamic => {
        Promise.allSettled(
          [...dirtySessionFlushersRef.current.values()].map(
            (input?: Dynamic): Dynamic => input(),
          ),
        ).then((): Dynamic => {
          sessionFlushRetryCountRef.current++ < maxSessionDirtyFlushRetries &&
            incrementSessionFlushEpoch(
              (input?: Dynamic): Dynamic => input + 1,
            );
        });
      },
      value653: Dynamic = (window as Dynamic).setTimeout(callback15, 1500);
    return (): Dynamic => (window as Dynamic).clearTimeout(value653);
  }, [supportsLoadState, editable, sessionsDirty, sessionFlushEpoch]);
  (0, reactChromeTheme.useEffect)((...args: Dynamic[]): Dynamic => (subscribePlayModeKeys as Dynamic)({ get flag() { return flag; }, get value177() { return value177; }, get value220() { return value220; }, get value347() { return value347; }, get value389() { return value389; }, get value391() { return value391; }, get value393() { return value393; }, get value87() { return value87; } }, ...args), [value347, flag, value220, value389, value391]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (value269 == null) return;
    if (
      !value86.artboards.some(
        (input?: Dynamic): Dynamic => input.file === value269,
      )
    ) {
      value270(null);
      return;
    }
    if (value347 != null) return;
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
        event.key !== "Escape" ||
          event.repeat ||
          event.defaultPrevented ||
          (0, hasBlockingEditorOverlay)() ||
          value220 ||
          (value224.current &&
            !(0, isEmptyCanvasSelection)(selectionRef.current)) ||
          value339.current !== "select" ||
          (0, isEditingInputTarget)(event.target) ||
          (event.preventDefault(), value270(null));
      },
      callback16: Dynamic = (dataset?: Dynamic): Dynamic => {
        let data: Dynamic = dataset.data;
        !data ||
          typeof data != "object" ||
          data.__om_escape !== 1 ||
          (dataset.source !== null &&
            value177.current.get(value269)?.webviewRef.current
              ?.contentWindow === dataset.source &&
            value270(null));
      };
    (window as Dynamic).addEventListener("keydown", callback15);
    (window as Dynamic).addEventListener("message", callback16);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", callback15);
      (window as Dynamic).removeEventListener("message", callback16);
    };
  }, [value269, value86.artboards, value347, value220]);
  (0, reactChromeTheme.useEffect)((...args: Dynamic[]): Dynamic => (subscribePreviewOpenMessages as Dynamic)({ get setSelection() { return setSelection; }, get value105() { return value105; }, get value177() { return value177; }, get value224() { return value224; }, get value225() { return value225; }, get value271() { return value271; }, get value274() { return value274; }, get value285() { return value285; }, get value291() { return value291; }, get value298() { return value298; }, get value345() { return value345; }, get value346() { return value346; }, get value348() { return value348; }, get value382() { return value382; }, get value384() { return value384; }, get value393() { return value393; }, get value62() { return value62; }, get value73() { return value73; }, get value80() { return value80; } }, ...args), [value298, value384, value62, value105]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value347 != null &&
      setSelection(
        (input?: Dynamic): Dynamic => (0, clearSelectedBoards)(input),
      );
  }, [value347]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!value347) return;
    let value653: Dynamic = value67.artboards.find(
      (input?: Dynamic): Dynamic => input.file === value347.file,
    );
    if (flag) {
      if (
        value653 &&
        (0, designPageId)(value653, value67.pages) === value79
      )
        return;
      let value654: Dynamic = (0, defaultPageArtboard)(
        value67,
        value79,
      );
      value654 &&
        value654.file !== value347.file &&
        value348({
          file: value654.file,
          prev: value347.prev,
          fit: artboardIsNotExpandedFill(value654),
        });
      return;
    }
    value653 || value389();
  }, [value67, value347, value389, value79]);
  let value395: Dynamic =
    value347 != null && value347.fit && flag && value361[value347.file]
      ? artboardTweaksRowHeight
      : 0;
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    if (!value347) return;
    let value653: Dynamic = value67.artboards.find(
      (input?: Dynamic): Dynamic => input.file === value347.file,
    );
    if (!value653) return;
    let value654: Dynamic = value395
        ? {
            x: value653.x,
            y: value653.y - value395,
            w: value653.w,
            h: value653.h + value395,
          }
        : value653,
      value655: Dynamic = flag || value99 ? 0 : canvasPastePositionStep;
    value364(value654, value347.fit, value655);
    let current4: Dynamic = value106.current;
    if (!current4 || typeof ResizeObserver === "undefined") return;
    let observer: Dynamic = new ResizeObserver(
      (): Dynamic => value364(value654, value347.fit, value655),
    );
    observer.observe(current4);
    return (): Dynamic => observer.disconnect();
  }, [value347, value67, value395, value114, flag, value99]);
  let value396: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => {},
    ),
    value397: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = input.replace(/\.dc\.html$/, ""),
          value654: Dynamic = (0, PlatformFileContentSlice)(options);
        if (value654 === undefined) return;
        let value655: Dynamic = value67.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value656: Dynamic = value654 !== value653 ? value654 : undefined;
        !value655 ||
          (value655.title ?? undefined) === value656 ||
          (value396.current(
            {
              kind: "rename",
              file: input,
              from: value655.title,
              to: value656,
            },
            new Set(),
          ),
          value98({
            artboards: value67.artboards.map((input2?: Dynamic): Dynamic => {
              if (input2.file !== input) return input2;
              let { title: value657, ...value658 }: Dynamic = input2;
              return value656
                ? {
                    ...value658,
                    title: value656,
                  }
                : value658;
            }),
          }));
      },
      [value67, value98],
    ),
    value398: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value67.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value654: Dynamic = value653?.print === "flow" ? "flow" : "fixed";
        !value653 ||
          value654 === options ||
          (value396.current(
            {
              kind: "print",
              file: input,
              from: value654,
              to: options,
            },
            new Set(),
          ),
          value98({
            artboards: value67.artboards.map((input2?: Dynamic): Dynamic => {
              if (input2.file !== input) return input2;
              let { print: value655, ...value656 }: Dynamic = input2;
              return options === "flow"
                ? {
                    ...value656,
                    print: "flow",
                  }
                : value656;
            }),
          }));
      },
      [value67, value98],
    ),
    value399: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (resizeArtboardFromInput as Dynamic)({ get value396() { return value396; }, get value68() { return value68; }, get value70() { return value70; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98],
    ),
    value400: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value67.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        !value653 ||
          value653.paper === options ||
          (value396.current(
            {
              kind: "paper",
              file: input,
              from: value653.paper,
              to: options,
            },
            new Set(),
          ),
          value98({
            artboards: value67.artboards.map(
              (input2?: Dynamic): Dynamic =>
                input2.file === input
                  ? {
                      ...input2,
                      paper: options,
                    }
                  : input2,
            ),
          }));
      },
      [value67, value98],
    ),
    value401: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, items?: Dynamic, context?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current;
        if (
          !current4.artboards.some(
            (input2?: Dynamic): Dynamic => input2.file === input,
          )
        )
          return;
        let value653: Dynamic = items.length > 0 ? [...items] : undefined;
        if (context) {
          value73.current = (0, updateArtboardGuides)(
            current4,
            input,
            value653,
          );
          value68(value73.current);
          return;
        }
        let value654: Dynamic = (value70.current ?? current4).artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        )?.guides;
        if ((0, structurallyEqual)(value654, value653)) {
          value68(
            (0, updateArtboardGuides)(current4, input, value653),
          );
          return;
        }
        value396.current(
          {
            kind: "guides",
            file: input,
            from: value654,
            to: value653,
          },
          new Set(),
        );
        value98((0, updateArtboardGuides)(current4, input, value653));
      },
      [value98],
    ),
    value402: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current;
        if (
          !current4.artboards.some(
            (input2?: Dynamic): Dynamic => input2.file === input,
          )
        )
          return;
        let value653: Dynamic = (0, normalizeArtboardRadius)(options);
        if (context) {
          value73.current = (0, updateArtboardRadius)(
            current4,
            input,
            value653,
          );
          value68(value73.current);
          return;
        }
        let value654: Dynamic = (value70.current ?? current4).artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        )?.radius;
        if ((0, structurallyEqual)(value654, value653)) {
          value68(
            (0, updateArtboardRadius)(current4, input, value653),
          );
          return;
        }
        value396.current(
          {
            kind: "radius",
            file: input,
            from: value654,
            to: value653,
          },
          new Set(),
        );
        value98((0, updateArtboardRadius)(current4, input, value653));
        (0, announce)(
          (0, propertyEditAnnouncement)([
            {
              prop: "border-radius",
              value: (0, artboardRadiusCss)(value653) ?? "0px",
            },
          ]),
        );
      },
      [value98],
    ),
    value403: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          value653: Dynamic = (0, reorderArtboardsOnPages)(
            current4.artboards,
            input,
            options,
            current4.pages,
          );
        value653 !== null &&
          (value396.current(
            (0, artboardOrderHistoryStep)(
              current4.artboards,
              value653,
            ),
            new Set(),
          ),
          value98({
            ...current4,
            artboards: value653,
          }));
        (0, announce)(
          (0, stackingAnnouncement)(options, value653 !== null),
        );
      },
      [value98],
    ),
    value404: Dynamic = (0, reactChromeTheme.useRef)(value403);
  value404.current = value403;
  let value405: Dynamic = (0, reactChromeTheme.useRef)([]),
    value406: Dynamic = (0, reactChromeTheme.useRef)([]),
    [value407, value408]: Dynamic = (0, reactChromeTheme.useState)(0),
    value409: Dynamic = (0, reactChromeTheme.useRef)(0),
    value410: Dynamic = (0, reactChromeTheme.useRef)(0),
    value411: Dynamic = (0, reactChromeTheme.useRef)(null),
    value412: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic = ++value409.current;
      value411.current = null;
      let current4: Dynamic = value406.current;
      value406.current = [];
      let items: Dynamic = [
        value432.current?.clearRedo() ?? ((): Dynamic => {}),
        value178.current?.keeper.clearRedo() ?? ((): Dynamic => {}),
      ];
      for (let value654 of value177.current.values() as Dynamic)
        items.push(value654.dropRedo());
      current4.length > 0 &&
        value408((input?: Dynamic): Dynamic => input + 1);
      return (): Dynamic => {
        value409.current === value653 && (value409.current = value653 - 1);
        value406.current.length === 0 && (value406.current = current4);
        for (let value654 of items as Dynamic) value654();
        value408((input?: Dynamic): Dynamic => input + 1);
      };
    }, []),
    value413: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (recordCanvasHistoryStep as Dynamic)({ get value140() { return value140; }, get value141() { return value141; }, get value4() { return value4; }, get value405() { return value405; }, get value408() { return value408; }, get value410() { return value410; }, get value412() { return value412; }, get value440() { return value440; }, get value67() { return value67; } }, ...args),
      [value67, value412],
    );
  value396.current = value413;
  let value414: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (applyCanvasHistoryStep as Dynamic)({ get doc() { return doc; }, get value177() { return value177; }, get value298() { return value298; }, get value70() { return value70; }, get value80() { return value80; }, get value98() { return value98; } }, ...args),
      [value98, value298],
    ),
    value415: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let value653: Dynamic =
            input === "undo" ? value405.current : value406.current,
          value654: Dynamic = value653[value653.length - 1];
        if (!value654) return null;
        for (let [value655, value656] of value654.depths as Dynamic)
          if ((value440.current.get(value655) ?? 0) !== (value656 ?? 0))
            return null;
        return value654;
      },
      [],
    ),
    value416: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653: Dynamic = true,
      ): Dynamic => {
        let value654: Dynamic = value405.current[value405.current.length - 1],
          value655: Dynamic =
            Object.keys(context).length === 1
              ? Object.keys(context)[0]
              : undefined,
          value656: Dynamic =
            value654?.op.kind === "tweak" ? Object.keys(value654.op.to) : [];
        if (
          value653 &&
          value655 !== undefined &&
          value654?.op.kind === "tweak" &&
          !value654.sealed &&
          value654.op.file === input &&
          value656.length === 1 &&
          value656[0] === value655 &&
          Date.now() - value654.at < ModelModelStateLimit &&
          value415("undo") === value654
        ) {
          value654.op = {
            ...value654.op,
            to: context,
          };
          value654.at = Date.now();
          value412();
          (0, equalPropValues)(
            value654.op.from[value655],
            context[value655],
          ) &&
            (value405.current.pop(),
            value408((input2?: Dynamic): Dynamic => input2 + 1));
          return;
        }
        value413(
          {
            kind: "tweak",
            file: input,
            from: options,
            to: context,
          },
          new Set(),
        );
        let value657: Dynamic = value405.current[value405.current.length - 1];
        !value653 && value657 && (value657.sealed = true);
      },
      [value415, value413, value412],
    ),
    value417: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (nudgeBoardsWithHistory as Dynamic)({ get value405() { return value405; }, get value412() { return value412; }, get value413() { return value413; }, get value415() { return value415; }, get value440() { return value440; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value415, value413, value412, value98],
    );
  value44.current = value417;
  let value418: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (flipAnnotationsWithHistory as Dynamic)({ get value140() { return value140; }, get value224() { return value224; }, get value413() { return value413; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value413, value98],
    ),
    value419: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value149.current
          ? GeometryFlipAnnotationsLabel_3
          : value150();
        if (value653 !== undefined) {
          value448.current?.(value653 + ".");
          return false;
        }
        if (
          !(0, sessionAllowsMutation)({
            gesturing: value218.current,
            setMoveCommits: value155.current,
          })
        )
          return false;
        let { flipped: value654, refused: value655 }: Dynamic = value418(
          input,
          options,
        );
        value655 !== undefined &&
          value448.current?.(
            (0, partialFlipMessage)(
              value655,
              value654,
              GeometryFlipAnnotationsWytKytYtConfig,
            ),
          );
        value654 &&
          (0, announce)(
            (0, flipDirectionAnnouncement)(options),
          );
        return value654;
      },
      [value418, value150],
    );
  value46.current = value419;
  value45.current = value418;
  let value420: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (setAnnotationBox as Dynamic)({ get value396() { return value396; }, get value68() { return value68; }, get value70() { return value70; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98],
    ),
    value421: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (setAnnotationCss as Dynamic)({ get value188() { return value188; }, get value396() { return value396; }, get value405() { return value405; }, get value408() { return value408; }, get value412() { return value412; }, get value415() { return value415; }, get value68() { return value68; }, get value70() { return value70; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98, value188, value415, value412],
    ),
    value422: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let value653: Dynamic = value73.current.annotations ?? [],
          value654: Dynamic = value653.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (
          !value654 ||
          (value654.kind !== "line" && value654.kind !== "arrow")
        )
          return;
        let value655: Dynamic = (0, annotationArrowHeads)(value654);
        if (value655[options] === context) return;
        let state: Dynamic = {
          ...value655,
          [options]: context,
        };
        value396.current(
          {
            kind: "ann-heads",
            id: input,
            from: value655,
            to: state,
          },
          new Set(),
        );
        value98({
          ...value73.current,
          annotations: value653.map(
            (input2?: Dynamic): Dynamic =>
              input2.id === input
                ? (0, updateAnnotationArrowHeads)(value654, state)
                : input2,
          ),
        });
      },
      [value98],
    ),
    value423: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (setAnnotationTextStyle as Dynamic)({ get value396() { return value396; }, get value68() { return value68; }, get value70() { return value70; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98],
    ),
    value424: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (replaceAnnotationPicture as Dynamic)({ get value188() { return value188; }, get value396() { return value396; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98, value188],
    ),
    value425: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value426: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (replaceAnnotationMedia as Dynamic)({ get value188() { return value188; }, get value396() { return value396; }, get value425() { return value425; }, get value73() { return value73; }, get value98() { return value98; } }, ...args),
      [value98, value188],
    ),
    value427: Dynamic = (0, reactChromeTheme.useRef)(null);
  value191.current = (input?: Dynamic): Dynamic => {
    let callback15: Dynamic = (): Dynamic => {
      let value653: Dynamic =
        value405.current.length + value406.current.length;
      value405.current = value405.current.filter(
        (input2?: Dynamic): Dynamic => input2.bound !== input,
      );
      value406.current = value406.current.filter(
        (input2?: Dynamic): Dynamic => input2.bound !== input,
      );
      value405.current.length + value406.current.length !== value653 &&
        value408((input2?: Dynamic): Dynamic => input2 + 1);
    };
    value427.current?.bound === input
      ? runWhenConditionReady(
          (): Dynamic => value427.current === null,
          callback15,
        )
      : callback15();
  };
  value192.current = (input?: Dynamic): Dynamic => {
    let current4: Dynamic = value432.current;
    if (!current4) return;
    current4.settle();
    let value653: Dynamic = current4.staleBound(input);
    value653 != null && value191.current(value653);
  };
  let value428: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let current4: Dynamic = value432.current;
        if (!current4) {
          context?.();
          return;
        }
        runWhenConditionReady(
          (): Dynamic => !current4.busy(),
          (): Dynamic => {
            if (current4.headBound(options) !== input) {
              context?.();
              return;
            }
            options === "undo" ? current4.undo() : current4.redo();
          },
        );
      },
      [],
    ),
    value429: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (applyUndoRedoStep as Dynamic)({ get showToast() { return showToast; }, get value188() { return value188; }, get value218() { return value218; }, get value405() { return value405; }, get value406() { return value406; }, get value408() { return value408; }, get value409() { return value409; }, get value414() { return value414; }, get value415() { return value415; }, get value427() { return value427; }, get value428() { return value428; }, get value440() { return value440; }, get value73() { return value73; } }, ...args),
      [value414, value415, value428, value188, showToast],
    ),
    value430: Dynamic = (0, reactChromeTheme.useRef)({
      reachable: value415,
      apply: value429,
    });
  value430.current = {
    reachable: value415,
    apply: value429,
  };
  value190.current = value415;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        !(
          event.key.toLowerCase() === "z" &&
          (event.metaKey || event.ctrlKey)
        ) ||
        event.repeat ||
        !value224.current ||
        value285.current ||
        (0, isCanvasTypingTarget)(event.target) ||
        value155.current > 0
      )
        return;
      if (value439.current()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      let value653: Dynamic = event.shiftKey ? "redo" : "undo";
      value415(value653) &&
        (event.preventDefault(), event.stopPropagation(), value429(value653));
    };
    (document as Dynamic).addEventListener("keydown", callback15, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", callback15, true);
  }, [value415, value429]);
  let value431: Dynamic = (0, reactChromeTheme.useRef)({
      focusedFile: null,
      panelUndo: null,
    }),
    value432: Dynamic = (0, reactChromeTheme.useRef)(null),
    value433: Dynamic = (0, reactChromeTheme.useRef)(null),
    value434: Dynamic = (0, reactChromeTheme.useRef)(null),
    value435: Dynamic = (0, reactChromeTheme.useRef)(doc);
  value435.current = doc;
  let value436: Dynamic = (0, reactChromeTheme.useRef)(value298);
  value436.current = value298;
  let value437: Dynamic = (0, reactChromeTheme.useRef)(showToast);
  value437.current = showToast;
  value178.current ??= ((...args: Dynamic[]): Dynamic => (initSessionHistoryKeeper as Dynamic)({ get callback2() { return callback2; }, get value177() { return value177; }, get value19() { return value19; }, get value218() { return value218; }, get value275() { return value275; }, get value285() { return value285; }, get value427() { return value427; }, get value434() { return value434; }, get value435() { return value435; }, get value436() { return value436; }, get value437() { return value437; }, get value448() { return value448; }, get value70() { return value70; }, get value80() { return value80; } }, ...args))();
  let { keeper: current, host: current2 }: Dynamic = value178.current,
    value438: Dynamic = (0, reactChromeTheme.useRef)(false);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = (0, textEditHistoryEpoch)(
      editing,
      value438.current,
      toolResetTick,
    );
    value438.current = editing;
    value653.clear && current.clearAll();
    current.setEpoch(value653.epoch);
  }, [editing, toolResetTick, current]);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (
      current.clearAll(),
      (): Dynamic => value178.current?.cancelSaid()
    ),
    [doc, current],
  );
  value434.current ??= (0, createEditSessionManager)({
    depths: (input?: Dynamic): Dynamic =>
      (0, readHeldSessionState)(
        current,
        current2.inDocument,
        input,
        "depth",
        (): Dynamic => value177.current.get(input)?.undoDepth() ?? null,
      ),
    floor: (input?: Dynamic): Dynamic =>
      (0, readHeldSessionState)(
        current,
        current2.inDocument,
        input,
        "floor",
        (): Dynamic => value177.current.get(input)?.undoFloor() ?? null,
      ),
    redos: (input?: Dynamic): Dynamic =>
      (0, readHeldSessionState)(
        current,
        current2.inDocument,
        input,
        "redos",
        (): Dynamic => value177.current.get(input)?.redoDepth() ?? null,
      ),
    cutUndo: (input?: Dynamic, options?: Dynamic): Dynamic =>
      value177.current.get(input)?.cutUndo(options),
    dropRedo: (input?: Dynamic, options?: Dynamic): Dynamic => {
      value177.current.get(input)?.dropRedo(options);
    },
    onAtomicRefused: (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value653?: Dynamic,
    ): Dynamic => {
      options !== "failed" && input !== undefined && value191.current(input);
      if (options === "capped") return;
      let value654: Dynamic =
          String(input) + ":" + options + ":" + String(value653),
        current4: Dynamic = value433.current;
      if (
        (current4 &&
          current4.k === value654 &&
          Date.now() - current4.at < 4e3) ||
        ((value433.current = {
          k: value654,
          at: Date.now(),
        }),
        options === "stale" && context === "whole" && input === undefined)
      )
        return;
      let text: Dynamic =
        uiMessage("canvas.designCanvas.thatMoveAcrossArtboardsCan");
      value448.current?.(
        options !== "stale"
          ? uiMessage("canvas.designCanvas.couldnTUndoOrRedo")
          : context === "others"
            ? value653 !== undefined
              ? text +
                " Undo puts back what it still can; the rest stays in " +
                callback2(value653) +
                ", and undo there no longer goes back past the move."
              : text +
                " Undo now puts the moved elements back where they came from; the copies stay."
            : context === "holder"
              ? text + " Redo now puts the copies back; the originals stay."
              : context === "whole"
                ? text +
                  " Undo and redo still move the elements; the artboards that moved with them stay."
                : value653 !== undefined
                  ? text +
                    " What you moved stays in " +
                    callback2(value653) +
                    ", and undo there no longer goes back past the move."
                  : text,
      );
    },
    onBoundApplied: (input?: Dynamic, options?: Dynamic): Dynamic => {
      runWhenConditionReady(
        (): Dynamic => value427.current === null,
        (): Dynamic => {
          value190.current?.(options)?.bound === input &&
            value430.current.apply(options, true);
        },
      );
    },
    apply: (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let current4: Dynamic = value431.current;
      return input === current4.focusedFile && current4.panelUndo
        ? (options === "undo"
            ? current4.panelUndo.undo()
            : current4.panelUndo.redo(),
          context ? value177.current.get(input)?.flushPending() : undefined)
        : value177.current
            .get(input)
            ?.applyHistory(value19(input), options)
            .then((input2?: Dynamic): Dynamic => {
              if (!input2) return;
              let value653: Dynamic = (
                input.split("/").pop() ?? input
              ).replace(/\.dc\.html$/, "");
              value448.current?.(
                (options === "undo" ? uiMessage("canvas.designCanvas.undidOn") : uiMessage("canvas.designCanvas.redidOn")) + value653,
              );
            });
    },
  });
  value432.current ??= (0, createInlineHistoryBridge)(
    value434.current,
    current,
    current2,
  );
  let value439: Dynamic = (0, reactChromeTheme.useRef)(
    (): Dynamic => false,
  );
  value439.current = (): Dynamic => value432.current?.busy() ?? false;
  let value440: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value441: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let current4: Dynamic = value4.current;
        current4 !== null &&
          input === focusedFileRef.current &&
          !value5.current &&
          (0, updateTextEditHistoryCounts)(current4, options);
      },
      [],
    ),
    value442: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value441(input, "push");
        value411.current = {
          file: input,
          restore: value412(),
        };
        value440.current.set(input, (value440.current.get(input) ?? 0) + 1);
        value432.current?.reportPush(input);
        value408((input2?: Dynamic): Dynamic => input2 + 1);
        value134(input);
        value239(input);
        value233((input2?: Dynamic): Dynamic => input2 + 1);
      },
      [value134, value239, value412, value441],
    ),
    value443: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value440.current.set(
          input,
          (value440.current.get(input) ?? 0) + (options === "undo" ? -1 : 1),
        );
        value134(input);
        value239(input);
        value233((input2?: Dynamic): Dynamic => input2 + 1);
      },
      [value134, value239],
    ),
    value444: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value441(input, "revoke");
        value443(input, "undo");
        let current4: Dynamic = value411.current;
        value411.current = null;
        current4 && current4.file === input && current4.restore();
      },
      [value443, value441],
    ),
    value445: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value441(input, options);
        value443(input, options);
        (0, announce)(
          AccessibilityAnnouncementsUndoRedoConfig_2[options],
        );
      },
      [value443, value441],
    ),
    value446: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value441(input, options === "undo" ? "drop-undo" : "drop-redo");
        let value653: Dynamic = value440.current.get(input) ?? 0,
          value654: Dynamic = options === "undo" ? value653 : value653 + 1,
          current4: Dynamic = value427.current;
        for (let value655 of [
          ...value405.current,
          ...value406.current,
          ...(current4 ? [current4] : []),
        ] as Dynamic)
          for (let value656 of value655.depths as Dynamic)
            value656[0] === input &&
              value656[1] != null &&
              value656[1] >= value654 &&
              (value656[1] -= 1);
        value408((input2?: Dynamic): Dynamic => input2 + 1);
        options !== "redo" &&
          (value440.current.set(input, value653 - 1),
          value134(input),
          value239(input),
          value233((input2?: Dynamic): Dynamic => input2 + 1));
      },
      [value134, value239, value441],
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        !(
          event.key.toLowerCase() === "z" &&
          (event.metaKey || event.ctrlKey)
        ) ||
        !value224.current ||
        value285.current ||
        (0, isCanvasTypingTarget)(event.target)
      )
        return;
      let current4: Dynamic = value432.current;
      if (!current4) return;
      if (current4.busy() || value155.current > 0) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      let value653: Dynamic = event.shiftKey ? "redo" : "undo";
      value192.current(value653);
      if (value430.current.reachable(value653)) return;
      if (value653 === "undo" ? !current4.canUndo() : !current4.canRedo()) {
        (0, announce)(
          AccessibilityAnnouncementsUndoRedoConfig[value653],
        );
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      (value653 === "undo" ? current4.undo() : current4.redo()) ===
        "skipped-all" &&
        value188(
          uiMessage("canvas.designCanvas.nothingLeftTo") +
            value653 +
            " \u2014 that artboard's history changed.",
        );
    };
    (document as Dynamic).addEventListener("keydown", callback15, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", callback15, true);
  }, [value188]);
  let value447: Dynamic = (0, reactChromeTheme.useRef)(null),
    callback12: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      (0, stepInlineHistory)({
        blocked: (): Dynamic =>
          (value432.current?.busy() ?? false) || value155.current > 0,
        stillOk: (): Dynamic => value224.current && !value285.current,
        liveUndoDepth: callback6,
        canvasStep: (input2?: Dynamic): Dynamic =>
          value430.current.reachable(input2),
        textEdit: value4.current,
        pending: value5,
        dir: input,
        step: options,
      });
    };
  value447.current ??= {
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
      callback12("undo", (): Dynamic => {
        value192.current("undo");
        if (value430.current.reachable("undo")) {
          value430.current.apply("undo");
          return;
        }
        let value653: Dynamic = value432.current?.undo();
        value653 === "skipped-all"
          ? value448.current?.(
              uiMessage("canvas.designCanvas.nothingLeftToUndoThat"),
            )
          : value653 === "empty" &&
            (0, announce)(
              AccessibilityAnnouncementsUndoRedoConfig.undo,
            );
      }),
    redo: (): Dynamic =>
      callback12("redo", (): Dynamic => {
        value192.current("redo");
        if (value430.current.reachable("redo")) {
          value430.current.apply("redo");
          return;
        }
        let value653: Dynamic = value432.current?.redo();
        value653 === "skipped-all"
          ? value448.current?.(
              uiMessage("canvas.designCanvas.nothingLeftToRedoThat"),
            )
          : value653 === "empty" &&
            (0, announce)(
              AccessibilityAnnouncementsUndoRedoConfig.redo,
            );
      }),
    canUndo: (): Dynamic =>
      value430.current.reachable("undo") != null ||
      (value432.current?.canUndo() ?? false),
    canRedo: (): Dynamic =>
      value430.current.reachable("redo") != null ||
      (value432.current?.canRedo() ?? false),
    redoDepth: (): Dynamic =>
      value430.current.reachable("redo") != null ||
      (value432.current?.canRedo() ?? false)
        ? 1
        : 0,
    clear(): Dynamic {},
    subscribe: (input?: Dynamic): Dynamic =>
      value432.current?.subscribe(input) ?? ((): Dynamic => {}),
  };
  let value448: Dynamic = (0, reactChromeTheme.useRef)(value188);
  value448.current = value188;
  let value449: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (deleteBoardsAndNotes as Dynamic)({ get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get value140() { return value140; }, get value177() { return value177; }, get value298() { return value298; }, get value413() { return value413; }, get value73() { return value73; }, get value80() { return value80; }, get value98() { return value98; } }, ...args),
      [value67, value98, value413, doc, showToast, value188, value298],
    ),
    value450: Dynamic = (0, reactChromeTheme.useRef)(value449);
  value450.current = value449;
  let value451: Dynamic = (0, reactChromeTheme.useRef)(value342);
  value451.current = value342;
  let value452: Dynamic = (0, reactChromeTheme.useRef)(callback3);
  value452.current = callback3;
  let value453: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        Object.assign(new WeakMap(), {
          next: 1,
        }),
      [],
    ),
    value454: Dynamic = (0, reactChromeTheme.useMemo)((...args: Dynamic[]): Dynamic => (buildHostedEditorCanvasApi as Dynamic)({ get doc() { return doc; }, get supportsLoadState() { return supportsLoadState; }, get value155() { return value155; }, get value156() { return value156; }, get value202() { return value202; }, get value274() { return value274; }, get value383() { return value383; }, get value396() { return value396; }, get value405() { return value405; }, get value406() { return value406; }, get value409() { return value409; }, get value410() { return value410; }, get value432() { return value432; }, get value440() { return value440; }, get value447() { return value447; }, get value450() { return value450; }, get value451() { return value451; }, get value452() { return value452; }, get value453() { return value453; }, get value73() { return value73; }, get value80() { return value80; }, get value98() { return value98; } }, ...args), [doc, value98, supportsLoadState, value156]),
    value455: Dynamic = (0, reactChromeTheme.useCallback)(
      async function value653(input?: Dynamic): Promise<Dynamic> {
        let value654: Dynamic = (0, canvasPageDeleteSnapshot)(
          value73.current,
          input,
        );
        if (!value654 || !value224.current) return;
        if (value654.files.size + value654.notes.size > 0) {
          let value656: Dynamic = await (0, confirmCanvasAction)(
            (0, canvasPageDeleteConfirmation)(
              value654.spec.name,
              value654.files.size,
              value654.notes.size,
              (0, keyboardShortcutLabel)("Z"),
            ),
          );
          (0, clearEscapeReleaseSuppression)();
          value286.current?.focus({
            preventScroll: true,
          });
          if (!value656) return;
        }
        let value655: Dynamic = (0, canvasPageDeleteSnapshot)(
          value73.current,
          input,
        );
        if (!value655) {
          let value656: Dynamic = value224.current
            ? (value73.current.pages ?? []).find(
                (input2?: Dynamic): Dynamic => input2.id === input,
              )
            : undefined;
          value656 && showToast(staleDeleteFailureMessage(value656.name));
          return;
        }
        if (value224.current) {
          if (
            [...value655.files].some(
              (input2?: Dynamic): Dynamic => !value654.files.has(input2),
            ) ||
            [...value655.notes].some(
              (input2?: Dynamic): Dynamic => !value654.notes.has(input2),
            )
          )
            return value653(input);
          value450.current(value655.files, value655.notes, undefined, {
            spec: value655.spec,
            index: value655.index,
          });
          requestAnimationFrame((): Dynamic => {
            ((document as Dynamic).activeElement ===
              (document as Dynamic).body ||
              (document as Dynamic).activeElement === null) &&
              value286.current?.focus({
                preventScroll: true,
              });
          });
        }
      },
      [],
    ),
    value456: Dynamic = (0, reactChromeTheme.useRef)(0),
    value457: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        if (input !== focusedFileRef.current) return;
        let value653: Dynamic = Date.now();
        value653 - value456.current < 1500 ||
          ((value456.current = value653),
          value188(
            context === "self"
              ? options < 2
                ? uiMessage("canvas.designCanvas.thatElementIsARepeating")
                : uiMessage("canvas.designCanvas.thatElementRepeats") +
                  String(options) +
                  " \u2014 its copies are one shared design, so it can\u2019t be dragged out on its own."
              : uiMessage("canvas.designCanvas.thatLayoutHasRepeatingRows"),
          ));
      },
      [value188],
    ),
    value458: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        abandonSelectionGesture();
        if (
          input.files.size > 0 &&
          value449(input.files, input.notes, options)
        )
          return true;
        if (input.notes.size === 0) return false;
        if (input.notes.size === 1)
          return value321([...input.notes][0], options);
        let value653: Dynamic = value73.current.annotations ?? [],
          value654: Dynamic = value653.flatMap(
            (input2?: Dynamic, options2?: Dynamic): Dynamic =>
              input.notes.has(input2.id)
                ? [
                    {
                      spec: input2,
                      index: options2,
                    },
                  ]
                : [],
          );
        return value654.length === 0
          ? false
          : (value413(
              {
                kind: "delete",
                entries: [],
                anns: value654,
              },
              new Set(),
              undefined,
              options,
            ),
            value98({
              ...value73.current,
              annotations: value653.filter(
                (input2?: Dynamic): Dynamic => !input.notes.has(input2.id),
              ),
            }),
            (0, announce)(
              (0, objectsDeletedAnnouncement)(value654.length),
            ),
            true);
      },
      [value449, value321, value98, value413, abandonSelectionGesture],
    ),
    value459: Dynamic = (0, reactChromeTheme.useRef)(value458);
  value459.current = value458;
  let value460: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (copyBoardsToClipboard as Dynamic)({ get doc() { return doc; }, get value177() { return value177; }, get value67() { return value67; } }, ...args),
      [value67, doc],
    ),
    value461: Dynamic = (0, reactChromeTheme.useRef)(new Set()),
    value462: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (pasteBoardsFromClipboard as Dynamic)({ get callback3() { return callback3; }, get callback9() { return callback9; }, get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get value105() { return value105; }, get value218() { return value218; }, get value310() { return value310; }, get value345() { return value345; }, get value383() { return value383; }, get value413() { return value413; }, get value461() { return value461; }, get value62() { return value62; }, get value73() { return value73; }, get value80() { return value80; }, get value91() { return value91; }, get value98() { return value98; } }, ...args),
      [doc, value98, value413, showToast, value62, value105],
    ),
    value463: Dynamic = (0, reactChromeTheme.useRef)(value460);
  value463.current = value460;
  let value464: Dynamic = (0, reactChromeTheme.useRef)(value462);
  value464.current = value462;
  let value465: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (buildSystemClipboardPayload as Dynamic)({ get doc() { return doc; }, get value177() { return value177; }, get value188() { return value188; }, get value73() { return value73; } }, ...args),
      [doc, value188],
    ),
    value466: Dynamic = (0, reactChromeTheme.useRef)(value465);
  value466.current = value465;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!(0, canvasElementSelectionCount)(selection)) return;
    let artboards: Dynamic = selection.artboards,
      notes: Dynamic = selection.notes,
      callback15: Dynamic = (): Dynamic => {
        let artboards2: Dynamic = value73.current.artboards,
          value654: Dynamic = (0, annotationImageReferences)(
            (value73.current.annotations ?? []).filter(
              (input?: Dynamic): Dynamic => notes.has(input.id),
            ),
          );
        for (let value655 of [
          ...(artboards.size > 0
            ? (0, clipboardBlobAssets)(
                artboards2.filter(
                  (input?: Dynamic): Dynamic => artboards.has(input.file),
                ),
                artboards2,
                doc.content().files,
                (0, getExternalFileReferences)(),
              )
            : []),
          ...value654,
        ] as Dynamic)
          (0, getCachedBlobObjectUrl)(value655) === undefined &&
            (0, fetchBlobAsset)(value655).catch((): Dynamic => {});
      };
    if (artboards.size === 0 && notes.size === 1) return callback15();
    let value653: Dynamic = setTimeout(callback15, 150);
    return (): Dynamic => clearTimeout(value653);
  }, [selection, doc]);
  let value467: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (pasteExternalClipboardPayload as Dynamic)({ get callback3() { return callback3; }, get callback9() { return callback9; }, get doc() { return doc; }, get setSelection() { return setSelection; }, get showToast() { return showToast; }, get supportsLoadState() { return supportsLoadState; }, get value105() { return value105; }, get value109() { return value109; }, get value188() { return value188; }, get value189() { return value189; }, get value218() { return value218; }, get value224() { return value224; }, get value310() { return value310; }, get value345() { return value345; }, get value369() { return value369; }, get value383() { return value383; }, get value413() { return value413; }, get value464() { return value464; }, get value62() { return value62; }, get value73() { return value73; }, get value80() { return value80; }, get value98() { return value98; } }, ...args),
      [
        doc,
        supportsLoadState,
        value98,
        value413,
        showToast,
        value188,
        value189,
        value62,
        value105,
      ],
    ),
    value468: Dynamic = (0, reactChromeTheme.useRef)(value467);
  value468.current = value467;
  let value469: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (pasteHtmlIntoArtboard as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get setSelection() { return setSelection; }, get value177() { return value177; }, get value188() { return value188; }, get value189() { return value189; }, get value19() { return value19; }, get value224() { return value224; }, get value313() { return value313; }, get value62() { return value62; }, get value87() { return value87; } }, ...args),
      [value313, value188, value189, value62, abandonSelectionGesture],
    ),
    value470: Dynamic = (0, reactChromeTheme.useRef)(value469);
  value470.current = value469;
  let value471: Dynamic = (0, reactChromeTheme.useRef)(value326);
  value471.current = value326;
  let value472: Dynamic = (0, reactChromeTheme.useRef)(null),
    value473: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = value87.current.artboards
            .filter((input2?: Dynamic): Dynamic => input.has(input2.file))
            .map(
              (input2?: Dynamic): Dynamic =>
                input2.title || input2.file.replace(/\.dc\.html$/, ""),
            ),
          value654: Dynamic = (value87.current.annotations ?? [])
            .filter((input2?: Dynamic): Dynamic => options.has(input2.id))
            .map(
              (input2?: Dynamic): Dynamic =>
                (0, isShapeAnnotation)(input2)
                  ? ""
                  : input2.text.trim(),
            );
        return {
          stamp:
            Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
          rendition:
            [...value653, ...value654].filter(
              (input2?: Dynamic): Dynamic => input2 !== "",
            ).join(`
`) || (input.size > 0 ? "artboard" : ""),
        };
      },
      [],
    ),
    value474: Dynamic = (0, reactChromeTheme.useRef)(undefined),
    value475: Dynamic = (0, reactChromeTheme.useRef)(-1 / 0);
  (0, reactChromeTheme.useEffect)((...args: Dynamic[]): Dynamic => (subscribeClipboardEvents as Dynamic)({ get doc() { return doc; }, get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get value105() { return value105; }, get value109() { return value109; }, get value111() { return value111; }, get value112() { return value112; }, get value113() { return value113; }, get value120() { return value120; }, get value159() { return value159; }, get value160() { return value160; }, get value224() { return value224; }, get value448() { return value448; }, get value463() { return value463; }, get value464() { return value464; }, get value466() { return value466; }, get value468() { return value468; }, get value470() { return value470; }, get value471() { return value471; }, get value472() { return value472; }, get value473() { return value473; }, get value474() { return value474; }, get value475() { return value475; }, get value48() { return value48; }, get value52() { return value52; } }, ...args), [
    value109,
    value111,
    value112,
    doc,
    value473,
    value113,
    value120,
    value105,
  ]);
  let [value476, value477]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value478: Dynamic = (0, reactChromeTheme.useRef)(false),
    value479: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value478.current = input;
        value477(input);
      },
      [],
    ),
    value480: Dynamic = (0, useDownloadsWithheld)(),
    [value481, value482]: Dynamic = (0, reactChromeTheme.useState)(
      emptyCanvasNoteSet,
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value476 || value482(emptyCanvasNoteSet);
  }, [value476]);
  let value483: Dynamic = (0, reactChromeTheme.useCallback)(
      async (input?: Dynamic): Promise<Dynamic> => {
        let callback15: Dynamic = (): Dynamic => {
            let entry: Dynamic = value177.current.get(input);
            return entry != null && entry.isReady()
              ? entry.webviewRef.current
              : null;
          },
          value653: Dynamic = callback15();
        if (value653) return value653;
        if (
          !value87.current.artboards.some(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ) ||
          value177.current.get(input)?.isBlocked()
        )
          return null;
        value99 &&
          !flag &&
          !value345.current &&
          (focusedFileRef.current != null || value271.current != null) &&
          (await value.current?.("preview"),
          value62(),
          value122(null),
          value270(null));
        value482(new Set([input]));
        let value654: Dynamic = Date.now();
        for (; Date.now() - value654 < artboardFrameReadyTimeoutMs; ) {
          await new Promise(
            (input2?: Dynamic): Dynamic => setTimeout(input2, 100),
          );
          let value655: Dynamic = callback15();
          if (value655) return value655;
          if (value177.current.get(input)?.isBlocked()) return null;
        }
        return null;
      },
      [value99, flag, value62],
    ),
    value484: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        value86.artboards.filter(
          (input?: Dynamic): Dynamic => !input.frameless,
        ),
      [value86],
    ),
    value485: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          current5: Dynamic = value80.current,
          length: Dynamic = value84.current.filter(
            (input2?: Dynamic): Dynamic =>
              input2.id !== current5 &&
              current4.artboards.some(
                (input3?: Dynamic): Dynamic =>
                  !input3.frameless &&
                  (0, designPageId)(input3, current4.pages) ===
                    input2.id,
              ),
          ).length;
        return (0, describeExportScope)(input, options, {
          printable: value87.current.artboards.filter(
            (input2?: Dynamic): Dynamic => !input2.frameless,
          ).length,
          otherPages: length,
        });
      },
      [],
    ),
    value486: Dynamic = (0, useExportPicker)({
      artboards: value484,
      enter: (): Dynamic => {
        value346.current !== null ? value297.current() : value270(null);
        value339.current !== "select" &&
          (value338("select"),
          value341((input?: Dynamic): Dynamic => input + 1));
        let entry: Dynamic = value105.get(),
          current4: Dynamic = value80.current;
        value314(emptyBoardSelection, "replace");
        value296.current = exportPickerChromeHeight;
        value292.current();
        return (): Dynamic => {
          value296.current = 0;
          !(value80.current !== current4 || value271.current !== null) &&
            (value346.current !== null
              ? value348(
                  (input?: Dynamic): Dynamic =>
                    input && {
                      ...input,
                      prev: entry,
                    },
                )
              : value105.set(entry, true));
        };
      },
      onLapse: (): Dynamic =>
        showToast(
          uiMessage("canvas.designCanvas.noArtboardWasChosenIn"),
        ),
      onStage: reportExportDeliveryEvent,
      homeFocus: (): Dynamic =>
        callback11(focusedFileRef.current) ??
        value106.current?.querySelector(
          "[data-mega-title-text]:not([inert])",
        ) ??
        null,
    }),
    {
      choose: value487,
      isUp: value488,
      end: value489,
      pick: value490,
      leave: value491,
    }: Dynamic = value486,
    value492: Dynamic = value486.session !== null;
  value294.current = value492;
  let value493: Dynamic = value476 || value492,
    value494: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value478.current || value488(),
      [value488],
    ),
    value495: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (runWithPlayPreviewClosed as Dynamic)({ get value106() { return value106; }, get value177() { return value177; }, get value270() { return value270; }, get value271() { return value271; }, get value275() { return value275; }, get value297() { return value297; }, get value346() { return value346; }, get value348() { return value348; }, get value387() { return value387; }, get value392() { return value392; }, get value488() { return value488; }, get value87() { return value87; }, get value92() { return value92; } }, ...args),
      [value275, value92, value488],
    ),
    value496: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        value490(input.files, options === "toggle"),
      [value490],
    ),
    callback13: Dynamic = (input?: Dynamic): Dynamic => {
      let value653: Dynamic = value484.find(
        (input2?: Dynamic): Dynamic => input2.file === input,
      );
      return value653 ? (
        <ExportArtboardPickTarget
          artboard={value653}
          picker={value486}
        />
      ) : null;
    },
    value497: Dynamic = !flag && !value99 && !value220 && value484.length > 1,
    value498: Dynamic = value92 ? "unicode" : "winansi",
    value499: Dynamic = value92,
    value500: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      value491() &&
        showToast(
          uiMessage("canvas.designCanvas.leavingThatViewCancelledThe"),
        );
    }, [value491, showToast]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value500();
  }, [value79, value500]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    (value347 != null || value269 != null || value220) && value500();
  }, [value347, value269, value220, value500]);
  let value501: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (fitArtboardHeightToContent as Dynamic)({ get callback2() { return callback2; }, get editableRef() { return editableRef; }, get hideToast() { return hideToast; }, get showToast() { return showToast; }, get value177() { return value177; }, get value399() { return value399; }, get value479() { return value479; }, get value483() { return value483; }, get value494() { return value494; }, get value495() { return value495; }, get value73() { return value73; }, get value87() { return value87; } }, ...args),
      [
        value483,
        value494,
        hideToast,
        value399,
        value479,
        showToast,
        value495,
      ],
    ),
    value502: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        if (!value92 || flag || !editable) return false;
        let value653: Dynamic = value73.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        return (
          value653 !== undefined && (0, needsPagedExport)(value653)
        );
      },
      [editable, value92, flag],
    ),
    value503: Dynamic = (0, reactChromeTheme.useCallback)(
      (
        items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653: Dynamic = false,
      ): Dynamic => {
        let items2: Dynamic = [...callback2(items[0] ?? "")],
          value654: Dynamic =
            items.length > 1
              ? uiMessage("canvas.designCanvas.fit2") + String(items.length) + " frames to content"
              : options
                ? uiMessage("canvas.designCanvas.fit3") +
                  (items2.length > 24
                    ? items2.slice(0, 23).join("") + "\u2026"
                    : items2.join("")) +
                  '" to content'
                : uiMessage("canvas.designCanvas.fitHeightToContent");
        value653 ||
          (window as Dynamic).setTimeout(
            context,
            canvasExportSettleTimeoutMs,
          );
        return (
          <Button
            size={"sm"}
            data-testid={"dc-fit-height"}
            onClick={(): Dynamic => {
              value501(items, context);
            }}
          >
            {value654}
          </Button>
        );
      },
      [value501],
    ),
    value504: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (exportArtboardAsPng as Dynamic)({ get hideToast() { return hideToast; }, get showToast() { return showToast; }, get value177() { return value177; }, get value479() { return value479; }, get value480() { return value480; }, get value483() { return value483; }, get value485() { return value485; }, get value493() { return value493; }, get value502() { return value502; }, get value503() { return value503; }, get value67() { return value67; }, get value93() { return value93; } }, ...args),
      [
        value480,
        value483,
        value493,
        value67.artboards,
        value93,
        value502,
        value503,
        hideToast,
        value485,
        showToast,
      ],
    ),
    value505: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (copyArtboardAsPng as Dynamic)({ get hideToast() { return hideToast; }, get showToast() { return showToast; }, get value177() { return value177; }, get value479() { return value479; }, get value480() { return value480; }, get value483() { return value483; }, get value494() { return value494; }, get value502() { return value502; }, get value503() { return value503; }, get value87() { return value87; }, get value93() { return value93; } }, ...args),
      [
        value480,
        value483,
        value494,
        value93,
        value502,
        value503,
        hideToast,
        value479,
        showToast,
      ],
    ),
    value506: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (copyArtboardAsSvg as Dynamic)({ get hideToast() { return hideToast; }, get showToast() { return showToast; }, get value177() { return value177; }, get value479() { return value479; }, get value480() { return value480; }, get value483() { return value483; }, get value494() { return value494; }, get value502() { return value502; }, get value503() { return value503; }, get value87() { return value87; }, get value93() { return value93; } }, ...args),
      [
        value480,
        value483,
        value494,
        value93,
        value502,
        value503,
        hideToast,
        value479,
        showToast,
      ],
    ),
    value507: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (exportArtboardSourceZip as Dynamic)({ get assets() { return assets; }, get doc() { return doc; }, get showToast() { return showToast; }, get value177() { return value177; }, get value479() { return value479; }, get value480() { return value480; }, get value493() { return value493; }, get value73() { return value73; } }, ...args),
      [assets, doc, value480, value493, showToast],
    ),
    value508: Dynamic = (0, reactChromeTheme.useCallback)(
      async (input?: Dynamic): Promise<Dynamic> => {
        let value653: Dynamic = await Promise.all(
          input.map((input2?: Dynamic): Dynamic => {
            let entry: Dynamic = value177.current.get(input2),
              value654: Dynamic =
                entry !== undefined && entry.isReady()
                  ? (0, createPreviewHandle)(entry.webviewRef.current)
                  : null;
            return value654 === null
              ? Promise.resolve(null)
              : (0, collectArtboardFontDescriptors)(value654);
          }),
        );
        return value653.every((input2?: Dynamic): Dynamic => input2 !== null)
          ? value653.flat()
          : undefined;
      },
      [],
    ),
    value509: Dynamic = (0,
    reactChromeTheme.useCallback)((...args: Dynamic[]): Dynamic => (produceStandaloneHtml as Dynamic)({ get assets() { return assets; }, get doc() { return doc; }, get filePath() { return filePath; }, get value177() { return value177; }, get value346() { return value346; }, get value508() { return value508; }, get value73() { return value73; }, get value80() { return value80; }, get value92() { return value92; } }, ...args), [value508, assets, doc, value92, filePath]),
    value510: Dynamic = (0, reactChromeTheme.useRef)(undefined),
    value511: Dynamic = (0,
    reactChromeTheme.useCallback)(async (): Promise<Dynamic> => {
      value510.current = undefined;
      try {
        let value653: Dynamic = await value509();
        (0, reportExportEvent)("htmlBuilt");
        return value653;
      } catch (value653: Dynamic) {
        value510.current = value653;
        console.error("[design/export]", value653);
        let value654: Dynamic =
          value653 instanceof ExportHtmlError
            ? value653.code
            : undefined;
        throw (
          value654 === "too_large"
            ? (0, reportExportEvent)("tooLarge")
            : value654 !== "not_loaded" &&
              value654 !== "empty" &&
              value654 !== "timeout" &&
              (0, reportExportEvent)("failed"),
          showToast(
            value653 instanceof ExportHtmlError &&
              value653.code === "too_large"
              ? // MineDesign: the export limit is no longer 16 MB (export/downloads.tsx).
                uiMessage("canvas.designCanvas.thisDesignIsTooLarge", { value1: String(String(ExportDownloadsResolvedValue >> 20)) })
              : value653 instanceof ExportHtmlError &&
                  value653.code === "not_loaded"
                ? uiMessage("canvas.designCanvas.anArtboardIsStillLoading")
                : value653 instanceof ExportHtmlError &&
                    value653.code === "timeout"
                  ? uiMessage("canvas.designCanvas.preparingThisDesignToSend")
                  : uiMessage("canvas.designCanvas.couldnTPrepareThisDesign") +
                    (0, errorMessage)(value653) +
                    ".",
            "error",
          ),
          value653
        );
      }
    }, [value509, showToast]),
    value512: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value510.current;
        (0, reportExportOutcome)(
          (0, classifyHtmlDelivery)(
            input,
            current4 instanceof ExportHtmlError
              ? current4.code
              : undefined,
          ),
          designAnalyticsEvents.exported.html,
        );
      },
      [],
    ),
    value513: Dynamic = (0, reactChromeTheme.useCallback)(
      async (input?: Dynamic): Promise<Dynamic> => {
        if (value493) return;
        if (value480) {
          showToast(DownloadsArenTAvailableToYouForMessage);
          return;
        }
        let value653: Dynamic = value67.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (value653) {
          value479(true);
          try {
            let value654: Dynamic = await value483(input);
            if (!value654 || value654.getBoundingClientRect().width === 0) {
              showToast(
                value177.current.get(input)?.isBlocked()
                  ? uiMessage("canvas.designCanvas.thisArtboardSPreviewIs")
                  : uiMessage("canvas.designCanvas.thisArtboardIsnTVisible"),
              );
              healthReporter.report(
                ...(0, classifyExportAbort)("pdf"),
              );
              return;
            }
            let value655: Dynamic;
            await (0, exportPdfWithFeedback)(
              [value653],
              (): Dynamic => value654,
              value653.title ?? (0, exportBaseFileName)(input),
              (...input2: Dynamic[]): Dynamic =>
                (value655 = showToast(...input2)),
              {
                rules: value93,
                textEncoding: value498,
                tagged: value499,
                scope: value485(1, "one"),
              },
              {
                eligible: value502,
                action: (
                  input2?: Dynamic,
                  options?: Dynamic,
                  context?: Dynamic,
                ): Dynamic =>
                  value503(
                    input2,
                    options,
                    (): Dynamic =>
                      value655 !== undefined && hideToast(value655),
                    context,
                  ),
              },
            );
          } finally {
            value479(false);
          }
        }
      },
      [
        value480,
        value483,
        value493,
        value67.artboards,
        value93,
        value502,
        value503,
        hideToast,
        value499,
        value498,
        value485,
        showToast,
      ],
    ),
    value514: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options: Dynamic = 2): Dynamic => {
        let value653: Dynamic = input
          ? (0, selectedExportableArtboards)(
              value87.current.artboards,
              input,
            )
          : value484;
        if (input && value653.length < options)
          return {
            ok: false,
            reason:
              options > 1
                ? exportSelectionHint
                : uiMessage("canvas.designCanvas.noneOfTheArtboardsYou"),
            stopped: false,
          };
        if (value653.length === 0)
          return {
            ok: false,
            reason: noExportableArtboardsMessage,
            stopped: false,
          };
        let value654: Dynamic = value653.find(
          (input2?: Dynamic): Dynamic =>
            value177.current.get(input2.file)?.isBlocked(),
        );
        return value654
          ? {
              ok: false,
              reason:
                '"' +
                (value654.title ??
                  (0, exportBaseFileName)(value654.file)) +
                '"\u2019s preview is stopped \u2014 reload it before exporting.',
              stopped: true,
            }
          : {
              ok: true,
              printable: value653,
            };
      },
      [value484],
    ),
    value515: Dynamic = (0, reactChromeTheme.useCallback)(
      async (input?: Dynamic): Promise<Dynamic> => {
        if (value493) return;
        if (value480) {
          showToast(DownloadsArenTAvailableToYouForMessage);
          return;
        }
        let value653: Dynamic = value514(input);
        if (!value653.ok) {
          showToast(value653.reason);
          value653.stopped &&
            healthReporter.report(
              ...(0, classifyExportAbort)("pdf"),
            );
          return;
        }
        value479(true);
        try {
          let value654: Dynamic;
          await value495(
            value653.printable,
            (): Dynamic =>
              (0, exportPdfWithFeedback)(
                value653.printable,
                value483,
                input
                  ? ((0, sanitizeExportFileName)(
                      (document as Dynamic).title,
                      100,
                    ) || "design") + "-selection"
                  : (document as Dynamic).title || "design",
                (...input2: Dynamic[]): Dynamic =>
                  (value654 = showToast(...input2)),
                {
                  rules: value93,
                  textEncoding: value498,
                  tagged: value499,
                  scope: value485(value653.printable.length, "whole"),
                },
                {
                  eligible: value502,
                  action: (
                    input2?: Dynamic,
                    options?: Dynamic,
                    context?: Dynamic,
                  ): Dynamic =>
                    value503(
                      input2,
                      options,
                      (): Dynamic =>
                        value654 !== undefined && hideToast(value654),
                      context,
                    ),
                },
              ),
          );
        } finally {
          value479(false);
        }
      },
      [
        value514,
        value480,
        value483,
        value493,
        value93,
        value502,
        value503,
        hideToast,
        value499,
        value498,
        value485,
        showToast,
        value495,
      ],
    ),
    value516: Dynamic = (0, reactChromeTheme.useRef)({
      notes: [],
      refused: false,
    }),
    value517: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (producePdfExport as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get showToast() { return showToast; }, get value346() { return value346; }, get value478() { return value478; }, get value479() { return value479; }, get value483() { return value483; }, get value484() { return value484; }, get value485() { return value485; }, get value487() { return value487; }, get value489() { return value489; }, get value494() { return value494; }, get value495() { return value495; }, get value497() { return value497; }, get value498() { return value498; }, get value499() { return value499; }, get value502() { return value502; }, get value514() { return value514; }, get value516() { return value516; }, get value92() { return value92; }, get value93() { return value93; } }, ...args),
      [
        value514,
        value497,
        value487,
        value489,
        value483,
        value494,
        value93,
        value92,
        value502,
        value499,
        value498,
        value484,
        value485,
        value479,
        showToast,
        value495,
      ],
    ),
    value518: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let { notes: current4, refused: current5 }: Dynamic =
          value516.current;
        (0, reportExportOutcome)(
          (0, classifyPdfDelivery)(input, current5),
          designAnalyticsEvents.exported.pdf,
        );
        input.outcome === "delivered" &&
          current4.length > 0 &&
          showToast(
            current4[0],
            undefined,
            current4.length > 1
              ? {
                  description: current4.slice(1).join(" "),
                }
              : undefined,
          );
      },
      [showToast],
    ),
    value519: Dynamic = (0, reactChromeTheme.useRef)({
      notes: [],
      refused: false,
    }),
    value520: Dynamic = (0, reactChromeTheme.useRef)(null),
    value521: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (captureArtboardPngsForExport as Dynamic)({ get showToast() { return showToast; }, get value177() { return value177; }, get value479() { return value479; }, get value483() { return value483; }, get value485() { return value485; }, get value489() { return value489; }, get value519() { return value519; }, get value93() { return value93; } }, ...args),
      [value489, value483, value93, value485, value479, showToast],
    ),
    value522: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (producePngExport as Dynamic)({ get callback2() { return callback2; }, get focusedFileRef() { return focusedFileRef; }, get selectionRef() { return selectionRef; }, get showToast() { return showToast; }, get value177() { return value177; }, get value346() { return value346; }, get value478() { return value478; }, get value479() { return value479; }, get value483() { return value483; }, get value484() { return value484; }, get value485() { return value485; }, get value487() { return value487; }, get value489() { return value489; }, get value494() { return value494; }, get value497() { return value497; }, get value502() { return value502; }, get value519() { return value519; }, get value520() { return value520; }, get value521() { return value521; }, get value87() { return value87; }, get value93() { return value93; } }, ...args),
      [
        value497,
        value487,
        value489,
        value483,
        value494,
        value93,
        value502,
        value484,
        value521,
        value485,
        value479,
        showToast,
      ],
    ),
    value523: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let { notes: current4, refused: current5 }: Dynamic =
          value519.current;
        (0, reportExportOutcome)(
          (0, classifyImageDelivery)(input, current5),
          designAnalyticsEvents.exported.png,
        );
        input.outcome === "delivered" &&
          current4.length > 0 &&
          showToast(
            current4[0],
            undefined,
            current4.length > 1
              ? {
                  description: current4.slice(1).join(" "),
                }
              : undefined,
          );
      },
      [showToast],
    ),
    value524: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic =>
        input.format === "pdf"
          ? value518(input)
          : input.format === "png"
            ? value523(input)
            : value512(input),
      [value512, value518, value523],
    );
  (0, useExportFormats)(
    value480
      ? null
      : [
          {
            format: "html",
            produce: value511,
          },
          {
            format: "pdf",
            produce: value517,
            interactive: value92 && value497,
            disabled: value484.length === 0,
          },
          ...(value92
            ? [
                {
                  format: "png",
                  produce: value522,
                  interactive: value497,
                  bundle: value497,
                  disabled:
                    value484.length === 0 ||
                    (value347 !== null &&
                      !value484.some(
                        (input?: Dynamic): Dynamic =>
                          input.file === value347.file,
                      )),
                },
              ]
            : []),
        ],
    {
      onResult: value524,
    },
  );
  let [value525, value526]: Dynamic = (0, npm_useLocalStorage_QP)(
      DcEditorModeKey,
      null,
    ),
    value527: Dynamic = (0, reactChromeTheme.useRef)(0);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value527.current++;
  }, [value95, value525]);
  let value528: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        abandonSelectionGesture();
        value345.current && value297.current();
        setMode("edit");
        value62();
        setSelection((0, selectionFromArtboards)(new Set([input])));
        let value653: Dynamic = ++value527.current;
        value273(input).then((input2?: Dynamic): Dynamic => {
          !input2 ||
            value653 !== value527.current ||
            (value96(true), value526("tweaks"));
        });
      },
      [value62, value273, value96, value526, abandonSelectionGesture],
    ),
    value529: Dynamic = (0, getTweakSelection)(
      editing,
      value95,
      value525,
      value121,
    ),
    value530: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        if (input !== value529) return value528(input);
        value527.current++;
        value96(false);
      },
      [value528, value96, value529],
    ),
    value531: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        abandonSelectionGesture();
        setMode("edit");
        value62();
        setSelection((0, selectionFromArtboards)(new Set([input])));
        value175((input2?: Dynamic): Dynamic => input2 + 1);
      },
      [value62, abandonSelectionGesture],
    ),
    value532: Dynamic = value173?.file ?? null,
    value533: Dynamic = (0, reactChromeTheme.useRef)(value532);
  value533.current = value532;
  let value534: Dynamic = (0, reactChromeTheme.useRef)({
      timer: null,
      pending: null,
    }),
    [value535, value536]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value537: Dynamic = (0, reactChromeTheme.useRef)(0),
    value538: Dynamic = (0, reactChromeTheme.useRef)(0),
    value539: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let value653: Dynamic =
          input == null ? undefined : value177.current.get(input);
        if (input == null || !value653) return void value536(null);
        if (value538.current > 0 || value534.current.pending?.file === input)
          return;
        let current4: Dynamic = value537.current;
        value653.pageFill().then(
          (input2?: Dynamic): Dynamic => {
            value533.current === input &&
              value537.current === current4 &&
              value536(
                input2
                  ? {
                      file: input,
                      ...input2,
                    }
                  : null,
              );
          },
          (): Dynamic => {},
        );
      },
      [],
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => value539(value532),
    [value532, value232, value235, value182, value539],
  );
  let value540: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        value537.current += 1;
        value536((input2?: Dynamic): Dynamic => {
          let value653: Dynamic = input2?.file === input,
            state: Dynamic = {
              file: input,
              background: value653 ? input2.background : "",
              backgroundColor: value653 ? input2.backgroundColor : "",
              vars: value653 ? input2.vars : {},
            };
          for (let value654 of options as Dynamic)
            value654.prop === "background"
              ? (state.background = value654.value ?? "")
              : value654.prop === "background-color" &&
                (state.backgroundColor = value654.value ?? "");
          return state;
        });
        let callback15: Dynamic = (
          input2?: Dynamic,
          options2?: Dynamic,
        ): Dynamic => {
          value538.current += 1;
          let callback17: Dynamic = (): Dynamic => {
            value538.current -= 1;
            value538.current === 0 &&
              value534.current.pending == null &&
              value539(value533.current);
          };
          return (
            value177.current.get(input2)?.setPageFill(options2) ??
            Promise.resolve(false)
          ).then((input3?: Dynamic): Dynamic => {
            input3 &&
              (0, announce)(
                (0, backgroundEditAnnouncement)(options2),
              );
            callback17();
          }, callback17);
        };
        if (input === focusedFileRef.current)
          return void callback15(input, options);
        let current4: Dynamic = value534.current;
        current4.pending = {
          file: input,
          edits: options,
        };
        if (current4.timer != null) return;
        let callback16: Dynamic = (): Dynamic => {
          current4.timer = null;
          let pending: Dynamic = current4.pending;
          current4.pending = null;
          pending &&
            (callback15(pending.file, pending.edits),
            (current4.timer = setTimeout(callback16, 150)));
        };
        callback16();
      },
      [value539],
    ),
    value541: Dynamic = (0, reactChromeTheme.useMemo)((...args: Dynamic[]): Dynamic => (deriveAnnotationSettings as Dynamic)({ get value168() { return value168; }, get value169() { return value169; }, get value420() { return value420; }, get value421() { return value421; }, get value422() { return value422; }, get value423() { return value423; }, get value424() { return value424; }, get value67() { return value67; } }, ...args), [
      value169,
      value168,
      value67,
      value420,
      value421,
      value422,
      value423,
      value424,
    ]),
    value542: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        value173
          ? {
              ...value173,
              fill: value535?.file === value173.file ? value535 : null,
              onSetPrint: (input?: Dynamic): Dynamic =>
                value398(value173.file, input),
              onSetPaper: (input?: Dynamic): Dynamic =>
                value400(value173.file, input),
              onSetSize: (input?: Dynamic, options?: Dynamic): Dynamic =>
                value399(value173.file, input, options),
              ...(value502(value173.file)
                ? {
                    onFitHeight: (): Dynamic => {
                      value501([value173.file]);
                    },
                  }
                : {}),
              onSetFill: (input?: Dynamic): Dynamic =>
                value540(value173.file, input),
              onSetRadius: (input?: Dynamic, options?: Dynamic): Dynamic =>
                value402(value173.file, input, options),
              onSetGuides: (input?: Dynamic): Dynamic =>
                value401(value173.file, input, false),
              onLiveGuides: (input?: Dynamic): Dynamic =>
                value401(value173.file, input, true),
              onLiveEnd: (): Dynamic =>
                value401(
                  value173.file,
                  value73.current.artboards.find(
                    (input?: Dynamic): Dynamic =>
                      input.file === value173.file,
                  )?.guides ?? [],
                  false,
                ),
            }
          : null,
      [
        value173,
        value535,
        value501,
        value502,
        value398,
        value400,
        value399,
        value540,
        value401,
        value402,
      ],
    ),
    [value543, value544]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => new Set(value121 ? [value121] : []),
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value121 != null &&
      value544(
        (input?: Dynamic): Dynamic =>
          input.has(value121) ? input : new Set([...input, value121]),
      );
  }, [value121]);
  let [value545, value546]: Dynamic = (0, reactChromeTheme.useState)(
      {},
    ),
    [value547, value548]: Dynamic = (0, reactChromeTheme.useState)(
      {},
    ),
    value549: Dynamic = (0, reactChromeTheme.useRef)(value547);
  value549.current = value547;
  let value550: Dynamic = (0, reactChromeTheme.useCallback)(
    (): Dynamic =>
      (0, selectionAnnouncement)(
        selectionRef.current,
        value549.current,
        (input?: Dynamic): Dynamic =>
          value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          )?.title ?? input.replace(/\.dc\.html$/, ""),
        (input?: Dynamic): Dynamic => {
          let value653: Dynamic = (value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
          return value653 == null || !(0, isShapeAnnotation)(value653)
            ? "note"
            : value653.kind === "image"
              ? value653.video !== undefined
                ? "video"
                : "picture"
              : "shape";
        },
      ),
    [],
  );
  value21.current = value550;
  let value551: Dynamic = (0, reactChromeTheme.useRef)(0),
    [value552]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => ({
        key: null,
        refocusAt: 0,
      }),
    ),
    value553: Dynamic = value67.artboards.map(
      (input?: Dynamic): Dynamic => input.file,
    ).join(`
`),
    value554: Dynamic = value86.artboards.map(
      (input?: Dynamic): Dynamic => input.file,
    ).join(`
`);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let values: Dynamic = new Set(
        value553.split(`
`),
      ),
      callback15: Dynamic = (input?: Dynamic): Dynamic => {
        let value653: Dynamic = Object.keys(input).filter(
          (input2?: Dynamic): Dynamic => !values.has(input2),
        );
        if (value653.length === 0) return input;
        let state: Dynamic = {
          ...input,
        };
        for (let value654 of value653 as Dynamic) delete state[value654];
        return state;
      };
    value544((input?: Dynamic): Dynamic => {
      let values2: Dynamic = new Set(
        [...input].filter((input2?: Dynamic): Dynamic => values.has(input2)),
      );
      return values2.size === input.size ? input : values2;
    });
    value548(callback15);
    value546(callback15);
    value178.current?.keeper.prune();
  }, [value553]);
  let value555: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let entry: Dynamic = value177.current.get(input);
        if (!entry) return;
        let value653: Dynamic = doc.content().files[input] ?? "";
        entry.ensureOutline().then((items?: Dynamic): Dynamic => {
          if (value177.current.has(input)) {
            if ((doc.content().files[input] ?? "") !== value653)
              return value555(input);
            (items == null && (0, isLoadingArtboardHtml)(value653)) ||
              (items != null &&
                items.length === 0 &&
                value73.current.artboards.some(
                  (input2?: Dynamic): Dynamic =>
                    input2.file === input && input2.frameless,
                ) &&
                value129(
                  (input2?: Dynamic): Dynamic =>
                    input2.has(input) ? input2 : new Set([...input2, input]),
                ),
              value548((input2?: Dynamic): Dynamic => {
                let value654: Dynamic =
                    items ??
                    ((0, OutlineGlyphsTest)(value653) ? null : []),
                  value655: Dynamic = input2[input];
                return (
                  value655 === undefined
                    ? false
                    : value655 === null || value654 === null
                      ? value655 === value654
                      : layerEntriesEqual(value655, value654)
                )
                  ? input2
                  : {
                      ...input2,
                      [input]: value654,
                    };
              }));
          }
        });
      },
      [doc],
    ),
    value556: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => new idleTaskScheduler(value555),
      [value555],
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (): Dynamic => value556.dispose(),
    [value556],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value554
      ? value554.split(`
`)
      : [];
    value556.retain((input?: Dynamic): Dynamic => value653.includes(input));
    value556.add(value653);
  }, [value554, value556]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value554 &&
      value556.add(
        value554
          .split(
            `
`,
          )
          .filter(
            (input?: Dynamic): Dynamic =>
              value549.current[input] === undefined,
          ),
      );
  }, [value554, value182, value556]);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      (0, subscribeHtmlReferences)(
        (input?: Dynamic): Dynamic =>
          value556.add(
            input.filter(
              (input2?: Dynamic): Dynamic => value177.current.has(input2),
            ),
          ),
      ),
    [value556],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback15: Dynamic = (input?: Dynamic): Dynamic => {
      let value653: Dynamic = input.detail?.paths ?? [],
        value654: Dynamic = value653.filter(
          (input2?: Dynamic): Dynamic =>
            !value177.current.has(input2) &&
            value549.current[input2] !== undefined,
        );
      value654.length > 0 &&
        value548((input2?: Dynamic): Dynamic => {
          let state: Dynamic = {
            ...input2,
          };
          for (let value655 of value654 as Dynamic) delete state[value655];
          return state;
        });
      value556.add(
        value653.filter(
          (input2?: Dynamic): Dynamic => value177.current.has(input2),
        ),
      );
    };
    (window as Dynamic).addEventListener(
      remoteFilesEventName,
      callback15,
    );
    return (): Dynamic =>
      (window as Dynamic).removeEventListener(
        remoteFilesEventName,
        callback15,
      );
  }, [value556]);
  let value557: Dynamic = (0, reactChromeTheme.useRef)(undefined);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let current4: Dynamic = value557.current;
    value557.current = value121;
    current4 === undefined
      ? value121 != null &&
        value556.add([value121], {
          front: true,
        })
      : current4 !== null && current4 !== value121 && value555(current4);
  }, [value121, value556, value555]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let items: Dynamic = [...value234.current];
    value234.current.clear();
    for (let value653 of items as Dynamic) value555(value653);
  }, [value235, value555]);
  let value558: Dynamic = (0, reactChromeTheme.useCallback)(
    (input?: Dynamic): Dynamic =>
      value105.glide(
        (input2?: Dynamic): Dynamic =>
          (0, isArtboardInViewport)(input2, input, value120()),
      ),
    [value105, value120],
  );
  value383.current = value558;
  let value559: Dynamic = (0, reactChromeTheme.useCallback)(
    (input?: Dynamic): Dynamic => {
      let value653: Dynamic = value87.current.artboards.find(
        (input2?: Dynamic): Dynamic => input2.file === input,
      );
      if (value653) {
        if (value345.current) {
          value653.file !== value346.current &&
            value348(
              (input2?: Dynamic): Dynamic =>
                input2 && {
                  file: value653.file,
                  prev: input2.prev,
                  fit: artboardIsNotExpandedFill(value653),
                },
            );
          return;
        }
        value558(value653);
      }
    },
    [value558],
  );
  value382.current = value559;
  let value560: Dynamic = (0, currentCanvasPlaceFragment)(
      selection,
      value347?.file ?? null,
      value79,
      !flag,
    ),
    value561: Dynamic = (0, reactChromeTheme.useRef)(value560);
  value561.current = value560;
  let value562: Dynamic = (0, reactChromeTheme.useRef)(
      (): Dynamic => null,
    ),
    value563: Dynamic = (0, reactChromeTheme.useRef)(null);
  value562.current = (...args: Dynamic[]): Dynamic => (navigateToCanvasPlace as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get setSelection() { return setSelection; }, get value105() { return value105; }, get value2() { return value2; }, get value224() { return value224; }, get value225() { return value225; }, get value273() { return value273; }, get value275() { return value275; }, get value284() { return value284; }, get value291() { return value291; }, get value298() { return value298; }, get value310() { return value310; }, get value346() { return value346; }, get value380() { return value380; }, get value559() { return value559; }, get value563() { return value563; }, get value62() { return value62; }, get value73() { return value73; }, get value80() { return value80; } }, ...args);
  let value564: Dynamic = (0, reactChromeTheme.useRef)(null);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if ((0, embedMemoryPrefix)() !== "") return;
    let value653: Dynamic = (0, createPlaceLinkReporter)();
    value564.current = value653;
    let value654: Dynamic = (0, observeGotoAnchorMessages)(
        (input?: Dynamic): Dynamic => {
          let value656: Dynamic = value562.current(input);
          value656 !== null && (0, rememberPlaceLink)("goto", input);
          value653.answer(value656 ?? value561.current);
        },
      ),
      value655: Dynamic = (0, classifyPlaceLink)();
    value655 !== null &&
      ((0, rememberPlaceLink)("link", value655.place),
      value655.why !== "known" &&
        value562.current(value655.place, value655.why === "here"));
    return (): Dynamic => {
      value654();
      value653.stop();
      value564.current = null;
    };
  }, []);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value564.current?.report(value560);
  }, [value560]);
  let [value565, value566]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value567: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        value565 === null || value481.has(value565)
          ? value481
          : new Set([...value481, value565]),
      [value481, value565],
    ),
    value568: Dynamic = (0, reactChromeTheme.useRef)(null),
    [value569]: Dynamic = (0, reactChromeTheme.useState)(
      createFindNavigationOriginTracker,
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => value569.pageIs(value79),
    [value569, value79],
  );
  let value570: Dynamic = (0, reactChromeTheme.useMemo)(
      (...args: Dynamic[]): Dynamic => (buildFindCanvasAdapter as Dynamic)({ get doc() { return doc; }, get value105() { return value105; }, get value106() { return value106; }, get value120() { return value120; }, get value177() { return value177; }, get value2() { return value2; }, get value271() { return value271; }, get value275() { return value275; }, get value291() { return value291; }, get value298() { return value298; }, get value345() { return value345; }, get value346() { return value346; }, get value379() { return value379; }, get value382() { return value382; }, get value566() { return value566; }, get value568() { return value568; }, get value569() { return value569; }, get value73() { return value73; }, get value80() { return value80; }, get value99() { return value99; } }, ...args),
      [
        value105,
        doc,
        value99,
        value120,
        value298,
        value62,
        value569,
        value275,
      ],
    ),
    value571: Dynamic = (0, reactChromeTheme.useCallback)(
      (event?: Dynamic): Dynamic => {
        let current4: Dynamic = focusedFileRef.current;
        if (
          !value357.current ||
          current4 == null ||
          !selectionRef.current.elements.has(current4) ||
          (0, hasBlockingEditorOverlay)() ||
          value.current === null ||
          value271.current === current4 ||
          value218.current ||
          value193.current != null
        )
          return false;
        let target: Dynamic = event.target;
        if (
          target == null ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName ?? "") ||
          target.isContentEditable === true ||
          (0, isEditingInputTarget)(event.target)
        )
          return false;
        try {
          let value653: Dynamic =
            value177.current.get(current4)?.webviewRef.current
              ?.contentDocument;
          return value653?.querySelector(
            "[data-dc-editor-dragging],[data-dc-editor-drag-proxy],[data-dc-editor-marquee]",
          ) != null ||
            (target.ownerDocument === value653 &&
              value653?.querySelector("svg[data-dc-editor-overlay]") != null)
            ? false
            : target.ownerDocument === document ||
                target.ownerDocument === value653;
        } catch {
          return false;
        }
      },
      [],
    ),
    value572: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => doc.subscribe((): Dynamic => input()),
      [doc],
    ),
    value573: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let items: Dynamic = [
          value572(input),
          doc.subscribeSave((): Dynamic => input()),
        ];
        return (): Dynamic =>
          items.forEach((input2?: Dynamic): Dynamic => input2());
      },
      [doc, value572],
    ),
    value574: Dynamic = (0, useArtboardKeyRouting)({
      host: value570,
      enabled: !value283 && !value492,
      onEnter: (): Dynamic => value275((): Dynamic => {}),
      settle: value275,
      textEditOpen: (): Dynamic => value2.current?.() === true,
      ownsStepChord: value571,
      pageOwnsKeys: (input?: Dynamic): Dynamic =>
        value271.current === input || (value346.current === input && true),
      subscribe: value572,
      textEditIn: (): Dynamic =>
        value2.current?.() === true ? focusedFileRef.current : null,
      editBeganFromStop: (): Dynamic =>
        value24.current?.editBeganFromStop() ?? null,
      walkInside: (): Dynamic => value24.current?.insideRef.current ?? null,
      stopOf: callback11,
    });
  value165.current = {
    booted: value574.frameBooted,
    seen: value574.frameSeen,
    gone: value574.frameGone,
  };
  let { changed: value575 }: Dynamic = value574,
    value576: Dynamic = value347?.file ?? null;
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => value575(),
    [value575, value79, value576, value269, value232, value235, value82],
  );
  let value577: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          value653: Dynamic = (0, findArtboardByName)(
            current4.artboards,
            input,
            (input2?: Dynamic): Dynamic =>
              (0, designPageId)(input2, current4.pages) ===
              value80.current,
          );
        if (value653 === null || value653 === "ambiguous") {
          let value655: Dynamic = (0, isEditableComponentName)(
              value19(input),
            )
              ? value19(input)
              : uiMessage("canvas.designCanvas.thatComponent"),
            value656: Dynamic = [
              ...new Set(
                current4.artboards
                  .filter(
                    (input2?: Dynamic): Dynamic =>
                      value19(input2.file) === value19(input),
                  )
                  .map(
                    (input2?: Dynamic): Dynamic =>
                      (0, designPageId)(input2, current4.pages),
                  ),
              ),
            ].map(
              (input2?: Dynamic): Dynamic =>
                current4.pages?.find(
                  (input3?: Dynamic): Dynamic => input3.id === input2,
                )?.name ?? uiMessage("canvas.designCanvas.thisPage2"),
            );
          showToast(
            value653
              ? uiMessage("canvas.designCanvas.thereSMoreThanOne", { value1: String(value655), value2: String(value656.join(", ")) })
              : uiMessage("canvas.designCanvas.thereSNoValue1Artboard", { value1: String(value655) }),
          );
          return;
        }
        value345.current && value297.current();
        abandonSelectionGesture();
        value62();
        let value654: Dynamic = (0, designPageId)(
          value653,
          current4.pages,
        );
        value654 !== value80.current
          ? value298(value654, value653.file)
          : (value273(value653.file), value559(value653.file));
        setSelection(
          (0, selectionFromArtboards)(new Set([value653.file])),
        );
      },
      [
        value298,
        value273,
        value559,
        value62,
        showToast,
        abandonSelectionGesture,
      ],
    ),
    value578: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        value314(
          (0, boardSelectionItems)({
            file: input,
          }),
          options ? "toggle" : "replace",
        ),
      [value314],
    );
  value29.current = value578;
  let value579: Dynamic = (0, canvasSelectionKey)(selection);
  (0, useVectorToolReset)(value337, value579, value341);
  let value580: Dynamic = (0, reactChromeTheme.useRef)(null);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let current4: Dynamic = value580.current;
    value580.current = {
      sel: value579,
      page: value79,
      first: value78,
    };
    let current5: Dynamic = value23.current;
    value23.current = false;
    if (current4 == null) return;
    let value653: Dynamic = current4.sel !== value579;
    if (
      !(
        current4.page === value79 ||
        (current4.page === "" && value79 === value78) ||
        (value79 === "" && current4.page === current4.first)
      )
    ) {
      let value654: Dynamic = value289;
      (0, announce)(
        (): Dynamic => {
          let value655: Dynamic =
              value654 &&
              (document as Dynamic).activeElement === value286.current,
            value656: Dynamic = (0, canvasSelectionKey)(
              selectionRef.current,
            ),
            value657: Dynamic = [
              value655 ? null : (0, pageAnnouncement)(value81),
              value656 !== current4.sel && value656 !== "none"
                ? value550()
                : null,
            ].filter((input?: Dynamic): Dynamic => input != null);
          return value657.length > 0 ? value657.join(", ") : null;
        },
        {
          ifIdle: true,
        },
      );
      return;
    }
    if (value653) {
      if (current5) {
        (0, announce)((): Dynamic => null, {
          ifIdle: true,
        });
        return;
      }
      value24.current?.saidSelection(selectionRef.current) ||
        (0, announce)(value550, {
          ifIdle: true,
        });
    }
  }, [value579, value79, value78]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value23.current = false;
  });
  let value581: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (selectElementInArtboard as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get focusedFileRef() { return focusedFileRef; }, get selectionEpochRef() { return selectionEpochRef; }, get selectionRef() { return selectionRef; }, get setSelection() { return setSelection; }, get value124() { return value124; }, get value177() { return value177; }, get value19() { return value19; }, get value23() { return value23; }, get value25() { return value25; }, get value273() { return value273; }, get value62() { return value62; }, get value73() { return value73; } }, ...args),
      [value62, value273, abandonSelectionGesture],
    ),
    value582: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic => {
        let entry: Dynamic = value177.current.get(input);
        if (!entry) return;
        let value653: Dynamic = abandonSelectionGesture();
        value62();
        setSelection(emptyCanvasSelection);
        let callback15: Dynamic = (): Dynamic => {
          selectionEpochRef.current === value653 &&
            value273(input).then((): Dynamic => {
              selectionEpochRef.current === value653 && value124(input);
            });
        };
        if (!entry.isReady()) {
          callback15();
          return;
        }
        entry.pickAt(options, context).then((input2?: Dynamic): Dynamic => {
          selectionEpochRef.current === value653 &&
            (input2 && "tid" in input2
              ? value581(input, input2.tid)
              : callback15());
        }, callback15);
      },
      [value62, value273, value581, abandonSelectionGesture],
    ),
    value583: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value584: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value585: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value586: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (syncFramelessArtboardHull as Dynamic)({ get focusedFileRef() { return focusedFileRef; }, get value125() { return value125; }, get value127() { return value127; }, get value129() { return value129; }, get value202() { return value202; }, get value218() { return value218; }, get value224() { return value224; }, get value427() { return value427; }, get value583() { return value583; }, get value584() { return value584; }, get value585() { return value585; }, get value68() { return value68; }, get value70() { return value70; }, get value72() { return value72; }, get value73() { return value73; } }, ...args),
      [],
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (): Dynamic => {
      for (let value653 of value583.current.values() as Dynamic)
        clearTimeout(value653);
    },
    [],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (editing)
      for (let [value653, value654] of [...value584.current] as Dynamic)
        (value127.current.has(value653) ||
          value123 === value653 ||
          value121 === value653) &&
          value586(value653, value654);
  }, [editing, value123, value121, value586]);
  let [value587, value588]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value589: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let files: Dynamic = doc.content().files;
        if (
          !(input.size === 0
            ? options.size > 0
            : [...input].some((input2?: Dynamic): Dynamic => {
                let value655: Dynamic = files[input2];
                return (
                  typeof value655 == "string" &&
                  !(0, isLoadingArtboardHtml)(value655)
                );
              }))
        )
          return;
        let value653: Dynamic = value473(input, options),
          value654: Dynamic = (0, copyClipboardObject)(
            DesignArtboardsKey,
            {
              data: {
                stamp: value653.stamp,
                ...value466.current(input, options),
              },
              text: value653.rendition,
            },
          );
        value463.current(
          input,
          options,
          (): Dynamic => (value654 ? value653 : undefined),
        );
      },
      [doc, value473],
    ),
    value590: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          value653: Dynamic = current4.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        !value653 ||
          current4.cover === input ||
          (value396.current(
            {
              kind: "cover",
              from: (0, validCoverArtboard)(
                current4.cover,
                current4.artboards,
              ),
              to: input,
            },
            new Set(),
          ),
          value98({
            ...current4,
            cover: input,
          }),
          (0, announce)(
            "\u201C" +
              (value653.title ?? input.replace(/\.dc\.html$/, "")) +
              "\u201D is now the thumbnail.",
          ));
      },
      [value98],
    ),
    value591: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic = (0, getArtboardClipboard)(),
        value654: Dynamic = (0, getAnnotationClipboard)(),
        value655: Dynamic = value109(),
        value656: Dynamic = value653
          ? value112(
              value653,
              value654,
              value655,
              value655?.overAnnotation ? null : value655,
            )
          : null;
      return {
        label: KeyboardEditActionsCutCopyPasteConfig.paste.label,
        hotkey: KeyboardEditActionsCutCopyPasteConfig.paste.shortcut,
        get disabledReason() { return value224.current ? (value653 ? (undefined) : (uiMessage("canvas.designCanvas.noArtboardOrObjectCopied") + (0, keyboardShortcutLabel)("V") + " to paste anything else.")) : (ViewOnlyYouCanInspectThisMessage); },
        onClick: (): Dynamic => {
          value224.current &&
            value653 &&
            value464.current(value653, value654, value656);
        },
      };
    }, [value109, value112]),
    value592: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (buildArtboardContextMenu as Dynamic)({ get doc() { return doc; }, get selectionRef() { return selectionRef; }, get value105() { return value105; }, get value224() { return value224; }, get value225() { return value225; }, get value271() { return value271; }, get value274() { return value274; }, get value293() { return value293; }, get value323() { return value323; }, get value379() { return value379; }, get value383() { return value383; }, get value384() { return value384; }, get value403() { return value403; }, get value449() { return value449; }, get value480() { return value480; }, get value505() { return value505; }, get value506() { return value506; }, get value578() { return value578; }, get value588() { return value588; }, get value589() { return value589; }, get value590() { return value590; }, get value591() { return value591; }, get value73() { return value73; }, get value92() { return value92; } }, ...args),
      [
        value578,
        value589,
        value505,
        value506,
        value480,
        value92,
        value591,
        value590,
        value403,
        value449,
        doc,
        value384,
        value105,
      ],
    ),
    value593: Dynamic = (0, reactChromeTheme.useCallback)(
      (...args: Dynamic[]): Dynamic => (buildAnnotationContextMenu as Dynamic)({ get selectionRef() { return selectionRef; }, get value150() { return value150; }, get value152() { return value152; }, get value224() { return value224; }, get value314() { return value314; }, get value323() { return value323; }, get value459() { return value459; }, get value46() { return value46; }, get value589() { return value589; }, get value591() { return value591; }, get value73() { return value73; } }, ...args),
      [value314, value589, value591, value150],
    ),
    value594: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => [
        value591(),
        {
          label: fitArtboardsLabel,
          hotkey: "cmd+0",
          separatorBefore: true,
          onClick: (): Dynamic => {
            value292.current();
          },
        },
      ],
      [value591],
    ),
    value595: Dynamic = (0, reactChromeTheme.useRef)(new Map()),
    value596: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic =>
        (0, reconcileAnnotationOutline)(
          value86.annotations ?? [],
          value595.current,
        ),
      [value86.annotations],
    ),
    [value597, value598]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value599: Dynamic = (0, reactChromeTheme.useCallback)(
      (source?: Dynamic, options?: Dynamic): Dynamic => {
        if (
          value294.current ||
          value2.current?.() === true ||
          (source.kind !== "object" && selectionRef.current.elements.size > 1)
        )
          return;
        source.kind === "canvas" && value278();
        let value653: Dynamic =
            source.kind === "artboard"
              ? value592(source.file, true)
              : source.kind === "object"
                ? value593(source.id)
                : value594(),
          value654: Dynamic =
            source.kind === "artboard"
              ? (value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === source.file,
                )?.title ?? source.file.replace(/\.dc\.html$/, ""))
              : source.kind === "object"
                ? (value596.find(
                    (input?: Dynamic): Dynamic => input.id === source.id,
                  )?.label ?? "Object")
                : "Canvas";
        value598({
          x: options.x,
          y: options.y,
          keyboard: options.keyboard === true,
          items: value653.map(OutlineGlyphsLabel),
          get label() { return uiMessage("canvas.designCanvas.actions", { value1: String(value654) }); },
        });
      },
      [value278, value592, value593, value594, value596],
    );
  value295.current = value599;
  let [value600]: Dynamic = (0, reactChromeTheme.useState)(
    (): Dynamic => ({
      path: "",
      row: "",
    }),
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    selection.elements.size === 0 && (value600.path = value600.row = "");
  }, [selection, value600]);
  let value601: Dynamic = (0, validCoverArtboard)(
      value67.cover,
      value67.artboards,
    ),
    value602: Dynamic = (0, useCanvasKeyboardNavigation)(
      {
        focusedFileRef: focusedFileRef,
        megaSelRef: selectionRef,
        handlesRef: value177,
        canEditRef: value224,
        titleOf: (input?: Dynamic): Dynamic =>
          value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          )?.title ?? input.replace(/\.dc\.html$/, ""),
        rootNameOf: value19,
        selectElementIn: value581,
        clearSelectionQuietly: (): Dynamic => {
          selectionEpochRef.current++;
          value62();
          value23.current = true;
          setSelection(emptyCanvasSelection);
        },
        selectLayerNow: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
          value653?: Dynamic,
        ): Dynamic => {
          let entry: Dynamic = value177.current.get(input);
          return focusedFileRef.current !== input ||
            !entry ||
            !entry.isReady()
            ? false
            : (value653 && selectionEpochRef.current++,
              entry.setShownSelection(null, null, context),
              entry.setShownSelection([options], value19(input), context));
        },
        forgetHostSelection: (input?: Dynamic): Dynamic => {
          selectionRef.current = (0, filterSelectedElements)(
            selectionRef.current,
            (input2?: Dynamic): Dynamic => input2 !== input,
          );
          setSelection(
            (input2?: Dynamic): Dynamic =>
              (0, filterSelectedElements)(
                input2,
                (input3?: Dynamic): Dynamic => input3 !== input,
              ),
          );
        },
        selectArtboard: (input?: Dynamic): Dynamic =>
          value314(
            (0, boardSelectionItems)({
              file: input,
            }),
            "replace",
          ),
        clearFrameSelection: (
          input?: Dynamic,
          options?: Dynamic,
        ): Dynamic => {
          value177.current.get(input)?.setShownSelection(null, null, options);
        },
        focusArtboard: (input?: Dynamic): Dynamic => value274.current(input),
        bringArtboardIntoView: value559,
        stopOf: callback11,
        sayUnreadable: value40,
      },
      value547,
    );
  value24.current = value602;
  let value603: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => ({
        onEnter: value602.enter,
        onStep: value602.step,
        onDescend: value602.descend,
        onAscend: value602.ascend,
        onLeave: value602.leave,
        holdKey: value602.holdKey,
      }),
      [
        value602.enter,
        value602.step,
        value602.descend,
        value602.ascend,
        value602.leave,
        value602.holdKey,
      ],
    ),
    value604: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => ({
        inside: value602.inside,
        keys: value603,
        onAbandon: value602.abandon,
        onTextEditEnded: value602.onTextEditEnded,
      }),
      [value602.inside, value603, value602.abandon, value602.onTextEditEnded],
    ),
    value605: Dynamic = (0, reactChromeTheme.useRef)(value121);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value605.current !== value121;
    value605.current = value121;
    let current4: Dynamic = value602.insideRef.current;
    current4 != null &&
      ((value653 && value121 !== current4) ||
        (0, canvasElementSelectionCount)(selection) ||
        !(value356 || value358) ||
        value347 != null) &&
      value602.abandon();
  }, [value602, value121, selection, value356, value358, value347]);
  let value606: Dynamic = (0, reactChromeTheme.useMemo)(
      (...args: Dynamic[]): Dynamic => (buildOutlineArtboardRows as Dynamic)({ get abandonSelectionGesture() { return abandonSelectionGesture; }, get setSelection() { return setSelection; }, get value168() { return value168; }, get value169() { return value169; }, get value170() { return value170; }, get value224() { return value224; }, get value273() { return value273; }, get value314() { return value314; }, get value397() { return value397; }, get value40() { return value40; }, get value543() { return value543; }, get value544() { return value544; }, get value545() { return value545; }, get value546() { return value546; }, get value547() { return value547; }, get value549() { return value549; }, get value551() { return value551; }, get value552() { return value552; }, get value559() { return value559; }, get value578() { return value578; }, get value581() { return value581; }, get value587() { return value587; }, get value588() { return value588; }, get value592() { return value592; }, get value593() { return value593; }, get value596() { return value596; }, get value600() { return value600; }, get value601() { return value601; }, get value62() { return value62; }, get value86() { return value86; } }, ...args),
      [
        value578,
        value592,
        value593,
        value596,
        value600,
        value169,
        value314,
        value587,
        value397,
        value86.artboards,
        value601,
        value168,
        value170,
        value543,
        value547,
        value545,
        value552,
        value62,
        value273,
        value559,
        value581,
        value40,
      ],
    ),
    [value607, value608]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = (window as Dynamic).setTimeout(
      (): Dynamic => value608(true),
      900,
    );
    return (): Dynamic => (window as Dynamic).clearTimeout(value653);
  }, []);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = [60, 450].map(
      (input?: Dynamic): Dynamic =>
        (window as Dynamic).setTimeout(
          (): Dynamic =>
            (0, refreshDesktopRendering)(
              (document as Dynamic).querySelector("header"),
            ),
          input,
        ),
    );
    return (): Dynamic =>
      value653.forEach(
        (input?: Dynamic): Dynamic => (window as Dynamic).clearTimeout(input),
      );
  }, [editing]);
  let value609: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let value653: Dynamic = Date.now();
        if (value653 - value15.current <= 5e3) return;
        let value654: Dynamic = options ? "Video" : "Image";
        value15.current = value653;
        let flag2: Dynamic = false,
          value655: Dynamic = input === value271.current,
          value656: Dynamic = showToast(
            <span data-testid={"dc-preview-drop-toast"}>
              {flag2 ? (uiMessage("canvas.designCanvas.droppedOpenThePropertiesPanel", { value1: String(value654) })) : (value655 ? (uiMessage("canvas.designCanvas.droppedPressEditOnThat", { value1: String(value654) })) : (uiMessage("canvas.designCanvas.droppedSwitchToEditTo", { value1: String(value654) })))}
            </span>,
            "info",
            {
              pinned: true,
              action: (
                <Button
                  size={"sm"}
                  data-testid={"dc-preview-drop-edit"}
                  onClick={(): Dynamic => {
                    hideToast(value656);
                    value273(flag2 ? (value346.current ?? input) : input);
                    setMode("edit");
                    flag2 && value96(true);
                  }}
                >
                  {flag2 ? (uiMessage("canvas.designCanvas.openProperties")) : (uiMessage("canvas.designCanvas.edit"))}
                </Button>
              ),
            },
          );
        (window as Dynamic).setTimeout(
          (): Dynamic => hideToast(value656),
          previewDropNoticeDurationMs,
        );
      },
      [value273, hideToast, showToast, value96],
    ),
    [value610, value611]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    );
  value431.current = {
    focusedFile: value121,
    panelUndo: value610,
  };
  let value612: Dynamic = (0, reactChromeTheme.useRef)(new Set()),
    value613: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => (
        value612.current.add(input),
        input(value105.get().scale),
        (): Dynamic => {
          value612.current.delete(input);
        }
      ),
      [value105],
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      value105.subscribe((input?: Dynamic, options?: Dynamic): Dynamic => {
        if (input.scale !== options.scale)
          for (let value653 of value612.current as Dynamic)
            value653(input.scale);
      }),
    [value105],
  );
  let [value614, value615]: Dynamic = (0, reactChromeTheme.useState)(
      null,
    ),
    value616: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => ({
        ...input,
        undo: (): Dynamic => {
          value614?.exitMode?.();
          input.undo();
        },
        redo: (): Dynamic => {
          value614?.exitMode?.();
          input.redo();
        },
      }),
      [value614],
    ),
    value617: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value105.set((input2?: Dynamic): Dynamic => {
          let {
            w: value653,
            h: value654,
            top: value655,
          }: Dynamic = value120();
          return (0, zoomViewportAtPoint)(
            input2,
            value653 / 2,
            value655 + (value654 - value655) / 2,
            input / input2.scale,
            viewportScaleLimits,
          );
        }, true);
      },
      [value105, value120],
    ),
    value618: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic =
          value89.boxesHere.length === 0
            ? value86.artboards
            : [...value86.artboards, ...value89.boxesHere],
        value654: Dynamic = value86.annotations ?? [];
      if (!value653.length && !value654.length) return;
      let value655: Dynamic = value654.map(
          (input?: Dynamic): Dynamic =>
            (0, rotatedAnnotationBounds)(
              input,
              (0, isShapeAnnotation)(input)
                ? (0, annotationBounds)(input)
                : {
                    x: input.x,
                    y: input.y,
                    w: (0, NotesLinkEditingKind)(input),
                    h: (0, NotesLinkEditingLh)(input),
                  },
            ),
        ),
        value656: Dynamic = Math.min(
          ...value653.map((input?: Dynamic): Dynamic => input.x),
          ...value655.map((input?: Dynamic): Dynamic => input.x),
        ),
        value657: Dynamic = Math.min(
          ...value653.map(
            (input?: Dynamic): Dynamic =>
              input.y - fitArtboardHeaderHeight,
          ),
          ...value655.map((input?: Dynamic): Dynamic => input.y),
        ),
        value658: Dynamic = Math.max(
          ...value653.map((input?: Dynamic): Dynamic => input.x + input.w),
          ...value655.map((input?: Dynamic): Dynamic => input.x + input.w),
        ),
        value659: Dynamic = Math.max(
          ...value653.map((input?: Dynamic): Dynamic => input.y + input.h),
          ...value655.map((input?: Dynamic): Dynamic => input.y + input.h),
        ),
        value660: Dynamic = value120();
      return (0, fitBoundsCamera)(
        {
          minX: value656,
          minY: value657,
          maxX: value658,
          maxY: value659,
        },
        {
          ...value660,
          top: Math.max(value660.top, value296.current),
        },
      );
    }, [value86, value89.boxesHere, value120]),
    value619: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic = value618();
      value653 !== undefined && value105.set(value653, true);
      return value653 !== undefined;
    }, [value105, value618]);
  value292.current = value619;
  let value620: Dynamic =
      value89.boxesHere.length > 0 ||
      (value89.creating && value86.artboards.length > 0),
    value621: Dynamic = (0, reactChromeTheme.useRef)(false),
    [value622]: Dynamic = (0, reactChromeTheme.useState)(value620);
  (0, reactChromeTheme.useLayoutEffect)((): Dynamic => {
    if (
      value622 ||
      value310.current ||
      !value620 ||
      value345.current ||
      value102.current
    )
      return;
    value310.current = true;
    let value653: Dynamic = value618(),
      value654: Dynamic =
        value621.current &&
        value653 !== undefined &&
        (document as Dynamic).visibilityState === "visible"
          ? (0, creationFocusedCamera)(
              [...value86.artboards, ...value89.boxesHere],
              value653,
              value120(),
            )
          : undefined;
    value653 !== undefined && value654 !== undefined
      ? (value105.set(value654), value105.glide(value653))
      : value292.current();
    callback8();
  }, [value620]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value310.current && callback8();
    if (
      value310.current ||
      (value86.artboards.length === 0 && value89.boxesHere.length === 0)
    )
      return;
    if (value345.current || value102.current) {
      value310.current = true;
      callback8();
      return;
    }
    let value653: Dynamic = (window as Dynamic).setTimeout((): Dynamic => {
      value310.current ||
        ((value310.current = true), value345.current || value619());
      callback8();
    }, 50);
    return (): Dynamic => (window as Dynamic).clearTimeout(value653);
  }, [value67, value619]);
  (0, reactChromeTheme.useEffect)((...args: Dynamic[]): Dynamic => (subscribeZoomShortcuts as Dynamic)({ get value105() { return value105; }, get value13() { return value13; }, get value285() { return value285; }, get value345() { return value345; }, get value617() { return value617; }, get value619() { return value619; } }, ...args), [value619, value617, value13, value105]);
  let value623: Dynamic =
      value83.length > 1 && !value283 ? value83.length : 0,
    value624: Dynamic = editing
      ? "Pages: switch, add, rename or delete a page"
      : "Pages: switch pages",
    value625: Dynamic = (0, useToolbarItemAccessibility)({
      disabled: false,
      name: value283 ? uiMessage("canvas.designCanvas.allFiles") : value81,
      tip: value624,
    }),
    value626: Dynamic = (
      <span className={"relative"}>
        <EditorPopover
          open={value280}
          onOpen={(): Dynamic => value281(true)}
          onClose={(): Dynamic => value281(false)}
          trigger={(input?: Dynamic): Dynamic => (
            (value287.current = input.ref),
            (
              <Tooltip
                content={value624}
                side={"bottom"}
                hoverable={false}
                open={value280 ? false : undefined}
              >
                <Button
                  {...input}
                  ref={value288}
                  variant={"ghost"}
                  icon={value85 ? "Files" : undefined}
                  data-testid={"dc-pages"}
                  aria-label={
                    value283 ? (uiMessage("canvas.designCanvas.allFilesPages")) : (value81 + ", " + value623 > 0 ? (uiMessage("canvas.designCanvas.pages2", { value1: String(String(value623)) })) : (uiMessage("canvas.designCanvas.pages3")))
                  }
                  className={"shrink-0"}
                  onClick={(input2?: Dynamic): Dynamic => {
                    value280 || value290(input2.detail === 0);
                    input.onClick?.(input2);
                  }}
                  aria-describedby={value625.describedBy}
                >
                  <Counter
                    value={value623}
                    variant={"neutral"}
                    size={"xs"}
                    data-testid={"dc-pages-count"}
                  />
                  {value85 ? (null) : (<span className={"max-w-[10rem] truncate"}>
                      {value283 ? (uiMessage("canvas.designCanvas.allFiles")) : (value81)}
                    </span>)}
                  <ToolbarCaret />
                </Button>
              </Tooltip>
            )
          )}
          align={"left"}
          className={"w-60 p-1"}
          aria-label={uiMessage("canvas.designCanvas.pages")}
          focusOnOpen={value289}
          initialFocus={(): Dynamic => {
            let value653: Dynamic = Array.from(
              (document as Dynamic).querySelectorAll(
                "[data-dc-pages-list] button",
              ),
            );
            return (
              value653.find(
                (element?: Dynamic): Dynamic =>
                  element.getAttribute("aria-pressed") === "true",
              ) ??
              value653.find((input?: Dynamic): Dynamic => !input.disabled) ??
              null
            );
          }}
          popupAttrs={{
            "data-dc-pages-list": "",
          }}
        >
          {null}
          {(value77.length > 0
            ? value83
            : [
                {
                  id: "",
                  name: "Page 1",
                },
              ]
          ).map((...args: Dynamic[]): Dynamic => (renderPageTabItem as Dynamic)({ get editing() { return editing; }, get value275() { return value275; }, get value281() { return value281; }, get value283() { return value283; }, get value298() { return value298; }, get value299() { return value299; }, get value301() { return value301; }, get value306() { return value306; }, get value455() { return value455; }, get value67() { return value67; }, get value77() { return value77; }, get value79() { return value79; } }, ...args))}
          {null}
          {editing && (<jsx_Gn.Fragment>
              <div
                aria-hidden={"true"}
                className={"mx-2 my-1 h-px bg-border-line"}
              />
              <EditorMenuItem
                icon={"Add"}
                disabled={false}
                title={undefined}
                onClick={(): Dynamic => {
                  value281(false);
                  value275(value305);
                }}
              >
                {uiMessage("canvas.designCanvas.newPage")}
              </EditorMenuItem>
            </jsx_Gn.Fragment>)}
        </EditorPopover>
        {value625.mirror}
      </span>
    ),
    value627: Dynamic = value347
      ? value86.artboards.find(
          (input?: Dynamic): Dynamic => input.file === value347.file,
        )
      : undefined,
    value628: Dynamic = (0, useDesignSource)(),
    value629: Dynamic = null,
    value630: Dynamic =
      value266.length > 0 ? (
        <ArtboardErrorsPopover
          problems={value266}
          canvasTitle={(document as Dynamic).title}
          canEdit={editable}
          hosted={(0, embedMemoryPrefix)() !== ""}
          open={value263}
          onOpenChange={value264}
        />
      ) : null,
    value631: Dynamic =
      value67.artboards.length === 0 &&
      (value67.annotations ?? []).length === 0,
    value632: Dynamic = (value86.annotations ?? []).length === 0,
    value633: Dynamic = (value631 && value327.length === 0) || value349,
    value634: Dynamic = (0, reactChromeTheme.useSyncExternalStore)(
      value573,
      (): Dynamic => value349 && value632 && doc.indexSaved?.() === false,
    ),
    value635: Dynamic = value634
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      ? uiMessage("canvas.designCanvas.letTheAgentAddArtboards")
      : (value67.artboards.length === 0 ? uiMessage("canvas.designCanvas.thisCanvas") : uiMessage("canvas.designCanvas.thisPage")) +
        " has no artboards yet. Add one, or let the agent add some.",
    value636: Dynamic =
      value633 &&
      !value349 &&
      value337 === "select" &&
      value89.cursor.at === "tips";
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    value621.current = value636;
  });
  let [value637, value638]: Dynamic = (0, reactChromeTheme.useState)(
      false,
    ),
    value639: Dynamic =
      editing || (readOnly && !value349) ? (
        <ToolbarPrimitivesComponent
          glyph={
            <Icon
              name={"SidebarRight"}
              size={"auto"}
              className={"max-[599px]:rotate-90"}
            />
          }
          label={uiMessage("canvas.designCanvas.properties")}
          iconOnly={true}
          data-testid={"dc-props-toggle"}
          tip={
            value95 ? (uiMessage("canvas.designCanvas.hideThePropertiesPanel")) : (uiMessage("canvas.designCanvas.showThePropertiesPanel"))
          }
          shortcut={"cmd+\\"}
          pressed={value95}
          id={inspectorToggleId}
          onClick={(input?: Dynamic): Dynamic => {
            value14.current = input.detail === 0;
            value96((input2?: Dynamic): Dynamic => !input2);
          }}
        />
      ) : null,
    value640: Dynamic = value347 ? (
      <jsx_Gn.Fragment>
        {flag ? (null) : (<ToolbarPrimitivesComponent
            icon={"CaretLeft"}
            label={uiMessage("canvas.designCanvas.backToCanvas")}
            shortcut={value220 ? undefined : "esc"}
            iconOnly={true}
            data-testid={"mega-collapse"}
            data-view-control={""}
            onClick={value389}
          />)}
        {flag ? (value626) : (null)}
        {value283 ||
        (flag &&
          (value627?.title ?? value347.file.replace(/\.dc\.html$/, "")) ===
            value81) ? (null) : (<span
            data-testid={"mega-expanded-name"}
            className={
              "tb-yields min-w-0 max-w-[40vw] truncate px-1 text-sm text-fg"
            }
          >
            {value627?.title ?? (value347.file.replace(/\.dc\.html$/, ""))}
          </span>)}
      </jsx_Gn.Fragment>
    ) : null,
    value641: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => (0, groupNavigableArtboards)(value86.artboards),
      [value86.artboards],
    ),
    callback14: Dynamic = (input?: Dynamic): Dynamic =>
      input.map(
        (input2?: Dynamic): Dynamic =>
          (() => {
            const _Component2 = MenuMenuAssignValue_r.Item;
            const _props2 = {
              onClick: (): Dynamic => value381(input2.file),
              children: callback2(input2.file),
            } as const;
            const _key2 = input2.file;
            return <_Component2 key={_key2} {..._props2} />;
          })(),
      ),
    value642: Dynamic =
      value347 || flag ? null : (
        <span data-view-control={""} className={"contents"}>
          <SessionStripPopover
            icon={"Play"}
            label={uiMessage("canvas.designCanvas.play")}
            iconOnly={true}
            tip={uiMessage("canvas.designCanvas.playAnArtboard")}
            disabled={
              value641.prototypes.length + value641.others.length === 0
            }
            disabledTip={pageHasNoArtboardsMessage}
            align={"end"}
            data-testid={"dc-play"}
          >
            {value641.prototypes.length > 0 ? (<MenuMenuAssignValue_r.Group>
                <MenuMenuAssignValue_r.GroupLabel>
                  {artboardNavigationGroupLabels.prototypes}
                </MenuMenuAssignValue_r.GroupLabel>
                {callback14(value641.prototypes)}
              </MenuMenuAssignValue_r.Group>) : (null)}
            {value641.prototypes.length > 0 && value641.others.length > 0 ? (<MenuMenuAssignValue_r.Separator />) : (null)}
            {value641.others.length > 0 ? (<MenuMenuAssignValue_r.Group>
                <MenuMenuAssignValue_r.GroupLabel>
                  {artboardNavigationGroupLabels.others}
                </MenuMenuAssignValue_r.GroupLabel>
                {callback14(value641.others)}
              </MenuMenuAssignValue_r.Group>) : (null)}
          </SessionStripPopover>
        </span>
      ),
    value643: Dynamic = value347 ? (
      <jsx_Gn.Fragment>
        {null}
        {value283 ? (null) : (<jsx_Gn.Fragment>
            <SessionStripPopover
              icon={"Download"}
              label={uiMessage("canvas.designCanvas.export")}
              iconOnly={true}
              tip={uiMessage("canvas.designCanvas.exportThisArtboard")}
              disabled={value480}
              disabledTip={DownloadsArenTAvailableToYouForMessage}
              align={"end"}
              data-testid={"mega-export"}
            >
              {(0, renderMenuItems)(
                (0, artboardExportMenuItems)(
                  value347.file,
                  value86.artboards,
                  {
                    onExportArtboard: (
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic => {
                      value504(input, options);
                    },
                    onExportArtboardPdf: (input?: Dynamic): Dynamic => {
                      value513(input);
                    },
                    ...(flag
                      ? {}
                      : {
                          onExportArtboardHtmlZip: (
                            input?: Dynamic,
                          ): Dynamic => {
                            value507(input);
                          },
                        }),
                    onExportAllArtboardsPdf: (): Dynamic => {
                      value515();
                    },
                  },
                  undefined,
                  value93,
                ),
              )}
            </SessionStripPopover>
            <span
              data-testid={"mega-fit"}
              data-view-control={""}
              className={"inline-flex shrink-0"}
            >
              <SegmentedControl
                aria-label={uiMessage("canvas.designCanvas.artboardSize")}
                tooltipSide={"bottom"}
                segments={[
                  {
                    value: "fill",
                    get label() { return uiMessage("canvas.designCanvas.fill"); },
                    get tooltip() { return uiMessage("canvas.designCanvas.fillTheWindow"); },
                  },
                  {
                    value: "fit",
                    get label() { return uiMessage("canvas.designCanvas.fit"); },
                    get tooltip() { return uiMessage("canvas.designCanvas.atItsOwnSizeScaled"); },
                  },
                ]}
                value={value347.fit ? "fit" : "fill"}
                onChange={(input?: Dynamic): Dynamic =>
                  value348(
                    (input2?: Dynamic): Dynamic =>
                      input2 && {
                        ...input2,
                        fit: input === "fit",
                      },
                  )
                }
              />
            </span>
          </jsx_Gn.Fragment>)}
      </jsx_Gn.Fragment>
    ) : null,
    value644: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => value105.get().scale,
      [value105],
    ),
    value645: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic =>
        value617(value105.get().scale * (input === 1 ? 1.25 : 1 / 1.25)),
      [value105, value617],
    ),
    value646: Dynamic = (0, reactChromeTheme.useCallback)(
      (): Dynamic => viewportScaleLimits,
      [],
    ),
    current3: Dynamic = value447.current,
    [value647, value648]: Dynamic = (0, reactChromeTheme.useState)(0);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      current3?.subscribe(
        (): Dynamic => value648((input?: Dynamic): Dynamic => input + 1),
      ),
    [current3],
  );
  let value649: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => (editing && current3 ? value616(current3) : undefined),
      [editing, current3, value616, value647, value407, value232],
    ),
    value650: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => [
        {
          get label() { return uiMessage("canvas.designCanvas.layoutGuides"); },
          checked: value12,
          shortcut: "shift+g",
          onToggle: (): Dynamic =>
            value13((input?: Dynamic): Dynamic => !input),
        },
      ],
      [value12, value13],
    ),
    value651: Dynamic = (0, useLatestCallback)((): Dynamic => {
      saveCanvas();
    }),
    value652: Dynamic = (
      <CanvasSaveStatus
        doc={doc}
        synced={supportsLoadState}
        localDirty={value65}
        onSave={value651}
      />
    );
  // MineDesign：属性面板与评论合成一个右侧面板（有 feedback 宿主能力时）：评论是面板的第四个标签，与评论模式双向联动；
  // 缩放与播放移到外壳顶栏，这里发布视图状态并执行顶栏的操作
  let mdnFeedback: Dynamic =
      (0, getCachedHostCapability)("feedback") ?? null,
    mdnPanelOpen: Dynamic = mdnFeedback != null && (value220 || value95),
    mdnCommenting: Dynamic = (0, reactChromeTheme.useRef)(value220),
    // 进入评论模式前面板是否打开；退出时恢复
    mdnOpenBefore: Dynamic = (0, reactChromeTheme.useRef)(null);
  mdnCommenting.current = value220;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!mdnFeedback) return;
    mdnCommentMode.set(value220);
    if (value220) {
      mdnOpenBefore.current = value95;
      value96(true);
    } else if (mdnOpenBefore.current !== null) {
      value96(mdnCommentMode.keepPanelOnExit || mdnOpenBefore.current);
      mdnCommentMode.keepPanelOnExit = false;
      mdnOpenBefore.current = null;
    }
  }, [mdnFeedback, value220]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    mdnFeedback?.panelChanged(mdnPanelOpen);
  }, [mdnFeedback, mdnPanelOpen]);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      mdnFeedback?.onPanelRequest((open?: Dynamic): Dynamic => {
        // 关上面板时退出评论模式由下一个 effect 完成，退出后不再恢复成打开
        if (!open && mdnCommenting.current) mdnOpenBefore.current = false;
        value96(open);
      }),
    [mdnFeedback, value96],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    // 面板被关上（顶栏开关、面板的关闭按钮或 ⌘\）时一并退出评论模式，避免面板只剩 header
    if (!mdnFeedback || value95 || !mdnCommenting.current) return;
    mdnOpenBefore.current = false;
    mdnToggleCommentMode();
  }, [mdnFeedback, value95]);
  let mdnPlayable: Dynamic = value347 || flag ? null : value641;
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    if (!mdnFeedback) return;
    let { minScale, maxScale }: Dynamic = value646(),
      groups: Dynamic = mdnPlayable
        ? [
            [artboardNavigationGroupLabels.prototypes, mdnPlayable.prototypes],
            [artboardNavigationGroupLabels.others, mdnPlayable.others],
          ]
        : [],
      publish: Dynamic = (scale?: Dynamic): Dynamic =>
        mdnFeedback.viewChanged({
          scale,
          minScale,
          maxScale,
          presets: zoomScalePresets,
          toggles: value650.map((toggle?: Dynamic): Dynamic => ({
            id: toggle.label,
            label: toggle.label,
            checked: !!toggle.checked,
          })),
          canUndo: !!value649?.canUndo(),
          canRedo: !!value649?.canRedo(),
          play: groups
            .filter(([, items]: Dynamic): Dynamic => items.length > 0)
            .map(([label, items]: Dynamic): Dynamic => ({
              label: String(label),
              items: items.map((item?: Dynamic): Dynamic => ({
                file: item.file,
                title: String(callback2(item.file)),
              })),
            })),
        });
    // value613 订阅比例变化，并立刻以当前比例回调一次
    return value613(publish);
  }, [mdnFeedback, mdnPlayable, value650, value649, value647, value613, value646]);
  (0, reactChromeTheme.useEffect)(
    (): Dynamic =>
      mdnFeedback?.onViewAction((input?: Dynamic): Dynamic => {
        if (input.action === "zoom-in") value645(1);
        else if (input.action === "zoom-out") value645(-1);
        else if (input.action === "fit") value619();
        else if (input.action === "zoom") value617(input.scale);
        else if (input.action === "undo") value649?.canUndo() && value649.undo();
        else if (input.action === "redo") value649?.canRedo() && value649.redo();
        else if (input.action === "toggle")
          value650
            .find((toggle?: Dynamic): Dynamic => toggle.label === input.id)
            ?.onToggle();
        else if (input.action === "play") value381(input.file);
      }),
    [mdnFeedback, value645, value619, value617, value649, value650, value381],
  );
  let mdnZoom: Dynamic = (
    <span data-view-control={""} className={"contents"}>
      <MemoizedCanvasZoomControl
        data-testid={"dc-zoom"}
        readout={true}
        subscribeScale={value613}
        getScale={value644}
        onPickScale={value617}
        onFit={value619}
        onStepZoom={value645}
        getLimits={value646}
        undo={value649}
        viewToggles={value650}
        fitLabel={fitArtboardsLabel}
        tip={
          (0, isApplePlatform)() ? (uiMessage("canvas.designCanvas.zoom0FitStep")) : (uiMessage("canvas.designCanvas.zoomCtrl0FitCtrl"))
        }
      />
    </span>
  );
  // toolbarDensity 内部调用 hook，必须在顶层无条件调用，不能放进按展开状态渲染的分支
  let mdnDockDensity: Dynamic = (0, toolbarDensity)(),
    mdnText: Dynamic = (0, useUiText)();
  return (
    <ViewportContext.Provider value={value105}>
      <CanvasWorkingStateContext.Provider value={current}>
        <InspectorOpenContext.Provider value={value94}>
          <div
            ref={value107}
            className={
              "relative flex h-screen w-screen bg-page text-primary max-[599px]:flex-col"
            }
          >
            <CanvasSaveKeyboardShortcut
              doc={doc}
              synced={supportsLoadState}
              localDirty={value65}
              onSave={value651}
            />
            <div className={"relative flex min-h-0 min-w-0 flex-1 flex-col"}>
              <EditorToolbar
                title={(document as Dynamic).title || (filePath)}
                saveState={value66}
                saveMode={doc.saveMode()}
                syncDot={supportsLoadState}
                onSave={(): Dynamic => {
                  saveCanvas();
                }}
                undo={value447.current ?? undefined}
                publishControls={false}
                undoButtons={false}
                touchTargets={"square"}
                variant={value390 ? "docked" : "floating"}
                trailing={
                  value492 ? null : value347 ? (
                    flag ? (
                      <span
                        data-testid={"dc-save"}
                        className={"flex shrink-0 items-center gap-1"}
                      >
                        {null}
                        {value283 ? (null) : (value639)}
                        {value652}
                      </span>
                    ) : (
                      value652
                    )
                  ) : (
                    <span
                      data-testid={"dc-save"}
                      className={"flex shrink-0 items-center gap-1"}
                    >
                      {mdnFeedback ? (null) : (value639)}
                      {!mdnFeedback && value639 ? (<ToolbarDivider />) : (null)}
                      {mdnFeedback ? (null) : (mdnZoom)}
                      {value652}
                    </span>
                  )
                }
                leading={value347 || value492 ? null : value626}
                extrasEnd={
                  value492 ? null : (
                    <jsx_Gn.Fragment>
                      {value630}
                      {value347 ? (value643) : (value629)}
                      {editing && (<div
                          id={ChatColumnOverlayActionsSlotValue}
                          data-tb-seat={""}
                          className={
                            "flex shrink-0 items-center gap-2 empty:hidden"
                          }
                        />)}
                      {mdnFeedback ? (null) : (value642)}
                    </jsx_Gn.Fragment>
                  )
                }
              >
                {value347 ? (value640) : (null)}
              </EditorToolbar>
              <DocumentSaveStatus
                doc={doc}
                onSave={saveCanvas}
                docked={value390}
                belowPickerBar={value492}
              />
              <div className={"relative flex min-h-0 flex-1"}>
                {/* MineDesign：工具栏移到画布底部居中，缩短鼠标往返；评论放在最右侧并默认显示文字 */}
                {value347 ? (null) : (<CdsIsland
                    density={mdnDockDensity}
                    className={"mdn-tool-dock"}
                    hidden={value492}
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
                        {value352 && (<DesignToolToolbar
                            tool={value337}
                            onTool={value338}
                          />)}
                      </div>
                      <ToolbarDivider />
                      <span data-mega-chrome={"comments"} className={"contents"}>
                        <ToolbarPrimitivesComponent
                          icon={"Chat"}
                          label={mdnText.comment}
                          tipSide={"top"}
                          shortcut={"c"}
                          pressed={value220}
                          data-testid={"dc-tool-comment"}
                          onClick={(): Dynamic =>
                            window.dispatchEvent(new Event("canvas-comment-key"))
                          }
                        />
                      </span>
                    </Surface>
                  </CdsIsland>)}
                <FindBar {...value574.find.bar} />
                {null}
                <main
                  aria-label={uiMessage("canvas.designCanvas.canvas")}
                  inert={value283}
                  className={
                    "relative min-h-0 min-w-0 flex-1 bg-om-bg-canvas"
                  }
                  ref={value119}
                >
                  {value454 !== null && (<HostedEditor
                      host={(): Dynamic => ({
                        selected:
                          value169.size === 0
                            ? value86.artboards
                                .map((input?: Dynamic): Dynamic => input.file)
                                .filter(
                                  (input?: Dynamic): Dynamic =>
                                    value168.has(input),
                                )
                            : [],
                        selectedElements:
                          value169.size === 0
                            ? (0, selectedElementLocations)(
                                value86.artboards.map(
                                  (input?: Dynamic): Dynamic => input.file,
                                ),
                                selection.elements,
                                value19,
                              )
                            : [],
                        handlesRef: value177,
                        canvasTitle:
                          typeof document === "undefined"
                            ? ""
                            : (document as Dynamic).title,
                        fileText: (input?: Dynamic): Dynamic =>
                          doc.content().files[input],
                        readOnly: !editable,
                        hidden:
                          value283 ||
                          value373 !== null ||
                          value492 ||
                          value269 != null ||
                          value349,
                        tell: value188,
                        say: (input?: Dynamic, options?: Dynamic): Dynamic =>
                          (0, announce)(input, options),
                        focusCanvas: (): Dynamic => value394.goHome(),
                        saveNow: (): Dynamic => doc.flushNow?.(),
                        canvas: value454,
                      })}
                    />)}
                  <CanvasInteractionLayer
                    manifest={value86}
                    viewSettled={value99 && !flag ? value311 : undefined}
                    phoneCanvasRunsNothing={value100}
                    guidesVisible={value12}
                    turnBusy={value637}
                    onWorldPointer={callback10}
                    onPagePointer={value372}
                    onPageScroll={value180.set}
                    artboardPicking={value492}
                    artboardOverlay={(
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic =>
                      options ? (
                        <jsx_Gn.Fragment>
                          <ArtboardPeerSelectionRings
                            store={value179}
                            file={input}
                            box={options}
                            scroll={value180}
                          />
                          <PageCommentSurface
                            file={input}
                            box={options}
                            store={value180}
                          />
                        </jsx_Gn.Fragment>
                      ) : (
                        <jsx_Gn.Fragment>
                          <CanvasPeerSelectionRings
                            store={value179}
                            file={input}
                          />
                          {value492 && (callback13(input))}
                        </jsx_Gn.Fragment>
                      )
                    }
                    worldOverlay={
                      value349 ? null : (
                        <jsx_Gn.Fragment>
                          <R_useCanvasPeerSelections
                            pageId={value79}
                            artboards={value86.artboards}
                            handlesRef={value177}
                            store={value179}
                            fullFile={value373}
                          />
                          {!value347 && (<ViewportScale>
                              {(input?: Dynamic): Dynamic => (
                                <jsx_Gn.Fragment>
                                  <PeerCursors
                                    surface={value370}
                                    toLocal={(
                                      input2?: Dynamic,
                                      options?: Dynamic,
                                    ): Dynamic => ({
                                      left: input2,
                                      top: options,
                                    })}
                                    glyphScale={1 / input}
                                  />
                                  <DesignCreationCursor
                                    cursor={value89.cursor}
                                    boards={value89.boxesHere}
                                    artboards={value86.artboards}
                                    scale={input}
                                  />
                                </jsx_Gn.Fragment>
                              )}
                            </ViewportScale>)}
                        </jsx_Gn.Fragment>
                      )
                    }
                    canvasScaleRef={value181}
                    pastePointRef={value108}
                    artboardLandingRef={value110}
                    pendingBoards={value89.pendingBoards}
                    coverFiles={value89.coverFiles}
                    onManifestChange={(...args: Dynamic[]): Dynamic => (commitInteractionLayerChange as Dynamic)({ get value143() { return value143; }, get value169() { return value169; }, get value413() { return value413; }, get value67() { return value67; }, get value68() { return value68; }, get value70() { return value70; }, get value72() { return value72; }, get value73() { return value73; }, get value80() { return value80; }, get value98() { return value98; } }, ...args)}
                    camera={value105}
                    assets={assets}
                    doc={doc}
                    editing={value356}
                    inspect={value358}
                    editable={editable}
                    frameArmed={value607}
                    focusedFile={value351}
                    onFocus={value273}
                    enteredFile={value123}
                    emptyPieces={value128}
                    onEnterPiece={value582}
                    onFaceDoubleClick={value43}
                    onContentHull={value586}
                    onOpenFile={value577}
                    onAddAnnotation={value317}
                    onDeleteAnnotation={value321}
                    onAnnotationCss={value421}
                    onReplaceAnnotationMedia={value426}
                    onOpenPropsPanel={(): Dynamic => value96(true)}
                    selectedArtboards={value168}
                    selectedNotes={value169}
                    onSelectObjects={value492 ? value496 : value314}
                    onClearSelection={value278}
                    routeForwardedKey={value164}
                    onDragEvent={value222}
                    onBoxEvent={value59}
                    dragGhost={value194}
                    onHostDrag={value223}
                    onDropObjectInto={value214}
                    onObjectHover={value212}
                    setMovePieces={true}
                    onHostGesturing={value219}
                    onCommenting={value221}
                    quickProps={
                      value244
                        ? {
                            text: value244.text,
                            shape: value244.shape,
                            box: value244.box,
                            image: value244.image,
                            other: value244.other,
                            line: value244.line,
                            primaryTag: value244.primaryTag,
                            seed: {
                              ...value244.seed,
                              fontSize:
                                value244.seed.fontSize ??
                                value255?.fontSize ??
                                null,
                              faces:
                                value251 !== null &&
                                value251.key ===
                                  value244.probeEl?.file +
                                    ":" +
                                    String(value244.probeEl?.tid)
                                  ? value251.faces
                                  : undefined,
                              definedVars: value244.probeEl
                                ? value257.get(value244.probeEl.file)
                                : undefined,
                              onFacesOpen: (): Dynamic =>
                                value254(
                                  (input?: Dynamic): Dynamic => input + 1,
                                ),
                              rendered: value255
                                ? {
                                    color: value255.color,
                                    background: value255.background,
                                    stroke: value255.stroke,
                                    fontWeight: value255.fontWeight ?? null,
                                    fontFamily: value255.fontFamily ?? null,
                                    fontStyle: value255.fontStyle ?? null,
                                    textAlign: value255.textAlign ?? null,
                                    textDecoration:
                                      value255.textDecoration ?? null,
                                    fontSizePx: value255.fontSize ?? null,
                                    lineHeight: value255.lineHeight ?? null,
                                    letterSpacing:
                                      value255.letterSpacing ?? null,
                                    box: value255.box,
                                    ground: value255.ground ?? null,
                                  }
                                : undefined,
                            },
                            onApply: value228,
                            contrastRef: value245,
                            onGesture: value230,
                            onEditText:
                              value244.primaryText &&
                              value244.primaryEditable &&
                              !value137
                                ? (): Dynamic => {
                                    let primaryText: Dynamic =
                                      value244.primaryText;
                                    primaryText &&
                                      value177.current
                                        .get(primaryText.file)
                                        ?.startTextEdit(
                                          value19(primaryText.file),
                                          primaryText.tid,
                                        );
                                  }
                                : null,
                            onElementLink:
                              value244.primaryTag === "a" &&
                              value244.primaryText &&
                              !value137
                                ? (input?: Dynamic): Dynamic => {
                                    let primaryText: Dynamic =
                                      value244.primaryText;
                                    primaryText &&
                                      value18.current?.setElementLink(
                                        primaryText.tid,
                                        input,
                                      );
                                  }
                                : undefined,
                            onCrop:
                              (value244.probeEl?.kind === "image" ||
                                value244.primaryTag === "video") &&
                              value244.probeEl != null &&
                              !value137
                                ? (): Dynamic => {
                                    let probeEl: Dynamic = value244.probeEl;
                                    probeEl &&
                                      value177.current
                                        .get(probeEl.file)
                                        ?.toggleCrop(probeEl.tid);
                                  }
                                : undefined,
                            cropping:
                              value243.cropping !== null &&
                              value243.cropping === value244.probeEl?.tid,
                            cropReason:
                              value243.target !== null &&
                              "off" in value243.target
                                ? SessionElementStateUnloadedTurnedAutoConfig[
                                    value243.target.off
                                  ]
                                : value243.target?.tid ===
                                    value244.probeEl?.tid
                                  ? undefined
                                  : CropIsNotAvailableHereForMessage,
                            onReplaceImage:
                              value244.probeEl?.kind === "image" && !value137
                                ? (...args: Dynamic[]): Dynamic => (pickReplacementImage as Dynamic)({ get value177() { return value177; }, get value188() { return value188; }, get value244() { return value244; }, get value63() { return value63; }, get value64() { return value64; } }, ...args)
                                : undefined,
                            findVideo:
                              value244.primaryTag === "video" &&
                              value244.probeEl != null &&
                              !value137
                                ? (): Dynamic => {
                                    let probeEl: Dynamic = value244.probeEl;
                                    return probeEl
                                      ? (value177.current
                                          .get(probeEl.file)
                                          ?.videoEl(probeEl.tid) ?? null)
                                      : null;
                                  }
                                : undefined,
                            onReplaceVideo:
                              value244.primaryTag === "video" &&
                              value244.probeEl != null &&
                              !value137
                                ? (...args: Dynamic[]): Dynamic => (pickReplacementVideo as Dynamic)({ get value177() { return value177; }, get value188() { return value188; }, get value244() { return value244; }, get value271() { return value271; } }, ...args)
                                : undefined,
                          }
                        : null
                    }
                    crossFile={
                      value137
                        ? {
                            elements: [...selection.elements.values()].reduce(
                              (input?: Dynamic, options?: Dynamic): Dynamic =>
                                input + options.count,
                              0,
                            ),
                            artboards: selection.elements.size,
                            objects:
                              selection.artboards.size + selection.notes.size,
                            onDuplicate: value148,
                            onDelete: (): Dynamic => value51(value146),
                          }
                        : null
                    }
                    onSelectionSeq={recordFrameSelectionSequence}
                    onMarqueeBegin={value492 ? undefined : value57}
                    onElementPress={value38}
                    onCoverPress={value37}
                    onCoverPick={value36}
                    onArmArtboard={(input?: Dynamic): Dynamic => {
                      value34(input);
                    }}
                    onSetMoveCommit={value157}
                    armedEmpty={value237}
                    onSetMoveSay={(input?: Dynamic): Dynamic =>
                      value448.current?.(input)
                    }
                    onPressIntent={abandonSelectionGesture}
                    pressIntentIs={isSelectionEpochCurrent}
                    dragToast={value185}
                    onArtboardReady={value166}
                    onHandle={value184}
                    onPreviewDropNotice={value609}
                    dsVarNames={value256}
                    onDefinedVars={value259}
                    onArtboardProblems={value262}
                    artboardProblems={value268.chipProblems}
                    onShowProblems={value268.restore}
                    artboardNotice={value268.notice}
                    onDuplicateObjects={value343}
                    onPlayArtboard={value384}
                    playingFile={value269}
                    onExpandArtboard={value378}
                    onRenameArtboard={value397}
                    onCanvasMenu={value599}
                    renameRef={value293}
                    onExportArtboard={(
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic => {
                      value504(input, options);
                    }}
                    exportDisabledReason={
                      value480
                        ? DownloadsArenTAvailableToYouForMessage
                        : undefined
                    }
                    onExportArtboardPdf={(input?: Dynamic): Dynamic => {
                      value513(input);
                    }}
                    exportRules={value93}
                    onExportAllArtboardsPdf={(): Dynamic => {
                      value515();
                    }}
                    onExportSelectedArtboardsPdf={(): Dynamic => {
                      value515(selectionRef.current.artboards);
                    }}
                    onExportArtboardHtmlZip={(input?: Dynamic): Dynamic => {
                      value507(input);
                    }}
                    onArtboardSettings={value531}
                    onOpenTweaks={value528}
                    onToggleTweaks={value530}
                    tweaksOpenFile={value529}
                    tweakRows={value361}
                    onTweaksRow={value363}
                    onTweaksDirty={registerDirtySession}
                    artboardSettings={value542}
                    canvasObject={value541}
                    outlineArtboards={value606}
                    presentPropsTick={value174}
                    onPresentPropsHandled={value176}
                    onPanZoom={value227}
                    streamDragFile={value199}
                    onRepeatRefused={value457}
                    fullscreenFile={value347?.file ?? null}
                    phone={value99}
                    fullscreenBox={value347?.fit === false ? value359 : null}
                    livePins={value567}
                    inUseFiles={value172}
                    onToolChange={value338}
                    toolResetTick={value340}
                    armedTool={value337}
                    keyboard={value604}
                    onDrawArtboard={value313}
                    onImageDrop={value326}
                    pendingPictures={value331}
                    ghostPage={value79}
                    onPlaceTool={value335}
                    onAddShape={value319}
                    onAddPen={value320}
                    onPlaceBlocked={value336}
                    placeRequest={value307}
                    onPlaceHandled={value309}
                    onTextFormat={value231}
                    onHistoryPush={value442}
                    onModelReparsed={value240}
                    onHistoryApply={value445}
                    onHistoryRevoke={value444}
                    onHistoryDrop={value446}
                    onTweakEdit={value416}
                    sessionEpoch={toolResetTick}
                    actionsRef={value18}
                    elementMenuHidden={value95}
                    elementSelection={
                      value63 && (value137 || value63.file === value121)
                        ? value63
                        : null
                    }
                    selectedTidsByFile={value170}
                    selectedRectsByFile={value171}
                    onSelectionEvent={handleFrameSelection}
                    pageKey={value79 === value78 ? "" : value79}
                    onCommentsController={value615}
                    onRevealComment={(...args: Dynamic[]): Dynamic => (revealCommentTarget as Dynamic)({ get editing() { return editing; }, get readOnly() { return readOnly; }, get value105() { return value105; }, get value273() { return value273; }, get value291() { return value291; }, get value297() { return value297; }, get value298() { return value298; }, get value345() { return value345; }, get value346() { return value346; }, get value348() { return value348; }, get value73() { return value73; }, get value80() { return value80; }, get value99() { return value99; } }, ...args)}
                    exitGuardRef={value}
                    textEditOpenRef={value2}
                    settleSessionRef={value3}
                    commitOpenTextEditRef={value4}
                    onSessionDirtyChange={value17}
                    onEditInput={value135}
                    onLocalEdit={value134}
                    onUndoStack={value611}
                  />
                  <CdsIsland
                    density={"compact"}
                    className={"contents"}
                  >
                    <EditorMenu
                      at={value597}
                      onClose={(): Dynamic => value598(null)}
                      items={value597?.items ?? []}
                      minWidth={180}
                      label={value597?.label}
                      focusFirstItem={value597?.keyboard}
                    />
                  </CdsIsland>
                  <R_usePresenceComposer
                    reporter={(): Dynamic =>
                      value371.current ? value366.current : null
                    }
                    color={value367}
                    canOpen={value374}
                  />
                  <ExportPickerToolbar
                    picker={value486}
                    artboards={value484}
                    rules={value93}
                  />
                  {value86.artboards.length === 0 &&
                    value89.boxesHere.length === 0 && (editing ? (value632 || value633 && (<div
                          className={
                            "pointer-events-none absolute inset-0 z-[35] flex flex-col items-center justify-center gap-3 text-center" +
                            (value636
                              ? " top-[var(--tb-overlay-h,0px)] [container-type:size]"
                              : "")
                          }
                        >
                          {value632 && value89.cursor.at === "tips" ? (<DesignCreationPrompt
                              tip={value89.tip}
                              card={value636}
                              prompt={value633}
                              tucked={value634}
                              sentence={value635}
                              busy={value637}
                              onAdd={(): Dynamic => value313()}
                            />) : (value632 ? (<BusyCanvasPrompt
                              prompt={value633}
                              tucked={value634}
                              sentence={value635}
                              busy={value637}
                              onAdd={(): Dynamic => value313()}
                            />) : (<EmptyCanvasPrompt
                              sentence={value635}
                              onAdd={(): Dynamic => value313()}
                            />))}
                        </div>)) : (<div
                        className={
                          "pointer-events-none absolute inset-0 z-[35] flex flex-col items-center justify-center gap-1 text-center"
                        }
                      >
                        <EmptyCanvasReadOnlyNotice
                          editable={editable}
                          reason={saveState.message}
                          wholeCanvas={value631}
                        />
                      </div>))}
                  {value89.workingLabel ? (<CreationWorkingAnnouncement />) : (null)}
                </main>
                {editable ? (<R_useCanvasWorkingState
                    doc={doc}
                    empty={
                      editing && value86.artboards.length === 0 && value632
                    }
                    items={(): Dynamic =>
                      (0, createWorkingFileMap)(doc.content().files)
                    }
                    words={
                      AccessibilityAnnouncementsReadyUpdatedChangedConfig
                    }
                    onBusy={value638}
                  />) : (null)}
                {value351 == null && editing && value541 != null && (<AnchoredDesignProperties
                    settings={value541}
                    readOnly={!editable}
                  />)}
              </div>
            </div>
            {mdnFeedback ? (<div
                className={"mdn-right-panel"}
                hidden={!mdnPanelOpen || value283}
                data-testid={"mdn-right-panel"}
              >
                <aside
                  id={inspectorPanelId}
                  aria-label={uiMessage("canvas.designCanvas.propertiesPanel")}
                  inert={value283}
                  className={
                    (value283 ? "hidden" : "flex") +
                    " isolate z-40 min-h-0 flex-1 shrink-0"
                  }
                />
              </div>) : (<aside
                id={inspectorPanelId}
                aria-label={uiMessage("canvas.designCanvas.propertiesPanel")}
                inert={value283}
                className={
                  (value283 ? "hidden" : "flex") +
                  " isolate z-40 h-full shrink-0 max-[599px]:h-auto max-[599px]:w-full max-[599px]:flex-col"
                }
              />)}
          </div>
        </InspectorOpenContext.Provider>
      </CanvasWorkingStateContext.Provider>
    </ViewportContext.Provider>
  );
}

/** 画板预览 iframe 上报选择变化时运行（handleFrameSelection 的实现）：过滤过期令牌与取消消息，画板级点击转为画板选择，否则把元素选择合并进画布选择。 */
function routeFrameSelectionEvent(deps: { readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelectionRef: Dynamic; readonly value24: Dynamic; readonly value25: Dynamic; readonly value27: Dynamic; readonly value29: Dynamic; readonly value30: Dynamic; readonly value31: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (input !== deps.focusedFileRef.current) return;
        input === deps.pendingFrameSelectionRef.current?.file &&
          options.tids &&
          options.tids.length > 0 &&
          (deps.pendingFrameSelectionRef.current = null);
        let value653: Dynamic =
          options.re != null && options.re.startsWith(HostValue);
        value653 && options.re != null && deps.value30.current.get(options.re)?.();
        value653 &&
          options.re === deps.value31.current?.token &&
          (deps.value31.current = null);
        if (
          value653 &&
          options.re !== deps.frameSelectionTokensRef.current.get(input)
        )
          return;
        if (
          (0, isSessionCancelMessage)(options.re, deps.value27.current)
        ) {
          deps.value27.current = null;
          return;
        }
        if (options.artboard) {
          deps.value29.current(input, options.additive === true);
          return;
        }
        let value654: Dynamic =
            options.tids && options.tids.length > 0
              ? {
                  name: options.name ?? null,
                  tids: options.tids,
                  rect: options.rect ?? null,
                  count: options.tids.length,
                  part: options.part,
                }
              : null,
          value655: Dynamic =
            options.re != null &&
            options.re.startsWith(keyboardNavigationMode);
        if (
          !value655 &&
          !value653 &&
          !options.additive &&
          value654 == null &&
          deps.value25.current === input
        ) {
          deps.value25.current = null;
          return;
        }
        if (
          deps.value24.current?.noteSelection(
            input,
            value654?.tids ?? null,
            options.re,
          ) === false
        )
          return;
        value654 == null &&
          !value655 &&
          !value653 &&
          !options.artboard &&
          deps.selectionEpochRef.current++;
        value654 != null &&
          !value655 &&
          !value653 &&
          ((deps.value25.current = null), deps.selectionEpochRef.current++);
        let value656: Dynamic = (0, applyHostSelectionResponse)(
          deps.selectionRef.current,
          input,
          {
            entry: value654,
            additive: options.additive === true,
            re: options.re,
          },
        );
        value656.kind !== "confirm" &&
          ((deps.selectionRef.current = value656.next),
          deps.setSelection(value656.next),
          value656.pushback === "clear" &&
            deps.setShownFrameSelectionRef.current(input, null));
      }

/** applyCanvasSelection 的实现：写入 selectionRef 与选择状态，并按 0/150/600ms 多次把元素选择重新推送到未聚焦的画板预览中显示。 */
function commitCanvasSelection(deps: { readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let current4: Dynamic = deps.selectionRef.current;
        deps.selectionRef.current = input;
        deps.setSelection(input);
        let current5: Dynamic = deps.focusedFileRef.current;
        for (let value657 of (options?.repush ?? []) as Dynamic) {
          if (value657 === current5) continue;
          let value658: Dynamic = input.elements.get(value657)?.tids;
          if (value658 == null) continue;
          let callback15: Dynamic = (): Dynamic => {
            let value659: Dynamic =
              deps.selectionRef.current.elements.get(value657)?.tids;
            return (
              deps.focusedFileRef.current !== value657 && value659 === value658
            );
          };
          for (let value659 of [0, 150, 600] as Dynamic)
            (window as Dynamic).setTimeout((): Dynamic => {
              callback15() &&
                deps.value177.current
                  .get(value657)
                  ?.setShownSelection(value658, deps.value19(value657));
            }, value659);
        }
        if (current5 == null) return;
        let value653: Dynamic = current4.elements.get(current5)?.tids,
          value654: Dynamic = input.elements.get(current5)?.tids,
          value655: Dynamic =
            value653 === value654 ||
            (value653 != null &&
              value654 != null &&
              value653.length === value654.length &&
              value653.every(
                (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                  input2 === value654[options2],
              )),
          value656: Dynamic =
            options?.repush != null && [...options.repush].includes(current5);
        if (!value655 || (value656 && value654 != null)) {
          let value657: Dynamic = deps.setShownFrameSelection(
            current5,
            value654 ?? null,
          );
          if (value656 && value654 != null && value657 != null) {
            let callback15: Dynamic = (): Dynamic => {
              let value658: Dynamic =
                deps.selectionRef.current.elements.get(current5)?.tids;
              return (
                deps.focusedFileRef.current === current5 &&
                deps.frameSelectionTokensRef.current.get(current5) === value657 &&
                value658 != null &&
                value658.length === value654.length &&
                value658.every(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    input2 === value654[options2],
                )
              );
            };
            for (let value658 of [150, 600] as Dynamic)
              (window as Dynamic).setTimeout((): Dynamic => {
                callback15() &&
                  deps.setShownFrameSelection(current5, value654, value657);
              }, value658);
          }
        }
      }

/** 聚焦某个画板后运行：等待预览就绪，再以 60ms 轮询把已保存的元素选择反复推送到该画板 iframe，直到对方确认显示或超时。 */
function focusArtboardAndReplaySelection(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly frameSelectionSequencesRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value177: Dynamic; readonly value274: Dynamic; readonly value30: Dynamic }, input?: Dynamic): Dynamic {
        let value653: Dynamic = deps.abandonSelectionGesture(),
          value654: Dynamic =
            deps.focusedFileRef.current !== input
              ? {
                  file: input,
                }
              : null;
        value654 && (deps.pendingFrameSelectionRef.current = value654);
        let callback15: Dynamic = (): Dynamic => {
          value654 &&
            deps.pendingFrameSelectionRef.current === value654 &&
            (deps.pendingFrameSelectionRef.current = null);
        };
        return deps.value274
          .current(input)
          .then(
            (): Dynamic =>
              new Promise((input2?: Dynamic): Dynamic => {
                let entry: Dynamic =
                    deps.frameSelectionSequencesRef.current.get(input),
                  items: Dynamic = [],
                  index: Dynamic = 0,
                  index2: Dynamic = 0,
                  index3: Dynamic = 0,
                  flag2: Dynamic = false,
                  callback16: Dynamic = (): Dynamic => {
                    for (let value655 of items as Dynamic)
                      deps.value30.current.delete(value655);
                    callback15();
                    input2(
                      flag2 ||
                        (deps.focusedFileRef.current === input &&
                          deps.selectionRef.current.elements.has(input)),
                    );
                  },
                  callback17: Dynamic = (): Dynamic => {
                    if (
                      flag2 ||
                      deps.selectionEpochRef.current !== value653 ||
                      deps.frameSelectionSequencesRef.current.get(input) !== entry
                    )
                      return callback16();
                    let entry2: Dynamic =
                        deps.selectionRef.current.elements.get(input),
                      value655: Dynamic =
                        deps.focusedFileRef.current != null &&
                        deps.focusedFileRef.current !== input;
                    if (!entry2 || value655 || index >= 25 || index2++ >= 400)
                      return callback16();
                    let entry3: Dynamic = deps.value177.current.get(input);
                    if (
                      Date.now() - index3 >= 300 &&
                      deps.focusedFileRef.current === input &&
                      entry3?.isReady()
                    ) {
                      deps.setShownFrameSelection(input, null);
                      let value656: Dynamic = deps.setShownFrameSelection(
                        input,
                        entry2.tids,
                      );
                      value656 &&
                        (index++,
                        (index3 = Date.now()),
                        items.push(value656),
                        deps.value30.current.set(value656, (): Dynamic => {
                          flag2 = true;
                          callback16();
                        }));
                    }
                    (window as Dynamic).setTimeout(callback17, 60);
                  };
                (window as Dynamic).setTimeout(callback17, 60);
              }),
          )
          .catch((): Dynamic => (callback15(), false));
      }

/** 键盘选择导航入口：按 kind 处理全选、方向键微移（含长按节流）、重排层级、进入子级/返回父级/切换兄弟元素，并播报结果。 */
function navigateSelectionByKind(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly callback: Dynamic; readonly count3: Dynamic; readonly focusedFileRef: Dynamic; readonly frameSelectionTokensRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value31: Dynamic; readonly value34: Dynamic; readonly value432: Dynamic; readonly value44: Dynamic; readonly value440: Dynamic; readonly value48: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value53: Dynamic; readonly value54: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, source?: Dynamic): Dynamic {
        let callback15: Dynamic = (): Dynamic =>
          (0, canNavigateSelection)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          });
        if (!callback15()) return;
        let current4: Dynamic = deps.selectionRef.current,
          callback16: Dynamic = (input?: Dynamic): Dynamic =>
            (0, sameSelectionStructure)(current4, input);
        if (source.kind === "all") {
          let value654: Dynamic = (0, selectionNavigationScope)(
            current4,
            false,
          );
          if (value654 === "panel") return;
          if (value654 === "canvas") {
            deps.abandonSelectionGesture();
            let current5: Dynamic = deps.value87.current;
            deps.applyCanvasSelection(
              (0, selectionFromBoards)({
                files: new Set(
                  current5.artboards.map(
                    (input?: Dynamic): Dynamic => input.file,
                  ),
                ),
                notes: new Set(
                  (current5.annotations ?? []).map(
                    (input?: Dynamic): Dynamic => input.id,
                  ),
                ),
              }),
            );
            return;
          }
        }
        if (source.kind === "nudge") {
          let { dx: value654, dy: value655 }: Dynamic = source,
            value656: Dynamic = Date.now(),
            callback17: Dynamic = async (): Promise<Dynamic> => {
              if (
                !callback15() ||
                (source.repeat &&
                  Date.now() - value656 > deps.count3 &&
                  deps.value48.current > 1)
              )
                return;
              let current5: Dynamic = deps.selectionRef.current;
              if (!callback16(current5)) return;
              deps.value50.current++;
              let value657: Dynamic = deps.abandonSelectionGesture();
              Date.now() - deps.value53.current.at >
                ModelModelStateLimit &&
                (deps.value53.current = {
                  at: 0,
                  seq: new Map(),
                  dead: new Set(),
                });
              let current6: Dynamic = deps.value53.current;
              current6.at = Date.now();
              let value658: Dynamic = deps.callback(current5).filter(
                  ([input]: Dynamic): Dynamic => !current6.dead.has(input),
                ),
                values: Dynamic = new Set(
                  value658.map(([input]: Dynamic): Dynamic => input),
                ),
                value659: Dynamic = (0, canvasBoardSelection)(
                  current5,
                ),
                value660: Dynamic =
                  (0, boardSelectionCount)(value659) > 0 &&
                  true &&
                  deps.value44.current(value659, value654, value655, current6.seq);
              if (value658.length === 0) {
                value660 &&
                  (0, announce)(
                    (0, moveDirectionAnnouncement)(
                      value654,
                      value655,
                    ),
                  );
                return;
              }
              let value661: Dynamic = deps.value432.current?.group(values),
                current7: Dynamic = deps.focusedFileRef.current,
                values2: Dynamic = new Set(),
                value662: Dynamic = await Promise.all(
                  value658.map(
                    ([input, input2]: Dynamic): Dynamic =>
                      (
                        deps.value177.current.get(input)?.nudgeSelection(
                          input2,
                          value654,
                          value655,
                          input === current7
                            ? (): Dynamic => {
                                values2.add(input);
                                deps.value54(input);
                              }
                            : undefined,
                        ) ?? Promise.resolve(null)
                      )
                        .then(
                          (input3?: Dynamic): Dynamic => (
                            input3?.did === "timeout" &&
                              current6.dead.add(input),
                            input3
                          ),
                        )
                        .catch((): Dynamic => null)
                        .finally((): Dynamic => value661?.settled(input)),
                  ),
                ).finally((): Dynamic => value661?.end());
              for (let value664 of values as Dynamic)
                current6.seq.set(
                  value664,
                  deps.value440.current.get(value664) ?? 0,
                );
              current6.at = Date.now();
              let entries: Dynamic = new Map(),
                values3: Dynamic = new Set(values2),
                index: Dynamic = 0,
                index2: Dynamic = 0;
              value662.forEach(
                (input?: Dynamic, options?: Dynamic): Dynamic => {
                  let value664: Dynamic = value658[options][0];
                  input?.did === "reordered"
                    ? (entries.set(value664, input.tids),
                      values3.add(value664),
                      index2++)
                    : input?.did === "nudged" &&
                      (values3.add(value664), index++);
                },
              );
              index > 0 || value660
                ? (0, announce)(
                    (0, moveDirectionAnnouncement)(
                      value654,
                      value655,
                    ),
                  )
                : index2 > 0 &&
                  (0, announce)(
                    (0, reorderAnnouncement)(
                      value654 < 0 || value655 < 0 ? -1 : 1,
                      false,
                    ),
                  );
              if (
                values3.size === 0 ||
                deps.selectionEpochRef.current !== value657
              )
                return;
              let current8: Dynamic = deps.selectionRef.current;
              deps.applyCanvasSelection(
                entries.size > 0
                  ? (0, selectionAfterElementEdits)(
                      current8,
                      "next",
                      new Map(),
                      entries,
                      deps.value19,
                    )
                  : current8,
                {
                  repush: values3,
                },
              );
              let value663: Dynamic =
                current7 != null &&
                current7 === deps.focusedFileRef.current &&
                values2.has(current7)
                  ? deps.frameSelectionTokensRef.current.get(current7)
                  : undefined;
              value663 != null &&
                (deps.value31.current = {
                  token: value663,
                  at: Date.now(),
                });
            };
          deps.value48.current++;
          deps.value49(callback17, (): Dynamic => {
            deps.value48.current--;
          });
          return;
        }
        let value653: Dynamic =
          source.kind === "enter"
            ? "children"
            : source.kind === "parent"
              ? "parents"
              : source.kind === "all"
                ? "siblings"
                : source.kind;
        deps.value49(async (): Promise<Dynamic> => {
          if (!callback15()) return;
          let current5: Dynamic = deps.selectionRef.current;
          if (!callback16(current5)) return;
          deps.value50.current++;
          let value654: Dynamic = deps.abandonSelectionGesture(),
            value655: Dynamic = deps.callback(current5),
            value656: Dynamic = (
              value653 === "children" ? [...current5.artboards] : []
            ).map(async (input?: Dynamic): Promise<Dynamic> => {
              if (
                deps.value73.current.artboards.find(
                  (input2?: Dynamic): Dynamic => input2.file === input,
                )?.frameless
              )
                return null;
              let value661: Dynamic = await deps.value177.current
                .get(input)
                ?.ensureOutline();
              return value661
                ? [
                    input,
                    value661
                      .filter(
                        (input2?: Dynamic): Dynamic =>
                          !SelectionActionsHelmetScHelmetPattern.test(
                            input2.tag,
                          ),
                      )
                      .map((input2?: Dynamic): Dynamic => input2.tid),
                  ]
                : null;
            }),
            value657: Dynamic = value655.map(
              async ([input, input2]: Dynamic): Promise<Dynamic> => {
                let value661: Dynamic = await deps.value177.current
                  .get(input)
                  ?.walkTids(input2, value653);
                return value661 == null
                  ? null
                  : [
                      input,
                      value653 === "parents" && value661.length === 0
                        ? "artboard"
                        : value661,
                    ];
              },
            ),
            [value658, value659]: Dynamic = await Promise.all([
              Promise.all(value656),
              Promise.all(value657),
            ]);
          if (deps.selectionEpochRef.current !== value654) return;
          let value660: Dynamic = (0, selectionAfterElementEdits)(
            current5,
            value653,
            new Map(
              value658.filter((input?: Dynamic): Dynamic => input != null),
            ),
            new Map(
              value659.filter((input?: Dynamic): Dynamic => input != null),
            ),
            deps.value19,
          );
          if (value660 === current5) return;
          deps.applyCanvasSelection(value660);
          let current6: Dynamic = deps.focusedFileRef.current;
          if (
            value653 === "children" &&
            !(current6 != null && value660.elements.has(current6))
          ) {
            let value661: Dynamic = deps.value73.current.artboards.find(
              (input?: Dynamic): Dynamic =>
                value660.elements.has(input.file) &&
                current5.artboards.has(input.file),
            );
            value661 && (deps.value50.current++, deps.value34(value661.file));
          }
        });
      }

/** 删除命令触发时运行：在各画板中移除选中的元素并记录历史；只读、失败或重复行无法删除时提示原因。 */
function deleteSelectedElements(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly selectionRef: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value218: Dynamic; readonly value22: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value459: Dynamic }, input?: Dynamic, options: Dynamic = {}): Dynamic {
        if (
          !(0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          })
        )
          return false;
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = [...current4.elements].map(
            ([input2, input3]: Dynamic): Dynamic => [
              input2,
              {
                tids: [...input3.tids],
              },
            ],
          );
        deps.abandonSelectionGesture();
        let value654: Dynamic = options.elementsOnly
            ? emptyBoardSelection
            : (0, canvasBoardSelection)(current4),
          value655: Dynamic =
            (0, boardSelectionCount)(value654) > 0 &&
            value653.length > 0
              ? (0, randomSessionToken)()
              : undefined,
          value656: Dynamic =
            value655 !== undefined ? deps.value144(value655) : null,
          value657: Dynamic =
            (0, boardSelectionCount)(value654) > 0
              ? deps.value459.current(value654, value655)
              : false,
          value658: Dynamic = deps.value432.current?.group(
            value653.map(([input2]: Dynamic): Dynamic => input2),
            {
              bound: value655,
            },
          ),
          entries: Dynamic = new Map(deps.value22.current);
        (value657 && value656 ? value656 : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                value653.map(
                  ([input2, input3]: Dynamic): Dynamic =>
                    (deps.value22.current.get(input2) === entries.get(input2)
                      ? deps.value177.current
                          .get(input2)
                          ?.removeSelection(input3.tids)
                      : Promise.resolve("skipped")
                    )
                      ?.catch((): Dynamic => "failed")
                      .finally((): Dynamic => value658?.settled(input2)),
                ),
              ),
          )
          .finally((): Dynamic => value658?.end())
          .then((items?: Dynamic): Dynamic => {
            if (items.length === 0) return;
            let value659: Dynamic = items.some(
              (input2?: Dynamic): Dynamic =>
                input2 !== "failed" && input2 !== "skipped" && !!input2,
            );
            if (
              items.some((input2?: Dynamic): Dynamic => input2 === "failed")
            ) {
              deps.value448.current(
                value659
                  ? input + " \u2014 one artboard's delete failed"
                  : uiMessage("canvas.designCanvas.nothingDeletedAnArtboardCould"),
              );
              return;
            }
            let length: Dynamic = items.filter(
              (input2?: Dynamic): Dynamic => input2 === "skipped",
            ).length;
            if (length > 0) {
              deps.value448.current(
                (0, selectionActionFailureMessage)(
                  "delete",
                  length,
                  value659,
                ),
              );
              return;
            }
            items.every((input2?: Dynamic): Dynamic => !input2)
              ? deps.value448.current(
                  uiMessage("canvas.designCanvas.nothingDeletedRepeatedRowsAre"),
                )
              : (0, announce)(
                  items.every(Boolean)
                    ? input
                    : input + " \u2014 repeated rows stayed",
                );
          });
        deps.applyCanvasSelection(
          options.elementsOnly
            ? (0, selectionFromBoards)(
                (0, canvasBoardSelection)(current4),
              )
            : emptyCanvasSelection,
        );
        return true;
      }

/** 复制（Duplicate）命令触发时运行：在各画板内就地复制选中的元素并更新选择，失败或不可复制时提示原因。 */
function duplicateSelectedElements(deps: { readonly abandonSelectionGesture: Dynamic; readonly selectionRef: Dynamic; readonly value138: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value218: Dynamic; readonly value22: Dynamic; readonly value31: Dynamic; readonly value323: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value48: Dynamic }, input: Dynamic = {}): Dynamic {
        if (
          !(0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          }) ||
          deps.value48.current > 0
        )
          return false;
        deps.value31.current = null;
        deps.abandonSelectionGesture();
        let value653: Dynamic = deps.value138(),
          value654: Dynamic = input.elementsOnly
            ? emptyBoardSelection
            : (0, canvasBoardSelection)(deps.selectionRef.current),
          value655: Dynamic =
            (0, boardSelectionCount)(value654) > 0 &&
            value653.length > 0
              ? (0, randomSessionToken)()
              : undefined,
          value656: Dynamic =
            value655 !== undefined ? deps.value144(value655) : null,
          value657: Dynamic =
            (0, boardSelectionCount)(value654) > 0
              ? deps.value323.current(value654, value655)
              : false,
          value658: Dynamic = deps.value432.current?.group(
            value653.map(([input2]: Dynamic): Dynamic => input2),
            {
              bound: value655,
            },
          ),
          entries: Dynamic = new Map(deps.value22.current);
        (value657 && value656 ? value656 : Promise.resolve())
          .then(
            (): Dynamic =>
              Promise.all(
                value653.map(
                  ([input2, input3]: Dynamic): Dynamic =>
                    (deps.value22.current.get(input2) === entries.get(input2)
                      ? deps.value177.current
                          .get(input2)
                          ?.duplicateSelection(input3.tids)
                      : Promise.resolve("skipped")
                    )
                      ?.catch((): Dynamic => "failed")
                      .finally((): Dynamic => value658?.settled(input2)),
                ),
              ),
          )
          .finally((): Dynamic => value658?.end())
          .then((items?: Dynamic): Dynamic => {
            let value659: Dynamic = items.some(
              (input2?: Dynamic): Dynamic =>
                input2 !== "failed" && input2 !== "skipped" && !!input2,
            );
            if (
              items.some((input2?: Dynamic): Dynamic => input2 === "failed")
            ) {
              deps.value448.current(
                value659
                  ? uiMessage("canvas.designCanvas.duplicatedOneArtboardSDuplicate")
                  : uiMessage("canvas.designCanvas.nothingDuplicatedAnArtboardCould"),
              );
              return;
            }
            let length: Dynamic = items.filter(
              (input2?: Dynamic): Dynamic => input2 === "skipped",
            ).length;
            if (length > 0) {
              deps.value448.current(
                (0, selectionActionFailureMessage)(
                  "duplicate",
                  length,
                  value659,
                ),
              );
              return;
            }
            items.length > 0 &&
              items.every((input2?: Dynamic): Dynamic => !input2) &&
              deps.value448.current(
                uiMessage("canvas.designCanvas.nothingDuplicatedRepeatedRowsAre"),
              );
          });
        return true;
      }

/** 水平或垂直翻转命令触发时运行：翻转画板内选中的元素，并把选中的画布图形交给标注翻转逻辑；部分失败时提示与播报。 */
function flipSelectedObjects(deps: { readonly applyCanvasSelection: Dynamic; readonly selectionRef: Dynamic; readonly value144: Dynamic; readonly value149: Dynamic; readonly value150: Dynamic; readonly value155: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value45: Dynamic; readonly value46: Dynamic }, input?: Dynamic, options: Dynamic = {}): Dynamic {
        if (deps.value149.current) {
          deps.value448.current(GeometryFlipAnnotationsLabel_3 + ".");
          return true;
        }
        if (
          !deps.value224.current ||
          !(0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          }) ||
          deps.value150() !== undefined
        )
          return false;
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = [...current4.elements]
            .filter(
              ([input2, input3]: Dynamic): Dynamic =>
                input3.name === deps.value19(input2),
            )
            .map(
              ([input2, input3]: Dynamic): Dynamic => [
                input2,
                {
                  tids: [...input3.tids],
                },
              ],
            ),
          value654: Dynamic = options.elementsOnly
            ? emptyCanvasSelectionFiles
            : current4.notes;
        if (value653.length === 0 && value654.size === 0) {
          current4.artboards.size > 0 &&
            deps.value448.current(GeometryFlipAnnotationsLabel_2);
          return false;
        }
        if (value653.length === 0) return deps.value46.current(value654, input);
        deps.value155.current++;
        deps.value149.current = true;
        let flag2: Dynamic = true,
          callback15: Dynamic = (): Dynamic => {
            flag2 &&
              ((flag2 = false),
              (deps.value149.current = false),
              deps.value155.current--);
          },
          value655: Dynamic = (window as Dynamic).setTimeout(
            callback15,
            artboardRevealSettleTimeoutMs,
          );
        (async (): Promise<Dynamic> => {
          let value656: Dynamic = await Promise.all(
              value653.map(
                ([input2, input3]: Dynamic): Dynamic =>
                  (
                    deps.value177.current.get(input2)?.flipRead(input3.tids) ??
                    Promise.resolve(null)
                  ).catch((): Dynamic => null),
              ),
            ),
            current5: Dynamic = deps.selectionRef.current;
          if (
            !deps.value224.current ||
            deps.value150() !== undefined ||
            value653.some(
              ([input2, input3]: Dynamic): Dynamic =>
                current5.elements.get(input2)?.tids.join() !==
                input3.tids.join(),
            ) ||
            [...value654].some(
              (input2?: Dynamic): Dynamic => !current5.notes.has(input2),
            )
          )
            return;
          if (
            !flag2 ||
            value656.some((input2?: Dynamic): Dynamic => input2 === null)
          )
            return void deps.value448.current(
              CouldnTFlipRightNowTryAgainMessage,
            );
          let value657: Dynamic =
              value654.size > 0
                ? (0, randomSessionToken)()
                : undefined,
            value658: Dynamic =
              value657 !== undefined ? deps.value144(value657) : null,
            value659: Dynamic =
              value654.size > 0
                ? deps.value45.current(value654, input, value657)
                : null,
            value660: Dynamic = deps.value432.current?.group(
              value653.map(([input2]: Dynamic): Dynamic => input2),
              {
                bound: value657,
              },
            );
          value659?.flipped && value658 && (await value658);
          let value661: Dynamic = await Promise.all(
              value653.map(
                ([input2]: Dynamic, options2?: Dynamic): Dynamic =>
                  (
                    deps.value177.current
                      .get(input2)
                      ?.flipSelection(value656[options2], input) ??
                    Promise.resolve(null)
                  )
                    .catch((): Dynamic => null)
                    .finally((): Dynamic => value660?.settled(input2)),
              ),
            ).finally((): Dynamic => value660?.end()),
            value662: Dynamic = value661.some(
              (input2?: Dynamic): Dynamic => (input2?.flipped ?? 0) > 0,
            ),
            value663: Dynamic = value662 || value659?.flipped === true,
            value664: Dynamic = value661.some(
              (input2?: Dynamic): Dynamic =>
                input2 === null ||
                (input2.flipped === 0 &&
                  (input2.refused === undefined ||
                    input2.refused ===
                      CouldnTFlipRightNowTryAgainMessage)),
            ),
            value665: Dynamic = [
              ...value661.map((input2?: Dynamic): Dynamic => input2?.refused),
              value659?.refused,
            ].filter((input2?: Dynamic): Dynamic => input2 !== undefined),
            value666: Dynamic =
              value665.find(
                (input2?: Dynamic): Dynamic =>
                  input2 !== FlippingThisWayWouldnTChangeItMessage,
              ) ?? (value663 ? undefined : value665[0]),
            value667: Dynamic = value664
              ? value663
                ? PartOfTheSelectionCouldnTBeMessage
                : CouldnTFlipRightNowTryAgainMessage
              : value666 !== undefined
                ? (0, partialFlipMessage)(
                    value666,
                    value663,
                    GeometryFlipAnnotationsWytKytYtConfig,
                  )
                : undefined;
          value662 &&
            deps.applyCanvasSelection(deps.selectionRef.current, {
              repush: new Set(
                value653.map(([input2]: Dynamic): Dynamic => input2),
              ),
            });
          !(!value664 && options.then?.(value667, value663) === true) &&
            (value667 !== undefined && deps.value448.current(value667),
            value663 &&
              (0, announce)(
                (0, flipDirectionAnnouncement)(input),
              ));
        })().finally((): Dynamic => {
          (window as Dynamic).clearTimeout(value655);
          callback15();
        });
        return true;
      }

/** 跨画板拖动携带 pieces（元素被拖出到空白画布）时运行：把拖出的元素生成为新画板或画布图形，处理复制/移动、只读与中断，返回写入与被拒结果。 */
async function commitPieceDragOntoCanvas(deps: { readonly abandonSelectionGesture: Dynamic; readonly callback2: Dynamic; readonly callback3: Dynamic; readonly doc: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly supportsLoadState: Dynamic; readonly value127: Dynamic; readonly value141: Dynamic; readonly value142: Dynamic; readonly value143: Dynamic; readonly value144: Dynamic; readonly value153: Dynamic; readonly value177: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value224: Dynamic; readonly value396: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic): Promise<Dynamic> {
      let { token: value653, travel: value654 }: Dynamic = input,
        current4: Dynamic = deps.selectionRef.current,
        value655: Dynamic = value654?.pieces ?? [],
        items: Dynamic = [...input.unanswered],
        callback15: Dynamic = (): Dynamic => {
          for (let value662 of input.plans.keys() as Dynamic) {
            let entry: Dynamic = deps.value177.current.get(value662);
            entry?.moveCancel(value653);
            entry?.moveSettle();
          }
        },
        callback16: Dynamic = (): Dynamic => (
          callback15(),
          {
            written: [],
            refused: items,
            selection: current4,
          }
        ),
        callback17: Dynamic = async (input2?: Dynamic): Promise<Dynamic> => {
          let value662: Dynamic =
              input.copy && input.canvasMoved
                ? deps.value144(value653)
                : Promise.resolve(),
            value663: Dynamic = input.canvas();
          for (let value664 of (value654?.travellers ?? []) as Dynamic)
            value654?.endHome(value664.file, false);
          await value662;
          deps.value448.current(
            value663 === false
              ? uiMessage("canvas.designCanvas.nothing") +
                  (input.copy ? "copied" : "moved") +
                  " \u2014 the drag was interrupted; try it again."
              : input2,
          );
          input.copy &&
            input.canvasMoved &&
            (deps.value142.current.has(value653)
              ? Promise.resolve()
              : deps.value144(value653)
            ).then((): Dynamic => {
              let entry: Dynamic = deps.value142.current.get(value653);
              deps.value142.current.delete(value653);
              entry &&
                (entry.files.size > 0 || entry.notes.size > 0) &&
                deps.setSelection(
                  (0, selectionFromBoards)({
                    files: entry.files,
                    notes: entry.notes,
                  }),
                );
            });
          return callback16();
        };
      if (!value654 || value655.length === 0)
        return callback17(
          uiMessage("canvas.designCanvas.nothing") + (input.copy ? "copied" : "moved") + ".",
        );
      callback15();
      let files: Dynamic = deps.doc.content().files;
      if (
        Object.keys(files).length + value655.length >
        PlatformFileContentFilesValue
      )
        return callback17(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") + (input.copy ? "copied" : "moved") + "; "
            : "") +
            uiMessage("canvas.designCanvas.couldnTMakeNewArtboards") +
            String(PlatformFileContentFilesValue) +
            "-file limit; delete something first",
        );
      let state: Dynamic = {
          moves: [],
          annMoves: [],
        },
        items2: Dynamic = [],
        callback18: Dynamic = (): Dynamic => {},
        promise: Dynamic = new Promise((input2?: Dynamic): Dynamic => {
          callback18 = input2;
        });
      deps.value143.current.set(value653, (input2?: Dynamic): Dynamic => {
        state = input2;
      });
      deps.value141.current.set(value653, (source?: Dynamic): Dynamic => {
        source.kind === "add"
          ? items2.push({
              entries: source.entries,
              anns: source.anns ?? [],
            })
          : source.kind === "ann-add" &&
            items2.push({
              entries: [],
              anns: [source.spec],
            });
        callback18();
      });
      let value656: Dynamic = input.canvasMoved
          ? deps.value144(value653)
          : Promise.resolve(),
        value657: Dynamic;
      try {
        value657 = input.canvas();
      } finally {
        deps.value143.current.delete(value653);
      }
      value654.copy &&
        input.canvasMoved &&
        (await Promise.race([
          promise,
          value656,
          new Promise((input2?: Dynamic): Dynamic => setTimeout(input2, 2e3)),
        ]));
      deps.value141.current.delete(value653);
      deps.value142.current.delete(value653);
      let state2: Dynamic = {
        entries: items2.flatMap(
          (input2?: Dynamic): Dynamic => input2.entries,
        ),
        anns: items2.flatMap((input2?: Dynamic): Dynamic => input2.anns),
      };
      if (input.canvasMoved && value657 === false) {
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          uiMessage("canvas.designCanvas.nothing") +
            (value654.copy ? "copied" : "moved") +
            " \u2014 the drag was interrupted; try it again.",
        );
        return callback16();
      }
      let callback19: Dynamic = (): Dynamic => {
        (state.moves.length > 0 || state.annMoves.length > 0) &&
          deps.value396.current(
            {
              kind: "move",
              moves: state.moves,
              ...(state.annMoves.length > 0
                ? {
                    anns: state.annMoves,
                  }
                : {}),
            },
            new Set(),
            undefined,
            value653,
          );
        (state2.entries.length > 0 || state2.anns.length > 0) &&
          deps.value396.current(
            {
              kind: "add",
              entries: state2.entries,
              ...(state2.anns.length > 0
                ? {
                    anns: state2.anns,
                  }
                : {}),
            },
            new Set(
              state2.entries.map((input2?: Dynamic): Dynamic => input2.file),
            ),
            undefined,
            value653,
          );
      };
      if (
        Object.keys(deps.doc.content().files).length + value655.length >
        PlatformFileContentFilesValue
      ) {
        callback19();
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") + (value654.copy ? "copied" : "moved") + "; "
            : "") +
            uiMessage("canvas.designCanvas.couldnTMakeNewArtboards") +
            String(PlatformFileContentFilesValue) +
            "-file limit; delete something first",
        );
        return callback16();
      }
      let items3: Dynamic = [],
        entries: Dynamic = new Map(),
        state3: Dynamic = {
          files: {
            ...deps.doc.content().files,
            ...Object.fromEntries(
              state2.entries.map(
                (input2?: Dynamic): Dynamic => [input2.file, input2.src],
              ),
            ),
          },
          artboards: [
            ...deps.value73.current.artboards,
            ...state2.entries.map((input2?: Dynamic): Dynamic => input2.spec),
          ],
        };
      try {
        for (let value662 of value655 as Dynamic) {
          let entry: Dynamic = deps.value177.current.get(value662.file);
          if (!entry || (await entry.travellerHtml(value662.tid)) === null)
            continue;
          let value663: Dynamic = entry.serializeSelection([value662.tid], {
            lift: {
              ew: value662.box.w,
              ox: 0,
              oy: 0,
            },
          });
          if (!value663) continue;
          await entry.flushPending();
          let value664: Dynamic =
              (await (0, getKvClient)().get(
                (0, PlatformFileContentHandler_4)(value662.file),
              )) ??
              files[value662.file] ??
              "",
            value665: Dynamic = (0, uniqueArtboardFile)(
              state3.files,
              "Piece",
              deps.supportsLoadState,
            ),
            value666: Dynamic = (0, buildDcDocument)(
              value663,
              typeof value664 == "string" ? value664 : "",
            ),
            value667: Dynamic = entry.describeTids([value662.tid])[0],
            value668: Dynamic = value667
              ? value667.tag.charAt(0).toUpperCase() + value667.tag.slice(1)
              : "Piece",
            state4: Dynamic = {
              file: value665,
              x: Math.max(
                -PlatformFileContentConstant_18,
                Math.min(
                  PlatformFileContentConstant_18,
                  Math.round(value662.box.x),
                ),
              ),
              y: Math.max(
                -PlatformFileContentConstant_18,
                Math.min(
                  PlatformFileContentConstant_18,
                  Math.round(value662.box.y),
                ),
              ),
              w: Math.min(
                PlatformFileContentLimit_6,
                Math.max(
                  PlatformFileContentConstant_17,
                  value662.box.w,
                ),
              ),
              h: Math.min(
                PlatformFileContentLimit_6,
                Math.max(
                  PlatformFileContentConstant_17,
                  value662.box.h,
                ),
              ),
              title: (0, uniqueElementArtboardTitle)(
                value668,
                state3.artboards,
              ),
              frameless: true,
              ...deps.callback3(),
            };
          state3.files[value665] = value666;
          state3.artboards.push(state4);
          items3.push({
            file: value665,
            src: value666,
            spec: state4,
            home: value662.file,
            tid: value662.tid,
          });
          entries.set(value662.file, [
            ...(entries.get(value662.file) ?? []),
            value662.tid,
          ]);
        }
      } catch (value662: Dynamic) {
        callback19();
        for (let value663 of value654.travellers as Dynamic)
          value654.endHome(value663.file, false);
        console.error("set pieces:", value662);
        deps.value448.current(
          input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
                (value654.copy ? "copied" : "moved") +
                "; the elements could not be lifted and stayed."
            : uiMessage("canvas.designCanvas.nothing") +
                (value654.copy ? "copied" : "moved") +
                " \u2014 the elements could not be lifted.",
        );
        return callback16();
      }
      if (items3.length === 0) {
        callback19();
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
              (value654.copy ? "copied" : "moved") +
              "; the elements stayed \u2014 "
            : uiMessage("canvas.designCanvas.nothing") +
              (value654.copy ? "copied" : "moved") +
              " \u2014 ") +
            "repeated, nested or locked elements stay with their artboard.",
        );
        return callback16();
      }
      if (!deps.value224.current) {
        callback19();
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
              (value654.copy ? "copied" : "moved") +
              "; the elements stayed \u2014 "
            : uiMessage("canvas.designCanvas.nothing") +
              (value654.copy ? "copied" : "moved") +
              " \u2014 ") + uiMessage("canvas.designCanvas.theCanvasIsReadOnly"),
        );
        return callback16();
      }
      let items4: Dynamic = [
        ...items3.map(
          ({ file: file, src: src, spec: spec }: Dynamic): Dynamic => ({
            file: file,
            src: src,
            spec: spec,
          }),
        ),
        ...state2.entries,
      ];
      deps.value396.current(
        {
          kind: "add",
          entries: items4,
          ...(state2.anns.length > 0
            ? {
                anns: state2.anns,
              }
            : {}),
          ...(state.moves.length > 0
            ? {
                moves: state.moves,
              }
            : {}),
          ...(state.annMoves.length > 0
            ? {
                annMoves: state.annMoves,
              }
            : {}),
        },
        new Set(items4.map((input2?: Dynamic): Dynamic => input2.file)),
        undefined,
        value653,
      );
      try {
        for (let value662 of items3 as Dynamic) {
          await (0, getKvClient)().set(
            (0, PlatformFileContentHandler_4)(value662.file),
            value662.src,
          );
          deps.value127.current.set(value662.file, Date.now());
        }
      } catch (value662: Dynamic) {
        for (let value663 of value654.travellers as Dynamic)
          value654.endHome(value663.file, false);
        console.error("set pieces:", value662);
        deps.value448.current(
          uiMessage("canvas.designCanvas.couldnTFinishTheDrop") +
            (0, keyboardShortcutLabel)("Z") +
            " takes back what was made.",
        );
        return callback16();
      }
      deps.value98({
        artboards: [
          ...deps.value73.current.artboards.filter(
            (input2?: Dynamic): Dynamic =>
              !items3.some(
                (input3?: Dynamic): Dynamic => input3.file === input2.file,
              ),
          ),
          ...items3.map((input2?: Dynamic): Dynamic => input2.spec),
        ],
      });
      let items5: Dynamic = [...entries.keys()];
      callback15();
      let value658: Dynamic = value654.copy
          ? undefined
          : deps.value432.current?.group(items5, {
              bound: value653,
              atomic: true,
            }),
        items6: Dynamic = [...items],
        items7: Dynamic = [],
        entries2: Dynamic = new Map();
      await Promise.all(
        items5.map(async (input2?: Dynamic): Promise<Dynamic> => {
          if (value654.copy) {
            value654.endHome(input2, false);
            return;
          }
          let entry: Dynamic = deps.value177.current.get(input2),
            value662: Dynamic = entries.get(input2) ?? [],
            value663: Dynamic = (
              current4.elements.get(input2)?.tids ?? []
            ).filter(
              (input3?: Dynamic): Dynamic => !value662.includes(input3),
            ),
            value664: Dynamic = entry
              ? await entry
                  .removeTravelled(value662, value663)
                  .catch((): Dynamic => "failed")
              : "failed";
          value658?.settled(input2);
          typeof value664 == "string"
            ? items6.push(input2)
            : (items7.push(input2), entries2.set(input2, value664.kept));
          value654.endHome(input2, typeof value664 != "string");
        }),
      );
      value658?.end();
      for (let value662 of value654.travellers as Dynamic)
        items5.includes(value662.file) ||
          value654.endHome(value662.file, false);
      for (let value662 of items7 as Dynamic)
        deps.value153.current.set(value662, Date.now());
      let value659: Dynamic = items5.filter(
          (input2?: Dynamic): Dynamic => items6.includes(input2),
        ),
        entries3: Dynamic = new Map();
      for (let value662 of value655 as Dynamic)
        items3.some(
          (input2?: Dynamic): Dynamic =>
            input2.home === value662.file && input2.tid === value662.tid,
        ) ||
          entries3.set(value662.file, [
            ...(entries3.get(value662.file) ?? []),
            value662.tid,
          ]);
      let callback20: Dynamic = (items8?: Dynamic): Dynamic =>
        items8.length === 1
          ? items8[0]
          : items8.slice(0, -1).join(", ") +
            " and " +
            items8[items8.length - 1];
      if (value659.length > 0) {
        let value662: Dynamic = value659.map(deps.callback2);
        deps.value448.current(
          uiMessage("canvas.designCanvas.movedOntoTheCanvasBut") +
            callback20(value662) +
            " kept what was dragged, so it is now in both places. Check " +
            (value662.length === 1 ? uiMessage("canvas.designCanvas.thatArtboard") : uiMessage("canvas.designCanvas.thoseArtboards")) +
            ".",
        );
      } else
        entries3.size > 0
          ? deps.value189(
              (value654.copy ? "Copied" : "Moved") +
                " " +
                String(items3.length) +
                (items3.length === 1 ? " element" : " elements") +
                " onto the canvas. The rest stayed in " +
                callback20([...entries3.keys()].map(deps.callback2)) +
                " \u2014 repeated, nested or locked elements stay with their artboard.",
            )
          : deps.value189(
              (value654.copy ? "Copied" : "Moved") +
                (items3.length === 1
                  ? ""
                  : " " + String(items3.length) + " elements") +
                " onto the canvas",
            );
      deps.abandonSelectionGesture();
      let entries4: Dynamic = new Map();
      if (!value654.copy) {
        for (let [value662, value663] of current4.elements as Dynamic)
          items5.includes(value662) || entries4.set(value662, value663);
        for (let value662 of items5 as Dynamic) {
          let entry: Dynamic = current4.elements.get(value662);
          if (!entry) continue;
          let value663: Dynamic = items7.includes(value662)
            ? (entries2.get(value662) ?? [])
            : null;
          value663 === null
            ? entries4.set(value662, entry)
            : value663.length > 0 &&
              entries4.set(value662, {
                ...entry,
                tids: value663,
                rect: null,
                count: value663.length,
              });
        }
      }
      let current5: Dynamic = deps.focusedFileRef.current;
      (current5 == null ||
        entries4.get(current5) !== current4.elements.get(current5)) &&
        deps.value62();
      let value660: Dynamic = (0, replaceSelectedElements)(
        (0, selectionFromArtboards)(
          new Set(items3.map((input2?: Dynamic): Dynamic => input2.file)),
        ),
        entries4,
        null,
      );
      deps.setSelection(value660);
      for (let value662 of [
        ...new Set([
          ...items5,
          ...items,
          ...value654.travellers.map(
            (input2?: Dynamic): Dynamic => input2.file,
          ),
        ]),
      ] as Dynamic)
        deps.value177.current.get(value662)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let value662 of new Set([
          ...items7,
          ...entries4.keys(),
        ]) as Dynamic) {
          let value663: Dynamic = entries4.get(value662)?.tids ?? null;
          value662 === deps.focusedFileRef.current
            ? deps.setShownFrameSelection(value662, value663)
            : deps.value177.current
                .get(value662)
                ?.setShownSelection(
                  value663,
                  value663 ? deps.value19(value662) : null,
                );
        }
      }, 80);
      let value661: Dynamic = items.filter(
        (input2?: Dynamic): Dynamic =>
          !items5.includes(input2) && current4.elements.has(input2),
      );
      value661.length > 0 &&
        value659.length === 0 &&
        entries3.size === 0 &&
        deps.value448.current(
          uiMessage("canvas.designCanvas.nothingMovedInside") +
            callback20(value661.map(deps.callback2)) +
            "; the rest " +
            (value654.copy ? "copied" : "moved") +
            ".",
        );
      return {
        written: items7,
        refused: items6,
        selection: value660,
      };
    }

/** 元素拖动松手后的提交：把元素移动或复制到目标画板（landTravellers/moveElements），失败时回滚并合并历史，返回写入与被拒结果；含 pieces 时转交 commitPieceDragOntoCanvas。 */
async function commitElementMoveAcrossArtboards(deps: { readonly applyCanvasSelection: Dynamic; readonly callback2: Dynamic; readonly callback4: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value142: Dynamic; readonly value144: Dynamic; readonly value153: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value25: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic }, input?: Dynamic): Promise<Dynamic> {
      let {
        token: value653,
        plans: value654,
        unanswered: value655,
        travel: value656,
      }: Dynamic = input;
      if (value656?.pieces) return deps.callback4(input);
      input.canvas();
      let items: Dynamic = [...value654.keys()],
        current4: Dynamic = deps.selectionRef.current,
        current5: Dynamic = deps.focusedFileRef.current,
        items2: Dynamic = [...value655],
        entries: Dynamic = new Map(current4.elements),
        items3: Dynamic = [],
        primary: Dynamic = current4.primary,
        items4: Dynamic = [];
      if (value656) {
        let target: Dynamic = value656.target,
          value660: Dynamic = value656.travellers
            .filter((input2?: Dynamic): Dynamic => !input2.external)
            .map((input2?: Dynamic): Dynamic => input2.file),
          value661: Dynamic = items.filter(
            (input2?: Dynamic): Dynamic =>
              input2 !== target && !value660.includes(input2),
          ),
          items6: Dynamic = [],
          entries2: Dynamic = new Map();
        for (let value665 of value656.travellers as Dynamic) {
          let entry: Dynamic = deps.value177.current.get(value665.file),
            items7: Dynamic = [];
          for (let value666 of value665.members as Dynamic) {
            let value667: Dynamic = value656.plan.landing.find(
                (input2?: Dynamic): Dynamic => input2.tid === value666.index,
              ),
              value668: Dynamic = value667
                ? (value666.html ??
                  (entry
                    ? await entry
                        .travellerHtml(value666.tid)
                        .catch((): Dynamic => null)
                    : null))
                : null;
            value667 && value668
              ? items6.push({
                  file: value665.file,
                  tid: value666.tid,
                  html: value668,
                  landing: value667,
                })
              : items7.push(value666.tid);
          }
          entries2.set(value665.file, items7);
        }
        let value662: Dynamic = value656.copy === true,
          value663: Dynamic = value662
            ? [target, ...value661]
            : [...new Set([target, ...value660, ...value661])],
          value664: Dynamic = deps.value432.current?.group(
            value663,
            value662
              ? {
                  bound: value653,
                }
              : {
                  bound: value653,
                  atomic: true,
                  holder: target,
                  waiting: value660.filter(
                    (input2?: Dynamic): Dynamic => input2 !== target,
                  ),
                },
          );
        try {
          current5 != null &&
            value663.includes(current5) &&
            (deps.value25.current = current5);
          let entry: Dynamic = deps.value177.current.get(target),
            value665: Dynamic =
              value662 && value660.includes(target)
                ? []
                : (current4.elements.get(target)?.tids ?? []),
            value666: Dynamic = await (
              entry?.landTravellers(
                items6.map(
                  ({ html: html, landing: landing }: Dynamic): Dynamic => ({
                    key: landing.tid,
                    html: html,
                    landing: landing,
                  }),
                ),
                value654.get(target) ?? [],
                value665,
              ) ?? Promise.resolve("failed")
            ).catch((): Dynamic => "failed");
          value664?.settled(target);
          let entries3: Dynamic = new Map(),
            items7: Dynamic = [],
            items8: Dynamic = [],
            callback15: Dynamic = async (): Promise<Dynamic> => {
              for (let value672 of [...items8].reverse() as Dynamic) {
                let entry2: Dynamic = deps.value177.current.get(value672),
                  value673: Dynamic = entry2
                    ? (value664?.discard(value672) ?? null)
                    : null;
                if (!entry2 || !value673) return false;
                if (
                  !(await entry2
                    .applyHistory(deps.value19(value672), "undo")
                    .catch((): Dynamic => false))
                ) {
                  value673();
                  return false;
                }
                entry2.dropRedo();
                items8.pop();
                items4.push(value672);
                items3 = items3.filter(
                  (input2?: Dynamic): Dynamic => input2 !== value672,
                );
                let entry3: Dynamic = current4.elements.get(value672);
                entry3
                  ? entries.set(value672, entry3)
                  : entries.delete(value672);
              }
              return true;
            };
          if (value666 === "failed") {
            items2.push(target);
            target === current5 &&
              deps.value25.current === current5 &&
              (deps.value25.current = null);
            for (let value672 of value656.travellers as Dynamic)
              entries2.set(
                value672.file,
                value672.members.map(
                  (input2?: Dynamic): Dynamic => input2.tid,
                ),
              );
          } else {
            for (let value672 of items6 as Dynamic) {
              let entry2: Dynamic = value666.landed.get(value672.landing.tid);
              if (!entry2 || entry2.length === 0) {
                entries2.get(value672.file)?.push(value672.tid);
                continue;
              }
              let value673: Dynamic = entries3.get(value672.file) ?? [];
              value673.push(value672.tid);
              entries3.set(value672.file, value673);
              items7.push(...entry2);
            }
            let stayers: Dynamic = value666.stayers;
            stayers && typeof stayers == "object"
              ? items7.push(...stayers.newTids)
              : (stayers === "refused" && items2.push(target),
                items7.push(...(value666.stayersOwn ?? value665)));
            (items7.length > 0 || entries3.size > 0) && items3.push(target);
            if (entries3.size > 0) {
              let value672: Dynamic = items2.indexOf(target);
              value672 >= 0 && items2.splice(value672, 1);
            }
            entries3.size > 0 && items8.push(target);
          }
          let value667: Dynamic = await Promise.all(
            value661.map(
              (input2?: Dynamic): Dynamic =>
                (
                  deps.value177.current
                    .get(input2)
                    ?.moveElements(value654.get(input2) ?? []) ??
                  Promise.resolve("failed")
                )
                  .catch((): Dynamic => "failed")
                  .finally((): Dynamic => value664?.settled(input2)),
            ),
          );
          value661.forEach((input2?: Dynamic, options?: Dynamic): Dynamic => {
            let value672: Dynamic = value667[options],
              entry2: Dynamic = current4.elements.get(input2);
            if (typeof value672 == "string" || !entry2) {
              (value672 === "refused" || value672 === "failed") &&
                items2.push(input2);
              input2 === current5 &&
                deps.value25.current === current5 &&
                (deps.value25.current = null);
              return;
            }
            entries.set(input2, {
              ...entry2,
              tids: value672.newTids,
              rect: null,
              count: value672.newTids.length,
            });
            items3.push(input2);
          });
          let value668: Dynamic = deps.callback2,
            callback16: Dynamic = (items11?: Dynamic): Dynamic =>
              items11.length <= 1
                ? (items11[0] ?? "")
                : items11.slice(0, -1).join(", ") +
                  " and " +
                  items11[items11.length - 1],
            items9: Dynamic = [],
            items10: Dynamic = [],
            value669: Dynamic = null;
          for (let value672 of value656.travellers as Dynamic) {
            if (value672.external) continue;
            if (value662) {
              value656.endHome(value672.file, false);
              value672.file !== target &&
                (entries3.get(value672.file)?.length ?? 0) > 0 &&
                entries.delete(value672.file);
              continue;
            }
            let entry2: Dynamic = deps.value177.current.get(value672.file),
              value673: Dynamic = entries3.get(value672.file) ?? [],
              value674: Dynamic = (
                current4.elements.get(value672.file)?.tids ?? []
              ).filter(
                (input2?: Dynamic): Dynamic => !value673.includes(input2),
              ),
              value675: Dynamic = value674,
              flag2: Dynamic = false;
            if (value669 != null) {
              value675 = current4.elements.get(value672.file)?.tids ?? [];
              value669.how === "partial" &&
                value673.length > 0 &&
                items9.push(value672.file);
            } else if (value673.length > 0) {
              value664?.admit(value672.file);
              let value676: Dynamic = entry2
                ? await entry2
                    .removeTravelled(value673, value674)
                    .catch((): Dynamic => "failed")
                : "failed";
              typeof value676 == "string"
                ? (value664?.settled(value672.file),
                  (value675 =
                    current4.elements.get(value672.file)?.tids ?? []),
                  (value669 = {
                    at: value672.file,
                    how: (await callback15()) ? "reverted" : "partial",
                  }),
                  value669.how === "partial" &&
                    items9.push(...items4, value672.file))
                : ((value675 = value676.kept),
                  (flag2 = true),
                  items3.push(value672.file),
                  items8.push(value672.file));
            } else items10.push(value672.file);
            value672.file === current5 &&
              !flag2 &&
              deps.value25.current === current5 &&
              (deps.value25.current = null);
            value664?.settled(value672.file);
            value656.endHome(value672.file, flag2);
            let entry3: Dynamic = current4.elements.get(value672.file);
            value675.length === 0
              ? entries.delete(value672.file)
              : entry3 &&
                entries.set(value672.file, {
                  ...entry3,
                  tids: value675,
                  rect: null,
                  count: value675.length,
                });
          }
          let value670: Dynamic = value660.filter(
              (input2?: Dynamic): Dynamic =>
                !items10.includes(input2) &&
                (entries2.get(input2)?.length ?? 0) > 0,
            ),
            value671: Dynamic = value662 ? "copy" : "move";
          value669?.how === "reverted"
            ? deps.value448.current(
                uiMessage("canvas.designCanvas.couldnT") +
                  value671 +
                  " to " +
                  value668(target) +
                  ". " +
                  value668(value669.at) +
                  " kept what was dragged, so the copies in " +
                  value668(target) +
                  " were removed.",
              )
            : items9.length > 0
              ? deps.value448.current(
                  uiMessage("canvas.designCanvas.theMoveLandedIn") +
                    value668(target) +
                    " but could not leave " +
                    callback16(items9.map(value668)) +
                    (items9.length > 1
                      ? ". Check those artboards."
                      : ". Check both artboards."),
                )
              : items10.length > 0 && value666 !== "failed"
                ? deps.value448.current(
                    uiMessage("canvas.designCanvas.nowhereToLandIn") +
                      value668(target) +
                      " for " +
                      callback16(items10.map(value668)) +
                      "'s selection; " +
                      (value662 ? uiMessage("canvas.designCanvas.nothingOfItWasCopied") : uiMessage("canvas.designCanvas.itStayed")),
                  )
                : value670.length > 0 &&
                  deps.value448.current(
                    uiMessage("canvas.designCanvas.partOf") +
                      callback16(value670.map(value668)) +
                      "'s selection could not land in " +
                      value668(target) +
                      (value662
                        ? "; that part was not copied."
                        : "; that part stayed where it was."),
                  );
          items9 = [];
          if (items7.length > 0 && value669?.how !== "reverted") {
            let entry2: Dynamic = current4.elements.get(target);
            entries.set(
              target,
              entry2
                ? {
                    ...entry2,
                    tids: items7,
                    rect: null,
                    count: items7.length,
                  }
                : {
                    name: deps.value19(target),
                    tids: items7,
                    rect: null,
                    count: items7.length,
                  },
            );
            primary = target;
          }
          if (value669?.how !== "reverted")
            for (let value672 of [target, ...value660] as Dynamic)
              deps.value153.current.set(value672, Date.now());
        } finally {
          value664?.end();
        }
      } else {
        let value660: Dynamic =
          items.length > 0
            ? deps.value432.current?.group(items, {
                bound: value653,
              })
            : undefined;
        current5 != null &&
          items.includes(current5) &&
          (deps.value25.current = current5);
        let value661: Dynamic = await Promise.all(
          items.map(
            (input2?: Dynamic): Dynamic =>
              (
                deps.value177.current
                  .get(input2)
                  ?.moveElements(value654.get(input2) ?? []) ??
                Promise.resolve("failed")
              )
                .catch((): Dynamic => "failed")
                .finally((): Dynamic => value660?.settled(input2)),
          ),
        );
        value660?.end();
        items.forEach((input2?: Dynamic, options?: Dynamic): Dynamic => {
          let value662: Dynamic = value661[options],
            entry: Dynamic = current4.elements.get(input2);
          if (typeof value662 == "string" || !entry) {
            (value662 === "refused" || value662 === "failed") &&
              items2.push(input2);
            input2 === current5 &&
              deps.value25.current === current5 &&
              (deps.value25.current = null);
            return;
          }
          entries.set(input2, {
            ...entry,
            tids: value662.newTids,
            rect: null,
            count: value662.newTids.length,
          });
        });
        items3 = items.filter(
          (input2?: Dynamic, options?: Dynamic): Dynamic =>
            typeof value661[options] != "string",
        );
      }
      input.canvasDropped &&
        deps.value448.current(
          uiMessage("canvas.designCanvas.theArtboardsAndNotesIn") +
            (input.copy ? "copy" : "move") +
            " \u2014 the drag was interrupted; try it again.",
        );
      let value657: Dynamic = current4;
      if (input.copy && input.canvasMoved && !input.canvasDropped) {
        deps.value142.current.has(value653) || (await deps.value144(value653));
        let entry: Dynamic = deps.value142.current.get(value653);
        deps.value142.current.delete(value653);
        value657 = entry
          ? (0, selectionFromBoards)({
              files: entry.files,
              notes: entry.notes,
            })
          : (0, selectionFromBoards)({
              files: emptyCanvasSelectionFiles,
              notes: emptyCanvasSelectionFiles,
            });
      } else
        input.copy &&
          (value657 = (0, selectionFromBoards)({
            files: emptyCanvasSelectionFiles,
            notes: emptyCanvasSelectionFiles,
          }));
      let value658: Dynamic = (0, replaceSelectedElements)(
        value657,
        entries,
        primary,
      );
      deps.applyCanvasSelection(value658);
      let value659: Dynamic = value658,
        items5: Dynamic = [
          ...new Set([
            ...items,
            ...(value656
              ? [
                  value656.target,
                  ...value656.travellers.map(
                    (input2?: Dynamic): Dynamic => input2.file,
                  ),
                ]
              : []),
          ]),
        ];
      for (let value660 of items5 as Dynamic)
        !items3.includes(value660) &&
          !items4.includes(value660) &&
          deps.value177.current.get(value660)?.moveSettle();
      for (let value660 of value655 as Dynamic)
        deps.value177.current.get(value660)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let value660 of [
          ...new Set([...items3, ...items4]),
        ] as Dynamic) {
          let value661: Dynamic =
            deps.selectionRef.current.elements.get(value660)?.tids ?? null;
          value660 === deps.focusedFileRef.current
            ? deps.setShownFrameSelection(value660, value661)
            : deps.value177.current
                .get(value660)
                ?.setShownSelection(
                  value661,
                  value661 ? deps.value19(value660) : null,
                );
          deps.value177.current.get(value660)?.moveSettle();
        }
      }, 80);
      if (items2.length > 0) {
        let value660: Dynamic = items2.map(deps.callback2),
          value661: Dynamic =
            value660.length === 1
              ? value660[0]
              : value660.slice(0, -1).join(", ") +
                " and " +
                value660[value660.length - 1],
          value662: Dynamic = items3.length === 0;
        deps.value448.current(
          value662 && !input.canvasMoved
            ? uiMessage("canvas.designCanvas.nothingMoved")
            : value662
              ? uiMessage("canvas.designCanvas.theRestMovedNothingMoved") + value661 + "."
              : uiMessage("canvas.designCanvas.nothingMovedInside") + value661 + "; the rest moved.",
        );
      }
      return {
        written: items3,
        refused: items2,
        selection: value659,
      };
    }

/** 画布命令分发器：按命令名处理 Escape、取消选择、选择导航、撤销/重做、剪切/删除、翻转、播放等，供键盘路由与预览消息调用，返回是否已处理。 */
function dispatchCanvasCommand(deps: { readonly abandonSelectionGesture: Dynamic; readonly applyCanvasSelection: Dynamic; readonly count: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly value106: Dynamic; readonly value109: Dynamic; readonly value137: Dynamic; readonly value139: Dynamic; readonly value145: Dynamic; readonly value146: Dynamic; readonly value148: Dynamic; readonly value151: Dynamic; readonly value155: Dynamic; readonly value161: Dynamic; readonly value188: Dynamic; readonly value192: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value29: Dynamic; readonly value31: Dynamic; readonly value430: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value464: Dynamic; readonly value470: Dynamic; readonly value48: Dynamic; readonly value51: Dynamic; readonly value56: Dynamic; readonly value61: Dynamic; readonly value73: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context: Dynamic = false,
        value653?: Dynamic): Dynamic {
        let callback15: Dynamic = (): Dynamic => (
          context && (0, startClipboardMark)().drop(),
          true
        );
        if (input === "artboard") {
          let current4: Dynamic = deps.focusedFileRef.current;
          return current4 == null
            ? false
            : (deps.value29.current(current4, false), true);
        }
        if (input === "escape") return !context && deps.value61.current();
        if (input === "deselect") {
          let current4: Dynamic = deps.focusedFileRef.current,
            value654: Dynamic =
              deps.value48.current > 0 ||
              (deps.value31.current != null &&
                Date.now() - deps.value31.current.at < deps.count);
          return context ||
            current4 == null ||
            !value654 ||
            !deps.selectionRef.current.elements.has(current4)
            ? false
            : (deps.value51((): Dynamic => {
                deps.abandonSelectionGesture();
                deps.applyCanvasSelection(emptyCanvasSelection);
              }),
              true);
        }
        if (
          input === "enter" ||
          input === "parent" ||
          input === "next" ||
          input === "prev" ||
          input === "a" ||
          input === "nudge"
        ) {
          if (context || !deps.value137) return false;
          if (input === "nudge") {
            if (!value653) return false;
            deps.value56.current({
              kind: "nudge",
              dx: value653.dx,
              dy: value653.dy,
              repeat: value653.repeat,
            });
          } else if (input === "a") {
            if (
              (0, selectionNavigationScope)(
                deps.selectionRef.current,
                false,
              ) === "panel"
            )
              return false;
            deps.value56.current({
              kind: "all",
            });
          } else
            deps.value56.current({
              kind: input,
            });
          return true;
        }
        if (input === "z" || input === "Z") {
          let value654: Dynamic = input === "Z" ? "redo" : "undo";
          if (
            (0, hasHeldUndoOverlay)() ||
            deps.value432.current?.busy() ||
            deps.value155.current > 0
          )
            return true;
          deps.value192.current(value654);
          if (deps.value430.current.reachable(value654)) {
            deps.value430.current.apply(value654);
            return true;
          }
          let current4: Dynamic = deps.value432.current;
          if (!current4) return true;
          let value655: Dynamic =
            value654 === "undo" ? current4.undo() : current4.redo();
          value655 === "skipped-all"
            ? deps.value448.current?.(
                uiMessage("canvas.designCanvas.nothingLeftTo") +
                  value654 +
                  " \u2014 that artboard's history changed.",
              )
            : value655 === "empty" &&
              (0, announce)(
                AccessibilityAnnouncementsUndoRedoConfig[value654],
              );
          return true;
        }
        if (input === "v") {
          if (
            options?.seen.artboards != null &&
            (0, getActiveClipboardSource)(options.seen) ===
              "foreign-artboards"
          ) {
            if (!deps.value224.current) return false;
            if (
              hasActiveUserGesture() &&
              !(0, hasBlockingEditorOverlay)()
            ) {
              let current4: Dynamic = deps.focusedFileRef.current,
                value658: Dynamic =
                  current4 == null
                    ? null
                    : deps.value106.current?.querySelector(
                        `[data-mega-artboard="${CSS.escape(current4)}"] :is([data-mega-chrome="expand"], [data-mega-chrome="play"])`,
                      );
              value658
                ? value658.focus({
                    preventScroll: true,
                  })
                : (document as Dynamic).activeElement?.blur();
              (window as Dynamic).focus();
              deps.value188(
                ClipboardFileTransferRegistry.pressAgain(
                  (0, keyboardShortcutLabel)("V"),
                ),
              );
            }
            return true;
          }
          let value654: Dynamic =
            hasActiveUserGesture() && !(0, hasBlockingEditorOverlay)()
              ? deps.value109()
              : null;
          if (value654 == null) return false;
          let value655: Dynamic = (0, getAnnotationClipboard)();
          if (value654.overAnnotation && value655.length === 0) return false;
          let value656: Dynamic = (0, getActiveClipboardSource)(
            options?.seen ?? {
              text: "",
              stamp: null,
              hasImage: false,
            },
          );
          if (value656 === "text") return false;
          let value657: Dynamic = (0, getArtboardClipboard)();
          if (value656 === "artboards" && value657)
            deps.value464.current(
              value657,
              value655,
              (0, pointerCoordinates)(value654),
            );
          else {
            if (value654.overAnnotation) return false;
            deps.value470.current(value654, "");
          }
          return true;
        }
        if (
          input === "d" &&
          (deps.value155.current > 0 || (deps.value137 && deps.value48.current > 0))
        )
          return true;
        if (input === "x" && deps.value137 && deps.value48.current > 0)
          return callback15();
        if (!deps.value137) return false;
        if (input === "c") {
          if (deps.value48.current === 0) return deps.value139();
          let value654: Dynamic = (0, startClipboardMark)();
          deps.value51((): Dynamic => {
            deps.value139(value654);
          }, value654.drop);
          return true;
        }
        if (input === "x")
          return (0, sessionAllowsMutation)({
            gesturing: deps.value218.current,
            setMoveCommits: deps.value155.current,
          })
            ? deps.value139()
              ? (deps.value145(CutValue, {
                  elementsOnly: true,
                }),
                true)
              : false
            : callback15();
        if (input === "delete" || input === "delete-while-writing")
          return input === "delete-while-writing" &&
            deps.value48.current === 0 &&
            !(
              deps.value31.current != null &&
              Date.now() - deps.value31.current.at < deps.count
            )
            ? false
            : (deps.value51((): Dynamic => {
                if (context) {
                  let value654: Dynamic = (0, canvasBoardSelection)(
                    deps.selectionRef.current,
                  );
                  deps.value145(DeletedValue, {
                    elementsOnly: true,
                  }) &&
                    (0, boardSelectionCount)(value654) > 0 &&
                    deps.value161(
                      uiMessage("canvas.designCanvas.theArtboardsAndNotesStay"),
                    );
                } else deps.value146();
              }),
              true);
        if (input === "flip-horizontal" || input === "flip-vertical") {
          let value654: Dynamic = context
              ? (0, canvasBoardSelection)(deps.selectionRef.current)
              : emptyBoardSelection,
            value655: Dynamic =
              ((0, isApplePlatform)() ? "\u21E7" : "Shift+") +
              (input === "flip-horizontal" ? "H" : "V"),
            value656: Dynamic =
              input === "flip-horizontal" ? "horizontal" : "vertical",
            current4: Dynamic = deps.selectionRef.current,
            callback16: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic =>
              input2.artboards.size === options2.artboards.size &&
              input2.notes.size === options2.notes.size &&
              input2.elements.size === options2.elements.size &&
              [...input2.artboards].every(
                (input3?: Dynamic): Dynamic => options2.artboards.has(input3),
              ) &&
              [...input2.notes].every(
                (input3?: Dynamic): Dynamic => options2.notes.has(input3),
              ) &&
              [...input2.elements].every(
                ([input3, input4]: Dynamic): Dynamic =>
                  options2.elements.get(input3)?.tids.join() ===
                  input4.tids.join(),
              );
          deps.value151(
            value656,
            context
              ? {
                  elementsOnly: true,
                  then: (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    !deps.value224.current ||
                    !callback16(current4, deps.selectionRef.current) ||
                    (0, flipAnnotations)(
                      (deps.value73.current.annotations ?? []).filter(
                        (input3?: Dynamic): Dynamic =>
                          value654.notes.has(input3.id),
                      ),
                      value656,
                    ).flips.length === 0
                      ? false
                      : (deps.abandonSelectionGesture(),
                        deps.applyCanvasSelection(
                          (0, selectionFromBoards)(value654),
                        ),
                        deps.value161(
                          (input2 !== undefined
                            ? input2 + " "
                            : options2
                              ? (0, flipDirectionAnnouncement)(
                                  value656,
                                ) + ". "
                              : "") +
                            uiMessage("canvas.designCanvas.press") +
                            value655 +
                            " again to flip what is outside the artboards, which stays selected.",
                        ),
                        true),
                }
              : {},
          );
          return true;
        }
        if (input === "d") {
          let value654: Dynamic = context
            ? (0, canvasBoardSelection)(deps.selectionRef.current)
            : emptyBoardSelection;
          deps.value148(
            context
              ? {
                  elementsOnly: true,
                }
              : {},
          ) &&
            (0, boardSelectionCount)(value654) > 0 &&
            (deps.applyCanvasSelection((0, selectionFromBoards)(value654)),
            deps.value161(
              uiMessage("canvas.designCanvas.theArtboardsAndNotesStay2") +
                (0, keyboardShortcutLabel)("D") +
                " again to copy them",
            ));
          return true;
        }
        return false;
      }

/** 开始拖出元素时运行：把选中元素序列化成独立的 dc 文档并构建预览 srcdoc，作为拖动中跟随指针的幽灵预览。 */
function buildDragGhostPreview(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly value177: Dynamic; readonly value195: Dynamic; readonly value196: Dynamic }, input?: Dynamic): Dynamic {
        if (!input.box || deps.value196.current?.key === input.key) return;
        deps.value196.current = {
          key: input.key,
          ghost: null,
        };
        let entry: Dynamic = deps.value177.current.get(input.file),
          box: Dynamic = input.box;
        if (entry)
          try {
            entry
              .renderDefaults()
              .then((input2?: Dynamic): Dynamic => {
                if (deps.value196.current?.key !== input.key) return;
                let value653: Dynamic = entry.serializeSelection(input.tids, {
                  bakeProps: true,
                  lift: box,
                  vals: input2,
                });
                if (!value653 || value653.length > 2e5) return;
                let files: Dynamic = deps.doc.content().files,
                  state: Dynamic = {
                    ...(0, mergeDesignSystemFileOverlay)(files),
                    [dragGhostFilename]: (0, buildDcDocument)(
                      value653,
                      files[input.file] ?? "",
                      {
                        logic: false,
                      },
                    ),
                  },
                  value654: Dynamic = (0, normalizeProjectBlobPaths)(
                    (0, collectProjectDependencyFiles)(
                      state,
                      dragGhostFilename,
                    ),
                  ),
                  { doc: value655, parts: value656 }: Dynamic = (0,
                  buildPreviewDocument)(
                    value654,
                    dragGhostFilename,
                    deps.assets,
                    new Set(),
                    {
                      frameless: true,
                      fileUrlFor: createLinkedFileScript,
                    },
                  ),
                  value657: Dynamic =
                    Object.keys(value656).length > 0
                      ? {
                          srcdoc: PreviewBuildDocumentResolvedValue_3,
                          boot: {
                            doc: value655,
                            parts: (0, runtimeModuleBlobs)(value656),
                            urls: (0, runtimeModuleUrls)(value656),
                          },
                        }
                      : {
                          srcdoc: value655,
                          boot: null,
                        };
                deps.value196.current.ghost = value657;
                deps.value195(
                  (input3?: Dynamic): Dynamic =>
                    input3 && {
                      ...input3,
                      ghost: value657,
                    },
                );
              })
              .catch((): Dynamic => {});
          } catch {}
      }

/** 画布对象悬停在目标画板上时运行：在目标画板中计算落点计划（dropPlanAt）并显示插入预览，请求进行中时只保留最新坐标排队。 */
function requestDropPlanPreview(deps: { readonly value177: Dynamic; readonly value203: Dynamic; readonly value206: Dynamic; readonly value87: Dynamic }, event?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic): Dynamic {
        if (event.inFlight) {
          event.pending = {
            cx: context,
            cy: value653,
            mode: extra,
          };
          return;
        }
        let html: Dynamic = event.html,
          member: Dynamic = event.member;
        if (!html || !member) return;
        let entry: Dynamic = deps.value177.current.get(options.file),
          value654: Dynamic = deps.value87.current.artboards.find(
            (input?: Dynamic): Dynamic => input.file === options.file,
          );
        if (!entry || !value654) return;
        let entry2: Dynamic = event.laidOut.get(options.file);
        entry2 ||
          ((entry2 = entry.isFreeCanvas(html).then(
            (input?: Dynamic): Dynamic => !input,
            (): Dynamic => false,
          )),
          event.laidOut.set(options.file, entry2));
        event.inFlight = Promise.all([options.opened, entry2])
          .then(
            ([input, input2]: Dynamic): Dynamic =>
              input && input2
                ? entry.dropPlanAt(
                    event.token,
                    {
                      x: context - value654.x,
                      y: value653 - value654.y,
                    },
                    [member],
                    extra,
                  )
                : null,
          )
          .then(
            (input?: Dynamic): Dynamic => {
              event.target === options &&
                (!input ||
                  !input.landing.some(
                    (input2?: Dynamic): Dynamic => input2.tid === 0,
                  )) &&
                entry.dropPlanClear(event.token);
            },
            (): Dynamic => {},
          )
          .finally((): Dynamic => {
            event.inFlight = null;
            let pending: Dynamic = event.pending;
            event.pending = null;
            pending &&
              event.target &&
              deps.value203.current === event &&
              deps.value206(
                event,
                event.target,
                pending.cx,
                pending.cy,
                pending.mode,
              );
          });
      }

/** 把画布说明或图片图形转成可插入画板的 HTML 片段（含旋转、翻转、裁剪与文字样式），无法转换的图形返回 null；拖入画板时使用。 */
function annotationToElementHtml(deps: Record<string, never>, source?: Dynamic): Dynamic {
      let callback15: Dynamic = (input?: Dynamic): Dynamic =>
          input
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;"),
        value653: Dynamic = [
          (0, annotationRotation)(source) !== 0
            ? "rotate(" +
              String((0, annotationRotation)(source)) +
              "deg)"
            : "",
          (0, imageFlipCss)(source)?.transform ?? "",
        ]
          .filter((input?: Dynamic): Dynamic => input !== "")
          .join(" "),
        value654: Dynamic =
          value653 !== "" ? " transform: " + value653 + ";" : "";
      if ((0, isShapeAnnotation)(source)) {
        if (source.kind !== "image" || source.video) return null;
        let value657: Dynamic = String(Math.round(source.w)),
          value658: Dynamic = String(Math.round(source.h));
        if (source.crop) {
          let value659: Dynamic = (0, imageCropCss)(source.crop),
            value660: Dynamic =
              "position: absolute; width: " +
              value659.width +
              "; height: " +
              value659.height +
              "; left: " +
              value659.left +
              "; top: " +
              value659.top +
              "; max-width: none; max-height: none; object-fit: cover; object-position: " +
              value659.objectPosition;
          return (
            '<div style="position: relative; contain: layout; overflow: hidden; width: ' +
            value657 +
            "px; height: " +
            value658 +
            "px;" +
            value654 +
            '"><img src="' +
            callback15(source.src) +
            '"' +
            (source.alt ? ' alt="' + callback15(source.alt) + '"' : "") +
            ' style="' +
            value660 +
            '"></div>'
          );
        }
        return (
          '<img src="' +
          callback15(source.src) +
          '"' +
          (source.alt ? ' alt="' + callback15(source.alt) + '"' : "") +
          ' width="' +
          value657 +
          '" height="' +
          value658 +
          '" style="width: ' +
          value657 +
          "px; height: auto;" +
          value654 +
          '">'
        );
      }
      let value655: Dynamic = (0, annotationTextStyle)(source),
        callback16: Dynamic = (input?: Dynamic): Dynamic =>
          input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;"),
        state: Dynamic = {
          bold: "strong",
          italic: "em",
          code: "code",
        },
        callback17: Dynamic = (input?: Dynamic): Dynamic =>
          (0, NotesBlocksHandler)(input)
            .map(
              (source2?: Dynamic): Dynamic =>
                source2.kind === "text"
                  ? callback16(source2.text)
                  : source2.kind === "link"
                    ? /^https?:\/\//i.test(source2.href)
                      ? '<a href="' +
                        callback15(source2.href) +
                        '">' +
                        callback16(source2.text) +
                        "</a>"
                      : callback16(source2.text)
                    : "<" +
                      state[source2.kind] +
                      ">" +
                      callback16(source2.text) +
                      "</" +
                      state[source2.kind] +
                      ">",
            )
            .join(""),
        value656: Dynamic = (0, parseNoteBlocks)(source.text)
          .map(
            (source2?: Dynamic): Dynamic =>
              source2.kind === "p"
                ? "<div>" +
                  (source2.text === "" ? "<br>" : callback17(source2.text)) +
                  "</div>"
                : source2.kind === "ul"
                  ? "<ul>" +
                    source2.items
                      .map(
                        (input?: Dynamic): Dynamic =>
                          "<li>" + callback17(input) + "</li>",
                      )
                      .join("") +
                    "</ul>"
                  : '<ol start="' +
                    String(source2.start) +
                    '">' +
                    source2.items
                      .map(
                        (input?: Dynamic): Dynamic =>
                          "<li>" + callback17(input) + "</li>",
                      )
                      .join("") +
                    "</ol>",
          )
          .join("");
      return source.text.trim() === ""
        ? null
        : '<div style="margin: 0; width: ' +
            String(Math.round(source.w)) +
            "px; font-size: " +
            String(value655.size) +
            "px;" +
            (value655.bold ? " font-weight: 600;" : "") +
            (value655.italic ? " font-style: italic;" : "") +
            " white-space: pre-wrap;" +
            value654 +
            '">' +
            value656 +
            "</div>";
    }

/** 把画布对象（说明、图形或无框画板）拖过其他画板时运行：建立拖动会话、打开目标画板的移动宿主，并刷新落点预览。 */
function trackObjectHoverOverArtboard(deps: { readonly value177: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value206: Dynamic; readonly value211: Dynamic; readonly value271: Dynamic; readonly value345: Dynamic }, event?: Dynamic): Dynamic {
        let current4: Dynamic = deps.value203.current;
        current4 &&
          current4.gestureKey !== event.key &&
          (deps.value204(), (current4 = null));
        let value653: Dynamic = deps.value202.current || deps.value345.current;
        if (!current4) {
          if (!event.target || value653) return;
          let state: Dynamic = {
              ew: event.at.w,
              eh: event.at.h,
              ox: 0,
              oy: 0,
              gx: event.point.x - event.at.x,
              gy: event.point.y - event.at.y,
            },
            state2: Dynamic = {
              gestureKey: event.key,
              token: (0, randomSessionToken)(),
              html: null,
              member: null,
              laidOut: new Map(),
              target: null,
              closing: new Map(),
              inFlight: null,
              pending: null,
            };
          deps.value203.current = state2;
          current4 = state2;
          deps.value211(event.object)
            .then((input?: Dynamic): Dynamic => {
              deps.value203.current === state2 &&
                ((state2.html = input),
                (state2.member = input
                  ? (0, pastedElementGeometry)(input, state)
                  : null));
            })
            .catch((): Dynamic => {});
        }
        let value654: Dynamic =
          event.target &&
          !value653 &&
          event.target !== deps.value271.current &&
          event.target !== ("file" in event.object ? event.object.file : null)
            ? event.target
            : null;
        current4.target && current4.target.file !== value654 && deps.value204();
        if (!!value654) {
          if (!current4.target) {
            let entry: Dynamic = deps.value177.current.get(value654),
              value655: Dynamic = current4;
            current4.target = {
              file: value654,
              opened: (current4.closing.get(value654) ?? Promise.resolve())
                .then(
                  (): Dynamic =>
                    entry?.moveHost(value655.token, "open") ?? false,
                )
                .catch((): Dynamic => false),
            };
          }
          deps.value206(
            current4,
            current4.target,
            event.point.x,
            event.point.y,
            event.ctrl ? "keep" : "flow",
          );
        }
      }

/** 画布对象在某画板上松手时运行（onDropObjectInto）：把说明、图片或无框画板内容作为元素插入目标画板，处理超时、只读与失败提示。 */
function dropCanvasObjectIntoArtboard(deps: { readonly callback2: Dynamic; readonly callback7: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly showToast: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value157: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value213: Dynamic; readonly value271: Dynamic; readonly value276: Dynamic; readonly value345: Dynamic; readonly value432: Dynamic; readonly value459: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, input?: Dynamic): Dynamic {
        let {
          target: value653,
          point: value654,
          at: value655,
          ctrl: value656,
        }: Dynamic = input;
        if (deps.value345.current || value653 === deps.value271.current) return false;
        let value657: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === value653,
          ),
          entry: Dynamic = deps.value177.current.get(value653);
        if (
          !value657 ||
          value657.frameless ||
          !entry ||
          deps.value202.current ||
          deps.value155.current > 0
        )
          return false;
        let value658: Dynamic, value659: Dynamic, value660: Dynamic;
        if ("note" in input.object) {
          let value663: Dynamic = (deps.value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input.object.note,
          );
          if (!value663) return false;
          let value664: Dynamic = deps.callback7(value663);
          if (!value664) return false;
          value658 = async (): Promise<Dynamic> => value664;
          value659 = {
            files: new Set(),
            notes: new Set([value663.id]),
          };
          value660 = value663.kind === "image" ? "image" : "note";
        } else {
          let file: Dynamic = input.object.file,
            entry2: Dynamic = deps.value177.current.get(file);
          if (
            !entry2 ||
            !deps.value73.current.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === file,
            )?.frameless
          )
            return false;
          value658 = (): Dynamic => entry2.pieceContent();
          value659 = {
            files: new Set([file]),
            notes: new Set(),
          };
          value660 = "piece";
        }
        let value661: Dynamic =
            deps.value203.current?.gestureKey === input.key
              ? deps.value203.current
              : null,
          value662: Dynamic =
            !!value661?.target && value661.target.file === value653;
        value661 && !value662 && deps.value204();
        deps.value203.current = null;
        deps.value202.current = true;
        (async (): Promise<Dynamic> => {
          try {
            let value663: Dynamic =
                (value661?.html ?? null) || (await value658()),
              value664: Dynamic = value663
                ? (0, pastedRootElementCount)(value663)
                : 0;
            if (!value663 || value664 !== 1) {
              value662 &&
                value661?.target &&
                value661.target.opened.then(
                  (): Dynamic => entry.moveHost(value661.token, "close"),
                );
              deps.value188(
                value663
                  ? uiMessage("canvas.designCanvas.nothingMovedThisPieceHolds") +
                      String(value664) +
                      " elements; a piece with one element can join an artboard."
                  : uiMessage("canvas.designCanvas.nothingMovedThis") +
                      value660 +
                      " has nothing that can go into an artboard.",
              );
              return;
            }
            let value665: Dynamic = value654.x - value657.x,
              value666: Dynamic = value654.y - value657.y,
              state: Dynamic = {
                ew: value655.w,
                eh: value655.h,
                ox: 0,
                oy: 0,
                gx: value654.x - value655.x,
                gy: value654.y - value655.y,
              },
              value667: Dynamic =
                value662 && value661
                  ? value661.token
                  : (0, randomSessionToken)(),
              flag2: Dynamic = false,
              flag3: Dynamic = false,
              value668: Dynamic = null,
              value669: Dynamic = (0, pastedElementGeometry)(
                value663,
                state,
              );
            if (
              value669 &&
              (0, canFreezeSinglePaste)(
                false,
                [0],
                value663,
                false,
              ) &&
              (0, canFreezeSinglePaste)(
                false,
                [0],
                value663,
                await entry.isFreeCanvas(value663),
              )
            ) {
              let value674: Dynamic = Date.now() + 1500,
                value675: Dynamic = Symbol(uiMessage("canvas.designCanvas.timedOut")),
                callback15: Dynamic = (input2?: Dynamic): Dynamic => {
                  let index: Dynamic = 0,
                    promise: Dynamic = new Promise(
                      (input3?: Dynamic): Dynamic => {
                        index = (window as Dynamic).setTimeout(
                          (): Dynamic => input3(value675),
                          Math.max(0, value674 - Date.now()),
                        );
                      },
                    );
                  return Promise.race([
                    input2.catch((): Dynamic => value675),
                    promise,
                  ]).finally(
                    (): Dynamic => (window as Dynamic).clearTimeout(index),
                  );
                };
              try {
                let value676: Dynamic = await callback15(
                    value662 && value661?.target
                      ? value661.target.opened
                      : (
                          value661?.closing.get(value653) ?? Promise.resolve()
                        ).then(
                          (): Dynamic => entry.moveHost(value667, "open"),
                        ),
                  ),
                  value677: Dynamic =
                    value676 === true
                      ? await callback15(
                          entry.dropPlanAt(
                            value667,
                            {
                              x: value665,
                              y: value666,
                            },
                            [value669],
                            value656 ? "keep" : "flow",
                          ),
                        )
                      : value676;
                if (value677 === value675) {
                  deps.value188(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.callback2(value653) +
                      " did not answer; try the drag again.",
                  );
                  return;
                }
                let value678: Dynamic = value677
                  ? (value677.landing.find(
                      (input2?: Dynamic): Dynamic => input2.tid === 0,
                    ) ?? null)
                  : null;
                if (value677 && value678) {
                  flag3 = true;
                  let value679: Dynamic = await deps.value157({
                    token: value667,
                    plans: new Map(),
                    unanswered: [],
                    canvasMoved: false,
                    copy: false,
                    canvas: (): Dynamic => {},
                    travel: {
                      target: value653,
                      pureTarget: true,
                      plan: value677,
                      travellers: [
                        {
                          file: "<canvas>",
                          external: true,
                          members: [
                            {
                              tid: 0,
                              index: 0,
                              html: value663,
                            },
                          ],
                        },
                      ],
                      endHome: (): Dynamic => {},
                    },
                  });
                  flag2 = value679.written.includes(value653);
                  flag2 &&
                    ((value668 = value679.selection),
                    entry.dropPlanClear(value667, true));
                }
              } finally {
                let callback16: Dynamic = (): Dynamic => {
                  entry.dropPlanClear(value667);
                  entry.moveHost(value667, "close");
                };
                flag2
                  ? (window as Dynamic).setTimeout(callback16, 150)
                  : callback16();
              }
            }
            if (!flag2 && flag3) return;
            let value670: Dynamic = null;
            if (!flag2) {
              let value674: Dynamic = deps.value432.current?.group([value653], {
                bound: value667,
              });
              try {
                let value675: Dynamic = await entry.insertHtml(
                  (0, positionPastedHtml)(value663, {
                    ew: state.ew,
                    ox: value665 - state.gx,
                    oy: value666 - state.gy,
                  }),
                  "root-end",
                );
                flag2 = value675.length > 0;
                flag2 &&
                  ((value670 = value675),
                  entry.setShownSelection(value675, deps.value19(value653)));
              } finally {
                value674?.settled(value653);
                value674?.end();
                if (value662 && value661?.target) {
                  let target: Dynamic = value661.target;
                  entry.dropPlanClear(value661.token);
                  target.opened
                    .then(
                      (): Dynamic => entry.moveHost(value661.token, "close"),
                    )
                    .catch((): Dynamic => false);
                }
              }
            }
            if (!flag2) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            deps.value276.current = {
              file: value653,
              at: Date.now(),
            };
            let value671: Dynamic = value670
                ? (0, selectionFromElements)(value653, {
                    name: deps.value19(value653),
                    tids: value670,
                    rect: null,
                    count: value670.length,
                  })
                : (value668 ?? deps.selectionRef.current),
              value672: Dynamic = (0, filterSelectedAnnotations)(
                (0, filterSelectedArtboards)(
                  value671,
                  (input2?: Dynamic): Dynamic => !value659.files.has(input2),
                ),
                (input2?: Dynamic): Dynamic => !value659.notes.has(input2),
              ),
              value673: Dynamic =
                value659.files.size > 0 ? deps.value144(value667) : null;
            if (!deps.value459.current(value659, value667)) {
              await deps.value213(value653, value667, value660);
              deps.value188(
                uiMessage("canvas.designCanvas.nothingMovedThe") +
                  value660 +
                  " could not leave the canvas.",
              );
              return;
            }
            deps.value189(uiMessage("canvas.designCanvas.movedInto") + deps.callback2(value653));
            if (value673) {
              deps.value155.current++;
              try {
                await value673;
              } finally {
                deps.value155.current--;
              }
            }
            deps.setSelection(value672);
            (window as Dynamic).setTimeout((): Dynamic => {
              deps.setSelection(value672);
              let value674: Dynamic =
                value672.elements.get(value653)?.tids ?? null;
              value653 === deps.focusedFileRef.current
                ? deps.setShownFrameSelection(value653, value674)
                : entry.setShownSelection(
                    value674,
                    value674 ? deps.value19(value653) : null,
                  );
            }, 160);
          } catch (value663: Dynamic) {
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(value663),
              "error",
            );
            if (value662 && value661?.target) {
              let target: Dynamic = value661.target;
              entry.dropPlanClear(value661.token);
              target.opened
                .then((): Dynamic => entry.moveHost(value661.token, "close"))
                .catch((): Dynamic => false);
            }
          } finally {
            deps.value202.current = false;
          }
        })();
        return true;
      }

/** 从聚焦画板拖出的元素松手时运行：落在空白处则新建画板，落在另一画板则移动或复制进去，失败时回滚并提示。 */
function dropElementDragAtCanvasPoint(deps: { readonly abandonSelectionGesture: Dynamic; readonly callback2: Dynamic; readonly callback3: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value125: Dynamic; readonly value127: Dynamic; readonly value155: Dynamic; readonly value156: Dynamic; readonly value157: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value271: Dynamic; readonly value276: Dynamic; readonly value345: Dynamic; readonly value396: Dynamic; readonly value432: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic =
          deps.value203.current?.gestureKey === input.key
            ? deps.value203.current
            : null;
        deps.value203.current = null;
        let callback15: Dynamic = (input2?: Dynamic): Dynamic => {
          let value656: Dynamic = value654?.target;
          if (!value654 || !value656 || value656.file === input2) return;
          let entry3: Dynamic = deps.value177.current.get(value656.file);
          entry3?.dropPlanClear(value654.token);
          value654.closing.set(
            value656.file,
            value656.opened
              .then((): Dynamic => entry3?.moveHost(value654.token, "close"))
              .catch((): Dynamic => false),
          );
          value654.target = null;
        };
        if (deps.value345.current) {
          callback15();
          deps.value188(
            uiMessage("canvas.designCanvas.nothingMovedOnlyThisArtboard"),
          );
          return;
        }
        let value655: Dynamic = [...deps.value87.current.artboards]
          .reverse()
          .find(
            (input2?: Dynamic): Dynamic =>
              !(input2.frameless && input2.file !== deps.value125.current) &&
              options >= input2.x &&
              options <= input2.x + input2.w &&
              context >= input2.y &&
              context <= input2.y + input2.h,
          );
        callback15(value655?.file);
        if (value655 != null && value655.file === deps.value271.current) {
          callback15();
          deps.value188(
            uiMessage("canvas.designCanvas.nothingMovedThatArtboardIs"),
          );
          return;
        }
        if (!value655) {
          let entry3: Dynamic = deps.value177.current.get(input.file);
          if (!entry3 || deps.value202.current || deps.value155.current > 0) return;
          deps.value202.current = true;
          let value656: Dynamic;
          (async (): Promise<Dynamic> => {
            try {
              let value657: Dynamic = input.box ?? {
                  w: 320,
                  h: 200,
                  ew: 320,
                  eh: 200,
                  ox: 0,
                  oy: 0,
                  gx: 160,
                  gy: 100,
                },
                value658: Dynamic = entry3.serializeSelection(input.tids, {
                  lift: value657,
                });
              if (!value658) {
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
                );
                return;
              }
              let files: Dynamic = deps.doc.content().files;
              if (
                Object.keys(files).length >=
                PlatformFileContentFilesValue
              ) {
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTMakeANew") +
                    String(PlatformFileContentFilesValue) +
                    "-file limit; delete something first",
                  "error",
                );
                return;
              }
              await entry3.flushPending();
              let value659: Dynamic =
                  (await (0, getKvClient)().get(
                    (0, PlatformFileContentHandler_4)(input.file),
                  )) ??
                  files[input.file] ??
                  "",
                value660: Dynamic = (0, uniqueArtboardFile)(
                  files,
                  "Piece",
                  deps.supportsLoadState,
                ),
                value661: Dynamic = (0, buildDcDocument)(
                  value658,
                  typeof value659 == "string" ? value659 : "",
                );
              await (0, getKvClient)().set(
                (0, PlatformFileContentHandler_4)(value660),
                value661,
              );
              deps.value127.current.set(value660, Date.now());
              let state: Dynamic = {
                  file: value660,
                  x: Math.round(options - value657.gx),
                  y: Math.round(context - value657.gy),
                  w: Math.min(
                    PlatformFileContentLimit_6,
                    Math.max(
                      PlatformFileContentConstant_17,
                      value657.w,
                    ),
                  ),
                  h: Math.min(
                    PlatformFileContentLimit_6,
                    Math.max(
                      PlatformFileContentConstant_17,
                      value657.h,
                    ),
                  ),
                  title: (0, uniqueElementArtboardTitle)(
                    input.label,
                    deps.value73.current.artboards,
                  ),
                  frameless: true,
                  ...deps.callback3(),
                },
                value662: Dynamic = value653
                  ? undefined
                  : (0, randomSessionToken)();
              value653 ||
                (value656 = deps.value156(CanvasWorkingStateConstant_8));
              deps.value396.current(
                {
                  kind: "add",
                  entries: [
                    {
                      file: value660,
                      src: value661,
                      spec: state,
                    },
                  ],
                },
                new Set([value660]),
                undefined,
                value662,
              );
              deps.value98({
                artboards: [
                  ...deps.value73.current.artboards.filter(
                    (input2?: Dynamic): Dynamic => input2.file !== value660,
                  ),
                  state,
                ],
              });
              if (!value653) {
                let value663: Dynamic = deps.value432.current?.group(
                    [input.file],
                    {
                      bound: value662,
                      atomic: true,
                    },
                  ),
                  flag2: Dynamic = false;
                try {
                  flag2 = await entry3.removeSelection(input.tids);
                } finally {
                  value663?.end();
                }
                if (!flag2) {
                  deps.value188(
                    uiMessage("canvas.designCanvas.copiedOntoTheCanvasThe"),
                  );
                  return;
                }
              }
              deps.value189((value653 ? "Copied" : "Moved") + " onto the canvas");
              deps.abandonSelectionGesture();
              deps.value62();
              deps.setSelection(
                (0, selectionFromArtboards)(new Set([value660])),
              );
            } catch (value657: Dynamic) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(value657),
                "error",
              );
            } finally {
              value656?.();
              deps.value202.current = false;
            }
          })();
          return;
        }
        if (value655.file === input.file) {
          deps.value188(
            uiMessage("canvas.designCanvas.releasedOverTheSameArtboard"),
          );
          return;
        }
        let entry: Dynamic = deps.value177.current.get(input.file),
          entry2: Dynamic = deps.value177.current.get(value655.file);
        if (!entry || !entry2 || deps.value202.current || deps.value155.current > 0) {
          callback15();
          return;
        }
        deps.value202.current = true;
        (async (): Promise<Dynamic> => {
          let value656: Dynamic = value654?.target?.file === value655.file,
            value657: Dynamic,
            value658: Dynamic;
          try {
            let value659: Dynamic = entry.serializeSelection(input.tids, {
              bakeProps: true,
              vals: await entry.renderDefaults(),
            });
            if (!value659) {
              deps.value188(
                uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
              );
              return;
            }
            let box: Dynamic = input.box,
              value660: Dynamic = options - value655.x,
              value661: Dynamic = context - value655.y,
              value662: Dynamic = box
                ? (0, pastedElementGeometry)(value659, box)
                : null,
              flag2: Dynamic = false;
            if (
              value662 &&
              (0, canFreezeSinglePaste)(
                value653,
                input.tids,
                value659,
                false,
              ) &&
              (0, canFreezeSinglePaste)(
                value653,
                input.tids,
                value659,
                await entry2.isFreeCanvas(value659),
              )
            ) {
              let value665: Dynamic =
                value656 && value654
                  ? value654.token
                  : (0, randomSessionToken)();
              value656 = false;
              let value666: Dynamic = Date.now() + 1500,
                value667: Dynamic = Symbol(uiMessage("canvas.designCanvas.timedOut")),
                callback16: Dynamic = (input2?: Dynamic): Dynamic => {
                  let index: Dynamic = 0,
                    promise: Dynamic = new Promise(
                      (input3?: Dynamic): Dynamic => {
                        index = (window as Dynamic).setTimeout(
                          (): Dynamic => input3(value667),
                          Math.max(0, value666 - Date.now()),
                        );
                      },
                    );
                  return Promise.race([
                    input2.catch((): Dynamic => value667),
                    promise,
                  ]).finally(
                    (): Dynamic => (window as Dynamic).clearTimeout(index),
                  );
                },
                flag3: Dynamic = false;
              try {
                let value668: Dynamic = await callback16(
                    (
                      value654?.closing.get(value655.file) ??
                      Promise.resolve()
                    ).then((): Dynamic => entry2.moveHost(value665, "open")),
                  ),
                  value669: Dynamic =
                    value668 === true
                      ? await callback16(
                          entry2.dropPlanAt(
                            value665,
                            {
                              x: value660,
                              y: value661,
                            },
                            [value662],
                            input.ctrl ? "keep" : "flow",
                          ),
                        )
                      : value668;
                if (value669 === value667) {
                  deps.value188(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.callback2(value655.file) +
                      " did not answer; try the drag again.",
                  );
                  return;
                }
                let value670: Dynamic = value669
                  ? (value669.landing.find(
                      (input2?: Dynamic): Dynamic => input2.tid === 0,
                    ) ?? null)
                  : null;
                flag2 = !value670;
                if (value669 && value670) {
                  let value671: Dynamic = await deps.value157({
                    token: value665,
                    plans: new Map(),
                    unanswered: [],
                    canvasMoved: false,
                    copy: false,
                    canvas: (): Dynamic => {},
                    travel: {
                      target: value655.file,
                      pureTarget: true,
                      plan: value669,
                      travellers: [
                        {
                          file: input.file,
                          members: [
                            {
                              tid: input.tids[0],
                              index: 0,
                            },
                          ],
                        },
                      ],
                      endHome: (): Dynamic => {},
                    },
                  });
                  deps.value276.current = {
                    file: value655.file,
                    at: Date.now(),
                  };
                  flag3 = value671.written.includes(value655.file);
                  flag3 && entry2.dropPlanClear(value665, true);
                  flag3 &&
                    value671.written.includes(input.file) &&
                    deps.value189(uiMessage("canvas.designCanvas.movedTo") + deps.callback2(value655.file));
                  return;
                }
              } finally {
                let callback17: Dynamic = (): Dynamic => {
                  entry2.dropPlanClear(value665);
                  entry2.moveHost(value665, "close");
                };
                flag3
                  ? (window as Dynamic).setTimeout(callback17, 150)
                  : callback17();
              }
            }
            let value663: Dynamic = box
              ? {
                  ew: box.ew,
                  ox: value660 - box.gx + box.ox,
                  oy: value661 - box.gy + box.oy,
                }
              : {
                  ox: value660,
                  oy: value661,
                };
            value653 ||
              ((value657 = deps.value432.current?.group(
                [value655.file, input.file],
                {
                  atomic: true,
                  holder: value655.file,
                  waiting: [input.file],
                },
              )),
              (value658 = deps.value156(CanvasWorkingStateConstant_8)));
            let value664: Dynamic = flag2
              ? await entry2.insertHtml(
                  (0, positionPastedHtml)(value659, value663),
                  "root-end",
                )
              : await entry2.insertHtml(value659, "root-end", value663);
            deps.value276.current = {
              file: value655.file,
              at: Date.now(),
            };
            if (value664.length === 0) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            if (value653)
              deps.value189(
                uiMessage("canvas.designCanvas.copiedTo") + value655.file.replace(/\.dc\.html$/, ""),
              );
            else {
              value657?.admit(input.file);
              if (!(await entry.removeSelection(input.tids))) {
                value657?.end();
                let value665: Dynamic =
                    value657?.discard(value655.file) ?? null,
                  value666: Dynamic = value665
                    ? await entry2
                        .applyHistory(deps.value19(value655.file), "undo")
                        .catch((): Dynamic => false)
                    : false;
                value665 && !value666 && value665();
                value666 && entry2.dropRedo();
                deps.value188(
                  value666
                    ? uiMessage("canvas.designCanvas.couldNotMoveReverted")
                    : uiMessage("canvas.designCanvas.moveFailedHalfwayCheckBoth"),
                );
                return;
              }
              deps.value189(uiMessage("canvas.designCanvas.movedTo") + deps.callback2(value655.file));
            }
            deps.abandonSelectionGesture();
            deps.setSelection(
              (0, setCanvasElementSelection)(
                emptyCanvasSelection,
                value655.file,
                {
                  name: deps.value19(value655.file),
                  tids: value664,
                  rect: null,
                  count: value664.length,
                },
                false,
              ),
            );
            entry2.setShownSelection(value664, deps.value19(value655.file));
          } finally {
            value657?.end();
            value658?.();
            if (value656 && value654) {
              entry2.dropPlanClear(value654.token);
              let target: Dynamic = value654.target;
              value654.closing.set(
                value655.file,
                (target?.opened ?? Promise.resolve(true))
                  .then(
                    (): Dynamic => entry2.moveHost(value654.token, "close"),
                  )
                  .catch((): Dynamic => false),
              );
            }
            deps.value202.current = false;
          }
        })();
      }

/** 画板 iframe 上报元素拖动事件（arm/move/exit/finish/cancel）时运行：维护拖出会话状态，松手时调用 dropElementDragAtCanvasPoint。 */
function handleFrameElementDragEvent(deps: { readonly focusedFileRef: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value193: Dynamic; readonly value195: Dynamic; readonly value197: Dynamic; readonly value198: Dynamic; readonly value200: Dynamic; readonly value201: Dynamic; readonly value205: Dynamic; readonly value207: Dynamic; readonly value208: Dynamic; readonly value209: Dynamic; readonly value210: Dynamic; readonly value215: Dynamic; readonly value216: Dynamic; readonly value217: Dynamic; readonly value218: Dynamic; readonly value67: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let current4: Dynamic = deps.value193.current;
        if (options.type === "arm") {
          if (
            input !== deps.focusedFileRef.current ||
            deps.value218.current ||
            (current4 &&
              current4.file === input &&
              current4.key !== options.key &&
              deps.value208(),
            deps.value209(),
            !options.tids)
          )
            return;
          let value657: Dynamic = deps.value217(input, options.tids);
          if (!value657) return;
          deps.value216.current = {
            key: options.key,
            file: input,
            tids: value657.tids,
            alt: options.alt,
            box: options.box,
            label: value657.label,
          };
          deps.value198(deps.value216.current);
          deps.value205(deps.value216.current);
          deps.value200(input);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value209, 6e4);
          return;
        }
        if (options.type === "disarm") {
          let current5: Dynamic = deps.value216.current;
          current5 &&
            current5.file === input &&
            current5.key === options.key &&
            deps.value209();
          current4 && current4.file === input && current4.key === options.key
            ? (current4.pendingDrop &&
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardEnded"),
                ),
              deps.value208())
            : !current4 && !deps.value216.current && deps.value200(null);
          return;
        }
        if (options.type === "exit") {
          if (input !== deps.focusedFileRef.current) return;
          if (current4) {
            if (current4.file === input) {
              if (current4.key !== options.key) return;
              current4.echoed = true;
              let pendingDrop: Dynamic = current4.pendingDrop;
              if (!pendingDrop) {
                deps.value198(current4);
                return;
              }
              deps.value208(true);
              deps.value177.current.get(input)?.hostDrag("finish", current4.key);
              deps.value215(
                current4,
                pendingDrop.cx,
                pendingDrop.cy,
                pendingDrop.alt,
              );
              return;
            }
            deps.value208();
          }
          if (deps.value218.current) return;
          let value657: Dynamic = deps.value217(input, options.tids);
          if (!value657) return;
          deps.value193.current = {
            key: options.key,
            file: input,
            tids: value657.tids,
            alt: options.alt,
            ctrl: false,
            box: options.box,
            label: value657.label,
            moves: [],
            latched: false,
            startedAt: Date.now(),
            echoed: true,
            pendingDrop: null,
          };
          deps.value198(deps.value193.current);
          deps.value200(input);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value210, 3e4);
          return;
        }
        if (
          !current4 ||
          current4.key !== options.key ||
          current4.file !== input
        )
          return;
        if (options.type === "cancel") {
          deps.value208();
          return;
        }
        let value653: Dynamic = deps.value67.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (!value653) return;
        let value654: Dynamic = value653.x + options.x,
          value655: Dynamic = value653.y + options.y;
        if (current4.pendingDrop) return;
        if (options.type === "move") {
          let value657: Dynamic = Date.now();
          for (
            current4.moves.push(value657);
            current4.moves.length > 0 &&
            (current4.moves[0] < value657 - 1e3 ||
              current4.moves.length > 240);

          )
            current4.moves.shift();
          current4.moves.length > 120 && (current4.latched = true);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value210, 3e4);
          current4.latched ||
            deps.value195(deps.value197(current4, value654, value655, options.alt));
          current4.ctrl = options.ctrl;
          deps.value207(current4, value654, value655, options.alt);
          return;
        }
        let value656: Dynamic = current4.moves.length > 0;
        deps.value208(value656);
        value656 &&
          ((current4.ctrl = options.ctrl),
          deps.value215(current4, value654, value655, options.alt));
      }

/** 外壳侧指针接管元素拖动后运行（onHostDrag：stale/move/exit/cancel/finish）：更新拖出会话与幽灵位置，松手时提交落点。 */
function handleHostElementDragEvent(deps: { readonly focusedFileRef: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value193: Dynamic; readonly value195: Dynamic; readonly value197: Dynamic; readonly value201: Dynamic; readonly value207: Dynamic; readonly value208: Dynamic; readonly value209: Dynamic; readonly value210: Dynamic; readonly value215: Dynamic; readonly value216: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra: Dynamic = false): Dynamic {
        let current4: Dynamic = deps.value193.current,
          current5: Dynamic = deps.value216.current,
          value654: Dynamic = current4 ?? current5,
          value655: Dynamic = value654
            ? deps.value177.current.get(value654.file)
            : undefined;
        if (!current4?.pendingDrop) {
          if (input === "stale") {
            deps.value210();
            return;
          }
          if (input === "move") {
            if (!current4) {
              if (!current5 || current5.file !== deps.focusedFileRef.current)
                return;
              current4 = {
                ...current5,
                alt: value653,
                ctrl: extra,
                moves: [],
                latched: false,
                startedAt: Date.now(),
                echoed: false,
                pendingDrop: null,
              };
              deps.value193.current = current4;
              value655?.hostDrag("exit", current5.key, value653);
            }
            current4.moves.push(Date.now());
            current4.moves.length > 240 && current4.moves.shift();
            deps.value201.current && clearTimeout(deps.value201.current);
            deps.value201.current = setTimeout(deps.value210, 3e4);
            deps.value195(deps.value197(current4, options, context, value653));
            current4.ctrl = extra;
            deps.value207(current4, options, context, value653);
            return;
          }
          deps.value209();
          if (!current4) {
            current5 && value655?.hostDrag("cancel", current5.key);
            return;
          }
          current4.ctrl = extra;
          if (input === "cancel" || current4.moves.length === 0) {
            deps.value208();
            value655?.hostDrag("cancel", current4.key);
            return;
          }
          if (!current4.echoed) {
            current4.pendingDrop = {
              cx: options,
              cy: context,
              alt: value653,
            };
            deps.value195(null);
            deps.value201.current && clearTimeout(deps.value201.current);
            deps.value201.current = setTimeout((): Dynamic => {
              deps.value193.current?.pendingDrop &&
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardDid"),
                );
              deps.value210();
            }, 1500);
            return;
          }
          deps.value208(true);
          value655?.hostDrag("finish", current4.key);
          deps.value215(current4, options, context, value653);
        }
      }

/** 画布平移或缩放手势时运行（onPanZoom）：按缩放上下限计算以指针为中心的缩放或平移后的视口，并写入视口存储。 */
function applyPanZoomGesture(deps: { readonly focusedFileRef: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value224: Dynamic; readonly value226: Dynamic; readonly value271: Dynamic; readonly value345: Dynamic; readonly value67: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (deps.value345.current) return false;
        let value653: Dynamic =
            !deps.value224.current ||
            input === deps.focusedFileRef.current ||
            input === deps.value271.current,
          value654: Dynamic = deps.value67.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        if (!value653 || !value654) return false;
        let current4: Dynamic = deps.value226.current;
        current4.dx += options.dx;
        current4.dy += options.dy;
        options.pinch &&
          ((current4.pinch = true),
          (current4.dz += options.dz),
          options.dz !== 0 && (current4.zoomMsgs += 1),
          (current4.px =
            value654.x + Math.max(0, Math.min(value654.w, options.x))),
          (current4.py =
            value654.y + Math.max(0, Math.min(value654.h, options.y))));
        current4.raf ||
          (current4.raf = requestAnimationFrame((): Dynamic => {
            current4.raf = 0;
            let value655: Dynamic = performance.now();
            value655 - current4.winStart > 1e3 &&
              ((current4.winStart = value655),
              (current4.winPan = 0),
              (current4.winZoom = 0));
            let value656: Dynamic =
                Math.abs(current4.dx) + Math.abs(current4.dy),
              value657: Dynamic =
                value656 > 0
                  ? Math.min(
                      1,
                      Math.max(0, canvasPanUsageWindowMs - current4.winPan) /
                        value656,
                    )
                  : 0,
              value658: Dynamic = current4.dx * value657,
              value659: Dynamic = current4.dy * value657;
            current4.winPan += Math.abs(value658) + Math.abs(value659);
            let scale: Dynamic = deps.value105.get().scale,
              value660: Dynamic = current4.pinch
                ? Math.log(
                    Math.max(
                      viewportScaleLimits.minScale,
                      Math.min(
                        viewportScaleLimits.maxScale,
                        scale * Math.exp(current4.dz),
                      ),
                    ) / scale,
                  )
                : 0,
              value661: Dynamic = Math.max(
                0,
                canvasZoomUsageWindow - current4.winZoom,
              ),
              value662: Dynamic = Math.max(
                -value661,
                Math.min(value661, value660),
              );
            current4.winZoom += Math.max(
              Math.abs(value662),
              current4.zoomMsgs * minimumCanvasZoomUsage,
            );
            let pinch: Dynamic = current4.pinch,
              px2: Dynamic = current4.px,
              py2: Dynamic = current4.py,
              value663: Dynamic = deps.value106.current?.clientWidth ?? 0,
              value664: Dynamic = deps.value106.current?.clientHeight ?? 0;
            current4.dx = 0;
            current4.dy = 0;
            current4.dz = 0;
            current4.zoomMsgs = 0;
            current4.pinch = false;
            deps.value105.set((input2?: Dynamic): Dynamic => {
              let value665: Dynamic = input2;
              if (pinch && value662 !== 0) {
                let value666: Dynamic = Math.max(
                    0,
                    Math.min(value663, (px2 - value665.x) * value665.scale),
                  ),
                  value667: Dynamic = Math.max(
                    0,
                    Math.min(value664, (py2 - value665.y) * value665.scale),
                  );
                value665 = (0, zoomViewportAtPoint)(
                  value665,
                  value666,
                  value667,
                  Math.exp(value662),
                  viewportScaleLimits,
                );
              }
              (value658 !== 0 || value659 !== 0) &&
                (value665 = (0, panViewport)(
                  value665,
                  -value658,
                  -value659,
                ));
              return value665;
            });
          }));
        return true;
      }

/** 选择变化时计算（useMemo）：汇总选中元素的标签、文字、样式、字体与颜色普查，生成属性面板使用的 probe 与 seed。 */
function deriveSelectionInspectorProbe(deps: { readonly selection: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value232: Dynamic; readonly value242: Dynamic }): Dynamic {
      if (deps.selection.elements.size === 0) return null;
      let index: Dynamic = 0,
        index2: Dynamic = 0,
        index3: Dynamic = 0,
        index4: Dynamic = 0,
        index5: Dynamic = 0,
        index6: Dynamic = 0,
        state: Dynamic = {},
        text: Dynamic = "",
        value653: Dynamic = null,
        value654: Dynamic = null,
        items: Dynamic = [],
        text2: Dynamic = "none",
        items2: Dynamic = [
          "font-weight",
          "font-style",
          "text-decoration-line",
          "text-align",
          "line-height",
          "letter-spacing",
          "border-style",
          "border-width",
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width",
          "border-color",
          "border-radius",
          "border-top-left-radius",
          "border-top-right-radius",
          "border-bottom-right-radius",
          "border-bottom-left-radius",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
          "margin-top",
          "margin-right",
          "margin-bottom",
          "margin-left",
          "stroke-width",
          "stroke-dasharray",
          "fill",
          "background-color",
          "background",
          ...InspectorPropertySchemaItems,
        ],
        value655: Dynamic = null,
        flag2: Dynamic = false,
        value656: Dynamic = null,
        value657: Dynamic = null,
        value658: Dynamic = null,
        value659: Dynamic = null,
        value660: Dynamic = null,
        value661: Dynamic = null,
        items3: Dynamic = [];
      for (let [value664, value665] of deps.selection.elements as Dynamic) {
        let entry: Dynamic = deps.value177.current.get(value664),
          value666: Dynamic = entry?.describeTids(value665.tids) ?? [],
          value667: Dynamic = value664 === deps.selection.primary,
          value668: Dynamic = deps.value19(value664);
        for (let value669 of value666 as Dynamic) {
          if (
            value667 &&
            value656 == null &&
            ((value656 = {
              file: value664,
              tid: value669.tid,
              kind: value669.kind,
            }),
            (text = value669.tag),
            entry)
          ) {
            for (let value670 of items2 as Dynamic) {
              let value671: Dynamic = entry.readInlineStyle(
                value668,
                value669.tid,
                value670,
              );
              value671 && (state[value670] = value671);
            }
            value669.kind === "image" &&
              (value653 =
                entry.readAttrs(value668, value669.tid)?.src ?? null);
            value669.tag === "a" &&
              (value654 =
                entry.readAttrs(value668, value669.tid)?.href ?? null);
            text2 = entry.listKindOf(value669.tid);
          }
          value669.kind === "box"
            ? index3++
            : value669.kind === "image"
              ? index4++
              : value669.kind === "other" && index5++;
          value669.kind === "text" &&
            (index++,
            entry &&
              items.length < 64 &&
              items.push(
                entry.readInlineStyle(value668, value669.tid, "font-size") ||
                  null,
              ),
            value667 &&
              value655 == null &&
              ((value655 = {
                file: value664,
                tid: value669.tid,
              }),
              (flag2 = value669.editable)),
            value667 &&
              entry &&
              value657 == null &&
              value658 == null &&
              ((value657 =
                entry.readInlineStyle(value668, value669.tid, "color") ||
                null),
              (value658 =
                entry.readInlineStyle(value668, value669.tid, "font-size") ||
                null),
              (value659 =
                entry.readInlineStyle(
                  value668,
                  value669.tid,
                  "font-family",
                ) || null)),
            value667 &&
              entry &&
              value660 == null &&
              (value660 =
                entry.readInlineStyle(
                  value668,
                  value669.tid,
                  "background-color",
                ) || null));
          if (value669.kind === "shape" || value669.kind === "box") {
            value669.kind === "shape" && index2++;
            let callback17: Dynamic = (input?: Dynamic): Dynamic =>
                input && input !== "none" ? input : null,
              value670: Dynamic =
                value667 && entry
                  ? entry.readAttrs(value668, value669.tid)
                  : null;
            value667 &&
              entry &&
              value660 == null &&
              (value660 =
                callback17(
                  entry.readInlineStyle(
                    value668,
                    value669.tid,
                    "background-color",
                  ),
                ) ||
                callback17(
                  entry.readInlineStyle(value668, value669.tid, "fill"),
                ) ||
                callback17(value670?.fill) ||
                null);
            value667 &&
              entry &&
              value661 == null &&
              (value661 =
                callback17(
                  entry.readInlineStyle(value668, value669.tid, "stroke"),
                ) ||
                callback17(
                  entry.readInlineStyle(
                    value668,
                    value669.tid,
                    "border-color",
                  ),
                ) ||
                callback17(value670?.stroke) ||
                null);
          } else
            value669.kind === "line" &&
              (index6++,
              value667 &&
                entry &&
                value661 == null &&
                (value661 =
                  entry.readInlineStyle(value668, value669.tid, "stroke") ||
                  entry.readInlineStyle(
                    value668,
                    value669.tid,
                    "border-color",
                  ) ||
                  null));
        }
        value667 && entry && (items3 = entry.pageFonts());
      }
      let entries: Dynamic = new Map(),
        callback15: Dynamic = (input?: Dynamic): Dynamic => {
          let value664: Dynamic = input.toLowerCase();
          entries.has(value664) || entries.set(value664, input);
        };
      for (let value664 of items3 as Dynamic) callback15(value664);
      let values: Dynamic = new Set(),
        values2: Dynamic = new Set(),
        entries2: Dynamic = new Map(),
        entries3: Dynamic = new Map(),
        state2: Dynamic = {},
        state3: Dynamic = {};
      for (let [value664, value665] of deps.value177.current as Dynamic) {
        let value666: Dynamic = value665.pageCensus();
        for (let value667 of value666.fonts as Dynamic) callback15(value667);
        for (let value667 of value666.webfonts as Dynamic)
          values2.add(value667);
        for (let value667 of value666.sizes as Dynamic) values.add(value667);
        for (let [value667, value668] of value666.colors as Dynamic)
          entries2.set(value667, (entries2.get(value667) ?? 0) + value668);
        if (deps.selection.elements.has(value664))
          for (let [value667, value668] of value666.colors as Dynamic)
            entries3.set(value667, (entries3.get(value667) ?? 0) + value668);
        for (let [value667, value668] of value666.roles as Dynamic)
          for (let [value669, value670] of value668 as Dynamic)
            (state2[value667] ??= {})[value669] =
              (state2[value667]?.[value669] ?? 0) + value670;
        for (let [value667, value668] of value666.families as Dynamic)
          state3[value667] ??= value668;
      }
      let callback16: Dynamic = (
          input?: Dynamic,
          options?: Dynamic,
        ): Dynamic =>
          [...input]
            .sort(
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                options2[1] - input2[1],
            )
            .slice(0, options)
            .map(([input2]: Dynamic): Dynamic => input2),
        value662: Dynamic = callback16(entries2, 12),
        value663: Dynamic = callback16(
          entries3,
          canvasSelectionChromeInsetPixels,
        );
      value663.join(`
`) !==
        deps.value242.current.join(`
`) && (deps.value242.current = value663);
      let values3: Dynamic = new Set(entries.values());
      return {
        text: index,
        shape: index2,
        box: index3,
        image: index4,
        other: index5,
        line: index6,
        primaryTag: text,
        primaryText: value655,
        primaryEditable: flag2,
        probeEl: value655
          ? {
              ...value655,
              kind: "text",
            }
          : value656,
        seed: {
          epoch: deps.value232,
          color: value657,
          fontSize: value658,
          fontFamily: value659,
          background: value660,
          stroke: value661,
          more: state,
          imageSrc: value653,
          href: value654,
          list: text2,
          fontSizes: items,
          fonts: [...values3],
          webfonts: [...values2],
          sizes: [...values],
          sizeRoles: state2,
          sizeFamilies: state3,
          colors: value662,
          artboardColors: deps.value242.current,
        },
      };
    }

/** 页面菜单选择重命名时运行：弹窗输入新页面名，写入清单并恢复焦点。 */
async function promptRenamePage(deps: { readonly value286: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        let pages: Dynamic = deps.value73.current.pages,
          value653: Dynamic =
            input === "" && (pages === undefined || pages.length === 0)
              ? defaultCanvasPage
              : pages?.find(
                  (input2?: Dynamic): Dynamic => input2.id === input,
                );
        if (!value653) return;
        let value654: Dynamic = await (0, promptCanvasValue)({
          get title() { return uiMessage("canvas.designCanvas.renamePage"); },
          initialValue: value653.name,
          inputLabel: "Page name",
          get confirmLabel() { return uiMessage("canvas.designCanvas.rename"); },
          maxLength: 120,
        });
        (0, clearEscapeReleaseSuppression)();
        deps.value286.current?.focus({
          preventScroll: true,
        });
        let value655: Dynamic =
          value654 === null
            ? undefined
            : (0, PlatformFileContentSlice)(value654);
        if (value655 === undefined || value655 === value653.name) return;
        let current4: Dynamic = deps.value73.current,
          value656: Dynamic =
            current4.pages !== undefined && current4.pages.length > 0,
          value657: Dynamic = value656 ? [...current4.pages] : [value653],
          value658: Dynamic = value657.find(
            (input2?: Dynamic): Dynamic => input2.id === value653.id,
          );
        if (!value658 || value658.name === value655) return;
        let value659: Dynamic = value657.map(
          (input2?: Dynamic): Dynamic =>
            input2.id === value653.id
              ? {
                  ...input2,
                  name: value655,
                }
              : input2,
        );
        deps.value396.current(
          {
            kind: "page-rename",
            id: value658.id,
            from: value658.name,
            to: value655,
            ...(value656
              ? {}
              : {
                  first: value658,
                }),
          },
          new Set(),
        );
        deps.value98({
          ...current4,
          pages: value659,
        });
      }

/** 绘制画板或点击新增画板时运行（onDrawArtboard/onAdd）：生成空白 dc 文件与唯一标题，放到指定或下一个位置并选中，失败时提示。 */
function addBlankArtboard(deps: { readonly callback3: Dynamic; readonly doc: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value189: Dynamic; readonly value273: Dynamic; readonly value310: Dynamic; readonly value338: Dynamic; readonly value341: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value90: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        let files: Dynamic = deps.doc.content().files,
          value653: Dynamic = (0, uniqueArtboardFile)(
            files,
            "Artboard",
            deps.supportsLoadState,
          );
        input && (deps.value310.current = true);
        (async (): Promise<Dynamic> => {
          try {
            let value654: Dynamic = options
              ? (0, insertBlankArtboardMarkup)(
                  (0, blankDcDocument)(),
                  options,
                )
              : (0, blankDcDocument)();
            await (0, getKvClient)().set(
              (0, PlatformFileContentHandler_4)(value653),
              value654,
            );
            let value655: Dynamic = deps.value90.current.filter(
                (input2?: Dynamic): Dynamic => input2.file !== value653,
              ),
              value656: Dynamic =
                input ?? nextArtboardPlacementPoint(value655),
              state: Dynamic = {
                file: value653,
                x: Math.round(value656.x),
                y: Math.round(value656.y),
                w:
                  input && input.w > 0
                    ? input.w
                    : PlatformFileContentConstant_5,
                h:
                  input && input.h > 0
                    ? input.h
                    : PlatformFileContentConstant_6,
                title:
                  context?.title ?? (0, nextArtboardTitle)(value655),
                ...deps.callback3(),
              };
            deps.value396.current(
              {
                kind: "add",
                entries: [
                  {
                    file: value653,
                    src: value654,
                    spec: state,
                  },
                ],
              },
              new Set([value653]),
              context?.siblings,
            );
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
                  (input2?: Dynamic): Dynamic => input2.file !== value653,
                ),
                state,
              ],
            });
            context?.auto !== true &&
              (0, frameAnalyticsReporter)(
                designAnalyticsEvents.artboardInserted,
              );
            deps.value273(value653);
            deps.value338("select");
            deps.value341((input2?: Dynamic): Dynamic => input2 + 1);
            context?.doneSay && deps.value189(context.doneSay);
          } catch (value654: Dynamic) {
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTAddAnArtboard") + String(value654),
              "error",
            );
          }
        })();
        return value653;
      }

/** 挂载时注册的全局 keydown 处理：处理 Escape、Delete/Backspace、Enter、方向键微移、层级前后移动与右键菜单快捷键，避开输入框、弹层和交互预览。 */
function subscribeCanvasKeyDown(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly pendingFrameSelectionRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly value106: Dynamic; readonly value125: Dynamic; readonly value147: Dynamic; readonly value152: Dynamic; readonly value155: Dynamic; readonly value159: Dynamic; readonly value21: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value279: Dynamic; readonly value295: Dynamic; readonly value32: Dynamic; readonly value33: Dynamic; readonly value339: Dynamic; readonly value345: Dynamic; readonly value404: Dynamic; readonly value42: Dynamic; readonly value459: Dynamic; readonly value48: Dynamic; readonly value52: Dynamic; readonly value552: Dynamic; readonly value56: Dynamic; readonly value61: Dynamic; readonly value73: Dynamic }): Dynamic {
    let callback15: Dynamic = (): Dynamic => {
        let current4: Dynamic = deps.selectionRef.current;
        !deps.value224.current ||
          deps.value218.current ||
          (0, hasBlockingEditorOverlay)() ||
          (0, isEmptyCanvasSelection)(current4) ||
          (current4.elements.size > 0
            ? deps.value147.current(DeletedValue)
            : deps.value459.current((0, canvasBoardSelection)(current4)));
      },
      callback16: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented || !deps.value224.current || deps.value345.current)
          return;
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic =
            event.key === "Escape" &&
            (0, isEmptyCanvasSelection)(current4) &&
            deps.value125.current != null,
          value654: Dynamic =
            deps.focusedFileRef.current != null &&
            current4.elements.has(deps.focusedFileRef.current),
          value655: Dynamic = event.metaKey || event.ctrlKey,
          value656: Dynamic =
            (event.key === "Delete" || event.key === "Backspace") &&
            !value655,
          value657: Dynamic =
            value656 && deps.value32.current?.gen === deps.selectionEpochRef.current
              ? deps.value32.current
              : null,
          value658: Dynamic =
            value657 != null ||
            (value656 &&
              value654 &&
              deps.pendingFrameSelectionRef.current != null &&
              deps.pendingFrameSelectionRef.current.file ===
                deps.focusedFileRef.current),
          value659: Dynamic =
            event.target instanceof Element
              ? event.target.closest("[data-mega-title-text]")
              : null,
          value660: Dynamic =
            value659
              ?.closest("[data-mega-artboard]")
              ?.getAttribute("data-mega-artboard") ?? null,
          value661: Dynamic =
            value659 != null &&
            value659.closest("[data-mega-inside]") == null &&
            value660 != null &&
            (current4.artboards.has(value660) ||
              current4.elements.has(value660)),
          value662: Dynamic =
            current4.artboards.size +
              current4.notes.size +
              current4.elements.size >
            1,
          value663: Dynamic =
            value661 &&
            event.key === "Enter" &&
            !value655 &&
            !event.altKey &&
            !(0, hasBlockingEditorOverlay)() &&
            !deps.value218.current &&
            (event.shiftKey ? current4.elements.size > 0 : value662),
          value664: Dynamic =
            value655 || event.altKey
              ? null
              : (0, keyboardNudgeDelta)(event.key, event.shiftKey),
          value665: Dynamic = value664 != null && deps.value159.current,
          callback17: Dynamic = (input?: Dynamic): Dynamic =>
            input instanceof Element &&
            ((0, isEditingInputTarget)(input) ||
              input.closest(
                "[data-mega-chrome],[data-mega-title-text],[data-mega-piece],button,[role=button],a[href],input,textarea,select",
              ) != null),
          callback18: Dynamic = (input?: Dynamic): Dynamic =>
            input instanceof Element
              ? (0, isEditingInputTarget)(input) ||
                (0, isInteractivePreviewTarget)(input) ||
                input.closest(
                  '[data-mega-inside],[data-mega-selection-strip],[aria-haspopup="menu"],[aria-haspopup="listbox"],input,textarea,select',
                ) != null
                ? true
                : value659 != null
                  ? !value661
                  : input.closest("[data-mega-chrome]") != null
              : false;
        if (
          value655 &&
          !event.shiftKey &&
          !event.altKey &&
          event.key.toLowerCase() === "a"
        ) {
          if (
            value654 ||
            callback18(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "all",
          });
          return;
        }
        let value666: Dynamic =
          value655 || event.altKey || !event.shiftKey
            ? null
            : event.key.toLowerCase() === "h"
              ? "horizontal"
              : event.key.toLowerCase() === "v"
                ? "vertical"
                : null;
        if (
          value666 !== null &&
          !value654 &&
          !(0, isEmptyCanvasSelection)(current4)
        ) {
          if (
            event.repeat ||
            (0, isEditingInputTarget)(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            (event.target instanceof Element &&
              event.target.closest('[data-mega-chrome="selection-menu"]'))
          )
            return;
          if (
            event.target instanceof Element &&
            (event.target.hasAttribute("data-mega-title-text") ||
              event.target.hasAttribute("data-mega-piece"))
          ) {
            let value673: Dynamic = event.target
              .closest("[data-mega-artboard]")
              ?.getAttribute("data-mega-artboard");
            if (
              value673 != null &&
              !current4.artboards.has(value673) &&
              !current4.elements.has(value673)
            ) {
              event.preventDefault();
              (0, announce)(
                (0, artboardNotSelectedAnnouncement)(
                  deps.value73.current.artboards.find(
                    (input?: Dynamic): Dynamic => input.file === value673,
                  )?.title ?? value673.replace(/\.dc\.html$/, ""),
                ),
              );
              return;
            }
          }
          if (!deps.value152.current(value666)) return;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        let value667: Dynamic =
            event.target instanceof Element ? event.target : null,
          value668: Dynamic =
            value667?.closest("[data-mega-inside]") != null
              ? null
              : (value667
                  ?.closest("[data-mega-title-text],[data-mega-piece]")
                  ?.closest("[data-mega-artboard]")
                  ?.getAttribute("data-mega-artboard") ?? null);
        if (
          (0, isContextMenuShortcut)(event) &&
          !value655 &&
          !event.altKey &&
          (value668 != null ||
            (current4.elements.size === 0 &&
              current4.artboards.size + current4.notes.size > 0))
        ) {
          if (
            (value668 == null &&
              ((0, isEditingInputTarget)(value667) ||
                value667?.closest(
                  "button,[role=button],[role=treeitem],[role=textbox],[data-mega-selection-strip],.tb-root",
                ) != null)) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          let value673: Dynamic = value668 ?? [...current4.artboards][0],
            value674: Dynamic = [...current4.notes][0] ?? "",
            current5: Dynamic = deps.value106.current,
            value675: Dynamic = current5?.querySelector(
              value673 !== undefined
                ? `[data-mega-artboard="${CSS.escape(value673)}"] :is([data-mega-chrome="title"], [data-mega-piece])`
                : `[data-mega-annotation="${CSS.escape(value674)}"]`,
            );
          if (
            current5 == null ||
            value675 == null ||
            (event.preventDefault(),
            event.stopPropagation(),
            (0, suppressNativeContextMenu)(false),
            event.repeat)
          )
            return;
          let [items, items2]: Dynamic = [
              value675.getBoundingClientRect(),
              current5.getBoundingClientRect(),
            ],
            callback19: Dynamic = (
              input?: Dynamic,
              options?: Dynamic,
              context?: Dynamic,
            ): Dynamic => Math.min(Math.max(input, options + 8), context - 8),
            value676: Dynamic =
              value673 !== undefined
                ? {
                    x: items.left,
                    y: items.bottom,
                  }
                : {
                    x: items.left + Math.min(40, items.width / 2),
                    y: items.top + Math.min(24, items.height / 2),
                  };
          deps.value295.current(
            value673 !== undefined
              ? {
                  kind: "artboard",
                  file: value673,
                }
              : {
                  kind: "object",
                  id: value674,
                },
            {
              x: callback19(value676.x, items2.left, items2.right),
              y: callback19(value676.y, items2.top, items2.bottom),
              keyboard: true,
            },
          );
          return;
        }
        if (
          ((0, isEmptyCanvasSelection)(current4) || value654) &&
          !value658 &&
          !value653 &&
          !value663 &&
          !value665
        )
          return;
        if (event.key === "Enter" && !value655 && !event.altKey) {
          if (
            !(
              event.target == null ||
              event.target === (document as Dynamic).body ||
              event.target === (document as Dynamic).documentElement ||
              (0, isCanvasEnterAction)(event) ||
              value663
            ) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          if (event.shiftKey) {
            if (current4.elements.size === 0) return;
            event.preventDefault();
            event.stopPropagation();
            deps.value56.current({
              kind: "parent",
            });
            return;
          }
          if (
            current4.notes.size === 0 &&
            current4.elements.size === 0 &&
            current4.artboards.size === 1
          ) {
            let [artboards]: Dynamic = current4.artboards;
            if (
              artboards == null ||
              deps.value73.current.artboards.find(
                (input?: Dynamic): Dynamic => input.file === artboards,
              )?.frameless
            )
              return;
            event.preventDefault();
            artboards !== deps.focusedFileRef.current &&
              (0, isCanvasEnterAction)(event) &&
              (deps.value552.refocusAt = Date.now());
            deps.value42.current(artboards);
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "enter",
          });
          return;
        }
        if (event.key === "Tab" && !value655 && !event.altKey) {
          if (
            current4.elements.size === 0 ||
            callback17(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current ||
            (0, activeCropElement)() !== null ||
            (event.target != null &&
              event.target !== (document as Dynamic).body &&
              event.target !== (document as Dynamic).documentElement)
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: event.shiftKey ? "prev" : "next",
          });
          return;
        }
        if (value664) {
          if (
            callback18(event.target) ||
            (0, hasBlockingEditorOverlay)() ||
            deps.value218.current
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          deps.value56.current({
            kind: "nudge",
            ...value664,
            repeat: event.repeat,
          });
          return;
        }
        let value669: Dynamic =
          event.metaKey || (event.ctrlKey && !event.altKey)
            ? null
            : event.key === "]"
              ? "front"
              : event.key === "["
                ? "back"
                : null;
        if (
          value669 !== null &&
          current4.artboards.size > 0 &&
          current4.elements.size === 0
        ) {
          let value673: Dynamic =
            event.target instanceof Element ? event.target : null;
          if (
            (0, isEditingInputTarget)(value673) ||
            value673?.closest(
              '[role=textbox],[role=searchbox],[role=combobox],[data-mega-selection-strip],[data-mega-chrome="selection-menu"]',
            ) != null
          )
            return;
          let value674: Dynamic = value673
            ?.closest("[data-mega-title-text],[data-mega-piece]")
            ?.closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          if (
            (value674 != null && !current4.artboards.has(value674)) ||
            (0, hasBlockingEditorOverlay)() ||
            !(0, sessionAllowsMutation)({
              gesturing: deps.value218.current,
              setMoveCommits: deps.value155.current,
            }) ||
            (event.preventDefault(), event.stopPropagation(), event.repeat)
          )
            return;
          deps.value52.current((): Dynamic => {
            let current5: Dynamic = deps.selectionRef.current;
            !deps.value224.current ||
              (0, hasBlockingEditorOverlay)() ||
              current5.artboards.size === 0 ||
              current5.elements.size > 0 ||
              !(0, sessionAllowsMutation)({
                gesturing: deps.value218.current,
                setMoveCommits: deps.value155.current,
              }) ||
              deps.value404.current(current5.artboards, value669);
          });
          return;
        }
        if (
          event.key !== "Delete" &&
          event.key !== "Backspace" &&
          event.key !== "Escape"
        )
          return;
        let target: Dynamic = event.target,
          value670: Dynamic =
            target instanceof HTMLElement &&
            (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
              target.isContentEditable),
          value671: Dynamic =
            target instanceof Element &&
            target.closest(
              "[data-tweak-popup],[data-popover-primitive]," +
                blockingOverlaySelector,
            ) != null;
        if (
          (0, isEditingInputTarget)(target) &&
          !(
            event.key === "Escape" &&
            (0, isPropertyEditorTarget)(target) &&
            !value670 &&
            !value671
          )
        )
          return;
        if (event.key === "Escape") {
          if (
            deps.value339.current !== "select" ||
            (value653 && (0, hasBlockingEditorOverlay)())
          )
            return;
          if (deps.value61.current()) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          let callback19: Dynamic = (): Dynamic => {
            deps.abandonSelectionGesture();
            value653
              ? deps.value279.current()
              : deps.value33.current(emptyCanvasSelection);
          };
          !value653 && deps.value48.current > 0
            ? deps.value52.current(callback19)
            : callback19();
          return;
        }
        if (
          (0, hasBlockingEditorOverlay)() ||
          (event.target instanceof Element &&
            event.target.closest('[data-mega-chrome="selection-menu"]'))
        )
          return;
        if (
          event.target instanceof Element &&
          (event.target.hasAttribute("data-mega-title-text") ||
            event.target.hasAttribute("data-mega-piece"))
        ) {
          let value673: Dynamic = event.target
            .closest("[data-mega-artboard]")
            ?.getAttribute("data-mega-artboard");
          if (value673 != null && !current4.artboards.has(value673)) {
            event.preventDefault();
            let value674: Dynamic = deps.value73.current.artboards.find(
              (input?: Dynamic): Dynamic => input.file === value673,
            );
            (0, announce)(
              (0, artboardNotSelectedAnnouncement)(
                value674?.title ?? value673.replace(/\.dc\.html$/, ""),
              ),
            );
            return;
          }
        }
        let value672: Dynamic = (0, focusedOutlineRow)(event.target);
        if (value672 != null) {
          event.preventDefault();
          (0, announce)(
            (0, selectionActionRefusalAnnouncement)(
              value672.name,
              "deleted",
              value672.onRow,
              deps.value21.current(),
            ),
          );
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (value657 != null) {
          value657.over.then(
            (): Dynamic => {
              if (
                value657.expired ||
                value657.travelled ||
                deps.value218.current ||
                !deps.value224.current
              )
                return;
              let value673: Dynamic = value657.answered
                  ? value657.after
                  : value657.kind !== "focus"
                    ? current4
                    : null,
                current5: Dynamic = deps.selectionRef.current;
              value673 == null ||
                (0, isEmptyCanvasSelection)(current5) ||
                !canvasSelectionsEqual(value673, current5) ||
                deps.value52.current(callback15);
            },
            (): Dynamic => {},
          );
          return;
        }
        deps.value52.current(callback15);
      };
    (document as Dynamic).addEventListener("keydown", callback16, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("keydown", callback16, true);
  }

/** 复制快捷键选中画板或画布说明时运行：计算偏移后的位置，交给 onDuplicateObjects 生成副本。 */
function duplicateSelectedBoards(deps: { readonly value344: Dynamic; readonly value383: Dynamic; readonly value87: Dynamic; readonly value90: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let value653: Dynamic = deps.value87.current.artboards.filter(
            (input2?: Dynamic): Dynamic => input.files.has(input2.file),
          ),
          value654: Dynamic = (deps.value87.current.annotations ?? []).filter(
            (input2?: Dynamic): Dynamic => input.notes.has(input2.id),
          ),
          items: Dynamic = [
            ...value653,
            ...value654.map(annotationVisibleBounds),
          ];
        if (items.length === 0) return false;
        let [items2, items3]: Dynamic = [
            Math.min(...items.map((input2?: Dynamic): Dynamic => input2.x)),
            Math.min(...items.map((input2?: Dynamic): Dynamic => input2.y)),
          ],
          value655: Dynamic =
            value653.length > 0
              ? nextArtboardPlacementPoint(deps.value90.current)
              : {
                  x: items2 + 24,
                  y: items3 + 24,
                },
          [items4, items5]: Dynamic = [
            value655.x - items2,
            value655.y - items3,
          ];
        deps.value383.current({
          x: value655.x,
          y: value655.y,
          w:
            Math.max(
              ...items.map(
                (input2?: Dynamic): Dynamic => input2.x + input2.w,
              ),
            ) - items2,
          h:
            Math.max(
              ...items.map(
                (input2?: Dynamic): Dynamic => input2.y + input2.h,
              ),
            ) - items3,
        });
        return deps.value344.current(
          value653.map(
            (input2?: Dynamic): Dynamic => ({
              file: input2.file,
              x: input2.x + items4,
              y: input2.y + items5,
            }),
          ),
          value654.map(
            (input2?: Dynamic): Dynamic => ({
              id: input2.id,
              x: input2.x + items4,
              y: input2.y + items5,
            }),
          ),
          options,
        );
      }

/** 图片文件拖入或粘贴到画布或画板时运行：校验尺寸与格式、上传文件、显示占位，再作为画布图片或画板内图片元素插入。 */
function placeDroppedImages(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value271: Dynamic; readonly value316: Dynamic; readonly value328: Dynamic; readonly value329: Dynamic; readonly value330: Dynamic; readonly value332: Dynamic; readonly value339: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic): Dynamic {
        let callback15: Dynamic = (): Dynamic => {};
        (0, trackEmbeddedWrite)(
          (async (): Promise<Dynamic> => {
            let value654: Dynamic = deps.value332(options, context, extra);
            if (value654 != null && value654.file === deps.value271.current) {
              deps.value188(
                uiMessage("canvas.designCanvas.nothingAddedThatArtboardIs"),
              );
              return;
            }
            if (extra != null && !value654) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotPlaceTheValue1", { value1: uiOperation(value653) }));
              return;
            }
            let callback16: Dynamic = (
                input?: Dynamic,
                options2?: Dynamic,
                context2?: Dynamic,
              ): Dynamic =>
                (0, droppedImagePlacement)(
                  {
                    x: options,
                    y: context,
                  },
                  context2,
                  input,
                  options2,
                ),
              callback17: Dynamic = (
                input?: Dynamic,
                options2?: Dynamic,
              ): Dynamic => {
                let { w: value662, h: value663 }: Dynamic = (0,
                defaultPlacedImageSize)(input, options2);
                return value663 > PlatformFileContentLimit_6
                  ? {
                      w: Math.max(
                        PlatformFileContentConstant_20,
                        Math.round(
                          (value662 * PlatformFileContentLimit_6) /
                            value663,
                        ),
                      ),
                      h: PlatformFileContentLimit_6,
                    }
                  : {
                      w: value662,
                      h: value663,
                    };
              };
            (0, markDropPerformance)("received");
            let value655: Dynamic = items.map(
                (): Dynamic => ({
                  d: null,
                  density: null,
                }),
              ),
              current4: Dynamic = deps.value80.current,
              callback18: Dynamic = (input?: Dynamic): Dynamic => {
                let index2: Dynamic = 0,
                  index3: Dynamic = 0,
                  index4: Dynamic = 0;
                return items.map(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                    if (input(options2)) return null;
                    let value662: Dynamic = value655[options2].d ?? {
                      width: 320,
                      height: 240,
                    };
                    if (value654)
                      return callback16(value662, index2++, value654);
                    let { w: value663, h: value664 }: Dynamic = callback17(
                      value662,
                      value655[options2].density,
                    );
                    index2++ === 0 &&
                      ([index3, index4] = [
                        Math.round(options - value663 / 2),
                        Math.round(context - value664 / 2),
                      ]);
                    let state: Dynamic = {
                      x: index3,
                      y: index4,
                      w: value663,
                      h: value664,
                    };
                    index3 += value663 + 80;
                    return state;
                  },
                );
              },
              value656: Dynamic = callback18((): Dynamic => false).map(
                (input?: Dynamic): Dynamic =>
                  (0, createDropGhost)({
                    file: value654?.file ?? null,
                    page: current4,
                    ...input,
                  }),
              ),
              values: Dynamic = new Set(value656.keys()),
              callback19: Dynamic = (
                input?: Dynamic,
                options2?: Dynamic,
              ): Dynamic => {
                values.delete(input) && value656[input][options2]();
              };
            callback15 = (): Dynamic => {
              for (let value662 of [...values] as Dynamic)
                callback19(value662, "cancel");
            };
            value655 = await Promise.all(
              items.map(async (input?: Dynamic): Promise<Dynamic> => {
                let value662: Dynamic = await input
                  .slice(0, 262144)
                  .arrayBuffer()
                  .then((input2?: Dynamic): Dynamic => new DataView(input2))
                  .catch((): Dynamic => null);
                return {
                  d: (0, isSvgFile)(input)
                    ? await (0, imageHeaderDimensions)(input).catch(
                        (): Dynamic => null,
                      )
                    : value662 &&
                      (0, rasterImageDimensions)(value662),
                  density:
                    value662 && (0, pngPhysicalDimensions)(value662),
                };
              }),
            );
            callback18((): Dynamic => false).forEach(
              (input?: Dynamic, options2?: Dynamic): Dynamic => {
                input && value656[options2].place(input);
              },
            );
            (0, markDropPerformance)("header");
            await (0, afterNextPaint)();
            let value657: Dynamic = await Promise.all(
                items.map(
                  (input?: Dynamic): Dynamic =>
                    (0, imagePlacementRejectionReason)(input) ==
                      null && !(0, isSvgFile)(input)
                      ? (0, canDecodeRasterImage)(input)
                      : Promise.resolve(false),
                ),
              ),
              value658: Dynamic = await Promise.all(
                items.map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic =>
                    value657[options2]
                      ? (0, previewImageFile)(input, {
                          sized: true,
                          head: value655[options2].d,
                        }).catch((): Dynamic => null)
                      : Promise.resolve(null),
                ),
              ),
              value659: Dynamic = await Promise.all(
                items.map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic =>
                    value658[options2]
                      ? Promise.resolve(null)
                      : (0, validateCanvasPlacedImage)(
                          input,
                          (0, isSvgFile)(input)
                            ? undefined
                            : value657[options2],
                        ),
                ),
              );
            await Promise.all(
              items.map(
                async (
                  input?: Dynamic,
                  options2?: Dynamic,
                ): Promise<Dynamic> => {
                  value659[options2] == null &&
                    !value658[options2] &&
                    (0, isSvgFile)(input) &&
                    (value658[options2] = await (0, previewImageFile)(
                      input,
                    ).catch((): Dynamic => null));
                },
              ),
            );
            (0, markDropPerformance)("gate");
            let value660: Dynamic = value655.map(
                (input?: Dynamic): Dynamic => input.d,
              ),
              value661: Dynamic = value655.map(
                (input?: Dynamic): Dynamic => input.density,
              );
            items.forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              value659[options2] == null &&
                !value658[options2] &&
                value660[options2] == null &&
                (value659[options2] = uiMessage("canvas.designCanvas.tooLargeToPlaceHere"));
            });
            items.forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              value659[options2] != null && callback19(options2, "cancel");
            });
            callback18(
              (input?: Dynamic): Dynamic => value659[input] != null,
            ).forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              input && value656[options2].move(input.x, input.y);
            });
            let length: Dynamic = value659.filter(
              (input?: Dynamic): Dynamic => input != null,
            ).length;
            length > 0 &&
              deps.value188(
                length === items.length
                  ? uiMessage("canvas.designCanvas.couldnTUseTheValue1", { value1: uiOperation(value653) }) +
                      (items.length > 1 ? uiMessage("canvas.designCanvas.s") : " \u2014 ") +
                      [
                        ...new Set(
                          value659.filter(
                            (input?: Dynamic): Dynamic => input != null,
                          ),
                        ),
                      ].join("; ") +
                      "."
                  : String(length) +
                      ` of the ${value653} files couldn't be used as images \u2014 placing the rest.`,
              );
            if (length === items.length) return;
            let callback20: Dynamic = (
              input?: Dynamic,
              options2?: Dynamic,
            ): Dynamic => {
              let value662: Dynamic = `<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" data-seed="${options2}-${Date.now()}"><rect width="100%" height="100%" fill="#e9e7e2"/></svg>`;
              return {
                url: "data:image/svg+xml," + encodeURIComponent(value662),
                width: input.width,
                height: input.height,
              };
            };
            items.forEach((input?: Dynamic, options2?: Dynamic): Dynamic => {
              value658[options2] =
                value659[options2] != null
                  ? null
                  : (value658[options2] ??
                    callback20(value660[options2], options2));
            });
            let callback21: Dynamic = (
              input?: Dynamic,
              options2?: Dynamic,
              context2?: Dynamic,
              value662?: Dynamic,
            ): Dynamic => {
              let value663: Dynamic = (0, registerHiddenPickerTag)(
                  value662,
                ),
                callback22: Dynamic = async (): Promise<Dynamic> => {
                  (0, isEmbedFrozen)() ||
                    (await input
                      .swapImageAttrs(context2, {
                        "data-dc-drop": null,
                      })
                      .catch((): Dynamic => false));
                };
              (0, trackEmbeddedWrite)(
                (0, uploadDesignFile)(
                  "appifact",
                  null,
                  items[options2],
                )
                  .then(async ({ src: src }: Dynamic): Promise<Dynamic> => {
                    if ((0, isEmbedFrozen)()) return;
                    (await input.swapImageAttrs(context2, {
                      src: src,
                      "data-dc-drop": null,
                    })) ||
                      (await callback22(),
                      deps.value188(
                        uiMessage("canvas.designCanvas.imageKeptAsAnEmbedded"),
                      ));
                  })
                  .catch(
                    async (): Promise<Dynamic> => (
                      await callback22(),
                      deps.value188(
                        uiMessage("canvas.designCanvas.imageUploadFailedTheValue1", { value1: uiOperation(value653) }),
                      ),
                      false
                    ),
                  )
                  .finally((): Dynamic => {
                    (0, markDropPerformance)("upload");
                    value663();
                  }),
              );
            };
            if (!value654) {
              let value662: Dynamic =
                PlatformFileContentLimit_5 -
                (deps.value73.current.annotations ?? []).length -
                deps.value329.current.length;
              if (value662 <= 0) {
                callback15();
                deps.value188(
                  uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
                    String(PlatformFileContentLimit_5) +
                    ").",
                );
                return;
              }
              let current5: Dynamic = deps.value80.current,
                state: Dynamic = {
                  sel: deps.selectionRef.current,
                  tool: deps.value339.current,
                  focus: deps.focusedFileRef.current,
                },
                value663: Dynamic = null,
                items2: Dynamic = [],
                index2: Dynamic = 0,
                index3: Dynamic = 0,
                index4: Dynamic = 0,
                index5: Dynamic = 0,
                callback22: Dynamic = (): Dynamic => {
                  if (--index5 > 0 || items2.length === 0) return;
                  let value664: Dynamic = index4 - items2.length,
                    value665: Dynamic =
                      items2.length === 1
                        ? uiMessage("canvas.designCanvas.pictureFromTheValue1Image", { value1: uiOperation(value653) })
                        : `${items2.length} pictures from the ${value653} images`,
                    value666: Dynamic = `${value664} of the ${value653} images ${value664 === 1 ? "was" : "were"} not placed.`;
                  value664 > 0 && deps.value188(value666);
                  (0, announce)(
                    value665 +
                      (value664 > 0 ? "; " + value666.slice(0, -1) : "") +
                      (length > 0
                        ? `; ${length} of the ${value653} files couldn't be used`
                        : ""),
                  );
                };
              for (
                let index6: Dynamic = 0;
                index6 < items.length && index4 < value662;
                index6++
              ) {
                let value664: Dynamic = value658[index6];
                if (!value664) continue;
                let value665: Dynamic = value660[index6] ?? {
                    width: value664.width,
                    height: value664.height,
                  },
                  { w: value666, h: value667 }: Dynamic = callback17(
                    value665,
                    value661[index6],
                  );
                index4 === 0 &&
                  ((index2 = Math.round(options - value666 / 2)),
                  (index3 = Math.round(context - value667 / 2)));
                let state2: Dynamic = {
                  key: "pp-" + String(++deps.value330.current),
                  x: index2,
                  y: index3,
                  w: value666,
                  h: value667,
                  url: value664.url,
                  page: current5,
                };
                deps.value328((input?: Dynamic): Dynamic => [...input, state2]);
                callback19(index6, "replaced");
                (0, markDropPerformance)("insert");
                let callback23: Dynamic = (): Dynamic => {
                  (0, markDropPerformance)("upload");
                  deps.value328(
                    (input?: Dynamic): Dynamic =>
                      input.filter(
                        (input2?: Dynamic): Dynamic => input2 !== state2,
                      ),
                  );
                };
                index5++;
                (0, trackEmbeddedWrite)(
                  (0, uploadDesignFile)(
                    "appifact",
                    null,
                    items[index6],
                  ).then(({ src: src }: Dynamic): Dynamic => {
                    if ((0, isEmbedFrozen)()) return;
                    callback23();
                    let value668: Dynamic = (0,
                    PlatformFileContentTest_2)(src);
                    if (value668 === null) {
                      deps.value188(
                        uiMessage("canvas.designCanvas.couldNotPlaceTheValue12", { value1: uiOperation(value653) }),
                      );
                      return callback22();
                    }
                    let value669: Dynamic = deps.value316.current(
                      {
                        kind: "image",
                        x: state2.x,
                        y: state2.y,
                        w: value666,
                        h: value667,
                        src: value668,
                        alt: (0, PlatformFileContentSlice)(
                          (0, droppedImageLabel)(
                            items[index6],
                            value653,
                          ),
                        ),
                        ...(current5 === "" ||
                        current5 === (deps.value73.current.pages?.[0]?.id ?? "")
                          ? {}
                          : {
                              page: current5,
                            }),
                      },
                      {
                        quiet: true,
                      },
                    );
                    if (value669 === null) {
                      callback22();
                      return false;
                    }
                    items2.push(value669);
                    (deps.selectionRef.current === state.sel ||
                      deps.selectionRef.current === value663) &&
                      deps.value339.current === state.tool &&
                      deps.focusedFileRef.current === state.focus &&
                      deps.value80.current === current5 &&
                      ((value663 = (0, selectionFromBoards)({
                        files: emptyBoardSelection.files,
                        notes: new Set(items2),
                      })),
                      (deps.selectionRef.current = value663),
                      deps.value62(),
                      deps.setSelection(value663));
                    callback22();
                  }),
                ).catch((): Dynamic => {
                  callback23();
                  deps.value188(
                    uiMessage("canvas.designCanvas.couldnTUseTheValue12", { value1: uiOperation(value653) }),
                  );
                  callback22();
                });
                index2 += value666 + 80;
                index4++;
              }
              callback15();
              let length2: Dynamic = value658.filter(Boolean).length;
              index4 < length2 &&
                deps.value188(
                  uiMessage("canvas.designCanvas.placingTheFirst") +
                    String(index4) +
                    " \u2014 this canvas is at its limit for notes and shapes (" +
                    String(PlatformFileContentLimit_5) +
                    ").",
                );
              return;
            }
            let entry: Dynamic = deps.value177.current.get(value654.file);
            if (!entry) {
              callback15();
              deps.value188(uiMessage("canvas.designCanvas.couldNotPlaceTheValue1", { value1: uiOperation(value653) }));
              return;
            }
            let index: Dynamic = 0;
            for (let index2: Dynamic = 0; index2 < items.length; index2++) {
              let value662: Dynamic = value658[index2];
              if (!value662) continue;
              let value663: Dynamic = value660[index2] ?? {
                  width: value662.width,
                  height: value662.height,
                },
                {
                  x: value664,
                  y: value665,
                  w: value666,
                }: Dynamic = callback16(value663, index, value654),
                value667: Dynamic = (0, createElementEditId)(index2),
                value668: Dynamic = (0, droppedImageMarkup)({
                  src: value662.url,
                  mark: value667,
                  alt: (0, safeDroppedImageAltText)(
                    (0, droppedImageLabel)(items[index2], value653),
                    (0, droppedImageLabel)(
                      {
                        name: "",
                      },
                      value653,
                    ),
                  ),
                  natural: value663,
                  left: value664,
                  top: value665,
                  w: value666,
                });
              if ((await entry.insertHtml(value668, "page")).length === 0) {
                callback19(index2, "cancel");
                continue;
              }
              callback19(index2, "landed");
              (0, markDropPerformance)("insert");
              index++;
              callback21(entry, index2, value662.url, value667);
            }
            callback15();
            index > 0
              ? (0, announce)(
                  index +
                    (index > 1 ? " images " : " image ") +
                    value653 +
                    (length > 0
                      ? `; ${length} of the ${value653} files couldn't be used`
                      : ""),
                )
              : deps.value188(uiMessage("canvas.designCanvas.couldNotPlaceTheValue1", { value1: uiOperation(value653) }));
          })().finally((): Dynamic => callback15()),
        );
      }

/** 视频文件拖入画布或画板时运行：探测视频、生成封面、上传后作为画布视频或画板内视频元素插入，处理数量上限与失败提示。 */
function placeDroppedVideos(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value271: Dynamic; readonly value316: Dynamic; readonly value329: Dynamic; readonly value332: Dynamic; readonly value339: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value653?: Dynamic,
      extra?: Dynamic,
      detail?: Dynamic,
      argument?: Dynamic): Dynamic {
      let callback15: Dynamic = (): Dynamic => {};
      (0, trackEmbeddedWrite)(
        (async (): Promise<Dynamic> => {
          let value654: Dynamic = deps.value332(options, context, extra);
          if (value654 != null && value654.file === deps.value271.current) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingAddedThatArtboardIs"),
            );
            return;
          }
          if (extra != null && !value654) {
            deps.value188(
              uiMessage("canvas.designCanvas.couldNotPlaceTheValue13", { value1: uiOperation(value653) }),
            );
            return;
          }
          if (
            value654 &&
            deps.value177.current.get(value654.file)?.isReady() !== true
          ) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingAddedThatArtboardIsn"),
            );
            return;
          }
          if (value654 && deps.value177.current.get(value654.file)?.holdsDeck()) {
            deps.value188((0, CanvasWorkingStateHandler)("artboard"));
            return;
          }
          let values: Dynamic = new Set(),
            callback16: Dynamic = (input2?: Dynamic): Dynamic => {
              values.add(input2);
              deps.value188([...values].join(" "));
            },
            value655: Dynamic = input.filter((input2?: Dynamic): Dynamic => {
              let value662: Dynamic = (0, videoUploadRefusal)(input2);
              value662 != null &&
                callback16((0, videoUploadFailureMessage)(value662));
              return value662 == null;
            }),
            value656: Dynamic = value655.slice(
              0,
              CanvasWorkingStateConstant_5,
            );
          value655.length > value656.length &&
            callback16(
              uiMessage("canvas.designCanvas.addingTheFirstValue1Videos", { value1: String(CanvasWorkingStateConstant_5) }),
            );
          if (value656.length === 0) return;
          if (
            !value654 &&
            (deps.value73.current.annotations ?? []).length +
              deps.value329.current.length +
              value656.length >
              PlatformFileContentLimit_5
          ) {
            deps.value188(
              uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
                String(PlatformFileContentLimit_5) +
                ").",
            );
            return;
          }
          (0, markDropPerformance)("received");
          let current4: Dynamic = deps.value80.current,
            state: Dynamic = {
              sel: deps.selectionRef.current,
              tool: deps.value339.current,
              focus: deps.focusedFileRef.current,
            },
            value657: Dynamic = null,
            callback17: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic => {
              if (value654 && argument) {
                let value666: Dynamic = Math.round(
                    Math.min(input2.width, Math.max(48, argument.w * 0.6)),
                  ),
                  value667: Dynamic = Math.max(
                    1,
                    Math.round((value666 * input2.height) / input2.width),
                  ),
                  { left: value668, top: value669 }: Dynamic = (0,
                  fileDropPosition)(
                    argument,
                    detail + options2,
                    value666,
                    value667,
                  );
                return {
                  x: value668,
                  y: value669,
                  w: value666,
                  h: value667,
                };
              }
              if (value654)
                return (0, droppedImagePlacement)(
                  {
                    x: options,
                    y: context,
                  },
                  value654,
                  input2,
                  detail + options2,
                );
              let value662: Dynamic = (0, defaultPlacedImageSize)(
                  input2,
                  null,
                ),
                { w: value663, h: value664 }: Dynamic =
                  value662.h > PlatformFileContentLimit_6
                    ? {
                        w: Math.max(
                          PlatformFileContentConstant_20,
                          Math.round(
                            (value662.w *
                              PlatformFileContentLimit_6) /
                              value662.h,
                          ),
                        ),
                        h: PlatformFileContentLimit_6,
                      }
                    : value662,
                value665: Dynamic =
                  value657 ??
                  (detail > 0
                    ? Math.round(options) + detail * 1280
                    : Math.round(options - value663 / 2));
              value657 = value665 + value663 + 80;
              return {
                x: value665,
                y: Math.round(context - value664 / 2),
                w: value663,
                h: value664,
              };
            },
            callback18: Dynamic = (input2?: Dynamic): Dynamic =>
              value654 && argument
                ? {
                    ...input2,
                    x: input2.x - argument.sx,
                    y: input2.y - argument.sy,
                  }
                : input2,
            value658: Dynamic = value656.map(
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                (0, createDropGhost)({
                  file: value654?.file ?? null,
                  page: current4,
                  washless: true,
                  ...callback18(
                    callback17(
                      {
                        width: 320,
                        height: 180,
                      },
                      options2,
                    ),
                  ),
                }),
            );
          value657 = null;
          let values2: Dynamic = new Set(value658.keys()),
            callback19: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic => {
              values2.delete(input2) && value658[input2][options2]();
            };
          callback15 = (): Dynamic => {
            for (let value662 of [...values2] as Dynamic)
              callback19(value662, "cancel");
          };
          let value659: Dynamic = await Promise.all(
              value656.map(
                (input2?: Dynamic): Dynamic =>
                  (value654
                    ? (0, probeVideoFile)(input2)
                    : (0, captureVideoPoster)(input2)
                  ).catch((): Dynamic => "probe_timeout"),
              ),
            ),
            index: Dynamic = 0,
            value660: Dynamic = value659.map(
              (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                if (typeof input2 == "string") {
                  callback19(options2, "cancel");
                  callback16((0, videoUploadFailureMessage)(input2));
                  return null;
                }
                let value662: Dynamic = callback17(input2, index++);
                value658[options2].place(callback18(value662));
                return value662;
              },
            );
          value660.some(Boolean) &&
            (0, announce)(
              value660.filter(Boolean).length > 1
                ? uiMessage("canvas.designCanvas.uploadingVideos")
                : uiMessage("canvas.designCanvas.uploadingVideo"),
            );
          let index2: Dynamic = 0,
            value661: Dynamic = null,
            items: Dynamic = [];
          for (let index3: Dynamic = 0; index3 < value656.length; index3++) {
            let value662: Dynamic = value659[index3],
              value663: Dynamic = value660[index3];
            if (
              value662 == null ||
              typeof value662 == "string" ||
              value663 == null
            )
              continue;
            let value664: Dynamic = null;
            if (!value654) {
              let blob: Dynamic = value662.blob;
              value664 =
                blob === undefined
                  ? null
                  : await (0, uploadDesignFile)(
                      "appifact",
                      null,
                      new File(
                        [blob],
                        (0, videoFileTitle)(value656[index3]) +
                          ".jpg",
                        {
                          type: "image/jpeg",
                        },
                      ),
                    ).then(
                      (input2?: Dynamic): Dynamic =>
                        (0, PlatformFileContentTest_2)(input2.src),
                      (): Dynamic => null,
                    );
              if ((0, isEmbedFrozen)()) return;
              if (value664 === null) {
                callback19(index3, "cancel");
                callback16(
                  uiMessage("canvas.designCanvas.couldnTStoreAStill2", { value1: uiOperation(value653) }),
                );
                continue;
              }
            }
            let value665: Dynamic = await (0, uploadDesignVideo)(
              value656[index3],
              value662,
            );
            (0, markDropPerformance)("upload");
            if ((0, isEmbedFrozen)()) return;
            if ("refused" in value665) {
              callback19(index3, "cancel");
              callback16(value665.refused);
              if (value665.repeats) break;
              continue;
            }
            if (!value654) {
              let value667: Dynamic = (0, PlatformFileContentTest_3)(
                  value665.src,
                ),
                value668: Dynamic =
                  value664 === null || value667 === null
                    ? null
                    : deps.value316.current(
                        {
                          kind: "image",
                          x: value663.x,
                          y: value663.y,
                          w: value663.w,
                          h: value663.h,
                          src: value664,
                          video: value667,
                          alt: (0, PlatformFileContentSlice)(
                            (0, videoFileTitle)(value656[index3]),
                          ),
                          ...(current4 === "" ||
                          current4 === (deps.value73.current.pages?.[0]?.id ?? "")
                            ? {}
                            : {
                                page: current4,
                              }),
                        },
                        {
                          quiet: true,
                        },
                      );
              if (value668 === null) {
                callback19(index3, "cancel");
                (deps.value73.current.annotations ?? []).length <
                  PlatformFileContentLimit_5 &&
                  callback16(
                    uiMessage("canvas.designCanvas.couldnTAddTheValue1", { value1: uiOperation(value653) }),
                  );
                continue;
              }
              items.push(value668);
              (deps.selectionRef.current === state.sel ||
                deps.selectionRef.current === value661) &&
                deps.value339.current === state.tool &&
                deps.focusedFileRef.current === state.focus &&
                deps.value80.current === current4 &&
                ((value661 = (0, selectionFromBoards)({
                  files: emptyBoardSelection.files,
                  notes: new Set(items),
                })),
                (deps.selectionRef.current = value661),
                deps.value62(),
                deps.setSelection(value661));
              callback19(index3, "landed");
              index2++;
              continue;
            }
            let value666: Dynamic;
            for (
              let index4: Dynamic = 0;
              index4 < 120 &&
              !(0, isEmbedFrozen)() &&
              ((value666 =
                value654.file === deps.value271.current
                  ? undefined
                  : deps.value177.current.get(value654.file)),
              !value666);
              index4++
            )
              await new Promise(
                (input2?: Dynamic): Dynamic => setTimeout(input2, 500),
              );
            if (
              (value666
                ? await value666.insertHtml(
                    (0, positionedVideoHtml)(
                      value665.src,
                      value662,
                      {
                        left: value663.x,
                        top: value663.y,
                        w: value663.w,
                      },
                      (0, safeDroppedImageAltText)(
                        (0, videoFileTitle)(value656[index3]),
                        (0, videoFileTitle)({
                          name: "",
                        }),
                      ),
                    ),
                    "page",
                  )
                : []
              ).length === 0
            ) {
              callback19(index3, "cancel");
              callback16(
                value666
                  ? uiMessage("canvas.designCanvas.couldNotPlaceTheValue14", { value1: uiOperation(value653) })
                  : uiMessage("canvas.designCanvas.theVideoUploadedButIts"),
              );
              continue;
            }
            callback19(index3, "landed");
            (0, markDropPerformance)("insert");
            index2++;
          }
          index2 > 0 &&
            (0, announce)(
              index2 + (index2 > 1 ? " videos " : " video ") + value653,
            );
        })().finally((): Dynamic => callback15()),
      );
    }

/** 复制画板时运行：为每个画板写入新的 dc 文件与唯一标题，放到指定位置并选中，记录分析事件，失败时提示。 */
function duplicateArtboardFiles(deps: { readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value140: Dynamic; readonly value142: Dynamic; readonly value177: Dynamic; readonly value413: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        items: Dynamic = [],
        context?: Dynamic,
        value653: Dynamic = false): Dynamic {
        let value654: Dynamic =
          value653 && context !== undefined ? context : undefined;
        (async (): Promise<Dynamic> => {
          try {
            let value655: Dynamic = input.flatMap(
              (input2?: Dynamic): Dynamic => {
                let value658: Dynamic = deps.value73.current.artboards.find(
                  (input3?: Dynamic): Dynamic => input3.file === input2.file,
                );
                return value658
                  ? [
                      {
                        a: value658,
                        x: input2.x,
                        y: input2.y,
                        title: input2.title,
                      },
                    ]
                  : [];
              },
            );
            if (value655.length === 0) return;
            if (
              Object.keys(deps.doc.content().files).length + value655.length >
              PlatformFileContentFilesValue
            ) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTDuplicateTheCanvas") +
                  String(PlatformFileContentFilesValue) +
                  "-file limit; delete something first",
                "error",
              );
              return;
            }
            await Promise.all(
              value655.map(
                (input2?: Dynamic): Dynamic =>
                  deps.value177.current.get(input2.a.file)?.flushPending(),
              ),
            );
            let state: Dynamic = {
                ...deps.doc.content().files,
              },
              items2: Dynamic = [];
            for (let {
              a: value658,
              x: value659,
              y: value660,
              title: value661,
            } of value655 as Dynamic) {
              let value662: Dynamic =
                (await (0, getKvClient)().get(
                  (0, PlatformFileContentHandler_4)(value658.file),
                )) ?? state[value658.file];
              if (
                typeof value662 != "string" ||
                (0, isLoadingArtboardHtml)(value662)
              ) {
                let value665: Dynamic =
                  value655.length === 1 ? uiMessage("canvas.designCanvas.theArtboard") : uiMessage("canvas.designCanvas.anArtboard");
                deps.showToast(
                  typeof value662 == "string"
                    ? uiMessage("canvas.designCanvas.couldnTDuplicate") +
                        value665 +
                        " is still loading"
                    : uiMessage("canvas.designCanvas.couldnTDuplicate") +
                        value665 +
                        " has no source",
                  "error",
                );
                return;
              }
              let value663: Dynamic = value658.file.replace(
                  /\.dc\.html$/,
                  "",
                ),
                value664: Dynamic = (0, uniqueArtboardFile)(
                  state,
                  value663,
                  deps.supportsLoadState,
                );
              state[value664] = value662;
              let state2: Dynamic = {
                file: value664,
                x: Math.round(value659),
                y: Math.round(value660),
                w: value658.w,
                h: value658.h,
                title:
                  (0, PlatformFileContentSlice)(value661) ??
                  (0, duplicateArtboardTitle)(
                    value658.title ?? value663,
                    [
                      ...deps.value87.current.artboards,
                      ...items2.map(
                        (input2?: Dynamic): Dynamic => input2.spec,
                      ),
                    ],
                  ),
                ...(0, artboardAppearanceProperties)(value658),
                ...(value658.page
                  ? {
                      page: value658.page,
                    }
                  : {}),
              };
              items2.push({
                file: value664,
                src: value662,
                spec: state2,
              });
            }
            let values: Dynamic = new Set();
            try {
              for (let value658 of items2 as Dynamic) {
                await (0, getKvClient)().set(
                  (0, PlatformFileContentHandler_4)(value658.file),
                  value658.src,
                );
                values.add(value658.file);
              }
            } catch (value658: Dynamic) {
              for (let value659 of values as Dynamic)
                await (0, getKvClient)()
                  .delete((0, PlatformFileContentHandler_4)(value659))
                  .catch((): Dynamic => false);
              throw value658;
            }
            let value656: Dynamic =
                (deps.value73.current.annotations ?? []).length + items.length <=
                PlatformFileContentLimit_5,
              value657: Dynamic = value656 ? deps.callback9(items) : [];
            !value656 &&
              items.length > 0 &&
              deps.showToast(
                uiMessage("canvas.designCanvas.theArtboardsWereCopiedThe") +
                  String(PlatformFileContentLimit_5) +
                  ").",
                "error",
              );
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
                  (input2?: Dynamic): Dynamic => !values.has(input2.file),
                ),
                ...items2.map((input2?: Dynamic): Dynamic => input2.spec),
              ],
              ...(value657.length > 0
                ? {
                    annotations: [
                      ...(deps.value73.current.annotations ?? []),
                      ...value657,
                    ],
                  }
                : {}),
            });
            deps.value413(
              {
                kind: "add",
                entries: items2,
                ...(value657.length > 0
                  ? {
                      anns: [...value657],
                    }
                  : {}),
              },
              values,
              undefined,
              context,
            );
            value654 !== undefined
              ? deps.value142.current.set(value654, {
                  files: values,
                  notes: new Set(
                    value657.map((input2?: Dynamic): Dynamic => input2.id),
                  ),
                })
              : deps.setSelection(
                  (0, selectionFromBoards)({
                    files: values,
                    notes: new Set(
                      value657.map((input2?: Dynamic): Dynamic => input2.id),
                    ),
                  }),
                );
            values.size > 0 &&
              (0, frameAnalyticsReporter)(
                designAnalyticsEvents.artboardInserted,
              );
          } catch (value655: Dynamic) {
            deps.showToast(uiMessage("canvas.designCanvas.couldnTDuplicate2") + String(value655), "error");
          } finally {
            value654 !== undefined &&
              !deps.value142.current.has(value654) &&
              deps.value142.current.set(value654, {
                files: new Set(),
                notes: new Set(),
              });
            context !== undefined && deps.value140.current.get(context)?.();
          }
        })();
      }

/** onDuplicateObjects 的实现（Alt 拖动或复制快捷键）：在给定位置复制画板与画布说明，并更新选择。 */
function duplicateBoardsAndNotes(deps: { readonly callback9: Dynamic; readonly setSelection: Dynamic; readonly value140: Dynamic; readonly value142: Dynamic; readonly value188: Dynamic; readonly value318: Dynamic; readonly value342: Dynamic; readonly value396: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, items?: Dynamic,
        items2?: Dynamic,
        context?: Dynamic,
        value653: Dynamic = false): Dynamic {
        if (items.length === 0 && items2.length === 1) {
          let value659: Dynamic = items2[0];
          return deps.value318(
            value659.id,
            value659.x,
            value659.y,
            context,
            value653,
          );
        }
        let value654: Dynamic =
            value653 && context !== undefined ? context : undefined,
          value655: Dynamic = deps.value73.current.annotations ?? [],
          value656: Dynamic = items2.flatMap((input?: Dynamic): Dynamic => {
            let value659: Dynamic = value655.find(
              (input2?: Dynamic): Dynamic => input2.id === input.id,
            );
            return value659
              ? [
                  {
                    src: value659,
                    x: input.x,
                    y: input.y,
                  },
                ]
              : [];
          }),
          callback15: Dynamic = (): Dynamic => (
            value654 !== undefined &&
              deps.value142.current.set(value654, {
                files: new Set(),
                notes: new Set(),
              }),
            context !== undefined && deps.value140.current.get(context)?.(),
            false
          );
        if (
          value656.length > 0 &&
          value655.length + value656.length >
            PlatformFileContentLimit_5
        ) {
          deps.value188(
            uiMessage("canvas.designCanvas.couldnTCopyThisCanvas") +
              String(PlatformFileContentLimit_5) +
              ").",
          );
          return callback15();
        }
        let value657: Dynamic = items.filter(
          (input?: Dynamic): Dynamic =>
            deps.value73.current.artboards.some(
              (input2?: Dynamic): Dynamic => input2.file === input.file,
            ),
        );
        if (value657.length > 0) {
          deps.value342(value657, value656, context, value653);
          return true;
        }
        let value658: Dynamic = deps.callback9(value656);
        return value658.length === 0
          ? callback15()
          : (deps.value396.current(
              {
                kind: "add",
                entries: [],
                anns: value658,
              },
              new Set(),
              undefined,
              context,
            ),
            deps.value98({
              ...deps.value73.current,
              annotations: [...value655, ...value658],
            }),
            value654 !== undefined
              ? deps.value142.current.set(value654, {
                  files: new Set(),
                  notes: new Set(
                    value658.map((input?: Dynamic): Dynamic => input.id),
                  ),
                })
              : (deps.value62(),
                deps.setSelection(
                  (0, selectionFromBoards)({
                    files: emptyCanvasSelectionFiles,
                    notes: new Set(
                      value658.map((input?: Dynamic): Dynamic => input.id),
                    ),
                  }),
                )),
            true);
      }

/** 视口、页面、选择或错误变化时运行：汇总可见画板、选中元素的文字摘要与画板错误，通过上下文发布器上报给外壳。 */
function reportDesignContextSnapshot(deps: { readonly flag: Dynamic; readonly selection: Dynamic; readonly value103: Dynamic; readonly value120: Dynamic; readonly value168: Dynamic; readonly value172: Dynamic; readonly value177: Dynamic; readonly value266: Dynamic; readonly value347: Dynamic; readonly value356: Dynamic; readonly value365: Dynamic; readonly value375: Dynamic; readonly value79: Dynamic; readonly value81: Dynamic; readonly value86: Dynamic }): Dynamic {
    let { w: value653, h: value654, top: value655 }: Dynamic = deps.value120(),
      state: Dynamic = {
        x: deps.value103.x,
        y: deps.value103.y + value655 / deps.value103.scale,
        w: value653 / deps.value103.scale,
        h: (value654 - value655) / deps.value103.scale,
      },
      value656: Dynamic = deps.value347
        ? [deps.value347.file]
        : deps.value86.artboards
            .filter(
              (input?: Dynamic): Dynamic =>
                (0, distanceBetweenRects)(input, state) === 0,
            )
            .map((input?: Dynamic): Dynamic => input.file),
      items: Dynamic = [],
      items2: Dynamic = [],
      value657: Dynamic = !deps.value347 || (deps.flag && deps.value356);
    if (deps.selection.primary != null && value657) {
      let value662: Dynamic = [...deps.selection.elements.keys()].filter(
        (input?: Dynamic): Dynamic => input !== deps.selection.primary,
      );
      value662.push(deps.selection.primary);
      for (let value663 of value662 as Dynamic) {
        let value664: Dynamic = deps.selection.elements.get(value663)?.tids ?? [],
          value665: Dynamic = (0, encodeArtboardSelectionPath)(
            value663,
          );
        if (value665 !== null)
          for (let value666 of (deps.value177.current
            .get(value663)
            ?.viewEntries(value664) ?? []) as Dynamic) {
            let value667: Dynamic = value665 + "#" + value666.path;
            encodedElementPathPattern.test(value667) &&
              (items.push(value667),
              items2.push({
                id: value667,
                kind: value666.kind,
                words: value666.words,
              }));
          }
      }
    }
    let value658: Dynamic = value657 ? [...deps.value168, ...deps.value172] : [],
      current4: Dynamic = deps.value365.current;
    if (current4 === null) return;
    let state2: Dynamic = {
        mode: deps.value347 ? "focused" : "canvas",
        page: deps.value79 === "" ? null : deps.value79,
        pageName: {
          text: deps.value79 === "" ? "" : deps.value81,
        },
        visibleArtboards: (0, normalizeSelectedArtboardPaths)(
          value656,
        ),
        selectedArtboards: (0, normalizeSelectedArtboardPaths)(
          value658,
        ),
        ...(0, getEmbeddedPresence)(),
        dirty: deps.value375,
        selected: items.slice(-20),
        selection: items2.slice(-5).map(
          (source?: Dynamic): Dynamic => ({
            id: source.id,
            kind: source.kind,
            label: source.words(artboardTextSnapshotLimit),
          }),
        ),
      },
      value659: Dynamic = deps.value266.flatMap((input?: Dynamic): Dynamic => {
        let value662: Dynamic = (0, encodeArtboardSelectionPath)(
          input.file,
        );
        return value662 === null
          ? []
          : [
              {
                name: value662,
                first: input.messages[0] ?? "",
              },
            ];
      }),
      value660: Dynamic = value659[0]?.first ?? "",
      value661: Dynamic = (0, serializeArtboardErrorContext)(
        value659.map((input?: Dynamic): Dynamic => input.name),
        value660,
        state2,
      );
    current4.report(
      value661.length === 0
        ? state2
        : {
            ...state2,
            erroredArtboards: value661,
            firstError: {
              text: value660,
            },
          },
    );
  }

/** 全屏播放画板时注册：Escape 退出播放，方向键/翻页键或预览发来的 __om_step 切换上一个/下一个画板。 */
function subscribePlayModeKeys(deps: { readonly flag: Dynamic; readonly value177: Dynamic; readonly value220: Dynamic; readonly value347: Dynamic; readonly value389: Dynamic; readonly value391: Dynamic; readonly value393: Dynamic; readonly value87: Dynamic }): Dynamic {
    if (deps.value347 == null || deps.flag) return;
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          if ((0, hasBlockingEditorOverlay)() || deps.value220) return;
          event.preventDefault();
          deps.value389();
          return;
        }
        let value653: Dynamic =
          event.key === "ArrowRight" || event.key === "PageDown"
            ? 1
            : event.key === "ArrowLeft" || event.key === "PageUp"
              ? -1
              : 0;
        value653 === 0 ||
          event.repeat ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.shiftKey ||
          (0, hasBlockingEditorOverlay)() ||
          (0, isEditingInputTarget)(event.target) ||
          (0, isInteractivePreviewTarget)(event.target) ||
          (event.preventDefault(), deps.value391(value653));
      },
      callback16: Dynamic = (dataset?: Dynamic): Dynamic => {
        let data: Dynamic = dataset.data;
        if (!(!data || typeof data != "object")) {
          if (data.__om_escape === 1) {
            [...deps.value177.current.values()].some(
              (input?: Dynamic): Dynamic =>
                dataset.source !== null &&
                input.webviewRef.current?.contentWindow === dataset.source,
            ) && deps.value389();
            return;
          }
          if (data.__om_step === 1 || data.__om_step === -1) {
            if (
              navigator.userActivation?.isActive !== true ||
              (0, hasBlockingEditorOverlay)()
            )
              return;
            let activeElement: Dynamic = (document as Dynamic).activeElement,
              value653: Dynamic = [...deps.value177.current.entries()].find(
                ([, input]: Dynamic): Dynamic =>
                  input.webviewRef.current === activeElement &&
                  (0, isPreviewMessage)(
                    dataset,
                    input.webviewRef.current,
                  ),
              );
            if (
              !value653 ||
              deps.value87.current.artboards.find(
                (input?: Dynamic): Dynamic => input.file === value653[0],
              )?.is_interactive === true
            )
              return;
            parallelCanvasCaptureSemaphore.take() &&
              deps.value391(data.__om_step) &&
              (deps.value393.current = data.__om_step);
          }
        }
      };
    (window as Dynamic).addEventListener("keydown", callback15);
    (window as Dynamic).addEventListener("message", callback16);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", callback15);
      (window as Dynamic).removeEventListener("message", callback16);
    };
  }

/** 监听预览 iframe 发出的 __om_open 消息：在用户手势下把链接指向的画板打开为全屏播放，必要时切换页面。 */
function subscribePreviewOpenMessages(deps: { readonly setSelection: Dynamic; readonly value105: Dynamic; readonly value177: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value271: Dynamic; readonly value274: Dynamic; readonly value285: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value382: Dynamic; readonly value384: Dynamic; readonly value393: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }): Dynamic {
    let callback15: Dynamic = (dataset?: Dynamic): Dynamic => {
      let data: Dynamic = dataset.data;
      if (
        !data ||
        typeof data != "object" ||
        typeof data.__om_open != "string" ||
        data.__om_open.length > 1024
      )
        return;
      let value653: Dynamic = (0, stripPreviewProjectRoot)(
        data.__om_open,
        dataset.source,
      );
      if (navigator.userActivation?.isActive !== true || deps.value285.current)
        return;
      let value654: Dynamic = [...deps.value177.current.entries()].find(
        ([, input]: Dynamic): Dynamic =>
          (0, isPreviewMessage)(dataset, input.webviewRef.current),
      );
      if (!value654 || value654[0] === value653) return;
      let value655: Dynamic =
        !deps.value345.current && value654[0] === deps.value271.current;
      if (
        (deps.value224.current || deps.value225.current) &&
        !deps.value345.current &&
        !value655
      )
        return;
      let current4: Dynamic = deps.value73.current,
        value656: Dynamic = value653,
        value657: Dynamic = current4.artboards.find(
          (input?: Dynamic): Dynamic => input.file === value656,
        );
      if (
        !value657 ||
        value657.file === deps.value346.current ||
        !singleCanvasCaptureSemaphore.take()
      )
        return;
      let value658: Dynamic = (0, designPageId)(
          value657,
          current4.pages,
        ),
        value659: Dynamic = value658 !== deps.value80.current;
      if (value655) {
        if (value657.frameless) return;
        deps.value384(value657.file, value659 ? value658 : undefined);
        value659 || deps.value382.current(value657.file);
        return;
      }
      let flag2: Dynamic = false;
      value659
        ? (deps.value298(value658, flag2 ? value657.file : undefined),
          (deps.value291.current = false))
        : flag2 &&
          (deps.value62(),
          deps.setSelection(emptyCanvasSelection),
          deps.value274.current(value657.file));
      !flag2 &&
        value654[1].webviewRef.current ===
          (document as Dynamic).activeElement &&
        (deps.value393.current = 1);
      deps.value348(
        (input?: Dynamic): Dynamic => ({
          file: value657.file,
          prev:
            input?.prev ??
            (value659
              ? ((0, recallCanvasView)(value658) ??
                defaultCanvasCamera)
              : deps.value105.get()),
          fit: artboardIsNotExpandedFill(value657),
        }),
      );
    };
    (window as Dynamic).addEventListener("message", callback15);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("message", callback15);
  }

/** 在画板属性中输入宽高时运行：按上下限钳制尺寸，写回清单并播报调整结果。 */
function resizeArtboardFromInput(deps: { readonly value396: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        let value653: Dynamic = deps.value73.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (
          !value653 ||
          !Number.isFinite(options.w ?? 0) ||
          !Number.isFinite(options.h ?? 0)
        )
          return;
        let callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic =>
            input2 === undefined
              ? options2
              : Math.min(
                  PlatformFileContentLimit_6,
                  Math.max(
                    PlatformFileContentConstant_16,
                    Math.round(input2),
                  ),
                ),
          value654: Dynamic = callback15(options.w, value653.w),
          value655: Dynamic = callback15(options.h, value653.h),
          value656: Dynamic = deps.value73.current.artboards.map(
            (input2?: Dynamic): Dynamic =>
              input2.file === input
                ? {
                    ...input2,
                    w: value654,
                    h: value655,
                  }
                : input2,
          );
        if (!context) {
          deps.value68(
            (0, replaceDesignArtboards)(deps.value73.current, value656),
          );
          return;
        }
        let value657: Dynamic =
          (deps.value70.current ?? deps.value73.current).artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ) ?? value653;
        if (
          Math.round(value657.w) === value654 &&
          Math.round(value657.h) === value655
        ) {
          (value653.w !== value654 || value653.h !== value655) &&
            deps.value68(
              (0, replaceDesignArtboards)(deps.value73.current, value656),
            );
          return;
        }
        deps.value396.current(
          {
            kind: "resize",
            file: input,
            from: {
              x: value653.x,
              y: value653.y,
              w: value657.w,
              h: value657.h,
            },
            to: {
              x: value653.x,
              y: value653.y,
              w: value654,
              h: value655,
            },
          },
          new Set(),
        );
        deps.value98({
          artboards: value656,
        });
        let value658: Dynamic = (0, artboardResizeAnnouncement)(
          value657,
          {
            w: value654,
            h: value655,
          },
        );
        value658 != null && (0, announce)(value658);
      }

/** 画布操作完成后运行：把操作推入撤销栈（最多 50 条），记录各画板的会话历史深度并清空重做。 */
function recordCanvasHistoryStep(deps: { readonly value140: Dynamic; readonly value141: Dynamic; readonly value4: Dynamic; readonly value405: Dynamic; readonly value408: Dynamic; readonly value410: Dynamic; readonly value412: Dynamic; readonly value440: Dynamic; readonly value67: Dynamic }, source?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic =
          value653 !== undefined &&
          (source.kind === "add" || source.kind === "ann-add")
            ? deps.value141.current.get(value653)
            : undefined;
        if (value654) {
          value654(source);
          deps.value140.current.get(value653)?.();
          deps.value140.current.delete(value653);
          return;
        }
        deps.value412();
        deps.value4.current !== null &&
          (0, updateTextEditHistoryCounts)(
            deps.value4.current,
            "clear-redo",
          );
        let value655: Dynamic = deps.value67.artboards
          .filter((input?: Dynamic): Dynamic => !options.has(input.file))
          .map(
            (input?: Dynamic): Dynamic => [
              input.file,
              deps.value440.current.get(input.file) ?? 0,
            ],
          );
        if (source.kind === "add")
          for (let value656 of new Set([
            ...source.entries.map((input?: Dynamic): Dynamic => input.file),
            ...(context ?? []),
          ]) as Dynamic)
            value655.push([value656, deps.value440.current.get(value656) ?? 0]);
        deps.value405.current.length >= 50 && (deps.value410.current += 1);
        deps.value405.current = [
          ...deps.value405.current,
          {
            op: source,
            at: Date.now(),
            depths: value655,
            ...(value653 !== undefined
              ? {
                  bound: value653,
                }
              : {}),
            ...(deps.value4.current !== null &&
            (0, CanvasWorkingStateHandler_3)(source.kind)
              ? {
                  duringTextEdit: deps.value4.current,
                }
              : {}),
          },
        ].slice(-50);
        deps.value408((input?: Dynamic): Dynamic => input + 1);
        value653 !== undefined &&
          (deps.value140.current.get(value653)?.(),
          deps.value140.current.delete(value653));
      }

/** 撤销或重做某个画布步骤时运行：按步骤类型恢复 Tweaks、清单变化、页面增删或画板文件增删。 */
async function applyCanvasHistoryStep(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value298: Dynamic; readonly value70: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, source?: Dynamic, options?: Dynamic): Promise<Dynamic> {
        let current4: Dynamic = deps.value70.current,
          callback15: Dynamic = (
            input?: Dynamic,
            options2: Dynamic = current4,
          ): Dynamic => deps.value98(input, options2);
        if (source.kind === "tweak") {
          let entry: Dynamic = deps.value177.current.get(source.file);
          if (!entry) return false;
          entry.setTweaks(options === "undo" ? source.from : source.to);
          return;
        }
        if (source.kind !== "add" && source.kind !== "delete") {
          let value658: Dynamic = (0, applyCanvasManifestHistory)(
            current4,
            source,
            options,
          );
          if (value658 === "nothing" || value658 === "full") return value658;
          if (source.kind === "page-add" && options === "undo") {
            let value659: Dynamic = (0,
            repairCanvasLaunchAfterDeletion)(
              current4,
              emptyCanvasSelectionFiles,
              source.page.id,
            );
            value659 !== undefined && (source.launch = value659);
          }
          if (source.kind === "page-add" && options === "redo") {
            let value659: Dynamic = (0,
            compatibleRestoredCanvasLaunch)(
              source.launch,
              current4.launch,
            );
            callback15(
              value659 !== undefined
                ? {
                    ...value658,
                    launch: value659,
                  }
                : value658,
            );
            delete source.launch;
            return;
          }
          callback15(value658);
          return;
        }
        let value653: Dynamic =
            source.kind === "delete"
              ? options === "undo"
              : options === "redo",
          callback16: Dynamic = (input?: Dynamic): Dynamic => {
            if (source.kind !== "add" || !source.moves) return input;
            let entries: Dynamic = new Map(
              source.moves.map(
                (input2?: Dynamic): Dynamic => [
                  input2.file,
                  value653 ? input2.to : input2.from,
                ],
              ),
            );
            return input.map((input2?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(input2.file);
              return entry
                ? {
                    ...input2,
                    x: entry.x,
                    y: entry.y,
                  }
                : input2;
            });
          },
          callback17: Dynamic = (input?: Dynamic): Dynamic => {
            if (source.kind !== "add" || !source.annMoves) return input;
            let entries: Dynamic = new Map(
              source.annMoves.map(
                (input2?: Dynamic): Dynamic => [
                  input2.id,
                  value653 ? input2.to : input2.from,
                ],
              ),
            );
            return input.map((input2?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(input2.id);
              return entry
                ? (0, moveAnnotation)(input2, entry.x, entry.y)
                : input2;
            });
          },
          value654: Dynamic =
            source.kind === "add" &&
            ((source.moves?.length ?? 0) > 0 ||
              (source.annMoves?.length ?? 0) > 0);
        if (
          !value653 &&
          source.kind === "delete" &&
          source.page !== undefined
        ) {
          let page: Dynamic = source.page;
          if (
            !(current4.pages ?? []).some(
              (input?: Dynamic): Dynamic => input.id !== page.spec.id,
            )
          )
            throw new Error("it is the only page left.");
          let value658: Dynamic = (0, remainingCanvasPageObjects)(
            current4,
            page.spec.id,
            new Set(
              source.entries.map((input?: Dynamic): Dynamic => input.file),
            ),
            new Set(
              (source.anns ?? []).map(
                (input?: Dynamic): Dynamic => input.spec.id,
              ),
            ),
          );
          for (let value659 of value658.artboards as Dynamic) {
            await deps.value177.current.get(value659.file)?.flushPending();
            let value660: Dynamic =
              (await (0, getKvClient)().get(
                (0, PlatformFileContentHandler_4)(value659.file),
              )) ??
              deps.doc.content().files[value659.file] ??
              "";
            source.entries.push({
              file: value659.file,
              src: value660,
              spec: value659,
              index: current4.artboards.findIndex(
                (input?: Dynamic): Dynamic => input.file === value659.file,
              ),
            });
          }
          value658.notes.length > 0 &&
            (source.anns = [
              ...(source.anns ?? []),
              ...(current4.annotations ?? []).flatMap(
                (input?: Dynamic, options2?: Dynamic): Dynamic =>
                  value658.notes.includes(input.id)
                    ? [
                        {
                          spec: input,
                          index: options2,
                        },
                      ]
                    : [],
              ),
            ]);
        }
        if (!value653) {
          let values: Dynamic = new Set(
            source.entries.map((input?: Dynamic): Dynamic => input.file),
          );
          current4.cover !== undefined &&
            values.has(current4.cover) &&
            (source.cover = current4.cover);
          let value658: Dynamic = (0,
          repairCanvasLaunchAfterDeletion)(
            current4,
            values,
            source.kind === "delete" ? source.page?.spec.id : undefined,
          );
          value658 !== undefined && (source.launch = value658);
        }
        let items: Dynamic = [...(current4.annotations ?? [])],
          value655: Dynamic =
            source.kind === "delete"
              ? (source.anns ?? [])
              : (source.anns ?? []).map(
                  (input?: Dynamic, options2?: Dynamic): Dynamic => ({
                    spec: input,
                    index: items.length + options2,
                  }),
                ),
          value656: Dynamic = value653
            ? value655.filter(
                (input?: Dynamic): Dynamic =>
                  !items.some(
                    (input2?: Dynamic): Dynamic =>
                      input2.id === input.spec.id,
                  ),
              ).length
            : 0;
        if (
          value656 > 0 &&
          items.length + value656 > PlatformFileContentLimit_5
        )
          return "full";
        if (
          value653 &&
          source.kind === "delete" &&
          source.page !== undefined
        ) {
          let page: Dynamic = source.page,
            value658: Dynamic = (current4.pages ?? []).some(
              (input?: Dynamic): Dynamic => input.id === page.spec.id,
            );
          if (!(value658 && page.relisted === true)) {
            if (
              (current4.pages ?? []).length >=
              PlatformFileContentLimit_3
            )
              throw new Error(
                "this canvas is at its page limit (" +
                  String(PlatformFileContentLimit_3) +
                  ").",
              );
            value658 &&
              (0, retargetCanvasPageHistory)(
                source,
                (0, createPageId)(current4.pages ?? [], true),
              );
          }
        }
        let value657: Dynamic =
          source.kind === "delete" ? source.page : undefined;
        if (value653) {
          let value658: Dynamic =
            value657 !== undefined && value657.index === 0;
          value658 &&
            items.splice(
              0,
              items.length,
              ...(0, assignImplicitFirstCanvasPage)(
                items,
                current4.pages,
              ),
            );
          let value659: Dynamic = value658
            ? (0, assignImplicitFirstCanvasPage)(
                current4.artboards,
                current4.pages,
              )
            : [...current4.artboards];
          if (source.kind === "delete")
            for (let value661 of [...source.entries].sort(
              (input?: Dynamic, options2?: Dynamic): Dynamic =>
                input.index - options2.index,
            ) as Dynamic)
              value659.some(
                (input?: Dynamic): Dynamic => input.file === value661.file,
              ) ||
                value659.splice(
                  Math.min(value661.index, value659.length),
                  0,
                  value661.spec,
                );
          else
            value659.push(
              ...source.entries.map((input?: Dynamic): Dynamic => input.spec),
            );
          for (let value661 of [...value655].sort(
            (input?: Dynamic, options2?: Dynamic): Dynamic =>
              input.index - options2.index,
          ) as Dynamic)
            items.some(
              (input?: Dynamic): Dynamic => input.id === value661.spec.id,
            ) ||
              items.splice(
                Math.min(value661.index, items.length),
                0,
                value661.spec,
              );
          let value660: Dynamic = (0, compatibleRestoredCanvasLaunch)(
            source.launch,
            current4.launch,
          );
          callback15({
            ...current4,
            artboards: callback16(value659),
            ...(value655.length > 0 || value654 || value658
              ? {
                  annotations: callback17(items),
                }
              : {}),
            ...(source.cover !== undefined &&
            (source.kind === "delete" || current4.cover === undefined)
              ? {
                  cover: source.cover,
                }
              : {}),
            ...(value657 !== undefined
              ? {
                  pages: (0, restoreCanvasPageSpec)(
                    current4.pages,
                    value657,
                  ),
                }
              : {}),
            ...(value660 !== undefined
              ? {
                  launch: value660,
                }
              : {}),
          });
          value657 !== undefined && (value657.relisted = true);
          if (source.kind === "add")
            for (let value661 of (source.files ?? []) as Dynamic)
              (deps.doc.content().files[value661.path] ?? value661.src) ===
                value661.src &&
                (await (0, getKvClient)().set(
                  (0, PlatformFileContentHandler_4)(value661.path),
                  value661.src,
                ));
          for (let value661 of source.entries as Dynamic)
            await (0, getKvClient)().set(
              (0, PlatformFileContentHandler_4)(value661.file),
              value661.src,
            );
          value657 !== undefined && deps.value298(value657.spec.id);
          delete source.cover;
          delete source.launch;
        } else {
          for (let value660 of source.entries as Dynamic) {
            await deps.value177.current.get(value660.file)?.flushPending();
            await (0, getKvClient)().delete(
              (0, PlatformFileContentHandler_4)(value660.file),
            );
          }
          if (source.kind === "add")
            for (let value660 of (source.files ?? []) as Dynamic)
              deps.doc.content().files[value660.path] === value660.src &&
                (await (0, getKvClient)().delete(
                  (0, PlatformFileContentHandler_4)(value660.path),
                ));
          let current5: Dynamic = deps.value70.current,
            value658: Dynamic =
              value657 !== undefined
                ? (current5.pages ?? []).filter(
                    (input?: Dynamic): Dynamic =>
                      input.id !== value657.spec.id,
                  )
                : [],
            value659: Dynamic =
              value657 !== undefined &&
              value658.length > 0 &&
              deps.value80.current === value657.spec.id
                ? ((0, neighboringCanvasPageId)(
                    current5.pages ?? [],
                    value657.spec.id,
                  ) ?? value658[0].id)
                : undefined;
          callback15(
            {
              ...current5,
              artboards: callback16(
                current5.artboards.filter(
                  (input?: Dynamic): Dynamic =>
                    !source.entries.some(
                      (input2?: Dynamic): Dynamic =>
                        input2.file === input.file,
                    ),
                ),
              ),
              ...(value655.length > 0 || value654
                ? {
                    annotations: callback17(
                      (current5.annotations ?? []).filter(
                        (input?: Dynamic): Dynamic =>
                          !value655.some(
                            (input2?: Dynamic): Dynamic =>
                              input2.spec.id === input.id,
                          ),
                      ),
                    ),
                  }
                : {}),
              ...(value658.length > 0
                ? {
                    pages: value658,
                  }
                : {}),
            },
            current5,
          );
          value657 !== undefined &&
            (value657.relisted = value658.length === 0);
          value659 !== undefined && deps.value298(value659);
        }
      }

/** 方向键微移选中的画板或画布说明时运行：更新位置，并把连续微移合并为同一条移动历史。 */
function nudgeBoardsWithHistory(deps: { readonly value405: Dynamic; readonly value412: Dynamic; readonly value413: Dynamic; readonly value415: Dynamic; readonly value440: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic = (0, nudgeCanvasObjects)(
          deps.value73.current,
          input,
          options,
          context,
        );
        if (!value654) return false;
        let value655: Dynamic = (0, boardSelectionKey)(input),
          value656: Dynamic = deps.value405.current[deps.value405.current.length - 1],
          callback15: Dynamic = (): Dynamic =>
            value656 != null &&
            value656.depths.every(([input2, input3]: Dynamic): Dynamic => {
              let value657: Dynamic = deps.value440.current.get(input2) ?? 0;
              return value653.has(input2)
                ? value657 === value653.get(input2)
                : value657 === (input3 ?? 0);
            });
        if (
          value656?.op.kind === "move" &&
          value656.nudgeKey === value655 &&
          !value656.sealed &&
          Date.now() - value656.at < ModelModelStateLimit &&
          (deps.value415("undo") === value656 || callback15()) &&
          value654.moves.every(
            (input2?: Dynamic): Dynamic =>
              value656.op.kind === "move" &&
              value656.op.moves.some(
                (input3?: Dynamic): Dynamic => input3.file === input2.file,
              ),
          ) &&
          value654.anns.every(
            (input2?: Dynamic): Dynamic =>
              value656.op.kind === "move" &&
              (value656.op.anns ?? []).some(
                (input3?: Dynamic): Dynamic => input3.id === input2.id,
              ),
          )
        ) {
          let entries: Dynamic = new Map(
              value654.moves.map(
                (input2?: Dynamic): Dynamic => [input2.file, input2.to],
              ),
            ),
            entries2: Dynamic = new Map(
              value654.anns.map(
                (input2?: Dynamic): Dynamic => [input2.id, input2.to],
              ),
            );
          value656.op = {
            ...value656.op,
            moves: value656.op.moves.map(
              (input2?: Dynamic): Dynamic => ({
                ...input2,
                to: entries.get(input2.file) ?? input2.to,
              }),
            ),
            ...(value656.op.anns
              ? {
                  anns: value656.op.anns.map(
                    (input2?: Dynamic): Dynamic => ({
                      ...input2,
                      to: entries2.get(input2.id) ?? input2.to,
                    }),
                  ),
                }
              : {}),
          };
          value656.at = Date.now();
          deps.value412();
        } else {
          deps.value413(
            {
              kind: "move",
              moves: value654.moves,
              ...(value654.anns.length > 0
                ? {
                    anns: value654.anns,
                  }
                : {}),
            },
            new Set(),
          );
          let value657: Dynamic =
            deps.value405.current[deps.value405.current.length - 1];
          value657 && (value657.nudgeKey = value655);
        }
        deps.value98(value654.manifest);
        return true;
      }

/** 翻转选中的画布图形时运行：计算翻转结果，写回清单并记录 transform 历史，返回已翻转与被拒的项目。 */
function flipAnnotationsWithHistory(deps: { readonly value140: Dynamic; readonly value224: Dynamic; readonly value413: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        let current4: Dynamic = deps.value73.current,
          value653: Dynamic = deps.value224.current && true,
          { flips: value654, refused: value655 }: Dynamic = value653
            ? (0, flipAnnotations)(
                (current4.annotations ?? []).filter(
                  (input2?: Dynamic): Dynamic => input.has(input2.id),
                ),
                options,
              )
            : {
                flips: [],
                refused: undefined,
              };
        if (value654.length === 0) {
          context !== undefined && deps.value140.current.get(context)?.();
          return value655 === undefined
            ? {
                flipped: false,
              }
            : {
                flipped: false,
                refused: value655,
              };
        }
        let entries: Dynamic = new Map(
          value654.map((input2?: Dynamic): Dynamic => [input2.id, input2.to]),
        );
        deps.value413(
          {
            kind: "transform",
            get label() { return uiMessage("canvas.designCanvas.flip"); },
            boards: [],
            anns: value654,
          },
          new Set(),
          undefined,
          context,
        );
        deps.value98({
          ...current4,
          annotations: (current4.annotations ?? []).map(
            (input2?: Dynamic): Dynamic => {
              let entry: Dynamic = entries.get(input2.id);
              return entry
                ? {
                    ...input2,
                    ...entry,
                  }
                : input2;
            },
          ),
        });
        return value655 === undefined
          ? {
              flipped: true,
            }
          : {
              flipped: true,
              refused: value655,
            };
      }

/** 在属性面板修改画布图形或说明的位置与尺寸时运行：校验数值、按图形类型换算几何并写回清单，记录移动或缩放历史。 */
function setAnnotationBox(deps: { readonly value396: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic = deps.value73.current.annotations ?? [],
          value655: Dynamic = value654.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (
          !value655 ||
          Object.values(options).some(
            (input2?: Dynamic): Dynamic =>
              input2 != null && !Number.isFinite(input2),
          )
        )
          return;
        let value656: Dynamic =
            (deps.value70.current ?? deps.value73.current).annotations?.find(
              (input2?: Dynamic): Dynamic => input2.id === input,
            ) ?? value655,
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            Math.max(
              -PlatformFileContentConstant_18,
              Math.min(
                PlatformFileContentConstant_18,
                Math.round(input2),
              ),
            ),
          value657: Dynamic;
        if (
          value655.kind === "rect" ||
          value655.kind === "oval" ||
          value655.kind === "pen" ||
          value655.kind === "image"
        ) {
          let value659: Dynamic =
              value655.kind === "image"
                ? PlatformFileContentConstant_20
                : PlatformFileContentConstant_19,
            callback16: Dynamic = (input2?: Dynamic): Dynamic =>
              Math.min(
                PlatformFileContentLimit_6,
                Math.max(value659, Math.round(input2)),
              ),
            value660: Dynamic =
              options.w !== undefined ? callback16(options.w) : value655.w,
            value661: Dynamic =
              options.h !== undefined ? callback16(options.h) : value655.h;
          if (
            value655.kind === "image" &&
            value653 &&
            (options.w !== undefined) != (options.h !== undefined)
          ) {
            let value662: Dynamic = value656;
            options.w !== undefined
              ? (value661 = callback16((value660 * value662.h) / value662.w))
              : (value660 = callback16((value661 * value662.w) / value662.h));
          }
          value657 = {
            ...value655,
            x: callback15(options.x ?? value655.x),
            y: callback15(options.y ?? value655.y),
            w: value660,
            h: value661,
          };
        } else if ((0, isShapeAnnotation)(value655)) {
          let value659: Dynamic = (0, annotationBounds)(value655);
          value657 = (0, moveAnnotation)(
            value655,
            callback15(value655.x + ((options.x ?? value659.x) - value659.x)),
            callback15(value655.y + ((options.y ?? value659.y) - value659.y)),
          );
        } else {
          let value659: Dynamic =
              options.w !== undefined
                ? Math.min(
                    PlatformFileContentConstant_10,
                    Math.max(
                      PlatformFileContentConstant_9,
                      Math.round(options.w),
                    ),
                  )
                : value655.w,
            callback16: Dynamic = (
              input2?: Dynamic,
              options2?: Dynamic,
            ): Dynamic =>
              input2 === undefined
                ? options2
                : input2 === null
                  ? undefined
                  : Math.min(
                      PlatformFileContentConstant_13,
                      Math.max(
                        PlatformFileContentConstant_12,
                        Math.round(input2),
                      ),
                    ),
            {
              maxW: value660,
              maxH: value661,
              ...value662
            }: Dynamic = value655,
            [items, items2]: Dynamic = [
              value655.kind === "title1"
                ? callback16(options.maxW, value655.maxW)
                : undefined,
              callback16(options.maxH, value655.maxH),
            ];
          value657 = {
            ...value662,
            x: callback15(options.x ?? value655.x),
            y: callback15(options.y ?? value655.y),
            w: value659,
            ...(items !== undefined
              ? {
                  maxW: items,
                }
              : {}),
            ...(items2 !== undefined
              ? {
                  maxH: items2,
                }
              : {}),
          };
        }
        let value658: Dynamic = value654.map(
          (input2?: Dynamic): Dynamic =>
            input2.id === input ? value657 : input2,
        );
        if (!context) {
          deps.value68({
            ...deps.value73.current,
            annotations: value658,
          });
          return;
        }
        if (
          ["x", "y", "w", "h", "maxW", "maxH"].every(
            (input2?: Dynamic): Dynamic =>
              value656[input2] === value657[input2],
          ) &&
          (!("x2" in value656) ||
            (value656.x2 === value657.x2 && value656.y2 === value657.y2))
        ) {
          value655 !== value657 &&
            deps.value68({
              ...deps.value73.current,
              annotations: value658,
            });
          return;
        }
        if (
          (0, isShapeAnnotation)(value656) &&
          (0, isShapeAnnotation)(value657)
        )
          deps.value396.current(
            {
              kind: "ann-box",
              id: input,
              from: (0, annotationGeometry)(value656),
              to: (0, annotationGeometry)(value657),
            },
            new Set(),
          );
        else if (
          !(0, isShapeAnnotation)(value656) &&
          !(0, isShapeAnnotation)(value657)
        ) {
          let value659: Dynamic = ["maxW", "maxH"].filter(
            (input2?: Dynamic): Dynamic =>
              value656[input2] !== value657[input2],
          );
          value659.length > 0 &&
            deps.value396.current(
              {
                kind: "transform",
                get label() { return uiMessage("canvas.designCanvas.resize"); },
                boards: [],
                anns: [
                  {
                    id: input,
                    from: Object.fromEntries(
                      value659.map(
                        (input2?: Dynamic): Dynamic => [
                          input2,
                          value656[input2],
                        ],
                      ),
                    ),
                    to: Object.fromEntries(
                      value659.map(
                        (input2?: Dynamic): Dynamic => [
                          input2,
                          value657[input2],
                        ],
                      ),
                    ),
                  },
                ],
              },
              new Set(),
            );
          value656.w !== value657.w &&
            deps.value396.current(
              {
                kind: "ann-resize",
                id: input,
                from: value656.w,
                to: value657.w,
              },
              new Set(),
            );
          (value656.x !== value657.x || value656.y !== value657.y) &&
            deps.value396.current(
              {
                kind: "ann-move",
                id: input,
                from: {
                  x: value656.x,
                  y: value656.y,
                },
                to: {
                  x: value657.x,
                  y: value657.y,
                },
              },
              new Set(),
            );
        }
        deps.value98({
          ...deps.value73.current,
          annotations: value658,
        });
      }

/** 在属性面板修改画布图形的背景、透明度或图片填充方式时运行（onAnnotationCss）：校验取值、更新样式并合并历史。 */
function setAnnotationCss(deps: { readonly value188: Dynamic; readonly value396: Dynamic; readonly value405: Dynamic; readonly value408: Dynamic; readonly value412: Dynamic; readonly value415: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context: Dynamic = false): Dynamic {
        let value653: Dynamic = deps.value73.current.annotations ?? [],
          value654: Dynamic = value653.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (!value654 || !(0, isShapeAnnotation)(value654)) return;
        let value655: Dynamic = context
            ? value654
            : ((deps.value70.current ?? deps.value73.current).annotations?.find(
                (input2?: Dynamic): Dynamic => input2.id === input,
              ) ?? value654),
          state: Dynamic = {
            ...(value654.css ?? {}),
          },
          flag2: Dynamic = false;
        for (let { prop: value661, value: value662 } of options as Dynamic) {
          if (
            !PlatformFileContentBackgroundBackgroundColorOpacityValues.includes(
              value661,
            )
          )
            continue;
          let value663: Dynamic = value661;
          if (value662 === null || value662.trim() === "")
            delete state[value663];
          else {
            let value664: Dynamic = (0, PlatformFileContentTrim)(
              value663,
              value662,
            );
            value664 === null ? (flag2 = true) : (state[value663] = value664);
          }
        }
        flag2 &&
          deps.value188(
            uiMessage("canvas.designCanvas.thatValueIsnTOne"),
          );
        let value656: Dynamic =
          Object.keys(state).length > 0 ? state : undefined;
        if (context) {
          JSON.stringify(value656 ?? null) !==
            JSON.stringify(value654.css ?? null) &&
            deps.value68({
              ...deps.value73.current,
              annotations: value653.map(
                (input2?: Dynamic): Dynamic =>
                  input2.id === input
                    ? (0, updateAnnotationCss)(value654, value656)
                    : input2,
              ),
            });
          return;
        }
        let value657: Dynamic = (0, isShapeAnnotation)(value655)
            ? value655.css
            : undefined,
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            (value656?.[input2] ?? null) !== (value657?.[input2] ?? null),
          value658: Dynamic =
            value654.kind === "image" &&
            (callback15("object-fit") || callback15("object-position"))
              ? value654.crop
              : undefined,
          callback16: Dynamic = (): Dynamic =>
            value658 !== undefined && value654.kind === "image"
              ? (0, updateAnnotationCrop)(
                  (0, updateAnnotationCss)(value654, value656),
                  undefined,
                )
              : (0, updateAnnotationCss)(value654, value656);
        if (
          JSON.stringify(value656 ?? null) ===
          JSON.stringify(value657 ?? null)
        ) {
          JSON.stringify(value656 ?? null) !==
            JSON.stringify(value654.css ?? null) &&
            deps.value68({
              ...deps.value73.current,
              annotations: value653.map(
                (input2?: Dynamic): Dynamic =>
                  input2.id === input
                    ? (0, updateAnnotationCss)(value654, value656)
                    : input2,
              ),
            });
          return;
        }
        let value659: Dynamic =
            PlatformFileContentBackgroundBackgroundColorOpacityValues.filter(
              (input2?: Dynamic): Dynamic =>
                (value657?.[input2] ?? null) !== (state[input2] ?? null),
            ),
          value660: Dynamic = deps.value405.current[deps.value405.current.length - 1];
        if (
          value660?.op.kind === "ann-css" &&
          value660.op.id === input &&
          value660.op.cropFrom === undefined &&
          value658 === undefined &&
          !value660.sealed &&
          value659.length === 1 &&
          value660.cssKey === value659[0] &&
          Date.now() - value660.at < ModelModelStateLimit &&
          deps.value415("undo") === value660
        ) {
          let value661: Dynamic = (0, filterSettingHistoryStep)(
            value660.op,
            value659[0],
            value656,
          );
          value660.at = Date.now();
          deps.value412();
          value661
            ? (value660.op = value661)
            : (deps.value405.current.pop(),
              deps.value408((input2?: Dynamic): Dynamic => input2 + 1));
        } else {
          deps.value396.current(
            {
              kind: "ann-css",
              id: input,
              from: value657,
              to: value656,
              ...(value658 !== undefined
                ? {
                    cropFrom: value658,
                  }
                : {}),
            },
            new Set(),
          );
          let value661: Dynamic =
            deps.value405.current[deps.value405.current.length - 1];
          value661 &&
            value659.length === 1 &&
            (value661.cssKey = value659[0]);
        }
        deps.value98({
          ...deps.value73.current,
          annotations: value653.map(
            (input2?: Dynamic): Dynamic =>
              input2.id === input ? callback16() : input2,
          ),
        });
      }

/** 在属性面板修改画布说明或图形的文字样式时运行：写回文字样式并记录 ann-style 历史。 */
function setAnnotationTextStyle(deps: { readonly value396: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context: Dynamic = false): Dynamic {
        let value653: Dynamic = deps.value73.current.annotations ?? [],
          value654: Dynamic = value653.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          );
        if (!value654 || (0, isShapeAnnotation)(value654)) return;
        let value655: Dynamic = (0, updateAnnotationTextStyle)(
            value654,
            options,
          ),
          value656: Dynamic = value653.map(
            (input2?: Dynamic): Dynamic =>
              input2.id === input ? value655 : input2,
          );
        if (context) {
          JSON.stringify((0, annotationTextStyle)(value654)) !==
            JSON.stringify((0, annotationTextStyle)(value655)) &&
            deps.value68({
              ...deps.value73.current,
              annotations: value656,
            });
          return;
        }
        let value657: Dynamic = (
            deps.value70.current ?? deps.value73.current
          ).annotations?.find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          ),
          value658: Dynamic = (0, annotationTextStyle)(
            value657 !== undefined &&
              !(0, isShapeAnnotation)(value657)
              ? value657
              : value654,
          ),
          value659: Dynamic = (0, annotationTextStyle)(value655);
        if (JSON.stringify(value658) === JSON.stringify(value659)) {
          value654 !== value655 &&
            deps.value68({
              ...deps.value73.current,
              annotations: value656,
            });
          return;
        }
        deps.value396.current(
          {
            kind: "ann-style",
            id: input,
            from: value658,
            to: value659,
          },
          new Set(),
        );
        deps.value98({
          ...deps.value73.current,
          annotations: value656,
        });
      }

/** 在属性面板替换画布图片时运行：校验并上传新图片，更新图片地址、裁剪与替代文字，失败时提示。 */
function replaceAnnotationPicture(deps: { readonly value188: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (
          typeof options == "string"
            ? (0, PlatformFileContentTest_2)(options) === null
            : !(options instanceof File) || !options.type.startsWith("image/")
        )
          return;
        let value653: Dynamic = (deps.value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input,
          ),
          value654: Dynamic =
            value653?.kind === "image" ? value653.src : undefined;
        (0, trackEmbeddedWrite)(
          (async (): Promise<Dynamic> => {
            if (typeof options != "string") {
              let value655: Dynamic = await (0,
              validateCanvasPlacedImage)(options);
              if (value655 !== null)
                throw new CanvasImagePlacementError(value655);
            }
            return typeof options == "string"
              ? {
                  src: options,
                }
              : (0, uploadDesignFile)("appifact", null, options);
          })().then(({ src: src }: Dynamic): Dynamic => {
            if ((0, isEmbedFrozen)()) return;
            let value655: Dynamic = (0, PlatformFileContentTest_2)(
              src,
            );
            if (value655 === null) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotReplaceThePicture"));
              return false;
            }
            let value656: Dynamic = deps.value73.current.annotations ?? [],
              value657: Dynamic = value656.find(
                (input2?: Dynamic): Dynamic => input2.id === input,
              );
            if (
              !value657 ||
              value657.kind !== "image" ||
              value657.src === value655 ||
              value657.src !== value654
            )
              return;
            let value658: Dynamic =
              typeof options == "string"
                ? value657.alt
                : ((0, PlatformFileContentSlice)(
                    (0, droppedImageLabel)(options, "dropped"),
                  ) ?? value657.alt);
            deps.value396.current(
              {
                kind: "ann-src",
                id: input,
                from: {
                  src: value657.src,
                  alt: value657.alt,
                  crop: value657.crop,
                },
                to: {
                  src: value655,
                  alt: value658,
                },
              },
              new Set(),
            );
            deps.value98({
              ...deps.value73.current,
              annotations: value656.map(
                (input2?: Dynamic): Dynamic =>
                  input2.id === input
                    ? (0, updateAnnotationCrop)(
                        (0, updateAnnotationAlt)(
                          {
                            ...value657,
                            src: value655,
                          },
                          value658,
                        ),
                        undefined,
                      )
                    : input2,
              ),
            });
          }),
        ).catch(
          (input2?: Dynamic): Dynamic =>
            deps.value188(
              uiMessage("canvas.designCanvas.thePictureWasNotReplaced", { value1: uiOperation(input2 instanceof CanvasImagePlacementError ? input2.message : "the upload failed") }),
            ),
        );
      }

/** 替换画布上的图片或视频时运行（onReplaceAnnotationMedia）：按文件类型上传图片，或探测视频、生成封面后上传，并更新图形与历史。 */
function replaceAnnotationMedia(deps: { readonly value188: Dynamic; readonly value396: Dynamic; readonly value425: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let value653: Dynamic = (deps.value73.current.annotations ?? []).find(
          (input2?: Dynamic): Dynamic => input2.id === input,
        );
        if (
          !value653 ||
          value653.kind !== "image" ||
          !(options instanceof File)
        )
          return;
        let value654: Dynamic = (0, CanvasWorkingStateJoin)(options);
        if (
          (0, CanvasWorkingStatePrint)(
            deps.value425.current.get(input),
            value654,
            value653,
          )
        )
          return;
        let state: Dynamic = {
            src: value653.src,
            video: value653.video,
          },
          callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
            context?: Dynamic,
          ): Dynamic => {
            let value656: Dynamic = deps.value73.current.annotations ?? [],
              value657: Dynamic = value656.find(
                (input3?: Dynamic): Dynamic => input3.id === input,
              );
            if (
              !value657 ||
              value657.kind !== "image" ||
              value657.src !== state.src ||
              value657.video !== state.video ||
              (value657.src === input2.src && value657.video === input2.video)
            )
              return false;
            let value658: Dynamic = (0, CanvasWorkingStateWidth)(
              value657.w,
              context,
              value657.h,
              PlatformFileContentConstant_20,
              PlatformFileContentLimit_6,
            );
            deps.value396.current(
              {
                kind: "ann-src",
                id: input,
                from: {
                  src: value657.src,
                  alt: value657.alt,
                  h: value657.h,
                  ...(value657.video !== undefined
                    ? {
                        video: value657.video,
                      }
                    : {}),
                  ...(value657.crop !== undefined
                    ? {
                        crop: value657.crop,
                      }
                    : {}),
                },
                to: {
                  src: input2.src,
                  alt: options2,
                  h: value658,
                  ...(input2.video !== undefined
                    ? {
                        video: input2.video,
                      }
                    : {}),
                },
              },
              new Set(),
            );
            deps.value98({
              ...deps.value73.current,
              annotations: value656.map(
                (input3?: Dynamic): Dynamic =>
                  input3.id === input
                    ? (0, updateAnnotationCrop)(
                        (0, updateAnnotationAlt)(
                          (0, updateAnnotationVideo)(
                            {
                              ...value657,
                              src: input2.src,
                              h: value658,
                            },
                            input2.video,
                          ),
                          options2,
                        ),
                        undefined,
                      )
                    : input3,
              ),
            });
            deps.value425.current.set(input, {
              print: value654,
              src: input2.src,
              video: input2.video,
            });
            return true;
          };
        if ((0, isImageFile)(options)) {
          (0, trackEmbeddedWrite)(
            (async (): Promise<Dynamic> => {
              let value656: Dynamic = await (0,
              validateCanvasPlacedImage)(options);
              if (value656 !== null)
                throw new CanvasImagePlacementError(value656);
              let value657: Dynamic = await createImageBitmap(options).then(
                (input2?: Dynamic): Dynamic => {
                  let state2: Dynamic = {
                    width: input2.width,
                    height: input2.height,
                  };
                  input2.close();
                  return state2;
                },
                (): Dynamic => null,
              );
              return {
                ...(await (0, uploadDesignFile)(
                  "appifact",
                  null,
                  options,
                )),
                size: value657,
              };
            })().then(({ src: src, size: size }: Dynamic): Dynamic => {
              if ((0, isEmbedFrozen)()) return false;
              let value656: Dynamic = (0, PlatformFileContentTest_2)(
                src,
              );
              return value656 === null
                ? (deps.value188(
                    uiMessage("canvas.designCanvas.couldNotReplaceTheVideo"),
                  ),
                  false)
                : callback15(
                    {
                      src: value656,
                    },
                    (0, PlatformFileContentSlice)(
                      (0, droppedImageLabel)(options, "dropped"),
                    ),
                    size,
                  );
            }),
          ).catch(
            (input2?: Dynamic): Dynamic => (
              deps.value188(
                uiMessage("canvas.designCanvas.theVideoWasNotReplaced", { value1: uiOperation(input2 instanceof CanvasImagePlacementError ? input2.message : "the upload failed") }),
              ),
              false
            ),
          );
          return;
        }
        let value655: Dynamic = (0, isVideoFile)(options)
          ? (0, videoUploadRefusal)(options)
          : "unsupported_type";
        if (value655 !== null) {
          deps.value188(
            (0, CanvasWorkingStateReplace)(
              (0, videoUploadFailureMessage)(value655),
            ),
          );
          return;
        }
        (0, announce)(uiMessage("canvas.designCanvas.uploadingVideo"));
        (0, trackEmbeddedWrite)(
          (async (): Promise<Dynamic> => {
            let value656: Dynamic = await (0, captureVideoPoster)(
              options,
            ).catch((): Dynamic => "probe_timeout");
            if (typeof value656 == "string") {
              deps.value188(
                (0, CanvasWorkingStateReplace)(
                  (0, videoUploadFailureMessage)(value656),
                ),
              );
              return false;
            }
            let value657: Dynamic = await (0, uploadDesignFile)(
              "appifact",
              null,
              new File(
                [value656.blob],
                (0, videoFileTitle)(options) + ".jpg",
                {
                  type: "image/jpeg",
                },
              ),
            ).then(
              (input2?: Dynamic): Dynamic =>
                (0, PlatformFileContentTest_2)(input2.src),
              (): Dynamic => null,
            );
            if ((0, isEmbedFrozen)()) return false;
            if (value657 === null) {
              deps.value188(
                uiMessage("canvas.designCanvas.couldnTStoreAStill"),
              );
              return false;
            }
            let value658: Dynamic = await (0, uploadDesignVideo)(
              options,
              value656,
            );
            if ((0, isEmbedFrozen)()) return false;
            if ("refused" in value658) {
              deps.value188(
                (0, CanvasWorkingStateReplace)(value658.refused),
              );
              return false;
            }
            let value659: Dynamic = (0, PlatformFileContentTest_3)(
              value658.src,
            );
            if (value659 === null) {
              deps.value188(uiMessage("canvas.designCanvas.couldnTReplaceTheVideo"));
              return false;
            }
            let value660: Dynamic = callback15(
              {
                src: value657,
                video: value659,
              },
              (0, PlatformFileContentSlice)(
                (0, videoFileTitle)(options),
              ),
              value656,
            );
            value660 && (0, announce)(uiMessage("canvas.designCanvas.videoReplaced"));
            return value660;
          })(),
        );
      }

/** 执行撤销或重做时运行：取出可达的历史步骤并应用，处理页面删除恢复，失败时把步骤放回并提示，成功时播报具体操作。 */
function applyUndoRedoStep(deps: { readonly showToast: Dynamic; readonly value188: Dynamic; readonly value218: Dynamic; readonly value405: Dynamic; readonly value406: Dynamic; readonly value408: Dynamic; readonly value409: Dynamic; readonly value414: Dynamic; readonly value415: Dynamic; readonly value427: Dynamic; readonly value428: Dynamic; readonly value440: Dynamic; readonly value73: Dynamic }, input?: Dynamic, options: Dynamic = false): Dynamic {
        if (deps.value427.current) return true;
        let value653: Dynamic = deps.value415(input);
        if (!value653) return false;
        if (
          value653.op.kind === "delete" &&
          value653.op.page !== undefined &&
          deps.value218.current
        )
          return true;
        deps.value427.current = value653;
        let current4: Dynamic = deps.value409.current,
          value654: Dynamic = input === "undo" ? deps.value405 : deps.value406,
          value655: Dynamic = value654.current.lastIndexOf(value653);
        value655 >= 0 && value654.current.splice(value655, 1);
        let callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic => {
            deps.value427.current = null;
            value654.current.push(value653);
            deps.value408((input3?: Dynamic): Dynamic => input3 + 1);
            deps.showToast(input2, options2);
          },
          callback16: Dynamic = (): Dynamic => {
            let value656: Dynamic =
              value653.op.kind === "delete" ? value653.op.page : undefined;
            return value656 === undefined
              ? undefined
              : (0, pageUndoFailureMessage)(
                  input,
                  value656.relisted === true &&
                    (deps.value73.current.pages ?? []).some(
                      (input2?: Dynamic): Dynamic =>
                        input2.id === value656.spec.id,
                    ),
                );
          };
        deps.value414(value653.op, input)
          .then((input2?: Dynamic): Dynamic => {
            if (input2 === "full") {
              callback15(
                (0, clipboardActionFailureMessage)(
                  input,
                  PlatformFileContentLimit_5,
                  value653.op.kind === "ann-add" ||
                    value653.op.kind === "ann-delete"
                    ? value653.op.spec
                    : undefined,
                  callback16(),
                  options,
                ),
                "warning",
              );
              return;
            }
            if (input2 === "nothing") {
              deps.value427.current = null;
              deps.value408((input3?: Dynamic): Dynamic => input3 + 1);
              let value659: Dynamic = (0,
                canvasHistoryAnnouncementMode)(
                  input,
                  value653.bound !== undefined,
                  options,
                ),
                callback17: Dynamic = (): Dynamic =>
                  (0, announce)(
                    NothingChangedThatStepNoLongerMessage,
                  );
              value659 === "partner"
                ? deps.value428(value653.bound, input, callback17)
                : value659 === "say" && callback17();
              return;
            }
            let value656: Dynamic =
              value653.op.kind === "delete" && input === "undo"
                ? {
                    ...value653,
                    depths: [
                      ...value653.depths.filter(
                        ([input3]: Dynamic): Dynamic =>
                          value653.op.kind !== "delete" ||
                          !value653.op.entries.some(
                            (input4?: Dynamic): Dynamic =>
                              input4.file === input3,
                          ),
                      ),
                      ...value653.op.entries.map(
                        (input3?: Dynamic): Dynamic => [
                          input3.file,
                          deps.value440.current.get(input3.file) ?? 0,
                        ],
                      ),
                    ],
                  }
                : value653;
            (input === "redo" || deps.value409.current === current4) &&
              (input === "undo" ? deps.value406 : deps.value405).current.push({
                ...value656,
                sealed: true,
              });
            deps.value408((input3?: Dynamic): Dynamic => input3 + 1);
            let state: Dynamic = {
                rename: "Artboard rename",
                resize: "Artboard resize",
                print: "Print mode change",
                paper: "Paper change",
                guides: "Layout guide change",
                radius: "Corner radius change",
                cover: "Thumbnail change",
                order: "Artboard order change",
                "ann-add": "New note",
                "ann-delete": "Note delete",
                "ann-move": "Note move",
                "ann-resize": "Note resize",
                "ann-text": "Note edit",
                "ann-style": "Note style",
                "ann-box": "Shape move/resize",
                "ann-path": "Edit path",
                "ann-color": "Shape color",
                "ann-css": "Style",
                "ann-heads": "Arrowhead change",
                "ann-src": "Picture replace",
                "ann-crop": "Crop",
                "page-add": "Page change",
                "page-rename": "Page change",
                tweak: "Tweak",
              },
              state2: Dynamic = {
                move: [uiMessage("canvas.designCanvas.artboardMove"), uiMessage("canvas.designCanvas.artboardMoves")],
                add: [uiMessage("canvas.designCanvas.newArtboard"), uiMessage("canvas.designCanvas.newArtboards")],
                delete: [uiMessage("canvas.designCanvas.artboardDelete"), uiMessage("canvas.designCanvas.artboardDeletes")],
              },
              state3: Dynamic = {
                move: "Move",
                add: "Duplicate",
                delete: "Delete",
              },
              op2: Dynamic = value653.op,
              value657: Dynamic =
                op2.kind === "move"
                  ? op2.moves.length
                  : op2.kind === "add" || op2.kind === "delete"
                    ? op2.entries.length
                    : 0,
              value658: Dynamic =
                op2.kind === "delete" && op2.page !== undefined
                  ? uiMessage("canvas.designCanvas.pageDelete")
                  : op2.kind === "move" ||
                      op2.kind === "add" ||
                      op2.kind === "delete"
                    ? (op2.anns?.length ?? 0) > 0
                      ? (op2.kind === "add" && op2.label) || state3[op2.kind]
                      : value657 === 1
                        ? state2[op2.kind][0]
                        : String(value657) + " " + state2[op2.kind][1]
                    : (op2.kind === "ann-add" || op2.kind === "ann-delete") &&
                        (0, isShapeAnnotation)(op2.spec)
                      ? op2.spec.kind === "image"
                        ? op2.spec.video !== undefined
                          ? op2.kind === "ann-add"
                            ? uiMessage("canvas.designCanvas.newVideo")
                            : uiMessage("canvas.designCanvas.videoDelete")
                          : op2.kind === "ann-add"
                            ? uiMessage("canvas.designCanvas.newPicture")
                            : uiMessage("canvas.designCanvas.pictureDelete")
                        : op2.kind === "ann-add"
                          ? uiMessage("canvas.designCanvas.newShape")
                          : uiMessage("canvas.designCanvas.shapeDelete")
                      : op2.kind === "transform"
                        ? op2.label
                        : op2.kind === "ann-box" &&
                            "w" in op2.from &&
                            "w" in op2.to &&
                            op2.from.x === op2.to.x &&
                            op2.from.y === op2.to.y &&
                            op2.from.w === op2.to.w &&
                            op2.from.h === op2.to.h
                          ? "Rotate"
                          : op2.kind === "ann-src" &&
                              (op2.from.video !== undefined ||
                                op2.to.video !== undefined)
                            ? uiMessage("canvas.designCanvas.videoReplace")
                            : op2.kind === "ann-box" &&
                                (deps.value73.current.annotations ?? []).some(
                                  (source?: Dynamic): Dynamic =>
                                    source.id === op2.id &&
                                    source.kind === "image",
                                )
                              ? (deps.value73.current.annotations ?? []).some(
                                  (source?: Dynamic): Dynamic =>
                                    source.id === op2.id &&
                                    source.kind === "image" &&
                                    source.video !== undefined,
                                )
                                ? uiMessage("canvas.designCanvas.videoMoveResize")
                                : uiMessage("canvas.designCanvas.pictureMoveResize")
                              : state[op2.kind];
            deps.value188(
              input2 === false
                ? uiMessage("canvas.designCanvas.thatArtboardIsnTOpen")
                : value658 + (input === "undo" ? " undone." : " redone."),
            );
            deps.value427.current = null;
            value653.bound !== undefined &&
              input2 !== false &&
              deps.value409.current === current4 &&
              deps.value428(value653.bound, input);
          })
          .catch((input2?: Dynamic): Dynamic => {
            let value656: Dynamic = callback16();
            callback15(
              value656 !== undefined
                ? value656 + (0, errorMessage)(input2)
                : uiMessage("canvas.designCanvas.couldnTUndoTheArtboard") + String(input2),
              "error",
            );
          });
        return true;
      }

/** 首次渲染时惰性创建一次：建立跨画板的会话历史（createSessionHistory）及其宿主，负责保护当前页、丢弃过期条目与播报撤销目标。 */
function initSessionHistoryKeeper(deps: { readonly callback2: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value218: Dynamic; readonly value275: Dynamic; readonly value285: Dynamic; readonly value427: Dynamic; readonly value434: Dynamic; readonly value435: Dynamic; readonly value436: Dynamic; readonly value437: Dynamic; readonly value448: Dynamic; readonly value70: Dynamic; readonly value80: Dynamic }): Dynamic {
    let callback15: Dynamic = (input?: Dynamic): Dynamic =>
        deps.value70.current?.artboards.some(
          (input2?: Dynamic): Dynamic => input2.file === input,
        ) === true && deps.value435.current.content().files[input] !== undefined,
      callback16: Dynamic = (input?: Dynamic): Dynamic => {
        let current4: Dynamic = deps.value70.current,
          value655: Dynamic = current4?.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        return current4 && value655
          ? (0, designPageId)(value655, current4.pages)
          : undefined;
      },
      state: Dynamic = {
        changed: [],
        other: [],
      },
      value653: Dynamic,
      callback17: Dynamic = (): Dynamic => {
        clearTimeout(value653);
        value653 = undefined;
        state.changed.length = 0;
        state.other.length = 0;
      },
      value654: Dynamic = (0, createSessionHistory)({
        inDocument: callback15,
        isProtected: (input?: Dynamic): Dynamic =>
          callback16(input) === deps.value80.current ||
          deps.value434.current?.undoFile() === input ||
          deps.value434.current?.redoFile() === input,
        now: (): Dynamic => performance.now(),
        onDrop: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value434.current?.forget(input);
          if (
            !(0, CanvasWorkingStateHas)(options) ||
            ((options === "changed" ? state.changed : state.other).push(
              deps.callback2(input),
            ),
            value653 !== undefined)
          )
            return;
          let current4: Dynamic = deps.value435.current;
          value653 = setTimeout((): Dynamic => {
            value653 = undefined;
            if (deps.value435.current !== current4) return callback17();
            let { message: value655, description: value656 }: Dynamic = (0,
            summarizeChangedArtboards)(
              state.changed.splice(0),
              state.other.splice(0),
            );
            deps.value437.current(
              value655,
              "warning",
              value656 === undefined
                ? undefined
                : {
                    description: value656,
                  },
            );
          }, 50);
        },
      });
    return {
      keeper: value654,
      host: {
        inDocument: callback15,
        openPage: (): Dynamic => deps.value80.current,
        pageOfFile: callback16,
        isFramed: (input?: Dynamic): Dynamic =>
          deps.value70.current?.artboards.some(
            (input2?: Dynamic): Dynamic =>
              input2.file === input && !input2.frameless,
          ) === true,
        startLoad: (input?: Dynamic): Dynamic => {
          let entry: Dynamic = deps.value177.current.get(input);
          (0, recordSessionLoadStart)(
            value654,
            input,
            entry
              ? (): Dynamic => entry.ensureModel(deps.value19(input))
              : undefined,
          );
        },
        mayShowPage: (): Dynamic =>
          !deps.value218.current && deps.value427.current === null && !deps.value285.current,
        currentSrc: (input?: Dynamic): Dynamic =>
          deps.value435.current.content().files[input],
        afterExitGuard: deps.value275,
        switchPage: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value436.current(input, options),
        say: (source?: Dynamic): Dynamic => {
          source.kind === "loading"
            ? (0, announce)(
                (0, pendingUndoAnnouncement)(
                  source.dir,
                  deps.callback2(source.file),
                ),
              )
            : deps.value448.current?.(
                (0, undoTargetAnnouncement)(
                  source.dir,
                  deps.value70.current?.pages?.find(
                    (input?: Dynamic): Dynamic => input.id === source.page,
                  )?.name ?? uiMessage("canvas.designCanvas.page1"),
                ),
              );
        },
      },
      cancelSaid: callback17,
    };
  }

/** 删除选中的画板、画布说明或整个页面时运行：移除文件与清单条目，修复启动画板、切换到相邻页面，并播报与记录分析。 */
function deleteBoardsAndNotes(deps: { readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly value140: Dynamic; readonly value177: Dynamic; readonly value298: Dynamic; readonly value413: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options: Dynamic = emptyCanvasSelectionFiles,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.value73.current.artboards,
          value654: Dynamic = artboards.filter(
            (input2?: Dynamic): Dynamic => input.has(input2.file),
          );
        return value654.length === 0 && value653 === undefined
          ? false
          : ((async (): Promise<Dynamic> => {
              try {
                let items: Dynamic = [],
                  callback15: Dynamic = async (
                    input2?: Dynamic,
                    options2?: Dynamic,
                  ): Promise<Dynamic> => {
                    await deps.value177.current.get(input2.file)?.flushPending();
                    let value663: Dynamic =
                      (await (0, getKvClient)().get(
                        (0, PlatformFileContentHandler_4)(
                          input2.file,
                        ),
                      )) ??
                      deps.doc.content().files[input2.file] ??
                      "";
                    items.push({
                      file: input2.file,
                      src: value663,
                      spec: input2,
                      index: options2.findIndex(
                        (input3?: Dynamic): Dynamic =>
                          input3.file === input2.file,
                      ),
                    });
                  };
                for (let value663 of value654 as Dynamic)
                  await callback15(value663, artboards);
                let value655: Dynamic =
                  value653 !== undefined
                    ? (0, remainingCanvasPageObjects)(
                        deps.value73.current,
                        value653.spec.id,
                        new Set(
                          items.map(
                            (input2?: Dynamic): Dynamic => input2.file,
                          ),
                        ),
                        options,
                      )
                    : undefined;
                for (let value663 of (value655?.artboards ?? []) as Dynamic)
                  await callback15(value663, deps.value73.current.artboards);
                let values: Dynamic = new Set(
                    items.map((input2?: Dynamic): Dynamic => input2.file),
                  ),
                  value656: Dynamic =
                    value655 !== undefined && value655.notes.length > 0
                      ? new Set([...options, ...value655.notes])
                      : options,
                  current4: Dynamic = deps.value73.current;
                if (
                  value653 !== undefined &&
                  !(current4.pages ?? []).some(
                    (input2?: Dynamic): Dynamic =>
                      input2.id !== value653.spec.id,
                  )
                ) {
                  deps.showToast(staleDeleteFailureMessage(value653.spec.name));
                  return;
                }
                let value657: Dynamic = (current4.annotations ?? []).flatMap(
                    (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                      value656.has(input2.id)
                        ? [
                            {
                              spec: input2,
                              index: options2,
                            },
                          ]
                        : [],
                  ),
                  value658: Dynamic =
                    current4.cover !== undefined && values.has(current4.cover)
                      ? current4.cover
                      : undefined,
                  value659: Dynamic = (0,
                  repairCanvasLaunchAfterDeletion)(
                    current4,
                    values,
                    value653?.spec.id,
                  );
                deps.value413(
                  {
                    kind: "delete",
                    entries: items,
                    ...(value657.length > 0
                      ? {
                          anns: value657,
                        }
                      : {}),
                    ...(value658 !== undefined
                      ? {
                          cover: value658,
                        }
                      : {}),
                    ...(value659 !== undefined
                      ? {
                          launch: value659,
                        }
                      : {}),
                    ...(value653 !== undefined
                      ? {
                          page: value653,
                        }
                      : {}),
                  },
                  new Set(
                    items.map((input2?: Dynamic): Dynamic => input2.file),
                  ),
                  undefined,
                  context,
                );
                for (let value663 of items as Dynamic)
                  await (0, getKvClient)().delete(
                    (0, PlatformFileContentHandler_4)(value663.file),
                  );
                let value660: Dynamic = deps.value73.current.pages ?? [],
                  value661: Dynamic =
                    value653 !== undefined
                      ? value660.filter(
                          (input2?: Dynamic): Dynamic =>
                            input2.id !== value653.spec.id,
                        )
                      : [];
                deps.value98({
                  artboards: deps.value73.current.artboards.filter(
                    (input2?: Dynamic): Dynamic => !values.has(input2.file),
                  ),
                  ...(value657.length > 0
                    ? {
                        annotations: (
                          deps.value73.current.annotations ?? []
                        ).filter(
                          (input2?: Dynamic): Dynamic =>
                            !value656.has(input2.id),
                        ),
                      }
                    : {}),
                  ...(value661.length > 0
                    ? {
                        pages: value661,
                      }
                    : {}),
                });
                value653 !== undefined &&
                  value661.length === 0 &&
                  (value653.relisted = true);
                let value662: Dynamic =
                  value653 !== undefined &&
                  deps.value80.current === value653.spec.id;
                value653 !== undefined &&
                  value662 &&
                  value661.length > 0 &&
                  deps.value298(
                    (0, neighboringCanvasPageId)(
                      value660,
                      value653.spec.id,
                    ) ?? value661[0].id,
                  );
                (value653 === undefined || value662) &&
                  deps.setSelection(emptyCanvasSelection);
                (0, announce)(
                  value653 !== undefined
                    ? (0, pageDeletedAnnouncement)(
                        value653.spec.name,
                        items.length,
                        value657.length,
                      )
                    : value657.length > 0
                      ? (0, objectsDeletedAnnouncement)(
                          value654.length + value657.length,
                        )
                      : (0, artboardsDeletedAnnouncement)(
                          value654.map(
                            (input2?: Dynamic): Dynamic =>
                              input2.title ??
                              input2.file.replace(/\.dc\.html$/, ""),
                          ),
                        ),
                );
                items.length > 0 &&
                  (0, frameAnalyticsReporter)(
                    designAnalyticsEvents.artboardDeleted,
                  );
              } catch (value655: Dynamic) {
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTDeleteThe") +
                    (value653 !== undefined ? "page" : "artboard") +
                    ": " +
                    String(value655),
                  "error",
                );
              } finally {
                context !== undefined && deps.value140.current.get(context)?.();
              }
            })(),
            true);
      }

/** 文档或页面变化时计算（useMemo）：为 HostedEditor 提供画布接口，包括画板列表、分组、撤销重做、显示/聚焦、放置、重命名、新增、复制与删除。 */
function buildHostedEditorCanvasApi(deps: { readonly doc: Dynamic; readonly supportsLoadState: Dynamic; readonly value155: Dynamic; readonly value156: Dynamic; readonly value202: Dynamic; readonly value274: Dynamic; readonly value383: Dynamic; readonly value396: Dynamic; readonly value405: Dynamic; readonly value406: Dynamic; readonly value409: Dynamic; readonly value410: Dynamic; readonly value432: Dynamic; readonly value440: Dynamic; readonly value447: Dynamic; readonly value450: Dynamic; readonly value451: Dynamic; readonly value452: Dynamic; readonly value453: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }): Dynamic {
      let callback15: Dynamic = async (
          input?: Dynamic,
          options: Dynamic = 5e3,
        ): Promise<Dynamic> => {
          let value653: Dynamic = Date.now();
          for (; !input(); ) {
            if (Date.now() - value653 > options) return false;
            await new Promise(
              (input2?: Dynamic): Dynamic => setTimeout(input2, 40),
            );
          }
          return true;
        },
        callback16: Dynamic = (): Dynamic =>
          (0, designPageContents)(deps.value73.current, deps.value80.current)
            .artboards,
        callback17: Dynamic = (input?: Dynamic): Dynamic =>
          Math.min(
            PlatformFileContentLimit_6,
            Math.max(
              PlatformFileContentConstant_16,
              Math.round(input),
            ),
          );
      return {
        boards: (): Dynamic =>
          callback16().map(
            (input?: Dynamic): Dynamic => ({
              file: input.file,
              x: input.x,
              y: input.y,
              w: input.w,
              h: input.h,
              title: input.title ?? input.file.replace(/\.dc\.html$/, ""),
            }),
          ),
        pageIs: (input?: Dynamic): Dynamic =>
          (0, isCanvasPageMatch)(
            input,
            deps.value80.current,
            deps.value73.current.pages?.[0]?.id ?? "",
          ),
        token: (): Dynamic => (0, randomSessionToken)(),
        group: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value432.current?.group(
            input,
            options !== undefined
              ? {
                  bound: options,
                }
              : undefined,
          ) ?? null,
        hold: async (): Promise<Dynamic> => (
          await callback15(
            (): Dynamic =>
              deps.value155.current <= 0 &&
              !deps.value202.current &&
              !(deps.value432.current?.busy() ?? false),
          ),
          deps.value156(CanvasWorkingStateConstant_8)
        ),
        undo: (): Dynamic => deps.value447.current?.undo(),
        redo: (): Dynamic => deps.value447.current?.redo(),
        mark: (): Dynamic => {
          let current4: Dynamic = deps.value405.current,
            value653: Dynamic = current4[current4.length - 1];
          value653 !== undefined &&
            !deps.value453.has(value653) &&
            deps.value453.set(value653, deps.value453.next++);
          return (
            String(current4.length) +
            ":" +
            (value653 === undefined ? "" : String(deps.value453.get(value653))) +
            "/" +
            String(deps.value406.current.length) +
            "|" +
            [...deps.value440.current]
              .filter(([, input]: Dynamic): Dynamic => input !== 0)
              .map(
                ([input, input2]: Dynamic): Dynamic =>
                  input + "=" + String(input2),
              )
              .sort()
              .join(",") +
            "#" +
            String(deps.value409.current)
          );
        },
        depth: (): Dynamic =>
          deps.value410.current +
          deps.value405.current.length +
          [...deps.value440.current.values()].reduce(
            (input?: Dynamic, options?: Dynamic): Dynamic => input + options,
            0,
          ),
        revealRect: (input?: Dynamic): Dynamic => {
          deps.value383.current?.({
            x: input.x,
            y: input.y,
            w: input.w,
            h: input.h,
          });
        },
        reveal: (input?: Dynamic): Dynamic => {
          let value653: Dynamic = deps.value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
          value653 !== undefined &&
            deps.value383.current?.({
              x: value653.x,
              y: value653.y,
              w: value653.w,
              h: value653.h,
            });
        },
        focus: (input?: Dynamic): Dynamic => {
          deps.value274.current(input);
        },
        place: (input?: Dynamic, options?: Dynamic): Dynamic => {
          let items: Dynamic = [],
            value653: Dynamic = deps.value73.current.artboards.map(
              (input2?: Dynamic): Dynamic => {
                let value654: Dynamic = input.find(
                  (input3?: Dynamic): Dynamic => input3.file === input2.file,
                );
                if (value654 === undefined) return input2;
                let state: Dynamic = {};
                value654.x !== undefined &&
                  Math.round(value654.x) !== Math.round(input2.x) &&
                  (state.x = Math.round(value654.x));
                value654.y !== undefined &&
                  Math.round(value654.y) !== Math.round(input2.y) &&
                  (state.y = Math.round(value654.y));
                value654.w !== undefined &&
                  input2.frameless !== true &&
                  callback17(value654.w) !== Math.round(input2.w) &&
                  (state.w = callback17(value654.w));
                value654.h !== undefined &&
                  input2.frameless !== true &&
                  callback17(value654.h) !== Math.round(input2.h) &&
                  (state.h = callback17(value654.h));
                let value655: Dynamic = Object.keys(state);
                return value655.length === 0
                  ? input2
                  : (items.push({
                      file: input2.file,
                      from: Object.fromEntries(
                        value655.map(
                          (input3?: Dynamic): Dynamic => [
                            input3,
                            input2[input3],
                          ],
                        ),
                      ),
                      to: state,
                    }),
                    {
                      ...input2,
                      ...state,
                    });
              },
            );
          return items.length === 0
            ? []
            : (deps.value396.current(
                {
                  kind: "transform",
                  get label() { return uiMessage("canvas.designCanvas.resize"); },
                  boards: items,
                  anns: [],
                },
                new Set(),
                undefined,
                options,
              ),
              deps.value98({
                artboards: value653,
              }),
              items.map((input2?: Dynamic): Dynamic => input2.file));
        },
        rename: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Dynamic => {
          let value653: Dynamic = (0, PlatformFileContentSlice)(
              options,
            ),
            value654: Dynamic = deps.value73.current.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === input,
            );
          if (value653 === undefined || value654 === undefined) return false;
          let value655: Dynamic =
            value653 !== input.replace(/\.dc\.html$/, "")
              ? value653
              : undefined;
          return (value654.title ?? undefined) === value655
            ? false
            : (deps.value396.current(
                {
                  kind: "rename",
                  file: input,
                  from: value654.title,
                  to: value655,
                },
                new Set(),
                undefined,
                context,
              ),
              deps.value98({
                artboards: deps.value73.current.artboards.map(
                  (input2?: Dynamic): Dynamic => {
                    if (input2.file !== input) return input2;
                    let { title: value656, ...value657 }: Dynamic = input2;
                    return value655 !== undefined
                      ? {
                          ...value657,
                          title: value655,
                        }
                      : value657;
                  },
                ),
              }),
              true);
        },
        add: async (input?: Dynamic, options?: Dynamic): Promise<Dynamic> => {
          let value653: Dynamic =
              /^\/\*ask:page\*\/body\{(?:(?:background|color):(?:#[0-9a-fA-F]{3,8}|[a-z]{3,24}|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s-]{1,60}(?:deg)?[0-9.,%\s-]{0,60}\))|font-family:(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2})(?:;(?:(?:background|color):(?:#[0-9a-fA-F]{3,8}|[a-z]{3,24}|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s-]{1,60}(?:deg)?[0-9.,%\s-]{0,60}\))|font-family:(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2})){0,2}\}\/\*ask:page-end\*\/$/i,
            state: Dynamic = {
              ...deps.doc.content().files,
            },
            items: Dynamic = [...callback16()],
            items2: Dynamic = [];
          for (let value654 of input as Dynamic) {
            let value655: Dynamic = (0, uniqueArtboardFile)(
                state,
                "Artboard",
                deps.supportsLoadState,
              ),
              value656: Dynamic = value653.test(value654.pageRule ?? "")
                ? (0, blankDcDocument)().replace(
                    /[ \t]*<\/style>/,
                    (input2?: Dynamic): Dynamic =>
                      value654.pageRule +
                      `
` +
                      input2,
                  )
                : (0, blankDcDocument)(),
              value657: Dynamic =
                value654.body.trim() === ""
                  ? value656
                  : value656.replace(
                      /[ \t]*<section class="stage"[^>]*><\/section>/,
                      (): Dynamic => value654.body,
                    );
            state[value655] = value657;
            let value658: Dynamic =
                typeof value654.x == "number" &&
                typeof value654.y == "number" &&
                Number.isFinite(value654.x) &&
                Number.isFinite(value654.y)
                  ? {
                      x: value654.x,
                      y: value654.y,
                    }
                  : nextArtboardPlacementPoint(items),
              state2: Dynamic = {
                file: value655,
                x: Math.round(value658.x),
                y: Math.round(value658.y),
                w: callback17(value654.w),
                h: callback17(value654.h),
                title:
                  (0, PlatformFileContentSlice)(value654.title) ??
                  (0, nextArtboardTitle)(items),
                ...deps.value452.current(),
              };
            items.push(state2);
            items2.push({
              file: value655,
              src: value657,
              spec: state2,
            });
          }
          if (
            items2.length === 0 ||
            Object.keys(deps.doc.content().files).length + items2.length >
              PlatformFileContentFilesValue
          )
            return [];
          let values: Dynamic = new Set();
          try {
            for (let value654 of items2 as Dynamic) {
              await (0, getKvClient)().set(
                (0, PlatformFileContentHandler_4)(value654.file),
                value654.src,
              );
              values.add(value654.file);
            }
          } catch {
            for (let value654 of values as Dynamic)
              await (0, getKvClient)()
                .delete((0, PlatformFileContentHandler_4)(value654))
                .catch((): Dynamic => false);
            return [];
          }
          deps.value98({
            artboards: [
              ...deps.value73.current.artboards.filter(
                (input2?: Dynamic): Dynamic => !values.has(input2.file),
              ),
              ...items2.map((input2?: Dynamic): Dynamic => input2.spec),
            ],
          });
          deps.value396.current(
            {
              kind: "add",
              entries: items2,
            },
            values,
            undefined,
            options,
          );
          return items2.map((input2?: Dynamic): Dynamic => input2.file);
        },
        duplicate: async (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Promise<Dynamic> => {
          let values: Dynamic = new Set(
              deps.value73.current.artboards.map(
                (input2?: Dynamic): Dynamic => input2.file,
              ),
            ),
            items: Dynamic = [...callback16()],
            value653: Dynamic = input.flatMap(
              (
                { file: file, title: title }: Dynamic,
                options2?: Dynamic,
              ): Dynamic => {
                let value654: Dynamic = items.find(
                  (input2?: Dynamic): Dynamic => input2.file === file,
                );
                if (value654 === undefined) return [];
                let value655: Dynamic = context?.[options2],
                  value656: Dynamic =
                    value655 !== undefined &&
                    Number.isFinite(value655.x) &&
                    Number.isFinite(value655.y)
                      ? {
                          x: Math.round(value655.x),
                          y: Math.round(value655.y),
                        }
                      : nextArtboardPlacementPoint(items);
                items.push({
                  ...value654,
                  file: file + "#copy",
                  x: value656.x,
                  y: value656.y,
                });
                return [
                  {
                    file: file,
                    x: value656.x,
                    y: value656.y,
                    title: title,
                  },
                ];
              },
            );
          return value653.length === 0
            ? []
            : (deps.value451.current(value653, [], options),
              await callback15(
                (): Dynamic =>
                  deps.value73.current.artboards.length >=
                  values.size + value653.length,
              ),
              deps.value73.current.artboards
                .map((input2?: Dynamic): Dynamic => input2.file)
                .filter((input2?: Dynamic): Dynamic => !values.has(input2)));
        },
        remove: async (
          input?: Dynamic,
          options?: Dynamic,
        ): Promise<Dynamic> => {
          let values: Dynamic = new Set(
            input.filter(
              (input2?: Dynamic): Dynamic =>
                deps.value73.current.artboards.some(
                  (input3?: Dynamic): Dynamic => input3.file === input2,
                ),
            ),
          );
          return values.size === 0 ||
            !deps.value450.current(values, undefined, options)
            ? 0
            : (await callback15(
                (): Dynamic =>
                  !deps.value73.current.artboards.some(
                    (input2?: Dynamic): Dynamic => values.has(input2.file),
                  ),
              ),
              [...values].filter(
                (input2?: Dynamic): Dynamic =>
                  !deps.value73.current.artboards.some(
                    (input3?: Dynamic): Dynamic => input3.file === input2,
                  ),
              ).length);
        },
      };
    }

/** 在画布上复制画板或说明时运行：读取画板文件与外观属性，写入应用内画板剪贴板并记录剪贴板标记。 */
function copyBoardsToClipboard(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value67: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        (async (): Promise<Dynamic> => {
          try {
            let value653: Dynamic = deps.value67.artboards.filter(
                (input2?: Dynamic): Dynamic => input.has(input2.file),
              ),
              value654: Dynamic = (deps.value67.annotations ?? []).filter(
                (input2?: Dynamic): Dynamic => options.has(input2.id),
              );
            if (value653.length === 0 && value654.length === 0) {
              setTimeout(
                (): Dynamic =>
                  (0, rememberClipboardStamp)(context?.()?.stamp),
                0,
              );
              return;
            }
            await Promise.all(
              value653.map(
                (input2?: Dynamic): Dynamic =>
                  deps.value177.current.get(input2.file)?.flushPending(),
              ),
            );
            let files: Dynamic = deps.doc.content().files,
              value655: Dynamic = value654.map(
                (input2?: Dynamic): Dynamic =>
                  (0, annotationVisibleBounds)(input2),
              ),
              value656: Dynamic = Math.min(
                ...value653.map((input2?: Dynamic): Dynamic => input2.x),
                ...value655.map((input2?: Dynamic): Dynamic => input2.x),
              ),
              value657: Dynamic = Math.min(
                ...value653.map((input2?: Dynamic): Dynamic => input2.y),
                ...value655.map((input2?: Dynamic): Dynamic => input2.y),
              ),
              value658: Dynamic = value654.map(
                (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                  let value659: Dynamic = value655[options2];
                  return {
                    spec: input2,
                    dx: value659.x - value656,
                    dy: value659.y - value657,
                    w: value659.w,
                    h: value659.h,
                  };
                },
              ),
              items: Dynamic = [];
            for (let value659 of value653 as Dynamic) {
              let value660: Dynamic =
                (await (0, getKvClient)().get(
                  (0, PlatformFileContentHandler_4)(value659.file),
                )) ?? files[value659.file];
              typeof value660 != "string" ||
                (0, isLoadingArtboardHtml)(value660) ||
                items.push({
                  src: value660,
                  stem: value659.file.replace(/\.dc\.html$/, ""),
                  dx: value659.x - value656,
                  dy: value659.y - value657,
                  w: value659.w,
                  h: value659.h,
                  ...(value659.title
                    ? {
                        title: value659.title,
                      }
                    : {}),
                  ...(0, artboardAppearanceProperties)(value659),
                });
            }
            items.length > 0 || (value658.length > 0 && value653.length === 0)
              ? (0, setArtboardClipboard)(
                  items,
                  context?.(),
                  value658,
                )
              : (0, rememberClipboardStamp)(context?.()?.stamp);
          } catch {
            (0, rememberClipboardStamp)(context?.()?.stamp);
          }
        })();
      }

/** 从应用内剪贴板粘贴画板与说明时运行：生成新文件与标题、避开已有对象层叠放置并选中，失败时提示。 */
function pasteBoardsFromClipboard(deps: { readonly callback3: Dynamic; readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value105: Dynamic; readonly value218: Dynamic; readonly value310: Dynamic; readonly value345: Dynamic; readonly value383: Dynamic; readonly value413: Dynamic; readonly value461: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value91: Dynamic; readonly value98: Dynamic }, items?: Dynamic, items2?: Dynamic, context?: Dynamic): Dynamic {
        let value653: Dynamic = (0, pasteCascadeStep)(
          deps.value105.get().scale,
        );
        (async (): Promise<Dynamic> => {
          let items3: Dynamic = [];
          try {
            let state: Dynamic = {
              ...deps.doc.content().files,
            };
            if (
              Object.keys(state).length + items.length >
              PlatformFileContentFilesValue
            ) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }),
                "error",
              );
              return;
            }
            items.length > 0 && (deps.value310.current = true);
            for (let value661 of items as Dynamic) {
              let value662: Dynamic = (0, uniqueArtboardFile)(
                state,
                value661.stem,
                deps.supportsLoadState,
              );
              state[value662] = value661.src;
              items3.push(value662);
              deps.value461.current.add(value662);
              try {
                await (0, getKvClient)().set(
                  (0, PlatformFileContentHandler_4)(value662),
                  value661.src,
                );
              } catch (value663: Dynamic) {
                for (let value664 of items3 as Dynamic)
                  await (0, getKvClient)()
                    .delete(
                      (0, PlatformFileContentHandler_4)(value664),
                    )
                    .catch((): Dynamic => false);
                throw value663;
              }
            }
            let value654: Dynamic = (0, designPageContents)(
                deps.value73.current,
                deps.value80.current,
              ),
              value655: Dynamic = value654.artboards.filter(
                (input?: Dynamic): Dynamic =>
                  !deps.value461.current.has(input.file),
              ),
              value656: Dynamic = context
                ? (0, avoidPastedObjectCollisions)(
                    (0, pastedObjectsOrigin)(
                      [...items, ...items2],
                      context,
                    ),
                    items,
                    value655,
                    value653,
                  )
                : nextArtboardPlacementPoint([
                    ...value655,
                    ...deps.value91.current,
                    ...(value654.annotations ?? []).map(
                      annotationVisibleBounds,
                    ),
                  ]),
              items4: Dynamic = [];
            items.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
              items4.push({
                file: items3[options],
                x: Math.round(value656.x + input.dx),
                y: Math.round(value656.y + input.dy),
                w: input.w,
                h: input.h,
                title: (0, duplicateArtboardTitle)(
                  input.title ?? input.stem,
                  [...value655, ...items4],
                ),
                ...(0, artboardAppearanceProperties)(input),
                ...deps.callback3(),
              });
            });
            let value657: Dynamic = items.map(
                (input?: Dynamic): Dynamic => input.src,
              ),
              value658: Dynamic = deps.value73.current.annotations ?? [],
              value659: Dynamic =
                value658.length + items2.length <=
                PlatformFileContentLimit_5,
              value660: Dynamic = value659
                ? deps.callback9(
                    items2.map((input?: Dynamic): Dynamic => {
                      let { page: spec, ...spec2 }: Dynamic = input.spec,
                        value661: Dynamic = (0,
                        annotationVisibleBounds)(input.spec);
                      return {
                        src: {
                          ...spec2,
                          ...deps.callback3(),
                        },
                        x: value656.x + input.dx + (spec2.x - value661.x),
                        y: value656.y + input.dy + (spec2.y - value661.y),
                      };
                    }),
                  )
                : [];
            !value659 &&
              items2.length > 0 &&
              deps.showToast(
                (items4.length > 0
                  ? uiMessage("canvas.designCanvas.theArtboardsWerePastedThe")
                  : uiMessage("canvas.designCanvas.couldnTPaste")) +
                  " \u2014 this canvas is at its limit for notes and shapes (" +
                  String(PlatformFileContentLimit_5) +
                  ").",
                "error",
              );
            if (items4.length === 0 && value660.length === 0) return;
            let values: Dynamic = new Set(
              items4.map((input?: Dynamic): Dynamic => input.file),
            );
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
                  (input?: Dynamic): Dynamic => !values.has(input.file),
                ),
                ...items4,
              ],
              ...(value660.length > 0
                ? {
                    annotations: [...value658, ...value660],
                  }
                : {}),
            });
            deps.value413(
              {
                kind: "add",
                entries: items4.map(
                  (input?: Dynamic, options?: Dynamic): Dynamic => ({
                    file: input.file,
                    src: value657[options] ?? "",
                    spec: input,
                  }),
                ),
                ...(value660.length > 0
                  ? {
                      anns: value660,
                      get label() { return uiMessage("canvas.designCanvas.paste"); },
                    }
                  : {}),
              },
              values,
            );
            items4.length === 0 && deps.value62();
            deps.setSelection(
              (0, selectionFromBoards)({
                files: values,
                notes: new Set(
                  value660.map((input?: Dynamic): Dynamic => input.id),
                ),
              }),
            );
            items4.length > 0 &&
              (0, frameAnalyticsReporter)(
                designAnalyticsEvents.artboardInserted,
              );
            !context &&
              !deps.value345.current &&
              !deps.value218.current &&
              deps.value383.current(
                (0, pastedObjectsBounds)([
                  ...items4,
                  ...value660.map(annotationVisibleBounds),
                ]),
              );
          } catch (value654: Dynamic) {
            console.error("[design/paste]", value654);
            deps.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
          } finally {
            for (let value654 of items3 as Dynamic)
              deps.value461.current.delete(value654);
          }
        })();
      }

/** 复制到系统剪贴板前运行：把选中的画板与说明序列化为剪贴板数据，并检查体积、未上传文件与未保存修改。 */
function buildSystemClipboardPayload(deps: { readonly doc: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value73: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.value73.current.artboards,
          value653: Dynamic = (0, buildArtboardClipboard)(
            artboards.filter(
              (input2?: Dynamic): Dynamic => input.has(input2.file),
            ),
            artboards,
            deps.doc.content().files,
            getCachedBlobObjectUrl,
            (0, getExternalFileReferences)(),
          );
        if (!value653 && input.size > 0) return {};
        if (value653?.tooLarge) {
          deps.value188(
            uiMessage("canvas.designCanvas.copiedThisSelectionIsToo", { value1: String(String(ClipboardArtboardsResolvedValue >> 20)) }),
          );
          return {};
        }
        let value654: Dynamic = (deps.value73.current.annotations ?? []).filter(
            (input2?: Dynamic): Dynamic => options.has(input2.id),
          ),
          callback15: Dynamic = (input2?: Dynamic): Dynamic =>
            (0, getCachedBlobObjectUrl)(input2) ??
            ((0, fetchBlobAsset)(input2).catch((): Dynamic => {}),
            undefined),
          value655: Dynamic = (0, annotationClipboardEntries)(
            value654,
            value653?.origin ?? null,
            ClipboardArtboardsResolvedValue -
              (value653?.json.length ?? 0),
            !value653,
            {
              read: callback15,
              assets: value653?.clip.assets ?? {},
            },
          ),
          callback16: Dynamic = (input2?: Dynamic): Dynamic =>
            input2 === 1
              ? "Copied. One uploaded file wasn't read yet, so another canvas would go without it. Copy again in a moment."
              : uiMessage("canvas.designCanvas.copiedValue1UploadedFilesWeren", { value1: String(String(input2)) }),
          callback17: Dynamic = (input2?: Dynamic): Dynamic =>
            input2 === 1
              ? "Copied. One uploaded file can't travel to another canvas (only images, stylesheets, scripts, fonts and JSON under 4 MB do); add it again there."
              : uiMessage("canvas.designCanvas.copiedValue1UploadedFilesCan", { value1: String(String(input2)) }),
          { left: value656 }: Dynamic = value655;
        if (!value653) {
          value655.tooLarge
            ? deps.value188(
                value655.tooLarge === "bounds"
                  ? ClipboardFileTransferRegistry.tooManyNotesToCopy
                  : ClipboardFileTransferRegistry.tooLargeToCopy,
              )
            : value656.notRead > 0
              ? deps.value188(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    value656.notRead,
                  ),
                )
              : value656.cannot > 0
                ? deps.value188(
                    ClipboardFileTransferRegistry.picturesCantGo(
                      value656.cannot,
                    ),
                  )
                : value656.noRoom > 0
                  ? deps.value188(
                      ClipboardFileTransferRegistry.picturesWontFit(
                        value656.noRoom,
                      ),
                    )
                  : value656.overCap > 0 &&
                    deps.value188(
                      ClipboardFileTransferRegistry.picturesOverCap(
                        value656.overCap,
                      ),
                    );
          return {
            ...value655.fields,
            ...(Object.keys(value655.assets).length > 0
              ? {
                  assets: value655.assets,
                }
              : {}),
          };
        }
        let callback18: Dynamic = (input2?: Dynamic): Dynamic =>
            deps.value188(
              input2 +
                (value655.tooLarge
                  ? ClipboardFileTransferRegistry.notesStayedToo
                  : ""),
            ),
          length: Dynamic = value653.clip.artboards.filter(
            (input2?: Dynamic): Dynamic =>
              deps.value177.current
                .get(input2.stem + ".dc.html")
                ?.hasPendingEdits(),
          ).length;
        length > 0
          ? callback18(
              length === 1
                ? "Copied. One artboard has unsaved edits, so another canvas would get its last saved version. Click outside it, then copy again."
                : uiMessage("canvas.designCanvas.copiedValue1ArtboardsHaveUnsaved", { value1: String(String(length)) }),
            )
          : value653.missingAssets > 0
            ? callback18(
                callback16(value653.missingAssets + value656.notRead),
              )
            : value656.notRead > 0
              ? callback18(
                  ClipboardFileTransferRegistry.picturesNotReady(
                    value656.notRead,
                  ),
                )
              : value653.unsupportedAssets > 0
                ? callback18(
                    callback17(value653.unsupportedAssets + value656.cannot),
                  )
                : value656.cannot > 0
                  ? callback18(
                      ClipboardFileTransferRegistry.picturesCantGo(
                        value656.cannot,
                      ),
                    )
                  : value656.noRoom > 0
                    ? callback18(
                        ClipboardFileTransferRegistry.picturesWontFit(
                          value656.noRoom,
                        ),
                      )
                    : value655.tooLarge &&
                      deps.value188(
                        ClipboardFileTransferRegistry
                          .tooLargeBesideArtboards,
                      );
        return {
          ...value653.clip,
          assets: {
            ...value653.clip.assets,
            ...value655.assets,
          },
          ...value655.fields,
        };
      }

/** 粘贴来自系统剪贴板（可能来自其他画布）的画板、说明与图片时运行：解析数据、确认代码信任、迁移字体与图片等资源，再创建画板和图形并提示结果。 */
function pasteExternalClipboardPayload(deps: { readonly callback3: Dynamic; readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value105: Dynamic; readonly value109: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value310: Dynamic; readonly value345: Dynamic; readonly value369: Dynamic; readonly value383: Dynamic; readonly value413: Dynamic; readonly value464: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (!deps.value224.current) return;
        if (deps.value369.current) {
          deps.value188(ClipboardFileTransferRegistry.stillPasting);
          return;
        }
        let callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic =>
            input2.aborted
              ? uiMessage("canvas.designCanvas.pasteCancelledThisCanvasWas")
              : deps.value224.current
                ? options2 !== undefined &&
                  options2 !== "" &&
                  !(deps.value73.current.pages ?? []).some(
                    (input3?: Dynamic): Dynamic => input3.id === options2,
                  )
                  ? uiMessage("canvas.designCanvas.pasteCancelledThePageYou")
                  : null
                : uiMessage("canvas.designCanvas.pasteCancelledThisCanvasStopped"),
          callback16: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic => ({
            gate: validateCanvasPlacedImage,
            upload: (input3?: Dynamic): Dynamic =>
              (0, uploadDesignFile)("appifact", null, input3),
            stored: input2,
            discard: (input3?: Dynamic): Dynamic => {
              (0, getKvClient)()
                .delete((0, PlatformFileContentHandler_4)(input3))
                .catch((): Dynamic => false);
            },
            maxPixels: (0, ClipboardAssetsHandler)(options2),
          }),
          callback17: Dynamic = (
            items?: Dynamic,
            options2?: Dynamic,
            context?: Dynamic,
          ): Dynamic => {
            if (
              (deps.value73.current.annotations ?? []).length +
                items.length +
                options2.carried.length >
              PlatformFileContentLimit_5
            )
              return void deps.showToast(
                ClipboardFileTransferRegistry.atLimit,
                "error",
              );
            let current5: Dynamic = deps.value80.current,
              value657: Dynamic = deps.value105.rest(),
              controller2: Dynamic = new AbortController(),
              callback20: Dynamic = (): Dynamic => {};
            deps.value369.current = {
              ctrl: controller2,
              done: new Promise((input2?: Dynamic): Dynamic => {
                callback20 = input2;
              }),
            };
            (async (): Promise<Dynamic> => {
              let items2: Dynamic = [],
                flag2: Dynamic = false,
                callback21: Dynamic = async (
                  input2?: Dynamic,
                ): Promise<Dynamic> => {
                  for (let value658 of input2 as Dynamic)
                    await (0, getKvClient)()
                      .delete(
                        (0, PlatformFileContentHandler_4)(value658),
                      )
                      .catch((): Dynamic => false);
                };
              try {
                deps.value188(
                  ClipboardFileTransferRegistry.bringing(
                    options2.carried.length,
                  ),
                );
                let { landed: value658, failed: value659 }: Dynamic =
                    await (0, resolveClipboardPictures)(
                      options2.carried,
                      options2.assets,
                      controller2.signal,
                      callback16(
                        (input2?: Dynamic): Dynamic => items2.push(input2),
                        ClipboardAnnotationsLimit,
                      ),
                    ),
                  value660: Dynamic = callback15(
                    controller2.signal,
                    current5,
                  ),
                  { group: value661 }: Dynamic = (0,
                  normalizeAnnotationPasteOrigin)(
                    [...items, ...value658].sort(
                      (input2?: Dynamic, options3?: Dynamic): Dynamic =>
                        input2.order - options3.order,
                    ),
                  );
                if (value660 !== null || value661.length === 0) {
                  deps.value188(value660 ?? options2.said([], [], value659));
                  return void (await callback21(items2));
                }
                let value662: Dynamic =
                    current5 === ""
                      ? (deps.value73.current.pages?.[0]?.id ?? "")
                      : current5,
                  value663: Dynamic = (0, designPageContents)(
                    deps.value73.current,
                    value662,
                  ),
                  value664: Dynamic = context
                    ? (0, pastedObjectsOrigin)(value661, context)
                    : nextArtboardPlacementPoint([
                        ...value663.artboards,
                        ...(value663.annotations ?? []).map(
                          annotationVisibleBounds,
                        ),
                      ]),
                  value665: Dynamic = deps.value73.current.annotations ?? [],
                  value666: Dynamic = value661.map(
                    (input2?: Dynamic): Dynamic => {
                      let value670: Dynamic = (0,
                      annotationVisibleBounds)(input2.spec);
                      return {
                        src: {
                          ...input2.spec,
                          ...deps.callback3(current5),
                        },
                        x:
                          value664.x +
                          input2.dx +
                          (input2.spec.x - value670.x),
                        y:
                          value664.y +
                          input2.dy +
                          (input2.spec.y - value670.y),
                      };
                    },
                  ),
                  value667: Dynamic =
                    value665.length + value666.length <=
                    PlatformFileContentLimit_5,
                  value668: Dynamic = value667 ? deps.callback9(value666) : [];
                if (
                  !value667 ||
                  !(0, ClipboardPastePlanningAnnotations)(
                    deps.value73.current,
                    value668,
                  )
                ) {
                  deps.showToast(
                    value667
                      ? ClipboardFileTransferRegistry.wontFitPictures
                      : ClipboardFileTransferRegistry.atLimit,
                    "error",
                  );
                  return void (await callback21(items2));
                }
                flag2 = true;
                deps.value98({
                  artboards: deps.value73.current.artboards,
                  annotations: [...value665, ...value668],
                });
                let files: Dynamic = deps.doc.content().files;
                deps.value413(
                  {
                    kind: "add",
                    entries: [],
                    anns: value668,
                    get label() { return uiMessage("canvas.designCanvas.paste"); },
                    files: items2
                      .filter(
                        (input2?: Dynamic): Dynamic =>
                          typeof files[input2] == "string",
                      )
                      .map(
                        (input2?: Dynamic): Dynamic => ({
                          path: input2,
                          src: files[input2],
                        }),
                      ),
                  },
                  new Set(),
                );
                deps.value80.current === value662 &&
                  (deps.value62(),
                  deps.setSelection(
                    (0, selectionFromBoards)({
                      files: new Set(),
                      notes: new Set(
                        value668.map(
                          (input2?: Dynamic): Dynamic => input2.id,
                        ),
                      ),
                    }),
                  ),
                  !context &&
                    !deps.value345.current &&
                    !deps.value218.current &&
                    (0, sameViewport)(deps.value105.rest(), value657) &&
                    deps.value383.current(
                      (0, pastedObjectsBounds)(
                        value668.map(annotationVisibleBounds),
                      ),
                    ));
                let value669: Dynamic = options2.said(
                  value668,
                  value658,
                  value659,
                );
                deps.value80.current === value662 &&
                (0, ClipboardFileTransferPasted)(value669, value668)
                  ? deps.value189(value669)
                  : deps.value188(value669);
              } catch (value658: Dynamic) {
                console.error("[design/paste]", value658);
                flag2 || (await callback21(items2));
                deps.showToast(uiMessage("canvas.designCanvas.couldnTPaste2"), "error");
              } finally {
                deps.value369.current = null;
                callback20();
              }
            })();
          };
        if (!(0, ClipboardStateIsArray)(input)) {
          let value657: Dynamic = (0, parseAnnotationPaste)(
            input,
            (items?: Dynamic): Dynamic =>
              (0, ClipboardPastePlanningAnnotations)(
                deps.value73.current,
                items.map(
                  (input2?: Dynamic): Dynamic => ({
                    ...input2,
                    ...deps.callback3(),
                  }),
                ),
                128 * items.length,
              ),
          );
          if (value657.land === null)
            value657.error
              ? deps.showToast(value657.say, "error")
              : deps.value188(value657.say);
          else if (value657.pictures !== undefined)
            callback17(value657.land, value657.pictures, deps.value109());
          else {
            let current5: Dynamic = deps.value73.current;
            deps.value464.current(
              [],
              (0, normalizeAnnotationPasteOrigin)(value657.land)
                .group,
              deps.value109(),
            );
            if (deps.value73.current === current5) return;
            (0, ClipboardFileTransferPasted)(
              value657.say,
              value657.land.map((input2?: Dynamic): Dynamic => input2.spec),
            )
              ? deps.value189(value657.say)
              : deps.value188(value657.say);
          }
          return;
        }
        let value653: Dynamic = (0, ClipboardPastePlanningIsArray)(
            input,
          )
            ? ClipboardFileTransferRegistry.notEither
            : "",
          value654: Dynamic = (0, parseArtboardClipboard)(input);
        if (!value654) {
          deps.value188(
            uiMessage("canvas.designCanvas.nothingToPasteTheCopied") +
              value653,
          );
          return;
        }
        let callback18: Dynamic = (items?: Dynamic): Dynamic =>
            items.length > 60 ? items.slice(0, 57) + "\u2026" : items,
          current4: Dynamic = deps.value80.current,
          value655: Dynamic = deps.value105.rest(),
          value656: Dynamic = (0, pasteCascadeStep)(
            deps.value105.get().scale,
          ),
          controller: Dynamic = new AbortController(),
          callback19: Dynamic = (): Dynamic => {};
        deps.value369.current = {
          ctrl: controller,
          done: new Promise((input2?: Dynamic): Dynamic => {
            callback19 = input2;
          }),
        };
        (async (): Promise<Dynamic> => {
          let items: Dynamic = [];
          try {
            let value657: Dynamic = (await (0, awaitFeatureFlag)(
              crossCanvasPasteConfirmFeatureFlag,
              true,
            ))
              ? await (0, askTrustForCodePaste)(
                  value654.artboards.length,
                  controller.signal,
                )
              : "with-code";
            if (value657 === "cancel") return;
            let value658: Dynamic = callback15(controller.signal);
            if (value658 !== null) return deps.value188(value658);
            let value659: Dynamic = value657 === "with-code",
              value660: Dynamic = (0, parseAnnotationClipboard)(
                input,
              ),
              value661: Dynamic = (0, buildAnnotationPaste)(
                value660?.entries ?? [],
                value659,
                value660?.pictures ?? [],
              ),
              value662: Dynamic = value659
                ? value654
                : (0, blankArtboardBody)(value654),
              value663: Dynamic =
                (deps.value73.current.annotations ?? []).length +
                  value661.land.length +
                  value661.pictures.length <=
                PlatformFileContentLimit_5,
              value664: Dynamic = value663
                ? (0, parseClipboardAssets)(
                    input,
                    value661.pictures,
                    (0, clipboardPayloadUsage)(value654),
                  )
                : new Map(),
              items2: Dynamic = [],
              value665: Dynamic = value659
                ? 0
                : Object.keys(value654.files).filter(
                    (input2?: Dynamic): Dynamic => /\.svg$/i.test(input2),
                  ).length +
                  Object.values(value654.assets).filter(
                    (input2?: Dynamic): Dynamic =>
                      /^data:image\/svg\+xml/i.test(input2),
                  ).length,
              callback20: Dynamic = (): Dynamic =>
                (0, hasPendingFileOverlay)()
                  ? new Set(
                      [
                        ...Object.keys((0, getDesignSystemFiles)()),
                        ...(0, getAllFileReferencePaths)(),
                      ].map(
                        (input2?: Dynamic): Dynamic =>
                          input2.startsWith(ProjectValue)
                            ? input2.slice(ProjectValue.length)
                            : input2,
                      ),
                    )
                  : "unknown",
              callback21: Dynamic = (
                input2?: Dynamic,
                options2?: Dynamic,
              ): Dynamic =>
                Object.keys(options2).length +
                  input2.boards.length +
                  Object.keys(input2.files).length >
                PlatformFileContentFilesValue,
              value666: Dynamic = (0, getDocumentFileCap)(deps.doc),
              value667: Dynamic = (0, preparePastedArtboardFiles)(
                value662,
                deps.doc.content().files,
                deps.supportsLoadState,
                callback20(),
                value666,
              );
            if (callback21(value667, deps.doc.content().files)) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }) +
                  value653,
                "error",
              );
              return;
            }
            let items3: Dynamic = [
                ...Object.entries(value662.assets).map(
                  ([input2, input3]: Dynamic): Dynamic => [
                    input2,
                    input3,
                    "asset",
                  ],
                ),
                ...Object.entries(value667.images).map(
                  ([input2, input3]: Dynamic): Dynamic => [
                    input2,
                    input3,
                    "image",
                  ],
                ),
              ],
              value668: Dynamic = items3.map(
                ([, input2, input3]: Dynamic): Dynamic =>
                  input3 === "asset" &&
                  (0, ClipboardArtboardsTest_2)(input2),
              ),
              items4: Dynamic = [
                ...items3.filter(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    !value668[options2],
                ),
                ...items3.filter(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                    value668[options2],
                ),
              ],
              entries: Dynamic = new Map(),
              entries2: Dynamic = new Map(),
              items5: Dynamic = [],
              values: Dynamic = new Set(),
              entries3: Dynamic = new Map(),
              values2: Dynamic = new Set(),
              value669: Dynamic = value662.fontsLeftOut ?? 0,
              callback22: Dynamic = async (
                input2?: Dynamic,
              ): Promise<Dynamic> => {
                let value695: Dynamic = await (0,
                getAssetsCapability)();
                if (value695 === null || typeof value695.upload != "function")
                  return;
                let value696: Dynamic = input2.type.split(";")[0].trim(),
                  value697: Dynamic = await value695.upload(
                    new Blob([input2], {
                      type: value696,
                    }),
                    {
                      type: value696,
                    },
                  ),
                  value698: Dynamic =
                    typeof value697?.url == "string" &&
                    (0, isBlobAssetUrl)(value697.url)
                      ? value697.url
                      : typeof value697?.id == "string"
                        ? "_blob/" + value697.id
                        : undefined;
                return value698 !== undefined &&
                  (0, isBlobAssetUrl)(value698)
                  ? value698
                  : undefined;
              },
              value670: Dynamic = items4.length + value664.size;
            if (value670 > 0) {
              let length3: Dynamic = value667.boards.length;
              deps.value188(
                (length3 === 1
                  ? uiMessage("canvas.designCanvas.pastingAnArtboard")
                  : uiMessage("canvas.designCanvas.pastingValue1Artboards", { value1: String(String(length3)) })) +
                  `, bringing over ${String(value670)} file${value670 === 1 ? "" : "s"}\u2026`,
              );
            }
            if (items4.length > 0) {
              let index: Dynamic = 0,
                callback27: Dynamic = async (): Promise<Dynamic> => {
                  for (
                    let value695: Dynamic = index++;
                    value695 < items4.length && !controller.signal.aborted;
                    value695 = index++
                  ) {
                    let [value696, value697, value698]: Dynamic =
                      items4[value695];
                    if (
                      value698 === "asset" &&
                      (0, ClipboardArtboardsTest_2)(value697)
                    ) {
                      let value701: Dynamic = await (0,
                      dataUrlToFontFile)(
                        value697,
                        "pasted-font-" + String(value695 + 1),
                      );
                      if (controller.signal.aborted) break;
                      let value702: Dynamic = value701
                        ? await callback22(value701).catch((): Dynamic => {})
                        : undefined;
                      value702 === undefined
                        ? (value669 += 1)
                        : entries.set(
                            value696,
                            value702.startsWith("blob:")
                              ? value702
                              : "/" + value702.replace(/^\//, ""),
                          );
                      continue;
                    }
                    let value699: Dynamic = (0, dataUrlToBlob)(
                      value697,
                      value698 === "asset"
                        ? "pasted-image-" + String(value695 + 1)
                        : (value696.split("/").pop() ?? value696).replace(
                            /\.[^.]+$/,
                            "",
                          ),
                    );
                    if (
                      value698 === "asset" &&
                      (0, ClipboardArtboardsTest)(value697)
                    ) {
                      let value701: Dynamic = value699
                        ? await callback22(value699).catch((): Dynamic => {})
                        : undefined;
                      value701 === undefined || !value699
                        ? values2.add(value696)
                        : (entries.set(
                            value696,
                            value701.startsWith("blob:")
                              ? value701
                              : "/" + value701.replace(/^\//, ""),
                          ),
                          entries3.set(value696, {
                            bytes: value699.size,
                            type: value699.type.split(";")[0].trim(),
                          }));
                      continue;
                    }
                    if (
                      !value699 ||
                      !(await (0, isPlayableImage)(value699))
                    ) {
                      values.add(value696);
                      continue;
                    }
                    if (controller.signal.aborted) break;
                    let value700: Dynamic = value697;
                    try {
                      value700 = (
                        await (0, uploadDesignFile)(
                          "appifact",
                          null,
                          value699,
                        )
                      ).src;
                      value700.startsWith("./") &&
                        (items5.push(value700.slice(2)),
                        items.push(value700.slice(2)));
                    } catch {}
                    (value698 === "asset" ? entries : entries2).set(
                      value696,
                      value700,
                    );
                  }
                };
              await Promise.all(
                Array.from(
                  {
                    length: Math.min(4, items4.length),
                  },
                  callback27,
                ),
              );
            }
            let value671: Dynamic = value663
                ? await (0, resolveClipboardPictures)(
                    value661.pictures,
                    value664,
                    controller.signal,
                    callback16((input2?: Dynamic): Dynamic => {
                      items2.push(input2);
                      items5.push(input2);
                      items.push(input2);
                    }, ClipboardArtboardsLimit),
                  )
                : {
                    landed: [],
                    failed: 0,
                  },
              callback23: Dynamic = (
                input2?: Dynamic,
                options2?: Dynamic,
              ): Dynamic =>
                (/\.([^./]+)$/.exec(input2)?.[1] ?? "").toLowerCase() +
                ":" +
                options2,
              values3: Dynamic = new Set();
            for (let [value695, value696] of Object.entries(
              value662.files,
            ) as Dynamic) {
              if (controller.signal.aborted) break;
              if (
                !PlatformFileContentWebpAvifPattern.test(value695) ||
                entries2.has(value695) ||
                values.has(value695)
              )
                continue;
              let value697: Dynamic = (0, dataUrlToBlob)(
                (0, fileDataUrl)(value695, value696),
                "carried",
              );
              (!value697 ||
                !(await (0, isPlayableImage)(value697))) &&
                values3.add(callback23(value695, value696));
            }
            let callback24: Dynamic = async (): Promise<Dynamic> => {
                for (let value695 of items.splice(0) as Dynamic)
                  await (0, getKvClient)()
                    .delete(
                      (0, PlatformFileContentHandler_4)(value695),
                    )
                    .catch((): Dynamic => false);
              },
              value672: Dynamic = callback15(controller.signal, current4);
            if (value672 !== null) {
              deps.value188(value672);
              return void (await callback24());
            }
            value667 = (0, preparePastedArtboardFiles)(
              value662,
              deps.doc.content().files,
              deps.supportsLoadState,
              callback20(),
              value666,
            );
            if (callback21(value667, deps.doc.content().files)) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteThisCanvas", { value1: String(String(PlatformFileContentFilesValue)) }) +
                  value653,
                "error",
              );
              return void (await callback24());
            }
            for (let [value695, value696] of Object.entries(
              value667.images,
            ) as Dynamic)
              entries2.has(value695) ||
                values.has(value695) ||
                (values3.has(callback23(value695, value662.files[value695]))
                  ? values.add(value695)
                  : entries2.set(value695, value696));
            let values4: Dynamic = new Set(
              Object.keys(deps.doc.content().files).map(
                (input2?: Dynamic): Dynamic => input2.toLowerCase(),
              ),
            );
            for (let value695 of values as Dynamic)
              value695 in value667.images &&
                values4.has(value695.toLowerCase()) &&
                entries2.set(
                  value695,
                  value695.replace(/(\.[^./]*)?$/, "-missing$1"),
                );
            (0, remapPastedAssetFiles)(
              value667,
              entries,
              entries2,
              value666,
            );
            let value673: Dynamic = new TextEncoder(),
              value674: Dynamic = value667.boards.filter(
                (input2?: Dynamic): Dynamic =>
                  value673.encode(input2.entry.src).length <=
                  PlatformFileContentResolvedValue_11,
              ),
              value675: Dynamic = value667.boards.length - value674.length;
            if (value674.length === 0) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTPasteEveryCopied") +
                  value653,
                "error",
              );
              return void (await callback24());
            }
            for (let [value695, value696] of Object.entries(
              value667.files,
            ) as Dynamic) {
              let value697: Dynamic =
                value673.encode(value696).length > value666
                  ? "too large once its images were inlined"
                  : PlatformFileContentWebpAvifPattern.test(
                        value695,
                      ) && values3.has(callback23(value695, value696))
                    ? "not an image the editor can decode"
                    : null;
              value697 !== null &&
                (delete value667.files[value695],
                value667.dropped.push({
                  path: value695,
                  why: value697,
                }));
            }
            deps.value310.current = true;
            for (let [value695, value696] of Object.entries(
              value667.files,
            ) as Dynamic) {
              await (0, getKvClient)().set(
                (0, PlatformFileContentHandler_4)(value695),
                value696,
              );
              items.push(value695);
            }
            let value676: Dynamic =
                current4 === ""
                  ? (deps.value73.current.pages?.[0]?.id ?? "")
                  : current4,
              artboards: Dynamic = (0, designPageContents)(
                deps.value73.current,
                value676,
              ).artboards,
              value677: Dynamic = value674.map(
                (input2?: Dynamic): Dynamic => input2.entry,
              ),
              value678: Dynamic = [...value661.land, ...value671.landed].sort(
                (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                  input2.order - options2.order,
              ),
              { group: value679, shift: value680 }: Dynamic = (0,
              normalizeAnnotationPasteOrigin)([
                ...value677,
                ...value678,
              ]),
              value681: Dynamic = options
                ? (0, pastedObjectsOrigin)(value679, options)
                : nextArtboardPlacementPoint(
                    value678.length > 0
                      ? [
                          ...artboards,
                          ...(
                            (0, designPageContents)(
                              deps.value73.current,
                              value676,
                            ).annotations ?? []
                          ).map(annotationVisibleBounds),
                        ]
                      : artboards,
                  ),
              state: Dynamic = {
                x: value681.x + value680.x,
                y: value681.y + value680.y,
              },
              value682: Dynamic = options
                ? (0, avoidPastedObjectCollisions)(
                    state,
                    value677,
                    artboards,
                    value656,
                  )
                : state,
              items6: Dynamic = [];
            for (let {
              path: value695,
              entry: value696,
            } of value674 as Dynamic) {
              await (0, getKvClient)().set(
                (0, PlatformFileContentHandler_4)(value695),
                value696.src,
              );
              items.push(value695);
              let value697: Dynamic =
                  value696.title ??
                  value696.stem.split("/").pop() ??
                  value696.stem,
                value698: Dynamic = [...artboards, ...items6].some(
                  (input2?: Dynamic): Dynamic =>
                    (input2.title ??
                      input2.file.replace(/\.dc\.html$/, "")) === value697,
                );
              items6.push({
                file: value695,
                x: Math.round(value682.x + value696.dx),
                y: Math.round(value682.y + value696.dy),
                w: value696.w,
                h: value696.h,
                title: value698
                  ? (0, duplicateArtboardTitle)(value697, [
                      ...artboards,
                      ...items6,
                    ])
                  : value697,
                ...(0, artboardAppearanceProperties)(value696),
                ...deps.callback3(current4),
              });
            }
            let values5: Dynamic = new Set(
                items6.map((input2?: Dynamic): Dynamic => input2.file),
              ),
              items7: Dynamic = [
                ...deps.value73.current.artboards.filter(
                  (input2?: Dynamic): Dynamic => !values5.has(input2.file),
                ),
                ...items6,
              ],
              value683: Dynamic = deps.value73.current.annotations ?? [],
              value684: Dynamic = value678.map(
                (input2?: Dynamic): Dynamic => {
                  let value695: Dynamic = (0,
                  annotationVisibleBounds)(input2.spec);
                  return {
                    src: {
                      ...input2.spec,
                      ...deps.callback3(current4),
                    },
                    x: value682.x + input2.dx + (input2.spec.x - value695.x),
                    y: value682.y + input2.dy + (input2.spec.y - value695.y),
                  };
                },
              ),
              value685: Dynamic =
                value663 &&
                value684.length > 0 &&
                value683.length + value684.length <=
                  PlatformFileContentLimit_5
                  ? deps.callback9(value684)
                  : [],
              value686: Dynamic =
                value685.length > 0 &&
                (0, ClipboardPastePlanningAnnotations)(
                  {
                    ...deps.value73.current,
                    artboards: items7,
                  },
                  value685,
                )
                  ? value685
                  : [];
            items.length = 0;
            deps.value98({
              artboards: items7,
              ...(value686.length > 0
                ? {
                    annotations: [...value683, ...value686],
                  }
                : {}),
            });
            let files: Dynamic = deps.doc.content().files;
            deps.value413(
              {
                kind: "add",
                entries: items6.map(
                  (input2?: Dynamic, options2?: Dynamic): Dynamic => ({
                    file: input2.file,
                    src: value674[options2].entry.src,
                    spec: input2,
                  }),
                ),
                files: [
                  ...Object.entries(value667.files).map(
                    ([input2, input3]: Dynamic): Dynamic => ({
                      path: input2,
                      src: input3,
                    }),
                  ),
                  ...items5
                    .filter(
                      (input2?: Dynamic): Dynamic =>
                        typeof files[input2] == "string" &&
                        (value686.length > 0 || !items2.includes(input2)),
                    )
                    .map(
                      (input2?: Dynamic): Dynamic => ({
                        path: input2,
                        src: files[input2],
                      }),
                    ),
                ],
                ...(value686.length > 0
                  ? {
                      anns: value686,
                      get label() { return uiMessage("canvas.designCanvas.paste"); },
                    }
                  : {}),
              },
              values5,
            );
            if (value686.length === 0)
              for (let value695 of items2 as Dynamic)
                await (0, getKvClient)()
                  .delete((0, PlatformFileContentHandler_4)(value695))
                  .catch((): Dynamic => false);
            deps.value80.current === value676 &&
              deps.setSelection(
                value686.length > 0
                  ? (0, selectionFromBoards)({
                      files: values5,
                      notes: new Set(
                        value686.map(
                          (input2?: Dynamic): Dynamic => input2.id,
                        ),
                      ),
                    })
                  : (0, selectionFromArtboards)(values5),
              );
            items6.length > 0 &&
              (0, frameAnalyticsReporter)(
                designAnalyticsEvents.artboardInserted,
              );
            !options &&
              deps.value80.current === value676 &&
              !deps.value345.current &&
              !deps.value218.current &&
              (0, sameViewport)(deps.value105.rest(), value655) &&
              deps.value383.current((0, pastedObjectsBounds)(items6));
            let value687: Dynamic = Object.entries(
                value662.held ?? {},
              ).filter(
                (
                  [input2]: Dynamic,
                  options2?: Dynamic,
                  context?: Dynamic,
                ): Dynamic =>
                  context.findIndex(
                    ([input3]: Dynamic): Dynamic =>
                      input3.toLowerCase() === input2.toLowerCase(),
                  ) === options2,
              ),
              values6: Dynamic = new Set(
                [
                  ...Object.keys(deps.doc.content().files),
                  ...(0, getAllFileReferencePaths)(),
                ].map((input2?: Dynamic): Dynamic => input2.toLowerCase()),
              ),
              callback25: Dynamic = (input2?: Dynamic): Dynamic =>
                !(0, hasPendingFileOverlay)() ||
                values6.has(input2.toLowerCase());
            deps.value224.current &&
              (await Promise.all(
                value687.map(
                  async ([input2, input3]: Dynamic): Promise<Dynamic> => {
                    let entry: Dynamic = entries.get(input3),
                      entry2: Dynamic = entries3.get(input3);
                    if (entry === undefined || entry2 === undefined) return;
                    let value695: Dynamic = (0,
                    saveExternalFileReference)(
                      input2,
                      entry,
                      entry2.bytes,
                      entry2.type,
                      callback25,
                    );
                    await Promise.race([
                      value695,
                      new Promise(
                        (input4?: Dynamic, options2?: Dynamic): Dynamic =>
                          setTimeout(
                            (): Dynamic =>
                              options2(new Error("no answer from the store")),
                            8e3,
                          ),
                      ),
                    ]).catch((input4?: Dynamic): Dynamic => {
                      console.warn(
                        "design (paste): the pointer document for " +
                          input2 +
                          " was not written \u2014 " +
                          (0, errorMessage)(input4),
                      );
                      value667.dropped.push({
                        path: input2,
                        why: "its upload came over, but could not be recorded here",
                      });
                    });
                  },
                ),
              ));
            let entries4: Dynamic = new Map();
            for (let value695 of values2 as Dynamic) {
              let value696: Dynamic = value687
                .filter(([, input2]: Dynamic): Dynamic => input2 === value695)
                .map(([input2]: Dynamic): Dynamic => input2);
              for (let value699 of value696 as Dynamic)
                value667.dropped.push({
                  path: value699,
                  why: "this canvas would not take the upload",
                });
              let value697: Dynamic = value662.assets[value695] ?? "",
                value698: Dynamic = /^data:text\/css/i.test(value697)
                  ? "stylesheet"
                  : /^data:text\/javascript/i.test(value697)
                    ? "script"
                    : "data file";
              value696.length === 0 &&
                entries4.set(value698, (entries4.get(value698) ?? 0) + 1);
            }
            for (let [value695, value696] of entries4 as Dynamic)
              value667.dropped.push({
                path:
                  value696 === 1
                    ? "a " + value695
                    : String(value696) + " " + value695 + "s",
                why: "this canvas would not take the upload",
              });
            let items8: Dynamic = [
                ...Object.keys(
                  (0, mergeDesignSystemFileOverlay)(
                    deps.doc.content().files,
                  ),
                ),
                "support.js",
              ],
              value688: Dynamic = [
                ...new Set(
                  value674.flatMap(
                    (input2?: Dynamic): Dynamic =>
                      (0, getLinkedProjectFiles)(
                        input2.entry.src,
                        items8,
                      ),
                  ),
                ),
              ].map(callback18),
              length: Dynamic = items6.length,
              callback26: Dynamic = (input2?: Dynamic): Dynamic =>
                input2.path.split("/").pop() ?? input2.path,
              value689: Dynamic =
                value667.dropped.length === 0
                  ? ""
                  : value667.dropped.every(
                        (input2?: Dynamic): Dynamic =>
                          input2.why === value667.dropped[0].why,
                      )
                    ? `; ${callback18(value667.dropped.map(callback26).join(", "))} left out (${value667.dropped[0].why})`
                    : `; left out: ${value667.dropped
                          .slice(0, 3)
                          .map(
                            (input2?: Dynamic): Dynamic =>
                              `${callback18(callback26(input2))} (${input2.why})`,
                          )
                          .join(
                            ", ",
                          )}${value667.dropped.length > 3 ? "\u2026" : ""}`,
              value690: Dynamic =
                (length === 1
                  ? uiMessage("canvas.designCanvas.pastedAnArtboard")
                  : uiMessage("canvas.designCanvas.pastedValue1Artboards", { value1: String(String(length)) })) +
                (value686.length > 0
                  ? ClipboardFileTransferRegistry.withObjects(
                      value686,
                    )
                  : "") +
                " from another canvas" +
                (value659
                  ? ""
                  : ClipboardTrustDialogTitleMessageKeepCodeConfig.dropped(
                      length,
                    )),
              value691: Dynamic = value660?.leftOut ?? 0,
              value692: Dynamic =
                value671.failed + (value660?.unreadPictures ?? 0),
              length2: Dynamic = value671.landed.filter(
                (input2?: Dynamic): Dynamic =>
                  value661.plainPictures.has(input2.spec.id),
              ).length,
              value693: Dynamic =
                (value660?.pictures.length ?? 0) +
                (value660?.unreadPictures ?? 0),
              value694: Dynamic =
                (value675 > 0
                  ? `; ${String(value675)} left out (over 2 MiB with images inlined)`
                  : "") +
                value689 +
                (value665 > 0
                  ? `; ${value665 === 1 ? "1 SVG image" : `${String(value665)} SVG images`} left out (Paste with code keeps ${value665 === 1 ? "it" : "them"})`
                  : "") +
                (value669 > 0
                  ? `; ${value669 === 1 ? "1 font" : `${String(value669)} fonts`} did not come across, so some text may show in a different font`
                  : "") +
                (!value663 || value684.length > value686.length
                  ? ClipboardFileTransferRegistry.notLanded
                  : value653 !== "" &&
                      (value660?.entries.length ?? 0) + value693 === 0
                    ? ClipboardFileTransferRegistry.notRead
                    : (value660?.unread ?? 0) > 0
                      ? ClipboardFileTransferRegistry.someUnread(
                          value660?.unread ?? 0,
                        )
                      : value653 === "" &&
                          (0, ClipboardPastePlanningHandler)(input)
                        ? ClipboardFileTransferRegistry.stayedBehind
                        : "") +
                (value661.notesOut > 0
                  ? ClipboardFileTransferRegistry.notesTooMuch
                  : "") +
                (value686.length > 0 && value661.plain > 0
                  ? ClipboardFileTransferRegistry.plainShapes(
                      value661.plain,
                    )
                  : "") +
                (value686.length > 0 && length2 > 0
                  ? ClipboardFileTransferRegistry.plainPictures(
                      length2,
                      true,
                    )
                  : "") +
                (value692 > 0
                  ? ClipboardFileTransferRegistry.notBrought(value692)
                  : "") +
                ClipboardFileTransferRegistry.leftOutCaveat(
                  value691,
                  value660?.videos ?? 0,
                ) +
                (value688.length > 0
                  ? `. It loads ${value688.slice(0, 3).join(", ")}${value688.length > 3 ? "\u2026" : ""}, which this canvas doesn't have. Publish that here for it to render as designed.`
                  : "");
            value694 ? deps.value188(value690 + value694) : deps.value189(value690);
          } catch (value657: Dynamic) {
            for (let value658 of items as Dynamic)
              await (0, getKvClient)()
                .delete((0, PlatformFileContentHandler_4)(value658))
                .catch((): Dynamic => false);
            deps.showToast(
              (0, fileCapFailureMessage)(value657) ??
                uiMessage("canvas.designCanvas.couldnTPasteTheArtboards") +
                  (0, errorMessage)(value657),
              "error",
            );
          } finally {
            deps.value369.current = null;
            callback19();
          }
        })();
      }

/** 粘贴文本或 HTML 时运行：清理内容后插入目标画板的指定位置；没有目标画板时新建画板承载。 */
function pasteHtmlIntoArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value224: Dynamic; readonly value313: Dynamic; readonly value62: Dynamic; readonly value87: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        if (!deps.value224.current) return;
        let value653: Dynamic = options.trim(),
          value654: Dynamic =
            value653 || ((0, getElementClipboard)() ?? "").trim();
        if (!value654) {
          deps.value188(
            uiMessage("canvas.designCanvas.nothingToPasteHereCopy"),
          );
          return;
        }
        let callback15: Dynamic = (input2?: Dynamic): Dynamic =>
          value653.startsWith("<")
            ? (0, sanitizePastedHtml)(input2)
            : input2;
        if (input.file == null) {
          let value657: Dynamic = (0, wrapInlinePastedHtml)(
            callback15(
              value654.startsWith("<")
                ? (0, normalizeAuthoredHtml)(value654)
                : (0, textToParagraphHtml)(
                    value654,
                    "margin: 0; position: absolute; left: 32px; top: 32px",
                  ),
            ),
          );
          if (!/<[a-z]/i.test(value657)) {
            deps.value188(
              uiMessage("canvas.designCanvas.nothingToPasteHereThe"),
            );
            return;
          }
          deps.value313(
            {
              x: Math.round(
                input.x - PlatformFileContentConstant_5 / 2,
              ),
              y: Math.round(
                input.y - PlatformFileContentConstant_6 / 2,
              ),
              w: PlatformFileContentConstant_5,
              h: PlatformFileContentConstant_6,
            },
            value657,
            {
              doneSay: "New artboard from the paste",
            },
          );
          return;
        }
        let file: Dynamic = input.file,
          value655: Dynamic = file.replace(/\.dc\.html$/, ""),
          entry: Dynamic = deps.value177.current.get(file),
          value656: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === file,
          );
        if (!entry || !value656) {
          deps.value188(
            uiMessage("canvas.designCanvas.couldnTPasteIntoValue1", { value1: String(value655) }),
          );
          return;
        }
        let [items, items2]: Dynamic = [
          input.x - value656.x,
          input.y - value656.y,
        ];
        (value654.startsWith("<")
          ? entry.insertHtml(callback15(value654), "stage", {
              ox: items,
              oy: items2,
            })
          : entry.insertLayerAt(
              {
                x: items,
                y: items2,
              },
              (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                (0, textToParagraphHtml)(
                  value654,
                  `margin: 0; position: absolute; left: ${input2}px; top: ${options2}px`,
                ),
              (): Dynamic => deps.value224.current,
              (input2?: Dynamic): Dynamic => {
                let entry2: Dynamic = deps.value177.current.get(file);
                return entry2 === entry
                  ? null
                  : entry2
                    ? entry2.insertHtml(input2, "stage")
                    : Promise.resolve(null);
              },
            )
        ).then((items3?: Dynamic): Dynamic => {
          if (items3 != null) {
            if (items3.length === 0) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotPasteNothingChanged"));
              return;
            }
            deps.abandonSelectionGesture();
            deps.value62();
            deps.setSelection(
              (0, setCanvasElementSelection)(
                emptyCanvasSelection,
                file,
                {
                  name: deps.value19(file),
                  tids: items3,
                  rect: null,
                  count: items3.length,
                },
                false,
              ),
            );
            deps.value189(uiMessage("canvas.designCanvas.pastedInto") + value655);
          }
        });
      }

/** 注册 keydown、copy、paste 监听：决定复制或粘贴走画板、画布说明还是元素剪贴板，并处理粘贴文件与图片拒绝。 */
function subscribeClipboardEvents(deps: { readonly doc: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly value105: Dynamic; readonly value109: Dynamic; readonly value111: Dynamic; readonly value112: Dynamic; readonly value113: Dynamic; readonly value120: Dynamic; readonly value159: Dynamic; readonly value160: Dynamic; readonly value224: Dynamic; readonly value448: Dynamic; readonly value463: Dynamic; readonly value464: Dynamic; readonly value466: Dynamic; readonly value468: Dynamic; readonly value470: Dynamic; readonly value471: Dynamic; readonly value472: Dynamic; readonly value473: Dynamic; readonly value474: Dynamic; readonly value475: Dynamic; readonly value48: Dynamic; readonly value52: Dynamic }): Dynamic {
    let callback15: Dynamic = (event?: Dynamic): Dynamic => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
        let value654: Dynamic = event.key.toLowerCase();
        if (
          (value654 !== "c" && value654 !== "v") ||
          (!deps.value224.current && value654 !== "c") ||
          (0, isEditingInputTarget)(event.target)
        )
          return;
        if (event.shiftKey) {
          value654 === "v" && (deps.value475.current = event.timeStamp);
          return;
        }
        value654 === "v" && (deps.value475.current = -1 / 0);
        if (value654 === "c") {
          let current4: Dynamic = deps.selectionRef.current;
          if (!(0, canvasElementSelectionCount)(current4)) {
            let value661: Dynamic =
              deps.focusedFileRef.current != null &&
              current4.elements.has(deps.focusedFileRef.current);
            if (!deps.value159.current && value661) return;
            if (deps.value48.current > 0) {
              let value662: Dynamic = (0, startClipboardMark)({
                markable: false,
              });
              deps.value52.current((): Dynamic => {
                deps.value160.current(value662);
              }, value662.drop);
              event.stopPropagation();
            } else deps.value160.current() && event.stopPropagation();
            return;
          }
          event.stopPropagation();
          if (event.repeat) return;
          let files: Dynamic = deps.doc.content().files;
          if (
            !(current4.artboards.size === 0
              ? current4.notes.size > 0
              : [...current4.artboards].some((input?: Dynamic): Dynamic => {
                  let value661: Dynamic = files[input];
                  return (
                    typeof value661 == "string" &&
                    !(0, isLoadingArtboardHtml)(value661)
                  );
                }))
          )
            return;
          let state: Dynamic = {
            files: new Set(current4.artboards),
            notes: new Set(current4.notes),
            mark: undefined,
          };
          deps.value472.current = state;
          deps.value463.current(
            state.files,
            state.notes,
            (): Dynamic => state.mark,
          );
          callback17();
          setTimeout((): Dynamic => {
            deps.value472.current === state && (deps.value472.current = null);
          }, 100);
          return;
        }
        if ((0, hasBlockingEditorOverlay)()) return;
        let value655: Dynamic = (0, getArtboardClipboard)(),
          value656: Dynamic = (0, getAnnotationClipboard)(),
          value657: Dynamic = deps.value109(),
          value658: Dynamic = value657?.overAnnotation ? null : value657,
          value659: Dynamic = value655
            ? deps.value112(value655, value656, value657, value658)
            : null;
        if (!value655 && !value658) return;
        event.stopPropagation();
        clearTimeout(deps.value474.current);
        let value660: Dynamic = (0, isClipboardSettling)();
        deps.value474.current = setTimeout((): Dynamic => {
          let value661: Dynamic =
            value660 || (0, isClipboardSettling)();
          (0, afterClipboardSettled)((): Dynamic => {
            if (!deps.value224.current) return;
            let value662: Dynamic = value661
                ? (0, getArtboardClipboard)()
                : value655,
              value663: Dynamic = value661
                ? (0, getAnnotationClipboard)()
                : value656,
              value664: Dynamic = value661 ? deps.value109() : value657,
              value665: Dynamic = value664?.overAnnotation ? null : value664;
            value662
              ? deps.value464.current(
                  value662,
                  value663,
                  value661
                    ? deps.value112(value662, value663, value664, value665)
                    : value659,
                )
              : value665 &&
                readCanvasClipboardText().then(
                  (input?: Dynamic): Dynamic =>
                    deps.value470.current(
                      value665,
                      (0, getActiveClipboardSource)({
                        text: input,
                        stamp: null,
                        hasImage: false,
                      }) === "text"
                        ? input
                        : "",
                    ),
                );
          });
        }, 100);
      },
      value653: Dynamic = null,
      callback16: Dynamic = (): Dynamic => {
        if (!value653) return;
        let value654: Dynamic = value653.__prev ?? null;
        value653.remove();
        value653 = null;
        value654 instanceof HTMLElement &&
          value654 !== (document as Dynamic).body &&
          value654.isConnected &&
          value654.focus({
            preventScroll: true,
          });
      },
      callback17: Dynamic = (): Dynamic => {
        callback16();
        let value654: Dynamic = (document as Dynamic).createElement(
          "textarea",
        );
        value654.__prev = (document as Dynamic).activeElement;
        value654.setAttribute("aria-hidden", "true");
        value654.value = " ";
        value654.style.cssText =
          "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0";
        (document as Dynamic).body.appendChild(value654);
        value654.focus({
          preventScroll: true,
        });
        value654.select();
        value653 = value654;
        setTimeout(callback16, 0);
      },
      callback18: Dynamic = (event?: Dynamic): Dynamic => {
        let current4: Dynamic = deps.value472.current;
        if (!event.isTrusted || current4 == null) return;
        deps.value472.current = null;
        let { stamp: value654, rendition: value655 }: Dynamic = deps.value473(
          current4.files,
          current4.notes,
        );
        event.preventDefault();
        event.stopImmediatePropagation();
        (0, writeClipboardObject)(event, DesignArtboardsKey, {
          data: {
            stamp: value654,
            ...deps.value466.current(current4.files, current4.notes),
          },
          text: value655,
        }) &&
          ((current4.mark = {
            stamp: value654,
            rendition: value655,
          }),
          (0, mirrorArtboardClipboardStamp)(value654, value655));
      },
      callback19: Dynamic = (event?: Dynamic): Dynamic => {
        clearTimeout(deps.value474.current);
        if (!deps.value224.current || event.timeStamp - deps.value475.current < 1e3)
          return;
        let items: Dynamic = [...(event.clipboardData?.files ?? [])],
          value654: Dynamic = items.filter(
            (input?: Dynamic): Dynamic =>
              (0, isImageFile)(input) ||
              (0, isVideoFile)(input),
          ),
          value655: Dynamic =
            event.clipboardData?.getData("text/plain") ?? "",
          value656: Dynamic = (0, readBoundedClipboardObject)(event),
          value657: Dynamic = (0, readArtboardClipboard)(value656),
          state: Dynamic = {
            text: value655,
            stamp: (0, clipboardObjectStamp)(value656),
            hasImage:
              value654.length > 0 &&
              (0, clipboardContainsFileNames)(items, value655),
            artboards: value657,
          },
          value658: Dynamic = (0, imagePasteRefusal)(
            event.target,
            (0, getActiveClipboardSource)(state) === "image",
            value655,
            value654.length > 0 && value654.every(isVideoFile)
              ? "video"
              : "image",
          );
        value658.to === "nobody" &&
          (event.preventDefault(),
          event.stopImmediatePropagation(),
          deps.value448.current(value658.say));
        if (value658.to !== "canvas") return;
        let value659: Dynamic = (0, isClipboardSettling)(),
          callback20: Dynamic = (input?: Dynamic): Dynamic => {
            value659
              ? (0, markConsumedClipboardStamp)(event)
              : (event.preventDefault(),
                input && event.stopImmediatePropagation());
          };
        (0, afterClipboardSettled)(
          (): Dynamic => {
            if (!deps.value224.current) return;
            let value660: Dynamic = (0, getActiveClipboardSource)(
                state,
              ),
              value661: Dynamic = (0, getArtboardClipboard)(),
              value662: Dynamic = (0, getAnnotationClipboard)(),
              value663: Dynamic = deps.value109(),
              value664: Dynamic = value663?.overAnnotation ? null : value663;
            if (value660 === "foreign-artboards") {
              callback20(false);
              deps.value468.current(value657, deps.value111());
              return;
            }
            let value665: Dynamic =
                value660 === "image" &&
                (value663 == null
                  ? deps.focusedFileRef.current == null
                  : value663.file == null)
                  ? deps.value113()
                  : null,
              value666: Dynamic =
                value660 === "image" && value665 == null ? value663 : null,
              value667: Dynamic =
                value660 === "image" &&
                value665 == null &&
                value666 == null &&
                deps.focusedFileRef.current == null;
            if (value661 && value660 === "artboards") {
              callback20(true);
              deps.value464.current(
                value661,
                value662,
                deps.value112(value661, value662, value663, value664),
              );
              return;
            }
            if (
              value665 == null &&
              value666 == null &&
              !value667 &&
              (value660 === "image" || value664 == null)
            )
              return;
            callback20(true);
            let {
                w: value668,
                h: value669,
                top: value670,
              }: Dynamic = deps.value120(),
              entry: Dynamic = deps.value105.get();
            if (value665 != null) {
              let value671: Dynamic = (0, visibleArtboardCenter)(
                value665,
                {
                  ...entry,
                  y: entry.y + value670 / entry.scale,
                  width: value668,
                  height: value669 - value670,
                },
              );
              deps.value471.current(
                value654,
                value671.x,
                value671.y,
                "pasted",
                value665.file,
              );
            } else
              value666 != null
                ? deps.value471.current(
                    value654,
                    value666.x,
                    value666.y,
                    "pasted",
                    value666.file ?? undefined,
                  )
                : value667
                  ? deps.value471.current(
                      value654,
                      entry.x + value668 / 2 / entry.scale,
                      entry.y + (value670 + value669) / 2 / entry.scale,
                      "pasted",
                    )
                  : deps.value470.current(
                      value664,
                      value660 === "text" ? value655 : "",
                    );
          },
          (): Dynamic => (0, markConsumedClipboardStamp)(event),
        );
      };
    (window as Dynamic).addEventListener("keydown", callback15, true);
    (window as Dynamic).addEventListener("copy", callback18, true);
    (window as Dynamic).addEventListener("paste", callback19, true);
    return (): Dynamic => {
      clearTimeout(deps.value474.current);
      callback16();
      (window as Dynamic).removeEventListener("keydown", callback15, true);
      (window as Dynamic).removeEventListener("copy", callback18, true);
      (window as Dynamic).removeEventListener("paste", callback19, true);
    };
  }

/** 导出或捕获画板前使用：临时关闭全屏播放，等预览布局稳定后执行任务，结束后在条件允许时恢复播放并还原焦点。 */
function runWithPlayPreviewClosed(deps: { readonly value106: Dynamic; readonly value177: Dynamic; readonly value270: Dynamic; readonly value271: Dynamic; readonly value275: Dynamic; readonly value297: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value387: Dynamic; readonly value392: Dynamic; readonly value488: Dynamic; readonly value87: Dynamic; readonly value92: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let value653: Dynamic = null,
          flag2: Dynamic = false,
          callback15: Dynamic = (): Dynamic => {
            flag2 = true;
          },
          callback16: Dynamic = (input2?: Dynamic): Dynamic => {
            for (let value654 of [
              "pointerdown",
              "wheel",
              "keydown",
            ] as Dynamic)
              input2
                ? deps.value106.current?.addEventListener(value654, callback15, {
                    capture: true,
                    passive: true,
                  })
                : deps.value106.current?.removeEventListener(
                    value654,
                    callback15,
                    true,
                  );
          },
          callback17: Dynamic = (input2?: Dynamic): Dynamic =>
            !flag2 &&
            deps.value346.current === null &&
            deps.value271.current === null &&
            !deps.value488() &&
            deps.value87.current.artboards.some(
              (input3?: Dynamic): Dynamic => input3.file === input2.file,
            ),
          callback18: Dynamic = (input2?: Dynamic): Dynamic => {
            if (
              value653 === null ||
              value653.isConnected ||
              ((document as Dynamic).activeElement !==
                (document as Dynamic).body &&
                (document as Dynamic).activeElement !== null)
            )
              return;
            let callback19: Dynamic = (input3?: Dynamic): Dynamic =>
                (document as Dynamic).querySelector(input3),
              value654: Dynamic =
                callback19('button[data-testid="mega-export"]') ??
                callback19('[data-testid="mega-export"] button') ??
                callback19('[data-testid="mega-collapse"]');
            value654
              ? value654.focus({
                  preventScroll: true,
                })
              : input2 > 0 &&
                requestAnimationFrame((): Dynamic => callback18(input2 - 1));
          };
        return (0, withClosedPreview)(
          {
            current: (): Dynamic => {
              let current4: Dynamic = deps.value387.current;
              return !deps.value92 || current4 === null
                ? null
                : input.some(
                      (input2?: Dynamic): Dynamic =>
                        input2.file !== current4.file,
                    )
                  ? {
                      ...current4,
                      playing: deps.value271.current === current4.file,
                    }
                  : null;
            },
            leave: (): Dynamic => {
              value653 =
                (document as Dynamic).hasFocus() &&
                (document as Dynamic).activeElement !==
                  (document as Dynamic).body
                  ? (document as Dynamic).activeElement
                  : null;
              deps.value297.current();
              callback16(true);
            },
            laidOut: async (): Promise<Dynamic> => {
              await new Promise(
                (input2?: Dynamic): Dynamic =>
                  setTimeout((): Dynamic => {
                    let value654: Dynamic = setTimeout(input2, 250);
                    requestAnimationFrame(
                      (): Dynamic =>
                        requestAnimationFrame(
                          (): Dynamic => (clearTimeout(value654), input2()),
                        ),
                    );
                  }, 0),
              );
              await Promise.all(
                input.map((input2?: Dynamic): Dynamic => {
                  let value654: Dynamic = deps.value177.current.get(input2.file)
                    ?.webviewRef.current;
                  return value654
                    ? (0, createPreviewHandle)(value654)
                        ?.awaitSettled(1500)
                        .catch((): Dynamic => {})
                    : undefined;
                }),
              );
            },
            mayReopen: callback17,
            reopen: ({ playing: playing, ...props }: Dynamic): Dynamic =>
              new Promise(
                (input2?: Dynamic): Dynamic =>
                  deps.value275((): Dynamic => {
                    input2();
                    callback16(false);
                    if (!callback17(props)) return;
                    deps.value392.current = props.file;
                    deps.value348(props);
                    playing && deps.value270(props.file);
                    requestAnimationFrame((): Dynamic => callback18(2));
                    let value654: Dynamic =
                      value653 !== null
                        ? (document as Dynamic).activeElement?.closest(
                            '[role="dialog"], [role="alertdialog"]',
                          )
                        : null;
                    if (value654) {
                      let observer: Dynamic = new MutationObserver(
                          (): Dynamic => {
                            value654.isConnected ||
                              (callback19(),
                              setTimeout((): Dynamic => callback18(2), 0));
                          },
                        ),
                        callback19: Dynamic = (): Dynamic => (
                          observer.disconnect(),
                          clearTimeout(value655)
                        ),
                        value655: Dynamic = setTimeout(callback19, 12e4);
                      observer.observe((document as Dynamic).body, {
                        childList: true,
                        subtree: true,
                      });
                    }
                  }),
              ),
          },
          options,
        ).finally((): Dynamic => callback16(false));
      }

/** 执行适应内容高度时运行：测量画板展开后的内容高度并调整画板尺寸，播报变高、变矮或已匹配等结果。 */
async function fitArtboardHeightToContent(deps: { readonly callback2: Dynamic; readonly editableRef: Dynamic; readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value399: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value495: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, items?: Dynamic, options?: Dynamic): Promise<Dynamic> {
        if (deps.value494()) {
          deps.showToast(exportAlreadyRunningMessage);
          return;
        }
        options?.();
        if (!deps.editableRef.current) {
          deps.showToast(
            uiMessage("canvas.designCanvas.thisCanvasIsReadOnly"),
          );
          return;
        }
        deps.value479(true);
        let value653: Dynamic =
            items.length === 1
              ? deps.value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === items[0],
                )
              : undefined,
          value654: Dynamic =
            items.length > 1
              ? deps.showToast(
                  uiMessage("canvas.designCanvas.measuring") + String(items.length) + " artboards\u2026",
                  "info",
                  {
                    pinned: true,
                  },
                )
              : value653 && (0, isFillPagedExport)(value653)
                ? deps.showToast(
                    uiMessage("canvas.designCanvas.measuring2") + deps.callback2(value653.file) + '"\u2026',
                    "info",
                    {
                      pinned: true,
                    },
                  )
                : undefined,
          items2: Dynamic = [],
          items3: Dynamic = [],
          flag2: Dynamic = false;
        try {
          await deps.value495(
            items.map(
              (input?: Dynamic): Dynamic => ({
                file: input,
              }),
            ),
            async (): Promise<Dynamic> => {
              for (let value656 of items as Dynamic) {
                let value657: Dynamic = deps.value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === value656,
                );
                items3.push(deps.callback2(value656));
                if (!value657 || !(0, needsPagedExport)(value657)) {
                  items2.push(value657 ? "keeps" : "gone");
                  continue;
                }
                let value658: Dynamic = await deps.value483(value656),
                  value659: Dynamic = value658
                    ? (0, createPreviewHandle)(value658)
                    : null;
                if (!value658 || !value659) {
                  items2.push(
                    deps.value87.current.artboards.some(
                      (input?: Dynamic): Dynamic => input.file === value656,
                    )
                      ? deps.value177.current.get(value656)?.isBlocked()
                        ? "stopped"
                        : "unmeasured"
                      : "gone",
                  );
                  continue;
                }
                if (value658.getBoundingClientRect().width === 0) {
                  items2.push("hidden");
                  continue;
                }
                let value660: Dynamic = await (0,
                  measureExpandedContentHeight)(value659, {
                    w: value657.w,
                    h: value657.h,
                  }),
                  value661: Dynamic =
                    typeof value660 == "number" &&
                    value660 <= value657.h + exportHeightTolerance &&
                    (0, isFillPagedExport)(value657)
                      ? await (0, measureFlowExportHeight)(value659, {
                          w: value657.w,
                          h: value657.h,
                        })
                      : undefined;
                if (!deps.editableRef.current) {
                  flag2 = true;
                  break;
                }
                let value662: Dynamic = deps.value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === value656,
                );
                if (
                  !value662 ||
                  !(0, needsPagedExport)(value662) ||
                  value662.w !== value657.w
                ) {
                  items2.push(
                    value662
                      ? value662.w !== value657.w
                        ? "unmeasured"
                        : "keeps"
                      : "gone",
                  );
                  continue;
                }
                if (value660 === null || value660 === "unsettled") {
                  items2.push(value660 === null ? "unmeasured" : "unsettled");
                  continue;
                }
                if (
                  value661 === "unsettled" ||
                  value661 === "empty" ||
                  value661 === null
                ) {
                  items2.push(
                    value661 === "unsettled"
                      ? "unsized"
                      : value661 === "empty"
                        ? "empty"
                        : "unmeasured",
                  );
                  continue;
                }
                if (
                  value661 !== undefined &&
                  (value662.h !== value657.h ||
                    !(0, isFillPagedExport)(value662))
                ) {
                  items2.push("changed");
                  continue;
                }
                let value663: Dynamic = (0,
                resolveMeasuredExportHeight)(
                  Math.max(value662.h, value657.h),
                  value660,
                  value661,
                );
                typeof value663 == "number" &&
                  deps.value399(
                    value656,
                    {
                      h: value663,
                    },
                    true,
                  );
                items2.push(
                  typeof value663 == "number"
                    ? value663 < value662.h
                      ? "shrunk"
                      : "grown"
                    : value663 === "fits" && value661 !== undefined
                      ? "matches"
                      : value663,
                );
              }
            },
          );
        } catch (value656: Dynamic) {
          console.error("[fit-height]", value656);
          items2.push("unmeasured");
        } finally {
          deps.value479(false);
          value654 !== undefined && deps.hideToast(value654);
        }
        if (flag2) {
          deps.showToast(
            uiMessage("canvas.designCanvas.thisCanvasIsReadOnly"),
          );
          return;
        }
        let value655: Dynamic = (0, fitContentResultMessage)(
          items2,
          items3,
        );
        value655 !== null &&
          (items2.every(
            (input?: Dynamic): Dynamic =>
              input === "grown" || input === "shrunk",
          )
            ? (0, announce)(value655)
            : deps.showToast(value655));
      }

/** 从画板菜单导出单个画板为图片时运行：截取画板、检查字体替换与裁切及空白尾部，再保存文件并上报结果。 */
async function exportArtboardAsPng(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value485: Dynamic; readonly value493: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value67: Dynamic; readonly value93: Dynamic }, input?: Dynamic, options?: Dynamic): Promise<Dynamic> {
        if (!deps.value493) {
          if (deps.value480) {
            deps.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.value479(true);
          try {
            let value653: Dynamic = await deps.value483(input),
              value654: Dynamic = value653
                ? (0, createPreviewHandle)(value653)
                : null;
            if (
              !value653 ||
              !value654 ||
              value653.getBoundingClientRect().width === 0
            ) {
              deps.showToast(
                deps.value177.current.get(input)?.isBlocked()
                  ? uiMessage("canvas.designCanvas.thisArtboardSPreviewIs")
                  : uiMessage("canvas.designCanvas.thisArtboardIsnTVisible"),
              );
              healthReporter.report(
                ...(0, classifyExportAbort)("image"),
              );
              return;
            }
            let value655: Dynamic = deps.value67.artboards.find(
                (input2?: Dynamic): Dynamic => input2.file === input,
              ),
              value656: Dynamic = (0, exportFileName)(
                input,
                value655?.title,
              ),
              value657: Dynamic = await (0, exportArtboardImage)(
                value654,
                input,
                "png",
                options ?? 2,
                {
                  ...(value655
                    ? (0, getArtboardCaptureOptions)(
                        value655,
                        deps.value93,
                      )
                    : {
                        selectionRoot: "body",
                      }),
                  filename:
                    options == null
                      ? value656 + ".png"
                      : value656 + "@" + options + "x.png",
                  scope: deps.value485(1, "one"),
                },
              ),
              [value658]: Dynamic = (0, fontSubstitutionWarnings)(
                value657.fontWarningCount,
              ),
              value659: Dynamic =
                value658 !== undefined
                  ? {
                      description: value658,
                    }
                  : undefined;
            if (!value657.ok)
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTCaptureThisArtboard"),
                "error",
              );
            else if (value657.saveOutcome === "withheld")
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
            else if (
              value657.clipped &&
              value657.saveOutcome !== "declined"
            ) {
              let value660: Dynamic = deps.value502(input),
                value661: Dynamic = deps.showToast(
                  (0, clippedArtboardsMessage)([value656], value660),
                  "info",
                  value660
                    ? {
                        ...value659,
                        action: deps.value503(
                          [input],
                          false,
                          (): Dynamic => deps.hideToast(value661),
                          value657.saveOutcome === "unsupported",
                        ),
                        pinned: true,
                      }
                    : value659,
                );
            } else if (value657.saveOutcome !== "declined") {
              let flag2: Dynamic = false;
              if (
                value655 &&
                (0, getArtboardCaptureMode)(value655, deps.value93) ===
                  "full" &&
                (0, isFillPagedExport)(value655)
              ) {
                let value660: Dynamic = await (0,
                measureEmptyExportTail)(value654, {
                  w: value655.w,
                  h: value655.h,
                }).catch((): Dynamic => null);
                if (
                  value660 !== null &&
                  value660 >= minEmptyExportTail
                ) {
                  let value661: Dynamic = deps.value502(input),
                    value662: Dynamic = deps.showToast(
                      (0, emptyExportTailMessage)(
                        [value656],
                        value660,
                      ),
                      "info",
                      value661
                        ? {
                            ...value659,
                            action: deps.value503(
                              [input],
                              false,
                              (): Dynamic => deps.hideToast(value662),
                              value657.saveOutcome === "unsupported",
                            ),
                            pinned: true,
                          }
                        : value659,
                    );
                  flag2 = true;
                }
              }
              !flag2 && value658 !== undefined && deps.showToast(value658, "info");
            }
          } catch (value653: Dynamic) {
            console.error("[download-artboard]", value653);
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTExportThisArtboard") +
                (0, errorMessage)(value653) +
                ".",
              "error",
            );
          } finally {
            deps.value479(false);
          }
        }
      }

/** 画板菜单选择复制为 PNG 时运行：截取画板图像并写入系统剪贴板，处理不可见、无法绘制与缺图提示。 */
function copyArtboardAsPng(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Dynamic {
        if (deps.value480) return;
        if (deps.value494())
          return void deps.showToast(AccessibilityAnnouncementsLabel_5);
        let value653: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value654: Dynamic = (0, clipboardGeneration)(),
          value655: Dynamic = (0, createCurrentWorkingGeneration)(),
          value656: Dynamic = null,
          flag2: Dynamic = false,
          state: Dynamic = {
            blank: 0,
          },
          value657: Dynamic = (async (): Promise<Dynamic> => {
            deps.value479(true);
            try {
              if (!(await (0, allowsClipboardImages)())) {
                flag2 = true;
                return null;
              }
              let value658: Dynamic = await deps.value483(input),
                value659: Dynamic = value658
                  ? (0, createPreviewHandle)(value658)
                  : null;
              if (
                !value658 ||
                !value659 ||
                value658.getBoundingClientRect().width === 0
              ) {
                value656 = deps.value177.current.get(input)?.isBlocked()
                  ? AccessibilityAnnouncementsLabel_8
                  : AccessibilityAnnouncementsLabel_9;
                return null;
              }
              let value660: Dynamic = await (0, captureArtboardImage)(
                value659,
                "png",
                2,
                value653
                  ? (0, getArtboardCaptureOptions)(value653, deps.value93)
                  : {
                      selectionRoot: "body",
                    },
              ).catch(
                (input2?: Dynamic): Dynamic => (
                  (value656 = (0, errorMessage)(input2)),
                  null
                ),
              );
              return value660
                ? value660.ok
                  ? ((state = {
                      blank: value660.embedWarningCount,
                      ...(value660.clipped
                        ? {
                            clipped: true,
                          }
                        : {}),
                    }),
                    (0, clipboardGeneration)() === value654 &&
                    value655()
                      ? (0, pngDataUrlToBlob)(value660.uri)
                      : null)
                  : ((value656 =
                      value660.softError === "zero-size"
                        ? AccessibilityAnnouncementsLabel_7
                        : ItsPageHasNothingToDrawMessage),
                    null)
                : null;
            } catch (value658: Dynamic) {
              console.error("[copy-png] artboard", value658);
              value656 = ItsPictureCouldnTBeMadeTryMessage;
              return null;
            } finally {
              deps.value479(false);
            }
          })();
        (0, writeClipboardPng)(value657).then(
          (input2?: Dynamic): Dynamic => {
            if (
              !(
                (0, clipboardGeneration)() !== value654 || !value655()
              )
            )
              if (input2 === "copied") {
                (0, clearClipboardBuffers)();
                (0, announce)(
                  AccessibilityAnnouncementsLabel_2,
                );
                if (state.clipped) {
                  let value658: Dynamic = (0, exportFileName)(
                      input,
                      value653?.title,
                    ),
                    value659: Dynamic = deps.value502(input),
                    value660: Dynamic = deps.showToast(
                      (0, clippedArtboardsMessage)(
                        [value658],
                        value659,
                      ),
                      "info",
                      value659
                        ? {
                            action: deps.value503(
                              [input],
                              false,
                              (): Dynamic => deps.hideToast(value660),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                state.blank > 0 &&
                  deps.showToast(
                    (0, missingCopiedImagesMessage)(state.blank),
                    "info",
                  );
              } else
                flag2
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      (0, pngCopyFailureMessage)(
                        "artboard",
                        input2 === "refused" ? null : value656,
                      ),
                      "error",
                    );
          },
        );
      }

/** 画板菜单选择复制为 SVG 时运行：在捕获视口中生成 SVG 并写入剪贴板，处理裁切、缺图与失败提示。 */
function copyArtboardAsSvg(deps: { readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value502: Dynamic; readonly value503: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Dynamic {
        if (deps.value480) return;
        if (deps.value494())
          return void deps.showToast(AccessibilityAnnouncementsLabel_5);
        let value653: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value654: Dynamic = (0, clipboardGeneration)(),
          value655: Dynamic = (0, createCurrentWorkingGeneration)(),
          value656: Dynamic = null,
          flag2: Dynamic = false,
          index: Dynamic = 0,
          flag3: Dynamic = false,
          value657: Dynamic = (async (): Promise<Dynamic> => {
            deps.value479(true);
            try {
              if (!(await (0, allowsClipboardImages)())) {
                flag2 = true;
                return null;
              }
              let value658: Dynamic = await deps.value483(input),
                value659: Dynamic = value658
                  ? (0, createPreviewHandle)(value658)
                  : null;
              if (
                !value658 ||
                !value659 ||
                value658.getBoundingClientRect().width === 0
              ) {
                value656 = deps.value177.current.get(input)?.isBlocked()
                  ? AccessibilityAnnouncementsLabel_8
                  : AccessibilityAnnouncementsLabel_9;
                return null;
              }
              let value660: Dynamic = value653
                  ? (0, getArtboardCaptureOptions)(value653, deps.value93)
                  : null,
                value661: Dynamic = value660?.frame,
                value662: Dynamic =
                  value661 &&
                  Number.isFinite(value661.w) &&
                  Number.isFinite(value661.h) &&
                  value661.w > 0 &&
                  value661.h > 0
                    ? value661
                    : null,
                value663: Dynamic = await (0, withCaptureViewport)(
                  value659,
                  value662,
                  (): Dynamic =>
                    (0, captureClipboardSvg)(
                      value659,
                      "page",
                      value662 && {
                        w: value662.w,
                        h: value660?.clipToFrame ? value662.h : null,
                      },
                    ),
                  value660?.settle === true,
                ).catch(
                  (input2?: Dynamic): Dynamic => (
                    console.error("[copy-svg] artboard", input2),
                    (value656 = (0, svgCopyErrorMessage)(input2)),
                    null
                  ),
                );
              return value663
                ? value663.ok
                  ? ((index = value663.blank),
                    (flag3 = value663.clipped),
                    (0, clipboardGeneration)() === value654 &&
                    value655()
                      ? value663.svg
                      : null)
                  : ((value656 =
                      value663.softError === "zero-size"
                        ? AccessibilityAnnouncementsLabel_7
                        : AccessibilityAnnouncementsLabel_4),
                    null)
                : null;
            } catch (value658: Dynamic) {
              console.error("[copy-svg] artboard", value658);
              value656 = AccessibilityAnnouncementsLabel_4;
              return null;
            } finally {
              deps.value479(false);
            }
          })();
        (0, writeClipboardSvg)(value657).then(
          (input2?: Dynamic): Dynamic => {
            if (
              !(
                (0, clipboardGeneration)() !== value654 || !value655()
              )
            )
              if (input2 === "copied") {
                (0, clearClipboardBuffers)();
                (0, announce)(
                  AccessibilityAnnouncementsLabel_3,
                );
                if (flag3) {
                  let value658: Dynamic = deps.value502(input),
                    value659: Dynamic = deps.showToast(
                      (0, clippedSvgCopyMessage)(
                        (0, formatArtboardNames)([
                          (0, exportFileName)(input, value653?.title),
                        ]),
                        value658,
                      ),
                      "info",
                      value658
                        ? {
                            action: deps.value503(
                              [input],
                              false,
                              (): Dynamic => deps.hideToast(value659),
                              false,
                            ),
                            pinned: true,
                          }
                        : undefined,
                    );
                }
                index > 0 &&
                  deps.showToast(
                    (0, missingSvgImagesMessage)(index),
                    "info",
                  );
              } else
                flag2
                  ? deps.showToast(DownloadsArenTAvailableToYouForMessage)
                  : deps.showToast(
                      (0, svgCopyFailureMessage)(
                        "artboard",
                        input2 === "refused" ? null : value656,
                      ),
                      "error",
                    );
          },
        );
      }

/** 从画板菜单导出 HTML 压缩包时运行：收集画板文件、依赖与上传素材，生成 README 并打包 zip，通过宿主或浏览器下载。 */
async function exportArtboardSourceZip(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value480: Dynamic; readonly value493: Dynamic; readonly value73: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        if (!deps.value493) {
          if (deps.value480) {
            deps.showToast(DownloadsArenTAvailableToYouForMessage);
            return;
          }
          deps.value479(true);
          try {
            if (await (0, downloadsWithheld)()) {
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
              healthReporter.report(
                ...(0, classifyExportAbort)("zip"),
              );
              return;
            }
            await deps.value177.current.get(input)?.flushPending();
            let files: Dynamic = deps.doc.content().files,
              callback15: Dynamic = async (
                input2?: Dynamic,
              ): Promise<Dynamic> => {
                let value660: Dynamic =
                  (await (0, getKvClient)().get(
                    (0, PlatformFileContentHandler_4)(input2),
                  )) ?? files[input2];
                if (
                  typeof value660 == "string" &&
                  input2.endsWith(".dc.html") &&
                  (0, isLoadingArtboardHtml)(value660)
                )
                  throw new Error(
                    "an artboard on this canvas has not loaded (its uploaded content is still arriving, or could not be read) \u2014 export again once it shows",
                  );
                return typeof value660 == "string" ? value660 : undefined;
              },
              value653: Dynamic = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i,
              entries: Dynamic = new Map(),
              items: Dynamic = [input];
            for (; items.length > 0; ) {
              let value660: Dynamic = items.shift();
              if (entries.has(value660)) continue;
              let value661: Dynamic = await callback15(value660);
              if (
                value661 !== undefined &&
                (entries.set(value660, value661), !value653.test(value660))
              )
                for (let value662 of Object.keys(files) as Dynamic) {
                  if (
                    value662 === value660 ||
                    entries.has(value662) ||
                    value662 === canvasMetadataFile
                  )
                    continue;
                  let value663: Dynamic = (
                    value662.split("/").pop() ?? value662
                  ).replace(/\.dc\.html$/, "");
                  (value662.endsWith(".dc.html")
                    ? value661.includes('name="' + value663 + '"')
                    : value661.includes(value662) ||
                      value661.includes(
                        value662.split("/").pop() ?? value662,
                      )) && items.push(value662);
                }
            }
            let callback16: Dynamic = (input2?: Dynamic): Dynamic => {
                let value660: Dynamic = atob(input2),
                  value661: Dynamic = new Uint8Array(value660.length);
                for (let index: Dynamic = 0; index < value660.length; index++)
                  value661[index] = value660.charCodeAt(index);
                return value661;
              },
              value654: Dynamic = await (0,
              collectExportUploadedAssets)(
                new Map(
                  [...entries].filter(
                    ([input2]: Dynamic): Dynamic =>
                      (0, isProjectSourcePath)(input2),
                  ),
                ),
                input,
                fetchExportAsset,
                {
                  taken: Object.keys(files),
                  emulatorBlobUrls: (0, isEmulator)(),
                },
              );
            for (let [value660, value661] of value654.sources as Dynamic)
              entries.set(value660, value661);
            let items2: Dynamic = [...value654.entries];
            for (let [value660, value661] of entries as Dynamic)
              if (value653.test(value660)) {
                let value662: Dynamic;
                try {
                  value662 = callback16(value661.replace(/^data:[^,]*,/, ""));
                } catch {
                  continue;
                }
                items2.push({
                  name: value660,
                  data: value662,
                });
              } else
                value660.endsWith(".dc.html")
                  ? items2.push({
                      name: value660,
                      data: (0, prepareExportDcDocument)(value661),
                    })
                  : items2.push({
                      name: value660,
                      data: value661,
                    });
            items2.push({
              name: "support.js",
              data: deps.assets.supportJs,
            });
            items2.push({
              name: "vendor/react.js",
              data: deps.assets.reactUmd,
            });
            items2.push({
              name: "vendor/react-dom.js",
              data: deps.assets.reactDomUmd,
            });
            let value655: Dynamic = (0, exportFileName)(
              input,
              deps.value73.current.artboards.find(
                (input2?: Dynamic): Dynamic => input2.file === input,
              )?.title,
            );
            items2.push({
              name: "README.md",
              data: (0, designExportReadme)(
                value655,
                input,
                [...entries.keys()].filter(
                  (input2?: Dynamic): Dynamic => input2 !== input,
                ),
                value654,
              ),
            });
            let value656: Dynamic = (0, createStoredZip)(items2),
              value657: Dynamic = value655 + "-html.zip",
              value658: Dynamic = await (0, saveThroughHost)(
                value656,
                value657,
              ),
              value659: Dynamic = (0, missingExportAssetSuffix)(
                value654.missing,
              );
            value658.outcome === "saved" &&
              value659 === undefined &&
              deps.showToast(uiMessage("canvas.designCanvas.saved") + value657 + ".", "success");
            value658.outcome !== "withheld" &&
              value658.outcome !== "declined" &&
              value659 !== undefined &&
              deps.showToast(
                (value658.outcome === "saved" ? uiMessage("canvas.designCanvas.saved") : uiMessage("canvas.designCanvas.built")) +
                  value657 +
                  ", " +
                  value659,
                "error",
              );
            value658.outcome === "withheld" &&
              deps.showToast(DownloadsArenTAvailableToYouForMessage);
            if (value658.outcome === "unsupported") {
              try {
                let value660: Dynamic = (document as Dynamic).createElement(
                  "a",
                );
                value660.href = URL.createObjectURL(value656);
                value660.download = value657;
                value660.rel = "noopener";
                value660.style.display = "none";
                (document as Dynamic).body.appendChild(value660);
                value660.click();
                value660.remove();
                setTimeout(
                  (): Dynamic => URL.revokeObjectURL(value660.href),
                  6e4,
                );
              } catch {}
              (window as Dynamic).dispatchEvent(
                new CustomEvent(exportDeliveryEventName, {
                  detail: {
                    url: "",
                    filename: value657,
                    embedWarningCount: 0,
                    file: {
                      blob: value656,
                      mime: "application/zip",
                    },
                    refusal: value658.code,
                  },
                }),
              );
            }
            (0, reportExportOutcome)(
              (0, classifyExportSaveOutcome)("zip", value658.outcome),
              designAnalyticsEvents.exported.zip,
            );
          } catch (value653: Dynamic) {
            healthReporter.report(
              ...(0, classifyExportFailure)("zip"),
            );
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTBuildTheHTML") + String(value653),
              "error",
            );
          } finally {
            deps.value479(false);
          }
        }
      }

/** HTML 格式导出的生成函数：刷新待保存内容，挑选可导出的画板，生成独立 HTML 文档数据。 */
async function produceStandaloneHtml(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly filePath: Dynamic; readonly value177: Dynamic; readonly value346: Dynamic; readonly value508: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value92: Dynamic }): Promise<Dynamic> {
      let value653: Dynamic =
          (document as Dynamic).title ||
          (0, exportBaseFileName)(deps.filePath),
        value654: Dynamic = AbortSignal.timeout(55e3),
        files: Dynamic = deps.doc.content().files,
        callback15: Dynamic = async (input?: Dynamic): Promise<Dynamic> => {
          let value658: Dynamic =
            (await (0, getKvClient)().get(
              (0, PlatformFileContentHandler_4)(input),
            )) ?? files[input];
          if (
            typeof value658 == "string" &&
            input.endsWith(".dc.html") &&
            (0, isLoadingArtboardHtml)(value658)
          )
            throw new ExportHtmlError(
              "not_loaded",
              "an artboard on this canvas has not loaded yet",
            );
          return typeof value658 == "string" ? value658 : undefined;
        };
      for (let value658 of deps.value177.current.values() as Dynamic)
        await value658.flushPending();
      let value655: Dynamic = (0, selectHtmlExportArtboards)(
          deps.value73.current,
          deps.value80.current,
          deps.value346.current,
        ),
        value656: Dynamic = deps.value92
          ? await deps.value508(
              value655.artboards.map(
                (input?: Dynamic): Dynamic => input.file,
              ),
            )
          : undefined,
        value657: Dynamic = await (0, produceStandaloneHtmlExport)(
          {
            kind: "canvas",
            title: value653,
            ...value655,
            paths: Object.keys(files).filter(
              (input?: Dynamic): Dynamic =>
                input !== canvasMetadataFile,
            ),
            read: callback15,
            fetchBlob: (input?: Dynamic): Dynamic =>
              fetch(input, {
                credentials: "same-origin",
                signal: value654,
              }),
            assets: deps.assets,
            importerReady: deps.value92,
            ...(value656 === undefined
              ? {}
              : {
                  fontLoads: value656,
                }),
          },
          {
            signal: value654,
          },
        );
      for (let value658 of value657.warnings as Dynamic)
        console.warn("[design/export] " + value658);
      return {
        filename: value657.filename,
        data: value657.blob,
      };
    }

/** PDF 格式导出的生成函数：拒绝并发导出，收集各画板页面生成 PDF，汇总警告并上报导出事件。 */
async function producePdfExport(deps: { readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly showToast: Dynamic; readonly value346: Dynamic; readonly value478: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value484: Dynamic; readonly value485: Dynamic; readonly value487: Dynamic; readonly value489: Dynamic; readonly value494: Dynamic; readonly value495: Dynamic; readonly value497: Dynamic; readonly value498: Dynamic; readonly value499: Dynamic; readonly value502: Dynamic; readonly value514: Dynamic; readonly value516: Dynamic; readonly value92: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        deps.value516.current = {
          notes: [],
          refused: false,
        };
        let callback15: Dynamic = (
            input2?: Dynamic,
            options?: Dynamic,
            context: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value516.current.refused = true),
              (0, reportExportEvent)(context),
              deps.showToast(input2, options),
              new Error(input2)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.value494()) return callback15(text);
        let value653: Dynamic = null;
        if (
          input.interactive &&
          deps.value92 &&
          deps.value497 &&
          ((value653 = await deps.value487(
            "pdf",
            {
              picked: (0, initialExportPickedFiles)(
                "pdf",
                deps.value484,
                deps.value346.current,
                deps.selectionRef.current.artboards,
                deps.focusedFileRef.current,
              ),
              scale: 1,
            },
            input.signal,
          )),
          deps.value478.current)
        ) {
          deps.value489();
          return callback15(text);
        }
        let value654: Dynamic = value653
          ? deps.value514(new Set(value653.files), 1)
          : deps.value514();
        if (!value654.ok) {
          deps.value489();
          return callback15(value654.reason);
        }
        let controller: Dynamic = new AbortController(),
          value655: Dynamic = setTimeout(
            (): Dynamic => controller.abort(),
            55e3,
          );
        value653?.signal.addEventListener(
          "abort",
          (): Dynamic => controller.abort(),
        );
        let { signal: value656 }: Dynamic = controller,
          value657: Dynamic = deps.value485(value654.printable.length, "whole"),
          value658: Dynamic = !value657.partial
            ? (document as Dynamic).title || "design"
            : ((0, sanitizeExportFileName)(
                (document as Dynamic).title,
                100,
              ) || "design") + "-selection";
        deps.value479(true);
        try {
          let { blob: value659, ...value660 }: Dynamic = await deps.value495(
            value654.printable,
            (): Dynamic =>
              (0, collectPdfExportPages)(
                value654.printable,
                deps.value483,
                value658,
                {
                  signal: value656,
                  rules: deps.value93,
                  textEncoding: deps.value498,
                  tagged: deps.value499,
                },
              ),
          );
          if (value653?.signal.aborted) throw new ExportCancelled();
          (0, reportExportBuilt)({
            ...(0, pdfExportWarnings)(value660),
            ...value657,
            picked: value653 !== null,
          });
          deps.value516.current.notes = (0, pdfExportMessage)(
            value660,
            value654.printable.length,
            {
              embeds: true,
              fitAdvice: value660.emptyTailFiles.some(deps.value502),
            },
          );
          return {
            filename: value660.filename,
            data: value659,
          };
        } catch (value659: Dynamic) {
          if (value653?.signal.aborted) throw new ExportCancelled();
          console.error("[design/export]", value659);
          if (value656.aborted && value659 === value656.reason)
            return callback15(
              uiMessage("canvas.designCanvas.preparingThisDesignSPDF"),
              "error",
              "timedOut",
            );
          throw (
            (0, reportExportEvent)("failed"),
            deps.showToast(
              "PDF export failed: " +
                (0, errorMessage)(value659) +
                ".",
              "error",
            ),
            value659
          );
        } finally {
          clearTimeout(value655);
          deps.value489();
          deps.value479(false);
        }
      }

/** 整份设计导出 PNG 时运行：在截止时间内逐个截取画板图像，必要时降低缩放，汇总裁切与字体警告，可取消。 */
async function captureArtboardPngsForExport(deps: { readonly showToast: Dynamic; readonly value177: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value485: Dynamic; readonly value489: Dynamic; readonly value519: Dynamic; readonly value93: Dynamic }, items?: Dynamic,
        options?: Dynamic,
        context?: Dynamic): Promise<Dynamic> {
        let value653: Dynamic = deps.value485(items.length, "whole"),
          callback15: Dynamic = (
            input?: Dynamic,
            options2?: Dynamic,
            context2: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value519.current.refused = true),
              (0, reportExportEvent)(context2),
              deps.showToast(input, options2),
              new Error(input)
            );
          };
        if (options.signal.aborted)
          throw (deps.value489(), new ExportCancelled());
        let controller: Dynamic = new AbortController(),
          value654: Dynamic = setTimeout(
            (): Dynamic => controller.abort(),
            (0, interactiveExportDeadline)(context) - Date.now(),
          );
        options.signal.addEventListener(
          "abort",
          (): Dynamic => controller.abort(),
        );
        let { signal: value655 }: Dynamic = controller,
          value656: Dynamic = null,
          items2: Dynamic = [],
          index: Dynamic = 0;
        deps.value479(true);
        try {
          let value657: Dynamic = await (0, captureExportArtboards)(
            items,
            async (input?: Dynamic): Promise<Dynamic> => {
              let value658: Dynamic =
                  '"' +
                  (input.title ??
                    (0, exportBaseFileName)(input.file)) +
                  '"',
                value659: Dynamic = await deps.value483(input.file);
              value655.throwIfAborted();
              let value660: Dynamic = value659
                ? (0, createPreviewHandle)(value659)
                : null;
              if (deps.value177.current.get(input.file)?.isBlocked())
                return callback15(
                  value658 +
                    "\u2019s preview is stopped \u2014 reload it before exporting.",
                );
              if (!value659 || !value660)
                return callback15(
                  value658 +
                    " is still loading \u2014 try again in a moment.",
                );
              if (value659.getBoundingClientRect().width === 0)
                return callback15(
                  value658 +
                    " isn\u2019t on screen to capture \u2014 scroll to it, then try again.",
                );
              let value661: Dynamic;
              try {
                value661 = await (0, captureArtboardImage)(
                  value660,
                  "png",
                  options.scale,
                  (0, getArtboardCaptureOptions)(input, {
                    ...deps.value93,
                    settle:
                      deps.value93.settle &&
                      index < ExportCaptureViewportLimit,
                  }),
                );
              } catch (value662: Dynamic) {
                throw ((value656 = value658), value662);
              }
              if (options.signal.aborted) throw new ExportCancelled();
              return value661.ok
                ? ((index += value661.settleMs ?? 0),
                  (0, artboardNeedsScaledDownExport)(input) &&
                    items2.push(value658),
                  {
                    bytes: (0, dataUrlToBytes)(value661.uri),
                    blank: value661.embedWarningCount,
                    clipped: value661.clipped,
                    fontFallback: value661.fontWarningCount,
                    hiddenContent: value661.hiddenContent,
                  })
                : callback15(
                    uiMessage("canvas.designCanvas.couldnTCapture") +
                      value658 +
                      " \u2014 it has nothing visible to export.",
                    "error",
                  );
            },
            {
              signal: value655,
            },
          );
          if (options.signal.aborted) throw new ExportCancelled();
          (0, reportExportBuilt)({
            ...(0, describeExportCaptureWarnings)(
              value657,
              items2.length,
            ),
            ...value653,
            picked: true,
          });
          deps.value519.current.notes = [
            ...(items2.length > 0
              ? [
                  uiMessage("canvas.designCanvas.saved") +
                    (items2.length > 3
                      ? String(items2.length) + " artboards"
                      : items2.join(", ")) +
                    " at a reduced size: over the capture limit.",
                ]
              : []),
            ...(value657.clipped.length > 0
              ? [(0, clippedArtboardsMessage)(value657.clipped)]
              : []),
            ...(0, fontSubstitutionWarnings)(value657.fontFallback),
            ...(value657.blank === 1
              ? [
                  "1 image could not be embedded and renders blank in the PNGs.",
                ]
              : value657.blank > 1
                ? [
                    String(value657.blank) +
                      " images could not be embedded and render blank in the PNGs.",
                  ]
                : []),
          ];
          return {
            filename:
              ((0, sanitizeExportFileName)(
                (document as Dynamic).title,
                100,
              ) || "design") + "-png.zip",
            data: value657.blob,
          };
        } catch (value657: Dynamic) {
          if (options.signal.aborted) throw new ExportCancelled();
          if (
            deps.value519.current.refused ||
            value657 instanceof ExportCancelled
          )
            throw value657;
          console.error(
            "[design/export] PNG archive failed" +
              (value656 !== null ? " capturing " + value656 : "") +
              ": " +
              (value657 instanceof Error ? value657.name : typeof value657),
          );
          if (value655.aborted && value657 === value655.reason)
            return callback15(
              uiMessage("canvas.designCanvas.preparingTheseArtboardsPNGsTook") +
                (options.scale === 2 ? "1\xD7, or " : "") +
                uiMessage("canvas.designCanvas.fewerArtboards"),
              "error",
              "timedOut",
            );
          throw (
            (0, reportExportEvent)("failed"),
            deps.showToast(
              value656 !== null
                ? uiMessage("canvas.designCanvas.couldnTCapture") +
                    value656 +
                    " as a PNG. " +
                    (options.scale === 2
                      ? uiMessage("canvas.designCanvas.try1OrExportWithout")
                      : uiMessage("canvas.designCanvas.tryAgainWithoutIt"))
                : uiMessage("canvas.designCanvas.couldnTExportTheseArtboards"),
              "error",
            ),
            value657
          );
        } finally {
          clearTimeout(value654);
          deps.value489();
          deps.value479(false);
        }
      }

/** PNG 格式导出的生成函数：根据导出选择挑选画板与缩放，单张直接截取、多张交给 captureArtboardPngsForExport，并处理超大与超时。 */
async function producePngExport(deps: { readonly callback2: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value346: Dynamic; readonly value478: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value484: Dynamic; readonly value485: Dynamic; readonly value487: Dynamic; readonly value489: Dynamic; readonly value494: Dynamic; readonly value497: Dynamic; readonly value502: Dynamic; readonly value519: Dynamic; readonly value520: Dynamic; readonly value521: Dynamic; readonly value87: Dynamic; readonly value93: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        let value653: Dynamic = Date.now();
        deps.value519.current = {
          notes: [],
          refused: false,
        };
        let callback15: Dynamic = (
            input2?: Dynamic,
            options?: Dynamic,
            context: Dynamic = "refused",
          ): Dynamic => {
            throw (
              (deps.value519.current.refused = true),
              context !== null && (0, reportExportEvent)(context),
              deps.showToast(input2, options),
              new Error(input2)
            );
          },
          text: Dynamic =
            uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
        if (deps.value494()) return callback15(text);
        let value654: Dynamic,
          value655: Dynamic,
          value656: Dynamic = null;
        if (input.interactive && deps.value497) {
          let value660: Dynamic = input.bundle ? "pngs" : "png",
            value661: Dynamic = (0, initialExportPickedFiles)(
              value660,
              deps.value484,
              deps.value346.current,
              deps.selectionRef.current.artboards,
              deps.focusedFileRef.current,
            ),
            value662: Dynamic = deps.value484.filter(
              (input2?: Dynamic): Dynamic => value661.has(input2.file),
            );
          value656 = await deps.value487(
            value660,
            {
              picked: value661,
              scale: (0, initialExportScale)(
                value662,
                deps.value520.current,
              ),
            },
            input.signal,
          );
          let value663: Dynamic = deps.value87.current.artboards.filter(
              (input2?: Dynamic): Dynamic => !input2.frameless,
            ),
            value664: Dynamic = value656.files.flatMap(
              (input2?: Dynamic): Dynamic =>
                value663.find(
                  (input3?: Dynamic): Dynamic => input3.file === input2,
                ) ?? [],
            );
          if (value664.length < value656.files.length || deps.value478.current) {
            deps.value489();
            return callback15(
              deps.value478.current
                ? text
                : (value656.files.length > 1 ? "An" : "The") +
                    " artboard you chose is no longer on this page.",
            );
          }
          if (value664.length > 1)
            return deps.value521(value664, value656, value653);
          value654 = value664[0];
          value655 = true;
        } else {
          let value660: Dynamic = (0, selectExportCaptureArtboard)(
            deps.value484,
            deps.value346.current,
            deps.selectionRef.current.artboards,
            deps.focusedFileRef.current,
          );
          if (value660.artboard === null)
            return callback15(
              value660.covered
                ? '"' +
                    deps.callback2(deps.value346.current) +
                    '" isn\u2019t an artboard. Close its full-window view, then export a PNG.'
                : noExportableArtboardsMessage,
            );
          value654 = value660.artboard;
          value655 = value660.chosen;
        }
        let value657: Dynamic = deps.value485(
            1,
            value656 !== null && input.bundle === true ? "whole" : "one",
          ),
          value658: Dynamic =
            '"' +
            (value654.title ??
              (0, exportBaseFileName)(value654.file)) +
            '"',
          value659: Dynamic = Date.now() + 55e3;
        deps.value479(true);
        try {
          let value660: Dynamic = await deps.value483(value654.file);
          if (value656?.signal.aborted) throw new ExportCancelled();
          let value661: Dynamic = value660
            ? (0, createPreviewHandle)(value660)
            : null;
          if (deps.value177.current.get(value654.file)?.isBlocked())
            return callback15(
              value658 +
                "\u2019s preview is stopped \u2014 reload it before exporting.",
            );
          if (!value660 || !value661)
            return callback15(
              value658 + " is still loading \u2014 try again in a moment.",
            );
          if (value660.getBoundingClientRect().width === 0)
            return callback15(
              value658 +
                " isn\u2019t on screen to capture \u2014 scroll to it, then try again.",
            );
          let value662: Dynamic = (0, imageCaptureScaleOptions)(
              value654.w,
              value654.h,
            )
              .filter(
                (input2?: Dynamic): Dynamic =>
                  input2.fits && input2.scale <= 2,
              )
              .map((input2?: Dynamic): Dynamic => input2.scale),
            value663: Dynamic = value656
              ? value656.scale === 2 && value662.includes(2)
                ? [2, 1]
                : [1]
              : value662.includes(2) && deps.value520.current !== value654.file
                ? [2, 1]
                : [1],
            value664: Dynamic = await (0,
            drainArtboardExportCaptures)(
              async (input2?: Dynamic): Promise<Dynamic> => {
                if (value656?.signal.aborted)
                  throw new ExportCancelled();
                let value667: Dynamic = await (0,
                captureArtboardImage)(
                  value661,
                  "png",
                  input2,
                  (0, getArtboardCaptureOptions)(value654, deps.value93),
                );
                return value667.ok
                  ? {
                      bytes: (0, dataUrlToBytes)(value667.uri),
                      blank: value667.embedWarningCount,
                      clipped: value667.clipped,
                      fontFallback: value667.fontWarningCount,
                      hiddenContent: value667.hiddenContent,
                    }
                  : null;
              },
              value663,
              value656 ? 1 / 0 : ExportDownloadsResolvedValue,
              value659,
            );
          if (value656?.signal.aborted) throw new ExportCancelled();
          if (!value664.ok) {
            value664.reason === "no_time" &&
              (deps.value520.current = value654.file);
            (value664.reason === "too_large" ||
              (value664.reason === "no_time" &&
                value664.after === "too_large")) &&
              (0, reportExportEvent)("tooLarge");
            return callback15(
              value664.reason === "nothing"
                ? uiMessage("canvas.designCanvas.couldnTCapture") +
                    value658 +
                    " \u2014 it has nothing visible to export."
                : value664.reason === "no_time"
                  ? value658 +
                    (value664.after === "too_large"
                      ? ` is over the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit at 2\xD7`
                      : " could not be captured at 2\xD7") +
                    ", and there wasn\u2019t time to try a smaller size. Try again to export it at 1\xD7."
                  : value658 +
                    ` is over the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit` +
                    (value663.length > 1 ? " even at 1\xD7" : "") +
                    ". Export the PDF, or use the artboard\u2019s own Export menu.",
              "error",
              value664.reason === "nothing"
                ? "refused"
                : value664.reason === "no_time" &&
                    value664.after !== "too_large"
                  ? "timedOut"
                  : null,
            );
          }
          let value665: Dynamic =
              value664.steppedDown !== null
                ? value664.steppedDown === "too_large"
                  ? ` at 1\xD7 to fit the ${String(ExportDownloadsResolvedValue >> 20)} MB export limit`
                  : " at 1\xD7: the browser could not capture it at 2\xD7"
                : value662.length === 0
                  ? " at a reduced size: it is larger than the capture limit"
                  : value656
                    ? ""
                    : value662.includes(2)
                      ? value663[0] === 1
                        ? " at 1\xD7: at 2\xD7 it ran out of time before"
                        : ""
                      : " at 1\xD7: it is too large to capture at 2\xD7",
            value666: Dynamic =
              !value664.clipped &&
              (0, getArtboardCaptureMode)(value654, deps.value93) ===
                "full" &&
              (0, isFillPagedExport)(value654) &&
              Date.now() < value659 - 6e3
                ? await (0, measureEmptyExportTail)(value661, {
                    w: value654.w,
                    h: value654.h,
                  }).catch((): Dynamic => null)
                : null;
          if (value656?.signal.aborted) throw new ExportCancelled();
          (0, reportExportBuilt)({
            blankImages: value664.blank,
            clipped: value664.clipped,
            fontFallback: value664.fontFallback,
            scaledDown:
              value664.steppedDown !== null || value662.length === 0,
            ...value657,
            ...value664.hiddenContent,
            picked: value656 !== null,
          });
          deps.value519.current.notes = [
            ...(value665 !== "" || !value655
              ? [
                  uiMessage("canvas.designCanvas.saved") +
                    value658 +
                    value665 +
                    "." +
                    (value655
                      ? ""
                      : " To pick a different artboard, select it or open it full-window first."),
                ]
              : []),
            ...(value664.clipped
              ? [
                  (0, clippedArtboardsMessage)([
                    value654.title ??
                      (0, exportBaseFileName)(value654.file),
                  ]),
                ]
              : []),
            ...(value666 !== null &&
            value666 >= minEmptyExportTail
              ? [
                  (0, emptyExportTailMessage)(
                    [
                      value654.title ??
                        (0, exportBaseFileName)(value654.file),
                    ],
                    value666,
                    deps.value502(value654.file),
                  ),
                ]
              : []),
            ...(0, fontSubstitutionWarnings)(value664.fontFallback),
            ...(value664.blank === 1
              ? [
                  "1 image could not be embedded and renders blank in the PNG.",
                ]
              : value664.blank > 1
                ? [
                    String(value664.blank) +
                      " images could not be embedded and render blank in the PNG.",
                  ]
                : []),
          ];
          return {
            filename:
              (0, exportFileName)(value654.file, value654.title) +
              ".png",
            data: value664.bytes,
          };
        } catch (value660: Dynamic) {
          throw value656?.signal.aborted
            ? new ExportCancelled()
            : (deps.value519.current.refused ||
                value660 instanceof ExportCancelled ||
                (console.error("[design/export]", value660),
                (0, reportExportEvent)("failed"),
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTExport") +
                    value658 +
                    " as a PNG: " +
                    (0, errorMessage)(value660) +
                    ". Reload this tab and try again.",
                  "error",
                )),
              value660);
        } finally {
          deps.value489();
          deps.value479(false);
        }
      }

/** 只选中一个画布图形或说明时计算（useMemo）：生成属性面板所需的位置、尺寸、颜色、线宽、箭头和文字样式及对应修改回调。 */
function deriveAnnotationSettings(deps: { readonly value168: Dynamic; readonly value169: Dynamic; readonly value420: Dynamic; readonly value421: Dynamic; readonly value422: Dynamic; readonly value423: Dynamic; readonly value424: Dynamic; readonly value67: Dynamic }): Dynamic {
      if (deps.value169.size !== 1 || deps.value168.size > 0) return null;
      let value653: Dynamic = [...deps.value169][0],
        value654: Dynamic = (deps.value67.annotations ?? []).find(
          (input?: Dynamic): Dynamic => input.id === value653,
        );
      if (!value654) return null;
      let value655: Dynamic = (0, isShapeAnnotation)(value654)
        ? (0, annotationBounds)(value654)
        : {
            x: value654.x,
            y: value654.y,
            w: value654.w,
          };
      return {
        id: value653,
        kind: value654.kind ?? "note",
        x: value655.x,
        y: value655.y,
        w: value655.w,
        ...("h" in value655 &&
        value654.kind !== "line" &&
        value654.kind !== "arrow"
          ? {
              h: value655.h,
            }
          : {}),
        ...((0, isShapeAnnotation)(value654)
          ? {
              css: value654.css,
              paint: (0, annotationColor)(
                value654.kind,
                value654.color ?? "default",
              ),
              ...(value654.kind === "line" ||
              value654.kind === "arrow" ||
              value654.kind === "pen"
                ? {
                    strokeWidth:
                      CanvasAnnotationShapeStyleLineArrowPenConfig[
                        value654.kind
                      ],
                  }
                : {}),
              ...(value654.kind === "line" || value654.kind === "arrow"
                ? {
                    heads: (0, annotationArrowHeads)(value654),
                    onSetHeads: (
                      input?: Dynamic,
                      options?: Dynamic,
                    ): Dynamic => deps.value422(value653, input, options),
                  }
                : {}),
              onSetCss: (input?: Dynamic, options?: Dynamic): Dynamic =>
                deps.value421(value653, input, options),
            }
          : {
              textStyle: (0, annotationTextStyle)(value654),
              maxW: value654.maxW,
              maxH: value654.maxH,
              defaultMaxW:
                value654.kind === "title1"
                  ? (0, PlatformFileContentMaxW)({
                      ...value654,
                      maxW: undefined,
                    })
                  : undefined,
              defaultMaxH: Number.isFinite(
                (0, PlatformFileContentKind)({
                  ...value654,
                  maxH: undefined,
                }),
              )
                ? (0, PlatformFileContentKind)({
                    ...value654,
                    maxH: undefined,
                  })
                : undefined,
              onSetTextStyle: (input?: Dynamic, options?: Dynamic): Dynamic =>
                deps.value423(value653, input, options),
            }),
        ...(value654.kind === "image"
          ? {
              src: value654.src,
              alt: value654.alt,
              ...(value654.video !== undefined
                ? {
                    video: value654.video,
                  }
                : {
                    onReplaceImage: (input?: Dynamic): Dynamic =>
                      deps.value424(value653, input),
                  }),
            }
          : {}),
        onSetBox: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value420(value653, input, options, false),
      };
    }

/** 打开画布位置链接（页面、画板、播放或窗口）时运行：解析目标动作，切换页面、聚焦或播放画板，并恢复对应视口。 */
function navigateToCanvasPlace(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value105: Dynamic; readonly value2: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value273: Dynamic; readonly value275: Dynamic; readonly value284: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value310: Dynamic; readonly value346: Dynamic; readonly value380: Dynamic; readonly value559: Dynamic; readonly value563: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic }, input?: Dynamic, options: Dynamic = false): Dynamic {
    let value653: Dynamic = (0, resolveCanvasPlaceAction)(
      input,
      deps.value73.current,
      {
        filling: deps.value346.current,
        plays: true,
        pageId: deps.value80.current,
        mayFocus: deps.value224.current || deps.value225.current || false,
        restoring: options,
      },
    );
    if (value653 === null) return null;
    deps.value563.current?.abort();
    if (value653.do === "nothing") return value653.lands;
    let callback15: Dynamic = (): Dynamic => {
        deps.value284(false);
        deps.abandonSelectionGesture();
        deps.value62();
        let callback16: Dynamic = (input2?: Dynamic): Dynamic => {
          let value655: Dynamic = (0, recallCanvasView)(input2);
          value655 !== undefined &&
            ((deps.value291.current = false),
            (deps.value310.current = true),
            deps.value105.set(value655, true));
        };
        value653.do === "play"
          ? deps.value380(value653.file)
          : value653.do === "page"
            ? value653.id === deps.value80.current
              ? deps.setSelection(emptyCanvasSelection)
              : (deps.value298(value653.id),
                value653.camera || callback16(value653.id))
            : value653.do === "window"
              ? value653.page !== deps.value80.current
                ? deps.value298(value653.page, value653.file)
                : (deps.setSelection(emptyCanvasSelection),
                  deps.value559(value653.file),
                  deps.value273(value653.file))
              : (value653.page !== deps.value80.current
                  ? (deps.value298(
                      value653.page,
                      value653.focus ? value653.file : undefined,
                    ),
                    value653.camera || callback16(value653.page))
                  : (value653.focus && deps.value273(value653.file),
                    value653.camera && deps.value559(value653.file)),
                deps.setSelection(
                  (0, selectionFromArtboards)(
                    new Set([value653.file]),
                  ),
                ));
      },
      value654: Dynamic =
        value653.do === "window" ||
        value653.do === "play" ||
        (value653.do === "page" ? value653.id : value653.page) !==
          deps.value80.current;
    value654 && (0, initializeDesignKeyboardBindings)();
    let controller: Dynamic = new AbortController();
    deps.value563.current = controller;
    (0, runFindRevealAfterSettle)(
      value654 && deps.value2.current?.() === true,
      controller.signal,
      deps.value275,
      callback15,
    );
    return value653.lands;
  }

/** 页面或画板变化时计算（useMemo）：为查找栏提供画板文本、显示匹配项所需的平移与聚焦，以及关闭后恢复视口。 */
function buildFindCanvasAdapter(deps: { readonly doc: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value120: Dynamic; readonly value177: Dynamic; readonly value2: Dynamic; readonly value271: Dynamic; readonly value275: Dynamic; readonly value291: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value379: Dynamic; readonly value382: Dynamic; readonly value566: Dynamic; readonly value568: Dynamic; readonly value569: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value99: Dynamic }): Dynamic {
  return {
        manifest: (): Dynamic => deps.value73.current,
        pageId: (): Dynamic => deps.value80.current,
        windowFile: (): Dynamic => deps.value346.current,
        showsTextMatchesOnCanvas: (): Dynamic => !deps.value99,
        scrollsItself: (input?: Dynamic): Dynamic =>
          input === deps.value346.current || input === deps.value271.current,
        frame: (input?: Dynamic): Dynamic => {
          let entry: Dynamic = deps.value177.current.get(input);
          return entry != null && entry.isReady() && !entry.isBlocked()
            ? entry.webviewRef.current
            : null;
        },
        canvasRoot: (): Dynamic => deps.value106.current,
        storedText: (input?: Dynamic): Dynamic =>
          (0, designFileTextRuns)(input, deps.doc.content().files[input]),
        keepRunning: deps.value566,
        showPage: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Dynamic => (
          (0, initializeDesignKeyboardBindings)(),
          (0, runFindRevealAfterSettle)(
            deps.value2.current?.() === true,
            context,
            deps.value275,
            (): Dynamic => {
              deps.value298(input, options);
              deps.value291.current = false;
              deps.value569.showedPage(input, deps.value105.get());
            },
          )
        ),
        editorOn: (input?: Dynamic): Dynamic => {
          try {
            return (
              deps.value177.current
                .get(input)
                ?.webviewRef.current?.contentDocument?.body?.hasAttribute(
                  "data-dc-editor-on",
                ) === true
            );
          } catch {
            return false;
          }
        },
        showInWindow: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Dynamic => {
          let value653: Dynamic = (0, canRevealFindMatch)(
            input !== deps.value80.current,
            deps.value345.current,
            options === deps.value346.current,
          );
          value653 && (0, initializeDesignKeyboardBindings)();
          return (0, runFindRevealAfterSettle)(
            value653 && deps.value2.current?.() === true,
            context,
            deps.value275,
            (): Dynamic => {
              let value654: Dynamic = input !== deps.value80.current;
              if (
                !(
                  value654 &&
                  (deps.value298(input, options),
                  (deps.value291.current = false),
                  deps.value345.current)
                )
              ) {
                if (!deps.value345.current) {
                  let value655: Dynamic = deps.value569.opensWindow(
                    input,
                    value654,
                    deps.value105.get(),
                    deps.value568.current,
                  );
                  deps.value379.current(
                    options,
                    value655 === "page"
                      ? ((0, recallCanvasView)(input) ??
                          defaultCanvasCamera)
                      : value655 === "fit"
                        ? defaultCanvasCamera
                        : undefined,
                  );
                  return;
                }
                deps.value382.current(options);
              }
            },
          );
        },
        panTo: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value105.glide((input2?: Dynamic): Dynamic => {
            deps.value569.pansFrom(input2, deps.value568.current);
            let value653: Dynamic = (0, isArtboardInViewport)(
                options === true
                  ? {
                      ...input2,
                      ...(0, findRestoreCamera)(
                        input2,
                        deps.value568.current,
                      ),
                    }
                  : input2,
                input,
                deps.value120(),
              ),
              callback15: Dynamic = (input3?: Dynamic): Dynamic => (
                (deps.value568.current =
                  options === true
                    ? null
                    : {
                        from: input2,
                        to: input3,
                      }),
                input3
              ),
              value654: Dynamic = (document as Dynamic)
                .querySelector("[" + McFindAttribute + "]")
                ?.getBoundingClientRect(),
              value655: Dynamic = deps.value106.current?.getBoundingClientRect();
            if (!value654 || !value655) return callback15(value653);
            let value656: Dynamic =
                value655.left + (input.x - value653.x) * value653.scale,
              value657: Dynamic =
                value655.top + (input.y - value653.y) * value653.scale,
              value658: Dynamic =
                value656 < value654.right &&
                value656 + input.w * value653.scale > value654.left &&
                value657 < value654.bottom + 8 &&
                value657 + input.h * value653.scale > value654.top;
            return callback15(
              value658
                ? {
                    ...value653,
                    y:
                      value653.y -
                      (value654.bottom + 8 - value657) / value653.scale,
                  }
                : value653,
            );
          }),
        toCanvas: (input?: Dynamic): Dynamic => {
          deps.value105.halt();
          let entry: Dynamic = deps.value105.get(),
            value653: Dynamic = deps.value106.current?.getBoundingClientRect();
          return {
            x: entry.x + (input.x - (value653?.left ?? 0)) / entry.scale,
            y: entry.y + (input.y - (value653?.top ?? 0)) / entry.scale,
            w: input.w / entry.scale,
            h: input.h / entry.scale,
          };
        },
      };
}

/** 从大纲或外部请求选中某画板内的元素时运行：先聚焦画板，再推送元素选择，并报告已落定、被替代或放弃。 */
function selectElementInArtboard(deps: { readonly abandonSelectionGesture: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionEpochRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly value124: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value23: Dynamic; readonly value25: Dynamic; readonly value273: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic): Dynamic {
        let value654: Dynamic = deps.value19(input),
          value655: Dynamic =
            value653 != null
              ? ++deps.selectionEpochRef.current
              : deps.abandonSelectionGesture(),
          callback15: Dynamic = (): Dynamic => {
            deps.selectionEpochRef.current === value655 &&
              deps.selectionEpochRef.current++;
          };
        deps.value124(
          deps.value73.current.artboards.some(
            (input2?: Dynamic): Dynamic =>
              input2.file === input && input2.frameless,
          )
            ? input
            : null,
        );
        deps.value62();
        deps.value23.current = true;
        deps.setSelection(emptyCanvasSelection);
        deps.value273(input).then((): Dynamic => {
          let index: Dynamic = 0,
            index2: Dynamic = 0,
            index3: Dynamic = 0,
            callback16: Dynamic = (): Dynamic => {
              if (deps.selectionEpochRef.current !== value655)
                return extra?.("superseded");
              if (
                deps.selectionRef.current.elements
                  .get(input)
                  ?.tids.includes(options)
              )
                return extra?.("landed");
              if (index >= 25 || index2++ >= 400) return extra?.("gave-up");
              let entry: Dynamic = deps.value177.current.get(input);
              if (context && Date.now() - index3 < 300) {
                (window as Dynamic).setTimeout(callback16, 60);
                return;
              }
              deps.focusedFileRef.current === input &&
                entry?.isReady() &&
                (value653 == null && (deps.value25.current = input),
                !entry.setShownSelection(null, null, value653) &&
                  value653 == null &&
                  (deps.value25.current = null),
                entry.setShownSelection([options], value654, value653) &&
                  (index++, (index3 = Date.now()), context?.()));
              (window as Dynamic).setTimeout(callback16, 60);
            };
          (window as Dynamic).setTimeout(callback16, 60);
        });
        return callback15;
      }

/** 无框画板上报内容外包框时运行（onContentHull）：防抖后按内容调整画板尺寸，并保存画布元数据。 */
function syncFramelessArtboardHull(deps: { readonly focusedFileRef: Dynamic; readonly value125: Dynamic; readonly value127: Dynamic; readonly value129: Dynamic; readonly value202: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value427: Dynamic; readonly value583: Dynamic; readonly value584: Dynamic; readonly value585: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value73: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        deps.value129((input2?: Dynamic): Dynamic => {
          if (input2.has(input) === (options == null)) return input2;
          let values: Dynamic = new Set(input2);
          options == null ? values.add(input) : values.delete(input);
          return values;
        });
        let current4: Dynamic = deps.value583.current,
          entry: Dynamic = current4.get(input);
        entry && clearTimeout(entry);
        if (options == null) {
          current4.delete(input);
          deps.value584.current.delete(input);
          return;
        }
        let callback15: Dynamic = (): Dynamic => {
          current4.delete(input);
          let value653: Dynamic = deps.value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
          if (!value653 || !value653.frameless) return;
          let value654: Dynamic =
            deps.value127.current.has(input) ||
            deps.value125.current === input ||
            deps.focusedFileRef.current === input;
          if (!deps.value224.current || !value654) {
            deps.value584.current.set(input, options);
            return;
          }
          deps.value584.current.delete(input);
          if (deps.value218.current || deps.value202.current || deps.value427.current) {
            current4.set(input, setTimeout(callback15, 300));
            return;
          }
          if (
            Math.abs(value653.w - options.w) <= 1 &&
            Math.abs(value653.h - options.h) <= 1
          )
            return;
          let value655: Dynamic = Date.now(),
            value656: Dynamic = (deps.value585.current.get(input) ?? []).filter(
              (input2?: Dynamic): Dynamic => value655 - input2 < 5e3,
            );
          if (value656.length >= 8) {
            current4.set(
              input,
              setTimeout(callback15, 5e3 - (value655 - value656[0])),
            );
            return;
          }
          deps.value585.current.set(input, [...value656, value655]);
          let value657: Dynamic = deps.value72(
            (0, replaceDesignArtboards)(
              deps.value73.current,
              deps.value73.current.artboards.map(
                (input2?: Dynamic): Dynamic =>
                  input2.file === input
                    ? {
                        ...input2,
                        w: options.w,
                        h: options.h,
                      }
                    : input2,
              ),
            ),
          );
          deps.value70.current = value657;
          deps.value73.current = value657;
          deps.value68(value657);
          (0, getKvClient)()
            .set(
              (0, PlatformFileContentHandler_4)(
                canvasMetadataFile,
              ),
              (0, serializeCanvasMetadata)(value657),
              {
                auto: true,
              },
            )
            .catch((): Dynamic => {});
        };
        current4.set(input, setTimeout(callback15, 400));
      }

/** 打开画板右键菜单时运行：生成复制（含 PNG/SVG）、重命名、设为缩略图、编辑、画布或全屏播放、新窗口打开、层级与删除等菜单项。 */
function buildArtboardContextMenu(deps: { readonly doc: Dynamic; readonly selectionRef: Dynamic; readonly value105: Dynamic; readonly value224: Dynamic; readonly value225: Dynamic; readonly value271: Dynamic; readonly value274: Dynamic; readonly value293: Dynamic; readonly value323: Dynamic; readonly value379: Dynamic; readonly value383: Dynamic; readonly value384: Dynamic; readonly value403: Dynamic; readonly value449: Dynamic; readonly value480: Dynamic; readonly value505: Dynamic; readonly value506: Dynamic; readonly value578: Dynamic; readonly value588: Dynamic; readonly value589: Dynamic; readonly value590: Dynamic; readonly value591: Dynamic; readonly value73: Dynamic; readonly value92: Dynamic }, input?: Dynamic, options: Dynamic = false): Dynamic {
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = current4.artboards.has(input),
          value654: Dynamic = value653
            ? current4.artboards
            : new Set([input]);
        value653 || deps.value578(input, false);
        let size: Dynamic = value654.size,
          value655: Dynamic =
            size > 1 ? " " + String(size) + " artboards" : "",
          value656: Dynamic = deps.value224.current
            ? undefined
            : ViewOnlyYouCanInspectThisMessage,
          callback15: Dynamic = (): Dynamic => deps.value224.current && true,
          current5: Dynamic = deps.value73.current,
          value657: Dynamic = current5.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ),
          value658: Dynamic = deps.value271.current === input,
          value659: Dynamic = value658
            ? undefined
            : value657?.frameless
              ? loosePiecePlaybackMessage
              : value657?.is_interactive !== true
                ? staticArtboardPlaybackMessage
                : undefined;
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { value1: String(value655) }); },
            hotkey: "cmd+c",
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.value589(
                value654,
                value653 ? current4.notes : emptyCanvasSelectionFiles,
              );
            },
          },
          ...(deps.value92 && (0, supportsClipboardImages)()
            ? [
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsPNG"); },
                  disabledReason: deps.value480
                    ? DownloadsArenTAvailableToYouForMessage
                    : size > 1
                      ? singleArtboardPngCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.value505(input),
                },
                {
                  get label() { return uiMessage("canvas.designCanvas.copyAsSVG"); },
                  disabledReason: deps.value480
                    ? DownloadsArenTAvailableToYouForMessage
                    : size > 1
                      ? singleArtboardSvgCopyMessage
                      : undefined,
                  onClick: (): Dynamic => deps.value506(input),
                },
              ]
            : []),
          deps.value591(),
          {
            label:
              KeyboardEditActionsCutCopyPasteConfig.duplicate.label +
              value655,
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: value656,
            onClick: (): Dynamic => {
              callback15() &&
                deps.value323.current({
                  files: value654,
                  notes: value653
                    ? current4.notes
                    : emptyCanvasSelectionFiles,
                });
            },
          },
          ...["front", "back"].map(
            (input2?: Dynamic, options2?: Dynamic): Dynamic => ({
              label:
                KeyboardEditActionsCutCopyPasteConfig[input2].label,
              hotkey:
                KeyboardEditActionsCutCopyPasteConfig[input2]
                  .shortcut,
              separatorBefore: options2 === 0,
              disabledReason:
                value656 ??
                ((0, reorderArtboardsOnPages)(
                  current5.artboards,
                  value654,
                  input2,
                  current5.pages,
                ) === null
                  ? (0, stackingAnnouncement)(input2, false)
                  : undefined),
              onClick: (): Dynamic => {
                callback15() && deps.value403(value654, input2);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.rename"); },
            separatorBefore: true,
            disabledReason:
              value656 ??
              (options && value657?.frameless
                ? loosePieceRenameHint
                : undefined),
            onClick: (): Dynamic => {
              if (!callback15()) return;
              if (!options) return void deps.value588(input);
              let scale: Dynamic = deps.value105.get().scale;
              value657 &&
                deps.value383.current({
                  x: value657.x,
                  y: value657.y - 32 / scale,
                  w: Math.min(value657.w, 240 / scale),
                  h: 40 / scale,
                });
              deps.value293.current?.(input);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.setAsThumbnail"); },
            disabledReason: deps.value224.current
              ? current5.cover === input
                ? existingThumbnailMessage
                : value657 !== undefined &&
                    (0, shouldStoreArtboardByReference)(
                      value657,
                      deps.doc.content().files[input] ?? "",
                    )
                  ? oversizedThumbnailMessage
                  : undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              callback15() && deps.value590(input);
            },
          },
          {
            get label() { return value658 ? (deps.value224.current ? (uiMessage("canvas.designCanvas.edit")) : ("Stop")) : (uiMessage("canvas.designCanvas.playOnCanvas")); },
            disabledReason: value659,
            onClick: (): Dynamic => {
              value658
                ? deps.value224.current || deps.value225.current
                  ? deps.value274.current(input)
                  : deps.value384(null)
                : deps.value384(input);
            },
          },
          {
            get label() { return value657?.is_interactive === true && !value657.frameless ? (uiMessage("canvas.designCanvas.playFullScreen")) : (uiMessage("canvas.designCanvas.openFullWindow")); },
            disabledReason: undefined,
            onClick: (): Dynamic => {
              deps.value379.current(input);
            },
          },
          {
            get label() { return uiMessage("canvas.designCanvas.delete2", { value1: String(value655) }); },
            separatorBefore: true,
            danger: true,
            ...(value653 &&
            (current4.notes.size > 0 || current4.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: value656,
            onClick: (): Dynamic => {
              callback15() && deps.value449(value654);
            },
          },
        ];
      }

/** 打开画布说明或图形右键菜单时运行：生成复制、水平/垂直翻转与删除等菜单项，只读时禁用。 */
function buildAnnotationContextMenu(deps: { readonly selectionRef: Dynamic; readonly value150: Dynamic; readonly value152: Dynamic; readonly value224: Dynamic; readonly value314: Dynamic; readonly value323: Dynamic; readonly value459: Dynamic; readonly value46: Dynamic; readonly value589: Dynamic; readonly value591: Dynamic; readonly value73: Dynamic }, input?: Dynamic): Dynamic {
        let current4: Dynamic = deps.selectionRef.current,
          value653: Dynamic = current4.notes.has(input),
          state: Dynamic = {
            files: emptyBoardSelection.files,
            notes: value653 ? current4.notes : new Set([input]),
          };
        !value653 && deps.value224.current && deps.value314(state, "replace");
        let size: Dynamic = state.notes.size,
          value654: Dynamic = value653
            ? current4.artboards
            : emptyCanvasSelectionFiles,
          value655: Dynamic = size + value654.size,
          value656: Dynamic = (deps.value73.current.annotations ?? []).filter(
            (input2?: Dynamic): Dynamic => state.notes.has(input2.id),
          ),
          callback15: Dynamic = (input2?: Dynamic): Dynamic => {
            if (value653 && current4.elements.size > 0) return;
            let value657: Dynamic = (0, flipAnnotations)(
              value656,
              input2,
            );
            return value657.flips.length > 0 ? undefined : value657.refused;
          };
        return [
          {
            get label() { return uiMessage("canvas.designCanvas.copy", { value1: String(value655 > 1 ? " " + String(value655) + " objects" : "") }); },
            hotkey: "cmd+c",
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current && deps.value589(value654, state.notes);
            },
          },
          deps.value591(),
          {
            get label() { return KeyboardEditActionsCutCopyPasteConfig.duplicate.label + value655 > 1 ? " " + String(value655) + " objects" : ""; },
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig.duplicate
                .shortcut,
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current &&
                deps.value323.current({
                  files: value654,
                  notes: state.notes,
                });
            },
          },
          ...(!(value653 && current4.elements.size > 0) &&
          value656.every(
            (source?: Dynamic): Dynamic => source.kind === undefined,
          )
            ? []
            : ["horizontal", "vertical"]
          ).map(
            (input2?: Dynamic, options?: Dynamic): Dynamic => ({
              get label() { return uiMessage("canvas.designCanvas.flip2", { value1: String(input2) }); },
              separatorBefore: options === 0,
              hotkey: input2 === "horizontal" ? "shift+h" : "shift+v",
              disabledReason: deps.value224.current
                ? ((value653 ? deps.value150() : undefined) ?? callback15(input2))
                : ViewOnlyYouCanInspectThisMessage,
              onClick: (): Dynamic => {
                value653
                  ? deps.value152.current(input2)
                  : deps.value46.current(state.notes, input2);
              },
            }),
          ),
          {
            get label() { return uiMessage("canvas.designCanvas.delete2", { value1: String(size > 1 ? " " + String(size) + " objects" : "") }); },
            separatorBefore: true,
            danger: true,
            ...(value653 &&
            (current4.artboards.size > 0 || current4.elements.size > 0)
              ? null
              : {
                  hotkey: "backspace",
                }),
            disabledReason: deps.value224.current
              ? undefined
              : ViewOnlyYouCanInspectThisMessage,
            onClick: (): Dynamic => {
              deps.value224.current && deps.value459.current(state);
            },
          },
        ];
      }

/** 画板列表或选择变化时计算（useMemo）：生成大纲面板的画板行、选中状态、封面、右键操作与重命名回调。 */
function buildOutlineArtboardRows(deps: { readonly abandonSelectionGesture: Dynamic; readonly setSelection: Dynamic; readonly value168: Dynamic; readonly value169: Dynamic; readonly value170: Dynamic; readonly value224: Dynamic; readonly value273: Dynamic; readonly value314: Dynamic; readonly value397: Dynamic; readonly value40: Dynamic; readonly value543: Dynamic; readonly value544: Dynamic; readonly value545: Dynamic; readonly value546: Dynamic; readonly value547: Dynamic; readonly value549: Dynamic; readonly value551: Dynamic; readonly value552: Dynamic; readonly value559: Dynamic; readonly value578: Dynamic; readonly value581: Dynamic; readonly value587: Dynamic; readonly value588: Dynamic; readonly value592: Dynamic; readonly value593: Dynamic; readonly value596: Dynamic; readonly value600: Dynamic; readonly value601: Dynamic; readonly value62: Dynamic; readonly value86: Dynamic }): Dynamic {
  return {
        rows: deps.value86.artboards.map(
          (input?: Dynamic): Dynamic => ({
            file: input.file,
            label: input.title ?? input.file.replace(/\.dc\.html$/, ""),
          }),
        ),
        selected: deps.value168,
        cover: deps.value601,
        contextActions: deps.value592,
        renaming: deps.value587,
        onRename: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value588(null);
          options != null && deps.value224.current && deps.value397(input, options);
        },
        selectedIn: deps.value170,
        open: deps.value543,
        trees: deps.value547,
        expanded: deps.value545,
        scroll: deps.value551,
        cursor: deps.value552,
        revealed: deps.value600,
        objects: deps.value596,
        selectedObjects: deps.value169,
        onSelectObject: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value224.current &&
            deps.value314(
              (0, boardSelectionItems)({
                note: input,
              }),
              options ? "toggle" : "replace",
            );
        },
        objectContextActions: deps.value593,
        onToggleOpen: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value544((input2?: Dynamic): Dynamic => {
            if (input2.has(input) === options) return input2;
            let values: Dynamic = new Set(input2);
            options ? values.add(input) : values.delete(input);
            return values;
          }),
        onExpandedChange: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value546(
            (input2?: Dynamic): Dynamic => ({
              ...input2,
              [input]: options,
            }),
          ),
        onSelectIn: (input?: Dynamic, options?: Dynamic): Dynamic => {
          deps.value559(input);
          deps.value581(input, options);
        },
        onFocus: (input?: Dynamic): Dynamic => {
          deps.abandonSelectionGesture();
          deps.value544(
            (input2?: Dynamic): Dynamic =>
              input2.has(input) ? input2 : new Set([...input2, input]),
          );
          deps.value62();
          deps.setSelection((0, selectionFromArtboards)(new Set([input])));
          deps.value273(input);
          deps.value559(input);
          deps.value549.current[input] === null && deps.value40(input);
        },
        onToggleSelected: (input?: Dynamic): Dynamic => deps.value578(input, true),
      };
}

/** 注册缩放与参考线快捷键：处理放大、缩小、适应等缩放组合键与参考线开关，并播报缩放比例。 */
function subscribeZoomShortcuts(deps: { readonly value105: Dynamic; readonly value13: Dynamic; readonly value285: Dynamic; readonly value345: Dynamic; readonly value617: Dynamic; readonly value619: Dynamic }): Dynamic {
    let callback15: Dynamic = (input?: Dynamic): Dynamic => {
        deps.value345.current ||
          (input === "0"
            ? deps.value619()
            : deps.value617(deps.value105.get().scale * (input === "-" ? 0.8 : 1.25)),
          (0, announce)(
            (): Dynamic =>
              (0, zoomAnnouncement)(deps.value105.get().scale),
          ));
      },
      callback16: Dynamic = (event?: Dynamic): Dynamic => {
        if (
          event.defaultPrevented ||
          deps.value285.current ||
          !(event.metaKey || event.ctrlKey) ||
          event.altKey ||
          (event.key !== "0" &&
            event.key !== "=" &&
            event.key !== "+" &&
            event.key !== "-")
        )
          return;
        let target: Dynamic = event.target;
        target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          (event.preventDefault(),
          callback15(
            event.key === "0" ? "0" : event.key === "-" ? "-" : "+",
          ));
      },
      callback17: Dynamic = (input?: Dynamic): Dynamic =>
        callback15(input.detail.key),
      callback18: Dynamic = (): Dynamic => {
        deps.value345.current || deps.value13((input?: Dynamic): Dynamic => !input);
      },
      callback19: Dynamic = (event?: Dynamic): Dynamic => {
        event.key.toLowerCase() !== "g" ||
          !event.shiftKey ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey ||
          event.defaultPrevented ||
          event.repeat ||
          (0, isEditingInputTarget)(event.target) ||
          (0, hasBlockingEditorOverlay)() ||
          (event.preventDefault(), callback18());
      };
    (window as Dynamic).addEventListener("keydown", callback16);
    (window as Dynamic).addEventListener("keydown", callback19);
    (window as Dynamic).addEventListener("canvas-zoom-chord", callback17);
    (window as Dynamic).addEventListener("canvas-guides-toggle", callback18);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", callback16);
      (window as Dynamic).removeEventListener("keydown", callback19);
      (window as Dynamic).removeEventListener(
        "canvas-zoom-chord",
        callback17,
      );
      (window as Dynamic).removeEventListener(
        "canvas-guides-toggle",
        callback18,
      );
    };
  }

/** 渲染页面列表中的单个页面项及其操作菜单（重命名、删除）；没有页面时使用默认 Page 1。 */
function renderPageTabItem(deps: { readonly editing: Dynamic; readonly value275: Dynamic; readonly value281: Dynamic; readonly value283: Dynamic; readonly value298: Dynamic; readonly value299: Dynamic; readonly value301: Dynamic; readonly value306: Dynamic; readonly value455: Dynamic; readonly value67: Dynamic; readonly value77: Dynamic; readonly value79: Dynamic }, input?: Dynamic): Dynamic {
            let value653: Dynamic = input.id === deps.value79 && !deps.value283,
              length: Dynamic = deps.value67.artboards.filter(
                (input2?: Dynamic): Dynamic =>
                  (0, designPageId)(input2, deps.value67.pages) ===
                  input.id,
              ).length;
            return (() => {
              const _Component = "div";
              const _props = {
                className: "flex items-center gap-0.5",
                children: [
                  <div className={"min-w-0 flex-1"}>
                    <EditorMenuItem
                      icon={null}
                      checked={value653}
                      onClick={(): Dynamic => {
                        deps.value281(false);
                        deps.value283 && deps.value301();
                        input.id === deps.value79
                          ? deps.value299()
                          : input.id !== "" &&
                            deps.value275((): Dynamic => deps.value298(input.id));
                      }}
                    >
                      <span className={"relative min-w-0 flex-1 truncate"}>
                        {input.name}
                        <span className={"sr-only"}>
                          {", artboards: "}
                          {length}
                        </span>
                      </span>
                    </EditorMenuItem>
                  </div>,
                  deps.editing ? (
                    <MenuMenuAssignValue
                      iconOnly={true}
                      icon={"DotsHorizontal"}
                      variant={"ghost"}
                      align={"end"}
                      disabled={false}
                      disabledReason={undefined}
                      aria-label={
                        uiMessage("canvas.designCanvas.pageActions", { value1: String(input.name) })
                      }
                      className={"shrink-0"}
                      items={[
                        {
                          get label() { return uiMessage("canvas.designCanvas.rename"); },
                          onSelect: (): Dynamic => {
                            deps.value281(false);
                            deps.value306(input.id);
                          },
                        },
                        {
                          get label() { return uiMessage("canvas.designCanvas.delete"); },
                          variant: "danger",
                          disabled: deps.value77.length < 2,
                          disabledReason: canvasNeedsPageMessage,
                          onSelect: (): Dynamic => {
                            deps.value281(false);
                            deps.value275((): Dynamic => {
                              deps.value455(input.id);
                            });
                          },
                        },
                      ]}
                    />
                  ) : null,
                ],
              } as const;
              const _key = input.id || "implicit";
              return <_Component key={_key} {..._props} />;
            })();
          }

/** 交互层（onManifestChange）拖动、缩放或旋转画板与画布图形时运行：预览期间只更新状态，提交时写回页面清单并记录移动、缩放、变换历史与播报。 */
function commitInteractionLayerChange(deps: { readonly value143: Dynamic; readonly value169: Dynamic; readonly value413: Dynamic; readonly value67: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
                      options?: Dynamic,
                      context?: Dynamic): Dynamic {
                      let value653: Dynamic = (0,
                        replaceDesignPageContents)(
                          deps.value73.current,
                          deps.value80.current,
                          input,
                        ),
                        value654: Dynamic = options
                          ? deps.value72(value653)
                          : value653;
                      if (!options) {
                        deps.value73.current = value654;
                        deps.value68(value654);
                        return;
                      }
                      let {
                          moved: value655,
                          resizedFrom: value656,
                          movedNotes: value657,
                          transformed: value658,
                        }: Dynamic = context ?? {},
                        callback15: Dynamic = (
                          input2?: Dynamic,
                          options2?: Dynamic,
                        ): Dynamic =>
                          Math.round(input2.x) !== Math.round(options2.x) ||
                          Math.round(input2.y) !== Math.round(options2.y),
                        value659: Dynamic = value654.artboards.flatMap(
                          (input2?: Dynamic): Dynamic => {
                            let value679: Dynamic = value655?.get(
                              input2.file,
                            );
                            return value679 && callback15(value679, input2)
                              ? [
                                  {
                                    file: input2.file,
                                    from: {
                                      x: value679.x,
                                      y: value679.y,
                                    },
                                    to: {
                                      x: input2.x,
                                      y: input2.y,
                                    },
                                  },
                                ]
                              : [];
                          },
                        ),
                        value660: Dynamic = (
                          value654.annotations ?? []
                        ).flatMap((input2?: Dynamic): Dynamic => {
                          let value679: Dynamic = value657?.get(input2.id);
                          return value679 && callback15(value679, input2)
                            ? [
                                {
                                  id: input2.id,
                                  from: {
                                    x: value679.x,
                                    y: value679.y,
                                  },
                                  to: {
                                    x: input2.x,
                                    y: input2.y,
                                  },
                                },
                              ]
                            : [];
                        }),
                        value661: Dynamic =
                          value660.length > 1 ||
                          (value660.length > 0 && value659.length > 0) ||
                          (value660.length > 0 &&
                            context?.bound !== undefined)
                            ? value660
                            : [],
                        value662: Dynamic =
                          context?.bound !== undefined
                            ? deps.value143.current.get(context.bound)
                            : undefined;
                      value662
                        ? value662({
                            moves: value659,
                            annMoves: value661,
                          })
                        : (value659.length > 0 || value661.length > 0) &&
                          deps.value413(
                            {
                              kind: "move",
                              moves: value659,
                              ...(value661.length > 0
                                ? {
                                    anns: value661,
                                  }
                                : {}),
                            },
                            new Set(),
                            undefined,
                            context?.bound,
                          );
                      let values: Dynamic = new Set(
                        value661.map(
                          (input2?: Dynamic): Dynamic => input2.id,
                        ),
                      );
                      if (value658) {
                        let callback21: Dynamic = (
                            input2?: Dynamic,
                            options2?: Dynamic,
                          ): Dynamic => {
                            let value681: Dynamic = Object.keys(
                              input2,
                            ).filter(
                              (input3?: Dynamic): Dynamic =>
                                value658.keys.has(input3) &&
                                input2[input3] !== options2[input3],
                            );
                            return value681.length === 0
                              ? null
                              : {
                                  from: Object.fromEntries(
                                    value681.map(
                                      (input3?: Dynamic): Dynamic => [
                                        input3,
                                        input2[input3],
                                      ],
                                    ),
                                  ),
                                  to: Object.fromEntries(
                                    value681.map(
                                      (input3?: Dynamic): Dynamic => [
                                        input3,
                                        options2[input3],
                                      ],
                                    ),
                                  ),
                                };
                          },
                          value679: Dynamic = value654.artboards.flatMap(
                            (input2?: Dynamic): Dynamic => {
                              let entry: Dynamic = value658.boards.get(
                                  input2.file,
                                ),
                                value681: Dynamic =
                                  entry &&
                                  callback21(
                                    (0, artboardTransformSnapshot)(
                                      entry,
                                    ),
                                    (0, artboardTransformSnapshot)(
                                      input2,
                                    ),
                                  );
                              return value681
                                ? [
                                    {
                                      file: input2.file,
                                      ...value681,
                                    },
                                  ]
                                : [];
                            },
                          ),
                          value680: Dynamic = (
                            value654.annotations ?? []
                          ).flatMap((input2?: Dynamic): Dynamic => {
                            let entry: Dynamic = value658.notes.get(
                                input2.id,
                              ),
                              value681: Dynamic =
                                entry &&
                                callback21(
                                  (0, annotationTransformSnapshot)(
                                    entry,
                                  ),
                                  (0, annotationTransformSnapshot)(
                                    input2,
                                  ),
                                );
                            return value681
                              ? [
                                  {
                                    id: input2.id,
                                    ...value681,
                                  },
                                ]
                              : [];
                          });
                        if (value679.length === 0 && value680.length === 0) {
                          deps.value68(value654);
                          return;
                        }
                        deps.value413(
                          {
                            kind: "transform",
                            label: value658.label,
                            boards: value679,
                            anns: value680,
                          },
                          new Set(),
                        );
                        for (let value681 of value658.notes.keys() as Dynamic)
                          values.add(value681);
                      }
                      let value663: Dynamic = value656,
                        value664: Dynamic = value663
                          ? value654.artboards.find(
                              (input2?: Dynamic): Dynamic =>
                                input2.file === value663.file &&
                                (Math.round(value663.w) !==
                                  Math.round(input2.w) ||
                                  Math.round(value663.h) !==
                                    Math.round(input2.h)),
                            )
                          : undefined;
                      value663 &&
                        value664 &&
                        deps.value413(
                          {
                            kind: "resize",
                            file: value664.file,
                            from: {
                              x: value663.x,
                              y: value663.y,
                              w: value663.w,
                              h: value663.h,
                            },
                            to: {
                              x: value664.x,
                              y: value664.y,
                              w: value664.w,
                              h: value664.h,
                            },
                          },
                          new Set(),
                        );
                      let value665: Dynamic =
                          (deps.value70.current ?? deps.value67).annotations ?? [],
                        value666: Dynamic = value654.annotations ?? [],
                        callback16: Dynamic = (input2?: Dynamic): Dynamic => {
                          for (let value679 of value666 as Dynamic) {
                            let value680: Dynamic = values.has(value679.id)
                              ? undefined
                              : value665.find(
                                  (input3?: Dynamic): Dynamic =>
                                    input3.id === value679.id,
                                );
                            if (
                              value680 &&
                              !(0, isShapeAnnotation)(value680) &&
                              !(0, isShapeAnnotation)(value679) &&
                              input2(value680, value679)
                            )
                              return [value680, value679];
                          }
                          return null;
                        },
                        callback17: Dynamic = (input2?: Dynamic): Dynamic => {
                          for (let value679 of value666 as Dynamic) {
                            let value680: Dynamic = values.has(value679.id)
                              ? undefined
                              : value665.find(
                                  (input3?: Dynamic): Dynamic =>
                                    input3.id === value679.id,
                                );
                            if (
                              value680 &&
                              (0, isShapeAnnotation)(value680) &&
                              (0, isShapeAnnotation)(value679) &&
                              input2(value680, value679)
                            )
                              return [value680, value679];
                          }
                          return null;
                        },
                        callback18: Dynamic = (
                          input2?: Dynamic,
                        ): Dynamic => ({
                          x: input2.x,
                          y: input2.y,
                          w: input2.w,
                          h: input2.h,
                          d: input2.d,
                        }),
                        value667: Dynamic = callback17(
                          (source?: Dynamic, source2?: Dynamic): Dynamic =>
                            source.kind === "pen" &&
                            source2.kind === "pen" &&
                            source.d !== source2.d,
                        );
                      value667 &&
                        value667[0].kind === "pen" &&
                        value667[1].kind === "pen" &&
                        deps.value413(
                          {
                            kind: "ann-path",
                            id: value667[1].id,
                            from: callback18(value667[0]),
                            to: callback18(value667[1]),
                          },
                          new Set(),
                        );
                      let callback19: Dynamic = (input2?: Dynamic): Dynamic =>
                          JSON.stringify(
                            Object.values(
                              (0, annotationGeometry)(input2),
                            ).map(Math.round as Dynamic),
                          ),
                        value668: Dynamic = callback17(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            callback19(input2) !== callback19(options2) &&
                            options2.id !== value667?.[1].id,
                        ),
                        value669: Dynamic = callback17(
                          (source?: Dynamic, source2?: Dynamic): Dynamic =>
                            source.kind === "image" &&
                            source2.kind === "image" &&
                            JSON.stringify(source.crop ?? null) !==
                              JSON.stringify(source2.crop ?? null),
                        ),
                        value670: Dynamic =
                          value669 !== null &&
                          value668 !== null &&
                          value668[1].id === value669[1].id;
                      value668 &&
                        !value670 &&
                        deps.value413(
                          {
                            kind: "ann-box",
                            id: value668[1].id,
                            from: (0, annotationGeometry)(
                              value668[0],
                            ),
                            to: (0, annotationGeometry)(value668[1]),
                          },
                          new Set(),
                        );
                      let callback20: Dynamic = (input2?: Dynamic): Dynamic =>
                          JSON.stringify(input2.css ?? null),
                        value671: Dynamic = callback17(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            (input2.color ?? "default") !==
                            (options2.color ?? "default"),
                        ),
                        value672: Dynamic = callback17(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            callback20(input2) !== callback20(options2),
                        );
                      if (value669) {
                        let [value679, value680]: Dynamic = value669;
                        deps.value413(
                          {
                            kind: "ann-crop",
                            id: value680.id,
                            from: value679.crop,
                            to: value680.crop,
                            ...(callback20(value679) !== callback20(value680)
                              ? {
                                  cssFrom: value679.css,
                                  cssTo: value680.css,
                                }
                              : {}),
                            ...(value670
                              ? {
                                  geomFrom: (0, annotationGeometry)(
                                    value679,
                                  ),
                                  geomTo: (0, annotationGeometry)(
                                    value680,
                                  ),
                                }
                              : {}),
                          },
                          new Set(),
                        );
                      } else
                        value671
                          ? deps.value413(
                              {
                                kind: "ann-color",
                                id: value671[1].id,
                                from: value671[0].color ?? "default",
                                to: value671[1].color ?? "default",
                                ...(value672
                                  ? {
                                      cssFrom: value671[0].css,
                                      cssTo: value671[1].css,
                                    }
                                  : {}),
                              },
                              new Set(),
                            )
                          : value672 &&
                            deps.value413(
                              {
                                kind: "ann-css",
                                id: value672[1].id,
                                from: value672[0].css,
                                to: value672[1].css,
                              },
                              new Set(),
                            );
                      let value673: Dynamic = callback16(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            Math.round(input2.x) !== Math.round(options2.x) ||
                            Math.round(input2.y) !== Math.round(options2.y),
                        ),
                        value674: Dynamic =
                          (0, PlatformFileContentHas)(
                            value665,
                            value666,
                            new Set(
                              [...deps.value169].filter(
                                (input2?: Dynamic): Dynamic =>
                                  !values.has(input2),
                              ),
                            ),
                          ) ??
                          (value673 &&
                          Math.round(value673[0].w) !==
                            Math.round(value673[1].w)
                            ? value673
                            : null);
                      if (value674) {
                        let [value679, value680]: Dynamic = value674,
                          callback21: Dynamic = (input2?: Dynamic): Dynamic =>
                            Object.fromEntries(
                              ["x", "y", "w", "maxW", "maxH"]
                                .filter(
                                  (input3?: Dynamic): Dynamic =>
                                    value679[input3] !== value680[input3],
                                )
                                .map(
                                  (input3?: Dynamic): Dynamic => [
                                    input3,
                                    input2[input3],
                                  ],
                                ),
                            );
                        deps.value413(
                          {
                            kind: "transform",
                            get label() { return uiMessage("canvas.designCanvas.resize"); },
                            boards: [],
                            anns: [
                              {
                                id: value680.id,
                                from: callback21(value679),
                                to: callback21(value680),
                              },
                            ],
                          },
                          new Set(),
                        );
                      } else
                        value673 &&
                          deps.value413(
                            {
                              kind: "ann-move",
                              id: value673[1].id,
                              from: {
                                x: value673[0].x,
                                y: value673[0].y,
                              },
                              to: {
                                x: value673[1].x,
                                y: value673[1].y,
                              },
                            },
                            new Set(),
                          );
                      let value675: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          Math.round(input2.w) !== Math.round(options2.w),
                      );
                      value675 &&
                        !value674 &&
                        deps.value413(
                          {
                            kind: "ann-resize",
                            id: value675[1].id,
                            from: value675[0].w,
                            to: value675[1].w,
                          },
                          new Set(),
                        );
                      let value676: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          input2.text !== options2.text,
                      );
                      value676 &&
                        deps.value413(
                          {
                            kind: "ann-text",
                            id: value676[1].id,
                            from: value676[0].text,
                            to: value676[1].text,
                          },
                          new Set(),
                        );
                      let value677: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                          let [items, items2]: Dynamic = [
                            (0, annotationTextStyle)(input2),
                            (0, annotationTextStyle)(options2),
                          ];
                          return Object.keys(items).some(
                            (input3?: Dynamic): Dynamic =>
                              items[input3] !== items2[input3],
                          );
                        },
                      );
                      value677 &&
                        deps.value413(
                          {
                            kind: "ann-style",
                            id: value677[1].id,
                            from: (0, annotationTextStyle)(
                              value677[0],
                            ),
                            to: (0, annotationTextStyle)(value677[1]),
                            ...(value677[0].kind !== value677[1].kind &&
                            (value677[0].maxW !== value677[1].maxW ||
                              value677[0].maxH !== value677[1].maxH)
                              ? {
                                  caps: {
                                    from: {
                                      maxW: value677[0].maxW,
                                      maxH: value677[0].maxH,
                                    },
                                    to: {
                                      maxW: value677[1].maxW,
                                      maxH: value677[1].maxH,
                                    },
                                  },
                                }
                              : {}),
                          },
                          new Set(),
                        );
                      let value678: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          (input2.rotate ?? 0) !== (options2.rotate ?? 0),
                      );
                      value678 &&
                        deps.value413(
                          {
                            kind: "transform",
                            get label() { return uiMessage("canvas.designCanvas.rotate"); },
                            boards: [],
                            anns: [
                              {
                                id: value678[1].id,
                                from: {
                                  rotate: value678[0].rotate ?? 0,
                                },
                                to: {
                                  rotate: value678[1].rotate ?? 0,
                                },
                              },
                            ],
                          },
                          new Set(),
                        );
                      deps.value98(value654);
                    }

/** 属性面板点击替换图片时运行：打开文件选择框，上传所选图片并替换选中图片元素的地址。 */
function pickReplacementImage(deps: { readonly value177: Dynamic; readonly value188: Dynamic; readonly value244: Dynamic; readonly value63: Dynamic; readonly value64: Dynamic }): Dynamic {
                                    let probeEl: Dynamic = deps.value244.probeEl;
                                    if (!probeEl) return;
                                    if (
                                      /\{\{/.test(
                                        deps.value244.seed.imageSrc ?? "",
                                      )
                                    )
                                      return deps.value188(
                                        "This image comes from the design's script \u2014 change it in Properties.",
                                      );
                                    let value653: Dynamic = deps.value63?.identity,
                                      value654: Dynamic = (
                                        document as Dynamic
                                      ).createElement("input");
                                    value654.type = "file";
                                    value654.accept = "image/*";
                                    value654.hidden = true;
                                    (document as Dynamic).body.appendChild(
                                      value654,
                                    );
                                    value654.addEventListener(
                                      "cancel",
                                      (): Dynamic => value654.remove(),
                                    );
                                    value654.onchange = (): Dynamic => {
                                      let value655: Dynamic =
                                        value654.files?.[0];
                                      value654.remove();
                                      value655 &&
                                        (0, trackEmbeddedWrite)(
                                          (0, uploadDesignFile)(
                                            "appifact",
                                            null,
                                            value655,
                                          ).then(
                                            ({
                                              src: src,
                                            }: Dynamic): Dynamic =>
                                              (0, isEmbedFrozen)() ||
                                              deps.value64.current?.identity !==
                                                value653
                                                ? null
                                                : (deps.value177.current
                                                    .get(probeEl.file)
                                                    ?.replaceImageFor(
                                                      probeEl.tid,
                                                      {
                                                        src: src,
                                                        height: null,
                                                        srcset: null,
                                                      },
                                                    ) ?? false),
                                          ),
                                        )
                                          .then(
                                            (input?: Dynamic): Dynamic => {
                                              input === false &&
                                                deps.value188(
                                                  "That image could not be placed here.",
                                                );
                                            },
                                          )
                                          .catch(
                                            (): Dynamic =>
                                              deps.value188(
                                                "Image upload failed.",
                                              ),
                                          );
                                    };
                                    value654.click();
                                  }

/** 属性面板点击替换视频时运行：打开文件选择框，校验与探测视频、上传后替换选中视频元素，并播报结果。 */
function pickReplacementVideo(deps: { readonly value177: Dynamic; readonly value188: Dynamic; readonly value244: Dynamic; readonly value271: Dynamic }): Dynamic {
                                    let probeEl: Dynamic = deps.value244.probeEl;
                                    if (!probeEl) return;
                                    let value653: Dynamic =
                                      deps.value177.current
                                        .get(probeEl.file)
                                        ?.videoKey(probeEl.tid) ?? null;
                                    if (value653 === null)
                                      return deps.value188(
                                        "This video can't be replaced: it has no file of its own.",
                                      );
                                    if (value653.src.includes("{{"))
                                      return deps.value188(
                                        "This video's file comes from the design's data, so it can't be replaced here.",
                                      );
                                    let value654: Dynamic = (
                                      document as Dynamic
                                    ).createElement("input");
                                    value654.type = "file";
                                    value654.accept =
                                      VideoMp4VideoWebmVideoQuicktimeMovValue;
                                    value654.hidden = true;
                                    (document as Dynamic).body.appendChild(
                                      value654,
                                    );
                                    value654.addEventListener(
                                      "cancel",
                                      (): Dynamic => value654.remove(),
                                    );
                                    value654.onchange = (): Dynamic => {
                                      let value655: Dynamic =
                                        value654.files?.[0];
                                      value654.remove();
                                      if (!value655) return;
                                      if (!(0, isVideoFile)(value655))
                                        return deps.value188(
                                          "Pick a video file to replace a video.",
                                        );
                                      let value656: Dynamic = (0,
                                      videoUploadRefusal)(value655);
                                      if (value656 !== null)
                                        return deps.value188(
                                          (0,
                                          CanvasWorkingStateReplace)(
                                            (0,
                                            videoUploadFailureMessage)(
                                              value656,
                                            ),
                                          ),
                                        );
                                      (0, announce)(
                                        "Uploading video",
                                      );
                                      (0, trackEmbeddedWrite)(
                                        (async (): Promise<Dynamic> => {
                                          let value657: Dynamic = await (0,
                                          probeVideoFile)(
                                            value655,
                                          ).catch(
                                            (): Dynamic => "probe_timeout",
                                          );
                                          if (typeof value657 == "string") {
                                            deps.value188(
                                              (0,
                                              CanvasWorkingStateReplace)(
                                                (0,
                                                videoUploadFailureMessage)(
                                                  value657,
                                                ),
                                              ),
                                            );
                                            return false;
                                          }
                                          let value658: Dynamic = await (0,
                                          uploadDesignVideo)(
                                            value655,
                                            value657,
                                          );
                                          if ((0, isEmbedFrozen)())
                                            return false;
                                          if ("refused" in value658) {
                                            deps.value188(
                                              (0,
                                              CanvasWorkingStateReplace)(
                                                value658.refused,
                                              ),
                                            );
                                            return false;
                                          }
                                          let callback15: Dynamic =
                                              (): Dynamic =>
                                                probeEl.file ===
                                                deps.value271.current
                                                  ? undefined
                                                  : deps.value177.current.get(
                                                      probeEl.file,
                                                    ),
                                            value659: Dynamic = callback15();
                                          for (
                                            let index: Dynamic = 0;
                                            !value659 &&
                                            index < 240 &&
                                            !(0, isEmbedFrozen)();
                                            index++
                                          ) {
                                            await new Promise(
                                              (input?: Dynamic): Dynamic =>
                                                setTimeout(input, 250),
                                            );
                                            value659 = callback15();
                                          }
                                          if ((0, isEmbedFrozen)())
                                            return false;
                                          if (!value659) {
                                            deps.value188(
                                              "The video wasn't replaced: its artboard isn't open for editing. Open it and replace the video again.",
                                            );
                                            return false;
                                          }
                                          let value660: Dynamic =
                                            await value659.replaceVideoFor(
                                              value653,
                                              {
                                                src: value658.src,
                                                width: value657.width,
                                                height: value657.height,
                                              },
                                            );
                                          value660 === "ok"
                                            ? (0, announce)(
                                                "Video replaced",
                                              )
                                            : deps.value188(
                                                value660 === "unsure"
                                                  ? "The video wasn't replaced: a copy of it was added or removed meanwhile, so which one you meant can't be told. Select it and replace it again."
                                                  : value660 === "gone"
                                                    ? "The video wasn't replaced: it was changed or removed meanwhile. Select the video and replace it again."
                                                    : "The video wasn't replaced: the new file couldn't be used. Pick another .mp4, .mov or .webm.",
                                              );
                                          return value660 === "ok";
                                        })(),
                                      );
                                    };
                                    value654.click();
                                  }

/** 在评论面板点击某条评论时运行（onRevealComment）：切换到评论所在页面并定位到对应画板或画布说明。 */
function revealCommentTarget(deps: { readonly editing: Dynamic; readonly readOnly: Dynamic; readonly value105: Dynamic; readonly value273: Dynamic; readonly value291: Dynamic; readonly value297: Dynamic; readonly value298: Dynamic; readonly value345: Dynamic; readonly value346: Dynamic; readonly value348: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value99: Dynamic }, source?: Dynamic): Dynamic {
                      let current4: Dynamic = deps.value73.current,
                        value653: Dynamic = null,
                        value654: Dynamic = null,
                        value655: Dynamic;
                      if (source.kind === "artboard") {
                        value655 = current4.artboards.find(
                          (input?: Dynamic): Dynamic =>
                            source.match(input.file),
                        );
                        value655 &&
                          ([value653, value654] = [
                            (0, designPageId)(
                              value655,
                              current4.pages,
                            ),
                            value655.file,
                          ]);
                      } else if (source.kind === "note") {
                        let value657: Dynamic = (
                          current4.annotations ?? []
                        ).find(
                          (input?: Dynamic): Dynamic =>
                            source.match(input.id),
                        );
                        value657 &&
                          (value653 = (0, designPageId)(
                            value657,
                            current4.pages,
                          ));
                      } else {
                        let items: Dynamic = [
                          current4.pages?.[0]?.id ?? "",
                          ...(current4.pages ?? []).map(
                            (input?: Dynamic): Dynamic => input.id,
                          ),
                        ];
                        value653 =
                          items.find(
                            (input?: Dynamic): Dynamic =>
                              (0, isCanvasPageMatch)(
                                source.match,
                                input,
                                items[0],
                              ),
                          ) ?? null;
                      }
                      if (value653 == null) return false;
                      if (
                        deps.value99 &&
                        value655 &&
                        source.kind === "artboard" &&
                        !source.boards
                      ) {
                        let value657: Dynamic = value653 !== deps.value80.current;
                        value657 &&
                          (deps.value298(value653, value655.file),
                          (deps.value291.current = false));
                        let value658: Dynamic = value657
                            ? ((0, recallCanvasView)(value653) ??
                              defaultCanvasCamera)
                            : deps.value105.get(),
                          state: Dynamic = {
                            file: value655.file,
                            fit: artboardIsNotExpandedFill(value655),
                          };
                        state.file !== deps.value346.current &&
                          deps.value348(
                            (input?: Dynamic): Dynamic => ({
                              ...state,
                              prev: input?.prev ?? value658,
                            }),
                          );
                        return true;
                      }
                      deps.value345.current && deps.value297.current();
                      let value656: Dynamic =
                        value654 != null && (deps.editing || deps.readOnly)
                          ? value654
                          : undefined;
                      value653 !== deps.value80.current
                        ? (deps.value298(value653, value656),
                          (deps.value291.current = false))
                        : value656 !== undefined && deps.value273(value656);
                      return true;
                    }

export {
  artboardFrameReadyTimeoutMs,
  artboardFullscreenCamera,
  artboardIsNotExpandedFill,
  artboardRevealSettleTimeoutMs,
  canvasExitExportWaitTimeoutMs,
  canvasExportSettleTimeoutMs,
  canvasNeedsPageMessage,
  canvasPanUsageWindowMs,
  canvasPastePositionStep,
  CanvasSaveKeyboardShortcut,
  CanvasSaveStatus,
  canvasSelectionChromeInsetPixels,
  canvasSelectionsEqual,
  canvasZoomUsageWindow,
  crossCanvasPasteConfirmFeatureFlag,
  defaultCanvasCamera,
  DesignCanvas,
  dragGhostFilename,
  emptyCanvasFileSet,
  emptyCanvasNoteSet,
  emptyCanvasOptions,
  emptyCanvasSelectionFiles,
  existingThumbnailMessage,
  exportAlreadyRunningMessage,
  fitArtboardsLabel,
  hasActiveUserGesture,
  isCanvasReadonlySaveState,
  layerEntriesEqual,
  loosePiecePlaybackMessage,
  loosePieceRenameHint,
  maxSessionDirtyFlushRetries,
  MemoizedCanvasSaveIndicator,
  MemoizedCanvasZoomControl,
  minimumCanvasZoomUsage,
  nextArtboardPlacementPoint,
  noopCanvasSubscription,
  oversizedThumbnailMessage,
  pageHasNoArtboardsMessage,
  parallelCanvasCaptureSemaphore,
  previewDropNoticeDurationMs,
  readCanvasClipboardText,
  runWhenConditionReady,
  singleArtboardPngCopyMessage,
  singleArtboardSvgCopyMessage,
  singleCanvasCaptureSemaphore,
  staleDeleteFailureMessage,
  staticArtboardPlaybackMessage,
  useCanvasSaveState,
  zeroCanvasRevision,
};
export function installCanvasDesignCanvas(): () => void {
  return () => {
    noopCanvasSubscription = (): Dynamic => (): Dynamic => {};
    zeroCanvasRevision = (): Dynamic => 0;
    canvasNeedsPageMessage = uiMessage("canvas.designCanvas.aCanvasNeedsAtLeast");
    fitArtboardsLabel = uiMessage("canvas.designCanvas.fitArtboards");
    loosePieceRenameHint =
      uiMessage("canvas.designCanvas.aLoosePieceShowsNo");
    staleDeleteFailureMessage = (input?: Dynamic): Dynamic =>
      uiMessage("canvas.designCanvas.nothingWasDeleted") + input + "\u201D is now the only page.";
    singleArtboardPngCopyMessage =
      uiMessage("canvas.designCanvas.selectJustOneArtboardTo");
    singleArtboardSvgCopyMessage =
      uiMessage("canvas.designCanvas.selectJustOneArtboardTo2");
    staticArtboardPlaybackMessage =
      uiMessage("canvas.designCanvas.onlyPrototypeArtboardsMarkedInteractive");
    loosePiecePlaybackMessage =
      uiMessage("canvas.designCanvas.aLoosePieceDoesnT");
    pageHasNoArtboardsMessage = uiMessage("canvas.designCanvas.thisPageHasNoArtboards");
    existingThumbnailMessage = uiMessage("canvas.designCanvas.thisArtboardIsAlreadyThe");
    oversizedThumbnailMessage =
      uiMessage("canvas.designCanvas.thisArtboardIsTooLarge");
    MemoizedCanvasZoomControl = (0, reactChromeTheme.memo)(
      CanvasZoomControl,
    );
    MemoizedCanvasSaveIndicator = (0, reactChromeTheme.memo)(
      ToolbarPublishControls,
    );
    isCanvasReadonlySaveState = (state?: Dynamic): Dynamic =>
      state.status === "readonly" || state.status === "error"
        ? state.status
        : "live";
    CanvasSaveStatus = (0, reactChromeTheme.memo)(function ({
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
    CanvasSaveKeyboardShortcut = (0, reactChromeTheme.memo)(function ({
      doc: doc,
      synced: synced,
      localDirty: localDirty,
      onSave: onSave,
    }: Dynamic): Dynamic {
      let value: Dynamic = useCanvasSaveState(doc, synced, localDirty);
      (0, useFrameSaveState)(
        synced || value.status === "readonly" ? value.status : null,
        onSave,
      );
      return null;
    });
    artboardRevealSettleTimeoutMs = 2 * PickerBridgeConstant_2 + 2e3;
    artboardFrameReadyTimeoutMs = 12e3;
    dragGhostFilename = "__drag-ghost.dc.html";
    previewDropNoticeDurationMs = 8e3;
    canvasExportSettleTimeoutMs = 2e4;
    exportAlreadyRunningMessage =
      uiMessage("canvas.designCanvas.anotherExportIsStillRunning");
    maxSessionDirtyFlushRetries = 3;
    canvasExitExportWaitTimeoutMs = 1e4;
    crossCanvasPasteConfirmFeatureFlag = "design_cross_canvas_paste_confirm";
    emptyCanvasFileSet = new Set();
    emptyCanvasSelectionFiles = emptyCanvasFileSet;
    emptyCanvasOptions = {};
    layerEntriesEqual = (items?: Dynamic, items2?: Dynamic): Dynamic =>
      items.length === items2.length &&
      items.every((source?: Dynamic, options?: Dynamic): Dynamic => {
        let value: Dynamic = items2[options];
        return (
          source.tid === value.tid &&
          source.kind === value.kind &&
          source.label === value.label &&
          source.glyph === value.glyph &&
          source.detail === value.detail &&
          source.hidden === value.hidden &&
          source.grayed === value.grayed &&
          source.component?.ref === value.component?.ref &&
          source.component?.kind === value.component?.kind &&
          source.noHide === value.noHide &&
          source.tag === value.tag &&
          layerEntriesEqual(source.children, value.children)
        );
      });
    emptyCanvasNoteSet = new Set();
    singleCanvasCaptureSemaphore = new TokenBucket(1, 1);
    parallelCanvasCaptureSemaphore = new TokenBucket(6, 6);
    artboardIsNotExpandedFill = (input?: Dynamic): Dynamic =>
      input?.expand !== "fill";
    canvasPastePositionStep = 24;
    defaultCanvasCamera = {
      x: -60,
      y: -80,
      scale: 0.5,
    };
    canvasPanUsageWindowMs = 6e4;
    canvasZoomUsageWindow = 12;
    minimumCanvasZoomUsage = 0.02;
    hasActiveUserGesture = (): Dynamic =>
      navigator.userActivation?.isActive === true;
    canvasSelectionChromeInsetPixels = 48;
  };
}

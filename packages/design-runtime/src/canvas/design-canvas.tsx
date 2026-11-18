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
import { useCommentCardsViewToggle } from "../comments/comment-cards";
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
import { annotationToElementHtml, deriveAnnotationSettings, flipAnnotationsWithHistory, replaceAnnotationMedia, replaceAnnotationPicture, setAnnotationBox, setAnnotationCss, setAnnotationTextStyle } from "./design-canvas/annotations";
import { addBlankArtboard, commitInteractionLayerChange, deleteBoardsAndNotes, duplicateArtboardFiles, duplicateBoardsAndNotes, duplicateSelectedBoards, fitArtboardHeightToContent, nudgeBoardsWithHistory, resizeArtboardFromInput, syncFramelessArtboardHull } from "./design-canvas/artboards";
import { buildSystemClipboardPayload, copyArtboardAsPng, copyArtboardAsSvg, copyBoardsToClipboard, pasteBoardsFromClipboard, pasteExternalClipboardPayload, pasteHtmlIntoArtboard, subscribeClipboardEvents } from "./design-canvas/clipboard";
import { revealCommentTarget } from "./design-canvas/comments";
import { buildDragGhostPreview, commitElementMoveAcrossArtboards, commitPieceDragOntoCanvas, dropCanvasObjectIntoArtboard, dropElementDragAtCanvasPoint, handleFrameElementDragEvent, handleHostElementDragEvent, requestDropPlanPreview, trackObjectHoverOverArtboard } from "./design-canvas/drag";
import { placeDroppedImages, placeDroppedVideos } from "./design-canvas/drop";
import { captureArtboardPngsForExport, exportArtboardAsPng, exportArtboardSourceZip, producePdfExport, producePngExport, produceStandaloneHtml, runWithPlayPreviewClosed } from "./design-canvas/export";
import { buildFindCanvasAdapter } from "./design-canvas/find";
import { applyCanvasHistoryStep, applyUndoRedoStep, initSessionHistoryKeeper, recordCanvasHistoryStep } from "./design-canvas/history";
import { buildHostedEditorCanvasApi, reportDesignContextSnapshot } from "./design-canvas/host";
import { dispatchCanvasCommand, subscribeCanvasKeyDown, subscribeZoomShortcuts } from "./design-canvas/keyboard";
import { promptRenamePage, renderPageTabItem } from "./design-canvas/pages";
import { subscribePlayModeKeys, subscribePreviewOpenMessages } from "./design-canvas/preview";
import { deriveSelectionInspectorProbe, pickReplacementImage, pickReplacementVideo } from "./design-canvas/props";
import { buildAnnotationContextMenu, buildArtboardContextMenu } from "./design-canvas/render";
import { buildOutlineArtboardRows, commitCanvasSelection, deleteSelectedElements, duplicateSelectedElements, flipSelectedObjects, focusArtboardAndReplaySelection, navigateSelectionByKind, routeFrameSelectionEvent, selectElementInArtboard } from "./design-canvas/selection";
import { applyPanZoomGesture, navigateToCanvasPlace } from "./design-canvas/viewport";

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
  let { showToast: showToast, hideToast: hideToast }: Dynamic = useToast(),
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
      let value653: Dynamic = beforeExport(
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
  let [value7, value8]: Dynamic = npm_useLocalStorage_QP(
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
    [value12, value13]: Dynamic = npm_useLocalStorage_QP(
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
      value14.current = !hasBlockingEditorOverlay();
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
            toggleCanvasElementIds(
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
              selectionFromElements(input, {
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
        OutlineGlyphsTest(doc.content().files[input] ?? "") &&
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
              selectionFromElements(input, {
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
          sameSelectedObjectFiles(
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
              mergeCanvasSelection(current4, input2, input),
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
          value653: Dynamic = reduceSessionCancellation(
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
        hasBlockingEditorOverlay() ||
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
        parseCanvasMetadata(
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
          ? reconcileCanvasManifestHistory(
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
            designArtboardsMatchFiles(input2, files) && !value654
              ? input2
              : value653 === undefined
                ? parseCanvasMetadata(
                    serializeCanvasMetadata(input2),
                    files,
                  )
                : (value655 ??= parseCanvasMetadata(
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
    let value653: Dynamic = reconcileCanvasManifestHistory(
      value67,
      current4,
      value70.current,
    );
    structurallyEqual(value653, value67) || value68(value653);
  }, [value67]);
  let [value74]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic => {
        let value653: Dynamic =
          embedMemoryPrefix() !== ""
            ? null
            : classifyPlaceLink();
        return value653 === null || value653.why === "known"
          ? null
          : prototypeFileFromPlaceFragment(
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
          return designPageId(value653, value67.pages);
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
          ? designPageId(value656, value67.pages)
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
  let value85: Dynamic = useInspectorPosture() === "sheet",
    value86: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => designPageContents(value67, value79),
      [value67, value79],
    ),
    value87: Dynamic = (0, reactChromeTheme.useRef)(value86);
  value87.current = value86;
  let [value88]: Dynamic = (0, reactChromeTheme.useState)(
      creationSequenceEnabled,
    ),
    value89: Dynamic = useDesignCreationProgress({
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
    value92: Dynamic = useClipboardFeatureFlag(),
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
        let value653: Dynamic = mergeMissingCanvasManifestMetadata(
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
        getKvClient()
          .set(
            PlatformFileContentHandler_4(
              canvasMetadataFile,
            ),
            serializeCanvasMetadata(value654),
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
        wasPhoneCanvasKilled(
          getPhoneCanvasStorage(),
          phoneCanvasStorageKey(),
        ),
    ),
    [value101]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic =>
        value74 ??
        initialFocusedArtboard({
          manifest: value67,
          pageId: value79,
          entryFile: filePath,
          embedded: embedMemoryPrefix() !== "",
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
        let value653: Dynamic = recallCanvasView(value79);
        return value653
          ? ((value102.current = true), value653)
          : defaultCanvasCamera;
      },
    ),
    [value105]: Dynamic = (0, reactChromeTheme.useState)(
      (): Dynamic =>
        createViewportStore(
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
          : pointerCoordinates(
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
    [value114, value115]: Dynamic = useToolbarOverlaySize(),
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
            designPageId(input, value67.pages) === value79,
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
            currentEditingArtboardPath() !==
              artboardStorePath(input) &&
            value131((input2?: Dynamic): Dynamic => input2 + 1));
      },
      [],
    ),
    value135: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        input !== focusedFileRef.current ||
          currentEditingArtboardPath() !==
            artboardStorePath(input) ||
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
        let value656: Dynamic = setCurrentEditingArtboard(
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
      let value653: Dynamic = setCurrentEditingArtboard(null);
      value653 !== null && doc.releaseHold?.(value653);
    },
    [doc],
  );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = doc;
    setArtboardWritableCheck(
      value653.theirsOnItsWay
        ? (input?: Dynamic): Dynamic => value653.theirsOnItsWay(input)
        : value653.releaseHold
          ? uiMessage("canvas.designCanvas.cannotTell")
          : null,
    );
    return (): Dynamic => setArtboardWritableCheck(null);
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
          emitEditorEvent("files-changed", {
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
      setFilePublishHandler((input?: Dynamic): Dynamic => {
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
      (): Dynamic => setFilePublishHandler(null)
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
              : setElementClipboard(
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
          : activeCropElement() !== null ||
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
        announce(input);
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
            filterSelectedElements(
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
            ...(isFlowExport(
              {
                expand: value654.expand,
              },
              value93,
            )
              ? {
                  fillPaginates: true,
                }
              : {}),
            paper: getArtboardPaperSize(value654),
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
          let value657: Dynamic = createPreviewHandle(
            value656.webviewRef.current,
          );
          value657 && setPickerHostScale(value657, input);
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
        announce(input);
        value187.current && clearTimeout(value187.current);
        value187.current = setTimeout((): Dynamic => value186(null), 6e3);
      },
      [],
    ),
    value189: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic): Dynamic => {
        value186(null);
        value187.current && clearTimeout(value187.current);
        announce(input);
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
        value653: Dynamic = handleInlineUndoKey(event, {
          editing: value224.current,
          filesOpen: value285.current,
          textEditOpen: current4 !== null,
          pending: value5.current,
          targetOwnsKey: (): Dynamic =>
            isCanvasTypingTarget(event.target),
          stepMadeDuringEdit: (input?: Dynamic): Dynamic =>
            current4 !== null &&
            canApplyTextEditHistory(
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
          token: randomSessionToken(),
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
              canFreezeSinglePaste(
                false,
                input.tids,
                value653,
                false,
              )
                ? pastedElementGeometry(value653, box)
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
                    routeStyleEditsByElementKind(
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
            announce(
              addContrastToAnnouncement(
                propertyEditAnnouncement(value658),
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
          { next: value653, tell: value654 }: Dynamic = reconcileSelectedElementIds(
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
    value241: Dynamic = useDesignSystems(),
    value242: Dynamic = (0, reactChromeTheme.useRef)([]),
    value243: Dynamic = useElementSessionState(
      selection.primary ?? null,
    ),
    value244: Dynamic = (0, reactChromeTheme.useMemo)((...args: Dynamic[]): Dynamic => (deriveSelectionInspectorProbe as Dynamic)({ get selection() { return selection; }, get value177() { return value177; }, get value19() { return value19; }, get value232() { return value232; }, get value242() { return value242; } }, ...args), [selection, value232, value241]);
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let value653: Dynamic = value244?.seed;
    value653 &&
      updateTypographyCensus({
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
      updateElementSessionState(value249, {
        selected: value250,
      });
      return (): Dynamic =>
        updateElementSessionState(value249, {
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
        ? createPreviewHandle(entry.webviewRef.current)
        : null;
    if (!value657) return;
    let value658: Dynamic = value654 + ":" + String(value655),
      value659: Dynamic = value248.current === value658;
    value248.current = value658;
    let flag2: Dynamic = true,
      value660: Dynamic = value656 === "text";
    inspectPickerSelection(
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
          ...normalizeInspectorComputedData(value656, input, {
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
        ? createPreviewHandle(entry.webviewRef.current)
        : null;
    if (!value654) return;
    let value655: Dynamic = value653.file + ":" + String(value653.tid),
      flag2: Dynamic = true;
    getPickerFontFaces(value654).then(
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
            updateArtboardErrorMap(input2, input, options),
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
  useArtboardErrorReporting(value267);
  let value268: Dynamic = useArtboardErrorNotices(
    value260,
    value266,
    {
      canvasTitle: (document as Dynamic).title,
      canAsk: editable && embedMemoryPrefix() === "",
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
            designPageId(input2, current4.pages) === input,
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
                  )) ?? defaultPageArtboard(current4, input))
            : undefined;
        value345.current &&
          (value654
            ? value348({
                file: value654.file,
                prev:
                  recallCanvasView(input) ?? defaultCanvasCamera,
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
        let value654: Dynamic = designPageId(
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
        hasBlockingEditorOverlay() ||
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
        id: createPageId(value654, supportsLoadState),
        name: nextCanvasPageName(value654),
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
        filterSelectedAnnotations(
          filterSelectedArtboards(
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
              ? toggleCanvasSelection(
                  selectionRef.current,
                  input,
                )
              : selectionFromBoards(input),
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
          id: createAnnotationId(
            value653,
            supportsLoadState,
            annotationKindCategory(input),
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
              : selectionFromBoards(
                  boardSelectionItems({
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
          ...annotationLineEndpoints(input, options, context),
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
        announce(
          value655.kind === "image"
            ? value655.video !== undefined
              ? AccessibilityAnnouncementsLabel_21
              : AccessibilityAnnouncementsLabel_20
            : isShapeAnnotation(value655)
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
          isEditingInputTarget(event.target) ||
          hasBlockingEditorOverlay();
      if (
        !(
          focusedFileRef.current != null &&
          current4.elements.has(focusedFileRef.current) &&
          !value653
        )
      ) {
        if (value653) {
          isDuplicateShortcut(event) && event.preventDefault();
          return;
        }
        event.preventDefault();
        !(
          isEmptyCanvasSelection(current4) ||
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
                  hasBlockingEditorOverlay() ||
                  isEmptyCanvasSelection(current5) ||
                  (current5.elements.size > 0
                    ? value158.current()
                    : value323.current(
                        canvasBoardSelection(current5),
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
              input instanceof File && isVideoFile(input),
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
          let value655: Dynamic = beginDeferredTextInput();
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
              finishDeferredTextInput("edit", value654);
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
        let value655: Dynamic = createAnnotationId(
          [...value653, ...items],
          supportsLoadState,
          annotationKindCategory(value654.src),
        );
        items.push(
          moveAnnotation(
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
          prev: recallCanvasView(value79) ?? defaultCanvasCamera,
          fit: artboardIsNotExpandedFill(value653),
        };
      },
    ),
    value349: Dynamic = value99 && value347 == null;
  usePhoneCanvasVisibility(value349 && !flag && !value100);
  let value350: Dynamic =
      value349 && !flag && editing && value121 != null
        ? (value70.current ?? value67).artboards.find(
            (input?: Dynamic): Dynamic => input.file === value121,
          )
        : undefined,
    value351: Dynamic =
      value350 &&
      shouldDelayPreviewMount(value350, {
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
    let value653: Dynamic = createDesignContextPublisher();
    value365.current = value653;
    let value654: Dynamic = createPresenceReporter({
      minDelta: 2,
    });
    value366.current = value654;
    getCurrentUserProfile().then((input?: Dynamic): Dynamic => {
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
    setEmbedSilencer(callback15);
    return (): Dynamic => {
      setEmbedSilencer(null);
      callback15();
    };
  }, []);
  let value370: Dynamic =
      embedMemoryPrefix() + "canvas:" + value79,
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
            pageCommentSurfaceKey(input),
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
        !isEditingInputTarget(event.target) &&
        !hasBlockingEditorOverlay() &&
        !value345.current &&
        value371.current,
      [],
    ),
    value375: Dynamic =
      value16 ||
      (!supportsLoadState && localDirty) ||
      sessionsDirty ||
      doc.dirty();
  useLiveDismissalGuard((): Dynamic => false);
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
      setEmbedPresenceListener(value376),
      (): Dynamic => setEmbedPresenceListener(null)
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
  let value380: Dynamic = useLatestCallback(
      (input?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          value653: Dynamic = current4.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
        if (!value653 || value653.frameless === true) return;
        let value654: Dynamic = designPageId(
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
                ? (recallCanvasView(value654) ??
                  defaultCanvasCamera)
                : value105.get()),
            fit: artboardIsNotExpandedFill(value653),
          }),
        );
      },
    ),
    value381: Dynamic = useLatestCallback(
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
              shouldDelayPreviewMount(value653, {
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
                    ? (recallCanvasView(options) ??
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
                filterSelectedArtboards(
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
        let value653: Dynamic = adjacentPrintableArtboard(
          artboards,
          current4,
          input,
        );
        if (value653 == null) {
          let value654: Dynamic =
            printableArtboards(artboards).length <= 1;
          announce(
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
      value655: Dynamic = printableArtboardIndex(
        artboards,
        value653,
      );
    value654 &&
      value655 &&
      announce(
        artboardPositionAnnouncement(
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
      (): Dynamic => rememberCanvasView(value79, value653),
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
      value14.current = !hasBlockingEditorOverlay() && !value653;
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
    value394: Dynamic = useCanvasKeyboardFocus(
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
    await getKvClient().set(
      PlatformFileContentHandler_4(canvasMetadataFile),
      serializeCanvasMetadata(state),
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
    setEmbedSettler(async (): Promise<Dynamic> => {
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
      setEmbedSettler(null);
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
          hasBlockingEditorOverlay() ||
          value220 ||
          (value224.current &&
            !isEmptyCanvasSelection(selectionRef.current)) ||
          value339.current !== "select" ||
          isEditingInputTarget(event.target) ||
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
        (input?: Dynamic): Dynamic => clearSelectedBoards(input),
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
        designPageId(value653, value67.pages) === value79
      )
        return;
      let value654: Dynamic = defaultPageArtboard(
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
          value654: Dynamic = PlatformFileContentSlice(options);
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
          value73.current = updateArtboardGuides(
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
        if (structurallyEqual(value654, value653)) {
          value68(
            updateArtboardGuides(current4, input, value653),
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
        value98(updateArtboardGuides(current4, input, value653));
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
        let value653: Dynamic = normalizeArtboardRadius(options);
        if (context) {
          value73.current = updateArtboardRadius(
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
        if (structurallyEqual(value654, value653)) {
          value68(
            updateArtboardRadius(current4, input, value653),
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
        value98(updateArtboardRadius(current4, input, value653));
        announce(
          propertyEditAnnouncement([
            {
              prop: "border-radius",
              value: artboardRadiusCss(value653) ?? "0px",
            },
          ]),
        );
      },
      [value98],
    ),
    value403: Dynamic = (0, reactChromeTheme.useCallback)(
      (input?: Dynamic, options?: Dynamic): Dynamic => {
        let current4: Dynamic = value73.current,
          value653: Dynamic = reorderArtboardsOnPages(
            current4.artboards,
            input,
            options,
            current4.pages,
          );
        value653 !== null &&
          (value396.current(
            artboardOrderHistoryStep(
              current4.artboards,
              value653,
            ),
            new Set(),
          ),
          value98({
            ...current4,
            artboards: value653,
          }));
        announce(
          stackingAnnouncement(options, value653 !== null),
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
          equalPropValues(
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
          !sessionAllowsMutation({
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
            partialFlipMessage(
              value655,
              value654,
              GeometryFlipAnnotationsWytKytYtConfig,
            ),
          );
        value654 &&
          announce(
            flipDirectionAnnouncement(options),
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
        let value655: Dynamic = annotationArrowHeads(value654);
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
                ? updateAnnotationArrowHeads(value654, state)
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
        isCanvasTypingTarget(event.target) ||
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
    let value653: Dynamic = textEditHistoryEpoch(
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
  value434.current ??= createEditSessionManager({
    depths: (input?: Dynamic): Dynamic =>
      readHeldSessionState(
        current,
        current2.inDocument,
        input,
        "depth",
        (): Dynamic => value177.current.get(input)?.undoDepth() ?? null,
      ),
    floor: (input?: Dynamic): Dynamic =>
      readHeldSessionState(
        current,
        current2.inDocument,
        input,
        "floor",
        (): Dynamic => value177.current.get(input)?.undoFloor() ?? null,
      ),
    redos: (input?: Dynamic): Dynamic =>
      readHeldSessionState(
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
  value432.current ??= createInlineHistoryBridge(
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
          updateTextEditHistoryCounts(current4, options);
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
        announce(
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
        isCanvasTypingTarget(event.target)
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
        announce(
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
      stepInlineHistory({
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
            announce(
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
            announce(
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
        let value654: Dynamic = canvasPageDeleteSnapshot(
          value73.current,
          input,
        );
        if (!value654 || !value224.current) return;
        if (value654.files.size + value654.notes.size > 0) {
          let value656: Dynamic = await confirmCanvasAction(
            canvasPageDeleteConfirmation(
              value654.spec.name,
              value654.files.size,
              value654.notes.size,
              keyboardShortcutLabel("Z"),
            ),
          );
          clearEscapeReleaseSuppression();
          value286.current?.focus({
            preventScroll: true,
          });
          if (!value656) return;
        }
        let value655: Dynamic = canvasPageDeleteSnapshot(
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
            announce(
              objectsDeletedAnnouncement(value654.length),
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
    if (!canvasElementSelectionCount(selection)) return;
    let artboards: Dynamic = selection.artboards,
      notes: Dynamic = selection.notes,
      callback15: Dynamic = (): Dynamic => {
        let artboards2: Dynamic = value73.current.artboards,
          value654: Dynamic = annotationImageReferences(
            (value73.current.annotations ?? []).filter(
              (input?: Dynamic): Dynamic => notes.has(input.id),
            ),
          );
        for (let value655 of [
          ...(artboards.size > 0
            ? clipboardBlobAssets(
                artboards2.filter(
                  (input?: Dynamic): Dynamic => artboards.has(input.file),
                ),
                artboards2,
                doc.content().files,
                getExternalFileReferences(),
              )
            : []),
          ...value654,
        ] as Dynamic)
          getCachedBlobObjectUrl(value655) === undefined &&
            fetchBlobAsset(value655).catch((): Dynamic => {});
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
                isShapeAnnotation(input2)
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
    value480: Dynamic = useDownloadsWithheld(),
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
                  designPageId(input3, current4.pages) ===
                    input2.id,
              ),
          ).length;
        return describeExportScope(input, options, {
          printable: value87.current.artboards.filter(
            (input2?: Dynamic): Dynamic => !input2.frameless,
          ).length,
          otherPages: length,
        });
      },
      [],
    ),
    value486: Dynamic = useExportPicker({
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
          value653 !== undefined && needsPagedExport(value653)
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
                  ? createPreviewHandle(entry.webviewRef.current)
                  : null;
            return value654 === null
              ? Promise.resolve(null)
              : collectArtboardFontDescriptors(value654);
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
        reportExportEvent("htmlBuilt");
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
            ? reportExportEvent("tooLarge")
            : value654 !== "not_loaded" &&
              value654 !== "empty" &&
              value654 !== "timeout" &&
              reportExportEvent("failed"),
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
                    errorMessage(value653) +
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
        reportExportOutcome(
          classifyHtmlDelivery(
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
                ...classifyExportAbort("pdf"),
              );
              return;
            }
            let value655: Dynamic;
            await exportPdfWithFeedback(
              [value653],
              (): Dynamic => value654,
              value653.title ?? exportBaseFileName(input),
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
          ? selectedExportableArtboards(
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
                  exportBaseFileName(value654.file)) +
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
              ...classifyExportAbort("pdf"),
            );
          return;
        }
        value479(true);
        try {
          let value654: Dynamic;
          await value495(
            value653.printable,
            (): Dynamic =>
              exportPdfWithFeedback(
                value653.printable,
                value483,
                input
                  ? (sanitizeExportFileName(
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
        reportExportOutcome(
          classifyPdfDelivery(input, current5),
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
        reportExportOutcome(
          classifyImageDelivery(input, current5),
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
  useExportFormats(
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
  let [value525, value526]: Dynamic = npm_useLocalStorage_QP(
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
        setSelection(selectionFromArtboards(new Set([input])));
        let value653: Dynamic = ++value527.current;
        value273(input).then((input2?: Dynamic): Dynamic => {
          !input2 ||
            value653 !== value527.current ||
            (value96(true), value526("tweaks"));
        });
      },
      [value62, value273, value96, value526, abandonSelectionGesture],
    ),
    value529: Dynamic = getTweakSelection(
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
        setSelection(selectionFromArtboards(new Set([input])));
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
              announce(
                backgroundEditAnnouncement(options2),
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
      selectionAnnouncement(
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
          return value653 == null || !isShapeAnnotation(value653)
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
            (items == null && isLoadingArtboardHtml(value653)) ||
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
                    (OutlineGlyphsTest(value653) ? null : []),
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
      subscribeHtmlReferences(
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
          isArtboardInViewport(input2, input, value120()),
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
  let value560: Dynamic = currentCanvasPlaceFragment(
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
    if (embedMemoryPrefix() !== "") return;
    let value653: Dynamic = createPlaceLinkReporter();
    value564.current = value653;
    let value654: Dynamic = observeGotoAnchorMessages(
        (input?: Dynamic): Dynamic => {
          let value656: Dynamic = value562.current(input);
          value656 !== null && rememberPlaceLink("goto", input);
          value653.answer(value656 ?? value561.current);
        },
      ),
      value655: Dynamic = classifyPlaceLink();
    value655 !== null &&
      (rememberPlaceLink("link", value655.place),
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
          hasBlockingEditorOverlay() ||
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
          isEditingInputTarget(event.target)
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
    value574: Dynamic = useArtboardKeyRouting({
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
          value653: Dynamic = findArtboardByName(
            current4.artboards,
            input,
            (input2?: Dynamic): Dynamic =>
              designPageId(input2, current4.pages) ===
              value80.current,
          );
        if (value653 === null || value653 === "ambiguous") {
          let value655: Dynamic = isEditableComponentName(
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
                      designPageId(input2, current4.pages),
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
        let value654: Dynamic = designPageId(
          value653,
          current4.pages,
        );
        value654 !== value80.current
          ? value298(value654, value653.file)
          : (value273(value653.file), value559(value653.file));
        setSelection(
          selectionFromArtboards(new Set([value653.file])),
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
          boardSelectionItems({
            file: input,
          }),
          options ? "toggle" : "replace",
        ),
      [value314],
    );
  value29.current = value578;
  let value579: Dynamic = canvasSelectionKey(selection);
  useVectorToolReset(value337, value579, value341);
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
      announce(
        (): Dynamic => {
          let value655: Dynamic =
              value654 &&
              (document as Dynamic).activeElement === value286.current,
            value656: Dynamic = canvasSelectionKey(
              selectionRef.current,
            ),
            value657: Dynamic = [
              value655 ? null : pageAnnouncement(value81),
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
        announce((): Dynamic => null, {
          ifIdle: true,
        });
        return;
      }
      value24.current?.saidSelection(selectionRef.current) ||
        announce(value550, {
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
                  !isLoadingArtboardHtml(value655)
                );
              }))
        )
          return;
        let value653: Dynamic = value473(input, options),
          value654: Dynamic = copyClipboardObject(
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
              from: validCoverArtboard(
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
          announce(
            "\u201C" +
              (value653.title ?? input.replace(/\.dc\.html$/, "")) +
              "\u201D is now the thumbnail.",
          ));
      },
      [value98],
    ),
    value591: Dynamic = (0,
    reactChromeTheme.useCallback)((): Dynamic => {
      let value653: Dynamic = getArtboardClipboard(),
        value654: Dynamic = getAnnotationClipboard(),
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
        get disabledReason() { return value224.current ? (value653 ? (undefined) : (uiMessage("canvas.designCanvas.noArtboardOrObjectCopied") + keyboardShortcutLabel("V") + " to paste anything else.")) : (ViewOnlyYouCanInspectThisMessage); },
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
        reconcileAnnotationOutline(
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
  let value601: Dynamic = validCoverArtboard(
      value67.cover,
      value67.artboards,
    ),
    value602: Dynamic = useCanvasKeyboardNavigation(
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
          selectionRef.current = filterSelectedElements(
            selectionRef.current,
            (input2?: Dynamic): Dynamic => input2 !== input,
          );
          setSelection(
            (input2?: Dynamic): Dynamic =>
              filterSelectedElements(
                input2,
                (input3?: Dynamic): Dynamic => input3 !== input,
              ),
          );
        },
        selectArtboard: (input?: Dynamic): Dynamic =>
          value314(
            boardSelectionItems({
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
        canvasElementSelectionCount(selection) ||
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
            refreshDesktopRendering(
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
          return zoomViewportAtPoint(
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
            rotatedAnnotationBounds(
              input,
              isShapeAnnotation(input)
                ? annotationBounds(input)
                : {
                    x: input.x,
                    y: input.y,
                    w: NotesLinkEditingKind(input),
                    h: NotesLinkEditingLh(input),
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
      return fitBoundsCamera(
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
          ? creationFocusedCamera(
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
    value625: Dynamic = useToolbarItemAccessibility({
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
    value628: Dynamic = useDesignSource(),
    value629: Dynamic = null,
    value630: Dynamic =
      value266.length > 0 ? (
        <ArtboardErrorsPopover
          problems={value266}
          canvasTitle={(document as Dynamic).title}
          canEdit={editable}
          hosted={embedMemoryPrefix() !== ""}
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
      (): Dynamic => groupNavigableArtboards(value86.artboards),
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
              {renderMenuItems(
                artboardExportMenuItems(
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
    // MineDesign：缩放菜单的「评论卡片」开关（有评论时才出现），排在布局参考线之后
    mdnCommentCardsToggle: Dynamic = useCommentCardsViewToggle(),
    value650: Dynamic = (0, reactChromeTheme.useMemo)(
      (): Dynamic => [
        {
          get label() { return uiMessage("canvas.designCanvas.layoutGuides"); },
          checked: value12,
          shortcut: "shift+g",
          onToggle: (): Dynamic =>
            value13((input?: Dynamic): Dynamic => !input),
        },
        ...mdnCommentCardsToggle,
      ],
      [value12, value13, mdnCommentCardsToggle],
    ),
    value651: Dynamic = useLatestCallback((): Dynamic => {
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
      getCachedHostCapability("feedback") ?? null,
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
          isApplePlatform() ? (uiMessage("canvas.designCanvas.zoom0FitStep")) : (uiMessage("canvas.designCanvas.zoomCtrl0FitCtrl"))
        }
      />
    </span>
  );
  // toolbarDensity 内部调用 hook，必须在顶层无条件调用，不能放进按展开状态渲染的分支
  let mdnDockDensity: Dynamic = toolbarDensity(),
    mdnText: Dynamic = useUiText();
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
                            ? selectedElementLocations(
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
                          announce(input, options),
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
                      createWorkingFileMap(doc.content().files)
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
      useFrameSaveState(
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

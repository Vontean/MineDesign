import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { inlineImagePreview } from "../assets/image-previews";
import { artboardLoadErrorMessage, artboardLoadErrorMessages, emptyArtboardErrors, normalizeArtboardErrorMessages, reuseEqualStringArray } from "./artboard-errors";
import { useArtboardRuntimeInstallation } from "./artboard-focus";
import { ArtboardTweaksRow } from "./artboard-tweaks";
import { artboardBootScheduler } from "./boot-scheduler";
import { cacheArtboardCompilation, createProjectAssetReadinessProbe, designEditQuietPeriodMs, effectiveDesignPartMinScale, equivalentDesignImportTags, getCachedArtboardCompilation, jsx_ip, lastDesignEditAt, navigationProbeAttempts, navigationProbeAttemptsAfterEdit, projectFileNamesKey, selectPageFiles } from "./compilation-cache";
import { createVideoElementIdentity, extractVisibleElementText, isValidVideoDimensions, resolveVideoElementIdentity } from "./content-snapshots";
import { refreshDesktopRendering, scheduleDesktopRenderingRefresh } from "./desktop-refresh";
import { focusCanvasDocument } from "./focus";
import { forceRefreshEventName, isFrameCaptureDocument, remoteFilesEventName } from "./frame-environment";
import { artboardContentSizeDescriptor, normalizeArtboardMeasuredSize, parseSelectionChromePayload, selectionChromeMinimumScale } from "./frame-payloads";
import { markDesignFramesReady, unblockDesignFramesReady } from "./frame-readiness";
import { SelectionChromeOverlay } from "./selection-chrome";
import { reactCanvasShape, reactDomCanvasShape } from "./shape";
import { useViewportMinScale, useViewportScale, ViewportScaleThreshold } from "./viewport-store";
import { CanvasWorkingStateContext, updateDropGhostDemand } from "./working-state";
import { observePageScrollAndPointer } from "../comments/page-surfaces";
import { npm_useEventListener_bc } from "../dependencies";
import { mergeDesignSystemFileOverlay, subscribeDesignSystemFiles } from "../design-system/file-overlay";
import { designSystemCacheKey, getCurrentPublishedProjectRoot, getDesignSystemFiles, invalidateDesignSystemUrl, invalidatePublishedRoot, lookupPublishedUrl, resolvePublishedDesignSystemFile } from "../design-system/published-files";
import { getDesignSystemColorVariables } from "../design-system/store";
import { subscribeHtmlReferences } from "../design-system/type-declarations";
import { announce } from "../editor/accessibility/announcer";
import { useToast } from "../editor/chrome/toast";
import { positionPastedHtml, unpositionPastedHtml } from "../editor/clipboard/html-placement";
import { parseElementMoveSnapshot, parseGroupMoveSnapshot } from "../editor/clipboard/layout-snapshots";
import { ClipboardTemplateFlatteningTrueFalseNullSet, flattenSelectionTemplates, flattenTemplateValues, getLoopTemplateVariables } from "../editor/clipboard/template-flattening";
import { equalPropValues, getPropCurrentValue, overridePropDefault } from "../editor/components/prop-validation";
import { useDcProps } from "../editor/components/use-dc-props";
import { CssEditValidationBackgroundBackgroundColorSet, frozenInheritedStyleEdits, isSafeBackgroundStyle, normalizeStyleEdits } from "../editor/css/edit-validation";
import { emitEditorEvent } from "../editor/events/runtime";
import { flipModelSelection, inspectFlipSelection, selectionNeedsFlipInspection } from "../editor/geometry/flip-elements";
import { canStartCanvasDrag } from "../editor/geometry/resize";
import { compareDesignSourceScripts, editorOwnsUndo, notifyUndoGesture } from "../editor/history-ownership";
import { canContainHtmlTag, DcTplAttribute } from "../editor/html/authoring";
import { artboardComponentName } from "../editor/html/dc-document";
import { getDcPropsJson } from "../editor/html/dc-props";
import { containsFlowPastedElements, emptyArtboardDropTarget, pasteParentTarget, wrapInlinePastedHtml } from "../editor/insert/drop-targets";
import { classifyElementStyleKind, isTextCapableElement } from "../editor/insert/element-kinds";
import { defaultInsertionPoint, deleteModelElements, insertHtmlIntoModel, insertionPointForSelection, sameInsertionPoint } from "../editor/insert/targets";
import { elementMoveRefusal, moveModelElement, sameParentDropGroup } from "../editor/layout/move-elements";
import { cropIntoFrame, resizeImageCropFrame } from "../editor/media/crop-geometry";
import { cropFromObjectStyles, imageCropStyleEdits, isEditableComponentName, MediaObjectCropEvery, MediaObjectCropSupports, MediaObjectCropTest, MediaObjectCropZoom, ThisBrowserCanTZoomAPictureMessage, YouCanTCropAnyFurtherAtMessage } from "../editor/media/object-crop";
import { findPreviewMediaElement } from "../editor/media/playback-controls";
import { adoptModelAndRelocateSelection } from "../editor/model/adoption";
import { ModelModelStateLimit, resetModelBaselines } from "../editor/model/model-state";
import { useDcModel } from "../editor/model/use-dc-model";
import { suppressNativeContextMenu } from "../editor/outline/native-menu";
import { armPickerByClick, beginPickerMove, beginPickerTextPlacing, cancelPickerBox, cancelPickerMove, clearPickerDropPlan, clearPickerPart, exitPickerMove, finishExitedPickerDrag, finishPickerMove, formatPickerText, holdPickerStyle, inspectPickerSelection, patchPickerStyle, pickAtPoint, PickerBridgeLabel, pickerContextMenuAt, pickerGesturePhase, pickerMoveHold, pickerPenPreview, pickerVectorPreview, pickInBox, planPickerDrop, repostPickerChrome, resizePickerSelection, returnPickerMove, setPickerDeepSelection, setPickerHiddenTags, setPickerHostScale, setPickerInteractive, setPickerMeasure, setPickerRingsOnly, setPickerScrubbing, setPickerSelection, settlePickerMove, startPickerTextEdit, touchPickerMove, unpatchPickerStyle, updatePickerMove } from "../editor/picker/bridge";
import { getHiddenPickerTags, subscribeHiddenPickerTags } from "../editor/picker/hidden-tags";
import { inspectPickerProps, observePickerCssVariables, sameStringSet } from "../editor/picker/inspection";
import { pickerElementSignature, PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { getPrimaryModifierHeld, subscribePrimaryModifierHeld } from "../editor/primary-modifier";
import { SelectionActionsHelmetScHelmetPattern } from "../editor/selection/actions";
import { containsUneditableSelection, copySelectedElementsHtml, promoteSvgShapeToRoot, selectedRootElementIds } from "../editor/selection/element-order";
import { canMovePositionedSelection, hasPositionedSelectionAxes, nudgeModelSelection } from "../editor/selection/nudge";
import { canReorderSelection, modelIdsFromElements, reorderModelSelection } from "../editor/selection/stacking";
import { promotedSvgSelection, selectionAdjacentSiblings, selectionChildren, selectionParents, selectionSiblingIds } from "../editor/selection/tree-navigation";
import { DesignEditorSession } from "../editor/session";
import { CropIsNotAvailableHereForMessage, registerElementSession, registerLateGesture, SessionElementStateGet, SessionElementStateUnloadedTurnedAutoConfig, unregisterElementSession, updateElementSessionState } from "../editor/session/element-state";
import { arrowSnapshotsForPropertyChange, restoreArrowSnapshots } from "../editor/svg/arrow-editing";
import { getTextListKind } from "../editor/text/list-state";
import { collectColorTokens, collectFontFamilies, collectFontSizeFamilyUsage, collectFontSizes, collectGoogleFontFamilies, collectTypographyRoles } from "../editor/typography/census";
import { knownWebFontFamily } from "../editor/typography/font-catalog";
import { firstFontFamily } from "../editor/typography/font-family";
import { applyElementUndo, validatePastedAttributeEdits } from "../editor/undo/elements";
import { trimUndoHistory } from "../editor/undo/history";
import { ElementPenEditor } from "../editor/vector/element-pen-editor";
import { placeElementAtMeasuredPoint, requestInsertionContainerTransform } from "../geometry/insertion-transform";
import { isLoadingArtboardHtml } from "../platform/design-document-adapter";
import { artboardsAtAddressEnabled, subscribeArtboardsAtAddressFlag } from "../platform/feature-flags";
import { currentHttpOrigin, fileCapFailureMessage, FileValue, getKvClient, isPreviewMessage, PreviewGenerationGate, probePreviewRuntime, registerImageFileUrls, setPreviewGenerationGate } from "../platform/file-content";
import { openPreviewExternalLink } from "../platform/link-navigation";
import { addressedArtboardCacheKey, addressedArtboardFailure, filterAddressedFiles, isRequiredProjectFile, resolveAddressedArtboard } from "../preview/addressed-artboards";
import { projectDirectoryOf, rewriteProjectAssets } from "../preview/asset-rewriting";
import { normalizeBlobAssetPaths, normalizeProjectBlobPaths } from "../preview/blob-paths";
import { buildPreviewDocument, componentRuntimeDependencies, PreviewBuildDocumentResolvedValue_3 as buildPreviewFromFiles, PreviewBuildDocumentStringify, TheArtboardRuntimeDidNotLoadMessage } from "../preview/build-document";
import { collectProjectDependencyFiles, resolveComponentFile, updateComponentRuntimeScript } from "../preview/dependency-graph";
import { DcAddressRefusedValue, rewritePreviewAssets } from "../preview/dependency-injection";
import { createPreviewHandle } from "../preview/evaluation";
import { createLinkedFileScript, runtimeModuleBlobs, runtimeModuleUrls } from "../preview/module-cache";
import { setPreviewProjectRoot } from "../preview/project-root";
import { markRuntimeUrlBlocked } from "../preview/runtime-loading";
import { inlineImageUrl } from "../properties/quick-panel-bindings";

import { set_lastDesignEditAt } from "./compilation-cache";
var ArtboardFrame: Dynamic;
function ArtboardSelectionChrome({
  slot: slot,
  live: live,
  interactive: interactive,
  onGripDown: onGripDown,
  onContextMenu: onContextMenu,
  sinkRef: sinkRef,
  crop: crop,
  onPenPreview: onPenPreview,
  onPenCommit: onPenCommit,
  onPenGesture: onPenGesture,
  vectorEdit: vectorEdit,
  board: board,
}: Dynamic): Dynamic {
  useUiLocale();
  let [selectionChrome, setSelectionChrome]: Dynamic = (0, reactCanvasShape.useState)(null);
  sinkRef.current = setSelectionChrome;
  let scale: Dynamic = useViewportScale(live && selectionChrome !== null),
    canShowInteractiveChrome: Dynamic = useViewportMinScale(
      selectionChromeMinimumScale,
    ),
    shouldCancelCrop: Dynamic = crop !== null && !(interactive && canShowInteractiveChrome);
  (0, reactCanvasShape.useEffect)((): Dynamic => {
    shouldCancelCrop && crop?.onDone(true);
  }, [shouldCancelCrop, crop]);
  (0, reactCanvasShape.useEffect)((): Dynamic => {
    live || setSelectionChrome(null);
  }, [live]);
  return !slot ||
    !live ||
    !selectionChrome ||
    (selectionChrome.rings.length === 0 &&
      !selectionChrome.stroke &&
      !selectionChrome.measure &&
      !selectionChrome.guides &&
      !selectionChrome.artboard &&
      !selectionChrome.pen)
    ? null
    : (0, reactDomCanvasShape.createPortal)(
        <jsx_ip.Fragment>
          <SelectionChromeOverlay
            chrome={selectionChrome}
            scale={scale}
            interactive={interactive && canShowInteractiveChrome}
            onGripDown={onGripDown}
            onContextMenu={onContextMenu}
            crop={interactive && canShowInteractiveChrome ? crop : null}
            board={board}
          />
          {selectionChrome.pen && vectorEdit && interactive && canShowInteractiveChrome && (<div
              className={"pointer-events-none absolute left-0 top-0"}
              style={{
                ...PickerRuntimeScriptTAppAccentConfig,
                transform: `scale(${String(1 / scale)})`,
                transformOrigin: "0 0",
              }}
            >
              {(() => {
                const _Component = ElementPenEditor;
                const _props = {
                  pen: selectionChrome.pen,
                  scale: scale,
                  onPreview: onPenPreview,
                  onCommitStroke: onPenCommit,
                  onGesture: onPenGesture,
                } as const;
                const _key = selectionChrome.pen.tid;
                return <_Component key={_key} {..._props} />;
              })()}
            </div>)}
        </jsx_ip.Fragment>,
        slot,
      );
}
export {
  ArtboardFrame,
  ArtboardSelectionChrome,
};
export function installCanvasArtboardFrame(): () => void {
  return () => {
    ArtboardFrame = (0, reactCanvasShape.memo)(function (
      props?: Dynamic,
    ): Dynamic {
      let { showToast: showToast }: Dynamic = useToast(),
        {
          vectorEdit: vectorEdit = false,
          file: previewFile,
          displayTitle: displayTitle,
          title: title,
          live: live = true,
          expanded: expanded = false,
          onPagePointer: onPagePointer,
          onPageScroll: onPageScroll,
          playing: playing = false,
          migrated: migrated = false,
          frameless: frameless = false,
          onContentHull: onContentHull,
          box: box,
          boxRowH: boxRowH = 0,
          component: component = false,
          chromeSlot: chromeSlot = null,
          onHostGesture: onHostGesture,
          onTweaksRow: onTweaksRow,
          onTweaksDirty: onTweaksDirty,
          onOpenTweaks: onOpenTweaks,
          canvasScaleRef: canvasScaleRef,
          assets: assets,
          doc: doc,
          editing: editing = false,
          routeForwardedKey: routeForwardedKey,
          onDragEvent: onDragEvent,
          onModifierKey: onModifierKey,
          onBoxEvent: onBoxEvent,
          onPanZoom: onPanZoom,
          onRepeatRefused: onRepeatRefused,
          pointerInert: pointerInert = false,
          keyboardInert: keyboardInert = false,
          inertFrame: inertFrame = false,
          onPreviewClick: onPreviewClick,
          panelMounted: panelMounted,
          gripless: gripless = false,
          readOnly: readOnly = false,
          frameArmed: frameArmed,
          editable: editable,
          onHandle: onHandle,
          onPreviewDropNotice: onPreviewDropNotice,
          onReadyGen: onReadyGen,
          dsVarNames: dsVarNames,
          onDefinedVars: onDefinedVars,
          onBlockedChange: onBlockedChange,
          onProblemsChange: onProblemsChange,
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
          onOpenFile: onOpenFile,
          onPasteImages: onPasteImages,
          onDropVideos: onDropVideos,
          onPointerPresence: onPointerPresence,
          onPointerAt: onPointerAt,
          onHistoryPush: onHistoryPush,
          onModelReparsed: onModelReparsed,
          onHistoryApply: onHistoryApply,
          onHistoryRevoke: onHistoryRevoke,
          onHistoryDrop: onHistoryDrop,
          onTweakEdit: onTweakEdit,
          sessionEpoch: sessionEpoch,
          actionsRef: actionsRef,
          onSelection: onSelection,
          onSelectionSeq: onSelectionSeq,
          onGestureStream: onGestureStream,
          onTextEditState: onTextEditState,
          onTextEditEnded: onTextEditEnded,
          keyboardSkipsContent: keyboardSkipsContent,
          artboardSettings: artboardSettings,
          canvasObject: canvasObject,
          outlineArtboards: outlineArtboards,
          presentPropsTick: presentPropsTick,
          onPresentPropsHandled: onPresentPropsHandled,
          placeRequest: placeRequest,
          onPlaceHandled: onPlaceHandled,
        }: Dynamic = props,
        showInlineTweakControls: Dynamic = false,
        iframeRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        previewGenerationGate: Dynamic = (0, reactCanvasShape.useMemo)(
          (): Dynamic => new PreviewGenerationGate(),
          [],
        ),
        [previewDocument, setPreviewDocument]: Dynamic = (0, reactCanvasShape.useState)(
          null,
        ),
        srcdoc: Dynamic = previewDocument?.srcdoc ?? null,
        lastRenderedGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(-1),
        pendingGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(-1),
        [readyGeneration, setReadyGeneration]: Dynamic = (0, reactCanvasShape.useState)(0),
        [displayedGeneration, setDisplayedGeneration]: Dynamic = (0, reactCanvasShape.useState)(0),
        [previewLoadError, setPreviewLoadError]: Dynamic = (0, reactCanvasShape.useState)(
          null,
        ),
        [previewBlockedReason, setPreviewBlockedReason]: Dynamic = (0, reactCanvasShape.useState)(
          null,
        ),
        [artboardErrors, setArtboardErrors]: Dynamic = (0, reactCanvasShape.useState)(
          emptyArtboardErrors,
        ),
        loadedGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(-1),
        mediaSinkRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        activeMediaRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        lastFocusAtRef: Dynamic = (0, reactCanvasShape.useRef)(0),
        lastFailureRef: Dynamic = (0, reactCanvasShape.useRef)({
          why: "",
          at: 0,
        }),
        [frameReady, setFrameReady]: Dynamic = (0, reactCanvasShape.useState)(
          false,
        ),
        frameReadyRef: Dynamic = (0, reactCanvasShape.useRef)(false);
      frameReadyRef.current = frameReady;
      let srcdocRef: Dynamic = (0, reactCanvasShape.useRef)(null);
      srcdocRef.current = srcdoc;
      let previewDocumentRef: Dynamic = (0, reactCanvasShape.useRef)(previewDocument);
      previewDocumentRef.current = previewDocument;
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic => {},
        [srcdoc],
      );
      let bootGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(-1),
        displayGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(-1),
        displayedGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(displayedGeneration);
      displayedGenerationRef.current = displayedGeneration;
      let liveRef: Dynamic = (0, reactCanvasShape.useRef)(live);
      liveRef.current = live;
      let loadedComponentIdsRef: Dynamic = (0, reactCanvasShape.useRef)(new Set()),
        dependencyFilesRef: Dynamic = (0, reactCanvasShape.useRef)(new Set()),
        expandedComponentsRef: Dynamic = (0, reactCanvasShape.useRef)(new Set()),
        probeRetryCountRef: Dynamic = (0, reactCanvasShape.useRef)(0),
        probeRetryWindowRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        coveredStylesheetsRef: Dynamic = (0, reactCanvasShape.useRef)(new Set()),
        compilationAddressesRef: Dynamic = (0, reactCanvasShape.useRef)(new Set()),
        rewrittenSrcdocRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        retiredGenerationRef: Dynamic = (0, reactCanvasShape.useRef)(0),
        loadErrorRef: Dynamic = (0, reactCanvasShape.useRef)(null);
      loadErrorRef.current = previewLoadError;
      let blockedReasonRef: Dynamic = (0, reactCanvasShape.useRef)(null);
      blockedReasonRef.current = previewBlockedReason;
      let [scheduledToBoot, setScheduledToBoot]: Dynamic = (0,
        reactCanvasShape.useState)(false),
        hasSrcdoc: Dynamic = srcdoc != null,
        isPreviewBlocked: Dynamic = previewLoadError != null || previewBlockedReason != null;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (!(!live || !frameArmed || !hasSrcdoc || scheduledToBoot || isPreviewBlocked))
          return artboardBootScheduler.request(
            previewFile,
            (): Dynamic =>
              liveRef.current
                ? setScheduledToBoot(true)
                : artboardBootScheduler.done(previewFile),
          );
      }, [live, frameArmed, hasSrcdoc, scheduledToBoot, isPreviewBlocked, previewFile]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        frameReady && artboardBootScheduler.done(previewFile);
      }, [frameReady, previewFile]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        (previewLoadError == null && previewBlockedReason == null) ||
          (artboardBootScheduler.done(previewFile), setScheduledToBoot(false));
      }, [previewLoadError, previewBlockedReason, previewFile]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic =>
          artboardBootScheduler.done(previewFile),
        [previewFile],
      );
      let attachIframe: Dynamic = (0, reactCanvasShape.useCallback)(
          (iframe?: Dynamic): Dynamic => {
            iframeRef.current = iframe;
            iframe != null &&
              (setPreviewGenerationGate(iframe, previewGenerationGate),
              previewGenerationGate.generationMounted(displayedGeneration));
          },
          [previewGenerationGate, displayedGeneration],
        ),
        frameHoldRef: Dynamic = (0, reactCanvasShape.useRef)({}),
        frameUpdateCountRef: Dynamic = (0, reactCanvasShape.useRef)(0),
        syncBeforeCompileRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        retireFrame: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          retiredGenerationRef.current = previewGenerationGate.mountedGeneration;
          previewGenerationGate.frameRetired();
          setPreviewDocument(null);
          setFrameReady(false);
        }, [previewGenerationGate]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => retireFrame,
        [retireFrame],
      );
      let [isLoadingArtboard, setIsLoadingArtboard]: Dynamic = (0,
        reactCanvasShape.useState)(false),
        canEditPreview: Dynamic = editable && !isLoadingArtboard,
        buildRequestRef: Dynamic = (0, reactCanvasShape.useRef)(0),
        componentPreviewCacheRef: Dynamic = (0, reactCanvasShape.useRef)(new Map()),
        rebuildPreview: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          componentPreviewCacheRef.current.clear();
          let deferRebuild: Dynamic = (): Dynamic =>
            previewGenerationGate.blocked == null &&
            loadErrorRef.current == null &&
            blockedReasonRef.current == null &&
            frameHoldRef.current.holdFrame?.("rebuild") === true;
          if (deferRebuild()) return;
          let buildRequestId: Dynamic = ++buildRequestRef.current,
            hasNewerBuild: Dynamic = (): Dynamic => buildRequestId !== buildRequestRef.current;
          try {
            let fileKeys: Dynamic = await getKvClient().list(
                FileValue,
              ),
              projectFiles: Dynamic = {
                ...getDesignSystemFiles(),
              };
            for (let fileKey of fileKeys as Dynamic) {
              let fileContent: Dynamic = await getKvClient().get(
                fileKey,
              );
              fileContent != null &&
                (projectFiles[fileKey.slice(FileValue.length)] = fileContent);
            }
            registerImageFileUrls(projectFiles);
            setIsLoadingArtboard(isLoadingArtboardHtml(projectFiles[previewFile] ?? ""));
            try {
              await syncBeforeCompileRef.current?.(previewFile);
            } catch {
            } finally {
              componentPreviewCacheRef.current.clear();
            }
            let cancelIfInactive: Dynamic = (): Dynamic =>
              liveRef.current
                ? false
                : (retireFrame(),
                  setPreviewLoadError(null),
                  setPreviewBlockedReason(null),
                  setArtboardErrors(emptyArtboardErrors),
                  true);
            if (hasNewerBuild() || cancelIfInactive() || deferRebuild()) return;
            let previewDetail: Dynamic = null,
              addressedArtboards: Dynamic = artboardsAtAddressEnabled(),
              compilationKey: Dynamic = PreviewBuildDocumentStringify({
                partMin: effectiveDesignPartMinScale(),
                frameless: frameless,
                assets: assets,
                installed: designSystemCacheKey(),
                address: addressedArtboardCacheKey(addressedArtboards),
              }),
              compilation: Dynamic = getCachedArtboardCompilation(
                previewFile,
                projectFiles,
                compilationKey,
              );
            if (compilation === null) {
              let dependencyClosure: Dynamic = collectProjectDependencyFiles(projectFiles, previewFile),
                addressedResolution: Dynamic = resolveAddressedArtboard(
                  dependencyClosure,
                  previewFile,
                  addressedArtboards,
                ),
                publishedArtboard: Dynamic =
                  addressedResolution === undefined || "copied" in addressedResolution
                    ? undefined
                    : addressedResolution;
              addressedArtboards &&
                addressedResolution !== undefined &&
                notifyUndoGesture("board-address", {
                  file: previewFile,
                  how:
                    "copied" in addressedResolution
                      ? uiMessage("canvas.artboardFrame.theAppifactBase")
                      : uiMessage("canvas.artboardFrame.thePublishedBase"),
                  ...("copied" in addressedResolution
                    ? {
                        why: addressedResolution.copied,
                      }
                    : {}),
                });
              let normalizedFiles: Dynamic = normalizeProjectBlobPaths(
                  publishedArtboard?.files ?? dependencyClosure,
                ),
                values: Dynamic = new Set(),
                {
                  doc: html,
                  parts: compiledModuleParts,
                  sheetUrls: compiledSheetUrls,
                  byAddress: filesByAddress,
                }: Dynamic = buildPreviewDocument(
                  normalizedFiles,
                  previewFile,
                  assets,
                  values,
                  publishedArtboard !== undefined
                    ? {
                        frameless: frameless,
                        atAddress: {
                          projectRoot: publishedArtboard.projectPath,
                          base: publishedArtboard.pageUrl,
                        },
                      }
                    : {
                        partMin: effectiveDesignPartMinScale(),
                        frameless: frameless,
                        sheetUrlFor: createProjectAssetReadinessProbe(projectFiles),
                        installedUrlFor:
                          resolvePublishedDesignSystemFile,
                        fileUrlFor: createLinkedFileScript,
                      },
                );
              compilation = {
                names: projectFileNamesKey(projectFiles),
                opts: compilationKey,
                closure: dependencyClosure,
                doc: html,
                parts: compiledModuleParts,
                sheetUrls: compiledSheetUrls ?? {},
                byAddress: filesByAddress,
                rootSheets: values,
                ...(publishedArtboard !== undefined
                  ? {
                      at: publishedArtboard,
                    }
                  : {}),
              };
              cacheArtboardCompilation(previewFile, compilation);
            }
            let {
              doc: compiledHtml,
              parts: moduleParts,
              closure: dependencyFiles,
              rootSheets: rootSheets,
              sheetUrls: sheetUrls,
            }: Dynamic = compilation;
            compilation.at !== undefined
              ? setPreviewDocument({
                  srcdoc: compiledHtml,
                  projectRoot: compilation.at.projectRoot,
                })
              : setPreviewDocument(
                  Object.keys(moduleParts).length > 0
                    ? {
                        srcdoc: buildPreviewFromFiles,
                        boot: {
                          doc: compiledHtml,
                          parts: runtimeModuleBlobs(moduleParts),
                          urls: {
                            ...runtimeModuleUrls(moduleParts),
                            ...sheetUrls,
                          },
                        },
                      }
                    : {
                        srcdoc: compiledHtml,
                      },
                );
            compiledSourceRef.current = projectFiles[previewFile];
            loadedComponentIdsRef.current = new Set(
              Object.keys(compilation.at?.files ?? dependencyFiles),
            );
            dependencyFilesRef.current = new Set(Object.keys(dependencyFiles));
            coveredStylesheetsRef.current = new Set(rootSheets);
            compilationAddressesRef.current = new Set(Object.values(compilation.byAddress));
            setDisplayedGeneration(previewGenerationGate.hostWillLoad());
            setPreviewLoadError(null);
            setPreviewBlockedReason(null);
          } catch (error: Dynamic) {
            setPreviewBlockedReason(String(error));
            unblockDesignFramesReady();
          }
        }, [previewFile, previewGenerationGate, retireFrame, frameless]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic =>
          subscribeArtboardsAtAddressFlag((): Dynamic => {
            rebuildPreview();
          }),
        [rebuildPreview],
      );
      let previewSubscriptionRef: Dynamic = (0, reactCanvasShape.useRef)([]),
        isPreviewRetired: Dynamic = (0, reactCanvasShape.useCallback)(
          (): Dynamic => false,
          [rebuildPreview],
        );
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        rebuildPreview();
        let unsubscribeDesignSystemFiles: Dynamic = subscribeDesignSystemFiles(
            (): Dynamic => {
              rebuildPreview();
            },
          ),
          unsubscribeHtmlReferences: Dynamic = subscribeHtmlReferences(
            (referencePaths?: Dynamic): Dynamic => {
              referencePaths.some(
                (referencePath?: Dynamic): Dynamic =>
                  isRequiredProjectFile(
                    referencePath,
                    previewFile,
                    dependencyFilesRef.current,
                    loadedComponentIdsRef.current,
                  ),
              ) && rebuildPreview();
            },
          );
        return (): Dynamic => {
          unsubscribeDesignSystemFiles();
          unsubscribeHtmlReferences();
        };
      }, [rebuildPreview]);
      let previousLiveRef: Dynamic = (0, reactCanvasShape.useRef)(live);
      (0, reactCanvasShape.useLayoutEffect)((): Dynamic => {
        if (live !== previousLiveRef.current) {
          previousLiveRef.current = live;
          if (!live) {
            srcdocRef.current != null &&
              loadErrorRef.current == null &&
              blockedReasonRef.current == null &&
              (set_lastDesignEditAt(performance.now()));
            retireFrame();
            setScheduledToBoot(false);
            artboardBootScheduler.done(previewFile);
            return;
          }
          loadErrorRef.current != null || blockedReasonRef.current != null || rebuildPreview();
        }
      }, [live, rebuildPreview, retireFrame]);
      let compiledSourceRef: Dynamic = (0, reactCanvasShape.useRef)(undefined),
        refreshCompiledSource: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          let updatedSource: Dynamic = doc.content().files[previewFile],
            previousSource: Dynamic = compiledSourceRef.current;
          if (updatedSource !== undefined && updatedSource === previousSource) return null;
          if (
            !createPreviewHandle(iframeRef.current) ||
            loadErrorRef.current != null ||
            blockedReasonRef.current != null
          )
            return uiMessage("canvas.artboardFrame.theFrameIsNotLive");
          let sourceComparison: Dynamic = compareDesignSourceScripts(
            previousSource,
            updatedSource,
          );
          if (!sourceComparison.ok) return sourceComparison.why;
          let componentName: Dynamic = artboardComponentName(previewFile);
          try {
            await syncBeforeCompileRef.current?.(previewFile);
          } catch {}
          let componentSession: Dynamic = componentSessionRef.current.state(componentName),
            artboardSession: Dynamic =
              componentSession && componentSession.path === previewFile ? componentSession : null;
          if (
            artboardSession &&
            (artboardSession.dirty ||
              artboardSession.pendingScript !== undefined ||
              artboardSession.pendingProps !== undefined)
          )
            return uiMessage("canvas.artboardFrame.thisBoardHasUnsavedLocal");
          if (artboardSession && artboardSession.src === updatedSource) {
            artboardSession.stampGen = (artboardSession.stampGen ?? -1) + 1;
            artboardSession.liveStampsStale = false;
            componentSessionRef.current.pushLive(componentName);
          } else {
            if (artboardSession)
              return uiMessage("canvas.artboardFrame.theModelDidNotAdopt");
            emitEditorEvent("dc-update", {
              name: componentName,
              path: previewFile,
              kind: "html",
              content: sourceComparison.template,
              streaming: false,
              viewportKey: "dc-model",
            });
            onModelReparsed?.(previewFile, null, null);
          }
          compiledSourceRef.current = updatedSource;
          return null;
        }, [previewFile]),
        releaseFrame: Dynamic = (0, reactCanvasShape.useCallback)(
          (reason?: Dynamic): Dynamic => {
            notifyUndoGesture("board-remote", {
              file: previewFile,
              how:
                uiMessage("canvas.artboardFrame.theTextBoxOrDrag") +
                (reason === "rebuild" ? uiMessage("canvas.artboardFrame.reloadingNow") : uiMessage("canvas.artboardFrame.redrawingNow")),
            });
            reason === "rebuild"
              ? rebuildPreview()
              : componentSessionRef.current.pushLive(
                  artboardComponentName(previewFile),
                );
          },
          [rebuildPreview, previewFile],
        );
      npm_useEventListener_bc(
        forceRefreshEventName,
        (): Dynamic => {
          rebuildPreview();
        },
      );
      npm_useEventListener_bc(
        remoteFilesEventName,
        (fileChangeEvent?: Dynamic): Dynamic => {
          let changedPaths: Dynamic = fileChangeEvent.detail?.paths ?? [],
            affectedPaths: Dynamic = filterAddressedFiles(
              changedPaths,
              previewFile,
              dependencyFilesRef.current,
              loadedComponentIdsRef.current,
              (): Dynamic =>
                collectProjectDependencyFiles(
                  mergeDesignSystemFileOverlay(
                    doc.content().files,
                  ),
                  previewFile,
                ),
            );
          if (affectedPaths.length !== 0) {
            if (
              affectedPaths.length === 1 &&
              affectedPaths[0] === previewFile &&
              editorOwnsUndo()
            ) {
              let startedAt: Dynamic = performance.now();
              refreshCompiledSource().then(
                (sourceComparison?: Dynamic): Dynamic => {
                  sourceComparison === null
                    ? notifyUndoGesture("board-remote", {
                        file: previewFile,
                        how: "in place (__dcUpdate)",
                        ms: Math.round(performance.now() - startedAt),
                      })
                    : (notifyUndoGesture("board-remote", {
                        file: previewFile,
                        how: "rebuilt iframe",
                        why: sourceComparison,
                      }),
                      rebuildPreview());
                },
                (error?: Dynamic): Dynamic => {
                  notifyUndoGesture("board-remote", {
                    file: previewFile,
                    how: "rebuilt iframe",
                    get why() { return ("in-place threw: ") + (String(error)); },
                  });
                  rebuildPreview();
                },
              );
              return;
            }
            notifyUndoGesture("board-remote", {
              file: previewFile,
              how: "rebuilt iframe",
              get why() { return affectedPaths.length === 1 && affectedPaths[0] === previewFile ? ("in-place is off") : ((uiMessage("canvas.artboardFrame.aFileThisBoardImports")) + (affectedPaths.join(", "))); },
            });
            rebuildPreview();
          }
        },
      );
      (0, reactCanvasShape.useEffect)(
        (): Dynamic =>
          scheduleDesktopRenderingRefresh(
            (): Dynamic => iframeRef.current,
          ),
        [readyGeneration],
      );
      let noteOwnWriteRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        tweakProperties: Dynamic = useDcProps({
          webviewRef: iframeRef,
          readyGen: readyGeneration,
          projectPath: "appifact",
          filePath: previewFile,
          enabled: true,
          onWritten: (file?: Dynamic, contents?: Dynamic): Dynamic =>
            noteOwnWriteRef.current?.(
              artboardComponentName(file),
              contents,
            ),
        });
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        onTweaksRow?.(previewFile, tweakProperties.hasProps);
      }, [previewFile, tweakProperties.hasProps, onTweaksRow]);
      let saveTweakDefaults: Dynamic = (0,
      reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
        await tweakProperties.saveAsDefaults();
        try {
          await syncBeforeCompileRef.current?.(previewFile);
        } catch {}
      }, [previewFile, tweakProperties.saveAsDefaults]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        onTweaksDirty?.(previewFile, canEditPreview && tweakProperties.dirty ? saveTweakDefaults : null);
      }, [
        previewFile,
        canEditPreview,
        tweakProperties.dirty,
        tweakProperties.values,
        saveTweakDefaults,
        onTweaksDirty,
      ]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic => onTweaksDirty?.(previewFile, null),
        [previewFile, onTweaksDirty],
      );
      let textEditStateCallbackRef: Dynamic = (0, reactCanvasShape.useRef)(onTextEditState);
      textEditStateCallbackRef.current = onTextEditState;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        panelMounted || textEditStateCallbackRef.current?.(previewFile, null);
      }, [panelMounted, previewFile]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        textEditStateCallbackRef.current?.(previewFile, null);
      }, [displayedGeneration, previewFile]);
      npm_useEventListener_bc(
        "message",
        (dataset?: Dynamic): Dynamic => {
          let message: Dynamic = dataset.data;
          if (message?.__om_hello === 1) {
            let previewWindow: Dynamic = iframeRef.current?.contentWindow;
            if (
              previewWindow != null &&
              dataset.source === previewWindow &&
              dataset.origin === currentHttpOrigin()
            ) {
              let helloPort: Dynamic = dataset.ports[0];
              helloPort != null && previewGenerationGate.helloReceived(helloPort);
            }
            return;
          }
          if (message?.__om_nav_away === 1) {
            if (dataset.origin !== currentHttpOrigin()) return;
            let mountedGeneration: Dynamic = previewGenerationGate.mountedGeneration,
              helloPort: Dynamic = previewGenerationGate.helloPort;
            if (helloPort == null) return;
            let probeAttempts: Dynamic =
              performance.now() - lastDesignEditAt <
              designEditQuietPeriodMs
                ? navigationProbeAttemptsAfterEdit
                : navigationProbeAttempts;
            probePreviewRuntime(helloPort, {
              attempts: probeAttempts,
            }).then((probeVerdict?: Dynamic): Dynamic => {
              mountedGeneration <= retiredGenerationRef.current ||
                (previewGenerationGate.verdict(mountedGeneration, probeVerdict),
                previewGenerationGate.blocked != null &&
                  !isPreviewRetired() &&
                  (setPreviewLoadError(previewGenerationGate.blocked),
                  unblockDesignFramesReady()));
            });
            return;
          }
        },
      );
      npm_useEventListener_bc(
        "message",
        (dataset?: Dynamic): Dynamic => {
          if (!isPreviewMessage(dataset, iframeRef.current)) return;
          let message: Dynamic = dataset.data;
          if (message != null && typeof message == "object" && "__om_link" in message) {
            openPreviewExternalLink(message.__om_link);
            return;
          }
          if (
            message != null &&
            typeof message == "object" &&
            "__dc_boot_failed" in message
          ) {
            if (
              pendingGenerationRef.current === displayedGenerationRef.current ||
              (previewDocumentRef.current?.boot != null &&
                lastRenderedGenerationRef.current !== displayedGenerationRef.current) ||
              (message.e === TheArtboardRuntimeDidNotLoadMessage &&
                dataset.source !== null &&
                probeRetryWindowRef.current === dataset.source)
            )
              return;
            if (
              message.e === TheArtboardRuntimeDidNotLoadMessage &&
              probeRetryCountRef.current < 2
            ) {
              probeRetryCountRef.current++;
              probeRetryWindowRef.current = dataset.source;
              markRuntimeUrlBlocked(message.u);
              console.warn(
                "[design] artboard " +
                  previewFile +
                  " could not load its runtime by URL; rebuilding without that URL",
              );
              rebuildPreview();
              return;
            }
            console.warn(
              "[design] artboard " +
                previewFile +
                " did not boot: " +
                String(message.e).slice(0, 200),
            );
            setPreviewBlockedReason(uiMessage("canvas.artboardFrame.itsContentDidnTLoad"));
            unblockDesignFramesReady();
            return;
          }
          if (
            message != null &&
            typeof message == "object" &&
            DcAddressRefusedValue in message
          ) {
            let u: Dynamic = message.u,
              activePreview: Dynamic = previewDocumentRef.current;
            if (activePreview?.projectRoot !== undefined) {
              if (rewrittenSrcdocRef.current === activePreview.srcdoc) return;
              let publishedUrl: Dynamic = lookupPublishedUrl(
                  activePreview.projectRoot,
                  u,
                ),
                publishedRootInvalidation: Dynamic = invalidatePublishedRoot(
                  activePreview.projectRoot,
                  u,
                );
              if (publishedRootInvalidation === undefined || publishedUrl === undefined) return;
              rewrittenSrcdocRef.current = activePreview.srcdoc;
              notifyUndoGesture("board-address", {
                file: previewFile,
                how: "built again after a failed load",
                get why() { return (uiMessage("canvas.artboardFrame.aPublishedFileDidNot")) + (publishedUrl); },
              });
              publishedRootInvalidation === "first" &&
                console.warn(
                  "[design] Could not load " +
                    publishedUrl +
                    (getCurrentPublishedProjectRoot() === undefined
                      ? " from where this canvas is published. Artboards are drawn from the editor's own copy of the files instead."
                      : " from an older saved version. The artboard is drawn again from the version this page shows now.") +
                    " Your files are not changed.",
                );
              rebuildPreview();
              return;
            }
            let invalidation: Dynamic = invalidateDesignSystemUrl(
              compilationAddressesRef.current,
              u,
            );
            invalidation === "first" &&
              console.warn(
                "[design] a design system file did not load from " +
                  String(u) +
                  ". Artboards that use that design system are shown from the page's own copy; fonts its stylesheets name by relative path will not load until the page is reloaded or shows another version.",
              );
            invalidation !== undefined && rebuildPreview();
            return;
          }
          if (message?.type === "__dc_render_errors") {
            let normalizedErrors: Dynamic = normalizeArtboardErrorMessages(
              message.errors,
            );
            setArtboardErrors(
              (previousErrors?: Dynamic): Dynamic =>
                reuseEqualStringArray(previousErrors, normalizedErrors),
            );
            return;
          }
          if (message?.__dcEditorEvt?.type === "__dc_preview_drop_notice") {
            if (!canEditPreview) return;
            onPreviewDropNotice(previewFile, message.__dcEditorEvt.video === true);
            return;
          }
          if (message?.__dcEditorEvt?.type === "previewClick") {
            if (panelMounted || !onPreviewClick) return;
            let __dcEditorEvt: Dynamic = message.__dcEditorEvt;
            onPreviewClick(
              previewFile,
              __dcEditorEvt.shift === true || __dcEditorEvt.meta === true,
            );
            return;
          }
          if (
            message?.type === "__dc_booted" &&
            typeof message.rootName == "string"
          ) {
            artboardBootScheduler.done(previewFile);
            loadedGenerationRef.current = displayedGenerationRef.current;
            message.tellsErrors !== true && setArtboardErrors(emptyArtboardErrors);
            message.mounted === true &&
              message.rootName !== artboardComponentName(previewFile) &&
              displayGenerationRef.current !== displayedGenerationRef.current &&
              ((displayGenerationRef.current = displayedGenerationRef.current),
              console.error(
                "[design] artboard " +
                  previewFile +
                  ' booted as "' +
                  message.rootName.slice(0, 80) +
                  '", host pushes to "' +
                  artboardComponentName(previewFile) +
                  '" \u2014 live edits will not render',
              ));
            tweakProperties.lifecycleCallbacks.onDcBooted({
              rootName: message.rootName,
              propsMeta: message.propsMeta ?? null,
            });
            bootGenerationRef.current !== displayedGenerationRef.current &&
              ((bootGenerationRef.current = displayedGenerationRef.current),
              resolveComponentState(artboardComponentId)?.dirty && componentSessionRef.current.pushLive(artboardComponentId));
            return;
          }
          let modifierEvent: Dynamic = message?.__dcEditorEvt;
          if (modifierEvent?.type === "modifierKey") {
            if (
              !panelMounted ||
              readOnly ||
              !onModifierKey ||
              modifierEvent.key !== "deep" ||
              typeof modifierEvent.on != "boolean"
            )
              return;
            onModifierKey(previewFile, "deep", modifierEvent.on, modifierEvent.blur === true);
            return;
          }
          let boxEvent: Dynamic = message?.__dcEditorEvt;
          if (
            boxEvent &&
            (boxEvent.type === "boxLive" ||
              boxEvent.type === "boxEnd" ||
              boxEvent.type === "boxCancel" ||
              boxEvent.type === "canvasPointerDown")
          ) {
            if (
              panelMounted &&
              !readOnly &&
              onBoxEvent &&
              typeof boxEvent.gestureKey == "string" &&
              /^[0-9a-f]{16}$/.test(boxEvent.gestureKey)
            ) {
              let boxEventType: Dynamic =
                boxEvent.type === "canvasPointerDown"
                  ? "press"
                  : boxEvent.type === "boxLive"
                    ? "live"
                    : boxEvent.type === "boxEnd"
                      ? "end"
                      : "cancel";
              onBoxEvent(previewFile, {
                type: boxEventType,
                key: boxEvent.gestureKey,
              });
            }
            if (boxEvent.type !== "canvasPointerDown") return;
          }
          let dragEvent: Dynamic = message?.__dcEditorEvt;
          if (
            dragEvent &&
            typeof dragEvent.type == "string" &&
            dragEvent.type.startsWith("drag") &&
            onDragEvent
          ) {
            if (!panelMounted || readOnly) return;
            let dragPayload: Dynamic = dragEvent,
              gestureKey: Dynamic =
                typeof dragPayload.gestureKey == "string" &&
                /^[0-9a-f]{16}$/.test(dragPayload.gestureKey)
                  ? dragPayload.gestureKey
                  : null;
            if (!gestureKey) return;
            let finiteNumber: Dynamic = (candidateNumber?: Dynamic): Dynamic =>
                typeof candidateNumber == "number" &&
                Number.isFinite(candidateNumber) &&
                Math.abs(candidateNumber) < 1e6
                  ? candidateNumber
                  : null,
              readSelectedIds: Dynamic = (): Dynamic =>
                Array.isArray(dragPayload.tids)
                  ? dragPayload.tids
                      .filter(
                        (candidateIndex?: Dynamic): Dynamic =>
                          typeof candidateIndex == "number" &&
                          Number.isInteger(candidateIndex) &&
                          candidateIndex >= 0 &&
                          candidateIndex < 1e6,
                      )
                      .slice(0, 16)
                  : [],
              boxSize: Dynamic = (): Dynamic => {
                let width: Dynamic = finiteNumber(dragPayload.w),
                  height: Dynamic = finiteNumber(dragPayload.h);
                if (
                  width == null ||
                  height == null ||
                  width < 1 ||
                  height < 1
                )
                  return null;
                let clampDimension: Dynamic = (dimension?: Dynamic): Dynamic =>
                    Math.round(Math.min(dimension, 8e3)),
                  exportWidth: Dynamic = finiteNumber(dragPayload.ew),
                  exportHeight: Dynamic = finiteNumber(dragPayload.eh),
                  clampOffset: Dynamic = (offset?: Dynamic): Dynamic =>
                    Math.round(
                      Math.max(-8e3, Math.min(8e3, finiteNumber(offset) ?? 0)),
                    );
                return {
                  w: clampDimension(width),
                  h: clampDimension(height),
                  ew:
                    exportWidth != null && exportWidth >= 1
                      ? clampDimension(exportWidth)
                      : clampDimension(width),
                  eh:
                    exportHeight != null && exportHeight >= 1
                      ? clampDimension(exportHeight)
                      : clampDimension(height),
                  ox: clampOffset(dragPayload.ox),
                  oy: clampOffset(dragPayload.oy),
                  gx: Math.round(
                    Math.min(
                      width,
                      8e3,
                      Math.max(0, finiteNumber(dragPayload.gx) ?? width / 2),
                    ),
                  ),
                  gy: Math.round(
                    Math.min(
                      height,
                      8e3,
                      Math.max(0, finiteNumber(dragPayload.gy) ?? height / 2),
                    ),
                  ),
                };
              };
            if (dragPayload.type === "dragExit") {
              let selectedIds: Dynamic = readSelectedIds();
              if (selectedIds.length === 0) return;
              onDragEvent(previewFile, {
                type: "exit",
                key: gestureKey,
                tids: selectedIds,
                alt: dragPayload.alt === true,
                box: boxSize(),
              });
            } else if (dragPayload.type === "dragState") {
              if (dragPayload.live === true) {
                let selectedIds: Dynamic = readSelectedIds();
                onDragEvent(previewFile, {
                  type: "arm",
                  key: gestureKey,
                  tids: selectedIds.length > 0 ? selectedIds : null,
                  alt: dragPayload.alt === true,
                  box: boxSize(),
                });
              } else
                onDragEvent(previewFile, {
                  type: "disarm",
                  key: gestureKey,
                });
            } else if (dragPayload.type === "dragMove") {
              let x: Dynamic = finiteNumber(dragPayload.x),
                y: Dynamic = finiteNumber(dragPayload.y);
              if (x == null || y == null) return;
              onDragEvent(previewFile, {
                type: "move",
                key: gestureKey,
                x: x,
                y: y,
                alt: dragPayload.alt === true,
                ctrl: dragPayload.ctrl === true,
              });
            } else if (dragPayload.type === "dragDrop") {
              let x: Dynamic = finiteNumber(dragPayload.x),
                y: Dynamic = finiteNumber(dragPayload.y);
              if (x == null || y == null) return;
              onDragEvent(previewFile, {
                type: "drop",
                key: gestureKey,
                x: x,
                y: y,
                alt: dragPayload.alt === true,
                ctrl: dragPayload.ctrl === true,
              });
            } else
              (dragPayload.type === "dragCancel" ||
                dragPayload.type === "dragReturn") &&
                onDragEvent(previewFile, {
                  type: "cancel",
                  key: gestureKey,
                });
            return;
          }
          let panEvent: Dynamic = message?.__dcEditorEvt;
          if (panEvent && panEvent.type === "panZoom") {
            if (!onPanZoom) return;
            let panPayload: Dynamic = panEvent,
              finiteCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
                typeof coordinate == "number" && Number.isFinite(coordinate)
                  ? coordinate
                  : null,
              deltaX: Dynamic = finiteCoordinate(panPayload.dx),
              deltaY: Dynamic = finiteCoordinate(panPayload.dy),
              panX: Dynamic = finiteCoordinate(panPayload.x),
              panY: Dynamic = finiteCoordinate(panPayload.y),
              deltaZoom: Dynamic = finiteCoordinate(panPayload.dz) ?? 0;
            if (
              deltaX == null ||
              deltaY == null ||
              panX == null ||
              panY == null
            )
              return;
            let clampRange: Dynamic = (
              candidate?: Dynamic,
              minimum?: Dynamic,
              maximum?: Dynamic,
            ): Dynamic => Math.max(minimum, Math.min(maximum, candidate));
            onPanZoom(previewFile, {
              pinch: panPayload.pinch === true,
              touch: panPayload.touch === true,
              dx: clampRange(deltaX, -1e3, 1e3),
              dy: clampRange(deltaY, -1e3, 1e3),
              dz: clampRange(deltaZoom, -0.25, 0.25),
              x: clampRange(panX, 0, 1e5),
              y: clampRange(panY, 0, 1e5),
            });
            return;
          }
          if (panEvent && panEvent.type === "panHold") {
            let nativeMenuOpen: Dynamic = panEvent.on === true;
            (!nativeMenuOpen || panelMounted) &&
              suppressNativeContextMenu(nativeMenuOpen);
            return;
          }
          let repeatEvent: Dynamic = message?.__dcEditorEvt;
          if (repeatEvent && repeatEvent.type === "repeatRefused") {
            if (!onRepeatRefused || !panelMounted || readOnly) return;
            let count: Dynamic = repeatEvent.count,
              reason: Dynamic = repeatEvent.reason;
            if (
              typeof count != "number" ||
              !Number.isFinite(count) ||
              count < 1 ||
              count > 1e4 ||
              (reason !== "self" && reason !== "siblings")
            )
              return;
            onRepeatRefused(previewFile, Math.floor(count), reason);
            return;
          }
          let textEditEvent: Dynamic = message?.__dcEditorEvt;
          if (textEditEvent && textEditEvent.type === "textEditState" && onTextEditState) {
            if (!panelMounted || readOnly) return;
            let textEditState: Dynamic = textEditEvent;
            if (textEditState.active !== true) {
              onTextEditState(previewFile, null);
              return;
            }
            onLocalEdit?.(previewFile);
            if (textEditState.plain === true)
              onTextEditState(previewFile, {
                formats: null,
              });
            else {
              let formats: Dynamic = textEditState.formats,
                toBoolean: Dynamic = (booleanValue?: Dynamic): Dynamic =>
                  booleanValue === true;
              onTextEditState(previewFile, {
                formats: {
                  bold: toBoolean(formats?.bold),
                  italic: toBoolean(formats?.italic),
                  underline: toBoolean(formats?.underline),
                  ul: toBoolean(formats?.ul),
                  ol: toBoolean(formats?.ol),
                  link: toBoolean(formats?.link),
                },
              });
            }
            return;
          }
          let chromeEvent: Dynamic = message?.__dcEditorEvt;
          chromeEvent &&
            chromeEvent.type === "chrome" &&
            box &&
            (panelMounted || (canEditPreview && editing)) &&
            updateDropGhostDemand(
              previewFile,
              parseSelectionChromePayload(
                chromeEvent,
                box,
              ).rings.reduce(
                (count?: Dynamic, eventContext?: Dynamic): Dynamic =>
                  count + +(eventContext.k === "busy"),
                0,
              ),
            );
          if (chromeEvent && chromeEvent.type === "chrome") {
            if (!box || !(panelMounted || (canEditPreview && editing))) return;
            let selectionPayload: Dynamic = parseSelectionChromePayload(
                chromeEvent,
                box,
                {
                  gripless: griplessRef.current,
                  cropTid: selectedMediaRef.current?.tid,
                },
              ),
              selectedMedia: Dynamic = selectionPayload.rings.find(
                (ring?: Dynamic): Dynamic =>
                  ring.media !== undefined || ring.cropOff !== undefined,
              );
            activeMediaRef.current = selectedMedia?.media ? selectedMedia : null;
            let selectionPoint: Dynamic =
              selectedMedia?.media !== undefined &&
              !MediaObjectCropSupports() &&
              !!componentSessionRef.current
                .state(artboardComponentId)
                ?.model.inlineStyleValue(selectedMedia.media.tid, "object-view-box");
            updateElementSessionState(previewFile, {
              target: selectedMedia?.media
                ? selectionPoint
                  ? {
                      off: "foreign-zoom",
                    }
                  : {
                      tid: selectedMedia.media.tid,
                    }
                : selectedMedia?.cropOff
                  ? {
                      off: selectedMedia.cropOff,
                    }
                  : null,
            });
            selectedMediaRef.current &&
              (!readCropEnabledRef.current() ||
                selectedMedia?.media?.tid !== selectedMediaRef.current.tid) &&
              finishCropRef.current(true);
            mediaSinkRef.current?.(selectionPayload);
            return;
          }
          if (chromeEvent && chromeEvent.type === "cropRequest") {
            let tid: Dynamic = chromeEvent.tid,
              isNativeMenuOpen: Dynamic =
                navigator.userActivation === undefined ||
                navigator.userActivation.isActive;
            if (
              !panelMounted ||
              selectedMediaRef.current ||
              !isNativeMenuOpen ||
              !Number.isSafeInteger(tid) ||
              SessionElementStateGet(previewFile).selected !== tid ||
              Date.now() - lastFocusAtRef.current < 500
            )
              return;
            lastFocusAtRef.current = Date.now();
            let target: Dynamic = SessionElementStateGet(
              previewFile,
            ).target;
            if (target !== null && "tid" in target && target.tid === tid)
              toggleCropRef.current(tid, true);
            else if (canEditRef.current) {
              let failureReason: Dynamic =
                target !== null && "off" in target
                  ? SessionElementStateUnloadedTurnedAutoConfig[
                      target.off
                    ]
                  : CropIsNotAvailableHereForMessage;
              (lastFailureRef.current.why !== failureReason ||
                Date.now() - lastFailureRef.current.at > 5e3) &&
                showToast(failureReason);
              lastFailureRef.current = {
                why: failureReason,
                at: Date.now(),
              };
            }
            return;
          }
          if (chromeEvent && chromeEvent.type === "contentHull") {
            if (!frameless) return;
            if (chromeEvent.empty === true) onContentHull?.(previewFile, null);
            else {
              let measuredSize: Dynamic = normalizeArtboardMeasuredSize(chromeEvent);
              measuredSize && onContentHull?.(previewFile, measuredSize);
            }
            return;
          }
          let previewEvent: Dynamic = message?.__dcEditorEvt;
          previewEvent &&
            onGestureStream &&
            panelMounted &&
            !readOnly &&
            (previewEvent.type === "stylePreview" || previewEvent.type === "movePreview"
              ? onGestureStream(previewFile, true)
              : (previewEvent.type === "move" ||
                  previewEvent.type === "resize" ||
                  previewEvent.type === "rotate" ||
                  previewEvent.type === "groupTransform" ||
                  previewEvent.type === "styleRevert" ||
                  previewEvent.type === "movePreviewCancel") &&
                onGestureStream(previewFile, false));
          let selectionEvent: Dynamic = message?.__dcEditorEvt;
          if (selectionEvent?.type === "select" && onSelection) {
            typeof selectionEvent.s == "number" &&
              Number.isSafeInteger(selectionEvent.s) &&
              selectionEvent.s >= 0 &&
              onSelectionSeq?.(previewFile, selectionEvent.s);
            let finiteValue: Dynamic = (candidate?: Dynamic): Dynamic =>
                typeof candidate == "number" &&
                Number.isFinite(candidate) &&
                Math.abs(candidate) < 1e6
                  ? candidate
                  : null,
              rect: Dynamic = selectionEvent.rect,
              selectionX: Dynamic = finiteValue(rect?.x),
              selectionY: Dynamic = finiteValue(rect?.y),
              selectionWidth: Dynamic = finiteValue(rect?.w),
              selectionHeight: Dynamic = finiteValue(rect?.h);
            if (!panelMounted) return;
            let selectedTidList: Dynamic = Array.isArray(selectionEvent.tids)
              ? selectionEvent.tids
                  .filter(
                    (candidateIndex?: Dynamic): Dynamic =>
                      typeof candidateIndex == "number" &&
                      Number.isInteger(candidateIndex) &&
                      candidateIndex >= 0 &&
                      candidateIndex < 1e6,
                  )
                  .slice(0, 512)
              : null;
            if (
              selectionEvent.name != null &&
              (typeof selectionEvent.name != "string" ||
                !isEditableComponentName(selectionEvent.name) ||
                selectionEvent.name !== artboardComponentName(previewFile))
            )
              return;
            let selectionName: Dynamic =
              typeof selectionEvent.name == "string" ? selectionEvent.name : null;
            onSelection(previewFile, {
              tids: selectedTidList,
              name: selectionName,
              tag: typeof selectionEvent.tag == "string" ? selectionEvent.tag : undefined,
              part: selectionEvent.part === "text" ? "text" : undefined,
              rect:
                selectionX != null &&
                selectionY != null &&
                selectionWidth != null &&
                selectionHeight != null
                  ? {
                      x: selectionX,
                      y: selectionY,
                      w: selectionWidth,
                      h: selectionHeight,
                    }
                  : null,
              re:
                typeof selectionEvent.re == "string" &&
                /^[A-Za-z0-9:._-]{1,32}$/.test(selectionEvent.re)
                  ? selectionEvent.re
                  : undefined,
              additive: selectionEvent.additive === true,
              s:
                typeof selectionEvent.s == "number" &&
                Number.isSafeInteger(selectionEvent.s) &&
                selectionEvent.s >= 0
                  ? selectionEvent.s
                  : undefined,
              artboard: selectionEvent.artboard === true && selectedTidList == null,
            });
          }
        },
      );
      let [sessionEpochState, setSessionEpoch]: Dynamic = (0,
        reactCanvasShape.useState)(0),
        reloadTimerRef: Dynamic = (0, reactCanvasShape.useRef)(null);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic => {
          reloadTimerRef.current && clearTimeout(reloadTimerRef.current);
        },
        [],
      );
      npm_useEventListener_bc(
        "dc-update",
        (detailEvent?: Dynamic): Dynamic => {
          let detail: Dynamic = detailEvent.detail;
          if (!createPreviewHandle(iframeRef.current)) return;
          let mergedFiles: Dynamic = mergeDesignSystemFileOverlay(
              doc.content().files,
            ),
            resolvedFile: Dynamic = resolveComponentFile(mergedFiles, {
              ...detail,
              kind: "html",
            });
          if (
            resolvedFile !== undefined &&
            resolvedFile !== previewFile &&
            !loadedComponentIdsRef.current.has(resolvedFile) &&
            !expandedComponentsRef.current.has(resolvedFile)
          )
            return;
          let activePreviewFile: Dynamic = resolvedFile ?? previewFile,
            projectRoot: Dynamic = previewDocumentRef.current?.projectRoot,
            hasAddressedFailure: Dynamic = false;
          if (projectRoot !== undefined && detail.kind === "html") {
            let artboardFailure: Dynamic = addressedArtboardFailure(
              {
                ...mergedFiles,
                [activePreviewFile]: detail.content,
              },
              previewFile,
              projectRoot,
            );
            hasAddressedFailure = artboardFailure === undefined;
            artboardFailure !== undefined &&
              notifyUndoGesture("board-address", {
                file: previewFile,
                how: "a push prepared by copying files in",
                why: artboardFailure,
              });
          }
          let failureMessage: Dynamic = hasAddressedFailure
              ? selectPageFiles(mergedFiles)
              : mergedFiles,
            coveredStylesheets: Dynamic =
              resolvedFile === previewFile && detail.kind === "html"
                ? new Set()
                : undefined,
            inlinedStylesheets: Dynamic = coveredStylesheets
              ? {
                  inlined: coveredStylesheets,
                }
              : {
                  covered: coveredStylesheetsRef.current,
                },
            normalizedBlobPaths: Dynamic =
              detail.kind === "html"
                ? rewritePreviewAssets(
                    detail.content,
                    failureMessage,
                    activePreviewFile,
                    inlinedStylesheets,
                  )
                : rewriteProjectAssets(
                    detail.content,
                    failureMessage,
                    projectDirectoryOf(activePreviewFile),
                  );
          coveredStylesheets && (coveredStylesheetsRef.current = coveredStylesheets);
          let loadedComponentIds: Dynamic = loadedComponentIdsRef.current,
            runtimeDependencies: Dynamic = componentRuntimeDependencies(
              failureMessage,
              previewFile,
              loadedComponentIds,
              detail,
              coveredStylesheetsRef.current,
            ),
            dependencyPaths: Dynamic = Object.keys(runtimeDependencies);
          ((scriptInput?: Dynamic, scriptOptions?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            if (!previewHandle) return;
            let runtimeScript: Dynamic = `${dependencyPaths.length > 0 ? `window.__dcFiles=Object.assign(window.__dcFiles||{},${JSON.stringify(scriptOptions)});` : ""}${updateComponentRuntimeScript(previewFile, detail, scriptInput)}${detail.kind === "html" ? PickerBridgeLabel : ""}`;
            coveredStylesheets &&
              !detail.streaming &&
              (reloadTimerRef.current && clearTimeout(reloadTimerRef.current),
              (reloadTimerRef.current = setTimeout(
                (): Dynamic =>
                  setSessionEpoch((count?: Dynamic): Dynamic => count + 1),
                400,
              )));
            if (dependencyPaths.length === 0) {
              previewHandle.executeJavaScriptUnchecked(runtimeScript);
              return;
            }
            for (let componentPath of dependencyPaths as Dynamic)
              expandedComponentsRef.current.add(componentPath);
            previewHandle.executeJavaScript(runtimeScript + ";void 0").then(
              (): Dynamic =>
                dependencyPaths.forEach((componentPath?: Dynamic): Dynamic => {
                  loadedComponentIds.add(componentPath);
                  expandedComponentsRef.current.delete(componentPath);
                }),
              (): Dynamic => {},
            );
          })(
            normalizeBlobAssetPaths(normalizedBlobPaths),
            normalizeProjectBlobPaths(runtimeDependencies),
          );
        },
      );
      let hasLoadState: Dynamic = "loadState" in doc,
        historyKeeper: Dynamic = (0, reactCanvasShape.useContext)(
          CanvasWorkingStateContext,
        ),
        sessionEpochRef: Dynamic = (0, reactCanvasShape.useRef)(
          historyKeeper?.peekEpoch(previewFile),
        ),
        adoptComponentModel: Dynamic = (
          componentName?: Dynamic,
          previousModel?: Dynamic,
          adoptedModel?: Dynamic,
        ): Dynamic =>
          adoptModelAndRelocateSelection({
            adopt: adoptedModel,
            own: (): Dynamic => {
              let componentState: Dynamic = componentSessionRef.current.state(componentName);
              return componentName === artboardComponentName(previewFile) &&
                componentState?.path === previewFile
                ? componentState.model
                : undefined;
            },
            prev: previousModel,
            heldElsewhere: (): Dynamic => {
              let heldComponent: Dynamic = frameHoldRef.current.heldComponent?.();
              return heldComponent != null && heldComponent !== componentName;
            },
            pending: {
              drop: (): Dynamic => {
                componentPreviewCacheRef.current.delete(componentName);
              },
              arm: (reason?: Dynamic, stillValid?: Dynamic): Dynamic => {
                componentPreviewCacheRef.current.set(componentName, {
                  then: reason,
                  stillValid: stillValid,
                });
              },
            },
            tellHost: (model?: Dynamic, diagnostics?: Dynamic): Dynamic =>
              onModelReparsed?.(previewFile, model, diagnostics),
            log: (message?: Dynamic, details?: Dynamic): Dynamic =>
              console.error(
                "[artboard] adopting an outside edit: " + message + ":",
                details,
              ),
          }),
        modelRuntime: Dynamic = useDcModel("appifact", previewFile, {
          enabled: true,
          historyKeeper: historyKeeper ?? undefined,
          get historyEpoch(): Dynamic {
            return sessionEpochRef.current;
          },
          sessionHeld: panelMounted,
          get liveStore(): Dynamic {
            return hasLoadState || false;
          },
          onAdopted: (model?: Dynamic, adoptionOptions?: Dynamic): Dynamic => {},
          onLocalEdit: (): Dynamic => {
            frameUpdateCountRef.current += 1;
            onLocalEdit?.(previewFile);
          },
          holdPush: (componentName?: Dynamic): Dynamic =>
            componentName === artboardComponentName(previewFile) &&
            frameHoldRef.current.holdFrame?.("push") === true,
          onPushLive: (componentName?: Dynamic): Dynamic => {
            frameUpdateCountRef.current += 1;
            frameHoldRef.current.onPushLive?.(componentName);
            let entry: Dynamic = componentPreviewCacheRef.current.get(componentName);
            componentPreviewCacheRef.current.delete(componentName);
            entry?.then(
              (): Dynamic =>
                entry.stillValid(componentSessionRef.current.state(componentName)?.model),
            );
          },
          onBeforeMutate: (
            componentName?: Dynamic,
            reparseOptions?: Dynamic,
            reparseContext?: Dynamic,
            heldComponent?: Dynamic,
          ): Dynamic => {
            onHistoryPush?.(previewFile);
            heldComponent && componentPreviewCacheRef.current.delete(componentName);
            frameHoldRef.current.onBeforeMutate?.(
              componentName,
              reparseOptions,
              reparseContext,
              heldComponent,
            );
          },
          onExternalReparse: (model?: Dynamic, externalReparseOptions?: Dynamic): Dynamic => {
            frameUpdateCountRef.current += 1;
            adoptComponentModel(
              model,
              externalReparseOptions,
              (): Dynamic =>
                frameHoldRef.current.onExternalReparse?.(model, externalReparseOptions),
            );
          },
          onPendingPropsDropped: (
            pendingProps?: Dynamic,
            pendingPropsOptions?: Dynamic,
          ): Dynamic =>
            frameHoldRef.current.onPendingPropsDropped?.(pendingProps, pendingPropsOptions),
          onPendingPropsSettled: (
            settledProps?: Dynamic,
            settledPropsOptions?: Dynamic,
          ): Dynamic =>
            frameHoldRef.current.onPendingPropsSettled?.(settledProps, settledPropsOptions),
          writes: {
            onSavedAdopted: (componentName?: Dynamic, savedAdoptionOptions?: Dynamic): Dynamic => {
              frameUpdateCountRef.current += 1;
              adoptComponentModel(
                componentName,
                componentSessionRef.current.state(componentName)?.model ?? null,
                (): Dynamic =>
                  frameHoldRef.current.onSavedAdopted?.(componentName, savedAdoptionOptions),
              );
            },
            onWriteError: (error?: Dynamic): Dynamic => {
              frameHoldRef.current.onWriteError
                ? frameHoldRef.current.onWriteError(error)
                : showToast(
                    fileCapFailureMessage(error) ??
                      uiMessage("canvas.artboardFrame.couldnTSaveEditsIn") +
                        previewFile +
                        " \u2014 focus that artboard to retry.",
                    "error",
                  );
            },
            onWriteConflict: (
              componentName?: Dynamic,
              pageEventOptions?: Dynamic,
              pageEventContext?: Dynamic,
              error?: Dynamic,
            ): Dynamic => {
              showToast(
                uiMessage("canvas.artboardFrame.saveConflictedWithAnotherChange"),
                "error",
              );
            },
            onWriteReverted: (error?: Dynamic, details?: Dynamic): Dynamic =>
              showToast(
                fileCapFailureMessage(details) ??
                  uiMessage("canvas.artboardFrame.couldnTSaveThatChange"),
                "error",
              ),
            awaitWriteClearance: async (): Promise<Dynamic> => {},
          },
        });
      syncBeforeCompileRef.current = modelRuntime.adoptExternal;
      noteOwnWriteRef.current = modelRuntime.noteOwnWrite;
      let { installGen: installGeneration }: Dynamic = useArtboardRuntimeInstallation(
        iframeRef,
        readyGeneration,
        panelMounted,
        true,
        false,
        false,
        readOnly,
      );
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (installGeneration === 0) return;
        let previewHandle: Dynamic = createPreviewHandle(
          iframeRef.current,
        );
        if (previewHandle) {
          setPickerInteractive(
            previewHandle,
            expanded ? "scroll" : playing ? "play" : true,
          );
          let canvasScale: Dynamic = canvasScaleRef?.current;
          canvasScale !== undefined &&
            canvasScale !== 1 &&
            setPickerHostScale(previewHandle, canvasScale);
        }
      }, [installGeneration, canvasScaleRef, expanded, playing]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (!expanded || readyGeneration === 0 || (!onPagePointer && !onPageScroll)) return;
        let contentWindow: Dynamic = iframeRef.current?.contentWindow;
        if (contentWindow)
          return (
            observePageScrollAndPointer(
              contentWindow,
              (event?: Dynamic, pointerOptions?: Dynamic): Dynamic =>
                onPagePointer?.(previewFile, event, pointerOptions),
              (event?: Dynamic, scrollOptions?: Dynamic): Dynamic =>
                onPageScroll?.(previewFile, event, scrollOptions),
            ) ?? undefined
          );
      }, [expanded, readyGeneration, previewFile, onPagePointer, onPageScroll]);
      let componentSessionRef: Dynamic = (0, reactCanvasShape.useRef)(modelRuntime);
      componentSessionRef.current = modelRuntime;
      let tweakPropertiesRef: Dynamic = (0, reactCanvasShape.useRef)(tweakProperties);
      tweakPropertiesRef.current = tweakProperties;
      let tweakEditRef: Dynamic = (0, reactCanvasShape.useRef)(onTweakEdit);
      tweakEditRef.current = onTweakEdit;
      let setProperty: Dynamic = (0, reactCanvasShape.useCallback)(
          (propertyName?: Dynamic, overrideValue?: Dynamic): Dynamic => {
            let latestTweakProperties: Dynamic = tweakPropertiesRef.current,
              currentValue: Dynamic = getPropCurrentValue(
                latestTweakProperties,
                propertyName,
              ),
              nextValue: Dynamic =
                overrideValue === undefined
                  ? latestTweakProperties.propsMeta[propertyName]?.default
                  : overrideValue;
            equalPropValues(currentValue, nextValue) ||
              tweakEditRef.current?.(
                previewFile,
                {
                  [propertyName]: currentValue,
                },
                {
                  [propertyName]: nextValue,
                },
              );
            latestTweakProperties.setProp(
              propertyName,
              overridePropDefault(latestTweakProperties, propertyName, overrideValue),
            );
          },
          [previewFile],
        ),
        resetProperties: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let latestTweakProperties: Dynamic = tweakPropertiesRef.current,
            propertyValues: Dynamic = {},
            propertyDefaults: Dynamic = {};
          for (let propertyName of Object.keys(latestTweakProperties.values) as Dynamic)
            propertyName in latestTweakProperties.propsMeta &&
              ((propertyValues[propertyName] = latestTweakProperties.values[propertyName]),
              (propertyDefaults[propertyName] = latestTweakProperties.propsMeta[propertyName]?.default));
          Object.keys(propertyValues).length > 0 &&
            tweakEditRef.current?.(previewFile, propertyValues, propertyDefaults, false);
          latestTweakProperties.reset();
        }, [previewFile]),
        tweaksBridge: Dynamic = {
          ...tweakProperties,
          setProp: setProperty,
          reset: resetProperties,
          autoSavesDefaults: hasLoadState,
        },
        historyDropRef: Dynamic = (0, reactCanvasShape.useRef)(onHistoryDrop);
      historyDropRef.current = onHistoryDrop;
      let handleHistoryDrop: Dynamic = (0, reactCanvasShape.useCallback)(
          (historyState?: Dynamic): Dynamic => historyDropRef.current?.(previewFile, historyState),
          [previewFile],
        ),
        setTweaks: Dynamic = (0, reactCanvasShape.useCallback)(
          (tweaks?: Dynamic): Dynamic => {
            let latestTweakProperties: Dynamic = tweakPropertiesRef.current;
            for (let [propertyName, propertyValue] of Object.entries(tweaks) as Dynamic)
              latestTweakProperties.setProp(
                propertyName,
                overridePropDefault(latestTweakProperties, propertyName, propertyValue),
              );
          },
          [],
        ),
        panelMountedRef: Dynamic = (0, reactCanvasShape.useRef)(panelMounted),
        griplessRef: Dynamic = (0, reactCanvasShape.useRef)(gripless);
      griplessRef.current = gripless;
      panelMountedRef.current = panelMounted;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        !(panelMounted || (canEditPreview && editing)) ||
          sessionEpoch === undefined ||
          (sessionEpochRef.current !== sessionEpoch &&
            ((sessionEpochRef.current = sessionEpoch),
            resetModelBaselines(componentSessionRef.current)));
      }, [panelMounted, canEditPreview, editing, sessionEpoch]);
      let artboardComponentId: Dynamic = (0, reactCanvasShape.useMemo)(
          (): Dynamic => artboardComponentName(previewFile),
          [previewFile],
        ),
        resolveComponentState: Dynamic = (0, reactCanvasShape.useCallback)(
          (componentName?: Dynamic): Dynamic => {
            if (componentName !== artboardComponentId) return null;
            let componentState: Dynamic = componentSessionRef.current.state(componentName);
            return componentState && componentState.path === previewFile ? componentState : null;
          },
          [artboardComponentId, previewFile],
        ),
        readAttributes: Dynamic = (0, reactCanvasShape.useCallback)(
          (componentName?: Dynamic, attributeOptions?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(componentName);
            return !componentState || !componentState.model.element(attributeOptions)
              ? null
              : componentState.model.attributes(attributeOptions);
          },
          [resolveComponentState],
        ),
        listKindOf: Dynamic = (0, reactCanvasShape.useCallback)(
          (componentName?: Dynamic): Dynamic =>
            getTextListKind(
              resolveComponentState(artboardComponentId)?.model.element(componentName),
            ),
          [resolveComponentState, artboardComponentId],
        ),
        ensureModel: Dynamic = (0, reactCanvasShape.useCallback)(
          (componentName?: Dynamic): Dynamic => {
            componentName === artboardComponentId && componentSessionRef.current.ensureModel(componentName);
          },
          [artboardComponentId],
        ),
        outlineRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        ensureOutline: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let activeOutline: Dynamic = outlineRef.current;
          if (activeOutline) return activeOutline;
          let componentState: Dynamic = componentSessionRef.current
            .ensureModel(artboardComponentId)
            .then(
              (componentModelState?: Dynamic): Dynamic =>
                componentModelState ? componentModelState.model.outline() : null,
            )
            .finally((): Dynamic => {
              outlineRef.current === componentState && (outlineRef.current = null);
            });
          outlineRef.current = componentState;
          return componentState;
        }, [artboardComponentId]),
        readInlineStyle: Dynamic = (0, reactCanvasShape.useCallback)(
          (componentName?: Dynamic, styleName?: Dynamic, styleContext?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(componentName);
            return !componentState || !componentState.model.element(styleName)
              ? null
              : (componentState.model.inlineStyleValue(styleName, styleContext) ?? null);
          },
          [resolveComponentState],
        ),
        copySelectionHtml: Dynamic = (0, reactCanvasShape.useCallback)(
          (selectionIds?: Dynamic, pasteOptions?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            if (!componentState) return null;
            let copiedHtml: Dynamic = copySelectedElementsHtml(
              componentState.model,
              selectionIds,
            );
            copiedHtml != null &&
              pasteOptions?.lift &&
              (copiedHtml = flattenSelectionTemplates(
                componentState.model,
                selectionIds,
                positionPastedHtml(copiedHtml, pasteOptions.lift),
              ));
            if (copiedHtml == null || !pasteOptions?.bakeProps) return copiedHtml;
            let bakedProps: Dynamic = {};
            try {
              let parsedProps: Dynamic = JSON.parse(
                getDcPropsJson(componentState.src) ?? "{}",
              );
              parsedProps &&
                typeof parsedProps == "object" &&
                !Array.isArray(parsedProps) &&
                (bakedProps = parsedProps);
            } catch {
              bakedProps = {};
            }
            let values: Dynamic = tweakPropertiesRef.current.values,
              pendingProps: Dynamic = componentState.pendingProps ?? {},
              overrideValues: Dynamic = pasteOptions?.vals,
              templateVariables: Dynamic = getLoopTemplateVariables(
                copiedHtml,
              );
            return flattenTemplateValues(
              copiedHtml,
              (propertyName?: Dynamic): Dynamic => {
                if (
                  propertyName.startsWith("$") ||
                  ClipboardTemplateFlatteningTrueFalseNullSet.has(
                    propertyName,
                  )
                )
                  return;
                if (!Object.hasOwn(bakedProps, propertyName))
                  return overrideValues &&
                    !templateVariables.has(propertyName) &&
                    Object.hasOwn(overrideValues, propertyName)
                    ? overrideValues[propertyName]
                    : undefined;
                if (Object.hasOwn(values, propertyName)) return values[propertyName];
                if (Object.hasOwn(pendingProps, propertyName)) return pendingProps[propertyName];
                let propertyValue: Dynamic = bakedProps[propertyName];
                return propertyValue && typeof propertyValue == "object"
                  ? propertyValue.default
                  : undefined;
              },
            );
          },
          [resolveComponentState, artboardComponentId],
        ),
        removeSelection: Dynamic = (0, reactCanvasShape.useCallback)(
          async (removableElementIds?: Dynamic): Promise<Dynamic> => {
            let mutationResult: Dynamic = await componentSessionRef.current.mutate(
              artboardComponentId,
              (selectionIds?: Dynamic, selectionOptions?: Dynamic): Dynamic =>
                selectionOptions.path !== previewFile
                  ? false
                  : deleteModelElements(selectionOptions, removableElementIds) > 0,
              {
                structural: true,
              },
            );
            return mutationResult === "applied" || mutationResult === "applied-dirty";
          },
          [artboardComponentId, previewFile],
        ),
        duplicateSelection: Dynamic = (0, reactCanvasShape.useCallback)(
          async (duplicatedElementIds?: Dynamic): Promise<Dynamic> => {
            let mutationResult: Dynamic = await componentSessionRef.current.mutate(
              artboardComponentId,
              (selectionIds?: Dynamic, selectionOptions?: Dynamic): Dynamic => {
                if (
                  selectionOptions.path !== previewFile ||
                  containsUneditableSelection(selectionOptions.model, [
                    ...duplicatedElementIds,
                  ])
                )
                  return false;
                let rootIds: Dynamic = selectedRootElementIds(
                  selectionOptions.model,
                  [...duplicatedElementIds],
                ).filter(
                  (elementId?: Dynamic): Dynamic =>
                    selectionOptions.model.element(elementId) != null &&
                    !selectionOptions.model.isUneditable(elementId),
                );
                if (rootIds.length === 0) return false;
                let duplicated: Dynamic = false;
                for (let elementId of rootIds as Dynamic)
                  selectionOptions.model.duplicateElement(elementId) && (duplicated = true);
                duplicated && selectionOptions.model.restamp();
                return duplicated;
              },
              {
                structural: true,
              },
            );
            return mutationResult === "applied" || mutationResult === "applied-dirty";
          },
          [artboardComponentId, previewFile],
        ),
        walkSelectionTids: Dynamic = (0, reactCanvasShape.useCallback)(
          async (selectionIds?: Dynamic, direction?: Dynamic): Promise<Dynamic> => {
            let componentState: Dynamic =
              await componentSessionRef.current.ensureModel(artboardComponentId);
            if (!componentState || componentState.path !== previewFile) return null;
            let model: Dynamic = componentState.model;
            return direction === "children"
              ? selectionChildren(model, selectionIds)
              : direction === "parents"
                ? selectionParents(model, selectionIds)
                : direction === "siblings"
                  ? selectionSiblingIds(model, selectionIds)
                  : selectionAdjacentSiblings(
                      model,
                      selectionIds,
                      direction,
                    );
          },
          [artboardComponentId, previewFile],
        ),
        selectionHistoryRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        moveSelection: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            movableElementIds?: Dynamic,
            deltaX?: Dynamic,
            deltaY?: Dynamic,
            afterMove?: Dynamic,
          ): Promise<Dynamic> => {
            let moveState: Dynamic = {
              tids: [...movableElementIds],
              did: "none",
            };
            if (
              !Number.isFinite(deltaX) ||
              !Number.isFinite(deltaY) ||
              (deltaX === 0 && deltaY === 0)
            )
              return moveState;
            let componentState: Dynamic =
              await componentSessionRef.current.ensureModel(artboardComponentId);
            if (!componentState || componentState.path !== previewFile) return moveState;
            let { targets: targetIds }: Dynamic = promotedSvgSelection(componentState.model, movableElementIds);
            if (targetIds.length === 0) return moveState;
            if (
              canMovePositionedSelection(componentState.model, targetIds)
            ) {
              if (
                !hasPositionedSelectionAxes(
                  componentState.model,
                  targetIds,
                  deltaX,
                  deltaY,
                )
              )
                return moveState;
              let selectionKey: Dynamic = targetIds.join(","),
                previousSelection: Dynamic = selectionHistoryRef.current,
                timestamp: Dynamic = Date.now(),
                isRedo: Dynamic =
                  previousSelection != null &&
                  previousSelection.key === selectionKey &&
                  timestamp - previousSelection.at < ModelModelStateLimit &&
                  componentState.undo.length === previousSelection.depth &&
                  componentState.undo[previousSelection.depth - 1] === previousSelection.top,
                mutationStatus: Dynamic = await componentSessionRef.current.mutate(
                  artboardComponentId,
                  (selectionIds?: Dynamic, selectionOptions?: Dynamic): Dynamic =>
                    selectionOptions.path !== previewFile
                      ? false
                      : (nudgeModelSelection(
                          selectionIds,
                          targetIds,
                          deltaX,
                          deltaY,
                        ),
                        true),
                  {
                    structural: false,
                    pushUndo: !isRedo,
                  },
                ),
                historyResult: Dynamic =
                  mutationStatus === "applied" || mutationStatus === "applied-dirty",
                historyState: Dynamic = componentSessionRef.current.state(artboardComponentId);
              historyResult &&
                historyState &&
                (selectionHistoryRef.current = {
                  key: selectionKey,
                  at: timestamp,
                  depth: historyState.undo.length,
                  top: historyState.undo[historyState.undo.length - 1],
                });
              return historyResult
                ? {
                    tids: [...movableElementIds],
                    did: "nudged",
                  }
                : moveState;
            }
            let currentSelection: Dynamic = null,
              validSelection: Dynamic = movableElementIds.filter(
                (elementId?: Dynamic): Dynamic =>
                  componentState.model.element(elementId) != null,
              );
            if (
              !canReorderSelection(
                componentState.model,
                validSelection,
                deltaX < 0 || deltaY < 0 ? -1 : 1,
              )
            )
              return moveState;
            afterMove?.();
            let mutationResult: Dynamic = await componentSessionRef.current.mutate(
              artboardComponentId,
              (selectionIds?: Dynamic, selectionOptions?: Dynamic): Dynamic =>
                selectionOptions.path !== previewFile
                  ? false
                  : ((currentSelection = reorderModelSelection(
                      selectionIds,
                      validSelection,
                      deltaX < 0 || deltaY < 0 ? -1 : 1,
                    )),
                    currentSelection != null),
              {
                structural: true,
              },
            );
            selectionHistoryRef.current = null;
            return !(mutationResult === "applied" || mutationResult === "applied-dirty") ||
              currentSelection == null
              ? moveState
              : {
                  tids: modelIdsFromElements(currentSelection),
                  did: "reordered",
                };
          },
          [artboardComponentId, previewFile],
        ),
        moveQueueRef: Dynamic = (0, reactCanvasShape.useRef)(
          Promise.resolve(),
        ),
        nudgeSelection: Dynamic = (0, reactCanvasShape.useCallback)(
          (
            selectionIds?: Dynamic,
            deltaX?: Dynamic,
            deltaY?: Dynamic,
            currentModel?: Dynamic,
          ): Dynamic => {
            let flushMoveQueue: Dynamic = (): Dynamic => {
                let timeoutId: Dynamic,
                  promise: Dynamic = new Promise(
                    (mutationResult?: Dynamic): Dynamic => {
                      timeoutId = setTimeout(
                        (): Dynamic =>
                          mutationResult({
                            tids: [...selectionIds],
                            did: "timeout",
                          }),
                        1e4,
                      );
                    },
                  );
                return Promise.race([
                  moveSelection(selectionIds, deltaX, deltaY, currentModel),
                  promise,
                ]).finally((): Dynamic => clearTimeout(timeoutId));
              },
              queuedMove: Dynamic = moveQueueRef.current.then(flushMoveQueue, flushMoveQueue);
            moveQueueRef.current = queuedMove.catch((): Dynamic => {});
            return queuedMove;
          },
          [moveSelection],
        ),
        flipRead: Dynamic = (0, reactCanvasShape.useCallback)(
          async (flippableElementIds?: Dynamic): Promise<Dynamic> => {
            let componentState: Dynamic =
                await componentSessionRef.current.ensureModel(artboardComponentId),
              previewHandle: Dynamic = createPreviewHandle(
                iframeRef.current,
              );
            if (!componentState || componentState.path !== previewFile || !previewHandle) return null;
            let elementIds: Dynamic = flippableElementIds.map(
                (elementId?: Dynamic): Dynamic => componentState.model.element(elementId),
              ),
              flipFacts: Dynamic = await inspectFlipSelection(
                componentState.model,
                flippableElementIds,
                (
                  selectionIds?: Dynamic,
                  flipOptions?: Dynamic,
                  afterPaint?: Dynamic,
                ): Dynamic =>
                  inspectPickerSelection(
                    previewHandle,
                    selectionIds,
                    artboardComponentId,
                    flipOptions,
                    {
                      pose: true,
                      afterPaint: afterPaint,
                    },
                  ),
              );
            return selectionNeedsFlipInspection(
              componentState.model,
              flippableElementIds,
              flipFacts,
            )
              ? null
              : {
                  tids: flippableElementIds,
                  picked: elementIds,
                  facts: flipFacts,
                };
          },
          [artboardComponentId, previewFile],
        ),
        flipSelection: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            { tids: tids, picked: picked, facts: facts }: Dynamic,
            flipOptions?: Dynamic,
          ): Promise<Dynamic> => {
            let flipState: Dynamic = {
                flipped: [],
              },
              mutationResult: Dynamic = await componentSessionRef.current.mutate(
                artboardComponentId,
                (model?: Dynamic, selectionOptions?: Dynamic): Dynamic =>
                  selectionOptions.path !== previewFile ||
                  tids.some(
                    (elementId?: Dynamic, index?: Dynamic): Dynamic =>
                      model.element(elementId) !== picked[index],
                  )
                    ? false
                    : ((flipState = flipModelSelection(
                        model,
                        tids,
                        flipOptions,
                        facts,
                      )),
                      flipState.flipped.length > 0),
                {
                  structural: false,
                  pushUndo: true,
                },
              ),
              didFlip: Dynamic =
                mutationResult === "applied" || mutationResult === "applied-dirty",
              hasRefused: Dynamic = !didFlip && flipState.flipped.length > 0;
            return {
              flipped: didFlip ? flipState.flipped.length : 0,
              ...(flipState.refused !== undefined && !hasRefused
                ? {
                    refused: flipState.refused,
                  }
                : {}),
            };
          },
          [artboardComponentId, previewFile],
        ),
        styleQueueRef: Dynamic = (0, reactCanvasShape.useRef)(
          Promise.resolve(),
        ),
        flushStyleQueue: Dynamic = (0, reactCanvasShape.useCallback)(
          (flushCallback?: Dynamic): Dynamic => {
            let queuedResult: Dynamic = styleQueueRef.current.then(flushCallback, flushCallback);
            styleQueueRef.current = queuedResult.catch((): Dynamic => {});
            return queuedResult;
          },
          [],
        ),
        setStylePropsPerTid: Dynamic = (0, reactCanvasShape.useCallback)(
          (edits?: Dynamic, editOptions?: Dynamic): Dynamic => {
            let editsByTid: Dynamic = new Map();
            for (let [tid, properties] of edits as Dynamic) {
              let normalizedEdits: Dynamic = normalizeStyleEdits(
                properties,
              );
              normalizedEdits.length > 0 && editsByTid.set(tid, normalizedEdits);
            }
            return editsByTid.size === 0
              ? Promise.resolve(false)
              : flushStyleQueue(async (): Promise<Dynamic> => {
                  let mutationResult: Dynamic = await componentSessionRef.current.mutate(
                    artboardComponentId,
                    (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                      if (modelState.path !== previewFile) return false;
                      let updatedFont: Dynamic = false,
                        arrowSnapshots: Dynamic = arrowSnapshotsForPropertyChange(
                          modelState.model,
                          editsByTid.keys(),
                          [...editsByTid.values()]
                            .flat()
                            .map(([propertyName]: Dynamic): Dynamic => propertyName),
                        );
                      for (let [tid, properties] of editsByTid as Dynamic)
                        if (modelState.model.element(tid))
                          for (let [propertyName, propertyValue] of properties as Dynamic)
                            model.setStyleProperty(
                              tid,
                              propertyName,
                              propertyValue,
                            ) && (updatedFont = true);
                      updatedFont &&
                        restoreArrowSnapshots(
                          modelState.model,
                          arrowSnapshots,
                        );
                      if (updatedFont)
                        for (let [propertyName, propertyValue] of [
                          ...editsByTid.values(),
                        ].flat() as Dynamic) {
                          let fontFamily: Dynamic =
                            propertyName === "font-family" && propertyValue
                              ? knownWebFontFamily(
                                  firstFontFamily(propertyValue),
                                )
                              : undefined;
                          fontFamily !== undefined &&
                            model.ensureWebfontLink(fontFamily);
                        }
                      return updatedFont;
                    },
                    {
                      structural: false,
                      pushUndo: editOptions?.undo ?? true,
                    },
                  );
                  return mutationResult === "applied" || mutationResult === "applied-dirty";
                });
          },
          [artboardComponentId, previewFile, flushStyleQueue],
        ),
        pageFill: Dynamic = (0, reactCanvasShape.useCallback)(
          (): Dynamic =>
            componentSessionRef.current
              .ensureModel(artboardComponentId)
              .then(
                (model?: Dynamic): Dynamic =>
                  model && model.path === previewFile
                    ? model.model.pageFill()
                    : null,
              ),
          [artboardComponentId, previewFile],
        ),
        pageFillRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        setPageFill: Dynamic = (0, reactCanvasShape.useCallback)(
          (edits?: Dynamic): Dynamic => {
            let normalizedEdits: Dynamic = edits.map(
              (edit?: Dynamic): Dynamic => ({
                prop: edit.prop,
                value:
                  edit.value === null
                    ? null
                    : isSafeBackgroundStyle(
                        edit.prop,
                        edit.value,
                      ),
              }),
            );
            return normalizedEdits.length === 0 ||
              normalizedEdits.some(
                (edit?: Dynamic, index?: Dynamic): Dynamic =>
                  !CssEditValidationBackgroundBackgroundColorSet.has(
                    edit.prop,
                  ) ||
                  (edits[index].value !== null && edit.value === null),
              )
              ? Promise.resolve(false)
              : flushStyleQueue(async (): Promise<Dynamic> => {
                  let componentState: Dynamic = resolveComponentState(artboardComponentId),
                    editKey: Dynamic = normalizedEdits
                      .map((edit?: Dynamic): Dynamic => edit.prop)
                      .join("+"),
                    previousFillEdit: Dynamic = pageFillRef.current,
                    timestamp: Dynamic = Date.now(),
                    pushUndo: Dynamic =
                      previousFillEdit != null &&
                      componentState != null &&
                      previousFillEdit.key === editKey &&
                      timestamp - previousFillEdit.at < ModelModelStateLimit &&
                      componentState.undo.length === previousFillEdit.depth &&
                      componentState.undo[previousFillEdit.depth - 1] === previousFillEdit.top,
                    mutationResult: Dynamic = await componentSessionRef.current.mutate(
                      artboardComponentId,
                      (model?: Dynamic, modelState?: Dynamic): Dynamic =>
                        modelState.path !== previewFile
                          ? false
                          : model.setPageFill(normalizedEdits),
                      {
                        structural: false,
                        pushUndo: !pushUndo,
                      },
                    ),
                    historyResult: Dynamic =
                      mutationResult === "applied" || mutationResult === "applied-dirty",
                    historyState: Dynamic = resolveComponentState(artboardComponentId);
                  historyResult &&
                    historyState &&
                    (pageFillRef.current = {
                      key: editKey,
                      at: timestamp,
                      depth: historyState.undo.length,
                      top: historyState.undo[historyState.undo.length - 1],
                    });
                  return historyResult;
                });
          },
          [artboardComponentId, previewFile, flushStyleQueue, resolveComponentState],
        ),
        styleGestureRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        beginStyleGesture: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          flushStyleQueue((): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            styleGestureRef.current = componentState ? componentState.model.serialize() : null;
          });
        }, [flushStyleQueue, resolveComponentState, artboardComponentId]),
        endStyleGesture: Dynamic = (0, reactCanvasShape.useCallback)(
          (): Dynamic =>
            flushStyleQueue((): Dynamic => {
              let beforeGestureSnapshot: Dynamic = styleGestureRef.current;
              styleGestureRef.current = null;
              return beforeGestureSnapshot == null
                ? false
                : componentSessionRef.current.pushUndoSnapshot(artboardComponentId, beforeGestureSnapshot);
            }),
          [flushStyleQueue, artboardComponentId],
        ),
        [selectedMediaSnapshot, setSelectedMedia]: Dynamic = (0, reactCanvasShape.useState)(
          null,
        ),
        selectedMediaRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        cropActiveRef: Dynamic = (0, reactCanvasShape.useRef)(false),
        lastCropChangeRef: Dynamic = (0, reactCanvasShape.useRef)(0),
        readCropState: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let [selectedMedia, currentState]: Dynamic = [selectedMediaRef.current, resolveComponentState(artboardComponentId)],
            cropTid: Dynamic = parseInt(
              selectedMedia?.el.getAttribute(DcTplAttribute) ?? "",
              10,
            );
          return selectedMedia &&
            currentState &&
            Number.isSafeInteger(cropTid) &&
            currentState.model.element(cropTid) === selectedMedia.el
            ? cropTid
            : null;
        }, [artboardComponentId, resolveComponentState]),
        styleEditCountsRef: Dynamic = (0, reactCanvasShape.useRef)(new WeakMap()),
        applyStyleEdit: Dynamic = (0, reactCanvasShape.useCallback)(
          (element?: Dynamic): Dynamic => {
            let editCount: Dynamic = (styleEditCountsRef.current.get(element) ?? 0) + 1;
            styleEditCountsRef.current.set(element, editCount);
            return editCount;
          },
          [],
        ),
        setStyleProperty: Dynamic = (0, reactCanvasShape.useCallback)(
          (element?: Dynamic, styleOptions?: Dynamic): Dynamic => (
            applyStyleEdit(element),
            flushStyleQueue(
              (): Dynamic =>
                componentSessionRef.current.mutate(
                  artboardComponentId,
                  (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                    let propertyIndex: Dynamic = parseInt(
                      element.getAttribute(DcTplAttribute) ?? "",
                      10,
                    );
                    return modelState.path !== previewFile ||
                      modelState.model.element(propertyIndex) !== element
                      ? false
                      : styleOptions
                          .map(
                            ([propertyName, propertyValue]: Dynamic): Dynamic =>
                              model.setStyleProperty(propertyIndex, propertyName, propertyValue),
                          )
                          .some(Boolean);
                  },
                  {
                    structural: false,
                    pushUndo: true,
                  },
                ),
            )
          ),
          [previewFile, artboardComponentId, flushStyleQueue, applyStyleEdit],
        ),
        setStylePropertyRef: Dynamic = (0, reactCanvasShape.useRef)(setStyleProperty);
      setStylePropertyRef.current = setStyleProperty;
      let finishCrop: Dynamic = (0, reactCanvasShape.useCallback)(
          (cropState?: Dynamic): Dynamic => {
            let selectedMedia: Dynamic = selectedMediaRef.current;
            if (!selectedMedia) return;
            let isCropActive: Dynamic = readCropState() !== null;
            selectedMediaRef.current = null;
            setSelectedMedia(null);
            updateElementSessionState(previewFile, {
              cropping: null,
            });
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && setPickerScrubbing(previewHandle, false);
            let finishWrite: Dynamic = (): Dynamic => {
                if (previewHandle)
                  for (let tid of selectedMedia.tids as Dynamic)
                    unpatchPickerStyle(
                      previewHandle,
                      artboardComponentId,
                      [tid],
                      selectedMedia.token,
                    );
              },
              normalizedEdits: Dynamic = normalizeStyleEdits(
                imageCropStyleEdits(
                  selectedMedia.at.frame,
                  selectedMedia.at.natural,
                  selectedMedia.live,
                ),
              ),
              didWrite: Dynamic = JSON.stringify(normalizedEdits) !== selectedMedia.wrote;
            cropState &&
              didWrite &&
              !isCropActive &&
              (announce(
                uiMessage("canvas.artboardFrame.thePictureChangedWhileYou"),
              ),
              showToast(
                uiMessage("canvas.artboardFrame.thePictureChangedWhileYou"),
              ));
            selectedMedia.closed =
              !cropState || !isCropActive ? "dropped" : didWrite ? "wrote" : "held";
            if (selectedMedia.closed !== "wrote") return finishWrite();
            cropActiveRef.current = true;
            activeMediaRef.current = null;
            updateElementSessionState(previewFile, {
              target: null,
            });
            setStyleProperty(selectedMedia.el, normalizedEdits)
              .then((mutationStatus?: Dynamic): Dynamic => {
                mutationStatus === "applied" || mutationStatus === "applied-dirty"
                  ? announce("Cropped.", {
                      ifIdle: true,
                    })
                  : finishWrite();
              }, finishWrite)
              .finally((): Dynamic => {
                cropActiveRef.current = false;
                previewHandle && repostPickerChrome(previewHandle);
              });
          },
          [previewFile, artboardComponentId, readCropState, setStyleProperty, showToast],
        ),
        canEdit: Dynamic = canEditPreview === true && !readOnly,
        canEditRef: Dynamic = (0, reactCanvasShape.useRef)(canEdit);
      canEditRef.current = canEdit;
      let toggleCrop: Dynamic = (0, reactCanvasShape.useCallback)(
          (tid?: Dynamic, isLive: Dynamic = false): Dynamic => {
            if (selectedMediaRef.current) return finishCrop(true);
            let activeMedia: Dynamic = activeMediaRef.current,
              tagName: Dynamic = resolveComponentState(artboardComponentId)
                ?.model.tagName(tid)
                ?.toLowerCase(),
              previewHandle: Dynamic = createPreviewHandle(
                iframeRef.current,
              );
            if (
              !canEdit ||
              cropActiveRef.current ||
              !previewHandle ||
              !activeMedia?.media ||
              activeMedia.media.tid !== tid ||
              SessionElementStateGet(previewFile).target === null ||
              "off" in SessionElementStateGet(previewFile).target ||
              (tagName !== "img" && tagName !== "video")
            )
              return;
            let element: Dynamic = resolveComponentState(artboardComponentId)?.model.element(tid);
            if (!element) return;
            let { media: media }: Dynamic = activeMedia,
              cropState: Dynamic = {
                w: activeMedia.w * (1 - media.inset[0] - media.inset[2]),
                h: activeMedia.h * (1 - media.inset[1] - media.inset[3]),
              },
              cropGeometry: Dynamic = MediaObjectCropEvery(
                cropState,
                media,
                cropFromObjectStyles(
                  cropState,
                  media,
                  media.view,
                ),
              );
            isLive
              ? ((document as Dynamic).activeElement instanceof HTMLElement &&
                  (document as Dynamic).activeElement.tagName === "IFRAME" &&
                  (document as Dynamic).activeElement.blur(),
                (window as Dynamic).focus())
              : focusCanvasDocument();
            let cropToken: Dynamic = "crop-" + String(Date.now());
            setPickerScrubbing(previewHandle, true);
            patchPickerStyle(
              previewHandle,
              artboardComponentId,
              [tid],
              Object.fromEntries(
                imageCropStyleEdits(
                  cropState,
                  media,
                  cropGeometry,
                ).map(
                  ([property, propertyValue]: Dynamic): Dynamic => [
                    property,
                    propertyValue ?? "none",
                  ],
                ),
              ),
              cropToken,
            );
            applyStyleEdit(element);
            selectedMediaRef.current = {
              tid: tid,
              tids: new Set([tid]),
              token: cropToken,
              el: element,
              live: cropGeometry,
              wrote: JSON.stringify(
                normalizeStyleEdits(
                  imageCropStyleEdits(cropState, media, cropGeometry),
                ),
              ),
              at: {
                frame: cropState,
                natural: {
                  w: media.w,
                  h: media.h,
                },
              },
            };
            let imageSource: Dynamic =
                resolveComponentState(artboardComponentId)?.model.attributes(tid)?.src,
              supportsCropZoom: Dynamic = MediaObjectCropSupports()
                ? undefined
                : ThisBrowserCanTZoomAPictureMessage;
            setSelectedMedia({
              tid: tid,
              live: cropGeometry,
              src:
                inlineImageUrl(imageSource) ??
                (imageSource !== undefined
                  ? inlineImagePreview(imageSource)
                  : null),
              noZoom: supportsCropZoom,
            });
            updateElementSessionState(previewFile, {
              cropping: tid,
            });
          },
          [previewFile, artboardComponentId, resolveComponentState, canEdit, finishCrop],
        ),
        readCropEnabled: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let [selectedMedia, previewHandle, currentCropTid]: Dynamic = [
            selectedMediaRef.current,
            createPreviewHandle(iframeRef.current),
            readCropState(),
          ];
          return !selectedMedia || !previewHandle || currentCropTid === null
            ? false
            : (currentCropTid === selectedMedia.tid ||
                (unpatchPickerStyle(
                  previewHandle,
                  artboardComponentId,
                  [selectedMedia.tid],
                  selectedMedia.token,
                ),
                (selectedMedia.tid = currentCropTid),
                selectedMedia.tids.add(currentCropTid),
                patchPickerStyle(
                  previewHandle,
                  artboardComponentId,
                  [currentCropTid],
                  Object.fromEntries(
                    imageCropStyleEdits(
                      selectedMedia.at.frame,
                      selectedMedia.at.natural,
                      selectedMedia.live,
                    ).map(
                      ([property, propertyValue]: Dynamic): Dynamic => [
                        property,
                        propertyValue ?? "none",
                      ],
                    ),
                  ),
                  selectedMedia.token,
                ),
                setSelectedMedia(
                  (media?: Dynamic): Dynamic =>
                    media && {
                      ...media,
                      tid: currentCropTid,
                    },
                ),
                updateElementSessionState(previewFile, {
                  cropping: currentCropTid,
                })),
              true);
        }, [previewFile, artboardComponentId, readCropState]),
        readCropEnabledRef: Dynamic = (0, reactCanvasShape.useRef)(readCropEnabled);
      readCropEnabledRef.current = readCropEnabled;
      let finishCropRef: Dynamic = (0, reactCanvasShape.useRef)(finishCrop);
      finishCropRef.current = finishCrop;
      let toggleCropRef: Dynamic = (0, reactCanvasShape.useRef)(toggleCrop);
      toggleCropRef.current = toggleCrop;
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic => finishCropRef.current(false),
        [],
      );
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        canEdit || finishCropRef.current(false);
      }, [canEdit]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic => finishCropRef.current(false),
        [displayedGeneration],
      );
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        panelMounted !== true && finishCropRef.current(true);
      }, [panelMounted]);
      let cropModel: Dynamic = (0, reactCanvasShape.useMemo)(
          (): Dynamic =>
            selectedMediaSnapshot && {
              tid: selectedMediaSnapshot.tid,
              live: selectedMediaSnapshot.live,
              src: selectedMediaSnapshot.src,
              zoomDisabledReason: selectedMediaSnapshot.noZoom,
              onLive: (
                liveCrop?: Dynamic,
                frame?: Dynamic,
                naturalSize?: Dynamic,
              ): Dynamic => {
                let selectedMedia: Dynamic = selectedMediaRef.current,
                  previewHandle: Dynamic = createPreviewHandle(
                    iframeRef.current,
                  );
                if (!(!selectedMedia || !previewHandle || !readCropEnabled())) {
                  if (
                    liveCrop.zoom > selectedMedia.live.zoom &&
                    MediaObjectCropZoom(frame, naturalSize, liveCrop)
                  ) {
                    Date.now() - lastCropChangeRef.current > 2e3 &&
                      announce(
                        YouCanTCropAnyFurtherAtMessage,
                      );
                    lastCropChangeRef.current = Date.now();
                    return;
                  }
                  selectedMedia.live = liveCrop;
                  selectedMedia.at = {
                    frame: frame,
                    natural: naturalSize,
                  };
                  setSelectedMedia(
                    (cropState?: Dynamic): Dynamic =>
                      cropState && {
                        ...cropState,
                        live: liveCrop,
                      },
                  );
                  holdPickerStyle(
                    previewHandle,
                    artboardComponentId,
                    [selectedMedia.tid],
                    Object.fromEntries(
                      imageCropStyleEdits(
                        frame,
                        naturalSize,
                        liveCrop,
                      ).map(
                        ([property, propertyValue]: Dynamic): Dynamic => [
                          property,
                          propertyValue ?? "none",
                        ],
                      ),
                    ),
                    selectedMedia.token,
                  );
                }
              },
              onDone: finishCrop,
              onGesture: (gesture?: Dynamic): Dynamic =>
                onHostGesture?.("element-crop", gesture),
              onSideStart: (
                tid?: Dynamic,
                frame?: Dynamic,
                natural?: Dynamic,
              ): Dynamic => cropGestureRef.current(tid, frame, natural),
            },
          [selectedMediaSnapshot, artboardComponentId, readCropEnabled, finishCrop, onHostGesture],
        ),
        describeSelectionTids: Dynamic = (0, reactCanvasShape.useCallback)(
          (tids?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            if (!componentState) return [];
            let descriptions: Dynamic = [];
            for (let tid of tids as Dynamic) {
              let describedElement: Dynamic = componentState.model.element(tid);
              if (!describedElement) continue;
              let ancestorPath: Dynamic = [];
              for (let ancestorTid: Dynamic = tid; ancestorTid !== null; ) {
                let parentTid: Dynamic = componentState.model.parentTid(ancestorTid);
                ancestorPath.unshift(
                  componentState.model.childTids(parentTid).indexOf(ancestorTid),
                );
                ancestorTid = parentTid;
              }
              let tagName: Dynamic =
                  componentState.model.tagName(tid)?.toLowerCase() ?? "",
                extractText: Dynamic = (element?: Dynamic): Dynamic =>
                  tagName === "img"
                    ? (describedElement.getAttribute("alt") ?? "")
                    : extractVisibleElementText(describedElement, {
                        visits: element,
                      }),
                elementKind: Dynamic = isTextCapableElement(
                  describedElement,
                  componentState.model.isTextEditable(tid),
                );
              descriptions.push({
                path: String(tid) + ":" + ancestorPath.join("/"),
                kind: elementKind === "box" ? "shape" : elementKind,
                words: extractText,
              });
            }
            return descriptions;
          },
          [resolveComponentState, artboardComponentId],
        ),
        describeTids: Dynamic = (0, reactCanvasShape.useCallback)(
          (tids?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            return componentState
              ? tids
                  .filter(
                    (tid?: Dynamic): Dynamic =>
                      componentState.model.element(tid) != null,
                  )
                  .map((tid?: Dynamic): Dynamic => {
                    let element: Dynamic = componentState.model.element(tid),
                      isTextEditable: Dynamic = componentState.model.isTextEditable(tid);
                    return {
                      tid: tid,
                      kind: isTextCapableElement(
                        element,
                        isTextEditable,
                      ),
                      tag: element.tagName.toLowerCase(),
                      editable: isTextEditable,
                    };
                  })
              : [];
          },
          [resolveComponentState, artboardComponentId],
        ),
        insertHtml: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            html?: Dynamic,
            placement: Dynamic = "root-end",
            insertContext?: Dynamic,
          ): Promise<Dynamic> => {
            let insertedTids: Dynamic = [];
            await componentSessionRef.current.mutate(
              artboardComponentId,
              (dropTargetTid?: Dynamic, modelState?: Dynamic): Dynamic => {
                if (modelState.path !== previewFile) return false;
                let resolveTarget: Dynamic = (targetTid?: Dynamic): Dynamic => {
                    let parentTarget: Dynamic =
                        insertContext != null &&
                        modelState.model
                          .topLevelTags(targetTid)
                          .filter(
                            (selector?: Dynamic): Dynamic =>
                              !SelectionActionsHelmetScHelmetPattern.test(
                                selector,
                              ),
                          ).length === 1
                          ? insertContext
                          : null,
                      parentElement: Dynamic =
                        parentTarget != null || placement === "page"
                          ? emptyArtboardDropTarget(
                              modelState.model,
                              targetTid,
                            )
                          : null,
                      placementTarget: Dynamic = pasteParentTarget(
                        placement,
                        parentTarget,
                        parentElement,
                        targetTid,
                      ),
                      insertionMode: Dynamic =
                        placement === "root-end" &&
                        containsFlowPastedElements(
                          placementTarget != null,
                          targetTid,
                        ),
                      resolvedPlacement: Dynamic = parentElement
                        ? parentElement.placement
                        : placement === "stage"
                          ? defaultInsertionPoint(
                              modelState.model,
                              targetTid,
                            )
                          : insertionMode
                            ? insertionPointForSelection(
                                modelState.model,
                                [],
                                targetTid,
                              )
                            : {
                                targetTid: null,
                                position: "root-end",
                              };
                    return {
                      html: placementTarget
                        ? positionPastedHtml(targetTid, placementTarget)
                        : targetTid,
                      placement: resolvedPlacement,
                    };
                  },
                  resolvedTarget: Dynamic = resolveTarget(html),
                  fallbackTarget: Dynamic =
                    placement === "stage"
                      ? wrapInlinePastedHtml(html)
                      : html,
                  parentInfo: Dynamic =
                    fallbackTarget !== html ? resolveTarget(fallbackTarget) : null,
                  fallbackPlacement: Dynamic =
                    parentInfo &&
                    sameInsertionPoint(
                      parentInfo.placement,
                      resolvedTarget.placement,
                    )
                      ? parentInfo
                      : resolvedTarget;
                insertedTids = insertHtmlIntoModel(
                  modelState,
                  fallbackPlacement.html,
                  fallbackPlacement.placement,
                );
                return insertedTids.length > 0;
              },
              {
                structural: true,
              },
            );
            return insertedTids;
          },
          [artboardComponentId, previewFile],
        ),
        insertLayerAt: Dynamic = (0, reactCanvasShape.useCallback)(
          (
            insertHtmlContent?: Dynamic,
            insertPlacement?: Dynamic,
            insertLiveState?: Dynamic,
            replaced?: Dynamic,
          ): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            return placeElementAtMeasuredPoint(
              {
                state: (): Dynamic => resolveComponentState(artboardComponentId),
                measure: (
                  html?: Dynamic,
                  placement?: Dynamic,
                  liveState?: Dynamic,
                ): Dynamic =>
                  previewHandle
                    ? requestInsertionContainerTransform(
                        previewHandle,
                        artboardComponentId,
                        html,
                        placement,
                        liveState,
                      )
                    : Promise.resolve(null),
                live: insertLiveState,
                replaced: replaced,
                mutate: async (mutate?: Dynamic): Promise<Dynamic> => {
                  let insertedTids: Dynamic = [];
                  await componentSessionRef.current.mutate(
                    artboardComponentId,
                    (html?: Dynamic, mutationOptions?: Dynamic): Dynamic =>
                      mutationOptions.path !== previewFile
                        ? false
                        : ((insertedTids = mutate(mutationOptions)), insertedTids.length > 0),
                    {
                      structural: true,
                    },
                  );
                  return insertedTids;
                },
              },
              insertHtmlContent,
              insertPlacement,
            );
          },
          [resolveComponentState, artboardComponentId, previewFile],
        ),
        insertAtPoint: Dynamic = (0, reactCanvasShape.useCallback)(
          (html?: Dynamic, placement?: Dynamic, insertContext?: Dynamic): Dynamic =>
            insertLayerAt(html, placement, insertContext, (): Dynamic => null),
          [insertLayerAt],
        ),
        formatCommand: Dynamic = (0, reactCanvasShape.useCallback)(
          (tid?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && formatPickerText(previewHandle, tid);
          },
          [],
        ),
        startTextEdit: Dynamic = (0, reactCanvasShape.useCallback)(
          (tid?: Dynamic, text?: Dynamic, selection?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              startPickerTextEdit(
                previewHandle,
                text,
                tid,
                selection,
              );
          },
          [],
        ),
        holdsDeck: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          if (resolveComponentState(artboardComponentId)?.model.findDeckStage() != null) return true;
          try {
            return (
              iframeRef.current?.contentDocument?.querySelector("deck-stage") !=
              null
            );
          } catch {
            return false;
          }
        }, [resolveComponentState, artboardComponentId]),
        pageFonts: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let componentState: Dynamic = resolveComponentState(artboardComponentId);
          return componentState
            ? collectFontFamilies(componentState.model.serialize())
            : [];
        }, [resolveComponentState, artboardComponentId]),
        pageCensusRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        pageCensus: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let componentState: Dynamic = resolveComponentState(artboardComponentId),
            cachedCensus: Dynamic = pageCensusRef.current,
            stampGeneration: Dynamic = componentState?.stampGen ?? -1,
            colorVariables: Dynamic = getDesignSystemColorVariables();
          if (
            cachedCensus &&
            componentState &&
            cachedCensus.model === componentState.model &&
            cachedCensus.stamp === stampGeneration &&
            cachedCensus.gen === frameUpdateCountRef.current &&
            cachedCensus.tokens === colorVariables
          )
            return cachedCensus.census;
          let serializedModel: Dynamic = componentState ? componentState.model.serialize() : "",
            censusState: Dynamic = {
              fonts: componentState ? collectFontFamilies(serializedModel) : [],
              webfonts: componentState
                ? collectGoogleFontFamilies(serializedModel)
                : [],
              sizes: componentState ? collectFontSizes(serializedModel) : [],
              colors: componentState
                ? collectColorTokens(serializedModel, colorVariables)
                : new Map(),
              roles: componentState
                ? collectFontSizeFamilyUsage(serializedModel)
                : new Map(),
              families: componentState
                ? collectTypographyRoles(serializedModel)
                : new Map(),
            };
          pageCensusRef.current = componentState
            ? {
                model: componentState.model,
                stamp: stampGeneration,
                gen: frameUpdateCountRef.current,
                tokens: colorVariables,
                census: censusState,
              }
            : null;
          return censusState;
        }, [resolveComponentState, artboardComponentId]),
        swapImageAttrs: Dynamic = (0, reactCanvasShape.useCallback)(
          async (sourceImageId?: Dynamic, mutationOptions?: Dynamic): Promise<Dynamic> => {
            if (!validatePastedAttributeEdits(mutationOptions))
              return false;
            let updated: Dynamic = false;
            await componentSessionRef.current.mutate(
              artboardComponentId,
              (imageId?: Dynamic, modelState?: Dynamic): Dynamic => {
                if (modelState.path !== previewFile) return false;
                for (let element of modelState.model.elementsByAttr(
                  "src",
                  sourceImageId,
                ) as Dynamic) {
                  if (element.tagName.toLowerCase() !== "img") continue;
                  let templateId: Dynamic = parseInt(
                    element.getAttribute("data-dc-tpl") ?? "-1",
                    10,
                  );
                  if (!(templateId < 0)) {
                    for (let [attributeName, attributeValue] of Object.entries(
                      mutationOptions,
                    ) as Dynamic)
                      modelState.model.setAttribute(templateId, attributeName, attributeValue);
                    updated = true;
                  }
                }
                return updated;
              },
              {
                structural: false,
              },
            );
            return updated;
          },
          [artboardComponentId, previewFile],
        ),
        replaceImageFor: Dynamic = (0, reactCanvasShape.useCallback)(
          async (imageId?: Dynamic, mutationOptions?: Dynamic): Promise<Dynamic> => {
            if (!validatePastedAttributeEdits(mutationOptions))
              return false;
            finishCropRef.current(false);
            let mutationResult: Dynamic = await componentSessionRef.current.mutate(
              artboardComponentId,
              (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                if (modelState.path !== previewFile) return false;
                let imageElement: Dynamic = modelState.model.element(imageId);
                if (!imageElement || imageElement.tagName.toLowerCase() !== "img")
                  return false;
                for (let [attributeName, attributeValue] of Object.entries(
                  mutationOptions,
                ) as Dynamic)
                  modelState.model.setAttribute(imageId, attributeName, attributeValue);
                if (
                  MediaObjectCropTest(
                    (styleProperty?: Dynamic): Dynamic =>
                      modelState.model.inlineStyleValue(imageId, styleProperty),
                  )
                )
                  for (let propertyName of [
                    "object-view-box",
                    "object-position",
                  ] as Dynamic)
                    model.setStyleProperty(imageId, propertyName, null);
                return true;
              },
              {
                structural: false,
                pushUndo: true,
              },
            );
            return mutationResult === "applied" || mutationResult === "applied-dirty";
          },
          [artboardComponentId, previewFile],
        ),
        videoElement: Dynamic = (0, reactCanvasShape.useCallback)(
          (tid?: Dynamic): Dynamic => {
            try {
              return findPreviewMediaElement(
                iframeRef.current?.contentDocument,
                DcTplAttribute,
                tid,
                artboardComponentId,
              );
            } catch {
              return null;
            }
          },
          [artboardComponentId],
        ),
        videoKey: Dynamic = (0, reactCanvasShape.useCallback)(
          (tid?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            return componentState
              ? createVideoElementIdentity(componentState.model, tid)
              : null;
          },
          [resolveComponentState, artboardComponentId],
        ),
        replaceVideoFor: Dynamic = (0, reactCanvasShape.useCallback)(
          async (videoId?: Dynamic, videoOptions?: Dynamic): Promise<Dynamic> => {
            if (!isValidVideoDimensions(videoOptions)) return "refused";
            let text: Dynamic = "gone";
            finishCropRef.current(false);
            let mutationResult: Dynamic = await componentSessionRef.current.mutate(
              artboardComponentId,
              (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                if (modelState.path !== previewFile) return false;
                let videoElementId: Dynamic = resolveVideoElementIdentity(modelState.model, videoId);
                if (typeof videoElementId != "number") {
                  text = videoElementId;
                  return false;
                }
                if (
                  MediaObjectCropTest(
                    (styleProperty?: Dynamic): Dynamic =>
                      modelState.model.inlineStyleValue(videoElementId, styleProperty),
                  )
                )
                  for (let propertyName of [
                    "object-view-box",
                    "object-position",
                  ] as Dynamic)
                    model.setStyleProperty(videoElementId, propertyName, null);
                modelState.model.setAttribute(videoElementId, "src", videoOptions.src);
                modelState.model.setAttribute(
                  videoElementId,
                  "width",
                  String(videoOptions.width),
                );
                modelState.model.setAttribute(
                  videoElementId,
                  "height",
                  String(videoOptions.height),
                );
                modelState.model.setAttribute(videoElementId, "poster", null);
                return true;
              },
              {
                structural: false,
                pushUndo: true,
              },
            );
            return mutationResult === "applied" || mutationResult === "applied-dirty"
              ? "ok"
              : text;
          },
          [artboardComponentId, previewFile],
        ),
        videoPreviewRef: Dynamic = (0, reactCanvasShape.useRef)(null),
        readTextTids: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
          if (!componentState) return null;
          let serializedModel: Dynamic = componentState.model.serialize(),
            cachedVideoVisibility: Dynamic = videoPreviewRef.current,
            textTids: Dynamic =
              cachedVideoVisibility && cachedVideoVisibility.src === serializedModel
                ? cachedVideoVisibility.tids
                : componentState.model
                    .textEditables()
                    .map((element?: Dynamic): Dynamic => element.tid);
          videoPreviewRef.current = {
            src: serializedModel,
            tids: textTids,
          };
          return textTids;
        }, [artboardComponentId]),
        pickAt: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            point?: Dynamic,
            selectionMode?: Dynamic,
            kind: Dynamic = "plain",
            excludedTids: Dynamic = [],
          ): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            if (!previewHandle || !(await componentSessionRef.current.ensureModel(artboardComponentId)))
              return null;
            let pickedElement: Dynamic = await pickAtPoint(
              previewHandle,
              point,
              selectionMode,
              kind,
              excludedTids,
              readTextTids() ?? [],
            );
            if (!pickedElement) return null;
            let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId),
              pickedTids: Dynamic = componentState
                ? componentState.model
                    .childTids(null)
                    .filter(
                      (tid?: Dynamic): Dynamic =>
                        !SelectionActionsHelmetScHelmetPattern.test(
                          componentState.model.tagName(tid) ?? "",
                        ),
                    )
                : [];
            if ("empty" in pickedElement) {
              if (!componentState) return null;
              let pickedText: Dynamic =
                pickedTids.length === 1
                  ? componentState.model.element(pickedTids[0])
                  : null;
              return pickedTids.length === 0 ||
                (pickedText != null &&
                  pickerElementSignature(
                    pickedText,
                    (element?: Dynamic): Dynamic =>
                      classifyElementStyleKind(element) === "text",
                  ))
                ? pickedElement
                : null;
            }
            if (!componentState || !componentState.model.element(pickedElement.tid)) return null;
            let importTag: Dynamic =
              componentState.model.tagName(pickedElement.tid)?.toLowerCase() ?? "";
            if (
              !equivalentDesignImportTags(importTag, pickedElement.tag)
            )
              return null;
            let rootElement: Dynamic =
                pickedElement.root &&
                pickedTids.length === 1 &&
                pickedTids[0] === pickedElement.tid,
              text: Dynamic = pickedElement.text,
              nestedRoot: Dynamic =
                !rootElement && text ? componentState.model.element(text.tid) : null,
              textElement: Dynamic =
                text &&
                nestedRoot &&
                componentState.model.element(pickedElement.tid)?.contains(nestedRoot) &&
                equivalentDesignImportTags(
                  componentState.model.tagName(text.tid)?.toLowerCase() ?? "",
                  text.tag,
                ) &&
                componentState.model.isTextEditable(text.tid) &&
                !componentState.model.isTextEditable(pickedElement.tid)
                  ? {
                      tid: text.tid,
                      rect: text.rect,
                    }
                  : null;
            return {
              tid: pickedElement.tid,
              rect: pickedElement.rect,
              root: rootElement,
              page: rootElement && pickedElement.page,
              text: textElement,
            };
          },
          [artboardComponentId, readTextTids],
        ),
        pickIn: Dynamic = (0, reactCanvasShape.useCallback)(
          async (point?: Dynamic, pickOptions?: Dynamic): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            if (!previewHandle || !(await componentSessionRef.current.ensureModel(artboardComponentId)))
              return null;
            let pickedElement: Dynamic = await pickInBox(
              previewHandle,
              point,
              pickOptions,
            );
            if (pickedElement == null) return null;
            let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
            return componentState
              ? [
                  ...new Set(
                    pickedElement
                      .filter(
                        (element?: Dynamic): Dynamic =>
                          componentState.model.element(element.tid) != null &&
                          equivalentDesignImportTags(
                            componentState.model.tagName(element.tid)?.toLowerCase() ??
                              "",
                            element.tag,
                          ),
                      )
                      .map((element?: Dynamic): Dynamic => element.tid),
                  ),
                ]
              : null;
          },
          [artboardComponentId],
        ),
        setShownSelection: Dynamic = (0, reactCanvasShape.useCallback)(
          (
            selectionIds?: Dynamic,
            selectionOptions?: Dynamic,
            selectionContext?: Dynamic,
            selection?: Dynamic,
          ): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            return previewHandle
              ? (setPickerSelection(
                  previewHandle,
                  selectionIds ? [...selectionIds] : null,
                  selectionOptions,
                  selectionContext,
                  selection,
                ),
                true)
              : false;
          },
          [],
        ),
        clearLabelPart: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
          previewHandle && clearPickerPart(previewHandle);
        }, []),
        hostDrag: Dynamic = (0, reactCanvasShape.useCallback)(
          (dragData?: Dynamic, dragOptions?: Dynamic, isExternal?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              finishExitedPickerDrag(
                previewHandle,
                dragData,
                dragOptions,
                !!isExternal,
              );
          },
          [],
        ),
        cancelBox: Dynamic = (0, reactCanvasShape.useCallback)(
          (reason?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && cancelPickerBox(previewHandle, reason);
          },
          [],
        ),
        armedByClick: Dynamic = (0, reactCanvasShape.useCallback)(
          (point?: Dynamic, pickOptions?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              armPickerByClick(previewHandle, point, pickOptions);
          },
          [],
        ),
        textPlacing: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
          previewHandle && beginPickerTextPlacing(previewHandle);
        }, []),
        applySelectionChanges: Dynamic = (0, reactCanvasShape.useCallback)(
          async (selection?: Dynamic, selectionOptions?: Dynamic): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
                iframeRef.current,
              ),
              componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
            if (
              !previewHandle ||
              !componentState ||
              componentState.model.element(selection.tid) !== selection.el
            )
              return;
            let pickerResult: Dynamic = await inspectPickerSelection(
              previewHandle,
              selection.tid,
              artboardComponentId,
              [...selection.pinned.keys()],
              {
                unpinned: true,
                afterPaint: selectionOptions,
              },
            );
            if (
              componentSessionRef.current.state(artboardComponentId) !== componentState ||
              componentState.model.element(selection.tid) !== selection.el
            )
              return;
            if (!pickerResult) {
              selectionOptions ||
                setTimeout((): Dynamic => {
                  applySelectionChanges(selection, true);
                }, 300);
              return;
            }
            let styleEdits: Dynamic = frozenInheritedStyleEdits(
              selection.pinned,
              pickerResult.computed,
              selection.freeze,
              (styleProperty?: Dynamic): Dynamic =>
                componentState.model.inlineStyleValue(selection.tid, styleProperty),
            );
            styleEdits.length !== 0 &&
              (await componentSessionRef.current.mutate(
                artboardComponentId,
                (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                  if (
                    modelState.path !== previewFile ||
                    modelState.model.element(selection.tid) !== selection.el
                  )
                    return false;
                  let updated: Dynamic = false;
                  for (let propertyName of styleEdits as Dynamic)
                    model.setStyleProperty(selection.tid, propertyName, null) &&
                      (updated = true);
                  return updated;
                },
                {
                  structural: false,
                  pushUndo: false,
                },
              ));
          },
          [artboardComponentId, previewFile],
        ),
        moveStart: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            selection?: Dynamic,
            elementId?: Dynamic,
            point?: Dynamic,
            candidateElementId?: Dynamic,
            excludedTids?: Dynamic,
          ): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            if (
              !previewHandle ||
              !excludedTids.includes(elementId) ||
              !(await componentSessionRef.current.ensureModel(artboardComponentId))
            )
              return null;
            let moveResult: Dynamic = await beginPickerMove(
              previewHandle,
              selection,
              elementId,
              point?.x ?? null,
              point?.y ?? null,
              candidateElementId,
            );
            if (
              moveResult == null ||
              typeof moveResult != "object" ||
              !Array.isArray(moveResult.tids) ||
              moveResult.tids.length > 500
            ) {
              cancelPickerMove(previewHandle, selection);
              return null;
            }
            let validTids: Dynamic = moveResult.tids.filter(
              (tid?: Dynamic): Dynamic =>
                Number.isInteger(tid) && tid >= 0,
            );
            if (
              validTids.length !== moveResult.tids.length ||
              validTids.length === 0 ||
              !validTids.every(
                (tid?: Dynamic): Dynamic => excludedTids.includes(tid),
              )
            ) {
              cancelPickerMove(previewHandle, selection);
              return null;
            }
            let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
            if (
              !componentState ||
              validTids.some(
                (tid?: Dynamic): Dynamic => !componentState.model.element(tid),
              ) ||
              typeof moveResult.tag != "string" ||
              !equivalentDesignImportTags(
                componentState.model.tagName(elementId)?.toLowerCase() ?? "",
                moveResult.tag,
              )
            ) {
              cancelPickerMove(previewHandle, selection);
              return null;
            }
            let rect: Dynamic = moveResult.rect,
              finiteNumber: Dynamic = (candidate?: Dynamic): Dynamic =>
                typeof candidate == "number" &&
                Number.isFinite(candidate) &&
                Math.abs(candidate) < 1e6
                  ? candidate
                  : null,
              moveRect: Dynamic =
                rect != null && typeof rect == "object"
                  ? {
                      x: finiteNumber(rect.x),
                      y: finiteNumber(rect.y),
                      w: finiteNumber(rect.w),
                      h: finiteNumber(rect.h),
                    }
                  : null;
            if (
              !moveRect ||
              moveRect.x == null ||
              moveRect.y == null ||
              moveRect.w == null ||
              moveRect.h == null
            ) {
              cancelPickerMove(previewHandle, selection);
              return null;
            }
            let moveMembers: Dynamic = [],
              members: Dynamic = moveResult.members;
            if (Array.isArray(members))
              for (let memberValue of members.slice(0, 500) as Dynamic) {
                if (memberValue == null || typeof memberValue != "object") continue;
                let member: Dynamic = memberValue,
                  tid: Dynamic = member.tid;
                if (
                  !Number.isInteger(tid) ||
                  !validTids.includes(tid) ||
                  typeof member.tag != "string" ||
                  !/^[a-z][a-z0-9-]{0,63}$/.test(member.tag) ||
                  !equivalentDesignImportTags(
                    componentState.model.tagName(tid)?.toLowerCase() ?? "",
                    member.tag,
                  )
                )
                  continue;
                let memberRect: Dynamic = member.rect,
                  memberBounds: Dynamic =
                    memberRect != null && typeof memberRect == "object"
                      ? {
                          x: finiteNumber(memberRect.x),
                          y: finiteNumber(memberRect.y),
                          w: finiteNumber(memberRect.w),
                          h: finiteNumber(memberRect.h),
                        }
                      : null;
                !memberBounds ||
                  memberBounds.x == null ||
                  memberBounds.y == null ||
                  memberBounds.w == null ||
                  memberBounds.h == null ||
                  moveMembers.push({
                    tid: tid,
                    tag: member.tag,
                    rect: {
                      x: memberBounds.x,
                      y: memberBounds.y,
                      w: memberBounds.w,
                      h: memberBounds.h,
                    },
                  });
              }
            return {
              tids: validTids,
              rect: {
                x: moveRect.x,
                y: moveRect.y,
                w: moveRect.w,
                h: moveRect.h,
              },
              mode: moveResult.mode === "abs" ? "abs" : "flow",
              members: moveMembers,
            };
          },
          [artboardComponentId],
        ),
        moveMove: Dynamic = (0, reactCanvasShape.useCallback)(
          (selection?: Dynamic, point?: Dynamic, dropContext?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              updatePickerMove(
                previewHandle,
                selection,
                point.x,
                point.y,
                dropContext,
              );
          },
          [],
        ),
        moveCancel: Dynamic = (0, reactCanvasShape.useCallback)(
          (reason?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && cancelPickerMove(previewHandle, reason);
          },
          [],
        ),
        moveSettle: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
          previewHandle && settlePickerMove(previewHandle);
        }, []),
        moveEnd: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            selection?: Dynamic,
            point?: Dynamic,
            dropContext?: Dynamic,
            fallback?: Dynamic,
          ): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            if (!previewHandle) return null;
            let moveResult: Dynamic = await finishPickerMove(
              previewHandle,
              selection,
              point.x,
              point.y,
              dropContext,
            );
            return moveResult == null ||
              typeof moveResult != "object" ||
              moveResult.plan == null
              ? null
              : parseElementMoveSnapshot(moveResult.plan, fallback);
          },
          [],
        ),
        moveElements: Dynamic = (0, reactCanvasShape.useCallback)(
          async (moves?: Dynamic): Promise<Dynamic> => {
            if (moves.length !== 1) return "refused";
            let newTids: Dynamic = [],
              groupTids: Dynamic = [],
              inPlace: Dynamic = false,
              moveStatus: Dynamic;
            try {
              moveStatus = await componentSessionRef.current.mutate(
                artboardComponentId,
                (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                  if (modelState.path !== previewFile) return false;
                  let serializedModel: Dynamic = modelState.model.serialize(),
                    movedTids: Dynamic = [],
                    groupedTids: Dynamic = [],
                    moveResults: Dynamic = moves.map(
                      (element?: Dynamic): Dynamic => {
                        let matchedMove: Dynamic =
                          element.block ??
                          sameParentDropGroup(
                            modelState.model,
                            element.tid,
                            element.group,
                          );
                        return {
                          ...element,
                          block:
                            matchedMove && matchedMove[0] === element.tid
                              ? matchedMove
                              : null,
                        };
                      },
                    );
                  if (
                    moveResults.every(
                      (element?: Dynamic): Dynamic =>
                        elementMoveRefusal(
                          modelState.model,
                          element,
                        ) === "in-place",
                    )
                  ) {
                    inPlace = true;
                    return false;
                  }
                  for (let moveResult of moveResults as Dynamic) {
                    let movedElement: Dynamic = moveModelElement(
                      modelState,
                      moveResult,
                    );
                    if (!movedElement) {
                      modelState.model = modelState.model.rebuild(serializedModel);
                      return false;
                    }
                    movedTids.push(
                      movedElement.newTid,
                      ...movedElement.groupTids.filter(
                        (tid?: Dynamic): Dynamic =>
                          tid !== movedElement.newTid && tid >= 0,
                      ),
                    );
                    groupedTids.push(...movedElement.pins);
                  }
                  newTids = [...new Set(movedTids)];
                  groupTids = groupedTids;
                  return true;
                },
                {
                  structural: true,
                },
              );
            } catch {
              return "failed";
            }
            if (inPlace) return "in-place";
            if (moveStatus !== "applied" && moveStatus !== "applied-dirty")
              return moveStatus === "refused" ? "refused" : "failed";
            for (let tid of groupTids as Dynamic)
              setTimeout((): Dynamic => {
                applySelectionChanges(tid, false);
              }, 120);
            return {
              newTids: newTids,
            };
          },
          [artboardComponentId, previewFile, applySelectionChanges],
        ),
        stageIsEmpty: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          if (!(await componentSessionRef.current.ensureModel(artboardComponentId))) return false;
          let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
          if (!componentState) return false;
          let stageTids: Dynamic = componentState.model
              .childTids(null)
              .filter(
                (tid?: Dynamic): Dynamic =>
                  !SelectionActionsHelmetScHelmetPattern.test(
                    componentState.model.tagName(tid) ?? "",
                  ),
              ),
            stageElement: Dynamic =
              stageTids.length === 1
                ? componentState.model.element(stageTids[0])
                : null;
          return (
            stageTids.length === 0 ||
            (stageElement != null &&
              pickerElementSignature(
                stageElement,
                (element?: Dynamic): Dynamic =>
                  classifyElementStyleKind(element) === "text",
              ))
          );
        }, [artboardComponentId]),
        isFreeCanvas: Dynamic = (0, reactCanvasShape.useCallback)(
          async (point?: Dynamic): Promise<Dynamic> => {
            if (!(await componentSessionRef.current.ensureModel(artboardComponentId))) return false;
            let componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
            return (
              componentState != null &&
              emptyArtboardDropTarget(componentState.model, point) !=
                null
            );
          },
          [artboardComponentId],
        ),
        moveHost: Dynamic = (0, reactCanvasShape.useCallback)(
          async (selection?: Dynamic, point?: Dynamic): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            return previewHandle
              ? pickerMoveHold(previewHandle, selection, point)
              : false;
          },
          [],
        ),
        moveExit: Dynamic = (0, reactCanvasShape.useCallback)(
          (reason?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && exitPickerMove(previewHandle, reason);
          },
          [],
        ),
        moveReturn: Dynamic = (0, reactCanvasShape.useCallback)(
          (reason?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && returnPickerMove(previewHandle, reason);
          },
          [],
        ),
        moveTouch: Dynamic = (0, reactCanvasShape.useCallback)(
          (touch?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && touchPickerMove(previewHandle, touch);
          },
          [],
        ),
        canDropHtml: Dynamic = (0, reactCanvasShape.useCallback)(
          (
            model?: Dynamic,
            dropOptions?: Dynamic,
            targetTag?: Dynamic,
            parentElement?: Dynamic,
          ): Dynamic => {
            let targetTid: Dynamic = dropOptions.targetTid;
            if (targetTid != null) {
              let dropTargetElement: Dynamic = model.element(targetTid);
              if (
                !dropTargetElement ||
                containsUneditableSelection(model, [targetTid]) ||
                model.isUneditable(targetTid) ||
                dropTargetElement.closest("svg") ||
                model.targetParentLocked(targetTid, dropOptions.position)
              )
                return false;
            }
            let targetElement: Dynamic =
              dropOptions.position === "into"
                ? targetTid
                : targetTid != null
                  ? model.parentTid(targetTid)
                  : null;
            if (
              targetElement != null &&
              (model.isTextEditable(targetElement) ||
                containsUneditableSelection(model, [targetElement]))
            )
              return false;
            let allowedTags: Dynamic =
              targetElement != null
                ? (model.tagName(targetElement)?.toLowerCase() ?? "div")
                : "div";
            if (!canContainHtmlTag(allowedTags, targetTag))
              return false;
            if (parentElement != null) {
              let targetTags: Dynamic = model
                .topLevelTags(parentElement)
                .map((tag?: Dynamic): Dynamic => tag.toLowerCase());
              if (
                targetTags.length !== 1 ||
                targetTags[0] !== targetTag ||
                !canContainHtmlTag(allowedTags, targetTags[0])
              )
                return false;
            }
            return true;
          },
          [],
        ),
        dropPlanAt: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            selection?: Dynamic,
            point?: Dynamic,
            movingMembers?: Dynamic,
            dropContext?: Dynamic,
          ): Promise<Dynamic> => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            if (!previewHandle || movingMembers.length > 500) return null;
            let dropPlan: Dynamic = await planPickerDrop(
                previewHandle,
                selection,
                point.x,
                point.y,
                movingMembers,
                dropContext,
              ),
              groupMovePlan: Dynamic = parseGroupMoveSnapshot(
                dropPlan,
                movingMembers.map((element?: Dynamic): Dynamic => element.tid),
              );
            if (!groupMovePlan) return null;
            let model: Dynamic = (await componentSessionRef.current.ensureModel(
              artboardComponentId,
            ))
              ? resolveComponentState(artboardComponentId)
              : null;
            if (!model) return null;
            let refusedTids: Dynamic = [...groupMovePlan.refused],
              landingTids: Dynamic = groupMovePlan.landing.filter(
                (element?: Dynamic): Dynamic => {
                  let landingEntry: Dynamic =
                      movingMembers.find(
                        (landing?: Dynamic): Dynamic =>
                          landing.tid === element.tid,
                      )?.tag ?? "div",
                    dropPreview: Dynamic = canDropHtml(
                      model.model,
                      element,
                      landingEntry,
                      null,
                    );
                  dropPreview || refusedTids.push(element.tid);
                  return dropPreview;
                },
              );
            return {
              container: groupMovePlan.container,
              landing: landingTids,
              refused: refusedTids,
            };
          },
          [resolveComponentState, artboardComponentId, canDropHtml],
        ),
        dropPlanClear: Dynamic = (0, reactCanvasShape.useCallback)(
          (reason?: Dynamic, force: Dynamic = false): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              clearPickerDropPlan(previewHandle, reason, force);
          },
          [],
        ),
        landTravellers: Dynamic = (0, reactCanvasShape.useCallback)(
          async (
            landingMembers?: Dynamic,
            travellers?: Dynamic,
            fallbackTids: Dynamic = [],
          ): Promise<Dynamic> => {
            let landedByTid: Dynamic = new Map(),
              moveStatus: Dynamic = null,
              stayersOwn: Dynamic = null,
              stayerTids: Dynamic = [],
              moveResult: Dynamic,
              resolveElement: Dynamic = (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10);
            try {
              moveResult = await componentSessionRef.current.mutate(
                artboardComponentId,
                (model?: Dynamic, modelState?: Dynamic): Dynamic => {
                  if (modelState.path !== previewFile) return false;
                  let serializedModel: Dynamic = modelState.model.serialize();
                  try {
                    let travellerElements: Dynamic = landingMembers.map(
                        (traveller?: Dynamic): Dynamic =>
                          traveller.landing.targetTid == null
                            ? null
                            : modelState.model.element(traveller.landing.targetTid),
                      ),
                      travellerTids: Dynamic =
                        travellers.length === 1
                          ? [
                              travellers[0].tid,
                              ...(travellers[0].followers ?? []).map(
                                (traveller?: Dynamic): Dynamic => traveller.tid,
                              ),
                              ...(travellers[0].group ?? []).map(
                                (traveller?: Dynamic): Dynamic => traveller.tid,
                              ),
                            ]
                          : [...fallbackTids],
                      uniqueTids: Dynamic = [...new Set(travellerTids)]
                        .map(
                          (tid?: Dynamic): Dynamic =>
                            modelState.model.element(tid),
                        )
                        .filter((tid?: Dynamic): Dynamic => tid != null),
                      movedElements: Dynamic = [];
                    if (travellers.length === 1) {
                      let traveller: Dynamic = travellers[0],
                        matchedMove: Dynamic =
                          traveller.block ??
                          sameParentDropGroup(
                            modelState.model,
                            traveller.tid,
                            traveller.group,
                          ),
                        moveState: Dynamic = {
                          ...traveller,
                          block:
                            matchedMove && matchedMove[0] === traveller.tid
                              ? matchedMove
                              : null,
                        };
                      if (
                        elementMoveRefusal(
                          modelState.model,
                          moveState,
                        ) === "in-place"
                      )
                        moveStatus = "in-place";
                      else {
                        let movedElement: Dynamic = moveModelElement(
                          modelState,
                          moveState,
                        );
                        movedElement
                          ? ((uniqueTids = [
                              movedElement.newTid,
                              ...movedElement.groupTids.filter(
                                (tid?: Dynamic): Dynamic =>
                                  tid !== movedElement.newTid && tid >= 0,
                              ),
                            ]
                              .map(
                                (tid?: Dynamic): Dynamic =>
                                  modelState.model.element(tid),
                              )
                              .filter(
                                (tid?: Dynamic): Dynamic => tid != null,
                              )),
                            (movedElements = movedElement.pins.flatMap(
                              (element?: Dynamic): Dynamic => {
                                let domElement: Dynamic = modelState.model.element(
                                  element.tid,
                                );
                                return domElement
                                  ? [
                                      {
                                        pin: element,
                                        el: domElement,
                                      },
                                    ]
                                  : [];
                              },
                            )),
                            (moveStatus = {
                              newTids: [],
                            }))
                          : ((modelState.model = modelState.model.rebuild(serializedModel)),
                            (moveStatus = "refused"),
                            (uniqueTids = [...new Set(travellerTids)]
                              .map(
                                (tid?: Dynamic): Dynamic =>
                                  modelState.model.element(tid),
                              )
                              .filter(
                                (element?: Dynamic): Dynamic => element != null,
                              )));
                      }
                    } else travellers.length > 1 && (moveStatus = "refused");
                    let moveEntries: Dynamic = new Map(),
                      absoluteParent: Dynamic = null;
                    for (
                      let index: Dynamic = 0;
                      index < landingMembers.length;
                      index++
                    ) {
                      let traveller: Dynamic = landingMembers[index],
                        landing: Dynamic = traveller.landing,
                        landingTarget: Dynamic =
                          modelState.model
                            .topLevelTags(traveller.html)[0]
                            ?.toLowerCase() ?? "",
                        targetTid: Dynamic,
                        position: Dynamic;
                      if (
                        absoluteParent &&
                        !landing.absolute &&
                        (landing.position === "before" ||
                          landing.position === "after")
                      ) {
                        targetTid = resolveElement(absoluteParent);
                        position = "after";
                      } else {
                        let existingElement: Dynamic = travellerElements[index];
                        if (landing.targetTid != null && !existingElement) continue;
                        targetTid = existingElement ? resolveElement(existingElement) : null;
                        position = landing.position;
                      }
                      if (
                        !canDropHtml(
                          modelState.model,
                          {
                            ...landing,
                            targetTid: targetTid,
                            position: position,
                          },
                          landingTarget,
                          traveller.html,
                        )
                      )
                        continue;
                      let insertedTids: Dynamic = modelState.model.insertHtml(
                        traveller.html,
                        targetTid,
                        position,
                      );
                      if (!insertedTids || insertedTids.length === 0) continue;
                      modelState.model.restamp();
                      let insertedElement: Dynamic = insertedTids[0],
                        insertedParent: Dynamic = resolveElement(insertedElement);
                      if (landing.absolute) {
                        modelState.model.setStyleProperty(
                          insertedParent,
                          "position",
                          "absolute",
                        );
                        for (let [attributeName, attributeValue] of Object.entries(
                          landing.absStyles ?? {},
                        ) as Dynamic)
                          modelState.model.setStyleProperty(
                            insertedParent,
                            attributeName,
                            attributeValue,
                          );
                        landing.parentNeedsPositioning === true &&
                          targetTid != null &&
                          !modelState.model.inlineStyleValue(
                            targetTid,
                            "position",
                          ) &&
                          modelState.model.setStyleProperty(
                            targetTid,
                            "position",
                            "relative",
                          );
                      } else
                        for (let styleProperty of [
                          "position",
                          "left",
                          "top",
                          "right",
                          "bottom",
                        ] as Dynamic)
                          modelState.model.inlineStyleValue(insertedParent, styleProperty) &&
                            modelState.model.setStyleProperty(
                              insertedParent,
                              styleProperty,
                              null,
                            );
                      moveEntries.set(traveller.key, [...insertedTids]);
                      absoluteParent = landing.absolute ? absoluteParent : insertedElement;
                    }
                    if (
                      moveEntries.size === 0 &&
                      (moveStatus == null ||
                        moveStatus === "in-place" ||
                        moveStatus === "refused")
                    ) {
                      modelState.model = modelState.model.rebuild(serializedModel);
                      return false;
                    }
                    for (let [groupKey, groupEntries] of moveEntries as Dynamic)
                      landedByTid.set(
                        groupKey,
                        groupEntries
                          .map(resolveElement)
                          .filter((tid?: Dynamic): Dynamic => tid >= 0),
                      );
                    moveStatus && typeof moveStatus == "object"
                      ? (moveStatus.newTids = uniqueTids
                          .map(resolveElement)
                          .filter((tid?: Dynamic): Dynamic => tid >= 0))
                      : (moveStatus === "in-place" ||
                          moveStatus === "refused" ||
                          moveStatus == null) &&
                        (stayersOwn = uniqueTids
                          .map(resolveElement)
                          .filter((tid?: Dynamic): Dynamic => tid >= 0));
                    stayerTids = movedElements.map(
                      ({ pin: pin, el: el }: Dynamic): Dynamic => ({
                        ...pin,
                        tid: resolveElement(el),
                        el: el,
                      }),
                    );
                    return true;
                  } catch {
                    modelState.model = modelState.model.rebuild(serializedModel);
                    return false;
                  }
                },
                {
                  structural: true,
                },
              );
            } catch {
              return "failed";
            }
            if (moveResult !== "applied" && moveResult !== "applied-dirty")
              return "failed";
            for (let stayerTid of stayerTids as Dynamic)
              setTimeout((): Dynamic => {
                applySelectionChanges(stayerTid, false);
              }, 120);
            return {
              landed: landedByTid,
              stayers: moveStatus,
              ...(stayersOwn
                ? {
                    stayersOwn: stayersOwn,
                  }
                : {}),
            };
          },
          [artboardComponentId, previewFile, applySelectionChanges, canDropHtml],
        ),
        removeElements: Dynamic = (0, reactCanvasShape.useCallback)(
          async (elementIds?: Dynamic, selectedElementIds?: Dynamic): Promise<Dynamic> => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            if (!componentState) return "refused";
            let selectedElements: Dynamic = elementIds.map(
              (elementId?: Dynamic): Dynamic => componentState.model.element(elementId),
            );
            if (
              selectedElements.some((elementId?: Dynamic): Dynamic => elementId == null) ||
              elementIds.some(
                (elementId?: Dynamic): Dynamic =>
                  componentState.model.isLoopDriven(elementId) ||
                  componentState.model.isUneditable(elementId),
              )
            )
              return "refused";
            let protectedElements: Dynamic = selectedElementIds
                .map(
                  (elementId?: Dynamic): Dynamic => componentState.model.element(elementId),
                )
                .filter((elementId?: Dynamic): Dynamic => elementId != null),
              removedTemplateIds: Dynamic = [],
              mutationStatus: Dynamic;
            try {
              mutationStatus = await componentSessionRef.current.mutate(
                artboardComponentId,
                (model?: Dynamic, nextState?: Dynamic): Dynamic => {
                  if (nextState.path !== previewFile || nextState !== componentState)
                    return false;
                  for (let index: Dynamic = 0; index < elementIds.length; index++)
                    if (
                      nextState.model.element(elementIds[index]) !== selectedElements[index]
                    )
                      return false;
                  for (let elementId of elementIds as Dynamic)
                    nextState.model.removeElement(elementId);
                  nextState.model.restamp();
                  removedTemplateIds = protectedElements
                    .map(
                      (element?: Dynamic): Dynamic =>
                        parseInt(
                          element.getAttribute("data-dc-tpl") ?? "-1",
                          10,
                        ),
                    )
                    .filter((templateId?: Dynamic): Dynamic => templateId >= 0);
                  nextState.model = nextState.model.rebuild(
                    nextState.model.serialize(),
                  );
                  return true;
                },
                {
                  structural: true,
                },
              );
            } catch {
              return "failed";
            }
            return mutationStatus === "refused" || mutationStatus === false
              ? "refused"
              : mutationStatus !== "applied" && mutationStatus !== "applied-dirty"
                ? "failed"
                : {
                    kept: removedTemplateIds,
                  };
          },
          [resolveComponentState, artboardComponentId, previewFile],
        ),
        getUndoDepth: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let componentState: Dynamic = resolveComponentState(artboardComponentId);
          return componentState ? componentState.undo.length : null;
        }, [resolveComponentState, artboardComponentId]),
        getUndoFloor: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let componentState: Dynamic = resolveComponentState(artboardComponentId);
          return componentState ? (componentState.undoFloor ?? 0) : null;
        }, [resolveComponentState, artboardComponentId]),
        getRedoDepth: Dynamic = (0,
        reactCanvasShape.useCallback)((): Dynamic => {
          let componentState: Dynamic = resolveComponentState(artboardComponentId);
          return componentState ? componentState.redo.length : null;
        }, [resolveComponentState, artboardComponentId]),
        trimUndoHistoryForComponent: Dynamic = (0, reactCanvasShape.useCallback)(
          (keepCount?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            componentState && trimUndoHistory(componentState, keepCount);
          },
          [resolveComponentState, artboardComponentId],
        ),
        dropRedoHistory: Dynamic = (0, reactCanvasShape.useCallback)(
          (historyIndex?: Dynamic): Dynamic => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId),
              redoEntries: Dynamic = componentState?.redo;
            if (!componentState || !redoEntries || redoEntries.length === 0)
              return (): Dynamic => {};
            let dropCount: Dynamic =
              historyIndex === undefined ? 0 : historyIndex - 1 - componentState.undo.length;
            if (dropCount < 0 || dropCount >= redoEntries.length)
              return (): Dynamic => {};
            let remainingRedoEntries: Dynamic = redoEntries.slice(redoEntries.length - dropCount);
            componentState.redo = remainingRedoEntries;
            return (): Dynamic => {
              componentState.redo.length === 0 && (componentState.redo = redoEntries);
            };
          },
          [resolveComponentState, artboardComponentId],
        ),
        flushPendingWrites: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          await componentSessionRef.current.writeNow(artboardComponentId);
        }, [artboardComponentId, previewFile]),
        applyHistoryEntry: Dynamic = (0, reactCanvasShape.useCallback)(
          async (componentName?: Dynamic, historyDirection?: Dynamic): Promise<Dynamic> => {
            let componentState: Dynamic = resolveComponentState(componentName);
            if (!componentState) return false;
            let length: Dynamic = componentState[historyDirection].length,
              redoDepthBeforeApply: Dynamic = componentState.redo.length,
              model: Dynamic = componentState.model,
              appliedEntry: Dynamic = applyElementUndo(
                componentState,
                historyDirection,
                {
                  overrides: tweakPropertiesRef.current.values,
                },
              );
            if (!appliedEntry) {
              if (componentState[historyDirection].length < length) {
                if (historyDirection === "undo")
                  for (
                    let redoDepth: Dynamic = componentState.redo.length;
                    redoDepth < redoDepthBeforeApply;
                    redoDepth++
                  )
                    onHistoryDrop?.(previewFile, "redo");
                onHistoryDrop?.(previewFile, historyDirection);
              }
              return false;
            }
            onHistoryApply?.(previewFile, historyDirection);
            return appliedEntry.kind === "prop" || appliedEntry.kind === "script"
              ? (appliedEntry.kind === "prop"
                  ? tweakPropertiesRef.current.setProp(appliedEntry.prop, appliedEntry.liveValue)
                  : emitEditorEvent("dc-update", {
                      name: componentName,
                      path: componentState.path,
                      kind: "js",
                      content: appliedEntry.js,
                      streaming: false,
                      viewportKey: "dc-model",
                    }),
                (componentState.dirty = true),
                panelMountedRef.current
                  ? true
                  : (await componentSessionRef.current.writeNow(componentName)) !== "failed")
              : ((componentState.dirty = true),
                panelMountedRef.current || componentSessionRef.current.writeNow(componentName),
                (componentState.stampGen = (componentState.stampGen ?? -1) + 1),
                (componentState.liveStampsStale = false),
                componentSessionRef.current.pushLive(componentName),
                frameHoldRef.current.onTemplateRestored?.(componentName, model),
                (await componentSessionRef.current.writeNow(componentName)) !== "failed");
          },
          [],
        ),
        isCanvasReady: Dynamic = (0, reactCanvasShape.useCallback)(
          (): Dynamic =>
            liveRef.current && frameReadyRef.current && iframeRef.current != null,
          [],
        ),
        isCanvasBlocked: Dynamic = (0, reactCanvasShape.useCallback)(
          (): Dynamic => loadErrorRef.current != null || blockedReasonRef.current != null,
          [],
        ),
        readPickerProperties: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            ),
            componentState: Dynamic = resolveComponentState(artboardComponentId);
          if (!previewHandle || !componentState || !isCanvasReady()) return {};
          let pickerProperties: Dynamic = {};
          try {
            let rawPickerProperties: Dynamic = JSON.parse(
              getDcPropsJson(componentState.src) ?? "{}",
            );
            if (
              rawPickerProperties &&
              typeof rawPickerProperties == "object" &&
              !Array.isArray(rawPickerProperties)
            )
              for (let [propertyName, propertyDefinition] of Object.entries(
                rawPickerProperties,
              ) as Dynamic)
                !propertyName.startsWith("$") &&
                  propertyDefinition &&
                  typeof propertyDefinition == "object" &&
                  (pickerProperties[propertyName] = propertyDefinition.default);
          } catch {}
          Object.assign(
            pickerProperties,
            componentState.pendingProps ?? {},
            tweakPropertiesRef.current.values,
          );
          return inspectPickerProps(previewHandle, pickerProperties);
        }, [isCanvasReady, resolveComponentState, artboardComponentId]),
        copyAllEditableElements: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          let componentState: Dynamic =
            (await componentSessionRef.current
              .ensureModel(artboardComponentId)
              .catch((): Dynamic => null)) ?? resolveComponentState(artboardComponentId);
          if (!componentState || componentState.path !== previewFile) return null;
          let editableElementIds: Dynamic = componentState.model
            .childTids(null)
            .filter(
              (elementId?: Dynamic): Dynamic =>
                !SelectionActionsHelmetScHelmetPattern.test(
                  componentState.model.tagName(elementId) ?? "",
                ) &&
                !componentState.model.isUneditable(elementId) &&
                !componentState.model.isLoopDriven(elementId),
            );
          if (editableElementIds.length === 0) return null;
          let copiedHtml: Dynamic = copySelectionHtml(editableElementIds, {
            bakeProps: true,
            vals: await readPickerProperties(),
          });
          return copiedHtml ? unpositionPastedHtml(copiedHtml) : null;
        }, [resolveComponentState, artboardComponentId, copySelectionHtml, readPickerProperties]),
        canCopyElement: Dynamic = (0, reactCanvasShape.useCallback)(
          async (elementId?: Dynamic): Promise<Dynamic> => {
            let componentState: Dynamic = resolveComponentState(artboardComponentId);
            return !componentState ||
              !componentState.model.element(elementId) ||
              componentState.model.isUneditable(elementId) ||
              componentState.model.isLoopDriven(elementId) ||
              promoteSvgShapeToRoot(componentState.model, elementId) !==
                elementId
              ? null
              : copySelectionHtml([elementId], {
                  bakeProps: true,
                  vals: await readPickerProperties(),
                });
          },
          [resolveComponentState, artboardComponentId, copySelectionHtml, readPickerProperties],
        ),
        serializeCurrentModel: Dynamic = (0,
        reactCanvasShape.useCallback)(async (): Promise<Dynamic> => {
          let componentState: Dynamic = await componentSessionRef.current.ensureModel(artboardComponentId);
          return componentState && componentState.path === previewFile
            ? componentState.model.serialize()
            : null;
        }, [artboardComponentId, previewFile]),
        commitModelSerialization: Dynamic = (0, reactCanvasShape.useCallback)(
          async (componentName?: Dynamic, expectedSerialization?: Dynamic): Promise<Dynamic> => {
            let hasSameSerialization: Dynamic = false,
              isStale: Dynamic = false,
              mutationStatus: Dynamic;
            try {
              let hasStructuralDifference: Dynamic = (
                  leftModel?: Dynamic,
                  rightModel?: Dynamic,
                ): Dynamic => {
                  let serializeElementSnapshot: Dynamic = (
                      model?: Dynamic,
                      elementId?: Dynamic,
                    ): Dynamic =>
                      JSON.stringify([
                        model.tagName(elementId),
                        model.attributes(elementId),
                        model.inlineStyleAttr(elementId),
                        Array.from(
                          model.element(elementId)?.childNodes ?? [],
                          (childNode?: Dynamic): Dynamic =>
                            childNode.nodeType === 3 ? childNode.nodeValue : null,
                        ),
                      ]),
                    values: Dynamic = new Set(),
                    rightSnapshots: Dynamic = [];
                  for (
                    let index: Dynamic = 0;
                    index < leftModel.elementCount();
                    index++
                  ) {
                    let leftSnapshot: Dynamic = serializeElementSnapshot(leftModel, index),
                      rightSnapshot: Dynamic = serializeElementSnapshot(rightModel, index);
                    leftSnapshot !== rightSnapshot &&
                      (values.add(leftSnapshot), rightSnapshots.push(rightSnapshot));
                  }
                  return rightSnapshots.some(
                    (snapshot?: Dynamic): Dynamic => values.has(snapshot),
                  );
                },
                componentState: Dynamic =
                  await componentSessionRef.current.ensureModel(artboardComponentId),
                currentSerialization: Dynamic = componentState?.model.serialize(),
                rebuiltModel: Dynamic = componentState?.model.rebuild(componentName),
                hasUnchangedStructure: Dynamic =
                  componentState != null &&
                  rebuiltModel !== undefined &&
                  componentState.model.sameSkeleton(rebuiltModel) &&
                  !hasStructuralDifference(componentState.model, rebuiltModel);
              mutationStatus = await componentSessionRef.current.mutate(
                artboardComponentId,
                (model?: Dynamic, nextState?: Dynamic): Dynamic => {
                  if (nextState.path !== previewFile) return false;
                  let serializedModel: Dynamic = nextState.model.serialize();
                  if (
                    (expectedSerialization !== undefined && serializedModel !== expectedSerialization) ||
                    (hasUnchangedStructure && serializedModel !== currentSerialization)
                  ) {
                    isStale = true;
                    return false;
                  }
                  if (serializedModel === componentName) {
                    hasSameSerialization = true;
                    return false;
                  }
                  let rebuiltDocument: Dynamic =
                    rebuiltModel !== undefined && serializedModel === currentSerialization
                      ? rebuiltModel
                      : nextState.model.rebuild(componentName);
                  return rebuiltDocument.serialize() !== componentName
                    ? false
                    : ((nextState.model = rebuiltDocument), true);
                },
                hasUnchangedStructure
                  ? {
                      structural: false,
                      pushUndo: true,
                    }
                  : {
                      structural: true,
                    },
              );
            } catch {
              return "failed";
            }
            return isStale
              ? "stale"
              : hasSameSerialization
                ? "same"
                : mutationStatus === "applied" || mutationStatus === "applied-dirty"
                  ? "applied"
                  : mutationStatus === "refused" || mutationStatus === false
                    ? "refused"
                    : "failed";
          },
          [artboardComponentId, previewFile],
        );
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (
          onHandle(previewFile, {
            file: previewFile,
            askTemplate: serializeCurrentModel,
            askCommit: commitModelSerialization,
            webviewRef: iframeRef,
            isReady: isCanvasReady,
            isBlocked: isCanvasBlocked,
            rebuild: rebuildPreview,
            readAttrs: readAttributes,
            listKindOf: listKindOf,
            readInlineStyle: readInlineStyle,
            ensureModel: ensureModel,
            ensureOutline: ensureOutline,
            applyHistory: applyHistoryEntry,
            undoDepth: getUndoDepth,
            undoFloor: getUndoFloor,
            redoDepth: getRedoDepth,
            cutUndo: trimUndoHistoryForComponent,
            dropRedo: dropRedoHistory,
            flushPending: flushPendingWrites,
            hasPendingEdits: (): Dynamic =>
              componentSessionRef.current.anyDirty() ||
              componentSessionRef.current.anyWriteInFlight(),
            setTweaks: setTweaks,
            pickAt: pickAt,
            textTids: readTextTids,
            pickIn: pickIn,
            setShownSelection: setShownSelection,
            clearLabelPart: clearLabelPart,
            hostDrag: hostDrag,
            cancelBox: cancelBox,
            armedByClick: armedByClick,
            textPlacing: textPlacing,
            moveStart: moveStart,
            moveMove: moveMove,
            moveEnd: moveEnd,
            moveCancel: moveCancel,
            moveSettle: moveSettle,
            moveElements: moveElements,
            stageIsEmpty: stageIsEmpty,
            isFreeCanvas: isFreeCanvas,
            moveHost: moveHost,
            moveExit: moveExit,
            moveReturn: moveReturn,
            moveTouch: moveTouch,
            dropPlanAt: dropPlanAt,
            dropPlanClear: dropPlanClear,
            landTravellers: landTravellers,
            removeTravelled: removeElements,
            travellerHtml: canCopyElement,
            pieceContent: copyAllEditableElements,
            serializeSelection: copySelectionHtml,
            renderDefaults: readPickerProperties,
            removeSelection: removeSelection,
            duplicateSelection: duplicateSelection,
            walkTids: walkSelectionTids,
            nudgeSelection: nudgeSelection,
            flipRead: flipRead,
            flipSelection: flipSelection,
            insertHtml: insertHtml,
            insertLayerAt: insertLayerAt,
            swapImageAttrs: swapImageAttrs,
            replaceImageFor: replaceImageFor,
            toggleCrop: toggleCrop,
            replaceVideoFor: replaceVideoFor,
            videoKey: videoKey,
            videoEl: videoElement,
            pageFill: pageFill,
            setPageFill: setPageFill,
            setStylePropsPerTid: setStylePropsPerTid,
            beginStyleGesture: beginStyleGesture,
            endStyleGesture: endStyleGesture,
            describeTids: describeTids,
            viewEntries: describeSelectionTids,
            formatCommand: formatCommand,
            startTextEdit: startTextEdit,
            pageFonts: pageFonts,
            holdsDeck: holdsDeck,
            pageCensus: pageCensus,
          }),
          (): Dynamic => onHandle(previewFile, null)
        ),
        [
          previewFile,
          rebuildPreview,
          readAttributes,
          listKindOf,
          readInlineStyle,
          ensureModel,
          ensureOutline,
          applyHistoryEntry,
          getUndoDepth,
          getUndoFloor,
          getRedoDepth,
          trimUndoHistoryForComponent,
          dropRedoHistory,
          setTweaks,
          pickAt,
          readTextTids,
          pickIn,
          setShownSelection,
          clearLabelPart,
          hostDrag,
          cancelBox,
          armedByClick,
          textPlacing,
          moveStart,
          moveMove,
          moveEnd,
          moveCancel,
          moveSettle,
          moveElements,
          stageIsEmpty,
          isFreeCanvas,
          moveHost,
          moveExit,
          moveReturn,
          moveTouch,
          dropPlanAt,
          dropPlanClear,
          landTravellers,
          removeElements,
          canCopyElement,
          copyAllEditableElements,
          copySelectionHtml,
          readPickerProperties,
          removeSelection,
          duplicateSelection,
          walkSelectionTids,
          nudgeSelection,
          flipRead,
          flipSelection,
          insertHtml,
          insertLayerAt,
          swapImageAttrs,
          replaceImageFor,
          toggleCrop,
          replaceVideoFor,
          videoKey,
          videoElement,
          pageFill,
          setPageFill,
          setStylePropsPerTid,
          beginStyleGesture,
          endStyleGesture,
          describeTids,
          describeSelectionTids,
          formatCommand,
          pageFonts,
          holdsDeck,
          pageCensus,
          serializeCurrentModel,
          commitModelSerialization,
        ],
      );
      let onHandleRef: Dynamic = (0, reactCanvasShape.useRef)(onHandle);
      onHandleRef.current = onHandle;
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic => onHandleRef.current(previewFile, null, true),
        [previewFile],
      );
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        readyGeneration > 0 && onReadyGen?.(previewFile, readyGeneration);
      }, [readyGeneration]);
      let [definedVariables, setDefinedVariables]: Dynamic = (0,
      reactCanvasShape.useState)(undefined);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        panelMounted && setSessionEpoch((observedVariables?: Dynamic): Dynamic => observedVariables + 1);
      }, [panelMounted]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (!dsVarNames || dsVarNames.length === 0) {
          setDefinedVariables(undefined);
          return;
        }
        if (readyGeneration === 0) return;
        let previewHandle: Dynamic = createPreviewHandle(
          iframeRef.current,
        );
        if (previewHandle)
          return observePickerCssVariables(
            previewHandle,
            dsVarNames,
            (nextVariables?: Dynamic): Dynamic =>
              setDefinedVariables(
                (previousVariables?: Dynamic): Dynamic =>
                  sameStringSet(previousVariables, nextVariables) ? previousVariables : nextVariables,
              ),
          );
      }, [readyGeneration, dsVarNames, sessionEpochState]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (
          onDefinedVars?.(previewFile, definedVariables),
          (): Dynamic => onDefinedVars?.(previewFile, undefined)
        ),
        [previewFile, definedVariables, onDefinedVars],
      );
      let previewBlocked: Dynamic = previewLoadError != null || previewBlockedReason != null;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        onBlockedChange?.(previewFile, previewBlocked);
      }, [previewBlocked]);
      let problemsChangeRef: Dynamic = (0, reactCanvasShape.useRef)(onProblemsChange);
      problemsChangeRef.current = onProblemsChange;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        problemsChangeRef.current?.(
          previewFile,
          artboardLoadErrorMessages(previewBlockedReason, previewLoadError, artboardErrors),
        );
      }, [previewFile, previewBlockedReason, previewLoadError, artboardErrors]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic =>
          problemsChangeRef.current?.(previewFile, emptyArtboardErrors),
        [previewFile],
      );
      let previewEditEnabled: Dynamic = canEditPreview && !panelMounted && editing,
        interactiveFrame: Dynamic = (panelMounted === true || previewEditEnabled === true) && frameReady;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        mediaSinkRef.current?.(null);
      }, [displayedGeneration]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (!interactiveFrame) return;
        let previewHandle: Dynamic = createPreviewHandle(
          iframeRef.current,
        );
        previewHandle && repostPickerChrome(previewHandle);
      }, [interactiveFrame, gripless]);
      let handleChromeContextMenu: Dynamic = (event?: Dynamic): Dynamic => {
          if (!chromeSlot || !box) return;
          let previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
          if (!previewHandle) return;
          event.preventDefault();
          event.stopPropagation();
          let bounds: Dynamic = chromeSlot.getBoundingClientRect(),
            scale: Dynamic = bounds.width > 0 ? bounds.width / box.w : 1;
          pickerContextMenuAt(
            previewHandle,
            (event.clientX - bounds.left) / scale,
            (event.clientY - bounds.top) / scale,
          );
        },
        cropPointerActiveRef: Dynamic = (0, reactCanvasShape.useRef)(false),
        handleCropPointerDown: Dynamic = (
          directions?: Dynamic,
          cropPointerEvent?: Dynamic,
          cropContext?: Dynamic,
        ): Dynamic => {
          let selectedMedia: Dynamic = selectedMediaRef.current,
            previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            ),
            mediaBounds: Dynamic = activeMediaRef.current;
          if (
            !selectedMedia ||
            !previewHandle ||
            !mediaBounds ||
            !chromeSlot ||
            !box ||
            cropPointerActiveRef.current ||
            !readCropEnabled() ||
            !canStartCanvasDrag(cropPointerEvent)
          )
            return true;
          cropPointerEvent.stopPropagation();
          cropPointerActiveRef.current = true;
          try {
            cropPointerEvent.currentTarget.setPointerCapture(cropPointerEvent.pointerId);
          } catch {}
          onHostGesture?.("element-crop", true);
          let [pointerId, pointerStartX, pointerStartY, chromeElement]: Dynamic = [
              cropPointerEvent.pointerId,
              cropPointerEvent.clientX,
              cropPointerEvent.clientY,
              chromeSlot,
            ],
            getCanvasScale: Dynamic = (): Dynamic => {
              let bounds: Dynamic = chromeElement.getBoundingClientRect();
              return bounds.width > 0 ? bounds.width / box.w : 1;
            },
            toCanvasPoint: Dynamic = (
              clientX?: Dynamic,
              clientY?: Dynamic,
            ): Dynamic => {
              let bounds: Dynamic = chromeElement.getBoundingClientRect();
              return {
                x: (clientX - bounds.left) / getCanvasScale(),
                y: (clientY - bounds.top) / getCanvasScale(),
              };
            },
            pointerStartPoint: Dynamic = toCanvasPoint(pointerStartX, pointerStartY),
            {
              frame: cropFrame,
              natural: naturalImageSize,
              rot: rotation,
            }: Dynamic = cropContext,
            [liveCrop, supportsZoom, cropTid]: Dynamic = [
              selectedMedia.live,
              MediaObjectCropSupports(),
              selectedMedia.tid,
            ],
            isCurrentCrop: Dynamic = (): Dynamic =>
              selectedMediaRef.current === selectedMedia && readCropState() === cropTid,
            [widthDelta, heightDelta]: Dynamic = [
              mediaBounds.w - cropFrame.w,
              mediaBounds.h - cropFrame.h,
            ],
            resizeCropFrame: Dynamic = (
              direction?: Dynamic,
              nextFrame?: Dynamic,
            ): Dynamic => {
              let nextWidth: Dynamic =
                  direction.includes("e") || direction.includes("w")
                    ? Math.max(1, Math.round(nextFrame.w + widthDelta) - widthDelta)
                    : cropFrame.w,
                nextHeight: Dynamic =
                  direction.includes("n") || direction.includes("s")
                    ? Math.max(1, Math.round(nextFrame.h + heightDelta) - heightDelta)
                    : cropFrame.h;
              return {
                x: direction.includes("w") ? cropFrame.w - nextWidth : 0,
                y: direction.includes("n") ? cropFrame.h - nextHeight : 0,
                w: nextWidth,
                h: nextHeight,
              };
            },
            resizeForDirection: Dynamic = (direction?: Dynamic): Dynamic =>
              resizeCropFrame(directions, direction),
            { autoW: autoWidth, autoH: autoHeight }: Dynamic =
              mediaBounds.media ?? {},
            resizeDirection: Dynamic =
              directions.length === 2
                ? directions
                : directions === "e"
                  ? autoHeight
                    ? "se"
                    : "e"
                  : directions === "w"
                    ? autoHeight
                      ? "sw"
                      : "w"
                    : directions === "s"
                      ? autoWidth
                        ? "se"
                        : "s"
                      : autoWidth
                        ? "ne"
                        : "n";
          registerElementSession(artboardComponentId, selectedMedia.el);
          pickerGesturePhase(previewHandle, {
            phase: "start",
            kind: "resize",
            dir: resizeDirection,
            x: pointerStartPoint.x,
            y: pointerStartPoint.y,
          });
          let [hasMoved, zoomWarningShown, didResize]: Dynamic = [false, false, false],
            getCropStyleEdits: Dynamic = (
              liveState?: Dynamic,
              frameState?: Dynamic,
            ): Dynamic =>
              Object.fromEntries(
                imageCropStyleEdits(
                  frameState,
                  naturalImageSize,
                  liveState,
                ).map(
                  ([propertyName, propertyValue]: Dynamic): Dynamic => [
                    propertyName,
                    propertyValue ?? "none",
                  ],
                ),
              ),
            updateCropState: Dynamic = (
              liveState?: Dynamic,
              frameState?: Dynamic,
            ): Dynamic => {
              selectedMedia.live = liveState;
              selectedMedia.at = {
                frame: frameState,
                natural: naturalImageSize,
              };
              setSelectedMedia(
                (selectedMediaState?: Dynamic): Dynamic =>
                  selectedMediaState && {
                    ...selectedMediaState,
                    live: liveState,
                  },
              );
            },
            handleCropPointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
              if (
                moveEvent.pointerId !== pointerId ||
                (!hasMoved &&
                  Math.hypot(moveEvent.clientX - pointerStartX, moveEvent.clientY - pointerStartY) <
                    4)
              )
                return;
              if (!isCurrentCrop()) return finishCropGesture(false);
              hasMoved = true;
              let currentPoint: Dynamic = toCanvasPoint(moveEvent.clientX, moveEvent.clientY),
                [deltaX, deltaY, cosRotation, sinRotation]: Dynamic = [
                  currentPoint.x - pointerStartPoint.x,
                  currentPoint.y - pointerStartPoint.y,
                  Math.cos(rotation),
                  Math.sin(rotation),
                ],
                [rotatedDeltaX, rotatedDeltaY, minimumCropSize]: Dynamic = [
                  deltaX * cosRotation + deltaY * sinRotation,
                  deltaY * cosRotation - deltaX * sinRotation,
                  Math.max(16 / getCanvasScale(), 8),
                ],
                exceedsZoomLimit: Dynamic = (cropResult?: Dynamic): Dynamic =>
                  !supportsZoom && cropResult.zoom > Math.max(1, liveCrop.zoom) + 0.001,
                resizedCrop: Dynamic = resizeImageCropFrame(
                  cropFrame,
                  naturalImageSize,
                  liveCrop,
                  directions,
                  rotatedDeltaX,
                  rotatedDeltaY,
                  minimumCropSize,
                ),
                constrainedFrame: Dynamic = resizeForDirection(resizedCrop.frame),
                nextCrop: Dynamic = cropIntoFrame(
                  cropFrame,
                  naturalImageSize,
                  liveCrop,
                  constrainedFrame,
                );
              for (let alternateDirection of (exceedsZoomLimit(nextCrop) && directions.length === 2
                ? [directions[1], directions[0]]
                : []) as Dynamic) {
                let alternateCrop: Dynamic = resizeImageCropFrame(
                    cropFrame,
                    naturalImageSize,
                    liveCrop,
                    alternateDirection,
                    rotatedDeltaX,
                    rotatedDeltaY,
                    minimumCropSize,
                  ),
                  [alternateFrame, alternateCropResult]: Dynamic = [
                    resizeCropFrame(alternateDirection, alternateCrop.frame),
                    cropIntoFrame(
                      cropFrame,
                      naturalImageSize,
                      liveCrop,
                      resizeCropFrame(alternateDirection, alternateCrop.frame),
                    ),
                  ];
                if (!exceedsZoomLimit(alternateCropResult)) {
                  [resizedCrop, constrainedFrame, nextCrop] = [alternateCrop, alternateFrame, alternateCropResult];
                  break;
                }
              }
              let cropTooSmall: Dynamic =
                (constrainedFrame.w < selectedMedia.at.frame.w ||
                  constrainedFrame.h < selectedMedia.at.frame.h) &&
                MediaObjectCropZoom(
                  {
                    w: constrainedFrame.w,
                    h: constrainedFrame.h,
                  },
                  naturalImageSize,
                  nextCrop,
                );
              if (exceedsZoomLimit(nextCrop) || cropTooSmall) {
                zoomWarningShown ||
                  announce(
                    exceedsZoomLimit(nextCrop)
                      ? ThisBrowserCanTZoomAPictureMessage
                      : YouCanTCropAnyFurtherAtMessage,
                  );
                zoomWarningShown = true;
                return;
              }
              let edgeOffsetX: Dynamic = directions.includes("e")
                  ? resizedCrop.frame.w - cropFrame.w
                  : directions.includes("w")
                    ? resizedCrop.frame.x
                    : 0,
                edgeOffsetY: Dynamic = directions.includes("s")
                  ? resizedCrop.frame.h - cropFrame.h
                  : directions.includes("n")
                    ? resizedCrop.frame.y
                    : 0;
              resizePickerSelection(
                previewHandle,
                getCropStyleEdits(nextCrop, constrainedFrame),
              );
              didResize = true;
              pickerGesturePhase(previewHandle, {
                phase: "move",
                kind: "resize",
                x: pointerStartPoint.x + edgeOffsetX * cosRotation - edgeOffsetY * sinRotation,
                y: pointerStartPoint.y + edgeOffsetX * sinRotation + edgeOffsetY * cosRotation,
                shift: false,
              });
              updateCropState(nextCrop, {
                w: constrainedFrame.w,
                h: constrainedFrame.h,
              });
            },
            finishCropGesture: Dynamic = (shouldCommit?: Dynamic): Dynamic => {
              (window as Dynamic).removeEventListener(
                "pointermove",
                handleCropPointerMove,
              );
              (window as Dynamic).removeEventListener("pointerup", handlePointerUp);
              (window as Dynamic).removeEventListener(
                "pointercancel",
                handlePointerCancel,
              );
              (window as Dynamic).removeEventListener("blur", handleWindowBlur);
              (window as Dynamic).removeEventListener(
                "keydown",
                handleCropKeyDown,
                true,
              );
              cropPointerActiveRef.current = false;
              onHostGesture?.("element-crop", false);
              unregisterElementSession(
                artboardComponentId,
                selectedMedia.el,
                didResize,
              );
              let shouldPersistCrop: Dynamic =
                shouldCommit &&
                hasMoved &&
                isCurrentCrop() &&
                (Math.abs(selectedMedia.at.frame.w - cropFrame.w) >= 0.5 ||
                  Math.abs(selectedMedia.at.frame.h - cropFrame.h) >= 0.5);
              if (shouldPersistCrop) {
                let normalizedEdits: Dynamic = normalizeStyleEdits(
                    imageCropStyleEdits(
                      selectedMedia.at.frame,
                      naturalImageSize,
                      selectedMedia.live,
                    ),
                  ),
                  serializedEdits: Dynamic = JSON.stringify(normalizedEdits),
                  editCount: Dynamic = applyStyleEdit(selectedMedia.el);
                registerLateGesture(artboardComponentId, cropTid, {
                  el: selectedMedia.el,
                  edits: normalizedEdits,
                  lapsed: (status?: Dynamic): Dynamic => {
                    if (status === "stale") return void (selectedMedia.wrote = "");
                    selectedMediaRef.current === selectedMedia
                      ? ((selectedMedia.wrote = ""),
                        isCurrentCrop() &&
                          patchPickerStyle(
                            previewHandle,
                            artboardComponentId,
                            [selectedMedia.tid],
                            getCropStyleEdits(selectedMedia.live, selectedMedia.at.frame),
                            selectedMedia.token,
                          ))
                      : selectedMedia.closed === "held" &&
                        selectedMedia.wrote === serializedEdits &&
                        styleEditCountsRef.current.get(selectedMedia.el) === editCount &&
                        setStylePropertyRef.current(selectedMedia.el, normalizedEdits);
                  },
                });
                selectedMedia.wrote = serializedEdits;
              } else
                hasMoved &&
                  selectedMediaRef.current === selectedMedia &&
                  updateCropState(liveCrop, cropFrame);
              pickerGesturePhase(previewHandle, {
                phase: "end",
                kind: "resize",
                commit: shouldPersistCrop,
              });
              isCurrentCrop() &&
                holdPickerStyle(
                  previewHandle,
                  artboardComponentId,
                  [selectedMedia.tid],
                  getCropStyleEdits(selectedMedia.live, selectedMedia.at.frame),
                  selectedMedia.token,
                );
            },
            handlePointerUp: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
              pointerEvent.pointerId === pointerId && finishCropGesture(true);
            },
            handlePointerCancel: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
              pointerEvent.pointerId === pointerId && finishCropGesture(false);
            },
            handleCropKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
              /^(Shift|Control|Alt|AltGraph|Meta|OS|CapsLock|NumLock)$/.test(
                event.key,
              ) ||
                (event.preventDefault(),
                event.stopImmediatePropagation(),
                event.key === "Escape" && finishCropGesture(false));
            },
            handleWindowBlur: Dynamic = (): Dynamic => finishCropGesture(true);
          (window as Dynamic).addEventListener("pointermove", handleCropPointerMove);
          (window as Dynamic).addEventListener("pointerup", handlePointerUp);
          (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
          (window as Dynamic).addEventListener("blur", handleWindowBlur);
          (window as Dynamic).addEventListener("keydown", handleCropKeyDown, true);
          return true;
        },
        cropGestureRef: Dynamic = (0, reactCanvasShape.useRef)(handleCropPointerDown);
      cropGestureRef.current = handleCropPointerDown;
      let handlePenPreview: Dynamic = (0, reactCanvasShape.useCallback)(
          (point?: Dynamic, penOptions?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              pickerPenPreview(previewHandle, point, penOptions);
          },
          [],
        ),
        handlePenCommit: Dynamic = (0, reactCanvasShape.useCallback)(
          (point?: Dynamic, penOptions?: Dynamic, gestureContext?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle &&
              pickerVectorPreview(
                previewHandle,
                point,
                penOptions,
                gestureContext,
              );
          },
          [],
        ),
        handleGripGesture: Dynamic = (0, reactCanvasShape.useCallback)(
          (gestureEvent?: Dynamic): Dynamic => onHostGesture?.("element-grip", gestureEvent),
          [onHostGesture],
        ),
        handleGripDown: Dynamic = (source?: Dynamic, gripPointerEvent?: Dynamic): Dynamic => {
          if (cropPointerActiveRef.current || !chromeSlot || !box) return;
          let previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
          if (!previewHandle || !canStartCanvasDrag(gripPointerEvent)) return;
          focusCanvasDocument();
          gripPointerEvent.stopPropagation();
          cropPointerActiveRef.current = true;
          let currentTarget: Dynamic = gripPointerEvent.currentTarget;
          try {
            currentTarget.setPointerCapture(gripPointerEvent.pointerId);
          } catch {}
          onHostGesture?.("element-grip", true);
          let pointerId: Dynamic = gripPointerEvent.pointerId,
            clientX: Dynamic = gripPointerEvent.clientX,
            clientY: Dynamic = gripPointerEvent.clientY,
            chromeElement: Dynamic = chromeSlot,
            toChromePoint: Dynamic = (
              pointerClientX?: Dynamic,
              pointerClientY?: Dynamic,
            ): Dynamic => {
              let bounds: Dynamic = chromeElement.getBoundingClientRect(),
                canvasScale: Dynamic =
                  bounds.width > 0 ? bounds.width / box.w : 1;
              return {
                x: (pointerClientX - bounds.left) / canvasScale,
                y: (pointerClientY - bounds.top) / canvasScale,
              };
            },
            startPoint: Dynamic = toChromePoint(clientX, clientY);
          pickerGesturePhase(previewHandle, {
            phase: "start",
            ...source,
            x: startPoint.x,
            y: startPoint.y,
          });
          let hasMoved: Dynamic = false,
            handleGripMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
              if (
                moveEvent.pointerId !== pointerId ||
                (!hasMoved &&
                  Math.hypot(
                    moveEvent.clientX - clientX,
                    moveEvent.clientY - clientY,
                  ) < 4)
              )
                return;
              hasMoved = true;
              let currentPoint: Dynamic = toChromePoint(moveEvent.clientX, moveEvent.clientY);
              pickerGesturePhase(previewHandle, {
                phase: "move",
                kind: source.kind,
                x: currentPoint.x,
                y: currentPoint.y,
                shift: moveEvent.shiftKey,
              });
            },
            handleLostPointerCapture: Dynamic = (captureEvent?: Dynamic): Dynamic => {
              if (!(captureEvent.pointerId !== pointerId || !cropPointerActiveRef.current))
                try {
                  chromeElement.setPointerCapture(pointerId);
                } catch {}
            };
          (document as Dynamic).addEventListener(
            "lostpointercapture",
            handleLostPointerCapture,
            true,
          );
          let finishGripGesture: Dynamic = (shouldCommit?: Dynamic): Dynamic => {
              (window as Dynamic).removeEventListener("pointermove", handleGripMove);
              (window as Dynamic).removeEventListener("pointerup", handleGripPointerUp);
              (window as Dynamic).removeEventListener(
                "pointercancel",
                handleGripPointerCancel,
              );
              (window as Dynamic).removeEventListener(
                "keydown",
                handleGripKeyDown,
                true,
              );
              (document as Dynamic).removeEventListener(
                "lostpointercapture",
                handleLostPointerCapture,
                true,
              );
              cropPointerActiveRef.current = false;
              onHostGesture?.("element-grip", false);
              pickerGesturePhase(previewHandle, {
                phase: "end",
                kind: source.kind,
                commit: shouldCommit,
              });
            },
            handleGripPointerUp: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
              pointerEvent.pointerId === pointerId && finishGripGesture(hasMoved);
            },
            handleGripPointerCancel: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
              pointerEvent.pointerId === pointerId && finishGripGesture(false);
            },
            handleGripKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
              event.key === "Escape" &&
                (event.preventDefault(),
                event.stopImmediatePropagation(),
                finishGripGesture(false));
            };
          (window as Dynamic).addEventListener("pointermove", handleGripMove);
          (window as Dynamic).addEventListener("pointerup", handleGripPointerUp);
          (window as Dynamic).addEventListener("pointercancel", handleGripPointerCancel);
          (window as Dynamic).addEventListener("keydown", handleGripKeyDown, true);
        };
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (installGeneration === 0) return;
        let ringsPreviewHandle: Dynamic = createPreviewHandle(
          iframeRef.current,
        );
        if (ringsPreviewHandle) {
          setPickerRingsOnly(ringsPreviewHandle, previewEditEnabled);
          return (): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && setPickerRingsOnly(previewHandle, false);
          };
        }
      }, [previewEditEnabled, installGeneration, readyGeneration]);
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (): Dynamic =>
          updateDropGhostDemand(previewFile, 0),
        [previewFile],
      );
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (installGeneration === 0 || !canEditPreview) return;
        let refreshHiddenPickerTags: Dynamic = (): Dynamic => {
          let previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
          previewHandle &&
            setPickerHiddenTags(
              previewHandle,
              getHiddenPickerTags(),
            );
        };
        refreshHiddenPickerTags();
        return subscribeHiddenPickerTags(refreshHiddenPickerTags);
      }, [canEditPreview, installGeneration, readyGeneration]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        if (!panelMounted || installGeneration === 0) return;
        let setMeasureMode: Dynamic = (measureEvent?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && setPickerMeasure(previewHandle, measureEvent);
          },
          setDeepSelection: Dynamic = (enabled?: Dynamic): Dynamic => {
            let previewHandle: Dynamic = createPreviewHandle(
              iframeRef.current,
            );
            previewHandle && setPickerDeepSelection(previewHandle, enabled);
          },
          handleModifierKey: Dynamic = (keyboardEvent?: Dynamic): Dynamic => {
            keyboardEvent.key === "Alt" &&
              !keyboardEvent.repeat &&
              setMeasureMode(keyboardEvent.type === "keydown");
          },
          handleWindowBlur: Dynamic = (): Dynamic => {
            (document as Dynamic).hasFocus() || setMeasureMode(false);
          };
        (window as Dynamic).addEventListener("keydown", handleModifierKey, true);
        (window as Dynamic).addEventListener("keyup", handleModifierKey, true);
        (window as Dynamic).addEventListener("blur", handleWindowBlur);
        let unsubscribeModifierHeld: Dynamic = subscribePrimaryModifierHeld(
          setDeepSelection,
        );
        getPrimaryModifierHeld() && setDeepSelection(true);
        return (): Dynamic => {
          (window as Dynamic).removeEventListener("keydown", handleModifierKey, true);
          (window as Dynamic).removeEventListener("keyup", handleModifierKey, true);
          (window as Dynamic).removeEventListener("blur", handleWindowBlur);
          unsubscribeModifierHeld();
          setMeasureMode(false);
          setDeepSelection(false);
        };
      }, [panelMounted, installGeneration, readyGeneration]);
      let editorSessionElement: Dynamic = panelMounted ? (
        <DesignEditorSession
          webviewRef={iframeRef}
          projectPath={"appifact"}
          filePath={previewFile}
          exportTitle={title}
          active={true}
          readOnly={readOnly}
          canvasTools={!showInlineTweakControls}
          installGen={installGeneration}
          iframeDefinedVars={definedVariables}
          modeOverride={"pro"}
          actionsRef={actionsRef}
          dcProps={tweakProperties}
          tweaksProps={tweaksBridge}
          dcModel={modelRuntime}
          dcModelCbRef={frameHoldRef}
          exitGuardRef={exitGuardRef}
          textEditOpenRef={textEditOpenRef}
          onFrameFree={releaseFrame}
          settleSessionRef={settleSessionRef}
          commitOpenTextEditRef={commitOpenTextEditRef}
          onSessionDirtyChange={onSessionDirtyChange}
          onEditInput={onEditInput ? (): Dynamic => onEditInput(previewFile) : undefined}
          onUndoStack={onUndoStack}
          onToolChange={onToolChange}
          toolResetTick={toolResetTick}
          onHistoryPush={onHistoryPush ? (): Dynamic => onHistoryPush(previewFile) : undefined}
          onHistoryApply={
            onHistoryApply
              ? (historyDirection?: Dynamic): Dynamic => onHistoryApply(previewFile, historyDirection)
              : undefined
          }
          onHistoryRevoke={onHistoryRevoke ? (): Dynamic => onHistoryRevoke(previewFile) : undefined}
          onHistoryDrop={handleHistoryDrop}
          onOpenFile={onOpenFile}
          onPasteImages={
            onPasteImages &&
            ((imageItems?: Dynamic, pasteOptions?: Dynamic): Dynamic =>
              onPasteImages(previewFile, imageItems, pasteOptions))
          }
          onDropVideos={
            onDropVideos &&
            ((videoItems?: Dynamic, dropOptions?: Dynamic): Dynamic =>
              onDropVideos(previewFile, videoItems, dropOptions))
          }
          onPointerPresence={
            onPointerPresence && ((pointerEvent?: Dynamic): Dynamic => onPointerPresence(previewFile, pointerEvent))
          }
          onPointerAt={
            onPointerAt && ((point?: Dynamic): Dynamic => onPointerAt(previewFile, point))
          }
          onTextEditEnded={onTextEditEnded && ((): Dynamic => onTextEditEnded(previewFile))}
          routeForwardedKey={routeForwardedKey}
          artboardSettings={artboardSettings}
          canvasObject={canvasObject}
          outlineArtboards={outlineArtboards}
          presentPropsTick={presentPropsTick}
          onPresentPropsHandled={onPresentPropsHandled}
          placeRequest={placeRequest}
          onPlaceHandled={onPlaceHandled}
          insertAtPoint={insertAtPoint}
        />
      ) : null;
      return previewBlockedReason != null || previewLoadError != null ? (
        <div
          className={
            "absolute inset-0 z-[15] flex items-center justify-center bg-danger p-4 text-center text-sm text-danger"
          }
          title={
            artboardLoadErrorMessage(previewBlockedReason, previewLoadError) ?? (undefined)
          }
        >
          {uiMessage("canvas.artboardFrame.anErrorOccurred")}
        </div>
      ) : (
        <jsx_ip.Fragment>
          {box && tweakProperties.hasProps && expanded && showInlineTweakControls && (<ViewportScaleThreshold
              min={selectionChromeMinimumScale}
            >
              {(isInteractive?: Dynamic): Dynamic => (
                <ArtboardTweaksRow
                  file={previewFile}
                  dcProps={tweaksBridge}
                  width={box.w}
                  interactive={isInteractive && live && frameReady}
                  keyboardInert={keyboardInert}
                  readonly={!canEditPreview}
                  onOpenTweaks={onOpenTweaks}
                />
              )}
            </ViewportScaleThreshold>)}
          {false}
          {live && frameArmed && srcdoc != null && scheduledToBoot && (<iframe
              key={displayedGeneration}
              ref={attachIframe}
              title={previewFile}
              aria-label={displayTitle}
              tabIndex={
                (keyboardSkipsContent && !expanded && !playing) || keyboardInert ? -1 : undefined
              }
              inert={inertFrame ? true : undefined}
              sandbox={"allow-scripts allow-same-origin"}
              srcDoc={srcdoc}
              onLoad={(): Dynamic => {
                let bootPayload: Dynamic = previewDocument?.boot;
                if (bootPayload != null && lastRenderedGenerationRef.current !== displayedGeneration) {
                  lastRenderedGenerationRef.current = displayedGeneration;
                  iframeRef.current?.contentWindow?.postMessage(
                    {
                      __dc_doc: 1,
                      doc: bootPayload.doc,
                      parts: bootPayload.parts,
                      urls: bootPayload.urls,
                    },
                    "*",
                  );
                  return;
                }
                setPreviewProjectRoot(
                  iframeRef.current?.contentWindow,
                  previewDocument?.projectRoot === undefined
                    ? undefined
                    : new URL(previewDocument.projectRoot).pathname,
                );
                let frameLoadResult: Dynamic = previewGenerationGate.frameLoaded();
                if (frameLoadResult.kind === "foreign") {
                  isPreviewRetired() ||
                    (setPreviewLoadError(previewGenerationGate.blocked),
                    unblockDesignFramesReady());
                  return;
                }
                (async (): Promise<Dynamic> => {
                  let helloPayload: Dynamic = await previewGenerationGate.waitForHello(),
                    runtimeProbeResult: Dynamic =
                      helloPayload == null
                        ? "dead"
                        : await probePreviewRuntime(helloPayload, {
                            attempts: 3,
                          });
                  if (!(frameLoadResult.gen <= retiredGenerationRef.current)) {
                    previewGenerationGate.verdict(frameLoadResult.gen, runtimeProbeResult);
                    if (previewGenerationGate.blocked != null) {
                      isPreviewRetired() ||
                        (setPreviewLoadError(previewGenerationGate.blocked),
                        unblockDesignFramesReady());
                      return;
                    }
                    pendingGenerationRef.current = frameLoadResult.gen;
                    frameLoadResult.gen === displayedGenerationRef.current &&
                      loadedGenerationRef.current !== frameLoadResult.gen &&
                      setArtboardErrors(emptyArtboardErrors);
                    !(
                      isFrameCaptureDocument() &&
                      !isLoadingArtboard &&
                      (await createPreviewHandle(
                        iframeRef.current,
                      )?.awaitSettled({
                        capMs: 1200,
                        finishAnimations: true,
                      }),
                      frameLoadResult.gen !== previewGenerationGate.mountedGeneration)
                    ) &&
                      (setFrameReady(true),
                      setReadyGeneration((generation?: Dynamic): Dynamic => generation + 1),
                      refreshDesktopRendering(iframeRef.current),
                      isLoadingArtboard || markDesignFramesReady());
                  }
                })();
              }}
              className={"min-h-0 w-full flex-1 border-0"}
              style={{
                display: "block",
                pointerEvents: pointerInert ? "none" : undefined,
              }}
            />)}
          {live && (!frameArmed || srcdoc == null || !frameReady) && (<div
              data-testid={"mega-artboard-loading"}
              className={
                "absolute inset-0 z-10 bg-om-bg-canvas"
              }
            >
              {/* MineDesign：载入中的画板显示为骨块（assets/skeleton/skeleton.css），文字只留给读屏 */}
              <span className={"mdn-skel-bone absolute inset-0"} />
              {!frameless && (<span className={"sr-only"}>
                  {uiMessage("canvas.artboardFrame.loading")}
                </span>)}
            </div>)}
          {editorSessionElement}
          <ArtboardSelectionChrome
            slot={chromeSlot}
            live={interactiveFrame}
            interactive={panelMounted === true && canEditPreview === true}
            onGripDown={handleGripDown}
            onContextMenu={handleChromeContextMenu}
            sinkRef={mediaSinkRef}
            crop={cropModel}
            onPenPreview={handlePenPreview}
            onPenCommit={handlePenCommit}
            onPenGesture={handleGripGesture}
            vectorEdit={vectorEdit}
            board={artboardContentSizeDescriptor(
              box,
              boxRowH,
              component,
            )}
          />
        </jsx_ip.Fragment>
      );
    });
  };
}

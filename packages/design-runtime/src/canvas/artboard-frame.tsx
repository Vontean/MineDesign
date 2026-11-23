import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { artboardLoadErrorMessage, artboardLoadErrorMessages, emptyArtboardErrors } from "./artboard-errors";
import { useArtboardRuntimeInstallation } from "./artboard-focus";
import { ArtboardTweaksRow } from "./artboard-tweaks";
import { jsx_ip } from "./compilation-cache";
import { artboardContentSizeDescriptor, selectionChromeMinimumScale } from "./frame-payloads";
import { useArtboardPointerGestures } from "./artboard-pointer-gestures";
import { useArtboardMediaCommands } from "./artboard-media-commands";
import { useArtboardTweakSession } from "./artboard-tweak-session";
import { useArtboardContentReaders } from "./artboard-content-readers";
import { useArtboardEditSession } from "./artboard-edit-session";
import { useArtboardPreviewLifecycle } from "./artboard-preview-lifecycle";
import { useArtboardInsertion } from "./artboard-insertion";
import { useArtboardSelectionClipboard } from "./artboard-selection-clipboard";
import { useArtboardSelectionCommands } from "./artboard-selection-commands";
import { useArtboardStyleCommands } from "./artboard-style-commands";
import { useArtboardHistory } from "./artboard-history";
import { useArtboardModelSerialization } from "./artboard-model-serialization";
import { useArtboardPickerSelection } from "./artboard-picker-selection";
import { useArtboardPickerMoves } from "./artboard-picker-move";
import { useArtboardElementMoves } from "./artboard-element-moves";
import { useArtboardCrop } from "./artboard-crop";
import { useArtboardFrameMessages } from "./frame-messages";
import { usePreviewHotUpdates } from "./preview-hot-updates";
import { SelectionChromeOverlay } from "./selection-chrome";
import { reactCanvasShape, reactDomCanvasShape } from "./shape";
import { useViewportMinScale, useViewportScale, ViewportScaleThreshold } from "./viewport-store";
import { updateDropGhostDemand } from "./working-state";
import { observePageScrollAndPointer } from "../comments/page-surfaces";
import { useToast } from "../editor/chrome/toast";
import { artboardComponentName } from "../editor/html/dc-document";
import { pickerContextMenuAt, pickerPenPreview, pickerVectorPreview, repostPickerChrome, setPickerDeepSelection, setPickerHiddenTags, setPickerHostScale, setPickerInteractive, setPickerMeasure, setPickerRingsOnly } from "../editor/picker/bridge";
import { getHiddenPickerTags, subscribeHiddenPickerTags } from "../editor/picker/hidden-tags";
import { observePickerCssVariables, sameStringSet } from "../editor/picker/inspection";
import { PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { getPrimaryModifierHeld, subscribePrimaryModifierHeld } from "../editor/primary-modifier";
import { DesignEditorSession } from "../editor/session";
import { getTextListKind } from "../editor/text/list-state";
import { ElementPenEditor } from "../editor/vector/element-pen-editor";
import { createPreviewHandle } from "../preview/evaluation";

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
        showInlineTweakControls: Dynamic = false;
      const mediaSinkRef = (0, reactCanvasShape.useRef)(null);
      const activeMediaRef = (0, reactCanvasShape.useRef)(null);
      const {
        iframeRef, srcdoc, readyGeneration, displayedGeneration, frameReady, scheduledToBoot,
        canEditPreview, previewLoadError, previewBlockedReason, artboardErrors, setArtboardErrors,
        attachIframe, onFrameLoad, rebuildPreview, releaseFrame, previewBoot, handlePreviewFailure,
        isCanvasReady, isCanvasBlocked, hotUpdateState,
      } = useArtboardPreviewLifecycle({
        previewFile, doc, assets, live, editable, frameArmed, frameless, onModelReparsed,
        shouldHoldRebuild: () => frameHoldRef.current.holdFrame?.("rebuild") === true,
        clearPendingAdoptions: () => clearPendingAdoptions(),
        syncBeforeCompile: (file) => componentSessionRef.current.adoptExternal?.(file),
        readEditingSession: () => componentSessionRef.current,
        updateBootProperties: (metadata) => tweakProperties.lifecycleCallbacks.onDcBooted(metadata),
        pushDirtyModel() {
          if (resolveComponentState(artboardComponentId)?.dirty) {
            componentSessionRef.current.pushLive(artboardComponentId);
          }
        },
      });
      const hasLoadState = "loadState" in doc;
      const { tweakProperties, tweakPropertiesRef, tweaksBridge, setTweaks } = useArtboardTweakSession({
        file: previewFile, iframeRef, readyGeneration, canEditPreview, hasLoadState,
        readEditingSession: () => componentSessionRef.current, onRow: onTweaksRow,
        onDirty: onTweaksDirty, onEdit: onTweakEdit,
      });
      let textEditStateCallbackRef: Dynamic = (0, reactCanvasShape.useRef)(onTextEditState);
      textEditStateCallbackRef.current = onTextEditState;
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        panelMounted || textEditStateCallbackRef.current?.(previewFile, null);
      }, [panelMounted, previewFile]);
      (0, reactCanvasShape.useEffect)((): Dynamic => {
        textEditStateCallbackRef.current?.(previewFile, null);
      }, [displayedGeneration, previewFile]);
      useArtboardFrameMessages({
        file: previewFile,
        iframeRef,
        panelMounted,
        readOnly,
        canEditPreview,
        editing,
        frameless,
        box,
        onRecoveryMessage: handlePreviewFailure,
        onBooted: previewBoot.acceptBoot,
        setArtboardErrors,
        onPreviewDropNotice,
        onPreviewClick,
        onModifierKey,
        onBoxEvent,
        onDragEvent,
        onPanZoom,
        onRepeatRefused,
        onTextEditState,
        onLocalEdit,
        onChrome(event, bounds) {
          const chrome = acceptSelectionChrome(event, bounds, griplessRef.current);
          mediaSinkRef.current?.(chrome);
        },
        onCropRequest: (tid) => requestCropFromPreview(tid),
        onContentHull,
        onGestureStream,
        onSelection,
        onSelectionSeq,
      });
      const [sessionEpochState, setSessionEpoch]: Dynamic = (0, reactCanvasShape.useState)(0);
      usePreviewHotUpdates({
        file: previewFile,
        iframe: iframeRef,
        files: () => doc.content().files,
        ...hotUpdateState,
        onStylesheetsSettled: () => setSessionEpoch((count: number) => count + 1),
      });
      const {
        frameHoldRef, frameUpdateCountRef, modelRuntime, componentSessionRef, clearPendingAdoptions,
      } = useArtboardEditSession({
        file: previewFile, hasLoadState, panelMounted, canEditPreview, editing, sessionEpoch,
        onLocalEdit, onHistoryPush, onModelReparsed, showToast,
      });
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
      let historyDropRef: Dynamic = (0, reactCanvasShape.useRef)(onHistoryDrop);
      historyDropRef.current = onHistoryDrop;
      let handleHistoryDrop: Dynamic = (0, reactCanvasShape.useCallback)(
          (historyState?: Dynamic): Dynamic => historyDropRef.current?.(previewFile, historyState),
          [previewFile],
        ),
        panelMountedRef: Dynamic = (0, reactCanvasShape.useRef)(panelMounted),
        griplessRef: Dynamic = (0, reactCanvasShape.useRef)(gripless);
      griplessRef.current = gripless;
      panelMountedRef.current = panelMounted;
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
        );
      const { removeSelection, duplicateSelection, walkSelectionTids, nudgeSelection, flipRead, flipSelection } =
        useArtboardSelectionCommands({ artboardComponentId, previewFile, iframeRef, componentSessionRef });
      const {
        pageFill, setPageFill, setStylePropsPerTid, beginStyleGesture, endStyleGesture,
        applyStyleEdit, setStyleProperty, replayStyleEdit,
      } = useArtboardStyleCommands({
        artboardComponentId, previewFile, componentSessionRef, resolveComponentState,
      });
      const {
        selectedMediaRef,
        setSelectedMedia,
        readCropState,
        finishCropRef,
        toggleCrop,
        readCropEnabled,
        cropModel,
        acceptSelectionChrome,
        requestCropFromPreview,
      } = useArtboardCrop({
        previewFile,
        iframeRef,
        artboardComponentId,
        activeMediaRef,
        resolveComponentState,
        hasObjectViewBox: (tid) => Boolean(componentSessionRef.current
          .state(artboardComponentId)?.model.inlineStyleValue(tid, "object-view-box")),
        applyStyleEdit,
        setStyleProperty,
        showToast,
        canEdit: canEditPreview === true && !readOnly,
        displayedGeneration,
        panelMounted,
        onHostGesture,
        startSideGesture: (direction, event, context) => cropGestureRef.current(direction, event, context),
      });
      const { describeSelectionTids, describeTids, holdsDeck, pageFonts, pageCensus } =
        useArtboardContentReaders({ artboardComponentId, iframeRef, frameUpdateCountRef, resolveComponentState });
      const { insertHtml, insertLayerAt, insertAtPoint } = useArtboardInsertion({
        artboardComponentId, previewFile, componentSessionRef, resolveComponentState, iframeRef,
      });
      const { swapImageAttrs, replaceImageFor, videoElement, videoKey, replaceVideoFor } = useArtboardMediaCommands({
        artboardComponentId, previewFile, componentSessionRef, resolveComponentState, finishCropRef, iframeRef,
      });
      const {
        readTextTids, pickAt, pickIn, setShownSelection, clearLabelPart, hostDrag, cancelBox, armedByClick,
        textPlacing, formatCommand, startTextEdit,
      } = useArtboardPickerSelection({ iframeRef, componentSessionRef, artboardComponentId });
      const {
        moveStart, moveMove, moveCancel, moveSettle, moveEnd, stageIsEmpty,
        isFreeCanvas, moveHost, moveExit, moveReturn, moveTouch, dropPlanAt, dropPlanClear,
      } = useArtboardPickerMoves({ iframeRef, componentSessionRef, artboardComponentId, resolveComponentState });
      const { moveElements, landTravellers, removeElements } = useArtboardElementMoves({
        iframeRef, componentSessionRef, artboardComponentId, previewFile, resolveComponentState,
      });
      const {
        getUndoDepth, getUndoFloor, getRedoDepth, trimUndoHistoryForComponent,
        dropRedoHistory, flushPendingWrites, applyHistoryEntry,
      } = useArtboardHistory({
        artboardComponentId, previewFile, componentSessionRef, resolveComponentState,
        tweakPropertiesRef, panelMountedRef, frameHoldRef, onHistoryApply, onHistoryDrop,
      });
      const { copySelectionHtml, readPickerProperties, copyAllEditableElements, canCopyElement } =
        useArtboardSelectionClipboard({
          artboardComponentId, previewFile, iframeRef, componentSessionRef, resolveComponentState,
          tweakPropertiesRef, isCanvasReady,
        });
      const { serializeCurrentModel, commitModelSerialization } = useArtboardModelSerialization({
        artboardComponentId, previewFile, componentSessionRef,
      });
      (0, reactCanvasShape.useEffect)(
        (): Dynamic => (
          onHandle(previewFile, {
            file: previewFile,
            askTemplate: serializeCurrentModel,
            askCommit: commitModelSerialization,
            previewFrameRef: iframeRef,
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
        };
      const { handleCropPointerDown, handleGripDown } = useArtboardPointerGestures({
        iframeRef,
        chromeSlot,
        box,
        artboardComponentId,
        crop: { activeMediaRef, selectedMediaRef, readCropEnabled, readCropState, setSelectedMedia },
        applyStyleEdit,
        replayStyleEdit,
        onHostGesture,
      });
      const cropGestureRef = (0, reactCanvasShape.useRef)(handleCropPointerDown);
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
        );
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
          previewFrameRef={iframeRef}
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
          modelEventHandlersRef={frameHoldRef}
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
              onLoad={onFrameLoad}
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

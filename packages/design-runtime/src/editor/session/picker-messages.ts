import { uiMessage } from "@minedesign/contracts/ui-messages";
import { focusCanvasDocument } from "../../canvas/focus";
import { createWorkingCommitRecord as createWorkingTextEdit } from "../../canvas/working-state";
import { normalizeComputedStyleCarry, normalizeFrozenLayoutStyle, parsePastedElementKinds, parsePastedElementRects, parseVectorElements } from "../clipboard/layout-snapshots";
import { clipboardContainsFileNames } from "../clipboard/native";
import { afterClipboardSettled, getActiveClipboardSource } from "../clipboard/state";
import { canEditBoundComponentProps, templatePropReferences } from "../components/inferred-metadata";
import { parsePropsMetadata } from "../components/prop-validation";
import { emitEditorEvent } from "../events/runtime";
import { boundedPasteText, foreignArtboardPasteContext, collectEditablePropNames, editorStillLoadingMessage, normalizePasteStamp } from "../inspector/editor";
import { clampPopoverAnchorTop, clampPopoverToCanvas } from "../inspector/popover-position";
import { KeyboardPasteLabel } from "../keyboard/paste";
import { normalizePickerPayload, validateResizeMessage, validateRotateMessage } from "../layout/frozen-style";
import { isEditableComponentName } from "../media/object-crop";
import { isVideoFile } from "../media/video-upload";
import { setPickerTool, startPickerTextEdit, startPickerTextEditAt } from "../picker/bridge";
import { getPickerPropsMetadata } from "../picker/inspection";
import { DcEditorEvtValue, parseDirectiveMap } from "../picker/runtime-script";
import { clientPointToArtboard } from "../selection/tree-navigation";
import { finishDeferredTextInput, resetDeferredTextPointer } from "../text/deferred-input";
import { isSuccessfulTextListEdit, normalizeTextEditListState, sameTextEditListState } from "../text/list-state";
import { hasBlockingEditorOverlay } from "../text/typing-target";
import { passiveEditorEvents, runtimeDesignTool } from "../tools";
import { isPreviewMessage } from "../../platform/file-content";
import { isImageFile } from "../../platform/image-processing";
import { type Dynamic } from "../../runtime-types";

interface PickerMessageDependencies {
  readonly frame: {
    readonly active: Dynamic;
    readonly readOnly: Dynamic;
    readonly previewFrameRef: Dynamic;
    readonly getPreviewFrame: Dynamic;
    readonly sessionAliveRef: Dynamic;
    readonly isEditorActiveRef: Dynamic;
    readonly isEditorMountedRef: Dynamic;
    readonly onEditInput: Dynamic;
    readonly onPointerPresence: Dynamic;
    readonly onPointerAt: Dynamic;
    readonly lastCanvasFocusTimeRef: Dynamic;
    readonly isPickerDraggingRef: Dynamic;
    readonly isPickerBoxSelectingRef: Dynamic;
    readonly toolRef: Dynamic;
    readonly chooseEditorTool: Dynamic;
    readonly setDirectivesByElement: Dynamic;
  };
  readonly textEditing: {
    readonly typingQuietScheduler: Dynamic;
    readonly pendingTextStateRef: Dynamic;
    readonly pendingTextCommitRef: Dynamic;
    readonly pendingTextTargetTidRef: Dynamic;
    readonly commitOpenTextEditRef: Dynamic;
    readonly finishOpenTextEditRef: Dynamic;
    readonly finishOpenTextEdit: Dynamic;
    readonly finishTextEdit: Dynamic;
    readonly setPendingTextState: Dynamic;
    readonly textEditOpenStateRef: Dynamic;
    readonly onTextEditEndedRef: Dynamic;
    readonly setLinkEditor: Dynamic;
    readonly setTextEditTargetTid: Dynamic;
    readonly showInstanceTextHint: Dynamic;
  };
  readonly template: {
    readonly rootName: Dynamic;
    readonly modelRef: Dynamic;
    readonly dcPropsRef: Dynamic;
    readonly ensureModel: Dynamic;
    readonly streamingTemplateNames: Dynamic;
    readonly recoverMissingTemplate: Dynamic;
    readonly pushUndoEdit: Dynamic;
    readonly revokeUndoEdit: Dynamic;
    readonly commitStructuralEdit: Dynamic;
  };
  readonly selection: {
    readonly selectionRef: Dynamic;
    readonly selectionSequenceRef: Dynamic;
    readonly clearedSelectionSequenceRef: Dynamic;
    readonly advanceSelectionSequence: Dynamic;
    readonly clearSelectionRef: Dynamic;
    readonly invalidateSelection: Dynamic;
    readonly markSelectionCleared: Dynamic;
    readonly foreignClipboardExpiryRef: Dynamic;
    readonly setSelection: Dynamic;
    readonly setForeignSelection: Dynamic;
    readonly selectElements: Dynamic;
  };
  readonly gestures: {
    readonly previewLiveStyle: Dynamic;
    readonly cancelStylePreview: Dynamic;
    readonly previewMoveGesture: Dynamic;
    readonly cancelMovePreview: Dynamic;
    readonly commitMoveGesture: Dynamic;
    readonly commitResizeGesture: Dynamic;
    readonly commitElementRotation: Dynamic;
    readonly commitGroupTransform: Dynamic;
    readonly moveStrokeEndpoint: Dynamic;
  };
  readonly insertion: {
    readonly setInsertionMenuPosition: Dynamic;
    readonly lastContextMenuShortcutTimeRef: Dynamic;
    readonly isClipboardFeatureEnabled: Dynamic;
    readonly placeToolElementRef: Dynamic;
    readonly routeMediaDropRef: Dynamic;
    readonly pasteMediaFilesRef: Dynamic;
    readonly pasteClipboardElementsRef: Dynamic;
    readonly routeForwardedKey: Dynamic;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
    readonly showDeduplicatedToast: Dynamic;
  };
}

/** 预览帧发来编辑器事件时运行：校验来源与只读状态，再按事件类型分发到选择、文本编辑、手势、插入和样式预览等动作。 */
export function routePickerMessage(deps: PickerMessageDependencies, previewMessage?: Dynamic): Dynamic {
  const { active, readOnly, previewFrameRef, onEditInput, onPointerPresence, onPointerAt, lastCanvasFocusTimeRef, isPickerDraggingRef, isPickerBoxSelectingRef, setDirectivesByElement } = deps.frame;
  const { typingQuietScheduler, pendingTextStateRef, finishOpenTextEdit, finishTextEdit, onTextEditEndedRef, setLinkEditor } = deps.textEditing;
  const { rootName } = deps.template;
  const { previewLiveStyle, cancelStylePreview, previewMoveGesture, cancelMovePreview, commitMoveGesture, commitResizeGesture, commitElementRotation, commitGroupTransform, moveStrokeEndpoint } = deps.gestures;
  const { placeToolElementRef, routeMediaDropRef } = deps.insertion;
  if (
    !active ||
    !isPreviewMessage(previewMessage, previewFrameRef.current)
  )
    return;
  let pickerEvent: Dynamic = previewMessage.data?.[DcEditorEvtValue];
  if (
    !pickerEvent ||
    (readOnly && !passiveEditorEvents.has(pickerEvent.type))
  )
    return;
  !(
    pickerEvent.type === "select" ||
    pickerEvent.type === "chrome" ||
    pickerEvent.type === "directiveState" ||
    pickerEvent.type === "zoom" ||
    pickerEvent.type === "panZoom" ||
    pickerEvent.type === "panHold" ||
    pickerEvent.type === "pointerPresence" ||
    pickerEvent.type === "pointerAt" ||
    pickerEvent.type === "textEditBlur" ||
    pickerEvent.type === "boxLive" ||
    pickerEvent.type === "boxEnd" ||
    pickerEvent.type === "boxCancel" ||
    pickerEvent.type === "modifierKey"
  ) &&
    !readOnly &&
    onEditInput?.();
  (pickerEvent.type === "textEdit" ||
    pickerEvent.type === "textEditEnd" ||
    pickerEvent.type === "foreignTextEdit") &&
    queueMicrotask(typingQuietScheduler.boxClosed);
  if (pickerEvent.type === "pointerPresence") {
    onPointerPresence?.(pickerEvent.inside === true);
    return;
  }
  if (pickerEvent.type === "pointerAt") {
    if (!onPointerAt) return;
    let previewFrameElement: Dynamic = previewFrameRef.current,
      artboardPointer: Dynamic = previewFrameElement
        ? clientPointToArtboard(
            pickerEvent.x,
            pickerEvent.y,
            previewFrameElement.getBoundingClientRect(),
            previewFrameElement.offsetWidth,
          )
        : null;
    artboardPointer && onPointerAt(artboardPointer);
    return;
  }
  if (pickerEvent.type === "dragState") {
    isPickerDraggingRef.current = pickerEvent.live === true;
    pickerEvent.live === true
      ? typingQuietScheduler.dragLive(true)
      : setTimeout((): Dynamic => typingQuietScheduler.dragLive(false));
    return;
  }
  if (
    pickerEvent.type === "boxLive" ||
    pickerEvent.type === "boxEnd" ||
    pickerEvent.type === "boxCancel"
  ) {
    isPickerBoxSelectingRef.current = pickerEvent.type === "boxLive";
    return;
  }
  if (pickerEvent.type === "textEditState") {
    routeTextEditState(deps, pickerEvent);
    return;
  }
  if (pickerEvent.type === "canvasPointerDown") {
    let hasUserActivation: Dynamic = navigator.userActivation?.isActive === true;
    hasUserActivation && resetDeferredTextPointer();
    let now: Dynamic = Date.now();
    if (!hasUserActivation || now - lastCanvasFocusTimeRef.current < 250) return;
    lastCanvasFocusTimeRef.current = now;
    focusCanvasDocument();
    return;
  }
  if (pickerEvent.type === "stylePreview") {
    previewLiveStyle({
      ...pickerEvent,
      styles: normalizeComputedStyleCarry(pickerEvent.styles),
    });
    return;
  }
  if (pickerEvent.type === "styleRevert") {
    cancelStylePreview(pickerEvent);
    return;
  }
  if (pickerEvent.type === "foreignTextEdit") {
    setLinkEditor(null);
    previewFrameRef.current?.blur();
    (window as Dynamic).focus();
    onTextEditEndedRef.current?.();
    return;
  }
  if (pickerEvent.type === "textEdit") {
    if (
      (pickerEvent.html != null && typeof pickerEvent.html != "string") ||
      (pickerEvent.text != null && typeof pickerEvent.text != "string")
    )
      return;
    setLinkEditor(null);
    finishTextEdit(pickerEvent);
    return;
  }
  if (pickerEvent.type === "textEditEnd") {
    setLinkEditor(null);
    pickerEvent.restarted !== true &&
      (pickerEvent.lost !== true &&
        (previewFrameRef.current?.blur(),
        (document as Dynamic).hasFocus() && (window as Dynamic).focus()),
      onTextEditEndedRef.current?.());
    return;
  }
  if (pickerEvent.type === "textEditBlur") {
    pendingTextStateRef.current !== null &&
      !(document as Dynamic).hasFocus() &&
      finishOpenTextEdit();
    return;
  }
  if (pickerEvent.type === "linkEdit") {
    openLinkEditor(deps, pickerEvent);
    return;
  }
  if (pickerEvent.type === "penDblClick") {
    routePenDoubleClick(deps, pickerEvent);
    return;
  }
  if (pickerEvent.type === "textEditDenied") {
    explainTextEditDenied(deps, pickerEvent);
    return;
  }
  if (pickerEvent.type === "directiveState") {
    if (pickerEvent.name !== rootName) return;
    let directiveMap: Dynamic = parseDirectiveMap(
      pickerEvent.states,
    );
    directiveMap && setDirectivesByElement(directiveMap);
    return;
  }
  if (pickerEvent.type === "movePreview") {
    previewMoveGesture({
      ...pickerEvent,
      absStyles:
        pickerEvent.absStyles != null
          ? normalizeFrozenLayoutStyle(pickerEvent.absStyles)
          : undefined,
      followers: Array.isArray(pickerEvent.followers)
        ? parsePastedElementRects(pickerEvent.followers)
        : undefined,
      markFollowers: Array.isArray(pickerEvent.markFollowers)
        ? pickerEvent.markFollowers
            .filter(
              (followerTid?: Dynamic): Dynamic =>
                Number.isInteger(followerTid) && followerTid >= 0,
            )
            .slice(0, 500)
        : undefined,
      group: Array.isArray(pickerEvent.group)
        ? parsePastedElementKinds(pickerEvent.group)
        : undefined,
    });
    return;
  }
  if (pickerEvent.type === "movePreviewCancel") {
    cancelMovePreview(pickerEvent);
    return;
  }
  if (pickerEvent.type === "move") {
    commitMoveGesture({
      ...pickerEvent,
      fixed: pickerEvent.fixed === true,
      absStyles:
        pickerEvent.absStyles != null
          ? normalizeFrozenLayoutStyle(pickerEvent.absStyles)
          : undefined,
      followers: Array.isArray(pickerEvent.followers)
        ? parsePastedElementRects(pickerEvent.followers)
        : undefined,
      group: Array.isArray(pickerEvent.group)
        ? parsePastedElementKinds(pickerEvent.group)
        : undefined,
    });
    return;
  }
  if (pickerEvent.type === "resize") {
    let resizeEvent: Dynamic = validateResizeMessage(pickerEvent);
    resizeEvent && commitResizeGesture(resizeEvent);
    return;
  }
  if (pickerEvent.type === "rotate") {
    let rotationEvent: Dynamic = validateRotateMessage(pickerEvent);
    rotationEvent && commitElementRotation(rotationEvent);
    return;
  }
  if (pickerEvent.type === "groupTransform") {
    commitGroupTransform(
      pickerEvent.kind === "rotate" ? "rotate" : "resize",
      typeof pickerEvent.gestureKey == "string"
        ? pickerEvent.gestureKey
        : undefined,
      pickerEvent.name,
      parseVectorElements(pickerEvent.members),
    );
    return;
  }
  if (pickerEvent.type === "strokeEndpoint") {
    moveStrokeEndpoint(pickerEvent);
    return;
  }
  if (pickerEvent.type === "zoom") {
    emitEditorEvent("viewer-zoom-delta", {
      deltaY: pickerEvent.deltaY,
    });
    return;
  }
  if (pickerEvent.type === "contextMenu") {
    openInsertionMenu(deps, pickerEvent);
    return;
  }
  if (pickerEvent.type === "insert" || pickerEvent.type === "fileDrop") {
    pickerEvent.type === "insert"
      ? placeToolElementRef.current(normalizePickerPayload(pickerEvent))
      : routeMediaDropRef.current(pickerEvent);
    return;
  }
  if (pickerEvent.type === "filePaste") {
    routeFilePaste(deps, pickerEvent);
    return;
  }
  if (pickerEvent.type === "select") {
    routeSelectionEvent(deps, pickerEvent);
    return;
  }
}

/** 处理预览帧的 textEditState 事件。 */
function routeTextEditState(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { typingQuietScheduler, pendingTextStateRef, pendingTextCommitRef, pendingTextTargetTidRef, commitOpenTextEditRef, finishOpenTextEditRef, setPendingTextState } = deps.textEditing;
  let textEditState: Dynamic = normalizeTextEditListState(
    pickerEvent,
  );
  pendingTextStateRef.current = textEditState;
  textEditState !== null && typingQuietScheduler.boxOpen();
  if (textEditState === null) pendingTextCommitRef.current = null;
  else if (
    pendingTextCommitRef.current === null ||
    pendingTextCommitRef.current.tid !== textEditState.tid
  ) {
    let commitPendingText: Dynamic = async (): Promise<Dynamic> =>
      isSuccessfulTextListEdit(
        (await finishOpenTextEditRef.current(true)) ?? "none",
        pendingTextStateRef.current !== null,
      );
    pendingTextCommitRef.current = {
      tid: textEditState.tid,
      edit: createWorkingTextEdit(
        commitPendingText,
        textEditState.tid !== null,
      ),
    };
  }
  commitOpenTextEditRef &&
    (commitOpenTextEditRef.current = pendingTextCommitRef.current?.edit ?? null);
  setPendingTextState(
    (previousTextEditState?: Dynamic): Dynamic =>
      sameTextEditListState(previousTextEditState, textEditState)
        ? previousTextEditState
        : textEditState,
  );
  textEditState !== null &&
    textEditState.tid === pendingTextTargetTidRef.current &&
    finishDeferredTextInput("opened");
  return;
}

/** 处理预览帧的 linkEdit 事件。 */
function openLinkEditor(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { previewFrameRef } = deps.frame;
  const { typingQuietScheduler, textEditOpenStateRef, setLinkEditor } = deps.textEditing;
  let rect: Dynamic = pickerEvent.rect,
    isValidLinkRect: Dynamic =
      typeof rect == "object" &&
      rect != null &&
      ["x", "y", "w", "h"].every(
        (rectDimension?: Dynamic): Dynamic => Number.isFinite(rect[rectDimension]),
      );
  if (
    typeof pickerEvent.href != "string" ||
    !isValidLinkRect ||
    (pickerEvent.hostTid != null && !Number.isInteger(pickerEvent.hostTid)) ||
    (pickerEvent.hostName != null && typeof pickerEvent.hostName != "string")
  )
    return;
  previewFrameRef.current?.blur();
  (window as Dynamic).focus();
  let previewFrameElement: Dynamic = previewFrameRef.current,
    frameRect: Dynamic = previewFrameElement?.getBoundingClientRect();
  if (!previewFrameElement || !frameRect) return;
  let frameScale: Dynamic = previewFrameElement.offsetWidth
      ? frameRect.width / previewFrameElement.offsetWidth
      : 1,
    canvasBounds: Dynamic = {
      left: frameRect.left,
      top: frameRect.top,
      right: frameRect.right,
      bottom: frameRect.bottom,
    },
    linkPopoverSize: Dynamic = {
      w: 328,
      h: 160,
    },
    linkPopoverPosition: Dynamic = clampPopoverToCanvas(
      {
        x: pickerEvent.rect.x * frameScale + frameRect.left,
        y:
          (pickerEvent.rect.y + pickerEvent.rect.h) * frameScale +
          4 +
          frameRect.top,
      },
      canvasBounds,
      linkPopoverSize,
    );
  textEditOpenStateRef.current = true;
  typingQuietScheduler.beat();
  setLinkEditor({
    href: pickerEvent.href,
    collapsed: !!pickerEvent.collapsed,
    x: linkPopoverPosition.x,
    y: linkPopoverPosition.y,
    anchorTop: clampPopoverAnchorTop(
      pickerEvent.rect.y * frameScale + frameRect.top,
      canvasBounds,
      linkPopoverSize.h,
    ),
    canvasTop: canvasBounds.top,
    hostTid: pickerEvent.hostTid,
    hostName: pickerEvent.hostName,
    isElementLink: !!pickerEvent.isElementLink,
  });
  return;
}

/** 处理预览帧的 penDblClick 事件。 */
function routePenDoubleClick(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { getPreviewFrame, toolRef, chooseEditorTool } = deps.frame;
  let currentRuntimeTool: Dynamic = runtimeDesignTool(
    toolRef.current,
  );
  if (
    navigator.userActivation?.isActive === true &&
    (currentRuntimeTool === "select" || currentRuntimeTool === "vector")
  )
    chooseEditorTool("vector", false);
  else {
    let previewFrame: Dynamic = getPreviewFrame();
    previewFrame && setPickerTool(previewFrame, currentRuntimeTool);
  }
  return;
}

/** 处理预览帧的 textEditDenied 事件。 */
function explainTextEditDenied(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { getPreviewFrame, sessionAliveRef } = deps.frame;
  const { showInstanceTextHint } = deps.textEditing;
  const { rootName, modelRef, dcPropsRef, ensureModel, streamingTemplateNames, recoverMissingTemplate, pushUndoEdit, revokeUndoEdit, commitStructuralEdit } = deps.template;
  const { showToast, showDeduplicatedToast } = deps.feedback;
  if (
    pickerEvent.name != null &&
    !isEditableComponentName(pickerEvent.name)
  )
    return;
  if (pickerEvent.foreign === true) {
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    showDeduplicatedToast(uiMessage("inspector.session.askTheAgentToEdit"));
    return;
  }
  if (pickerEvent.portaled === true) {
    showDeduplicatedToast(
      uiMessage("inspector.session.canTEditPopUp"),
    );
    return;
  }
  let rootTemplateState: Dynamic = modelRef.current.state(rootName),
    deniedTemplateName: Dynamic = pickerEvent.name || rootName;
  if (streamingTemplateNames.has(deniedTemplateName)) {
    showToast(
      uiMessage("inspector.session.thisComponentIsStillStreaming"),
    );
    return;
  }
  if (pickerEvent.imported === true) {
    if (
      deniedTemplateName === rootName &&
      rootTemplateState &&
      rootTemplateState.model.tagName(Number(pickerEvent.tid)) !== "x-import"
    )
      return;
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    showDeduplicatedToast(uiMessage("inspector.session.askTheAgentToEdit2"));
    return;
  }
  if (pickerEvent.rootText) {
    let rootTextPropReferences: Dynamic =
        rootTemplateState && pickerEvent.bound === true
          ? templatePropReferences(
              rootTemplateState.model.rootText(),
            )
          : [],
      editablePropNames: Dynamic = collectEditablePropNames(
        dcPropsRef.current.propsMeta,
        false,
      ),
      isRootTextPropEditable: Dynamic =
        rootTextPropReferences.length > 0 &&
        rootTextPropReferences.every(
          (propName?: Dynamic): Dynamic => editablePropNames.has(propName),
        );
    showDeduplicatedToast(
      isRootTextPropEditable
        ? uiMessage("inspector.session.thisTextSitsDirectlyOn")
        // MineDesign: user-facing copy calls the agent "the agent", not Claude.
        : uiMessage("inspector.session.thisTextSitsDirectlyOn2"),
    );
    return;
  }
  if (deniedTemplateName !== rootName) {
    let instanceTid: Dynamic = Number(pickerEvent.tid);
    (async (): Promise<Dynamic> => {
      let previewFrame: Dynamic = getPreviewFrame(),
        [componentTemplateState, componentPropsMetadata]: Dynamic =
          pickerEvent.bound === true && previewFrame
            ? await Promise.all([
                ensureModel(deniedTemplateName),
                getPickerPropsMetadata(previewFrame, deniedTemplateName),
              ])
            : [];
      if (!sessionAliveRef.current) return;
      let editablePropNames: Dynamic = collectEditablePropNames(
          componentPropsMetadata && parsePropsMetadata(componentPropsMetadata),
        ),
        textPropReferences: Dynamic = componentTemplateState
          ? templatePropReferences(
              componentTemplateState.model.rootText(),
            )
          : pickerEvent.bound === true
            ? [...editablePropNames]
            : [];
      rootTemplateState &&
      canEditBoundComponentProps(
        rootTemplateState.model,
        instanceTid,
        deniedTemplateName,
        textPropReferences,
        editablePropNames,
      )
        ? showInstanceTextHint(instanceTid, deniedTemplateName)
        : showDeduplicatedToast(
            // MineDesign: user-facing copy calls the agent "the agent", not Claude.
            uiMessage("inspector.session.thisTextSitsDirectlyIn", { component: String(deniedTemplateName) }),
          );
    })();
    return;
  }
  let deniedTid: Dynamic = Number(pickerEvent.tid);
  if (!rootTemplateState) return void recoverMissingTemplate();
  if (
    !Number.isInteger(deniedTid) ||
    rootTemplateState.model.isTextEditable(deniedTid)
  ) {
    showToast(editorStillLoadingMessage);
    return;
  }
  let previousRedoEntries: Dynamic = rootTemplateState.redo,
    didPushUndo: Dynamic = pushUndoEdit(
      rootName,
      `textwrap-${Date.now()}`,
      rootTemplateState,
    ),
    wrappedTextRuns: Dynamic = rootTemplateState.model.wrapTextRuns(
      deniedTid,
      !pickerEvent.items,
    );
  if (wrappedTextRuns.length === 0) {
    revokeUndoEdit(rootTemplateState, didPushUndo, previousRedoEntries);
    showToast(
      uiMessage("inspector.session.thisElementMixesTextWith"),
    );
    return;
  }
  commitStructuralEdit(rootTemplateState, wrappedTextRuns);
  let clickX: Dynamic = Number(pickerEvent.x),
    clickY: Dynamic = Number(pickerEvent.y);
  setTimeout((): Dynamic => {
    let previewFrame: Dynamic = getPreviewFrame();
    if (!previewFrame) return;
    let wrappedTextTid: Dynamic =
      wrappedTextRuns.length === 1
        ? parseInt(wrappedTextRuns[0].getAttribute("data-dc-tpl") ?? "-1", 10)
        : -1;
    Number.isFinite(clickX) && Number.isFinite(clickY)
      ? startPickerTextEditAt(
          previewFrame,
          clickX,
          clickY,
          wrappedTextTid >= 0 ? wrappedTextTid : null,
          rootName,
        )
      : wrappedTextTid >= 0 &&
        startPickerTextEdit(previewFrame, wrappedTextTid, rootName);
  }, 350);
  return;
}

/** 处理预览帧的 contextMenu 事件。 */
function openInsertionMenu(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { previewFrameRef, toolRef } = deps.frame;
  const { pendingTextStateRef } = deps.textEditing;
  const { setInsertionMenuPosition, lastContextMenuShortcutTimeRef, isClipboardFeatureEnabled } = deps.insertion;
  let sanitizeCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
      typeof coordinate == "number" &&
      Number.isFinite(coordinate) &&
      Math.abs(coordinate) < 1e6
        ? coordinate
        : 0,
    previewFrameElement: Dynamic = previewFrameRef.current,
    frameRect: Dynamic = previewFrameElement?.getBoundingClientRect();
  if (!previewFrameElement || !frameRect) return;
  let frameScale: Dynamic = previewFrameElement.offsetWidth
      ? frameRect.width / previewFrameElement.offsetWidth
      : 1,
    pointInFrame: Dynamic = {
      x: Math.min(
        Math.max(sanitizeCoordinate(pickerEvent.x), 0),
        previewFrameElement.offsetWidth,
      ),
      y: Math.min(
        Math.max(sanitizeCoordinate(pickerEvent.y), 0),
        previewFrameElement.offsetHeight,
      ),
    };
  setInsertionMenuPosition({
    ...clampPopoverToCanvas(
      {
        x: sanitizeCoordinate(pickerEvent.x) * frameScale + frameRect.left,
        y: sanitizeCoordinate(pickerEvent.y) * frameScale + frameRect.top,
      },
      {
        left: frameRect.left,
        top: frameRect.top,
        right: frameRect.right,
        bottom: frameRect.bottom,
      },
      {
        w: 200,
        h: isClipboardFeatureEnabled ? 460 : 380,
      },
    ),
    ...(pickerEvent.key === true &&
    pendingTextStateRef.current === null &&
    toolRef.current !== "interact" &&
    ((document as Dynamic).activeElement === previewFrameElement ||
      Date.now() - lastContextMenuShortcutTimeRef.current < 1e3)
      ? null
      : {
          at: pointInFrame,
        }),
  });
  return;
}

/** 处理预览帧的 filePaste 事件。 */
function routeFilePaste(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { isEditorActiveRef, isEditorMountedRef } = deps.frame;
  const { pasteMediaFilesRef, pasteClipboardElementsRef, routeForwardedKey } = deps.insertion;
  const { showToast } = deps.feedback;
  if (!Array.isArray(pickerEvent.files)) return;
  if (hasBlockingEditorOverlay())
    return void showToast(KeyboardPasteLabel);
  let clipboardFiles: Dynamic = pickerEvent.files.filter(
      (entry?: Dynamic): Dynamic => entry instanceof File,
    ),
    clipboardMedia: Dynamic = clipboardFiles.filter(
      (file?: Dynamic): Dynamic =>
        isImageFile(file) ||
        isVideoFile(file),
    ),
    clipboardText: Dynamic = boundedPasteText(pickerEvent),
    clipboardStamp: Dynamic = normalizePasteStamp(pickerEvent),
    clipboardSnapshot: Dynamic = {
      text: clipboardText,
      stamp: clipboardStamp,
      hasImage:
        clipboardMedia.length > 0 &&
        clipboardContainsFileNames(clipboardFiles, clipboardText),
      artboards: foreignArtboardPasteContext(pickerEvent),
    };
  afterClipboardSettled((): Dynamic => {
    !isEditorMountedRef.current ||
      !isEditorActiveRef.current ||
      hasBlockingEditorOverlay() ||
      (getActiveClipboardSource(clipboardSnapshot) === "image"
        ? pasteMediaFilesRef.current(clipboardMedia)
        : routeForwardedKey?.("v", {
            stamp: clipboardStamp,
            seen: clipboardSnapshot,
          }) ||
          pasteClipboardElementsRef.current({
            inTabOnly: true,
            seen: clipboardSnapshot,
          }));
  });
  return;
}

/** 处理预览帧的 select 事件。 */
function routeSelectionEvent(deps: PickerMessageDependencies, pickerEvent: Dynamic): Dynamic {
  const { setTextEditTargetTid } = deps.textEditing;
  const { rootName } = deps.template;
  const { selectionRef, selectionSequenceRef, clearedSelectionSequenceRef, advanceSelectionSequence, clearSelectionRef, invalidateSelection, markSelectionCleared, foreignClipboardExpiryRef, setSelection, setForeignSelection, selectElements } = deps.selection;
  (!pickerEvent.tids?.length || pickerEvent.re == null) &&
    (foreignClipboardExpiryRef.current = 0);
  if (
    pickerEvent.foreign &&
    (!pickerEvent.tids || pickerEvent.tids.length === 0)
  ) {
    invalidateSelection();
    setSelection(null);
    setForeignSelection(pickerEvent.foreign);
    return;
  }
  setForeignSelection(null);
  if (pickerEvent.tids == null || pickerEvent.tids.length === 0) {
    let wasSelectionCleared: Dynamic =
      clearedSelectionSequenceRef.current === selectionSequenceRef.current && selectionRef.current == null;
    advanceSelectionSequence();
    wasSelectionCleared && markSelectionCleared();
    clearSelectionRef();
    setSelection(null);
    return;
  }
  setTextEditTargetTid(
    typeof pickerEvent.embed == "number" &&
      Number.isInteger(pickerEvent.embed)
      ? pickerEvent.embed
      : null,
  );
  selectElements(
    pickerEvent.name || rootName,
    pickerEvent.tids,
    pickerEvent.tag,
    pickerEvent.instances,
  );
}

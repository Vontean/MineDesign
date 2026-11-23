import { announce } from "../accessibility/announcer";
import { elementSelectionAnnouncement, selectionActionRefusalAnnouncement } from "../accessibility/announcements";
import { isContextMenuShortcut } from "../keyboard/edit-actions";
import { focusedOutlineRow, isEditingInputTarget, isPropertyEditorTarget } from "../keyboard/find";
import { isCanvasEnterAction, shouldKeepLocalKeyboardEvent } from "../keyboard/paste";
import { isDesktopMac } from "../inspector/color-pick";
import { suppressNativeContextMenu } from "../outline/native-menu";
import { cancelPickerDrag, pickerContextMenuBySelection, pickerDragModifiers, setPickerSelection, startPickerTextEdit } from "../picker/bridge";
import { designToolForShortcut, isHostOnlyDesignTool } from "../tools";
import { blockingOverlaySelectorAlias } from "../text/typing-target";
import { activeCropElement } from "./element-state";
import { CutValue } from "../accessibility/announcements";
import { DcEditorEvtValue } from "../picker/runtime-script";
import { afterClipboardSettled } from "../clipboard/state";
import { boundedPasteText } from "../inspector/editor";
import { claimClipboardMark } from "../clipboard/state";
import { emitEditorEvent } from "../events/runtime";
import { foreignArtboardPasteContext } from "../inspector/editor";
import { hasBlockingEditorOverlay } from "../text/typing-target";
import { isPreviewMessage } from "../../platform/file-content";
import { normalizePasteStamp } from "../inspector/editor";
import { type Dynamic } from "../../runtime-types";
import type { PreviewFrame, Ref, SessionSelection } from "./selection-state";

/** 转发给预览帧的快捷键路由：返回真值表示预览帧已处理。 */
type ForwardedKeyRouter = (
  action: string,
  payload?: { stamp: unknown; seen: unknown },
  didSelectionChange?: boolean,
  nudge?: { dx: number; dy: number; repeat: boolean },
) => unknown;

interface RouteFrameKeyMessageDependencies {
  readonly active: boolean;
  readonly readOnly: boolean;
  readonly routeForwardedKey: ForwardedKeyRouter | undefined;
  readonly deleteSelectionAndAnnounce: (verb: string) => unknown;
  readonly deleteSelection: () => unknown;
  readonly queueSelectionDeletion: () => unknown;
  readonly copySelectionHtml: (options?: { inTabOnly?: boolean }) => unknown;
  readonly pasteClipboardElementsRef: Ref<(options?: { inTabOnly?: boolean; seen?: unknown }) => unknown>;
  readonly duplicateSelection: () => unknown;
  readonly flipSelection: (axis: "horizontal" | "vertical", fromFrame?: boolean) => unknown;
  readonly groupSelection: () => unknown;
  readonly ungroupSelection: () => unknown;
  readonly selectSiblings: () => unknown;
  readonly applyAutoLayoutToSelection: () => unknown;
  readonly isInspectorOpen: boolean;
  readonly setInspectorOpen: (next: boolean | ((wasOpen?: boolean) => boolean)) => void;
  readonly hasInspectorProvider: boolean;
  readonly isEditorActiveRef: Ref<boolean>;
  readonly isEditorMountedRef: Ref<boolean>;
  readonly hasPendingPickerHighlight: () => boolean;
  readonly previewFrameRef: Ref<PreviewFrame | null>;
}

/** 画板预览转发键盘消息时运行：根据消息类型执行删除、撤销重做、面板切换、焦点区域、批注、缩放、参考线、翻转、分组和复制剪切粘贴等快捷操作。 */
export function routeFrameKeyMessage(deps: RouteFrameKeyMessageDependencies, message?: Dynamic): Dynamic {
      if (
        !deps.active ||
        !isPreviewMessage(message, deps.previewFrameRef.current)
      )
        return;
      let keyPayload: Dynamic = message.data?.[DcEditorEvtValue],
        isFrameFocused: Dynamic =
          (document as Dynamic).activeElement === deps.previewFrameRef.current,
        hasUserActivation: Dynamic =
          isFrameFocused && navigator.userActivation?.isActive === true;
      if (keyPayload?.type === "deleteSelection") {
        if (deps.readOnly) return;
        if (deps.hasPendingPickerHighlight()) return void deps.deleteSelection();
        if (deps.routeForwardedKey?.("delete", undefined, true) || deps.queueSelectionDeletion())
          return;
        deps.deleteSelection();
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "z") {
        if (deps.readOnly) return;
        deps.routeForwardedKey?.(keyPayload.shift ? "Z" : "z");
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "\\") {
        if (!isFrameFocused || (deps.hasInspectorProvider && !deps.isInspectorOpen)) return;
        hasUserActivation &&
          keyPayload.typing !== true &&
          emitEditorEvent("panel-toggle-key");
        deps.setInspectorOpen(deps.hasInspectorProvider ? false : (wasOpen?: Dynamic): Dynamic => !wasOpen);
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "F6") {
        if (!hasUserActivation) return;
        emitEditorEvent("focus-region-key", {
          reverse: keyPayload.shift === true,
        });
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "comment") {
        hasUserActivation && emitEditorEvent("canvas-comment-key");
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "a") {
        if (deps.readOnly) return;
        keyPayload.shift ? deps.applyAutoLayoutToSelection() : deps.selectSiblings();
        return;
      }
      if (
        keyPayload?.type === "clipboardKey" &&
        (keyPayload.key === "0" || keyPayload.key === "+" || keyPayload.key === "-")
      ) {
        emitEditorEvent("canvas-zoom-chord", {
          key: keyPayload.key,
        });
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "guides") {
        isFrameFocused && emitEditorEvent("canvas-guides-toggle");
        return;
      }
      if (
        keyPayload?.type === "clipboardKey" &&
        (keyPayload.key === "flip-horizontal" ||
          keyPayload.key === "flip-vertical")
      ) {
        if (deps.readOnly || hasBlockingEditorOverlay()) return;
        deps.flipSelection(
          keyPayload.key === "flip-horizontal" ? "horizontal" : "vertical",
          true,
        );
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "g") {
        if (deps.readOnly) return;
        keyPayload.shift ? deps.ungroupSelection() : deps.groupSelection();
        return;
      }
      if (keyPayload?.type === "clipboardKey") {
        if (
          (keyPayload.key !== "c" &&
            keyPayload.key !== "x" &&
            keyPayload.key !== "v" &&
            keyPayload.key !== "d") ||
          (deps.readOnly && keyPayload.key !== "c")
        )
          return;
        let pasteStamp: Dynamic = normalizePasteStamp(keyPayload),
          pasteText: Dynamic = boundedPasteText(keyPayload),
          isClipboardMark: Dynamic =
            (keyPayload.key === "c" || keyPayload.key === "x") &&
            pasteStamp != null &&
            typeof keyPayload.mark == "boolean";
        if (isClipboardMark && keyPayload.mark === true) {
          claimClipboardMark(pasteStamp, pasteText);
          return;
        }
        let state: Dynamic = {
          text: keyPayload.key === "v" ? pasteText : "",
          stamp: pasteStamp,
          hasImage: false,
          artboards:
            keyPayload.key === "v"
              ? foreignArtboardPasteContext(keyPayload)
              : undefined,
        };
        if (keyPayload.key === "v") {
          afterClipboardSettled((): Dynamic => {
            !deps.isEditorMountedRef.current ||
              !deps.isEditorActiveRef.current ||
              deps.routeForwardedKey?.(
                "v",
                {
                  stamp: pasteStamp,
                  seen: state,
                },
                true,
              ) ||
              deps.pasteClipboardElementsRef.current({
                inTabOnly: true,
                seen: state,
              });
          });
          return;
        }
        (deps.hasPendingPickerHighlight() ||
          !deps.routeForwardedKey?.(
            keyPayload.key,
            {
              stamp: pasteStamp,
              seen: state,
            },
            true,
          )) &&
          (keyPayload.key === "c"
            ? deps.copySelectionHtml({
                inTabOnly: true,
              })
            : keyPayload.key === "x"
              ? deps.copySelectionHtml({
                  inTabOnly: true,
                }) != null && deps.deleteSelectionAndAnnounce(CutValue)
              : keyPayload.key === "d" && deps.duplicateSelection());
        isClipboardMark && claimClipboardMark(pasteStamp, pasteText);
      }
    }

interface EditorKeyboardDependencies {
  readonly active: boolean;
  readonly readOnly: boolean;
  readonly selectionRef: Ref<SessionSelection | null>;
  readonly rootName: string;
  readonly lastContextMenuShortcutTimeRef: Ref<number>;
  readonly getPreviewFrame: () => PreviewFrame | null | undefined;
  readonly canvasTools: boolean;
  readonly chooseEditorTool: (tool: string, shouldToggleTool?: boolean) => void;
  readonly hasPendingPickerHighlight: () => boolean;
  readonly routeForwardedKey: ForwardedKeyRouter | undefined;
  readonly selectParents: () => unknown;
  readonly modelRef: Ref<{
    state(templateName: string): { model: { isTextEditable(tid: number): boolean } } | null | undefined;
  }>;
  readonly selectChildren: () => unknown;
  readonly selectAdjacentSiblings: (direction: "prev" | "next") => unknown;
  readonly applyAutoLayoutToSelection: () => unknown;
  readonly toolRef: Ref<string>;
  readonly flipSelection: (axis: "horizontal" | "vertical", fromFrame?: boolean) => unknown;
  readonly nudgeSelection: (deltaX: number, deltaY: number) => unknown;
  readonly reorderSelection: (step: number, toEnd?: boolean) => unknown;
  readonly isPickerDraggingRef: Ref<boolean>;
  readonly isPickerBoxSelectingRef: Ref<boolean>;
  readonly setTool: (tool: string) => void;
  readonly foreignSelection: { html: string } | null;
  readonly pendingSelectionRef: Ref<{ seq: number } | null>;
  readonly selectionSequenceRef: Ref<number>;
  readonly clearedSelectionSequenceRef: Ref<number>;
  readonly advanceSelectionSequence: () => number;
  readonly clearSelectionRef: () => void;
  readonly foreignClipboardExpiryRef: Ref<number>;
  readonly setSelection: (selection: SessionSelection | null) => void;
  readonly setForeignSelection: (selection: { html: string } | null) => void;
  /** 传给无障碍播报的大纲结构，内部形态由 accessibility/announcements 解释。 */
  readonly rootOutline: Dynamic;
  readonly deleteSelection: () => unknown;
  readonly queuePickerAction: (action: (didSelectionChange?: boolean) => unknown) => unknown;
  readonly queueSelectionDeletion: () => unknown;
  readonly stepUndoRedo: (direction: "undo" | "redo") => unknown;
  readonly copySelectionStyles: () => unknown;
  readonly pasteSelectionStyles: () => unknown;
  readonly pickColorForSelection: (selection: SessionSelection) => unknown;
  readonly copySelectionHtml: (options?: { inTabOnly?: boolean }) => unknown;
  readonly deleteSelectionAndAnnounce: (verb: string) => unknown;
  readonly pendingPasteTimeoutRef: Ref<ReturnType<typeof setTimeout> | undefined>;
  readonly isEditorMountedRef: Ref<boolean>;
  readonly isEditorActiveRef: Ref<boolean>;
  readonly pasteClipboardElementsRef: Ref<(options?: { inTabOnly?: boolean; seen?: unknown }) => unknown>;
  readonly duplicateSelection: () => unknown;
  readonly runAfterSelectionLoaded: (action: () => unknown) => unknown;
  readonly selectSiblings: () => unknown;
  readonly toggleSelectionBold: () => unknown;
  readonly ungroupSelection: () => unknown;
  readonly groupSelection: () => unknown;
}

/** 修饰键变化时同步拖动手势的 Ctrl/Alt 状态；keyup 与 keydown 共用。 */
export function syncPickerModifierKeys(deps: EditorKeyboardDependencies, keyEvent?: Dynamic): Dynamic {
  if (
    !deps.active ||
    keyEvent.repeat ||
    (keyEvent.key !== "Control" && keyEvent.key !== "Alt") ||
    !deps.isPickerDraggingRef.current
  )
    return;
  let previewFrame: Dynamic = deps.getPreviewFrame();
  previewFrame &&
    pickerDragModifiers(
      previewFrame,
      keyEvent.altKey,
      keyEvent.ctrlKey,
      keyEvent.metaKey,
    );
}

/** 编辑器 keydown 的唯一入口：先过滤输入目标与只读态，再依次判定工具快捷键、Enter/Tab、对齐翻转、方向键、Escape 分级、删除与命令组合键，必要时转发给预览帧。 */
export function routeEditorKeyDown(deps: EditorKeyboardDependencies, event?: Dynamic): Dynamic {
  // 依赖在事件发生时才读取，保证声明靠后的函数此时已就绪
  const { active, readOnly, selectionRef, rootName, lastContextMenuShortcutTimeRef, getPreviewFrame, canvasTools, chooseEditorTool, hasPendingPickerHighlight, routeForwardedKey, selectParents, modelRef, selectChildren, selectAdjacentSiblings, applyAutoLayoutToSelection, toolRef, flipSelection, nudgeSelection, reorderSelection, isPickerDraggingRef, isPickerBoxSelectingRef, setTool, foreignSelection, pendingSelectionRef, selectionSequenceRef, clearedSelectionSequenceRef, advanceSelectionSequence, clearSelectionRef, foreignClipboardExpiryRef, setSelection, setForeignSelection, rootOutline, deleteSelection, queuePickerAction, queueSelectionDeletion, stepUndoRedo, copySelectionStyles, pasteSelectionStyles, pickColorForSelection, copySelectionHtml, deleteSelectionAndAnnounce, pendingPasteTimeoutRef, isEditorMountedRef, isEditorActiveRef, pasteClipboardElementsRef, duplicateSelection, runAfterSelectionLoaded, selectSiblings, toggleSelectionBold, ungroupSelection, groupSelection } = deps;
  syncPickerModifierKeys(deps, event);
  if (!active || event.defaultPrevented) return;
  let target: Dynamic = event.target;
  if (
    (target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)) ||
    (event.key !== "Escape" &&
      isPropertyEditorTarget(target)) ||
    (target !== null &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      target.closest("[data-mega-selection-strip]") !== null)
  )
    return;
  let isCanvasEnter: Dynamic = isCanvasEnterAction(event);
  if (
    (!isCanvasEnter &&
      (event.key === "Enter" || event.key === " ") &&
      target instanceof Element &&
      target.closest(
        "button,[role=button],[role^=menuitem],[role=radio],a[href],.tb-root," +
          blockingOverlaySelectorAlias,
      )) ||
    (!isCanvasEnter && shouldKeepLocalKeyboardEvent(event))
  )
    return;
  if (
    isContextMenuShortcut(event) &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey
  ) {
    let previewFrame: Dynamic = getPreviewFrame(),
      selectedElements: Dynamic = selectionRef.current;
    if (
      !previewFrame ||
      !selectedElements ||
      selectedElements.name !== rootName ||
      selectedElements.tids.length === 0 ||
      hasBlockingEditorOverlay() ||
      (target instanceof Element &&
        target.closest(
          "button,[role=button],a[href],.tb-root,[role=treeitem]",
        ) !== null)
    )
      return;
    event.preventDefault();
    suppressNativeContextMenu(false);
    lastContextMenuShortcutTimeRef.current = Date.now();
    event.repeat || pickerContextMenuBySelection(previewFrame);
    return;
  }
  let hasCommandModifier: Dynamic = event.metaKey || event.ctrlKey;
  if (
    readOnly &&
    !(
      event.key === "Escape" ||
      event.key === "Enter" ||
      event.key === "Tab" ||
      (hasCommandModifier &&
        !event.shiftKey &&
        event.key.toLowerCase() === "c" &&
        !(
          isDesktopMac &&
          event.ctrlKey &&
          !event.metaKey
        ))
    )
  )
    return;
  let hasBlockingOverlay: Dynamic = hasBlockingEditorOverlay();
  if (!hasCommandModifier && !event.altKey && !hasBlockingOverlay) {
    let shortcutTool: Dynamic = designToolForShortcut(
      event.key,
      event.shiftKey,
    );
    if (
      shortcutTool !== null &&
      (canvasTools || !isHostOnlyDesignTool(shortcutTool))
    ) {
      event.preventDefault();
      chooseEditorTool(shortcutTool);
      return;
    }
  }
  if (event.key === "Enter" && !hasCommandModifier && !event.altKey) {
    if (hasBlockingOverlay) return;
    if (
      !hasPendingPickerHighlight() &&
      routeForwardedKey?.(event.shiftKey ? "parent" : "enter")
    ) {
      event.preventDefault();
      return;
    }
    let selectedElements: Dynamic = selectionRef.current;
    if (!selectedElements || selectedElements.name !== rootName) return;
    event.preventDefault();
    if (event.shiftKey) {
      selectParents();
      return;
    }
    let rootTemplateState: Dynamic = modelRef.current.state(rootName),
      singleSelectedTid: Dynamic =
        selectedElements.tids.length === 1 ? selectedElements.tids[0] : null;
    if (
      singleSelectedTid != null &&
      !readOnly &&
      rootTemplateState?.model.isTextEditable(singleSelectedTid)
    ) {
      let previewFrame: Dynamic = getPreviewFrame();
      previewFrame &&
        startPickerTextEdit(
          previewFrame,
          singleSelectedTid,
          rootName,
          "end",
        );
    } else selectChildren();
    return;
  }
  if (event.key === "Tab" && !hasCommandModifier && !event.altKey) {
    if (
      hasBlockingOverlay ||
      activeCropElement() !== null ||
      (target != null &&
        target !== (document as Dynamic).body &&
        target !== (document as Dynamic).documentElement)
    )
      return;
    if (
      !hasPendingPickerHighlight() &&
      routeForwardedKey?.(event.shiftKey ? "prev" : "next")
    ) {
      event.preventDefault();
      return;
    }
    let selectedElements: Dynamic = selectionRef.current;
    if (!selectedElements || selectedElements.name !== rootName) return;
    event.preventDefault();
    selectAdjacentSiblings(event.shiftKey ? "prev" : "next");
    return;
  }
  if (
    event.shiftKey &&
    !event.altKey &&
    event.key.toLowerCase() === "a" &&
    selectionRef.current &&
    !hasBlockingOverlay
  ) {
    event.preventDefault();
    applyAutoLayoutToSelection();
    return;
  }
  let flipShortcutKey: Dynamic =
    event.shiftKey && !hasCommandModifier && !event.altKey
      ? event.key.toLowerCase()
      : "";
  if (
    (flipShortcutKey === "h" || flipShortcutKey === "v") &&
    selectionRef.current &&
    !hasBlockingOverlay &&
    toolRef.current !== "vector" &&
    activeCropElement() === null
  ) {
    event.preventDefault();
    event.repeat ||
      flipSelection(flipShortcutKey === "h" ? "horizontal" : "vertical");
    return;
  }
  if (
    !hasCommandModifier &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      event.key,
    )
  ) {
    if (hasBlockingOverlay) return;
    let nudgeStep: Dynamic = event.shiftKey ? 10 : 1,
      deltaX: Dynamic =
        event.key === "ArrowLeft"
          ? -nudgeStep
          : event.key === "ArrowRight"
            ? nudgeStep
            : 0,
      deltaY: Dynamic =
        event.key === "ArrowUp"
          ? -nudgeStep
          : event.key === "ArrowDown"
            ? nudgeStep
            : 0;
    if (
      !hasPendingPickerHighlight() &&
      routeForwardedKey?.("nudge", undefined, false, {
        dx: deltaX,
        dy: deltaY,
        repeat: event.repeat,
      })
    ) {
      event.preventDefault();
      return;
    }
    if (!selectionRef.current) return;
    event.preventDefault();
    nudgeSelection(deltaX, deltaY) ||
      reorderSelection(
        event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1,
      );
    return;
  }
  if (
    !hasCommandModifier &&
    (event.key === "[" || event.key === "]") &&
    selectionRef.current &&
    !hasBlockingOverlay
  ) {
    event.preventDefault();
    reorderSelection(event.key === "[" ? -1 : 1, true);
    return;
  }
  if (event.key === "Escape" && hasCommandModifier && isPickerDraggingRef.current) {
    isPickerDraggingRef.current = false;
    let previewFrame: Dynamic = getPreviewFrame();
    previewFrame && cancelPickerDrag(previewFrame);
    return;
  }
  if (event.key === "Escape" && !hasCommandModifier) {
    let wasDragging: Dynamic = isPickerDraggingRef.current;
    if (wasDragging) {
      isPickerDraggingRef.current = false;
      let previewFrame: Dynamic = getPreviewFrame();
      previewFrame && cancelPickerDrag(previewFrame);
    }
    if (
      isPickerBoxSelectingRef.current &&
      ((isPickerBoxSelectingRef.current = false), routeForwardedKey?.("escape"))
    ) {
      event.preventDefault();
      return;
    }
    if (toolRef.current !== "select") {
      event.preventDefault();
      setTool("select");
      return;
    }
    let hasSelectionToClear: Dynamic =
      selectionRef.current != null ||
      foreignSelection != null ||
      pendingSelectionRef.current?.seq === selectionSequenceRef.current;
    if (!wasDragging && (hasSelectionToClear || clearedSelectionSequenceRef.current === selectionSequenceRef.current)) {
      advanceSelectionSequence();
      if (routeForwardedKey?.("deselect")) {
        event.preventDefault();
        foreignClipboardExpiryRef.current = Date.now() + 2e3;
        clearSelectionRef();
        setSelection(null);
        setForeignSelection(null);
      } else if (hasSelectionToClear) {
        event.preventDefault();
        clearSelectionRef();
        setSelection(null);
        setForeignSelection(null);
        let previewFrame: Dynamic = getPreviewFrame();
        previewFrame && setPickerSelection(previewFrame, null, null);
      }
    }
    return;
  }
  let describeCurrentSelection: Dynamic = (): Dynamic =>
    elementSelectionAnnouncement(
      rootOutline,
      selectionRef.current?.name === rootName ? selectionRef.current.tids : [],
    );
  if (
    (event.key === "Delete" || event.key === "Backspace") &&
    !hasCommandModifier
  ) {
    if (hasBlockingEditorOverlay()) return;
    let outlineRow: Dynamic = focusedOutlineRow(target);
    if (outlineRow != null) {
      event.preventDefault();
      announce(
        selectionActionRefusalAnnouncement(
          outlineRow.name,
          "deleted",
          outlineRow.onRow,
          describeCurrentSelection(),
        ),
      );
      return;
    }
    if (hasPendingPickerHighlight()) {
      event.preventDefault();
      deleteSelection();
      return;
    }
    event.preventDefault();
    queuePickerAction((didSelectionChange?: Dynamic): Dynamic => {
      if (
        hasBlockingEditorOverlay() ||
        Date.now() < foreignClipboardExpiryRef.current
      )
        return;
      if (hasPendingPickerHighlight()) return deleteSelection();
      let pickerDeleteAction: Dynamic =
        selectionRef.current != null ||
        pendingSelectionRef.current?.seq === selectionSequenceRef.current
          ? "delete"
          : clearedSelectionSequenceRef.current === selectionSequenceRef.current
            ? "delete-while-writing"
            : null;
      (pickerDeleteAction != null &&
        routeForwardedKey?.(pickerDeleteAction, undefined, didSelectionChange)) ||
        queueSelectionDeletion() ||
        (selectionRef.current && deleteSelection());
    });
    return;
  }
  if (!hasCommandModifier) return;
  let shortcutKey: Dynamic = event.key.toLowerCase(),
    isCopyShortcut: Dynamic =
      shortcutKey === "c" &&
      !event.shiftKey &&
      !(
        isDesktopMac &&
        event.ctrlKey &&
        !event.metaKey
      );
  if (!(hasBlockingOverlay && !isCopyShortcut)) {
    if (shortcutKey === "z") {
      event.preventDefault();
      stepUndoRedo(event.shiftKey ? "redo" : "undo");
      return;
    }
    if (shortcutKey === "c" && event.shiftKey) {
      copySelectionStyles() && event.preventDefault();
      return;
    }
    if (shortcutKey === "v" && event.shiftKey) {
      if (hasBlockingEditorOverlay()) return;
      event.preventDefault();
      pasteSelectionStyles();
      return;
    }
    if (
      shortcutKey === "c" &&
      !event.shiftKey &&
      isDesktopMac &&
      event.ctrlKey &&
      !event.metaKey
    ) {
      let selectedElements: Dynamic = selectionRef.current;
      if (selectedElements && selectedElements.name === rootName) {
        event.preventDefault();
        pickColorForSelection(selectedElements);
        return;
      }
    }
    if (shortcutKey === "c" && !event.shiftKey) {
      copySelectionHtml() != null
        ? event.preventDefault()
        : foreignSelection &&
          (navigator.clipboard
            ?.writeText(foreignSelection.html)
            .catch((): Dynamic => {}),
          event.preventDefault());
      return;
    }
    if (shortcutKey === "x" && !event.shiftKey) {
      if (hasBlockingEditorOverlay()) return;
      let outlineRow: Dynamic = focusedOutlineRow(target);
      if (outlineRow != null) {
        event.preventDefault();
        announce(
          selectionActionRefusalAnnouncement(
            outlineRow.name,
            "cut",
            outlineRow.onRow,
            describeCurrentSelection(),
          ),
        );
        return;
      }
      if (Date.now() < foreignClipboardExpiryRef.current)
        return void event.preventDefault();
      copySelectionHtml() != null &&
        (event.preventDefault(), deleteSelectionAndAnnounce(CutValue));
      return;
    }
    if (shortcutKey === "v" && !event.shiftKey) {
      if (
        hasBlockingEditorOverlay() ||
        isEditingInputTarget(target)
      )
        return;
      clearTimeout(pendingPasteTimeoutRef.current);
      pendingPasteTimeoutRef.current = setTimeout(
        (): Dynamic =>
          afterClipboardSettled((): Dynamic => {
            isEditorMountedRef.current && isEditorActiveRef.current && pasteClipboardElementsRef.current();
          }),
        100,
      );
      return;
    }
    if (shortcutKey === "d" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      let hasRootSelection: Dynamic = (): Dynamic => {
          let selectedElements: Dynamic = selectionRef.current;
          return (
            selectedElements != null &&
            selectedElements.name === rootName &&
            selectedElements.tids.length > 0
          );
        },
        duplicateOrForward: Dynamic = (didSelectionChange?: Dynamic): Dynamic => {
          hasRootSelection() &&
            !routeForwardedKey?.("d", undefined, didSelectionChange) &&
            duplicateSelection();
        };
      hasPendingPickerHighlight()
        ? hasRootSelection() && duplicateSelection()
        : queuePickerAction((didSelectionChange?: Dynamic): Dynamic => {
            if (
              !(
                hasBlockingEditorOverlay() ||
                Date.now() < foreignClipboardExpiryRef.current
              )
            ) {
              if (hasPendingPickerHighlight()) return void (hasRootSelection() && duplicateSelection());
              runAfterSelectionLoaded((): Dynamic => duplicateOrForward(didSelectionChange)) ||
                duplicateOrForward(didSelectionChange);
            }
          });
      return;
    }
    if (shortcutKey === "a" && !event.shiftKey) {
      event.preventDefault();
      if (!hasPendingPickerHighlight() && routeForwardedKey?.("a")) return;
      selectSiblings();
      return;
    }
    if (shortcutKey === "b" && !event.shiftKey) {
      selectionRef.current &&
        !hasBlockingOverlay &&
        (event.preventDefault(), toggleSelectionBold());
      return;
    }
    if (shortcutKey === "g") {
      if (!selectionRef.current || (event.preventDefault(), event.repeat))
        return;
      event.shiftKey ? ungroupSelection() : groupSelection();
      return;
    }
    if (event.key === "Backspace") {
      if (!selectionRef.current || (event.preventDefault(), event.repeat))
        return;
      ungroupSelection();
      return;
    }
  }
}

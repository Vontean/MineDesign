import { consumeKey, handlePickerHostShortcut } from "./keyboard-shortcuts";
import { handleTextEditKey } from "./text-edit-keys";
import type { Dynamic } from "../../runtime-types";

interface KeyGestureState {
  dragging: boolean;
  marquee: boolean;
  marqueePending: boolean;
  drawing: boolean;
  transforming: boolean;
  movingStrokeEndpoint: boolean;
  drawingPen: boolean;
  penOverlay: boolean;
}

interface KeyboardState extends KeyGestureState {
  readOnly: boolean;
  interacting: boolean;
  waitingAfterTextDetach: boolean;
  textEdit: Dynamic;
  textPartSelected: boolean;
  selectionCount: number;
  penPathPreview: boolean;
}

interface PickerKeyboardOptions {
  isMacPlatform: boolean;
  commentsEnabled: boolean;
  isEnabled(): boolean;
  readState(): KeyboardState;
  readTextEdit(): Dynamic;
  setMeasurementEnabled(enabled: boolean): void;
  setDeepPickingEnabled(enabled: boolean): void;
  updateDragModifiers(alt: boolean, control: boolean, meta: boolean): void;
  finishDetachedTextEdit(session: Dynamic): void;
  finishDetachedSvgEdit(): boolean;
  finishTextEdit(): void;
  clearTextDetachWait(): void;
  suppressClick(): void;
  cancelDrag(): void;
  cancelMarquee(): void;
  cancelDrawingAndTransforms(): void;
  cancelPenOverlay(): void;
  clearTextPartSelection(): void;
  hasRenderedSelection(): boolean;
  openSelectionMenu(): void;
  prepareCopyOrCut(): void;
  schedulePasteFallback(): void;
  emit(message: Dynamic): void;
}

export function createPickerKeyboard(options: PickerKeyboardOptions) {
  const deepKey = options.isMacPlatform ? "Meta" : "Control";

  function onKeyUp(event: KeyboardEvent) {
    if (event.key === "Alt") options.setMeasurementEnabled(false);
    if (event.key === deepKey) {
      options.setDeepPickingEnabled(false);
      if (options.isEnabled()) options.emit({ type: "modifierKey", key: "deep", on: false });
    }
    if (event.key === "Control" || event.key === "Alt") {
      options.updateDragModifiers(event.altKey, event.ctrlKey, event.metaKey);
    }
  }

  function cancelWithEscape(event: KeyboardEvent, state: KeyboardState) {
    if (event.key !== "Escape") return false;
    if (state.dragging) {
      consumeKey(event);
      options.suppressClick();
      options.cancelDrag();
    } else if (state.marquee) {
      consumeKey(event);
      options.suppressClick();
      options.cancelMarquee();
    } else if (state.drawing || state.transforming || state.movingStrokeEndpoint || state.drawingPen) {
      consumeKey(event);
      options.cancelDrawingAndTransforms();
    } else if (state.penOverlay) {
      consumeKey(event);
      options.cancelPenOverlay();
    } else if (state.textPartSelected && !state.textEdit && state.selectionCount === 1) {
      consumeKey(event);
      options.clearTextPartSelection();
    } else {
      return false;
    }
    return true;
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!options.isEnabled()) return;

    const { key, repeat, altKey, ctrlKey, metaKey, shiftKey } = event;
    if (key === "Alt") options.setMeasurementEnabled(true);
    if (key === deepKey) {
      options.setDeepPickingEnabled(true);
      if (!repeat) options.emit({ type: "modifierKey", key: "deep", on: true });
    }
    if ((key === "Control" || key === "Alt") && !repeat) {
      options.updateDragModifiers(altKey, ctrlKey, metaKey);
    }

    const activeText = options.readTextEdit();
    if (activeText?.importTarget && !activeText.el.isConnected) {
      options.finishDetachedTextEdit(activeText);
    }
    const state = options.readState();
    if (state.waitingAfterTextDetach) {
      consumeKey(event);
      if (key === "Escape" || key === "Enter") options.clearTextDetachWait();
      return;
    }
    if (state.interacting) return;

    const duplicate = (key === "d" || key === "D") && !shiftKey && !altKey &&
      (options.isMacPlatform ? metaKey && !ctrlKey : ctrlKey);
    if (!state.readOnly && duplicate) event.preventDefault();
    if (cancelWithEscape(event, state)) return;

    const gestureInProgress = state.dragging || state.marquee || state.marqueePending ||
      state.drawing || state.transforming || state.movingStrokeEndpoint || state.drawingPen;
    if (handlePickerHostShortcut(event, {
      editingText: !!state.textEdit,
      gestureInProgress,
      penOverlayOpen: state.penOverlay,
      penPathPreview: state.penPathPreview,
      readOnly: state.readOnly,
      commentsEnabled: options.commentsEnabled,
      hasSelection: state.selectionCount > 0,
      hasRenderedSelection: options.hasRenderedSelection,
      openSelectionMenu: options.openSelectionMenu,
      prepareCopyOrCut: options.prepareCopyOrCut,
      schedulePasteFallback: options.schedulePasteFallback,
      emit: options.emit,
    })) return;

    if (state.textEdit && !options.finishDetachedSvgEdit()) {
      handleTextEditKey(event, state.textEdit, options.finishTextEdit);
    }
  }

  return { onKeyDown, onKeyUp };
}

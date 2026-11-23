import { uiMessage } from "@minedesign/contracts/ui-messages";
import type { Dynamic } from "../runtime-types";
import { artboardComponentName } from "../editor/html/dc-document";
import { adoptModelAndRelocateSelection } from "../editor/model/adoption";
import { resetModelBaselines } from "../editor/model/model-state";
import { useDcModel } from "../editor/model/use-dc-model";
import { fileCapFailureMessage } from "../platform/file-content";
import { reactCanvasShape } from "./shape";
import { CanvasWorkingStateContext } from "./working-state";

interface ArtboardEditSessionOptions {
  file: string;
  hasLoadState: boolean;
  panelMounted: boolean;
  canEditPreview: boolean;
  editing: boolean;
  sessionEpoch?: number;
  onLocalEdit?(file: string): void;
  onHistoryPush?(file: string): void;
  onModelReparsed?(file: string, relocate: Dynamic, arm: Dynamic): void;
  showToast(message: string, type: "error"): void;
}

interface PendingAdoption {
  notify(stillValid: () => boolean): void;
  stillValid(model: Dynamic): boolean;
}

/** Keep the preview and editor session aligned when a model changes or is written. */
export function useArtboardEditSession({
  file, hasLoadState, panelMounted, canEditPreview, editing, sessionEpoch,
  onLocalEdit, onHistoryPush, onModelReparsed, showToast,
}: ArtboardEditSessionOptions) {
  const frameHoldRef = (0, reactCanvasShape.useRef)({});
  const frameUpdateCountRef: { current: number } = (0, reactCanvasShape.useRef)(0);
  const pendingAdoptions: { current: Map<string, PendingAdoption> } = (0, reactCanvasShape.useRef)(new Map());
  const historyKeeper = (0, reactCanvasShape.useContext)(CanvasWorkingStateContext);
  const modelEpoch = (0, reactCanvasShape.useRef)(historyKeeper?.peekEpoch(file));

  function adopt(name: string, previousModel: Dynamic, install: () => void) {
    adoptModelAndRelocateSelection({
      adopt: install,
      own() {
        const state = componentSessionRef.current.state(name);
        return name === artboardComponentName(file) && state?.path === file ? state.model : undefined;
      },
      prev: previousModel,
      heldElsewhere() {
        const held = frameHoldRef.current.heldComponent?.();
        return held != null && held !== name;
      },
      pending: {
        drop() {
          pendingAdoptions.current.delete(name);
        },
        arm(notify: PendingAdoption["notify"], stillValid: PendingAdoption["stillValid"]) {
          pendingAdoptions.current.set(name, { notify, stillValid });
        },
      },
      tellHost: (relocate: Dynamic, arm: Dynamic) => onModelReparsed?.(file, relocate, arm),
      log: (message: string, details: unknown) =>
        console.error("[artboard] adopting an outside edit: " + message + ":", details),
    });
  }

  const modelRuntime = useDcModel("appifact", file, {
    enabled: true,
    historyKeeper: historyKeeper ?? undefined,
    get historyEpoch() {
      return modelEpoch.current;
    },
    sessionHeld: panelMounted,
    get liveStore() {
      return hasLoadState || false;
    },
    onAdopted() {},
    onLocalEdit() {
      frameUpdateCountRef.current++;
      onLocalEdit?.(file);
    },
    holdPush: (name: string) => name === artboardComponentName(file) && frameHoldRef.current.holdFrame?.("push") === true,
    onPushLive(name: string) {
      frameUpdateCountRef.current++;
      frameHoldRef.current.onPushLive?.(name);
      const pending = pendingAdoptions.current.get(name);
      pendingAdoptions.current.delete(name);
      pending?.notify(() => pending.stillValid(componentSessionRef.current.state(name)?.model));
    },
    onBeforeMutate(name: string, options: Dynamic, context: Dynamic, held: string | undefined) {
      onHistoryPush?.(file);
      if (held) pendingAdoptions.current.delete(name);
      frameHoldRef.current.onBeforeMutate?.(name, options, context, held);
    },
    onExternalReparse(name: string, previous: Dynamic) {
      frameUpdateCountRef.current++;
      adopt(name, previous, () => frameHoldRef.current.onExternalReparse?.(name, previous));
    },
    onPendingPropsDropped: (name: string, props: Dynamic) => frameHoldRef.current.onPendingPropsDropped?.(name, props),
    onPendingPropsSettled: (name: string, props: Dynamic) => frameHoldRef.current.onPendingPropsSettled?.(name, props),
    writes: {
      onSavedAdopted(name: string, options: Dynamic) {
        frameUpdateCountRef.current++;
        adopt(name, componentSessionRef.current.state(name)?.model ?? null, () =>
          frameHoldRef.current.onSavedAdopted?.(name, options),
        );
      },
      onWriteError(error: unknown) {
        const hold = frameHoldRef.current;
        if (hold.onWriteError) {
          hold.onWriteError(error);
        } else {
          showToast(fileCapFailureMessage(error) ??
            uiMessage("canvas.artboardFrame.couldnTSaveEditsIn") + file + " — focus that artboard to retry.", "error");
        }
      },
      onWriteConflict() {
        showToast(uiMessage("canvas.artboardFrame.saveConflictedWithAnotherChange"), "error");
      },
      onWriteReverted(_error: unknown, details: unknown) {
        showToast(fileCapFailureMessage(details) ?? uiMessage("canvas.artboardFrame.couldnTSaveThatChange"), "error");
      },
      awaitWriteClearance: async () => {},
    },
  });
  const componentSessionRef = (0, reactCanvasShape.useRef)(modelRuntime);
  componentSessionRef.current = modelRuntime;

  (0, reactCanvasShape.useEffect)(() => {
    if (
      (panelMounted || (canEditPreview && editing)) &&
      sessionEpoch !== undefined &&
      modelEpoch.current !== sessionEpoch
    ) {
      modelEpoch.current = sessionEpoch;
      resetModelBaselines(componentSessionRef.current);
    }
  }, [panelMounted, canEditPreview, editing, sessionEpoch]);

  return {
    frameHoldRef, frameUpdateCountRef, modelRuntime, componentSessionRef,
    clearPendingAdoptions: () => pendingAdoptions.current.clear(),
  };
}

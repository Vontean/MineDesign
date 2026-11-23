import { sameTidList } from "../inspector/editor";
import { applyElementUndo } from "../undo/elements";
import { emitEditorEvent } from "../events/runtime";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";

interface StepSessionUndoRedoDependencies {
  readonly dcPropsRef: Dynamic;
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly onHistoryApply: Dynamic;
  readonly onHistoryDrop: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly readOnlyRef: Dynamic;
  readonly rootName: Dynamic;
  readonly pendingPropSnapshotsRef: Dynamic;
  readonly selectElements: Dynamic;
  readonly setSelection: Dynamic;
  readonly selectionRef: Dynamic;
  readonly advanceSelectionSequence: Dynamic;
  readonly undoEditGroupRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
}

/** 在编辑会话中按撤销或重做时运行：回放元素模型的一步历史，同步组件属性值或脚本的暂存内容，推送实时模型、标脏并恢复该步对应的选中。 */
export function stepSessionUndoRedo(deps: StepSessionUndoRedoDependencies, direction?: Dynamic): Dynamic {
        if (deps.readOnlyRef.current) return;
        let artboardName: Dynamic =
            deps.lastEditedTemplateRef.current ?? deps.selectionRef.current?.name ?? deps.rootName,
          modelState: Dynamic = deps.modelRef.current.state(artboardName);
        if (!modelState) return;
        let model: Dynamic = modelState.model,
          stackLengthBefore: Dynamic = modelState[direction].length,
          redoLengthBefore: Dynamic = modelState.redo.length,
          undoResult: Dynamic = applyElementUndo(modelState, direction, {
            overrides: deps.dcPropsRef.current.values,
          });
        if (!undoResult) {
          deps.undoEditGroupRef.current = null;
          if (modelState[direction].length < stackLengthBefore) {
            if (direction === "undo")
              for (
                let redoLength: Dynamic = modelState.redo.length;
                redoLength < redoLengthBefore;
                redoLength++
              )
                deps.onHistoryDrop?.("redo");
            deps.onHistoryDrop?.(direction);
          }
          deps.incrementSessionEpoch();
          return;
        }
        deps.onHistoryApply?.(direction);
        deps.undoEditGroupRef.current = null;
        if (undoResult.kind === "prop") {
          if (undoResult.episode === "closed")
            delete deps.pendingPropSnapshotsRef.current[undoResult.prop];
          else if (undoResult.episode === "reopened") {
            let dcProps: Dynamic = deps.dcPropsRef.current;
            deps.pendingPropSnapshotsRef.current[undoResult.prop] = Object.hasOwn(
              dcProps.values,
              undoResult.prop,
            )
              ? {
                  had: true,
                  value: dcProps.values[undoResult.prop],
                }
              : {
                  had: false,
                };
          }
          deps.dcPropsRef.current.setProp(undoResult.prop, undoResult.liveValue);
          deps.markModelDirty(artboardName);
          deps.incrementSessionEpoch();
          return;
        }
        if (undoResult.kind === "script") {
          emitEditorEvent("dc-update", {
            name: artboardName,
            path: modelState.path,
            kind: "js",
            content: undoResult.js,
            streaming: false,
            viewportKey: "dc-model",
          });
          deps.markModelDirty(artboardName);
          deps.incrementSessionEpoch();
          return;
        }
        deps.pushLiveModel(artboardName, modelState);
        deps.markModelDirty(artboardName);
        let currentSelection: Dynamic = deps.selectionRef.current;
        if (currentSelection?.name === artboardName) {
          let validTids: Dynamic = modelState.model.sameSkeleton(model)
            ? currentSelection.tids.filter(
                (tid?: Dynamic): Dynamic =>
                  modelState.model.element(tid) != null,
              )
            : [];
          if (validTids.length > 0) {
            deps.selectElements(artboardName, validTids, undefined, undefined, true);
            let pickerTarget: Dynamic = deps.getPreviewFrame();
            pickerTarget &&
              setTimeout((): Dynamic => {
                let latestSelection: Dynamic = deps.selectionRef.current;
                latestSelection?.name === currentSelection.name &&
                  sameTidList(
                    latestSelection.tids,
                    validTids,
                  ) &&
                  setPickerSelection(
                    pickerTarget,
                    validTids,
                    currentSelection.name,
                  );
              }, 60);
          } else {
            deps.advanceSelectionSequence();
            deps.setSelection(null);
            let pickerTarget: Dynamic = deps.getPreviewFrame();
            pickerTarget && setPickerSelection(pickerTarget, null, null);
          }
        }
        deps.incrementSessionEpoch();
      }

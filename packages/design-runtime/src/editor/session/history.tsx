import { InspectorEditorEvery } from "../inspector/editor";
import { applyElementUndo } from "../undo/elements";
import { emitEditorEvent } from "../events/runtime";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";

/** 在编辑会话中按撤销或重做时运行：回放元素模型的一步历史，同步组件属性值或脚本的暂存内容，推送实时模型、标脏并恢复该步对应的选中。 */
export function stepSessionUndoRedo(deps: { readonly dcPropsRef: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onHistoryApply: Dynamic; readonly onHistoryDrop: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly value: Dynamic; readonly value105: Dynamic; readonly value3: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }, input?: Dynamic): Dynamic {
        if (deps.readOnlyRef.current) return;
        let value307: Dynamic =
            deps.value66.current ?? deps.value49.current?.name ?? deps.rootName,
          value308: Dynamic = deps.modelRef.current.state(value307);
        if (!value308) return;
        let model: Dynamic = value308.model,
          length: Dynamic = value308[input].length,
          length2: Dynamic = value308.redo.length,
          value309: Dynamic = applyElementUndo(value308, input, {
            overrides: deps.dcPropsRef.current.values,
          });
        if (!value309) {
          deps.value65.current = null;
          if (value308[input].length < length) {
            if (input === "undo")
              for (
                let length3: Dynamic = value308.redo.length;
                length3 < length2;
                length3++
              )
                deps.onHistoryDrop?.("redo");
            deps.onHistoryDrop?.(input);
          }
          deps.incrementSessionEpoch();
          return;
        }
        deps.onHistoryApply?.(input);
        deps.value65.current = null;
        if (value309.kind === "prop") {
          if (value309.episode === "closed")
            delete deps.value.current[value309.prop];
          else if (value309.episode === "reopened") {
            let current2: Dynamic = deps.dcPropsRef.current;
            deps.value.current[value309.prop] = Object.hasOwn(
              current2.values,
              value309.prop,
            )
              ? {
                  had: true,
                  value: current2.values[value309.prop],
                }
              : {
                  had: false,
                };
          }
          deps.dcPropsRef.current.setProp(value309.prop, value309.liveValue);
          deps.markModelDirty(value307);
          deps.incrementSessionEpoch();
          return;
        }
        if (value309.kind === "script") {
          emitEditorEvent("dc-update", {
            name: value307,
            path: value308.path,
            kind: "js",
            content: value309.js,
            streaming: false,
            viewportKey: "dc-model",
          });
          deps.markModelDirty(value307);
          deps.incrementSessionEpoch();
          return;
        }
        deps.pushLiveModel(value307, value308);
        deps.markModelDirty(value307);
        let current: Dynamic = deps.value49.current;
        if (current?.name === value307) {
          let value310: Dynamic = value308.model.sameSkeleton(model)
            ? current.tids.filter(
                (input2?: Dynamic): Dynamic =>
                  value308.model.element(input2) != null,
              )
            : [];
          if (value310.length > 0) {
            deps.value105(value307, value310, undefined, undefined, true);
            let value311: Dynamic = deps.value67();
            value311 &&
              setTimeout((): Dynamic => {
                let current2: Dynamic = deps.value49.current;
                current2?.name === current.name &&
                  InspectorEditorEvery(
                    current2.tids,
                    value310,
                  ) &&
                  setPickerSelection(
                    value311,
                    value310,
                    current.name,
                  );
              }, 60);
          } else {
            deps.value50.current++;
            deps.value3(null);
            let value311: Dynamic = deps.value67();
            value311 && setPickerSelection(value311, null, null);
          }
        }
        deps.incrementSessionEpoch();
      }

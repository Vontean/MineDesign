import { InspectorEditorResolvedValue_2 } from "../inspector/editor";
import { deferSelectionClear } from "../model/selection-relocation";
import { relocateModelElementIds } from "../model/selection-relocation";
import { relocateSelectionRef } from "../model/selection-relocation";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";
import { verifyPickerSelection } from "../picker/bridge";

/** 每次向画板推送实时模型后运行：防抖 250ms，把模板大纲与画板中实际渲染的元素逐一比对，发现缺失、父子或顺序不一致时只在控制台告警，不改动作品。 */
export function scheduleLiveDomSyncCheck(deps: { readonly delegatedFileRef: Dynamic; readonly modelRef: Dynamic; readonly value67: Dynamic; readonly value89: Dynamic }, templateName?: Dynamic): Dynamic {
        deps.delegatedFileRef.current ||
          (deps.value89.current && clearTimeout(deps.value89.current),
          (deps.value89.current = setTimeout((): Dynamic => {
            deps.value89.current = null;
            (async (): Promise<Dynamic> => {
              let templateState: Dynamic = deps.modelRef.current.state(templateName),
                previewFrame: Dynamic = deps.value67();
              if (!templateState || !previewFrame) return;
              let parentByTid: Dynamic = {},
                childTidsByTid: Dynamic = {},
                values: Dynamic = new Set(["sc-for", "sc-if"]),
                collectChildTids: Dynamic = (nodes?: Dynamic): Dynamic =>
                  nodes.flatMap(
                    (node?: Dynamic): Dynamic =>
                      values.has(node.tag)
                        ? collectChildTids(node.children)
                        : [node.tid],
                  ),
                recordParents: Dynamic = (
                  nodes?: Dynamic,
                  parentTid?: Dynamic,
                ): Dynamic => {
                  for (let node of nodes as Dynamic) {
                    if (values.has(node.tag)) {
                      recordParents(node.children, parentTid);
                      continue;
                    }
                    parentByTid[node.tid] = parentTid;
                    let childTids: Dynamic = collectChildTids(node.children);
                    childTids.length > 0 && (childTidsByTid[node.tid] = childTids);
                    recordParents(node.children, node.tid);
                  }
                };
              recordParents(templateState.model.outline(), null);
              let verification: Dynamic = await verifyPickerSelection(previewFrame, templateName, parentByTid, childTidsByTid);
              if (!verification) return;
              let {
                parentMismatches: parentMismatches,
                unknownTids: unknownTids,
                orderMismatches: orderMismatches,
                missingTids: missingTids,
              }: Dynamic = verification;
              missingTids.length > 0 &&
                console.warn(
                  "[dc-editor] template tids with no rendered instance:",
                  missingTids,
                );
              (parentMismatches.length > 0 ||
                unknownTids.length > 0 ||
                orderMismatches.length > 0) &&
                console.error(
                  `[dc-editor] live DOM is out of sync with the ${templateName} template after an edit`,
                  {
                    parentMismatches: parentMismatches,
                    unknownTids: unknownTids,
                    orderMismatches: orderMismatches,
                  },
                );
            })();
          }, 250)));
      }

/** 画板模型被替换或外部重新解析后运行：递增会话代次，把文字编辑目标和当前选中元素的 id 迁移到新模型，选中失效时清空，否则稍后在画板里重新高亮选中。 */
export function remapSelectionAfterModelSwap(deps: { readonly incrementSessionEpoch: Dynamic; readonly modelRef: Dynamic; readonly rootName: Dynamic; readonly textEditRef: Dynamic; readonly value107: Dynamic; readonly value3: Dynamic; readonly value38: Dynamic; readonly value46: Dynamic; readonly value48: Dynamic; readonly value49: Dynamic; readonly value5: Dynamic; readonly value50: Dynamic; readonly value51: Dynamic; readonly value67: Dynamic; readonly value91: Dynamic }, templateName?: Dynamic,
      previousModel?: Dynamic,
      shouldDelayClear?: Dynamic): Dynamic {
      let nextModel: Dynamic = deps.modelRef.current.state(templateName)?.model;
      if (!nextModel || nextModel === previousModel) return;
      deps.incrementSessionEpoch();
      deps.value48((count?: Dynamic): Dynamic => count + 1);
      templateName === deps.rootName && (deps.value107.current = null);
      (deps.value49.current?.name === templateName || deps.value51.current?.name === templateName) &&
        deps.value50.current++;
      let previewFrame: Dynamic = deps.value67();
      templateName === deps.rootName &&
        deps.textEditRef.current != null &&
        ((deps.textEditRef.current =
          (previousModel &&
            relocateModelElementIds(previousModel, nextModel, [
              deps.textEditRef.current,
            ])[0]) ??
          null),
        deps.value5(deps.textEditRef.current));
      let current: Dynamic = deps.value49.current,
        relocatedSelection: Dynamic = relocateSelectionRef(
          deps.value49,
          templateName,
          previousModel,
          nextModel,
        );
      if (relocatedSelection === undefined) return;
      deps.value3(relocatedSelection);
      deps.value46.current = null;
      if (relocatedSelection === null) {
        previewFrame &&
          setPickerSelection(
            previewFrame,
            null,
            null,
            InspectorEditorResolvedValue_2,
          );
        return;
      }
      let { tids: selectedTids }: Dynamic = relocatedSelection;
      deps.value38.shown() ||
        deps.value91.current?.(templateName, selectedTids, undefined, undefined, true);
      if (
        !previewFrame ||
        (templateName === deps.rootName && selectedTids.join() !== current?.tids.join())
      )
        return;
      let highlightEpoch: Dynamic = deps.value50.current;
      deferSelectionClear(
        deps.value46,
        templateName,
        (): Dynamic => {
          setTimeout((): Dynamic => {
            deps.value50.current === highlightEpoch &&
              setPickerSelection(
                previewFrame,
                selectedTids,
                templateName,
                InspectorEditorResolvedValue_2,
              );
          }, 60);
        },
        shouldDelayClear ? 600 : null,
      );
    }

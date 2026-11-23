import { pickerFollowedSelectionKey } from "../inspector/editor";
import { deferSelectionClear } from "../model/selection-relocation";
import { relocateModelElementIds } from "../model/selection-relocation";
import { relocateSelectionRef } from "../model/selection-relocation";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";
import { verifyPickerSelection } from "../picker/bridge";

interface LiveDomSyncContext {
  readonly delegatedFileRef: Dynamic;
  readonly modelRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
  readonly liveDomCheckTimeoutRef: Dynamic;
}

/** 每次向画板推送实时模型后运行：防抖 250ms，把模板大纲与画板中实际渲染的元素逐一比对，发现缺失、父子或顺序不一致时只在控制台告警，不改动作品。 */
export function scheduleLiveDomSyncCheck(deps: LiveDomSyncContext, templateName?: Dynamic): Dynamic {
        deps.delegatedFileRef.current ||
          (deps.liveDomCheckTimeoutRef.current && clearTimeout(deps.liveDomCheckTimeoutRef.current),
          (deps.liveDomCheckTimeoutRef.current = setTimeout((): Dynamic => {
            deps.liveDomCheckTimeoutRef.current = null;
            (async (): Promise<Dynamic> => {
              let templateState: Dynamic = deps.modelRef.current.state(templateName),
                previewFrame: Dynamic = deps.getPreviewFrame();
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

interface ModelReplacementContext {
  readonly incrementSessionEpoch: Dynamic;
  readonly modelRef: Dynamic;
  readonly rootName: Dynamic;
  readonly textEditRef: Dynamic;
  readonly pendingTextTargetTidRef: Dynamic;
  readonly setSelection: Dynamic;
  readonly typingQuietScheduler: Dynamic;
  readonly deferredSelectionSyncRef: Dynamic;
  readonly setRenameCloseVersion: Dynamic;
  readonly selectionRef: Dynamic;
  readonly setTextEditTargetTid: Dynamic;
  readonly selectionSequenceRef: Dynamic;
  readonly advanceSelectionSequence: Dynamic;
  readonly pendingSelectionRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
  readonly selectElementsRef: Dynamic;
}

/** 画板模型被替换或外部重新解析后运行：递增会话代次，把文字编辑目标和当前选中元素的 id 迁移到新模型，选中失效时清空，否则稍后在画板里重新高亮选中。 */
export function remapSelectionAfterModelSwap(deps: ModelReplacementContext, templateName?: Dynamic,
      previousModel?: Dynamic,
      shouldDelayClear?: Dynamic): Dynamic {
      let nextModel: Dynamic = deps.modelRef.current.state(templateName)?.model;
      if (!nextModel || nextModel === previousModel) return;
      deps.incrementSessionEpoch();
      deps.setRenameCloseVersion((count?: Dynamic): Dynamic => count + 1);
      templateName === deps.rootName && (deps.pendingTextTargetTidRef.current = null);
      (deps.selectionRef.current?.name === templateName || deps.pendingSelectionRef.current?.name === templateName) &&
        deps.advanceSelectionSequence();
      let previewFrame: Dynamic = deps.getPreviewFrame();
      templateName === deps.rootName &&
        deps.textEditRef.current != null &&
        ((deps.textEditRef.current =
          (previousModel &&
            relocateModelElementIds(previousModel, nextModel, [
              deps.textEditRef.current,
            ])[0]) ??
          null),
        deps.setTextEditTargetTid(deps.textEditRef.current));
      let current: Dynamic = deps.selectionRef.current,
        relocatedSelection: Dynamic = relocateSelectionRef(
          deps.selectionRef,
          templateName,
          previousModel,
          nextModel,
        );
      if (relocatedSelection === undefined) return;
      deps.setSelection(relocatedSelection);
      deps.deferredSelectionSyncRef.current = null;
      if (relocatedSelection === null) {
        previewFrame &&
          setPickerSelection(
            previewFrame,
            null,
            null,
            pickerFollowedSelectionKey,
          );
        return;
      }
      let { tids: selectedTids }: Dynamic = relocatedSelection;
      deps.typingQuietScheduler.shown() ||
        deps.selectElementsRef.current?.(templateName, selectedTids, undefined, undefined, true);
      if (
        !previewFrame ||
        (templateName === deps.rootName && selectedTids.join() !== current?.tids.join())
      )
        return;
      let highlightEpoch: Dynamic = deps.selectionSequenceRef.current;
      deferSelectionClear(
        deps.deferredSelectionSyncRef,
        templateName,
        (): Dynamic => {
          setTimeout((): Dynamic => {
            deps.selectionSequenceRef.current === highlightEpoch &&
              setPickerSelection(
                previewFrame,
                selectedTids,
                templateName,
                pickerFollowedSelectionKey,
              );
          }, 60);
        },
        shouldDelayClear ? 600 : null,
      );
    }

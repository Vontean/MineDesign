import { DcTplAttribute } from "../html/authoring";
import { pickerHover } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";

/** 大纲树操作（悬停、隐藏、重命名、移动）共用的会话依赖，均在调用时才读取。 */
export interface OutlineActionDependencies {
  readonly rootName: Dynamic;
  readonly modelRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
  readonly consumePickerSelectionSync: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly revokeUndoEdit: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly incrementSessionEpoch: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
  readonly lastInspectorSelectionKeyRef: Dynamic;
  readonly selectElements: Dynamic;
  /** 隐藏前的 display 值，取消隐藏时还原；随会话保存。 */
  readonly displayBeforeHideRef: Dynamic;
}

/** 鼠标悬停大纲行时，在预览帧里高亮对应元素。 */
export function hoverOutlineElement(deps: OutlineActionDependencies, hoveredTid?: Dynamic): Dynamic {
  let previewFrame: Dynamic = deps.getPreviewFrame();
  previewFrame && pickerHover(previewFrame, hoveredTid, deps.rootName);
}

/** 隐藏或显示大纲元素；隐藏时记住原 display，显示时还原。 */
export function toggleOutlineElementHidden(deps: OutlineActionDependencies, targetTid?: Dynamic, shouldHide?: Dynamic): Dynamic {
  const { rootName, modelRef, displayBeforeHideRef } = deps;
  if (deps.consumePickerSelectionSync()) return;
  let templateState: Dynamic = modelRef.current.state(rootName),
    targetElement: Dynamic = templateState?.model.element(targetTid);
  if (!templateState || !targetElement || templateState.model.isUneditable(targetTid))
    return;
  deps.pushUndoEdit(rootName, `outline-hide-${targetTid}`, templateState);
  let nextDisplay: Dynamic;
  if (shouldHide) {
    let previousDisplay: Dynamic = templateState.model.inlineStyleValue(
      targetTid,
      "display",
    );
    previousDisplay !== "none" && displayBeforeHideRef.current.set(targetElement, previousDisplay);
    nextDisplay = "none";
  } else {
    let entry: Dynamic = displayBeforeHideRef.current.get(targetElement);
    displayBeforeHideRef.current.delete(targetElement);
    nextDisplay =
      entry !== undefined
        ? entry || null
        : templateState.model.inferDisplayValue(targetTid);
  }
  templateState.model.setStyleProperty(targetTid, "display", nextDisplay);
  deps.lastEditedTemplateRef.current = rootName;
  deps.pushLiveModel(rootName, templateState);
  deps.markModelDirty(rootName);
  deps.incrementSessionEpoch();
}

/** 在大纲里重命名元素；写入 data-om-label，空名称清除标签。 */
export function renameOutlineElement(deps: OutlineActionDependencies, targetTid?: Dynamic, outlineName?: Dynamic): Dynamic {
  const { rootName, modelRef } = deps;
  if (deps.consumePickerSelectionSync()) return;
  let templateState: Dynamic = modelRef.current.state(rootName);
  !templateState ||
    !templateState.model.element(targetTid) ||
    (deps.pushUndoEdit(rootName, `outline-rename-${targetTid}`, templateState),
    templateState.model.setAttribute(
      targetTid,
      "data-om-label",
      outlineName || null,
    ),
    (deps.lastEditedTemplateRef.current = rootName),
    deps.pushLiveModel(rootName, templateState),
    deps.markModelDirty(rootName),
    deps.incrementSessionEpoch());
}

/** 在大纲里拖动元素到目标旁或内部；移动失败时撤回刚记录的撤销项。 */
export function moveOutlineElement(deps: OutlineActionDependencies, movedTid?: Dynamic, targetTid?: Dynamic, dropPosition?: Dynamic): Dynamic {
  const { rootName, modelRef } = deps;
  if (deps.consumePickerSelectionSync()) return;
  let templateState: Dynamic = modelRef.current.state(rootName);
  if (
    !templateState ||
    !templateState.model.element(movedTid) ||
    !templateState.model.element(targetTid) ||
    templateState.model.isUneditable(movedTid) ||
    templateState.model.targetParentLocked(targetTid, dropPosition)
  )
    return;
  let previousRedoEntries: Dynamic = templateState.redo,
    didPushUndo: Dynamic = deps.pushUndoEdit(
      rootName,
      `outline-move-${movedTid}-${Date.now()}`,
      templateState,
    ),
    movedElement: Dynamic = templateState.model.element(movedTid);
  if (!templateState.model.moveRelative(movedTid, targetTid, dropPosition)) {
    deps.revokeUndoEdit(templateState, didPushUndo, previousRedoEntries);
    return;
  }
  templateState.model.restamp();
  let relocatedTid: Dynamic = parseInt(
    movedElement?.getAttribute(DcTplAttribute) ?? "-1",
    10,
  );
  deps.lastEditedTemplateRef.current = rootName;
  deps.pushLiveModel(rootName, templateState);
  deps.markModelDirty(rootName);
  deps.incrementSessionEpoch();
  relocatedTid >= 0 &&
    ((deps.lastInspectorSelectionKeyRef.current = rootName + ":" + relocatedTid),
    deps.selectElements(rootName, [relocatedTid]));
}

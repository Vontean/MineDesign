import { cancelPickerLinkEdit } from "../picker/bridge";
import { relocateSelectedTextElement } from "../model/selection-relocation";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { validateAttributeEdit } from "../attribute-validation";

interface LinkEditDependencies {
  readonly feedback: {
    readonly incrementSessionEpoch: Dynamic;
    readonly showToast: Dynamic;
    readonly cacheFeedbackLabel: Dynamic;
  };
  readonly model: {
    readonly markModelDirty: Dynamic;
    readonly modelRef: Dynamic;
    readonly pushLiveModel: Dynamic;
    readonly rootName: Dynamic;
    readonly lastEditedTemplateRef: Dynamic;
  };
  readonly view: {
    readonly onTextEditEndedRef: Dynamic;
    readonly didAdoptTextEditModelRef: Dynamic;
    readonly finishOpenTextEditRef: Dynamic;
    readonly typingQuietScheduler: Dynamic;
    readonly getPreviewFrame: Dynamic;
    readonly previewFrameRef: Dynamic;
  };
  readonly history: {
    readonly pushUndoEdit: Dynamic;
    readonly revokeUndoEdit: Dynamic;
  };
  readonly selection: {
    readonly selectElements: Dynamic;
    readonly setSelection: Dynamic;
    readonly advanceSelectionSequence: Dynamic;
  };
}

/** 链接编辑结束时运行：结束画板内的文字编辑后，链接地址为空就拆掉 <a> 保留其内容，否则校验并改写 href，记录撤销、推送实时模型并重新选中；失败时提示重试。 */
export async function commitLinkEditResult(deps: LinkEditDependencies, tid?: Dynamic,
        templateName?: Dynamic,
        href?: Dynamic,
        source?: Dynamic): Promise<Dynamic> {
        if ((templateName || deps.model.rootName) !== deps.model.rootName) {
          let frameForCancel: Dynamic = deps.view.getPreviewFrame();
          frameForCancel && cancelPickerLinkEdit(frameForCancel);
          return;
        }
        let previewFrame: Dynamic = deps.view.getPreviewFrame(),
          resolvedTid: Dynamic = tid,
          shownBox: Dynamic = deps.view.typingQuietScheduler.shown();
        deps.view.didAdoptTextEditModelRef.current = false;
        previewFrame &&
          (await deps.view.finishOpenTextEditRef.current(undefined, (renderedState?: Dynamic): Dynamic => {
            let latestModel: Dynamic = deps.model.modelRef.current.state(deps.model.rootName)?.model;
            latestModel &&
              source === "frame" &&
              (resolvedTid = relocateSelectedTextElement(
                deps.view.typingQuietScheduler.shown() ?? shownBox,
                latestModel,
                tid,
                renderedState,
              ));
          }),
          deps.view.previewFrameRef.current?.blur(),
          (window as Dynamic).focus(),
          deps.view.onTextEditEndedRef.current?.());
        let docState: Dynamic = deps.model.modelRef.current.state(deps.model.rootName);
        if (deps.view.didAdoptTextEditModelRef.current ? source === "model" : resolvedTid === null) {
          deps.feedback.showToast(
            href == null
              ? uiMessage("inspector.session.linkNotRemovedTryAgain")
              : uiMessage("inspector.session.linkNotChangedTryAgain"),
          );
          return;
        }
        deps.view.didAdoptTextEditModelRef.current || (tid = resolvedTid);
        if (
          !docState ||
          !docState.model.element(tid) ||
          docState.model.tagName(tid) !== "a"
        )
          return;
        if (href == null) {
          let redo: Dynamic = docState.redo,
            undoEntry: Dynamic = deps.history.pushUndoEdit(
              deps.model.rootName,
              `link-unwrap-${Date.now()}`,
              docState,
            ),
            unwrappedElements: Dynamic = docState.model.unwrapElement(tid);
          if (!unwrappedElements) {
            deps.history.revokeUndoEdit(docState, undoEntry, redo);
            return;
          }
          docState.model.restamp();
          deps.model.lastEditedTemplateRef.current = deps.model.rootName;
          deps.model.pushLiveModel(deps.model.rootName, docState);
          deps.model.markModelDirty(deps.model.rootName);
          deps.feedback.incrementSessionEpoch();
          let unwrappedTids: Dynamic = unwrappedElements
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
            )
            .filter((tidNumber?: Dynamic): Dynamic => tidNumber >= 0);
          unwrappedTids.length > 0
            ? deps.selection.selectElements(deps.model.rootName, unwrappedTids)
            : (previewFrame &&
                setPickerSelection(previewFrame, null, null),
              deps.selection.advanceSelectionSequence(),
              deps.selection.setSelection(null));
          deps.feedback.cacheFeedbackLabel(`${docState.path}: removed link (kept content)`);
          return;
        }
        let hrefEdit: Dynamic = validateAttributeEdit(
          "@href",
          href,
          [docState.model.tagName(tid)],
        );
        if (!hrefEdit.ok) {
          deps.feedback.showToast(hrefEdit.message);
          return;
        }
        deps.history.pushUndoEdit(deps.model.rootName, `link-href-${tid}`, docState);
        docState.model.setAttribute(tid, "href", hrefEdit.value);
        deps.model.lastEditedTemplateRef.current = deps.model.rootName;
        deps.model.pushLiveModel(deps.model.rootName, docState);
        deps.model.markModelDirty(deps.model.rootName);
        deps.feedback.incrementSessionEpoch();
        deps.selection.selectElements(deps.model.rootName, [tid], "a", 1);
        previewFrame &&
          setTimeout(
            (): Dynamic =>
              setPickerSelection(previewFrame, [tid], deps.model.rootName),
            120,
          );
        deps.feedback.cacheFeedbackLabel(`${docState.path}: set link destination ${hrefEdit.value}`);
      }

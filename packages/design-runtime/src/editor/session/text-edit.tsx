import { textUpdatedMessage } from "../accessibility/announcements";
import { emptyTextBoxRemovedMessage } from "../accessibility/announcements";
import { ClipboardLayoutSnapshotsScriptStyleXmpSet } from "../clipboard/layout-snapshots";
import { DcLinkNewAttribute } from "../picker/runtime-script";
import { announce } from "../accessibility/announcer";
import { collectTemplateTextValues } from "../components/text-edits";
import { emitEditorEvent } from "../events/runtime";
import { getDcPropsJson } from "../html/dc-props";
import { isOtherSelection } from "../model/selection-relocation";
import { normalizeComponentPropEdit } from "../components/props";
import { normalizeComponentTextEdit } from "../components/text-edits";
import { parseDcHtmlDocument } from "../html/dc-document";
import { placeholderTextElement } from "../text/placeholder";
import { quoteScriptString } from "../code/script-literals";
import { relocateTextEditTarget } from "../model/selection-relocation";
import { sanitizePastedHtml } from "../clipboard/html-sanitization";
import { selectionReadyAnnouncement } from "../accessibility/announcements";
import { setPickerSelection } from "../picker/bridge";
import { tokenizeScriptLiterals } from "../code/script-literals";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";

interface TextEditDependencies {
  readonly model: {
    readonly dcPropsRef: Dynamic;
    readonly markModelDirty: Dynamic;
    readonly modelRef: Dynamic;
    readonly pushLiveModel: Dynamic;
    readonly readOnlyRef: Dynamic;
    readonly rootName: Dynamic;
    readonly lastEditedTemplateRef: Dynamic;
  };
  readonly feedback: {
    readonly incrementSessionEpoch: Dynamic;
    readonly showToast: Dynamic;
  };
  readonly view: {
    readonly onTextEditEndedRef: Dynamic;
    readonly pendingTextTargetTidRef: Dynamic;
    readonly didAdoptTextEditModelRef: Dynamic;
    readonly typingQuietScheduler: Dynamic;
    readonly getPreviewFrame: Dynamic;
    readonly previewFrameRef: Dynamic;
  };
  readonly history: {
    readonly pendingPropSnapshotsRef: Dynamic;
    readonly pushUndoEdit: Dynamic;
    readonly combineUndoEdit: Dynamic;
  };
  readonly selection: {
    readonly selectElements: Dynamic;
    readonly setSelection: Dynamic;
    readonly selectionRef: Dynamic;
    readonly advanceSelectionSequence: Dynamic;
    readonly getLatestSelection: Dynamic;
    readonly isCurrentSelection: Dynamic;
    readonly requestPickerSelectionSync: Dynamic;
    readonly clearSelection: Dynamic;
  };
}

/** 画板里的文字编辑提交时运行：按目标类型把新文字写回作品（普通元素文字、组件实例的属性值或脚本里的字符串字面量），超长或已失效时提示并放弃，然后推送实时模型、标脏、播报并恢复选中。 */
export function commitFinishedTextEdit(deps: TextEditDependencies, edit?: Dynamic): Dynamic {
        edit.restarted !== true &&
          (deps.view.previewFrameRef.current?.blur(),
          (document as Dynamic).hasFocus() && (window as Dynamic).focus(),
          deps.view.onTextEditEndedRef.current?.());
        let announcementFor: Dynamic = (announcement?: Dynamic): Dynamic =>
          edit.restarted === true
            ? selectionReadyAnnouncement(announcement)
            : announcement;
        if (
          deps.model.readOnlyRef.current ||
          (edit.name || deps.model.rootName) !== deps.model.rootName ||
          (edit.html != null && typeof edit.html != "string") ||
          (edit.text != null && typeof edit.text != "string")
        )
          return;
        let docState: Dynamic = deps.model.modelRef.current.state(deps.model.rootName);
        if (!docState) return;
        let templateTextValues: Dynamic = edit.importTarget
            ? collectTemplateTextValues(
                tokenizeScriptLiterals(
                  docState.pendingScript ??
                    parseDcHtmlDocument(docState.src)?.js ??
                    "",
                ),
                deps.model.dcPropsRef.current,
              )
            : null,
          { importTarget: importTarget, text: editText }: Dynamic = edit,
          owesSync: Dynamic = deps.view.typingQuietScheduler.owes(),
          isNewBox: Dynamic = deps.view.typingQuietScheduler.newBox() === edit.tid,
          { into: targetModel, tid: targetTid }: Dynamic = relocateTextEditTarget(
            deps.view.typingQuietScheduler.shown(),
            docState.model,
            edit.tid,
            templateTextValues
              ? (candidateModel?: Dynamic, candidateTid?: Dynamic): Dynamic =>
                  normalizeComponentTextEdit(
                    importTarget,
                    editText,
                    candidateModel.importTextTargets(candidateTid, templateTextValues),
                  ).kind === "commit"
              : undefined,
          );
        edit = {
          ...edit,
          tid: targetTid,
        };
        if (!targetModel.element(edit.tid)) return;
        let adoptTargetModel: Dynamic = (): Dynamic => {
            targetModel !== docState.model &&
              ((docState.model = docState.model.rebuild(
                targetModel.serialize(),
              )),
              (deps.view.didAdoptTextEditModelRef.current = true),
              deps.selection.requestPickerSelectionSync(),
              deps.selection.clearSelection());
          },
          currentTextSelection: Dynamic = (): Dynamic => {
            let selection: Dynamic = owesSync ? deps.selection.getLatestSelection() : deps.selection.selectionRef.current;
            return selection?.name === deps.model.rootName &&
              selection.tids.includes(edit.tid)
              ? selection
              : null;
          },
          reselectAfterEdit: Dynamic = (): Dynamic => {
            let selection: Dynamic = currentTextSelection(),
              previewFrame: Dynamic = deps.view.getPreviewFrame();
            selection &&
              previewFrame &&
              setTimeout((): Dynamic => {
                (!owesSync || deps.selection.isCurrentSelection(selection.name, selection.tids)) &&
                  setPickerSelection(
                    previewFrame,
                    selection.tids,
                    selection.name,
                  );
              }, 60);
          },
          reselectAndHighlight: Dynamic = (): Dynamic => {
            reselectAfterEdit();
            let selection: Dynamic = currentTextSelection();
            selection && deps.selection.selectElements(deps.model.rootName, [...selection.tids]);
          };
        if (templateTextValues) {
          let importEdit: Dynamic = normalizeComponentTextEdit(
            edit.importTarget,
            edit.text,
            targetModel.importTextTargets(edit.tid, templateTextValues),
          );
          if (importEdit.kind === "drop" || importEdit.kind === "noop") return;
          if (importEdit.kind !== "commit") {
            deps.feedback.showToast(
              importEdit.kind === "toolong"
                ? uiMessage("inspector.session.tooMuchTextTryFewer")
                : uiMessage("inspector.session.yourWordsWerenTKept"),
            );
            deps.feedback.incrementSessionEpoch();
            return;
          }
          let { key: importKey, text: importText }: Dynamic = importEdit;
          deps.history.pushUndoEdit(
            deps.model.rootName,
            `textedit-import-${edit.tid}-${importKey}`,
            docState,
          );
          adoptTargetModel();
          importKey === "__text"
            ? docState.model.setText(edit.tid, importText)
            : docState.model.setAttribute(
                edit.tid,
                importKey.slice(1),
                importText,
              );
          deps.model.lastEditedTemplateRef.current = deps.model.rootName;
          deps.model.pushLiveModel(deps.model.rootName, docState);
          deps.model.markModelDirty(deps.model.rootName, {
            now: true,
          });
          deps.feedback.incrementSessionEpoch();
          announce(
            announcementFor(textUpdatedMessage),
          );
          let selection: Dynamic = currentTextSelection(),
            previewFrame: Dynamic = deps.view.getPreviewFrame();
          selection &&
            previewFrame &&
            setTimeout((): Dynamic => {
              deps.selection.isCurrentSelection(selection.name, selection.tids) &&
                setPickerSelection(
                  previewFrame,
                  selection.tids,
                  selection.name,
                );
            }, 60);
          selection && deps.selection.selectElements(deps.model.rootName, [...selection.tids]);
          return;
        }
        if (
          !targetModel.isTextEditable(edit.tid) ||
          ClipboardLayoutSnapshotsScriptStyleXmpSet.has(
            targetModel.tagName(edit.tid) ?? "",
          )
        )
          return;
        if (edit.propTarget) {
          let current: Dynamic = deps.model.dcPropsRef.current,
            propEdit: Dynamic = normalizeComponentPropEdit(
              edit.propTarget,
              edit.text,
              current.propsMeta,
              current.values,
            );
          if (propEdit.kind === "drop" || propEdit.kind === "noop") return;
          if (propEdit.kind === "toolong") {
            deps.feedback.showToast(uiMessage("inspector.session.thatTextIsTooLong"));
            deps.feedback.incrementSessionEpoch();
            return;
          }
          if (propEdit.kind === "refuse") {
            deps.feedback.showToast(
              uiMessage("inspector.session.theComponentSPropsChanged"),
            );
            deps.feedback.incrementSessionEpoch();
            return;
          }
          let { prop: propName, text: propText }: Dynamic = propEdit,
            isFirstPropEdit: Dynamic = !Object.hasOwn(
              docState.pendingProps ?? {},
              propName,
            );
          isFirstPropEdit &&
            (deps.history.pendingPropSnapshotsRef.current[propName] = Object.hasOwn(current.values, propName)
              ? {
                  had: true,
                  value: current.values[propName],
                }
              : {
                  had: false,
                });
          current.setProp(propName, propText);
          docState.pendingPropsBase ??=
            getDcPropsJson(docState.src) ?? "";
          deps.history.combineUndoEdit(deps.model.rootName, `textedit-prop-${edit.tid}`, docState, {
            kind: "prop",
            prop: propName,
            before: isFirstPropEdit ? undefined : docState.pendingProps?.[propName],
            after: propText,
            base: docState.pendingPropsBase,
            display: edit.propTarget.value,
            ...(isFirstPropEdit
              ? {
                  liveBefore: deps.history.pendingPropSnapshotsRef.current[propName],
                }
              : {}),
          });
          docState.pendingProps = {
            ...docState.pendingProps,
            [propName]: propText,
          };
          deps.model.lastEditedTemplateRef.current = deps.model.rootName;
          deps.model.markModelDirty(deps.model.rootName, {
            now: true,
          });
          announce(
            announcementFor(textUpdatedMessage),
          );
          return;
        }
        if (edit.scriptTarget) {
          let {
              start: scriptStart,
              end: scriptEnd,
              quote: scriptQuote,
              value: scriptValue,
            }: Dynamic = edit.scriptTarget,
            scriptSource: Dynamic =
              docState.pendingScript ??
              parseDcHtmlDocument(docState.src)?.js ??
              "",
            literal: Dynamic = tokenizeScriptLiterals(
              scriptSource,
            ).find(
              (token?: Dynamic): Dynamic =>
                token.start === scriptStart && token.end === scriptEnd,
            );
          if (
            !literal ||
            literal.quote !== scriptQuote ||
            literal.value !== scriptValue
          ) {
            deps.feedback.showToast(
              uiMessage("inspector.session.theComponentSCodeChanged"),
            );
            deps.feedback.incrementSessionEpoch();
            return;
          }
          let newText: Dynamic = edit.text ?? "";
          if (newText === literal.value) return;
          let newScript: Dynamic =
            scriptSource.slice(0, scriptStart) +
            quoteScriptString(newText, scriptQuote) +
            scriptSource.slice(scriptEnd);
          if (newScript === scriptSource) return;
          docState.pendingScriptBase ??=
            parseDcHtmlDocument(docState.src)?.js ?? "";
          deps.history.combineUndoEdit(deps.model.rootName, `textedit-script-${edit.tid}`, docState, {
            kind: "script",
            before: docState.pendingScript,
            after: newScript,
            base: docState.pendingScriptBase,
          });
          docState.pendingScript = newScript;
          deps.model.lastEditedTemplateRef.current = deps.model.rootName;
          emitEditorEvent("dc-update", {
            name: deps.model.rootName,
            path: docState.path,
            kind: "js",
            content: newScript,
            streaming: false,
            viewportKey: "dc-model",
          });
          deps.model.markModelDirty(deps.model.rootName, {
            now: true,
          });
          deps.feedback.incrementSessionEpoch();
          announce(
            announcementFor(textUpdatedMessage),
          );
          return;
        }
        let currentText: Dynamic = targetModel.text(edit.tid),
          rawHtml: Dynamic = edit.html ?? "",
          cleanHtml: Dynamic = rawHtml.includes("<")
            ? sanitizePastedHtml(rawHtml)
            : rawHtml,
          newPlainText: Dynamic = edit.text ?? "",
          isEmpty: Dynamic =
            newPlainText.trim() === "" &&
            !/<(img|svg|video|iframe)/i.test(cleanHtml);
        if (isEmpty && (targetModel !== docState.model || isNewBox)) return;
        let isPlaceholder: Dynamic =
          placeholderTextElement(
            docState.model,
            deps.view.pendingTextTargetTidRef.current,
          ) === edit.tid;
        deps.view.pendingTextTargetTidRef.current === edit.tid && (deps.view.pendingTextTargetTidRef.current = null);
        if (isPlaceholder && isEmpty) {
          deps.history.pushUndoEdit(deps.model.rootName, `textedit-${edit.tid}`, docState);
          docState.model.removeElement(edit.tid);
          docState.model = docState.model.rebuild(docState.model.serialize());
          owesSync && deps.selection.requestPickerSelectionSync();
          deps.model.lastEditedTemplateRef.current = deps.model.rootName;
          deps.model.pushLiveModel(deps.model.rootName, docState);
          deps.model.markModelDirty(deps.model.rootName, {
            now: true,
          });
          let previewFrame: Dynamic = deps.view.getPreviewFrame();
          previewFrame && setPickerSelection(previewFrame, null, null);
          deps.selection.advanceSelectionSequence();
          deps.selection.setSelection(null);
          deps.feedback.incrementSessionEpoch();
          announce(
            announcementFor(emptyTextBoxRemovedMessage),
          );
          return;
        }
        let hasHtmlMarkup: Dynamic = /<[a-z][\s\S]*>/i.test(cleanHtml);
        if (!hasHtmlMarkup && newPlainText === currentText) {
          deps.model.pushLiveModel(deps.model.rootName, docState);
          reselectAfterEdit();
          return;
        }
        deps.history.pushUndoEdit(deps.model.rootName, `textedit-${edit.tid}`, docState);
        adoptTargetModel();
        docState.model.tagName(edit.tid) === "p" &&
          /<(ul|ol|div|p|h[1-6]|blockquote|pre|table)\b/i.test(cleanHtml) &&
          docState.model.setTagName(edit.tid, "div");
        let newLinkTid: Dynamic = null;
        hasHtmlMarkup || currentText == null
          ? (docState.model.setInnerHtml(edit.tid, cleanHtml),
            (docState.model = docState.model.rebuild(
              docState.model.serialize(),
            )),
            (newLinkTid = docState.model.takeMarkerAttr(
              DcLinkNewAttribute,
              edit.tid,
            )),
            owesSync &&
              edit.restarted !== true &&
              (deps.selection.requestPickerSelectionSync(),
              newLinkTid == null &&
                isOtherSelection(
                  deps.selection.getLatestSelection(),
                  deps.model.rootName,
                  edit.tid,
                ) &&
                deps.selection.clearSelection()))
          : docState.model.setText(edit.tid, newPlainText);
        deps.model.lastEditedTemplateRef.current = deps.model.rootName;
        deps.model.pushLiveModel(deps.model.rootName, docState);
        deps.model.markModelDirty(deps.model.rootName, {
          now: true,
        });
        deps.feedback.incrementSessionEpoch();
        announce(
          announcementFor(textUpdatedMessage),
        );
        if (newLinkTid != null) {
          let linkTid: Dynamic = newLinkTid,
            previewFrame: Dynamic = deps.view.getPreviewFrame();
          previewFrame &&
            setTimeout((): Dynamic => {
              (!owesSync || deps.selection.isCurrentSelection(deps.model.rootName, [linkTid])) &&
                setPickerSelection(
                  previewFrame,
                  [linkTid],
                  deps.model.rootName,
                );
            }, 60);
          deps.selection.selectElements(deps.model.rootName, [linkTid], "a", 1);
          return;
        }
        reselectAndHighlight();
      }

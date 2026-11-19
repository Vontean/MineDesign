import { AccessibilityAnnouncementsLabel_17 } from "../accessibility/announcements";
import { AccessibilityAnnouncementsLabel_23 } from "../accessibility/announcements";
import { ClipboardLayoutSnapshotsScriptStyleXmpSet } from "../clipboard/layout-snapshots";
import { DcLinkNewAttribute } from "../picker/runtime-script";
import { announce } from "../accessibility/announcer";
import { cancelPickerLinkEdit } from "../picker/bridge";
import { collectTemplateTextValues } from "../components/text-edits";
import { emitEditorEvent } from "../events/runtime";
import { getDcPropsJson } from "../html/dc-props";
import { isOtherSelection } from "../model/selection-relocation";
import { normalizeComponentPropEdit } from "../components/props";
import { normalizeComponentTextEdit } from "../components/text-edits";
import { parseDcHtmlDocument } from "../html/dc-document";
import { placeholderTextElement } from "../text/placeholder";
import { quoteScriptString } from "../code/script-literals";
import { relocateSelectedTextElement } from "../model/selection-relocation";
import { relocateTextEditTarget } from "../model/selection-relocation";
import { sanitizePastedHtml } from "../clipboard/html-sanitization";
import { selectionReadyAnnouncement } from "../accessibility/announcements";
import { setPickerSelection } from "../picker/bridge";
import { tokenizeScriptLiterals } from "../code/script-literals";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { validateAttributeEdit } from "../attribute-validation";

/** 画板里的文字编辑提交时运行：按目标类型把新文字写回作品（普通元素文字、组件实例的属性值或脚本里的字符串字面量），超长或已失效时提示并放弃，然后推送实时模型、标脏、播报并恢复选中。 */
export function commitFinishedTextEdit(deps: { readonly dcPropsRef: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onTextEditEndedRef: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value: Dynamic; readonly value101: Dynamic; readonly value103: Dynamic; readonly value105: Dynamic; readonly value107: Dynamic; readonly value108: Dynamic; readonly value3: Dynamic; readonly value38: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value52: Dynamic; readonly value53: Dynamic; readonly value54: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic; readonly value68: Dynamic; readonly webviewRef: Dynamic }, edit?: Dynamic): Dynamic {
        edit.restarted !== true &&
          (deps.webviewRef.current?.blur(),
          (document as Dynamic).hasFocus() && (window as Dynamic).focus(),
          deps.onTextEditEndedRef.current?.());
        let announcementFor: Dynamic = (announcement?: Dynamic): Dynamic =>
          edit.restarted === true
            ? selectionReadyAnnouncement(announcement)
            : announcement;
        if (
          deps.readOnlyRef.current ||
          (edit.name || deps.rootName) !== deps.rootName ||
          (edit.html != null && typeof edit.html != "string") ||
          (edit.text != null && typeof edit.text != "string")
        )
          return;
        let docState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!docState) return;
        let templateTextValues: Dynamic = edit.importTarget
            ? collectTemplateTextValues(
                tokenizeScriptLiterals(
                  docState.pendingScript ??
                    parseDcHtmlDocument(docState.src)?.js ??
                    "",
                ),
                deps.dcPropsRef.current,
              )
            : null,
          { importTarget: importTarget, text: editText }: Dynamic = edit,
          owesSync: Dynamic = deps.value38.owes(),
          isNewBox: Dynamic = deps.value38.newBox() === edit.tid,
          { into: targetModel, tid: targetTid }: Dynamic = relocateTextEditTarget(
            deps.value38.shown(),
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
              (deps.value108.current = true),
              (deps.value54.current = true),
              deps.value68());
          },
          currentTextSelection: Dynamic = (): Dynamic => {
            let selection: Dynamic = owesSync ? deps.value52() : deps.value49.current;
            return selection?.name === deps.rootName &&
              selection.tids.includes(edit.tid)
              ? selection
              : null;
          },
          reselectAfterEdit: Dynamic = (): Dynamic => {
            let selection: Dynamic = currentTextSelection(),
              previewFrame: Dynamic = deps.value67();
            selection &&
              previewFrame &&
              setTimeout((): Dynamic => {
                (!owesSync || deps.value53(selection.name, selection.tids)) &&
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
            selection && deps.value105(deps.rootName, [...selection.tids]);
          };
        if (templateTextValues) {
          let importEdit: Dynamic = normalizeComponentTextEdit(
            edit.importTarget,
            edit.text,
            targetModel.importTextTargets(edit.tid, templateTextValues),
          );
          if (importEdit.kind === "drop" || importEdit.kind === "noop") return;
          if (importEdit.kind !== "commit") {
            deps.showToast(
              importEdit.kind === "toolong"
                ? uiMessage("inspector.session.tooMuchTextTryFewer")
                : uiMessage("inspector.session.yourWordsWerenTKept"),
            );
            deps.incrementSessionEpoch();
            return;
          }
          let { key: importKey, text: importText }: Dynamic = importEdit;
          deps.value101(
            deps.rootName,
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
          deps.value66.current = deps.rootName;
          deps.pushLiveModel(deps.rootName, docState);
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          deps.incrementSessionEpoch();
          announce(
            announcementFor(AccessibilityAnnouncementsLabel_17),
          );
          let selection: Dynamic = currentTextSelection(),
            previewFrame: Dynamic = deps.value67();
          selection &&
            previewFrame &&
            setTimeout((): Dynamic => {
              deps.value53(selection.name, selection.tids) &&
                setPickerSelection(
                  previewFrame,
                  selection.tids,
                  selection.name,
                );
            }, 60);
          selection && deps.value105(deps.rootName, [...selection.tids]);
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
          let current: Dynamic = deps.dcPropsRef.current,
            propEdit: Dynamic = normalizeComponentPropEdit(
              edit.propTarget,
              edit.text,
              current.propsMeta,
              current.values,
            );
          if (propEdit.kind === "drop" || propEdit.kind === "noop") return;
          if (propEdit.kind === "toolong") {
            deps.showToast(uiMessage("inspector.session.thatTextIsTooLong"));
            deps.incrementSessionEpoch();
            return;
          }
          if (propEdit.kind === "refuse") {
            deps.showToast(
              uiMessage("inspector.session.theComponentSPropsChanged"),
            );
            deps.incrementSessionEpoch();
            return;
          }
          let { prop: propName, text: propText }: Dynamic = propEdit,
            isFirstPropEdit: Dynamic = !Object.hasOwn(
              docState.pendingProps ?? {},
              propName,
            );
          isFirstPropEdit &&
            (deps.value.current[propName] = Object.hasOwn(current.values, propName)
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
          deps.value103(deps.rootName, `textedit-prop-${edit.tid}`, docState, {
            kind: "prop",
            prop: propName,
            before: isFirstPropEdit ? undefined : docState.pendingProps?.[propName],
            after: propText,
            base: docState.pendingPropsBase,
            display: edit.propTarget.value,
            ...(isFirstPropEdit
              ? {
                  liveBefore: deps.value.current[propName],
                }
              : {}),
          });
          docState.pendingProps = {
            ...docState.pendingProps,
            [propName]: propText,
          };
          deps.value66.current = deps.rootName;
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          announce(
            announcementFor(AccessibilityAnnouncementsLabel_17),
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
            deps.showToast(
              uiMessage("inspector.session.theComponentSCodeChanged"),
            );
            deps.incrementSessionEpoch();
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
          deps.value103(deps.rootName, `textedit-script-${edit.tid}`, docState, {
            kind: "script",
            before: docState.pendingScript,
            after: newScript,
            base: docState.pendingScriptBase,
          });
          docState.pendingScript = newScript;
          deps.value66.current = deps.rootName;
          emitEditorEvent("dc-update", {
            name: deps.rootName,
            path: docState.path,
            kind: "js",
            content: newScript,
            streaming: false,
            viewportKey: "dc-model",
          });
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          deps.incrementSessionEpoch();
          announce(
            announcementFor(AccessibilityAnnouncementsLabel_17),
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
            deps.value107.current,
          ) === edit.tid;
        deps.value107.current === edit.tid && (deps.value107.current = null);
        if (isPlaceholder && isEmpty) {
          deps.value101(deps.rootName, `textedit-${edit.tid}`, docState);
          docState.model.removeElement(edit.tid);
          docState.model = docState.model.rebuild(docState.model.serialize());
          owesSync && (deps.value54.current = true);
          deps.value66.current = deps.rootName;
          deps.pushLiveModel(deps.rootName, docState);
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          let previewFrame: Dynamic = deps.value67();
          previewFrame && setPickerSelection(previewFrame, null, null);
          deps.value50.current++;
          deps.value3(null);
          deps.incrementSessionEpoch();
          announce(
            announcementFor(AccessibilityAnnouncementsLabel_23),
          );
          return;
        }
        let hasHtmlMarkup: Dynamic = /<[a-z][\s\S]*>/i.test(cleanHtml);
        if (!hasHtmlMarkup && newPlainText === currentText) {
          deps.pushLiveModel(deps.rootName, docState);
          reselectAfterEdit();
          return;
        }
        deps.value101(deps.rootName, `textedit-${edit.tid}`, docState);
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
              ((deps.value54.current = true),
              newLinkTid == null &&
                isOtherSelection(
                  deps.value52(),
                  deps.rootName,
                  edit.tid,
                ) &&
                deps.value68()))
          : docState.model.setText(edit.tid, newPlainText);
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, docState);
        deps.markModelDirty(deps.rootName, {
          now: true,
        });
        deps.incrementSessionEpoch();
        announce(
          announcementFor(AccessibilityAnnouncementsLabel_17),
        );
        if (newLinkTid != null) {
          let linkTid: Dynamic = newLinkTid,
            previewFrame: Dynamic = deps.value67();
          previewFrame &&
            setTimeout((): Dynamic => {
              (!owesSync || deps.value53(deps.rootName, [linkTid])) &&
                setPickerSelection(
                  previewFrame,
                  [linkTid],
                  deps.rootName,
                );
            }, 60);
          deps.value105(deps.rootName, [linkTid], "a", 1);
          return;
        }
        reselectAndHighlight();
      }

/** 链接编辑结束时运行：结束画板内的文字编辑后，链接地址为空就拆掉 <a> 保留其内容，否则校验并改写 href，记录撤销、推送实时模型并重新选中；失败时提示重试。 */
export async function commitLinkEditResult(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onTextEditEndedRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value108: Dynamic; readonly value196: Dynamic; readonly value3: Dynamic; readonly value38: Dynamic; readonly value50: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic; readonly value8: Dynamic; readonly webviewRef: Dynamic }, tid?: Dynamic,
        templateName?: Dynamic,
        href?: Dynamic,
        source?: Dynamic): Promise<Dynamic> {
        if ((templateName || deps.rootName) !== deps.rootName) {
          let frameForCancel: Dynamic = deps.value67();
          frameForCancel && cancelPickerLinkEdit(frameForCancel);
          return;
        }
        let previewFrame: Dynamic = deps.value67(),
          resolvedTid: Dynamic = tid,
          shownBox: Dynamic = deps.value38.shown();
        deps.value108.current = false;
        previewFrame &&
          (await deps.value196.current(undefined, (renderedState?: Dynamic): Dynamic => {
            let latestModel: Dynamic = deps.modelRef.current.state(deps.rootName)?.model;
            latestModel &&
              source === "frame" &&
              (resolvedTid = relocateSelectedTextElement(
                deps.value38.shown() ?? shownBox,
                latestModel,
                tid,
                renderedState,
              ));
          }),
          deps.webviewRef.current?.blur(),
          (window as Dynamic).focus(),
          deps.onTextEditEndedRef.current?.());
        let docState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (deps.value108.current ? source === "model" : resolvedTid === null) {
          deps.showToast(
            href == null
              ? uiMessage("inspector.session.linkNotRemovedTryAgain")
              : uiMessage("inspector.session.linkNotChangedTryAgain"),
          );
          return;
        }
        deps.value108.current || (tid = resolvedTid);
        if (
          !docState ||
          !docState.model.element(tid) ||
          docState.model.tagName(tid) !== "a"
        )
          return;
        if (href == null) {
          let redo: Dynamic = docState.redo,
            undoEntry: Dynamic = deps.value101(
              deps.rootName,
              `link-unwrap-${Date.now()}`,
              docState,
            ),
            unwrappedElements: Dynamic = docState.model.unwrapElement(tid);
          if (!unwrappedElements) {
            deps.value102(docState, undoEntry, redo);
            return;
          }
          docState.model.restamp();
          deps.value66.current = deps.rootName;
          deps.pushLiveModel(deps.rootName, docState);
          deps.markModelDirty(deps.rootName);
          deps.incrementSessionEpoch();
          let unwrappedTids: Dynamic = unwrappedElements
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
            )
            .filter((tidNumber?: Dynamic): Dynamic => tidNumber >= 0);
          unwrappedTids.length > 0
            ? deps.value105(deps.rootName, unwrappedTids)
            : (previewFrame &&
                setPickerSelection(previewFrame, null, null),
              deps.value50.current++,
              deps.value3(null));
          deps.value8(`${docState.path}: removed link (kept content)`);
          return;
        }
        let hrefEdit: Dynamic = validateAttributeEdit(
          "@href",
          href,
          [docState.model.tagName(tid)],
        );
        if (!hrefEdit.ok) {
          deps.showToast(hrefEdit.message);
          return;
        }
        deps.value101(deps.rootName, `link-href-${tid}`, docState);
        docState.model.setAttribute(tid, "href", hrefEdit.value);
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, docState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        deps.value105(deps.rootName, [tid], "a", 1);
        previewFrame &&
          setTimeout(
            (): Dynamic =>
              setPickerSelection(previewFrame, [tid], deps.rootName),
            120,
          );
        deps.value8(`${docState.path}: set link destination ${hrefEdit.value}`);
      }

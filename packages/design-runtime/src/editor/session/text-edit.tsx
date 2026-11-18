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
export function commitFinishedTextEdit(deps: { readonly dcPropsRef: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onTextEditEndedRef: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value: Dynamic; readonly value101: Dynamic; readonly value103: Dynamic; readonly value105: Dynamic; readonly value107: Dynamic; readonly value108: Dynamic; readonly value3: Dynamic; readonly value38: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value52: Dynamic; readonly value53: Dynamic; readonly value54: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic; readonly value68: Dynamic; readonly webviewRef: Dynamic }, input?: Dynamic): Dynamic {
        input.restarted !== true &&
          (deps.webviewRef.current?.blur(),
          (document as Dynamic).hasFocus() && (window as Dynamic).focus(),
          deps.onTextEditEndedRef.current?.());
        let callback7: Dynamic = (input2?: Dynamic): Dynamic =>
          input.restarted === true
            ? selectionReadyAnnouncement(input2)
            : input2;
        if (
          deps.readOnlyRef.current ||
          (input.name || deps.rootName) !== deps.rootName ||
          (input.html != null && typeof input.html != "string") ||
          (input.text != null && typeof input.text != "string")
        )
          return;
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value307) return;
        let value308: Dynamic = input.importTarget
            ? collectTemplateTextValues(
                tokenizeScriptLiterals(
                  value307.pendingScript ??
                    parseDcHtmlDocument(value307.src)?.js ??
                    "",
                ),
                deps.dcPropsRef.current,
              )
            : null,
          { importTarget: value309, text: value310 }: Dynamic = input,
          value311: Dynamic = deps.value38.owes(),
          value312: Dynamic = deps.value38.newBox() === input.tid,
          { into: value313, tid: value314 }: Dynamic = relocateTextEditTarget(
            deps.value38.shown(),
            value307.model,
            input.tid,
            value308
              ? (input2?: Dynamic, options?: Dynamic): Dynamic =>
                  normalizeComponentTextEdit(
                    value309,
                    value310,
                    input2.importTextTargets(options, value308),
                  ).kind === "commit"
              : undefined,
          );
        input = {
          ...input,
          tid: value314,
        };
        if (!value313.element(input.tid)) return;
        let callback8: Dynamic = (): Dynamic => {
            value313 !== value307.model &&
              ((value307.model = value307.model.rebuild(
                value313.serialize(),
              )),
              (deps.value108.current = true),
              (deps.value54.current = true),
              deps.value68());
          },
          callback9: Dynamic = (): Dynamic => {
            let value323: Dynamic = value311 ? deps.value52() : deps.value49.current;
            return value323?.name === deps.rootName &&
              value323.tids.includes(input.tid)
              ? value323
              : null;
          },
          callback10: Dynamic = (): Dynamic => {
            let value323: Dynamic = callback9(),
              value324: Dynamic = deps.value67();
            value323 &&
              value324 &&
              setTimeout((): Dynamic => {
                (!value311 || deps.value53(value323.name, value323.tids)) &&
                  setPickerSelection(
                    value324,
                    value323.tids,
                    value323.name,
                  );
              }, 60);
          },
          callback11: Dynamic = (): Dynamic => {
            callback10();
            let value323: Dynamic = callback9();
            value323 && deps.value105(deps.rootName, [...value323.tids]);
          };
        if (value308) {
          let value323: Dynamic = normalizeComponentTextEdit(
            input.importTarget,
            input.text,
            value313.importTextTargets(input.tid, value308),
          );
          if (value323.kind === "drop" || value323.kind === "noop") return;
          if (value323.kind !== "commit") {
            deps.showToast(
              value323.kind === "toolong"
                ? uiMessage("inspector.session.tooMuchTextTryFewer")
                : uiMessage("inspector.session.yourWordsWerenTKept"),
            );
            deps.incrementSessionEpoch();
            return;
          }
          let { key: value324, text: value325 }: Dynamic = value323;
          deps.value101(
            deps.rootName,
            `textedit-import-${input.tid}-${value324}`,
            value307,
          );
          callback8();
          value324 === "__text"
            ? value307.model.setText(input.tid, value325)
            : value307.model.setAttribute(
                input.tid,
                value324.slice(1),
                value325,
              );
          deps.value66.current = deps.rootName;
          deps.pushLiveModel(deps.rootName, value307);
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          deps.incrementSessionEpoch();
          announce(
            callback7(AccessibilityAnnouncementsLabel_17),
          );
          let value326: Dynamic = callback9(),
            value327: Dynamic = deps.value67();
          value326 &&
            value327 &&
            setTimeout((): Dynamic => {
              deps.value53(value326.name, value326.tids) &&
                setPickerSelection(
                  value327,
                  value326.tids,
                  value326.name,
                );
            }, 60);
          value326 && deps.value105(deps.rootName, [...value326.tids]);
          return;
        }
        if (
          !value313.isTextEditable(input.tid) ||
          ClipboardLayoutSnapshotsScriptStyleXmpSet.has(
            value313.tagName(input.tid) ?? "",
          )
        )
          return;
        if (input.propTarget) {
          let current: Dynamic = deps.dcPropsRef.current,
            value323: Dynamic = normalizeComponentPropEdit(
              input.propTarget,
              input.text,
              current.propsMeta,
              current.values,
            );
          if (value323.kind === "drop" || value323.kind === "noop") return;
          if (value323.kind === "toolong") {
            deps.showToast(uiMessage("inspector.session.thatTextIsTooLong"));
            deps.incrementSessionEpoch();
            return;
          }
          if (value323.kind === "refuse") {
            deps.showToast(
              uiMessage("inspector.session.theComponentSPropsChanged"),
            );
            deps.incrementSessionEpoch();
            return;
          }
          let { prop: value324, text: value325 }: Dynamic = value323,
            value326: Dynamic = !Object.hasOwn(
              value307.pendingProps ?? {},
              value324,
            );
          value326 &&
            (deps.value.current[value324] = Object.hasOwn(current.values, value324)
              ? {
                  had: true,
                  value: current.values[value324],
                }
              : {
                  had: false,
                });
          current.setProp(value324, value325);
          value307.pendingPropsBase ??=
            getDcPropsJson(value307.src) ?? "";
          deps.value103(deps.rootName, `textedit-prop-${input.tid}`, value307, {
            kind: "prop",
            prop: value324,
            before: value326 ? undefined : value307.pendingProps?.[value324],
            after: value325,
            base: value307.pendingPropsBase,
            display: input.propTarget.value,
            ...(value326
              ? {
                  liveBefore: deps.value.current[value324],
                }
              : {}),
          });
          value307.pendingProps = {
            ...value307.pendingProps,
            [value324]: value325,
          };
          deps.value66.current = deps.rootName;
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          announce(
            callback7(AccessibilityAnnouncementsLabel_17),
          );
          return;
        }
        if (input.scriptTarget) {
          let {
              start: scriptTarget,
              end: scriptTarget2,
              quote: scriptTarget3,
              value: scriptTarget4,
            }: Dynamic = input.scriptTarget,
            value323: Dynamic =
              value307.pendingScript ??
              parseDcHtmlDocument(value307.src)?.js ??
              "",
            value324: Dynamic = tokenizeScriptLiterals(
              value323,
            ).find(
              (input2?: Dynamic): Dynamic =>
                input2.start === scriptTarget && input2.end === scriptTarget2,
            );
          if (
            !value324 ||
            value324.quote !== scriptTarget3 ||
            value324.value !== scriptTarget4
          ) {
            deps.showToast(
              uiMessage("inspector.session.theComponentSCodeChanged"),
            );
            deps.incrementSessionEpoch();
            return;
          }
          let value325: Dynamic = input.text ?? "";
          if (value325 === value324.value) return;
          let value326: Dynamic =
            value323.slice(0, scriptTarget) +
            quoteScriptString(value325, scriptTarget3) +
            value323.slice(scriptTarget2);
          if (value326 === value323) return;
          value307.pendingScriptBase ??=
            parseDcHtmlDocument(value307.src)?.js ?? "";
          deps.value103(deps.rootName, `textedit-script-${input.tid}`, value307, {
            kind: "script",
            before: value307.pendingScript,
            after: value326,
            base: value307.pendingScriptBase,
          });
          value307.pendingScript = value326;
          deps.value66.current = deps.rootName;
          emitEditorEvent("dc-update", {
            name: deps.rootName,
            path: value307.path,
            kind: "js",
            content: value326,
            streaming: false,
            viewportKey: "dc-model",
          });
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          deps.incrementSessionEpoch();
          announce(
            callback7(AccessibilityAnnouncementsLabel_17),
          );
          return;
        }
        let value315: Dynamic = value313.text(input.tid),
          value316: Dynamic = input.html ?? "",
          value317: Dynamic = value316.includes("<")
            ? sanitizePastedHtml(value316)
            : value316,
          value318: Dynamic = input.text ?? "",
          value319: Dynamic =
            value318.trim() === "" &&
            !/<(img|svg|video|iframe)/i.test(value317);
        if (value319 && (value313 !== value307.model || value312)) return;
        let value320: Dynamic =
          placeholderTextElement(
            value307.model,
            deps.value107.current,
          ) === input.tid;
        deps.value107.current === input.tid && (deps.value107.current = null);
        if (value320 && value319) {
          deps.value101(deps.rootName, `textedit-${input.tid}`, value307);
          value307.model.removeElement(input.tid);
          value307.model = value307.model.rebuild(value307.model.serialize());
          value311 && (deps.value54.current = true);
          deps.value66.current = deps.rootName;
          deps.pushLiveModel(deps.rootName, value307);
          deps.markModelDirty(deps.rootName, {
            now: true,
          });
          let value323: Dynamic = deps.value67();
          value323 && setPickerSelection(value323, null, null);
          deps.value50.current++;
          deps.value3(null);
          deps.incrementSessionEpoch();
          announce(
            callback7(AccessibilityAnnouncementsLabel_23),
          );
          return;
        }
        let value321: Dynamic = /<[a-z][\s\S]*>/i.test(value317);
        if (!value321 && value318 === value315) {
          deps.pushLiveModel(deps.rootName, value307);
          callback10();
          return;
        }
        deps.value101(deps.rootName, `textedit-${input.tid}`, value307);
        callback8();
        value307.model.tagName(input.tid) === "p" &&
          /<(ul|ol|div|p|h[1-6]|blockquote|pre|table)\b/i.test(value317) &&
          value307.model.setTagName(input.tid, "div");
        let value322: Dynamic = null;
        value321 || value315 == null
          ? (value307.model.setInnerHtml(input.tid, value317),
            (value307.model = value307.model.rebuild(
              value307.model.serialize(),
            )),
            (value322 = value307.model.takeMarkerAttr(
              DcLinkNewAttribute,
              input.tid,
            )),
            value311 &&
              input.restarted !== true &&
              ((deps.value54.current = true),
              value322 == null &&
                isOtherSelection(
                  deps.value52(),
                  deps.rootName,
                  input.tid,
                ) &&
                deps.value68()))
          : value307.model.setText(input.tid, value318);
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, value307);
        deps.markModelDirty(deps.rootName, {
          now: true,
        });
        deps.incrementSessionEpoch();
        announce(
          callback7(AccessibilityAnnouncementsLabel_17),
        );
        if (value322 != null) {
          let value323: Dynamic = value322,
            value324: Dynamic = deps.value67();
          value324 &&
            setTimeout((): Dynamic => {
              (!value311 || deps.value53(deps.rootName, [value323])) &&
                setPickerSelection(
                  value324,
                  [value323],
                  deps.rootName,
                );
            }, 60);
          deps.value105(deps.rootName, [value323], "a", 1);
          return;
        }
        callback11();
      }

/** 链接编辑结束时运行：结束画板内的文字编辑后，链接地址为空就拆掉 <a> 保留其内容，否则校验并改写 href，记录撤销、推送实时模型并重新选中；失败时提示重试。 */
export async function commitLinkEditResult(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onTextEditEndedRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value108: Dynamic; readonly value196: Dynamic; readonly value3: Dynamic; readonly value38: Dynamic; readonly value50: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic; readonly value8: Dynamic; readonly webviewRef: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value307?: Dynamic): Promise<Dynamic> {
        if ((options || deps.rootName) !== deps.rootName) {
          let value313: Dynamic = deps.value67();
          value313 && cancelPickerLinkEdit(value313);
          return;
        }
        let value308: Dynamic = deps.value67(),
          value309: Dynamic = input,
          value310: Dynamic = deps.value38.shown();
        deps.value108.current = false;
        value308 &&
          (await deps.value196.current(undefined, (input2?: Dynamic): Dynamic => {
            let value313: Dynamic = deps.modelRef.current.state(deps.rootName)?.model;
            value313 &&
              value307 === "frame" &&
              (value309 = relocateSelectedTextElement(
                deps.value38.shown() ?? value310,
                value313,
                input,
                input2,
              ));
          }),
          deps.webviewRef.current?.blur(),
          (window as Dynamic).focus(),
          deps.onTextEditEndedRef.current?.());
        let value311: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (deps.value108.current ? value307 === "model" : value309 === null) {
          deps.showToast(
            context == null
              ? uiMessage("inspector.session.linkNotRemovedTryAgain")
              : uiMessage("inspector.session.linkNotChangedTryAgain"),
          );
          return;
        }
        deps.value108.current || (input = value309);
        if (
          !value311 ||
          !value311.model.element(input) ||
          value311.model.tagName(input) !== "a"
        )
          return;
        if (context == null) {
          let redo: Dynamic = value311.redo,
            value313: Dynamic = deps.value101(
              deps.rootName,
              `link-unwrap-${Date.now()}`,
              value311,
            ),
            value314: Dynamic = value311.model.unwrapElement(input);
          if (!value314) {
            deps.value102(value311, value313, redo);
            return;
          }
          value311.model.restamp();
          deps.value66.current = deps.rootName;
          deps.pushLiveModel(deps.rootName, value311);
          deps.markModelDirty(deps.rootName);
          deps.incrementSessionEpoch();
          let value315: Dynamic = value314
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
            )
            .filter((input2?: Dynamic): Dynamic => input2 >= 0);
          value315.length > 0
            ? deps.value105(deps.rootName, value315)
            : (value308 &&
                setPickerSelection(value308, null, null),
              deps.value50.current++,
              deps.value3(null));
          deps.value8(`${value311.path}: removed link (kept content)`);
          return;
        }
        let value312: Dynamic = validateAttributeEdit(
          "@href",
          context,
          [value311.model.tagName(input)],
        );
        if (!value312.ok) {
          deps.showToast(value312.message);
          return;
        }
        deps.value101(deps.rootName, `link-href-${input}`, value311);
        value311.model.setAttribute(input, "href", value312.value);
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, value311);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        deps.value105(deps.rootName, [input], "a", 1);
        value308 &&
          setTimeout(
            (): Dynamic =>
              setPickerSelection(value308, [input], deps.rootName),
            120,
          );
        deps.value8(`${value311.path}: set link destination ${value312.value}`);
      }

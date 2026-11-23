import { linkRemovedMessage } from "../accessibility/announcements";
import { DcTplAttribute } from "../html/authoring";
import { sameTidList } from "../inspector/editor";
import { contrastAffectingProperties } from "../inspector/editor";
import { MediaObjectCropTest } from "../media/object-crop";
import { SvgArrowPropertiesHeadStartHeadEndConfig } from "../svg/arrow-properties";
import { SvgArrowPropertiesNoneOpenFilledConfig } from "../svg/arrow-properties";
import { addContrastToAnnouncement } from "../accessibility/announcements";
import { announce } from "../accessibility/announcer";
import { arrowSnapshotsForPropertyChange } from "../svg/arrow-editing";
import { changeSelectedArrowHeads } from "../svg/arrow-editing";
import { firstFontFamily } from "../typography/font-family";
import { isProtectedAttribute } from "../attribute-validation";
import { knownWebFontFamily } from "../typography/font-catalog";
import { propertyEditAnnouncement } from "../accessibility/announcements";
import { restoreArrowSnapshots } from "../svg/arrow-editing";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { validateAttributeEdit } from "../attribute-validation";

interface PropertyEditDependencies {
  readonly inspector: {
    readonly resolveContrastPreview: Dynamic;
    readonly scheduleInspectorRefresh: Dynamic;
    readonly contrastGroundRef: Dynamic;
    readonly computedSelectionStyle: Dynamic;
  };
  readonly feedback: {
    readonly incrementSessionEpoch: Dynamic;
    readonly showToast: Dynamic;
    readonly cacheFeedbackLabel: Dynamic;
  };
  readonly model: {
    readonly markModelDirty: Dynamic;
    readonly modelRef: Dynamic;
    readonly pushLiveModel: Dynamic;
    readonly readOnlyRef: Dynamic;
    readonly rootName: Dynamic;
    readonly applyModelStyleChanges: Dynamic;
    readonly lastEditedTemplateRef: Dynamic;
  };
  readonly history: {
    readonly pushUndoEdit: Dynamic;
    readonly revokeUndoEdit: Dynamic;
  };
  readonly selection: {
    readonly selectElements: Dynamic;
    readonly retargetSelection: Dynamic;
    readonly setSelection: Dynamic;
    readonly selectionRef: Dynamic;
    readonly advanceSelectionSequence: Dynamic;
  };
  readonly view: {
    readonly getPreviewFrame: Dynamic;
  };
}

/** 属性面板修改单个属性时运行：对所有选中元素写入该属性（清空 href 时拆掉链接、修改箭头头部、裁剪、文字、字体等有专门处理），记录撤销、推送实时模型并播报。 */
export function applySelectionPropertyEdit(deps: PropertyEditDependencies, prop?: Dynamic, propValue?: Dynamic): Dynamic {
        let current: Dynamic = deps.selection.selectionRef.current;
        if (!current || deps.model.readOnlyRef.current || current.name !== deps.model.rootName)
          return;
        let docState: Dynamic = deps.model.modelRef.current.state(current.name);
        if (!docState) return;
        let selectedTids: Dynamic = current.tids.filter(
          (tid?: Dynamic): Dynamic =>
            docState.model.element(tid) != null,
        );
        if (selectedTids.length === 0) return;
        let lowerProp: Dynamic = prop.toLowerCase();
        if (
          (propValue == null || propValue.trim() === "") &&
          (lowerProp === "@href" || lowerProp.endsWith(":href")) &&
          selectedTids.some(
            (tid?: Dynamic): Dynamic =>
              docState.model.tagName(tid) === "a",
          )
        ) {
          let redo: Dynamic = docState.redo,
            undoEntry: Dynamic = deps.history.pushUndoEdit(
              current.name,
              `link-unwrap-${Date.now()}`,
              docState,
            ),
            unwrappedElements: Dynamic = [],
            didUnwrap: Dynamic = false;
          for (let tid of selectedTids as Dynamic) {
            if (docState.model.tagName(tid) !== "a") continue;
            let unwrapped: Dynamic = docState.model.unwrapElement(tid);
            unwrapped && (unwrappedElements.push(...unwrapped), (didUnwrap = true));
          }
          if (!didUnwrap) {
            deps.history.revokeUndoEdit(docState, undoEntry, redo);
            return;
          }
          docState.model.restamp();
          deps.model.lastEditedTemplateRef.current = current.name;
          deps.model.pushLiveModel(current.name, docState);
          deps.model.markModelDirty(current.name);
          deps.feedback.incrementSessionEpoch();
          let unwrappedTids: Dynamic = unwrappedElements
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
            )
            .filter((tidNumber?: Dynamic): Dynamic => tidNumber >= 0);
          if (unwrappedTids.length > 0) deps.selection.selectElements(current.name, unwrappedTids);
          else {
            let previewFrame: Dynamic = deps.view.getPreviewFrame();
            previewFrame && setPickerSelection(previewFrame, null, null);
            deps.selection.advanceSelectionSequence();
            deps.selection.setSelection(null);
          }
          announce(linkRemovedMessage);
          deps.feedback.cacheFeedbackLabel(
            `${docState.path}: removed link on destination clear (kept content)`,
          );
          return;
        }
        let tagNames: Dynamic = selectedTids.map(
          (tid?: Dynamic): Dynamic => docState.model.tagName(tid),
        );
        propValue != null &&
          propValue.trim() === "" &&
          isProtectedAttribute(prop, tagNames) &&
          (propValue = null);
        if (propValue != null) {
          let validation: Dynamic = validateAttributeEdit(
            prop,
            propValue,
            tagNames,
          );
          if (!validation.ok) {
            deps.feedback.showToast(validation.message);
            return;
          }
          propValue = validation.value;
        }
        if (prop === "__headStart" || prop === "__headEnd") {
          if (
            propValue !== "none" &&
            propValue !== "open" &&
            propValue !== "filled"
          )
            return;
          let redo: Dynamic = docState.redo,
            headUndoEntry: Dynamic = deps.history.pushUndoEdit(current.name, prop, docState),
            previousElements: Dynamic = current.tids.map(
              (tid?: Dynamic): Dynamic => docState.model.element(tid),
            ),
            headChange: Dynamic = changeSelectedArrowHeads(
              docState.model,
              selectedTids,
              prop === "__headStart" ? "start" : "end",
              propValue,
              selectedTids.length === 1
                ? {
                    stroke: deps.inspector.computedSelectionStyle.stroke,
                    strokeWidth: deps.inspector.computedSelectionStyle.strokeWidth,
                  }
                : {},
            );
          if (!headChange) {
            deps.history.revokeUndoEdit(docState, headUndoEntry, redo);
            return;
          }
          let newTids: Dynamic = previousElements
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(
                  (
                    element &&
                    (headChange.replaced.get(element) ?? element)
                  )?.getAttribute(DcTplAttribute) ?? "-1",
                  10,
                ),
            )
            .filter((tidNumber?: Dynamic): Dynamic => tidNumber >= 0);
          deps.model.lastEditedTemplateRef.current = current.name;
          deps.model.pushLiveModel(current.name, docState);
          deps.model.markModelDirty(current.name);
          deps.feedback.incrementSessionEpoch();
          deps.selection.retargetSelection(docState, newTids);
          deps.selection.selectElements(current.name, newTids);
          let headPreviewFrame: Dynamic = deps.view.getPreviewFrame();
          headPreviewFrame &&
            setTimeout((): Dynamic => {
              let currentSelection: Dynamic = deps.selection.selectionRef.current;
              currentSelection?.name === current.name &&
                sameTidList(currentSelection.tids, newTids) &&
                setPickerSelection(
                  headPreviewFrame,
                  newTids,
                  current.name,
                );
            }, 60);
          let headAnnouncement: Dynamic = `${SvgArrowPropertiesHeadStartHeadEndConfig[prop]} arrowhead: ${SvgArrowPropertiesNoneOpenFilledConfig[propValue]}`;
          announce(headAnnouncement);
          deps.feedback.cacheFeedbackLabel(
            `${docState.path}: set ${SvgArrowPropertiesHeadStartHeadEndConfig[prop]} arrowhead to ${SvgArrowPropertiesNoneOpenFilledConfig[propValue]} on ${headChange.changed > 1 ? `${headChange.changed} lines or arrows` : uiMessage("inspector.session.aLineOrArrow")}`,
            `${docState.path}:${prop}:${selectedTids.join(",")}`,
          );
          return;
        }
        deps.history.pushUndoEdit(current.name, prop, docState);
        let arrowSnapshots: Dynamic = arrowSnapshotsForPropertyChange(
            docState.model,
            selectedTids,
            [prop],
          ),
          didChange: Dynamic = false,
          cropResetTids: Dynamic =
            (prop === "object-fit" && propValue !== "cover") ||
            prop === "@src"
              ? selectedTids.filter(
                  (tid?: Dynamic): Dynamic =>
                    MediaObjectCropTest(
                      (styleProp?: Dynamic): Dynamic =>
                        docState.model.inlineStyleValue(tid, styleProp),
                    ),
                )
              : [];
        for (let tid of selectedTids as Dynamic)
          if (prop === "__text")
            didChange = docState.model.setText(tid, propValue ?? "") || didChange;
          else if (prop.startsWith("@")) {
            let didSetAttribute: Dynamic = docState.model.setAttribute(
              tid,
              prop.slice(1),
              propValue,
            );
            if (didSetAttribute && cropResetTids.includes(tid))
              for (let cropProp of [
                "object-view-box",
                "object-position",
              ] as Dynamic)
                docState.model.setStyleProperty(tid, cropProp, null);
            didChange = didSetAttribute || didChange;
          } else if (
            ((didChange =
              docState.model.setStyleProperty(tid, prop, propValue) ||
              didChange),
            cropResetTids.includes(tid))
          )
            for (let cropProp of [
              "object-view-box",
              "object-position",
            ] as Dynamic)
              docState.model.setStyleProperty(tid, cropProp, null);
        if (!didChange) return;
        let restoredArrows: Dynamic = restoreArrowSnapshots(
            docState.model,
            arrowSnapshots,
          ),
          webFontFamily: Dynamic =
            prop === "font-family" && propValue
              ? knownWebFontFamily(
                  firstFontFamily(propValue),
                )
              : undefined,
          addedWebfontLink: Dynamic =
            webFontFamily !== undefined &&
            docState.model.ensureWebfontLink(webFontFamily);
        addedWebfontLink && docState.model.restamp();
        let tagName: Dynamic =
            docState.model.tagName(selectedTids[0]) ?? "element",
          targetLabel: Dynamic =
            selectedTids.length > 1
              ? `${selectedTids.length}\xD7 ${tagName}`
              : tagName;
        deps.model.applyModelStyleChanges(
          current,
          docState,
          addedWebfontLink || restoredArrows || prop === "__text" || prop.startsWith("@")
            ? undefined
            : {
                [prop]: propValue,
              },
        );
        let edits: Dynamic = [
            {
              prop: prop,
              value: propValue,
            },
          ],
          previousGround: Dynamic = deps.inspector.contrastGroundRef.current,
          announceEdit: Dynamic = (inspection?: Dynamic): Dynamic =>
            announce(
              addContrastToAnnouncement(
                propertyEditAnnouncement(edits),
                edits,
                ...deps.inspector.resolveContrastPreview(inspection, previousGround),
              ),
            );
        selectedTids.length === 1 &&
        contrastAffectingProperties.has(prop)
          ? deps.inspector.scheduleInspectorRefresh(announceEdit)
          : announceEdit();
        deps.feedback.cacheFeedbackLabel(
          `${docState.path}: set ${prop}${propValue != null ? `=${propValue}` : " (unset)"} on ${targetLabel}`,
          `${docState.path}:${prop}:${selectedTids.join(",")}`,
        );
      }

interface PropertyEditsDependencies {
  readonly inspector: {
    readonly resolveContrastPreview: Dynamic;
    readonly scheduleInspectorRefresh: Dynamic;
    readonly contrastGroundRef: Dynamic;
  };
  readonly model: {
    readonly modelRef: Dynamic;
    readonly readOnlyRef: Dynamic;
    readonly rootName: Dynamic;
    readonly applyModelStyleChanges: Dynamic;
  };
  readonly feedback: {
    readonly showToast: Dynamic;
    readonly cacheFeedbackLabel: Dynamic;
  };
  readonly history: {
    readonly pushUndoEdit: Dynamic;
  };
  readonly selection: {
    readonly selectionRef: Dynamic;
  };
}

/** 属性面板一次提交多项属性时运行：校验后对所有选中元素批量写入属性与样式，必要时加载网页字体，记录撤销；非实时修改会播报属性变化与文字对比度。 */
export function applySelectionPropertyEdits(deps: PropertyEditsDependencies, edits?: Dynamic, editOptions: Dynamic = {}): Dynamic {
        let current: Dynamic = deps.selection.selectionRef.current;
        if (
          !current ||
          deps.model.readOnlyRef.current ||
          current.name !== deps.model.rootName ||
          edits.length === 0
        )
          return;
        let docState: Dynamic = deps.model.modelRef.current.state(current.name);
        if (!docState) return;
        let selectedTids: Dynamic = current.tids.filter(
          (tid?: Dynamic): Dynamic => docState.model.element(tid) != null,
        );
        if (selectedTids.length === 0) return;
        let tagNames: Dynamic = selectedTids.map(
            (tid?: Dynamic): Dynamic => docState.model.tagName(tid),
          ),
          validatedEdits: Dynamic = [];
        for (let edit of edits as Dynamic) {
          if (edit.value == null) {
            validatedEdits.push(edit);
            continue;
          }
          if (
            edit.value.trim() === "" &&
            isProtectedAttribute(edit.prop, tagNames)
          ) {
            validatedEdits.push({
              prop: edit.prop,
              value: null,
            });
            continue;
          }
          let validation: Dynamic = validateAttributeEdit(
            edit.prop,
            edit.value,
            tagNames,
          );
          if (!validation.ok) {
            deps.feedback.showToast(validation.message);
            return;
          }
          validatedEdits.push({
            prop: edit.prop,
            value: validation.value,
          });
        }
        edits = validatedEdits;
        deps.history.pushUndoEdit(
          current.name,
          edits.map((edit?: Dynamic): Dynamic => edit.prop).join("+"),
          docState,
        );
        let arrowSnapshots: Dynamic = arrowSnapshotsForPropertyChange(
            docState.model,
            selectedTids,
            edits.map((edit?: Dynamic): Dynamic => edit.prop),
          ),
          didChange: Dynamic = false,
          appliedStyles: Dynamic = {};
        for (let edit of edits as Dynamic) {
          let didRemoveStyle: Dynamic = false;
          for (let tid of selectedTids as Dynamic)
            if (edit.prop.startsWith("@"))
              didChange =
                docState.model.setAttribute(
                  tid,
                  edit.prop.slice(1),
                  edit.value,
                ) || didChange;
            else {
              let styleBefore: Dynamic =
                edit.value == null
                  ? docState.model.inlineStyleAttr(tid)
                  : "";
              didChange =
                docState.model.setStyleProperty(
                  tid,
                  edit.prop,
                  edit.value,
                ) || didChange;
              edit.value == null &&
                docState.model.inlineStyleAttr(tid) !== styleBefore &&
                (didRemoveStyle = true);
            }
          (edit.value != null || didRemoveStyle) &&
            (appliedStyles[edit.prop] = edit.value);
        }
        if (!didChange) return;
        let restoredArrows: Dynamic = restoreArrowSnapshots(
            docState.model,
            arrowSnapshots,
          ),
          didAddWebfontLink: Dynamic = false;
        if (!editOptions.live)
          for (let edit of edits as Dynamic) {
            if (edit.prop !== "font-family" || !edit.value) continue;
            let webFontFamily: Dynamic = knownWebFontFamily(
              firstFontFamily(edit.value),
            );
            webFontFamily !== undefined &&
              docState.model.ensureWebfontLink(webFontFamily) &&
              (docState.model.restamp(), (didAddWebfontLink = true));
          }
        let tagName: Dynamic =
            docState.model.tagName(selectedTids[0]) ?? "element",
          editLabel: Dynamic = edits
            .map((edit?: Dynamic): Dynamic => edit.prop)
            .join("/"),
          canPatchInPlace: Dynamic =
            !didAddWebfontLink &&
            !restoredArrows &&
            edits.every(
              (edit?: Dynamic): Dynamic => !edit.prop.startsWith("@"),
            );
        deps.model.applyModelStyleChanges(current, docState, canPatchInPlace ? appliedStyles : undefined);
        if (!editOptions.live) {
          let previousGround: Dynamic = deps.inspector.contrastGroundRef.current,
            announceEdit: Dynamic = (inspection?: Dynamic): Dynamic =>
              announce(
                addContrastToAnnouncement(
                  propertyEditAnnouncement(edits),
                  edits,
                  ...deps.inspector.resolveContrastPreview(inspection, previousGround),
                ),
              );
          selectedTids.length === 1 &&
          edits.some(
            (edit?: Dynamic): Dynamic =>
              contrastAffectingProperties.has(edit.prop),
          )
            ? deps.inspector.scheduleInspectorRefresh(announceEdit)
            : announceEdit();
        }
        deps.feedback.cacheFeedbackLabel(
          `${docState.path}: set ${editLabel} on ${selectedTids.length > 1 ? `${selectedTids.length}\xD7 ${tagName}` : tagName}`,
          `${docState.path}:${editLabel}:${selectedTids.join(",")}`,
        );
      }


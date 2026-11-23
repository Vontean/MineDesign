import { ADrawnLineOrPathCannotMessage } from "../outline/annotations";
import { CouldnTDetachThisInstanceRightNowMessage } from "../components/detach";
import { CouldnTFindThisComponentSArtboardOnMessage } from "../components/detach";
import { CutValue } from "../accessibility/announcements";
import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { FinishEditingThisDrawingSPointsToMessage } from "../geometry/flip-elements";
import { finishCroppingToFlipMessage as cropFlipRefusal } from "../geometry/flip-elements";
import { sameTidList } from "../inspector/editor";
import { selectOneElementForPngMessage } from "../inspector/editor";
import { selectOneElementForSvgMessage } from "../inspector/editor";
import { KeyboardEditActionsCutCopyPasteConfig } from "../keyboard/edit-actions";
import { OutlineAnnotationsLabel } from "../outline/annotations";
import { PartsOfThisComponentCanTBeMessage } from "../components/detach";
import { SelectionStackingEvery } from "../selection/stacking";
import { ThisInstanceCanTBeDetachedWhereMessage } from "../components/detach";
import { ThisInstanceIsnTShownOnTheMessage } from "../components/detach";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { activeCropElement } from "../session/element-state";
import { announce } from "../accessibility/announcer";
import { canFlipSelection } from "../geometry/flip-elements";
import { canMovePositionedSelection } from "../selection/nudge";
import { commonSelectedAncestor } from "../layout/grouping";
import { detachComponentRefusal } from "../components/detach";
import { detachImportedComponent } from "../components/detach";
import { detachableComponentProps } from "../components/detach";
import { emptyArtboardDropTarget } from "../insert/drop-targets";
import { flipDirectionAnnouncement } from "../accessibility/announcements";
import { flipModelSelection } from "../geometry/flip-elements";
import { getPickerComponentScript } from "../picker/inspection";
import { groupModelElements } from "../layout/grouping";
import { importedComponentName } from "../components/detach";
import { inspectFlipSelection } from "../geometry/flip-elements";
import { inspectGroupLayout } from "../layout/grouping";
import { inspectPickerSelection } from "../picker/bridge";
import { isDetachableDcImport } from "../components/detach";
import { isEditableComponentName } from "../media/object-crop";
import { normalizeComputedStyleCarry } from "../clipboard/layout-snapshots";
import { parseDcHtmlDocument } from "../html/dc-document";
import { partialFlipMessage } from "../geometry/flip-elements";
import { promoteSvgShapeToRoot } from "../selection/element-order";
import { promotedSvgSelection } from "../selection/tree-navigation";
import { selectInstanceMessage } from "../components/detach";
import { selectedElementsInDocumentOrder } from "../selection/element-order";
import { selectedRootElementIds } from "../selection/element-order";
import { selectionDetachRefusal } from "../components/detach";
import { selectionUngroupRefusal } from "../layout/ungrouping";
import { setPickerSelection } from "../picker/bridge";
import { stackingAnnouncement } from "../accessibility/announcements";
import { supportsClipboardImages } from "../clipboard/png-copy";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { ungroupElementRefusal } from "../layout/ungrouping";
import { ungroupModelElement } from "../layout/ungrouping";

interface DuplicateSelectionContext {
  readonly view: {
    readonly incrementSessionEpoch: Dynamic;
    readonly getPreviewFrame: Dynamic;
  };
  readonly model: {
    readonly markModelDirty: Dynamic;
    readonly modelRef: Dynamic;
    readonly pushLiveModel: Dynamic;
    readonly readOnlyRef: Dynamic;
    readonly rootName: Dynamic;
    readonly lastEditedTemplateRef: Dynamic;
  };
  readonly history: {
    readonly pushUndoEdit: Dynamic;
    readonly revokeUndoEdit: Dynamic;
  };
  readonly selection: {
    readonly selectElements: Dynamic;
    readonly retargetSelection: Dynamic;
    readonly selectionRef: Dynamic;
    readonly notePendingHighlight: Dynamic;
  };
}

/** 按 Cmd+D 或选择“复制一份”时运行：在模型中逐个复制选中的顶层元素，记录撤销、推送实时模型并选中新副本。 */
export function duplicateSelectedModelElements(deps: DuplicateSelectionContext): Dynamic {
      let current: Dynamic = deps.selection.selectionRef.current;
      if (
        !current ||
        deps.model.readOnlyRef.current ||
        current.name !== deps.model.rootName ||
        current.tids.length === 0
      )
        return;
      let modelState: Dynamic = deps.model.modelRef.current.state(deps.model.rootName);
      if (!modelState) return;
      let rootTids: Dynamic = selectedRootElementIds(
        modelState.model,
        [
          ...new Set(
            current.tids
              .filter(
                (tid?: Dynamic): Dynamic =>
                  modelState.model.element(tid) != null,
              )
              .map(
                (tid?: Dynamic): Dynamic =>
                  promoteSvgShapeToRoot(modelState.model, tid),
              ),
          ),
        ],
      );
      if (rootTids.length === 0) return;
      let redo: Dynamic = modelState.redo,
        undoMark: Dynamic = deps.history.pushUndoEdit(
          deps.model.rootName,
          `duplicate-${Date.now()}`,
          modelState,
        ),
        duplicateElements: Dynamic = rootTids
          .map(
            (tid?: Dynamic): Dynamic =>
              modelState.model.duplicateElement(tid),
          )
          .filter((element?: Dynamic): Dynamic => element != null);
      if (duplicateElements.length === 0) {
        deps.history.revokeUndoEdit(modelState, undoMark, redo);
        return;
      }
      modelState.model.restamp();
      let duplicateTids: Dynamic = duplicateElements
        .map(
          (element?: Dynamic): Dynamic =>
            parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
        )
        .filter((tid?: Dynamic): Dynamic => tid >= 0);
      deps.model.lastEditedTemplateRef.current = deps.model.rootName;
      deps.model.pushLiveModel(deps.model.rootName, modelState);
      deps.model.markModelDirty(deps.model.rootName);
      deps.view.incrementSessionEpoch();
      if (duplicateTids.length > 0) {
        let pickerTarget: Dynamic = deps.view.getPreviewFrame(),
          pushResult: Dynamic = deps.selection.retargetSelection(modelState, duplicateTids);
        deps.selection.selectElements(deps.model.rootName, duplicateTids);
        pushResult && deps.selection.notePendingHighlight();
        pickerTarget &&
          setTimeout((): Dynamic => {
            let latestSelection: Dynamic = deps.selection.selectionRef.current;
            latestSelection?.name === deps.model.rootName &&
              sameTidList(latestSelection.tids, duplicateTids) &&
              setPickerSelection(pickerTarget, duplicateTids, deps.model.rootName);
          }, 60);
      }
    }

interface StructuralEditContext {
  readonly modelRef: Dynamic;
  readonly readOnlyRef: Dynamic;
  readonly rootName: Dynamic;
  readonly showToast: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly revokeUndoEdit: Dynamic;
  readonly commitStructuralEdit: Dynamic;
  readonly selectionRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
}

/** 选择“编组”时运行：检查选中元素是否同属一个可编组的父级，把它们包进一个新容器并按原有布局计算容器尺寸与定位，无法编组时提示原因。 */
export async function groupSelectedModelElements(deps: StructuralEditContext): Promise<Dynamic> {
      let current: Dynamic = deps.selectionRef.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!modelState) return;
      let orderedTids: Dynamic = selectedElementsInDocumentOrder(
          modelState.model,
          selectedRootElementIds(modelState.model, [
            ...new Set(
              current.tids.map(
                (tid?: Dynamic): Dynamic =>
                  promoteSvgShapeToRoot(modelState.model, tid),
              ),
            ),
          ]),
        ),
        hasSingleParent: Dynamic =
          new Set(
            orderedTids.map(
              (tid?: Dynamic): Dynamic => modelState.model.parentTid(tid),
            ),
          ).size === 1,
        model: Dynamic = modelState.model,
        elements: Dynamic = orderedTids.map(
          (tid?: Dynamic): Dynamic => model.element(tid),
        ),
        pickerTarget: Dynamic = deps.getPreviewFrame(),
        parentTid: Dynamic = hasSingleParent
          ? modelState.model.parentTid(orderedTids[0])
          : null,
        inspections: Dynamic = pickerTarget
          ? await Promise.all(
              orderedTids.map(
                (tid?: Dynamic): Dynamic =>
                  inspectPickerSelection(
                    pickerTarget,
                    tid,
                    deps.rootName,
                    ["position", "left", "top", "width", "height"],
                  ),
              ),
            )
          : [],
        parentInspection: Dynamic =
          pickerTarget && parentTid != null
            ? await inspectPickerSelection(
                pickerTarget,
                parentTid,
                deps.rootName,
                [
                  "display",
                  "flexDirection",
                  "gap",
                  "justifyContent",
                  "alignItems",
                ],
              )
            : null,
        toCleanString: Dynamic = (text?: Dynamic): Dynamic =>
          (typeof text == "string" ? text : "").replace(/"/g, "'"),
        carriedStyle: Dynamic = normalizeComputedStyleCarry({
          display: toCleanString(parentInspection?.computed.display),
          "flex-direction": toCleanString(parentInspection?.computed.flexDirection),
          gap: toCleanString(parentInspection?.computed.gap),
          "justify-content": toCleanString(parentInspection?.computed.justifyContent),
          "align-items": toCleanString(parentInspection?.computed.alignItems),
        }),
        parentDisplay: Dynamic = carriedStyle.display ?? "",
        parentLayoutStyle: Dynamic = parentDisplay.includes("flex")
          ? `; display: ${parentDisplay}; flex-direction: ${carriedStyle["flex-direction"] || "row"}; gap: ${carriedStyle.gap || "0px"}; justify-content: ${carriedStyle["justify-content"] || "flex-start"}; align-items: ${carriedStyle["align-items"] || "stretch"}`
          : "",
        toNumber: Dynamic = (text?: Dynamic): Dynamic => {
          let parsedNumber: Dynamic = parseFloat(text ?? "");
          return Number.isFinite(parsedNumber) ? parsedNumber : 0;
        },
        isOutOfFlow: Dynamic = (inspection?: Dynamic): Dynamic =>
          !!inspection &&
          (inspection.computed.position === "absolute" ||
            inspection.computed.position === "fixed");
      if (!hasSingleParent && inspections.some(isOutOfFlow)) {
        let groupLayout: Dynamic = pickerTarget
            ? await inspectGroupLayout(
                pickerTarget,
                deps.rootName,
                orderedTids,
                commonSelectedAncestor(modelState.model, orderedTids),
              )
            : null,
          latestSelection: Dynamic = deps.selectionRef.current;
        if (
          latestSelection?.name !== current.name ||
          latestSelection.tids.join() !== current.tids.join() ||
          deps.readOnlyRef.current ||
          deps.modelRef.current.state(deps.rootName) !== modelState ||
          modelState.model !== model ||
          orderedTids.some(
            (tid?: Dynamic, elementIndex?: Dynamic): Dynamic =>
              model.element(tid) !== elements[elementIndex],
          )
        )
          return;
        if (groupLayout === undefined) {
          deps.showToast(uiMessage("inspector.session.couldnTGroupTheseRight"));
          return;
        }
        let layouts: Dynamic =
          groupLayout?.filter((layout?: Dynamic): Dynamic => layout !== null) ??
          [];
        if (layouts.length !== orderedTids.length) {
          deps.showToast(uiMessage("inspector.session.canTGroupTheseElements"));
          return;
        }
        if (layouts.some((layout?: Dynamic): Dynamic => !layout.liftable)) {
          deps.showToast(uiMessage("inspector.session.listItemsAndTableCells"));
          return;
        }
        if (
          layouts.some(
            (layout?: Dynamic): Dynamic => layout.position === "fixed",
          )
        ) {
          deps.showToast(uiMessage("inspector.session.canTGroupTheseOne"));
          return;
        }
        if (layouts.some((layout?: Dynamic): Dynamic => layout.transformed)) {
          deps.showToast(
            uiMessage("inspector.session.canTGroupTheseOne2"),
          );
          return;
        }
        let savedRedo: Dynamic = modelState.redo,
          nestedUndoMark: Dynamic = deps.pushUndoEdit(
            deps.rootName,
            `group-${Date.now()}`,
            modelState,
          ),
          groupTid: Dynamic = groupModelElements(
            modelState.model,
            orderedTids,
            layouts,
          );
        if (!groupTid) {
          deps.revokeUndoEdit(modelState, nestedUndoMark, savedRedo);
          deps.showToast(uiMessage("inspector.session.canTGroupTheseElements"));
          return;
        }
        deps.commitStructuralEdit(modelState, [groupTid]);
        return;
      }
      if (
        deps.readOnlyRef.current ||
        deps.modelRef.current.state(deps.rootName) !== modelState ||
        modelState.model !== model ||
        orderedTids.some(
          (tid?: Dynamic, elementIndex?: Dynamic): Dynamic =>
            model.element(tid) !== elements[elementIndex],
        )
      ) {
        deps.readOnlyRef.current ||
          deps.showToast(uiMessage("inspector.session.couldnTGroupTheseRight"));
        return;
      }
      let isAllAbsolute: Dynamic =
          inspections.length === orderedTids.length && inspections.every(isOutOfFlow),
        redo: Dynamic = modelState.redo,
        undoMark: Dynamic = deps.pushUndoEdit(
          deps.rootName,
          `group-${Date.now()}`,
          modelState,
        ),
        wrapperHtml: Dynamic = `<div data-dc-group style="box-sizing: border-box${parentLayoutStyle}"></div>`,
        minLeft: Dynamic = 0,
        minTop: Dynamic = 0;
      if (isAllAbsolute) {
        minLeft = Math.min(
          ...inspections.map(
            (inspection?: Dynamic): Dynamic => toNumber(inspection?.computed.left),
          ),
        );
        minTop = Math.min(
          ...inspections.map(
            (inspection?: Dynamic): Dynamic => toNumber(inspection?.computed.top),
          ),
        );
        let maxRight: Dynamic = Math.max(
            ...inspections.map(
              (inspection?: Dynamic): Dynamic =>
                toNumber(inspection?.computed.left) +
                toNumber(inspection?.computed.width),
            ),
          ),
          maxBottom: Dynamic = Math.max(
            ...inspections.map(
              (inspection?: Dynamic): Dynamic =>
                toNumber(inspection?.computed.top) +
                toNumber(inspection?.computed.height),
            ),
          );
        wrapperHtml = `<div data-dc-group style="box-sizing: border-box; position: absolute; left: ${Math.round(minLeft)}px; top: ${Math.round(minTop)}px; width: ${Math.round(maxRight - minLeft)}px; height: ${Math.round(maxBottom - minTop)}px"></div>`;
      }
      let wrapperTid: Dynamic = modelState.model.wrapElements(orderedTids, wrapperHtml);
      if (!wrapperTid) {
        deps.revokeUndoEdit(modelState, undoMark, redo);
        deps.showToast(uiMessage("inspector.session.canTGroupTheseElements"));
        return;
      }
      isAllAbsolute &&
        orderedTids.forEach((tid?: Dynamic, elementIndex?: Dynamic): Dynamic => {
          let inspection: Dynamic = inspections[elementIndex];
          inspection &&
            (modelState.model.setStyleProperty(
              tid,
              "left",
              `${Math.round(toNumber(inspection.computed.left) - minLeft)}px`,
            ),
            modelState.model.setStyleProperty(
              tid,
              "top",
              `${Math.round(toNumber(inspection.computed.top) - minTop)}px`,
            ),
            modelState.model.setStyleProperty(tid, "right", null),
            modelState.model.setStyleProperty(tid, "bottom", null));
        });
      deps.commitStructuralEdit(modelState, [wrapperTid]);
    }

/** 选择“解除组件实例”时运行：确认选中的是可解除的组件实例并读取组件源文件，把实例替换为展开后的普通标记，必要时带上依赖资源，无法解除时提示原因。 */
export async function detachSelectedComponentInstances(deps: StructuralEditContext): Promise<Dynamic> {
      let current: Dynamic = deps.selectionRef.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!modelState) return;
      let model: Dynamic = modelState.model,
        orderedTids: Dynamic = selectedElementsInDocumentOrder(
          model,
          selectedRootElementIds(model, current.tids),
        ),
        detachableTids: Dynamic = orderedTids.filter(
          (tid?: Dynamic): Dynamic =>
            isDetachableDcImport(model, tid),
        );
      if (detachableTids.length === 0)
        return void deps.showToast(
          selectionDetachRefusal(model, orderedTids) ??
            selectInstanceMessage,
        );
      let elements: Dynamic = detachableTids.map(
          (tid?: Dynamic): Dynamic => model.element(tid),
        ),
        pickerTarget: Dynamic = deps.getPreviewFrame(),
        componentChecks: Dynamic = await Promise.all(
          detachableTids.map(async (tid?: Dynamic): Promise<Dynamic> => {
            let componentName: Dynamic = importedComponentName(
              model.attributes(tid),
            );
            if (
              !isEditableComponentName(componentName) ||
              componentName === deps.rootName
            )
              return {
                blocked: CouldnTFindThisComponentSArtboardOnMessage,
              };
            let outcome: Dynamic = (
                await deps.modelRef.current.entryCheck(componentName)
              ).outcome,
              componentState: Dynamic = deps.modelRef.current.state(componentName);
            if (
              !componentState ||
              componentState.path.replace(/[^/]*$/, "") !==
                modelState.path.replace(/[^/]*$/, "")
            )
              return {
                blocked: CouldnTFindThisComponentSArtboardOnMessage,
              };
            if (
              ![
                "cold",
                "fresh",
                "rebuilt",
                "self-write",
                "src-advanced",
              ].includes(outcome)
            )
              return {
                blocked: CouldnTDetachThisInstanceRightNowMessage,
              };
            let componentModel: Dynamic = componentState.model,
              componentScript: Dynamic =
                parseDcHtmlDocument(componentState.src)?.js ?? "";
            if (/componentDidMount|this\.state\b/.test(componentScript))
              return {
                blocked: PartsOfThisComponentCanTBeMessage,
              };
            let scriptInfo: Dynamic = pickerTarget
              ? await getPickerComponentScript(
                  pickerTarget,
                  componentName,
                  detachableComponentProps(
                    model.attributes(tid),
                  ),
                )
              : null;
            return scriptInfo === "missing"
              ? {
                  blocked: ThisInstanceIsnTShownOnTheMessage,
                }
              : scriptInfo === "big"
                ? {
                    blocked: PartsOfThisComponentCanTBeMessage,
                  }
                : !scriptInfo ||
                    (!scriptInfo.hasLogic && componentScript.trim() !== "") ||
                    deps.modelRef.current.state(componentName) !== componentState ||
                    componentState.model !== componentModel
                  ? {
                      blocked:
                        CouldnTDetachThisInstanceRightNowMessage,
                    }
                  : {
                      model: componentModel,
                      vals: scriptInfo.vals,
                      held: scriptInfo.held,
                    };
          }),
        ),
        latestSelection: Dynamic = deps.selectionRef.current;
      if (
        latestSelection?.name !== current.name ||
        latestSelection.tids.join() !== current.tids.join() ||
        deps.readOnlyRef.current ||
        deps.modelRef.current.state(deps.rootName) !== modelState ||
        modelState.model !== model ||
        detachableTids.some(
          (tid?: Dynamic, elementIndex?: Dynamic): Dynamic =>
            model.element(tid) !== elements[elementIndex],
        )
      )
        return;
      let hasComponentChanged: Dynamic = (
        check?: Dynamic,
        tid?: Dynamic,
      ): Dynamic =>
        !("blocked" in check) &&
        deps.modelRef.current.state(
          importedComponentName(model.attributes(tid)),
        )?.model !== check.model;
      if (
        componentChecks.some(
          (check?: Dynamic, elementIndex?: Dynamic): Dynamic =>
            hasComponentChanged(check, detachableTids[elementIndex]),
        )
      )
        return void deps.showToast(
          CouldnTDetachThisInstanceRightNowMessage,
        );
      let redo: Dynamic = modelState.redo,
        undoMark: Dynamic = deps.pushUndoEdit(
          deps.rootName,
          `detach-${Date.now()}`,
          modelState,
        ),
        detachedElements: Dynamic = [],
        survivedReparseBefore: Dynamic = model.survivesReparse(),
        blockedImport: Dynamic = orderedTids.find(
          (tid?: Dynamic): Dynamic =>
            model.tagName(tid) === "dc-import" &&
            !isDetachableDcImport(model, tid),
        ),
        firstRefusal: Dynamic =
          blockedImport != null
            ? detachComponentRefusal(model, blockedImport)
            : undefined;
      detachableTids.forEach((tid?: Dynamic, elementIndex?: Dynamic): Dynamic => {
        let check: Dynamic = componentChecks[elementIndex],
          detachResult: Dynamic =
            "blocked" in check
              ? check
              : detachImportedComponent(model, tid, check),
          insertedElements: Dynamic =
            detachResult.blocked === undefined
              ? model.insertHtml(detachResult.html, tid, "before")
              : null;
        if (detachResult.blocked !== undefined || !insertedElements) {
          firstRefusal ??=
            detachResult.blocked ??
            CouldnTDetachThisInstanceRightNowMessage;
          return;
        }
        let breaksReparse: Dynamic = survivedReparseBefore && !model.survivesReparse();
        if (breaksReparse || !model.carryHelmet(detachResult.assets)) {
          for (let element of insertedElements as Dynamic) element.remove();
          firstRefusal ??= breaksReparse
            ? ThisInstanceCanTBeDetachedWhereMessage
            : PartsOfThisComponentCanTBeMessage;
          return;
        }
        model.removeElement(tid);
        detachResult.atomics && model.ensureHelmetAtomics();
        detachedElements.push(...insertedElements);
      });
      firstRefusal !== undefined &&
        deps.showToast(
          detachedElements.length === 0
            ? firstRefusal
            : `${firstRefusal.replace(/\.?$/, ".")} ${detachedElements.length} of ${orderedTids.filter((tid?: Dynamic): Dynamic => model.tagName(tid) === "dc-import").length} instances ${detachedElements.length === 1 ? "was" : "were"} detached.`,
        );
      if (detachedElements.length === 0) {
        deps.revokeUndoEdit(modelState, undoMark, redo);
        return;
      }
      deps.commitStructuralEdit(
        modelState,
        detachedElements,
        detachedElements.length === 1
          ? uiMessage("inspector.session.detachedAComponentInstanceInto")
          : `detached ${detachedElements.length} component instances into plain markup`,
      );
    }

/** 选择“取消编组”时运行：检查选中的容器可以拆开，把子元素提升到父级并移除容器，记录撤销；无法取消编组时提示。 */
export async function ungroupSelectedModelElements(deps: StructuralEditContext): Promise<Dynamic> {
      let current: Dynamic = deps.selectionRef.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!modelState) return;
      let model: Dynamic = modelState.model,
        refusal: Dynamic = selectionUngroupRefusal(
          model,
          current.tids,
        );
      if (refusal !== undefined)
        return void deps.showToast(
          refusal.endsWith(".") ? refusal : refusal + ".",
        );
      let ungroupableTids: Dynamic = selectedRootElementIds(
          model,
          current.tids,
        ).filter(
          (tid?: Dynamic): Dynamic =>
            ungroupElementRefusal(model, tid) === undefined,
        ),
        elementPairs: Dynamic = ungroupableTids
          .flatMap(
            (tid?: Dynamic): Dynamic => [tid, ...model.childTids(tid)],
          )
          .map((tid?: Dynamic): Dynamic => [tid, model.element(tid)]),
        pickerTarget: Dynamic = deps.getPreviewFrame(),
        childLayouts: Dynamic = await Promise.all(
          ungroupableTids.map(async (tid?: Dynamic): Promise<Dynamic> => {
            let childTids: Dynamic = model.childTids(tid),
              layouts: Dynamic =
                pickerTarget && childTids.length > 0
                  ? await inspectGroupLayout(
                      pickerTarget,
                      deps.rootName,
                      childTids,
                      commonSelectedAncestor(model, [tid]),
                      false,
                    )
                  : null;
            return layouts === undefined
              ? undefined
              : new Map(
                  childTids.flatMap(
                    (childTid?: Dynamic, elementIndex?: Dynamic): Dynamic =>
                      layouts?.[elementIndex]
                        ? [[childTid, layouts[elementIndex]]]
                        : [],
                  ),
                );
          }),
        ),
        latestSelection: Dynamic = deps.selectionRef.current;
      if (
        latestSelection?.name !== current.name ||
        latestSelection.tids.join() !== current.tids.join() ||
        deps.readOnlyRef.current ||
        deps.modelRef.current.state(deps.rootName) !== modelState ||
        modelState.model !== model ||
        elementPairs.some(
          ([tid, element]: Dynamic): Dynamic =>
            model.element(tid) !== element,
        )
      )
        return;
      if (childLayouts.some((layout?: Dynamic): Dynamic => layout === undefined)) {
        deps.showToast(uiMessage("inspector.session.couldnTUngroupTheseRight"));
        return;
      }
      let redo: Dynamic = modelState.redo,
        undoMark: Dynamic = deps.pushUndoEdit(
          deps.rootName,
          `ungroup-${Date.now()}`,
          modelState,
        ),
        resultTids: Dynamic = [],
        flag: Dynamic = false;
      ungroupableTids.forEach((tid?: Dynamic, elementIndex?: Dynamic): Dynamic => {
        let liftedTids: Dynamic = ungroupModelElement(
          model,
          tid,
          childLayouts[elementIndex] ?? null,
        );
        liftedTids && (resultTids.push(...liftedTids), (flag = true));
      });
      if (!flag) {
        deps.revokeUndoEdit(modelState, undoMark, redo);
        return;
      }
      deps.commitStructuralEdit(modelState, resultTids);
    }

interface FlipSelectionContext {
  readonly modelRef: Dynamic;
  readonly readOnlyRef: Dynamic;
  readonly rootName: Dynamic;
  readonly showToast: Dynamic;
  readonly toolRef: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly revokeUndoEdit: Dynamic;
  readonly selectElements: Dynamic;
  readonly applyModelStyleChanges: Dynamic;
  readonly selectionRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
  readonly cacheFeedbackLabel: Dynamic;
}

/** 水平或垂直翻转选中元素时运行：排除矢量编辑与裁剪中的情况，读取当前姿态后在模型中翻转，部分元素无法翻转时提示并播报翻转方向。 */
export async function flipSelectedModelElements(deps: FlipSelectionContext, axis?: Dynamic): Promise<Dynamic> {
        let current: Dynamic = deps.selectionRef.current;
        if (
          !current ||
          deps.readOnlyRef.current ||
          current.name !== deps.rootName ||
          current.tids.length === 0
        )
          return;
        let blockReason: Dynamic =
          deps.toolRef.current === "vector"
            ? FinishEditingThisDrawingSPointsToMessage
            : activeCropElement() !== null
              ? cropFlipRefusal
              : undefined;
        if (blockReason !== undefined) return void deps.showToast(blockReason + ".");
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return;
        let model: Dynamic = modelState.model,
          elements: Dynamic = current.tids.map(
            (tid?: Dynamic): Dynamic => model.element(tid),
          ),
          pickerTarget: Dynamic = deps.getPreviewFrame(),
          poses: Dynamic = await inspectFlipSelection(
            model,
            current.tids,
            (
              tid?: Dynamic,
              properties?: Dynamic,
              isAfterPaint?: Dynamic,
            ): Dynamic =>
              pickerTarget
                ? inspectPickerSelection(
                    pickerTarget,
                    tid,
                    deps.rootName,
                    properties,
                    {
                      pose: true,
                      afterPaint: isAfterPaint,
                    },
                  )
                : Promise.resolve(null),
          ),
          latestSelection: Dynamic = deps.selectionRef.current;
        if (
          deps.readOnlyRef.current ||
          deps.toolRef.current === "vector" ||
          activeCropElement() !== null ||
          latestSelection?.name !== current.name ||
          latestSelection.tids.join() !== current.tids.join() ||
          deps.modelRef.current.state(deps.rootName) !== modelState ||
          modelState.model !== model ||
          current.tids.some(
            (tid?: Dynamic, elementIndex?: Dynamic): Dynamic =>
              model.element(tid) !== elements[elementIndex],
          )
        )
          return;
        let redo: Dynamic = modelState.redo,
          undoMark: Dynamic = deps.pushUndoEdit(
            deps.rootName,
            `flip-${Date.now()}`,
            modelState,
          ),
          { flipped: flippedTids, refused: refusal }: Dynamic = flipModelSelection(model, current.tids, axis, poses);
        refusal !== undefined &&
          deps.showToast(
            partialFlipMessage(refusal, flippedTids.length > 0),
          );
        if (flippedTids.length === 0)
          return void deps.revokeUndoEdit(modelState, undoMark, redo);
        deps.applyModelStyleChanges(latestSelection, modelState);
        deps.selectElements(deps.rootName, latestSelection.tids);
        announce(flipDirectionAnnouncement(axis));
        deps.cacheFeedbackLabel(
          `${modelState.path}: flipped ${flippedTids.length > 1 ? `${flippedTids.length} elements` : (model.tagName(flippedTids[0]) ?? "element")} ${axis === "horizontal" ? "horizontally" : "vertically"}`,
        );
      }

/** 选择“包进 Flex/Grid”时运行：把选中元素包进一个自动布局容器（flex 或 grid），按元素原位置推断方向、排序与间距，记录撤销；无法包裹时提示。 */
export async function wrapSelectionInAutoLayout(deps: StructuralEditContext, layoutKind: Dynamic = "flex"): Promise<Dynamic> {
        let current: Dynamic = deps.selectionRef.current;
        if (
          !current ||
          deps.readOnlyRef.current ||
          current.name !== deps.rootName ||
          current.tids.length === 0
        )
          return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return;
        let rootTids: Dynamic = [
            ...new Set(
              current.tids.map(
                (tid?: Dynamic): Dynamic =>
                  promoteSvgShapeToRoot(modelState.model, tid),
              ),
            ),
          ],
          hasPromotedShapes: Dynamic =
            rootTids.length !== current.tids.length ||
            rootTids.some(
              (tid?: Dynamic, elementIndex?: Dynamic): Dynamic =>
                tid !== current.tids[elementIndex],
            ),
          orderedTids: Dynamic = selectedElementsInDocumentOrder(
            modelState.model,
            selectedRootElementIds(modelState.model, rootTids),
          ),
          hasSingleParent: Dynamic =
            new Set(
              orderedTids.map(
                (tid?: Dynamic): Dynamic =>
                  modelState.model.parentTid(tid),
              ),
            ).size === 1,
          singleElement: Dynamic =
            orderedTids.length === 1
              ? modelState.model.element(orderedTids[0])
              : null;
        if (
          !hasPromotedShapes &&
          singleElement &&
          modelState.model.childTids(orderedTids[0]).length > 0
        ) {
          let savedRedo: Dynamic = modelState.redo,
            nestedUndoMark: Dynamic = deps.pushUndoEdit(
              deps.rootName,
              `autolayout-${Date.now()}`,
              modelState,
            ),
            layoutStyles: Dynamic =
              layoutKind === "grid"
                ? [
                    ["display", "grid"],
                    ["grid-template-columns", "repeat(2, minmax(0, 1fr))"],
                    ["gap", "12px"],
                  ]
                : [
                    ["display", "flex"],
                    ["flex-direction", "column"],
                    ["gap", "12px"],
                  ],
            flag: Dynamic = false;
          for (let [property, styleValue] of layoutStyles as Dynamic)
            flag =
              modelState.model.setStyleProperty(
                orderedTids[0],
                property,
                styleValue,
              ) || flag;
          flag
            ? deps.commitStructuralEdit(modelState, [singleElement])
            : deps.revokeUndoEdit(modelState, nestedUndoMark, savedRedo);
          return;
        }
        let pickerTarget: Dynamic = deps.getPreviewFrame(),
          inspections: Dynamic =
            pickerTarget && hasSingleParent
              ? await Promise.all(
                  orderedTids.map(
                    (tid?: Dynamic): Dynamic =>
                      inspectPickerSelection(
                        pickerTarget,
                        tid,
                        deps.rootName,
                        ["position", "left", "top", "width", "height"],
                      ),
                  ),
                )
              : [],
          toNumber: Dynamic = (text?: Dynamic): Dynamic => {
            let parsedNumber: Dynamic = parseFloat(text ?? "");
            return Number.isFinite(parsedNumber) ? parsedNumber : 0;
          },
          hasAllInspections: Dynamic =
            inspections.length === orderedTids.length && inspections.every(Boolean),
          isAllAbsolute: Dynamic =
            hasAllInspections &&
            inspections.every(
              (inspection?: Dynamic): Dynamic =>
                inspection &&
                (inspection.computed.position === "absolute" ||
                  inspection.computed.position === "fixed"),
            ),
          direction: Dynamic = "column";
        if (hasAllInspections && isAllAbsolute) {
          let centerXs: Dynamic = inspections.map(
              (inspection?: Dynamic): Dynamic =>
                toNumber(inspection?.computed.left) +
                toNumber(inspection?.computed.width) / 2,
            ),
            centerYs: Dynamic = inspections.map(
              (inspection?: Dynamic): Dynamic =>
                toNumber(inspection?.computed.top) +
                toNumber(inspection?.computed.height) / 2,
            );
          direction =
            Math.max(...centerXs) - Math.min(...centerXs) >
            Math.max(...centerYs) - Math.min(...centerYs)
              ? "row"
              : "column";
        }
        let count: Dynamic = 2;
        if (layoutKind === "grid" && isAllAbsolute) {
          let sortedBoxes: Dynamic = orderedTids
              .map(
                (tid?: Dynamic, elementIndex?: Dynamic): Dynamic => ({
                  t: tid,
                  l: toNumber(inspections[elementIndex]?.computed.left),
                  tp: toNumber(inspections[elementIndex]?.computed.top),
                  b:
                    toNumber(inspections[elementIndex]?.computed.top) +
                    toNumber(inspections[elementIndex]?.computed.height),
                }),
              )
              .sort(
                (first?: Dynamic, second?: Dynamic): Dynamic =>
                  first.tp - second.tp,
              ),
            rowGroups: Dynamic = [],
            currentRowBottom: Dynamic = -1 / 0;
          for (let box of sortedBoxes as Dynamic)
            rowGroups.length === 0 || box.tp >= currentRowBottom
              ? (rowGroups.push([box]), (currentRowBottom = box.b))
              : (rowGroups[rowGroups.length - 1].push(box),
                (currentRowBottom = Math.max(currentRowBottom, box.b)));
          count = Math.max(
            1,
            ...rowGroups.map((row?: Dynamic): Dynamic => row.length),
          );
        }
        let redo: Dynamic = modelState.redo,
          undoMark: Dynamic = deps.pushUndoEdit(
            deps.rootName,
            `autolayout-${Date.now()}`,
            modelState,
          ),
          layoutCss: Dynamic =
            layoutKind === "grid"
              ? `display: grid; grid-template-columns: repeat(${count}, minmax(0, 1fr)); gap: 12px`
              : `display: flex; flex-direction: ${direction}; gap: 12px`,
          wrapperHtml: Dynamic = `<div style="box-sizing: border-box; ${layoutCss}"></div>`;
        if (isAllAbsolute) {
          let minLeft: Dynamic = Math.min(
              ...inspections.map(
                (inspection?: Dynamic): Dynamic =>
                  toNumber(inspection?.computed.left),
              ),
            ),
            minTop: Dynamic = Math.min(
              ...inspections.map(
                (inspection?: Dynamic): Dynamic =>
                  toNumber(inspection?.computed.top),
              ),
            );
          wrapperHtml = `<div style="box-sizing: border-box; position: absolute; left: ${Math.round(minLeft)}px; top: ${Math.round(minTop)}px; ${layoutCss}"></div>`;
        }
        let wrapperTid: Dynamic = modelState.model.wrapElements(
          orderedTids,
          wrapperHtml,
        );
        if (!wrapperTid) {
          deps.revokeUndoEdit(modelState, undoMark, redo);
          deps.showToast(uiMessage("inspector.session.canTAutoLayoutThese"));
          return;
        }
        for (let tid of orderedTids as Dynamic) {
          modelState.model.setStyleProperty(tid, "position", null);
          modelState.model.setStyleProperty(tid, "left", null);
          modelState.model.setStyleProperty(tid, "top", null);
          modelState.model.setStyleProperty(tid, "right", null);
          modelState.model.setStyleProperty(tid, "bottom", null);
        }
        deps.commitStructuralEdit(modelState, [wrapperTid]);
      }

interface ElementContextActionsDependencies {
  readonly canvasTools: Dynamic;
  readonly insertAtPoint: Dynamic;
  readonly modelRef: Dynamic;
  readonly readOnly: Dynamic;
  readonly rootName: Dynamic;
  readonly toolRef: Dynamic;
  readonly deleteSelectionAndAnnounce: Dynamic;
  readonly deleteSelection: Dynamic;
  readonly copySelectionHtml: Dynamic;
  readonly pasteClipboardElements: Dynamic;
  readonly pasteElementsAtPoint: Dynamic;
  readonly copySelectionAsPng: Dynamic;
  readonly copySelectionAsSvg: Dynamic;
  readonly duplicateSelection: Dynamic;
  readonly reorderSelection: Dynamic;
  readonly flipSelection: Dynamic;
  readonly groupSelection: Dynamic;
  readonly detachSelection: Dynamic;
  readonly ungroupSelection: Dynamic;
  readonly applyAutoLayoutToSelection: Dynamic;
  readonly selectionRef: Dynamic;
  readonly areDownloadsWithheld: Dynamic;
  readonly isClipboardFeatureEnabled: Dynamic;
}

/** 打开选中元素的右键菜单时运行：按只读、选中类型与可用能力生成菜单项（层级前后移动、剪切复制、复制为 PNG/SVG、粘贴、复制一份、编组与取消编组、翻转、解除实例、包进 Flex/Grid、删除）及其禁用原因。 */
export function buildElementContextActions(deps: ElementContextActionsDependencies, contextTid?: Dynamic, clickPoint?: Dynamic): Dynamic {
        let current: Dynamic = deps.selectionRef.current,
          hasSelection: Dynamic =
            contextTid != null ||
            (!!current &&
              current.name === deps.rootName &&
              current.tids.length > 0),
          readOnlyState: Dynamic = deps.readOnly
            ? {
                disabled: true,
                disabledReason: ViewOnlyYouCanInspectThisMessage,
              }
            : null,
          model: Dynamic = deps.modelRef.current.state(deps.rootName)?.model,
          selectedTids: Dynamic = current?.name === deps.rootName ? current.tids : [],
          targetTids: Dynamic =
            contextTid != null && !selectedTids.includes(contextTid) ? [contextTid] : selectedTids,
          detachRefusal: Dynamic =
            model && hasSelection
              ? selectionDetachRefusal(
                  model,
                  selectedElementsInDocumentOrder(
                    model,
                    selectedRootElementIds(model, [
                      ...targetTids,
                    ]),
                  ),
                )
              : undefined,
          flipRefusal: Dynamic =
            contextTid != null && !selectedTids.includes(contextTid)
              ? undefined
              : deps.toolRef.current === "vector"
                ? FinishEditingThisDrawingSPointsToMessage
                : activeCropElement() !== null
                  ? cropFlipRefusal
                  : undefined,
          noSelectionState: Dynamic = hasSelection
            ? null
            : {
                disabled: true,
                disabledReason: OutlineAnnotationsLabel,
              },
          canMove: Dynamic =
            !!model &&
            hasSelection &&
            canMovePositionedSelection(model, targetTids),
          isSoleSvgPart: Dynamic =
            !!model &&
            promotedSvgSelection(model, targetTids).promoted &&
            targetTids.every(
              (tid?: Dynamic): Dynamic =>
                model
                  .childTids(model.parentTid(tid))
                  .filter(
                    (siblingTid?: Dynamic): Dynamic =>
                      model.isOutlineRow(siblingTid) &&
                      model.tagName(siblingTid) !== "defs",
                  ).length === 1,
            ),
          stackAction: Dynamic = (direction?: Dynamic): Dynamic => ({
            get label() { return canMove ? (KeyboardEditActionsCutCopyPasteConfig[
                  direction > 0 ? "front" : "back"
                ].label) : (direction > 0 ? (uiMessage("inspector.session.moveToLast")) : (uiMessage("inspector.session.moveToFirst"))); },
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig[
                direction > 0 ? "front" : "back"
              ].shortcut,
            get disabledReason() { return !model || !hasSelection ? (undefined) : (isSoleSvgPart ? (ADrawnLineOrPathCannotMessage) : (SelectionStackingEvery(
                        model,
                        targetTids,
                        direction,
                      ) ? (canMove ? (stackingAnnouncement(
                          direction > 0 ? "front" : "back",
                          false,
                        )) : (direction > 0 ? (uiMessage("inspector.session.alreadyLast")) : (uiMessage("inspector.session.alreadyFirst")))) : (undefined))); },
            onClick: (): Dynamic => deps.reorderSelection(direction, true),
            ...noSelectionState,
            ...readOnlyState,
          }),
          editAction: Dynamic = (
            actionKey?: Dynamic,
            onClick?: Dynamic,
          ): Dynamic => ({
            label:
              KeyboardEditActionsCutCopyPasteConfig[actionKey].label,
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig[actionKey].shortcut,
            onClick: onClick,
          });
        return [
          {
            ...editAction("cut", (): Dynamic => {
              deps.copySelectionHtml() != null && deps.deleteSelectionAndAnnounce(CutValue);
            }),
            ...noSelectionState,
            ...readOnlyState,
          },
          {
            ...editAction("copy", (): Dynamic => {
              deps.copySelectionHtml();
            }),
            ...noSelectionState,
          },
          ...(deps.isClipboardFeatureEnabled && supportsClipboardImages()
            ? [
                {
                  get label() { return uiMessage("inspector.session.copyAsPNG"); },
                  disabledReason: deps.areDownloadsWithheld
                    ? DownloadsArenTAvailableToYouForMessage
                    : targetTids.length > 1
                      ? selectOneElementForPngMessage
                      : undefined,
                  onClick: (): Dynamic => deps.copySelectionAsPng(targetTids),
                  ...noSelectionState,
                },
                {
                  get label() { return uiMessage("inspector.session.copyAsSVG"); },
                  disabledReason: deps.areDownloadsWithheld
                    ? DownloadsArenTAvailableToYouForMessage
                    : targetTids.length > 1
                      ? selectOneElementForSvgMessage
                      : undefined,
                  onClick: (): Dynamic => deps.copySelectionAsSvg(targetTids),
                  ...noSelectionState,
                },
              ]
            : []),
          {
            ...editAction("paste", (): Dynamic => {
              deps.pasteClipboardElements({
                menu: true,
              });
            }),
            ...readOnlyState,
          },
          ...(deps.isClipboardFeatureEnabled &&
          clickPoint &&
          deps.insertAtPoint &&
          deps.canvasTools &&
          model &&
          emptyArtboardDropTarget(model) != null
            ? [
                {
                  get label() { return uiMessage("inspector.session.pasteHere"); },
                  onClick: (): Dynamic => {
                    deps.pasteElementsAtPoint(clickPoint);
                  },
                  ...readOnlyState,
                },
              ]
            : []),
          {
            ...editAction("duplicate", (): Dynamic => deps.duplicateSelection()),
            ...noSelectionState,
            ...readOnlyState,
          },
          {
            ...stackAction(1),
            separatorBefore: true,
          },
          stackAction(-1),
          {
            get label() { return uiMessage("inspector.session.group"); },
            hotkey: "cmd+g",
            onClick: (): Dynamic => {
              deps.groupSelection();
            },
            ...noSelectionState,
            ...readOnlyState,
          },
          {
            get label() { return uiMessage("inspector.session.ungroup"); },
            hotkey: "shift+cmd+g",
            disabledReason: model
              ? selectionUngroupRefusal(model, targetTids)
              : undefined,
            onClick: (): Dynamic => {
              deps.ungroupSelection();
            },
            ...noSelectionState,
            ...readOnlyState,
          },
          ...["horizontal", "vertical"].map(
            (axis?: Dynamic): Dynamic => ({
              get label() { return uiMessage("inspector.session.flip", { axis: String(axis) }); },
              hotkey: axis === "horizontal" ? "shift+h" : "shift+v",
              disabledReason:
                flipRefusal ??
                (model
                  ? canFlipSelection(model, targetTids, axis)
                  : undefined),
              onClick: (): Dynamic => deps.flipSelection(axis),
              ...noSelectionState,
              ...readOnlyState,
            }),
          ),
          {
            get label() { return uiMessage("inspector.session.detachInstance"); },
            separatorBefore: true,
            disabled: !model,
            ...(detachRefusal != null
              ? {
                  disabled: true,
                  disabledReason: detachRefusal,
                }
              : null),
            onClick: (): Dynamic => {
              deps.detachSelection();
            },
            ...noSelectionState,
            ...readOnlyState,
          },
          {
            get label() { return uiMessage("inspector.session.wrapInFlex"); },
            hotkey: "shift+a",
            onClick: (): Dynamic => {
              deps.applyAutoLayoutToSelection();
            },
            ...noSelectionState,
            ...readOnlyState,
          },
          {
            get label() { return uiMessage("inspector.session.wrapInGrid"); },
            onClick: (): Dynamic => {
              deps.applyAutoLayoutToSelection("grid");
            },
            ...noSelectionState,
            ...readOnlyState,
          },
          {
            ...editAction("delete", deps.deleteSelection),
            separatorBefore: true,
            danger: true,
            ...noSelectionState,
            ...readOnlyState,
          },
        ];
      }

import { LayoutMoveElementsLeftRightTopConfig } from "../layout/move-elements";
import { ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues } from "../model/model-state";
import { containsUneditableSelection } from "../selection/element-order";
import { displacedDropFollowers } from "../layout/move-elements";
import { elementMoveRefusal } from "../layout/move-elements";
import { freezeInheritedTextStyle } from "../layout/move-elements";
import { frozenInheritedStyleEdits } from "../css/edit-validation";
import { inspectPickerSelection } from "../picker/bridge";
import { markBlockedDragElements } from "../inspector/editor";
import { moveModelElement } from "../layout/move-elements";
import { restoreGroupPosition } from "../insert/targets";
import { sameParentDropGroup } from "../layout/move-elements";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";

interface PreviewElementMoveGestureDependencies {
  readonly baselineTemplateId: Dynamic;
  readonly clearScheduledTextWork: Dynamic;
  readonly maxBaselineMaps: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly gestureBaselineRef: Dynamic;
  readonly pendingMovePreviewRef: Dynamic;
}

/** 画板内拖动元素过程中（收到 movePreview 消息）运行：以手势开始时的模型为基线，在模型里预演重排、跟随元素或绝对定位后的位置并推送实时预览，被拒绝的目标会标记出来。 */
export function previewElementMoveGesture(deps: PreviewElementMoveGestureDependencies, message?: Dynamic): Dynamic {
        if ((message.name || deps.rootName) !== deps.rootName) return;
        deps.clearScheduledTextWork();
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return;
        let gesture: Dynamic = deps.gestureBaselineRef.current;
        if (!gesture || gesture.gestureKey !== message.gestureKey) {
          if (!modelState.model.element(message.tid)) return;
          for (let markerAttr of ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues as Dynamic)
            modelState.model.takeMarkerAttr(markerAttr);
          gesture = {
            gestureKey: message.gestureKey,
            baseline: modelState.model.serialize(),
            movingTid: message.tid,
            movingCurrentTid: message.tid,
            currentToBaseline: null,
            lastFlow: null,
            epoch: 0,
            maps: [],
            lastRefused: null,
            block: sameParentDropGroup(
              modelState.model,
              message.tid,
              message.group,
            ),
          };
          let savedGesture: Dynamic = deps.pendingMovePreviewRef.current;
          savedGesture &&
            savedGesture.gestureKey === message.gestureKey &&
            ((gesture.epoch = savedGesture.epoch),
            (gesture.maps = savedGesture.maps),
            (gesture.positioned = savedGesture.positioned));
          deps.pendingMovePreviewRef.current = null;
          deps.gestureBaselineRef.current = gesture;
        }
        let baselineTargetTid: Dynamic = deps.baselineTemplateId(
            message.targetTid,
            message.epoch,
          ),
          movingTid: Dynamic = gesture.movingTid;
        if (!message.absolute) {
          if (
            baselineTargetTid === movingTid ||
            (baselineTargetTid != null &&
              gesture.lastFlow !== null &&
              gesture.block?.includes(baselineTargetTid))
          )
            return;
          let lastDecision: Dynamic = gesture.lastFlow ?? gesture.lastRefused;
          if (
            lastDecision &&
            lastDecision.targetTid === baselineTargetTid &&
            lastDecision.position === message.position
          )
            return;
        }
        gesture.lastFlow = null;
        gesture.lastRefused = null;
        gesture.followerCurrent = undefined;
        modelState.model = modelState.model.rebuild(gesture.baseline);
        if (
          containsUneditableSelection(modelState.model, [
            movingTid,
          ]) ||
          (baselineTargetTid != null &&
            containsUneditableSelection(modelState.model, [
              baselineTargetTid,
            ]))
        ) {
          gesture.currentToBaseline = null;
          gesture.movingCurrentTid = movingTid;
          deps.pushLiveModel(deps.rootName, modelState);
          return;
        }
        let originalParentTid: Dynamic = modelState.model.parentTid(movingTid),
          dragParentTid: Dynamic = originalParentTid;
        for (
          ;
          dragParentTid != null &&
          /^sc-(if|for)$/.test(modelState.model.tagName(dragParentTid) ?? "");

        )
          dragParentTid = modelState.model.parentTid(dragParentTid);
        let dragBlock: Dynamic = message.absolute ? null : gesture.block,
          isAlreadyInPlace: Dynamic = dragBlock
            ? modelState.model.isBlockInPlace(
                dragBlock,
                baselineTargetTid,
                message.position,
              )
            : message.absolute === true
              ? modelState.model.isInPlace(
                  movingTid,
                  baselineTargetTid,
                  message.position,
                ) ||
                (message.position === "into" &&
                  baselineTargetTid != null &&
                  originalParentTid === baselineTargetTid)
              : modelState.model.isRenderedInPlace(
                  movingTid,
                  baselineTargetTid,
                  message.position,
                );
        if (
          !(
            !modelState.model.targetParentLocked(baselineTargetTid, message.position) &&
            (isAlreadyInPlace ||
              (dragBlock
                ? modelState.model.moveBlockRelative(
                    dragBlock,
                    baselineTargetTid,
                    message.position,
                  )
                : modelState.model.moveRelative(
                    movingTid,
                    baselineTargetTid,
                    message.position,
                  )))
          )
        ) {
          message.absolute ||
            (gesture.lastRefused = {
              targetTid: baselineTargetTid,
              position: message.position,
            });
          gesture.epoch += 1;
          gesture.maps[gesture.epoch] = null;
          gesture.epoch > deps.maxBaselineMaps &&
            (gesture.maps[gesture.epoch - deps.maxBaselineMaps] = undefined);
          modelState.model.setAttribute(
            movingTid,
            "data-dc-dragging",
            String(gesture.epoch),
          );
          dragParentTid != null &&
            modelState.model.setAttribute(
              dragParentTid,
              "data-dc-drag-parent",
              String(gesture.epoch),
            );
          markBlockedDragElements(
            modelState.model,
            gesture.block,
            movingTid,
          );
          gesture.currentToBaseline = null;
          gesture.movingCurrentTid = movingTid;
          deps.pushLiveModel(deps.rootName, modelState);
          modelState.previewBaseline = gesture.baseline;
          return;
        }
        message.absolute ||
          (gesture.lastFlow = {
            targetTid: baselineTargetTid,
            position: message.position,
          });
        if (isAlreadyInPlace && !message.absolute && gesture.epoch === 0) return;
        if (message.clearPositioning)
          for (let property of [
            "position",
            "left",
            "top",
            "right",
            "bottom",
          ] as Dynamic)
            modelState.model.setStyleProperty(movingTid, property, null);
        let followerElements: Dynamic = [];
        if (message.absolute) {
          let positionValue: Dynamic = modelState.model.inlineStyleValue(
            movingTid,
            "position",
          );
          positionValue !== "absolute" &&
            positionValue !== "fixed" &&
            modelState.model.setStyleProperty(
              movingTid,
              "position",
              "absolute",
            );
          for (let [property, styleValue] of Object.entries(
            message.absStyles ?? {},
          ) as Dynamic) {
            modelState.model.setStyleProperty(movingTid, property, styleValue);
            for (let resetProperty of (LayoutMoveElementsLeftRightTopConfig[property] ??
              []) as Dynamic)
              modelState.model.setStyleProperty(movingTid, resetProperty, null);
          }
          (message.parentNeedsPositioning ||
            gesture.positioned?.has(baselineTargetTid ?? -1)) &&
            baselineTargetTid != null &&
            !modelState.model.inlineStyleValue(baselineTargetTid, "position") &&
            (modelState.model.setStyleProperty(
              baselineTargetTid,
              "position",
              "relative",
            ),
            (gesture.positioned ??= new Set()).add(baselineTargetTid));
          followerElements = message.followers?.length
            ? displacedDropFollowers(
                modelState.model,
                message.followers,
                movingTid,
                baselineTargetTid,
                true,
              ).map((follower?: Dynamic): Dynamic => follower.el)
            : [];
        }
        if (message.flatten) {
          let staticTids: Dynamic = [
            ...(message.flatten.parentStatic === true ? [originalParentTid] : []),
            ...(Array.isArray(message.flatten.siblings)
              ? message.flatten.siblings
                  .slice(0, 200)
                  .filter(
                    (sibling?: Dynamic): Dynamic => sibling?.static === true,
                  )
                  .map((sibling?: Dynamic): Dynamic => sibling.tid)
              : []),
          ].filter(
            (tid?: Dynamic): Dynamic =>
              Number.isInteger(tid) &&
              modelState.model.element(tid) != null &&
              !modelState.model.inlineStyleValue(tid, "position"),
          );
          restoreGroupPosition(
            modelState.model,
            message.flatten,
            movingTid,
            originalParentTid,
          );
          for (let tid of staticTids as Dynamic)
            modelState.model.inlineStyleValue(tid, "position") &&
              (gesture.positioned ??= new Set()).add(tid);
        }
        if (modelState.model.parentTid(movingTid) !== originalParentTid) {
          freezeInheritedTextStyle(
            modelState.model,
            movingTid,
            message.freezeStyle,
          );
          for (let member of (message.group ?? []) as Dynamic)
            member.tid !== movingTid &&
              dragBlock?.includes(member.tid) &&
              freezeInheritedTextStyle(
                modelState.model,
                member.tid,
                member.freezeStyle,
              );
        }
        gesture.epoch += 1;
        modelState.model.setAttribute(
          movingTid,
          "data-dc-dragging",
          String(gesture.epoch),
        );
        dragParentTid != null &&
          modelState.model.setAttribute(
            dragParentTid,
            "data-dc-drag-parent",
            String(gesture.epoch),
          );
        for (let followerTid of (message.markFollowers ?? []) as Dynamic)
          followerTid !== movingTid &&
            modelState.model.element(followerTid) &&
            !containsUneditableSelection(modelState.model, [
              followerTid,
            ]) &&
            modelState.model.setAttribute(
              followerTid,
              "data-dc-drag-follower",
              String(followerTid),
            );
        markBlockedDragElements(
          modelState.model,
          gesture.block,
          movingTid,
        );
        let elementCount: Dynamic = modelState.model.elementCount(),
          baselineIndexByElement: Dynamic = new Map(),
          movingElement: Dynamic = modelState.model.element(movingTid);
        for (let index: Dynamic = 0; index < elementCount; index++) {
          let element: Dynamic = modelState.model.element(index);
          element && baselineIndexByElement.set(element, index);
        }
        modelState.model.restamp();
        let currentToBaseline: Dynamic = [];
        for (let index: Dynamic = 0; index < elementCount; index++) {
          let element: Dynamic = modelState.model.element(index);
          currentToBaseline[index] = element ? (baselineIndexByElement.get(element) ?? index) : index;
        }
        gesture.currentToBaseline = currentToBaseline;
        gesture.maps[gesture.epoch] = currentToBaseline;
        gesture.epoch > deps.maxBaselineMaps &&
          (gesture.maps[gesture.epoch - deps.maxBaselineMaps] = undefined);
        gesture.movingCurrentTid = movingElement
          ? parseInt(
              movingElement.getAttribute("data-dc-tpl") ?? String(movingTid),
              10,
            )
          : movingTid;
        gesture.followerCurrent = new Map();
        for (let followerElement of followerElements as Dynamic) {
          let baselineIndex: Dynamic = baselineIndexByElement.get(followerElement),
            currentTid: Dynamic = parseInt(
              followerElement.getAttribute("data-dc-tpl") ?? "-1",
              10,
            );
          baselineIndex !== undefined &&
            currentTid >= 0 &&
            gesture.followerCurrent.set(baselineIndex, currentTid);
        }
        deps.pushLiveModel(deps.rootName, modelState);
        modelState.previewBaseline = gesture.baseline;
      }

interface CommitElementMoveGestureDependencies {
  readonly clearScheduledTextWork: Dynamic;
  readonly epochBaselineMapping: Dynamic;
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly revokeUndoEdit: Dynamic;
  readonly selectElements: Dynamic;
  readonly scheduleSelectionRepaint: Dynamic;
  readonly settleMoveAndRecoverTemplate: Dynamic;
  readonly gestureBaselineRef: Dynamic;
  readonly frozenStyleCache: Dynamic;
  readonly pendingMovePreviewRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
}

/** 画板内拖动元素松手时（收到 move 消息）运行：把元素移动到目标位置（重排或绝对定位，含同组与跟随元素），模型拒绝时回到基线，成功则记录撤销、标脏并重新选中移动后的元素。 */
export function commitElementMoveGesture(deps: CommitElementMoveGestureDependencies, message?: Dynamic): Dynamic {
        if ((message.name || deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.settleMoveAndRecoverTemplate();
        deps.frozenStyleCache.forget(message.gestureKey ?? "");
        let gesture: Dynamic = deps.gestureBaselineRef.current,
          dragBlock: Dynamic =
            message.absolute || message.alt
              ? null
              : gesture !== null && gesture.gestureKey === message.gestureKey
                ? gesture.block
                : undefined,
          targetTid: Dynamic = message.targetTid,
          position: Dynamic = message.position,
          savedGesture: Dynamic = deps.pendingMovePreviewRef.current,
          positionedSet: Dynamic =
            gesture !== null && gesture.gestureKey === message.gestureKey
              ? gesture.positioned
              : savedGesture !== null && savedGesture.gestureKey === message.gestureKey
                ? savedGesture.positioned
                : undefined;
        deps.pendingMovePreviewRef.current = null;
        if (
          !gesture &&
          savedGesture &&
          savedGesture.gestureKey === message.gestureKey &&
          targetTid != null
        ) {
          let baselineMapping: Dynamic = deps.epochBaselineMapping(savedGesture, message.epoch);
          baselineMapping && (targetTid = baselineMapping[targetTid] ?? targetTid);
        }
        if (gesture)
          if (
            ((modelState.previewBaseline = undefined),
            !message.absolute &&
              !message.alt &&
              gesture.gestureKey === message.gestureKey)
          ) {
            let lastFlow: Dynamic = gesture.lastFlow;
            modelState.model = modelState.model.rebuild(gesture.baseline);
            deps.gestureBaselineRef.current = null;
            if (
              !lastFlow ||
              (gesture.block
                ? modelState.model.isBlockInPlace(
                    gesture.block,
                    lastFlow.targetTid,
                    lastFlow.position,
                  )
                : modelState.model.isRenderedInPlace(
                    gesture.movingTid,
                    lastFlow.targetTid,
                    lastFlow.position,
                  ))
            ) {
              deps.pushLiveModel(deps.rootName, modelState);
              gesture.epoch > 0 && deps.scheduleSelectionRepaint();
              return;
            }
            targetTid = lastFlow.targetTid;
            position = lastFlow.position;
          } else {
            if (targetTid != null) {
              let baselineMapping: Dynamic = deps.epochBaselineMapping(
                gesture,
                message.epoch,
              );
              baselineMapping && (targetTid = baselineMapping[targetTid] ?? targetTid);
            }
            modelState.model = modelState.model.rebuild(gesture.baseline);
            deps.gestureBaselineRef.current = null;
          }
        dragBlock === undefined &&
          (dragBlock = sameParentDropGroup(
            modelState.model,
            message.tid,
            message.group,
          ));
        dragBlock && dragBlock[0] !== message.tid && (dragBlock = null);
        let restoreLivePreview: Dynamic = (): Dynamic => {
            gesture &&
              (deps.pushLiveModel(deps.rootName, modelState),
              gesture.epoch > 0 && deps.scheduleSelectionRepaint());
          },
          moveRequest: Dynamic = {
            tid: message.tid,
            targetTid: targetTid,
            position: position,
            alt: message.alt === true,
            absolute: message.absolute === true,
            breakout: message.breakout,
            fixed: message.fixed,
            absStyles: message.absStyles,
            parentNeedsPositioning: message.parentNeedsPositioning,
            previewPositioned: positionedSet,
            flatten: message.flatten,
            followers: message.followers,
            group: message.group,
            block: dragBlock,
            previewBlock:
              gesture !== null &&
              gesture.gestureKey === message.gestureKey &&
              !!gesture.block,
            clearPositioning: message.clearPositioning,
            freezeStyle: message.freezeStyle,
          },
          refusal: Dynamic = elementMoveRefusal(
            modelState.model,
            moveRequest,
          );
        if (
          refusal === "loop-driven" ||
          refusal === "model-refused" ||
          refusal === "in-place"
        ) {
          deps.pushLiveModel(deps.rootName, modelState);
          gesture && gesture.epoch > 0 && deps.scheduleSelectionRepaint();
          return;
        }
        if (refusal !== null) {
          restoreLivePreview();
          return;
        }
        let redo: Dynamic = modelState.redo,
          undoMark: Dynamic = deps.pushUndoEdit(
            deps.rootName,
            message.gestureKey ?? `move-${message.tid}-${Date.now()}`,
            modelState,
          ),
          moveResult: Dynamic = moveModelElement(modelState, moveRequest);
        if (!moveResult) {
          deps.revokeUndoEdit(modelState, undoMark, redo);
          deps.pushLiveModel(deps.rootName, modelState);
          gesture && gesture.epoch > 0 && deps.scheduleSelectionRepaint();
          return;
        }
        let { newTid: newTid, groupTids: groupTids }: Dynamic = moveResult;
        deps.lastEditedTemplateRef.current = deps.rootName;
        deps.clearScheduledTextWork();
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        if (newTid >= 0) {
          let selectedTids: Dynamic = [
              newTid,
              ...groupTids.filter(
                (tid?: Dynamic): Dynamic =>
                  tid !== newTid && tid >= 0,
              ),
            ],
            pickerTarget: Dynamic = deps.getPreviewFrame();
          pickerTarget &&
            setTimeout(
              (): Dynamic =>
                setPickerSelection(pickerTarget, selectedTids, deps.rootName),
              60,
            );
          deps.selectElements(deps.rootName, selectedTids);
        }
        let clearRedundantFrozenStyles: Dynamic = async (
          tid?: Dynamic,
          element?: Dynamic,
          pinnedStyles?: Dynamic,
          freezeStyle?: Dynamic,
          isAfterPaint?: Dynamic,
        ): Promise<Dynamic> => {
          let pickerTarget: Dynamic = deps.getPreviewFrame(),
            currentState: Dynamic = deps.modelRef.current.state(deps.rootName);
          if (
            !pickerTarget ||
            !currentState ||
            currentState.model.element(tid) !== element
          )
            return;
          let inspection: Dynamic = await inspectPickerSelection(
            pickerTarget,
            tid,
            deps.rootName,
            [...pinnedStyles.keys()],
            {
              unpinned: true,
              afterPaint: isAfterPaint,
            },
          );
          if (
            deps.modelRef.current.state(deps.rootName) !== currentState ||
            currentState.model.element(tid) !== element
          )
            return;
          if (!inspection) {
            isAfterPaint ||
              setTimeout((): Dynamic => {
                clearRedundantFrozenStyles(tid, element, pinnedStyles, freezeStyle, true);
              }, 300);
            return;
          }
          let propertiesToClear: Dynamic = frozenInheritedStyleEdits(
            pinnedStyles,
            inspection.computed,
            freezeStyle,
            (property?: Dynamic): Dynamic =>
              currentState.model.inlineStyleValue(tid, property),
          );
          if (propertiesToClear.length !== 0) {
            for (let property of propertiesToClear as Dynamic)
              currentState.model.setStyleProperty(tid, property, null);
            deps.pushLiveModel(deps.rootName, currentState);
            deps.markModelDirty(deps.rootName);
            deps.incrementSessionEpoch();
          }
        };
        for (let pin of moveResult.pins as Dynamic)
          setTimeout((): Dynamic => {
            clearRedundantFrozenStyles(
              pin.tid,
              pin.el,
              pin.pinned,
              pin.freeze,
              false,
            );
          }, 120);
      }


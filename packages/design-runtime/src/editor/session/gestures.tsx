import { DcTplAttribute } from "../html/authoring";
import { LayoutMoveElementsLeftRightTopConfig } from "../layout/move-elements";
import { ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues } from "../model/model-state";
import { claimLateGesture } from "../session/element-state";
import { containsUneditableSelection } from "../selection/element-order";
import { copySvgStrokeProperties } from "../svg/layout";
import { dispatchElementSessionGesture } from "../session/element-state";
import { displacedDropFollowers } from "../layout/move-elements";
import { elementMoveRefusal } from "../layout/move-elements";
import { freezeInheritedTextStyle } from "../layout/move-elements";
import { frozenInheritedStyleEdits } from "../css/edit-validation";
import { inspectPickerSelection } from "../picker/bridge";
import { inspectSvgArrow } from "../svg/arrows";
import { markBlockedDragElements } from "../inspector/editor";
import { moveModelElement } from "../layout/move-elements";
import { normalizePasteScale } from "../clipboard/layout-snapshots";
import { normalizeSvgElementSizing } from "../svg/layout";
import { normalizeSvgStrokeProperties } from "../clipboard/layout-snapshots";
import { parseCssTransform } from "../css/transforms";
import { resizeSvgArrow } from "../svg/layout";
import { restoreGroupPosition } from "../insert/targets";
import { sameParentDropGroup } from "../layout/move-elements";
import { serializeCssTransform } from "../css/transforms";
import { setModelElementRect } from "../svg/layout";
import { setPickerSelection } from "../picker/bridge";
import { setSvgLineEndpoints } from "../svg/layout";
import { type Dynamic } from "../../runtime-types";

/** 画板内拖动元素过程中（收到 movePreview 消息）运行：以手势开始时的模型为基线，在模型里预演重排、跟随元素或绝对定位后的位置并推送实时预览，被拒绝的目标会标记出来。 */
export function previewElementMoveGesture(deps: { readonly baselineTemplateId: Dynamic; readonly clearScheduledTextWork: Dynamic; readonly maxBaselineMaps: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value26: Dynamic; readonly value28: Dynamic }, message?: Dynamic): Dynamic {
        if ((message.name || deps.rootName) !== deps.rootName) return;
        deps.clearScheduledTextWork();
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return;
        let gesture: Dynamic = deps.value26.current;
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
          let savedGesture: Dynamic = deps.value28.current;
          savedGesture &&
            savedGesture.gestureKey === message.gestureKey &&
            ((gesture.epoch = savedGesture.epoch),
            (gesture.maps = savedGesture.maps),
            (gesture.positioned = savedGesture.positioned));
          deps.value28.current = null;
          deps.value26.current = gesture;
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

/** 画板内拖动元素松手时（收到 move 消息）运行：把元素移动到目标位置（重排或绝对定位，含同组与跟随元素），模型拒绝时回到基线，成功则记录撤销、标脏并重新选中移动后的元素。 */
export function commitElementMoveGesture(deps: { readonly clearScheduledTextWork: Dynamic; readonly epochBaselineMapping: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value111: Dynamic; readonly value117: Dynamic; readonly value26: Dynamic; readonly value27: Dynamic; readonly value28: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }, message?: Dynamic): Dynamic {
        if ((message.name || deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.value117();
        deps.value27.forget(message.gestureKey ?? "");
        let gesture: Dynamic = deps.value26.current,
          dragBlock: Dynamic =
            message.absolute || message.alt
              ? null
              : gesture !== null && gesture.gestureKey === message.gestureKey
                ? gesture.block
                : undefined,
          targetTid: Dynamic = message.targetTid,
          position: Dynamic = message.position,
          savedGesture: Dynamic = deps.value28.current,
          positionedSet: Dynamic =
            gesture !== null && gesture.gestureKey === message.gestureKey
              ? gesture.positioned
              : savedGesture !== null && savedGesture.gestureKey === message.gestureKey
                ? savedGesture.positioned
                : undefined;
        deps.value28.current = null;
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
            deps.value26.current = null;
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
              gesture.epoch > 0 && deps.value111();
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
            deps.value26.current = null;
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
              gesture.epoch > 0 && deps.value111());
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
          gesture && gesture.epoch > 0 && deps.value111();
          return;
        }
        if (refusal !== null) {
          restoreLivePreview();
          return;
        }
        let redo: Dynamic = modelState.redo,
          undoMark: Dynamic = deps.value101(
            deps.rootName,
            message.gestureKey ?? `move-${message.tid}-${Date.now()}`,
            modelState,
          ),
          moveResult: Dynamic = moveModelElement(modelState, moveRequest);
        if (!moveResult) {
          deps.value102(modelState, undoMark, redo);
          deps.pushLiveModel(deps.rootName, modelState);
          gesture && gesture.epoch > 0 && deps.value111();
          return;
        }
        let { newTid: newTid, groupTids: groupTids }: Dynamic = moveResult;
        deps.value66.current = deps.rootName;
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
            pickerTarget: Dynamic = deps.value67();
          pickerTarget &&
            setTimeout(
              (): Dynamic =>
                setPickerSelection(pickerTarget, selectedTids, deps.rootName),
              60,
            );
          deps.value105(deps.rootName, selectedTids);
        }
        let clearRedundantFrozenStyles: Dynamic = async (
          tid?: Dynamic,
          element?: Dynamic,
          pinnedStyles?: Dynamic,
          freezeStyle?: Dynamic,
          isAfterPaint?: Dynamic,
        ): Promise<Dynamic> => {
          let pickerTarget: Dynamic = deps.value67(),
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

/** 画板内拖动缩放手柄结束时（收到 resize 消息）运行：把新的宽高与位置样式写入元素（裁剪模式下作用于裁剪目标），合并到本次手势的撤销记录并标脏。 */
export function commitElementResizeGesture(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value105: Dynamic; readonly value117: Dynamic; readonly value27: Dynamic; readonly value49: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic }, message?: Dynamic): Dynamic {
        if ((message.name ?? deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.value117();
        let targetTid: Dynamic =
            message.crop === true
              ? dispatchElementSessionGesture(
                  deps.rootName,
                  message,
                  modelState.model,
                  true,
                )
              : message.tid,
          targetElement: Dynamic =
            targetTid === null ? null : modelState.model.element(targetTid);
        if (!targetElement && message.crop !== true) return;
        let lateEdits: Dynamic = claimLateGesture(
          deps.rootName,
          message.tid,
          targetElement,
          message.crop === true,
        );
        if (lateEdits === undefined || targetTid === null) {
          deps.pushLiveModel(deps.rootName, modelState);
          return;
        }
        let lastUndoMark: Dynamic = deps.value65.current,
          isSameGesture: Dynamic =
            !!lastUndoMark &&
            lastUndoMark.name === deps.rootName &&
            lastUndoMark.key === message.gestureKey;
        deps.value27.forget(message.gestureKey ?? "");
        isSameGesture ||
          deps.value101(
            deps.rootName,
            message.gestureKey ?? `resize-${message.tid}`,
            modelState,
          );
        message.width != null &&
          modelState.model.setStyleProperty(
            targetTid,
            "width",
            `${message.width}px`,
          );
        message.height != null &&
          modelState.model.setStyleProperty(
            targetTid,
            "height",
            `${message.height}px`,
          );
        message.left != null &&
          modelState.model.setStyleProperty(
            targetTid,
            "left",
            `${message.left}px`,
          );
        message.top != null &&
          modelState.model.setStyleProperty(targetTid, "top", `${message.top}px`);
        message.right != null &&
          modelState.model.setStyleProperty(
            targetTid,
            "right",
            `${message.right}px`,
          );
        message.bottom != null &&
          modelState.model.setStyleProperty(
            targetTid,
            "bottom",
            `${message.bottom}px`,
          );
        for (let [property, styleValue] of (lateEdits ?? []) as Dynamic)
          modelState.model.setStyleProperty(targetTid, property, styleValue);
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let selection: Dynamic = deps.value49.current;
        selection?.name === deps.rootName && deps.value105(deps.rootName, selection.tids);
      }

/** 拖动线条或箭头端点时（收到 strokeEndpoint 消息）运行：重新计算 SVG 线段端点、箭头和外框尺寸并写回模型，标脏后重新选中该图形。 */
export function moveStrokeEndpointInModel(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value105: Dynamic; readonly value117: Dynamic; readonly value49: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }, message?: Dynamic): Dynamic {
        if ((message.name ?? deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.value117();
        if (
          !modelState.model.element(message.tid) ||
          modelState.model.tagName(message.tid) !== "svg" ||
          !/^[MLCZE\d\s.,-]+$/i.test(message.d)
        )
          return;
        let svgElement: Dynamic = modelState.model.element(message.tid),
          arrow: Dynamic = svgElement
            ? inspectSvgArrow(svgElement)
            : null,
          childTids: Dynamic = modelState.model.childTids(message.tid),
          bareShaftTid: Dynamic =
            !arrow &&
            message.unitScale === undefined &&
            message.isArrow !== true &&
            childTids.length === 1 &&
            modelState.model.tagName(childTids[0]) === "path" &&
            modelState.model.attribute(childTids[0], "transform") == null &&
            modelState.model.attributes(message.tid).preserveAspectRatio ===
              "none"
              ? childTids[0]
              : null;
        if (!svgElement || (!arrow && bareShaftTid == null)) {
          deps.pushLiveModel(deps.rootName, modelState);
          return;
        }
        let clampCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
            Number.isFinite(coordinate)
              ? Math.max(-1e6, Math.min(1e6, coordinate))
              : 0,
          left: Dynamic = clampCoordinate(message.left),
          top: Dynamic = clampCoordinate(message.top),
          width: Dynamic = Math.max(1, clampCoordinate(message.width)),
          height: Dynamic = Math.max(1, clampCoordinate(message.height)),
          unitScale: Dynamic = normalizePasteScale(
            message.unitScale,
          );
        if (unitScale == null) {
          deps.pushLiveModel(deps.rootName, modelState);
          return;
        }
        deps.value101(
          deps.rootName,
          message.gestureKey ?? `endpoint-${message.tid}`,
          modelState,
        );
        setModelElementRect(modelState.model, message.tid, {
          left: left,
          top: top,
          width: width,
          height: height,
        });
        let remappedTids: Dynamic = null,
          selectedElements: Dynamic =
            deps.value49.current?.name === deps.rootName
              ? deps.value49.current.tids
                  .map(
                    (tid?: Dynamic): Dynamic =>
                      modelState.model.element(tid),
                  )
                  .filter((element?: Dynamic): Dynamic => element != null)
              : [];
        if (bareShaftTid != null)
          modelState.model.setAttribute(bareShaftTid, "d", message.d);
        else if (
          resizeSvgArrow(
            modelState.model,
            message.tid,
            message.d,
            unitScale,
            normalizeSvgStrokeProperties(message.paint),
            normalizeSvgStrokeProperties(message.svgPaint),
          )?.restamped
        ) {
          let shaftElement: Dynamic = null;
          for (let child of svgElement.children as Dynamic)
            child.tagName.toLowerCase() === "path" &&
              (shaftElement = child);
          remappedTids = [
            ...new Set(
              selectedElements
                .map((element?: Dynamic): Dynamic => {
                  let tid: Dynamic = parseInt(
                      element.getAttribute(DcTplAttribute) ?? "-1",
                      10,
                    ),
                    anchorElement: Dynamic =
                      tid >= 0 &&
                      modelState.model.element(tid) === element
                        ? element
                        : shaftElement;
                  return anchorElement
                    ? parseInt(
                        anchorElement.getAttribute(DcTplAttribute) ?? "-1",
                        10,
                      )
                    : -1;
                })
                .filter((tid?: Dynamic): Dynamic => tid >= 0),
            ),
          ];
        }
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let selection: Dynamic = deps.value49.current;
        if (selection?.name === deps.rootName) {
          let nextTids: Dynamic =
            remappedTids && remappedTids.length > 0 ? remappedTids : selection.tids;
          deps.value105(deps.rootName, nextTids);
          if (
            nextTids.length !== selection.tids.length ||
            nextTids.some(
              (tid?: Dynamic, index?: Dynamic): Dynamic =>
                tid !== selection.tids[index],
            )
          ) {
            let pickerTarget: Dynamic = deps.value67();
            pickerTarget &&
              setTimeout(
                (): Dynamic =>
                  setPickerSelection(
                    pickerTarget,
                    nextTids,
                    deps.rootName,
                  ),
                60,
              );
          }
        }
      }

/** 画板内手势进行中（收到 stylePreview 消息）运行：首次变化时记下撤销点和元素原有的内联样式，把预览样式写入模型，并在下一帧把实时模型推送给代理画板。 */
export function applyLiveStylePreview(deps: { readonly delegatedFileRef: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value121: Dynamic; readonly value26: Dynamic; readonly value27: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic }, message?: Dynamic): Dynamic {
        if ((message.name || deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (
          !modelState ||
          (message.crop === true &&
            dispatchElementSessionGesture(
              deps.rootName,
              message,
              modelState.model,
            ) !== message.tid)
        )
          return;
        let gesture: Dynamic = deps.value26.current,
          activeGesture: Dynamic =
            gesture !== null && gesture.gestureKey === message.gestureKey
              ? gesture
              : null,
          followerTid: Dynamic =
            activeGesture !== null && message.follower === true
              ? activeGesture.followerCurrent?.get(message.tid)
              : undefined;
        if (
          activeGesture !== null &&
          message.follower === true &&
          followerTid === undefined
        )
          return;
        let isMovingTarget: Dynamic =
            activeGesture !== null &&
            (message.tid === activeGesture.movingTid || followerTid !== undefined),
          targetTid: Dynamic =
            activeGesture === null || !isMovingTarget
              ? message.tid
              : (followerTid ?? activeGesture.movingCurrentTid);
        if (
          !modelState.model.element(targetTid) ||
          containsUneditableSelection(modelState.model, [targetTid])
        )
          return;
        if (!isMovingTarget) {
          let undoMark: Dynamic = deps.value65.current;
          undoMark &&
            undoMark.name === deps.rootName &&
            undoMark.key === message.gestureKey &&
            (undoMark.at = Date.now());
          deps.value101(deps.rootName, message.gestureKey, modelState);
          deps.value27.capture(
            message.gestureKey,
            targetTid,
            (): Dynamic => modelState.model.inlineStyleAttr(targetTid),
          );
        }
        let didChange: Dynamic = false;
        for (let [property, styleValue] of Object.entries(
          message.styles,
        ) as Dynamic)
          modelState.model.setStyleProperty(targetTid, property, styleValue) &&
            (didChange = true);
        didChange &&
          ((deps.value66.current = deps.rootName),
          deps.delegatedFileRef.current &&
            !deps.value121.current &&
            ((deps.value121.current = true),
            requestAnimationFrame((): Dynamic => {
              deps.value121.current = false;
              let latestState: Dynamic = deps.modelRef.current.state(deps.rootName);
              latestState && deps.pushLiveModel(deps.rootName, latestState);
            })));
      }

/** 多选元素整体旋转或缩放结束时（收到 groupTransform 消息）运行：先把未参与的元素恢复为基线样式，再把各成员的新尺寸、位置、旋转或线段端点写回模型；没有有效成员时撤销本次记录。 */
export function commitElementGroupTransform(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onHistoryDrop: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value105: Dynamic; readonly value117: Dynamic; readonly value27: Dynamic; readonly value49: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic }, groupId?: Dynamic,
        gestureKey?: Dynamic,
        artboardName?: Dynamic,
        members?: Dynamic): Dynamic {
        if ((artboardName ?? deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.value117();
        let resolvedKey: Dynamic = gestureKey ?? "",
          validMembers: Dynamic = members.filter(
            (member?: Dynamic): Dynamic =>
              modelState.model.element(member.tid) &&
              !containsUneditableSelection(modelState.model, [
                member.tid,
              ]),
          ),
          values: Dynamic = new Set(
            validMembers
              .filter((member?: Dynamic): Dynamic => !member.stroke)
              .map((member?: Dynamic): Dynamic => member.tid),
          );
        for (let tid of deps.value27.tids(resolvedKey) as Dynamic) {
          if (values.has(tid) || !modelState.model.element(tid))
            continue;
          let baselineStyle: Dynamic = deps.value27.baselineFor(resolvedKey, tid);
          baselineStyle !== undefined &&
            modelState.model.setInlineStyleAttr(tid, baselineStyle);
        }
        let undoMark: Dynamic = deps.value65.current,
          isSameGesture: Dynamic =
            !!undoMark &&
            undoMark.name === deps.rootName &&
            undoMark.key === resolvedKey;
        if (validMembers.length === 0) {
          isSameGesture &&
            (modelState.undo.pop(),
            deps.onHistoryDrop?.("undo"),
            (deps.value65.current = null));
          deps.value27.forget(resolvedKey);
          deps.pushLiveModel(deps.rootName, modelState);
          return;
        }
        isSameGesture || deps.value101(deps.rootName, gestureKey ?? `group-${groupId}`, modelState);
        for (let member of validMembers as Dynamic) {
          if (member.stroke) {
            let svgElement: Dynamic =
                modelState.model.tagName(member.tid) === "svg"
                  ? modelState.model.element(member.tid)
                  : null,
              arrow: Dynamic = svgElement
                ? inspectSvgArrow(svgElement)
                : null,
              shaftTid: Dynamic =
                arrow && !arrow.legacy
                  ? parseInt(
                      arrow.shaft.getAttribute(DcTplAttribute) ??
                        "-1",
                      10,
                    )
                  : -1,
              endpoints: Dynamic = (
                /^M ([-\d.]+) ([-\d.]+) L ([-\d.]+) ([-\d.]+)$/.exec(
                  member.stroke.d,
                ) ?? []
              )
                .slice(1)
                .map(Number);
            if (
              shaftTid < 0 ||
              endpoints.length !== 4 ||
              endpoints.some(
                (coordinate?: Dynamic): Dynamic => !Number.isFinite(coordinate),
              )
            )
              continue;
            setModelElementRect(
              modelState.model,
              member.tid,
              member.stroke,
            );
            normalizeSvgElementSizing(
              modelState.model,
              member.tid,
            );
            copySvgStrokeProperties(
              modelState.model,
              shaftTid,
              member.tid,
              member.stroke.unitScale,
              member.stroke.paint,
              member.stroke.svgPaint,
            );
            setSvgLineEndpoints(
              modelState.model,
              shaftTid,
              endpoints[0],
              endpoints[1],
              endpoints[2],
              endpoints[3],
            );
            continue;
          }
          let styles: Dynamic = member.styles ?? {},
            oppositeSide: Dynamic = {
              left: "right",
              right: "left",
              top: "bottom",
              bottom: "top",
            };
          if (
            ["left", "top", "right", "bottom"].some(
              (side?: Dynamic): Dynamic => styles[side] !== undefined,
            )
          ) {
            let position: Dynamic = modelState.model.inlineStyleValue(
              member.tid,
              "position",
            );
            position !== "absolute" &&
              position !== "fixed" &&
              modelState.model.setStyleProperty(
                member.tid,
                "position",
                member.fixed ? "fixed" : "absolute",
              );
          }
          for (let [property, styleValue] of Object.entries(
            styles,
          ) as Dynamic) {
            modelState.model.setStyleProperty(member.tid, property, styleValue);
            oppositeSide[property] &&
              modelState.model.setStyleProperty(
                member.tid,
                oppositeSide[property],
                null,
              );
          }
          if (member.angle !== undefined) {
            let transform: Dynamic = parseCssTransform(
              modelState.model.effectiveStyleValue(member.tid, "transform"),
            );
            if (transform)
              modelState.model.setStyleProperty(
                member.tid,
                "transform",
                serializeCssTransform({
                  ...transform,
                  rotate: {
                    value: Math.round(member.angle),
                    unit: "deg",
                  },
                }) || null,
              );
            else {
              let baselineStyle: Dynamic = deps.value27.baselineFor(
                gestureKey ?? "",
                member.tid,
              );
              baselineStyle !== undefined &&
                modelState.model.setInlineStyleAttr(member.tid, baselineStyle);
            }
          }
        }
        deps.value27.forget(gestureKey ?? "");
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let selection: Dynamic = deps.value49.current;
        selection?.name === deps.rootName && deps.value105(deps.rootName, selection.tids);
      }

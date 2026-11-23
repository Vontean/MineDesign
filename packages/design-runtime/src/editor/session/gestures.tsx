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

interface CommitElementResizeGestureDependencies {
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly selectElements: Dynamic;
  readonly settleMoveAndRecoverTemplate: Dynamic;
  readonly frozenStyleCache: Dynamic;
  readonly selectionRef: Dynamic;
  readonly undoEditGroupRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
}

/** 画板内拖动缩放手柄结束时（收到 resize 消息）运行：把新的宽高与位置样式写入元素（裁剪模式下作用于裁剪目标），合并到本次手势的撤销记录并标脏。 */
export function commitElementResizeGesture(deps: CommitElementResizeGestureDependencies, message?: Dynamic): Dynamic {
        if ((message.name ?? deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.settleMoveAndRecoverTemplate();
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
        let lastUndoMark: Dynamic = deps.undoEditGroupRef.current,
          isSameGesture: Dynamic =
            !!lastUndoMark &&
            lastUndoMark.name === deps.rootName &&
            lastUndoMark.key === message.gestureKey;
        deps.frozenStyleCache.forget(message.gestureKey ?? "");
        isSameGesture ||
          deps.pushUndoEdit(
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
        deps.lastEditedTemplateRef.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let selection: Dynamic = deps.selectionRef.current;
        selection?.name === deps.rootName && deps.selectElements(deps.rootName, selection.tids);
      }

interface MoveStrokeEndpointInModelDependencies {
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly selectElements: Dynamic;
  readonly settleMoveAndRecoverTemplate: Dynamic;
  readonly selectionRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
  readonly getPreviewFrame: Dynamic;
}

/** 拖动线条或箭头端点时（收到 strokeEndpoint 消息）运行：重新计算 SVG 线段端点、箭头和外框尺寸并写回模型，标脏后重新选中该图形。 */
export function moveStrokeEndpointInModel(deps: MoveStrokeEndpointInModelDependencies, message?: Dynamic): Dynamic {
        if ((message.name ?? deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.settleMoveAndRecoverTemplate();
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
        deps.pushUndoEdit(
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
            deps.selectionRef.current?.name === deps.rootName
              ? deps.selectionRef.current.tids
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
        deps.lastEditedTemplateRef.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let selection: Dynamic = deps.selectionRef.current;
        if (selection?.name === deps.rootName) {
          let nextTids: Dynamic =
            remappedTids && remappedTids.length > 0 ? remappedTids : selection.tids;
          deps.selectElements(deps.rootName, nextTids);
          if (
            nextTids.length !== selection.tids.length ||
            nextTids.some(
              (tid?: Dynamic, index?: Dynamic): Dynamic =>
                tid !== selection.tids[index],
            )
          ) {
            let pickerTarget: Dynamic = deps.getPreviewFrame();
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

interface ApplyLiveStylePreviewDependencies {
  readonly delegatedFileRef: Dynamic;
  readonly modelRef: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly isStylePreviewPushScheduledRef: Dynamic;
  readonly gestureBaselineRef: Dynamic;
  readonly frozenStyleCache: Dynamic;
  readonly undoEditGroupRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
}

/** 画板内手势进行中（收到 stylePreview 消息）运行：首次变化时记下撤销点和元素原有的内联样式，把预览样式写入模型，并在下一帧把实时模型推送给代理画板。 */
export function applyLiveStylePreview(deps: ApplyLiveStylePreviewDependencies, message?: Dynamic): Dynamic {
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
        let gesture: Dynamic = deps.gestureBaselineRef.current,
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
          let undoMark: Dynamic = deps.undoEditGroupRef.current;
          undoMark &&
            undoMark.name === deps.rootName &&
            undoMark.key === message.gestureKey &&
            (undoMark.at = Date.now());
          deps.pushUndoEdit(deps.rootName, message.gestureKey, modelState);
          deps.frozenStyleCache.capture(
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
          ((deps.lastEditedTemplateRef.current = deps.rootName),
          deps.delegatedFileRef.current &&
            !deps.isStylePreviewPushScheduledRef.current &&
            ((deps.isStylePreviewPushScheduledRef.current = true),
            requestAnimationFrame((): Dynamic => {
              deps.isStylePreviewPushScheduledRef.current = false;
              let latestState: Dynamic = deps.modelRef.current.state(deps.rootName);
              latestState && deps.pushLiveModel(deps.rootName, latestState);
            })));
      }

interface CommitElementGroupTransformDependencies {
  readonly incrementSessionEpoch: Dynamic;
  readonly markModelDirty: Dynamic;
  readonly modelRef: Dynamic;
  readonly onHistoryDrop: Dynamic;
  readonly pushLiveModel: Dynamic;
  readonly rootName: Dynamic;
  readonly pushUndoEdit: Dynamic;
  readonly selectElements: Dynamic;
  readonly settleMoveAndRecoverTemplate: Dynamic;
  readonly frozenStyleCache: Dynamic;
  readonly selectionRef: Dynamic;
  readonly undoEditGroupRef: Dynamic;
  readonly lastEditedTemplateRef: Dynamic;
}

/** 多选元素整体旋转或缩放结束时（收到 groupTransform 消息）运行：先把未参与的元素恢复为基线样式，再把各成员的新尺寸、位置、旋转或线段端点写回模型；没有有效成员时撤销本次记录。 */
export function commitElementGroupTransform(deps: CommitElementGroupTransformDependencies, groupId?: Dynamic,
        gestureKey?: Dynamic,
        artboardName?: Dynamic,
        members?: Dynamic): Dynamic {
        if ((artboardName ?? deps.rootName) !== deps.rootName) return;
        let modelState: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!modelState) return void deps.settleMoveAndRecoverTemplate();
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
        for (let tid of deps.frozenStyleCache.tids(resolvedKey) as Dynamic) {
          if (values.has(tid) || !modelState.model.element(tid))
            continue;
          let baselineStyle: Dynamic = deps.frozenStyleCache.baselineFor(resolvedKey, tid);
          baselineStyle !== undefined &&
            modelState.model.setInlineStyleAttr(tid, baselineStyle);
        }
        let undoMark: Dynamic = deps.undoEditGroupRef.current,
          isSameGesture: Dynamic =
            !!undoMark &&
            undoMark.name === deps.rootName &&
            undoMark.key === resolvedKey;
        if (validMembers.length === 0) {
          isSameGesture &&
            (modelState.undo.pop(),
            deps.onHistoryDrop?.("undo"),
            (deps.undoEditGroupRef.current = null));
          deps.frozenStyleCache.forget(resolvedKey);
          deps.pushLiveModel(deps.rootName, modelState);
          return;
        }
        isSameGesture || deps.pushUndoEdit(deps.rootName, gestureKey ?? `group-${groupId}`, modelState);
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
              let baselineStyle: Dynamic = deps.frozenStyleCache.baselineFor(
                gestureKey ?? "",
                member.tid,
              );
              baselineStyle !== undefined &&
                modelState.model.setInlineStyleAttr(member.tid, baselineStyle);
            }
          }
        }
        deps.frozenStyleCache.forget(gestureKey ?? "");
        deps.lastEditedTemplateRef.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, modelState);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let selection: Dynamic = deps.selectionRef.current;
        selection?.name === deps.rootName && deps.selectElements(deps.rootName, selection.tids);
      }

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
export function previewElementMoveGesture(deps: { readonly baselineTemplateId: Dynamic; readonly clearScheduledTextWork: Dynamic; readonly maxBaselineMaps: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value26: Dynamic; readonly value28: Dynamic }, input?: Dynamic): Dynamic {
        if ((input.name || deps.rootName) !== deps.rootName) return;
        deps.clearScheduledTextWork();
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value307) return;
        let current: Dynamic = deps.value26.current;
        if (!current || current.gestureKey !== input.gestureKey) {
          if (!value307.model.element(input.tid)) return;
          for (let value315 of ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues as Dynamic)
            value307.model.takeMarkerAttr(value315);
          current = {
            gestureKey: input.gestureKey,
            baseline: value307.model.serialize(),
            movingTid: input.tid,
            movingCurrentTid: input.tid,
            currentToBaseline: null,
            lastFlow: null,
            epoch: 0,
            maps: [],
            lastRefused: null,
            block: (0, sameParentDropGroup)(
              value307.model,
              input.tid,
              input.group,
            ),
          };
          let current2: Dynamic = deps.value28.current;
          current2 &&
            current2.gestureKey === input.gestureKey &&
            ((current.epoch = current2.epoch),
            (current.maps = current2.maps),
            (current.positioned = current2.positioned));
          deps.value28.current = null;
          deps.value26.current = current;
        }
        let value308: Dynamic = deps.baselineTemplateId(
            input.targetTid,
            input.epoch,
          ),
          movingTid: Dynamic = current.movingTid;
        if (!input.absolute) {
          if (
            value308 === movingTid ||
            (value308 != null &&
              current.lastFlow !== null &&
              current.block?.includes(value308))
          )
            return;
          let value315: Dynamic = current.lastFlow ?? current.lastRefused;
          if (
            value315 &&
            value315.targetTid === value308 &&
            value315.position === input.position
          )
            return;
        }
        current.lastFlow = null;
        current.lastRefused = null;
        current.followerCurrent = undefined;
        value307.model = value307.model.rebuild(current.baseline);
        if (
          (0, containsUneditableSelection)(value307.model, [
            movingTid,
          ]) ||
          (value308 != null &&
            (0, containsUneditableSelection)(value307.model, [
              value308,
            ]))
        ) {
          current.currentToBaseline = null;
          current.movingCurrentTid = movingTid;
          deps.pushLiveModel(deps.rootName, value307);
          return;
        }
        let value309: Dynamic = value307.model.parentTid(movingTid),
          value310: Dynamic = value309;
        for (
          ;
          value310 != null &&
          /^sc-(if|for)$/.test(value307.model.tagName(value310) ?? "");

        )
          value310 = value307.model.parentTid(value310);
        let value311: Dynamic = input.absolute ? null : current.block,
          value312: Dynamic = value311
            ? value307.model.isBlockInPlace(
                value311,
                value308,
                input.position,
              )
            : input.absolute === true
              ? value307.model.isInPlace(
                  movingTid,
                  value308,
                  input.position,
                ) ||
                (input.position === "into" &&
                  value308 != null &&
                  value309 === value308)
              : value307.model.isRenderedInPlace(
                  movingTid,
                  value308,
                  input.position,
                );
        if (
          !(
            !value307.model.targetParentLocked(value308, input.position) &&
            (value312 ||
              (value311
                ? value307.model.moveBlockRelative(
                    value311,
                    value308,
                    input.position,
                  )
                : value307.model.moveRelative(
                    movingTid,
                    value308,
                    input.position,
                  )))
          )
        ) {
          input.absolute ||
            (current.lastRefused = {
              targetTid: value308,
              position: input.position,
            });
          current.epoch += 1;
          current.maps[current.epoch] = null;
          current.epoch > deps.maxBaselineMaps &&
            (current.maps[current.epoch - deps.maxBaselineMaps] = undefined);
          value307.model.setAttribute(
            movingTid,
            "data-dc-dragging",
            String(current.epoch),
          );
          value310 != null &&
            value307.model.setAttribute(
              value310,
              "data-dc-drag-parent",
              String(current.epoch),
            );
          (0, markBlockedDragElements)(
            value307.model,
            current.block,
            movingTid,
          );
          current.currentToBaseline = null;
          current.movingCurrentTid = movingTid;
          deps.pushLiveModel(deps.rootName, value307);
          value307.previewBaseline = current.baseline;
          return;
        }
        input.absolute ||
          (current.lastFlow = {
            targetTid: value308,
            position: input.position,
          });
        if (value312 && !input.absolute && current.epoch === 0) return;
        if (input.clearPositioning)
          for (let value315 of [
            "position",
            "left",
            "top",
            "right",
            "bottom",
          ] as Dynamic)
            value307.model.setStyleProperty(movingTid, value315, null);
        let items2: Dynamic = [];
        if (input.absolute) {
          let value315: Dynamic = value307.model.inlineStyleValue(
            movingTid,
            "position",
          );
          value315 !== "absolute" &&
            value315 !== "fixed" &&
            value307.model.setStyleProperty(
              movingTid,
              "position",
              "absolute",
            );
          for (let [value316, value317] of Object.entries(
            input.absStyles ?? {},
          ) as Dynamic) {
            value307.model.setStyleProperty(movingTid, value316, value317);
            for (let value318 of (LayoutMoveElementsLeftRightTopConfig[value316] ??
              []) as Dynamic)
              value307.model.setStyleProperty(movingTid, value318, null);
          }
          (input.parentNeedsPositioning ||
            current.positioned?.has(value308 ?? -1)) &&
            value308 != null &&
            !value307.model.inlineStyleValue(value308, "position") &&
            (value307.model.setStyleProperty(
              value308,
              "position",
              "relative",
            ),
            (current.positioned ??= new Set()).add(value308));
          items2 = input.followers?.length
            ? (0, displacedDropFollowers)(
                value307.model,
                input.followers,
                movingTid,
                value308,
                true,
              ).map((input2?: Dynamic): Dynamic => input2.el)
            : [];
        }
        if (input.flatten) {
          let value315: Dynamic = [
            ...(input.flatten.parentStatic === true ? [value309] : []),
            ...(Array.isArray(input.flatten.siblings)
              ? input.flatten.siblings
                  .slice(0, 200)
                  .filter(
                    (input2?: Dynamic): Dynamic => input2?.static === true,
                  )
                  .map((input2?: Dynamic): Dynamic => input2.tid)
              : []),
          ].filter(
            (input2?: Dynamic): Dynamic =>
              Number.isInteger(input2) &&
              value307.model.element(input2) != null &&
              !value307.model.inlineStyleValue(input2, "position"),
          );
          (0, restoreGroupPosition)(
            value307.model,
            input.flatten,
            movingTid,
            value309,
          );
          for (let value316 of value315 as Dynamic)
            value307.model.inlineStyleValue(value316, "position") &&
              (current.positioned ??= new Set()).add(value316);
        }
        if (value307.model.parentTid(movingTid) !== value309) {
          (0, freezeInheritedTextStyle)(
            value307.model,
            movingTid,
            input.freezeStyle,
          );
          for (let value315 of (input.group ?? []) as Dynamic)
            value315.tid !== movingTid &&
              value311?.includes(value315.tid) &&
              (0, freezeInheritedTextStyle)(
                value307.model,
                value315.tid,
                value315.freezeStyle,
              );
        }
        current.epoch += 1;
        value307.model.setAttribute(
          movingTid,
          "data-dc-dragging",
          String(current.epoch),
        );
        value310 != null &&
          value307.model.setAttribute(
            value310,
            "data-dc-drag-parent",
            String(current.epoch),
          );
        for (let value315 of (input.markFollowers ?? []) as Dynamic)
          value315 !== movingTid &&
            value307.model.element(value315) &&
            !(0, containsUneditableSelection)(value307.model, [
              value315,
            ]) &&
            value307.model.setAttribute(
              value315,
              "data-dc-drag-follower",
              String(value315),
            );
        (0, markBlockedDragElements)(
          value307.model,
          current.block,
          movingTid,
        );
        let value313: Dynamic = value307.model.elementCount(),
          entries: Dynamic = new Map(),
          value314: Dynamic = value307.model.element(movingTid);
        for (let index: Dynamic = 0; index < value313; index++) {
          let value315: Dynamic = value307.model.element(index);
          value315 && entries.set(value315, index);
        }
        value307.model.restamp();
        let items3: Dynamic = [];
        for (let index: Dynamic = 0; index < value313; index++) {
          let value315: Dynamic = value307.model.element(index);
          items3[index] = value315 ? (entries.get(value315) ?? index) : index;
        }
        current.currentToBaseline = items3;
        current.maps[current.epoch] = items3;
        current.epoch > deps.maxBaselineMaps &&
          (current.maps[current.epoch - deps.maxBaselineMaps] = undefined);
        current.movingCurrentTid = value314
          ? parseInt(
              value314.getAttribute("data-dc-tpl") ?? String(movingTid),
              10,
            )
          : movingTid;
        current.followerCurrent = new Map();
        for (let value315 of items2 as Dynamic) {
          let entry: Dynamic = entries.get(value315),
            value316: Dynamic = parseInt(
              value315.getAttribute("data-dc-tpl") ?? "-1",
              10,
            );
          entry !== undefined &&
            value316 >= 0 &&
            current.followerCurrent.set(entry, value316);
        }
        deps.pushLiveModel(deps.rootName, value307);
        value307.previewBaseline = current.baseline;
      }

/** 画板内拖动元素松手时（收到 move 消息）运行：把元素移动到目标位置（重排或绝对定位，含同组与跟随元素），模型拒绝时回到基线，成功则记录撤销、标脏并重新选中移动后的元素。 */
export function commitElementMoveGesture(deps: { readonly clearScheduledTextWork: Dynamic; readonly epochBaselineMapping: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value111: Dynamic; readonly value117: Dynamic; readonly value26: Dynamic; readonly value27: Dynamic; readonly value28: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }, input?: Dynamic): Dynamic {
        if ((input.name || deps.rootName) !== deps.rootName) return;
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value307) return void deps.value117();
        deps.value27.forget(input.gestureKey ?? "");
        let current: Dynamic = deps.value26.current,
          value308: Dynamic =
            input.absolute || input.alt
              ? null
              : current !== null && current.gestureKey === input.gestureKey
                ? current.block
                : undefined,
          targetTid: Dynamic = input.targetTid,
          position: Dynamic = input.position,
          current2: Dynamic = deps.value28.current,
          value309: Dynamic =
            current !== null && current.gestureKey === input.gestureKey
              ? current.positioned
              : current2 !== null && current2.gestureKey === input.gestureKey
                ? current2.positioned
                : undefined;
        deps.value28.current = null;
        if (
          !current &&
          current2 &&
          current2.gestureKey === input.gestureKey &&
          targetTid != null
        ) {
          let value315: Dynamic = deps.epochBaselineMapping(current2, input.epoch);
          value315 && (targetTid = value315[targetTid] ?? targetTid);
        }
        if (current)
          if (
            ((value307.previewBaseline = undefined),
            !input.absolute &&
              !input.alt &&
              current.gestureKey === input.gestureKey)
          ) {
            let lastFlow: Dynamic = current.lastFlow;
            value307.model = value307.model.rebuild(current.baseline);
            deps.value26.current = null;
            if (
              !lastFlow ||
              (current.block
                ? value307.model.isBlockInPlace(
                    current.block,
                    lastFlow.targetTid,
                    lastFlow.position,
                  )
                : value307.model.isRenderedInPlace(
                    current.movingTid,
                    lastFlow.targetTid,
                    lastFlow.position,
                  ))
            ) {
              deps.pushLiveModel(deps.rootName, value307);
              current.epoch > 0 && deps.value111();
              return;
            }
            targetTid = lastFlow.targetTid;
            position = lastFlow.position;
          } else {
            if (targetTid != null) {
              let value315: Dynamic = deps.epochBaselineMapping(
                current,
                input.epoch,
              );
              value315 && (targetTid = value315[targetTid] ?? targetTid);
            }
            value307.model = value307.model.rebuild(current.baseline);
            deps.value26.current = null;
          }
        value308 === undefined &&
          (value308 = (0, sameParentDropGroup)(
            value307.model,
            input.tid,
            input.group,
          ));
        value308 && value308[0] !== input.tid && (value308 = null);
        let callback7: Dynamic = (): Dynamic => {
            current &&
              (deps.pushLiveModel(deps.rootName, value307),
              current.epoch > 0 && deps.value111());
          },
          state: Dynamic = {
            tid: input.tid,
            targetTid: targetTid,
            position: position,
            alt: input.alt === true,
            absolute: input.absolute === true,
            breakout: input.breakout,
            fixed: input.fixed,
            absStyles: input.absStyles,
            parentNeedsPositioning: input.parentNeedsPositioning,
            previewPositioned: value309,
            flatten: input.flatten,
            followers: input.followers,
            group: input.group,
            block: value308,
            previewBlock:
              current !== null &&
              current.gestureKey === input.gestureKey &&
              !!current.block,
            clearPositioning: input.clearPositioning,
            freezeStyle: input.freezeStyle,
          },
          value310: Dynamic = (0, elementMoveRefusal)(
            value307.model,
            state,
          );
        if (
          value310 === "loop-driven" ||
          value310 === "model-refused" ||
          value310 === "in-place"
        ) {
          deps.pushLiveModel(deps.rootName, value307);
          current && current.epoch > 0 && deps.value111();
          return;
        }
        if (value310 !== null) {
          callback7();
          return;
        }
        let redo: Dynamic = value307.redo,
          value311: Dynamic = deps.value101(
            deps.rootName,
            input.gestureKey ?? `move-${input.tid}-${Date.now()}`,
            value307,
          ),
          value312: Dynamic = (0, moveModelElement)(value307, state);
        if (!value312) {
          deps.value102(value307, value311, redo);
          deps.pushLiveModel(deps.rootName, value307);
          current && current.epoch > 0 && deps.value111();
          return;
        }
        let { newTid: value313, groupTids: value314 }: Dynamic = value312;
        deps.value66.current = deps.rootName;
        deps.clearScheduledTextWork();
        deps.pushLiveModel(deps.rootName, value307);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        if (value313 >= 0) {
          let items2: Dynamic = [
              value313,
              ...value314.filter(
                (input2?: Dynamic): Dynamic =>
                  input2 !== value313 && input2 >= 0,
              ),
            ],
            value315: Dynamic = deps.value67();
          value315 &&
            setTimeout(
              (): Dynamic =>
                (0, setPickerSelection)(value315, items2, deps.rootName),
              60,
            );
          deps.value105(deps.rootName, items2);
        }
        let callback8: Dynamic = async (
          input2?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
          value315?: Dynamic,
          extra?: Dynamic,
        ): Promise<Dynamic> => {
          let value316: Dynamic = deps.value67(),
            value317: Dynamic = deps.modelRef.current.state(deps.rootName);
          if (
            !value316 ||
            !value317 ||
            value317.model.element(input2) !== options
          )
            return;
          let value318: Dynamic = await (0, inspectPickerSelection)(
            value316,
            input2,
            deps.rootName,
            [...context.keys()],
            {
              unpinned: true,
              afterPaint: extra,
            },
          );
          if (
            deps.modelRef.current.state(deps.rootName) !== value317 ||
            value317.model.element(input2) !== options
          )
            return;
          if (!value318) {
            extra ||
              setTimeout((): Dynamic => {
                callback8(input2, options, context, value315, true);
              }, 300);
            return;
          }
          let value319: Dynamic = (0, frozenInheritedStyleEdits)(
            context,
            value318.computed,
            value315,
            (input3?: Dynamic): Dynamic =>
              value317.model.inlineStyleValue(input2, input3),
          );
          if (value319.length !== 0) {
            for (let value320 of value319 as Dynamic)
              value317.model.setStyleProperty(input2, value320, null);
            deps.pushLiveModel(deps.rootName, value317);
            deps.markModelDirty(deps.rootName);
            deps.incrementSessionEpoch();
          }
        };
        for (let value315 of value312.pins as Dynamic)
          setTimeout((): Dynamic => {
            callback8(
              value315.tid,
              value315.el,
              value315.pinned,
              value315.freeze,
              false,
            );
          }, 120);
      }

/** 画板内拖动缩放手柄结束时（收到 resize 消息）运行：把新的宽高与位置样式写入元素（裁剪模式下作用于裁剪目标），合并到本次手势的撤销记录并标脏。 */
export function commitElementResizeGesture(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value105: Dynamic; readonly value117: Dynamic; readonly value27: Dynamic; readonly value49: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic }, input?: Dynamic): Dynamic {
        if ((input.name ?? deps.rootName) !== deps.rootName) return;
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value307) return void deps.value117();
        let value308: Dynamic =
            input.crop === true
              ? (0, dispatchElementSessionGesture)(
                  deps.rootName,
                  input,
                  value307.model,
                  true,
                )
              : input.tid,
          value309: Dynamic =
            value308 === null ? null : value307.model.element(value308);
        if (!value309 && input.crop !== true) return;
        let value310: Dynamic = (0, claimLateGesture)(
          deps.rootName,
          input.tid,
          value309,
          input.crop === true,
        );
        if (value310 === undefined || value308 === null) {
          deps.pushLiveModel(deps.rootName, value307);
          return;
        }
        let current: Dynamic = deps.value65.current,
          value311: Dynamic =
            !!current &&
            current.name === deps.rootName &&
            current.key === input.gestureKey;
        deps.value27.forget(input.gestureKey ?? "");
        value311 ||
          deps.value101(
            deps.rootName,
            input.gestureKey ?? `resize-${input.tid}`,
            value307,
          );
        input.width != null &&
          value307.model.setStyleProperty(
            value308,
            "width",
            `${input.width}px`,
          );
        input.height != null &&
          value307.model.setStyleProperty(
            value308,
            "height",
            `${input.height}px`,
          );
        input.left != null &&
          value307.model.setStyleProperty(
            value308,
            "left",
            `${input.left}px`,
          );
        input.top != null &&
          value307.model.setStyleProperty(value308, "top", `${input.top}px`);
        input.right != null &&
          value307.model.setStyleProperty(
            value308,
            "right",
            `${input.right}px`,
          );
        input.bottom != null &&
          value307.model.setStyleProperty(
            value308,
            "bottom",
            `${input.bottom}px`,
          );
        for (let [value312, value313] of (value310 ?? []) as Dynamic)
          value307.model.setStyleProperty(value308, value312, value313);
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, value307);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let current2: Dynamic = deps.value49.current;
        current2?.name === deps.rootName && deps.value105(deps.rootName, current2.tids);
      }

/** 拖动线条或箭头端点时（收到 strokeEndpoint 消息）运行：重新计算 SVG 线段端点、箭头和外框尺寸并写回模型，标脏后重新选中该图形。 */
export function moveStrokeEndpointInModel(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value105: Dynamic; readonly value117: Dynamic; readonly value49: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }, input?: Dynamic): Dynamic {
        if ((input.name ?? deps.rootName) !== deps.rootName) return;
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value307) return void deps.value117();
        if (
          !value307.model.element(input.tid) ||
          value307.model.tagName(input.tid) !== "svg" ||
          !/^[MLCZE\d\s.,-]+$/i.test(input.d)
        )
          return;
        let value308: Dynamic = value307.model.element(input.tid),
          value309: Dynamic = value308
            ? (0, inspectSvgArrow)(value308)
            : null,
          value310: Dynamic = value307.model.childTids(input.tid),
          value311: Dynamic =
            !value309 &&
            input.unitScale === undefined &&
            input.isArrow !== true &&
            value310.length === 1 &&
            value307.model.tagName(value310[0]) === "path" &&
            value307.model.attribute(value310[0], "transform") == null &&
            value307.model.attributes(input.tid).preserveAspectRatio ===
              "none"
              ? value310[0]
              : null;
        if (!value308 || (!value309 && value311 == null)) {
          deps.pushLiveModel(deps.rootName, value307);
          return;
        }
        let callback7: Dynamic = (input2?: Dynamic): Dynamic =>
            Number.isFinite(input2)
              ? Math.max(-1e6, Math.min(1e6, input2))
              : 0,
          value312: Dynamic = callback7(input.left),
          value313: Dynamic = callback7(input.top),
          value314: Dynamic = Math.max(1, callback7(input.width)),
          value315: Dynamic = Math.max(1, callback7(input.height)),
          value316: Dynamic = (0, normalizePasteScale)(
            input.unitScale,
          );
        if (value316 == null) {
          deps.pushLiveModel(deps.rootName, value307);
          return;
        }
        deps.value101(
          deps.rootName,
          input.gestureKey ?? `endpoint-${input.tid}`,
          value307,
        );
        (0, setModelElementRect)(value307.model, input.tid, {
          left: value312,
          top: value313,
          width: value314,
          height: value315,
        });
        let value317: Dynamic = null,
          value318: Dynamic =
            deps.value49.current?.name === deps.rootName
              ? deps.value49.current.tids
                  .map(
                    (input2?: Dynamic): Dynamic =>
                      value307.model.element(input2),
                  )
                  .filter((input2?: Dynamic): Dynamic => input2 != null)
              : [];
        if (value311 != null)
          value307.model.setAttribute(value311, "d", input.d);
        else if (
          (0, resizeSvgArrow)(
            value307.model,
            input.tid,
            input.d,
            value316,
            (0, normalizeSvgStrokeProperties)(input.paint),
            (0, normalizeSvgStrokeProperties)(input.svgPaint),
          )?.restamped
        ) {
          let value319: Dynamic = null;
          for (let value320 of value308.children as Dynamic)
            value320.tagName.toLowerCase() === "path" &&
              (value319 = value320);
          value317 = [
            ...new Set(
              value318
                .map((element?: Dynamic): Dynamic => {
                  let value320: Dynamic = parseInt(
                      element.getAttribute(DcTplAttribute) ?? "-1",
                      10,
                    ),
                    value321: Dynamic =
                      value320 >= 0 &&
                      value307.model.element(value320) === element
                        ? element
                        : value319;
                  return value321
                    ? parseInt(
                        value321.getAttribute(DcTplAttribute) ?? "-1",
                        10,
                      )
                    : -1;
                })
                .filter((input2?: Dynamic): Dynamic => input2 >= 0),
            ),
          ];
        }
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, value307);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let current: Dynamic = deps.value49.current;
        if (current?.name === deps.rootName) {
          let value319: Dynamic =
            value317 && value317.length > 0 ? value317 : current.tids;
          deps.value105(deps.rootName, value319);
          if (
            value319.length !== current.tids.length ||
            value319.some(
              (input2?: Dynamic, options?: Dynamic): Dynamic =>
                input2 !== current.tids[options],
            )
          ) {
            let value320: Dynamic = deps.value67();
            value320 &&
              setTimeout(
                (): Dynamic =>
                  (0, setPickerSelection)(
                    value320,
                    value319,
                    deps.rootName,
                  ),
                60,
              );
          }
        }
      }

/** 画板内手势进行中（收到 stylePreview 消息）运行：首次变化时记下撤销点和元素原有的内联样式，把预览样式写入模型，并在下一帧把实时模型推送给代理画板。 */
export function applyLiveStylePreview(deps: { readonly delegatedFileRef: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value121: Dynamic; readonly value26: Dynamic; readonly value27: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic }, input?: Dynamic): Dynamic {
        if ((input.name || deps.rootName) !== deps.rootName) return;
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (
          !value307 ||
          (input.crop === true &&
            (0, dispatchElementSessionGesture)(
              deps.rootName,
              input,
              value307.model,
            ) !== input.tid)
        )
          return;
        let current: Dynamic = deps.value26.current,
          value308: Dynamic =
            current !== null && current.gestureKey === input.gestureKey
              ? current
              : null,
          value309: Dynamic =
            value308 !== null && input.follower === true
              ? value308.followerCurrent?.get(input.tid)
              : undefined;
        if (
          value308 !== null &&
          input.follower === true &&
          value309 === undefined
        )
          return;
        let value310: Dynamic =
            value308 !== null &&
            (input.tid === value308.movingTid || value309 !== undefined),
          value311: Dynamic =
            value308 === null || !value310
              ? input.tid
              : (value309 ?? value308.movingCurrentTid);
        if (
          !value307.model.element(value311) ||
          (0, containsUneditableSelection)(value307.model, [value311])
        )
          return;
        if (!value310) {
          let current2: Dynamic = deps.value65.current;
          current2 &&
            current2.name === deps.rootName &&
            current2.key === input.gestureKey &&
            (current2.at = Date.now());
          deps.value101(deps.rootName, input.gestureKey, value307);
          deps.value27.capture(
            input.gestureKey,
            value311,
            (): Dynamic => value307.model.inlineStyleAttr(value311),
          );
        }
        let flag: Dynamic = false;
        for (let [value312, value313] of Object.entries(
          input.styles,
        ) as Dynamic)
          value307.model.setStyleProperty(value311, value312, value313) &&
            (flag = true);
        flag &&
          ((deps.value66.current = deps.rootName),
          deps.delegatedFileRef.current &&
            !deps.value121.current &&
            ((deps.value121.current = true),
            requestAnimationFrame((): Dynamic => {
              deps.value121.current = false;
              let value312: Dynamic = deps.modelRef.current.state(deps.rootName);
              value312 && deps.pushLiveModel(deps.rootName, value312);
            })));
      }

/** 多选元素整体旋转或缩放结束时（收到 groupTransform 消息）运行：先把未参与的元素恢复为基线样式，再把各成员的新尺寸、位置、旋转或线段端点写回模型；没有有效成员时撤销本次记录。 */
export function commitElementGroupTransform(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly onHistoryDrop: Dynamic; readonly pushLiveModel: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value105: Dynamic; readonly value117: Dynamic; readonly value27: Dynamic; readonly value49: Dynamic; readonly value65: Dynamic; readonly value66: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value307?: Dynamic): Dynamic {
        if ((context ?? deps.rootName) !== deps.rootName) return;
        let value308: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value308) return void deps.value117();
        let value309: Dynamic = options ?? "",
          value310: Dynamic = value307.filter(
            (input2?: Dynamic): Dynamic =>
              value308.model.element(input2.tid) &&
              !(0, containsUneditableSelection)(value308.model, [
                input2.tid,
              ]),
          ),
          values: Dynamic = new Set(
            value310
              .filter((input2?: Dynamic): Dynamic => !input2.stroke)
              .map((input2?: Dynamic): Dynamic => input2.tid),
          );
        for (let value312 of deps.value27.tids(value309) as Dynamic) {
          if (values.has(value312) || !value308.model.element(value312))
            continue;
          let value313: Dynamic = deps.value27.baselineFor(value309, value312);
          value313 !== undefined &&
            value308.model.setInlineStyleAttr(value312, value313);
        }
        let current: Dynamic = deps.value65.current,
          value311: Dynamic =
            !!current &&
            current.name === deps.rootName &&
            current.key === value309;
        if (value310.length === 0) {
          value311 &&
            (value308.undo.pop(),
            deps.onHistoryDrop?.("undo"),
            (deps.value65.current = null));
          deps.value27.forget(value309);
          deps.pushLiveModel(deps.rootName, value308);
          return;
        }
        value311 || deps.value101(deps.rootName, options ?? `group-${input}`, value308);
        for (let value312 of value310 as Dynamic) {
          if (value312.stroke) {
            let value314: Dynamic =
                value308.model.tagName(value312.tid) === "svg"
                  ? value308.model.element(value312.tid)
                  : null,
              value315: Dynamic = value314
                ? (0, inspectSvgArrow)(value314)
                : null,
              value316: Dynamic =
                value315 && !value315.legacy
                  ? parseInt(
                      value315.shaft.getAttribute(DcTplAttribute) ??
                        "-1",
                      10,
                    )
                  : -1,
              value317: Dynamic = (
                /^M ([-\d.]+) ([-\d.]+) L ([-\d.]+) ([-\d.]+)$/.exec(
                  value312.stroke.d,
                ) ?? []
              )
                .slice(1)
                .map(Number);
            if (
              value316 < 0 ||
              value317.length !== 4 ||
              value317.some(
                (input2?: Dynamic): Dynamic => !Number.isFinite(input2),
              )
            )
              continue;
            (0, setModelElementRect)(
              value308.model,
              value312.tid,
              value312.stroke,
            );
            (0, normalizeSvgElementSizing)(
              value308.model,
              value312.tid,
            );
            (0, copySvgStrokeProperties)(
              value308.model,
              value316,
              value312.tid,
              value312.stroke.unitScale,
              value312.stroke.paint,
              value312.stroke.svgPaint,
            );
            (0, setSvgLineEndpoints)(
              value308.model,
              value316,
              value317[0],
              value317[1],
              value317[2],
              value317[3],
            );
            continue;
          }
          let value313: Dynamic = value312.styles ?? {},
            state: Dynamic = {
              left: "right",
              right: "left",
              top: "bottom",
              bottom: "top",
            };
          if (
            ["left", "top", "right", "bottom"].some(
              (input2?: Dynamic): Dynamic => value313[input2] !== undefined,
            )
          ) {
            let value314: Dynamic = value308.model.inlineStyleValue(
              value312.tid,
              "position",
            );
            value314 !== "absolute" &&
              value314 !== "fixed" &&
              value308.model.setStyleProperty(
                value312.tid,
                "position",
                value312.fixed ? "fixed" : "absolute",
              );
          }
          for (let [value314, value315] of Object.entries(
            value313,
          ) as Dynamic) {
            value308.model.setStyleProperty(value312.tid, value314, value315);
            state[value314] &&
              value308.model.setStyleProperty(
                value312.tid,
                state[value314],
                null,
              );
          }
          if (value312.angle !== undefined) {
            let value314: Dynamic = (0, parseCssTransform)(
              value308.model.effectiveStyleValue(value312.tid, "transform"),
            );
            if (value314)
              value308.model.setStyleProperty(
                value312.tid,
                "transform",
                (0, serializeCssTransform)({
                  ...value314,
                  rotate: {
                    value: Math.round(value312.angle),
                    unit: "deg",
                  },
                }) || null,
              );
            else {
              let value315: Dynamic = deps.value27.baselineFor(
                options ?? "",
                value312.tid,
              );
              value315 !== undefined &&
                value308.model.setInlineStyleAttr(value312.tid, value315);
            }
          }
        }
        deps.value27.forget(options ?? "");
        deps.value66.current = deps.rootName;
        deps.pushLiveModel(deps.rootName, value308);
        deps.markModelDirty(deps.rootName);
        deps.incrementSessionEpoch();
        let current2: Dynamic = deps.value49.current;
        current2?.name === deps.rootName && deps.value105(deps.rootName, current2.tids);
      }

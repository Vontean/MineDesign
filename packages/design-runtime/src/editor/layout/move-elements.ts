/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { normalizeTextStyleSnapshot } from "../css/edit-validation";
import { restoreGroupPosition } from "../insert/targets";
import { containsUneditableSelection } from "../selection/element-order";

var overriddenPositionProps: Dynamic;
var readTemplateId: Dynamic;
function freezeInheritedTextStyle(
  model?: Dynamic,
  tid?: Dynamic,
  sourceStyles?: Dynamic,
): Dynamic {
  let entries: Dynamic = new Map();
  for (let [property, propertyValue] of normalizeTextStyleSnapshot(
    sourceStyles,
  ) as Dynamic)
    model.hasAuthoredStyle(tid, property) ||
      (model.setStyleProperty(tid, property, propertyValue),
      entries.set(property, propertyValue));
  return entries;
}
function displacedDropFollowers(
  model?: Dynamic,
  followers?: Dynamic,
  draggedTid?: Dynamic,
  newParentTid?: Dynamic,
  shouldMarkFollowers?: Dynamic,
): Dynamic {
  let displacedItems: Dynamic = [];
  for (let follower of followers as Dynamic) {
    let followerEl: Dynamic = model.element(follower.tid);
    if (
      !followerEl ||
      follower.tid === draggedTid ||
      containsUneditableSelection(model, [follower.tid]) ||
      model.isWithin(draggedTid, follower.tid)
    )
      continue;
    let oldParentTid: Dynamic = model.parentTid(follower.tid);
    if (newParentTid == null) {
      if (oldParentTid != null && !model.moveRelative(follower.tid, null, "root-end"))
        continue;
    } else if (
      oldParentTid !== newParentTid &&
      (model.isWithin(follower.tid, newParentTid) ||
        !model.moveRelative(follower.tid, newParentTid, "into"))
    )
      continue;
    let positionValue: Dynamic = model.inlineStyleValue(follower.tid, "position");
    positionValue !== "absolute" &&
      positionValue !== "fixed" &&
      model.setStyleProperty(follower.tid, "position", "absolute");
    for (let [property, propertyValue] of Object.entries(follower.absStyles) as Dynamic)
      if (property !== "position") {
        model.setStyleProperty(follower.tid, property, propertyValue);
        for (let resetProperty of (overriddenPositionProps[property] ??
          []) as Dynamic)
          model.setStyleProperty(follower.tid, resetProperty, null);
      }
    let pinnedStyles: Dynamic =
      model.parentTid(follower.tid) !== oldParentTid
        ? freezeInheritedTextStyle(model, follower.tid, follower.freezeStyle)
        : new Map();
    shouldMarkFollowers &&
      model.setAttribute(
        follower.tid,
        "data-dc-drag-follower",
        String(follower.tid),
      );
    displacedItems.push({
      el: followerEl,
      pinned: pinnedStyles,
      freezeStyle: follower.freezeStyle,
    });
  }
  return displacedItems;
}
function sameParentDropGroup(
  model?: Dynamic,
  tid?: Dynamic,
  group?: Dynamic,
): Dynamic {
  let parentTid: Dynamic = model.parentTid(tid);
  if (!group?.length || parentTid == null) return null;
  let siblingTids: Dynamic = group
    .map((member?: Dynamic): Dynamic => member.tid)
    .filter(
      (siblingTid?: Dynamic): Dynamic =>
        siblingTid !== tid &&
        model.parentTid(siblingTid) === parentTid &&
        !model.isUneditable(siblingTid) &&
        !containsUneditableSelection(model, [siblingTid]),
    );
  return siblingTids.length > 0 ? [tid, ...siblingTids] : null;
}
function elementMoveRefusal(model?: Dynamic, move?: Dynamic): Dynamic {
  if (
    move.absolute &&
    move.breakout !== true &&
    !move.alt &&
    move.previewBlock === true
  )
    return "preview-block";
  let element: Dynamic = model.element(move.tid);
  if (!element) return "missing";
  if (move.targetTid != null && !model.element(move.targetTid))
    return "target-missing";
  if (
    containsUneditableSelection(model, [move.tid]) ||
    (move.targetTid != null &&
      containsUneditableSelection(model, [move.targetTid]))
  )
    return "loop-driven";
  if (model.targetParentLocked(move.targetTid, move.position))
    return "locked-parent";
  if (
    move.targetTid != null &&
    !move.alt &&
    model.isWithin(move.tid, move.targetTid) &&
    move.position === "into"
  )
    return "no-op";
  if (move.alt && !element.parentNode) return "no-parent";
  if (!move.absolute && !move.alt) {
    if (
      move.block
        ? model.isBlockInPlace(
            move.block,
            move.targetTid,
            move.position,
          )
        : model.isInPlace(move.tid, move.targetTid, move.position)
    )
      return "in-place";
    if (
      !(move.block
        ? model.canMoveBlockRelative(
            move.block,
            move.targetTid,
            move.position,
          )
        : model.canMoveRelative(
            move.tid,
            move.targetTid,
            move.position,
          ))
    )
      return "model-refused";
  }
  return null;
}
function moveModelElement(host?: Dynamic, move?: Dynamic): Dynamic {
  if (elementMoveRefusal(host.model, move) !== null) return null;
  let targetEl: Dynamic =
      move.targetTid != null
        ? host.model.element(move.targetTid)
        : null,
    tid: Dynamic = move.tid;
  if (move.alt) {
    let duplicate: Dynamic = host.model.duplicateElement(move.tid);
    host.model.restamp();
    tid = readTemplateId(duplicate);
  }
  let targetTid: Dynamic = targetEl ? readTemplateId(targetEl) : null,
    movingEl: Dynamic = host.model.element(tid),
    originalParentTid: Dynamic = host.model.parentTid(tid),
    groupTids: Dynamic = [],
    displacedFollowers: Dynamic = [],
    blockMembers: Dynamic = [];
  if (move.absolute) {
    targetTid != null && host.model.parentTid(tid) !== targetTid
      ? host.model.moveRelative(tid, targetTid, "into")
      : targetTid == null &&
        move.position === "root-end" &&
        host.model.parentTid(tid) != null &&
        host.model.moveRelative(tid, null, "root-end");
    let positionValue: Dynamic = host.model.inlineStyleValue(tid, "position");
    if (positionValue !== "absolute" && positionValue !== "fixed") {
      let shouldUseFixed: Dynamic =
        move.fixed === true &&
        targetTid == null &&
        move.position === "into";
      host.model.setStyleProperty(
        tid,
        "position",
        shouldUseFixed ? "fixed" : "absolute",
      );
    }
    for (let [property, propertyValue] of Object.entries(
      move.absStyles ?? {},
    ) as Dynamic)
      if (property !== "position") {
        host.model.setStyleProperty(tid, property, propertyValue);
        for (let resetProperty of (overriddenPositionProps[property] ??
          []) as Dynamic)
          host.model.setStyleProperty(tid, resetProperty, null);
      }
    (move.parentNeedsPositioning === true ||
      (move.targetTid != null &&
        move.previewPositioned?.has(move.targetTid) === true)) &&
      targetTid != null &&
      !host.model.inlineStyleValue(targetTid, "position") &&
      host.model.setStyleProperty(targetTid, "position", "relative");
    move.flatten &&
      !move.alt &&
      restoreGroupPosition(
        host.model,
        move.flatten,
        tid,
        originalParentTid,
      );
    if (
      move.followers &&
      targetTid == null &&
      move.position === "into" &&
      !move.alt
    ) {
      let sharedParentTid: Dynamic = host.model.parentTid(tid);
      for (let follower of move.followers as Dynamic) {
        if (
          follower.tid === tid ||
          !host.model.element(follower.tid) ||
          host.model.parentTid(follower.tid) !== sharedParentTid ||
          containsUneditableSelection(host.model, [follower.tid])
        )
          continue;
        let followerPosition: Dynamic = host.model.inlineStyleValue(
          follower.tid,
          "position",
        );
        followerPosition !== "absolute" &&
          followerPosition !== "fixed" &&
          host.model.setStyleProperty(
            follower.tid,
            "position",
            follower.fixed ? "fixed" : "absolute",
          );
        for (let [property, propertyValue] of Object.entries(
          follower.absStyles,
        ) as Dynamic)
          if (property !== "position") {
            host.model.setStyleProperty(follower.tid, property, propertyValue);
            for (let resetProperty of (overriddenPositionProps[
              property
            ] ?? []) as Dynamic)
              host.model.setStyleProperty(follower.tid, resetProperty, null);
          }
        groupTids.push(follower.tid);
      }
    } else
      move.followers &&
        move.breakout === true &&
        !move.alt &&
        (displacedFollowers = displacedDropFollowers(
          host.model,
          move.followers,
          tid,
          targetTid,
          false,
        ));
  } else {
    let otherBlockTids: Dynamic = (move.block ?? []).filter(
        (blockTid?: Dynamic): Dynamic => blockTid !== tid,
      ),
      blockEls: Dynamic = otherBlockTids.map(
        (blockTid?: Dynamic): Dynamic => host.model.element(blockTid),
      );
    (move.block
      ? host.model.moveBlockRelative(move.block, targetTid, move.position)
      : host.model.moveRelative(tid, targetTid, move.position)) &&
      otherBlockTids.forEach((blockTid?: Dynamic, blockIndex?: Dynamic): Dynamic => {
        let blockEl: Dynamic = blockEls[blockIndex];
        blockEl &&
          blockMembers.push({
            el: blockEl,
            tid: blockTid,
            frozen: move.group?.find(
              (member?: Dynamic): Dynamic => member.tid === blockTid,
            )?.freezeStyle,
          });
      });
    if (move.clearPositioning === true)
      for (let property of [
        "position",
        "left",
        "top",
        "right",
        "bottom",
      ] as Dynamic)
        host.model.setStyleProperty(tid, property, null);
  }
  let reparented: Dynamic = host.model.parentTid(tid) !== originalParentTid,
    pinnedStyles: Dynamic = reparented
      ? freezeInheritedTextStyle(host.model, tid, move.freezeStyle)
      : new Map(),
    blockPins: Dynamic = reparented
      ? blockMembers.map(
          (member?: Dynamic): Dynamic => ({
            el: member.el,
            pinned: freezeInheritedTextStyle(
              host.model,
              member.tid,
              member.frozen,
            ),
            frozen: member.frozen,
          }),
        )
      : [];
  host.model.restamp();
  let newTid: Dynamic = readTemplateId(movingEl);
  for (let displaced of displacedFollowers as Dynamic) {
    let displacedTid: Dynamic = readTemplateId(displaced.el);
    displacedTid >= 0 && groupTids.push(displacedTid);
  }
  for (let member of blockMembers as Dynamic)
    groupTids.push(readTemplateId(member.el));
  let pins: Dynamic = [];
  pinnedStyles.size > 0 &&
    newTid >= 0 &&
    pins.push({
      tid: newTid,
      el: movingEl,
      pinned: pinnedStyles,
      freeze: move.freezeStyle,
    });
  for (let displaced of displacedFollowers as Dynamic) {
    let displacedTid: Dynamic = readTemplateId(displaced.el);
    displaced.pinned.size > 0 &&
      displacedTid >= 0 &&
      pins.push({
        tid: displacedTid,
        el: displaced.el,
        pinned: displaced.pinned,
        freeze: displaced.freezeStyle,
      });
  }
  for (let blockPin of blockPins as Dynamic) {
    let pinTid: Dynamic = readTemplateId(blockPin.el);
    blockPin.pinned.size > 0 &&
      pinTid >= 0 &&
      pins.push({
        tid: pinTid,
        el: blockPin.el,
        pinned: blockPin.pinned,
        freeze: blockPin.frozen,
      });
  }
  return {
    newTid: newTid,
    movingEl: movingEl,
    groupTids: groupTids,
    reparented: reparented,
    pins: pins,
    kind: move.alt
      ? "duplicate-drag"
      : move.breakout === true
        ? "breakout-drag"
        : "move-drag",
  };
}
export {
  displacedDropFollowers,
  elementMoveRefusal,
  freezeInheritedTextStyle,
  readTemplateId as LayoutMoveElementsGetAttribute,
  overriddenPositionProps as LayoutMoveElementsLeftRightTopConfig,
  moveModelElement,
  sameParentDropGroup,
};
export function installEditorLayoutMoveElements(): () => void {
  return () => {
    overriddenPositionProps = {
      left: ["right"],
      right: ["left"],
      top: ["bottom"],
      bottom: ["top"],
      margin: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
      "grid-area": [
        "grid-row",
        "grid-column",
        "grid-row-start",
        "grid-row-end",
        "grid-column-start",
        "grid-column-end",
      ],
    };
    readTemplateId = (element?: Dynamic): Dynamic =>
      parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10);
  };
}

import type { Dynamic } from "../../runtime-types";

interface SourceDragEffects {
  releasePointer(): void;
  clearSnapGuides(): void;
  clearPendingStyles(): void;
  clearStylePatches(): void;
  cancelMovePreview(gesture: Dynamic): void;
  clearFlowOverlay(): void;
  hideParentPlacementBounds(): void;
  hidePlacementBox(): void;
  hideDragProxy(gesture: Dynamic): void;
  findTemplateInstances(id: string, component: string | null): Dynamic[];
  currentDraggedElement(): Element | null;
  markDraggedElements(element: Element): void;
  clearAttributeEverywhere(attribute: string): void;
  emit(event: object): void;
  refreshChrome(): void;
}

export function dragExitPayload(
  this: Dynamic,
  gesture?: Dynamic,
  copy?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var lift: Dynamic = gesture.lift;
  return {
    gestureKey: gesture.gestureKey,
    tids: [gesture.tid],
    name: gesture.name,
    alt: !!copy,
    w: lift.w,
    h: lift.h,
    ew: lift.ew,
    eh: lift.eh,
    ox: lift.ox,
    oy: lift.oy,
    gx: Math.round(gesture.grabDx / lift.s),
    gy: Math.round(gesture.grabDy / lift.s),
  };
}
/** Transitions and releases the source-side preview while preserving the editor event order. */
export function createSourceDragRelease(options: SourceDragEffects) {
  function revertFollowerStyles(
    this: Dynamic,
    gesture?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var index: Dynamic = 0;
      index < gesture.followers.length;
      index++
    )
      options.emit({
        type: "styleRevert",
        tid: gesture.followers[index].tid,
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        keepUndo: true,
        follower: true,
      });
  }
  function exit(dragGesture: Dynamic, copy: boolean) {
    if (!dragGesture.exited && !dragGesture.followers) {
      dragGesture.exited = true;
      options.cancelMovePreview(dragGesture);
      if (dragGesture.brkFollowers) {
        var element: Dynamic = options.currentDraggedElement();
        if (element) {
          options.markDraggedElements(element);
        }
      }
      var payload: Dynamic = dragExitPayload(dragGesture, copy);
      payload.type = "dragExit";
      options.emit(payload);
      options.clearFlowOverlay();
      options.hideParentPlacementBounds();
      options.hideDragProxy(dragGesture);
      options.hidePlacementBox();
      dragGesture.commit = null;
    }
  }
  function finish(gesture: Dynamic, commit: boolean) {
    options.clearSnapGuides();
    options.releasePointer();
    options.emit({
      type: "dragState",
      live: false,
      gestureKey: gesture.gestureKey,
    });
    if (gesture.exited && !gesture.droppedOut) {
      options.emit({
        type: "dragCancel",
        gestureKey: gesture.gestureKey,
      });
    }
    options.clearPendingStyles();
    options.hideParentPlacementBounds();
    options.clearFlowOverlay();
    for (
      var markedElements: Dynamic = document.querySelectorAll<HTMLElement | SVGElement>(
          "[data-dc-editor-dragging]",
        ),
        markedIndex: Dynamic = 0;
      markedIndex < markedElements.length;
      markedIndex++
    )
      markedElements[markedIndex].style.removeProperty("pointer-events");
    options.clearAttributeEverywhere("data-dc-editor-dragging");
    options.clearAttributeEverywhere("data-dc-drag-parent");
    options.clearAttributeEverywhere("data-dc-drag-follower");
    options.clearAttributeEverywhere("data-dc-drag-block");
    document.body.removeAttribute("data-dc-editor-brk");
    if (gesture.altClone) {
      gesture.altClone.remove();
    }
    options.hideDragProxy(gesture);
    if (gesture.proxy) {
      gesture.proxy.wrap.remove();
    }
    for (
      var proxyIndex: Dynamic = 0;
      proxyIndex < (gesture.groupProxies || []).length;
      proxyIndex++
    )
      gesture.groupProxies[proxyIndex].p.wrap.remove();
    document.body.style.cursor = "";
    var element: Dynamic =
      document.querySelector("[data-dc-dragging]") ||
      (gesture.el && gesture.el.isConnected
        ? gesture.el
        : options.findTemplateInstances(String(gesture.tid), gesture.name)[0] ||
          null);
    if (element) {
      element.style.removeProperty("pointer-events");
      element.removeAttribute("data-dc-dragging");
    }
    options.hidePlacementBox();
    var plan: Dynamic = gesture.commit;
    if (!commit || !plan) {
      options.cancelMovePreview(gesture);
      if (gesture.followers) {
        revertFollowerStyles(gesture);
      }
      if (gesture.brkFollowers)
        for (var followerIndex: Dynamic = 0; followerIndex < gesture.brkFollowers.length; followerIndex++)
          if (gesture.brkFollowers[followerIndex].absStyles) {
            options.emit({
              type: "styleRevert",
              tid: gesture.brkFollowers[followerIndex].tid,
              name: gesture.name,
              gestureKey: gesture.gestureKey,
              keepUndo: true,
              follower: true,
            });
          }
      if (
        gesture.mode === "abs" ||
        gesture.exited ||
        gesture.droppedOut
      ) {
        options.emit({
          type: "styleRevert",
          tid: gesture.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          keepUndo: false,
        });
      }
      options.refreshChrome();
      return;
    }
    if (gesture.alt && gesture.mode === "abs" && plan.kind !== "flow") {
      options.emit({
        type: "styleRevert",
        tid: gesture.tid,
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        keepUndo: true,
      });
    }
    if (plan.kind === "absSame") {
      options.emit({
        type: "move",
        tid: gesture.tid,
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        targetTid: null,
        position: "into",
        alt: gesture.alt,
        absolute: true,
        fixed: !!gesture.fixed,
        absStyles: gesture.absStyles || {},
        followers: gesture.followers
          ? gesture.followers.map(function (
              this: Dynamic,
              follower?: Dynamic,
              ..._unusedNestedArgs: Dynamic[]
            ): Dynamic {
              return {
                tid: follower.tid,
                absStyles: follower.absStyles || {},
                fixed: !!follower.fixed,
              };
            })
          : undefined,
      });
      return;
    }
    if (plan.kind === "abs") {
      options.emit({
        type: "move",
        tid: gesture.tid,
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        targetTid: plan.tid,
        position: plan.tid == null ? "root-end" : "into",
        epoch: plan.epoch,
        alt: gesture.alt,
        absolute: true,
        absStyles: gesture.absStyles || {},
        parentNeedsPositioning: plan.needsPositioning,
        flatten:
          (!gesture.alt && !plan.brk && gesture.flatten) || undefined,
        breakout: plan.brk || undefined,
        freezeStyle: gesture.freezeStyle || undefined,
        followers: plan.followers,
      });
      return;
    }
    options.emit({
      type: "move",
      tid: gesture.tid,
      name: gesture.name,
      gestureKey: gesture.gestureKey,
      targetTid: plan.slot.targetTid,
      position: plan.slot.position,
      alt: gesture.alt,
      epoch: plan.slot.epoch,
      clearPositioning: plan.clearPositioning,
      freezeStyle: gesture.freezeStyle || undefined,
      group: gesture.group || undefined,
    });
  }
  function park(dragGesture: Dynamic) {
    if (dragGesture.hostKey && !dragGesture.hostParked) {
      dragGesture.hostParked = true;
      options.clearPendingStyles();
      options.cancelMovePreview(dragGesture);
      options.clearFlowOverlay();
      options.hideParentPlacementBounds();
      options.hideDragProxy(dragGesture);
      if (dragGesture.altClone) {
        dragGesture.altClone.style.display = "none";
      }
      options.clearStylePatches();
      options.refreshChrome();
    }
  }
  function unpark(dragGesture: Dynamic) {
    if (dragGesture.hostKey && dragGesture.hostParked) {
      dragGesture.hostParked = false;
      if (dragGesture.altClone) {
        dragGesture.altClone.style.display = "";
      }
    }
  }
  return { exit, finish, park, unpark };
}

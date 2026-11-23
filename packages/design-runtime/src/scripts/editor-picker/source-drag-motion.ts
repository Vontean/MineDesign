import type { Dynamic } from "../../runtime-types";

interface DragPointer {
  clientX: number;
  clientY: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

interface MotionOptions {
  exit(copy: boolean): void;
  refreshChrome(): void;
  emit(event: object): void;
  isBreakoutModifier(event: DragPointer): boolean;
  preview: {
    cancel(gesture: Dynamic): void;
    syncCopy(): void;
    positionProxy(event: DragPointer, invalid?: boolean): void;
    hideProxy(gesture: Dynamic): void;
    emitFlow(plan: Dynamic, clearPositioning: boolean): void;
  };
  elements: {
    dragged(): Dynamic;
    breakoutFollowers(gesture: Dynamic): Dynamic;
    group(): Dynamic;
    mark(element: Element, group: Element[]): void;
    isRootComponent(name: string | null): boolean;
    find(id: string, name: string | null): Dynamic[];
    followerInstances(follower: Dynamic, name: string | null): Dynamic[];
  };
  drop: {
    resolve(x: number, y: number, gesture: Dynamic, element: Element, group: Dynamic): Dynamic;
    clearFlow(): void;
    planFlow(container: Element, tid: number | null, source: Element, x: number, y: number, previous: Dynamic, preserve: boolean, group: Dynamic): Dynamic;
    paintFlow(container: Element, source: Element, plan: Dynamic, group: Dynamic): void;
  };
  guides: {
    clearSnap(): boolean;
    hideParent(): void;
    showParent(bounds: DOMRectReadOnly, label: string): void;
    snapAbsolute(event: DragPointer, element: Element, dx: number, dy: number, bounds?: Dynamic): Dynamic;
    hideBox(): void;
    ensureBox(): Dynamic;
    cssPixels(pixels: number): number;
  };
  styles: {
    patch(key: string, elements: Element[], styles: Dynamic): void;
    queue(event: object): void;
    clearPending(): void;
    restoreResizeDimensions(style: Dynamic, gesture: Dynamic, layout: Dynamic): void;
    inheritedText(element: Element): Dynamic;
  };
}

/** Calculates and paints the active source drag for one pointer sample. */
export function createSourceDragMotion(options: MotionOptions) {
  return function updateSourceDrag(gesture: Dynamic, event: DragPointer) {
    gesture.lastPt = {
      x: event.clientX,
      y: event.clientY,
      shift: event.shiftKey,
    };
    var dragMode: Dynamic =
      event.clientX < 0 ||
      event.clientY < 0 ||
      event.clientX > window.innerWidth ||
      event.clientY > window.innerHeight;
    const hadSnapGuides = options.guides.clearSnap();
    if (
      dragMode &&
      !gesture.followers &&
      !gesture.group &&
      !gesture.hostKey
    ) {
      if (!gesture.exited) {
        options.exit(!!event.altKey);
      }
      if (hadSnapGuides) {
        options.refreshChrome();
      }
      if (
        !gesture.lastStream ||
        Date.now() - gesture.lastStream > 30
      ) {
        gesture.lastStream = Date.now();
        options.emit({
          type: "dragMove",
          gestureKey: gesture.gestureKey,
          x: event.clientX,
          y: event.clientY,
          alt: !!event.altKey,
          ctrl: !!event.ctrlKey,
        });
      }
      return;
    }
    if (gesture.exited) {
      gesture.exited = false;
      options.emit({
        type: "dragReturn",
        gestureKey: gesture.gestureKey,
      });
    }
    var elementX: Dynamic = gesture.alt;
    gesture.alt =
      gesture.followers || gesture.group ? false : event.altKey;
    var elementY: Dynamic = gesture.canBreak && options.isBreakoutModifier(event);
    gesture.brk = elementY;
    if (
      elementY !== document.body.hasAttribute("data-dc-editor-brk")
    ) {
      if (elementY) {
        document.body.setAttribute("data-dc-editor-brk", "");
      } else {
        document.body.removeAttribute("data-dc-editor-brk");
      }
    }
    var groupIndex: Dynamic = elementY && !!gesture.brkFollowers;
    if (groupIndex) {
      gesture.alt = false;
    }
    if (gesture.alt && !elementX) {
      options.preview.cancel(gesture);
    }
    options.preview.syncCopy();
    var groupBounds: Dynamic = options.elements.dragged();
    if (!groupBounds) {
      if (hadSnapGuides) {
        options.refreshChrome();
      }
      return;
    }
    var groupPosition: Dynamic = groupIndex
      ? options.elements.breakoutFollowers(gesture)
      : null;
    var groupItems: Dynamic = [];
    if (groupPosition)
      for (
        var itemIndex: Dynamic = 0;
        itemIndex < gesture.brkFollowers.length;
        itemIndex++
      )
        if (groupPosition[gesture.brkFollowers[itemIndex].tid]) {
          groupItems.push(groupPosition[gesture.brkFollowers[itemIndex].tid]);
        }
    var groupDragState: Dynamic =
      gesture.group && !elementY ? options.elements.group() : null;
    if (groupDragState && gesture.groupProxies && gesture.epoch > 0) {
      for (
        var dragState: Dynamic = {}, blockIndex: Dynamic = 0;
        blockIndex < groupDragState.length;
        blockIndex++
      )
        dragState[groupDragState[blockIndex].getAttribute("data-dc-drag-block")] = true;
      for (
        var textStyle: Dynamic = 0;
        textStyle < gesture.groupProxies.length;
        textStyle++
      )
        gesture.groupProxies[textStyle].out =
          !dragState[gesture.groupProxies[textStyle].tid];
    }
    options.elements.mark(groupBounds, groupDragState || groupItems);
    var elementPositioning: Dynamic = gesture.followers
      ? {
          el: gesture.origParentStamped,
          tid: null,
        }
      : options.drop.resolve(
          event.clientX,
          event.clientY,
          gesture,
          groupBounds,
          groupDragState,
        );
    if (
      gesture.group &&
      (dragMode || (groupDragState && groupDragState.length && elementPositioning.tid == null))
    ) {
      elementPositioning = {
        el: null,
        tid: null,
        invalid: true,
      };
    }
    if (gesture.hostKey && dragMode) {
      elementPositioning = {
        el: null,
        tid: null,
        invalid: true,
      };
    }
    if (elementPositioning.invalid) {
      options.preview.cancel(gesture);
      options.drop.clearFlow();
      options.guides.hideParent();
      options.preview.positionProxy(event, true);
      options.guides.hideBox();
      gesture.commit = null;
      options.refreshChrome();
      return;
    }
    var nextPosition: Dynamic = elementPositioning.el === gesture.origParentStamped;
    if (elementPositioning.tid == null) {
      options.guides.hideParent();
    } else {
      options.guides.showParent(elementPositioning.el.getBoundingClientRect(), "");
    }
    if (gesture.mode === "abs" && nextPosition) {
      options.preview.cancel(gesture);
      gesture.previewParentEl = null;
      options.drop.clearFlow();
      options.preview.hideProxy(gesture);
      options.guides.hideBox();
      var ancestorTransform: Dynamic = gesture.hostKey
        ? {
            x: event.clientX - gesture.startX,
            y: event.clientY - gesture.startY,
          }
        : options.guides.snapAbsolute(
            event,
            groupBounds,
            event.clientX - gesture.startX,
            event.clientY - gesture.startY,
            {
              x: !gesture.bothX,
              y: !gesture.bothY,
            },
          );
      var absoluteDeltaX: Dynamic =
        (ancestorTransform.x * gesture.am.x) / gesture.scl;
      var absoluteDeltaY: Dynamic =
        (ancestorTransform.y * gesture.am.y) / gesture.scl;
      var absoluteStyles: Dynamic = {};
      if (!gesture.bothX) {
        if (gesture.useRight) {
          absoluteStyles.right =
            Math.round(gesture.startRight - absoluteDeltaX) + "px";
        } else {
          absoluteStyles.left =
            Math.round(gesture.startLeft + absoluteDeltaX) + "px";
        }
      }
      if (!gesture.bothY) {
        if (gesture.useBottom) {
          absoluteStyles.bottom =
            Math.round(gesture.startBottom - absoluteDeltaY) + "px";
        } else {
          absoluteStyles.top =
            Math.round(gesture.startTop + absoluteDeltaY) + "px";
        }
      }
      gesture.absStyles = absoluteStyles;
      gesture.commit =
        gesture.bothX && gesture.bothY
          ? null
          : {
              kind: "absSame",
            };
      if (options.elements.isRootComponent(gesture.name)) {
        var flowState: Dynamic = options.elements.find(
          String(gesture.tid),
          gesture.name,
        );
        if (flowState.indexOf(groupBounds) < 0) {
          flowState = [groupBounds];
        }
        gesture.lastPatch = absoluteStyles;
        options.styles.patch(gesture.gestureKey, flowState, absoluteStyles);
      }
      options.styles.queue({
        type: "stylePreview",
        tid: gesture.tid,
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        styles: absoluteStyles,
      });
      if (gesture.followers)
        for (
          var candidateIndex: Dynamic = 0;
          candidateIndex < gesture.followers.length;
          candidateIndex++
        ) {
          var candidateElement: Dynamic = gesture.followers[candidateIndex];
          var candidateAbsoluteStyles: Dynamic = {};
          if (candidateElement.useRight) {
            candidateAbsoluteStyles.right =
              Math.round(candidateElement.startRight - absoluteDeltaX) + "px";
          } else {
            candidateAbsoluteStyles.left =
              Math.round(candidateElement.startLeft + absoluteDeltaX) + "px";
          }
          if (candidateElement.useBottom) {
            candidateAbsoluteStyles.bottom =
              Math.round(candidateElement.startBottom - absoluteDeltaY) + "px";
          } else {
            candidateAbsoluteStyles.top =
              Math.round(candidateElement.startTop + absoluteDeltaY) + "px";
          }
          candidateElement.absStyles = candidateAbsoluteStyles;
          if (options.elements.isRootComponent(gesture.name)) {
            candidateElement.lastPatch = candidateAbsoluteStyles;
            options.styles.patch(
              gesture.gestureKey + ":" + candidateElement.tid,
              options.elements.followerInstances(candidateElement, gesture.name),
              candidateAbsoluteStyles,
            );
          }
          options.styles.queue({
            type: "stylePreview",
            tid: candidateElement.tid,
            name: gesture.name,
            gestureKey: gesture.gestureKey,
            styles: candidateAbsoluteStyles,
            follower: true,
          });
        }
      options.refreshChrome();
      return;
    }
    if (gesture.mode === "abs" || elementPositioning.tid == null || elementY) {
      options.drop.clearFlow();
      options.preview.hideProxy(gesture);
      if (
        !gesture.absParent ||
        gesture.absParent.el !== elementPositioning.el
      ) {
        var dropPosition: Dynamic =
          elementPositioning.tid != null ? getComputedStyle(elementPositioning.el) : null;
        gesture.absParent = {
          el: elementPositioning.el,
          display: dropPosition ? dropPosition.display : "",
          needsPositioning: !!dropPosition && dropPosition.position === "static",
        };
      }
      var elementBounds: Dynamic = elementPositioning.el.getBoundingClientRect();
      var dragStartRect: Dynamic = gesture.startRect;
      var parentBounds: Dynamic =
        event.clientX - gesture.grabDx - dragStartRect.left;
      var targetBounds: Dynamic =
        event.clientY - gesture.grabDy - dragStartRect.top;
      var positionDelta: Dynamic =
        (gesture.alt && gesture.mode !== "abs") ||
        gesture.hostKey
          ? {
              x: parentBounds,
              y: targetBounds,
            }
          : options.guides.snapAbsolute(event, groupBounds, parentBounds, targetBounds);
      var dragPreview: Dynamic = dragStartRect.left + positionDelta.x;
      var previewElement: Dynamic = dragStartRect.top + positionDelta.y;
      var previewRect: Dynamic =
        elementPositioning.tid != null
          ? elementPositioning.el.clientLeft - elementPositioning.el.scrollLeft
          : 0;
      var previewPosition: Dynamic =
        elementPositioning.tid != null
          ? elementPositioning.el.clientTop - elementPositioning.el.scrollTop
          : 0;
      gesture.absStyles = {
        left:
          Math.round(
            (dragPreview - elementBounds.left) / gesture.scl - previewRect,
          ) + "px",
        top:
          Math.round(
            (previewElement - elementBounds.top) / gesture.scl - previewPosition,
          ) + "px",
      };
      if (
        elementY &&
        (options.styles.restoreResizeDimensions(
          gesture.absStyles,
          gesture,
          gesture.absParent.display,
        ),
        groupIndex)
      )
        for (
          var followerIndex: Dynamic = 0;
          followerIndex < gesture.brkFollowers.length;
          followerIndex++
        ) {
          var follower: Dynamic = gesture.brkFollowers[followerIndex];
          var followerPosition: Dynamic = groupPosition[follower.tid] || null;
          follower.skip = !!followerPosition && followerPosition.contains(elementPositioning.el);
          if (!follower.skip) {
            if (follower.freezeStyle === undefined) {
              follower.freezeStyle = followerPosition
                ? options.styles.inheritedText(followerPosition)
                : undefined;
            }
            follower.absStyles = {
              left:
                Math.round(
                  (follower.startRect.left + positionDelta.x - elementBounds.left) /
                    gesture.scl -
                    previewRect,
                ) + "px",
              top:
                Math.round(
                  (follower.startRect.top + positionDelta.y - elementBounds.top) /
                    gesture.scl -
                    previewPosition,
                ) + "px",
            };
            options.styles.restoreResizeDimensions(
              follower.absStyles,
              follower,
              gesture.absParent.display,
            );
          }
        }
      var dragFollowers: Dynamic = groupIndex
        ? gesture.brkFollowers
            .filter(function (
              this: Dynamic,
              followerElement?: Dynamic,
              ..._unusedNestedArgs: Dynamic[]
            ): Dynamic {
              return !followerElement.skip;
            })
            .map(function (
              this: Dynamic,
              input?: Dynamic,
              ..._unusedNestedArgs: Dynamic[]
            ): Dynamic {
              return {
                tid: input.tid,
                absStyles: input.absStyles,
                freezeStyle: input.freezeStyle || undefined,
              };
            })
        : undefined;
      gesture.commit = {
        kind: "abs",
        tid: elementPositioning.tid,
        epoch: gesture.epoch,
        brk: elementY,
        followers: dragFollowers,
        needsPositioning: gesture.absParent.needsPositioning,
      };
      if (gesture.alt || gesture.hostKey) {
        options.preview.cancel(gesture);
        gesture.previewParentEl = null;
        var followerStartRect: Dynamic = gesture.startRect;
        var followerOffset: Dynamic = options.guides.ensureBox();
        followerOffset.box.style.display = "block";
        followerOffset.box.style.left = dragPreview + "px";
        followerOffset.box.style.top = previewElement + "px";
        followerOffset.box.style.width = followerStartRect.width + "px";
        followerOffset.box.style.height = followerStartRect.height + "px";
        followerOffset.label.style.display = "none";
        options.refreshChrome();
        return;
      }
      options.guides.hideBox();
      var dragPreviewKey: Dynamic = elementY ? "abs|brk" : "abs";
      if (
        !gesture.previewActive ||
        gesture.previewParentEl !== elementPositioning.el ||
        gesture.previewKey !== dragPreviewKey
      ) {
        gesture.previewParentEl = elementPositioning.el;
        gesture.previewKey = dragPreviewKey;
        gesture.previewActive = true;
        options.styles.clearPending();
        options.emit({
          type: "movePreview",
          tid: gesture.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          targetTid: elementPositioning.tid,
          position: elementPositioning.tid == null ? "root-end" : "into",
          epoch: gesture.epoch,
          absolute: true,
          absStyles: gesture.absStyles,
          parentNeedsPositioning: gesture.absParent.needsPositioning,
          flatten:
            (!gesture.alt && !elementY && gesture.flatten) || undefined,
          freezeStyle: gesture.freezeStyle || undefined,
          followers: dragFollowers,
          group: gesture.group || undefined,
        });
      } else if (
        (options.elements.isRootComponent(gesture.name) &&
          ((gesture.lastPatch = gesture.absStyles),
          options.styles.patch(
            gesture.gestureKey,
            [groupBounds],
            gesture.absStyles,
          )),
        options.styles.queue({
          type: "stylePreview",
          tid: gesture.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          styles: gesture.absStyles,
        }),
        groupIndex)
      )
        for (
          var selectedIndex: Dynamic = 0;
          selectedIndex < gesture.brkFollowers.length;
          selectedIndex++
        ) {
          var selectedElement: Dynamic = gesture.brkFollowers[selectedIndex];
          var selectedRect: Dynamic = groupPosition[selectedElement.tid];
          if (!(selectedElement.skip || !selectedRect)) {
            if (options.elements.isRootComponent(gesture.name)) {
              options.styles.patch(
                gesture.gestureKey + ":" + selectedElement.tid,
                [selectedRect],
                selectedElement.absStyles,
              );
            }
            options.styles.queue({
              type: "stylePreview",
              tid: selectedElement.tid,
              name: gesture.name,
              gestureKey: gesture.gestureKey,
              styles: selectedElement.absStyles,
              follower: true,
            });
          }
        }
      options.refreshChrome();
      return;
    }
    options.guides.hideBox();
    gesture.previewParentEl = null;
    if (gesture.commit && gesture.commit.kind === "abs") {
      options.styles.clearPending();
      gesture.lastPatch = null;
    }
    var dragCommit: Dynamic =
      gesture.commit &&
      gesture.commit.kind === "flow" &&
      gesture.flowBox === elementPositioning.el
        ? gesture.commit.slot
        : null;
    var dragResult: Dynamic = !!(
      dragCommit &&
      gesture.slotPt &&
      Math.abs(event.clientX - gesture.slotPt.x) < options.guides.cssPixels(4) &&
      Math.abs(event.clientY - gesture.slotPt.y) < options.guides.cssPixels(4)
    );
    var dropSlot: Dynamic = options.drop.planFlow(
      elementPositioning.el,
      elementPositioning.tid,
      groupBounds,
      event.clientX,
      event.clientY,
      dragCommit,
      dragResult,
      groupDragState,
    );
    dropSlot.epoch = gesture.epoch;
    if (!dragCommit || dropSlot.n !== dragCommit.n) {
      gesture.slotPt = {
        x: event.clientX,
        y: event.clientY,
      };
    }
    gesture.flowBox = elementPositioning.el;
    options.preview.positionProxy(event);
    options.drop.paintFlow(elementPositioning.el, groupBounds, dropSlot, groupDragState);
    gesture.commit = {
      kind: "flow",
      slot: dropSlot,
      clearPositioning: false,
    };
    if (!gesture.alt) {
      options.preview.emitFlow(dropSlot, false);
    }
    options.refreshChrome();
    return;
  };
}

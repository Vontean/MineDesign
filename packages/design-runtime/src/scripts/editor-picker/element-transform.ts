import type { Dynamic } from "../../runtime-types";
import {
  ancestorTransformSigns,
  decomposedElementTransform,
  elementLayoutDimensions,
  fractionalTransformOrigin,
  identityTransformMatrix,
  normalizeDegrees,
  parseTransformFunctions,
  pixelLengthOrFallback,
  positioningAnchors,
  resizeBoxDimensions,
  rotateMatrix,
  serializeRotatedTransform,
  transformedResizeDirections,
  transformOriginCompensation,
} from "./element-transform-geometry";
import {
  getGroupResizeLimits,
  rotatePointAround,
  scalePointBetweenBoxes,
  snapRotationAngle,
  updateElementResize,
} from "./resize-geometry";
import { resizeLineFromEndpoints } from "./svg-line-geometry";
import { applySvgEndpointGeometry, restoreSvgLine, snapshotSvgLine, type createSvgPreviewRollback } from "./svg-line-preview";

interface TransformOptions {
  canStart(): boolean;
  selection: {
    read(): { tids: number[]; name: string | null };
    members(): Dynamic[] | null;
    findInstances(tid: string, name: string | null): Dynamic[];
  };
  elements: {
    outerSvg(element: Dynamic): Dynamic;
    firstRendered(instances: Dynamic[]): Dynamic;
    componentName(element: Element): string | null;
    unwrap(element: Dynamic): Dynamic;
    viewportScale(element: Element | null): number;
    parentScale(element: Element | null): number;
    editableLine(element: Dynamic): Dynamic;
    isRoot(componentName: string | null): boolean;
  };
  styles: {
    patch(key: string, elements: Element[], styles: Record<string, string>): void;
    queue(preview: object): void;
    clearPending(): void;
  };
  svgRollback: ReturnType<typeof createSvgPreviewRollback>;
  activeTool(): string;
  emit(event: object): void;
  refreshChrome(): void;
}

export function unionMemberBounds(members: readonly { r: Pick<DOMRectReadOnly, "left" | "top" | "right" | "bottom"> }[]) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const { r } of members) {
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  return { x: left, y: top, w: right - left, h: bottom - top };
}

export function createElementTransform(options: TransformOptions) {
  let transformGesture: Dynamic = null;
  let rotationHistory: Dynamic[] = [];

  function resolveSelectionAnchors(
    this: Dynamic,
    stored?: Dynamic,
    members?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (stored.anchors.length !== members.length) return null;
    for (
      var sumX: Dynamic = 0,
        sumY: Dynamic = 0,
        candidates: Dynamic = [],
        anchorIndex: Dynamic = 0;
      anchorIndex < stored.anchors.length;
      anchorIndex++
    ) {
      for (
        var anchor: Dynamic = stored.anchors[anchorIndex],
          member: Dynamic = null,
          memberIndex: Dynamic = 0;
        memberIndex < members.length;
        memberIndex++
      )
        if (members[memberIndex].tid === anchor.tid) {
          member = members[memberIndex];
          break;
        }
      var tolerance: Dynamic = 0.6 + 1.2 * (member && member.scl > 0 ? member.scl : 1);
      if (
        !member ||
        member.deg !== anchor.deg ||
        Math.abs(member.r.width - anchor.w) > tolerance ||
        Math.abs(member.r.height - anchor.h) > tolerance
      )
        return null;
      var candidate: Dynamic = {
        x: member.r.left + member.r.width / 2 - anchor.dx,
        y: member.r.top + member.r.height / 2 - anchor.dy,
        tol: tolerance,
      };
      candidates.push(candidate);
      sumX += candidate.x;
      sumY += candidate.y;
    }
    for (
      var center: Dynamic = {
          x: sumX / candidates.length,
          y: sumY / candidates.length,
        },
        candidateIndex: Dynamic = 0;
      candidateIndex < candidates.length;
      candidateIndex++
    )
      if (
        Math.abs(candidates[candidateIndex].x - center.x) > candidates[candidateIndex].tol ||
        Math.abs(candidates[candidateIndex].y - center.y) > candidates[candidateIndex].tol
      )
        return null;
    return {
      c: center,
      w: stored.w,
      h: stored.h,
      deg: stored.deg,
    };
  }
  function storedSelectionTransform(
    this: Dynamic,
    members?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      rotationHistory.length &&
      rotationHistory[0].key !==
        options.selection.read().name + "|" + options.selection.read().tids.join(",")
    ) {
      rotationHistory = [];
    }
    for (
      var historyIndex: Dynamic = rotationHistory.length - 1;
      historyIndex >= 0;
      historyIndex--
    ) {
      var restored: Dynamic = resolveSelectionAnchors(
        rotationHistory[historyIndex],
        members,
      );
      if (restored) return restored;
    }
    return null;
  }
  function transformTargetInstances(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      !options.canStart() ||
      transformGesture ||
      options.selection.read().tids.length !== 1
    )
      return null;
    const selection = options.selection.read();
    var instances: Dynamic = options.selection.findInstances(String(selection.tids[0]), selection.name);
    if (instances.length === 0) return null;
    for (var index: Dynamic = 0; index < instances.length; index++)
      instances[index] = options.elements.outerSvg(instances[index]);
    return {
      el: options.elements.firstRendered(instances) || instances[0],
      els: instances,
    };
  }
  function beginResize(
    this: Dynamic,
    direction?: Dynamic,
    pointerX?: Dynamic,
    pointerY?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (/^(n|s|e|w|nw|ne|sw|se)$/.test(direction)) {
      if (options.selection.read().tids.length > 1) {
        beginGroupTransform(direction, pointerX, pointerY);
        return;
      }
      var target: Dynamic = transformTargetInstances();
      if (target) {
        var element: Dynamic = target.el;
        var computed: Dynamic = getComputedStyle(element);
        var inline: Dynamic = element.style;
        var isPositioned: Dynamic =
          computed.position === "absolute" || computed.position === "fixed";
        var bounds: Dynamic = element.getBoundingClientRect();
        var pose: Dynamic = decomposedElementTransform(element);
        var anchors: Dynamic = positioningAnchors(inline);
        var plain: Dynamic = !pose || pose.plain;
        var viewportScale: Dynamic = plain
          ? options.elements.viewportScale(element)
          : options.elements.parentScale(element);
        var layoutSize: Dynamic = plain
          ? {
              w: bounds.width / viewportScale,
              h: bounds.height / viewportScale,
            }
          : elementLayoutDimensions(element, computed);
        var origin: Dynamic = fractionalTransformOrigin(computed, layoutSize);
        var grip: Dynamic = transformedResizeDirections(
          direction,
          pose,
          ancestorTransformSigns(element),
        );
        transformGesture = {
          el: element,
          els: target.els,
          tid: parseInt(element.getAttribute("data-dc-tpl"), 10),
          name: options.elements.componentName(element),
          dir: grip.dir,
          west: grip.west,
          east: grip.east,
          north: grip.north,
          south: grip.south,
          gestureKey: "g" + Date.now(),
          scl: viewportScale,
          x0: pointerX,
          y0: pointerY,
          w0: layoutSize.w,
          h0: layoutSize.h,
          plain: plain,
          m: plain ? identityTransformMatrix : pose.m,
          grip: grip,
          fx: origin.fx,
          fy: origin.fy,
          lastW: null,
          lastH: null,
          boxDx:
            computed.boxSizing === "border-box"
              ? 0
              : (parseFloat(computed.paddingLeft) || 0) +
                (parseFloat(computed.paddingRight) || 0) +
                (parseFloat(computed.borderLeftWidth) || 0) +
                (parseFloat(computed.borderRightWidth) || 0),
          boxDy:
            computed.boxSizing === "border-box"
              ? 0
              : (parseFloat(computed.paddingTop) || 0) +
                (parseFloat(computed.paddingBottom) || 0) +
                (parseFloat(computed.borderTopWidth) || 0) +
                (parseFloat(computed.borderBottomWidth) || 0),
          absX: isPositioned && anchors.x === "left",
          absY: isPositioned && anchors.y === "top",
          pinR: isPositioned && anchors.x === "right",
          pinB: isPositioned && anchors.y === "bottom",
          startLeft: pixelLengthOrFallback(inline.left, computed.left),
          startTop: pixelLengthOrFallback(inline.top, computed.top),
          startRight: pixelLengthOrFallback(inline.right, computed.right),
          startBottom: pixelLengthOrFallback(inline.bottom, computed.bottom),
          lastLeft: null,
          lastTop: null,
          lastRight: null,
          lastBottom: null,
        };
      }
    }
  }
  function beginRotation(
    this: Dynamic,
    pointerX?: Dynamic,
    pointerY?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (options.selection.read().tids.length > 1) {
      beginGroupTransform(null, pointerX, pointerY);
      return;
    }
    var target: Dynamic = transformTargetInstances();
    if (target) {
      var element: Dynamic = target.el;
      var pose: Dynamic = decomposedElementTransform(element);
      var parsed: Dynamic =
        pose && (element.style.transform || pose.m.none)
          ? parseTransformFunctions(element.style.transform)
          : null;
      if (!(!parsed || options.elements.editableLine(element))) {
        var computed: Dynamic = getComputedStyle(element);
        var bounds: Dynamic = element.getBoundingClientRect();
        var layoutSize: Dynamic = elementLayoutDimensions(element, computed);
        var origin: Dynamic = fractionalTransformOrigin(computed, layoutSize);
        var parentScale: Dynamic = options.elements.parentScale(element);
        var centerOffsetX: Dynamic = (0.5 - origin.fx) * layoutSize.w;
        var centerOffsetY: Dynamic = (0.5 - origin.fy) * layoutSize.h;
        var ancestorSigns: Dynamic = ancestorTransformSigns(element);
        var pivotX: Dynamic =
          bounds.left +
          bounds.width / 2 -
          parentScale * ancestorSigns.x * (pose.m.a * centerOffsetX + pose.m.c * centerOffsetY);
        var pivotY: Dynamic =
          bounds.top +
          bounds.height / 2 -
          parentScale * ancestorSigns.y * (pose.m.b * centerOffsetX + pose.m.d * centerOffsetY);
        transformGesture = {
          rotate: true,
          el: element,
          els: target.els,
          tid: parseInt(element.getAttribute("data-dc-tpl"), 10),
          name: options.elements.componentName(element),
          gestureKey: "g" + Date.now(),
          tf: parsed,
          sense: ancestorSigns.x * ancestorSigns.y,
          px: pivotX,
          py: pivotY,
          a0: Math.atan2(pointerY - pivotY, pointerX - pivotX),
          deg0: parsed.deg,
          lastDeg: null,
          lastPatch: null,
        };
      }
    }
  }
  function beginGroupTransform(
    this: Dynamic,
    direction?: Dynamic,
    pointerX?: Dynamic,
    pointerY?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (options.canStart() && !transformGesture) {
      var members: Dynamic = options.selection.members();
      if (members) {
        options.svgRollback.clear();
        for (
          var stored: Dynamic = storedSelectionTransform(members),
            bounds: Dynamic = stored ? null : unionMemberBounds(members),
            groupBox: Dynamic = stored || {
              c: {
                x: bounds.x + bounds.w / 2,
                y: bounds.y + bounds.h / 2,
              },
              w: bounds.w,
              h: bounds.h,
              deg: 0,
            },
            hasMovableMember: Dynamic = false,
            memberMinimums: Dynamic = [],
            memberIndex: Dynamic = 0;
          memberIndex < members.length;
          memberIndex++
        ) {
          var member: Dynamic = members[memberIndex];
          var element: Dynamic = member.el;
          var computed: Dynamic = member.cs;
          var memberBounds: Dynamic = member.r;
          member.c0 = {
            x: memberBounds.left + memberBounds.width / 2,
            y: memberBounds.top + memberBounds.height / 2,
          };
          member.c1 = member.c0;
          if (
            direction
              ? !(member.sizable || member.movable)
              : !(member.rotatable || member.movable)
          ) {
            member.still = true;
            continue;
          }
          hasMovableMember = true;
          if (member.sep) {
            member.scl =
              options.elements.viewportScale(element.parentElement) ||
              options.elements.viewportScale(element) ||
              1;
            member.startRect = memberBounds;
            member.startLeft = parseFloat(element.style.left) || 0;
            member.startTop = parseFloat(element.style.top) || 0;
            member.shaft = member.sep.shaft;
            member.svgSnapshot = snapshotSvgLine(element, member.shaft);
            member.p0 = {
              x: memberBounds.left + (member.sep.px / member.sep.vbW) * memberBounds.width,
              y: memberBounds.top + (member.sep.py / member.sep.vbH) * memberBounds.height,
            };
            member.q0 = {
              x: memberBounds.left + (member.sep.tx / member.sep.vbW) * memberBounds.width,
              y: memberBounds.top + (member.sep.ty / member.sep.vbH) * memberBounds.height,
            };
            member.back = member.sep.back;
            member.startBack = member.sep.startBack;
            continue;
          }
          var plain: Dynamic = !member.pose || member.pose.plain;
          member.s = plain
            ? options.elements.viewportScale(member.pe)
            : options.elements.parentScale(element);
          var layoutSize: Dynamic = plain
            ? {
                w: memberBounds.width / member.s,
                h: memberBounds.height / member.s,
              }
            : elementLayoutDimensions(element, computed);
          var origin: Dynamic = fractionalTransformOrigin(computed, layoutSize);
          member.w0 = layoutSize.w;
          member.h0 = layoutSize.h;
          member.fx = origin.fx;
          member.fy = origin.fy;
          member.m = plain ? identityTransformMatrix : member.pose.m;
          member.rot = plain ? 0 : member.pose.rot;
          member.boxDx =
            computed.boxSizing === "border-box"
              ? 0
              : (parseFloat(computed.paddingLeft) || 0) +
                (parseFloat(computed.paddingRight) || 0) +
                (parseFloat(computed.borderLeftWidth) || 0) +
                (parseFloat(computed.borderRightWidth) || 0);
          member.boxDy =
            computed.boxSizing === "border-box"
              ? 0
              : (parseFloat(computed.paddingTop) || 0) +
                (parseFloat(computed.paddingBottom) || 0) +
                (parseFloat(computed.borderTopWidth) || 0) +
                (parseFloat(computed.borderBottomWidth) || 0);
          member.tf = member.rotatable
            ? parseTransformFunctions(element.style.transform)
            : null;
          if (direction && member.sizable) {
            memberMinimums.push({
              w: memberBounds.width,
              h: memberBounds.height,
              min: {
                w: 8 * member.s,
                h: 8 * member.s,
              },
            });
          }
        }
        for (
          var lockAspectRatio: Dynamic = groupBox.deg !== 0,
            rotationBlocked: Dynamic = false,
            rotationIndex: Dynamic = 0;
          rotationIndex < members.length;
          rotationIndex++
        ) {
          if (members[rotationIndex].sizable && members[rotationIndex].turned) {
            lockAspectRatio = true;
          }
          if (members[rotationIndex].rotatable && !members[rotationIndex].movable) {
            rotationBlocked = true;
          }
        }
        if (
          !(
            !hasMovableMember ||
            !(groupBox.w > 0) ||
            !(groupBox.h > 0) ||
            (direction ? lockAspectRatio && direction.length < 2 : rotationBlocked)
          )
        ) {
          var limits: Dynamic = getGroupResizeLimits(
            {
              x: 0,
              y: 0,
              w: groupBox.w,
              h: groupBox.h,
            },
            memberMinimums,
          );
          limits.min = {
            w: Math.max(limits.min.w, Math.min(8, groupBox.w)),
            h: Math.max(limits.min.h, Math.min(8, groupBox.h)),
          };
          transformGesture = {
            group: true,
            rotate: !direction,
            name: options.selection.read().name,
            gestureKey: "g" + Date.now(),
            members: members,
            dir: direction,
            west: !!direction && direction.indexOf("w") >= 0,
            east: !!direction && direction.indexOf("e") >= 0,
            north: !!direction && direction.indexOf("n") >= 0,
            south: !!direction && direction.indexOf("s") >= 0,
            x0: pointerX,
            y0: pointerY,
            f0: groupBox,
            live: groupBox,
            lim: limits,
            lock: lockAspectRatio,
            a0: Math.atan2(pointerY - groupBox.c.y, pointerX - groupBox.c.x),
            lastDeg: null,
            previewed: false,
          };
        }
      }
    }
  }
  function reapplyGroupTransforms(
    this: Dynamic,
    gesture?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var index: Dynamic = 0;
      index < gesture.members.length;
      index++
    ) {
      var member: Dynamic = gesture.members[index];
      var instances: Dynamic = member.el.isConnected
        ? [member.el]
        : options.selection.findInstances(String(member.tid), gesture.name);
      if (member.lastPatch) {
        options.styles.patch(
          gesture.gestureKey + ":" + member.tid,
          instances,
          member.lastPatch,
        );
      }
      if (member.last && instances[0]) {
        var line: Dynamic = options.elements.editableLine(instances[0]);
        if (line) {
          applySvgEndpointGeometry(instances[0], line.shaft, member.last);
        }
      }
    }
  }
  function pointInGroupCoordinates(
    this: Dynamic,
    group?: Dynamic,
    point?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var unrotated: Dynamic = rotatePointAround(point, group.c, -group.deg);
    return {
      x: unrotated.x - group.c.x,
      y: unrotated.y - group.c.y,
    };
  }
  function pointFromGroupCoordinates(
    this: Dynamic,
    group?: Dynamic,
    point?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return rotatePointAround(
      {
        x: group.c.x + point.x,
        y: group.c.y + point.y,
      },
      group.c,
      group.deg,
    );
  }
  function updateGroupTransform(
    this: Dynamic,
    pointerX?: Dynamic,
    pointerY?: Dynamic,
    snap?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var gesture: Dynamic = transformGesture;
    var initialBox: Dynamic = gesture.f0;
    var horizontalScale: Dynamic = 1;
    var mapPoint: Dynamic;
    if (gesture.rotate) {
      var angle: Dynamic = snapRotationAngle(
        initialBox.deg +
          ((Math.atan2(pointerY - initialBox.c.y, pointerX - initialBox.c.x) - gesture.a0) *
            180) /
            Math.PI,
        snap,
      );
      gesture.lastDeg = angle - normalizeDegrees(initialBox.deg);
      gesture.live = {
        c: initialBox.c,
        w: initialBox.w,
        h: initialBox.h,
        deg: angle,
      };
      mapPoint = function (
        this: Dynamic,
        input?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        return rotatePointAround(input, initialBox.c, gesture.lastDeg);
      };
    } else {
      var pointerOffset: Dynamic = pointInGroupCoordinates(
        {
          c: {
            x: gesture.x0,
            y: gesture.y0,
          },
          deg: initialBox.deg,
        },
        {
          x: pointerX,
          y: pointerY,
        },
      );
      var localBox: Dynamic = {
        x: -initialBox.w / 2,
        y: -initialBox.h / 2,
        w: initialBox.w,
        h: initialBox.h,
      };
      var resizedBox: Dynamic = resizeBoxDimensions(
        localBox,
        gesture.dir,
        pointerOffset.x,
        pointerOffset.y,
        snap || gesture.lock,
        gesture.lim,
      );
      horizontalScale = resizedBox.w / initialBox.w;
      gesture.ky = resizedBox.h / initialBox.h;
      gesture.live = {
        c: pointFromGroupCoordinates(initialBox, {
          x: resizedBox.x + resizedBox.w / 2,
          y: resizedBox.y + resizedBox.h / 2,
        }),
        w: resizedBox.w,
        h: resizedBox.h,
        deg: initialBox.deg,
      };
      mapPoint = function (
        this: Dynamic,
        input?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        return pointFromGroupCoordinates(
          initialBox,
          scalePointBetweenBoxes(pointInGroupCoordinates(initialBox, input), localBox, resizedBox),
        );
      };
    }
    var scaleX: Dynamic = horizontalScale;
    var scaleY: Dynamic = gesture.rotate ? 1 : gesture.ky;
    var radians: Dynamic = ((gesture.lastDeg || 0) * Math.PI) / 180;
    gesture.previewed = true;
    for (var index: Dynamic = 0; index < gesture.members.length; index++) {
      var member: Dynamic = gesture.members[index];
      if (!member.still) {
        if (!member.el.isConnected) {
          var replacement: Dynamic = options.selection.findInstances(
            String(member.tid),
            gesture.name,
          )[0];
          var replacementLine: Dynamic =
            replacement && member.sep ? options.elements.editableLine(options.elements.outerSvg(replacement)) : null;
          if (replacement && (!member.sep || replacementLine)) {
            member.el = options.elements.outerSvg(replacement);
            if (replacementLine) {
              member.shaft = replacementLine.shaft;
              member.svgSnapshot.svg = member.el;
              member.svgSnapshot.shaft = member.shaft;
            }
          }
        }
        if (member.sep) {
          member.last = resizeLineFromEndpoints(member, mapPoint(member.p0), mapPoint(member.q0));
          member.c1 = mapPoint(member.c0);
          applySvgEndpointGeometry(member.el, member.shaft, member.last);
          continue;
        }
        var styles: Dynamic = {};
        var nextWidth: Dynamic = member.w0;
        var nextHeight: Dynamic = member.h0;
        var nextMatrix: Dynamic = member.m;
        if (!gesture.rotate && member.sizable) {
          if (gesture.west || gesture.east || member.turned) {
            nextWidth = member.w0 * scaleX;
            styles.width = Math.max(1, Math.round(nextWidth - member.boxDx)) + "px";
          }
          if (gesture.north || gesture.south || member.turned) {
            nextHeight = member.h0 * scaleY;
            styles.height = Math.max(1, Math.round(nextHeight - member.boxDy)) + "px";
          }
        }
        if (gesture.rotate && member.tf) {
          nextMatrix = rotateMatrix(member.m, radians);
          member.deg1 = normalizeDegrees(Math.round(member.tf.deg + gesture.lastDeg));
          styles.transform = serializeRotatedTransform(member.tf, member.deg1);
        }
        if (member.movable) {
          member.c1 = mapPoint(member.c0);
          var compensation: Dynamic = transformOriginCompensation(
            member.m,
            nextMatrix,
            member.fx,
            member.fy,
            member.w0,
            member.h0,
            nextWidth,
            nextHeight,
          );
          var offsetX: Dynamic = (member.c1.x - member.c0.x) / member.s - compensation.x;
          var offsetY: Dynamic = (member.c1.y - member.c0.y) / member.s - compensation.y;
          if (member.anc.useRight) {
            styles.right = Math.round(member.anc.startRight - offsetX) + "px";
          } else {
            styles.left = Math.round(member.anc.startLeft + offsetX) + "px";
          }
          if (member.anc.useBottom) {
            styles.bottom = Math.round(member.anc.startBottom - offsetY) + "px";
          } else {
            styles.top = Math.round(member.anc.startTop + offsetY) + "px";
          }
        }
        member.lastPatch = styles;
        options.styles.patch(gesture.gestureKey + ":" + member.tid, [member.el], styles);
        options.styles.queue({
          type: "stylePreview",
          tid: member.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          styles: styles,
        });
      }
    }
    options.refreshChrome();
  }
  function finishGroupTransform(
    this: Dynamic,
    gesture?: Dynamic,
    commit?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!gesture.previewed) {
      options.refreshChrome();
      return;
    }
    var patchedMembers: Dynamic = gesture.members.filter(function (
      this: Dynamic,
      member?: Dynamic,
      ..._unusedNestedArgs: Dynamic[]
    ): Dynamic {
      return !!member.lastPatch;
    });
    if (
      gesture.rotate
        ? !gesture.lastDeg
        : Math.abs(gesture.live.w - gesture.f0.w) < 0.5 &&
          Math.abs(gesture.live.h - gesture.f0.h) < 0.5
    ) {
      commit = false;
    }
    if (!commit) {
      for (var restoreIndex: Dynamic = 0; restoreIndex < gesture.members.length; restoreIndex++)
        if (gesture.members[restoreIndex].last) {
          restoreSvgLine(gesture.members[restoreIndex].svgSnapshot);
        }
      for (var revertIndex: Dynamic = 0; revertIndex < patchedMembers.length; revertIndex++)
        options.emit({
          type: "styleRevert",
          tid: patchedMembers[revertIndex].tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          keepUndo: revertIndex < patchedMembers.length - 1,
          follower: revertIndex < patchedMembers.length - 1,
        });
      options.refreshChrome();
      return;
    }
    for (
      var committedMembers: Dynamic = [], index: Dynamic = 0;
      index < gesture.members.length;
      index++
    ) {
      var committedMember: Dynamic = gesture.members[index];
      if (committedMember.last)
        committedMembers.push({
          tid: committedMember.tid,
          stroke: {
            left: committedMember.last.left,
            top: committedMember.last.top,
            width: committedMember.last.w,
            height: committedMember.last.h,
            d: committedMember.last.d,
            isArrow: committedMember.sep.isArrow,
            unitScale: committedMember.sep.unitScale,
            paint: committedMember.sep.paint,
            svgPaint: committedMember.sep.svgPaint,
          },
        });
      else if (committedMember.lastPatch) {
        var styles: Dynamic = {};
        for (var property in committedMember.lastPatch)
          if (property !== "transform") {
            styles[property] = committedMember.lastPatch[property];
          }
        committedMembers.push({
          tid: committedMember.tid,
          styles: styles,
          fixed: committedMember.fixed,
          angle: gesture.rotate && committedMember.tf ? committedMember.deg1 : undefined,
        });
      }
    }
    options.svgRollback.retain(
      gesture.members
        .filter((member: Dynamic) => !!member.last)
        .map((member: Dynamic) => member.svgSnapshot),
    );
    if (committedMembers.length) {
      options.emit({
        type: "groupTransform",
        kind: gesture.rotate ? "rotate" : "resize",
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        members: committedMembers,
      });
    }
    var liveBox: Dynamic = gesture.live;
    var angle: Dynamic = normalizeDegrees(liveBox.deg);
    if (angle !== 0) {
      rotationHistory.push({
        key: gesture.name + "|" + options.selection.read().tids.join(","),
        w: liveBox.w,
        h: liveBox.h,
        deg: angle,
        anchors: gesture.members.map(function (
          this: Dynamic,
          member?: Dynamic,
          ..._unusedNestedArgs: Dynamic[]
        ): Dynamic {
          var bounds: Dynamic = options.elements.unwrap(
            member.el,
          ).getBoundingClientRect();
          var transform: Dynamic = member.pose
            ? decomposedElementTransform(member.el)
            : null;
          return {
            tid: member.tid,
            dx: bounds.left + bounds.width / 2 - liveBox.c.x,
            dy: bounds.top + bounds.height / 2 - liveBox.c.y,
            w: bounds.width,
            h: bounds.height,
            deg: transform ? Math.round((transform.rot * 180) / Math.PI) : 0,
          };
        }),
      });
      if (rotationHistory.length > 8) {
        rotationHistory.shift();
      }
    }
    options.refreshChrome();
  }
  function previewElementTransform(
    this: Dynamic,
    gesture?: Dynamic,
    styles?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (options.elements.isRoot(gesture.name)) {
      gesture.lastPatch = gesture.extra
        ? (Object as Dynamic).assign({}, styles, gesture.extra)
        : styles;
      options.styles.patch(
        gesture.gestureKey,
        gesture.els && gesture.els.length ? gesture.els : [gesture.el],
        gesture.lastPatch,
      );
    }
    var event: Dynamic = {
      type: "stylePreview",
      tid: gesture.tid,
      name: gesture.name,
      gestureKey: gesture.gestureKey,
      styles: styles,
    };
    if (gesture.extra) {
      event.crop = true;
    }
    options.styles.queue(event);
    options.refreshChrome();
  }
  function updateRotation(
    this: Dynamic,
    pointerX?: Dynamic,
    pointerY?: Dynamic,
    snap?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var gesture: Dynamic = transformGesture;
    if (!(!gesture || !gesture.rotate)) {
      if (gesture.group) {
        updateGroupTransform(pointerX, pointerY, snap);
        return;
      }
      gesture.lastDeg = snapRotationAngle(
        gesture.deg0 +
          (gesture.sense *
            (Math.atan2(pointerY - gesture.py, pointerX - gesture.px) -
              gesture.a0) *
            180) /
            Math.PI,
        snap,
      );
      previewElementTransform(gesture, {
        transform: serializeRotatedTransform(gesture.tf, gesture.lastDeg),
      });
    }
  }
  function updateResize(x: number, y: number, preserveRatio: boolean) {
    const gesture = transformGesture;
    if (!gesture || gesture.rotate) return;
    if (gesture.group) {
      updateGroupTransform(x, y, preserveRatio);
      return;
    }
    previewElementTransform(gesture, updateElementResize(gesture, x, y, preserveRatio));
  }
  function finishTransformGesture(
    this: Dynamic,
    commit?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (transformGesture) {
      var gesture: Dynamic = transformGesture;
      transformGesture = null;
      options.styles.clearPending();
      (document as Dynamic).body.style.cursor =
        options.activeTool() === "select" ? "" : "crosshair";
      if (gesture.group) {
        finishGroupTransform(gesture, commit);
        return;
      }
      var previewed: Dynamic = gesture.rotate
        ? gesture.lastDeg != null
        : gesture.lastW != null;
      if (
        previewed &&
        (gesture.rotate
          ? gesture.lastDeg === normalizeDegrees(Math.round(gesture.deg0))
          : Math.round(gesture.lastW) === Math.round(gesture.w0) &&
            Math.round(gesture.lastH) === Math.round(gesture.h0))
      ) {
        commit = false;
      }
      if (!commit && previewed) {
        var revert: Dynamic = {
          type: "styleRevert",
          tid: gesture.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          keepUndo: false,
        };
        if (gesture.extra) {
          revert.crop = true;
        }
        options.emit(revert);
      }
      if (commit && previewed && gesture.rotate)
        options.emit({
          type: "rotate",
          tid: gesture.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
          angle: gesture.lastDeg,
        });
      else if (commit && previewed) {
        var resize: Dynamic = {
          type: "resize",
          tid: gesture.tid,
          name: gesture.name,
          gestureKey: gesture.gestureKey,
        };
        if (gesture.extra) {
          resize.crop = true;
        }
        if (gesture.west || gesture.east) {
          resize.width = Math.round(gesture.lastW - gesture.boxDx);
        }
        if (gesture.north || gesture.south) {
          resize.height = Math.round(gesture.lastH - gesture.boxDy);
        }
        if (gesture.lastLeft != null) {
          resize.left = Math.round(gesture.lastLeft);
        }
        if (gesture.lastTop != null) {
          resize.top = Math.round(gesture.lastTop);
        }
        if (gesture.lastRight != null) {
          resize.right = Math.round(gesture.lastRight);
        }
        if (gesture.lastBottom != null) {
          resize.bottom = Math.round(gesture.lastBottom);
        }
        options.emit(resize);
      }
      options.refreshChrome();
    }
  }
  function reapply() {
    const gesture = transformGesture;
    if (gesture?.lastPatch) {
      options.styles.patch(
        gesture.gestureKey,
        gesture.els?.length ? gesture.els : [gesture.el],
        gesture.lastPatch,
      );
    }
    if (gesture?.group) reapplyGroupTransforms(gesture);
  }

  function setCropStyles(styles: unknown) {
    const gesture = transformGesture;
    if (!gesture || gesture.rotate || gesture.group || !styles || typeof styles !== "object") return;
    const values = styles as Record<string, unknown>;
    const extra: Record<string, string> = {};
    for (const property of ["object-fit", "object-position", "object-view-box"]) {
      const value = values[property];
      if (typeof value === "string" && value.length < 120) extra[property] = value;
    }
    gesture.extra = extra;
  }

  return {
    get active() { return transformGesture !== null; },
    startResize: beginResize,
    moveResize: updateResize,
    startRotation: beginRotation,
    moveRotation: updateRotation,
    finish: finishTransformGesture,
    setCropStyles,
    reapply,
    selectionRotation: storedSelectionTransform,
    resetSelectionRotation() { rotationHistory = []; },
    groupPreview() {
      const activeGesture = transformGesture;
      return activeGesture?.group ? { members: activeGesture.members, live: activeGesture.live, rotate: activeGesture.rotate, lastDeg: activeGesture.lastDeg } : null;
    },
    singlePreview() {
      const activeGesture = transformGesture;
      return activeGesture && !activeGesture.group ? { el: activeGesture.el, rotate: activeGesture.rotate, lastDeg: activeGesture.lastDeg } : null;
    },
  };
}

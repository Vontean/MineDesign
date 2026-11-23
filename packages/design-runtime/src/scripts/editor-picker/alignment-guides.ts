import type { Dynamic } from "../../runtime-types";

export const buildDistanceGuides: Dynamic = function (
  this: Dynamic,
  anchorBounds?: Dynamic,
  targetBounds?: Dynamic,
  viewportScale?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const guides: Dynamic = {
    lines: [],
    labels: [],
  };
  const scale: Dynamic = viewportScale > 0 && isFinite(viewportScale) ? viewportScale : 1;
  const containsBounds: Dynamic = (
    innerBounds?: Dynamic,
    outerBounds?: Dynamic,
    ..._unusedContainsArgs: Dynamic[]
  ): Dynamic =>
    outerBounds.l <= innerBounds.l + 0.01 &&
    outerBounds.t <= innerBounds.t + 0.01 &&
    outerBounds.r >= innerBounds.r - 0.01 &&
    outerBounds.b >= innerBounds.b - 0.01;
  if (containsBounds(targetBounds, anchorBounds)) {
    const originalAnchor: Dynamic = anchorBounds;
    anchorBounds = targetBounds;
    targetBounds = originalAnchor;
  }
  const targetContainsAnchor: Dynamic = containsBounds(anchorBounds, targetBounds);
  const overlapMidpoint: Dynamic = (
    firstStart?: Dynamic,
    firstEnd?: Dynamic,
    secondStart?: Dynamic,
    secondEnd?: Dynamic,
    ..._unusedOverlapArgs: Dynamic[]
  ): Dynamic => {
    const overlapStart: Dynamic = Math.max(firstStart, secondStart);
    const overlapEnd: Dynamic = Math.min(firstEnd, secondEnd);
    return overlapEnd > overlapStart ? (overlapStart + overlapEnd) / 2 : null;
  };
  const addDistanceGuide: Dynamic = (
    axis?: Dynamic,
    from?: Dynamic,
    to?: Dynamic,
    crossPosition?: Dynamic,
    targetCrossStart?: Dynamic,
    targetCrossEnd?: Dynamic,
    ..._unusedGuideArgs: Dynamic[]
  ): Dynamic => {
    const distance: Dynamic = Math.round(Math.abs(to - from) / scale);
    if (distance < 1) return;
    const label: Dynamic = String(distance);
    if (axis === "x") {
      guides.lines.push({
        x1: Math.min(from, to),
        y1: crossPosition,
        x2: Math.max(from, to),
        y2: crossPosition,
      });
      guides.labels.push({
        x: (from + to) / 2,
        y: crossPosition,
        text: label,
        axis: axis,
      });
      if (crossPosition < targetCrossStart) {
        guides.lines.push({
          x1: to,
          y1: crossPosition,
          x2: to,
          y2: targetCrossStart,
          ext: 1,
        });
      } else {
        if (crossPosition > targetCrossEnd) {
          guides.lines.push({
            x1: to,
            y1: targetCrossEnd,
            x2: to,
            y2: crossPosition,
            ext: 1,
          });
        }
      }
    } else {
      guides.lines.push({
        x1: crossPosition,
        y1: Math.min(from, to),
        x2: crossPosition,
        y2: Math.max(from, to),
      });
      guides.labels.push({
        x: crossPosition,
        y: (from + to) / 2,
        text: label,
        axis: axis,
      });
      if (crossPosition < targetCrossStart) {
        guides.lines.push({
          x1: crossPosition,
          y1: to,
          x2: targetCrossStart,
          y2: to,
          ext: 1,
        });
      } else {
        if (crossPosition > targetCrossEnd) {
          guides.lines.push({
            x1: targetCrossEnd,
            y1: to,
            x2: crossPosition,
            y2: to,
            ext: 1,
          });
        }
      }
    }
  };
  const verticalOverlapCenter: Dynamic = overlapMidpoint(
    anchorBounds.t,
    anchorBounds.b,
    targetBounds.t,
    targetBounds.b,
  );
  const guideY: Dynamic = verticalOverlapCenter ?? (anchorBounds.t + anchorBounds.b) / 2;
  const horizontalOverlapCenter: Dynamic = overlapMidpoint(
    anchorBounds.l,
    anchorBounds.r,
    targetBounds.l,
    targetBounds.r,
  );
  const guideX: Dynamic = horizontalOverlapCenter ?? (anchorBounds.l + anchorBounds.r) / 2;
  return targetContainsAnchor
    ? (addDistanceGuide("x", anchorBounds.l, targetBounds.l, guideY, targetBounds.t, targetBounds.b),
      addDistanceGuide("x", anchorBounds.r, targetBounds.r, guideY, targetBounds.t, targetBounds.b),
      addDistanceGuide("y", anchorBounds.t, targetBounds.t, guideX, targetBounds.l, targetBounds.r),
      addDistanceGuide("y", anchorBounds.b, targetBounds.b, guideX, targetBounds.l, targetBounds.r),
      guides)
    : (targetBounds.r <= anchorBounds.l
        ? addDistanceGuide("x", anchorBounds.l, targetBounds.r, guideY, targetBounds.t, targetBounds.b)
        : targetBounds.l >= anchorBounds.r &&
          addDistanceGuide("x", anchorBounds.r, targetBounds.l, guideY, targetBounds.t, targetBounds.b),
      targetBounds.b <= anchorBounds.t
        ? addDistanceGuide("y", anchorBounds.t, targetBounds.b, guideX, targetBounds.l, targetBounds.r)
        : targetBounds.t >= anchorBounds.b &&
          addDistanceGuide(
            "y",
            anchorBounds.b,
            targetBounds.t,
            guideX,
            targetBounds.l,
            targetBounds.r,
          ),
      guides);
};
export const findBoxSnapAdjustment: Dynamic = function (
  this: Dynamic,
  box?: Dynamic,
  candidates?: Dynamic,
  tolerance?: Dynamic,
  allowedAxes?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const result: Dynamic = {
    dx: 0,
    dy: 0,
    guides: [],
  };
  for (const axis of ["x", "y"] as Dynamic) {
    if (allowedAxes && !allowedAxes[axis]) continue;
    const leadingEdge: Dynamic = axis === "x" ? box.x : box.y;
    const size: Dynamic = axis === "x" ? box.w : box.h;
    const snapPoints: Dynamic = [
      {
        kind: "edge",
        at: leadingEdge,
      },
      {
        kind: "center",
        at: leadingEdge + size / 2,
      },
      {
        kind: "edge",
        at: leadingEdge + size,
      },
    ];
    let bestSnap: Dynamic = null;
    for (const candidate of candidates as Dynamic)
      if (
        !(
          candidate.axis !== axis ||
          !(typeof candidate.pos == "number" && isFinite(candidate.pos))
        )
      )
        for (const snapPoint of snapPoints as Dynamic) {
          if (snapPoint.kind !== candidate.kind) continue;
          const adjustment: Dynamic = candidate.pos - snapPoint.at;
          const distance: Dynamic = Math.abs(adjustment);
          if (
            distance <= tolerance &&
            (!bestSnap ||
              distance < bestSnap.dist ||
              (distance === bestSnap.dist &&
                candidate.kind === "center" &&
                bestSnap.line.kind !== "center"))
          ) {
            bestSnap = {
              adjust: adjustment,
              dist: distance,
              line: candidate,
            };
          }
        }
    if (bestSnap) {
      if (axis === "x") {
        result.dx = bestSnap.adjust;
      } else {
        result.dy = bestSnap.adjust;
      }
      result.guides.push(bestSnap.line);
    }
  }
  return result;
};

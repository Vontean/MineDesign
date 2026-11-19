/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function createElementEditId(editIndex?: Dynamic): Dynamic {
  return (
    "d" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8) +
    "-" +
    String(editIndex)
  );
}
function snapTranslation(
  rect?: Dynamic,
  guides?: Dynamic,
  threshold?: Dynamic,
  enabledAxes?: Dynamic,
): Dynamic {
  let state: Dynamic = {
    dx: 0,
    dy: 0,
    guides: [],
  };
  for (let axis of ["x", "y"] as Dynamic) {
    if (enabledAxes && !enabledAxes[axis]) continue;
    let start: Dynamic = axis === "x" ? rect.x : rect.y,
      size: Dynamic = axis === "x" ? rect.w : rect.h,
      movingLines: Dynamic = [
        {
          kind: "edge",
          at: start,
        },
        {
          kind: "center",
          at: start + size / 2,
        },
        {
          kind: "edge",
          at: start + size,
        },
      ],
      bestSnap: Dynamic = null;
    for (let guide of guides as Dynamic)
      if (
        !(
          guide.axis !== axis ||
          !(typeof guide.pos == "number" && isFinite(guide.pos))
        )
      )
        for (let movingLine of movingLines as Dynamic) {
          if (movingLine.kind !== guide.kind) continue;
          let adjustment: Dynamic = guide.pos - movingLine.at,
            distance: Dynamic = Math.abs(adjustment);
          distance <= threshold &&
            (!bestSnap ||
              distance < bestSnap.dist ||
              (distance === bestSnap.dist &&
                guide.kind === "center" &&
                bestSnap.line.kind !== "center")) &&
            (bestSnap = {
              adjust: adjustment,
              dist: distance,
              line: guide,
            });
        }
    bestSnap &&
      (axis === "x"
        ? (state.dx = bestSnap.adjust)
        : (state.dy = bestSnap.adjust),
      state.guides.push(bestSnap.line));
  }
  return state;
}
function snapResize(
  rect?: Dynamic,
  handle?: Dynamic,
  dx?: Dynamic,
  dy?: Dynamic,
  guides?: Dynamic,
  threshold?: Dynamic,
): Dynamic {
  let state: Dynamic = {
    dx: dx,
    dy: dy,
    guides: [],
  };
  for (let axis of ["x", "y"] as Dynamic) {
    let handleSide: Dynamic = axis === "x" ? handle.x : handle.y;
    if (handleSide === null) continue;
    let delta: Dynamic = axis === "x" ? dx : dy,
      movingEdge: Dynamic =
        (axis === "x"
          ? handleSide === "left"
            ? rect.x
            : rect.x + rect.w
          : handleSide === "top"
            ? rect.y
            : rect.y + rect.h) + delta,
      bestSnap: Dynamic = null;
    for (let guide of guides as Dynamic) {
      if (
        guide.axis !== axis ||
        guide.kind !== "edge" ||
        !(typeof guide.pos == "number" && isFinite(guide.pos))
      )
        continue;
      let adjustment: Dynamic = guide.pos - movingEdge,
        distance: Dynamic = Math.abs(adjustment);
      distance <= threshold &&
        (!bestSnap || distance < bestSnap.dist) &&
        (bestSnap = {
          adjust: adjustment,
          dist: distance,
          line: guide,
        });
    }
    bestSnap &&
      (axis === "x"
        ? (state.dx = delta + bestSnap.adjust)
        : (state.dy = delta + bestSnap.adjust),
      state.guides.push(bestSnap.line));
  }
  return state;
}
function activeResizeGuides(
  rect?: Dynamic,
  handle?: Dynamic,
  guides?: Dynamic,
): Dynamic {
  return guides.filter((guide?: Dynamic): Dynamic => {
    let handleSide: Dynamic = guide.axis === "x" ? handle.x : handle.y;
    if (handleSide === null) return false;
    let edgePosition: Dynamic =
      guide.axis === "x"
        ? handleSide === "left"
          ? rect.x
          : rect.x + rect.w
        : handleSide === "top"
          ? rect.y
          : rect.y + rect.h;
    return Math.abs(edgePosition - guide.pos) <= 0.5;
  });
}
function rectangleSnapGuides(rects?: Dynamic): Dynamic {
  let guides: Dynamic = [];
  for (let rect of rects as Dynamic)
    guides.push(
      {
        axis: "x",
        pos: rect.x,
        kind: "edge",
      },
      {
        axis: "x",
        pos: rect.x + rect.w / 2,
        kind: "center",
      },
      {
        axis: "x",
        pos: rect.x + rect.w,
        kind: "edge",
      },
      {
        axis: "y",
        pos: rect.y,
        kind: "edge",
      },
      {
        axis: "y",
        pos: rect.y + rect.h / 2,
        kind: "center",
      },
      {
        axis: "y",
        pos: rect.y + rect.h,
        kind: "edge",
      },
    );
  return guides;
}
export {
  activeResizeGuides,
  createElementEditId,
  rectangleSnapGuides,
  snapResize,
  snapTranslation,
};
export function installEditorGeometrySnapping(): () => void {
  return () => {};
}

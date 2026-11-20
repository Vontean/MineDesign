/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { rectangleSnapGuides, snapTranslation } from "../editor/geometry/snapping";

function snapCanvasDrag(
  dx?: Dynamic,
  dy2?: Dynamic,
  snapState?: Dynamic,
  tolerance?: Dynamic,
  snapDisabled?: Dynamic,
): Dynamic {
  if (!snapState || snapDisabled)
    return {
      dx: dx,
      dy: dy2,
      guides: [],
      gaps: [],
    };
  let box: Dynamic = snapState.box,
    state: Dynamic = {
      x: box.x + dx,
      y: box.y + dy2,
      w: box.w,
      h: box.h,
    },
    value: Dynamic = snapTranslation(
      state,
      snapState.lines,
      tolerance,
    ),
    axisGaps: Dynamic = snapState.boxes
      ? snapEqualObjectGaps(state, snapState.boxes, tolerance, {
          x: value.dx,
          y: value.dy,
        })
      : {
          dx: 0,
          dy: 0,
          gaps: [],
        },
    computedSnap: Dynamic = {
      dx: dx,
      dy: dy2,
      guides: [],
      gaps: [],
    };
  for (let axis of ["x", "y"] as Dynamic) {
    let guide: Dynamic = value.guides.find(
        (gap?: Dynamic): Dynamic => gap.axis === axis,
      ),
      matchingGaps: Dynamic = axisGaps.gaps.filter(
        (gap?: Dynamic): Dynamic => gap.axis === axis,
      ),
      [guideDelta, gapDelta]: Dynamic =
        axis === "x" ? [value.dx, axisGaps.dx] : [value.dy, axisGaps.dy];
    if (!guide && matchingGaps.length === 0) continue;
    let hasGuide: Dynamic =
        guide &&
        (matchingGaps.length === 0 || Math.abs(guideDelta) <= Math.abs(gapDelta) + 0.5),
      snapDelta: Dynamic = hasGuide ? guideDelta : gapDelta;
    axis === "x" ? (computedSnap.dx += snapDelta) : (computedSnap.dy += snapDelta);
    guide &&
      (hasGuide || Math.abs(guideDelta - snapDelta) <= 0.5) &&
      computedSnap.guides.push(guide);
    matchingGaps.length > 0 &&
      (!hasGuide || Math.abs(gapDelta - snapDelta) <= 0.5) &&
      computedSnap.gaps.push(...matchingGaps);
  }
  return computedSnap;
}
function preserveUnroundedDragPosition(
  original?: Dynamic,
  point?: Dynamic,
): Dynamic {
  return {
    x: point.x === Math.round(original.x) ? original.x : point.x,
    y: point.y === Math.round(original.y) ? original.y : point.y,
  };
}
function canvasSnapReferenceObjects(
  artboards?: Dynamic,
  annotations?: Dynamic,
  selection?: Dynamic,
  includeSelected?: Dynamic,
): Dynamic {
  return [
    ...artboards.filter(
      (file?: Dynamic): Dynamic =>
        includeSelected || !selection.files.has(file.file),
    ),
    ...annotations.filter(
      (annotation?: Dynamic): Dynamic =>
        includeSelected || !selection.notes.has(annotation.id),
    ),
  ];
}
function canvasSnapReferenceLines(
  artboards?: Dynamic,
  annotations?: Dynamic,
  selection?: Dynamic,
  includeSelected?: Dynamic,
): Dynamic {
  return rectangleSnapGuides(
    canvasSnapReferenceObjects(
      artboards,
      annotations,
      selection,
      includeSelected,
    ),
  );
}
function snapEqualObjectGaps(
  box?: Dynamic,
  neighbors?: Dynamic,
  tolerance?: Dynamic,
  shift: Dynamic = {
    x: 0,
    y: 0,
  },
): Dynamic {
  let state: Dynamic = {
    dx: 0,
    dy: 0,
    gaps: [],
  };
  for (let value of ["x", "y"] as Dynamic) {
    let [startCoordinate, endCoordinate, axisStart, axisSize]: Dynamic =
        value === "x" ? ["x", "w", "y", "h"] : ["y", "h", "x", "w"],
      callback: Dynamic = (boxEntry?: Dynamic): Dynamic => boxEntry[startCoordinate],
      endOf: Dynamic = (boxEntry?: Dynamic): Dynamic =>
        boxEntry[startCoordinate] + boxEntry[endCoordinate],
      startOf: Dynamic = (boxEntry?: Dynamic): Dynamic => boxEntry[axisStart],
      endWithSize: Dynamic = (boxEntry?: Dynamic): Dynamic =>
        boxEntry[axisStart] + boxEntry[axisSize],
      boxSize: Dynamic = box[endCoordinate],
      [items, boxRange]: Dynamic = [
        startOf(box) + shift[axisStart],
        endWithSize(box) + shift[axisStart],
      ],
      overlappingNeighbors: Dynamic = neighbors.filter(
        (neighbor?: Dynamic): Dynamic =>
          startOf(neighbor) < boxRange && endWithSize(neighbor) > items,
      ),
      isBetween: Dynamic = (neighbor?: Dynamic): Dynamic =>
        callback(neighbor) <= callback(box) &&
        endOf(neighbor) >= endOf(box),
      nearestNeighbor: Dynamic = overlappingNeighbors
        .filter(isBetween)
        .reduce(
          (candidate?: Dynamic, currentBest?: Dynamic): Dynamic =>
            candidate === null || currentBest[endCoordinate] < candidate[endCoordinate]
              ? currentBest
              : candidate,
          null,
        ),
      alignedNeighbors: Dynamic = overlappingNeighbors.filter(
        (neighbor?: Dynamic): Dynamic =>
          !isBetween(neighbor) &&
          (!nearestNeighbor ||
            (callback(neighbor) >= callback(nearestNeighbor) &&
              endOf(neighbor) <= endOf(nearestNeighbor))),
      ),
      center: Dynamic = (callback(box) + endOf(box)) / 2,
      leftNeighbors: Dynamic = alignedNeighbors.filter(
        (neighbor?: Dynamic): Dynamic =>
          (callback(neighbor) + endOf(neighbor)) / 2 < center,
      ),
      rightNeighbors: Dynamic = alignedNeighbors.filter(
        (neighbor?: Dynamic): Dynamic =>
          (callback(neighbor) + endOf(neighbor)) / 2 >= center,
      ),
      nearestLeft: Dynamic = (neighborList?: Dynamic): Dynamic =>
        neighborList.reduce(
          (best?: Dynamic, candidate?: Dynamic): Dynamic =>
            best === null || endOf(candidate) > endOf(best)
              ? candidate
              : best,
          null,
        ),
      nearestRight: Dynamic = (neighborList?: Dynamic): Dynamic =>
        neighborList.reduce(
          (best?: Dynamic, candidate?: Dynamic): Dynamic =>
            best === null || callback(candidate) < callback(best)
              ? candidate
              : best,
          null,
        ),
      leftNeighbor: Dynamic = nearestLeft(leftNeighbors),
      rightNeighbor: Dynamic =
        leftNeighbor &&
        nearestLeft(
          leftNeighbors.filter(
            (neighbor?: Dynamic): Dynamic =>
              neighbor !== leftNeighbor && endOf(neighbor) <= callback(leftNeighbor),
          ),
        ),
      rightAlignedNeighbor: Dynamic = nearestRight(rightNeighbors),
      leftAlignedNeighbor: Dynamic =
        rightAlignedNeighbor &&
        nearestRight(
          rightNeighbors.filter(
            (neighbor?: Dynamic): Dynamic =>
              neighbor !== rightAlignedNeighbor && callback(neighbor) >= endOf(rightAlignedNeighbor),
          ),
        ),
      coordinateRange: Dynamic = (startBox?: Dynamic, endBox?: Dynamic): Dynamic => {
        let [startRange, endRange]: Dynamic = [
          Math.max(
            startBox ? startOf(startBox) : items,
            endBox ? startOf(endBox) : items,
          ),
          Math.min(
            startBox ? endWithSize(startBox) : boxRange,
            endBox ? endWithSize(endBox) : boxRange,
          ),
        ];
        return startRange <= endRange
          ? (startRange + endRange) / 2
          : (items + boxRange) / 2;
      },
      makeGuide: Dynamic = (
        from?: Dynamic,
        to?: Dynamic,
        at?: Dynamic,
        label: Dynamic = String(Math.round(to - from)),
      ): Dynamic => ({
        axis: value,
        from: from,
        to: to,
        at: at,
        label: label,
      }),
      candidates: Dynamic = [];
    if (leftNeighbor && rightAlignedNeighbor) {
      let centerOffset: Dynamic =
          (callback(rightAlignedNeighbor) - endOf(leftNeighbor) - boxSize) / 2,
        snapCoordinate: Dynamic = Math.round(endOf(leftNeighbor) + centerOffset);
      Math.round(snapCoordinate - endOf(leftNeighbor)) >= 1 &&
        Math.round(callback(rightAlignedNeighbor) - snapCoordinate - boxSize) >= 1 &&
        candidates.push({
          adjust: snapCoordinate - callback(box),
          between: true,
          gaps: [
            makeGuide(endOf(leftNeighbor), snapCoordinate, coordinateRange(leftNeighbor, null)),
            makeGuide(
              snapCoordinate + boxSize,
              callback(rightAlignedNeighbor),
              coordinateRange(null, rightAlignedNeighbor),
            ),
          ],
        });
    }
    let overlapsRange: Dynamic = (start?: Dynamic, end?: Dynamic): Dynamic =>
      !alignedNeighbors.some(
        (candidate?: Dynamic): Dynamic =>
          callback(candidate) < end &&
          endOf(candidate) > start &&
          !(callback(candidate) <= start && endOf(candidate) >= end),
      );
    if (
      leftNeighbor &&
      rightNeighbor &&
      overlapsRange(endOf(rightNeighbor), callback(leftNeighbor))
    ) {
      let leftOffset: Dynamic = callback(leftNeighbor) - endOf(rightNeighbor),
        leftSnap: Dynamic = Math.round(endOf(leftNeighbor) + leftOffset);
      if (
        Math.round(leftOffset) >= 1 &&
        Math.round(leftSnap - endOf(leftNeighbor)) >= 1
      ) {
        let leftGuide: Dynamic = makeGuide(
          endOf(rightNeighbor),
          callback(leftNeighbor),
          coordinateRange(rightNeighbor, leftNeighbor),
        );
        candidates.push({
          adjust: leftSnap - callback(box),
          between: false,
          gaps: [
            leftGuide,
            makeGuide(
              endOf(leftNeighbor),
              leftSnap,
              coordinateRange(leftNeighbor, null),
              leftGuide.label,
            ),
          ],
        });
      }
    }
    if (
      rightAlignedNeighbor &&
      leftAlignedNeighbor &&
      overlapsRange(endOf(rightAlignedNeighbor), callback(leftAlignedNeighbor))
    ) {
      let rightOffset: Dynamic = callback(leftAlignedNeighbor) - endOf(rightAlignedNeighbor),
        rightSnap: Dynamic = Math.round(callback(rightAlignedNeighbor) - rightOffset - boxSize);
      if (
        Math.round(rightOffset) >= 1 &&
        Math.round(callback(rightAlignedNeighbor) - rightSnap - boxSize) >= 1
      ) {
        let rightGuide: Dynamic = makeGuide(
          endOf(rightAlignedNeighbor),
          callback(leftAlignedNeighbor),
          coordinateRange(rightAlignedNeighbor, leftAlignedNeighbor),
        );
        candidates.push({
          adjust: rightSnap - callback(box),
          between: false,
          gaps: [
            makeGuide(
              rightSnap + boxSize,
              callback(rightAlignedNeighbor),
              coordinateRange(null, rightAlignedNeighbor),
              rightGuide.label,
            ),
            rightGuide,
          ],
        });
      }
    }
    let bestSnap: Dynamic = null;
    for (let candidateSnap of candidates as Dynamic)
      Math.abs(candidateSnap.adjust) <= tolerance &&
        (!bestSnap ||
          Math.abs(candidateSnap.adjust) < Math.abs(bestSnap.adjust) - 0.5 ||
          (Math.abs(Math.abs(candidateSnap.adjust) - Math.abs(bestSnap.adjust)) <=
            0.5 &&
            candidateSnap.between &&
            !bestSnap.between)) &&
        (bestSnap = candidateSnap);
    bestSnap &&
      (value === "x"
        ? (state.dx = bestSnap.adjust)
        : (state.dy = bestSnap.adjust),
      state.gaps.push(...bestSnap.gaps));
  }
  return state;
}
export {
  canvasSnapReferenceLines,
  canvasSnapReferenceObjects,
  preserveUnroundedDragPosition,
  snapCanvasDrag,
  snapEqualObjectGaps,
};
export function installGeometryCanvasSnapping(): () => void {
  return () => {};
}

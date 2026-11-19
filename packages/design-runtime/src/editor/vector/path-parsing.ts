/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { fitPenCurve, flattenCubicPath } from "../geometry/pen";

var VectorPathParsingCosValue: Dynamic;
var quadraticToCubic: Dynamic;
function parseVectorPath(
  pathData?: Dynamic,
  transform?: Dynamic,
  curveTolerance?: Dynamic,
): Dynamic {
  let callback: Dynamic = (
      xCoordinate?: Dynamic,
      yCoordinate?: Dynamic,
    ): Dynamic => ({
      x: transform.ox + xCoordinate * transform.sx,
      y: transform.oy + yCoordinate * transform.sy,
    }),
    items: Dynamic = [],
    contourAnchors: Dynamic = [],
    pendingCurvePoints: Dynamic = [],
    flushCurve: Dynamic = (): Dynamic => {
      if (pendingCurvePoints.length < 2) return void (pendingCurvePoints = []);
      let value: Dynamic =
        pendingCurvePoints.length >= 3
          ? fitPenCurve(
              pendingCurvePoints.map((point?: Dynamic): Dynamic => [point.x, point.y]),
              curveTolerance,
            )
          : null;
      if (value && value.length > 4)
        for (let count: Dynamic = 2; count + 5 < value.length; count += 6)
          contourAnchors.push({
            x: value[count + 4],
            y: value[count + 5],
            seg: {
              kind: "cubic",
              c1: {
                x: value[count],
                y: value[count + 1],
              },
              c2: {
                x: value[count + 2],
                y: value[count + 3],
              },
            },
          });
      else
        for (let anchor of pendingCurvePoints.slice(1) as Dynamic)
          contourAnchors.push({
            x: anchor.x,
            y: anchor.y,
            seg: {
              kind: "line",
            },
          });
      pendingCurvePoints = [];
    };
  for (let value of (pathData.match(/[MLC][^MLC]*/g) ?? []) as Dynamic) {
    let commandValues: Dynamic = (
      value.slice(1).match(/-?\d+(?:\.\d+)?/g) ?? []
    ).map(Number);
    if (value[0] === "M" && commandValues.length >= 2) {
      flushCurve();
      contourAnchors.length > 0 &&
        items.push({
          anchors: contourAnchors,
          closed: false,
        });
      let movePoint: Dynamic = callback(commandValues[0], commandValues[1]);
      contourAnchors = [
        {
          x: movePoint.x,
          y: movePoint.y,
          seg: {
            kind: "line",
          },
        },
      ];
      pendingCurvePoints = [movePoint];
    } else {
      if (contourAnchors.length === 0) continue;
      if (value[0] === "L" && commandValues.length >= 2) {
        pendingCurvePoints.length === 0 &&
          (pendingCurvePoints = [
            {
              x: contourAnchors[contourAnchors.length - 1].x,
              y: contourAnchors[contourAnchors.length - 1].y,
            },
          ]);
        pendingCurvePoints.push(callback(commandValues[0], commandValues[1]));
      } else if (value[0] === "C" && commandValues.length >= 6) {
        flushCurve();
        let curveEndPoint: Dynamic = callback(commandValues[4], commandValues[5]),
          lastAnchor: Dynamic = contourAnchors[contourAnchors.length - 1],
          [controlPoint1, controlPoint2]: Dynamic = [
            callback(commandValues[0], commandValues[1]),
            callback(commandValues[2], commandValues[3]),
          ],
          isNearLastAnchor: Dynamic = (point?: Dynamic): Dynamic =>
            (point.x - lastAnchor.x) ** 2 + (point.y - lastAnchor.y) ** 2 < 0.25;
        if (
          contourAnchors.length > 1 &&
          isNearLastAnchor(curveEndPoint) &&
          isNearLastAnchor(controlPoint1) &&
          isNearLastAnchor(controlPoint2)
        )
          continue;
        contourAnchors.push({
          x: curveEndPoint.x,
          y: curveEndPoint.y,
          seg: {
            kind: "cubic",
            c1: controlPoint1,
            c2: controlPoint2,
          },
        });
      }
    }
  }
  flushCurve();
  contourAnchors.length > 0 &&
    items.push({
      anchors: contourAnchors,
      closed: false,
    });
  for (let value of items as Dynamic)
    value.anchors.forEach(
      (anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic =>
        (anchor.tangent = inferVectorTangentKind(value.anchors, anchorIndex)),
    );
  return {
    contours: items,
  };
}
function inferVectorTangentKind(anchors?: Dynamic, anchorIndex?: Dynamic): Dynamic {
  let value: Dynamic = anchors[anchorIndex],
    nextAnchor: Dynamic = anchors[anchorIndex + 1];
  if (value.seg.kind !== "cubic" || !nextAnchor || nextAnchor.seg.kind !== "cubic")
    return "corner";
  let [items, incomingX, outgoingX, outgoingY]: Dynamic = [
      value.x - value.seg.c2.x,
      value.y - value.seg.c2.y,
      nextAnchor.seg.c1.x - value.x,
      nextAnchor.seg.c1.y - value.y,
    ],
    directionMagnitude: Dynamic = Math.hypot(items, incomingX) * Math.hypot(outgoingX, outgoingY);
  return directionMagnitude > 0 &&
    (items * outgoingX + incomingX * outgoingY) / directionMagnitude >= VectorPathParsingCosValue
    ? "smooth"
    : "corner";
}
function vectorControlBounds(vectorPath?: Dynamic): Dynamic {
  let [items, minY, maxX, maxY]: Dynamic = [
      1 / 0,
      1 / 0,
      -1 / 0,
      -1 / 0,
    ],
    callback: Dynamic = (controlPoint?: Dynamic): Dynamic => {
      [items, minY, maxX, maxY] = [
        Math.min(items, controlPoint.x),
        Math.min(minY, controlPoint.y),
        Math.max(maxX, controlPoint.x),
        Math.max(maxY, controlPoint.y),
      ];
    };
  for (let value of vectorPath.contours as Dynamic)
    value.anchors.forEach((anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
      callback(anchor);
      anchorIndex > 0 &&
        anchor.seg.kind === "cubic" &&
        (callback(anchor.seg.c1), callback(anchor.seg.c2));
      anchorIndex > 0 && anchor.seg.kind === "quad" && callback(anchor.seg.c);
    });
  return items === 1 / 0
    ? null
    : {
        x0: items,
        y0: minY,
        x1: maxX,
        y1: maxY,
      };
}
function serializeVectorPathBounds(
  vectorPath?: Dynamic,
  precision?: Dynamic,
  includeBounds: Dynamic = true,
): Dynamic {
  let value: Dynamic = includeBounds ? vectorAnchorBounds(vectorPath) : null,
    callback: Dynamic = (point?: Dynamic): Dynamic =>
      !includeBounds ||
      (value !== null &&
        point.x >= value.x0 - 0.5 &&
        point.x <= value.x1 + 0.5 &&
        point.y >= value.y0 - 0.5 &&
        point.y <= value.y1 + 0.5),
    state: Dynamic = {
      contours: vectorPath.contours.map((contour?: Dynamic): Dynamic => {
        let items: Dynamic = [];
        for (let anchor of contour.anchors as Dynamic) {
          let previousAnchor: Dynamic = items[items.length - 1];
          if (
            anchor.seg.kind !== "cubic" ||
            !previousAnchor ||
            (callback(anchor.seg.c1) && callback(anchor.seg.c2))
          ) {
            items.push(
              anchor.seg.kind === "quad" && previousAnchor
                ? {
                    ...anchor,
                    seg: {
                      kind: "cubic",
                      ...quadraticToCubic(previousAnchor, anchor.seg.c, anchor),
                    },
                  }
                : anchor,
            );
            continue;
          }
          let flattenedCurve: Dynamic = flattenCubicPath([
            previousAnchor.x,
            previousAnchor.y,
            anchor.seg.c1.x,
            anchor.seg.c1.y,
            anchor.seg.c2.x,
            anchor.seg.c2.y,
            anchor.x,
            anchor.y,
          ]);
          for (let count: Dynamic = 2; count + 5 < flattenedCurve.length; count += 6)
            items.push({
              x: flattenedCurve[count + 4],
              y: flattenedCurve[count + 5],
              seg: {
                kind: "cubic",
                c1: {
                  x: flattenedCurve[count],
                  y: flattenedCurve[count + 1],
                },
                c2: {
                  x: flattenedCurve[count + 2],
                  y: flattenedCurve[count + 3],
                },
              },
            });
        }
        return {
          anchors: items,
          closed: false,
        };
      }),
    },
    controlBounds: Dynamic = vectorControlBounds(state);
  if (controlBounds === null) return null;
  let precisionFactor: Dynamic = 10 ** precision,
    roundCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.round(coordinate * precisionFactor) / precisionFactor,
    formatCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic => {
      let formattedValue: Dynamic = roundCoordinate(coordinate).toFixed(precision);
      formattedValue.indexOf(".") >= 0 && (formattedValue = formattedValue.replace(/\.?0+$/, ""));
      return formattedValue === "-0" ? "0" : formattedValue;
    },
    formatPoint: Dynamic = (point?: Dynamic): Dynamic =>
      formatCoordinate(point.x - controlBounds.x0) + " " + formatCoordinate(point.y - controlBounds.y0),
    text: Dynamic = "";
  for (let contour of state.contours as Dynamic)
    contour.anchors.forEach(
      (anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
        text +=
          anchorIndex === 0
            ? (text === "" ? "M" : " M") + formatPoint(anchor)
            : anchor.seg.kind === "cubic"
              ? " C" +
                formatPoint(anchor.seg.c1) +
                " " +
                formatPoint(anchor.seg.c2) +
                " " +
                formatPoint(anchor)
              : " L" + formatPoint(anchor);
      },
    );
  return {
    x: controlBounds.x0,
    y: controlBounds.y0,
    w: roundCoordinate(controlBounds.x1 - controlBounds.x0),
    h: roundCoordinate(controlBounds.y1 - controlBounds.y0),
    d: text,
  };
}
function vectorAnchorBounds(vectorPath?: Dynamic): Dynamic {
  let [items, minY, maxX, maxY]: Dynamic = [
      1 / 0,
      1 / 0,
      -1 / 0,
      -1 / 0,
    ],
    callback: Dynamic = (xCoordinate?: Dynamic, yCoordinate?: Dynamic): Dynamic => {
      [items, minY, maxX, maxY] = [
        Math.min(items, xCoordinate),
        Math.min(minY, yCoordinate),
        Math.max(maxX, xCoordinate),
        Math.max(maxY, yCoordinate),
      ];
    };
  for (let value of vectorPath.contours as Dynamic)
    value.anchors.forEach((anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
      callback(anchor.x, anchor.y);
      let previousAnchor: Dynamic = value.anchors[anchorIndex - 1];
      if (!previousAnchor || anchor.seg.kind === "line") return;
      let { c1: controlPoint1, c2: controlPoint2 }: Dynamic =
        anchor.seg.kind === "cubic"
          ? anchor.seg
          : quadraticToCubic(previousAnchor, anchor.seg.c, anchor);
      for (let count: Dynamic = 1; count < 16; count++) {
        let curveProgress: Dynamic = count / 16,
          remainingProgress: Dynamic = 1 - curveProgress;
        callback(
          remainingProgress * remainingProgress * remainingProgress * previousAnchor.x +
            3 * remainingProgress * remainingProgress * curveProgress * controlPoint1.x +
            3 * remainingProgress * curveProgress * curveProgress * controlPoint2.x +
            curveProgress * curveProgress * curveProgress * anchor.x,
          remainingProgress * remainingProgress * remainingProgress * previousAnchor.y +
            3 * remainingProgress * remainingProgress * curveProgress * controlPoint1.y +
            3 * remainingProgress * curveProgress * curveProgress * controlPoint2.y +
            curveProgress * curveProgress * curveProgress * anchor.y,
        );
      }
    });
  return items === 1 / 0
    ? null
    : {
        x0: items,
        y0: minY,
        x1: maxX,
        y1: maxY,
      };
}
function deleteVectorAnchorKeepingCurve(
  vectorPath?: Dynamic,
  anchorSelection?: Dynamic,
): Dynamic {
  let value: Dynamic = vectorPath.contours[anchorSelection.contour];
  if (!value || !value.anchors[anchorSelection.anchor]) return vectorPath;
  let anchors: Dynamic = value.anchors.slice(),
    anchor: Dynamic = anchorSelection.anchor,
    removedAnchor: Dynamic = anchors[anchor],
    followingAnchor: Dynamic = anchors[anchor + 1];
  anchors.splice(anchor, 1);
  if (anchors.length < 2) {
    let remainingContours: Dynamic = vectorPath.contours.filter(
      (contour?: Dynamic, contourIndex?: Dynamic): Dynamic =>
        contourIndex !== anchorSelection.contour,
    );
    return remainingContours.length === 0
      ? null
      : {
          contours: remainingContours,
        };
  }
  if (anchor === 0)
    anchors[0] = {
      ...anchors[0],
      seg: {
        kind: "line",
      },
    };
  else if (followingAnchor) {
    let incomingControl: Dynamic =
        removedAnchor.seg.kind === "cubic"
          ? removedAnchor.seg.c1
          : {
              x: anchors[anchor - 1].x,
              y: anchors[anchor - 1].y,
            },
      outgoingControl: Dynamic =
        followingAnchor.seg.kind === "cubic"
          ? followingAnchor.seg.c2
          : {
              x: followingAnchor.x,
              y: followingAnchor.y,
            };
    anchors[anchor] = {
      ...followingAnchor,
      seg:
        removedAnchor.seg.kind === "line" && followingAnchor.seg.kind === "line"
          ? {
              kind: "line",
            }
          : {
              kind: "cubic",
              c1: incomingControl,
              c2: outgoingControl,
            },
    };
  }
  let updatedContours: Dynamic = vectorPath.contours.slice();
  updatedContours[anchorSelection.contour] = {
    ...value,
    anchors: anchors,
  };
  return {
    contours: updatedContours,
  };
}
function mapVectorPath(vectorPath?: Dynamic, transformPoint?: Dynamic): Dynamic {
  return {
    contours: vectorPath.contours.map(
      (contour?: Dynamic): Dynamic => ({
        closed: contour.closed,
        anchors: contour.anchors.map((anchor?: Dynamic): Dynamic => {
          let value: Dynamic = transformPoint(anchor),
            mappedSegment: Dynamic =
              anchor.seg.kind === "cubic"
                ? {
                    kind: "cubic",
                    c1: transformPoint(anchor.seg.c1),
                    c2: transformPoint(anchor.seg.c2),
                  }
                : anchor.seg.kind === "quad"
                  ? {
                      kind: "quad",
                      c: transformPoint(anchor.seg.c),
                    }
                  : anchor.seg;
          return {
            ...anchor,
            x: value.x,
            y: value.y,
            seg: mappedSegment,
          };
        }),
      }),
    ),
  };
}
function serializeVectorPath(vectorPath?: Dynamic, precision?: Dynamic): Dynamic {
  let value: Dynamic = 10 ** precision,
    callback: Dynamic = (coordinate?: Dynamic): Dynamic => {
      let formattedCoordinate: Dynamic = (Math.round(coordinate * value) / value).toFixed(
        precision,
      );
      formattedCoordinate.indexOf(".") >= 0 && (formattedCoordinate = formattedCoordinate.replace(/\.?0+$/, ""));
      return formattedCoordinate === "-0" ? "0" : formattedCoordinate;
    },
    formatPoint: Dynamic = (point?: Dynamic): Dynamic =>
      callback(point.x) + " " + callback(point.y),
    text: Dynamic = "";
  for (let contour of vectorPath.contours as Dynamic)
    contour.anchors.forEach(
      (anchor?: Dynamic, anchorIndex?: Dynamic): Dynamic => {
        text +=
          anchorIndex === 0
            ? (text === "" ? "M" : " M") + formatPoint(anchor)
            : anchor.seg.kind === "cubic"
              ? " C" +
                formatPoint(anchor.seg.c1) +
                " " +
                formatPoint(anchor.seg.c2) +
                " " +
                formatPoint(anchor)
              : anchor.seg.kind === "quad"
                ? " Q" + formatPoint(anchor.seg.c) + " " + formatPoint(anchor)
                : " L" + formatPoint(anchor);
      },
    );
  return text;
}
export {
  deleteVectorAnchorKeepingCurve,
  inferVectorTangentKind,
  mapVectorPath,
  parseVectorPath,
  quadraticToCubic,
  serializeVectorPath,
  serializeVectorPathBounds,
  vectorAnchorBounds,
  vectorControlBounds,
  VectorPathParsingCosValue,
};
export function installEditorVectorPathParsing(): () => void {
  return () => {
    VectorPathParsingCosValue = Math.cos((6 * Math.PI) / 180);
    quadraticToCubic = (
      startPoint?: Dynamic,
      endPoint?: Dynamic,
      controlPoint?: Dynamic,
    ): Dynamic => ({
      c1: {
        x: startPoint.x + (2 / 3) * (endPoint.x - startPoint.x),
        y: startPoint.y + (2 / 3) * (endPoint.y - startPoint.y),
      },
      c2: {
        x: controlPoint.x + (2 / 3) * (endPoint.x - controlPoint.x),
        y: controlPoint.y + (2 / 3) * (endPoint.y - controlPoint.y),
      },
    });
  };
}

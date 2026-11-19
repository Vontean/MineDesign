/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function fitPenCurve(points?: Dynamic, tolerance?: Dynamic): Dynamic {
  let xs: Dynamic = [],
    ys: Dynamic = [];
  for (let [pointX, pointY] of points as Dynamic)
    (xs.length === 0 ||
      pointX !== xs[xs.length - 1] ||
      pointY !== ys[ys.length - 1]) &&
      (xs.push(pointX), ys.push(pointY));
  let length: Dynamic = xs.length;
  if (length < 2) return null;
  if (length === 2) return [xs[0], ys[0], xs[1], ys[1]];
  let normalize: Dynamic = (dx?: Dynamic, dy?: Dynamic): Dynamic => {
      let magnitude: Dynamic = Math.sqrt(dx * dx + dy * dy);
      return magnitude > 0 ? [dx / magnitude, dy / magnitude] : [0, 0];
    },
    curveCoords: Dynamic = [xs[0], ys[0]],
    emitSegment: Dynamic = (
      control1X?: Dynamic,
      control1Y?: Dynamic,
      control2X?: Dynamic,
      control2Y?: Dynamic,
      endX?: Dynamic,
      endY?: Dynamic,
    ): Dynamic => {
      curveCoords.push(control1X, control1Y, control2X, control2Y, endX, endY);
    },
    parameters: Dynamic = new Array(length).fill(0),
    squaredTolerance: Dynamic = tolerance * tolerance,
    distanceBetween: Dynamic = (indexA?: Dynamic, indexB?: Dynamic): Dynamic =>
      Math.sqrt(
        (xs[indexA] - xs[indexB]) ** 2 +
          (ys[indexA] - ys[indexB]) ** 2,
      ),
    tangentBetween: Dynamic = (fromIndex?: Dynamic, toIndex?: Dynamic): Dynamic => {
      let step: Dynamic = toIndex > fromIndex ? 1 : -1,
        probeIndex: Dynamic = fromIndex + step;
      for (; probeIndex !== toIndex && distanceBetween(fromIndex, probeIndex) < 4 * tolerance; )
        probeIndex += step;
      return normalize(
        xs[probeIndex] - xs[fromIndex],
        ys[probeIndex] - ys[fromIndex],
      );
    },
    fitHandleLengths: Dynamic = (
      first?: Dynamic,
      last?: Dynamic,
      leftTangentX?: Dynamic,
      leftTangentY?: Dynamic,
      rightTangentX?: Dynamic,
      rightTangentY?: Dynamic,
    ): Dynamic => {
      let startX: Dynamic = xs[first],
        startY: Dynamic = ys[first],
        lastX: Dynamic = xs[last],
        lastY: Dynamic = ys[last],
        sumLeftLeft: Dynamic = 0,
        sumLeftRight: Dynamic = 0,
        sumRightRight: Dynamic = 0,
        sumLeftResidual: Dynamic = 0,
        sumRightResidual: Dynamic = 0;
      for (let pointIndex: Dynamic = first; pointIndex <= last; pointIndex++) {
        let t: Dynamic = parameters[pointIndex - first],
          oneMinusT: Dynamic = 1 - t,
          leftBasis: Dynamic = 3 * oneMinusT * oneMinusT * t,
          rightBasis: Dynamic = 3 * oneMinusT * t * t,
          startWeight: Dynamic = oneMinusT * oneMinusT * oneMinusT + leftBasis,
          endWeight: Dynamic = rightBasis + t * t * t,
          leftScaledX: Dynamic = leftTangentX * leftBasis,
          leftScaledY: Dynamic = leftTangentY * leftBasis,
          rightScaledX: Dynamic = rightTangentX * rightBasis,
          rightScaledY: Dynamic = rightTangentY * rightBasis,
          residualX: Dynamic =
            xs[pointIndex] - startX * startWeight - lastX * endWeight,
          residualY: Dynamic =
            ys[pointIndex] - startY * startWeight - lastY * endWeight;
        sumLeftLeft += leftScaledX * leftScaledX + leftScaledY * leftScaledY;
        sumLeftRight += leftScaledX * rightScaledX + leftScaledY * rightScaledY;
        sumRightRight += rightScaledX * rightScaledX + rightScaledY * rightScaledY;
        sumLeftResidual += leftScaledX * residualX + leftScaledY * residualY;
        sumRightResidual += rightScaledX * residualX + rightScaledY * residualY;
      }
      let determinant: Dynamic = sumLeftLeft * sumRightRight - sumLeftRight * sumLeftRight,
        leftAlpha: Dynamic = 0,
        rightAlpha: Dynamic = 0;
      Math.abs(determinant) > 1e-12
        ? ((leftAlpha = (sumLeftResidual * sumRightRight - sumRightResidual * sumLeftRight) / determinant),
          (rightAlpha = (sumLeftLeft * sumRightResidual - sumLeftRight * sumLeftResidual) / determinant))
        : Math.abs(sumLeftLeft + sumLeftRight) > 1e-12 &&
          (leftAlpha = rightAlpha = sumLeftResidual / (sumLeftLeft + sumLeftRight));
      let chordDx: Dynamic = lastX - startX,
        chordDy: Dynamic = lastY - startY,
        chordLength: Dynamic = Math.sqrt(chordDx * chordDx + chordDy * chordDy);
      (leftAlpha < 1e-6 * chordLength ||
        rightAlpha < 1e-6 * chordLength ||
        leftAlpha * (leftTangentX * chordDx + leftTangentY * chordDy) -
          rightAlpha * (rightTangentX * chordDx + rightTangentY * chordDy) >
          chordLength * chordLength) &&
        (leftAlpha = rightAlpha = chordLength / 3);
      return [
        startX + leftTangentX * leftAlpha,
        startY + leftTangentY * leftAlpha,
        lastX + rightTangentX * rightAlpha,
        lastY + rightTangentY * rightAlpha,
      ];
    },
    fitSegment: Dynamic = (
      first?: Dynamic,
      last?: Dynamic,
      leftTangentX?: Dynamic,
      leftTangentY?: Dynamic,
      rightTangentX?: Dynamic,
      rightTangentY?: Dynamic,
    ): Dynamic => {
      let startX: Dynamic = xs[first],
        startY: Dynamic = ys[first],
        lastX: Dynamic = xs[last],
        lastY: Dynamic = ys[last];
      if (last - first === 1) {
        let segmentLength: Dynamic = Math.sqrt(
            (lastX - startX) * (lastX - startX) +
              (lastY - startY) * (lastY - startY),
          ),
          [directionX, directionY]: Dynamic = normalize(
            lastX - startX,
            lastY - startY,
          ),
          leftHandle: Dynamic =
            (segmentLength / 3) *
            Math.max(0.05, leftTangentX * directionX + leftTangentY * directionY),
          rightHandle: Dynamic =
            (segmentLength / 3) *
            Math.max(0.05, -(rightTangentX * directionX + rightTangentY * directionY));
        emitSegment(
          startX + leftTangentX * leftHandle,
          startY + leftTangentY * leftHandle,
          lastX + rightTangentX * rightHandle,
          lastY + rightTangentY * rightHandle,
          lastX,
          lastY,
        );
        return;
      }
      parameters[0] = 0;
      for (let pointIndex: Dynamic = first + 1; pointIndex <= last; pointIndex++)
        parameters[pointIndex - first] =
          parameters[pointIndex - first - 1] +
          Math.sqrt(
            (xs[pointIndex] - xs[pointIndex - 1]) ** 2 +
              (ys[pointIndex] - ys[pointIndex - 1]) ** 2,
          );
      for (let count: Dynamic = 1; count <= last - first; count++)
        parameters[count] =
          parameters[last - first] > 0
            ? parameters[count] / parameters[last - first]
            : 0;
      let splitIndex: Dynamic = (first + last) >> 1,
        previousError: Dynamic = 4 * squaredTolerance;
      for (let iteration: Dynamic = 0; iteration <= 4; iteration++) {
        let [control1X, control1Y, control2X, control2Y]: Dynamic = fitHandleLengths(
            first,
            last,
            leftTangentX,
            leftTangentY,
            rightTangentX,
            rightTangentY,
          ),
          maxError: Dynamic = 0,
          worstIndex: Dynamic = (first + last) >> 1,
          canReparameterize: Dynamic = true;
        for (
          let pointIndex: Dynamic = first + 1;
          pointIndex < last;
          pointIndex++
        ) {
          let t: Dynamic = parameters[pointIndex - first],
            oneMinusT: Dynamic = 1 - t,
            leftBasis: Dynamic = 3 * oneMinusT * oneMinusT * t,
            rightBasis: Dynamic = 3 * oneMinusT * t * t,
            errorX: Dynamic =
              oneMinusT * oneMinusT * oneMinusT * startX +
              leftBasis * control1X +
              rightBasis * control2X +
              t * t * t * lastX -
              xs[pointIndex],
            errorY: Dynamic =
              oneMinusT * oneMinusT * oneMinusT * startY +
              leftBasis * control1Y +
              rightBasis * control2Y +
              t * t * t * lastY -
              ys[pointIndex];
          errorX * errorX + errorY * errorY >= maxError &&
            ((maxError = errorX * errorX + errorY * errorY),
            (worstIndex = pointIndex));
          let firstDerivativeX: Dynamic =
              3 *
              (oneMinusT * oneMinusT * (control1X - startX) +
                2 * oneMinusT * t * (control2X - control1X) +
                t * t * (lastX - control2X)),
            firstDerivativeY: Dynamic =
              3 *
              (oneMinusT * oneMinusT * (control1Y - startY) +
                2 * oneMinusT * t * (control2Y - control1Y) +
                t * t * (lastY - control2Y)),
            secondDerivativeX: Dynamic =
              6 *
              (oneMinusT * (control2X - 2 * control1X + startX) +
                t * (lastX - 2 * control2X + control1X)),
            secondDerivativeY: Dynamic =
              6 *
              (oneMinusT * (control2Y - 2 * control1Y + startY) +
                t * (lastY - 2 * control2Y + control1Y)),
            denominator: Dynamic =
              firstDerivativeX * firstDerivativeX +
              firstDerivativeY * firstDerivativeY +
              errorX * secondDerivativeX +
              errorY * secondDerivativeY,
            nextT: Dynamic =
              Math.abs(denominator) > 1e-9
                ? t - (errorX * firstDerivativeX + errorY * firstDerivativeY) / denominator
                : t;
          (nextT <= parameters[pointIndex - first - 1] || nextT >= 1) &&
            (canReparameterize = false);
          parameters[pointIndex - first] = nextT;
        }
        if (maxError < squaredTolerance) {
          emitSegment(control1X, control1Y, control2X, control2Y, lastX, lastY);
          return;
        }
        splitIndex = worstIndex;
        if (maxError >= previousError || !canReparameterize) break;
        previousError = maxError;
      }
      let [toFirstX, toFirstY]: Dynamic = tangentBetween(splitIndex, first),
        [toLastX, toLastY]: Dynamic = tangentBetween(splitIndex, last),
        [centerTangentX, centerTangentY]: Dynamic = normalize(
          toFirstX - toLastX,
          toFirstY - toLastY,
        );
      fitSegment(first, splitIndex, leftTangentX, leftTangentY, centerTangentX, centerTangentY);
      fitSegment(splitIndex, last, -centerTangentX, -centerTangentY, rightTangentX, rightTangentY);
    },
    fitRange: Dynamic = (first?: Dynamic, last?: Dynamic): Dynamic => {
      let [previousX, previousY]: Dynamic = [xs[first], ys[first]];
      for (let pointIndex: Dynamic = first + 1; pointIndex < last; pointIndex++) {
        let [currentX, currentY]: Dynamic = [xs[pointIndex], ys[pointIndex]];
        distanceBetween(pointIndex, pointIndex + 1) < 4 * tolerance &&
          Math.sqrt((currentX - previousX) ** 2 + (currentY - previousY) ** 2) <
            4 * tolerance &&
          ((xs[pointIndex] = (previousX + 2 * currentX + xs[pointIndex + 1]) / 4),
          (ys[pointIndex] = (previousY + 2 * currentY + ys[pointIndex + 1]) / 4));
        [previousX, previousY] = [currentX, currentY];
      }
      fitSegment(
        first,
        last,
        ...tangentBetween(first, last),
        ...tangentBetween(last, first),
      );
    },
    segmentStart: Dynamic = 0,
    turnCosine: Dynamic = (pointIndex?: Dynamic): Dynamic => {
      if (
        pointIndex <= segmentStart ||
        pointIndex + 1 >= length ||
        distanceBetween(pointIndex, pointIndex - 1) > 16 * tolerance ||
        distanceBetween(pointIndex, pointIndex + 1) > 16 * tolerance
      )
        return 1;
      let [beforeIndex, afterIndex]: Dynamic = [pointIndex - 1, pointIndex + 1];
      for (; beforeIndex > segmentStart && distanceBetween(pointIndex, beforeIndex) < 4 * tolerance; )
        beforeIndex--;
      for (; afterIndex < length - 1 && distanceBetween(pointIndex, afterIndex) < 4 * tolerance; )
        afterIndex++;
      let [incomingX, incomingY]: Dynamic = normalize(
          xs[pointIndex] - xs[beforeIndex],
          ys[pointIndex] - ys[beforeIndex],
        ),
        [outgoingX, outgoingY]: Dynamic = normalize(
          xs[afterIndex] - xs[pointIndex],
          ys[afterIndex] - ys[pointIndex],
        );
      return incomingX * outgoingX + incomingY * outgoingY;
    };
  for (let count: Dynamic = 1; count + 1 < length; count++) {
    let cosine: Dynamic = turnCosine(count);
    cosine < 0.5 &&
      cosine <= turnCosine(count + 1) &&
      (fitRange(segmentStart, count), (segmentStart = count));
  }
  fitRange(segmentStart, length - 1);
  return curveCoords;
}
function flattenCubicPath(coords?: Dynamic, tolerance: Dynamic = 0.05): Dynamic {
  let flattened: Dynamic = [coords[0], coords[1]];
  if (coords.length === 4) return [...coords];
  for (let count: Dynamic = 2; count + 5 < coords.length; count += 6) {
    let currentX: Dynamic = flattened[flattened.length - 2],
      currentY: Dynamic = flattened[flattened.length - 1],
      [control1X, control1Y, control2X, control2Y]: Dynamic = [
        coords[count],
        coords[count + 1],
        coords[count + 2],
        coords[count + 3],
      ],
      [endX, endY]: Dynamic = [coords[count + 4], coords[count + 5]],
      splitTimes: Dynamic = [];
    for (let [startCoord, control1Coord, control2Coord, endCoord] of [
      [currentX, control1X, control2X, endX],
      [currentY, control1Y, control2Y, endY],
    ] as Dynamic) {
      if (
        Math.min(control1Coord, control2Coord) >= Math.min(startCoord, endCoord) - tolerance &&
        Math.max(control1Coord, control2Coord) <= Math.max(startCoord, endCoord) + tolerance
      )
        continue;
      let cubicA: Dynamic = -startCoord + 3 * control1Coord - 3 * control2Coord + endCoord,
        cubicB: Dynamic = 2 * (startCoord - 2 * control1Coord + control2Coord),
        cubicC: Dynamic = control1Coord - startCoord,
        roots: Dynamic =
          Math.abs(cubicA) < 1e-9
            ? Math.abs(cubicB) < 1e-9
              ? []
              : [-cubicC / cubicB]
            : ((discriminant?: Dynamic): Dynamic =>
                discriminant < 0
                  ? []
                  : [
                      (-cubicB + Math.sqrt(discriminant)) / (2 * cubicA),
                      (-cubicB - Math.sqrt(discriminant)) / (2 * cubicA),
                    ])(cubicB * cubicB - 4 * cubicA * cubicC);
      for (let root of roots as Dynamic)
        root > 0.001 && root < 1 - 0.001 && splitTimes.push(root);
    }
    splitTimes.sort(
      (timeA?: Dynamic, timeB?: Dynamic): Dynamic => timeA - timeB,
    );
    let consumedTime: Dynamic = 0;
    for (let splitTime of splitTimes as Dynamic) {
      let localTime: Dynamic = (splitTime - consumedTime) / (1 - consumedTime);
      if (localTime <= 0.001 || localTime >= 1 - 0.001) continue;
      let firstMidX: Dynamic = currentX + (control1X - currentX) * localTime,
        firstMidY: Dynamic = currentY + (control1Y - currentY) * localTime,
        secondMidX: Dynamic = control1X + (control2X - control1X) * localTime,
        secondMidY: Dynamic = control1Y + (control2Y - control1Y) * localTime,
        thirdMidX: Dynamic = control2X + (endX - control2X) * localTime,
        thirdMidY: Dynamic = control2Y + (endY - control2Y) * localTime,
        leftMidX: Dynamic = firstMidX + (secondMidX - firstMidX) * localTime,
        leftMidY: Dynamic = firstMidY + (secondMidY - firstMidY) * localTime,
        rightMidX: Dynamic = secondMidX + (thirdMidX - secondMidX) * localTime,
        rightMidY: Dynamic = secondMidY + (thirdMidY - secondMidY) * localTime,
        splitX: Dynamic = leftMidX + (rightMidX - leftMidX) * localTime,
        splitY: Dynamic = leftMidY + (rightMidY - leftMidY) * localTime;
      (splitX - currentX) ** 2 + (splitY - currentY) ** 2 < 0.25 ||
        (splitX - endX) ** 2 + (splitY - endY) ** 2 < 0.25 ||
        (flattened.push(firstMidX, firstMidY, leftMidX, leftMidY, splitX, splitY),
        ([currentX, currentY, control1X, control1Y, control2X, control2Y] = [
          splitX,
          splitY,
          rightMidX,
          rightMidY,
          thirdMidX,
          thirdMidY,
        ]),
        (consumedTime = splitTime));
    }
    flattened.push(control1X, control1Y, control2X, control2Y, endX, endY);
  }
  return flattened;
}
function serializePenPath(coords?: Dynamic, decimals?: Dynamic): Dynamic {
  let scale: Dynamic = Math.pow(10, decimals),
    formatNumber: Dynamic = (amount?: Dynamic): Dynamic => {
      let text: Dynamic = (Math.round(amount * scale) / scale).toFixed(
        decimals,
      );
      text.indexOf(".") >= 0 && (text = text.replace(/\.?0+$/, ""));
      return text === "-0" ? "0" : text;
    },
    path: Dynamic = "M" + formatNumber(coords[0]) + " " + formatNumber(coords[1]);
  if (coords.length === 4)
    return path + " L" + formatNumber(coords[2]) + " " + formatNumber(coords[3]);
  for (let count: Dynamic = 2; count < coords.length; count++)
    path += ((count - 2) % 6 === 0 ? " C" : " ") + formatNumber(coords[count]);
  return path;
}
function penPathBounds(coords?: Dynamic, decimals?: Dynamic): Dynamic {
  let [minX, minY, maxX, maxY]: Dynamic = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0,
  ];
  for (let index: Dynamic = 0; index + 1 < coords.length; index += 2)
    [minX, minY, maxX, maxY] = [
      Math.min(minX, coords[index]),
      Math.min(minY, coords[index + 1]),
      Math.max(maxX, coords[index]),
      Math.max(maxY, coords[index + 1]),
    ];
  let scale: Dynamic = 10 ** decimals,
    roundValue: Dynamic = (amount?: Dynamic): Dynamic =>
      Math.round(amount * scale) / scale;
  return {
    x: minX,
    y: minY,
    w: roundValue(maxX - minX),
    h: roundValue(maxY - minY),
    d: serializePenPath(
      coords.map(
        (coord?: Dynamic, coordIndex?: Dynamic): Dynamic =>
          coord - (coordIndex % 2 === 0 ? minX : minY),
      ),
      decimals,
    ),
  };
}
function parsePenPath(path?: Dynamic, curveSteps: Dynamic = 12): Dynamic {
  let points: Dynamic = [];
  for (let command of (path.match(/[MLC][^MLC]*/g) ?? []) as Dynamic) {
    let numbers: Dynamic = (
        command.slice(1).match(/-?\d+(?:\.\d+)?/g) ?? []
      ).map(Number),
      previousPoint: Dynamic = points[points.length - 1];
    if (command[0] === "C" && previousPoint && numbers.length >= 6)
      for (let count: Dynamic = 1; count <= curveSteps; count++) {
        let t: Dynamic = count / curveSteps,
          oneMinusT: Dynamic = 1 - t;
        points.push({
          move: false,
          x:
            oneMinusT * oneMinusT * oneMinusT * previousPoint.x +
            3 * oneMinusT * oneMinusT * t * numbers[0] +
            3 * oneMinusT * t * t * numbers[2] +
            t * t * t * numbers[4],
          y:
            oneMinusT * oneMinusT * oneMinusT * previousPoint.y +
            3 * oneMinusT * oneMinusT * t * numbers[1] +
            3 * oneMinusT * t * t * numbers[3] +
            t * t * t * numbers[5],
        });
      }
    else
      numbers.length >= 2 &&
        points.push({
          move: command[0] === "M" || !previousPoint,
          x: numbers[0],
          y: numbers[1],
        });
  }
  return points;
}
export {
  fitPenCurve,
  flattenCubicPath,
  parsePenPath,
  penPathBounds,
  serializePenPath,
};
export function installEditorGeometryPen(): () => void {
  return () => {};
}

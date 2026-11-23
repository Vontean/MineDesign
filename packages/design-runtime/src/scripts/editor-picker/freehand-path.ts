import type { Dynamic } from "../../runtime-types";

export const fitCubicBezierPath: Dynamic = function (
  this: Dynamic,
  points?: Dynamic,
  tolerance?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const sampleXs: Dynamic = [];
  const sampleYs: Dynamic = [];
  for (const [x, y] of points as Dynamic)
    if (
      sampleXs.length === 0 ||
      x !== sampleXs[sampleXs.length - 1] ||
      y !== sampleYs[sampleYs.length - 1]
    ) {
      sampleXs.push(x);
      sampleYs.push(y);
    }
  const sampleCount: Dynamic = sampleXs.length;
  if (sampleCount < 2) return null;
  if (sampleCount === 2) return [sampleXs[0], sampleYs[0], sampleXs[1], sampleYs[1]];
  const normalizeVector: Dynamic = (
    x?: Dynamic,
    y?: Dynamic,
    ..._unusedVectorArgs: Dynamic[]
  ): Dynamic => {
    const length: Dynamic = Math.sqrt(x * x + y * y);
    return length > 0 ? [x / length, y / length] : [0, 0];
  };
  const pathCoordinates: Dynamic = [sampleXs[0], sampleYs[0]];
  const appendCurve: Dynamic = (
    firstControlX?: Dynamic,
    firstControlY?: Dynamic,
    secondControlX?: Dynamic,
    secondControlY?: Dynamic,
    endX?: Dynamic,
    endY?: Dynamic,
    ..._unusedCurveArgs: Dynamic[]
  ): Dynamic => {
    pathCoordinates.push(firstControlX, firstControlY, secondControlX, secondControlY, endX, endY);
  };
  const parameters: Dynamic = Array(sampleCount).fill(0);
  const toleranceSquared: Dynamic = tolerance * tolerance;
  const distanceBetweenSamples: Dynamic = (
    firstSample?: Dynamic,
    secondSample?: Dynamic,
    ..._unusedDistanceArgs: Dynamic[]
  ): Dynamic =>
    Math.sqrt(
      (sampleXs[firstSample] - sampleXs[secondSample]) ** 2 + (sampleYs[firstSample] - sampleYs[secondSample]) ** 2,
    );
  const getTangentTowards: Dynamic = (
    startIndex?: Dynamic,
    endIndex?: Dynamic,
    ..._unusedTangentArgs: Dynamic[]
  ): Dynamic => {
    const step: Dynamic = endIndex > startIndex ? 1 : -1;
    let tangentSampleIndex: Dynamic = startIndex + step;
    for (; tangentSampleIndex !== endIndex && distanceBetweenSamples(startIndex, tangentSampleIndex) < 4 * tolerance; )
      tangentSampleIndex += step;
    return normalizeVector(sampleXs[tangentSampleIndex] - sampleXs[startIndex], sampleYs[tangentSampleIndex] - sampleYs[startIndex]);
  };
  const solveControlPoints: Dynamic = (
    startIndex?: Dynamic,
    endIndex?: Dynamic,
    startTangentX?: Dynamic,
    startTangentY?: Dynamic,
    endTangentX?: Dynamic,
    endTangentY?: Dynamic,
    ..._unusedSolveArgs: Dynamic[]
  ): Dynamic => {
    const startX: Dynamic = sampleXs[startIndex];
    const startY: Dynamic = sampleYs[startIndex];
    const endX: Dynamic = sampleXs[endIndex];
    const endY: Dynamic = sampleYs[endIndex];
    let startTangentSquareSum: Dynamic = 0;
    let tangentProductSum: Dynamic = 0;
    let endTangentSquareSum: Dynamic = 0;
    let startResidualSum: Dynamic = 0;
    let endResidualSum: Dynamic = 0;
    for (let sampleIndex: Dynamic = startIndex; sampleIndex <= endIndex; sampleIndex++) {
      const t: Dynamic = parameters[sampleIndex - startIndex];
      const oneMinusT: Dynamic = 1 - t;
      const firstControlWeight: Dynamic = 3 * oneMinusT * oneMinusT * t;
      const secondControlWeight: Dynamic = 3 * oneMinusT * t * t;
      const startWeight: Dynamic = oneMinusT * oneMinusT * oneMinusT + firstControlWeight;
      const endWeight: Dynamic = secondControlWeight + t * t * t;
      const weightedStartX: Dynamic = startTangentX * firstControlWeight;
      const weightedStartY: Dynamic = startTangentY * firstControlWeight;
      const weightedEndX: Dynamic = endTangentX * secondControlWeight;
      const weightedEndY: Dynamic = endTangentY * secondControlWeight;
      const residualX: Dynamic =
        sampleXs[sampleIndex] - startX * startWeight - endX * endWeight;
      const residualY: Dynamic =
        sampleYs[sampleIndex] - startY * startWeight - endY * endWeight;
      startTangentSquareSum += weightedStartX * weightedStartX + weightedStartY * weightedStartY;
      tangentProductSum += weightedStartX * weightedEndX + weightedStartY * weightedEndY;
      endTangentSquareSum += weightedEndX * weightedEndX + weightedEndY * weightedEndY;
      startResidualSum += weightedStartX * residualX + weightedStartY * residualY;
      endResidualSum += weightedEndX * residualX + weightedEndY * residualY;
    }
    const determinant: Dynamic = startTangentSquareSum * endTangentSquareSum - tangentProductSum * tangentProductSum;
    let startHandleLength: Dynamic = 0;
    let endHandleLength: Dynamic = 0;
    if (Math.abs(determinant) > 1e-12) {
      startHandleLength = (startResidualSum * endTangentSquareSum - endResidualSum * tangentProductSum) / determinant;
      endHandleLength = (startTangentSquareSum * endResidualSum - tangentProductSum * startResidualSum) / determinant;
    } else {
      if (Math.abs(startTangentSquareSum + tangentProductSum) > 1e-12) {
        startHandleLength = endHandleLength = startResidualSum / (startTangentSquareSum + tangentProductSum);
      }
    }
    const chordX: Dynamic = endX - startX;
    const chordY: Dynamic = endY - startY;
    const chordLength: Dynamic = Math.sqrt(
      chordX * chordX + chordY * chordY,
    );
    if (
      startHandleLength < 1e-6 * chordLength ||
      endHandleLength < 1e-6 * chordLength ||
      startHandleLength * (startTangentX * chordX + startTangentY * chordY) -
        endHandleLength * (endTangentX * chordX + endTangentY * chordY) >
        chordLength * chordLength
    ) {
      startHandleLength = endHandleLength = chordLength / 3;
    }
    return [
      startX + startTangentX * startHandleLength,
      startY + startTangentY * startHandleLength,
      endX + endTangentX * endHandleLength,
      endY + endTangentY * endHandleLength,
    ];
  };
  const fitSegment: Dynamic = (
    startIndex?: Dynamic,
    endIndex?: Dynamic,
    startTangentX?: Dynamic,
    startTangentY?: Dynamic,
    endTangentX?: Dynamic,
    endTangentY?: Dynamic,
    ..._unusedFitArgs: Dynamic[]
  ): Dynamic => {
    const startX: Dynamic = sampleXs[startIndex];
    const startY: Dynamic = sampleYs[startIndex];
    const endX: Dynamic = sampleXs[endIndex];
    const endY: Dynamic = sampleYs[endIndex];
    if (endIndex - startIndex === 1) {
      const chordLength: Dynamic = Math.sqrt(
        (endX - startX) * (endX - startX) +
          (endY - startY) * (endY - startY),
      );
      const [chordDirectionX, chordDirectionY]: Dynamic = normalizeVector(
        endX - startX,
        endY - startY,
      );
      const startHandleLength: Dynamic =
        (chordLength / 3) * Math.max(0.05, startTangentX * chordDirectionX + startTangentY * chordDirectionY);
      const endHandleLength: Dynamic =
        (chordLength / 3) *
        Math.max(0.05, -(endTangentX * chordDirectionX + endTangentY * chordDirectionY));
      appendCurve(
        startX + startTangentX * startHandleLength,
        startY + startTangentY * startHandleLength,
        endX + endTangentX * endHandleLength,
        endY + endTangentY * endHandleLength,
        endX,
        endY,
      );
      return;
    }
    parameters[0] = 0;
    for (let sampleIndex: Dynamic = startIndex + 1; sampleIndex <= endIndex; sampleIndex++)
      parameters[sampleIndex - startIndex] =
        parameters[sampleIndex - startIndex - 1] +
        Math.sqrt(
          (sampleXs[sampleIndex] - sampleXs[sampleIndex - 1]) ** 2 +
            (sampleYs[sampleIndex] - sampleYs[sampleIndex - 1]) ** 2,
        );
    for (let parameterIndex: Dynamic = 1; parameterIndex <= endIndex - startIndex; parameterIndex++)
      parameters[parameterIndex] =
        parameters[endIndex - startIndex] > 0
          ? parameters[parameterIndex] / parameters[endIndex - startIndex]
          : 0;
    let splitIndex: Dynamic = (startIndex + endIndex) >> 1;
    let previousMaxErrorSquared: Dynamic = 4 * toleranceSquared;
    for (let iteration: Dynamic = 0; iteration <= 4; iteration++) {
      const [firstControlX, firstControlY, secondControlX, secondControlY]: Dynamic = solveControlPoints(
        startIndex,
        endIndex,
        startTangentX,
        startTangentY,
        endTangentX,
        endTangentY,
      );
      let maxErrorSquared: Dynamic = 0;
      let worstSampleIndex: Dynamic = (startIndex + endIndex) >> 1;
      let parametersStayOrdered: Dynamic = true;
      for (
        let sampleIndex: Dynamic = startIndex + 1;
        sampleIndex < endIndex;
        sampleIndex++
      ) {
        const t: Dynamic = parameters[sampleIndex - startIndex];
        const oneMinusT: Dynamic = 1 - t;
        const firstControlWeight: Dynamic = 3 * oneMinusT * oneMinusT * t;
        const secondControlWeight: Dynamic = 3 * oneMinusT * t * t;
        const errorX: Dynamic =
          oneMinusT * oneMinusT * oneMinusT * startX +
          firstControlWeight * firstControlX +
          secondControlWeight * secondControlX +
          t * t * t * endX -
          sampleXs[sampleIndex];
        const errorY: Dynamic =
          oneMinusT * oneMinusT * oneMinusT * startY +
          firstControlWeight * firstControlY +
          secondControlWeight * secondControlY +
          t * t * t * endY -
          sampleYs[sampleIndex];
        if (errorX * errorX + errorY * errorY >= maxErrorSquared) {
          maxErrorSquared = errorX * errorX + errorY * errorY;
          worstSampleIndex = sampleIndex;
        }
        const velocityX: Dynamic =
          3 *
          (oneMinusT * oneMinusT * (firstControlX - startX) +
            2 * oneMinusT * t * (secondControlX - firstControlX) +
            t * t * (endX - secondControlX));
        const velocityY: Dynamic =
          3 *
          (oneMinusT * oneMinusT * (firstControlY - startY) +
            2 * oneMinusT * t * (secondControlY - firstControlY) +
            t * t * (endY - secondControlY));
        const accelerationX: Dynamic =
          6 *
          (oneMinusT * (secondControlX - 2 * firstControlX + startX) +
            t * (endX - 2 * secondControlX + firstControlX));
        const accelerationY: Dynamic =
          6 *
          (oneMinusT * (secondControlY - 2 * firstControlY + startY) +
            t * (endY - 2 * secondControlY + firstControlY));
        const newtonDenominator: Dynamic =
          velocityX * velocityX +
          velocityY * velocityY +
          errorX * accelerationX +
          errorY * accelerationY;
        const nextT: Dynamic =
          Math.abs(newtonDenominator) > 1e-9
            ? t -
              (errorX * velocityX + errorY * velocityY) / newtonDenominator
            : t;
        if (nextT <= parameters[sampleIndex - startIndex - 1] || nextT >= 1) {
          parametersStayOrdered = false;
        }
        parameters[sampleIndex - startIndex] = nextT;
      }
      if (maxErrorSquared < toleranceSquared) {
        appendCurve(firstControlX, firstControlY, secondControlX, secondControlY, endX, endY);
        return;
      }
      splitIndex = worstSampleIndex;
      if (maxErrorSquared >= previousMaxErrorSquared || !parametersStayOrdered) break;
      previousMaxErrorSquared = maxErrorSquared;
    }
    const [backwardTangentX, backwardTangentY]: Dynamic = getTangentTowards(splitIndex, startIndex);
    const [forwardTangentX, forwardTangentY]: Dynamic = getTangentTowards(splitIndex, endIndex);
    const [splitTangentX, splitTangentY]: Dynamic = normalizeVector(backwardTangentX - forwardTangentX, backwardTangentY - forwardTangentY);
    fitSegment(startIndex, splitIndex, startTangentX, startTangentY, splitTangentX, splitTangentY);
    fitSegment(splitIndex, endIndex, -splitTangentX, -splitTangentY, endTangentX, endTangentY);
  };
  const smoothAndFitSegment: Dynamic = (
    startIndex?: Dynamic,
    endIndex?: Dynamic,
    ..._unusedSmoothArgs: Dynamic[]
  ): Dynamic => {
    let [previousX, previousY]: Dynamic = [sampleXs[startIndex], sampleYs[startIndex]];
    for (let sampleIndex: Dynamic = startIndex + 1; sampleIndex < endIndex; sampleIndex++) {
      const [currentX, currentY]: Dynamic = [sampleXs[sampleIndex], sampleYs[sampleIndex]];
      if (
        distanceBetweenSamples(sampleIndex, sampleIndex + 1) < 4 * tolerance &&
        Math.sqrt((currentX - previousX) ** 2 + (currentY - previousY) ** 2) <
          4 * tolerance
      ) {
        sampleXs[sampleIndex] = (previousX + 2 * currentX + sampleXs[sampleIndex + 1]) / 4;
        sampleYs[sampleIndex] = (previousY + 2 * currentY + sampleYs[sampleIndex + 1]) / 4;
      }
      [previousX, previousY] = [currentX, currentY];
    }
    fitSegment(startIndex, endIndex, ...getTangentTowards(startIndex, endIndex), ...getTangentTowards(endIndex, startIndex));
  };
  let segmentStart: Dynamic = 0;
  const cornerCosine: Dynamic = (
    sampleIndex?: Dynamic,
    ..._unusedCornerArgs: Dynamic[]
  ): Dynamic => {
    if (
      sampleIndex <= segmentStart ||
      sampleIndex + 1 >= sampleCount ||
      distanceBetweenSamples(sampleIndex, sampleIndex - 1) > 16 * tolerance ||
      distanceBetweenSamples(sampleIndex, sampleIndex + 1) > 16 * tolerance
    )
      return 1;
    let [previousIndex, nextIndex]: Dynamic = [sampleIndex - 1, sampleIndex + 1];
    for (; previousIndex > segmentStart && distanceBetweenSamples(sampleIndex, previousIndex) < 4 * tolerance; )
      previousIndex--;
    for (; nextIndex < sampleCount - 1 && distanceBetweenSamples(sampleIndex, nextIndex) < 4 * tolerance; ) nextIndex++;
    const [incomingX, incomingY]: Dynamic = normalizeVector(
      sampleXs[sampleIndex] - sampleXs[previousIndex],
      sampleYs[sampleIndex] - sampleYs[previousIndex],
    );
    const [outgoingX, outgoingY]: Dynamic = normalizeVector(
      sampleXs[nextIndex] - sampleXs[sampleIndex],
      sampleYs[nextIndex] - sampleYs[sampleIndex],
    );
    return incomingX * outgoingX + incomingY * outgoingY;
  };
  for (let sampleIndex: Dynamic = 1; sampleIndex + 1 < sampleCount; sampleIndex++) {
    const cosine: Dynamic = cornerCosine(sampleIndex);
    if (cosine < 0.5 && cosine <= cornerCosine(sampleIndex + 1)) {
      smoothAndFitSegment(segmentStart, sampleIndex);
      segmentStart = sampleIndex;
    }
  }
  smoothAndFitSegment(segmentStart, sampleCount - 1);
  return pathCoordinates;
};
export const serializeBezierPath: Dynamic = function (
  this: Dynamic,
  coordinates?: Dynamic,
  decimals?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  const roundingScale: Dynamic = Math.pow(10, decimals);
  const formatCoordinate: Dynamic = (
    coordinate?: Dynamic,
    ..._unusedFormatArgs: Dynamic[]
  ): Dynamic => {
    let coordinateText: Dynamic = (Math.round(coordinate * roundingScale) / roundingScale).toFixed(decimals);
    if (coordinateText.indexOf(".") >= 0) {
      coordinateText = coordinateText.replace(/\.?0+$/, "");
    }
    return coordinateText === "-0" ? "0" : coordinateText;
  };
  let pathData: Dynamic = "M" + formatCoordinate(coordinates[0]) + " " + formatCoordinate(coordinates[1]);
  if (coordinates.length === 4)
    return pathData + " L" + formatCoordinate(coordinates[2]) + " " + formatCoordinate(coordinates[3]);
  for (let coordinateIndex: Dynamic = 2; coordinateIndex < coordinates.length; coordinateIndex++)
    pathData += ((coordinateIndex - 2) % 6 === 0 ? " C" : " ") + formatCoordinate(coordinates[coordinateIndex]);
  return pathData;
};

export function serializePolyline(
  this: Dynamic,
  points?: Dynamic,
  originX?: Dynamic,
  originY?: Dynamic,
  scale?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  for (
    var scaleFactor: Dynamic = scale || 1, pathData: Dynamic = "", pointIndex: Dynamic = 0;
    pointIndex < points.length;
    pointIndex++
  )
    pathData +=
      (pointIndex === 0 ? "M" : "L") +
      Math.round((points[pointIndex][0] - originX) / scaleFactor) +
      " " +
      Math.round((points[pointIndex][1] - originY) / scaleFactor) +
      " ";
  return pathData.trim();
}

export const maxPathLength: Dynamic = 24e3;
export function simplifyPenPath(
  this: Dynamic,
  points?: Dynamic,
  tolerance?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  for (
    var toleranceValue: Dynamic = tolerance;
    toleranceValue > 0 && isFinite(toleranceValue) && toleranceValue <= 16 * tolerance;
    toleranceValue *= 2
  ) {
    var simplifiedPath: Dynamic = fitCubicBezierPath(points, toleranceValue);
    if (!simplifiedPath || simplifiedPath.length <= 4) break;
    if (!(simplifiedPath.length * 2 > maxPathLength)) {
      var reducedPath: Dynamic = serializeBezierPath(simplifiedPath, 1);
      if (reducedPath.length <= maxPathLength) return reducedPath;
    }
  }
  for (
    var polyline: Dynamic = serializePolyline(points, 0, 0), sampleStep: Dynamic = 2;
    polyline.length > 95e3;
    sampleStep++
  )
    polyline = serializePolyline(
      points.filter(function (
        this: Dynamic,
        top?: Dynamic,
        pointIndex?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        return pointIndex % sampleStep === 0 || pointIndex === points.length - 1;
      }),
      0,
      0,
    );
  return polyline;
}

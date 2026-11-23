/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { selectionResizeLimits, transformPointBetweenRects, transformRectBetweenRects } from "../editor/geometry/resize";
import { rotatePoint } from "../editor/geometry/rotation";
import { annotationBounds, annotationGeometry, annotationRotation, isShapeAnnotation, normalizeRotationDegrees, minEmbeddedArtboardDimension as defaultScale, minShapeDimension as annotationScale, minImageDimension as imageScale, maxCanvasItemDimension as maximumScale } from "../platform/file-content";

var annotationTransformSnapshot: Dynamic;
var artboardTransformSnapshot: Dynamic;
var transformAxisProperties: Dynamic;
var transformTouchedProperties: Dynamic;
var clampResizedDimension: Dynamic;
var transformHandleHitPadding: Dynamic;
function preserveRoundedTransformValues(
  values?: Dynamic,
  previous?: Dynamic,
  touched?: Dynamic,
): Dynamic {
  let state: Dynamic = {},
    value: Dynamic = previous;
  for (let propertyName of Object.keys(values) as Dynamic) {
    let propertyValue: Dynamic = values[propertyName];
    if (!touched.has(propertyName) || propertyValue === undefined) continue;
    let [items, roundedValue]: Dynamic = [Math.round(propertyValue), value[propertyName]];
    state[propertyName] =
      roundedValue !== undefined && Math.round(roundedValue) === items ? roundedValue : items;
  }
  return state;
}
function transformArtboardBounds(
  artboard?: Dynamic,
  fromRect?: Dynamic,
  toRect?: Dynamic,
  axes?: Dynamic,
): Dynamic {
  let value: Dynamic = transformRectBetweenRects(
      artboard,
      fromRect,
      toRect,
    ),
    isFrameless: Dynamic = artboard.frameless
      ? {
          x: value.x,
          y: value.y,
        }
      : {
          x: value.x,
          y: value.y,
          w: clampResizedDimension(
            value.w,
            artboard.w,
            defaultScale,
            maximumScale,
          ),
          h: clampResizedDimension(
            value.h,
            artboard.h,
            defaultScale,
            maximumScale,
          ),
        };
  return preserveRoundedTransformValues(
    isFrameless,
    artboardTransformSnapshot(artboard),
    transformTouchedProperties(axes),
  );
}
function transformAnnotationBounds(
  annotation?: Dynamic,
  fromRect?: Dynamic,
  toRect?: Dynamic,
  axes?: Dynamic,
): Dynamic {
  let value: Dynamic = transformTouchedProperties(axes);
  if (!isShapeAnnotation(annotation))
    return preserveRoundedTransformValues(
      transformPointBetweenRects(annotation, fromRect, toRect),
      annotationTransformSnapshot(annotation),
      value,
    );
  let annotationValue: Dynamic = annotation;
  switch (annotationValue.kind) {
    case "line":
    case "arrow": {
      let [items, annotationPoint]: Dynamic = [
        transformPointBetweenRects(annotationValue, fromRect, toRect),
        transformPointBetweenRects(
          {
            x: annotationValue.x2,
            y: annotationValue.y2,
          },
          fromRect,
          toRect,
        ),
      ];
      return preserveRoundedTransformValues(
        {
          x: items.x,
          y: items.y,
          x2: annotationPoint.x,
          y2: annotationPoint.y,
        },
        annotationGeometry(annotationValue),
        value,
      );
    }
    case "image":
    case "rect":
    case "oval":
    case "pen": {
      let transformedRect: Dynamic = transformRectBetweenRects(
          annotationBounds(annotationValue),
          fromRect,
          toRect,
        ),
        rotation: Dynamic =
          annotationValue.kind === "image"
            ? imageScale
            : annotationScale;
      return preserveRoundedTransformValues(
        {
          x: transformedRect.x,
          y: transformedRect.y,
          w: clampResizedDimension(
            transformedRect.w,
            annotationValue.w,
            rotation,
            maximumScale,
          ),
          h: clampResizedDimension(
            transformedRect.h,
            annotationValue.h,
            rotation,
            maximumScale,
          ),
        },
        annotationGeometry(annotationValue),
        value,
      );
    }
  }
}
function rotateAnnotationAboutPoint(
  annotation?: Dynamic,
  box?: Dynamic,
  pivot?: Dynamic,
  degrees?: Dynamic,
): Dynamic {
  let value: Dynamic = transformTouchedProperties("rotate");
  if (annotation.kind === "line" || annotation.kind === "arrow") {
    let [items, rotatedPoint]: Dynamic = [
      rotatePoint(annotation, pivot, degrees),
      rotatePoint(
        {
          x: annotation.x2,
          y: annotation.y2,
        },
        pivot,
        degrees,
      ),
    ];
    return preserveRoundedTransformValues(
      {
        x: items.x,
        y: items.y,
        x2: rotatedPoint.x,
        y2: rotatedPoint.y,
      },
      annotationGeometry(annotation),
      value,
    );
  }
  let state: Dynamic = {
      x: box.x + box.w / 2,
      y: box.y + box.h / 2,
    },
    rotatedDelta: Dynamic = rotatePoint(state, pivot, degrees);
  return preserveRoundedTransformValues(
    {
      x: annotation.x + rotatedDelta.x - state.x,
      y: annotation.y + rotatedDelta.y - state.y,
      rotate: normalizeRotationDegrees(
        annotationRotation(annotation) + degrees,
      ),
    },
    annotationTransformSnapshot(annotation),
    value,
  );
}
function selectionScaleLimits(
  selectionBox?: Dynamic,
  artboards?: Dynamic,
  annotations?: Dynamic,
): Dynamic {
  let callback: Dynamic = (coordinate?: Dynamic): Dynamic => ({
      w: coordinate,
      h: coordinate,
    }),
    { min: value, max: maxScale }: Dynamic = selectionResizeLimits(
      selectionBox,
      [
        ...artboards
          .filter((board?: Dynamic): Dynamic => !board.frameless)
          .map(
            (board?: Dynamic): Dynamic => ({
              w: board.w,
              h: board.h,
              min: callback(defaultScale),
              max: callback(maximumScale),
            }),
          ),
        ...annotations.flatMap(
          ({ spec: spec, box: box }: Dynamic): Dynamic =>
            isShapeAnnotation(spec) &&
            spec.kind !== "line" &&
            spec.kind !== "arrow"
              ? [
                  {
                    w: box.w,
                    h: box.h,
                    min: callback(
                      spec.kind === "image"
                        ? imageScale
                        : annotationScale,
                    ),
                    max: callback(maximumScale),
                  },
                ]
              : [],
        ),
      ],
    );
  return {
    min: {
      w: Math.max(
        value.w,
        Math.min(transformHandleHitPadding, selectionBox.w),
      ),
      h: Math.max(
        value.h,
        Math.min(transformHandleHitPadding, selectionBox.h),
      ),
    },
    max: maxScale,
  };
}
function selectionTransformMembers(
  artboards?: Dynamic,
  annotations?: Dynamic,
): Dynamic {
  return [
    ...artboards.map(
      (member?: Dynamic): Dynamic => ({
        id: "board:" + member.file,
        at: [member.x, member.y],
        fixed: [member.w, member.h],
      }),
    ),
    ...annotations.map(
      (source?: Dynamic): Dynamic =>
        source.kind === "line" || source.kind === "arrow"
          ? {
              id: source.id,
              at: [source.x, source.y, source.x2, source.y2],
              fixed: [],
            }
          : {
              id: source.id,
              at: [source.x, source.y],
              fixed: isShapeAnnotation(source)
                ? [
                    annotationBounds(source).w,
                    annotationBounds(source).h,
                    annotationRotation(source),
                  ]
                : [source.w, annotationRotation(source)],
            },
    ),
  ];
}
function translatedSelectionTransform(
  snapshot?: Dynamic,
  members?: Dynamic,
): Dynamic {
  if (members.length !== snapshot.members.length || members.length === 0)
    return null;
  let [items, offsetY]: Dynamic = [
    members[0].at[0] - snapshot.members[0].at[0],
    members[0].at[1] - snapshot.members[0].at[1],
  ];
  for (let index: Dynamic = 0; index < members.length; index++) {
    let [previousMember, currentMember]: Dynamic = [snapshot.members[index], members[index]];
    if (
      previousMember.id !== currentMember.id ||
      previousMember.at.length !== currentMember.at.length ||
      previousMember.fixed.some(
        (coordinate?: Dynamic, axisIndex?: Dynamic): Dynamic =>
          coordinate !== currentMember.fixed[axisIndex],
      )
    )
      return null;
    for (let coordinateIndex: Dynamic = 0; coordinateIndex < previousMember.at.length; coordinateIndex += 2)
      if (
        Math.abs(currentMember.at[coordinateIndex] - previousMember.at[coordinateIndex] - items) > 0.5 ||
        Math.abs(currentMember.at[coordinateIndex + 1] - previousMember.at[coordinateIndex + 1] - offsetY) > 0.5
      )
        return null;
  }
  return items === 0 && offsetY === 0
    ? snapshot
    : {
        ...snapshot,
        box: {
          ...snapshot.box,
          x: snapshot.box.x + items,
          y: snapshot.box.y + offsetY,
        },
      };
}
function selectionUniformScaleTransform(
  origin?: Dynamic,
  point?: Dynamic,
  scale?: Dynamic,
): Dynamic {
  return {
    from: {
      x: origin.x,
      y: origin.y,
      w: 1,
      h: 1,
    },
    to: {
      x: point.x,
      y: point.y,
      w: scale,
      h: scale,
    },
  };
}
export {
  annotationTransformSnapshot,
  artboardTransformSnapshot,
  clampResizedDimension,
  preserveRoundedTransformValues,
  rotateAnnotationAboutPoint,
  selectionScaleLimits,
  selectionTransformMembers,
  selectionUniformScaleTransform,
  transformAnnotationBounds,
  transformArtboardBounds,
  transformAxisProperties,
  transformHandleHitPadding,
  transformTouchedProperties,
  translatedSelectionTransform,
};
export function installGeometrySelectionTransform(): () => void {
  return () => {
    annotationTransformSnapshot = (annotation?: Dynamic): Dynamic =>
      isShapeAnnotation(annotation)
        ? annotationGeometry(annotation)
        : {
            x: annotation.x,
            y: annotation.y,
            rotate: annotation.rotate ?? 0,
          };
    artboardTransformSnapshot = (board?: Dynamic): Dynamic =>
      board.frameless
        ? {
            x: board.x,
            y: board.y,
          }
        : {
            x: board.x,
            y: board.y,
            w: board.w,
            h: board.h,
          };
    transformAxisProperties = {
      x: ["x", "w", "x2"],
      y: ["y", "h", "y2"],
    };
    transformTouchedProperties = (property?: Dynamic): Dynamic =>
      new Set(
        property === "rotate"
          ? ["x", "y", "x2", "y2", "rotate"]
          : [
              ...(property.x ? transformAxisProperties.x : []),
              ...(property.y ? transformAxisProperties.y : []),
            ],
      );
    clampResizedDimension = (
      minimum?: Dynamic,
      maximum?: Dynamic,
      currentValue?: Dynamic,
      minimumValue?: Dynamic,
    ): Dynamic =>
      Math.min(
        Math.max(minimumValue, maximum),
        Math.max(Math.min(currentValue, maximum), minimum),
      );
    transformHandleHitPadding = 8;
  };
}

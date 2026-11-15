/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { selectionResizeLimits, transformPointBetweenRects, transformRectBetweenRects } from "../editor/geometry/resize";
import { rotatePoint } from "../editor/geometry/rotation";
import { annotationBounds, annotationGeometry, annotationRotation, isShapeAnnotation, normalizeRotationDegrees, PlatformFileContentConstant_16, PlatformFileContentConstant_19, PlatformFileContentConstant_20, PlatformFileContentLimit_6 } from "../platform/file-content";

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
  for (let value2 of Object.keys(values) as Dynamic) {
    let value3: Dynamic = values[value2];
    if (!touched.has(value2) || value3 === undefined) continue;
    let [items, items2]: Dynamic = [Math.round(value3), value[value2]];
    state[value2] =
      items2 !== undefined && Math.round(items2) === items ? items2 : items;
  }
  return state;
}
function transformArtboardBounds(
  artboard?: Dynamic,
  fromRect?: Dynamic,
  toRect?: Dynamic,
  axes?: Dynamic,
): Dynamic {
  let value: Dynamic = (0, transformRectBetweenRects)(
      artboard,
      fromRect,
      toRect,
    ),
    value2: Dynamic = artboard.frameless
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
            PlatformFileContentConstant_16,
            PlatformFileContentLimit_6,
          ),
          h: clampResizedDimension(
            value.h,
            artboard.h,
            PlatformFileContentConstant_16,
            PlatformFileContentLimit_6,
          ),
        };
  return preserveRoundedTransformValues(
    value2,
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
  if (!(0, isShapeAnnotation)(annotation))
    return preserveRoundedTransformValues(
      (0, transformPointBetweenRects)(annotation, fromRect, toRect),
      annotationTransformSnapshot(annotation),
      value,
    );
  let value2: Dynamic = annotation;
  switch (value2.kind) {
    case "line":
    case "arrow": {
      let [items, items2]: Dynamic = [
        (0, transformPointBetweenRects)(value2, fromRect, toRect),
        (0, transformPointBetweenRects)(
          {
            x: value2.x2,
            y: value2.y2,
          },
          fromRect,
          toRect,
        ),
      ];
      return preserveRoundedTransformValues(
        {
          x: items.x,
          y: items.y,
          x2: items2.x,
          y2: items2.y,
        },
        (0, annotationGeometry)(value2),
        value,
      );
    }
    case "image":
    case "rect":
    case "oval":
    case "pen": {
      let value3: Dynamic = (0, transformRectBetweenRects)(
          (0, annotationBounds)(value2),
          fromRect,
          toRect,
        ),
        value4: Dynamic =
          value2.kind === "image"
            ? PlatformFileContentConstant_20
            : PlatformFileContentConstant_19;
      return preserveRoundedTransformValues(
        {
          x: value3.x,
          y: value3.y,
          w: clampResizedDimension(
            value3.w,
            value2.w,
            value4,
            PlatformFileContentLimit_6,
          ),
          h: clampResizedDimension(
            value3.h,
            value2.h,
            value4,
            PlatformFileContentLimit_6,
          ),
        },
        (0, annotationGeometry)(value2),
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
    let [items, items2]: Dynamic = [
      (0, rotatePoint)(annotation, pivot, degrees),
      (0, rotatePoint)(
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
        x2: items2.x,
        y2: items2.y,
      },
      (0, annotationGeometry)(annotation),
      value,
    );
  }
  let state: Dynamic = {
      x: box.x + box.w / 2,
      y: box.y + box.h / 2,
    },
    value2: Dynamic = (0, rotatePoint)(state, pivot, degrees);
  return preserveRoundedTransformValues(
    {
      x: annotation.x + value2.x - state.x,
      y: annotation.y + value2.y - state.y,
      rotate: (0, normalizeRotationDegrees)(
        (0, annotationRotation)(annotation) + degrees,
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
  let callback: Dynamic = (input?: Dynamic): Dynamic => ({
      w: input,
      h: input,
    }),
    { min: value, max: value2 }: Dynamic = (0, selectionResizeLimits)(
      selectionBox,
      [
        ...artboards
          .filter((input?: Dynamic): Dynamic => !input.frameless)
          .map(
            (input?: Dynamic): Dynamic => ({
              w: input.w,
              h: input.h,
              min: callback(PlatformFileContentConstant_16),
              max: callback(PlatformFileContentLimit_6),
            }),
          ),
        ...annotations.flatMap(
          ({ spec: spec, box: box }: Dynamic): Dynamic =>
            (0, isShapeAnnotation)(spec) &&
            spec.kind !== "line" &&
            spec.kind !== "arrow"
              ? [
                  {
                    w: box.w,
                    h: box.h,
                    min: callback(
                      spec.kind === "image"
                        ? PlatformFileContentConstant_20
                        : PlatformFileContentConstant_19,
                    ),
                    max: callback(PlatformFileContentLimit_6),
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
    max: value2,
  };
}
function selectionTransformMembers(
  artboards?: Dynamic,
  annotations?: Dynamic,
): Dynamic {
  return [
    ...artboards.map(
      (input?: Dynamic): Dynamic => ({
        id: "board:" + input.file,
        at: [input.x, input.y],
        fixed: [input.w, input.h],
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
              fixed: (0, isShapeAnnotation)(source)
                ? [
                    (0, annotationBounds)(source).w,
                    (0, annotationBounds)(source).h,
                    (0, annotationRotation)(source),
                  ]
                : [source.w, (0, annotationRotation)(source)],
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
  let [items, items2]: Dynamic = [
    members[0].at[0] - snapshot.members[0].at[0],
    members[0].at[1] - snapshot.members[0].at[1],
  ];
  for (let index: Dynamic = 0; index < members.length; index++) {
    let [items3, items4]: Dynamic = [snapshot.members[index], members[index]];
    if (
      items3.id !== items4.id ||
      items3.at.length !== items4.at.length ||
      items3.fixed.some(
        (input?: Dynamic, options?: Dynamic): Dynamic =>
          input !== items4.fixed[options],
      )
    )
      return null;
    for (let index2: Dynamic = 0; index2 < items3.at.length; index2 += 2)
      if (
        Math.abs(items4.at[index2] - items3.at[index2] - items) > 0.5 ||
        Math.abs(items4.at[index2 + 1] - items3.at[index2 + 1] - items2) > 0.5
      )
        return null;
  }
  return items === 0 && items2 === 0
    ? snapshot
    : {
        ...snapshot,
        box: {
          ...snapshot.box,
          x: snapshot.box.x + items,
          y: snapshot.box.y + items2,
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
    annotationTransformSnapshot = (input?: Dynamic): Dynamic =>
      (0, isShapeAnnotation)(input)
        ? (0, annotationGeometry)(input)
        : {
            x: input.x,
            y: input.y,
            rotate: input.rotate ?? 0,
          };
    artboardTransformSnapshot = (input?: Dynamic): Dynamic =>
      input.frameless
        ? {
            x: input.x,
            y: input.y,
          }
        : {
            x: input.x,
            y: input.y,
            w: input.w,
            h: input.h,
          };
    transformAxisProperties = {
      x: ["x", "w", "x2"],
      y: ["y", "h", "y2"],
    };
    transformTouchedProperties = (input?: Dynamic): Dynamic =>
      new Set(
        input === "rotate"
          ? ["x", "y", "x2", "y2", "rotate"]
          : [
              ...(input.x ? transformAxisProperties.x : []),
              ...(input.y ? transformAxisProperties.y : []),
            ],
      );
    clampResizedDimension = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value?: Dynamic,
    ): Dynamic =>
      Math.min(
        Math.max(value, options),
        Math.max(Math.min(context, options), input),
      );
    transformHandleHitPadding = 8;
  };
}

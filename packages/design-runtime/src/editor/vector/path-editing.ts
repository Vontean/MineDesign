/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var VectorPathEditingConstant: Dynamic;
var TOUCH_HIT_RADIUS_PX: Dynamic;
var VectorPathEditingLimit: Dynamic;
function constrainVectorPointAngle(
  anchorPoint?: Dynamic,
  targetPoint?: Dynamic,
): Dynamic {
  let value: Dynamic = targetPoint.x - anchorPoint.x,
    deltaY: Dynamic = targetPoint.y - anchorPoint.y,
    distance: Dynamic = Math.hypot(value, deltaY);
  if (distance === 0)
    return {
      x: anchorPoint.x,
      y: anchorPoint.y,
    };
  let angleStep: Dynamic = Math.PI / 4,
    snappedAngle: Dynamic = Math.round(Math.atan2(deltaY, value) / angleStep) * angleStep;
  return {
    x: anchorPoint.x + distance * Math.cos(snappedAngle),
    y: anchorPoint.y + distance * Math.sin(snappedAngle),
  };
}
function previousContourAnchor(contour?: Dynamic, anchorIndex?: Dynamic): Dynamic {
  if (anchorIndex > 0) return contour.anchors[anchorIndex - 1];
  if (contour.closed) return contour.anchors[contour.anchors.length - 1];
}
function moveVectorPart(
  vectorPath?: Dynamic,
  selection?: Dynamic,
  position?: Dynamic,
): Dynamic {
  let value: Dynamic = vectorPath.contours[selection.contour];
  if (!value) return vectorPath;
  let anchor: Dynamic = value.anchors[selection.anchor];
  if (!anchor) return vectorPath;
  let anchors: Dynamic = value.anchors.slice(),
    length: Dynamic = anchors.length;
  if (selection.part === "anchor") {
    let deltaX: Dynamic = position.x - anchor.x,
      deltaY: Dynamic = position.y - anchor.y,
      updatedSegment: Dynamic =
        anchor.seg.kind === "quad"
          ? {
              kind: "quad",
              c: {
                x: anchor.seg.c.x + deltaX,
                y: anchor.seg.c.y + deltaY,
              },
            }
          : anchor.seg.kind === "cubic"
            ? {
                kind: "cubic",
                c1: anchor.seg.c1,
                c2: {
                  x: anchor.seg.c2.x + deltaX,
                  y: anchor.seg.c2.y + deltaY,
                },
              }
            : anchor.seg;
    anchors[selection.anchor] = {
      ...anchor,
      x: position.x,
      y: position.y,
      seg: updatedSegment,
    };
    let nextAnchorIndex: Dynamic =
      selection.anchor + 1 < length
        ? selection.anchor + 1
        : value.closed
          ? 0
          : -1;
    if (nextAnchorIndex >= 0) {
      let nextAnchor: Dynamic = anchors[nextAnchorIndex];
      (nextAnchor && nextAnchor.seg.kind === "quad") ||
        (nextAnchor &&
          nextAnchor.seg.kind === "cubic" &&
          (anchors[nextAnchorIndex] = {
            ...nextAnchor,
            seg: {
              kind: "cubic",
              c1: {
                x: nextAnchor.seg.c1.x + deltaX,
                y: nextAnchor.seg.c1.y + deltaY,
              },
              c2: nextAnchor.seg.c2,
            },
          }));
    }
  } else {
    let seg: Dynamic = anchor.seg;
    if (selection.part === "c" && seg.kind === "quad")
      anchors[selection.anchor] = {
        ...anchor,
        seg: {
          kind: "quad",
          c: position,
        },
      };
    else if (selection.part === "c" && seg.kind === "cubic")
      anchors[selection.anchor] = {
        ...anchor,
        seg: {
          kind: "cubic",
          c1: position,
          c2: seg.c2,
        },
      };
    else if (selection.part === "c2" && seg.kind === "cubic")
      anchors[selection.anchor] = {
        ...anchor,
        seg: {
          kind: "cubic",
          c1: seg.c1,
          c2: position,
        },
      };
    else return vectorPath;
  }
  let updatedContours: Dynamic = vectorPath.contours.slice();
  updatedContours[selection.contour] = {
    ...value,
    anchors: anchors,
  };
  let state: Dynamic = {
    contours: updatedContours,
  };
  if (selection.part !== "anchor") state = insertVectorAnchor(state, selection);
  else {
    let contourState: Dynamic = state.contours[selection.contour];
    if (contourState && contourState.anchors.length > 1) {
      let anchorCount: Dynamic = contourState.anchors.length,
        followingAnchorIndex: Dynamic =
          selection.anchor + 1 < anchorCount ? selection.anchor + 1 : 0,
        nextSegmentKind: Dynamic = contourState.anchors[followingAnchorIndex]?.seg.kind;
      state = setVectorTangentKind(
        state,
        selection.contour,
        selection.anchor,
        "arriving",
        nextSegmentKind === "quad"
          ? {
              x: anchor.x,
              y: anchor.y,
            }
          : undefined,
      );
      let previousAnchorIndex: Dynamic =
          selection.anchor > 0
            ? selection.anchor - 1
            : contourState.closed
              ? anchorCount - 1
              : -1,
        nextAnchorIndex: Dynamic =
          selection.anchor + 1 < anchorCount ? selection.anchor + 1 : 0;
      previousAnchorIndex >= 0 &&
        previousAnchorIndex !== nextAnchorIndex &&
        (state = setVectorTangentKind(
          state,
          selection.contour,
          previousAnchorIndex,
          "departing",
        ));
    }
  }
  return state;
}
function insertVectorAnchor(vectorPath?: Dynamic, selection?: Dynamic): Dynamic {
  let value: Dynamic = vectorPath.contours[selection.contour];
  if (!value) return vectorPath;
  let anchor: Dynamic = value.anchors[selection.anchor];
  if (!anchor) return vectorPath;
  let length: Dynamic = value.anchors.length,
    previousAnchorIndex: Dynamic =
      selection.anchor > 0
        ? selection.anchor - 1
        : value.closed
          ? length - 1
          : -1;
  if (length === 1) return vectorPath;
  let state: Dynamic = vectorPath,
    seg: Dynamic = anchor.seg;
  if (selection.part === "c" && seg.kind === "quad") {
    state = setVectorTangentKind(
      state,
      selection.contour,
      selection.anchor,
      "arriving",
    );
    let nextAnchorIndex: Dynamic =
      selection.anchor + 1 < length ? selection.anchor + 1 : 0;
    previousAnchorIndex >= 0 &&
      previousAnchorIndex !== nextAnchorIndex &&
      (state = setVectorTangentKind(
        state,
        selection.contour,
        previousAnchorIndex,
        "departing",
      ));
  } else
    selection.part === "c" && seg.kind === "cubic"
      ? previousAnchorIndex >= 0 &&
        (state = setVectorTangentKind(
          state,
          selection.contour,
          previousAnchorIndex,
          "departing",
        ))
      : selection.part === "c2" &&
        seg.kind === "cubic" &&
        (state = setVectorTangentKind(
          state,
          selection.contour,
          selection.anchor,
          "arriving",
        ));
  return state;
}
function contourTangentDirections(
  contour?: Dynamic,
  anchorIndex?: Dynamic,
): Dynamic {
  let length: Dynamic = contour.anchors.length,
    value: Dynamic =
      anchorIndex + 1 < length ? anchorIndex + 1 : contour.closed ? 0 : -1,
    segment: Dynamic = contour.anchors[anchorIndex]?.seg,
    previousSegment: Dynamic = value >= 0 ? contour.anchors[value]?.seg : undefined,
    arrivingControl: Dynamic =
      (anchorIndex > 0 || contour.closed) && segment && segment.kind !== "line"
        ? segment.kind === "quad"
          ? segment.c
          : segment.c2
        : undefined,
    departingControl: Dynamic =
      previousSegment && previousSegment.kind !== "line"
        ? previousSegment.kind === "quad"
          ? previousSegment.c
          : previousSegment.c1
        : undefined;
  return {
    arriving: arrivingControl,
    departing: departingControl,
    nextI: value,
  };
}
function setVectorTangentKind(
  vectorPath?: Dynamic,
  anchorIndex?: Dynamic,
  contourIndex?: Dynamic,
  tangentSide?: Dynamic,
  fallbackControl?: Dynamic,
): Dynamic {
  let contour: Dynamic = vectorPath.contours[anchorIndex];
  if (!contour) return vectorPath;
  let anchor: Dynamic = contour.anchors[contourIndex];
  if (!anchor) return vectorPath;
  let tangentKind: Dynamic = anchor.tangent ?? "corner";
  if (tangentKind === "corner") return vectorPath;
  let {
    arriving: arrivingControl,
    departing: departingControl,
    nextI: nextAnchorIndex,
  }: Dynamic = contourTangentDirections(contour, contourIndex);
  if (!arrivingControl || !departingControl) return vectorPath;
  let primaryControl: Dynamic = tangentSide === "arriving" ? arrivingControl : departingControl,
    secondaryControl: Dynamic = tangentSide === "arriving" ? departingControl : arrivingControl,
    deltaX: Dynamic = anchor.x - primaryControl.x,
    deltaY: Dynamic = anchor.y - primaryControl.y,
    distance: Dynamic = Math.hypot(deltaX, deltaY);
  if (distance === 0) return vectorPath;
  let referenceControl: Dynamic = fallbackControl ?? anchor,
    controlDistance: Dynamic =
      tangentKind === "symmetric"
        ? distance
        : Math.hypot(secondaryControl.x - referenceControl.x, secondaryControl.y - referenceControl.y),
    unitX: Dynamic = deltaX / distance,
    unitY: Dynamic = deltaY / distance,
    state: Dynamic = {
      x: anchor.x + unitX * controlDistance,
      y: anchor.y + unitY * controlDistance,
    },
    anchors: Dynamic = contour.anchors.slice();
  if (tangentSide === "arriving") {
    let targetAnchor: Dynamic = anchors[nextAnchorIndex];
    if (!targetAnchor) return vectorPath;
    let seg: Dynamic = targetAnchor.seg;
    anchors[nextAnchorIndex] = {
      ...targetAnchor,
      seg:
        seg.kind === "quad"
          ? {
              kind: "quad",
              c: state,
            }
          : seg.kind === "cubic"
            ? {
                kind: "cubic",
                c1: state,
                c2: seg.c2,
              }
            : seg,
    };
  } else {
    let seg: Dynamic = anchor.seg;
    anchors[contourIndex] = {
      ...anchor,
      seg:
        seg.kind === "quad"
          ? {
              kind: "quad",
              c: state,
            }
          : seg.kind === "cubic"
            ? {
                kind: "cubic",
                c1: seg.c1,
                c2: state,
              }
            : seg,
    };
  }
  let updatedContours: Dynamic = vectorPath.contours.slice();
  updatedContours[anchorIndex] = {
    ...contour,
    anchors: anchors,
  };
  return {
    contours: updatedContours,
  };
}
function resetVectorControl(vectorPath?: Dynamic, selection?: Dynamic): Dynamic {
  if (selection.part === "anchor") return vectorPath;
  let value: Dynamic = vectorPath.contours[selection.contour];
  if (!value) return vectorPath;
  let anchor: Dynamic = value.anchors[selection.anchor];
  if (!anchor || anchor.seg.kind === "line") return vectorPath;
  let anchors: Dynamic = value.anchors.slice();
  anchors[selection.anchor] = {
    ...anchor,
    seg: {
      kind: "line",
    },
  };
  let updatedContours: Dynamic = vectorPath.contours.slice();
  updatedContours[selection.contour] = {
    ...value,
    anchors: anchors,
  };
  return {
    contours: updatedContours,
  };
}
function deleteVectorAnchor(vectorPath?: Dynamic, selection?: Dynamic): Dynamic {
  let value: Dynamic = vectorPath.contours[selection.contour];
  if (!value || !value.anchors[selection.anchor]) return vectorPath;
  let minimumAnchors: Dynamic = value.closed ? 3 : 2,
    remainingContours: Dynamic = vectorPath.contours.slice();
  if (value.anchors.length <= minimumAnchors) {
    remainingContours.splice(selection.contour, 1);
    return {
      contours: remainingContours,
    };
  }
  let remainingAnchors: Dynamic = value.anchors.slice();
  remainingAnchors.splice(selection.anchor, 1);
  if (value.closed || selection.anchor < remainingAnchors.length) {
    let replacementIndex: Dynamic = selection.anchor % remainingAnchors.length,
      replacementAnchor: Dynamic = remainingAnchors[replacementIndex];
    replacementAnchor &&
      (remainingAnchors[replacementIndex] = {
        ...replacementAnchor,
        seg: {
          kind: "line",
        },
      });
  }
  remainingContours[selection.contour] = {
    ...value,
    anchors: remainingAnchors,
  };
  return {
    contours: remainingContours,
  };
}
function vectorHitRadius(pointerEvent?: Dynamic): Dynamic {
  return pointerEvent.pointerType === "touch"
    ? TOUCH_HIT_RADIUS_PX
    : VectorPathEditingConstant;
}
function captureVectorPointer(element?: Dynamic, pointerId?: Dynamic): Dynamic {
  try {
    element.setPointerCapture(pointerId);
  } catch {}
}
function blurVectorInput(): Dynamic {
  let activeElement: Dynamic = (document as Dynamic).activeElement;
  activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA") &&
    activeElement.blur?.();
}
function vectorUsesCoarsePointer(): Dynamic {
  return (
    typeof matchMedia !== "undefined" &&
    matchMedia("(pointer: coarse)").matches
  );
}
function showVectorControls(
  selectionPart?: Dynamic,
  contour?: Dynamic,
  contourIndex?: Dynamic,
  requestedPart?: Dynamic,
  extraPart?: Dynamic,
  selection?: Dynamic,
): Dynamic {
  if (selectionPart !== "selected") return true;
  if (!selection || selection.contour !== contourIndex) return false;
  let length: Dynamic = contour.anchors.length,
    callback: Dynamic = (anchorIndex?: Dynamic): Dynamic =>
      anchorIndex > 0 ? anchorIndex - 1 : contour.closed ? length - 1 : -1,
    getControlIndices: Dynamic = (anchorIndex?: Dynamic, part?: Dynamic): Dynamic => {
      let segment: Dynamic = contour.anchors[anchorIndex]?.seg;
      return part === "anchor" || part === "c2"
        ? [anchorIndex]
        : segment?.kind === "quad"
          ? [anchorIndex, callback(anchorIndex)]
          : [callback(anchorIndex)];
    },
    controlIndex: Dynamic = getControlIndices(selection.anchor, selection.part)[0];
  return (
    controlIndex !== undefined &&
    controlIndex >= 0 &&
    getControlIndices(requestedPart, extraPart).includes(controlIndex)
  );
}
function sameVectorPath(leftPath?: Dynamic, rightPath?: Dynamic): Dynamic {
  if (leftPath.contours.length !== rightPath.contours.length) return false;
  for (let index: Dynamic = 0; index < leftPath.contours.length; index += 1) {
    let value: Dynamic = leftPath.contours[index],
      rightContour: Dynamic = rightPath.contours[index];
    if (
      !value ||
      !rightContour ||
      value.closed !== rightContour.closed ||
      value.anchors.length !== rightContour.anchors.length
    )
      return false;
    for (
      let anchorIndex: Dynamic = 0;
      anchorIndex < value.anchors.length;
      anchorIndex += 1
    ) {
      let leftAnchor: Dynamic = value.anchors[anchorIndex],
        rightAnchor: Dynamic = rightContour.anchors[anchorIndex];
      if (
        !leftAnchor ||
        !rightAnchor ||
        leftAnchor.x !== rightAnchor.x ||
        leftAnchor.y !== rightAnchor.y ||
        (leftAnchor.tangent ?? "corner") !== (rightAnchor.tangent ?? "corner")
      )
        return false;
      let seg: Dynamic = leftAnchor.seg,
        rightSegment: Dynamic = rightAnchor.seg;
      if (seg.kind !== rightSegment.kind) return false;
      if (seg.kind === "quad" && rightSegment.kind === "quad") {
        if (seg.c.x !== rightSegment.c.x || seg.c.y !== rightSegment.c.y) return false;
      } else if (
        seg.kind === "cubic" &&
        rightSegment.kind === "cubic" &&
        (seg.c1.x !== rightSegment.c1.x ||
          seg.c1.y !== rightSegment.c1.y ||
          seg.c2.x !== rightSegment.c2.x ||
          seg.c2.y !== rightSegment.c2.y)
      )
        return false;
    }
  }
  return true;
}
function vectorPartPoint(vectorPath?: Dynamic, selection?: Dynamic): Dynamic {
  let value: Dynamic =
    vectorPath.contours[selection.contour]?.anchors[selection.anchor];
  if (!value) return;
  if (selection.part === "anchor")
    return {
      x: value.x,
      y: value.y,
    };
  let seg: Dynamic = value.seg;
  if (seg.kind === "quad" && selection.part === "c") return seg.c;
  if (seg.kind === "cubic" && selection.part === "c") return seg.c1;
  if (seg.kind === "cubic" && selection.part === "c2") return seg.c2;
}
export {
  blurVectorInput,
  captureVectorPointer,
  constrainVectorPointAngle,
  contourTangentDirections,
  deleteVectorAnchor,
  insertVectorAnchor,
  moveVectorPart,
  previousContourAnchor,
  resetVectorControl,
  sameVectorPath,
  setVectorTangentKind,
  showVectorControls,
  vectorHitRadius,
  vectorPartPoint,
  VectorPathEditingConstant,
  TOUCH_HIT_RADIUS_PX,
  VectorPathEditingLimit,
  vectorUsesCoarsePointer,
};
export function installEditorVectorPathEditing(): () => void {
  return () => {
    VectorPathEditingConstant = 10;
    TOUCH_HIT_RADIUS_PX = 20;
    VectorPathEditingLimit = 4;
  };
}

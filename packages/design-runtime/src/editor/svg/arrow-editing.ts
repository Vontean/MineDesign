/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { HooksAlternateCursorHandler, HooksAlternateCursorSubscribers, HooksAlternateCursorTest } from "../hooks/alternate-cursor";
import { arrowHeadFillAttribute, arrowHeadFillStyle, arrowHeadKindFromId, arrowHeadMarkerHtml, arrowMarkerLength, createArrowHeadId, inspectSvgArrow, inspectSvgArrowHeads, normalizeSvgPaint, OpenValue, recognizeArrowHeadPath, regenerateArrowHeadIds, shortenLineEnds, SvgArrowsExec, SvgArrowsRefX } from "./arrows";
import { resizeSvgArrow, setSvgLineEndpoints } from "./layout";

var SvgArrowEditingElement: Dynamic;
function getModelSvgArrow(model?: Dynamic, elementId?: Dynamic): Dynamic {
  let value: Dynamic = model.element(elementId),
    shaftElement: Dynamic =
      value?.tagName.toLowerCase() === "svg"
        ? value
        : value?.parentElement?.tagName.toLowerCase() === "svg"
          ? value.parentElement
          : null,
    arrowParts: Dynamic = shaftElement
      ? inspectSvgArrowHeads(shaftElement)
      : null;
  if (!shaftElement || !arrowParts || (value !== shaftElement && value !== arrowParts.shaft))
    return null;
  let svgTid: Dynamic = HooksAlternateCursorHandler(shaftElement),
    shaftTid: Dynamic = HooksAlternateCursorHandler(arrowParts.shaft);
  return svgTid >= 0 && shaftTid >= 0
    ? {
        svgTid: svgTid,
        svg: shaftElement,
        shaft: arrowParts.shaft,
        shaftTid: shaftTid,
        ends: arrowParts,
      }
    : null;
}
function getModelArrowShaft(model?: Dynamic, elementId?: Dynamic): Dynamic {
  let value: Dynamic = getModelSvgArrow(model, elementId);
  if (!value) return null;
  let callback: Dynamic = (attributeName?: Dynamic): Dynamic =>
      model.inlineStyleValue(value.shaftTid, attributeName) ||
      model.attribute(value.shaftTid, attributeName) ||
      model.inlineStyleValue(value.svgTid, attributeName) ||
      model.attribute(value.svgTid, attributeName) ||
      "",
    strokeWidth: Dynamic = callback("stroke-width").trim(),
    hasClassMarker: Dynamic = [value.shaftTid, value.svgTid].some(
      (child?: Dynamic): Dynamic =>
        model.attribute(child, "class") != null ||
        model.attribute(child, "id") != null,
    );
  return {
    svgTid: value.svgTid,
    width:
      strokeWidth === ""
        ? hasClassMarker
          ? null
          : 1
        : HooksAlternateCursorTest(strokeWidth),
    stroke: callback("stroke").trim(),
    ruled: hasClassMarker,
  };
}
function extendedArrowEndpoints(
  element?: Dynamic,
  startPoint?: Dynamic,
  startExtension?: Dynamic,
  endExtension?: Dynamic,
): Dynamic {
  let length: Dynamic = Math.hypot(
    startPoint.ex - startPoint.sx,
    startPoint.ey - startPoint.sy,
  );
  if (!(length > 0))
    return {
      p: {
        x: startPoint.sx,
        y: startPoint.sy,
      },
      q: {
        x: startPoint.ex,
        y: startPoint.ey,
      },
    };
  let directionX: Dynamic = (startPoint.ex - startPoint.sx) / length,
    directionY: Dynamic = (startPoint.ey - startPoint.sy) / length,
    state: Dynamic = {
      p: {
        x: startPoint.sx - directionX * startExtension,
        y: startPoint.sy - directionY * startExtension,
      },
      q: {
        x: startPoint.ex + directionX * endExtension,
        y: startPoint.ey + directionY * endExtension,
      },
    },
    center: Dynamic = (
      element.getAttribute("viewBox") ??
      element.getAttribute("sc-camel-view-box") ??
      ""
    )
      .trim()
      .split(/[\s,]+/)
      .map(Number);
  if (
    !(
      center.length === 4 &&
      center[0] === 0 &&
      center[1] === 0 &&
      center[2] > 0 &&
      center[3] > 0 &&
      parseFloat(element.getAttribute("width") ?? "") === center[2] &&
      parseFloat(element.getAttribute("height") ?? "") === center[3] &&
      (element.getAttribute("preserveAspectRatio") ??
        element.getAttribute("sc-camel-preserve-aspect-ratio")) === "none"
    ) ||
    startExtension + endExtension === 0
  )
    return state;
  let centerX: Dynamic = center[2],
    centerY: Dynamic = center[3],
    isDegenerate: Dynamic = length <= 0.5 + 4 * 0.005,
    callback: Dynamic = (x?: Dynamic, y?: Dynamic): Dynamic =>
      (x - startPoint.sx) * directionX + (y - startPoint.sy) * directionY;
  if (
    ((x?: Dynamic, y?: Dynamic): Dynamic =>
      Math.abs(
        (x - startPoint.sx) * directionY - (y - startPoint.sy) * directionX,
      ))(centerX / 2, centerY / 2) >= 0.75
  )
    return state;
  if (startExtension === 0 || endExtension === 0) {
    let [endpointX, endpointY]: Dynamic =
        startExtension === 0
          ? [centerX - startPoint.sx, centerY - startPoint.sy]
          : [centerX - startPoint.ex, centerY - startPoint.ey],
      projection: Dynamic =
        startExtension === 0
          ? callback(endpointX, endpointY) - length
          : -callback(endpointX, endpointY);
    return projection < 0 ||
      !(isDegenerate || Math.abs(projection - startExtension - endExtension) < 0.75)
      ? state
      : startExtension === 0
        ? {
            p: state.p,
            q: {
              x: endpointX,
              y: endpointY,
            },
          }
        : {
            p: {
              x: endpointX,
              y: endpointY,
            },
            q: state.q,
          };
  }
  if (!isDegenerate) return state;
  let extension: Dynamic =
    Math.abs(directionX) >= Math.abs(directionY)
      ? centerX / Math.abs(directionX)
      : centerY / Math.abs(directionY);
  return extension >= length
    ? {
        p: {
          x: centerX / 2 - (directionX * extension) / 2,
          y: centerY / 2 - (directionY * extension) / 2,
        },
        q: {
          x: centerX / 2 + (directionX * extension) / 2,
          y: centerY / 2 + (directionY * extension) / 2,
        },
      }
    : state;
}
function updateArrowShaftMarkers(
  model?: Dynamic,
  arrowOptions?: Dynamic,
): Dynamic {
  let value: Dynamic = getModelSvgArrow(model, arrowOptions.svgTid),
    arrowModel: Dynamic = value
      ? getModelArrowShaft(model, arrowOptions.svgTid)
      : null;
  if (!value || !arrowModel) return false;
  let flag: Dynamic = false,
    geometry: Dynamic = inspectSvgArrow(value.svg),
    state: Dynamic = {
      start: arrowMarkerLength(value.svg, value.shaft, "start"),
      end: arrowMarkerLength(value.svg, value.shaft, "end"),
    };
  if (
    state.start + state.end > 0 &&
    arrowOptions.width != null &&
    arrowModel.width != null &&
    arrowOptions.width !== arrowModel.width &&
    Math.hypot(geometry.ex - geometry.sx, geometry.ey - geometry.sy) > 0
  ) {
    let { p: startPoint, q: endPoint }: Dynamic = extendedArrowEndpoints(
        value.svg,
        geometry,
        state.start * arrowOptions.width,
        state.end * arrowOptions.width,
      ),
      shortenedLine: Dynamic = shortenLineEnds(
        startPoint.x,
        startPoint.y,
        endPoint.x,
        endPoint.y,
        state.start * arrowModel.width,
        state.end * arrowModel.width,
      );
    setSvgLineEndpoints(
      model,
      value.shaftTid,
      shortenedLine.sx,
      shortenedLine.sy,
      shortenedLine.ex,
      shortenedLine.ey,
    );
    flag = true;
  }
  let fillColor: Dynamic =
      arrowModel.stroke === "" && arrowModel.ruled
        ? null
        : normalizeSvgPaint(
            arrowModel.stroke === "" ? "none" : arrowModel.stroke,
          ),
    values: Dynamic = new Set(
      ["start", "end"].map(
        (markerSide?: Dynamic): Dynamic =>
          SvgArrowsExec(
            value.shaft.getAttribute("marker-" + markerSide),
          ),
      ),
    );
  for (let markerElement of value.svg.getElementsByTagName("marker") as Dynamic) {
    let markerId: Dynamic = markerElement.getAttribute("id") ?? "",
      markerPath: Dynamic = markerElement.getElementsByTagName("path")[0];
    if (
      !(
        !(
          values.has(markerId) &&
          arrowHeadKindFromId(markerId) != null &&
          markerPath &&
          recognizeArrowHeadPath(
            markerPath.getAttribute("d") ?? "",
          ) != null &&
          (/(^|;)\s*fill\s*:\s*context-stroke/.test(
            markerPath.getAttribute("style") ?? "",
          ) ||
            markerPath.hasAttribute("fill"))
        ) || !markerPath
      )
    ) {
      if (arrowModel.stroke !== arrowOptions.stroke && fillColor != null) {
        let markerTid: Dynamic = HooksAlternateCursorHandler(
          markerPath,
        );
        flag =
          model.setInlineStyleAttr(
            markerTid,
            arrowHeadFillStyle(
              fillColor,
              markerPath.getAttribute("style") ?? "",
            ),
          ) || flag;
        flag =
          model.setAttribute(
            markerTid,
            "fill",
            / fill="([^"]*)"/.exec(
              arrowHeadFillAttribute(fillColor),
            )?.[1] ?? null,
          ) || flag;
      }
      flag =
        regenerateArrowHeadIds(value.svg.getRootNode(), [
          markerElement,
        ]) || flag;
    }
  }
  return flag;
}
function arrowSnapshotsForPropertyChange(
  model?: Dynamic,
  elementIds?: Dynamic,
  snapshots?: Dynamic,
): Dynamic {
  if (
    ![...snapshots].some(
      (elementId?: Dynamic): Dynamic =>
        HooksAlternateCursorSubscribers.has(elementId),
    )
  )
    return [];
  let entries: Dynamic = new Map();
  for (let value of elementIds as Dynamic) {
    let arrowEnds: Dynamic = getModelSvgArrow(model, value)?.ends,
      arrowModel: Dynamic =
        arrowEnds &&
        !arrowEnds.legacy &&
        (arrowEnds.start !== "none" || arrowEnds.end !== "none")
          ? getModelArrowShaft(model, value)
          : null;
    arrowModel &&
      !entries.has(arrowModel.svgTid) &&
      entries.set(arrowModel.svgTid, arrowModel);
  }
  return [...entries.values()];
}
function restoreArrowSnapshots(model?: Dynamic, snapshots?: Dynamic): Dynamic {
  let flag: Dynamic = false;
  for (let value of snapshots as Dynamic)
    flag = updateArrowShaftMarkers(model, value) || flag;
  return flag;
}
function getArrowHeadState(
  model?: Dynamic,
  elementId?: Dynamic,
  details: Dynamic = {},
): Dynamic {
  let value: Dynamic = getModelSvgArrow(model, elementId);
  if (!value) return null;
  let strokeWidth: Dynamic =
    getModelArrowShaft(model, elementId)?.width ??
    HooksAlternateCursorTest(
      SvgArrowEditingElement(model, value, elementId, details).strokeWidth,
    );
  return {
    start: value.ends.start,
    end: value.ends.end,
    width: strokeWidth,
  };
}
function removeUnusedSvgMarker(
  model?: Dynamic,
  svgRoot?: Dynamic,
  markerId?: Dynamic,
): Dynamic {
  let value: Dynamic = [...svgRoot.getElementsByTagName("marker")].find(
      (element?: Dynamic): Dynamic => element.getAttribute("id") === markerId,
    ),
    rootNode: Dynamic = svgRoot.getRootNode(),
    markerPattern: Dynamic = new RegExp(
      "#" + markerId.replace(/[^\w-]/g, "\\$&") + "(?![\\w-])",
    ),
    markerAttributes: Dynamic = [
      ...rootNode.querySelectorAll(
        '[marker-start], [marker-mid], [marker-end], [style*="marker"], style',
      ),
    ].some(
      (element?: Dynamic): Dynamic =>
        element.tagName.toLowerCase() === "style"
          ? markerPattern.test(element.textContent ?? "")
          : ["marker-start", "marker-mid", "marker-end", "style"].some(
              (attributeName?: Dynamic): Dynamic =>
                markerPattern.test(element.getAttribute(attributeName) ?? ""),
            ),
    );
  if (!value || markerAttributes) return;
  let parentElement: Dynamic = value.parentElement;
  model.removeElement(HooksAlternateCursorHandler(value));
  parentElement &&
    parentElement !== svgRoot &&
    parentElement.tagName.toLowerCase() === "defs" &&
    parentElement.children.length === 0 &&
    model.removeElement(
      HooksAlternateCursorHandler(parentElement),
    );
}
function setArrowHead(
  model?: Dynamic,
  arrowOptions?: Dynamic,
  head?: Dynamic,
  headKind?: Dynamic,
  details?: Dynamic,
): Dynamic {
  let shaft: Dynamic = getModelArrowShaft(model, arrowOptions.svgTid),
    geometry: Dynamic = inspectSvgArrow(arrowOptions.svg),
    strokeWidth: Dynamic =
      shaft?.width ??
      HooksAlternateCursorTest(details.strokeWidth);
  if (arrowOptions.ends[head] === headKind || !shaft || strokeWidth == null || !geometry)
    return null;
  if (arrowOptions.ends.legacy) {
    let headState: Dynamic = {
        start: "none",
        end: OpenValue,
        [head]: headKind,
      },
      lineGeometry: Dynamic = shortenLineEnds(
        geometry.sx,
        geometry.sy,
        geometry.ex,
        geometry.ey,
        SvgArrowsRefX(headState.start) * strokeWidth,
        SvgArrowsRefX(headState.end) * strokeWidth,
      ),
      stroke: Dynamic = details.stroke
        ? {
            stroke: details.stroke,
          }
        : {};
    resizeSvgArrow(
      model,
      arrowOptions.svgTid,
      `M ${lineGeometry.sx} ${lineGeometry.sy} L ${lineGeometry.ex} ${lineGeometry.ey}`,
      1,
      stroke,
      stroke,
      {
        heads: headState,
        restamp: false,
      },
    );
    return (
      [...arrowOptions.svg.children]
        .filter(
          (child?: Dynamic): Dynamic =>
            child.tagName.toLowerCase() === "path",
        )
        .pop() ?? null
    );
  }
  let state: Dynamic = {
      start:
        arrowMarkerLength(arrowOptions.svg, arrowOptions.shaft, "start") *
        strokeWidth,
      end:
        arrowMarkerLength(arrowOptions.svg, arrowOptions.shaft, "end") *
        strokeWidth,
    },
    { p: startPoint, q: endPoint }: Dynamic = extendedArrowEndpoints(
      arrowOptions.svg,
      geometry,
      state.start,
      state.end,
    ),
    markerMarkup: Dynamic = SvgArrowsExec(
      arrowOptions.shaft.getAttribute("marker-" + head),
    );
  for (let elementId of [arrowOptions.shaftTid, arrowOptions.svgTid] as Dynamic) {
    let markerValue: Dynamic = model.inlineStyleValue(elementId, "marker"),
      oppositeMarkerProperty: Dynamic = head === "start" ? "marker-end" : "marker-start";
    markerValue &&
      !model.inlineStyleValue(arrowOptions.shaftTid, oppositeMarkerProperty) &&
      !model.inlineStyleValue(arrowOptions.svgTid, oppositeMarkerProperty) &&
      model.setStyleProperty(arrowOptions.shaftTid, oppositeMarkerProperty, markerValue);
    for (let markerProperty of ["marker", "marker-" + head] as Dynamic)
      model.inlineStyleValue(elementId, markerProperty) &&
        model.setStyleProperty(elementId, markerProperty, null);
  }
  model.setAttribute(arrowOptions.shaftTid, "marker-" + head, null);
  markerMarkup != null && removeUnusedSvgMarker(model, arrowOptions.svg, markerMarkup);
  if (headKind !== "none") {
    let markerId: Dynamic = createArrowHeadId(headKind),
      markerPath: Dynamic =
        [shaft.stroke, details.stroke].find(
          (paint?: Dynamic): Dynamic =>
            normalizeSvgPaint(paint) != null,
        ) ?? "",
      defsElement: Dynamic = [...arrowOptions.svg.children].find(
        (child?: Dynamic): Dynamic =>
          child.tagName.toLowerCase() === "defs",
      );
    defsElement
      ? model.insertHtml(
          arrowHeadMarkerHtml(markerId, headKind, head, markerPath),
          HooksAlternateCursorHandler(defsElement),
          "into",
        )
      : model.insertHtml(
          `<defs>${arrowHeadMarkerHtml(markerId, headKind, head, markerPath)}</defs>`,
          arrowOptions.shaftTid,
          "before",
        );
    model.setAttribute(
      arrowOptions.shaftTid,
      "marker-" + head,
      `url(#${markerId})`,
    );
  }
  let updatedEnds: Dynamic = {
      ...state,
      [head]: SvgArrowsRefX(headKind) * strokeWidth,
    },
    shortenedLine: Dynamic = shortenLineEnds(
      startPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y,
      updatedEnds.start,
      updatedEnds.end,
    );
  setSvgLineEndpoints(
    model,
    arrowOptions.shaftTid,
    shortenedLine.sx,
    shortenedLine.sy,
    shortenedLine.ex,
    shortenedLine.ey,
  );
  return arrowOptions.shaft;
}
function changeSelectedArrowHeads(
  model?: Dynamic,
  elementIds?: Dynamic,
  head?: Dynamic,
  newKind?: Dynamic,
  details: Dynamic = {},
): Dynamic {
  let entries: Dynamic = new Map();
  for (let elementId of elementIds as Dynamic) {
    let arrow: Dynamic = getModelSvgArrow(model, elementId);
    arrow &&
      !entries.has(arrow.svg) &&
      entries.set(arrow.svg, {
        a: arrow,
        tid: elementId,
      });
  }
  let replacementMap: Dynamic = new Map(),
    index: Dynamic = 0;
  for (let { a: shaft, tid: shaftId } of entries.values() as Dynamic) {
    let replacement: Dynamic = setArrowHead(
      model,
      shaft,
      head,
      newKind,
      SvgArrowEditingElement(model, shaft, shaftId, details),
    );
    replacement && replacement !== shaft.shaft && replacementMap.set(shaft.shaft, replacement);
    replacement && index++;
  }
  index > 0 && model.restamp();
  return index > 0
    ? {
        replaced: replacementMap,
        changed: index,
      }
    : null;
}
export {
  arrowSnapshotsForPropertyChange,
  changeSelectedArrowHeads,
  extendedArrowEndpoints,
  getArrowHeadState,
  getModelArrowShaft,
  getModelSvgArrow,
  removeUnusedSvgMarker,
  restoreArrowSnapshots,
  setArrowHead,
  SvgArrowEditingElement,
  updateArrowShaftMarkers,
};
export function installEditorSvgArrowEditing(): () => void {
  return () => {
    SvgArrowEditingElement = (
      model?: Dynamic,
      arrow?: Dynamic,
      elementId?: Dynamic,
      head?: Dynamic,
    ): Dynamic =>
      model.element(elementId) === arrow.shaft
        ? head
        : {
            stroke: head.stroke,
          };
  };
}

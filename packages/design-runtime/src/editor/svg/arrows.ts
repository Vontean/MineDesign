/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var SvgArrowsConstant: Dynamic;
var arrowHeadCenterY: Dynamic;
var arrowHeadTipInset: Dynamic;
var SvgArrowsCss: Dynamic;
var openArrowHeadHalfHeight: Dynamic;
var openArrowHeadPath: Dynamic;
var SvgArrowsFilledOpenConfig: Dynamic;
var SvgArrowsRefX: Dynamic;
var OpenValue: Dynamic;
var SvgArrowsHandler: Dynamic;
var SvgArrowsDcArrowHeadFilledPattern: Dynamic;
var SvgArrowsExec: Dynamic;
function inspectSvgArrow(element?: Dynamic): Dynamic {
  let state: Dynamic = {
      defs: 1,
      title: 1,
      desc: 1,
      metadata: 1,
      style: 1,
      script: 1,
    },
    value: Dynamic = null;
  for (let index: Dynamic = 0; index < element.children.length; index++) {
    let child: Dynamic = element.children[index];
    if (state[(child.tagName || "").toLowerCase()] !== 1) {
      if (value) return null;
      value = child;
    }
  }
  if (
    !value ||
    value.hasAttribute("transform") ||
    /transform\s*:/.test(value.getAttribute("style") || "")
  )
    return null;
  let tagName: Dynamic = (value.tagName || "").toLowerCase(),
    callback: Dynamic = (attribute?: Dynamic): Dynamic => {
      if (attribute == null) return 0;
      let attributeValue: Dynamic = attribute.trim();
      return /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?(?:px)?$/.test(
        attributeValue,
      )
        ? parseFloat(attributeValue)
        : null;
    },
    setGeometry: Dynamic = (
      startX?: Dynamic,
      startY?: Dynamic,
      endX?: Dynamic,
      endY?: Dynamic,
      isLegacy?: Dynamic,
    ): Dynamic => ({
      shaft: value,
      tag: tagName,
      sx: startX,
      sy: startY,
      ex: endX,
      ey: endY,
      legacy: isLegacy,
    });
  if (tagName === "line") {
    let startX: Dynamic = callback(value.getAttribute("x1")),
      startY: Dynamic = callback(value.getAttribute("y1")),
      endX: Dynamic = callback(value.getAttribute("x2")),
      endY: Dynamic = callback(value.getAttribute("y2"));
    return startX == null ||
      startY == null ||
      endX == null ||
      endY == null
      ? null
      : setGeometry(startX, startY, endX, endY, false);
  }
  if (tagName === "polyline") {
    let points: Dynamic = (value.getAttribute("points") || "")
      .trim()
      .split(/[\s,]+/)
      .filter((point?: Dynamic): Dynamic => point !== "")
      .map(callback);
    return points.length !== 4 ||
      points.some((point?: Dynamic): Dynamic => point == null)
      ? null
      : setGeometry(points[0], points[1], points[2], points[3], false);
  }
  if (tagName !== "path") return null;
  let pathData: Dynamic = value.getAttribute("d") || "",
    commands: Dynamic =
      pathData.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ||
      [];
  if (commands.join("").length !== pathData.replace(/[\s,]/g, "").length)
    return null;
  let isNumeric: Dynamic = (token?: Dynamic): Dynamic =>
    token != null && /^[-+.\d]/.test(token);
  if (
    commands.length === 15 &&
    commands[0] === "M" &&
    commands[3] === "L" &&
    commands[6] === "M" &&
    commands[9] === "L" &&
    commands[12] === "L" &&
    [1, 2, 4, 5, 7, 8, 10, 11, 13, 14].every(
      (index?: Dynamic): Dynamic => isNumeric(commands[index]),
    )
  )
    return (element.getAttribute("preserveAspectRatio") ||
      element.getAttribute("sc-camel-preserve-aspect-ratio")) === "none" &&
      /(^|;)\s*fill:\s*none/.test(element.getAttribute("style") || "")
      ? setGeometry(+commands[1], +commands[2], +commands[4], +commands[5], true)
      : null;
  if (
    commands.length < 5 ||
    (commands[0] !== "M" && commands[0] !== "m") ||
    !isNumeric(commands[1]) ||
    !isNumeric(commands[2])
  )
    return null;
  let deltaX: Dynamic = +commands[1],
    deltaY: Dynamic = +commands[2],
    command: Dynamic = commands[3],
    isRelative: Dynamic = command === command.toLowerCase(),
    currentX: Dynamic,
    currentY: Dynamic,
    expectedLength: Dynamic;
  if (isNumeric(command)) {
    if (!isNumeric(commands[4])) return null;
    currentX = +command;
    currentY = +commands[4];
    expectedLength = 5;
    commands[0] === "m" && ((currentX += deltaX), (currentY += deltaY));
  } else if (command === "L" || command === "l") {
    if (!isNumeric(commands[4]) || !isNumeric(commands[5])) return null;
    currentX = +commands[4];
    currentY = +commands[5];
    expectedLength = 6;
    isRelative && ((currentX += deltaX), (currentY += deltaY));
  } else if (command === "H" || command === "h") {
    if (!isNumeric(commands[4])) return null;
    currentX = +commands[4] + (isRelative ? deltaX : 0);
    currentY = deltaY;
    expectedLength = 5;
  } else if (command === "V" || command === "v") {
    if (!isNumeric(commands[4])) return null;
    currentX = deltaX;
    currentY = +commands[4] + (isRelative ? deltaY : 0);
    expectedLength = 5;
  } else return null;
  return commands.length === expectedLength
    ? setGeometry(deltaX, deltaY, currentX, currentY, false)
    : null;
}
function recognizeArrowHeadPath(pathData?: Dynamic): Dynamic {
  let callback: Dynamic = (tokens?: Dynamic): Dynamic =>
      tokens.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)/g) ?? [],
    value: Dynamic = callback(pathData),
    matchesPath: Dynamic = (items?: Dynamic): Dynamic =>
      items.length === value.length &&
      items.every(
        (actual?: Dynamic, expected?: Dynamic): Dynamic =>
          /[A-Za-z]/.test(actual)
            ? actual === value[expected]
            : Math.abs(parseFloat(actual) - parseFloat(value[expected])) <=
              0.001,
      );
  return matchesPath(callback(SvgArrowsCss))
    ? "filled"
    : matchesPath(callback(openArrowHeadPath))
      ? "open"
      : null;
}
function arrowHeadKindFromId(markerId?: Dynamic): Dynamic {
  return /^dc-arrow-head-(filled|open)(?:-|$)/.exec(markerId)?.[1] ?? null;
}
function createArrowHeadId(
  headKind: Dynamic = "filled",
  random: Dynamic = Math.random,
): Dynamic {
  return (
    SvgArrowsHandler(headKind) +
    "-" +
    Math.floor(random() * 36 ** 6)
      .toString(36)
      .padStart(6, "0")
  );
}
function normalizeSvgPaint(paint?: Dynamic): Dynamic {
  let value: Dynamic = (paint ?? "").trim();
  if (/^(none|transparent)$/i.test(value)) return "none";
  if (
    value === "" ||
    value.length > 64 ||
    !/^[#\w(),.%\s/-]+$/.test(value) ||
    /url\(/i.test(value) ||
    /^(inherit|initial|unset|context-(stroke|fill))$/i.test(value)
  )
    return null;
  let index: Dynamic = 0;
  for (let character of value as Dynamic)
    if (character === "(") index++;
    else if (character === ")" && --index < 0) return null;
  return index === 0 ? value : null;
}
function arrowHeadFillStyle(paint?: Dynamic, style: Dynamic = ""): Dynamic {
  return [
    ...style
      .split(";")
      .map((declaration?: Dynamic): Dynamic => declaration.trim())
      .filter(
        (declaration?: Dynamic): Dynamic =>
          declaration !== "" && !/^(fill|stroke)\s*:/i.test(declaration),
      ),
    "stroke: none",
    `fill: ${normalizeSvgPaint(paint) ?? "none"}`,
    "fill: context-stroke",
  ].join("; ");
}
function arrowHeadFillAttribute(paint?: Dynamic): Dynamic {
  let value: Dynamic = normalizeSvgPaint(paint);
  return value != null &&
    /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|hsl)a?\([^()]*\)|var\(--[\w-]+\))$/i.test(
      value,
    )
    ? ` fill="${value}"`
    : "";
}
function arrowHeadMarkerHtml(
  markerId?: Dynamic,
  headKind?: Dynamic,
  end?: Dynamic,
  paintStyle?: Dynamic,
): Dynamic {
  return `<marker id="${markerId}" orient="${end === "start" ? "auto-start-reverse" : "auto"}" markerWidth="5" markerHeight="5" refX="${SvgArrowsFilledOpenConfig[headKind].refX}" refY="${arrowHeadCenterY}" overflow="visible"><path d="${SvgArrowsFilledOpenConfig[headKind].d}"${arrowHeadFillAttribute(paintStyle)} stroke="none" style="${arrowHeadFillStyle(paintStyle)}"/></marker>`;
}
function defaultArrowHeadDefs(markerId?: Dynamic, paintStyle?: Dynamic): Dynamic {
  return `<defs>${arrowHeadMarkerHtml(markerId, "filled", "end", paintStyle)}</defs>`;
}
function shortenLineEnd(
  startX?: Dynamic,
  startY?: Dynamic,
  endX?: Dynamic,
  endY?: Dynamic,
  shortenBy?: Dynamic,
): Dynamic {
  let length: Dynamic = Math.hypot(endX - startX, endY - startY);
  if (!(length > 0) || !(shortenBy > 0))
    return {
      x: endX,
      y: endY,
    };
  let ratio: Dynamic =
      Math.max(length - shortenBy, Math.min(length, 0.5)) / length,
    callback: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.round(coordinate * 100) / 100;
  return {
    x: callback(startX + (endX - startX) * ratio),
    y: callback(startY + (endY - startY) * ratio),
  };
}
function shortenLineEnds(
  lineStartX?: Dynamic,
  lineStartY?: Dynamic,
  lineEndX?: Dynamic,
  lineEndY?: Dynamic,
  lineStartInset?: Dynamic,
  lineEndInset?: Dynamic,
): Dynamic {
  let length: Dynamic = Math.hypot(lineEndX - lineStartX, lineEndY - lineStartY),
    startInset: Dynamic = Math.max(lineStartInset, 0),
    endInset: Dynamic = Math.max(lineEndInset, 0),
    callback: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.round(coordinate * 100) / 100;
  if (!(length > 0) || startInset + endInset === 0)
    return {
      sx: callback(lineStartX),
      sy: callback(lineStartY),
      ex: callback(lineEndX),
      ey: callback(lineEndY),
    };
  let maxInset: Dynamic = Math.min(length, 0.5),
    fits: Dynamic = length - startInset - endInset >= maxInset,
    precision: Dynamic = startInset > 0 && endInset > 0 ? 1e4 : 100,
    roundCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.round(coordinate * precision) / precision,
    startOffset: Dynamic = fits
      ? startInset
      : ((length - maxInset) * startInset) / (startInset + endInset),
    endOffset: Dynamic = fits ? length - endInset : startOffset + maxInset,
    pointAtOffset: Dynamic = (offset?: Dynamic): Dynamic => [
      roundCoordinate(lineStartX + ((lineEndX - lineStartX) * offset) / length),
      roundCoordinate(lineStartY + ((lineEndY - lineStartY) * offset) / length),
    ],
    [startX, startY]: Dynamic =
      startInset > 0 ? pointAtOffset(startOffset) : [callback(lineStartX), callback(lineStartY)],
    [endX, endY]: Dynamic = pointAtOffset(endOffset);
  return {
    sx: startX,
    sy: startY,
    ex: endX,
    ey: endY,
  };
}
function arrowMarkerLength(
  svgRoot?: Dynamic,
  element?: Dynamic,
  end: Dynamic = "end",
): Dynamic {
  let value: Dynamic = /^\s*url\(\s*["']?#([^"')\s]+)["']?\s*\)\s*$/.exec(
    element.getAttribute("marker-" + end) || "",
  );
  if (!value) return 0;
  let markers: Dynamic = svgRoot.getElementsByTagName("marker"),
    marker: Dynamic = null;
  for (let index: Dynamic = 0; index < markers.length; index++)
    if (markers[index].getAttribute("id") === value[1]) {
      marker = markers[index];
      break;
    }
  if (!marker) return 0;
  let callback: Dynamic = (attributeName?: Dynamic): Dynamic =>
      marker.getAttribute(attributeName) ??
      marker.getAttribute(
        "sc-camel-" +
          attributeName.replace(
            /[A-Z]/g,
            (attribute?: Dynamic): Dynamic => "-" + attribute.toLowerCase(),
          ),
      ),
    orientation: Dynamic = marker.getAttribute("orient") || "";
  if (
    callback("viewBox") != null ||
    (callback("markerUnits") ?? "strokeWidth") !== "strokeWidth" ||
    !(end === "start"
      ? orientation === "auto-start-reverse"
      : /^auto/.test(orientation))
  )
    return 0;
  let path: Dynamic = marker.getElementsByTagName("path")[0],
    pathData: Dynamic = (path && path.getAttribute("d")) || "";
  if (
    !path ||
    path.hasAttribute("transform") ||
    !/^[MLZz\d\s,.+-]+$/.test(pathData)
  )
    return 0;
  let coordinates: Dynamic = pathData.match(/[-+]?(?:\d+\.?\d*|\.\d+)/g) || [],
    maxX: Dynamic = -1 / 0;
  for (let index: Dynamic = 0; index + 1 < coordinates.length; index += 2)
    maxX = Math.max(maxX, parseFloat(coordinates[index]));
  marker.getAttribute("overflow") !== "visible" &&
    !/(^|;)\s*overflow\s*:\s*visible/.test(
      marker.getAttribute("style") || "",
    ) &&
    (maxX = Math.min(
      maxX,
      parseFloat(callback("markerWidth") || "3") || 0,
    ));
  let markerLength: Dynamic = maxX - parseFloat(callback("refX") || "0");
  return markerLength > 0 && markerLength < 64 ? markerLength : 0;
}
function regenerateArrowHeadIds(
  svgRoot?: Dynamic,
  roots?: Dynamic,
  random: Dynamic = Math.random,
): Dynamic {
  let flag: Dynamic = false,
    value: Dynamic = null;
  for (let root of roots as Dynamic) {
    let items: Dynamic = [
      ...(root.tagName.toLowerCase() === "marker" ? [root] : []),
      ...root.querySelectorAll("marker"),
    ];
    for (let marker of items as Dynamic) {
      let markerId: Dynamic = marker.getAttribute("id") ?? "",
        headKind: Dynamic = arrowHeadKindFromId(markerId);
      if (
        !headKind ||
        ((value ??= [...svgRoot.querySelectorAll("marker")]),
        !value.some(
          (element?: Dynamic): Dynamic =>
            element !== marker && element.getAttribute("id") === markerId,
        ))
      )
        continue;
      let newId: Dynamic = createArrowHeadId(headKind, random);
      marker.setAttribute("id", newId);
      let svgElement: Dynamic = marker.closest("svg") ?? root;
      for (let attributeName of svgElement.querySelectorAll(
        "[marker-end], [marker-start]",
      ) as Dynamic)
        for (let markerAttribute of ["marker-end", "marker-start"] as Dynamic)
          /#([^"')\s]+)/.exec(attributeName.getAttribute(markerAttribute) ?? "")?.[1] ===
            markerId && attributeName.setAttribute(markerAttribute, `url(#${newId})`);
      flag = true;
    }
  }
  return flag;
}
function inheritedSvgPaint(element?: Dynamic, propertyName?: Dynamic): Dynamic {
  for (
    let value: Dynamic = element;
    value;
    value = value.tagName.toLowerCase() === "svg" ? null : value.parentElement
  ) {
    let styleText: Dynamic = (value.getAttribute("style") ?? "")
        .split(";")
        .map((declaration?: Dynamic): Dynamic => declaration.split(":"))
        .filter(
          (declaration?: Dynamic): Dynamic =>
            declaration[0].trim().toLowerCase() === propertyName,
        ),
      paintValue: Dynamic = (
        styleText.length > 0
          ? styleText[styleText.length - 1].slice(1).join(":")
          : (value.getAttribute(propertyName) ?? "")
      ).trim();
    if (paintValue !== "") return !/^(none|transparent)$/i.test(paintValue);
  }
  return propertyName === "fill";
}
function inspectArrowHeadElement(element?: Dynamic): Dynamic {
  return inheritedSvgPaint(element, "fill")
    ? recognizeArrowHeadPath(element.getAttribute("d") ?? "")
    : inheritedSvgPaint(element, "stroke")
      ? "open"
      : null;
}
function inspectSvgArrowHeads(element?: Dynamic): Dynamic {
  let value: Dynamic =
    element.tagName.toLowerCase() === "svg" ? inspectSvgArrow(element) : null;
  if (!value) return null;
  let styleText: Dynamic = element.getAttribute("style") ?? "",
    callback: Dynamic = (side?: Dynamic): Dynamic =>
      [value.shaft, element].some(
        (styledElement?: Dynamic): Dynamic =>
          new RegExp("(^|;)\\s*marker(-" + side + ")?\\s*:", "i").test(
            styledElement.getAttribute("style") ?? "",
          ),
      ),
    arrowHeadState: Dynamic =
      value.tag === "path" &&
      /(^|;)\s*fill\s*:\s*none/.test(styleText) &&
      /(^|;)\s*overflow\s*:\s*visible/.test(styleText) &&
      (value.legacy ||
        ((element.getAttribute("preserveAspectRatio") ??
          element.getAttribute("sc-camel-preserve-aspect-ratio")) ===
          "none" &&
          /^\s*M\s*[-\d.e+]+[\s,]+[-\d.e+]+\s+L\s*[-\d.e+]+[\s,]+[-\d.e+]+\s*$/i.test(
            value.shaft.getAttribute("d") ?? "",
          ))),
    markerIdForSide: Dynamic = (side?: Dynamic): Dynamic =>
      /^\s*(none)?\s*$/i.test(
        value.shaft.getAttribute("marker-" + side) ?? "",
      );
  if (
    !arrowHeadState &&
    ["start", "end"].every(
      (side?: Dynamic): Dynamic => markerIdForSide(side) && !callback(side),
    )
  )
    return null;
  let getHeadState: Dynamic = (side?: Dynamic): Dynamic => {
    if (callback(side)) return "unknown";
    if (markerIdForSide(side)) return "none";
    let attribute: Dynamic = value.shaft.getAttribute("marker-" + side),
      markerId: Dynamic = SvgArrowsExec(attribute),
      markerElement: Dynamic =
        markerId == null
          ? undefined
          : [...element.getElementsByTagName("marker")].find(
              (markerCandidate?: Dynamic): Dynamic =>
                markerCandidate.getAttribute("id") === markerId,
            ),
      markerChildren: Dynamic = markerElement ? [...markerElement.children] : [],
      orientation: Dynamic = markerElement?.getAttribute("orient") ?? "";
    return markerChildren.length !== 1 ||
      markerChildren[0].tagName.toLowerCase() !== "path" ||
      !(side === "start"
        ? orientation === "auto-start-reverse"
        : /^auto/.test(orientation))
      ? "unknown"
      : (inspectArrowHeadElement(markerChildren[0]) ?? "unknown");
  };
  return value.legacy
    ? {
        shaft: value.shaft,
        legacy: true,
        start: "none",
        end: "open",
      }
    : {
        shaft: value.shaft,
        legacy: false,
        start: getHeadState("start"),
        end: getHeadState("end"),
      };
}
export {
  arrowHeadFillAttribute,
  arrowHeadFillStyle,
  arrowHeadKindFromId,
  arrowHeadMarkerHtml,
  arrowMarkerLength,
  createArrowHeadId,
  defaultArrowHeadDefs,
  inheritedSvgPaint,
  inspectArrowHeadElement,
  inspectSvgArrow,
  inspectSvgArrowHeads,
  normalizeSvgPaint,
  openArrowHeadPath,
  OpenValue,
  recognizeArrowHeadPath,
  regenerateArrowHeadIds,
  shortenLineEnd,
  shortenLineEnds,
  SvgArrowsConstant,
  arrowHeadCenterY as SvgArrowsConstant_2,
  arrowHeadTipInset as SvgArrowsConstant_3,
  openArrowHeadHalfHeight as SvgArrowsConstant_4,
  SvgArrowsCss,
  SvgArrowsDcArrowHeadFilledPattern,
  SvgArrowsExec,
  SvgArrowsFilledOpenConfig,
  SvgArrowsHandler,
  SvgArrowsRefX,
};
export function installEditorSvgArrows(): () => void {
  return () => {
    SvgArrowsConstant = 4;
    arrowHeadCenterY = 2;
    arrowHeadTipInset = 2;
    SvgArrowsCss = `M0 0 L${SvgArrowsConstant} ${arrowHeadCenterY} L0 ${2 * arrowHeadCenterY} Z`;
    openArrowHeadHalfHeight = 1.7;
    openArrowHeadPath = ((): Dynamic => {
      let value: Dynamic = Math.hypot(SvgArrowsConstant, openArrowHeadHalfHeight),
        halfHeight: Dynamic = (openArrowHeadHalfHeight / value) * 0.5,
        halfWidth: Dynamic = (SvgArrowsConstant / value) * 0.5,
        callback: Dynamic = (coordinate?: Dynamic): Dynamic =>
          String(Math.round(coordinate * 1e3) / 1e3),
        arcCommand: Dynamic = `A${0.5} ${0.5} 0 0 1 `,
        tipX: Dynamic = callback(SvgArrowsConstant + halfHeight),
        baseY: Dynamic = arrowHeadCenterY - openArrowHeadHalfHeight,
        baseBottom: Dynamic = arrowHeadCenterY + openArrowHeadHalfHeight;
      return `M${callback(halfHeight)} ${callback(baseY - halfWidth)} L${tipX} ${callback(arrowHeadCenterY - halfWidth)} ${arcCommand}${tipX} ${callback(arrowHeadCenterY + halfWidth)} L${callback(halfHeight)} ${callback(baseBottom + halfWidth)} ${arcCommand}${callback(-halfHeight)} ${callback(baseBottom - halfWidth)} L${callback(SvgArrowsConstant - (0.5 * value) / openArrowHeadHalfHeight)} ${arrowHeadCenterY} L${callback(-halfHeight)} ${callback(baseY + halfWidth)} ${arcCommand}${callback(halfHeight)} ${callback(baseY - halfWidth)} Z`;
    })();
    SvgArrowsFilledOpenConfig = {
      filled: {
        d: SvgArrowsCss,
        refX: SvgArrowsConstant - arrowHeadTipInset,
      },
      open: {
        d: openArrowHeadPath,
        refX: SvgArrowsConstant,
      },
    };
    SvgArrowsRefX = (kind?: Dynamic): Dynamic =>
      kind === "none"
        ? 0
        : SvgArrowsConstant - SvgArrowsFilledOpenConfig[kind].refX;
    OpenValue = "open";
    SvgArrowsHandler = (kind?: Dynamic): Dynamic => "dc-arrow-head-" + kind;
    SvgArrowsDcArrowHeadFilledPattern =
      /dc-arrow-head-(filled|open)(-[0-9a-z]+)?/g;
    SvgArrowsExec = (url?: Dynamic): Dynamic =>
      /^\s*url\(\s*["']?#([^"')\s]+)["']?\s*\)\s*$/.exec(url ?? "")?.[1] ??
      null;
  };
}

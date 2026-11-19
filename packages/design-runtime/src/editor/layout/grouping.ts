/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { CssEditValidationFontSizeFontFamilyFontWeightValues, normalizeStyleEdits, normalizeTextStyleSnapshot } from "../css/edit-validation";
import { captureGroupLayout, LayoutGroupCaptureBackgroundColorBorderStyleBorderColorValues } from "./group-capture";
import { computedTextMetrics, computedWidth, emptyElementHeight } from "../picker/runtime-script";

var finiteOrNull: Dynamic;
var toPx: Dynamic;
var marginProperties: Dynamic;
var insetShorthandProperties: Dynamic;
function normalizeGroupedLayoutConstraints(rawConstraints?: Dynamic): Dynamic {
  if (rawConstraints === null || typeof rawConstraints != "object") return null;
  let source: Dynamic = rawConstraints,
    keys: Dynamic = [
      "widthAuto",
      "heightAuto",
      "widthPercent",
      "heightPercent",
      "left",
      "right",
      "top",
      "bottom",
      "marginAuto",
    ];
  return keys.every(
    (key?: Dynamic): Dynamic => typeof source[key] == "boolean",
  )
    ? Object.fromEntries(
        keys.map(
          (key?: Dynamic): Dynamic => [key, source[key] === true],
        ),
      )
    : null;
}
function normalizeGroupLayoutCapture(
  captures?: Dynamic,
  expectedCount?: Dynamic,
): Dynamic {
  return !Array.isArray(captures) || captures.length !== expectedCount
    ? null
    : captures.map((entry?: Dynamic): Dynamic => {
        if (entry === null || typeof entry != "object") return null;
        let source: Dynamic = entry,
          [left, top, width, height]: Dynamic = [
            finiteOrNull(source.left),
            finiteOrNull(source.top),
            finiteOrNull(source.width),
            finiteOrNull(source.height),
          ];
        if (
          left === null ||
          top === null ||
          width === null ||
          height === null ||
          width < 0 ||
          height < 0
        )
          return null;
        let position: Dynamic =
            source.position === "absolute" || source.position === "fixed"
              ? source.position
              : "flow",
          freeze: Dynamic =
            source.freeze !== null &&
            typeof source.freeze == "object" &&
            !Array.isArray(source.freeze)
              ? source.freeze
              : null,
          changed: Dynamic = Array.isArray(source.changed)
            ? source.changed.filter(
                (property?: Dynamic): Dynamic =>
                  typeof property == "string" &&
                  CssEditValidationFontSizeFontFamilyFontWeightValues.includes(
                    property,
                  ),
              )
            : [],
          carry: Dynamic = {};
        if (
          source.carry !== null &&
          typeof source.carry == "object" &&
          !Array.isArray(source.carry)
        )
          for (let carryProperty of LayoutGroupCaptureBackgroundColorBorderStyleBorderColorValues as Dynamic) {
            let carryValue: Dynamic = source.carry[carryProperty];
            typeof carryValue == "string" && (carry[carryProperty] = carryValue);
          }
        let zIndex: Dynamic =
          typeof source.zIndex == "number" &&
          Number.isInteger(source.zIndex) &&
          source.zIndex > 0 &&
          source.zIndex <= 2147483647
            ? source.zIndex
            : 0;
        return {
          left: left,
          top: top,
          width: width,
          height: height,
          marginLeft: finiteOrNull(source.marginLeft) ?? 0,
          marginTop: finiteOrNull(source.marginTop) ?? 0,
          marginRight: finiteOrNull(source.marginRight) ?? 0,
          marginBottom: finiteOrNull(source.marginBottom) ?? 0,
          cssWidth: Math.max(0, finiteOrNull(source.cssWidth) ?? 0),
          cssHeight: Math.max(0, finiteOrNull(source.cssHeight) ?? 0),
          position: position,
          pinWidth: Math.max(0, finiteOrNull(source.pinWidth) ?? 0),
          pinHeight: Math.max(0, finiteOrNull(source.pinHeight) ?? 0),
          freeze: freeze,
          changed: changed,
          carry: carry,
          lostPosition: source.lostPosition === true,
          lostWidth: source.lostWidth === true,
          lostHeight: source.lostHeight === true,
          lostBoxSizing:
            source.lostBoxSizing === "border-box" ||
            source.lostBoxSizing === "content-box"
              ? source.lostBoxSizing
              : "",
          rendered: normalizeGroupedLayoutConstraints(source.rendered),
          transformed: source.transformed === true,
          sameSpace: source.sameSpace === true,
          zIndex: zIndex,
          localZ: source.localZ === true,
          liftable: source.liftable !== false,
          positioned: source.positioned === true || position !== "flow",
          wraps: source.wraps === true,
          opaque: source.opaque === true,
        };
      });
}
async function inspectGroupLayout(
  webview?: Dynamic,
  rootName?: Dynamic,
  tids?: Dynamic,
  ancestorTids?: Dynamic,
  shouldCaptureTextStyles: Dynamic = true,
): Promise<Dynamic> {
  let script: Dynamic =
    "(" +
    captureGroupLayout.toString() +
    ")(" +
    [
      rootName,
      tids,
      ancestorTids,
      shouldCaptureTextStyles
        ? CssEditValidationFontSizeFontFamilyFontWeightValues
        : null,
      LayoutGroupCaptureBackgroundColorBorderStyleBorderColorValues,
    ]
      .map((captureArgument?: Dynamic): Dynamic => JSON.stringify(captureArgument))
      .join(",") +
    ",{capture:" +
    computedTextMetrics.toString() +
    ",width:" +
    computedWidth.toString() +
    ",height:" +
    emptyElementHeight.toString() +
    "})";
  try {
    return normalizeGroupLayoutCapture(
      await webview.executeJavaScript(script, 4e3),
      tids.length,
    );
  } catch {
    return;
  }
}
function commonSelectedAncestor(model?: Dynamic, tids?: Dynamic): Dynamic {
  let ancestorTid: Dynamic = tids.length > 0 ? model.parentTid(tids[0]) : null;
  for (
    ;
    ancestorTid !== null &&
    !tids.every(
      (tid?: Dynamic): Dynamic => model.isWithin(ancestorTid, tid),
    );

  )
    ancestorTid = model.parentTid(ancestorTid);
  let chain: Dynamic = [];
  for (
    let cursor: Dynamic = ancestorTid;
    cursor !== null;
    cursor = model.parentTid(cursor)
  )
    chain.push(cursor);
  return chain;
}
function freezeTextStyleForLayout(
  model?: Dynamic,
  tid?: Dynamic,
  layout?: Dynamic,
): Dynamic {
  if (!(!layout.freeze || layout.changed.length === 0))
    for (let [property, propertyValue] of normalizeTextStyleSnapshot(
      layout.freeze,
    ) as Dynamic)
      layout.changed.includes(property) &&
        !model.hasAuthoredStyle(tid, property) &&
        model.setStyleProperty(tid, property, propertyValue);
}
function resetPositioningProperty(
  model?: Dynamic,
  tid?: Dynamic,
  property?: Dynamic,
  renderedValue?: Dynamic,
  hadInlineInset?: Dynamic,
): Dynamic {
  let hadAuthoredValue: Dynamic =
    hadInlineInset || model.inlineStyleValue(tid, property) !== "";
  model.setStyleProperty(tid, property, null);
  (model.hasAuthoredStyle(tid, property) || (renderedValue === true && !hadAuthoredValue)) &&
    model.setStyleProperty(tid, property, "auto");
}
function layoutCarryStyle(layout?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(
    normalizeStyleEdits(Object.entries(layout.carry)).flatMap(
      ([property, propertyValue]: Dynamic): Dynamic =>
        propertyValue === null ? [] : [[property, propertyValue]],
    ),
  );
  for (let group of ["border-", "radius"] as Dynamic) {
    let groupProperties: Dynamic = Object.keys(layout.carry).filter(
      (property?: Dynamic): Dynamic =>
        group === "radius"
          ? property.endsWith("-radius")
          : property.startsWith(group) && !property.endsWith("-radius"),
    );
    if (groupProperties.some((property?: Dynamic): Dynamic => !entries.has(property)))
      for (let property of groupProperties as Dynamic) entries.delete(property);
  }
  return [...entries];
}
function ungroupedElementRect(
  model?: Dynamic,
  tid?: Dynamic,
  layout?: Dynamic,
): Dynamic {
  if (layout.position === "flow")
    return {
      left: layout.left,
      top: layout.top,
      zeroMargins: true,
      width: layout.pinWidth > 0 ? layout.pinWidth : null,
      height: layout.pinHeight > 0 ? layout.pinHeight : null,
      autoWidth: false,
    };
  let rendered: Dynamic = layout.rendered,
    effectiveStyle: Dynamic = (property?: Dynamic): Dynamic =>
      model.effectiveStyleValue(tid, property),
    hasAuthoredStyle: Dynamic = (property?: Dynamic): Dynamic =>
      model.hasAuthoredStyle(tid, property),
    hasInsetOnAxis: Dynamic = (axis?: Dynamic): Dynamic =>
      effectiveStyle("inset-" + axis) !== "" ||
      (effectiveStyle("inset-" + axis + "-start") !== "" &&
        effectiveStyle("inset-" + axis + "-end") !== ""),
    isWidthAuto: Dynamic = rendered ? rendered.widthAuto : !hasAuthoredStyle("width"),
    isHeightAuto: Dynamic = rendered ? rendered.heightAuto : !hasAuthoredStyle("height"),
    isHorizontallyPinned: Dynamic = rendered
      ? rendered.left && rendered.right
      : (hasAuthoredStyle("left") && hasAuthoredStyle("right")) || hasInsetOnAxis("inline"),
    isVerticallyPinned: Dynamic = rendered
      ? rendered.top && rendered.bottom
      : (hasAuthoredStyle("top") && hasAuthoredStyle("bottom")) || hasInsetOnAxis("block"),
    hasRelativeWidth: Dynamic =
      layout.lostWidth ||
      (isWidthAuto
        ? isHorizontallyPinned || layout.wraps
        : rendered
          ? rendered.widthPercent
          : effectiveStyle("width").includes("%")),
    hasRelativeHeight: Dynamic =
      layout.lostHeight ||
      (isHeightAuto
        ? isVerticallyPinned
        : rendered
          ? rendered.heightPercent
          : effectiveStyle("height").includes("%")),
    hasAutoMargin: Dynamic = rendered
      ? rendered.marginAuto
      : [
          "margin",
          ...marginProperties,
        ].some(
          (property?: Dynamic): Dynamic => effectiveStyle(property).includes("auto"),
        );
  return {
    left: hasAutoMargin ? layout.left : layout.left - layout.marginLeft,
    top: hasAutoMargin ? layout.top : layout.top - layout.marginTop,
    zeroMargins: hasAutoMargin,
    width: hasRelativeWidth && layout.cssWidth > 0 ? layout.cssWidth : null,
    height: hasRelativeHeight && layout.cssHeight > 0 ? layout.cssHeight : null,
    autoWidth: isWidthAuto && !hasRelativeWidth,
  };
}
function restoreUngroupedLayout(
  model?: Dynamic,
  tid?: Dynamic,
  layout?: Dynamic,
  rect?: Dynamic,
  offsetX?: Dynamic,
  offsetY?: Dynamic,
): Dynamic {
  layout.position === "flow"
    ? model.setStyleProperty(tid, "position", "absolute")
    : (layout.lostPosition ||
        !model.hasAuthoredStyle(tid, "position")) &&
      model.setStyleProperty(tid, "position", layout.position);
  layout.opaque &&
    !model.hasAuthoredStyle(tid, "width") &&
    !model.hasAuthoredStyle(tid, "height") &&
    (rect.width === null &&
      layout.cssWidth > 0 &&
      model.setStyleProperty(
        tid,
        "width",
        String(layout.cssWidth) + "px",
      ),
    rect.height === null &&
      layout.cssHeight > 0 &&
      model.setStyleProperty(
        tid,
        "height",
        String(layout.cssHeight) + "px",
      ));
  layout.lostBoxSizing !== "" &&
    model.setStyleProperty(tid, "box-sizing", layout.lostBoxSizing);
  for (let [property, propertyValue] of layoutCarryStyle(layout) as Dynamic)
    model.inlineStyleValue(tid, property) === "" &&
      model.setStyleProperty(tid, property, propertyValue);
  if (rect.zeroMargins) {
    for (let property of marginProperties as Dynamic)
      model.setStyleProperty(tid, property, null);
    model.setStyleProperty(tid, "margin", "0px");
  }
  rect.width !== null &&
    model.setStyleProperty(tid, "width", String(rect.width) + "px");
  rect.height !== null &&
    model.setStyleProperty(tid, "height", String(rect.height) + "px");
  let hadInsetShorthand: Dynamic = false;
  for (let property of insetShorthandProperties as Dynamic)
    model.inlineStyleValue(tid, property) &&
      (model.setStyleProperty(tid, property, null), (hadInsetShorthand = true));
  model.setStyleProperty(
    tid,
    "left",
    toPx(rect.left - offsetX),
  );
  model.setStyleProperty(
    tid,
    "top",
    toPx(rect.top - offsetY),
  );
  resetPositioningProperty(
    model,
    tid,
    "right",
    layout.rendered ? layout.rendered.right : null,
    hadInsetShorthand,
  );
  resetPositioningProperty(
    model,
    tid,
    "bottom",
    layout.rendered ? layout.rendered.bottom : null,
    hadInsetShorthand,
  );
}
function groupModelElements(
  model?: Dynamic,
  tids?: Dynamic,
  layouts?: Dynamic,
): Dynamic {
  let elements: Dynamic = tids
    .map((tid?: Dynamic): Dynamic => model.element(tid))
    .filter((element?: Dynamic): Dynamic => element !== null);
  if (
    elements.length === 0 ||
    elements.length !== layouts.length ||
    layouts.some((layout?: Dynamic): Dynamic => layout.position === "fixed")
  )
    return null;
  let parentNode: Dynamic = elements[0].parentNode;
  for (
    ;
    parentNode &&
    !elements.every((element?: Dynamic): Dynamic => parentNode.contains(element));

  )
    parentNode = parentNode.parentNode;
  let lastElement: Dynamic = elements[elements.length - 1];
  for (
    ;
    parentNode && lastElement.parentNode && lastElement.parentNode !== parentNode;

  )
    lastElement = lastElement.parentNode;
  let nextSibling: Dynamic = lastElement.nextSibling,
    placed: Dynamic = layouts.map(
      (layout?: Dynamic, index?: Dynamic): Dynamic => ({
        b: layout,
        p: ungroupedElementRect(model, tids[index], layout),
      }),
    ),
    groupLeft: Dynamic = Math.floor(
      Math.min(...placed.map((entry?: Dynamic): Dynamic => entry.b.left)),
    ),
    groupTop: Dynamic = Math.floor(
      Math.min(...placed.map((entry?: Dynamic): Dynamic => entry.b.top)),
    ),
    farEdge: Dynamic = (entry?: Dynamic, axis?: Dynamic): Dynamic =>
      axis === "x"
        ? Math.round(entry.p.left - groupLeft) +
          entry.b.width +
          (entry.p.zeroMargins
            ? 0
            : entry.b.marginLeft +
              (entry.p.autoWidth ? Math.max(0, entry.b.marginRight) : 0))
        : Math.round(entry.p.top - groupTop) +
          entry.b.height +
          (entry.p.zeroMargins ? 0 : entry.b.marginTop),
    groupWidth: Dynamic = Math.ceil(
      Math.max(
        ...placed.map((entry?: Dynamic): Dynamic => farEdge(entry, "x")),
      ),
    ),
    groupHeight: Dynamic = Math.ceil(
      Math.max(
        ...placed.map((entry?: Dynamic): Dynamic => farEdge(entry, "y")),
      ),
    ),
    maxZIndex: Dynamic = Math.max(
      0,
      ...layouts.map((layout?: Dynamic): Dynamic => layout.zIndex),
    ),
    zIndexStyle: Dynamic =
      maxZIndex > 0
        ? "; z-index: " + String(maxZIndex)
        : layouts.some((layout?: Dynamic): Dynamic => layout.localZ)
          ? "; z-index: 0"
          : "",
    groupElement: Dynamic = model.wrapElements(
      [...tids],
      '<div data-dc-group style="box-sizing: border-box; position: absolute; margin: 0px; left: ' +
        toPx(groupLeft) +
        "; top: " +
        toPx(groupTop) +
        "; width: " +
        toPx(groupWidth) +
        "; height: " +
        toPx(groupHeight) +
        zIndexStyle +
        '"></div>',
    );
  return groupElement
    ? (parentNode &&
        groupElement.parentNode === parentNode &&
        nextSibling !== groupElement &&
        parentNode.insertBefore(groupElement, nextSibling),
      tids.forEach((tid?: Dynamic, index?: Dynamic): Dynamic => {
        restoreUngroupedLayout(
          model,
          tid,
          placed[index].b,
          placed[index].p,
          groupLeft,
          groupTop,
        );
        freezeTextStyleForLayout(model, tid, placed[index].b);
      }),
      groupElement)
    : null;
}
export {
  commonSelectedAncestor,
  freezeTextStyleForLayout,
  groupModelElements,
  inspectGroupLayout,
  layoutCarryStyle,
  finiteOrNull as LayoutGroupingAbs,
  toPx as LayoutGroupingHandler,
  insetShorthandProperties as LayoutGroupingInsetInlineInsetBlockInsetInlineStartValues,
  marginProperties as LayoutGroupingMarginTopMarginRightMarginBottomValues,
  normalizeGroupedLayoutConstraints,
  normalizeGroupLayoutCapture,
  resetPositioningProperty,
  restoreUngroupedLayout,
  ungroupedElementRect,
};
export function installEditorLayoutGrouping(): () => void {
  return () => {
    finiteOrNull = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "number" &&
      Number.isFinite(candidate) &&
      Math.abs(candidate) < 1e6
        ? candidate
        : null;
    toPx = (pixels?: Dynamic): Dynamic =>
      String(Math.round(pixels)) + "px";
    marginProperties = [
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "margin-inline",
      "margin-block",
      "margin-inline-start",
      "margin-inline-end",
      "margin-block-start",
      "margin-block-end",
    ];
    insetShorthandProperties = [
      "inset-inline",
      "inset-block",
      "inset-inline-start",
      "inset-inline-end",
      "inset-block-start",
      "inset-block-end",
    ];
  };
}

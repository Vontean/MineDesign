/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var LayoutGroupCaptureBackgroundColorBorderStyleBorderColorValues: Dynamic;
function captureGroupLayout(
  scopeName?: Dynamic,
  tids?: Dynamic,
  ancestorTids?: Dynamic,
  textStyleProps?: Dynamic,
  carryProps?: Dynamic,
  metrics?: Dynamic,
): Dynamic {
  let transformProps: Dynamic = ["transform", "translate", "rotate", "scale"];
  function scopeNameOf(element?: Dynamic): Dynamic {
    let host: Dynamic = element.hasAttribute("data-sc-name")
        ? element.parentElement
        : element,
      scopeElement: Dynamic = host ? host.closest("[data-sc-name]") : null;
    return scopeElement ? scopeElement.getAttribute("data-sc-name") : null;
  }
  function findElementByTid(tid?: Dynamic): Dynamic {
    let matches: Dynamic = (document as Dynamic).querySelectorAll(
      '[data-dc-tpl="' + String(tid) + '"]',
    );
    for (let i: Dynamic = 0; i < matches.length; i++) {
      let candidate: Dynamic = matches[i];
      if (
        scopeNameOf(candidate) === scopeName &&
        !candidate.closest("[data-dc-editor-overlay]")
      )
        return candidate;
    }
    return null;
  }
  let toNumber: Dynamic = function (text?: Dynamic): Dynamic {
      let parsed: Dynamic = parseFloat(text);
      return isFinite(parsed) ? parsed : 0;
    },
    restoreActions: Dynamic = [];
  function pinStyle(element?: Dynamic, extraStyle?: Dynamic): Dynamic {
    let attribute: Dynamic = element.getAttribute("style"),
      baseStyle: Dynamic = (attribute || "") + ";transition:none!important";
    element.setAttribute("style", baseStyle + extraStyle);
    restoreActions.push(function (): Dynamic {
      element.setAttribute("style", baseStyle);
      element.getBoundingClientRect();
      attribute === null
        ? element.removeAttribute("style")
        : element.setAttribute("style", attribute);
    });
  }
  function transformSignature(computedStyle?: Dynamic): Dynamic {
    let text: Dynamic = "";
    for (let i: Dynamic = 0; i < transformProps.length; i++)
      text +=
        ";" +
        transformProps[i] +
        ":" +
        (computedStyle.getPropertyValue(transformProps[i]) || "none");
    return text;
  }
  function readTransformValues(element?: Dynamic): Dynamic {
    let values: Dynamic = [];
    for (let i: Dynamic = 0; i < transformProps.length; i++) {
      let entry: Dynamic = readStyleMapValue(element, transformProps[i]);
      if (entry === null) return null;
      values.push(entry || "none");
    }
    return values;
  }
  function measureInSandbox(
    element?: Dynamic,
    parent?: Dynamic,
    beforeNode?: Dynamic,
    shouldWrap?: Dynamic,
    measure?: Dynamic,
  ): Dynamic {
    let clone: Dynamic = element.cloneNode(false);
    element.firstChild &&
      clone.appendChild((document as Dynamic).createTextNode("x"));
    clone.style.setProperty("transition", "none", "important");
    clone.style.setProperty("animation", "none", "important");
    let container: Dynamic = clone;
    shouldWrap &&
      ((container = (document as Dynamic).createElement("div")),
      container.appendChild(clone));
    try {
      parent.insertBefore(container, beforeNode);
      measure(clone);
    } finally {
      container.parentNode && container.parentNode.removeChild(container);
    }
  }
  let anchorSets: Dynamic = [];
  function findAnchorSet(container?: Dynamic, fixed?: Dynamic): Dynamic {
    for (let i: Dynamic = 0; i < anchorSets.length; i++)
      if (
        anchorSets[i].container === container &&
        anchorSets[i].fixed === fixed
      )
        return anchorSets[i];
    return null;
  }
  function createAnchors(
    container?: Dynamic,
    fixed?: Dynamic,
    beforeNode?: Dynamic,
  ): Dynamic {
    if (findAnchorSet(container, fixed)) return;
    let anchorSet: Dynamic = {
      container: container,
      fixed: fixed,
      made: [],
      a: null,
      b: null,
    };
    anchorSets.push(anchorSet);
    restoreActions.push(function (): Dynamic {
      for (let i: Dynamic = 0; i < anchorSet.made.length; i++)
        anchorSet.made[i].parentNode &&
          anchorSet.made[i].parentNode.removeChild(anchorSet.made[i]);
    });
    let corners: Dynamic = [
      [0, 0],
      [100, 0],
      [0, 100],
    ];
    for (let i: Dynamic = 0; i < 3; i++) {
      let marker: Dynamic = (document as Dynamic).createElement("div");
      marker.style.cssText =
        "all:initial!important;display:block!important;position:" +
        (fixed ? "fixed" : "absolute") +
        "!important;left:" +
        String(corners[i][0]) +
        "px!important;top:" +
        String(corners[i][1]) +
        "px!important;width:0!important;height:0!important;visibility:hidden!important;pointer-events:none!important";
      anchorSet.made.push(marker);
      container.insertBefore(
        marker,
        beforeNode && beforeNode.parentNode === container ? beforeNode : null,
      );
    }
  }
  function measureAnchors(slot?: Dynamic): Dynamic {
    for (let i: Dynamic = 0; i < anchorSets.length; i++) {
      let points: Dynamic = anchorSets[i].made.map(function (
        marker?: Dynamic,
      ): Dynamic {
        let bounds: Dynamic = marker.getBoundingClientRect();
        return [bounds.left, bounds.top];
      });
      points.length < 3 ||
        (anchorSets[i][slot] = {
          ox: points[0][0],
          oy: points[0][1],
          ux: (points[1][0] - points[0][0]) / 100,
          uy: (points[1][1] - points[0][1]) / 100,
          vx: (points[2][0] - points[0][0]) / 100,
          vy: (points[2][1] - points[0][1]) / 100,
        });
    }
  }
  function isSameBasis(basisA?: Dynamic, basisB?: Dynamic): Dynamic {
    return (
      Math.abs(basisA.ux - basisB.ux) < 0.002 &&
      Math.abs(basisA.uy - basisB.uy) < 0.002 &&
      Math.abs(basisA.vx - basisB.vx) < 0.002 &&
      Math.abs(basisA.vy - basisB.vy) < 0.002
    );
  }
  function readStyleMapValue(element?: Dynamic, property?: Dynamic): Dynamic {
    let computedStyleMap: Dynamic = element.computedStyleMap;
    if (typeof computedStyleMap != "function") return null;
    try {
      let entry: Dynamic = computedStyleMap.call(element).get(property);
      return entry == null ? "" : String(entry);
    } catch {
      return null;
    }
  }
  let opaqueTagPattern: Dynamic =
      /^(INPUT|SELECT|TEXTAREA|OPTION|IMG|IFRAME|VIDEO|AUDIO|CANVAS|OBJECT|EMBED|SCRIPT|LINK|STYLE)$/,
    elements: Dynamic = [],
    firstElement: Dynamic = null;
  for (let i: Dynamic = 0; i < tids.length; i++) {
    let element: Dynamic = findElementByTid(tids[i]);
    elements.push(element);
    element && !firstElement && (firstElement = element);
  }
  if (!firstElement) return null;
  let scopeRoot: Dynamic = null;
  for (let i: Dynamic = 0; i < ancestorTids.length && !scopeRoot; i++)
    scopeRoot = findElementByTid(ancestorTids[i]);
  if (!scopeRoot) {
    let ancestorElement: Dynamic = firstElement.hasAttribute("data-sc-name")
      ? firstElement.parentElement
      : firstElement;
    scopeRoot = ancestorElement ? ancestorElement.closest("[data-sc-name]") : null;
  }
  if (!scopeRoot) return null;
  let groupRoot: Dynamic = scopeRoot,
    records: Dynamic = [],
    hoverAncestors: Dynamic = [],
    hoverTransformStates: Dynamic = [],
    layouts: Dynamic = [],
    rects: Dynamic = [];
  try {
    for (let i: Dynamic = 0; i < elements.length; i++) {
      let element: Dynamic = elements[i];
      if (
        !element ||
        !element.parentElement ||
        !groupRoot.contains(element) ||
        element === groupRoot
      )
        continue;
      let computed: Dynamic = getComputedStyle(element),
        widthValue: Dynamic = readStyleMapValue(element, "width"),
        rendered: Dynamic = null;
      if (widthValue !== null) {
        let heightValue: Dynamic = readStyleMapValue(element, "height") || "",
          sidesPinned: Dynamic = ["left", "right", "top", "bottom"].map(function (
            side?: Dynamic,
          ): Dynamic {
            return (readStyleMapValue(element, side) || "auto") !== "auto";
          }),
          hasAutoMargin: Dynamic = [
            "margin-left",
            "margin-right",
            "margin-top",
            "margin-bottom",
          ].some(function (property?: Dynamic): Dynamic {
            return readStyleMapValue(element, property) === "auto";
          });
        rendered = {
          widthAuto: widthValue === "auto",
          heightAuto: heightValue === "auto",
          widthPercent: widthValue.indexOf("%") >= 0,
          heightPercent: heightValue.indexOf("%") >= 0,
          left: sidesPinned[0],
          right: sidesPinned[1],
          top: sidesPinned[2],
          bottom: sidesPinned[3],
          marginAuto: hasAutoMargin,
        };
      }
      records.push({
        el: element,
        cs: computed,
        fixed: computed.position === "fixed",
        abs: computed.position === "absolute",
        rendered: rendered,
      });
      for (
        let parentElement: Dynamic = element.parentElement;
        parentElement && parentElement !== groupRoot;
        parentElement = parentElement.parentElement
      ) {
        if (
          hoverAncestors.indexOf(parentElement) >= 0 ||
          !parentElement.matches(":hover") ||
          !parentElement.parentNode ||
          opaqueTagPattern.test(parentElement.tagName) ||
          parentElement.tagName.indexOf("-") >= 0
        )
          continue;
        hoverAncestors.push(parentElement);
        let baselineTransforms: Dynamic = readTransformValues(parentElement);
        if (!baselineTransforms) continue;
        let hoverTransforms: Dynamic = null;
        measureInSandbox(
          parentElement,
          parentElement.parentNode,
          parentElement,
          false,
          function (sandboxElement?: Dynamic): Dynamic {
            hoverTransforms = readTransformValues(sandboxElement);
          },
        );
        let hoverResult: Dynamic = hoverTransforms;
        !hoverResult ||
          hoverResult.join("|") === baselineTransforms.join("|") ||
          (hoverTransformStates.push([parentElement, hoverResult]),
          pinStyle(
            parentElement,
            hoverResult
              .map(function (transformValue?: Dynamic, index?: Dynamic): Dynamic {
                return ";" + transformProps[index] + ":" + transformValue + "!important";
              })
              .join(""),
          ));
      }
    }
    for (let i: Dynamic = 0; i < records.length; i++)
      transformSignature(records[i].cs) !==
        ";transform:none;translate:none;rotate:none;scale:none" &&
        pinStyle(
          records[i].el,
          ";transform:none!important;translate:none!important;rotate:none!important;scale:none!important",
        );
    let hasFixed: Dynamic = records.some(function (record?: Dynamic): Dynamic {
        return record.fixed;
      }),
      insertBefore: Dynamic = null;
    if (records.length > 0) {
      let el: Dynamic = records[records.length - 1].el;
      for (; el.parentElement && el.parentElement !== groupRoot; )
        el = el.parentElement;
      el.parentElement === groupRoot && (insertBefore = textStyleProps ? el.nextSibling : el);
    }
    createAnchors(groupRoot, false, insertBefore);
    hasFixed && createAnchors(groupRoot, true, insertBefore);
    measureAnchors("a");
    for (let i: Dynamic = 0; i < records.length; i++)
      rects.push(records[i].el.getBoundingClientRect());
    for (let i: Dynamic = 0; i < records.length; i++)
      createAnchors(records[i].el.parentElement, records[i].fixed, null);
    measureAnchors("b");
  } finally {
    for (let actionIndex: Dynamic = restoreActions.length - 1; actionIndex >= 0; actionIndex--)
      try {
        restoreActions[actionIndex]();
      } catch {}
    restoreActions = [];
  }
  let recordIndex: Dynamic = 0;
  for (let i: Dynamic = 0; i < elements.length; i++) {
    let element: Dynamic = elements[i];
    if (
      !element ||
      !element.parentElement ||
      !groupRoot.contains(element) ||
      element === groupRoot
    ) {
      layouts.push(null);
      continue;
    }
    let record: Dynamic = records[recordIndex],
      rect: Dynamic = rects[recordIndex];
    recordIndex++;
    let elementStyle: Dynamic = record.cs,
      groupAnchors: Dynamic = findAnchorSet(groupRoot, record.fixed),
      parentAnchors: Dynamic = findAnchorSet(element.parentElement, record.fixed),
      groupBasisA: Dynamic = groupAnchors ? groupAnchors.a : null,
      groupBasisB: Dynamic = groupAnchors ? groupAnchors.b : null,
      parentBasisB: Dynamic = parentAnchors ? parentAnchors.b : null,
      determinant: Dynamic = groupBasisA
        ? groupBasisA.ux * groupBasisA.vy - groupBasisA.uy * groupBasisA.vx
        : 0,
      zoomValue: Dynamic = elementStyle.zoom || "1";
    if (
      !groupBasisA ||
      !groupBasisB ||
      !parentBasisB ||
      !rect ||
      Math.abs(determinant) < 1e-6 ||
      elementStyle.display === "none" ||
      !/^(1|normal)$/.test(zoomValue) ||
      (rect.width === 0 &&
        rect.height === 0 &&
        element.getClientRects().length === 0)
    ) {
      layouts.push(null);
      continue;
    }
    let boxWidth: Dynamic = toNumber(elementStyle.width),
      boxHeight: Dynamic = toNumber(elementStyle.height);
    elementStyle.boxSizing !== "border-box" &&
      ((boxWidth +=
        toNumber(elementStyle.paddingLeft) +
        toNumber(elementStyle.paddingRight) +
        toNumber(elementStyle.borderLeftWidth) +
        toNumber(elementStyle.borderRightWidth)),
      (boxHeight +=
        toNumber(elementStyle.paddingTop) +
        toNumber(elementStyle.paddingBottom) +
        toNumber(elementStyle.borderTopWidth) +
        toNumber(elementStyle.borderBottomWidth)));
    let measuredElement: Dynamic = element,
      isAxisAligned: Dynamic =
        Math.abs(groupBasisA.uy) < 0.001 && Math.abs(groupBasisA.vx) < 0.001;
    toNumber(elementStyle.width) > 0 ||
      (boxWidth = isAxisAligned
        ? rect.width / Math.abs(groupBasisA.ux)
        : measuredElement.offsetWidth || 0);
    toNumber(elementStyle.height) > 0 ||
      (boxHeight = isAxisAligned
        ? rect.height / Math.abs(groupBasisA.vy)
        : measuredElement.offsetHeight || 0);
    let offsetX: Dynamic = rect.left + rect.width / 2 - groupBasisA.ox,
      offsetY: Dynamic = rect.top + rect.height / 2 - groupBasisA.oy,
      centerU: Dynamic =
        (groupBasisA.vy * offsetX - groupBasisA.vx * offsetY) / determinant,
      centerV: Dynamic =
        (groupBasisA.ux * offsetY - groupBasisA.uy * offsetX) / determinant,
      zIndex: Dynamic = 0,
      hasStackingContext: Dynamic = false;
    for (
      let parentElement: Dynamic = element.parentElement;
      parentElement && parentElement !== groupRoot;
      parentElement = parentElement.parentElement
    ) {
      let ancestorStyle: Dynamic = getComputedStyle(parentElement),
        ancestorZ: Dynamic = parseInt(ancestorStyle.zIndex, 10),
        ancestorZApplies: Dynamic =
          ancestorStyle.zIndex !== "auto" &&
          (/^(relative|absolute|fixed|sticky)$/.test(ancestorStyle.position) ||
            /flex|grid/.test(
              parentElement.parentElement
                ? getComputedStyle(parentElement.parentElement).display
                : "",
            )),
        ancestorHoverState: Dynamic = null;
      for (let j: Dynamic = 0; j < hoverTransformStates.length; j++)
        hoverTransformStates[j][0] === parentElement &&
          (ancestorHoverState = hoverTransformStates[j][1]);
      let ancestorHasTransform: Dynamic = ancestorHoverState
        ? ancestorHoverState.some(function (transformValue?: Dynamic): Dynamic {
            return transformValue !== "none";
          })
        : (!!ancestorStyle.transform && ancestorStyle.transform !== "none") ||
          ["translate", "rotate", "scale"].some(function (
            property?: Dynamic,
          ): Dynamic {
            let propertyValue: Dynamic = ancestorStyle.getPropertyValue(property);
            return !!propertyValue && propertyValue !== "none";
          });
      (ancestorZApplies ||
        parseFloat(ancestorStyle.opacity) < 1 ||
        ancestorHasTransform ||
        (ancestorStyle.filter && ancestorStyle.filter !== "none") ||
        ancestorStyle.isolation === "isolate" ||
        (ancestorStyle.mixBlendMode && ancestorStyle.mixBlendMode !== "normal") ||
        /transform|opacity|filter|translate|rotate|scale|perspective|clip-path|mask/.test(
          ancestorStyle.willChange || "",
        ) ||
        /paint|layout|strict|content/.test(ancestorStyle.contain || "") ||
        ancestorStyle.position === "fixed" ||
        ancestorStyle.position === "sticky" ||
        [
          "perspective",
          "clip-path",
          "mask-image",
          "-webkit-mask-image",
          "backdrop-filter",
        ].some(function (property?: Dynamic): Dynamic {
          let propertyValue: Dynamic = ancestorStyle.getPropertyValue(property);
          return !!propertyValue && propertyValue !== "none";
        })) &&
        ((zIndex =
          ancestorZApplies && isFinite(ancestorZ) && ancestorZ > 0
            ? Math.min(ancestorZ, 2147483647)
            : 0),
        (hasStackingContext = true));
    }
    let ownZIndex: Dynamic = /^(relative|absolute|fixed|sticky)$/.test(
      elementStyle.position,
    )
      ? parseInt(elementStyle.zIndex, 10)
      : NaN;
    !hasStackingContext &&
      isFinite(ownZIndex) &&
      ownZIndex > zIndex &&
      (zIndex = Math.min(ownZIndex, 2147483647));
    let wraps: Dynamic = false;
    if (
      (element.textContent || "").trim() !== "" &&
      (document as Dynamic).createRange
    ) {
      let range: Dynamic = (document as Dynamic).createRange();
      range.selectNodeContents(element);
      let lineRects: Dynamic = range.getClientRects();
      for (let count: Dynamic = 1; count < lineRects.length && !wraps; count++)
        Math.abs(lineRects[count].top - lineRects[0].top) >
          lineRects[0].height / 2 && (wraps = true);
    }
    let display: Dynamic = getComputedStyle(element.parentElement).display,
      paddingBorderWidth: Dynamic =
        elementStyle.boxSizing === "border-box"
          ? 0
          : toNumber(elementStyle.paddingLeft) +
            toNumber(elementStyle.paddingRight) +
            toNumber(elementStyle.borderLeftWidth) +
            toNumber(elementStyle.borderRightWidth),
      pinWidth: Dynamic =
        record.abs || record.fixed
          ? 0
          : metrics.width(elementStyle) ||
            Math.ceil(Math.max(0, boxWidth - paddingBorderWidth) * 100) / 100,
      pinHeight: Dynamic =
        record.abs || record.fixed
          ? 0
          : /flex|grid/.test(display)
            ? Math.ceil(toNumber(elementStyle.height) * 100) / 100
            : metrics.height(element, elementStyle),
      freeze: Dynamic = null,
      changed: Dynamic = [],
      carry: Dynamic = {},
      lostPosition: Dynamic = false,
      lostWidth: Dynamic = false,
      lostHeight: Dynamic = false,
      lostBoxSizing: Dynamic = "";
    if (textStyleProps)
      if (
        opaqueTagPattern.test(element.tagName) ||
        element.tagName.indexOf("-") >= 0 ||
        !(element instanceof HTMLElement)
      ) {
        freeze = metrics.capture(element, elementStyle, textStyleProps);
        let parentStyle: Dynamic = getComputedStyle(element.parentElement),
          groupStyle: Dynamic = getComputedStyle(groupRoot);
        if (freeze)
          for (let property in freeze)
            parentStyle.getPropertyValue(property) !==
              groupStyle.getPropertyValue(property) && changed.push(property);
      } else {
        let rootCapture: Dynamic = null,
          rootStyles: Dynamic = {},
          hostStyles: Dynamic = {},
          snapshotStyles: Dynamic = function (
            sandboxElement?: Dynamic,
            target?: Dynamic,
          ): Dynamic {
            let computedSnapshot: Dynamic = getComputedStyle(sandboxElement);
            for (let k: Dynamic = 0; k < carryProps.length; k++)
              target[carryProps[k]] = computedSnapshot.getPropertyValue(
                carryProps[k],
              );
            target.position = computedSnapshot.position;
            target["box-sizing"] = computedSnapshot.boxSizing;
            target.width = readStyleMapValue(sandboxElement, "width") || "";
            target.height = readStyleMapValue(sandboxElement, "height") || "";
          };
        if (element.matches(":hover")) {
          let captureHere: Dynamic = null,
            captureNext: Dynamic = null,
            nextStyles: Dynamic = {},
            liveStyles: Dynamic = {};
          measureInSandbox(
            element,
            element.parentElement,
            element,
            false,
            function (sandboxClone?: Dynamic): Dynamic {
              captureHere = metrics.capture(
                element,
                getComputedStyle(sandboxClone),
                textStyleProps,
              );
              snapshotStyles(sandboxClone, hostStyles);
            },
          );
          measureInSandbox(
            element,
            element.parentElement,
            element.nextSibling,
            false,
            function (sandboxClone?: Dynamic): Dynamic {
              captureNext = metrics.capture(
                element,
                getComputedStyle(sandboxClone),
                textStyleProps,
              );
              snapshotStyles(sandboxClone, nextStyles);
            },
          );
          let liveCapture: Dynamic = metrics.capture(element, elementStyle, textStyleProps);
          snapshotStyles(element, liveStyles);
          freeze = captureHere;
          let hoverCapture: Dynamic = captureHere,
            nextCapture: Dynamic = captureNext;
          if (hoverCapture && nextCapture && liveCapture)
            for (let property in hoverCapture)
              hoverCapture[property] !== nextCapture[property] &&
                liveCapture[property] !== undefined &&
                (hoverCapture[property] = liveCapture[property]);
          for (let property in hostStyles)
            hostStyles[property] !== nextStyles[property] &&
              (hostStyles[property] = liveStyles[property] || "");
        } else
          try {
            pinStyle(element, ";animation:none!important");
            freeze = metrics.capture(
              element,
              getComputedStyle(element),
              textStyleProps,
            );
            snapshotStyles(element, hostStyles);
          } finally {
            for (; restoreActions.length > 0; ) restoreActions.pop()();
          }
        measureInSandbox(
          element,
          groupRoot,
          null,
          true,
          function (sandboxClone?: Dynamic): Dynamic {
            rootCapture = metrics.capture(
              element,
              getComputedStyle(sandboxClone),
              textStyleProps,
            );
            snapshotStyles(sandboxClone, rootStyles);
          },
        );
        if (freeze)
          for (let property in freeze)
            (!rootCapture || rootCapture[property] !== freeze[property]) &&
              changed.push(property);
        let hasBorder: Dynamic = [
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width",
        ].some(function (property?: Dynamic): Dynamic {
          return toNumber(hostStyles[property] || "") > 0;
        });
        for (let k: Dynamic = 0; k < carryProps.length; k++) {
          let property: Dynamic = carryProps[k];
          (!hasBorder &&
            (property === "border-style" || property === "border-color")) ||
            (hostStyles[property] !== rootStyles[property] &&
              (carry[property] = hostStyles[property] || ""));
        }
        lostPosition = hostStyles.position !== rootStyles.position;
        lostWidth =
          hostStyles.width !== rootStyles.width &&
          hostStyles.width !== "auto" &&
          hostStyles.width !== "";
        lostHeight =
          hostStyles.height !== rootStyles.height &&
          hostStyles.height !== "auto" &&
          hostStyles.height !== "";
        hostStyles["box-sizing"] !== rootStyles["box-sizing"] &&
          (lostBoxSizing =
            hostStyles["box-sizing"] === "border-box"
              ? "border-box"
              : "content-box");
        if (readStyleMapValue(element, "width") === null) {
          let inPlaceSize: Dynamic = ["", ""],
            rootSize: Dynamic = ["", ""];
          measureInSandbox(
            element,
            element.parentElement,
            element,
            false,
            function (sandboxClone?: Dynamic): Dynamic {
              let computedSnapshot: Dynamic = getComputedStyle(sandboxClone);
              inPlaceSize = [computedSnapshot.width, computedSnapshot.height];
            },
          );
          measureInSandbox(
            element,
            groupRoot,
            null,
            true,
            function (sandboxClone?: Dynamic): Dynamic {
              let computedSnapshot: Dynamic = getComputedStyle(sandboxClone);
              rootSize = [computedSnapshot.width, computedSnapshot.height];
            },
          );
          lostWidth = inPlaceSize[0] !== rootSize[0];
          lostHeight = inPlaceSize[1] !== rootSize[1];
        }
      }
    layouts.push({
      left: centerU - boxWidth / 2,
      top: centerV - boxHeight / 2,
      width: boxWidth,
      height: boxHeight,
      marginLeft: toNumber(elementStyle.marginLeft),
      marginTop: toNumber(elementStyle.marginTop),
      marginRight: toNumber(elementStyle.marginRight),
      marginBottom: toNumber(elementStyle.marginBottom),
      cssWidth: Math.ceil(toNumber(elementStyle.width) * 100) / 100,
      cssHeight: Math.ceil(toNumber(elementStyle.height) * 100) / 100,
      position: record.fixed ? "fixed" : record.abs ? "absolute" : "flow",
      pinWidth: pinWidth,
      pinHeight: pinHeight,
      freeze: freeze,
      changed: changed,
      carry: carry,
      lostPosition: lostPosition,
      lostWidth: lostWidth,
      lostHeight: lostHeight,
      lostBoxSizing: lostBoxSizing,
      rendered: record.rendered,
      transformed: !isSameBasis(parentBasisB, groupBasisB),
      sameSpace:
        isSameBasis(parentBasisB, groupBasisB) &&
        Math.abs(parentBasisB.ox - groupBasisB.ox) < 0.01 &&
        Math.abs(parentBasisB.oy - groupBasisB.oy) < 0.01,
      zIndex: zIndex,
      localZ: hasStackingContext && isFinite(ownZIndex) && ownZIndex > 0,
      liftable:
        !/^(LI|TR|TD|TH|THEAD|TBODY|TFOOT|CAPTION|COL|COLGROUP)$/.test(
          element.tagName,
        ) &&
        !(
          !record.abs &&
          !record.fixed &&
          (/^table-/.test(elementStyle.display) || elementStyle.display === "list-item")
        ),
      positioned: /^(relative|absolute|fixed|sticky)$/.test(elementStyle.position),
      wraps: wraps,
      opaque:
        opaqueTagPattern.test(element.tagName) ||
        element.tagName.indexOf("-") >= 0 ||
        !(element instanceof HTMLElement),
    });
  }
  return layouts;
}
export {
  captureGroupLayout,
  LayoutGroupCaptureBackgroundColorBorderStyleBorderColorValues,
};
export function installEditorLayoutGroupCapture(): () => void {
  return () => {
    LayoutGroupCaptureBackgroundColorBorderStyleBorderColorValues = [
      "background-color",
      "border-style",
      "border-color",
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
    ];
  };
}

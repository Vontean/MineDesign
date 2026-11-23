type Dimension = "width" | "height";
type Edge = "left" | "right" | "top" | "bottom";
type EditableElement = Element & { style: CSSStyleDeclaration; computedStyleMap?: () => StylePropertyMapReadOnly };

const autoKeyword = /^(auto|initial|unset|revert|revert-layer|inherit)$/;
const stylesheetRuleLimit = 4000;

function readComputedMap(element: EditableElement) {
  try { return element.computedStyleMap?.() ?? null; } catch { return null; }
}

function stylesheetDimension(element: Element, dimension: Dimension) {
  let found = false;
  let inspected = 0;
  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; }
    for (let index = 0; index < rules.length && inspected < stylesheetRuleLimit; index++, inspected++) {
      const rule = rules[index] as CSSStyleRule;
      const value = rule.selectorText ? rule.style?.[dimension] : "";
      try {
        if (!value || !element.matches(rule.selectorText)) continue;
        if (autoKeyword.test(value)) return "auto";
        found = true;
      } catch {}
    }
  }
  return found ? "set" : "";
}

export function autoDimensions(element: Element) {
  const editable = element as EditableElement;
  const styleMap = readComputedMap(editable);
  function isAuto(dimension: Dimension) {
    if (styleMap) return String(styleMap.get(dimension)) === "auto";
    const inline = editable.style[dimension];
    if (inline) return autoKeyword.test(inline);
    const rule = stylesheetDimension(element, dimension);
    return rule === "auto" || (!rule && !element.getAttribute(dimension));
  }
  return { w: isAuto("width"), h: isAuto("height") };
}

export function authoredPositioning(element: Element, computed: CSSStyleDeclaration) {
  const editable = element as EditableElement;
  const inline = editable.style;
  const styleMap = readComputedMap(editable);
  function isPositioned(edge: Edge) {
    const value = String((styleMap ? styleMap.get(edge) : inline[edge]) ?? "");
    return value !== "" && value !== "auto";
  }
  const left = isPositioned("left");
  const right = isPositioned("right");
  const top = isPositioned("top");
  const bottom = isPositioned("bottom");
  return {
    useRight: right && !left,
    useBottom: bottom && !top,
    bothX: left && right,
    bothY: top && bottom,
    startLeft: parseFloat(computed.left) || 0,
    startTop: parseFloat(computed.top) || 0,
    startRight: parseFloat(computed.right) || 0,
    startBottom: parseFloat(computed.bottom) || 0,
  };
}

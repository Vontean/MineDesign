/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

async function resolveCaptureFonts(
  document?: Dynamic,
  platform?: Dynamic,
  warnings?: Dynamic,
): Promise<Dynamic> {
  let items: Dynamic = [],
    values: Dynamic = new Set();
  function value(stylesheetUrl?: Dynamic): Dynamic {
    let fontMatch: Dynamic =
        /[?&]family=([^:&]+):ital,wght@([01]),([\d.]+)&/.exec(stylesheetUrl),
      fonts: Dynamic = document.fonts;
    if (!fontMatch || !fonts) return true;
    let fontFamily: Dynamic = fontMatch[1].replace(/\+/g, " ").toLowerCase(),
      fontStyle: Dynamic = fontMatch[2] === "1" ? "italic" : "normal",
      fontWeight: Dynamic = fontMatch[3].replace("..", " ");
    try {
      for (let font of fonts as Dynamic)
        if (
          font.status !== "unloaded" &&
          font.status !== "error" &&
          font.style === fontStyle &&
          font.weight === fontWeight &&
          font.family.replace(/["']/g, "").toLowerCase() === fontFamily
        )
          return true;
    } catch {
      return true;
    }
    return false;
  }
  async function fetchStylesheet(stylesheetUrl?: Dynamic): Promise<Dynamic> {
    try {
      let response: Dynamic = await fetch(stylesheetUrl);
      if (!response.ok) throw new Error("http " + response.status);
      let fontFaceRules: Dynamic =
        (await response.text()).match(/@font-face\s*{[^}]*}/g) || [];
      for (let index: Dynamic = 0; index < fontFaceRules.length; index++)
        items.push({
          css: fontFaceRules[index],
          base: stylesheetUrl,
        });
    } catch {
      warnings.push(
        "cross-origin stylesheet " +
          stylesheetUrl +
          " could not be read; its @font-face rules are not inlined and those fonts may fall back",
      );
    }
  }
  function supportsMedia(rule?: Dynamic): Dynamic {
    try {
      let mediaQuery: Dynamic = rule.media && rule.media.mediaText;
      if (mediaQuery)
        return platform.matchMedia ? platform.matchMedia(mediaQuery).matches : true;
      if (
        rule.conditionText !== undefined &&
        platform.CSS &&
        platform.CSS.supports
      )
        return platform.CSS.supports(rule.conditionText);
    } catch {}
    return true;
  }
  async function visitStylesheet(
    stylesheet?: Dynamic,
    baseUrl?: Dynamic,
  ): Promise<Dynamic> {
    if (
      !stylesheet ||
      values.has(stylesheet) ||
      (stylesheet.href && values.has(stylesheet.href))
    )
      return;
    values.add(stylesheet);
    stylesheet.href && values.add(stylesheet.href);
    let ownerNode: Dynamic = stylesheet.ownerNode;
    if (
      stylesheet.href &&
      ownerNode &&
      ownerNode.nodeType === 1 &&
      ownerNode.hasAttribute("data-font-variant") &&
      !value(stylesheet.href)
    )
      return;
    let rules: Dynamic;
    try {
      rules = stylesheet.cssRules;
    } catch {
      stylesheet.href && (await fetchStylesheet(stylesheet.href));
      return;
    }
    await visitRules(rules, stylesheet.href || baseUrl);
  }
  async function visitRules(
    rules?: Dynamic,
    baseUrl?: Dynamic,
  ): Promise<Dynamic> {
    for (let index: Dynamic = 0; index < rules.length; index++) {
      let rule: Dynamic = rules[index];
      if (rule.type === CSSRule.FONT_FACE_RULE)
        items.push({
          css: rule.cssText,
          base: baseUrl,
        });
      else if ("styleSheet" in rule) {
        if (!supportsMedia(rule)) continue;
        if (rule.styleSheet) await visitStylesheet(rule.styleSheet, baseUrl);
        else if (rule.href) {
          let href: Dynamic = rule.href;
          try {
            href = new URL(rule.href, baseUrl).href;
          } catch {}
          values.has(href) || (values.add(href), await fetchStylesheet(href));
        }
      } else
        rule.cssRules &&
          supportsMedia(rule) &&
          (await visitRules(rule.cssRules, baseUrl));
    }
  }
  try {
    for (let index: Dynamic = 0; index < document.styleSheets.length; index++)
      await visitStylesheet(document.styleSheets[index], document.baseURI);
    let adoptedSheets: Dynamic = document.adoptedStyleSheets || [];
    for (let index: Dynamic = 0; index < adoptedSheets.length; index++)
      await visitStylesheet(adoptedSheets[index], document.baseURI);
  } catch {}
  return items;
}
function collectUsedFontFaces(
  document?: Dynamic,
  items?: Dynamic,
  warnings?: Dynamic,
): Dynamic {
  try {
    if (!document.fonts || !document.fonts.forEach) return;
    let callback: Dynamic = (familyName?: Dynamic): Dynamic =>
        familyName.replace(/^\s*["']?|["']?\s*$/g, "").toLowerCase(),
      state: Dynamic = {};
    for (let index: Dynamic = 0; index < items.length; index++) {
      let value: Dynamic = items[index].css.match(
        /font-family\s*:\s*([^;}]+)/i,
      );
      value && (state[callback(value[1])] = 1);
    }
    let reportedFallbacks: Dynamic = {};
    document.fonts.forEach((fontFace?: Dynamic): Dynamic => {
      let value: Dynamic = callback(fontFace.family);
      fontFace.status === "loaded" &&
        !state[value] &&
        !reportedFallbacks[value] &&
        ((reportedFallbacks[value] = 1),
        warnings.push(
          "font not inlined (a fallback face is used): " + fontFace.family,
        ));
    });
  } catch {}
}
export {
  collectUsedFontFaces,
  resolveCaptureFonts,
};
export function installExportCaptureFonts(): () => void {
  return () => {};
}

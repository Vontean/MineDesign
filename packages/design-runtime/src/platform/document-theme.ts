/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var cdsRootClassName: Dynamic;
var defaultDensity: Dynamic;
var cdsRootAttributes: Dynamic;
var automaticColorModeScript: Dynamic;
var explicitColorModeAttribute: Dynamic;
function buildColorModeScript(colorMode?: Dynamic): Dynamic {
  return colorMode === undefined
    ? automaticColorModeScript
    : "(function(){var h=document.documentElement;h.setAttribute('data-mode','" +
        colorMode +
        "');h.setAttribute('" +
        explicitColorModeAttribute +
        "','" +
        colorMode +
        "')})();";
}
function applyDocumentCdsTheme(doc?: Dynamic): Dynamic {
  let documentElement: Dynamic = doc.documentElement;
  documentElement.classList.add(cdsRootClassName);
  documentElement.hasAttribute("data-density") ||
    documentElement.setAttribute("data-density", defaultDensity);
  let explicitColorMode: Dynamic = documentElement.getAttribute(
    explicitColorModeAttribute,
  );
  if (explicitColorMode === "light" || explicitColorMode === "dark") {
    documentElement.setAttribute("data-mode", explicitColorMode);
    return (): Dynamic => {};
  }
  let syncColorMode: Dynamic = (): Dynamic => {
    let theme: Dynamic = documentElement.getAttribute("data-theme");
    theme === "light" || theme === "dark"
      ? documentElement.setAttribute("data-mode", theme)
      : documentElement.removeAttribute("data-mode");
  };
  syncColorMode();
  let MutationObserverConstructor: Dynamic = doc.defaultView?.MutationObserver;
  if (MutationObserverConstructor === undefined) return (): Dynamic => {};
  let themeObserver: Dynamic = new MutationObserverConstructor(syncColorMode);
  themeObserver.observe(documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return (): Dynamic => themeObserver.disconnect();
}
export {
  applyDocumentCdsTheme,
  automaticColorModeScript,
  buildColorModeScript,
  cdsRootAttributes,
  cdsRootClassName,
  defaultDensity,
  explicitColorModeAttribute,
};
export function installPlatformDocumentTheme(): () => void {
  return () => {
    cdsRootClassName = "cds-root";
    defaultDensity = "comfortable";
    cdsRootAttributes = `class="${cdsRootClassName}" data-density="${defaultDensity}"`;
    automaticColorModeScript =
      "(function(){var h=document.documentElement;function s(){var t=h.getAttribute('data-theme');if(t==='light'||t==='dark'){h.setAttribute('data-mode',t)}else{h.removeAttribute('data-mode')}}s();if(typeof MutationObserver==='function'){new MutationObserver(s).observe(h,{attributes:true,attributeFilter:['data-theme']})}})();";
    explicitColorModeAttribute = "data-mode-pin";
  };
}

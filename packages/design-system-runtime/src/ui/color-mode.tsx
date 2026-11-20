import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var jsxColorModePrimitives: typeof import("react/jsx-runtime");
var reactColorMode: typeof import("react");
var reactDomColorMode: typeof import("react-dom");
var jsxColorMode: typeof import("react/jsx-runtime");
var APP_DENSITY: import("../contracts/controls").Density;
var rootHtmlAttributes: string;
var automaticColorModeScript: string;
function colorModeBootstrapScript(mode?: "light" | "dark"): string {
  if (mode === undefined) {
    return automaticColorModeScript;
  } else {
    return (
      "(function(){var h=document.documentElement;h.setAttribute('data-mode','" +
      mode +
      "');h.setAttribute('data-mode-pin','" +
      mode +
      "')})();"
    );
  }
}
function initializeDocumentColorMode(ownerDocument: Document): () => void {
  let documentElement = ownerDocument.documentElement;
  documentElement.classList.add("cds-root");
  if (!documentElement.hasAttribute("data-density")) {
    documentElement.setAttribute("data-density", "comfortable");
  }
  let attribute = documentElement.getAttribute("data-mode-pin");
  if (attribute === "light" || attribute === "dark") {
    documentElement.setAttribute("data-mode", attribute);
    return () => {};
  }
  let callback = () => {
    let themeMode = documentElement.getAttribute("data-theme");
    if (themeMode === "light" || themeMode === "dark") {
      documentElement.setAttribute("data-mode", themeMode);
    } else {
      documentElement.removeAttribute("data-mode");
    }
  };
  callback();
  let value = (ownerDocument.defaultView as (Window & typeof globalThis) | null)
    ?.MutationObserver;
  if (value === undefined) {
    return () => {};
  }
  let themeObserver = new value(callback);
  themeObserver.observe(documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => themeObserver.disconnect();
}
export {
  APP_DENSITY,
  automaticColorModeScript,
  colorModeBootstrapScript,
  initializeDocumentColorMode,
  jsxColorMode,
  jsxColorModePrimitives,
  reactColorMode,
  reactDomColorMode,
  rootHtmlAttributes,
};
export function installUiColorMode(): () => void {
  return () => {
    jsxColorModePrimitives = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactColorMode = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomColorMode = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    jsxColorMode = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    APP_DENSITY = "comfortable";
    rootHtmlAttributes = 'class="cds-root" data-density="comfortable"';
    automaticColorModeScript =
      "(function(){var h=document.documentElement;function s(){var t=h.getAttribute('data-theme');if(t==='light'||t==='dark'){h.setAttribute('data-mode',t)}else{h.removeAttribute('data-mode')}}s();if(typeof MutationObserver==='function'){new MutationObserver(s).observe(h,{attributes:true,attributeFilter:['data-theme']})}})();";
  };
}

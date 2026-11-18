/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var SessionStripRevealConstant: Dynamic;
var reactSessionStripReveal: Dynamic;
var jsxSessionStripReveal: Dynamic;
var reactSessionStripReveal_2: Dynamic;
var jsxSessionStripReveal_2: Dynamic;
function getSessionStripScrollRow(element?: Dynamic): Dynamic {
  return element.querySelector("[data-mc-row]") ?? element;
}
function revealSessionStripControl(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  let value: Dynamic = getSessionStripScrollRow(input),
    bounds: Dynamic = options.getBoundingClientRect(),
    bounds2: Dynamic = value.getBoundingClientRect();
  bounds.left < bounds2.left + SessionStripRevealConstant
    ? (value.scrollLeft -=
        bounds2.left + SessionStripRevealConstant - bounds.left)
    : bounds.right > bounds2.right - SessionStripRevealConstant &&
      (value.scrollLeft +=
        bounds.right - (bounds2.right - SessionStripRevealConstant));
}
export {
  getSessionStripScrollRow,
  jsxSessionStripReveal,
  jsxSessionStripReveal_2,
  reactSessionStripReveal,
  reactSessionStripReveal_2,
  revealSessionStripControl,
  SessionStripRevealConstant,
};
export function installEditorSessionStripReveal(): () => void {
  return () => {
    SessionStripRevealConstant = 48;
    reactSessionStripReveal = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxSessionStripReveal = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactSessionStripReveal_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxSessionStripReveal_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

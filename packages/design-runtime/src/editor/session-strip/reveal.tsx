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
var reactForDocumentLoadGate: Dynamic;
var jsxForDocumentLoadGate: Dynamic;
function getSessionStripScrollRow(element?: Dynamic): Dynamic {
  return element.querySelector("[data-mc-row]") ?? element;
}
function revealSessionStripControl(
  strip?: Dynamic,
  control?: Dynamic,
): Dynamic {
  let scrollRow: Dynamic = getSessionStripScrollRow(strip),
    controlRect: Dynamic = control.getBoundingClientRect(),
    rowRect: Dynamic = scrollRow.getBoundingClientRect();
  controlRect.left < rowRect.left + SessionStripRevealConstant
    ? (scrollRow.scrollLeft -=
        rowRect.left + SessionStripRevealConstant - controlRect.left)
    : controlRect.right > rowRect.right - SessionStripRevealConstant &&
      (scrollRow.scrollLeft +=
        controlRect.right - (rowRect.right - SessionStripRevealConstant));
}
export {
  getSessionStripScrollRow,
  jsxSessionStripReveal,
  jsxForDocumentLoadGate,
  reactSessionStripReveal,
  reactForDocumentLoadGate,
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
    reactForDocumentLoadGate = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxForDocumentLoadGate = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

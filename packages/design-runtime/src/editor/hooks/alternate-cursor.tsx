/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { DcTplAttribute } from "../html/authoring";
import { toModuleNamespace } from "../../module-helpers";

var reactHooksAlternateCursor: Dynamic;
var HooksAlternateCursorProgressCrosshairConfig: Dynamic;
var HooksAlternateCursorRegistry: Dynamic;
var HooksAlternateCursorProgressCrosshairConfig_2: Dynamic;
var HooksAlternateCursorCrosshairProgressValues: Dynamic;
var HooksAlternateCursorHandler: Dynamic;
var HooksAlternateCursorSubscribers: Dynamic;
var HooksAlternateCursorTest: Dynamic;
function reservedShapeRenderHook(shape?: Dynamic): Dynamic {
  return null;
}
function getAlternateCursorStyle(cursorKind?: Dynamic): Dynamic {
  let styleElement: Dynamic = HooksAlternateCursorRegistry[cursorKind];
  styleElement ||
    ((styleElement = (document as Dynamic).createElement("style")),
    styleElement.setAttribute("data-alt-cursor", cursorKind),
    (styleElement.textContent =
      HooksAlternateCursorProgressCrosshairConfig_2[cursorKind]),
    (HooksAlternateCursorRegistry[cursorKind] = styleElement));
  return styleElement;
}
function refreshAlternateCursors(): Dynamic {
  for (let cursorKind of HooksAlternateCursorCrosshairProgressValues as Dynamic)
    HooksAlternateCursorRegistry[cursorKind]?.remove();
  for (let cursorKind of HooksAlternateCursorCrosshairProgressValues as Dynamic)
    HooksAlternateCursorProgressCrosshairConfig[cursorKind] > 0 &&
      (document as Dynamic).head.appendChild(getAlternateCursorStyle(cursorKind));
}
function useAlternateCursor(cursorKind?: Dynamic, isActive?: Dynamic): Dynamic {
  (0, reactHooksAlternateCursor.useEffect)((): Dynamic => {
    if (isActive) {
      HooksAlternateCursorProgressCrosshairConfig[cursorKind]++;
      refreshAlternateCursors();
      return (): Dynamic => {
        HooksAlternateCursorProgressCrosshairConfig[cursorKind]--;
        refreshAlternateCursors();
      };
    }
  }, [cursorKind, isActive]);
}
function useProgressCursor(isActive?: Dynamic): Dynamic {
  useAlternateCursor("progress", isActive);
}
export {
  getAlternateCursorStyle,
  HooksAlternateCursorCrosshairProgressValues,
  HooksAlternateCursorHandler,
  HooksAlternateCursorProgressCrosshairConfig,
  HooksAlternateCursorProgressCrosshairConfig_2,
  HooksAlternateCursorRegistry,
  HooksAlternateCursorSubscribers,
  HooksAlternateCursorTest,
  reactHooksAlternateCursor,
  refreshAlternateCursors,
  reservedShapeRenderHook,
  useAlternateCursor,
  useProgressCursor,
};
export function installEditorHooksAlternateCursor(): () => void {
  return () => {
    reactHooksAlternateCursor = toModuleNamespace(
      load_react(),
      1,
    );
    HooksAlternateCursorProgressCrosshairConfig = {
      progress: 0,
      crosshair: 0,
    };
    HooksAlternateCursorRegistry = {};
    HooksAlternateCursorProgressCrosshairConfig_2 = {
      progress: "* { cursor: progress !important; }",
      crosshair: "* { cursor: crosshair !important; }",
    };
    HooksAlternateCursorCrosshairProgressValues = ["crosshair", "progress"];
    HooksAlternateCursorHandler = (element?: Dynamic): Dynamic =>
      parseInt(element?.getAttribute(DcTplAttribute) ?? "-1", 10);
    HooksAlternateCursorSubscribers = new Set([
      "stroke",
      "stroke-width",
      "@stroke",
      "@stroke-width",
    ]);
    HooksAlternateCursorTest = (lengthText?: Dynamic): Dynamic =>
      /^\d*\.?\d+(px)?$/.test((lengthText ?? "").trim()) ? parseFloat(lengthText) : null;
  };
}

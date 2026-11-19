/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";
import { BoardsValue, encodeStorePathSegment } from "../../platform/file-content";

var SessionArtboardStateConstant: Dynamic;
var SessionArtboardStateAlias: Dynamic;
var SessionArtboardStateAlias_2: Dynamic;
var reactSessionArtboardState: Dynamic;
var jsxSessionArtboardState: Dynamic;
var SessionArtboardStatePausedCurrentTimeDurationConfig: Dynamic;
var SessionArtboardStateEscape: Dynamic;
var SessionArtboardStateHandler: Dynamic;
function setArtboardWritableCheck(check?: Dynamic): Dynamic {
  SessionArtboardStateAlias_2 = check;
}
function isArtboardWritable(file?: Dynamic): Dynamic {
  return SessionArtboardStateAlias_2 === "cannot tell"
    ? SessionArtboardStateAlias === file
    : SessionArtboardStateAlias_2?.(file) === true;
}
function artboardStorePath(file?: Dynamic): Dynamic {
  return (
    BoardsValue + "/" + encodeStorePathSegment(file)
  );
}
function currentEditingArtboardPath(): Dynamic {
  return SessionArtboardStateAlias === null
    ? null
    : artboardStorePath(SessionArtboardStateAlias);
}
function currentEditingArtboard(): Dynamic {
  return SessionArtboardStateAlias;
}
function setCurrentEditingArtboard(file?: Dynamic): Dynamic {
  if (file === SessionArtboardStateAlias) return null;
  let previousPath: Dynamic = currentEditingArtboardPath();
  SessionArtboardStateAlias = file;
  return previousPath;
}
export {
  artboardStorePath,
  currentEditingArtboard,
  currentEditingArtboardPath,
  isArtboardWritable,
  jsxSessionArtboardState,
  reactSessionArtboardState,
  SessionArtboardStateAlias,
  SessionArtboardStateAlias_2,
  SessionArtboardStateConstant,
  SessionArtboardStateEscape,
  SessionArtboardStateHandler,
  SessionArtboardStatePausedCurrentTimeDurationConfig,
  setArtboardWritableCheck,
  setCurrentEditingArtboard,
};
export function installEditorSessionArtboardState(): () => void {
  return () => {
    SessionArtboardStateConstant = 3e4;
    SessionArtboardStateAlias = null;
    SessionArtboardStateAlias_2 = null;
    reactSessionArtboardState = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxSessionArtboardState = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    SessionArtboardStatePausedCurrentTimeDurationConfig = {
      paused: true,
      currentTime: 0,
      duration: 0,
      ready: false,
      seekable: false,
      failed: false,
    };
    SessionArtboardStateEscape = (annotationId?: Dynamic): Dynamic =>
      '[data-mega-annotation="' + CSS.escape(annotationId) + '"] video';
    SessionArtboardStateHandler = (
      attribute?: Dynamic,
      attributeValue?: Dynamic,
    ): Dynamic => "video[" + attribute + '="' + String(attributeValue) + '"]';
  };
}

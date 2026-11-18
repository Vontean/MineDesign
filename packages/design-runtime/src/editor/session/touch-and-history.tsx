/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { initializeCdsIndex } from "../../cds/index";
import { load_react_jsx_runtime } from "../../dependencies";
import { initializeInspectorContext } from "../inspector/context";
import { toModuleNamespace } from "../../module-helpers";

var jsxSessionTouchAndHistory: Dynamic;
var SessionTouchAndHistoryJsx: Dynamic;
var SessionTouchAndHistoryJsxValue: Dynamic;
var SessionTouchAndHistoryJsxValue_2: Dynamic;
function longTouchHandler(input?: Dynamic): Dynamic {
  let value: Dynamic = null;
  return {
    onTouchStart: (input2?: Dynamic): Dynamic => {
      if (input2.touches.length !== 1) {
        value = null;
        return;
      }
      let value2: Dynamic = input2.touches[0];
      value = {
        x: value2.clientX,
        y: value2.clientY,
      };
    },
    onTouchEnd: (event?: Dynamic): Dynamic => {
      let value2: Dynamic = value;
      value = null;
      if (value2 == null) return;
      let value3: Dynamic = event.changedTouches[0];
      value3 != null &&
        (Math.hypot(value3.clientX - value2.x, value3.clientY - value2.y) >
          12 ||
          (event.preventDefault(), input()));
    },
    onTouchCancel: (): Dynamic => {
      value = null;
    },
  };
}
function createSnapshotHistoryBridge(input?: Dynamic): Dynamic {
  let values: Dynamic = new Set();
  return {
    notify(): Dynamic {
      for (let value of values as Dynamic) value();
    },
    stack: {
      exec(): Dynamic {
        throw new Error(
          "design-editor history is snapshot-based \u2014 record via the panel edit paths, not UndoStack.exec",
        );
      },
      seed(): Dynamic {
        throw new Error(
          "design-editor history is snapshot-based \u2014 record via the panel edit paths, not UndoStack.seed",
        );
      },
      undo: (): Dynamic => input.apply("undo"),
      redo: (): Dynamic => input.apply("redo"),
      canUndo: (): Dynamic => input.depths().undo > 0,
      canRedo: (): Dynamic => input.depths().redo > 0,
      redoDepth: (): Dynamic => input.depths().redo,
      clear(): Dynamic {},
      subscribe(input2: Dynamic): Dynamic {
        values.add(input2);
        return (): Dynamic => values.delete(input2);
      },
    },
  };
}
export {
  createSnapshotHistoryBridge,
  jsxSessionTouchAndHistory,
  longTouchHandler,
  SessionTouchAndHistoryJsx,
  SessionTouchAndHistoryJsxValue,
  SessionTouchAndHistoryJsxValue_2,
};
export function installEditorSessionTouchAndHistory(): () => void {
  return () => {
    initializeCdsIndex();
    jsxSessionTouchAndHistory = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    SessionTouchAndHistoryJsx = (input?: Dynamic): Dynamic => (
      <Icon name={input} size={"auto"} className={"shrink-0"} />
    );
    SessionTouchAndHistoryJsxValue = SessionTouchAndHistoryJsx("TextT");
    SessionTouchAndHistoryJsxValue_2 = SessionTouchAndHistoryJsx("FrameHash");
    initializeCdsIndex();
    initializeInspectorContext();
  };
}

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
function longTouchHandler(onLongTouch?: Dynamic): Dynamic {
  let value: Dynamic = null;
  return {
    onTouchStart: (touchEvent?: Dynamic): Dynamic => {
      if (touchEvent.touches.length !== 1) {
        value = null;
        return;
      }
      let firstTouch: Dynamic = touchEvent.touches[0];
      value = {
        x: firstTouch.clientX,
        y: firstTouch.clientY,
      };
    },
    onTouchEnd: (event?: Dynamic): Dynamic => {
      let touchStart: Dynamic = value;
      value = null;
      if (touchStart == null) return;
      let touchEnd: Dynamic = event.changedTouches[0];
      touchEnd != null &&
        (Math.hypot(touchEnd.clientX - touchStart.x, touchEnd.clientY - touchStart.y) >
          12 ||
          (event.preventDefault(), onLongTouch()));
    },
    onTouchCancel: (): Dynamic => {
      value = null;
    },
  };
}
function createSnapshotHistoryBridge(historyStore?: Dynamic): Dynamic {
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
      undo: (): Dynamic => historyStore.apply("undo"),
      redo: (): Dynamic => historyStore.apply("redo"),
      canUndo: (): Dynamic => historyStore.depths().undo > 0,
      canRedo: (): Dynamic => historyStore.depths().redo > 0,
      redoDepth: (): Dynamic => historyStore.depths().redo,
      clear(): Dynamic {},
      subscribe(listener: Dynamic): Dynamic {
        values.add(listener);
        return (): Dynamic => values.delete(listener);
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
    SessionTouchAndHistoryJsx = (iconName?: Dynamic): Dynamic => (
      <Icon name={iconName} size={"auto"} className={"shrink-0"} />
    );
    SessionTouchAndHistoryJsxValue = SessionTouchAndHistoryJsx("TextT");
    SessionTouchAndHistoryJsxValue_2 = SessionTouchAndHistoryJsx("FrameHash");
    initializeCdsIndex();
    initializeInspectorContext();
  };
}

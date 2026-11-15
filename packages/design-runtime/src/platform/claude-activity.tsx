/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactPlatformClaudeActivity: Dynamic;
var FrameClaudeActivityAskValue: Dynamic;
var FrameClaudeActivityValue: Dynamic;
var createClaudeActivityStoreValue: Dynamic;
var claudeActivityStore: Dynamic;
function createClaudeActivityStore(input?: Dynamic): Dynamic {
  let parentWindow: Dynamic = input.parentWindow,
    values: Dynamic = new Set(),
    text: Dynamic = "unknown",
    flag: Dynamic = false,
    callback: Dynamic = (input2?: Dynamic): Dynamic => {
      if (input2 !== text) {
        text = input2;
        for (let value of [...values] as Dynamic)
          try {
            value();
          } catch {}
      }
    },
    callback2: Dynamic = (dataset?: Dynamic): Dynamic => {
      if (parentWindow === null || dataset.source !== parentWindow) return;
      let data: Dynamic = dataset.data;
      typeof data != "object" ||
        data === null ||
        data[FrameClaudeActivityValue] !== true ||
        (data.working === true
          ? callback("working")
          : data.working === false && callback("idle"));
    },
    callback3: Dynamic = (): Dynamic => {
      if (!(flag || parentWindow === null)) {
        flag = true;
        try {
          input.ownWindow.addEventListener("message", callback2);
          parentWindow.postMessage(
            {
              [FrameClaudeActivityAskValue]: true,
            },
            "*",
          );
        } catch {}
      }
    };
  return {
    get: (): Dynamic => text,
    subscribe(input2: Dynamic): Dynamic {
      values.add(input2);
      callback3();
      return (): Dynamic => {
        values.delete(input2);
      };
    },
    dispose(): Dynamic {
      flag && input.ownWindow.removeEventListener("message", callback2);
      flag = false;
      values.clear();
      text = "unknown";
    },
  };
}
function getClaudeActivityStore(): Dynamic {
  createClaudeActivityStoreValue === null &&
    (createClaudeActivityStoreValue = createClaudeActivityStore({
      ownWindow: window,
      parentWindow:
        (window as Dynamic).parent !== window
          ? (window as Dynamic).parent
          : null,
    }));
  return createClaudeActivityStoreValue;
}
function useClaudeActivity(): Dynamic {
  return (0, reactPlatformClaudeActivity.useSyncExternalStore)(
    claudeActivityStore.subscribe,
    claudeActivityStore.get,
    (): Dynamic => "unknown",
  );
}
export {
  claudeActivityStore,
  createClaudeActivityStore,
  createClaudeActivityStoreValue,
  FrameClaudeActivityAskValue,
  FrameClaudeActivityValue,
  getClaudeActivityStore,
  reactPlatformClaudeActivity,
  useClaudeActivity,
};
export function installPlatformClaudeActivity(): () => void {
  return () => {
    reactPlatformClaudeActivity = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    FrameClaudeActivityAskValue = "__frame_claude_activity_ask";
    FrameClaudeActivityValue = "__frame_claude_activity";
    createClaudeActivityStoreValue = null;
    claudeActivityStore = {
      get: (): Dynamic => getClaudeActivityStore().get(),
      subscribe: (input?: Dynamic): Dynamic =>
        getClaudeActivityStore().subscribe(input),
    };
  };
}

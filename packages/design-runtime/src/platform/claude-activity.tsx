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
function createClaudeActivityStore(windows?: Dynamic): Dynamic {
  let parentWindow: Dynamic = windows.parentWindow,
    values: Dynamic = new Set(),
    text: Dynamic = "unknown",
    flag: Dynamic = false,
    callback: Dynamic = (activityText?: Dynamic): Dynamic => {
      if (activityText !== text) {
        text = activityText;
        for (let value of [...values] as Dynamic)
          try {
            value();
          } catch {}
      }
    },
    handleMessage: Dynamic = (dataset?: Dynamic): Dynamic => {
      if (parentWindow === null || dataset.source !== parentWindow) return;
      let data: Dynamic = dataset.data;
      typeof data != "object" ||
        data === null ||
        data[FrameClaudeActivityValue] !== true ||
        (data.working === true
          ? callback("working")
          : data.working === false && callback("idle"));
    },
    notifySubscribers: Dynamic = (): Dynamic => {
      if (!(flag || parentWindow === null)) {
        flag = true;
        try {
          windows.ownWindow.addEventListener("message", handleMessage);
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
    subscribe(subscriber: Dynamic): Dynamic {
      values.add(subscriber);
      notifySubscribers();
      return (): Dynamic => {
        values.delete(subscriber);
      };
    },
    dispose(): Dynamic {
      flag && windows.ownWindow.removeEventListener("message", handleMessage);
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
    reactPlatformClaudeActivity = toModuleNamespace(
      load_react(),
      1,
    );
    FrameClaudeActivityAskValue = "__frame_claude_activity_ask";
    FrameClaudeActivityValue = "__frame_claude_activity";
    createClaudeActivityStoreValue = null;
    claudeActivityStore = {
      get: (): Dynamic => getClaudeActivityStore().get(),
      subscribe: (subscriber?: Dynamic): Dynamic =>
        getClaudeActivityStore().subscribe(subscriber),
    };
  };
}

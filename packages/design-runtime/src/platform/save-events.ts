/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var PlatformSaveEventsSubscribers: Dynamic;
var PlatformSaveEventsHandler: Dynamic;
var saveReporterActive: Dynamic;
var isSaveReporterActive: Dynamic;
function subscribeSaveEvents(listener?: Dynamic): Dynamic {
  PlatformSaveEventsSubscribers.add(listener);
  return (): Dynamic => {
    PlatformSaveEventsSubscribers.delete(listener);
  };
}
function createSaveEventReporter(debugReporter?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    count: Dynamic = 1;
  saveReporterActive = true;
  return {
    saveStart(paths: Dynamic, bytes: Dynamic): Dynamic {
      let value: Dynamic = count++;
      entries.set(value, {
        n: debugReporter.saveStart(paths, bytes),
        paths: [...paths],
      });
      PlatformSaveEventsHandler({
        type: "started",
        n: value,
        paths: [...paths],
      });
      return value;
    },
    saveEnd(saveId: Dynamic, result: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(saveId);
      entries.delete(saveId);
      debugReporter.saveEnd(entry?.n ?? saveId, result);
      PlatformSaveEventsHandler(
        result.ok
          ? {
              type: "landed",
              n: saveId,
              paths: entry?.paths ?? [],
            }
          : {
              type: "refused",
              n: saveId,
              paths: entry?.paths ?? [],
              ...(result.code !== undefined
                ? {
                    code: result.code,
                  }
                : {}),
            },
      );
    },
    event(eventName: Dynamic, data: Dynamic): Dynamic {
      debugReporter.event(eventName, data);
      PlatformSaveEventsHandler({
        type: "event",
        name: eventName,
        data: data,
      });
    },
  };
}
export {
  createSaveEventReporter,
  PlatformSaveEventsHandler,
  isSaveReporterActive,
  PlatformSaveEventsSubscribers,
  saveReporterActive,
  subscribeSaveEvents,
};
export function installPlatformSaveEvents(): () => void {
  return () => {
    PlatformSaveEventsSubscribers = new Set();
    PlatformSaveEventsHandler = (event?: Dynamic): Dynamic => {
      for (let value of [...PlatformSaveEventsSubscribers] as Dynamic)
        try {
          value(event);
        } catch {}
    };
    saveReporterActive = false;
    isSaveReporterActive = (): Dynamic => saveReporterActive;
  };
}

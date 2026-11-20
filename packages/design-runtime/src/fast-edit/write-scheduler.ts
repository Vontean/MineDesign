/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var FAST_EDIT_WRITE_PACING: Dynamic;
function createFastEditWriteScheduler(schedulerOptions?: Dynamic): Dynamic {
  let pendingWrites: Dynamic = new Map(),
    measuredDelay: Dynamic = 0,
    timer: Dynamic = null,
    closed: Dynamic = false,
    flushNext: Dynamic = (): Dynamic => {
      timer = null;
      let value: Dynamic = pendingWrites.entries().next();
      if (value.done === true) return;
      let [key, write]: Dynamic = value.value;
      pendingWrites.delete(key);
      let startedAt: Dynamic = schedulerOptions.now(),
        index: Dynamic = 0;
      closed = true;
      try {
        index = write();
      } catch {
      } finally {
        closed = false;
      }
      let now: Dynamic = schedulerOptions.now();
      measuredDelay =
        now +
        Math.max(
          FAST_EDIT_WRITE_PACING.minMs,
          index / FAST_EDIT_WRITE_PACING.charsPerMs,
          FAST_EDIT_WRITE_PACING.timesMeasured * (now - startedAt),
        );
      pendingWrites.size > 0 &&
        (timer = schedulerOptions.schedule(flushNext, measuredDelay - now));
    };
  return {
    ask(key: Dynamic, write: Dynamic): Dynamic {
      pendingWrites.set(key, write);
      if (timer !== null || closed) return;
      let value: Dynamic = measuredDelay - schedulerOptions.now();
      value <= 0 ? flushNext() : (timer = schedulerOptions.schedule(flushNext, value));
    },
    drop(key: Dynamic): Dynamic {
      pendingWrites.delete(key);
    },
    clear(): Dynamic {
      pendingWrites.clear();
      timer?.();
      timer = null;
    },
  };
}
export {
  createFastEditWriteScheduler,
  FAST_EDIT_WRITE_PACING,
};
export function installFastEditWriteScheduler(): () => void {
  return () => {
    FAST_EDIT_WRITE_PACING = {
      minMs: 140,
      charsPerMs: 100,
      timesMeasured: 5,
    };
  };
}

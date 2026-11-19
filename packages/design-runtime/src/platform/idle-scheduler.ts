/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var defaultIdleTimers: Dynamic;
var idleTaskScheduler: Dynamic;
function scheduleMessageChannelTask(run?: Dynamic): Dynamic {
  let channel: Dynamic = new MessageChannel(),
    active: Dynamic = true;
  channel.port1.onmessage = (): Dynamic => {
    channel.port1.close();
    active && run();
  };
  channel.port2.postMessage(null);
  return (): Dynamic => {
    active = false;
    channel.port1.close();
  };
}
export {
  idleTaskScheduler,
  defaultIdleTimers as PlatformIdleSchedulerRequestIdleCallbackCancelIdleCallbackImmediateConfig,
  scheduleMessageChannelTask,
};
export function installPlatformIdleScheduler(): () => void {
  return () => {
    defaultIdleTimers =
      {
        requestIdleCallback:
          typeof (globalThis as Dynamic).requestIdleCallback == "function"
            ? (run?: Dynamic, idleOptions?: Dynamic): Dynamic =>
                (globalThis as Dynamic).requestIdleCallback(run, idleOptions)
            : undefined,
        cancelIdleCallback: (idleCallbackId?: Dynamic): Dynamic =>
          (globalThis as Dynamic).cancelIdleCallback?.(idleCallbackId),
        immediate:
          typeof MessageChannel == "function"
            ? scheduleMessageChannelTask
            : undefined,
        setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
          (globalThis as Dynamic).setTimeout(run, delayMs),
        clearTimeout: (timeoutId?: Dynamic): Dynamic =>
          (globalThis as Dynamic).clearTimeout(timeoutId),
      };
    idleTaskScheduler = class IdleTaskScheduler {
      constructor(
        work: Dynamic,
        timeoutMs: Dynamic = 1e3,
        timers: Dynamic = defaultIdleTimers,
      ) {
        this.work = work;
        this.timeoutMs = timeoutMs;
        this.timers = timers;
      }
      work: Dynamic;
      timeoutMs: Dynamic;
      timers: Dynamic;
      items: Dynamic = [];
      cancel: Dynamic = null;
      get pending(): Dynamic {
        return this.items;
      }
      add(items: Dynamic, queueOptions: Dynamic): Dynamic {
        let uniqueItems: Dynamic = [...new Set(items)];
        this.items = queueOptions?.front
          ? [
              ...uniqueItems,
              ...this.items.filter(
                (item?: Dynamic): Dynamic => !uniqueItems.includes(item),
              ),
            ]
          : [
              ...this.items,
              ...uniqueItems.filter(
                (item?: Dynamic): Dynamic => !this.items.includes(item),
              ),
            ];
        (this.schedule as Dynamic)();
      }
      retain(shouldKeep: Dynamic): Dynamic {
        this.items = this.items.filter(shouldKeep);
      }
      dispose(): Dynamic {
        this.cancel?.();
        this.cancel = null;
        this.items = [];
      }
      static MIN_SLICE_MS: Dynamic = 10;
      schedule(previousDeadline: Dynamic): Dynamic {
        if (this.cancel !== null || this.items.length === 0) return;
        let idleSliceEnded: Dynamic = (deadline?: Dynamic): Dynamic =>
            deadline.didTimeout || deadline.timeRemaining() <= IdleTaskScheduler.MIN_SLICE_MS,
          runNextItem: Dynamic = (
            deadline?: Dynamic,
            respectDeadline: Dynamic = false,
          ): Dynamic => {
            this.cancel = null;
            if (respectDeadline && deadline !== undefined && idleSliceEnded(deadline))
              return (this.schedule as Dynamic)();
            let item: Dynamic = this.items.shift();
            try {
              item !== undefined && this.work(item);
            } finally {
              this.schedule(deadline);
            }
          },
          timers: Dynamic = this.timers;
        if (previousDeadline !== undefined && !idleSliceEnded(previousDeadline)) {
          if (timers.immediate !== undefined)
            this.cancel = timers.immediate(
              (): Dynamic => runNextItem(previousDeadline, true),
            );
          else {
            let timeoutId: Dynamic = timers.setTimeout(
              (): Dynamic => runNextItem(previousDeadline, true),
              0,
            );
            this.cancel = (): Dynamic => timers.clearTimeout(timeoutId);
          }
        } else if (typeof timers.requestIdleCallback == "function") {
          let idleCallbackId: Dynamic = timers.requestIdleCallback(runNextItem, {
            timeout: this.timeoutMs,
          });
          this.cancel = (): Dynamic => timers.cancelIdleCallback?.(idleCallbackId);
        } else {
          let timeoutId: Dynamic = timers.setTimeout(
            (): Dynamic => runNextItem(),
            0,
          );
          this.cancel = (): Dynamic => timers.clearTimeout(timeoutId);
        }
      }
    };
  };
}

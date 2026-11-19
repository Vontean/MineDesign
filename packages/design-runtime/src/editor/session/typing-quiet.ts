/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function createTypingQuietScheduler(host?: Dynamic): Dynamic {
  let activeBox: Dynamic = null,
    isDragLive: Dynamic = false,
    pendingKind: Dynamic = null,
    quietTimer: Dynamic,
    checkQuiet: Dynamic = (): Dynamic => {
      clearTimeout(quietTimer);
      if (!activeBox || pendingKind === null) return;
      let remainingMs: Dynamic = activeBox.beat + host.quietMs - Date.now();
      if (remainingMs > 0) {
        quietTimer = setTimeout(checkQuiet, remainingMs);
        return;
      }
      if (
        activeBox.asked === 0 &&
        activeBox.beat > 0 &&
        host.theirsOnItsWay?.() &&
        Date.now() - (activeBox.waits ||= Date.now()) < host.quietMs
      ) {
        quietTimer = setTimeout(checkQuiet, 100);
        return;
      }
      if (activeBox.asked === 2) return closeBoxNow();
      activeBox.asked++;
      activeBox.beat = Date.now();
      host.closeBox().then(checkQuiet, checkQuiet);
    },
    flushPending: Dynamic = (): Dynamic => {
      if (activeBox || isDragLive || pendingKind === null) return;
      let flushedKind: Dynamic = pendingKind;
      pendingKind = null;
      host.give(flushedKind);
    },
    requestSync: Dynamic = (kind?: Dynamic): Dynamic => {
      let wasIdle: Dynamic = pendingKind === null;
      (wasIdle || kind === "rebuild") && (pendingKind = kind);
      wasIdle && activeBox && !host.caretInFrame() && (activeBox.beat = 0);
      wasIdle && checkQuiet();
    },
    closeBoxNow: Dynamic = (): Dynamic => {
      clearTimeout(quietTimer);
      activeBox = null;
      flushPending();
    };
  return {
    boxOpen(): Dynamic {
      activeBox = {
        shown: activeBox?.shown ?? null,
        newBox: activeBox?.newBox ?? null,
        beat: Date.now(),
        asked: 0,
        waits: 0,
      };
    },
    beat(): Dynamic {
      activeBox &&
        (activeBox = {
          ...activeBox,
          beat: Date.now(),
          asked: 0,
          waits: 0,
        });
    },
    boxClosed: closeBoxNow,
    dragLive(isDragging: Dynamic): Dynamic {
      isDragLive = isDragging;
      flushPending();
    },
    gone(): Dynamic {
      isDragLive = false;
      closeBoxNow();
    },
    replaced(shownBox: Dynamic, newBox: Dynamic = null): Dynamic {
      !activeBox ||
        !shownBox ||
        (activeBox.shown || (activeBox.newBox = newBox),
        (activeBox.shown ??= shownBox),
        requestSync("push"));
    },
    shown: (): Dynamic => activeBox?.shown ?? null,
    newBox: (): Dynamic => activeBox?.newBox ?? null,
    holds(kind: Dynamic): Dynamic {
      return (kind === "push" ? !activeBox?.shown : !activeBox && !isDragLive)
        ? false
        : (requestSync(kind), true);
    },
    owes: (): Dynamic => pendingKind !== null,
  };
}
export {
  createTypingQuietScheduler,
};
export function installEditorSessionTypingQuiet(): () => void {
  return () => {};
}

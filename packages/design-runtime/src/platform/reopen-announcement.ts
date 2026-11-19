/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var AppifactReopenedKey: Dynamic;
function scheduleTypingAwareAnnouncement(announcement?: Dynamic): Dynamic {
  let timers: Dynamic = announcement.timers,
    leadMs: Dynamic = announcement.leadMs ?? 2500,
    typingDeadlineMs: Dynamic = leadMs + (announcement.maxHoldMs ?? 15e3),
    announcedAt: Dynamic = timers.now();
  try {
    announcement.say(announcement.message);
  } catch {}
  let isTyping: Dynamic = (): Dynamic => {
      try {
        return announcement.isTyping?.() === true;
      } catch {
        return false;
      }
    },
    hasUnsentEdits: Dynamic = (): Dynamic => {
      try {
        return announcement.hasUnsentEdits?.() === true;
      } catch {
        return false;
      }
    };
  return new Promise((resolve?: Dynamic): Dynamic => {
    let reopen: Dynamic = (): Dynamic => {
        if (announcement.note !== undefined)
          try {
            announcement.note.store?.setItem(
              AppifactReopenedKey,
              JSON.stringify({
                why: announcement.note.why,
                at: timers.now(),
                ...(announcement.note.focus !== undefined
                  ? {
                      focus: announcement.note.focus,
                    }
                  : {}),
              }),
            );
          } catch {}
        try {
          announcement.reopen();
        } finally {
          resolve();
        }
      },
      checkReopen: Dynamic = (): Dynamic => {
        let elapsedMs: Dynamic = timers.now() - announcedAt;
        if (
          elapsedMs >= leadMs &&
          !hasUnsentEdits() &&
          (!isTyping() || elapsedMs >= typingDeadlineMs)
        ) {
          reopen();
          return;
        }
        timers.setTimeout(
          checkReopen,
          elapsedMs < leadMs ? Math.min(leadMs - elapsedMs, 250) : 250,
        );
      };
    checkReopen();
  });
}
function consumeReopenMessage(storage?: Dynamic, now?: Dynamic): Dynamic {
  let value: Dynamic = null;
  try {
    value = storage?.getItem(AppifactReopenedKey) ?? null;
  } catch {
    return;
  }
  if (value !== null) {
    try {
      storage?.removeItem(AppifactReopenedKey);
    } catch {}
    try {
      let note: Dynamic = JSON.parse(value);
      return note === null ||
        typeof note.why != "string" ||
        typeof note.at != "number" ||
        now - note.at > 6e4 ||
        now < note.at - 1e3
        ? undefined
        : {
            why: note.why,
            at: note.at,
            ...(typeof note.focus == "string"
              ? {
                  focus: note.focus,
                }
              : {}),
          };
    } catch {
      return;
    }
  }
}
function announceReopenedArtifact(announcement?: Dynamic): Dynamic {
  let value: Dynamic = consumeReopenMessage(announcement.store, announcement.now);
  if (value === undefined) return false;
  try {
    announcement.focus(value.focus);
  } catch {}
  try {
    announcement.say(announcement.message(value));
  } catch {}
  return true;
}
export {
  announceReopenedArtifact,
  AppifactReopenedKey,
  consumeReopenMessage,
  scheduleTypingAwareAnnouncement,
};
export function installPlatformReopenAnnouncement(): () => void {
  return () => {
    AppifactReopenedKey = "appifact-reopened";
  };
}

import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactForUiColorPicker: typeof React;
var reactLC: typeof React;
var jsxForUiAnnouncements: typeof import("react/jsx-runtime");
var liveAnnouncementListeners: Set<C.AnnouncementListener>;
var ANNOUNCEMENT_SETTLE_MS: number;
var ANNOUNCEMENT_CLEAR_MS: number;
var MAX_ANNOUNCEMENT_LENGTH: number;
function announceLiveMessage(
  message: C.AnnouncementMessage,
  announcementOptions: C.AnnouncementOptions = {},
) {
  for (let value of liveAnnouncementListeners) {
    value(message, announcementOptions);
  }
}
function subscribeLiveAnnouncements(listener: C.AnnouncementListener) {
  liveAnnouncementListeners.add(listener);
  return () => {
    liveAnnouncementListeners.delete(listener);
  };
}
function LiveAnnouncer({
  settleMs = ANNOUNCEMENT_SETTLE_MS,
  clearMs = ANNOUNCEMENT_CLEAR_MS,
}: C.LiveAnnouncerProps) {
  useUiLocale();
  let [announcementText, setAnnouncementText] = reactLC.useState("");
  reactLC.useEffect(() => {
    let settleTimer: ReturnType<typeof setTimeout> | undefined,
      pendingIfIdle = false,
      clearTimer: ReturnType<typeof setTimeout> | undefined,
      unsubscribe = subscribeLiveAnnouncements(
        (message: C.AnnouncementMessage, announcementOptions: C.AnnouncementOptions) => {
          if (settleTimer !== undefined) {
            if (announcementOptions.ifIdle && !pendingIfIdle) {
              return;
            }
            clearTimeout(settleTimer);
          }
          pendingIfIdle = announcementOptions.ifIdle === true;
          if (clearTimer !== undefined) {
            clearTimeout(clearTimer);
          }
          clearTimer = undefined;
          setAnnouncementText("");
          settleTimer = setTimeout(() => {
            settleTimer = undefined;
            let resolvedMessage = typeof message === "function" ? message() : message;
            if (resolvedMessage == null || resolvedMessage === "") {
              return;
            }
            let displayText =
              resolvedMessage.length > MAX_ANNOUNCEMENT_LENGTH
                ? resolvedMessage
                    .slice(0, MAX_ANNOUNCEMENT_LENGTH - 1)
                    .replace(/[\uD800-\uDBFF]$/, "") + "…"
                : resolvedMessage;
            setAnnouncementText(displayText);
            clearTimer = setTimeout(() => {
              clearTimer = undefined;
              setAnnouncementText("");
            }, clearMs);
          }, settleMs);
        },
      );
    return () => {
      unsubscribe();
      if (settleTimer !== undefined) {
        clearTimeout(settleTimer);
      }
      if (clearTimer !== undefined) {
        clearTimeout(clearTimer);
      }
    };
  }, [settleMs, clearMs]);
  return (
    <span
      className={"sr-only"}
      role={"status"}
      aria-live={"polite"}
      aria-atomic={"true"}
      data-kit={"live-announcer"}
    >
      {announcementText}
    </span>
  );
}
export {
  announceLiveMessage,
  ANNOUNCEMENT_CLEAR_MS,
  ANNOUNCEMENT_SETTLE_MS,
  jsxForUiAnnouncements,
  liveAnnouncementListeners,
  LiveAnnouncer,
  MAX_ANNOUNCEMENT_LENGTH,
  reactForUiColorPicker,
  reactLC,
  subscribeLiveAnnouncements,
};
export function installUiAnnouncements(): () => void {
  return () => {
    reactForUiColorPicker = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactLC = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiAnnouncements = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    liveAnnouncementListeners = new Set();
    ANNOUNCEMENT_SETTLE_MS = 350;
    ANNOUNCEMENT_CLEAR_MS = 5000;
    MAX_ANNOUNCEMENT_LENGTH = 120;
  };
}

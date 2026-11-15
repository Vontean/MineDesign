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
  input: C.AnnouncementMessage,
  options: C.AnnouncementOptions = {},
) {
  for (let value of liveAnnouncementListeners) {
    value(input, options);
  }
}
function subscribeLiveAnnouncements(input: C.AnnouncementListener) {
  liveAnnouncementListeners.add(input);
  return () => {
    liveAnnouncementListeners.delete(input);
  };
}
function LiveAnnouncer({
  settleMs = ANNOUNCEMENT_SETTLE_MS,
  clearMs = ANNOUNCEMENT_CLEAR_MS,
}: C.LiveAnnouncerProps) {
  useUiLocale();
  let [value, value2] = reactLC.useState("");
  reactLC.useEffect(() => {
    let value3: ReturnType<typeof setTimeout> | undefined,
      flag = false,
      value4: ReturnType<typeof setTimeout> | undefined,
      value5 = subscribeLiveAnnouncements(
        (input: C.AnnouncementMessage, options: C.AnnouncementOptions) => {
          if (value3 !== undefined) {
            if (options.ifIdle && !flag) {
              return;
            }
            clearTimeout(value3);
          }
          flag = options.ifIdle === true;
          if (value4 !== undefined) {
            clearTimeout(value4);
          }
          value4 = undefined;
          value2("");
          value3 = setTimeout(() => {
            value3 = undefined;
            let value6 = typeof input === "function" ? input() : input;
            if (value6 == null || value6 === "") {
              return;
            }
            let value7 =
              value6.length > MAX_ANNOUNCEMENT_LENGTH
                ? value6
                    .slice(0, MAX_ANNOUNCEMENT_LENGTH - 1)
                    .replace(/[\uD800-\uDBFF]$/, "") + "…"
                : value6;
            value2(value7);
            value4 = setTimeout(() => {
              value4 = undefined;
              value2("");
            }, clearMs);
          }, settleMs);
        },
      );
    return () => {
      value5();
      if (value3 !== undefined) {
        clearTimeout(value3);
      }
      if (value4 !== undefined) {
        clearTimeout(value4);
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
      {value}
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
    reactForUiColorPicker = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    reactLC = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxForUiAnnouncements = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    liveAnnouncementListeners = new Set();
    ANNOUNCEMENT_SETTLE_MS = 350;
    ANNOUNCEMENT_CLEAR_MS = 5000;
    MAX_ANNOUNCEMENT_LENGTH = 120;
  };
}

import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactAccessibilityAnnouncer: Dynamic;
var reactAccessibilityAnnouncer_2: Dynamic;
var jsxAccessibilityAnnouncer: Dynamic;
var AccessibilityAnnouncerSubscribers: Dynamic;
var AccessibilityAnnouncerConstant: Dynamic;
var defaultClearMs: Dynamic;
var AccessibilityAnnouncerLimit: Dynamic;
function announce(message?: Dynamic, announceOptions: Dynamic = {}): Dynamic {
  for (let subscriber of AccessibilityAnnouncerSubscribers as Dynamic)
    subscriber(message, announceOptions);
}
function subscribeAnnouncements(subscriber?: Dynamic): Dynamic {
  AccessibilityAnnouncerSubscribers.add(subscriber);
  return (): Dynamic => {
    AccessibilityAnnouncerSubscribers.delete(subscriber);
  };
}
function ScreenReaderAnnouncer({
  settleMs = AccessibilityAnnouncerConstant,
  clearMs = defaultClearMs,
}: Dynamic): Dynamic {
  useUiLocale();
  let [announcement, setAnnouncement]: Dynamic = (0, reactAccessibilityAnnouncer_2.useState)(
    "",
  );
  (0, reactAccessibilityAnnouncer_2.useEffect)((): Dynamic => {
    let settleTimer: Dynamic,
      isIdleOnlyPending: Dynamic = false,
      clearTimer: Dynamic,
      unsubscribe: Dynamic = subscribeAnnouncements(
        (message?: Dynamic, announceOptions?: Dynamic): Dynamic => {
          if (settleTimer !== undefined) {
            if (announceOptions.ifIdle && !isIdleOnlyPending) return;
            clearTimeout(settleTimer);
          }
          isIdleOnlyPending = announceOptions.ifIdle === true;
          clearTimer !== undefined && clearTimeout(clearTimer);
          clearTimer = undefined;
          setAnnouncement("");
          settleTimer = setTimeout((): Dynamic => {
            settleTimer = undefined;
            let messageText: Dynamic =
              typeof message == "function" ? message() : message;
            if (messageText == null || messageText === "") return;
            let displayText: Dynamic =
              messageText.length > AccessibilityAnnouncerLimit
                ? messageText
                    .slice(0, AccessibilityAnnouncerLimit - 1)
                    .replace(/[\uD800-\uDBFF]$/, "") + "\u2026"
                : messageText;
            setAnnouncement(displayText);
            clearTimer = setTimeout((): Dynamic => {
              clearTimer = undefined;
              setAnnouncement("");
            }, clearMs);
          }, settleMs);
        },
      );
    return (): Dynamic => {
      unsubscribe();
      settleTimer !== undefined && clearTimeout(settleTimer);
      clearTimer !== undefined && clearTimeout(clearTimer);
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
      {announcement}
    </span>
  );
}
export {
  AccessibilityAnnouncerConstant,
  defaultClearMs as AccessibilityAnnouncerConstant_2,
  AccessibilityAnnouncerLimit,
  AccessibilityAnnouncerSubscribers,
  announce,
  jsxAccessibilityAnnouncer,
  reactAccessibilityAnnouncer,
  reactAccessibilityAnnouncer_2,
  ScreenReaderAnnouncer,
  subscribeAnnouncements,
};
export function installEditorAccessibilityAnnouncer(): () => void {
  return () => {
    reactAccessibilityAnnouncer = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactAccessibilityAnnouncer_2 = toModuleNamespace(
      load_react(),
      1,
    );
    jsxAccessibilityAnnouncer = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    AccessibilityAnnouncerSubscribers = new Set();
    AccessibilityAnnouncerConstant = 350;
    defaultClearMs = 5e3;
    AccessibilityAnnouncerLimit = 120;
  };
}

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
var AccessibilityAnnouncerConstant_2: Dynamic;
var AccessibilityAnnouncerLimit: Dynamic;
function announce(input?: Dynamic, options: Dynamic = {}): Dynamic {
  for (let value of AccessibilityAnnouncerSubscribers as Dynamic)
    value(input, options);
}
function subscribeAnnouncements(input?: Dynamic): Dynamic {
  AccessibilityAnnouncerSubscribers.add(input);
  return (): Dynamic => {
    AccessibilityAnnouncerSubscribers.delete(input);
  };
}
function ScreenReaderAnnouncer({
  settleMs = AccessibilityAnnouncerConstant,
  clearMs = AccessibilityAnnouncerConstant_2,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0, reactAccessibilityAnnouncer_2.useState)(
    "",
  );
  (0, reactAccessibilityAnnouncer_2.useEffect)((): Dynamic => {
    let value3: Dynamic,
      flag: Dynamic = false,
      value4: Dynamic,
      value5: Dynamic = subscribeAnnouncements(
        (input?: Dynamic, options?: Dynamic): Dynamic => {
          if (value3 !== undefined) {
            if (options.ifIdle && !flag) return;
            clearTimeout(value3);
          }
          flag = options.ifIdle === true;
          value4 !== undefined && clearTimeout(value4);
          value4 = undefined;
          value2("");
          value3 = setTimeout((): Dynamic => {
            value3 = undefined;
            let value6: Dynamic =
              typeof input == "function" ? input() : input;
            if (value6 == null || value6 === "") return;
            let value7: Dynamic =
              value6.length > AccessibilityAnnouncerLimit
                ? value6
                    .slice(0, AccessibilityAnnouncerLimit - 1)
                    .replace(/[\uD800-\uDBFF]$/, "") + "\u2026"
                : value6;
            value2(value7);
            value4 = setTimeout((): Dynamic => {
              value4 = undefined;
              value2("");
            }, clearMs);
          }, settleMs);
        },
      );
    return (): Dynamic => {
      value5();
      value3 !== undefined && clearTimeout(value3);
      value4 !== undefined && clearTimeout(value4);
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
  AccessibilityAnnouncerConstant,
  AccessibilityAnnouncerConstant_2,
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
    reactAccessibilityAnnouncer = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    reactAccessibilityAnnouncer_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    jsxAccessibilityAnnouncer = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    AccessibilityAnnouncerSubscribers = new Set();
    AccessibilityAnnouncerConstant = 350;
    AccessibilityAnnouncerConstant_2 = 5e3;
    AccessibilityAnnouncerLimit = 120;
  };
}

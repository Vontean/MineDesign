import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComponentsSkeletonAssignValue } from "../../cds/components/skeleton";
import { Spinner } from "../../cds/components/spinner";
import { TextLink } from "../../cds/components/text-link";
import { AccessibilityAnnouncerConstant_2 } from "../accessibility/announcer";
import { joinClassNames } from "./overlay-state";
import { jsxSessionStripReveal_2, reactSessionStripReveal_2 } from "../session-strip/reveal";

var ChromeLoadingLabel: Dynamic;
var ChromeLoadingDelayMs: Dynamic;
function ChromeSkeleton({ className: className }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span aria-hidden={"true"} className={"contents"}>
      <ComponentsSkeletonAssignValue
        className={joinClassNames("block", className)}
      />
    </span>
  );
}
function ChromeTextSkeleton({ chars = 12 }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span aria-hidden={"true"} className={"contents"}>
      <ComponentsSkeletonAssignValue
        width={String(chars) + "ch"}
        className={"inline-block align-baseline"}
      />
    </span>
  );
}
function ChromeLoadingSpinner({ className: className }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span className={joinClassNames("inline-flex", className)}>
      <Spinner label={uiMessage("inspector.loading.loading")} />
    </span>
  );
}
function DocumentLoadGate({
  doc: doc,
  skeleton: skeleton,
  skeletonFlush: skeletonFlush,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let callback: Dynamic = (): Dynamic => {
      let value8: Dynamic =
        typeof doc.loadState == "function" ? doc.loadState() : "live";
      return value8 === "loading" || value8 === "failed" ? value8 : "live";
    },
    [value, value2]: Dynamic = (0,
    reactSessionStripReveal_2.useState)(callback),
    [value3, value4]: Dynamic = (0,
    reactSessionStripReveal_2.useState)(""),
    value5: Dynamic = (0, reactSessionStripReveal_2.useRef)(null),
    value6: Dynamic = (0, reactSessionStripReveal_2.useRef)(false),
    value7: Dynamic = (0, reactSessionStripReveal_2.useRef)(true);
  (0, reactSessionStripReveal_2.useEffect)(
    (): Dynamic => (
      (value6.current = false),
      (value7.current = true),
      value2(callback()),
      doc.subscribeLoad?.((): Dynamic => {
        let value8: Dynamic = callback();
        value8 === "loading" &&
          value5.current !== null &&
          (value6.current =
            (document as Dynamic).activeElement === value5.current);
        value2(value8);
      })
    ),
    [doc],
  );
  (0, reactSessionStripReveal_2.useEffect)((): Dynamic => {
    if (value !== "failed") {
      value === "live" && ((value6.current = false), (value7.current = true));
      value4("");
      return;
    }
    let activeElement: Dynamic = (document as Dynamic).activeElement,
      value8: Dynamic =
        (document as Dynamic).hasFocus() &&
        (activeElement === null ||
          activeElement === (document as Dynamic).body ||
          activeElement === (document as Dynamic).documentElement);
    value6.current &&
      value8 &&
      value5.current?.focus({
        preventScroll: true,
      });
    if (!value7.current) return;
    let value9: Dynamic = setTimeout((): Dynamic => {
        value7.current = false;
        value4(ChromeLoadingLabel);
      }, ChromeLoadingDelayMs),
      value10: Dynamic = setTimeout(
        (): Dynamic => value4(""),
        ChromeLoadingDelayMs + AccessibilityAnnouncerConstant_2,
      );
    return (): Dynamic => {
      clearTimeout(value9);
      clearTimeout(value10);
    };
  }, [value]);
  return value === "live" ? (
    <jsxSessionStripReveal_2.Fragment>
      {children}
    </jsxSessionStripReveal_2.Fragment>
  ) : (
    <div
      className={joinClassNames(
        "mc-loadgate relative h-full min-h-40 w-full",
        !(skeletonFlush && skeleton != null) &&
          "pt-[var(--tb-overlay-h,0px)]",
      )}
      aria-busy={value === "loading"}
    >
      {skeleton ?? (<ChromeSkeleton className={"m-6 h-48 rounded-lg"} />)}
      <span
        className={"sr-only"}
        role={"status"}
        aria-live={"polite"}
        aria-atomic={"true"}
        data-kit={"load-status"}
      >
        {value3}
      </span>
      <div
        className={
          "pointer-events-none absolute inset-x-0 top-[calc(var(--tb-overlay-h,0px)+1rem)] flex justify-center"
        }
      >
        {value === "loading" ? (<ChromeLoadingSpinner />) : (<span
            className={
              "pointer-events-auto inline-flex items-center gap-2 rounded-md border border-border-line bg-panel px-3 py-1.5 text-xs text-fg-muted shadow-sm"
            }
          >
            {ChromeLoadingLabel}
            <TextLink
              ref={value5}
              onClick={(): Dynamic => {
                value7.current = true;
                doc.save?.();
              }}
            >
              {uiMessage("inspector.loading.retry")}
            </TextLink>
          </span>)}
      </div>
    </div>
  );
}
export {
  ChromeLoadingDelayMs,
  ChromeLoadingLabel,
  ChromeLoadingSpinner,
  ChromeSkeleton,
  ChromeTextSkeleton,
  DocumentLoadGate,
};
export function installEditorChromeLoading(): () => void {
  return () => {
    ChromeLoadingLabel = uiMessage("inspector.loading.theLatestContentFailedTo");
    ChromeLoadingDelayMs = 100;
  };
}

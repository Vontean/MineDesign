import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComponentsSkeletonAssignValue } from "../../cds/components/skeleton";
import { Spinner } from "../../cds/components/spinner";
import { TextLink } from "../../cds/components/text-link";
import { AccessibilityAnnouncerConstant_2 as announcerClearMs } from "../accessibility/announcer";
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
  let readLoadState: Dynamic = (): Dynamic => {
      let state: Dynamic =
        typeof doc.loadState == "function" ? doc.loadState() : "live";
      return state === "loading" || state === "failed" ? state : "live";
    },
    [loadState, setLoadState]: Dynamic = (0,
    reactSessionStripReveal_2.useState)(readLoadState),
    [statusMessage, setStatusMessage]: Dynamic = (0,
    reactSessionStripReveal_2.useState)(""),
    retryLinkRef: Dynamic = (0, reactSessionStripReveal_2.useRef)(null),
    hadRetryFocusRef: Dynamic = (0, reactSessionStripReveal_2.useRef)(false),
    shouldAnnounceRef: Dynamic = (0, reactSessionStripReveal_2.useRef)(true);
  (0, reactSessionStripReveal_2.useEffect)(
    (): Dynamic => (
      (hadRetryFocusRef.current = false),
      (shouldAnnounceRef.current = true),
      setLoadState(readLoadState()),
      doc.subscribeLoad?.((): Dynamic => {
        let nextState: Dynamic = readLoadState();
        nextState === "loading" &&
          retryLinkRef.current !== null &&
          (hadRetryFocusRef.current =
            (document as Dynamic).activeElement === retryLinkRef.current);
        setLoadState(nextState);
      })
    ),
    [doc],
  );
  (0, reactSessionStripReveal_2.useEffect)((): Dynamic => {
    if (loadState !== "failed") {
      loadState === "live" && ((hadRetryFocusRef.current = false), (shouldAnnounceRef.current = true));
      setStatusMessage("");
      return;
    }
    let activeElement: Dynamic = (document as Dynamic).activeElement,
      isFocusLost: Dynamic =
        (document as Dynamic).hasFocus() &&
        (activeElement === null ||
          activeElement === (document as Dynamic).body ||
          activeElement === (document as Dynamic).documentElement);
    hadRetryFocusRef.current &&
      isFocusLost &&
      retryLinkRef.current?.focus({
        preventScroll: true,
      });
    if (!shouldAnnounceRef.current) return;
    let announceTimer: Dynamic = setTimeout((): Dynamic => {
        shouldAnnounceRef.current = false;
        setStatusMessage(ChromeLoadingLabel);
      }, ChromeLoadingDelayMs),
      clearTimer: Dynamic = setTimeout(
        (): Dynamic => setStatusMessage(""),
        ChromeLoadingDelayMs + announcerClearMs,
      );
    return (): Dynamic => {
      clearTimeout(announceTimer);
      clearTimeout(clearTimer);
    };
  }, [loadState]);
  return loadState === "live" ? (
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
      aria-busy={loadState === "loading"}
    >
      {skeleton ?? (<ChromeSkeleton className={"m-6 h-48 rounded-lg"} />)}
      <span
        className={"sr-only"}
        role={"status"}
        aria-live={"polite"}
        aria-atomic={"true"}
        data-kit={"load-status"}
      >
        {statusMessage}
      </span>
      <div
        className={
          "pointer-events-none absolute inset-x-0 top-[calc(var(--tb-overlay-h,0px)+1rem)] flex justify-center"
        }
      >
        {loadState === "loading" ? (<ChromeLoadingSpinner />) : (<span
            className={
              "pointer-events-auto inline-flex items-center gap-2 rounded-md border border-border-line bg-panel px-3 py-1.5 text-xs text-fg-muted shadow-sm"
            }
          >
            {ChromeLoadingLabel}
            <TextLink
              ref={retryLinkRef}
              onClick={(): Dynamic => {
                shouldAnnounceRef.current = true;
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

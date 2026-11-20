import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  ArtifactLoadState,
  ArtifactLoadBoundaryProps,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { ANNOUNCEMENT_CLEAR_MS } from "./announcements";
import { Spinner } from "./disclosure";
import { TextLink } from "./links";
import { joinClassNames } from "./property-icons";
import { SkeletonPrimitive } from "./skeleton";

var reactGQ: ReactNamespace;
var jsxForUiArtifactLoadBoundary: JsxNamespace;
var ARTIFACT_LOAD_FAILURE_MESSAGE: string;
var ARTIFACT_LOAD_DELAY_MS: number;
function ArtifactSkeleton({ className: className }: { className?: string }) {
  useUiLocale();
  return (
    <span aria-hidden={"true"} className={"contents"}>
      <SkeletonPrimitive
        className={joinClassNames("block", className)}
      />
    </span>
  );
}
function ArtifactLoadingSpinner({
  className: className,
}: {
  className?: string;
}) {
  useUiLocale();
  return (
    <span className={joinClassNames("inline-flex", className)}>
      <Spinner label={uiMessage("design-system.artifactLoadBoundary.loading")} />
    </span>
  );
}
function ArtifactLoadBoundary({
  doc: doc,
  skeleton: skeleton,
  skeletonFlush: skeletonFlush,
  children: children,
}: ArtifactLoadBoundaryProps) {
  useUiLocale();
  let readLoadState: () => ArtifactLoadState = () => {
      let documentLoadState =
        typeof doc.loadState === "function" ? doc.loadState() : "live";
      if (documentLoadState === "loading" || documentLoadState === "failed") {
        return documentLoadState;
      } else {
        return "live";
      }
    },
    [loadState, setLoadState] = reactGQ.useState(readLoadState),
    [announcement, setAnnouncement] = reactGQ.useState(""),
    retryButtonRef = reactGQ.useRef<HTMLElement | null>(null),
    wasRetryButtonFocusedRef = reactGQ.useRef(false),
    shouldAnnounceFailureRef = reactGQ.useRef(true);
  reactGQ.useEffect(() => {
    wasRetryButtonFocusedRef.current = false;
    shouldAnnounceFailureRef.current = true;
    setLoadState(readLoadState());
    return doc.subscribeLoad?.(() => {
      let nextLoadState = readLoadState();
      if (nextLoadState === "loading" && retryButtonRef.current !== null) {
        wasRetryButtonFocusedRef.current = document.activeElement === retryButtonRef.current;
      }
      setLoadState(nextLoadState);
    });
  }, [doc]);
  reactGQ.useEffect(() => {
    if (loadState !== "failed") {
      if (loadState === "live") {
        wasRetryButtonFocusedRef.current = false;
        shouldAnnounceFailureRef.current = true;
      }
      setAnnouncement("");
      return;
    }
    let activeElement = document.activeElement,
      canRestoreFocus =
        document.hasFocus() &&
        (activeElement === null ||
          activeElement === document.body ||
          activeElement === document.documentElement);
    if (wasRetryButtonFocusedRef.current && canRestoreFocus) {
      retryButtonRef.current?.focus({
        preventScroll: true,
      });
    }
    if (!shouldAnnounceFailureRef.current) {
      return;
    }
    let announcementTimer = setTimeout(() => {
        shouldAnnounceFailureRef.current = false;
        setAnnouncement(uiMessage("design-system.artifactLoadBoundary.theLatestContentFailedTo"));
      }, ARTIFACT_LOAD_DELAY_MS),
      clearTimer = setTimeout(
        () => setAnnouncement(""),
        ARTIFACT_LOAD_DELAY_MS + ANNOUNCEMENT_CLEAR_MS,
      );
    return () => {
      clearTimeout(announcementTimer);
      clearTimeout(clearTimer);
    };
  }, [loadState]);
  if (loadState === "live") {
    return (
      <jsxForUiArtifactLoadBoundary.Fragment>
        {children}
      </jsxForUiArtifactLoadBoundary.Fragment>
    );
  }
  return (
    <div
      className={joinClassNames(
        "mc-loadgate relative h-full min-h-40 w-full",
        !(skeletonFlush && skeleton != null) &&
          "pt-[var(--tb-overlay-h,0px)]",
      )}
      aria-busy={loadState === "loading"}
    >
      {[skeleton ?? <ArtifactSkeleton className={"m-6 h-48 rounded-lg"} />, <span
          className={"sr-only"}
          role={"status"}
          aria-live={"polite"}
          aria-atomic={"true"}
          data-kit={"load-status"}
        >
          {announcement}
        </span>, <div
          className={
            "pointer-events-none absolute inset-x-0 top-[calc(var(--tb-overlay-h,0px)+1rem)] flex justify-center"
          }
        >
          {loadState === "loading" ? (<ArtifactLoadingSpinner />) : (<span
              className={
                "pointer-events-auto inline-flex items-center gap-2 rounded-md border border-border-line bg-panel px-3 py-1.5 text-xs text-fg-muted shadow-sm"
              }
            >
              {[uiMessage("design-system.artifactLoadBoundary.theLatestContentFailedTo"), <TextLink
                  ref={retryButtonRef}
                  onClick={() => {
                    shouldAnnounceFailureRef.current = true;
                    doc.save?.();
                  }}
                >
                  {uiMessage("design-system.artifactLoadBoundary.retry")}
                </TextLink>]}
            </span>)}
        </div>]}
    </div>
  );
}
function get_ARTIFACT_LOAD_FAILURE_MESSAGE() {
  return uiMessage("design-system.artifactLoadBoundary.theLatestContentFailedTo");
}
export {
  ARTIFACT_LOAD_DELAY_MS,
  get_ARTIFACT_LOAD_FAILURE_MESSAGE,
  ArtifactLoadBoundary,
  ArtifactLoadingSpinner,
  ArtifactSkeleton,
  jsxForUiArtifactLoadBoundary,
  reactGQ,
};
export function installUiArtifactLoadBoundary(): () => void {
  return () => {
    reactGQ = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiArtifactLoadBoundary = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ARTIFACT_LOAD_FAILURE_MESSAGE = "The latest content failed to load";
    ARTIFACT_LOAD_DELAY_MS = 100;
  };
}

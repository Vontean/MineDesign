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
  let callback: () => ArtifactLoadState = () => {
      let value5 =
        typeof doc.loadState === "function" ? doc.loadState() : "live";
      if (value5 === "loading" || value5 === "failed") {
        return value5;
      } else {
        return "live";
      }
    },
    [value, value2] = reactGQ.useState(callback),
    [value3, value4] = reactGQ.useState(""),
    ref = reactGQ.useRef<HTMLElement | null>(null),
    ref2 = reactGQ.useRef(false),
    ref3 = reactGQ.useRef(true);
  reactGQ.useEffect(() => {
    ref2.current = false;
    ref3.current = true;
    value2(callback());
    return doc.subscribeLoad?.(() => {
      let value5 = callback();
      if (value5 === "loading" && ref.current !== null) {
        ref2.current = document.activeElement === ref.current;
      }
      value2(value5);
    });
  }, [doc]);
  reactGQ.useEffect(() => {
    if (value !== "failed") {
      if (value === "live") {
        ref2.current = false;
        ref3.current = true;
      }
      value4("");
      return;
    }
    let activeElement = document.activeElement,
      value5 =
        document.hasFocus() &&
        (activeElement === null ||
          activeElement === document.body ||
          activeElement === document.documentElement);
    if (ref2.current && value5) {
      ref.current?.focus({
        preventScroll: true,
      });
    }
    if (!ref3.current) {
      return;
    }
    let value6 = setTimeout(() => {
        ref3.current = false;
        value4(uiMessage("design-system.artifactLoadBoundary.theLatestContentFailedTo"));
      }, ARTIFACT_LOAD_DELAY_MS),
      value7 = setTimeout(
        () => value4(""),
        ARTIFACT_LOAD_DELAY_MS + ANNOUNCEMENT_CLEAR_MS,
      );
    return () => {
      clearTimeout(value6);
      clearTimeout(value7);
    };
  }, [value]);
  if (value === "live") {
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
      aria-busy={value === "loading"}
    >
      {[skeleton ?? <ArtifactSkeleton className={"m-6 h-48 rounded-lg"} />, <span
          className={"sr-only"}
          role={"status"}
          aria-live={"polite"}
          aria-atomic={"true"}
          data-kit={"load-status"}
        >
          {value3}
        </span>, <div
          className={
            "pointer-events-none absolute inset-x-0 top-[calc(var(--tb-overlay-h,0px)+1rem)] flex justify-center"
          }
        >
          {value === "loading" ? (<ArtifactLoadingSpinner />) : (<span
              className={
                "pointer-events-auto inline-flex items-center gap-2 rounded-md border border-border-line bg-panel px-3 py-1.5 text-xs text-fg-muted shadow-sm"
              }
            >
              {[uiMessage("design-system.artifactLoadBoundary.theLatestContentFailedTo"), <TextLink
                  ref={ref}
                  onClick={() => {
                    ref3.current = true;
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

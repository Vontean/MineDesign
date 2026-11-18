import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactPlatformReducedMotion: typeof React;
var reducedMotionMediaQuery: string;
var reducedMotionAttribute: string;
var initializePlatformReducedMotion: () => void;
var DurationSheetValue: string;
var PlatformReducedMotionCss: string;
var PlatformReducedMotionClassNames: string;
var PlatformReducedMotionCss_2: string;
var PlatformReducedMotionLabel: string;
var PlatformReducedMotionCss_3: string;
var PlatformReducedMotionCss_4: string;
var PlatformReducedMotionClassNames_2: string;
var PlatformReducedMotionClassNames_3: string;
var ClipPathInset00200vh0Value: string;
var PlatformReducedMotionLabel_2: string;
var initializePlatformReducedMotion_2: () => void;
export {
  ClipPathInset00200vh0Value,
  DurationSheetValue,
  initializePlatformReducedMotion,
  initializePlatformReducedMotion_2,
  PlatformReducedMotionClassNames,
  PlatformReducedMotionClassNames_2,
  PlatformReducedMotionClassNames_3,
  PlatformReducedMotionCss,
  PlatformReducedMotionCss_2,
  PlatformReducedMotionCss_3,
  PlatformReducedMotionCss_4,
  PlatformReducedMotionLabel,
  PlatformReducedMotionLabel_2,
  reactPlatformReducedMotion,
  reducedMotionAttribute,
  reducedMotionMediaQuery,
};
export function installCdsPlatformReducedMotion(): () => void {
  return () => {
    initializePlatformReducedMotion = initializeOnce(() => {
      "use client";

      reactPlatformReducedMotion = toModuleNamespace(
        load_react(),
      );
      reducedMotionMediaQuery = "(prefers-reduced-motion: reduce)";
      reducedMotionAttribute = "data-reduce-motion";
    });
    initializePlatformReducedMotion_2 = initializeOnce(() => {
      DurationSheetValue = "duration-sheet";
      PlatformReducedMotionCss = `${DurationSheetValue} ease-out motion-reduce:transition-none`;
      PlatformReducedMotionClassNames = "rounded-t-card rounded-b-none";
      PlatformReducedMotionCss_2 = `group/sheet relative w-full min-w-0 max-w-none overflow-hidden ${PlatformReducedMotionClassNames} pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-[translate,height,scale] ${PlatformReducedMotionCss} [&_[data-cds-sheet-scroll]]:overscroll-contain [&[data-cds-sheet-pressed]_[data-cds-sheet-scroll]]:[scroll-padding-block:0px]`;
      PlatformReducedMotionLabel = "calc(100% + 1.5rem)";
      PlatformReducedMotionCss_3 = `flex min-h-0 flex-1 flex-col transition-[translate] ${PlatformReducedMotionCss} group-data-[cds-sheet-drilled]/sheet:-translate-x-full rtl:group-data-[cds-sheet-drilled]/sheet:translate-x-full`;
      PlatformReducedMotionCss_4 = `draggable-none fixed inset-0 bg-backdrop transition-opacity ${PlatformReducedMotionCss} data-[starting-style]:opacity-0 data-[ending-style]:opacity-0`;
      PlatformReducedMotionClassNames_2 =
        "draggable-none fixed inset-0 bg-transparent";
      PlatformReducedMotionClassNames_3 =
        "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-surface-3";
      ClipPathInset00200vh0Value = "[clip-path:inset(0_0_-200vh_0)]";
      PlatformReducedMotionLabel_2 =
        "[&_[role=separator]]:-mx-1 [&_[role=separator]]:mt-0";
    });
  };
}

import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { createSafeMutationObserver, createSafeResizeObserver, getResizeObserverConstructor, initializeIconSupport, invokeAndReportError } from "./foundation";
import { cn, initializeClassNames, initializeSkeletonContexts, initializeTranslations, skeletonActiveContext, skeletonElementContext, skeletonGroupContext, skeletonShownStoreContext, useTranslation } from "./interactions";

var reactForUiSkeleton: typeof React;
var jsxForUiSkeleton: typeof import("react/jsx-runtime");
var skeletonElementTags: Record<C.SkeletonTag, C.SkeletonTag>;
var pendingShimmerElements: Set<Element>;
var shimmerStartTimes: WeakMap<Document, number>;
var skeletonNotShownSnapshot: C.SkeletonSnapshot;
var skeletonShownSnapshot: C.SkeletonSnapshot;
var SKELETON_BREATHE_ANIMATION: string;
var SKELETON_SWEEP_ANIMATION: string;
var SKELETON_ANIMATION_DURATION_MS: number;
var DEFAULT_SKELETON_MOTION: C.SkeletonMotion;
var SKELETON_MINIMUM_HOLD_MS: number;
var SKELETON_DURATION_LIMIT_MS: number;
var SKELETON_SYNC_TOLERANCE_MS: number;
var skeletonAnimationStartTimes: WeakMap<Document, number>;
var skeletonIconRowWidths: number[];
var skeletonTextRowWidths: number[];
var skeletonLineWidths: string[];
var SkeletonPrimitive: C.SkeletonComponent;
function isShimmerAnimation(animation: C.NamedAnimation): boolean {
  return animation.animationName === "cds-shimmer";
}
function synchronizeDocumentShimmers(ownerDocument: C.AnimationDocument): void {
  let value: number | undefined,
    items: C.NamedAnimation[] = [];
  for (let animation of ownerDocument.getAnimations()) {
    if (!isShimmerAnimation(animation)) {
      continue;
    }
    let { startTime: startTime } = animation;
    if (
      typeof startTime === "number" &&
      (value === undefined || startTime < value)
    ) {
      value = startTime;
    }
    let target = animation.effect?.target;
    if (
      target !== undefined &&
      target !== null &&
      pendingShimmerElements.has(target) &&
      animation.playState === "running"
    ) {
      items.push(animation);
    }
  }
  let synchronizedStartTime = value ?? shimmerStartTimes.get(ownerDocument) ?? 0;
  for (let animation of items) {
    animation.startTime = synchronizedStartTime;
  }
  shimmerStartTimes.set(ownerDocument, synchronizedStartTime);
}
function flushShimmerSynchronization() {
  try {
    let values = new Set<C.AnimationDocument>();
    for (let value of pendingShimmerElements) {
      values.add(value.ownerDocument);
    }
    for (let value of values) {
      synchronizeDocumentShimmers(value);
    }
  } finally {
    pendingShimmerElements.clear();
  }
}
function scheduleShimmerSynchronization(element: Element | null): void {
  if (
    element === null ||
    typeof element.ownerDocument.getAnimations !== "function"
  ) {
    return;
  }
  if (pendingShimmerElements.size === 0) {
    queueMicrotask(flushShimmerSynchronization);
  }
  pendingShimmerElements.add(element);
}
function createSkeletonShownStore(): C.SkeletonShownStore {
  let snapshot = skeletonNotShownSnapshot,
    listeners = new Set<() => void>(),
    setSnapshot = (nextSnapshot: C.SkeletonSnapshot) => {
      if (snapshot === nextSnapshot) {
        return;
      }
      snapshot = nextSnapshot;
      for (let value of listeners) {
        invokeAndReportError(value);
      }
    };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    markShown: () => setSnapshot(skeletonShownSnapshot),
    reset: () => setSnapshot(skeletonNotShownSnapshot),
  };
}
function markSkeletonShownAfterCallback(
  onShown: (() => void) | undefined,
  shownStore: C.SkeletonShownStore,
) {
  try {
    onShown?.();
  } finally {
    shownStore.markShown();
  }
}
function clearSkeletonElapsedStyle(element: HTMLElement): void {
  element.style.removeProperty("--cds-skel-elapsed");
}
function setSkeletonMotion(
  element: HTMLElement,
  motion: C.SkeletonMotion,
): void {
  element.dataset.motion = motion;
}
function ensurePositionedSkeletonHost(element: HTMLElement): boolean {
  let position = getComputedStyle(element).position;
  if (position === "static" || position === "") {
    element.style.position = "relative";
    return true;
  }
  return false;
}
function synchronizeSkeletonAnimation(
  element: C.AnimationElement,
  animationName = SKELETON_BREATHE_ANIMATION,
  startOffset = 0,
) {
  if (typeof element.getAnimations !== "function") {
    return;
  }
  let value = element
    .getAnimations()
    .find((animation: C.NamedAnimation) => animation.animationName === animationName);
  if (value === undefined || typeof value.startTime !== "number") {
    return;
  }
  let timing = value.effect?.getComputedTiming();
  if (
    timing?.duration !== SKELETON_ANIMATION_DURATION_MS ||
    timing.iterations !== 1 / 0
  ) {
    return;
  }
  let firstIterationStart = value.startTime + (timing.delay ?? 0),
    unshiftedStart = firstIterationStart - startOffset,
    ownerDocument = element.ownerDocument,
    entry = skeletonAnimationStartTimes.get(ownerDocument);
  if (entry === undefined) {
    skeletonAnimationStartTimes.set(ownerDocument, unshiftedStart);
    return;
  }
  let phaseDifference =
    (((unshiftedStart - entry) % SKELETON_ANIMATION_DURATION_MS) +
      SKELETON_ANIMATION_DURATION_MS) %
    SKELETON_ANIMATION_DURATION_MS;
  if (phaseDifference < SKELETON_SYNC_TOLERANCE_MS || phaseDifference > 1999) {
    return;
  }
  let currentTimelineTime =
      typeof value.currentTime === "number"
        ? value.startTime + value.currentTime
        : firstIterationStart,
    nextCycle = Math.ceil(
      (Math.max(currentTimelineTime, firstIterationStart) - (entry + startOffset)) /
        SKELETON_ANIMATION_DURATION_MS,
    );
  value.startTime =
    entry +
    startOffset +
    nextCycle * SKELETON_ANIMATION_DURATION_MS -
    (timing.delay ?? 0);
}
function SkeletonGroup({
  children: children,
  hold = "delayed",
  label: label,
  className: className,
  decorative = false,
  onShown: onShown,
  onHidden: onHidden,
  as: as2,
  motion = DEFAULT_SKELETON_MOTION,
}: C.SkeletonGroupProps) {
  useUiLocale();
  let value = reactForUiSkeleton.useContext<boolean>(
      skeletonActiveContext,
    ),
    inheritedTag = reactForUiSkeleton.useContext<C.SkeletonTag>(
      skeletonElementContext,
    ),
    [tag] = reactForUiSkeleton.useState(as2 ?? inheritedTag),
    groupTagName = skeletonElementTags[tag],
    isInlineTag = tag === "span",
    groupStartedAt = reactForUiSkeleton.useContext<number | null>(
      skeletonGroupContext,
    ),
    parentShownStore = reactForUiSkeleton.useContext<C.SkeletonShownStore | null>(
      skeletonShownStoreContext,
    ),
    [shownStore] = reactForUiSkeleton.useState(() => {
      let store = createSkeletonShownStore();
      if (value ? parentShownStore?.getSnapshot().shown === true : hold !== "delayed") {
        store.markShown();
      }
      return store;
    }),
    [initialGroupStartedAt] = reactForUiSkeleton.useState(groupStartedAt),
    [becameRoot, setBecameRoot] = reactForUiSkeleton.useState(false),
    ref = reactForUiSkeleton.useRef(false),
    isNested = value && !becameRoot,
    callback = reactForUiSkeleton.useCallback(
      (element: HTMLElement | null) => {
        if (
          element !== null &&
          element.parentElement !== null &&
          element.parentElement.closest('[data-cds="SkeletonGroup"]') === null
        ) {
          ref.current = true;
          shownStore.reset();
          setBecameRoot(true);
        }
      },
      [shownStore],
    ),
    defaultLoadingLabel: string = useTranslation("loading", "Loading"),
    [initialHold] = reactForUiSkeleton.useState(hold),
    delaysReveal = initialHold === "delayed",
    loadingLabel = label ?? defaultLoadingLabel,
    hostRef = reactForUiSkeleton.useRef<HTMLElement>(null),
    attachHost = reactForUiSkeleton.useCallback(
      (element: HTMLElement | null) => {
        hostRef.current = element;
      },
      [],
    ),
    hasShownRef = reactForUiSkeleton.useRef(false),
    lifecycleRef = reactForUiSkeleton.useRef({
      onShown: onShown,
      onHidden: onHidden,
      labelText: loadingLabel,
    });
  reactForUiSkeleton.useEffect(() => {
    lifecycleRef.current = {
      onShown: onShown,
      onHidden: onHidden,
      labelText: loadingLabel,
    };
    if (hasShownRef.current && hostRef.current !== null) {
      let element = hostRef.current.querySelector("[data-skeleton-label]");
      if (element !== null && element.textContent !== loadingLabel) {
        element.textContent = loadingLabel;
      }
    }
  }, [onShown, onHidden, loadingLabel, decorative]);
  reactForUiSkeleton.useLayoutEffect(() => {
    if (!isNested && !delaysReveal && !hasShownRef.current) {
      hasShownRef.current = true;
      markSkeletonShownAfterCallback(lifecycleRef.current.onShown, shownStore);
    }
  }, [isNested, delaysReveal, shownStore]);
  reactForUiSkeleton.useLayoutEffect(() => {
    if (!isNested || ref.current || parentShownStore === null) {
      return;
    }
    let syncParentShown = () => {
      if (!parentShownStore.getSnapshot().shown) {
        shownStore.reset();
      } else if (!hasShownRef.current) {
        hasShownRef.current = true;
        markSkeletonShownAfterCallback(lifecycleRef.current.onShown, shownStore);
      } else {
        shownStore.markShown();
      }
    };
    syncParentShown();
    return parentShownStore.subscribe(syncParentShown);
  }, [isNested, parentShownStore, shownStore]);
  reactForUiSkeleton.useEffect(
    () => () => {
      if (hasShownRef.current) {
        lifecycleRef.current.onHidden?.();
        hasShownRef.current = false;
      }
      shownStore.reset();
    },
    [shownStore],
  );
  reactForUiSkeleton.useLayoutEffect(() => {
    let current = hostRef.current;
    if (current === null || isNested || !delaysReveal || initialGroupStartedAt === null) {
      return;
    }
    let elapsedMs = performance.now() - initialGroupStartedAt;
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) {
      return;
    }
    current.style.setProperty("--cds-skel-elapsed", `${elapsedMs}ms`);
    return () => clearSkeletonElapsedStyle(current);
  }, [isNested, delaysReveal, initialGroupStartedAt]);
  let sweepClipRef = reactForUiSkeleton.useRef<HTMLElement>(null),
    attachSweepClip = reactForUiSkeleton.useCallback(
      (element: HTMLElement | null) => {
        sweepClipRef.current = element;
      },
      [],
    );
  reactForUiSkeleton.useEffect(() => {
    let current = sweepClipRef.current,
      host = hostRef.current;
    if (
      motion !== "sweep" ||
      isNested ||
      current === null ||
      host === null
    ) {
      return;
    }
    let didSetPosition = ensurePositionedSkeletonHost(host),
      updateSweepClip = () => {
        let items = [],
          placeholders = host.querySelectorAll<HTMLElement>(
            '[data-cds="Skeleton"]',
          );
        setSkeletonMotion(
          host,
          placeholders.length === 0 ? "lockstep" : "sweep",
        );
        for (let placeholder of placeholders) {
          let index = 0,
            offsetY = 0,
            offsetAncestor: HTMLElement | null = placeholder;
          while (offsetAncestor !== null && offsetAncestor !== host) {
            if (
              ((index += offsetAncestor.offsetLeft),
              (offsetY += offsetAncestor.offsetTop),
              (offsetAncestor = offsetAncestor.offsetParent as HTMLElement | null),
              offsetAncestor !== null && offsetAncestor !== host)
            ) {
              index +=
                (offsetAncestor as HTMLElement).clientLeft -
                (offsetAncestor as HTMLElement).scrollLeft;
              offsetY +=
                (offsetAncestor as HTMLElement).clientTop -
                (offsetAncestor as HTMLElement).scrollTop;
            }
          }
          if (offsetAncestor !== host) {
            continue;
          }
          items.push(
            `M${index},${offsetY}h${placeholder.offsetWidth}v${placeholder.offsetHeight}h${-placeholder.offsetWidth}Z`,
          );
        }
        current.style.clipPath = items.length
          ? `path("${items.join(" ")}")`
          : "";
        current.style.visibility = items.length ? "visible" : "hidden";
      };
    updateSweepClip();
    let resizeObserver: Pick<ResizeObserver, "observe" | "disconnect"> = createSafeResizeObserver(
      getResizeObserverConstructor(host) ?? ResizeObserver,
      updateSweepClip,
    );
    resizeObserver.observe(host);
    return () => {
      resizeObserver.disconnect();
      if (didSetPosition) {
        host.style.removeProperty("position");
      }
    };
  }, [motion, isNested]);
  reactForUiSkeleton.useEffect(() => {
    let current = hostRef.current;
    if (motion !== "wave" || isNested || current === null) {
      return;
    }
    let updateWaveOrder = () => {
      let placeholders = current.querySelectorAll<HTMLElement>(
          '[data-cds="Skeleton"]',
        ),
        waveSlots = Math.floor(
          SKELETON_ANIMATION_DURATION_MS / SKELETON_MINIMUM_HOLD_MS,
        ),
        index = 0;
      for (let placeholder of placeholders) {
        if (placeholder.style.getPropertyValue("--cds-skel-i") !== "") {
          index += 1;
        }
      }
      for (let placeholder of placeholders) {
        if (placeholder.style.getPropertyValue("--cds-skel-i") === "") {
          placeholder.style.setProperty("--cds-skel-i", String(index % waveSlots));
          index += 1;
        }
      }
      setSkeletonMotion(current, placeholders.length === 0 ? "lockstep" : "wave");
    };
    updateWaveOrder();
    let contentObserver: Pick<MutationObserver, "observe" | "disconnect"> = createSafeMutationObserver(MutationObserver, updateWaveOrder);
    contentObserver.observe(current, {
      childList: true,
      subtree: true,
    });
    return () => contentObserver.disconnect();
  }, [motion, isNested]);
  let hostClassName: string | undefined = isInlineTag
    ? cn("block", className)
    : className;
  if (isNested) {
    return (() => {
      const _Element = groupTagName;
      const _elementProps = {
        ref: callback,
        "data-cds": "SkeletonGroup",
        className: hostClassName,
        children: (
          <skeletonElementContext.Provider value={tag}>
            <skeletonShownStoreContext.Provider value={shownStore}>
              {children}
            </skeletonShownStoreContext.Provider>
          </skeletonElementContext.Provider>
        ),
      };
      return <_Element {..._elementProps} />;
    })();
  }
  return (() => {
    const RootSkeletonHost = groupTagName;
    const rootSkeletonProps = {
      ref: attachHost,
      "data-cds": "SkeletonGroup",
      "data-motion": motion,
      "data-hold": delaysReveal ? "delayed" : "none",
      "data-hold-reason": delaysReveal
        ? undefined
        : (
            initialHold as {
              none: string;
            }
          ).none,
      "data-shown": delaysReveal ? undefined : "",
      role: decorative ? undefined : "status",
      "aria-hidden": decorative ? true : undefined,
      className: hostClassName,
      onAnimationEnd: (event: React.AnimationEvent<HTMLElement>) => {
        if (
          event.animationName === "cds-placeholder-reveal" &&
          (event.target as C.AnimationElement) === event.currentTarget
        ) {
          event.currentTarget.style.setProperty(
            "--cds-skel-settled",
            `${SKELETON_DURATION_LIMIT_MS}ms`,
          );
          event.currentTarget.setAttribute("data-settled", "");
        }
      },
      onAnimationStart: (event: React.AnimationEvent<HTMLElement>) => {
        if (
          event.animationName === "cds-placeholder-reveal" &&
          (event.target as C.AnimationElement) === event.currentTarget
        ) {
          event.currentTarget.setAttribute("data-shown", "");
          let element = event.currentTarget.querySelector(
            "[data-skeleton-label]",
          );
          if (element !== null && element.textContent === "") {
            element.textContent = lifecycleRef.current.labelText;
          }
          if (!hasShownRef.current) {
            hasShownRef.current = true;
            markSkeletonShownAfterCallback(lifecycleRef.current.onShown, shownStore);
          }
        } else if (
          (event.animationName === SKELETON_BREATHE_ANIMATION &&
            (event.target as C.AnimationElement) === event.currentTarget) ||
          (event.animationName === SKELETON_SWEEP_ANIMATION &&
            typeof (event.target as C.AnimationElement)?.getAnimations ===
              "function")
        ) {
          synchronizeSkeletonAnimation(
            event.target as C.AnimationElement,
            event.animationName,
          );
        } else if (
          event.animationName === SKELETON_BREATHE_ANIMATION &&
          motion === "wave" &&
          typeof (event.target as C.AnimationElement)?.getAnimations ===
            "function"
        ) {
          let target = event.target as C.AnimationElement;
          synchronizeSkeletonAnimation(
            target,
            SKELETON_BREATHE_ANIMATION,
            (Number.parseInt(
              target.style.getPropertyValue("--cds-skel-i"),
              10,
            ) || 0) * SKELETON_MINIMUM_HOLD_MS,
          );
        }
      },
      children: [
        decorative ? null : (
          <span className={"sr-only"} data-skeleton-label={true}>
            {delaysReveal ? ("") : (loadingLabel)}
          </span>
        ),
        motion === "sweep"
          ? (() => {
              const SweepClip = groupTagName;
              const sweepClipProps = {
                "aria-hidden": true,
                ref: attachSweepClip,
                className: "cds-skel-sweep-clip",
                style: {
                  visibility: "hidden" as const,
                },
                children: (() => {
                  const SweepBand = groupTagName;
                  const sweepBandProps = {
                    className: "cds-skel-sweep-band",
                  };
                  return <SweepBand {...sweepBandProps} />;
                })(),
              };
              return <SweepClip {...sweepClipProps} />;
            })()
          : null,
        <skeletonActiveContext.Provider value={true}>
          <skeletonElementContext.Provider value={tag}>
            <skeletonShownStoreContext.Provider value={shownStore}>
              {(() => {
                const PlaceholderContent = groupTagName;
                const placeholderContentProps = {
                  "aria-hidden": true,
                  className: "contents",
                  children: children,
                };
                return <PlaceholderContent {...placeholderContentProps} />;
              })()}
            </skeletonShownStoreContext.Provider>
          </skeletonElementContext.Provider>
        </skeletonActiveContext.Provider>,
      ],
    };
    return <RootSkeletonHost {...rootSkeletonProps} />;
  })();
}
function Skeleton({
  width: width,
  height: height,
  className: className,
  decorative = false,
  as: as2,
}: C.SkeletonProps) {
  useUiLocale();
  let value = reactForUiSkeleton.useContext<boolean>(
      skeletonActiveContext,
    ),
    inheritedTag = reactForUiSkeleton.useContext<C.SkeletonTag>(
      skeletonElementContext,
    ),
    skeletonTagName = skeletonElementTags[as2 ?? inheritedTag],
    inlineBlockClass = skeletonTagName === "span" ? "block" : undefined,
    loadingLabel: string = useTranslation("loading", "Loading");
  if (value) {
    return (() => {
      const NestedSkeleton = skeletonTagName;
      const nestedSkeletonProps = {
        "data-cds": "Skeleton",
        className: cn(
          inlineBlockClass,
          "h-[1em] max-w-full rounded bg-[var(--cds-skeleton-base)]",
          className,
        ),
        style: {
          width: width,
          height: height,
        },
      };
      return <NestedSkeleton {...nestedSkeletonProps} />;
    })();
  }
  return (() => {
    const StandaloneSkeleton = skeletonTagName;
    const standaloneSkeletonProps = {
      ref: scheduleShimmerSynchronization,
      "data-cds": "Skeleton",
      role: decorative ? undefined : "status",
      "aria-hidden": decorative ? true : undefined,
      className: cn(
        inlineBlockClass,
        "relative h-[1em] max-w-full overflow-hidden rounded bg-[var(--cds-skeleton-base)] after:absolute after:inset-0 after:animate-[cds-shimmer_2s_linear_infinite] after:bg-[linear-gradient(90deg,transparent,var(--cds-skeleton-sheen),transparent)] motion-reduce:after:hidden",
        className,
      ),
      style: {
        width: width,
        height: height,
      },
      children: decorative ? null : (
        <span className={"sr-only"}>{loadingLabel}</span>
      ),
    };
    return <StandaloneSkeleton {...standaloneSkeletonProps} />;
  })();
}
function SkeletonRows({ rows = 3, icon = true }: C.SkeletonRowsProps) {
  useUiLocale();
  let value =
      skeletonElementTags[
        reactForUiSkeleton.useContext<C.SkeletonTag>(
          skeletonElementContext,
        )
      ],
    inlineBlockClass = value === "span" ? "block" : undefined,
    rowWidths = icon ? skeletonIconRowWidths : skeletonTextRowWidths,
    validGroupSizes = (typeof rows === "number" ? [rows] : rows).filter(
      (rowCount: number) => rowCount > 0,
    ),
    groupSizes = validGroupSizes.length > 0 ? validGroupSizes : [3],
    items = [],
    index = 0;
  for (let [groupIndex, groupSize] of groupSizes.entries()) {
    if (groupIndex > 0) {
      items.push(
        (() => {
          const _Element8 = value;
          const _elementProps8 = {
            "aria-hidden": true,
            "data-slot": "menu-skeleton-separator",
            className: cn(
              inlineBlockClass,
              "compact:mx-2 comfortable:mx-2.5 my-1 h-px bg-border",
            ),
          };
          const _elementKey = `separator-${groupIndex}`;
          return <_Element8 key={_elementKey} {..._elementProps8} />;
        })(),
      );
    }
    for (let groupEndIndex = index + groupSize; index < groupEndIndex; index++) {
      items.push(
        (() => {
          const MenuSkeletonRow = value;
          const menuSkeletonRowProps = {
            "aria-hidden": index > 0 ? true : undefined,
            className:
              "flex h-control items-center gap-xs compact:px-2 comfortable:px-2.5",
            children: [
              icon && <SkeletonPrimitive width={20} height={20} />,
              <span
                aria-hidden={icon ? true : undefined}
                className={"contents"}
              >
                <SkeletonPrimitive
                  width={rowWidths[index % rowWidths.length]}
                  height={16}
                />
              </span>,
            ],
          };
          const rowKey = index;
          return <MenuSkeletonRow key={rowKey} {...menuSkeletonRowProps} />;
        })(),
      );
    }
  }
  return (() => {
    const MenuSkeletonHost = value;
    const menuSkeletonHostProps = {
      className: inlineBlockClass,
      children: items,
    };
    return <MenuSkeletonHost {...menuSkeletonHostProps} />;
  })();
}
function SkeletonChip({ width = 120, shape = "pill" }: C.SkeletonChipProps) {
  useUiLocale();
  return (
    <SkeletonPrimitive
      className={
        shape === "pill"
          ? "h-control shrink-0 rounded-full"
          : "h-control shrink-0 rounded"
      }
      width={width}
    />
  );
}
function SkeletonLines({
  lines = 8,
  className: className,
}: C.SkeletonLinesProps) {
  useUiLocale();
  let value =
    skeletonElementTags[
      reactForUiSkeleton.useContext<C.SkeletonTag>(
        skeletonElementContext,
      )
    ];
  return (() => {
    const LinesHost = value;
    const linesHostProps = {
      className: cn("flex flex-col gap-sm", className),
      children: Array.from<unknown, React.ReactElement>(
        {
          length: lines,
        },
        (unusedItem: unknown, lineIndex: number) =>
          (() => {
            const LineWrapper = "span";
            const lineWrapperProps = {
              "aria-hidden": lineIndex > 0 ? true : undefined,
              className: "contents",
              children: (
                <SkeletonPrimitive
                  width={
                    skeletonLineWidths[lineIndex % skeletonLineWidths.length]
                  }
                  height={14}
                />
              ),
            };
            const lineKey = lineIndex;
            return <LineWrapper key={lineKey} {...lineWrapperProps} />;
          })(),
      ),
    };
    return <LinesHost {...linesHostProps} />;
  })();
}
function SkeletonBlock({
  height: height,
  className: className,
}: C.SkeletonBlockProps) {
  useUiLocale();
  return (
    <SkeletonPrimitive className={className} width={"100%"} height={height} />
  );
}
export {
  clearSkeletonElapsedStyle,
  createSkeletonShownStore,
  DEFAULT_SKELETON_MOTION,
  ensurePositionedSkeletonHost,
  flushShimmerSynchronization,
  isShimmerAnimation,
  jsxForUiSkeleton,
  markSkeletonShownAfterCallback,
  pendingShimmerElements,
  reactForUiSkeleton,
  scheduleShimmerSynchronization,
  setSkeletonMotion,
  shimmerStartTimes,
  Skeleton,
  SKELETON_ANIMATION_DURATION_MS,
  SKELETON_BREATHE_ANIMATION,
  SKELETON_DURATION_LIMIT_MS,
  SKELETON_MINIMUM_HOLD_MS,
  SKELETON_SWEEP_ANIMATION,
  SKELETON_SYNC_TOLERANCE_MS,
  skeletonAnimationStartTimes,
  SkeletonBlock,
  SkeletonChip,
  skeletonElementTags,
  SkeletonGroup,
  skeletonIconRowWidths,
  SkeletonLines,
  skeletonLineWidths,
  skeletonNotShownSnapshot,
  SkeletonPrimitive,
  SkeletonRows,
  skeletonShownSnapshot,
  skeletonTextRowWidths,
  synchronizeDocumentShimmers,
  synchronizeSkeletonAnimation,
};
export function installUiSkeleton(): () => void {
  return () => {
    initializeClassNames();
    initializeTranslations();
    initializeIconSupport();
    initializeSkeletonContexts();
    reactForUiSkeleton = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiSkeleton = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    skeletonElementTags = {
      div: "div",
      span: "span",
    };
    pendingShimmerElements = new Set();
    shimmerStartTimes = new WeakMap();
    skeletonNotShownSnapshot = Object.freeze({
      shown: false,
    });
    skeletonShownSnapshot = Object.freeze({
      shown: true,
    });
    SKELETON_BREATHE_ANIMATION = "cds-skeleton-breathe";
    SKELETON_SWEEP_ANIMATION = "cds-skeleton-sweep";
    SKELETON_ANIMATION_DURATION_MS = 2000;
    DEFAULT_SKELETON_MOTION = "wave";
    SKELETON_MINIMUM_HOLD_MS = 90;
    SKELETON_DURATION_LIMIT_MS = 1e5;
    SKELETON_SYNC_TOLERANCE_MS = 1;
    skeletonAnimationStartTimes = new WeakMap();
    skeletonIconRowWidths = [160, 128, 144];
    skeletonTextRowWidths = [120, 88, 104];
    (SkeletonRows as React.FunctionComponent<C.SkeletonRowsProps>).displayName =
      "Skeleton.Rows";
    (SkeletonChip as React.FunctionComponent<C.SkeletonChipProps>).displayName =
      "Skeleton.Chip";
    skeletonLineWidths = ["92%", "100%", "96%", "58%"];
    (
      SkeletonLines as React.FunctionComponent<C.SkeletonLinesProps>
    ).displayName = "Skeleton.Lines";
    (
      SkeletonBlock as React.FunctionComponent<C.SkeletonBlockProps>
    ).displayName = "Skeleton.Block";
    (Skeleton as React.FunctionComponent<C.SkeletonProps>).displayName =
      "Skeleton";
    (
      SkeletonGroup as React.FunctionComponent<C.SkeletonGroupProps>
    ).displayName = "SkeletonGroup";
    SkeletonPrimitive = Object.assign(Skeleton, {
      Rows: SkeletonRows,
      Chip: SkeletonChip,
      Lines: SkeletonLines,
      Block: SkeletonBlock,
    });
    initializeClassNames();
  };
}

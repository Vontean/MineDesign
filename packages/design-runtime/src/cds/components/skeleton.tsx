import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializePlatformRootFontSize, PlatformRootFontSizeContext, SkeletonDecorativeContext, SkeletonElementContext, SkeletonMotionContext } from "../platform/root-font-size";
import { initializeLabelsProviderContext, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsSkeleton: Dynamic;
var jsxComponentsSkeleton: Dynamic;
var ComponentsSkeletonDivSpanConfig: Dynamic;
var ComponentsSkeletonSubscribers: Dynamic;
var ComponentsSkeletonElementCache: Dynamic;
var ComponentsSkeletonFreezeValue: Dynamic;
var shownSnapshot: Dynamic;
var CdsSkeletonBreatheValue: Dynamic;
var CdsSkeletonSweepValue: Dynamic;
var ComponentsSkeletonConstant: Dynamic;
var WaveValue: Dynamic;
var waveStepMs: Dynamic;
var settledDurationMs: Dynamic;
var ComponentsSkeletonLimit: Dynamic;
var alignedStartByDocument: Dynamic;
var ComponentsSkeletonItems: Dynamic;
var rowWidthsWithoutIcon: Dynamic;
var lineWidths: Dynamic;
var ComponentsSkeletonAssignValue: Dynamic;
var initializeComponentsSkeleton: Dynamic;
function isShimmerAnimation(animation?: Dynamic): Dynamic {
  return animation.animationName === "cds-shimmer";
}
function synchronizeDocumentShimmers(doc?: Dynamic): Dynamic {
  let earliestStart: Dynamic,
    runningShimmers: Dynamic = [];
  for (let animation of doc.getAnimations() as Dynamic) {
    if (!isShimmerAnimation(animation)) continue;
    let { startTime: startTime }: Dynamic = animation;
    typeof startTime == "number" &&
      (earliestStart === undefined || startTime < earliestStart) &&
      (earliestStart = startTime);
    let target: Dynamic = animation.effect?.target;
    target != null &&
      ComponentsSkeletonSubscribers.has(target) &&
      animation.playState === "running" &&
      runningShimmers.push(animation);
  }
  let syncStart: Dynamic =
    earliestStart ?? ComponentsSkeletonElementCache.get(doc) ?? 0;
  for (let animation of runningShimmers as Dynamic) animation.startTime = syncStart;
  ComponentsSkeletonElementCache.set(doc, syncStart);
}
function flushShimmerSynchronization(): Dynamic {
  try {
    let documents: Dynamic = new Set();
    for (let element of ComponentsSkeletonSubscribers as Dynamic)
      documents.add(element.ownerDocument);
    for (let doc of documents as Dynamic) synchronizeDocumentShimmers(doc);
  } finally {
    ComponentsSkeletonSubscribers.clear();
  }
}
function scheduleShimmerSynchronization(element?: Dynamic): Dynamic {
  element === null ||
    typeof element.ownerDocument.getAnimations != "function" ||
    (ComponentsSkeletonSubscribers.size === 0 &&
      queueMicrotask(flushShimmerSynchronization),
    ComponentsSkeletonSubscribers.add(element));
}
function reportSkeletonError(error?: Dynamic): Dynamic {
  if (typeof reportError == "function") {
    reportError(error);
    return;
  }
  queueMicrotask((): Dynamic => {
    throw error instanceof Error ? error : new Error(String(error));
  });
}
function createSkeletonStore(): Dynamic {
  let snapshot: Dynamic = ComponentsSkeletonFreezeValue,
    listeners: Dynamic = new Set(),
    setSnapshot: Dynamic = (next?: Dynamic): Dynamic => {
      if (snapshot !== next) {
        snapshot = next;
        for (let listener of listeners as Dynamic)
          try {
            listener();
          } catch (error: Dynamic) {
            reportSkeletonError(error);
          }
      }
    };
  return {
    getSnapshot: (): Dynamic => snapshot,
    subscribe: (listener?: Dynamic): Dynamic => (
      listeners.add(listener),
      (): Dynamic => {
        listeners.delete(listener);
      }
    ),
    markShown: (): Dynamic => setSnapshot(shownSnapshot),
    reset: (): Dynamic => setSnapshot(ComponentsSkeletonFreezeValue),
  };
}
function notifySkeletonShown(onShown?: Dynamic, store?: Dynamic): Dynamic {
  try {
    onShown?.();
  } finally {
    store.markShown();
  }
}
function clearSkeletonElapsed(element?: Dynamic): Dynamic {
  element.style.removeProperty("--cds-skel-elapsed");
}
function setSkeletonMotion(element?: Dynamic, motion?: Dynamic): Dynamic {
  element.dataset.motion = motion;
}
function ensurePositionedElement(element?: Dynamic): Dynamic {
  let position: Dynamic = getComputedStyle(element).position;
  return position === "static" || position === ""
    ? ((element.style.position = "relative"), true)
    : false;
}
function synchronizeSkeletonAnimation(
  element?: Dynamic,
  animationName: Dynamic = CdsSkeletonBreatheValue,
  phaseOffset: Dynamic = 0,
): Dynamic {
  if (typeof element.getAnimations != "function") return;
  let animation: Dynamic = element
    .getAnimations()
    .find((candidate?: Dynamic): Dynamic => candidate.animationName === animationName);
  if (animation === undefined || typeof animation.startTime != "number") return;
  let timing: Dynamic = animation.effect?.getComputedTiming();
  if (
    timing?.duration !== ComponentsSkeletonConstant ||
    timing.iterations !== 1 / 0
  )
    return;
  let startWithDelay: Dynamic = animation.startTime + (timing.delay ?? 0),
    alignedStart: Dynamic = startWithDelay - phaseOffset,
    ownerDocument: Dynamic = element.ownerDocument,
    entry: Dynamic = alignedStartByDocument.get(ownerDocument);
  if (entry === undefined) {
    alignedStartByDocument.set(ownerDocument, alignedStart);
    return;
  }
  let drift: Dynamic =
    (((alignedStart - entry) % ComponentsSkeletonConstant) +
      ComponentsSkeletonConstant) %
    ComponentsSkeletonConstant;
  if (drift < ComponentsSkeletonLimit || drift > 1999) return;
  let currentStart: Dynamic =
      typeof animation.currentTime == "number"
        ? animation.startTime + animation.currentTime
        : startWithDelay,
    cycleCount: Dynamic = Math.ceil(
      (Math.max(currentStart, startWithDelay) - (entry + phaseOffset)) /
        ComponentsSkeletonConstant,
    );
  animation.startTime =
    entry +
    phaseOffset +
    cycleCount * ComponentsSkeletonConstant -
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
  as: as,
  motion = WaveValue,
}: Dynamic): Dynamic {
  useUiLocale();
  let isInsideDecorativeGroup: Dynamic = (0, reactComponentsSkeleton.useContext)(
      SkeletonDecorativeContext,
    ),
    inheritedElement: Dynamic = (0, reactComponentsSkeleton.useContext)(
      SkeletonElementContext,
    ),
    [elementName]: Dynamic = (0, reactComponentsSkeleton.useState)(as ?? inheritedElement),
    tagName: Dynamic = ComponentsSkeletonDivSpanConfig[elementName],
    isSpan: Dynamic = elementName === "span",
    rootStartTime: Dynamic = (0, reactComponentsSkeleton.useContext)(
      PlatformRootFontSizeContext,
    ),
    parentStore: Dynamic = (0, reactComponentsSkeleton.useContext)(
      SkeletonMotionContext,
    ),
    [store]: Dynamic = (0, reactComponentsSkeleton.useState)((): Dynamic => {
      let newStore: Dynamic = createSkeletonStore();
      (isInsideDecorativeGroup ? parentStore?.getSnapshot().shown === true : hold !== "delayed") &&
        newStore.markShown();
      return newStore;
    }),
    [startTime]: Dynamic = (0, reactComponentsSkeleton.useState)(rootStartTime),
    [isDetached, setIsDetached]: Dynamic = (0, reactComponentsSkeleton.useState)(
      false,
    ),
    detachedRef: Dynamic = (0, reactComponentsSkeleton.useRef)(false),
    isNestedPlaceholder: Dynamic = isInsideDecorativeGroup && !isDetached,
    nestedGroupRef: Dynamic = (0, reactComponentsSkeleton.useCallback)(
      (element?: Dynamic): Dynamic => {
        element !== null &&
          element.parentElement !== null &&
          element.parentElement.closest('[data-cds="SkeletonGroup"]') ===
            null &&
          ((detachedRef.current = true), store.reset(), setIsDetached(true));
      },
      [store],
    ),
    defaultLoadingLabel: Dynamic = useLabel("loading", "Loading"),
    [initialHold]: Dynamic = (0, reactComponentsSkeleton.useState)(hold),
    isDelayedHold: Dynamic = initialHold === "delayed",
    labelText: Dynamic = label ?? defaultLoadingLabel,
    groupElementRef: Dynamic = (0, reactComponentsSkeleton.useRef)(null),
    setGroupElement: Dynamic = (0, reactComponentsSkeleton.useCallback)(
      (element?: Dynamic): Dynamic => {
        groupElementRef.current = element;
      },
      [],
    ),
    hasShownRef: Dynamic = (0, reactComponentsSkeleton.useRef)(false),
    latestCallbacksRef: Dynamic = (0, reactComponentsSkeleton.useRef)({
      onShown: onShown,
      onHidden: onHidden,
      labelText: labelText,
    });
  (0, reactComponentsSkeleton.useEffect)((): Dynamic => {
    latestCallbacksRef.current = {
      onShown: onShown,
      onHidden: onHidden,
      labelText: labelText,
    };
    if (hasShownRef.current && groupElementRef.current !== null) {
      let element: Dynamic = groupElementRef.current.querySelector(
        "[data-skeleton-label]",
      );
      element !== null &&
        element.textContent !== labelText &&
        (element.textContent = labelText);
    }
  }, [onShown, onHidden, labelText, decorative]);
  (0, reactComponentsSkeleton.useLayoutEffect)((): Dynamic => {
    !isNestedPlaceholder &&
      !isDelayedHold &&
      !hasShownRef.current &&
      ((hasShownRef.current = true),
      notifySkeletonShown(latestCallbacksRef.current.onShown, store));
  }, [isNestedPlaceholder, isDelayedHold, store]);
  (0, reactComponentsSkeleton.useLayoutEffect)((): Dynamic => {
    if (!isNestedPlaceholder || detachedRef.current || parentStore === null) return;
    let syncWithParent: Dynamic = (): Dynamic => {
      parentStore.getSnapshot().shown
        ? hasShownRef.current
          ? store.markShown()
          : ((hasShownRef.current = true),
            notifySkeletonShown(latestCallbacksRef.current.onShown, store))
        : store.reset();
    };
    syncWithParent();
    return parentStore.subscribe(syncWithParent);
  }, [isNestedPlaceholder, parentStore, store]);
  (0, reactComponentsSkeleton.useEffect)(
    (): Dynamic => (): Dynamic => {
      hasShownRef.current &&
        (latestCallbacksRef.current.onHidden?.(), (hasShownRef.current = false));
      store.reset();
    },
    [store],
  );
  (0, reactComponentsSkeleton.useLayoutEffect)((): Dynamic => {
    let groupElement: Dynamic = groupElementRef.current;
    if (groupElement === null || isNestedPlaceholder || !isDelayedHold || startTime === null) return;
    let elapsedMs: Dynamic = performance.now() - startTime;
    if (!(!Number.isFinite(elapsedMs) || elapsedMs <= 0)) {
      groupElement.style.setProperty("--cds-skel-elapsed", `${elapsedMs}ms`);
      return (): Dynamic => clearSkeletonElapsed(groupElement);
    }
  }, [isNestedPlaceholder, isDelayedHold, startTime]);
  let sweepClipRef: Dynamic = (0, reactComponentsSkeleton.useRef)(null),
    setSweepClip: Dynamic = (0, reactComponentsSkeleton.useCallback)(
      (element?: Dynamic): Dynamic => {
        sweepClipRef.current = element;
      },
      [],
    );
  (0, reactComponentsSkeleton.useEffect)((): Dynamic => {
    let clipElement: Dynamic = sweepClipRef.current,
      groupElement: Dynamic = groupElementRef.current;
    if (
      motion !== "sweep" ||
      isNestedPlaceholder ||
      clipElement === null ||
      groupElement === null
    )
      return;
    let didSetPosition: Dynamic = ensurePositionedElement(groupElement),
      updateClipPath: Dynamic = (): Dynamic => {
        let clipPaths: Dynamic = [],
          skeletonNodes: Dynamic = groupElement.querySelectorAll(
            '[data-cds="Skeleton"]',
          );
        setSkeletonMotion(
          groupElement,
          skeletonNodes.length === 0 ? "lockstep" : "sweep",
        );
        for (let skeleton of skeletonNodes as Dynamic) {
          let offsetX: Dynamic = 0,
            offsetY: Dynamic = 0,
            node: Dynamic = skeleton;
          for (; node !== null && node !== groupElement; ) {
            offsetX += node.offsetLeft;
            offsetY += node.offsetTop;
            node = node.offsetParent;
            node !== null &&
              node !== groupElement &&
              ((offsetX += node.clientLeft - node.scrollLeft),
              (offsetY += node.clientTop - node.scrollTop));
          }
          node === groupElement &&
            clipPaths.push(
              `M${offsetX},${offsetY}h${skeleton.offsetWidth}v${skeleton.offsetHeight}h${-skeleton.offsetWidth}Z`,
            );
        }
        clipElement.style.clipPath = clipPaths.length
          ? `path("${clipPaths.join(" ")}")`
          : "";
        clipElement.style.visibility = clipPaths.length ? "visible" : "hidden";
      };
    updateClipPath();
    let observer: Dynamic = new ResizeObserver(updateClipPath);
    observer.observe(groupElement);
    return (): Dynamic => {
      observer.disconnect();
      didSetPosition && groupElement.style.removeProperty("position");
    };
  }, [motion, isNestedPlaceholder]);
  (0, reactComponentsSkeleton.useEffect)((): Dynamic => {
    let groupElement: Dynamic = groupElementRef.current;
    if (motion !== "wave" || isNestedPlaceholder || groupElement === null) return;
    let updateWaveIndexes: Dynamic = (): Dynamic => {
      let skeletonNodes: Dynamic = groupElement.querySelectorAll(
          '[data-cds="Skeleton"]',
        ),
        waveSlots: Dynamic = Math.floor(
          ComponentsSkeletonConstant / waveStepMs,
        ),
        nextIndex: Dynamic = 0;
      for (let skeleton of skeletonNodes as Dynamic)
        skeleton.style.getPropertyValue("--cds-skel-i") !== "" && (nextIndex += 1);
      for (let skeleton of skeletonNodes as Dynamic)
        skeleton.style.getPropertyValue("--cds-skel-i") === "" &&
          (skeleton.style.setProperty("--cds-skel-i", String(nextIndex % waveSlots)),
          (nextIndex += 1));
      setSkeletonMotion(groupElement, skeletonNodes.length === 0 ? "lockstep" : "wave");
    };
    updateWaveIndexes();
    let observer: Dynamic = new MutationObserver(updateWaveIndexes);
    observer.observe(groupElement, {
      childList: true,
      subtree: true,
    });
    return (): Dynamic => observer.disconnect();
  }, [motion, isNestedPlaceholder]);
  let groupClassName: Dynamic = isSpan
    ? cn("block", className)
    : className;
  return isNestedPlaceholder
    ? (() => {
        const _Component = tagName;
        return (
          <_Component
            ref={nestedGroupRef}
            data-cds={"SkeletonGroup"}
            className={groupClassName}
          >
            <SkeletonElementContext.Provider value={elementName}>
              <SkeletonMotionContext.Provider value={store}>
                {children}
              </SkeletonMotionContext.Provider>
            </SkeletonElementContext.Provider>
          </_Component>
        );
      })()
    : (() => {
        const StatusGroupTag = tagName;
        return (
          <StatusGroupTag
            ref={setGroupElement}
            data-cds={"SkeletonGroup"}
            data-motion={motion}
            data-hold={isDelayedHold ? "delayed" : "none"}
            data-hold-reason={isDelayedHold ? undefined : initialHold.none}
            data-shown={isDelayedHold ? undefined : ""}
            role={decorative ? undefined : "status"}
            aria-hidden={decorative ? true : undefined}
            className={groupClassName}
            onAnimationEnd={(event?: Dynamic): Dynamic => {
              event.animationName === "cds-placeholder-reveal" &&
                event.target === event.currentTarget &&
                (event.currentTarget.style.setProperty(
                  "--cds-skel-settled",
                  `${settledDurationMs}ms`,
                ),
                event.currentTarget.setAttribute("data-settled", ""));
            }}
            onAnimationStart={(event?: Dynamic): Dynamic => {
              if (
                event.animationName === "cds-placeholder-reveal" &&
                event.target === event.currentTarget
              ) {
                event.currentTarget.setAttribute("data-shown", "");
                let element: Dynamic = event.currentTarget.querySelector(
                  "[data-skeleton-label]",
                );
                element !== null &&
                  element.textContent === "" &&
                  (element.textContent = latestCallbacksRef.current.labelText);
                hasShownRef.current ||
                  ((hasShownRef.current = true),
                  notifySkeletonShown(latestCallbacksRef.current.onShown, store));
              } else if (
                (event.animationName === CdsSkeletonBreatheValue &&
                  event.target === event.currentTarget) ||
                (event.animationName === CdsSkeletonSweepValue &&
                  typeof event.target?.getAnimations == "function")
              )
                synchronizeSkeletonAnimation(
                  event.target,
                  event.animationName,
                );
              else if (
                event.animationName === CdsSkeletonBreatheValue &&
                motion === "wave" &&
                typeof event.target?.getAnimations == "function"
              ) {
                let target: Dynamic = event.target;
                synchronizeSkeletonAnimation(
                  target,
                  CdsSkeletonBreatheValue,
                  (Number.parseInt(
                    target.style.getPropertyValue("--cds-skel-i"),
                    10,
                  ) || 0) * waveStepMs,
                );
              }
            }}
          >
            {decorative ? (null) : (<span className={"sr-only"} data-skeleton-label={true}>
                {isDelayedHold ? ("") : (labelText)}
              </span>)}
            {motion === "sweep" ? ((() => {
                  const SweepClipTag = tagName;
                  return (
                    <SweepClipTag
                      aria-hidden={true}
                      ref={setSweepClip}
                      className={"cds-skel-sweep-clip"}
                      style={{
                        visibility: "hidden",
                      }}
                    >
                      {(() => {
                        const SweepBandTag = tagName;
                        return (
                          <SweepBandTag className={"cds-skel-sweep-band"} />
                        );
                      })()}
                    </SweepClipTag>
                  );
                })()) : (null)}
            <SkeletonDecorativeContext.Provider value={true}>
              <SkeletonElementContext.Provider value={elementName}>
                <SkeletonMotionContext.Provider value={store}>
                  {(() => {
                    const ContentsTag = tagName;
                    return (
                      <ContentsTag aria-hidden={true} className={"contents"}>
                        {children}
                      </ContentsTag>
                    );
                  })()}
                </SkeletonMotionContext.Provider>
              </SkeletonElementContext.Provider>
            </SkeletonDecorativeContext.Provider>
          </StatusGroupTag>
        );
      })();
}
function Skeleton({
  width: width,
  height: height,
  className: className,
  decorative = false,
  as: as,
}: Dynamic): Dynamic {
  useUiLocale();
  let isInsideDecorativeGroup: Dynamic = (0, reactComponentsSkeleton.useContext)(
      SkeletonDecorativeContext,
    ),
    inheritedElement: Dynamic = (0, reactComponentsSkeleton.useContext)(
      SkeletonElementContext,
    ),
    tagName: Dynamic = ComponentsSkeletonDivSpanConfig[as ?? inheritedElement],
    displayClass: Dynamic = tagName === "span" ? "block" : undefined,
    loadingLabel: Dynamic = useLabel("loading", "Loading");
  return isInsideDecorativeGroup
    ? (() => {
        const DecorativeSkeletonTag = tagName;
        return (
          <DecorativeSkeletonTag
            data-cds={"Skeleton"}
            className={cn(
              displayClass,
              "h-[1em] max-w-full rounded bg-[var(--cds-skeleton-base)]",
              className,
            )}
            style={{
              width: width,
              height: height,
            }}
          />
        );
      })()
    : (() => {
        const SkeletonTag = tagName;
        return (
          <SkeletonTag
            ref={scheduleShimmerSynchronization}
            data-cds={"Skeleton"}
            role={decorative ? undefined : "status"}
            aria-hidden={decorative ? true : undefined}
            className={cn(
              displayClass,
              "relative h-[1em] max-w-full overflow-hidden rounded bg-[var(--cds-skeleton-base)] after:absolute after:inset-0 after:animate-[cds-shimmer_2s_linear_infinite] after:bg-[linear-gradient(90deg,transparent,var(--cds-skeleton-sheen),transparent)] motion-reduce:after:hidden",
              className,
            )}
            style={{
              width: width,
              height: height,
            }}
          >
            {decorative ? (null) : (<span className={"sr-only"}>{loadingLabel}</span>)}
          </SkeletonTag>
        );
      })();
}
function SkeletonRows({ rows = 3, icon = true }: Dynamic): Dynamic {
  useUiLocale();
  let tagName: Dynamic =
      ComponentsSkeletonDivSpanConfig[
        (0, reactComponentsSkeleton.useContext)(
          SkeletonElementContext,
        )
      ],
    displayClass: Dynamic = tagName === "span" ? "block" : undefined,
    widths: Dynamic = icon
      ? ComponentsSkeletonItems
      : rowWidthsWithoutIcon,
    validRows: Dynamic = (typeof rows == "number" ? [rows] : rows).filter(
      (count?: Dynamic): Dynamic => count > 0,
    ),
    rowGroups: Dynamic = validRows.length > 0 ? validRows : [3],
    rowElements: Dynamic = [],
    rowIndex: Dynamic = 0;
  for (let [groupIndex, rowCount] of rowGroups.entries() as Dynamic) {
    groupIndex > 0 &&
      rowElements.push(
        (() => {
          const _Component8 = tagName;
          const _props = {
            "aria-hidden": true,
            "data-slot": "menu-skeleton-separator",
            className: cn(
              displayClass,
              "compact:mx-2 comfortable:mx-2.5 my-1 h-px bg-border",
            ),
          } as const;
          const _key = `separator-${groupIndex}`;
          return <_Component8 key={_key} {..._props} />;
        })(),
      );
    for (let endIndex: Dynamic = rowIndex + rowCount; rowIndex < endIndex; rowIndex++)
      rowElements.push(
        (() => {
          const RowTag = tagName;
          const rowProps = {
            "aria-hidden": rowIndex > 0 ? true : undefined,
            className:
              "flex h-control items-center gap-xs compact:px-2 comfortable:px-2.5",
            children: [
              icon && (
                <ComponentsSkeletonAssignValue width={20} height={20} />
              ),
              <span
                aria-hidden={icon ? true : undefined}
                className={"contents"}
              >
                <ComponentsSkeletonAssignValue
                  width={widths[rowIndex % widths.length]}
                  height={16}
                />
              </span>,
            ],
          } as const;
          const rowKey = rowIndex;
          return <RowTag key={rowKey} {...rowProps} />;
        })(),
      );
  }
  return (() => {
    const ListTag = tagName;
    return <ListTag className={displayClass}>{rowElements}</ListTag>;
  })();
}
function SkeletonChip({ width = 120, shape = "pill" }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <ComponentsSkeletonAssignValue
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
}: Dynamic): Dynamic {
  useUiLocale();
  let tagName: Dynamic =
    ComponentsSkeletonDivSpanConfig[
      (0, reactComponentsSkeleton.useContext)(SkeletonElementContext)
    ];
  return (() => {
    const LinesTag = tagName;
    return (
      <LinesTag
        className={cn("flex flex-col gap-sm", className)}
      >
        {Array.from(
          {
            length: lines,
          },
          (_item?: Dynamic, lineIndex?: Dynamic): Dynamic => (
            <span
              key={lineIndex}
              aria-hidden={lineIndex > 0 ? true : undefined}
              className={"contents"}
            >
              <ComponentsSkeletonAssignValue
                width={
                  lineWidths[
                    lineIndex % lineWidths.length
                  ]
                }
                height={14}
              />
            </span>
          ),
        )}
      </LinesTag>
    );
  })();
}
function SkeletonBlock({
  height: height,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <ComponentsSkeletonAssignValue
      className={className}
      width={"100%"}
      height={height}
    />
  );
}
export {
  CdsSkeletonBreatheValue,
  CdsSkeletonSweepValue,
  clearSkeletonElapsed,
  ComponentsSkeletonAssignValue,
  ComponentsSkeletonConstant,
  ComponentsSkeletonDivSpanConfig,
  ComponentsSkeletonElementCache,
  alignedStartByDocument,
  ComponentsSkeletonFreezeValue,
  ComponentsSkeletonItems,
  ComponentsSkeletonLimit,
  ComponentsSkeletonSubscribers,
  createSkeletonStore,
  ensurePositionedElement,
  flushShimmerSynchronization,
  initializeComponentsSkeleton,
  isShimmerAnimation,
  jsxComponentsSkeleton,
  notifySkeletonShown,
  reactComponentsSkeleton,
  reportSkeletonError,
  scheduleShimmerSynchronization,
  setSkeletonMotion,
  Skeleton,
  SkeletonBlock,
  SkeletonChip,
  SkeletonGroup,
  SkeletonLines,
  SkeletonRows,
  synchronizeDocumentShimmers,
  synchronizeSkeletonAnimation,
  WaveValue,
};
export function installCdsComponentsSkeleton(): () => void {
  return () => {
    initializeComponentsSkeleton = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeLabelsProviderContext();
      initializePlatformRootFontSize();
      reactComponentsSkeleton = toModuleNamespace(
        load_react(),
      );
      jsxComponentsSkeleton = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsSkeletonDivSpanConfig = {
        div: "div",
        span: "span",
      };
      ComponentsSkeletonSubscribers = new Set();
      ComponentsSkeletonElementCache = new WeakMap();
      ComponentsSkeletonFreezeValue = Object.freeze({
        shown: false,
      });
      shownSnapshot = Object.freeze({
        shown: true,
      });
      CdsSkeletonBreatheValue = "cds-skeleton-breathe";
      CdsSkeletonSweepValue = "cds-skeleton-sweep";
      ComponentsSkeletonConstant = 2e3;
      WaveValue = "wave";
      waveStepMs = 90;
      settledDurationMs = 1e5;
      ComponentsSkeletonLimit = 1;
      alignedStartByDocument = new WeakMap();
      ComponentsSkeletonItems = [160, 128, 144];
      rowWidthsWithoutIcon = [120, 88, 104];
      (SkeletonRows as Dynamic).displayName = "Skeleton.Rows";
      (SkeletonChip as Dynamic).displayName = "Skeleton.Chip";
      lineWidths = ["92%", "100%", "96%", "58%"];
      (SkeletonLines as Dynamic).displayName = "Skeleton.Lines";
      (SkeletonBlock as Dynamic).displayName = "Skeleton.Block";
      (Skeleton as Dynamic).displayName = "Skeleton";
      (SkeletonGroup as Dynamic).displayName = "SkeletonGroup";
      ComponentsSkeletonAssignValue = Object.assign(Skeleton, {
        Rows: SkeletonRows,
        Chip: SkeletonChip,
        Lines: SkeletonLines,
        Block: SkeletonBlock,
      });
    });
  };
}

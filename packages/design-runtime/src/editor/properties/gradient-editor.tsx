import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { EditorPopover } from "../chrome/popover";
import { hsvaToRgbaCss, parseHsvaColor } from "../color/picker-primitives";
import { ColorPickerLabel } from "../color/picker";
import { NumericInput } from "./numeric-input";
import { PropertiesPrimitivesClassNames_3, PropertyColorWell, PropertyPickerButton } from "./primitives";
import { PropertyRow } from "./row";
import { PropertiesSelectMin, PropertySelect } from "./select";
import { PropertyOptionIcon } from "./tool-options";
import { PropertiesTooltipNameViewBoxPathsConfig_13 as angleIcon, reactPropertiesTooltip_2 } from "./tooltip";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesGradientEditorHandler: Dynamic;
var PropertiesGradientEditorTest: Dynamic;
var PropertiesGradientEditorAttrCalcPattern: Dynamic;
var PropertiesGradientEditorPattern: Dynamic;
var WrittenByHandInAFormMessage: Dynamic;
var PropertiesGradientEditorHandler_2: Dynamic;
var jsxPropertiesGradientEditor: Dynamic;
var PropertiesGradientEditorColorMixPattern: Dynamic;
var PropertiesGradientEditorImageCrossFadePattern: Dynamic;
var PropertiesGradientEditorLabel: Dynamic;
function normalizedGradientStops(stops?: Dynamic): Dynamic {
  let positions: Dynamic = stops.map(
    (stop?: Dynamic): Dynamic =>
      stop.pos === undefined
        ? undefined
        : PropertiesSelectMin(stop.pos, 0, 100),
  );
  if (positions.length === 0) return [];
  positions[0] === undefined && (positions[0] = 0);
  positions[positions.length - 1] === undefined && (positions[positions.length - 1] = 100);
  let previousPosition: Dynamic = -1 / 0;
  for (let index: Dynamic = 0; index < positions.length; index++)
    positions[index] !== undefined &&
      (positions[index] < previousPosition && (positions[index] = previousPosition),
      (previousPosition = positions[index]));
  for (let count: Dynamic = 1; count < positions.length - 1; count++) {
    if (positions[count] !== undefined) continue;
    let nextDefinedIndex: Dynamic = count;
    for (; positions[nextDefinedIndex] === undefined; ) nextDefinedIndex++;
    let startPosition: Dynamic = positions[count - 1],
      endPosition: Dynamic = positions[nextDefinedIndex];
    for (let fillIndex: Dynamic = count; fillIndex < nextDefinedIndex; fillIndex++)
      positions[fillIndex] =
        startPosition +
        ((endPosition - startPosition) * (fillIndex - count + 1)) / (nextDefinedIndex - count + 1);
    count = nextDefinedIndex;
  }
  return positions;
}
function GradientEditor({
  radial: radial,
  onRadial: onRadial,
  angle: angle,
  onAngle: onAngle,
  onAngleScrub: onAngleScrub,
  onAngleScrubEnd: onAngleScrubEnd,
  stops: stops,
  selected: selected,
  onSelect: onSelect,
  onStops: onStops,
  onStopsLive: onStopsLive,
  onLiveEnd: onLiveEnd,
  minStops = 2,
  maxStops = 8,
  disabled: isDisabled = false,
  renderStopPicker: renderStopPicker,
  testid: testid,
}: Dynamic): Dynamic {
  useUiLocale();
  let [liveStops, setLiveStops]: Dynamic = (0,
    reactPropertiesTooltip_2.useState)(null),
    currentStops: Dynamic = liveStops ?? stops,
    hasLiveEditRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(false),
    sortedPositions: Dynamic = normalizedGradientStops(currentStops),
    positions: Dynamic =
      hasLiveEditRef.current || liveStops !== null
        ? currentStops.map(
            (stop?: Dynamic, index?: Dynamic): Dynamic =>
              stop.pos === undefined
                ? sortedPositions[index]
                : PropertiesSelectMin(stop.pos, 0, 100),
          )
        : sortedPositions,
    stopColor: Dynamic = (stop?: Dynamic): Dynamic =>
      stop.swatch ?? stop.color,
    colorSignature: Dynamic = currentStops.map(stopColor).join("\0"),
    resolveColor: Dynamic = (0,
    reactPropertiesTooltip_2.useMemo)((): Dynamic => {
      let entries: Dynamic = new Map();
      for (let color of colorSignature.split("\0") as Dynamic)
        entries.has(color) ||
          entries.set(
            color,
            PropertiesGradientEditorAttrCalcPattern.test(color) ||
              PropertiesGradientEditorPattern.test(color)
              ? "transparent"
              : PropertiesGradientEditorHandler(color),
          );
      return (color?: Dynamic): Dynamic =>
        entries.get(color) ?? "transparent";
    }, [colorSignature]),
    selectedIndex: Dynamic = PropertiesSelectMin(
      selected,
      0,
      Math.max(0, currentStops.length - 1),
    ),
    barRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(null),
    containerRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(null),
    stopIdsRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)([]),
    nextStopIdRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(0);
  stopIdsRef.current.length !== currentStops.length &&
    (stopIdsRef.current = currentStops.map((): Dynamic => nextStopIdRef.current++));
  let stopIds: Dynamic = stopIdsRef.current,
    getPopoverAnchor: Dynamic = (): Dynamic =>
      containerRef.current?.closest('[data-mc-popover], [role="dialog"]') ??
      containerRef.current,
    [openPickerId, setOpenPickerId]: Dynamic = (0,
    reactPropertiesTooltip_2.useState)(null),
    [shouldFocusPicker, setShouldFocusPicker]: Dynamic = (0,
    reactPropertiesTooltip_2.useState)(false),
    openPickerIndex: Dynamic =
      openPickerId !== null && stopIds.includes(openPickerId)
        ? stopIds.indexOf(openPickerId)
        : null,
    dragRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(null),
    latestPropsRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)({
      stops: stops,
      onStopsLive: onStopsLive,
      onLiveEnd: onLiveEnd,
    });
  latestPropsRef.current = {
    stops: stops,
    onStopsLive: onStopsLive,
    onLiveEnd: onLiveEnd,
  };
  let revertDrag: Dynamic = (drag?: Dynamic): Dynamic => {
    let {
        stops: latestStops,
        onStopsLive: latestOnStopsLive,
        onLiveEnd: latestOnLiveEnd,
      }: Dynamic = latestPropsRef.current,
      stopIndex: Dynamic = stopIdsRef.current.indexOf(drag.id);
    latestOnStopsLive &&
      stopIndex >= 0 &&
      stopIndex < latestStops.length &&
      latestOnStopsLive(
        latestStops.map(
          (stop?: Dynamic, index?: Dynamic): Dynamic =>
            index === stopIndex
              ? {
                  ...stop,
                  pos: drag.posBefore,
                }
              : stop,
        ),
      );
    latestOnLiveEnd?.();
  };
  (0, reactPropertiesTooltip_2.useEffect)(
    (): Dynamic => (): Dynamic => {
      let drag: Dynamic = dragRef.current;
      drag?.moved && revertDrag(drag);
    },
    [],
  );
  let suppressClickRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(false),
    withNormalizedPositions: Dynamic = (stopList?: Dynamic): Dynamic =>
      stopList.map(
        (stop?: Dynamic, index?: Dynamic): Dynamic =>
          stop.locked === true
            ? stop
            : {
                ...stop,
                pos:
                  Math.round(
                    (stopList === currentStops
                      ? positions[index]
                      : normalizedGradientStops(stopList)[index]) * 100,
                  ) / 100,
              },
      ),
    hasLockedStop: Dynamic = currentStops.some(
      (stop?: Dynamic): Dynamic => stop.locked === true,
    ),
    moveStop: Dynamic = (
      stopList?: Dynamic,
      stopIndex?: Dynamic,
      newPosition?: Dynamic,
    ): Dynamic => {
      let minPosition: Dynamic = hasLockedStop && stopIndex > 0 ? positions[stopIndex - 1] : 0,
        maxPosition: Dynamic =
          hasLockedStop && stopIndex < stopList.length - 1 ? positions[stopIndex + 1] : 100;
      return withNormalizedPositions(stopList).map(
        (stop?: Dynamic, index?: Dynamic): Dynamic =>
          index === stopIndex
            ? {
                ...stop,
                pos: Math.round(
                  PropertiesSelectMin(newPosition, minPosition, maxPosition),
                ),
              }
            : stop,
      );
    },
    previewStops: Dynamic = (nextStops?: Dynamic): Dynamic => {
      hasLiveEditRef.current = true;
      onStopsLive ? onStopsLive(nextStops) : setLiveStops(nextStops);
    },
    restoreFocus: Dynamic = (index?: Dynamic): Dynamic => {
      let activeElement: Dynamic = (document as Dynamic).activeElement,
        container: Dynamic = containerRef.current;
      if (
        !container ||
        !(activeElement instanceof HTMLElement) ||
        !container.contains(activeElement)
      )
        return;
      let focusSelector: Dynamic = activeElement.matches('button[role="slider"]')
        ? 'button[role="slider"]'
        : activeElement.matches("input") &&
            activeElement.closest('[role="listitem"]') !== null
          ? '[role="listitem"] input'
          : null;
      focusSelector !== null &&
        requestAnimationFrame(
          (): Dynamic => container.querySelectorAll(focusSelector)[index]?.focus(),
        );
    },
    reorderCountRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(0),
    commitStops: Dynamic = (nextStops?: Dynamic, movedIndex?: Dynamic): Dynamic => {
      let hasLocked: Dynamic = nextStops.some(
          (stop?: Dynamic): Dynamic => stop.locked === true,
        ),
        order: Dynamic = nextStops.map(
          (stop?: Dynamic, index?: Dynamic): Dynamic => index,
        );
      hasLocked ||
        order.sort(
          (indexA?: Dynamic, indexB?: Dynamic): Dynamic =>
            nextStops[indexA].pos - nextStops[indexB].pos || indexA - indexB,
        );
      let newIndex: Dynamic = Math.max(0, order.indexOf(movedIndex)),
        sortedStops: Dynamic = order.map(
          (orderIndex?: Dynamic): Dynamic => nextStops[orderIndex],
        );
      stopIdsRef.current = order.map(
        (orderIndex?: Dynamic): Dynamic => stopIdsRef.current[orderIndex],
      );
      hasLiveEditRef.current = false;
      newIndex !== movedIndex &&
        ((reorderCountRef.current += 1), onStopsLive?.(sortedStops), restoreFocus(newIndex));
      setLiveStops(null);
      onLiveEnd?.();
      onStops(sortedStops);
      onSelect(newIndex);
      return newIndex;
    },
    visibleStopCount: Dynamic = currentStops.filter(
      (stop?: Dynamic): Dynamic => stop.hint !== true,
    ).length,
    canRemove: Dynamic = visibleStopCount > minStops || visibleStopCount < currentStops.length,
    canRemoveStop: Dynamic = (index?: Dynamic): Dynamic =>
      !isDisabled &&
      currentStops.length > 0 &&
      (currentStops[index]?.hint === true ? true : visibleStopCount > minStops),
    removeStop: Dynamic = (removeIndex?: Dynamic): Dynamic => {
      if (!canRemoveStop(removeIndex)) return currentStops.length;
      let keepMask: Dynamic = currentStops.map(
        (stop?: Dynamic, index?: Dynamic): Dynamic => index !== removeIndex,
      );
      for (let changed: Dynamic = true; changed; ) {
        changed = false;
        let keptIndices: Dynamic = currentStops
          .map((stop?: Dynamic, index?: Dynamic): Dynamic => index)
          .filter((index?: Dynamic): Dynamic => keepMask[index]);
        keptIndices.forEach((stopIndex?: Dynamic, position?: Dynamic): Dynamic => {
          if (currentStops[stopIndex].hint !== true || !keepMask[stopIndex]) return;
          let isFirst: Dynamic = position === 0,
            isLast: Dynamic = position === keptIndices.length - 1,
            followsHint: Dynamic =
              position > 0 && currentStops[keptIndices[position - 1]].hint === true;
          (isFirst || isLast || followsHint) &&
            ((keepMask[stopIndex] = false), (changed = true));
        });
      }
      let remainingStops: Dynamic = withNormalizedPositions(currentStops).filter(
        (stop?: Dynamic, index?: Dynamic): Dynamic => keepMask[index],
      );
      stopIdsRef.current = stopIdsRef.current.filter(
        (stop?: Dynamic, index?: Dynamic): Dynamic => keepMask[index],
      );
      setOpenPickerId(null);
      onStops(remainingStops);
      let removedBeforeCount: Dynamic = keepMask
        .slice(0, selectedIndex + 1)
        .filter((isKept?: Dynamic): Dynamic => !isKept).length;
      onSelect(
        PropertiesSelectMin(
          keepMask[selectedIndex]
            ? selectedIndex - removedBeforeCount
            : selectedIndex -
                removedBeforeCount +
                (selectedIndex - removedBeforeCount + 1 < remainingStops.length ? 1 : 0),
          0,
          Math.max(0, remainingStops.length - 1),
        ),
      );
      return remainingStops.length;
    },
    addStop: Dynamic = (): Dynamic => {
      if (isDisabled || currentStops.length >= maxStops || currentStops.length === 0)
        return;
      let baseIndex: Dynamic = selectedIndex,
        hasNext: Dynamic = baseIndex < currentStops.length - 1,
        basePosition: Dynamic = positions[baseIndex],
        neighborPosition: Dynamic = hasNext
          ? positions[baseIndex + 1]
          : (positions[baseIndex - 1] ?? 0),
        newStop: Dynamic = {
          color:
            (currentStops[baseIndex].locked === true
              ? currentStops.find(
                  (stop?: Dynamic): Dynamic => stop.locked !== true,
                )
              : currentStops[baseIndex]
            )?.color ?? "#808080",
          pos: Math.round((basePosition + neighborPosition) / 2),
        },
        insertIndex: Dynamic = hasNext ? baseIndex + 1 : baseIndex,
        normalizedStops: Dynamic = withNormalizedPositions(currentStops);
      stopIdsRef.current = [
        ...stopIdsRef.current.slice(0, insertIndex),
        nextStopIdRef.current++,
        ...stopIdsRef.current.slice(insertIndex),
      ];
      onStops([
        ...normalizedStops.slice(0, insertIndex),
        newStop,
        ...normalizedStops.slice(insertIndex),
      ]);
      onSelect(insertIndex);
    },
    trackRef: Dynamic = (0, reactPropertiesTooltip_2.useRef)(null),
    pointerToPercent: Dynamic = (event?: Dynamic): Dynamic => {
      let bounds: Dynamic = (
        trackRef.current ?? barRef.current
      ).getBoundingClientRect();
      return (
        ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 100
      );
    },
    createPointerDownHandler: Dynamic =
      (index?: Dynamic): Dynamic =>
      (event?: Dynamic): Dynamic => {
        if (
          isDisabled ||
          event.button !== 0 ||
          dragRef.current !== null ||
          currentStops[index]?.locked === true
        )
          return;
        event.preventDefault();
        let reorderCountAtDown: Dynamic = reorderCountRef.current,
          activeElement: Dynamic = (document as Dynamic).activeElement;
        activeElement instanceof HTMLElement &&
          activeElement !== event.currentTarget &&
          containerRef.current?.contains(activeElement) &&
          activeElement.blur();
        reorderCountRef.current === reorderCountAtDown &&
          (event.currentTarget.setPointerCapture(event.pointerId),
          event.currentTarget.focus(),
          (dragRef.current = {
            index: index,
            id: stopIds[index],
            pointer: event.pointerId,
            x0: event.clientX,
            moved: false,
            last: positions[index],
            posBefore: positions[index],
          }),
          (suppressClickRef.current = false),
          onSelect(index));
      },
    handlePointerMove: Dynamic = (event?: Dynamic): Dynamic => {
      let drag: Dynamic = dragRef.current;
      !drag ||
        drag.pointer !== event.pointerId ||
        !event.currentTarget.hasPointerCapture(event.pointerId) ||
        (!drag.moved && Math.abs(event.clientX - drag.x0) < 3) ||
        ((drag.moved = true),
        (drag.last = pointerToPercent(event)),
        previewStops(moveStop(currentStops, drag.index, drag.last)));
    },
    endDrag: Dynamic = (event?: Dynamic, shouldCommit?: Dynamic): Dynamic => {
      let drag: Dynamic = dragRef.current;
      !drag ||
        drag.pointer !== event.pointerId ||
        ((dragRef.current = null),
        event.currentTarget.hasPointerCapture(event.pointerId) &&
          event.currentTarget.releasePointerCapture(event.pointerId),
        drag.moved &&
          (shouldCommit
            ? ((suppressClickRef.current = true),
              commitStops(
                moveStop(currentStops, drag.index, drag.last),
                drag.index,
              ))
            : ((hasLiveEditRef.current = false),
              setLiveStops(null),
              onStopsLive ? revertDrag(drag) : onLiveEnd?.())));
    },
    createKeyDownHandler: Dynamic =
      (index?: Dynamic): Dynamic =>
      (event?: Dynamic): Dynamic => {
        if (
          isDisabled ||
          (currentStops[index]?.locked === true &&
            event.key !== "Delete" &&
            event.key !== "Backspace")
        )
          return;
        let stepSize: Dynamic = event.shiftKey ? 10 : 1,
          currentPosition: Dynamic = positions[index],
          nextPosition: Dynamic = null;
        if (event.key === "ArrowLeft" || event.key === "ArrowDown")
          nextPosition = currentPosition - stepSize;
        else if (event.key === "ArrowRight" || event.key === "ArrowUp")
          nextPosition = currentPosition + stepSize;
        else if (event.key === "Home") nextPosition = 0;
        else if (event.key === "End") nextPosition = 100;
        else if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          if (canRemoveStop(index)) {
            let remainingCount: Dynamic = removeStop(index),
              focusIndex: Dynamic = Math.min(index, remainingCount - 1);
            requestAnimationFrame(
              (): Dynamic =>
                trackRef.current
                  ?.querySelectorAll('button[role="slider"]')
                  [focusIndex]?.focus(),
            );
          }
          return;
        }
        nextPosition !== null &&
          (event.preventDefault(),
          event.stopPropagation(),
          commitStops(moveStop(currentStops, index, nextPosition), index));
      },
    toTrackOffset: Dynamic = (percent?: Dynamic): Dynamic =>
      "calc(0.75rem + (100% - 1.5rem) * " + String(percent / 100) + ")",
    colorStops: Dynamic = currentStops.flatMap(
      (stop?: Dynamic, index?: Dynamic): Dynamic =>
        stop.hint === true
          ? []
          : [resolveColor(stopColor(stop)) + " " + toTrackOffset(positions[index])],
    ),
    barGradient: Dynamic =
      "linear-gradient(90deg, " +
      (colorStops.length >= 2
        ? colorStops
        : ["transparent 0%", "transparent 100%"]
      ).join(", ") +
      ")";
  return (
    <div
      ref={containerRef}
      data-testid={testid}
      data-kit={"gradient-editor"}
      className={"flex flex-col"}
    >
      <PropertyRow label={uiMessage("inspector.gradientEditor.style")}>
        <div className={"flex min-w-0 flex-1 items-center gap-2"}>
          <div className={"min-w-0 flex-1"}>
            <PropertySelect
              aria-label={uiMessage("inspector.gradientEditor.gradientStyle")}
              items={PropertiesGradientEditorHandler_2(
                onRadial !== undefined,
              )}
              value={radial ? "radial" : "linear"}
              disabled={isDisabled}
              onChange={(nextStyle?: Dynamic): Dynamic => {
                (nextStyle === "radial") !== radial &&
                  onRadial?.(nextStyle === "radial");
              }}
            />
          </div>
          <div
            className={"w-[4.75rem] shrink-0"}
            title={radial ? (uiMessage("inspector.gradientEditor.aRadialGradientHasNo")) : (undefined)}
          >
            <NumericInput
              aria-label={uiMessage("inspector.gradientEditor.angle")}
              prefix={
                <PropertyOptionIcon
                  icon={angleIcon}
                />
              }
              value={radial ? undefined : angle}
              placeholder={radial ? ("\u2013") : ("180")}
              ownUnit={"deg"}
              min={0}
              max={360}
              step={1}
              steppers={false}
              disabled={isDisabled || radial}
              onValue={(nextAngle?: Dynamic): Dynamic =>
                onAngle(
                  nextAngle === undefined
                    ? undefined
                    : PropertiesSelectMin(nextAngle, 0, 360),
                )
              }
              {...(onAngleScrub
                ? {
                    onScrub: (angleValue?: Dynamic): Dynamic =>
                      onAngleScrub(
                        PropertiesSelectMin(angleValue, 0, 360),
                      ),
                    onScrubEnd: onAngleScrubEnd,
                  }
                : {})}
            />
          </div>
        </div>
      </PropertyRow>
      <div
        className={joinClassNames(
          PropertiesPrimitivesClassNames_3,
          "pt-3 pb-4",
        )}
      >
        <div
          ref={barRef}
          data-kit={"gradient-bar"}
          className={
            "relative h-8 rounded shadow-card-ring bg-[repeating-conic-gradient(var(--cds-alpha-2)_0_25%,transparent_0_50%)] bg-[length:8px_8px]"
          }
        >
          <div
            className={"absolute inset-0 rounded"}
            style={{
              background: barGradient,
            }}
          />
          <div ref={trackRef} className={"absolute inset-y-0 left-3 right-3"}>
            {currentStops.map(
              (stop?: Dynamic, index?: Dynamic): Dynamic =>
                (() => {
                  const _Component = "button";
                  const _props = {
                    type: "button",
                    role: "slider",
                    get "aria-label"() { return uiMessage("inspector.gradientEditor.stopPosition", { value1: String(String(index + 1)) }); },
                    "aria-valuemin": 0,
                    "aria-valuemax": 100,
                    "aria-valuenow": Math.round(positions[index]),
                    "aria-valuetext":
                      String(Math.round(positions[index])) + "%",
                    "data-selected": index === selectedIndex ? "" : undefined,
                    disabled: isDisabled,
                    "aria-disabled": stop.locked === true ? true : undefined,
                    title:
                      stop.locked === true
                        ? WrittenByHandInAFormMessage
                        : undefined,
                    className: joinClassNames(
                      "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-default touch-none rounded-full border-2 border-white p-0 shadow-card-ring",
                      "focus-visible:shadow-focus pointer-coarse:h-6 pointer-coarse:w-6",
                      index === selectedIndex
                        ? "z-[1] outline outline-2 outline-offset-1 outline-border-strong"
                        : "outline-none focus-visible:outline-hidden",
                    ),
                    style: {
                      left: String(positions[index]) + "%",
                      background: resolveColor(stopColor(stop)),
                    },
                    onPointerDown: createPointerDownHandler(index),
                    onPointerMove: handlePointerMove,
                    onPointerUp: (event?: Dynamic): Dynamic =>
                      endDrag(event, true),
                    onPointerCancel: (event?: Dynamic): Dynamic =>
                      endDrag(event, false),
                    onLostPointerCapture: (event?: Dynamic): Dynamic =>
                      endDrag(event, false),
                    onKeyDown: createKeyDownHandler(index),
                    onClick: (): Dynamic => {
                      suppressClickRef.current
                        ? (suppressClickRef.current = false)
                        : onSelect(index);
                    },
                  } as const;
                  const _key = stopIds[index];
                  return <_Component key={_key} {..._props} />;
                })(),
            )}
          </div>
        </div>
      </div>
      <PropertyRow label={uiMessage("inspector.gradientEditor.stops")}>
        <div className={"flex min-w-0 flex-1 justify-end"}>
          <Button
            variant={"ghost"}
            size={"sm"}
            iconOnly={true}
            icon={"Add"}
            aria-label={uiMessage("inspector.gradientEditor.addStop")}
            disabled={isDisabled || currentStops.length >= maxStops}
            disabledReason={uiMessage("inspector.gradientEditor.stopsAtMost", { value1: String(String(maxStops)) })}
            onClick={addStop}
          />
        </div>
      </PropertyRow>
      <div
        role={"list"}
        aria-label={uiMessage("inspector.gradientEditor.stops")}
        className={joinClassNames(
          PropertiesPrimitivesClassNames_3,
          "mt-1 flex flex-col gap-2",
        )}
      >
        {currentStops.map((stop?: Dynamic, index?: Dynamic): Dynamic => {
          let isEditableColor: Dynamic =
            !PropertiesGradientEditorAttrCalcPattern.test(stopColor(stop)) &&
            !PropertiesGradientEditorPattern.test(stopColor(stop));
          return (() => {
            const StopRowTag = "div";
            const stopRowProps = {
              role: "listitem",
              className: "flex min-w-0 items-center gap-2",
              children: [
                <div className={"w-[3.75rem] shrink-0"}>
                  <NumericInput
                    aria-label={uiMessage("inspector.gradientEditor.stopPosition", { value1: String(String(index + 1)) })}
                    value={Math.round(positions[index])}
                    unit={"%"}
                    min={0}
                    max={100}
                    step={1}
                    smallStep={1}
                    steppers={false}
                    disabled={isDisabled || stop.locked === true}
                    title={
                      stop.locked === true ? (WrittenByHandInAFormMessage) : (undefined)
                    }
                    onValue={(nextPosition?: Dynamic): Dynamic =>
                      commitStops(
                        moveStop(currentStops, index, nextPosition ?? positions[index]),
                        index,
                      )
                    }
                    onScrub={(scrubPosition?: Dynamic): Dynamic =>
                      previewStops(moveStop(currentStops, index, scrubPosition))
                    }
                    onScrubEnd={(): Dynamic =>
                      commitStops(
                        moveStop(currentStops, index, positions[index]),
                        index,
                      )
                    }
                  />
                </div>,
                <span className={"relative flex min-w-0 flex-1"}>
                  <EditorPopover
                    open={openPickerIndex === index}
                    onOpen={(): Dynamic => setOpenPickerId(stopIds[index])}
                    onClose={(): Dynamic => setOpenPickerId(null)}
                    trigger={
                      <PropertyPickerButton
                        aria-label={
                          uiMessage("inspector.gradientEditor.stopColor", { value1: String(String(index + 1)), value2: String(PropertiesGradientEditorTest(stop.color)) })
                        }
                        data-selected={index === selectedIndex ? "" : undefined}
                        disabled={isDisabled}
                        onClick={(clickEvent?: Dynamic): Dynamic => {
                          onSelect(index);
                          setShouldFocusPicker(clickEvent.detail === 0);
                        }}
                        className={joinClassNames(
                          "min-w-0 cursor-default",
                          index === selectedIndex && "bg-fill-ghost-hover",
                        )}
                        chip={
                          <PropertyColorWell
                            background={
                              isEditableColor ? resolveColor(stopColor(stop)) : undefined
                            }
                          />
                        }
                      >
                        {PropertiesGradientEditorTest(stop.color)}
                      </PropertyPickerButton>
                    }
                    side={"left"}
                    positionAnchor={getPopoverAnchor}
                    padding={"none"}
                    className={ColorPickerLabel}
                    focusOnOpen={shouldFocusPicker}
                    popupAttrs={{
                      "data-kit-stop-picker": String(index),
                    }}
                  >
                    {openPickerIndex === index ? (renderStopPicker(index)) : (null)}
                  </EditorPopover>
                </span>,
                canRemove ? (
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    iconOnly={true}
                    icon={"Minus"}
                    aria-label={uiMessage("inspector.gradientEditor.removeStop", { value1: String(String(index + 1)) })}
                    disabled={!canRemoveStop(index)}
                    disabledReason={
                      (("A gradient needs ") + (String(minStops))) + (" color stops.")
                    }
                    onClick={(): Dynamic => removeStop(index)}
                  />
                ) : null,
              ],
            } as const;
            const stopRowKey = stopIds[index];
            return <StopRowTag key={stopRowKey} {...stopRowProps} />;
          })();
        })}
      </div>
    </div>
  );
}
export {
  GradientEditor,
  jsxPropertiesGradientEditor,
  normalizedGradientStops,
  PropertiesGradientEditorAttrCalcPattern,
  PropertiesGradientEditorColorMixPattern,
  PropertiesGradientEditorHandler,
  PropertiesGradientEditorHandler_2,
  PropertiesGradientEditorImageCrossFadePattern,
  PropertiesGradientEditorLabel,
  PropertiesGradientEditorPattern,
  PropertiesGradientEditorTest,
  WrittenByHandInAFormMessage,
};
export function installEditorPropertiesGradientEditor(): () => void {
  return () => {
    PropertiesGradientEditorHandler = (color?: Dynamic): Dynamic =>
      hsvaToRgbaCss(parseHsvaColor(color));
    PropertiesGradientEditorTest = (color?: Dynamic): Dynamic =>
      /^#[0-9a-f]{3,8}$/i.test(color.trim())
        ? color.trim().toUpperCase()
        : color.trim();
    PropertiesGradientEditorAttrCalcPattern =
      /\b(var|env|attr|calc|color-mix)\(|^\s*(currentcolor|inherit|initial|unset)\s*$/i;
    PropertiesGradientEditorPattern = /^\s*-?[\d.]+[a-z%]*\s*$/i;
    WrittenByHandInAFormMessage =
      uiMessage("inspector.gradientEditor.writtenByHandInA");
    PropertiesGradientEditorHandler_2 = (canChooseRadial?: Dynamic): Dynamic => [
      {
        value: "linear",
        get label() { return uiMessage("inspector.gradientEditor.linear"); },
      },
      {
        value: "radial",
        get label() { return uiMessage("inspector.gradientEditor.radial"); },
        disabled: !canChooseRadial,
        get title() { return canChooseRadial ? (undefined) : (uiMessage("inspector.gradientEditor.linearGradientsOnlyHere")); },
      },
    ];
    jsxPropertiesGradientEditor = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesGradientEditorColorMixPattern = /^\s*(var|color-mix)\(/i;
    PropertiesGradientEditorImageCrossFadePattern =
      /url\s*\(|image(-set)?\s*\(|src\s*\(|cross-fade\s*\(|element\s*\(|\\/i;
    PropertiesGradientEditorLabel = (stopEntry?: Dynamic): Dynamic =>
      stopEntry.label ?? stopEntry.name[0].toUpperCase() + stopEntry.name.slice(1);
  };
}

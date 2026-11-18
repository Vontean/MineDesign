import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { PeerCursorGlyph } from "../collaboration/peer-cursors";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactCanvasWorkingLabelAnimation: Dynamic;
var reactCanvasWorkingLabelAnimation_2: Dynamic;
var CanvasWorkingLabelAnimationHandler: Dynamic;
var CanvasWorkingLabelAnimationPow: Dynamic;
var CanvasWorkingLabelAnimationHandler_2: Dynamic;
var CanvasWorkingLabelAnimationReduce: Dynamic;
var jsxCanvasWorkingLabelAnimation: Dynamic;
var CanvasWorkingLabelAnimationLabel: Dynamic;
var labelBoxWidth: Dynamic;
var labelBoxHeight: Dynamic;
var edgePadding: Dynamic;
var springStiffness: Dynamic;
var springDamping: Dynamic;
var wanderDelayMin: Dynamic;
var wanderDelayJitter: Dynamic;
function createSeededRandom(seed?: Dynamic): Dynamic {
  let state: Dynamic = seed >>> 0;
  return (): Dynamic => {
    state = (state + 1831565813) >>> 0;
    let mixed: Dynamic = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
function workingLabelPosition(
  origin?: Dynamic,
  strokes?: Dynamic,
  time?: Dynamic,
): Dynamic {
  let x: Dynamic = origin.x,
    y: Dynamic = origin.y;
  for (let stroke of strokes as Dynamic) {
    let progress: Dynamic = (time - stroke.t0) / stroke.T;
    if (progress <= 0) continue;
    let eased: Dynamic = CanvasWorkingLabelAnimationPow(progress);
    x += stroke.dx * eased;
    y += stroke.dy * eased;
    let length: Dynamic = Math.hypot(stroke.dx, stroke.dy);
    if (length > 0 && stroke.bend !== 0 && progress < 1) {
      let bendScale: Dynamic =
        (stroke.bend * CanvasWorkingLabelAnimationHandler_2(progress)) / length;
      x += -stroke.dy * bendScale;
      y += stroke.dx * bendScale;
    }
  }
  return {
    x: x,
    y: y,
  };
}
function workingLabelTravel(
  random?: Dynamic,
  fromPoint?: Dynamic,
  toPoint?: Dynamic,
  startTime?: Dynamic,
  bendSign?: Dynamic,
): Dynamic {
  let dx: Dynamic = toPoint.x - fromPoint.x,
    dy: Dynamic = toPoint.y - fromPoint.y,
    distance: Dynamic = Math.hypot(dx, dy),
    stretch: Dynamic =
      random() < 0.75 ? 0.05 + 0.08 * random() : -(0.05 + 0.06 * random()),
    skew: Dynamic = (random() - 0.5) * 0.1,
    state: Dynamic = {
      t0: startTime,
      T: 0.9 + 0.25 * random() + Math.min(0.2, distance / 600),
      dx: dx * (1 + stretch) - dy * skew,
      dy: dy * (1 + stretch) + dx * skew,
      bend: bendSign * (0.1 + 0.1 * random()) * distance,
    };
  return [
    state,
    {
      t0: startTime + (0.7 + 0.08 * random()) * state.T,
      T: 0.5 + 0.2 * random(),
      dx: dx - state.dx,
      dy: dy - state.dy,
      bend: 0,
    },
  ];
}
function workingLabelSweep(
  random: Dynamic,
  { rx: rx, ry: ry }: Dynamic,
): Dynamic {
  let direction: Dynamic = random() < 0.65 ? 1 : -1,
    restPoint: Dynamic = {
      x: (random() - 0.5) * 0.3 * rx,
      y: (random() - 0.3) * 0.4 * ry,
    },
    bendSign: Dynamic = random() < 0.7 ? direction : -direction,
    yOffset: Dynamic = bendSign === direction ? 0 : 0.2,
    startPoint: Dynamic = {
      x: direction * (0.72 + 0.2 * random()) * rx,
      y: (0.65 - yOffset + 0.3 * random()) * ry,
    };
  if (random() < 0.6)
    return {
      from: startPoint,
      strokes: workingLabelTravel(random, startPoint, restPoint, 0, bendSign),
      rest: restPoint,
    };
  let reversePoint: Dynamic = {
      x: restPoint.x + direction * (0.1 + 0.3 * random()) * rx,
      y: restPoint.y - (0.4 + 0.4 * random()) * ry,
    },
    firstStroke: Dynamic = {
      t0: 0,
      T: 0.85 + 0.2 * random(),
      dx: reversePoint.x - startPoint.x,
      dy: reversePoint.y - startPoint.y,
      bend:
        bendSign * 0.12 * Math.hypot(reversePoint.x - startPoint.x, reversePoint.y - startPoint.y),
    };
  return {
    from: startPoint,
    strokes: [
      firstStroke,
      ...workingLabelTravel(
        random,
        reversePoint,
        restPoint,
        (0.5 + 0.1 * random()) * firstStroke.T,
        -bendSign,
      ),
    ],
    rest: restPoint,
  };
}
function workingLabelWander(
  random: Dynamic,
  fromPoint: Dynamic,
  { rx: rx, ry: ry }: Dynamic,
  startTime?: Dynamic,
): Dynamic {
  let clamp: Dynamic = (amount?: Dynamic, limit?: Dynamic): Dynamic =>
      Math.min(limit, Math.max(-limit, amount)),
    farthestPoint: Dynamic = fromPoint,
    farthestDistance: Dynamic = -1;
  for (let index: Dynamic = 0; index < 8 && farthestDistance < 30; index++) {
    let angle: Dynamic = random() * 2 * Math.PI,
      radius: Dynamic = 30 + 50 * random(),
      candidate: Dynamic = {
        x: clamp(fromPoint.x + radius * Math.cos(angle), 0.62 * rx),
        y: clamp(fromPoint.y + 0.6 * radius * Math.sin(angle), 0.5 * ry),
      },
      candidateDistance: Dynamic = Math.hypot(candidate.x - fromPoint.x, candidate.y - fromPoint.y);
    candidateDistance > farthestDistance && ((farthestDistance = candidateDistance), (farthestPoint = candidate));
  }
  return {
    strokes: workingLabelTravel(
      random,
      fromPoint,
      farthestPoint,
      startTime,
      random() < 0.5 ? 1 : -1,
    ),
    rest: farthestPoint,
  };
}
function animateWorkingLabel(
  labelElement?: Dynamic,
  cursorElement?: Dynamic,
  tagElement?: Dynamic,
  prefersReducedMotion?: Dynamic,
): Dynamic {
  let isStatic: Dynamic = prefersReducedMotion || typeof requestAnimationFrame != "function",
    clientWidth: Dynamic = labelElement.clientWidth,
    clientHeight: Dynamic = labelElement.clientHeight,
    getRadii: Dynamic = (): Dynamic => ({
      rx: Math.max(
        0,
        (clientWidth -
          labelBoxWidth -
          2 * edgePadding) /
          2,
      ),
      ry: Math.max(
        0,
        (clientHeight -
          labelBoxHeight -
          2 * edgePadding) /
          2,
      ),
    }),
    random: Dynamic = createSeededRandom(Math.random() * 4294967296),
    sweep: Dynamic = workingLabelSweep(random, getRadii()),
    from: Dynamic = sweep.from,
    strokes: Dynamic = sweep.strokes,
    tagX: Dynamic = Number.NaN,
    tagY: Dynamic = 0,
    tagVelocityX: Dynamic = 0,
    tagVelocityY: Dynamic = 0,
    elapsed: Dynamic = 0.18,
    lastTimestamp: Dynamic = -1,
    frameHandle: Dynamic = 0,
    idleTimer: Dynamic,
    tick: Dynamic = (timestamp?: Dynamic): Dynamic => {
      let deltaTime: Dynamic =
        lastTimestamp < 0 ? 0 : Math.min(0.05, Math.max(0, (timestamp - lastTimestamp) / 1e3));
      lastTimestamp = timestamp;
      elapsed += deltaTime;
      let { rx: radiusX, ry: radiusY }: Dynamic = getRadii(),
        targetOffset: Dynamic = isStatic
          ? sweep.rest
          : workingLabelPosition(from, strokes, elapsed),
        cursorX: Dynamic =
          edgePadding +
          radiusX +
          Math.min(radiusX, Math.max(-radiusX, targetOffset.x)),
        cursorY: Dynamic =
          edgePadding +
          radiusY +
          Math.min(radiusY, Math.max(-radiusY, targetOffset.y));
      (isStatic || Number.isNaN(tagX)) && ((tagX = cursorX), (tagY = cursorY));
      for (let remaining: Dynamic = deltaTime; remaining > 0; remaining -= 0.008) {
        let stepTime: Dynamic = Math.min(0.008, remaining);
        tagVelocityX +=
          (springStiffness * (cursorX - tagX) -
            springDamping * tagVelocityX) *
          stepTime;
        tagVelocityY +=
          (springStiffness * (cursorY - tagY) -
            springDamping * tagVelocityY) *
          stepTime;
        tagX += tagVelocityX * stepTime;
        tagY += tagVelocityY * stepTime;
      }
      let isMoving: Dynamic =
        !isStatic &&
        (elapsed < CanvasWorkingLabelAnimationReduce(strokes) ||
          Math.abs(cursorX - tagX) + Math.abs(cursorY - tagY) > 0.05 ||
          Math.abs(tagVelocityX) + Math.abs(tagVelocityY) > 1);
      isMoving || ((tagX = cursorX), (tagY = cursorY), (tagVelocityX = tagVelocityY = 0));
      cursorElement.style.transform =
        "translate(" +
        cursorX.toFixed(2) +
        "px," +
        cursorY.toFixed(2) +
        "px)";
      tagElement.style.transform =
        "translate(" + tagX.toFixed(2) + "px," + tagY.toFixed(2) + "px)";
      return isMoving;
    },
    handleFrame: Dynamic = (timestamp?: Dynamic): Dynamic => {
      frameHandle = tick(timestamp) ? requestAnimationFrame(handleFrame) : 0;
      frameHandle === 0 && scheduleWander();
    },
    startFrames: Dynamic = (): Dynamic => {
      lastTimestamp = -1;
      frameHandle = requestAnimationFrame(handleFrame);
    },
    scheduleWander: Dynamic = (): Dynamic => {
      idleTimer = setTimeout(
        (): Dynamic => {
          from = workingLabelPosition(from, strokes, elapsed);
          strokes = workingLabelWander(
            random,
            from,
            getRadii(),
            elapsed,
          ).strokes;
          startFrames();
        },
        (wanderDelayMin +
          wanderDelayJitter * random()) *
          1e3,
      );
    },
    resizeObserver: Dynamic =
      typeof ResizeObserver == "function"
        ? new ResizeObserver((): Dynamic => {
            clientWidth = labelElement.clientWidth;
            clientHeight = labelElement.clientHeight;
            frameHandle === 0 && ((tagX = Number.NaN), tick(lastTimestamp));
          })
        : null;
  resizeObserver?.observe(labelElement);
  tick(typeof performance == "object" ? performance.now() : 0);
  isStatic || startFrames();
  return (): Dynamic => {
    frameHandle !== 0 && cancelAnimationFrame(frameHandle);
    clearTimeout(idleTimer);
    resizeObserver?.disconnect();
  };
}
function ClaudeWorkingLabel({
  working: working,
  tint: tint,
  idle: idle,
  action: action,
  busy: busy,
}: Dynamic): Dynamic {
  useUiLocale();
  let containerRef: Dynamic = (0, reactCanvasWorkingLabelAnimation_2.useRef)(null),
    cursorRef: Dynamic = (0, reactCanvasWorkingLabelAnimation_2.useRef)(null),
    tagRef: Dynamic = (0, reactCanvasWorkingLabelAnimation_2.useRef)(null);
  (0, reactCanvasWorkingLabelAnimation_2.useLayoutEffect)((): Dynamic => {
    let containerElement: Dynamic = containerRef.current,
      cursorElement: Dynamic = cursorRef.current,
      tagElement: Dynamic = tagRef.current;
    if (!working || !containerElement || !cursorElement || !tagElement) return;
    let motionQuery: Dynamic =
        typeof matchMedia == "function"
          ? matchMedia("(prefers-reduced-motion: reduce)")
          : null,
      stopAnimation: Dynamic = animateWorkingLabel(
        containerElement,
        cursorElement,
        tagElement,
        motionQuery?.matches === true,
      ),
      handleMotionChange: Dynamic = (): Dynamic => {
        stopAnimation();
        stopAnimation = animateWorkingLabel(
          containerElement,
          cursorElement,
          tagElement,
          motionQuery?.matches === true,
        );
      };
    motionQuery?.addEventListener?.("change", handleMotionChange);
    return (): Dynamic => {
      motionQuery?.removeEventListener?.("change", handleMotionChange);
      stopAnimation();
    };
  }, [working]);
  let tintColor: Dynamic = "var(--cds-" + tint + "-500)";
  return (
    <div
      data-kit={"claude-working-empty-state"}
      data-working={working ? "true" : undefined}
      className={"mc-claude-empty flex flex-col items-center gap-3"}
    >
      <div className={"relative"} aria-busy={busy ? true : undefined}>
        <div
          className={"mc-claude-empty-idle flex flex-col items-center gap-3"}
          aria-hidden={working ? true : undefined}
        >
          {idle}
        </div>
        <div
          ref={containerRef}
          className={"mc-claude-empty-working"}
          aria-hidden={"true"}
        >
          <div ref={tagRef} className={"mc-peer-cursor"}>
            <span
              className={"mc-peer-tag mc-cursor-chat"}
              style={{
                background: tintColor,
              }}
            >
              {CanvasWorkingLabelAnimationLabel}
            </span>
          </div>
          <div ref={cursorRef} className={"mc-peer-cursor"}>
            <PeerCursorGlyph color={tintColor} />
          </div>
        </div>
      </div>
      {action}
      {working ? (<span className={"sr-only"}>{CanvasWorkingLabelAnimationLabel}</span>) : (null)}
    </div>
  );
}
export {
  animateWorkingLabel,
  labelBoxWidth as CanvasWorkingLabelAnimationConstant,
  labelBoxHeight as CanvasWorkingLabelAnimationConstant_2,
  edgePadding as CanvasWorkingLabelAnimationConstant_3,
  springStiffness as CanvasWorkingLabelAnimationConstant_4,
  springDamping as CanvasWorkingLabelAnimationConstant_5,
  wanderDelayMin as CanvasWorkingLabelAnimationConstant_6,
  wanderDelayJitter as CanvasWorkingLabelAnimationConstant_7,
  CanvasWorkingLabelAnimationHandler,
  CanvasWorkingLabelAnimationHandler_2,
  CanvasWorkingLabelAnimationLabel,
  CanvasWorkingLabelAnimationPow,
  CanvasWorkingLabelAnimationReduce,
  ClaudeWorkingLabel,
  createSeededRandom,
  jsxCanvasWorkingLabelAnimation,
  reactCanvasWorkingLabelAnimation,
  reactCanvasWorkingLabelAnimation_2,
  workingLabelPosition,
  workingLabelSweep,
  workingLabelTravel,
  workingLabelWander,
};
export function installCanvasWorkingLabelAnimation(): () => void {
  return () => {
    reactCanvasWorkingLabelAnimation = toModuleNamespace(
      load_react(),
      1,
    );
    reactCanvasWorkingLabelAnimation_2 = toModuleNamespace(
      load_react(),
      1,
    );
    CanvasWorkingLabelAnimationHandler = (t?: Dynamic): Dynamic =>
      t < 0 ? 0 : t > 1 ? 1 : t;
    CanvasWorkingLabelAnimationPow = (t?: Dynamic): Dynamic => {
      let smoothed: Dynamic = Math.pow(
        CanvasWorkingLabelAnimationHandler(t),
        0.86,
      );
      return smoothed * smoothed * smoothed * (10 + smoothed * (6 * smoothed - 15));
    };
    CanvasWorkingLabelAnimationHandler_2 = (t?: Dynamic): Dynamic => {
      let parabola: Dynamic =
        CanvasWorkingLabelAnimationHandler(t) *
        (1 - CanvasWorkingLabelAnimationHandler(t));
      return 16 * parabola * parabola;
    };
    CanvasWorkingLabelAnimationReduce = (strokeList?: Dynamic): Dynamic =>
      strokeList.reduce(
        (latestEnd?: Dynamic, stroke?: Dynamic): Dynamic =>
          Math.max(latestEnd, stroke.t0 + stroke.T),
        0,
      );
    jsxCanvasWorkingLabelAnimation = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    CanvasWorkingLabelAnimationLabel = uiMessage("canvas.workingLabelAnimation.theAgentIsWorking");
    labelBoxWidth = 176;
    labelBoxHeight = 56;
    edgePadding = 8;
    springStiffness = 1600;
    springDamping = 76;
    wanderDelayMin = 12;
    wanderDelayJitter = 14;
  };
}

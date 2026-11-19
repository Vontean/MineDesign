/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function captureAnimationStates(documentRoot?: Dynamic): Dynamic {
  let items: Dynamic = [];
  if (documentRoot)
    try {
      let value: Dynamic = documentRoot.getAnimations ? documentRoot.getAnimations() : [];
      for (let animation of value as Dynamic)
        try {
          let timing: Dynamic = animation.effect?.getComputedTiming
            ? animation.effect.getComputedTiming()
            : null;
          if (
            !timing ||
            !isFinite(timing.endTime) ||
            (animation.timeline &&
              !(animation.timeline instanceof DocumentTimeline))
          )
            continue;
          let isPending: Dynamic = animation.pending && animation.startTime === null,
            isHiddenRunning: Dynamic = documentRoot.hidden && animation.playState === "running";
          if (!isPending && !isHiddenRunning) continue;
          let state: Dynamic = {
            a: animation,
            ct: animation.currentTime,
            paused: false,
          };
          items.push(state);
          isPending || (animation.pause(), (state.paused = true));
          animation.currentTime = timing.endTime;
        } catch {}
    } catch {}
  return function (): Dynamic {
    for (let value: Dynamic = items.length - 1; value >= 0; value--) {
      let animationState: Dynamic = items[value];
      try {
        animationState.a.currentTime = animationState.ct;
      } catch {}
      try {
        animationState.paused && animationState.a.play();
      } catch {}
    }
  };
}
function captureAnimationStyles(documentRoot?: Dynamic): Dynamic {
  let items: Dynamic = [];
  if (documentRoot)
    try {
      let value: Dynamic =
          documentRoot.defaultView && documentRoot.defaultView.getComputedStyle,
        animatedElements: Dynamic = [],
        animations: Dynamic = documentRoot.getAnimations ? documentRoot.getAnimations() : [];
      for (let animation of animations as Dynamic)
        try {
          let timing: Dynamic = animation.effect?.getComputedTiming
            ? animation.effect.getComputedTiming()
            : null;
          if (
            !timing ||
            isFinite(timing.endTime) ||
            (animation.timeline &&
              !(animation.timeline instanceof DocumentTimeline)) ||
            animation.playState !== "running"
          )
            continue;
          let state: Dynamic = {
            a: animation,
            ct: animation.currentTime,
          };
          items.push(state);
          let delay: Dynamic = timing.delay || 0,
            duration: Dynamic = timing.duration || 0,
            startTime: Dynamic =
              delay >= 0 || !duration
                ? delay
                : delay + Math.ceil(-delay / duration) * duration;
          animation.currentTime = startTime;
          let effect: Dynamic = animation.effect,
            targetElement: Dynamic = effect && effect.target;
          value &&
            targetElement &&
            targetElement.nodeType === 1 &&
            duration &&
            animatedElements.push({
              a: animation,
              ct: state.ct,
              start: startTime,
              dur: duration,
              el: targetElement,
              pseudo: (effect && effect.pseudoElement) || null,
            });
        } catch {}
      for (let index: Dynamic = 0; index < animatedElements.length; index++)
        try {
          let animatedElement: Dynamic = animatedElements[index],
            callback: Dynamic = (): Dynamic => {
              let computedStyle: Dynamic = value(animatedElement.el, animatedElement.pseudo);
              if (
                computedStyle.opacity === "0" ||
                computedStyle.visibility === "hidden" ||
                computedStyle.display === "none"
              )
                return true;
              let transform: Dynamic = computedStyle.transform || "";
              if (transform.indexOf("matrix(") === 0) {
                let matrixValues: Dynamic = transform.slice(7, -1).split(",");
                return (
                  Math.abs(
                    Number(matrixValues[0]) * Number(matrixValues[3]) -
                      Number(matrixValues[1]) * Number(matrixValues[2]),
                  ) < 1e-6
                );
              }
              if (transform.indexOf("matrix3d(") === 0) {
                let matrixValues: Dynamic = transform.slice(9, -1).split(",");
                return Number(matrixValues[0]) === 0 || Number(matrixValues[5]) === 0;
              }
              return false;
            };
          callback() &&
            ((animatedElement.a.currentTime = animatedElement.start + animatedElement.dur / 2),
            callback() && (animatedElement.a.currentTime = animatedElement.ct));
        } catch {}
    } catch {}
  return function (): Dynamic {
    for (let value: Dynamic = items.length - 1; value >= 0; value--)
      try {
        items[value].a.currentTime = items[value].ct;
      } catch {}
  };
}
export {
  captureAnimationStates,
  captureAnimationStyles,
};
export function installExportAnimationSnapshot(): () => void {
  return () => {};
}

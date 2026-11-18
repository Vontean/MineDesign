/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function createDeferredPointerClick(
  onClick?: Dynamic,
  threshold: Dynamic = 3,
): Dynamic {
  let pendingClick: Dynamic = null,
    fireClick: Dynamic = (): Dynamic => {
      let pending: Dynamic = pendingClick;
      pendingClick = null;
      pending !== null &&
        !pending.travelled &&
        onClick(
          {
            x: pending.x,
            y: pending.y,
          },
          pending.what,
        );
    };
  return {
    down: (pointerEvent?: Dynamic, payload?: Dynamic): Dynamic => {
      pendingClick = {
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
        id: pointerEvent.pointerId,
        what: payload,
        travelled: false,
        asked: false,
        up: false,
      };
    },
    move: (moveEvent?: Dynamic): Dynamic => {
      pendingClick !== null &&
        !pendingClick.up &&
        moveEvent.pointerId === pendingClick.id &&
        Math.hypot(moveEvent.clientX - pendingClick.x, moveEvent.clientY - pendingClick.y) >
          threshold &&
        (pendingClick.travelled = true);
    },
    end: (hasPointerUp?: Dynamic): Dynamic => {
      pendingClick === null ||
        pendingClick.up ||
        ((pendingClick.up = true),
        hasPointerUp || (pendingClick.travelled = true),
        pendingClick.asked && fireClick());
    },
    contextmenu: (): Dynamic =>
      pendingClick === null
        ? false
        : ((pendingClick.asked = true), pendingClick.up && fireClick(), true),
    clear: (): Dynamic => {
      pendingClick = null;
    },
  };
}
export {
  createDeferredPointerClick,
};
export function installCanvasDeferredClick(): () => void {
  return () => {};
}

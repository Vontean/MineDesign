/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isCompatibleFindCameraGlide } from "./canvas-adapter";

function findReturnToScope(state?: Dynamic): Dynamic {
  return state.crossPage
    ? "page"
    : state.findShowed === null
      ? "canvas"
      : isCompatibleFindCameraGlide(state.now, {
            from: state.findShowed,
            to: state.findShowed,
          }) ||
          (state.glide !== null &&
            isCompatibleFindCameraGlide(state.now, state.glide))
        ? "fit"
        : "canvas";
}
function createFindNavigationOriginTracker(): Dynamic {
  let value: Dynamic = null;
  return {
    showedPage(page: Dynamic, view: Dynamic): Dynamic {
      value = {
        page: page,
        view: view,
      };
    },
    pageIs(page: Dynamic): Dynamic {
      value !== null && value.page !== page && (value = null);
    },
    pansFrom(now: Dynamic, glide: Dynamic): Dynamic {
      value !== null &&
        findReturnToScope({
          crossPage: false,
          findShowed: value.view,
          glide: glide,
          now: now,
        }) === "canvas" &&
        (value = null);
    },
    opensWindow(
      page: Dynamic,
      crossPage: Dynamic,
      now: Dynamic,
      glide: Dynamic,
    ): Dynamic {
      return findReturnToScope({
        crossPage: crossPage,
        findShowed:
          value !== null && value.page === page ? value.view : null,
        glide: glide,
        now: now,
      });
    },
  };
}
export {
  createFindNavigationOriginTracker,
  findReturnToScope,
};
export function installFindNavigationOrigin(): () => void {
  return () => {};
}

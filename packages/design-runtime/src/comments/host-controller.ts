/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { awaitEditorReady, runSelectionAction } from "../editor/selection/host";
import { getCachedHostCapability, hasCapabilityMethod } from "../platform/host-capabilities";

var customAnchorsHostMethod: Dynamic;
var sendToClaudeHostMethod: Dynamic;
var customAnchorsController: Dynamic;
var claimCustomAnchors: Dynamic;
var bindCustomAnchors: Dynamic;
function connectCustomAnchors(host?: Dynamic, hostCallbacks?: Dynamic): Dynamic {
  let controllerPromise: Dynamic;
  try {
    controllerPromise = Promise.resolve(host.customAnchors(hostCallbacks));
  } catch (error: Dynamic) {
    controllerPromise = Promise.reject(error);
  }
  return controllerPromise.then(
    (resolvedController?: Dynamic): Dynamic => {
      let controller: Dynamic = resolvedController;
      if (!controller || typeof controller.compose != "function") {
        console.warn(
          "[design] customAnchors returned no controller; artboard comments stay off",
        );
        return null;
      }
      if (!sendToClaudeHostMethod(host)) return controller;
      let stopSendToClaude: Dynamic = null,
        isReleased: Dynamic = false;
      awaitEditorReady().then((isEditorReady?: Dynamic): Dynamic => {
        if (!isEditorReady || isReleased) return;
        let unsubscribe: Dynamic;
        try {
          unsubscribe = host.onSendToClaude(runSelectionAction);
        } catch {
          return;
        }
        typeof unsubscribe == "function"
          ? (stopSendToClaude = unsubscribe)
          : Promise.resolve(unsubscribe).catch((): Dynamic => {});
      });
      return {
        compose: (
          composeAnchor?: Dynamic,
          composeLocation?: Dynamic,
          composeExtras?: Dynamic,
        ): Dynamic => controller.compose(composeAnchor, composeLocation, composeExtras),
        get areas(): Dynamic {
          return controller.areas;
        },
        open: (openTarget?: Dynamic, openDetails?: Dynamic): Dynamic =>
          controller.open(openTarget, openDetails),
        placed: (placedAnchor?: Dynamic): Dynamic => {
          controller.placed(placedAnchor);
        },
        domAnchor: (domTarget?: Dynamic, domDetails?: Dynamic): Dynamic =>
          controller.domAnchor(domTarget, domDetails),
        ...(typeof controller.enterMode == "function"
          ? {
              enterMode: (): Dynamic => {
                controller.enterMode?.();
              },
            }
          : {}),
        ...(typeof controller.exitMode == "function"
          ? {
              exitMode: (): Dynamic => {
                controller.exitMode?.();
              },
            }
          : {}),
        release: (): Dynamic => {
          isReleased = true;
          stopSendToClaude?.();
          stopSendToClaude = null;
          controller.release();
        },
      };
    },
    (rejection?: Dynamic): Dynamic => {
      let reason: Dynamic = rejection;
      console.warn(
        "[design] customAnchors refused; artboard comments stay off:",
        reason?.code,
        reason?.message,
      );
      return null;
    },
  );
}
function createCustomAnchorsController(): Dynamic {
  let controllerPromise: Dynamic = null,
    hostUse: Dynamic = null,
    hasRetriedUse: Dynamic = false,
    boundHandlers: Dynamic = null,
    state: Dynamic = {
      mode: false,
      threads: null,
      composing: false,
    },
    hostCallbacks: Dynamic = {
      mode: (isModeOn?: Dynamic): Dynamic => {
        state.mode = isModeOn;
        boundHandlers?.mode(isModeOn);
      },
      threads: (threads?: Dynamic): Dynamic => {
        state.threads = threads;
        boundHandlers?.threads(threads);
      },
      reveal: (target?: Dynamic): Dynamic => {
        boundHandlers?.reveal(target);
      },
      composing: (isComposing?: Dynamic): Dynamic => {
        state.composing = isComposing;
        boundHandlers?.composing?.(isComposing);
      },
      move: (moveTarget?: Dynamic, moveDetails?: Dynamic): Dynamic =>
        boundHandlers?.move?.(moveTarget, moveDetails) ?? Promise.resolve(null),
      hotkey: true,
    },
    claimController: Dynamic = (): Dynamic => {
      if (controllerPromise !== null) return controllerPromise;
      let hostCapability: Dynamic = getCachedHostCapability("comments");
      if (customAnchorsHostMethod(hostCapability))
        return (controllerPromise = connectCustomAnchors(hostCapability, hostCallbacks));
      // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
      let claude: Dynamic = (globalThis as Dynamic).designHost;
      return typeof claude?.use != "function"
        ? (controllerPromise = Promise.resolve(null))
        : ((hostUse = claude.use.bind(claude)), (controllerPromise = connectViaUse(hostUse)));
    },
    connectViaUse: Dynamic = (use?: Dynamic): Dynamic => {
      let capabilityPromise: Dynamic;
      try {
        capabilityPromise = Promise.resolve(use("comments"));
      } catch {
        capabilityPromise = Promise.resolve(null);
      }
      return capabilityPromise.then(
        (capability?: Dynamic): Dynamic =>
          capability?.available !== false && customAnchorsHostMethod(capability)
            ? connectCustomAnchors(capability, hostCallbacks)
            : (console.warn(
                "[design] comments capability not served; artboard comments stay off",
              ),
              null),
        (): Dynamic => null,
      );
    };
  return {
    claim: claimController,
    bind: async (handlers?: Dynamic): Promise<Dynamic> => {
      let controller: Dynamic = await claimController();
      controller === null &&
        hostUse !== null &&
        (hasRetriedUse || ((hasRetriedUse = true), (controllerPromise = connectViaUse(hostUse))),
        (controller = await controllerPromise));
      if (controller === null) return null;
      let activeController: Dynamic = controller;
      boundHandlers = handlers;
      state.threads !== null && handlers.threads(state.threads);
      state.composing && handlers.composing?.(true);
      state.mode && handlers.mode(true);
      return {
        compose: (
          composeAnchor?: Dynamic,
          composeLocation?: Dynamic,
          composeExtras?: Dynamic,
        ): Dynamic => activeController.compose(composeAnchor, composeLocation, composeExtras),
        get areas(): Dynamic {
          return activeController.areas;
        },
        open: (openTarget?: Dynamic, openDetails?: Dynamic): Dynamic =>
          activeController.open(openTarget, openDetails),
        placed: (placedAnchor?: Dynamic): Dynamic => {
          activeController.placed(placedAnchor);
        },
        domAnchor: (domTarget?: Dynamic, domDetails?: Dynamic): Dynamic =>
          activeController.domAnchor(domTarget, domDetails),
        ...(typeof activeController.enterMode == "function"
          ? {
              enterMode: (): Dynamic => {
                activeController.enterMode?.();
              },
            }
          : {}),
        ...(typeof activeController.exitMode == "function"
          ? {
              exitMode: (): Dynamic => {
                activeController.exitMode?.();
              },
            }
          : {}),
        release: (): Dynamic => {
          boundHandlers === handlers && (boundHandlers = null);
        },
      };
    },
  };
}
export {
  bindCustomAnchors,
  claimCustomAnchors,
  connectCustomAnchors,
  createCustomAnchorsController,
  customAnchorsController,
  customAnchorsHostMethod,
  sendToClaudeHostMethod,
};
export function installCommentsHostController(): () => void {
  return () => {
    customAnchorsHostMethod = hasCapabilityMethod("customAnchors");
    sendToClaudeHostMethod = hasCapabilityMethod("onSendToClaude");
    customAnchorsController = createCustomAnchorsController();
    claimCustomAnchors = (): Dynamic => {
      customAnchorsController.claim();
    };
    bindCustomAnchors = (handlers?: Dynamic): Dynamic =>
      customAnchorsController.bind(handlers);
  };
}

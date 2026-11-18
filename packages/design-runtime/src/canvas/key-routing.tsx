/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { focusCanvasDocument } from "./focus";
import { load_react } from "../dependencies";
import { addNativeEventListener, McFindAttribute } from "../editor/keyboard/find";
import { createCanvasFindAdapter, revealFindMatchAfterSettle, revealFindMatchAfterTextEdit } from "../find/canvas-adapter";
import { useFindInPage } from "../find/controller";
import { toModuleNamespace } from "../module-helpers";

var react_Eu: Dynamic;
function isConnectedArtboardWindow(targetWindow?: Dynamic): Dynamic {
  try {
    return targetWindow.frameElement?.isConnected === true;
  } catch {
    return false;
  }
}
function createFrameKeyListenerRegistry(): Dynamic {
  let entries: Dynamic = new Map(),
    removeEntry: Dynamic = (frameKey?: Dynamic): Dynamic => {
      let entry: Dynamic = entries.get(frameKey);
      entries.delete(frameKey);
      try {
        entry?.off();
      } catch {}
    },
    pruneDisconnected: Dynamic = (): Dynamic => {
      for (let [staleKey, staleEntry] of [...entries] as Dynamic)
        isConnectedArtboardWindow(staleEntry.target) || removeEntry(staleKey);
    };
  return {
    seen(frameKey: Dynamic, frameWindow: Dynamic, attachKeyListeners: Dynamic): Dynamic {
      pruneDisconnected();
      if (frameWindow === null || entries.get(frameKey)?.target === frameWindow) return;
      removeEntry(frameKey);
      let detachKeyListeners: Dynamic = attachKeyListeners(frameWindow),
        handlePageHide: Dynamic = (pageHideEvent?: Dynamic): Dynamic => {
          !pageHideEvent.persisted &&
            entries.get(frameKey)?.target === frameWindow &&
            removeEntry(frameKey);
        },
        removePageHideListener: Dynamic = (): Dynamic => {};
      try {
        removePageHideListener = addNativeEventListener(
          frameWindow,
          "pagehide",
          handlePageHide,
          false,
        );
      } catch {}
      entries.set(frameKey, {
        target: frameWindow,
        off: (): Dynamic => {
          try {
            removePageHideListener();
          } finally {
            detachKeyListeners();
          }
        },
      });
    },
    drop: removeEntry,
    gone(frameKey: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(frameKey);
      entry !== undefined &&
        !isConnectedArtboardWindow(entry.target) &&
        removeEntry(frameKey);
    },
    dropAll(): Dynamic {
      for (let frameKey of [...entries.keys()] as Dynamic) removeEntry(frameKey);
    },
  };
}
function frameStepChordOwner(
  frame?: Dynamic,
  stepState?: Dynamic,
): Dynamic {
  let activeStop: Dynamic = stepState.editing ?? stepState.began;
  if (activeStop === null || stepState.frame(activeStop) !== frame) return null;
  let wasBegunFromStop: Dynamic = stepState.began === activeStop,
    fallbackOwner: Dynamic = stepState.editing === null ? frame : null;
  return (): Dynamic =>
    wasBegunFromStop && stepState.inside() === activeStop
      ? (stepState.stopOf(activeStop) ?? fallbackOwner)
      : fallbackOwner;
}
function useArtboardKeyRouting({
  host: host,
  enabled: enabled,
  onEnter: onEnter,
  settle: settle,
  textEditOpen: textEditOpen,
  ownsStepChord: ownsStepChord,
  pageOwnsKeys: pageOwnsKeys,
  subscribe: subscribe,
  textEditIn: textEditIn,
  editBeganFromStop: editBeganFromStop,
  walkInside: walkInside,
  stopOf: stopOf,
}: Dynamic): Dynamic {
  let [findAdapter]: Dynamic = (0, react_Eu.useState)(
      (): Dynamic => createCanvasFindAdapter(host),
    ),
    findController: Dynamic = useFindInPage({
      adapter: findAdapter,
      enabled: enabled,
      ownsStepChord: ownsStepChord,
      restoreFocus: focusCanvasDocument,
      returnTo: (frame?: Dynamic): Dynamic =>
        frameStepChordOwner(frame, {
          editing: textEditIn(),
          began: editBeganFromStop(),
          frame: host.frame,
          inside: walkInside,
          stopOf: stopOf,
        }),
    }),
    onEnterRef: Dynamic = (0, react_Eu.useRef)(onEnter);
  onEnterRef.current = onEnter;
  (0, react_Eu.useEffect)((): Dynamic => {
    if (!findController.isOpen) return;
    let handleFocusIn: Dynamic = (event?: Dynamic): Dynamic => {
      let isInsideFindBar: Dynamic = (element?: Dynamic): Dynamic =>
        element instanceof Element &&
        element.closest("[" + McFindAttribute + "]") !== null;
      isInsideFindBar(event.target) &&
        !isInsideFindBar(event.relatedTarget) &&
        onEnterRef.current();
    };
    onEnterRef.current();
    (document as Dynamic).addEventListener("focusin", handleFocusIn);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener("focusin", handleFocusIn);
  }, [findController.isOpen]);
  (0, react_Eu.useEffect)(
    (): Dynamic => subscribe(findAdapter.changed),
    [subscribe, findAdapter],
  );
  let [frameKeyRegistry]: Dynamic = (0, react_Eu.useState)(
      createFrameKeyListenerRegistry,
    ),
    pageOwnsKeysRef: Dynamic = (0, react_Eu.useRef)(pageOwnsKeys);
  pageOwnsKeysRef.current = pageOwnsKeys;
  let settleRef: Dynamic = (0, react_Eu.useRef)(settle);
  settleRef.current = settle;
  let findOpenRef: Dynamic = (0, react_Eu.useRef)(findController.isOpen);
  findOpenRef.current = findController.isOpen;
  let runAfterSettle: Dynamic = (0, react_Eu.useCallback)(
      (action?: Dynamic): Dynamic => {
        let current: Dynamic = findOpenRef.current;
        settleRef.current((): Dynamic => {
          (!current || findOpenRef.current) && action();
        });
      },
      [],
    ),
    openFindRef: Dynamic = (0, react_Eu.useRef)(findController.open);
  openFindRef.current = findController.open;
  let { attach: attachFind }: Dynamic = findController,
    getFrameWindow: Dynamic = (0, react_Eu.useCallback)(
      (frameKey?: Dynamic): Dynamic => {
        try {
          return host.frame(frameKey)?.contentWindow ?? null;
        } catch {
          return null;
        }
      },
      [host],
    ),
    handleFrameSeen: Dynamic = (0, react_Eu.useCallback)(
      (frameKey?: Dynamic): Dynamic => {
        let revealAfterTextEdit: Dynamic = (
          editedTarget?: Dynamic,
          matchOptions?: Dynamic,
        ): Dynamic =>
          revealFindMatchAfterTextEdit(
            matchOptions,
            pageOwnsKeysRef.current(frameKey),
            editedTarget,
            runAfterSettle,
            (): Dynamic => openFindRef.current(),
          );
        frameKeyRegistry.seen(
          frameKey,
          getFrameWindow(frameKey),
          (findTarget?: Dynamic): Dynamic =>
            attachFind(findTarget, (): Dynamic => pageOwnsKeysRef.current(frameKey), revealAfterTextEdit),
        );
      },
      [attachFind, frameKeyRegistry, getFrameWindow, runAfterSettle],
    ),
    handleFrameBooted: Dynamic = (0, react_Eu.useCallback)(
      (frameKey?: Dynamic): Dynamic => {
        frameKeyRegistry.drop(frameKey);
        handleFrameSeen(frameKey);
        findAdapter.frameBooted(frameKey);
      },
      [findAdapter, frameKeyRegistry, handleFrameSeen],
    ),
    handleFrameGone: Dynamic = (0, react_Eu.useCallback)(
      (frameKey?: Dynamic): Dynamic => frameKeyRegistry.gone(frameKey),
      [frameKeyRegistry],
    );
  (0, react_Eu.useEffect)(
    (): Dynamic => (): Dynamic => frameKeyRegistry.dropAll(),
    [frameKeyRegistry],
  );
  let textEditOpenRef: Dynamic = (0, react_Eu.useRef)(textEditOpen);
  textEditOpenRef.current = textEditOpen;
  let { step: stepFind }: Dynamic = findController,
    handleFindStep: Dynamic = (0, react_Eu.useCallback)(
      (stepRequest?: Dynamic): Dynamic =>
        revealFindMatchAfterSettle(
          (document as Dynamic).activeElement instanceof HTMLIFrameElement &&
            textEditOpenRef.current(),
          (): Dynamic => stepFind(stepRequest),
          runAfterSettle,
          (): Dynamic => openFindRef.current(),
        ),
      [stepFind, runAfterSettle],
    );
  return {
    find: (0, react_Eu.useMemo)(
      (): Dynamic => ({
        ...findController,
        bar: {
          ...findController.bar,
          onStep: handleFindStep,
        },
      }),
      [findController, handleFindStep],
    ),
    changed: findAdapter.changed,
    frameBooted: handleFrameBooted,
    frameSeen: handleFrameSeen,
    frameGone: handleFrameGone,
  };
}
export {
  createFrameKeyListenerRegistry,
  frameStepChordOwner,
  isConnectedArtboardWindow,
  react_Eu,
  useArtboardKeyRouting,
};
export function installCanvasKeyRouting(): () => void {
  return () => {
    react_Eu = toModuleNamespace(load_react(), 1);
  };
}

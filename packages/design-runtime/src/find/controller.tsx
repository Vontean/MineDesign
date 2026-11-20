/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_dom } from "../dependencies";
import { blockingOverlaySelector, hasBlockingOverlay, isClosedOverlay } from "../editor/chrome/overlay-state";
import { addNativeEventListener, findDirectionShortcut, guardedNativeEventHandler, installFindKeyboardHandlers, isFindShortcut, isTextEditableTarget, McFindAttribute } from "../editor/keyboard/find";
import { toModuleNamespace } from "../module-helpers";
import { useFrameFind } from "../platform/frame-host-bridge";

var react_Cl: Dynamic;
var reactDOM_jCt: Dynamic;
var emptyFindStatus: Dynamic;
var blockingFindDialogSelector: Dynamic;
function createFindController(
  adapter?: Dynamic,
  controllerOptions: Dynamic = {},
): Dynamic {
  let value: Dynamic = controllerOptions.debounceMs ?? 120,
    values: Dynamic = new Set(),
    status: Dynamic = emptyFindStatus,
    items: Dynamic = [],
    activeIndex: Dynamic = -1,
    debounceTimer: Dynamic,
    text: Dynamic = "",
    pendingQuery: Dynamic,
    searchAbort: Dynamic,
    revealAbort: Dynamic,
    flag: Dynamic = false,
    callback: Dynamic = (nextStatus?: Dynamic): Dynamic => {
      status = nextStatus;
      for (let listener of [...values] as Dynamic) listener(status);
    },
    describeItem: Dynamic = (item?: Dynamic): Dynamic =>
      item === undefined ? undefined : adapter.describe?.(item),
    clearSearch: Dynamic = (): Dynamic => {
      debounceTimer !== undefined && clearTimeout(debounceTimer);
      debounceTimer = undefined;
    },
    runSearch: Dynamic = async (direction: Dynamic = 1): Promise<Dynamic> => {
      revealAbort?.abort();
      let controller: Dynamic = new AbortController();
      revealAbort = controller;
      let seenKeys: Dynamic = new Set();
      for (; !controller.signal.aborted && !flag; ) {
        let resultItem: Dynamic = items[activeIndex];
        if (resultItem === undefined || seenKeys.has(resultItem.key)) return;
        seenKeys.add(resultItem.key);
        pendingQuery = resultItem.key;
        let searchResult: Dynamic;
        try {
          searchResult = await adapter.reveal(resultItem, controller.signal);
        } catch {
          return;
        }
        if (
          controller.signal.aborted ||
          flag ||
          items[activeIndex]?.key !== resultItem.key
        )
          return;
        if (searchResult !== false) {
          adapter.paint(items, activeIndex);
          return;
        }
        items = items.filter(
          (item?: Dynamic): Dynamic => item.key !== resultItem.key,
        );
        activeIndex =
          items.length === 0
            ? -1
            : direction === 1
              ? activeIndex % items.length
              : (activeIndex - 1 + items.length) % items.length;
        callback({
          ...status,
          total: items.length,
          current: activeIndex + 1,
          place: describeItem(items[activeIndex]),
        });
        adapter.paint(items, activeIndex);
      }
    },
    refreshResults: Dynamic = async (): Promise<Dynamic> => {
      clearSearch();
      searchAbort?.abort();
      let controller: Dynamic = new AbortController();
      searchAbort = controller;
      let query: Dynamic = status.query,
        resultItems: Dynamic;
      try {
        resultItems = await adapter.search(query, controller.signal);
      } catch {
        resultItems = [];
      }
      if (controller.signal.aborted || flag || query !== status.query) return;
      let queryChanged: Dynamic = query !== text,
        previousKey: Dynamic = queryChanged ? undefined : items[activeIndex]?.key,
        isCapped: Dynamic = resultItems.length > 1e3;
      items = isCapped ? resultItems.slice(0, 1e3) : resultItems;
      (queryChanged || items.length === 0) && (pendingQuery = undefined);
      text = query;
      let nextIndex: Dynamic =
        previousKey === undefined
          ? -1
          : items.findIndex(
              (item?: Dynamic): Dynamic => item.key === previousKey,
            );
      activeIndex =
        items.length === 0
          ? -1
          : nextIndex !== -1
            ? nextIndex
            : queryChanged
              ? 0
              : Math.min(Math.max(activeIndex, 0), items.length - 1);
      callback({
        query: query,
        total: items.length,
        current: activeIndex + 1,
        capped: isCapped,
        searching: false,
        place: describeItem(items[activeIndex]),
      });
      adapter.paint(items, activeIndex);
      queryChanged && runSearch();
    },
    openSearch: Dynamic = (): Dynamic => {
      clearSearch();
      if (value <= 0) {
        refreshResults();
        return;
      }
      debounceTimer = setTimeout((): Dynamic => {
        refreshResults();
      }, value);
    },
    closeSearch: Dynamic = (): Dynamic => {
      clearSearch();
      text = "";
      searchAbort?.abort();
      revealAbort?.abort();
      items = [];
      activeIndex = -1;
      adapter.clear();
    },
    unsubscribeAdapter: Dynamic = adapter.subscribe?.((): Dynamic => {
      !flag && status.query !== "" && openSearch();
    });
  return {
    setQuery(query: Dynamic): Dynamic {
      if (!(flag || query === status.query)) {
        if (query === "") {
          closeSearch();
          callback(emptyFindStatus);
          return;
        }
        searchAbort?.abort();
        revealAbort?.abort();
        callback({
          ...status,
          query: query,
          searching: true,
        });
        openSearch();
      }
    },
    step(stepAmount: Dynamic): Dynamic {
      if (!(flag || status.query === "")) {
        if (status.query !== text) {
          debounceTimer !== undefined && refreshResults();
          return;
        }
        items.length !== 0 &&
          (items[activeIndex]?.key === pendingQuery &&
            (activeIndex = (activeIndex + stepAmount + items.length) % items.length),
          callback({
            ...status,
            current: activeIndex + 1,
            place: describeItem(items[activeIndex]),
          }),
          adapter.paint(items, activeIndex),
          runSearch(stepAmount));
      }
    },
    clear(): Dynamic {
      flag ||
        (closeSearch(),
        status !== emptyFindStatus && callback(emptyFindStatus));
    },
    status: (): Dynamic => status,
    subscribe(subscriber: Dynamic): Dynamic {
      values.add(subscriber);
      return (): Dynamic => {
        values.delete(subscriber);
      };
    },
    dispose(): Dynamic {
      flag || (closeSearch(), (flag = true), unsubscribeAdapter?.(), values.clear());
    },
  };
}
function isFindBlockedByDialog(document?: Dynamic): Dynamic {
  return (
    !!document.fullscreenElement ||
    [...document.querySelectorAll(blockingFindDialogSelector)].some(
      (overlay?: Dynamic): Dynamic => !isClosedOverlay(overlay),
    )
  );
}
function isFindBlockedByLinkMode(document?: Dynamic): Dynamic {
  return document.activeElement?.closest("[data-link-mode]") != null;
}
function isApplicationRootInert(document?: Dynamic): Dynamic {
  return document.getElementById("root")?.hasAttribute("inert") === true;
}
function dispatchFindEscape(document?: Dynamic): Dynamic {
  let value: Dynamic = document.defaultView?.KeyboardEvent;
  if (value === undefined) return;
  let keyboardEvent: Dynamic = new value("keydown", {
      key: "Escape",
      code: "Escape",
      bubbles: true,
      cancelable: true,
    }),
    activeElement: Dynamic = document.activeElement,
    focusedElement: Dynamic =
      activeElement?.closest(blockingOverlaySelector) ?? null;
  activeElement !== null &&
    focusedElement !== null &&
    focusedElement !== activeElement &&
    isTextEditableTarget(activeElement) &&
    activeElement.blur();
  (focusedElement !== null && document.activeElement !== activeElement
    ? focusedElement
    : (activeElement ?? document.body)
  ).dispatchEvent(keyboardEvent);
  keyboardEvent.preventDefault();
}
function useFindInPage({
  adapter: adapter,
  enabled: enabled,
  isOurs: isOurs,
  ownsStepChord: ownsStepChord,
  viewMoves: viewMoves,
  restoreFocus: restoreFocus,
  returnTo: returnTo,
}: Dynamic): Dynamic {
  let [value, setOpen]: Dynamic = (0, react_Cl.useState)(false),
    [frameFindEnabled, setFrameFindEnabled]: Dynamic = (0, react_Cl.useState)(false),
    fieldRef: Dynamic = (0, react_Cl.useRef)(null),
    returnFocusRef: Dynamic = (0, react_Cl.useRef)(null),
    restoreFocusRef: Dynamic = (0, react_Cl.useRef)(null),
    operationCount: Dynamic = (0, react_Cl.useRef)(0),
    viewMoveCount: Dynamic = (0, react_Cl.useRef)(0),
    findStateRef: Dynamic = (0, react_Cl.useRef)({
      adapter: adapter,
      isOpen: value,
      enabled: enabled,
      isOurs: isOurs,
      ownsStepChord: ownsStepChord,
      viewMoves: viewMoves,
      restoreFocus: restoreFocus,
      returnTo: returnTo,
    });
  (0, react_Cl.useEffect)((): Dynamic => {
    findStateRef.current = {
      adapter: adapter,
      isOpen: value,
      enabled: enabled,
      isOurs: isOurs,
      ownsStepChord: ownsStepChord,
      viewMoves: viewMoves,
      restoreFocus: restoreFocus,
      returnTo: returnTo,
    };
  });
  let [{ controller: findController, changes: changeNotifier }]: Dynamic = (0,
  react_Cl.useState)((): Dynamic => {
    installFindKeyboardHandlers(window);
    let state: Dynamic = {};
    return {
      controller: createFindController({
        search: (query?: Dynamic, searchOptions?: Dynamic): Dynamic =>
          findStateRef.current.adapter.search(query, searchOptions),
        reveal: (query?: Dynamic, revealOptions?: Dynamic): Dynamic =>
          findStateRef.current.adapter.reveal(query, revealOptions),
        paint: (items?: Dynamic, paintOptions?: Dynamic): Dynamic =>
          findStateRef.current.adapter.paint(items, paintOptions),
        clear: (): Dynamic => findStateRef.current.adapter.clear(),
        describe: (item?: Dynamic): Dynamic =>
          findStateRef.current.adapter.describe?.(item),
        subscribe: (subscriber?: Dynamic): Dynamic => (
          (state.notify = subscriber),
          (): Dynamic => {
            state.notify = undefined;
          }
        ),
      }),
      changes: state,
    };
  });
  (0, react_Cl.useEffect)(
    (): Dynamic => adapter.subscribe?.((): Dynamic => changeNotifier.notify?.()),
    [adapter, changeNotifier],
  );
  (0, react_Cl.useEffect)(
    (): Dynamic => (): Dynamic => {
      operationCount.current++;
      findController.clear();
    },
    [findController],
  );
  let isBlockedByDialog: Dynamic = (0, react_Cl.useCallback)((): Dynamic => {
      let current: Dynamic = findStateRef.current,
        isOpen: Dynamic = current.isOpen,
        activeElement: Dynamic = (document as Dynamic).activeElement;
      try {
        (typeof activeElement?.closest == "function" &&
          activeElement.closest("[" + McFindAttribute + "]") !==
            null) ||
          ((returnFocusRef.current =
            typeof activeElement?.focus == "function" ? activeElement : null),
          (restoreFocusRef.current =
            returnFocusRef.current === null
              ? null
              : (current.returnTo?.(returnFocusRef.current) ?? null)),
          (viewMoveCount.current = current.viewMoves?.() ?? 0));
        isOpen || (0, reactDOM_jCt.flushSync)((): Dynamic => setOpen(true));
        let fieldElement: Dynamic = fieldRef.current;
        fieldElement !== null &&
          activeElement?.tagName === "IFRAME" &&
          (activeElement.blur(), (window as Dynamic).focus());
        fieldElement?.focus();
        if (
          fieldElement !== null &&
          (document as Dynamic).activeElement === fieldElement
        ) {
          fieldElement.select();
          return true;
        }
      } catch {}
      isOpen || setOpen(false);
      return false;
    }, []),
    canFocusSearch: Dynamic = (0, react_Cl.useCallback)(
      (): Dynamic =>
        findStateRef.current.enabled && !isFindBlockedByDialog(document),
      [],
    ),
    handleFocusEvent: Dynamic = (0, react_Cl.useCallback)(
      (eventTarget?: Dynamic): Dynamic => {
        if (findStateRef.current.isOurs?.(eventTarget) === false) return false;
        let operationId: Dynamic = ++operationCount.current;
        if (!canFocusSearch() || isFindBlockedByLinkMode(document)) return true;
        if (hasBlockingOverlay(document)) {
          let index: Dynamic = 0,
            callback: Dynamic = (): Dynamic => {
              if (operationId !== operationCount.current || !canFocusSearch()) return;
              let flag: Dynamic = false;
              try {
                hasBlockingOverlay(document)
                  ? index > 0 &&
                    index % 6 === 0 &&
                    index <= 18 &&
                    dispatchFindEscape(document)
                  : isApplicationRootInert(document) || (flag = isBlockedByDialog());
              } catch {
                flag = false;
              }
              !flag &&
                ++index < 40 &&
                (window as Dynamic).requestAnimationFrame(callback);
            };
          dispatchFindEscape(document);
          (window as Dynamic).requestAnimationFrame(callback);
          return true;
        }
        return isApplicationRootInert(document) ? true : isBlockedByDialog();
      },
      [isBlockedByDialog, canFocusSearch],
    ),
    handleStep: Dynamic = (0, react_Cl.useCallback)(
      (stepAmount?: Dynamic): Dynamic => {
        !isFindBlockedByDialog(document) &&
          !isApplicationRootInert(document) &&
          !isFindBlockedByLinkMode(document) &&
          findController.step(stepAmount);
      },
      [findController],
    ),
    handleKeyDown: Dynamic = (0, react_Cl.useCallback)(
      (event?: Dynamic): Dynamic => {
        let defaultPrevented: Dynamic = event.defaultPrevented
          ? undefined
          : findDirectionShortcut(event);
        if (
          !(
            defaultPrevented === undefined ||
            findStateRef.current.isOurs?.(event.target) === false
          ) &&
          !(
            event.key !== "F3" &&
            findStateRef.current.ownsStepChord?.(event) === true
          )
        ) {
          if (!findStateRef.current.isOpen) {
            handleFocusEvent(event.target) && event.preventDefault();
            return;
          }
          event.preventDefault();
          handleStep(defaultPrevented);
        }
      },
      [handleFocusEvent, handleStep],
    ),
    restoreFocusHandler: Dynamic = (0, react_Cl.useCallback)(
      (focusEvent?: Dynamic): Dynamic => {
        let current: Dynamic = findStateRef.current;
        if (!current.isOpen) return;
        findController.clear();
        let returnFocus: Dynamic = returnFocusRef.current,
          restoreFocusCallback: Dynamic = restoreFocusRef.current;
        returnFocusRef.current = null;
        restoreFocusRef.current = null;
        let activeElement: Dynamic = (document as Dynamic).activeElement,
          shouldRestore: Dynamic =
            focusEvent &&
            (activeElement === null ||
              activeElement === (document as Dynamic).body ||
              activeElement.closest("[" + McFindAttribute + "]") !==
                null),
          restoredElement: Dynamic = shouldRestore ? (restoreFocusCallback?.() ?? null) : null,
          connectedElement: Dynamic =
            restoredElement ?? (shouldRestore && restoreFocusCallback === null ? returnFocus : null),
          viewChanged: Dynamic = (current.viewMoves?.() ?? 0) !== viewMoveCount.current,
          focusTarget: Dynamic =
            shouldRestore && connectedElement?.isConnected === true && !viewChanged
              ? connectedElement
              : null;
        focusTarget?.focus(
          focusTarget === restoredElement
            ? {
                preventScroll: true,
              }
            : undefined,
        );
        let currentActiveElement: Dynamic = (document as Dynamic).activeElement,
          hasActiveFindField: Dynamic =
            focusTarget !== null &&
            currentActiveElement !== null &&
            currentActiveElement !== (document as Dynamic).body &&
            currentActiveElement.closest("[" + McFindAttribute + "]") ===
              null;
        setOpen(false);
        shouldRestore && !hasActiveFindField && current.restoreFocus?.();
      },
      [findController],
    ),
    closeFind: Dynamic = (0, react_Cl.useCallback)(
      (): Dynamic => restoreFocusHandler(true),
      [restoreFocusHandler],
    ),
    openFind: Dynamic = (0, react_Cl.useCallback)((): Dynamic => {
      handleFocusEvent(null);
    }, [handleFocusEvent]);
  useFrameFind(frameFindEnabled, openFind);
  (0, react_Cl.useEffect)((): Dynamic => {
    enabled || restoreFocusHandler(false);
  }, [enabled, restoreFocusHandler]);
  (0, react_Cl.useEffect)((): Dynamic => {
    let callback: Dynamic = (event?: Dynamic): Dynamic => {
      try {
        if (event.isComposing) {
          (isFindShortcut(event) ||
            findDirectionShortcut(event) !== undefined) &&
            findStateRef.current.isOurs?.(event.target) !== false &&
            event.preventDefault();
          return;
        }
        isFindShortcut(event)
          ? handleFocusEvent(event.target) && event.preventDefault()
          : handleKeyDown(event);
      } catch {
        return;
      }
    };
    (window as Dynamic).addEventListener("keydown", callback, true);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", callback, true);
  }, [handleFocusEvent, handleKeyDown]);
  let attachFindField: Dynamic = (0, react_Cl.useCallback)(
    (
      callbackFn?: Dynamic,
      callbackOptions?: Dynamic,
      runGuarded: Dynamic = (runCallback?: Dynamic): Dynamic => runCallback(),
    ): Dynamic => {
      let guardedCallback: Dynamic = guardedNativeEventHandler(
          {
            findKey: (): Dynamic => handleFocusEvent(null),
            isOpen: (): Dynamic => findStateRef.current.isOpen,
            step: (stepAmount?: Dynamic, stepOptions?: Dynamic): Dynamic =>
              runGuarded((): Dynamic => handleStep(stepAmount), stepOptions),
            ownsStepChord: (event?: Dynamic): Dynamic =>
              findStateRef.current.ownsStepChord?.(event) === true,
          },
          undefined,
          callbackOptions,
        ),
        items: Dynamic = [
          addNativeEventListener(
            callbackFn,
            "keydown",
            guardedCallback,
            true,
          ),
          addNativeEventListener(
            callbackFn,
            "keydown",
            guardedCallback,
            false,
          ),
        ];
      return (): Dynamic =>
        items.forEach((subscriber?: Dynamic): Dynamic => subscriber());
    },
    [handleFocusEvent, handleStep],
  );
  return (0, react_Cl.useMemo)(
    (): Dynamic => ({
      isOpen: value,
      open: openFind,
      close: closeFind,
      step: handleStep,
      attach: attachFindField,
      bar: {
        open: value,
        subscribe: findController.subscribe,
        getStatus: findController.status,
        fieldRef: fieldRef,
        onQuery: findController.setQuery,
        onStep: handleStep,
        onClose: closeFind,
        onMounted: setFrameFindEnabled,
      },
    }),
    [value, openFind, closeFind, handleStep, attachFindField, findController],
  );
}
export {
  blockingFindDialogSelector,
  createFindController,
  dispatchFindEscape,
  emptyFindStatus,
  isApplicationRootInert,
  isFindBlockedByDialog,
  isFindBlockedByLinkMode,
  react_Cl,
  reactDOM_jCt,
  useFindInPage,
};
export function installFindController(): () => void {
  return () => {
    react_Cl = toModuleNamespace(load_react(), 1);
    reactDOM_jCt = toModuleNamespace(
      load_react_dom(),
      1,
    );
    emptyFindStatus = {
      query: "",
      total: 0,
      current: 0,
      capped: false,
      searching: false,
    };
    blockingFindDialogSelector =
      '[data-cds="Dialog"], [role="alertdialog"]:not([aria-modal="false"]), [role="dialog"][aria-modal="true"]';
  };
}

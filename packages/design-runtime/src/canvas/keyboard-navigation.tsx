/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { editingTextHintMessage as textEditStartedAnnouncement, adjacentOutlineNode, artboardLoadFailureAnnouncement, artboardLoadingAnnouncement, deepestSingleOutlineNode, emptyArtboardSelectionAnnouncement, exitOutlineAnnouncement, findOutlineLocation, firstNestedOutlineNode, NoLayersInsideThisOneMessage, NothingSelectedMessage, outlineLayerAnnouncement, outlineLayerNavigationAnnouncement, outlineNodeDescription, selectingAnnouncement, selectionAnnouncement } from "../editor/accessibility/announcements";
import { announce } from "../editor/accessibility/announcer";
import { canvasElementSelectionCount, selectionFromArtboards } from "../editor/selection/canvas-selection";
import { toModuleNamespace } from "../module-helpers";

var react_ta: Dynamic;
var canvasFocusAnnouncementDelayMs: Dynamic;
var canvasFocusAnnouncementRepeatCount: Dynamic;
var keyboardNavigationMode: Dynamic;
var canvasKeyboardRepeatIntervalMs: Dynamic;
function useCanvasKeyboardNavigation(
  host?: Dynamic,
  outlineTrees?: Dynamic,
): Dynamic {
  let hostRef: Dynamic = (0, react_ta.useRef)(host);
  hostRef.current = host;
  let outlineTreesRef: Dynamic = (0, react_ta.useRef)(outlineTrees);
  outlineTreesRef.current = outlineTrees;
  let [insideFile, setInsideFile]: Dynamic = (0, react_ta.useState)(null),
    insideFileRef: Dynamic = (0, react_ta.useRef)(null),
    setInsideFileNow: Dynamic = (file?: Dynamic): Dynamic => {
      insideFileRef.current = file;
      setInsideFile(file);
    },
    cursorRef: Dynamic = (0, react_ta.useRef)(null),
    cursorTreeRef: Dynamic = (0, react_ta.useRef)(undefined),
    tokenCounterRef: Dynamic = (0, react_ta.useRef)(0),
    activeStepRef: Dynamic = (0, react_ta.useRef)(null),
    queuedStepRef: Dynamic = (0, react_ta.useRef)(null),
    pendingSelectRef: Dynamic = (0, react_ta.useRef)(null),
    selectSerialRef: Dynamic = (0, react_ta.useRef)(0),
    holdTimeRef: Dynamic = (0, react_ta.useRef)(null),
    holdTimerRef: Dynamic = (0, react_ta.useRef)(null),
    expectedSelectionRef: Dynamic = (0, react_ta.useRef)(null),
    pendingEnterFileRef: Dynamic = (0, react_ta.useRef)(null),
    textEditFileRef: Dynamic = (0, react_ta.useRef)(null),
    findCursorTid: Dynamic = (file?: Dynamic, tree?: Dynamic): Dynamic => {
      let current: Dynamic = cursorRef.current;
      if (
        current != null &&
        current.file === file &&
        findOutlineLocation(tree, current.tid)
      )
        return current.tid;
      let selectedTids: Dynamic =
        hostRef.current.megaSelRef.current.elements.get(file)?.tids;
      if (!selectedTids || selectedTids.length === 0) return null;
      let selectedTidSet: Dynamic = new Set(selectedTids),
        findSelectedTid: Dynamic = (nodes?: Dynamic): Dynamic => {
          for (let node of nodes as Dynamic) {
            if (selectedTidSet.has(node.tid)) return node.tid;
            let foundTid: Dynamic = findSelectedTid(node.children);
            if (foundTid != null) return foundTid;
          }
          return null;
        };
      return findSelectedTid(tree);
    },
    recordActiveStep: Dynamic = (step?: Dynamic, shouldRepeat?: Dynamic): Dynamic => {
      let current: Dynamic = activeStepRef.current;
      current?.token !== step.token &&
        ((!shouldRepeat && pendingSelectRef.current?.token !== step.token) ||
          (current?.timer && clearTimeout(current.timer),
          (activeStepRef.current = {
            ...step,
            timer: shouldRepeat
              ? scheduleSelectStep(step, canvasFocusAnnouncementRepeatCount)
              : null,
          })));
    },
    scheduleSelectStep: Dynamic = (step?: Dynamic, retriesLeft?: Dynamic): Dynamic => {
      let timer: Dynamic = setTimeout((): Dynamic => {
        let current: Dynamic = activeStepRef.current;
        if (current?.timer !== timer) return;
        current.timer = null;
        let hostSnapshot: Dynamic = hostRef.current;
        if (
          !(
            insideFileRef.current !== step.file ||
            cursorRef.current?.file !== step.file ||
            hostSnapshot.focusedFileRef.current !== step.file
          )
        ) {
          if (queuedStepRef.current) {
            replayQueuedStep();
            return;
          }
          retriesLeft <= 0 ||
            (hostSnapshot.selectLayerNow(
              step.file,
              step.tid,
              step.token,
              false,
            )
              ? (current.timer = scheduleSelectStep(step, retriesLeft - 1))
              : hostSnapshot.handlesRef.current.get(step.file)?.isReady() ===
                  false && selectWhenReady(step));
        }
      }, hostRef.current.echoWaitMs ?? canvasFocusAnnouncementDelayMs);
      return timer;
    },
    selectWhenReady: Dynamic = (step?: Dynamic): Dynamic => {
      pendingSelectRef.current?.cancel();
      let serial: Dynamic = ++selectSerialRef.current,
        handleSettled: Dynamic = (outcome?: Dynamic): Dynamic => {
          if (
            pendingSelectRef.current?.serial !== serial ||
            ((pendingSelectRef.current = null),
            outcome !== "gave-up" || insideFileRef.current !== step.file)
          )
            return;
          if (activeStepRef.current?.token === step.token) {
            let queuedStep: Dynamic = queuedStepRef.current;
            queuedStep && (cancelAllSteps(), runStep(queuedStep, false));
            return;
          }
          let current: Dynamic = cursorRef.current;
          !current ||
            current.file !== step.file ||
            current.tid !== step.tid ||
            (announce(
              artboardLoadFailureAnnouncement(
                hostRef.current.titleOf(step.file),
              ),
            ),
            (cursorRef.current = null));
        },
        cancelSelect: Dynamic = hostRef.current.selectElementIn(
          step.file,
          step.tid,
          (): Dynamic => recordActiveStep(step, false),
          step.token,
          handleSettled,
        );
      pendingSelectRef.current = {
        ...step,
        cancel: cancelSelect,
        serial: serial,
      };
    },
    isStepPending: Dynamic = (): Dynamic => {
      let current: Dynamic = activeStepRef.current;
      return (
        current != null &&
        (current.timer != null || pendingSelectRef.current?.token === current.token)
      );
    },
    runStep: Dynamic = (step?: Dynamic, selectOption?: Dynamic): Dynamic => {
      hostRef.current.selectLayerNow(
        step.file,
        step.tid,
        step.token,
        selectOption,
      )
        ? recordActiveStep(step, true)
        : selectWhenReady(step);
    },
    cancelAllSteps: Dynamic = (): Dynamic => {
      let current: Dynamic = activeStepRef.current;
      current?.timer && clearTimeout(current.timer);
      activeStepRef.current = null;
      queuedStepRef.current = null;
      pendingSelectRef.current?.cancel();
      pendingSelectRef.current = null;
    },
    replayQueuedStep: Dynamic = (): Dynamic => {
      let current: Dynamic = queuedStepRef.current;
      cancelAllSteps();
      current && runStep(current, false);
    },
    cancelPendingSteps: Dynamic = (): Dynamic => cancelAllSteps(),
    settleArtboardSelection: Dynamic = (file?: Dynamic): Dynamic => {
      let current: Dynamic = hostRef.current,
        pendingStep: Dynamic = activeStepRef.current ?? pendingSelectRef.current;
      pendingStep &&
        pendingStep.file === file &&
        (current.megaSelRef.current.elements.has(file) ||
          current.clearFrameSelection(file, pendingStep.token));
      cancelPendingSteps();
      current.selectArtboard(file);
    },
    selectWholeArtboard: Dynamic = (file?: Dynamic): Dynamic => {
      let current: Dynamic = hostRef.current;
      pendingEnterFileRef.current = null;
      cursorRef.current?.file === file && (cursorRef.current = null);
      setInsideFileNow(null);
      settleArtboardSelection(file);
      current.focusArtboard(file);
      announce(
        selectionAnnouncement(
          selectionFromArtboards(new Set([file])),
          outlineTreesRef.current,
          current.titleOf,
        ),
      );
      current.sayUnreadable?.(file);
    };
  (0, react_ta.useEffect)(
    (): Dynamic => (): Dynamic => {
      cancelPendingSteps();
      holdTimerRef.current && clearTimeout(holdTimerRef.current);
    },
    [],
  );
  let moveToNode: Dynamic = (
      file?: Dynamic,
      tid?: Dynamic,
      announcement?: Dynamic,
    ): Dynamic => {
      cursorRef.current = {
        file: file,
        tid: tid,
      };
      cursorTreeRef.current = outlineTreesRef.current[file];
      announce(announcement);
      let step: Dynamic = {
          file: file,
          tid: tid,
          token: keyboardNavigationMode + String(++tokenCounterRef.current),
          at: Date.now(),
          tree: outlineTreesRef.current[file],
        },
        current: Dynamic = activeStepRef.current;
      current && current.file === file && isStepPending()
        ? (queuedStepRef.current = step)
        : (cancelPendingSteps(), runStep(step, true));
    },
    enterOutline: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        let current: Dynamic = hostRef.current,
          tree: Dynamic = outlineTreesRef.current[file],
          handle: Dynamic = current.handlesRef.current.get(file),
          title: Dynamic = current.titleOf(file);
        current.bringArtboardIntoView(file);
        textEditFileRef.current = null;
        (activeStepRef.current ?? pendingSelectRef.current) != null &&
          (activeStepRef.current ?? pendingSelectRef.current).file !== file &&
          cancelPendingSteps();
        cursorRef.current?.file !== file && (cursorRef.current = null);
        if (handle?.isBlocked()) {
          pendingEnterFileRef.current = null;
          setInsideFileNow(null);
          settleArtboardSelection(file);
          current.focusArtboard(file);
          announce(
            artboardLoadFailureAnnouncement(title),
          );
          return;
        }
        if (tree === undefined || handle == null) {
          setInsideFileNow(file);
          pendingEnterFileRef.current = file;
          current.clearSelectionQuietly();
          current.focusArtboard(file);
          announce(
            artboardLoadingAnnouncement(title),
          );
          return;
        }
        pendingEnterFileRef.current = null;
        if (tree === null) return selectWholeArtboard(file);
        if (tree.length === 0) {
          setInsideFileNow(null);
          settleArtboardSelection(file);
          current.focusArtboard(file);
          announce(
            emptyArtboardSelectionAnnouncement(title),
          );
          return;
        }
        setInsideFileNow(file);
        canvasElementSelectionCount(
          current.megaSelRef.current,
        ) && current.clearSelectionQuietly();
        let cursorTid: Dynamic =
            current.focusedFileRef.current === file
              ? findCursorTid(file, tree)
              : null,
          targetNode: Dynamic =
            cursorTid != null
              ? findOutlineLocation(tree, cursorTid).node
              : deepestSingleOutlineNode(tree);
        moveToNode(
          file,
          targetNode.tid,
          outlineLayerNavigationAnnouncement(
            findOutlineLocation(tree, targetNode.tid),
          ),
        );
      },
      [],
    );
  (0, react_ta.useEffect)((): Dynamic => {
    let current: Dynamic = pendingEnterFileRef.current;
    if (current == null || insideFileRef.current !== current) return;
    let tree: Dynamic = outlineTrees[current],
      hostNow: Dynamic = hostRef.current,
      handle: Dynamic = hostNow.handlesRef.current.get(current);
    if (handle?.isBlocked()) {
      pendingEnterFileRef.current = null;
      setInsideFileNow(null);
      settleArtboardSelection(current);
      announce(
        artboardLoadFailureAnnouncement(
          hostNow.titleOf(current),
        ),
      );
      return;
    }
    if (tree === undefined || handle == null) return;
    pendingEnterFileRef.current = null;
    if (tree === null) return selectWholeArtboard(current);
    if (tree.length === 0) {
      setInsideFileNow(null);
      settleArtboardSelection(current);
      announce(
        emptyArtboardSelectionAnnouncement(
          hostNow.titleOf(current),
        ),
      );
      return;
    }
    let targetNode: Dynamic = deepestSingleOutlineNode(tree);
    moveToNode(
      current,
      targetNode.tid,
      outlineLayerNavigationAnnouncement(
        findOutlineLocation(tree, targetNode.tid),
      ),
    );
  }, [outlineTrees, insideFile]);
  let stepOutline: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic, direction?: Dynamic): Dynamic => {
        if (insideFileRef.current !== file) return;
        let tree: Dynamic = outlineTreesRef.current[file];
        if (tree === undefined) {
          announce(
            artboardLoadingAnnouncement(
              hostRef.current.titleOf(file),
            ),
          );
          return;
        }
        if (tree === null) return selectWholeArtboard(file);
        let nextNode: Dynamic = adjacentOutlineNode(
          tree,
          findCursorTid(file, tree),
          direction,
        );
        if (!nextNode) {
          let current: Dynamic = hostRef.current;
          pendingEnterFileRef.current = null;
          cursorRef.current = null;
          setInsideFileNow(null);
          settleArtboardSelection(file);
          announce(
            emptyArtboardSelectionAnnouncement(
              current.titleOf(file),
            ),
          );
          return;
        }
        moveToNode(
          file,
          nextNode.tid,
          outlineLayerAnnouncement(
            findOutlineLocation(tree, nextNode.tid),
          ),
        );
      },
      [],
    ),
    descendOutline: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        if (insideFileRef.current !== file) return;
        let current: Dynamic = hostRef.current,
          tree: Dynamic = outlineTreesRef.current[file];
        if (tree === undefined) {
          announce(
            artboardLoadingAnnouncement(current.titleOf(file)),
          );
          return;
        }
        if (tree === null) return selectWholeArtboard(file);
        let cursorTid: Dynamic = findCursorTid(file, tree);
        if (cursorTid == null) {
          stepOutline(file, "first");
          return;
        }
        let location: Dynamic = findOutlineLocation(
            tree,
            cursorTid,
          ),
          entry: Dynamic = current.handlesRef.current.get(file);
        if (
          current.canEditRef.current &&
          entry &&
          current.focusedFileRef.current === file &&
          entry.describeTids([cursorTid])[0]?.editable === true
        ) {
          if (!entry.isReady()) {
            announce(
              artboardLoadingAnnouncement(
                current.titleOf(file),
              ),
            );
            return;
          }
          textEditFileRef.current = file;
          entry.startTextEdit(current.rootNameOf(file), cursorTid, "end");
          announce(textEditStartedAnnouncement);
          return;
        }
        let childNode: Dynamic = firstNestedOutlineNode(
          location.node,
        );
        if (!childNode) {
          announce(NoLayersInsideThisOneMessage);
          return;
        }
        moveToNode(
          file,
          childNode.tid,
          outlineLayerAnnouncement(
            findOutlineLocation(tree, childNode.tid),
          ),
        );
      },
      [stepOutline],
    ),
    leaveOutline: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        let current: Dynamic = hostRef.current;
        pendingEnterFileRef.current = null;
        textEditFileRef.current = null;
        cursorRef.current = null;
        expectedSelectionRef.current = null;
        setInsideFileNow(null);
        settleArtboardSelection(file);
        announce(
          exitOutlineAnnouncement(current.titleOf(file)),
        );
      },
      [],
    ),
    ascendOutline: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        if (insideFileRef.current !== file) return;
        let tree: Dynamic = outlineTreesRef.current[file];
        if (tree === undefined) {
          announce(
            artboardLoadingAnnouncement(
              hostRef.current.titleOf(file),
            ),
          );
          return;
        }
        if (tree === null) return selectWholeArtboard(file);
        let cursorTid: Dynamic = findCursorTid(file, tree);
        if (cursorTid == null) {
          stepOutline(file, "first");
          return;
        }
        let location: Dynamic = findOutlineLocation(
          tree,
          cursorTid,
        );
        if (!location.parent) {
          leaveOutline(file);
          return;
        }
        moveToNode(
          file,
          location.parent.tid,
          outlineLayerAnnouncement(
            findOutlineLocation(tree, location.parent.tid),
          ),
        );
      },
      [stepOutline, leaveOutline],
    ),
    abandonOutline: Dynamic = (0, react_ta.useCallback)((): Dynamic => {
      if (insideFileRef.current == null && pendingEnterFileRef.current == null) return;
      pendingEnterFileRef.current = null;
      textEditFileRef.current = null;
      cursorRef.current = null;
      let current: Dynamic = hostRef.current,
        pendingStep: Dynamic = activeStepRef.current ?? pendingSelectRef.current;
      pendingStep &&
        current.focusedFileRef.current === pendingStep.file &&
        (current.megaSelRef.current.elements.has(pendingStep.file) &&
          current.forgetHostSelection(pendingStep.file),
        current.clearFrameSelection(pendingStep.file, pendingStep.token));
      expectedSelectionRef.current = null;
      cancelPendingSteps();
      setInsideFileNow(null);
    }, []),
    handleTextEditEnded: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        let wasTextEdit: Dynamic = textEditFileRef.current === file;
        textEditFileRef.current = null;
        if (
          !wasTextEdit ||
          insideFileRef.current !== file ||
          !(document as Dynamic).hasFocus()
        )
          return;
        let activeElement: Dynamic = (document as Dynamic).activeElement;
        (activeElement != null &&
          activeElement !== (document as Dynamic).body &&
          activeElement.tagName !== "IFRAME") ||
          hostRef.current.stopOf(file)?.focus({
            preventScroll: true,
          });
      },
      [],
    ),
    getTextEditFile: Dynamic = (0, react_ta.useCallback)(
      (): Dynamic => textEditFileRef.current,
      [],
    ),
    handleFrameRebooted: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        expectedSelectionRef.current?.file === file && (expectedSelectionRef.current = null);
        let trackedStep: Dynamic = activeStepRef.current ?? pendingSelectRef.current,
          restartableStep: Dynamic =
            queuedStepRef.current?.file === file
              ? queuedStepRef.current
              : trackedStep?.file === file
                ? trackedStep
                : null,
          cursor: Dynamic =
            cursorRef.current?.file === file && insideFileRef.current === file
              ? cursorRef.current
              : null,
          current: Dynamic = hostRef.current.megaSelRef.current,
          entry: Dynamic = current.elements.get(file),
          derivedStep: Dynamic =
            !restartableStep &&
            cursor &&
            entry &&
            entry.tids.length === 1 &&
            entry.tids[0] === cursor.tid &&
            entry.part === undefined
              ? {
                  file: file,
                  tid: cursor.tid,
                  token: keyboardNavigationMode + String(++tokenCounterRef.current),
                  at: Date.now(),
                  tree: cursorTreeRef.current,
                }
              : null,
          stepToReplay: Dynamic = restartableStep ?? derivedStep,
          currentTree: Dynamic = outlineTreesRef.current[file];
        return stepToReplay && currentTree != null && stepToReplay.tree === currentTree
          ? (cancelAllSteps(), runStep(stepToReplay, false), "redriven")
          : (trackedStep?.file === file && cancelPendingSteps(),
            cursorRef.current?.file === file && (cursorRef.current = null),
            !stepToReplay || insideFileRef.current !== file
              ? false
              : ([...current.elements.keys()].some(
                  (otherFile?: Dynamic): Dynamic => otherFile !== file,
                ) || announce(NothingSelectedMessage),
                "lost"));
      },
      [],
    ),
    noteSelection: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic, tids?: Dynamic, selectionToken?: Dynamic): Dynamic => {
        let isEmpty: Dynamic = tids == null || tids.length === 0,
          current: Dynamic = activeStepRef.current;
        if (selectionToken != null && selectionToken.startsWith(keyboardNavigationMode)) {
          if (isEmpty) return false;
          if (
            current &&
            current.token === selectionToken &&
            current.file === file &&
            tids.length === 1 &&
            tids[0] === current.tid
          ) {
            expectedSelectionRef.current = {
              file: file,
              tid: current.tid,
            };
            queuedStepRef.current == null &&
              ((cursorRef.current = {
                file: file,
                tid: current.tid,
              }),
              (cursorTreeRef.current = current.tree));
            replayQueuedStep();
            return true;
          }
          if (
            !(
              insideFileRef.current === file &&
              current == null &&
              pendingSelectRef.current == null
            )
          )
            return false;
        }
        let isSameFile: Dynamic =
          current?.file === file || pendingSelectRef.current?.file === file;
        if (isEmpty && isSameFile) return false;
        expectedSelectionRef.current = null;
        !isEmpty && isSameFile && cancelPendingSteps();
        if (insideFileRef.current !== file) return true;
        if (isEmpty) {
          cursorRef.current = null;
          return true;
        }
        let cursor: Dynamic = cursorRef.current;
        return cursor != null &&
          cursor.file === file &&
          tids.length === 1 &&
          tids[0] === cursor.tid
          ? ((expectedSelectionRef.current = {
              file: file,
              tid: cursor.tid,
            }),
            true)
          : ((cursor == null ||
              cursor.file !== file ||
              !tids.includes(cursor.tid)) &&
              ((cursorRef.current = {
                file: file,
                tid: tids[0],
              }),
              (cursorTreeRef.current = outlineTreesRef.current[file])),
            true);
      },
      [],
    ),
    consumeSaidSelection: Dynamic = (0, react_ta.useCallback)(
      (selection?: Dynamic): Dynamic => {
        let current: Dynamic = expectedSelectionRef.current;
        expectedSelectionRef.current = null;
        if (
          !current ||
          selection.elements.size !== 1 ||
          selection.artboards.size + selection.notes.size > 0
        )
          return false;
        let entry: Dynamic = selection.elements.get(current.file);
        return (
          entry != null &&
          entry.tids.length === 1 &&
          entry.tids[0] === current.tid &&
          entry.part === undefined
        );
      },
      [],
    ),
    isSettling: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic =>
        activeStepRef.current?.file === file ||
        queuedStepRef.current?.file === file ||
        pendingSelectRef.current?.file === file,
      [],
    ),
    holdKey: Dynamic = (0, react_ta.useCallback)(
      (file?: Dynamic): Dynamic => {
        if (!isSettling(file)) return false;
        let startedAt: Dynamic =
          (queuedStepRef.current ?? activeStepRef.current ?? pendingSelectRef.current)?.at ??
          Date.now();
        if (holdTimeRef.current === startedAt) return true;
        holdTimeRef.current = startedAt;
        let announceHeldNode: Dynamic = (): Dynamic => {
            holdTimerRef.current = null;
            let current: Dynamic = cursorRef.current;
            if (
              holdTimeRef.current !== startedAt ||
              !isSettling(file) ||
              !current ||
              current.file !== file
            )
              return;
            let tree: Dynamic = outlineTreesRef.current[file],
              location: Dynamic = tree
                ? findOutlineLocation(tree, current.tid)
                : null;
            location &&
              announce(
                selectingAnnouncement(
                  outlineNodeDescription(location.node),
                ),
              );
          },
          elapsedMs: Dynamic = Date.now() - startedAt;
        elapsedMs >= canvasKeyboardRepeatIntervalMs
          ? announceHeldNode()
          : (holdTimerRef.current && clearTimeout(holdTimerRef.current),
            (holdTimerRef.current = setTimeout(
              announceHeldNode,
              canvasKeyboardRepeatIntervalMs - elapsedMs,
            )));
        return true;
      },
      [isSettling],
    );
  return (0, react_ta.useMemo)(
    (): Dynamic => ({
      inside: insideFile,
      insideRef: insideFileRef,
      enter: enterOutline,
      step: stepOutline,
      descend: descendOutline,
      ascend: ascendOutline,
      leave: leaveOutline,
      abandon: abandonOutline,
      settling: isSettling,
      holdKey: holdKey,
      onTextEditEnded: handleTextEditEnded,
      editBeganFromStop: getTextEditFile,
      frameRebooted: handleFrameRebooted,
      noteSelection: noteSelection,
      saidSelection: consumeSaidSelection,
    }),
    [
      insideFile,
      enterOutline,
      stepOutline,
      descendOutline,
      ascendOutline,
      leaveOutline,
      abandonOutline,
      isSettling,
      holdKey,
      handleTextEditEnded,
      getTextEditFile,
      handleFrameRebooted,
      noteSelection,
      consumeSaidSelection,
    ],
  );
}
export {
  canvasFocusAnnouncementDelayMs,
  canvasFocusAnnouncementRepeatCount,
  canvasKeyboardRepeatIntervalMs,
  keyboardNavigationMode,
  react_ta,
  useCanvasKeyboardNavigation,
};
export function installCanvasKeyboardNavigation(): () => void {
  return () => {
    react_ta = toModuleNamespace(load_react(), 1);
    canvasFocusAnnouncementDelayMs = 1500;
    canvasFocusAnnouncementRepeatCount = 3;
    keyboardNavigationMode = "kb";
    canvasKeyboardRepeatIntervalMs = 300;
  };
}

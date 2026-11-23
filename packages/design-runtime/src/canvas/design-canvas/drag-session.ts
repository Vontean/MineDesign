import { uiMessage } from "@minedesign/contracts/ui-messages";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { canFreezeSinglePaste, pastedElementGeometry } from "../../editor/insert/drop-targets";
import type { Dynamic } from "../../runtime-types";
import { randomSessionToken } from "../working-state";
import type { ProjectFiles } from "../../preview/asset-rewriting";
import type { CanvasManifest } from "../manifest-history";
import { annotationToElementHtml } from "./annotations";
import {
  dropCanvasObjectIntoArtboard,
  dropElementDragAtCanvasPoint,
  handleFrameElementDragEvent,
  handleHostElementDragEvent,
} from "./drag";
import { buildDragGhostPreview } from "./drag-ghost";
import { requestDropPlanPreview, trackObjectHoverOverArtboard } from "./drag-hover";

/**
 * 画板与画布对象的拖动会话：拖动状态、悬停落点、落点历史（含 3.5 秒撤销超时）与清理。
 *
 * deps 按 project / target / session / history / document / selection / feedback 分组；
 * 每项都是 getter，保证惰性读取（入口里声明靠后的函数和 ref 在事件触发时才取值）。
 * hostGesturingRef 属于更广的宿主手势状态，由入口持有并经 session.hostGesturing 传入。
 */
type Ref<T> = { current: T };

/** 画板槽位对外暴露的拖动与序列化能力（只列出本会话用到的）。 */
interface ArtboardDragEntry {
  dropPlanClear(token: string): void;
  moveHost(token: string, mode: "open" | "close"): Promise<boolean>;
  renderDefaults(): Promise<unknown>;
  serializeSelection(tids: number[], options: { bakeProps: boolean; vals: unknown }): string | null;
  hostDrag(action: string, gestureKey: string): void;
  pieceContent(): unknown;
  describeTids(tids: number[]): { kind: string }[];
}

/** 悬停命中的画板：frameless 画板只有在激活时才接收悬停。 */
interface HoverableArtboard {
  file: string;
  x: number;
  y: number;
  w: number;
  h: number;
  frameless?: boolean;
}

/** 可撤销历史的读写口：落点撤销需要读取栈顶并执行 undo。 */
interface InlineHistoryKeeper {
  headBound(direction: "undo" | "redo"): unknown;
  busy(): boolean;
  undo(): string;
  clearRedo(): void;
}

/** useCanvasDragSession 的依赖：每个字段都是 getter，由入口按需读取。 */
export interface CanvasDragSessionDependencies {
  /** assets 只透传给拖动预览；doc 供预览读取项目文件，也透传给落点提交。 */
  project: { assets: unknown; doc: { content(): { files: ProjectFiles } } };
  target: {
    artboardEntries: Ref<Map<string, ArtboardDragEntry>>;
    pageContents: Ref<{ artboards: HoverableArtboard[] }>;
    activeArtboard: Ref<string | null>;
    playingFile: Ref<string | null>;
    fullscreenActive: Ref<boolean>;
    focusedFile: Ref<string | null>;
    getArtboardTitle: (fileKey: string) => string;
    componentName: (file: string) => unknown;
    recordDropTarget: (...args: unknown[]) => unknown;
  };
  session: {
    pendingSelectionCommands: Ref<number>;
    waitForBoundOperation: (key: unknown) => Promise<unknown>;
    runSelectionCommand: (timeoutMs: number) => unknown;
    hostGesturing: Ref<boolean>;
  };
  history: {
    inlineHistory: Ref<InlineHistoryKeeper | null>;
    recordManifestHistory: Ref<(...args: unknown[]) => unknown>;
    runWhenConditionReady: (condition: () => boolean, onReady: () => void, attempts?: number) => void;
  };
  document: {
    manifest: Ref<CanvasManifest>;
    manifestState: CanvasManifest;
    dropCanvasObject: (travelState: unknown) => Promise<unknown>;
    deleteCanvasObjects: Ref<(...args: unknown[]) => unknown>;
    savePageSelection: (pageId?: string) => unknown;
    supportsLoadState: boolean;
    persistManifest: (nextState: CanvasManifest, baseState?: CanvasManifest) => void;
    markArtboardDropped: (file: string) => unknown;
  };
  selection: {
    current: Ref<{ elements: Map<string, { tids: number[] }> }>;
    setSelection: (selection: unknown) => void;
    setShownFrameSelection: (selection: unknown) => void;
    abandonGesture: (...args: unknown[]) => unknown;
    clearFramePick: () => void;
  };
  feedback: {
    showToast: (message: string, variant?: string) => unknown;
    showDragToast: (message: string) => void;
    clearDragToast: (message?: string) => void;
    showDragToastRef: Ref<(message: string) => void>;
  };
}

export function useCanvasDragSession(deps: CanvasDragSessionDependencies) {
  const { project, target, session, history, document: documentDeps, selection, feedback } = deps;
  const frameDragRef: Dynamic = React.useRef(null);
  const [dragPreview, setDragPreview]: Dynamic = React.useState(null);
  const dragGhostRef: Dynamic = React.useRef(null);
  const describeDragPreview: Dynamic = React.useCallback(
    (input?: Dynamic, options?: Dynamic, context?: Dynamic, altText?: Dynamic): Dynamic => ({
      key: input.key,
      x: options,
      y: context,
      label: input.label,
      alt: altText,
      box: input.box,
      ghost: dragGhostRef.current?.key === input.key ? dragGhostRef.current.ghost : null,
    }),
    [],
  );
  const prepareDragGhost: Dynamic = React.useCallback(
    (dragStart: Dynamic) =>
      buildDragGhostPreview(
        { assets: project.assets, doc: project.doc, artboardEntriesRef: target.artboardEntries, setDragPreview, dragGhostRef },
        dragStart,
      ),
    [project.doc, project.assets],
  );
  const [streamDragFile, setStreamDragFile]: Dynamic = React.useState(null);
  const dragTimerRef: Dynamic = React.useRef(null);
  const dropInProgressRef: Dynamic = React.useRef(false);
  const dragHoverSessionRef: Dynamic = React.useRef(null);
  const closeDragHoverTarget: Dynamic = React.useCallback((input?: Dynamic): Dynamic => {
    const hoverSession: Dynamic = dragHoverSessionRef.current;
    if (!hoverSession) return;
    const hoverTarget: Dynamic = hoverSession.target;
    if (hoverTarget && hoverTarget.file !== input) {
      const entry: Dynamic = target.artboardEntries.current.get(hoverTarget.file);
      entry?.dropPlanClear(hoverSession.token);
      hoverSession.closing.set(
        hoverTarget.file,
        hoverTarget.opened
          .then((): Dynamic => entry?.moveHost(hoverSession.token, "close"))
          .catch((): Dynamic => false),
      );
      hoverSession.target = null;
    }
    hoverSession.pending = null;
  }, []);
  const startDragHoverSession: Dynamic = React.useCallback(
    (input?: Dynamic): Dynamic => {
      if (dragHoverSessionRef.current?.gestureKey === input.key) return;
      closeDragHoverTarget();
      const state: Dynamic = {
        gestureKey: input.key,
        token: randomSessionToken(),
        html: null,
        member: null,
        laidOut: new Map(),
        closing: new Map(),
        target: null,
        inFlight: null,
        pending: null,
      };
      dragHoverSessionRef.current = state;
      const entry: Dynamic = target.artboardEntries.current.get(input.file);
      if (!entry || !input.box || input.tids.length !== 1) return;
      const box: Dynamic = input.box;
      entry
        .renderDefaults()
        .then((defaults?: Dynamic): Dynamic => {
          if (dragHoverSessionRef.current !== state) return;
          const selectionHtml: Dynamic = entry.serializeSelection(input.tids, {
            bakeProps: true,
            vals: defaults,
          });
          state.html = selectionHtml || null;
          state.member =
            selectionHtml && canFreezeSinglePaste(false, input.tids, selectionHtml, false)
              ? pastedElementGeometry(selectionHtml, box)
              : null;
        })
        .catch((): Dynamic => {});
    },
    [closeDragHoverTarget],
  );
  const requestDragDropPreview: Dynamic = React.useCallback(
    (...args: Dynamic[]): Dynamic =>
      (requestDropPlanPreview as Dynamic)(
        {
          get artboardEntries() { return target.artboardEntries; },
          get hoverSession() { return dragHoverSessionRef; },
          get requestPreview() { return requestDragDropPreview; },
          get pageContents() { return target.pageContents; },
        },
        ...args,
      ),
    [],
  );
  const updateDragHoverTarget: Dynamic = React.useCallback(
    (input?: Dynamic, options?: Dynamic, context?: Dynamic, suppressTarget?: Dynamic): Dynamic => {
      const hoverSession: Dynamic = dragHoverSessionRef.current;
      if (!hoverSession || hoverSession.gestureKey !== input.key) return;
      const candidateArtboard: Dynamic =
        suppressTarget || input.tids.length !== 1 || target.fullscreenActive.current
          ? null
          : [...target.pageContents.current.artboards]
              .reverse()
              .find(
                (artboard?: Dynamic): Dynamic =>
                  !(artboard.frameless && artboard.file !== target.activeArtboard.current) &&
                  options >= artboard.x &&
                  options <= artboard.x + artboard.w &&
                  context >= artboard.y &&
                  context <= artboard.y + artboard.h,
              );
      const targetFile: Dynamic =
        candidateArtboard &&
        candidateArtboard.file !== input.file &&
        candidateArtboard.file !== target.playingFile.current
          ? candidateArtboard.file
          : null;
      hoverSession.target && hoverSession.target.file !== targetFile && closeDragHoverTarget();
      if (!!targetFile) {
        if (!hoverSession.target) {
          const entry: Dynamic = target.artboardEntries.current.get(targetFile);
          hoverSession.target = {
            file: targetFile,
            opened: (hoverSession.closing.get(targetFile) ?? Promise.resolve())
              .then((): Dynamic => entry?.moveHost(hoverSession.token, "open") ?? false)
              .catch((): Dynamic => false),
          };
        }
        requestDragDropPreview(hoverSession, hoverSession.target, options, context, input.ctrl ? "keep" : "flow");
      }
    },
    [closeDragHoverTarget, requestDragDropPreview],
  );
  const draggedArtboardRef: Dynamic = React.useRef(null);
  const clearFrameDrag: Dynamic = React.useCallback(
    (input: Dynamic = false): Dynamic => {
      frameDragRef.current = null;
      dragTimerRef.current && clearTimeout(dragTimerRef.current);
      setDragPreview(null);
      setStreamDragFile(draggedArtboardRef.current?.file ?? null);
      input || (closeDragHoverTarget(), (dragHoverSessionRef.current = null));
    },
    [closeDragHoverTarget],
  );
  const finishDragSession: Dynamic = React.useCallback((): Dynamic => {
    draggedArtboardRef.current = null;
    frameDragRef.current ||
      (dragTimerRef.current && clearTimeout(dragTimerRef.current),
      setStreamDragFile(null),
      (dragGhostRef.current = null),
      (dragHoverSessionRef.current = null));
  }, []);
  const cancelFrameDrag: Dynamic = React.useCallback((): Dynamic => {
    const activeDrag: Dynamic = frameDragRef.current ?? draggedArtboardRef.current;
    activeDrag && target.artboardEntries.current.get(activeDrag.file)?.hostDrag("cancel", activeDrag.key);
    draggedArtboardRef.current = null;
    clearFrameDrag();
  }, [clearFrameDrag]);
  const annotationToHtml: Dynamic = (...args: Dynamic[]): Dynamic => (annotationToElementHtml as Dynamic)({}, ...args);
  const readDraggedObjectHtml: Dynamic = React.useCallback(async (input?: Dynamic): Promise<Dynamic> => {
    if ("note" in input) {
      const draggedAnnotation: Dynamic = (documentDeps.manifest.current.annotations ?? []).find(
        (annotation?: Dynamic): Dynamic => annotation.id === input.note,
      );
      return draggedAnnotation ? annotationToHtml(draggedAnnotation) : null;
    }
    const entry: Dynamic = target.artboardEntries.current.get(input.file);
    return entry &&
      documentDeps.manifest.current.artboards.find((artboard?: Dynamic): Dynamic => artboard.file === input.file)?.frameless
      ? entry.pieceContent()
      : null;
  }, []);
  const handleCanvasObjectHover: Dynamic = React.useCallback(
    (...args: Dynamic[]): Dynamic =>
      (trackObjectHoverOverArtboard as Dynamic)(
        {
          get artboardEntries() { return target.artboardEntries; },
          get dropInProgress() { return dropInProgressRef; },
          get hoverSession() { return dragHoverSessionRef; },
          get closeHoverTarget() { return closeDragHoverTarget; },
          get requestPreview() { return requestDragDropPreview; },
          get readObjectHtml() { return readDraggedObjectHtml; },
          get playingFile() { return target.playingFile; },
          get fullscreenActive() { return target.fullscreenActive; },
        },
        ...args,
      ),
    [closeDragHoverTarget, requestDragDropPreview, readDraggedObjectHtml],
  );
  const waitForDropHistory: Dynamic = React.useCallback(
    async (command?: Dynamic, historyEntry?: Dynamic, commandContext?: Dynamic): Promise<Dynamic> => {
      const historyKeeper: Dynamic = history.inlineHistory.current;
      (await new Promise((resolve?: Dynamic): Dynamic => {
        let resolved: Dynamic = false;
        const finishUndo: Dynamic = (didApply?: Dynamic): Dynamic => {
          resolved || ((resolved = true), resolve(didApply));
        };
        if (!historyKeeper || historyKeeper.headBound("undo") !== historyEntry) return finishUndo(false);
        history.runWhenConditionReady(
          (): Dynamic => resolved || !historyKeeper.busy(),
          (): Dynamic => {
            if (resolved || historyKeeper.headBound("undo") !== historyEntry) return finishUndo(false);
            const undoResult: Dynamic = historyKeeper.undo();
            undoResult === "applied" && historyKeeper.clearRedo();
            finishUndo(undoResult === "applied");
          },
        );
        setTimeout((): Dynamic => finishUndo(false), 3500);
      })) ||
        feedback.showDragToastRef.current(
          uiMessage("canvas.designCanvas.couldnTUndoTheMove") +
            target.getArtboardTitle(command) +
            ". The " +
            commandContext +
            " may now be in both places.",
        );
    },
    [],
  );
  const dropCanvasObjectInto: Dynamic = React.useCallback(
    (...args: Dynamic[]): Dynamic =>
      (dropCanvasObjectIntoArtboard as Dynamic)(
        {
          target,
          session: {
            get dropInProgress() { return dropInProgressRef; },
            get hoverSession() { return dragHoverSessionRef; },
            get closeHoverTarget() { return closeDragHoverTarget; },
            get pendingSelectionCommands() { return session.pendingSelectionCommands; },
            get waitForBoundOperation() { return session.waitForBoundOperation; },
          },
          history: {
            get waitForDropHistory() { return waitForDropHistory; },
            get inlineHistory() { return history.inlineHistory; },
          },
          document: {
            get annotationToHtml() { return annotationToHtml; },
            get dropCanvasObject() { return documentDeps.dropCanvasObject; },
            get deleteCanvasObjects() { return documentDeps.deleteCanvasObjects; },
            get manifest() { return documentDeps.manifest; },
          },
          selection: {
            get focusedFile() { return target.focusedFile; },
            get current() { return selection.current; },
            get setSelection() { return selection.setSelection; },
            get setShownFrameSelection() { return selection.setShownFrameSelection; },
          },
          feedback,
        },
        ...args,
      ),
    [
      feedback.showDragToast,
      feedback.showToast,
      feedback.clearDragToast,
      documentDeps.dropCanvasObject,
      waitForDropHistory,
      closeDragHoverTarget,
      selection.setShownFrameSelection,
    ],
  );
  const handleElementDrag: Dynamic = React.useCallback(
    (...args: Dynamic[]): Dynamic =>
      (dropElementDragAtCanvasPoint as Dynamic)(
        {
          target,
          session: {
            get dropInProgress() { return dropInProgressRef; },
            get hoverSession() { return dragHoverSessionRef; },
            get pendingSelectionCommands() { return session.pendingSelectionCommands; },
            get runSelectionCommand() { return session.runSelectionCommand; },
          },
          history: {
            get recordManifestHistory() { return history.recordManifestHistory; },
            get inlineHistory() { return history.inlineHistory; },
          },
          document: {
            get savePageSelection() { return documentDeps.savePageSelection; },
            get doc() { return project.doc; },
            get supportsLoadState() { return documentDeps.supportsLoadState; },
            get manifest() { return documentDeps.manifest; },
            get persistManifest() { return documentDeps.persistManifest; },
            get markArtboardDropped() { return documentDeps.markArtboardDropped; },
            get dropCanvasObject() { return documentDeps.dropCanvasObject; },
          },
          selection: {
            get abandonGesture() { return selection.abandonGesture; },
            get setSelection() { return selection.setSelection; },
            get clearFramePick() { return selection.clearFramePick; },
          },
          feedback,
        },
        ...args,
      ),
    [
      documentDeps.manifestState,
      project.doc,
      documentDeps.persistManifest,
      selection.clearFramePick,
      feedback.showToast,
      feedback.clearDragToast,
      selection.abandonGesture,
      documentDeps.dropCanvasObject,
      session.runSelectionCommand,
    ],
  );
  const describeSelection: Dynamic = React.useCallback((fileKey?: Dynamic, selectedIds?: Dynamic): Dynamic => {
    const entry: Dynamic = selection.current.current.elements.get(fileKey);
    if (!entry) return null;
    const values: Dynamic = new Set(entry.tids);
    const selectedTids: Dynamic = selectedIds.filter((id?: Dynamic): Dynamic => values.has(id));
    if (selectedTids.length === 0) return null;
    const selectedKinds: Dynamic = target.artboardEntries.current.get(fileKey)?.describeTids(selectedTids) ?? [];
    const selectionLabel: Dynamic =
      selectedKinds.length === 1
        ? selectedKinds[0].kind === "other"
          ? "element"
          : selectedKinds[0].kind
        : selectedKinds.length + " elements";
    return { tids: selectedTids, label: selectionLabel };
  }, []);
  const handleCanvasDrag: Dynamic = React.useCallback(
    (...args: Dynamic[]): Dynamic =>
      (handleFrameElementDragEvent as Dynamic)(
        {
          target: {
            get focusedFile() { return target.focusedFile; },
            get artboardEntries() { return target.artboardEntries; },
          },
          session: {
            get frameDrag() { return frameDragRef; },
            get setStreamDragFile() { return setStreamDragFile; },
            get dragTimer() { return dragTimerRef; },
            get startHoverSession() { return startDragHoverSession; },
            get updateHoverTarget() { return updateDragHoverTarget; },
            get clearFrameDrag() { return clearFrameDrag; },
            get finishDragSession() { return finishDragSession; },
            get cancelFrameDrag() { return cancelFrameDrag; },
            get handleElementDrag() { return handleElementDrag; },
            get draggedArtboard() { return draggedArtboardRef; },
            get hostGesturing() { return session.hostGesturing; },
          },
          preview: {
            get setDragPreview() { return setDragPreview; },
            get describeDragPreview() { return describeDragPreview; },
            get prepareDragGhost() { return prepareDragGhost; },
          },
          selection: { get describeSelection() { return describeSelection; } },
          document: { get manifest() { return documentDeps.manifestState; } },
          feedback: { get showDragToast() { return feedback.showDragToast; } },
        },
        ...args,
      ),
    [
      documentDeps.manifestState,
      clearFrameDrag,
      finishDragSession,
      cancelFrameDrag,
      handleElementDrag,
      describeSelection,
      prepareDragGhost,
      startDragHoverSession,
      updateDragHoverTarget,
      describeDragPreview,
      feedback.showDragToast,
    ],
  );
  const handleHostDrag: Dynamic = React.useCallback(
    (...args: Dynamic[]): Dynamic =>
      (handleHostElementDragEvent as Dynamic)(
        {
          target: {
            get focusedFile() { return target.focusedFile; },
            get artboardEntries() { return target.artboardEntries; },
          },
          session: {
            get frameDrag() { return frameDragRef; },
            get dragTimer() { return dragTimerRef; },
            get updateHoverTarget() { return updateDragHoverTarget; },
            get clearFrameDrag() { return clearFrameDrag; },
            get finishDragSession() { return finishDragSession; },
            get cancelFrameDrag() { return cancelFrameDrag; },
            get handleElementDrag() { return handleElementDrag; },
            get draggedArtboard() { return draggedArtboardRef; },
          },
          preview: {
            get setDragPreview() { return setDragPreview; },
            get describeDragPreview() { return describeDragPreview; },
          },
          feedback: { get showDragToast() { return feedback.showDragToast; } },
        },
        ...args,
      ),
    [clearFrameDrag, finishDragSession, cancelFrameDrag, handleElementDrag, describeDragPreview, updateDragHoverTarget, feedback.showDragToast],
  );
  return {
    frameDragRef,
    dragPreview,
    streamDragFile,
    setStreamDragFile,
    dropInProgressRef,
    draggedArtboardRef,
    clearFrameDrag,
    handleCanvasDrag,
    handleHostDrag,
    handleCanvasObjectHover,
    dropCanvasObjectInto,
  };
}

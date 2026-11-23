import { canvasShapeReact as React } from "../../canvas/shape";
import { captureHistoryRebaseNow } from "../model/history-rebase";
import { finishPickerEdit } from "../picker/bridge";
import { classifyTextListEdit } from "../text/list-state";
import { SessionBusyError, UnsettledEditsError } from "./errors";
import type { Dynamic } from "../../runtime-types";

interface SessionSettlementOptions {
  readonly getPreviewFrame: Dynamic;
  readonly readOnlyRef: Dynamic;
  readonly pendingTextStateRef: Dynamic;
  readonly pendingTextRequestCounter: Dynamic;
  readonly modelRef: Dynamic;
  readonly rootName: Dynamic;
  readonly finishTextEdit: Dynamic;
  readonly typingQuietScheduler: Dynamic;
  readonly isReloadSuppressedRef: Dynamic;
  readonly resolveReloadDecisionRef: Dynamic;
  readonly hasUnsavedChanges: Dynamic;
  readonly flushSessionEdits: Dynamic;
  readonly settleSessionRef: Dynamic;
  readonly active: Dynamic;
}

/** 结束画板文字编辑、收敛保存并保护会话退出。 */
export function useSessionSettlement({
  getPreviewFrame,
  readOnlyRef,
  pendingTextStateRef,
  pendingTextRequestCounter,
  modelRef,
  rootName,
  finishTextEdit,
  typingQuietScheduler,
  isReloadSuppressedRef,
  resolveReloadDecisionRef,
  hasUnsavedChanges,
  flushSessionEdits,
  settleSessionRef,
  active,
}: SessionSettlementOptions) {
  let settlePromiseRef: Dynamic = (0, React.useRef)(null),
    finishOpenTextEdit: Dynamic = (0, React.useCallback)(
      async (shouldClassifyEdit?: Dynamic, onResolveEditedTid?: Dynamic): Promise<Dynamic> => {
        let previewFrame: Dynamic = getPreviewFrame();
        if (!previewFrame || readOnlyRef.current) return shouldClassifyEdit && "none";
        pendingTextStateRef.current !== null &&
          captureHistoryRebaseNow();
        let endPendingTextRequest: Dynamic = pendingTextRequestCounter.begin(
          pendingTextStateRef.current !== null,
        );
        try {
          let pickerEdit: Dynamic = await finishPickerEdit(
            previewFrame,
          );
          onResolveEditedTid?.(
            pickerEdit && !("foreign" in pickerEdit) ? pickerEdit.tid : null,
          );
          if (shouldClassifyEdit) {
            if (!pickerEdit) return "none";
            if ("foreign" in pickerEdit) return "refused";
            let captureEditState: Dynamic = (): Dynamic => {
                let rootTemplateState: Dynamic = modelRef.current.state(rootName);
                return rootTemplateState
                  ? {
                      undoLength: rootTemplateState.undo.length,
                      template: rootTemplateState.model.serialize(),
                      pendingScript: rootTemplateState.pendingScript,
                      pendingProps: rootTemplateState.pendingProps,
                      pendingPropsJson: JSON.stringify(
                        rootTemplateState.pendingProps ?? null,
                      ),
                    }
                  : null;
              },
              editStateBeforeCommit: Dynamic = captureEditState();
            finishTextEdit({
              type: "textEdit",
              ...pickerEdit,
            });
            return classifyTextListEdit(editStateBeforeCommit, captureEditState());
          }
          pickerEdit &&
            !("foreign" in pickerEdit) &&
            finishTextEdit({
              type: "textEdit",
              ...pickerEdit,
            });
          return;
        } finally {
          endPendingTextRequest();
          pendingTextStateRef.current === null && typingQuietScheduler.boxClosed();
        }
      },
      [getPreviewFrame, finishTextEdit, rootName, pendingTextRequestCounter, typingQuietScheduler],
    ),
    settlePendingEdits: Dynamic = (0,
    React.useCallback)(async (): Promise<Dynamic> => {
      if (isReloadSuppressedRef.current || resolveReloadDecisionRef.current !== null) return;
      if (settlePromiseRef.current) return settlePromiseRef.current;
      let settlePromise: Dynamic = (async (): Promise<Dynamic> => {
        await Promise.resolve();
        await finishOpenTextEdit();
        hasUnsavedChanges() &&
          (await flushSessionEdits({
            eject: true,
          }));
      })();
      settlePromiseRef.current = settlePromise;
      try {
        await settlePromise;
      } finally {
        settlePromiseRef.current = null;
      }
    }, [finishOpenTextEdit, flushSessionEdits, hasUnsavedChanges]),
    requireSettledEdits: Dynamic = (0,
    React.useCallback)(async (): Promise<Dynamic> => {
      if (isReloadSuppressedRef.current || resolveReloadDecisionRef.current !== null)
        throw new SessionBusyError();
      let wasSettling: Dynamic = settlePromiseRef.current !== null;
      await settlePendingEdits();
      wasSettling && hasUnsavedChanges() && (await settlePendingEdits());
      if (hasUnsavedChanges()) throw new UnsettledEditsError();
    }, [settlePendingEdits, hasUnsavedChanges]);
  (0, React.useEffect)((): Dynamic => {
    if (settleSessionRef) {
      settleSessionRef.current = active ? requireSettledEdits : null;
      return (): Dynamic => {
        settleSessionRef.current = null;
      };
    }
  }, [settleSessionRef, active, requireSettledEdits]);
  let exitGuardPromiseRef: Dynamic = (0, React.useRef)(null),
    prepareSessionExit: Dynamic = (0,
    React.useCallback)((): Dynamic => {
      if (exitGuardPromiseRef.current) return exitGuardPromiseRef.current;
      isReloadSuppressedRef.current = true;
      let exitGuardPromise: Dynamic = (async (): Promise<Dynamic> => {
        try {
          await finishOpenTextEdit();
          !settlePromiseRef.current &&
            hasUnsavedChanges() &&
            flushSessionEdits().catch((): Dynamic => {});
          return true;
        } finally {
          isReloadSuppressedRef.current = false;
          exitGuardPromiseRef.current = null;
        }
      })();
      exitGuardPromiseRef.current = exitGuardPromise;
      return exitGuardPromise;
    }, [finishOpenTextEdit, flushSessionEdits, hasUnsavedChanges]);
  return { finishOpenTextEdit, prepareSessionExit };
}

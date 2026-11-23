import { canvasShapeReact as React } from "../../canvas/shape";
import { captureHistoryRebaseNow } from "../model/history-rebase";
import { finishPickerEdit } from "../picker/bridge";
import { classifyTextListEdit } from "../text/list-state";
import { SessionBusyError, UnsettledEditsError } from "./errors";
import type { Dynamic } from "../../runtime-types";
import type { TextEditState, TypingQuietScheduler } from "./picker-messages";
import type { PreviewFrame, Ref } from "./selection-state";

interface SessionSettlementOptions {
  readonly getPreviewFrame: () => PreviewFrame | null | undefined;
  readonly readOnlyRef: Ref<boolean>;
  readonly pendingTextStateRef: Ref<TextEditState | null>;
  /** begin 登记一次待决的文字请求，返回的函数结束该登记。 */
  readonly pendingTextRequestCounter: { begin(hasPendingText: boolean): () => void };
  readonly modelRef: Ref<{
    state(templateName: string):
      | {
          readonly undo: readonly unknown[];
          readonly pendingScript: unknown;
          readonly pendingProps: unknown;
          readonly model: { serialize(): string };
        }
      | null
      | undefined;
  }>;
  readonly rootName: string;
  readonly finishTextEdit: (edit: { type: "textEdit" } & Record<string, Dynamic>) => unknown;
  readonly typingQuietScheduler: TypingQuietScheduler;
  readonly isReloadSuppressedRef: Ref<boolean>;
  readonly resolveReloadDecisionRef: Ref<unknown>;
  readonly hasUnsavedChanges: () => boolean;
  readonly flushSessionEdits: (options?: { eject?: boolean }) => Promise<unknown>;
  /** 外部持有的收敛入口；会话活跃时写入，卸载时清空。 */
  readonly settleSessionRef: Ref<(() => Promise<void>) | null> | undefined;
  readonly active: boolean;
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

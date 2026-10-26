import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { bindRuntimeValue, type RuntimeBindings } from "../runtime-types";
export function installEditorConfirmRemove(
  runtime: RuntimeBindings,
): () => void {
  var jsxConfirmDialog: typeof import("react/jsx-runtime");
  function ConfirmRemoveDialog({
    title: title,
    children: children,
    confirmLabel = "Remove",
    onCancel: onCancel,
    onConfirm: onConfirm,
  }: Token.ConfirmRemoveDialogProps): React.ReactElement {
    useUiLocale();
    return (
      <div className={"contents"} {...runtime.BLOCK_FILE_DROP_HANDLERS}>
        <runtime.CdsRoot density={"compact"} className={"contents"}>
          <runtime.ConfirmationDialog
            open={true}
            initialFocus={"cancel"}
            onOpenChange={(input: boolean): void => {
              if (!input) {
                onCancel();
              }
            }}
            title={title}
            description={children ?? (uiMessage("design-system.confirmRemove.undoBringsItBack"))}
            confirmLabel={confirmLabel}
            confirmVariant={"danger"}
            onConfirm={onConfirm}
            className={"ds-confirm-remove"}
          />
        </runtime.CdsRoot>
      </div>
    );
  }
  bindRuntimeValue(
    runtime,
    "jsxConfirmDialog",
    () => jsxConfirmDialog,
    (value) => {
      jsxConfirmDialog = value;
    },
  );
  bindRuntimeValue(runtime, "ConfirmRemoveDialog", () => ConfirmRemoveDialog);
  return () => {
    jsxConfirmDialog = (0, runtime.toModuleNamespace)(
      (0, runtime.loadJsxNamespace)(),
      1,
    );
  };
}

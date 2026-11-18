import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { BLOCK_FILE_DROP_HANDLERS } from "./shadows";
import { toModuleNamespace } from "../module-helpers";
import { ConfirmationDialog } from "../ui/dialog";
import { CdsRoot } from "../ui/overlays";

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
    <div className={"contents"} {...BLOCK_FILE_DROP_HANDLERS}>
      <CdsRoot density={"compact"} className={"contents"}>
        <ConfirmationDialog
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
      </CdsRoot>
    </div>
  );
}
export {
  ConfirmRemoveDialog,
  jsxConfirmDialog,
};
export function installEditorConfirmRemove(): () => void {
  return () => {
    jsxConfirmDialog = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}

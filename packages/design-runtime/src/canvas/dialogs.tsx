import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { Button } from "../cds/button/button";
import { TextInput } from "../cds/components/text-input";
import { ConfirmationDialog, DialogDialogRootTriggerPopupConfig } from "../cds/dialog/dialog";
import { initializeCdsIndex } from "../cds/index";
import { DisabledReasonTooltip } from "../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { usePanelClose } from "../editor/chrome/panel-close";
import { toModuleNamespace } from "../module-helpers";

var react_M6: Dynamic;
var jsx_Af: Dynamic;
var activeCanvasDialog: Dynamic;
var nextCanvasDialogId: Dynamic;
var canvasDialogSubscribers: Dynamic;
function publishCanvasDialog(): Dynamic {
  for (let subscriber of canvasDialogSubscribers as Dynamic)
    subscriber(activeCanvasDialog);
}
function rejectCanvasDialog(dialog?: Dynamic): Dynamic {
  dialog.kind === "confirm" ? dialog.resolve(false) : dialog.resolve(null);
}
function openCanvasDialog(dialog?: Dynamic): Dynamic {
  let previousDialog: Dynamic = activeCanvasDialog;
  activeCanvasDialog = dialog;
  previousDialog && rejectCanvasDialog(previousDialog);
  if (canvasDialogSubscribers.size === 0) {
    activeCanvasDialog = null;
    rejectCanvasDialog(dialog);
    return;
  }
  publishCanvasDialog();
}
function confirmCanvasAction(confirmOptions?: Dynamic): Dynamic {
  return new Promise((resolvePromise?: Dynamic): Dynamic => {
    openCanvasDialog({
      id: nextCanvasDialogId++,
      kind: "confirm",
      opts: confirmOptions,
      resolve: resolvePromise,
    });
  });
}
function promptCanvasValue(promptOptions?: Dynamic): Dynamic {
  return new Promise((resolvePromise?: Dynamic): Dynamic => {
    openCanvasDialog({
      id: nextCanvasDialogId++,
      kind: "prompt",
      opts: promptOptions,
      resolve: resolvePromise,
    });
  });
}
function dismissCanvasDialog(): Dynamic {
  let dialog: Dynamic = activeCanvasDialog;
  dialog &&
    ((activeCanvasDialog = null),
    rejectCanvasDialog(dialog),
    publishCanvasDialog());
}
function resolveCanvasDialog(dialog?: Dynamic, result?: Dynamic): Dynamic {
  activeCanvasDialog === dialog &&
    ((activeCanvasDialog = null),
    dialog.kind === "confirm"
      ? dialog.resolve(result === true)
      : dialog.resolve(typeof result == "string" ? result : null),
    publishCanvasDialog());
}
function dismissMatchingCanvasDialog(dialog?: Dynamic): Dynamic {
  activeCanvasDialog === dialog && dismissCanvasDialog();
}
function CanvasPromptDialogShell({
  title: title,
  onDismiss: onDismiss,
  footer: footer,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <DialogDialogRootTriggerPopupConfig.Root
      open={true}
      onOpenChange={(isOpen?: Dynamic): Dynamic => {
        isOpen || onDismiss();
      }}
    >
      <DialogDialogRootTriggerPopupConfig.Popup size={"sm"}>
        <DialogDialogRootTriggerPopupConfig.Header showClose={true}>
          {title}
        </DialogDialogRootTriggerPopupConfig.Header>
        <div className={"mt-3 text-sm"}>{children}</div>
        <DialogDialogRootTriggerPopupConfig.Footer align={"end"}>
          {footer}
        </DialogDialogRootTriggerPopupConfig.Footer>
      </DialogDialogRootTriggerPopupConfig.Popup>
    </DialogDialogRootTriggerPopupConfig.Root>
  );
}
function CanvasConfirmationDialog({ p: dialog }: Dynamic): Dynamic {
  useUiLocale();
  let { opts: dialogOptions }: Dynamic = dialog,
    dismiss: Dynamic = (): Dynamic => dismissMatchingCanvasDialog(dialog);
  return (
    <ConfirmationDialog
      open={true}
      initialFocus={"cancel"}
      onOpenChange={(isOpen?: Dynamic): Dynamic => {
        isOpen || dismiss();
      }}
      title={dialogOptions.title}
      description={dialogOptions.message}
      confirmLabel={dialogOptions.confirmLabel ?? (dialogOptions.danger ? (uiMessage("canvas.dialogs.delete")) : (uiMessage("canvas.dialogs.oK")))}
      cancelLabel={dialogOptions.cancelLabel ?? "Cancel"}
      confirmVariant={dialogOptions.danger ? "danger" : "primary"}
      size={"sm"}
      onConfirm={(): Dynamic => resolveCanvasDialog(dialog, true)}
    />
  );
}
function CanvasValuePromptDialog({ p: dialog }: Dynamic): Dynamic {
  useUiLocale();
  let { opts: dialogOptions }: Dynamic = dialog,
    [text, setText]: Dynamic = (0, react_M6.useState)(
      dialogOptions.initialValue ?? "",
    ),
    trimmedText: Dynamic = text.trim(),
    isEmpty: Dynamic = trimmedText.length === 0,
    confirm: Dynamic = (): Dynamic => {
      isEmpty || resolveCanvasDialog(dialog, trimmedText);
    },
    dismiss: Dynamic = (): Dynamic => dismissMatchingCanvasDialog(dialog);
  return (
    <CanvasPromptDialogShell
      title={dialogOptions.title}
      onDismiss={dismiss}
      footer={
        <jsx_Af.Fragment>
          <Button onClick={dismiss}>
            {dialogOptions.cancelLabel ?? (uiMessage("canvas.dialogs.cancel"))}
          </Button>
          <DisabledReasonTooltip
            wrapperClassName={"grid"}
            reason={isEmpty ? "Type something first" : undefined}
          >
            <Button
              variant={"primary"}
              disabled={isEmpty}
              data-testid={"mc-alert-confirm"}
              onClick={confirm}
            >
              {dialogOptions.confirmLabel ?? (uiMessage("canvas.dialogs.oK"))}
            </Button>
          </DisabledReasonTooltip>
        </jsx_Af.Fragment>
      }
    >
      {dialogOptions.message ? (<p className={"text-fg-secondary"}>{dialogOptions.message}</p>) : (null)}
      <TextInput
        className={dialogOptions.message ? "mt-2" : undefined}
        data-testid={"mc-alert-input"}
        aria-label={dialogOptions.inputLabel ?? (dialogOptions.title)}
        autoFocus={true}
        value={text}
        placeholder={dialogOptions.placeholder}
        maxLength={dialogOptions.maxLength}
        onChange={(changeEvent?: Dynamic): Dynamic =>
          setText(changeEvent.currentTarget.value)
        }
        onFocus={(focusEvent?: Dynamic): Dynamic => focusEvent.currentTarget.select()}
        onKeyDown={(event?: Dynamic): Dynamic => {
          event.key === "Enter" &&
            (event.nativeEvent.isComposing ||
              event.keyCode === 229 ||
              (event.preventDefault(), !event.repeat && confirm()));
        }}
      />
    </CanvasPromptDialogShell>
  );
}
function CanvasDialogHost(): Dynamic {
  useUiLocale();
  let [currentDialog, setCurrentDialog]: Dynamic = (0, react_M6.useState)(activeCanvasDialog);
  usePanelClose(
    currentDialog,
    (): Dynamic => activeCanvasDialog !== null,
  );
  (0, react_M6.useEffect)(
    (): Dynamic => (
      canvasDialogSubscribers.add(setCurrentDialog),
      (): Dynamic => {
        canvasDialogSubscribers.delete(setCurrentDialog);
        canvasDialogSubscribers.size === 0 && dismissCanvasDialog();
      }
    ),
    [],
  );
  return currentDialog
    ? currentDialog.kind === "confirm"
      ? (() => {
          const ConfirmComponent = CanvasConfirmationDialog;
          const confirmProps = {
            p: currentDialog,
          } as const;
          const confirmKey = currentDialog.id;
          return <ConfirmComponent key={confirmKey} {...confirmProps} />;
        })()
      : (() => {
          const PromptComponent = CanvasValuePromptDialog;
          const promptProps = {
            p: currentDialog,
          } as const;
          const promptKey = currentDialog.id;
          return <PromptComponent key={promptKey} {...promptProps} />;
        })()
    : null;
}
export {
  activeCanvasDialog,
  CanvasConfirmationDialog,
  CanvasDialogHost,
  canvasDialogSubscribers,
  CanvasPromptDialogShell,
  CanvasValuePromptDialog,
  confirmCanvasAction,
  dismissCanvasDialog,
  dismissMatchingCanvasDialog,
  jsx_Af,
  nextCanvasDialogId,
  openCanvasDialog,
  promptCanvasValue,
  publishCanvasDialog,
  react_M6,
  rejectCanvasDialog,
  resolveCanvasDialog,
};
export function installCanvasDialogs(): () => void {
  return () => {
    react_M6 = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    jsx_Af = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    activeCanvasDialog = null;
    nextCanvasDialogId = 1;
    canvasDialogSubscribers = new Set();
  };
}

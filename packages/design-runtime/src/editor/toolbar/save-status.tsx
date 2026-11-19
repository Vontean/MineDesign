import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasMeasurements } from "../../canvas/measurements";
import { Icon } from "../../cds/components/icon";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { hostDrawsReadOnly, hostDrawsSave, hostHandlesRetry, subscribeHostChrome } from "../../platform/frame-host-bridge";

function ToolbarSaveStatus({ state: state }: Dynamic): Dynamic {
  useUiLocale();
  if (state.status === "error" || state.status === "readonly")
    return <ToolbarSaveFailure state={state} />;
  let value: Dynamic = state.status === "saving",
    hasUnsavedChanges: Dynamic = state.status === "dirty";
  return (
    <span
      role={"status"}
      title={
        value ? (uiMessage("inspector.saveStatus.saving")) : (hasUnsavedChanges ? (uiMessage("inspector.saveStatus.editsAreHeldInThe")) : (uiMessage("inspector.saveStatus.everyChangeSavesAutomatically")))
      }
      className={
        "inline-flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap text-fg-muted"
      }
    >
      <span
        className={
          "h-1.5 w-1.5 shrink-0 rounded-full " +
          (value || hasUnsavedChanges ? "bg-fill-warning" : "bg-fill-success")
        }
      />
      <span className={"tb-status-text truncate"}>
        {value ? (uiMessage("inspector.saveStatus.saving")) : (hasUnsavedChanges ? (uiMessage("inspector.saveStatus.unsavedEdits")) : (uiMessage("inspector.saveStatus.savedAutomatically")))}
      </span>
    </span>
  );
}
function ToolbarSyncStatus({
  state: state,
  onRetry: onRetry,
  tipSide = "bottom",
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0,
    reactCanvasMeasurements.useSyncExternalStore)(
      subscribeHostChrome,
      hostDrawsSave,
      (): Dynamic => false,
    ),
    hostRetryAvailable: Dynamic = (0,
    reactCanvasMeasurements.useSyncExternalStore)(
      subscribeHostChrome,
      hostHandlesRetry,
      (): Dynamic => false,
    ),
    [isFocused, setFocused]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    [isHovered, setHovered]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    [isRetrying, setRetrying]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    status: Dynamic = state.status,
    isTransient: Dynamic =
      status === "saving" || status === "dirty" || status === "loading";
  isRetrying && !isTransient && status !== "error" && setRetrying(false);
  let isBusy: Dynamic = isFocused || isHovered || (isRetrying && isTransient);
  if (value && (status !== "error" || hostRetryAvailable) && !isBusy) return null;
  let syncState: Dynamic =
      status === "loading" || status === "cached"
        ? "loading"
        : status === "error"
          ? "error"
          : status === "dirty" || status === "saving"
            ? "pending"
            : "synced",
    isQuiet: Dynamic = syncState === "synced" && !isBusy,
    statusMessage: Dynamic =
      state.message ??
      (syncState === "pending"
        ? "Syncing\u2026"
        : syncState === "error"
          ? uiMessage("inspector.saveStatus.couldnTSyncClickTo")
          : uiMessage("inspector.saveStatus.allChangesSynced")),
    canRetry: Dynamic = status === "error" || status === "dirty";
  return (
    <Tooltip
      content={statusMessage}
      side={tipSide}
      align={"end"}
      multiline={true}
      hoverable={false}
      closeOnClick={false}
    >
      <button
        type={"button"}
        aria-disabled={canRetry ? undefined : true}
        onClick={(): Dynamic => {
          canRetry && (status === "error" && setRetrying(true), onRetry());
        }}
        onFocus={(): Dynamic => setFocused(true)}
        onBlur={(): Dynamic => setFocused(false)}
        onPointerEnter={(): Dynamic => setHovered(true)}
        onPointerLeave={(): Dynamic => setHovered(false)}
        aria-label={statusMessage}
        data-sync={syncState}
        data-quiet={isQuiet ? "" : undefined}
        data-testid={"sync-dot"}
        className={"tb-sync-dot"}
      >
        <span aria-hidden={"true"} className={"tb-sync-dot-mark"} />
      </button>
    </Tooltip>
  );
}
function ToolbarSaveFailure({ state: state }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0,
  reactCanvasMeasurements.useSyncExternalStore)(
    subscribeHostChrome,
    hostDrawsReadOnly,
    (): Dynamic => false,
  );
  if (state.status === "error") {
    let errorMessage: Dynamic = state.message ?? uiMessage("inspector.saveStatus.couldnTSave");
    return (
      <span
        role={"status"}
        title={errorMessage}
        className={
          "inline-flex max-w-80 shrink-0 items-center gap-1.5 truncate rounded-full bg-bad/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-bad"
        }
      >
        <span
          className={"h-1.5 w-1.5 shrink-0 rounded-full bg-fill-danger"}
        />
        <span className={"tb-status-text truncate"}>{errorMessage}</span>
      </span>
    );
  }
  return state.status === "readonly" ? (
    value ? null : (
      <span
        role={"status"}
        title={state.message ?? (uiMessage("inspector.saveStatus.readOnly"))}
        className={
          "tb-lock inline-flex shrink-0 items-center gap-1.5 px-1 text-body whitespace-nowrap text-fg-muted"
        }
      >
        <Icon name={"Lock"} size={"auto"} className={"shrink-0"} />
        <span className={"tb-lock-words truncate"}>{uiMessage("inspector.saveStatus.readOnly")}</span>
      </span>
    )
  ) : null;
}
export {
  ToolbarSaveFailure,
  ToolbarSaveStatus,
  ToolbarSyncStatus,
};
export function installEditorToolbarSaveStatus(): () => void {
  return () => {};
}

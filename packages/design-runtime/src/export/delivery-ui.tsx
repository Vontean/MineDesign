import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { Button } from "../cds/button/button";
import { Icon } from "../cds/components/icon";
import { DialogDialogRootTriggerPopupConfig } from "../cds/dialog/dialog";
import { initializeCdsIndex } from "../cds/index";
import { DisabledReasonTooltip } from "../cds/tooltip/tooltip";
import { initializeNpm_usehooks_ts_p0, load_react, load_react_jsx_runtime, npm_useEventListener_bc } from "../dependencies";
import { useToast } from "../editor/chrome/toast";
import { exportDeliveryEventName } from "./delivery";
import { hasDownloadCapability, normalizeDownloadName, saveThroughHost } from "./downloads";
import { toModuleNamespace } from "../module-helpers";
import { CdsIsland, initializePlatformCdsIsland } from "../platform/cds-island";

var reactExportDeliveryUi: Dynamic;
var jsxExportDeliveryUi: Dynamic;
var ChromeOrEdgeMayNotWorkMessage: Dynamic;
var ExportDeliveryUiResolvedValue: Dynamic;
var DRAG_DOWNLOAD_PROMPT: Dynamic;
var ExportDeliveryUiRejectedExtensionExtensionNotEnabledTooLargeSet: Dynamic;
function decodeExportDeliveryBlob(dataUrl?: Dynamic): Dynamic {
  let value: Dynamic = dataUrl.indexOf(","),
    header: Dynamic = dataUrl.slice(0, value),
    mimeType: Dynamic = header.slice(
      5,
      header.indexOf(";") >= 0 ? header.indexOf(";") : header.length,
    ),
    binaryData: Dynamic = atob(dataUrl.slice(value + 1)),
    bytes: Dynamic = new Uint8Array(binaryData.length);
  for (let index: Dynamic = 0; index < binaryData.length; index++)
    bytes[index] = binaryData.charCodeAt(index);
  return new Blob([bytes], {
    type: mimeType,
  });
}
function exportDeliveryFailureMessage(
  reason?: Dynamic,
  fileName?: Dynamic,
  byteSize?: Dynamic,
): Dynamic {
  let value: Dynamic = fileName.lastIndexOf("."),
    fileTypeLabel: Dynamic =
      value === -1 ? "this kind of file" : fileName.slice(value) + " files";
  switch (reason) {
    case "rejected_extension":
      return (
        "This host can\u2019t save " +
        fileTypeLabel +
        ". " +
        ExportDeliveryUiResolvedValue
      );
    case "extension_not_enabled":
      return (
        "This host can\u2019t save " +
        fileTypeLabel +
        " yet. " +
        ExportDeliveryUiResolvedValue
      );
    case "too_large":
      return (
        "This host wouldn\u2019t save " +
        fileName +
        " at " +
        (Math.ceil((byteSize / (1024 * 1024)) * 10) / 10).toFixed(1) +
        " MB. " +
        ExportDeliveryUiResolvedValue
      );
    case "rate_limited":
      return (
        "The save didn\u2019t go through (another prompt may be open). Try Download again, or drag the file out of this window instead (" +
        ChromeOrEdgeMayNotWorkMessage +
        ")."
      );
    default:
      return (
        "The save didn\u2019t go through. " + ExportDeliveryUiResolvedValue
      );
  }
}
function useExportDeliveries(): Dynamic {
  let [value, deliveries]: Dynamic = (0, reactExportDeliveryUi.useState)([]),
    [isOpen, setIsOpen]: Dynamic = (0, reactExportDeliveryUi.useState)(false);
  npm_useEventListener_bc(
    exportDeliveryEventName,
    (event?: Dynamic): Dynamic => {
      let detail: Dynamic = event.detail;
      deliveries(
        (previousDeliveries?: Dynamic): Dynamic => [
          ...(isOpen
            ? previousDeliveries.filter(
                (delivery?: Dynamic): Dynamic =>
                  delivery.filename !== detail.filename,
              )
            : []),
          detail,
        ],
      );
      setIsOpen(true);
    },
  );
  return (
    <CdsIsland density={"compact"} className={"contents"}>
      <DialogDialogRootTriggerPopupConfig.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        onOpenChangeComplete={(open?: Dynamic): Dynamic => {
          open || deliveries([]);
        }}
      >
        <DialogDialogRootTriggerPopupConfig.Popup
          data-testid={"export-delivery-dialog"}
        >
          <DialogDialogRootTriggerPopupConfig.Header>
            {value.length === 1 ? (uiMessage("canvas.deliveryUi.exportReady")) : (uiMessage("canvas.deliveryUi.exportsReady", { value1: String(String(value.length)) }))}
          </DialogDialogRootTriggerPopupConfig.Header>
          <div className={"flex max-h-[60vh] flex-col gap-2 overflow-auto"}>
            {value.map(
              (delivery?: Dynamic): Dynamic =>
                (() => {
                  const _Component = ExportDeliveryNotice;
                  const _props = {
                    delivery: delivery,
                  } as const;
                  const _key = delivery.filename;
                  return <_Component key={_key} {..._props} />;
                })(),
            )}
          </div>
        </DialogDialogRootTriggerPopupConfig.Popup>
      </DialogDialogRootTriggerPopupConfig.Root>
    </CdsIsland>
  );
}
function ExportDeliveryNotice({ delivery: delivery }: Dynamic): Dynamic {
  useUiLocale();
  let { showToast: value }: Dynamic = useToast(),
    isDataUrl: Dynamic = delivery.file == null,
    blob: Dynamic = (0, reactExportDeliveryUi.useMemo)((): Dynamic => {
      if (delivery.file) return delivery.file.blob;
      try {
        return decodeExportDeliveryBlob(delivery.url);
      } catch {
        return new Blob([], {
          type: "application/octet-stream",
        });
      }
    }, [delivery]),
    mimeType: Dynamic = delivery.file?.mime ?? delivery.mime ?? blob.type,
    downloadUrl: Dynamic = (0, reactExportDeliveryUi.useMemo)(
      (): Dynamic =>
        URL.createObjectURL(
          new Blob([blob], {
            type: "application/octet-stream",
          }),
        ),
      [blob],
    );
  (0, reactExportDeliveryUi.useEffect)(
    (): Dynamic => (): Dynamic => URL.revokeObjectURL(downloadUrl),
    [downloadUrl],
  );
  let sizeKb: Dynamic = Math.max(1, Math.round(blob.size / 1024)),
    [isBusy, setIsBusy]: Dynamic = (0, reactExportDeliveryUi.useState)(false),
    [refusal, setRefusal]: Dynamic = (0, reactExportDeliveryUi.useState)(
      undefined,
    ),
    canSaveThroughHost: Dynamic = hasDownloadCapability(),
    downloadName: Dynamic =
      delivery.filename
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
        .replace(/\s+/g, " ")
        .trim() || "export",
    callback: Dynamic = (dragEvent?: Dynamic): Dynamic => {
      dragEvent.dataTransfer.effectAllowed = "copy";
      dragEvent.dataTransfer.setData(
        "DownloadURL",
        mimeType + ":" + downloadName + ":" + downloadUrl,
      );
    },
    deliveryReason: Dynamic = refusal ?? delivery.refusal,
    disabledReason: Dynamic =
      !canSaveThroughHost || deliveryReason === "rate_limited"
        ? undefined
        : normalizeDownloadName(downloadName)
          ? deliveryReason !== undefined &&
            ExportDeliveryUiRejectedExtensionExtensionNotEnabledTooLargeSet.has(
              deliveryReason,
            )
            ? exportDeliveryFailureMessage(deliveryReason, downloadName, blob.size)
            : undefined
          : exportDeliveryFailureMessage(
              "rejected_extension",
              downloadName,
              blob.size,
            ),
    handleDownload: Dynamic = (): Dynamic => {
      (async (): Promise<Dynamic> => {
        setIsBusy(true);
        try {
          let { outcome: outcome, code: saveCode }: Dynamic = await saveThroughHost(blob, downloadName);
          if (outcome === "saved") {
            value("Saved " + downloadName + ".", "success");
            return;
          }
          if (outcome === "declined" || outcome === "withheld") return;
          if (canSaveThroughHost && saveCode !== "no_shell_save") {
            ExportDeliveryUiRejectedExtensionExtensionNotEnabledTooLargeSet.has(
              saveCode,
            ) && setRefusal(saveCode);
            value(
              exportDeliveryFailureMessage(saveCode, downloadName, blob.size),
            );
            return;
          }
          let downloadAnchor: Dynamic = (document as Dynamic).createElement("a");
          downloadAnchor.href = downloadUrl;
          downloadAnchor.download = downloadName;
          downloadAnchor.rel = "noopener";
          downloadAnchor.style.display = "none";
          (document as Dynamic).body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          value("If no download started: " + ExportDeliveryUiResolvedValue);
        } finally {
          setIsBusy(false);
        }
      })();
    };
  return (
    <div className={"flex flex-col gap-1.5"}>
      <div
        data-testid={"export-delivery-card"}
        className={
          "flex items-center gap-2.5 rounded-lg border bg-surface-1 px-2.5 py-2 shadow-sm"
        }
      >
        <div
          draggable={true}
          onDragStart={callback}
          title={DRAG_DOWNLOAD_PROMPT}
          className={
            "flex min-w-0 flex-1 cursor-grab items-center gap-2.5 select-none active:cursor-grabbing"
          }
        >
          {isDataUrl ? (<img
              src={delivery.url}
              alt={""}
              draggable={true}
              onDragStart={callback}
              className={
                "h-9 w-12 shrink-0 rounded border bg-white object-contain"
              }
            />) : (<span
              className={
                "flex h-9 w-9 shrink-0 items-center justify-center rounded border bg-surface-2 text-muted"
              }
            >
              <Icon name={"File"} size={"sm"} />
            </span>)}
          <div className={"min-w-0 flex-1"}>
            <div className={"truncate text-body font-medium text-primary"}>
              {delivery.filename}
            </div>
            <div className={"text-caption text-muted"}>
              {sizeKb}
              {" KB"}
            </div>
          </div>
        </div>
        <DisabledReasonTooltip reason={disabledReason}>
          <Button
            variant={"primary"}
            busy={isBusy}
            busyLabel={"Downloading\u2026"}
            disabled={disabledReason !== undefined}
            onClick={handleDownload}
            data-testid={"export-delivery-download"}
          >
            {uiMessage("canvas.deliveryUi.download")}
          </Button>
        </DisabledReasonTooltip>
        <span
          draggable={true}
          onDragStart={callback}
          title={DRAG_DOWNLOAD_PROMPT}
          className={
            "inline-flex h-control pointer-coarse:min-h-10 shrink-0 cursor-grab items-center rounded border border-strong px-2 text-footnote font-medium text-primary select-none hover:bg-fill-ghost-hover active:cursor-grabbing"
          }
        >
          {uiMessage("canvas.deliveryUi.dragOut")}
        </span>
      </div>
      {delivery.embedWarningCount > 0 && (<div className={"px-1 text-footnote text-danger"}>
          {delivery.embedWarningCount === 1 ? (uiMessage("canvas.deliveryUi.oneImageCouldNotBe")) : (`${delivery.embedWarningCount} images could not be embedded and render blank in the export.`)}
        </div>)}
    </div>
  );
}
export {
  ChromeOrEdgeMayNotWorkMessage,
  decodeExportDeliveryBlob,
  exportDeliveryFailureMessage,
  ExportDeliveryNotice,
  ExportDeliveryUiRejectedExtensionExtensionNotEnabledTooLargeSet,
  ExportDeliveryUiResolvedValue,
  DRAG_DOWNLOAD_PROMPT as ExportDeliveryUiResolvedValue_2,
  jsxExportDeliveryUi,
  reactExportDeliveryUi,
  useExportDeliveries,
};
export function installExportDeliveryUi(): () => void {
  return () => {
    reactExportDeliveryUi = toModuleNamespace(
      load_react(),
      1,
    );
    initializeNpm_usehooks_ts_p0();
    initializeCdsIndex();
    initializePlatformCdsIsland();
    jsxExportDeliveryUi = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeOrEdgeMayNotWorkMessage =
      "Chrome or Edge; may not work in the desktop app";
    ExportDeliveryUiResolvedValue =
      "Drag the file out of this window onto your desktop or a folder instead (" +
      ChromeOrEdgeMayNotWorkMessage +
      ").";
    DRAG_DOWNLOAD_PROMPT =
      "Drag this out of the window onto your desktop or a folder (" +
      ChromeOrEdgeMayNotWorkMessage +
      ").";
    ExportDeliveryUiRejectedExtensionExtensionNotEnabledTooLargeSet = new Set([
      "rejected_extension",
      "extension_not_enabled",
      "too_large",
      "not_granted",
      "capability_disabled",
      "capability_removed",
    ]);
  };
}

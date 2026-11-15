/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var exportDeliveryEventName: Dynamic;
var ExportDeliveryCapMsFinishAnimationsEagerImagesConfig: Dynamic;
var ExportDeliveryCapMsFinishAnimationsConfig: Dynamic;
function triggerBrowserDownload(input?: Dynamic, options?: Dynamic): Dynamic {
  try {
    let value: Dynamic = (document as Dynamic).createElement("a");
    value.href = input;
    value.download = options;
    value.rel = "noopener";
    value.style.display = "none";
    (document as Dynamic).body.appendChild(value);
    value.click();
    value.remove();
  } catch {}
}
export {
  ExportDeliveryCapMsFinishAnimationsConfig,
  ExportDeliveryCapMsFinishAnimationsEagerImagesConfig,
  exportDeliveryEventName,
  triggerBrowserDownload,
};
export function installExportDelivery(): () => void {
  return () => {
    exportDeliveryEventName = "appifact:export-delivery";
    ExportDeliveryCapMsFinishAnimationsEagerImagesConfig = {
      capMs: 1500,
      finishAnimations: true,
      eagerImages: true,
    };
    ExportDeliveryCapMsFinishAnimationsConfig = {
      capMs: 1500,
      finishAnimations: true,
    };
  };
}

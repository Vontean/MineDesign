import type { Dynamic } from "../runtime-types";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

export let hostSaveActionId: Dynamic;
export let hostFindActionId: Dynamic;
export let exportFormatPattern: Dynamic;
export let normalizeExportWindowMs: Dynamic;
export let maxExportFormats: Dynamic;
export let exportVariantIdPattern: Dynamic;
export let maxExportVariants: Dynamic;
export let exportRequestIdPattern: Dynamic;
export let exportDestinationIdPattern: Dynamic;
export let maxExportDestinations: Dynamic;
export let maxFooterInset: Dynamic;
export let footerGroundColorPattern: Dynamic;
export let hostReact: Dynamic;

/** 宿主操作与导出注册共用的消息验证规则。 */
export function installFrameHostValidation(): () => void {
  return () => {
    hostReact = toModuleNamespace(
      load_react(),
      1,
    );
    hostSaveActionId = "save_now";
    hostFindActionId = "open_find";
    exportFormatPattern = /^[a-z0-9]{1,8}$/;
    normalizeExportWindowMs = (durationMs?: Dynamic): Dynamic =>
      typeof durationMs == "number" &&
      Number.isSafeInteger(durationMs) &&
      durationMs > 5e3 &&
      durationMs <= 15 * 6e4
        ? durationMs
        : undefined;
    maxExportFormats = 8;
    exportVariantIdPattern = /^[a-z][a-z0-9_-]{0,31}$/;
    maxExportVariants = 8;
    exportRequestIdPattern = /^[A-Za-z0-9_-]{16,64}$/;
    exportDestinationIdPattern = /^[a-z][a-z0-9_-]{0,31}$/;
    maxExportDestinations = 8;
    maxFooterInset = 9999;
    footerGroundColorPattern = /^#[0-9a-f]{6}$/;
  };
}

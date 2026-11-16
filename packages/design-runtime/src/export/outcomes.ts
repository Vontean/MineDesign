/** 导出的种类。 */
export type ExportKind = "image" | "pdf" | "zip" | "html";
/** 下载与交付的结果。 */
export interface DeliveryResult {
  outcome: string;
  code?: string;
}
/** 上报用的三元组：操作名、结果，失败时再加原因。 */
export type ExportReport = readonly [operation: string, outcome: string, reason?: string];

/** 渲染失败的上报；用于未分类的渲染错误。 */
export const renderFailureReport = ["render", "failure", "internal"] as const;
/** 打开作品被中止的上报。 */
export const openAbortedReport = ["open", "aborted"] as const;

/** 各导出种类在上报里的操作名。 */
export const exportOperationNames: Record<ExportKind, string> = {
  image: "download",
  pdf: "export",
  zip: "download",
  html: "export",
};
/** 下载结果在上报里的结果名；refused 需要再按错误码判断。 */
export const downloadOutcomeNames: Record<string, string | undefined> = {
  saved: "success",
  declined: "aborted",
  withheld: "aborted",
  unsupported: "refused",
};
/** 宿主不支持时，这些错误码算用户或宿主主动中止，不算能力错误。 */
export const benignUnsupportedCodes: ReadonlySet<string> = new Set(["too_large", "rate_limited"]);
/** HTML 交付失败时，这些原因算中止而不是失败。 */
export const htmlAbortedFailureReasons: ReadonlySet<string> = new Set([
  "too_large",
  "not_loaded",
  "empty",
  "timeout",
]);

/** 图片保存结果的上报；null 表示保存成功。 */
export function classifyImageSaveOutcome(result: DeliveryResult | null): ExportReport {
  const image = exportOperationNames.image;
  if (result === null) return [image, "success"];
  const outcome = downloadOutcomeNames[result.outcome];
  return outcome !== "refused"
    ? [image, outcome as string]
    : benignUnsupportedCodes.has(result.code as string)
      ? [image, "aborted"]
      : [image, "failure", "capability_error"];
}

export function classifyExportSaveOutcome(kind: ExportKind, saveOutcome: string): ExportReport {
  const outcome = downloadOutcomeNames[saveOutcome];
  return [exportOperationNames[kind], outcome === "refused" ? "success" : (outcome as string)];
}

export function classifyExportFailure(kind: ExportKind): ExportReport {
  return [exportOperationNames[kind], "failure", kind === "zip" || kind === "html" ? "internal" : "render"];
}

export function classifyExportAbort(kind: ExportKind): ExportReport {
  return [exportOperationNames[kind], "aborted"];
}

/** 交付结果的上报；failed 时 aborted 为真则算中止。结果不属于已知类型时返回 undefined。 */
export function classifyExportDeliveryOutcome(
  kind: ExportKind,
  delivery: DeliveryResult,
  aborted?: boolean,
): ExportReport | undefined {
  const operation = exportOperationNames[kind];
  switch (delivery.outcome) {
    case "delivered":
      return [operation, "success"];
    case "declined":
    case "withheld":
      return [operation, "aborted"];
    case "failed":
      return aborted ? [operation, "aborted"] : classifyExportFailure(kind);
    case "unsupported":
      return benignUnsupportedCodes.has(delivery.code as string) || delivery.code === "request_unknown"
        ? [operation, "aborted"]
        : [operation, "failure", "capability_error"];
  }
}

export function classifyHtmlDelivery(delivery: DeliveryResult, reason?: string): ExportReport | undefined {
  return classifyExportDeliveryOutcome(
    "html",
    delivery,
    reason !== undefined && htmlAbortedFailureReasons.has(reason),
  );
}

export function classifyPdfDelivery(delivery: DeliveryResult, aborted?: boolean): ExportReport | undefined {
  return classifyExportDeliveryOutcome("pdf", delivery, aborted);
}

export function classifyImageDelivery(delivery: DeliveryResult, aborted?: boolean): ExportReport | undefined {
  return classifyExportDeliveryOutcome("image", delivery, aborted);
}

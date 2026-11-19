/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { frameAnalyticsReporter } from "../platform/health-and-analytics";

var exportAnalyticsEvents: Dynamic;
var exportDeliveryAnalyticsEvents: Dynamic;
function sendStaggeredAnalytics(
  analyticsEvents?: Dynamic,
  reportEvent?: Dynamic,
  scheduler: Dynamic = globalThis,
): Dynamic {
  analyticsEvents.forEach(
    (eventName?: Dynamic, eventIndex?: Dynamic): Dynamic =>
      scheduler.setTimeout((): Dynamic => {
        try {
          reportEvent(eventName);
        } catch {}
      }, eventIndex * 300),
  );
}
function describeExportScope(
  pageNumber?: Dynamic,
  scope?: Dynamic,
  pageSummary?: Dynamic,
): Dynamic {
  return {
    partial: scope === "whole" && pageNumber < pageSummary.printable,
    singleOfMany: scope === "one" && pageSummary.printable > 1,
    otherPages: pageSummary.otherPages > 0,
  };
}
function exportBuildAnalyticsEvents(exportSummary?: Dynamic): Dynamic {
  let value: Dynamic =
    exportSummary.picked === true
      ? [exportAnalyticsEvents.built, exportAnalyticsEvents.pickBuilt]
      : [exportAnalyticsEvents.built];
  exportSummary.partial === true && value.push(exportAnalyticsEvents.partial);
  exportSummary.singleOfMany === true &&
    value.push(exportAnalyticsEvents.singleOfMany);
  exportSummary.otherPages === true && value.push(exportAnalyticsEvents.otherPages);
  (exportSummary.blankImages ?? 0) > 0 &&
    value.push(exportAnalyticsEvents.blankImages);
  exportSummary.clipped === true && value.push(exportAnalyticsEvents.clipped);
  exportSummary.flowOverflow === true &&
    value.push(exportAnalyticsEvents.flowOverflow);
  (exportSummary.hiddenSkipped ?? 0) > 0 &&
    value.push(exportAnalyticsEvents.hiddenSkipped);
  (exportSummary.fontFallback ?? 0) > 0 &&
    value.push(exportAnalyticsEvents.fontFallback);
  exportSummary.scaledDown === true && value.push(exportAnalyticsEvents.scaledDown);
  (exportSummary.innerClipped ?? 0) > 0 &&
    value.push(exportAnalyticsEvents.innerClipped);
  (exportSummary.scrollRegion ?? 0) > 0 &&
    value.push(exportAnalyticsEvents.scrollRegion);
  (exportSummary.collapsed ?? 0) > 0 && value.push(exportAnalyticsEvents.collapsed);
  (exportSummary.unrevealed ?? 0) > 0 && value.push(exportAnalyticsEvents.unrevealed);
  return value;
}
function reportExportBuilt(
  exportSummary?: Dynamic,
  reporter: Dynamic = frameAnalyticsReporter,
  scheduler: Dynamic = globalThis,
): Dynamic {
  try {
    sendStaggeredAnalytics(
      exportBuildAnalyticsEvents(exportSummary),
      reporter,
      scheduler,
    );
  } catch {}
}
function reportExportEvent(
  eventName?: Dynamic,
  reporter: Dynamic = frameAnalyticsReporter,
): Dynamic {
  try {
    reporter(exportAnalyticsEvents[eventName]);
  } catch {}
}
function reportExportDeliveryEvent(
  eventName?: Dynamic,
  reporter: Dynamic = frameAnalyticsReporter,
): Dynamic {
  try {
    reporter(exportDeliveryAnalyticsEvents[eventName]);
  } catch {}
}
export {
  describeExportScope,
  exportAnalyticsEvents,
  exportBuildAnalyticsEvents,
  exportDeliveryAnalyticsEvents,
  reportExportBuilt,
  reportExportDeliveryEvent,
  reportExportEvent,
  sendStaggeredAnalytics,
};
export function installExportAnalytics(): () => void {
  return () => {
    exportAnalyticsEvents = {
      built: "frame_design_export_built",
      htmlBuilt: "frame_design_export_html_built",
      failed: "frame_design_export_failed",
      tooLarge: "frame_design_export_too_large",
      timedOut: "frame_design_export_timed_out",
      refused: "frame_design_export_refused",
      pickBuilt: "frame_design_export_pick_built",
      blankImages: "frame_design_export_blank_images",
      clipped: "frame_design_export_clipped",
      flowOverflow: "frame_design_export_flow_overflow",
      hiddenSkipped: "frame_design_export_hidden_skipped",
      fontFallback: "frame_design_export_font_fallback",
      scaledDown: "frame_design_export_scaled_down",
      partial: "frame_design_export_partial",
      singleOfMany: "frame_design_export_single_of_many",
      otherPages: "frame_design_export_other_pages",
      innerClipped: "frame_design_export_inner_clipped",
      scrollRegion: "frame_design_export_scroll_region",
      collapsed: "frame_design_export_collapsed",
      unrevealed: "frame_design_export_unrevealed",
    };
    exportDeliveryAnalyticsEvents = {
      opened: "frame_design_export_pick_opened",
      chosen: "frame_design_export_pick_chosen",
      cancelled: "frame_design_export_pick_cancelled",
      left: "frame_design_export_pick_left",
      lapsed: "frame_design_export_pick_lapsed",
      dropped: "frame_design_export_pick_dropped",
    };
  };
}

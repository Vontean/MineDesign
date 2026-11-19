/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var ChatColumnOverlayActionsSlotValue: Dynamic;
var AppifactHealthValue: Dynamic;
var healthReporter: Dynamic;
var disabledFrameAnalyticsTransport: Dynamic;
var frameAnalyticsReporter: Dynamic;
var reportExportOutcome: Dynamic;
var designAnalyticsEvents: Dynamic;
function getHealthReporter(): Dynamic {
  let globalReporter: Dynamic = (globalThis as Dynamic)[AppifactHealthValue];
  if (typeof globalReporter != "object" || globalReporter === null) return;
  let reporter: Dynamic = globalReporter;
  return typeof reporter.report == "function" &&
    typeof reporter.track == "function"
    ? globalReporter
    : undefined;
}
function createFrameAnalyticsReporter(transport?: Dynamic): Dynamic {
  let reportedEvents: Dynamic = new Set(),
    nextEventId: Dynamic = 0;
  return (eventName?: Dynamic): Dynamic => {
    if (!reportedEvents.has(eventName)) {
      reportedEvents.add(eventName);
      try {
        if (!transport.framed()) return;
        transport.post({
          __frame_cap: true,
          cap: "analytics",
          id: "t" + String(++nextEventId),
          method: "track",
          args: [eventName],
        });
      } catch {}
    }
  };
}
function createExportAnalyticsReporter(
  reportHealth?: Dynamic,
  trackFrameEvent?: Dynamic,
): Dynamic {
  return (healthArgs?: Dynamic, eventName?: Dynamic): Dynamic => {
    reportHealth(...healthArgs);
    healthArgs[1] === "success" && trackFrameEvent(eventName);
  };
}
export {
  AppifactHealthValue,
  ChatColumnOverlayActionsSlotValue,
  createExportAnalyticsReporter,
  createFrameAnalyticsReporter,
  designAnalyticsEvents,
  frameAnalyticsReporter,
  getHealthReporter,
  healthReporter,
  disabledFrameAnalyticsTransport as PlatformHealthAndAnalyticsFramedPostConfig,
  reportExportOutcome,
};
export function installPlatformHealthAndAnalytics(): () => void {
  return () => {
    ChatColumnOverlayActionsSlotValue = "chat-column-overlay-actions-slot";
    AppifactHealthValue = "__appifact_health";
    healthReporter = {
      report(event: Dynamic, outcome: Dynamic, detail: Dynamic): Dynamic {
        try {
          getHealthReporter()?.report(event, outcome, detail);
        } catch {}
      },
      async track(
        event: Dynamic,
        run: Dynamic,
        detail: Dynamic,
      ): Promise<Dynamic> {
        let reporter: Dynamic = getHealthReporter();
        if (reporter === undefined) return await run();
        let trackedResult: Dynamic;
        try {
          trackedResult = reporter.track(event, run, detail);
        } catch {
          return await run();
        }
        return await trackedResult;
      },
    };
    // MineDesign: no analytics. The page is never treated as framed for analytics, so no `__frame_cap` analytics
    // message is posted to the parent window (MineDesign's UI). Health reports need globalThis.__appifact_health,
    // which the MineDesign page template does not install, so they are dropped by the code above unchanged.
    disabledFrameAnalyticsTransport = {
      framed: (): Dynamic => false,
      post: (_message?: Dynamic): Dynamic => {},
    };
    frameAnalyticsReporter = createFrameAnalyticsReporter(
      disabledFrameAnalyticsTransport,
    );
    reportExportOutcome = createExportAnalyticsReporter(
      (...reportArgs: Dynamic[]): Dynamic => healthReporter.report(...reportArgs),
      frameAnalyticsReporter,
    );
    designAnalyticsEvents = {
      artboardInserted: "frame_design_artboard_inserted",
      artboardDeleted: "frame_design_artboard_deleted",
      exported: {
        png: "frame_design_export_png",
        jpg: "frame_design_export_jpg",
        pdf: "frame_design_export_pdf",
        html: "frame_design_export_html",
        zip: "frame_design_export_zip",
      },
    };
  };
}

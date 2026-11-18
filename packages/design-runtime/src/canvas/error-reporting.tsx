/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasWorkingStateConstant } from "./working-state";
import { load_react } from "../dependencies";
import { openAbortedReport } from "../export/outcomes";
import { toModuleNamespace } from "../module-helpers";
import { claudeActivityStore } from "../platform/claude-activity";
import { embedMemoryPrefix } from "../platform/file-content";
import { healthReporter } from "../platform/health-and-analytics";

var react_MCt: Dynamic;
var artboardErrorReportDelayMs: Dynamic;
var scheduleArtboardErrorReport: Dynamic;
var artboardErrorReporter: Dynamic;
function createArtboardErrorReporter(reporterOptions?: Dynamic): Dynamic {
  if (reporterOptions.hosted)
    return {
      shown(): Dynamic {},
    };
  let isShown: Dynamic = false,
    isWorking: Dynamic = false,
    hasReported: Dynamic = false,
    cancelWorkingDelay: Dynamic,
    cancelReportTimer: Dynamic,
    unsubscribeActivity: Dynamic,
    scheduleReport: Dynamic = (): Dynamic => {
      isShown && !isWorking && !hasReported
        ? (cancelReportTimer ??= reporterOptions.after(
            artboardErrorReportDelayMs,
            (): Dynamic => {
              hasReported = true;
              unsubscribeActivity?.();
              reporterOptions.report(...openAbortedReport);
            },
          ))
        : (cancelReportTimer?.(), (cancelReportTimer = undefined));
    },
    syncWithActivity: Dynamic = (): Dynamic => {
      reporterOptions.activity.get() === "working"
        ? (cancelWorkingDelay?.(), (cancelWorkingDelay = undefined), (isWorking = true))
        : isWorking &&
          (cancelWorkingDelay ??= reporterOptions.after(
            CanvasWorkingStateConstant,
            (): Dynamic => {
              cancelWorkingDelay = undefined;
              isWorking = false;
              scheduleReport();
            },
          ));
      scheduleReport();
    };
  return {
    shown(shouldShow: Dynamic): Dynamic {
      hasReported ||
        ((isShown = shouldShow),
        isShown && (unsubscribeActivity ??= reporterOptions.activity.subscribe(syncWithActivity)),
        syncWithActivity());
    },
  };
}
function useArtboardErrorReporting(shown?: Dynamic): Dynamic {
  (0, react_MCt.useEffect)((): Dynamic => {
    artboardErrorReporter ??= createArtboardErrorReporter({
      hosted: embedMemoryPrefix() !== "",
      activity: claudeActivityStore,
      after: scheduleArtboardErrorReport,
      report: (...reportArgs: Dynamic[]): Dynamic =>
        healthReporter.report(...reportArgs),
    });
    let reporter: Dynamic = artboardErrorReporter;
    reporter.shown(shown);
    return (): Dynamic => reporter.shown(false);
  }, [shown]);
}
export {
  artboardErrorReportDelayMs,
  artboardErrorReporter,
  createArtboardErrorReporter,
  react_MCt,
  scheduleArtboardErrorReport,
  useArtboardErrorReporting,
};
export function installCanvasErrorReporting(): () => void {
  return () => {
    react_MCt = toModuleNamespace(load_react(), 1);
    artboardErrorReportDelayMs = 5e3;
    scheduleArtboardErrorReport = (
      delayMs?: Dynamic,
      onTimeout?: Dynamic,
    ): Dynamic => {
      let timerId: Dynamic = setTimeout(onTimeout, delayMs);
      return (): Dynamic => clearTimeout(timerId);
    };
  };
}

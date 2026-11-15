/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { healthReporter } from "../platform/health-and-analytics";

var FAST_EDIT_METRICS_ENABLED: Dynamic;
var FAST_EDIT_FAILURE_METRIC_CATEGORIES: Dynamic;
var FAST_EDIT_ABORTED_CODES: Dynamic;
var fastEditMetricDeduplication: Dynamic;
function classifyFastEditOutcomeMetric(outcome?: Dynamic): Dynamic {
  return outcome.outcome === "saved"
    ? ["generate", "success"]
    : outcome.outcome === "stopped" ||
        FAST_EDIT_ABORTED_CODES.has(outcome.code) ||
        outcome.code.startsWith("gate_") ||
        outcome.code.startsWith("cap_")
      ? ["generate", "aborted"]
      : [
          "generate",
          "failure",
          Object.hasOwn(FAST_EDIT_FAILURE_METRIC_CATEGORIES, outcome.code)
            ? FAST_EDIT_FAILURE_METRIC_CATEGORIES[outcome.code]
            : "unknown",
        ];
}
function reportFastEditOutcome(
  outcome?: Dynamic,
  deduplication: Dynamic = fastEditMetricDeduplication,
): Dynamic {
  if (!FAST_EDIT_METRICS_ENABLED) return;
  let metric: Dynamic = classifyFastEditOutcomeMetric(outcome);
  outcome.code === "not_loaded" &&
    (deduplication.lostFile && (metric = ["generate", "aborted"]),
    (deduplication.lostFile = true));
  outcome.code === "no_box" &&
    (outcome.calls ?? 0) === 0 &&
    (deduplication.noBox && (metric = ["generate", "aborted"]),
    (deduplication.noBox = true));
  healthReporter.report(...metric);
}
export {
  classifyFastEditOutcomeMetric,
  FAST_EDIT_ABORTED_CODES,
  FAST_EDIT_FAILURE_METRIC_CATEGORIES,
  FAST_EDIT_METRICS_ENABLED,
  fastEditMetricDeduplication,
  reportFastEditOutcome,
};
export function installFastEditOutcomeMetrics(): () => void {
  return () => {
    FAST_EDIT_METRICS_ENABLED = true;
    FAST_EDIT_FAILURE_METRIC_CATEGORIES = {
      upstream_error: "capability_error",
      no_box: "capability_error",
      start_stuck: "capability_error",
      sandbox_failed: "internal",
      page_error: "internal",
      save_unknown: "timeout",
    };
    FAST_EDIT_ABORTED_CODES = new Set([
      "refused",
      "empty_drawing",
      "ask_claude",
      "not_named",
      "in_import",
      "refused_add",
      "no_change",
      "no_match",
      "already_so",
      "line_no_match",
      "read_twice",
      "box_cannot_hold",
      "beyond_target",
      "thrown",
      "not_granted",
      "sampling_disabled",
      "not_declared",
      "capability_disabled",
      "capability_removed",
      "session_expired",
      "read_only",
      "rate_limited",
      "call_cap",
      "prompt_too_large",
      "too_long",
      "cut_short",
      "busy",
      "busy_other",
      "conflict_again",
      "save_clash",
      "gone",
      "not_ready",
      "no_artboards",
      "slow_start",
    ]);
    fastEditMetricDeduplication = {
      lostFile: false,
      noBox: false,
    };
  };
}

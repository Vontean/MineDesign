import { uiRelativeTime } from '@minedesign/contracts/ui-format';
import { getUiLocale } from '@minedesign/contracts/ui-locale';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { getRemoteTextProblems, subscribeRemoteTextProblems } from "../model/remote-text";
import { getStoredSystemStatus, subscribeStoredSystemStatus } from "../model/system-sync";
import { toModuleNamespace } from "../module-helpers";
import { TooltipWrapper } from "../ui/color/gradient-stops";
import { Callout } from "../ui/icons";

var reactPipelineBanners: typeof import("react");
var jsxPipelineBanners: typeof import("react/jsx-runtime");
var PIPELINE_BANNER_STORAGE_PREFIX: string;
var LEFT_OUT_BANNER_STORAGE_PREFIX: string;
function relativeChangeTime(timestamp: string, now: number = Date.now()): string { return uiRelativeTime(timestamp, now); }
function countedChangeNoun(count: number, noun: string): string {
  if (noun === 'file') return uiMessage(count === 1 ? 'design-system.count.file' : 'design-system.count.files', { count });
  return String(count) + ' ' + noun;
}
function PipelineChangeSummary({
  change: change,
  now: now,
}: {
  change: Model.LastChange | null;
  now?: number;
}): React.ReactElement | null {
  useUiLocale();
  if (change === null) {
    return null;
  }
  let value = relativeChangeTime(change.at, now),
    viaLabel: string = change.via !== undefined ? " via " + change.via : "";
  return (
    <TooltipWrapper
      tip={
        (((change.by +
        viaLabel) + (" · ")) + (change.at)) + (change.note !== undefined ? ((" — ") + (change.note)) : (""))
      }
      wrap={true}
    >
      <span
        className={"ds-last-change text-footnote text-muted"}
        data-testid={"ds-last-change"}
        {...UNCOMMENTABLE_PROPS}
      >
        {[uiMessage("design-system.pipelineBanners.lastChange"), <span className={"ds-last-change-by text-secondary"}>
            {change.by}
          </span>, viaLabel, value !== "" ? ((" · ") + (value)) : (""), change.note !== undefined ? (
            <span className={"ds-last-change-note"}>
              {[" — “", change.note, "”"]}
            </span>
          ) : null]}
      </span>
    </TooltipWrapper>
  );
}
function isPipelineBannerDismissed(timestamp: string): boolean {
  try {
    return (
      sessionStorage.getItem(PIPELINE_BANNER_STORAGE_PREFIX + timestamp) ===
      "1"
    );
  } catch {
    return false;
  }
}
function PipelineChangeBanner({
  change: change,
  now: now,
}: {
  change: Model.LastChange;
  now?: number;
}): React.ReactElement | null {
  useUiLocale();
  let [value, setDismissed] = reactPipelineBanners.useState(() =>
    isPipelineBannerDismissed(change.at),
  );
  if (value) {
    return null;
  }
  let relativeTime = relativeChangeTime(change.at, now);
  return (
    <div {...UNCOMMENTABLE_PROPS}>
      <Callout
        variant={"warning"}
        onDismiss={(): void => {
          try {
            sessionStorage.setItem(
              PIPELINE_BANNER_STORAGE_PREFIX + change.at,
              "1",
            );
          } catch {}
          setDismissed(true);
        }}
        data-testid={"ds-pipeline-banner"}
        className={"ds-pipeline-banner"}
      >
        <span className={"ds-pipeline-banner-text"}>
          {[uiMessage("design-system.pipelineBanners.writtenByAPipeline"), <span className={"font-mono"}>{change.via ?? ("")}</span>, ")", relativeTime !== "" ? ((" ") + (relativeTime)) : (""), ". Edits here may be overwritten on its next run."]}
        </span>
      </Callout>
    </div>
  );
}
function MigrationLeftOutBanner(): React.ReactElement | null {
  useUiLocale();
  let value = reactPipelineBanners.useSyncExternalStore(
      subscribeStoredSystemStatus,
      getStoredSystemStatus as () => Editor.PipelineStoredStatus,
      getStoredSystemStatus as () => Editor.PipelineStoredStatus,
    ),
    sessionKey: string =
      LEFT_OUT_BANNER_STORAGE_PREFIX +
      (value.convertedAt ?? "") +
      "/" +
      String(value.carried.length + value.carriedMore),
    [isDismissed, setDismissed] = reactPipelineBanners.useState(false),
    carriedFiles = value.carried.filter(
      (entry): boolean => entry.form === "omitted",
    ),
    carriedCount = carriedFiles.length + (value.carriedMore > 0 ? value.carriedMore : 0);
  if (isDismissed || carriedCount === 0 || isSessionBannerDismissed(sessionKey)) {
    return null;
  }
  let callback = (): void => {
      try {
        sessionStorage.setItem(sessionKey, "1");
      } catch {}
      setDismissed(true);
    },
    visibleFiles = carriedFiles.slice(0, 3);
  return (
    <div {...UNCOMMENTABLE_PROPS}>
      <Callout
        variant={"warning"}
        onDismiss={callback}
        data-testid={"ds-left-out-banner"}
        className={"ds-left-out-banner"}
      >
        <span className={"ds-left-out-banner-text"}>
          {[uiMessage("design-system.pipelineBanners.couldnTBeKeptWhen", { subject: String(value.carriedMore > 0 ? (uiMessage("design-system.pipelineBanners.atLeast")) : ("")), detail: String(countedChangeNoun(carriedCount, "file")) }), visibleFiles.map((file, index) =>
              (() => {
                const _Element = "span";
                const _elementProps = {
                  children: [
                    index > 0 ? "; " : "",
                    <span className={"font-mono"}>{file.path}</span>,
                    <span className={"text-muted"}>
                      {[" (", file.reason, ")"]}
                    </span>,
                  ],
                };
                const _elementKey = file.path;
                return <_Element key={_elementKey} {..._elementProps} />;
              })(),
            ), carriedFiles.length > visibleFiles.length ? (uiMessage("design-system.pipelineBanners.andMore", { subject: String(String(carriedCount - visibleFiles.length)) })) : ("."), uiMessage("design-system.pipelineBanners.theyRemainInThisArtifact"), "’", uiMessage("design-system.pipelineBanners.sEarlierVersions")]}
        </span>
      </Callout>
    </div>
  );
}
function isSessionBannerDismissed(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function IndexRecoveryBanner(): React.ReactElement | null {
  useUiLocale();
  let value = reactPipelineBanners.useSyncExternalStore(
      subscribeRemoteTextProblems,
      getRemoteTextProblems as () => Map<string, string>,
      getRemoteTextProblems as () => Map<string, string>,
    ),
    [isDismissed, setDismissed] = reactPipelineBanners.useState(false);
  if (isDismissed || value.size === 0) {
    return null;
  }
  let recentChanges = [...value].slice(0, 3);
  return (
    <div {...UNCOMMENTABLE_PROPS}>
      <Callout
        variant={"warning"}
        onDismiss={() => setDismissed(true)}
        data-testid={"ds-refused-code-banner"}
        className={"ds-left-out-banner"}
      >
        <span className={"ds-left-out-banner-text"}>
          {[uiMessage("design-system.pipelineBanners.addedHereCouldNotBe", { subject: String(countedChangeNoun(value.size, "file")) }), recentChanges.map(([filePath, reason], index) =>
              (() => {
                const FileLabel = "span";
                const fileProps = {
                  children: [
                    index > 0 ? "; " : "",
                    <span className={"font-mono"}>{filePath}</span>,
                    <span className={"text-muted"}>
                      {[" (", reason, ")"]}
                    </span>,
                  ],
                };
                const fileKey = filePath;
                return <FileLabel key={fileKey} {...fileProps} />;
              })(),
            ), value.size > recentChanges.length ? (uiMessage("design-system.pipelineBanners.andMore", { subject: String(String(value.size - recentChanges.length)) })) : (".")]}
        </span>
      </Callout>
    </div>
  );
}
export {
  countedChangeNoun,
  IndexRecoveryBanner,
  isPipelineBannerDismissed,
  isSessionBannerDismissed,
  jsxPipelineBanners,
  LEFT_OUT_BANNER_STORAGE_PREFIX,
  MigrationLeftOutBanner,
  PIPELINE_BANNER_STORAGE_PREFIX,
  PipelineChangeBanner,
  PipelineChangeSummary,
  reactPipelineBanners,
  relativeChangeTime,
};
export function installEditorPipelineBanners(): () => void {
  return () => {
    reactPipelineBanners = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxPipelineBanners = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    PIPELINE_BANNER_STORAGE_PREFIX = "ds-pipeline-banner/";
    LEFT_OUT_BANNER_STORAGE_PREFIX = "ds-left-out-banner/";
  };
}

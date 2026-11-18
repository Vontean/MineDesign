import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Host from "../../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactHandoff: typeof React;
var reactDomHandoff: typeof import("react-dom");
var jsxHandoff: typeof import("react/jsx-runtime");
var reactHandoffTargets: typeof React;
var jsxHandoffTargets: typeof import("react/jsx-runtime");
var HANDOFF_TARGETS: Host.HandoffTarget[];
var HANDOFF_TARGET_STORAGE_KEY: string;
var preferredHandoffTarget: Host.HandoffTarget | null;
var reactArtifactClipboard: typeof React;
var ARTIFACT_CLIPBOARD_ATTRIBUTE: string;
var ARTIFACT_CLIPBOARD_PATTERN: RegExp;
function claudeSendResultMessage(
  kind: Host.ClaudeSendKind,
  suffix?: string,
): string;
function claudeSendResultMessage(
  kind: string,
  suffix?: string,
): string | undefined;
function claudeSendResultMessage(
  kind: string,
  suffix: string = "",
): string | undefined {
  // MineDesign: user-facing copy calls the agent "the agent", not Claude.
  switch (kind) {
    case "staged":
    case "waiting":
      return (
        uiMessage("design-system.handoffRuntime.addedToYourMessageTo") + suffix
      );
    case "unanswered":
      return uiMessage("design-system.handoffRuntime.couldnTReachTheAgent");
    case "sent":
      return uiMessage("design-system.handoffRuntime.sentToTheAgent") + suffix;
    case "started":
      return uiMessage("design-system.handoffRuntime.sendingToTheAgent") + suffix;
    case "copied":
      return uiMessage("design-system.handoffRuntime.promptCopiedPasteItTo") + suffix;
    case "failed":
      return uiMessage("design-system.handoffRuntime.couldnTCopyThePrompt");
  }
}
function previewLibraryScripts(
  libraries: {
    load: readonly {
      file: string;
    }[];
  },
  files: Readonly<Record<string, string | undefined>>,
): string[] {
  return libraries.load.map((input) => files[input.file] ?? "");
}
export {
  ARTIFACT_CLIPBOARD_ATTRIBUTE,
  ARTIFACT_CLIPBOARD_PATTERN,
  claudeSendResultMessage,
  HANDOFF_TARGET_STORAGE_KEY,
  HANDOFF_TARGETS,
  jsxHandoff,
  jsxHandoffTargets,
  preferredHandoffTarget,
  previewLibraryScripts,
  reactArtifactClipboard,
  reactDomHandoff,
  reactHandoff,
  reactHandoffTargets,
};
export function installFilesUiHandoffRuntime(): () => void {
  return () => {
    reactHandoff = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomHandoff = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    jsxHandoff = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactHandoffTargets = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxHandoffTargets = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    HANDOFF_TARGETS = ["cowork", "code", "coworker"];
    HANDOFF_TARGET_STORAGE_KEY = "appifact.handOff.target";
    preferredHandoffTarget = null;
    try {
      let value = localStorage.getItem(HANDOFF_TARGET_STORAGE_KEY);
      preferredHandoffTarget =
        HANDOFF_TARGETS.find((input) => input === value) ?? null;
    } catch {
      preferredHandoffTarget = null;
    }
    reactArtifactClipboard = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    ARTIFACT_CLIPBOARD_ATTRIBUTE = "data-appifact-object";
    ARTIFACT_CLIPBOARD_PATTERN = new RegExp(
      ARTIFACT_CLIPBOARD_ATTRIBUTE + '="([A-Za-z0-9+/=]+)"',
    );
  };
}

import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  JsxNamespace,
  ArtifactShellProps,
  ArtifactShellDocument,
  ArtifactShellUndo,
} from "../contracts/composition";
import { loadJsxNamespace } from "../dependencies";
import { useHostSaveState } from "../host/frame-bridge";
import { toModuleNamespace } from "../module-helpers";
import { ArtifactLoadBoundary } from "./artifact-load-boundary";
import { ArtifactToolbar } from "./artifact-toolbar";
import { Button } from "./buttons";
import { AppDesignProvider } from "./commit-text-input";
import { reactForUiDisclosure } from "./disclosure";
import { Callout } from "./icons";
import { PanedLayout } from "./side-panels";
import { useToastBridge as R_useToastBridge } from "./toasts";
import { ToolbarTabs } from "./toolbar-tabs";
import { useUndoKeys } from "./undo-keys";

var jsxForUiArtifactShell: JsxNamespace;
var ArtifactErrorBoundary: React.ComponentClass<
  React.PropsWithChildren,
  {
    error?: string;
  }
>;
function LocalStashRecoveryOffer<Seed>({
  doc: doc,
  undo: undo,
}: {
  doc: ArtifactShellDocument<Seed>;
  undo?: ArtifactShellUndo<Seed> | null;
}) {
  useUiLocale();
  let value = doc.stashOffer(),
    ref = (reactForUiDisclosure as typeof import("react")).useRef<{
      at: number;
      mins: number;
    } | null>(null);
  if (value && ref.current?.at !== value.at) {
    ref.current = {
      at: value.at,
      mins: Math.max(1, Math.round((Date.now() - value.at) / 60000)),
    };
  }
  let unsavedMinutes = value ? (ref.current?.mins ?? 1) : 0;
  return (
    <div data-mc-chrome={""} role={"status"} className={"shrink-0"}>
      {value ? (<div className={"px-md pt-md"}>
          <Callout
            variant={"warning"}
            role={"none"}
            action={
              <jsxForUiArtifactShell.Fragment>
                {[<Button
                    variant={"secondary"}
                    onClick={() => {
                      let restoredState = doc.restoreStash();
                      if (restoredState && undo) {
                        undo.seed(restoredState);
                      }
                    }}
                  >
                    {uiMessage("design-system.artifactShell.restore")}
                  </Button>, <Button
                    variant={"ghost"}
                    onClick={() => {
                      let shouldClearHistory = !undo || undo.redoDepth() <= 1;
                      doc.discardStash();
                      if (undo && shouldClearHistory) {
                        undo.clear();
                      }
                    }}
                  >
                    {uiMessage("design-system.artifactShell.discard")}
                  </Button>]}
              </jsxForUiArtifactShell.Fragment>
            }
          >
            {[uiMessage(unsavedMinutes === 1 ? "design-system.artifactShell.unsavedMinute" : "design-system.artifactShell.unsavedMinutes", { minutes: unsavedMinutes }), " ", doc.readOnly() ? (uiMessage("design-system.artifactShell.restoreThemHereToKeep")) : (doc.saveMode() === "auto" ? (uiMessage("design-system.artifactShell.restorePutsThemBackOver")) : (uiMessage("design-system.artifactShell.restoreThemHereThenSave")))]}
          </Callout>
        </div>) : (null)}
    </div>
  );
}
function ArtifactShell<Seed>({
  children: children,
  doc: doc,
  undo: undo,
  toolbarExtras: toolbarExtras,
  toolbarExtrasEnd: toolbarExtrasEnd,
  toolbarPinned: toolbarPinned,
  toolbarAfterUndo: toolbarAfterUndo,
  toolbarQuietReadOnlyReason: toolbarQuietReadOnlyReason,
  toolbarLeading: toolbarLeading,
  toolbarTrailing: toolbarTrailing,
  toolbarUndoButtons: toolbarUndoButtons,
  toolbarDensity: toolbarDensity,
  toolbarTouchTargets: toolbarTouchTargets,
  alwaysShowExtras: alwaysShowExtras,
  undoShortcuts = true,
  tabs: tabs,
  tab: tab,
  onTabChange: onTabChange,
  aboveContent: aboveContent,
  skeleton: skeleton,
  skeletonFlush: skeletonFlush,
  leading: leading,
  hideToolbar = false,
  toolbarVariant = "docked",
}: ArtifactShellProps<Seed>) {
  useUiLocale();
  let [, value] = reactForUiDisclosure.useState(0),
    [saveState, setSaveState] = reactForUiDisclosure.useState(doc.saveState());
  reactForUiDisclosure.useEffect(() => {
    let unsubscribeContent = doc.subscribe(() => value((revision: number) => revision + 1)),
      unsubscribeSave = doc.subscribeSave(setSaveState);
    setSaveState(doc.saveState());
    return () => {
      unsubscribeContent();
      unsubscribeSave();
    };
  }, [doc]);
  reactForUiDisclosure.useEffect(() => {
    let onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        doc.save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [doc]);
  useUndoKeys(undo, undoShortcuts);
  let readOnly = doc.readOnly(),
    title = doc.title(),
    showSyncDot = "loadState" in doc || doc.saveMode() === "auto",
    status = doc.saveState().status,
    hideReadOnlyStatus =
      status === "readonly" &&
      toolbarQuietReadOnlyReason !== undefined &&
      doc.saveState().message === toolbarQuietReadOnlyReason;
  useHostSaveState(
    !hideReadOnlyStatus && (showSyncDot || status === "readonly") ? status : null,
    () => void doc.save(),
  );
  reactForUiDisclosure.useEffect(() => {
    if (title !== "") {
      document.title = title;
    }
  }, [title]);
  let isLoadingWritableDocument = saveState.status === "loading" && !readOnly,
    disableWhileLoading = (controls: React.ReactNode) =>
      isLoadingWritableDocument && controls != null ? (
        <fieldset
          disabled={true}
          aria-busy={"true"}
          title={uiMessage("design-system.artifactShell.loadingTheLatestContent")}
          className={"contents"}
        >
          {controls}
        </fieldset>
      ) : (
        controls
      ),
    tabBar =
      tabs !== undefined &&
      tabs.length > 0 &&
      tab !== undefined &&
      onTabChange ? (
        <ToolbarTabs
          tabs={tabs}
          value={tab}
          onChange={onTabChange}
          label={uiMessage("design-system.artifactShell.editorMode")}
        />
      ) : null,
    isFloatingToolbar = toolbarVariant === "floating" && tabBar === null;
  return (
    <AppDesignProvider>
      <ArtifactErrorBoundary>
        {[<PanedLayout
            leading={leading}
            toolbarVariant={isFloatingToolbar ? "floating" : "docked"}
            toolbar={
              <jsxForUiArtifactShell.Fragment>
                {[hideToolbar ? null : (
                    <ArtifactToolbar
                      title={doc.title()}
                      saveState={saveState}
                      saveMode={doc.saveMode()}
                      syncDot={showSyncDot}
                      onSave={() => void doc.save()}
                      undo={undo}
                      extrasEnd={
                        !readOnly || alwaysShowExtras
                          ? disableWhileLoading(toolbarExtrasEnd)
                          : null
                      }
                      pinned={
                        !readOnly || alwaysShowExtras
                          ? disableWhileLoading(toolbarPinned)
                          : null
                      }
                      afterUndo={toolbarAfterUndo}
                      {...(toolbarQuietReadOnlyReason !== undefined
                        ? {
                            quietReadOnlyReason: toolbarQuietReadOnlyReason,
                          }
                        : {})}
                      leading={toolbarLeading}
                      trailing={toolbarTrailing}
                      undoButtons={toolbarUndoButtons}
                      density={toolbarDensity}
                      touchTargets={toolbarTouchTargets}
                      readOnly={readOnly}
                      variant={isFloatingToolbar ? "floating" : "docked"}
                    >
                      {!readOnly || alwaysShowExtras ? (disableWhileLoading(toolbarExtras)) : (null)}
                    </ArtifactToolbar>
                  ), tabBar]}
              </jsxForUiArtifactShell.Fragment>
            }
          >
            {[isFloatingToolbar ? (
                <div
                  data-tb-overlay-clear={""}
                  className={"flex shrink-0 flex-col"}
                >
                  {[<LocalStashRecoveryOffer doc={doc} undo={undo} />, <div
                      data-tb-clear-above={""}
                      className={"flex shrink-0 flex-col"}
                    >
                      {aboveContent}
                    </div>]}
                </div>
              ) : (
                <jsxForUiArtifactShell.Fragment>
                  {[<LocalStashRecoveryOffer doc={doc} undo={undo} />, aboveContent]}
                </jsxForUiArtifactShell.Fragment>
              ), <div
                data-appifact-content={""}
                className={"isolate min-h-0 min-w-0 flex-1 overflow-auto"}
                style={{
                  contain: "paint",
                }}
              >
                <ArtifactLoadBoundary
                  doc={doc}
                  skeleton={skeleton}
                  skeletonFlush={skeletonFlush}
                >
                  {children}
                </ArtifactLoadBoundary>
              </div>]}
          </PanedLayout>, <R_useToastBridge />]}
      </ArtifactErrorBoundary>
    </AppDesignProvider>
  );
}
export {
  ArtifactErrorBoundary,
  ArtifactShell,
  jsxForUiArtifactShell,
  LocalStashRecoveryOffer,
};
export function installUiArtifactShell(): () => void {
  return () => {
    jsxForUiArtifactShell = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ArtifactErrorBoundary = class ArtifactErrorBoundary extends (
      (reactForUiDisclosure.Component as typeof React.Component)
    )<
      React.PropsWithChildren,
      {
        error?: string;
      }
    > {
      declare props: React.PropsWithChildren;
      state: {
        error?: string;
      } = {};
      static getDerivedStateFromError(error: unknown) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
      componentDidCatch(error: unknown) {
        try {
          if (typeof reportError === "function") {
            reportError(error);
          }
        } catch {}
      }
      render() {
        if (this.state.error !== undefined) {
          return (
            <div
              className={
                "m-6 rounded-lg border border-border-line bg-panel p-4 text-sm"
              }
            >
              {[<p className={"font-semibold"}>
                  {uiMessage("design-system.artifactShell.thisAppifactHitARenderingError")}
                </p>, <p className={"mt-1 text-fg-muted"}>{this.state.error}</p>, <p className={"mt-2 text-fg-muted"}>
                  {
                    uiMessage("design-system.artifactShell.reloadToTryAgainIf")
                  }
                </p>]}
            </div>
          );
        }
        return this.props.children;
      }
    };
  };
}

import { uiMessage } from "@minedesign/contracts/ui-messages";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { SessionBusyError, UnsettledEditsError } from "../../editor/session/errors";
import { canvasMetadataFile, getKvClient, projectFileKey, serializeCanvasMetadata, setEmbedSettler } from "../../platform/file-content";
import type { CanvasLaunch, CanvasManifest } from "../manifest-history";
import { beforeExport } from "../desktop-refresh";

const maxSessionDirtyFlushRetries = 3;
type FlushSession = () => Promise<unknown>;

interface SaveState {
  status: string;
  message?: string;
}

interface CanvasSaveOptions {
  doc: {
    save(): Promise<unknown>;
    saveState(): SaveState;
    subscribeSave(listener: (state: SaveState) => void): () => void;
  };
  showToast(message: string, variant: "error"): unknown;
  settleSessionRef: { current: FlushSession | null };
}

function saveStateCategory(state: SaveState) {
  return state.status === "readonly" || state.status === "error" ? state.status : "live";
}

export function useCanvasSave({ doc, showToast, settleSessionRef }: CanvasSaveOptions) {
  const { useCallback, useEffect, useMemo, useRef, useState } = React;
  const pendingSessions: { current: Map<string, FlushSession> } = useRef(new Map());
  const beforeSave: { current: FlushSession } = useRef(async () => {});
  const retryCount = useRef(0);
  const localDirtyEpochRef = useRef(0);
  const [localDirty, setLocalDirty] = useState(false);
  const [sessionsDirty, setSessionsDirty] = useState(false);
  const [retryEpoch, incrementRetryEpoch] = useState(0);
  const [saveState, setSaveState] = useState(doc.saveState());
  const supportsLoadState = "loadState" in doc;
  const editable = saveState.status !== "readonly";

  const registerDirtySession = useCallback((file: string, flush?: FlushSession | null) => {
    const sessions = pendingSessions.current;
    if (flush) {
      sessions.set(file, flush);
      const retriesExhausted = retryCount.current > maxSessionDirtyFlushRetries;
      retryCount.current = 0;
      if (retriesExhausted) incrementRetryEpoch((epoch: number) => epoch + 1);
    } else {
      sessions.delete(file);
    }
    setSessionsDirty(sessions.size > 0);
  }, []);

  const flushDirtySessions = useCallback(async () => {
    for (const flush of [...pendingSessions.current.values()]) await flush();
  }, []);

  const saveCanvas = useMemo(() => {
    const saveAfterSettling = beforeExport(settleSessionRef, async () => {
      await flushDirtySessions();
      await beforeSave.current();
      await doc.save();
    });
    return async () => {
      const savedEpoch = localDirtyEpochRef.current;
      try {
        await saveAfterSettling();
        if (localDirtyEpochRef.current === savedEpoch) setLocalDirty(false);
      } catch (error) {
        const action = "loadState" in doc ? "sync" : "Save";
        let message: string;
        if (error instanceof SessionBusyError) {
          message = uiMessage("canvas.designCanvas.closeTheOpenDialogFirst") + action + ".";
        } else if (error instanceof UnsettledEditsError) {
          message = uiMessage("canvas.designCanvas.someEditsCouldNotBe") + action + ".";
        } else {
          const prefix = action === "Save"
            ? uiMessage("canvas.designCanvas.saveFailed")
            : uiMessage("canvas.designCanvas.syncFailed");
          message = prefix + (error instanceof Error ? error.message : String(error));
        }
        showToast(message, "error");
      }
    };
  }, [doc, showToast, settleSessionRef, flushDirtySessions]);

  useEffect(() => doc.subscribeSave((incoming) => {
    setSaveState((previous: SaveState) =>
      supportsLoadState &&
      saveStateCategory(previous) === saveStateCategory(incoming) &&
      (saveStateCategory(incoming) === "live" || previous.message === incoming.message)
        ? previous
        : incoming,
    );
  }), [doc, supportsLoadState]);

  useEffect(() => {
    if (!supportsLoadState || !editable || !sessionsDirty) {
      retryCount.current = 0;
      return;
    }
    const timer = window.setTimeout(() => {
      Promise.allSettled([...pendingSessions.current.values()].map((flush) => flush())).then(() => {
        if (retryCount.current++ < maxSessionDirtyFlushRetries) {
          incrementRetryEpoch((epoch: number) => epoch + 1);
        }
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [supportsLoadState, editable, sessionsDirty, retryEpoch]);

  const markLocalWrite = useCallback(() => {
    localDirtyEpochRef.current++;
    setLocalDirty(true);
  }, []);

  return {
    editable,
    supportsLoadState,
    saveState,
    localDirty,
    markLocalWrite,
    sessionsDirty,
    registerDirtySession,
    flushDirtySessions,
    installBeforeSave: (prepare: FlushSession) => { beforeSave.current = prepare; },
    saveCanvas,
  };
}

interface LaunchSaveOptions {
  manifest: { current: CanvasManifest };
  activePage: { current: string };
  fullscreenFile: { current: string | null };
  entryFile: string;
  doc: { dirty(): boolean; content(): { files: Record<string, unknown> } };
  editable: boolean;
  supportsLoadState: boolean;
  commitManifest(manifest: CanvasManifest): void;
}

function sameLaunch(previous: CanvasLaunch | undefined, next: CanvasLaunch) {
  if (next.view === "focused") return previous?.view === "focused" && previous.file === next.file;
  return previous?.view === "canvas" && previous.page === next.page;
}

export async function saveCanvasLaunchView(options: LaunchSaveOptions) {
  if (!options.editable || options.supportsLoadState || !options.doc.dirty()) return;
  const manifest = options.manifest.current;
  const fullscreen = options.fullscreenFile.current;
  const page = (manifest.pages?.length ?? 0) > 1 ? options.activePage.current : undefined;
  const launch: CanvasLaunch = fullscreen !== null
    ? { view: "focused", file: fullscreen }
    : page !== undefined ? { view: "canvas", page } : { view: "canvas" };

  const firstFile = manifest.artboards.some(({ file }) => file === options.entryFile)
    ? options.entryFile
    : (manifest.artboards[0]?.file ?? null);
  const previous: CanvasLaunch | undefined = manifest.launch ??
    (options.doc.content().files[canvasMetadataFile] != null
      ? { view: "canvas" }
      : firstFile !== null ? { view: "focused", file: firstFile } : undefined);

  if (sameLaunch(previous, launch)) return;
  const next = { ...manifest, launch };
  options.commitManifest(next);
  await getKvClient().set(projectFileKey(canvasMetadataFile), serializeCanvasMetadata(next), { auto: true });
}

interface SaveOnExitOptions {
  doc: { flushNow?(): void };
  editable: boolean;
  supportsLoadState: boolean;
  settleSessionRef: { current: FlushSession | null };
  flushDirtySessions: FlushSession;
  cancelPaste(): Promise<unknown> | undefined;
  pasteTimeoutMs: number;
}

export function useCanvasSaveOnExit({
  doc, editable, supportsLoadState, settleSessionRef, flushDirtySessions, cancelPaste, pasteTimeoutMs,
}: SaveOnExitOptions) {
  React.useEffect(() => {
    if (!supportsLoadState || !editable) return;

    async function settle() {
      await settleSessionRef.current?.();
      await flushDirtySessions();
    }

    async function flushWhenHidden() {
      if (document.visibilityState !== "hidden") return;
      try {
        await settle();
      } catch {}
      doc.flushNow?.();
    }

    document.addEventListener("visibilitychange", flushWhenHidden);
    setEmbedSettler(async () => {
      const pendingPaste = cancelPaste();
      if (pendingPaste) {
        await Promise.race([
          pendingPaste,
          new Promise<void>((resolve) => window.setTimeout(resolve, pasteTimeoutMs)),
        ]);
      }
      await settle();
    });
    return () => {
      document.removeEventListener("visibilitychange", flushWhenHidden);
      setEmbedSettler(null);
    };
  }, [supportsLoadState, editable, doc]);
}

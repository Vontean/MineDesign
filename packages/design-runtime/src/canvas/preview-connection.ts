import { npm_useEventListener_bc } from "../dependencies";
import { currentHttpOrigin, probePreviewRuntime } from "../platform/file-content";
import type { PreviewGenerationGate } from "../preview/generation-gate";
import { createPreviewHandle } from "../preview/evaluation";
import { setPreviewProjectRoot } from "../preview/project-root";
import {
  designEditQuietPeriodMs,
  lastDesignEditAt,
  navigationProbeAttempts,
  navigationProbeAttemptsAfterEdit,
} from "./compilation-cache";
import { refreshDesktopRendering } from "./desktop-refresh";
import { isFrameCaptureDocument } from "./frame-environment";
import { markDesignFramesReady, unblockDesignFramesReady } from "./frame-readiness";

type FrameRef = { current: HTMLIFrameElement | null };

interface PreviewDocument {
  projectRoot?: string;
  boot?: { doc: unknown; parts: unknown; urls: unknown } | null;
}

interface PreviewConnectionOptions {
  iframeRef: FrameRef;
  gate: PreviewGenerationGate;
  previewDocument: PreviewDocument | null;
  displayedGeneration: number;
  retiredGenerationRef: { current: number };
  lastRenderedGenerationRef: { current: number };
  isRetired(): boolean;
  isLoading: boolean;
  onBlocked(reason: string | null): void;
  onAcceptGeneration(generation: number): void;
  onReady(): void;
}

export function usePreviewConnection({
  iframeRef,
  gate,
  previewDocument,
  displayedGeneration,
  retiredGenerationRef,
  lastRenderedGenerationRef,
  isRetired,
  isLoading,
  onBlocked,
  onAcceptGeneration,
  onReady,
}: PreviewConnectionOptions) {
  function reportBlocked() {
    if (isRetired()) return;
    onBlocked(gate.blocked);
    unblockDesignFramesReady();
  }

  npm_useEventListener_bc("message", (event: MessageEvent) => {
    if (event.data?.__om_hello === 1) {
      const previewWindow = iframeRef.current?.contentWindow;
      if (previewWindow != null && event.source === previewWindow && event.origin === currentHttpOrigin()) {
        const port = event.ports[0];
        if (port != null) gate.helloReceived(port);
      }
      return;
    }
    if (event.data?.__om_nav_away !== 1 || event.origin !== currentHttpOrigin()) return;
    const generation = gate.mountedGeneration;
    const port = gate.helloPort;
    if (port == null) return;
    const attempts = performance.now() - lastDesignEditAt < designEditQuietPeriodMs
      ? navigationProbeAttemptsAfterEdit
      : navigationProbeAttempts;
    probePreviewRuntime(port, { attempts }).then((verdict: string) => {
      if (generation <= retiredGenerationRef.current) return;
      gate.verdict(generation, verdict);
      if (gate.blocked != null) reportBlocked();
    });
  });

  async function finishFrameLoad(generation: number) {
    const port = await gate.waitForHello();
    const verdict = port == null ? "dead" : await probePreviewRuntime(port, { attempts: 3 });
    if (generation <= retiredGenerationRef.current) return;
    gate.verdict(generation, verdict);
    if (gate.blocked != null) {
      reportBlocked();
      return;
    }
    onAcceptGeneration(generation);
    if (isFrameCaptureDocument() && !isLoading) {
      await createPreviewHandle(iframeRef.current)?.awaitSettled({
        capMs: 1200,
        finishAnimations: true,
      });
      if (generation !== gate.mountedGeneration) return;
    }
    onReady();
    refreshDesktopRendering(iframeRef.current);
    if (!isLoading) markDesignFramesReady();
  }

  return function onFrameLoad() {
    const boot = previewDocument?.boot;
    if (boot != null && lastRenderedGenerationRef.current !== displayedGeneration) {
      lastRenderedGenerationRef.current = displayedGeneration;
      iframeRef.current?.contentWindow?.postMessage({
        __dc_doc: 1,
        doc: boot.doc,
        parts: boot.parts,
        urls: boot.urls,
      }, "*");
      return;
    }
    setPreviewProjectRoot(
      iframeRef.current?.contentWindow,
      previewDocument?.projectRoot === undefined ? undefined : new URL(previewDocument.projectRoot).pathname,
    );
    const load = gate.frameLoaded();
    if (load.kind === "foreign") {
      reportBlocked();
      return;
    }
    void finishFrameLoad(load.gen);
  };
}

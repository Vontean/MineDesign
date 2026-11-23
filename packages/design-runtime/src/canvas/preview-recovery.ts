import { uiMessage } from "@minedesign/contracts/ui-messages";
import {
  getCurrentPublishedProjectRoot,
  invalidateDesignSystemUrl,
  invalidatePublishedRoot,
  lookupPublishedUrl,
} from "../design-system/published-files";
import { notifyUndoGesture } from "../editor/history-ownership";
import { TheArtboardRuntimeDidNotLoadMessage } from "../preview/build-document";
import { DcAddressRefusedValue } from "../preview/dependency-injection";
import { markRuntimeUrlBlocked } from "../preview/runtime-loading";
import { unblockDesignFramesReady } from "./frame-readiness";
import { reactCanvasShape } from "./shape";

interface PreviewRecoveryOptions {
  file: string;
  readPreview(): { srcdoc: string; projectRoot?: string } | null;
  readCompilationAddresses(): Set<string>;
  ignoreBootFailure(): boolean;
  rebuild(): void;
  reportBlocked(message: string): void;
}

export function usePreviewRecovery(options: PreviewRecoveryOptions) {
  const retries: { current: { count: number; source: MessageEventSource | null } } =
    reactCanvasShape.useRef({ count: 0, source: null });
  const rebuiltSrcdoc: { current: string | null } = reactCanvasShape.useRef(null);

  function recoverBootFailure(error: unknown, url: unknown, source: MessageEventSource | null) {
    const runtimeUnavailable = error === TheArtboardRuntimeDidNotLoadMessage;
    if (options.ignoreBootFailure() || (runtimeUnavailable && source !== null && retries.current.source === source)) return;
    if (runtimeUnavailable && retries.current.count < 2) {
      retries.current.count++;
      retries.current.source = source;
      markRuntimeUrlBlocked(url);
      console.warn("[design] artboard " + options.file + " could not load its runtime by URL; rebuilding without that URL");
      options.rebuild();
      return;
    }
    console.warn("[design] artboard " + options.file + " did not boot: " + String(error).slice(0, 200));
    options.reportBlocked(uiMessage("canvas.artboardFrame.itsContentDidnTLoad"));
    unblockDesignFramesReady();
  }

  function recoverAddressFailure(address: unknown) {
    const preview = options.readPreview();
    if (preview?.projectRoot !== undefined) {
      if (rebuiltSrcdoc.current === preview.srcdoc) return;
      const url = lookupPublishedUrl(preview.projectRoot, address);
      const invalidation = invalidatePublishedRoot(preview.projectRoot, address);
      if (invalidation === undefined || url === undefined) return;
      rebuiltSrcdoc.current = preview.srcdoc;
      notifyUndoGesture("board-address", {
        file: options.file,
        how: "built again after a failed load",
        get why() { return uiMessage("canvas.artboardFrame.aPublishedFileDidNot") + url; },
      });
      if (invalidation === "first") {
        const source = getCurrentPublishedProjectRoot() === undefined
          ? " from where this canvas is published. Artboards are drawn from the editor's own copy of the files instead."
          : " from an older saved version. The artboard is drawn again from the version this page shows now.";
        console.warn("[design] Could not load " + url + source + " Your files are not changed.");
      }
      options.rebuild();
      return;
    }

    const invalidation = invalidateDesignSystemUrl(options.readCompilationAddresses(), address);
    if (invalidation === "first") {
      console.warn(
        "[design] a design system file did not load from " + String(address) +
        ". Artboards that use that design system are shown from the page's own copy; fonts its stylesheets name by relative path will not load until the page is reloaded or shows another version.",
      );
    }
    if (invalidation !== undefined) options.rebuild();
  }

  return function handlePreviewFailure(message: unknown, source: MessageEventSource | null) {
    if (message == null || typeof message !== "object") return false;
    if ("__dc_boot_failed" in message) {
      const failure = message as { e?: unknown; u?: unknown };
      recoverBootFailure(failure.e, failure.u, source);
      return true;
    }
    if (DcAddressRefusedValue in message) {
      recoverAddressFailure((message as { u?: unknown }).u);
      return true;
    }
    return false;
  };
}

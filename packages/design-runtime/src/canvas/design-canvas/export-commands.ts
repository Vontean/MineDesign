import { uiMessage } from "@minedesign/contracts/ui-messages";
import { useCanvasHtmlExport } from "./export-html";
import { Button } from "../../cds/button/button";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { emptyBoardSelection } from "../../editor/selection/canvas-selection";
import { describeExportScope, reportExportDeliveryEvent } from "../../export/analytics";
import { exportSelectionHint, noExportableArtboardsMessage, selectedExportableArtboards } from "../../export/artboard-menu";
import { DownloadsArenTAvailableToYouForMessage, useDownloadsWithheld } from "../../export/downloads";
import { exportBaseFileName, sanitizeExportFileName } from "../../export/file-names";
import { useExportFormats } from "../../export/host-registry";
import { classifyExportAbort, classifyImageDelivery, classifyPdfDelivery } from "../../export/outcomes";
import { needsPagedExport } from "../../export/paper-and-scale";
import { exportPdfWithFeedback } from "../../export/pdf/orchestration";
import { ExportArtboardPickTarget, exportPickerChromeHeight, useExportPicker } from "../../export/picker";
import { designPageId } from "../../platform/file-content";
import { designAnalyticsEvents, healthReporter, reportExportOutcome } from "../../platform/health-and-analytics";
import { fitArtboardHeightToContent } from "./artboards";
import { copyArtboardAsPng, copyArtboardAsSvg } from "./clipboard";
import { captureArtboardPngsForExport, exportArtboardAsPng, exportArtboardSourceZip, producePdfExport, producePngExport, runWithPlayPreviewClosed } from "./export";
import type { Dynamic } from "../../runtime-types";
import type { CanvasArtboard, CanvasManifest } from "../manifest-history";
import type { ExportArtboard } from "../../contracts/export";

type Ref<T> = { current: T };
type Setter<T> = (value: T | ((previous: T) => T)) => void;
type PrintableArtboard = CanvasArtboard & ExportArtboard;
type PageContents = { artboards: PrintableArtboard[] };
interface ExportManifest extends CanvasManifest {
  artboards: PrintableArtboard[];
}

interface ExportArtboardEntry {
  flushPending(): Promise<unknown>;
  isReady(): boolean;
  isBlocked(): boolean;
  previewFrameRef: Ref<HTMLIFrameElement | null>;
}

interface CanvasExportOptions {
  assets: Dynamic;
  doc: Dynamic;
  filePath: string;
  canvasDocumentState: ExportManifest;
  artboardEntriesRef: Ref<Map<string, ExportArtboardEntry>>;
  documentStateRef: Ref<ExportManifest>;
  activePageIdRef: Ref<string>;
  activePageId: Dynamic;
  pagesRef: Ref<NonNullable<CanvasManifest["pages"]>>;
  activePageContents: PageContents;
  activePageContentsRef: Ref<PageContents>;
  fullExportEnabled: boolean;
  captureRules: Dynamic;
  phoneCanvas: boolean;
  embedded: boolean;
  editable: boolean;
  editableRef: Ref<boolean>;
  commenting: boolean;
  fullscreenActiveRef: Ref<boolean>;
  fullscreenFileRef: Ref<string | null>;
  fullscreenView: Dynamic;
  fullscreenViewRef: Ref<Dynamic>;
  setFullscreenView: Setter<Dynamic>;
  playingFile: string | null;
  playingFileRef: Ref<string | null>;
  setPlayingFile: Setter<string | null>;
  setPhoneViewRef: Ref<Dynamic>;
  navigateAfterEdits: Dynamic;
  resetCanvasViewRef: Ref<() => void>;
  exportPickingRef: Ref<boolean>;
  exportChromeHeightRef: Ref<number>;
  restoreCameraRef: Ref<() => void>;
  setCanvasTool: Setter<string>;
  canvasToolRef: Ref<string>;
  bumpToolReset: Setter<number>;
  updateArtboardSettings: Dynamic;
  findHomeFocusElement: (file: string | null) => HTMLElement | null;
  focusedFileRef: Ref<string | null>;
  canvasContainerRef: Ref<HTMLElement | null>;
  selectionRef: Ref<Dynamic>;
  landingFileRef: Ref<Dynamic>;
  cameraController: Dynamic;
  handleFramePick: () => void;
  setSelectedFile: Setter<string | null>;
  setBoardSelection: (selection: typeof emptyBoardSelection, mode: "replace") => void;
  getArtboardTitle: (file: string) => string;
  showToast: (...args: Dynamic[]) => Dynamic;
  hideToast: (id: Dynamic) => void;
  artboardFrameReadyTimeoutMs: number;
  canvasExportSettleTimeoutMs: number;
  emptyCanvasNoteSet: Set<string>;
}

export function useCanvasExportCommands({
  assets,
  doc,
  filePath,
  canvasDocumentState,
  artboardEntriesRef,
  documentStateRef,
  activePageIdRef,
  activePageId,
  pagesRef,
  activePageContents,
  activePageContentsRef,
  fullExportEnabled,
  captureRules,
  phoneCanvas,
  embedded,
  editable,
  editableRef,
  commenting,
  fullscreenActiveRef,
  fullscreenFileRef,
  fullscreenView,
  fullscreenViewRef,
  setFullscreenView,
  playingFile,
  playingFileRef,
  setPlayingFile,
  setPhoneViewRef,
  navigateAfterEdits,
  resetCanvasViewRef,
  exportPickingRef,
  exportChromeHeightRef,
  restoreCameraRef,
  setCanvasTool,
  canvasToolRef,
  bumpToolReset,
  updateArtboardSettings,
  findHomeFocusElement,
  focusedFileRef,
  canvasContainerRef,
  selectionRef,
  landingFileRef,
  cameraController,
  handleFramePick,
  setSelectedFile,
  setBoardSelection,
  getArtboardTitle,
  showToast,
  hideToast,
  artboardFrameReadyTimeoutMs,
  canvasExportSettleTimeoutMs,
  emptyCanvasNoteSet,
}: CanvasExportOptions) {
  const [exporting, setExporting]: Dynamic = React.useState(
    false,
  );
  const exportingRef: Dynamic = React.useRef(false);
  const setExportBusy: Dynamic = React.useCallback(
    (input?: Dynamic): Dynamic => {
      exportingRef.current = input;
      setExporting(input);
    },
    [],
  );
  const downloadsWithheld: Dynamic = useDownloadsWithheld();
  const [mountedExportFiles, setMountedExportFiles]: Dynamic = React.useState(
    emptyCanvasNoteSet,
  );
  React.useEffect((): Dynamic => {
    exporting || setMountedExportFiles(emptyCanvasNoteSet);
  }, [exporting]);
  const waitForExportFrame = React.useCallback(
    async (file: string) => {
      const readyFrame = () => {
        const entry = artboardEntriesRef.current.get(file);
        return entry?.isReady() ? entry.previewFrameRef.current : null;
      };
      const existingFrame = readyFrame();
      if (existingFrame) return existingFrame;
      if (
        !activePageContentsRef.current.artboards.some((artboard) => artboard.file === file) ||
        artboardEntriesRef.current.get(file)?.isBlocked()
      ) return null;
      if (phoneCanvas && !embedded && !fullscreenActiveRef.current &&
          (focusedFileRef.current != null || playingFileRef.current != null)) {
        await setPhoneViewRef.current?.("preview");
        handleFramePick();
        setSelectedFile(null);
        setPlayingFile(null);
      }
      setMountedExportFiles(new Set([file]));
      const startedAt = Date.now();
      while (Date.now() - startedAt < artboardFrameReadyTimeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const frame = readyFrame();
        if (frame) return frame;
        if (artboardEntriesRef.current.get(file)?.isBlocked()) return null;
      }
      return null;
    },
    [phoneCanvas, embedded, handleFramePick],
  );
  const printableArtboards = React.useMemo(
    () => activePageContents.artboards.filter((artboard) => !artboard.frameless),
    [activePageContents],
  );
  const describeScope = React.useCallback((count: number, scope: Dynamic) => {
    const manifest = documentStateRef.current;
    const activePage = activePageIdRef.current;
    const otherPages = pagesRef.current.filter((page) =>
      page.id !== activePage && manifest.artboards.some((artboard) =>
        !artboard.frameless && designPageId(artboard, manifest.pages) === page.id,
      ),
    ).length;
    return describeExportScope(count, scope, {
      printable: activePageContentsRef.current.artboards.filter((artboard) => !artboard.frameless).length,
      otherPages,
    });
  }, []);
  const picker: Dynamic = useExportPicker({
    artboards: printableArtboards,
    enter: (): Dynamic => {
      fullscreenFileRef.current !== null ? restoreCameraRef.current() : setPlayingFile(null);
      canvasToolRef.current !== "select" &&
        (setCanvasTool("select"),
        bumpToolReset((previousView?: Dynamic): Dynamic => previousView + 1));
      const previousCamera: Dynamic = cameraController.get(),
        startingPage: Dynamic = activePageIdRef.current;
      setBoardSelection(emptyBoardSelection, "replace");
      exportChromeHeightRef.current = exportPickerChromeHeight;
      resetCanvasViewRef.current();
      return (): Dynamic => {
        exportChromeHeightRef.current = 0;
        !(activePageIdRef.current !== startingPage || playingFileRef.current !== null) &&
          (fullscreenFileRef.current !== null
            ? setFullscreenView(
                (previousView?: Dynamic): Dynamic =>
                  previousView && {
                    ...previousView,
                    prev: previousCamera,
                  },
              )
            : cameraController.set(previousCamera, true));
      };
    },
    onLapse: (): Dynamic =>
      showToast(
        uiMessage("canvas.designCanvas.noArtboardWasChosenIn"),
      ),
    onStage: reportExportDeliveryEvent,
    homeFocus: (): Dynamic =>
      findHomeFocusElement(focusedFileRef.current) ??
      canvasContainerRef.current?.querySelector(
        "[data-mega-title-text]:not([inert])",
      ) ??
      null,
  });
  const {
      choose: chooseArtboards,
      isUp: isPickerOpen,
      end: endPicking,
      pick: pickArtboards,
      leave: leavePicking,
    }: Dynamic = picker;
  const picking: Dynamic = picker.session !== null;
  exportPickingRef.current = picking;
  const exportBusy: Dynamic = exporting || picking;
  const isExportBusy: Dynamic = React.useCallback(
    (): Dynamic => exportingRef.current || isPickerOpen(),
    [isPickerOpen],
  );
  const withPlayPreviewClosed: Dynamic = React.useCallback(
    (...args: Parameters<typeof runWithPlayPreviewClosed> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => runWithPlayPreviewClosed({
      view: { container: canvasContainerRef, setPlayingFile: setPlayingFile, playingFile: playingFileRef, navigateAfterEdits: navigateAfterEdits, restoreCamera: restoreCameraRef, fullscreenFile: fullscreenFileRef, setFullscreenView: setFullscreenView, fullscreenView: fullscreenViewRef, landingFile: landingFileRef },
      artboards: { entries: artboardEntriesRef, pageContents: activePageContentsRef },
      picker: { isOpen: isPickerOpen, fullExportEnabled: fullExportEnabled },
    }, ...args),
    [navigateAfterEdits, fullExportEnabled, isPickerOpen],
  );
  const selectExportTargets: Dynamic = React.useCallback(
    (input?: Dynamic, options?: Dynamic): Dynamic =>
      pickArtboards(input.files, options === "toggle"),
    [pickArtboards],
  );
  function renderExportTarget(file: string) {
    const artboard = printableArtboards.find((candidate: PrintableArtboard) => candidate.file === file);
    return artboard ? React.createElement(ExportArtboardPickTarget, { artboard, picker }) : null;
  }
  const canPickArtboards: Dynamic = !embedded && !phoneCanvas && !commenting && printableArtboards.length > 1;
  const textEncoding: Dynamic = fullExportEnabled ? "unicode" : "winansi";
  const taggedPdf: Dynamic = fullExportEnabled;
  const leaveExportPicker: Dynamic = React.useCallback((): Dynamic => {
    leavePicking() &&
      showToast(
        uiMessage("canvas.designCanvas.leavingThatViewCancelledThe"),
      );
  }, [leavePicking, showToast]);
  React.useEffect((): Dynamic => {
    leaveExportPicker();
  }, [activePageId, leaveExportPicker]);
  React.useEffect((): Dynamic => {
    if (fullscreenView != null || playingFile != null || commenting) leaveExportPicker();
  }, [fullscreenView, playingFile, commenting, leaveExportPicker]);
  const fitArtboardsToContent: Dynamic = React.useCallback(
    (...args: Parameters<typeof fitArtboardHeightToContent> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => fitArtboardHeightToContent({
      artboards: { getTitle: getArtboardTitle, editable: editableRef, entries: artboardEntriesRef, updateSettings: updateArtboardSettings, manifest: documentStateRef, pageContents: activePageContentsRef },
      capture: { waitForFrame: waitForExportFrame },
      execution: { setBusy: setExportBusy, isBusy: isExportBusy, withPreviewClosed: withPlayPreviewClosed },
      feedback: { hideToast: hideToast, showToast: showToast },
    }, ...args),
    [
      waitForExportFrame,
      isExportBusy,
      hideToast,
      updateArtboardSettings,
      setExportBusy,
      showToast,
      withPlayPreviewClosed,
    ],
  );
  const canFitArtboard: Dynamic = React.useCallback(
    (input?: Dynamic): Dynamic => {
      if (!fullExportEnabled || embedded || !editable) return false;
      const artboard = documentStateRef.current.artboards.find((candidate) => candidate.file === input);
      return artboard !== undefined && needsPagedExport(artboard);
    },
    [editable, fullExportEnabled, embedded],
  );
  const renderFitAction: Dynamic = React.useCallback(
    (
      items?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      keepToastUntilFit: Dynamic = false,
    ): Dynamic => {
      const titleCharacters: Dynamic = [...getArtboardTitle(items[0] ?? "")],
        label: Dynamic =
          items.length > 1
            ? uiMessage("canvas.designCanvas.fit2") + String(items.length) + " frames to content"
            : options
              ? uiMessage("canvas.designCanvas.fit3") +
                (titleCharacters.length > 24
                  ? titleCharacters.slice(0, 23).join("") + "\u2026"
                  : titleCharacters.join("")) +
                '" to content'
              : uiMessage("canvas.designCanvas.fitHeightToContent");
      keepToastUntilFit ||
        (window as Dynamic).setTimeout(
          context,
          canvasExportSettleTimeoutMs,
        );
      return React.createElement(Button, {
        size: "sm",
        "data-testid": "dc-fit-height",
        onClick: () => fitArtboardsToContent(items, context),
      }, label);
    },
    [fitArtboardsToContent],
  );
  const exportArtboardPng: Dynamic = React.useCallback(
    (...args: Parameters<typeof exportArtboardAsPng> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => exportArtboardAsPng({
      capture: { artboardEntries: artboardEntriesRef, waitForFrame: waitForExportFrame, describeScope: describeScope, canFitArtboard: canFitArtboard, renderFitAction: renderFitAction, manifest: canvasDocumentState, rules: captureRules },
      execution: { setExportBusy: setExportBusy, downloadsWithheld: downloadsWithheld, exportBusy: exportBusy },
      feedback: { hideToast: hideToast, showToast: showToast },
    }, ...args),
    [
      downloadsWithheld,
      waitForExportFrame,
      exportBusy,
      canvasDocumentState.artboards,
      captureRules,
      canFitArtboard,
      renderFitAction,
      hideToast,
      describeScope,
      showToast,
    ],
  );
  const copyArtboardPng: Dynamic = React.useCallback(
    (...args: Parameters<typeof copyArtboardAsPng> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => copyArtboardAsPng({
      capture: { artboardEntries: artboardEntriesRef, waitForFrame: waitForExportFrame, canFitArtboard: canFitArtboard, renderFitAction: renderFitAction, pageContents: activePageContentsRef, rules: captureRules },
      execution: { setExportBusy: setExportBusy, downloadsWithheld: downloadsWithheld, isExportBusy: isExportBusy },
      feedback: { hideToast: hideToast, showToast: showToast },
    }, ...args),
    [
      downloadsWithheld,
      waitForExportFrame,
      isExportBusy,
      captureRules,
      canFitArtboard,
      renderFitAction,
      hideToast,
      setExportBusy,
      showToast,
    ],
  );
  const copyArtboardSvg: Dynamic = React.useCallback(
    (...args: Parameters<typeof copyArtboardAsSvg> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => copyArtboardAsSvg({
      capture: { artboardEntries: artboardEntriesRef, waitForFrame: waitForExportFrame, canFitArtboard: canFitArtboard, renderFitAction: renderFitAction, pageContents: activePageContentsRef, rules: captureRules },
      execution: { setExportBusy: setExportBusy, downloadsWithheld: downloadsWithheld, isExportBusy: isExportBusy },
      feedback: { hideToast: hideToast, showToast: showToast },
    }, ...args),
    [
      downloadsWithheld,
      waitForExportFrame,
      isExportBusy,
      captureRules,
      canFitArtboard,
      renderFitAction,
      hideToast,
      setExportBusy,
      showToast,
    ],
  );
  const exportArtboardHtmlZip: Dynamic = React.useCallback(
    (...args: Parameters<typeof exportArtboardSourceZip> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => exportArtboardSourceZip({
      document: { assets: assets, doc: doc, manifest: documentStateRef },
      capture: { artboardEntries: artboardEntriesRef },
      execution: { setExportBusy: setExportBusy, downloadsWithheld: downloadsWithheld, exportBusy: exportBusy },
      feedback: { showToast: showToast },
    }, ...args),
    [assets, doc, downloadsWithheld, exportBusy, showToast],
  );
  const htmlExport = useCanvasHtmlExport({
    assets,
    doc,
    filePath,
    artboards: artboardEntriesRef,
    manifest: documentStateRef,
    activePage: activePageIdRef,
    playPreview: fullscreenFileRef,
    importerReady: fullExportEnabled,
    showToast,
  });
  const exportArtboardPdf: Dynamic = React.useCallback(
    async (input?: Dynamic): Promise<Dynamic> => {
      if (exportBusy) return;
      if (downloadsWithheld) {
        showToast(DownloadsArenTAvailableToYouForMessage);
        return;
      }
      const artboard: Dynamic = canvasDocumentState.artboards.find(
        (candidate?: Dynamic): Dynamic => candidate.file === input,
      );
      if (artboard) {
        setExportBusy(true);
        try {
          const iframe: Dynamic = await waitForExportFrame(input);
          if (!iframe || iframe.getBoundingClientRect().width === 0) {
            showToast(
              artboardEntriesRef.current.get(input)?.isBlocked()
                ? uiMessage("canvas.designCanvas.thisArtboardSPreviewIs")
                : uiMessage("canvas.designCanvas.thisArtboardIsnTVisible"),
            );
            healthReporter.report(
              ...classifyExportAbort("pdf"),
            );
            return;
          }
          let toastId: Dynamic;
          await exportPdfWithFeedback(
            [artboard],
            (): Dynamic => iframe,
            artboard.title ?? exportBaseFileName(input),
            (...toastArgs: Dynamic[]): Dynamic =>
              (toastId = showToast(...toastArgs)),
            {
              rules: captureRules,
              textEncoding,
              tagged: taggedPdf,
              scope: describeScope(1, "one"),
            },
            {
              eligible: canFitArtboard,
              action: (
                files?: Dynamic,
                options?: Dynamic,
                context?: Dynamic,
              ): Dynamic =>
                renderFitAction(
                  files,
                  options,
                  (): Dynamic =>
                    toastId !== undefined && hideToast(toastId),
                  context,
                ),
            },
          );
        } finally {
          setExportBusy(false);
        }
      }
    },
    [
      downloadsWithheld,
      waitForExportFrame,
      exportBusy,
      canvasDocumentState.artboards,
      captureRules,
      canFitArtboard,
      renderFitAction,
      hideToast,
      taggedPdf,
      textEncoding,
      describeScope,
      showToast,
    ],
  );
  const validatePrintableArtboards: Dynamic = React.useCallback(
    (input?: Dynamic, options: Dynamic = 2): Dynamic => {
      const candidates: Dynamic = input
        ? selectedExportableArtboards(
            activePageContentsRef.current.artboards,
            input,
          )
        : printableArtboards;
      if (input && candidates.length < options)
        return {
          ok: false,
          reason:
            options > 1
              ? exportSelectionHint
              : uiMessage("canvas.designCanvas.noneOfTheArtboardsYou"),
          stopped: false,
        };
      if (candidates.length === 0)
        return {
          ok: false,
          reason: noExportableArtboardsMessage,
          stopped: false,
        };
      const blockedArtboard: Dynamic = candidates.find(
        (artboard?: Dynamic): Dynamic =>
          artboardEntriesRef.current.get(artboard.file)?.isBlocked(),
      );
      return blockedArtboard
        ? {
            ok: false,
            reason:
              '"' +
              (blockedArtboard.title ??
                exportBaseFileName(blockedArtboard.file)) +
              '"\u2019s preview is stopped \u2014 reload it before exporting.',
            stopped: true,
          }
        : {
            ok: true,
            printable: candidates,
          };
    },
    [printableArtboards],
  );
  const exportPagePdf: Dynamic = React.useCallback(
    async (input?: Dynamic): Promise<Dynamic> => {
      if (exportBusy) return;
      if (downloadsWithheld) {
        showToast(DownloadsArenTAvailableToYouForMessage);
        return;
      }
      const validation: Dynamic = validatePrintableArtboards(input);
      if (!validation.ok) {
        showToast(validation.reason);
        validation.stopped &&
          healthReporter.report(
            ...classifyExportAbort("pdf"),
          );
        return;
      }
      setExportBusy(true);
      try {
        let toastId: Dynamic;
        await withPlayPreviewClosed(
          validation.printable,
          (): Dynamic =>
            exportPdfWithFeedback(
              validation.printable,
              waitForExportFrame,
              input
                ? (sanitizeExportFileName(
                    document.title,
                    100,
                  ) || "design") + "-selection"
                : document.title || "design",
              (...toastArgs: Dynamic[]): Dynamic =>
                (toastId = showToast(...toastArgs)),
              {
                rules: captureRules,
                textEncoding,
                tagged: taggedPdf,
                scope: describeScope(validation.printable.length, "whole"),
              },
              {
                eligible: canFitArtboard,
                action: (
                  files?: Dynamic,
                  options?: Dynamic,
                  context?: Dynamic,
                ): Dynamic =>
                  renderFitAction(
                    files,
                    options,
                    (): Dynamic =>
                      toastId !== undefined && hideToast(toastId),
                    context,
                  ),
              },
            ),
        );
      } finally {
        setExportBusy(false);
      }
    },
    [
      validatePrintableArtboards,
      downloadsWithheld,
      waitForExportFrame,
      exportBusy,
      captureRules,
      canFitArtboard,
      renderFitAction,
      hideToast,
      taggedPdf,
      textEncoding,
      describeScope,
      showToast,
      withPlayPreviewClosed,
    ],
  );
  const pdfDelivery: Dynamic = React.useRef({
    notes: [],
    refused: false,
  });
  const producePdf: Dynamic = React.useCallback(
    (...args: Parameters<typeof producePdfExport> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => producePdfExport({
      selection: { focusedFile: focusedFileRef, current: selectionRef, fullscreenFile: fullscreenFileRef, printableArtboards: printableArtboards },
      picker: { chooseArtboards: chooseArtboards, endPicking: endPicking, canPickArtboards: canPickArtboards, fullExportEnabled: fullExportEnabled, validatePrintableArtboards: validatePrintableArtboards },
      execution: { exporting: exportingRef, setExportBusy: setExportBusy, isExportBusy: isExportBusy, withPlayPreviewClosed: withPlayPreviewClosed },
      capture: { waitForFrame: waitForExportFrame, describeScope: describeScope, canFitArtboard: canFitArtboard, rules: captureRules, textEncoding: textEncoding, taggedPdf: taggedPdf },
      delivery: { state: pdfDelivery },
      feedback: { showToast: showToast },
    }, ...args),
    [
      validatePrintableArtboards,
      canPickArtboards,
      chooseArtboards,
      endPicking,
      waitForExportFrame,
      isExportBusy,
      captureRules,
      fullExportEnabled,
      canFitArtboard,
      taggedPdf,
      textEncoding,
      printableArtboards,
      describeScope,
      setExportBusy,
      showToast,
      withPlayPreviewClosed,
    ],
  );
  const reportPdfResult: Dynamic = React.useCallback(
    (input?: Dynamic): Dynamic => {
      const { notes, refused }: Dynamic =
        pdfDelivery.current;
      reportExportOutcome(
        classifyPdfDelivery(input, refused),
        designAnalyticsEvents.exported.pdf,
      );
      input.outcome === "delivered" &&
        notes.length > 0 &&
        showToast(
          notes[0],
          undefined,
          notes.length > 1
            ? {
                description: notes.slice(1).join(" "),
              }
            : undefined,
        );
    },
    [showToast],
  );
  const pngDelivery: Dynamic = React.useRef({
    notes: [],
    refused: false,
  });
  const pngBatchRef: Dynamic = React.useRef(null);
  const capturePngs: Dynamic = React.useCallback(
    (...args: Parameters<typeof captureArtboardPngsForExport> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => captureArtboardPngsForExport({
      capture: { artboardEntries: artboardEntriesRef, waitForFrame: waitForExportFrame, describeScope: describeScope, rules: captureRules },
      execution: { setExportBusy: setExportBusy },
      picker: { endPicking: endPicking },
      delivery: { state: pngDelivery },
      feedback: { showToast: showToast },
    }, ...args),
    [endPicking, waitForExportFrame, captureRules, describeScope, setExportBusy, showToast],
  );
  const producePng: Dynamic = React.useCallback(
    (...args: Parameters<typeof producePngExport> extends [unknown, ...infer Rest] ? Rest : never): Dynamic => producePngExport({
      selection: { focusedFile: focusedFileRef, current: selectionRef, fullscreenFile: fullscreenFileRef, printableArtboards: printableArtboards, pageContents: activePageContentsRef },
      picker: { chooseArtboards: chooseArtboards, endPicking: endPicking, canPickArtboards: canPickArtboards },
      execution: { exporting: exportingRef, setExportBusy: setExportBusy, isExportBusy: isExportBusy },
      capture: { getArtboardTitle: getArtboardTitle, artboardEntries: artboardEntriesRef, waitForFrame: waitForExportFrame, describeScope: describeScope, canFitArtboard: canFitArtboard, capturePngs: capturePngs, rules: captureRules },
      delivery: { state: pngDelivery, batch: pngBatchRef },
      feedback: { showToast: showToast },
    }, ...args),
    [
      canPickArtboards,
      chooseArtboards,
      endPicking,
      waitForExportFrame,
      isExportBusy,
      captureRules,
      canFitArtboard,
      printableArtboards,
      capturePngs,
      describeScope,
      setExportBusy,
      showToast,
    ],
  );
  const reportPngResult: Dynamic = React.useCallback(
    (input?: Dynamic): Dynamic => {
      const { notes, refused }: Dynamic =
        pngDelivery.current;
      reportExportOutcome(
        classifyImageDelivery(input, refused),
        designAnalyticsEvents.exported.png,
      );
      input.outcome === "delivered" &&
        notes.length > 0 &&
        showToast(
          notes[0],
          undefined,
          notes.length > 1
            ? {
                description: notes.slice(1).join(" "),
              }
            : undefined,
        );
    },
    [showToast],
  );
  const reportDelivery: Dynamic = React.useCallback(
    (input?: Dynamic): Dynamic =>
      input.format === "pdf"
        ? reportPdfResult(input)
        : input.format === "png"
          ? reportPngResult(input)
          : htmlExport.reportResult(input),
    [htmlExport.reportResult, reportPdfResult, reportPngResult],
  );
  useExportFormats(
    downloadsWithheld
      ? null
      : [
          {
            format: "html",
            produce: htmlExport.produce,
          },
          {
            format: "pdf",
            produce: producePdf,
            interactive: fullExportEnabled && canPickArtboards,
            disabled: printableArtboards.length === 0,
          },
          ...(fullExportEnabled
            ? [
                {
                  format: "png",
                  produce: producePng,
                  interactive: canPickArtboards,
                  bundle: canPickArtboards,
                  disabled:
                    printableArtboards.length === 0 ||
                    (fullscreenView !== null &&
                      !printableArtboards.some(
                        (input?: Dynamic): Dynamic =>
                          input.file === fullscreenView.file,
                      )),
                },
              ]
            : []),
        ],
    {
      onResult: reportDelivery,
    },
  );
  return {
    downloadsWithheld,
    mountedExportFiles,
    printableArtboards,
    picker,
    picking,
    selectExportTargets,
    fitArtboardsToContent,
    canFitArtboard,
    exportArtboardPng,
    copyArtboardPng,
    copyArtboardSvg,
    exportArtboardHtmlZip,
    exportArtboardPdf,
    exportPagePdf,
    renderExportTarget,
  };
}

import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeCdsIndex } from "../cds/index";
import { getArtboardPaperSize, imageCaptureScaleOptions, isFlowExport, paperHeightForWidth, paperSizes } from "./paper-and-scale";
import { getArtboardCaptureMode } from "./warnings";
import { initializePlatformCdsIsland } from "../platform/cds-island";

var exportSelectionHint: Dynamic;
var noExportableArtboardsMessage: Dynamic;
function selectedExportableArtboards(
  artboards?: Dynamic,
  pickedFiles?: Dynamic,
): Dynamic {
  return artboards.filter(
    (artboard?: Dynamic): Dynamic =>
      !artboard.frameless && pickedFiles.has(artboard.file),
  );
}
function artboardExportMenuItems(
  file?: Dynamic,
  artboards?: Dynamic,
  callbacks?: Dynamic,
  pickedFiles: Dynamic = new Set(),
  exportOptions: Dynamic = {},
): Dynamic {
  let value: Dynamic = artboards.find(
    (candidate?: Dynamic): Dynamic => candidate.file === file,
  );
  if (!value || !callbacks.onExportArtboard) return [];
  let onExportArtboard: Dynamic = callbacks.onExportArtboard,
    scaleOptions: Dynamic = imageCaptureScaleOptions(value.w, value.h),
    callback: Dynamic = (scale?: Dynamic): Dynamic => {
      let selectedScale: Dynamic = scaleOptions.find(
        (option?: Dynamic): Dynamic => option.scale === scale,
      );
      return {
        get label() { return (("PNG ") + (String(scale))) + ("\xD7"); },
        get description() { return selectedScale ? (String(selectedScale.outW) + getArtboardCaptureMode(value, exportOptions) === "full"
              ? " px wide, full length"
              : " \xD7 " + String(selectedScale.outH) + " px" + selectedScale.fits ? "" : " \u2014 too large") : (undefined); },
        disabled: selectedScale ? !selectedScale.fits : false,
        onSelect: (): Dynamic => onExportArtboard(file, scale),
      };
    },
    exportableArtboards: Dynamic = artboards.filter(
      (artboard?: Dynamic): Dynamic => !artboard.frameless,
    ),
    length: Dynamic = exportableArtboards.length,
    getPaginationMode: Dynamic = (artboard?: Dynamic): Dynamic =>
      isFlowExport(artboard, exportOptions)
        ? artboard.print === "flow" ||
          artboard.h >
            paperHeightForWidth(
              artboard.w,
              getArtboardPaperSize(artboard),
            )
          ? "pages"
          : "scrolls"
        : "page",
    formatPaperSize: Dynamic = (artboard?: Dynamic): Dynamic =>
      paperSizes[getArtboardPaperSize(artboard)].label +
      " pages",
    items: Dynamic = [callback(1), callback(2)];
  if (callbacks.onExportArtboardPdf) {
    let onExportArtboardPdf: Dynamic = callbacks.onExportArtboardPdf,
      paginationMode: Dynamic = getPaginationMode(value);
    items.push({
      label: "PDF (.pdf)",
      get description() { return paginationMode === "page" ? ("One page at this artboard\u2019s size") : (paginationMode === "pages" ? (("Paginated onto ") + (formatPaperSize(value))) : ((("One page, or ") + (formatPaperSize(value))) + (" if it scrolls"))); },
      onSelect: (): Dynamic => onExportArtboardPdf(file),
    });
  }
  if (callbacks.onExportArtboardHtmlZip) {
    let onExportArtboardHtmlZip: Dynamic = callbacks.onExportArtboardHtmlZip;
    items.push({
      label: "HTML (.zip)",
      get description() { return uiMessage("canvas.artboardMenu.pageItsImagesAndRuntime"); },
      onSelect: (): Dynamic => onExportArtboardHtmlZip(file),
    });
  }
  if (callbacks.onExportAllArtboardsPdf) {
    let onExportAllArtboardsPdf: Dynamic = callbacks.onExportAllArtboardsPdf;
    items.push({
      get label() { return uiMessage("canvas.artboardMenu.allArtboardsPdf"); },
      get description() { return length === 1 ? ((
              {
                page: "1 artboard, one PDF page",
                pages: "1 artboard, paginated onto " + formatPaperSize(exportableArtboards[0]),
                scrolls:
                  "1 artboard: one page, or " +
                  formatPaperSize(exportableArtboards[0]) +
                  " if it scrolls",
              } as Dynamic
            )[getPaginationMode(exportableArtboards[0])]) : (length === 0 ? (undefined) : ("All " + String(length) + " artboards in order of canvas position")); },
      separatorBefore: true,
      disabled: length === 0,
      disabledReason: noExportableArtboardsMessage,
      onSelect: (): Dynamic => onExportAllArtboardsPdf(),
    });
  }
  if (callbacks.onExportSelectedArtboardsPdf) {
    let onExportSelectedArtboardsPdf: Dynamic =
        callbacks.onExportSelectedArtboardsPdf,
      selectedCount: Dynamic = selectedExportableArtboards(
        artboards,
        pickedFiles,
      ).length,
      hasMultipleSelected: Dynamic = selectedCount >= 2;
    items.push({
      get label() { return uiMessage("canvas.artboardMenu.selectedArtboardsPdf"); },
      get description() { return hasMultipleSelected ? ((String(selectedCount)) + (" artboards in order of canvas position")) : (undefined); },
      separatorBefore: !callbacks.onExportAllArtboardsPdf,
      disabled: !hasMultipleSelected,
      disabledReason: exportSelectionHint,
      onSelect: hasMultipleSelected
        ? (): Dynamic => onExportSelectedArtboardsPdf()
        : undefined,
    });
  }
  return items;
}
export {
  artboardExportMenuItems,
  exportSelectionHint,
  noExportableArtboardsMessage,
  selectedExportableArtboards,
};
export function installExportArtboardMenu(): () => void {
  return () => {
    initializeCdsIndex();
    initializePlatformCdsIsland();
    exportSelectionHint = "Select two or more artboards to export only those.";
    noExportableArtboardsMessage =
      "Nothing to export on this page \u2014 loose pieces aren\u2019t pages.";
  };
}

import type { VerticalInterval } from "../contracts/geometry";
/** Restored application module; prepare first, initialize in original order. */

function computePaginationCuts(
  intervals: readonly VerticalInterval[],
  contentHeight: number,
  pageHeight: number,
  maxPages: number,
  overlap: number = 0,
): number[] {
  let pageCuts = [0],
    effectiveOverlap = overlap > 0 && pageHeight - 2 * overlap > 40 ? overlap : 0;
  if (!(pageHeight > 0)) return pageCuts;
  let index = 0;
  for (; pageCuts.length < maxPages; ) {
    let availablePageHeight = pageHeight - (pageCuts.length > 1 ? effectiveOverlap : 0);
    if (!(index + availablePageHeight < contentHeight - 4)) break;
    let candidateCut = index + availablePageHeight - effectiveOverlap,
      cutPosition = candidateCut;
    for (let adjustmentPass = 0; adjustmentPass < 64; adjustmentPass++) {
      let adjustedCut = cutPosition;
      for (let intervalIndex = 0; intervalIndex < intervals.length; intervalIndex++) {
        let blockedInterval = intervals[intervalIndex]!;
        blockedInterval[1] - blockedInterval[0] > pageHeight - 2 * effectiveOverlap ||
          (blockedInterval[0] < cutPosition &&
            cutPosition < blockedInterval[1] &&
            blockedInterval[0] < adjustedCut &&
            (adjustedCut = blockedInterval[0]));
      }
      if (adjustedCut === cutPosition) break;
      if (adjustedCut <= index + 40) {
        cutPosition = candidateCut;
        break;
      }
      cutPosition = adjustedCut;
    }
    pageCuts.push(cutPosition);
    index = cutPosition;
  }
  return pageCuts;
}
export {
  computePaginationCuts,
};
export function installExportCapturePagination(): () => void {
  return () => {};
}

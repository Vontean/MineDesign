import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { designPageId } from "../platform/file-content";

var pluralCanvasObjectCount: Dynamic;
var otherCanvasObjectWord: Dynamic;
function canvasPageDeleteSnapshot(
  manifest?: Dynamic,
  pageId?: Dynamic,
): Dynamic {
  let pages: Dynamic = manifest.pages ?? [],
    pageIndex: Dynamic = pages.findIndex(
      (page?: Dynamic): Dynamic => page.id === pageId,
    );
  if (pageIndex < 0 || pages.length < 2) return null;
  let belongsToPage: Dynamic = (canvasObject?: Dynamic): Dynamic =>
    designPageId(canvasObject, pages) === pageId;
  return {
    spec: pages[pageIndex],
    index: pageIndex,
    files: new Set(
      manifest.artboards
        .filter(belongsToPage)
        .map((artboard?: Dynamic): Dynamic => artboard.file),
    ),
    notes: new Set(
      (manifest.annotations ?? [])
        .filter(belongsToPage)
        .map((note?: Dynamic): Dynamic => note.id),
    ),
  };
}
function remainingCanvasPageObjects(
  manifest?: Dynamic,
  pageId?: Dynamic,
  deletedFiles?: Dynamic,
  deletedNotes?: Dynamic,
): Dynamic {
  let snapshot: Dynamic = canvasPageDeleteSnapshot(manifest, pageId);
  return snapshot
    ? {
        artboards: manifest.artboards.filter(
          (artboard?: Dynamic): Dynamic =>
            snapshot.files.has(artboard.file) && !deletedFiles.has(artboard.file),
        ),
        notes: [...snapshot.notes].filter(
          (noteId?: Dynamic): Dynamic => !deletedNotes.has(noteId),
        ),
      }
    : {
        artboards: [],
        notes: [],
      };
}
function neighboringCanvasPageId(pages?: Dynamic, pageId?: Dynamic): Dynamic {
  let pageIndex: Dynamic = pages.findIndex(
    (page?: Dynamic): Dynamic => page.id === pageId,
  );
  return pageIndex < 0 ? undefined : (pages[pageIndex - 1] ?? pages[pageIndex + 1])?.id;
}
function restoreCanvasPageSpec(pages?: Dynamic, snapshot?: Dynamic): Dynamic {
  let items: Dynamic = [...(pages ?? [])];
  items.some((page?: Dynamic): Dynamic => page.id === snapshot.spec.id) ||
    items.splice(Math.min(snapshot.index, items.length), 0, snapshot.spec);
  return items;
}
function retargetCanvasPageHistory(
  step?: Dynamic,
  pageId?: Dynamic,
): Dynamic {
  if (step.page !== undefined) {
    step.launch?.view === "canvas" &&
      step.launch.page === step.page.spec.id &&
      (step.launch = {
        view: "canvas",
        page: pageId,
      });
    step.page = {
      ...step.page,
      spec: {
        ...step.page.spec,
        id: pageId,
      },
    };
    for (let entry of step.entries as Dynamic)
      entry.spec = {
        ...entry.spec,
        page: pageId,
      };
    for (let annotation of (step.anns ?? []) as Dynamic)
      annotation.spec = {
        ...annotation.spec,
        page: pageId,
      };
  }
}
function assignImplicitFirstCanvasPage(
  objects?: Dynamic,
  pages?: Dynamic,
): Dynamic {
  let firstPageId: Dynamic = pages?.[0]?.id;
  return objects.map(
    (canvasObject?: Dynamic): Dynamic =>
      firstPageId !== undefined &&
      canvasObject.page !== firstPageId &&
      designPageId(canvasObject, pages) === firstPageId
        ? {
            ...canvasObject,
            page: firstPageId,
          }
        : canvasObject,
  );
}
function isCanvasPageMatch(
  matches?: Dynamic,
  pageId?: Dynamic,
  firstPageId?: Dynamic,
): Dynamic {
  return (
    matches(pageId === firstPageId ? "" : pageId) ||
    (pageId !== "" && matches(pageId))
  );
}
function nextCanvasPageName(pages?: Dynamic): Dynamic {
  let pageNumber: Dynamic = pages.length + 1;
  for (
    ;
    pages.some(
      (page?: Dynamic): Dynamic => page.name === uiMessage("canvas.pageOperations.page") + String(pageNumber),
    );

  )
    pageNumber += 1;
  return uiMessage("canvas.pageOperations.page") + String(pageNumber);
}
function canvasPageDeleteConfirmation(
  pageName?: Dynamic,
  artboardCount?: Dynamic,
  noteCount?: Dynamic,
  hasOtherObjects?: Dynamic,
): Dynamic {
  let objectPhrases: Dynamic = [
    artboardCount > 0
      ? pluralCanvasObjectCount(artboardCount, "artboard", "artboards")
      : "",
    noteCount > 0
      ? pluralCanvasObjectCount(
          noteCount,
          uiMessage("canvas.pageOperations.one") + otherCanvasObjectWord(artboardCount > 0) + "object",
          otherCanvasObjectWord(artboardCount > 0) + "objects",
        )
      : "",
  ].filter((phrase?: Dynamic): Dynamic => phrase !== "");
  return {
    get title() { return uiMessage("canvas.pageOperations.deletePage2", { value1: String(pageName) }); },
    message:
      uiMessage("canvas.pageOperations.its") +
      objectPhrases.join(" and ") +
      " will be deleted too. Undo (" +
      hasOtherObjects +
      ") brings " +
      (artboardCount + noteCount === 1 ? "it" : "them") +
      " back until the editor reloads.",
    get confirmLabel() { return uiMessage("canvas.pageOperations.deletePage"); },
    danger: true,
  };
}
export {
  assignImplicitFirstCanvasPage,
  canvasPageDeleteConfirmation,
  canvasPageDeleteSnapshot,
  isCanvasPageMatch,
  neighboringCanvasPageId,
  nextCanvasPageName,
  otherCanvasObjectWord,
  pluralCanvasObjectCount,
  remainingCanvasPageObjects,
  restoreCanvasPageSpec,
  retargetCanvasPageHistory,
};
export function installCanvasPageOperations(): () => void {
  return () => {
    pluralCanvasObjectCount = (
      count?: Dynamic,
      singular?: Dynamic,
      plural?: Dynamic,
    ): Dynamic => (count === 1 ? singular : String(count) + " " + plural);
    otherCanvasObjectWord = (hasPrecedingObjects?: Dynamic): Dynamic =>
      hasPrecedingObjects ? uiMessage("canvas.pageOperations.other") : "";
  };
}

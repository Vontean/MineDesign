/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { SelectionActionsReplace } from "./actions";

var SelectionCanvasSelectionSubscribers: Dynamic;
var SelectionCanvasSelectionCache: Dynamic;
var emptyCanvasSelection: Dynamic;
var emptyBoardSelection: Dynamic;
var boardSelectionCount: Dynamic;
var hasBoardSelection: Dynamic;
var boardSelectionItems: Dynamic;
var isEmptyCanvasSelection: Dynamic;
var canvasBoardSelection: Dynamic;
var canvasElementSelectionCount: Dynamic;
var HostValue: Dynamic;
function toggleBoardSelection(selection?: Dynamic, item?: Dynamic): Dynamic {
  let files: Dynamic = new Set(selection.files),
    notes: Dynamic = new Set(selection.notes),
    [targetSet, targetKey]: Dynamic =
      "file" in item ? [files, item.file] : [notes, item.note];
  targetSet.has(targetKey) ? targetSet.delete(targetKey) : targetSet.add(targetKey);
  return {
    files: files,
    notes: notes,
  };
}
function createCanvasSelection(
  artboards?: Dynamic,
  annotations?: Dynamic,
  elements?: Dynamic,
  primary?: Dynamic,
): Dynamic {
  if (artboards.size === 0 && annotations.size === 0 && elements.size === 0)
    return emptyCanvasSelection;
  let resolvedPrimary: Dynamic =
    primary != null && elements.has(primary)
      ? primary
      : (elements.keys().next().value ?? null);
  return {
    artboards: artboards,
    notes: annotations,
    elements: elements,
    primary: resolvedPrimary,
  };
}
function selectionFromParts(
  artboards?: Dynamic,
  notes?: Dynamic,
  elements?: Dynamic,
  primary?: Dynamic,
): Dynamic {
  return createCanvasSelection(artboards, notes, elements, primary);
}
function selectionFromBoards(boards?: Dynamic): Dynamic {
  return createCanvasSelection(
    boards.files,
    boards.notes,
    SelectionCanvasSelectionCache,
    null,
  );
}
function selectionFromArtboards(artboards?: Dynamic): Dynamic {
  return selectionFromBoards({
    files: artboards,
    notes: SelectionCanvasSelectionSubscribers,
  });
}
function toggleCanvasSelection(selection?: Dynamic, boards?: Dynamic): Dynamic {
  let boardSelection: Dynamic = canvasBoardSelection(selection);
  for (let file of boards.files as Dynamic)
    boardSelection = toggleBoardSelection(boardSelection, {
      file: file,
    });
  for (let note of boards.notes as Dynamic)
    boardSelection = toggleBoardSelection(boardSelection, {
      note: note,
    });
  let elements: Dynamic = selection.elements;
  for (let file of boardSelection.files as Dynamic)
    if (!selection.artboards.has(file) && elements.has(file)) {
      let entries: Dynamic = new Map(elements);
      entries.delete(file);
      elements = entries;
    }
  return createCanvasSelection(
    boardSelection.files,
    boardSelection.notes,
    elements,
    selection.primary,
  );
}
function selectionFromElements(file?: Dynamic, entry?: Dynamic): Dynamic {
  return createCanvasSelection(
    SelectionCanvasSelectionSubscribers,
    SelectionCanvasSelectionSubscribers,
    new Map([[file, entry]]),
    file,
  );
}
function promoteToArtboardSelection(
  selection?: Dynamic,
  file?: Dynamic,
): Dynamic {
  if (selection.artboards.has(file) && !selection.elements.has(file))
    return selection;
  let artboards: Dynamic = selection.artboards.has(file)
      ? selection.artboards
      : new Set([...selection.artboards, file]),
    elements: Dynamic = selection.elements;
  if (elements.has(file)) {
    let entries: Dynamic = new Map(elements);
    entries.delete(file);
    elements = entries;
  }
  return createCanvasSelection(artboards, selection.notes, elements, selection.primary);
}
function setCanvasElementSelection(
  selection?: Dynamic,
  file?: Dynamic,
  entry?: Dynamic,
  isAdditive?: Dynamic,
): Dynamic {
  if (!isAdditive)
    return entry == null
      ? emptyCanvasSelection
      : selectionFromElements(file, entry);
  if (
    entry != null &&
    shouldPromoteElementSelection(selection, file, entry.tids)
  )
    return promoteToArtboardSelection(selection, file);
  let entries: Dynamic = new Map(selection.elements);
  entry == null ? entries.delete(file) : entries.set(file, entry);
  return createCanvasSelection(
    selection.artboards,
    selection.notes,
    entries,
    entry != null ? file : selection.primary,
  );
}
function toggleCanvasElementIds(
  selection?: Dynamic,
  file?: Dynamic,
  tids?: Dynamic,
  entryInfo?: Dynamic,
): Dynamic {
  let entry: Dynamic = selection.elements.get(file),
    nextTids: Dynamic = entry
      ? entry.tids.filter(
          (tid?: Dynamic): Dynamic => !tids.includes(tid),
        )
      : [];
  for (let tid of tids as Dynamic)
    (!entry || !entry.tids.includes(tid)) && nextTids.push(tid);
  return updateCanvasElementSelection(selection, file, nextTids, entryInfo);
}
function shouldPromoteElementSelection(
  selection?: Dynamic,
  file?: Dynamic,
  tids?: Dynamic,
): Dynamic {
  let currentTids: Dynamic = selection.elements.get(file)?.tids ?? [];
  return (
    selection.artboards.size > 0 &&
    tids.some((tid?: Dynamic): Dynamic => !currentTids.includes(tid))
  );
}
function updateCanvasElementSelection(
  selection?: Dynamic,
  file?: Dynamic,
  items?: Dynamic,
  entryInfo?: Dynamic,
): Dynamic {
  if (shouldPromoteElementSelection(selection, file, items))
    return promoteToArtboardSelection(selection, file);
  let entries: Dynamic = new Map(selection.elements);
  items.length === 0
    ? entries.delete(file)
    : entries.set(file, {
        name: entryInfo.name,
        tids: [...items],
        rect: entryInfo.rect ?? null,
        count: items.length,
      });
  return createCanvasSelection(
    selection.artboards,
    selection.notes,
    entries,
    items.length > 0 ? file : selection.primary,
  );
}
function mergeCanvasSelection(
  selection?: Dynamic,
  incoming?: Dynamic,
  isToggle?: Dynamic,
): Dynamic {
  let artboards: Dynamic,
    notes: Dynamic,
    entries: Dynamic = new Map();
  if (isToggle) {
    let boardSelection: Dynamic = canvasBoardSelection(selection);
    for (let file of incoming.files as Dynamic)
      boardSelection = toggleBoardSelection(boardSelection, {
        file: file,
      });
    for (let note of incoming.notes as Dynamic)
      boardSelection = toggleBoardSelection(boardSelection, {
        note: note,
      });
    artboards = new Set(boardSelection.files);
    notes = new Set(boardSelection.notes);
    for (let [file, currentEntry] of selection.elements as Dynamic) {
      let incomingTids: Dynamic = incoming.elements.get(file)?.tids ?? [],
        mergedTids: Dynamic = [
          ...currentEntry.tids.filter(
            (tid?: Dynamic): Dynamic => !incomingTids.includes(tid),
          ),
          ...incomingTids.filter(
            (tid?: Dynamic): Dynamic => !currentEntry.tids.includes(tid),
          ),
        ];
      mergedTids.length > 0 &&
        entries.set(file, {
          name: currentEntry.name,
          tids: mergedTids,
          rect: null,
          count: mergedTids.length,
        });
    }
    for (let [file, incomingEntry] of incoming.elements as Dynamic)
      !selection.elements.has(file) &&
        incomingEntry.tids.length > 0 &&
        entries.set(file, {
          name: incomingEntry.name,
          tids: [...incomingEntry.tids],
          rect: null,
          count: incomingEntry.tids.length,
        });
  } else {
    artboards = new Set(incoming.files);
    notes = new Set(incoming.notes);
    for (let [file, incomingEntry] of incoming.elements as Dynamic)
      incomingEntry.tids.length > 0 &&
        entries.set(file, {
          name: incomingEntry.name,
          tids: [...incomingEntry.tids],
          rect: null,
          count: incomingEntry.tids.length,
        });
  }
  if (artboards.size > 0)
    for (let [file, entry] of entries as Dynamic) {
      let previousTids: Dynamic = isToggle
        ? (selection.elements.get(file)?.tids ?? [])
        : [];
      (entry.tids.some(
        (tid?: Dynamic): Dynamic => !previousTids.includes(tid),
      ) ||
        artboards.has(file)) &&
        (entries.delete(file), artboards.add(file));
    }
  return createCanvasSelection(artboards, notes, entries, selection.primary);
}
function filterSelectedArtboards(
  selection?: Dynamic,
  shouldKeep?: Dynamic,
): Dynamic {
  let keptArtboards: Dynamic = new Set([...selection.artboards].filter(shouldKeep)),
    keptEntries: Dynamic = new Map(
      [...selection.elements].filter(
        ([file]: Dynamic): Dynamic => shouldKeep(file),
      ),
    );
  return keptArtboards.size === selection.artboards.size &&
    keptEntries.size === selection.elements.size
    ? selection
    : createCanvasSelection(keptArtboards, selection.notes, keptEntries, selection.primary);
}
function replaceSelectedElements(
  selection?: Dynamic,
  elements?: Dynamic,
  primary?: Dynamic,
): Dynamic {
  return createCanvasSelection(
    selection.artboards,
    selection.notes,
    elements,
    primary,
  );
}
function filterSelectedElements(selection?: Dynamic, shouldKeep?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(
    [...selection.elements].filter(
      ([file]: Dynamic): Dynamic => shouldKeep(file),
    ),
  );
  return entries.size === selection.elements.size
    ? selection
    : createCanvasSelection(
        selection.artboards,
        selection.notes,
        entries,
        selection.primary,
      );
}
function synchronizeSelectedElementIds(
  selection?: Dynamic,
  file?: Dynamic,
  resolveTids?: Dynamic,
): Dynamic {
  let entry: Dynamic = selection.elements.get(file);
  if (
    !entry ||
    (entry.name != null &&
      entry.name !== SelectionActionsReplace(file))
  )
    return selection;
  let liveTids: Dynamic =
    entry.name == null
      ? []
      : resolveTids(entry.tids).filter(
          (tid?: Dynamic): Dynamic => tid != null,
        );
  if (liveTids.length === 0)
    return filterSelectedElements(
      selection,
      (candidate?: Dynamic): Dynamic => candidate !== file,
    );
  if (
    liveTids.length === entry.tids.length &&
    liveTids.every(
      (tid?: Dynamic, index?: Dynamic): Dynamic =>
        tid === entry.tids[index],
    )
  )
    return selection;
  let entries: Dynamic = new Map(selection.elements);
  entries.set(file, {
    ...entry,
    tids: liveTids,
    rect: null,
    count: liveTids.length === entry.tids.length ? entry.count : liveTids.length,
  });
  return createCanvasSelection(
    selection.artboards,
    selection.notes,
    entries,
    selection.primary,
  );
}
function reconcileSelectedElementIds(
  selection?: Dynamic,
  file?: Dynamic,
  resolveTids?: Dynamic,
  previousFile?: Dynamic,
): Dynamic {
  let synced: Dynamic = synchronizeSelectedElementIds(
      selection,
      file,
      resolveTids ?? ((): Dynamic => []),
    ),
    entry: Dynamic = synced.elements.get(file),
    isCurrent: Dynamic =
      entry != null &&
      entry.name === SelectionActionsReplace(file);
  return {
    next: synced,
    tell:
      !isCurrent || (synced === selection && file === previousFile) ? null : entry.tids,
  };
}
function filterSelectedAnnotations(
  selection?: Dynamic,
  shouldKeep?: Dynamic,
): Dynamic {
  let values: Dynamic = new Set([...selection.notes].filter(shouldKeep));
  return values.size === selection.notes.size
    ? selection
    : createCanvasSelection(
        selection.artboards,
        values,
        selection.elements,
        selection.primary,
      );
}
function clearSelectedBoards(selection?: Dynamic): Dynamic {
  return selection.artboards.size === 0 && selection.notes.size === 0
    ? selection
    : createCanvasSelection(
        SelectionCanvasSelectionSubscribers,
        SelectionCanvasSelectionSubscribers,
        selection.elements,
        selection.primary,
      );
}
function applyHostSelectionResponse(
  selection?: Dynamic,
  file?: Dynamic,
  response?: Dynamic,
): Dynamic {
  let { entry: entry }: Dynamic = response;
  if (response.re != null && response.re.startsWith(HostValue)) {
    if (
      entry == null ||
      !selection.elements.has(file) ||
      shouldPromoteElementSelection(selection, file, entry.tids)
    )
      return {
        kind: "confirm",
      };
    let entries: Dynamic = new Map(selection.elements);
    entries.set(file, entry);
    return {
      kind: "apply",
      next: createCanvasSelection(
        selection.artboards,
        selection.notes,
        entries,
        file,
      ),
    };
  }
  return response.additive
    ? entry != null &&
      shouldPromoteElementSelection(selection, file, entry.tids)
      ? {
          kind: "apply",
          next: promoteToArtboardSelection(selection, file),
          pushback: "clear",
        }
      : {
          kind: "apply",
          next: setCanvasElementSelection(selection, file, entry, true),
        }
    : {
        kind: "apply",
        next: setCanvasElementSelection(selection, file, entry, false),
      };
}
export {
  applyHostSelectionResponse,
  boardSelectionCount,
  boardSelectionItems,
  canvasBoardSelection,
  canvasElementSelectionCount,
  clearSelectedBoards,
  createCanvasSelection,
  emptyBoardSelection,
  emptyCanvasSelection,
  filterSelectedAnnotations,
  filterSelectedArtboards,
  filterSelectedElements,
  hasBoardSelection,
  HostValue,
  isEmptyCanvasSelection,
  mergeCanvasSelection,
  promoteToArtboardSelection,
  reconcileSelectedElementIds,
  replaceSelectedElements,
  SelectionCanvasSelectionCache,
  SelectionCanvasSelectionSubscribers,
  selectionFromArtboards,
  selectionFromBoards,
  selectionFromElements,
  selectionFromParts,
  setCanvasElementSelection,
  shouldPromoteElementSelection,
  synchronizeSelectedElementIds,
  toggleBoardSelection,
  toggleCanvasElementIds,
  toggleCanvasSelection,
  updateCanvasElementSelection,
};
export function installEditorSelectionCanvasSelection(): () => void {
  return () => {
    SelectionCanvasSelectionSubscribers = new Set();
    SelectionCanvasSelectionCache = new Map();
    emptyCanvasSelection = {
      artboards: SelectionCanvasSelectionSubscribers,
      notes: SelectionCanvasSelectionSubscribers,
      elements: SelectionCanvasSelectionCache,
      primary: null,
    };
    emptyBoardSelection = {
      files: SelectionCanvasSelectionSubscribers,
      notes: SelectionCanvasSelectionSubscribers,
    };
    boardSelectionCount = (boards?: Dynamic): Dynamic =>
      boards.files.size + boards.notes.size;
    hasBoardSelection = (boards?: Dynamic, item?: Dynamic): Dynamic =>
      "file" in item
        ? boards.files.has(item.file)
        : boards.notes.has(item.note);
    boardSelectionItems = (item?: Dynamic): Dynamic =>
      "file" in item
        ? {
            files: new Set([item.file]),
            notes: SelectionCanvasSelectionSubscribers,
          }
        : {
            files: SelectionCanvasSelectionSubscribers,
            notes: new Set([item.note]),
          };
    isEmptyCanvasSelection = (selection?: Dynamic): Dynamic =>
      selection.artboards.size === 0 &&
      selection.notes.size === 0 &&
      selection.elements.size === 0;
    canvasBoardSelection = (selection?: Dynamic): Dynamic => ({
      files: selection.artboards,
      notes: selection.notes,
    });
    canvasElementSelectionCount = (selection?: Dynamic): Dynamic =>
      selection.elements.size === 0 && selection.artboards.size + selection.notes.size > 0;
    HostValue = "host:";
  };
}

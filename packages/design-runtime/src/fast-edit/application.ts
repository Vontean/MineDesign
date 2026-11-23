/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { artboardRectanglesOverlap, findAvailableArtboardPosition, sanitizeArtboardTitle } from "./artboard-operations";
import { artboardRectangle, distanceBetweenArtboards } from "./session";

function resolveCommentPinPosition(
  pin?: Dynamic,
  boards?: Dynamic,
  file?: Dynamic,
): Dynamic {
  let rectangles: Dynamic = boards.map(artboardRectangle),
    target: Dynamic =
      rectangles[
        boards.findIndex((input?: Dynamic): Dynamic => input.file === file)
      ],
    placement: Dynamic = findAvailableArtboardPosition(
      {
        x: Math.round(pin.x),
        y: Math.round(pin.y),
        w: target.w,
        h: target.h,
      },
      rectangles,
      target,
    );
  return {
    x: placement.x,
    y: placement.y,
    atPin: placement.moved === "",
  };
}
function prepareFastEditArtboardChanges(
  operations?: Dynamic,
  boards?: Dynamic,
  targetFile?: Dynamic,
  boardByFile?: Dynamic,
  allowDistant: Dynamic = false,
  pin?: Dynamic,
): Dynamic {
  let placements: Dynamic = new Map();
  for (let board of boards as Dynamic) {
    if (operations.deletes.includes(board.file)) continue;
    let requestedPlacement: Dynamic = operations.places.get(board.file);
    placements.set(board.file, {
      x: requestedPlacement?.x ?? board.x,
      y: requestedPlacement?.y ?? board.y,
      w: requestedPlacement?.w ?? board.w,
      h: requestedPlacement?.h ?? board.h,
    });
  }
  let reference: Dynamic =
      placements.get(targetFile) ??
      (boardByFile.has(targetFile)
        ? artboardRectangle(boardByFile.get(targetFile))
        : pin),
    movedFiles: Dynamic = [...operations.places]
      .filter(
        ([input, placement]: Dynamic): Dynamic =>
          input !== targetFile &&
          (placement.x !== undefined || placement.y !== undefined) &&
          placements.has(input),
      )
      .map(([input]: Dynamic): Dynamic => input),
    occupied: Dynamic = [...placements]
      .filter(([input]: Dynamic): Dynamic => !movedFiles.includes(input))
      .map(([, input]: Dynamic): Dynamic => input),
    moveOffset: Dynamic = null;
  for (let file of movedFiles as Dynamic) {
    let requestedRect: Dynamic = placements.get(file),
      isUnoccupied: Dynamic = (input?: Dynamic): Dynamic =>
        !occupied.some(
          (occupiedRect?: Dynamic): Dynamic =>
            artboardRectanglesOverlap(input, occupiedRect),
        ),
      position: Dynamic = {
        x: requestedRect.x,
        y: requestedRect.y,
      };
    if (!isUnoccupied(requestedRect)) {
      let offsetRect: Dynamic =
        moveOffset !== null
          ? {
              ...requestedRect,
              x: requestedRect.x + moveOffset.dx,
              y: requestedRect.y + moveOffset.dy,
            }
          : null;
      if (offsetRect !== null && isUnoccupied(offsetRect))
        position = {
          x: offsetRect.x,
          y: offsetRect.y,
        };
      else {
        let availablePosition: Dynamic = findAvailableArtboardPosition(
          requestedRect,
          occupied,
          reference,
        );
        position = {
          x: availablePosition.x,
          y: availablePosition.y,
        };
        moveOffset === null &&
          availablePosition.moved !== "" &&
          (moveOffset = {
            dx: availablePosition.x - requestedRect.x,
            dy: availablePosition.y - requestedRect.y,
          });
      }
      operations.places.set(file, {
        ...operations.places.get(file),
        x: position.x,
        y: position.y,
      });
    }
    let placedRect: Dynamic = {
      ...requestedRect,
      x: position.x,
      y: position.y,
    };
    placements.set(file, placedRect);
    occupied.push(placedRect);
  }
  for (let [file, placement] of [...operations.places] as Dynamic) {
    let originalBoard: Dynamic = boardByFile.get(file);
    originalBoard !== undefined &&
      (placement.x ?? originalBoard.x) === originalBoard.x &&
      (placement.y ?? originalBoard.y) === originalBoard.y &&
      (placement.w ?? originalBoard.w) === originalBoard.w &&
      (placement.h ?? originalBoard.h) === originalBoard.h &&
      operations.places.delete(file);
  }
  let allRectangles: Dynamic = [...placements.values()],
    addOffset: Dynamic = null;
  for (let addition of operations.adds as Dynamic) {
    let tooDistant: Dynamic =
        !allowDistant &&
        addition.x !== undefined &&
        addition.y !== undefined &&
        allRectangles.length > 0 &&
        Math.min(
          ...allRectangles.map(
            (input?: Dynamic): Dynamic =>
              distanceBetweenArtboards(
                {
                  x: addition.x,
                  y: addition.y,
                  w: addition.w,
                  h: addition.h,
                },
                input,
              ),
          ),
        ) > 480,
      offsetRect: Dynamic =
        addOffset !== null && addition.x !== undefined && addition.y !== undefined
          ? {
              x: addition.x + addOffset.dx,
              y: addition.y + addOffset.dy,
              w: addition.w,
              h: addition.h,
            }
          : null,
      availablePosition: Dynamic =
        offsetRect !== null &&
        !allRectangles.some(
          (input?: Dynamic): Dynamic =>
            artboardRectanglesOverlap(offsetRect, input),
        )
          ? {
              x: offsetRect.x,
              y: offsetRect.y,
              moved: "below",
            }
          : findAvailableArtboardPosition(
              {
                ...(addition.x !== undefined && addition.y !== undefined && !tooDistant
                  ? {
                      x: addition.x,
                      y: addition.y,
                    }
                  : {}),
                w: addition.w,
                h: addition.h,
              },
              allRectangles,
              reference,
            );
    addOffset === null &&
      addition.x !== undefined &&
      addition.y !== undefined &&
      (tooDistant || availablePosition.moved !== "") &&
      (addOffset = {
        dx: availablePosition.x - addition.x,
        dy: availablePosition.y - addition.y,
      });
    addition.x = availablePosition.x;
    addition.y = availablePosition.y;
    allRectangles.push({
      x: availablePosition.x,
      y: availablePosition.y,
      w: addition.w,
      h: addition.h,
    });
  }
  let duplicatePositions: Dynamic = [];
  for (let duplication of operations.duplicates as Dynamic) {
    let sourceBoard: Dynamic =
      placements.get(duplication.file) ?? boardByFile.get(duplication.file);
    if (sourceBoard === undefined) {
      duplicatePositions.push({
        x: Number.NaN,
        y: Number.NaN,
      });
      continue;
    }
    let availablePosition: Dynamic = findAvailableArtboardPosition(
      {
        ...(duplication.x !== undefined && duplication.y !== undefined
          ? {
              x: duplication.x,
              y: duplication.y,
            }
          : {}),
        w: sourceBoard.w,
        h: sourceBoard.h,
      },
      allRectangles,
      reference,
    );
    duplicatePositions.push({
      x: availablePosition.x,
      y: availablePosition.y,
    });
    allRectangles.push({
      x: availablePosition.x,
      y: availablePosition.y,
      w: sourceBoard.w,
      h: sourceBoard.h,
    });
  }
  return duplicatePositions;
}
async function commitFastEditArtboardChanges(
  operations?: Dynamic,
  canvas?: Dynamic,
  editSessionsByFile?: Dynamic,
  boardByFile?: Dynamic,
  duplicateOptions?: Dynamic,
  requestControl?: Dynamic,
  commitPins?: Dynamic,
): Promise<Dynamic> {
  let renames: Dynamic = [...operations.renames].filter(
      ([input, title]: Dynamic): Dynamic =>
        sanitizeArtboardTitle(title) !== "" &&
        boardByFile.get(input) !== undefined,
    ),
    operationKinds: Dynamic = [
      operations.places.size > 0 ? "place" : "",
      ...renames.map(
        (input?: Dynamic, renameIndex?: Dynamic): Dynamic =>
          "rename" + String(renameIndex),
      ),
      operations.adds.length > 0 ? "add" : "",
      operations.duplicates.length > 0 ? "duplicate" : "",
    ].filter((input?: Dynamic): Dynamic => input !== ""),
    combinedOperationKind: Dynamic =
      operations.templates.size > 0 && operationKinds.length > 0
        ? operationKinds[operationKinds.length - 1]
        : "",
    token: Dynamic =
      combinedOperationKind === "" ? undefined : canvas.token(),
    tokenForOperation: Dynamic = (input?: Dynamic): Dynamic =>
      input === combinedOperationKind ? token : undefined,
    combinedOperationApplied: Dynamic = false,
    recordCombinedOperation: Dynamic = (input?: Dynamic, applied?: Dynamic): Dynamic => {
      applied && input === combinedOperationKind && (combinedOperationApplied = true);
    },
    movedFiles: Dynamic =
      operations.places.size > 0
        ? canvas.place(
            [...operations.places].map(
              ([input, placement]: Dynamic): Dynamic => ({
                file: input,
                ...placement,
              }),
            ),
            tokenForOperation("place"),
          )
        : [];
  recordCombinedOperation("place", movedFiles.length > 0);
  let renamedFiles: Dynamic = [];
  renames.forEach(([input, title]: Dynamic, renameIndex?: Dynamic): Dynamic => {
    let renamed: Dynamic = canvas.rename(
      input,
      title,
      tokenForOperation("rename" + String(renameIndex)),
    );
    renamed && renamedFiles.push(input);
    recordCombinedOperation("rename" + String(renameIndex), renamed);
  });
  let addedFiles: Dynamic =
    operations.adds.length > 0
      ? await canvas.add(
          operations.adds.map(
            ({ id: id, ...props }: Dynamic): Dynamic => props,
          ),
          tokenForOperation("add"),
        )
      : [];
  recordCombinedOperation("add", addedFiles.length > 0);
  let copiedFiles: Dynamic =
    operations.duplicates.length > 0
      ? await canvas.duplicate(
          operations.duplicates.map(
            ({ file: file, title: title }: Dynamic): Dynamic => ({
              file: file,
              ...(title !== undefined
                ? {
                    title: title,
                  }
                : {}),
            }),
          ),
          tokenForOperation("duplicate"),
          duplicateOptions,
        )
      : [];
  recordCombinedOperation("duplicate", copiedFiles.length > 0);
  let appliedTemplates: Dynamic = [],
    staleTemplates: Dynamic = [];
  if (operations.templates.size > 0 && !requestControl.aborted) {
    let historyGroup: Dynamic = canvas.group(
      operations.templates.keys(),
      combinedOperationApplied ? token : undefined,
    );
    try {
      for (let [file, template] of operations.templates as Dynamic) {
        let commitResult: Dynamic = await (editSessionsByFile
          .get(file)
          ?.askCommit(template, commitPins?.get(file))
          .catch((): Dynamic => "failed") ?? "stale");
        historyGroup?.settled(file);
        commitResult === "applied"
          ? appliedTemplates.push(file)
          : commitResult === "stale" && staleTemplates.push(file);
      }
    } finally {
      historyGroup?.end();
    }
  }
  let removedFiles: Dynamic = [];
  if (operations.deletes.length > 0 && !requestControl.aborted) {
    let filesToRemove: Dynamic = operations.deletes.filter(
        (input?: Dynamic): Dynamic => boardByFile.has(input),
      ),
      previousFiles: Dynamic = canvas
        .boards()
        .map((input?: Dynamic): Dynamic => input.file),
      removedCount: Dynamic = filesToRemove.length === 0 ? 0 : await canvas.remove(filesToRemove);
    if (removedCount > 0) {
      let remainingFilesSet: Dynamic = new Set(
        canvas.boards().map((input?: Dynamic): Dynamic => input.file),
      );
      removedFiles = filesToRemove.filter(
        (input?: Dynamic): Dynamic => !remainingFilesSet.has(input),
      );
    }
    let unremovedFiles: Dynamic = previousFiles.filter(
      (input?: Dynamic): Dynamic => !filesToRemove.includes(input),
    );
    if (
      removedCount > 0 &&
      filesToRemove.includes(operations.asked) &&
      unremovedFiles.length > 0
    ) {
      let previousFocusIndex: Dynamic = previousFiles.indexOf(operations.asked);
      canvas.focus(
        unremovedFiles.find(
          (input?: Dynamic): Dynamic => previousFiles.indexOf(input) > previousFocusIndex,
        ) ?? unremovedFiles[unremovedFiles.length - 1],
      );
    }
  }
  let canvasOperationCount: Dynamic =
      movedFiles.length +
      renamedFiles.length +
      addedFiles.length +
      copiedFiles.length +
      removedFiles.length,
    historyRecordCount: Dynamic =
      (movedFiles.length > 0 ? 1 : 0) +
      renamedFiles.length +
      (addedFiles.length > 0 ? 1 : 0) +
      (copiedFiles.length > 0 ? 1 : 0) +
      (appliedTemplates.length > 0 && !combinedOperationApplied ? 1 : 0) +
      (removedFiles.length > 0 ? 1 : 0),
    historyPushCount: Dynamic =
      historyRecordCount - (appliedTemplates.length > 0 && !combinedOperationApplied ? 1 : 0) + appliedTemplates.length;
  return {
    nothingLanded: appliedTemplates.length === 0 && canvasOperationCount === 0,
    canvasOps: canvasOperationCount,
    records: historyRecordCount,
    pushes: historyPushCount,
    moved: movedFiles,
    renamed: renamedFiles,
    added: addedFiles,
    copied: copiedFiles,
    removed: removedFiles,
    landed: appliedTemplates,
    stale: staleTemplates,
  };
}
export {
  commitFastEditArtboardChanges,
  prepareFastEditArtboardChanges,
  resolveCommentPinPosition,
};
export function installFastEditApplication(): () => void {
  return () => {};
}

import type * as M from "../contracts/design-system-document";
import type * as F from "../contracts/files-core";
import { projectFilePath, projectFilesForSave, relativeProjectFilePath } from "../editor/files-index";
import { mergeValuesEqual } from "../editor/index-file-store";
import { isHeldFilePointer, isTextFilePath } from "../model/file-policy";
import { HOT_CARRY_MAX_INLINE_CHARS, snapshotDesignSystemView } from "./carry";
import type { createCarryStorage } from "./carry-storage";
import { HOT_CARRY_PROTOCOL_FIELD, indexWithoutTitleAndDocs } from "./index-conflicts";
import { isTokenFilePath } from "./token-merge";

interface HotCarrySnapshotContext {
  document: M.BaseFilesDocument;
  documentOptions: Pick<M.DesignSystemFilesDocumentOptions, "snapshotView">;
  flags: Map<string, M.DocumentFlag>;
  flaggedPaths: Set<string>;
  readTexts: Map<string, string>;
  readShas: Map<string, string>;
  preReadBases: Map<string, M.PreReadBase>;
  materializedFingerprints: Map<string, string>;
  textIsLocallyHeld(filePath: string, textKey: string): boolean;
  textFingerprint(text: string): string;
  stashOversizedCarry: ReturnType<typeof createCarryStorage>["stashOversizedCarry"];
}

/** Capture pending edits and hand off the save queue during a hot reload. */
export function snapshotHotCarry(context: HotCarrySnapshotContext, carryInput?: { handoff?: boolean }): M.HotCarrySnapshot {
  const { document, documentOptions, flags, flaggedPaths, readTexts, readShas, preReadBases,
    materializedFingerprints, textIsLocallyHeld, textFingerprint, stashOversizedCarry } = context;
  function unsavedTextPaths(): string[] {
    if (document.loadState() !== "live" || document.readOnly()) {
      return [];
    }
    let items = [];
    for (let [value, fileText] of projectFilesForSave(
      document.content().files,
    ) as Map<string, string>) {
      let relativePath: string = relativeProjectFilePath(value)!;
      if (
        flags.has(relativePath) ||
        !isTextFilePath(relativePath) ||
        readTexts.get(value) === fileText ||
        textIsLocallyHeld(value, relativePath) ||
        preReadBases.get(value)?.text === fileText
      ) {
        continue;
      }
      items.push(relativePath);
    }
    return items;
  }
  function unsavedRemovedFiles(): Record<string, string | null> {
    let state: Record<string, string | null> = {};
    if (document.loadState() !== "live" || document.readOnly()) {
      return state;
    }
    let files = document.content().files;
    for (let value of new Set([...readTexts.keys(), ...readShas.keys()])) {
      let relativePath: string | undefined = relativeProjectFilePath(
          value,
        ),
        entry = preReadBases.get(value);
      if (
        relativePath !== undefined &&
        !Object.hasOwn(files, relativePath) &&
        !flags.has(relativePath) &&
        !textIsLocallyHeld(value, relativePath) &&
        entry?.sha !== null
      ) {
        state[relativePath] = entry?.sha ?? readShas.get(value) ?? null;
      }
    }
    return state;
  }
  function unsavedBinaryPaths(): string[] {
    let items: string[] = [];
    if (document.loadState() !== "live" || document.readOnly()) {
      return items;
    }
    for (let [value, fileText] of projectFilesForSave(
      document.content().files,
    ) as Map<string, string>) {
      let relativePath: string = relativeProjectFilePath(value)!;
      if (
        isTextFilePath(relativePath) ||
        flags.has(relativePath) ||
        textIsLocallyHeld(value, relativePath)
      ) {
        continue;
      }
      if (
        isHeldFilePointer(relativePath, fileText)
          ? !readShas.has(value)
          : readTexts.get(value) !== fileText
      ) {
        items.push(relativePath);
      }
    }
    return items;
  }
  function snapshot(carryInput?: {
    handoff?: boolean;
  }): M.HotCarrySnapshot {
    let value = (
        documentOptions.snapshotView ??
        ((viewState) => snapshotDesignSystemView(viewState))
      )(flaggedPaths),
      pendingTextPaths = unsavedTextPaths(),
      pendingRemovedFiles = unsavedRemovedFiles(),
      indexStore = document.index(),
      baseIndex = indexWithoutTitleAndDocs(indexStore.base()),
      currentIndex = indexWithoutTitleAndDocs(indexStore.get()),
      indexChanged =
        document.loadState() === "live" &&
        !document.readOnly() &&
        !mergeValuesEqual(baseIndex, currentIndex),
      pendingBinaryPaths = unsavedBinaryPaths();
    if (
      flags.size === 0 &&
      pendingTextPaths.length === 0 &&
      !indexChanged &&
      Object.keys(pendingRemovedFiles).length === 0 &&
      pendingBinaryPaths.length === 0
    ) {
      return value;
    }
    let state: Record<string, F.CarriedFileEdit> = {},
      inlineTextEdits: Record<string, F.CarriedFileEdit> = {},
      oversizedTextEdits: Record<string, F.CarriedFileEdit> = {},
      items = [],
      inlineBudget = HOT_CARRY_MAX_INLINE_CHARS,
      files = document.content().files,
      values = new Set(
        Object.keys(pendingRemovedFiles).map((filePath) =>
          readTexts.get(projectFilePath(filePath)),
        ),
      ),
      materializedValues = new Set(
        Object.keys(pendingRemovedFiles).map((filePath) =>
          materializedFingerprints.get(projectFilePath(filePath)),
        ),
      ),
      callback = (
        filePath: string,
        targetEdits: Record<string, F.CarriedFileEdit>,
        fileEdit: F.CarriedFileEdit,
      ): void => {
        let editLength = fileEdit.text.length + (fileEdit.baseText?.length ?? 0);
        if (editLength <= inlineBudget) {
          targetEdits[filePath] = fileEdit;
          inlineBudget -= editLength;
          return;
        }
        oversizedTextEdits[filePath] = fileEdit;
      };
    for (let filePath of flags.keys()) {
      let fileText = files[filePath];
      if (typeof fileText === "string") {
        callback(filePath, state, {
          text: fileText,
          base: flags.get(filePath)?.theirsSha ?? null,
        });
      }
    }
    for (let filePath of pendingTextPaths) {
      let absolutePath: string = projectFilePath(filePath);
      items.push(filePath);
      let entry = preReadBases.get(absolutePath),
        baseText = entry !== undefined ? entry.text : readTexts.get(absolutePath);
      callback(filePath, inlineTextEdits, {
        text: files[filePath],
        base:
          entry !== undefined ? entry.sha : (readShas.get(absolutePath) ?? null),
        ...(isTokenFilePath(filePath) && baseText !== undefined
          ? {
              baseText: baseText,
            }
          : {}),
      });
    }
    let indexEdit: F.CarriedIndexEdit | undefined,
      pendingIndexEdit: F.CarriedIndexEdit | undefined;
    if (indexChanged) {
      let indexSnapshot = {
          base: baseIndex,
          mine: currentIndex,
        },
        length = JSON.stringify(indexSnapshot).length;
      if (length <= inlineBudget) {
        indexEdit = indexSnapshot;
        inlineBudget -= length;
      } else {
        pendingIndexEdit = indexSnapshot;
      }
    }
    stashOversizedCarry(oversizedTextEdits, pendingIndexEdit);
    let saveQueue = document.queue();
    if (
      carryInput?.handoff !== false &&
      Object.keys(oversizedTextEdits).length === 0 &&
      pendingIndexEdit === undefined &&
      pendingBinaryPaths.length === 0 &&
      saveQueue.state().stuck === undefined &&
      saveQueue.conflicted().size === 0 &&
      saveQueue.unsendable().size === 0
    ) {
      saveQueue.stashHandedOff();
    }
    return {
      ...value,
      [HOT_CARRY_PROTOCOL_FIELD]: 1,
      ...(flags.size > 0
        ? {
            mine: state,
          }
        : {}),
      ...(items.length > 0
        ? {
            unsaved: inlineTextEdits,
            unsavedNames: items,
          }
        : {}),
      ...(Object.keys(pendingRemovedFiles).length > 0
        ? {
            removed: pendingRemovedFiles,
          }
        : {}),
      ...(Object.keys(pendingRemovedFiles).length > 0 || pendingBinaryPaths.length > 0
        ? {
            binariesLeft: pendingBinaryPaths.slice(0, 200),
            binariesNew: pendingBinaryPaths
              .filter(
                (filePath) =>
                  !values.has(files[filePath]) &&
                  !materializedValues.has(textFingerprint(files[filePath])),
              )
              .slice(0, 200),
          }
        : {}),
      ...(indexChanged
        ? {
            indexUnsaved: true,
            ...(indexEdit !== undefined
              ? {
                  index: indexEdit,
                }
              : {}),
          }
        : {}),
    };
  }
  return snapshot(carryInput);
}

import type { Dynamic } from "../../runtime-types";
import { projectFilesystem } from "../../platform/file-content";
import { parseDcHtmlDocument } from "../html/dc-document";
import { DcEditorModel } from "./dc-editor-model";
import { warnUnreadableDcDocument } from "./model-state";

interface ModelLoadDependencies {
  readonly entriesRef: { current: Map<string | undefined, Dynamic> };
  readonly nonDcFileRef: { current: boolean };
  readonly rootName: string;
  readonly optionsRef: Dynamic;
  readonly filePath: string;
  readonly undoFloorsRef: { current: Map<string | undefined, number> };
  readonly resolveFilePath: (name?: string) => string;
  readonly isMountedRef: { current: boolean };
  readonly projectPath: string;
}

/** 读取模型并恢复适用的历史；并发读取以先完成的条目为准。 */
export async function loadDcModelEntry(deps: ModelLoadDependencies, name?: string): Promise<Dynamic> {
  let entry: Dynamic = deps.entriesRef.current.get(name);
  if (entry) return entry;
  if (deps.nonDcFileRef.current) {
    if (name !== deps.rootName) return null;
    let liveBody: Dynamic = await deps.optionsRef.current.fetchLiveBody?.(deps.rootName);
    if (liveBody == null) return null;
    let liveModel: Dynamic = new DcEditorModel(liveBody, {
        raw: true,
      }),
      liveEntry: Dynamic = {
        path: deps.filePath,
        src: "",
        model: liveModel,
        originalTemplate: liveModel.serialize(),
        undo: [],
        redo: [],
        undoFloor: deps.undoFloorsRef.current.get(name) ?? 0,
        dirty: false,
      },
      racedLiveEntry: Dynamic = deps.entriesRef.current.get(name);
    return racedLiveEntry || (deps.entriesRef.current.set(name, liveEntry), liveEntry);
  }
  let relativePath: Dynamic = deps.resolveFilePath(name),
    current: Dynamic = deps.entriesRef.current,
    historyKeeper: Dynamic =
      name === deps.rootName ? deps.optionsRef.current.historyKeeper : undefined,
    isStillCurrent: Dynamic = (): Dynamic =>
      deps.isMountedRef.current && deps.entriesRef.current === current;
  historyKeeper?.holds(relativePath) &&
    !(await historyKeeper.whenSettled(relativePath)) &&
    isStillCurrent() &&
    historyKeeper.drop(relativePath, "unsaved");
  let fileSource: Dynamic, fileVersion: Dynamic;
  try {
    if (projectFilesystem.readFileWithVersion) {
      let readResult: Dynamic =
        await projectFilesystem.readFileWithVersion(
          `${deps.projectPath}/${relativePath}`,
        );
      fileSource = readResult.content;
      fileVersion = readResult.version;
    } else
      fileSource = await projectFilesystem.readFile(
        `${deps.projectPath}/${relativePath}`,
      );
  } catch (readError: Dynamic) {
    console.error("[dc-model] failed to read", relativePath, readError);
    historyKeeper && isStillCurrent() && historyKeeper.drop(relativePath, "load");
    return null;
  }
  let parsedDocument: Dynamic = parseDcHtmlDocument(fileSource);
  if (!parsedDocument) {
    warnUnreadableDcDocument(
      deps.projectPath + "/" + relativePath,
      fileSource,
      "its elements cannot be listed, selected or edited",
    );
    historyKeeper && isStillCurrent() && historyKeeper.drop(relativePath, "load");
    return null;
  }
  let fileModel: Dynamic = new DcEditorModel(parsedDocument.template, {
      raw: false,
    }),
    newEntry: Dynamic = {
      path: relativePath,
      src: fileSource,
      model: fileModel,
      originalTemplate: fileModel.serialize(),
      undo: [],
      redo: [],
      undoFloor: deps.undoFloorsRef.current.get(name) ?? 0,
      dirty: false,
      ...(fileVersion !== undefined
        ? {
            adoptedVersion: fileVersion,
            baseVersion: fileVersion,
          }
        : {}),
    },
    racedFileEntry: Dynamic = deps.entriesRef.current.get(name);
  if (racedFileEntry) return racedFileEntry;
  let restoredHistory: Dynamic =
    historyKeeper && isStillCurrent()
      ? historyKeeper.take(relativePath, fileSource, deps.optionsRef.current.historyEpoch)
      : null;
  restoredHistory &&
    ((newEntry.undo = restoredHistory.undo),
    (newEntry.redo = restoredHistory.redo),
    (newEntry.undoFloor = restoredHistory.undoFloor));
  deps.entriesRef.current.set(name, newEntry);
  return newEntry;
}

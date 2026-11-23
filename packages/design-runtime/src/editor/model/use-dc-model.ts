/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { npm_useEventListener_bc } from "../../dependencies";
import { emitEditorEvent } from "../events/runtime";
import { artboardComponentName, parseDcHtmlDocument, replaceDcTemplate, sameDcTemplate } from "../html/dc-document";
import { getDcPropsJson, setDcScript } from "../html/dc-props";
import { DcEditorModel } from "./dc-editor-model";
import { loadDcModelEntry } from "./load-entry";
import { consumeLocalFileEcho, expectLocalFileEcho, markLocalFileChange, normalizeProjectFilePath } from "./file-echoes";
import { isRecentlyEditedFile, ModelHistoryRebaseDelete, isHistoryRebaseEnabled, captureHistoryRebaseNow, ModelHistoryRebaseUndo, rebaseModelHistory } from "./history-rebase";
import { adoptModelVersion, DcModelKey, getPreDragBaseline, ModelModelStateConstant, ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues, rebuildModelTemplate, recordModelUndo, serializeAsyncFileTask, serializeStableModel, warnUnreadableDcDocument } from "./model-state";
import { clearSavedPendingProps, getPendingPropKeys } from "./pending-props";
import { publishModelChanges } from "./publishing";
import { reactOutlineAnnotations } from "../outline/annotations";
import { resetUndoHistory, trimUndoHistory } from "../undo/history";
import { projectFilesystem, trackEmbeddedWrite } from "../../platform/file-content";

function useDcModel(
  projectPath?: Dynamic,
  filePath?: Dynamic,
  hookOptions?: Dynamic,
): Dynamic {
  let {
      enabled: isEnabled,
      sessionHeld: sessionHeld,
      nonDcFile: nonDcFile = false,
    }: Dynamic = hookOptions,
    optionsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(hookOptions);
  optionsRef.current = hookOptions;
  let nonDcFileRef: Dynamic = (0, reactOutlineAnnotations.useRef)(nonDcFile);
  nonDcFileRef.current = nonDcFile;
  let sessionHeldRef: Dynamic = (0, reactOutlineAnnotations.useRef)(sessionHeld);
  sessionHeldRef.current = sessionHeld;
  let rootName: Dynamic = artboardComponentName(filePath),
    directory: Dynamic = filePath.includes("/")
      ? filePath.slice(0, filePath.lastIndexOf("/"))
      : "",
    resolveFilePath: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (componentName?: Dynamic): Dynamic =>
        componentName === rootName
          ? filePath
          : directory
            ? `${directory}/${componentName}.dc.html`
            : `${componentName}.dc.html`,
      [directory, filePath, rootName],
    ),
    entriesRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    isMountedRef: Dynamic = (0, reactOutlineAnnotations.useRef)(false),
    undoFloorsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    releaseEntry: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Dynamic => {
        let entry: Dynamic = entriesRef.current.get(name);
        entry &&
          undoFloorsRef.current.set(
            name,
            (entry.undoFloor ?? 0) + entry.undo.length + entry.redo.length,
          );
        entriesRef.current.delete(name);
      },
      [],
    ),
    ownWriteCountsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    deferredEchoPathsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Set()),
    retryPathsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Set()),
    reloadFromDiskRef: Dynamic = (0, reactOutlineAnnotations.useRef)(
      (): Dynamic => Promise.resolve(),
    ),
    enabledRef: Dynamic = (0, reactOutlineAnnotations.useRef)(isEnabled);
  enabledRef.current = isEnabled;
  let readFile: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (path?: Dynamic): Dynamic =>
        projectFilesystem.readFileWithVersion
          ? projectFilesystem.readFileWithVersion(path)
          : projectFilesystem.readFile(path).then(
              (content?: Dynamic): Dynamic => ({
                content: content,
                version: undefined,
              }),
            ),
      [],
    ),
    getEntry: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Dynamic => entriesRef.current.get(name) ?? null,
      [],
    ),
    ensureModel: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Promise<Dynamic> => loadDcModelEntry({
          get entriesRef() { return entriesRef; },
          get nonDcFileRef() { return nonDcFileRef; },
          get rootName() { return rootName; },
          get optionsRef() { return optionsRef; },
          get filePath() { return filePath; },
          get undoFloorsRef() { return undoFloorsRef; },
          get resolveFilePath() { return resolveFilePath; },
          get isMountedRef() { return isMountedRef; },
          get projectPath() { return projectPath; },
        }, name),
      [filePath, resolveFilePath, projectPath, rootName],
    ),
    pushLive: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Dynamic => {
        let entry: Dynamic = entriesRef.current.get(name);
        if (!(!entry || optionsRef.current.holdPush?.(name))) {
          if (nonDcFileRef.current) {
            emitEditorEvent("nondc-push-body", {
              name: name,
              content: entry.model.serialize(),
            });
            optionsRef.current.onPushLive?.(name);
            return;
          }
          emitEditorEvent("dc-update", {
            name: name,
            path: entry.path,
            kind: "html",
            content: entry.model.serialize(),
            streaming: false,
            viewportKey: DcModelKey,
          });
          optionsRef.current.onPushLive?.(name);
        }
      },
      [],
    ),
    saveToDisk: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Dynamic => {
        if (nonDcFileRef.current) return;
        let entry: Dynamic = entriesRef.current.get(name);
        if (!entry?.dirty) {
          editCountsRef.current.delete(name);
          return;
        }
        try {
          let sourceDocument: Dynamic = parseDcHtmlDocument(entry.src);
          if (!sourceDocument) return;
          let composedHtml: Dynamic = replaceDcTemplate(
            entry.src,
            sourceDocument,
            serializeStableModel(entry),
          );
          if (entry.pendingScript !== undefined) {
            let scriptDocument: Dynamic = parseDcHtmlDocument(composedHtml);
            scriptDocument &&
              (composedHtml = setDcScript(
                composedHtml,
                scriptDocument,
                entry.pendingScript,
              ));
          }
          let editCountAtStart: Dynamic = editCountsRef.current.get(name),
            canClearEdits: Dynamic = true;
          if (entry.pendingProps !== undefined) {
            let mergedHtml: Dynamic = getPendingPropKeys(
              composedHtml,
              entry.pendingProps,
            );
            mergedHtml === null ? (canClearEdits = false) : (composedHtml = mergedHtml);
          }
          let ownWriteCounts: Dynamic = ownWriteCountsRef.current;
          ownWriteCounts.set(entry.path, (ownWriteCounts.get(entry.path) ?? 0) + 1);
          expectLocalFileEcho(entry.path);
          mirroredSourceRef.current.set(name, composedHtml);
          projectFilesystem
            .writeFile(projectPath + "/" + entry.path, composedHtml)
            .then((): Dynamic => {
              landedWritesRef.current.set(
                name,
                (landedWritesRef.current.get(name) ?? 0) + 1,
              );
              canClearEdits &&
                editCountsRef.current.get(name) === editCountAtStart &&
                editCountsRef.current.delete(name);
            })
            .catch((): Dynamic => {})
            .finally((): Dynamic => {
              setTimeout((): Dynamic => {
                let remainingWrites: Dynamic = ownWriteCounts.get(entry.path) ?? 0;
                remainingWrites <= 1
                  ? ownWriteCounts.delete(entry.path)
                  : ownWriteCounts.set(entry.path, remainingWrites - 1);
                consumeLocalFileEcho(entry.path);
              }, 500);
            });
        } catch {}
      },
      [projectPath],
    ),
    editTimersRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    editCountsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    mirroredSourceRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    landedWritesRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    recentContentsRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    writeResolversRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map());
  (0, reactOutlineAnnotations.useEffect)((): Dynamic => {
    let timers: Dynamic = editTimersRef.current,
      resolvers: Dynamic = writeResolversRef.current;
    return (): Dynamic => {
      for (let timerId of timers.values() as Dynamic) clearTimeout(timerId);
      timers.clear();
      for (let resolveWrite of resolvers.values() as Dynamic) resolveWrite();
      resolvers.clear();
    };
  }, []);
  let lastImmediateSaveRef: Dynamic = (0, reactOutlineAnnotations.useRef)(
      new Map(),
    ),
    markDirty: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic, markOptions?: Dynamic): Dynamic => {
        let entry: Dynamic = entriesRef.current.get(name);
        if (!entry) return;
        entry.dirty = true;
        entry.previewBaseline = undefined;
        captureHistoryRebaseNow();
        editCountsRef.current.set(name, (editCountsRef.current.get(name) ?? 0) + 1);
        optionsRef.current.onLocalEdit?.(name);
        let timers: Dynamic = editTimersRef.current,
          resolvers: Dynamic = writeResolversRef.current,
          existingTimer: Dynamic = timers.get(name);
        existingTimer && clearTimeout(existingTimer);
        resolvers.get(name)?.();
        let resolveWrite: Dynamic;
        trackEmbeddedWrite(
          new Promise((resolve?: Dynamic): Dynamic => (resolveWrite = resolve)),
        );
        resolvers.set(name, resolveWrite);
        let now: Dynamic = Date.now(),
          saveNow: Dynamic =
            markOptions?.now === true &&
            now - (lastImmediateSaveRef.current.get(name) ?? 0) > 800;
        saveNow && lastImmediateSaveRef.current.set(name, now);
        timers.set(
          name,
          setTimeout(
            (): Dynamic => {
              timers.delete(name);
              resolvers.delete(name);
              saveToDisk(name);
              resolveWrite();
            },
            saveNow ? 0 : 800,
          ),
        );
      },
      [saveToDisk],
    ),
    writeQueueRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    queuedWritesRef: Dynamic = (0, reactOutlineAnnotations.useRef)(new Map()),
    refreshFromDisk: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      async (name?: Dynamic): Promise<Dynamic> => {
        let entries: Dynamic = entriesRef.current,
          entry: Dynamic = entries.get(name);
        if (entry) {
          entry.custodyGen = (entry.custodyGen ?? 0) + 1;
          if (nonDcFileRef.current) {
            entries.delete(name);
            return;
          }
          try {
            let readVersioned: Dynamic = projectFilesystem
                .readFileWithVersion
                ? (path?: Dynamic): Dynamic =>
                    projectFilesystem.readFileWithVersion(path)
                : async (path?: Dynamic): Promise<Dynamic> => ({
                    content: await projectFilesystem.readFile(path),
                    version: undefined,
                  }),
              { content: diskSource, version: diskVersion }: Dynamic = await readVersioned(
                `${projectPath}/${entry.path}`,
              );
            if (
              diskVersion !== undefined &&
              entry.adoptedVersion !== undefined &&
              diskVersion < entry.adoptedVersion
            )
              return;
            let diskDocument: Dynamic = parseDcHtmlDocument(diskSource);
            if (!diskDocument) {
              warnUnreadableDcDocument(
                projectPath + "/" + entry.path,
                diskSource,
                "the editor keeps showing the version it last read",
              );
              return;
            }
            entry.dirty = false;
            entry.carriedEditCount = 0;
            entry.src = diskSource;
            mirroredSourceRef.current.delete(name);
            let rebaseHandled: Dynamic = ModelHistoryRebaseDelete(
              entry.path,
            );
            isHistoryRebaseEnabled() && !rebaseHandled
              ? ModelHistoryRebaseUndo(
                  name,
                  rebaseModelHistory(
                    entry,
                    entry.model.serialize(),
                    diskDocument.template,
                  ),
                )
              : resetUndoHistory(entry);
            entry.pendingScript !== undefined &&
              ((entry.pendingScript = undefined),
              (entry.pendingScriptBase = undefined),
              emitEditorEvent("dc-update", {
                name: name,
                path: entry.path,
                kind: "js",
                content: diskDocument.js,
                streaming: false,
                viewportKey: DcModelKey,
              }));
            if (entry.pendingProps !== undefined) {
              let droppedPropKeys: Dynamic = Object.keys(entry.pendingProps);
              entry.pendingProps = undefined;
              entry.pendingPropsBase = undefined;
              optionsRef.current.onPendingPropsDropped?.(name, droppedPropKeys);
            }
            let hadPreviewBaseline: Dynamic = entry.previewBaseline !== undefined;
            entry.previewBaseline = undefined;
            if (diskDocument.template !== entry.model.serialize()) {
              let previousModel: Dynamic = hadPreviewBaseline ? null : entry.model;
              entry.model = entry.model.rebuild(diskDocument.template);
              entry.liveStampsStale = false;
              entry.stampGen = (entry.stampGen ?? -1) + 1;
              optionsRef.current.onExternalReparse?.(name, previousModel);
            }
            entry.originalTemplate = entry.model.serialize();
            diskVersion !== undefined &&
              (adoptModelVersion(entry, diskVersion),
              (entry.baseVersion === undefined ||
                diskVersion > entry.baseVersion) &&
                (entry.baseVersion = diskVersion),
              optionsRef.current.onAdopted?.(entry.path, diskVersion, diskSource));
            pushLive(name);
          } catch {
          } finally {
            entry.custodyGen = (entry.custodyGen ?? 0) + 1;
          }
        }
      },
      [projectPath, pushLive],
    ),
    writeNow: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Dynamic => {
        if (nonDcFileRef.current) {
          let cleanEntry: Dynamic = entriesRef.current.get(name);
          cleanEntry && (cleanEntry.dirty = false);
          return Promise.resolve("noop");
        }
        let entries: Dynamic = entriesRef.current,
          entry: Dynamic = entries.get(name);
        if (entry && getPreDragBaseline(entry) === undefined)
          for (let markerAttr of ModelModelStateDataDcDraggingDataDcDragParentDataDcDragFollowerValues as Dynamic)
            entry.model.takeMarkerAttr(markerAttr);
        let payload: Dynamic = entry
            ? serializeStableModel(entry)
            : undefined,
          pendingScript: Dynamic = entry?.pendingScript,
          pendingScriptBase: Dynamic = entry?.pendingScriptBase,
          pendingProps: Dynamic = entry?.pendingProps,
          pendingPropsBase: Dynamic = entry?.pendingPropsBase,
          baseline: Dynamic = entry
            ? optionsRef.current.getBaseline?.(entry.path)
            : undefined,
          custodyGen: Dynamic = entry?.custodyGen ?? 0,
          queuedWrite: Dynamic = queuedWritesRef.current.get(name);
        if (
          queuedWrite &&
          queuedWrite.models === entries &&
          queuedWrite.payload === payload &&
          queuedWrite.pendingScript === pendingScript &&
          queuedWrite.pendingProps === pendingProps
        )
          return queuedWrite.run;
        let token: Dynamic = {},
          runWrite: Dynamic = async (): Promise<Dynamic> => {
            let currentQueued: Dynamic = queuedWritesRef.current.get(name);
            currentQueued &&
              currentQueued.token === token &&
              queuedWritesRef.current.delete(name);
            let hasQueuedSuccessor: Dynamic = (): Dynamic =>
              queuedWritesRef.current.has(name);
            if (
              !entry ||
              payload === undefined ||
              (entry.custodyGen ?? 0) !== custodyGen
            )
              return "noop";
            try {
              await optionsRef.current.writes?.awaitWriteClearance();
            } catch {}
            let mirrorInfo: Dynamic = {},
              mirroredSource: Dynamic = mirroredSourceRef.current.get(name);
            if (
              mirroredSource !== undefined &&
              projectFilesystem.readFileWithVersion
            )
              try {
                let content: Dynamic = (
                  await projectFilesystem.readFileWithVersion(
                    `${projectPath}/${entry.path}`,
                  )
                ).content;
                mirrorInfo = {
                  mirrored: mirroredSource,
                  diskIsMirror: content === mirroredSource,
                };
              } catch {
                mirrorInfo = {
                  mirrored: mirroredSource,
                };
              }
            if ((entry.custodyGen ?? 0) !== custodyGen) return "noop";
            let pathWriteCounts: Dynamic = ownWriteCountsRef.current;
            pathWriteCounts.set(entry.path, (pathWriteCounts.get(entry.path) ?? 0) + 1);
            expectLocalFileEcho(entry.path);
            let echoPending: Dynamic = true,
              releaseEcho: Dynamic = (): Dynamic => {
                echoPending &&
                  ((echoPending = false),
                  consumeLocalFileEcho(entry.path));
              },
              conflictHandled: Dynamic = false,
              outcome: Dynamic = "failed",
              isVersionConflict: Dynamic = (error?: Dynamic): Dynamic =>
                error?.code === 10;
            writesInFlightRef.current += 1;
            try {
              let fileIo: Dynamic = {
                  write: projectFilesystem.writeFileVersioned
                    ? (
                        path?: Dynamic,
                        content?: Dynamic,
                        writeOptions?: Dynamic,
                      ): Dynamic =>
                        projectFilesystem.writeFileVersioned(
                          path,
                          content,
                          {
                            baseline: writeOptions?.baseline,
                            conflictPolicy: optionsRef.current.writes
                              ?.onWriteConflict
                              ? "fail"
                              : "merge",
                          },
                        )
                    : (path?: Dynamic, content?: Dynamic): Dynamic =>
                        projectFilesystem.writeFile(path, content),
                  read: (path?: Dynamic): Dynamic =>
                    projectFilesystem.readFile(path),
                  readWithVersion: projectFilesystem
                    .readFileWithVersion
                    ? (path?: Dynamic): Dynamic =>
                        projectFilesystem.readFileWithVersion(path)
                    : undefined,
                },
                makeWriteContext: Dynamic = (): Dynamic => ({
                  hasQueuedSuccessor: hasQueuedSuccessor(),
                  baselineAtCall: baseline,
                  pendingScriptAtCall: pendingScript,
                  pendingScriptBaseAtCall: pendingScriptBase,
                  pendingPropsAtCall: pendingProps,
                  pendingPropsBaseAtCall: pendingPropsBase,
                  ...mirrorInfo,
                }),
                publishResult: Dynamic = await publishModelChanges(
                  entry,
                  projectPath,
                  fileIo,
                  payload,
                  makeWriteContext(),
                );
              switch (
                (publishResult.kind === "failed" &&
                  !isVersionConflict(publishResult.error) &&
                  (publishResult = await publishModelChanges(
                    entry,
                    projectPath,
                    fileIo,
                    payload,
                    makeWriteContext(),
                  )),
                publishResult.version !== undefined &&
                  adoptModelVersion(entry, publishResult.version),
                publishResult.kind)
              ) {
                case "noop":
                  outcome = "noop";
                  releaseEcho();
                  break;
                case "failed": {
                  outcome = "failed";
                  releaseEcho();
                  let isConflict: Dynamic = isVersionConflict(publishResult.error);
                  if (
                    isConflict &&
                    optionsRef.current.writes?.onWriteConflict &&
                    !hasQueuedSuccessor()
                  ) {
                    conflictHandled = true;
                    if (
                      (pendingScript !== undefined || pendingProps !== undefined) &&
                      rebuildModelTemplate(
                        entry.model,
                        payload,
                      ) ===
                        rebuildModelTemplate(
                          entry.model,
                          entry.originalTemplate,
                        )
                    ) {
                      console.warn(
                        "[dc-model] version conflict on a script/prop-only edit \u2014 reverting:",
                        entry.path,
                      );
                      try {
                        optionsRef.current.writes?.onWriteReverted(
                          name,
                          publishResult.error,
                        );
                      } catch (callbackError: Dynamic) {
                        console.error(
                          "[dc-model] revert callback threw:",
                          callbackError,
                        );
                      }
                    } else {
                      console.warn(
                        "[dc-model] version conflict \u2014 routing the edit to Claude:",
                        entry.path,
                      );
                      try {
                        optionsRef.current.writes.onWriteConflict(
                          name,
                          entry.path,
                          entry.originalTemplate,
                          payload,
                        );
                      } catch (callbackError: Dynamic) {
                        console.error(
                          "[dc-model] onWriteConflict threw:",
                          callbackError,
                        );
                      }
                    }
                    await refreshFromDisk(name);
                    break;
                  }
                  if (!isConflict && !hasQueuedSuccessor()) {
                    console.error(
                      "[dc-model] write failed twice \u2014 reverting to disk:",
                      publishResult.error,
                    );
                    conflictHandled = true;
                    try {
                      optionsRef.current.writes?.onWriteReverted(
                        name,
                        publishResult.error,
                      );
                    } catch (callbackError: Dynamic) {
                      console.error(
                        "[dc-model] revert callback threw:",
                        callbackError,
                      );
                    }
                    await refreshFromDisk(name);
                    break;
                  }
                  console.error("[dc-model] write failed:", publishResult.error);
                  conflictHandled = true;
                  optionsRef.current.writes?.onWriteError(publishResult.error);
                  break;
                }
                case "saved-adopted":
                  if (
                    ((entry.adoptedMerge = true),
                    (outcome = "saved"),
                    entriesRef.current === entries &&
                      !hasQueuedSuccessor() &&
                      entry.model.serialize() === payload)
                  )
                    try {
                      optionsRef.current.writes?.onSavedAdopted(
                        name,
                        publishResult.saved,
                      );
                    } catch (callbackError: Dynamic) {
                      console.error(
                        "[dc-model] onSavedAdopted threw after landed write:",
                        callbackError,
                      );
                    }
                  break;
                case "saved":
                  outcome = "saved";
                  break;
              }
              (publishResult.kind === "saved" ||
                publishResult.kind === "saved-adopted") &&
                mirroredSource !== undefined &&
                mirroredSourceRef.current.get(name) === mirroredSource &&
                mirroredSourceRef.current.delete(name);
              if (
                (publishResult.kind === "noop" ||
                  publishResult.kind === "saved" ||
                  publishResult.kind === "saved-adopted") &&
                publishResult.settledProps !== undefined &&
                optionsRef.current.onPendingPropsSettled !== undefined &&
                entriesRef.current === entries
              ) {
                let currentPendingProps: Dynamic = entries.get(name)?.pendingProps,
                  settledProps: Dynamic = {};
                for (let [propKey, propValue] of Object.entries(
                  publishResult.settledProps,
                ) as Dynamic) {
                  let currentValue: Dynamic =
                    currentPendingProps !== undefined && Object.hasOwn(currentPendingProps, propKey)
                      ? currentPendingProps[propKey]
                      : undefined;
                  (currentValue === undefined || currentValue === propValue) &&
                    (settledProps[propKey] = propValue);
                }
                if (Object.keys(settledProps).length > 0)
                  try {
                    optionsRef.current.onPendingPropsSettled(name, settledProps);
                  } catch (callbackError: Dynamic) {
                    console.error(
                      "[dc-model] onPendingPropsSettled threw after settle:",
                      callbackError,
                    );
                  }
              }
              outcome === "saved" &&
                markLocalFileChange(projectPath, entry.path);
            } catch (saveError: Dynamic) {
              outcome === "failed"
                ? ((entry.dirty = true),
                  editCountsRef.current.set(
                    name,
                    (editCountsRef.current.get(name) ?? 0) + 1,
                  ),
                  releaseEcho(),
                  conflictHandled || optionsRef.current.writes?.onWriteError(saveError))
                : console.error(
                    "[dc-model] post-save callback threw after landed write:",
                    saveError,
                  );
            } finally {
              writesInFlightRef.current -= 1;
              setTimeout((): Dynamic => {
                let remainingWrites: Dynamic = pathWriteCounts.get(entry.path) ?? 0;
                remainingWrites <= 1
                  ? (pathWriteCounts.delete(entry.path),
                    deferredEchoPathsRef.current.delete(entry.path) &&
                      reloadFromDiskRef.current(entry.path))
                  : pathWriteCounts.set(entry.path, remainingWrites - 1);
              }, 500);
            }
            return outcome;
          },
          writeTask: Dynamic = serializeAsyncFileTask(
            writeQueueRef.current,
            name,
            runWrite,
          );
        entry &&
          payload !== undefined &&
          queuedWritesRef.current.set(name, {
            token: token,
            models: entries,
            payload: payload,
            pendingScript: pendingScript,
            pendingProps: pendingProps,
            run: writeTask,
          });
        return writeTask;
      },
      [projectPath, refreshFromDisk],
    ),
    flushAll: Dynamic = (0,
    reactOutlineAnnotations
      .useCallback)(async (): Promise<Dynamic> => {
      let pendingFlushes: Dynamic = [];
      for (let [name, entry] of entriesRef.current as Dynamic)
        entry.dirty && pendingFlushes.push(writeNow(name));
      await Promise.allSettled(pendingFlushes);
    }, [writeNow]),
    flushAllRef: Dynamic = (0, reactOutlineAnnotations.useRef)(flushAll);
  flushAllRef.current = flushAll;
  let anyDirty: Dynamic = (0,
    reactOutlineAnnotations.useCallback)((): Dynamic => {
      for (let entry of entriesRef.current.values() as Dynamic)
        if (entry.dirty) return true;
      return false;
    }, []),
    writesInFlightRef: Dynamic = (0, reactOutlineAnnotations.useRef)(0),
    anyWriteInFlight: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (): Dynamic => writesInFlightRef.current > 0,
      [],
    ),
    commitInFlight: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic): Dynamic => writeQueueRef.current.has(name),
      [],
    ),
    pushUndoSnapshot: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic, snapshot?: Dynamic): Dynamic => {
        let entry: Dynamic = entriesRef.current.get(name) ?? null;
        return !entry || !recordModelUndo(entry, snapshot)
          ? false
          : (optionsRef.current.onBeforeMutate?.(
              name,
              entry,
              snapshot,
              false,
            ),
            true);
      },
      [],
    ),
    mutate: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      async (
        name?: Dynamic,
        mutator?: Dynamic,
        mutateOptions?: Dynamic,
      ): Promise<Dynamic> => {
        let isStructural: Dynamic = mutateOptions?.structural ?? true,
          shouldPushUndo: Dynamic = isStructural || (mutateOptions?.pushUndo ?? false),
          shouldRestamp: Dynamic = mutateOptions?.restamp ?? true,
          shouldPushLive: Dynamic = mutateOptions?.pushLive ?? true,
          isSessionHeld: Dynamic = sessionHeldRef.current,
          entry: Dynamic = await ensureModel(name);
        if (!entry) return false;
        let undoSnapshot: Dynamic = shouldPushUndo ? entry.model.serialize() : "";
        return mutator(entry.model, entry)
          ? ((entry.previewBaseline = undefined),
            (entry.stampGen = (entry.stampGen ?? -1) + 1),
            shouldPushUndo &&
              (entry.undo.push(undoSnapshot),
              trimUndoHistory(
                entry,
                entry.undo.length - ModelModelStateConstant,
              ),
              (entry.redo = []),
              optionsRef.current.onBeforeMutate?.(
                name,
                entry,
                undoSnapshot,
                isStructural,
              )),
            shouldRestamp && entry.model.restamp(),
            shouldPushLive && pushLive(name),
            shouldRestamp && shouldPushLive
              ? (entry.liveStampsStale = false)
              : isStructural && (entry.liveStampsStale = true),
            (entry.dirty = true),
            isSessionHeld
              ? (markDirty(name), "applied-dirty")
              : (await writeNow(name)) === "failed"
                ? "applied-failed"
                : "applied")
          : "refused";
      },
      [ensureModel, pushLive, writeNow, markDirty],
    ),
    syncEntry: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      async (
        name?: Dynamic,
        entry?: Dynamic,
        syncOptions?: Dynamic,
      ): Promise<Dynamic> => {
        if (isRecentlyEditedFile(entry.path)) {
          await refreshFromDisk(name);
          ModelHistoryRebaseDelete(entry.path);
          if (
            !(
              entry.dirty ||
              entry.pendingScript !== undefined ||
              entry.pendingProps !== undefined
            )
          )
            return;
          let pendingTimer: Dynamic = editTimersRef.current.get(name);
          pendingTimer && clearTimeout(pendingTimer);
          editTimersRef.current.delete(name);
          writeResolversRef.current.get(name)?.();
          writeResolversRef.current.delete(name);
          editCountsRef.current.delete(name);
          entry.dirty = false;
          entry.pendingScript = undefined;
          entry.pendingScriptBase = undefined;
          entry.pendingProps = undefined;
          entry.pendingPropsBase = undefined;
          resetUndoHistory(entry);
          try {
            entry.src = (
              await readFile(`${projectPath}/${entry.path}`)
            ).content;
          } catch {
            releaseEntry(name);
          }
          return;
        }
        if (
          ownWriteCountsRef.current.has(entry.path) &&
          !recentContentsRef.current.get(name)?.size
        ) {
          deferredEchoPathsRef.current.add(entry.path);
          return;
        }
        let scheduleRetry: Dynamic = (): Dynamic => {
          !syncOptions?.noRetry &&
            !retryPathsRef.current.has(entry.path) &&
            (retryPathsRef.current.add(entry.path),
            setTimeout((): Dynamic => {
              retryPathsRef.current.delete(entry.path);
              reloadFromDiskRef.current(entry.path, {
                noRetry: true,
              });
            }, 2e3));
        };
        try {
          let writesBefore: Dynamic = landedWritesRef.current.get(name) ?? 0,
            { content: diskSource, version: diskVersion }: Dynamic = await readFile(
              `${projectPath}/${entry.path}`,
            );
          if (
            (ownWriteCountsRef.current.has(entry.path) &&
              !recentContentsRef.current.get(name)?.has(diskSource)) ||
            writeQueueRef.current.has(name)
          ) {
            deferredEchoPathsRef.current.add(entry.path);
            return;
          }
          if (
            diskVersion !== undefined &&
            entry.adoptedVersion !== undefined &&
            diskVersion <= entry.adoptedVersion
          ) {
            recentContentsRef.current.get(name)?.delete(diskSource);
            return;
          }
          if (
            entry.dirty ||
            entry.pendingScript !== undefined ||
            entry.pendingProps !== undefined
          ) {
            let isOwnWrite: Dynamic =
              recentContentsRef.current.get(name)?.has(diskSource) === true;
            isOwnWrite &&
              (landedWritesRef.current.get(name) ?? 0) === writesBefore &&
              (recentContentsRef.current.get(name)?.delete(diskSource),
              mirroredSourceRef.current.set(name, diskSource));
            if (
              optionsRef.current.liveStore &&
              !editCountsRef.current.has(name) &&
              !isOwnWrite &&
              diskSource !== mirroredSourceRef.current.get(name)
            ) {
              await refreshFromDisk(name);
              entry.src === diskSource ||
                (diskVersion !== undefined &&
                  entry.adoptedVersion !== undefined &&
                  entry.adoptedVersion >= diskVersion) ||
                !(
                  entry.dirty ||
                  entry.pendingScript !== undefined ||
                  entry.pendingProps !== undefined
                ) ||
                (diskSource !== entry.src && (entry.src = diskSource),
                scheduleRetry());
              return;
            }
            diskSource !== entry.src && (entry.src = diskSource);
            isOwnWrite && clearSavedPendingProps(entry);
            diskVersion !== undefined &&
              adoptModelVersion(entry, diskVersion);
            return;
          }
          if (diskSource === entry.src) {
            recentContentsRef.current.get(name)?.delete(diskSource);
            diskVersion !== undefined &&
              (adoptModelVersion(entry, diskVersion),
              (entry.baseVersion === undefined ||
                diskVersion > entry.baseVersion) &&
                (entry.baseVersion = diskVersion));
            return;
          }
          let diskDocument: Dynamic = parseDcHtmlDocument(diskSource);
          if (!diskDocument) {
            warnUnreadableDcDocument(
              projectPath + "/" + entry.path,
              diskSource,
              "the editor keeps showing the version it last read",
            );
            return;
          }
          recentContentsRef.current.get(name)?.delete(diskSource);
          let templateChanged: Dynamic = !sameDcTemplate(
            diskSource,
            entry.src,
          );
          entry.src = diskSource;
          if (templateChanged) {
            let rebaseHandled: Dynamic = ModelHistoryRebaseDelete(
              entry.path,
            );
            isHistoryRebaseEnabled() && !rebaseHandled
              ? ModelHistoryRebaseUndo(
                  name,
                  rebaseModelHistory(
                    entry,
                    entry.model.serialize(),
                    diskDocument.template,
                  ),
                )
              : resetUndoHistory(entry);
          }
          let hadPreviewBaseline: Dynamic = entry.previewBaseline !== undefined;
          entry.previewBaseline = undefined;
          if (diskDocument.template !== entry.model.serialize()) {
            let previousModel: Dynamic = hadPreviewBaseline ? null : entry.model;
            entry.model = entry.model.rebuild(diskDocument.template);
            entry.stampGen = (entry.stampGen ?? -1) + 1;
            entry.liveStampsStale = true;
            entry.originalTemplate = entry.model.serialize();
            optionsRef.current.onExternalReparse?.(name, previousModel);
          }
          diskVersion !== undefined &&
            (adoptModelVersion(entry, diskVersion),
            (entry.baseVersion === undefined ||
              diskVersion > entry.baseVersion) &&
              (entry.baseVersion = diskVersion),
            optionsRef.current.onAdopted?.(entry.path, diskVersion, diskSource));
        } catch {
          scheduleRetry();
        }
      },
      [projectPath, readFile, refreshFromDisk],
    ),
    syncByPath: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      async (path?: Dynamic, syncOptions?: Dynamic): Promise<Dynamic> => {
        let normalizedPath: Dynamic = normalizeProjectFilePath(path);
        for (let [name, entry] of entriesRef.current as Dynamic)
          entry.path === normalizedPath &&
            (await syncEntry(name, entry, syncOptions));
      },
      [syncEntry],
    );
  reloadFromDiskRef.current = (path?: Dynamic, syncOptions?: Dynamic): Dynamic =>
    !enabledRef.current || nonDcFileRef.current
      ? Promise.resolve()
      : syncByPath(path, syncOptions);
  let noteOwnWrite: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (name?: Dynamic, content?: Dynamic): Dynamic => {
        let contents: Dynamic = recentContentsRef.current.get(name) ?? new Set();
        contents.add(content);
        contents.size > 4 && contents.delete(contents.values().next().value);
        recentContentsRef.current.set(name, contents);
        return (): Dynamic => {
          contents.delete(content);
        };
      },
      [],
    ),
    adoptExternal: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      async (name?: Dynamic): Promise<Dynamic> => {
        !isEnabled || nonDcFileRef.current || (await syncByPath(name));
      },
      [syncByPath, isEnabled],
    ),
    entryCheck: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      async (name?: Dynamic): Promise<Dynamic> => {
        if (nonDcFileRef.current)
          return {
            outcome: "non-dc",
          };
        let entry: Dynamic = entriesRef.current.get(name),
          loadedEntry: Dynamic = await ensureModel(name);
        if (!loadedEntry)
          return {
            outcome: "read-failed",
          };
        if (!entry)
          return {
            outcome: "cold",
          };
        let entryHadEdits: Dynamic =
          entry.dirty ||
          entry.pendingScript !== undefined ||
          entry.pendingProps !== undefined;
        if (ownWriteCountsRef.current.has(loadedEntry.path) || writeQueueRef.current.has(name))
          return {
            outcome: "self-write",
          };
        try {
          let { content: diskSource, version: diskVersion }: Dynamic = await readFile(
            `${projectPath}/${loadedEntry.path}`,
          );
          if (
            ownWriteCountsRef.current.has(loadedEntry.path) ||
            writeQueueRef.current.has(name)
          )
            return {
              outcome: "self-write",
            };
          if (entriesRef.current.get(name) !== loadedEntry)
            return {
              outcome: "read-failed",
            };
          let loadedHasEdits: Dynamic =
            loadedEntry.dirty ||
            loadedEntry.pendingScript !== undefined ||
            loadedEntry.pendingProps !== undefined;
          if (diskSource === loadedEntry.src) {
            diskVersion !== undefined &&
              (adoptModelVersion(loadedEntry, diskVersion),
              !loadedHasEdits &&
                (loadedEntry.baseVersion === undefined ||
                  diskVersion > loadedEntry.baseVersion) &&
                (loadedEntry.baseVersion = diskVersion));
            if (!loadedHasEdits)
              return {
                outcome: "fresh",
              };
            if (diskSource === mirroredSourceRef.current.get(name))
              return {
                outcome: "fresh",
              };
            let matchedDocument: Dynamic = parseDcHtmlDocument(diskSource);
            return matchedDocument
              ? rebuildModelTemplate(
                  loadedEntry.model,
                  matchedDocument.template,
                ) !==
                  rebuildModelTemplate(
                    loadedEntry.model,
                    loadedEntry.originalTemplate,
                  ) ||
                (loadedEntry.pendingScript !== undefined &&
                  matchedDocument.js !== loadedEntry.pendingScriptBase) ||
                (loadedEntry.pendingProps !== undefined &&
                  getDcPropsJson(diskSource) !==
                    loadedEntry.pendingPropsBase)
                ? {
                    outcome: entryHadEdits ? "conflict" : "race-conflict",
                  }
                : {
                    outcome: "fresh",
                  }
              : {
                  outcome: "unparseable",
                };
          }
          if (
            diskVersion !== undefined &&
            loadedEntry.adoptedVersion !== undefined &&
            diskVersion <= loadedEntry.adoptedVersion
          )
            return {
              outcome: "fresh",
            };
          let diskDocument: Dynamic = parseDcHtmlDocument(diskSource);
          if (!diskDocument)
            return {
              outcome: "unparseable",
            };
          if (!loadedHasEdits) {
            await refreshFromDisk(name);
            let isCaughtUp: Dynamic =
              loadedEntry.src === diskSource ||
              (diskVersion !== undefined &&
                loadedEntry.adoptedVersion !== undefined &&
                loadedEntry.adoptedVersion >= diskVersion);
            isCaughtUp && resetUndoHistory(loadedEntry);
            return {
              outcome: isCaughtUp ? "rebuilt" : "read-failed",
            };
          }
          return diskSource === mirroredSourceRef.current.get(name)
            ? (diskVersion !== undefined &&
                adoptModelVersion(loadedEntry, diskVersion),
              {
                outcome: "fresh",
              })
            : rebuildModelTemplate(
                  loadedEntry.model,
                  diskDocument.template,
                ) ===
                  rebuildModelTemplate(
                    loadedEntry.model,
                    loadedEntry.originalTemplate,
                  ) &&
                (loadedEntry.pendingScript === undefined ||
                  diskDocument.js === loadedEntry.pendingScriptBase) &&
                (loadedEntry.pendingProps === undefined ||
                  getDcPropsJson(diskSource) ===
                    loadedEntry.pendingPropsBase)
              ? ((loadedEntry.src = diskSource),
                diskVersion !== undefined &&
                  adoptModelVersion(loadedEntry, diskVersion),
                {
                  outcome: "src-advanced",
                })
              : (diskSource !== loadedEntry.src && (loadedEntry.src = diskSource),
                diskVersion !== undefined &&
                  adoptModelVersion(loadedEntry, diskVersion),
                {
                  outcome: entryHadEdits ? "conflict" : "race-conflict",
                });
        } catch {
          return {
            outcome: "read-failed",
          };
        }
      },
      [ensureModel, projectPath, readFile, refreshFromDisk],
    );
  (0, reactOutlineAnnotations.useEffect)(
    (): Dynamic => (
      (isMountedRef.current = true),
      (): Dynamic => {
        isMountedRef.current = false;
        let rootKey: Dynamic = artboardComponentName(filePath),
          rootEntry: Dynamic = nonDcFileRef.current
            ? undefined
            : entriesRef.current.get(rootKey);
        flushAllRef.current();
        let historyKeeper: Dynamic = optionsRef.current.historyKeeper;
        historyKeeper &&
          !(
            rootEntry &&
            historyKeeper.keep(
              filePath,
              rootEntry,
              writeQueueRef.current.get(rootKey) ?? Promise.resolve(),
              optionsRef.current.historyEpoch,
            )
          ) &&
          historyKeeper.decline(filePath);
        for (let [key, keptEntry] of entriesRef.current as Dynamic)
          undoFloorsRef.current.set(
            key,
            (keptEntry.undoFloor ?? 0) +
              keptEntry.undo.length +
              keptEntry.redo.length,
          );
        entriesRef.current = new Map();
        editCountsRef.current.clear();
        mirroredSourceRef.current.clear();
        landedWritesRef.current.clear();
        recentContentsRef.current.clear();
      }
    ),
    [projectPath, filePath],
  );
  let adoptingCountRef: Dynamic = (0, reactOutlineAnnotations.useRef)(0),
    isAdopting: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (): Dynamic => adoptingCountRef.current > 0,
      [],
    );
  npm_useEventListener_bc(
    "files-changed",
    (event?: Dynamic): Dynamic => {
      if (!isEnabled || nonDcFile || event.detail.projectPath !== projectPath) return;
      let paths: Dynamic = event.detail.paths,
        normalizedPaths: Dynamic = paths.map(normalizeProjectFilePath);
      adoptingCountRef.current++;
      (async (): Promise<Dynamic> => {
        try {
          for (let [name, entry] of entriesRef.current as Dynamic)
            (!normalizedPaths.includes(entry.path) && !paths.includes("*")) ||
              (await syncEntry(name, entry));
        } finally {
          adoptingCountRef.current--;
        }
      })();
    },
  );
  let eachEntry: Dynamic = (0, reactOutlineAnnotations.useCallback)(
      (visit?: Dynamic): Dynamic => {
        for (let [name, entry] of entriesRef.current as Dynamic)
          visit(name, entry);
      },
      [],
    ),
    dropModel: Dynamic = releaseEntry;
  return (0, reactOutlineAnnotations.useMemo)(
    (): Dynamic => ({
      rootName: isEnabled ? rootName : "",
      sessionHeld: sessionHeld,
      nonDcFile: nonDcFile,
      ensureModel: ensureModel,
      state: getEntry,
      each: eachEntry,
      dropModel: dropModel,
      pushLive: pushLive,
      markDirty: markDirty,
      writeNow: writeNow,
      refreshFromDisk: refreshFromDisk,
      adoptExternal: adoptExternal,
      adopting: isAdopting,
      noteOwnWrite: noteOwnWrite,
      entryCheck: entryCheck,
      flushAll: flushAll,
      anyDirty: anyDirty,
      anyWriteInFlight: anyWriteInFlight,
      commitInFlight: commitInFlight,
      mutate: mutate,
      pushUndoSnapshot: pushUndoSnapshot,
    }),
    [
      isEnabled,
      rootName,
      sessionHeld,
      nonDcFile,
      ensureModel,
      getEntry,
      eachEntry,
      dropModel,
      pushLive,
      markDirty,
      writeNow,
      refreshFromDisk,
      adoptExternal,
      isAdopting,
      noteOwnWrite,
      entryCheck,
      flushAll,
      anyDirty,
      anyWriteInFlight,
      commitInFlight,
      mutate,
      pushUndoSnapshot,
    ],
  );
}
export {
  useDcModel,
};
export function installEditorModelUseDcModel(): () => void {
  return () => {};
}

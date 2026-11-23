import type { ApplicationCommands, ApplicationDocument, ApplicationStore, AssetIntakeOptions, AssetUploadSummary, IntakeQueueEntry, TokenDialogState, UploadCommitResult } from "../../contracts/application";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { showEditorNotification } from "../../editor/editable-name";
import { addedFilesSummary, commitUploadedAssetChange, countSuccessfulUploads, mergeAssetUploadResults, uploadAssetFiles, uploadedFilesBuildSummary } from "../../editor/upload-pipeline";
import { addAssetFile } from "../../model/asset-commands";
import { DESIGN_SYSTEM_PATHS } from "../../model/file-policy";
import { addFontFace } from "../../model/font-component-commands";
import { reactArtifactRoot as React } from "../../ui/disclosure";

interface AssetIntakeQueueOptions {
  editable: ApplicationCommands | undefined;
  editor: ApplicationCommands;
  applicationDocument: ApplicationDocument;
  system: ApplicationStore;
  intakeOptions: AssetIntakeOptions;
  currentSectionRef: { readonly current: string };
  uploadPanelVisibleRef: { readonly current: boolean };
  getTokenDialog(): TokenDialogState | null;
  setIntakeBusy: (value: boolean) => void;
  setIntakeProgress: (value: string | null) => void;
  recordIntakeOutcome(summary: AssetUploadSummary, entries: Map<File, string>): void;
  announceIntakeOutcome(summary: AssetUploadSummary, quiet: boolean, fromStart?: boolean): void;
  jumpToSection(section: string): void;
}

/** Queue uploads as one save session while preserving existing manual edits. */
export function useAssetIntakeQueue({ editable, editor, applicationDocument, system, intakeOptions,
  currentSectionRef, uploadPanelVisibleRef, getTokenDialog, setIntakeBusy, setIntakeProgress,
  recordIntakeOutcome, announceIntakeOutcome, jumpToSection }: AssetIntakeQueueOptions) {
  const INTAKE_QUEUE_WAIT_MS = 700,
    intakeRunningRef = React.useRef(false),
    intakeQueueRef = React.useRef<IntakeQueueEntry[]>([]),
    intakeSavingRef = React.useRef(false),
    addFiles =
      editable === undefined
        ? undefined
        : (items: File[], fileGroup?: string, fromStart = false) => {
            if (items.length === 0) {
              return false;
            }
            if (intakeSavingRef.current) {
              showEditorNotification(
                uiMessage("design-system.designSystemApp.savingWhatYouJustAdded"),
              );
              return false;
            }
            intakeQueueRef.current.push({
              files: items,
              group: fileGroup ?? null,
              fromStart: fromStart,
            });
            if (intakeRunningRef.current) {
              return true;
            }
            intakeRunningRef.current = true;
            setIntakeBusy(true);
            let sectionAtStart = currentSectionRef.current;
            system.holdAutosave = true;
            let hadExistingEdits = applicationDocument.dirty(),
              existingPaths = new Set(Object.keys(applicationDocument.content().files)),
              isNewIntakeFile = (path: string) =>
                !existingPaths.has(path) &&
                (path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
                  path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)),
              hasFromStartUpload = false;
            (async (): Promise<AssetUploadSummary> => {
              let intakeSummary: AssetUploadSummary = {
                fonts: 0,
                assets: {},
                blobs: 0,
                refused: [],
                warnings: [],
              };
              while (
                intakeQueueRef.current.length > 0 ||
                (await new Promise<boolean>((resolve) =>
                  setTimeout(
                    () => resolve(intakeQueueRef.current.length > 0),
                    INTAKE_QUEUE_WAIT_MS,
                  ),
                ))
              ) {
                if (intakeQueueRef.current.length === 0) {
                  continue;
                }
                let queuedUpload = intakeQueueRef.current.shift();
                if (queuedUpload === undefined) {
                  continue;
                }
                let group = queuedUpload.group,
                  entries = new Map<File, string>(),
                  commitUpload = (
                    file: File,
                    commit: () => UploadCommitResult,
                  ) => {
                    if (!queuedUpload.fromStart) {
                      return commit();
                    }
                    let queuedPaths = new Set(
                        Object.keys(applicationDocument.content().files),
                      ),
                      commitResult = commit(),
                      committedPath =
                        commitResult === true
                          ? Object.keys(applicationDocument.content().files).find(
                              (path) =>
                                !queuedPaths.has(path) && isNewIntakeFile(path),
                            )
                          : undefined;
                    if (committedPath !== undefined) {
                      entries.set(file, committedPath);
                    }
                    return commitResult;
                  },
                  neverSaves = applicationDocument.neverSaves,
                  uploadResult = await uploadAssetFiles(
                    queuedUpload.files,
                    {
                      ...intakeOptions,
                      onProgress: (progress) => {
                        let queuedCount = intakeQueueRef.current.reduce(
                          (count: number, upload: IntakeQueueEntry) =>
                            count + upload.files.length,
                          0,
                        );
                        setIntakeProgress(
                          progress === null
                            ? null
                            : progress +
                                (queuedCount > 0
                                  ? " · " + String(queuedCount) + " more queued"
                                  : ""),
                        );
                      },
                      font: (fontSource, file) =>
                        commitUpload(file, () =>
                          commitUploadedAssetChange(
                            (result) =>
                              editable.exec(
                                "add font " + fontSource.fileName,
                                result,
                              ),
                            (result) =>
                              addFontFace(result, fontSource),
                            neverSaves,
                          ),
                        ),
                      asset: (assetSource, file) =>
                        commitUpload(file, () =>
                          commitUploadedAssetChange(
                            (result) =>
                              editable.exec("add " + assetSource.fileName, result),
                            (result) =>
                              addAssetFile(result, assetSource),
                            neverSaves,
                          ),
                        ),
                    },
                    group ?? undefined,
                  );
                if (queuedUpload.fromStart) {
                  hasFromStartUpload = true;
                  recordIntakeOutcome(uploadResult, entries);
                }
                intakeSummary = mergeAssetUploadResults(intakeSummary, uploadResult);
              }
              return intakeSummary;
            })()
              .then(async (uploadResult): Promise<void> => {
                setIntakeProgress(null);
                if (countSuccessfulUploads(uploadResult) === 0) {
                  announceIntakeOutcome(uploadResult, false, hasFromStartUpload);
                  return;
                }
                system.setNote(
                  hasFromStartUpload
                    ? uploadedFilesBuildSummary(uploadResult)
                    : addedFilesSummary(uploadResult),
                  Object.fromEntries(
                    Object.entries(applicationDocument.content().files).filter(
                      ([path]) => isNewIntakeFile(path),
                    ),
                  ),
                );
                let activeElement = document.activeElement,
                  hasFocusedTextInput =
                    activeElement instanceof HTMLElement &&
                    (activeElement.isContentEditable ||
                      /^(INPUT|TEXTAREA|SELECT)$/.test(
                        activeElement.tagName,
                      ));
                if (
                  currentSectionRef.current === sectionAtStart &&
                  getTokenDialog() === null &&
                  !uploadPanelVisibleRef.current &&
                  !hasFocusedTextInput
                ) {
                  jumpToSection(
                    Object.keys(uploadResult.assets).length === 0 && uploadResult.fonts > 0
                      ? "type"
                      : "assets",
                  );
                }
                let hasPendingManualEdits = hadExistingEdits && applicationDocument.saveMode() !== "auto";
                announceIntakeOutcome(uploadResult, !hasPendingManualEdits, hasFromStartUpload);
                if (hasPendingManualEdits) {
                  return;
                }
                editor.seal();
                system.holdAutosave = false;
                setIntakeProgress("Saving…");
                intakeSavingRef.current = true;
                await applicationDocument.save();
                intakeSavingRef.current = false;
                setIntakeProgress(null);
                let intakeSaveState = applicationDocument.saveState();
                if (intakeSaveState.status === "error") {
                  showEditorNotification(
                    uiMessage("design-system.designSystemApp.theFilesAreInBut") +
                      intakeSaveState.message +
                      (applicationDocument.saveMode() === "auto"
                        ? ""
                        : " Press Save to retry."),
                  );
                }
              })
              .finally(() => {
                system.holdAutosave = false;
                intakeSavingRef.current = false;
                intakeRunningRef.current = false;
                setIntakeBusy(false);
              });
            return true;
          };
  return addFiles;
}

import { uiMessage } from "@minedesign/contracts/ui-messages";
import type {
  ApplicationCommands,
  ApplicationDocument,
  ApplicationStore,
  ConfirmationState,
} from "../../contracts/application";
import { showEditorNotification } from "../../editor/editable-name";
import {
  assessAssetReclamation,
  deleteStoredAssets,
  excludePublishedAssets,
  publishedPageBlobIds,
  RECLAIM_LIST_FAILED_MESSAGE,
  RECLAIM_NOTHING_UNUSED_MESSAGE,
  RECLAIM_RECONNECTING_MESSAGE,
  RECLAIM_SAVE_FIRST_MESSAGE,
  RECLAIM_SAVING_MESSAGE,
  RECLAIM_WINDOWED_COLLECTION_MESSAGE,
  reclaimAssetsButtonLabel,
  reclaimAssetsConfirmation,
  reclaimAssetsResultMessage,
  refreshAssetsCatalog,
} from "../../model/asset-store";
import { reactArtifactRoot as React } from "../../ui/disclosure";

interface StorageReclaimOptions {
  editable: ApplicationCommands | undefined;
  editor: ApplicationCommands;
  applicationDocument: ApplicationDocument;
  system: ApplicationStore;
  /** 当前可释放素材的评估；尚未列出时为 null。 */
  blobAnalysis: ReturnType<typeof assessAssetReclamation>;
  /** 删除期间标记正在释放的素材，供评估排除。 */
  freeingBlobIdsRef: { current: Set<string> };
  askConfirmation(state: ConfirmationState): void;
}

/** 释放未使用素材：先确保内容已保存，再确认、删除并清空撤销历史。 */
export function useStorageReclaim({
  editable,
  editor,
  applicationDocument,
  system,
  blobAnalysis,
  freeingBlobIdsRef,
  askConfirmation,
}: StorageReclaimOptions) {
  const [freeing, setFreeing]: [boolean, (next: boolean) => void] =
    React.useState(false);
  let freeSpaceLabel =
      editable === undefined || freeing || blobAnalysis === null
        ? ""
        : reclaimAssetsButtonLabel(
            blobAnalysis.reclaimableBytes,
            blobAnalysis.reclaimable.length,
            undefined,
            blobAnalysis.windowed,
          ),
    documentStillLoading = () =>
      "loadState" in applicationDocument && applicationDocument.saveState().status !== "ready",
    afterContentSaved = (afterSave: () => void) => {
      let callback = () =>
        documentStillLoading()
          ? showEditorNotification(
              RECLAIM_RECONNECTING_MESSAGE,
            )
          : afterSave();
      if (!applicationDocument.dirty()) {
        return callback();
      }
      if (applicationDocument.saveMode() !== "auto") {
        return showEditorNotification(
          RECLAIM_SAVE_FIRST_MESSAGE,
        );
      }
      if (system.holdAutosave) {
        return showEditorNotification(
          uiMessage("design-system.designSystemApp.addingYourFilesFirstTry"),
        );
      }
      applicationDocument.save().then(() => {
        if (!applicationDocument.dirty()) {
          return callback();
        }
        let value = applicationDocument.saveState();
        showEditorNotification(
          value.status === "error"
            ? uiMessage("design-system.designSystemApp.yourLatestChangesCouldNot") +
                (value.message ?? "")
            : RECLAIM_SAVING_MESSAGE,
        );
      });
    },
    freeStorage = () =>
      afterContentSaved(() => {
        let value = assessAssetReclamation(
          system.getSnapshot().files,
        );
        if (value?.windowed === true) {
          return showEditorNotification(
            RECLAIM_WINDOWED_COLLECTION_MESSAGE,
          );
        }
        if (value === null || value.reclaimable.length === 0) {
          return;
        }
        setFreeing(true);
        publishedPageBlobIds()
          .then((reclaimResult) => {
            if (applicationDocument.dirty() || documentStillLoading()) {
              showEditorNotification(
                !applicationDocument.dirty()
                  ? RECLAIM_RECONNECTING_MESSAGE
                  : applicationDocument.saveMode() === "auto"
                    ? RECLAIM_SAVING_MESSAGE
                    : RECLAIM_SAVE_FIRST_MESSAGE,
              );
              return;
            }
            let reclaimAssessment = assessAssetReclamation(
              system.getSnapshot().files,
            );
            if (reclaimAssessment === null || reclaimAssessment.windowed) {
              showEditorNotification(
                reclaimAssessment === null
                  ? RECLAIM_LIST_FAILED_MESSAGE
                  : RECLAIM_WINDOWED_COLLECTION_MESSAGE,
              );
              return;
            }
            let values = new Set(
                reclaimAssessment.reclaimable.map((asset) => asset.id),
              ),
              reclaimableAssets = excludePublishedAssets(
                value.reclaimable.filter((asset) => values.has(asset.id)),
                reclaimResult,
              );
            if (reclaimableAssets.length === 0) {
              showEditorNotification(
                RECLAIM_NOTHING_UNUSED_MESSAGE,
              );
              return;
            }
            freeingBlobIdsRef.current = new Set(
              reclaimableAssets.map((asset) => asset.id),
            );
            return deleteStoredAssets(reclaimableAssets).then((deleteResult) => {
              if (deleteResult.freed.size > 0) {
                editor.undo.clear();
              }
              showEditorNotification(
                reclaimAssetsResultMessage(deleteResult),
              );
            });
          })
          .finally(() => {
            freeingBlobIdsRef.current = new Set();
            setFreeing(false);
          });
      }),
    askFreeStorage = () =>
      afterContentSaved(() => {
        refreshAssetsCatalog().then(() => {
          let value = assessAssetReclamation(
            system.getSnapshot().files,
          );
          if (value === null || value.reclaimable.length === 0) {
            showEditorNotification(
              value === null
                ? RECLAIM_LIST_FAILED_MESSAGE
                : value.windowed
                  ? RECLAIM_WINDOWED_COLLECTION_MESSAGE
                  : RECLAIM_NOTHING_UNUSED_MESSAGE,
            );
            return;
          }
          askConfirmation({
            get title() { return uiMessage("design-system.designSystemApp.freeSpace"); },
            body: reclaimAssetsConfirmation(
              value.reclaimable.length,
              value.reclaimableBytes,
            ),
            get confirmLabel() { return uiMessage("design-system.designSystemApp.deletePermanently"); },
            run: freeStorage,
          });
        });
      });

  return { freeing, freeSpaceLabel, askFree: askFreeStorage };
}

import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { validateAssetGroupName } from "./asset-group-editor";
import { commentTargetProps } from "./comment-anchors";
import { FileDropZone, PendingUploadFiles, reactAssetFileDrop } from "./file-drop";
import { BLOCK_FILE_DROP_HANDLERS } from "./shadows";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip } from "../ui/avatars";
import { Button } from "../ui/buttons";
import { Dialog } from "../ui/dialog";
import { FieldComponents } from "../ui/field";
import { CdsRoot } from "../ui/overlays";
import { TextInput } from "../ui/text-input";

var jsxNewAssetGroupDialog: typeof import("react/jsx-runtime");
var NEW_ASSET_GROUP_INPUT_PROPS: {
  autoComplete: string;
  [attribute: `data-${string}`]: string;
};
function NewAssetGroupDialog({
  groups: groups,
  onCreate: onCreate,
  onClose: onClose,
  onLeftOut: onLeftOut,
  "data-testid": dataTestid = "ds-newset",
}: Editor.NewAssetGroupDialogProps): React.ReactElement {
  useUiLocale();
  let [value, setGroupName] = (reactAssetFileDrop as typeof React).useState(
      "",
    ),
    [files, setFiles] = (reactAssetFileDrop as typeof React).useState<
      File[]
    >([]),
    normalizedName = value.replace(/\s+/g, " ").trim(),
    nameError =
      normalizedName === ""
        ? null
        : validateAssetGroupName(normalizedName, "", groups),
    disabledReason =
      normalizedName === ""
        ? uiMessage("design-system.newAssetGroup.nameTheSet")
        : nameError !== null
          ? nameError
          : files.length === 0
            ? uiMessage("design-system.newAssetGroup.aSetStartsWithIts")
            : undefined,
    callback = (selectedFiles: File[]) =>
      setFiles((existingFiles) => [
        ...existingFiles,
        ...selectedFiles.filter(
          (candidateFile): boolean =>
            !existingFiles.some(
              (file) =>
                file.name === candidateFile.name && file.size === candidateFile.size,
            ),
        ),
      ]),
    handleCreate = (): void => {
      if (disabledReason !== undefined) {
        return;
      }
      onCreate(normalizedName, files);
    };
  return (
    <div className={"contents"} {...BLOCK_FILE_DROP_HANDLERS}>
      <CdsRoot density={"compact"} className={"contents"}>
        <Dialog.Root
          open={true}
          onOpenChange={(isOpen: boolean): void => {
            if (!isOpen) {
              onClose();
            }
          }}
        >
          <Dialog.Popup
            size={"sm"}
            className={"max-w-[22.5rem]"}
            aria-label={uiMessage("design-system.newAssetGroup.newSet")}
            data-testid={dataTestid}
            {...commentTargetProps("dialog", "new-set")}
          >
            {[<Dialog.Header showClose={true}>
                {uiMessage("design-system.newAssetGroup.newSet")}
              </Dialog.Header>, <form
                className={"mt-md flex flex-col gap-2"}
                autoComplete={"off"}
                noValidate={true}
                onSubmit={(event: React.FormEvent<HTMLFormElement>): void => {
                  event.preventDefault();
                  handleCreate();
                }}
              >
                {[<FieldComponents.Root
                    invalid={nameError !== null || undefined}
                    className={"flex flex-col gap-xs"}
                  >
                    {[<FieldComponents.Label>
                        {uiMessage("design-system.newAssetGroup.name")}
                      </FieldComponents.Label>, <TextInput
                        {...NEW_ASSET_GROUP_INPUT_PROPS}
                        autoFocus={true}
                        value={value}
                        placeholder={uiMessage("design-system.newAssetGroup.eGLogos")}
                        spellCheck={false}
                        aria-label={uiMessage("design-system.newAssetGroup.name")}
                        data-testid={dataTestid + "-name"}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => setGroupName(event.currentTarget.value)}
                      />, nameError !== null ? (
                        <FieldComponents.Error match={true}>
                          {nameError}
                        </FieldComponents.Error>
                      ) : null]}
                  </FieldComponents.Root>, <FileDropZone
                    onFiles={callback}
                    onLeftOut={onLeftOut}
                    testid={dataTestid}
                  />, files.length > 0 ? (
                    <PendingUploadFiles
                      files={files}
                      onRemove={(fileIndex: number) =>
                        setFiles((currentFiles) =>
                          currentFiles.filter(
                            (file, index): boolean => index !== fileIndex,
                          ),
                        )
                      }
                      testid={dataTestid}
                    />
                  ) : null, <Dialog.Footer align={"end"}>
                    {[<Button
                        variant={"ghost"}
                        onClick={onClose}
                        data-testid={dataTestid + "-cancel"}
                      >
                        {uiMessage("design-system.newAssetGroup.cancel")}
                      </Button>, <DisabledReasonTooltip reason={disabledReason}>
                        <Button
                          variant={"primary"}
                          type={"submit"}
                          disabled={disabledReason !== undefined}
                          data-testid={dataTestid + "-submit"}
                        >
                          {uiMessage("design-system.newAssetGroup.createSet")}
                        </Button>
                      </DisabledReasonTooltip>]}
                  </Dialog.Footer>]}
              </form>]}
          </Dialog.Popup>
        </Dialog.Root>
      </CdsRoot>
    </div>
  );
}
export {
  jsxNewAssetGroupDialog,
  NEW_ASSET_GROUP_INPUT_PROPS,
  NewAssetGroupDialog,
};
export function installEditorNewAssetGroup(): () => void {
  return () => {
    jsxNewAssetGroupDialog = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    NEW_ASSET_GROUP_INPUT_PROPS = {
      autoComplete: "off",
      "data-1p-ignore": "true",
      "data-lpignore": "true",
      "data-bwignore": "true",
      "data-form-type": "other",
    };
  };
}

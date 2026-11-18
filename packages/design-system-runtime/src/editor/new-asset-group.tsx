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
  let [value, value2] = (reactAssetFileDrop as typeof React).useState(
      "",
    ),
    [value3, value4] = (reactAssetFileDrop as typeof React).useState<
      File[]
    >([]),
    value5 = value.replace(/\s+/g, " ").trim(),
    value6 =
      value5 === ""
        ? null
        : validateAssetGroupName(value5, "", groups),
    value7 =
      value5 === ""
        ? uiMessage("design-system.newAssetGroup.nameTheSet")
        : value6 !== null
          ? value6
          : value3.length === 0
            ? uiMessage("design-system.newAssetGroup.aSetStartsWithIts")
            : undefined,
    callback = (input: File[]) =>
      value4((input2) => [
        ...input2,
        ...input.filter(
          (input3): boolean =>
            !input2.some(
              (input4) =>
                input4.name === input3.name && input4.size === input3.size,
            ),
        ),
      ]),
    callback2 = (): void => {
      if (value7 !== undefined) {
        return;
      }
      onCreate(value5, value3);
    };
  return (
    <div className={"contents"} {...BLOCK_FILE_DROP_HANDLERS}>
      <CdsRoot density={"compact"} className={"contents"}>
        <Dialog.Root
          open={true}
          onOpenChange={(input: boolean): void => {
            if (!input) {
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
                  callback2();
                }}
              >
                {[<FieldComponents.Root
                    invalid={value6 !== null || undefined}
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
                          input: React.ChangeEvent<HTMLInputElement>,
                        ) => value2(input.currentTarget.value)}
                      />, value6 !== null ? (
                        <FieldComponents.Error match={true}>
                          {value6}
                        </FieldComponents.Error>
                      ) : null]}
                  </FieldComponents.Root>, <FileDropZone
                    onFiles={callback}
                    onLeftOut={onLeftOut}
                    testid={dataTestid}
                  />, value3.length > 0 ? (
                    <PendingUploadFiles
                      files={value3}
                      onRemove={(input: number) =>
                        value4((input2) =>
                          input2.filter(
                            (input3, options): boolean => options !== input,
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
                      </Button>, <DisabledReasonTooltip reason={value7}>
                        <Button
                          variant={"primary"}
                          type={"submit"}
                          disabled={value7 !== undefined}
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

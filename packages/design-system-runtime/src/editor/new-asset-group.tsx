import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { bindRuntimeValue, type RuntimeBindings } from "../runtime-types";
export function installEditorNewAssetGroup(
  runtime: RuntimeBindings,
): () => void {
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
    let [value, value2] = (runtime.reactAssetFileDrop as typeof React).useState(
        "",
      ),
      [value3, value4] = (runtime.reactAssetFileDrop as typeof React).useState<
        File[]
      >([]),
      value5 = value.replace(/\s+/g, " ").trim(),
      value6 =
        value5 === ""
          ? null
          : (0, runtime.validateAssetGroupName)(value5, "", groups),
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
      <div className={"contents"} {...runtime.BLOCK_FILE_DROP_HANDLERS}>
        <runtime.CdsRoot density={"compact"} className={"contents"}>
          <runtime.Dialog.Root
            open={true}
            onOpenChange={(input: boolean): void => {
              if (!input) {
                onClose();
              }
            }}
          >
            <runtime.Dialog.Popup
              size={"sm"}
              className={"max-w-[22.5rem]"}
              aria-label={uiMessage("design-system.newAssetGroup.newSet")}
              data-testid={dataTestid}
              {...(0, runtime.commentTargetProps)("dialog", "new-set")}
            >
              {[<runtime.Dialog.Header showClose={true}>
                  {uiMessage("design-system.newAssetGroup.newSet")}
                </runtime.Dialog.Header>, <form
                  className={"mt-md flex flex-col gap-2"}
                  autoComplete={"off"}
                  noValidate={true}
                  onSubmit={(event: React.FormEvent<HTMLFormElement>): void => {
                    event.preventDefault();
                    callback2();
                  }}
                >
                  {[<runtime.FieldComponents.Root
                      invalid={value6 !== null || undefined}
                      className={"flex flex-col gap-xs"}
                    >
                      {[<runtime.FieldComponents.Label>
                          {uiMessage("design-system.newAssetGroup.name")}
                        </runtime.FieldComponents.Label>, <runtime.TextInput
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
                          <runtime.FieldComponents.Error match={true}>
                            {value6}
                          </runtime.FieldComponents.Error>
                        ) : null]}
                    </runtime.FieldComponents.Root>, <runtime.FileDropZone
                      onFiles={callback}
                      onLeftOut={onLeftOut}
                      testid={dataTestid}
                    />, value3.length > 0 ? (
                      <runtime.PendingUploadFiles
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
                    ) : null, <runtime.Dialog.Footer align={"end"}>
                      {[<runtime.Button
                          variant={"ghost"}
                          onClick={onClose}
                          data-testid={dataTestid + "-cancel"}
                        >
                          {uiMessage("design-system.newAssetGroup.cancel")}
                        </runtime.Button>, <runtime.DisabledReasonTooltip reason={value7}>
                          <runtime.Button
                            variant={"primary"}
                            type={"submit"}
                            disabled={value7 !== undefined}
                            data-testid={dataTestid + "-submit"}
                          >
                            {uiMessage("design-system.newAssetGroup.createSet")}
                          </runtime.Button>
                        </runtime.DisabledReasonTooltip>]}
                    </runtime.Dialog.Footer>]}
                </form>]}
            </runtime.Dialog.Popup>
          </runtime.Dialog.Root>
        </runtime.CdsRoot>
      </div>
    );
  }
  bindRuntimeValue(
    runtime,
    "jsxNewAssetGroupDialog",
    () => jsxNewAssetGroupDialog,
    (value) => {
      jsxNewAssetGroupDialog = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "NEW_ASSET_GROUP_INPUT_PROPS",
    () => NEW_ASSET_GROUP_INPUT_PROPS,
    (value) => {
      NEW_ASSET_GROUP_INPUT_PROPS = value;
    },
  );
  bindRuntimeValue(runtime, "NewAssetGroupDialog", () => NewAssetGroupDialog);
  return () => {
    jsxNewAssetGroupDialog = (0, runtime.toModuleNamespace)(
      (0, runtime.loadJsxNamespace)(),
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

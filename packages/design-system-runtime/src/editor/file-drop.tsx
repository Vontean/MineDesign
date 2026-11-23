import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { extractDroppedFiles, MAX_DROPPED_FILES } from "./asset-upload";
import { pickUploadFiles } from "./upload-pipeline";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { Icon } from "../ui/interactions";

var reactAssetFileDrop: typeof import("react");
var reactFileDrop: typeof import("react");
var jsxFileDrop: typeof import("react/jsx-runtime");
function FileDropZone({
  onFiles: onFiles,
  onLeftOut: onLeftOut,
  folder = false,
  large = false,
  line = uiMessage("design-system.fileDrop.dropFilesHereOr"),
  hint: hint,
  testid: testid,
}: Editor.FileDropZoneProps): React.ReactElement {
  useUiLocale();
  let [value, setDragging] = reactFileDrop.useState(false),
    ref = reactFileDrop.useRef<HTMLInputElement | null>(null),
    callback = (items: File[], startIndex: number = 0): void => {
      let leftOutCount =
        startIndex + Math.max(0, items.length - MAX_DROPPED_FILES);
      if (leftOutCount > 0) {
        onLeftOut?.(leftOutCount);
      }
      if (items.length > 0) {
        onFiles(items.slice(0, MAX_DROPPED_FILES));
      }
    },
    handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
      if (!event.dataTransfer.types.includes("Files")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);
      extractDroppedFiles(event.dataTransfer).then((dropResult) =>
        callback(dropResult.files, dropResult.leftOut),
      );
    };
  return (
    <div
      className={
        "ds-file-drop" +
        (large ? " ds-file-drop-lg" : "") +
        (value ? " ds-file-drop-over" : "")
      }
      data-testid={testid + "-drop"}
      onDragEnter={(event: React.DragEvent<HTMLDivElement>): void => {
        if (event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          event.stopPropagation();
          setDragging(true);
        }
      }}
      onDragOver={(event: React.DragEvent<HTMLDivElement>): void => {
        if (event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {[<Icon name={"Upload"} size={large ? "lg" : "md"} />, <span className={"text-center text-body text-secondary"}>
          {line}
        </span>, hint !== undefined ? (
          <span className={"text-center text-footnote text-secondary"}>
            {hint}
          </span>
        ) : null, <span className={"flex flex-wrap items-center justify-center gap-sm"}>
          {[<Button
              variant={large ? "ghost" : "secondary"}
              size={"sm"}
              onClick={() => ref.current?.click()}
              data-testid={testid + "-choose"}
            >
              {uiMessage("design-system.fileDrop.chooseFiles")}
            </Button>, folder ? (
              <Button
                variant={large ? "ghost" : "secondary"}
                size={"sm"}
                onClick={() =>
                  void pickUploadFiles(true).then((pickedFiles) =>
                    callback(pickedFiles),
                  )
                }
                data-testid={testid + "-folder"}
              >
                {uiMessage("design-system.fileDrop.chooseAFolder")}
              </Button>
            ) : null]}
        </span>, <input
          ref={ref}
          type={"file"}
          multiple={true}
          hidden={true}
          data-testid={testid + "-input"}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
            callback(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
        />]}
    </div>
  );
}
function PendingUploadFiles({
  files: files,
  onRemove: onRemove,
  testid: testid,
}: Editor.PendingUploadFilesProps): React.ReactElement {
  useUiLocale();
  return (
    <ul
      className={"ds-file-rows flex flex-col"}
      data-testid={testid + "-files"}
    >
      {files.map((file, fileIndex) =>
        (() => {
          const _Element = "li";
          const _elementProps = {
            className: "flex min-h-6 min-w-0 items-center gap-sm",
            children: [
              <span
                className={"min-w-0 flex-1 truncate font-mono text-footnote"}
                title={file.name}
              >
                {file.name}
              </span>,
              onRemove !== undefined ? (
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  iconOnly={true}
                  icon={"X"}
                  aria-label={uiMessage("design-system.fileDrop.remove2", { subject: String(file.name) })}
                  tooltip={uiMessage("design-system.fileDrop.remove")}
                  onClick={() => onRemove(fileIndex)}
                  data-testid={testid + "-remove-" + String(fileIndex)}
                />
              ) : null,
            ],
          };
          const _elementKey = file.name + ":" + String(fileIndex);
          return <_Element key={_elementKey} {..._elementProps} />;
        })(),
      )}
    </ul>
  );
}
export {
  FileDropZone,
  jsxFileDrop,
  PendingUploadFiles,
  reactAssetFileDrop,
  reactFileDrop,
};
export function installEditorFileDrop(): () => void {
  return () => {
    reactAssetFileDrop = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactFileDrop = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxFileDrop = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}

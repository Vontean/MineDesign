import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { AssetContextMenu, NEW_ASSET_GROUP_SENTINEL } from "./asset-context-menu";
import { useAssetGridInteractions } from "./asset-interactions";
import { performDesignSystemEdit, reactAssetGroupEditor } from "./edit-dispatch";
import { showEditorNotification } from "./editable-name";
import { assetGroupDisplayName, ASSETS_SECTION_LABEL } from "./view-model";
import { assetGroupFilePaths, deleteAssetFiles, moveAssetsToGroup, parseAssetGroupPath, renameAssetGroup } from "../model/asset-commands";
import { UNGROUPED_ASSETS_NAME } from "../model/derive-system";
import { isValidDesignSystemPath, RESERVED_PROTOTYPE_NAMES } from "../model/file-policy";
import { isAssetGroupName, MAX_ASSET_GROUP_NAME_LENGTH } from "../model/manifest-metadata";
import { remoteTextEntry } from "../model/remote-text";
import { toModuleNamespace } from "../module-helpers";
import { useCoarsePointer } from "../ui/select";

var jsxAssetGroupEditor: typeof import("react/jsx-runtime");
var NEW_ASSET_GROUP_PLACEHOLDER: string;
function validateAssetGroupName(
  name: string,
  currentName: string,
  taken: string[],
): string | null {
  if (/[/\\]/.test(name)) {
    return uiMessage("design-system.assetGroupEditor.setNamesCanTContain");
  }
  if (name.length > MAX_ASSET_GROUP_NAME_LENGTH) {
    return (
      uiMessage("design-system.assetGroupEditor.thatNameIsTooLong") +
      String(MAX_ASSET_GROUP_NAME_LENGTH) +
      " characters."
    );
  }
  if (
    !isAssetGroupName(name) ||
    !isValidDesignSystemPath("assets/" + name + "/x")
  ) {
    return uiMessage("design-system.assetGroupEditor.setNamesCanTContain2");
  }
  if (
    name === "." ||
    name === ".." ||
    RESERVED_PROTOTYPE_NAMES.has(name) ||
    name === UNGROUPED_ASSETS_NAME ||
    name === ASSETS_SECTION_LABEL
  ) {
    return "“" + name + "” is reserved. Pick another name.";
  }
  if (name !== currentName && taken.includes(name)) {
    return (
      uiMessage("design-system.assetGroupEditor.thereIsAlreadyASet") +
      name +
      "”. Pick another name, or drag these files onto it."
    );
  }
  return null;
}
function nextAssetGroupName(names: string[]): string {
  let name: string = "Set";
  for (let count: number = 2; names.includes(name); count++) {
    name = uiMessage("design-system.assetGroupEditor.set") + String(count);
  }
  return name;
}
function assetFileCountLabel(count: number): string {
  if (count === 1) {
    return "1 file";
  } else {
    return String(count) + " files";
  }
}
function useAssetGroupEditor(
  editorOptions: Editor.AssetGroupEditorOptions,
): Editor.AssetGroupEditorResult {
  let { groups: value, edit: editContent, scroller: assetScroller } = editorOptions,
    ref = (reactAssetGroupEditor as typeof React).useRef(editorOptions);
  ref.current = editorOptions;
  let getGroupName = assetGroupDisplayName,
    isCoarsePointer = useCoarsePointer(),
    memo = (reactAssetGroupEditor as typeof React).useMemo(
      () =>
        value.flatMap((group) => group.assets.map((asset) => asset.path)),
      [value],
    ),
    assetMetadata = (reactAssetGroupEditor as typeof React).useMemo<
      Map<string, Application.EditorAsset>
    >(
      () =>
        new Map(
          value.flatMap((groupRecord) =>
            groupRecord.assets.map((asset) => [asset.path, asset]),
          ),
        ),
      [value],
    ),
    [renamingName, setRenamingName] = (
      reactAssetGroupEditor as typeof React
    ).useState<string | null>(null),
    [renamingPath, setRenamingPath] = (
      reactAssetGroupEditor as typeof React
    ).useState<string | null>(null),
    editorControllerRef = (
      reactAssetGroupEditor as typeof React
    ).useRef<Editor.AssetGridInteractions | null>(null),
    callback = () => ({
      nameOf: (path: string) =>
        assetMetadata.get(path)?.name ?? path.slice(path.lastIndexOf("/") + 1),
      ask: (confirmation: Omit<Application.ConfirmationState, "confirmLabel">) =>
        ref.current.askRemove(confirmation),
    }),
    handleDrop = (reactAssetGroupEditor as typeof React).useCallback(
      (items: string[], source: Model.AssetDropTarget): void => {
        if (editContent === undefined || items.length === 0) {
          return;
        }
        let groups = ref.current.groups,
          isNewGroup: boolean = source.kind === "new",
          targetGroup = isNewGroup
            ? nextAssetGroupName(groups.map((asset) => asset.name))
            : (
                source as Exclude<
                  Model.AssetDropTarget,
                  {
                    kind: "new";
                  }
                >
              ).group,
          targetPath =
            source.kind === "slot"
              ? source.before
              : source.kind === "group"
                ? null
                : undefined,
          values = new Set(items.map((assetId) => assetMetadata.get(assetId)?.group)),
          isMoveWithinGroup = !isNewGroup && values.size === 1 && values.has(targetGroup),
          applyMove = (content: Model.DesignSystemContent) =>
            moveAssetsToGroup(content, items, targetGroup, targetPath);
        performDesignSystemEdit(
          editContent,
          applyMove,
          (): boolean => {
            let files = editContent.content().files;
            if (
              !editContent.exec(
                (isMoveWithinGroup ? uiMessage("design-system.assetGroupEditor.reorder") : uiMessage("design-system.assetGroupEditor.move")) +
                  assetFileCountLabel(items.length) +
                  " to " +
                  targetGroup,
                applyMove,
              )
            ) {
              return false;
            }
            let folderPrefix: string =
                targetGroup === UNGROUPED_ASSETS_NAME
                  ? "assets/"
                  : "assets/" + targetGroup + "/",
              fileTable = editContent.content().files,
              selectedPaths = [
                ...items.filter((path) => Object.hasOwn(fileTable, path)),
                ...Object.keys(fileTable).filter(
                  (path) =>
                    !Object.hasOwn(files, path) &&
                    path.startsWith(folderPrefix) &&
                    !path.slice(folderPrefix.length).includes("/"),
                ),
              ];
            editorControllerRef.current?.selection.set(selectedPaths);
            if (isNewGroup) {
              setRenamingName(targetGroup);
              ref.current.reveal({
                kind: "assets",
                key: targetGroup,
              });
            } else {
              editorControllerRef.current?.focus(selectedPaths[0] ?? null);
            }
            let length = items.filter(
              (path) =>
                Object.hasOwn(fileTable, path) &&
                assetMetadata.get(path)?.group !== targetGroup,
            ).length;
            if (length > 0) {
              showEditorNotification(
                assetFileCountLabel(length) + " couldn’t be moved",
              );
            }
            return true;
          },
          callback(),
        );
      },
      [editContent, assetMetadata],
    ),
    handleRemove = (reactAssetGroupEditor as typeof React).useCallback(
      (items: string[]): void => {
        if (editContent === undefined || items.length === 0) {
          return;
        }
        let selectedItems = items.filter(
          (text: string): boolean =>
            remoteTextEntry(text) !== undefined,
        );
        if (selectedItems.length > 0) {
          showEditorNotification(
            (selectedItems.length === 1
              ? (assetMetadata.get(selectedItems[0])?.name ?? "1 file") + " is"
              : assetFileCountLabel(selectedItems.length) + " are") +
              " kept in this system’s store as code — remove " +
              (selectedItems.length === 1 ? "it" : "them") +
              // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              " with the agent for now",
          );
          items = items.filter(
            (text: string): boolean =>
              remoteTextEntry(text) === undefined,
          );
          if (items.length === 0) {
            return;
          }
        }
        let focusNextAsset = (): void => {
          let values = new Set(items),
            currentIndex = memo.indexOf(items[0]),
            nextPath =
              memo
                .slice(currentIndex + 1)
                .find((group: string): boolean => !values.has(group)) ??
              memo
                .slice(0, Math.max(0, currentIndex))
                .reverse()
                .find((group: string): boolean => !values.has(group)) ??
              null,
            deleteFiles = (content: Model.DesignSystemContent) =>
              deleteAssetFiles(content, items);
          performDesignSystemEdit(
            editContent,
            deleteFiles,
            (removeOptions?: { withoutBytes: string[] }): boolean => {
              if (
                !editContent.exec(
                  uiMessage("design-system.assetGroupEditor.remove2") + assetFileCountLabel(items.length),
                  deleteFiles,
                  removeOptions,
                )
              ) {
                return false;
              }
              let removedPath: string =
                  uiMessage("design-system.assetGroupEditor.removed") +
                  (items.length === 1
                    ? (assetMetadata.get(items[0])?.name ?? "1 file")
                    : assetFileCountLabel(items.length)),
                length = editContent.lastNotUndoable().length;
              if (length === 0) {
                ref.current.removed(removedPath);
              } else if (length >= items.length) {
                showEditorNotification(
                  removedPath + ". This cannot be undone.",
                );
              } else {
                ref.current.removed(
                  removedPath +
                    ". Undo brings back all but " +
                    assetFileCountLabel(length) +
                    ".",
                );
              }
              editorControllerRef.current?.focus(nextPath);
              return true;
            },
            callback(),
            "removal",
          );
        };
        if (items.length === 1) {
          focusNextAsset();
        } else {
          ref.current.askRemove({
            get title() { return uiMessage("design-system.assetGroupEditor.remove", { subject: String(assetFileCountLabel(items.length)) }); },
            body: "The files are deleted from assets/. Anything linking to them will break. Undo brings them back.",
            run: focusNextAsset,
          });
        }
      },
      [editContent, assetMetadata, memo],
    ),
    gridInteractions = useAssetGridInteractions({
      order: memo,
      editable: editContent !== undefined,
      coarse: isCoarsePointer,
      scroller: assetScroller,
      onOpen: (path: string) => ref.current.openAsset(path),
      onDrop: handleDrop,
      onRemove: handleRemove,
    });
  editorControllerRef.current = gridInteractions;
  let moveToGroup = (
      assets: Application.EditorAsset[],
      targetGroup: string | symbol,
    ) =>
      handleDrop(
        assets.map((asset) => asset.path),
        targetGroup === NEW_ASSET_GROUP_SENTINEL
          ? {
              kind: "new",
            }
          : {
              kind: "group",
              group: targetGroup as string,
            },
      ),
    assetItems =
      gridInteractions.menu === null
        ? []
        : gridInteractions.menu.paths.flatMap((path: string) => {
            let entry = assetMetadata.get(path);
            if (entry !== undefined) {
              return [entry];
            } else {
              return [];
            }
          }),
    overlay = (
      <AssetContextMenu
        at={gridInteractions.menu}
        anchor={gridInteractions.menu?.anchor}
        onClose={gridInteractions.closeMenu}
        items={assetItems}
        groups={value}
        onOpen={(asset: Application.EditorAsset) =>
          ref.current.openAsset(asset.path)
        }
        onDownload={(asset: Application.EditorAsset) =>
          ref.current.downloadAsset(asset)
        }
        edit={
          editContent === undefined
            ? undefined
            : {
                rename: (asset: Application.EditorAsset): void => {
                  setRenamingPath(asset.path);
                  ref.current.openAsset(asset.path);
                },
                moveTo: moveToGroup,
                remove: (assets: Application.EditorAsset[]) =>
                  handleRemove(assets.map((asset) => asset.path)),
              }
        }
      />
    );
  return {
    tiles: gridInteractions,
    headFor: (group: Application.EditorAssetGroup) =>
      editContent === undefined
        ? {}
        : {
            onRename: (name: string): void => {
              let normalizedName = name.replace(/\s+/g, " ").trim();
              if (normalizedName === "" || normalizedName === group.name) {
                return;
              }
              let items = [
                  ...new Set(
                    Object.keys(ref.current.files()).flatMap(
                      (groupPath) =>
                        parseAssetGroupPath(groupPath)?.group ?? [],
                    ),
                  ),
                ],
                validationError = validateAssetGroupName(normalizedName, group.name, items);
              if (validationError !== null) {
                showEditorNotification(validationError);
                return;
              }
              let renameGroup = (content: Model.DesignSystemContent) =>
                renameAssetGroup(content, group.name, normalizedName);
              performDesignSystemEdit(
                editContent,
                renameGroup,
                (): boolean => {
                  if (!editContent.exec(uiMessage("design-system.assetGroupEditor.renameGroup") + group.name, renameGroup)) {
                    showEditorNotification(
                      uiMessage("design-system.assetGroupEditor.couldNotRename") +
                        getGroupName(group.name) +
                        " to “" +
                        normalizedName +
                        "”. Try a different name.",
                    );
                    return false;
                  }
                  let relativePath = (path: string) =>
                      path.startsWith(group.folder) &&
                      (group.name !== UNGROUPED_ASSETS_NAME ||
                        !path.slice(group.folder.length).includes("/"))
                        ? "assets/" +
                          normalizedName +
                          "/" +
                          path.slice(group.folder.length)
                        : path,
                    current = editorControllerRef.current;
                  if (current !== undefined && current !== null) {
                    if (
                      current.selection.selected.some(
                        (path): boolean => relativePath(path) !== path,
                      )
                    ) {
                      current.selection.set(
                        current.selection.selected.map(relativePath),
                      );
                    }
                    let firstAssetPath = group.assets[0]?.path;
                    if (firstAssetPath !== undefined) {
                      current.focus(relativePath(firstAssetPath));
                    }
                  }
                  if (renamingName === group.name) {
                    setRenamingName(null);
                  }
                  return true;
                },
                callback(),
              );
            },
            onRemove: (): void => {
              let groupPaths = assetGroupFilePaths(
                  ref.current.files(),
                  group.name,
                ),
                remotePaths = groupPaths.filter(
                  (path: string): boolean =>
                    remoteTextEntry(path) !== undefined,
                ),
                localPaths = groupPaths.filter(
                  (path: string): boolean =>
                    remoteTextEntry(path) === undefined,
                );
              if (remotePaths.length > 0 && localPaths.length === 0) {
                showEditorNotification(
                  assetFileCountLabel(remotePaths.length) +
                    " in " +
                    getGroupName(group.name) +
                    " " +
                    (remotePaths.length === 1 ? "is" : "are") +
                    " kept in this system’s store as code — remove " +
                    (remotePaths.length === 1 ? "it" : "them") +
                    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                    " with the agent for now",
                );
                return;
              }
              ref.current.askRemove({
                get title() { return uiMessage("design-system.assetGroupEditor.removeAndIts", { subject: String(getGroupName(group.name)), detail: String(assetFileCountLabel(localPaths.length)) }); },
                body:
                  uiMessage("design-system.assetGroupEditor.theFilesAreDeletedFrom") +
                  group.folder +
                  ". Anything linking to them will break. Undo brings them back.",
                run: (): void => {
                  let groupIndex = memo.indexOf(group.assets[0]?.path ?? ""),
                    nextGroupPath =
                      memo
                        .slice(groupIndex + group.assets.length)
                        .find((): boolean => true) ??
                      (groupIndex > 0 ? memo[groupIndex - 1] : null) ??
                      null,
                    applyGroupRemoval = (content: Model.DesignSystemContent) =>
                      deleteAssetFiles(
                        content,
                        assetGroupFilePaths(
                          content.files,
                          group.name,
                        ).filter(
                          (path: string): boolean =>
                            remoteTextEntry(path) ===
                            undefined,
                        ),
                      );
                  performDesignSystemEdit(
                    editContent,
                    applyGroupRemoval,
                    (removeOptions?: { withoutBytes: string[] }): boolean => {
                      if (
                        !editContent.exec(
                          uiMessage("design-system.assetGroupEditor.removeGroup") + group.name,
                          applyGroupRemoval,
                          removeOptions,
                        )
                      ) {
                        return false;
                      }
                      let removedPath: string =
                          uiMessage("design-system.assetGroupEditor.removed") +
                          getGroupName(group.name) +
                          " and its " +
                          assetFileCountLabel(localPaths.length) +
                          (remotePaths.length > 0
                            ? " (" +
                              assetFileCountLabel(remotePaths.length) +
                              // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                              " of stored code kept — remove with the agent)"
                            : ""),
                        length = editContent.lastNotUndoable().length;
                      if (length === 0) {
                        ref.current.removed(removedPath);
                      } else if (length >= localPaths.length) {
                        showEditorNotification(
                          removedPath + ". This cannot be undone.",
                        );
                      } else {
                        ref.current.removed(
                          removedPath +
                            ". Undo brings back all but " +
                            assetFileCountLabel(length) +
                            ".",
                        );
                      }
                      editorControllerRef.current?.focus(nextGroupPath);
                      return true;
                    },
                    callback(),
                    "removal",
                  );
                },
              });
            },
            autoEdit:
              renamingName === group.name
                ? {
                    placeholder: uiMessage("design-system.assetGroupEditor.nameThisSet"),
                    onEnd: () => setRenamingName(null),
                  }
                : undefined,
          },
    overlay: overlay,
    renaming: renamingPath,
    clearRenaming: () => setRenamingPath(null),
    nameGroup: (groupName: string): void => {
      setRenamingName(groupName);
      ref.current.reveal({
        kind: "assets",
        key: groupName,
      });
    },
    remove: handleRemove,
  };
}
function get_NEW_ASSET_GROUP_PLACEHOLDER() {
  return uiMessage("design-system.assetGroupEditor.nameThisSet");
}
export {
  assetFileCountLabel,
  jsxAssetGroupEditor,
  get_NEW_ASSET_GROUP_PLACEHOLDER,
  nextAssetGroupName,
  useAssetGroupEditor,
  validateAssetGroupName,
};
export function installEditorAssetGroupEditor(): () => void {
  return () => {
    jsxAssetGroupEditor = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    NEW_ASSET_GROUP_PLACEHOLDER = "Name this set";
  };
}

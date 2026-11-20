import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { assetDownloadBlockedReason } from "./asset-details";
import { useDownloadsWithheld } from "./download-permission";
import { assetGroupDisplayName } from "./view-model";
import { toModuleNamespace } from "../module-helpers";
import { ContextMenu } from "../ui/context-menu";
import { Menu } from "../ui/menu";

var jsxAssetActions: typeof import("react/jsx-runtime");
var NEW_ASSET_GROUP_SENTINEL: symbol;
var SINGLE_FILE_ACTION_REASON: string;
var assetActionDisabledProps: (reason: string | undefined) => {
  disabled: boolean;
  disabledReason: string | null;
};
function AssetContextMenu({
  at: at2,
  anchor: anchor,
  onClose: onClose,
  items: items,
  groups: groups,
  onOpen: onOpen,
  onDownload: onDownload,
  edit: edit,
}: Editor.AssetContextMenuProps): React.ReactElement {
  useUiLocale();
  let value = items.length === 1 ? items[0] : undefined,
    disabledReason: string | undefined =
      value === undefined ? uiMessage("design-system.assetContextMenu.worksOnOneFileAt") : undefined,
    downloadsWithheld = useDownloadsWithheld(),
    groupActionDisabledProps =
      disabledReason ??
      (value !== undefined
        ? assetDownloadBlockedReason(value, downloadsWithheld)
        : undefined),
    length = items.length,
    groupDisplayName = assetGroupDisplayName,
    selectionTitle = value !== undefined ? value.name : String(length) + " files";
  return (
    <ContextMenu
      at={items.length > 0 ? at2 : null}
      anchor={anchor}
      onClose={onClose}
      title={selectionTitle}
      className={"min-w-[12rem]"}
    >
      {[<Menu.Item
          icon={"Expand"}
          {...assetActionDisabledProps(disabledReason)}
          onClick={() => value !== undefined && onOpen(value)}
          data-testid={"ds-amenu-open"}
        >
          {uiMessage("design-system.assetContextMenu.open")}
        </Menu.Item>, edit !== undefined ? (
          <Menu.Item
            icon={"Edit"}
            {...assetActionDisabledProps(disabledReason)}
            onClick={() => value !== undefined && edit.rename(value)}
            data-testid={"ds-amenu-rename"}
          >
            {uiMessage("design-system.assetContextMenu.rename")}
          </Menu.Item>
        ) : null, <Menu.Item
          icon={"Download"}
          {...assetActionDisabledProps(groupActionDisabledProps)}
          onClick={() => value !== undefined && onDownload(value)}
          data-testid={"ds-amenu-download"}
        >
          {uiMessage("design-system.assetContextMenu.download")}
        </Menu.Item>, edit !== undefined ? (
          <jsxAssetActions.Fragment>
            {[<Menu.Separator />, <Menu.Group>
                {[<Menu.GroupLabel>
                    {length > 1 ? (uiMessage("design-system.assetContextMenu.moveFilesTo", { value1: String(String(length)) })) : (uiMessage("design-system.assetContextMenu.moveTo"))}
                  </Menu.GroupLabel>, groups.map((group) =>
                    (() => {
                      const _Element = Menu.Item;
                      const _elementProps = {
                        icon: "Folder",
                        ...assetActionDisabledProps(
                          items.every(
                            (item): boolean => item.group === group.name,
                          )
                            ? (length > 1
                                ? uiMessage("design-system.assetContextMenu.theyAreAllIn")
                                : uiMessage("design-system.assetContextMenu.alreadyIn")) + groupDisplayName(group.name)
                            : undefined,
                        ),
                        onClick: () => edit.moveTo(items, group.name),
                        "data-testid": "ds-amenu-move-" + group.name,
                        children: groupDisplayName(group.name),
                      };
                      const _elementKey = group.name;
                      return (
                        <_Element key={_elementKey} {..._elementProps} />
                      );
                    })(),
                  ), <Menu.Item
                    icon={"FolderPlus"}
                    onClick={() =>
                      edit.moveTo(items, NEW_ASSET_GROUP_SENTINEL)
                    }
                    data-testid={"ds-amenu-move-new"}
                  >
                    {uiMessage("design-system.assetContextMenu.newSet")}
                  </Menu.Item>]}
              </Menu.Group>, <Menu.Separator />, <Menu.Item
                icon={"Trash"}
                variant={"danger"}
                onClick={() => edit.remove(items)}
                data-testid={"ds-amenu-remove"}
              >
                {length > 1 ? (uiMessage("design-system.assetContextMenu.removeFiles", { value1: String(String(length)) })) : (uiMessage("design-system.assetContextMenu.remove"))}
              </Menu.Item>]}
          </jsxAssetActions.Fragment>
        ) : null]}
    </ContextMenu>
  );
}
function get_SINGLE_FILE_ACTION_REASON() {
  return uiMessage("design-system.assetContextMenu.worksOnOneFileAt");
}
export {
  assetActionDisabledProps,
  AssetContextMenu,
  jsxAssetActions,
  NEW_ASSET_GROUP_SENTINEL,
  get_SINGLE_FILE_ACTION_REASON,
};
export function installEditorAssetContextMenu(): () => void {
  return () => {
    jsxAssetActions = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    NEW_ASSET_GROUP_SENTINEL = Symbol(uiMessage("design-system.assetContextMenu.newGroup"));
    SINGLE_FILE_ACTION_REASON = "Works on one file at a time";
    assetActionDisabledProps = (reason: string | undefined) => ({
      disabled: reason !== undefined,
      disabledReason: reason ?? null,
    });
  };
}

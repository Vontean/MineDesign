import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { reactAssetGroups, reactDomAssetGroups, useAssetThumbnailSources } from "./asset-thumbnails";
import { commentTargetId, commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { EditableName } from "./editable-name";
import { projectFilePath } from "./files-index";
import { addressedFileEntry } from "./published-preview";
import { RemoveRowButton } from "./row-context-menu";
import { SECTION_CARD_CLASS_NAME, SectionCard } from "./section-card";
import { assetGroupDisplayName } from "./view-model";
import { isWallAssetKind } from "../model/derive-system";
import { formatInlineBudgetBytes } from "../model/file-table";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { FILE_DROP_RING_CLASS, useFileDrop } from "../ui/file-drop";
import { TextLink } from "../ui/links";
import { joinClassNames, KitIcon } from "../ui/property-icons";

var jsxAssetGroups: typeof import("react/jsx-runtime");
var ASSET_SELECTION_CLASS_NAME: string;
var assetFileSizeLabel: (bytes: number | undefined) => string;
var MIN_ASSET_TILE_SIZE: number;
var EMPTY_ASSET_SELECTION_SET: ReadonlySet<string>;
var stopAssetInputKeyPropagation: (
  event: React.SyntheticEvent<HTMLElement>,
) => void;
function isReversedLogoAsset(asset: Pick<Application.EditorAsset,"name">): boolean {
  return /\b(white|reversed?|knockout|on[- ]dark|for[- ]dark)\b/i.test(
    asset.name,
  );
}
function isFileIconAsset(asset: Pick<Application.EditorAsset,"kind">): boolean {
  return isWallAssetKind(asset.kind);
}
function assetKindLabel(asset: Pick<Application.EditorAsset,"kind"|"ext">): {
  label: string;
  icon: string;
} {
  if (asset.kind === "font") {
    return {
      get label() { return uiMessage("design-system.assetGroups.font"); },
      icon: "TextAa",
    };
  }
  if (asset.kind === "video") {
    return {
      get label() { return uiMessage("design-system.assetGroups.video"); },
      icon: "Play",
    };
  }
  if (asset.kind === "audio") {
    return {
      get label() { return uiMessage("design-system.assetGroups.audio"); },
      icon: "Voice",
    };
  }
  switch (asset.ext) {
    case "css":
    case "json":
      return {
        label: asset.ext.toUpperCase(),
        icon: "CodeBrackets",
      };
    case "js":
    case "ts":
    case "tsx":
    case "jsx":
    case "html":
      return {
        label: asset.ext.toUpperCase(),
        icon: "Code",
      };
    case "md":
    case "txt":
    case "pdf":
      return {
        label: asset.ext === "md" ? "Markdown" : asset.ext.toUpperCase(),
        icon: "BookText",
      };
    default:
      return {
        get label() { return asset.ext !== "" ? (asset.ext.toUpperCase()) : (uiMessage("design-system.assetGroups.file")); },
        icon: "File",
      };
  }
}
function assetGroupRelativePath(
  asset: Application.EditorAsset,
  group: Application.EditorAssetGroup,
): string {
  if (
    asset.path.startsWith(group.folder) &&
    asset.path.length > group.folder.length
  ) {
    return asset.path.slice(group.folder.length);
  } else {
    return asset.name;
  }
}
function assetGroupRenderTiles(
  groups: Application.EditorAssetGroup[],
  drag: Editor.AssetDragView | null,
): Map<string, Editor.AssetTile[]> {
  let groupTiles = new Map<string, Editor.AssetTile[]>(),
    draggedIds = new Set(drag?.ids ?? []),
    assetLookup = new Map<string, Application.EditorAsset>();
  for (let value of groups) {
    for (let asset of value.assets) {
      assetLookup.set(asset.path, asset);
    }
  }
  let dragSlots: Editor.AssetTile[] = (drag?.ids ?? []).flatMap((assetId) => {
      let entry = assetLookup.get(assetId);
      if (entry !== undefined) {
        return [
          {
            kind: "slot",
            a: entry,
          },
        ];
      } else {
        return [];
      }
    }),
    target = drag?.target ?? null;
  for (let value of groups) {
    let items: Editor.AssetTile[] = [];
    for (let asset of value.assets) {
      if (draggedIds.has(asset.path)) {
        if (target === null) {
          items.push({
            kind: "slot",
            a: asset,
          });
        }
        continue;
      }
      if (
        target !== null &&
        target.kind === "slot" &&
        target.group === value.name &&
        target.before === asset.path
      ) {
        items.push(...dragSlots);
      }
      items.push({
        kind: "asset",
        a: asset,
      });
    }
    if (
      target !== null &&
      target.kind !== "new" &&
      target.group === value.name &&
      (target.kind === "group" ||
        target.before === null ||
        !items.some((source): boolean => source.kind === "slot"))
    ) {
      items.push(...dragSlots);
    }
    groupTiles.set(value.name, items);
  }
  return groupTiles;
}
function AssetGroupsList({
  groups: groups,
  renderThumb: renderThumb,
  tiles: tiles,
  onOpen: onOpen,
  footer: footer,
  headFor: headFor,
  onUpload: onUpload,
  onDropFiles: onDropFiles,
  onRename: onRename,
  reveal: reveal,
}: Editor.AssetGroupsListProps): React.ReactElement | null {
  useUiLocale();
  let memo = (reactAssetGroups as typeof React).useMemo(
      () => groups.filter((group): boolean => group.assets.length > 0),
      [groups],
    ),
    value = tiles?.drag ?? null,
    groupAssetMap = (reactAssetGroups as typeof React).useMemo(
      () => assetGroupRenderTiles(memo, value),
      [memo, value],
    ),
    groupLookup = (reactAssetGroups as typeof React).useMemo(
      () =>
        new Map(
          memo.flatMap((group) =>
            group.assets.map((asset) => [
              asset.path,
              {
                a: asset,
                g: group,
              },
            ]),
          ),
        ),
      [memo],
    );
  if (memo.length === 0 && footer === undefined) {
    return null;
  }
  let focusAssetId = tiles?.focusId ?? memo[0]?.assets[0]?.path ?? null,
    dropTarget = value?.target ?? null,
    isEditable = value !== null && tiles?.editable === true;
  return (
    <jsxAssetGroups.Fragment>
      {[memo.map((group, groupIndex) =>
          (() => {
            const _Element = AssetGroupGrid;
            const _elementProps = {
              group: group,
              items: groupAssetMap.get(group.name) ?? [],
              head: headFor?.(group),
              title: assetGroupDisplayName(group.name),
              renderThumb: renderThumb,
              tiles: tiles,
              tabStop: focusAssetId,
              wanted: reveal,
              onOpen: onOpen,
              onUpload: onUpload,
              onDropFiles: onDropFiles,
              onRename: onRename,
              targeted:
                dropTarget !== null &&
                dropTarget.kind !== "new" &&
                dropTarget.group === group.name,
              footer: groupIndex === memo.length - 1 ? footer : undefined,
            };
            const _elementKey = group.name;
            return <_Element key={_elementKey} {..._elementProps} />;
          })(),
        ), isEditable ? (
          <NewAssetGroupDropZone
            targeted={dropTarget?.kind === "new"}
            count={value!.ids.length}
          />
        ) : null, memo.length === 0 && footer !== undefined && footer !== null ? (
          <div
            className={SECTION_CARD_CLASS_NAME}
            data-testid={"ds-assets-pane"}
          >
            <div
              className={"ds-assets-foot ds-pad py-md"}
              {...UNCOMMENTABLE_PROPS}
            >
              {footer}
            </div>
          </div>
        ) : null, value !== null && tiles !== undefined ? (
          <AssetDragOverlay
            drag={value}
            tiles={tiles}
            lookup={groupLookup}
            renderThumb={renderThumb}
          />
        ) : null]}
    </jsxAssetGroups.Fragment>
  );
}
function NewAssetGroupDropZone({
  targeted: targeted,
  count: count,
}: {
  targeted: boolean;
  count: number;
}): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={joinClassNames(
        "ds-newgroup flex min-h-24 items-center justify-center gap-sm rounded-card border-2 border-dashed border-app-accent/40 text-footnote text-secondary transition-colors",
        targeted && "border-app-accent bg-app-accent/5 text-accent",
      )}
      data-drop-zone={"new"}
      data-testid={"ds-newgroup-zone"}
      {...UNCOMMENTABLE_PROPS}
    >
      {[<KitIcon name={"FolderPlus"} size={14} />, <span className={"font-medium"}>{uiMessage("design-system.assetGroups.newSet")}</span>, targeted ? (
          <span className={"text-secondary"}>
            {["· ", String(count), " ", count === 1 ? (uiMessage("design-system.assetGroups.file2")) : (uiMessage("design-system.assetGroups.files2"))]}
          </span>
        ) : null]}
    </div>
  );
}
function AssetDragOverlay({
  drag: drag,
  tiles: tiles,
  lookup: lookup,
  renderThumb: renderThumb,
}: Editor.AssetDragOverlayProps): React.ReactElement | null {
  useUiLocale();
  let entry = lookup.get(drag.lead);
  if (entry === undefined) {
    return null;
  }
  let value = isFileIconAsset(entry.a),
    overlaySize: number = value ? 64 : 28,
    draggedIds = drag.ids
      .filter((assetId): boolean => assetId !== drag.lead)
      .slice(0, 3)
      .map((assetId) => lookup.get(assetId))
      .filter((assetLookup): assetLookup is Editor.AssetLookup => assetLookup !== undefined);
  return (
    reactDomAssetGroups as typeof import("react-dom")
  ).createPortal(
    <div
      ref={tiles.ghostRef as React.Ref<HTMLDivElement>}
      className={"pointer-events-none fixed top-0 left-0 z-50"}
      data-testid={"ds-drag-ghost"}
      aria-hidden={"true"}
    >
      <div
        className={"absolute"}
        style={{
          left: -12,
          top: -overlaySize / 2,
          width: value ? overlaySize : undefined,
        }}
      >
        {[draggedIds.map((asset, stackIndex) =>
            (() => {
              const StackElement = "div";
              const stackProps = {
                className: "ds-ghost-tile absolute opacity-80",
                "data-tone": isReversedLogoAsset(asset.a)
                  ? "dark"
                  : undefined,
                style: {
                  width: value ? overlaySize : 160,
                  height: value ? overlaySize : 28,
                  transform:
                    "translate(" +
                    String((draggedIds.length - stackIndex) * 6) +
                    "px," +
                    String((draggedIds.length - stackIndex) * 6) +
                    "px)",
                },
                children: isFileIconAsset(asset.a)
                  ? renderThumb(asset.a)
                  : null,
              };
              const stackKey = asset.a.path;
              return <StackElement key={stackKey} {...stackProps} />;
            })(),
          ), <div
            className={"ds-ghost-tile relative"}
            data-tone={isReversedLogoAsset(entry.a) ? "dark" : undefined}
            style={{
              width: value ? overlaySize : 160,
              height: value ? overlaySize : 28,
            }}
          >
            {value ? (renderThumb(entry.a)) : (<span
                className={"flex h-full items-center gap-sm px-md text-body"}
              >
                {[<KitIcon
                    name={assetKindLabel(entry.a).icon}
                    size={14}
                    className={"shrink-0 text-muted"}
                  />, <span className={"truncate font-mono"}>
                    {entry.a.name}
                  </span>]}
              </span>)}
          </div>, drag.ids.length > 1 ? (
            <span
              className={
                "absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-app-accent px-1.5 text-xs font-medium text-app-accent-fg shadow-sm"
              }
              data-testid={"ds-drag-count"}
            >
              {drag.ids.length}
            </span>
          ) : null]}
      </div>
    </div>,
    document.body,
  );
}
function assetVisibleTileBoundary(
  tiles: Editor.AssetTile[],
  count: number,
): Editor.AssetTile[] {
  let visibleCount: number = 0,
    boundary: number = 0;
  while (
    boundary < tiles.length &&
    (visibleCount < count || tiles[boundary].kind === "slot")
  ) {
    if (tiles[boundary].kind === "asset") {
      visibleCount++;
    }
    boundary++;
  }
  if (boundary === tiles.length) {
    return tiles;
  } else {
    return tiles.slice(0, boundary);
  }
}
function useAssetGhostSlotHeights(
  root: React.RefObject<HTMLElement | null>,
  slots: boolean,
): void {
  let slotHeightsRef = (reactAssetGroups as typeof React).useRef(
    new Map<
      string,
      {
        left: number;
        top: number;
      }
    >(),
  );
  (reactAssetGroups as typeof React).useLayoutEffect((): void => {
    let current = root.current;
    if (current === null || !slots) {
      slotHeightsRef.current = new Map();
      return;
    }
    let value =
        typeof matchMedia === "function" &&
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      entries = new Map<
        string,
        {
          left: number;
          top: number;
        }
      >();
    for (let tile of current.querySelectorAll<HTMLElement>(
      "[data-tile-id]",
    )) {
      let tileId = tile.dataset.tileId ?? "",
        bounds = tile.getBoundingClientRect();
      entries.set(tileId, {
        left: bounds.left,
        top: bounds.top,
      });
      let entry = slotHeightsRef.current.get(tileId);
      if (entry === undefined || value) {
        continue;
      }
      let deltaX = entry.left - bounds.left,
        deltaY = entry.top - bounds.top;
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        continue;
      }
      tile.style.transition = "none";
      tile.style.transform =
        "translate(" + String(deltaX) + "px," + String(deltaY) + "px)";
      requestAnimationFrame((): void => {
        tile.style.transition = "transform 150ms ease-out";
        tile.style.transform = "";
      });
    }
    slotHeightsRef.current = entries;
  });
}
function AssetTileThumbnail({
  a: a,
  renderThumb: renderThumb,
}: {
  a: Editor.AssetThumbnail;
  renderThumb: Editor.AssetGroupsListProps["renderThumb"];
}): React.ReactElement {
  useUiLocale();
  if (isFileIconAsset(a)) {
    return (
      <span
        className={"ds-athumb"}
        data-tone={isReversedLogoAsset(a) ? "dark" : undefined}
      >
        {renderThumb(a)}
      </span>
    );
  }
  return (
    <span className={"ds-athumb ds-athumb-file"} aria-hidden={"true"}>
      <KitIcon
        name={assetKindLabel(a).icon}
        size={16}
        className={"text-muted"}
      />
    </span>
  );
}
function AssetGroupGrid({
  group: group,
  items: items,
  head: head,
  title: title,
  renderThumb: renderThumb,
  tiles: tiles,
  tabStop: tabStop,
  wanted: wanted,
  onOpen: onOpen,
  onUpload: onUpload,
  onDropFiles: onDropFiles,
  onRename: onRename,
  targeted: targeted,
  footer: footer,
}: Editor.AssetGroupGridProps): React.ReactElement {
  useUiLocale();
  useAssetThumbnailSources();
  let [value, setExpanded] = (reactAssetGroups as typeof React).useState(
      false,
    ),
    ref = (
      reactAssetGroups as typeof React
    ).useRef<HTMLDivElement | null>(null);
  useAssetGhostSlotHeights(
    ref,
    tiles?.drag !== null && tiles?.drag !== undefined,
  );
  let callback = (reactAssetGroups as typeof React).useCallback(
      (_files: File[], dragEvent: React.DragEvent<HTMLElement>): void => {
        dragEvent.stopPropagation();
        onDropFiles?.(group, dragEvent);
      },
      [onDropFiles, group],
    ),
    fileDrop = useFileDrop({
      disabled: onDropFiles === undefined,
      onFiles: callback,
    }),
    showDropRing = targeted || fileDrop.over,
    visibleItems = value
      ? items
      : assetVisibleTileBoundary(items, MIN_ASSET_TILE_SIZE),
    shouldExpand = (value ? [] : items.slice(visibleItems.length)).some(
      (source) =>
        source.kind === "asset" &&
        (tiles?.selected.has(source.a.path) === true ||
          tabStop === source.a.path ||
          wanted === source.a.path),
    );
  (reactAssetGroups as typeof React).useLayoutEffect((): void => {
    if (shouldExpand) {
      setExpanded(true);
    }
  }, [shouldExpand]);
  let groupTitle = head?.title ?? title,
    canEditTiles = tiles !== undefined && tiles.editable,
    getAssetTileProps = (asset: Application.EditorAsset) => {
      let isSelected: boolean = tiles?.selected.has(asset.path) === true;
      return {
        role: "option",
        "aria-selected": isSelected,
        "aria-label": assetGroupRelativePath(asset, group),
        tabIndex: tiles === undefined || tabStop === asset.path ? 0 : -1,
        "data-tile-id": asset.path,
        "data-tile-axis": "y",
        "data-selected": isSelected ? "" : undefined,
        onPointerDown:
          tiles !== undefined
            ? (pointerEvent: React.PointerEvent<HTMLElement>) =>
                tiles.onPointerDown(pointerEvent, asset.path)
            : undefined,
        onClick:
          tiles !== undefined
            ? (mouseEvent: React.MouseEvent<HTMLElement>) =>
                tiles.onClick(mouseEvent, asset.path)
            : () => onOpen(asset),
        onDoubleClick:
          tiles !== undefined
            ? () => tiles.onDoubleClick(asset.path)
            : undefined,
        onContextMenu:
          tiles !== undefined
            ? (contextMenuEvent: React.MouseEvent<HTMLElement>) =>
                tiles.onContextMenu(contextMenuEvent, asset.path)
            : undefined,
        onKeyDown:
          tiles !== undefined
            ? (keyEvent: React.KeyboardEvent<HTMLElement>) =>
                tiles.onKeyDown(keyEvent, asset.path)
            : (keyEvent: React.KeyboardEvent<HTMLElement>): void => {
                if (keyEvent.key === "Enter") {
                  onOpen(asset);
                }
              },
      };
    };
  return (
    <SectionCard
      head={{
        title: title,
        ...head,
      }}
      className={"ds-assets-sec"}
      data-testid={"ds-assets-pane-" + group.name}
      dropGroup={group.name}
      dropHandlers={fileDrop.targetProps}
      overlay={
        showDropRing ? (
          <div
            className={joinClassNames(
              "pointer-events-none absolute inset-0 z-[3] rounded-card",
              fileDrop.over
                ? FILE_DROP_RING_CLASS
                : ASSET_SELECTION_CLASS_NAME,
            )}
            data-testid={"ds-drop-ring"}
            aria-hidden={"true"}
          />
        ) : undefined
      }
      cardKey={"assets:" + group.name}
      anchorId={commentTargetId("agroup", group.name)}
      flat={true}
      actions={
        onUpload !== undefined ? (
          <Button
            variant={"ghost"}
            size={"sm"}
            iconOnly={true}
            icon={"Upload"}
            aria-label={uiMessage("design-system.assetGroups.uploadFileTo", { value1: String(groupTitle) })}
            tooltip={uiMessage("design-system.assetGroups.uploadFile")}
            onClick={() => onUpload(group)}
            data-testid={"ds-assets-upload-" + group.name}
            {...UNCOMMENTABLE_PROPS}
          />
        ) : undefined
      }
    >
      <div ref={ref} className={"flex flex-col"}>
        {[<div
            className={"ds-atable ds-ctable"}
            role={"listbox"}
            aria-multiselectable={"true"}
            aria-label={uiMessage("design-system.assetGroups.files", { value1: String(groupTitle) })}
            data-testid={"ds-flist"}
          >
            {[<div
                className={"ds-arow ds-crow ds-chead text-caption text-muted"}
                aria-hidden={"true"}
                {...UNCOMMENTABLE_PROPS}
              >
                {[<span>{uiMessage("design-system.assetGroups.name")}</span>, <span>{uiMessage("design-system.assetGroups.preview")}</span>, <span>{uiMessage("design-system.assetGroups.type")}</span>, <span className={"ds-cgutter"} />]}
              </div>, items.length === 0 && group.assets.length > 0 ? (
                <div
                  className={"ds-arow ds-tokrow ds-crow"}
                  aria-hidden={"true"}
                />
              ) : null, visibleItems.map((source) => {
                if (source.kind === "slot") {
                  return (() => {
                    const DropSlot = "div";
                    const dropSlotProps = {
                      className: "ds-fslot",
                      "data-drop-slot": "",
                      "data-testid": "ds-slot-" + source.a.path,
                    };
                    const dropSlotKey = "slot:" + source.a.path;
                    return (
                      <DropSlot key={dropSlotKey} {...dropSlotProps} />
                    );
                  })();
                }
                let assetKind = assetKindLabel(source.a),
                  assetSize = assetFileSizeLabel(
                    (source.a.bytes ?? 0) > 0 || source.a.store !== "file"
                      ? (source.a.bytes ?? 0)
                      : (addressedFileEntry(
                          projectFilePath(source.a.path),
                        )?.size ?? 0),
                  );
                return (() => {
                  const AssetElement = "div";
                  const assetProps = {
                    className:
                      "ds-arow ds-tokrow ds-crow group/row cursor-default select-none outline-none",
                    "data-testid": "ds-asset-" + source.a.path,
                    ...commentTargetProps(
                      "asset",
                      source.a.path,
                    ),
                    ...getAssetTileProps(source.a),
                    children: [
                      onRename !== undefined ? (
                        <span
                          className={"ds-cname min-w-0 gap-sm font-mono"}
                          onPointerDown={stopAssetInputKeyPropagation}
                          onClick={stopAssetInputKeyPropagation}
                          onDoubleClick={stopAssetInputKeyPropagation}
                          onKeyDown={stopAssetInputKeyPropagation}
                        >
                          <EditableName
                            kind={"title"}
                            name={source.a.name}
                            taken={EMPTY_ASSET_SELECTION_SET}
                            placeholder={uiMessage("design-system.assetGroups.fileName")}
                            tabIndex={-1}
                            commit={(name: string) =>
                              name === "" ||
                              name === source.a.name ||
                              onRename(source.a, name)
                            }
                            data-testid={"ds-asset-name-" + source.a.path}
                          />
                        </span>
                      ) : (
                        <span className={"ds-cname min-w-0 gap-sm"}>
                          <span
                            className={"min-w-0 truncate font-mono"}
                            data-testid={"ds-asset-open-" + source.a.path}
                          >
                            {assetGroupRelativePath(source.a, group)}
                          </span>
                        </span>
                      ),
                      <span className={"ds-bcell ds-aprev min-w-0"}>
                        <AssetTileThumbnail
                          a={source.a}
                          renderThumb={renderThumb}
                        />
                      </span>,
                      <span
                        className={
                          "ds-bcell ds-atype min-w-0 truncate text-footnote text-muted"
                        }
                      >
                        {assetKind.label + (assetSize !== "" ? " · " + assetSize : "")}
                      </span>,
                      <span
                        className={"ds-cgutter"}
                        onPointerDown={(
                          event: React.PointerEvent<HTMLElement>,
                        ) => event.stopPropagation()}
                        onClick={(event: React.MouseEvent<HTMLElement>) =>
                          event.stopPropagation()
                        }
                        {...UNCOMMENTABLE_PROPS}
                      >
                        {canEditTiles ? (<RemoveRowButton
                            label={uiMessage("design-system.assetGroups.remove", { value1: String(source.a.name) })}
                            onRemove={() => tiles!.remove([source.a.path])}
                            tabIndex={-1}
                            data-testid={"ds-asset-remove-" + source.a.path}
                          />) : (null)}
                      </span>,
                    ],
                  };
                  const assetTileKey = source.a.path;
                  return <AssetElement key={assetTileKey} {...assetProps} />;
                })();
              })]}
          </div>, items.length > visibleItems.length ? (
            <TextLink
              className={"ds-apad mt-sm w-fit text-footnote"}
              onClick={() => setExpanded(true)}
              data-testid={"ds-wall-all"}
              {...UNCOMMENTABLE_PROPS}
            >
              {[uiMessage("design-system.assetGroups.showAll"), String(group.assets.length), uiMessage("design-system.assetGroups.files3")]}
            </TextLink>
          ) : null, footer !== undefined && footer !== null ? (
            <div
              className={"ds-assets-foot ds-apad pt-md"}
              {...UNCOMMENTABLE_PROPS}
            >
              {footer}
            </div>
          ) : null]}
      </div>
    </SectionCard>
  );
}
export {
  ASSET_SELECTION_CLASS_NAME,
  AssetDragOverlay,
  assetFileSizeLabel,
  AssetGroupGrid,
  assetGroupRelativePath,
  assetGroupRenderTiles,
  AssetGroupsList,
  assetKindLabel,
  AssetTileThumbnail,
  assetVisibleTileBoundary,
  EMPTY_ASSET_SELECTION_SET,
  isFileIconAsset,
  isReversedLogoAsset,
  jsxAssetGroups,
  MIN_ASSET_TILE_SIZE,
  NewAssetGroupDropZone,
  stopAssetInputKeyPropagation,
  useAssetGhostSlotHeights,
};
export function installEditorAssetGroups(): () => void {
  return () => {
    jsxAssetGroups = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    ASSET_SELECTION_CLASS_NAME = "shadow-[inset_0_0_0_2px_var(--t-app-accent)]";
    assetFileSizeLabel = (bytes: number | undefined) =>
      bytes !== undefined && bytes > 0
        ? formatInlineBudgetBytes(bytes)
        : "";
    MIN_ASSET_TILE_SIZE = 60;
    EMPTY_ASSET_SELECTION_SET = new Set();
    stopAssetInputKeyPropagation = (
      event: React.SyntheticEvent<HTMLElement>,
    ): void => {
      if (event.target instanceof HTMLInputElement) {
        event.stopPropagation();
      }
    };
  };
}

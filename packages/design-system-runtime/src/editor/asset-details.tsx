import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { assetFileSizeLabel, assetKindLabel, isReversedLogoAsset } from "./asset-groups";
import { resolvedAssetFileBytes, useAssetThumbnailSource, useAssetThumbnailSources } from "./asset-thumbnails";
import { reactAssetUpload, unsupportedDownloadMessage } from "./asset-upload";
import { commentTargetProps } from "./comment-anchors";
import { get_DOWNLOADS_UNAVAILABLE_MESSAGE, hasDownloadCapability, normalizeDownloadName, useDownloadsWithheld } from "./download-permission";
import { fontFileCssFamilyName } from "./font-faces";
import { isComposingEvent } from "./markdown-toolbar";
import { BLOCK_FILE_DROP_HANDLERS } from "./shadows";
import { filePreviewUrl } from "../model/derive-system";
import { isHeldFilePointer } from "../model/file-policy";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip } from "../ui/avatars";
import { Button } from "../ui/buttons";
import { Dialog } from "../ui/dialog";
import { FieldComponents } from "../ui/field";
import { CdsRoot } from "../ui/overlays";
import { KitIcon } from "../ui/property-icons";

var jsxAssetDetails: typeof import("react/jsx-runtime");
function AssetDetailsPreview({
  asset: asset,
  files: files,
  storage: storage,
  size: size,
}: Editor.AssetDetailsPreviewProps): React.ReactElement {
  useUiLocale();
  let value =
      asset.kind === "image" || asset.kind === "svg" || asset.kind === "video"
        ? filePreviewUrl(files, asset.path, storage)
        : null,
    value2: string = "ds-thumb-media ds-thumb-" + size,
    value3 = useAssetThumbnailSource(files, asset.path);
  if ((asset.kind === "image" || asset.kind === "svg") && value !== null) {
    return (() => {
      const _Element = "img";
      const _elementProps = {
        className: value2,
        "data-kind":
          asset.kind === "svg" &&
          isHeldFilePointer(asset.path, files[asset.path] ?? "")
            ? "svg"
            : undefined,
        src: value3.src ?? value,
        alt: asset.name,
        draggable: false,
        loading: "lazy" as const,
        onLoad: value3.onLoad,
        onError: value3.onError,
      };
      const _elementKey = value3.part;
      return <_Element key={_elementKey} {..._elementProps} />;
    })();
  }
  if (asset.kind === "video" && value !== null) {
    if (size === "full") {
      return (() => {
        const _Element2 = "video";
        const _elementProps2 = {
          className: value2,
          src: value3.src ?? value,
          controls: true,
          muted: true,
          playsInline: true,
          onLoadedMetadata: value3.onLoad,
          onError: value3.onError,
        };
        const _elementKey2 = value3.part;
        return <_Element2 key={_elementKey2} {..._elementProps2} />;
      })();
    } else {
      return (() => {
        const _Element3 = "video";
        const _elementProps3 = {
          className: value2,
          src: value3.src ?? value,
          muted: true,
          playsInline: true,
          preload: "metadata",
          onLoadedMetadata: value3.onLoad,
          onError: value3.onError,
        };
        const _elementKey3 = value3.part;
        return <_Element3 key={_elementKey3} {..._elementProps3} />;
      })();
    }
  }
  if (asset.kind === "font") {
    return (
      <span
        className={
          value2 +
          " ds-thumb-font leading-none text-primary " +
          (size === "full" ? "p-6 text-[96px]" : "text-[28px]")
        }
        style={{
          fontFamily:
            '"' +
            fontFileCssFamilyName(asset.path) +
            '", system-ui, sans-serif',
        }}
      >
        {"Ag"}
      </span>
    );
  }
  let value4 = assetKindLabel(asset),
    value5 = assetFileSizeLabel(
      resolvedAssetFileBytes(files, asset.path, asset.bytes),
    );
  return (
    <span
      className={
        value2 +
        " ds-thumb-generic inline-flex flex-col items-center gap-sm text-muted"
      }
    >
      {[<KitIcon
          name={value4.icon}
          size={size === "full" ? 36 : 22}
        />, <span className={"font-mono text-caption"}>
          {value4.label + (size === "full" && value5 !== "" ? " · " + value5 : "")}
        </span>]}
    </span>
  );
}
function assetDownloadBlockedReason(
  asset: Application.EditorAsset,
  withheld?: boolean,
): string | undefined {
  if (withheld === true) {
    return get_DOWNLOADS_UNAVAILABLE_MESSAGE();
  }
  if (!hasDownloadCapability()) {
    return;
  }
  if (!normalizeDownloadName(asset.name)) {
    return unsupportedDownloadMessage(
      asset.name,
      "rejected_extension",
    );
  }
  return;
}
function AssetDetailsDialog({
  asset: asset,
  files: files,
  storage: storage,
  onClose: onClose,
  onDownload: onDownload,
  onRename: onRename,
  onRemove: onRemove,
  focusName = false,
}: Editor.AssetDetailsDialogProps): React.ReactElement {
  useUiLocale();
  useAssetThumbnailSources();
  let ref = (
      reactAssetUpload as typeof React
    ).useRef<HTMLInputElement | null>(null),
    value = assetDownloadBlockedReason(
      asset,
      useDownloadsWithheld(),
    ),
    [value2, value3] = (reactAssetUpload as typeof React).useState(
      asset.name,
    ),
    [value4, value5] = (reactAssetUpload as typeof React).useState<
      string | null
    >(null),
    ref2 = (reactAssetUpload as typeof React).useRef(false);
  (reactAssetUpload as typeof React).useEffect(
    () => value3(asset.name),
    [asset.name],
  );
  let callback = (): void => {
      let value7 = ref2.current ? asset.name : value2.trim();
      ref2.current = false;
      if (value7 === "" || value7 === asset.name) {
        value3(asset.name);
        value5(null);
        return;
      }
      if (onRename?.(value7) === false) {
        value5(uiMessage("design-system.assetDetails.thatNameIsTakenOr"));
      } else {
        value5(null);
      }
    },
    value6 =
      asset.kind === "image" ||
      asset.kind === "svg" ||
      asset.kind === "video";
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
            size={"lg"}
            data-testid={"ds-asset-lightbox"}
            aria-label={asset.name}
            {...commentTargetProps("lightbox", asset.path)}
            initialFocus={
              focusName && onRename !== undefined ? ref : undefined
            }
          >
            {[<Dialog.Header showClose={true}>
                {value6 ? (asset.kind === "video" ? (uiMessage("design-system.assetDetails.video")) : (uiMessage("design-system.assetDetails.image"))) : (assetKindLabel(asset).label)}
              </Dialog.Header>, <div className={"flex flex-col gap-md"}>
                {[<div
                    className={"ds-lb-prev" + (value6 ? "" : " ds-lb-file")}
                    data-tone={
                      value6 && isReversedLogoAsset(asset)
                        ? "dark"
                        : undefined
                    }
                  >
                    <AssetDetailsPreview
                      asset={asset}
                      files={files}
                      storage={storage}
                      size={"full"}
                    />
                  </div>, onRename !== undefined ? (
                    <FieldComponents.TextInput
                      ref={ref}
                      label={uiMessage("design-system.assetDetails.fileName")}
                      onFocus={
                        focusName
                          ? (input: React.FocusEvent<HTMLInputElement>) =>
                              input.currentTarget.select()
                          : undefined
                      }
                      error={value4 ?? undefined}
                      hint={
                        value4 === null
                          ? assetFileSizeLabel(
                              resolvedAssetFileBytes(
                                files,
                                asset.path,
                                asset.bytes,
                              ),
                            ) || undefined
                          : undefined
                      }
                      className={"font-mono"}
                      value={value2}
                      spellCheck={false}
                      data-testid={"ds-asset-name"}
                      onChange={(
                        input: React.ChangeEvent<HTMLInputElement>,
                      ): void => {
                        value3(input.currentTarget.value);
                        value5(null);
                      }}
                      onBlur={callback}
                      onKeyDown={(
                        event: React.KeyboardEvent<HTMLInputElement>,
                      ): void => {
                        if (isComposingEvent(event)) {
                          return;
                        }
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        } else if (event.key === "Escape") {
                          event.preventDefault();
                          event.stopPropagation();
                          ref2.current = true;
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  ) : (
                    <p className={"flex items-baseline gap-sm text-body"}>
                      {[<span
                          className={
                            "min-w-0 truncate font-mono text-primary"
                          }
                          data-testid={"ds-asset-name"}
                          title={asset.path}
                        >
                          {asset.name}
                        </span>, <span
                          className={"font-mono text-footnote text-muted"}
                        >
                          {assetFileSizeLabel(
                            resolvedAssetFileBytes(
                              files,
                              asset.path,
                              asset.bytes,
                            ),
                          )}
                        </span>]}
                    </p>
                  )]}
              </div>, <Dialog.Footer align={"between"}>
                {[onRemove !== undefined ? (
                    <Button
                      variant={"ghost"}
                      icon={"Trash"}
                      className={"text-danger"}
                      onClick={onRemove}
                      data-testid={"ds-asset-lb-remove"}
                    >
                      {uiMessage("design-system.assetDetails.delete")}
                    </Button>
                  ) : (
                    <span />
                  ), onDownload !== undefined ? (
                    <DisabledReasonTooltip reason={value}>
                      <Button
                        icon={"Download"}
                        disabled={value !== undefined}
                        onClick={onDownload}
                        data-testid={"ds-asset-lb-download"}
                        data-why={value}
                      >
                        {uiMessage("design-system.assetDetails.download")}
                      </Button>
                    </DisabledReasonTooltip>
                  ) : null]}
              </Dialog.Footer>]}
          </Dialog.Popup>
        </Dialog.Root>
      </CdsRoot>
    </div>
  );
}
export {
  AssetDetailsDialog,
  AssetDetailsPreview,
  assetDownloadBlockedReason,
  jsxAssetDetails,
};
export function installEditorAssetDetails(): () => void {
  return () => {
    jsxAssetDetails = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}

import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { uploadDesignFile } from "../../canvas/working-state";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { TextInput } from "../../cds/components/text-input";
import { initializeCdsIndex } from "../../cds/index";
import { PopoverPopoverRootTriggerPopupConfig } from "../../cds/popover/popover";
import { cn } from "../../cds/theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { choosePopoverPlacement } from "../chrome/focus";
import { undoStepOverlayProps } from "../chrome/overlay-state";
import { editorThemeTokens } from "../chrome/theme";
import { useToast } from "../chrome/toast";
import { PropertyColorWell, PropertyPickerButton } from "./primitives";
import { PropertyRow } from "./row";
import { AssetPickerContext, reactPropertiesTokenColorPicker, reactPropertiesTokenColorPicker_2 } from "./token-color-picker";
import { toModuleNamespace } from "../../module-helpers";
import { projectFilesystem, resolveProjectAssetUrl, trackEmbeddedWrite } from "../../platform/file-content";
import { blobAssetPathPattern } from "../../platform/image-upload";

var reactPropertiesAssetPicker: Dynamic;
var reactPropertiesAssetPicker_2: Dynamic;
var jsxPropertiesAssetPicker: Dynamic;
var W155remValue: Dynamic;
var W64Value: Dynamic;
var jsxPropertiesAssetPicker_2: Dynamic;
var PropertiesAssetPickerWebpAvifPattern: Dynamic;
var reactPropertiesAssetPicker_3: Dynamic;
var jsxPropertiesAssetPicker_3: Dynamic;
var PropertiesAssetPickerPattern: Dynamic;
var PropertiesAssetPickerAZAZPattern: Dynamic;
function useAssetPickerContext(): Dynamic {
  return (0, reactPropertiesTokenColorPicker_2.useContext)(
    AssetPickerContext,
  );
}
function useProjectFiles(projectPath?: Dynamic, directory: Dynamic = ""): Dynamic {
  let [value, setFiles]: Dynamic = (0, reactPropertiesAssetPicker.useState)([]),
    [isLoading, setIsLoading]: Dynamic = (0, reactPropertiesAssetPicker.useState)(
      true,
    );
  (0, reactPropertiesAssetPicker.useEffect)((): Dynamic => {
    let flag: Dynamic = true;
    projectFilesystem
      .readdir(directory)
      .then((entries?: Dynamic): Dynamic => {
        flag && setFiles(entries);
      })
      .catch((): Dynamic => {})
      .finally((): Dynamic => {
        flag && setIsLoading(false);
      });
    return (): Dynamic => {
      flag = false;
    };
  }, [directory]);
  return {
    files: value,
    loading: isLoading,
  };
}
function PropertyAssetPopup({
  open: open,
  onOpenChange: onOpenChange,
  trigger: trigger,
  title: title,
  removeLabel: removeLabel,
  onRemove: onRemove,
  removeDisabled: removeDisabled,
  header: header,
  planHeight: planHeight,
  editsAreUndoSteps = false,
  children: children,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let contentRef: Dynamic = (0, reactPropertiesAssetPicker_2.useRef)(null),
    anchorRef: Dynamic = (0, reactPropertiesAssetPicker_2.useRef)(null),
    [placement, setPlacement]: Dynamic = (0, reactPropertiesAssetPicker_2.useState)({
      side: "bottom",
      maxHeight: undefined,
    });
  (0, reactPropertiesAssetPicker_2.useLayoutEffect)((): Dynamic => {
    open &&
      setPlacement(
        planHeight !== undefined
          ? choosePopoverPlacement(
              anchorRef.current?.firstElementChild,
              planHeight,
            )
          : {
              side: "bottom",
              maxHeight: undefined,
            },
      );
  }, [open]);
  let activeTextInputRef: Dynamic = (0, reactPropertiesAssetPicker_2.useRef)(null),
    activeInputValueRef: Dynamic = (0, reactPropertiesAssetPicker_2.useRef)(""),
    swallowEscapeRef: Dynamic = (0, reactPropertiesAssetPicker_2.useRef)(false);
  return (
    <PopoverPopoverRootTriggerPopupConfig.Root
      open={open}
      modal={true}
      onOpenChange={(nextOpen?: Dynamic, changeDetails?: Dynamic): Dynamic => {
        if (!nextOpen && changeDetails.reason === "escape-key") {
          if (changeDetails.event.defaultPrevented) {
            changeDetails.cancel();
            return;
          }
          changeDetails.event.preventDefault();
        }
        onOpenChange(nextOpen);
      }}
    >
      <span ref={anchorRef} className={"contents"}>
        <PopoverPopoverRootTriggerPopupConfig.Trigger
          render={trigger}
        />
      </span>
      <PopoverPopoverRootTriggerPopupConfig.Popup
        padding={"none"}
        side={placement.side}
        style={
          placement.maxHeight !== undefined
            ? {
                maxHeight: placement.maxHeight,
              }
            : undefined
        }
        align={"start"}
        sideOffset={4}
        collisionPadding={8}
        initialFocus={(openReason?: Dynamic): Dynamic => {
          if (openReason === "touch") return true;
          if (editsAreUndoSteps && openReason !== "keyboard")
            return contentRef.current?.closest('[data-cds="Popover"]') ?? true;
          let firstInput: Dynamic = contentRef.current?.querySelector(
            'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
          );
          return firstInput
            ? (setTimeout((): Dynamic => {
                firstInput.ownerDocument.activeElement === firstInput &&
                  firstInput.select();
              }, 0),
              firstInput)
            : true;
        }}
        data-testid={dataTestid}
        {...(editsAreUndoSteps ? undoStepOverlayProps : {})}
        className={header !== undefined ? W64Value : W155remValue}
      >
        <div
          ref={contentRef}
          className={cn(
            "flex flex-col pt-md [--pp-label-w:3rem]",
            header !== undefined
              ? "pb-4 [--pp-edge:16px] [--pp-gutter-l:16px] [--pp-gutter-r:16px]"
              : "pb-lg [--pp-gutter-r:var(--cds-pad-lg)]",
          )}
          onInputCapture={(event?: Dynamic): Dynamic => {
            (event.target instanceof HTMLInputElement ||
              event.target instanceof HTMLTextAreaElement) &&
              ((activeTextInputRef.current = event.target),
              (activeInputValueRef.current = event.target.value));
          }}
          onBlurCapture={(event?: Dynamic): Dynamic => {
            activeTextInputRef.current === event.target && (activeTextInputRef.current = null);
          }}
          onKeyDownCapture={(event?: Dynamic): Dynamic => {
            swallowEscapeRef.current = false;
            let textField: Dynamic =
              (event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement) &&
              contentRef.current?.contains(event.target)
                ? event.target
                : null;
            if (!textField) return;
            let isInputUnchanged: Dynamic =
              activeTextInputRef.current === textField && textField.value === activeInputValueRef.current;
            if (
              event.key === "Escape" &&
              textField.hasAttribute("data-kit-search") &&
              textField.value !== ""
            ) {
              swallowEscapeRef.current = true;
              return;
            }
            event.key === "Escape"
              ? ((swallowEscapeRef.current = isInputUnchanged),
                (activeTextInputRef.current = null),
                isInputUnchanged
                  ? setTimeout((): Dynamic => {
                      textField.isConnected &&
                        (textField.focus(),
                        textField instanceof HTMLInputElement &&
                          textField.select());
                    }, 0)
                  : (document as Dynamic).querySelector(
                      "[data-mc-popover]",
                    ) === null && onOpenChange(false))
              : event.key === "Enter" && (activeTextInputRef.current = null);
          }}
          onKeyDown={(event?: Dynamic): Dynamic => {
            event.key === "Escape" &&
              swallowEscapeRef.current &&
              ((swallowEscapeRef.current = false), event.stopPropagation());
          }}
        >
          <div
            className={cn(
              "flex items-center gap-xs pr-md",
              header !== undefined ? "pb-1 pl-md" : "pb-xs pl-lg",
            )}
          >
            {header !== undefined ? (<jsxPropertiesAssetPicker.Fragment>
                <PopoverPopoverRootTriggerPopupConfig.Title
                  className={"sr-only"}
                >
                  {title}
                </PopoverPopoverRootTriggerPopupConfig.Title>
                <div className={"min-w-0 flex-1"}>{header}</div>
              </jsxPropertiesAssetPicker.Fragment>) : (<PopoverPopoverRootTriggerPopupConfig.Title
                className={
                  "min-w-0 flex-1 truncate text-body-semibold text-primary"
                }
              >
                {title}
              </PopoverPopoverRootTriggerPopupConfig.Title>)}
            {onRemove !== undefined ? (<Button
                variant={"ghost"}
                size={"sm"}
                iconOnly={true}
                icon={"Trash"}
                aria-label={removeLabel ?? (uiMessage("inspector.assetPicker.remove"))}
                disabled={removeDisabled}
                onClick={(): Dynamic => {
                  onRemove();
                  onOpenChange(false);
                }}
              />) : (null)}
            <PopoverPopoverRootTriggerPopupConfig.Close
              render={
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  iconOnly={true}
                  icon={"X"}
                  aria-label={uiMessage("inspector.assetPicker.close")}
                />
              }
            />
          </div>
          {children}
        </div>
      </PopoverPopoverRootTriggerPopupConfig.Popup>
    </PopoverPopoverRootTriggerPopupConfig.Root>
  );
}
function PropertyPopupField({
  label: label,
  className: className,
  children: children,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      className={cn(
        "flex flex-col gap-xs pt-xs pl-[var(--pp-edge,var(--cds-pad-lg))] pr-[var(--pp-gutter-r,var(--cds-pad-lg))]",
        className,
      )}
      {...props}
    >
      {label !== undefined && (<span className={"text-footnote text-muted select-none"}>
          {label}
        </span>)}
      {children}
    </div>
  );
}
function resolveAssetPreviewUrl(projectPath?: Dynamic, source?: Dynamic): Dynamic {
  let value: Dynamic = (source ?? "").trim();
  return value
    ? /^(https?:|data:|blob:)/i.test(value) ||
      blobAssetPathPattern.test(value)
      ? value
      : resolveProjectAssetUrl(projectPath, value.replace(/^\.\//, ""))
    : null;
}
function escapeCssUrl(url?: Dynamic): Dynamic {
  return url.replace(
    /["'()\\\s]/g,
    (character?: Dynamic): Dynamic =>
      "%" + character.charCodeAt(0).toString(16).padStart(2, "0"),
  );
}
function AssetColorWell({ src: src }: Dynamic): Dynamic {
  useUiLocale();
  let { projectPath: projectPath }: Dynamic = useAssetPickerContext(),
    previewUrl: Dynamic = resolveAssetPreviewUrl(projectPath, src);
  return (
    <PropertyColorWell
      background={
        previewUrl
          ? `url("${escapeCssUrl(previewUrl)}") center / cover no-repeat`
          : undefined
      }
    />
  );
}
function ImageAssetPicker({
  value: value,
  onChange: onChange,
  disabled: disabled,
  previewSize: previewSize,
  onPickFile: onPickFile,
  uploadOnlyReason: uploadOnlyReason,
}: Dynamic): Dynamic {
  useUiLocale();
  let { projectPath: projectPath }: Dynamic = useAssetPickerContext(),
    { files: projectFiles }: Dynamic = useProjectFiles(projectPath),
    { showToast: showToast }: Dynamic = useToast(),
    [draftSource, setDraftSource]: Dynamic = (0,
    reactPropertiesTokenColorPicker.useState)(value ?? ""),
    isEditingRef: Dynamic = (0, reactPropertiesTokenColorPicker.useRef)(
      false,
    ),
    shouldRevertRef: Dynamic = (0, reactPropertiesTokenColorPicker.useRef)(
      false,
    );
  !isEditingRef.current && (value ?? "") !== draftSource && setDraftSource(value ?? "");
  let fileInputRef: Dynamic = (0, reactPropertiesTokenColorPicker.useRef)(
      null,
    ),
    imageFiles: Dynamic = (projectFiles ?? []).filter(
      (file?: Dynamic): Dynamic =>
        file.isFile && PropertiesAssetPickerWebpAvifPattern.test(file.name),
    ),
    callback: Dynamic = async (imageFile?: Dynamic): Promise<Dynamic> => {
      try {
        let { src: uploadedSrc }: Dynamic = await uploadDesignFile(
          projectPath,
          null,
          imageFile,
        );
        onChange(uploadedSrc);
        return true;
      } catch (error: Dynamic) {
        console.error("[dc-editor] image upload failed:", error);
        showToast(uiMessage("inspector.assetPicker.couldNotUploadTheImage"), "error");
        return false;
      }
    },
    previewUrl: Dynamic = resolveAssetPreviewUrl(projectPath, value),
    checkerboardBackground: Dynamic = `repeating-conic-gradient(${editorThemeTokens.bg.muted} 0% 25%, ${editorThemeTokens.bg.elevated} 0% 50%) 0 / 8px 8px`;
  return (
    <jsxPropertiesAssetPicker_2.Fragment>
      {previewSize && (<PropertyRow className={"my-[3px]"}>
          <div
            data-testid={"dc-image-preview"}
            className={"h-24 min-w-0 flex-1 rounded-md shadow-card-ring"}
            style={{
              background: previewUrl
                ? `url("${escapeCssUrl(previewUrl)}") center / ${previewSize} no-repeat, ${checkerboardBackground}`
                : checkerboardBackground,
            }}
          />
        </PropertyRow>)}
      <PropertyRow label={uiMessage("inspector.assetPicker.source")} title={uploadOnlyReason}>
        <TextInput
          fullWidth={true}
          value={draftSource}
          placeholder={uiMessage("inspector.assetPicker.httpsOrFilePng")}
          aria-label={uiMessage("inspector.assetPicker.imageSource")}
          inputMode={"url"}
          disabled={disabled || uploadOnlyReason !== undefined}
          onFocus={(event?: Dynamic): Dynamic => {
            isEditingRef.current = true;
            event.currentTarget.select();
          }}
          onChange={(event?: Dynamic): Dynamic => setDraftSource(event.target.value)}
          onBlur={(): Dynamic => {
            isEditingRef.current = false;
            if (shouldRevertRef.current) {
              shouldRevertRef.current = false;
              setDraftSource(value ?? "");
              return;
            }
            let trimmedSource: Dynamic = draftSource.trim();
            trimmedSource !== (value ?? "") && onChange(trimmedSource || null);
          }}
          onKeyDown={(event?: Dynamic): Dynamic => {
            (event.key === "Enter" || event.key === "Escape") &&
              (event.key === "Escape" &&
                ((shouldRevertRef.current = true), setDraftSource(value ?? "")),
              event.target.blur());
          }}
        />
      </PropertyRow>
      <PropertyRow label={uiMessage("inspector.assetPicker.upload")}>
        <Button
          variant={"secondary"}
          icon={"Upload"}
          className={"min-w-0 flex-1"}
          disabled={disabled}
          onClick={(): Dynamic => fileInputRef.current?.click()}
        >
          {uiMessage("inspector.assetPicker.uploadImage")}
        </Button>
        <input
          ref={fileInputRef}
          type={"file"}
          accept={"image/*"}
          style={{
            display: "none",
          }}
          onChange={(event?: Dynamic): Dynamic => {
            let pickedFile: Dynamic = event.target.files?.[0];
            pickedFile &&
              (onPickFile
                ? onPickFile(pickedFile)
                : trackEmbeddedWrite(callback(pickedFile)));
            event.target.value = "";
          }}
        />
      </PropertyRow>
      {!previewSize && imageFiles.length > 0 && (<PropertyPopupField label={uiMessage("inspector.assetPicker.projectImages")}>
          <div className={"-mx-1 flex max-h-40 flex-col overflow-y-auto"}>
            {imageFiles.map((file?: Dynamic): Dynamic => {
              let isSelected: Dynamic = value === `./${file.name}`;
              return (() => {
                const _Component = "button";
                const _props = {
                  type: "button",
                  "aria-pressed": isSelected,
                  className: cn(
                    "flex min-h-control min-w-0 cursor-default items-center gap-sm overflow-hidden rounded-md px-1 text-left text-body text-primary outline-none focus-visible:outline-hidden focus-visible:shadow-focus forced-colors:focus-visible:-outline-offset-2",
                    isSelected
                      ? "bg-fill-ghost-hover"
                      : "bg-transparent hover:bg-fill-ghost-hover",
                  ),
                  disabled: disabled,
                  onClick: (): Dynamic => onChange(`./${file.name}`),
                  children: [
                    <AssetColorWell src={file.name} />,
                    <span className={"min-w-0 flex-1 truncate"}>
                      {file.name}
                    </span>,
                    isSelected && (
                      <Icon
                        name={"Check"}
                        size={"sm"}
                        className={"shrink-0 text-secondary"}
                      />
                    ),
                  ],
                } as const;
                const _key = file.name;
                return <_Component key={_key} {..._props} />;
              })();
            })}
          </div>
        </PropertyPopupField>)}
      {!previewSize && imageFiles.length === 0 && (<PropertyPopupField>
          <span className={"text-caption text-muted"}>
            {uploadOnlyReason !== undefined ? (uiMessage("inspector.assetPicker.noImagesInThisProject")) : (uiMessage("inspector.assetPicker.noImagesInThisProject2"))}
          </span>
        </PropertyPopupField>)}
    </jsxPropertiesAssetPicker_2.Fragment>
  );
}
function PropertyImageRow({
  label: label,
  value: value,
  mixed: mixed,
  disabled: disabled,
  onCommit: onCommit,
  onPickFile: onPickFile,
  uploadOnlyReason: uploadOnlyReason,
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0,
    reactPropertiesTokenColorPicker.useState)(false),
    triggerText: Dynamic = mixed
      ? "Mixed"
      : value?.startsWith("data:") && value.includes("#drop")
        ? "Uploading\u2026"
        : value || uiMessage("inspector.assetPicker.chooseImage");
  return (
    <PropertyAssetPopup
      open={isOpen}
      onOpenChange={setIsOpen}
      title={label}
      removeLabel={"Remove image"}
      removeDisabled={
        disabled || (!value && !mixed) || uploadOnlyReason !== undefined
      }
      onRemove={(): Dynamic => onCommit(null)}
      data-testid={"dc-image-popover"}
      trigger={
        <PropertyPickerButton
          aria-label={uiMessage("inspector.assetPicker.undefined", { value1: String(label), value2: String(triggerText) })}
          className={"w-full"}
          disabled={disabled}
          chip={<AssetColorWell src={value} />}
          muted={!value}
        >
          {triggerText}
        </PropertyPickerButton>
      }
    >
      <ImageAssetPicker
        value={value}
        onChange={onCommit}
        disabled={disabled}
        onPickFile={
          onPickFile &&
          ((file?: Dynamic): Dynamic => {
            setIsOpen(false);
            onPickFile(file);
          })
        }
        uploadOnlyReason={uploadOnlyReason}
      />
    </PropertyAssetPopup>
  );
}
export {
  AssetColorWell,
  escapeCssUrl,
  ImageAssetPicker,
  jsxPropertiesAssetPicker,
  jsxPropertiesAssetPicker_2,
  jsxPropertiesAssetPicker_3,
  PropertiesAssetPickerAZAZPattern,
  PropertiesAssetPickerPattern,
  PropertiesAssetPickerWebpAvifPattern,
  PropertyAssetPopup,
  PropertyImageRow,
  PropertyPopupField,
  reactPropertiesAssetPicker,
  reactPropertiesAssetPicker_2,
  reactPropertiesAssetPicker_3,
  resolveAssetPreviewUrl,
  useAssetPickerContext,
  useProjectFiles,
  W155remValue,
  W64Value,
};
export function installEditorPropertiesAssetPicker(): () => void {
  return () => {
    reactPropertiesAssetPicker = toModuleNamespace(
      load_react(),
      1,
    );
    reactPropertiesAssetPicker_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxPropertiesAssetPicker = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    W155remValue = "w-[15.5rem]";
    W64Value = "w-64";
    jsxPropertiesAssetPicker_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesAssetPickerWebpAvifPattern = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
    reactPropertiesAssetPicker_3 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxPropertiesAssetPicker_3 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesAssetPickerPattern = /^-?[\d.]+(%|[a-z]+)?$/i;
    PropertiesAssetPickerAZAZPattern =
      /^(#[0-9a-f]{3,8}|[a-z-]+|[a-z-]+\((?:[^()]|\([^()]*\))*\))$/i;
  };
}

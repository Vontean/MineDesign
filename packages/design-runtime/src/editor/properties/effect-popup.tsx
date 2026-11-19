import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type { CSSProperties } from "react";
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { joinClassNames } from "../chrome/overlay-state";
import { EditorPopover } from "../chrome/popover";
import { ColorValue } from "../color/contrast-copy";
import { hsvaToRgbHex, parseHsvaColor } from "../color/picker-primitives";
import { NumericInput } from "./numeric-input";
import { PropertyPickerButton } from "./primitives";
import { PropertyRow } from "./row";
import { ColorWellFace, PropertyHexRow, PropertyNumberRow } from "./rows";
import { reactSessionStripPopover } from "../session-strip/popover";

var ColorEffectButton: Dynamic;
function PropertyPopupBody({
  title: title,
  onClose: onClose,
  labelWidth = "3rem",
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      role={"dialog"}
      aria-label={typeof title == "string" ? (title) : (undefined)}
      className={"flex flex-col py-sm"}
      style={
        {
          "--pp-label-w": labelWidth,
          "--pp-gutter-l": "var(--cds-pad-md)",
        } as CSSProperties
      }
      data-kit={"effect-editor"}
    >
      <div className={"flex items-center pr-xs pb-xs pl-md"}>
        <h3
          className={
            "min-w-0 flex-1 truncate text-body-semibold text-primary"
          }
        >
          {title}
        </h3>
        <Button
          variant={"ghost"}
          size={"sm"}
          iconOnly={true}
          icon={"X"}
          aria-label={uiMessage("inspector.effectPopup.close")}
          tooltip={uiMessage("inspector.effectPopup.close")}
          onClick={onClose}
        />
      </div>
      {children}
    </div>
  );
}
function ShadowEditor({
  title: title,
  value: shadow,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  onClose: onClose,
  spread = true,
  bounds = {},
  disabled: isDisabled,
  swatches: swatches,
  unifiedPopover: unifiedPopover,
  editsAreUndoSteps: editsAreUndoSteps,
}: Dynamic): Dynamic {
  useUiLocale();
  let commitShadowPatch: Dynamic = (patch?: Dynamic): Dynamic =>
      onChange({
        ...shadow,
        ...patch,
      }),
    scrubHandlers: Dynamic = (field?: Dynamic): Dynamic =>
      onLive && onLiveEnd
        ? {
            onScrub: (fieldValue?: Dynamic): Dynamic =>
              onLive({
                ...shadow,
                [field]: fieldValue,
              }),
            onScrubEnd: onLiveEnd,
          }
        : {};
  return (
    <PropertyPopupBody title={title} onClose={onClose}>
      <PropertyRow
        label={uiMessage("inspector.effectPopup.offset")}
        disabled={isDisabled}
        onPress={(element?: Dynamic): Dynamic =>
          element.querySelector("input")?.focus()
        }
      >
        <div className={"flex min-w-0 flex-1 items-center gap-2"}>
          <NumericInput
            aria-label={uiMessage("inspector.effectPopup.horizontalOffset")}
            prefix={"X"}
            steppers={false}
            value={shadow.x}
            onValue={(offsetX?: Dynamic): Dynamic =>
              offsetX !== undefined &&
              commitShadowPatch({
                x: offsetX,
              })
            }
            disabled={isDisabled}
            {...bounds.x}
            {...scrubHandlers("x")}
          />
          <NumericInput
            aria-label={uiMessage("inspector.effectPopup.verticalOffset")}
            prefix={"Y"}
            steppers={false}
            value={shadow.y}
            onValue={(offsetY?: Dynamic): Dynamic =>
              offsetY !== undefined &&
              commitShadowPatch({
                y: offsetY,
              })
            }
            disabled={isDisabled}
            {...bounds.y}
            {...scrubHandlers("y")}
          />
        </div>
      </PropertyRow>
      <PropertyNumberRow
        label={uiMessage("inspector.effectPopup.blur")}
        unit={"px"}
        value={shadow.blur}
        onValue={(blurRadius?: Dynamic): Dynamic =>
          blurRadius !== undefined &&
          commitShadowPatch({
            blur: blurRadius,
          })
        }
        disabled={isDisabled}
        min={0}
        {...bounds.blur}
        {...scrubHandlers("blur")}
      />
      {spread && (<PropertyNumberRow
          label={uiMessage("inspector.effectPopup.spread")}
          unit={"px"}
          value={shadow.spread ?? 0}
          onValue={(spreadRadius?: Dynamic): Dynamic =>
            spreadRadius !== undefined &&
            commitShadowPatch({
              spread: spreadRadius,
            })
          }
          disabled={isDisabled}
          {...bounds.spread}
          {...scrubHandlers("spread")}
        />)}
      <PropertyHexRow
        label={uiMessage("inspector.effectPopup.color")}
        value={shadow.color}
        disabled={isDisabled}
        swatches={swatches}
        popoverTitle={unifiedPopover ? ColorValue : undefined}
        editsAreUndoSteps={editsAreUndoSteps}
        onChange={(colorHex?: Dynamic): Dynamic =>
          colorHex !== undefined &&
          commitShadowPatch({
            color: colorHex,
          })
        }
        {...(onLive && onLiveEnd
          ? {
              onLive: (liveColor?: Dynamic): Dynamic =>
                onLive({
                  ...shadow,
                  color: liveColor,
                }),
              onLiveEnd: (): Dynamic => onLiveEnd(),
            }
          : {})}
      />
    </PropertyPopupBody>
  );
}
function PropertyEditorPopover({
  open: open,
  onOpenChange: onOpenChange,
  trigger: trigger,
  anchor: anchor,
  side = "left",
  focusOnOpen: focusOnOpen,
  className: className,
  editsAreUndoSteps: editsAreUndoSteps,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <EditorPopover
      open={open}
      onOpen={(): Dynamic => onOpenChange(true)}
      onClose={(): Dynamic => onOpenChange(false)}
      trigger={trigger}
      side={side}
      positionAnchor={anchor}
      focusOnOpen={focusOnOpen}
      padding={"none"}
      className={joinClassNames(
        "w-[14.5rem] pointer-coarse:w-[17rem]",
        className,
      )}
      editsAreUndoSteps={editsAreUndoSteps}
    >
      {children}
    </EditorPopover>
  );
}
function RemovePropertyButton({
  label: label,
  onClick: onClick,
  disabled: isDisabled,
  disabledReason: disabledReason,
}: Dynamic): Dynamic {
  useUiLocale();
  let removeLabel: Dynamic = uiMessage("inspector.effectPopup.remove") + label.toLowerCase();
  return (
    <Button
      variant={"ghost"}
      iconOnly={true}
      icon={"Minus"}
      aria-label={removeLabel}
      tooltip={removeLabel}
      disabled={isDisabled}
      disabledReason={disabledReason}
      onClick={onClick}
      className={"shrink-0"}
    />
  );
}
export {
  ColorEffectButton,
  PropertyEditorPopover,
  PropertyPopupBody,
  RemovePropertyButton,
  ShadowEditor,
};
export function installEditorPropertiesEffectPopup(): () => void {
  return () => {
    ColorEffectButton = (0, reactSessionStripPopover.forwardRef)(
      function (
        {
          label: label,
          color: color,
          text: text,
          open: open,
          onClick: onClick,
          disabled: isDisabled,
          ...props
        }: Dynamic,
        forwardedRef?: Dynamic,
      ): Dynamic {
        let parsedColor: Dynamic = (0, reactSessionStripPopover.useMemo)(
          (): Dynamic =>
            typeof color == "string"
              ? parseHsvaColor(color)
              : undefined,
          [color],
        );
        return (
          <PropertyPickerButton
            {...(open !== undefined
              ? {
                  "aria-haspopup": "dialog",
                  "aria-expanded": open,
                }
              : undefined)}
            {...props}
            ref={forwardedRef}
            aria-label={((label) + (": ")) + (text)}
            disabled={isDisabled}
            onClick={onClick}
            chip={
              color !== undefined ? (
                <ColorWellFace
                  hex={parsedColor ? hsvaToRgbHex(parsedColor) : null}
                  alpha={(parsedColor?.a ?? 1) * 100}
                />
              ) : undefined
            }
            caption={
              parsedColor !== undefined ? Math.round(parsedColor.a * 100) + "%" : undefined
            }
          >
            {text}
          </PropertyPickerButton>
        );
      },
    );
  };
}

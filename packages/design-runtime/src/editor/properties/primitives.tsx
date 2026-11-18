import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { initializeCdsIndex } from "../../cds/index";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { blockingOverlaySelector, joinClassNames } from "../chrome/overlay-state";
import { ColorContrastCopyHandler } from "../color/contrast-copy";
import { reactInspectorContext_4 } from "../inspector/context-part-2";
import { toModuleNamespace } from "../../module-helpers";

var PropertiesPrimitivesLabel: Dynamic;
var reactPropertiesPrimitives: Dynamic;
var jsxPropertiesPrimitives: Dynamic;
var jsxPropertiesPrimitives_2: Dynamic;
var PropertiesPrimitivesClassNames: Dynamic;
var joinClassNamesValue: Dynamic;
var joinClassNamesValue_2: Dynamic;
var PropertiesPrimitivesClassNames_2: Dynamic;
var PropertyPickerButton: Dynamic;
var PropertiesPrimitivesClassNames_3: Dynamic;
var PropertiesPrimitivesClassNames_4: Dynamic;
function EditorIcon({
  name: name,
  size = 14,
  className: className,
  style: style,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <Icon
      name={name}
      customSize={size}
      className={joinClassNames("shrink-0", className)}
      style={{
        display: "inline-flex",
        ...style,
      }}
    />
  );
}
function ZoomToolIcon(): Dynamic {
  useUiLocale();
  return (
    <Icon name={"ZoomIn"} size={"auto"} className={"shrink-0"} />
  );
}
function isNestedPropertyControl(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  if (
    options.closest(PropertiesPrimitivesLabel) ||
    options.closest('[data-kit="row-trailing"]') ||
    options.closest("[data-mc-scrim], [data-base-ui-inert]")
  )
    return true;
  let ancestor: Dynamic = options.closest(blockingOverlaySelector);
  return ancestor !== null && !ancestor.contains(input);
}
function PropertyActions({
  section: section,
  "aria-label": ariaLabel,
  items: items,
  align = "end",
  disabled: disabled2,
  open: open,
  onOpenChange: onOpenChange,
  defaultOpen = false,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0, reactPropertiesPrimitives.useState)(
      defaultOpen,
    ),
    value3: Dynamic = open !== undefined;
  if (items.length === 0) {
    !value3 && value && value2(false);
    return null;
  }
  let value4: Dynamic =
      ariaLabel ??
      (section !== undefined && section !== ""
        ? ColorContrastCopyHandler(section)
        : "Add"),
    value5: Dynamic = (
      <MenuMenuAssignValue
        iconOnly={true}
        icon={"Add"}
        variant={"ghost"}
        aria-label={value4}
        tooltip={value4}
        disabled={disabled2}
        align={align}
        open={value3 ? open : value}
        onOpenChange={(input?: Dynamic): Dynamic => {
          value3 || value2(input);
          onOpenChange?.(input);
        }}
        items={items.map((input?: Dynamic): Dynamic => {
          let value6: Dynamic =
            input.disabledReason !== undefined && input.disabledReason !== "";
          return {
            label: input.label,
            onSelect: input.onSelect,
            disabled: input.disabled === true || value6,
            disabledReason: value6 ? input.disabledReason : undefined,
            description: input.description,
          };
        })}
      />
    );
  return dataTestid === undefined ? (
    value5
  ) : (
    <span data-testid={dataTestid} className={"inline-flex"}>
      {value5}
    </span>
  );
}
function PropertyColorWell({
  background: background,
  className: className,
  children: children,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      {...props}
      className={joinClassNames(
        PropertiesPrimitivesClassNames_2,
        className,
      )}
    >
      {background !== undefined ? (<span
          className={"absolute inset-0"}
          style={{
            background: background,
          }}
        />) : (null)}
      {children}
    </span>
  );
}
export {
  EditorIcon,
  isNestedPropertyControl,
  joinClassNamesValue,
  joinClassNamesValue_2,
  jsxPropertiesPrimitives,
  jsxPropertiesPrimitives_2,
  PropertiesPrimitivesClassNames,
  PropertiesPrimitivesClassNames_2,
  PropertiesPrimitivesClassNames_3,
  PropertiesPrimitivesClassNames_4,
  PropertiesPrimitivesLabel,
  PropertyActions,
  PropertyColorWell,
  PropertyPickerButton,
  reactPropertiesPrimitives,
  ZoomToolIcon,
};
export function installEditorPropertiesPrimitives(): () => void {
  return () => {
    PropertiesPrimitivesLabel =
      'button,input,select,textarea,label,[role="slider"],[role="switch"],[role="radio"],[role="checkbox"],[role="menuitem"]';
    reactPropertiesPrimitives = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxPropertiesPrimitives = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    jsxPropertiesPrimitives_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesPrimitivesClassNames =
      "rounded bg-fill-field text-primary shadow-field-ring outline-none transition duration-fast placeholder:text-muted enabled:hover:shadow-field-hover focus-visible:outline-hidden focus-visible:shadow-focus aria-expanded:shadow-field-hover disabled:opacity-50";
    joinClassNamesValue = joinClassNames(
      "h-control min-w-0 px-md text-body pointer-coarse:h-10",
      PropertiesPrimitivesClassNames,
    );
    joinClassNamesValue_2 = joinClassNames(
      "flex h-control min-w-0 items-center gap-sm pr-md pl-1 text-left text-body pointer-coarse:h-10",
      PropertiesPrimitivesClassNames,
    );
    PropertiesPrimitivesClassNames_2 =
      "relative inline-block h-4 w-4 shrink-0 overflow-hidden rounded-[4px] shadow-card-ring bg-[repeating-conic-gradient(var(--cds-alpha-2)_0_25%,transparent_0_50%)] bg-[length:8px_8px]";
    PropertyPickerButton = (0, reactInspectorContext_4.forwardRef)(
      function (
        {
          chip: chip,
          children: children,
          caption: caption,
          muted: muted,
          trailing: trailing,
          className: className,
          type = "button",
          ...props
        }: Dynamic,
        options?: Dynamic,
      ): Dynamic {
        return (
          <button
            {...props}
            ref={options}
            type={type}
            className={joinClassNames(
              chip != null
                ? joinClassNamesValue_2
                : joinClassNames(
                    joinClassNamesValue,
                    "flex items-center gap-sm text-left",
                  ),
              "flex-1",
              className,
            )}
          >
            {chip}
            <span
              className={joinClassNames(
                "min-w-0 flex-1 truncate",
                muted && "text-muted",
              )}
            >
              {children}
            </span>
            {caption != null ? (<span className={"text-caption text-muted"}>{caption}</span>) : (null)}
            {trailing}
          </button>
        );
      },
    );
    PropertiesPrimitivesClassNames_3 =
      "pl-[var(--pp-gutter-l,var(--cds-pad-lg))] pr-[var(--pp-gutter-r,var(--cds-pad-md))]";
    PropertiesPrimitivesClassNames_4 =
      "[&_[data-cds=Button][aria-label]:not([aria-pressed=true])]:text-secondary";
  };
}

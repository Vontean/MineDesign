import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { reactComponentsPropsPanel } from "../components/props-panel";
import { shadowControlRanges as shadowBounds, useEditorColorSwatches } from "./css-effects";
import { ColorEffectButton, PropertyEditorPopover, RemovePropertyButton, ShadowEditor } from "./effect-popup";
import { PropertyRow } from "./row";
import { toModuleNamespace } from "../../module-helpers";

var reactPropertiesDropShadowEditor: Dynamic;
var reactForPropertyInspectorField: Dynamic;
var reactForTokenColorPicker: Dynamic;
var jsxPropertiesDropShadowEditor: Dynamic;
var PropertiesDropShadowEditorTest: Dynamic;
function DropShadowEditor({
  value: shadow,
  open: open,
  onOpenChange: onOpenChange,
  disabled: isDisabled,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
}: Dynamic): Dynamic {
  useUiLocale();
  let colorSwatches: Dynamic = useEditorColorSwatches(),
    [shouldFocusOnOpen, setShouldFocusOnOpen]: Dynamic = (0,
    reactComponentsPropsPanel.useState)(false),
    rowRef: Dynamic = (0, reactComponentsPropsPanel.useRef)(null),
    shadowState: Dynamic = {
      x: shadow.x,
      y: shadow.y,
      blur: shadow.blur,
      color: shadow.color,
    },
    toShadowFields: Dynamic = (shadowFields?: Dynamic): Dynamic => ({
      x: shadowFields.x,
      y: shadowFields.y,
      blur: shadowFields.blur,
      color: shadowFields.color,
    });
  return (
    <PropertyRow
      label={uiMessage("inspector.dropShadowEditor.textShadow")}
      disabled={isDisabled}
      data-testid={"dc-prop-text-shadow"}
      trailing={
        <RemovePropertyButton
          label={uiMessage("inspector.dropShadowEditor.textShadow")}
          disabled={isDisabled}
          onClick={(): Dynamic => {
            onOpenChange(false);
            onChange(null);
          }}
        />
      }
    >
      <span ref={rowRef} className={"relative flex min-w-0 flex-1"}>
        <PropertyEditorPopover
          open={open}
          onOpenChange={onOpenChange}
          trigger={
            <ColorEffectButton
              label={uiMessage("inspector.dropShadowEditor.textShadow")}
              color={shadow.color}
              text={`${shadow.x}, ${shadow.y} \xB7 ${shadow.blur}px`}
              disabled={isDisabled}
              onClick={(clickEvent?: Dynamic): Dynamic =>
                setShouldFocusOnOpen(clickEvent.detail === 0)
              }
            />
          }
          anchor={(): Dynamic =>
            rowRef.current?.closest("[data-property-row]") ?? null
          }
          focusOnOpen={shouldFocusOnOpen}
        >
          <ShadowEditor
            title={uiMessage("inspector.dropShadowEditor.textShadow")}
            value={shadowState}
            spread={false}
            bounds={shadowBounds}
            disabled={isDisabled}
            unifiedPopover={true}
            swatches={colorSwatches}
            onChange={(nextShadow?: Dynamic): Dynamic => onChange(toShadowFields(nextShadow))}
            onLive={(liveShadow?: Dynamic): Dynamic => onLive(toShadowFields(liveShadow))}
            onLiveEnd={onLiveEnd}
            onClose={(): Dynamic => onOpenChange(false)}
          />
        </PropertyEditorPopover>
      </span>
    </PropertyRow>
  );
}
export {
  DropShadowEditor,
  jsxPropertiesDropShadowEditor,
  PropertiesDropShadowEditorTest,
  reactPropertiesDropShadowEditor,
  reactForPropertyInspectorField,
  reactForTokenColorPicker,
};
export function installEditorPropertiesDropShadowEditor(): () => void {
  return () => {
    reactPropertiesDropShadowEditor = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactForPropertyInspectorField = toModuleNamespace(
      load_react(),
      1,
    );
    reactForTokenColorPicker = toModuleNamespace(
      load_react(),
      1,
    );
    jsxPropertiesDropShadowEditor = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesDropShadowEditorTest = (colorValue?: Dynamic): Dynamic =>
      !/\b(var|env|attr|calc|color-mix)\(|^\s*(currentcolor|inherit|initial|unset|revert|revert-layer)\s*$/i.test(
        colorValue,
      ) &&
      (typeof CSS === "undefined" ||
        typeof CSS.supports != "function" ||
        CSS.supports("color", colorValue));
  };
}

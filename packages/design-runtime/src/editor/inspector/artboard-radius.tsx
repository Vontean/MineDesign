import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { PropertyCornersRow } from "../properties/sides";
import { toModuleNamespace } from "../../module-helpers";
import { artboardRadiusCorners, maxArtboardRadius as maxCornerRadius } from "../../platform/file-content";

var jsxInspectorArtboardRadius: Dynamic;
var InspectorArtboardRadiusItems: Dynamic;
var radiusPlaceholders: Dynamic;
var reactInspectorArtboardRadius: Dynamic;
var reactForSessionTypographyPopup: Dynamic;
function ArtboardRadiusRow({
  radius: radius,
  readOnly = false,
  onSetRadius: onSetRadius,
}: Dynamic): Dynamic {
  useUiLocale();
  let corners: Dynamic = artboardRadiusCorners(radius),
    applyChanges: Dynamic = (changes?: Dynamic): Dynamic => {
      let nextCorners: Dynamic = [...corners];
      for (let change of changes as Dynamic)
        nextCorners[change.side] = change.value ?? 0;
      return nextCorners;
    };
  return (
    <PropertyCornersRow
      label={uiMessage("inspector.artboardRadius.radius")}
      data-testid={"dc-artboard-radius"}
      title={readOnly ? (ViewOnlyYouCanInspectThisMessage) : (undefined)}
      values={radius === undefined ? InspectorArtboardRadiusItems : corners}
      placeholders={radiusPlaceholders}
      unit={"px"}
      min={0}
      max={maxCornerRadius}
      disabled={readOnly}
      onSides={(changes?: Dynamic): Dynamic =>
        onSetRadius(applyChanges(changes), false)
      }
      onScrubSides={(changes?: Dynamic): Dynamic =>
        onSetRadius(applyChanges(changes), true)
      }
      onScrubEnd={(changes?: Dynamic): Dynamic =>
        onSetRadius(applyChanges(changes), false)
      }
      onReset={
        radius !== undefined && !readOnly
          ? (): Dynamic => onSetRadius(undefined, false)
          : undefined
      }
    />
  );
}
export {
  ArtboardRadiusRow,
  InspectorArtboardRadiusItems,
  radiusPlaceholders,
  jsxInspectorArtboardRadius,
  reactInspectorArtboardRadius,
  reactForSessionTypographyPopup,
};
export function installEditorInspectorArtboardRadius(): () => void {
  return () => {
    jsxInspectorArtboardRadius = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    InspectorArtboardRadiusItems = [undefined, undefined, undefined, undefined];
    radiusPlaceholders = ["0", "0", "0", "0"];
    initializeCdsIndex();
    reactInspectorArtboardRadius = toModuleNamespace(
      load_react(),
      1,
    );
    reactForSessionTypographyPopup = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
  };
}

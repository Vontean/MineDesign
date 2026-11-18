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
import { artboardRadiusCorners, PlatformFileContentResolvedValue_3 } from "../../platform/file-content";

var jsxInspectorArtboardRadius: Dynamic;
var InspectorArtboardRadiusItems: Dynamic;
var InspectorArtboardRadiusItems_2: Dynamic;
var reactInspectorArtboardRadius: Dynamic;
var reactInspectorArtboardRadius_2: Dynamic;
function ArtboardRadiusRow({
  radius: radius,
  readOnly = false,
  onSetRadius: onSetRadius,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = artboardRadiusCorners(radius),
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      let items: Dynamic = [...value];
      for (let value2 of input as Dynamic)
        items[value2.side] = value2.value ?? 0;
      return items;
    };
  return (
    <PropertyCornersRow
      label={uiMessage("inspector.artboardRadius.radius")}
      data-testid={"dc-artboard-radius"}
      title={readOnly ? (ViewOnlyYouCanInspectThisMessage) : (undefined)}
      values={radius === undefined ? InspectorArtboardRadiusItems : value}
      placeholders={InspectorArtboardRadiusItems_2}
      unit={"px"}
      min={0}
      max={PlatformFileContentResolvedValue_3}
      disabled={readOnly}
      onSides={(input?: Dynamic): Dynamic =>
        onSetRadius(callback(input), false)
      }
      onScrubSides={(input?: Dynamic): Dynamic =>
        onSetRadius(callback(input), true)
      }
      onScrubEnd={(input?: Dynamic): Dynamic =>
        onSetRadius(callback(input), false)
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
  InspectorArtboardRadiusItems_2,
  jsxInspectorArtboardRadius,
  reactInspectorArtboardRadius,
  reactInspectorArtboardRadius_2,
};
export function installEditorInspectorArtboardRadius(): () => void {
  return () => {
    jsxInspectorArtboardRadius = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    InspectorArtboardRadiusItems = [undefined, undefined, undefined, undefined];
    InspectorArtboardRadiusItems_2 = ["0", "0", "0", "0"];
    initializeCdsIndex();
    reactInspectorArtboardRadius = toModuleNamespace(
      load_react(),
      1,
    );
    reactInspectorArtboardRadius_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
  };
}

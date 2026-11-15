import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { reactCanvasShape_2, reactDomCanvasShape_2 } from "../canvas/shape";
import { activeDesignColorTokens } from "../canvas/working-state";
import { cn } from "../cds/theme/class-names";
import { InspectorPanelShell, useInspectorPosture } from "./chrome/inspector-sheet";
import { usePanelWidth } from "./chrome/panel-width";
import { PanelWidthGrip } from "./chrome/resize-grip";
import { ChromeScrollbarLabel } from "./chrome/scrollbar";
import { useDesignColorTokens } from "./code/design-color-tokens";
import { useElementById } from "./hooks/element-and-dismissal";
import { AnnotationInspector } from "./inspector/annotation";
import { InspectorContext } from "./inspector/context-part-2";
import { inspectorPanelId, useInspectorOpen } from "./inspector/context";
import { InspectorEditorItems, InspectorEditorItems_2 } from "./inspector/editor";
import { CdsIsland } from "../platform/cds-island";

function DesignPropertiesSidebar({ children: children }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, usePanelWidth)(312);
  return (
    <div
      data-testid={"dc-edit-side-panel"}
      data-posture={"sidebar"}
      className={
        "relative flex h-full shrink-0 flex-col border-l bg-surface-panel [--pp-label-w:72px]"
      }
      style={{
        width: value.width,
      }}
    >
      {children}
      <PanelWidthGrip {...value} label={uiMessage("inspector.propertiesPanel.resizePropertiesPanel")} />
    </div>
  );
}
function AnchoredDesignProperties({
  settings: settings,
  readOnly = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, useInspectorPosture)(),
    value2: Dynamic = (0, useElementById)(inspectorPanelId),
    [value3]: Dynamic = (0, useInspectorOpen)(),
    value4: Dynamic = (0, useDesignColorTokens)("appifact"),
    value5: Dynamic = (0, reactCanvasShape_2.useMemo)(
      (): Dynamic => ({
        dsColorTokens: (0, activeDesignColorTokens)(
          value4.tokens,
          value4.themes,
          undefined,
        ),
        artboardColors: InspectorEditorItems_2,
        designColorTokens: InspectorEditorItems,
        setOverlayHidden: (): Dynamic => {},
        setScrubbing: (): Dynamic => {},
        editsAreUndoSteps: true,
      }),
      [value4],
    );
  if (value2 == null || !value3) return null;
  let value6: Dynamic = (
    <InspectorContext.Provider value={value5}>
      <div
        data-testid={"dc-anchored-content"}
        className={(0, cn)(
          "flex min-h-0 flex-1 flex-col overflow-y-auto pb-3 select-none [&_input]:select-text",
          ChromeScrollbarLabel,
        )}
      >
        <AnnotationInspector
          settings={settings}
          readOnly={readOnly}
        />
      </div>
    </InspectorContext.Provider>
  );
  return (0, reactDomCanvasShape_2.createPortal)(
    <CdsIsland density={"compact"} className={"contents"}>
      {value === "wide" ? (<DesignPropertiesSidebar>{value6}</DesignPropertiesSidebar>) : (<InspectorPanelShell
          posture={"sheet"}
          filled={true}
          headerAt={"top"}
          data-testid={"dc-edit-side-panel"}
        >
          {value6}
        </InspectorPanelShell>)}
    </CdsIsland>,
    value2,
  );
}
export {
  AnchoredDesignProperties,
  DesignPropertiesSidebar,
};
export function installEditorPropertiesPanel(): () => void {
  return () => {};
}

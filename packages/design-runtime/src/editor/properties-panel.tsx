import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { canvasShapeReact as React, reactDomForAnchoredDesignProperties } from "../canvas/shape";
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
import { noDesignColorTokens, emptyArtboardColors } from "./inspector/editor";
import { CdsIsland } from "../platform/cds-island";

function DesignPropertiesSidebar({ children: children }: Dynamic): Dynamic {
  useUiLocale();
  let panelWidth: Dynamic = usePanelWidth(312);
  return (
    <div
      data-testid={"dc-edit-side-panel"}
      data-posture={"sidebar"}
      className={
        "relative flex h-full shrink-0 flex-col border-l bg-surface-panel [--pp-label-w:72px]"
      }
      style={{
        width: panelWidth.width,
      }}
    >
      {children}
      <PanelWidthGrip {...panelWidth} label={uiMessage("inspector.propertiesPanel.resizePropertiesPanel")} />
    </div>
  );
}
function AnchoredDesignProperties({
  settings: settings,
  readOnly = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let inspectorPosture: Dynamic = useInspectorPosture(),
    panelHost: Dynamic = useElementById(inspectorPanelId),
    [isInspectorOpen]: Dynamic = useInspectorOpen(),
    colorTokenSet: Dynamic = useDesignColorTokens("appifact"),
    inspectorContextValue: Dynamic = (0, React.useMemo)(
      (): Dynamic => ({
        dsColorTokens: activeDesignColorTokens(
          colorTokenSet.tokens,
          colorTokenSet.themes,
          undefined,
        ),
        artboardColors: emptyArtboardColors,
        designColorTokens: noDesignColorTokens,
        setOverlayHidden: (): Dynamic => {},
        setScrubbing: (): Dynamic => {},
        editsAreUndoSteps: true,
      }),
      [colorTokenSet],
    );
  if (panelHost == null || !isInspectorOpen) return null;
  let inspectorContent: Dynamic = (
    <InspectorContext.Provider value={inspectorContextValue}>
      <div
        data-testid={"dc-anchored-content"}
        className={cn(
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
  return (0, reactDomForAnchoredDesignProperties.createPortal)(
    <CdsIsland density={"compact"} className={"contents"}>
      {inspectorPosture === "wide" ? (<DesignPropertiesSidebar>{inspectorContent}</DesignPropertiesSidebar>) : (<InspectorPanelShell
          posture={"sheet"}
          filled={true}
          headerAt={"top"}
          data-testid={"dc-edit-side-panel"}
        >
          {inspectorContent}
        </InspectorPanelShell>)}
    </CdsIsland>,
    panelHost,
  );
}
export {
  AnchoredDesignProperties,
  DesignPropertiesSidebar,
};
export function installEditorPropertiesPanel(): () => void {
  return () => {};
}

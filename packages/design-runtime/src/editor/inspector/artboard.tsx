import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasShape_2 } from "../../canvas/shape";
import { SegmentedControl } from "../../cds/components/selection-points";
import { ArtboardRadiusRow } from "./artboard-radius";
import { InspectorContext, useInspectorContext } from "./context-part-2";
import { InspectorEditorItems_2 as emptyArtboardColors, InspectorEditorLabel_4 as contentSizedReason, InspectorEditorPropLabelSpecConfig, InspectorEditorSubscribers, inspectorSingleSelectionMessage } from "./editor";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { PropertyInspectorField } from "../properties/inspector-field";
import { NumericInput } from "../properties/numeric-input";
import { PropertyRow } from "../properties/row";
import { PropertySection } from "../properties/section";
import { paperSizes } from "../../export/paper-and-scale";

function ArtboardInspector({
  settings: settings,
  readOnly = false,
  pngFollowsPrint = true,
}: Dynamic): Dynamic {
  useUiLocale();
  let effectiveSettings: Dynamic = readOnly
      ? {
          ...settings,
          onSetPrint: (): Dynamic => {},
          onSetPaper: (): Dynamic => {},
          onSetSize: (): Dynamic => {},
          onSetFill: (): Dynamic => {},
          onSetRadius: (): Dynamic => {},
          onFitHeight: undefined,
        }
      : settings,
    isFlow: Dynamic = effectiveSettings.print === "flow",
    isPaginated: Dynamic = isFlow || effectiveSettings.fillPaginates === true,
    fill: Dynamic = effectiveSettings.fill,
    readOnlyReason: Dynamic = readOnly
      ? ViewOnlyYouCanInspectThisMessage
      : undefined,
    inspectorContext: Dynamic = useInspectorContext(),
    artboardContext: Dynamic = (0, reactCanvasShape_2.useMemo)(
      (): Dynamic => ({
        ...inspectorContext,
        iframeDefinedVars: InspectorEditorSubscribers,
        artboardColors: emptyArtboardColors,
        editsAreUndoSteps: false,
      }),
      [inspectorContext],
    ),
    resolveFillVar: Dynamic = (varName?: Dynamic): Dynamic =>
      (varName && fill?.vars[varName]) || varName || null;
  return effectiveSettings.frameless ? (
    <div
      data-testid={"dc-artboard-settings"}
      className={"[--pp-label-w:84px]"}
    >
      <PropertySection title={effectiveSettings.label ?? (uiMessage("inspector.artboard.artboard"))}>
        {["w", "h"].map(
          (dimension?: Dynamic): Dynamic => (
            <PropertyRow
              key={dimension}
              label={dimension === "w" ? (uiMessage("inspector.artboard.width")) : (uiMessage("inspector.artboard.height"))}
              data-testid={"dc-artboard-" + dimension}
              title={contentSizedReason}
              disabled={true}
            >
              <NumericInput
                aria-label={dimension === "w" ? (uiMessage("inspector.artboard.width")) : (uiMessage("inspector.artboard.height"))}
                value={Math.round(effectiveSettings[dimension])}
                unit={"px"}
                refuseLetters={true}
                disabled={true}
                smallStep={1}
                onValue={(): Dynamic => {}}
              />
            </PropertyRow>
          ),
        )}
      </PropertySection>
    </div>
  ) : (
    <div
      data-testid={"dc-artboard-settings"}
      className={"[--pp-label-w:84px]"}
    >
      <PropertySection title={uiMessage("inspector.artboard.artboard")}>
        {["w", "h"].map(
          (dimension?: Dynamic): Dynamic => (
            <PropertyRow
              key={dimension}
              label={dimension === "w" ? (uiMessage("inspector.artboard.width")) : (uiMessage("inspector.artboard.height"))}
              data-testid={"dc-artboard-" + dimension}
              title={readOnlyReason}
              {...(dimension === "h" && effectiveSettings.onFitHeight
                ? {
                    actions: [
                      {
                        get label() { return uiMessage("inspector.artboard.fitToContent"); },
                        onSelect: effectiveSettings.onFitHeight,
                      },
                    ],
                    actionsLabel: "Height actions",
                  }
                : {})}
            >
              <NumericInput
                aria-label={
                  dimension === "w" ? (uiMessage("inspector.artboard.artboardWidth")) : (uiMessage("inspector.artboard.artboardHeight"))
                }
                value={Math.round(effectiveSettings[dimension])}
                unit={"px"}
                refuseLetters={true}
                disabled={readOnly}
                min={120}
                max={8e3}
                smallStep={1}
                onValue={(nextSize?: Dynamic): Dynamic =>
                  nextSize !== undefined &&
                  effectiveSettings.onSetSize(
                    {
                      [dimension]: nextSize,
                    },
                    true,
                  )
                }
                onScrub={(nextSize?: Dynamic): Dynamic =>
                  effectiveSettings.onSetSize(
                    {
                      [dimension]: nextSize,
                    },
                    false,
                  )
                }
                onScrubEnd={(): Dynamic => effectiveSettings.onSetSize({}, true)}
              />
            </PropertyRow>
          ),
        )}
        <PropertyRow
          label={uiMessage("inspector.artboard.printMode")}
          data-testid={"dc-artboard-print"}
          title={readOnlyReason}
        >
          <SegmentedControl
            aria-label={uiMessage("inspector.artboard.printMode")}
            fullWidth={true}
            value={effectiveSettings.print}
            segments={[
              {
                value: "flow",
                get label() { return uiMessage("inspector.artboard.flow"); },
                get tooltip() { return "Content flows onto Letter/A4 pages (up to 100)" + pngFollowsPrint
                    ? ", and a PNG keeps its full length"
                    : "" + "\u2014for document-like artboards (memos, reports)"; },
                disabled: readOnly,
                disabledReason: readOnlyReason,
              },
              {
                value: "fixed",
                get label() { return uiMessage("inspector.artboard.fixed"); },
                get tooltip() { return effectiveSettings.fillPaginates ? (inspectorSingleSelectionMessage) : ("Exactly one page at the frame\u2019s size" + pngFollowsPrint
                      ? ", and a PNG stops at the frame"
                      : "" + "\u2014for single-page layouts (posters, brochure pages)"); },
                disabled: readOnly,
                disabledReason: readOnlyReason,
              },
            ]}
            onChange={(printMode?: Dynamic): Dynamic => {
              effectiveSettings.print !== printMode && effectiveSettings.onSetPrint(printMode);
            }}
          />
        </PropertyRow>
        <PropertyRow
          label={uiMessage("inspector.artboard.paper")}
          data-testid={"dc-artboard-paper"}
          title={
            readOnlyReason ?? (isPaginated ? (effectiveSettings.paperSet === undefined ? (uiMessage("inspector.artboard.notSetCurrentlyFromThe", { value1: String(paperSizes[effectiveSettings.paper].label) })) : (undefined)) : (uiMessage("inspector.artboard.appliesToFlowFixedExports")))
          }
        >
          <SegmentedControl
            aria-label={uiMessage("inspector.artboard.paper")}
            fullWidth={true}
            value={isPaginated ? (effectiveSettings.paperSet ?? "") : ""}
            segments={["letter", "a4"].map(
              (paperKey?: Dynamic): Dynamic => ({
                value: paperKey,
                label: paperSizes[paperKey].label,
                get tooltip() { return isPaginated ? (uiMessage("inspector.artboard.pages", { value1: String(isFlow
                      ? "Export PDF paginates onto "
                      : "When Export PDF paginates, it uses "), value2: String(paperSizes[paperKey].label), value3: String(effectiveSettings.paperSet === undefined && effectiveSettings.paper === paperKey
                      ? " (the current default)"
                      : "") })) : (undefined); },
                disabled: !isPaginated || readOnly,
                disabledReason: readOnlyReason,
              }),
            )}
            onChange={(paperKey?: Dynamic): Dynamic => {
              paperKey && effectiveSettings.onSetPaper(paperKey);
            }}
          />
        </PropertyRow>
      </PropertySection>
      <PropertySection title={uiMessage("inspector.artboard.appearance")} iconColumn={true}>
        <InspectorContext.Provider value={artboardContext}>
          <PropertyInspectorField
            state={{
              ...InspectorEditorPropLabelSpecConfig,
              value: resolveFillVar(fill?.background),
              companionValue: resolveFillVar(fill?.backgroundColor),
              varSource: fill?.vars[fill.background]
                ? fill.background
                : undefined,
              companionVarSource: fill?.vars[fill.backgroundColor]
                ? fill.backgroundColor
                : undefined,
              fallback: "#ffffff",
              disabled: fill == null || readOnly,
              whyDisabled: readOnlyReason,
            }}
            onCommit={(prop?: Dynamic, propValue?: Dynamic): Dynamic =>
              effectiveSettings.onSetFill([
                {
                  prop: prop,
                  value: propValue,
                },
              ])
            }
            onCommitMany={effectiveSettings.onSetFill}
          />
        </InspectorContext.Provider>
        {(() => {
          const RadiusRowComponent = ArtboardRadiusRow;
          const radiusRowProps = {
            radius: effectiveSettings.radius,
            readOnly: readOnly,
            onSetRadius: effectiveSettings.onSetRadius,
          } as const;
          const radiusRowKey = effectiveSettings.file;
          return <RadiusRowComponent key={radiusRowKey} {...radiusRowProps} />;
        })()}
      </PropertySection>
    </div>
  );
}
export {
  ArtboardInspector,
};
export function installEditorInspectorArtboard(): () => void {
  return () => {};
}

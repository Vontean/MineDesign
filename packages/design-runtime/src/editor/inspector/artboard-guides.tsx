import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { load_react_jsx_runtime } from "../../dependencies";
import { reactChromeInspectorSheet } from "../chrome/inspector-sheet";
import { joinClassNames } from "../chrome/overlay-state";
import { ColorEffectButton, PropertyEditorPopover, PropertyPopupBody, RemovePropertyButton } from "../properties/effect-popup";
import { PropertyActions } from "../properties/primitives";
import { PropertyRow } from "../properties/row";
import { PropertyHexRow, PropertyNumberRow, PropertySelectRow } from "../properties/rows";
import { PropertySection } from "../properties/section";
import { toModuleNamespace } from "../../module-helpers";
import { PlatformFileContentGridSizeCountSizeConfig, resolveArtboardGuide } from "../../platform/file-content";

var jsxInspectorArtboardGuides: Dynamic;
var InspectorArtboardGuidesColumnsRowsGridConfig: Dynamic;
var InspectorArtboardGuidesColumnsRowsConfig: Dynamic;
var InspectorArtboardGuidesStretchStartCenterValues: Dynamic;
var ArtboardGuidesPanel: Dynamic;
function artboardGuideDescription(source?: Dynamic): Dynamic {
  if (source.kind === "grid") return `${source.size}px`;
  let alignLabel: Dynamic =
      InspectorArtboardGuidesColumnsRowsConfig[source.kind][source.align],
    countLabel: Dynamic = source.auto ? "Auto" : String(source.count);
  return source.align === "stretch"
    ? `${countLabel} \xB7 ${alignLabel}`
    : `${countLabel} \xD7 ${source.size} \xB7 ${alignLabel}`;
}
function defaultArtboardGuide(kind?: Dynamic, frameWidth?: Dynamic): Dynamic {
  return kind === "grid"
    ? {
        kind: "grid",
        size: 8,
      }
    : kind === "rows"
      ? {
          kind: "rows",
          count: "auto",
          size: 8,
          gutter: 8,
        }
      : frameWidth >= 1024
        ? {
            kind: "columns",
            count: 12,
            gutter: 24,
            margin: 80,
          }
        : frameWidth >= 600
          ? {
              kind: "columns",
              count: 8,
              gutter: 16,
              margin: 32,
            }
          : {
              kind: "columns",
              count: 4,
              gutter: 12,
              margin: 16,
            };
}
function ArtboardGuideRow({
  index: index,
  guide: guide,
  frame: frame,
  open: open,
  onOpenChange: onOpenChange,
  onRemove: onRemove,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let [shouldFocusOnOpen, setShouldFocusOnOpen]: Dynamic = (0,
    reactChromeInspectorSheet.useState)(false),
    anchorRef: Dynamic = (0, reactChromeInspectorSheet.useRef)(null),
    kindLabel: Dynamic =
      InspectorArtboardGuidesColumnsRowsGridConfig[guide.kind],
    isHidden: Dynamic = guide.hidden === true,
    resolvedGuide: Dynamic = resolveArtboardGuide(guide, frame);
  return (
    <PropertyRow
      label={kindLabel}
      data-testid={"dc-guide-" + String(index)}
    >
      <span
        ref={anchorRef}
        className={joinClassNames(
          "relative flex min-w-0 flex-1",
          isHidden && "opacity-60",
        )}
      >
        <PropertyEditorPopover
          open={open}
          onOpenChange={onOpenChange}
          trigger={
            <ColorEffectButton
              label={uiMessage("inspector.artboardGuides.guide", { kind: String(kindLabel) })}
              color={resolvedGuide.color}
              text={artboardGuideDescription(resolvedGuide)}
              onClick={(clickEvent?: Dynamic): Dynamic =>
                setShouldFocusOnOpen(clickEvent.detail === 0)
              }
            />
          }
          anchor={(): Dynamic =>
            anchorRef.current?.closest("[data-property-row]") ?? null
          }
          focusOnOpen={shouldFocusOnOpen}
        >
          <ArtboardGuideEditor
            guide={guide}
            r={resolvedGuide}
            onClose={(): Dynamic => onOpenChange(false)}
            {...props}
          />
        </PropertyEditorPopover>
      </span>
      <Button
        variant={"ghost"}
        size={"sm"}
        iconOnly={true}
        icon={isHidden ? "EyeSlash" : "Eye"}
        aria-label={uiMessage("inspector.artboardGuides.hideGuide", { kind: String(kindLabel.toLowerCase()) })}
        aria-pressed={isHidden}
        tooltip={isHidden ? (uiMessage("inspector.artboardGuides.showOnTheCanvas")) : (uiMessage("inspector.artboardGuides.hideOnTheCanvas"))}
        className={joinClassNames(
          "shrink-0",
          isHidden && "text-muted",
        )}
        data-testid={"dc-guide-eye-" + String(index)}
        onClick={(): Dynamic => {
          let { hidden: hiddenFlag, ...guideWithoutHidden }: Dynamic = guide;
          props.onChange(
            isHidden
              ? guideWithoutHidden
              : {
                  ...guideWithoutHidden,
                  hidden: true,
                },
          );
        }}
      />
      <RemovePropertyButton
        label={uiMessage("inspector.artboardGuides.guide", { kind: String(kindLabel) })}
        onClick={onRemove}
      />
    </PropertyRow>
  );
}
function ArtboardGuideEditor({
  guide: guide,
  r: r8,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  onClose: onClose,
}: Dynamic): Dynamic {
  useUiLocale();
  let numberRowHandlers: Dynamic = (guideKey?: Dynamic, toGuideValue?: Dynamic): Dynamic => ({
      onValue: (nextValue?: Dynamic): Dynamic =>
        onChange({
          ...guide,
          [guideKey]: toGuideValue(nextValue),
        }),
      onScrub: (nextValue?: Dynamic): Dynamic =>
        onLive({
          ...guide,
          [guideKey]: toGuideValue(nextValue),
        }),
      onScrubEnd: onLiveEnd,
    }),
    colorRow: Dynamic = (
      <PropertyHexRow
        label={uiMessage("inspector.artboardGuides.color")}
        value={r8.color}
        onChange={(nextColor?: Dynamic): Dynamic => {
          let { color: previousColor, ...guideWithoutColor }: Dynamic = guide;
          onChange(
            nextColor === undefined
              ? guideWithoutColor
              : {
                  ...guideWithoutColor,
                  color: nextColor,
                },
          );
        }}
        onLive={(liveColor?: Dynamic): Dynamic =>
          onLive({
            ...guide,
            color: liveColor,
          })
        }
        onLiveEnd={onLiveEnd}
      />
    );
  if (r8.kind === "grid")
    return (
      <PropertyPopupBody title={uiMessage("inspector.artboardGuides.grid")} onClose={onClose}>
        <PropertyNumberRow
          label={uiMessage("inspector.artboardGuides.size")}
          value={r8.size}
          {...PlatformFileContentGridSizeCountSizeConfig.gridSize}
          step={1}
          smallStep={1}
          unit={"px"}
          {...numberRowHandlers(
            "size",
            (nextValue?: Dynamic): Dynamic => nextValue ?? r8.size,
          )}
        />
        {colorRow}
      </PropertyPopupBody>
    );
  let isStretch: Dynamic = r8.align === "stretch";
  return (
    <PropertyPopupBody
      title={InspectorArtboardGuidesColumnsRowsGridConfig[r8.kind]}
      onClose={onClose}
    >
      <PropertyNumberRow
        label={uiMessage("inspector.artboardGuides.count")}
        value={r8.auto ? undefined : r8.count}
        placeholder={isStretch ? (undefined) : (uiMessage("inspector.artboardGuides.auto"))}
        emptyStepFrom={r8.count}
        clearable={!isStretch}
        {...PlatformFileContentGridSizeCountSizeConfig.count}
        step={1}
        smallStep={1}
        {...numberRowHandlers("count", (nextValue?: Dynamic): Dynamic => nextValue ?? "auto")}
      />
      <PropertySelectRow
        label={uiMessage("inspector.artboardGuides.type")}
        value={r8.align}
        options={InspectorArtboardGuidesStretchStartCenterValues.map(
          (alignKey?: Dynamic): Dynamic => ({
            value: alignKey,
            label: InspectorArtboardGuidesColumnsRowsConfig[r8.kind][alignKey],
          }),
        )}
        onChange={(nextAlign?: Dynamic): Dynamic =>
          onChange({
            ...guide,
            align: nextAlign,
            ...(nextAlign === "stretch" && r8.auto
              ? {
                  count: Math.min(
                    r8.count,
                    PlatformFileContentGridSizeCountSizeConfig.count
                      .max,
                  ),
                }
              : {}),
          })
        }
      />
      {isStretch ? (<PropertyNumberRow
          label={uiMessage("inspector.artboardGuides.margin")}
          value={r8.margin}
          {...PlatformFileContentGridSizeCountSizeConfig.margin}
          step={1}
          smallStep={1}
          unit={"px"}
          {...numberRowHandlers("margin", (nextValue?: Dynamic): Dynamic => nextValue ?? 0)}
        />) : (<jsxInspectorArtboardGuides.Fragment>
          <PropertyNumberRow
            label={r8.kind === "columns" ? (uiMessage("inspector.artboardGuides.width")) : (uiMessage("inspector.artboardGuides.height"))}
            value={r8.size}
            {...PlatformFileContentGridSizeCountSizeConfig.size}
            step={1}
            smallStep={1}
            unit={"px"}
            {...numberRowHandlers(
              "size",
              (nextValue?: Dynamic): Dynamic => nextValue ?? r8.size,
            )}
          />
          {r8.align !== "center" && (<PropertyNumberRow
              label={uiMessage("inspector.artboardGuides.offset")}
              value={r8.offset}
              {...PlatformFileContentGridSizeCountSizeConfig.offset}
              step={1}
              smallStep={1}
              unit={"px"}
              {...numberRowHandlers(
                "offset",
                (nextValue?: Dynamic): Dynamic => nextValue ?? 0,
              )}
            />)}
        </jsxInspectorArtboardGuides.Fragment>)}
      <PropertyNumberRow
        label={uiMessage("inspector.artboardGuides.gutter")}
        value={r8.gutter}
        {...PlatformFileContentGridSizeCountSizeConfig.gutter}
        step={1}
        smallStep={1}
        unit={"px"}
        {...numberRowHandlers("gutter", (nextValue?: Dynamic): Dynamic => nextValue ?? 0)}
      />
      {colorRow}
    </PropertyPopupBody>
  );
}
export {
  artboardGuideDescription,
  ArtboardGuideEditor,
  ArtboardGuideRow,
  ArtboardGuidesPanel,
  defaultArtboardGuide,
  InspectorArtboardGuidesColumnsRowsConfig,
  InspectorArtboardGuidesColumnsRowsGridConfig,
  InspectorArtboardGuidesStretchStartCenterValues,
  jsxInspectorArtboardGuides,
};
export function installEditorInspectorArtboardGuides(): () => void {
  return () => {
    jsxInspectorArtboardGuides = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    InspectorArtboardGuidesColumnsRowsGridConfig = {
      get columns() { return uiMessage("inspector.artboardGuides.columns"); },
      get rows() { return uiMessage("inspector.artboardGuides.rows"); },
      grid: "Grid",
    };
    InspectorArtboardGuidesColumnsRowsConfig = {
      columns: {
        stretch: "Stretch",
        start: "Left",
        center: "Center",
        end: "Right",
      },
      rows: {
        stretch: "Stretch",
        start: "Top",
        center: "Center",
        end: "Bottom",
      },
    };
    InspectorArtboardGuidesStretchStartCenterValues = [
      "stretch",
      "start",
      "center",
      "end",
    ];
    ArtboardGuidesPanel = (0, reactChromeInspectorSheet.memo)(
      function ({ settings: settings }: Dynamic): Dynamic {
        let {
            guides: guides,
            onSetGuides: setGuides,
            onLiveGuides: setLiveGuides,
            onLiveEnd: endLiveGuides,
            w: frameWidth,
            h: frameHeight,
          }: Dynamic = settings,
          [openIndex, setOpenIndex]: Dynamic = (0,
          reactChromeInspectorSheet.useState)(null),
          limitReachedProps: Dynamic =
            guides.length >= 6
              ? {
                  disabled: true,
                  description: uiMessage("inspector.artboardGuides.atMostPerArtboard", { limit: String(6) }),
                }
              : {},
          addGuideItems: Dynamic = ["columns", "rows", "grid"].map(
            (kind?: Dynamic): Dynamic => ({
              label: InspectorArtboardGuidesColumnsRowsGridConfig[kind],
              onSelect: (): Dynamic => {
                setOpenIndex(guides.length);
                setGuides([...guides, defaultArtboardGuide(kind, frameWidth)]);
              },
              ...limitReachedProps,
            }),
          ),
          replaceGuideAt: Dynamic = (index?: Dynamic, nextGuide?: Dynamic): Dynamic =>
            guides.map(
              (guide?: Dynamic, guideIndex?: Dynamic): Dynamic =>
                guideIndex === index ? nextGuide : guide,
            );
        return (
          <PropertySection
            title={uiMessage("inspector.artboardGuides.layoutGuide")}
            actions={
              <PropertyActions
                aria-label={uiMessage("inspector.artboardGuides.addLayoutGuide")}
                items={addGuideItems}
              />
            }
          >
            {guides.map(
              (guideItem?: Dynamic, index?: Dynamic): Dynamic => (
                <ArtboardGuideRow
                  key={index}
                  index={index}
                  guide={guideItem}
                  frame={{
                    w: frameWidth,
                    h: frameHeight,
                  }}
                  open={openIndex === index}
                  onOpenChange={(isOpen?: Dynamic): Dynamic =>
                    setOpenIndex(
                      (currentIndex?: Dynamic): Dynamic =>
                        isOpen ? index : currentIndex === index ? null : currentIndex,
                    )
                  }
                  onChange={(nextGuide?: Dynamic): Dynamic =>
                    setGuides(replaceGuideAt(index, nextGuide))
                  }
                  onLive={(nextGuide?: Dynamic): Dynamic =>
                    setLiveGuides(replaceGuideAt(index, nextGuide))
                  }
                  onLiveEnd={endLiveGuides}
                  onRemove={(): Dynamic => {
                    setOpenIndex(
                      (currentIndex?: Dynamic): Dynamic =>
                        currentIndex === null || currentIndex === index
                          ? null
                          : currentIndex > index
                            ? currentIndex - 1
                            : currentIndex,
                    );
                    setGuides(
                      guides.filter(
                        (guide?: Dynamic, guideIndex?: Dynamic): Dynamic =>
                          guideIndex !== index,
                      ),
                    );
                  }}
                />
              ),
            )}
          </PropertySection>
        );
      },
    );
  };
}

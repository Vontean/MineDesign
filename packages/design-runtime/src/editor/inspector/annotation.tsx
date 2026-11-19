import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { useToast } from "../chrome/toast";
import { parseCssNumber } from "../css/values";
import { InspectorContext, useInspectorContext } from "./context-part-2";
import { inspectSingleElement } from "./selection";
import { MediaPlaybackControlsQuerySelector, reactMediaPlaybackControls, VideoSeekControl } from "../media/playback-controls";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { ACanvasPictureShowsAnUploadedMessage, InspectorAppearanceSection, PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet, PropertiesAppearanceSectionFontSizeFontWeightSet, PropertiesAppearanceSectionHandler, PropertiesAppearanceSectionImageRectOvalConfig, PropertiesAppearanceSectionImageVideoRectConfig, PropertiesAppearanceSectionItems_2 as fontWeightFaces, PropertiesAppearanceSectionLabel, PropertiesAppearanceSectionLabel_2 as fixedCanvasObjectSizeReason, PropertiesAppearanceSectionLabel_3 as noteSizeReason, PropertiesAppearanceSectionLabel_4 as titleSizeReason, PropertiesAppearanceSectionLabel_5 as ovalRoundReason, PropertiesAppearanceSectionLabel_6 as canvasObjectPaintReason, PropertiesAppearanceSectionLabel_7 as videoSourceReason, PropertiesAppearanceSectionNoteTitle1Config, PropertiesAppearanceSectionSubscribers, PropertiesAppearanceSectionSubscribers_2 as canvasCssPropertySet, PropertiesAppearanceSectionSubscribers_3 as imageMediaPropertySet, PropertiesAppearanceSectionWidthHeightPositionSet, useVisibleInspectorProperties } from "../properties/appearance-section";
import { CssEffectsSection } from "../properties/css-effects";
import { InspectorLayoutSection } from "../properties/layout-section";
import { PropertyActions } from "../properties/primitives";
import { PropertySection } from "../properties/section";
import { SessionArtboardStateEscape } from "../session/artboard-state";
import { toModuleNamespace } from "../../module-helpers";
import { initializePlatformCdsIsland } from "../../platform/cds-island";
import { PlatformFileContentTest_2 as isBlobPath } from "../../platform/file-content";

var reactInspectorAnnotation: Dynamic;
var reactInspectorAnnotation_2: Dynamic;
var jsxInspectorAnnotation: Dynamic;
var InspectorAnnotationLargerSmallerPattern: Dynamic;
var InspectorAnnotationFontFontSizeFontWeightSet: Dynamic;
function annotationClientRect(annotationId?: Dynamic): Dynamic {
  let element: Dynamic = (document as Dynamic).querySelector(
      '[data-mega-annotation="' + CSS.escape(annotationId) + '"]',
    ),
    shapeElement: Dynamic =
      element?.querySelector(
        '[data-testid^="mega-shape-svg-"], div[data-testid^="mega-shape-body-"], img[data-testid^="mega-shape-body-"], video[data-testid^="mega-shape-body-"], [data-testid^="mega-note-text-"]',
      ) ?? element;
  if (!shapeElement) return {};
  let computedStyle: Dynamic = getComputedStyle(shapeElement),
    styleMap: Dynamic = {};
  for (let index: Dynamic = 0; index < computedStyle.length; index++) {
    let propertyName: Dynamic = computedStyle.item(index);
    propertyName.startsWith("-") ||
      (styleMap[
        propertyName.replace(
          /-([a-z])/g,
          (matchText?: Dynamic, letter?: Dynamic): Dynamic =>
            letter.toUpperCase(),
        )
      ] = computedStyle.getPropertyValue(propertyName));
  }
  return styleMap;
}
function AnnotationInspector({
  settings: settings,
  readOnly = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let { showToast: showToast }: Dynamic = useToast(),
    isImage: Dynamic = settings.kind === "image",
    isVideo: Dynamic = isImage && settings.video !== undefined,
    isLineLike: Dynamic = settings.kind === "line" || settings.kind === "arrow",
    isStrokeLike: Dynamic = isLineLike || settings.kind === "pen",
    hasTextStyle: Dynamic = settings.textStyle !== undefined,
    selectionKey: Dynamic = "canvas:" + settings.id,
    [forceShown, setForceShown]: Dynamic = (0,
    reactMediaPlaybackControls.useState)((): Dynamic => new Set());
  (0, reactMediaPlaybackControls.useEffect)(
    (): Dynamic => setForceShown(new Set()),
    [selectionKey],
  );
  let [clientRect, setClientRect]: Dynamic = (0,
  reactMediaPlaybackControls.useState)({});
  (0, reactMediaPlaybackControls.useEffect)(
    (): Dynamic => setClientRect(annotationClientRect(settings.id)),
    [
      settings.id,
      settings.css,
      settings.w,
      settings.h,
      settings.paint,
      settings.textStyle,
    ],
  );
  let inspectorContext: Dynamic = useInspectorContext(),
    annotationContext: Dynamic = (0, reactMediaPlaybackControls.useMemo)(
      (): Dynamic => ({
        ...inspectorContext,
        iframeDefinedVars: PropertiesAppearanceSectionSubscribers,
      }),
      [inspectorContext],
    ),
    inspectedElement: Dynamic = (0,
    reactMediaPlaybackControls.useMemo)((): Dynamic => {
      let css: Dynamic = settings.css ?? {},
        styleDeclarations: Dynamic = [
          "position: absolute",
          "left: " + String(Math.round(settings.x)) + "px",
          "top: " + String(Math.round(settings.y)) + "px",
          ...(isLineLike || settings.kind === "title1"
            ? []
            : ["width: " + String(Math.round(settings.w)) + "px"]),
          ...(settings.h !== undefined && !isLineLike
            ? ["height: " + String(Math.round(settings.h)) + "px"]
            : []),
          ...(isStrokeLike
            ? [
                "fill: none",
                "stroke: " +
                  (css.stroke ?? settings.paint ?? "currentColor"),
                "stroke-width: " +
                  (css["stroke-width"] ??
                    String(settings.strokeWidth ?? 4) + "px"),
              ]
            : []),
          ...((settings.kind === "rect" || settings.kind === "oval") &&
          css.background === undefined &&
          css["background-color"] === undefined &&
          settings.paint
            ? ["background: " + settings.paint]
            : []),
          ...(settings.maxW !== undefined
            ? ["max-width: " + String(settings.maxW) + "px"]
            : []),
          // MineDesign：便签的 maxH 是拖出来的高度（文字更多时继续长高），在面板里就是「高度」
          ...(settings.maxH !== undefined
            ? [
                (settings.kind === "note" ? "height: " : "max-height: ") +
                  String(settings.maxH) +
                  "px",
              ]
            : []),
          ...(hasTextStyle
            ? [
                "font-size: " + String(settings.textStyle.size) + "px",
                "font-weight: " + (settings.textStyle.bold ? "700" : "400"),
                "font-style: " +
                  (settings.textStyle.italic ? "italic" : "normal"),
              ]
            : []),
          ...Object.entries(css)
            .filter(
              ([propName]: Dynamic): Dynamic =>
                !(isStrokeLike && (propName === "stroke" || propName === "stroke-width")),
            )
            .map(
              ([propName, propValue]: Dynamic): Dynamic =>
                propName + ": " + String(propValue),
            ),
        ];
      return inspectSingleElement({
        tag: isVideo
          ? "video"
          : (PropertiesAppearanceSectionImageRectOvalConfig[
              settings.kind
            ] ?? "div"),
        authoredStyle: styleDeclarations.join("; "),
        attrs: isVideo
          ? {
              src: settings.video ?? "",
            }
          : isImage
            ? {
                src: settings.src ?? "",
                ...(settings.alt
                  ? {
                      alt: settings.alt,
                    }
                  : {}),
              }
            : {},
        text: null,
        canvasEditable: true,
        computed: clientRect,
        disabled: readOnly,
        heads:
          isLineLike && settings.heads
            ? {
                ...settings.heads,
                width: 1,
              }
            : null,
      });
    }, [
      settings.heads,
      settings.x,
      settings.y,
      settings.w,
      settings.h,
      settings.maxW,
      settings.maxH,
      settings.css,
      settings.src,
      settings.video,
      isVideo,
      settings.alt,
      settings.kind,
      settings.paint,
      settings.strokeWidth,
      settings.textStyle,
      isImage,
      isLineLike,
      isStrokeLike,
      hasTextStyle,
      clientRect,
      readOnly,
    ]),
    visibleSections: Dynamic = (0,
    reactMediaPlaybackControls.useMemo)((): Dynamic => {
      let allowedSectionIds: Dynamic =
          (isVideo
            ? PropertiesAppearanceSectionImageVideoRectConfig.video
            : PropertiesAppearanceSectionImageVideoRectConfig[
                settings.kind
              ]) ??
          PropertiesAppearanceSectionImageVideoRectConfig.rect,
        readOnlyReason: Dynamic = readOnly
          ? ViewOnlyYouCanInspectThisMessage
          : undefined,
        fixedSizeReason: Dynamic =
          settings.kind === "title1"
            ? titleSizeReason
            : noteSizeReason;
      return inspectedElement.sections
        .filter((section?: Dynamic): Dynamic => allowedSectionIds.has(section.id))
        .map(
          (section?: Dynamic): Dynamic => ({
            ...section,
            rows: section.rows
              .filter(
                (row?: Dynamic): Dynamic =>
                  section.id === "size" || section.id === "sizing"
                    ? (PropertiesAppearanceSectionWidthHeightPositionSet.has(
                        row.prop,
                      ) ||
                        PropertiesAppearanceSectionNoteTitle1Config[
                          settings.kind
                        ]?.has(row.prop) === true) &&
                      !(
                        isLineLike &&
                        (row.prop === "width" || row.prop === "height")
                      )
                    : section.id === "image" || section.id === "media"
                      ? imageMediaPropertySet.has(
                          row.prop,
                        )
                      : section.id === "effects"
                        ? PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet.has(
                            row.prop,
                          )
                        : section.id === "svgPaint"
                          ? row.prop === "stroke" ||
                            row.prop === "stroke-width" ||
                            row.prop === "__headStart" ||
                            row.prop === "__headEnd"
                          : section.id === "text"
                            ? PropertiesAppearanceSectionFontSizeFontWeightSet.has(
                                row.prop,
                              )
                            : isStrokeLike
                              ? row.prop === "opacity"
                              : canvasCssPropertySet.has(
                                  row.prop,
                                ) || row.prop === "background",
              )
              .map(
                (row?: Dynamic): Dynamic =>
                  row.prop === "position"
                    ? {
                        ...row,
                        disabled: true,
                        whyDisabled:
                          readOnlyReason ?? PropertiesAppearanceSectionLabel,
                      }
                    : row.prop === "max-height" ||
                        row.prop === "max-width"
                      ? {
                          ...row,
                          fallback: PropertiesAppearanceSectionHandler(
                            row.prop === "max-width"
                              ? settings.defaultMaxW
                              : settings.defaultMaxH,
                          ),
                          spec:
                            settings.kind === "note" && row.spec
                              ? {
                                  ...row.spec,
                                  longTail: false,
                                }
                              : row.spec,
                          whyDisabled: readOnlyReason,
                        }
                      : (row.prop === "width" ||
                            row.prop === "height") &&
                          hasTextStyle &&
                          (row.prop === "height"
                            ? settings.kind !== "note"
                            : settings.kind === "title1")
                        ? {
                            ...row,
                            fixedSizeReason: fixedSizeReason,
                            disabled: true,
                            whyDisabled: readOnlyReason ?? fixedSizeReason,
                          }
                        : row.prop === "width" || row.prop === "height"
                          ? {
                              ...row,
                              fixedSizeReason:
                                fixedCanvasObjectSizeReason,
                              whyDisabled: readOnlyReason,
                            }
                          : row.prop === "@src" && isVideo
                            ? {
                                ...row,
                                disabled: true,
                                whyDisabled:
                                  readOnlyReason ??
                                  videoSourceReason,
                              }
                            : row.prop === "@src"
                              ? {
                                  ...row,
                                  imageUploadOnlyReason:
                                    ACanvasPictureShowsAnUploadedMessage,
                                  whyDisabled: readOnlyReason,
                                }
                              : row.prop === "background"
                                ? {
                                    ...row,
                                    fillNoImageReason:
                                      canvasObjectPaintReason,
                                    whyDisabled: readOnlyReason,
                                    ...(settings.css?.background ===
                                      undefined &&
                                    settings.css?.["background-color"] ===
                                      undefined &&
                                    settings.paint
                                      ? {
                                          inheritedFrom: "the canvas palette",
                                        }
                                      : {}),
                                  }
                                : row.prop === "stroke" &&
                                    settings.css?.stroke === undefined
                                  ? {
                                      ...row,
                                      inheritedFrom: "the canvas palette",
                                      whyDisabled: readOnlyReason,
                                    }
                                  : row.prop === "font-weight"
                                    ? {
                                        ...row,
                                        faces:
                                          fontWeightFaces,
                                        whyDisabled: readOnlyReason,
                                      }
                                    : settings.kind === "oval" &&
                                        /radius/.test(row.prop)
                                      ? {
                                          ...row,
                                          disabled: true,
                                          whyDisabled:
                                            readOnlyReason ??
                                            ovalRoundReason,
                                        }
                                      : {
                                          ...row,
                                          whyDisabled: readOnlyReason,
                                        },
              ),
          }),
        )
        .filter((section?: Dynamic): Dynamic => section.rows.length > 0);
    }, [
      inspectedElement,
      isLineLike,
      isStrokeLike,
      hasTextStyle,
      readOnly,
      settings.kind,
      settings.defaultMaxW,
      settings.defaultMaxH,
    ]),
    commitProperties: Dynamic = (changedProps?: Dynamic): Dynamic => {
      let boxChanges: Dynamic = {},
        cssChanges: Dynamic = [],
        textStyleChanges: Dynamic = {};
      for (let change of changedProps as Dynamic)
        if (
          change.prop === "left" ||
          change.prop === "top" ||
          change.prop === "width" ||
          change.prop === "height"
        ) {
          let parsedNumber: Dynamic =
            change.value == null
              ? null
              : parseCssNumber(change.value);
          if (!parsedNumber || (parsedNumber.unit !== "px" && parsedNumber.unit !== ""))
            continue;
          boxChanges[
            change.prop === "left"
              ? "x"
              : change.prop === "top"
                ? "y"
                : change.prop === "width"
                  ? "w"
                  : settings.kind === "note"
                    ? "maxH"
                    : "h"
          ] = parsedNumber.value;
        } else if (
          hasTextStyle &&
          (change.prop === "max-width" || change.prop === "max-height")
        ) {
          let parsedNumber: Dynamic =
            change.value == null
              ? null
              : parseCssNumber(change.value);
          if (
            change.value != null &&
            (!parsedNumber || (parsedNumber.unit !== "px" && parsedNumber.unit !== ""))
          )
            continue;
          boxChanges[change.prop === "max-width" ? "maxW" : "maxH"] = parsedNumber
            ? parsedNumber.value
            : null;
        } else if (
          change.prop === "__headStart" ||
          change.prop === "__headEnd"
        )
          (change.value === "none" ||
            change.value === "open" ||
            change.value === "filled") &&
            settings.onSetHeads?.(
              change.prop === "__headStart" ? "start" : "end",
              change.value,
            );
        else if (change.prop === "@src")
          change.value != null &&
          isBlobPath(change.value) !== null
            ? settings.onReplaceImage?.(change.value)
            : change.value != null &&
              showToast(
                ACanvasPictureShowsAnUploadedMessage + ".",
                "info",
              );
        else if (hasTextStyle && change.prop === "font-size") {
          let parsedNumber: Dynamic =
            change.value == null
              ? null
              : parseCssNumber(change.value);
          parsedNumber &&
            (parsedNumber.unit === "px" || parsedNumber.unit === "") &&
            (textStyleChanges.size = parsedNumber.value);
        } else
          hasTextStyle && change.prop === "font-weight"
            ? change.value == null
              ? (textStyleChanges.bold = false)
              : ((textStyleChanges.bold = /bold|[6-9]00/.test(change.value)),
                /italic/.test(change.value) && (textStyleChanges.italic = true))
            : hasTextStyle && change.prop === "font-style"
              ? (textStyleChanges.italic =
                  change.value != null &&
                  /italic|oblique/.test(change.value))
              : canvasCssPropertySet.has(
                  change.prop,
                ) && cssChanges.push(change);
      Object.keys(boxChanges).length > 0 &&
        (isScrubbingRef.current && (boxDirtyRef.current = true),
        settings.onSetBox(boxChanges, !isScrubbingRef.current));
      cssChanges.length > 0 &&
        (isScrubbingRef.current && (cssPendingRef.current = cssChanges),
        settings.onSetCss?.(cssChanges, isScrubbingRef.current));
      Object.keys(textStyleChanges).length > 0 &&
        (isScrubbingRef.current && (textStylePendingRef.current = textStyleChanges),
        settings.onSetTextStyle?.(textStyleChanges, isScrubbingRef.current));
    },
    boxDirtyRef: Dynamic = reactMediaPlaybackControls.default.useRef(false),
    cssPendingRef: Dynamic = reactMediaPlaybackControls.default.useRef(null),
    textStylePendingRef: Dynamic = reactMediaPlaybackControls.default.useRef(null),
    isScrubbingRef: Dynamic = reactMediaPlaybackControls.default.useRef(false),
    scrubbingContext: Dynamic = (0, reactMediaPlaybackControls.useMemo)(
      (): Dynamic => ({
        ...annotationContext,
        setScrubbing: (isScrubbing?: Dynamic): Dynamic => {
          isScrubbingRef.current = isScrubbing;
          annotationContext.setScrubbing(isScrubbing);
          !isScrubbing &&
            (boxDirtyRef.current && settings.onSetBox({}, true),
            cssPendingRef.current && settings.onSetCss?.(cssPendingRef.current, false),
            textStylePendingRef.current && settings.onSetTextStyle?.(textStylePendingRef.current, false),
            (boxDirtyRef.current = false),
            (cssPendingRef.current = null),
            (textStylePendingRef.current = null));
        },
      }),
      [annotationContext, settings],
    ),
    visibleProperties: Dynamic = useVisibleInspectorProperties({
      selKey: selectionKey,
      forceShown: forceShown,
      setForceShown: setForceShown,
      onCommit: (prop?: Dynamic, propValue?: Dynamic): Dynamic =>
        commitProperties([
          {
            prop: prop,
            value: propValue,
          },
        ]),
      onCommitMany: commitProperties,
      onPickImageFile: (file?: Dynamic): Dynamic =>
        settings.onReplaceImage?.(file),
    }),
    {
      addItemsFor: addItemsFor,
      renderRow: renderRow,
      renderRows: renderRows,
    }: Dynamic = visibleProperties;
  return (
    <InspectorContext.Provider value={scrubbingContext}>
      <div
        data-testid={"dc-canvas-object-settings"}
        data-object-kind={settings.kind}
        className={"contents"}
      >
        {visibleSections.map((section?: Dynamic): Dynamic => {
          if (section.id === "sizing" || section.id === "size")
            return (() => {
              const SizingSectionComponent = InspectorLayoutSection;
              const sizingSectionProps = {
                sec: section,
                selKey: selectionKey,
                isNested: false,
                readOnly: readOnly,
                renderRows: renderRows,
                renderRow: renderRow,
                addItemsFor: addItemsFor,
                onCommitMany: commitProperties,
              } as const;
              const sizingSectionKey = section.id;
              return <SizingSectionComponent key={sizingSectionKey} {...sizingSectionProps} />;
            })();
          if (section.id === "appearance")
            return (() => {
              const AppearanceSectionComponent = InspectorAppearanceSection;
              const appearanceSectionProps = {
                sec: section,
                selKey: selectionKey,
                isNested: false,
                readOnly: readOnly,
                rows: visibleProperties,
                onCommitMany: commitProperties,
                fillInline:
                  !!settings.css?.background ||
                  !!settings.css?.["background-color"],
              } as const;
              const appearanceSectionKey = section.id;
              return <AppearanceSectionComponent key={appearanceSectionKey} {...appearanceSectionProps} />;
            })();
          let sectionElement: Dynamic = (() => {
            const PropertySectionComponent = PropertySection;
            const propertySectionProps = {
              title: section.title,
              iconColumn: section.id === "text",
              actions: (
                <PropertyActions
                  section={section.title}
                  data-testid={"dc-add-" + section.id}
                  items={addItemsFor(section.rows)}
                  disabled={readOnly}
                />
              ),
              children: [
                renderRows(section.rows),
                section.id === "media" && isVideo && (
                  <VideoSeekControl
                    key={selectionKey}
                    find={(): Dynamic =>
                      (document as Dynamic).querySelector(
                        SessionArtboardStateEscape(settings.id),
                      )
                    }
                    whyAbsent={(): Dynamic =>
                      MediaPlaybackControlsQuerySelector(
                        settings.id,
                      )
                    }
                  />
                ),
              ],
            } as const;
            const propertySectionKey = section.id;
            return <PropertySectionComponent key={propertySectionKey} {...propertySectionProps} />;
          })();
          return section.id === "effects" && !readOnly ? (
            <CssEffectsSection
              key={"effects|" + selectionKey}
              rows={section.rows}
              onCommitMany={commitProperties}
              renderRows={renderRows}
              addItemsFor={addItemsFor}
              fallback={sectionElement}
            />
          ) : (
            sectionElement
          );
        })}
      </div>
    </InspectorContext.Provider>
  );
}
export {
  annotationClientRect,
  AnnotationInspector,
  InspectorAnnotationFontFontSizeFontWeightSet,
  InspectorAnnotationLargerSmallerPattern,
  jsxInspectorAnnotation,
  reactInspectorAnnotation,
  reactInspectorAnnotation_2,
};
export function installEditorInspectorAnnotation(): () => void {
  return () => {
    reactInspectorAnnotation = toModuleNamespace(
      load_react(),
      1,
    );
    reactInspectorAnnotation_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializePlatformCdsIsland();
    jsxInspectorAnnotation = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    InspectorAnnotationLargerSmallerPattern =
      /\d(em|ex|ch|lh|cap|ic|%|cq(w|h|i|b|min|max))(?![\w-])|(^|\s)(larger|smaller|bolder|lighter)(\s|$)/i;
    InspectorAnnotationFontFontSizeFontWeightSet = new Set([
      "font",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
    ]);
  };
}

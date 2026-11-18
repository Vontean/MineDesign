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
import { ACanvasPictureShowsAnUploadedMessage, InspectorAppearanceSection, PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet, PropertiesAppearanceSectionFontSizeFontWeightSet, PropertiesAppearanceSectionHandler, PropertiesAppearanceSectionImageRectOvalConfig, PropertiesAppearanceSectionImageVideoRectConfig, PropertiesAppearanceSectionItems_2, PropertiesAppearanceSectionLabel, PropertiesAppearanceSectionLabel_2, PropertiesAppearanceSectionLabel_3, PropertiesAppearanceSectionLabel_4, PropertiesAppearanceSectionLabel_5, PropertiesAppearanceSectionLabel_6, PropertiesAppearanceSectionLabel_7, PropertiesAppearanceSectionNoteTitle1Config, PropertiesAppearanceSectionSubscribers, PropertiesAppearanceSectionSubscribers_2, PropertiesAppearanceSectionSubscribers_3, PropertiesAppearanceSectionWidthHeightPositionSet, useVisibleInspectorProperties } from "../properties/appearance-section";
import { CssEffectsSection } from "../properties/css-effects";
import { InspectorLayoutSection } from "../properties/layout-section";
import { PropertyActions } from "../properties/primitives";
import { PropertySection } from "../properties/section";
import { SessionArtboardStateEscape } from "../session/artboard-state";
import { toModuleNamespace } from "../../module-helpers";
import { initializePlatformCdsIsland } from "../../platform/cds-island";
import { PlatformFileContentTest_2 } from "../../platform/file-content";

var reactInspectorAnnotation: Dynamic;
var reactInspectorAnnotation_2: Dynamic;
var jsxInspectorAnnotation: Dynamic;
var InspectorAnnotationLargerSmallerPattern: Dynamic;
var InspectorAnnotationFontFontSizeFontWeightSet: Dynamic;
function annotationClientRect(input?: Dynamic): Dynamic {
  let element: Dynamic = (document as Dynamic).querySelector(
      '[data-mega-annotation="' + CSS.escape(input) + '"]',
    ),
    value: Dynamic =
      element?.querySelector(
        '[data-testid^="mega-shape-svg-"], div[data-testid^="mega-shape-body-"], img[data-testid^="mega-shape-body-"], video[data-testid^="mega-shape-body-"], [data-testid^="mega-note-text-"]',
      ) ?? element;
  if (!value) return {};
  let value2: Dynamic = getComputedStyle(value),
    state: Dynamic = {};
  for (let index: Dynamic = 0; index < value2.length; index++) {
    let value3: Dynamic = value2.item(index);
    value3.startsWith("-") ||
      (state[
        value3.replace(
          /-([a-z])/g,
          (input2?: Dynamic, options?: Dynamic): Dynamic =>
            options.toUpperCase(),
        )
      ] = value2.getPropertyValue(value3));
  }
  return state;
}
function AnnotationInspector({
  settings: settings,
  readOnly = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let { showToast: value }: Dynamic = useToast(),
    value2: Dynamic = settings.kind === "image",
    value3: Dynamic = value2 && settings.video !== undefined,
    value4: Dynamic = settings.kind === "line" || settings.kind === "arrow",
    value5: Dynamic = value4 || settings.kind === "pen",
    value6: Dynamic = settings.textStyle !== undefined,
    value7: Dynamic = "canvas:" + settings.id,
    [value8, value9]: Dynamic = (0,
    reactMediaPlaybackControls.useState)((): Dynamic => new Set());
  (0, reactMediaPlaybackControls.useEffect)(
    (): Dynamic => value9(new Set()),
    [value7],
  );
  let [value10, value11]: Dynamic = (0,
  reactMediaPlaybackControls.useState)({});
  (0, reactMediaPlaybackControls.useEffect)(
    (): Dynamic => value11(annotationClientRect(settings.id)),
    [
      settings.id,
      settings.css,
      settings.w,
      settings.h,
      settings.paint,
      settings.textStyle,
    ],
  );
  let value12: Dynamic = useInspectorContext(),
    value13: Dynamic = (0, reactMediaPlaybackControls.useMemo)(
      (): Dynamic => ({
        ...value12,
        iframeDefinedVars: PropertiesAppearanceSectionSubscribers,
      }),
      [value12],
    ),
    value14: Dynamic = (0,
    reactMediaPlaybackControls.useMemo)((): Dynamic => {
      let value21: Dynamic = settings.css ?? {},
        items: Dynamic = [
          "position: absolute",
          "left: " + String(Math.round(settings.x)) + "px",
          "top: " + String(Math.round(settings.y)) + "px",
          ...(value4 || settings.kind === "title1"
            ? []
            : ["width: " + String(Math.round(settings.w)) + "px"]),
          ...(settings.h !== undefined && !value4
            ? ["height: " + String(Math.round(settings.h)) + "px"]
            : []),
          ...(value5
            ? [
                "fill: none",
                "stroke: " +
                  (value21.stroke ?? settings.paint ?? "currentColor"),
                "stroke-width: " +
                  (value21["stroke-width"] ??
                    String(settings.strokeWidth ?? 4) + "px"),
              ]
            : []),
          ...((settings.kind === "rect" || settings.kind === "oval") &&
          value21.background === undefined &&
          value21["background-color"] === undefined &&
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
          ...(value6
            ? [
                "font-size: " + String(settings.textStyle.size) + "px",
                "font-weight: " + (settings.textStyle.bold ? "700" : "400"),
                "font-style: " +
                  (settings.textStyle.italic ? "italic" : "normal"),
              ]
            : []),
          ...Object.entries(value21)
            .filter(
              ([input]: Dynamic): Dynamic =>
                !(value5 && (input === "stroke" || input === "stroke-width")),
            )
            .map(
              ([input, input2]: Dynamic): Dynamic =>
                input + ": " + String(input2),
            ),
        ];
      return inspectSingleElement({
        tag: value3
          ? "video"
          : (PropertiesAppearanceSectionImageRectOvalConfig[
              settings.kind
            ] ?? "div"),
        authoredStyle: items.join("; "),
        attrs: value3
          ? {
              src: settings.video ?? "",
            }
          : value2
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
        computed: value10,
        disabled: readOnly,
        heads:
          value4 && settings.heads
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
      value3,
      settings.alt,
      settings.kind,
      settings.paint,
      settings.strokeWidth,
      settings.textStyle,
      value2,
      value4,
      value5,
      value6,
      value10,
      readOnly,
    ]),
    value15: Dynamic = (0,
    reactMediaPlaybackControls.useMemo)((): Dynamic => {
      let value21: Dynamic =
          (value3
            ? PropertiesAppearanceSectionImageVideoRectConfig.video
            : PropertiesAppearanceSectionImageVideoRectConfig[
                settings.kind
              ]) ??
          PropertiesAppearanceSectionImageVideoRectConfig.rect,
        value22: Dynamic = readOnly
          ? ViewOnlyYouCanInspectThisMessage
          : undefined,
        value23: Dynamic =
          settings.kind === "title1"
            ? PropertiesAppearanceSectionLabel_4
            : PropertiesAppearanceSectionLabel_3;
      return value14.sections
        .filter((input?: Dynamic): Dynamic => value21.has(input.id))
        .map(
          (input?: Dynamic): Dynamic => ({
            ...input,
            rows: input.rows
              .filter(
                (input2?: Dynamic): Dynamic =>
                  input.id === "size" || input.id === "sizing"
                    ? (PropertiesAppearanceSectionWidthHeightPositionSet.has(
                        input2.prop,
                      ) ||
                        PropertiesAppearanceSectionNoteTitle1Config[
                          settings.kind
                        ]?.has(input2.prop) === true) &&
                      !(
                        value4 &&
                        (input2.prop === "width" || input2.prop === "height")
                      )
                    : input.id === "image" || input.id === "media"
                      ? PropertiesAppearanceSectionSubscribers_3.has(
                          input2.prop,
                        )
                      : input.id === "effects"
                        ? PropertiesAppearanceSectionBoxShadowFilterBackdropFilterSet.has(
                            input2.prop,
                          )
                        : input.id === "svgPaint"
                          ? input2.prop === "stroke" ||
                            input2.prop === "stroke-width" ||
                            input2.prop === "__headStart" ||
                            input2.prop === "__headEnd"
                          : input.id === "text"
                            ? PropertiesAppearanceSectionFontSizeFontWeightSet.has(
                                input2.prop,
                              )
                            : value5
                              ? input2.prop === "opacity"
                              : PropertiesAppearanceSectionSubscribers_2.has(
                                  input2.prop,
                                ) || input2.prop === "background",
              )
              .map(
                (input2?: Dynamic): Dynamic =>
                  input2.prop === "position"
                    ? {
                        ...input2,
                        disabled: true,
                        whyDisabled:
                          value22 ?? PropertiesAppearanceSectionLabel,
                      }
                    : input2.prop === "max-height" ||
                        input2.prop === "max-width"
                      ? {
                          ...input2,
                          fallback: PropertiesAppearanceSectionHandler(
                            input2.prop === "max-width"
                              ? settings.defaultMaxW
                              : settings.defaultMaxH,
                          ),
                          spec:
                            settings.kind === "note" && input2.spec
                              ? {
                                  ...input2.spec,
                                  longTail: false,
                                }
                              : input2.spec,
                          whyDisabled: value22,
                        }
                      : (input2.prop === "width" ||
                            input2.prop === "height") &&
                          value6 &&
                          (input2.prop === "height"
                            ? settings.kind !== "note"
                            : settings.kind === "title1")
                        ? {
                            ...input2,
                            fixedSizeReason: value23,
                            disabled: true,
                            whyDisabled: value22 ?? value23,
                          }
                        : input2.prop === "width" || input2.prop === "height"
                          ? {
                              ...input2,
                              fixedSizeReason:
                                PropertiesAppearanceSectionLabel_2,
                              whyDisabled: value22,
                            }
                          : input2.prop === "@src" && value3
                            ? {
                                ...input2,
                                disabled: true,
                                whyDisabled:
                                  value22 ??
                                  PropertiesAppearanceSectionLabel_7,
                              }
                            : input2.prop === "@src"
                              ? {
                                  ...input2,
                                  imageUploadOnlyReason:
                                    ACanvasPictureShowsAnUploadedMessage,
                                  whyDisabled: value22,
                                }
                              : input2.prop === "background"
                                ? {
                                    ...input2,
                                    fillNoImageReason:
                                      PropertiesAppearanceSectionLabel_6,
                                    whyDisabled: value22,
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
                                : input2.prop === "stroke" &&
                                    settings.css?.stroke === undefined
                                  ? {
                                      ...input2,
                                      inheritedFrom: "the canvas palette",
                                      whyDisabled: value22,
                                    }
                                  : input2.prop === "font-weight"
                                    ? {
                                        ...input2,
                                        faces:
                                          PropertiesAppearanceSectionItems_2,
                                        whyDisabled: value22,
                                      }
                                    : settings.kind === "oval" &&
                                        /radius/.test(input2.prop)
                                      ? {
                                          ...input2,
                                          disabled: true,
                                          whyDisabled:
                                            value22 ??
                                            PropertiesAppearanceSectionLabel_5,
                                        }
                                      : {
                                          ...input2,
                                          whyDisabled: value22,
                                        },
              ),
          }),
        )
        .filter((input?: Dynamic): Dynamic => input.rows.length > 0);
    }, [
      value14,
      value4,
      value5,
      value6,
      readOnly,
      settings.kind,
      settings.defaultMaxW,
      settings.defaultMaxH,
    ]),
    callback: Dynamic = (input?: Dynamic): Dynamic => {
      let state: Dynamic = {},
        items: Dynamic = [],
        state2: Dynamic = {};
      for (let value21 of input as Dynamic)
        if (
          value21.prop === "left" ||
          value21.prop === "top" ||
          value21.prop === "width" ||
          value21.prop === "height"
        ) {
          let value22: Dynamic =
            value21.value == null
              ? null
              : parseCssNumber(value21.value);
          if (!value22 || (value22.unit !== "px" && value22.unit !== ""))
            continue;
          state[
            value21.prop === "left"
              ? "x"
              : value21.prop === "top"
                ? "y"
                : value21.prop === "width"
                  ? "w"
                  : settings.kind === "note"
                    ? "maxH"
                    : "h"
          ] = value22.value;
        } else if (
          value6 &&
          (value21.prop === "max-width" || value21.prop === "max-height")
        ) {
          let value22: Dynamic =
            value21.value == null
              ? null
              : parseCssNumber(value21.value);
          if (
            value21.value != null &&
            (!value22 || (value22.unit !== "px" && value22.unit !== ""))
          )
            continue;
          state[value21.prop === "max-width" ? "maxW" : "maxH"] = value22
            ? value22.value
            : null;
        } else if (
          value21.prop === "__headStart" ||
          value21.prop === "__headEnd"
        )
          (value21.value === "none" ||
            value21.value === "open" ||
            value21.value === "filled") &&
            settings.onSetHeads?.(
              value21.prop === "__headStart" ? "start" : "end",
              value21.value,
            );
        else if (value21.prop === "@src")
          value21.value != null &&
          PlatformFileContentTest_2(value21.value) !== null
            ? settings.onReplaceImage?.(value21.value)
            : value21.value != null &&
              value(
                ACanvasPictureShowsAnUploadedMessage + ".",
                "info",
              );
        else if (value6 && value21.prop === "font-size") {
          let value22: Dynamic =
            value21.value == null
              ? null
              : parseCssNumber(value21.value);
          value22 &&
            (value22.unit === "px" || value22.unit === "") &&
            (state2.size = value22.value);
        } else
          value6 && value21.prop === "font-weight"
            ? value21.value == null
              ? (state2.bold = false)
              : ((state2.bold = /bold|[6-9]00/.test(value21.value)),
                /italic/.test(value21.value) && (state2.italic = true))
            : value6 && value21.prop === "font-style"
              ? (state2.italic =
                  value21.value != null &&
                  /italic|oblique/.test(value21.value))
              : PropertiesAppearanceSectionSubscribers_2.has(
                  value21.prop,
                ) && items.push(value21);
      Object.keys(state).length > 0 &&
        (ref4.current && (ref.current = true),
        settings.onSetBox(state, !ref4.current));
      items.length > 0 &&
        (ref4.current && (ref2.current = items),
        settings.onSetCss?.(items, ref4.current));
      Object.keys(state2).length > 0 &&
        (ref4.current && (ref3.current = state2),
        settings.onSetTextStyle?.(state2, ref4.current));
    },
    ref: Dynamic = reactMediaPlaybackControls.default.useRef(false),
    ref2: Dynamic = reactMediaPlaybackControls.default.useRef(null),
    ref3: Dynamic = reactMediaPlaybackControls.default.useRef(null),
    ref4: Dynamic = reactMediaPlaybackControls.default.useRef(false),
    value16: Dynamic = (0, reactMediaPlaybackControls.useMemo)(
      (): Dynamic => ({
        ...value13,
        setScrubbing: (input?: Dynamic): Dynamic => {
          ref4.current = input;
          value13.setScrubbing(input);
          !input &&
            (ref.current && settings.onSetBox({}, true),
            ref2.current && settings.onSetCss?.(ref2.current, false),
            ref3.current && settings.onSetTextStyle?.(ref3.current, false),
            (ref.current = false),
            (ref2.current = null),
            (ref3.current = null));
        },
      }),
      [value13, settings],
    ),
    value17: Dynamic = useVisibleInspectorProperties({
      selKey: value7,
      forceShown: value8,
      setForceShown: value9,
      onCommit: (input?: Dynamic, options?: Dynamic): Dynamic =>
        callback([
          {
            prop: input,
            value: options,
          },
        ]),
      onCommitMany: callback,
      onPickImageFile: (input?: Dynamic): Dynamic =>
        settings.onReplaceImage?.(input),
    }),
    {
      addItemsFor: value18,
      renderRow: value19,
      renderRows: value20,
    }: Dynamic = value17;
  return (
    <InspectorContext.Provider value={value16}>
      <div
        data-testid={"dc-canvas-object-settings"}
        data-object-kind={settings.kind}
        className={"contents"}
      >
        {value15.map((input?: Dynamic): Dynamic => {
          if (input.id === "sizing" || input.id === "size")
            return (() => {
              const _Component = InspectorLayoutSection;
              const _props = {
                sec: input,
                selKey: value7,
                isNested: false,
                readOnly: readOnly,
                renderRows: value20,
                renderRow: value19,
                addItemsFor: value18,
                onCommitMany: callback,
              } as const;
              const _key = input.id;
              return <_Component key={_key} {..._props} />;
            })();
          if (input.id === "appearance")
            return (() => {
              const _Component2 = InspectorAppearanceSection;
              const _props2 = {
                sec: input,
                selKey: value7,
                isNested: false,
                readOnly: readOnly,
                rows: value17,
                onCommitMany: callback,
                fillInline:
                  !!settings.css?.background ||
                  !!settings.css?.["background-color"],
              } as const;
              const _key2 = input.id;
              return <_Component2 key={_key2} {..._props2} />;
            })();
          let value21: Dynamic = (() => {
            const _Component3 = PropertySection;
            const _props3 = {
              title: input.title,
              iconColumn: input.id === "text",
              actions: (
                <PropertyActions
                  section={input.title}
                  data-testid={"dc-add-" + input.id}
                  items={value18(input.rows)}
                  disabled={readOnly}
                />
              ),
              children: [
                value20(input.rows),
                input.id === "media" && value3 && (
                  <VideoSeekControl
                    key={value7}
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
            const _key3 = input.id;
            return <_Component3 key={_key3} {..._props3} />;
          })();
          return input.id === "effects" && !readOnly ? (
            <CssEffectsSection
              key={"effects|" + value7}
              rows={input.rows}
              onCommitMany={callback}
              renderRows={value20}
              addItemsFor={value18}
              fallback={value21}
            />
          ) : (
            value21
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

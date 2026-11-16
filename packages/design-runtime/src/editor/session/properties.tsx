import { AccessibilityAnnouncementsLabel_22 } from "../accessibility/announcements";
import { CssEffectsSection } from "../properties/css-effects";
import { DcTplAttribute } from "../html/authoring";
import { InspectorAppearanceSection } from "../properties/appearance-section";
import { InspectorEditorEvery } from "../inspector/editor";
import { InspectorEditorFontFamilyFontWeightFontSizeSet } from "../inspector/editor";
import { InspectorEditorSubscribers_4 } from "../inspector/editor";
import { InspectorLayoutSection } from "../properties/layout-section";
import { InspectorStyleMetadataItems } from "../inspector/style-metadata";
import { LayoutSection } from "../properties/layout-section";
import { MediaObjectCropTest } from "../media/object-crop";
import { PropertyActions } from "../properties/primitives";
import { PropertySection } from "../properties/section";
import { PropertyTextSpacing } from "../typography/spacing";
import { SvgArrowPropertiesHeadStartHeadEndConfig } from "../svg/arrow-properties";
import { SvgArrowPropertiesNoneOpenFilledConfig } from "../svg/arrow-properties";
import { TextListValue } from "../inspector/editor";
import { TypographyStyleSelect } from "../typography/style-select";
import { TypographyVariantSelect } from "../typography/style-select";
import { VideoSeekControl } from "../media/playback-controls";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { addContrastToAnnouncement } from "../accessibility/announcements";
import { announce } from "../accessibility/announcer";
import { arrowSnapshotsForPropertyChange } from "../svg/arrow-editing";
import { changeSelectedArrowHeads } from "../svg/arrow-editing";
import { cn } from "../../cds/theme/class-names";
import { expandCssDeclarations } from "../css/shorthand";
import { findPreviewMediaElement } from "../media/playback-controls";
import { firstFontFamily } from "../typography/font-family";
import { formatPickerText } from "../picker/bridge";
import { getCssVariableNames } from "../css/values";
import { getTextListKind } from "../text/list-state";
import { inspectPickerSelection } from "../picker/bridge";
import { isProtectedAttribute } from "../attribute-validation";
import { jsxInspectorEditor } from "../inspector/editor";
import { knownWebFontFamily } from "../typography/font-catalog";
import { listKindToTag } from "../text/list-state";
import { normalizeContrastGround } from "../inspector/computed-data";
import { parseCssNumber } from "../css/values";
import { parseStyleDeclarations } from "../css/declarations";
import { propertyEditAnnouncement } from "../accessibility/announcements";
import { reactCanvasShape_2 } from "../../canvas/shape";
import { resolveTextListState } from "../text/list-state";
import { restoreArrowSnapshots } from "../svg/arrow-editing";
import { setPickerSelection } from "../picker/bridge";
import { startPickerTextEdit } from "../picker/bridge";
import { textContrastGround } from "../inspector/editor";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { validateAttributeEdit } from "../attribute-validation";

/** 选中元素变化时运行：确认元素仍在模型中，向画板读取计算样式、渲染状态、父级布局与文字对比度背景，写入属性面板的选中状态；过期的请求会被丢弃。 */
export async function loadSelectionInspectorState(deps: { readonly ensureModel: Dynamic; readonly value10: Dynamic; readonly value16: Dynamic; readonly value21: Dynamic; readonly value23: Dynamic; readonly value3: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value64: Dynamic; readonly value67: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value307?: Dynamic,
        extra: Dynamic = false): Promise<Dynamic> {
        let value308: Dynamic = ++deps.value50.current,
          value309: Dynamic = await deps.ensureModel(input);
        if (value308 !== deps.value50.current) return;
        let value310: Dynamic = value309
          ? options.filter(
              (input2?: Dynamic): Dynamic =>
                value309.model.element(input2) != null,
            )
          : [];
        if (!value309 || value310.length === 0) {
          deps.value49.current = null;
          deps.value3(null);
          deps.value23(null);
          return null;
        }
        let items2: Dynamic = [
            ...new Set(
              value310.flatMap(
                (input2?: Dynamic): Dynamic =>
                  (0, getCssVariableNames)(
                    value309.model.effectiveStyleAttr(input2),
                  ),
              ),
            ),
          ],
          value311: Dynamic = deps.value67(),
          value312: Dynamic = value310.length === 1,
          items3: Dynamic = [
            ...InspectorStyleMetadataItems,
            ...items2,
          ],
          value313: Dynamic = value311
            ? await (0, inspectPickerSelection)(
                value311,
                value310[0],
                input,
                items3,
                {
                  ground: value312,
                  afterPaint: extra,
                },
              )
            : null;
        if (
          value308 !== deps.value50.current ||
          (value311 &&
            extra &&
            value313 === null &&
            ((value313 = await (0, inspectPickerSelection)(
              value311,
              value310[0],
              input,
              items3,
              {
                ground: value312,
              },
            )),
            value308 !== deps.value50.current))
        )
          return;
        let value314: Dynamic =
          context ??
          value309.model.tagName(value310[value310.length - 1]) ??
          value313?.tag ??
          "div";
        deps.value10(value313?.computed ?? {});
        deps.value16(value313?.rendered ?? false);
        deps.value21(value313?.parent?.display);
        let value315: Dynamic = value312
          ? (0, normalizeContrastGround)(value313)
          : null;
        deps.value23(
          (input2?: Dynamic): Dynamic =>
            input2 !== null &&
            value315 !== null &&
            input2.behind === value315.behind &&
            input2.ink === value315.ink
              ? input2
              : value315,
        );
        value311 && deps.value64(value311);
        let state: Dynamic = {
          name: input,
          tids: value310,
          tag: value314,
          instances: value307 ?? value313?.instances ?? value310.length,
        };
        deps.value49.current = state;
        deps.value3(state);
        return (0, textContrastGround)(
          value315,
          value313?.computed ?? {},
        );
      }

/** 属性面板修改单个属性时运行：对所有选中元素写入该属性（清空 href 时拆掉链接、修改箭头头部、裁剪、文字、字体等有专门处理），记录撤销、推送实时模型并播报。 */
export function applySelectionPropertyEdit(deps: { readonly callback3: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value148: Dynamic; readonly value149: Dynamic; readonly value24: Dynamic; readonly value3: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic; readonly value8: Dynamic; readonly value9: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let current: Dynamic = deps.value49.current;
        if (!current || deps.readOnlyRef.current || current.name !== deps.rootName)
          return;
        let value307: Dynamic = deps.modelRef.current.state(current.name);
        if (!value307) return;
        let value308: Dynamic = current.tids.filter(
          (input2?: Dynamic): Dynamic =>
            value307.model.element(input2) != null,
        );
        if (value308.length === 0) return;
        let value309: Dynamic = input.toLowerCase();
        if (
          (options == null || options.trim() === "") &&
          (value309 === "@href" || value309.endsWith(":href")) &&
          value308.some(
            (input2?: Dynamic): Dynamic =>
              value307.model.tagName(input2) === "a",
          )
        ) {
          let redo: Dynamic = value307.redo,
            value318: Dynamic = deps.value101(
              current.name,
              `link-unwrap-${Date.now()}`,
              value307,
            ),
            items3: Dynamic = [],
            flag2: Dynamic = false;
          for (let value320 of value308 as Dynamic) {
            if (value307.model.tagName(value320) !== "a") continue;
            let value321: Dynamic = value307.model.unwrapElement(value320);
            value321 && (items3.push(...value321), (flag2 = true));
          }
          if (!flag2) {
            deps.value102(value307, value318, redo);
            return;
          }
          value307.model.restamp();
          deps.value66.current = current.name;
          deps.pushLiveModel(current.name, value307);
          deps.markModelDirty(current.name);
          deps.incrementSessionEpoch();
          let value319: Dynamic = items3
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
            )
            .filter((input2?: Dynamic): Dynamic => input2 >= 0);
          if (value319.length > 0) deps.value105(current.name, value319);
          else {
            let value320: Dynamic = deps.value67();
            value320 && (0, setPickerSelection)(value320, null, null);
            deps.value50.current++;
            deps.value3(null);
          }
          (0, announce)(AccessibilityAnnouncementsLabel_22);
          deps.value8(
            `${value307.path}: removed link on destination clear (kept content)`,
          );
          return;
        }
        let value310: Dynamic = value308.map(
          (input2?: Dynamic): Dynamic => value307.model.tagName(input2),
        );
        options != null &&
          options.trim() === "" &&
          (0, isProtectedAttribute)(input, value310) &&
          (options = null);
        if (options != null) {
          let value318: Dynamic = (0, validateAttributeEdit)(
            input,
            options,
            value310,
          );
          if (!value318.ok) {
            deps.showToast(value318.message);
            return;
          }
          options = value318.value;
        }
        if (input === "__headStart" || input === "__headEnd") {
          if (
            options !== "none" &&
            options !== "open" &&
            options !== "filled"
          )
            return;
          let redo: Dynamic = value307.redo,
            value318: Dynamic = deps.value101(current.name, input, value307),
            value319: Dynamic = current.tids.map(
              (input2?: Dynamic): Dynamic => value307.model.element(input2),
            ),
            value320: Dynamic = (0, changeSelectedArrowHeads)(
              value307.model,
              value308,
              input === "__headStart" ? "start" : "end",
              options,
              value308.length === 1
                ? {
                    stroke: deps.value9.stroke,
                    strokeWidth: deps.value9.strokeWidth,
                  }
                : {},
            );
          if (!value320) {
            deps.value102(value307, value318, redo);
            return;
          }
          let value321: Dynamic = value319
            .map(
              (input2?: Dynamic): Dynamic =>
                parseInt(
                  (
                    input2 &&
                    (value320.replaced.get(input2) ?? input2)
                  )?.getAttribute(DcTplAttribute) ?? "-1",
                  10,
                ),
            )
            .filter((input2?: Dynamic): Dynamic => input2 >= 0);
          deps.value66.current = current.name;
          deps.pushLiveModel(current.name, value307);
          deps.markModelDirty(current.name);
          deps.incrementSessionEpoch();
          deps.value106(value307, value321);
          deps.value105(current.name, value321);
          let value322: Dynamic = deps.value67();
          value322 &&
            setTimeout((): Dynamic => {
              let current3: Dynamic = deps.value49.current;
              current3?.name === current.name &&
                (0, InspectorEditorEvery)(current3.tids, value321) &&
                (0, setPickerSelection)(
                  value322,
                  value321,
                  current.name,
                );
            }, 60);
          let value323: Dynamic = `${SvgArrowPropertiesHeadStartHeadEndConfig[input]} arrowhead: ${SvgArrowPropertiesNoneOpenFilledConfig[options]}`;
          (0, announce)(value323);
          deps.value8(
            `${value307.path}: set ${SvgArrowPropertiesHeadStartHeadEndConfig[input]} arrowhead to ${SvgArrowPropertiesNoneOpenFilledConfig[options]} on ${value320.changed > 1 ? `${value320.changed} lines or arrows` : uiMessage("inspector.session.aLineOrArrow")}`,
            `${value307.path}:${input}:${value308.join(",")}`,
          );
          return;
        }
        deps.value101(current.name, input, value307);
        let value311: Dynamic = (0, arrowSnapshotsForPropertyChange)(
            value307.model,
            value308,
            [input],
          ),
          flag: Dynamic = false,
          value312: Dynamic =
            (input === "object-fit" && options !== "cover") ||
            input === "@src"
              ? value308.filter(
                  (input2?: Dynamic): Dynamic =>
                    (0, MediaObjectCropTest)(
                      (input3?: Dynamic): Dynamic =>
                        value307.model.inlineStyleValue(input2, input3),
                    ),
                )
              : [];
        for (let value318 of value308 as Dynamic)
          if (input === "__text")
            flag = value307.model.setText(value318, options ?? "") || flag;
          else if (input.startsWith("@")) {
            let value319: Dynamic = value307.model.setAttribute(
              value318,
              input.slice(1),
              options,
            );
            if (value319 && value312.includes(value318))
              for (let value320 of [
                "object-view-box",
                "object-position",
              ] as Dynamic)
                value307.model.setStyleProperty(value318, value320, null);
            flag = value319 || flag;
          } else if (
            ((flag =
              value307.model.setStyleProperty(value318, input, options) ||
              flag),
            value312.includes(value318))
          )
            for (let value319 of [
              "object-view-box",
              "object-position",
            ] as Dynamic)
              value307.model.setStyleProperty(value318, value319, null);
        if (!flag) return;
        let value313: Dynamic = (0, restoreArrowSnapshots)(
            value307.model,
            value311,
          ),
          value314: Dynamic =
            input === "font-family" && options
              ? (0, knownWebFontFamily)(
                  (0, firstFontFamily)(options),
                )
              : undefined,
          value315: Dynamic =
            value314 !== undefined &&
            value307.model.ensureWebfontLink(value314);
        value315 && value307.model.restamp();
        let value316: Dynamic =
            value307.model.tagName(value308[0]) ?? "element",
          value317: Dynamic =
            value308.length > 1
              ? `${value308.length}\xD7 ${value316}`
              : value316;
        deps.value149(
          current,
          value307,
          value315 || value313 || input === "__text" || input.startsWith("@")
            ? undefined
            : {
                [input]: options,
              },
        );
        let items2: Dynamic = [
            {
              prop: input,
              value: options,
            },
          ],
          current2: Dynamic = deps.value24.current,
          callback7: Dynamic = (input2?: Dynamic): Dynamic =>
            (0, announce)(
              (0, addContrastToAnnouncement)(
                (0, propertyEditAnnouncement)(items2),
                items2,
                ...deps.callback3(input2, current2),
              ),
            );
        value308.length === 1 &&
        InspectorEditorSubscribers_4.has(input)
          ? deps.value148(callback7)
          : callback7();
        deps.value8(
          `${value307.path}: set ${input}${options != null ? `=${options}` : " (unset)"} on ${value317}`,
          `${value307.path}:${input}:${value308.join(",")}`,
        );
      }

/** 属性面板一次提交多项属性时运行：校验后对所有选中元素批量写入属性与样式，必要时加载网页字体，记录撤销；非实时修改会播报属性变化与文字对比度。 */
export function applySelectionPropertyEdits(deps: { readonly callback3: Dynamic; readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value148: Dynamic; readonly value149: Dynamic; readonly value24: Dynamic; readonly value49: Dynamic; readonly value8: Dynamic }, items2?: Dynamic, options: Dynamic = {}): Dynamic {
        let current: Dynamic = deps.value49.current;
        if (
          !current ||
          deps.readOnlyRef.current ||
          current.name !== deps.rootName ||
          items2.length === 0
        )
          return;
        let value307: Dynamic = deps.modelRef.current.state(current.name);
        if (!value307) return;
        let value308: Dynamic = current.tids.filter(
          (input?: Dynamic): Dynamic => value307.model.element(input) != null,
        );
        if (value308.length === 0) return;
        let value309: Dynamic = value308.map(
            (input?: Dynamic): Dynamic => value307.model.tagName(input),
          ),
          items3: Dynamic = [];
        for (let value315 of items2 as Dynamic) {
          if (value315.value == null) {
            items3.push(value315);
            continue;
          }
          if (
            value315.value.trim() === "" &&
            (0, isProtectedAttribute)(value315.prop, value309)
          ) {
            items3.push({
              prop: value315.prop,
              value: null,
            });
            continue;
          }
          let value316: Dynamic = (0, validateAttributeEdit)(
            value315.prop,
            value315.value,
            value309,
          );
          if (!value316.ok) {
            deps.showToast(value316.message);
            return;
          }
          items3.push({
            prop: value315.prop,
            value: value316.value,
          });
        }
        items2 = items3;
        deps.value101(
          current.name,
          items2.map((input?: Dynamic): Dynamic => input.prop).join("+"),
          value307,
        );
        let value310: Dynamic = (0, arrowSnapshotsForPropertyChange)(
            value307.model,
            value308,
            items2.map((input?: Dynamic): Dynamic => input.prop),
          ),
          flag: Dynamic = false,
          state: Dynamic = {};
        for (let value315 of items2 as Dynamic) {
          let flag3: Dynamic = false;
          for (let value316 of value308 as Dynamic)
            if (value315.prop.startsWith("@"))
              flag =
                value307.model.setAttribute(
                  value316,
                  value315.prop.slice(1),
                  value315.value,
                ) || flag;
            else {
              let value317: Dynamic =
                value315.value == null
                  ? value307.model.inlineStyleAttr(value316)
                  : "";
              flag =
                value307.model.setStyleProperty(
                  value316,
                  value315.prop,
                  value315.value,
                ) || flag;
              value315.value == null &&
                value307.model.inlineStyleAttr(value316) !== value317 &&
                (flag3 = true);
            }
          (value315.value != null || flag3) &&
            (state[value315.prop] = value315.value);
        }
        if (!flag) return;
        let value311: Dynamic = (0, restoreArrowSnapshots)(
            value307.model,
            value310,
          ),
          flag2: Dynamic = false;
        if (!options.live)
          for (let value315 of items2 as Dynamic) {
            if (value315.prop !== "font-family" || !value315.value) continue;
            let value316: Dynamic = (0, knownWebFontFamily)(
              (0, firstFontFamily)(value315.value),
            );
            value316 !== undefined &&
              value307.model.ensureWebfontLink(value316) &&
              (value307.model.restamp(), (flag2 = true));
          }
        let value312: Dynamic =
            value307.model.tagName(value308[0]) ?? "element",
          value313: Dynamic = items2
            .map((input?: Dynamic): Dynamic => input.prop)
            .join("/"),
          value314: Dynamic =
            !flag2 &&
            !value311 &&
            items2.every(
              (input?: Dynamic): Dynamic => !input.prop.startsWith("@"),
            );
        deps.value149(current, value307, value314 ? state : undefined);
        if (!options.live) {
          let current2: Dynamic = deps.value24.current,
            callback7: Dynamic = (input?: Dynamic): Dynamic =>
              (0, announce)(
                (0, addContrastToAnnouncement)(
                  (0, propertyEditAnnouncement)(items2),
                  items2,
                  ...deps.callback3(input, current2),
                ),
              );
          value308.length === 1 &&
          items2.some(
            (input?: Dynamic): Dynamic =>
              InspectorEditorSubscribers_4.has(input.prop),
          )
            ? deps.value148(callback7)
            : callback7();
        }
        deps.value8(
          `${value307.path}: set ${value313} on ${value308.length > 1 ? `${value308.length}\xD7 ${value312}` : value312}`,
          `${value307.path}:${value313}:${value308.join(",")}`,
        );
      }

/** 渲染属性面板时对每个分区运行：按分区 id 渲染布局、外观、文字、媒体、效果或通用属性分区，并接上对应的提交回调与只读禁用说明。 */
export function renderInspectorSection(deps: { readonly embed: Dynamic; readonly installGen: Dynamic; readonly nonDcFile: Dynamic; readonly readOnly: Dynamic; readonly rootName: Dynamic; readonly selectionScopeKey: Dynamic; readonly value13: Dynamic; readonly value14: Dynamic; readonly value148: Dynamic; readonly value152: Dynamic; readonly value199: Dynamic; readonly value2: Dynamic; readonly value20: Dynamic; readonly value200: Dynamic; readonly value201: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value206: Dynamic; readonly value270: Dynamic; readonly value271: Dynamic; readonly value272: Dynamic; readonly value273: Dynamic; readonly value274: Dynamic; readonly value275: Dynamic; readonly value278: Dynamic; readonly value280: Dynamic; readonly value32: Dynamic; readonly value33: Dynamic; readonly value34: Dynamic; readonly value67: Dynamic; readonly value9: Dynamic; readonly webviewRef: Dynamic }, input?: Dynamic): Dynamic {
                    if (input.id === "sizing" || input.id === "size")
                      return (() => {
                        const _Component2 =
                          reactCanvasShape_2.default.Fragment;
                        const _props2 = {
                          children: [
                            input.id === deps.value280[0]?.id && (
                              <div
                                className={(0, cn)(
                                  "py-0.5",
                                  (deps.nonDcFile ||
                                    deps.value201 ||
                                    (!deps.embed && deps.value203)) &&
                                    "mt-1",
                                )}
                              >
                                <LayoutSection
                                  rows={
                                    deps.value204
                                      ? deps.value204.sections.flatMap(
                                          (input2?: Dynamic): Dynamic =>
                                            input2.rows,
                                        )
                                      : []
                                  }
                                  parentDisplay={deps.value20}
                                  display={deps.value9.display}
                                  multi={deps.value200.length > 1}
                                  standaloneTranslate={
                                    !!deps.value204?.advanced.some(
                                      (input2?: Dynamic): Dynamic =>
                                        input2.prop === "translate" &&
                                        (input2.mixed ||
                                          ((input2.value ?? "").trim() !==
                                            "" &&
                                            (input2.value ?? "")
                                              .trim()
                                              .toLowerCase() !== "none" &&
                                            !(input2.value ?? "")
                                              .trim()
                                              .split(/\s+/)
                                              .every(
                                                (input3?: Dynamic): Dynamic =>
                                                  (0, parseCssNumber)(
                                                    input3,
                                                  )?.value === 0,
                                              ))),
                                    )
                                  }
                                  disabledAll={deps.value201 || deps.readOnly}
                                  disabledWhy={
                                    deps.readOnly
                                      ? ViewOnlyYouCanInspectThisMessage
                                      : undefined
                                  }
                                  noMargins={
                                    deps.value275
                                      ? "Set Position to Absolute first \u2014 a mounted component ignores margins, so it aligns only by its offsets and never to a centre"
                                      : undefined
                                  }
                                  onCommitMany={(input2?: Dynamic): Dynamic =>
                                    deps.value152(input2)
                                  }
                                />
                              </div>
                            ),
                            input.id === deps.value280[0]?.id && deps.value278,
                            (() => {
                              const _Component =
                                InspectorLayoutSection;
                              const _props = {
                                sec: input,
                                selKey: deps.selectionScopeKey,
                                isNested: deps.value201,
                                readOnly: deps.readOnly,
                                renderRows: deps.value274,
                                renderRow: deps.value273,
                                addItemsFor: deps.value272,
                                onCommitMany: (input2?: Dynamic): Dynamic =>
                                  deps.value152(input2),
                              } as const;
                              const _key = input.id;
                              return <_Component key={_key} {..._props} />;
                            })(),
                          ],
                        } as const;
                        const _key2 = input.id;
                        return <_Component2 key={_key2} {..._props2} />;
                      })();
                    if (input.id === "appearance")
                      return (() => {
                        const _Component3 =
                          InspectorAppearanceSection;
                        const _props3 = {
                          sec: input,
                          selKey: deps.selectionScopeKey,
                          isNested: deps.value201,
                          readOnly: deps.readOnly,
                          rows: deps.value270,
                          onCommitMany: (input2?: Dynamic): Dynamic => {
                            deps.value152(input2);
                            deps.value148();
                          },
                          fillInline: deps.value199
                            ? deps.value199.model.anyHasInlineDecl(
                                deps.value200,
                                "background",
                              ) ||
                              deps.value199.model.anyHasInlineDecl(
                                deps.value200,
                                "background-color",
                              )
                            : true,
                          hasInline: deps.value199
                            ? (input2?: Dynamic): Dynamic =>
                                deps.value199.model.anyHasInlineDecl(
                                  deps.value200,
                                  input2,
                                )
                            : undefined,
                          uaBorder: deps.value199
                            ? deps.value200.some(
                                (input2?: Dynamic): Dynamic =>
                                  /^(button|input|select|textarea|hr|fieldset|iframe)$/.test(
                                    deps.value199.model.tagName(input2) ?? "",
                                  ),
                              )
                            : undefined,
                          classHasBorder: deps.value199
                            ? deps.value200.some(
                                (input2?: Dynamic): Dynamic =>
                                  (0, expandCssDeclarations)(
                                    (0, parseStyleDeclarations)(
                                      deps.value199.model.classOnlyStyleAttr(
                                        input2,
                                      ),
                                    ),
                                  ).some(
                                    (input3?: Dynamic): Dynamic =>
                                      (/^border(-(top|right|bottom|left))?-style$/.test(
                                        input3.prop,
                                      ) &&
                                        !/^(none|hidden)?$/i.test(
                                          input3.value.trim(),
                                        )) ||
                                      (/^border(-(top|right|bottom|left))?$/.test(
                                        input3.prop,
                                      ) &&
                                        !/^(none|hidden|0|0px)?$/i.test(
                                          input3.value.trim(),
                                        )),
                                  ),
                              )
                            : undefined,
                        } as const;
                        const _key3 = input.id;
                        return <_Component3 key={_key3} {..._props3} />;
                      })();
                    if (deps.value201 && !input.rows.some(deps.value271)) return null;
                    let value307: Dynamic =
                        input.id === "text" &&
                        deps.value206 !== null &&
                        deps.value206.matchedName !== null &&
                        deps.value13 !== deps.selectionScopeKey,
                      value308: Dynamic =
                        input.id === "text" && !deps.value275
                          ? ((): Dynamic => {
                              let value310: Dynamic = deps.value200[0],
                                value311: Dynamic = (0,
                                resolveTextListState)(
                                  deps.value199
                                    ? deps.value200.map(
                                        (input2?: Dynamic): Dynamic =>
                                          (0, getTextListKind)(
                                            deps.value199.model.element(input2),
                                          ),
                                      )
                                    : [],
                                  deps.value34,
                                  deps.value201 ? undefined : value310,
                                  value310 !== undefined &&
                                    !!deps.value199 &&
                                    deps.value199.model.isTextEditable(value310),
                                ),
                                value312: Dynamic = deps.value201
                                  ? null
                                  : value311.off,
                                value313: Dynamic = deps.value32.has(
                                  TextListValue,
                                ),
                                value314: Dynamic =
                                  value311.value !== "none" ||
                                  value311.mixed ||
                                  value313,
                                callback7: Dynamic = (
                                  input2?: Dynamic,
                                ): Dynamic => {
                                  let value317: Dynamic = (0,
                                    listKindToTag)(
                                      input2,
                                      value311.value,
                                    ),
                                    value318: Dynamic = deps.value67();
                                  value317 === null ||
                                    !value318 ||
                                    value311.off !== null ||
                                    deps.value201 ||
                                    deps.readOnly ||
                                    value310 === undefined ||
                                    (value311.live ||
                                      (0, startPickerTextEdit)(
                                        value318,
                                        value310,
                                        deps.rootName,
                                      ),
                                    (0, formatPickerText)(
                                      value318,
                                      value317,
                                      value310,
                                    ));
                                },
                                callback8: Dynamic = (): Dynamic =>
                                  deps.value33((input2?: Dynamic): Dynamic => {
                                    let values: Dynamic = new Set(input2);
                                    values.delete(TextListValue);
                                    return values;
                                  }),
                                value315: Dynamic = value314 ? (
                                  <TypographyVariantSelect
                                    key={`${deps.selectionScopeKey}|textlist`}
                                    value={value311.value}
                                    mixed={value311.mixed}
                                    disabled={deps.value201 || deps.readOnly}
                                    disabledReason={
                                      deps.readOnly ? (ViewOnlyYouCanInspectThisMessage) : (value312)
                                    }
                                    onChange={callback7}
                                    onReset={
                                      value311.value !== "none" &&
                                      value312 === null &&
                                      !deps.value201 &&
                                      !deps.readOnly
                                        ? (): Dynamic => callback7("none")
                                        : value313
                                          ? callback8
                                          : undefined
                                    }
                                  />
                                ) : null,
                                value316: Dynamic =
                                  value314 || value312 !== null
                                    ? null
                                    : {
                                        get label() { return uiMessage("inspector.session.list"); },
                                        onSelect: (): Dynamic => {
                                          deps.value33(
                                            (input2?: Dynamic): Dynamic =>
                                              new Set(input2).add(
                                                TextListValue,
                                              ),
                                          );
                                          setTimeout(
                                            (): Dynamic =>
                                              (document as Dynamic)
                                                .querySelector(
                                                  '[data-testid="dc-text-list"] [role="radio"][data-checked]',
                                                )
                                                ?.focus(),
                                            60,
                                          );
                                        },
                                      },
                                callback9: Dynamic = (
                                  items3?: Dynamic,
                                ): Dynamic => {
                                  let value317: Dynamic = items3.findIndex(
                                    (input2?: Dynamic): Dynamic =>
                                      input2.prop === "text-align",
                                  );
                                  return value317 < 0
                                    ? items3.length
                                    : value317;
                                },
                                callback10: Dynamic = (
                                  input2?: Dynamic,
                                ): Dynamic => (
                                  <jsxInspectorEditor.Fragment>
                                    {deps.value274(
                                      input2.slice(0, callback9(input2)),
                                    )}
                                    {value315}
                                    {deps.value274(
                                      input2.slice(callback9(input2)),
                                    )}
                                  </jsxInspectorEditor.Fragment>
                                ),
                                items2: Dynamic = [
                                  ...deps.value272(
                                    input.rows.slice(
                                      0,
                                      callback9(input.rows),
                                    ),
                                  ),
                                  ...(value316 ? [value316] : []),
                                  ...deps.value272(
                                    input.rows.slice(callback9(input.rows)),
                                  ),
                                ];
                              return {
                                withRow: callback10,
                                addItems: items2,
                              };
                            })()
                          : null,
                      value309: Dynamic = (() => {
                        const _Component4 = PropertySection;
                        const _props4 = {
                          title: input.title,
                          iconColumn: input.id === "text",
                          actions: deps.value201 ? undefined : (
                            <PropertyActions
                              section={input.title}
                              data-testid={`dc-add-${input.id}`}
                              items={
                                value308
                                  ? value308.addItems
                                  : deps.value272(input.rows)
                              }
                              disabled={deps.readOnly}
                            />
                          ),
                          children:
                            input.id === "text" ? (
                              ((): Dynamic => {
                                let value310: Dynamic = value307,
                                  value311: Dynamic =
                                    deps.value206 !== null && !deps.value275 ? (
                                      <TypographyStyleSelect
                                        key={`${deps.selectionScopeKey}|textstyle`}
                                        model={deps.value206}
                                        attached={value310}
                                        disabled={deps.value201 || deps.readOnly}
                                        onApply={(
                                          input2?: Dynamic,
                                        ): Dynamic => {
                                          deps.value14(null);
                                          deps.value152(
                                            input2.map(
                                              ([
                                                input3,
                                                input4,
                                              ]: Dynamic): Dynamic => ({
                                                prop: input3,
                                                value: input4 ?? null,
                                              }),
                                            ),
                                          );
                                          deps.value148();
                                        }}
                                        onDetach={(): Dynamic =>
                                          deps.value14(deps.selectionScopeKey)
                                        }
                                      />
                                    ) : null,
                                  value312: Dynamic = value310
                                    ? input.rows.filter(
                                        (input2?: Dynamic): Dynamic =>
                                          !InspectorEditorFontFamilyFontWeightFontSizeSet.has(
                                            input2.prop,
                                          ) ||
                                          !!input2.mixed ||
                                          !!input2.companionMixed,
                                      )
                                    : input.rows,
                                  value313: Dynamic = value312.find(
                                    (input2?: Dynamic): Dynamic =>
                                      input2.prop === "line-height",
                                  ),
                                  value314: Dynamic = value312.find(
                                    (input2?: Dynamic): Dynamic =>
                                      input2.prop === "letter-spacing",
                                  ),
                                  callback7: Dynamic = (
                                    input2?: Dynamic,
                                  ): Dynamic =>
                                    value308
                                      ? value308.withRow(input2)
                                      : deps.value274(input2);
                                if (!value313 || !value314)
                                  return (
                                    <jsxInspectorEditor.Fragment>
                                      {value311}
                                      {callback7(value312)}
                                    </jsxInspectorEditor.Fragment>
                                  );
                                let value315: Dynamic = value312.slice(
                                    0,
                                    value312.indexOf(value313),
                                  ),
                                  value316: Dynamic = value312.filter(
                                    (input2?: Dynamic): Dynamic =>
                                      input2 !== value313 &&
                                      input2 !== value314 &&
                                      !value315.includes(input2),
                                  );
                                return (
                                  <jsxInspectorEditor.Fragment>
                                    {value311}
                                    {deps.value274(value315)}
                                    <PropertyTextSpacing
                                      key={`${deps.selectionScopeKey}|textspacing`}
                                      lh={value313}
                                      ls={value314}
                                      renderRows={deps.value274}
                                      onCommitMany={deps.value152}
                                    />
                                    {callback7(value316)}
                                  </jsxInspectorEditor.Fragment>
                                );
                              })()
                            ) : (
                              <jsxInspectorEditor.Fragment>
                                {deps.value274(input.rows)}
                                {input.id === "media" &&
                                  input.title === "Video" &&
                                  !deps.value201 &&
                                  deps.value2?.tids.length === 1 && (<VideoSeekControl
                                      key={deps.selectionScopeKey + "|scrub"}
                                      gen={deps.installGen}
                                      find={(): Dynamic =>
                                        (0, findPreviewMediaElement)(
                                          deps.webviewRef.current?.contentDocument,
                                          DcTplAttribute,
                                          deps.value2.tids[0],
                                          deps.value2.name,
                                        )
                                      }
                                    />)}
                              </jsxInspectorEditor.Fragment>
                            ),
                        } as const;
                        const _key4 = input.id;
                        return <_Component4 key={_key4} {..._props4} />;
                      })();
                    return input.id === "effects" &&
                      !deps.value201 &&
                      !deps.value275 &&
                      !deps.readOnly
                      ? (() => {
                          const _Component5 = CssEffectsSection;
                          const _props5 = {
                            rows: input.rows,
                            shadowTarget: input.shadowTarget,
                            dropShadowReason: input.dropShadowReason,
                            onCommitMany: deps.value152,
                            renderRows: deps.value274,
                            addItemsFor: deps.value272,
                            fallback: value309,
                          } as const;
                          const _key5 = `effects|${deps.value2 ? `${deps.value2.name}:${deps.value2.tids.join(",")}` : "none"}`;
                          return <_Component5 key={_key5} {..._props5} />;
                        })()
                      : value309;
                  }

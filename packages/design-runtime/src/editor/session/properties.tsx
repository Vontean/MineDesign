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
export async function loadSelectionInspectorState(deps: { readonly ensureModel: Dynamic; readonly value10: Dynamic; readonly value16: Dynamic; readonly value21: Dynamic; readonly value23: Dynamic; readonly value3: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value64: Dynamic; readonly value67: Dynamic }, templateName?: Dynamic,
        tids?: Dynamic,
        tagOverride?: Dynamic,
        instanceCountOverride?: Dynamic,
        afterPaint: Dynamic = false): Promise<Dynamic> {
        let requestEpoch: Dynamic = ++deps.value50.current,
          docState: Dynamic = await deps.ensureModel(templateName);
        if (requestEpoch !== deps.value50.current) return;
        let validTids: Dynamic = docState
          ? tids.filter(
              (tid?: Dynamic): Dynamic =>
                docState.model.element(tid) != null,
            )
          : [];
        if (!docState || validTids.length === 0) {
          deps.value49.current = null;
          deps.value3(null);
          deps.value23(null);
          return null;
        }
        let cssVariableNames: Dynamic = [
            ...new Set(
              validTids.flatMap(
                (tid?: Dynamic): Dynamic =>
                  getCssVariableNames(
                    docState.model.effectiveStyleAttr(tid),
                  ),
              ),
            ),
          ],
          previewFrame: Dynamic = deps.value67(),
          isSingleSelection: Dynamic = validTids.length === 1,
          styleNames: Dynamic = [
            ...InspectorStyleMetadataItems,
            ...cssVariableNames,
          ],
          inspection: Dynamic = previewFrame
            ? await inspectPickerSelection(
                previewFrame,
                validTids[0],
                templateName,
                styleNames,
                {
                  ground: isSingleSelection,
                  afterPaint: afterPaint,
                },
              )
            : null;
        if (
          requestEpoch !== deps.value50.current ||
          (previewFrame &&
            afterPaint &&
            inspection === null &&
            ((inspection = await inspectPickerSelection(
              previewFrame,
              validTids[0],
              templateName,
              styleNames,
              {
                ground: isSingleSelection,
              },
            )),
            requestEpoch !== deps.value50.current))
        )
          return;
        let tag: Dynamic =
          tagOverride ??
          docState.model.tagName(validTids[validTids.length - 1]) ??
          inspection?.tag ??
          "div";
        deps.value10(inspection?.computed ?? {});
        deps.value16(inspection?.rendered ?? false);
        deps.value21(inspection?.parent?.display);
        let contrastGround: Dynamic = isSingleSelection
          ? normalizeContrastGround(inspection)
          : null;
        deps.value23(
          (previousGround?: Dynamic): Dynamic =>
            previousGround !== null &&
            contrastGround !== null &&
            previousGround.behind === contrastGround.behind &&
            previousGround.ink === contrastGround.ink
              ? previousGround
              : contrastGround,
        );
        previewFrame && deps.value64(previewFrame);
        let selection: Dynamic = {
          name: templateName,
          tids: validTids,
          tag: tag,
          instances: instanceCountOverride ?? inspection?.instances ?? validTids.length,
        };
        deps.value49.current = selection;
        deps.value3(selection);
        return textContrastGround(
          contrastGround,
          inspection?.computed ?? {},
        );
      }

/** 属性面板修改单个属性时运行：对所有选中元素写入该属性（清空 href 时拆掉链接、修改箭头头部、裁剪、文字、字体等有专门处理），记录撤销、推送实时模型并播报。 */
export function applySelectionPropertyEdit(deps: { readonly callback3: Dynamic; readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value148: Dynamic; readonly value149: Dynamic; readonly value24: Dynamic; readonly value3: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic; readonly value8: Dynamic; readonly value9: Dynamic }, prop?: Dynamic, propValue?: Dynamic): Dynamic {
        let current: Dynamic = deps.value49.current;
        if (!current || deps.readOnlyRef.current || current.name !== deps.rootName)
          return;
        let docState: Dynamic = deps.modelRef.current.state(current.name);
        if (!docState) return;
        let selectedTids: Dynamic = current.tids.filter(
          (tid?: Dynamic): Dynamic =>
            docState.model.element(tid) != null,
        );
        if (selectedTids.length === 0) return;
        let lowerProp: Dynamic = prop.toLowerCase();
        if (
          (propValue == null || propValue.trim() === "") &&
          (lowerProp === "@href" || lowerProp.endsWith(":href")) &&
          selectedTids.some(
            (tid?: Dynamic): Dynamic =>
              docState.model.tagName(tid) === "a",
          )
        ) {
          let redo: Dynamic = docState.redo,
            undoEntry: Dynamic = deps.value101(
              current.name,
              `link-unwrap-${Date.now()}`,
              docState,
            ),
            unwrappedElements: Dynamic = [],
            didUnwrap: Dynamic = false;
          for (let tid of selectedTids as Dynamic) {
            if (docState.model.tagName(tid) !== "a") continue;
            let unwrapped: Dynamic = docState.model.unwrapElement(tid);
            unwrapped && (unwrappedElements.push(...unwrapped), (didUnwrap = true));
          }
          if (!didUnwrap) {
            deps.value102(docState, undoEntry, redo);
            return;
          }
          docState.model.restamp();
          deps.value66.current = current.name;
          deps.pushLiveModel(current.name, docState);
          deps.markModelDirty(current.name);
          deps.incrementSessionEpoch();
          let unwrappedTids: Dynamic = unwrappedElements
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
            )
            .filter((tidNumber?: Dynamic): Dynamic => tidNumber >= 0);
          if (unwrappedTids.length > 0) deps.value105(current.name, unwrappedTids);
          else {
            let previewFrame: Dynamic = deps.value67();
            previewFrame && setPickerSelection(previewFrame, null, null);
            deps.value50.current++;
            deps.value3(null);
          }
          announce(AccessibilityAnnouncementsLabel_22);
          deps.value8(
            `${docState.path}: removed link on destination clear (kept content)`,
          );
          return;
        }
        let tagNames: Dynamic = selectedTids.map(
          (tid?: Dynamic): Dynamic => docState.model.tagName(tid),
        );
        propValue != null &&
          propValue.trim() === "" &&
          isProtectedAttribute(prop, tagNames) &&
          (propValue = null);
        if (propValue != null) {
          let validation: Dynamic = validateAttributeEdit(
            prop,
            propValue,
            tagNames,
          );
          if (!validation.ok) {
            deps.showToast(validation.message);
            return;
          }
          propValue = validation.value;
        }
        if (prop === "__headStart" || prop === "__headEnd") {
          if (
            propValue !== "none" &&
            propValue !== "open" &&
            propValue !== "filled"
          )
            return;
          let redo: Dynamic = docState.redo,
            headUndoEntry: Dynamic = deps.value101(current.name, prop, docState),
            previousElements: Dynamic = current.tids.map(
              (tid?: Dynamic): Dynamic => docState.model.element(tid),
            ),
            headChange: Dynamic = changeSelectedArrowHeads(
              docState.model,
              selectedTids,
              prop === "__headStart" ? "start" : "end",
              propValue,
              selectedTids.length === 1
                ? {
                    stroke: deps.value9.stroke,
                    strokeWidth: deps.value9.strokeWidth,
                  }
                : {},
            );
          if (!headChange) {
            deps.value102(docState, headUndoEntry, redo);
            return;
          }
          let newTids: Dynamic = previousElements
            .map(
              (element?: Dynamic): Dynamic =>
                parseInt(
                  (
                    element &&
                    (headChange.replaced.get(element) ?? element)
                  )?.getAttribute(DcTplAttribute) ?? "-1",
                  10,
                ),
            )
            .filter((tidNumber?: Dynamic): Dynamic => tidNumber >= 0);
          deps.value66.current = current.name;
          deps.pushLiveModel(current.name, docState);
          deps.markModelDirty(current.name);
          deps.incrementSessionEpoch();
          deps.value106(docState, newTids);
          deps.value105(current.name, newTids);
          let headPreviewFrame: Dynamic = deps.value67();
          headPreviewFrame &&
            setTimeout((): Dynamic => {
              let currentSelection: Dynamic = deps.value49.current;
              currentSelection?.name === current.name &&
                InspectorEditorEvery(currentSelection.tids, newTids) &&
                setPickerSelection(
                  headPreviewFrame,
                  newTids,
                  current.name,
                );
            }, 60);
          let headAnnouncement: Dynamic = `${SvgArrowPropertiesHeadStartHeadEndConfig[prop]} arrowhead: ${SvgArrowPropertiesNoneOpenFilledConfig[propValue]}`;
          announce(headAnnouncement);
          deps.value8(
            `${docState.path}: set ${SvgArrowPropertiesHeadStartHeadEndConfig[prop]} arrowhead to ${SvgArrowPropertiesNoneOpenFilledConfig[propValue]} on ${headChange.changed > 1 ? `${headChange.changed} lines or arrows` : uiMessage("inspector.session.aLineOrArrow")}`,
            `${docState.path}:${prop}:${selectedTids.join(",")}`,
          );
          return;
        }
        deps.value101(current.name, prop, docState);
        let arrowSnapshots: Dynamic = arrowSnapshotsForPropertyChange(
            docState.model,
            selectedTids,
            [prop],
          ),
          flag: Dynamic = false,
          cropResetTids: Dynamic =
            (prop === "object-fit" && propValue !== "cover") ||
            prop === "@src"
              ? selectedTids.filter(
                  (tid?: Dynamic): Dynamic =>
                    MediaObjectCropTest(
                      (styleProp?: Dynamic): Dynamic =>
                        docState.model.inlineStyleValue(tid, styleProp),
                    ),
                )
              : [];
        for (let tid of selectedTids as Dynamic)
          if (prop === "__text")
            flag = docState.model.setText(tid, propValue ?? "") || flag;
          else if (prop.startsWith("@")) {
            let didSetAttribute: Dynamic = docState.model.setAttribute(
              tid,
              prop.slice(1),
              propValue,
            );
            if (didSetAttribute && cropResetTids.includes(tid))
              for (let cropProp of [
                "object-view-box",
                "object-position",
              ] as Dynamic)
                docState.model.setStyleProperty(tid, cropProp, null);
            flag = didSetAttribute || flag;
          } else if (
            ((flag =
              docState.model.setStyleProperty(tid, prop, propValue) ||
              flag),
            cropResetTids.includes(tid))
          )
            for (let cropProp of [
              "object-view-box",
              "object-position",
            ] as Dynamic)
              docState.model.setStyleProperty(tid, cropProp, null);
        if (!flag) return;
        let restoredArrows: Dynamic = restoreArrowSnapshots(
            docState.model,
            arrowSnapshots,
          ),
          webFontFamily: Dynamic =
            prop === "font-family" && propValue
              ? knownWebFontFamily(
                  firstFontFamily(propValue),
                )
              : undefined,
          addedWebfontLink: Dynamic =
            webFontFamily !== undefined &&
            docState.model.ensureWebfontLink(webFontFamily);
        addedWebfontLink && docState.model.restamp();
        let tagName: Dynamic =
            docState.model.tagName(selectedTids[0]) ?? "element",
          targetLabel: Dynamic =
            selectedTids.length > 1
              ? `${selectedTids.length}\xD7 ${tagName}`
              : tagName;
        deps.value149(
          current,
          docState,
          addedWebfontLink || restoredArrows || prop === "__text" || prop.startsWith("@")
            ? undefined
            : {
                [prop]: propValue,
              },
        );
        let edits: Dynamic = [
            {
              prop: prop,
              value: propValue,
            },
          ],
          previousGround: Dynamic = deps.value24.current,
          announceEdit: Dynamic = (inspection?: Dynamic): Dynamic =>
            announce(
              addContrastToAnnouncement(
                propertyEditAnnouncement(edits),
                edits,
                ...deps.callback3(inspection, previousGround),
              ),
            );
        selectedTids.length === 1 &&
        InspectorEditorSubscribers_4.has(prop)
          ? deps.value148(announceEdit)
          : announceEdit();
        deps.value8(
          `${docState.path}: set ${prop}${propValue != null ? `=${propValue}` : " (unset)"} on ${targetLabel}`,
          `${docState.path}:${prop}:${selectedTids.join(",")}`,
        );
      }

/** 属性面板一次提交多项属性时运行：校验后对所有选中元素批量写入属性与样式，必要时加载网页字体，记录撤销；非实时修改会播报属性变化与文字对比度。 */
export function applySelectionPropertyEdits(deps: { readonly callback3: Dynamic; readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value148: Dynamic; readonly value149: Dynamic; readonly value24: Dynamic; readonly value49: Dynamic; readonly value8: Dynamic }, edits?: Dynamic, editOptions: Dynamic = {}): Dynamic {
        let current: Dynamic = deps.value49.current;
        if (
          !current ||
          deps.readOnlyRef.current ||
          current.name !== deps.rootName ||
          edits.length === 0
        )
          return;
        let docState: Dynamic = deps.modelRef.current.state(current.name);
        if (!docState) return;
        let selectedTids: Dynamic = current.tids.filter(
          (tid?: Dynamic): Dynamic => docState.model.element(tid) != null,
        );
        if (selectedTids.length === 0) return;
        let tagNames: Dynamic = selectedTids.map(
            (tid?: Dynamic): Dynamic => docState.model.tagName(tid),
          ),
          validatedEdits: Dynamic = [];
        for (let edit of edits as Dynamic) {
          if (edit.value == null) {
            validatedEdits.push(edit);
            continue;
          }
          if (
            edit.value.trim() === "" &&
            isProtectedAttribute(edit.prop, tagNames)
          ) {
            validatedEdits.push({
              prop: edit.prop,
              value: null,
            });
            continue;
          }
          let validation: Dynamic = validateAttributeEdit(
            edit.prop,
            edit.value,
            tagNames,
          );
          if (!validation.ok) {
            deps.showToast(validation.message);
            return;
          }
          validatedEdits.push({
            prop: edit.prop,
            value: validation.value,
          });
        }
        edits = validatedEdits;
        deps.value101(
          current.name,
          edits.map((edit?: Dynamic): Dynamic => edit.prop).join("+"),
          docState,
        );
        let arrowSnapshots: Dynamic = arrowSnapshotsForPropertyChange(
            docState.model,
            selectedTids,
            edits.map((edit?: Dynamic): Dynamic => edit.prop),
          ),
          flag: Dynamic = false,
          appliedStyles: Dynamic = {};
        for (let edit of edits as Dynamic) {
          let didRemoveStyle: Dynamic = false;
          for (let tid of selectedTids as Dynamic)
            if (edit.prop.startsWith("@"))
              flag =
                docState.model.setAttribute(
                  tid,
                  edit.prop.slice(1),
                  edit.value,
                ) || flag;
            else {
              let styleBefore: Dynamic =
                edit.value == null
                  ? docState.model.inlineStyleAttr(tid)
                  : "";
              flag =
                docState.model.setStyleProperty(
                  tid,
                  edit.prop,
                  edit.value,
                ) || flag;
              edit.value == null &&
                docState.model.inlineStyleAttr(tid) !== styleBefore &&
                (didRemoveStyle = true);
            }
          (edit.value != null || didRemoveStyle) &&
            (appliedStyles[edit.prop] = edit.value);
        }
        if (!flag) return;
        let restoredArrows: Dynamic = restoreArrowSnapshots(
            docState.model,
            arrowSnapshots,
          ),
          didAddWebfontLink: Dynamic = false;
        if (!editOptions.live)
          for (let edit of edits as Dynamic) {
            if (edit.prop !== "font-family" || !edit.value) continue;
            let webFontFamily: Dynamic = knownWebFontFamily(
              firstFontFamily(edit.value),
            );
            webFontFamily !== undefined &&
              docState.model.ensureWebfontLink(webFontFamily) &&
              (docState.model.restamp(), (didAddWebfontLink = true));
          }
        let tagName: Dynamic =
            docState.model.tagName(selectedTids[0]) ?? "element",
          editLabel: Dynamic = edits
            .map((edit?: Dynamic): Dynamic => edit.prop)
            .join("/"),
          canPatchInPlace: Dynamic =
            !didAddWebfontLink &&
            !restoredArrows &&
            edits.every(
              (edit?: Dynamic): Dynamic => !edit.prop.startsWith("@"),
            );
        deps.value149(current, docState, canPatchInPlace ? appliedStyles : undefined);
        if (!editOptions.live) {
          let previousGround: Dynamic = deps.value24.current,
            announceEdit: Dynamic = (inspection?: Dynamic): Dynamic =>
              announce(
                addContrastToAnnouncement(
                  propertyEditAnnouncement(edits),
                  edits,
                  ...deps.callback3(inspection, previousGround),
                ),
              );
          selectedTids.length === 1 &&
          edits.some(
            (edit?: Dynamic): Dynamic =>
              InspectorEditorSubscribers_4.has(edit.prop),
          )
            ? deps.value148(announceEdit)
            : announceEdit();
        }
        deps.value8(
          `${docState.path}: set ${editLabel} on ${selectedTids.length > 1 ? `${selectedTids.length}\xD7 ${tagName}` : tagName}`,
          `${docState.path}:${editLabel}:${selectedTids.join(",")}`,
        );
      }

/** 渲染属性面板时对每个分区运行：按分区 id 渲染布局、外观、文字、媒体、效果或通用属性分区，并接上对应的提交回调与只读禁用说明。 */
export function renderInspectorSection(deps: { readonly embed: Dynamic; readonly installGen: Dynamic; readonly nonDcFile: Dynamic; readonly readOnly: Dynamic; readonly rootName: Dynamic; readonly selectionScopeKey: Dynamic; readonly value13: Dynamic; readonly value14: Dynamic; readonly value148: Dynamic; readonly value152: Dynamic; readonly value199: Dynamic; readonly value2: Dynamic; readonly value20: Dynamic; readonly value200: Dynamic; readonly value201: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value206: Dynamic; readonly value270: Dynamic; readonly value271: Dynamic; readonly value272: Dynamic; readonly value273: Dynamic; readonly value274: Dynamic; readonly value275: Dynamic; readonly value278: Dynamic; readonly value280: Dynamic; readonly value32: Dynamic; readonly value33: Dynamic; readonly value34: Dynamic; readonly value67: Dynamic; readonly value9: Dynamic; readonly webviewRef: Dynamic }, section?: Dynamic): Dynamic {
                    if (section.id === "sizing" || section.id === "size")
                      return (() => {
                        const SizingFragment =
                          reactCanvasShape_2.default.Fragment;
                        const sizingProps = {
                          children: [
                            section.id === deps.value280[0]?.id && (
                              <div
                                className={cn(
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
                                          (subsection?: Dynamic): Dynamic =>
                                            subsection.rows,
                                        )
                                      : []
                                  }
                                  parentDisplay={deps.value20}
                                  display={deps.value9.display}
                                  multi={deps.value200.length > 1}
                                  standaloneTranslate={
                                    !!deps.value204?.advanced.some(
                                      (row?: Dynamic): Dynamic =>
                                        row.prop === "translate" &&
                                        (row.mixed ||
                                          ((row.value ?? "").trim() !==
                                            "" &&
                                            (row.value ?? "")
                                              .trim()
                                              .toLowerCase() !== "none" &&
                                            !(row.value ?? "")
                                              .trim()
                                              .split(/\s+/)
                                              .every(
                                                (token?: Dynamic): Dynamic =>
                                                  parseCssNumber(
                                                    token,
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
                                  onCommitMany={(edits?: Dynamic): Dynamic =>
                                    deps.value152(edits)
                                  }
                                />
                              </div>
                            ),
                            section.id === deps.value280[0]?.id && deps.value278,
                            (() => {
                              const LayoutSectionView =
                                InspectorLayoutSection;
                              const layoutProps = {
                                sec: section,
                                selKey: deps.selectionScopeKey,
                                isNested: deps.value201,
                                readOnly: deps.readOnly,
                                renderRows: deps.value274,
                                renderRow: deps.value273,
                                addItemsFor: deps.value272,
                                onCommitMany: (edits?: Dynamic): Dynamic =>
                                  deps.value152(edits),
                              } as const;
                              const layoutKey = section.id;
                              return <LayoutSectionView key={layoutKey} {...layoutProps} />;
                            })(),
                          ],
                        } as const;
                        const sizingKey = section.id;
                        return <SizingFragment key={sizingKey} {...sizingProps} />;
                      })();
                    if (section.id === "appearance")
                      return (() => {
                        const AppearanceSectionView =
                          InspectorAppearanceSection;
                        const appearanceProps = {
                          sec: section,
                          selKey: deps.selectionScopeKey,
                          isNested: deps.value201,
                          readOnly: deps.readOnly,
                          rows: deps.value270,
                          onCommitMany: (edits?: Dynamic): Dynamic => {
                            deps.value152(edits);
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
                            ? (prop?: Dynamic): Dynamic =>
                                deps.value199.model.anyHasInlineDecl(
                                  deps.value200,
                                  prop,
                                )
                            : undefined,
                          uaBorder: deps.value199
                            ? deps.value200.some(
                                (tid?: Dynamic): Dynamic =>
                                  /^(button|input|select|textarea|hr|fieldset|iframe)$/.test(
                                    deps.value199.model.tagName(tid) ?? "",
                                  ),
                              )
                            : undefined,
                          classHasBorder: deps.value199
                            ? deps.value200.some(
                                (tid?: Dynamic): Dynamic =>
                                  expandCssDeclarations(
                                    parseStyleDeclarations(
                                      deps.value199.model.classOnlyStyleAttr(
                                        tid,
                                      ),
                                    ),
                                  ).some(
                                    (declaration?: Dynamic): Dynamic =>
                                      (/^border(-(top|right|bottom|left))?-style$/.test(
                                        declaration.prop,
                                      ) &&
                                        !/^(none|hidden)?$/i.test(
                                          declaration.value.trim(),
                                        )) ||
                                      (/^border(-(top|right|bottom|left))?$/.test(
                                        declaration.prop,
                                      ) &&
                                        !/^(none|hidden|0|0px)?$/i.test(
                                          declaration.value.trim(),
                                        )),
                                  ),
                              )
                            : undefined,
                        } as const;
                        const appearanceKey = section.id;
                        return <AppearanceSectionView key={appearanceKey} {...appearanceProps} />;
                      })();
                    if (deps.value201 && !section.rows.some(deps.value271)) return null;
                    let attachedStyle: Dynamic =
                        section.id === "text" &&
                        deps.value206 !== null &&
                        deps.value206.matchedName !== null &&
                        deps.value13 !== deps.selectionScopeKey,
                      textListConfig: Dynamic =
                        section.id === "text" && !deps.value275
                          ? ((): Dynamic => {
                              let firstTid: Dynamic = deps.value200[0],
                                listState: Dynamic = resolveTextListState(
                                  deps.value199
                                    ? deps.value200.map(
                                        (tid?: Dynamic): Dynamic =>
                                          getTextListKind(
                                            deps.value199.model.element(tid),
                                          ),
                                      )
                                    : [],
                                  deps.value34,
                                  deps.value201 ? undefined : firstTid,
                                  firstTid !== undefined &&
                                    !!deps.value199 &&
                                    deps.value199.model.isTextEditable(firstTid),
                                ),
                                listOffReason: Dynamic = deps.value201
                                  ? null
                                  : listState.off,
                                isListPanelOpen: Dynamic = deps.value32.has(
                                  TextListValue,
                                ),
                                showListSelect: Dynamic =
                                  listState.value !== "none" ||
                                  listState.mixed ||
                                  isListPanelOpen,
                                changeListKind: Dynamic = (
                                  listKind?: Dynamic,
                                ): Dynamic => {
                                  let tag: Dynamic = listKindToTag(
                                      listKind,
                                      listState.value,
                                    ),
                                    previewFrame: Dynamic = deps.value67();
                                  tag === null ||
                                    !previewFrame ||
                                    listState.off !== null ||
                                    deps.value201 ||
                                    deps.readOnly ||
                                    firstTid === undefined ||
                                    (listState.live ||
                                      startPickerTextEdit(
                                        previewFrame,
                                        firstTid,
                                        deps.rootName,
                                      ),
                                    formatPickerText(
                                      previewFrame,
                                      tag,
                                      firstTid,
                                    ));
                                },
                                closeListPanel: Dynamic = (): Dynamic =>
                                  deps.value33((openPanels?: Dynamic): Dynamic => {
                                    let values: Dynamic = new Set(openPanels);
                                    values.delete(TextListValue);
                                    return values;
                                  }),
                                listSelect: Dynamic = showListSelect ? (
                                  <TypographyVariantSelect
                                    key={`${deps.selectionScopeKey}|textlist`}
                                    value={listState.value}
                                    mixed={listState.mixed}
                                    disabled={deps.value201 || deps.readOnly}
                                    disabledReason={
                                      deps.readOnly ? (ViewOnlyYouCanInspectThisMessage) : (listOffReason)
                                    }
                                    onChange={changeListKind}
                                    onReset={
                                      listState.value !== "none" &&
                                      listOffReason === null &&
                                      !deps.value201 &&
                                      !deps.readOnly
                                        ? (): Dynamic => changeListKind("none")
                                        : isListPanelOpen
                                          ? closeListPanel
                                          : undefined
                                    }
                                  />
                                ) : null,
                                addListItem: Dynamic =
                                  showListSelect || listOffReason !== null
                                    ? null
                                    : {
                                        get label() { return uiMessage("inspector.session.list"); },
                                        onSelect: (): Dynamic => {
                                          deps.value33(
                                            (openPanels?: Dynamic): Dynamic =>
                                              new Set(openPanels).add(
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
                                textAlignIndex: Dynamic = (
                                  rows?: Dynamic,
                                ): Dynamic => {
                                  let alignIndex: Dynamic = rows.findIndex(
                                    (row?: Dynamic): Dynamic =>
                                      row.prop === "text-align",
                                  );
                                  return alignIndex < 0
                                    ? rows.length
                                    : alignIndex;
                                },
                                renderRowsWithList: Dynamic = (
                                  rows?: Dynamic,
                                ): Dynamic => (
                                  <jsxInspectorEditor.Fragment>
                                    {deps.value274(
                                      rows.slice(0, textAlignIndex(rows)),
                                    )}
                                    {listSelect}
                                    {deps.value274(
                                      rows.slice(textAlignIndex(rows)),
                                    )}
                                  </jsxInspectorEditor.Fragment>
                                ),
                                addItems: Dynamic = [
                                  ...deps.value272(
                                    section.rows.slice(
                                      0,
                                      textAlignIndex(section.rows),
                                    ),
                                  ),
                                  ...(addListItem ? [addListItem] : []),
                                  ...deps.value272(
                                    section.rows.slice(textAlignIndex(section.rows)),
                                  ),
                                ];
                              return {
                                withRow: renderRowsWithList,
                                addItems: addItems,
                              };
                            })()
                          : null,
                      sectionElement: Dynamic = (() => {
                        const SectionView = PropertySection;
                        const sectionProps = {
                          title: section.title,
                          iconColumn: section.id === "text",
                          actions: deps.value201 ? undefined : (
                            <PropertyActions
                              section={section.title}
                              data-testid={`dc-add-${section.id}`}
                              items={
                                textListConfig
                                  ? textListConfig.addItems
                                  : deps.value272(section.rows)
                              }
                              disabled={deps.readOnly}
                            />
                          ),
                          children:
                            section.id === "text" ? (
                              ((): Dynamic => {
                                let attachedToStyle: Dynamic = attachedStyle,
                                  styleSelect: Dynamic =
                                    deps.value206 !== null && !deps.value275 ? (
                                      <TypographyStyleSelect
                                        key={`${deps.selectionScopeKey}|textstyle`}
                                        model={deps.value206}
                                        attached={attachedToStyle}
                                        disabled={deps.value201 || deps.readOnly}
                                        onApply={(
                                          edits?: Dynamic,
                                        ): Dynamic => {
                                          deps.value14(null);
                                          deps.value152(
                                            edits.map(
                                              ([
                                                prop,
                                                propValue,
                                              ]: Dynamic): Dynamic => ({
                                                prop: prop,
                                                value: propValue ?? null,
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
                                  visibleRows: Dynamic = attachedToStyle
                                    ? section.rows.filter(
                                        (row?: Dynamic): Dynamic =>
                                          !InspectorEditorFontFamilyFontWeightFontSizeSet.has(
                                            row.prop,
                                          ) ||
                                          !!row.mixed ||
                                          !!row.companionMixed,
                                      )
                                    : section.rows,
                                  lineHeightRow: Dynamic = visibleRows.find(
                                    (row?: Dynamic): Dynamic =>
                                      row.prop === "line-height",
                                  ),
                                  letterSpacingRow: Dynamic = visibleRows.find(
                                    (row?: Dynamic): Dynamic =>
                                      row.prop === "letter-spacing",
                                  ),
                                  renderTextRows: Dynamic = (
                                    rows?: Dynamic,
                                  ): Dynamic =>
                                    textListConfig
                                      ? textListConfig.withRow(rows)
                                      : deps.value274(rows);
                                if (!lineHeightRow || !letterSpacingRow)
                                  return (
                                    <jsxInspectorEditor.Fragment>
                                      {styleSelect}
                                      {renderTextRows(visibleRows)}
                                    </jsxInspectorEditor.Fragment>
                                  );
                                let rowsBeforeSpacing: Dynamic = visibleRows.slice(
                                    0,
                                    visibleRows.indexOf(lineHeightRow),
                                  ),
                                  rowsAfterSpacing: Dynamic = visibleRows.filter(
                                    (row?: Dynamic): Dynamic =>
                                      row !== lineHeightRow &&
                                      row !== letterSpacingRow &&
                                      !rowsBeforeSpacing.includes(row),
                                  );
                                return (
                                  <jsxInspectorEditor.Fragment>
                                    {styleSelect}
                                    {deps.value274(rowsBeforeSpacing)}
                                    <PropertyTextSpacing
                                      key={`${deps.selectionScopeKey}|textspacing`}
                                      lh={lineHeightRow}
                                      ls={letterSpacingRow}
                                      renderRows={deps.value274}
                                      onCommitMany={deps.value152}
                                    />
                                    {renderTextRows(rowsAfterSpacing)}
                                  </jsxInspectorEditor.Fragment>
                                );
                              })()
                            ) : (
                              <jsxInspectorEditor.Fragment>
                                {deps.value274(section.rows)}
                                {section.id === "media" &&
                                  section.title === "Video" &&
                                  !deps.value201 &&
                                  deps.value2?.tids.length === 1 && (<VideoSeekControl
                                      key={deps.selectionScopeKey + "|scrub"}
                                      gen={deps.installGen}
                                      find={(): Dynamic =>
                                        findPreviewMediaElement(
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
                        const sectionKey = section.id;
                        return <SectionView key={sectionKey} {...sectionProps} />;
                      })();
                    return section.id === "effects" &&
                      !deps.value201 &&
                      !deps.value275 &&
                      !deps.readOnly
                      ? (() => {
                          const EffectsSectionView = CssEffectsSection;
                          const effectsProps = {
                            rows: section.rows,
                            shadowTarget: section.shadowTarget,
                            dropShadowReason: section.dropShadowReason,
                            onCommitMany: deps.value152,
                            renderRows: deps.value274,
                            addItemsFor: deps.value272,
                            fallback: sectionElement,
                          } as const;
                          const effectsKey = `effects|${deps.value2 ? `${deps.value2.name}:${deps.value2.tids.join(",")}` : "none"}`;
                          return <EffectsSectionView key={effectsKey} {...effectsProps} />;
                        })()
                      : sectionElement;
                  }

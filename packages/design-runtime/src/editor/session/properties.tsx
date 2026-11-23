import { CssEffectsSection } from "../properties/css-effects";
import { DcTplAttribute } from "../html/authoring";
import { InspectorAppearanceSection } from "../properties/appearance-section";
import { InspectorEditorFontFamilyFontWeightFontSizeSet } from "../inspector/editor";
import { InspectorLayoutSection } from "../properties/layout-section";
import { InspectorStyleMetadataItems } from "../inspector/style-metadata";
import { LayoutSection } from "../properties/layout-section";
import { PropertyActions } from "../properties/primitives";
import { PropertySection } from "../properties/section";
import { PropertyTextSpacing } from "../typography/spacing";
import { TextListValue } from "../inspector/editor";
import { TypographyStyleSelect } from "../typography/style-select";
import { TypographyVariantSelect } from "../typography/style-select";
import { VideoSeekControl } from "../media/playback-controls";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { cn } from "../../cds/theme/class-names";
import { expandCssDeclarations } from "../css/shorthand";
import { findPreviewMediaElement } from "../media/playback-controls";
import { formatPickerText } from "../picker/bridge";
import { getCssVariableNames } from "../css/values";
import { getTextListKind } from "../text/list-state";
import { inspectPickerSelection } from "../picker/bridge";
import { jsxInspectorEditor } from "../inspector/editor";
import { listKindToTag } from "../text/list-state";
import { normalizeContrastGround } from "../inspector/computed-data";
import { parseCssNumber } from "../css/values";
import { parseStyleDeclarations } from "../css/declarations";
import { canvasShapeReact as React } from "../../canvas/shape";
import { resolveTextListState } from "../text/list-state";
import { startPickerTextEdit } from "../picker/bridge";
import { textContrastGround } from "../inspector/editor";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";

interface InspectorSectionContext {
  readonly view: {
    readonly embed: Dynamic;
    readonly installGen: Dynamic;
    readonly nonDcFile: Dynamic;
    readonly readOnly: Dynamic;
    readonly getPreviewFrame: Dynamic;
    readonly previewFrameRef: Dynamic;
  };
  readonly selection: {
    readonly rootName: Dynamic;
    readonly selectionScopeKey: Dynamic;
    readonly detachedTextStyleSelectionKey: Dynamic;
    readonly inspectorTemplateState: Dynamic;
    readonly selection: Dynamic;
    readonly selectionParentDisplay: Dynamic;
    readonly existingSelectedTids: Dynamic;
    readonly isExternalTemplateSelection: Dynamic;
    readonly isLoopDrivenSelection: Dynamic;
    readonly inspectedSelection: Dynamic;
    readonly selectionTypography: Dynamic;
    readonly isComponentSelection: Dynamic;
    readonly pendingTextState: Dynamic;
    readonly computedSelectionStyle: Dynamic;
  };
  readonly actions: {
    readonly setDetachedTextStyleSelectionKey: Dynamic;
    readonly scheduleInspectorRefresh: Dynamic;
    readonly editSelectionProperties: Dynamic;
    readonly setForceShownProperties: Dynamic;
  };
  readonly properties: {
    readonly visibleInspectorProperties: Dynamic;
    readonly isInspectorPropertyShown: Dynamic;
    readonly getAddPropertyItems: Dynamic;
    readonly renderInspectorPropertyRow: Dynamic;
    readonly renderInspectorPropertyRows: Dynamic;
    readonly componentPropsPanel: Dynamic;
    readonly inspectorSections: Dynamic;
    readonly forceShownProperties: Dynamic;
  };
}

/** 渲染属性面板时对每个分区运行：按分区 id 渲染布局、外观、文字、媒体、效果或通用属性分区，并接上对应的提交回调与只读禁用说明。 */
export function renderInspectorSection(deps: InspectorSectionContext, section?: Dynamic): Dynamic {
                    if (section.id === "sizing" || section.id === "size")
                      return (() => {
                        const SizingFragment =
                          React.default.Fragment;
                        const sizingProps = {
                          children: [
                            section.id === deps.properties.inspectorSections[0]?.id && (
                              <div
                                className={cn(
                                  "py-0.5",
                                  (deps.view.nonDcFile ||
                                    deps.selection.isExternalTemplateSelection ||
                                    (!deps.view.embed && deps.selection.isLoopDrivenSelection)) &&
                                    "mt-1",
                                )}
                              >
                                <LayoutSection
                                  rows={
                                    deps.selection.inspectedSelection
                                      ? deps.selection.inspectedSelection.sections.flatMap(
                                          (subsection?: Dynamic): Dynamic =>
                                            subsection.rows,
                                        )
                                      : []
                                  }
                                  parentDisplay={deps.selection.selectionParentDisplay}
                                  display={deps.selection.computedSelectionStyle.display}
                                  multi={deps.selection.existingSelectedTids.length > 1}
                                  standaloneTranslate={
                                    !!deps.selection.inspectedSelection?.advanced.some(
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
                                  disabledAll={deps.selection.isExternalTemplateSelection || deps.view.readOnly}
                                  disabledWhy={
                                    deps.view.readOnly
                                      ? ViewOnlyYouCanInspectThisMessage
                                      : undefined
                                  }
                                  noMargins={
                                    deps.selection.isComponentSelection
                                      ? "Set Position to Absolute first \u2014 a mounted component ignores margins, so it aligns only by its offsets and never to a centre"
                                      : undefined
                                  }
                                  onCommitMany={(edits?: Dynamic): Dynamic =>
                                    deps.actions.editSelectionProperties(edits)
                                  }
                                />
                              </div>
                            ),
                            section.id === deps.properties.inspectorSections[0]?.id && deps.properties.componentPropsPanel,
                            (() => {
                              const LayoutSectionView =
                                InspectorLayoutSection;
                              const layoutProps = {
                                sec: section,
                                selKey: deps.selection.selectionScopeKey,
                                isNested: deps.selection.isExternalTemplateSelection,
                                readOnly: deps.view.readOnly,
                                renderRows: deps.properties.renderInspectorPropertyRows,
                                renderRow: deps.properties.renderInspectorPropertyRow,
                                addItemsFor: deps.properties.getAddPropertyItems,
                                onCommitMany: (edits?: Dynamic): Dynamic =>
                                  deps.actions.editSelectionProperties(edits),
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
                          selKey: deps.selection.selectionScopeKey,
                          isNested: deps.selection.isExternalTemplateSelection,
                          readOnly: deps.view.readOnly,
                          rows: deps.properties.visibleInspectorProperties,
                          onCommitMany: (edits?: Dynamic): Dynamic => {
                            deps.actions.editSelectionProperties(edits);
                            deps.actions.scheduleInspectorRefresh();
                          },
                          fillInline: deps.selection.inspectorTemplateState
                            ? deps.selection.inspectorTemplateState.model.anyHasInlineDecl(
                                deps.selection.existingSelectedTids,
                                "background",
                              ) ||
                              deps.selection.inspectorTemplateState.model.anyHasInlineDecl(
                                deps.selection.existingSelectedTids,
                                "background-color",
                              )
                            : true,
                          hasInline: deps.selection.inspectorTemplateState
                            ? (prop?: Dynamic): Dynamic =>
                                deps.selection.inspectorTemplateState.model.anyHasInlineDecl(
                                  deps.selection.existingSelectedTids,
                                  prop,
                                )
                            : undefined,
                          uaBorder: deps.selection.inspectorTemplateState
                            ? deps.selection.existingSelectedTids.some(
                                (tid?: Dynamic): Dynamic =>
                                  /^(button|input|select|textarea|hr|fieldset|iframe)$/.test(
                                    deps.selection.inspectorTemplateState.model.tagName(tid) ?? "",
                                  ),
                              )
                            : undefined,
                          classHasBorder: deps.selection.inspectorTemplateState
                            ? deps.selection.existingSelectedTids.some(
                                (tid?: Dynamic): Dynamic =>
                                  expandCssDeclarations(
                                    parseStyleDeclarations(
                                      deps.selection.inspectorTemplateState.model.classOnlyStyleAttr(
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
                    if (deps.selection.isExternalTemplateSelection && !section.rows.some(deps.properties.isInspectorPropertyShown)) return null;
                    let attachedStyle: Dynamic =
                        section.id === "text" &&
                        deps.selection.selectionTypography !== null &&
                        deps.selection.selectionTypography.matchedName !== null &&
                        deps.selection.detachedTextStyleSelectionKey !== deps.selection.selectionScopeKey,
                      textListConfig: Dynamic =
                        section.id === "text" && !deps.selection.isComponentSelection
                          ? ((): Dynamic => {
                              let firstTid: Dynamic = deps.selection.existingSelectedTids[0],
                                listState: Dynamic = resolveTextListState(
                                  deps.selection.inspectorTemplateState
                                    ? deps.selection.existingSelectedTids.map(
                                        (tid?: Dynamic): Dynamic =>
                                          getTextListKind(
                                            deps.selection.inspectorTemplateState.model.element(tid),
                                          ),
                                      )
                                    : [],
                                  deps.selection.pendingTextState,
                                  deps.selection.isExternalTemplateSelection ? undefined : firstTid,
                                  firstTid !== undefined &&
                                    !!deps.selection.inspectorTemplateState &&
                                    deps.selection.inspectorTemplateState.model.isTextEditable(firstTid),
                                ),
                                listOffReason: Dynamic = deps.selection.isExternalTemplateSelection
                                  ? null
                                  : listState.off,
                                isListPanelOpen: Dynamic = deps.properties.forceShownProperties.has(
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
                                    previewFrame: Dynamic = deps.view.getPreviewFrame();
                                  tag === null ||
                                    !previewFrame ||
                                    listState.off !== null ||
                                    deps.selection.isExternalTemplateSelection ||
                                    deps.view.readOnly ||
                                    firstTid === undefined ||
                                    (listState.live ||
                                      startPickerTextEdit(
                                        previewFrame,
                                        firstTid,
                                        deps.selection.rootName,
                                      ),
                                    formatPickerText(
                                      previewFrame,
                                      tag,
                                      firstTid,
                                    ));
                                },
                                closeListPanel: Dynamic = (): Dynamic =>
                                  deps.actions.setForceShownProperties((openPanels?: Dynamic): Dynamic => {
                                    let values: Dynamic = new Set(openPanels);
                                    values.delete(TextListValue);
                                    return values;
                                  }),
                                listSelect: Dynamic = showListSelect ? (
                                  <TypographyVariantSelect
                                    key={`${deps.selection.selectionScopeKey}|textlist`}
                                    value={listState.value}
                                    mixed={listState.mixed}
                                    disabled={deps.selection.isExternalTemplateSelection || deps.view.readOnly}
                                    disabledReason={
                                      deps.view.readOnly ? (ViewOnlyYouCanInspectThisMessage) : (listOffReason)
                                    }
                                    onChange={changeListKind}
                                    onReset={
                                      listState.value !== "none" &&
                                      listOffReason === null &&
                                      !deps.selection.isExternalTemplateSelection &&
                                      !deps.view.readOnly
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
                                          deps.actions.setForceShownProperties(
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
                                    {deps.properties.renderInspectorPropertyRows(
                                      rows.slice(0, textAlignIndex(rows)),
                                    )}
                                    {listSelect}
                                    {deps.properties.renderInspectorPropertyRows(
                                      rows.slice(textAlignIndex(rows)),
                                    )}
                                  </jsxInspectorEditor.Fragment>
                                ),
                                addItems: Dynamic = [
                                  ...deps.properties.getAddPropertyItems(
                                    section.rows.slice(
                                      0,
                                      textAlignIndex(section.rows),
                                    ),
                                  ),
                                  ...(addListItem ? [addListItem] : []),
                                  ...deps.properties.getAddPropertyItems(
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
                          actions: deps.selection.isExternalTemplateSelection ? undefined : (
                            <PropertyActions
                              section={section.title}
                              data-testid={`dc-add-${section.id}`}
                              items={
                                textListConfig
                                  ? textListConfig.addItems
                                  : deps.properties.getAddPropertyItems(section.rows)
                              }
                              disabled={deps.view.readOnly}
                            />
                          ),
                          children:
                            section.id === "text" ? (
                              ((): Dynamic => {
                                let attachedToStyle: Dynamic = attachedStyle,
                                  styleSelect: Dynamic =
                                    deps.selection.selectionTypography !== null && !deps.selection.isComponentSelection ? (
                                      <TypographyStyleSelect
                                        key={`${deps.selection.selectionScopeKey}|textstyle`}
                                        model={deps.selection.selectionTypography}
                                        attached={attachedToStyle}
                                        disabled={deps.selection.isExternalTemplateSelection || deps.view.readOnly}
                                        onApply={(
                                          edits?: Dynamic,
                                        ): Dynamic => {
                                          deps.actions.setDetachedTextStyleSelectionKey(null);
                                          deps.actions.editSelectionProperties(
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
                                          deps.actions.scheduleInspectorRefresh();
                                        }}
                                        onDetach={(): Dynamic =>
                                          deps.actions.setDetachedTextStyleSelectionKey(deps.selection.selectionScopeKey)
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
                                      : deps.properties.renderInspectorPropertyRows(rows);
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
                                    {deps.properties.renderInspectorPropertyRows(rowsBeforeSpacing)}
                                    <PropertyTextSpacing
                                      key={`${deps.selection.selectionScopeKey}|textspacing`}
                                      lh={lineHeightRow}
                                      ls={letterSpacingRow}
                                      renderRows={deps.properties.renderInspectorPropertyRows}
                                      onCommitMany={deps.actions.editSelectionProperties}
                                    />
                                    {renderTextRows(rowsAfterSpacing)}
                                  </jsxInspectorEditor.Fragment>
                                );
                              })()
                            ) : (
                              <jsxInspectorEditor.Fragment>
                                {deps.properties.renderInspectorPropertyRows(section.rows)}
                                {section.id === "media" &&
                                  section.title === "Video" &&
                                  !deps.selection.isExternalTemplateSelection &&
                                  deps.selection.selection?.tids.length === 1 && (<VideoSeekControl
                                      key={deps.selection.selectionScopeKey + "|scrub"}
                                      gen={deps.view.installGen}
                                      find={(): Dynamic =>
                                        findPreviewMediaElement(
                                          deps.view.previewFrameRef.current?.contentDocument,
                                          DcTplAttribute,
                                          deps.selection.selection.tids[0],
                                          deps.selection.selection.name,
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
                      !deps.selection.isExternalTemplateSelection &&
                      !deps.selection.isComponentSelection &&
                      !deps.view.readOnly
                      ? (() => {
                          const EffectsSectionView = CssEffectsSection;
                          const effectsProps = {
                            rows: section.rows,
                            shadowTarget: section.shadowTarget,
                            dropShadowReason: section.dropShadowReason,
                            onCommitMany: deps.actions.editSelectionProperties,
                            renderRows: deps.properties.renderInspectorPropertyRows,
                            addItemsFor: deps.properties.getAddPropertyItems,
                            fallback: sectionElement,
                          } as const;
                          const effectsKey = `effects|${deps.selection.selection ? `${deps.selection.selection.name}:${deps.selection.selection.tids.join(",")}` : "none"}`;
                          return <EffectsSectionView key={effectsKey} {...effectsProps} />;
                        })()
                      : sectionElement;
                  }

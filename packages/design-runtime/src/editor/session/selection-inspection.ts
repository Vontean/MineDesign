import { InspectorStyleMetadataItems } from "../inspector/style-metadata";
import { getCssVariableNames } from "../css/values";
import { inspectPickerSelection } from "../picker/bridge";
import { normalizeContrastGround } from "../inspector/computed-data";
import { textContrastGround } from "../inspector/editor";
import { type Dynamic } from "../../runtime-types";

interface SelectionInspectionDependencies {
  readonly ensureModel: Dynamic;
  readonly selectionSequenceRef: Dynamic;
  readonly advanceSelectionSequence: Dynamic;
  readonly clearSelectionRef: Dynamic;
  readonly storeSelection: Dynamic;
  readonly setSelection: Dynamic;
  readonly setComputedSelectionStyle: Dynamic;
  readonly setIsSelectionRendered: Dynamic;
  readonly setSelectionParentDisplay: Dynamic;
  readonly setSelectionBackgroundLayers: Dynamic;
  readonly getPreviewFrame: Dynamic;
  readonly refreshPickerFontFaces: Dynamic;
}

/** 选中元素变化时运行：确认元素仍在模型中，向画板读取计算样式、渲染状态、父级布局与文字对比度背景，写入属性面板的选中状态；过期的请求会被丢弃。 */
export async function loadSelectionInspectorState(deps: SelectionInspectionDependencies, templateName?: Dynamic,
        tids?: Dynamic,
        tagOverride?: Dynamic,
        instanceCountOverride?: Dynamic,
        afterPaint: Dynamic = false): Promise<Dynamic> {
        let requestEpoch: Dynamic = deps.advanceSelectionSequence(),
          docState: Dynamic = await deps.ensureModel(templateName);
        if (requestEpoch !== deps.selectionSequenceRef.current) return;
        let validTids: Dynamic = docState
          ? tids.filter(
              (tid?: Dynamic): Dynamic =>
                docState.model.element(tid) != null,
            )
          : [];
        if (!docState || validTids.length === 0) {
          deps.clearSelectionRef();
          deps.setSelection(null);
          deps.setSelectionBackgroundLayers(null);
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
          previewFrame: Dynamic = deps.getPreviewFrame(),
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
          requestEpoch !== deps.selectionSequenceRef.current ||
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
            requestEpoch !== deps.selectionSequenceRef.current))
        )
          return;
        let tag: Dynamic =
          tagOverride ??
          docState.model.tagName(validTids[validTids.length - 1]) ??
          inspection?.tag ??
          "div";
        deps.setComputedSelectionStyle(inspection?.computed ?? {});
        deps.setIsSelectionRendered(inspection?.rendered ?? false);
        deps.setSelectionParentDisplay(inspection?.parent?.display);
        let contrastGround: Dynamic = isSingleSelection
          ? normalizeContrastGround(inspection)
          : null;
        deps.setSelectionBackgroundLayers(
          (previousGround?: Dynamic): Dynamic =>
            previousGround !== null &&
            contrastGround !== null &&
            previousGround.behind === contrastGround.behind &&
            previousGround.ink === contrastGround.ink
              ? previousGround
              : contrastGround,
        );
        previewFrame && deps.refreshPickerFontFaces(previewFrame);
        let selection: Dynamic = {
          name: templateName,
          tids: validTids,
          tag: tag,
          instances: instanceCountOverride ?? inspection?.instances ?? validTids.length,
        };
        deps.storeSelection(selection);
        deps.setSelection(selection);
        return textContrastGround(
          contrastGround,
          inspection?.computed ?? {},
        );
      }


import type { Dynamic } from "../runtime-types";
import { positionPastedHtml, unpositionPastedHtml } from "../editor/clipboard/html-placement";
import { ClipboardTemplateFlatteningTrueFalseNullSet, flattenSelectionTemplates, flattenTemplateValues, getLoopTemplateVariables } from "../editor/clipboard/template-flattening";
import { getDcPropsJson } from "../editor/html/dc-props";
import { inspectPickerProps } from "../editor/picker/inspection";
import { SelectionActionsHelmetScHelmetPattern } from "../editor/selection/actions";
import { copySelectedElementsHtml, promoteSvgShapeToRoot } from "../editor/selection/element-order";
import { createPreviewHandle } from "../preview/evaluation";
import { reactCanvasShape } from "./shape";

interface SelectionClipboardOptions {
  artboardComponentId: string;
  previewFile: string;
  iframeRef: { current: HTMLIFrameElement | null };
  componentSessionRef: { current: Dynamic };
  resolveComponentState(component: string): Dynamic;
  tweakPropertiesRef: { current: { values: Record<string, unknown> } };
  isCanvasReady(): boolean;
}

interface CopyOptions {
  lift?: Dynamic;
  bakeProps?: boolean;
  vals?: Record<string, unknown>;
}

function readPropDefinitions(source: string): Record<string, Dynamic> {
  try {
    const props = JSON.parse(getDcPropsJson(source) ?? "{}");
    if (props && typeof props === "object" && !Array.isArray(props)) return props;
  } catch {}
  return {};
}

function bakeCopiedProperties(
  html: string,
  definitions: Record<string, Dynamic>,
  tweaks: Record<string, unknown>,
  pending: Record<string, unknown>,
  fromPreview?: Record<string, unknown>,
) {
  const localVariables = getLoopTemplateVariables(html);
  return flattenTemplateValues(html, (name: string) => {
    if (name.startsWith("$") || ClipboardTemplateFlatteningTrueFalseNullSet.has(name)) return;
    if (!Object.hasOwn(definitions, name)) {
      if (fromPreview && !localVariables.has(name) && Object.hasOwn(fromPreview, name)) return fromPreview[name];
      return;
    }
    if (Object.hasOwn(tweaks, name)) return tweaks[name];
    if (Object.hasOwn(pending, name)) return pending[name];
    const definition = definitions[name];
    return definition && typeof definition === "object" ? definition.default : undefined;
  });
}

/** Create clipboard HTML that can render independently of its source artboard. */
export function useArtboardSelectionClipboard({
  artboardComponentId,
  previewFile,
  iframeRef,
  componentSessionRef,
  resolveComponentState,
  tweakPropertiesRef,
  isCanvasReady,
}: SelectionClipboardOptions) {
  const copySelectionHtml = (0, reactCanvasShape.useCallback)(
    (tids: number[], options?: CopyOptions) => {
      const state = resolveComponentState(artboardComponentId);
      if (!state) return null;
      let html = copySelectedElementsHtml(state.model, tids);
      if (html != null && options?.lift) {
        html = flattenSelectionTemplates(state.model, tids, positionPastedHtml(html, options.lift));
      }
      if (html == null || !options?.bakeProps) return html;
      return bakeCopiedProperties(
        html, readPropDefinitions(state.src), tweakPropertiesRef.current.values,
        state.pendingProps ?? {}, options.vals,
      );
    },
    [resolveComponentState, artboardComponentId],
  );

  const readPickerProperties = (0, reactCanvasShape.useCallback)(async () => {
    const preview = createPreviewHandle(iframeRef.current);
    const state = resolveComponentState(artboardComponentId);
    if (!preview || !state || !isCanvasReady()) return {};
    const values: Record<string, unknown> = {};
    for (const [name, definition] of Object.entries(readPropDefinitions(state.src))) {
      if (!name.startsWith("$") && definition && typeof definition === "object") {
        values[name] = definition.default;
      }
    }
    Object.assign(values, state.pendingProps ?? {}, tweakPropertiesRef.current.values);
    return inspectPickerProps(preview, values);
  }, [isCanvasReady, resolveComponentState, artboardComponentId]);

  const copyAllEditableElements = (0, reactCanvasShape.useCallback)(async () => {
    const state = (await componentSessionRef.current.ensureModel(artboardComponentId).catch(() => null)) ??
      resolveComponentState(artboardComponentId);
    if (!state || state.path !== previewFile) return null;
    const model = state.model;
    const tids = model.childTids(null).filter((tid: number) =>
      !SelectionActionsHelmetScHelmetPattern.test(model.tagName(tid) ?? "") &&
      !model.isUneditable(tid) &&
      !model.isLoopDriven(tid),
    );
    if (tids.length === 0) return null;
    const html = copySelectionHtml(tids, { bakeProps: true, vals: await readPickerProperties() });
    return html ? unpositionPastedHtml(html) : null;
  }, [resolveComponentState, artboardComponentId, copySelectionHtml, readPickerProperties]);

  const canCopyElement = (0, reactCanvasShape.useCallback)(async (tid: number) => {
    const model = resolveComponentState(artboardComponentId)?.model;
    if (
      !model || !model.element(tid) || model.isUneditable(tid) || model.isLoopDriven(tid) ||
      promoteSvgShapeToRoot(model, tid) !== tid
    ) return null;
    return copySelectionHtml([tid], { bakeProps: true, vals: await readPickerProperties() });
  }, [resolveComponentState, artboardComponentId, copySelectionHtml, readPickerProperties]);

  return { copySelectionHtml, readPickerProperties, copyAllEditableElements, canCopyElement };
}

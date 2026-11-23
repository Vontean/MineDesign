import type { Dynamic } from "../runtime-types";
import { reactCanvasShape } from "./shape";

interface ArtboardModelOptions {
  artboardComponentId: string;
  previewFile: string;
  componentSessionRef: { current: Dynamic };
}

function elementSnapshot(model: Dynamic, tid: number) {
  return JSON.stringify([
    model.tagName(tid),
    model.attributes(tid),
    model.inlineStyleAttr(tid),
    Array.from(model.element(tid)?.childNodes ?? [], (node: Node) =>
      node.nodeType === 3 ? node.nodeValue : null,
    ),
  ]);
}

function elementsChangedOrder(left: Dynamic, right: Dynamic) {
  const previous = new Set<string>();
  const changed = [];
  for (let tid = 0; tid < left.elementCount(); tid++) {
    const before = elementSnapshot(left, tid);
    const after = elementSnapshot(right, tid);
    if (before !== after) {
      previous.add(before);
      changed.push(after);
    }
  }
  return changed.some((snapshot) => previous.has(snapshot));
}

/** Guard serialized editor changes against stale model snapshots. */
export function useArtboardModelSerialization({
  artboardComponentId,
  previewFile,
  componentSessionRef,
}: ArtboardModelOptions) {
  const serializeCurrentModel = (0, reactCanvasShape.useCallback)(async () => {
    const state = await componentSessionRef.current.ensureModel(artboardComponentId);
    return state && state.path === previewFile ? state.model.serialize() : null;
  }, [artboardComponentId, previewFile]);

  const commitModelSerialization = (0, reactCanvasShape.useCallback)(
    async (source: string, expectedSource?: string) => {
      let same = false;
      let stale = false;
      let status: Dynamic;
      try {
        const state = await componentSessionRef.current.ensureModel(artboardComponentId);
        const current = state?.model.serialize();
        const rebuilt = state?.model.rebuild(source);
        const structureMatches = state != null && rebuilt !== undefined &&
          state.model.sameSkeleton(rebuilt) && !elementsChangedOrder(state.model, rebuilt);

        status = await componentSessionRef.current.mutate(
          artboardComponentId,
          (_model: Dynamic, next: Dynamic) => {
            if (next.path !== previewFile) return false;
            const actual = next.model.serialize();
            if ((expectedSource !== undefined && actual !== expectedSource) ||
              (structureMatches && actual !== current)) {
              stale = true;
              return false;
            }
            if (actual === source) {
              same = true;
              return false;
            }

            const model = rebuilt !== undefined && actual === current ? rebuilt : next.model.rebuild(source);
            if (model.serialize() !== source) return false;
            next.model = model;
            return true;
          },
          structureMatches ? { structural: false, pushUndo: true } : { structural: true },
        );
      } catch {
        return "failed";
      }
      if (stale) return "stale";
      if (same) return "same";
      if (status === "applied" || status === "applied-dirty") return "applied";
      if (status === "refused" || status === false) return "refused";
      return "failed";
    },
    [artboardComponentId, previewFile],
  );

  return { serializeCurrentModel, commitModelSerialization };
}

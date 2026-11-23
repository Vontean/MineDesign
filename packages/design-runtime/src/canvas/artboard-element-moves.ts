import type { Dynamic } from "../runtime-types";
import { reactCanvasShape } from "./shape";
import { frozenInheritedStyleEdits } from "../editor/css/edit-validation";
import { canContainHtmlTag } from "../editor/html/authoring";
import { elementMoveRefusal, moveModelElement, sameParentDropGroup } from "../editor/layout/move-elements";
import { inspectPickerSelection } from "../editor/picker/bridge";
import { containsUneditableSelection } from "../editor/selection/element-order";
import { createPreviewHandle } from "../preview/evaluation";

export interface ArtboardMoveOptions {
  iframeRef: { current: HTMLIFrameElement | null };
  componentSessionRef: { current: Dynamic };
  artboardComponentId: string;
  previewFile: string;
  resolveComponentState(component: string): Dynamic;
}

export function canDropHtml(
  model: Dynamic,
  dropOptions: Dynamic,
  targetTag: string,
  html: string | null,
): boolean {
  const targetTid = dropOptions.targetTid;
  if (targetTid != null) {
    const dropTargetElement = model.element(targetTid);
    if (
      !dropTargetElement ||
      containsUneditableSelection(model, [targetTid]) ||
      model.isUneditable(targetTid) ||
      dropTargetElement.closest("svg") ||
      model.targetParentLocked(targetTid, dropOptions.position)
    )
      return false;
  }
  const targetElement =
    dropOptions.position === "into"
      ? targetTid
      : targetTid != null
        ? model.parentTid(targetTid)
        : null;
  if (
    targetElement != null &&
    (model.isTextEditable(targetElement) ||
      containsUneditableSelection(model, [targetElement]))
  )
    return false;
  const allowedTags =
    targetElement != null
      ? (model.tagName(targetElement)?.toLowerCase() ?? "div")
      : "div";
  if (!canContainHtmlTag(allowedTags, targetTag))
    return false;
  if (html != null) {
    const targetTags = model
      .topLevelTags(html)
      .map((tag?: Dynamic): Dynamic => tag.toLowerCase());
    if (
      targetTags.length !== 1 ||
      targetTags[0] !== targetTag ||
      !canContainHtmlTag(allowedTags, targetTags[0])
    )
      return false;
  }
  return true;
}

interface MovePlan {
  tid: number;
  block?: number[] | null;
  followers?: { tid: number }[];
  group?: { tid: number }[];
}

interface LandingMember {
  key: number;
  html: string;
  landing: {
    targetTid: number | null;
    position: string;
    absolute: boolean;
    absStyles?: Record<string, string>;
    parentNeedsPositioning?: boolean;
  };
}

interface PinnedStyle {
  tid: number;
  el: Element;
  pinned: Map<string, string>;
  freeze: Dynamic;
}

interface LandedMove {
  landed: Map<number, number[]>;
  stayers: "in-place" | "refused" | { newTids: number[] } | null;
  stayersOwn?: number[];
}

function normalizeMoveBlock(model: Dynamic, plan: MovePlan) {
  const block = plan.block ?? sameParentDropGroup(model, plan.tid, plan.group);
  return { ...plan, block: block && block[0] === plan.tid ? block : null };
}

function movedIds(move: { newTid: number; groupTids: number[] }) {
  return [move.newTid, ...move.groupTids.filter((tid) => tid !== move.newTid && tid >= 0)];
}

function templateId(element: Element) {
  return parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10);
}

function activeTemplateIds(elements: Element[]) {
  return elements.map(templateId).filter((tid) => tid >= 0);
}

function applyExistingMove(
  state: Dynamic,
  plans: MovePlan[],
  fallbackIds: number[],
  originalSource: string,
) {
  const plan = plans.length === 1 ? plans[0] : null;
  const ids = plan
    ? [plan.tid, ...(plan.followers ?? []).map((member) => member.tid), ...(plan.group ?? []).map((member) => member.tid)]
    : fallbackIds;
  const readElements = (ids: number[]): Element[] => ids.map((id) => state.model.element(id)).filter((element) => element != null);
  const current = readElements([...new Set(ids)]);
  const noPins: { pin: PinnedStyle; el: Element }[] = [];
  if (!plan) {
    return { status: plans.length > 1 ? "refused" as const : null, elements: current, pins: noPins };
  }

  const move = normalizeMoveBlock(state.model, plan);
  if (elementMoveRefusal(state.model, move) === "in-place") {
    return { status: "in-place" as const, elements: current, pins: noPins };
  }
  const applied = moveModelElement(state, move);
  if (!applied) {
    state.model = state.model.rebuild(originalSource);
    return { status: "refused" as const, elements: readElements([...new Set(ids)]), pins: noPins };
  }

  const elements = readElements(movedIds(applied));
  const pins = (applied.pins as PinnedStyle[]).flatMap((pin) => {
    const el = state.model.element(pin.tid);
    return el ? [{ pin, el }] : [];
  });
  return { status: "moved" as const, elements, pins };
}

function insertLandingMembers(model: Dynamic, members: LandingMember[], targets: (Element | null)[]) {
  const placed = new Map<number, Element[]>();
  let precedingFlowElement: Element | null = null;
  for (const [index, member] of members.entries()) {
    const { landing, html } = member;
    const tag = model.topLevelTags(html)[0]?.toLowerCase() ?? "";
    let targetTid: number | null;
    let position: string;
    if (precedingFlowElement && !landing.absolute && (landing.position === "before" || landing.position === "after")) {
      targetTid = templateId(precedingFlowElement);
      position = "after";
    } else {
      const target = targets[index];
      if (landing.targetTid != null && !target) continue;
      targetTid = target ? templateId(target) : null;
      position = landing.position;
    }
    if (!canDropHtml(model, { ...landing, targetTid, position }, tag, html)) continue;
    const inserted = model.insertHtml(html, targetTid, position) as Element[] | null;
    if (!inserted?.length) continue;
    model.restamp();
    const element = inserted[0];
    const tid = templateId(element);
    if (landing.absolute) {
      model.setStyleProperty(tid, "position", "absolute");
      for (const [property, value] of Object.entries(landing.absStyles ?? {})) {
        model.setStyleProperty(tid, property, value);
      }
      if (landing.parentNeedsPositioning === true && targetTid != null && !model.inlineStyleValue(targetTid, "position")) {
        model.setStyleProperty(targetTid, "position", "relative");
      }
    } else {
      for (const property of ["position", "left", "top", "right", "bottom"]) {
        if (model.inlineStyleValue(tid, property)) model.setStyleProperty(tid, property, null);
      }
      precedingFlowElement = element;
    }
    placed.set(member.key, [...inserted]);
  }
  return placed;
}

/** Apply move operations to the artboard model and reconcile preserved styles after paint. */
export function useArtboardElementMoves({
  iframeRef,
  componentSessionRef,
  artboardComponentId,
  previewFile,
  resolveComponentState,
}: ArtboardMoveOptions) {
  const applySelectionChanges: Dynamic = (0, reactCanvasShape.useCallback)(
    async (selection: PinnedStyle, afterPaint: boolean) => {
      let previewHandle: Dynamic = createPreviewHandle(
          iframeRef.current,
        ),
        componentState: Dynamic = componentSessionRef.current.state(artboardComponentId);
      if (
        !previewHandle ||
        !componentState ||
        componentState.model.element(selection.tid) !== selection.el
      )
        return;
      let pickerResult: Dynamic = await inspectPickerSelection(
        previewHandle,
        selection.tid,
        artboardComponentId,
        [...selection.pinned.keys()],
        {
          unpinned: true,
          afterPaint,
        },
      );
      if (
        componentSessionRef.current.state(artboardComponentId) !== componentState ||
        componentState.model.element(selection.tid) !== selection.el
      )
        return;
      if (!pickerResult) {
        afterPaint ||
          setTimeout((): Dynamic => {
            applySelectionChanges(selection, true);
          }, 300);
        return;
      }
      let styleEdits: Dynamic = frozenInheritedStyleEdits(
        selection.pinned,
        pickerResult.computed,
        selection.freeze,
        (styleProperty?: Dynamic): Dynamic =>
          componentState.model.inlineStyleValue(selection.tid, styleProperty),
      );
      styleEdits.length !== 0 &&
        (await componentSessionRef.current.mutate(
          artboardComponentId,
          (model?: Dynamic, modelState?: Dynamic): Dynamic => {
            if (
              modelState.path !== previewFile ||
              modelState.model.element(selection.tid) !== selection.el
            )
              return false;
            let updated: Dynamic = false;
            for (let propertyName of styleEdits as Dynamic)
              model.setStyleProperty(selection.tid, propertyName, null) &&
                (updated = true);
            return updated;
          },
          {
            structural: false,
            pushUndo: false,
          },
        ));
    },
    [artboardComponentId, previewFile],
  ),
  moveElements = (0, reactCanvasShape.useCallback)(
    async (moves: MovePlan[]) => {
      if (moves.length !== 1) return "refused";
      let newTids: number[] = [];
      let pins: PinnedStyle[] = [];
      let inPlace = false;
      let status: Dynamic;
      try {
        status = await componentSessionRef.current.mutate(
          artboardComponentId,
          (_model: Dynamic, state: Dynamic) => {
            if (state.path !== previewFile) return false;
            const source = state.model.serialize();
            const move = normalizeMoveBlock(state.model, moves[0]);
            if (elementMoveRefusal(state.model, move) === "in-place") {
              inPlace = true;
              return false;
            }
            const applied = moveModelElement(state, move);
            if (!applied) {
              state.model = state.model.rebuild(source);
              return false;
            }
            newTids = [...new Set(movedIds(applied))];
            pins = applied.pins;
            return true;
          },
          { structural: true },
        );
      } catch {
        return "failed";
      }
      if (inPlace) return "in-place";
      if (status !== "applied" && status !== "applied-dirty") return status === "refused" ? "refused" : "failed";
      for (const pin of pins) setTimeout(() => applySelectionChanges(pin, false), 120);
      return { newTids };
    },
    [artboardComponentId, previewFile, applySelectionChanges],
  ),
  landTravellers = (0, reactCanvasShape.useCallback)(
    async (members: LandingMember[], moves: MovePlan[], fallbackIds: number[] = []) => {
      let result: LandedMove | null = null;
      let pins: PinnedStyle[] = [];
      let status: Dynamic;
      try {
        status = await componentSessionRef.current.mutate(
          artboardComponentId,
          (_model: Dynamic, state: Dynamic) => {
            if (state.path !== previewFile) return false;
            const source = state.model.serialize();
            try {
              const targets = members.map(({ landing }) =>
                landing.targetTid == null ? null : state.model.element(landing.targetTid),
              );
              const existing = applyExistingMove(state, moves, fallbackIds, source);
              const placed = insertLandingMembers(state.model, members, targets);
              if (placed.size === 0 && existing.status !== "moved") {
                state.model = state.model.rebuild(source);
                return false;
              }
              const landed = new Map([...placed].map(([key, elements]) => [key, activeTemplateIds(elements)]));
              const ownIds = activeTemplateIds(existing.elements);
              pins = existing.pins.map(({ pin, el }) => ({ ...pin, tid: templateId(el), el }));
              result = existing.status === "moved"
                ? { landed, stayers: { newTids: ownIds } }
                : { landed, stayers: existing.status, stayersOwn: ownIds };
              return true;
            } catch {
              state.model = state.model.rebuild(source);
              return false;
            }
          },
          { structural: true },
        );
      } catch {
        return "failed";
      }
      if ((status !== "applied" && status !== "applied-dirty") || result === null) return "failed";
      for (const pin of pins) setTimeout(() => applySelectionChanges(pin, false), 120);
      return result;
    },
    [artboardComponentId, previewFile, applySelectionChanges],
  ),
  removeElements: Dynamic = (0, reactCanvasShape.useCallback)(
    async (elementIds?: Dynamic, selectedElementIds?: Dynamic): Promise<Dynamic> => {
      let componentState: Dynamic = resolveComponentState(artboardComponentId);
      if (!componentState) return "refused";
      let selectedElements: Dynamic = elementIds.map(
        (elementId?: Dynamic): Dynamic => componentState.model.element(elementId),
      );
      if (
        selectedElements.some((elementId?: Dynamic): Dynamic => elementId == null) ||
        elementIds.some(
          (elementId?: Dynamic): Dynamic =>
            componentState.model.isLoopDriven(elementId) ||
            componentState.model.isUneditable(elementId),
        )
      )
        return "refused";
      let protectedElements: Dynamic = selectedElementIds
          .map(
            (elementId?: Dynamic): Dynamic => componentState.model.element(elementId),
          )
          .filter((elementId?: Dynamic): Dynamic => elementId != null),
        removedTemplateIds: Dynamic = [],
        mutationStatus: Dynamic;
      try {
        mutationStatus = await componentSessionRef.current.mutate(
          artboardComponentId,
          (model?: Dynamic, nextState?: Dynamic): Dynamic => {
            if (nextState.path !== previewFile || nextState !== componentState)
              return false;
            for (let index: Dynamic = 0; index < elementIds.length; index++)
              if (
                nextState.model.element(elementIds[index]) !== selectedElements[index]
              )
                return false;
            for (let elementId of elementIds as Dynamic)
              nextState.model.removeElement(elementId);
            nextState.model.restamp();
            removedTemplateIds = protectedElements
              .map(
                (element?: Dynamic): Dynamic =>
                  parseInt(
                    element.getAttribute("data-dc-tpl") ?? "-1",
                    10,
                  ),
              )
              .filter((templateId?: Dynamic): Dynamic => templateId >= 0);
            nextState.model = nextState.model.rebuild(
              nextState.model.serialize(),
            );
            return true;
          },
          {
            structural: true,
          },
        );
      } catch {
        return "failed";
      }
      return mutationStatus === "refused" || mutationStatus === false
        ? "refused"
        : mutationStatus !== "applied" && mutationStatus !== "applied-dirty"
          ? "failed"
          : {
              kept: removedTemplateIds,
            };
    },
    [resolveComponentState, artboardComponentId, previewFile],
  );

  return { moveElements, landTravellers, removeElements };
}

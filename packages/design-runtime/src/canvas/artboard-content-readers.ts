import type { Dynamic } from "../runtime-types";
import { extractVisibleElementText } from "./content-snapshots";
import { reactCanvasShape } from "./shape";
import { getDesignSystemColorVariables } from "../design-system/store";
import { isTextCapableElement } from "../editor/insert/element-kinds";
import { collectColorTokens, collectFontFamilies, collectFontSizeFamilyUsage, collectFontSizes, collectGoogleFontFamilies, collectTypographyRoles } from "../editor/typography/census";

interface ArtboardContentOptions {
  artboardComponentId: string;
  iframeRef: { current: HTMLIFrameElement | null };
  frameUpdateCountRef: { current: number };
  resolveComponentState(component: string): Dynamic;
}

/** Read selection descriptions, preview content and the current typography/color census. */
export function useArtboardContentReaders({
  artboardComponentId, iframeRef, frameUpdateCountRef, resolveComponentState,
}: ArtboardContentOptions) {
  const describeSelectionTids: Dynamic = (0, reactCanvasShape.useCallback)(
      (tids?: Dynamic): Dynamic => {
        let componentState: Dynamic = resolveComponentState(artboardComponentId);
        if (!componentState) return [];
        let descriptions: Dynamic = [];
        for (let tid of tids as Dynamic) {
          let describedElement: Dynamic = componentState.model.element(tid);
          if (!describedElement) continue;
          let ancestorPath: Dynamic = [];
          for (let ancestorTid: Dynamic = tid; ancestorTid !== null; ) {
            let parentTid: Dynamic = componentState.model.parentTid(ancestorTid);
            ancestorPath.unshift(
              componentState.model.childTids(parentTid).indexOf(ancestorTid),
            );
            ancestorTid = parentTid;
          }
          let tagName: Dynamic =
              componentState.model.tagName(tid)?.toLowerCase() ?? "",
            extractText: Dynamic = (element?: Dynamic): Dynamic =>
              tagName === "img"
                ? (describedElement.getAttribute("alt") ?? "")
                : extractVisibleElementText(describedElement, {
                    visits: element,
                  }),
            elementKind: Dynamic = isTextCapableElement(
              describedElement,
              componentState.model.isTextEditable(tid),
            );
          descriptions.push({
            path: String(tid) + ":" + ancestorPath.join("/"),
            kind: elementKind === "box" ? "shape" : elementKind,
            words: extractText,
          });
        }
        return descriptions;
      },
      [resolveComponentState, artboardComponentId],
    ),
    describeTids: Dynamic = (0, reactCanvasShape.useCallback)(
      (tids?: Dynamic): Dynamic => {
        let componentState: Dynamic = resolveComponentState(artboardComponentId);
        return componentState
          ? tids
              .filter(
                (tid?: Dynamic): Dynamic =>
                  componentState.model.element(tid) != null,
              )
              .map((tid?: Dynamic): Dynamic => {
                let element: Dynamic = componentState.model.element(tid),
                  isTextEditable: Dynamic = componentState.model.isTextEditable(tid);
                return {
                  tid: tid,
                  kind: isTextCapableElement(
                    element,
                    isTextEditable,
                  ),
                  tag: element.tagName.toLowerCase(),
                  editable: isTextEditable,
                };
              })
          : [];
      },
      [resolveComponentState, artboardComponentId],
    ),
  holdsDeck: Dynamic = (0,
    reactCanvasShape.useCallback)((): Dynamic => {
      if (resolveComponentState(artboardComponentId)?.model.findDeckStage() != null) return true;
      try {
        return (
          iframeRef.current?.contentDocument?.querySelector("deck-stage") !=
          null
        );
      } catch {
        return false;
      }
    }, [resolveComponentState, artboardComponentId]),
    pageFonts: Dynamic = (0,
    reactCanvasShape.useCallback)((): Dynamic => {
      let componentState: Dynamic = resolveComponentState(artboardComponentId);
      return componentState
        ? collectFontFamilies(componentState.model.serialize())
        : [];
    }, [resolveComponentState, artboardComponentId]),
    pageCensusRef: Dynamic = (0, reactCanvasShape.useRef)(null),
    pageCensus: Dynamic = (0,
    reactCanvasShape.useCallback)((): Dynamic => {
      let componentState: Dynamic = resolveComponentState(artboardComponentId),
        cachedCensus: Dynamic = pageCensusRef.current,
        stampGeneration: Dynamic = componentState?.stampGen ?? -1,
        colorVariables: Dynamic = getDesignSystemColorVariables();
      if (
        cachedCensus &&
        componentState &&
        cachedCensus.model === componentState.model &&
        cachedCensus.stamp === stampGeneration &&
        cachedCensus.gen === frameUpdateCountRef.current &&
        cachedCensus.tokens === colorVariables
      )
        return cachedCensus.census;
      let serializedModel: Dynamic = componentState ? componentState.model.serialize() : "",
        censusState: Dynamic = {
          fonts: componentState ? collectFontFamilies(serializedModel) : [],
          webfonts: componentState
            ? collectGoogleFontFamilies(serializedModel)
            : [],
          sizes: componentState ? collectFontSizes(serializedModel) : [],
          colors: componentState
            ? collectColorTokens(serializedModel, colorVariables)
            : new Map(),
          roles: componentState
            ? collectFontSizeFamilyUsage(serializedModel)
            : new Map(),
          families: componentState
            ? collectTypographyRoles(serializedModel)
            : new Map(),
        };
      pageCensusRef.current = componentState
        ? {
            model: componentState.model,
            stamp: stampGeneration,
            gen: frameUpdateCountRef.current,
            tokens: colorVariables,
            census: censusState,
          }
        : null;
      return censusState;
    }, [resolveComponentState, artboardComponentId]);

  return { describeSelectionTids, describeTids, holdsDeck, pageFonts, pageCensus };
}

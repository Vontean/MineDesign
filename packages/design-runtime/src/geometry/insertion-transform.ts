import type {
  AffineTuple,
  AffineTransform,
  ContainerPoint,
  PreviewHandle,
} from "../contracts/geometry";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { defaultInsertionPoint, insertHtmlIntoModel } from "../editor/insert/targets";

function measureInsertionContainerTransform(
  componentName: string,
  templateId: number,
  clientX: number,
  clientY: number,
): AffineTuple | null {
  function value(element: Element): string | null {
    let hasComponentName = element.hasAttribute("data-sc-name")
        ? element.parentElement
        : element,
      namedElement = hasComponentName ? hasComponentName.closest("[data-sc-name]") : null;
    return namedElement ? namedElement.getAttribute("data-sc-name") : null;
  }
  let namedElements = document.querySelectorAll(
      '[data-dc-tpl="' + String(templateId) + '"]',
    ),
    containerElement: Element | null = null;
  for (let index = 0; index < namedElements.length && !containerElement; index++)
    value(namedElements[index]!) === componentName &&
      !namedElements[index]!.closest("[data-dc-editor-overlay]") &&
      (containerElement = namedElements[index]!);
  if (!containerElement) return null;
  let containerStyle = getComputedStyle(containerElement),
    bounds = containerElement.getBoundingClientRect();
  if (
    /hidden|clip|scroll|auto/.test(
      containerStyle.overflowX + " " + containerStyle.overflowY,
    ) &&
    (clientX < bounds.left ||
      clientX > bounds.right ||
      clientY < bounds.top ||
      clientY > bounds.bottom)
  )
    return null;
  let items = [
      [0, 0],
      [100, 0],
      [0, 100],
      [100, 100],
    ],
    measurementElements: HTMLDivElement[] = [];
  try {
    for (let index = 0; index < items.length; index++) {
      let measurementElement = document.createElement("div");
      measurementElement.style.cssText =
        "all:initial!important;display:block!important;position:absolute!important;left:" +
        String(items[index]![0]) +
        "px!important;top:" +
        String(items[index]![1]) +
        "px!important;width:0!important;height:0!important;visibility:hidden!important;pointer-events:none!important";
      measurementElements.push(measurementElement);
      containerElement.appendChild(measurementElement);
    }
    let elementBounds = measurementElements.map(function (element) {
        let elementBoundsRect = element.getBoundingClientRect();
        return [elementBoundsRect.left, elementBoundsRect.top];
      }),
      firstBounds = elementBounds[0]!,
      secondBounds = elementBounds[1]!,
      thirdBounds = elementBounds[2]!,
      fourthBounds = elementBounds[3]!;
    return Math.abs(fourthBounds[0]! - (secondBounds[0]! + thirdBounds[0]! - firstBounds[0]!)) > 1 ||
      Math.abs(fourthBounds[1]! - (secondBounds[1]! + thirdBounds[1]! - firstBounds[1]!)) > 1
      ? null
      : [
          firstBounds[0]!,
          firstBounds[1]!,
          (secondBounds[0]! - firstBounds[0]!) / 100,
          (secondBounds[1]! - firstBounds[1]!) / 100,
          (thirdBounds[0]! - firstBounds[0]!) / 100,
          (thirdBounds[1]! - firstBounds[1]!) / 100,
        ];
  } finally {
    for (let index = 0; index < measurementElements.length; index++)
      measurementElements[index]!.parentNode &&
        measurementElements[index]!.parentNode!.removeChild(measurementElements[index]!);
  }
}
function parseInsertionContainerTransform(
  matrix: unknown,
): AffineTransform | null {
  if (
    !Array.isArray(matrix) ||
    matrix.length !== 6 ||
    !matrix.every(
      (component) =>
        typeof component == "number" &&
        Number.isFinite(component) &&
        Math.abs(component) < 1e6,
    )
  )
    return null;
  let [originX, originY, basisXX, basisXY, basisYX, basisYY] = matrix;
  return {
    ox: originX,
    oy: originY,
    ux: basisXX,
    uy: basisXY,
    vx: basisYX,
    vy: basisYY,
  };
}
function insertionPointInContainer(
  transform: AffineTransform,
  clientX: number,
  clientY: number,
): ContainerPoint | null {
  let determinant = transform.ux * transform.vy - transform.uy * transform.vx;
  if (Math.abs(determinant) < 0.001) return null;
  let isIdentity = [
      transform.ux - 1,
      transform.uy,
      transform.vx,
      transform.vy - 1,
    ].every((coordinate) => Math.abs(coordinate) < 0.002),
    roundCoordinate: (coordinate: number) => number = (coordinateValue) =>
      isIdentity ? Math.round(coordinateValue) : Math.round(coordinateValue * 100) / 100,
    [offsetX, offsetY] = [clientX - transform.ox, clientY - transform.oy],
    [left, top] = [
      roundCoordinate(
        (offsetX * transform.vy - offsetY * transform.vx) / determinant,
      ),
      roundCoordinate(
        (offsetY * transform.ux - offsetX * transform.uy) / determinant,
      ),
    ];
  if (Math.abs(left) > 1e5 || Math.abs(top) > 1e5) return null;
  let [projectedX, projectedY] = [
    transform.ox + left * transform.ux + top * transform.vx,
    transform.oy + left * transform.uy + top * transform.vy,
  ];
  return Math.abs(projectedX - clientX) <= 1 &&
    Math.abs(projectedY - clientY) <= 1
    ? {
        left: left,
        top: top,
      }
    : null;
}
async function requestInsertionContainerTransform(
  webview: PreviewHandle,
  componentName: string,
  templateId: number,
  clientX: number,
  clientY: number,
  timeoutMs: number = 400,
): Promise<AffineTransform | null> {
  try {
    return parseInsertionContainerTransform(
      await webview.executeJavaScript(
        "(" +
          measureInsertionContainerTransform.toString() +
          ")(" +
          [componentName, templateId, clientX, clientY]
            .map((matrixValue) => JSON.stringify(matrixValue))
            .join(",") +
          ")",
        timeoutMs,
      ),
    );
  } catch {
    return null;
  }
}
async function placeElementAtMeasuredPoint(
  session?: Dynamic,
  point?: Dynamic,
  makePlacement?: Dynamic,
): Promise<Dynamic> {
  let [clientX, clientY]: Dynamic = [
      Math.round(point.x),
      Math.round(point.y),
    ],
    initialPlacement: Dynamic = makePlacement(clientX, clientY),
    currentState: Dynamic = session.state(),
    initialTarget: Dynamic = currentState
      ? defaultInsertionPoint(
          currentState.model,
          initialPlacement,
        )
      : null,
    containerTemplateId: Dynamic =
      initialTarget?.position === "into" ? initialTarget.targetTid : null,
    containerElement: Dynamic =
      currentState && containerTemplateId != null
        ? currentState.model.element(containerTemplateId)
        : null,
    containerTransform: Dynamic =
      containerElement &&
      containerTemplateId != null &&
      !currentState?.liveStampsStale
        ? await session.measure(containerTemplateId, clientX, clientY)
        : null;
  if (!session.live()) return null;
  let replacementResult: Dynamic = session.replaced?.(initialPlacement);
  if (replacementResult) return replacementResult;
  let containerPoint: Dynamic = containerTransform
    ? insertionPointInContainer(containerTransform, clientX, clientY)
    : null;
  return session.mutate((sessionState?: Dynamic): Dynamic => {
    let value: Dynamic = defaultInsertionPoint(
        sessionState.model,
        initialPlacement,
      ),
      container: Dynamic =
        containerPoint != null &&
        containerElement != null &&
        value.position === "into" &&
        value.targetTid != null &&
        sessionState.model.element(value.targetTid) === containerElement;
    return insertHtmlIntoModel(
      sessionState,
      container
        ? makePlacement(containerPoint.left, containerPoint.top)
        : initialPlacement,
      value,
    );
  });
}
export {
  insertionPointInContainer,
  measureInsertionContainerTransform,
  parseInsertionContainerTransform,
  placeElementAtMeasuredPoint,
  requestInsertionContainerTransform,
};
export function installGeometryInsertionTransform(): () => void {
  return () => {};
}

import { clampPointToNearestBounds, remapPointBetweenBounds } from "./layout-insertion";

const authoredStamp = "data-dc-tpl";

export interface DeckSlideAddress {
  deck: number;
  index: number;
  count: number;
  label: string | null;
}

type DeckStage = Element & { goTo?(index: number): void };

export function isDeckStage(element: Element) {
  return (element.tagName || "").toLowerCase() === "deck-stage";
}

export function isDeckStageWrapper(element: Element | null) {
  if (!element?.tagName) return false;
  const tag = element.tagName.toLowerCase();
  if (tag === "deck-stage" ||
      (tag === "x-import" && element.getAttribute("component-from-global-scope") === "deck-stage")) {
    return true;
  }
  return element.classList.contains("sc-host-x") && Array.from(element.children).some((child) =>
    isDeckStage(child) ||
    (child.classList.contains("sc-placeholder") && child.getAttribute("title") === "deck-stage"),
  );
}

export function isCollapsedDeckWrapper(element: Element | null): boolean {
  if (!element?.getBoundingClientRect) return false;
  const { width, height } = element.getBoundingClientRect();
  if (width !== 0 && height !== 0) return false;
  return Array.from(element.children).some((child) =>
    getComputedStyle(child).display !== "none" &&
    (isDeckStageWrapper(child) || isCollapsedDeckWrapper(child)),
  );
}

export function isDeckManagedElement(element: Element | null) {
  return isDeckStageWrapper(element) || isCollapsedDeckWrapper(element) ||
    !!(element?.parentElement && isDeckStage(element.parentElement));
}

export function eventHitsDeckChrome(event: Event) {
  if (typeof event?.composedPath !== "function") return false;
  for (const node of event.composedPath()) {
    const element = node as Element;
    if (element?.nodeType !== 1 || !element.matches?.("[data-omelette-chrome]")) continue;
    const root = element.getRootNode() as ShadowRoot;
    return !!(root?.host && isDeckStage(root.host));
  }
  return false;
}

export function enclosingDeckSlide(element: Element | null) {
  let ancestor = element;
  while (ancestor && !(ancestor.parentElement && isDeckStage(ancestor.parentElement))) {
    ancestor = ancestor.parentElement;
  }
  return ancestor;
}

function authoredDeckChildren(deck: Element) {
  return Array.from(deck.children).filter((child) =>
    !["TEMPLATE", "SCRIPT", "STYLE"].includes((child.tagName || "").toUpperCase()),
  );
}

export function deckSlideAddress(element: Element): DeckSlideAddress | null {
  const slide = enclosingDeckSlide(element);
  if (!slide) return null;
  const deck = Array.from(document.querySelectorAll("deck-stage")).indexOf(slide.parentElement!);
  if (deck < 0) return null;
  const slides = authoredDeckChildren(slide.parentElement!);
  const index = slides.indexOf(slide);
  return index < 0 ? null : { deck, index, count: slides.length, label: slide.getAttribute("data-label") };
}

export function resolveDeckSlideAddress(address: DeckSlideAddress) {
  const deck = document.querySelectorAll("deck-stage")[address.deck];
  if (!deck) return null;
  const slides = authoredDeckChildren(deck);
  if (address.label != null) {
    const labeled = slides.filter((slide) => slide.getAttribute("data-label") === address.label);
    if (labeled.length === 1) return labeled[0];
  }
  return slides[address.index] ?? null;
}

export function activateDeckSlide(slide: Element | null) {
  if (!slide || slide.hasAttribute("data-deck-active")) return;
  const deck = slide.parentElement as DeckStage | null;
  if (!deck || typeof deck.goTo !== "function") return;
  const slideIndex = parseInt(slide.getAttribute("data-deck-slide") ?? "", 10);
  const index = Number.isNaN(slideIndex) ? authoredDeckChildren(deck).indexOf(slide) : slideIndex;
  if (index >= 0) deck.goTo(index);
}

export function clampPointToActiveDeckSlides(x: number, y: number) {
  const bounds: DOMRect[] = [];
  for (const deck of document.querySelectorAll("deck-stage")) {
    for (const child of deck.children) {
      if (child.hasAttribute("data-deck-active") && child.hasAttribute(authoredStamp)) {
        bounds.push(child.getBoundingClientRect());
      }
    }
  }
  return clampPointToNearestBounds(x, y, bounds);
}

function pointInRect(x: number, y: number, rect: DOMRect) {
  return !(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom);
}

export function deckRailHitAt(x: number, y: number) {
  for (const deck of document.querySelectorAll("deck-stage")) {
    const rail = deck.shadowRoot?.querySelector<HTMLElement>(".rail");
    if (!rail || rail.inert || !pointInRect(x, y, rail.getBoundingClientRect())) continue;
    const slides = authoredDeckChildren(deck);
    for (const [index, thumbnail] of Array.from(rail.children).entries()) {
      if (!pointInRect(x, y, thumbnail.getBoundingClientRect())) continue;
      const slide = slides[index];
      if (!slide?.hasAttribute(authoredStamp)) return null;
      const frameRect = (thumbnail.querySelector(".frame") ?? thumbnail).getBoundingClientRect();
      return { slide: slide as HTMLElement, frameRect };
    }
    return null;
  }
  return null;
}

export function remapDeckRailHit(x: number, y: number, hit: NonNullable<ReturnType<typeof deckRailHitAt>>) {
  return remapPointBetweenBounds(x, y, hit.frameRect, hit.slide.getBoundingClientRect());
}

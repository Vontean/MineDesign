import { componentScopeName } from "./element-query";

interface Directive {
  kind: "if" | "for";
  kids: number[];
  countKids?: number[];
}

type DirectiveMap = Record<string, Directive>;
type FindInstances = (id: string, component: string | null) => Element[];
type DirectiveStates = Record<string, { on: boolean } | { count: number }>;

export function createDirectiveSelection(
  findInstances: FindInstances,
  emit: (event: { type: "directiveState"; name: string | null; states: DirectiveStates }) => void,
  repaint: () => void,
) {
  let map: DirectiveMap | null = null;
  let componentName: string | null = null;
  let lastState: string | null = null;

  function maxInstances(ids: number[]) {
    let count = 0;
    for (const id of ids) count = Math.max(count, findInstances(String(id), componentName).length);
    return count;
  }

  function report(force = false) {
    if (!map) return;
    const states: DirectiveStates = {};
    for (const id in map) {
      const directive = map[id];
      if (directive.kind === "if") {
        states[id] = { on: maxInstances(directive.kids) > 0 };
      } else if (directive.countKids?.length) {
        states[id] = { count: maxInstances(directive.countKids) };
      }
    }
    const serialized = JSON.stringify(states);
    if (!force && serialized === lastState) return;
    lastState = serialized;
    emit({ type: "directiveState", name: componentName, states });
  }

  function setMap(directives?: DirectiveMap | null, component?: string | null) {
    map = directives || null;
    componentName = component || null;
    report(true);
    repaint();
  }

  function instances(id: number | string, component: string | null) {
    const elements = findInstances(String(id), component);
    if (elements.length || !map || (component || null) !== componentName) return elements;
    const directive = map[id];
    if (!directive) return elements;
    for (const child of directive.kids) {
      for (const element of findInstances(String(child), component)) elements.push(element);
    }
    return elements;
  }

  function isRepeated(element?: Element | null) {
    if (!map || !element || componentScopeName(element) !== componentName) return false;
    const repeated = new Set<number>();
    for (const id in map) {
      const directive = map[id];
      if (directive?.kind === "for" && directive.kids) {
        for (const child of directive.kids) repeated.add(child);
      }
    }
    if (!repeated.size) return false;
    for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
      const id = ancestor.getAttribute("data-dc-tpl");
      if (id !== null && repeated.has(parseInt(id, 10))) return true;
    }
    return false;
  }

  function enclosingId(id: number, component: string | null) {
    if (!map || (component || null) !== componentName) return null;
    let enclosing: string | null = null;
    for (const key in map) {
      if (map[key]?.kids?.includes(id) && (enclosing === null || +key > +enclosing)) enclosing = key;
    }
    return enclosing;
  }

  return { setMap, report, instances, isRepeated, enclosingId };
}

import type { Dynamic } from "../../runtime-types";

interface ScriptTextTarget {
  start: number;
  end: number;
  quote: string;
  value: string;
}

interface ReopenedScript {
  start: number;
  end: number;
  text: string;
  from: string;
}

export function resolveTextSeed(
  element: Element,
  seed: string | null | undefined,
  scriptValues: ScriptTextTarget[],
  props: Record<string, unknown>,
  previousEdit: Dynamic,
) {
  let text = "";
  let scriptTarget: ScriptTextTarget | null = null;
  let propTarget: { prop: string; value: string } | null = null;
  let reopen: ReopenedScript | null = null;
  let useSeedMarkup = false;

  if (seed != null) {
    text = element.textContent || "";
    const token = /^\s*\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}\s*$/.exec(seed)?.[1];
    if (token && Object.prototype.hasOwnProperty.call(props, token) && props[token] === text) {
      if (previousEdit?.propTarget?.prop === token && previousEdit.propTarget.value === text &&
          previousEdit.text.length <= 16384) text = previousEdit.text;
      propTarget = { prop: token, value: text };
    } else {
      let match: ScriptTextTarget | null = null;
      for (const candidate of scriptValues) {
        if (candidate.value !== text) continue;
        if (match) {
          match = null;
          break;
        }
        match = candidate;
      }
      if (!match) {
        useSeedMarkup = true;
      } else {
        scriptTarget = { start: match.start, end: match.end, quote: match.quote, value: text };
        const previous = previousEdit?.scriptTarget;
        if (previous) {
          reopen = { start: previous.start, end: previous.end, text: previousEdit.text, from: text };
          if (match.start === previous.start && match.end === previous.end && previous.value === text) {
            reopen.from = text = previousEdit.text;
          }
        }
      }
    }
  }

  return { text, scriptTarget, propTarget, reopen, useSeedMarkup };
}

export function rebaseScriptTarget(target: ScriptTextTarget, reopen: ReopenedScript, values: ScriptTextTarget[]) {
  const original = values.find((candidate) => candidate.start === reopen.start);
  if (!original || original.value !== reopen.text) return target;
  const adjusted = target.start === reopen.start ? original : target.start >= reopen.end
    ? values.find((candidate) => candidate.start === target.start + original.end - reopen.end)
    : null;
  if (!adjusted || adjusted.value !== reopen.from ||
      values.some((candidate) => candidate !== adjusted && candidate.value === target.value)) return target;
  return { start: adjusted.start, end: adjusted.end, quote: adjusted.quote, value: adjusted.value };
}

export function plainTextFromDom(element: Element) {
  const parts: string[] = [];
  function read(parent: Node) {
    for (const child of parent.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        parts.push(child.nodeValue!);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = (child as Element).tagName;
        if (tag === "BR") {
          parts.push(child.nextSibling || child.previousSibling ? "\n" : "");
        } else {
          if (parts.length && (tag === "DIV" || tag === "P")) parts.push("\n");
          read(child);
        }
      }
    }
  }
  read(element);
  return parts.join("");
}

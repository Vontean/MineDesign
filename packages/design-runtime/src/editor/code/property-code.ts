import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { pausedChangesAnnouncement } from "../accessibility/announcements";
import { AccessibilityAnnouncerConstant, announce } from "../accessibility/announcer";
import { normalizeCssProperty, parseStyleDeclarations } from "../css/declarations";
import { reactInspectorAnnotation } from "../inspector/annotation";
import { InspectorClassTargetsDataDcDataScPattern } from "../inspector/class-targets";

var CodePropertyCodeConstant: Dynamic;
var CodePropertyCodeDiscardDelayMs: Dynamic;
var CodePropertyCodeResolvedValue: Dynamic;
function getSelectionCodeEntries(
  model?: Dynamic,
  tids?: Dynamic,
): Dynamic {
  let perElementMaps: Dynamic = tids.map((tid?: Dynamic): Dynamic => {
    let entries: Dynamic = new Map();
    for (let declaration of parseStyleDeclarations(
      model.effectiveStyleAttr(tid),
    ) as Dynamic)
      entries.set(declaration.prop, declaration.value);
    let attributes: Dynamic = model.attributes(tid);
    for (let [attributeName, attributeValue] of Object.entries(attributes) as Dynamic)
      InspectorClassTargetsDataDcDataScPattern.test(attributeName) ||
        entries.set("@" + attributeName, attributeValue);
    return entries;
  });
  if (perElementMaps.length === 0)
    return {
      entries: [],
      mixed: [],
    };
  let firstMap: Dynamic = perElementMaps[0],
    sharedEntries: Dynamic = [],
    mixedKeys: Dynamic = [],
    allKeys: Dynamic = new Set();
  for (let map of perElementMaps as Dynamic)
    for (let key of map.keys() as Dynamic) allKeys.add(key);
  let orderedKeys: Dynamic = [
    ...firstMap.keys(),
    ...[...allKeys].filter((key?: Dynamic): Dynamic => !firstMap.has(key)),
  ].sort(
    (key?: Dynamic, otherKey?: Dynamic): Dynamic =>
      Number(key.startsWith("@")) - Number(otherKey.startsWith("@")),
  );
  for (let key of orderedKeys as Dynamic) {
    let values: Dynamic = perElementMaps.map(
      (map?: Dynamic): Dynamic => map.get(key),
    );
    values.every(
      (entryValue?: Dynamic): Dynamic =>
        entryValue !== undefined && entryValue === values[0],
    )
      ? sharedEntries.push({
          key: key,
          value: values[0],
        })
      : mixedKeys.push(key);
  }
  return {
    entries: sharedEntries,
    mixed: mixedKeys,
  };
}
function serializeSelectionCode(entries?: Dynamic, mixedKeys?: Dynamic): Dynamic {
  let styleEntries: Dynamic = entries.filter(
      (entry?: Dynamic): Dynamic => !entry.key.startsWith("@"),
    ),
    attributeEntries: Dynamic = entries.filter(
      (entry?: Dynamic): Dynamic => entry.key.startsWith("@"),
    ),
    lines: Dynamic = [];
  for (let entry of styleEntries as Dynamic)
    lines.push(entry.key + ": " + entry.value + ";");
  for (let mixedKey of mixedKeys.filter(
    (key?: Dynamic): Dynamic => !key.startsWith("@"),
  ) as Dynamic)
    lines.push("// " + mixedKey + ": (mixed)");
  if (
    attributeEntries.length > 0 ||
    mixedKeys.some((key?: Dynamic): Dynamic => key.startsWith("@"))
  ) {
    lines.length > 0 && lines.push("");
    for (let entry of attributeEntries as Dynamic)
      lines.push(entry.key + ": " + entry.value);
    for (let mixedKey of mixedKeys.filter(
      (key?: Dynamic): Dynamic => key.startsWith("@"),
    ) as Dynamic)
      lines.push("// " + mixedKey + ": (mixed)");
  }
  return lines.join(`
`);
}
function selectionCodeText(model?: Dynamic, tids?: Dynamic): Dynamic {
  let selection: Dynamic = getSelectionCodeEntries(model, tids);
  return serializeSelectionCode(selection.entries, selection.mixed);
}
function focusPropertyCodeLine(textarea?: Dynamic, property?: Dynamic): Dynamic {
  let lines: Dynamic = textarea.value.split(`
`),
    lineIndex: Dynamic = lines.findIndex(
      (line?: Dynamic): Dynamic =>
        line.trimStart().startsWith(property + ":"),
    );
  if (lineIndex < 0) return;
  let currentLine: Dynamic = lines[lineIndex],
    lineStart: Dynamic = lines
      .slice(0, lineIndex)
      .reduce(
        (offset?: Dynamic, previousLine?: Dynamic): Dynamic =>
          offset + previousLine.length + 1,
        0,
      ),
    afterColon: Dynamic = currentLine.slice(
      currentLine.indexOf(property + ":") + property.length + 1,
    );
  textarea.setSelectionRange(
    lineStart + currentLine.length - afterColon.trimStart().length,
    lineStart + currentLine.length,
  );
  let parentElement: Dynamic = textarea.parentElement;
  parentElement &&
    (parentElement.scrollTop = Math.max(
      0,
      textarea.offsetTop -
        parentElement.offsetTop +
        (lineStart / Math.max(1, textarea.value.length)) * textarea.offsetHeight -
        parentElement.clientHeight / 2,
    ));
}
function parseInspectorCode(code?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    lines: Dynamic = code.split(`
`);
  for (let index: Dynamic = 0; index < lines.length; index++) {
    let lineText: Dynamic = lines[index].trim();
    if (lineText === "" || lineText.startsWith("//")) continue;
    if (lineText.startsWith("/*")) {
      if (lineText.endsWith("*/")) continue;
      return {
        ok: false,
        line: index + 1,
        get message() { return uiMessage("inspector.propertyCode.unterminatedComment"); },
      };
    }
    lineText.endsWith(";") && (lineText = lineText.slice(0, -1).trimEnd());
    let match: Dynamic = lineText.startsWith("@")
      ? (/^(@[A-Za-z_][\w-]*(?::[A-Za-z_][\w-]*)*?)\s*:(?=\s|$)\s*([\s\S]*)$/.exec(
          lineText,
        ) ?? /^(@[A-Za-z_][\w-]*)\s*:\s*([\s\S]*)$/.exec(lineText))
      : /^(-{0,2}[A-Za-z_][\w-]*)\s*:\s*([\s\S]*)$/.exec(lineText);
    if (!match)
      return {
        ok: false,
        line: index + 1,
        get message() { return uiMessage("inspector.propertyCode.expectedNameValue"); },
      };
    let property: Dynamic = match[1].startsWith("@")
        ? match[1]
        : normalizeCssProperty(match[1]),
      valueText: Dynamic = match[2].trim();
    if (valueText === "" && !property.startsWith("@"))
      return {
        ok: false,
        line: index + 1,
        get message() { return uiMessage("inspector.propertyCode.missingValue"); },
      };
    if (!property.startsWith("@")) {
      let parenDepth: Dynamic = 0,
        quoteChar: Dynamic = null,
        text: Dynamic = "",
        flag: Dynamic = true;
      for (let charIndex: Dynamic = 0; charIndex < valueText.length; charIndex++) {
        let char: Dynamic = valueText[charIndex];
        if (quoteChar) {
          char === quoteChar && (quoteChar = null);
          continue;
        }
        if (flag && char === "{" && valueText[charIndex + 1] === "{") {
          let closeIndex: Dynamic = valueText.indexOf("}}", charIndex + 3);
          flag = closeIndex >= 0;
          if (flag) {
            let expression: Dynamic = valueText.slice(charIndex + 2, closeIndex);
            if (expression.replace(/"[^"]*"|'[^']*'/g, "").includes(";"))
              return {
                ok: false,
                line: index + 1,
                get message() { return uiMessage("inspector.propertyCode.unexpected"); },
              };
            text += expression;
            charIndex = closeIndex + 1;
            continue;
          }
        }
        if (char === '"' || char === "'") quoteChar = char;
        else if (char === "(") parenDepth++;
        else if (char === ")") parenDepth--;
        else if (
          parenDepth === 0 &&
          (char === "{" || char === "}" || char === ";")
        )
          return {
            ok: false,
            line: index + 1,
            message: uiMessage("inspector.propertyCode.unexpected2") + char,
          };
        if (parenDepth < 0)
          return {
            ok: false,
            line: index + 1,
            get message() { return uiMessage("inspector.propertyCode.unbalanced"); },
          };
      }
      if (parenDepth !== 0 || quoteChar)
        return {
          ok: false,
          line: index + 1,
          get message() { return uiMessage("inspector.propertyCode.unbalancedOrQuote"); },
        };
      if (/[{}]/.test(valueText)) {
        let probe: Dynamic = parseStyleDeclarations(
          "--a: " + valueText + "; --b: 0",
        );
        if (probe.length !== 2 || probe[0].value !== valueText) {
          let hasUnbalancedQuote: Dynamic = (quote?: Dynamic): Dynamic =>
              text.split(quote).length % 2 === 0,
            isUnbalanced: Dynamic =
              hasUnbalancedQuote("'") ||
              hasUnbalancedQuote('"') ||
              text.split("(").length !== text.split(")").length;
          return {
            ok: false,
            line: index + 1,
            message: isUnbalanced ? uiMessage("inspector.propertyCode.unbalancedOrQuote2") : uiMessage("inspector.propertyCode.unexpected3"),
          };
        }
      }
    }
    if (entries.has(property))
      return {
        ok: false,
        line: index + 1,
        message: uiMessage("inspector.propertyCode.duplicate") + property,
      };
    entries.set(property, valueText);
  }
  return {
    ok: true,
    map: entries,
  };
}
function useCodeErrorAnnouncement(
  errorAnnouncement?: Dynamic,
  codeText?: Dynamic,
): Dynamic {
  let lastAnnouncedRef: Dynamic = (0, reactInspectorAnnotation.useRef)(
    undefined,
  );
  (0, reactInspectorAnnotation.useEffect)((): Dynamic => {
    errorAnnouncement === undefined && (lastAnnouncedRef.current = undefined);
    if (errorAnnouncement === undefined || errorAnnouncement === lastAnnouncedRef.current) return;
    let timer: Dynamic = (window as Dynamic).setTimeout((): Dynamic => {
      lastAnnouncedRef.current = errorAnnouncement;
      announce(pausedChangesAnnouncement(errorAnnouncement));
    }, CodePropertyCodeConstant);
    return (): Dynamic => (window as Dynamic).clearTimeout(timer);
  }, [errorAnnouncement, codeText]);
}
export {
  CodePropertyCodeConstant,
  CodePropertyCodeDiscardDelayMs as CodePropertyCodeConstant_2,
  CodePropertyCodeResolvedValue,
  focusPropertyCodeLine,
  getSelectionCodeEntries,
  parseInspectorCode,
  selectionCodeText,
  serializeSelectionCode,
  useCodeErrorAnnouncement,
};
export function installEditorCodePropertyCode(): () => void {
  return () => {
    CodePropertyCodeConstant = 2e3;
    CodePropertyCodeDiscardDelayMs = 1e3;
    CodePropertyCodeResolvedValue =
      AccessibilityAnnouncerConstant + 250;
  };
}

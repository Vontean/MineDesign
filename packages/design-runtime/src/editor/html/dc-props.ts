/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { findHtmlTagEnd, parseDcHtmlDocument, TextXDcValue } from "./dc-document";
import { escapeHtmlAttributeValue } from "./escaping";

var HtmlDcPropsAmpLtGtConfig: Dynamic;
var Value_3: Dynamic;
var HtmlDcPropsItems: Dynamic;
function decodeHtmlEntities(text?: Dynamic): Dynamic {
  return text.replace(
    /&(amp|lt|gt|quot|apos|#[0-9]+|#[xX][0-9a-fA-F]+);/g,
    (entity?: Dynamic, entityBody?: Dynamic): Dynamic => {
      if (entityBody[0] !== "#") return HtmlDcPropsAmpLtGtConfig[entityBody];
      let codePoint: Dynamic =
        entityBody[1] === "x" || entityBody[1] === "X"
          ? parseInt(entityBody.slice(2), 16)
          : parseInt(entityBody.slice(1), 10);
      return codePoint >= 128 && codePoint <= 159
        ? Value_3[codePoint - 128]
        : codePoint === 0 || codePoint > 1114111 || (codePoint >= 55296 && codePoint <= 57343)
          ? "\uFFFD"
          : String.fromCodePoint(codePoint);
    },
  );
}
function getDcPropsJson(source?: Dynamic): Dynamic {
  let document: Dynamic = parseDcHtmlDocument(source);
  if (!document?.jsMatch) return null;
  let scriptTagEnd: Dynamic = findHtmlTagEnd(
    source,
    document.jsMatch.index,
  );
  if (scriptTagEnd === -1) return null;
  let scriptTag: Dynamic = source.slice(document.jsMatch.index, scriptTagEnd),
    propsMatch: Dynamic =
      /\bdata-props\s*=\s*"((?:[^"\\]|\\.)*)"/i.exec(scriptTag) ??
      /\bdata-props\s*=\s*'((?:[^'\\]|\\.)*)'/i.exec(scriptTag);
  return propsMatch ? decodeHtmlEntities(propsMatch[1]) : null;
}
function setDcPropsJson(source?: Dynamic, propsJson?: Dynamic): Dynamic {
  let document: Dynamic = parseDcHtmlDocument(source);
  if (!document) return null;
  let propsAttribute: Dynamic = propsJson.trim()
    ? ` data-props="${escapeHtmlAttributeValue(propsJson.trim())}"`
    : "";
  if (!document.jsMatch) {
    let scriptElement: Dynamic = `<script type="${TextXDcValue}" data-dc-script${propsAttribute}><\/script>
`,
      bodyCloseIndex: Dynamic = source.lastIndexOf("</body>");
    return bodyCloseIndex === -1
      ? source + scriptElement
      : source.slice(0, bodyCloseIndex) + scriptElement + source.slice(bodyCloseIndex);
  }
  let index: Dynamic = document.jsMatch.index,
    scriptTagEnd: Dynamic = findHtmlTagEnd(source, index);
  if (scriptTagEnd === -1) return null;
  let strippedScriptTag: Dynamic = source
    .slice(index, scriptTagEnd)
    .replace(/\s+data-props\s*=\s*"(?:[^"\\]|\\.)*"/i, "")
    .replace(/\s+data-props\s*=\s*'(?:[^'\\]|\\.)*'/i, "");
  return source.slice(0, index) + strippedScriptTag + propsAttribute + source.slice(scriptTagEnd);
}
function setDcScript(
  source?: Dynamic,
  document?: Dynamic,
  script?: Dynamic,
): Dynamic {
  if (!document.jsMatch) {
    let scriptElement: Dynamic = `<script type="${TextXDcValue}" data-dc-script>
${script}
<\/script>
`,
      bodyCloseIndex: Dynamic = source.lastIndexOf("</body>");
    return bodyCloseIndex === -1
      ? source + scriptElement
      : source.slice(0, bodyCloseIndex) + scriptElement + source.slice(bodyCloseIndex);
  }
  let jsMatch: Dynamic = document.jsMatch,
    openingTag: Dynamic = jsMatch[0].slice(0, jsMatch[0].indexOf(">") + 1);
  return (
    source.slice(0, jsMatch.index) +
    openingTag +
    script +
    "<\/script>" +
    source.slice(jsMatch.index + jsMatch[0].length)
  );
}
function findForbiddenTemplateTag(template?: Dynamic): Dynamic {
  for (let { re: pattern, label: label } of HtmlDcPropsItems as Dynamic)
    if (pattern.test(template)) return label;
  return null;
}
export {
  decodeHtmlEntities,
  findForbiddenTemplateTag,
  getDcPropsJson,
  HtmlDcPropsAmpLtGtConfig,
  HtmlDcPropsItems,
  setDcPropsJson,
  setDcScript,
  Value_3,
};
export function installEditorHtmlDcProps(): () => void {
  return () => {
    HtmlDcPropsAmpLtGtConfig = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
    };
    Value_3 =
      "\u20AC\x81\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\x8D\u017D\x8F\x90\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\x9D\u017E\u0178";
    HtmlDcPropsItems = [
      {
        re: /<!doctype/i,
        label: "<!DOCTYPE",
      },
      {
        re: /<html[\s>]/i,
        label: "<html>",
      },
      {
        re: /<head[\s>]/i,
        label: "<head>",
      },
      {
        re: /<body[\s>]/i,
        label: "<body>",
      },
      {
        re: /<\/?x-dc[\s>]/i,
        label: "<x-dc>",
      },
      {
        re: /data-dc-script/i,
        label: "data-dc-script",
      },
    ];
  };
}

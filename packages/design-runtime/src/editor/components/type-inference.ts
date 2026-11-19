/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var ComponentsTypeInferenceLimit: Dynamic;
var maxReferencedTypes: Dynamic;
var maxMembersPerBody: Dynamic;
var maxWorkUnits: Dynamic;
var ComponentsTypeInferenceResolvedValue: Dynamic;
var TYPE_INFERENCE_OVER_BUDGET: Dynamic;
var maxReferenceDepth: Dynamic;
var ComponentsTypeInferenceAZaZPattern: Dynamic;
var ComponentsTypeInferencePattern: Dynamic;
var numberLiteralPattern: Dynamic;
var maxResolveDepth: Dynamic;
var maxTemplateCombinations: Dynamic;
var maxEnumOptions: Dynamic;
var fewNumberLiteralsLimit: Dynamic;
var ComponentsTypeInferenceSubscribers: Dynamic;
var ComponentsTypeInferenceElementCache: Dynamic;
var TypeDeclarationResolver: Dynamic;
var reservedPropNames: Dynamic;
var ComponentsTypeInferenceTextsRsConfig: Dynamic;
var typeInferenceIncomplete: Dynamic;
function convertInferredEnumValue(
  inferredType?: Dynamic,
  text?: Dynamic,
): Dynamic {
  return inferredType.numeric === true
    ? Number(text)
    : inferredType.withBool === true && (text === "true" || text === "false")
      ? text === "true"
      : text;
}
function isValidTypeDeclarationName(name?: Dynamic): Dynamic {
  return ComponentsTypeInferenceAZaZPattern.test(name) && name.length <= 80;
}
function skipBalancedTypeExpression(
  source?: Dynamic,
  start?: Dynamic,
): Dynamic {
  let openChar: Dynamic = source[start],
    closeChar: Dynamic =
      openChar === "{" ? "}" : openChar === "(" ? ")" : openChar === "[" ? "]" : ">",
    depth: Dynamic = 0;
  for (let position: Dynamic = start; position < source.length; position++) {
    let char: Dynamic = source[position];
    if (char === '"' || char === "'" || char === "`") {
      let quote: Dynamic = char;
      for (position++; position < source.length && source[position] !== quote; ) {
        source[position] === "\\" && position++;
        position++;
      }
      continue;
    }
    if (char === "/" && source[position + 1] === "*") {
      let commentEnd: Dynamic = source.indexOf("*/", position + 2);
      if (commentEnd === -1) return -1;
      position = commentEnd + 1;
      continue;
    }
    if (char === "/" && source[position + 1] === "/") {
      let lineEnd: Dynamic = source.indexOf(
        `
`,
        position,
      );
      if (lineEnd === -1) return -1;
      position = lineEnd;
      continue;
    }
    if (char === openChar) depth++;
    else if (char === closeChar && (depth--, depth === 0)) return position + 1;
  }
  return -1;
}
function typeDeclarationEnd(source?: Dynamic, start?: Dynamic): Dynamic {
  let position: Dynamic = start;
  for (; position < source.length; ) {
    let char: Dynamic = source[position];
    if (char === ";") return position;
    if (char === "{" || char === "(" || char === "[") {
      let balancedEnd: Dynamic = skipBalancedTypeExpression(source, position);
      if (balancedEnd === -1) return source.length;
      position = balancedEnd;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      let quote: Dynamic = char;
      for (position++; position < source.length && source[position] !== quote; ) {
        source[position] === "\\" && position++;
        position++;
      }
      position++;
      continue;
    }
    if (char === "/" && source[position + 1] === "*") {
      let commentEnd: Dynamic = source.indexOf("*/", position + 2);
      position = commentEnd === -1 ? source.length : commentEnd + 2;
      continue;
    }
    if (char === "/" && source[position + 1] === "/") {
      let lineEnd: Dynamic = source.indexOf(
        `
`,
        position,
      );
      position = lineEnd === -1 ? source.length : lineEnd + 1;
      continue;
    }
    position++;
  }
  return source.length;
}
function findTypeDeclaration(texts?: Dynamic, name?: Dynamic): Dynamic {
  for (let text of texts as Dynamic)
    for (let kind of ["interface", "type", "const", "enum"] as Dynamic) {
      let searchFrom: Dynamic = 0,
        keywordPhrase: Dynamic = kind + " " + name;
      for (;;) {
        let matchIndex: Dynamic = text.indexOf(keywordPhrase, searchFrom);
        if (matchIndex === -1) break;
        searchFrom = matchIndex + keywordPhrase.length;
        let charBefore: Dynamic = matchIndex === 0 ? " " : (text[matchIndex - 1] ?? " "),
          charAfter: Dynamic = text[searchFrom] ?? " ";
        if (/[\w$]/.test(charBefore) || /[\w$]/.test(charAfter)) continue;
        if (kind === "interface" || kind === "enum") {
          let braceIndex: Dynamic = text.indexOf("{", searchFrom);
          if (braceIndex === -1) break;
          let bodyEnd: Dynamic = skipBalancedTypeExpression(text, braceIndex);
          if (bodyEnd === -1) break;
          return {
            kind: kind,
            head: text.slice(searchFrom, braceIndex),
            body: text.slice(braceIndex + 1, bodyEnd - 1),
          };
        }
        let headSource: Dynamic = text
            .slice(searchFrom)
            .replace(/^\s*(?:<[^=]*>\s*)?[=:]\s*/, ""),
          strippedLength: Dynamic = text.length - searchFrom - headSource.length,
          headStart: Dynamic = searchFrom + strippedLength,
          headEnd: Dynamic = typeDeclarationEnd(text, headStart);
        return {
          kind: kind,
          head: text.slice(headStart, headEnd),
          body: "",
        };
      }
    }
  return null;
}
function tokenizeTypeExpression(source?: Dynamic): Dynamic {
  let members: Dynamic = [],
    position: Dynamic = 0,
    pendingDoc: Dynamic = "";
  for (
    ;
    position < source.length && members.length < maxMembersPerBody;

  ) {
    let char: Dynamic = source[position];
    if (
      char === " " ||
      char ===
        `
` ||
      char === "	" ||
      char === "\r"
    ) {
      position++;
      continue;
    }
    if (char === "/" && source[position + 1] === "*") {
      let commentEnd: Dynamic = source.indexOf("*/", position + 2),
        comment: Dynamic = source.slice(
          position,
          commentEnd === -1 ? source.length : commentEnd + 2,
        );
      pendingDoc = comment.startsWith("/**") ? comment : "";
      position = commentEnd === -1 ? source.length : commentEnd + 2;
      continue;
    }
    if (char === "/" && source[position + 1] === "/") {
      let lineEnd: Dynamic = source.indexOf(
        `
`,
        position,
      );
      position = lineEnd === -1 ? source.length : lineEnd + 1;
      continue;
    }
    let memberEnd: Dynamic = typeDeclarationEnd(source, position),
      memberText: Dynamic = source.slice(position, memberEnd);
    position = memberEnd + 1;
    let memberMatch: Dynamic =
      /^\s*(?:readonly\s+)?(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))(?:\s*(\?))?\s*:\s*([\s\S]+)$/.exec(
        memberText,
      );
    if (memberMatch !== null) {
      let memberName: Dynamic = memberMatch[1] ?? memberMatch[2] ?? memberMatch[3] ?? "";
      members.push({
        name: memberName,
        optional: memberMatch[4] !== undefined,
        type: (memberMatch[5] ?? "").trim(),
        doc: pendingDoc,
      });
    }
    pendingDoc = "";
  }
  return members;
}
function typeExpressionReferences(source?: Dynamic): Dynamic {
  let outerText: Dynamic = "",
    position: Dynamic = 0;
  for (; position < source.length; ) {
    if (source[position] === "{") {
      let blockEnd: Dynamic = skipBalancedTypeExpression(source, position);
      if (blockEnd === -1) break;
      position = blockEnd;
      continue;
    }
    outerText += source[position];
    position++;
  }
  let references: Dynamic = [],
    namePattern: Dynamic = /\b([A-Z][\w$]*)\b(\s*\[)?/g,
    match: Dynamic;
  for (; (match = namePattern.exec(outerText)) !== null; ) {
    let typeName: Dynamic = match[1] ?? "";
    if (
      match[2] === undefined &&
      !(
        typeName === "Omit" ||
        typeName === "Pick" ||
        typeName === "Partial" ||
        typeName === "Required" ||
        typeName === "NonNullable" ||
        typeName === "Readonly" ||
        typeName === "React"
      ) &&
      (references.includes(typeName) || references.push(typeName),
      references.length >= maxReferencedTypes)
    )
      break;
  }
  return references;
}
function typeObjectBodies(source?: Dynamic): Dynamic {
  let bodies: Dynamic = [],
    position: Dynamic = 0;
  for (; position < source.length; ) {
    let char: Dynamic = source[position];
    if (char === "{") {
      let blockEnd: Dynamic = skipBalancedTypeExpression(source, position);
      if (blockEnd === -1) break;
      bodies.push(source.slice(position + 1, blockEnd - 1));
      position = blockEnd;
      continue;
    }
    if (char === "(" || char === "[") {
      position++;
      continue;
    }
    if (char === "<") {
      let angleEnd: Dynamic = skipBalancedTypeExpression(source, position);
      position = angleEnd === -1 ? source.length : angleEnd;
      continue;
    }
    position++;
  }
  return bodies;
}
function createTypeInferenceState(): Dynamic {
  return {
    literals: [],
    numeric: true,
    str: false,
    num: false,
    bool: false,
    node: false,
    other: false,
    unresolved: [],
  };
}
function addInferredLiteral(
  state?: Dynamic,
  literal?: Dynamic,
  isQuoted: Dynamic = false,
): Dynamic {
  let literalSet: Dynamic = ComponentsTypeInferenceElementCache.get(
    state.literals,
  );
  literalSet === undefined &&
    ComponentsTypeInferenceElementCache.set(
      state.literals,
      (literalSet = new Set(state.literals)),
    );
  !(literalSet.size > maxEnumOptions) &&
    (literalSet.has(literal) || (literalSet.add(literal), state.literals.push(literal)),
    (isQuoted || !numberLiteralPattern.test(literal)) &&
      (state.numeric = false));
}
function mergeInferredType(state?: Dynamic, source?: Dynamic): Dynamic {
  if (source === null) {
    state.other = true;
    return;
  }
  if (source.kind === "enum") {
    let enumOptions: Dynamic = source.options ?? [];
    source.withBool === true && (state.bool = true);
    for (let literal of (source.withBool === true
      ? enumOptions.slice(2)
      : enumOptions) as Dynamic)
      addInferredLiteral(state, literal);
    source.numeric !== true && (state.numeric = false);
  } else
    source.kind === "boolean"
      ? (state.bool = true)
      : source.kind === "number"
        ? (state.num = true)
        : ((state.str = true),
          source.typeName !== undefined &&
            state.unresolved.push(source.typeName));
}
function inferredEnumType(literals?: Dynamic): Dynamic {
  let state: Dynamic = {
    kind: "enum",
    options: [...new Set(literals)].slice(0, maxEnumOptions + 1),
  };
  state.options !== undefined &&
    state.options.length > 0 &&
    state.options.every(
      (literal?: Dynamic): Dynamic =>
        numberLiteralPattern.test(literal),
    ) &&
    (state.numeric = true);
  return state;
}
function inferDeclaredEnum(body?: Dynamic): Dynamic {
  let values: Dynamic = [],
    isNumeric: Dynamic = true,
    nextIndex: Dynamic = 0;
  for (let member of splitTypeExpression(
    stripTypeComments(body),
    ",",
  ) as Dynamic) {
    let memberMatch: Dynamic =
      /^\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*(?:=([\s\S]*))?$/.exec(
        member.trim(),
      );
    if (memberMatch === null) continue;
    let initializer: Dynamic =
      memberMatch[4] === undefined ? undefined : memberMatch[4].trim() || undefined;
    if (initializer === undefined) {
      values.push(String(nextIndex++));
      continue;
    }
    let quotedInitializer: Dynamic = ComponentsTypeInferencePattern.exec(initializer);
    if (quotedInitializer !== null) {
      values.push(quotedInitializer[1] ?? quotedInitializer[2] ?? "");
      isNumeric = false;
      continue;
    }
    if (numberLiteralPattern.test(initializer)) {
      values.push(initializer);
      nextIndex = Number(initializer) + 1;
      continue;
    }
    return null;
  }
  if (values.length === 0) return null;
  let state: Dynamic = {
    kind: "enum",
    options: values,
  };
  isNumeric && (state.numeric = true);
  return state;
}
function normalizeArrayType(typeText?: Dynamic): Dynamic {
  let unwrapped: Dynamic = unwrapTypeExpression(stripTypeComments(typeText)).replace(
    /^readonly\s+/,
    "",
  );
  if (unwrapped.startsWith("[") && unwrapped.endsWith("]"))
    return splitTypeExpression(unwrapped.slice(1, -1), ",").join(" | ");
  let arrayMatch: Dynamic = /^(?:ReadonlyArray|Array)\s*<([\s\S]*)>$/.exec(unwrapped);
  return arrayMatch !== null
    ? (arrayMatch[1] ?? "")
    : unwrapped.endsWith("[]")
      ? unwrapped.slice(0, -2)
      : unwrapped;
}
function stripTypeComments(source?: Dynamic): Dynamic {
  let kept: Dynamic = "",
    segmentStart: Dynamic = 0,
    position: Dynamic = 0;
  for (; position < source.length; ) {
    let char: Dynamic = source[position];
    if (char === '"' || char === "'" || char === "`") {
      for (position++; position < source.length && source[position] !== char; )
        position += source[position] === "\\" ? 2 : 1;
      position++;
      continue;
    }
    if (char === "/" && source[position + 1] === "*") {
      kept += source.slice(segmentStart, position);
      let commentEnd: Dynamic = source.indexOf("*/", position + 2);
      if (commentEnd === -1) return kept.trim();
      position = segmentStart = commentEnd + 2;
      continue;
    }
    position++;
  }
  return (kept + source.slice(segmentStart)).trim();
}
function unwrapTypeExpression(typeText?: Dynamic): Dynamic {
  let inner: Dynamic = typeText.trim();
  for (
    let index: Dynamic = 0;
    index < 8 &&
    inner.startsWith("(") &&
    skipBalancedTypeExpression(inner, 0) === inner.length;
    index++
  )
    inner = inner.slice(1, -1).trim();
  return inner;
}
function conciseTypeDescription(typeText?: Dynamic): Dynamic {
  let collapsed: Dynamic = stripTypeComments(typeText).replace(/\s+/g, " ");
  return collapsed.length > 40 ? collapsed.slice(0, 37) + "\u2026" : collapsed;
}
function splitTypeExpression(source?: Dynamic, separator?: Dynamic): Dynamic {
  let parts: Dynamic = [],
    depth: Dynamic = 0,
    partStart: Dynamic = 0,
    position: Dynamic = 0;
  for (; position < source.length; ) {
    let char: Dynamic = source[position];
    if (char === '"' || char === "'" || char === "`") {
      let quote: Dynamic = char;
      for (position++; position < source.length && source[position] !== quote; ) {
        source[position] === "\\" && position++;
        position++;
      }
      position++;
      continue;
    }
    char === "{" || char === "(" || char === "[" || char === "<"
      ? depth++
      : char === "}" || char === ")" || char === "]" || char === ">"
        ? (char === ">" && source[position - 1] === "=") || depth--
        : char === separator &&
          depth === 0 &&
          (parts.push(source.slice(partStart, position).trim()),
          (partStart = position + 1));
    position++;
  }
  parts.push(source.slice(partStart).trim());
  return parts.filter((part?: Dynamic): Dynamic => part !== "");
}
function inferVariantPropsType(typeText?: Dynamic, resolver?: Dynamic): Dynamic {
  let variantMatch: Dynamic =
    /VariantProps<typeof\s+([A-Za-z_$][\w$]*)>\s*\[\s*"([^"]+)"\s*\]/.exec(
      typeText,
    );
  if (variantMatch === null) return null;
  let declaration: Dynamic = resolver.decl(variantMatch[1] ?? "");
  if (declaration === null) return null;
  let variantName: Dynamic = variantMatch[2] ?? "";
  for (let head of resolver.heads(declaration.head) as Dynamic)
    for (let member of resolver.members(head) as Dynamic)
      if (member.name === variantName) return member.type;
  return null;
}
function inferJSDocDefault(doc?: Dynamic, source?: Dynamic): Dynamic {
  let match: Dynamic =
    /@default\s+(?:`([^`]*)`|"([^"]*)"|'([^']*)'|(\S+))/.exec(doc);
  if (match === null) return;
  let defaultText: Dynamic = (
    match[1] ??
    match[2] ??
    match[3] ??
    match[4] ??
    ""
  ).replace(/^["'`]|["'`]$/g, "");
  if (source.kind === "boolean")
    return defaultText === "true" ? true : defaultText === "false" ? false : undefined;
  if (source.kind === "number") {
    let numberValue: Dynamic = Number(defaultText);
    return Number.isFinite(numberValue) ? numberValue : undefined;
  }
  return source.kind === "enum"
    ? source.options?.includes(defaultText) !== true
      ? undefined
      : convertInferredEnumValue(source, defaultText)
    : defaultText;
}
export {
  addInferredLiteral,
  ComponentsTypeInferenceAZaZPattern,
  ComponentsTypeInferenceElementCache,
  ComponentsTypeInferenceLimit,
  maxReferencedTypes as ComponentsTypeInferenceLimit_2,
  maxMembersPerBody as ComponentsTypeInferenceLimit_3,
  maxWorkUnits as ComponentsTypeInferenceLimit_4,
  maxReferenceDepth as ComponentsTypeInferenceLimit_5,
  maxResolveDepth as ComponentsTypeInferenceLimit_6,
  maxTemplateCombinations as ComponentsTypeInferenceLimit_7,
  maxEnumOptions as ComponentsTypeInferenceLimit_8,
  fewNumberLiteralsLimit as ComponentsTypeInferenceLimit_9,
  ComponentsTypeInferencePattern,
  numberLiteralPattern as ComponentsTypeInferencePattern_2,
  ComponentsTypeInferenceResolvedValue,
  ComponentsTypeInferenceSubscribers,
  reservedPropNames as ComponentsTypeInferenceSubscribers_2,
  ComponentsTypeInferenceTextsRsConfig,
  conciseTypeDescription,
  convertInferredEnumValue,
  createTypeInferenceState,
  findTypeDeclaration,
  inferDeclaredEnum,
  inferJSDocDefault,
  inferredEnumType,
  inferVariantPropsType,
  isValidTypeDeclarationName,
  mergeInferredType,
  normalizeArrayType,
  skipBalancedTypeExpression,
  splitTypeExpression,
  stripTypeComments,
  tokenizeTypeExpression,
  TYPE_INFERENCE_OVER_BUDGET,
  typeDeclarationEnd,
  TypeDeclarationResolver,
  typeExpressionReferences,
  typeInferenceIncomplete,
  typeObjectBodies,
  unwrapTypeExpression,
};
export function set_ComponentsTypeInferenceTextsRsConfig(value: any): any {
  ComponentsTypeInferenceTextsRsConfig = value;
  return value;
}
export function set_typeInferenceIncomplete(value: any): any {
  typeInferenceIncomplete = value;
  return value;
}
export function installEditorComponentsTypeInference(): () => void {
  return () => {
    ComponentsTypeInferenceLimit = 24;
    maxReferencedTypes = 32;
    maxMembersPerBody = 2e3;
    maxWorkUnits = 5e4;
    ComponentsTypeInferenceResolvedValue = 256 * 1024 * 1024;
    TYPE_INFERENCE_OVER_BUDGET = Symbol("over budget");
    maxReferenceDepth = 4;
    ComponentsTypeInferenceAZaZPattern = /^[A-Za-z_$][\w$]*$/;
    ComponentsTypeInferencePattern = /^(?:"([^"\\]*)"|'([^'\\]*)')$/;
    numberLiteralPattern = /^-?\d+(?:\.\d+)?$/;
    maxResolveDepth = 12;
    maxTemplateCombinations = 64;
    maxEnumOptions = 400;
    fewNumberLiteralsLimit = 3;
    ComponentsTypeInferenceSubscribers = new Set([
      "ReactElement",
      "JSX.Element",
      "Element",
      "HTMLElement",
      "ComponentType",
      "FC",
      "FunctionComponent",
      "ElementType",
      "Ref",
      "RefObject",
      "CSSProperties",
    ]);
    ComponentsTypeInferenceElementCache = new WeakMap();
    TypeDeclarationResolver = class {
      constructor(texts: Dynamic) {
        this.texts = texts;
        this.textBytes = texts.reduce(
          (total?: Dynamic, text?: Dynamic): Dynamic => total + text.length,
          0,
        );
      }
      texts: Dynamic;
      decls: Dynamic = new Map();
      named: Dynamic = new Map();
      busy: Dynamic = new Set();
      textBytes: Dynamic;
      work: Dynamic = 0;
      scanned: Dynamic = 0;
      reuse(): Dynamic {
        this.work = 0;
        this.scanned = 0;
        this.busy.clear();
        this.named.clear();
        return this;
      }
      tick(units: Dynamic = 1): Dynamic {
        if ((this.work += units) > maxWorkUnits)
          throw TYPE_INFERENCE_OVER_BUDGET;
      }
      charge(chars: Dynamic): Dynamic {
        if ((this.scanned += chars) > ComponentsTypeInferenceResolvedValue)
          throw TYPE_INFERENCE_OVER_BUDGET;
      }
      headBodies: Dynamic = new Map();
      heads(headText: Dynamic): Dynamic {
        let entry: Dynamic = this.headBodies.get(headText);
        entry === undefined &&
          (this.charge(headText.length),
          (entry = typeObjectBodies(headText)),
          this.headBodies.set(headText, entry));
        this.tick();
        return entry;
      }
      bodies: Dynamic = new Map();
      members(bodyText: Dynamic): Dynamic {
        let entry: Dynamic = this.bodies.get(bodyText);
        entry === undefined &&
          (this.charge(bodyText.length),
          (entry = tokenizeTypeExpression(bodyText)),
          this.bodies.set(bodyText, entry));
        this.tick(1 + (entry.length >> 4));
        return entry;
      }
      decl(name: Dynamic): Dynamic {
        let entry: Dynamic = this.decls.get(name);
        if (entry !== undefined) return entry;
        this.tick(25);
        this.charge(this.textBytes);
        let declaration: Dynamic = findTypeDeclaration(this.texts, name);
        this.decls.set(name, declaration);
        return declaration;
      }
      resolve(typeText: Dynamic, depth: Dynamic): Dynamic {
        this.tick();
        let state: Dynamic = createTypeInferenceState();
        this.arms(typeText, depth, state);
        return this.control(state, typeText);
      }
      resolveName(name: Dynamic, depth: Dynamic): Dynamic {
        let entry: Dynamic = this.named.get(name);
        if (entry !== undefined) return entry;
        if (this.busy.has(name) || depth > maxResolveDepth)
          return {
            kind: "string",
            typeName: name,
          };
        this.busy.add(name);
        let resolved: Dynamic,
          declaration: Dynamic = this.decl(name);
        declaration === null
          ? (resolved = ComponentsTypeInferenceSubscribers.has(name)
              ? null
              : {
                  kind: "string",
                  typeName: name,
                })
          : declaration.kind === "type"
            ? ((resolved = this.resolve(declaration.head, depth + 1)),
              resolved !== null &&
                resolved.kind === "string" &&
                resolved.typeName !== undefined &&
                this.decl(resolved.typeName) === null &&
                (resolved = {
                  kind: "string",
                  typeName: name,
                }))
            : declaration.kind === "enum"
              ? (resolved = inferDeclaredEnum(declaration.body))
              : (resolved = null);
        this.busy.delete(name);
        this.named.set(name, resolved);
        return resolved;
      }
      arms(typeText: Dynamic, depth: Dynamic, state: Dynamic): Dynamic {
        this.charge(typeText.length);
        for (let arm of splitTypeExpression(
          stripTypeComments(typeText),
          "|",
        ) as Dynamic) {
          this.tick();
          this.charge(arm.length);
          let armText: Dynamic = unwrapTypeExpression(arm);
          if (
            armText === "" ||
            armText === "undefined" ||
            armText === "null" ||
            armText === "never"
          )
            continue;
          let quotedMatch: Dynamic = ComponentsTypeInferencePattern.exec(armText);
          if (quotedMatch !== null) {
            addInferredLiteral(state, quotedMatch[1] ?? quotedMatch[2] ?? "", true);
            continue;
          }
          if (numberLiteralPattern.test(armText)) {
            addInferredLiteral(state, armText);
            continue;
          }
          if (armText === "boolean" || armText === "true" || armText === "false") {
            state.bool = true;
            continue;
          }
          if (armText === "number") {
            state.num = true;
            continue;
          }
          if (armText === "string") {
            state.str = true;
            continue;
          }
          if (armText === "ReactNode" || armText === "React.ReactNode") {
            state.node = true;
            continue;
          }
          if (armText.startsWith("`") && armText.endsWith("`")) {
            let templateValues: Dynamic = this.template(armText.slice(1, -1), depth);
            if (templateValues === null) state.str = true;
            else
              for (let templateValue of templateValues as Dynamic)
                addInferredLiteral(state, templateValue);
            continue;
          }
          let specialType: Dynamic = this.special(armText, depth);
          if (specialType !== undefined) {
            mergeInferredType(state, specialType);
            continue;
          }
          if (ComponentsTypeInferenceAZaZPattern.test(armText)) {
            mergeInferredType(state, this.resolveName(armText, depth));
            continue;
          }
          state.other = true;
        }
      }
      special(typeText: Dynamic, depth: Dynamic): Dynamic {
        let genericMatch: Dynamic = /^([A-Za-z_$][\w$]*)\s*<([\s\S]*)>$/.exec(typeText);
        if (genericMatch !== null) {
          if (depth > maxResolveDepth) return null;
          let genericName: Dynamic = genericMatch[1] ?? "",
            genericArgs: Dynamic = splitTypeExpression(genericMatch[2] ?? "", ",");
          return genericName === "NonNullable" && genericArgs.length === 1
            ? this.resolve(genericArgs[0] ?? "", depth + 1)
            : (genericName === "Extract" || genericName === "Exclude") &&
                genericArgs.length === 2
              ? this.extract(
                  genericName === "Extract",
                  genericArgs[0] ?? "",
                  genericArgs[1] ?? "",
                  depth,
                )
              : null;
        }
        let variantType: Dynamic = inferVariantPropsType(typeText, this);
        if (variantType !== null) return this.resolve(variantType, depth + 1);
        let keyofMatch: Dynamic = /^keyof\s+(typeof\s+)?([A-Za-z_$][\w$]*)$/.exec(
          typeText,
        );
        if (keyofMatch !== null) {
          let keys: Dynamic = this.keysOf(
            keyofMatch[2] ?? "",
            keyofMatch[1] !== undefined,
            depth,
          );
          return keys === null ? null : inferredEnumType(keys);
        }
        let typeofIndexMatch: Dynamic =
          /^\(?\s*typeof\s+([A-Za-z_$][\w$]*)\s*\)?\s*\[\s*number\s*\]$/.exec(
            typeText,
          );
        if (typeofIndexMatch !== null) {
          let constDeclaration: Dynamic = this.decl(typeofIndexMatch[1] ?? "");
          return constDeclaration === null || constDeclaration.kind !== "const"
            ? null
            : (this.charge(constDeclaration.head.length),
              this.resolve(normalizeArrayType(constDeclaration.head), depth + 1));
        }
        let memberMatch: Dynamic =
          /^([A-Za-z_$][\w$]*)\s*\[\s*(?:"([^"]+)"|'([^']+)')\s*\]$/.exec(
            typeText,
          );
        if (memberMatch !== null) {
          let memberTypeText: Dynamic = this.memberType(
            memberMatch[1] ?? "",
            memberMatch[2] ?? memberMatch[3] ?? "",
            depth,
          );
          return memberTypeText === null ? null : this.resolve(memberTypeText, depth + 1);
        }
        if (typeText.startsWith("typeof ")) return null;
      }
      extract(
        isExtract: Dynamic,
        sourceText: Dynamic,
        filterText: Dynamic,
        depth: Dynamic,
      ): Dynamic {
        let filterState: Dynamic = createTypeInferenceState();
        this.arms(filterText, depth + 1, filterState);
        let sourceState: Dynamic = createTypeInferenceState();
        this.arms(sourceText, depth + 1, sourceState);
        if (isExtract) {
          if (
            sourceState.literals.length === 0 &&
            !sourceState.str &&
            !sourceState.num &&
            !sourceState.bool &&
            filterState.literals.length > 0 &&
            !filterState.str
          )
            return inferredEnumType(filterState.literals);
          let extractedState: Dynamic = {
            ...createTypeInferenceState(),
            literals: filterState.str
              ? sourceState.literals
              : sourceState.literals.filter(
                  (literal?: Dynamic): Dynamic =>
                    filterState.literals.includes(literal),
                ),
          };
          extractedState.numeric = extractedState.literals.every(
            (literal?: Dynamic): Dynamic =>
              numberLiteralPattern.test(literal),
          );
          extractedState.str = sourceState.str && filterState.str;
          extractedState.num = sourceState.num && filterState.num;
          extractedState.bool = sourceState.bool && filterState.bool;
          extractedState.node = sourceState.node && filterState.node;
          return this.control(extractedState, sourceText);
        }
        let state: Dynamic = {
          ...sourceState,
          literals: sourceState.literals.filter(
            (literal?: Dynamic): Dynamic => !filterState.literals.includes(literal),
          ),
          unresolved: [...sourceState.unresolved],
        };
        filterState.str && (state.literals = []);
        state.numeric = state.literals.every(
          (literal?: Dynamic): Dynamic =>
            numberLiteralPattern.test(literal),
        );
        filterState.bool && (state.bool = false);
        filterState.num && (state.num = false);
        filterState.str && (state.str = false);
        return this.control(state, sourceText);
      }
      keysOf(name: Dynamic, isTypeof: Dynamic, depth: Dynamic): Dynamic {
        if (depth > maxResolveDepth) return null;
        let declaration: Dynamic = this.decl(name);
        if (declaration === null) return null;
        if (isTypeof) {
          if (declaration.kind !== "const") return null;
          let typeofHeads: Dynamic = this.heads(declaration.head);
          return typeofHeads.length === 0
            ? null
            : this.members(typeofHeads[0] ?? "").map(
                (member?: Dynamic): Dynamic => member.name,
              );
        }
        if (declaration.kind === "interface")
          return this.members(declaration.body).map(
            (member?: Dynamic): Dynamic => member.name,
          );
        if (declaration.kind !== "type") return null;
        this.charge(declaration.head.length);
        let headText: Dynamic = unwrapTypeExpression(
            stripTypeComments(declaration.head),
          ),
          typeofMatch: Dynamic = /^typeof\s+([A-Za-z_$][\w$]*)$/.exec(headText);
        if (typeofMatch !== null)
          return this.keysOf(typeofMatch[1] ?? "", true, depth + 1);
        if (ComponentsTypeInferenceAZaZPattern.test(headText))
          return this.keysOf(headText, false, depth + 1);
        let aliasHeads: Dynamic = this.heads(headText);
        return aliasHeads.length === 0
          ? null
          : this.members(aliasHeads[0] ?? "").map(
              (member?: Dynamic): Dynamic => member.name,
            );
      }
      memberType(name: Dynamic, memberName: Dynamic, depth: Dynamic): Dynamic {
        if (depth > maxResolveDepth) return null;
        let declaration: Dynamic = this.decl(name);
        if (declaration === null || declaration.kind === "enum") return null;
        let bodies: Dynamic =
          declaration.kind === "interface" ? [declaration.body] : this.heads(declaration.head);
        for (let body of bodies as Dynamic)
          for (let member of this.members(body) as Dynamic)
            if (member.name === memberName) return member.type;
        if (declaration.kind === "type") {
          this.charge(declaration.head.length);
          let aliasTarget: Dynamic = unwrapTypeExpression(
            stripTypeComments(declaration.head),
          );
          if (ComponentsTypeInferenceAZaZPattern.test(aliasTarget))
            return this.memberType(aliasTarget, memberName, depth + 1);
        }
        return null;
      }
      template(templateText: Dynamic, depth: Dynamic): Dynamic {
        let combinations: Dynamic = [""],
          position: Dynamic = 0;
        for (; position < templateText.length; ) {
          let dollarIndex: Dynamic = templateText.indexOf("${", position);
          if (dollarIndex === -1) {
            let rest: Dynamic = templateText.slice(position);
            combinations = combinations.map((prefix?: Dynamic): Dynamic => prefix + rest);
            break;
          }
          let literalPart: Dynamic = templateText.slice(position, dollarIndex),
            expressionEnd: Dynamic = skipBalancedTypeExpression(templateText, dollarIndex + 1);
          if (expressionEnd === -1) return null;
          let expressionType: Dynamic = this.resolve(
            templateText.slice(dollarIndex + 2, expressionEnd - 1),
            depth + 1,
          );
          if (expressionType === null || expressionType.kind !== "enum") return null;
          let expressionOptions: Dynamic = expressionType.options ?? [];
          if (combinations.length * expressionOptions.length > maxTemplateCombinations)
            return null;
          combinations = combinations.flatMap(
            (prefix?: Dynamic): Dynamic =>
              expressionOptions.map(
                (option?: Dynamic): Dynamic => prefix + literalPart + option,
              ),
          );
          position = expressionEnd;
        }
        return combinations;
      }
      control(inferenceState: Dynamic, typeText: Dynamic): Dynamic {
        let literals: Dynamic = inferenceState.literals,
          isStringLike: Dynamic = inferenceState.str || inferenceState.node;
        if (literals.length > 0 && !isStringLike) {
          if (inferenceState.num && literals.length < fewNumberLiteralsLimit)
            return {
              kind: "string",
              typeName: conciseTypeDescription(typeText),
            };
          if (literals.length > maxEnumOptions)
            return {
              kind: "string",
              typeName: conciseTypeDescription(typeText),
            };
          let state: Dynamic = {
            kind: "enum",
            options: inferenceState.bool ? ["true", "false", ...literals] : literals,
          };
          inferenceState.bool
            ? (state.withBool = true)
            : inferenceState.numeric && (state.numeric = true);
          return state;
        }
        return isStringLike
          ? !inferenceState.str && inferenceState.other && inferenceState.unresolved.length === 0
            ? {
                kind: "string",
                typeName: "ReactNode",
              }
            : inferenceState.unresolved.length > 0
              ? {
                  kind: "string",
                  typeName: inferenceState.unresolved[0],
                }
              : {
                  kind: "string",
                }
          : inferenceState.num && !inferenceState.bool
            ? {
                kind: "number",
              }
            : inferenceState.bool && !inferenceState.num
              ? {
                  kind: "boolean",
                }
              : inferenceState.num && inferenceState.bool
                ? {
                    kind: "string",
                    typeName: conciseTypeDescription(typeText),
                  }
                : inferenceState.unresolved.length > 0
                  ? {
                      kind: "string",
                      typeName: inferenceState.unresolved[0],
                    }
                  : null;
      }
    };
    reservedPropNames = new Set([
      "ref",
      "key",
      "render",
      "style",
      "className",
      "id",
      "tabIndex",
      "role",
      "name",
      "form",
      "type",
      "value",
      "defaultValue",
      "suppressHydrationWarning",
    ]);
    ComponentsTypeInferenceTextsRsConfig = null;
    typeInferenceIncomplete = false;
  };
}

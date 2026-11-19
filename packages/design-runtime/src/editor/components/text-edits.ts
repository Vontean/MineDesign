/** 组件实例上可直接编辑的文字：从标签、属性里找出文字，并校验面板里的编辑。 */
import { isProtectedAttribute } from "../attribute-validation";
import { reservedImportAttributePattern, parseComponentImport } from "./imports";
import { maxTextPropLength } from "./props";

/** 事件处理属性：onClick、on-click、onclick 等。 */
const eventHandlerAttributePattern =
  /^on(-|[A-Z]|(click|dblclick|auxclick|contextmenu|change|input|beforeinput|submit|reset|invalid|focus|blur|focus(in|out)|key(down|up|press)|mouse(down|up|enter|leave|over|out|move)|pointer(down|up|enter|leave|over|out|move|cancel)|touch(start|end|move|cancel)|drag(start|end|enter|leave|over)?|drop|copy|cut|paste|wheel|scroll|resize|select|toggle|load|error|open|close|animation(start|end|iteration)|transition(start|end|run|cancel))$)/;
/** 只含一个数字、布尔或带引号字面量的 {{ ... }}。 */
const literalExpressionPattern =
  /^\s*\{\{\s*(?:(-?\d+(?:\.\d+)?|true|false)|(['"])([^{}]*)\2)\s*\}\}\s*$/;
const numberOrBooleanPattern = /^(-?\d+(\.\d+)?|true|false)$/;
/** 只由数字、小数点、逗号和空白组成的文字。 */
const numericLikeTextPattern = /^-?[\d.,\s]+$/;
/** 单段可编辑文字的最大长度。 */
const maxTextEditLength = 2e3;

/** 折叠空白并去掉首尾空白（含不换行空格）。 */
export function normalizeTextWhitespace(text: string): string {
  return text
    .replace(/[ \t\n\r\f ]*[ \t\n\r\f][ \t\n\r\f ]*/g, " ")
    .replace(/^[\s ]+|[\s ]+$/g, "");
}

/** 折叠空白，只去掉首尾各一个空格（不处理不换行空格）。 */
export function normalizeTextWords(text: string): string {
  return text.replace(/[ \t\n\r\f]+/g, " ").replace(/^ | $/g, "");
}

/**
 * 收集组件脚本字面量与属性值里出现的文字，用来判断模板里的文字来自哪里。
 * 嵌套最多 6 层，总共最多访问约 5000 个对象。
 */
export function collectTemplateTextValues(
  scriptTokens: Array<{ value?: unknown }>,
  props: { values: unknown; propsMeta: Record<string, { default?: unknown } | null | undefined> },
): Set<string> {
  const texts = new Set<string>();
  let budget = 5e3;
  const visit = (candidate: unknown, depth: number): void => {
    if (typeof candidate == "string") texts.add(normalizeTextWords(candidate));
    else if (typeof candidate == "number" && Number.isFinite(candidate)) texts.add(String(candidate));
    else if (candidate != null && typeof candidate == "object" && depth < 6 && --budget > 0)
      for (const child of Object.values(candidate)) visit(child, depth + 1);
  };
  for (const token of scriptTokens) visit(token.value, 0);
  visit(props.values, 0);
  for (const meta of Object.values(props.propsMeta)) visit(meta?.default, 1);
  return texts;
}

/** 一个组件实例标签的文字来源。 */
export interface ComponentTextSource {
  tag: string;
  attrs: Record<string, string>;
  /** 标签自己的文字节点（null 表示没有文字节点）。 */
  text: unknown;
  ownText: string;
  deepText: string[];
}

/** 可编辑的一段文字：words 是当前文字，key 标明它在标签里的位置。 */
export interface ComponentTextOption {
  words: string;
  key: string;
}

/**
 * 找出组件实例上能直接改的文字。
 * 文字只出现一次才可编辑；模板表达式拼出的文字、代码属性里的文字不在其内。
 */
export function componentTextOptions(
  source: ComponentTextSource,
  takenWords: { has(words: string): boolean },
): ComponentTextOption[] {
  const imported = parseComponentImport(source.tag, source.attrs);
  if (imported == null || imported.kind === "canvas") return [];
  // 同一段文字出现两次时 key 置为 null，表示无法唯一定位
  const keysByWords = new Map<string, string | null>();
  let hasDynamicText = false;
  let hasMixedTemplate = false;
  const record = (words: string, key: string | null): void => {
    if (words !== "") keysByWords.set(words, keysByWords.has(words) ? null : key);
  };
  const scan = (key: string | null, text: string, origin: "own" | "deep" | "handler" | "attr"): void => {
    const literal = literalExpressionPattern.exec(text);
    if (literal) {
      const bare = literal[1];
      return record(
        normalizeTextWords(
          bare == null ? (literal[3] ?? "") : bare === "true" || bare === "false" ? bare : String(Number(bare)),
        ),
        null,
      );
    }
    if (!text.includes("{{")) {
      const words = normalizeTextWords(text);
      return record(words, words.length > maxTextEditLength ? null : key);
    }
    if (origin !== "handler") hasDynamicText = true;
    const parts = text.split(/\{\{[^{}]*\}\}/);
    if (origin === "deep") for (const part of parts) record(normalizeTextWords(part), null);
    else if (parts.length > 2 || parts.some((part) => /[^\s{}]/.test(part))) hasMixedTemplate = true;
  };
  scan(source.text != null ? "__text" : null, source.ownText, "own");
  for (const text of source.deepText) scan(null, text, "deep");
  for (const [name, value] of Object.entries(source.attrs)) {
    if (name === "dc-props" || name === "dcProps") hasDynamicText = true;
    if (!reservedImportAttributePattern.test(name))
      scan(
        isProtectedAttribute("@" + name, [source.tag]) || numberOrBooleanPattern.test(value.trim())
          ? null
          : "@" + name,
        value,
        eventHandlerAttributePattern.test(name) ? "handler" : "attr",
      );
  }
  if (hasMixedTemplate) return [];
  const options: ComponentTextOption[] = [];
  for (const [words, key] of keysByWords)
    if (
      key != null &&
      !(
        hasDynamicText &&
        (words.length < 2 || numericLikeTextPattern.test(words) || takenWords.has(words))
      )
    )
      options.push({ words, key });
  return options;
}

export type ComponentTextEditResult =
  | { kind: "drop" }
  | { kind: "refuse" }
  | { kind: "toolong" }
  | { kind: "noop" }
  | { kind: "commit"; key: string; text: string };

/** 判断面板里对一段文字的编辑怎么处理；edit 必须对应 options 里的某一项。 */
export function normalizeComponentTextEdit(
  edit: { key?: unknown; words?: unknown } | null | undefined,
  nextText: unknown,
  textOptions: ComponentTextOption[],
): ComponentTextEditResult {
  if (edit == null || typeof edit != "object") return { kind: "drop" };
  const key = edit.key;
  const words = edit.words;
  if (typeof key != "string" || typeof words != "string" || typeof nextText != "string")
    return { kind: "drop" };
  if (!textOptions.some((option) => option.key === key && option.words === words))
    return { kind: "refuse" };
  if (nextText.length > maxTextPropLength) return { kind: "toolong" };
  const text = normalizeTextWhitespace(nextText);
  if (text.length > maxTextEditLength) return { kind: "toolong" };
  return text === "" || text === words ? { kind: "noop" } : { kind: "commit", key, text };
}

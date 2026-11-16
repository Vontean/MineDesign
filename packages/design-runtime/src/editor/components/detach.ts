import { uiMessage } from '@minedesign/contracts/ui-messages';
import { ClipboardTemplateFlatteningTrueFalseNullSet, flattenTemplateValues, getLoopTemplateVariables } from "../clipboard/template-flattening";
import { parseComponentImport } from "./imports";
import { getStyleProperty, parseStyleDeclarations, serializeStyleDeclarations } from "../css/declarations";
import { canContainHtmlTag } from "../html/authoring";

/** 编辑器模型里的元素编号。 */
type Tid = unknown;

/** 解除组件实例关联（detach）要读取的编辑器模型。 */
export interface DetachModel {
  isUneditable(tid: Tid): boolean;
  isLoopDriven(tid: Tid): boolean;
  inlineStyleAttr(tid: Tid): string;
  attributes(tid: Tid): Record<string, string>;
  childTids(tid: Tid | null): Tid[];
  element(tid: Tid): Element | null | undefined;
  parentTid(tid: Tid): Tid | null | undefined;
  tagName(tid: Tid): string | null | undefined;
}

/** 解除关联时额外要读取的文档内容。 */
export interface DetachContentModel extends DetachModel {
  helmetAssets(): { other?: unknown; assets?: unknown; atomics?: unknown };
  rootText(): string;
  subtreeHtml(tid: Tid): string | null | undefined;
}

export interface DetachContext {
  model: DetachContentModel;
  /** 组件当前的属性值。 */
  vals: Record<string, unknown>;
  /** 组件自己持有、不能内联的名字。 */
  held: string[];
}

export type DetachResult =
  | { blocked: string }
  | { html: string; assets: unknown; atomics: unknown };

// 以下提示语在初始化时按当前语言取得
var selectInstanceMessage: string;
var systemComponentMessage: string;
var codeComponentMessage: string;
var selfManagedMessage: string;
var repeatedInstanceMessage: string;
var takesValuesMessage: string;
var hasContentMessage: string;
var insideTextMessage: string;
var ThisInstanceCanTBeDetachedWhereMessage: string;
var CouldnTFindThisComponentSArtboardOnMessage: string;
var ThisInstanceIsnTShownOnTheMessage: string;
var CouldnTDetachThisInstanceRightNowMessage: string;
var PartsOfThisComponentCanTBeMessage: string;
/** 不作为 prop 内联的属性名。 */
var reservedAttributePattern: RegExp;
/** 实例上允许保留的定位类样式属性。 */
var positionStyleProps: Set<string>;
var helmetTagPattern: RegExp;
/** 整段就是一个 {{ 表达式 }}。 */
var wholeExpressionPattern: RegExp;
var expressionPattern: RegExp;
var numberLiteralPattern: RegExp;
var stringLiteralPattern: RegExp;
var kebabToCamel: (name: string) => string;

/** 属性值若是字面量表达式则取出字面量；含其他表达式时返回 undefined（不能内联）。 */
export function parseDetachablePropValue(raw: string): string | number | boolean | null | undefined {
  const expression = raw.match(wholeExpressionPattern)?.[1]?.trim();
  if (expression == null || expression.includes("{{"))
    return raw.includes("{{") ? undefined : raw;
  if (/[=!]=/.test(expression)) return;
  if (expression === "true" || expression === "false") return expression === "true";
  if (expression === "null") return null;
  if (numberLiteralPattern.test(expression)) return Number(expression);
  const quoted = expression.match(stringLiteralPattern);
  return quoted ? (quoted[1] ?? quoted[2]) : undefined;
}

/** 这个实例不能解除关联的原因（给人看的提示）；可以解除时返回 undefined。 */
export function detachComponentRefusal(model: DetachModel, tid: Tid): string | undefined {
  if (model.isUneditable(tid)) return selfManagedMessage;
  if (model.isLoopDriven(tid)) return repeatedInstanceMessage;
  if (
    parseStyleDeclarations(model.inlineStyleAttr(tid)).some(
      (declaration: { prop: string; value: string }) =>
        !positionStyleProps.has(declaration.prop) && (declaration.prop + declaration.value).includes("{{"),
    ) ||
    /(^|;)\s*\{\{[^:;]*\}\}\s*(;|$)/.test(model.inlineStyleAttr(tid)) ||
    Object.values(model.attributes(tid)).some((value) => parseDetachablePropValue(value) === undefined)
  )
    return takesValuesMessage;
  if (model.childTids(tid).length > 0 || (model.element(tid)?.textContent ?? "").trim() !== "")
    return hasContentMessage;
  let parent = model.parentTid(tid);
  // 条件与循环标签不占位置，跳到真正的父元素
  while (parent != null && /^sc-(if|for)$/.test(model.tagName(parent) ?? "")) parent = model.parentTid(parent);
  if (
    (parent != null && !canContainHtmlTag(model.tagName(parent) ?? "", "div")) ||
    model.element(tid)?.closest("p")
  )
    return insideTextMessage;
  return undefined;
}

export function isDetachableDcImport(model: DetachModel, tid: Tid): boolean {
  return model.tagName(tid) === "dc-import" && detachComponentRefusal(model, tid) === undefined;
}

/** 选中的元素里没有一个能解除关联时，说明原因；有能解除的则返回 undefined。 */
export function selectionDetachRefusal(model: DetachModel, tids: Tid[]): string | undefined {
  if (tids.some((tid) => isDetachableDcImport(model, tid))) return;
  for (const tid of tids) if (model.tagName(tid) === "dc-import") return detachComponentRefusal(model, tid);
  const kinds = tids.map((tid) => parseComponentImport(model.tagName(tid) as string, model.attributes(tid))?.kind);
  return kinds.includes("system")
    ? systemComponentMessage
    : kinds.includes("module")
      ? codeComponentMessage
      : selectInstanceMessage;
}

export function importedComponentName(attributes: { name?: string; component?: string }): string {
  return attributes.name || attributes.component || "";
}

/** 把实例上的属性转成 prop 值（属性名从 kebab 转 camel），跳过保留属性与不能内联的值。 */
export function detachableComponentProps(attributes: Record<string, string>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [name, raw] of Object.entries(attributes)) {
    if (reservedAttributePattern.test(name)) continue;
    const value = parseDetachablePropValue(raw);
    if (value !== undefined) props[kebabToCamel(name)] = value;
  }
  return props;
}

/** 选中的元素（含后代）里是否有 flex/grid 容器直接带着拼接了文字的模板文本。 */
export function selectionUsesFlexGrid(model: DetachModel, tids: Tid[]): boolean {
  return tids.some((tid) => {
    const element = model.element(tid);
    const isFlexOrGrid = /^(inline-)?(flex|grid)$/.test(
      getStyleProperty(element?.getAttribute("style"), "display")
        .replace(/!important/i, "")
        .trim()
        .toLowerCase(),
    );
    const hasMixedTemplateText = [...(element?.childNodes ?? [])].some((node) => {
      const text = node.nodeType === 3 ? (node.nodeValue ?? "") : "";
      return (
        /\{\{/.test(text) &&
        (text.replace(expressionPattern, "").trim() !== "" || (text.match(expressionPattern)?.length ?? 0) > 1)
      );
    });
    return (isFlexOrGrid && hasMixedTemplateText) || selectionUsesFlexGrid(model, model.childTids(tid));
  });
}

/** 模板里是否还有无法求值的 {{ 表达式 }}（字面量与布尔、null 不算）。 */
export function hasUnresolvedTemplateExpression(html: string): boolean {
  for (const match of html.replace(/<\!--[\s\S]*?-->/g, "").matchAll(expressionPattern)) {
    const expression = (match[1] ?? "").trim();
    if (
      !ClipboardTemplateFlatteningTrueFalseNullSet.has(expression) &&
      !numberLiteralPattern.test(expression) &&
      !stringLiteralPattern.test(expression)
    )
      return true;
  }
  return false;
}

/**
 * 把一个 dc-import 实例展开成它的组件内容（解除关联）。
 * 返回新的 HTML 与随带的素材，或不能解除的原因。
 */
export function detachImportedComponent(model: DetachModel, tid: Tid, context: DetachContext): DetachResult {
  if (!isDetachableDcImport(model, tid))
    return { blocked: selectionDetachRefusal(model, [tid]) ?? selectInstanceMessage };
  const attributes = model.attributes(tid);
  const helmet = context.model.helmetAssets();
  const rootTids = context.model
    .childTids(null)
    .filter((child) => !helmetTagPattern.test(context.model.tagName(child) ?? ""));
  const componentHtml = rootTids
    .map((child) => context.model.subtreeHtml(child))
    .filter((html) => html != null)
    .join(`
`);
  if (
    helmet.other ||
    componentHtml === "" ||
    context.model.rootText().trim() !== "" ||
    selectionUsesFlexGrid(context.model, rootTids)
  )
    return { blocked: PartsOfThisComponentCanTBeMessage };
  const props = detachableComponentProps(attributes);
  const { vals, held } = context;
  const loopVariables = getLoopTemplateVariables(componentHtml);
  const flattened = flattenTemplateValues(componentHtml, (name: string): unknown => {
    if (!(name.startsWith("$") || ClipboardTemplateFlatteningTrueFalseNullSet.has(name) || loopVariables.has(name) || held.includes(name)))
      return Object.hasOwn(vals, name) ? vals[name] : Object.hasOwn(props, name) ? props[name] : undefined;
  });
  if (hasUnresolvedTemplateExpression(flattened)) return { blocked: PartsOfThisComponentCanTBeMessage };
  const wrapper = document.createElement("div");
  const style = serializeStyleDeclarations(
    parseStyleDeclarations(model.inlineStyleAttr(tid)).filter((declaration: { prop: string }) =>
      positionStyleProps.has(declaration.prop),
    ),
  );
  if (style) wrapper.setAttribute("style", style);
  wrapper.setAttribute("data-om-label", attributes["data-om-label"] || importedComponentName(attributes) || "Component");
  const template = document.createElement("template");
  template.content.appendChild(wrapper);
  const wrapperHtml = template.innerHTML;
  return {
    html:
      wrapperHtml.slice(0, wrapperHtml.length - 6) +
      `
` +
      flattened +
      `
</div>`,
    assets: helmet.assets,
    atomics: helmet.atomics,
  };
}

export {
  selectInstanceMessage,
  CouldnTDetachThisInstanceRightNowMessage,
  CouldnTFindThisComponentSArtboardOnMessage,
  PartsOfThisComponentCanTBeMessage,
  ThisInstanceCanTBeDetachedWhereMessage,
  ThisInstanceIsnTShownOnTheMessage,
};
export function installEditorComponentsDetach(): () => void {
  return () => {
    selectInstanceMessage = uiMessage("inspector.detach.selectAComponentInstanceTo");
    systemComponentMessage = uiMessage("inspector.detach.designSystemComponentsCanT");
    codeComponentMessage = uiMessage("inspector.detach.codeComponentsCanTBe");
    selfManagedMessage = uiMessage("inspector.detach.thisComponentManagesItselfSo");
    repeatedInstanceMessage = uiMessage("inspector.detach.aRepeatedInstanceCanT");
    takesValuesMessage = uiMessage("inspector.detach.thisInstanceTakesValuesFrom");
    hasContentMessage = uiMessage("inspector.detach.anInstanceWithContentOf");
    insideTextMessage = uiMessage("inspector.detach.anInstanceInsideTextOr");
    ThisInstanceCanTBeDetachedWhereMessage = uiMessage("inspector.detach.thisInstanceCanTBe");
    CouldnTFindThisComponentSArtboardOnMessage = uiMessage("inspector.detach.couldnTFindThisComponent");
    ThisInstanceIsnTShownOnTheMessage = uiMessage("inspector.detach.thisInstanceIsnTShown");
    CouldnTDetachThisInstanceRightNowMessage = uiMessage("inspector.detach.couldnTDetachThisInstance");
    PartsOfThisComponentCanTBeMessage = uiMessage("inspector.detach.partsOfThisComponentCan");
    reservedAttributePattern =
      /^(name|component|style|sc-name|hint-size|dc-props|dcProps|key|ref|children|style-.*)$/;
    positionStyleProps = new Set([
      "position",
      "left",
      "right",
      "top",
      "bottom",
      "inset",
      "width",
      "height",
      "z-index",
      "transform",
    ]);
    helmetTagPattern = /^(helmet|script|style|template|link|meta|title)$/;
    wholeExpressionPattern = /^\s*\{\{([\s\S]+?)\}\}\s*$/;
    expressionPattern = /\{\{([\s\S]*?)\}\}/g;
    numberLiteralPattern = /^-?\d+(\.\d+)?$/;
    stringLiteralPattern = /^(?:'([^']*)'|"([^"]*)")$/;
    kebabToCamel = (name: string): string => name.replace(/-([a-z])/g, (_match: string, letter: string) => letter.toUpperCase());
  };
}

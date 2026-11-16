/** 把类型推断结果转成属性元数据，并识别模板里的属性引用。 */
import type { PropMetadata } from './props';
import { convertInferredEnumValue } from './type-inference';

/** 类型推断得到的一个属性。 */
export interface InferredProp {
  name?: string;
  kind?: string;
  options?: unknown[];
  numeric?: boolean;
  withBool?: boolean;
  typeName?: string;
  default?: unknown;
  [key: string]: unknown;
}

/** 匹配只含一个标识符的 {{ name }}。 */
export const templatePropReferencePattern = /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g;
/** 匹配任意 {{ ... }} 表达式。 */
export const templateExpressionPattern = /\{\{[\s\S]*?\}\}/g;

export function inferredTypeToPropMetadata(source: InferredProp): PropMetadata {
  const metadata: PropMetadata =
    source.kind === 'enum'
      ? {
          editor: 'enum',
          options: (source.options ?? []).map((option) => convertInferredEnumValue(source, option)),
        }
      : source.kind === 'boolean'
        ? { editor: 'boolean' }
        : source.kind === 'number'
          ? { editor: 'float' }
          : {
              editor: 'text',
              ...(source.typeName !== undefined ? { tsType: source.typeName } : {}),
            };
  if (source.default !== undefined) metadata.default = source.default;
  return metadata;
}

export function inferredPropsMetadata(props: InferredProp[]): Record<string, PropMetadata> {
  return Object.fromEntries(
    props.map((prop): [string | undefined, PropMetadata] => [prop.name, inferredTypeToPropMetadata(prop)]),
  );
}

/**
 * 取出模板文本里引用的属性名。
 * 文本里夹有其他表达式时返回空；wholeOnly 时要求整段文本就是一个引用。
 */
export function templatePropReferences(template: string, wholeOnly = false): string[] {
  const names = [...template.matchAll(templatePropReferencePattern)].map((match) => match[1]);
  if (names.length !== (template.match(templateExpressionPattern)?.length ?? 0)) return [];
  if (
    wholeOnly &&
    (names.length !== 1 || template.replace(templatePropReferencePattern, '').trim() !== '')
  )
    return [];
  return names;
}

/** 能读取标签名与属性的文档视图。 */
export interface ComponentDocumentView<Node> {
  tagName(node: Node): string;
  attributes(node: Node): Record<string, string | undefined>;
}

/** 绑定到某个 dc-import 的属性是否都能在面板里直接编辑。 */
export function canEditBoundComponentProps<Node>(
  document: ComponentDocumentView<Node>,
  node: Node,
  componentName: unknown,
  propNames: string[],
  editableProps: { has(name: string): boolean },
): boolean {
  if (propNames.length === 0 || document.tagName(node) !== 'dc-import') return false;
  const attributes = document.attributes(node);
  return (
    (attributes.name ?? attributes.component) === componentName &&
    propNames.every((name) => editableProps.has(name))
  );
}

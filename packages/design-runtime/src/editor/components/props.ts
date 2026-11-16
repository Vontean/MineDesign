/** 组件属性的元数据：一个属性在界面里怎样编辑、默认值是什么。 */

/** 单个属性的元数据（来自 data-props 或类型推断）。 */
export interface PropMetadata {
  editor?: string;
  default?: unknown;
  [key: string]: unknown;
}

export type PropMetadataMap = Record<string, PropMetadata>;

/** 文本属性在面板里编辑时允许的最大长度。 */
export const maxTextPropLength = 16 * 1024;

export interface PropsMetadataParseResult {
  changed: boolean;
  next: Record<string, unknown> | undefined;
}

/**
 * 把属性值整理成可写回的形式：通过 resolve 取得规范化的字符串值，
 * 与元数据里的默认值相同的属性被省略（keepConverged 时保留）。
 */
export function parseComponentPropsMetadata(
  props: Record<string, unknown>,
  metadataJson: string | undefined,
  resolve: (name: string) => unknown,
  flags?: { keepConverged?: boolean },
): PropsMetadataParseResult {
  let metadata: Record<string, unknown> | null = null;
  if (metadataJson !== undefined)
    try {
      const parsed = JSON.parse(metadataJson);
      if (parsed != null && typeof parsed == 'object' && !Array.isArray(parsed))
        metadata = parsed;
    } catch {}
  let changed = false;
  const next: Record<string, unknown> = {};
  for (const [name, original] of Object.entries(props)) {
    const resolved = resolve(name);
    if (typeof resolved != 'string') {
      next[name] = original;
      continue;
    }
    const entry = metadata && Object.hasOwn(metadata, name) ? metadata[name] : null;
    const defaultValue =
      entry != null && typeof entry == 'object' ? (entry as PropMetadata).default : undefined;
    if (resolved === defaultValue && flags?.keepConverged !== true) {
      changed = true;
      continue;
    }
    if (resolved !== original) changed = true;
    next[name] = resolved;
  }
  return {
    changed,
    next: Object.keys(next).length > 0 ? next : undefined,
  };
}

/** 把默认值写入已声明的属性；没声明的属性不新增。 */
export function applyComponentPropDefaults(
  metadata: PropMetadataMap,
  defaults: Record<string, unknown>,
): PropMetadataMap {
  const next: PropMetadataMap = { ...metadata };
  for (const [name, defaultValue] of Object.entries(defaults))
    if (Object.hasOwn(next, name))
      next[name] = { ...next[name], default: defaultValue };
  return next;
}

export type PropEditResult =
  | { kind: 'drop' }
  | { kind: 'refuse' }
  | { kind: 'noop' }
  | { kind: 'toolong' }
  | { kind: 'commit'; prop: string; text: string };

/**
 * 判断面板里的一次文本编辑怎么处理：
 * 丢弃、拒绝（属性不是文本或原文已变）、无变化、过长、提交。
 */
export function normalizeComponentPropEdit(
  edit: { prop?: unknown; value?: unknown } | null | undefined,
  nextText: string | null | undefined,
  metadata: PropMetadataMap,
  values: Record<string, unknown>,
): PropEditResult {
  if (edit == null || typeof edit != 'object') return { kind: 'drop' };
  const prop = edit.prop;
  const original = edit.value;
  if (nextText != null && typeof nextText != 'string') return { kind: 'drop' };
  if (typeof prop != 'string' || typeof original != 'string') return { kind: 'drop' };
  const entry = Object.hasOwn(metadata, prop) ? metadata[prop] : undefined;
  const current = Object.hasOwn(values, prop) ? values[prop] : entry?.default;
  if (!entry || entry.editor !== 'text' || typeof current != 'string') return { kind: 'refuse' };
  if (current !== original) return { kind: 'refuse' };
  const text = nextText ?? '';
  if (text === current) return { kind: 'noop' };
  if (text.length > maxTextPropLength) return { kind: 'toolong' };
  return { kind: 'commit', prop, text };
}

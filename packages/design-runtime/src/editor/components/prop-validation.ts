/** 组件属性（data-props 元数据与属性值）的校验、截断与比较。 */
import { maxTextPropLength } from "./props";

type PlainRecord = Record<string, unknown>;

/** 元数据里最多读取多少个属性。 */
const maxPropEntries = 128;
/** 属性名与元数据字段名的最大长度。 */
const maxPropKeyLength = 256;
/** 单个属性的元数据最多读取多少个字段。 */
const maxMetadataFields = 32;
/** enum 的选项最多读取多少个。 */
const maxEnumOptions = 64;
/** 数组形式的选项（如 [值, 标签]）最多读取的项数。 */
const maxOptionArrayLength = 5;
/** 选项字符串的最大长度。 */
const maxOptionStringLength = 256;
/** 元数据里其他字符串字段的最大长度。 */
const maxMetadataStringLength = 4096;
/** 属性值（含默认值）的体积预算，按字符与结构粗略计数。 */
const maxPropValueBudget = 16 * 1024;
/** 属性值允许的嵌套深度。 */
const maxPropValueDepth = 64;
const numericMetadataKeys = new Set(["min", "max", "step"]);

export function normalizePropString(value: unknown): string {
  return typeof value == "string" && value.length <= maxPropKeyLength ? value : "";
}

/** 按码点截断，避免把一个字符切成两半。 */
export function truncatePropText(text: string, maxLength: number): string {
  return text.length > maxLength ? [...text.slice(0, maxLength)].join("") : text;
}

export function finitePropNumber(value: unknown): number | undefined {
  const number =
    typeof value == "number"
      ? value
      : typeof value == "string" && value.trim() !== ""
        ? Number(value)
        : NaN;
  return Number.isFinite(number) ? number : undefined;
}

export type PropOptionValue = string | number | boolean | null;

export function normalizePropOptionValue(value: unknown): PropOptionValue {
  return typeof value == "string"
    ? truncatePropText(value, maxOptionStringLength)
    : value === null || typeof value == "number" || typeof value == "boolean"
      ? value
      : "";
}

/** 只处理前 limit 项，再逐项转换。 */
export function mapBoundedArray<Item, Result>(
  items: ArrayLike<Item>,
  limit: number,
  convert: (item: Item) => Result,
): Result[] {
  const count = Math.min(items.length, limit);
  const result: Result[] = [];
  for (let index = 0; index < count; index++) result.push(convert(items[index]));
  return result;
}

export type PropOption = PropOptionValue | PropOptionValue[] | { value: PropOptionValue; label?: PropOptionValue };

export function normalizePropOption(option: unknown): PropOption {
  if (Array.isArray(option))
    return mapBoundedArray(option, maxOptionArrayLength, normalizePropOptionValue);
  if (option !== null && typeof option == "object" && "value" in option) {
    const record = option as { value?: unknown; label?: unknown };
    return {
      value: normalizePropOptionValue(record.value),
      ...("label" in record ? { label: normalizePropOptionValue(record.label) } : {}),
    };
  }
  return normalizePropOptionValue(option);
}

/** 剩余体积预算；每检查一个值就扣减。 */
export interface PropBudget {
  left: number;
}

/**
 * 检查一个属性值是否在预算与深度内，只允许纯对象和数组，拒绝循环引用。
 * 通过时返回 true；预算沿途被扣减。
 */
export function chargePropObjectBudget(
  value: unknown,
  budget: PropBudget,
  seen: { has(value: object): boolean; add(value: object): unknown },
  depth = 0,
): boolean {
  if (budget.left <= 0) return false;
  switch (typeof value) {
    case "string":
      budget.left -= value.length + 2;
      break;
    case "number":
      budget.left -= 8;
      break;
    case "boolean":
    case "undefined":
      budget.left -= 4;
      break;
    case "object":
      if (value === null) {
        budget.left -= 4;
        break;
      }
      if (depth >= maxPropValueDepth || seen.has(value)) return false;
      budget.left -= 2;
      if (Array.isArray(value)) {
        seen.add(value);
        for (const item of value) {
          budget.left -= 1;
          if (!chargePropObjectBudget(item, budget, seen, depth + 1)) return false;
        }
        // 数组上除下标外的自有属性一律不接受
        for (const key in value)
          if (Object.hasOwn(value, key) && !isBoundedArrayIndex(key, value.length)) return false;
      } else if (isPlainPropRecord(value)) {
        seen.add(value);
        for (const key in value)
          if (
            Object.hasOwn(value, key) &&
            ((budget.left -= key.length + 3),
            !chargePropObjectBudget(value[key], budget, seen, depth + 1))
          )
            return false;
      } else return false;
      break;
    default:
      return false;
  }
  return budget.left > 0;
}

export function isPlainPropRecord(value: unknown): value is PlainRecord {
  if (value === null || typeof value != "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** key 是否是小于 length 的规范数组下标（最多 10 位，无前导零）。 */
export function isBoundedArrayIndex(key: string, length: number): boolean {
  return key.length === 0 || key.length > 10 || !(key === "0" || /^[1-9][0-9]*$/.test(key))
    ? false
    : Number(key) < length;
}

export function isPrimitiveProp(value: unknown): value is string | number | boolean | null {
  const type = typeof value;
  return value === null || type === "string" || type === "number" || type === "boolean";
}

/** 过长或会撞上 Object.prototype 成员的键不接受。 */
export function isUnsafePropKey(key: string): boolean {
  return key.length > maxPropKeyLength || key in Object.prototype;
}

/** 整理单个属性的元数据：丢弃不安全的键与过大的值，截断字符串，数字字段转数字。 */
export function normalizePropMetadata(
  metadata: PlainRecord,
  seen: { has(value: object): boolean; add(value: object): unknown },
): PlainRecord {
  const result: PlainRecord = {};
  let count = 0;
  for (const key in metadata) {
    if (!Object.hasOwn(metadata, key)) continue;
    if (count++ >= maxMetadataFields) break;
    if (isUnsafePropKey(key)) continue;
    const value = metadata[key];
    if (key === "default" || key === "options") result[key] = value;
    else if (numericMetadataKeys.has(key)) {
      const number = finitePropNumber(value);
      if (number !== undefined && (key !== "step" || number > 0)) result[key] = number;
    } else if (typeof value == "string")
      result[key] = truncatePropText(value, maxMetadataStringLength);
    else if (isPrimitiveProp(value)) result[key] = value;
  }
  if ("options" in result)
    result.options = Array.isArray(result.options)
      ? mapBoundedArray(result.options, maxEnumOptions, normalizePropOption)
      : [];
  if ("default" in result) {
    if (typeof result.default == "string")
      result.default = truncatePropText(result.default, maxTextPropLength);
    else if (!chargePropObjectBudget(result.default, { left: maxPropValueBudget }, seen))
      delete result.default;
  }
  return result;
}

/** 整理一组属性值：字符串截断，复杂值超预算则丢弃。 */
export function normalizePropValues(values: PlainRecord): PlainRecord {
  const result: PlainRecord = {};
  const seen = new WeakSet([values]);
  for (const [key, value] of Object.entries(values)) {
    if (isUnsafePropKey(key)) continue;
    if (typeof value == "string") result[key] = truncatePropText(value, maxTextPropLength);
    else if (chargePropObjectBudget(value, { left: maxPropValueBudget }, seen))
      result[key] = value;
  }
  return result;
}

/** 整理 data-props 解析出的整份元数据；格式不对返回空对象。 */
export function parsePropsMetadata(input: unknown): Record<string, PlainRecord> {
  if (!isPlainPropRecord(input)) return {};
  const result: Record<string, PlainRecord> = {};
  const seen = new WeakSet([input]);
  let count = 0;
  for (const key in input) {
    if (!Object.hasOwn(input, key)) continue;
    if (count++ >= maxPropEntries) break;
    if (isUnsafePropKey(key)) continue;
    const entry = input[key];
    if (!isPlainPropRecord(entry) || seen.has(entry)) continue;
    seen.add(entry);
    result[key] = normalizePropMetadata(entry, seen);
  }
  return result;
}

export function equalPropValues(a: unknown, b: unknown): boolean {
  return (
    a === b ||
    (typeof a == "object" && typeof b == "object" && JSON.stringify(a) === JSON.stringify(b))
  );
}

/** 一个属性当前的值：已设置的值优先，否则取元数据默认值。 */
export function getPropCurrentValue(
  state: { values: PlainRecord; propsMeta: Record<string, { default?: unknown } | undefined> },
  name: string,
): unknown {
  return Object.hasOwn(state.values, name) ? state.values[name] : state.propsMeta[name]?.default;
}

/** 保存前的默认值判断：与当前默认值相同（且不在保存中）时返回 undefined 表示不覆盖。 */
export function overridePropDefault(
  state: { isSaving(): boolean; currentDefault(name: string): unknown },
  name: string,
  value: unknown,
): unknown {
  return !state.isSaving() && equalPropValues(value, state.currentDefault(name)) ? undefined : value;
}

/** 去掉与默认值相同的属性；没有需要去掉的就返回原对象。 */
export function omitUnchangedProps(props: PlainRecord, defaults: PlainRecord): PlainRecord {
  let copy: PlainRecord | null = null;
  for (const [name, defaultValue] of Object.entries(defaults))
    if (Object.hasOwn(props, name) && equalPropValues(props[name], defaultValue)) {
      copy ??= { ...props };
      delete copy[name];
    }
  return copy ?? props;
}

export function isEditablePropMetadata(metadata: unknown): boolean {
  if (!metadata) return false;
  const editor = (metadata as { editor?: unknown }).editor;
  return (
    editor === "text" ||
    editor === "color" ||
    editor === "int" ||
    editor === "float" ||
    editor === "range" ||
    editor === "boolean" ||
    editor === "enum"
  );
}

/** 没有可用组件实例时 useDcProps 返回的空状态。 */
export const emptyDcPropsState = {
  booted: false,
  hasProps: false,
  lifecycleCallbacks: {
    onDcBooted: (): void => {},
  },
  propsMeta: {},
  values: {},
  setProp: (): void => {},
  reset: (): void => {},
  dirty: false,
  saveAsDefaults: async (): Promise<void> => {},
  adoptSavedDefaults: (): void => {},
  saving: false,
  isSaving: (): boolean => false,
  currentDefault: (): undefined => {},
};

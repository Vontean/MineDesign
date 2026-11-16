import type { EditableLength } from "../contracts/token-editors";

/** 可编辑的 CSS 长度：数字加可选单位（px、rem、em、%） */
export const EDITABLE_CSS_LENGTH_PATTERN = /^(-?\d+(?:\.\d+)?)(px|rem|em|%)?$/;
export const MAX_EDITABLE_CSS_LENGTH = 9999;

/** 无单位的 "0" 补成 px，其他无单位输入保持空单位 */
export function parseEditableCssLength(value: string): EditableLength | null {
  const match = EDITABLE_CSS_LENGTH_PATTERN.exec(value.trim());
  if (match === null) {
    return null;
  }
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return {
    n: amount,
    unit: match[2] ?? (value.trim() === "0" ? "px" : ""),
  };
}

/** px 与 % 按整数步进，其余单位按 0.05 */
export function cssLengthInputStep(unit: string): number {
  if (unit === "px" || unit === "%") {
    return 1;
  } else {
    return 0.05;
  }
}

/** 把以 px 计的上下限换算到输入框当前单位（1rem = 16px） */
export function cssLengthInputBounds(
  unit: string,
  minimum: number,
  maximum: number,
): [number, number] {
  switch (unit) {
    case "rem":
    case "em":
      return [minimum / 16, maximum / 16];
    case "%":
      return [(minimum * 100) / 16, (maximum * 100) / 16];
    default:
      return [minimum, maximum];
  }
}

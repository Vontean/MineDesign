/** 解析 dc-import / x-import 标签：它引用的是哪个组件。 */
import { initializeEditorAttributeValidation } from "../attribute-validation";

/** 组件引用：canvas 为同级画板，system 为设计系统组件，module 为外部模块。 */
export interface ComponentImport {
  kind: "canvas" | "system" | "module";
  ref: string;
  name: string;
  scope?: string;
}

/** 导入标签的属性（属性名到字符串值）。 */
export type ImportAttributes = Record<string, string | undefined>;

/** 导入标签上不会被当作组件 prop 的属性名。 */
var reservedImportAttributePattern: RegExp;

export function parseComponentImport(tagName: string, attributes: ImportAttributes): ComponentImport | null {
  if (tagName !== "dc-import" && tagName !== "x-import") return null;
  const isCanvasImport = tagName === "dc-import";
  const globalScopeRef = attributes["component-from-global-scope"] || "";
  const component = attributes.component || "";
  const ref = isCanvasImport
    ? attributes.name || component
    : globalScopeRef || (attributes.from != null ? component : "");
  if (
    ((attributes.from || "") + " " + globalScopeRef + " " + component)
      .toLowerCase()
      .includes("deck-stage") ||
    ref.toLowerCase() === "image-slot"
  )
    return null;
  const separatorIndex = ref.lastIndexOf(isCanvasImport ? "/" : ".");
  const name = ref.slice(separatorIndex + 1);
  if (name === "" || ref.includes("{{")) return null;
  const result: ComponentImport = {
    kind: isCanvasImport
      ? "canvas"
      : attributes.from == null && globalScopeRef.includes(".")
        ? "system"
        : "module",
    ref,
    name,
  };
  const prefix = ref.slice(0, Math.max(separatorIndex, 0));
  const scope = isCanvasImport
    ? prefix
        .split("/")
        .filter((part) => part !== "" && part !== "." && part !== "..")
        .join("/")
    : prefix;
  if (scope !== "") result.scope = scope;
  return result;
}

/** 一组引用都指向同一个组件时返回它；有任一为空则整体为 null。 */
export function sharedComponentImport(
  imports: Array<ComponentImport | null | undefined>,
): { shared: ComponentImport | null } | null {
  const first = imports[0];
  if (first == null || imports.some((item) => item == null)) return null;
  return {
    shared: imports.every((item) => item!.kind === first.kind && item!.ref === first.ref) ? first : null,
  };
}

export { reservedImportAttributePattern };
export function installEditorComponentsImports(): () => void {
  return () => {
    reservedImportAttributePattern =
      /^(component(-from-global-scope|FromGlobalScope)?|from|dc-props|dcProps|sc-name|hint-size|hintSize|style-.*|data-(dc|om)-.*)$/;
    initializeEditorAttributeValidation();
  };
}

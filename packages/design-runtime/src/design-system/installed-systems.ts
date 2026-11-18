/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignSystemPathsConstant, DesignSystemPathsConstant_2, DesignSystemPathsConstant_3, DesignSystemPathsPattern_2, DesignSystemPathsPattern_3, DesignSystemPathsResolvedValue_2, designSystemProjectPrefix, isDesignSystemNamespace } from "./paths";

var normalizeDisplayText: Dynamic;
function parseInstalledDesignSystems(input?: Dynamic): Dynamic {
  let value: Dynamic = input?.designSystems,
    value2: Dynamic = Array.isArray(value)
      ? value
      : typeof value == "object" && value !== null
        ? Object.values(value)
        : [],
    entries: Dynamic = new Map();
  for (let value3 of value2 as Dynamic) {
    if (typeof value3 != "object" || value3 === null || Array.isArray(value3))
      continue;
    let value4: Dynamic = value3,
      value5: Dynamic = normalizeDisplayText(
        value4.title,
        DesignSystemPathsConstant_2,
        DesignSystemPathsPattern_3,
      ),
      value6: Dynamic = normalizeDisplayText(
        value4.artifact,
        DesignSystemPathsConstant_3,
      );
    !isDesignSystemNamespace(value4.namespace) ||
      value5 === undefined ||
      value6 === undefined ||
      entries.set(value4.namespace, {
        title: value5,
        namespace: value4.namespace,
        artifact: value6,
        version:
          normalizeDisplayText(
            value4.version,
            DesignSystemPathsConstant_2,
          ) ?? null,
        copiedAt: normalizeDisplayText(value4.copiedAt, 40) ?? "",
        ...(value4.unpinned === true
          ? {
              unpinned: true,
            }
          : {}),
      });
  }
  return [...entries.values()].slice(0, DesignSystemPathsConstant);
}
function designSystemTokensPath(input?: Dynamic): Dynamic {
  return designSystemProjectPrefix(input) + "tokens.json";
}
function readInstalledDesignSystemTokens(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let items: Dynamic = [];
  for (let value4 of parseInstalledDesignSystems(input) as Dynamic) {
    let value5: Dynamic = options(designSystemTokensPath(value4.namespace));
    if (
      !(
        value5 === undefined ||
        value5.length > DesignSystemPathsResolvedValue_2
      )
    )
      try {
        let value6: Dynamic = JSON.parse(value5);
        typeof value6 == "object" &&
          value6 !== null &&
          items.push({
            title: value4.title,
            tokens: value6,
          });
      } catch {
        continue;
      }
  }
  if (items.length === 0) return;
  let value: Dynamic =
      typeof context == "object" && context !== null ? context : {},
    callback: Dynamic = (input2?: Dynamic): Dynamic =>
      typeof input2 == "object" && input2 !== null,
    value2: Dynamic = Array.isArray(value.systems)
      ? value.systems
      : value.systems === undefined &&
          (callback(value.color) || callback(value.type))
        ? [
            {
              tokens: context,
            },
          ]
        : undefined,
    value3: Dynamic = Array.isArray(value2)
      ? value2.filter(
          (input2?: Dynamic): Dynamic =>
            !items.some(
              (input3?: Dynamic): Dynamic => input3.title === input2?.title,
            ),
        )
      : [];
  return {
    v: 1,
    systems: [...items, ...value3],
  };
}
export {
  designSystemTokensPath,
  normalizeDisplayText,
  parseInstalledDesignSystems,
  readInstalledDesignSystemTokens,
};
export function installDesignSystemInstalledSystems(): () => void {
  return () => {
    normalizeDisplayText = (
      items?: Dynamic,
      options?: Dynamic,
      context: Dynamic = DesignSystemPathsPattern_2,
    ): Dynamic =>
      typeof items == "string" &&
      items.trim() !== "" &&
      items.length <= options &&
      !context.test(items)
        ? items.trim()
        : undefined;
  };
}

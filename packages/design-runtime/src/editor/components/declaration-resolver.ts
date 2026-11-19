/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComponentsTypeInferenceLimit, ComponentsTypeInferenceLimit_5 as typeInferenceMaxDepth, ComponentsTypeInferenceSubscribers_2 as reservedPropNames, ComponentsTypeInferenceTextsRsConfig, inferJSDocDefault, isValidTypeDeclarationName, TYPE_INFERENCE_OVER_BUDGET, TypeDeclarationResolver, typeExpressionReferences } from "./type-inference";

import { set_ComponentsTypeInferenceTextsRsConfig, set_typeInferenceIncomplete } from "./type-inference";
var ComponentsDeclarationResolverNameTypeValueValues: Dynamic;
var ComponentsDeclarationResolverDelayMs: Dynamic;
var ComponentsDeclarationResolverLimit: Dynamic;
var ComponentsDeclarationResolverElementCache: Dynamic;
function getTypeDeclarationResolver(items?: Dynamic): Dynamic {
  if (
    ComponentsTypeInferenceTextsRsConfig !== null &&
    ComponentsTypeInferenceTextsRsConfig.texts.length ===
      items.length &&
    ComponentsTypeInferenceTextsRsConfig.texts.every(
      (text?: Dynamic, index?: Dynamic): Dynamic =>
        text === items[index],
    )
  )
    return ComponentsTypeInferenceTextsRsConfig.rs.reuse();
  let resolver: Dynamic = new TypeDeclarationResolver(items);
  set_ComponentsTypeInferenceTextsRsConfig({
    texts: items,
    rs: resolver,
  });
  return resolver;
}
function inferComponentProps(
  componentName?: Dynamic,
  sourceTexts?: Dynamic,
  inferOptions?: Dynamic,
): Dynamic {
  set_typeInferenceIncomplete(false);
  let nonEmptyTexts: Dynamic = sourceTexts.filter(
    (text?: Dynamic): Dynamic => typeof text == "string" && text !== "",
  );
  if (!isValidTypeDeclarationName(componentName) || nonEmptyTexts.length === 0)
    return [];
  let keptNames: Dynamic = new Set(inferOptions?.keep),
    entries: Dynamic = new Map(),
    visitedTypes: Dynamic = new Set(),
    resolver: Dynamic = getTypeDeclarationResolver(nonEmptyTexts),
    collectTypeProps: Dynamic = (typeName?: Dynamic, depth?: Dynamic): Dynamic => {
      if (
        depth > typeInferenceMaxDepth ||
        visitedTypes.has(typeName) ||
        entries.size >= ComponentsTypeInferenceLimit
      )
        return;
      visitedTypes.add(typeName);
      let declaration: Dynamic = resolver.decl(typeName);
      if (
        declaration === null ||
        declaration.kind === "const" ||
        declaration.kind === "enum"
      )
        return;
      let bodies: Dynamic =
        declaration.kind === "interface"
          ? [declaration.body]
          : resolver.heads(declaration.head);
      for (let body of bodies as Dynamic)
        for (let member of resolver.members(body) as Dynamic) {
          resolver.tick();
          if (entries.size >= ComponentsTypeInferenceLimit) break;
          if (
            (reservedPropNames.has(member.name) &&
              !keptNames.has(member.name)) ||
            (member.name.startsWith("on") && /^on[A-Z]/.test(member.name)) ||
            /@deprecated\b/.test(member.doc) ||
            /^\s*never\s*$/.test(member.type)
          )
            continue;
          let resolvedType: Dynamic = resolver.resolve(member.type, 0);
          if (resolvedType === null) continue;
          let entry: Dynamic = entries.get(member.name);
          if (
            entry !== undefined &&
            !(
              entry.kind === "string" &&
              entry.typeName !== undefined &&
              resolvedType.kind !== "string"
            )
          )
            continue;
          let state: Dynamic = {
            name: member.name,
            kind: resolvedType.kind,
          };
          resolvedType.options !== undefined && (state.options = resolvedType.options);
          resolvedType.numeric === true && (state.numeric = true);
          resolvedType.withBool === true && (state.withBool = true);
          resolvedType.typeName !== undefined && (state.typeName = resolvedType.typeName);
          let defaultValue: Dynamic = inferJSDocDefault(
            member.doc,
            resolvedType,
          );
          defaultValue !== undefined && (state.default = defaultValue);
          member.optional || (state.required = true);
          entries.set(member.name, state);
        }
      resolver.charge(declaration.head.length);
      for (let referencedType of typeExpressionReferences(
        declaration.head,
      ) as Dynamic)
        collectTypeProps(referencedType, depth + 1);
    };
  try {
    collectTypeProps(componentName + "Props", 0);
  } catch (error: Dynamic) {
    set_ComponentsTypeInferenceTextsRsConfig(null);
    if (error !== TYPE_INFERENCE_OVER_BUDGET) throw error;
    set_typeInferenceIncomplete(true);
    return [];
  }
  let items: Dynamic = [...entries.values()];
  items.sort(
    (first?: Dynamic, second?: Dynamic): Dynamic =>
      first.name === "children" ? -1 : second.name === "children" ? 1 : 0,
  );
  return items;
}
function filterEditableInferredProps(props?: Dynamic): Dynamic {
  return props.filter(
    (prop?: Dynamic): Dynamic =>
      prop.name !== "children" &&
      /^[a-z_][\w.-]*$/.test(prop.name) &&
      !(prop.name in Object.prototype),
  );
}
function inferPropsFromDeclarations(
  componentNames?: Dynamic,
  sourceTexts?: Dynamic,
  keptNames?: Dynamic,
): Dynamic {
  try {
    for (let componentName of componentNames as Dynamic) {
      let props: Dynamic = filterEditableInferredProps(
        inferComponentProps(componentName, sourceTexts, {
          keep: keptNames,
        }),
      );
      if (props.length > 0) return props;
    }
  } catch {}
  return [];
}
function componentTypeCandidates(componentName?: Dynamic): Dynamic {
  let nameParts: Dynamic = componentName.split(".").slice(1);
  if (nameParts.length === 0) return [];
  let lastPart: Dynamic = nameParts[nameParts.length - 1];
  return [...new Set([nameParts.join(""), lastPart, lastPart + "Root"])];
}
function typeExpressionTooDeep(items?: Dynamic): Dynamic {
  let nestingDepth: Dynamic = 0;
  for (let position: Dynamic = 0; position < items.length; position++) {
    let charCode: Dynamic = items.charCodeAt(position);
    if (charCode === 40 || charCode === 91 || charCode === 123) {
      if (++nestingDepth > ComponentsDeclarationResolverLimit) return true;
    } else
      (charCode === 41 || charCode === 93 || charCode === 125) && nestingDepth > 0 && nestingDepth--;
  }
  return false;
}
export {
  ComponentsDeclarationResolverDelayMs,
  ComponentsDeclarationResolverElementCache,
  ComponentsDeclarationResolverLimit,
  ComponentsDeclarationResolverNameTypeValueValues,
  componentTypeCandidates,
  filterEditableInferredProps,
  getTypeDeclarationResolver,
  inferComponentProps,
  inferPropsFromDeclarations,
  typeExpressionTooDeep,
};
export function installEditorComponentsDeclarationResolver(): () => void {
  return () => {
    ComponentsDeclarationResolverNameTypeValueValues = [
      "name",
      "type",
      "value",
      "defaultValue",
    ];
    ComponentsDeclarationResolverDelayMs = 2e3;
    ComponentsDeclarationResolverLimit = 256;
    ComponentsDeclarationResolverElementCache = new WeakMap();
  };
}

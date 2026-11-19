/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getDcPropsJson, setDcPropsJson } from "../html/dc-props";

function getPendingPropKeys(source?: Dynamic, defaultValues?: Dynamic): Dynamic {
  let propsJson: Dynamic = getDcPropsJson(source);
  if (propsJson == null) return null;
  let parsedProps: Dynamic;
  try {
    parsedProps = JSON.parse(propsJson);
  } catch {
    return null;
  }
  if (parsedProps == null || typeof parsedProps != "object" || Array.isArray(parsedProps))
    return null;
  let propsWithDefaults: Dynamic = parsedProps;
  for (let [propName, defaultValue] of Object.entries(defaultValues) as Dynamic) {
    let existingEntry: Dynamic = propsWithDefaults[propName],
      existingEntryObject: Dynamic =
        existingEntry && typeof existingEntry == "object" && !Array.isArray(existingEntry)
          ? existingEntry
          : {};
    propsWithDefaults[propName] = {
      ...existingEntryObject,
      default: defaultValue,
    };
  }
  return setDcPropsJson(source, JSON.stringify(propsWithDefaults));
}
function getSavedPendingProps(source?: Dynamic, pendingProps?: Dynamic): Dynamic {
  if (pendingProps === undefined) return;
  let propsJson: Dynamic = getDcPropsJson(source);
  if (propsJson == null) return;
  let parsedProps: Dynamic;
  try {
    parsedProps = JSON.parse(propsJson);
  } catch {
    return;
  }
  if (parsedProps == null || typeof parsedProps != "object" || Array.isArray(parsedProps))
    return;
  let propDefinitions: Dynamic = parsedProps,
    savedDefaults: Dynamic = {};
  for (let propName of Object.keys(pendingProps) as Dynamic) {
    let propDefinition: Dynamic = Object.hasOwn(propDefinitions, propName)
        ? propDefinitions[propName]
        : undefined,
      savedDefault: Dynamic =
        propDefinition != null && typeof propDefinition == "object" && !Array.isArray(propDefinition)
          ? propDefinition.default
          : undefined;
    typeof savedDefault == "string" && (savedDefaults[propName] = savedDefault);
  }
  return Object.keys(savedDefaults).length > 0 ? savedDefaults : undefined;
}
function clearSavedPendingProps(artboard?: Dynamic): Dynamic {
  let pendingProps: Dynamic = artboard.pendingProps,
    savedDefaults: Dynamic = getSavedPendingProps(artboard.src, pendingProps);
  if (pendingProps === undefined || savedDefaults === undefined) return;
  let remainingProps: Dynamic = Object.fromEntries(
      Object.entries(pendingProps).filter(
        ([propName, propValue]: Dynamic): Dynamic =>
          !(Object.hasOwn(savedDefaults, propName) && savedDefaults[propName] === propValue),
      ),
    ),
    length: Dynamic = Object.keys(remainingProps).length;
  if (length === 0) {
    artboard.pendingProps = undefined;
    artboard.pendingPropsBase = undefined;
    return;
  }
  length < Object.keys(pendingProps).length && (artboard.pendingProps = remainingProps);
  artboard.pendingPropsBase =
    getDcPropsJson(artboard.src) ?? artboard.pendingPropsBase;
}
export {
  clearSavedPendingProps,
  getPendingPropKeys,
  getSavedPendingProps,
};
export function installEditorModelPendingProps(): () => void {
  return () => {};
}

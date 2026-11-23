/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { colorTokenGroupLabels, parseDesignSystems, typographyGroupLabels } from "./type-declarations";
import { typographyStyleSubtitle } from "./typography-parsing";
import { toModuleNamespace } from "../module-helpers";

var reactDesignSystemStore: Dynamic;
var DesignSystemStoreItems: Dynamic;
var DesignSystemStoreResolvedValue: Dynamic;
var DesignSystemStoreAlias: Dynamic;
var serializedDesignSystems: Dynamic;
var DesignSystemStoreSubscribers: Dynamic;
var DesignSystemStoreResolvedValueAlias: Dynamic;
var colorVariableNames: Dynamic;
function setDesignSystems(rawDesignSystems?: Dynamic): Dynamic {
  if (rawDesignSystems === DesignSystemStoreAlias) return;
  DesignSystemStoreAlias = rawDesignSystems;
  let parsedSystems: Dynamic = parseDesignSystems(rawDesignSystems),
    serializedSystems: Dynamic = JSON.stringify(parsedSystems);
  if (serializedSystems !== serializedDesignSystems) {
    serializedDesignSystems = serializedSystems;
    DesignSystemStoreResolvedValue =
      parsedSystems.length === 0 ? DesignSystemStoreItems : parsedSystems;
    for (let notifyListener of DesignSystemStoreSubscribers as Dynamic) notifyListener();
  }
}
function getDesignSystems(): Dynamic {
  return DesignSystemStoreResolvedValue;
}
function getDesignSystemColorVariables(): Dynamic {
  DesignSystemStoreResolvedValueAlias !== DesignSystemStoreResolvedValue &&
    ((DesignSystemStoreResolvedValueAlias = DesignSystemStoreResolvedValue),
    (colorVariableNames = new Set(
      DesignSystemStoreResolvedValue.flatMap(
        (system?: Dynamic): Dynamic =>
          system.colors.map((color?: Dynamic): Dynamic => "--" + color.name),
      ),
    )));
  return colorVariableNames;
}
function subscribeDesignSystems(listener?: Dynamic): Dynamic {
  DesignSystemStoreSubscribers.add(listener);
  return (): Dynamic => {
    DesignSystemStoreSubscribers.delete(listener);
  };
}
function useDesignSystems(): Dynamic {
  return (0, reactDesignSystemStore.useSyncExternalStore)(
    subscribeDesignSystems,
    getDesignSystems,
    getDesignSystems,
  );
}
function hasDesignSystems(items?: Dynamic): Dynamic {
  return items.length > 0;
}
function designSystemColorOptions(systems?: Dynamic): Dynamic {
  return systems.flatMap(
    (system?: Dynamic): Dynamic =>
      system.colors.map(
        (color?: Dynamic): Dynamic => ({
          name: color.name,
          value: color.value,
          label: color.name,
          ...colorTokenGroupLabels(system, color),
        }),
      ),
  );
}
function designSystemTypographyOptions(systems?: Dynamic): Dynamic {
  return systems.flatMap(
    (system?: Dynamic, systemIndex?: Dynamic): Dynamic =>
      (system.type ?? []).map(
        (style?: Dynamic): Dynamic => ({
          id: "ds-" + String(systemIndex) + "-" + style.name,
          system: systemIndex,
          style: style,
          subtitle: typographyStyleSubtitle(style),
          ...typographyGroupLabels(system, style),
        }),
      ),
  );
}
export {
  designSystemColorOptions,
  DesignSystemStoreAlias,
  DesignSystemStoreItems,
  DesignSystemStoreResolvedValue,
  DesignSystemStoreResolvedValueAlias,
  DesignSystemStoreSubscribers,
  designSystemTypographyOptions,
  getDesignSystemColorVariables,
  getDesignSystems,
  hasDesignSystems,
  reactDesignSystemStore,
  setDesignSystems,
  subscribeDesignSystems,
  useDesignSystems,
};
export function installDesignSystemStore(): () => void {
  return () => {
    reactDesignSystemStore = toModuleNamespace(
      load_react(),
      1,
    );
    DesignSystemStoreItems = [];
    DesignSystemStoreResolvedValue = DesignSystemStoreItems;
    serializedDesignSystems = "[]";
    DesignSystemStoreSubscribers = new Set();
    colorVariableNames = new Set();
  };
}

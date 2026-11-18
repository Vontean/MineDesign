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
var DesignSystemStoreAlias_2: Dynamic;
var DesignSystemStoreSubscribers: Dynamic;
var DesignSystemStoreResolvedValueAlias: Dynamic;
var DesignSystemStoreSubscribers_2: Dynamic;
function setDesignSystems(input?: Dynamic): Dynamic {
  if (input === DesignSystemStoreAlias) return;
  DesignSystemStoreAlias = input;
  let value: Dynamic = parseDesignSystems(input),
    value2: Dynamic = JSON.stringify(value);
  if (value2 !== DesignSystemStoreAlias_2) {
    DesignSystemStoreAlias_2 = value2;
    DesignSystemStoreResolvedValue =
      value.length === 0 ? DesignSystemStoreItems : value;
    for (let value3 of DesignSystemStoreSubscribers as Dynamic) value3();
  }
}
function getDesignSystems(): Dynamic {
  return DesignSystemStoreResolvedValue;
}
function getDesignSystemColorVariables(): Dynamic {
  DesignSystemStoreResolvedValueAlias !== DesignSystemStoreResolvedValue &&
    ((DesignSystemStoreResolvedValueAlias = DesignSystemStoreResolvedValue),
    (DesignSystemStoreSubscribers_2 = new Set(
      DesignSystemStoreResolvedValue.flatMap(
        (input?: Dynamic): Dynamic =>
          input.colors.map((input2?: Dynamic): Dynamic => "--" + input2.name),
      ),
    )));
  return DesignSystemStoreSubscribers_2;
}
function subscribeDesignSystems(input?: Dynamic): Dynamic {
  DesignSystemStoreSubscribers.add(input);
  return (): Dynamic => {
    DesignSystemStoreSubscribers.delete(input);
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
function designSystemColorOptions(input?: Dynamic): Dynamic {
  return input.flatMap(
    (input2?: Dynamic): Dynamic =>
      input2.colors.map(
        (input3?: Dynamic): Dynamic => ({
          name: input3.name,
          value: input3.value,
          label: input3.name,
          ...colorTokenGroupLabels(input2, input3),
        }),
      ),
  );
}
function designSystemTypographyOptions(input?: Dynamic): Dynamic {
  return input.flatMap(
    (input2?: Dynamic, options?: Dynamic): Dynamic =>
      (input2.type ?? []).map(
        (input3?: Dynamic): Dynamic => ({
          id: "ds-" + String(options) + "-" + input3.name,
          system: options,
          style: input3,
          subtitle: typographyStyleSubtitle(input3),
          ...typographyGroupLabels(input2, input3),
        }),
      ),
  );
}
export {
  designSystemColorOptions,
  DesignSystemStoreAlias,
  DesignSystemStoreAlias_2,
  DesignSystemStoreItems,
  DesignSystemStoreResolvedValue,
  DesignSystemStoreResolvedValueAlias,
  DesignSystemStoreSubscribers,
  DesignSystemStoreSubscribers_2,
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
    DesignSystemStoreAlias_2 = "[]";
    DesignSystemStoreSubscribers = new Set();
    DesignSystemStoreSubscribers_2 = new Set();
  };
}

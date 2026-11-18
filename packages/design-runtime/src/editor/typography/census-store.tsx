/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactTypographyCensusStore: Dynamic;
var TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig: Dynamic;
var TypographyCensusStoreResolvedValue: Dynamic;
var TypographyCensusStoreAlias: Dynamic;
var TypographyCensusStoreSubscribers: Dynamic;
function updateTypographyCensus(input?: Dynamic): Dynamic {
  let value: Dynamic = JSON.stringify(input);
  if (value !== TypographyCensusStoreAlias) {
    TypographyCensusStoreAlias = value;
    TypographyCensusStoreResolvedValue =
      input.sizes.length === 0 &&
      Object.keys(input.sizeRoles).length === 0 &&
      Object.keys(input.sizeFamilies).length === 0
        ? TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig
        : input;
    for (let value2 of TypographyCensusStoreSubscribers as Dynamic) value2();
  }
}
function getTypographyCensus(): Dynamic {
  return TypographyCensusStoreResolvedValue;
}
function subscribeTypographyCensus(input?: Dynamic): Dynamic {
  TypographyCensusStoreSubscribers.add(input);
  return (): Dynamic => {
    TypographyCensusStoreSubscribers.delete(input);
  };
}
function useTypographyCensus(): Dynamic {
  return (0, reactTypographyCensusStore.useSyncExternalStore)(
    subscribeTypographyCensus,
    getTypographyCensus,
    getTypographyCensus,
  );
}
export {
  getTypographyCensus,
  reactTypographyCensusStore,
  subscribeTypographyCensus,
  TypographyCensusStoreAlias,
  TypographyCensusStoreResolvedValue,
  TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig,
  TypographyCensusStoreSubscribers,
  updateTypographyCensus,
  useTypographyCensus,
};
export function installEditorTypographyCensusStore(): () => void {
  return () => {
    reactTypographyCensusStore = toModuleNamespace(
      load_react(),
      1,
    );
    TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig = {
      sizes: [],
      sizeRoles: {},
      sizeFamilies: {},
    };
    TypographyCensusStoreResolvedValue =
      TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig;
    TypographyCensusStoreAlias = JSON.stringify(
      TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig,
    );
    TypographyCensusStoreSubscribers = new Set();
  };
}

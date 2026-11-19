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
function updateTypographyCensus(census?: Dynamic): Dynamic {
  let value: Dynamic = JSON.stringify(census);
  if (value !== TypographyCensusStoreAlias) {
    TypographyCensusStoreAlias = value;
    TypographyCensusStoreResolvedValue =
      census.sizes.length === 0 &&
      Object.keys(census.sizeRoles).length === 0 &&
      Object.keys(census.sizeFamilies).length === 0
        ? TypographyCensusStoreSizesSizeRolesSizeFamiliesConfig
        : census;
    for (let subscriber of TypographyCensusStoreSubscribers as Dynamic) subscriber();
  }
}
function getTypographyCensus(): Dynamic {
  return TypographyCensusStoreResolvedValue;
}
function subscribeTypographyCensus(listener?: Dynamic): Dynamic {
  TypographyCensusStoreSubscribers.add(listener);
  return (): Dynamic => {
    TypographyCensusStoreSubscribers.delete(listener);
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

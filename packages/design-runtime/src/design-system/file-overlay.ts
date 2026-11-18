/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { designSystemTokensPath, parseInstalledDesignSystems, readInstalledDesignSystemTokens } from "./installed-systems";
import { DesignSystemPublishedFilesFromEntriesValue, DesignSystemPublishedFilesSubscribers } from "./published-files";
import { ProjectValue } from "../platform/file-content";

var DesignSystemFileOverlayKeyCarriedTextsConfig: Dynamic;
var DesignSystemFileOverlayStoredOverlayOutConfig: Dynamic;
function refreshDesignSystemFileOverlay(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = parseInstalledDesignSystems(input),
    entries: Dynamic = new Map(
      value.map((input2?: Dynamic): Dynamic => {
        let value5: Dynamic = designSystemTokensPath(
            input2.namespace,
          ),
          value6: Dynamic = value5.slice(ProjectValue.length);
        return [
          value5,
          options[value6] ??
            DesignSystemPublishedFilesFromEntriesValue[value6],
        ];
      }),
    ),
    value2: Dynamic = JSON.stringify(value),
    value3: Dynamic = DesignSystemFileOverlayKeyCarriedTextsConfig;
  if (
    value3 !== undefined &&
    value3.key === value2 &&
    value3.carried === context &&
    [...entries].every(
      ([input2, input3]: Dynamic): Dynamic =>
        value3.texts.get(input2) === input3,
    )
  )
    return value3.doc;
  let value4: Dynamic =
    readInstalledDesignSystemTokens(
      input,
      (input2?: Dynamic): Dynamic => entries.get(input2),
      context,
    ) ?? context;
  DesignSystemFileOverlayKeyCarriedTextsConfig = {
    key: value2,
    carried: context,
    texts: entries,
    doc: value4,
  };
  return value4;
}
function mergeDesignSystemFileOverlay(input?: Dynamic): Dynamic {
  return Object.keys(DesignSystemPublishedFilesFromEntriesValue)
    .length === 0
    ? input
    : ((DesignSystemFileOverlayStoredOverlayOutConfig === undefined ||
        DesignSystemFileOverlayStoredOverlayOutConfig.stored !== input ||
        DesignSystemFileOverlayStoredOverlayOutConfig.overlay !==
          DesignSystemPublishedFilesFromEntriesValue) &&
        (DesignSystemFileOverlayStoredOverlayOutConfig = {
          stored: input,
          overlay: DesignSystemPublishedFilesFromEntriesValue,
          out: {
            ...DesignSystemPublishedFilesFromEntriesValue,
            ...input,
          },
        }),
      DesignSystemFileOverlayStoredOverlayOutConfig.out);
}
function subscribeDesignSystemFiles(input?: Dynamic): Dynamic {
  DesignSystemPublishedFilesSubscribers.add(input);
  return (): Dynamic => {
    DesignSystemPublishedFilesSubscribers.delete(input);
  };
}
export {
  DesignSystemFileOverlayKeyCarriedTextsConfig,
  DesignSystemFileOverlayStoredOverlayOutConfig,
  mergeDesignSystemFileOverlay,
  refreshDesignSystemFileOverlay,
  subscribeDesignSystemFiles,
};
export function installDesignSystemFileOverlay(): () => void {
  return () => {};
}

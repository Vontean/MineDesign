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
  projectConfig?: Dynamic,
  storedFileTexts?: Dynamic,
  carriedTokens?: Dynamic,
): Dynamic {
  let installedSystems: Dynamic = parseInstalledDesignSystems(projectConfig),
    entries: Dynamic = new Map(
      installedSystems.map((system?: Dynamic): Dynamic => {
        let tokensPath: Dynamic = designSystemTokensPath(
            system.namespace,
          ),
          relativeTokensPath: Dynamic = tokensPath.slice(ProjectValue.length);
        return [
          tokensPath,
          storedFileTexts[relativeTokensPath] ??
            DesignSystemPublishedFilesFromEntriesValue[relativeTokensPath],
        ];
      }),
    ),
    installedKey: Dynamic = JSON.stringify(installedSystems),
    cachedOverlay: Dynamic = DesignSystemFileOverlayKeyCarriedTextsConfig;
  if (
    cachedOverlay !== undefined &&
    cachedOverlay.key === installedKey &&
    cachedOverlay.carried === carriedTokens &&
    [...entries].every(
      ([path, text]: Dynamic): Dynamic =>
        cachedOverlay.texts.get(path) === text,
    )
  )
    return cachedOverlay.doc;
  let mergedTokens: Dynamic =
    readInstalledDesignSystemTokens(
      projectConfig,
      (path?: Dynamic): Dynamic => entries.get(path),
      carriedTokens,
    ) ?? carriedTokens;
  DesignSystemFileOverlayKeyCarriedTextsConfig = {
    key: installedKey,
    carried: carriedTokens,
    texts: entries,
    doc: mergedTokens,
  };
  return mergedTokens;
}
function mergeDesignSystemFileOverlay(storedFiles?: Dynamic): Dynamic {
  return Object.keys(DesignSystemPublishedFilesFromEntriesValue)
    .length === 0
    ? storedFiles
    : ((DesignSystemFileOverlayStoredOverlayOutConfig === undefined ||
        DesignSystemFileOverlayStoredOverlayOutConfig.stored !== storedFiles ||
        DesignSystemFileOverlayStoredOverlayOutConfig.overlay !==
          DesignSystemPublishedFilesFromEntriesValue) &&
        (DesignSystemFileOverlayStoredOverlayOutConfig = {
          stored: storedFiles,
          overlay: DesignSystemPublishedFilesFromEntriesValue,
          out: {
            ...DesignSystemPublishedFilesFromEntriesValue,
            ...storedFiles,
          },
        }),
      DesignSystemFileOverlayStoredOverlayOutConfig.out);
}
function subscribeDesignSystemFiles(listener?: Dynamic): Dynamic {
  DesignSystemPublishedFilesSubscribers.add(listener);
  return (): Dynamic => {
    DesignSystemPublishedFilesSubscribers.delete(listener);
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

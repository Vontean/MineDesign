/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignSystemPathsConstant, maxDisplayTextLength, maxArtifactTextLength, strictControlCharPattern, titleControlCharPattern, maxTokensFileBytes, designSystemProjectPrefix, isDesignSystemNamespace } from "./paths";

var normalizeDisplayText: Dynamic;
function parseInstalledDesignSystems(projectConfig?: Dynamic): Dynamic {
  let rawSystems: Dynamic = projectConfig?.designSystems,
    systemList: Dynamic = Array.isArray(rawSystems)
      ? rawSystems
      : typeof rawSystems == "object" && rawSystems !== null
        ? Object.values(rawSystems)
        : [],
    entries: Dynamic = new Map();
  for (let rawSystem of systemList as Dynamic) {
    if (typeof rawSystem != "object" || rawSystem === null || Array.isArray(rawSystem))
      continue;
    let record: Dynamic = rawSystem,
      title: Dynamic = normalizeDisplayText(
        record.title,
        maxDisplayTextLength,
        titleControlCharPattern,
      ),
      artifact: Dynamic = normalizeDisplayText(
        record.artifact,
        maxArtifactTextLength,
      );
    !isDesignSystemNamespace(record.namespace) ||
      title === undefined ||
      artifact === undefined ||
      entries.set(record.namespace, {
        title: title,
        namespace: record.namespace,
        artifact: artifact,
        version:
          normalizeDisplayText(
            record.version,
            maxDisplayTextLength,
          ) ?? null,
        copiedAt: normalizeDisplayText(record.copiedAt, 40) ?? "",
        ...(record.unpinned === true
          ? {
              unpinned: true,
            }
          : {}),
      });
  }
  return [...entries.values()].slice(0, DesignSystemPathsConstant);
}
function designSystemTokensPath(namespaceId?: Dynamic): Dynamic {
  return designSystemProjectPrefix(namespaceId) + "tokens.json";
}
function readInstalledDesignSystemTokens(
  projectConfig?: Dynamic,
  readFileText?: Dynamic,
  carriedTokens?: Dynamic,
): Dynamic {
  let items: Dynamic = [];
  for (let system of parseInstalledDesignSystems(projectConfig) as Dynamic) {
    let tokensText: Dynamic = readFileText(designSystemTokensPath(system.namespace));
    if (
      !(
        tokensText === undefined ||
        tokensText.length > maxTokensFileBytes
      )
    )
      try {
        let parsedTokens: Dynamic = JSON.parse(tokensText);
        typeof parsedTokens == "object" &&
          parsedTokens !== null &&
          items.push({
            title: system.title,
            tokens: parsedTokens,
          });
      } catch {
        continue;
      }
  }
  if (items.length === 0) return;
  let carriedConfig: Dynamic =
      typeof carriedTokens == "object" && carriedTokens !== null ? carriedTokens : {},
    callback: Dynamic = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "object" && candidate !== null,
    carriedSystems: Dynamic = Array.isArray(carriedConfig.systems)
      ? carriedConfig.systems
      : carriedConfig.systems === undefined &&
          (callback(carriedConfig.color) || callback(carriedConfig.type))
        ? [
            {
              tokens: carriedTokens,
            },
          ]
        : undefined,
    remainingCarriedSystems: Dynamic = Array.isArray(carriedSystems)
      ? carriedSystems.filter(
          (carriedSystem?: Dynamic): Dynamic =>
            !items.some(
              (installedItem?: Dynamic): Dynamic => installedItem.title === carriedSystem?.title,
            ),
        )
      : [];
  return {
    v: 1,
    systems: [...items, ...remainingCarriedSystems],
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
      text?: Dynamic,
      maxLength?: Dynamic,
      forbiddenPattern: Dynamic = strictControlCharPattern,
    ): Dynamic =>
      typeof text == "string" &&
      text.trim() !== "" &&
      text.length <= maxLength &&
      !forbiddenPattern.test(text)
        ? text.trim()
        : undefined;
  };
}

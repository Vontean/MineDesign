/** Restored application module; prepare first, initialize in original order. */
import { detectAutoSavingArtifactRuntime } from "./documents/artifact-document";
import { configureLegacyDesignSystemBoot, failedLegacyStateOutcome, perFileDesignSystemBooted } from "./files/application-boot";
import { bootDesignSystemFilesMode, releaseEarlyHotUpdatesForLegacyMode } from "./files/per-file-boot";
import { DesignSystemApp } from "./files/ui/design-system-app";
import { normalizeSaveHome } from "./model/boot";
import { hasConfiguredDocumentFactory } from "./model/system-store";
import { detectCompiledPageStorageMode } from "./platform/compiled-page";
import { reactDOMClientForUiDisclosure } from "./ui/disclosure";

export function installBootstrap(): () => void {
  return () => {
    (normalizeSaveHome(
      detectCompiledPageStorageMode(document),
    ) === "files"
      ? bootDesignSystemFilesMode()
          .catch((input: unknown): void =>
            configureLegacyDesignSystemBoot(
              failedLegacyStateOutcome(input),
            ),
          )
          .then((): void => {
            if (!hasConfiguredDocumentFactory()) {
              configureLegacyDesignSystemBoot(
                failedLegacyStateOutcome(
                  Error("the page found nothing to open"),
                ),
              );
            }
          })
      : Promise.resolve()
    )
      .then((): void => {
        if (!perFileDesignSystemBooted) {
          releaseEarlyHotUpdatesForLegacyMode();
        }
      })
      .then(detectAutoSavingArtifactRuntime)
      .then((): void => {
        let value = document.getElementById("root");
        if (!value) {
          throw Error("missing #root");
        }
        reactDOMClientForUiDisclosure
          .createRoot(value)
          .render(<DesignSystemApp />);
      });
  };
}

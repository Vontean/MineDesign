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
    ((0, normalizeSaveHome)(
      (0, detectCompiledPageStorageMode)(document),
    ) === "files"
      ? (0, bootDesignSystemFilesMode)()
          .catch((input: unknown): void =>
            (0, configureLegacyDesignSystemBoot)(
              (0, failedLegacyStateOutcome)(input),
            ),
          )
          .then((): void => {
            if (!(0, hasConfiguredDocumentFactory)()) {
              (0, configureLegacyDesignSystemBoot)(
                (0, failedLegacyStateOutcome)(
                  Error("the page found nothing to open"),
                ),
              );
            }
          })
      : Promise.resolve()
    )
      .then((): void => {
        if (!perFileDesignSystemBooted) {
          (0, releaseEarlyHotUpdatesForLegacyMode)();
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

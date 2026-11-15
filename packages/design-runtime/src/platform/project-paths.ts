/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var projectMetadataPaths: Dynamic;
var legacyMetadataPaths: Dynamic;
var projectPathPrefix: Dynamic;
var migrationMetadataPath: Dynamic;
var projectReservedPaths: Dynamic;
var isReservedProjectPath: Dynamic;
var toProjectContentPath: Dynamic;
var isApplicationCodeFile: Dynamic;
var fromProjectContentPath: Dynamic;
var isProjectMetadataFile: Dynamic;
export {
  fromProjectContentPath,
  isApplicationCodeFile,
  isProjectMetadataFile,
  isReservedProjectPath,
  legacyMetadataPaths,
  migrationMetadataPath,
  projectMetadataPaths,
  projectPathPrefix,
  projectReservedPaths,
  toProjectContentPath,
};
export function installPlatformProjectPaths(): () => void {
  return () => {
    projectMetadataPaths = {
      design: "project/canvas.json",
      slides: "project/deck.json",
      designSystem: "project/design-system.json",
    };
    legacyMetadataPaths = {
      designSystem: "design-system.json",
    };
    projectPathPrefix = "project/";
    migrationMetadataPath = "project/migration.json";
    projectReservedPaths = {
      design: ["canvas.json", "migration.json"],
      slides: ["deck.json", "migration.json", "store-meta.json"],
      design_system: [
        "design-system.json",
        "migration.json",
        "design-system.before-files.json",
        "publish-progress.json",
        "migration-map.json",
      ],
      migrated_design: ["compat.json", "publish-progress.json"],
    };
    isReservedProjectPath = (input?: Dynamic, options?: Dynamic): Dynamic =>
      options.startsWith(projectPathPrefix) &&
      projectReservedPaths[input].includes(
        options.slice(projectPathPrefix.length),
      );
    toProjectContentPath = (input?: Dynamic, options?: Dynamic): Dynamic => {
      let value: Dynamic = projectPathPrefix + input;
      if (options !== undefined && isReservedProjectPath(options, value))
        throw new Error(
          "not a content path: " +
            JSON.stringify(value) +
            " is the page's own file",
        );
      return value;
    };
    isApplicationCodeFile = (input?: Dynamic): Dynamic =>
      input === "index.html" ||
      input === "SKILL.md" ||
      input.startsWith("artifact-type/");
    fromProjectContentPath = (input?: Dynamic, options?: Dynamic): Dynamic =>
      !input.startsWith(projectPathPrefix) ||
      (options !== undefined && isReservedProjectPath(options, input))
        ? undefined
        : input.slice(projectPathPrefix.length);
    isProjectMetadataFile = (input?: Dynamic): Dynamic =>
      input === projectMetadataPaths.design ||
      input === projectMetadataPaths.slides ||
      input === projectMetadataPaths.designSystem ||
      input === legacyMetadataPaths.designSystem;
  };
}

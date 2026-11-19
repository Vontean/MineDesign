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
    isReservedProjectPath = (projectType?: Dynamic, path?: Dynamic): Dynamic =>
      path.startsWith(projectPathPrefix) &&
      projectReservedPaths[projectType].includes(
        path.slice(projectPathPrefix.length),
      );
    toProjectContentPath = (relativePath?: Dynamic, projectType?: Dynamic): Dynamic => {
      let absolutePath: Dynamic = projectPathPrefix + relativePath;
      if (projectType !== undefined && isReservedProjectPath(projectType, absolutePath))
        throw new Error(
          "not a content path: " +
            JSON.stringify(absolutePath) +
            " is the page's own file",
        );
      return absolutePath;
    };
    isApplicationCodeFile = (path?: Dynamic): Dynamic =>
      path === "index.html" ||
      path === "SKILL.md" ||
      path.startsWith("artifact-type/");
    fromProjectContentPath = (absolutePath?: Dynamic, projectType?: Dynamic): Dynamic =>
      !absolutePath.startsWith(projectPathPrefix) ||
      (projectType !== undefined && isReservedProjectPath(projectType, absolutePath))
        ? undefined
        : absolutePath.slice(projectPathPrefix.length);
    isProjectMetadataFile = (path?: Dynamic): Dynamic =>
      path === projectMetadataPaths.design ||
      path === projectMetadataPaths.slides ||
      path === projectMetadataPaths.designSystem ||
      path === legacyMetadataPaths.designSystem;
  };
}

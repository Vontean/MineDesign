import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { DESIGN_SYSTEM_ENVELOPE_PATH, DESIGN_SYSTEM_PATHS } from "./file-policy";
import { computeMirrorChanges } from "./publish";

var MAX_DELETE_PUBLISH_PATHS: number;
var CONVERTED_FROM_MARKER_KEY: string;
var CREATED_ON_FILES_MARKER_KEY: string;
var MOVED_TO_MARKER_KEY: string;
var CONVERTING_MARKER_KEY: string;
var isFileMigrationMarkerObject: (
  input: unknown,
) => input is Storage.DatabaseRecord;
var MIGRATION_LOCK_TTL_MS: number;
function chunkPublishChanges(
  changes: Model.FilePublishEntries,
): Model.FilePublishEntries[] {
  let paths = Object.keys(changes),
    batches = [];
  for (
    let index = 0;
    index < paths.length;
    index += MAX_DELETE_PUBLISH_PATHS
  ) {
    batches.push(
      Object.fromEntries(
        paths
          .slice(index, index + MAX_DELETE_PUBLISH_PATHS)
          .map((input: string) => [input, changes[input]]),
      ),
    );
  }
  if (batches.length > 0) {
    return batches;
  } else {
    return [{}];
  }
}
function obsoleteMirrorDeletions(
  files: Model.FileTable,
): Record<string, null> {
  let deletions: Record<string, null> = {
    [DESIGN_SYSTEM_ENVELOPE_PATH]: null,
  };
  for (let value of Object.keys(
    computeMirrorChanges({}, files, true),
  )) {
    deletions[value] = null;
  }
  deletions[DESIGN_SYSTEM_PATHS.readme] = null;
  return deletions;
}
function readFileMigrationMarker(
  metadata: unknown,
): Storage.MigrationMarker | null {
  if (!isFileMigrationMarkerObject(metadata)) {
    return null;
  }
  let converted = metadata.convertedFrom;
  if (isFileMigrationMarkerObject(converted)) {
    return {
      kind: "converted",
      marker: converted,
    };
  }
  let created = metadata.createdOnFiles;
  if (isFileMigrationMarkerObject(created)) {
    return {
      kind: "created",
      marker: created,
    };
  }
  return null;
}
function convertedFromMarker(
  stamp: Storage.MigrationStamp,
): Storage.ConvertedMarker {
  return {
    v: 1,
    home: stamp.home ?? "store",
    at: stamp.at,
    by: stamp.by,
  };
}
function createdOnFilesMarker(
  stamp: Storage.MigrationStamp,
): Storage.CreatedMarker {
  return {
    v: 1,
    at: stamp.at,
  };
}
function movedToMarker(
  stamp: Storage.MovedMarkerStamp,
): Storage.DatabaseRecord {
  return {
    v: 1,
    path: stamp.path,
    ver: stamp.ver,
    at: stamp.at,
  };
}
function readMovedToMarker(metadata: unknown): Storage.MovedMarker | null {
  if (!isFileMigrationMarkerObject(metadata)) {
    return null;
  }
  let marker = metadata.movedTo;
  if (
    !isFileMigrationMarkerObject(marker) ||
    typeof marker.path !== "string" ||
    typeof marker.at !== "string"
  ) {
    return null;
  }
  let normalized = {
    ...marker,
  };
  for (let value of ["dropping", "dropped", "took"]) {
    if (typeof normalized[value] !== "string") {
      delete normalized[value];
    }
  }
  return normalized as Storage.MovedMarker;
}
function readConvertingMarker(
  metadata: unknown,
): Storage.ConvertingMarker | null {
  if (!isFileMigrationMarkerObject(metadata)) {
    return null;
  }
  let lock = metadata.converting;
  if (isFileMigrationMarkerObject(lock) && typeof lock.holder === "string") {
    return lock as Storage.ConvertingMarker;
  } else {
    return null;
  }
}
function activeConvertingMarker(
  metadata: unknown,
  now: number,
): Storage.ConvertingMarker | null {
  let lock = readConvertingMarker(metadata);
  if (lock === null) {
    return null;
  }
  let timestamp = Date.parse(lock.at as string);
  if (
    Number.isFinite(timestamp) &&
    now - timestamp <= MIGRATION_LOCK_TTL_MS &&
    timestamp - now <= MIGRATION_LOCK_TTL_MS
  ) {
    return lock as Storage.ConvertingMarker;
  } else {
    return null;
  }
}
export {
  activeConvertingMarker,
  chunkPublishChanges,
  CONVERTED_FROM_MARKER_KEY,
  convertedFromMarker,
  CONVERTING_MARKER_KEY,
  CREATED_ON_FILES_MARKER_KEY,
  createdOnFilesMarker,
  isFileMigrationMarkerObject,
  MAX_DELETE_PUBLISH_PATHS,
  MIGRATION_LOCK_TTL_MS,
  MOVED_TO_MARKER_KEY,
  movedToMarker,
  obsoleteMirrorDeletions,
  readConvertingMarker,
  readFileMigrationMarker,
  readMovedToMarker,
};
export function installModelMigrationMarkers(): () => void {
  return () => {
    MAX_DELETE_PUBLISH_PATHS = 200;
    CONVERTED_FROM_MARKER_KEY = "convertedFrom";
    CREATED_ON_FILES_MARKER_KEY = "createdOnFiles";
    MOVED_TO_MARKER_KEY = "movedTo";
    CONVERTING_MARKER_KEY = "converting";
    isFileMigrationMarkerObject = (
      input: unknown,
    ): input is Storage.DatabaseRecord =>
      typeof input === "object" && input !== null && !Array.isArray(input);
    MIGRATION_LOCK_TTL_MS = 150000;
  };
}

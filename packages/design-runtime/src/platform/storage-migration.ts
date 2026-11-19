/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var ConvertedFromValue: Dynamic;
var CreatedOnFilesValue: Dynamic;
var MovedToValue: Dynamic;
var PlatformStorageMigrationIsArray: Dynamic;
function getStorageMigrationMarker(metadata?: Dynamic): Dynamic {
  if (!PlatformStorageMigrationIsArray(metadata)) return null;
  let value: Dynamic = metadata[ConvertedFromValue];
  if (PlatformStorageMigrationIsArray(value))
    return {
      kind: "converted",
      marker: value,
    };
  let createdMarker: Dynamic = metadata[CreatedOnFilesValue];
  return PlatformStorageMigrationIsArray(createdMarker)
    ? {
        kind: "created",
        marker: createdMarker,
      }
    : null;
}
function getStorageModeFromMetadata(metadata?: Dynamic): Dynamic {
  return getStorageMigrationMarker(metadata) === null ? "store" : "files";
}
function getStorageModeFromJson(metadataJson?: Dynamic): Dynamic {
  if (typeof metadataJson != "string") return "store";
  try {
    return getStorageModeFromMetadata(JSON.parse(metadataJson));
  } catch {
    return "store";
  }
}
function migrationTimestampMarker(timestamp?: Dynamic): Dynamic {
  return {
    v: 1,
    at: timestamp.at,
  };
}
function getMovedToMarker(metadata?: Dynamic): Dynamic {
  if (!PlatformStorageMigrationIsArray(metadata)) return null;
  let value: Dynamic = metadata[MovedToValue];
  if (
    !PlatformStorageMigrationIsArray(value) ||
    typeof value.path != "string" ||
    typeof value.at != "string"
  )
    return null;
  let state: Dynamic = {
    ...value,
  };
  for (let timestampKey of ["dropping", "dropped", "took"] as Dynamic)
    typeof state[timestampKey] != "string" && delete state[timestampKey];
  return state;
}
export {
  ConvertedFromValue,
  CreatedOnFilesValue,
  getMovedToMarker,
  getStorageMigrationMarker,
  getStorageModeFromJson,
  getStorageModeFromMetadata,
  migrationTimestampMarker,
  MovedToValue,
  PlatformStorageMigrationIsArray,
};
export function installPlatformStorageMigration(): () => void {
  return () => {
    ConvertedFromValue = "convertedFrom";
    CreatedOnFilesValue = "createdOnFiles";
    MovedToValue = "movedTo";
    PlatformStorageMigrationIsArray = (metadata?: Dynamic): Dynamic =>
      typeof metadata == "object" && metadata !== null && !Array.isArray(metadata);
  };
}

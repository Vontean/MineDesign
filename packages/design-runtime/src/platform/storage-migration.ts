/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var ConvertedFromValue: Dynamic;
var CreatedOnFilesValue: Dynamic;
var MovedToValue: Dynamic;
var PlatformStorageMigrationIsArray: Dynamic;
function getStorageMigrationMarker(input?: Dynamic): Dynamic {
  if (!PlatformStorageMigrationIsArray(input)) return null;
  let value: Dynamic = input[ConvertedFromValue];
  if (PlatformStorageMigrationIsArray(value))
    return {
      kind: "converted",
      marker: value,
    };
  let value2: Dynamic = input[CreatedOnFilesValue];
  return PlatformStorageMigrationIsArray(value2)
    ? {
        kind: "created",
        marker: value2,
      }
    : null;
}
function getStorageModeFromMetadata(input?: Dynamic): Dynamic {
  return getStorageMigrationMarker(input) === null ? "store" : "files";
}
function getStorageModeFromJson(input?: Dynamic): Dynamic {
  if (typeof input != "string") return "store";
  try {
    return getStorageModeFromMetadata(JSON.parse(input));
  } catch {
    return "store";
  }
}
function migrationTimestampMarker(input?: Dynamic): Dynamic {
  return {
    v: 1,
    at: input.at,
  };
}
function getMovedToMarker(input?: Dynamic): Dynamic {
  if (!PlatformStorageMigrationIsArray(input)) return null;
  let value: Dynamic = input[MovedToValue];
  if (
    !PlatformStorageMigrationIsArray(value) ||
    typeof value.path != "string" ||
    typeof value.at != "string"
  )
    return null;
  let state: Dynamic = {
    ...value,
  };
  for (let value2 of ["dropping", "dropped", "took"] as Dynamic)
    typeof state[value2] != "string" && delete state[value2];
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
    PlatformStorageMigrationIsArray = (input?: Dynamic): Dynamic =>
      typeof input == "object" && input !== null && !Array.isArray(input);
  };
}

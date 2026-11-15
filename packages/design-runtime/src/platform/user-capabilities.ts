/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { awaitHostCapability, hasCapabilityMethod, resolveHostCapability } from "./host-capabilities";

var PlatformUserCapabilitiesHandler: Dynamic;
async function getUserCapabilityMethod(input?: Dynamic): Promise<Dynamic> {
  let value: Dynamic = await (0, resolveHostCapability)(
    "user",
    (0, hasCapabilityMethod)(input),
  );
  return value === null ? undefined : value[input].bind(value);
}
async function readUserCapability(
  input?: Dynamic,
  options?: Dynamic,
): Promise<Dynamic> {
  let value: Dynamic = await getUserCapabilityMethod(input);
  if (!value) return null;
  try {
    let value2: Dynamic = await value();
    return options(value2) ? value2 : null;
  } catch {
    return null;
  }
}
function getCurrentUserId(): Dynamic {
  return readUserCapability("id", PlatformUserCapabilitiesHandler);
}
async function getCurrentUserCanEdit(): Promise<Dynamic> {
  let value: Dynamic = await getUserCapabilityMethod("canEdit");
  if (!value) return null;
  try {
    let value2: Dynamic = await value();
    return value2 === true ? true : value2 === false ? false : null;
  } catch {
    return null;
  }
}
async function getCurrentUserPermission(input?: Dynamic): Promise<Dynamic> {
  let value: Dynamic = await getUserCapabilityMethod("can");
  if (!value) return null;
  try {
    let value2: Dynamic = await value(input);
    return typeof value2 == "boolean" ? value2 : null;
  } catch {
    return null;
  }
}
async function getUserProfiles(items?: Dynamic): Promise<Dynamic> {
  let entries: Dynamic = new Map(),
    value: Dynamic =
      items.length > 0
        ? await getUserCapabilityMethod("profiles")
        : undefined;
  if (!value) return entries;
  let callback: Dynamic = (input?: Dynamic): Dynamic =>
    typeof input == "string" ? input : "";
  try {
    let value2: Dynamic = await value(items);
    if (typeof value2 != "object" || value2 === null) return entries;
    for (let value3 of items as Dynamic) {
      let value4: Dynamic = Object.hasOwn(value2, value3)
        ? value2[value3]
        : undefined;
      if (typeof value4 != "object" || value4 === null) continue;
      let {
        name: value5,
        avatarUrl: value6,
        color: value7,
      }: Dynamic = value4;
      entries.set(value3, {
        name: callback(value5),
        avatarUrl: callback(value6),
        color: callback(value7),
      });
    }
  } catch {}
  return entries;
}
async function getUserNames(input?: Dynamic): Promise<Dynamic> {
  let entries: Dynamic = new Map();
  for (let [value, value2] of (await getUserProfiles(input)) as Dynamic)
    value2.name !== "" && entries.set(value, value2.name);
  return entries;
}
async function awaitCurrentUserCanEdit(): Promise<Dynamic> {
  let value: Dynamic = await (0, awaitHostCapability)(
    "user",
    (0, hasCapabilityMethod)("canEdit"),
  );
  if (value === null) return null;
  try {
    let value2: Dynamic = await value.canEdit.call(value);
    return value2 === true ? true : value2 === false ? false : null;
  } catch {
    return null;
  }
}
async function getCurrentUserProfile(): Promise<Dynamic> {
  let value: Dynamic = await (0, resolveHostCapability)(
    "user",
    (0, hasCapabilityMethod)("me"),
  );
  if (value === null) return null;
  try {
    let value2: Dynamic = await value.me.call(value);
    return typeof value2 != "object" || value2 === null
      ? null
      : {
          name: typeof value2.name == "string" ? value2.name : "",
          color: typeof value2.color == "string" ? value2.color : "",
        };
  } catch {
    return null;
  }
}
export {
  awaitCurrentUserCanEdit,
  getCurrentUserCanEdit,
  getCurrentUserId,
  getCurrentUserPermission,
  getCurrentUserProfile,
  getUserCapabilityMethod,
  getUserNames,
  getUserProfiles,
  PlatformUserCapabilitiesHandler,
  readUserCapability,
};
export function installPlatformUserCapabilities(): () => void {
  return () => {
    PlatformUserCapabilitiesHandler = (items?: Dynamic): Dynamic =>
      typeof items == "string" && items.length > 0;
  };
}

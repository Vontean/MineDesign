/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { awaitHostCapability, hasCapabilityMethod, resolveHostCapability } from "./host-capabilities";

var PlatformUserCapabilitiesHandler: Dynamic;
async function getUserCapabilityMethod(methodName?: Dynamic): Promise<Dynamic> {
  let value: Dynamic = await resolveHostCapability(
    "user",
    hasCapabilityMethod(methodName),
  );
  return value === null ? undefined : value[methodName].bind(value);
}
async function readUserCapability(
  methodName?: Dynamic,
  isValid?: Dynamic,
): Promise<Dynamic> {
  let value: Dynamic = await getUserCapabilityMethod(methodName);
  if (!value) return null;
  try {
    let result: Dynamic = await value();
    return isValid(result) ? result : null;
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
    let canEdit: Dynamic = await value();
    return canEdit === true ? true : canEdit === false ? false : null;
  } catch {
    return null;
  }
}
async function getCurrentUserPermission(permission?: Dynamic): Promise<Dynamic> {
  let value: Dynamic = await getUserCapabilityMethod("can");
  if (!value) return null;
  try {
    let allowed: Dynamic = await value(permission);
    return typeof allowed == "boolean" ? allowed : null;
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
  let callback: Dynamic = (candidate?: Dynamic): Dynamic =>
    typeof candidate == "string" ? candidate : "";
  try {
    let profiles: Dynamic = await value(items);
    if (typeof profiles != "object" || profiles === null) return entries;
    for (let userId of items as Dynamic) {
      let profile: Dynamic = Object.hasOwn(profiles, userId)
        ? profiles[userId]
        : undefined;
      if (typeof profile != "object" || profile === null) continue;
      let {
        name: name,
        avatarUrl: avatarUrl,
        color: color,
      }: Dynamic = profile;
      entries.set(userId, {
        name: callback(name),
        avatarUrl: callback(avatarUrl),
        color: callback(color),
      });
    }
  } catch {}
  return entries;
}
async function getUserNames(userIds?: Dynamic): Promise<Dynamic> {
  let entries: Dynamic = new Map();
  for (let [value, profile] of (await getUserProfiles(userIds)) as Dynamic)
    profile.name !== "" && entries.set(value, profile.name);
  return entries;
}
async function awaitCurrentUserCanEdit(): Promise<Dynamic> {
  let value: Dynamic = await awaitHostCapability(
    "user",
    hasCapabilityMethod("canEdit"),
  );
  if (value === null) return null;
  try {
    let canEdit: Dynamic = await value.canEdit.call(value);
    return canEdit === true ? true : canEdit === false ? false : null;
  } catch {
    return null;
  }
}
async function getCurrentUserProfile(): Promise<Dynamic> {
  let value: Dynamic = await resolveHostCapability(
    "user",
    hasCapabilityMethod("me"),
  );
  if (value === null) return null;
  try {
    let profile: Dynamic = await value.me.call(value);
    return typeof profile != "object" || profile === null
      ? null
      : {
          name: typeof profile.name == "string" ? profile.name : "",
          color: typeof profile.color == "string" ? profile.color : "",
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

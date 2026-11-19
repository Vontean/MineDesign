import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { capabilityHasMethod, getOrLoadClaudeCapability, loadClaudeCapabilityWithTimeout } from "./claude-capabilities";

var isNonemptyUserString: (value: unknown) => value is string;
async function resolveUserMethod<Name extends keyof Host.UserCapability>(
  name: Name,
): Promise<Host.UserCapability[Name] | undefined> {
  let value = (await getOrLoadClaudeCapability(
    "user",
    capabilityHasMethod(name),
  )) as Pick<Host.UserCapability, Name> | null;
  if (value === null) {
    return undefined;
  } else {
    return value[name].bind(value) as Host.UserCapability[Name];
  }
}
async function callValidatedUserMethod<Value>(
  name: "id" | "name",
  validate: (value: unknown) => value is Value,
): Promise<Value | null> {
  let value = await resolveUserMethod(name);
  if (!value) {
    return null;
  }
  try {
    let result = await value();
    if (validate(result)) {
      return result;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function currentUserId(): Promise<string | null> {
  return callValidatedUserMethod("id", isNonemptyUserString);
}
function getCurrentUserName(): Promise<string | null> {
  return callValidatedUserMethod("name", isNonemptyUserString);
}
async function isArtifactOwner(): Promise<boolean | undefined> {
  let isOwner = await resolveUserMethod("isOwner");
  if (!isOwner) {
    return false;
  }
  try {
    return (await isOwner()) === true;
  } catch {
    return false;
  }
}
async function currentUserCanEdit(): Promise<null | boolean | undefined> {
  let value = await resolveUserMethod("canEdit");
  if (!value) {
    return null;
  }
  try {
    let permissionResult = await value();
    if (permissionResult === true) {
      return true;
    } else {
      if (permissionResult === false) {
        return false;
      } else {
        return null;
      }
    }
  } catch {
    return null;
  }
}
async function currentUserCan(capability: string): Promise<boolean | null> {
  let value = await resolveUserMethod("can");
  if (!value) {
    return null;
  }
  try {
    let capabilityResult = await value(capability);
    if (typeof capabilityResult === "boolean") {
      return capabilityResult;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
async function currentUserCanEditAsync(): Promise<
  null | boolean | undefined
> {
  let value = (await loadClaudeCapabilityWithTimeout(
    "user",
    capabilityHasMethod("canEdit"),
  )) as Pick<Host.UserCapability, "canEdit"> | null;
  if (value === null) {
    return null;
  }
  try {
    let permissionResult = await value.canEdit.call(value);
    if (permissionResult === true) {
      return true;
    } else {
      if (permissionResult === false) {
        return false;
      } else {
        return null;
      }
    }
  } catch {
    return null;
  }
}
export {
  callValidatedUserMethod,
  currentUserCan,
  currentUserCanEdit,
  currentUserCanEditAsync,
  currentUserId,
  getCurrentUserName,
  isArtifactOwner,
  isNonemptyUserString,
  resolveUserMethod,
};
export function installHostUserApi(): () => void {
  return () => {
    isNonemptyUserString = (candidate: unknown): candidate is string =>
      typeof candidate === "string" && candidate.length > 0;
  };
}

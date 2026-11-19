import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */

var MIGRATION_HOLD_BLOCKED_EVENTS: string[];
var REOPEN_FOCUS_HOLD_MS: number;
function migrationHoldAllowsKey(event: { key?: string }): boolean {
  let key = event.key ?? "";
  return key === "Escape" || key === "Tab" || /^F\d{1,2}$/.test(key);
}
function restoreReopenedFocus(host: Window, focusId?: string): void {
  let focusTarget = (): void => {
    let hasFocusTarget = focusId !== undefined && focusId !== "",
      focusElement =
        (hasFocusTarget ? host.document.getElementById(focusId as string) : null) ??
        host.document.querySelector<HTMLElement>("main h1, main h2, main");
    if (focusElement === null) {
      return;
    }
    if (!focusElement.hasAttribute("tabindex")) {
      focusElement.setAttribute("tabindex", "-1");
    }
    focusElement.focus({
      preventScroll: !hasFocusTarget,
    });
  };
  if (host.document.hasFocus()) {
    return focusTarget();
  }
  let flag: boolean = true,
    value: number | undefined,
    callback = (): void => {
      if (!flag) {
        return;
      }
      flag = false;
      host.clearTimeout(value);
      host.document.removeEventListener("visibilitychange", restoreVisibilityFocus);
      host.removeEventListener("focus", restoreFocus, false);
      for (let eventType of ["keydown", "pointerdown"]) {
        host.removeEventListener(eventType, callback, true);
      }
    },
    restoreFocus = (): void => {
      if (!flag) {
        return;
      }
      callback();
      focusTarget();
    },
    restoreVisibilityFocus = (): void => {
      host.clearTimeout(value);
      value =
        host.document.visibilityState === "visible"
          ? host.setTimeout(callback, REOPEN_FOCUS_HOLD_MS)
          : undefined;
    };
  host.addEventListener("focus", restoreFocus, false);
  for (let eventType of ["keydown", "pointerdown"]) {
    host.addEventListener(eventType, callback, true);
  }
  host.document.addEventListener("visibilitychange", restoreVisibilityFocus);
  restoreVisibilityFocus();
}
function createMigrationEditingHold(host: Window): Boot.EditingHold {
  let banner: HTMLDivElement | undefined,
    madeInert: (Element & { inert?: boolean })[] = [],
    blockEvent = (event: Event & { key?: string }): void => {
      if (event.type.startsWith("key") && migrationHoldAllowsKey(event)) {
        return;
      }
      event.stopImmediatePropagation();
      event.preventDefault();
    };
  return {
    held: (): boolean => banner !== undefined,
    hold(message): void {
      if (banner !== undefined) {
        return;
      }
      let body = host.document.body;
      madeInert = Array.from(body.children).filter(
        (element: Element & { inert?: boolean }): boolean =>
          element.inert !== true,
      );
      for (let element of madeInert) {
        element.inert = true;
      }
      for (let eventType of MIGRATION_HOLD_BLOCKED_EVENTS) {
        host.addEventListener(eventType, blockEvent, true);
      }
      let value = (banner = host.document.createElement("div"));
      value.setAttribute("role", "status");
      value.style.cssText =
        "position:fixed;inset:0 0 auto 0;z-index:2147483647;padding:10px 16px;background:#1f1e1d;color:#faf9f5;font:14px/1.4 system-ui,sans-serif;text-align:center";
      body.appendChild(value);
      host.setTimeout((): void => {
        if (banner === value) {
          value.textContent = message;
        }
      }, 60);
    },
    release(): void {
      if (banner === undefined) {
        return;
      }
      banner.remove();
      banner = undefined;
      for (let value of MIGRATION_HOLD_BLOCKED_EVENTS) {
        host.removeEventListener(value, blockEvent, true);
      }
      for (let value of madeInert) {
        value.inert = false;
      }
      madeInert = [];
    },
  };
}
export {
  createMigrationEditingHold,
  MIGRATION_HOLD_BLOCKED_EVENTS,
  migrationHoldAllowsKey,
  REOPEN_FOCUS_HOLD_MS,
  restoreReopenedFocus,
};
export function installFilesMigrationEditingHold(): () => void {
  return () => {
    MIGRATION_HOLD_BLOCKED_EVENTS = [
      "keydown",
      "keyup",
      "keypress",
      "beforeinput",
      "paste",
      "cut",
      "drop",
      "dragstart",
      "pointerdown",
      "pointermove",
      "pointerup",
      "mousedown",
      "mouseup",
      "click",
      "touchstart",
    ];
    REOPEN_FOCUS_HOLD_MS = 5000;
  };
}

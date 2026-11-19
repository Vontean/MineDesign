/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { injected_E7t } from "../../dependencies";

var PickerRuntimeScriptTAppAccentConfig: Dynamic;
var DcEditorEvtValue: Dynamic;
var DcLinkNewAttribute: Dynamic;
var pickerCursorCss: Dynamic;
var buildPickerRuntimeScript: Dynamic;
function parseDirectiveMap(rawMap?: Dynamic): Dynamic {
  if (typeof rawMap != "object" || rawMap == null) return null;
  let value: Dynamic = Object.entries(rawMap);
  if (value.length > 2048) return null;
  let state: Dynamic = {};
  for (let [indexKey, entry] of value as Dynamic) {
    let index: Dynamic = Number(indexKey);
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      typeof entry != "object" ||
      entry == null
    )
      continue;
    let { on: isOn, count: count }: Dynamic = entry;
    typeof isOn == "boolean"
      ? (state[index] = {
          on: isOn,
        })
      : typeof count == "number" &&
        Number.isFinite(count) &&
        count >= 0 &&
        (state[index] = {
          count: Math.floor(count),
        });
  }
  return state;
}
function pickerElementSignature(
  element?: Dynamic,
  isReservedTag?: Dynamic,
): Dynamic {
  let getTagName: Dynamic = (node?: Dynamic): Dynamic => {
      let tagName: Dynamic = (
        node.localName ||
        node.tagName ||
        ""
      ).toLowerCase();
      return tagName.indexOf("sc-raw-") === 0 ? tagName.slice(7) : tagName;
    },
    isOpaqueElement: Dynamic = (node?: Dynamic): Dynamic => {
      let tagName: Dynamic = getTagName(node);
      return (
        /^(svg|img|video|audio|canvas|picture|iframe|object|embed|input|textarea|select|button|hr|dc-import|x-import)$/.test(
          tagName,
        ) ||
        tagName.indexOf("-") > 0 ||
        node.hasAttribute("data-sc-name") ||
        !!(node.classList && node.classList.contains("sc-host-x"))
      );
    };
  if (
    isOpaqueElement(element) ||
    isReservedTag(getTagName(element)) ||
    element.querySelector("[data-dc-tpl]")
  )
    return false;
  let value: Dynamic = element.querySelectorAll("*");
  for (let index: Dynamic = 0; index < value.length; index++)
    if (isOpaqueElement(value[index])) return false;
  return !(element.textContent || "").trim();
}
function computedWidth(computedStyle?: Dynamic): Dynamic {
  let value: Dynamic = parseFloat(computedStyle.width);
  return value > 0 ? Math.ceil(value * 100) / 100 : 0;
}
function emptyElementHeight(element?: Dynamic, computedStyle?: Dynamic): Dynamic {
  let text: Dynamic = "img,svg,video,canvas,iframe,picture";
  if (
    (element.textContent || "").trim() !== "" ||
    element.matches(text) ||
    element.querySelector(text)
  )
    return 0;
  let value: Dynamic = parseFloat(computedStyle.height);
  return value > 0 ? Math.ceil(value * 100) / 100 : 0;
}
function computedTextMetrics(
  element?: Dynamic,
  computedStyle?: Dynamic,
  items?: Dynamic,
): Dynamic {
  let value: Dynamic =
    computedStyle.display === "list-item" || element.tagName === "LI";
  if (!value && (element.textContent || "").trim() === "") return null;
  let state: Dynamic = {};
  for (let index: Dynamic = 0; index < items.length; index++) {
    let propertyName: Dynamic = items[index];
    if (
      (propertyName === "list-style-type" && !value) ||
      (propertyName === "text-align" && computedStyle.display === "inline")
    )
      continue;
    let propertyValue: Dynamic = computedStyle.getPropertyValue(propertyName);
    propertyValue && (state[propertyName] = propertyValue);
  }
  return state;
}
export {
  buildPickerRuntimeScript,
  computedTextMetrics,
  computedWidth,
  DcEditorEvtValue,
  DcLinkNewAttribute,
  emptyElementHeight,
  parseDirectiveMap,
  pickerCursorCss,
  pickerElementSignature,
  PickerRuntimeScriptTAppAccentConfig,
};
export function installEditorPickerRuntimeScript(): () => void {
  return () => {
    PickerRuntimeScriptTAppAccentConfig = {
      "--t-app-accent": "var(--cds-fill-accent, #2a78d6)",
    };
    DcEditorEvtValue = "__dcEditorEvt";
    DcLinkNewAttribute = "data-dc-link-new";
    pickerCursorCss =
      "url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M2%2014l1-4%208-8a2.1%202.1%200%200%201%203%203l-8%208-4%201z%22%20fill=%22%23333%22%20stroke=%22%23fff%22%20stroke-width=%221%22/%3E%3C/svg%3E') 1 15, crosshair";
    buildPickerRuntimeScript = (): Dynamic => injected_E7t;
  };
}

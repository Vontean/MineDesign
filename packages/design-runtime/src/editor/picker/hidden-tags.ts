/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var PickerHiddenTagsPattern: Dynamic;
var PickerHiddenTagsSubscribers: Dynamic;
var PickerHiddenTagsListeners: Dynamic;
var PickerHiddenTagsItems: Dynamic;
function notifyHiddenPickerTags(): Dynamic {
  PickerHiddenTagsItems = [...PickerHiddenTagsSubscribers];
  for (let value of PickerHiddenTagsListeners as Dynamic) value();
}
function registerHiddenPickerTag(tagName?: Dynamic): Dynamic {
  return !PickerHiddenTagsPattern.test(tagName) ||
    PickerHiddenTagsSubscribers.has(tagName)
    ? (): Dynamic => {}
    : (PickerHiddenTagsSubscribers.add(tagName),
      notifyHiddenPickerTags(),
      (): Dynamic => {
        PickerHiddenTagsSubscribers.delete(tagName) && notifyHiddenPickerTags();
      });
}
function getHiddenPickerTags(): Dynamic {
  return PickerHiddenTagsItems;
}
function subscribeHiddenPickerTags(listener?: Dynamic): Dynamic {
  PickerHiddenTagsListeners.add(listener);
  return (): Dynamic => {
    PickerHiddenTagsListeners.delete(listener);
  };
}
export {
  getHiddenPickerTags,
  notifyHiddenPickerTags,
  PickerHiddenTagsItems,
  PickerHiddenTagsPattern,
  PickerHiddenTagsSubscribers,
  PickerHiddenTagsListeners as PickerHiddenTagsSubscribers_2,
  registerHiddenPickerTag,
  subscribeHiddenPickerTags,
};
export function installEditorPickerHiddenTags(): () => void {
  return () => {
    PickerHiddenTagsPattern = /^[a-z0-9-]{1,48}$/;
    PickerHiddenTagsSubscribers = new Set();
    PickerHiddenTagsListeners = new Set();
    PickerHiddenTagsItems = [];
  };
}

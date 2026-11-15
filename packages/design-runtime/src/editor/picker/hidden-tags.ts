/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var PickerHiddenTagsPattern: Dynamic;
var PickerHiddenTagsSubscribers: Dynamic;
var PickerHiddenTagsSubscribers_2: Dynamic;
var PickerHiddenTagsItems: Dynamic;
function notifyHiddenPickerTags(): Dynamic {
  PickerHiddenTagsItems = [...PickerHiddenTagsSubscribers];
  for (let value of PickerHiddenTagsSubscribers_2 as Dynamic) value();
}
function registerHiddenPickerTag(input?: Dynamic): Dynamic {
  return !PickerHiddenTagsPattern.test(input) ||
    PickerHiddenTagsSubscribers.has(input)
    ? (): Dynamic => {}
    : (PickerHiddenTagsSubscribers.add(input),
      notifyHiddenPickerTags(),
      (): Dynamic => {
        PickerHiddenTagsSubscribers.delete(input) && notifyHiddenPickerTags();
      });
}
function getHiddenPickerTags(): Dynamic {
  return PickerHiddenTagsItems;
}
function subscribeHiddenPickerTags(input?: Dynamic): Dynamic {
  PickerHiddenTagsSubscribers_2.add(input);
  return (): Dynamic => {
    PickerHiddenTagsSubscribers_2.delete(input);
  };
}
export {
  getHiddenPickerTags,
  notifyHiddenPickerTags,
  PickerHiddenTagsItems,
  PickerHiddenTagsPattern,
  PickerHiddenTagsSubscribers,
  PickerHiddenTagsSubscribers_2,
  registerHiddenPickerTag,
  subscribeHiddenPickerTags,
};
export function installEditorPickerHiddenTags(): () => void {
  return () => {
    PickerHiddenTagsPattern = /^[a-z0-9-]{1,48}$/;
    PickerHiddenTagsSubscribers = new Set();
    PickerHiddenTagsSubscribers_2 = new Set();
    PickerHiddenTagsItems = [];
  };
}

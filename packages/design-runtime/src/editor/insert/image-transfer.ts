/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { afterNextPaint, createDropGhost, isSvgFile, markDropPerformance } from "../../canvas/working-state";
import { canDecodeRasterImage } from "../clipboard/image-validation";
import { createElementEditId } from "../geometry/snapping";
import { DcTplAttribute } from "../html/authoring";
import { StyleValue } from "./file-drops";

var InsertImageTransferLimit: Dynamic;
function receiveFileDrops(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  (0, markDropPerformance)("received");
  let value: Dynamic =
      context == null
        ? []
        : input.map(
            (input2?: Dynamic, options2?: Dynamic): Dynamic =>
              (0, createDropGhost)({
                file: options,
                page: null,
                x: Math.round(context.x - 160) + options2 * 24,
                y: Math.round(context.y - 100) + options2 * 24,
                w: 320,
                h: 200,
              }),
          ),
    flag: Dynamic = false,
    value2: Dynamic =
      value.length > 0 ? (0, afterNextPaint)() : Promise.resolve();
  return {
    marks: input.map(
      (input2?: Dynamic, options2?: Dynamic): Dynamic =>
        (0, createElementEditId)(options2),
    ),
    sized: input.map(
      (input2?: Dynamic): Dynamic =>
        (0, isSvgFile)(input2)
          ? Promise.resolve(false)
          : value2.then(
              (): Dynamic => (0, canDecodeRasterImage)(input2),
            ),
    ),
    place: (input2?: Dynamic, options2?: Dynamic): Dynamic =>
      value[input2]?.place(options2),
    landed: (): Dynamic => {
      flag = true;
      for (let value3 of value as Dynamic) value3.landed();
    },
    end: (): Dynamic => {
      for (let value3 of value.splice(0) as Dynamic) flag || value3.cancel();
    },
  };
}
function rememberImageInsert(items?: Dynamic, options?: Dynamic): Dynamic {
  items.push(options);
  items.length > InsertImageTransferLimit &&
    items.splice(0, items.length - InsertImageTransferLimit);
}
function patchInsertedImages(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let flag: Dynamic = false;
  for (let value of input as Dynamic)
    if (value.name === options)
      for (let value2 of context.elementsByAttr(
        "src",
        value.src,
      ) as Dynamic) {
        let value3: Dynamic = parseInt(
          value2.getAttribute(DcTplAttribute) ?? "-1",
          10,
        );
        if (!(value3 < 0)) {
          for (let [value4, value5] of Object.entries(value.attrs) as Dynamic)
            value4.startsWith(StyleValue)
              ? context.setStyleProperty?.(
                  value3,
                  value4.slice(StyleValue.length),
                  value5,
                )
              : context.setAttribute(value3, value4, value5);
          flag = true;
        }
      }
  return flag;
}
function droppedImageWidth(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = Math.round(options * 0.45),
    value2: Dynamic = Math.round(
      context * 0.5 * (input.width / Math.max(1, input.height)),
    );
  return Math.max(1, Math.min(input.width, value, value2));
}
function clampDroppedImagePosition(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
  extra?: Dynamic,
  detail?: Dynamic,
): Dynamic {
  return {
    left: Math.min(
      Math.max(Math.round(input), 0),
      Math.max(0, Math.round(extra - context)),
    ),
    top: Math.min(
      Math.max(Math.round(options), 0),
      Math.max(0, Math.round(detail - value)),
    ),
  };
}
export {
  clampDroppedImagePosition,
  droppedImageWidth,
  InsertImageTransferLimit,
  patchInsertedImages,
  receiveFileDrops,
  rememberImageInsert,
};
export function installEditorInsertImageTransfer(): () => void {
  return () => {
    InsertImageTransferLimit = 12;
  };
}

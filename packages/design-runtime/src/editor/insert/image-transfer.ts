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
  files?: Dynamic,
  ghostFile?: Dynamic,
  dropPoint?: Dynamic,
): Dynamic {
  markDropPerformance("received");
  let ghosts: Dynamic =
      dropPoint == null
        ? []
        : files.map(
            (file?: Dynamic, index?: Dynamic): Dynamic =>
              createDropGhost({
                file: ghostFile,
                page: null,
                x: Math.round(dropPoint.x - 160) + index * 24,
                y: Math.round(dropPoint.y - 100) + index * 24,
                w: 320,
                h: 200,
              }),
          ),
    hasLanded: Dynamic = false,
    paintReady: Dynamic =
      ghosts.length > 0 ? afterNextPaint() : Promise.resolve();
  return {
    marks: files.map(
      (file?: Dynamic, index?: Dynamic): Dynamic =>
        createElementEditId(index),
    ),
    sized: files.map(
      (file?: Dynamic): Dynamic =>
        isSvgFile(file)
          ? Promise.resolve(false)
          : paintReady.then(
              (): Dynamic => canDecodeRasterImage(file),
            ),
    ),
    place: (index?: Dynamic, placement?: Dynamic): Dynamic =>
      ghosts[index]?.place(placement),
    landed: (): Dynamic => {
      hasLanded = true;
      for (let ghost of ghosts as Dynamic) ghost.landed();
    },
    end: (): Dynamic => {
      for (let ghost of ghosts.splice(0) as Dynamic) hasLanded || ghost.cancel();
    },
  };
}
function rememberImageInsert(insertRecords?: Dynamic, insertRecord?: Dynamic): Dynamic {
  insertRecords.push(insertRecord);
  insertRecords.length > InsertImageTransferLimit &&
    insertRecords.splice(0, insertRecords.length - InsertImageTransferLimit);
}
function patchInsertedImages(
  insertedImages?: Dynamic,
  imageName?: Dynamic,
  documentEditor?: Dynamic,
): Dynamic {
  let hasPatched: Dynamic = false;
  for (let insertedImage of insertedImages as Dynamic)
    if (insertedImage.name === imageName)
      for (let element of documentEditor.elementsByAttr(
        "src",
        insertedImage.src,
      ) as Dynamic) {
        let editId: Dynamic = parseInt(
          element.getAttribute(DcTplAttribute) ?? "-1",
          10,
        );
        if (!(editId < 0)) {
          for (let [attrName, attrValue] of Object.entries(insertedImage.attrs) as Dynamic)
            attrName.startsWith(StyleValue)
              ? documentEditor.setStyleProperty?.(
                  editId,
                  attrName.slice(StyleValue.length),
                  attrValue,
                )
              : documentEditor.setAttribute(editId, attrName, attrValue);
          hasPatched = true;
        }
      }
  return hasPatched;
}
function droppedImageWidth(
  image?: Dynamic,
  containerWidth?: Dynamic,
  containerHeight?: Dynamic,
): Dynamic {
  let widthLimit: Dynamic = Math.round(containerWidth * 0.45),
    heightLimitedWidth: Dynamic = Math.round(
      containerHeight * 0.5 * (image.width / Math.max(1, image.height)),
    );
  return Math.max(1, Math.min(image.width, widthLimit, heightLimitedWidth));
}
function clampDroppedImagePosition(
  left?: Dynamic,
  top?: Dynamic,
  width?: Dynamic,
  height?: Dynamic,
  containerWidth?: Dynamic,
  containerHeight?: Dynamic,
): Dynamic {
  return {
    left: Math.min(
      Math.max(Math.round(left), 0),
      Math.max(0, Math.round(containerWidth - width)),
    ),
    top: Math.min(
      Math.max(Math.round(top), 0),
      Math.max(0, Math.round(containerHeight - height)),
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

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { previewImageFile } from "../../canvas/working-state";
import { DcTplAttribute } from "../html/authoring";
import { insertUploadedFiles, StyleValue } from "../insert/file-drops";
import { MediaObjectCropTest } from "./object-crop";

function imageElementSizing(
  model?: Dynamic,
  tid?: Dynamic,
  element?: Dynamic,
): Dynamic {
  let widthAttribute: Dynamic = element.getAttribute("width"),
    heightAttribute: Dynamic = element.getAttribute("height"),
    styleWidth: Dynamic = model.inlineStyleValue(tid, "width") || null,
    styleHeight: Dynamic = model.inlineStyleValue(tid, "height") || null,
    styleAspectRatio: Dynamic = model.inlineStyleValue(tid, "aspect-ratio") || null,
    isExplicit: Dynamic = (cssValue?: Dynamic): Dynamic =>
      cssValue != null && cssValue !== "auto";
  return {
    pin:
      (!!widthAttribute &&
        !!heightAttribute &&
        styleWidth === `${widthAttribute}px` &&
        styleAspectRatio === `${widthAttribute} / ${heightAttribute}` &&
        !isExplicit(styleHeight)) ||
      (!widthAttribute &&
        !heightAttribute &&
        !isExplicit(styleWidth) &&
        !isExplicit(styleHeight) &&
        !isExplicit(styleAspectRatio)),
    old: {
      width: widthAttribute,
      height: heightAttribute,
      styleWidth: styleWidth,
      styleHeight: styleHeight,
      styleAspectRatio: styleAspectRatio,
    },
  };
}
async function replaceSelectedImage(params?: Dynamic): Promise<Dynamic> {
  let {
      file: file,
      el: targetEl,
      getModel: getModel,
      upload: upload,
      pushUndo: pushUndo,
      afterPatch: afterPatch,
      recordSettled: recordSettled,
    }: Dynamic = params,
    isCurrent: Dynamic = params.isCurrent ?? ((): Dynamic => true),
    previewFile: Dynamic = params.preview ?? previewImageFile,
    tid: Dynamic = parseInt(
      targetEl.getAttribute(DcTplAttribute) ?? "-1",
      10,
    ),
    srcAttribute: Dynamic = targetEl.getAttribute("src"),
    altAttribute: Dynamic = targetEl.getAttribute("alt"),
    sizing: Dynamic = imageElementSizing(getModel(), tid, targetEl),
    revertAttributes: Dynamic = {
      width: sizing.old.width,
      height: sizing.old.height,
      ...(sizing.pin
        ? {
            [`${StyleValue}width`]: sizing.old.styleWidth,
            [`${StyleValue}height`]: sizing.old.styleHeight,
            [`${StyleValue}aspect-ratio`]:
              sizing.old.styleAspectRatio,
          }
        : {}),
    },
    hasPushedUndo: Dynamic = false,
    savedObjectStyles: Dynamic = null,
    relName: Dynamic = null,
    uploadedSrc: Dynamic = null,
    withoutGeneratedAlt: Dynamic = (attrs?: Dynamic): Dynamic => {
      if (!("alt" in attrs) || altAttribute == null) return attrs;
      let { alt: omittedAlt, ...restAttrs }: Dynamic = attrs;
      return restAttrs;
    },
    isApplied: Dynamic = false;
  return {
    failed:
      (await insertUploadedFiles({
        files: [file],
        targets: [targetEl],
        upload: async (uploadFile?: Dynamic): Promise<Dynamic> => {
          let uploaded: Dynamic = await upload(uploadFile);
          relName = uploaded.relName;
          uploadedSrc = uploaded.src;
          return uploaded;
        },
        preview: previewFile,
        patch: (element?: Dynamic, attrs?: Dynamic): Dynamic => {
          if (!isCurrent()) return true;
          let model: Dynamic = getModel(),
            elementTid: Dynamic = parseInt(
              element.getAttribute(DcTplAttribute) ?? "-1",
              10,
            );
          if (elementTid < 0 || model.element(elementTid) !== element)
            return false;
          let attrsToApply: Dynamic = withoutGeneratedAlt(attrs),
            changes: Dynamic = Object.entries(attrsToApply).filter(
              ([key, expected]: Dynamic): Dynamic =>
                key.startsWith(StyleValue)
                  ? (model.inlineStyleValue(
                      elementTid,
                      key.slice(StyleValue.length),
                    ) || null) !== expected
                  : element.getAttribute(key) !== expected,
            );
          if (changes.length === 0) return true;
          hasPushedUndo || (pushUndo(), (hasPushedUndo = true));
          for (let [key, newValue] of changes as Dynamic)
            key.startsWith(StyleValue)
              ? model.setStyleProperty(
                  elementTid,
                  key.slice(StyleValue.length),
                  newValue,
                )
              : model.setAttribute(elementTid, key, newValue);
          let srcChange: Dynamic = changes.find(
            ([key]: Dynamic): Dynamic => key === "src",
          );
          if (srcChange && (srcChange[1] ?? "") === (srcAttribute ?? "")) {
            for (let [property, propertyValue] of (savedObjectStyles ?? []) as Dynamic)
              model.setStyleProperty(elementTid, property, propertyValue);
            savedObjectStyles = null;
          } else if (
            srcChange &&
            savedObjectStyles === null &&
            ((savedObjectStyles = [
              "object-fit",
              "object-view-box",
              "object-position",
            ].map(
              (property?: Dynamic): Dynamic => [
                property,
                model.inlineStyleValue(elementTid, property) || null,
              ],
            )),
            MediaObjectCropTest(
              (property?: Dynamic): Dynamic =>
                model.inlineStyleValue(elementTid, property),
            ))
          )
            for (let property of [
              "object-view-box",
              "object-position",
            ] as Dynamic)
              model.setStyleProperty(elementTid, property, null);
          uploadedSrc != null && attrs.src === uploadedSrc && (isApplied = true);
          afterPatch();
          return true;
        },
        relocate: (src?: Dynamic): Dynamic =>
          getModel().elementsByAttr("src", src)[0] ?? null,
        readSrc: (element?: Dynamic): Dynamic => element.getAttribute("src"),
        onSettled: (src?: Dynamic, attrs?: Dynamic): Dynamic =>
          recordSettled({
            src: src,
            attrs: withoutGeneratedAlt(attrs),
          }),
        previewAttrs: (size?: Dynamic): Dynamic =>
          sizing.pin
            ? {
                width: String(size.width),
                height: String(size.height),
                [`${StyleValue}width`]: `${size.width}px`,
                [`${StyleValue}height`]: "auto",
                [`${StyleValue}aspect-ratio`]: `${size.width} / ${size.height}`,
              }
            : {},
        revertAttrs: revertAttributes,
        yieldCleanupAttrs: sizing.pin
          ? {
              width: null,
              height: null,
              [`${StyleValue}width`]: null,
              [`${StyleValue}height`]: null,
              [`${StyleValue}aspect-ratio`]: null,
            }
          : {},
        placeholderSrc: srcAttribute ?? "",
        swapOverPlaceholder: false,
      })) > 0,
    relName: relName,
    src: uploadedSrc,
    applied: isApplied,
  };
}
export {
  imageElementSizing,
  replaceSelectedImage,
};
export function installEditorMediaImageReplacement(): () => void {
  return () => {};
}

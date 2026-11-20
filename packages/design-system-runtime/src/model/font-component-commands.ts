/** Restored application module; prepare first, initialize in original order. */
import type * as Model from "../contracts";
import type * as Core from "../contracts/model-core";
import type { UploadFontInput } from "../contracts/application";
import { setFileStorageRecord } from "./asset-commands";
import { parsedDesignSystem } from "./derive-system";
import { deleteDesignSystemFiles, sanitizeUploadFileName, setDesignSystemFile, unusedFileName } from "./file-commands";
import { COMPONENT_FILENAMES, COMPONENT_NAME_PATTERN, DESIGN_SYSTEM_PATHS, isTextFilePath, parseDataUriHeader, parseStoragePointer } from "./file-policy";
import { pruneUnusedFontFamilies, updateTokens } from "./token-commands";
import { FONT_STACK_PATTERN } from "./tokens";

function componentGuidelinesPath(
  system: Model.ParsedDesignSystem,
  componentName: string,
) {
  return (
    system.components.find((component): boolean => component.name === componentName)
      ?.guidelinesPath ??
    DESIGN_SYSTEM_PATHS.componentsDir +
      componentName +
      "/" +
      COMPONENT_FILENAMES.readme
  );
}
function setComponentGuidelines(
  content: Model.DesignSystemContent,
  componentName: string,
  markdown: string,
) {
  let system = parsedDesignSystem(content);
  if (
    !COMPONENT_NAME_PATTERN.test(componentName) ||
    !system.components.some((component): boolean => component.name === componentName)
  ) {
    return content;
  }
  let path = componentGuidelinesPath(system, componentName);
  if ((content.files[path] ?? "") === markdown) {
    return content;
  }
  if (markdown === "") {
    return deleteDesignSystemFiles(content, [path]);
  }
  return setDesignSystemFile(content, path, markdown);
}
function addFontFace(
  content: Model.DesignSystemContent,
  font: UploadFontInput,
): Model.DesignSystemContent {
  let family = font.family.trim();
  if (
    family === "" ||
    !FONT_STACK_PATTERN.test(family) ||
    /["']/.test(family)
  ) {
    return content;
  }
  if (
    parseDataUriHeader(font.value) === null &&
    parseStoragePointer(font.value) === null
  ) {
    return content;
  }
  let filename = unusedFileName(
      content.files,
      "fonts",
      sanitizeUploadFileName(font.fileName),
    ),
    path = DESIGN_SYSTEM_PATHS.fontsDir + filename;
  if (isTextFilePath(path)) {
    return content;
  }
  let withFile = setDesignSystemFile(content, path, font.value);
  if (withFile === content) {
    return content;
  }
  if (
    font.record !== undefined &&
    parseStoragePointer(font.value) !== null
  ) {
    withFile = setFileStorageRecord(withFile, path, font.record);
  }
  let withFont = updateTokens(withFile, (fontCatalog): boolean => {
    let state: Model.FontFace = {
      family: family,
      file: path,
      weight: font.weight.trim() || "400",
      style: font.style,
    };
    fontCatalog.type.fonts.push(state);
    return true;
  });
  if (withFont === withFile) {
    return content;
  } else {
    return withFont;
  }
}
function deleteFontFace(
  content: Model.DesignSystemContent,
  path: string,
): Model.DesignSystemContent {
  let withoutFile = deleteDesignSystemFiles(content, [path]),
    withoutFont = updateTokens(withoutFile, (fontCatalog): boolean => {
      let length = fontCatalog.type.fonts.length;
      fontCatalog.type.fonts = fontCatalog.type.fonts.filter(
        (font): boolean => font.file !== path,
      );
      if (fontCatalog.type.fonts.length === length) {
        return false;
      }
      pruneUnusedFontFamilies(fontCatalog);
      return true;
    });
  if (withoutFont === content) {
    return content;
  } else {
    return withoutFont;
  }
}
function removeMissingFontReferences(
  content: Model.DesignSystemContent,
): Model.DesignSystemContent {
  return updateTokens(content, (fontCatalog): boolean => {
    let length = fontCatalog.type.fonts.length;
    fontCatalog.type.fonts = fontCatalog.type.fonts.filter((font) =>
      Object.hasOwn(content.files, font.file),
    );
    if (fontCatalog.type.fonts.length === length) {
      return false;
    }
    pruneUnusedFontFamilies(fontCatalog);
    return true;
  });
}
export {
  addFontFace,
  componentGuidelinesPath,
  deleteFontFace,
  removeMissingFontReferences,
  setComponentGuidelines,
};
export function installModelFontComponentCommands(): () => void {
  return () => {};
}

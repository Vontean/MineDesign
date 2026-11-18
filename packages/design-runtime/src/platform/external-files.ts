/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { sameOriginFileFetcher, setDeclarationReferences } from "../design-system/type-declarations";
import { encodeStorePathSegment, FilesValue, isFullProjectPath, isProjectTextFilePath, isTypeDeclarationPath, PlatformFileContentResolvedValue_10, ProjectValue } from "./file-content";
import { PlatformFileReferencesLimit, PlatformFileReferencesLimit_2, PlatformFileReferencesResolvedValue } from "./file-references";

var PlatformExternalFilesItems: Dynamic;
var PlatformExternalFilesResolvedValue: Dynamic;
var parseFileReferencesValue: Dynamic;
var PlatformExternalFilesProjectWoffPattern: Dynamic;
var PlatformExternalFilesSubscribers: Dynamic;
var PlatformExternalFilesMapValue: Dynamic;
var PlatformExternalFilesResolvedValue_2: Dynamic;
var PlatformExternalFilesSubscribers_2: Dynamic;
var PlatformExternalFilesAlias: Dynamic;
function getAllFileReferencePaths(): Dynamic {
  return [
    ...PlatformExternalFilesResolvedValue,
    ...parseFileReferencesValue.map((input?: Dynamic): Dynamic => input.path),
    ...PlatformExternalFilesMapValue.map(
      (input?: Dynamic): Dynamic => input.path,
    ),
  ];
}
function parseFontFileReferences(input?: Dynamic): Dynamic {
  let items: Dynamic = [];
  if (input === null || typeof input != "object" || Array.isArray(input))
    return items;
  let index: Dynamic = 0,
    items2: Dynamic = [];
  for (let [value, value2] of Object.entries(input) as Dynamic) {
    let value3: Dynamic = value.slice(ProjectValue.length),
      value4: Dynamic = value2?.size;
    if (
      !(
        !isFullProjectPath(value) ||
        PlatformExternalFilesSubscribers.has(value.toLowerCase()) ||
        PlatformExternalFilesProjectWoffPattern.test(value)
      )
    ) {
      if (isTypeDeclarationPath(value3)) {
        items2.length < PlatformFileReferencesLimit_2 &&
        !(
          typeof value4 == "number" &&
          value4 > PlatformFileContentResolvedValue_10
        )
          ? items2.push({
              path: value3,
              file: value,
              ...(typeof value4 == "number"
                ? {
                    bytes: value4,
                  }
                : {}),
            })
          : index++;
        continue;
      }
      if (
        !isProjectTextFilePath(value3) ||
        items.length >= PlatformFileReferencesLimit ||
        (typeof value4 == "number" &&
          value4 > PlatformFileReferencesResolvedValue)
      ) {
        index++;
        continue;
      }
      items.push({
        path: value3,
        file: value,
        ...(typeof value4 == "number"
          ? {
              bytes: value4,
            }
          : {}),
      });
    }
  }
  return Object.assign(
    items,
    index > 0
      ? {
          dropped: index,
        }
      : {},
    items2.length > 0
      ? {
          types: items2,
        }
      : {},
  );
}
function setExternalFileReferences(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  options ??= sameOriginFileFetcher();
  PlatformExternalFilesSubscribers_2 = new Set(context);
  PlatformExternalFilesMapValue = [...input]
    .sort(
      ([input2]: Dynamic, [options2]: Dynamic): Dynamic =>
        input2 < options2 ? -1 : input2 > options2 ? 1 : 0,
    )
    .map(
      ([input2, input3]: Dynamic): Dynamic => ({
        path: input2,
        file: input3.ref.startsWith("blob:")
          ? input3.ref
          : "/" + input3.ref.replace(/^\//, ""),
        ...(input3.bytes > 0
          ? {
              bytes: input3.bytes,
            }
          : {}),
      }),
    );
  setDeclarationReferences(
    getTypeDeclarationReferences(),
    options,
  );
}
function getExternalFileReferences(): Dynamic {
  return PlatformExternalFilesMapValue.map(
    (input?: Dynamic): Dynamic => ({
      path: input.path,
      ref: input.file.replace(/^\//, ""),
    }),
  );
}
function setFileReferenceStore(input?: Dynamic): Dynamic {
  PlatformExternalFilesAlias = input;
}
async function saveExternalFileReference(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
  extra?: Dynamic,
): Promise<Dynamic> {
  if (PlatformExternalFilesAlias === undefined) return "no-store";
  let value2: Dynamic = encodeStorePathSegment(
    input,
  ).toLowerCase();
  return extra(input) ||
    PlatformExternalFilesMapValue.some(
      (input2?: Dynamic): Dynamic =>
        input2.path.toLowerCase() === input.toLowerCase(),
    ) ||
    [...PlatformExternalFilesSubscribers_2].some(
      (input2?: Dynamic): Dynamic => input2.toLowerCase() === value2,
    )
    ? "taken"
    : (PlatformExternalFilesSubscribers_2.add(
        encodeStorePathSegment(input),
      ),
      await PlatformExternalFilesAlias.set(
        FilesValue + "/" + encodeStorePathSegment(input),
        {
          path: input,
          kind: "text",
          dataRef: options,
          dataBytes: context,
          contentType: value,
        },
      ),
      "written");
}
function getTypeDeclarationReferences(): Dynamic {
  let value: Dynamic = PlatformExternalFilesMapValue.filter(
    (input?: Dynamic): Dynamic =>
      isTypeDeclarationPath(input.path) &&
      !((input.bytes ?? 0) > PlatformFileContentResolvedValue_10),
  );
  return [
    ...value,
    ...PlatformExternalFilesResolvedValue_2.filter(
      (input?: Dynamic): Dynamic =>
        !value.some(
          (input2?: Dynamic): Dynamic => input2.path === input.path,
        ),
    ),
  ].slice(0, PlatformFileReferencesLimit_2);
}
export {
  getAllFileReferencePaths,
  getExternalFileReferences,
  getTypeDeclarationReferences,
  parseFileReferencesValue,
  parseFontFileReferences,
  PlatformExternalFilesAlias,
  PlatformExternalFilesItems,
  PlatformExternalFilesMapValue,
  PlatformExternalFilesProjectWoffPattern,
  PlatformExternalFilesResolvedValue,
  PlatformExternalFilesResolvedValue_2,
  PlatformExternalFilesSubscribers,
  PlatformExternalFilesSubscribers_2,
  saveExternalFileReference,
  setExternalFileReferences,
  setFileReferenceStore,
};
export function set_parseFileReferencesValue(value: any): any {
  parseFileReferencesValue = value;
  return value;
}
export function set_PlatformExternalFilesItems(value: any): any {
  PlatformExternalFilesItems = value;
  return value;
}
export function set_PlatformExternalFilesResolvedValue(value: any): any {
  PlatformExternalFilesResolvedValue = value;
  return value;
}
export function set_PlatformExternalFilesResolvedValue_2(value: any): any {
  PlatformExternalFilesResolvedValue_2 = value;
  return value;
}
export function installPlatformExternalFiles(): () => void {
  return () => {
    PlatformExternalFilesItems = [];
    PlatformExternalFilesResolvedValue = [];
    parseFileReferencesValue = [];
    PlatformExternalFilesProjectWoffPattern =
      /^project\/ds\/[^/]+\/.+\.(woff2|woff|ttf|otf)$/i;
    PlatformExternalFilesSubscribers = new Set([
      ProjectValue + "manifest.json",
      ProjectValue + "design-system.json",
    ]);
    PlatformExternalFilesMapValue = [];
    PlatformExternalFilesResolvedValue_2 = [];
    PlatformExternalFilesSubscribers_2 = new Set();
  };
}

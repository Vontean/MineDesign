/** Restored application module; prepare first, initialize in original order. */
import type * as Model from "../contracts";
import type * as Core from "../contracts/model-core";
import type { UploadFontInput } from "../contracts/application";
import { DESIGN_SYSTEM_PATHS } from "./file-policy";

var PACKAGED_LIBRARY_CATALOG: Core.PackagedLibrary[];
var REACT_LIBRARY_CATALOG: Core.PackagedLibrary[];
var LIBRARY_NAME_PATTERN: RegExp;
var LIBRARY_VERSION_PATTERN: RegExp;
var PACKAGED_LIBRARY_PATH_PATTERN: RegExp;
function findPackagedLibrary(
  name: string,
  catalog = PACKAGED_LIBRARY_CATALOG,
) {
  return catalog.find((library): boolean => library.name === name);
}
function matchesLibraryVersion(
  availableVersion: string,
  requestedVersion: string,
) {
  if (availableVersion === requestedVersion) {
    return true;
  }
  return availableVersion.startsWith(requestedVersion + ".");
}
function resolvePreviewLibraries(
  declared: Model.DeclaredLibrary[],
  hasFile: (path: string) => boolean = (): boolean => false,
  catalog = PACKAGED_LIBRARY_CATALOG,
  allowCdn = false,
) {
  let load: Model.LoadedLibrary[] = [],
    fetchLibraries: Model.FetchLibrary[] = [],
    missing: string[] = [],
    missingFiles: string[] = [],
    visited = new Set<string>(),
    visit = (libraryToVisit: Model.DeclaredLibrary): void => {
      if (visited.has(libraryToVisit.name)) {
        return;
      }
      visited.add(libraryToVisit.name);
      let value = catalog.find(
        (candidate) =>
          candidate.name === libraryToVisit.name &&
          matchesLibraryVersion(candidate.version, libraryToVisit.version),
      );
      if (value !== undefined) {
        for (let dependencyName of value.requires) {
          let packagedLibrary = findPackagedLibrary(dependencyName, catalog);
          if (packagedLibrary === undefined) {
            continue;
          }
          visit(
            declared.find((declaredLibrary): boolean => declaredLibrary.name === dependencyName) ?? {
              name: packagedLibrary.name,
              version: packagedLibrary.version,
            },
          );
        }
      }
      let packedFile = libraryToVisit.file ?? value?.packedFile;
      if (packedFile !== undefined && hasFile(packedFile)) {
        load.push({
          name: libraryToVisit.name,
          version: libraryToVisit.version,
          global: libraryToVisit.global ?? value?.provides[0] ?? null,
          file: packedFile,
        });
      } else if (
        allowCdn &&
        value !== undefined &&
        value.requires.every((dependency) =>
          fetchLibraries.some((library): boolean => library.name === dependency),
        )
      ) {
        fetchLibraries.push({
          name: value.name,
          version: value.version,
          global: value.provides[0] ?? null,
          url: value.cdn.url,
          integrity: value.cdn.integrity,
        });
      } else if (
        (missing.push(libraryToVisit.name + " " + libraryToVisit.version), packedFile !== undefined)
      ) {
        missingFiles.push(packedFile);
      }
    };
  for (let value of declared) {
    visit(value);
  }
  return {
    load: load,
    fetch: fetchLibraries,
    missing: missing,
    missingFiles: missingFiles,
  };
}
function serializeResolvedLibraries(
  declared: Model.DeclaredLibrary[],
  resolved: Model.ResolvedLibraries,
  catalog = PACKAGED_LIBRARY_CATALOG,
) {
  return declared.map((library) => {
    let value = resolved.load.find(
        (candidate): boolean => candidate.name === library.name,
      ),
      globalName =
        library.global ?? findPackagedLibrary(library.name, catalog)?.provides[0];
    return {
      name: library.name,
      version: library.version,
      ...(globalName !== undefined
        ? {
            global: globalName,
          }
        : {}),
      ...(value !== undefined
        ? {
            file: value.file,
          }
        : {}),
    };
  });
}
function inferDeclaredLibraries(
  declared: Model.DeclaredLibrary[],
  hasFile: (path: string) => boolean,
  catalog = PACKAGED_LIBRARY_CATALOG,
) {
  if (declared.length > 0) {
    return declared.map((library) => ({
      ...library,
    }));
  }
  return catalog
    .filter((library) => hasFile(library.packedFile))
    .map((library) => ({
      name: library.name,
      version: library.version.split(".")[0],
    }));
}
export {
  findPackagedLibrary,
  inferDeclaredLibraries,
  LIBRARY_NAME_PATTERN,
  LIBRARY_VERSION_PATTERN,
  matchesLibraryVersion,
  PACKAGED_LIBRARY_CATALOG,
  PACKAGED_LIBRARY_PATH_PATTERN,
  REACT_LIBRARY_CATALOG,
  resolvePreviewLibraries,
  serializeResolvedLibraries,
};
export function installModelLibraries(): () => void {
  return () => {
    // MineDesign: previews take React 18.3.1 from the editor page's own copy (artifact-type/vendor/, put there by
    // apps/design-system-editor/build.mjs), not from jsDelivr: MineDesign's CSP admits no CDN, and the desktop app
    // works offline. The files are the npm package's UMD builds, the same bytes jsDelivr serves, so the integrity
    // values stay. The address is root-relative, as editor/swatch-runtime.tsx requires.
    let pageVendorUrl = (file: string): string => {
      try {
        return new URL("artifact-type/vendor/" + file, document.baseURI).pathname;
      } catch {
        return "/artifact-type/vendor/" + file;
      }
    };
    PACKAGED_LIBRARY_CATALOG = [
      {
        name: "react",
        version: "18.3.1",
        provides: ["React"],
        requires: [],
        packedFile:
          DESIGN_SYSTEM_PATHS.libDir + "react.production.min.js",
        sha256:
          "d949f1c3687aedadcedac85261865f29b17cd273997e7f6b2bfc53b2f9d4c4dd",
        cdn: {
          url: pageVendorUrl("react.production.min.js"),
          integrity:
            "sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z",
        },
      },
      {
        name: "react-dom",
        version: "18.3.1",
        provides: ["ReactDOM"],
        requires: ["react"],
        packedFile:
          DESIGN_SYSTEM_PATHS.libDir + "react-dom.production.min.js",
        sha256:
          "35f4f974f4b2bcd44da73963347f8952e341f83909e4498227d4e26b98f66f0d",
        cdn: {
          url: pageVendorUrl("react-dom.production.min.js"),
          integrity:
            "sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1",
        },
      },
    ];
    REACT_LIBRARY_CATALOG = PACKAGED_LIBRARY_CATALOG.filter(
      (library) => library.name === "react" || library.name === "react-dom",
    );
    LIBRARY_NAME_PATTERN = /^[a-z][a-z0-9._-]{0,40}$/;
    LIBRARY_VERSION_PATTERN = /^\d{1,4}(?:\.\d{1,4}){0,2}$/;
    PACKAGED_LIBRARY_PATH_PATTERN = /^components\/lib\/[^/]{1,120}\.m?js$/;
  };
}

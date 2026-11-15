/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var DesignSystemPathsPattern: Dynamic;
var PathCheckError: Dynamic;
var DesignSystemPathsResolvedValue: Dynamic;
var DesignSystemPathsConstant: Dynamic;
var DesignSystemPathsConstant_2: Dynamic;
var DesignSystemPathsConstant_3: Dynamic;
var DesignSystemPathsConstant_4: Dynamic;
var DesignSystemPathsResolvedValue_2: Dynamic;
var DesignSystemPathsLabel: Dynamic;
var designSystemFilePathPattern: Dynamic;
var DesignSystemPathsPattern_2: Dynamic;
var DesignSystemPathsPattern_3: Dynamic;
function isDesignSystemNamespace(input?: Dynamic): Dynamic {
  return typeof input == "string" && DesignSystemPathsPattern.test(input);
}
function designSystemProjectPrefix(input?: Dynamic): Dynamic {
  if (!isDesignSystemNamespace(input))
    throw new PathCheckError("bad_namespace", String(input));
  return "project/ds/" + input + "/";
}
export {
  designSystemFilePathPattern,
  DesignSystemPathsConstant,
  DesignSystemPathsConstant_2,
  DesignSystemPathsConstant_3,
  DesignSystemPathsConstant_4,
  DesignSystemPathsLabel,
  DesignSystemPathsPattern,
  DesignSystemPathsPattern_2,
  DesignSystemPathsPattern_3,
  DesignSystemPathsResolvedValue,
  DesignSystemPathsResolvedValue_2,
  designSystemProjectPrefix,
  isDesignSystemNamespace,
  PathCheckError,
};
export function installDesignSystemPaths(): () => void {
  return () => {
    DesignSystemPathsPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
    PathCheckError = class extends Error {
      declare name: Dynamic;
      constructor(input: Dynamic, options: Dynamic) {
        super(input + ": " + JSON.stringify(options));
        this.code = input;
        this.subject = options;
        this.name = "PathCheckError";
      }
      code: Dynamic;
      subject: Dynamic;
    };
    DesignSystemPathsResolvedValue = 256 * 1024 * 1024;
    DesignSystemPathsConstant = 4;
    DesignSystemPathsConstant_2 = 200;
    DesignSystemPathsConstant_3 = 2e3;
    DesignSystemPathsConstant_4 = 224;
    DesignSystemPathsResolvedValue_2 = 1024 * 1024;
    DesignSystemPathsLabel =
      "[A-Za-z0-9_](?:(?:[A-Za-z0-9._-]| (?=[A-Za-z0-9_]))*[A-Za-z0-9_-])?";
    designSystemFilePathPattern = new RegExp(
      "^" + DesignSystemPathsLabel + "(?:/" + DesignSystemPathsLabel + ")*$",
    );
    DesignSystemPathsPattern_2 =
      /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069\u{e0000}-\u{e007f}]/u;
    DesignSystemPathsPattern_3 =
      /[\u0000-\u001f\u007f-\u009f\u061c\u2028\u2029\u202a-\u202e\u2066-\u2069\u{e0000}-\u{e007f}]/u;
  };
}

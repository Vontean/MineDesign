/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var DesignSystemPathsPattern: Dynamic;
var PathCheckError: Dynamic;
var DesignSystemPathsResolvedValue: Dynamic;
var DesignSystemPathsConstant: Dynamic;
var maxDisplayTextLength: Dynamic;
var maxArtifactTextLength: Dynamic;
var DesignSystemPathsConstant_4: Dynamic;
var maxTokensFileBytes: Dynamic;
var DesignSystemPathsLabel: Dynamic;
var designSystemFilePathPattern: Dynamic;
var strictControlCharPattern: Dynamic;
var titleControlCharPattern: Dynamic;
function isDesignSystemNamespace(namespaceId?: Dynamic): Dynamic {
  return typeof namespaceId == "string" && DesignSystemPathsPattern.test(namespaceId);
}
function designSystemProjectPrefix(namespaceId?: Dynamic): Dynamic {
  if (!isDesignSystemNamespace(namespaceId))
    throw new PathCheckError("bad_namespace", String(namespaceId));
  return "project/ds/" + namespaceId + "/";
}
export {
  designSystemFilePathPattern,
  DesignSystemPathsConstant,
  maxDisplayTextLength as DesignSystemPathsConstant_2,
  maxArtifactTextLength as DesignSystemPathsConstant_3,
  DesignSystemPathsConstant_4,
  DesignSystemPathsLabel,
  DesignSystemPathsPattern,
  strictControlCharPattern as DesignSystemPathsPattern_2,
  titleControlCharPattern as DesignSystemPathsPattern_3,
  DesignSystemPathsResolvedValue,
  maxTokensFileBytes as DesignSystemPathsResolvedValue_2,
  designSystemProjectPrefix,
  isDesignSystemNamespace,
  PathCheckError,
};
export function installDesignSystemPaths(): () => void {
  return () => {
    DesignSystemPathsPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
    PathCheckError = class extends Error {
      declare name: Dynamic;
      constructor(code: Dynamic, subject: Dynamic) {
        super(code + ": " + JSON.stringify(subject));
        this.code = code;
        this.subject = subject;
        this.name = "PathCheckError";
      }
      code: Dynamic;
      subject: Dynamic;
    };
    DesignSystemPathsResolvedValue = 256 * 1024 * 1024;
    DesignSystemPathsConstant = 4;
    maxDisplayTextLength = 200;
    maxArtifactTextLength = 2e3;
    DesignSystemPathsConstant_4 = 224;
    maxTokensFileBytes = 1024 * 1024;
    DesignSystemPathsLabel =
      "[A-Za-z0-9_](?:(?:[A-Za-z0-9._-]| (?=[A-Za-z0-9_]))*[A-Za-z0-9_-])?";
    designSystemFilePathPattern = new RegExp(
      "^" + DesignSystemPathsLabel + "(?:/" + DesignSystemPathsLabel + ")*$",
    );
    strictControlCharPattern =
      /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069\u{e0000}-\u{e007f}]/u;
    titleControlCharPattern =
      /[\u0000-\u001f\u007f-\u009f\u061c\u2028\u2029\u202a-\u202e\u2066-\u2069\u{e0000}-\u{e007f}]/u;
  };
}

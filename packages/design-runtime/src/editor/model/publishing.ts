/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseDcHtmlDocument, replaceDcTemplate } from "../html/dc-document";
import { getDcPropsJson, setDcScript } from "../html/dc-props";
import { getPendingPropKeys, getSavedPendingProps } from "./pending-props";

var ModelPublishingH1H2H3Config: Dynamic;
var ModelPublishingHandler: Dynamic;
async function publishModelChanges(
  doc?: Dynamic,
  projectRoot?: Dynamic,
  fileClient?: Dynamic,
  templateOverride?: Dynamic,
  callOptions?: Dynamic,
): Promise<Dynamic> {
  let src: Dynamic = doc.src,
    originalTemplate: Dynamic = doc.originalTemplate,
    baseVersion: Dynamic = doc.baseVersion,
    currentTemplate: Dynamic = templateOverride,
    pendingScript: Dynamic =
      callOptions && "pendingScriptAtCall" in callOptions
        ? callOptions.pendingScriptAtCall
        : doc.pendingScript,
    pendingScriptBase: Dynamic =
      callOptions && "pendingScriptBaseAtCall" in callOptions
        ? callOptions.pendingScriptBaseAtCall
        : doc.pendingScriptBase,
    pendingProps: Dynamic =
      callOptions && "pendingPropsAtCall" in callOptions
        ? callOptions.pendingPropsAtCall
        : doc.pendingProps,
    pendingPropsBase: Dynamic =
      callOptions && "pendingPropsBaseAtCall" in callOptions
        ? callOptions.pendingPropsBaseAtCall
        : doc.pendingPropsBase,
    buildNextSource: Dynamic = (sourceText?: Dynamic, parsedSource?: Dynamic): Dynamic => {
      let rewrittenSource: Dynamic = replaceDcTemplate(
        sourceText,
        parsedSource,
        currentTemplate,
      );
      if (pendingScript !== undefined) {
        let parsedNextSource: Dynamic = parseDcHtmlDocument(rewrittenSource);
        parsedNextSource &&
          (rewrittenSource = setDcScript(rewrittenSource, parsedNextSource, pendingScript));
      }
      if (pendingProps !== undefined) {
        let nextSourceWithProps: Dynamic = getPendingPropKeys(
          rewrittenSource,
          pendingProps,
        );
        if (nextSourceWithProps == null)
          throw new Error(
            "data-props became unspliceable; prop edit kept pending",
          );
        rewrittenSource = nextSourceWithProps;
      }
      return rewrittenSource;
    };
  !callOptions?.hasQueuedSuccessor &&
    (templateOverride === undefined || doc.model.serialize() === currentTemplate) &&
    doc.pendingScript === pendingScript &&
    doc.pendingProps === pendingProps &&
    (doc.dirty = false);
  let parsedCurrentSource: Dynamic = parseDcHtmlDocument(src);
  if (!parsedCurrentSource) {
    doc.dirty = true;
    return {
      kind: "failed",
      error: new Error("dc source is not parseable; edit kept pending"),
    };
  }
  if (
    pendingProps !== undefined &&
    getPendingPropKeys(src, pendingProps) == null
  ) {
    doc.dirty = true;
    return {
      kind: "failed",
      error: new Error(
        "data-props is not spliceable; prop edit kept pending",
      ),
    };
  }
  let settlePendingScript: Dynamic = (): Dynamic => {
      pendingScript !== undefined &&
        (doc.pendingScript === pendingScript
          ? ((doc.pendingScript = undefined),
            (doc.pendingScriptBase = undefined))
          : (doc.pendingScriptBase = pendingScript));
    },
    settlePendingProps: Dynamic = (savedSource?: Dynamic): Dynamic => {
      pendingProps !== undefined &&
        (doc.pendingProps === pendingProps
          ? ((doc.pendingProps = undefined),
            (doc.pendingPropsBase = undefined))
          : doc.pendingProps === undefined
            ? (doc.pendingPropsBase = undefined)
            : (doc.pendingPropsBase =
                getDcPropsJson(savedSource) ??
                doc.pendingPropsBase));
    },
    nextSource: Dynamic = buildNextSource(src, parsedCurrentSource),
    needsMirrorWrite: Dynamic =
      nextSource === src &&
      callOptions.diskIsMirror === true &&
      callOptions.mirrored !== nextSource;
  if (nextSource === src && !needsMirrorWrite) {
    settlePendingScript();
    settlePendingProps(src);
    let unchangedSettledProps: Dynamic = getSavedPendingProps(src, pendingProps);
    doc.originalTemplate = currentTemplate;
    return unchangedSettledProps !== undefined
      ? {
          kind: "noop",
          settledProps: unchangedSettledProps,
        }
      : {
          kind: "noop",
        };
  }
  let filePath: Dynamic = `${projectRoot}/${doc.path}`,
    wasRebased: Dynamic = false,
    localBaseline: Dynamic =
      baseVersion !== undefined
        ? {
            occToken: baseVersion,
          }
        : undefined,
    baseline: Dynamic =
      localBaseline !== undefined
        ? callOptions?.baselineAtCall?.occToken === localBaseline.occToken
          ? callOptions.baselineAtCall
          : localBaseline
        : callOptions?.baselineAtCall,
    readVersion: Dynamic;
  if (fileClient.readWithVersion && !needsMirrorWrite) {
    let diskFile: Dynamic = null;
    try {
      diskFile = await fileClient.readWithVersion(filePath);
    } catch {}
    try {
      if (
        diskFile &&
        !diskFile.isBase64 &&
        diskFile.content &&
        diskFile.content !== callOptions.mirrored
      ) {
        let diskDocument: Dynamic = parseDcHtmlDocument(
          diskFile.content,
        );
        if (
          diskDocument &&
          diskDocument.template === originalTemplate &&
          (pendingScript === undefined || diskDocument.js === pendingScriptBase) &&
          (pendingProps === undefined ||
            getDcPropsJson(diskFile.content) === pendingPropsBase) &&
          (diskFile.version !== undefined &&
            ((baseline = {
              occToken: diskFile.version,
              content: diskFile.content,
            }),
            (readVersion = diskFile.version),
            (doc.baseVersion === undefined ||
              diskFile.version > doc.baseVersion) &&
              (doc.baseVersion = diskFile.version)),
          diskFile.content !== src &&
            ((doc.src = diskFile.content),
            (nextSource = buildNextSource(diskFile.content, diskDocument)),
            (wasRebased = true),
            nextSource === diskFile.content))
        ) {
          settlePendingScript();
          settlePendingProps(diskFile.content);
          let diskSettledProps: Dynamic = getSavedPendingProps(
            diskFile.content,
            pendingProps,
          );
          return diskSettledProps !== undefined
            ? {
                kind: "noop",
                version: diskFile.version,
                settledProps: diskSettledProps,
              }
            : {
                kind: "noop",
                version: diskFile.version,
              };
        }
      }
    } catch (readError: Dynamic) {
      doc.dirty = true;
      return {
        kind: "failed",
        error: readError,
        version: readVersion,
      };
    }
  }
  let writeVersion: Dynamic;
  try {
    writeVersion = (
      await fileClient.write(
        filePath,
        nextSource,
        baseline
          ? {
              baseline: baseline,
            }
          : undefined,
      )
    )?.version;
  } catch (writeError: Dynamic) {
    doc.dirty = true;
    return {
      kind: "failed",
      error: writeError,
      version: readVersion,
    };
  }
  doc.src = nextSource;
  settlePendingScript();
  settlePendingProps(nextSource);
  let settledProps: Dynamic = getSavedPendingProps(nextSource, pendingProps);
  doc.originalTemplate = currentTemplate;
  doc.carriedEditCount = 0;
  {
    let latestVersion: Dynamic = writeVersion ?? readVersion;
    latestVersion !== undefined &&
      (doc.baseVersion === undefined || latestVersion > doc.baseVersion) &&
      (doc.baseVersion = latestVersion);
  }
  let savedVersion: Dynamic = writeVersion ?? readVersion;
  try {
    let savedSource: Dynamic = await fileClient.read(filePath);
    if (savedSource !== nextSource) {
      doc.src = savedSource;
      let savedSettledProps: Dynamic = getSavedPendingProps(
        savedSource,
        pendingProps,
      );
      return wasRebased
        ? {
            kind: "saved-adopted",
            saved: savedSource,
            rebased: true,
            version: savedVersion,
            ...(savedSettledProps !== undefined
              ? {
                  settledProps: savedSettledProps,
                }
              : {}),
          }
        : {
            kind: "saved-adopted",
            saved: savedSource,
            version: savedVersion,
            ...(savedSettledProps !== undefined
              ? {
                  settledProps: savedSettledProps,
                }
              : {}),
          };
    }
  } catch (adoptReadError: Dynamic) {
    console.warn("[dc-editor] post-save adopt read failed:", adoptReadError);
  }
  return wasRebased
    ? {
        kind: "saved",
        rebased: true,
        version: savedVersion,
        ...(settledProps !== undefined
          ? {
              settledProps: settledProps,
            }
          : {}),
      }
    : {
        kind: "saved",
        version: savedVersion,
        ...(settledProps !== undefined
          ? {
              settledProps: settledProps,
            }
          : {}),
      };
}
export {
  ModelPublishingH1H2H3Config,
  ModelPublishingHandler,
  publishModelChanges,
};
export function installEditorModelPublishing(): () => void {
  return () => {
    ModelPublishingH1H2H3Config = {
      h1: "a heading",
      h2: "a heading",
      h3: "a heading",
      h4: "a heading",
      h5: "a heading",
      h6: "a heading",
      p: "a paragraph",
      a: "a link",
      button: "a button",
      img: "an image",
      li: "a list item",
      label: "a label",
      td: "a table cell",
      th: "a table cell",
      span: "a piece of text",
      div: "a block",
      section: "a section",
    };
    ModelPublishingHandler = (tagName?: Dynamic): Dynamic =>
      Object.hasOwn(ModelPublishingH1H2H3Config, tagName.toLowerCase())
        ? ModelPublishingH1H2H3Config[tagName.toLowerCase()]
        : "an element";
  };
}

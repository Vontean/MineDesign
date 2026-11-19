import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { DESIGN_SYSTEM_PATHS, isHeldFilePointer } from "../model/file-policy";
import { isAdditionalMarkdownPath } from "../model/file-table";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { Callout } from "../ui/icons";

var reactConflictBanners: typeof import("react");
var jsxConflictBanners: typeof import("react/jsx-runtime");
var CONFLICT_COPIED_DURATION_MS: number;
var isConflictTextFile: (path: string, value: string | null) => boolean;
var conflictFileSummary: (path: string, value: string | null) => string;
var EMPTY_CONFLICT_FLAGS: ReadonlyMap<string, Editor.ConflictFlag>;
function sectionForFilePath(path: string): string {
  if (
    path === DESIGN_SYSTEM_PATHS.readme ||
    isAdditionalMarkdownPath(path)
  ) {
    return "readme";
  }
  if (path === DESIGN_SYSTEM_PATHS.tokens) {
    return "colors";
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)) {
    return "type";
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
    return "assets";
  }
  if (path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir)) {
    return "components";
  }
  return "readme";
}
function sectionsForFilePaths(paths: Iterable<string>): Set<string> {
  let values = new Set<string>();
  for (let value of paths) {
    values.add(sectionForFilePath(value));
  }
  return values;
}
function conflictTextDiff(
  ours: string | null,
  theirs: string | null,
  diffContext: number = 2,
): Editor.ConflictDiffLine[] | null {
  let value =
      theirs === null
        ? []
        : theirs.split(`
`),
    otherText =
      ours === null
        ? []
        : ours.split(`
`);
  if (
    value.length > CONFLICT_COPIED_DURATION_MS ||
    otherText.length > CONFLICT_COPIED_DURATION_MS
  ) {
    return null;
  }
  let length = value.length,
    otherLength = otherText.length,
    items: Uint16Array[] = [];
  for (let rowIndex: number = 0; rowIndex <= length; rowIndex++) {
    items.push(new Uint16Array(otherLength + 1));
  }
  for (let leftIndex: number = length - 1; leftIndex >= 0; leftIndex--) {
    for (let rightIndex: number = otherLength - 1; rightIndex >= 0; rightIndex--) {
      items[leftIndex][rightIndex] =
        value[leftIndex] === otherText[rightIndex]
          ? items[leftIndex + 1][rightIndex + 1] + 1
          : Math.max(items[leftIndex + 1][rightIndex], items[leftIndex][rightIndex + 1]);
    }
  }
  let diffLines: Editor.ConflictDiffLine[] = [],
    index: number = 0,
    rightCursor: number = 0;
  while (index < length && rightCursor < otherLength) {
    if (value[index] === otherText[rightCursor]) {
      diffLines.push({
        kind: "same",
        text: value[index],
      });
      index++;
      rightCursor++;
    } else if (items[index + 1][rightCursor] >= items[index][rightCursor + 1]) {
      diffLines.push({
        kind: "theirs",
        text: value[index++],
      });
    } else {
      diffLines.push({
        kind: "mine",
        text: otherText[rightCursor++],
      });
    }
  }
  while (index < length) {
    diffLines.push({
      kind: "theirs",
      text: value[index++],
    });
  }
  while (rightCursor < otherLength) {
    diffLines.push({
      kind: "mine",
      text: otherText[rightCursor++],
    });
  }
  let isContextLine = diffLines.map((): boolean => false);
  diffLines.forEach((source, lineIndex): void => {
    if (source.kind !== "same") {
      for (let offset = -diffContext; offset <= diffContext; offset++) {
        if (lineIndex + offset >= 0 && lineIndex + offset < diffLines.length) {
          isContextLine[lineIndex + offset] = true;
        }
      }
    }
  });
  let visibleLines: Editor.ConflictDiffLine[] = [];
  for (let lineIndex: number = 0; lineIndex < diffLines.length; lineIndex++) {
    if (isContextLine[lineIndex] === true) {
      visibleLines.push(diffLines[lineIndex]);
      continue;
    }
    if (
      visibleLines.length === 0 ||
      visibleLines[visibleLines.length - 1].text !== "…" ||
      visibleLines[visibleLines.length - 1].kind !== "same"
    ) {
      visibleLines.push({
        kind: "same",
        text: "…",
      });
    }
  }
  return visibleLines;
}
function conflictBannerDescription(flag: Editor.ConflictFlag): string {
  let value: boolean = flag.theirsSha === null,
    description: string =
      flag.clash !== undefined ? " You both changed " + flag.clash + "." : "";
  if (flag.why === "undo") {
    if (value) {
      return uiMessage("design-system.conflictBanners.someoneElseDeletedItSince");
    } else {
      return uiMessage("design-system.conflictBanners.someoneElseSavedANewer");
    }
  }
  if (flag.why === "restored") {
    return (
      uiMessage("design-system.conflictBanners.yourUnsavedVersionCameBack") +
      (value ? uiMessage("design-system.conflictBanners.theirDelete") : "theirs.")
    );
  }
  if (flag.why === "overwritten") {
    return (
      uiMessage("design-system.conflictBanners.someoneElseSavedItAt") +
      description +
      " Yours is back here and is not saved."
    );
  }
  if (value) {
    return uiMessage("design-system.conflictBanners.someoneElseDeletedItWhile");
  } else {
    return (
      uiMessage("design-system.conflictBanners.someoneElseSavedANewer2") +
      description +
      " Your version shows here and is not saved over theirs."
    );
  }
}
function FileConflictBanner({
  doc: doc,
  flag: flag,
}: {
  doc: Editor.ConflictDocument;
  flag: Editor.ConflictFlag;
}): React.ReactElement {
  useUiLocale();
  let [value, setExpanded] = reactConflictBanners.useState(false),
    [conflictState, setConflictState] = reactConflictBanners.useState<
      Editor.ConflictSides | "loading" | null
    >(null);
  reactConflictBanners.useEffect(() => {
    if (!value) {
      return;
    }
    let hasFlag: boolean = true;
    setConflictState("loading");
    doc.flaggedSides(flag.path).then((state): void => {
      if (hasFlag) {
        setConflictState(state);
      }
    });
    return (): void => {
      hasFlag = false;
    };
  }, [value, doc, flag.path, flag.theirsSha]);
  let conflictFiles =
      conflictState !== null &&
      conflictState !== "loading" &&
      isConflictTextFile(flag.path, conflictState.mine) &&
      isConflictTextFile(flag.path, conflictState.theirs)
        ? conflictTextDiff(conflictState.mine, conflictState.theirs)
        : null,
    sectionName = sectionForFilePath(flag.path),
    conflictDescription =
      conflictState === null || conflictState === "loading" ? (
        <span className={"text-muted"}>{uiMessage("design-system.conflictBanners.readingBothVersions")}</span>
      ) : conflictFiles === null ? (
        <span className={"text-muted"}>
          {[uiMessage("design-system.conflictBanners.theirs", { value1: String(conflictFileSummary(flag.path, conflictState.theirs)) }), uiMessage("design-system.conflictBanners.mine", { value1: String(conflictFileSummary(flag.path, conflictState.mine)) }), uiMessage("design-system.conflictBanners.tooLargeOrNotText")]}
        </span>
      ) : conflictFiles.every((source): boolean => source.kind === "same") ? (
        <span className={"text-muted"}>
          {uiMessage("design-system.conflictBanners.bothVersionsHoldTheSameText")}
        </span>
      ) : (
        <pre
          className={
            "ds-flagged-diff m-0 max-h-80 overflow-auto whitespace-pre-wrap font-mono text-caption"
          }
          data-testid={"ds-flagged-diff-body"}
        >
          {conflictFiles.map((source, fileIndex) =>
            (() => {
              const _Element = "div";
              const _elementProps = {
                "data-kind": source.kind,
                className:
                  source.kind === "mine"
                    ? "bg-accent-soft"
                    : source.kind === "theirs"
                      ? "bg-warning-soft"
                      : "text-muted",
                children:
                  (source.kind === "mine"
                    ? uiMessage("design-system.conflictBanners.mine2")
                    : source.kind === "theirs"
                      ? uiMessage("design-system.conflictBanners.theirs2")
                      : "         ") + source.text,
              };
              const _elementKey = fileIndex;
              return <_Element key={_elementKey} {..._elementProps} />;
            })(),
          )}
        </pre>
      );
  return (
    <div
      className={"ds-flagged-file flex flex-col gap-xs"}
      data-testid={"ds-flagged-" + flag.path}
    >
      {[<Callout
          variant={"warning"}
          role={"status"}
          action={
            <span className={"flex flex-wrap items-center gap-xs"}>
              {[<Button
                  variant={"ghost"}
                  onClick={() => setExpanded((isOpen): boolean => !isOpen)}
                  aria-expanded={value}
                  data-testid={"ds-flagged-diff"}
                >
                  {value ? ("Hide diff") : ("Diff")}
                </Button>, <Button
                  variant={"secondary"}
                  onClick={() => doc.resolveFlagged(flag.path, "theirs")}
                  data-testid={"ds-flagged-theirs"}
                >
                  {flag.theirsSha === null ? ("Use theirs (delete it)") : ("Use theirs")}
                </Button>, <Button
                  variant={"secondary"}
                  onClick={() => doc.resolveFlagged(flag.path, "mine")}
                  data-testid={"ds-flagged-mine"}
                >
                  {uiMessage("design-system.conflictBanners.keepMine")}
                </Button>, <Button
                  variant={"primary"}
                  onClick={() => doc.resolveFlagged(flag.path, "copy")}
                  data-testid={"ds-flagged-copy"}
                >
                  {uiMessage("design-system.conflictBanners.keepMineAsACopy")}
                </Button>]}
            </span>
          }
        >
          <span>
            {[<span className={"font-mono"}>{flag.path}</span>, <span className={"text-muted"}>{[uiMessage("design-system.conflictBanners.in"), sectionName, ")"]}</span>, ": ", conflictBannerDescription(flag)]}
          </span>
        </Callout>, value ? (
          <div
            className={
              "ds-flagged-diff-panel rounded-md border border-border-line bg-surface-1 p-sm"
            }
            data-testid={"ds-flagged-diff-panel"}
          >
            {conflictDescription}
          </div>
        ) : null]}
    </div>
  );
}
function StuckSaveBanner({
  doc: doc,
  stuck: stuck,
}: {
  doc: Editor.ConflictDocument;
  stuck: Editor.StuckSave;
}): React.ReactElement {
  useUiLocale();
  return (
    <div className={"ds-stuck-save"} data-testid={"ds-stuck-save"}>
      <Callout
        variant={"warning"}
        role={"status"}
        action={
          stuck.retryable ? (
            <Button
              variant={"primary"}
              onClick={() => doc.retryStuck()}
              data-testid={"ds-stuck-retry"}
            >
              {uiMessage("design-system.conflictBanners.retryNow")}
            </Button>
          ) : undefined
        }
      >
        <span>{stuck.message}</span>
      </Callout>
    </div>
  );
}
function useFileConflictFlags(
  conflictDocument: Partial<Editor.ConflictDocument>,
): Editor.ConflictFlag[] {
  let [value, setFlags] = reactConflictBanners.useState(() => [
    ...(conflictDocument.flags?.() ?? EMPTY_CONFLICT_FLAGS).values(),
  ]);
  reactConflictBanners.useEffect(() => {
    if (
      conflictDocument.subscribeFlagged === undefined ||
      conflictDocument.flags === undefined
    ) {
      return;
    }
    let callback = () => setFlags([...conflictDocument.flags!().values()]);
    callback();
    return conflictDocument.subscribeFlagged(callback);
  }, [conflictDocument]);
  return value;
}
function useStuckSave(
  conflictDocument: Partial<Editor.ConflictDocument>,
): Editor.StuckSave | undefined {
  let [value, setStuck] = reactConflictBanners.useState(() =>
    conflictDocument.stuck?.(),
  );
  reactConflictBanners.useEffect(() => {
    if (
      conflictDocument.stuck === undefined ||
      conflictDocument.subscribeSave === undefined
    ) {
      return;
    }
    let callback = () => setStuck(conflictDocument.stuck?.());
    callback();
    return conflictDocument.subscribeSave(callback);
  }, [conflictDocument]);
  return value;
}
function SaveConflictBanners({
  doc: doc,
}: {
  doc: Partial<Editor.ConflictDocument>;
}): React.ReactElement | null {
  useUiLocale();
  let value = doc,
    conflictFlags = useFileConflictFlags(value),
    stuckState = useStuckSave(value);
  if (
    (conflictFlags.length === 0 && stuckState === undefined) ||
    typeof value.resolveFlagged !== "function"
  ) {
    return null;
  }
  return (
    <div
      className={"ds-flagged-files flex flex-col gap-xs"}
      data-testid={"ds-flagged-files"}
      {...UNCOMMENTABLE_PROPS}
    >
      {[stuckState !== undefined ? (
          <StuckSaveBanner doc={value as Editor.ConflictDocument} stuck={stuckState} />
        ) : null, conflictFlags.map((flag) =>
          (() => {
            const ConflictBanner = FileConflictBanner;
            const conflictProps = {
              doc: value as Editor.ConflictDocument,
              flag: flag,
            };
            const conflictKey = flag.path;
            return <ConflictBanner key={conflictKey} {...conflictProps} />;
          })(),
        )]}
    </div>
  );
}
function useConflictedSections(
  conflictDocument: Partial<Editor.ConflictDocument>,
): ReadonlySet<string> {
  let value = useFileConflictFlags(conflictDocument);
  return sectionsForFilePaths(value.map((filePath) => filePath.path));
}
export {
  CONFLICT_COPIED_DURATION_MS,
  conflictBannerDescription,
  conflictFileSummary,
  conflictTextDiff,
  EMPTY_CONFLICT_FLAGS,
  FileConflictBanner,
  isConflictTextFile,
  jsxConflictBanners,
  reactConflictBanners,
  SaveConflictBanners,
  sectionForFilePath,
  sectionsForFilePaths,
  StuckSaveBanner,
  useConflictedSections,
  useFileConflictFlags,
  useStuckSave,
};
export function installEditorConflictBanners(): () => void {
  return () => {
    reactConflictBanners = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxConflictBanners = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    CONFLICT_COPIED_DURATION_MS = 1500;
    isConflictTextFile = (path: string, fileContent: string | null) =>
      fileContent === null ||
      !(
        fileContent.startsWith("data:") || isHeldFilePointer(path, fileContent)
      );
    conflictFileSummary = (path: string, fileContent: string | null): string =>
      fileContent === null
        ? uiMessage("design-system.conflictBanners.theFileIsDeleted")
        : isHeldFilePointer(path, fileContent)
          ? uiMessage("design-system.conflictBanners.theFileIsKeptAs")
          : String(fileContent.length) + " characters.";
    EMPTY_CONFLICT_FLAGS = new Map();
  };
}

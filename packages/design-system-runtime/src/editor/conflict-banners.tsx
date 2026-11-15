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
    (0, isAdditionalMarkdownPath)(path)
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
  context: number = 2,
): Editor.ConflictDiffLine[] | null {
  let value =
      theirs === null
        ? []
        : theirs.split(`
`),
    value2 =
      ours === null
        ? []
        : ours.split(`
`);
  if (
    value.length > CONFLICT_COPIED_DURATION_MS ||
    value2.length > CONFLICT_COPIED_DURATION_MS
  ) {
    return null;
  }
  let length = value.length,
    length2 = value2.length,
    items: Uint16Array[] = [];
  for (let index3: number = 0; index3 <= length; index3++) {
    items.push(new Uint16Array(length2 + 1));
  }
  for (let value4: number = length - 1; value4 >= 0; value4--) {
    for (let value5: number = length2 - 1; value5 >= 0; value5--) {
      items[value4][value5] =
        value[value4] === value2[value5]
          ? items[value4 + 1][value5 + 1] + 1
          : Math.max(items[value4 + 1][value5], items[value4][value5 + 1]);
    }
  }
  let items2: Editor.ConflictDiffLine[] = [],
    index: number = 0,
    index2: number = 0;
  while (index < length && index2 < length2) {
    if (value[index] === value2[index2]) {
      items2.push({
        kind: "same",
        text: value[index],
      });
      index++;
      index2++;
    } else if (items[index + 1][index2] >= items[index][index2 + 1]) {
      items2.push({
        kind: "theirs",
        text: value[index++],
      });
    } else {
      items2.push({
        kind: "mine",
        text: value2[index2++],
      });
    }
  }
  while (index < length) {
    items2.push({
      kind: "theirs",
      text: value[index++],
    });
  }
  while (index2 < length2) {
    items2.push({
      kind: "mine",
      text: value2[index2++],
    });
  }
  let value3 = items2.map((): boolean => false);
  items2.forEach((source, options): void => {
    if (source.kind !== "same") {
      for (let value4 = -context; value4 <= context; value4++) {
        if (options + value4 >= 0 && options + value4 < items2.length) {
          value3[options + value4] = true;
        }
      }
    }
  });
  let items3: Editor.ConflictDiffLine[] = [];
  for (let index3: number = 0; index3 < items2.length; index3++) {
    if (value3[index3] === true) {
      items3.push(items2[index3]);
      continue;
    }
    if (
      items3.length === 0 ||
      items3[items3.length - 1].text !== "…" ||
      items3[items3.length - 1].kind !== "same"
    ) {
      items3.push({
        kind: "same",
        text: "…",
      });
    }
  }
  return items3;
}
function conflictBannerDescription(flag: Editor.ConflictFlag): string {
  let value: boolean = flag.theirsSha === null,
    value2: string =
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
      value2 +
      " Yours is back here and is not saved."
    );
  }
  if (value) {
    return uiMessage("design-system.conflictBanners.someoneElseDeletedItWhile");
  } else {
    return (
      uiMessage("design-system.conflictBanners.someoneElseSavedANewer2") +
      value2 +
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
  let [value, value2] = reactConflictBanners.useState(false),
    [value3, value4] = reactConflictBanners.useState<
      Editor.ConflictSides | "loading" | null
    >(null);
  reactConflictBanners.useEffect(() => {
    if (!value) {
      return;
    }
    let flag2: boolean = true;
    value4("loading");
    doc.flaggedSides(flag.path).then((input): void => {
      if (flag2) {
        value4(input);
      }
    });
    return (): void => {
      flag2 = false;
    };
  }, [value, doc, flag.path, flag.theirsSha]);
  let value5 =
      value3 !== null &&
      value3 !== "loading" &&
      isConflictTextFile(flag.path, value3.mine) &&
      isConflictTextFile(flag.path, value3.theirs)
        ? conflictTextDiff(value3.mine, value3.theirs)
        : null,
    value6 = sectionForFilePath(flag.path),
    value7 =
      value3 === null || value3 === "loading" ? (
        <span className={"text-muted"}>{uiMessage("design-system.conflictBanners.readingBothVersions")}</span>
      ) : value5 === null ? (
        <span className={"text-muted"}>
          {[uiMessage("design-system.conflictBanners.theirs", { value1: String(conflictFileSummary(flag.path, value3.theirs)) }), uiMessage("design-system.conflictBanners.mine", { value1: String(conflictFileSummary(flag.path, value3.mine)) }), uiMessage("design-system.conflictBanners.tooLargeOrNotText")]}
        </span>
      ) : value5.every((source): boolean => source.kind === "same") ? (
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
          {value5.map((source, options) =>
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
              const _elementKey = options;
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
                  onClick={() => value2((input): boolean => !input)}
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
            {[<span className={"font-mono"}>{flag.path}</span>, <span className={"text-muted"}>{[uiMessage("design-system.conflictBanners.in"), value6, ")"]}</span>, ": ", conflictBannerDescription(flag)]}
          </span>
        </Callout>, value ? (
          <div
            className={
              "ds-flagged-diff-panel rounded-md border border-border-line bg-surface-1 p-sm"
            }
            data-testid={"ds-flagged-diff-panel"}
          >
            {value7}
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
  document2: Partial<Editor.ConflictDocument>,
): Editor.ConflictFlag[] {
  let [value, value2] = reactConflictBanners.useState(() => [
    ...(document2.flags?.() ?? EMPTY_CONFLICT_FLAGS).values(),
  ]);
  reactConflictBanners.useEffect(() => {
    if (
      document2.subscribeFlagged === undefined ||
      document2.flags === undefined
    ) {
      return;
    }
    let callback = () => value2([...document2.flags!().values()]);
    callback();
    return document2.subscribeFlagged(callback);
  }, [document2]);
  return value;
}
function useStuckSave(
  document2: Partial<Editor.ConflictDocument>,
): Editor.StuckSave | undefined {
  let [value, value2] = reactConflictBanners.useState(() =>
    document2.stuck?.(),
  );
  reactConflictBanners.useEffect(() => {
    if (
      document2.stuck === undefined ||
      document2.subscribeSave === undefined
    ) {
      return;
    }
    let callback = () => value2(document2.stuck?.());
    callback();
    return document2.subscribeSave(callback);
  }, [document2]);
  return value;
}
function SaveConflictBanners({
  doc: doc,
}: {
  doc: Partial<Editor.ConflictDocument>;
}): React.ReactElement | null {
  useUiLocale();
  let value = doc,
    value2 = useFileConflictFlags(value),
    value3 = useStuckSave(value);
  if (
    (value2.length === 0 && value3 === undefined) ||
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
      {[value3 !== undefined ? (
          <StuckSaveBanner doc={value as Editor.ConflictDocument} stuck={value3} />
        ) : null, value2.map((input) =>
          (() => {
            const _Element2 = FileConflictBanner;
            const _elementProps2 = {
              doc: value as Editor.ConflictDocument,
              flag: input,
            };
            const _elementKey2 = input.path;
            return <_Element2 key={_elementKey2} {..._elementProps2} />;
          })(),
        )]}
    </div>
  );
}
function useConflictedSections(
  document2: Partial<Editor.ConflictDocument>,
): ReadonlySet<string> {
  let value = useFileConflictFlags(document2);
  return sectionsForFilePaths(value.map((input) => input.path));
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
    reactConflictBanners = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxConflictBanners = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    CONFLICT_COPIED_DURATION_MS = 1500;
    isConflictTextFile = (path: string, value: string | null) =>
      value === null ||
      !(
        value.startsWith("data:") || (0, isHeldFilePointer)(path, value)
      );
    conflictFileSummary = (path: string, value: string | null): string =>
      value === null
        ? uiMessage("design-system.conflictBanners.theFileIsDeleted")
        : (0, isHeldFilePointer)(path, value)
          ? uiMessage("design-system.conflictBanners.theFileIsKeptAs")
          : String(value.length) + " characters.";
    EMPTY_CONFLICT_FLAGS = new Map();
  };
}

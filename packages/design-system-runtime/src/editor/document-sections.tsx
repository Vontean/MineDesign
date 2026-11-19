import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
import type * as Files from "../contracts/file-browser";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { commentTargetId, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { MarkdownEditor } from "./markdown-editor";
import { README_MEASURE_CLASS_NAME } from "./readme-article";
import { SectionCard } from "./section-card";
import { toModuleNamespace } from "../module-helpers";

var EMPTY_DOC_LINKS: Set<string>;
var jsxDocumentSections: typeof import("react/jsx-runtime");
function firstMarkdownTitle(markdown: string): {
  line: number;
  text: string;
} | null {
  let flag: boolean = false,
    value = markdown.split(`
`);
  for (let index: number = 0; index < value.length; index++) {
    let lineText = value[index];
    if (/^```/.test(lineText)) {
      flag = !flag;
      continue;
    }
    if (flag) {
      continue;
    }
    let titleMatch = /^#\s+(.+)$/.exec(lineText);
    if (titleMatch !== null) {
      return {
        line: index,
        text: titleMatch[1].trim(),
      };
    }
  }
  return null;
}
function replaceMarkdownTitle(markdown: string, title: string): string {
  let value = firstMarkdownTitle(markdown);
  if (value === null) {
    return markdown;
  }
  let lines = markdown.split(`
`);
  lines[value.line] = "# " + title;
  return lines.join(`
`);
}
function DocumentSections({
  docs: docs,
  edit: edit,
  headFor: headFor,
}: M.DocumentSectionsProps) {
  useUiLocale();
  return (
    <jsxDocumentSections.Fragment>
      {docs.map((doc: Core.ParsedDesignSystem["docs"][number]) =>
        (() => {
          const _Element = SectionCard;
          const _elementProps = {
            head: headFor(doc),
            className: "ds-readme-sec ds-guidance-sec",
            "data-testid": "ds-guidance-" + doc.path,
            cardKey: "guidance:" + doc.path,
            anchorId: commentTargetId("doc", doc.path),
            children: [
              <div
                className={
                  "ds-doc-path ds-pad pt-sm font-mono text-caption text-muted"
                }
                {...UNCOMMENTABLE_PROPS}
              >
                {doc.path}
              </div>,
              <div className={README_MEASURE_CLASS_NAME}>
                <MarkdownEditor
                  markdown={doc.markdown}
                  readOnly={edit === undefined}
                  placeholder={
                    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                    uiMessage("design-system.documentSections.guidanceForTheAgentVoiceDoSAndDonTsAnythingTheTokensCanTSay")
                  }
                  label={doc.title}
                  testId={"ds-guidance-text-" + doc.path}
                  onMarkdown={(markdown: string) =>
                    edit?.setText(doc.path, markdown)
                  }
                  onDone={edit?.done}
                />
              </div>,
            ],
          };
          const _elementKey = doc.path;
          return <_Element key={_elementKey} {..._elementProps} />;
        })(),
      )}
    </jsxDocumentSections.Fragment>
  );
}
export {
  DocumentSections,
  EMPTY_DOC_LINKS,
  firstMarkdownTitle,
  jsxDocumentSections,
  replaceMarkdownTitle,
};
export function installEditorDocumentSections(): () => void {
  return () => {
    EMPTY_DOC_LINKS = new Set();
    jsxDocumentSections = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}

import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
import type * as Files from "../contracts/file-browser";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var jsxReadmeArticle: typeof import("react/jsx-runtime");
var README_MEASURE_CLASS_NAME: string;
function removeTokenShortcutComments(markdown: string): string {
  let value: string | null = null;
  return markdown
    .split(
      `
`,
    )
    .filter((input: string): boolean => {
      let value2 = /^\s*(`{3,}|~{3,})/.exec(input)?.[1] ?? null;
      if (value !== null) {
        if (
          value2 !== null &&
          value2[0] === value[0] &&
          value2.length >= value.length
        ) {
          value = null;
        }
        return true;
      }
      if (value2 !== null) {
        value = value2;
        return true;
      }
      return !/^[ \t]*<\!--[ \t]*tokens:[ \t]*(?:spacing|radius)[ \t]*-->[ \t]*\r?$/.test(
        input,
      );
    }).join(`
`);
}
function ReadmeArticle({ children: children }: React.PropsWithChildren) {
  useUiLocale();
  return (
    <article
      className={"ds-overview prose w-full"}
      data-testid={"ds-overview"}
    >
      {children}
    </article>
  );
}
export {
  jsxReadmeArticle,
  README_MEASURE_CLASS_NAME,
  ReadmeArticle,
  removeTokenShortcutComments,
};
export function installEditorReadmeArticle(): () => void {
  return () => {
    jsxReadmeArticle = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    README_MEASURE_CLASS_NAME =
      "ds-readme-measure ds-pad prose w-full max-w-[calc(680px+28px)] pt-md pb-lg";
  };
}

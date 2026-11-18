import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cn } from "../../cds/theme/class-names";

function InspectorCodePreview(input?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <pre
      {...input}
      className={cn(
        "m-0 px-3.5 pb-1 [font-family:ui-monospace,'SF_Mono',monospace] text-[10px] leading-normal text-secondary whitespace-pre-wrap break-all select-text",
        input.className,
      )}
    />
  );
}
function InspectorHelpText(input?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      {...input}
      className={cn(
        "px-3.5 pb-2.5 text-[11px] text-secondary leading-normal",
        input.className,
      )}
    />
  );
}
export {
  InspectorCodePreview,
  InspectorHelpText,
};
export function installEditorInspectorHelp(): () => void {
  return () => {};
}

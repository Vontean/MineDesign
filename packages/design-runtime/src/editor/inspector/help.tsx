import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cn } from "../../cds/theme/class-names";

function InspectorCodePreview(props?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <pre
      {...props}
      className={cn(
        "m-0 px-3.5 pb-1 [font-family:ui-monospace,'SF_Mono',monospace] text-[10px] leading-normal text-secondary whitespace-pre-wrap break-all select-text",
        props.className,
      )}
    />
  );
}
function InspectorHelpText(props?: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div
      {...props}
      className={cn(
        "px-3.5 pb-2.5 text-[11px] text-secondary leading-normal",
        props.className,
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

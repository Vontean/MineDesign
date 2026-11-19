import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { TextInput } from "../../cds/components/text-input";
import { reactKeyboardEditActions } from "../keyboard/edit-actions";

var OutlineRenameLimit: Dynamic;
function OutlineRenameInput({
  label: label,
  onDone: onDone,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, setValue]: Dynamic = (0,
    reactKeyboardEditActions.useState)(label),
    hasFinishedRef: Dynamic = (0, reactKeyboardEditActions.useRef)(false),
    callback: Dynamic = (
      committedLabel?: Dynamic,
      shouldRefocus: Dynamic = false,
    ): Dynamic => {
      hasFinishedRef.current || ((hasFinishedRef.current = true), onDone(committedLabel, shouldRefocus));
    };
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => (): Dynamic => callback(null),
    [],
  );
  return (
    <TextInput
      size={"sm"}
      fullWidth={false}
      className={"min-w-0 flex-1"}
      aria-label={uiMessage("inspector.rename.artboardName")}
      autoFocus={true}
      value={value}
      onChange={(event?: Dynamic): Dynamic => setValue(event.target.value)}
      onClick={(event?: Dynamic): Dynamic => event.stopPropagation()}
      onDoubleClick={(event?: Dynamic): Dynamic => event.stopPropagation()}
      onPointerDown={(event?: Dynamic): Dynamic => event.stopPropagation()}
      onContextMenu={(event?: Dynamic): Dynamic => event.stopPropagation()}
      onFocus={(event?: Dynamic): Dynamic => event.currentTarget.select()}
      onBlur={(): Dynamic => callback(value.trim() || null)}
      onKeyDown={(event?: Dynamic): Dynamic => {
        event.key === "Enter"
          ? callback(value.trim() || null, true)
          : event.key === "Escape" && callback(null, true);
        event.stopPropagation();
      }}
    />
  );
}
function consumeOutlineRefocus(refocusState?: Dynamic): Dynamic {
  let value: Dynamic =
    refocusState.refocusAt !== 0 &&
    Date.now() - refocusState.refocusAt <= OutlineRenameLimit;
  refocusState.refocusAt = 0;
  return value;
}
export {
  consumeOutlineRefocus,
  OutlineRenameInput,
  OutlineRenameLimit,
};
export function installEditorOutlineRename(): () => void {
  return () => {
    OutlineRenameLimit = 3e3;
  };
}

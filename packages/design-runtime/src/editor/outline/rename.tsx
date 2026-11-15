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
  let [value, value2]: Dynamic = (0,
    reactKeyboardEditActions.useState)(label),
    value3: Dynamic = (0, reactKeyboardEditActions.useRef)(false),
    callback: Dynamic = (
      input?: Dynamic,
      options: Dynamic = false,
    ): Dynamic => {
      value3.current || ((value3.current = true), onDone(input, options));
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
      onChange={(event?: Dynamic): Dynamic => value2(event.target.value)}
      onClick={(input?: Dynamic): Dynamic => input.stopPropagation()}
      onDoubleClick={(input?: Dynamic): Dynamic => input.stopPropagation()}
      onPointerDown={(input?: Dynamic): Dynamic => input.stopPropagation()}
      onContextMenu={(input?: Dynamic): Dynamic => input.stopPropagation()}
      onFocus={(input?: Dynamic): Dynamic => input.currentTarget.select()}
      onBlur={(): Dynamic => callback(value.trim() || null)}
      onKeyDown={(input?: Dynamic): Dynamic => {
        input.key === "Enter"
          ? callback(value.trim() || null, true)
          : input.key === "Escape" && callback(null, true);
        input.stopPropagation();
      }}
    />
  );
}
function consumeOutlineRefocus(input?: Dynamic): Dynamic {
  let value: Dynamic =
    input.refocusAt !== 0 &&
    Date.now() - input.refocusAt <= OutlineRenameLimit;
  input.refocusAt = 0;
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

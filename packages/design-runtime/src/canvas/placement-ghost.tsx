import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { recordDesignEditActivity } from "./compilation-cache";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { reactVectorToolState_2 } from "../editor/vector/tool-state";

function PlacementGhostFrame({
  ghost: ghost,
  style: style,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    value2: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    [value3, value4]: Dynamic = (0, reactVectorToolState_2.useState)(
      false,
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let callback: Dynamic = (dataset?: Dynamic): Dynamic => {
      let data: Dynamic = dataset.data;
      dataset.source !== null &&
        dataset.source === value.current?.contentWindow &&
        data &&
        typeof data == "object" &&
        data.type === "__dc_booted" &&
        value4(true);
    };
    (window as Dynamic).addEventListener("message", callback);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("message", callback);
  }, []);
  (0, reactVectorToolState_2.useLayoutEffect)(
    (): Dynamic => recordDesignEditActivity,
    [],
  );
  return (
    <iframe
      ref={value}
      title={uiMessage("canvas.placementGhost.dragPreview")}
      aria-hidden={true}
      tabIndex={-1}
      sandbox={"allow-scripts allow-same-origin"}
      srcDoc={ghost.srcdoc}
      onLoad={(): Dynamic => {
        ghost.boot &&
          !value2.current &&
          ((value2.current = true),
          value.current?.contentWindow?.postMessage(
            {
              __dc_doc: 1,
              doc: ghost.boot.doc,
              parts: ghost.boot.parts,
              urls: ghost.boot.urls,
            },
            "*",
          ));
      }}
      className={(0, joinClassNames)(
        "pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-100",
        value3 ? "opacity-80" : "opacity-0",
      )}
      style={style}
    />
  );
}
export {
  PlacementGhostFrame,
};
export function installCanvasPlacementGhost(): () => void {
  return () => {};
}

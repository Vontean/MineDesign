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
  let iframeRef: Dynamic = (0, reactVectorToolState_2.useRef)(null),
    hasBootedRef: Dynamic = (0, reactVectorToolState_2.useRef)(false),
    [isBooted, setIsBooted]: Dynamic = (0, reactVectorToolState_2.useState)(
      false,
    );
  (0, reactVectorToolState_2.useEffect)((): Dynamic => {
    let handleMessage: Dynamic = (messageEvent?: Dynamic): Dynamic => {
      let messageData: Dynamic = messageEvent.data;
      messageEvent.source !== null &&
        messageEvent.source === iframeRef.current?.contentWindow &&
        messageData &&
        typeof messageData == "object" &&
        messageData.type === "__dc_booted" &&
        setIsBooted(true);
    };
    (window as Dynamic).addEventListener("message", handleMessage);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("message", handleMessage);
  }, []);
  (0, reactVectorToolState_2.useLayoutEffect)(
    (): Dynamic => recordDesignEditActivity,
    [],
  );
  return (
    <iframe
      ref={iframeRef}
      title={uiMessage("canvas.placementGhost.dragPreview")}
      aria-hidden={true}
      tabIndex={-1}
      sandbox={"allow-scripts allow-same-origin"}
      srcDoc={ghost.srcdoc}
      onLoad={(): Dynamic => {
        ghost.boot &&
          !hasBootedRef.current &&
          ((hasBootedRef.current = true),
          iframeRef.current?.contentWindow?.postMessage(
            {
              __dc_doc: 1,
              doc: ghost.boot.doc,
              parts: ghost.boot.parts,
              urls: ghost.boot.urls,
            },
            "*",
          ));
      }}
      className={joinClassNames(
        "pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-100",
        isBooted ? "opacity-80" : "opacity-0",
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

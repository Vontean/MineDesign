import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { SelectionRing } from "../cds/components/selection-ring";
import { peerCollaboratorIndex, reactCollaborationPeerCursors_2 } from "./peer-cursors";
import { load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { roomPeersStore } from "../platform/file-content";

var jsxCollaborationPeerSelections: Dynamic;
var CollaborationPeerSelectionsConstant: Dynamic;
var CollaborationPeerSelectionsLimit: Dynamic;
function normalizePeerSelectionPaths(paths?: Dynamic): Dynamic {
  if (!Array.isArray(paths)) return [];
  let validPaths: Dynamic = paths.filter(
    (items?: Dynamic): Dynamic =>
      typeof items == "string" &&
      items.length <= CollaborationPeerSelectionsLimit,
  );
  return validPaths
    .filter(
      (path?: Dynamic, index?: Dynamic): Dynamic =>
        validPaths.lastIndexOf(path) === index,
    )
    .slice(-CollaborationPeerSelectionsConstant);
}
function getPeerSelectionGroups(
  peers?: Dynamic,
  scopeFilter?: Dynamic,
  listKeys: Dynamic = [],
): Dynamic {
  let items: Dynamic = [];
  for (let peer of peers as Dynamic) {
    if (peer.sameTab) continue;
    let presenceContext: Dynamic = peer.presence.context;
    if (
      typeof presenceContext != "object" ||
      presenceContext === null ||
      Array.isArray(presenceContext)
    )
      continue;
    let peerContext: Dynamic = presenceContext;
    if (
      Object.keys(scopeFilter).some(
        (key?: Dynamic): Dynamic => peerContext[key] !== scopeFilter[key],
      )
    )
      continue;
    let selectedPaths: Dynamic = normalizePeerSelectionPaths(peerContext.selected),
      state: Dynamic = {},
      hasSelection: Dynamic = selectedPaths.length > 0;
    for (let listKey of listKeys as Dynamic) {
      let listPaths: Dynamic = normalizePeerSelectionPaths(peerContext[listKey]);
      state[listKey] = listPaths;
      listPaths.length > 0 && (hasSelection = true);
    }
    if (!hasSelection) continue;
    let who: Dynamic = peer.presence.who,
      whoInfo: Dynamic = typeof who == "object" && who !== null ? who : {};
    items.push({
      peer: peer.peer,
      collaborator: peerCollaboratorIndex(whoInfo.c, peer.peer),
      selected: selectedPaths,
      lists: state,
    });
  }
  return items;
}
function usePeerSelectionGroups(scopeFilter?: Dynamic, listKeys?: Dynamic): Dynamic {
  let peers: Dynamic = (0,
  reactCollaborationPeerCursors_2.useSyncExternalStore)(
    roomPeersStore.subscribe,
    roomPeersStore.getSnapshot,
    roomPeersStore.getSnapshot,
  );
  return getPeerSelectionGroups(peers, scopeFilter, listKeys);
}
function PeerSelectionRings({
  rings: rings,
  scale: scale,
}: Dynamic): Dynamic {
  useUiLocale();
  let ringScale: Dynamic = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return (
    <div
      aria-hidden={"true"}
      data-peer-selections={""}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {rings.map(
        (ring?: Dynamic): Dynamic =>
          (() => {
            const _Component = SelectionRing;
            const _props = {
              "data-peer-ring": "",
              frame: {
                x: ring.x,
                y: ring.y,
                w: ring.w,
                h: ring.h,
              },
              scale: ringScale,
              rotation: ring.rotation,
              collaborator: ring.collaborator,
            } as const;
            const _key = ring.key;
            return <_Component key={_key} {..._props} />;
          })(),
      )}
    </div>
  );
}
export {
  CollaborationPeerSelectionsConstant,
  CollaborationPeerSelectionsLimit,
  getPeerSelectionGroups,
  jsxCollaborationPeerSelections,
  normalizePeerSelectionPaths,
  PeerSelectionRings,
  usePeerSelectionGroups,
};
export function installCollaborationPeerSelections(): () => void {
  return () => {
    jsxCollaborationPeerSelections = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    CollaborationPeerSelectionsConstant = 20;
    CollaborationPeerSelectionsLimit = 256;
  };
}

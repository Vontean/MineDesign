import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeCdsIndex } from "../cds/index";
import { PeerCursorGlyph } from "./peer-cursors";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactCollaborationPeerBadge: Dynamic;
var jsxCollaborationPeerBadge: Dynamic;
var CollaborationPeerBadgeConstant: Dynamic;
var defaultCrossfadeInMs: Dynamic;
var jsxCollaborationPeerBadge_2: Dynamic;
var reactCollaborationPeerBadge_2: Dynamic;
var jsxCollaborationPeerBadge_3: Dynamic;
var jsxCollaborationPeerBadge_4: Dynamic;
var reactCollaborationPeerBadge_3: Dynamic;
var jsxCollaborationPeerBadge_5: Dynamic;
function CrossfadeLabel({
  text: text,
  outMs: outMs,
  inMs: inMs,
  shimmer: shimmer,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, setLines]: Dynamic = (0, reactCollaborationPeerBadge.useState)({
      a: text,
      b: "",
      front: "a",
    }),
    sizerRef: Dynamic = (0, reactCollaborationPeerBadge.useRef)(null),
    [measuredSize, setMeasuredSize]: Dynamic = (0, reactCollaborationPeerBadge.useState)(
      null,
    ),
    [fontsReadyTick, setFontsReadyTick]: Dynamic = (0, reactCollaborationPeerBadge.useState)(0);
  (0, reactCollaborationPeerBadge.useEffect)((): Dynamic => {
    setLines(
      (current?: Dynamic): Dynamic =>
        (current.front === "a" ? current.a : current.b) === text
          ? current
          : current.front === "a"
            ? {
                ...current,
                b: text,
                front: "b",
              }
            : {
                ...current,
                a: text,
                front: "a",
              },
    );
  }, [text]);
  (0, reactCollaborationPeerBadge.useEffect)((): Dynamic => {
    let flag: Dynamic = true;
    (typeof document !== "undefined"
      ? (document as Dynamic).fonts?.ready
      : undefined
    )?.then((): Dynamic => {
      flag && setFontsReadyTick((count?: Dynamic): Dynamic => count + 1);
    });
    return (): Dynamic => {
      flag = false;
    };
  }, []);
  (0, reactCollaborationPeerBadge.useLayoutEffect)((): Dynamic => {
    if (!sizerRef.current) return;
    let measuredWidth: Dynamic = sizerRef.current.offsetWidth + 1;
    setMeasuredSize(
      (previous?: Dynamic): Dynamic =>
        previous !== null && previous.width === measuredWidth
          ? previous
          : {
              width: measuredWidth,
              narrows: previous !== null && measuredWidth < previous.width,
            },
    );
  }, [value, fontsReadyTick]);
  let containerTransitionStyle: Dynamic =
      measuredSize?.narrows === true
        ? {
            transitionDuration: inMs + "ms",
            transitionDelay: outMs + "ms",
          }
        : {
            transitionDuration: outMs + "ms",
            transitionDelay: "0ms",
          },
    callback: Dynamic = (isFront?: Dynamic): Dynamic =>
      isFront
        ? {
            transitionDuration: inMs + "ms",
            transitionDelay: outMs + "ms",
          }
        : {
            transitionDuration: outMs + "ms",
            transitionDelay: "0ms",
          },
    frontText: Dynamic = value.front === "a" ? value.a : value.b;
  return (
    <span
      className={"mc-tip-fade"}
      style={{
        width: measuredSize === null ? undefined : measuredSize.width,
        ...containerTransitionStyle,
      }}
    >
      <span ref={sizerRef} className={"mc-tip-sizer"} aria-hidden={"true"}>
        {frontText}
      </span>
      {["a", "b"].map(
        (lineKey?: Dynamic): Dynamic => (
          <span
            key={lineKey}
            className={shimmer ? "mc-tip-line mc-tip-shimmer" : "mc-tip-line"}
            data-front={value.front === lineKey ? "true" : undefined}
            style={callback(value.front === lineKey)}
          >
            {value[lineKey]}
          </span>
        ),
      )}
    </span>
  );
}
function PeerBadgeLabel({ tint: tint, label: label }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = "var(--cds-" + tint + "-500)";
  return label.kind === "name" ? (
    <span
      aria-hidden={"true"}
      className={"mc-peer-tag mc-peer-cursor-label mc-claude-tag-name"}
      style={{
        background: value,
      }}
    >
      {label.text}
    </span>
  ) : (
    <span
      aria-hidden={"true"}
      className={"mc-peer-tag mc-cursor-chat"}
      style={{
        background: value,
      }}
    >
      <CrossfadeLabel
        text={label.text}
        outMs={label.outMs ?? CollaborationPeerBadgeConstant}
        inMs={label.inMs ?? defaultCrossfadeInMs}
        shimmer={label.shimmer === true}
      />
    </span>
  );
}
function PeerBadge({
  tint: tint,
  label: label,
  at: at,
  align = "arrow",
  glideMs = 0,
  glyphScale: glyphScale,
  hidden = false,
  arrowRef: arrowRef,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic =
      glyphScale !== undefined &&
      Number.isFinite(glyphScale) &&
      glyphScale > 0
        ? glyphScale
        : 1,
    isGliding: Dynamic = at !== undefined && glideMs > 0,
    scaleSuffix: Dynamic = value === 1 ? "" : " scale(" + String(value) + ")",
    cursorStyle: Dynamic =
      at !== undefined
        ? {
            transform:
              "translate(" +
              String(at.left) +
              "px," +
              String(at.top) +
              "px)" +
              scaleSuffix,
            transformOrigin: "0 0",
            ...(isGliding
              ? {
                  "--mc-claude-glide": String(glideMs) + "ms",
                }
              : {}),
          }
        : value === 1
          ? undefined
          : {
              transform: scaleSuffix.trim(),
              transformOrigin: "0 0",
            };
  return (
    <div
      aria-hidden={"true"}
      className={"mc-claude-cursor"}
      data-flow={at === undefined ? "" : undefined}
      data-align={
        at !== undefined && align === "centre" ? "centre" : undefined
      }
      data-glide={isGliding ? "" : undefined}
      data-hidden={hidden ? "" : undefined}
      style={cursorStyle}
    >
      <div className={"mc-claude-cursor-unit"}>
        <div ref={arrowRef} className={"mc-claude-cursor-arrow"}>
          <PeerCursorGlyph color={"var(--cds-" + tint + "-500)"} />
        </div>
        <PeerBadgeLabel tint={tint} label={label} />
      </div>
    </div>
  );
}
export {
  CollaborationPeerBadgeConstant,
  defaultCrossfadeInMs as CollaborationPeerBadgeConstant_2,
  CrossfadeLabel,
  jsxCollaborationPeerBadge,
  jsxCollaborationPeerBadge_2,
  jsxCollaborationPeerBadge_3,
  jsxCollaborationPeerBadge_4,
  jsxCollaborationPeerBadge_5,
  PeerBadge,
  PeerBadgeLabel,
  reactCollaborationPeerBadge,
  reactCollaborationPeerBadge_2,
  reactCollaborationPeerBadge_3,
};
export function installCollaborationPeerBadge(): () => void {
  return () => {
    reactCollaborationPeerBadge = toModuleNamespace(
      load_react(),
      1,
    );
    jsxCollaborationPeerBadge = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    CollaborationPeerBadgeConstant = 80;
    defaultCrossfadeInMs = 120;
    jsxCollaborationPeerBadge_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactCollaborationPeerBadge_2 = toModuleNamespace(
      load_react(),
      1,
    );
    jsxCollaborationPeerBadge_3 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    jsxCollaborationPeerBadge_4 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    reactCollaborationPeerBadge_3 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxCollaborationPeerBadge_5 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

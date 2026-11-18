import { CutValue } from "../accessibility/announcements";
import { DcEditorEvtValue } from "../picker/runtime-script";
import { afterClipboardSettled } from "../clipboard/state";
import { boundedPasteText } from "../inspector/editor";
import { claimClipboardMark } from "../clipboard/state";
import { emitEditorEvent } from "../events/runtime";
import { foreignArtboardPasteContext } from "../inspector/editor";
import { hasBlockingEditorOverlay } from "../text/typing-target";
import { isPreviewMessage } from "../../platform/file-content";
import { normalizePasteStamp } from "../inspector/editor";
import { type Dynamic } from "../../runtime-types";

/** 画板预览转发键盘消息时运行：根据消息类型执行删除、撤销重做、面板切换、焦点区域、批注、缩放、参考线、翻转、分组和复制剪切粘贴等快捷操作。 */
export function routeFrameKeyMessage(deps: { readonly active: Dynamic; readonly readOnly: Dynamic; readonly routeForwardedKey: Dynamic; readonly value153: Dynamic; readonly value154: Dynamic; readonly value156: Dynamic; readonly value164: Dynamic; readonly value168: Dynamic; readonly value174: Dynamic; readonly value259: Dynamic; readonly value260: Dynamic; readonly value262: Dynamic; readonly value267: Dynamic; readonly value268: Dynamic; readonly value287: Dynamic; readonly value288: Dynamic; readonly value289: Dynamic; readonly value60: Dynamic; readonly value61: Dynamic; readonly value63: Dynamic; readonly webviewRef: Dynamic }, input?: Dynamic): Dynamic {
      if (
        !deps.active ||
        !isPreviewMessage(input, deps.webviewRef.current)
      )
        return;
      let value307: Dynamic = input.data?.[DcEditorEvtValue],
        value308: Dynamic =
          (document as Dynamic).activeElement === deps.webviewRef.current,
        value309: Dynamic =
          value308 && navigator.userActivation?.isActive === true;
      if (value307?.type === "deleteSelection") {
        if (deps.readOnly) return;
        if (deps.value63()) return void deps.value154();
        if (deps.routeForwardedKey?.("delete", undefined, true) || deps.value156())
          return;
        deps.value154();
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "z") {
        if (deps.readOnly) return;
        deps.routeForwardedKey?.(value307.shift ? "Z" : "z");
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "\\") {
        if (!value308 || (deps.value289 && !deps.value287)) return;
        value309 &&
          value307.typing !== true &&
          emitEditorEvent("panel-toggle-key");
        deps.value288(deps.value289 ? false : (input2?: Dynamic): Dynamic => !input2);
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "F6") {
        if (!value309) return;
        emitEditorEvent("focus-region-key", {
          reverse: value307.shift === true,
        });
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "comment") {
        value309 && emitEditorEvent("canvas-comment-key");
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "a") {
        if (deps.readOnly) return;
        value307.shift ? deps.value268() : deps.value267();
        return;
      }
      if (
        value307?.type === "clipboardKey" &&
        (value307.key === "0" || value307.key === "+" || value307.key === "-")
      ) {
        emitEditorEvent("canvas-zoom-chord", {
          key: value307.key,
        });
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "guides") {
        value308 && emitEditorEvent("canvas-guides-toggle");
        return;
      }
      if (
        value307?.type === "clipboardKey" &&
        (value307.key === "flip-horizontal" ||
          value307.key === "flip-vertical")
      ) {
        if (deps.readOnly || hasBlockingEditorOverlay()) return;
        deps.value259(
          value307.key === "flip-horizontal" ? "horizontal" : "vertical",
          true,
        );
        return;
      }
      if (value307?.type === "clipboardKey" && value307.key === "g") {
        if (deps.readOnly) return;
        value307.shift ? deps.value262() : deps.value260();
        return;
      }
      if (value307?.type === "clipboardKey") {
        if (
          (value307.key !== "c" &&
            value307.key !== "x" &&
            value307.key !== "v" &&
            value307.key !== "d") ||
          (deps.readOnly && value307.key !== "c")
        )
          return;
        let value310: Dynamic = normalizePasteStamp(value307),
          value311: Dynamic = boundedPasteText(value307),
          value312: Dynamic =
            (value307.key === "c" || value307.key === "x") &&
            value310 != null &&
            typeof value307.mark == "boolean";
        if (value312 && value307.mark === true) {
          claimClipboardMark(value310, value311);
          return;
        }
        let state: Dynamic = {
          text: value307.key === "v" ? value311 : "",
          stamp: value310,
          hasImage: false,
          artboards:
            value307.key === "v"
              ? foreignArtboardPasteContext(value307)
              : undefined,
        };
        if (value307.key === "v") {
          afterClipboardSettled((): Dynamic => {
            !deps.value61.current ||
              !deps.value60.current ||
              deps.routeForwardedKey?.(
                "v",
                {
                  stamp: value310,
                  seen: state,
                },
                true,
              ) ||
              deps.value168.current({
                inTabOnly: true,
                seen: state,
              });
          });
          return;
        }
        (deps.value63() ||
          !deps.routeForwardedKey?.(
            value307.key,
            {
              stamp: value310,
              seen: state,
            },
            true,
          )) &&
          (value307.key === "c"
            ? deps.value164({
                inTabOnly: true,
              })
            : value307.key === "x"
              ? deps.value164({
                  inTabOnly: true,
                }) != null && deps.value153(CutValue)
              : value307.key === "d" && deps.value174());
        value312 && claimClipboardMark(value310, value311);
      }
    }

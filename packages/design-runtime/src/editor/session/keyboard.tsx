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
export function routeFrameKeyMessage(deps: { readonly active: Dynamic; readonly readOnly: Dynamic; readonly routeForwardedKey: Dynamic; readonly value153: Dynamic; readonly value154: Dynamic; readonly value156: Dynamic; readonly value164: Dynamic; readonly value168: Dynamic; readonly value174: Dynamic; readonly value259: Dynamic; readonly value260: Dynamic; readonly value262: Dynamic; readonly value267: Dynamic; readonly value268: Dynamic; readonly value287: Dynamic; readonly value288: Dynamic; readonly value289: Dynamic; readonly value60: Dynamic; readonly value61: Dynamic; readonly value63: Dynamic; readonly webviewRef: Dynamic }, message?: Dynamic): Dynamic {
      if (
        !deps.active ||
        !isPreviewMessage(message, deps.webviewRef.current)
      )
        return;
      let keyPayload: Dynamic = message.data?.[DcEditorEvtValue],
        isFrameFocused: Dynamic =
          (document as Dynamic).activeElement === deps.webviewRef.current,
        hasUserActivation: Dynamic =
          isFrameFocused && navigator.userActivation?.isActive === true;
      if (keyPayload?.type === "deleteSelection") {
        if (deps.readOnly) return;
        if (deps.value63()) return void deps.value154();
        if (deps.routeForwardedKey?.("delete", undefined, true) || deps.value156())
          return;
        deps.value154();
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "z") {
        if (deps.readOnly) return;
        deps.routeForwardedKey?.(keyPayload.shift ? "Z" : "z");
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "\\") {
        if (!isFrameFocused || (deps.value289 && !deps.value287)) return;
        hasUserActivation &&
          keyPayload.typing !== true &&
          emitEditorEvent("panel-toggle-key");
        deps.value288(deps.value289 ? false : (wasOpen?: Dynamic): Dynamic => !wasOpen);
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "F6") {
        if (!hasUserActivation) return;
        emitEditorEvent("focus-region-key", {
          reverse: keyPayload.shift === true,
        });
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "comment") {
        hasUserActivation && emitEditorEvent("canvas-comment-key");
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "a") {
        if (deps.readOnly) return;
        keyPayload.shift ? deps.value268() : deps.value267();
        return;
      }
      if (
        keyPayload?.type === "clipboardKey" &&
        (keyPayload.key === "0" || keyPayload.key === "+" || keyPayload.key === "-")
      ) {
        emitEditorEvent("canvas-zoom-chord", {
          key: keyPayload.key,
        });
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "guides") {
        isFrameFocused && emitEditorEvent("canvas-guides-toggle");
        return;
      }
      if (
        keyPayload?.type === "clipboardKey" &&
        (keyPayload.key === "flip-horizontal" ||
          keyPayload.key === "flip-vertical")
      ) {
        if (deps.readOnly || hasBlockingEditorOverlay()) return;
        deps.value259(
          keyPayload.key === "flip-horizontal" ? "horizontal" : "vertical",
          true,
        );
        return;
      }
      if (keyPayload?.type === "clipboardKey" && keyPayload.key === "g") {
        if (deps.readOnly) return;
        keyPayload.shift ? deps.value262() : deps.value260();
        return;
      }
      if (keyPayload?.type === "clipboardKey") {
        if (
          (keyPayload.key !== "c" &&
            keyPayload.key !== "x" &&
            keyPayload.key !== "v" &&
            keyPayload.key !== "d") ||
          (deps.readOnly && keyPayload.key !== "c")
        )
          return;
        let pasteStamp: Dynamic = normalizePasteStamp(keyPayload),
          pasteText: Dynamic = boundedPasteText(keyPayload),
          isClipboardMark: Dynamic =
            (keyPayload.key === "c" || keyPayload.key === "x") &&
            pasteStamp != null &&
            typeof keyPayload.mark == "boolean";
        if (isClipboardMark && keyPayload.mark === true) {
          claimClipboardMark(pasteStamp, pasteText);
          return;
        }
        let state: Dynamic = {
          text: keyPayload.key === "v" ? pasteText : "",
          stamp: pasteStamp,
          hasImage: false,
          artboards:
            keyPayload.key === "v"
              ? foreignArtboardPasteContext(keyPayload)
              : undefined,
        };
        if (keyPayload.key === "v") {
          afterClipboardSettled((): Dynamic => {
            !deps.value61.current ||
              !deps.value60.current ||
              deps.routeForwardedKey?.(
                "v",
                {
                  stamp: pasteStamp,
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
            keyPayload.key,
            {
              stamp: pasteStamp,
              seen: state,
            },
            true,
          )) &&
          (keyPayload.key === "c"
            ? deps.value164({
                inTabOnly: true,
              })
            : keyPayload.key === "x"
              ? deps.value164({
                  inTabOnly: true,
                }) != null && deps.value153(CutValue)
              : keyPayload.key === "d" && deps.value174());
        isClipboardMark && claimClipboardMark(pasteStamp, pasteText);
      }
    }

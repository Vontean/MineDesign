import { commentAnchorShortLabel } from "../../comments/labels";
import { commentArtboardElementDetail } from "../../comments/labels";
import { commentPointWithinVisibleContent } from "../chrome";
import { createPreviewHandle } from "../../preview/evaluation";
import { describeCommentElement } from "../../comments/labels";
import { pickerCommentFor } from "../../editor/picker/bridge";
import { serializeDesignCommentAnchor } from "../../comments/anchor-codec";
import { type Dynamic } from "../../runtime-types";

/** 在选中元素的快捷操作中点击评论时运行：向画板查询该元素的评论锚点与描述，换算到屏幕位置后打开评论输入框。 */
export function composeSelectedElementComment(deps: { readonly callback16: Dynamic; readonly camera: Dynamic; readonly elementSelection: Dynamic; readonly manifest: Dynamic; readonly value2: Dynamic; readonly value20: Dynamic; readonly value4: Dynamic; readonly value9: Dynamic }, input?: Dynamic): Dynamic {
            let value250: Dynamic = deps.elementSelection,
              file: Dynamic = value250.file,
              entry2: Dynamic = deps.value2.current.get(file),
              value251: Dynamic = entry2
                ? createPreviewHandle(entry2.webviewRef.current)
                : null,
              current: Dynamic = deps.value9.current;
            if (!value251 || !current) return;
            input.focus({
              preventScroll: true,
            });
            let bounds: Dynamic = input.getBoundingClientRect(),
              value252: Dynamic = deps.callback16(
                bounds.left + bounds.width / 2,
                bounds.bottom,
                current.getBoundingClientRect(),
              );
            pickerCommentFor(
              value251,
              value250.tids[0],
              value250.name ?? null,
            ).then((input2?: Dynamic): Dynamic => {
              let value253: Dynamic = deps.manifest.artboards.find(
                (input3?: Dynamic): Dynamic => input3.file === file,
              );
              if (!input2 || !value253) return;
              let value254: Dynamic =
                  deps.value20?.file === file ? deps.value20 : value253,
                value255: Dynamic =
                  input2.path == null
                    ? {
                        x: 0,
                        y: 0,
                        w: value254.w,
                        h: value254.h,
                      }
                    : input2.rect,
                { px: value256, py: value257 }: Dynamic = commentPointWithinVisibleContent(
                  value252,
                  value254,
                  value255,
                ),
                value258: Dynamic =
                  (value256 - value255.x) / (value255.w || 1),
                value259: Dynamic =
                  (value257 - value255.y) / (value255.h || 1),
                value260: Dynamic = serializeDesignCommentAnchor(
                  input2.path != null
                    ? {
                        kind: "el",
                        file: file,
                        path: input2.path,
                        tid: input2.tid,
                        fp: input2.fp,
                        fx: value258,
                        fy: value259,
                      }
                    : input2.page
                      ? {
                          kind: "artboard",
                          file: file,
                          px: value256 - input2.page.x,
                          py: value257 - input2.page.y,
                        }
                      : {
                          kind: "artboard",
                          file: file,
                          fx: value258,
                          fy: value259,
                        },
                );
              if (!value260) return;
              let value261: Dynamic =
                  input2.path == null
                    ? null
                    : describeCommentElement(entry2, input2),
                value262: Dynamic = commentAnchorShortLabel(
                  value261 == null
                    ? {
                        kind: "artboard",
                        board: value253,
                      }
                    : {
                        kind: "el",
                        board: value253,
                        el: value261,
                      },
                ),
                value263: Dynamic =
                  input2.path != null && input2.tid != null
                    ? entry2?.viewEntries([input2.tid])[0]
                    : undefined,
                value264: Dynamic = commentArtboardElementDetail(
                  value253,
                  value263 && value261
                    ? {
                        path: value263.path,
                        kind: value261.kind ?? value263.kind,
                        text: value261.text ?? value263.words(),
                      }
                    : null,
                ),
                bounds2: Dynamic = current.getBoundingClientRect(),
                entry3: Dynamic = deps.camera.get();
              deps.value4
                .compose(
                  value260,
                  {
                    x:
                      bounds2.left +
                      (value254.x + value256 - entry3.x) * entry3.scale +
                      (window as Dynamic).scrollX,
                    y:
                      bounds2.top +
                      (value254.y + value257 - entry3.y) * entry3.scale +
                      (window as Dynamic).scrollY,
                  },
                  {
                    label: value262,
                    detail: value264,
                  },
                )
                .catch((): Dynamic => {});
            });
          }

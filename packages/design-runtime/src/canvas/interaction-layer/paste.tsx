import { clampPointToRect } from "../paste-placement";
import { insertionPointerMatchesContent } from "../paste-placement";
import { type Dynamic } from "../../runtime-types";
import { visibleArtboardCenter } from "../paste-placement";

/** 粘贴或放置内容需要落点时运行：根据最近一次指针位置找到其下的画板，排除界面装饰和无效区域，返回夹在画板范围内的画布坐标，指针在画布空白处时返回不带画板的坐标。 */
export function resolvePointerInsertionPoint(deps: { readonly callback11: Dynamic; readonly callback16: Dynamic; readonly value146: Dynamic; readonly value148: Dynamic; readonly value182: Dynamic; readonly value183: Dynamic; readonly value55: Dynamic; readonly value56: Dynamic; readonly value9: Dynamic; readonly value96: Dynamic }, input?: Dynamic): Dynamic {
        let current: Dynamic = deps.value148.current,
          current2: Dynamic = deps.value9.current;
        if (
          !current ||
          current.inFrame ||
          !current2 ||
          deps.value55.current != null ||
          deps.value96.current ||
          deps.callback11()
        )
          return null;
        let value250: Dynamic = (document as Dynamic).elementFromPoint(
          current.x,
          current.y,
        );
        if (!(value250 instanceof Element) || !current2.contains(value250))
          return null;
        let ancestor: Dynamic = value250.closest("[data-mega-artboard]"),
          value251: Dynamic = ancestor?.dataset.megaArtboard ?? null;
        value251 != null &&
          value251 !== deps.value183.current &&
          deps.value146.current.artboards.some(
            (input2?: Dynamic): Dynamic =>
              input2.file === value251 && input2.frameless,
          ) &&
          (value251 = null);
        let value252: Dynamic =
          ancestor == null &&
          value250.closest(
            '[data-mega-chrome="annotation"], [data-mega-chrome="picture-pending"]',
          ) != null;
        if (
          (ancestor == null &&
            !value252 &&
            value250.closest("[data-mega-chrome]") != null &&
            value250.getAttribute("data-mega-chrome") !== "set-box-pad") ||
          (value251 != null &&
            (0, insertionPointerMatchesContent)(
              input,
              value251,
              deps.value182.current,
              deps.value56.current,
            ))
        )
          return null;
        let value253: Dynamic = deps.callback16(
          current.x,
          current.y,
          current2.getBoundingClientRect(),
        );
        if (value251 == null)
          return value252
            ? {
                x: value253.x,
                y: value253.y,
                file: null,
                overAnnotation: value252,
              }
            : {
                x: value253.x,
                y: value253.y,
                file: null,
              };
        let value254: Dynamic = deps.value146.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === value251,
        );
        return value254
          ? {
              ...(0, clampPointToRect)(value253, value254),
              file: value251,
            }
          : null;
      }

/** 粘贴图片时运行：优先放在当前指针落点，只选中一块画板时放到该画板可见区域中心，否则放到目标画板中心，并交给图片放置回调。 */
export function placePastedImagesOnCanvas(deps: { readonly camera: Dynamic; readonly onImageDrop: Dynamic; readonly value146: Dynamic; readonly value177: Dynamic; readonly value55: Dynamic; readonly value57: Dynamic; readonly value9: Dynamic }, input?: Dynamic, options2?: Dynamic, context?: Dynamic): Dynamic {
        if (!deps.onImageDrop) return false;
        let value250: Dynamic = navigator.userActivation?.isActive
          ? deps.value177()
          : null;
        if (value250) {
          let current: Dynamic = deps.value57.current,
            value254: Dynamic =
              value250.file == null &&
              current.notes.size === 0 &&
              current.files.size === 1
                ? deps.value146.current.artboards.find(
                    (input2?: Dynamic): Dynamic =>
                      current.files.has(input2.file) && !input2.frameless,
                  )
                : undefined;
          if (value254) {
            let value255: Dynamic = deps.value9.current?.getBoundingClientRect(),
              value256: Dynamic = (0, visibleArtboardCenter)(
                value254,
                deps.value55.current == null && value255
                  ? {
                      ...deps.camera.get(),
                      width: value255.width,
                      height: value255.height,
                    }
                  : null,
              );
            deps.onImageDrop(
              options2,
              value256.x,
              value256.y,
              "pasted",
              value254.file,
            );
          } else
            deps.onImageDrop(
              options2,
              value250.x,
              value250.y,
              "pasted",
              value250.file ?? undefined,
            );
          return true;
        }
        if (context.selection) return false;
        let value251: Dynamic = deps.value146.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (!value251) return false;
        let value252: Dynamic = deps.value9.current?.getBoundingClientRect(),
          value253: Dynamic = (0, visibleArtboardCenter)(
            value251,
            deps.value55.current == null && value252
              ? {
                  ...deps.camera.get(),
                  width: value252.width,
                  height: value252.height,
                }
              : null,
          );
        deps.onImageDrop(
          options2,
          value253.x,
          value253.y,
          "pasted",
          value251.file,
        );
        return true;
      }

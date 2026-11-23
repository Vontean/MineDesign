import { CanvasWorkingStateReplace } from "../working-state";
import { VideoMp4VideoWebmVideoQuicktimeMovValue } from "../../editor/media/video-upload";
import { announce } from "../../editor/accessibility/announcer";
import { isEmbedFrozen } from "../../platform/file-content";
import { isVideoFile } from "../../editor/media/video-upload";
import { probeVideoFile } from "../../editor/media/video-upload";
import { trackEmbeddedWrite } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uploadDesignFile } from "../working-state";
import { uploadDesignVideo } from "../working-state";
import { videoUploadFailureMessage } from "../../editor/media/video-upload";
import { videoUploadRefusal } from "../../editor/media/video-upload";

/** 属性面板点击替换图片时运行：打开文件选择框，上传所选图片并替换选中图片元素的地址。 */
export function pickReplacementImage(deps: { readonly artboardEntriesRef: Dynamic; readonly showRejection: Dynamic; readonly selectionProbe: Dynamic; readonly framePickState: Dynamic; readonly framePickStateRef: Dynamic }): Dynamic {
  let probeEl: Dynamic = deps.selectionProbe.probeEl;
  if (!probeEl) return;
  if (
    /\{\{/.test(
      deps.selectionProbe.seed.imageSrc ?? "",
    )
  )
    return deps.showRejection(
      "This image comes from the design's script \u2014 change it in Properties.",
    );
  let documentIdentity: Dynamic = deps.framePickState?.identity,
    fileInput: Dynamic = (
      document as Dynamic
    ).createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  (document as Dynamic).body.appendChild(
    fileInput,
  );
  fileInput.addEventListener(
    "cancel",
    (): Dynamic => fileInput.remove(),
  );
  fileInput.onchange = (): Dynamic => {
    let pickedFile: Dynamic =
      fileInput.files?.[0];
    fileInput.remove();
    pickedFile &&
      trackEmbeddedWrite(
        uploadDesignFile(
          "appifact",
          null,
          pickedFile,
        ).then(
          ({
            src: src,
          }: Dynamic): Dynamic =>
            isEmbedFrozen() ||
            deps.framePickStateRef.current?.identity !==
              documentIdentity
              ? null
              : (deps.artboardEntriesRef.current
                  .get(probeEl.file)
                  ?.replaceImageFor(
                    probeEl.tid,
                    {
                      src: src,
                      height: null,
                      srcset: null,
                    },
                  ) ?? false),
        ),
      )
        .then(
          (placed?: Dynamic): Dynamic => {
            placed === false &&
              deps.showRejection(
                "That image could not be placed here.",
              );
          },
        )
        .catch(
          (): Dynamic =>
            deps.showRejection(
              "Image upload failed.",
            ),
        );
  };
  fileInput.click();
}

/** 属性面板点击替换视频时运行：打开文件选择框，校验与探测视频、上传后替换选中视频元素，并播报结果。 */
export function pickReplacementVideo(deps: { readonly artboardEntriesRef: Dynamic; readonly showRejection: Dynamic; readonly selectionProbe: Dynamic; readonly dropTargetRef: Dynamic }): Dynamic {
  let probeEl: Dynamic = deps.selectionProbe.probeEl;
  if (!probeEl) return;
  let videoKey: Dynamic =
    deps.artboardEntriesRef.current
      .get(probeEl.file)
      ?.videoKey(probeEl.tid) ?? null;
  if (videoKey === null)
    return deps.showRejection(
      "This video can't be replaced: it has no file of its own.",
    );
  if (videoKey.src.includes("{{"))
    return deps.showRejection(
      "This video's file comes from the design's data, so it can't be replaced here.",
    );
  let fileInput: Dynamic = (
    document as Dynamic
  ).createElement("input");
  fileInput.type = "file";
  fileInput.accept =
    VideoMp4VideoWebmVideoQuicktimeMovValue;
  fileInput.hidden = true;
  (document as Dynamic).body.appendChild(
    fileInput,
  );
  fileInput.addEventListener(
    "cancel",
    (): Dynamic => fileInput.remove(),
  );
  fileInput.onchange = (): Dynamic => {
    let pickedFile: Dynamic =
      fileInput.files?.[0];
    fileInput.remove();
    if (!pickedFile) return;
    if (!isVideoFile(pickedFile))
      return deps.showRejection(
        "Pick a video file to replace a video.",
      );
    let refusal: Dynamic = videoUploadRefusal(pickedFile);
    if (refusal !== null)
      return deps.showRejection(
        CanvasWorkingStateReplace(
          videoUploadFailureMessage(
            refusal,
          ),
        ),
      );
    announce(
      "Uploading video",
    );
    trackEmbeddedWrite(
      (async (): Promise<Dynamic> => {
        let probe: Dynamic = await probeVideoFile(
          pickedFile,
        ).catch(
          (): Dynamic => "probe_timeout",
        );
        if (typeof probe == "string") {
          deps.showRejection(
            CanvasWorkingStateReplace(
              videoUploadFailureMessage(
                probe,
              ),
            ),
          );
          return false;
        }
        let upload: Dynamic = await uploadDesignVideo(
          pickedFile,
          probe,
        );
        if (isEmbedFrozen())
          return false;
        if ("refused" in upload) {
          deps.showRejection(
            CanvasWorkingStateReplace(
              upload.refused,
            ),
          );
          return false;
        }
        let getFrameEntry: Dynamic =
            (): Dynamic =>
              probeEl.file ===
              deps.dropTargetRef.current
                ? undefined
                : deps.artboardEntriesRef.current.get(
                    probeEl.file,
                  ),
          frameEntry: Dynamic = getFrameEntry();
        for (
          let index: Dynamic = 0;
          !frameEntry &&
          index < 240 &&
          !isEmbedFrozen();
          index++
        ) {
          await new Promise(
            (resolve?: Dynamic): Dynamic =>
              setTimeout(resolve, 250),
          );
          frameEntry = getFrameEntry();
        }
        if (isEmbedFrozen())
          return false;
        if (!frameEntry) {
          deps.showRejection(
            "The video wasn't replaced: its artboard isn't open for editing. Open it and replace the video again.",
          );
          return false;
        }
        let replaceResult: Dynamic =
          await frameEntry.replaceVideoFor(
            videoKey,
            {
              src: upload.src,
              width: probe.width,
              height: probe.height,
            },
          );
        replaceResult === "ok"
          ? announce(
              "Video replaced",
            )
          : deps.showRejection(
              replaceResult === "unsure"
                ? "The video wasn't replaced: a copy of it was added or removed meanwhile, so which one you meant can't be told. Select it and replace it again."
                : replaceResult === "gone"
                  ? "The video wasn't replaced: it was changed or removed meanwhile. Select the video and replace it again."
                  : "The video wasn't replaced: the new file couldn't be used. Pick another .mp4, .mov or .webm.",
            );
        return replaceResult === "ok";
      })(),
    );
  };
  fileInput.click();
}

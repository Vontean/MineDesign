import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var ChromeToolIconsRectOvalConfig: Dynamic;
var ChromeToolIconsColumnRowTextConfig: Dynamic;
var ChromeToolIconsNoteTitleRectConfig: Dynamic;
export {
  ChromeToolIconsColumnRowTextConfig,
  ChromeToolIconsNoteTitleRectConfig,
  ChromeToolIconsRectOvalConfig,
};
export function installEditorChromeToolIcons(): () => void {
  return () => {
    ChromeToolIconsRectOvalConfig = {
      rect: {
        name: "Rect",
        viewBox: 16,
        get paths() { return [{
            d: "M3.5 4.5h9a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z",
            strokeWidth: 1,
          }]; },
      },
      oval: {
        name: "Oval",
        viewBox: 16,
        get paths() { return [{
            d: "M8 3a5 5 0 1 0 0 10a5 5 0 1 0 0-10Z",
            strokeWidth: 1,
          }]; },
      },
    };
    ChromeToolIconsColumnRowTextConfig = {
      column: {
        name: "AlignStretch",
      },
      row: {
        name: "Reorder",
      },
      text: {
        name: "TextT",
      },
      frame: {
        name: "FrameHash",
      },
      grid: {
        name: "Grid",
      },
      rect: {
        name: "Stop",
      },
      oval: {
        custom: ChromeToolIconsRectOvalConfig.oval,
      },
      line: {
        name: "LineSegment",
      },
      image: {
        name: "Image",
      },
      table: {
        name: "Table",
      },
      link: {
        name: "Link",
      },
      component: {
        name: "Box",
      },
    };
    ChromeToolIconsNoteTitleRectConfig = {
      note: {
        name: "Note",
      },
      title: {
        name: "TextT",
      },
      rect: {
        name: "Stop",
      },
      oval: {
        custom: ChromeToolIconsRectOvalConfig.oval,
      },
      line: {
        name: "LineSegment",
      },
      arrow: {
        name: "ArrowLine",
      },
      pen: {
        name: "Edit",
      },
      image: {
        name: "Image",
      },
    };
  };
}

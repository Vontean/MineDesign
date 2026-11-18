import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import type { ChromeMeasure } from "./frame-payloads";
import { jsxCanvasNote } from "./note";
import { initializeCdsIndex } from "../cds/index";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactCanvasMeasurements: Dynamic;
var reactCanvasMeasurements_2: Dynamic;
var SaveNowValue: Dynamic;
var OpenFindValue: Dynamic;
var CanvasMeasurementsPattern: Dynamic;
var CanvasMeasurementsIsSafeInteger: Dynamic;
var CanvasMeasurementsConstant: Dynamic;
var shortSlugPattern: Dynamic;
var eightLimitSecond: Dynamic;
var CanvasMeasurementsAZaZPattern: Dynamic;
var shortSlugPatternCopy: Dynamic;
var eightLimitThird: Dynamic;
var maxValueNines: Dynamic;
var hexColorPattern: Dynamic;
/** 测距叠层：在画板坐标里画线段与数值标注，线宽和字号按画布缩放反向补偿。 */
function MeasurementOverlay({ m: m, scale: scale }: { m: ChromeMeasure; scale: number }): Dynamic {
  useUiLocale();
  return (
    <jsxCanvasNote.Fragment>
      <svg
        data-testid={"measure-overlay"}
        aria-hidden={"true"}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          pointerEvents: "none",
        }}
        width={1}
        height={1}
      >
        {m.lines.map(
          (line?: Dynamic, lineIndex?: Dynamic): Dynamic =>
            (() => {
              const _Component = "line";
              const _props = {
                x1: line.x1,
                y1: line.y1,
                x2: line.x2,
                y2: line.y2,
                style: {
                  stroke: "var(--t-measure)",
                  strokeWidth: 1 / scale,
                  strokeDasharray: line.ext
                    ? String(3 / scale) + " " + String(3 / scale)
                    : undefined,
                  opacity: line.ext ? 0.6 : 1,
                },
              } as const;
              const _key = "ml" + String(lineIndex);
              return <_Component key={_key} {..._props} />;
            })(),
        )}
      </svg>
      {m.labels.map(
        (label?: Dynamic, labelIndex?: Dynamic): Dynamic =>
          (() => {
            const LabelElement = "div";
            const labelProps = {
              "data-testid": "measure-label",
              "aria-hidden": "true",
              style: {
                position: "absolute",
                left: label.x,
                top: label.y,
                transform:
                  label.axis === "x"
                    ? "translate(-50%, " + String(5 / scale) + "px)"
                    : "translate(" + String(5 / scale) + "px, -50%)",
                background: "var(--t-measure)",
                color: "#FFFFFF",
                fontFamily: "system-ui, sans-serif",
                fontSize: 11 / scale,
                lineHeight: 1.4,
                fontVariantNumeric: "tabular-nums",
                padding: String(1 / scale) + "px " + String(5 / scale) + "px",
                borderRadius: 4 / scale,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              },
              children: label.text,
            } as const;
            const labelKey = "mt" + String(labelIndex);
            return <LabelElement key={labelKey} {...labelProps} />;
          })(),
      )}
    </jsxCanvasNote.Fragment>
  );
}
export {
  CanvasMeasurementsAZaZPattern,
  CanvasMeasurementsConstant,
  eightLimitSecond as CanvasMeasurementsConstant_2,
  eightLimitThird as CanvasMeasurementsConstant_3,
  maxValueNines as CanvasMeasurementsConstant_4,
  CanvasMeasurementsIsSafeInteger,
  CanvasMeasurementsPattern,
  shortSlugPattern as CanvasMeasurementsPattern_2,
  shortSlugPatternCopy as CanvasMeasurementsPattern_3,
  hexColorPattern as CanvasMeasurementsPattern_4,
  MeasurementOverlay,
  OpenFindValue,
  reactCanvasMeasurements,
  reactCanvasMeasurements_2,
  SaveNowValue,
};
export function installCanvasMeasurements(): () => void {
  return () => {
    reactCanvasMeasurements = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    reactCanvasMeasurements_2 = toModuleNamespace(
      load_react(),
      1,
    );
    SaveNowValue = "save_now";
    OpenFindValue = "open_find";
    CanvasMeasurementsPattern = /^[a-z0-9]{1,8}$/;
    CanvasMeasurementsIsSafeInteger = (durationMs?: Dynamic): Dynamic =>
      typeof durationMs == "number" &&
      Number.isSafeInteger(durationMs) &&
      durationMs > 5e3 &&
      durationMs <= 15 * 6e4
        ? durationMs
        : undefined;
    CanvasMeasurementsConstant = 8;
    shortSlugPattern = /^[a-z][a-z0-9_-]{0,31}$/;
    eightLimitSecond = 8;
    CanvasMeasurementsAZaZPattern = /^[A-Za-z0-9_-]{16,64}$/;
    shortSlugPatternCopy = /^[a-z][a-z0-9_-]{0,31}$/;
    eightLimitThird = 8;
    maxValueNines = 9999;
    hexColorPattern = /^#[0-9a-f]{6}$/;
  };
}

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
var CanvasMeasurementsPattern_2: Dynamic;
var CanvasMeasurementsConstant_2: Dynamic;
var CanvasMeasurementsAZaZPattern: Dynamic;
var CanvasMeasurementsPattern_3: Dynamic;
var CanvasMeasurementsConstant_3: Dynamic;
var CanvasMeasurementsConstant_4: Dynamic;
var CanvasMeasurementsPattern_4: Dynamic;
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
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            (() => {
              const _Component = "line";
              const _props = {
                x1: input.x1,
                y1: input.y1,
                x2: input.x2,
                y2: input.y2,
                style: {
                  stroke: "var(--t-measure)",
                  strokeWidth: 1 / scale,
                  strokeDasharray: input.ext
                    ? String(3 / scale) + " " + String(3 / scale)
                    : undefined,
                  opacity: input.ext ? 0.6 : 1,
                },
              } as const;
              const _key = "ml" + String(options);
              return <_Component key={_key} {..._props} />;
            })(),
        )}
      </svg>
      {m.labels.map(
        (input?: Dynamic, options?: Dynamic): Dynamic =>
          (() => {
            const _Component2 = "div";
            const _props2 = {
              "data-testid": "measure-label",
              "aria-hidden": "true",
              style: {
                position: "absolute",
                left: input.x,
                top: input.y,
                transform:
                  input.axis === "x"
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
              children: input.text,
            } as const;
            const _key2 = "mt" + String(options);
            return <_Component2 key={_key2} {..._props2} />;
          })(),
      )}
    </jsxCanvasNote.Fragment>
  );
}
export {
  CanvasMeasurementsAZaZPattern,
  CanvasMeasurementsConstant,
  CanvasMeasurementsConstant_2,
  CanvasMeasurementsConstant_3,
  CanvasMeasurementsConstant_4,
  CanvasMeasurementsIsSafeInteger,
  CanvasMeasurementsPattern,
  CanvasMeasurementsPattern_2,
  CanvasMeasurementsPattern_3,
  CanvasMeasurementsPattern_4,
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
    CanvasMeasurementsIsSafeInteger = (input?: Dynamic): Dynamic =>
      typeof input == "number" &&
      Number.isSafeInteger(input) &&
      input > 5e3 &&
      input <= 15 * 6e4
        ? input
        : undefined;
    CanvasMeasurementsConstant = 8;
    CanvasMeasurementsPattern_2 = /^[a-z][a-z0-9_-]{0,31}$/;
    CanvasMeasurementsConstant_2 = 8;
    CanvasMeasurementsAZaZPattern = /^[A-Za-z0-9_-]{16,64}$/;
    CanvasMeasurementsPattern_3 = /^[a-z][a-z0-9_-]{0,31}$/;
    CanvasMeasurementsConstant_3 = 8;
    CanvasMeasurementsConstant_4 = 9999;
    CanvasMeasurementsPattern_4 = /^#[0-9a-f]{6}$/;
  };
}

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function parseGoogleFontsRequest(
  items?: Dynamic,
  fontOptions?: Dynamic,
): Dynamic {
  let text: Dynamic = "https://fonts.googleapis.com/css2?";
  if (
    typeof items != "string" ||
    items.length > 1024 ||
    items.slice(0, text.length) !== text
  )
    return [];
  let value: Dynamic = items.slice(text.length).split("&");
  if (value.some((queryPart?: Dynamic): Dynamic => queryPart.slice(0, 5) === "text="))
    return [];
  let requests: Dynamic = [];
  for (let familyQuery of value as Dynamic) {
    if (familyQuery.slice(0, 7) !== "family=") continue;
    let maxRequests: Dynamic = requests.length + 16,
      familySpec: Dynamic = familyQuery.slice(7).replace(/%20| /g, "+"),
      axisSeparator: Dynamic = familySpec.indexOf(":"),
      familyName: Dynamic = axisSeparator < 0 ? familySpec : familySpec.slice(0, axisSeparator);
    if (!/^[A-Za-z0-9][A-Za-z0-9+._-]{0,99}$/.test(familyName)) continue;
    let variants: Dynamic = [["0", "400"]];
    if (axisSeparator >= 0) {
      let axisStart: Dynamic = familySpec.indexOf("@", axisSeparator),
        axisNames: Dynamic = familySpec
          .slice(axisSeparator + 1, axisStart < 0 ? axisSeparator : axisStart)
          .split(","),
        italicAxis: Dynamic = axisNames.indexOf("ital"),
        weightAxis: Dynamic = axisNames.indexOf("wght");
      if (
        axisStart < 0 ||
        axisNames.some(
          (axis?: Dynamic): Dynamic => axis !== "ital" && axis !== "wght",
        )
      )
        continue;
      variants = [];
      for (let variantSpec of familySpec.slice(axisStart + 1).split(";") as Dynamic) {
        let axisValues: Dynamic = variantSpec.split(","),
          variant: Dynamic = [
            italicAxis < 0 ? "0" : (axisValues[italicAxis] ?? ""),
            weightAxis < 0 ? "400" : (axisValues[weightAxis] ?? ""),
          ];
        if (
          axisValues.length !== axisNames.length ||
          !/^[01]$/.test(variant[0]) ||
          !/^[1-9]\d{0,3}(?:\.\.[1-9]\d{0,3})?$/.test(variant[1])
        ) {
          variants = [];
          break;
        }
        variants.push(variant);
      }
      if (variants.length === 0) continue;
    }
    let variantKeys: Dynamic = variants.map(
        (variant?: Dynamic): Dynamic => variant[0] + "," + variant[1],
      ),
      knownVariant: Dynamic =
        fontOptions !== undefined &&
        Object.prototype.hasOwnProperty.call(
          fontOptions,
          familyName.replace(/\+/g, " ").toLowerCase(),
        )
          ? fontOptions[familyName.replace(/\+/g, " ").toLowerCase()]
          : undefined,
      result: Dynamic;
    if (knownVariant !== undefined) {
      let callback: Dynamic = (
        italic?: Dynamic,
        weight?: Dynamic,
      ): Dynamic =>
        variants.some(
          (variant?: Dynamic): Dynamic =>
            variant[0] === italic &&
            weight >= Number(variant[1].split("..")[0]) &&
            weight <= Number(variant[1].split("..").pop()),
        );
      result = [];
      for (let italicValue of (knownVariant.italic ? ["0", "1"] : ["0"]) as Dynamic) {
        if (knownVariant.wght === undefined) {
          for (let weight of (knownVariant.statics ?? []) as Dynamic)
            callback(italicValue, weight) ||
              result.push(italicValue + "," + String(weight));
          continue;
        }
        let index: Dynamic = 0;
        for (
          let weightValue: Dynamic = knownVariant.wght[0];
          weightValue <= knownVariant.wght[1] + 100;
          weightValue += 100
        ) {
          let isInRange: Dynamic =
            weightValue <= knownVariant.wght[1] && !callback(italicValue, weightValue);
          isInRange && index === 0 && (index = weightValue);
          !isInRange &&
            index !== 0 &&
            (result.push(
              italicValue +
                "," +
                String(index) +
                (weightValue - 100 > index ? ".." + String(weightValue - 100) : ""),
            ),
            (index = 0));
        }
      }
    } else {
      let callback: Dynamic = (variant?: Dynamic): Dynamic =>
          Number(variant[1].split("..").pop()) >= 600,
        standardVariants: Dynamic = variants.filter(
          (variant?: Dynamic): Dynamic => variant[0] === "0",
        );
      result = standardVariants
        .map((variant?: Dynamic): Dynamic => "1," + variant[1])
        .concat(
          standardVariants.some(callback) ? [] : ["0,700"],
          variants.some(callback) ? [] : ["1,700"],
        );
    }
    for (let variantKey of result as Dynamic) {
      let fontRequest: Dynamic =
        text + "family=" + familyName + ":ital,wght@" + variantKey + "&display=swap";
      variantKeys.indexOf(variantKey) < 0 &&
        requests.indexOf(fontRequest) < 0 &&
        requests.length < maxRequests &&
        requests.push(fontRequest);
    }
  }
  return requests;
}
export {
  parseGoogleFontsRequest,
};
export function installEditorTypographyGoogleFonts(): () => void {
  return () => {};
}

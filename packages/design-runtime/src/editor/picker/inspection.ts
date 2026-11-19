/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

async function inspectPickerCssVariables(
  webContents?: Dynamic,
  items?: Dynamic,
): Promise<Dynamic> {
  if (items.length === 0)
    return {
      vars: new Set(),
      settled: true,
    };
  try {
    let value: Dynamic = await webContents.executeJavaScript(
      `(function(ns){var done=document.readyState==='complete',settled=done;var ls=document.querySelectorAll('link[rel~="stylesheet"][href]:not([disabled]):not([rel~="alternate"])');for(var j=0;j<ls.length;j++){if(!ls[j].sheet){if(!done)return null;settled=false}}var cs=getComputedStyle(document.documentElement);var out=[];for(var i=0;i<ns.length;i++){if(cs.getPropertyValue(ns[i]).trim())out.push(ns[i])}return {vars:out,settled:settled}})(${JSON.stringify(items)})`,
      4e3,
    );
    return value
      ? {
          vars: new Set(value.vars),
          settled: value.settled === true,
        }
      : null;
  } catch {
    return null;
  }
}
function observePickerCssVariables(
  webContents?: Dynamic,
  cssVariableNames?: Dynamic,
  onChange?: Dynamic,
): Dynamic {
  let flag: Dynamic = false,
    value: Dynamic = [0, 300, 1e3, 2e3, 5e3, 12e3, 3e4].map(
      (delayMs?: Dynamic): Dynamic =>
        setTimeout((): Dynamic => {
          inspectPickerCssVariables(webContents, cssVariableNames).then(
            (inspection?: Dynamic): Dynamic => {
              flag ||
                !inspection ||
                (inspection.vars.size === 0 && !inspection.settled && delayMs < 5e3) ||
                onChange(inspection.vars);
            },
          );
        }, delayMs),
    );
  return (): Dynamic => {
    flag = true;
    value.forEach(clearTimeout);
  };
}
function sameStringSet(current?: Dynamic, next?: Dynamic): Dynamic {
  return (
    current !== undefined &&
    current.size === next.size &&
    [...next].every((item?: Dynamic): Dynamic => current.has(item))
  );
}
async function getPickerFontFaces(webContents?: Dynamic): Promise<Dynamic> {
  try {
    let value: Dynamic = await webContents.executeJavaScript(
      "(function(){var o=[],seen={};document.fonts.forEach(function(f){var k=f.family+'|'+f.weight+'|'+f.style;if(f.status!=='error'&&!seen[k]){seen[k]=1;o.push({family:f.family,weight:f.weight,style:f.style})}});return o})()",
      4e3,
    );
    return Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
async function inspectPickerProps(
  webContents?: Dynamic,
  props: Dynamic = {},
): Promise<Dynamic> {
  let value: Dynamic = Object.create(null);
  try {
    let propsJson: Dynamic = await webContents.executeJavaScript(
      `(function(){try{var n=window.__dcRootName&&window.__dcRootName();var r=n&&window.__dcRegistry&&window.__dcRegistry[n];if(!r||!r.Logic)return null;var v=new r.Logic(${JSON.stringify(props)}).renderVals();if(!v||typeof v!=='object')return null;var o={},c=0;for(var k in v){if(c>=200)break;var x=v[k],t=typeof x;if(x===null||t==='boolean'||(t==='number'&&isFinite(x))||(t==='string'&&x.length<=4000)){o[k]=x;c++;}}return JSON.stringify(o)}catch(e){return null}})()`,
      1500,
    );
    if (typeof propsJson != "string" || propsJson.length > 4e5) return value;
    let parsedProps: Dynamic = JSON.parse(propsJson);
    if (!parsedProps || typeof parsedProps != "object" || Array.isArray(parsedProps))
      return value;
    let index: Dynamic = 0;
    for (let [propName, propValue] of Object.entries(parsedProps) as Dynamic)
      index >= 200 ||
        !/^[A-Za-z_$][\w$]*$/.test(propName) ||
        propName === "__proto__" ||
        propName === "constructor" ||
        ((propValue === null ||
          typeof propValue == "boolean" ||
          (typeof propValue == "number" && Number.isFinite(propValue)) ||
          (typeof propValue == "string" && propValue.length <= 4e3)) &&
          ((value[propName] = propValue), index++));
  } catch {}
  return value;
}
async function getPickerComponentScript(
  webContents?: Dynamic,
  componentName?: Dynamic,
  props?: Dynamic,
): Promise<Dynamic> {
  try {
    let value: Dynamic = await webContents.executeJavaScript(
      `(function(){try{if(!window.__dcRegistry)return null;var r=window.__dcRegistry[${JSON.stringify(componentName)}];if(!r)return 'missing';if(!r.Logic)return JSON.stringify({l:false,v:{},h:[]});var v=new r.Logic(${JSON.stringify(props)}).renderVals()||{};if(typeof v!=='object')return null;var o={},h=[],c=0;for(var k in v){if(++c>200)return 'big';var x=v[k],t=typeof x;if(x===null||t==='boolean'||(t==='number'&&isFinite(x))||(t==='string'&&x.length<=4000))o[k]=x;else h.push(k)}return JSON.stringify({l:true,v:o,h:h})}catch(e){return null}})()`,
      1500,
    );
    if (value === "missing" || value === "big") return value;
    if (typeof value != "string") return null;
    if (value.length > 4e5) return "big";
    let parsedResult: Dynamic = JSON.parse(value);
    if (
      !parsedResult ||
      typeof parsedResult.l != "boolean" ||
      !parsedResult.v ||
      typeof parsedResult.v != "object" ||
      Array.isArray(parsedResult.v) ||
      !Array.isArray(parsedResult.h)
    )
      return null;
    let callback: Dynamic = (name?: Dynamic): Dynamic =>
        typeof name == "string" &&
        /^[A-Za-z_$][\w$]*$/.test(name) &&
        name !== "__proto__" &&
        name !== "constructor",
      vals: Dynamic = Object.create(null),
      heldNames: Dynamic = parsedResult.h.filter(callback);
    for (let [entryName, entryValue] of Object.entries(parsedResult.v) as Dynamic)
      callback(entryName) &&
      (entryValue === null ||
        typeof entryValue == "boolean" ||
        (typeof entryValue == "number" && Number.isFinite(entryValue)) ||
        (typeof entryValue == "string" && entryValue.length <= 4e3))
        ? (vals[entryName] = entryValue)
        : heldNames.push(entryName);
    return {
      hasLogic: parsedResult.l,
      vals: vals,
      held: heldNames,
    };
  } catch {
    return null;
  }
}
async function getPickerPropsMetadata(
  webContents?: Dynamic,
  componentName?: Dynamic,
): Promise<Dynamic> {
  try {
    let value: Dynamic = await webContents.executeJavaScript(
      `(function(){try{var r=window.__dcRegistry&&window.__dcRegistry[${JSON.stringify(componentName)}];return r&&r.propsMeta?JSON.stringify(r.propsMeta):null}catch(e){return null}})()`,
      4e3,
    );
    return typeof value != "string" ? null : JSON.parse(value);
  } catch {
    return null;
  }
}
export {
  getPickerComponentScript,
  getPickerFontFaces,
  getPickerPropsMetadata,
  inspectPickerCssVariables,
  inspectPickerProps,
  observePickerCssVariables,
  sameStringSet,
};
export function installEditorPickerInspection(): () => void {
  return () => {};
}

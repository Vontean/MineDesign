import { expect, it } from "vitest";
import {
  classifyExportAbort,
  classifyExportDeliveryOutcome,
  classifyExportFailure,
  classifyExportSaveOutcome,
  classifyHtmlDelivery,
  classifyImageSaveOutcome,
  classifyPdfDelivery,
} from "./outcomes";

it('保存成功返回 success；被拒绝的保存按错误码区分中止与能力错误', () => {
  expect(classifyImageSaveOutcome(null)).toEqual(["download", "success"]);
  expect(classifyImageSaveOutcome({ outcome: "saved" })).toEqual(["download", "success"]);
  expect(classifyImageSaveOutcome({ outcome: "declined" })).toEqual(["download", "aborted"]);
  expect(classifyImageSaveOutcome({ outcome: "unsupported", code: "too_large" })).toEqual(["download", "aborted"]);
  expect(classifyImageSaveOutcome({ outcome: "unsupported", code: "other" })).toEqual(["download", "failure", "capability_error"]);
});

it('图片与 zip 的操作名是 download，pdf 与 html 是 export', () => {
  expect(classifyExportAbort("zip")).toEqual(["download", "aborted"]);
  expect(classifyExportAbort("pdf")).toEqual(["export", "aborted"]);
  expect(classifyExportSaveOutcome("pdf", "unsupported")).toEqual(["export", "success"]);
});

it('失败原因：zip 与 html 是内部错误，其余是渲染错误', () => {
  expect(classifyExportFailure("zip")).toEqual(["download", "failure", "internal"]);
  expect(classifyExportFailure("html")).toEqual(["export", "failure", "internal"]);
  expect(classifyExportFailure("pdf")).toEqual(["export", "failure", "render"]);
});

it('交付结果：delivered 成功，declined 与 withheld 中止，failed 视情况中止', () => {
  expect(classifyExportDeliveryOutcome("pdf", { outcome: "delivered" })).toEqual(["export", "success"]);
  expect(classifyExportDeliveryOutcome("pdf", { outcome: "withheld" })).toEqual(["export", "aborted"]);
  expect(classifyPdfDelivery({ outcome: "failed" }, true)).toEqual(["export", "aborted"]);
  expect(classifyPdfDelivery({ outcome: "failed" }, false)).toEqual(["export", "failure", "render"]);
  expect(classifyExportDeliveryOutcome("pdf", { outcome: "unsupported", code: "request_unknown" })).toEqual(["export", "aborted"]);
  expect(classifyExportDeliveryOutcome("pdf", { outcome: "mystery" })).toBeUndefined();
});

it('HTML 交付失败时，体积过大、未加载、为空或超时算中止', () => {
  expect(classifyHtmlDelivery({ outcome: "failed" }, "timeout")).toEqual(["export", "aborted"]);
  expect(classifyHtmlDelivery({ outcome: "failed" }, "boom")).toEqual(["export", "failure", "internal"]);
  expect(classifyHtmlDelivery({ outcome: "failed" })).toEqual(["export", "failure", "internal"]);
});

/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { letterPattern } from "./text-encoding";

var PdfLanguageItems: Dynamic;
var languageScriptDetectors: Dynamic;
var PdfLanguagePattern: Dynamic;
var hanScriptPattern: Dynamic;
var hangulScriptPattern: Dynamic;
var PdfLanguageScriptLatinPattern: Dynamic;
var PdfLanguageAZaZAZaZPattern: Dynamic;
var localeScriptRules: Dynamic;
function detectTextLanguage(text?: Dynamic): Dynamic {
  let value: Dynamic = text.slice(0, 2e5),
    callback: Dynamic = (pattern?: Dynamic): Dynamic =>
      (value.match(pattern) ?? []).length,
    letterCount: Dynamic = callback(/\p{L}/gu);
  if (letterCount < 10) return;
  let [items, cjkCount, koreanCount]: Dynamic = [
      callback(PdfLanguagePattern),
      callback(hanScriptPattern),
      callback(hangulScriptPattern),
    ],
    weightedCount: Dynamic = letterCount + 2 * (items + cjkCount + koreanCount),
    exceedsThreshold: Dynamic = (count?: Dynamic, weight: Dynamic = 1): Dynamic =>
      count * weight * 2 > weightedCount;
  if (exceedsThreshold(items + cjkCount, 3))
    return items >= 2 && items * 12 >= items + cjkCount
      ? "ja"
      : items * 12 < items + cjkCount && koreanCount === 0
        ? "zh"
        : undefined;
  if (exceedsThreshold(koreanCount, 3)) return "ko";
  for (let [language, pattern] of languageScriptDetectors as Dynamic)
    if (exceedsThreshold(callback(pattern))) return language;
  if (!exceedsThreshold(callback(PdfLanguageScriptLatinPattern))) return;
  let latinScores: Dynamic = [
      ...scoreLatinLanguages(value.toLowerCase().match(/\p{L}+/gu) ?? []),
    ].sort(
      (left?: Dynamic, right?: Dynamic): Dynamic =>
        right[1] - left[1],
    ),
    [bestLanguage, secondBest]: Dynamic = [latinScores[0], latinScores[1]];
  return bestLanguage[1] >= 5 && bestLanguage[1] >= 2 * secondBest[1] ? bestLanguage[0] : undefined;
}
function scoreLatinLanguages(words?: Dynamic): Dynamic {
  return PdfLanguageItems.map(([language, commonWords]: Dynamic): Dynamic => {
    let values: Dynamic = new Set(commonWords.split(" "));
    return [
      language,
      words.reduce(
        (score?: Dynamic, word?: Dynamic): Dynamic =>
          score + (values.has(word) ? 1 : 0),
        0,
      ),
    ];
  });
}
function isLanguageTag(tag?: Dynamic): Dynamic {
  return typeof tag == "string" && PdfLanguageAZaZAZaZPattern.test(tag);
}
function inferPdfLanguage(
  text?: Dynamic,
  locale: Dynamic = (globalThis as Dynamic).navigator?.language,
): Dynamic {
  let value: Dynamic = detectTextLanguage(text);
  if (value !== undefined) return value;
  if (!isLanguageTag(locale)) return "und";
  let [localeLanguageCode, ...scriptSubtag]: Dynamic = locale.toLowerCase().split("-"),
    scriptMatch: Dynamic = scriptSubtag.find(
      (subtag?: Dynamic): Dynamic => /^[a-z]{4}$/.test(subtag),
    ),
    localeTag: Dynamic =
      localeLanguageCode +
      (scriptMatch === undefined
        ? ""
        : "-" + scriptMatch[0].toUpperCase() + scriptMatch.slice(1)),
    sampleText: Dynamic = text.slice(0, 2e5),
    length: Dynamic = (sampleText.match(/\p{L}/gu) ?? []).length;
  if (length < 10) return localeTag;
  for (let [scriptPattern, scriptCodes, languageCodes] of localeScriptRules as Dynamic) {
    let scriptLetterCount: Dynamic = (sampleText.match(scriptPattern) ?? []).filter(
      (character?: Dynamic): Dynamic =>
        letterPattern.test(character),
    ).length;
    if (scriptLetterCount * 2 <= length) continue;
    if (
      !(scriptMatch !== undefined
        ? scriptCodes.toLowerCase().split(" ").includes(scriptMatch)
        : languageCodes.split(" ").includes(localeLanguageCode)) ||
      (localeLanguageCode === "en" &&
        (sampleText.match(/[A-Za-z]/g) ?? []).length * 40 < scriptLetterCount * 39)
    )
      return "und";
    if (
      PdfLanguageItems.some(([languageCode]: Dynamic): Dynamic => languageCode === localeLanguageCode)
    ) {
      let words: Dynamic = sampleText.toLowerCase().match(/\p{L}+/gu) ?? [],
        scores: Dynamic = scoreLatinLanguages(words),
        languageScore: Dynamic = scores.find(
          ([languageCode]: Dynamic): Dynamic => languageCode === localeLanguageCode,
        )[1];
      if (
        scores.some(([, score]: Dynamic): Dynamic => score > languageScore) ||
        (words.length >= 30 && languageScore * 16 < words.length)
      )
        return "und";
    }
    return localeTag;
  }
  return "und";
}
export {
  detectTextLanguage,
  inferPdfLanguage,
  isLanguageTag,
  PdfLanguageAZaZAZaZPattern,
  PdfLanguageItems,
  PdfLanguagePattern,
  PdfLanguageScriptLatinPattern,
  scoreLatinLanguages,
};
export function installExportPdfLanguage(): () => void {
  return () => {
    PdfLanguageItems = [
      [
        "en",
        "the and of to in is for that with on are as be this by from at or an was it you your we our not have has will can",
      ],
      [
        "es",
        "de la el en y los las del que por con para una un es se no su al como m\xE1s lo sus este esta son",
      ],
      [
        "fr",
        "de la le les et des en du une un est pour que dans qui par sur au pas plus avec ce cette nous vous sont ne",
      ],
      [
        "de",
        "der die und das in den von zu mit ist f\xFCr auf dem des eine ein im nicht sich auch als an es wir sie werden bei oder",
      ],
      [
        "pt",
        "de da do em para com que os as uma um dos das n\xE3o por mais se na no ao como \xE9 s\xE3o seu sua",
      ],
      [
        "it",
        "di il la che in per del con le della un una dei \xE8 al non da sono alla pi\xF9 come gli delle nel questo",
      ],
      [
        "nl",
        "de het van een en in is op te voor met dat die zijn niet aan er om ook als bij door wordt deze dit wij",
      ],
    ];
    languageScriptDetectors = [
      ["he", /(?=\p{L})[\u0590-\u05ff]/gu],
      ["th", /(?=\p{L})[\u0e00-\u0e7f]/gu],
      ["el", /(?=\p{L})[\u0370-\u03ff]/gu],
    ];
    PdfLanguagePattern = /(?=\p{L})[\u3040-\u30ff\uff66-\uff9f]/gu;
    hanScriptPattern = /[\u3400-\u4dbf\u4e00-\u9fff]/gu;
    hangulScriptPattern = /(?=\p{L})[\uac00-\ud7a3\u1100-\u11ff]/gu;
    PdfLanguageScriptLatinPattern = /\p{Script=Latin}/gu;
    PdfLanguageAZaZAZaZPattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{1,8}){0,3}$/;
    localeScriptRules = [
      [
        /\p{Script=Latin}/gu,
        "Latn",
        "en es fr de pt it nl ca gl eu pl cs sk sl hu ro hr bs sq sv da nb nn no fi et lv lt is ga cy mt tr az uz tk id ms vi tl fil sw af zu xh yo ha so lb eo la",
      ],
      [/\p{Script=Cyrillic}/gu, "Cyrl", "ru uk be bg mk sr kk ky mn tg"],
      [/\p{Script=Arabic}/gu, "Arab", "ar fa ur ps ug sd ckb"],
      [/\p{Script=Devanagari}/gu, "Deva", "hi mr ne sa"],
      [/\p{Script=Bengali}/gu, "Beng", "bn as"],
      [/\p{Script=Gurmukhi}/gu, "Guru", "pa"],
      [/\p{Script=Gujarati}/gu, "Gujr", "gu"],
      [/\p{Script=Tamil}/gu, "Taml", "ta"],
      [/\p{Script=Telugu}/gu, "Telu", "te"],
      [/\p{Script=Kannada}/gu, "Knda", "kn"],
      [/\p{Script=Malayalam}/gu, "Mlym", "ml"],
      [/\p{Script=Sinhala}/gu, "Sinh", "si"],
      [/\p{Script=Thai}/gu, "Thai", "th"],
      [/\p{Script=Lao}/gu, "Laoo", "lo"],
      [/\p{Script=Khmer}/gu, "Khmr", "km"],
      [/\p{Script=Myanmar}/gu, "Mymr", "my"],
      [/\p{Script=Georgian}/gu, "Geor", "ka"],
      [/\p{Script=Armenian}/gu, "Armn", "hy"],
      [/\p{Script=Ethiopic}/gu, "Ethi", "am ti"],
      [/\p{Script=Hebrew}/gu, "Hebr", "he iw yi"],
      [/\p{Script=Greek}/gu, "Grek", "el"],
      [
        /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu,
        "Hani Hans Hant Jpan",
        "zh ja yue",
      ],
      [/\p{Script=Hangul}/gu, "Hang Kore", "ko"],
    ];
  };
}

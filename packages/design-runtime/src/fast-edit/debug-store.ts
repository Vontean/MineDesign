/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var FAST_EDIT_DEBUG_STORAGE_KEY: Dynamic;
var fastEditDebugCalls: Dynamic;
var fastEditDebugSequence: Dynamic;
var fastEditDebugListeners: Dynamic;
var notifyFastEditDebugListeners: Dynamic;
var fastEditDebugStore: Dynamic;
var recordFastEditNoCall: Dynamic;
var describeFastEditDebugCompletion: Dynamic;
var FAST_EDIT_MESSAGE_SECTION_PATTERN: Dynamic;
function isFastEditDebugEnabled(fallback: Dynamic = false): Dynamic {
  let storedValue: Dynamic = null;
  try {
    storedValue = localStorage.getItem(FAST_EDIT_DEBUG_STORAGE_KEY);
  } catch {}
  return storedValue === "1" ? true : storedValue === "0" ? false : fallback;
}
function instrumentSamplingClient(client?: Dynamic): Dynamic {
  return {
    ...client,
    call(input: Dynamic): Dynamic {
      let value: Dynamic = performance.now(),
        callback: Dynamic = (): Dynamic =>
          Math.round(performance.now() - value),
        record: Dynamic = fastEditDebugStore.add({
          at: Date.now(),
          tier: input.tier,
          messages: input.turns.map(
            (message?: Dynamic): Dynamic => ({
              role: message.role,
              content: message.content,
            }),
          ),
          reply: "",
          msFirst: null,
          ms: null,
        }),
        call: Dynamic = client.call({
          ...input,
          onText: (text?: Dynamic): Dynamic => {
            record.reply = text;
            record.msFirst === null &&
              ((record.msFirst = callback()), notifyFastEditDebugListeners());
            input.onText(text);
          },
        });
      call.promise.then(
        (result?: Dynamic): Dynamic => {
          record.reply = result.text;
          record.ms = callback();
          notifyFastEditDebugListeners();
        },
        (error?: Dynamic): Dynamic => {
          let errorDetails: Dynamic =
            typeof error == "object" && error !== null ? error : {};
          record.ms = callback();
          record.error = {
            code: String(errorDetails.code ?? "error"),
            message: String(errorDetails.message ?? ""),
          };
          notifyFastEditDebugListeners();
        },
      );
      return call;
    },
  };
}
function splitFastEditMessageSections(content?: Dynamic): Dynamic {
  let sections: Dynamic = [],
    lastHeading: Dynamic = "",
    emptyLines: Dynamic = 0;
  for (let value of content.split(`
`) as Dynamic) {
    if (value === "" && sections.length > 0) {
      emptyLines += 1;
      continue;
    }
    let heading: Dynamic =
      lastHeading === ""
        ? FAST_EDIT_MESSAGE_SECTION_PATTERN.exec(value)?.[0]
        : undefined;
    heading !== undefined || sections.length === 0
      ? sections.push({
          head: heading ?? "",
          text: value,
        })
      : (sections[sections.length - 1].text +=
          `
`.repeat(emptyLines + 1) + value);
    emptyLines = 0;
    lastHeading === ""
      ? (lastHeading = /^<<<(\S+) /.exec(value)?.[1] ?? "")
      : value === lastHeading + ">>>" && (lastHeading = "");
  }
  return sections;
}
function classifyFastEditDebugCall(call?: Dynamic): Dynamic {
  let sections: Dynamic = splitFastEditMessageSections(
      call.messages[call.messages.length - 1]?.content ?? "",
    ),
    getSection: Dynamic = (input?: Dynamic): Dynamic =>
      sections.find((section?: Dynamic): Dynamic => section.head === input)
        ?.text ?? "",
    pointedAt: Dynamic = getSection("[pointed at]").split(`
`)[0],
    source: Dynamic = pointedAt.includes("typed in the box")
      ? "composer"
      : pointedAt.includes("pinned on the canvas")
        ? "comment on the canvas"
        : (/: on (?:the drawing )?(#[\w-]+)/.exec(pointedAt)?.[1] ??
          /pinned on (#[\w-]+)/.exec(pointedAt)?.[1] ??
          "");
  return {
    road:
      source === ""
        ? "call"
        : source.startsWith("#")
          ? "comment on " + source
          : source,
    prompt: getSection("[prompt]")
      .split(
        `
`,
      )
      .slice(2, -1)
      .join(" "),
    later: sections.some(
      (input?: Dynamic): Dynamic =>
        input.head === "[log]" ||
        input.head === "NOTE FROM THE PAGE" ||
        input.head === "Your last reply was not applied",
    ),
    chars: call.messages.reduce(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        input + options.content.length,
      0,
    ),
  };
}
export {
  classifyFastEditDebugCall,
  describeFastEditDebugCompletion,
  FAST_EDIT_DEBUG_STORAGE_KEY,
  FAST_EDIT_MESSAGE_SECTION_PATTERN,
  fastEditDebugCalls,
  fastEditDebugListeners,
  fastEditDebugSequence,
  fastEditDebugStore,
  instrumentSamplingClient,
  isFastEditDebugEnabled,
  notifyFastEditDebugListeners,
  recordFastEditNoCall,
  splitFastEditMessageSections,
};
export function installFastEditDebugStore(): () => void {
  return () => {
    FAST_EDIT_DEBUG_STORAGE_KEY = "fast-edit-debug";
    fastEditDebugCalls = [];
    fastEditDebugSequence = 0;
    fastEditDebugListeners = new Set();
    notifyFastEditDebugListeners = (): Dynamic => {
      for (let value of [...fastEditDebugListeners] as Dynamic) value();
    };
    fastEditDebugStore = {
      all: (): Dynamic => fastEditDebugCalls,
      add(input: Dynamic): Dynamic {
        let state: Dynamic = {
          ...input,
          n: ++fastEditDebugSequence,
        };
        fastEditDebugCalls = [...fastEditDebugCalls, state].slice(-200);
        notifyFastEditDebugListeners();
        return state;
      },
      clear(): Dynamic {
        fastEditDebugCalls = [];
        notifyFastEditDebugListeners();
      },
      subscribe(input: Dynamic): Dynamic {
        fastEditDebugListeners.add(input);
        return (): Dynamic => {
          fastEditDebugListeners.delete(input);
        };
      },
      listeners: (): Dynamic => fastEditDebugListeners.size,
    };
    recordFastEditNoCall = (input?: Dynamic): Dynamic => {
      fastEditDebugStore.add({
        at: Date.now(),
        tier: "",
        messages: [],
        reply: "",
        msFirst: null,
        ms: input.ms,
        ended: {
          outcome: input.outcome,
          code: input.code,
          calls: input.calls,
        },
      });
    };
    describeFastEditDebugCompletion = (input?: Dynamic): Dynamic =>
      "ended: " +
      [
        input.ended?.outcome ?? "",
        input.ended?.code ?? "",
        String(input.ended?.calls ?? 0) + " calls",
        (input.ms ?? 0).toLocaleString("en-US") + " ms",
      ].join(" \xB7 ");
    FAST_EDIT_MESSAGE_SECTION_PATTERN =
      /^(?:\[[a-z][^\]]*\]|NOTE FROM THE PAGE|Your last reply was not applied)/;
  };
}

import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */

var LegacyStateReadFailure: Boot.LegacyFailureConstructor;
var LEGACY_STATE_AMBIGUOUS_RETRY_MS: number;
async function readLegacyStateFile(
  fetchFile: NonNullable<Boot.LegacyReadOptions["fetch"]>,
  path: string,
  read: Boot.LegacyReadOptions["read"],
  readPath: string = path,
): Promise<Boot.LegacyReadAnswer> {
  try {
    let value = await fetchFile(path);
    if (!value.ok) {
      return new LegacyStateReadFailure(
        path + ": HTTP " + String(value.status),
        "fetch",
        value.status === 404,
        true,
        value.status,
      );
    }
    let stateText = await value.text(),
      readResult: Boot.LegacyReadSuccess | string;
    try {
      readResult = read(stateText, readPath);
    } catch {
      return new LegacyStateReadFailure(path + ": unreadable", "read");
    }
    if (typeof readResult === "string") {
      return new LegacyStateReadFailure(path + ": " + readResult, "read");
    } else {
      return readResult;
    }
  } catch (value: unknown) {
    return new LegacyStateReadFailure(
      path + ": " + (value instanceof Error ? value.message : String(value)),
      "fetch",
      false,
      false,
    );
  }
}
async function readLegacyDesignSystemState(
  readOptions: Boot.LegacyReadOptions,
): Promise<Boot.LegacyInitialState> {
  let fetchFile = readOptions.fetch ?? ((url) => fetch(url)),
    statePaths =
      readOptions.stateFiles ??
      (readOptions.stateFile !== undefined ? [readOptions.stateFile] : []),
    answers = await Promise.all(
      statePaths.map((statePath) =>
        readLegacyStateFile(fetchFile, statePath, readOptions.read),
      ),
    ),
    answerKind = (answer: Boot.LegacyReadAnswer): Boot.LegacyAnswerKind =>
      !(answer instanceof LegacyStateReadFailure)
        ? "accepted"
        : answer.missing
          ? "missing"
          : answer.at === "read"
            ? "refused"
            : "unread",
    isAccessDenied = (
      state: Boot.LegacyReadAnswer,
    ): state is Boot.LegacyFailure =>
      state instanceof LegacyStateReadFailure &&
      (state.status === 401 || state.status === 403);
  if (
    readOptions.mayWrite !== undefined &&
    answers.some(isAccessDenied) &&
    answers.some(
      (answer): boolean => !(answer instanceof LegacyStateReadFailure),
    )
  ) {
    let value =
        readOptions.wait ??
        ((waitMs) => new Promise((resolve) => void setTimeout(resolve, waitMs))),
      waitResult = await Promise.resolve()
        .then(() => readOptions.mayWrite!())
        .catch((): void => {
          return;
        });
    if (waitResult === true) {
      for (let refusedWaitMs of readOptions.refusedWaits ?? []) {
        if (!answers.some(isAccessDenied)) {
          break;
        }
        await value(refusedWaitMs);
        await Promise.all(
          answers.map(async (answer, stateIndex): Promise<void> => {
            if (isAccessDenied(answer)) {
              answers[stateIndex] = await readLegacyStateFile(
                fetchFile,
                statePaths[stateIndex],
                readOptions.read,
              );
            }
          }),
        );
      }
    } else if (waitResult === false) {
      answers.forEach((state, stateIndex): void => {
        if (isAccessDenied(state)) {
          answers[stateIndex] = new LegacyStateReadFailure(
            state.fail,
            "fetch",
            true,
            true,
            state.status,
          );
        }
      });
    }
  }
  if (
    statePaths.length > 1 &&
    answers.some((answer): boolean => answerKind(answer) === "unread")
  ) {
    await (
      readOptions.wait ??
      ((waitMs) => new Promise((resolve) => void setTimeout(resolve, waitMs)))
    )(LEGACY_STATE_AMBIGUOUS_RETRY_MS);
    await Promise.all(
      answers.map(async (answer, stateIndex): Promise<void> => {
        if (answerKind(answer) === "unread") {
          answers[stateIndex] = await readLegacyStateFile(
            fetchFile,
            statePaths[stateIndex],
            readOptions.read,
          );
        }
      }),
    );
  }
  let stateFileAnswers = Object.fromEntries(
      statePaths.map((statePath, stateIndex) => [
        statePath,
        answerKind(answers[stateIndex]),
      ]),
    ),
    acceptedIndex = answers.findIndex(
      (answer): boolean => !(answer instanceof LegacyStateReadFailure),
    ),
    hasUnread = answers.some(
      (answer) =>
        answer instanceof LegacyStateReadFailure &&
        answerKind(answer) === "unread",
    ),
    accepted =
      acceptedIndex >= 0 && !hasUnread
        ? (answers[acceptedIndex] as Boot.LegacyReadSuccess)
        : undefined,
    failures = answers.filter(
      (answer): answer is Boot.LegacyFailure =>
        answer instanceof LegacyStateReadFailure,
    ),
    allMissing =
      failures.length === answers.length &&
      failures.every((failureEntry) => failureEntry.missing);
  readOptions.onOwn?.(
    accepted !== undefined
      ? accepted.envelope
      : allMissing
        ? "missing"
        : "unreadable",
    stateFileAnswers,
  );
  if (accepted !== undefined) {
    return {
      state: accepted.envelope,
      origin: "instance",
      note: accepted.note,
      stateFileAt: statePaths[acceptedIndex],
      stateFileAnswers: stateFileAnswers,
    };
  }
  let failure =
      failures.find((failureEntry): boolean => !failureEntry.missing) ??
      failures[0] ??
      new LegacyStateReadFailure("no state file named", "fetch", true),
    demo = await readLegacyStateFile(
      fetchFile,
      readOptions.demoFile,
      readOptions.read,
      "demo",
    ),
    stateFileFound: boolean | undefined | boolean =
      failures.some((failureEntry) => failureEntry.answered && !failureEntry.missing) ||
      acceptedIndex >= 0
        ? true
        : failures.some((failureEntry): boolean => !failureEntry.answered)
          ? undefined
          : false;
  if (!(demo instanceof LegacyStateReadFailure)) {
    return {
      state: demo.envelope,
      origin: "demo",
      error: failure.fail,
      stateFileFound: stateFileFound,
      errorAt: failure.at,
      note: demo.note,
      stateFileAnswers: stateFileAnswers,
    };
  }
  let errorAt = failure.missing ? demo.at : failure.at;
  return {
    state: {},
    origin: "failed",
    error: failure.fail + "; " + demo.fail,
    stateFileFound: stateFileFound,
    errorAt: errorAt,
    stateFileAnswers: stateFileAnswers,
  };
}
export {
  LEGACY_STATE_AMBIGUOUS_RETRY_MS,
  LegacyStateReadFailure,
  readLegacyDesignSystemState,
  readLegacyStateFile,
};
export function installFilesLegacyStateReader(): () => void {
  return () => {
    LegacyStateReadFailure = class LegacyStateReadFailure {
      fail: string;
      at: "fetch" | "read";
      missing: boolean;
      answered: boolean;
      status: number | undefined;
      constructor(
        failureMessage: string,
        failureLocation: Boot.LegacyFailure["at"],
        isMissing: boolean = false,
        isAnswered: boolean = true,
        statusCode?: number,
      ) {
        this.fail = failureMessage;
        this.at = failureLocation;
        this.missing = isMissing;
        this.answered = isAnswered;
        this.status = statusCode;
      }
    };
    LEGACY_STATE_AMBIGUOUS_RETRY_MS = 700;
  };
}

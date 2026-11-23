import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { colorCssForPicker } from "./colors";
import { commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { EditableName, showEditorNotification } from "./editable-name";
import { copyTextToClipboard, RemoveRowButton, RowContextMenu, useRowContextMenu } from "./row-context-menu";
import { TokenTableSection } from "./section-headers";
import { UsageNoteEditor } from "./usage-notes";
import { isSafeBoxShadow } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { TooltipWrapper } from "../ui/color/gradient-stops";
import { TextLink } from "../ui/links";
import { CdsRoot } from "../ui/overlays";
import { PropertyPopover, PropertyPopoverPanel, PropertyPopoverTrigger, RemovePropertyButton, ShadowPropertyEditor } from "../ui/property-popover-controls";

var stopFileDropEvent: (event: React.DragEvent<HTMLElement>) => void;
var BLOCK_FILE_DROP_HANDLERS: Pick<
  React.HTMLAttributes<HTMLElement>,
  "onDragEnter" | "onDragOver" | "onDragLeave" | "onDrop"
>;
var reactShadowEditors: typeof import("react");
var reactDomShadowEditors: typeof import("react-dom");
var jsxShadowEditors: typeof import("react/jsx-runtime");
var safeShadowPreviewStyle: (shadow: string) => React.CSSProperties;
var joinBoxShadowLayers: (layers: string[]) => string;
var DEFAULT_BOX_SHADOW: string;
var DEFAULT_BOX_SHADOW_VALUES: Token.SingleBoxShadow;
function parseSingleBoxShadow(shadow: string): Token.SingleBoxShadow | null {
  let value = shadow.trim();
  if (
    value === "" ||
    splitBoxShadowLayers(value).length !== 1 ||
    /\binset\b|var\(|color-mix\(|\bcolor\(/i.test(value)
  ) {
    return null;
  }
  let shadowValue: RegExp =
      /((?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)|#[0-9a-f]{3,8}|\b[a-z]+\b)/i,
    shadowLayers =
      value.match(
        /(?:(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\))|\S+/gi,
      ) ?? [],
    items: number[] = [],
    shadowParsed: string | null = null;
  for (let shadowColor of shadowLayers) {
    let shadowMatch = /^(-?(?:\d+|\d*\.\d+))(px)?$/.exec(shadowColor);
    if (shadowMatch !== null && (shadowMatch[2] === "px" || shadowMatch[1] === "0")) {
      items.push(Number(shadowMatch[1]));
    } else if (shadowParsed === null && shadowValue.test(shadowColor)) {
      shadowParsed = shadowColor;
    } else {
      return null;
    }
  }
  if (items.length < 2 || items.length > 4 || shadowParsed === null) {
    return null;
  }
  return {
    x: items[0] ?? 0,
    y: items[1] ?? 0,
    blur: items[2] ?? 0,
    spread: items[3] ?? 0,
    color: shadowParsed,
  };
}
function serializeSingleBoxShadow(shadow: Token.SingleBoxShadow): string {
  let callback = (shadowInput: number): string =>
    shadowInput === 0 ? "0" : String(shadowInput) + "px";
  return [
    callback(shadow.x),
    callback(shadow.y),
    callback(shadow.blur),
    ...(shadow.spread !== undefined && shadow.spread !== 0
      ? [callback(shadow.spread)]
      : []),
    shadow.color,
  ].join(" ");
}
function boxShadowSummary(shadow: string): Token.ShadowSummary {
  let value = shadow.trim();
  if (value === "" || value === "none") {
    return {
      text: "None",
      color: null,
    };
  }
  let shadowValueA = parseSingleBoxShadow(value);
  if (shadowValueA !== null) {
    return {
      text:
        String(shadowValueA.x) +
        ", " +
        String(shadowValueA.y) +
        " · " +
        String(shadowValueA.blur) +
        "px" +
        (shadowValueA.spread !== undefined && shadowValueA.spread !== 0
          ? " · " + String(shadowValueA.spread) + "px"
          : ""),
      color: shadowValueA.color,
    };
  }
  let shadowLayersA = splitBoxShadowLayers(value),
    shadowParsedA = parseSingleBoxShadow(shadowLayersA[0] ?? "");
  return {
    text: shadowLayersA.length > 1 ? String(shadowLayersA.length) + " layers" : value,
    color: shadowParsedA?.color ?? null,
  };
}
function splitBoxShadowLayers(shadow: string): string[] {
  let value = shadow.trim();
  if (value === "" || value.toLowerCase() === "none") {
    return [];
  }
  let items = [],
    index: number = 0,
    shadowValueB = 0;
  for (let shadowValueC: number = 0; shadowValueC < value.length; shadowValueC++) {
    let shadowValueD = value[shadowValueC];
    if (shadowValueD === "(") {
      index++;
    } else if (shadowValueD === ")") {
      index = Math.max(0, index - 1);
    } else if (shadowValueD === "," && index === 0) {
      items.push(value.slice(shadowValueB, shadowValueC).trim());
      shadowValueB = shadowValueC + 1;
    }
  }
  items.push(value.slice(shadowValueB).trim());
  return items.filter(
    (shadowInputA) => shadowInputA !== "" && shadowInputA.toLowerCase() !== "none",
  );
}
function ShadowValueEditor({
  label: label,
  value: shadowValueE,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  testid: testid,
  clear: clear,
  anchorKey: anchorKey,
  editsAreUndoSteps: editsAreUndoSteps,
}: Token.ShadowValueEditorProps): React.ReactElement {
  useUiLocale();
  let shadowValueF = splitBoxShadowLayers(shadowValueE),
    shadowLayersB = shadowValueF.length === 0 ? [""] : shadowValueF,
    shadowParsedB: boolean = shadowLayersB.length <= 1,
    ref = reactShadowEditors.useRef(shadowValueE);
  ref.current = shadowValueE;
  let callback = () => {
      let shadowValueG = splitBoxShadowLayers(ref.current);
      if (shadowValueG.length === 0) {
        return [""];
      } else {
        return shadowValueG;
      }
    },
    shadowHandler = (shadowInputB: number, shadowOption: string) => {
      let shadowValueH = callback();
      if (shadowInputB < shadowValueH.length) {
        return joinBoxShadowLayers(
          shadowValueH.map((shadowInputC, shadowOptionA) =>
            shadowOptionA === shadowInputB ? shadowOption : shadowInputC,
          ),
        );
      } else {
        return null;
      }
    },
    shadowHandlerA = (shadowInputD: number, shadowOptionB: string): void => {
      let shadowValueI = shadowHandler(shadowInputD, shadowOptionB);
      if (shadowValueI !== null) {
        ref.current = shadowValueI;
        onChange(shadowValueI);
      }
    },
    [shadowColorA, shadowMatchA] = reactShadowEditors.useState(false),
    [shadowIndex, shadowState] = reactShadowEditors.useState<number | null>(null);
  reactShadowEditors.useEffect((): void => {
    if (!shadowColorA) {
      shadowState(null);
    }
  }, [shadowColorA]);
  let shadowRef = reactShadowEditors.useRef(false),
    shadowRefA = reactShadowEditors.useRef(false),
    shadowRefB = reactShadowEditors.useRef<HTMLSpanElement | null>(null),
    shadowRefC = reactShadowEditors.useRef<HTMLDivElement | null>(null),
    shadowHandlerB = (): void => {
      let activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        activeElement.tagName === "INPUT"
      ) {
        reactDomShadowEditors.flushSync(() => activeElement.blur());
      }
    },
    shadowHandlerC = (shadowInputE: number): void => {
      shadowHandlerB();
      let shadowValueJ = joinBoxShadowLayers(
        callback().filter((shadowInputF, shadowOptionC): boolean => shadowOptionC !== shadowInputE),
      );
      ref.current = shadowValueJ;
      onChange(shadowValueJ);
      shadowState(null);
    },
    shadowHandlerD = (shadowInputG: React.MouseEvent<HTMLButtonElement>): void => {
      shadowHandlerB();
      shadowRefA.current = shadowInputG.detail === 0;
      let shadowValueK = callback().filter(
          (shadowInputH): boolean => shadowInputH.trim() !== "",
        ),
        shadowValueL = joinBoxShadowLayers([...shadowValueK, DEFAULT_BOX_SHADOW]);
      ref.current = shadowValueL;
      onChange(shadowValueL);
      shadowState(shadowValueK.length);
    },
    shadowHandlerE = () =>
      shadowRefC.current?.closest('[data-kit="effect-editor"]') ?? shadowRefC.current,
    shadowHandlerF = (): "bottom" | "right" =>
      typeof window !== "undefined" && window.innerWidth < 720
        ? "bottom"
        : "right",
    shadowValueM =
      shadowValueE.trim() === ""
        ? {
            text: "none",
            color: null,
          }
        : boxShadowSummary(shadowValueE),
    shadowHandlerG = (shadowInputI: string) =>
      /^#|^rgba?\(/i.test(shadowInputI)
        ? shadowInputI
        : (colorCssForPicker(shadowInputI) ?? shadowInputI),
    shadowValueN = (
      <Button
        variant={"ghost"}
        size={"sm"}
        iconOnly={true}
        icon={"Add"}
        aria-label={uiMessage("design-system.shadows.addALayer")}
        tooltip={uiMessage("design-system.shadows.addLayer")}
        className={"ml-auto"}
        onClick={shadowHandlerD}
        data-testid={testid + "-add-layer"}
      />
    ),
    shadowHandlerH = (shadowInputJ: React.ReactNode, shadowOptionD: boolean) => (
      <span className={"flex w-full items-center gap-1"}>
        {[<span className={"min-w-0 truncate"}>{shadowInputJ}</span>, shadowOptionD ? shadowValueN : null]}
      </span>
    ),
    shadowValueO =
      clear !== undefined && shadowValueE.trim() !== "" ? (
        <div className={"px-md pb-sm"}>
          <TextLink
            className={"text-footnote"}
            icon={"ArrowCounterClockwise"}
            iconPosition={"start"}
            onClick={(): void => {
              clear.run();
              shadowMatchA(false);
            }}
            data-testid={testid + "-clear"}
          >
            {clear.label}
          </TextLink>
        </div>
      ) : null,
    shadowHandlerI = (
      shadowInputK: number,
      shadowOptionE: React.ReactNode,
      shadowValueP: boolean,
      shadowValueQ: () => void,
    ) => {
      let shadowValueR = shadowLayersB[shadowInputK] ?? "",
        shadowValueS =
          shadowValueR.trim() === ""
            ? DEFAULT_BOX_SHADOW_VALUES
            : parseSingleBoxShadow(shadowValueR),
        shadowValueT = shadowValueS !== null ? shadowHandlerG(shadowValueS.color) : "",
        shadowValueU =
          shadowValueS !== null
            ? {
                ...shadowValueS,
                color: shadowValueT,
              }
            : null,
        shadowHandlerJ = (shadowInputL: Token.SingleBoxShadow) =>
          shadowValueS !== null && shadowInputL.color === shadowValueT
            ? {
                ...shadowInputL,
                color: shadowValueS.color,
              }
            : shadowInputL;
      if (shadowValueU !== null) {
        return (
          <ShadowPropertyEditor
            title={shadowHandlerH(shadowOptionE, shadowValueP)}
            value={shadowValueU}
            spread={true}
            editsAreUndoSteps={editsAreUndoSteps}
            onChange={(shadowInputM: Token.SingleBoxShadow) =>
              shadowHandlerA(shadowInputK, serializeSingleBoxShadow(shadowHandlerJ(shadowInputM)))
            }
            {...(onLive !== undefined && onLiveEnd !== undefined
              ? {
                  onLive: (shadowInputN: Token.SingleBoxShadow): void => {
                    let shadowValueV = shadowHandler(
                      shadowInputK,
                      serializeSingleBoxShadow(shadowHandlerJ(shadowInputN)),
                    );
                    if (shadowValueV !== null) {
                      onLive(shadowValueV);
                    }
                  },
                  onLiveEnd: onLiveEnd,
                }
              : {})}
            onClose={shadowValueQ}
          />
        );
      } else {
        return (
          <PropertyPopoverPanel
            title={shadowHandlerH(shadowOptionE, shadowValueP)}
            onClose={shadowValueQ}
            labelWidth={"0px"}
          >
            <p
              className={"px-md pb-sm text-footnote text-muted"}
              data-testid={testid + "-cssnote"}
            >
              {[uiMessage("design-system.shadows.writtenAsCSS"), <span
                  className={"block truncate font-mono text-caption"}
                  title={shadowValueR}
                >
                  {shadowValueR}
                </span>, uiMessage("design-system.shadows.askTheAgentToChange")]}
            </p>
          </PropertyPopoverPanel>
        );
      }
    },
    shadowValueW = shadowIndex !== null && shadowIndex < shadowLayersB.length ? shadowIndex : null;
  return (
    <span
      className={"relative flex min-w-0 flex-1"}
      ref={shadowRefB}
      data-testid={testid}
    >
      <PropertyPopover
        open={shadowColorA}
        editsAreUndoSteps={editsAreUndoSteps}
        onOpenChange={(shadowInputO: boolean): void => {
          if (!shadowInputO) {
            shadowHandlerB();
          }
          shadowMatchA(shadowInputO);
        }}
        trigger={
          <PropertyPopoverTrigger
            label={label}
            color={shadowValueM.color !== null ? shadowHandlerG(shadowValueM.color) : null}
            text={shadowValueM.text}
            onClick={(shadowInputP: React.MouseEvent<HTMLButtonElement>): void => {
              shadowRef.current = shadowInputP.detail === 0;
            }}
          />
        }
        anchor={() => shadowRefB.current}
        side={"bottom"}
        focusOnOpen={shadowRef.current}
        className={shadowParsedB ? undefined : "w-[17rem]"}
      >
        <CdsRoot density={"compact"} className={"contents"}>
          <div
            {...(anchorKey !== undefined
              ? {
                  role: "group",
                  get "aria-label"() { return (uiMessage("design-system.shadows.shadow")) + (label); },
                  ...commentTargetProps(
                    "editor",
                    "shadow/" + anchorKey,
                  ),
                }
              : {
                  className: "contents",
                })}
          >
            {!shadowColorA ? (null) : (shadowParsedB ? (<jsxShadowEditors.Fragment>
                {[shadowHandlerI(0, "Shadow", true, (): void => {
                    shadowHandlerB();
                    shadowMatchA(false);
                  }), shadowValueO]}
              </jsxShadowEditors.Fragment>) : (<PropertyPopoverPanel
                title={shadowHandlerH("Shadow", true)}
                onClose={(): void => {
                  shadowHandlerB();
                  shadowMatchA(false);
                }}
                labelWidth={"0px"}
              >
                {[<div
                    ref={shadowRefC}
                    className={"flex flex-col gap-1 px-md pb-sm"}
                    data-step={"2"}
                    data-testid={testid + "-layers"}
                  >
                    {shadowLayersB.map((shadowInputQ, shadowOptionF) => {
                      let shadowValueX = boxShadowSummary(shadowInputQ);
                      return (() => {
                        const _Element = "span";
                        const _elementProps = {
                          className: "flex min-w-0 items-center gap-1",
                          children: [
                            <span
                              className={"relative flex min-w-0 flex-1"}
                              data-testid={
                                testid + "-layer-" + String(shadowOptionF)
                              }
                            >
                              <PropertyPopover
                                open={shadowValueW === shadowOptionF}
                                editsAreUndoSteps={editsAreUndoSteps}
                                onOpenChange={(shadowInputR: boolean): void => {
                                  shadowHandlerB();
                                  shadowState(shadowInputR ? shadowOptionF : null);
                                }}
                                trigger={
                                  <PropertyPopoverTrigger
                                    label={
                                      ((label) + (" · layer ")) + (String(shadowOptionF + 1))
                                    }
                                    color={
                                      shadowValueX.color !== null
                                        ? shadowHandlerG(shadowValueX.color)
                                        : null
                                    }
                                    text={shadowValueX.text}
                                    onClick={(
                                      shadowInputS: React.MouseEvent<HTMLButtonElement>,
                                    ): void => {
                                      shadowRefA.current = shadowInputS.detail === 0;
                                    }}
                                  />
                                }
                                anchor={shadowHandlerE}
                                side={shadowHandlerF()}
                                focusOnOpen={shadowRefA.current}
                              >
                                <CdsRoot
                                  density={"compact"}
                                  className={"contents"}
                                >
                                  <div
                                    {...(anchorKey !== undefined &&
                                    shadowValueW === shadowOptionF
                                      ? {
                                          role: "group",
                                          get "aria-label"() { return uiMessage("design-system.shadows.layer", { subject: String(label), detail: String(String(shadowOptionF + 1)) }); },
                                          ...commentTargetProps(
                                            "editor",
                                            "shadow/" +
                                              anchorKey +
                                              "/layer-" +
                                              String(shadowOptionF + 1),
                                          ),
                                        }
                                      : {
                                          className: "contents",
                                        })}
                                  >
                                    {shadowValueW === shadowOptionF ? (shadowHandlerI(
                                          shadowOptionF,
                                          uiMessage("design-system.shadows.layer2") + String(shadowOptionF + 1),
                                          false,
                                          (): void => {
                                            shadowHandlerB();
                                            shadowState(null);
                                          },
                                        )) : (null)}
                                  </div>
                                </CdsRoot>
                              </PropertyPopover>
                            </span>,
                            <RemovePropertyButton
                              label={(uiMessage("design-system.shadows.layer3")) + (String(shadowOptionF + 1))}
                              disabled={shadowLayersB.length === 1}
                              onClick={() => shadowHandlerC(shadowOptionF)}
                            />,
                          ],
                        };
                        const _elementKey = shadowOptionF;
                        return (
                          <_Element key={_elementKey} {..._elementProps} />
                        );
                      })();
                    })}
                  </div>, shadowValueO]}
              </PropertyPopoverPanel>))}
          </div>
        </CdsRoot>
      </PropertyPopover>
    </span>
  );
}
function ShadowValueCell({
  t: t,
  theme: theme,
  edit: edit,
  testid: testid,
}: Token.ShadowValueCellProps): React.ReactElement {
  useUiLocale();
  let value = t.value[theme.id] ?? "";
  if (edit === undefined) {
    let shadowValueY = boxShadowSummary(value);
    return (
      <TooltipWrapper tip={uiMessage("design-system.shadows.copy2", { subject: String(value) })}>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={
            "ds-shbrief min-w-0 justify-start font-mono text-footnote text-muted"
          }
          icon={
            <span
              className={
                "ds-shf-swatch block h-3 w-4 shrink-0 rounded-sm bg-surface-1"
              }
              style={safeShadowPreviewStyle(value)}
              aria-hidden={"true"}
            />
          }
          aria-label={uiMessage("design-system.shadows.copy", { subject: String(t.name), detail: String(theme.name), suffix: String(value) })}
          data-testid={testid}
          onClick={() =>
            void copyTextToClipboard(value).then(
              (shadowInputT: boolean) =>
                showEditorNotification(
                  shadowInputT
                    ? "Copied " + t.name + " (" + theme.name + ")"
                    : "Couldn’t copy",
                ),
            )
          }
        >
          <span className={"min-w-0 truncate"}>{shadowValueY.text}</span>
        </Button>
      </TooltipWrapper>
    );
  }
  return (
    <ShadowValueEditor
      label={((t.name) + (" · ")) + (theme.name)}
      anchorKey={t.name + ":" + theme.id}
      value={value}
      editsAreUndoSteps={true}
      onChange={(shadowInputU: string) => edit.value(t.name, theme.id, shadowInputU)}
      {...(edit.live !== undefined && edit.done !== undefined
        ? {
            onLive: (shadowInputV: string) => edit.live?.(t.name, theme.id, shadowInputV),
            onLiveEnd: () => edit.done?.(),
          }
        : {})}
      testid={testid}
    />
  );
}
function ShadowTokenRow({
  t: t,
  themes: themes,
  grounds: grounds,
  preview: preview,
  taken: taken,
  edit: edit,
}: Token.ShadowTokenRowProps): React.ReactElement {
  useUiLocale();
  let value = useRowContextMenu(
      edit !== undefined || (t.value[preview.id] ?? "") !== "",
    ),
    shadowValueZ =
      edit === undefined
        ? undefined
        : (shadowInputW: string) => edit.rename(t.name, shadowInputW),
    callback = () =>
      document
        .querySelector<HTMLElement>(
          '[data-testid="ds-shadow-name-' + t.name + '"]',
        )
        ?.click();
  return (
    <div
      className={"ds-srow ds-tokrow ds-crow group/row"}
      role={"row"}
      style={{
        ["--ds-themes"]: String(themes.length),
      } as import("../contracts/controls").DesignStyle}
      data-testid={"ds-shadow-" + t.name}
      {...commentTargetProps("token", t.name)}
      {...value.rowProps}
    >
      {[<span
          className={"ds-cname ds-shname flex min-w-0 items-start font-mono"}
          role={"rowheader"}
          data-testid={"ds-shadow-line-" + t.name}
        >
          <EditableName
            name={t.name}
            taken={taken}
            commit={shadowValueZ}
            data-testid={"ds-shadow-name-" + t.name}
          />
        </span>, <span className={"ds-ccells contents"}>
          {themes.map((shadowInputX) =>
            (() => {
              const ShadowNameTag = "span";
              const shadowNameProps = {
                className:
                  "ds-ccell ds-shcell flex min-w-0 flex-col items-stretch gap-sm",
                role: "cell",
                "data-theme": themes.length > 1 ? shadowInputX.name : undefined,
                children: [
                  <span
                    className={"ds-shadow-well"}
                    style={
                      grounds?.[shadowInputX.id] !== undefined
                        ? {
                            background: grounds[shadowInputX.id].well,
                          }
                        : undefined
                    }
                    data-testid={"ds-shadow-stage-" + t.name + "-" + shadowInputX.id}
                  >
                    <span
                      className={"ds-shadow-surface"}
                      style={{
                        ...safeShadowPreviewStyle(t.value[shadowInputX.id] ?? ""),
                        ...(grounds?.[shadowInputX.id] !== undefined
                          ? {
                              background: grounds[shadowInputX.id].card,
                            }
                          : {}),
                      }}
                      data-testid={
                        "ds-shadow-surface-" +
                        t.name +
                        (shadowInputX.id === preview.id ? "" : "-" + shadowInputX.id)
                      }
                    />
                  </span>,
                  <ShadowValueCell
                    t={t}
                    theme={shadowInputX}
                    edit={edit}
                    testid={"ds-shadow-summary-" + t.name + "-" + shadowInputX.id}
                  />,
                ],
              };
              const shadowNameKey = shadowInputX.id;
              return <ShadowNameTag key={shadowNameKey} {...shadowNameProps} />;
            })(),
          )}
        </span>, <span
          className={
            "ds-cacts ds-cgutter relative flex items-start justify-center"
          }
          role={"cell"}
          {...UNCOMMENTABLE_PROPS}
        >
          {[<UsageNoteEditor
              value={t.usage ?? ""}
              label={t.name}
              anchorKey={"shadow/" + t.name}
              onChange={
                edit === undefined
                  ? undefined
                  : (shadowInputY: string) => edit.usage(t.name, shadowInputY)
              }
              onDone={edit?.done}
              data-testid={"ds-shadow-usage-" + t.name}
            />, edit !== undefined ? (
              <RemoveRowButton
                label={uiMessage("design-system.shadows.remove", { subject: String(t.name) })}
                onRemove={() => edit.remove(t.name)}
                data-testid={"ds-shadow-remove-" + t.name}
              />
            ) : null]}
        </span>, <RowContextMenu
          title={t.name}
          at={value.at}
          anchor={value.anchor}
          onClose={value.close}
          testid={"ds-shadow-menu-" + t.name}
          actions={{
            ...(edit !== undefined
              ? {
                  rename: callback,
                  remove: () => edit.remove(t.name),
                  get removeLabel() { return uiMessage("design-system.shadows.remove", { subject: String(t.name) }); },
                }
              : {}),
            copy: t.value[preview.id] ?? "",
          }}
        />]}
    </div>
  );
}
function ShadowsSection({
  shadows: shadows,
  themes: themes,
  grounds: grounds,
  previewThemeId: previewThemeId,
  edit: edit,
  head: head,
}: Token.ShadowsSectionProps): React.ReactElement | null {
  useUiLocale();
  if (shadows.tokens.length === 0) {
    return null;
  }
  let values = new Set(shadows.tokens.map((shadowInputZ) => shadowInputZ.name)),
    value = themes.find((theme): boolean => theme.id === previewThemeId) ??
      themes[0] ?? {
        id: "",
        name: "",
      };
  return (
    <TokenTableSection
      className={"ds-scale ds-scale-shadow"}
      name={null}
      data-testid={"ds-shadows"}
      aria-label={head?.title ?? (uiMessage("design-system.shadows.shadows"))}
    >
      <div className={"ds-cscroll overflow-x-auto"}>
        <div
          className={"ds-ctable ds-shtable"}
          role={"table"}
          aria-label={uiMessage("design-system.shadows.shadows")}
          style={{
            ["--ds-themes"]: String(themes.length),
          } as import("../contracts/controls").DesignStyle}
          data-edit={edit !== undefined ? "" : undefined}
        >
          {[<div
              className={"ds-crow ds-chead text-caption text-muted"}
              role={"row"}
              {...UNCOMMENTABLE_PROPS}
            >
              {[<span role={"columnheader"}>{uiMessage("design-system.shadows.name")}</span>, themes.map((theme) =>
                  (() => {
                    const ShadowThemeTag = "span";
                    const shadowValue_ = {
                      role: "columnheader",
                      className: "truncate",
                      title: theme.name,
                      children: theme.name,
                    };
                    const themeKey = theme.id;
                    return (
                      <ShadowThemeTag key={themeKey} {...shadowValue_} />
                    );
                  })(),
                ), <span
                  role={"columnheader"}
                  className={"ds-cgutter"}
                  aria-hidden={"true"}
                />]}
            </div>, shadows.tokens.map((token) =>
              (() => {
                const ShadowTokenComponent = ShadowTokenRow;
                const shadowValueb = {
                  t: token,
                  themes: themes,
                  grounds: grounds,
                  preview: value,
                  taken: values,
                  edit: edit,
                };
                const shadowValuec = token.name;
                return <ShadowTokenComponent key={shadowValuec} {...shadowValueb} />;
              })(),
            )]}
        </div>
      </div>
    </TokenTableSection>
  );
}
export {
  BLOCK_FILE_DROP_HANDLERS,
  boxShadowSummary,
  DEFAULT_BOX_SHADOW,
  DEFAULT_BOX_SHADOW_VALUES,
  joinBoxShadowLayers,
  jsxShadowEditors,
  parseSingleBoxShadow,
  reactDomShadowEditors,
  reactShadowEditors,
  safeShadowPreviewStyle,
  serializeSingleBoxShadow,
  ShadowsSection,
  ShadowTokenRow,
  ShadowValueCell,
  ShadowValueEditor,
  splitBoxShadowLayers,
  stopFileDropEvent,
};
export function installEditorShadows(): () => void {
  return () => {
    stopFileDropEvent = (event: React.DragEvent<HTMLElement>): void => {
      if (!event.dataTransfer.types.includes("Files")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };
    BLOCK_FILE_DROP_HANDLERS = {
      onDragEnter: stopFileDropEvent,
      onDragOver: (event): void => {
        if (!event.dataTransfer.types.includes("Files")) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "none";
      },
      onDragLeave: stopFileDropEvent,
      onDrop: stopFileDropEvent,
    };
    reactShadowEditors = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomShadowEditors = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    jsxShadowEditors = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    safeShadowPreviewStyle = (shadow: string) =>
      isSafeBoxShadow(shadow)
        ? {
            boxShadow: shadow,
          }
        : {};
    joinBoxShadowLayers = (layers: string[]) =>
      layers
        .map((layer) => layer.trim())
        .filter((shadowInput_): boolean => shadowInput_ !== "")
        .join(", ");
    DEFAULT_BOX_SHADOW = "0 1px 3px rgba(0, 0, 0, 0.16)";
    DEFAULT_BOX_SHADOW_VALUES = {
      x: 0,
      y: 1,
      blur: 3,
      spread: 0,
      color: "rgba(0, 0, 0, 0.16)",
    };
  };
}

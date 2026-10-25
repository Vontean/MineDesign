/**
 * 用运行时自己的编译器校验 deck 源文件（slides_check 工具，docs/design/slides §7.2）：
 *   - deck.json 能被 normalizeDeckMetadata 接受，order / sections / cover 指向存在的页
 *   - 每页 compileSlideHtml 无 error、无 unsupported（被丢弃的写法）、无 cellRemovals；与编辑器一样不收相对路径的图片，
 *     也不收页面文件里的 <title>、<link>、<style>
 *   - 引用的 /_blob/<id> 在 deck 的 assets/ 里
 *   - 序列化往返稳定：serialize(compile(src)) 再编译、再序列化结果不变
 * 问题与提示是给智能体看的，不进界面文案目录。
 */
// i18n-ignore-file: 给模型的校验结果
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompileDiagnostic, CompileResult, SlidesRuntime } from './compiler-contract.ts';
import { deckReferenceProblems, type DeckMetadata } from './deck-metadata.ts';
import { ASSETS_DIR } from './deck-store.ts';

export interface SlideReport {
  id: string;
  /** 会让这一页编译失败或丢内容的问题。 */
  problems: string[];
  /** 编译器警告（不影响内容），verbose 时还包括排版建议。 */
  notes: string[];
  /** serialize(compile(src)) 再走一遍结果不同。 */
  roundTripDrift: boolean;
}

export interface CheckReport {
  title: string;
  /** deck.json 本身的问题。 */
  deckProblems: string[];
  /** slides/ 里有、但不在 order 里的文件。 */
  orphans: string[];
  slides: SlideReport[];
}

export function problemCount(report: CheckReport): number {
  return report.deckProblems.length + report.slides.reduce((n, s) => n + s.problems.length, 0);
}

/** 编译器对图片地址的建议指向它自己的构建脚本（「放在 deck 旁边、写相对路径」），在这里不适用。 */
const IMAGE_REF_ADVICE = /(?: — URLs are not fetched| — a relative path under the deck's folder| is a file reference with no data).*$/;
const IMPORT_ADVICE = ' — 图片先用 slides_import_asset 导入，src 写它返回的 /_blob/<id>';

const fmt = (d: CompileDiagnostic) => `${d.line}:${d.col} ${d.message.replace(IMAGE_REF_ADVICE, IMPORT_ADVICE)}`;

/** 中日韩文字。 */
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]/;

/**
 * 编译器按空格切词估算「会从词中间断开」，没有空格的中日韩句子整句算一个词；浏览器在这些字之间本来就能换行，这类提示是误报。
 */
export function isCjkWordBreakLint(message: string): boolean {
  if (!message.includes('break mid-word')) return false;
  // 消息里先引的可能是所在 section 的 id，要的是「needs」前面那段文字。
  const quoted = /"([^"]*)" needs ~/.exec(message)?.[1] ?? '';
  return CJK.test(quoted);
}

/** 编辑器读取时把 deck.json 的 faces 拼成 <head> 的字体链接；单页编译也带上，免得误报「字体未声明」。 */
export function fontHead(deck: Pick<DeckMetadata, 'faces'>): string {
  const links = Object.values(deck.faces ?? {})
    .filter(f => typeof f?.href === 'string')
    .map(f => `<link rel="stylesheet" href="${f.href!.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`);
  return `<head>${links.join('')}</head>\n`;
}

const facesOf = (r: CompileResult) => (Array.isArray(r.content.faces) ? r.content.faces.length : 0);

/** fontHead() 自己带进来的字体数，按 head 缓存。 */
const headFaceCounts = new Map<string, number>();
function headFaces(rt: SlidesRuntime, head: string): number {
  let n = headFaceCounts.get(head);
  if (n === undefined) {
    n = facesOf(rt.compileSlideHtml(`${head}<section id="probe"></section>`));
    if (headFaceCounts.size > 64) headFaceCounts.clear();
    headFaceCounts.set(head, n);
  }
  return n;
}

/** 校验一页源 HTML。head 是 fontHead() 的结果。 */
export function checkSlide(
  rt: SlidesRuntime,
  id: string,
  html: string,
  options: { head: string; lists?: 'css'; blobExists?: (id: string) => boolean; verbose?: boolean },
): SlideReport {
  const report: SlideReport = { id, problems: [], notes: [], roundTripDrift: false };
  // 不开 collectFiles：编辑器读页面时也不开，相对路径的图片在那里是错误。
  const r = rt.compileSlideHtml(options.head + html, { lists: options.lists });
  for (const e of r.errors) report.problems.push(`错误 ${fmt(e)}`);
  // 编辑器按页读文件时同样拒绝（packages/slides-runtime/src/documents/slide-codec.ts）：字体在 deck.json 的 faces 里登记。
  if (r.hoisted > 0 || r.title !== undefined || facesOf(r) > headFaces(rt, options.head)) {
    report.problems.push('错误 页面文件里不能有 <title>、<link> 或 <style>：样式写进 style 属性，网络字体登记在 deck.json 的 faces');
  }
  for (const u of r.unsupported) report.problems.push(`不支持 ${fmt(u)}`);
  if (r.cellRemovals > 0) report.problems.push(`表格有 ${r.cellRemovals} 个单元格被删（行列数不齐）`);
  if (r.content.order.length !== 1) report.problems.push(`应该恰好一个 <section>，实际 ${r.content.order.length} 个`);
  for (const w of r.warnings) report.notes.push(`警告 ${fmt(w)}`);
  if (options.verbose) for (const l of r.lints) if (!isCjkWordBreakLint(l.message)) report.notes.push(`排版 ${fmt(l)}`);

  if (options.blobExists) {
    for (const ref of html.matchAll(/\/_blob\/([0-9a-f]{32})/g)) {
      if (!options.blobExists(ref[1]!)) report.problems.push(`引用的 /_blob/${ref[1]} 不存在`);
    }
  }

  const slide = r.content.slides[r.content.order[0] ?? ''];
  if (slide !== undefined) {
    const once = rt.serializeSlideHtml(r.content, slide);
    const again = rt.compileSlideHtml(options.head + once, { lists: options.lists });
    const againSlide = again.content.slides[again.content.order[0] ?? ''];
    report.roundTripDrift = againSlide === undefined || rt.serializeSlideHtml(again.content, againSlide) !== once;
  }
  return report;
}

/** 校验 deckDir（含 deck.json、slides/、assets/）下的整份 deck。 */
export function checkDeck(rt: SlidesRuntime, deckDir: string, options: { verbose?: boolean } = {}): CheckReport {
  const raw = JSON.parse(readFileSync(path.join(deckDir, 'deck.json'), 'utf8')) as DeckMetadata;
  const normalized = rt.normalizeDeckMetadata(raw);
  const slidesDir = path.join(deckDir, 'slides');
  const slideFiles = new Set(
    existsSync(slidesDir)
      ? readdirSync(slidesDir)
          .filter(f => f.endsWith('.html'))
          .map(f => f.slice(0, -'.html'.length))
      : [],
  );

  const deckProblems = deckReferenceProblems(raw, slideFiles);
  const dropped = (raw.order ?? []).length - normalized.order.length;
  if (dropped > 0) deckProblems.push(`order 里有 ${dropped} 个无效或重复的 id 会被运行时丢掉`);

  const head = fontHead(raw);
  const assetsDir = path.join(deckDir, ASSETS_DIR);
  const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
  const slides = normalized.order
    .filter(id => slideFiles.has(id))
    .map(id =>
      checkSlide(rt, id, readFileSync(path.join(slidesDir, `${id}.html`), 'utf8'), {
        head,
        lists: raw.lists,
        blobExists: blobId => assets.some(name => name.startsWith(`${blobId}.`)),
        verbose: options.verbose,
      }),
    );

  return {
    title: normalized.title,
    deckProblems: deckProblems.map(p => `deck.json: ${p}`),
    orphans: [...slideFiles].filter(id => !normalized.order.includes(id)),
    slides,
  };
}

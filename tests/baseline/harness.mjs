// 行为基线的公共部分：启动隔离服务与浏览器、取证、归一化与比较。场景只描述用户操作，见 scenarios/。
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
export const FIXTURES = path.join(REPO, 'tests/baseline/fixtures');

// 固定环境：同一台机器上连续运行的截图必须逐像素一致。
export const ENVIRONMENT = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'en-US',
  timezoneId: 'UTC',
  colorScheme: 'light',
  reducedMotion: 'reduce',
};
// 截图前指针停放的位置：画布左下角的空白处，避开顶栏提示气泡和画板悬停态。
const REST_POINT = { x: 16, y: 884 };
// 稳定窗口要长于面板滚动后滚动条约 0.8 秒的显示时间
const STABLE_MS = 1000, SETTLE_TIMEOUT_MS = 15000, SAVE_TIMEOUT_MS = 30000;
const TEXT_FILE = /\.(?:html?|json|js|mjs|css|md|svg|txt)$/i;

const sha256 = data => createHash('sha256').update(data).digest('hex');

// 在 iframe（编辑器）与外壳之间记录 postMessage；画板等更深的 iframe 不属于这条协议。
function captureMessages() {
  const top = window === window.top, editor = !top && window.parent === window.top;
  if (!top && !editor) return;
  // 文件数据只记大小，其余按 JSON 结构记录
  const plain = value => JSON.parse(JSON.stringify(value ?? null, (_key, v) =>
    v instanceof ArrayBuffer ? { arrayBuffer: v.byteLength } : (typeof Blob === 'function' && v instanceof Blob) ? { blob: v.size } : v));
  window.addEventListener('message', event => {
    let direction;
    if (top) {
      const frame = document.getElementById('editor');
      if (!frame || event.source !== frame.contentWindow) return;
      direction = 'editor→shell';
    } else {
      if (event.source !== window.parent) return;
      direction = 'shell→editor';
    }
    let data;
    try { data = plain(event.data); } catch { data = String(event.data); }
    window.__mdnBaselineMessage?.(direction, data);
  }, true);
}

async function startService(workspace, home) {
  const child = spawn(process.execPath, [path.join(REPO, 'dist/cli.mjs'), '--workspace', workspace, '--port', '0'], {
    env: { ...process.env, MINEDESIGN_HOME: home }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  const url = await new Promise((resolve, reject) => {
    let out = '';
    child.stdout.on('data', chunk => { out += chunk; const match = /MineDesign: (\S+)/.exec(out); if (match) resolve(match[1]); });
    child.once('exit', code => reject(new Error(`服务启动失败（退出码 ${code}）：${stderr}`)));
  });
  const stop = () => new Promise(resolve => { if (child.exitCode !== null) return resolve(); child.once('exit', resolve); child.kill('SIGTERM'); });
  return { url, api: url.replace('/app/', '/api/'), stop, stderr: () => stderr };
}

// 进程内易变的值：端口、token、grant、临时路径、随机 id。
function createNormalizer({ url, workspace }) {
  const origin = new URL(url).port;
  const token = url.split('/app/')[1].replace(/\/$/, '');
  const ids = new Map();
  const idOf = (kind, value) => {
    const key = `${kind}:${value}`;
    if (!ids.has(key)) ids.set(key, `<${kind}-${[...ids.keys()].filter(k => k.startsWith(`${kind}:`)).length + 1}>`);
    return ids.get(key);
  };
  const realWorkspace = fs.realpathSync(workspace);
  const text = value => value
    .replaceAll(realWorkspace, '<workspace>').replaceAll(workspace, '<workspace>')
    .replace(new RegExp(`https?://(?:localhost|127\\.0\\.0\\.1):${origin}`, 'g'), '<origin>')
    .replaceAll(token, '<token>')
    .replace(/\/(design-system|design)\/[A-Za-z0-9_-]{16,}\//g, '/$1/<grant>/')
    .replace(/blob:<origin>\/[0-9a-f-]{36}/g, m => idOf('blob', m))
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, m => idOf('uuid', m))
    // 批注创建时间等带毫秒的时间戳；夹具里手写的时间不带毫秒，保持原样
    // 粘贴等操作新建画板时的随机后缀
    .replace(/\bArtboard-[a-z0-9]{4}\b/g, 'Artboard-<id>')
    .replace(/\b\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z\b/g, '<time>');
  const value = (input, key) => {
    if (typeof input === 'string') return /requestId$/i.test(key ?? '') ? idOf('request', input) : text(input);
    if (Array.isArray(input)) return input.map(item => value(item));
    if (input && typeof input === 'object') return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, value(v, k)]));
    return input;
  };
  return { text, value };
}

// 画布说明与图形的 id 随机生成（note-xxxxxx、shape-xxxxxx），canvas.json 又按 id 排序键名；
// 按内容给它们重新编号并排序，id 与顺序都不再随运行变化。
const CANVAS_ID = /\b(?:note|shape)-[a-z0-9]{6}\b/g;
function canonicalCanvasIds(text) {
  if (!text.match(CANVAS_ID)) return text;
  let data;
  try { data = JSON.parse(text); } catch { return text; }
  const found = new Map();
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    for (const [key, child] of Object.entries(node)) {
      if (/^(?:note|shape)-[a-z0-9]{6}$/.test(key)) found.set(key, `${key.split('-')[0]} ${JSON.stringify(child).replace(CANVAS_ID, '<id>')}`);
      walk(child);
    }
  };
  walk(data);
  const names = new Map([...found].sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0).map(([id], index) => [id, `<${id.split('-')[0]}-${index + 1}>`]));
  const renamed = JSON.parse(JSON.stringify(data).replace(CANVAS_ID, id => names.get(id) ?? id));
  const sort = node => {
    if (Array.isArray(node)) return node.map(sort);
    if (!node || typeof node !== 'object') return node;
    const entries = Object.entries(node).map(([k, v]) => [k, sort(v)]);
    if (entries.some(([k]) => /^<(?:note|shape)-\d+>$/.test(k))) entries.sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }));
    return Object.fromEntries(entries);
  };
  return `${JSON.stringify(sort(renamed), null, 2)}\n`;
}

const CHROMIUM_ARGS = ['--disable-gpu', '--disable-partial-raster', '--num-raster-threads=1', '--force-color-profile=srgb', '--disable-skia-runtime-opts', '--disable-threaded-animation', '--disable-checker-imaging'];

export async function launchBrowser() {
  const { chromium } = await import('playwright');
  // 使用与 playwright 版本匹配的本机缓存浏览器；缺失时提示，不自动下载。
  // 软件光栅、单线程光栅、固定色彩配置：消除阴影与缩放边缘偶发的 1 级色差
  const args = process.env.MDN_BASELINE_ARGS !== undefined ? process.env.MDN_BASELINE_ARGS.split(' ').filter(Boolean) : CHROMIUM_ARGS;
  try { return await chromium.launch({ args }); } catch (error) {
    throw new Error(`无法启动 Chromium：${error.message.split('\n')[0]}\n需要本机已有与 package.json 中 playwright 版本对应的浏览器缓存。`);
  }
}

// 各类编辑器首屏内容出现的标志：只用外壳控件与稳定的 data-testid。
const READY = {
  async design(session) {
    await session.page.waitForFunction(() => !document.getElementById('view-controls').hidden, null, { timeout: SETTLE_TIMEOUT_MS });
    await session.editor().waitForSelector('[data-testid="mega-canvas"] [data-testid^="mega-artboard-frame-"] iframe', { timeout: SETTLE_TIMEOUT_MS });
  },
  // 设计系统：骨架屏之后出现章节导航、渲染好的说明文档，且载入完成（同步点不再是 loading）
  async 'design-system'(session) {
    const editor = session.editor();
    await editor.waitForSelector('[data-testid="ds-section-nav"] [data-testid="ds-jump-readme"]', { timeout: SETTLE_TIMEOUT_MS });
    await editor.waitForSelector('[data-testid="ds-readme-rendered"]', { timeout: SETTLE_TIMEOUT_MS });
    await editor.waitForTimeout(3000); console.log("SYNC", await editor.evaluate(() => [...document.querySelectorAll("[data-testid=sync-dot]")].map(e => e.outerHTML)));
  },
};

// 一个场景一次会话：临时工作区、独立数据目录、空闲端口、全新浏览器上下文。
export async function openSession(browser, { fixture, kind = 'design', name }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mdn-baseline-'));
  const workspace = path.join(root, 'workspace'), home = path.join(root, 'home');
  fs.cpSync(path.join(FIXTURES, fixture), path.join(workspace, fixture), { recursive: true });
  fs.mkdirSync(home);
  // 界面语言固定为英文，不依赖系统设置
  fs.writeFileSync(path.join(home, 'settings.json'), JSON.stringify({ language: 'en' }));
  const service = await startService(workspace, home);
  const normalize = createNormalizer({ url: service.url, workspace });
  const messages = { 'shell→editor': [], 'editor→shell': [] };
  const errors = [];
  const shots = [];
  // 进行中的写请求（保存、批注）；构建检查、事件长轮询与只读请求不算
  let writes = 0;
  const context = await browser.newContext(ENVIRONMENT);
  await context.exposeBinding('__mdnBaselineMessage', (_source, direction, data) => { messages[direction]?.push(data); });
  await context.addInitScript(captureMessages);
  const isWrite = request => request.method() === 'POST' && !/\/(?:shell|events|about)$/.test(new URL(request.url()).pathname);
  context.on('request', request => { if (isWrite(request)) writes++; });
  for (const event of ['requestfinished', 'requestfailed']) context.on(event, request => { if (isWrite(request)) writes--; });
  const page = await context.newPage();
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const { url } = message.location();
    errors.push({ type: 'console.error', text: message.text(), ...(url ? { url } : {}) });
  });
  page.on('pageerror', error => errors.push({ type: 'pageerror', text: `${error.name}: ${error.message}` }));

  const response = await fetch(`${service.api}open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: fixture, kind }) });
  if (!response.ok) throw new Error(`打开作品失败：${response.status} ${await response.text()}`);

  const editor = () => page.frames().find(frame => frame.parentFrame() === page.mainFrame());
  const session = {
    name, page, workspace, home, fixture,
    editor,
    /** 打开外壳并等待编辑器就绪。 */
    async open() {
      await page.goto(service.url);
      await page.waitForFunction(() => document.getElementById('viewport-state')?.hidden === true && !document.getElementById('editor').hidden, null, { timeout: SETTLE_TIMEOUT_MS });
      // 编辑器自己的骨架屏可能静止超过稳定窗口，先等到首屏的真实内容出现
      await READY[kind](session);
      await session.settle();
    },
    /** 指针回到停放点，避免悬停态进入截图。 */
    async rest() { await page.mouse.move(REST_POINT.x, REST_POINT.y); },
    /** 等待全部 frame 载入、字体就绪，并且画面在 STABLE_MS 内不再变化；返回最后一张截图。 */
    async settle() {
      const deadline = Date.now() + SETTLE_TIMEOUT_MS;
      for (const frame of page.frames()) {
        await frame.waitForFunction(() => document.readyState === 'complete' && document.fonts.status === 'loaded', null, { timeout: SETTLE_TIMEOUT_MS }).catch(error => {
          if (!frame.isDetached()) throw error;
        });
      }
      let last = null, since = 0, frames = page.frames().length;
      while (Date.now() < deadline) {
        const shot = await page.screenshot({ animations: 'disabled', caret: 'hide' });
        // 稳定期间出现新的 frame（懒加载的画板）时重新计时
        if (page.frames().length !== frames) { frames = page.frames().length; last = null; continue; }
        if (last && shot.equals(last)) { if (Date.now() - since >= STABLE_MS) return shot; }
        else { last = shot; since = Date.now(); }
        await page.waitForTimeout(100);
      }
      throw new Error(`${name}：画面 ${SETTLE_TIMEOUT_MS / 1000} 秒内没有稳定`);
    },
    /** 等编辑器把改动写回：同步点不再是待保存，且没有进行中的写请求。连续修改时编辑器会延后下一次写回，可能要等十几秒。 */
    async saved() {
      // 改动要过一会儿才进入待保存状态，先等画面稳定再看同步点
      await session.settle();
      const deadline = Date.now() + SAVE_TIMEOUT_MS;
      for (let waited = false; ; waited = true) {
        const pending = await editor()?.evaluate(() => document.querySelector('[data-testid="sync-dot"]')?.dataset.sync === 'pending').catch(() => false);
        if (!pending && writes === 0) { if (waited) await session.settle(); return; }
        if (Date.now() > deadline) throw new Error(`${name}：${SAVE_TIMEOUT_MS / 1000} 秒内没有保存完成`);
        await page.waitForTimeout(100);
      }
    },
    /** 关键步骤截图：先停放指针再等稳定。 */
    async shot(step) {
      await session.rest();
      const image = await session.settle();
      shots.push({ name: `${String(shots.length + 1).padStart(2, '0')}-${step}.png`, image });
    },
    /** 场景结束后的证据：截图、工作区文件、消息序列、控制台错误。 */
    async evidence() {
      // 等编辑器把未保存的改动写回，再读工作区
      await session.saved();
      const files = [];
      // 文本文件的哈希按归一化后的内容计算，随机 id 与临时路径不影响清单
      const record = (rel, bytes) => {
        if (!TEXT_FILE.test(rel)) return { path: rel, sha256: sha256(bytes), size: bytes.length };
        const text = canonicalCanvasIds(normalize.text(bytes.toString('utf8')));
        return { path: normalize.text(rel), sha256: sha256(text), size: bytes.length, text };
      };
      const walk = dir => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.isFile()) files.push(record(path.relative(workspace, full).split(path.sep).join('/'), fs.readFileSync(full)));
        }
      };
      walk(workspace);
      // 批注保存在数据目录，文件名取自作品的临时路径，按顺序改名
      const notes = path.join(home, 'annotations');
      if (fs.existsSync(notes)) fs.readdirSync(notes).sort().forEach((file, index) => files.push(record(`home/annotations/${index + 1}.json`, fs.readFileSync(path.join(notes, file)))));
      return {
        shots,
        files,
        messages: normalize.value(messages),
        errors: errors.map(error => normalize.value(error)),
      };
    },
    async close() {
      await context.close().catch(() => {});
      await service.stop();
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
  return session;
}

// —— 证据的保存与比较 ——

const json = value => `${JSON.stringify(value, null, 2)}\n`;

export function writeEvidence(dir, evidence) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'shots'), { recursive: true });
  for (const shot of evidence.shots) fs.writeFileSync(path.join(dir, 'shots', shot.name), shot.image);
  // 文本文件逐个落盘便于 diff；清单记录全部文件的路径与哈希
  for (const file of evidence.files) if (file.text !== undefined) {
    const target = path.join(dir, 'files', file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.text);
  }
  fs.writeFileSync(path.join(dir, 'files.json'), json(evidence.files.map(({ text: _text, ...file }) => file)));
  fs.writeFileSync(path.join(dir, 'messages.json'), json(evidence.messages));
  fs.writeFileSync(path.join(dir, 'errors.json'), json(evidence.errors));
}

function textDiff(expected, actual) {
  try {
    execFileSync('git', ['diff', '--no-index', '--no-color', '--', expected, actual], { encoding: 'utf8' });
    return '';
  } catch (error) {
    if (error.status === 1) return error.stdout;
    throw error;
  }
}

// 截图逐像素比较；在浏览器 canvas 里解码，差异像素标红生成差异图。
async function compareImage(diffPage, expected, actual) {
  if (expected.equals(actual)) return { pixels: 0 };
  return diffPage.evaluate(async ([a, b]) => {
    const load = async data => createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const [x, y] = await Promise.all([load(a), load(b)]);
    const width = Math.max(x.width, y.width), height = Math.max(x.height, y.height);
    const read = image => { const c = new OffscreenCanvas(width, height), g = c.getContext('2d'); g.drawImage(image, 0, 0); return g.getImageData(0, 0, width, height).data; };
    const p = read(x), q = read(y);
    const out = new OffscreenCanvas(width, height), g = out.getContext('2d'), diff = g.createImageData(width, height);
    let pixels = 0;
    for (let i = 0; i < p.length; i += 4) {
      const same = p[i] === q[i] && p[i + 1] === q[i + 1] && p[i + 2] === q[i + 2] && p[i + 3] === q[i + 3];
      if (!same) pixels++;
      // 相同处淡化为灰度底图，不同处标红
      const gray = (p[i] + p[i + 1] + p[i + 2]) / 3;
      diff.data.set(same ? [255 - (255 - gray) * 0.25, 255 - (255 - gray) * 0.25, 255 - (255 - gray) * 0.25, 255] : [255, 0, 0, 255], i);
    }
    g.putImageData(diff, 0, 0);
    const bytes = new Uint8Array(await (await out.convertToBlob({ type: 'image/png' })).arrayBuffer());
    let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { pixels, sizeChanged: x.width !== y.width || x.height !== y.height, png: btoa(s) };
  }, [expected.toString('base64'), actual.toString('base64')]);
}

/** 比较一个场景的记录；返回失败条目，每条带证据类型、说明与差异文件路径。 */
export async function compareEvidence(diffPage, expectedDir, actualDir, diffDir) {
  const failures = [];
  fs.rmSync(diffDir, { recursive: true, force: true });
  const save = (name, content) => { const file = path.join(diffDir, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); return path.relative(REPO, file); };
  const list = dir => fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];

  const expectedShots = list(path.join(expectedDir, 'shots')), actualShots = list(path.join(actualDir, 'shots'));
  for (const name of new Set([...expectedShots, ...actualShots])) {
    if (!expectedShots.includes(name) || !actualShots.includes(name)) {
      failures.push({ kind: '截图', detail: `${name} ${expectedShots.includes(name) ? '本次缺失' : '基线中没有'}` });
      continue;
    }
    const result = await compareImage(diffPage, fs.readFileSync(path.join(expectedDir, 'shots', name)), fs.readFileSync(path.join(actualDir, 'shots', name)));
    if (result.pixels || result.sizeChanged) failures.push({ kind: '截图', detail: `${name}：${result.pixels} 个像素不同${result.sizeChanged ? '，尺寸变化' : ''}`, diff: save(`shots/${name}`, Buffer.from(result.png, 'base64')) });
  }
  for (const [kind, target, name] of [['文件', 'files.json', 'files-manifest'], ['文件', 'files', 'files'], ['消息', 'messages.json', 'messages'], ['控制台错误', 'errors.json', 'errors']]) {
    const a = path.join(expectedDir, target), b = path.join(actualDir, target);
    if (!fs.existsSync(a) && !fs.existsSync(b)) continue;
    if (!fs.existsSync(a) || !fs.existsSync(b)) { failures.push({ kind, detail: `${target} ${fs.existsSync(a) ? '本次缺失' : '基线中没有'}` }); continue; }
    const diff = textDiff(a, b);
    if (diff) failures.push({ kind, detail: `${target} 不同`, diff: save(`${name}.diff`, diff) });
  }
  return failures;
}

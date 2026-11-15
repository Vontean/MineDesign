// 行为基线入口。用法：
//   node tests/baseline/run.mjs --record [场景名…]   记录基线到 output/baseline/expected/
//   node tests/baseline/run.mjs [场景名…]            与基线比较，差异写入 output/baseline/diff/，有差异时退出码为 1
// 需要已构建的 dist/ 与 apps/*/dist（npm 脚本会先运行 npm run build）。
import fs from 'node:fs';
import path from 'node:path';
import { checkCanvas } from '@minedesign/design-files';
import { checkDesignSystem } from '@minedesign/design-system-files';
import { REPO, FIXTURES, launchBrowser, openSession, writeEvidence, compareEvidence } from './harness.mjs';

const args = process.argv.slice(2);
const record = args.includes('--record');
const only = args.filter(arg => !arg.startsWith('--'));
const OUTPUT = path.join(REPO, 'output/baseline');
const scenarioDir = path.join(REPO, 'tests/baseline/scenarios');

const scenarios = [];
for (const file of fs.readdirSync(scenarioDir).filter(name => name.endsWith('.mjs')).sort()) {
  const scenario = (await import(path.join(scenarioDir, file))).default;
  scenario.name ??= file.replace(/\.mjs$/, '');
  if (!only.length || only.includes(scenario.name)) scenarios.push(scenario);
}
if (!scenarios.length) { console.error(`没有匹配的场景：${only.join(', ')}`); process.exit(2); }
for (const file of ['dist/cli.mjs', 'apps/design-editor/dist']) if (!fs.existsSync(path.join(REPO, file))) { console.error(`缺少 ${file}，先运行 npm run build`); process.exit(2); }

// 夹具先过结构校验（与 design_check 同一逻辑），避免把无效作品记成基线
for (const { fixture, kind } of new Map(scenarios.map(s => [s.fixture, s])).values()) {
  const result = await (kind === 'design-system' ? checkDesignSystem : checkCanvas)(path.join(FIXTURES, fixture));
  if (result.issues.length) { console.error(`夹具 ${fixture} 结构校验未通过：`, result.issues); process.exit(2); }
}

const started = Date.now();
const browser = await launchBrowser();
const diffPage = await browser.newPage();
let failed = 0;
try {
  for (const scenario of scenarios) {
    const begin = Date.now();
    const session = await openSession(browser, scenario);
    let evidence;
    try {
      await scenario.run(session);
      evidence = await session.evidence();
    } catch (error) {
      // 操作失败也算不一致：记下当时的画面，继续跑其余场景
      const shot = path.join(OUTPUT, 'diff', scenario.name, 'failure.png');
      fs.mkdirSync(path.dirname(shot), { recursive: true });
      await session.page.screenshot({ path: shot }).catch(() => {});
      failed++;
      console.log(`✗ ${scenario.name}\n  [运行] ${error.message.split('\n')[0]} → ${path.relative(REPO, shot)}`);
      continue;
    } finally {
      await session.close();
    }
    const expected = path.join(OUTPUT, 'expected', scenario.name);
    if (record) {
      writeEvidence(expected, evidence);
      console.log(`● ${scenario.name}：已记录 ${evidence.shots.length} 张截图（${Date.now() - begin} ms）`);
      continue;
    }
    if (!fs.existsSync(expected)) { failed++; console.log(`✗ ${scenario.name}：没有基线，先运行 npm run baseline:record`); continue; }
    const actual = path.join(OUTPUT, 'actual', scenario.name);
    writeEvidence(actual, evidence);
    const failures = await compareEvidence(diffPage, expected, actual, path.join(OUTPUT, 'diff', scenario.name));
    if (!failures.length) { console.log(`✓ ${scenario.name}（${Date.now() - begin} ms）`); continue; }
    failed++;
    console.log(`✗ ${scenario.name}`);
    for (const failure of failures) console.log(`  [${failure.kind}] ${failure.detail}${failure.diff ? ` → ${failure.diff}` : ''}`);
  }
} finally {
  await browser.close();
}
console.log(`${record ? '记录' : '比较'}完成：${scenarios.length} 个场景${record ? '' : `，${failed} 个不一致`}，用时 ${((Date.now() - started) / 1000).toFixed(1)} 秒`);
process.exit(failed ? 1 : 0);

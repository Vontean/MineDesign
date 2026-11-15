import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeSources } from '../scripts/runtime-deps.mjs';

// 最小样例：a 提供函数与常量，b 在初始化时派生、在调用时读取，c 没有读取方
const sources = {
  'a.ts': `
    export function installA(runtime: RuntimeBindings) {
      var LIMIT: Dynamic;
      function helper() { return 1; }
      bindRuntimeValue(runtime, "helper", () => helper);
      bindRuntimeValue(runtime, "LIMIT", () => LIMIT, (value) => { LIMIT = value; });
      return () => { LIMIT = 8; };
    }`,
  'ui/b.tsx': `
    export function installB(runtime: RuntimeBindings) {
      var doubled: Dynamic;
      var current: Dynamic;
      var initB: Dynamic;
      function View() { current = (0, runtime.helper)(); return <runtime.Missing />; }
      bindRuntimeValue(runtime, "View", () => View);
      bindRuntimeValue(runtime, "doubled", () => doubled);
      bindRuntimeValue(runtime, "current", () => current);
      return () => { initB = (0, runtime.initializeOnce)(() => { doubled = runtime.LIMIT * 2; }); };
    }`,
  'c.ts': `
    export function installC(runtime: RuntimeBindings) {
      function unused() {}
      bindRuntimeValue(runtime, "unused", () => unused);
      return () => {};
    }`,
};

test('依赖地图区分提供方、读取阶段与迁移难度', () => {
  const r = analyzeSources(sources, { roots: ['ui/b.tsx'] });
  const binding = name => r.bindings.find(b => b.name === name);
  assert.equal(binding('helper').providers[0].kind, 'function');
  assert.deepEqual(binding('helper').readers, { 'ui/b.tsx': { install: 0, init: 0, call: 1 } });
  // 惰性初始化回调内的读取属于初始化阶段
  assert.deepEqual(binding('LIMIT').readers, { 'ui/b.tsx': { install: 0, init: 1, call: 0 } });
  assert.deepEqual(binding('LIMIT').providers[0].deps, []);
  assert.deepEqual(binding('doubled').providers[0].deps, ['LIMIT']);
  assert.equal(binding('current').providers[0].mutable, true);
  // JSX 成员也算读取；没有提供方的名称单独列出
  assert.deepEqual(r.unprovided, ['initializeOnce', 'Missing']);
  assert.deepEqual(r.unreachable, ['c.ts']);
  assert.deepEqual(r.earlyEdges, { 'ui/b.tsx': ['a.ts'] });
  assert.deepEqual(r.sensitive.map(s => `${s.name}:${s.class}`), ['current:mutable', 'doubled:derived']);
});

test('相同输入得到相同输出', () => {
  assert.equal(JSON.stringify(analyzeSources(sources)), JSON.stringify(analyzeSources(sources)));
});

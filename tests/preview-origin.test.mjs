import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';

const bundle=await build({entryPoints:['packages/design-runtime/src/platform/file-content.ts'],bundle:true,write:false,format:'iife',globalName:'preview'});
function runtimeFor(origin){
  const context=vm.createContext({origin,location:{origin:'null'}});
  vm.runInContext(bundle.outputFiles[0].text,context);
  const runtime={};context.preview.installPlatformFileContent(runtime);return runtime;
}
test('Codex srcdoc preview keeps the exact host origin and source checks',()=>{
  const origin='codex-sandbox://mcp-app-example.web-sandbox.oaiusercontent.com';
  const runtime=runtimeFor(origin),source={},frame={contentWindow:source};
  assert.equal(runtime.currentHttpOrigin(),origin);
  assert.equal(runtime.isPreviewMessage({source,origin},frame,origin),true);
  assert.equal(runtime.isPreviewMessage({source,origin:'null'},frame,origin),false);
  assert.equal(runtime.isPreviewMessage({source,origin:origin+'-other'},frame,origin),false);
  assert.equal(runtime.isPreviewMessage({source:{},origin},frame,origin),false);
});
test('HTTP and opaque preview origins retain upstream behavior',()=>{
  for(const origin of ['http://localhost:1234','https://example.com','null','file://example']){
    assert.equal(runtimeFor(origin).currentHttpOrigin(),/^https?:/.test(origin)?origin:'null');
  }
});

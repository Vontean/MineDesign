import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const root=path.resolve(import.meta.dirname,'..');
const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version;
const tokens=await fs.readFile(path.join(root,'assets/tokens.css'),'utf8');
const editorTheme=await fs.readFile(path.join(root,'assets/editor-theme.css'),'utf8');
const themeBridge="(()=>{let applied=[];addEventListener('message',e=>{const d=e.data;if(e.source!==parent||d?.type!=='minedesign:theme'||!['light','dark'].includes(d.theme))return;const r=document.documentElement;r.dataset.theme=d.theme;r.dataset.mode=d.theme;for(const n of applied)r.style.removeProperty(n);applied=Object.entries(d.variables||{}).filter(([n,v])=>n.startsWith('--')&&typeof v==='string').map(([n,v])=>(r.style.setProperty(n,v),n));})})()";
for(const editor of ['design-editor','design-system-editor']){
  const file=path.join(root,'vendor/baocut/apps',editor,'dist/index.html');
  let html=await fs.readFile(file,'utf8');
  // 外壳把主题与宿主样式变量转发给编辑器；每次构建替换旧的注入块
  html=html.replace(/<style data-minedesign-theme>[\s\S]*?<\/style><script(?: data-minedesign-theme)?>[\s\S]*?<\/script>/g,'');
  html=html.replace('</head>',()=>`<style data-minedesign-theme>${tokens}\n${editorTheme}</style><script data-minedesign-theme>${themeBridge}</script></head>`);
  await fs.writeFile(file,html);
}
await fs.mkdir(path.join(root,'dist'),{recursive:true});
// frame-shim.js 以文本注入编辑器 srcdoc
const shimAsText={name:'shim-as-text',setup(b){b.onLoad({filter:/frame-shim\.js$/},async args=>({contents:await fs.readFile(args.path,'utf8'),loader:'text'}));}};
await build({entryPoints:[path.join(root,'src/app.mjs')],outfile:path.join(root,'dist/app.js'),bundle:true,format:'esm',platform:'browser',legalComments:'inline',plugins:[shimAsText],define:{__MDN_VERSION__:JSON.stringify(version)}});
const js=(await fs.readFile(path.join(root,'dist/app.js'),'utf8')).replaceAll('</script','<\\/script');
const css=await fs.readFile(path.join(root,'assets/app.css'),'utf8');
const illustrationsCss=await fs.readFile(path.join(root,'assets/illustrations/illustrations.css'),'utf8');
let html=await fs.readFile(path.join(root,'src/app.html'),'utf8');
const logo=(await fs.readFile(path.join(root,'assets/brand/minedesign-icon-selected.svg'),'utf8')).replace(/<!--[\s\S]*?-->/g,'').replace('role="img" aria-label="MineDesign"','aria-hidden="true" class="brand-icon"');
const favicon=Buffer.from(await fs.readFile(path.join(root,'assets/brand/favicon.svg'),'utf8')).toString('base64');
html=html.replace('<!--__BRAND__-->',()=>logo).replace('</head>',`<link rel="icon" href="data:image/svg+xml;base64,${favicon}"></head>`);
await fs.writeFile(path.join(root,'dist/app.html'),html.replace('/*__STYLES__*/',[tokens,css,illustrationsCss].join('\n')).replace('/*__APP__*/',()=>js));
await build({entryPoints:[path.join(root,'src/cli.mjs')],outfile:path.join(root,'dist/cli.mjs'),bundle:true,format:'esm',platform:'node',external:['@modelcontextprotocol/*','zod'],logLevel:'warning'});
console.log('MineDesign host and editor theme adapters built.');

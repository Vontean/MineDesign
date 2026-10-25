import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const root=path.resolve(import.meta.dirname,'..');
const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version;
const tokens=await fs.readFile(path.join(root,'assets/tokens.css'),'utf8');
const editorTheme=await fs.readFile(path.join(root,'assets/editor-theme.css'),'utf8');
const themeBridge="(()=>{let applied=[];addEventListener('message',e=>{const d=e.data;if(e.source!==parent||d?.type!=='minedesign:theme'||!['light','dark'].includes(d.theme))return;const r=document.documentElement;r.dataset.theme=d.theme;r.dataset.mode=d.theme;for(const n of applied)r.style.removeProperty(n);applied=Object.entries(d.variables||{}).filter(([n,v])=>n.startsWith('--')&&typeof v==='string').map(([n,v])=>(r.style.setProperty(n,v),n));})})()";
for(const editor of ['design-editor','design-system-editor']){
  const file=path.join(root,'apps',editor,'dist/index.html');
  let html=await fs.readFile(file,'utf8');
  // 外壳把主题与宿主样式变量转发给编辑器；每次构建替换旧的注入块
  html=html.replace(/<style data-minedesign-theme>[\s\S]*?<\/style><script(?: data-minedesign-theme)?>[\s\S]*?<\/script>/g,'');
  html=html.replace('</head>',()=>`<style data-minedesign-theme>${tokens}\n${editorTheme}</style><script data-minedesign-theme>${themeBridge}</script></head>`);
  await fs.writeFile(file,html);
}
await fs.mkdir(path.join(root,'dist'),{recursive:true});
// frame-shim.js 以文本注入编辑器 srcdoc
const shimAsText={name:'shim-as-text',setup(b){b.onLoad({filter:/frame-shim\.js$/},async args=>({contents:await fs.readFile(args.path,'utf8'),loader:'text'}));}};
await build({entryPoints:[path.join(root,'src/frontend/app.mjs')],outfile:path.join(root,'dist/app.js'),bundle:true,format:'esm',platform:'browser',legalComments:'inline',plugins:[shimAsText],define:{__MDN_VERSION__:JSON.stringify(version)}});
const js=(await fs.readFile(path.join(root,'dist/app.js'),'utf8')).replaceAll('</script','<\\/script');
const css=await fs.readFile(path.join(root,'assets/app.css'),'utf8');
const illustrationsCss=await fs.readFile(path.join(root,'assets/illustrations/illustrations.css'),'utf8');
let html=await fs.readFile(path.join(root,'src/frontend/app.html'),'utf8');
const logo=(await fs.readFile(path.join(root,'assets/brand/minedesign-icon-selected.svg'),'utf8')).replace(/<!--[\s\S]*?-->/g,'').replace('role="img" aria-label="MineDesign"','aria-hidden="true" class="brand-icon"');
const favicon=Buffer.from(await fs.readFile(path.join(root,'assets/brand/favicon.svg'),'utf8')).toString('base64');
// 弹窗关闭沿用 Codex 原生路径；About 用同一品牌图形的大尺寸
const close='<svg viewBox="0 0 21 21" aria-hidden="true"><path d="M14.6549 5.57307C14.9283 5.2997 15.3718 5.2997 15.6451 5.57307C15.9185 5.84643 15.9185 6.28993 15.6451 6.5633L11.3903 10.8182L15.6451 15.0731L15.735 15.1834C15.9141 15.4551 15.8842 15.8242 15.6451 16.0633C15.4061 16.3024 15.0369 16.3322 14.7653 16.1531L14.6549 16.0633L10.4 11.8084L6.14515 16.0633C5.87178 16.3367 5.42828 16.3367 5.15492 16.0633C4.88155 15.7899 4.88155 15.3464 5.15492 15.0731L9.4098 10.8182L5.15492 6.5633L5.06507 6.45295C4.88597 6.18128 4.91584 5.81214 5.15492 5.57307C5.39399 5.33399 5.76313 5.30413 6.0348 5.48322L6.14515 5.57307L10.4 9.82795L14.6549 5.57307Z" fill="currentColor"/></svg>';
html=html.replaceAll('<!--__CLOSE__-->',()=>close).replace('<!--__BRAND_ABOUT__-->',()=>logo.replace('class="brand-icon"','class="about-logo"'));
html=html.replace('<!--__BRAND__-->',()=>logo).replace('</head>',`<link rel="icon" href="data:image/svg+xml;base64,${favicon}"></head>`);
await fs.writeFile(path.join(root,'dist/app.html'),html.replace('/*__STYLES__*/',[tokens,css,illustrationsCss].join('\n')).replace('/*__APP__*/',()=>js));
await build({entryPoints:[path.join(root,'src/backend/service.mjs')],outfile:path.join(root,'dist/backend.mjs'),bundle:true,format:'esm',platform:'node',logLevel:'warning'});
await build({entryPoints:[path.join(root,'src/cli.mjs')],outfile:path.join(root,'dist/cli.mjs'),bundle:true,format:'esm',platform:'node',external:['@modelcontextprotocol/*','zod'],logLevel:'warning'});
console.log('MineDesign host and editor theme adapters built.');

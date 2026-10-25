import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const root=path.resolve(import.meta.dirname,'..');
const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version;
const tokens=await fs.readFile(path.join(root,'assets/tokens.css'),'utf8');
const editorTheme=await fs.readFile(path.join(root,'assets/editor-theme.css'),'utf8');
for(const editor of ['design-editor','design-system-editor']){
  const file=path.join(root,'vendor/baocut/apps',editor,'dist/index.html');
  let html=await fs.readFile(file,'utf8');
  if(!html.includes('data-minedesign-theme'))html=html.replace('</head>',`<style data-minedesign-theme>${tokens}\n${editorTheme}</style><script>addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='minedesign:theme'&&['light','dark'].includes(e.data.theme)){document.documentElement.dataset.theme=e.data.theme;document.documentElement.dataset.mode=e.data.theme}})</script></head>`);
  await fs.writeFile(file,html);
}
await fs.mkdir(path.join(root,'dist'),{recursive:true});
await build({entryPoints:[path.join(root,'src/app.mjs')],outfile:path.join(root,'dist/app.js'),bundle:true,format:'esm',platform:'browser',legalComments:'inline',define:{__MDN_VERSION__:JSON.stringify(version)}});
const js=(await fs.readFile(path.join(root,'dist/app.js'),'utf8')).replaceAll('</script','<\\/script');
const css=await fs.readFile(path.join(root,'assets/app.css'),'utf8');
let html=await fs.readFile(path.join(root,'src/app.html'),'utf8');
const logo=(await fs.readFile(path.join(root,'assets/brand/minedesign-icon-selected.svg'),'utf8')).replace(/<!--[\s\S]*?-->/g,'').replace('role="img" aria-label="MineDesign"','aria-hidden="true" class="brand-icon"');
const favicon=Buffer.from(await fs.readFile(path.join(root,'assets/brand/favicon.svg'),'utf8')).toString('base64');
html=html.replace('<!--__BRAND__-->',()=>logo).replace('</head>',`<link rel="icon" href="data:image/svg+xml;base64,${favicon}"></head>`);
await fs.writeFile(path.join(root,'dist/app.html'),html.replace('/*__STYLES__*/',tokens+'\n'+css).replace('/*__APP__*/',()=>js));
await build({entryPoints:[path.join(root,'src/cli.mjs')],outfile:path.join(root,'dist/cli.mjs'),bundle:true,format:'esm',platform:'node',external:['@modelcontextprotocol/*','zod'],logLevel:'warning'});
console.log('MineDesign host and editor theme adapters built.');

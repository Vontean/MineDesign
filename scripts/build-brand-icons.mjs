import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const source=await readFile(new URL('assets/brand/minedesign-icon.svg',root),'utf8');
const notice='<!-- Generated from assets/brand/minedesign-icon.svg by scripts/build-brand-icons.mjs. -->\n';
const outer=source.match(/<path id="codex-outline"[^>]* d="([^"]+)"/)[1].match(/^.*?Z/)[0];
const brush=source.match(/<g id="brush"[\s\S]*?<\/g>/)[0].replace('fill="currentColor"','fill="black"');
const selected=`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="MineDesign"><defs><mask id="mdn-brush-cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24" style="mask-type:luminance"><rect width="24" height="24" fill="white"/>${brush}</mask></defs><path fill="currentColor" mask="url(#mdn-brush-cutout)" d="${outer}"/></svg>\n`;
await writeFile(new URL('assets/brand/minedesign-icon-selected.svg',root),notice+selected);
for(const [theme,color] of Object.entries({light:'#0d0d0d',dark:'#fafafa'})){
  await writeFile(new URL(`assets/brand/minedesign-icon-${theme}.svg`,root),notice+source.replace('fill="none" role=',`color="${color}" fill="none" role=`));
  await writeFile(new URL(`assets/brand/minedesign-icon-selected-${theme}.svg`,root),notice+selected.replace('viewBox="0 0 24 24"',`viewBox="0 0 24 24" color="${color}"`));
}
const favicon=source.replace('  <title','  <style>:root{color:#0d0d0d}@media(prefers-color-scheme:dark){:root{color:#fafafa}}</style>\n  <title');
await writeFile(new URL('assets/brand/favicon.svg',root),notice+favicon);
console.log('MDN default, selected and light/dark icons generated.');

const version=JSON.parse(await readFile(new URL("package.json",root),"utf8")).version;
await mkdir(new URL(`assets/brand/${version}/`,root),{recursive:true});
for(const name of ["minedesign-icon.svg","minedesign-icon-light.svg","minedesign-icon-dark.svg","minedesign-icon-selected.svg","favicon.svg"])await copyFile(new URL(`assets/brand/${name}`,root),new URL(`assets/brand/${version}/${name}`,root));

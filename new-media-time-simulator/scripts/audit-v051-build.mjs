import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const entryJs = html.match(/src="\.\/(assets\/index-[^"]+\.js)"/)?.[1];
const entryCss = html.match(/href="\.\/(assets\/index-[^"]+\.css)"/)?.[1];
if (!entryJs || !entryCss) throw new Error('Build must use relative hashed entry assets.');

const assets = await readdir(new URL('assets/', dist));
const sliceJs = assets.find((name) => /^V051VerticalSlice-.*\.js$/.test(name));
if (!sliceJs) throw new Error('V05.1 playable chunk is missing.');

const sizes = {
  entryJs: (await stat(new URL(entryJs, dist))).size,
  entryCss: (await stat(new URL(entryCss, dist))).size,
  sliceJs: (await stat(new URL(`assets/${sliceJs}`, dist))).size
};
const budgets = { entryJs: 170_000, entryCss: 9_000, sliceJs: 16_000 };
for (const key of Object.keys(budgets)) {
  if (sizes[key] > budgets[key]) throw new Error(`${key} ${sizes[key]} exceeds ${budgets[key]} bytes.`);
}

const sliceSource = await readFile(new URL(`assets/${sliceJs}`, dist), 'utf8');
for (const legacyLabel of ['NODE UNLOCKED', 'KNOWLEDGE ADDED', 'Blueprint as playable language']) {
  if (sliceSource.includes(legacyLabel)) throw new Error(`Legacy UI leaked into v05.1 chunk: ${legacyLabel}`);
}

console.log(`v05.1 build budgets passed: ${JSON.stringify(sizes)}`);

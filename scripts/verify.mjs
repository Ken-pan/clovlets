// SPDX-License-Identifier: MIT
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {root,verifyAsset,walk,scanText} from './catalog.mjs';
const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
const config=JSON.parse(await readFile(join(root,'gallery.json'),'utf8'));
if(manifest.assets.length!==config.expectedAssets||new Set(manifest.assets.map(a=>a.id)).size!==manifest.assets.length)throw new Error('Wrong or duplicate asset count');
for(const asset of manifest.assets)await verifyAsset(root,asset);
if(![config.hero,config.secondary].every(id=>manifest.assets.some(a=>a.id===id)))throw new Error('Missing hero artwork');
const files=(await walk(root)).filter(file=>! /^(?:node_modules|site|release|output|\.git)\//.test(file));
await scanText(root,files);
console.log(JSON.stringify({assets:manifest.assets.length,originals:'all SHA-256 hashes and PNG dimensions match',publicText:'scan passed'}));

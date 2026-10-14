// SPDX-License-Identifier: MIT
import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {root,verifyAsset,safePath} from '../scripts/catalog.mjs';
test('rejects traversal and alternate source paths',()=>{for(const path of ['../private.png','png/../../secret.png','/png/a.png','png/a.png:stream','https://example.org/a.png'])assert.throws(()=>safePath(path));});
test('modified originals and mismatched dimensions cannot pass release verification',async()=>{const asset=JSON.parse(await readFile(join(root,'manifest.json'),'utf8')).assets[0];const dir=await mkdtemp(join(tmpdir(),'open-artwork-'));try{await mkdir(join(dir,'png'));const bytes=await readFile(join(root,asset.file));await writeFile(join(dir,asset.file),bytes);await assert.rejects(verifyAsset(dir,{...asset,webp:undefined,width:asset.width+1}),/dimensions/);bytes[bytes.length-1]^=1;await writeFile(join(dir,asset.file),bytes);await assert.rejects(verifyAsset(dir,asset),/integrity/);}finally{await rm(dir,{recursive:true});}});

// SPDX-License-Identifier: MIT
import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import JSZip from 'jszip';
import {root,sourceEntries,existing,walk,scanText,sha256} from './catalog.mjs';
const info=JSON.parse(await readFile(join(root,'package.json'),'utf8')),release=join(root,'release'),stage=join(release,'source');await mkdir(release,{recursive:true});await rm(stage,{recursive:true,force:true});await mkdir(stage);
for(const entry of await existing(sourceEntries))await cp(join(root,entry),join(stage,entry),{recursive:true});
const files=await walk(stage);await scanText(stage,files);const zip=new JSZip(),hashes={};
for(const file of files){const bytes=await readFile(join(stage,file));hashes[file]={bytes:bytes.length,sha256:sha256(bytes)};zip.file(file,bytes,{date:new Date('2026-10-14T00:00:00Z'),compression:'STORE',unixPermissions:0o644});}
const manifest={name:info.name,version:info.version,files:hashes};await writeFile(join(release,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
zip.file('source-manifest.json',JSON.stringify(manifest,null,2)+'\n',{date:new Date('2026-10-14T00:00:00Z')});const name=info.name+'-v'+info.version+'.zip',bytes=await zip.generateAsync({type:'nodebuffer',platform:'UNIX',compression:'STORE'});await writeFile(join(release,name),bytes);await writeFile(join(release,'SHA256SUMS'),sha256(bytes)+'  '+name+'\n');console.log(JSON.stringify({archive:name,files:files.length,MB:+(bytes.length/1e6).toFixed(1),sha256:sha256(bytes)}));

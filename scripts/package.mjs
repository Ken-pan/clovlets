// SPDX-License-Identifier: MIT
import {cp,mkdir,mkdtemp,readFile,writeFile,rename,lstat} from 'node:fs/promises';import {join} from 'node:path';import JSZip from 'jszip';
import {root,sourceEntries,existing,walk,scanText,sha256,verifyCatalog} from './catalog.mjs';
await verifyCatalog();await scanText(root,await walk(root));
const info=JSON.parse(await readFile(join(root,'package.json'),'utf8')),release=join(root,'release');await mkdir(release,{recursive:true});if((await lstat(release)).isSymbolicLink())throw new Error('Release output cannot be a symlink');
const target=join(release,'v'+info.version);try{await lstat(target);throw new Error('Existing release preserved. Use a new version or review its existing artifacts.');}catch(error){if(error.code!=='ENOENT')throw error;}
const bundle=await mkdtemp(join(release,'.stage-')),stage=join(bundle,'source');await mkdir(stage);
for(const entry of await existing(sourceEntries))await cp(join(root,entry),join(stage,entry),{recursive:true,filter:path=>!path.endsWith('/.DS_Store')});
const files=await walk(stage);await scanText(stage,files);const zip=new JSZip(),hashes={};
for(const file of files){const bytes=await readFile(join(stage,file));hashes[file]={bytes:bytes.length,sha256:sha256(bytes)};zip.file(file,bytes,{date:new Date('2026-10-14T00:00:00Z'),compression:'STORE',unixPermissions:0o644});}
const manifest={name:info.name,version:info.version,files:hashes},text=JSON.stringify(manifest,null,2)+'\n';await writeFile(join(bundle,'source-manifest.json'),text);zip.file('source-manifest.json',text,{date:new Date('2026-10-14T00:00:00Z')});
const name=info.name+'-v'+info.version+'.zip',bytes=await zip.generateAsync({type:'nodebuffer',platform:'UNIX',compression:'STORE'});await writeFile(join(bundle,name),bytes);await writeFile(join(bundle,'SHA256SUMS'),sha256(bytes)+'  '+name+'\n');await rename(bundle,target);console.log(JSON.stringify({output:'release/v'+info.version,archive:name,files:files.length,MB:+(bytes.length/1e6).toFixed(1),sha256:sha256(bytes)}));

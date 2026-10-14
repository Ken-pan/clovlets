// SPDX-License-Identifier: MIT
export const SELECTION_LIMIT=24, BYTE_LIMIT=64_000_000;
export function selectionManifest(manifest,selected){return {...manifest,assets:selected.map(({webp,...asset})=>({...asset,preview:asset.file}))};}
export async function checkedFile(path,{expected,limit=2_000_000,fetcher=fetch}={}){
  const response=await fetcher(path,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('A collection file is unavailable.');
  const maximum=expected?.bytes??limit;if(Number(response.headers.get('content-length'))>maximum)throw new Error('A collection file exceeds its expected size.');
  if(!response.body)throw new Error('A collection file is empty.');const reader=response.body.getReader(),chunks=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum)throw new Error('A collection file exceeds its expected size.');chunks.push(value);}}finally{await reader.cancel();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  if(expected){const digest=await crypto.subtle.digest('SHA-256',bytes);const hash=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');if(size!==expected.bytes||hash!==expected.sha256)throw new Error('An original image failed its integrity check.');}
  return bytes;
}
export async function selectionZip({manifest,selected,JSZip,fetcher=fetch,onProgress=()=>{}}){
  if(!selected.length||selected.length>SELECTION_LIMIT||new Set(selected.map(a=>a.id)).size!==selected.length)throw new Error('Select 1–24 different images.');
  if(selected.some(a=>! /^(?:png)\/[a-z0-9-]+\.png$/.test(a.file)||a.file!=='png/'+a.id+'.png'||!Number.isSafeInteger(a.bytes)||a.bytes<1||! /^[a-f0-9]{64}$/.test(a.sha256))||selected.reduce((n,a)=>n+a.bytes,0)>BYTE_LIMIT)throw new Error('The selected originals exceed download limits.');
  if(typeof JSZip!=='function')throw new Error('ZIP downloads are unavailable.');const zip=new JSZip();
  for(const [index,asset] of selected.entries()){zip.file(asset.file,await checkedFile(asset.file,{expected:asset,fetcher}));onProgress(index+1,selected.length);}
  for(const file of ['LICENSE','LICENSE-CODE','ASSET_LICENSES.md'])zip.file(file,await checkedFile(file,{fetcher}));
  const records=JSON.parse(new TextDecoder().decode(await checkedFile('provenance/generation.json',{fetcher})));const ids=new Set(selected.map(a=>a.id));zip.file('provenance/generation.json',JSON.stringify({...records,assets:records.assets.filter(a=>ids.has(a.id))},null,2));
  zip.file('manifest.json',JSON.stringify(selectionManifest(manifest,selected),null,2));return zip.generateAsync({type:'blob',compression:'STORE'});
}

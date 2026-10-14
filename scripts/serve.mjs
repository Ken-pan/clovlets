// SPDX-License-Identifier: MIT
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const base=resolve(import.meta.dirname,'../site'),port=Number(process.env.PORT||4400);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const path=resolve(base,'.'+(pathname==='/'?'/index.html':pathname));if(!path.startsWith(base+sep)){res.writeHead(403);res.end();return;}const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log('Gallery: http://127.0.0.1:'+port));

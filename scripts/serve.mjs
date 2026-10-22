import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import handler from '../api/contact.js';
const root=path.resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const portArg=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portArg>=0?process.argv[portArg+1]:3000));
http.createServer(async(req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
 if(pathname.replace(/\/$/,'')==='/api/contact'){
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16000){res.writeHead(413);return res.end('{"error":"Request too large"}');}}
   req.body=raw;return handler(req,res);
 }
 let target=path.resolve(root,'.'+pathname);if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);return res.end('Forbidden');}
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 if(!fs.existsSync(target)){res.statusCode=404;target=path.join(root,'404.html');}
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');
 res.setHeader('X-Content-Type-Options','nosniff');fs.createReadStream(target).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log(`Local: http://localhost:${port}`));

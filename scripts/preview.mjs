import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../out');
const base='/muscat-amusement-park';
const port=Number(process.argv[2]||process.env.PORT||3108);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid preview port');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.woff':'font/woff','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.bin':'application/octet-stream'};
const server=createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'||pathname===base){res.writeHead(302,{Location:base+'/'});res.end();return;}
  if(!pathname.startsWith(base+'/')||pathname.includes('\\')||pathname.includes('\0')){res.writeHead(404);res.end();return;}
  const relative=pathname.slice(base.length+1);let target=path.resolve(root,relative);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let info=await stat(target);if(info.isDirectory()){target=path.join(target,'index.html');info=await stat(target);}
  if(!info.isFile())throw new Error('Not a file');
  const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  let start=0,end=info.size-1,status=200;
  if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
  headers['Content-Length']=String(Math.max(0,end-start+1));res.writeHead(status,headers);
  if(req.method==='HEAD'||info.size===0){res.end();return;}
  createReadStream(target,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch(error){if(!res.headersSent)res.writeHead(error instanceof URIError?400:404);res.end();}
});
server.listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}${base}/`));

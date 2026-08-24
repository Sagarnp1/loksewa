const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const pub=path.join(root,'public');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon'};
let PORT=Number(process.env.PORT)||8787;

// Web root is /public. Shared data lives in /data (served at /data/...).
function resolvePath(urlPath){
  let p=decodeURIComponent(urlPath.split('?')[0]);
  if(p==='/'||p==='') p='/index.html';
  if(p==='/public'||p==='/public/') p='/index.html';
  if(p.startsWith('/public/')) p=p.slice('/public'.length); // allow old /public/x links
  if(p.startsWith('/data/')) return path.join(root,p);       // ../data shared dir
  return path.join(pub,p);
}

function makeServer(){
  return http.createServer((req,res)=>{
    const fp=resolvePath(req.url);
    fs.readFile(fp,(e,d)=>{
      if(e){res.writeHead(404,{'Content-Type':'text/plain'});res.end('404 Not Found: '+req.url);return;}
      res.writeHead(200,{'Content-Type':mime[path.extname(fp)]||'application/octet-stream','Access-Control-Allow-Origin':'*'});
      res.end(d);
    });
  });
}

function listen(port,triesLeft){
  const srv=makeServer();
  srv.once('error',err=>{
    if(err.code==='EADDRINUSE'){
      if(triesLeft>0){ console.log(`Port ${port} व्यस्त छ — ${port+1} मा प्रयास गर्दै…`); listen(port+1,triesLeft-1); }
      else{
        console.error(`\nPort ${port} पहिले नै प्रयोगमा छ। सम्भवतः SagLok सर्भर पहिले नै चलिरहेको छ।`);
        console.error(`ब्राउजरमा हेर्नुहोस्: http://localhost:${PORT}`);
        console.error(`अर्को पोर्ट: PowerShell मा  $env:PORT=9090; node server.js\n`);
        process.exit(1);
      }
    }else{ console.error(err); process.exit(1); }
  });
  srv.listen(port,()=>{
    console.log(`\n✅ SagLok server चलिरहेको छ →  http://localhost:${port}`);
    console.log(`   ब्राउजरमा माथिको ठेगाना खोल्नुहोस् (index.html टाइप गर्नु पर्दैन)।\n`);
  });
}

listen(PORT,5);

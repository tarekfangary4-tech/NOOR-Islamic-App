const fs=require("fs"),esbuild=require("esbuild");
for(const f of ["index.html","manifest.json","service-worker.js","css/style.css","js/app.js"])if(!fs.existsSync(f))throw Error("Missing "+f);
fs.rmSync("www",{recursive:true,force:true});fs.mkdirSync("www",{recursive:true});
for(const f of ["index.html","manifest.json","service-worker.js"])fs.copyFileSync(f,"www/"+f);
fs.cpSync("css","www/css",{recursive:true});
if(fs.existsSync("assets"))fs.cpSync("assets","www/assets",{recursive:true});
fs.mkdirSync("www/js",{recursive:true});
esbuild.buildSync({entryPoints:["js/app.js"],bundle:true,format:"esm",platform:"browser",target:"es2020",outfile:"www/js/app.bundle.js"});
console.log("NOOR v2 ready");
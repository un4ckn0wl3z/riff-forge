// Real-browser QA with Playwright + Chromium: upload, repeats, bar map, overrides, preview, aligned exports.
// Run: npm run test:browser (needs the `playwright` package and its Chromium; skipped when unavailable).
import assert from'node:assert/strict';
import{createRequire}from'node:module';
import{createServer}from'node:http';
import{readFileSync,writeFileSync,mkdtempSync}from'node:fs';
import{tmpdir}from'node:os';
import{join,extname}from'node:path';
import * as a from'../dist/vendor/alphatab.js';
import{decodeWav}from'../dist/wav.js';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('SKIP: browser test needs `npm i -D playwright && npx playwright install chromium`');process.exit(0)}

const root=new URL('../dist/',import.meta.url),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.wav':'audio/wav','.txt':'text/plain'};
const server=createServer((req,res)=>{const path=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(/^\/+/,'')||'index.html';try{const body=readFileSync(new URL(path,root));res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream'});res.end(body)}catch(e){res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`;

// written 1 2 |: 3 4 :|1. 5 |2. 6 | 7 at 100 BPM → played 1 2 3 4 5 3 4 6 7
const tex='\\title "Browser Repeat" \\tempo 100 . :4 0.6 0.6 0.6 0.6 | 3.6 3.6 3.6 3.6 | \\ro 5.6 5.6 5.6 5.6 | 0.6 0.6 0.6 0.6 | \\ae 1 \\rc 2 3.6 3.6 3.6 3.6 | \\ae 2 5.6 5.6 5.6 5.6 | 0.6 0.6 0.6 0.6';
const dir=mkdtempSync(join(tmpdir(),'riff-forge-')),gp=join(dir,'repeat.gp');
writeFileSync(gp,new a.exporter.Gp7Exporter().export(a.importer.ScoreLoader.loadAlphaTex(tex)));

const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
try{
 const page=await browser.newPage({acceptDownloads:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const W=window.Worker;window.__blobWorkers=0;window.Worker=function(src,opts){if(String(src).startsWith('blob:'))window.__blobWorkers++;return new W(src,opts)}});
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('genres').children.length>0);
 const text=id=>page.textContent('#'+id),bars=()=>page.locator('.bm-bar').count();

 await page.setInputFiles('#file',gp);await page.waitForFunction(()=>!document.getElementById('generate').disabled);
 assert.match(await text('scoreNote'),/9 ห้อง.*เขียนไว้ 7 ห้อง/);assert.equal(await bars(),9);
 assert.deepEqual(await page.$$eval('.bm-bar small',els=>els.map(e=>e.textContent).filter(t=>t.startsWith('('))),['(3)','(4)','(6)','(7)'].map(t=>t),'played bars show their written number');
 await page.click('#repeatRow');assert.equal(await bars(),7);await page.click('#repeatRow');assert.equal(await bars(),9);

 // tap-tap selection syncs the From/To inputs
 await page.click('.bm-bar[data-n="6"]');await page.click('.bm-bar[data-n="8"]');
 assert.equal(await page.inputValue('#barFrom'),'6');assert.equal(await page.inputValue('#barTo'),'8');
 // section override on the selection
 await page.selectOption('#ovStyle','black');await page.click('#ovAdd');
 assert.equal(await page.locator('#ovList li').count(),1);assert.equal(await page.locator('.bm-bar.ov').count(),3);

 await page.click('#generate');await page.waitForSelector('.song-card');
 assert.match(await page.textContent('.song-card .details'),/Bar 6–8.*1 section override/);

 // preview runs on the worker clock with click + count-in
 const card=page.locator('.song-card').first();await card.locator('.listen-click').check();await card.locator('.count-in').check();
 await card.locator('.play-btn').click();await page.waitForTimeout(1500);
 assert.ok(await page.evaluate(()=>window.__blobWorkers)>=1,'preview scheduler uses a Worker tick');
 assert.equal(await page.evaluate(()=>document.getElementById('status').classList.contains('error')),false,await text('status'));
 await card.locator('.play-btn').click();

 const save=async(selector,part)=>{if(part)await card.locator('.export-part').selectOption(part);const[d]=await Promise.all([page.waitForEvent('download',{timeout:60000}),card.locator(selector).click()]);const f=join(dir,d.suggestedFilename());await d.saveAs(f);return readFileSync(f)};
 // aligned to song start (default): bar 6 begins at beat 20 = 12.0 s at 100 BPM
 const clickWav=decodeWav((b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))(await save('.wav-download','click')));
 const left=clickWav.samples.filter((_,i)=>i%2===0),onsets=[];let quiet=1e9;left.forEach((v,i)=>{if(Math.abs(v)>.05&&quiet>2000)onsets.push(i/44100);quiet=Math.abs(v)>.05?0:quiet+1});
 assert.equal(onsets.length,12,'3 bars of 4/4');onsets.forEach((t,i)=>assert.ok(Math.abs(t-(12+i*.6))<.002,`click ${i} at ${t.toFixed(4)} s`));
 const mid=await save('.download:not(.wav-download)','drums');let firstOn=Infinity;{let i=14;while(i<mid.length&&mid.toString('latin1',i,i+4)==='MTrk'){const end=i+8+mid.readUInt32BE(i+4);let p=i+8,tick=0;while(p<end){let v=0,c;do{c=mid[p++];v=v*128+(c&127)}while(c&128);tick+=v;const st=mid[p];if(st===255)p+=3+mid[p+2];else{if((st&0xf0)===0x90&&mid[p+2]>0)firstOn=Math.min(firstOn,tick);p+=3}}i=end}}
 assert.ok(firstOn>=20*960&&firstOn<20*960+60,`first drum note at tick ${firstOn}`);
 // selected-bar alignment starts the file at zero
 await page.selectOption('#exportAlign','range');const rangeWav=decodeWav((b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))(await save('.wav-download','click')));
 assert.ok(Math.abs(rangeWav.samples.length/2/44100-7.2)<0.6,'range export lasts about 3 bars');
 assert.deepEqual(errors,[]);
 console.log('PASS: real Chromium — GP upload with repeats/endings expanded, repeat toggle, bar-map tap selection, section override, generate, worker-clocked preview with click and count-in, click WAV aligned to song start within 2 ms, MIDI drums at the excerpt bar, range-aligned export.');
}finally{await browser.close();server.close()}

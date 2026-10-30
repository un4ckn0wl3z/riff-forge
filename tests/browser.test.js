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
 const page=await browser.newPage({acceptDownloads:true,locale:'th-TH'}),errors=[];
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
 // generate only the override bars: 2–3 and 6–8, silent in between
 await page.click('.bm-bar[data-n="2"]');await page.click('.bm-bar[data-n="3"]');await page.selectOption('#ovStyle','thrash');await page.click('#ovAdd');
 await page.selectOption('#rangeMode','overrides');assert.match(await text('rangeHint'),/2–3, 6–8/);
 await page.click('#generate');await page.waitForSelector('.song-card');assert.match(await page.textContent('.song-card .details'),/Bar 2–3, 6–8/);
 await page.selectOption('#exportAlign','song');
 const gapMid=await save('.download:not(.wav-download)','drums');const ons=[];{let i=14;while(i<gapMid.length&&gapMid.toString('latin1',i,i+4)==='MTrk'){const end=i+8+gapMid.readUInt32BE(i+4);let p=i+8,tick=0;while(p<end){let v=0,c;do{c=gapMid[p++];v=v*128+(c&127)}while(c&128);tick+=v;const st=gapMid[p];if(st===255)p+=3+gapMid[p+2];else{if((st&0xf0)===0x90&&gapMid[p+2]>0)ons.push(tick/960);p+=3}}i=end}}
 assert.ok(ons.length&&ons.every(b=>(b>=4&&b<12)||(b>=20&&b<32)),'drum notes only in bars 2–3 and 6–8');assert.ok(ons.some(b=>b<12)&&ons.some(b=>b>=20));
 // join the override bars: 2–3 then 6–8 back to back, 5 bars = 20 beats
 await page.selectOption('#rangeMode','joined');assert.match(await text('rangeHint'),/2–3 \+ 6–8 ต่อกัน 5 ห้อง/);
 await page.click('#generate');await page.waitForSelector('.song-card');assert.match(await page.textContent('.song-card .details'),/Bar 2–3 \+ 6–8 \(joined\)/);
 const joinMid=await save('.download:not(.wav-download)','drums'),jOns=[];{let i=14;while(i<joinMid.length&&joinMid.toString('latin1',i,i+4)==='MTrk'){const end=i+8+joinMid.readUInt32BE(i+4);let p=i+8,tick=0;while(p<end){let v=0,c;do{c=joinMid[p++];v=v*128+(c&127)}while(c&128);tick+=v;const st=joinMid[p];if(st===255)p+=3+joinMid[p+2];else{if((st&0xf0)===0x90&&joinMid[p+2]>0)jOns.push(tick/960);p+=3}}i=end}}
 assert.ok(jOns.length&&jOns.every(b=>b>=0&&b<20),'joined file is 5 bars long');assert.ok(jOns.some(b=>b<8)&&jOns.some(b=>b>=8),'both ranges present');
 assert.deepEqual(errors,[]);
 // English UI: walk the main flows in English and make sure no Thai text or label is left on the page
 const en=await browser.newPage({acceptDownloads:true,locale:'en-US'}),enErrors=[];en.on('pageerror',e=>enErrors.push(e.message));
 await en.goto(url);await en.waitForFunction(()=>document.getElementById('genres').children.length>0);
 const thaiLeft=()=>en.evaluate(()=>{const T=/[\u0E00-\u0E7F]/,out=new Set(),w=document.createTreeWalker(document.body,5);for(let n=w.currentNode;n;n=w.nextNode()){const el=n.nodeType===3?n.parentElement:n;if(!el||el.closest('script,style,noscript,[data-noi18n]'))continue;if(n.nodeType===3){if(T.test(n.data))out.add(n.data.trim())}else for(const a of['aria-label','placeholder','title','alt']){const v=n.getAttribute(a);if(v&&T.test(v))out.add(a+': '+v)}}return[...out]});
 assert.equal(await en.evaluate(()=>document.documentElement.lang),'en');
 const seen=new Set(),check=async()=>{for(const t of await thaiLeft())seen.add(t)};
 await check();await en.click('#helpBtn');await check();await en.click('#closeHelp');
 await en.setInputFiles('#file',gp);await en.waitForFunction(()=>!document.getElementById('generate').disabled);await check();
 assert.match(await en.textContent('#scoreNote'),/Following repeats \/ endings: 9 bars in playback order \(7 written\)/);
 await en.click('.bm-bar[data-n="2"]');await en.click('.bm-bar[data-n="3"]');await en.click('#ovAdd');await check();
 await en.selectOption('#rangeMode','overrides');await check();await en.selectOption('#rangeMode','joined');await check();
 await en.click('#generate');await en.waitForSelector('.song-card');await check();
 await en.click('#repeatRow');await check();
 assert.deepEqual([...seen],[],'Thai text left in English mode');
 await en.click('[data-lang="th"]');assert.match(await en.textContent('#scoreNote'),/อ่านตามลำดับห้องที่เขียน|มี repeat/);
 assert.deepEqual(enErrors,[]);
 console.log('PASS: real Chromium — GP upload with repeats/endings expanded, repeat toggle, bar-map tap selection, section override, generate, worker-clocked preview with click and count-in, click WAV aligned to song start within 2 ms, MIDI drums at the excerpt bar, range-aligned export, generate only override bars with silent gaps or joined, English UI with no Thai left and switch back to Thai.');
}finally{await browser.close();server.close()}

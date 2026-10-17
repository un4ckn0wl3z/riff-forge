import assert from'node:assert/strict';
import vm from'node:vm';
import{readFileSync}from'node:fs';
import{Window}from'happy-dom';
import * as alphaTab from'../dist/vendor/alphatab.js';
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const window=new Window({url:'http://localhost:8080',settings:{enableJavaScriptEvaluation:false,disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
window.document.write(html);const context=vm.createContext(window),$=id=>window.document.getElementById(id);
try{
 new vm.Script(readFileSync(new URL('../dist/boot.js',import.meta.url),'utf8')).runInContext(context);
 const script=window.document.querySelector('script[src^="app.bundle.js"]');assert.ok(script,'classic bootstrap must load the application bundle');
 new vm.Script(readFileSync(new URL('../dist/app.bundle.js',import.meta.url),'utf8')).runInContext(context);script.onload();
 assert.equal($('midiTarget').value,'gm');$('midiTarget').value='ezbass';
 $('demoBtn').click();assert.equal($('generate').disabled,false);assert.equal($('songName').textContent,'Forged in Fire');await $('generate').onclick();assert.equal(window.document.querySelectorAll('.song-card').length,3);assert.equal($('status').classList.contains('error'),false);
 $('barFrom').value='2';$('barTo').value='3';$('barTo').oninput();assert.equal(window.document.querySelectorAll('.song-card').length,0);await $('generate').onclick();assert.equal(window.document.querySelectorAll('.song-card').length,3);assert.ok(window.document.querySelector('.details').textContent.includes('Bar 2–3'));$('barFrom').value='7';$('barFrom').oninput();assert.equal($('generate').disabled,true);$('allBars').click();assert.equal($('barFrom').value,'1');assert.equal($('barTo').value,'8');assert.equal($('generate').disabled,false);
 let data;if(process.env.RIFF_FORGE_GP_FILE)data=readFileSync(process.env.RIFF_FORGE_GP_FILE);else{const score=alphaTab.importer.ScoreLoader.loadAlphaTex('\\title "Upload Test" \\tempo 127 . :8 0.6 0.6 3.6 0.6 0.6 5.6 3.6 1.6');data=new alphaTab.exporter.Gp7Exporter().export(score)}
 assert.equal($('file').accept,'','native picker must allow unknown GP MIME types');assert.equal($('file').hidden,false);
 for(const legacy of [false,true]){const file=new window.File([data],'test.gp');if(legacy)Object.defineProperty(file,'arrayBuffer',{value:undefined});await $('file').onchange({target:{files:[file]}});assert.equal($('status').classList.contains('error'),false,$('status').textContent);assert.equal($('generate').disabled,false);await $('generate').onclick();assert.equal(window.document.querySelectorAll('.song-card').length,3);assert.equal($('status').classList.contains('error'),false,$('status').textContent)}
 console.log('PASS: classic bootstrap, production bundle, Demo, Generate, native file picker, GP upload and FileReader fallback in a browser-like DOM.');
}finally{await window.happyDOM.abort()}

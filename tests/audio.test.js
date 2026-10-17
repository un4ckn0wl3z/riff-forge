import assert from 'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import{decodeWav,encodeWav}from'../dist/wav.js';
import{renderWav}from'../dist/render-wav.js';
import{demo,generate,tempoMap,secondsAt}from'../dist/engine.js';
import{DRUM_NOTES}from'../dist/kit.js';
const kit={};
for(const n of [...DRUM_NOTES,...[28,33,38,43,48,53].map(n=>'bass-'+n)]){const file=readFileSync(new URL(`../dist/samples/${n}.wav`,import.meta.url));kit[n]=decodeWav(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength));const s=kit[n];assert.equal(s.rate,44100);assert.equal(s.channels,2);let peak=0,energy=0;for(const x of s.samples){assert.ok(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));energy+=x*x}assert.ok(peak>.05&&peak<1,'sample must be audible and unclipped');assert.ok(energy>1)}
const song=demo(),opt={style:'metalcore',density:70,complexity:70,follow:85,humanize:25,fills:4,doubleKick:true},result=generate(song,opt,123);
const chunks=[];let progress=0;for(const c of renderWav(song,result,null,kit)){if(c.header)chunks.push(new Uint8Array(c.header));if(c.data)chunks.push(new Uint8Array(c.data));if(c.progress!==undefined){assert.ok(c.progress>=progress);progress=c.progress}}assert.equal(progress,1);const total=chunks.reduce((n,c)=>n+c.length,0),wav=new Uint8Array(total);let p=0;for(const c of chunks){wav.set(c,p);p+=c.length}const decoded=decodeWav(wav.buffer);assert.ok(decoded.samples.length/2/44100>=secondsAt(song.length,tempoMap(song,null)));assert.ok(decoded.samples.some(x=>Math.abs(x)>.1));assert.ok(decoded.samples.every(Number.isFinite));writeFileSync('/tmp/riff-forge-audio-test.wav',wav);
// Empty input remains silent, and a lone kick starts at the expected sample frame.
const single={...song,length:2,bars:[{...song.bars[0],length:2,hits:[]}]};const pieces=[...renderWav(single,{events:[{beat:1,note:36,velocity:127}]},120,kit)];const data=pieces.filter(c=>c.data).map(c=>new Int16Array(c.data));assert.ok(data[0].slice(0,44100).every(x=>x===0));assert.ok(data[0].slice(44100).some(x=>x!==0));
const tooLong={...song,length:2000};assert.throws(()=>[...renderWav(tooLong,{events:[]},60,kit)],/10/);
assert.equal(decodeWav(encodeWav(new Float32Array([0,.5,-.5,0]),44100,2)).samples.length,4);
console.log('PASS: ten audible drum samples, stereo PCM format, full arrangement WAV, no non-finite audio, onset timing, progress and duration limit.');

import assert from'node:assert/strict';
import{demo,generate,midi}from'../dist/engine.js';
import{renderWav}from'../dist/render-wav.js';
import{decodeWav}from'../dist/wav.js';
import{readFileSync}from'node:fs';
const song=demo(),opt={style:'djent',density:70,complexity:70,follow:85,humanize:0,fills:4,doubleKick:true,bassEnabled:true,bassMode:'auto'},r=generate(song,opt,88,0);
assert.ok(r.bassEvents.length);for(const n of r.bassEvents){assert.ok(n.note>=23&&n.note<=59);assert.ok(n.beat>=0&&n.beat<song.length);assert.ok(n.duration>0);assert.ok(n.velocity>0&&n.velocity<128)}assert.equal(r.bassEvents[0].note,28);assert.equal(r.bassEvents[1].beat,.5);assert.notDeepEqual(r.bassEvents,generate(song,opt,88,1).bassEvents);assert.deepEqual(generate(song,{...opt,bassEnabled:false},88).bassEvents,[]);
const rested=structuredClone(song);rested.bars[0].hits=[];assert.ok(generate(rested,opt,88).bassEvents.every(n=>n.beat>=4));const low=structuredClone(song);low.bars[0].hits[0].pitches=[35,42,47];assert.equal(generate(low,opt,88).bassEvents[0].note,23);
const dv=b=>new DataView(b.buffer,b.byteOffset,b.byteLength);assert.equal(dv(midi(song,r,null,'mix')).getUint16(10),3);assert.equal(dv(midi(song,r,null,'bass')).getUint16(10),2);assert.equal(dv(midi(song,r,null,'drums')).getUint16(10),2);
const kit={};for(const note of [28,33,38,43,48,53]){const bytes=readFileSync(new URL(`../dist/samples/bass-${note}.wav`,import.meta.url));kit['bass-'+note]=decodeWav(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength))}
const chunks=[...renderWav(song,r,null,kit,'bass')];let energy=0;for(const c of chunks)if(c.data)for(const value of new Int16Array(c.data)){assert.ok(Number.isFinite(value));energy+=value*value}assert.ok(energy>1e8);console.log('PASS: riff-derived bass roots, low B support, rests, three approaches, MIDI stems and audible bass-only WAV.');

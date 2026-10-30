import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
import * as a from'../dist/vendor/alphatab.js';
import{analyze,playbackOrder,generate,clickEvents,optionsForBar,midi,demo,tempoMap,secondsAt,PPQ}from'../dist/engine.js';
import{selectBars,padToSongStart,onlyBars,joinBars}from'../dist/range.js';
import{renderWav}from'../dist/render-wav.js';
import{decodeWav}from'../dist/wav.js';
import{DRUM_NOTES}from'../dist/kit.js';

// Repeats + alternate endings: written 1 2 |: 3 4 :|1. 5 |2. 6 | 7 (tempo 140 from bar 7) plays 1 2 3 4 5 3 4 6 7
const tex='\\title "Repeat Riff" \\tempo 100 . :4 0.6 0.6 0.6 0.6 | 3.6 3.6 3.6 3.6 | \\ro 5.6 5.6 5.6 5.6 | 0.6 0.6 0.6 0.6 | \\ae 1 \\rc 2 3.6 3.6 3.6 3.6 | \\ae 2 5.6 5.6 5.6 5.6 | \\tempo 140 \\ts 7 8 :8 0.6 0.6 0.6 0.6 0.6 0.6 0.6';
const score=a.importer.ScoreLoader.loadScoreFromBytes(new a.exporter.Gp7Exporter().export(a.importer.ScoreLoader.loadAlphaTex(tex)),new a.Settings());
const order=playbackOrder(score,a);
assert.deepEqual(order.map(o=>o.index+1),[1,2,3,4,5,3,4,6,7]);
const played=analyze(score,0,order),written=analyze(score,0);
assert.equal(written.bars.length,7);assert.equal(written.hasRepeats,true);assert.equal(written.expanded,false);
assert.equal(played.bars.length,9);assert.equal(played.expanded,true);assert.equal(played.hasRepeats,false);assert.equal(played.writtenBars,7);
assert.deepEqual(played.bars.map(b=>b.written),[1,2,3,4,5,3,4,6,7]);assert.deepEqual(played.bars.map(b=>b.index),[0,1,2,3,4,5,6,7,8]);
assert.equal(played.bars[5].hits[0].pitches[0],played.bars[2].hits[0].pitches[0],'a repeated bar carries the notes of its written bar');
assert.equal(played.length,8*4+3.5);
assert.deepEqual(tempoMap(played,null).map(t=>t.bpm),[100,140]);assert.equal(tempoMap(played,null)[1].beat,32);
assert.equal(playbackOrder(a.importer.ScoreLoader.loadAlphaTex('\\tempo 90 . :4 0.6 0.6 0.6 0.6 | 0.6 0.6 0.6 0.6'),a),null,'no repeats keeps written order');
// a range over the expanded song uses played bar numbers
const clip=selectBars(played,6,8);assert.equal(clip.bars[0].written,3);assert.equal(clip.sourceStartBeat,20);

// Section overrides: bars 3–4 use black metal (snare on every off-sixteenth), the rest metalcore
const d=demo(),base={style:'metalcore',density:70,complexity:55,follow:85,humanize:0,fills:0,doubleKick:false,bassEnabled:false};
const ov={...base,overrides:[{from:3,to:4,options:{style:'black',density:90,complexity:55,follow:85,doubleKick:true}}]};
assert.equal(optionsForBar(ov,d.bars[2]).style,'black');assert.equal(optionsForBar(ov,d.bars[4]).style,'metalcore');
const r=generate(d,ov,7),offSnare=e=>e.note===38&&Math.abs((e.beat%1)-.25)<1e-6;
assert.ok(r.events.some(e=>offSnare(e)&&e.beat>=8&&e.beat<16),'override bars get black metal snares');
assert.ok(!r.events.some(e=>offSnare(e)&&(e.beat<8||e.beat>=16)),'other bars keep the base style');
// overrides follow full-song bar numbers inside an excerpt
const part=selectBars(d,3,3),rp=generate(part,ov,7);assert.ok(rp.events.some(offSnare));
assert.deepEqual(generate(d,base,7).events,generate(d,{...base,overrides:[]},7).events,'no overrides leaves output unchanged');

// Click track
assert.equal(clickEvents(d).length,32);assert.equal(clickEvents(d).filter(e=>e.accent).length,8);
assert.deepEqual(clickEvents({bars:[{start:0,length:3,numerator:6,denominator:8}]}).map(e=>e.beat),[0,1.5]);
assert.equal(clickEvents({bars:[{start:0,length:3.5,numerator:7,denominator:8}]}).length,7);
assert.equal(clickEvents({bars:[{start:0,length:3,numerator:6,denominator:8}]},{compound:false}).length,6);

// Export aligned to song start: excerpt bars 5–6 placed at beat 16 with the full tempo map before it
const src=demo();src.bars[2].tempos=[{at:0,bpm:120}];
const ex=selectBars(src,5,6),res=generate(ex,{...base,bassEnabled:true},3);
const padded=padToSongStart(src,ex,{...res,clickEvents:clickEvents(ex)});
assert.equal(padded.song.length,24);assert.equal(padded.result.events[0].beat,res.events[0].beat+16);assert.equal(padded.result.clickEvents[0].beat,16);
assert.equal(padded.result.clickEvents.length,8,'click stays limited to the excerpt');
assert.deepEqual(tempoMap(padded.song,null),[{beat:0,bpm:156},{beat:8,bpm:120}]);
assert.equal(padToSongStart(src,selectBars(src,1,2),res).song.paddedFrom,undefined,'excerpt from bar 1 needs no padding');
const notesOf=(bytes,status)=>{let n=0;for(let i=0;i<bytes.length-2;i++)if(bytes[i]===status&&(bytes[i+1]===76||bytes[i+1]===77))n++;return n};
const clickMidi=midi(padded.song,padded.result,null,'click');assert.equal(notesOf(clickMidi,0x99),8);
const mixMidi=midi(ex,{...res,clickEvents:clickEvents(ex)},null,'mix');assert.equal(notesOf(mixMidi,0x99),0,'plain mix has no click');
const mixClick=midi(ex,{...res,clickEvents:clickEvents(ex)},null,'mixclick');assert.equal(notesOf(mixClick,0x99),8);
// first drum note of the padded MIDI sits at the excerpt start in ticks
const firstNoteTick=bytes=>{let i=14,tick=0,best=Infinity;while(i<bytes.length){if(String.fromCharCode(...bytes.slice(i,i+4))!=='MTrk')break;const len=(bytes[i+4]<<24|bytes[i+5]<<16|bytes[i+6]<<8|bytes[i+7])>>>0;let p=i+8;tick=0;const end=p+len;while(p<end){let v=0,c;do{c=bytes[p++];v=v*128+(c&127)}while(c&128);tick+=v;const st=bytes[p];if(st===255){const l=bytes[p+2];p+=3+l}else{if((st&0xf0)===0x90&&bytes[p+2]>0)best=Math.min(best,tick);p+=3}}i=end}return best};
assert.equal(firstNoteTick(midi(padded.song,padded.result,null,'drums')),Math.round(padded.result.events[0].beat*PPQ));

// Click WAV: onsets land on the beat grid of the tempo map
const kit={};for(const n of DRUM_NOTES){const f=readFileSync(new URL(`../dist/samples/${n}.wav`,import.meta.url));kit[n]=decodeWav(f.buffer.slice(f.byteOffset,f.byteOffset+f.byteLength))}
const wavSong=selectBars(src,1,4),map=tempoMap(wavSong,null),pcm=[];
for(const c of renderWav(wavSong,{events:[],bassEvents:[],clickEvents:clickEvents(wavSong)},null,kit,'click'))if(c.data)pcm.push(...new Int16Array(c.data).filter((_,i)=>i%2===0));
const onsets=[];let quiet=1e9;pcm.forEach((v,i)=>{if(Math.abs(v)>1500&&quiet>2000)onsets.push(i);quiet=Math.abs(v)>1500?0:quiet+1});
const expected=clickEvents(wavSong).map(e=>Math.round(secondsAt(e.beat,map)*44100));
assert.equal(onsets.length,expected.length);onsets.forEach((f,i)=>assert.ok(Math.abs(f-expected[i])<=3,`click ${i} at frame ${f}, expected ${expected[i]}`));

// Generate only the override bars: bars 2–3 and 6–7 of an excerpt 2–7, bars 4–5 stay silent
const ob=demo(),obClip=selectBars(ob,2,7),obOpt={...base,bassEnabled:true,bassMode:'drive',overrides:[{from:2,to:3,options:{style:'thrash'}},{from:6,to:7,options:{style:'black'}}]};
const full=generate(obClip,obOpt,11),only=onlyBars(obClip,full,[[2,3],[6,7]]);
const barNo=e=>obClip.bars.find(b=>e.beat>=b.start&&e.beat<b.start+b.length).sourceIndex+1;
assert.ok(only.events.length&&only.bassEvents.length);
assert.ok(only.events.every(e=>[2,3,6,7].includes(barNo(e))),'drums only in the chosen bars');
assert.ok(only.bassEvents.every(e=>[2,3,6,7].includes(barNo(e))),'bass only in the chosen bars');
assert.ok(only.bassEvents.every(e=>{const b=obClip.bars.find(x=>e.beat>=x.start&&e.beat<x.start+x.length);return e.beat+e.duration<=b.start+b.length+1e-9}),'bass does not ring into a skipped bar');
assert.deepEqual(only.events,full.events.filter(e=>[2,3,6,7].includes(barNo(e))),'kept bars are unchanged');
assert.deepEqual(only.onlyBars,[[2,3],[6,7]]);assert.equal(onlyBars(obClip,full,null),full);
const obPad=padToSongStart(ob,obClip,only);assert.equal(Math.min(...obPad.result.events.map(e=>e.beat)),4,'aligned export keeps bar 2 at beat 4');

// Join override bars back to back: bars 1–2 then 5–6, bars 3–4 removed
const js=demo();js.bars[2].tempos=[{at:0,bpm:120}];
const joined=joinBars(js,[[1,2],[5,6]]);
assert.equal(joined.bars.length,4);assert.equal(joined.length,16);
assert.deepEqual(joined.bars.map(b=>b.start),[0,4,8,12]);assert.deepEqual(joined.bars.map(b=>b.index),[0,1,2,3]);assert.deepEqual(joined.bars.map(b=>b.sourceIndex),[0,1,4,5]);
assert.deepEqual(tempoMap(joined,null),[{beat:0,bpm:156},{beat:8,bpm:120}],'each joined range starts at its own song tempo');
assert.deepEqual(joined.joined,[[1,2],[5,6]]);assert.equal(joined.rangeStart,1);assert.equal(joined.rangeEnd,6);
const jr=generate(joined,{...base,bassEnabled:true,overrides:[{from:5,to:6,options:{style:'black'}}]},5);
assert.ok(jr.events.every(e=>e.beat>=0&&e.beat<16));assert.ok(jr.bassEvents.every(e=>e.beat<16));
assert.ok(jr.events.some(e=>offSnare(e)&&e.beat>=8),'overrides follow the original bar numbers after joining');assert.ok(!jr.events.some(e=>offSnare(e)&&e.beat<8));
const jm=midi(joined,jr,null,'drums');let tempos=0;for(let i=0;i<jm.length-2;i++)if(jm[i]===255&&jm[i+1]===81)tempos++;assert.equal(tempos,2);
assert.throws(()=>joinBars(js,[[3,2]]));assert.deepEqual(joinBars(js,[[2,4]]).bars.map(b=>b.start),selectBars(js,2,4).bars.map(b=>b.start),'one range equals a plain excerpt');

console.log('PASS: repeat/ending playback order with written bar numbers and tempo, ranges over played bars, per-section style overrides, click track events, song-start aligned export, click MIDI/WAV stems with sample-accurate onsets, generate only selected override bars with silent gaps or joined back to back.');

import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import * as a from '../dist/vendor/alphatab.js';
import {analyze,demo,generate,midi,STYLES,tempoMap,secondsAt} from '../dist/engine.js';
import {zip} from '../dist/archive.js';
const opt={style:'metalcore',density:70,complexity:55,follow:100,humanize:0,fills:4,doubleKick:true};
const sample=a.importer.ScoreLoader.loadAlphaTex('\\title "Test Riff" \\tempo 156 . :8 0.6 0.6 3.6 0.6 0.6 5.6 3.6 1.6 | :4 0.6 3.6 5.6 1.6');
const gp=new a.exporter.Gp7Exporter().export(sample);
const parsed=a.importer.ScoreLoader.loadScoreFromBytes(gp,new a.Settings());
const song=analyze(parsed);
assert.equal(song.bars.length,2);assert.equal(song.bpm,156);assert.equal(song.length,8);assert.equal(song.bars[0].hits.length,8);assert.equal(song.bars[0].hits[1].t,.5);assert.equal(song.bars[0].hits[0].pitches[0],40);
writeFileSync('/tmp/riff-forge-test.gp',gp);
const d=demo();const v=generate(d,opt,123,0);assert.deepEqual(v,generate(d,opt,123,0));assert.notDeepEqual(v.events,generate(d,opt,124,0).events);assert.notDeepEqual(v.events,generate(d,opt,123,1).events);
for(const style of Object.keys(STYLES)){const r=generate(d,{...opt,style},333,2);assert.ok(r.events.some(e=>e.note===36));assert.ok(r.events.some(e=>e.note===38));for(const e of r.events){assert.ok(e.beat>=0&&e.beat<d.length);assert.ok(e.velocity>0&&e.velocity<=127)}}
const silent=structuredClone(d);silent.bars.forEach(b=>b.hits=[]);const follow=generate(d,{...opt,density:0,doubleKick:false},80);const noFollow=generate(d,{...opt,follow:0,density:0,doubleKick:false},80);assert.notDeepEqual(follow.events.filter(e=>e.note===36),noFollow.events.filter(e=>e.note===36));
// Verify custom meters, tuplets, tempo events and ties survive the real GP parser.
const odd=a.importer.ScoreLoader.loadAlphaTex('\\tempo 120 . \\ts 7 8 :8 0.6 0.6 3.6 0.6 0.6 5.6 3.6 | \\ts 4 4 :4 0.6 3.6 5.6 1.6');
const oddSong=analyze(a.importer.ScoreLoader.loadScoreFromBytes(new a.exporter.Gp7Exporter().export(odd),new a.Settings()));assert.equal(oddSong.bars[0].length,3.5);assert.equal(oddSong.bars[1].start,3.5);assert.equal(oddSong.length,7.5);
const mapped=structuredClone(oddSong);mapped.bars[1].tempos=[{at:0,bpm:60}];assert.equal(secondsAt(7.5,tempoMap(mapped,null)),5.75);assert.equal(secondsAt(7.5,tempoMap(mapped,120)),3.75);
function parseMidi(bytes){const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);assert.equal(new TextDecoder().decode(bytes.slice(0,4)),'MThd');assert.equal(dv.getUint16(8),1);assert.ok([2,3].includes(dv.getUint16(10)));assert.equal(dv.getUint16(12),960);let p=14;const tracks=[];while(p<bytes.length){assert.equal(new TextDecoder().decode(bytes.slice(p,p+4)),'MTrk');const end=p+8+dv.getUint32(p+4);p+=8;let tick=0,events=[];const variable=()=>{let n=0,b;do{b=bytes[p++];n=n*128+(b&127)}while(b&128);return n};while(p<end){tick+=variable();const status=bytes[p++];if(status===255){const type=bytes[p++],len=variable();events.push({tick,type,data:bytes.slice(p,p+len)});p+=len}else{if(status===0xc0){events.push({tick,status,program:bytes[p++]});continue}assert.ok([0x99,0x89,0x90,0x80].includes(status));const note=bytes[p++],velocity=bytes[p++];assert.ok(note<128&&velocity<128);events.push({tick,status,note,velocity})}}assert.equal(p,end);tracks.push(events)}return tracks}
const bytes=midi(mapped,generate(mapped,opt,99),null),tracks=parseMidi(bytes);assert.equal(tracks[0].filter(e=>e.type===81).length,2);assert.equal(tracks[0].filter(e=>e.type===88).length,2);assert.equal(tracks[1].at(-1).tick,7200);assert.equal(tracks[1].filter(e=>e.status===0x99).length,tracks[1].filter(e=>e.status===0x89).length);writeFileSync('/tmp/riff-forge-test.mid',bytes);
const huge=demo();huge.bars=Array.from({length:512},(_,i)=>({...huge.bars[i%8],index:i,start:i*4}));huge.length=2048;const large=midi(huge,generate(huge,{...opt,style:'death',density:100},99),null);parseMidi(large);
const archive=zip([{name:'ทดสอบ.mid',data:bytes},{name:'second.mid',data:large}]);writeFileSync('/tmp/riff-forge-test.zip',new Uint8Array(await archive.arrayBuffer()));
console.log('PASS: GP7 import/export, riff note timing, deterministic generation, six styles, riff following, odd meter, tempo map, MIDI events, 512-bar export, ZIP generation.');

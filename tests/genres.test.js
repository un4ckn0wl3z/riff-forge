import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
import * as a from'../dist/vendor/alphatab.js';
import{analyze,demo,generate,midi,STYLES,FAMILIES,swingTime}from'../dist/engine.js';
import{BASS_MODES}from'../dist/bass.js';
import{renderWav}from'../dist/render-wav.js';
import{decodeWav}from'../dist/wav.js';
import{DRUM_NOTES}from'../dist/kit.js';
const d=demo(),frac=t=>Math.round((t%1)*1000)/1000,inBar=(song,e)=>song.bars.find(b=>e.beat>=b.start-1e-9&&e.beat<b.start+b.length);
const opt=(style,extra={})=>({style,...STYLES[style].defaults,follow:85,humanize:0,fills:0,bassEnabled:true,bassMode:'auto',...extra});
const grooves=Object.keys(STYLES).filter(id=>STYLES[id].family!=='metal');

// Every genre belongs to a family, has starting settings and only uses notes we ship samples for.
assert.deepEqual(FAMILIES.map(f=>f.id),['metal','rock','groove','swing','other']);
assert.equal(grooves.length,10);
for(const [id,s]of Object.entries(STYLES)){assert.ok(FAMILIES.some(f=>f.id===s.family),id);assert.ok(s.defaults&&s.defaults.density>=0&&s.defaults.complexity>=0,id)}
for(const id of grooves)for(const v of [0,1,2])for(const fills of [0,4]){const o=opt(id,{fills,humanize:25}),r=generate(d,o,77,v);
 assert.deepEqual(r,generate(d,o,77,v),id+' deterministic');assert.ok(r.events.length>20,id);
 for(const e of r.events){assert.ok(DRUM_NOTES.includes(e.note),id+' note '+e.note);assert.ok(e.beat>=0&&e.beat<d.length);assert.ok(e.velocity>=25&&e.velocity<=127)}
 assert.ok(r.bassEvents.length,id+' bass');for(const n of r.bassEvents){assert.ok(n.note>=23&&n.note<=59,id+' bass range '+n.note);assert.ok(n.duration>0&&n.beat>=0&&n.beat<d.length)}}

// Backbeats: rock and groove genres hit the snare on 2 and 4; half-time and one drop land on 3 only.
const backbeat=(r,note=38)=>[...new Set(r.events.filter(e=>e.note===note&&e.velocity>90).map(e=>frac(e.beat-Math.floor(e.beat/4)*4+0)+Math.floor(e.beat%4)))].sort();
for(const id of ['hardrock','classicrock','poprock','punk','funk','rnb'])assert.deepEqual(backbeat(generate(d,opt(id),3,0)),[1,3],id);
assert.deepEqual(backbeat(generate(d,opt('ballad',{density:60}),3,1)),[2]);
const drop=generate(d,opt('reggae'),3,0);assert.deepEqual(backbeat(drop,37),[2]);assert.ok(drop.events.filter(e=>e.note===36).every(e=>e.beat%4===2),'one drop: kick only on 3');
assert.ok(!generate(d,opt('reggae'),3,2).events.some(e=>e.note===38&&e.velocity>90),'steppers keep the cross-stick');assert.deepEqual([...new Set(generate(d,opt('reggae'),3,2).events.filter(e=>e.note===36).map(e=>e.beat%1))],[0],'steppers: four on the floor');
assert.ok(!generate(d,opt('ballad',{density:30}),3,0).events.some(e=>e.note===38&&e.velocity>90),'quiet ballad: no full snare');assert.ok(generate(d,opt('ballad',{density:30}),3,0).events.some(e=>e.note===37),'quiet ballad uses cross-stick');
// Punk's second take is the skank beat: kick on the beat, snare on every off-beat eighth.
const skank=generate(d,opt('punk',{follow:0}),3,1);assert.ok(skank.events.filter(e=>e.note===38&&e.velocity>90).every(e=>frac(e.beat)===.5));assert.ok(skank.events.filter(e=>e.note===36).every(e=>frac(e.beat)===0));
// Funk: sixteenth hats and quiet ghost notes; no ghosts when complexity is zero.
const funk=generate(d,opt('funk'),9,0);assert.ok(funk.events.some(e=>e.note===42&&[.25,.75].includes(frac(e.beat))));assert.ok(funk.events.filter(e=>e.note===38&&e.velocity<50).length>=3);
assert.ok(!generate(d,opt('funk',{complexity:0}),9,0).events.some(e=>e.note===38&&e.velocity<50));
// Swing genres: off-beat eighths move to the last triplet for drums and bass.
assert.equal(swingTime(.5,'eighth'),2/3);assert.equal(swingTime(.25,'eighth'),1/3);assert.equal(swingTime(1.5,'eighth'),1+2/3);assert.equal(swingTime(.25,'sixteenth'),1/3);assert.ok(Math.abs(swingTime(.75,'sixteenth')-5/6)<1e-12);assert.equal(swingTime(.5,''),.5);
for(const id of ['shuffle','rocknroll']){const r=generate(d,opt(id),4,0),offs=r.events.filter(e=>[42,51].includes(e.note)).map(e=>frac(e.beat));assert.ok(offs.includes(.667),id);assert.ok(!offs.includes(.5),id);
 assert.ok(r.bassEvents.every(n=>[0,.667].includes(frac(n.beat))),id+' bass swings');}
const flat=structuredClone(d);for(const b of flat.bars)for(const h of b.hits)h.pitches=[40];
const boogie=generate(flat,opt('shuffle',{complexity:30}),4,0).bassEvents.slice(0,4);assert.deepEqual(generate(flat,opt('shuffle',{complexity:80}),4,0).bassEvents.slice(0,8).map(n=>n.note-28),[0,7,9,10,12,10,9,7]);assert.deepEqual(boogie.map(n=>n.note-boogie[0].note),[0,7,9,7]);
// Bass approaches: every mode works with every genre and stays in range.
for(const bassMode of BASS_MODES)for(const id of ['metalcore','funk','shuffle','reggae']){const b=generate(d,opt(id,{bassMode}),5,1).bassEvents;assert.ok(b.length,bassMode+' '+id);assert.ok(b.every(n=>n.mode===bassMode&&n.note>=23&&n.note<=59))}
assert.ok(generate(d,opt('reggae',{bassMode:'onedrop'}),5,0).bassEvents.every(n=>n.beat%4!==0),'one drop bass leaves beat 1 empty');
const held=generate(d,opt('ballad',{bassMode:'sustain',complexity:20}),5,0).bassEvents;assert.ok(held.length<=d.bars.length*2&&held.some(n=>n.duration>=2),'long held notes');
// Odd meters: 3/4, 6/8 and 7/8 bars stay inside the bar; 6/8 backbeat lands on the dotted-quarter pulse.
const meters=structuredClone(d);meters.bars=[[3,4],[6,8],[7,8],[4,4]].map(([n,dn],i,all)=>{const length=n*4/dn,start=all.slice(0,i).reduce((s,[a,b])=>s+a*4/b,0);return{...structuredClone(d.bars[0]),index:i,start,length,numerator:n,denominator:dn,section:'',hits:d.bars[0].hits.filter(h=>h.t<length)}});meters.length=meters.bars.reduce((s,b)=>s+b.length,0);
for(const id of grooves)for(const v of [0,1,2]){const r=generate(meters,opt(id,{fills:2}),11,v);for(const e of [...r.events,...r.bassEvents])assert.ok(inBar(meters,e),id+' '+e.beat)}
const six=generate(meters,opt('hardrock',{follow:0}),11,0).events.filter(e=>e.note===38&&e.velocity>90&&e.beat>=3&&e.beat<6).map(e=>e.beat-3);assert.deepEqual(six,[1.5]);
// Triplet feel written in Guitar Pro swings metal too, without changing the riff timing the parser reports.
const score=a.importer.ScoreLoader.loadAlphaTex('\\tempo 120 . :8 0.6 0.6 3.6 0.6 0.6 5.6 3.6 1.6 | :8 0.6 0.6 3.6 0.6 0.6 5.6 3.6 1.6');score.masterBars[0].tripletFeel=a.model.TripletFeel.Triplet8th;
const swung=analyze(a.importer.ScoreLoader.loadScoreFromBytes(new a.exporter.Gp7Exporter().export(score),new a.Settings()));assert.equal(swung.bars[0].swing,'eighth');assert.equal(swung.bars[1].swing,'');assert.equal(swung.bars[0].hits[1].t,.5);
const sm=generate(swung,{style:'metal',density:0,complexity:0,follow:100,humanize:0,fills:0,doubleKick:false,bassEnabled:true,bassMode:'riff'},2,0);
assert.ok(sm.events.filter(e=>e.beat<4&&[36,42].includes(e.note)).every(e=>[0,.667].includes(frac(e.beat))),'bar 1 swings');assert.ok(sm.events.some(e=>e.beat>=4&&frac(e.beat)===.5),'bar 2 stays straight');
assert.deepEqual(sm.bassEvents.filter(n=>n.beat<4).map(n=>frac(n.beat)),[0,.667,0,.667,0,.667,0,.667]);
// New kit pieces render in the WAV and export to MIDI.
const kit={};for(const n of DRUM_NOTES){const f=readFileSync(new URL(`../dist/samples/${n}.wav`,import.meta.url));kit[n]=decodeWav(f.buffer.slice(f.byteOffset,f.byteOffset+f.byteLength))}
const extra={...d,bars:d.bars.slice(0,1),length:4},one={events:[{beat:0,note:37,velocity:110},{beat:1,note:44,velocity:110},{beat:2,note:53,velocity:110}]};let energy=[0,0,0];
let frame=0;for(const c of renderWav(extra,one,120,kit,'drums'))if(c.data){const pcm=new Int16Array(c.data);for(let i=0;i<pcm.length;i+=2,frame++){const sec=frame/44100,which=Math.floor(sec/.5);if(which<3)energy[which]+=pcm[i]*pcm[i]}}
assert.ok(energy.every(e=>e>1e6),'cross-stick, pedal hat and ride bell are audible: '+energy);
const bytes=midi(d,generate(d,opt('funk',{fills:4}),1,1),null);assert.ok(bytes.length>200);
console.log('PASS: ten new genres in four families with starting settings, backbeats, one drop / steppers, skank beat, funk ghosts, swing timing, boogie bass, nine bass approaches, odd meters, Guitar Pro triplet feel, new kit pieces in WAV and MIDI.');

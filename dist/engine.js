import{generateBass}from'./bass.js';
import{STYLES,FAMILIES,optionsForBar,swingTime,swingKind}from'./styles.js';
export{STYLES,FAMILIES,optionsForBar,swingTime,swingKind};
export const PPQ=960;
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
// `order` (from playbackOrder) lists written bars in the order they are played, with the tempo in force at each pass.
export function analyze(score,trackIndex=0,order=null){
 const track=score.tracks[trackIndex];if(!track)throw Error('No playable track in this file.');
 let offset=0;const written=score.masterBars.map((m,i)=>{const length=m.calculateDuration(true)/PPQ;if(!Number.isFinite(length)||length<=0||length>64)throw Error('Unsupported measure duration. Please simplify free-time or unusually long bars.');const hits=[];let held=false;for(const staff of track.staves)for(const voice of staff.bars[i]?.voices||[])for(const beat of voice.beats){if(beat.isRest||!beat.notes.length||beat.graceType!==0)continue;if(beat.notes.every(n=>n.isTieDestination)){held=true;continue;}const t=beat.playbackStart/PPQ;if(t<0||t>=length)continue;hits.push({t,duration:beat.playbackDuration/PPQ,palm:beat.notes.some(n=>n.isPalmMute),pitches:beat.notes.filter(n=>!n.isTieDestination).map(n=>n.realValue).filter(n=>n>=0&&n<128)});}
 const bar={index:i,written:i+1,start:offset,length,numerator:m.timeSignatureNumerator,denominator:m.timeSignatureDenominator,section:m.section?.text||'',hits,held,swing:m.tripletFeel===2?'eighth':m.tripletFeel===1?'sixteenth':'',tempos:(m.tempoAutomations||[]).filter(a=>a.value>0).map(a=>({at:(a.ratioPosition||0)*length,bpm:a.value})),repeat:m.isRepeatStart||m.isRepeatEnd||m.alternateEndings>0};offset+=length;return bar;});
 let bars=written;if(order){offset=0;bars=order.map((o,i)=>{const w=written[o.index],bar={...w,index:i,start:offset,tempos:o.tempos.map(t=>({...t})),repeat:false};offset+=w.length;return bar})}
 if(!bars.length||offset<=0)throw Error('This score has no measures.');
 return {title:score.title||'Untitled riff',artist:score.artist||'',bpm:score.tempo||120,bars,length:offset,track:track.name||'Guitar',hasRepeats:!order&&written.some(b=>b.repeat),expanded:!!order,writtenBars:written.length};
}
// Playback order straight from alphaTab's MIDI tick lookup, so repeats, alternate endings and
// jumps follow the same rules as Guitar Pro. Returns null when the score plays in written order.
export function playbackOrder(score,at,limit=2048){
 if(!score.masterBars.some(m=>m.isRepeatStart||m.repeatCount>0||m.alternateEndings>0||m.directions?.size>0))return null;
 const generator=new at.midi.MidiFileGenerator(score,new at.Settings(),new at.midi.AlphaSynthMidiFileHandler(new at.midi.MidiFile()));generator.generate();
 const order=[];let bpm=null;for(const l of generator.tickLookup.masterBars){const tempos=[];for(const t of l.tempoChanges||[])if(t.tempo>0&&t.tempo!==bpm){tempos.push({at:Math.max(0,(t.tick-l.start)/PPQ),bpm:t.tempo});bpm=t.tempo}order.push({index:l.masterBar.index,tempos})}
 if(order.length>limit)throw Error(`เมื่อเล่นตาม repeat แล้วยาวเกิน ${limit} ห้อง กรุณาปิดการเล่นตาม repeat หรือแบ่งเพลง`);
 return order.length&&order.some((o,i)=>o.index!==i)||order.length!==score.masterBars.length?order:null;
}
// Metronome clicks on the beat unit of each bar; compound x/8 bars click on dotted quarters.
export function clickEvents(song,{compound=true}={}){const out=[];for(const bar of song.bars){const unit=4/bar.denominator,step=compound&&bar.denominator>=8&&bar.numerator%3===0&&bar.numerator>3?unit*3:unit;for(let t=0;t<bar.length-1e-6;t+=step)out.push({beat:bar.start+t,accent:t===0})}return out}
export function demo(){return{title:'Forged in Fire',artist:'Riff Forge demo',track:'Rhythm guitar',bpm:156,length:32,hasRepeats:false,bars:Array.from({length:8},(_,i)=>({index:i,start:i*4,length:4,numerator:4,denominator:4,section:i===0?'Main riff':i===4?'Breakdown':'',tempos:[],hits:[0,.5,.75,1.5,2,2.5,3.25,3.5].map((t,j)=>({t,duration:.23,palm:j%3!==0,pitches:[40+([0,0,3,0,0,5,3,1][j])+(i>3?-2:0)]}))}))}}
// opt.overrides: [{from,to,options}] with one-based bar numbers of the full song; later entries win (optionsForBar in styles.js).
export function generate(song,opt,seed,variant=0){const random=rng(seed),events=[];const human=+opt.humanize/100;let warp='';const add=(beat,note,vel,bar)=>{if(warp)beat=bar.start+swingTime(beat-bar.start,warp);let t=beat+(random()-.5)*.022*human;t=Math.max(bar.start,Math.min(bar.start+bar.length-.012,t));events.push({beat:t,note,velocity:Math.max(25,Math.min(127,Math.round(vel+(random()-.5)*20*human)))});};
 for(const bar of song.bars){const o=optionsForBar(opt,bar),style=STYLES[o.style]||STYLES.metal,density=+o.density/100,complexity=+o.complexity/100;const isFill=opt.fills>0&&((bar.index+1)%+opt.fills===0||bar.index===song.bars.length-1);warp=swingKind(bar,style);if(style.family!=='metal'){grooveBar(bar,o,style,opt,variant,random,add,isFill);continue}const section=bar.section.toLowerCase();const half=o.style==='djent'||o.style==='metalcore'||section.includes('breakdown');const pattern=variant===1?'ride':variant===2?'open':'closed';const cymbal=pattern==='ride'?51:pattern==='open'?46:42;
 if(bar.index===0||bar.section||bar.index%4===0)add(bar.start,49,108,bar);
 for(let t=0;t<bar.length-.001;t+=style.hat){if(isFill&&t>=bar.length-1&&complexity>.35)continue;if(random()<.08*complexity&&t%1!==0)continue;add(bar.start+t,cymbal,t%1===0?88:65,bar);}
 const kick=new Set();const kickAdd=t=>{if(t>=0&&t<bar.length)kick.add(Math.round(t*960)/960)};
 for(let t=0;t<bar.length;t+=4)for(const k of style.kick){if(k===0||random()<.35+.65*density)kickAdd(t+k)}
 const uniqueHits=[...new Map(bar.hits.map(h=>[h.t,h])).values()];for(const h of uniqueHits)if(random()<(+o.follow/100)*(h.palm?1:.8))kickAdd(h.t);
 if(o.doubleKick){const step=.25;for(let t=0;t<bar.length;t+=step)if(random()<density*(variant===2?.8:.45))kickAdd(t);}
 if(variant===1&&complexity>.3)for(let t=.75;t<bar.length;t+=1.5)if(random()<complexity)kickAdd(t);
 let lastKick=-Infinity;for(const t of [...kick].sort((a,b)=>a-b)){if(!o.doubleKick&&t-lastKick<.49)continue;add(bar.start+t,36,98+(t%1===0?12:0),bar);lastKick=t;}
 for(let t=0;t<bar.length;t+=4){const snare=half?[2]:style.snare;for(const s of snare)if(t+s<bar.length)add(bar.start+t+s,38,110,bar)}
 if(complexity>.55)for(let t=.75;t<bar.length;t+=1)if(random()<complexity*.28)add(bar.start+t,38,40,bar);
 if(isFill&&complexity>.15){const dur=Math.min(bar.length,complexity>.7?2:1);const step=complexity>.5?.25:.5;for(let t=bar.length-dur;t<bar.length;t+=step){const note=variant===0?38:[38,48,47,45,43][Math.min(4,Math.floor((t-(bar.length-dur))/dur*5))];add(bar.start+t,note,85+random()*24,bar);}}
 }
 events.sort((a,b)=>a.beat-b.beat||a.note-b.note);const seen=new Set();const drumEvents=events.filter(e=>{const k=Math.round(e.beat*96)+':'+e.note;if(seen.has(k))return false;seen.add(k);return true});return{seed,events:drumEvents,bassEvents:generateBass(song,drumEvents,opt,seed,variant),style:opt.style,options:{...opt}};
}
// Non-metal bar: backbeat, cymbal grid, ghost notes and fills from the genre profile. Positions are written
// straight; add() applies triplet feel for swing genres or bars marked with triplet feel in Guitar Pro.
function grooveBar(bar,o,style,opt,variant,random,add,isFill){
 const len=bar.length,density=+o.density/100,complexity=+o.complexity/100,near=(a,b)=>Math.abs(a-b)<.02;
 const compound=bar.denominator>=8&&bar.numerator%3===0&&bar.numerator>3,step=compound?1.5:1,pulses=[];for(let t=0;t<len-1e-6;t+=step)pulses.push(t);
 const fillDur=isFill&&complexity>.15?Math.min(len,complexity>.7?2:1):0,fillFrom=len-fillDur,inFill=t=>fillDur>0&&t>=fillFrom-1e-6;
 const crash=bar.index===0||!!bar.section||(opt.fills>0&&bar.index>0&&bar.index%+opt.fills===0)||bar.index%8===0||(variant===2&&bar.index%4===0);
 const four=!compound&&near(len,4),skank=style.skank&&variant===1;
 // Snare: backbeat on every other pulse; half-time and one drop land on the third pulse only.
 const snare=[];pulses.forEach((t,i)=>{if(style.oneDrop||style.half){if(pulses.length>=3?i%4===2:i===1)snare.push(t)}else if(skank)snare.push(t+step/2);else if(i%2===1)snare.push(t)});
 const cross=style.cross||(style.half&&variant===0&&density<.4);
 for(const t of snare)if(t<len&&!inFill(t))add(bar.start+t,cross?37:38,cross?96:112,bar);
 // Kick: genre pattern for 4/4 bars (one per take, sometimes swapped for variety), downbeat pulses elsewhere.
 const kick=new Set(),kickAdd=t=>{if(t>=0&&t<len&&!inFill(t)&&(skank||style.oneDrop||!snare.some(s=>near(s,t))))kick.add(Math.round(t*960)/960)};
 if(skank)for(const t of pulses)kickAdd(t);
 else if(four){const k=style.kicks.length,pick=!style.oneDrop&&random()<complexity*.25?Math.floor(random()*Math.min(2,k)):variant%k;for(const t of style.kicks[pick])if(t===0||style.oneDrop||random()<.45+.55*density)kickAdd(t)}
 else pulses.forEach((t,i)=>{if(style.oneDrop?snare.some(s=>near(s,t)):i%2===0||(pulses.length%2===1&&i===pulses.length-1&&random()<density))kickAdd(t)});
 if(!style.oneDrop&&!skank){for(const t of pulses)if(random()<density*.22)kickAdd(t+step/2);
  const follow=(+o.follow/100)*(style.follow??.5);for(const h of [...new Map(bar.hits.map(h=>[h.t,h])).values()])if((!style.swing||Math.abs((h.t*2)%1)<1e-6)&&random()<follow*(h.palm?.6:1))kickAdd(h.t);
  if(o.doubleKick)for(const t of [...kick])if(t>0&&random()<density*.4)kickAdd(t-.25);}
 for(const t of [...kick].sort((a,b)=>a-b))add(bar.start+t,36,t===0?112:100,bar);
 // Ghost notes: sixteenth ghosts for funk / R&B, the middle triplet for swing genres.
 if(style.ghost)for(let t=.25;t<len;t+=.25){if(inFill(t)||snare.some(s=>near(s,t))||kick.has(t))continue;const before=snare.some(s=>near(s-.25,t));if(random()<style.ghost*complexity*(before?1.2:.5))add(bar.start+t,38,30+random()*14,bar)}
 if(style.swing&&complexity>.4)for(const t of pulses)if(!inFill(t+.25)&&random()<(complexity-.4)*.5)add(bar.start+t+.25,38,30,bar);
 // Cymbals: closed hats / ride / open-hat accents by take; pedal hat on the backbeat under the ride.
 const ride=variant===1||(style.ride&&variant===0&&density>.6),cym=ride?51:42;
 let grid=style.grid||.5;if(grid<.5&&(density<.3||ride))grid=.5;if(style.half&&density<.25)grid=1;if(skank)grid=step;
 for(let t=0;t<len-1e-6;t+=grid){if(inFill(t)||(crash&&t===0))continue;const on=Math.abs(t-Math.round(t/step)*step)<1e-6,off=!on&&Math.abs((t*2)%1)<1e-6;
  if(variant===2&&!ride&&off&&(near(t%4,3.5)||(complexity>.5&&near(t%4,1.5)))){add(bar.start+t,46,92,bar);continue}
  if(ride&&on&&style.family==='rock'&&complexity>.6){add(bar.start+t,53,96,bar);continue}
  if(!on&&random()<.06*complexity)continue;add(bar.start+t,cym,on?90:off?66:48,bar)}
 if(ride&&(style.family==='swing'||style.half||style.family==='groove'))for(const t of snare)if(!inFill(t))add(bar.start+t,44,70,bar);
 if(crash){add(bar.start,49,108,bar);if(!kick.has(0)&&!style.oneDrop)add(bar.start,36,108,bar)}
 // Fill: snare into toms; swing fills use triplets (straight 0, .25, .5 warp to 0, 1/3, 2/3).
 if(fillDur){const toms=[38,48,47,45,43],ts=[];for(let b=fillFrom;b<len-1e-6;b+=1){const sub=style.swing?(complexity>.6?[0,.25,.5]:[0,.5]):complexity>.55?[0,.25,.5,.75]:[0,.5];for(const s of sub)if(b+s<len)ts.push(b+s)}
  ts.forEach((t,i)=>add(bar.start+t,variant===0&&complexity<.4?38:toms[Math.min(4,Math.floor(i/ts.length*5))],80+random()*28,bar));if(fillDur>=2||variant===2)add(bar.start+fillFrom,36,104,bar)}
}
export function tempoMap(song,override){const map=[{beat:0,bpm:override||song.bpm}];if(!override)for(const bar of song.bars)for(const t of bar.tempos)map.push({beat:bar.start+t.at,bpm:t.bpm});return [...new Map(map.map(t=>[t.beat,t])).values()].sort((a,b)=>a.beat-b.beat)}
export function secondsAt(beat,map){let secs=0,last=0,bpm=map[0].bpm;for(const c of map){if(c.beat>beat)break;secs+=(c.beat-last)*60/bpm;last=c.beat;bpm=c.bpm;}return secs+(beat-last)*60/bpm}
const be32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];const vlq=n=>{let a=[n&127];while(n>>>=7)a.unshift((n&127)|128);return a};
export function midi(song,result,override,part='mix',bassTarget='gm'){const map=tempoMap(song,override),con=[];for(const t of map){const us=Math.round(60000000/t.bpm);con.push({tick:Math.round(t.beat*PPQ),bytes:[255,81,3,(us>>16)&255,(us>>8)&255,us&255]})}for(const b of song.bars){const prev=song.bars[b.index-1];if(!prev||b.numerator!==prev.numerator||b.denominator!==prev.denominator)con.push({tick:Math.round(b.start*PPQ),bytes:[255,88,4,b.numerator,Math.round(Math.log2(b.denominator)),24,8]});if(b.section){const txt=[...new TextEncoder().encode(b.section)];con.push({tick:Math.round(b.start*PPQ),bytes:[255,6,...vlq(txt.length),...txt]})}}
 const drums=[];for(const e of result.events){const tick=Math.round(e.beat*PPQ);drums.push({tick,bytes:[0x99,e.note,e.velocity]},{tick:Math.min(Math.round(song.length*PPQ),tick+90),bytes:[0x89,e.note,0]})}
 const bass=bassTarget==='ezbass'?[]:[{tick:0,bytes:[0xc0,34]}];for(const e of result.bassEvents||[]){const tick=Math.round(e.beat*PPQ),note=e.note+(bassTarget==='ezbass'?12:0);if(note<0||note>127)throw Error('Bass note is outside MIDI range');bass.push({tick,bytes:[0x90,note,e.velocity]},{tick:Math.min(Math.round(song.length*PPQ),Math.round((e.beat+e.duration)*PPQ)),bytes:[0x80,note,0]})}
 const label=name=>{const txt=[...new TextEncoder().encode(name)];return{tick:0,bytes:[255,3,...vlq(txt.length),...txt]}};
 const chunk=list=>{list.sort((a,b)=>a.tick-b.tick||((a.bytes[0]&0xf0)===0x80?-1:1));let last=0,out=[];for(const e of list){out.push(...vlq(e.tick-last),...e.bytes);last=e.tick}out.push(...vlq(Math.max(0,Math.round(song.length*PPQ)-last)),255,47,0);return[77,84,114,107,...be32(out.length),...out]};
 const click=[];if(part==='click'||part==='mixclick')for(const e of result.clickEvents||clickEvents(song)){const tick=Math.round(e.beat*PPQ),note=e.accent?76:77;click.push({tick,bytes:[0x99,note,e.accent?120:90]},{tick:tick+60,bytes:[0x89,note,0]})}
 const tracks=[chunk([label('Tempo & time signatures'),...con])];if(part==='mix'||part==='drums'||part==='mixclick')tracks.push(chunk([label('Riff Forge Drums'),...drums]));if((part==='mix'||part==='bass'||part==='mixclick')&&(result.bassEvents||[]).length)tracks.push(chunk([label('Riff Forge Bass'),...bass]));if(click.length)tracks.push(chunk([label('Click'),...click]));return new Uint8Array([77,84,104,100,0,0,0,6,0,1,0,tracks.length,PPQ>>8,PPQ&255].concat(...tracks));
}

import{STYLES,BASS_AUTO,optionsForBar,swingKind,swingTime}from'./styles.js';
function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export const BASS_ROOTS=[28,33,38,43,48,53];
export const nearestBassSample=note=>BASS_ROOTS.reduce((a,b)=>Math.abs(b-note)<Math.abs(a-note)?b:a);
export function bassEnvelope(time,duration){if(time<0||time>duration+.06)return 0;return Math.min(1,time/.006)*Math.min(1,Math.max(0,(duration+.06-time)/.06))}
// Bass approaches: riff / pocket / drive are the original three; the rest come with the newer genres.
// 'auto' takes the genre's own list, one approach per take.
export const BASS_MODES=['riff','pocket','drive','octave','rootfifth','funk','boogie','onedrop','sustain'];
const FUNK=[[0,.75,1.5,2,2.75,3.5],[0,.5,.75,1.75,2.5,3,3.25],[0,.25,1,1.75,2.25,2.75,3.5]],BOOGIE=[0,7,9,7],WALK=[0,7,9,10,12,10,9,7],DROP=[[1,0],[1.5,0],[2.5,7],[3,12]];
export function generateBass(song,drums,opt,seed,variant){if(opt.bassEnabled===false)return[];const random=rng(seed^0xb455),events=[];let previousRoot=song.initialBassRoot??28;
 for(const bar of song.bars){const o=optionsForBar(opt,bar),style=STYLES[o.style]||STYLES.metal,kind=swingKind(bar,style),mode=o.bassMode==='auto'||!o.bassMode?(style.bass||BASS_AUTO.metal)[variant%3]:o.bassMode,cx=+o.complexity;
 const hits=bar.hits.filter(h=>h.pitches.length).sort((a,b)=>a.t-b.t);if(!hits.length&&!bar.held)continue;const rootAt=t=>{let hit;for(const h of hits){if(h.t>t+.015)break;hit=h}if(!hit)return previousRoot;let note=Math.min(...hit.pitches)-12;while(note<23)note+=12;while(note>47)note-=12;return note};
 const len=bar.length,every=list=>{const out=[];for(let b=0;b<len;b+=4)for(const t of list)if(b+t<len)out.push(b+t);return out},eighths=[0,.5,1,1.5,2,2.5,3,3.5];let positions=[],interval=()=>0,real=false;
 if(mode==='riff'){positions=hits.map(h=>h.t);if(!positions.length)positions=[0]}
 else if(mode==='pocket'){real=!!kind;positions=[0,...drums.filter(e=>e.note===36&&e.beat>=bar.start&&e.beat<bar.start+len).map(e=>real?e.beat-bar.start:Math.round((e.beat-bar.start)*4)/4).filter((t,i)=>real||t%1===0||i%3===0)]}
 else if(mode==='octave'){positions=every(eighths);interval=(t,i)=>i%2?12:0}
 else if(mode==='rootfifth'){positions=every(cx>55?[0,1,2,3,3.5]:[0,1,2,3]);interval=t=>t%4===2?7:t%4===3.5?12:0}
 else if(mode==='funk'){positions=every(FUNK[variant%3]);interval=t=>t%1!==0&&random()<cx/200?12:0}
 else if(mode==='boogie'){const line=cx>60?WALK:BOOGIE;positions=every(eighths);interval=t=>line[Math.round(t*2)%line.length]}
 else if(mode==='onedrop'){positions=every(DROP.map(d=>d[0]));interval=t=>(DROP.find(d=>d[0]===t%4)||[0,0])[1]}
 else if(mode==='sustain'){let last=null;for(const h of hits){if(h.t%(cx>50?.5:1)>1e-6&&last!==null)continue;const r=rootAt(h.t);if(r!==last){positions.push(h.t);last=r}}if(!positions.length||bar.held)positions.unshift(0)}
 else{for(let t=0;t<len;t+=.5)positions.push(t)}
 positions=[...new Set(positions)].filter(t=>t>=0&&t<len&&(bar.held||!hits.length||t>=hits[0].t)).sort((a,b)=>a-b);const at=t=>real?t:swingTime(t,kind);
 for(let i=0;i<positions.length;i++){const t=positions[i];let note=rootAt(t)+interval(t,i);if(mode==='drive'&&variant%3===2&&i%8===7&&+opt.complexity>65)note+=12;const h=hits.find(h=>Math.abs(h.t-t)<.02);const gap=(positions[i+1]??len)-t;
  const factor=mode==='sustain'?.95:mode==='funk'?.55:h?.palm?.5:mode==='pocket'?.85:.75,duration=Math.max(.06,Math.min(mode==='sustain'?len:2,gap*factor,mode==='riff'&&h?h.duration:Infinity)),start=at(t);
  events.push({beat:bar.start+start,note,duration:kind?Math.max(.06,at(t+duration)-start):duration,velocity:Math.round(85+random()*20),mode});}
 if(hits.length)previousRoot=rootAt(len);
 }return events;
}

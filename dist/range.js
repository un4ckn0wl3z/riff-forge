import{tempoMap}from'./engine.js';
// Bar numbers are one-based and inclusive. The excerpt starts at beat zero.
export function selectBars(source,from,to){
 const first=Number(from),last=Number(to);
 if(!Number.isInteger(first)||!Number.isInteger(last)||first<1||last<first||last>source.bars.length)throw Error(`เลือกห้องเริ่ม–จบระหว่าง 1–${source.bars.length} โดยห้องจบต้องไม่น้อยกว่าห้องเริ่ม`);
 const start=source.bars[first-1].start;let bpm=source.bpm,initialBassRoot=source.initialBassRoot??28;
 for(const change of tempoMap(source,null)){if(change.beat>start)break;bpm=change.bpm}
 for(const bar of source.bars.slice(0,first-1))for(const hit of [...bar.hits].sort((a,b)=>a.t-b.t)){if(!hit.pitches.length)continue;initialBassRoot=Math.min(...hit.pitches)-12;while(initialBassRoot<23)initialBassRoot+=12;while(initialBassRoot>47)initialBassRoot-=12}
 let offset=0;const bars=source.bars.slice(first-1,last).map((bar,index)=>{const copy={...bar,index,sourceIndex:bar.index,start:offset,tempos:bar.tempos.map(t=>({...t}))};offset+=bar.length;return copy});
 return{...source,bpm,bars,length:offset,hasRepeats:bars.some(b=>b.repeat),initialBassRoot,rangeStart:first,rangeEnd:last,sourceBarCount:source.bars.length,sourceStartBeat:start};
}
// Put an excerpt back at its place in the full song, so the exported file can be dropped at 0:00 in a DAW.
// The tempo map and time signatures before the excerpt come from the full song; events are shifted, not regenerated.
export function padToSongStart(full,clip,result){const offset=clip.sourceStartBeat||0,end=clip.rangeEnd??full.bars.length;if(!offset)return{song:clip,result};const shift=e=>({...e,beat:e.beat+offset});const song={...full,bars:full.bars.slice(0,end),length:offset+clip.length,rangeStart:clip.rangeStart,rangeEnd:clip.rangeEnd,paddedFrom:offset};return{song,result:{...result,events:result.events.map(shift),bassEvents:(result.bassEvents||[]).map(shift),clickEvents:result.clickEvents?.map(shift)}}}
// Keep only the notes of the listed bar ranges (one-based full-song bar numbers); the bars in between stay silent.
// Bass notes are cut at the end of their bar so nothing rings into a skipped bar.
export function onlyBars(song,result,ranges){if(!ranges?.length)return result;const barAt=beat=>song.bars.find(b=>beat>=b.start-1e-9&&beat<b.start+b.length-1e-9),kept=b=>{const n=(b.sourceIndex??b.index)+1;return ranges.some(([from,to])=>n>=from&&n<=to)},keep=e=>{const b=barAt(e.beat);return!!b&&kept(b)};return{...result,events:result.events.filter(keep),bassEvents:(result.bassEvents||[]).filter(keep).map(e=>{const b=barAt(e.beat);return{...e,duration:Math.min(e.duration,b.start+b.length-e.beat)}}),onlyBars:ranges.map(r=>[...r])}}

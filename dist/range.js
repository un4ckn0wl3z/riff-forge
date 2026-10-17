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

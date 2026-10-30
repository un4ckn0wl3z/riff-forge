import{BASS_ROOTS}from'./bass.js';
import{decodeWav}from'./wav.js';
export const DRUM_NOTES=[36,37,38,42,43,44,45,46,47,48,49,51,53];
let pending;
export async function loadKit(){if(!pending)pending=Promise.all([...DRUM_NOTES,...BASS_ROOTS.map(n=>'bass-'+n)].map(async note=>{const response=await fetch(new URL(`./samples/${note}.wav`,document.baseURI));if(!response.ok)throw Error('โหลดชุดเสียงกลองไม่สำเร็จ กรุณาลองอีกครั้ง');return[note,decodeWav(await response.arrayBuffer())]})).then(entries=>Object.fromEntries(entries)).catch(e=>{pending=null;throw e});return pending}
export function audioBuffers(ctx,kit){const result={};for(const[note,s]of Object.entries(kit)){const b=ctx.createBuffer(s.channels,s.samples.length/s.channels,s.rate);for(let c=0;c<s.channels;c++){const out=b.getChannelData(c);for(let i=0;i<out.length;i++)out[i]=s.samples[i*s.channels+c]}result[note]=b}return result}

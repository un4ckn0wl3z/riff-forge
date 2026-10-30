import * as a from '../dist/vendor/alphatab.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {encodeWav} from '../dist/wav.js';
const event={on(){},off(){}};
const output={sampleRate:44100,ready:event,sampleRequest:event,samplesPlayed:event,open(){},destroy(){},pause(){},resetSamples(){}};
const synth=new a.synth.AlphaSynth(output,100);
if(!process.argv[2])throw Error('Usage: node scripts/build-drum-kit.js /path/to/sonivox.sf2');
const sf=new Uint8Array(readFileSync(process.argv[2]));
for(const note of [36,37,38,42,43,44,45,46,47,48,49,51,53]){
 const midi=new a.midi.MidiFile();midi.division=960;midi.addEvent(new a.midi.TempoChangeEvent(0,500000));midi.addEvent(new a.midi.ProgramChangeEvent(0,0,9,0));midi.addEvent(new a.midi.ControlChangeEvent(0,0,9,7,100));midi.addEvent(new a.midi.ControlChangeEvent(0,0,9,10,64));midi.addEvent(new a.midi.ControlChangeEvent(0,0,9,11,127));midi.addEvent(new a.midi.NoteOnEvent(0,0,9,note,127));midi.addEvent(new a.midi.NoteOffEvent(0,7680,9,note,0));midi.addEvent(new a.midi.EndOfTrackEvent(0,9600));
 const options=new a.synth.AudioExportOptions();options.sampleRate=44100;options.soundFonts=[sf];options.masterVolume=.8;options.useSyncPoints=false;
 const exporter=synth.exportAudio(options,midi,[],new Map());const chunks=[];let chunk;while((chunk=exporter.render(500)))chunks.push(chunk.samples);
 let size=chunks.reduce((n,c)=>n+c.length,0);let pcm=new Float32Array(size),pos=0;for(const c of chunks){pcm.set(c,pos);pos+=c.length}let last=pcm.length-2;while(last>0&&Math.abs(pcm[last])<.00008&&Math.abs(pcm[last+1])<.00008)last-=2;pcm=pcm.slice(0,Math.min(pcm.length,last+4410));
 let peak=0;for(const s of pcm)peak=Math.max(peak,Math.abs(s));if(!Number.isFinite(peak)||peak<.001)throw Error('Silent sample '+note);writeFileSync(`dist/samples/${note}.wav`,new Uint8Array(encodeWav(pcm,44100,2)));console.log(note,'frames',pcm.length/2,'peak',peak.toFixed(3));
}

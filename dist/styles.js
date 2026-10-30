// Genre profiles. Metal styles keep the original riff-driven generator; every other family is built by
// grooveBar() in engine.js from the fields below. Kick patterns are beat positions inside one 4/4 bar.
export const FAMILIES=[{id:'metal',name:'Metal'},{id:'rock',name:'Rock'},{id:'groove',name:'Groove'},{id:'swing',name:'Swing'},{id:'other',name:'Other'}];
export const STYLES={
 metal:{family:'metal',name:'Heavy Metal',sub:'Driving • powerful • classic',kick:[0,1.5,2,2.75],snare:[1,3],hat:.5},
 thrash:{family:'metal',name:'Thrash Metal',sub:'Fast • relentless • tight',kick:[0,.5,1.5,2,2.5,3.5],snare:[1,3],hat:.5},
 metalcore:{family:'metal',name:'Metalcore',sub:'Punchy • syncopated • breakdowns',kick:[0,.75,1.5,2.5,3.25],snare:[2],hat:.5},
 djent:{family:'metal',name:'Djent',sub:'Angular • riff-led • precise',kick:[0,.75,1.25,2.5,3.25],snare:[2],hat:.5},
 death:{family:'metal',name:'Death Metal',sub:'Double kick • blast • intensity',kick:[0,.25,.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75],snare:[1,3],hat:.5},
 black:{family:'metal',name:'Black Metal',sub:'Blasts • cymbal wash • raw',kick:[0,.5,1,1.5,2,2.5,3,3.5],snare:[.25,.75,1.25,1.75,2.25,2.75,3.25,3.75],hat:.5},
 hardrock:{family:'rock',name:'Hard Rock',sub:'Big backbeat • driving eighths • crashes',grid:.5,kicks:[[0,2,2.5],[0,1.5,2],[0,.5,2,2.5]],snare:[1,3],follow:.7,bass:['drive','octave','riff'],defaults:{density:65,complexity:45,doubleKick:false}},
 classicrock:{family:'rock',name:'Classic Rock',sub:'Straight eighths • laid-back pocket',grid:.5,kicks:[[0,2],[0,2.5],[0,1.5,2]],snare:[1,3],follow:.5,bass:['rootfifth','riff','drive'],defaults:{density:50,complexity:40,doubleKick:false}},
 poprock:{family:'rock',name:'Pop Rock',sub:'Clean backbeat • four-on-the-floor lifts',grid:.5,kicks:[[0,2,2.5],[0,1.5,2.5],[0,1,2,3]],snare:[1,3],follow:.4,bass:['octave','pocket','drive'],defaults:{density:50,complexity:35,doubleKick:false}},
 punk:{family:'rock',name:'Punk / Pop-punk',sub:'Fast • offbeat snare • raw energy',grid:.5,kicks:[[0,2],[0,.5,2,2.5],[0,1,2,3]],snare:[1,3],skank:true,follow:.5,bass:['drive','drive','octave'],defaults:{density:80,complexity:45,doubleKick:false}},
 funk:{family:'groove',name:'Funk',sub:'Sixteenth hats • ghost notes • syncopated kick',grid:.25,ghost:.55,kicks:[[0,.75,2.5],[0,1.75,2.25],[0,.75,1.5,2.75]],snare:[1,3],follow:.35,bass:['funk','funk','octave'],defaults:{density:65,complexity:70,doubleKick:false}},
 rnb:{family:'groove',name:'R&B / Soul',sub:'Laid back • ghosted backbeat • warm',grid:.5,ghost:.3,kicks:[[0,1.75,2.5],[0,2.5,2.75],[0,.75,2.5]],snare:[1,3],follow:.3,bass:['funk','sustain','pocket'],defaults:{density:45,complexity:55,doubleKick:false}},
 shuffle:{family:'swing',name:'Blues Shuffle',sub:'Triplet feel • ride or hats • boogie bass',grid:.5,swing:true,kicks:[[0,2],[0,1,2,3],[0,2,2.5]],snare:[1,3],follow:.3,ride:true,bass:['boogie','boogie','rootfifth'],defaults:{density:45,complexity:40,doubleKick:false}},
 rocknroll:{family:'swing',name:"Rock 'n' Roll",sub:'Swung eighths • driving backbeat',grid:.5,swing:true,kicks:[[0,2,2.5],[0,1.5,2],[0,1,2,3]],snare:[1,3],follow:.4,bass:['boogie','octave','drive'],defaults:{density:60,complexity:45,doubleKick:false}},
 reggae:{family:'other',name:'Reggae (One Drop)',sub:'Kick + cross-stick on 3 • space on 1',grid:.5,oneDrop:true,kicks:[[2],[0,2],[0,1,2,3]],snare:[2],cross:true,follow:0,bass:['onedrop','sustain','onedrop'],defaults:{density:40,complexity:45,doubleKick:false}},
 ballad:{family:'other',name:'Ballad / Half-time',sub:'Snare on 3 • space • long bass notes',grid:.5,half:true,kicks:[[0,1.5],[0,2.5,3.5],[0]],snare:[2],follow:.3,ride:true,bass:['sustain','rootfifth','riff'],defaults:{density:35,complexity:30,doubleKick:false}}
};
for(const s of Object.values(STYLES))s.defaults??={density:70,complexity:55,doubleKick:true};
export const familyOf=id=>(STYLES[id]||STYLES.metal).family;
export const BASS_AUTO={metal:['riff','pocket','drive']};
// Triplet feel as a time warp inside each beat: the off-beat eighth (or sixteenth) moves to the last
// triplet. Positions between are stretched linearly, so riff notes, drums and bass all stay in order.
export function swingTime(t,kind){if(!kind)return t;const unit=kind==='sixteenth'?.5:1,b=Math.floor(t/unit+1e-9)*unit,f=(t-b)/unit;return b+unit*(f<=.5?f*4/3:2/3+(f-.5)*2/3)}
export const swingKind=(bar,style)=>bar.swing||(style?.swing?'eighth':'');
// Per-bar options with section overrides applied; later overrides win.
export function optionsForBar(opt,bar){const n=(bar.sourceIndex??bar.index)+1;let o=opt;for(const r of opt.overrides||[])if(n>=r.from&&n<=r.to)o={...o,...r.options};return o}

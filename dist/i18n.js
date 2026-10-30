// English UI. Riff Forge's labels are English and its hints and messages are Thai; in English mode every
// Thai text node and label attribute is shown through translate(), and a MutationObserver keeps text the
// app writes later in English. Switching back restores the original Thai.
const EXACT={
 // hero, source, settings
 'ใส่ริฟฟ์กีตาร์ของคุณ เลือกแนวที่ใช่ แล้วสร้างกลองและเบสหลายเวอร์ชัน':'Drop in your guitar riff, pick a style, and generate drums and bass in several versions.',
 'ฟังเทียบ ปรับแต่ง และนำไปต่อใน DAW ของคุณ':'Compare them, tweak them, and take them into your DAW.',
 'หรือคลิกเพื่อเลือกไฟล์':'or click to choose a file','.gp · .gpx · .gp5 · .gp4 · .gp3 / สูงสุด 20 MB':'.gp · .gpx · .gp5 · .gp4 · .gp3 / up to 20 MB',
 'ยังไม่มีไฟล์?':'No file yet?','ลองฟัง Demo riff ↗':'Try the demo riff ↗','ทั้งเพลง':'Whole song','เลือกห้องเริ่ม–ห้องจบ รวมทั้งสองห้อง':'Choose the first and last bar, both included',
 'อ่านไฟล์และสร้างกลองบนเครื่องคุณ':'Files are read and drums are built on your machine.','ไม่ต้องอัปโหลดเพลงไปยังเซิร์ฟเวอร์':'Nothing is uploaded to a server.',
 'เลือกแนวและคาแรกเตอร์กลอง':'Pick the style and drum character','ความหนาแน่นของกระเดื่อง':'How busy the kick is','ลูกเล่นและรายละเอียด fill':'Ghost notes and fill detail',
 'ให้ kick ตามจังหวะโน้ตกีตาร์':'Kick follows the guitar rhythm','ความต่างของน้ำหนักและเวลา':'Variation in velocity and timing',
 'ตั้งแนวและความหนักเฉพาะห้องที่เลือกไว้ในแผนที่ห้อง เช่น Breakdown ใช้ Metalcore ส่วน Chorus ใช้ Thrash จากนั้นกด ทั้งเพลง แล้ว Generate ทีเดียว':'Give the bars selected on the bar map their own style and intensity, e.g. Metalcore for the breakdown and Thrash for the chorus, then press Whole song and generate once.',
 '+ ใช้กับห้องที่เลือก':'+ Apply to the selected bars',
 'เลือก EZbass หากนำ MIDI ไปใช้ใน EZbass · ยกเฉพาะโน้ตเบสขึ้น 1 octave และไม่ส่ง Program Change · ไม่มีผลต่อเสียง Preview หรือ WAV':'Choose EZbass if the MIDI goes into EZbass · only bass notes move up an octave and no Program Change is sent · preview and WAV are unaffected',
 'เริ่มจากอัปโหลดไฟล์ หรือลอง Demo riff':'Start by uploading a file or trying the demo riff','แล้วกด Generate เพื่อสร้างกลองและเบสหลายแบบ':'then press Generate to build several drum and bass versions',
 'ส่งออกเฉพาะ bar ที่เลือก':'Exports only the selected bars','· WAV มีเสียงกลองและเบสพร้อมใช้ · MIDI ใช้เปลี่ยนชุดเสียงใน DAW ·':'· WAV has ready-to-use drum and bass audio · MIDI lets you swap sounds in your DAW ·',
 'Ready when you are. เริ่มจากไฟล์ Guitar Pro ของคุณ':'Ready when you are. Start with your Guitar Pro file.','เลือกไฟล์ Guitar Pro':'Choose a Guitar Pro file',
 // help dialog
 'อัปโหลด Guitar Pro แล้วเลือกแทร็กกีตาร์ที่ใช้เป็นจังหวะอ้างอิง':'Upload a Guitar Pro file and choose the guitar track to use as the rhythm reference.',
 'เลือกช่วงจากแผนที่ห้อง (แตะห้องแรกแล้วแตะห้องสุดท้าย, ลากเมาส์, กดชื่อท่อน) หรือพิมพ์ From bar / To bar จากนั้นเลือกแนว ความหนาแน่น และจำนวนเวอร์ชัน ใช้ Section overrides เพื่อตั้งแนวต่างกันในแต่ละท่อน ถ้าอยากสร้างเฉพาะท่อนที่ตั้งไว้ ให้เปลี่ยน Generate เป็น keep gaps silent (ห้องระหว่างกลางเงียบ ตำแหน่งตรงกับเพลง) หรือ join, remove gaps (ตัดห้องระหว่างกลางออก เอาท่อนที่เลือกมาต่อกัน)':'Pick a range on the bar map (tap the first and last bar, drag, or press a section name) or type From bar / To bar, then choose the style, intensity and number of versions. Use Section overrides for a different style per section. To generate only those sections, set Generate to keep gaps silent (bars in between stay silent, positions match the song) or join, remove gaps (bars in between are cut and the sections play back to back).',
 'กด Generate แล้วฟังแต่ละเวอร์ชัน ใช้ Reference guitar เพื่อฟังโน้ตกีตาร์แบบสังเคราะห์ประกอบ':'Press Generate and listen to each version. Turn on Reference guitar to hear a synthesized guitar along with it.',
 'เลือก Full mix / Drums / Bass / Click / Full mix + click แล้วดาวน์โหลด WAV หรือ MIDI ค่าเริ่มต้น Export start = Song start ไฟล์จะมีช่วงเงียบก่อนห้องแรกที่เลือก จึงวางที่ 0:00 ใน DAW ได้เลย กลองใช้ General MIDI channel 10':'Choose Full mix / Drums / Bass / Click / Full mix + click and download WAV or MIDI. With the default Export start = Song start, files include silence before the first selected bar, so they drop at 0:00 in your DAW. Drums use General MIDI channel 10.',
 'ระบบสร้างด้วยกฎทางจังหวะ ไม่ใช่ AI model เสียงกลองมาจากชุด SoundFont SONiVOX แบบ sample-based สร้างเบสจากโน้ตต่ำของริฟฟ์กีตาร์ เลือกส่งออกทั้งวง แยกกลอง หรือแยกเบสได้ ส่งออก WAV 44.1 kHz / 16-bit stereo พร้อมเสียงเครื่องดนตรีได้สูงสุด 10 นาที หรือ MIDI พร้อม tempo และ time signature ตามไฟล์ กีตาร์อ้างอิงเป็นเสียงสังเคราะห์และไม่รวมใน WAV หากใช้เบสกับ EZbass ให้เลือก MIDI bass target: EZbass (+12 semitones) ก่อนดาวน์โหลด และอย่า transpose เพิ่มอีก':'Grooves are built from rhythm rules, not an AI model. Drums are sample-based from the SONiVOX SoundFont, and the bass is built from the low notes of the guitar riff. Export the whole band, drums only or bass only: WAV 44.1 kHz / 16-bit stereo up to 10 minutes, or MIDI with the file’s tempo and time signatures. The reference guitar is synthesized and not included in WAV. For EZbass, choose MIDI bass target: EZbass (+12 semitones) before downloading and don’t transpose again.',
 'เล่นตาม repeat, alternate ending และ jump ตามที่ Guitar Pro เล่น (ปิดได้ด้วย Follow repeats &amp; endings) เลขห้องในแผนที่ห้องเป็นลำดับที่เล่น เลขในวงเล็บคือห้องที่เขียนในโน้ต swing และ tempo ramp แบบต่อเนื่องยังไม่รองรับ':'Repeats, alternate endings and jumps play the way Guitar Pro plays them (switch off with Follow repeats & endings). Bar numbers on the bar map follow playback order; the number in brackets is the written bar. Swing and continuous tempo ramps are not supported yet.',
 'เล่นตาม repeat, alternate ending และ jump ตามที่ Guitar Pro เล่น (ปิดได้ด้วย Follow repeats & endings) เลขห้องในแผนที่ห้องเป็นลำดับที่เล่น เลขในวงเล็บคือห้องที่เขียนในโน้ต swing และ tempo ramp แบบต่อเนื่องยังไม่รองรับ':'Repeats, alternate endings and jumps play the way Guitar Pro plays them (switch off with Follow repeats & endings). Bar numbers on the bar map follow playback order; the number in brackets is the written bar. Swing and continuous tempo ramps are not supported yet.',
 'กรุณาเปิด JavaScript เพื่ออ่านไฟล์ Guitar Pro และสร้างเพลง':'Please enable JavaScript to read Guitar Pro files and generate grooves.',
 // bar map
 'แตะห้องแรกแล้วแตะห้องสุดท้ายเพื่อเลือกช่วง · ลากเมาส์หรือ Shift+คลิกก็ได้ ·':'Tap the first bar, then the last, to select a range · mouse drag or Shift-click also work ·','ตั้งแนวเฉพาะช่วง':'section override',
 // messages
 'อ่านไฟล์จากอุปกรณ์ไม่สำเร็จ':'Couldn’t read the file from this device','เลขในวงเล็บคือห้องในโน้ต':'the number in brackets is the written bar',
 'มี repeat / ending แต่กำลังอ่านตามลำดับห้องที่เขียน':'This file has repeats / endings but is being read in written order','เปิด Follow repeats & endings เพื่อเล่นตามจริง':'turn on Follow repeats & endings to play them',
 'มี triplet feel (shuffle) ในไฟล์ กลองและเบสจะ swing ตาม':'the file uses triplet feel (shuffle), so drums and bass swing with it',
 'double kick เปิด':'double kick on','double kick ปิด':'double kick off','ปรับต่อได้ตามต้องการ':'adjust as you like',
 'ใช้โน้ตกีตาร์และจังหวะจากแทร็กที่เลือก • อ่านตามลำดับห้องที่เขียน':'Uses the notes and rhythm of the selected track • read in written order',
 'ลบการตั้งค่าเฉพาะช่วงแล้ว กด Generate เพื่อสร้างใหม่':'Override removed. Press Generate to build again.','กด Generate ได้เลย':'press Generate',
 'เลือกช่วงที่จะสร้าง หรือเปลี่ยน Generate เป็นเฉพาะห้องที่ตั้งไว้ แล้วกด Generate':'pick the range to generate, or set Generate to the override bars only, then press Generate',
 'เล่นตาม repeat / ending แล้ว':'Now following repeats / endings','เลขห้องเปลี่ยนตามลำดับที่เล่น':'bar numbers follow playback order','อ่านตามลำดับห้องที่เขียนในโน้ต':'Reading bars in written order',
 'คลิกเพื่อแทนที่ด้วยไฟล์ของคุณ':'Click to replace it with your file','Demo พร้อมแล้ว เลือกแนวแล้วกด Generate grooves':'Demo ready. Pick a style and press Generate.',
 'กรุณาเลือกไฟล์ .gp, .gpx, .gp5, .gp4 หรือ .gp3':'Please choose a .gp, .gpx, .gp5, .gp4 or .gp3 file','ไฟล์ใหญ่เกิน 20 MB กรุณาลดขนาดไฟล์':'The file is larger than 20 MB. Please use a smaller file.',
 'กำลังอ่านไฟล์ Guitar Pro…':'Reading the Guitar Pro file…','รองรับ 1–512 ห้องต่อไฟล์ กรุณาแบ่งเพลงยาวเป็นส่วนย่อย':'Files can have 1–512 bars. Please split long songs into parts.',
 'ไม่พบแทร็กเครื่องดนตรีสำหรับใช้อ้างอิงริฟฟ์':'No instrument track to use as the riff reference','อ่านไฟล์สำเร็จ · คลิกเพื่อเปลี่ยนไฟล์':'File read · click to change it',
 'อ่านไฟล์สำเร็จ เลือกแทร็กอ้างอิงและคาแรกเตอร์กลองได้เลย':'File read. Choose the reference track and drum character.','ไฟล์เสียหายหรือเวอร์ชันไม่รองรับ':'the file is damaged or an unsupported version',
 'อัปเดตริฟฟ์อ้างอิงแล้ว กด Generate เพื่อสร้างใหม่':'Reference riff updated. Press Generate to build again.','ไฟล์ส่งออกเริ่มที่ต้นเพลง':'exports start at the song start',
 'ยังไม่มี Section overrides':'No section overrides yet','เลือกห้องแล้วกด + ใช้กับ bar … ก่อน หรือเปลี่ยน Generate เป็น From–To bars':'select bars and press + Apply first, or set Generate to From–To bars',
 'ไม่มีห้องเงียบคั่น':'no silent gaps','ไฟล์ส่งออกเริ่มที่ 0 (Export start ไม่มีผลในโหมดนี้)':'exports start at 0 (Export start has no effect in this mode)','ห้องระหว่างนั้นเงียบ':'bars in between stay silent',
 'จะ generate เฉพาะห้องที่ตั้ง Section overrides ไว้ ห้องระหว่างนั้นเงียบ':'Will generate only the bars with section overrides; bars in between stay silent',
 'จะ generate เฉพาะห้องที่ตั้ง Section overrides ไว้ แล้วต่อกันโดยตัดห้องระหว่างนั้นออก':'Will generate only the bars with section overrides and join them, cutting the bars in between',
 'จะ generate ตามช่วง From–To':'Will generate the From–To range','เลือกห้องแล้ว':'Bars selected','กด + ใช้กับ bar … เพื่อเพิ่ม Section override':'press + Apply to add a section override',
 'เลือกช่วงแล้ว กด Generate เพื่อสร้างเฉพาะห้องที่เลือก':'Range selected. Press Generate to build just these bars.','กรุณาระบุ BPM ระหว่าง 30–350':'Please enter a BPM between 30 and 350',
 'ฟังและส่งออกเฉพาะช่วงนี้ได้เลย':'listen and export just this range','กำลังโหลดชุดเสียงกลอง…':'Loading the drum kit…',
 'กำลังเล่นกลองและเบส SoundFont · เลือกแยกเครื่องดนตรีก่อนส่งออกได้':'Playing SoundFont drums and bass · you can pick separate instruments before exporting',
 'กำลังสร้าง WAV อีกไฟล์อยู่ กรุณารอสักครู่':'Another WAV is being rendered. Please wait.','กำลังโหลดเสียงและสร้าง WAV 44.1 kHz / 16-bit stereo…':'Loading sounds and rendering WAV 44.1 kHz / 16-bit stereo…',
 'สร้าง WAV ไม่สำเร็จ กรุณาลองอีกครั้ง':'WAV rendering failed. Please try again.','ดาวน์โหลด WAV พร้อมเสียงแล้ว':'WAV downloaded','ห้องที่เลือกต่อกัน เริ่มที่ 0':'selected bars joined, starting at 0',
 'เลือกอย่างน้อยหนึ่งช่วง':'Choose at least one range','โหลดชุดเสียงกลองไม่สำเร็จ กรุณาลองอีกครั้ง':'Couldn’t load the drum kit. Please try again.',
 'WAV รองรับเพลงยาวสูงสุด 10 นาที กรุณาแบ่งท่อนหรือใช้ MIDI':'WAV supports up to 10 minutes. Split the song or use MIDI.'
};
const PATTERNS=[
 [/^(\d+) ห้อง$/,(m,n)=>`${n} bar${n==='1'?'':'s'}`],
 [/^เล่นตาม repeat \/ ending: (\d+) ห้องตามลำดับที่เล่น \(เขียนไว้ (\d+) ห้อง\)$/,'Following repeats / endings: $1 bars in playback order ($2 written)'],
 [/^ลบการตั้งค่า bar (\d+)–(\d+)$/,'Remove the override for bar $1–$2'],
 [/^ตั้งแนว (.+) ให้ bar (\d+)–(\d+) แล้ว$/,'Set $1 for bar $2–$3'],
 [/^ตั้งค่าเริ่มต้นของ (.+): Intensity (\d+)%$/,'Loaded $1 starting settings: Intensity $2%'],
 [/^อ่านไฟล์ไม่สำเร็จ: (.+)$/,(m,e)=>`Couldn’t read the file: ${translate(e)}`],
 [/^ไฟล์ส่งออกมีช่วงเงียบก่อน bar (\d+) วางที่ 0:00 ใน DAW ได้เลย$/,'exports include silence before bar $1, so they drop at 0:00 in your DAW'],
 [/^ไฟล์ส่งออกเริ่มที่ 0 ให้วางที่ bar (\d+) ในเพลงต้นฉบับ$/,'exports start at 0; place them at bar $1 of the original song'],
 [/^\+ ใช้กับ bar (\d+)–(\d+)$/,'+ Apply to bar $1–$2'],
 [/^Generate bar (.+) ต่อกัน (\d+) ห้อง$/,'Generate bars $1 joined, $2 bars'],
 [/^Generate เฉพาะ bar (.+)$/,'Generate only bars $1'],
 [/^กำลังสร้างกลองและเบสเฉพาะ bar (.+)…$/,'Generating drums and bass for bar $1…'],
 [/^สร้าง (\d+) เวอร์ชันสำหรับ bar (.+) สำเร็จ$/,'Created $1 versions for bar $2'],
 [/^สร้างไม่สำเร็จ: (.+)$/,(m,e)=>`Generation failed: ${translate(e)}`],
 [/^สร้าง take ใหม่สำหรับเวอร์ชัน (\d+) แล้ว$/,'New take for version $1'],
 [/^ดาวน์โหลดไม่สำเร็จ: (.+)$/,(m,e)=>`Download failed: ${translate(e)}`],
 [/^เมื่อเล่นตาม repeat แล้วยาวเกิน (\d+) ห้อง กรุณาปิดการเล่นตาม repeat หรือแบ่งเพลง$/,'Following repeats makes this longer than $1 bars. Turn off Follow repeats or split the song.'],
 [/^เลือกห้องเริ่ม–จบระหว่าง 1–(\d+) โดยห้องจบต้องไม่น้อยกว่าห้องเริ่ม$/,'Choose start and end bars between 1 and $1; the end bar can’t come before the start bar'],
 [/^ทำงานไม่สำเร็จ: (.+)$/,(m,e)=>`Something went wrong: ${translate(e)}`]
];
const THAI=/[฀-๿]/,cache=new Map();
export function translate(text){const t=text.trim();if(!THAI.test(t))return text;let out=cache.get(t);if(out===undefined){out=EXACT[t];if(out===undefined&&t.includes(' · '))out=t.split(' · ').map(p=>translate(p)).join(' · ');if(out===undefined)for(const[re,rep]of PATTERNS)if(re.test(t)){out=t.replace(re,rep);break}if(out===undefined)out=t;cache.set(t,out)}return text.replace(t,out)}
// Runtime: keeps the original Thai of each text node / attribute so switching back is exact.
export function initI18n(doc=document,storage=globalThis.localStorage){
 let lang='th';const ORIG=new WeakMap(),LAST=new WeakMap(),ATTRS=['aria-label','placeholder','title','alt'];
 const skip=el=>!el||el.closest('script,style,noscript,[data-noi18n]');
 const text=node=>{if(skip(node.parentElement))return;const cur=node.data;if(cur!==LAST.get(node)){if(THAI.test(cur))ORIG.set(node,cur);else{ORIG.delete(node);LAST.set(node,cur);return}}const orig=ORIG.get(node);if(orig==null)return;const want=lang==='en'?translate(orig):orig;LAST.set(node,want);if(cur!==want)node.data=want};
 const attr=(el,name)=>{if(skip(el)||!el.hasAttribute(name))return;const cur=el.getAttribute(name),store=ORIG.get(el)||{},last=(LAST.get(el)||{})[name];if(cur!==last){if(THAI.test(cur))store[name]=cur;else{delete store[name];ORIG.set(el,store);return}}ORIG.set(el,store);const orig=store[name];if(orig==null)return;const want=lang==='en'?translate(orig):orig;LAST.set(el,{...(LAST.get(el)||{}),[name]:want});if(cur!==want)el.setAttribute(name,want)};
 const tree=root=>{if(root.nodeType===3)return text(root);if(root.nodeType!==1)return;const w=doc.createTreeWalker(root,5);for(let n=root;n;n=w.nextNode()){if(n.nodeType===3)text(n);else ATTRS.forEach(a=>attr(n,a))}};
 new doc.defaultView.MutationObserver(rs=>{for(const r of rs){if(r.type==='characterData')text(r.target);else if(r.type==='attributes')attr(r.target,r.attributeName);else r.addedNodes.forEach(tree)}}).observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
 const set=l=>{lang=l==='en'?'en':'th';doc.documentElement.lang=lang;doc.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));tree(doc.body);try{storage?.setItem('rf-lang',lang)}catch(e){}};
 doc.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>set(b.dataset.lang)));
 let start='th';try{start=storage?.getItem('rf-lang')||((doc.defaultView.navigator.language||'').toLowerCase().startsWith('th')?'th':'en')}catch(e){}
 set(start);return{set,get:()=>lang};
}

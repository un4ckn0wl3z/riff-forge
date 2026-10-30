// Bar map: one cell per played bar, grouped by section. Tap a bar and then another to select a range,
// drag with a mouse, shift-click to extend, or pick a section. Bar numbers follow playback order;
// when repeats are expanded the written bar number is shown underneath.
export class BarMap{
 constructor(root,onSelect){
  this.root=root;this.onSelect=onSelect;this.anchor=0;this.from=1;this.to=1;this.drag=0;this.mouseTap=false;this.cells=[];
  root.innerHTML='<div class="bm-sections"></div><div class="bm-grid" role="group" aria-label="Bars"></div><p class="bm-legend">แตะห้องแรกแล้วแตะห้องสุดท้ายเพื่อเลือกช่วง · ลากเมาส์หรือ Shift+คลิกก็ได้ · <i class="bm-ov-key"></i> ตั้งแนวเฉพาะช่วง</p>';
  this.grid=root.querySelector('.bm-grid');this.sections=root.querySelector('.bm-sections');
  const barOf=e=>{const el=e.target.closest?.('.bm-bar');return el?+el.dataset.n:0};
  this.grid.addEventListener('pointerdown',e=>{const n=barOf(e);if(!n||e.pointerType!=='mouse'||e.button!==0)return;this.tap(n,e.shiftKey);this.drag=e.shiftKey?0:n;this.mouseTap=true});
  this.grid.addEventListener('pointerover',e=>{const n=barOf(e);if(!n||!this.drag||!(e.buttons&1)||n===this.drag)return;this.anchor=0;this.onSelect(this.drag,n)});
  addEventListener('pointerup',()=>{this.drag=0});
  // touch, pen and keyboard arrive as click; a mouse press was already handled on pointerdown
  this.grid.addEventListener('click',e=>{const n=barOf(e);if(!n)return;if(this.mouseTap){this.mouseTap=false;return}this.tap(n,e.shiftKey)});
 }
 tap(n,extend){if(extend){const a=this.anchor||this.from;this.anchor=0;this.onSelect(a,n)}else if(this.anchor&&this.anchor!==n){const a=this.anchor;this.anchor=0;this.onSelect(a,n)}else{this.anchor=n;this.onSelect(n,n)}}
 setSong(song){
  this.anchor=0;const grid=document.createDocumentFragment(),chips=[];let prev='';
  song.bars.forEach((bar,i)=>{const n=i+1,meter=bar.numerator+'/'+bar.denominator;
   if(bar.section){const row=document.createElement('div');row.className='bm-sec';row.textContent=bar.section;grid.append(row);chips.push({name:bar.section,from:n})}
   const cell=document.createElement('button');cell.type='button';cell.className='bm-bar';cell.dataset.n=n;
   const num=document.createElement('b');num.textContent=n;cell.append(num);
   const sub=[meter!==prev?meter:'',bar.written&&bar.written!==n?'('+bar.written+')':''].filter(Boolean).join(' ');if(sub){const s=document.createElement('small');s.textContent=sub;cell.append(s)}
   cell.title=`Bar ${n}`+(bar.written&&bar.written!==n?` · written bar ${bar.written}`:'')+` · ${meter}`+(bar.section?` · ${bar.section}`:'');
   prev=meter;grid.append(cell)});
  chips.forEach((c,i)=>{c.to=chips[i+1]?chips[i+1].from-1:song.bars.length});
  this.grid.replaceChildren(grid);this.cells=[...this.grid.querySelectorAll('.bm-bar')];
  this.sections.replaceChildren(...chips.map(c=>{const b=document.createElement('button');b.type='button';b.textContent=`${c.name} ${c.from}–${c.to}`;b.onclick=()=>{this.anchor=0;this.onSelect(c.from,c.to)};return b}));
  this.sections.hidden=!chips.length;
 }
 paint(from,to,overrides=[]){
  this.from=from;this.to=to;
  this.cells.forEach((cell,i)=>{const n=i+1;cell.classList.toggle('sel',n>=from&&n<=to);cell.classList.toggle('anchor',n===this.anchor);cell.classList.toggle('ov',overrides.some(o=>n>=o.from&&n<=o.to))});
 }
}

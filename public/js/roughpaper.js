/* ============ Rough paper — hand-drawing canvas (Samsung Notes style) ============ */
const RoughPaper = (() => {
  let canvas, ctx, drawing=false, tool='pen', color='#1f3c88', last=null;
  let strokes=[]; // for persistence across resize

  function init(){
    const panel=document.getElementById('roughPanel');
    canvas=document.getElementById('roughCanvas');
    ctx=canvas.getContext('2d');

    document.getElementById('roughToggle').onclick=()=>{ panel.classList.add('open'); fit(); };
    document.getElementById('roughClose').onclick=()=>panel.classList.remove('open');
    document.getElementById('roughClear').onclick=clear;

    panel.querySelectorAll('.tool[data-tool]').forEach(b=>b.onclick=()=>{
      tool=b.dataset.tool;
      panel.querySelectorAll('.tool[data-tool]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
    });
    panel.querySelector('.tool[data-tool="pen"]').classList.add('active');

    panel.querySelectorAll('.pen-color').forEach(c=>c.onclick=()=>{
      color=c.dataset.color; tool='pen';
      panel.querySelectorAll('.pen-color').forEach(x=>x.classList.remove('active'));
      c.classList.add('active');
      panel.querySelector('.tool[data-tool="pen"]').classList.add('active');
      panel.querySelector('.tool[data-tool="eraser"]').classList.remove('active');
    });

    // pointer events (mouse + touch + stylus)
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('resize', ()=>{ if(panel.classList.contains('open')) fit(); });
  }

  function pos(e){
    const r=canvas.getBoundingClientRect();
    return { x:(e.clientX-r.left)*(canvas.width/r.width), y:(e.clientY-r.top)*(canvas.height/r.height) };
  }
  function start(e){ drawing=true; last=pos(e); e.preventDefault(); }
  function move(e){
    if(!drawing) return;
    const p=pos(e);
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(tool==='eraser'){ ctx.globalCompositeOperation='destination-out'; ctx.lineWidth=22; }
    else { ctx.globalCompositeOperation='source-over'; ctx.strokeStyle=color; ctx.lineWidth=2.6; }
    ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
    strokes.push({from:last,to:p,tool,color});
    last=p; e.preventDefault();
  }
  function end(){ drawing=false; last=null; }

  function fit(){
    const img=canvas.toDataURL();
    const r=canvas.getBoundingClientRect();
    canvas.width=r.width; canvas.height=r.height;
    // repaint saved strokes
    const image=new Image();
    image.onload=()=>ctx.drawImage(image,0,0,canvas.width,canvas.height);
    image.src=img;
  }
  function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); strokes=[]; }

  return { init };
})();
document.addEventListener('DOMContentLoaded', RoughPaper.init);

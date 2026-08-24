/* ============ Test runner + result with 20% negative marking ============ */
(async function(){
  SagLok.initHeader();
  const {sets, questions} = await SagLok.loadData();
  const qById = SagLok.DATA.qById;
  const LETTERS=['A','B','C','D'];
  const NEG = sets.meta.negativePercent/100;   // 0.2

  const params=new URLSearchParams(location.search);
  const setId=params.get('set');
  const set=sets.sets.find(s=>s.id===setId);

  if(!set){ document.getElementById('setTitle').innerHTML='<p>सेट फेला परेन।</p>'; return; }

  // access gate
  const allowed = set.free || SagLok.hasSet(set.id);
  if(!allowed){
    document.getElementById('testView').classList.add('hidden');
    document.getElementById('setTitle').innerHTML=`
      <div class="paywall"><div class="lock" style="position:static;background:var(--brand-soft);border-radius:16px">
        <div class="big">🔒</div>
        <h3>${set.title}</h3>
        <p>यो सेट अनलक गरिएको छैन। eSewa वा Khalti मार्फत भुक्तानी गरेर खोल्नुहोस्।</p>
        <button class="btn btn-primary btn-lg" id="gate">🔓 अनलक गर्नुहोस्</button>
      </div></div>`;
    document.getElementById('gate').onclick=()=>
      SagLok.openPaywall({type:'set',setId:set.id,title:set.title}, ()=>location.reload());
    return;
  }

  // build question list
  const qs=set.qids.map(id=>qById[id]).filter(Boolean);
  const state={ cur:0, answers:new Array(qs.length).fill(null), flags:new Array(qs.length).fill(false), submitted:false };

  document.getElementById('setTitle').innerHTML=
    `<h2 style="font-size:1.4rem">${set.title}</h2>
     <p style="color:var(--ink-soft);font-size:.9rem">${qs.length} प्रश्न · ${sets.meta.durationMinPerSet} मिनेट · प्रत्येक सही +१, गलत −${NEG} (२०% ऋणात्मक)</p>`;

  /* ---------- render question ---------- */
  function optText(q,i){
    const o=q.opt[i], isObj=Array.isArray(o);
    const np=isObj?o[0]:o, en=isObj?o[1]:'';
    const showEn=en&&en!==np;
    return `${np}${showEn?`<span class="en">${en}</span>`:''}`;
  }
  function renderQ(){
    const q=qs[state.cur];
    const passage=q.passage?questions.passages[q.passage]:null;
    const passHTML=passage?`<div class="passage-box"><b>${passage.title}</b>\n${passage.text}</div>`:'';
    const qEn=(q.qe&&q.qe!==q.qn)?`<span class="en">${q.qe}</span>`:'';
    const typeName=questions.meta.types[q.type]||q.type;
    document.getElementById('testQ').innerHTML=`
      <div class="barcount">प्रश्न ${state.cur+1} / ${qs.length} <span class="type-chip" style="margin-left:8px">${typeName}</span> <span class="yr" style="color:var(--ink-soft)">${q.year||''}</span></div>
      ${passHTML}
      <div class="tqtext">${q.qn}${qEn}</div>
      <ul class="test-opts" id="testOpts">
        ${q.opt.map((_,i)=>`<li data-i="${i}" class="${state.answers[state.cur]===i?'sel':''}">
          <span class="lab">${LETTERS[i]}</span><span>${optText(q,i)}</span></li>`).join('')}
      </ul>`;
    document.querySelectorAll('#testOpts li').forEach(li=>li.onclick=()=>{
      state.answers[state.cur]=+li.dataset.i;
      renderQ(); renderPalette();
    });
    document.getElementById('flagBtn').innerHTML=state.flags[state.cur]?'⚑ चिन्ह हटाउनुहोस्':'⚑ चिन्ह लगाउनुहोस्';
    document.getElementById('prevBtn').disabled=state.cur===0;
    document.getElementById('nextBtn').disabled=state.cur===qs.length-1;
  }

  /* ---------- palette ---------- */
  function renderPalette(){
    const pal=document.getElementById('palette');
    pal.innerHTML=qs.map((_,i)=>{
      let cls='pal';
      if(state.answers[i]!==null) cls+=' answered';
      if(state.flags[i]) cls+=' flagged';
      if(i===state.cur) cls+=' current';
      return `<button class="${cls}" data-i="${i}">${i+1}</button>`;
    }).join('');
    pal.querySelectorAll('.pal').forEach(b=>b.onclick=()=>{ state.cur=+b.dataset.i; renderQ(); renderPalette(); });
  }

  document.getElementById('prevBtn').onclick=()=>{ if(state.cur>0){state.cur--;renderQ();renderPalette();} };
  document.getElementById('nextBtn').onclick=()=>{ if(state.cur<qs.length-1){state.cur++;renderQ();renderPalette();} };
  document.getElementById('flagBtn').onclick=()=>{ state.flags[state.cur]=!state.flags[state.cur]; renderQ(); renderPalette(); };
  document.getElementById('clearBtn').onclick=()=>{ state.answers[state.cur]=null; renderQ(); renderPalette(); };

  /* ---------- timer ---------- */
  let remaining=sets.meta.durationMinPerSet*60;
  const clock=document.getElementById('clock'), tCard=document.getElementById('timerCard');
  function tick(){
    const m=Math.floor(remaining/60), s=remaining%60;
    clock.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(remaining<=60) tCard.classList.add('warn');
    if(remaining<=0){ clearInterval(timer); SagLok.toast('समय सकियो — परीक्षा बुझाइँदै','err'); submit(); return; }
    remaining--;
  }
  tick(); const timer=setInterval(tick,1000);

  /* ---------- submit ---------- */
  document.getElementById('submitBtn').onclick=()=>{
    const answered=state.answers.filter(a=>a!==null).length;
    if(confirm(`${answered}/${qs.length} प्रश्नको उत्तर दिइएको छ। परीक्षा बुझाउने?`)) submit();
  };

  function submit(){
    if(state.submitted) return;
    state.submitted=true;
    clearInterval(timer);
    document.getElementById('roughPanel').classList.remove('open');

    let correct=0, wrong=0, skipped=0;
    qs.forEach((q,i)=>{
      if(state.answers[i]===null) skipped++;
      else if(state.answers[i]===q.ans) correct++;
      else wrong++;
    });
    const negLoss=+(wrong*NEG).toFixed(2);
    const raw=correct;
    const final=+(raw-negLoss).toFixed(2);
    const maxMarks=qs.length;
    const pct=Math.max(0,Math.round((final/maxMarks)*100));
    const roll=SagLok.getRoll();
    const passPct=40;
    const passed=pct>=passPct;

    renderResult({correct,wrong,skipped,negLoss,raw,final,maxMarks,pct,roll,passed});
  }

  function ring(pct,color){
    const r=64, c=2*Math.PI*r, off=c*(1-pct/100);
    return `<svg class="score-ring" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="14"/>
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 75 75)"/>
      <text x="75" y="72" text-anchor="middle" font-size="30" font-weight="800" font-family="Inter" fill="var(--ink)">${pct}%</text>
      <text x="75" y="96" text-anchor="middle" font-size="12" fill="var(--ink-soft)">स्कोर</text>
    </svg>`;
  }

  function renderResult(r){
    document.getElementById('testView').classList.add('hidden');
    document.getElementById('setTitle').classList.add('hidden');
    const rv=document.getElementById('resultView');
    rv.classList.remove('hidden');

    const reviewHTML=qs.map((q,i)=>{
      const ua=state.answers[i];
      const cls=ua===null?'sk':(ua===q.ans?'ok':'no');
      const yourTxt=ua===null?'<span style="color:var(--ink-soft)">छोडिएको</span>':
        `<span class="${ua===q.ans?'ok-t':'no-t'}">${LETTERS[ua]}. ${optPlain(q,ua)}</span>`;
      const correctLine=(ua===q.ans)?'':`<div class="rline">सही उत्तर: <span class="ok-t">${LETTERS[q.ans]}. ${optPlain(q,q.ans)}</span></div>`;
      return `<div class="review-item ${cls}">
        <div class="rtop"><span class="rnum">${i+1}</span><div class="rq">${q.qn}</div></div>
        <div class="rline">तपाईंको उत्तर: <span class="yours">${yourTxt}</span></div>
        ${correctLine}
        <div class="rexp"><b>व्याख्या:</b> ${q.exp||'—'}</div>
      </div>`;
    }).join('');

    rv.innerHTML=`
      <div class="result-hero">
        <div class="roll">रोल नम्बर: <b>${r.roll}</b> · सेट: ${set.id}</div>
        ${ring(r.pct, r.passed?'var(--ok)':'var(--bad)')}
        <div class="verdict ${r.passed?'pass':'fail'}">${r.passed?'✓ उत्तीर्ण':'✗ अनुत्तीर्ण'}</div>
        <p style="color:var(--ink-soft);font-size:.9rem;margin-top:4px">अन्तिम अंक: <b>${r.final}</b> / ${r.maxMarks} · उत्तीर्णांक ${40}%</p>
        <div class="score-break">
          <div class="sb correct"><b>${r.correct}</b><span>सही (+${r.correct})</span></div>
          <div class="sb wrong"><b>${r.wrong}</b><span>गलत</span></div>
          <div class="sb skip"><b>${r.skipped}</b><span>छोडिएको</span></div>
          <div class="sb neg"><b>−${r.negLoss}</b><span>ऋणात्मक (२०%)</span></div>
        </div>
        <div style="margin-top:18px;font-size:.88rem;color:var(--ink-soft);background:var(--surface-2);border-radius:10px;padding:12px 15px;text-align:left">
          <b>गणना:</b> सही उत्तर ${r.correct} × १ = ${r.raw} अंक · गलत ${r.wrong} × ०.२ = −${r.negLoss} अंक ·
          <b>अन्तिम = ${r.raw} − ${r.negLoss} = ${r.final} अंक</b>
        </div>
        <div class="test-nav" style="justify-content:center;margin-top:20px">
          <a href="sets.html" class="btn btn-ghost">← अन्य सेट</a>
          <button class="btn btn-primary" onclick="location.reload()">🔁 पुनः प्रयास</button>
        </div>
      </div>
      <div class="sec-head" style="margin:10px 0 18px"><h2 style="font-size:1.4rem">उत्तरसहित समीक्षा</h2>
        <p>प्रत्येक प्रश्नको तपाईंको उत्तर, सही उत्तर र व्याख्या।</p></div>
      ${reviewHTML}`;
    window.scrollTo({top:0,behavior:'smooth'});
    SagLok.toast(r.passed?'बधाई छ! उत्तीर्ण':'फेरि अभ्यास गरौँ', r.passed?'ok':'');
  }
  function optPlain(q,i){ const o=q.opt[i]; return Array.isArray(o)?o[0]:o; }

  // init
  renderQ(); renderPalette();
  window.addEventListener('beforeunload',e=>{ if(!state.submitted){ e.preventDefault(); e.returnValue=''; } });
})();

/* ============ Topic-wise practice ============ */
(async function(){
  SagLok.initHeader('practice');
  SagLok.handleReturn(()=>location.reload());
  const {syllabus, questions} = await SagLok.loadData();
  const LETTERS=['A','B','C','D'];

  // build unit meta map + question groups
  const unitMeta={}; const partOf={};
  syllabus.parts.forEach(p=>p.units.forEach(u=>{unitMeta[u.id]=u; partOf[u.id]=p;}));
  const orderedUnits = syllabus.parts.flatMap(p=>p.units.map(u=>u.id));
  const qByUnit={};
  questions.questions.forEach(q=>{ (qByUnit[q.unit]=qByUnit[q.unit]||[]).push(q); });

  // free = first half of units
  const half = Math.ceil(orderedUnits.length/2);
  const freeUnits = new Set(orderedUnits.slice(0,half));
  const isUnitFree = uid => freeUnits.has(uid) || SagLok.hasFullAccess();

  /* ---- topic nav ---- */
  const navEl=document.getElementById('topicNav');
  let navHTML='';
  syllabus.parts.forEach(p=>{
    navHTML+=`<h4>${p.nameNp}</h4>`;
    p.units.forEach(u=>{
      const cnt=(qByUnit[u.id]||[]).length;
      const lock = isUnitFree(u.id)?'':' 🔒';
      navHTML+=`<a data-unit="${u.id}"><span>${u.nameNp}${lock}</span><span class="cnt">${cnt}</span></a>`;
    });
  });
  navEl.innerHTML=navHTML;

  /* ---- render one unit ---- */
  function optHTML(q,i){
    const o=q.opt[i];
    const isObj=Array.isArray(o);
    const np=isObj?o[0]:o, en=isObj?o[1]:'';
    const showEn = en && en!==np;
    return `<li><span class="lab">${LETTERS[i]}.</span><span>${np}${showEn?`<span class="en">${en}</span>`:''}</span></li>`;
  }

  function questionCard(q, n){
    const passage = q.passage ? questions.passages[q.passage] : null;
    const passHTML = passage ? `<div class="passage-box"><b>${passage.title}</b>\n${passage.text}</div>` : '';
    const qEn = (q.qe && q.qe!==q.qn) ? `<span class="en">${q.qe}</span>` : '';
    const typeName = questions.meta.types[q.type] || q.type;
    return `<div class="q-card">
      <div class="qhead">
        <div class="qnum">${n}</div>
        <div class="qmeta"><span class="type-chip">${typeName}</span><span class="yr">${q.year||''}</span></div>
      </div>
      <div class="q-split">
        <div class="qmain">
          ${passHTML}
          <div class="q-text">${q.qn}${qEn}</div>
          <ul class="opts">${q.opt.map((_,i)=>optHTML(q,i)).join('')}</ul>
        </div>
        <div class="qside">
          <div class="ans-tag"><span class="ans-letter">${LETTERS[q.ans]}</span> सही उत्तर</div>
          <div class="exp"><b>व्याख्या:</b> ${q.exp||'—'}</div>
        </div>
      </div>
    </div>`;
  }

  function renderUnit(uid){
    navEl.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.unit===uid));
    const u=unitMeta[uid], list=qByUnit[uid]||[];
    const area=document.getElementById('qArea');
    const trendCls = /बढ|तीव्र/.test(u.trend)?'trend-up':(/घट/.test(u.trend)?'trend-down':'');

    let head=`<div class="unit-detail open" style="margin-bottom:20px"><div class="uh" style="cursor:default">
      <span class="tag" style="background:var(--brand)">${u.id}</span>
      <div class="titles"><b>${u.nameNp}</b><span>${u.nameEn} · ${list.length} प्रश्न</span></div>
    </div>
    <div class="ubody" style="display:block">
      <div class="meta-pills">
        <span class="pill">भार: ${u.share}%</span>
        <span class="pill">कठिनाइ: ${u.difficulty}</span>
        <span class="pill ${trendCls}">प्रवृत्ति: ${u.trend}</span>
      </div>
      <div class="strategy-box"><b>यस इकाईमा प्रायः:</b> ${u.qTypes.map(t=>t.t+' ('+t.pct+'%)').join(' · ')}</div>
    </div></div>`;

    if(isUnitFree(uid)){
      area.innerHTML = head + list.map((q,i)=>questionCard(q,i+1)).join('');
    } else {
      // paywall: show first 1 free peek, blur rest
      const peek = list.slice(0,1).map((q,i)=>questionCard(q,i+1)).join('');
      area.innerHTML = head + peek + `
        <div class="paywall">
          <div class="blur-peek">${list.slice(1,3).map((q,i)=>questionCard(q,i+2)).join('')}</div>
          <div class="lock">
            <div class="big">🔒</div>
            <h3>${u.nameNp} — बाँकी ${list.length-1} प्रश्न</h3>
            <p>यो इकाई निःशुल्क सीमाभन्दा बाहिर छ। सम्पूर्ण टपिकवार प्रश्न, विकल्प र व्याख्या खोल्न कृपया भुक्तानी गरी अगाडि बढ्नुहोस्।</p>
            <button class="btn btn-primary btn-lg" id="unlockPractice">🔓 पूर्ण पहुँच अनलक गर्नुहोस्</button>
          </div>
        </div>`;
      document.getElementById('unlockPractice').onclick=()=>
        SagLok.openPaywall({type:'full'}, ()=>{ location.reload(); });
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  navEl.querySelectorAll('a').forEach(a=>a.onclick=()=>renderUnit(a.dataset.unit));
  renderUnit(orderedUnits[0]);
})();

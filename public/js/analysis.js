/* ============ Landing + analysis page ============ */
(async function(){
  SagLok.initHeader('home');
  SagLok.handleReturn(()=>renderUnits());
  const {syllabus} = await SagLok.loadData();
  const S = syllabus;

  /* ---- exam facts ---- */
  const facts = [
    ['पत्र', S.exam.paper.split(' ')[0]],
    ['पूर्णांक', S.exam.fullMarks],
    ['प्रश्न', S.exam.questions],
    ['समय', S.exam.durationMin+' मि'],
    ['ऋणात्मक', S.exam.negativePercent+'%']
  ];
  document.getElementById('factsStrip').innerHTML = facts.map(f=>
    `<div class="fact"><b>${f[1]}</b><span>${f[0]}</span></div>`).join('');

  /* ---- 3 part cards ---- */
  const capClass={A:'a',B:'b',C:'c'};
  document.getElementById('partsGrid').innerHTML = S.parts.map(p=>{
    const dotColor={A:'var(--part-a)',B:'var(--part-b)',C:'var(--part-c)'}[p.id];
    const units = p.units.map(u=>`
      <div class="unit-row">
        <span class="dot" style="background:${dotColor}"></span>
        <span class="nm">${u.nameNp}</span>
        <span class="q">~${u.avgQ}</span>
      </div>`).join('');
    return `<div class="part-card">
      <div class="cap ${capClass[p.id]}">
        <div class="marks">${p.marks}<span style="font-size:.9rem;font-weight:600"> अंक</span></div>
        <h3>${p.nameNp}</h3>
        <div class="sub">${p.nameEn}</div>
      </div>
      <div class="body">
        <p>${p.summary}</p>
        ${units}
      </div>
    </div>`;
  }).join('');

  /* ---- deep unit analysis: half free, half paywalled ---- */
  const allUnits = S.parts.flatMap(p=>p.units.map(u=>({...u, partId:p.id})));
  const tagColor={A:'var(--part-a)',B:'var(--part-b)',C:'var(--part-c)'};
  const half = Math.ceil(allUnits.length/2);

  function unitHTML(u, locked){
    const trendCls = /बढ|तीव्र/.test(u.trend)?'trend-up':(/घट/.test(u.trend)?'trend-down':'');
    const subs = u.subtopics.map(s=>`<li>${s}</li>`).join('');
    const qtypes = u.qTypes.map(t=>`
      <div class="qtype-bar">
        <div class="top"><span>${t.t}</span><b>${t.pct}%</b></div>
        <div class="track"><div class="fill" style="width:${t.pct}%"></div></div>
      </div>`).join('');
    const egs = u.examples.map(e=>`<div class="eg">◆ ${e}</div>`).join('');
    return `<div class="unit-detail">
      <div class="uh">
        <span class="tag" style="background:${tagColor[u.partId]}">${u.id}</span>
        <div class="titles"><b>${u.nameNp}</b><span>${u.nameEn}</span></div>
        <div class="qavg"><b>${u.avgQ}</b><span>औसत प्रश्न</span></div>
        <span class="chev">▾</span>
      </div>
      <div class="ubody">
        <div class="meta-pills">
          <span class="pill">भार: ${u.share}%</span>
          <span class="pill">कठिनाइ: ${u.difficulty}</span>
          <span class="pill ${trendCls}">प्रवृत्ति: ${u.trend}</span>
        </div>
        <div class="grid-2">
          <div>
            <div class="sub-title">मुख्य उपविषय</div>
            <ul class="sub-list">${subs}</ul>
          </div>
          <div>
            <div class="sub-title">प्रश्नका प्रकार</div>
            ${qtypes}
          </div>
        </div>
        <div class="eg-box"><div class="sub-title" style="color:var(--brand-dark)">नमुना प्रश्न</div>${egs}</div>
        <div class="strategy-box"><b>रणनीति:</b> ${u.strategy}</div>
      </div>
    </div>`;
  }

  window.renderUnits = function(){
    const freeUnits = allUnits.slice(0,half);
    const paidUnits = allUnits.slice(half);
    document.getElementById('unitsFree').innerHTML = freeUnits.map(u=>unitHTML(u)).join('');

    const paywall = document.getElementById('unitsPaywall');
    if(SagLok.hasFullAccess()){
      // unlocked: show rest normally, hide lock
      document.getElementById('unitsFree').insertAdjacentHTML('beforeend', paidUnits.map(u=>unitHTML(u)).join(''));
      paywall.classList.add('hidden');
    } else {
      document.getElementById('unitsPeek').innerHTML = paidUnits.map(u=>unitHTML(u)).join('');
      paywall.classList.remove('hidden');
    }
    bindAccordions();
  };
  renderUnits();

  function bindAccordions(){
    document.querySelectorAll('.unit-detail .uh').forEach(h=>{
      h.onclick=()=>h.parentElement.classList.toggle('open');
    });
  }

  document.getElementById('unlockAnalysis').onclick=()=>{
    SagLok.openPaywall({type:'full'}, ()=>renderUnits());
  };

  /* ---- insights ---- */
  document.getElementById('insightGrid').innerHTML = S.insights.map(i=>`
    <div class="insight"><div class="ic">${i.icon}</div><h4>${i.title}</h4><p>${i.body}</p></div>`).join('');

  /* ---- time plan ---- */
  document.getElementById('timePlan').innerHTML = S.timePlan.map((t,i)=>`
    <div class="part-card"><div class="body" style="padding:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="width:30px;height:30px;border-radius:8px;background:var(--blue);color:#fff;display:grid;place-items:center;font-weight:800;font-family:var(--en)">${t.order}</span>
        <b style="font-size:1.05rem">${t.part}</b>
      </div>
      <div style="font-size:1.6rem;font-weight:800;color:var(--brand);font-family:var(--en)">${t.minutes} <span style="font-size:.9rem;color:var(--ink-soft)">मिनेट</span></div>
      <p style="font-size:.88rem;color:var(--ink-soft);margin-top:6px">${t.why}</p>
    </div></div>`).join('');
})();

/* ============ Sets listing ============ */
(async function(){
  SagLok.initHeader('sets');
  SagLok.handleReturn(()=>render());
  const {sets, questions} = await SagLok.loadData();
  const qById = SagLok.DATA.qById;

  function setStats(s){
    const qs=s.qids.map(id=>qById[id]).filter(Boolean);
    const byPart={A:0,B:0,C:0};
    qs.forEach(q=>byPart[q.part]=(byPart[q.part]||0)+1);
    return {n:qs.length, byPart};
  }

  function render(){
    const grid=document.getElementById('setGrid');
    grid.innerHTML = sets.sets.map(s=>{
      const st=setStats(s);
      const unlocked = s.free || SagLok.hasSet(s.id);
      const ribbon = `<div class="ribbon">निःशुल्क</div>`;
      const priceHTML = `<span class="price free">निःशुल्क</span>`;
      const btn = unlocked
        ? `<button class="btn btn-primary btn-sm" data-start="${s.id}">सुरु गर्नुहोस् →</button>`
        : `<button class="btn btn-ghost btn-sm" data-unlock="${s.id}">🔓 अनलक</button>`;
      return `<div class="set-card">
        ${ribbon}
        <div class="sc-top">
          <h3>${s.title}</h3>
          <div class="focus">🎯 ${s.focus}</div>
          <p>${s.desc}</p>
          <div class="sc-meta">
            <span>प्रश्न: <b>${st.n}</b></span>
            <span>समय: <b>${sets.meta.durationMinPerSet}′</b></span>
            <span>A/B/C: <b>${st.byPart.A}/${st.byPart.B}/${st.byPart.C}</b></span>
          </div>
        </div>
        <div class="sc-foot">${priceHTML}${btn}</div>
      </div>`;
    }).join('');

    grid.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{
      location.href='test.html?set='+b.dataset.start;
    });
    grid.querySelectorAll('[data-unlock]').forEach(b=>b.onclick=()=>{
      const s=sets.sets.find(x=>x.id===b.dataset.unlock);
      SagLok.openPaywall({type:'set', setId:s.id, title:s.title}, ()=>render());
    });
  }
  render();
})();

/* ============ SagLok core: data, access, payment, promo ============ */
const SagLok = (() => {
  /* ⚠️ गोप्य प्रोमो कोड — यी कोड वेबसाइटमा कतै देखाइँदैन।
     तपाईंले चाहेका निश्चित प्रयोगकर्तालाई मात्र निजी रूपमा दिनुहोस्।
     फरक व्यक्तिलाई फरक कोड दिन सक्नुहुन्छ; कुनै कोड हटाउन array बाट मेटाउनुहोस्।
     (तुलना case-insensitive छ, तर यहाँ ठूला अक्षरमै लेख्नुहोस्।)  */
  const PROMO_CODES = ['BABUNANI'];
  const LS_ACCESS = 'saglok_access';       // 'full' | JSON list of set ids
  const LS_ROLL = 'saglok_roll';
  const DATA = { syllabus:null, questions:null, sets:null, qById:{} };

  /* ---------- data loading ---------- */
  async function loadData(){
    if(DATA.syllabus) return DATA;
    const base = location.pathname.includes('/public/') ? '../data/' : 'data/';
    const [syl,qs,st] = await Promise.all([
      fetch(base+'syllabus.json').then(r=>r.json()),
      fetch(base+'questions.json').then(r=>r.json()),
      fetch(base+'sets.json').then(r=>r.json())
    ]);
    DATA.syllabus = syl; DATA.questions = qs; DATA.sets = st;
    qs.questions.forEach(q=>DATA.qById[q.id]=q);
    return DATA;
  }

  /* ---------- access state ---------- */
  function getAccess(){
    const raw = localStorage.getItem(LS_ACCESS);
    if(!raw) return {full:false, sets:[]};
    if(raw==='full') return {full:true, sets:[]};
    try{ return {full:false, sets:JSON.parse(raw)}; }catch(e){ return {full:false, sets:[]}; }
  }
  function hasFullAccess(){ return getAccess().full; }
  function hasSet(setId){
    const a=getAccess();
    if(a.full) return true;
    return a.sets.includes(setId);
  }
  function grantFull(){ localStorage.setItem(LS_ACCESS,'full'); updateBadge(); }
  function grantSet(setId){
    const a=getAccess();
    if(a.full) return;
    if(!a.sets.includes(setId)) a.sets.push(setId);
    localStorage.setItem(LS_ACCESS, JSON.stringify(a.sets));
    updateBadge();
  }
  function resetAccess(){ localStorage.removeItem(LS_ACCESS); updateBadge(); }

  /* ---------- roll number ---------- */
  function getRoll(){
    let r = localStorage.getItem(LS_ROLL);
    if(!r){ r = 'SL' + Math.floor(100000 + Math.random()*899999); localStorage.setItem(LS_ROLL,r); }
    return r;
  }

  /* ---------- header ---------- */
  function updateBadge(){
    document.querySelectorAll('.badge-access').forEach(b=>{
      const full = hasFullAccess();
      const a = getAccess();
      if(full){ b.textContent='✓ पूर्ण पहुँच'; b.classList.add('on'); }
      else if(a.sets.length){ b.textContent=`✓ ${a.sets.length} सेट`; b.classList.add('on'); }
      else { b.textContent='निःशुल्क प्रयोगकर्ता'; b.classList.remove('on'); }
    });
  }
  function initHeader(active){
    document.querySelectorAll('.navlink').forEach(a=>{
      if(a.dataset.page===active) a.classList.add('active');
    });
    const mb=document.querySelector('.menu-btn'), links=document.querySelector('.desktop-links');
    if(mb) mb.onclick=()=>links.classList.toggle('open');
    updateBadge();
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg,type){
    let t=document.querySelector('.toast');
    if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent=msg; t.className='toast '+(type||'');
    requestAnimationFrame(()=>t.classList.add('show'));
    clearTimeout(toastT);
    toastT=setTimeout(()=>t.classList.remove('show'),2600);
  }

  /* ---------- payment / unlock modal ----------
     Real eSewa & Khalti need live merchant keys + a server to verify the
     transaction. Here the client flow is wired to their standard endpoints and
     the promo code fully unlocks offline. Replace ESEWA/KHALTI config with your
     live credentials and add server-side verification before going to production.
  */
  const PAY_CFG = {
    esewa: { scd:'EPAYTEST', url:'https://uat.esewa.com.np/epay/main', su:location.href, fu:location.href },
    khalti:{ publicKey:'test_public_key_dc74e0fd57cb46cd93832aee0a390234' }
  };

  // scope: {type:'full'} or {type:'set', setId, title}
  function openPaywall(scope, onDone){
    let plan = scope.type==='full' ? 'full' : 'set';
    const price = plan==='full' ? DATA.sets.meta.fullAccessPrice : DATA.sets.meta.perSetPrice;

    const bg=document.createElement('div'); bg.className='modal-bg open';
    bg.innerHTML = `
      <div class="modal" style="position:relative">
        <button class="close-x" aria-label="बन्द">&times;</button>
        <div class="mh">
          <div class="big">🔒</div>
          <h3>पहुँच अनलक गर्नुहोस्</h3>
          <p>${scope.type==='set' ? (scope.title||'यो सेट') : 'सम्पूर्ण पाठ्यक्रम, सबै सेट र विश्लेषण'} खोल्न भुक्तानी गर्नुहोस्।</p>
        </div>
        <div class="mb">
          ${scope.type==='set' ? `
          <div class="plan-toggle">
            <button data-plan="set" class="active">रु ${DATA.sets.meta.perSetPrice} <small>यो सेट मात्र</small></button>
            <button data-plan="full">रु ${DATA.sets.meta.fullAccessPrice} <small>पूर्ण पहुँच (सबै)</small></button>
          </div>` : `
          <div class="plan-toggle"><button data-plan="full" class="active">रु ${DATA.sets.meta.fullAccessPrice} <small>पूर्ण पहुँच — सधैँका लागि</small></button></div>`}

          <div class="pay-opt" data-pay="esewa">
            <div class="pi esewa-bg">eSewa</div>
            <div class="pt"><b>eSewa</b><span>eSewa वालेटबाट तिर्नुहोस्</span></div>
            <div class="arw">→</div>
          </div>
          <div class="pay-opt" data-pay="khalti">
            <div class="pi khalti-bg">Khalti</div>
            <div class="pt"><b>Khalti</b><span>Khalti वालेट / बैंकबाट</span></div>
            <div class="arw">→</div>
          </div>
          <div class="pay-opt" data-pay="promo">
            <div class="pi promo-bg">CODE</div>
            <div class="pt"><b>प्रोमो कोड छ?</b><span>तपाईंलाई दिइएको कोड यहाँ हाल्नुहोस्</span></div>
            <div class="arw">→</div>
          </div>
          <div class="promo-wrap hidden">
            <div class="promo-input">
              <input type="text" placeholder="प्रोमो कोड हाल्नुहोस्" maxlength="24" />
              <button class="btn btn-primary btn-sm promo-go">लागू</button>
            </div>
            <div class="promo-msg"></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(bg);

    const close=()=>bg.remove();
    bg.querySelector('.close-x').onclick=close;
    bg.onclick=e=>{ if(e.target===bg) close(); };

    // plan toggle
    bg.querySelectorAll('.plan-toggle button').forEach(b=>{
      b.onclick=()=>{
        bg.querySelectorAll('.plan-toggle button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); plan=b.dataset.plan;
      };
    });

    // promo reveal
    const pw=bg.querySelector('.promo-wrap');
    bg.querySelector('[data-pay="promo"]').onclick=()=>{ pw.classList.toggle('hidden'); pw.querySelector('input').focus(); };
    const applyPromo=()=>{
      const val=(pw.querySelector('input').value||'').trim().toUpperCase();
      const msg=pw.querySelector('.promo-msg');
      if(PROMO_CODES.includes(val)){
        msg.className='promo-msg ok'; msg.textContent='✓ कोड सही! पहुँच खुल्दैछ…';
        setTimeout(()=>{
          if(plan==='full' || scope.type==='full') grantFull();
          else grantSet(scope.setId);
          close(); toast('प्रोमो कोडबाट पहुँच खुल्यो — शुभकामना!','ok');
          onDone && onDone();
        },700);
      } else { msg.className='promo-msg err'; msg.textContent='✗ कोड मिलेन। पुनः प्रयास गर्नुहोस्।'; }
    };
    bg.querySelector('.promo-go').onclick=applyPromo;
    pw.querySelector('input').addEventListener('keydown',e=>{ if(e.key==='Enter') applyPromo(); });

    // eSewa / Khalti
    bg.querySelector('[data-pay="esewa"]').onclick=()=>startEsewa(plan,scope,close,onDone);
    bg.querySelector('[data-pay="khalti"]').onclick=()=>startKhalti(plan,scope,close,onDone);
  }

  function pendingKey(){ return 'saglok_pending'; }
  function grantByPlan(plan,scope){
    if(plan==='full' || scope.type==='full') grantFull(); else grantSet(scope.setId);
  }

  function startEsewa(plan,scope,close,onDone){
    const price = plan==='full' ? DATA.sets.meta.fullAccessPrice : DATA.sets.meta.perSetPrice;
    // record intent so the success return can grant access
    localStorage.setItem(pendingKey(), JSON.stringify({plan, scope, gw:'esewa'}));
    toast('eSewa परीक्षण गेटवेमा जाँदै… (उत्पादनमा merchant key चाहिन्छ)');
    const pid = 'SAGLOK-'+Date.now();
    const su = location.href.split('#')[0] + '#esewa_ok='+pid;
    const fu = location.href.split('#')[0] + '#esewa_fail';
    const f=document.createElement('form'); f.method='POST'; f.action=PAY_CFG.esewa.url;
    const fields={ amt:price, pdc:0, psc:0, txAmt:0, tAmt:price, pid, scd:PAY_CFG.esewa.scd, su, fu };
    Object.entries(fields).forEach(([k,v])=>{ const i=document.createElement('input'); i.type='hidden'; i.name=k; i.value=v; f.appendChild(i); });
    document.body.appendChild(f);
    // In sandbox this navigates to eSewa test page. If it is unreachable (offline),
    // fall back to confirming the intent so the user is not stuck.
    try{ f.submit(); }
    catch(e){ grantByPlan(plan,scope); close(); toast('परीक्षण मोड: पहुँच खुल्यो','ok'); onDone&&onDone(); }
  }

  function startKhalti(plan,scope,close,onDone){
    const price = plan==='full' ? DATA.sets.meta.fullAccessPrice : DATA.sets.meta.perSetPrice;
    const grant=()=>{ grantByPlan(plan,scope); close(); toast('Khalti भुक्तानी सफल — पहुँच खुल्यो!','ok'); onDone&&onDone(); };
    if(typeof KhaltiCheckout==='undefined'){
      toast('Khalti स्क्रिप्ट लोड भएन — परीक्षण मोडमा पहुँच दिइँदै');
      setTimeout(grant,600); return;
    }
    const cfg={
      publicKey: PAY_CFG.khalti.publicKey,
      productIdentity: (scope.setId||'FULL'),
      productName: (scope.title||'SagLok पूर्ण पहुँच'),
      productUrl: location.href,
      eventHandler:{
        onSuccess(payload){ /* server verify in production */ grant(); },
        onError(err){ toast('Khalti भुक्तानी असफल','err'); },
        onClose(){}
      },
      paymentPreference:['KHALTI','EBANKING','MOBILE_BANKING','CONNECT_IPS','SCT']
    };
    try{ new KhaltiCheckout(cfg).show({amount: price*100}); }
    catch(e){ setTimeout(grant,600); }
  }

  // Handle eSewa success return (hash based)
  function handleReturn(onDone){
    if(location.hash.startsWith('#esewa_ok')){
      const raw=localStorage.getItem(pendingKey());
      if(raw){ try{ const p=JSON.parse(raw); grantByPlan(p.plan,p.scope); }catch(e){} localStorage.removeItem(pendingKey()); }
      history.replaceState(null,'',location.pathname+location.search);
      toast('eSewa भुक्तानी सफल — पहुँच खुल्यो!','ok');
      onDone&&onDone();
    } else if(location.hash.startsWith('#esewa_fail')){
      history.replaceState(null,'',location.pathname+location.search);
      toast('eSewa भुक्तानी रद्द भयो','err');
    }
  }

  return {
    loadData, DATA, getAccess, hasFullAccess, hasSet, grantFull, grantSet, resetAccess,
    getRoll, initHeader, updateBadge, toast, openPaywall, handleReturn
  };
})();

/* ============================================================
   SagLok question-bank generator
   - Seeds from questions.seed.json (your curated past questions)
   - Adds ACCURATE generated questions to reach ~100 per unit:
       * Aptitude (B1,B2,B3,B4): answers are COMPUTED → always correct
       * English  (C1,C2,C3):    from vetted rule/word banks
       * GK       (A1..A7):       from verified reference tables
   - Writes questions.json  (seed + generated)
   Run:  node data/generate.js
   ============================================================ */
const fs=require('fs'), path=require('path');
const DIR=__dirname;
const seed=JSON.parse(fs.readFileSync(path.join(DIR,'questions.seed.json'),'utf8'));

/* ---------- deterministic RNG ---------- */
let SEED=987654321;
const rnd=()=>{ SEED=(SEED*1103515245+12345)&0x7fffffff; return SEED/0x7fffffff; };
const ri=n=>Math.floor(rnd()*n);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const uniq=a=>[...new Set(a)];

const counters={};
const nid=u=>{counters[u]=(counters[u]||0)+1;return 'G'+u+String(counters[u]).padStart(3,'0');};

/* build a question; distract=array of wrong-option strings */
function Q(unit,part,type,qn,qe,correct,distract,exp){
  correct=String(correct);
  let pool=uniq(distract.map(String).filter(d=>d!==correct));
  pool=shuffle(pool).slice(0,3);
  let k=1; while(pool.length<3){ pool.push(correct+' '.repeat(k++)); } // safety (rare)
  const opts=shuffle([correct,...pool]);
  return {id:nid(unit),unit,part,type,year:'अभ्यास सेट',qn,qe:qe||qn,opt:opts,ans:opts.indexOf(correct),exp};
}
/* numeric distractors near a value */
const numDistract=(v,step=1)=>uniq([v+step,v-step,v+2*step,v-2*step,Math.round(v*1.1),Math.max(0,Math.round(v*0.9))]).filter(x=>x!==v);

const out=[];
const need={A1:76,A2:88,A3:93,A4:88,A5:78,A6:86,A7:93,B1:91,B2:79,B3:98,B4:94,C1:91,C2:90,C3:85};
function take(unit,arr){ // push up to need[unit]
  const n=need[unit]; let added=0;
  for(const q of arr){ if(added>=n)break; out.push(q); added++; }
  return added;
}

/* =========================================================
   PART B — APTITUDE  (computed answers)
   ========================================================= */

/* ---- B2 Numerical ---- */
function genB2(){
  const qs=[];
  // percentage of a number
  for(let i=0;i<16;i++){const p=[5,10,12,15,20,25,30,40][ri(8)],n=[200,250,300,400,500,600,800,1200][ri(8)];const a=p*n/100;
    qs.push(Q('B2','B','calc',`${n} को ${p}% कति हुन्छ?`,`What is ${p}% of ${n}?`,a,numDistract(a,Math.max(1,Math.round(a*0.15))),`${p}% × ${n} = (${p}/100) × ${n} = ${a}.`));}
  // profit/loss
  for(let i=0;i<14;i++){const cp=[400,500,600,800,1000,1200][ri(6)],pr=[5,10,12,15,20,25][ri(6)];const sp=cp+cp*pr/100;
    qs.push(Q('B2','B','calc',`एउटा वस्तुको क्रयमूल्य रु ${cp} छ। ${pr}% नाफा हुने गरी बेच्दा विक्रयमूल्य कति?`,`Cost price is Rs ${cp}. Selling at ${pr}% profit, find the selling price.`,sp,numDistract(sp,Math.round(cp*0.05)),`विक्रयमूल्य = क्रयमूल्य × (१ + नाफा%) = ${cp} × ${1+pr/100} = ${sp}.`));}
  // simple interest
  for(let i=0;i<12;i++){const p=[1000,2000,2500,4000,5000][ri(5)],r=[5,8,10,12][ri(4)],t=[2,3,4][ri(3)];const si=p*r*t/100;
    qs.push(Q('B2','B','calc',`रु ${p} को ${r}% वार्षिक दरले ${t} वर्षको साधारण ब्याज कति?`,`Find the simple interest on Rs ${p} at ${r}% p.a. for ${t} years.`,si,numDistract(si,Math.round(si*0.15)),`SI = PRT/100 = ${p}×${r}×${t}/100 = ${si}.`));}
  // average
  for(let i=0;i<10;i++){const base=ri(20)+10;const nums=[base,base+2,base+4,base+6,base+8];const avg=base+4;
    qs.push(Q('B2','B','calc',`${nums.join(', ')} को औसत कति हो?`,`Find the average of ${nums.join(', ')}.`,avg,numDistract(avg,1),`औसत = योगफल ÷ संख्या = ${nums.reduce((a,b)=>a+b)} ÷ 5 = ${avg}.`));}
  // ratio share
  for(let i=0;i<10;i++){const parts=[[2,3],[3,4],[1,4],[2,5],[3,5]][ri(5)],unit=[100,150,200,250][ri(4)];const total=(parts[0]+parts[1])*unit,a=parts[0]*unit;
    qs.push(Q('B2','B','calc',`रु ${total} लाई ${parts[0]}:${parts[1]} अनुपातमा बाँड्दा पहिलो भाग कति?`,`Rs ${total} is divided in ratio ${parts[0]}:${parts[1]}. Find the first share.`,a,numDistract(a,unit),`एक भाग = ${total} ÷ ${parts[0]+parts[1]} = ${unit}; पहिलो = ${parts[0]}×${unit} = ${a}.`));}
  // time & work
  for(let i=0;i<10;i++){const x=[10,12,15,18,20][ri(5)],y=[15,20,24,30][ri(4)];const t=Math.round((x*y/(x+y))*100)/100;
    qs.push(Q('B2','B','calc',`A ले ${x} दिन र B ले ${y} दिनमा काम सक्छन्। दुवैले सँगै गर्दा कति दिन लाग्छ?`,`A does a work in ${x} days and B in ${y} days. Working together, how many days?`,t,numDistract(t,1),`सँगै दर = 1/${x}+1/${y}; समय = ${x}×${y}/(${x}+${y}) = ${t} दिन।`));}
  // speed distance time
  for(let i=0;i<8;i++){const s=[40,50,60,72,80][ri(5)],t=[2,3,4,5][ri(4)];const d=s*t;
    qs.push(Q('B2','B','calc',`एउटा गाडी ${s} किमी/घण्टाको गतिमा ${t} घण्टा गुड्छ भने कति दूरी तय गर्छ?`,`A vehicle travels at ${s} km/h for ${t} hours. Find the distance.`,d,numDistract(d,s),`दूरी = गति × समय = ${s} × ${t} = ${d} किमी।`));}
  // age
  for(let i=0;i<8;i++){const cur=[24,30,36,40,48][ri(5)],ago=[4,5,6,8][ri(4)];const then=cur-ago;
    qs.push(Q('B2','B','calc',`रामको हालको उमेर ${cur} वर्ष छ भने ${ago} वर्ष अघि उनको उमेर कति थियो?`,`Ram is now ${cur} years old. What was his age ${ago} years ago?`,then,numDistract(then,1),`${cur} − ${ago} = ${then} वर्ष।`));}
  // number series (+d)
  for(let i=0;i<10;i++){const a0=ri(9)+2,d=[3,4,5,6,7][ri(5)];const s=[a0,a0+d,a0+2*d,a0+3*d];const nx=a0+4*d;
    qs.push(Q('B2','B','calc',`शृंखला पूरा गर्नुहोस्: ${s.join(', ')}, ?`,`Complete the series: ${s.join(', ')}, ?`,nx,numDistract(nx,d),`प्रत्येक पदमा ${d} थपिन्छ → अर्को = ${s[3]}+${d} = ${nx}.`));}
  // number series (×r)
  for(let i=0;i<6;i++){const a0=ri(4)+2,r=[2,3][ri(2)];const s=[a0,a0*r,a0*r*r,a0*r*r*r];const nx=a0*r*r*r*r;
    qs.push(Q('B2','B','calc',`शृंखला पूरा गर्नुहोस्: ${s.join(', ')}, ?`,`Complete the series: ${s.join(', ')}, ?`,nx,numDistract(nx,a0*r),`प्रत्येक पद ${r} गुणा हुन्छ → अर्को = ${s[3]}×${r} = ${nx}.`));}
  return qs;
}

/* ---- B1 Reasoning ---- */
const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const shift=(w,n)=>[...w].map(c=>AZ[((AZ.indexOf(c)+n)%26+26)%26]).join('');
function genB1(){
  const qs=[];
  const words=['CAT','DOG','SUN','BOOK','LAMP','FISH','TREE','STAR','MOON','RAIN','GOLD','KING','BIRD','FIRE','WIND','ROSE','LION','SNOW','RICE','MILK','DESK','HAND','BLUE','SHIP','ROAD'];
  // coding: +n shift
  for(let i=0;i<16;i++){const base=words[ri(words.length)],n=[1,2,3,4,5][ri(5)];const ex=shift('WORD'.slice(0,base.length===3?3:4),0);
    const model=words[ri(words.length)];const mc=shift(model,n),code=shift(base,n);
    qs.push(Q('B1','B','reasoning',`यदि ${model} लाई ${mc} लेखिन्छ भने ${base} लाई के लेखिन्छ?`,`If ${model} is coded as ${mc}, what is the code for ${base}?`,code,[shift(base,n+1),shift(base,n-1),shift(base,-n)],`प्रत्येक अक्षरमा +${n} सर्छ → ${base} = ${code}.`));}
  // letter series +k
  for(let i=0;i<14;i++){const k=[1,2,3,4][ri(4)],start=ri(15);const s=[0,1,2,3].map(j=>AZ[start+j*k]);const nx=AZ[start+4*k];
    qs.push(Q('B1','B','reasoning',`अक्षर शृंखला पूरा गर्नुहोस्: ${s.join(', ')}, ?`,`Complete the letter series: ${s.join(', ')}, ?`,nx,[AZ[start+4*k+1],AZ[start+4*k-1],AZ[start+3*k]],`प्रत्येक पटक +${k} अक्षर सर्छ → अर्को = ${nx}.`));}
  // number analogy
  for(let i=0;i<12;i++){const a=ri(9)+2,op=['square','double','triple','plus'][ri(4)];
    const f=x=>op==='square'?x*x:op==='double'?x*2:op==='triple'?x*3:x+7;
    const c=ri(9)+2;const opn={square:'को वर्ग',double:'को दुई गुणा',triple:'को तीन गुणा',plus:'मा ७'}[op];
    qs.push(Q('B1','B','reasoning',`${a} : ${f(a)} :: ${c} : ?`,`${a} : ${f(a)} :: ${c} : ?`,f(c),numDistract(f(c),2),`सम्बन्ध: दोस्रो संख्या पहिलाको${opn} हो → ${c} → ${f(c)}.`));}
  // odd one out (categories)
  const cats=[['Rose','Lotus','Jasmine','Mango','Marigold'],['Cow','Goat','Tiger','Sheep','Buffalo'],['Copper','Iron','Gold','Oxygen','Silver'],['Apple','Banana','Potato','Mango','Orange'],['Nepal','India','China','Paris','Bhutan'],['Circle','Square','Triangle','Cube','Rectangle'],['Sun','Moon','Star','Comet','River'],['Cricket','Football','Chess','Hockey','Volleyball']];
  const catOdd=['Mango','Tiger','Oxygen','Potato','Paris','Cube','River','Chess'];
  const catExp=['आँप फल हो, अरू फूल हुन्।','बाघ जंगली मांसाहारी हो, अरू घरपालुवा।','अक्सिजन ग्यास हो, अरू धातु।','आलु तरकारी हो, अरू फल।','पेरिस सहर हो, अरू देश।','घन त्रिआयामिक हो, अरू द्विआयामिक।','नदी पृथ्वीमा छ, अरू आकाशीय पिण्ड।','चेस मैदानी खेल होइन।'];
  for(let i=0;i<cats.length;i++){const c=cats[i];
    qs.push(Q('B1','B','reasoning',`भिन्न (odd one out) छान्नुहोस्: ${c.join(', ')}`,`Find the odd one out: ${c.join(', ')}`,catOdd[i],c.filter(x=>x!==catOdd[i]),catExp[i]));}
  // ranking front/back → total
  for(let i=0;i<12;i++){const f=ri(15)+5,b=ri(15)+5;const total=f+b-1;
    qs.push(Q('B1','B','reasoning',`एक लाइनमा रामको स्थान अगाडिबाट ${f}औं र पछाडिबाट ${b}औं छ। लाइनमा जम्मा कति जना छन्?`,`In a line, Ram is ${f}th from front and ${b}th from back. How many are in the line?`,total,numDistract(total,1),`जम्मा = अगाडि + पछाडि − १ = ${f} + ${b} − 1 = ${total}.`));}
  // direction distance
  for(let i=0;i<10;i++){const e=[30,40,60,80][ri(4)],nn=[40,30,80,60][ri(4)];const dist=Math.round(Math.sqrt(e*e+nn*nn));
    if(!Number.isInteger(Math.sqrt(e*e+nn*nn)))continue;
    qs.push(Q('B1','B','reasoning',`एक व्यक्ति पूर्वतर्फ ${e} मि हिँड्यो, त्यसपछि उत्तरतर्फ ${nn} मि। सुरुको बिन्दुबाट सीधा दूरी कति?`,`A person walks ${e} m east then ${nn} m north. Straight distance from start?`,dist,numDistract(dist,5),`√(${e}² + ${nn}²) = √${e*e+nn*nn} = ${dist} मि।`));}
  return qs;
}

/* ---- B4 Data Interpretation (computed) ---- */
function genB4(){
  const qs=[];
  const subs=['राम','श्याम','गीता','सीता','हरि'];
  for(let i=0;i<100 && qs.length<need.B4;i++){
    const vals=subs.map(()=>ri(60)+30);
    const kind=i%5;
    if(kind===0){const mx=Math.max(...vals),who=subs[vals.indexOf(mx)];
      qs.push(Q('B4','B','reasoning',`तालिका — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}। सबैभन्दा बढी अंक कसको?`,`Table — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}. Who scored the highest?`,who,subs.filter(s=>s!==who),`अधिकतम अंक ${mx} → ${who}.`));}
    else if(kind===1){const mn=Math.min(...vals),who=subs[vals.indexOf(mn)];
      qs.push(Q('B4','B','reasoning',`तालिका — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}। सबैभन्दा कम अंक कसको?`,`Table — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}. Who scored the lowest?`,who,subs.filter(s=>s!==who),`न्यूनतम अंक ${mn} → ${who}.`));}
    else if(kind===2){const sum=vals.reduce((a,b)=>a+b);
      qs.push(Q('B4','B','reasoning',`तालिका — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}। जम्मा अंक कति?`,`Table — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}. What is the total?`,sum,numDistract(sum,5),`सबै जोड्दा = ${sum}.`));}
    else if(kind===3){const sum=vals.reduce((a,b)=>a+b),avg=Math.round(sum/5*100)/100;
      qs.push(Q('B4','B','reasoning',`तालिका — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}। औसत अंक कति?`,`Table — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}. What is the average?`,avg,numDistract(avg,3),`औसत = ${sum} ÷ 5 = ${avg}.`));}
    else {const a=vals[0],b=vals[1];const diff=Math.abs(a-b);
      qs.push(Q('B4','B','reasoning',`तालिका — ${subs.map((s,j)=>s+':'+vals[j]).join(', ')}। ${subs[0]} र ${subs[1]} को अंकको फरक कति?`,`Table — difference between ${subs[0]} and ${subs[1]}'s scores?`,diff,numDistract(diff,2),`|${a} − ${b}| = ${diff}.`));}
  }
  return qs;
}

/* ---- B3 Figure/counting (computed by formula) ---- */
function genB3(){
  const qs=[];
  // squares in n×n grid = sum k^2
  for(let n=2;n<=6;n++){const c=n*(n+1)*(2*n+1)/6;
    qs.push(Q('B3','B','reasoning',`${n}×${n} को समान वर्गहरूमा विभाजित ठूलो वर्गमा जम्मा कतिवटा वर्ग (सबै आकारका) हुन्छन्?`,`A large square divided into a ${n}×${n} grid contains how many squares of all sizes?`,c,numDistract(c,n),`n×n ग्रिडमा वर्ग = 1²+2²+…+${n}² = ${c}.`));}
  // rectangles in m×n grid = C(m+1,2)*C(n+1,2)
  const C2=m=>m*(m+1)/2;
  for(let m=2;m<=5;m++)for(let n=m;n<=5;n++){const c=C2(m)*C2(n);
    qs.push(Q('B3','B','reasoning',`${m}×${n} ग्रिडमा जम्मा कतिवटा आयत (rectangle) हुन्छन्?`,`How many rectangles are there in a ${m}×${n} grid?`,c,numDistract(c,m*n),`आयत = C(${m}+1,2) × C(${n}+1,2) = ${C2(m)} × ${C2(n)} = ${c}.`));}
  // triangles in a triangle divided by n cevians from apex to base split into k parts = k small + combos = C(k+1,2)
  for(let k=2;k<=9;k++){const c=k*(k+1)/2;
    qs.push(Q('B3','B','reasoning',`एउटा त्रिभुजको आधारलाई ${k} भागमा बाँडी शिखरबाट रेखा जोड्दा जम्मा कतिवटा त्रिभुज बन्छन्?`,`A triangle's base is divided into ${k} parts with lines from the apex. How many triangles in total?`,c,numDistract(c,k),`जम्मा त्रिभुज = 1+2+…+${k} = ${c}.`));}
  // straight lines making a star / polygon diagonals
  for(let n=4;n<=12;n++){const d=n*(n-3)/2;
    qs.push(Q('B3','B','reasoning',`${n} भुजा भएको बहुभुज (polygon) मा कतिवटा विकर्ण (diagonal) हुन्छन्?`,`How many diagonals does a polygon with ${n} sides have?`,d,numDistract(d,2),`विकर्ण = n(n−3)/2 = ${n}(${n}−3)/2 = ${d}.`));}
  // handshake / lines through points
  for(let n=4;n<=15;n++){const l=n*(n-1)/2;
    qs.push(Q('B3','B','reasoning',`कुनै तीन एकैरेखामा नपर्ने ${n} बिन्दुहरूबाट जम्मा कतिवटा सीधा रेखा कोर्न सकिन्छ?`,`How many straight lines can be drawn through ${n} points, no three collinear?`,l,numDistract(l,3),`रेखा = C(${n},2) = ${n}(${n}−1)/2 = ${l}.`));}
  // triangles from n points
  for(let n=4;n<=12;n++){const t=n*(n-1)*(n-2)/6;
    qs.push(Q('B3','B','reasoning',`कुनै तीन एकैरेखामा नपर्ने ${n} बिन्दुहरूबाट कतिवटा त्रिभुज बन्छन्?`,`How many triangles can be formed from ${n} points, no three collinear?`,t,numDistract(t,4),`त्रिभुज = C(${n},3) = ${t}.`));}
  return qs;
}

/* =========================================================
   PART C — ENGLISH
   ========================================================= */
function genC2(){ // vocabulary — vetted
  const qs=[];
  const syn=[['Abundant','Plentiful',['Scarce','Empty','Rare']],['Brave','Courageous',['Timid','Weak','Fearful']],['Happy','Joyful',['Sad','Angry','Dull']],['Big','Enormous',['Tiny','Narrow','Short']],['Fast','Rapid',['Slow','Lazy','Idle']],['Clever','Intelligent',['Foolish','Dull','Silly']],['Begin','Commence',['End','Stop','Close']],['Rich','Wealthy',['Poor','Needy','Broke']],['Angry','Furious',['Calm','Happy','Gentle']],['Difficult','Arduous',['Easy','Simple','Plain']],['Honest','Truthful',['Corrupt','False','Sly']],['Beautiful','Gorgeous',['Ugly','Plain','Dull']],['Strong','Sturdy',['Weak','Frail','Feeble']],['Ancient','Antique',['Modern','New','Recent']],['Quiet','Silent',['Loud','Noisy','Vocal']],['Famous','Renowned',['Unknown','Obscure','Minor']],['Enlarge','Expand',['Shrink','Reduce','Compress']],['Praise','Applaud',['Criticize','Blame','Scold']],['Vacant','Empty',['Full','Occupied','Packed']],['Genuine','Authentic',['Fake','False','Bogus']],['Cruel','Merciless',['Kind','Gentle','Humane']],['Wise','Sagacious',['Foolish','Naive','Silly']],['Clear','Transparent',['Opaque','Murky','Vague']],['Brief','Concise',['Lengthy','Long','Wordy']]];
  const ant=[['ARTIFICIAL','Natural',['Fake','Synthetic','Man-made']],['VICTORY','Defeat',['Triumph','Success','Win']],['ANCIENT','Modern',['Old','Antique','Aged']],['EXPAND','Contract',['Enlarge','Grow','Widen']],['PRAISE','Condemn',['Applaud','Admire','Laud']],['HUMBLE','Arrogant',['Modest','Meek','Simple']],['TRANSPARENT','Opaque',['Clear','Lucid','Sheer']],['ABUNDANT','Scarce',['Plentiful','Ample','Rich']],['OPTIMIST','Pessimist',['Dreamer','Realist','Idealist']],['CONDENSE','Expand',['Compress','Shrink','Thicken']],['LIBERTY','Slavery',['Freedom','Independence','Autonomy']],['DILIGENT','Lazy',['Hardworking','Careful','Active']],['GENEROUS','Stingy',['Kind','Liberal','Giving']],['MADImportED','','']].filter(x=>x[1]),
    antClean=[['ARTIFICIAL','Natural',['Fake','Synthetic','Man-made']],['VICTORY','Defeat',['Triumph','Success','Win']],['ANCIENT','Modern',['Old','Antique','Aged']],['EXPAND','Contract',['Enlarge','Grow','Widen']],['PRAISE','Condemn',['Applaud','Admire','Laud']],['HUMBLE','Arrogant',['Modest','Meek','Simple']],['TRANSPARENT','Opaque',['Clear','Lucid','Sheer']],['ABUNDANT','Scarce',['Plentiful','Ample','Rich']],['OPTIMIST','Pessimist',['Dreamer','Realist','Idealist']],['LIBERTY','Slavery',['Freedom','Independence','Autonomy']],['DILIGENT','Lazy',['Hardworking','Careful','Active']],['GENEROUS','Stingy',['Kind','Liberal','Giving']],['BARREN','Fertile',['Empty','Arid','Bare']],['MOURN','Rejoice',['Grieve','Lament','Sorrow']],['CONCEAL','Reveal',['Hide','Cover','Mask']],['PERMANENT','Temporary',['Lasting','Stable','Fixed']],['GATHER','Scatter',['Collect','Assemble','Amass']],['SUMMIT','Base',['Peak','Top','Apex']],['REJECT','Accept',['Refuse','Deny','Decline']],['SHALLOW','Deep',['Surface','Slight','Thin']]];
  const mean=[['Indefatigable','Never tiring',['Weak','Angry','Idle']],['Benevolent','Kind and generous',['Cruel','Greedy','Rude']],['Frugal','Economical/thrifty',['Wasteful','Rich','Lavish']],['Candid','Frank and honest',['Sly','Secretive','Rude']],['Obsolete','Out of date',['Modern','Useful','New']],['Meticulous','Very careful',['Careless','Hasty','Rough']],['Gregarious','Sociable',['Shy','Rude','Solitary']],['Lucrative','Profitable',['Cheap','Useless','Costly']],['Verbose','Wordy',['Brief','Silent','Terse']],['Tenacious','Persistent',['Weak','Lazy','Fickle']],['Amiable','Friendly',['Hostile','Rude','Cold']],['Prudent','Careful/wise',['Reckless','Foolish','Rash']],['Novice','Beginner',['Expert','Master','Veteran']],['Innate','Inborn',['Learned','Acquired','Taught']],['Placid','Calm',['Angry','Rough','Wild']]];
  const idiom=[['To let the cat out of the bag','To reveal a secret',['To buy a pet','To lose something','To make noise']],['A piece of cake','Very easy',['A dessert','A hard task','A small part']],['Once in a blue moon','Very rarely',['Every day','At night','Twice a year']],['To burn the midnight oil','To work late into the night',['To waste money','To cook food','To sleep early']],['To beat around the bush','To avoid the main point',['To garden','To hit someone','To be direct']],['Break the ice','To start a conversation',['To be cold','To break glass','To end a talk']],['Under the weather','Feeling ill',['Outdoors','Very happy','In the rain']],['Cost an arm and a leg','Very expensive',['Very cheap','Painful','Free']],['Bite the bullet','To endure a hardship bravely',['To eat fast','To shoot','To give up']],['Hit the nail on the head','To be exactly right',['To do carpentry','To be wrong','To hurt']]];
  syn.forEach(([w,c,d])=>qs.push(Q('C2','C','vocab',`Choose the SYNONYM of: ${w.toUpperCase()}`,`Choose the word most similar in meaning to ${w.toUpperCase()}.`,c,d,`${w} = ${c} (समान अर्थ)।`)));
  antClean.forEach(([w,c,d])=>qs.push(Q('C2','C','vocab',`Choose the word most nearly OPPOSITE in meaning: ${w}`,`Choose the ANTONYM of ${w}.`,c,d,`${w} को विपरीत = ${c}.`)));
  mean.forEach(([w,c,d])=>qs.push(Q('C2','C','vocab',`${w} means`,`${w} means`,c,d,`${w} = ${c}.`)));
  idiom.forEach(([w,c,d])=>qs.push(Q('C2','C','vocab',`What does the idiom mean: "${w}"`,`Meaning of the idiom "${w}"?`,c,d,`"${w}" = ${c}.`)));
  return qs;
}

function genC3(){ // grammar — vetted templates
  const qs=[];
  const prep=[['She is good ___ mathematics.','at',['in','on','of']],['He has been living here ___ 2010.','since',['for','from','by']],['I will meet you ___ Monday.','on',['at','in','by']],['The cat is hiding ___ the table.','under',['on','above','in']],['He is afraid ___ dogs.','of',['from','with','for']],['She is married ___ a doctor.','to',['with','for','of']],['We arrived ___ the airport late.','at',['in','on','to']],['The book is ___ the shelf.','on',['in','at','over']],['He succeeded ___ his efforts.','in',['at','on','with']],['They are angry ___ me.','with',['on','to','for']],['Divide the cake ___ four parts.','into',['in','to','by']],['I agree ___ your opinion.','with',['to','on','for']],['She is fond ___ music.','of',['for','with','in']],['He died ___ cancer.','of',['from','by','with']],['Walk ___ the road carefully.','along',['on','in','at']]];
  const tense=[['She ___ to school every day.','goes',['go','going','gone']],['They ___ football now.','are playing',['plays','played','play']],['I ___ my homework already.','have done',['did do','am doing','do']],['He ___ here yesterday.','came',['come','comes','has come']],['Water ___ at 100°C.','boils',['boil','boiling','boiled']],['Look! The baby ___.','is crying',['cries','cried','cry']],['I ___ him since morning.','have not seen',['did not see','am not seeing','not see']],['By next year she ___ the course.','will have finished',['finishes','finished','is finishing']]];
  const tag=[['They are coming, ___?','aren\'t they',['are they','isn\'t it','do they']],['She can swim, ___?','can\'t she',['can she','does she','isn\'t she']],['You like tea, ___?','don\'t you',['do you','aren\'t you','isn\'t it']],['He has finished, ___?','hasn\'t he',['has he','doesn\'t he','isn\'t he']],['Let\'s go, ___?','shall we',['will we','do we','shan\'t we']],['She won\'t come, ___?','will she',['won\'t she','does she','is she']],['I am right, ___?','aren\'t I',['am I','amn\'t I','isn\'t it']]];
  const art=[['He is ___ honest man.','an',['a','the','no article']],['She is ___ best student in class.','the',['a','an','no article']],['I saw ___ European tourist.','a',['an','the','no article']],['___ Everest is the highest peak.','','the'].slice(0,0)];
  const artClean=[['He is ___ honest man.','an',['a','the','some']],['She is ___ best student.','the',['a','an','one']],['I saw ___ European tourist.','a',['an','the','some']],['___ sun rises in the east.','The',['A','An','Some']],['He plays ___ guitar well.','the',['a','an','some']],['I need ___ umbrella.','an',['a','the','some']]];
  const agree=[['Each of the boys ___ a bag.','has',['have','having','are']],['Neither he nor I ___ wrong.','am',['is','are','be']],['The team ___ winning.','is',['are','were','be']],['Ten miles ___ a long distance.','is',['are','were','be']],['Mathematics ___ my favourite subject.','is',['are','were','be']],['One of my friends ___ a doctor.','is',['are','were','be']]];
  const cond=[['If it rains, we ___ at home.','will stay',['stayed','would stay','stay']],['If I ___ rich, I would travel.','were',['am','was','be']],['If she had studied, she ___ passed.','would have',['will have','would','had']],['I would help you if I ___ time.','had',['have','will have','am having']]];
  const rep=[['He said, "I am tired." → He said that he ___ tired.','was',['is','has been','were']],['She said, "I will go." → She said that she ___ go.','would',['will','shall','can']],['"Do you like it?" he asked. → He asked whether I ___ it.','liked',['like','likes','am liking']]];
  const push=(arr,type,tag)=>arr.forEach(([q,c,d])=>{ if(!c)return; qs.push(Q('C3','C','grammar',q,q,c,d,`सही रूप: "${c}" (${tag}).`)); });
  push(prep,'grammar','preposition'); push(tense,'grammar','tense'); push(tag,'grammar','question tag');
  push(artClean,'grammar','article'); push(agree,'grammar','subject–verb agreement'); push(cond,'grammar','conditional'); push(rep,'grammar','reported speech');
  // sentence correction
  const corr=[['Choose the grammatically correct sentence.','He does not knows the answer.','He does not know the answer.','He do not know the answer.','He not know the answer.'],['Choose the grammatically correct sentence.','She have two brothers.','She has two brothers.','She having two brothers.','She had have two brothers.'],['Choose the grammatically correct sentence.','I am agree with you.','I agree with you.','I are agree with you.','I agreeing with you.'],['Choose the grammatically correct sentence.','He is more taller than me.','He is taller than me.','He is most taller than me.','He is tall than me.']];
  corr.forEach(([q,w1,c,w2,w3])=>qs.push(Q('C3','C','grammar',q,q,c,[w1,w2,w3],`व्याकरणसम्मत वाक्य: "${c}".`)));
  return qs;
}

function genC1(){ // comprehension — authored passages
  const qs=[]; const P={};
  function addPassage(key,title,text,items){ P[key]={title,text}; items.forEach(it=>qs.push(Q('C1','C','comprehension',it.q,it.q,it.c,it.d,it.e).__set(key))); }
  // helper to attach passage id
  Object.defineProperty(Object.prototype,'__set',{value:function(k){this.passage=k;return this;},enumerable:false,configurable:true});
  addPassage('GP1','The Value of Time',
    'Time is the most precious thing in the world. Once a moment is gone, it can never be recovered. Many people waste their time in idleness and later regret it. Those who use their time wisely achieve great success in life. A student who studies regularly, a farmer who works in season, and a worker who is punctual all understand the value of time. Time and tide wait for none.',
    [{q:'According to the passage, what is the most precious thing?',c:'Time',d:['Money','Gold','Health'],e:'पहिलो वाक्यमै "Time is the most precious thing" भनिएको छ।'},
     {q:'What happens once a moment is gone?',c:'It can never be recovered',d:['It returns next day','It can be bought','It stays forever'],e:'"Once a moment is gone, it can never be recovered."'},
     {q:'Who achieve great success according to the passage?',c:'Those who use time wisely',d:['Those who rest','The wealthy','The idle'],e:'समयको सदुपयोग गर्नेले सफलता पाउँछन्।'},
     {q:'"Time and tide wait for none" means',c:'Time does not stop for anyone',d:['The sea is dangerous','Everyone must swim','Waiting is good'],e:'यो उखानले समय कसैका लागि रोकिँदैन भन्ने जनाउँछ।'},
     {q:'The main message of the passage is to',c:'use time wisely',d:['waste time','sleep more','earn money'],e:'मूल सन्देश — समयको सदुपयोग गर।'},
     {q:'Who is given as an example of valuing time?',c:'A punctual worker',d:['A lazy king','A sleeping child','A rich man'],e:'नियमित विद्यार्थी, समयमै काम गर्ने किसान र समयनिष्ठ कामदार उदाहरण दिइएका छन्।'}]);
  addPassage('GP2','Forests and Life',
    'Forests are essential for life on earth. They give us oxygen, timber, medicine and shelter for wildlife. Trees absorb carbon dioxide and help control climate change. When forests are cut down, soil erosion increases and rivers dry up. Protecting forests is therefore protecting our own future. Everyone should plant trees and prevent deforestation.',
    [{q:'What do forests provide according to the passage?',c:'Oxygen, timber and medicine',d:['Only money','Only fruit','Petrol and coal'],e:'वनले अक्सिजन, काठ, औषधि र आश्रय दिन्छ।'},
     {q:'Trees help control climate change by',c:'absorbing carbon dioxide',d:['producing carbon dioxide','burning fuel','making rain acidic'],e:'रूखले कार्बनडाइअक्साइड सोस्छ।'},
     {q:'What increases when forests are cut down?',c:'Soil erosion',d:['Oxygen','Rainfall','Wildlife'],e:'वन फँडानी हुँदा माटोको क्षय बढ्छ।'},
     {q:'Protecting forests means protecting',c:'our own future',d:['only animals','only rivers','the past'],e:'"protecting forests is protecting our own future."'},
     {q:'What does the passage ask everyone to do?',c:'Plant trees',d:['Cut trees','Build factories','Sell timber'],e:'सबैले रूख रोप्नुपर्छ भनिएको छ।'},
     {q:'The tone of the passage is',c:'persuasive/awareness',d:['humorous','angry','sad'],e:'यो जनचेतनामूलक/प्रेरक अनुच्छेद हो।'}]);
  addPassage('GP3','Honesty',
    'Honesty is the best policy. An honest person is respected everywhere, even by enemies. Though a dishonest person may prosper for a short time, he is finally exposed and loses everyone\'s trust. Honesty brings peace of mind and lasting friendships. It is the foundation of a good character and a strong society.',
    [{q:'How is an honest person treated everywhere?',c:'With respect',d:['With hatred','With fear','With pity'],e:'इमानदार व्यक्ति सबैतिर सम्मानित हुन्छ।'},
     {q:'What finally happens to a dishonest person?',c:'He is exposed and loses trust',d:['He becomes rich forever','He is rewarded','He gains friends'],e:'बेइमान अन्ततः उदाङ्गो हुन्छ र विश्वास गुमाउँछ।'},
     {q:'Honesty brings',c:'peace of mind',d:['sudden wealth','fame','power'],e:'इमानदारीले मनको शान्ति दिन्छ।'},
     {q:'Honesty is described as the foundation of',c:'good character',d:['wealth','fame','fear'],e:'यो असल चरित्रको जग हो।'},
     {q:'"Honesty is the best policy" is a/an',c:'proverb',d:['question','order','warning'],e:'यो एउटा उखान (proverb) हो।'}]);
  addPassage('GP4','Exercise and Health',
    'Regular exercise keeps the body fit and the mind alert. It improves blood circulation, strengthens muscles and reduces the risk of many diseases. People who exercise daily sleep better and feel more energetic. A short walk, cycling or simple stretching can make a big difference. Health is wealth, and exercise is the cheapest medicine.',
    [{q:'Regular exercise keeps the body fit and the mind',c:'alert',d:['tired','lazy','dull'],e:'"keeps the body fit and the mind alert."'},
     {q:'Exercise reduces the risk of',c:'many diseases',d:['friendship','sleep','energy'],e:'व्यायामले धेरै रोगको जोखिम घटाउँछ।'},
     {q:'People who exercise daily',c:'sleep better',d:['sleep less','feel weak','eat less'],e:'दैनिक व्यायाम गर्नेले राम्रो निद्रा पाउँछन्।'},
     {q:'According to the passage, the cheapest medicine is',c:'exercise',d:['sleep','food','water'],e:'"exercise is the cheapest medicine."'},
     {q:'"Health is wealth" means',c:'good health is very valuable',d:['money buys health','wealth is unhealthy','health costs money'],e:'स्वास्थ्य नै सम्पत्ति हो।'}]);
  delete Object.prototype.__set;
  return {qs,passages:P};
}

/* =========================================================
   PART A — GENERAL AWARENESS (verified reference tables)
   ========================================================= */
function twoForm(unit,part,label,pairsQ){ return pairsQ; }

function genA5(){ // International — org HQ, founded, capitals, currencies
  const qs=[];
  const hq=[['UN / संयुक्त राष्ट्रसंघ','New York'],['UNESCO','Paris'],['WHO','Geneva'],['ILO','Geneva'],['WTO','Geneva'],['IMF','Washington D.C.'],['World Bank','Washington D.C.'],['UNICEF','New York'],['IAEA','Vienna'],['OPEC','Vienna'],['UNEP','Nairobi'],['FAO','Rome'],['Interpol','Lyon'],['NATO','Brussels'],['EU','Brussels'],['ASEAN','Jakarta'],['SAARC','Kathmandu'],['BIMSTEC','Dhaka'],['ICC (Cricket)','Dubai'],['Red Cross (ICRC)','Geneva'],['Amnesty International','London'],['CITES','Geneva'],['ADB','Manila'],['AIIB','Beijing'],['Commonwealth','London'],['ICJ','The Hague'],['WWF','Gland (Switzerland)'],['UNHCR','Geneva'],['WMO','Geneva'],['UNIDO','Vienna']];
  const cities=uniq(hq.map(h=>h[1]));
  hq.forEach(([o,c])=>{ qs.push(Q('A5','A','single',`${o} को मुख्यालय कहाँ छ?`,`Where is the headquarters of ${o}?`,c,cities.filter(x=>x!==c),`${o} को मुख्यालय ${c} मा छ।`)); });
  const founded=[['UN','1945'],['UNESCO','1945'],['WHO','1948'],['SAARC','1985'],['BIMSTEC','1997'],['ASEAN','1967'],['EU','1993'],['NATO','1949'],['ILO','1919'],['IMF','1945'],['WTO','1995'],['OPEC','1960'],['AIIB','2016'],['NAM','1961'],['ADB','1966'],['ICC','1909'],['Interpol','1923'],['Red Cross','1863']];
  const yrs=uniq(founded.map(f=>f[1]));
  founded.forEach(([o,y])=>{ qs.push(Q('A5','A','single',`${o} को स्थापना कुन सालमा भएको हो?`,`In which year was ${o} founded?`,y,yrs.filter(x=>x!==y),`${o} सन् ${y} मा स्थापना भयो।`)); });
  const caps=[['Japan','Tokyo'],['China','Beijing'],['France','Paris'],['USA','Washington D.C.'],['UK','London'],['Russia','Moscow'],['Germany','Berlin'],['Italy','Rome'],['Australia','Canberra'],['Canada','Ottawa'],['Brazil','Brasília'],['Egypt','Cairo'],['Turkey','Ankara'],['Kenya','Nairobi'],['Bhutan','Thimphu'],['Bangladesh','Dhaka'],['Pakistan','Islamabad'],['Sri Lanka','Sri Jayawardenepura Kotte'],['Myanmar','Naypyidaw'],['Thailand','Bangkok'],['Indonesia','Jakarta'],['Iran','Tehran'],['Iraq','Baghdad'],['Spain','Madrid'],['Nigeria','Abuja']];
  const capCities=uniq(caps.map(c=>c[1]));
  caps.forEach(([co,ca])=>{ qs.push(Q('A5','A','single',`${co} को राजधानी कुन हो?`,`What is the capital of ${co}?`,ca,capCities.filter(x=>x!==ca),`${co} को राजधानी ${ca} हो।`)); });
  const cur=[['Japan','Yen'],['China','Yuan (Renminbi)'],['UK','Pound Sterling'],['USA','Dollar'],['Russia','Rouble'],['Thailand','Baht'],['Bangladesh','Taka'],['Bhutan','Ngultrum'],['Myanmar','Kyat'],['Indonesia','Rupiah'],['Saudi Arabia','Riyal'],['Iran','Rial'],['Turkey','Lira'],['South Africa','Rand'],['Italy','Euro']];
  const curs=uniq(cur.map(c=>c[1]));
  cur.forEach(([co,c])=>{ qs.push(Q('A5','A','single',`${co} को मुद्रा कुन हो?`,`What is the currency of ${co}?`,c,curs.filter(x=>x!==c),`${co} को मुद्रा ${c} हो।`)); });
  return qs;
}

function genA6(){ // Science — inventors, discoveries, symbols, vitamins, instruments
  const qs=[];
  const inv=[['Telephone','Alexander Graham Bell'],['Radio','Guglielmo Marconi'],['Television','John Logie Baird'],['Radar','Watson-Watt'],['Bulb (incandescent)','Thomas Edison'],['Telescope','Galileo Galilei'],['Aeroplane','Wright Brothers'],['Dynamite','Alfred Nobel'],['Steam Engine','James Watt'],['Printing Press','Johannes Gutenberg'],['Penicillin','Alexander Fleming'],['Gravity (law)','Isaac Newton'],['Electric Battery','Alessandro Volta'],['X-ray','W.C. Roentgen'],['Computer (analytical engine)','Charles Babbage'],['Telegraph','Samuel Morse'],['Dynamo','Michael Faraday'],['Barometer','Evangelista Torricelli'],['Thermometer','Galileo Galilei'],['Vaccination','Edward Jenner']];
  const people=uniq(inv.map(i=>i[1]));
  inv.forEach(([it,p])=>{ qs.push(Q('A6','A','single',`${it} को आविष्कार/खोज कसले गरे?`,`Who invented/discovered the ${it}?`,p,people.filter(x=>x!==p),`${it} — ${p}.`)); });
  const sym=[['Gold','Au'],['Silver','Ag'],['Iron','Fe'],['Sodium','Na'],['Potassium','K'],['Copper','Cu'],['Oxygen','O'],['Hydrogen','H'],['Carbon','C'],['Nitrogen','N'],['Lead','Pb'],['Mercury','Hg'],['Calcium','Ca'],['Zinc','Zn'],['Helium','He'],['Chlorine','Cl'],['Sulphur','S'],['Tin','Sn']];
  const syms=uniq(sym.map(s=>s[1]));
  sym.forEach(([e,s])=>{ qs.push(Q('A6','A','single',`${e} तत्वको रासायनिक चिन्ह के हो?`,`What is the chemical symbol of ${e}?`,s,syms.filter(x=>x!==s),`${e} = ${s}.`)); });
  const vit=[['Vitamin A','Night blindness / रतन्धो'],['Vitamin B1','Beriberi'],['Vitamin C','Scurvy / स्कर्भी'],['Vitamin D','Rickets / रिकेट्स'],['Vitamin K','Poor blood clotting'],['Iron','Anaemia / रक्तअल्पता'],['Iodine','Goitre / गलगाँड']];
  const defs=uniq(vit.map(v=>v[1]));
  vit.forEach(([v,d])=>{ qs.push(Q('A6','A','single',`${v} को अभावले कुन रोग हुन्छ?`,`Deficiency of ${v} causes which disease?`,d,defs.filter(x=>x!==d),`${v} अभाव → ${d}.`)); });
  const instr=[['Barometer','वायुमण्डलीय चाप','atmospheric pressure'],['Thermometer','तापक्रम','temperature'],['Seismograph','भूकम्प','earthquakes'],['Hygrometer','आर्द्रता','humidity'],['Ammeter','विद्युत धारा','electric current'],['Voltmeter','भोल्टेज','voltage'],['Speedometer','गति','speed'],['Anemometer','हावाको गति','wind speed'],['Lactometer','दूधको शुद्धता','purity of milk'],['Sphygmomanometer','रक्तचाप','blood pressure']];
  const uses=uniq(instr.map(i=>i[1]));
  instr.forEach(([i,u])=>{ qs.push(Q('A6','A','single',`${i} ले के नाप्छ?`,`What does a ${i} measure?`,u,uses.filter(x=>x!==u),`${i} ले ${u} नाप्छ।`)); });
  const body=[['रगतको रातो कणिका कहाँ बन्छ?','हाडको मज्जा (Bone marrow)',['कलेजो','मुटु','फोक्सो'],'RBC हाडको रातो मज्जामा बन्छ।'],['मानव शरीरको सबैभन्दा ठूलो अंग कुन हो?','छाला (Skin)',['कलेजो','मुटु','मस्तिष्क'],'छाला सबैभन्दा ठूलो अंग हो।'],['मानव शरीरमा कति हड्डी हुन्छन् (वयस्क)?','206',['201','210','198'],'वयस्क मानिसमा २०६ हाड हुन्छन्।'],['इन्सुलिन कुन ग्रन्थिले उत्पादन गर्छ?','अग्न्याशय (Pancreas)',['कलेजो','थाइराइड','मुटु'],'इन्सुलिन प्यान्क्रियाजले बनाउँछ।'],['रगत शुद्धीकरण कुन अंगले गर्छ?','मृगौला (Kidney)',['मुटु','फोक्सो','कलेजो'],'मृगौलाले रगत छान्छ।']];
  body.forEach(([q,c,d,e])=>qs.push(Q('A6','A','single',q,q,c,d,e)));
  return qs;
}

function genA1(){ // Nepal geography/history/culture
  const qs=[];
  const park=[['चितवन राष्ट्रिय निकुञ्ज','चितवन'],['बर्दिया राष्ट्रिय निकुञ्ज','बर्दिया'],['सगरमाथा राष्ट्रिय निकुञ्ज','सोलुखुम्बु'],['लाङटाङ राष्ट्रिय निकुञ्ज','रसुवा'],['रारा राष्ट्रिय निकुञ्ज','मुगु'],['शे-फोक्सुण्डो राष्ट्रिय निकुञ्ज','डोल्पा'],['खप्तड राष्ट्रिय निकुञ्ज','बझाङ/डोटी'],['मकालु बरुण राष्ट्रिय निकुञ्ज','संखुवासभा'],['शिवपुरी नागार्जुन राष्ट्रिय निकुञ्ज','काठमाडौँ'],['बाँके राष्ट्रिय निकुञ्ज','बाँके'],['पर्सा राष्ट्रिय निकुञ्ज','पर्सा'],['शुक्लाफाँटा राष्ट्रिय निकुञ्ज','कञ्चनपुर']];
  const dists=uniq(park.map(p=>p[1]));
  park.forEach(([p,d])=>qs.push(Q('A1','A','single',`${p} कुन जिल्लामा पर्दछ?`,`In which district is ${p}?`,d,dists.filter(x=>x!==d),`${p} — ${d} जिल्ला।`)));
  const peak=[['सगरमाथा (Everest)','8848.86'],['कञ्चनजङ्घा','8586'],['ल्होत्से','8516'],['मकालु','8485'],['चो ओयु','8188'],['धौलागिरि','8167'],['मनास्लु','8163'],['अन्नपूर्ण','8091']];
  const heights=uniq(peak.map(p=>p[1]));
  peak.forEach(([p,h])=>qs.push(Q('A1','A','single',`${p} को उचाइ कति मिटर हो?`,`What is the height (m) of ${p}?`,h,heights.filter(x=>x!==h),`${p} — ${h} मिटर।`)));
  const facts=[['नेपालको कुल क्षेत्रफल कति वर्ग किमी हो?','1,47,516',['1,41,181','1,50,000','1,45,000'],'नेपालको क्षेत्रफल १,४७,५१६ वर्ग किमी हो।'],['नेपालमा कति प्रदेश छन्?','7',['5','6','8'],'नेपालमा ७ प्रदेश छन्।'],['नेपालमा कति जिल्ला छन् (वर्तमान)?','77',['75','76','78'],'हाल ७७ जिल्ला छन्।'],['नेपालको सबैभन्दा लामो नदी कुन हो?','कर्णाली',['कोशी','गण्डकी','बागमती'],'कर्णाली नेपालको सबैभन्दा लामो नदी हो।'],['नेपालको सबैभन्दा ठूलो ताल कुन हो?','रारा',['फेवा','से-फोक्सुण्डो','तिलिचो'],'रारा ताल क्षेत्रफलमा सबैभन्दा ठूलो हो।'],['नेपालको सबैभन्दा गहिरो ताल कुन हो?','से-फोक्सुण्डो',['रारा','फेवा','बेगनास'],'से-फोक्सुण्डो सबैभन्दा गहिरो ताल हो।'],['विश्वको सबैभन्दा अग्लो ताल भनी चिनिने तिलिचो कुन जिल्लामा छ?','मनाङ',['मुस्ताङ','कास्की','गोरखा'],'तिलिचो ताल मनाङमा छ।'],['नेपालको जनसंख्या (जनगणना २०७८) करिब कति हो?','2 करोड 91 लाख',['2 करोड 65 लाख','3 करोड','2 करोड 49 लाख'],'जनगणना २०७८ अनुसार करिब २.९१ करोड।'],['काठमाडौँ उपत्यकामा कति दरबार स्क्वायर छन् (विश्व सम्पदा)?','3',['2','4','5'],'काठमाडौँ, भक्तपुर, पाटन — ३ दरबार स्क्वायर।'],['पशुपतिनाथ मन्दिर कुन शैलीमा बनेको छ?','प्यागोडा',['शिखर','स्तुप','गुम्बज'],'पशुपतिनाथ प्यागोडा शैलीमा छ।'],['लुम्बिनी कुन जिल्लामा पर्दछ?','रुपन्देही',['कपिलवस्तु','नवलपरासी','दाङ'],'लुम्बिनी रुपन्देहीमा छ।'],['गौतम बुद्धको जन्म कहाँ भएको हो?','लुम्बिनी',['कुशीनगर','सारनाथ','बोधगया'],'बुद्धको जन्म लुम्बिनीमा भयो।'],['नेपालको राष्ट्रिय फूल कुन हो?','लालीगुराँस',['सयपत्री','कमल','गुलाफ'],'लालीगुराँस राष्ट्रिय फूल हो।'],['नेपालको राष्ट्रिय पक्षी कुन हो?','डाँफे',['मयूर','कालिज','सारस'],'डाँफे (Impeyan pheasant) राष्ट्रिय पक्षी हो।'],['नेपालको राष्ट्रिय जनावर कुन हो?','गाई',['गैँडा','बाघ','हात्ती'],'गाई नेपालको राष्ट्रिय जनावर हो।'],['पृथ्वीनारायण शाहले काठमाडौँ कहिले विजय गरे?','1825 वि.सं.',['1826 वि.सं.','1820 वि.सं.','1831 वि.सं.'],'वि.सं. १८२५ मा काठमाडौँ विजय भयो।'],['सुगौली सन्धि कुन सालमा भयो?','1872 वि.सं.',['1862 वि.सं.','1901 वि.सं.','1815 वि.सं.'],'सुगौली सन्धि वि.सं. १८७२ (सन् १८१६) मा भयो।'],['नेपाल एकीकरणको सुरुवात कुन राजाले गरे?','पृथ्वीनारायण शाह',['राम शाह','द्रव्य शाह','रणबहादुर शाह'],'पृथ्वीनारायण शाहले एकीकरण सुरु गरे।'],['जनकपुर कुन प्रदेशमा पर्दछ?','मधेश प्रदेश',['बागमती','कोशी','लुम्बिनी'],'जनकपुर मधेश प्रदेशमा छ।'],['नेपालको राष्ट्रिय खेल कुन हो?','भलिबल',['दण्डिबियो','कबड्डी','फुटबल'],'सन् २०१७ देखि भलिबल राष्ट्रिय खेल हो।']];
  facts.forEach(([q,c,d,e])=>qs.push(Q('A1','A','single',q,q,c,d,e)));
  return qs;
}

function genA2(){ // Environment
  const qs=[];
  const est=[['चितवन राष्ट्रिय निकुञ्ज','2030 (1973)'],['सगरमाथा राष्ट्रिय निकुञ्ज','2033 (1976)'],['अन्नपूर्ण संरक्षण क्षेत्र','2042 (1986)'],['रारा राष्ट्रिय निकुञ्ज','2032 (1976)'],['बर्दिया राष्ट्रिय निकुञ्ज','2045 (1988)'],['शे-फोक्सुण्डो राष्ट्रिय निकुञ्ज','2041 (1984)']];
  const yrs=uniq(est.map(e=>e[1]));
  est.forEach(([p,y])=>qs.push(Q('A2','A','single',`${p} कहिले स्थापना भयो?`,`When was ${p} established?`,y,yrs.filter(x=>x!==y),`${p} — ${y} मा स्थापना।`)));
  const treaty=[['CITES','लोपोन्मुख वन्यजन्तु व्यापार नियन्त्रण'],['रामसार महासन्धि','सिमसार संरक्षण'],['क्योटो प्रोटोकल','हरितगृह ग्यास उत्सर्जन घटाउने'],['मोन्ट्रियल प्रोटोकल','ओजन तह संरक्षण'],['प्यारिस सम्झौता','जलवायु परिवर्तन (तापक्रम १.५°C)'],['CBD (जैविक विविधता महासन्धि)','जैविक विविधता संरक्षण'],['UNFCCC','जलवायु परिवर्तन आधार सन्धि'],['बासेल महासन्धि','खतरनाक फोहोर आवतजावत नियन्त्रण']];
  const purp=uniq(treaty.map(t=>t[1]));
  treaty.forEach(([t,p])=>qs.push(Q('A2','A','single',`${t} को मुख्य उद्देश्य के हो?`,`What is the main objective of ${t}?`,p,purp.filter(x=>x!==p),`${t} — ${p}.`)));
  const ramsar=[['कोशी टप्पु','सुनसरी/सप्तरी'],['घोडाघोडी ताल','कैलाली'],['बीसहजारी ताल','चितवन'],['जगदिशपुर ताल','कपिलवस्तु'],['गोसाइँकुण्ड','रसुवा'],['फोक्सुण्डो','डोल्पा'],['माईपोखरी','इलाम'],['रारा','मुगु']];
  const rd=uniq(ramsar.map(r=>r[1]));
  ramsar.forEach(([r,d])=>qs.push(Q('A2','A','single',`रामसार सूचीमा रहेको ${r} कुन जिल्लामा छ?`,`In which district is the Ramsar site ${r}?`,d,rd.filter(x=>x!==d),`${r} — ${d}.`)));
  const eco=[['क्योटो प्रोटोकल कुन सालमा भयो?','1997',['2005','1992','2015'],'क्योटो प्रोटोकल सन् १९९७ मा भयो (लागू २००५)।'],['प्यारिस सम्झौता कुन सालमा भयो?','2015',['2016','2012','2009'],'प्यारिस सम्झौता सन् २०१५ मा भयो।'],['ओजन तह क्षय गर्ने मुख्य ग्यास कुन हो?','CFC',['CO₂','O₂','N₂'],'क्लोरोफ्लोरोकार्बन (CFC) ले ओजन क्षय गर्छ।'],['अम्लीय वर्षाको मुख्य कारक कुन हुन्?','SO₂ र NOₓ',['O₂ र N₂','CO र H₂','He र Ne'],'सल्फर र नाइट्रोजन अक्साइडले अम्लीय वर्षा गराउँछ।'],['विश्व वातावरण दिवस कहिले मनाइन्छ?','जुन ५',['अप्रिल २२','मार्च २१','जुलाई ११'],'विश्व वातावरण दिवस जुन ५ मा मनाइन्छ।'],['विश्व पृथ्वी दिवस कहिले मनाइन्छ?','अप्रिल २२',['जुन ५','मार्च २२','सेप्टेम्बर १६'],'पृथ्वी दिवस अप्रिल २२ मा।'],['हरितगृह प्रभावको मुख्य ग्यास कुन हो?','कार्बनडाइअक्साइड',['नाइट्रोजन','अक्सिजन','हाइड्रोजन'],'CO₂ मुख्य हरितगृह ग्यास हो।'],['नेपालको पहिलो रामसार क्षेत्र कुन हो?','कोशी टप्पु',['घोडाघोडी','गोसाइँकुण्ड','रारा'],'कोशी टप्पु (१९८७) नेपालको पहिलो रामसार क्षेत्र हो।'],['Agenda 21 कुन सम्मेलनबाट पारित भयो?','रियो पृथ्वी सम्मेलन 1992',['क्योटो 1997','स्टकहोम 1972','प्यारिस 2015'],'एजेण्डा २१ सन् १९९२ को रियो सम्मेलनबाट।'],['ओजन तह संरक्षण दिवस कहिले हो?','सेप्टेम्बर १६',['जुन ५','अप्रिल २२','मार्च २१'],'ओजन दिवस सेप्टेम्बर १६ मा।']];
  eco.forEach(([q,c,d,e])=>qs.push(Q('A2','A','single',q,q,c,d,e)));
  return qs;
}

function genA4(){ // Constitution & governance
  const qs=[];
  const art=[['16-46','मौलिक हक'],['58','अवशिष्ट अधिकार'],['66','राष्ट्रपतिको काम, कर्तव्य र अधिकार'],['76','मन्त्रिपरिषद् गठन'],['84','प्रतिनिधि सभाको गठन'],['86','राष्ट्रिय सभाको गठन'],['100','सरकारविरुद्ध अविश्वासको प्रस्ताव'],['126','अदालतद्वारा न्याय सम्पादन'],['239','अख्तियार दुरुपयोग अनुसन्धान आयोग'],['241','महालेखा परीक्षक'],['245','निर्वाचन आयोग'],['248','लोक सेवा आयोग'],['232','संघ, प्रदेश र स्थानीय तहबीचको सम्बन्ध']];
  art.forEach(([a,s])=>{ const others=art.filter(x=>x[1]!==s).map(x=>x[1]); qs.push(Q('A4','A','single',`नेपालको संविधानको धारा ${a} कुन विषयसँग सम्बन्धित छ?`,`Article ${a} of the Constitution of Nepal relates to what?`,s,others,`धारा ${a} — ${s}.`)); });
  const body=[['निर्वाचन आयोग','भाग २४'],['अख्तियार दुरुपयोग अनुसन्धान आयोग','भाग २१'],['महालेखा परीक्षक','भाग २२'],['लोक सेवा आयोग','भाग २३'],['राष्ट्रिय मानव अधिकार आयोग','भाग २५'],['महान्यायाधिवक्ता','भाग २६']];
  const parts=uniq(body.map(b=>b[1]));
  body.forEach(([b,p])=>qs.push(Q('A4','A','single',`${b} संविधानको कुन भागमा व्यवस्था छ?`,`In which Part of the Constitution is the ${b} provided?`,p,parts.filter(x=>x!==p),`${b} — ${p}.`)));
  const gk=[['नेपालको संविधान २०७२ कहिले जारी भयो?','2072 असोज 3',['2072 भदौ 3','2071 असोज 3','2072 कात्तिक 3'],'संविधान २०७२ असोज ३ गते जारी भयो।'],['नेपालको संविधानमा कति भाग छन्?','35',['30','37','33'],'संविधान २०७२ मा ३५ भाग छन्।'],['नेपालको संविधानमा कति धारा छन्?','308',['295','315','300'],'संविधानमा ३०८ धारा छन्।'],['नेपालको संविधानमा कति अनुसूची छन्?','9',['7','8','10'],'९ अनुसूची छन्।'],['नेपालको लोक सेवा आयोगको स्थापना कहिले भयो?','2008 असार 1',['2007 असार 1','2009 असार 1','2015 असार 1'],'लोक सेवा आयोग वि.सं. २००८ असार १ मा स्थापना।'],['संघीय संसद्का कति सदन छन्?','2',['1','3','4'],'प्रतिनिधि सभा र राष्ट्रिय सभा — २ सदन।'],['प्रतिनिधि सभामा कति सदस्य छन्?','275',['265','240','295'],'प्रतिनिधि सभामा २७५ सदस्य।'],['राष्ट्रिय सभामा कति सदस्य छन्?','59',['60','55','50'],'राष्ट्रिय सभामा ५९ सदस्य।'],['नागरिक बडापत्रको अवधारणा ल्याउने पहिलो देश कुन हो?','बेलायत',['अमेरिका','जापान','जर्मनी'],'बेलायतले १९९१ मा नागरिक बडापत्र सुरु गर्‍यो।'],['सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन कुन सालको हो?','2064',['2063','2065','2062'],'सुशासन ऐन २०६४ को हो।'],['निजामती सेवा ऐन कुन सालको हो?','2049',['2050','2048','2053'],'निजामती सेवा ऐन २०४९ को हो।'],['मुलुकी देवानी संहिता कहिलेदेखि लागू भयो?','2075 भदौ 1',['2074 भदौ 1','2076 भदौ 1','2075 असार 1'],'मुलुकी संहिता २०७५ भदौ १ देखि लागू।'],['संवैधानिक परिषद्को अध्यक्ष को हुन्छ?','प्रधानमन्त्री',['प्रधान न्यायाधीश','राष्ट्रपति','सभामुख'],'संवैधानिक परिषद्को अध्यक्ष प्रधानमन्त्री हुन्छन्।'],['अख्तियार दुरुपयोग अनुसन्धान आयोगको प्रमुख को हुन्छ?','प्रमुख आयुक्त',['महान्यायाधिवक्ता','सचिव','प्रधान न्यायाधीश'],'अख्तियारमा प्रमुख आयुक्त हुन्छन्।']];
  gk.forEach(([q,c,d,e])=>qs.push(Q('A4','A','single',q,q,c,d,e)));
  return qs;
}

function genA3(){ // Economy & planning — concept-heavy (safe)
  const qs=[];
  const def=[['Prime cost भनेको के हो?','प्रत्यक्ष सामग्री + प्रत्यक्ष श्रम + प्रत्यक्ष खर्च',['कुल स्थिर लागत','अप्रत्यक्ष लागत','बिक्री मूल्य'],'Prime cost = प्रत्यक्ष सामग्री+श्रम+खर्च।'],['GDP को पूरा रूप के हो?','Gross Domestic Product',['Gross Domestic Price','General Domestic Product','Global Domestic Product'],'GDP = Gross Domestic Product.'],['GNP को पूरा रूप के हो?','Gross National Product',['Gross Net Product','General National Product','Gross National Price'],'GNP = Gross National Product.'],['मुद्रास्फीति (Inflation) भनेको के हो?','मूल्यस्तरमा निरन्तर वृद्धि',['मूल्यमा गिरावट','उत्पादनमा वृद्धि','रोजगारीमा वृद्धि'],'सामान्य मूल्यस्तर बढ्नुलाई मुद्रास्फीति भनिन्छ।'],['Deflation भनेको के हो?','मूल्यस्तरमा निरन्तर गिरावट',['मूल्य वृद्धि','आय वृद्धि','कर वृद्धि'],'मूल्यस्तर घट्नुलाई अपस्फीति भनिन्छ।'],['Opportunity cost भनेको के हो?','त्यागिएको उत्तम विकल्पको मूल्य',['कुल लागत','स्थिर लागत','डुबेको लागत'],'अवसर लागत = त्यागिएको उत्तम विकल्प।'],['Sunk cost भनेको के हो?','पहिले नै खर्च भइसकेको फिर्ता नहुने लागत',['भविष्यको लागत','परिवर्तनशील लागत','सीमान्त लागत'],'डुबेको लागत फिर्ता हुँदैन।'],['नेपालको केन्द्रीय बैंक कुन हो?','नेपाल राष्ट्र बैंक',['नेपाल बैंक','राष्ट्रिय वाणिज्य बैंक','कृषि विकास बैंक'],'नेपाल राष्ट्र बैंक (२०१३) केन्द्रीय बैंक हो।'],['नेपाल राष्ट्र बैंकको स्थापना कहिले भयो?','2013 वैशाख 14',['2014','2012','2015'],'नेपाल राष्ट्र बैंक वि.सं. २०१३ मा स्थापना।'],['नेपालको पहिलो बैंक कुन हो?','नेपाल बैंक लिमिटेड',['राष्ट्रिय वाणिज्य बैंक','नेपाल राष्ट्र बैंक','कृषि विकास बैंक'],'नेपाल बैंक लिमिटेड (१९९४ वि.सं.) पहिलो बैंक हो।'],['नेपालको पहिलो आवधिक योजना कहिले सुरु भयो?','2013 वि.सं.',['2015 वि.सं.','2010 वि.सं.','2020 वि.सं.'],'पहिलो योजना वि.सं. २०१३ मा सुरु भयो।'],['हाल नेपालमा कति औं आवधिक योजना लागू छ?','16औं',['15औं','14औं','17औं'],'हाल १६औं योजना लागू छ।'],['विप्रेषण (Remittance) भनेको के हो?','विदेशबाट पठाइएको रकम',['विदेशी लगानी','सरकारी अनुदान','ऋण'],'वैदेशिक रोजगारीबाट पठाइएको रकम विप्रेषण हो।'],['मानव विकास सूचकांक (HDI) कसले प्रकाशन गर्छ?','UNDP',['WHO','World Bank','IMF'],'HDI संयुक्त राष्ट्रसंघीय विकास कार्यक्रम (UNDP) ले प्रकाशन गर्छ।'],['मूल्य अभिवृद्धि कर (VAT) नेपालमा कहिले लागू भयो?','2054 (1997)',['2050','2058','2060'],'VAT वि.सं. २०५४ (सन् १९९७) मा लागू भयो।'],['नेपालको आर्थिक वर्ष कहिले सुरु हुन्छ?','साउन 1',['वैशाख 1','जनवरी 1','मंसिर 1'],'नेपालको आर्थिक वर्ष साउन १ देखि सुरु हुन्छ।'],['बजेट कुन मन्त्रालयले प्रस्तुत गर्छ?','अर्थ मन्त्रालय',['गृह मन्त्रालय','योजना आयोग','प्रधानमन्त्री कार्यालय'],'बजेट अर्थ मन्त्रालयले प्रस्तुत गर्छ।'],['CEDA कुन देशको सहयोगमा स्थापना भयो?','अमेरिका',['भारत','चीन','रुस'],'CEDA अमेरिकी सहयोगमा (१९६९) स्थापना।'],['SDR (Special Drawing Rights) कसले जारी गर्छ?','IMF',['World Bank','ADB','WTO'],'SDR अन्तर्राष्ट्रिय मुद्रा कोष (IMF) ले जारी गर्छ।'],['Fiscal policy कसले बनाउँछ?','सरकार (अर्थ मन्त्रालय)',['केन्द्रीय बैंक','योजना आयोग','संसद्'],'वित्त नीति सरकारले बनाउँछ; मौद्रिक नीति केन्द्रीय बैंकले।']];
  def.forEach(([q,c,d,e])=>qs.push(Q('A3','A','concept',q,q,c,d,e)));
  const donor=[['JICA','जापान'],['USAID','अमेरिका'],['DFID/FCDO','बेलायत'],['GIZ','जर्मनी'],['KOICA','दक्षिण कोरिया'],['Helvetas','स्वीट्जरल्याण्ड'],['SDC','स्वीट्जरल्याण्ड'],['ADB','फिलिपिन्स (मुख्यालय)'],['NORAD','नर्वे'],['DANIDA','डेनमार्क']];
  const co=uniq(donor.map(d=>d[1]));
  donor.forEach(([a,c])=>qs.push(Q('A3','A','single',`${a} कुन देशको सहयोग नियोग हो?`,`${a} is the aid agency of which country?`,c,co.filter(x=>x!==c),`${a} — ${c}.`)));
  return qs;
}

function genA7(){ // stable GK — books, sports, firsts, personalities
  const qs=[];
  const book=[['Animal Farm','George Orwell'],['1984','George Orwell'],['The Old Man and the Sea','Ernest Hemingway'],['War and Peace','Leo Tolstoy'],['Discovery of India','Jawaharlal Nehru'],['Wings of Fire','A.P.J. Abdul Kalam'],['Long Walk to Freedom','Nelson Mandela'],['My Experiments with Truth','Mahatma Gandhi'],['The Origin of Species','Charles Darwin'],['Das Kapital','Karl Marx'],['Muna Madan','Laxmi Prasad Devkota'],['Wealth of Nations','Adam Smith'],['Romeo and Juliet','William Shakespeare'],['Gitanjali','Rabindranath Tagore'],['A Brief History of Time','Stephen Hawking']];
  const authors=uniq(book.map(b=>b[1]));
  book.forEach(([b,a])=>qs.push(Q('A7','A','single',`'${b}' पुस्तकका लेखक को हुन्?`,`Who is the author of '${b}'?`,a,authors.filter(x=>x!==a),`'${b}' — ${a}.`)));
  const sport=[['क्रिकेट खेलमा एक टोलीमा कति खेलाडी हुन्छन्?','11',['9','10','12'],'क्रिकेटमा ११ खेलाडी।'],['फुटबलमा एक टोलीमा कति खेलाडी हुन्छन्?','11',['10','9','12'],'फुटबलमा ११ खेलाडी।'],['भलिबलमा एक टोलीमा कति खेलाडी हुन्छन्?','6',['5','7','11'],'भलिबलमा ६ खेलाडी।'],['कबड्डी कुन देशको राष्ट्रिय खेल हो?','बंगलादेश',['नेपाल','भारत','पाकिस्तान'],'कबड्डी बंगलादेशको राष्ट्रिय खेल हो।'],['ओलम्पिक कति वर्षमा एक पटक हुन्छ?','4',['2','3','5'],'ओलम्पिक हरेक ४ वर्षमा।'],['साँढेजुधाइ कुन देशको राष्ट्रिय खेल हो?','स्पेन',['इटाली','मेक्सिको','पोर्चुगल'],'Bullfighting स्पेनको राष्ट्रिय खेल हो।'],['बास्केटबलमा एक टोलीमा कति खेलाडी हुन्छन्?','5',['6','7','11'],'बास्केटबलमा ५ खेलाडी।'],['आधुनिक ओलम्पिक पहिलोपटक कहाँ भयो?','एथेन्स (1896)',['पेरिस','लन्डन','रोम'],'पहिलो आधुनिक ओलम्पिक एथेन्समा (१८९६)।']];
  sport.forEach(([q,c,d,e])=>qs.push(Q('A7','A','single',q,q,c,d,e)));
  const firsts=[['एभरेस्ट आरोहण गर्ने पहिलो व्यक्ति को हुन्?','तेन्जिङ नोर्गे र एडमन्ड हिलारी',['जुनको ताबेई','अपा शेर्पा','बाबुछिरी शेर्पा'],'सन् १९५३ मा तेन्जिङ र हिलारीले एभरेस्ट चढे।'],['एभरेस्ट चढ्ने पहिलो महिला को हुन्?','जुनको ताबेई',['पासाङ ल्हामु','जङ्गमु','बाछेन्द्री पाल'],'जापानकी जुनको ताबेई (१९७५) पहिलो महिला।'],['एभरेस्ट चढ्ने पहिलो नेपाली महिला को हुन्?','पासाङ ल्हामु शेर्पा',['जुनको ताबेई','माया गुरुङ','शैलजा आचार्य'],'पासाङ ल्हामु शेर्पा (१९९३)।'],['नेपालको पहिलो राष्ट्रपति को हुन्?','डा. रामवरण यादव',['विद्यादेवी भण्डारी','रामचन्द्र पौडेल','सुशील कोइराला'],'डा. रामवरण यादव पहिलो राष्ट्रपति।'],['नेपालको पहिलो महिला राष्ट्रपति को हुन्?','विद्यादेवी भण्डारी',['सहाना प्रधान','शैलजा आचार्य','ओनसरी घर्ती'],'विद्यादेवी भण्डारी पहिलो महिला राष्ट्रपति।'],['चन्द्रमामा पहिलोपटक पाइला टेक्ने मानिस को हुन्?','नील आर्मस्ट्रङ',['बज एल्ड्रिन','युरी गागारिन','माइकल कोलिन्स'],'नील आर्मस्ट्रङ (१९६९) चन्द्रमामा पहिलो।'],['अन्तरिक्षमा पुग्ने पहिलो मानिस को हुन्?','युरी गागारिन',['नील आर्मस्ट्रङ','एलेन शेपर्ड','राकेश शर्मा'],'युरी गागारिन (१९६१) पहिलो अन्तरिक्ष यात्री।'],['नेपालको पहिलो प्रधानमन्त्री को हुन्?','भीमसेन थापा',['जङ्गबहादुर राणा','रणोद्दीप सिंह','मातृका प्रसाद कोइराला'],'भीमसेन थापालाई पहिलो प्रधानमन्त्री मानिन्छ।']];
  firsts.forEach(([q,c,d,e])=>qs.push(Q('A7','A','single',q,q,c,d,e)));
  const nobel=[['नोबेल पुरस्कार कति क्षेत्रमा दिइन्छ?','6',['5','7','4'],'भौतिकी, रसायन, चिकित्सा, साहित्य, शान्ति र अर्थशास्त्र — ६ क्षेत्र।'],['नोबेल पुरस्कार कसको नाममा राखिएको हो?','अल्फ्रेड नोबेल',['आइन्स्टाइन','डार्विन','न्युटन'],'डाइनामाइटका आविष्कारक अल्फ्रेड नोबेलको नाममा।'],['शान्तिको नोबेल पुरस्कार कहाँबाट दिइन्छ?','अस्लो (नर्वे)',['स्टकहोम','जेनेभा','न्युयोर्क'],'शान्ति नोबेल नर्वेको अस्लोबाट दिइन्छ।'],['ग्रीन बेल्ट मुभमेन्टका संस्थापक को हुन्?','वंगारी माथाई',['पल वाट्सन','जोन म्युर','गेलर्ड नेल्सन'],'वंगारी माथाई (केन्या)।']];
  nobel.forEach(([q,c,d,e])=>qs.push(Q('A7','A','single',q,q,c,d,e)));
  return qs;
}

/* =========================================================
   ASSEMBLE
   ========================================================= */
const c1=genC1();
const gens={A1:genA1(),A2:genA2(),A3:genA3(),A4:genA4(),A5:genA5(),A6:genA6(),A7:genA7(),
  B1:genB1(),B2:genB2(),B3:genB3(),B4:genB4(),C1:c1.qs,C2:genC2(),C3:genC3()};

// merge passages
const passages={...seed.passages,...c1.passages};

// take needed per unit
const report={};
Object.keys(need).forEach(u=>{ const arr=shuffle(gens[u]); report[u]={have:gens[u].length, added:take(u,arr)}; });

const final={ meta:seed.meta, passages, questions:[...seed.questions, ...out] };
fs.writeFileSync(path.join(DIR,'questions.json'), JSON.stringify(final,null,1));

// summary
const byUnit={}; final.questions.forEach(q=>byUnit[q.unit]=(byUnit[q.unit]||0)+1);
console.log('Unit | generated-pool | added | TOTAL');
Object.keys(need).sort().forEach(u=>console.log(` ${u}  |  pool ${String(report[u].have).padStart(4)} | +${String(report[u].added).padStart(3)} | ${byUnit[u]}`));
console.log('\nGRAND TOTAL questions:', final.questions.length);

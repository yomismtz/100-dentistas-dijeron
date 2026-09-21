'use strict';

const QUICK_STREAK_VERSION='3.0.15';
const QUICK_STREAK_COUNT=10;
const QUICK_STREAK_SECONDS=15;
const QUICK_STREAK_HISTORY='dentistas-quick-streak-history-v1';
let qs={active:false,index:0,questions:[],score:0,max:0,results:[],timer:null,remaining:15,specialty:'general',difficulty:'mix',answered:false};

function qsHist(){try{return JSON.parse(localStorage.getItem(QUICK_STREAK_HISTORY)||'{}')||{};}catch(_){return{};}}
function qsSaveHist(h){try{localStorage.setItem(QUICK_STREAK_HISTORY,JSON.stringify(h));}catch(_){}}
function qsScope(){return qs.specialty+'|'+qs.difficulty;}
function qsPool(){
  let p=typeof spBank==='function'?spBank(qs.specialty):[...questionPool];
  if(qs.difficulty!=='mix'&&typeof spDifficultyOf==='function')p=p.filter(q=>spDifficultyOf(q)===qs.difficulty);
  return p.filter(q=>!q.disabled);
}
function qsSample(pool,n){
  const h=qsHist(),recent=Array.isArray(h[qsScope()])?h[qsScope()]:[],last=new Set(recent.slice(0,10)),seen=new Set(recent.slice(0,30));
  const src=[...pool],out=[];
  while(out.length<n&&src.length){
    const w=src.map(q=>({q,w:last.has(q.q)?.2:seen.has(q.q)?.55:1}));
    let x=Math.random()*w.reduce((s,a)=>s+a.w,0),pick=w[w.length-1];
    for(const a of w){x-=a.w;if(x<=0){pick=a;break;}}
    out.push(pick.q);src.splice(src.indexOf(pick.q),1);
  }
  return out;
}
function qsRemember(){
  const h=qsHist(),k=qsScope(),prev=Array.isArray(h[k])?h[k]:[];
  h[k]=[...qs.questions.map(q=>q.q),...prev].slice(0,240);qsSaveHist(h);
}
function qsBuild(){
  if($('#quickStreak'))return;
  const el=document.createElement('main');el.id='quickStreak';el.className='screen quickStreak hidden';
  el.innerHTML=`<header class="qsTopbar"><button id="qsBack" class="iconBtn">←</button><div><b>⚡ RACHA RÁPIDA DE CONOCIMIENTO</b><span id="qsSpecName"></span></div><button id="qsSound" class="iconBtn">🔊</button></header>
  <section class="qsBody"><div class="qsStats"><div><small>PREGUNTA</small><b id="qsNum">1 / 10</b></div><div><small>PUNTOS</small><b id="qsScore">0</b></div><div><small>TIEMPO</small><b id="qsTime">15</b></div></div><div class="qsTrack"><i id="qsTrack"></i></div><article class="qsCard"><div class="qsBolt">⚡</div><h1 id="qsQuestion"></h1><div id="qsControls" class="qsControls"><input id="qsInput" autocomplete="off" placeholder="Escribe una respuesta…"><button id="qsMic">🎙️</button><button id="qsSubmit">RESPONDER</button></div><div id="qsFeedback" class="qsFeedback hidden"></div><div id="qsAnswers" class="qsAnswers hidden"></div><button id="qsNext" class="setupStart hidden">SIGUIENTE ⚡</button></article></section>`;
  document.body.appendChild(el);
  $('#qsBack').onclick=qsExit;
  $('#qsMic').onclick=()=>{if(!qs.answered&&typeof v2Speak==='function')v2Speak('quick');};
  $('#qsSubmit').onclick=()=>qsResolveInput(false);
  $('#qsInput').addEventListener('keydown',e=>{if(e.key==='Enter')qsResolveInput(false);});
  $('#qsNext').onclick=qsNext;
  $('#qsSound').onclick=()=>{if(typeof adSetMasterMuted==='function')adSetMasterMuted(!window.v3MasterMuted);qsSoundIcon();};
}
function qsSoundIcon(){const b=$('#qsSound');if(b)b.textContent=window.v3MasterMuted?'🔇':'🔊';}
function qsSetup(){
  qsBuild();
  const defs=typeof SPECIALTY_DEFS!=='undefined'?SPECIALTY_DEFS:[];
  openModal(`<h2>⚡ RACHA RÁPIDA DE CONOCIMIENTO</h2><p><b>10 preguntas</b>, una respuesta por pregunta y <b>15 segundos</b>.</p><p>La respuesta suma exactamente los puntos que tenga en el tablero. Después verás todas las respuestas.</p><label class="settingRow">Especialidad<select id="qsSp">${defs.map(d=>`<option value="${v2Escape(d.id)}">${v2Escape(d.name)}</option>`).join('')}</select></label><label class="settingRow">Dificultad<select id="qsDf"><option value="mix">Mezcla</option><option value="basic">Básica</option><option value="intermediate">Media</option><option value="advanced">Extra difícil</option></select></label><button id="qsGo" class="setupStart">INICIAR RACHA ⚡</button>`);
  $('#qsSp').value=typeof specialtySelected==='string'?specialtySelected:'general';
  $('#qsDf').value=typeof specialtyDifficulty==='string'?specialtyDifficulty:'mix';
  $('#qsGo').onclick=()=>{qs.specialty=$('#qsSp').value;qs.difficulty=$('#qsDf').value;const p=qsPool();if(p.length<10){alert('Este filtro necesita al menos 10 preguntas.');return;}closeModal(false);qsStart();};
}
function qsStart(){
  const p=qsPool();qs.active=true;qs.index=0;qs.score=0;qs.results=[];qs.answered=false;qs.questions=qsSample(p,10);qs.max=qs.questions.reduce((s,q)=>s+Math.max(...q.a.map(a=>Number(a[1])||0)),0);qsRemember();
  $('#home').classList.add('hidden');$('#game').classList.add('hidden');$('#quickStreak').classList.remove('hidden');
  const d=typeof SPECIALTY_DEFS!=='undefined'?SPECIALTY_DEFS.find(x=>x.id===qs.specialty):null;$('#qsSpecName').textContent=d?.name||'Odontología';qsSoundIcon();if(typeof tvSfx==='function')tvSfx('startGame');qsShow();
}
function qsStopTimer(){if(qs.timer){clearInterval(qs.timer);qs.timer=null;}}
function qsClock(){qsStopTimer();qs.remaining=15;qsUpdateClock();qs.timer=setInterval(()=>{qs.remaining--;qsUpdateClock();if(qs.remaining>0&&qs.remaining<=5&&typeof tvSfx==='function')tvSfx('tick');if(qs.remaining<=0){qsStopTimer();qsResolve('',true);}},1000);}
function qsUpdateClock(){const t=$('#qsTime');if(t){t.textContent=qs.remaining;t.classList.toggle('urgent',qs.remaining<=5);}}
function qsShow(){
  const q=qs.questions[qs.index];if(!q)return qsFinish();qs.answered=false;
  $('#qsNum').textContent=(qs.index+1)+' / 10';$('#qsScore').textContent=qs.score;$('#qsTrack').style.width=(qs.index*10)+'%';$('#qsQuestion').textContent=q.q;
  $('#qsInput').value='';$('#qsInput').disabled=false;$('#qsMic').disabled=false;$('#qsSubmit').disabled=false;$('#qsFeedback').className='qsFeedback hidden';$('#qsAnswers').className='qsAnswers hidden';$('#qsNext').classList.add('hidden');
  const go=()=>{qsClock();setTimeout(()=>$('#qsInput')?.focus(),40);};
  if(typeof narratorReadAnnouncement==='function'&&!window.v3MasterMuted)narratorReadAnnouncement(q.q,go,'⚡ RACHA RÁPIDA…');else go();
}
function qsResolveInput(timeout){const text=($('#qsInput')?.value||'').trim();if(!timeout&&!text)return;qsResolve(text,timeout);}
function qsResolve(text,timeout){
  if(!qs.active||qs.answered)return;qs.answered=true;qsStopTimer();const q=qs.questions[qs.index],m=text&&typeof v2Match==='function'?v2Match(text,q):null,ok=!!(m&&m.score>=.78),pts=ok?(Number(m.points)||0):0;qs.score+=pts;
  const top=[...q.a].sort((a,b)=>(Number(b[1])||0)-(Number(a[1])||0))[0];qs.results.push({ok,pts,label:ok?m.label:top[0]});
  $('#qsScore').textContent=qs.score;$('#qsInput').disabled=true;$('#qsMic').disabled=true;$('#qsSubmit').disabled=true;
  const fb=$('#qsFeedback');fb.className='qsFeedback '+(ok?'good':'bad');fb.innerHTML=ok?`<b>${pts===Number(top[1])?'🌟 RESPUESTA #1':'✅ CORRECTA'}</b><span>${v2Escape(v2ShortLabel(m.label))}</span><strong>+${pts}</strong>`:`<b>${timeout?'⏱️ TIEMPO':'✖ SIN PUNTOS'}</b><span>${text?v2Escape(text):'Sin respuesta'}</span><strong>+0</strong>`;
  if(typeof tvSfx==='function')tvSfx(ok?(pts===Number(top[1])?'topAnswer':'correct'):'buzz');
  const a=$('#qsAnswers');a.className='qsAnswers';a.innerHTML='<b>RESPUESTAS DEL TABLERO</b>'+q.a.map((x,i)=>`<div class="${ok&&i===m.idx?'mine':''}"><span>${i+1}. ${v2Escape(v2ShortLabel(x[0]))}</span><strong>${x[1]} pts</strong></div>`).join('');
  const n=$('#qsNext');n.classList.remove('hidden');n.textContent=qs.index===9?'VER RESULTADO 🏆':'SIGUIENTE ⚡';
  const spoken=ok?((pts===Number(top[1])?'¡Respuesta número uno! ':'Respuesta correcta. ')+v2ShortLabel(m.label)+', '+pts+' puntos.'):(timeout?'Se acabó el tiempo. ':'Esa respuesta no suma puntos. ')+'La respuesta de mayor valor era '+v2ShortLabel(top[0])+', '+top[1]+' puntos.';
  if(typeof narratorReadAnnouncement==='function'&&!window.v3MasterMuted)narratorReadAnnouncement(spoken,()=>{},'⚡ RESULTADO…');
}
function qsNext(){if(!qs.answered)return;qs.index++;qs.index>=10?qsFinish():qsShow();}
function qsFinish(){
  qsStopTimer();qs.active=false;const ok=qs.results.filter(x=>x.ok).length,pct=Math.round(qs.score/Math.max(1,qs.max)*100),title=pct>=85?'🏆 RACHA BRILLANTE':pct>=65?'⚡ GRAN RACHA':pct>=45?'🧠 BUENA RACHA':'📚 SIGUE ENTRENANDO';
  $('#quickStreak .qsBody').innerHTML=`<article class="qsFinal"><div>⚡🦷</div><h1>${title}</h1><strong>${qs.score}</strong><p>puntos de <b>${qs.max}</b> posibles</p><section><span><b>${ok}/10</b> acertadas</span><span><b>${pct}%</b> del máximo</span></section><div class="qsMini">${qs.results.map((r,i)=>`<div><span>${i+1}. ${v2Escape(v2ShortLabel(r.label))}</span><b>${r.pts} pts</b></div>`).join('')}</div><button id="qsAgain" class="setupStart">OTRA RACHA ⚡</button><button id="qsHome" class="secondaryWide">VOLVER A PORTADA</button></article>`;
  if(typeof tvSfx==='function')tvSfx(pct>=65?'fanfare':'review');if(typeof narratorReadAnnouncement==='function'&&!window.v3MasterMuted)narratorReadAnnouncement('Racha terminada. Obtuviste '+qs.score+' puntos de '+qs.max+' posibles, con '+ok+' respuestas acertadas de diez.',()=>{},'🏆 RESULTADO…');
  $('#qsAgain').onclick=()=>{qsResetUI();qsSetup();};$('#qsHome').onclick=()=>{qsResetUI();qsExit();};
}
function qsResetUI(){document.querySelector('#quickStreak')?.remove();qsBuild();}
function qsExit(){qsStopTimer();qs.active=false;$('#quickStreak')?.classList.add('hidden');$('#game').classList.add('hidden');$('#home').classList.remove('hidden');if(typeof adAmbientStop==='function')adAmbientStop();}
const qsSpeech=window.onSpeechResult;
window.onSpeechResult=function(text){if(qs.active&&v2VoiceTarget==='quick'&&$('#qsInput')){$('#qsInput').value=String(text||'');qsResolveInput(false);return;}if(typeof qsSpeech==='function')return qsSpeech(text);};
(function(){const h=$('.homeActions');if(h&&!$('#quickStreakBtn')){const b=document.createElement('button');b.id='quickStreakBtn';b.className='quickStreakBtn';b.innerHTML='⚡ RACHA RÁPIDA DE CONOCIMIENTO';b.onclick=qsSetup;h.insertBefore(b,$('#help'));}})();
